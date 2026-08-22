import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { EncryptStorage } from "encrypt-storage";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import globalConfig from "@/config/globalConfig";
import AuthenApi from "@/app/api/AuthApi";
import GlobalUtil from "@/utils/GlobalUtil";
import LoginSlice from "../../../../../utils/store/slices/loginSlice";
import { AppDispatch } from "@/utils/store/store";
import { clearCookiesAndLocalStorage, decodeBase64JsonK, toastNotiError } from "@/utils/generalFormatter";
import { getCookie, setCookie } from "@/utils/cookie";
import { encryptData } from "@/utils/encryptionData";
import { postServiceNoAuth } from "@/utils/postService";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import PopupTandC from "../component/t_and_c_popup";
import axios from "axios";

const LOGIN_PAGE_URL = ''
const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function B2CLoginComp(props: any) {
    const router = useRouter();
    const [tac, setTac] = useState<any>();
    const [popuptc, setpopuptc] = useState<boolean>(false);
    const [resLogin, setResLogin] = useState<any>();
    const ranRef = useRef(false);

    const { accounts, instance, inProgress }: any = useMsal();
    const { tenant, apps } = props;

    const isAuthenticated = useIsAuthenticated();
    const dispatchPage: AppDispatch = useDispatch();
    let inStoreReduserLogin: any = useSelector((state: any) => {
        return state.login;
    });
    const encryptStorage = new EncryptStorage("secret-key", {
        prefix: globalConfig.GLOBALCONFIGKEY.PREFIX,
    });

    const toastNotiInfo = (msg: any) => {
        toast.info(msg, {
            position: 'bottom-right',
            autoClose: 3000,
        });
    }

    const handleLoginB2C = async () => {

        try {
            encryptStorage.setItem(
                "loginType",
                globalConfig.UTILITIES.LOGIN_TYPE_B2C
            );
            encryptStorage.setItem(
                "tenant",
                JSON.stringify({ ...tenant, selectApps: apps })
            );
            instance
                // .loginRedirect(apps.loginRequest)
                .loginRedirect({ ...apps.loginRequest, prompt: 'login' })
                .then((response: any) => {
                })
                .catch((error: any) => {
                });
        } catch (error) {
        }

        localStorage.setItem("cxv2ao10xumw84vi0", encryptData(1))
        window.dispatchEvent(new Event("storage"));
        // ใช้สำหรับ setisloading == true

        // จากการ meeting กับคุณทาคุ วันที่ 22 dec 2025 เวลา 1500 - 1600
        // สามารถใช้งาน api เส้น create account B2C ได้และนำไป login portal ptt b2c ได้แล้ว 
        // ทางทีมจะนำ response ที่ได้จากการ login มาดำเนินการใน process ถัดไป
    };

    const getAccessTokenValidateLogin = () => {
        try {
            instance
                .acquireTokenSilent({
                    ...props.apps.tokenRequest,
                    account: accounts[0],
                })
                .then(async (response: any) => {
                    const hash = window.location.hash.substring(1); // Remove the leading '#' from the hash
                    const params = new URLSearchParams(hash);
                    const idToken: any = params.get("id_token");
                    const jwtObj = idToken ? GlobalUtil.parseJwt(idToken) : "";

                    if (jwtObj.acr !== "b2c_1a_passwordchange") {
                        // if (!response.idTokenClaims.isForgotPassword) {
                        const Authorization = `Bearer ${response.accessToken}`;
                        const callBackAuth: any = JSON.parse(
                            GlobalUtil.decodeUFT8(Authorization.split(".")[1])
                        );

                        if (
                            callBackAuth.CAChallengeIsBlock === true ||
                            callBackAuth.CAChallengeIsMfa === false
                        ) {
                            instance.logoutRedirect({
                                postLogoutRedirectUri: `${LOGIN_PAGE_URL}`,
                            });
                        } else {
                            authLogin();
                        }
                    } else {
                        await clearCookiesAndLocalStorage();
                        AuthenApi.Logout();
                        instance.logoutRedirect({
                            postLogoutRedirectUri: `${LOGIN_PAGE_URL}`,
                        });
                        await instance.getTokenCache().clear(); // msal-browser
                    }
                });
        } catch (error) {
        }
    };

    const authLogin = () => {
        try {
            if (accounts[0].localAccountId) {
                let login: any = inStoreReduserLogin;
                if (!login.accountLogin) {
                    let payload = {
                        ...login,
                        accountLogin: accounts[0].environment,
                    };
                    dispatchPage(LoginSlice.actions.updateLogin(payload));
                    encryptStorage.setItem("login", true);
                    encryptStorage.setItem("userName", accounts[0].username);
                }
            }
        } catch (error) {
        }
    };

    const acceptTerm = async (data?: any) => {

        try {
            const res_tandc_accept = await axios.post(`${API_URL}/master/account-manage/account-local-tandc`, {}, { headers: { Authorization: `Bearer ${resLogin?.token}` } })
            // setIsAcceptTc(true)
        } catch (error) {
            throw error;
        }

        setpopuptc(false);
        let last_page = await getCookie("redirectAfterLogin")

        toastNotiInfo("Verified. Redirecting to main menu...");

        if (last_page && last_page !== "/en/reset-password") {
            router.replace(`${last_page}`);
        } else {
            router.replace("/en/authorization");
        }
    }

    const loadUser = async () => {
        try {
            const B2C_NAME = process.env.NEXT_PUBLIC_B2C_NAME;
            const B2C_DOMAIN = `${B2C_NAME}.onmicrosoft.com`;
            const B2C_URL = `https://${B2C_DOMAIN}`;
            const B2C_SCOPE = process.env.NEXT_PUBLIC_SSO_ENV === "PRD" ? "common.read" : "cms.read";
            const B2C_SCOPE2 = process.env.NEXT_PUBLIC_SSO_ENV === "PRD" ? "cms-web-api" : "web-api";

            const res = await instance.acquireTokenSilent({
                account: accounts[0],
                scopes: [`${B2C_URL}/${B2C_SCOPE2}/${B2C_SCOPE}`],
            });

            const accessToken = res.accessToken ?? "";
            const claims: any = res.idTokenClaims ?? {};

            const profile = extractB2CProfile(claims, accounts[0]);

            // อัปเดต Redux/Local
            dispatchPage(
                LoginSlice.actions.updateLogin({
                    ...inStoreReduserLogin,
                    accountLogin: profile.username,
                    userProfile: profile,
                })
            );
            encryptStorage.setItem("login", true);
            encryptStorage.setItem("userName", profile.username);
            encryptStorage.setItem("userProfile", profile);

            // ****** ยิงเส้นนี้ เพื่อเช็คข้อมูลหลังบ้านและ redirect ******
            const data_for_login = {
                "access_token": accessToken,
                "email": profile.email,
            }
            try {
                toastNotiInfo("Verifying your access permissions...");
                const res_sso = await postServiceNoAuth('/master/account-manage/accountSSO-external', data_for_login);
                if (res_sso?.status >= 400) {
                    toastNotiError(res_sso?.error || res_sso?.response?.data?.error);
                    await clearCookiesAndLocalStorage();
                    AuthenApi.Logout();
                    await instance.getTokenCache().clear(); // msal-browser

                } else { // login redirect
                    setResLogin(res_sso);

                    setCookie("v4r2d9z5m3h0c1p0x7l", res_sso?.token, 1);
                    // localStorage.setItem("dev_mode_token", res_sso?.token)
                    localStorage.setItem("v4r2d9z5m3h0c1p0x7l", encryptData(res_sso?.token));
                    localStorage.setItem("x9f3w1m8q2y0u5d7v1z", encryptData(res_sso?.account));
                    localStorage.setItem("p5n3b7j2k9s1a6wq8t0", encryptData(res_sso?.tac));
                    // activeAccount(res_sso?.account?.email);

                    // Broadcast login event to other tabs
                    window.dispatchEvent(new Event('storage'));

                    let last_page = await getCookie("redirectAfterLogin");

                    // ==== ใช้ replace แทน push เพื่อไม่ให้ปุ่ม Back พาย้อนกลับไปหน้า login ====
                    // case t and c หมดอายุ หรือไม่มี
                    if (res_sso?.tac == null) { // อันนี้คือไม่ได้ set t and c ไว้ใน dam หรือหมดอายุแล้ว จะผ่านเข้าไปเลย
                        toastNotiInfo("Verified. Redirecting to main menu...");
                        localStorage.setItem("cxv2ao10xumw84vi0", encryptData(2))
                        window.dispatchEvent(new Event('storage'));

                        if (last_page && last_page !== "/en/reset-password") {
                            router.replace(`${last_page}`);
                        } else {
                            router.replace("/en/authorization");
                        }
                    } else if (res_sso?.tac?.url == res_sso?.account?.t_a_c_url) { // อย่าให้มีครั้งที่ 3 ตรงนี้เช็คว่า t&c ที่ accept ไปเท่ากับของใหม่หรือป่าว ถ้าเท่าก็ผ่านเข้าระบบไปเลย
                        toastNotiInfo("Verified. Redirecting to main menu...");
                        localStorage.setItem("cxv2ao10xumw84vi0", encryptData(2))
                        window.dispatchEvent(new Event('storage'));

                        if (last_page && last_page !== "/en/reset-password") {
                            router.replace(`${last_page}`);
                        } else {
                            router.replace("/en/authorization");
                        }
                    } else {
                        // please accept term
                        setTac(res_sso?.tac);
                        setpopuptc(true);
                        localStorage.setItem("cxv2ao10xumw84vi0", encryptData(2))
                        window.dispatchEvent(new Event('storage'));

                    }
                }
            } catch (error) {
                localStorage.setItem("cxv2ao10xumw84vi0", encryptData(2))
                window.dispatchEvent(new Event('storage'));
                // toastNotiError("Authentication failed. Please try again.");
            }

        } catch (e) {
            console.warn("loadUser error:", e);
            localStorage.setItem("cxv2ao10xumw84vi0", encryptData(2))
            window.dispatchEvent(new Event('storage'));
            // ถ้า silent fail ให้ลอง interactive ใหม่
            // toastNotiError?.("Authentication failed. Please try again.");
        }
    };

    const extractB2CProfile = (claims: any, account: any) => {
        // บาง tenant จะใส่ emails เป็น array, บางอันใช้ email เดี่ยว, บางอันไม่มี -> fallback
        const emails: string[] = claims?.emails
            ? claims.emails
            : claims?.email
                ? [claims.email]
                : [];

        const givenName = claims?.given_name ?? claims?.givenName ?? "";
        const familyName = claims?.family_name ?? claims?.surname ?? "";
        const displayName =
            claims?.name ??
            [givenName, familyName].filter(Boolean).join(" ") ??
            (account as any)?.name ??
            account?.username;

        // ถ้าขาด first/last ให้ลองแยกจาก name
        let first_name = givenName;
        let last_name = familyName;
        if (!first_name && !last_name && displayName) {
            const parts = String(displayName).trim().split(/\s+/);
            first_name = parts[0] || "";
            last_name = parts.slice(1).join(" ") || "";
        }

        const emailFinal =
            emails[0] ||
            claims?.preferred_username ||
            account?.username ||
            "";

        return {
            username: account?.username ?? emailFinal,
            email: emailFinal,
            first_name,
            last_name,
            name: displayName,
            user_id: claims?.oid ?? claims?.sub ?? null,  // B2C บางเคสไม่มี oid ใช้ sub แทน
            client_id: claims?.aud ?? null,
            tid: claims?.tid ?? null,
            roles: claims?.roles ?? [],
            groups: claims?.groups ?? [],
        };
    };


    useEffect(() => {
        if (tenant?.b2c !== "Y") {
            console.log("[B2C] skip because tenant is not B2C", tenant);
            return;
        }
        const ready = isAuthenticated && inProgress === "none" && accounts.length > 0;

        if (!ready || ranRef.current) {
            localStorage.setItem("cxv2ao10xumw84vi0", encryptData(2))
            window.dispatchEvent(new Event("storage"));
            return
        };

        ranRef.current = true; // กันยิงซ้ำรอบถัดไป
        (async () => {
            try {
                await getAccessTokenValidateLogin(); // หรือจะเรียก loadUser() ก่อน แล้วค่อย validate ก็ได้
                await loadUser();
            } catch (e) {
                ranRef.current = false; // ถ้า fail จะยอมให้ลองใหม่
            }
        })();
    }, [isAuthenticated, inProgress, accounts.length]);


    // TEST
    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const result = await instance.handleRedirectPromise();

                // ✅ ถ้ามี result แปลว่ากลับจาก B2C มาจริง
                if (result?.account && !cancelled) {
                    instance.setActiveAccount(result.account);
                }
            } catch (err) {
                // console.error("handleRedirectPromise error:", err);
            }
        })();

        return () => { cancelled = true; };
    }, [instance]);

    return (
        <>
            <div>
                <button
                    id="login_ad_btn"
                    data-testid={`btn-login-${apps.client_id}`}
                    className="w-full h-[50px] bg-[#00ADEF] text-white rounded-lg tracking-wide"
                    onClick={() => handleLoginB2C()}
                >
                    {"LOG IN FOR EXTERNAL"}
                </button>
            </div>


            <PopupTandC
                width={1100}
                open={popuptc}
                tac={tac}
                onClose={async () => {
                    await clearCookiesAndLocalStorage();
                    AuthenApi.Logout();
                    await instance.getTokenCache().clear(); // msal-browser
                    setpopuptc(false);
                }}
                onSubmit={() => acceptTerm('test')}
            />
        </>
    );
}