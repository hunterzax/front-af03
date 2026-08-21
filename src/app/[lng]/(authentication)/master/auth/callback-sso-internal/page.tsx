"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
// import { useMsal } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";

const AD_TENENT = process.env.NEXT_PUBLIC_AD_TENANT;
const AD_CLIENT_ID = process.env.NEXT_PUBLIC_AD_CLIENT_ID;
const AD_CALLBACK_DOMAIN = process.env.NEXT_PUBLIC_AD_CALLBACK_DOMAIN;

// สร้าง instance สำหรับ B2C โดยตรง (ใช้ config เดียวกับที่กด login)
const msalInstanceAD = new PublicClientApplication({
    auth: {
        clientId: `${AD_CLIENT_ID}`,
        authority: `https://login.microsoftonline.com/${AD_TENENT}/`,
        redirectUri: `${AD_CALLBACK_DOMAIN}`,
        navigateToLoginRequestUrl: false,
    },
    cache: {
        cacheLocation: "localStorage",
    },
});

export default function CallbackSSOInternalPage() {
    // const { instance } = useMsal();
    const router = useRouter();

    // useEffect(() => {
    //     (async () => {
    //         try {
    //             await instance.handleRedirectPromise();
    //             router.replace("/en/signin");
    //         } catch (err) {
    //             console.error("AD callback error:", err);
    //             router.replace("/en/signin?error=ad_callback");
    //         }
    //     })();
    // }, [instance, router]);

    useEffect(() => {
        (async () => {
            try {
                await msalInstanceAD.initialize();
                await msalInstanceAD.handleRedirectPromise();
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