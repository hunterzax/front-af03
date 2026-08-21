"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCookie, setCookie } from "@/utils/cookie";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined';
import { getService } from "@/utils/postService";
import { clearCookiesAndLocalStorage } from "@/utils/generalFormatter";
import { decryptData, encryptData } from "@/utils/encryptionData";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const API_URL = process.env.NEXT_PUBLIC_API_URL

import dynamic from 'next/dynamic';
import getCookieValue from "@/utils/getCookieValue";
import { useTabCount } from "@/utils/useTabCount";
import { useBrowserSession } from "@/utils/useBrowserSession";


import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.tz.setDefault("Asia/Bangkok")

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    //   border: '2px solid #000',
    //   boxShadow: 24,
    p: 4,
    borderRadius: '10px',
};

const updateLoginListen = async () => {
    try {
        // เอาไว้ update flag login จะได้รู้ว่า user ที่ login นี้ยังอยู่ จะได้เอาไปใช้เช็คตอนจะ login ซ้ำที่ device อื่น
        const res_update_login_listen: any = await getService(`/master/account-manage/update-login-listen`);
        // if (!res_update_login_listen) {
        //     const resUpdateFlagLogin: any = await getService(`/master/account-manage/update-flag-logout`);
        //     clearCookiesAndLocalStorage();
        //     // router.push("/en/signin");
        // }
    } catch (error) {
        // Error res_update_login_listen
    }
};



const InactivityTracker = () => {

    const WSClient = dynamic(() => import('@/components/other/wsClient'), { ssr: false });
    const timeout: any = process.env.NEXT_PUBLIC_SESSION_TIMEOUT

    const [inactive, setInactive] = useState(false);
    const router = useRouter();
    const currentPath = usePathname();

    const { tabCount, isFirstTabAfterBrowserRestart, ready } = useBrowserSession();
    const didOnce = useRef(false);

    // useEffect(() => {
    //     if (!ready || didOnce.current) return;
    //     didOnce.current = true;

    //     if (isFirstTabAfterBrowserRestart) {
    //         //นี่คือครั้งแรกหลังปิด browser หมดแล้วเปิดใหม่
    //         const ck_ = async () => {
    //             const res_ = await getService(`/master/account-manage/account-local-once`);
    //             if (res_?.account?.listen_login_date) {
    //                 // เช็ค
    //                 // const date_ = dayjs(res_?.account?.listen_login_date)?.format("YYYY-MM-DD HH:mm:ss")

    //                 const now = dayjs();
    //                 const t = dayjs(res_?.account?.listen_login_date);
    //                 const diffMinFloat = now.diff(t, "minute", true);

    //                 // diffAbs ห่างกัน(นาที)
    //                 const diffAbs = Math.abs(diffMinFloat);

    //                 if (diffAbs > (Number(timeout))) {
    //                     // ดีดออก
    //                     await handleUpdateFlagLogOut();
    //                     await clearCookiesAndLocalStorage();
    //                     router.replace("/en/signin");
    //                 }
    //             } else {
    //                 // ดีดออก
    //                 await handleUpdateFlagLogOut();
    //                 await clearCookiesAndLocalStorage();
    //                 router.replace("/en/signin");
    //             }
    //         }
    //         ck_()

    //     }
    // }, [ready, tabCount, isFirstTabAfterBrowserRestart]);



    // เมื่อ logout update auth
    
    useEffect(() => {
    if (!ready || didOnce.current) return;

    const excludedPaths = [
        '/en/signin',
        '/en/forgot-password',
        '/en/reset-password',
    ];

    // ตัด query string ออก เผื่อ URL มี ?ref=...
    const pathname =
        typeof window !== 'undefined'
            ? window.location.pathname
            : currentPath;

    const isExcludedPath = excludedPaths.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`)
    );

    // หน้า public ไม่ต้องเช็ก session และไม่ต้อง redirect
    if (isExcludedPath) {
        return;
    }

    didOnce.current = true;

    if (!isFirstTabAfterBrowserRestart) {
        return;
    }

    const checkBrowserSession = async () => {
        try {
            const res_ = await getService(
                `/master/account-manage/account-local-once`
            );

            const listenLoginDate = res_?.account?.listen_login_date;

            if (!listenLoginDate) {
                await handleUpdateFlagLogOut();
                await clearCookiesAndLocalStorage();
                router.replace('/en/signin');
                return;
            }

            const now = dayjs();
            const lastLoginListen = dayjs(listenLoginDate);

            const diffMinFloat = now.diff(
                lastLoginListen,
                'minute',
                true
            );

            const diffAbs = Math.abs(diffMinFloat);

            if (diffAbs > Number(timeout)) {
                await handleUpdateFlagLogOut();
                await clearCookiesAndLocalStorage();
                router.replace('/en/signin');
            }
        } catch (error) {
            console.error('Check browser session error:', error);
        }
    };

    checkBrowserSession();
}, [
    ready,
    tabCount,
    isFirstTabAfterBrowserRestart,
    currentPath,
    router,
    timeout,
]);

    const handleUpdateFlagLogOut = async () => {
        const { default: AuthenApi } = await import('@/app/api/AuthApi') // ต้อง import แบบนี้ไม่งั้นตอน build แตก

        try {
            const res_update_flag_logout: any = await getService(`/master/account-manage/update-flag-logout`);
            await clearCookiesAndLocalStorage();
            await AuthenApi.Logout()
        } catch (error) {
            // error res_update_flag_logout
        }
    }

    // ยิงเส้น login_listen
    useEffect(() => {
        const intervalId = setInterval(async () => {
            const pathnameY = window.location.pathname;
            if (pathnameY !== "/en/signin" && pathnameY !== '/en/forgot-password') {
                try {
                    await updateLoginListen();
                } catch (error) {
                    // cannot update login listen
                }
            }
        }, 15 * 60 * 1000); // 15 minutes in milliseconds
        return () => clearInterval(intervalId);
    }, []);

    const handleLoginLocalOnce = async () => {
        try {
            const res_ = await getService(`/master/account-manage/account-local-once`);
        } catch (error) {

        }
    }

    useEffect(() => {
        const intervalId = setInterval(async () => {
            const pathnameY = window.location.pathname;
            if (pathnameY !== "/en/signin" && pathnameY !== '/en/forgot-password') {
                try {
                    await handleLoginLocalOnce();
                } catch (error) {
                    // cannot update login listen
                }
            }
            // }, 3 * 60 * 1000); // 3 minutes in milliseconds
        }, 17 * 60 * 1000); // 17 minutes in milliseconds
        return () => clearInterval(intervalId);
    }, []);


    useEffect(() => {
        const pathname = window.location.pathname;
        // console.log('pathname : ', pathname);
        const excludedPaths = ['/en/signin', '/en/forgot-password', '/en/reset-password'];

        const isExcludedPath = excludedPaths.some(path => pathname.includes(path));

        const redirectPage = async () => {
            const redirectUrl: any = await getCookiename('redirectAfterLogin');

            if (redirectUrl) {
                router.push(redirectUrl);
            } else {
                router.push('/en/authorization');
            }
        };

        // ⛔️ เงื่อนไข Auto Login เฉพาะหน้า /en/signin เท่านั้น
        if (pathname === '/en/signin') {
            let tokenFromLocalStorage = localStorage.getItem("v4r2d9z5m3h0c1p0x7l");
            tokenFromLocalStorage = tokenFromLocalStorage ? decryptData(tokenFromLocalStorage) : null;

            let userData: any = localStorage.getItem("x9f3w1m8q2y0u5d7v1z");
            userData = userData ? decryptData(userData) : null;

            let tacData: any = localStorage.getItem("p5n3b7j2k9s1a6wq8t0");
            tacData = tacData ? decryptData(tacData) : null;

            let userCheck;
            try {
                userCheck = userData && userData !== "undefined" ? JSON.parse(userData) : null;
            } catch {
                userCheck = null;
            }

            let tacCheck;
            try {
                tacCheck = tacData && tacData !== "undefined" ? JSON.parse(tacData) : null;
            } catch {
                tacCheck = null;
            }

            const hasAcceptedTerms =
                userCheck?.f_t_and_c === true &&
                (userCheck?.t_a_c_url || '') === (tacCheck?.url || '') &&
                tokenFromLocalStorage &&
                userData &&
                tokenFromLocalStorage !== 'undefined' &&
                userData !== 'undefined';

            if (hasAcceptedTerms) {
                toast.dismiss();
                toast.info('User logged in. Redirecting to main menu...', {
                    position: 'bottom-right',
                    autoClose: 3000,
                });

                setTimeout(() => {
                    router.push('/en/authorization');
                }, 500);
                return;
            }

            if (tokenFromLocalStorage && userData) {
                redirectPage();
            }

            // ถ้าไม่มี token หรือ user → ปล่อยให้ login ปกติ
            return;
        }

        // ✅ ถ้า path ไม่ได้อยู่ใน excluded → เริ่มจับ inactivity
        if (!isExcludedPath) {
            const timeoutMs = timeout * 60 * 1000;
            let timeoutId: NodeJS.Timeout;

            const handleInactivity = async () => {
                const currentUser = getCurrentUser();
                let isSuperAdmin = false;
                const env = process.env.NODE_ENV;
                const isPttEnv = ['production', 'pre-production'].includes(env ?? '');

                if (!isPttEnv && currentUser) {
                    isSuperAdmin = currentUser.account_manage?.some((item: any) =>
                        item?.account_role?.some((role: any) =>
                            role?.role?.name === 'Super Admin Default' || role?.role?.id === 1
                        )
                    );
                }

                if (!isSuperAdmin) {
                    await handleUpdateFlagLogOut();
                    await clearCookiesAndLocalStorage();
                    setCookie('redirectAfterLogin', pathname, 1);
                    setInactive(true);
                }
                    // console.log('----- pathname : ', pathname);
            };

            const resetTimeout = () => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(handleInactivity, timeoutMs);
                localStorage.setItem('user-activity', Date.now().toString());
            };

            const syncActivityAcrossTabs = (e: StorageEvent) => {
                if (e.key === 'user-activity') {
                    resetTimeout();
                }
            };

            timeoutId = setTimeout(handleInactivity, timeoutMs);
            window.addEventListener('mousemove', resetTimeout);
            window.addEventListener('keydown', resetTimeout);
            window.addEventListener('storage', syncActivityAcrossTabs);

            return () => {
                clearTimeout(timeoutId);
                window.removeEventListener('mousemove', resetTimeout);
                window.removeEventListener('keydown', resetTimeout);
                window.removeEventListener('storage', syncActivityAcrossTabs);
            };
        }

    }, [router, currentPath]); // 👈 ทำให้ useEffect run ใหม่เมื่อ path เปลี่ยน

    async function getCookiename(name: string) {
        const redirectUrl: any = await getCookie(name);
        return redirectUrl;
    }

    useEffect(() => {
        const excludedPaths = [
            '/en/signin',
            '/en/forgot-password',
            '/en/reset-password',
        ];
        const currentPath = location.pathname;

        if (excludedPaths.includes(currentPath)) {
            return;
        }

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = ''; // Required for Chrome to show the dialog
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [location.pathname]);

    // useEffect(() => {
    //     const handleOffline = () => {
    //         toast.warning('You are offline. All features will not work.', {
    //             position: 'bottom-right',
    //             autoClose: false,
    //         });
    //     };

    //     const handleOnline = () => {
    //         toast.dismiss(); // Remove offline warning
    //         toast.success('Back online!', {
    //             position: 'bottom-right',
    //             autoClose: 3000,
    //         });
    //     };

    //     window.addEventListener('offline', handleOffline);
    //     window.addEventListener('online', handleOnline);

    //     // Initial check
    //     if (!navigator.onLine) {
    //         handleOffline();
    //     }

    //     return () => {
    //         window.removeEventListener('offline', handleOffline);
    //         window.removeEventListener('online', handleOnline);
    //     };
    // }, []);

    const handleLoginRedirect = () => {
        setInactive(false);
        console.log('logout');
        handleLogout();
    };

    const handleLogout = async () => {
        await clearCookiesAndLocalStorage();
        localStorage.clear();
        const channel = new BroadcastChannel("auth_channel");
        // ส่งสัญญาณ logout ให้ทุก tab
        channel.postMessage("logout");
        channel.close();
        router.replace("/en/signin");
    };


    const getCurrentUser = () => {
        let userData: any = localStorage.getItem("x9f3w1m8q2y0u5d7v1z");
        userData = userData ? decryptData(userData) : null;

        let userCheck;
        try {
            userCheck = userData && userData !== "undefined" ? JSON.parse(userData) : null;
            return userCheck;
        } catch (error) {
            // Invalid JSON at get user of inactivity tracker
            return null;
        }
    };

    return (
        <>
            <WSClient />
            <ToastContainer />
            <Modal open={inactive} onClose={handleLoginRedirect}>
                <Box sx={style}>
                    <div className="flex items-center justify-center pb-2">
                        <div className={`flex items-center justify-center w-12 h-12 bg-[#fff9cb] text-[#EED202]  rounded-full`}>
                            <PriorityHighOutlinedIcon />
                        </div>
                    </div>
                    <div className={`flex pb-2 justify-center text-[#EED202] text-2`}>
                        {`Session Expired`}
                    </div>
                    <div className="flex p-4 justify-center text-[#637381] text-ellipsis text-center">
                        {`Your session has expired due to inactivity. Please log in again to continue.`}
                    </div>
                    <div className='flex pt-4 justify-center'>
                        <button
                            type='button'
                            onClick={handleLoginRedirect}
                            className="w-[120px] h-[40px] bg-blue-500 text-white hover:bg-blue-600 rounded-md"
                        >
                            {`OK`}
                        </button>
                    </div>
                </Box>
            </Modal>
        </>

    );
};

export default InactivityTracker;