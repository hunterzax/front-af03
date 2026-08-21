"use client";
import { useEffect, useRef, useState } from "react";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { useDispatch, useSelector } from "react-redux";
import { loginRequestAAD } from "../../../../../../authConfigAAD";
import { EncryptStorage } from "encrypt-storage";
import globalConfig from "@/config/globalConfig";
import { AppDispatch } from "@/utils/store/store";
import LoginSlice from "../../../../../utils/store/slices/loginSlice";
import AuthenApi from "@/app/api/AuthApi";
import { clearCookiesAndLocalStorage, toastNotiError } from "@/utils/generalFormatter";
import { toast } from "react-toastify";
import { postServiceNoAuth } from "@/utils/postService";
import { getCookie, setCookie } from "@/utils/cookie";
import { encryptData } from "@/utils/encryptionData";
import { useRouter } from "next/navigation";
import PopupTandC from "../component/t_and_c_popup";
import axios from "axios";

const encryptStorage = new EncryptStorage("secret-key", {
    prefix: globalConfig.GLOBALCONFIGKEY.PREFIX,
});

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function AADLoginComp(props: any) {
    const router = useRouter();
    const [tac, setTac] = useState<any>();
    const [popuptc, setpopuptc] = useState<boolean>(false);
    const [resLogin, setResLogin] = useState<any>();
    const ranRef = useRef(false);

    const { tenant, apps } = props;
    const dispatchPage: AppDispatch = useDispatch();
    let inStoreReduserLogin: any = useSelector((state: any) => {
        return state.login;
    });
    const { accounts, instance, inProgress }: any = useMsal();
    const isAuthenticated = useIsAuthenticated();
    const handleLoginAAD = async () => {
        try {
            encryptStorage.setItem(
                "loginType",
                globalConfig.UTILITIES.LOGIN_TYPE_AAD
            );
            encryptStorage.setItem(
                "tenant",
                JSON.stringify({ ...tenant, selectApps: apps })
            );
            await instance.loginRedirect(loginRequestAAD).catch((error: any) => {
            });
        } catch (error) {
        }

        localStorage.setItem("cxv2ao10xumw84vi0", encryptData(1))
        window.dispatchEvent(new Event("storage"));
        // ใช้สำหรับ setisloading == true
    };

    useEffect(() => {
        if (isAuthenticated && inProgress === "none" && accounts[0]) {
            authLogin();
        }
    }, [isAuthenticated, inProgress]);

    const authLogin = () => {
        try {
            if (accounts[0].localAccountId) {
                let login: any = inStoreReduserLogin;
                if (!login.accountLogin) {
                    let payload = {
                        ...login,
                        accountLogin: accounts[0].username,
                    };
                    dispatchPage(LoginSlice.actions.updateLogin(payload));

                    encryptStorage.setItem("login", true);
                    encryptStorage.setItem("userName", accounts[0].username);
                }
            }
        } catch (error) {
        }
    };

    const toastNotiInfo = (msg: any) => {
        toast.info(msg, {
            position: 'bottom-right',
            autoClose: 3000,
        });
    }

    const acceptTerm = async (data?: any) => {

        try {
            const res_tandc_accept = await axios.post(`${API_URL}/master/account-manage/account-local-tandc`, {}, { headers: { Authorization: `Bearer ${resLogin?.token}` } })
            // setIsAcceptTc(true)
        } catch (error) {
            throw error;
        }

        setpopuptc(false);

        let last_page = await getCookie("redirectAfterLogin")
        if (last_page && last_page !== "/en/reset-password") {
            router.replace(`${last_page}`);
        } else {
            router.replace("/en/authorization");
        }
    }

    const loadUser = async () => {
        try {
            const res = await instance.acquireTokenSilent({
                account: accounts[0],
                scopes: ["User.Read"],
            });

            const accessToken = res.accessToken;
            const claims: any = res.idTokenClaims ?? {};

            const profile = {
                username: accounts[0]?.username,
                name: claims?.name ?? (accounts[0] as any)?.name ?? accounts[0]?.username,
                oid: claims?.oid,
                user_id: claims?.oid,
                tid: claims?.tid,
                client_id: claims?.aud,
                preferred_username: claims?.preferred_username,
                roles: claims?.roles ?? [],
                groups: claims?.groups ?? [],
            };

            // อัปเดต Redux
            dispatchPage(LoginSlice.actions.updateLogin({
                ...inStoreReduserLogin,
                accountLogin: profile.username,
                userProfile: profile,
            }));

            encryptStorage.setItem("login", true);
            encryptStorage.setItem("userName", profile.username);
            encryptStorage.setItem("userProfile", profile); // เก็บได้ถ้าต้องใช้ต่อ

            // ไม่ควรเก็บ accessToken/idToken ลง localStorage เพื่อความปลอดภัยจาก XSS
            // ให้ปล่อยให้ MSAL จัดการใน cache ของมันเอง

            const data_for_login = {
                access_token: accessToken,
                email: profile.username,
            }

            // ****** ยิงเส้นนี้ ******
            // reponse จะเหมือน login ปกติ
            // master/account-manage/accountSSO-path1
            try {
                toastNotiInfo("Verifying your access permissions...");
                const res_sso = await postServiceNoAuth('/master/account-manage/accountSSO-internal', data_for_login);
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
            // ถ้า silent fail (เช่น authority mismatch / token หมดอายุ) อาจต้องบังคับ login ใหม่
            // await instance.loginRedirect(loginRequestAAD);
        }

    };

    useEffect(() => {
        if (tenant?.b2c === "Y") {
            console.log("[AAD] skip because tenant is B2C", tenant);
            return;
        }

        const ready = isAuthenticated && inProgress === "none" && accounts.length > 0;

        if (!ready || ranRef.current) {
            localStorage.setItem("cxv2ao10xumw84vi0", encryptData(2))
            window.dispatchEvent(new Event("storage"));
            return
        };

        ranRef.current = true; // กันยิงซ้ำรอบถัดไป

        // เมื่อ auth เสร็จ (ไม่มี redirect กำลังทำงาน) ให้โหลดข้อมูลผู้ใช้
        (async () => {
            try {
                await loadUser();
            } catch (e) {
                ranRef.current = false; // ถ้า fail จะยอมให้ลองใหม่
            }
        })();

        // if (isAuthenticated && inProgress === "none" && accounts[0]) {
        //     // if (accounts[0]?.tenantId !== "B2C_1_signin_without_mfa") {
        //     // loadUser();
        //     // }
        //     loadUser();
        // }
    }, [isAuthenticated, inProgress, accounts]);

    // TEST
    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const result = await instance.handleRedirectPromise();

                // ✅ ถ้ามี result แปลว่ากลับจาก AD มาจริง
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
            {/* <button
                id="login_ad_btn"
                data-testid={`btn-login-${apps.client_id}`}
                className="w-full h-[50px] bg-[#00ADEF] text-white rounded-lg tracking-wide mb-4"
                onClick={() => handleLoginAAD()}
            >
                {"LOG IN FOR EXTERNAL"} 
                {props.btnName}
            </button> */}

            <button
                id="login_b2c_btn"
                className="w-full h-[50px] bg-[#2B2A87] text-white font-semibold rounded-lg tracking-wide"
                data-testid={`btn-login-${apps.client_id}`}
                onClick={() => handleLoginAAD()}
            >
                {props.btnName}
            </button>

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
