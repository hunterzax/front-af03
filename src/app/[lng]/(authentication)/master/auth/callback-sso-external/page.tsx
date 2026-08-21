"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
// import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";

const B2C_NAME = process.env.NEXT_PUBLIC_B2C_NAME;
const B2C_DOMAIN = `${B2C_NAME}.onmicrosoft.com`;
const B2C_URL = `https://${B2C_DOMAIN}`;
const B2C_KNOWN_AUTH = `https://${B2C_NAME}.b2clogin.com/`;
const B2C_TENENT = process.env.NEXT_PUBLIC_B2C_TENANT;
const B2C_CLIENT_ID = process.env.NEXT_PUBLIC_B2C_CLIENT_ID;
const B2C_SIGNIN_POLICY = process.env.NEXT_PUBLIC_B2C_SIGNIN_POLICY;
const B2C_CALLBACK_DOMAIN = process.env.NEXT_PUBLIC_B2C_CALLBACK_DOMAIN;


// สร้าง instance สำหรับ B2C โดยตรง (ใช้ config เดียวกับที่กด login)
const msalInstanceB2C = new PublicClientApplication({
    auth: {
        clientId: `${B2C_CLIENT_ID}`,
        authority: `${B2C_KNOWN_AUTH}${B2C_TENENT}/${B2C_SIGNIN_POLICY}/`,
        knownAuthorities: [`${B2C_KNOWN_AUTH}`],
        redirectUri: `${B2C_CALLBACK_DOMAIN}`,
        navigateToLoginRequestUrl: false,
    },
    cache: {
        cacheLocation: "localStorage",
    },
});

export default function CallbackSSOExternalPage() {
    // const { instance } = useMsal();
    const router = useRouter();

    // useEffect(() => {
    //     setTimeout(() => {
    //         (async () => {
    //             try {
    //                 const res_login = await instance.handleRedirectPromise();
    //                 router.replace("/en/signin");
    //             } catch (err) {
    //                 console.error("B2C callback error:", err);
    //                 router.replace("/en/signin?error=b2c_callback");
    //             }
    //         })();
    //     }, 1000);
    // }, [instance, router]);

    useEffect(() => {
        (async () => {
            try {
                await msalInstanceB2C.initialize();
                await msalInstanceB2C.handleRedirectPromise();
            } catch (e) {
                // console.error("callback handleRedirectPromise error:", e);
            } finally {
                router.replace("/en/signin");
            }
        })();
    }, [router]);

    return (
        <section
            className="relative h-[100vh] overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: "url('/assets/image/bg_menu_02.png')" }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black bg-opacity-50" />

            {/* Modal */}
            <div className="absolute inset-0 flex items-center justify-center px-4">
                <div className="w-full max-w-sm rounded-2xl bg-white/90 p-6 shadow-xl backdrop-blur">
                    <div className="flex items-center gap-4">
                        {/* Spinner */}
                        <div className="h-10 w-10 rounded-full border-4 border-black/10 border-t-black/60 animate-spin" />

                        <div className="min-w-0">
                            <div className="text-lg font-semibold text-gray-900">
                                Redirecting…
                            </div>
                            <div className="mt-1 text-sm text-gray-600">
                                Please wait a while.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}