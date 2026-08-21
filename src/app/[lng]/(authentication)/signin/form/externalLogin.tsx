"use client";
import { PublicClientApplication } from "@azure/msal-browser";
import { useEffect, useMemo, useState } from "react";
import { msalConfigAAD } from "../../../../../../authConfigAAD";
// import B2CLoginComp from "./b2cComponent";
// import AADLoginComp from "./aadComponent";
import { MsalProvider } from "@azure/msal-react";
import tenantsConfig from "@/config/tenantsConfig";
import _ from "lodash";
// import { encryptStorage } from "@/utils/GlobalUtil";
import dynamic from "next/dynamic";
import Spinloading from "@/components/other/spinLoading";
import Spinloading2 from "@/components/other/spinLoading3";

const B2CLoginComp = dynamic(() => import('./b2cComponent'), { ssr: false });
const AADLoginComp = dynamic(() => import('./aadComponent'), { ssr: false });

const LOGIN_PAGE = process.env.NEXT_PUBLIC_API_URL_LOGIN_PAGE
const B2C_CALLBACK_DOMAIN = process.env.NEXT_PUBLIC_B2C_CALLBACK_DOMAIN
const AD_CALLBACK_DOMAIN = process.env.NEXT_PUBLIC_AD_CALLBACK_DOMAIN

export const ExternalLoginComponent = (isLoading?: any) => {

    //   *********************************************************************
    const [tenantsState, setTenantsState] = useState<any[]>([]);
    const [msalInstanceState, setMsalInstanceState] = useState<any>({});
    // const [msalInstanceStatusState, setMsalInstanceStatusState] = useState(false); // login ผ่าน น่าจะเอาไว้ route เข้าไปหลัง authen

    useEffect(() => {
        getTenant();
    }, []);

    const setmsalInstance = (tenantsState: any) => {
        try {
            if (tenantsState.length > 0) {
                let msalInstance = msalInstanceState;

                tenantsState.forEach((data: any, index: number) => {
                    const apps = data.apps;

                    if (apps) {
                        return apps.map((data2: any, index2: number) => {
                            let msalConfig: any = createMsalConfig(data, data2);
                            msalInstance = {
                                ...msalInstance,
                                [data2.client_id]: new PublicClientApplication(msalConfig),
                            };
                        });
                    }
                });
                if (_.isEmpty(msalInstanceState)) {
                    setMsalInstanceState({
                        ...msalInstance,
                    });
                    // setMsalInstanceStatusState(true);
                }
            }
        } catch (error) { }
    };

    const createMsalConfig = (data: any, data2: any) => {
        let auth: any = {
            clientId: `${data2.client_id}`,
            authority: `${data2.authority[0].url}`,
            redirectUri: `${AD_CALLBACK_DOMAIN}`,
            navigateToLoginRequestUrl: false,
            postLogoutRedirectUri: LOGIN_PAGE
        };
        if (data.b2c === "Y") {
            auth.knownAuthorities = data2.knownAuthorities; // ที่ไม่ใช้เป็น array เพราะใน tenants config มันเป็น arr อยู่แล้ว
            auth.redirectUri = `${B2C_CALLBACK_DOMAIN}`;
        }

        return {
            ...msalConfigAAD,
            auth,
            windowHashTimeout: 60000,
            iframeHashTimeout: 6000,
            loadFrameTimeout: 0,
        };
    };

    // const createMsalConfig = (data: any, data2: any) => {
    //     const isB2C = data.b2c === "Y";

    //     // const redirectUri = isB2C ? `${REDIRECT_URL}/en/master/auth/callback-sso-external` : `${REDIRECT_URL}/en/master/auth/callback-sso-internal`;
    //     const redirectUri = isB2C ? `http://localhost:3000` : `${REDIRECT_URL}/en/master/auth/callback-sso-internal`;

    //     let auth: any = {
    //         clientId: data2.client_id,
    //         authority: data2.authority[0].url,
    //         redirectUri,
    //         navigateToLoginRequestUrl: false,
    //         postLogoutRedirectUri: `${REDIRECT_URL}/en/signin`,
    //     };

    //     if (isB2C) {
    //         auth.knownAuthorities = Array.isArray(data2.knownAuthorities) ? data2.knownAuthorities : [String(data2.knownAuthorities)];
    //     }

    //     return {
    //         ...msalConfigAAD,
    //         auth,
    //         windowHashTimeout: 60000,
    //         iframeHashTimeout: 6000,
    //         loadFrameTimeout: 0,
    //     };
    // };


    // // const dispatch: AppDispatch = useDispatch();

    const getTenant = async () => {
        try {
            const tenants = tenantsConfig.TENANTS;
            // dispatch(
            //   dropdownState.actions.updateDropdown({ tenant: tenants.tenants })
            // );
            setmsalInstance(tenants.tenants);
            setTenantsState(tenants.tenants);
        } catch (error) { }
    };

    const renderButton = (data: any, data2: any, tenantData: any) => {
        if (data.b2c === "Y") {
            return (
                // <B2CLoginComp btnName={`LOG IN FOR PTT USER`} tenant={tenantData} apps={data2} /> // เดิมโรงงาน
                <B2CLoginComp btnName={`LOG IN FOR EXTERNAL`} tenant={tenantData} apps={data2} />
            );
        } else if (data.b2c === "N") {
            return (
                // <AADLoginComp btnName={`LOG IN FOR EXTERNAL`} tenant={tenantData} apps={data2} />  // เดิมโรงงาน
                <AADLoginComp btnName={`LOG IN FOR PTT USER`} tenant={tenantData} apps={data2} />
            );
        }
        return;
    };

    const providerButton = (apps: any, data: any) => {
        if (!apps) return <></>

        return apps?.map((data2: any, index2: number) => {
            if (index2 === 0) {
                let tenantData = data;
                return (
                    <MsalProvider
                        instance={msalInstanceState[data2.client_id]}
                        key={index2}
                    >
                        {renderButton(data, data2, tenantData)}
                    </MsalProvider>
                );
            }
            return <></>;
        });
    };

    const prioritizedTenants = useMemo(() => {
        const prio = (t: any) => (t?.b2c === 'N' ? 0 : 1); // N = AAD(PTT USER) ก่อน, Y = B2C ทีหลัง
        return [...(tenantsState ?? [])].sort((a, b) => prio(a) - prio(b));
    }, [tenantsState]);

    return (<>
        <Spinloading2 spin={isLoading?.isLoading} rounded={20} />
        <div className="space-y-4">
            {tenantsState?.length > 0 ?
                // tenantsState.map((data: any, index: number) => {
                //     const apps = data.apps;
                //     if (apps) {
                //         return providerButton(apps, data);
                //     }
                // })
                prioritizedTenants.map((data: any, index: number) => {
                    const apps = data?.apps;
                    if (!apps) return null;
                    return providerButton(apps, data);
                })
                :
                <>
                    <button className="w-full h-[50px] bg-[#2B2A87] text-white mb-4 font-semibold rounded-lg tracking-wide">{"LOG IN FOR PTT USER"}</button>
                    <button className="w-full h-[50px] bg-[#00ADEF] text-white rounded-lg tracking-wide">{"LOG IN FOR EXTERNAL"}</button>
                </>
            }
        </div>
    </>
    )
}