"use client";
import Image from "next/image";
// import { useTranslation } from "@/app/i18n";
import Marquee from "react-fast-marquee";
import CampaignIcon from "@mui/icons-material/Campaign";
import { useEffect, useState } from "react";
import FormSignin from "./form/form-lgn";
import { deleteCookie, getCookie, setCookie } from "@/utils/cookie";
import { useRouter } from "next/navigation";
import PopupTandC from "./component/t_and_c_popup";
import { getNoTokenService, getService, postService, postServiceNoAuth } from "@/utils/postService";
import { useTheme } from "next-themes";
import ModalComponent from "@/components/other/ResponseModal";
import axios from "axios";
import "./styles.css"
// import dayjs from "dayjs";
// import { isDifferenceMoreThan15Minutes } from "@/utils/generalFormatter";
import getCookieValue from "@/utils/getCookieValue";
import { useLogout } from "@/utils/logoutFunc";
import { decryptData, encryptData } from "@/utils/encryptionData";
import NetworkErrorPopup from "./component/errorNetwork_popup";
import { clearCookiesAndLocalStorage, toastNotiError } from "@/utils/generalFormatter";
import { ExternalLoginComponent } from "./form/externalLogin";
import Spinloading from "@/components/other/spinLoading";

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface HomeProps {
  params: {
    lng: string;
  };
}

const SignInPage: React.FC<HomeProps> = (props) => {
  const { params: { lng }, } = props;
  // const { t } = useTranslation(lng);
  const { mutateLogout } = useLogout();
  const [mode, setmode] = useState("mode1");
  const [bgUrl, setBgUrl] = useState("");
  const [announcement, setAnnouncement] = useState<any>();
  const [resLogin, setResLogin] = useState<any>();
  const [popuptc, setpopuptc] = useState<boolean>(false);
  const [isAcceptTc, setIsAcceptTc] = useState<boolean>(false);
  const [tac, setTac] = useState<any>();
  const [resetForm, setResetForm] = useState<() => void | null>();
  const [isModalOpen, setisModalOpen] = useState<boolean>(false);
  const [isModalTxt, setisModalTxt] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [tempToken, setTempToken] = useState<any>('')
  const [modeAcceptModal, setModeAcceptModal] = useState<any>('')

  const [dataEmail, setDataEmail] = useState<any>({})

  const [isModallocked, setisModallocked] = useState<boolean>(false);
  const [islockedTxt, setislockedTxt] = useState<any>();

  const router = useRouter();
  const webVersion = process.env.NEXT_PUBLIC_WEB_VERSION

  let logcookie: any = getCookieValue("logFailed");
  const [tk, settk] = useState<boolean>(false);
  const [logFailed, setlogFailed] = useState<any>(logcookie ? JSON?.parse(logcookie) : undefined);

  const { systemTheme, theme, setTheme } = useTheme();

  const env = process.env.NODE_ENV;
  const isPttEnv = ['production', 'pre-production'].includes(env ?? '');

  const fetchData = async () => {
    try {
      const response: any = await getNoTokenService(`/master/parameter/announcement-use`);
      setAnnouncement(response);
    } catch (err) {
      // setError(err.message);
    } finally {
      // setLoading(false);
    }

    try {
      const response: any = await getNoTokenService(`/master/parameter/setup-background`);
      if (response && Array.isArray(response) && response.length > 0) {
        const activeBgList = response.filter((item: any) => item && item.active == true && item.url).sort(
          (a: any, b: any) => (b?.id || 0) - (a.id || 1)
        )
        if (activeBgList && activeBgList.length > 0 && activeBgList[0]?.url) {
          setBgUrl(activeBgList[0].url)
        }
      }
    } catch (err) {
      // setError(err.message);
    }
  };

  useEffect(() => {
    setTheme("light")
    fetchData();
  }, [])

  // const getCookie: any = getCookie('v4r2d9z5m3h0c1p0x7l');
  // ใช้เช็คหาก user เปิด 2 แท็บเมื่อมาหน้า signin แล้ว refresh จะเข้าไปยังหน้า menu ทันที
  // let getsignCookie: any = getCookieValue("v4r2d9z5m3h0c1p0x7l");

  // useEffect(() => {
  //   if(getsignCookie){
  //     router.push("/en/authorization");
  //   }
  // }, [getsignCookie])

  const handleSendNotification = async (email?: any) => {
    try {
      const data = {
        extras: {
          email: email?.email,
        },
        message: "Logged in from another device", // msg
        priority: 1,
        title: "", // module
      };

      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${process.env.NEXT_PUBLIC_NOTI_IN_APP_DOMAIN ?? ''}/message`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GOTIFY_SENDER_TOKEN}`,
        },
        data,
      };
      const response = await axios.request(config);
      return response.data; // ส่งต่อข้อมูลที่ response กลับมา
    } catch (error: any) {
      // handleSendNotification error:
      throw error; // หรือ return false ก็ได้ถ้าอยากให้เงียบ
    }
  };

  const gotoResetPassword = (token?: any) => {
    router.push(`/en/reset-password?ref=${token}`);
  }

  // login anyway backup 2026-03-26
  // const handleLoginAnyway = async (data: any) => {

  //   const result = await postService('/master/account-manage/account-local', data);
  //   setResLogin(result)

  //   if (!result?.status) {
  //     if (result?.code == "ERR_NETWORK") {
  //       seterrorNetworkTricker(true);
  //     } else {
  //       setCookie("v4r2d9z5m3h0c1p0x7l", result?.token, 1);
  //       localStorage.setItem("dev_mode_token", result?.token)
  //       localStorage.setItem("v4r2d9z5m3h0c1p0x7l", encryptData(result?.token))
  //       localStorage.setItem("x9f3w1m8q2y0u5d7v1z", encryptData(result?.account))
  //       localStorage.setItem("p5n3b7j2k9s1a6wq8t0", encryptData(result?.tac))
  //       activeAccount(data?.email);

  //       // Broadcast login event to other tabs
  //       window.dispatchEvent(new Event('storage'));

  //       let last_page = await getCookie("redirectAfterLogin")

  //       if (result?.tac == null) { // อันนี้คือไม่ได้ set t and c ไว้ใน dam หรือหมดอายุแล้ว จะผ่านเข้าไปเลย
  //         if (result?.account?.password_gen_flag == true || result?.account?.account_password_check?.length <= 0) {
  //           // go to reset password page
  //           // router.push(`/en/reset-password?ref=${result?.token}`);
  //           gotoResetPassword(result?.token);
  //         } else {
  //           if (last_page && last_page !== "/en/reset-password") {
  //             router.push(`${last_page}`);
  //           } else {
  //             router.push("/en/authorization");
  //           }
  //         }
  //       } else if (result?.tac?.url == result?.account?.t_a_c_url) { // อย่าให้มีครั้งที่ 3 ตรงนี้เช็คว่า t&c ที่ accept ไปเท่ากับของใหม่หรือป่าว ถ้าเท่าก็ผ่านเข้าระบบไปเลย

  //         if (result?.account?.password_gen_flag == true || result?.account?.account_password_check?.length <= 0) {
  //           // go to reset password page
  //           // router.push(`/en/reset-password?ref=${result?.token}`);
  //           gotoResetPassword(result?.token);
  //         } else {
  //           if (last_page && last_page !== "/en/reset-password") {
  //             router.push(`${last_page}`);
  //           } else {
  //             router.push("/en/authorization");
  //           }
  //         }
  //       } else {
  //         // please accept term
  //         setTac(result?.tac)
  //         // setTac(result?.account?.t_a_c_url)
  //         setpopuptc(true);
  //       }
  //     }

  //   } else {
  //     if (
  //       result?.response?.data?.statusCode == 401 ||
  //       result?.response?.data?.statusCode == 500 ||
  //       result?.response?.data?.statusCode == 412 ||
  //       result?.response?.data?.statusCode == 403 ||
  //       result?.response?.data?.status == 401 ||
  //       result?.response?.data?.status == 500 ||
  //       result?.response?.data?.status == 412 ||
  //       result?.response?.data?.status == 403
  //     ) {
  //       if (result?.response?.data?.statusCode == 401 || result?.response?.data?.statusCode == 500) { // user หรือ email ผิด
  //         setisModalTxt("Invalid email or password. Please try again.")
  //         handleFaildlgn(data?.email);
  //       } else if (result?.response?.data?.statusCode == 412 || result?.response?.data?.status == 412) { // PASSWORD หมดอายุ

  //         setisModalTxt(result?.response?.data?.error ? result?.response?.data?.error : "Your password has expired. Please update it, as passwords must be changed every 90 days for security purposes.")

  //         if (result?.response?.data?.error == "Your password has expired. Please update it, as passwords must be changed every 90 days for security purposes.") {
  //           // // v1.0.90 ควรไปที่หน้า reset password ถ้า user/password ถูก https://app.clickup.com/t/86ernzvhr
  //           // // ให้กด modal ก่อนค่อยไปหน้า reset
  //           // router.push(`/en/reset-password?ref=${result?.token}`);
  //           setTempToken(result?.response?.data?.token)
  //           setModeAcceptModal('password-expire')
  //         }

  //       } else if (result?.response?.data?.status == 403) {
  //         setisModalTxt(result?.response?.data?.error || result?.response?.error ? result?.response?.data?.error || result?.response?.error : "Login mode does not match. Please contact the administrator.")
  //       }
  //       await clearCookiesAndLocalStorage();
  //       setisModalOpen(true);
  //     } else if (result?.response?.data?.status == 503) {
  //       const logDate = result?.response?.data?.data?.logDate;
  //       const formattedLogDate = logDate?.split(":").slice(0, 2).join(":");

  //       setislockedTxt(
  //         <div>
  //           <div>{"Your account has been locked due to 3 failed attempts."}</div>
  //           <div>{"It will be unlocked after " + formattedLogDate}</div>
  //         </div>
  //       )
  //       setisModallocked(true);
  //     } else if (result?.response?.data?.status == 400) {
  //       // setisModalTxt("Your account already logged-in in another device.")
  //       setisModalTxt(result?.response?.data?.error)
  //       await clearCookiesAndLocalStorage();
  //       setisModalOpen(true);
  //     }

  //     if (resetForm) resetForm();
  //   }

  //   setIsLoading(false)
  // }

  const handleLoginAnyway = async (data: any) => {

    const result = await postService('/master/account-manage/account-local', data);
    setResLogin(result)

    const statusCode = result?.response?.data?.statusCode ?? result?.response?.data?.status ?? result?.status ?? result?.statusCode ?? result?.code ?? result?.response?.status;
    const errorMsg = result?.response?.data?.error ?? result?.data?.error ?? result?.response?.error ?? result?.error;

    if (!statusCode) {
      if (statusCode == "ERR_NETWORK") {
        seterrorNetworkTricker(true);
      } else {
        setCookie("v4r2d9z5m3h0c1p0x7l", result?.token, 1);
        // localStorage.setItem("dev_mode_token", result?.token)
        localStorage.setItem("v4r2d9z5m3h0c1p0x7l", encryptData(result?.token))
        localStorage.setItem("x9f3w1m8q2y0u5d7v1z", encryptData(result?.account))
        localStorage.setItem("p5n3b7j2k9s1a6wq8t0", encryptData(result?.tac))
        activeAccount(data?.email);

        // Broadcast login event to other tabs
        window.dispatchEvent(new Event('storage'));

        let last_page = await getCookie("redirectAfterLogin")

        if (result?.tac == null) { // อันนี้คือไม่ได้ set t and c ไว้ใน dam หรือหมดอายุแล้ว จะผ่านเข้าไปเลย
          if (result?.account?.password_gen_flag == true || result?.account?.account_password_check?.length <= 0) {
            // go to reset password page
            // router.push(`/en/reset-password?ref=${result?.token}`);
            gotoResetPassword(result?.token);
          } else {
            if (last_page && last_page !== "/en/reset-password") {
              router.push(`${last_page}`);
            } else {
              router.push("/en/authorization");
            }
          }
        } else if (result?.tac?.url == result?.account?.t_a_c_url) { // อย่าให้มีครั้งที่ 3 ตรงนี้เช็คว่า t&c ที่ accept ไปเท่ากับของใหม่หรือป่าว ถ้าเท่าก็ผ่านเข้าระบบไปเลย

          if (result?.account?.password_gen_flag == true || result?.account?.account_password_check?.length <= 0) {
            // go to reset password page
            // router.push(`/en/reset-password?ref=${result?.token}`);
            gotoResetPassword(result?.token);
          } else {
            if (last_page && last_page !== "/en/reset-password") {
              router.push(`${last_page}`);
            } else {
              router.push("/en/authorization");
            }
          }
        } else {
          // please accept term
          setTac(result?.tac)
          // setTac(result?.account?.t_a_c_url)
          setpopuptc(true);
        }
      }

    } else {
      if ([401, 403, 412, 500].includes(Number(statusCode))) {
        if (statusCode == 401 || statusCode == 500) { // user หรือ email ผิด
          setisModalTxt("Invalid email or password. Please try again.")
          handleFaildlgn(data?.email);
        } else if (statusCode == 412) { // PASSWORD หมดอายุ

          setisModalTxt(errorMsg ? errorMsg : "Your password has expired. Please update it, as passwords must be changed every 90 days for security purposes.")

          if (errorMsg == "Your password has expired. Please update it, as passwords must be changed every 90 days for security purposes.") {
            // // v1.0.90 ควรไปที่หน้า reset password ถ้า user/password ถูก https://app.clickup.com/t/86ernzvhr
            // // ให้กด modal ก่อนค่อยไปหน้า reset
            // router.push(`/en/reset-password?ref=${result?.token}`);
            setTempToken(result?.response?.data?.token ?? result?.data?.token ?? result?.token)
            setModeAcceptModal('password-expire')
          }

        } else if (statusCode == 403) {
          setisModalTxt(errorMsg ? errorMsg : "Login mode does not match. Please contact the administrator.")
        }
        await clearCookiesAndLocalStorage();
        setisModalOpen(true);
      } else if (errorMsg == 503) {
        const logDate = result?.response?.data?.data?.logDate ?? result?.data?.logDate ?? result?.logDate;
        const formattedLogDate = logDate?.split(":").slice(0, 2).join(":");

        setislockedTxt(
          <div>
            <div>{"Your account has been locked due to 3 failed attempts."}</div>
            <div>{"It will be unlocked after " + formattedLogDate}</div>
          </div>
        )
        setisModallocked(true);
      } else if (statusCode == 400) {
        setisModalTxt(errorMsg)
        await clearCookiesAndLocalStorage();
        setisModalOpen(true);
      }

      if (resetForm) resetForm();
    }

    setIsLoading(false)
  }


  // #region BACKUP LOGIN
  // const handleFormSubmit = async (data: any) => {
  //   setIsLoading(true)

  //   data.email = data.email.toLowerCase();
  //   data.password = data.password.trim(); // 2025-01-30 ใส่ไว้ให้พี่แซ๊คเทส
  //   setDataEmail(data)

  //   const result = await postService('/master/account-manage/account-local', data);
  //   setResLogin(result)

  //   if (!result?.status) {
  //     if (result?.code == "ERR_NETWORK") {
  //       seterrorNetworkTricker(true);
  //       setIsLoading(false)
  //     } else {
  //       setCookie("v4r2d9z5m3h0c1p0x7l", result?.token, 1);
  //       localStorage.setItem("dev_mode_token", result?.token)
  //       localStorage.setItem("v4r2d9z5m3h0c1p0x7l", encryptData(result?.token))
  //       localStorage.setItem("x9f3w1m8q2y0u5d7v1z", encryptData(result?.account))
  //       localStorage.setItem("p5n3b7j2k9s1a6wq8t0", encryptData(result?.tac))
  //       activeAccount(data?.email);

  //       // Broadcast login event to other tabs
  //       window.dispatchEvent(new Event('storage'));

  //       let last_page = await getCookie("redirectAfterLogin")

  //       // check term and condition
  //       // if (!result?.tac?.url || (result?.account?.f_t_and_c == true && (result?.account?.t_a_c_url || '') == (result?.tac?.url || ''))) { // ของบีม
  //       // if (result?.tac || (result?.account?.f_t_and_c == true && (result?.account?.t_a_c_url || '') == (result?.tac?.url || ''))) { // คมโมรอบที่ 1

  //       // if ((result?.account?.f_t_and_c == true)) { // อย่าให้มีครั้งที่ 2
  //       // if (result?.tac?.url == result?.account?.t_a_c_url) { // อย่าให้มีครั้งที่ 3 ตรงนี้เช็คว่า t&c ที่ accept ไปเท่ากับของใหม่หรือป่าว ถ้าเท่าก็ผ่านเข้าระบบไปเลย

  //       // case t and c หมดอายุ หรือไม่มี
  //       if (result?.tac == null) { // อันนี้คือไม่ได้ set t and c ไว้ใน dam หรือหมดอายุแล้ว จะผ่านเข้าไปเลย
  //         if (result?.account?.password_gen_flag == true || result?.account?.account_password_check?.length <= 0) {
  //           // go to reset password page
  //           // router.push(`/en/reset-password?ref=${result?.token}`);
  //           gotoResetPassword(result?.token);
  //         } else {
  //           if (last_page && last_page !== "/en/reset-password") {
  //             router.push(`${last_page}`);
  //           } else {
  //             router.push("/en/authorization");
  //           }
  //         }
  //       } else if (result?.tac?.url == result?.account?.t_a_c_url) { // อย่าให้มีครั้งที่ 3 ตรงนี้เช็คว่า t&c ที่ accept ไปเท่ากับของใหม่หรือป่าว ถ้าเท่าก็ผ่านเข้าระบบไปเลย

  //         // if ( result?.account?.f_t_and_c == true ) {

  //         // ถ้า password_gen_flag == true ให้ route ไปหน้า reset password
  //         // if account_password_check?.length = 0 ให้ route ไปหน้า reset password
  //         // if (result?.account?.account_password_check?.length <= 0) {

  //         if (result?.account?.password_gen_flag == true || result?.account?.account_password_check?.length <= 0) {
  //           // go to reset password page
  //           // router.push(`/en/reset-password?ref=${result?.token}`);
  //           gotoResetPassword(result?.token);
  //         } else {
  //           if (last_page && last_page !== "/en/reset-password") {
  //             router.push(`${last_page}`);
  //           } else {
  //             router.push("/en/authorization");
  //           }
  //         }

  //       } else {
  //         // please accept term
  //         setTac(result?.tac)
  //         // setTac(result?.account?.t_a_c_url)
  //         setpopuptc(true);
  //         setIsLoading(false)
  //       }
  //     }

  //   } else {
  //     if (
  //       result?.response?.data?.statusCode == 401 ||
  //       result?.response?.data?.statusCode == 500 ||
  //       result?.response?.data?.statusCode == 412 ||
  //       result?.response?.data?.statusCode == 403 ||
  //       result?.response?.data?.status == 401 ||
  //       result?.response?.data?.status == 500 ||
  //       result?.response?.data?.status == 412 ||
  //       result?.response?.data?.status == 403
  //     ) {
  //       if (result?.response?.data?.statusCode == 401 || result?.response?.data?.statusCode == 500) { // user หรือ email ผิด
  //         setisModalTxt("Invalid email or password. Please try again.")
  //         handleFaildlgn(data?.email);
  //       } else if (result?.response?.data?.statusCode == 412 || result?.response?.data?.status == 412) { // PASSWORD หมดอายุ

  //         setisModalTxt(result?.response?.data?.error ? result?.response?.data?.error : "Your password has expired. Please update it, as passwords must be changed every 90 days for security purposes.")

  //         if (result?.response?.data?.error == "Your password has expired. Please update it, as passwords must be changed every 90 days for security purposes.") {
  //           // // v1.0.90 ควรไปที่หน้า reset password ถ้า user/password ถูก https://app.clickup.com/t/86ernzvhr
  //           // // ให้กด modal ก่อนค่อยไปหน้า reset
  //           // router.push(`/en/reset-password?ref=${result?.token}`);
  //           setTempToken(result?.response?.data?.token)
  //           setModeAcceptModal('password-expire')
  //         }

  //       } else if (result?.response?.data?.status == 403) {
  //         setisModalTxt(result?.response?.data?.error || result?.response?.error ? result?.response?.data?.error || result?.response?.error : "Login mode does not match. Please contact the administrator.")
  //       }
  //       await clearCookiesAndLocalStorage();
  //       setisModalOpen(true);
  //     } else if (result?.response?.data?.status == 503) {
  //       const logDate = result?.response?.data?.data?.logDate;
  //       const formattedLogDate = logDate?.split(":").slice(0, 2).join(":");

  //       setislockedTxt(
  //         <div>
  //           <div>{"Your account has been locked due to 3 failed attempts."}</div>
  //           {/* <div>{"It will be unlocked after " + result?.response?.data?.data?.logDate}</div> */}
  //           <div>{"It will be unlocked after " + formattedLogDate}</div>
  //         </div>
  //       )
  //       setisModallocked(true);
  //     } else if (result?.response?.data?.status == 400) {
  //       // setisModalTxt("Your account already logged-in in another device.")
  //       await clearCookiesAndLocalStorage();
  //       setisModalTxt(result?.response?.data?.error)
  //       setisModalOpen(true);
  //     }

  //     if (resetForm) resetForm();
  //     setIsLoading(false)
  //   }
  // };


  // #region LOGIN
  const handleFormSubmit = async (data: any) => {
    console.log('.........');
    setIsLoading(true)

    data.email = data.email.toLowerCase();
    data.password = data.password.trim(); // 2025-01-30 ใส่ไว้ให้พี่แซ๊คเทส
    setDataEmail(data)

    const result = await postService('/master/account-manage/account-local', data);
    setResLogin(result)

    const statusCode = result?.response?.data?.statusCode ?? result?.response?.data?.status ?? result?.status ?? result?.statusCode ?? result?.code ?? result?.response?.status;
    const errorMsg = result?.response?.data?.error ?? result?.data?.error ?? result?.response?.error ?? result?.error;

    if (!statusCode) {
      if (statusCode == "ERR_NETWORK") {
        seterrorNetworkTricker(true);
        setIsLoading(false)
      } else {
        setCookie("v4r2d9z5m3h0c1p0x7l", result?.token, 1);
        // localStorage.setItem("dev_mode_token", result?.token)
        localStorage.setItem("v4r2d9z5m3h0c1p0x7l", encryptData(result?.token))
        localStorage.setItem("x9f3w1m8q2y0u5d7v1z", encryptData(result?.account))
        localStorage.setItem("p5n3b7j2k9s1a6wq8t0", encryptData(result?.tac))
        activeAccount(data?.email);

        // Broadcast login event to other tabs
        window.dispatchEvent(new Event('storage'));

        let last_page = await getCookie("redirectAfterLogin")

        // case t and c หมดอายุ หรือไม่มี
        if (result?.tac == null) { // อันนี้คือไม่ได้ set t and c ไว้ใน dam หรือหมดอายุแล้ว จะผ่านเข้าไปเลย
          if (result?.account?.password_gen_flag == true || result?.account?.account_password_check?.length <= 0) {
            // go to reset password page
            // router.push(`/en/reset-password?ref=${result?.token}`);
            gotoResetPassword(result?.token);
          } else {
            if (last_page && last_page !== "/en/reset-password") {
              router.push(`${last_page}`);
            } else {
              router.push("/en/authorization");
            }
          }
        } else if (result?.tac?.url == result?.account?.t_a_c_url) { // อย่าให้มีครั้งที่ 3 ตรงนี้เช็คว่า t&c ที่ accept ไปเท่ากับของใหม่หรือป่าว ถ้าเท่าก็ผ่านเข้าระบบไปเลย

          // if ( result?.account?.f_t_and_c == true ) {

          // ถ้า password_gen_flag == true ให้ route ไปหน้า reset password
          // if account_password_check?.length = 0 ให้ route ไปหน้า reset password
          // if (result?.account?.account_password_check?.length <= 0) {

          if (result?.account?.password_gen_flag == true || result?.account?.account_password_check?.length <= 0) {
            // go to reset password page
            // router.push(`/en/reset-password?ref=${result?.token}`);
            gotoResetPassword(result?.token);
          } else {
            if (last_page && last_page !== "/en/reset-password") {
              router.push(`${last_page}`);
            } else {
              router.push("/en/authorization");
            }
          }

        } else {
          // please accept term
          setTac(result?.tac)
          // setTac(result?.account?.t_a_c_url)
          setpopuptc(true);
          setIsLoading(false)
        }
      }

    } else {

      if ([401, 403, 412, 500].includes(Number(statusCode))) {
        if (statusCode == 401 || statusCode == 500) { // user หรือ email ผิด
          setisModalTxt("Invalid email or password. Please try again.")
          handleFaildlgn(data?.email);
        } else if (statusCode == 412) { // PASSWORD หมดอายุ
          setisModalTxt(errorMsg ? errorMsg : "Your password has expired. Please update it, as passwords must be changed every 90 days for security purposes.")

          if (errorMsg == "Your password has expired. Please update it, as passwords must be changed every 90 days for security purposes.") {
            // // v1.0.90 ควรไปที่หน้า reset password ถ้า user/password ถูก https://app.clickup.com/t/86ernzvhr
            // // ให้กด modal ก่อนค่อยไปหน้า reset
            // router.push(`/en/reset-password?ref=${result?.token}`);
            setTempToken(result?.response?.data?.token ?? result?.data?.token ?? result?.token)
            setModeAcceptModal('password-expire')
          }

        } else if (statusCode == 403) {
          setisModalTxt(errorMsg ? errorMsg : "Login mode does not match. Please contact the administrator.")
        }
        await clearCookiesAndLocalStorage();
        setisModalOpen(true);
      } else if (statusCode == 503) {
        const logDate = result?.response?.data?.data?.logDate ?? result?.data?.logDate ?? result?.logDate;
        const formattedLogDate = logDate?.split(":").slice(0, 2).join(":");

        setislockedTxt(
          <div>
            <div>{"Your account has been locked due to 3 failed attempts."}</div>
            <div>{"It will be unlocked after " + formattedLogDate}</div>
          </div>
        )
        setisModallocked(true);
      } else if (statusCode == 400) {
        await clearCookiesAndLocalStorage();
        setisModalTxt(errorMsg)
        setisModalOpen(true);
      }

      if (resetForm) resetForm();
      setIsLoading(false)
    }
  };

  const handleFaildlgn = async (mail: any) => {
    let newdata: any = logFailed ? logFailed : [];
    let findmail: any = newdata?.findIndex((item: any) => item?.mail == mail);

    if (findmail >= 0) {
      if (newdata[findmail]?.count <= 2) {
        newdata[findmail].count = Number(newdata[findmail]?.count + 1);
      } else if (newdata[findmail]?.count == 3) {
        newdata[findmail].count = 1;
      }
      disableAccount(newdata[findmail]?.mail, Number(newdata[findmail]?.count));
    } else {
      newdata.push({
        "mail": mail,
        "count": 1,
      });

      setlogFailed((pre: any) => newdata);
      settk(!tk);
      disableAccount(mail, 1);
    }

    setCookie("logFailed", JSON.stringify(newdata), 1);
  }

  const activeAccount = async (mail: any) => {
    let newdata: any = logFailed ? logFailed : [];
    let findmail: any = newdata?.findIndex((item: any) => item?.mail == mail);
    if (findmail >= 0) {
      newdata.splice(findmail, 1);
      if (newdata?.length > 0) {
        setlogFailed((pre: any) => newdata);
        settk(!tk);
        setCookie("logFailed", JSON.stringify(newdata), 1);
      } else if (newdata?.length == 0) {
        setlogFailed(undefined);
        settk(!tk);
        deleteCookie("logFailed");
      }
    }
  }

  const disableAccount = async (mail: any, count: number) => {
    let body: any = {
      "email": mail,
      "count": count
    }

    const result = await postService('/master/account-manage/login-check-count', body);
  }

  // http://localhost:5001/en/reset-password?ref=eyJhbGc...TOKEN...NiIsInR5cCI6Ik....TOKEN
  const acceptTerm = async (data?: any) => {
    // let tokenFromLcstr: any = localStorage?.getItem("v4r2d9z5m3h0c1p0x7l");
    // let userData: any = localStorage?.getItem("x9f3w1m8q2y0u5d7v1z");
    // const res_tandc_accept = await postService('/master/account-manage/account-local-tandc')

    try {
      const res_tandc_accept = await axios.post(`${API_URL}/master/account-manage/account-local-tandc`, {}, { headers: { Authorization: `Bearer ${resLogin?.token}` } })
      setIsAcceptTc(true)
    } catch (error) {
      throw error;
    }

    setpopuptc(false);

    let last_page = await getCookie("redirectAfterLogin")
    if (resLogin?.account?.account_password_check?.length <= 0) {
      // go to reset password page
      router.push(`/en/reset-password?ref=${resLogin?.token}`);
    } else {
      if (last_page && last_page !== "/en/reset-password") {
        router.push(`${last_page}`);
      } else {
        router.push("/en/authorization");
      }
    }
  }

  const handleClickSSO = () => {
    localStorage.setItem("cxv2ao10xumw84vi0", encryptData(1))
    window.dispatchEvent(new Event("storage"));
  }

  const [errorNetworkTricker, seterrorNetworkTricker] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const newValue = encryptData(2);
      let oldValue = localStorage.getItem("cxv2ao10xumw84vi0");
      oldValue = oldValue ? decryptData(oldValue) : null;
      if (oldValue !== '2') {
        localStorage.setItem("cxv2ao10xumw84vi0", newValue);
        window.dispatchEvent(new Event("storage"));
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const syncLoadingFromStorage = () => {
      let is_loading: any = localStorage?.getItem("cxv2ao10xumw84vi0");
      is_loading = is_loading ? decryptData(is_loading) : null;
      setIsLoading(is_loading === "1");
    };

    syncLoadingFromStorage();

    const handleCustomChange = () => {
      syncLoadingFromStorage();
    };

    window.addEventListener("storage", handleCustomChange);

    return () => {
      window.removeEventListener("storage", handleCustomChange);
    };
  }, []);

  useEffect(() => {
    console.log('build date: 2026-05-08 15:09')
  }, [])

  return (
    <section
      className=" h-[100vh] overflow-y-hidden bg-cover bg-center"
      style={{
        backgroundImage: bgUrl ? `url('${bgUrl}')` : "url('/assets/image/bg_menu_02.png')",
      }}
    >
      <div className="w-full h-full flex justify-center items-center">
        <div className="bg-white h-auto rounded-[20px] custom-layout-un-auth relative">

          <div className="w-full flex justify-center items-center mt-[1rem] panel-logo-customer">
            <Image
              className="logo-customer"
              src={`/assets/icon/ptt-logo-2.svg`}
              width={170}
              height={30}
              alt={`/assets/icon/ptt-logo-2.svg`}
              priority
            />
          </div>
          <div className="text-center text-[#2B2A87] text-[1.8rem] font-bold mb-[2rem]">{mode == "mode1" ? "TPA System" : "Local Mode"}</div>
          {mode == "mode1" ?
            <div>
              <div className="px-[3rem]">
                {/* <button className="w-full h-[50px] bg-[#2B2A87] text-white mb-4 font-semibold rounded-lg tracking-wide">{"LOG IN FOR PTT USER"}</button>
                <button className="w-full h-[50px] bg-[#00ADEF] text-white rounded-lg tracking-wide">{"LOG IN FOR EXTERNAL"}</button> */}

                <div>
                  <ExternalLoginComponent
                    isLoading={isLoading}
                  />
                </div>

              </div>
              {/* <div
                className="mt-[2rem] mb-[3rem] px-[3rem] h-auto float-right text-[#B2B8BB] cursor-pointer hover:text-[#00ADEF]"
                onClick={() => setmode("mode2")}
              >
                <span className="underline">{"Local Login"}</span>
              </div> */}

              <div
                className={`mt-[2rem] mb-[3rem] px-[3rem] h-auto float-right cursor-default 
                  ${isPttEnv ? "opacity-0" : "opacity-100"}`}
                onClick={() => setmode("mode2")}
              >
                <span>{"Local Login"}</span>
              </div>
              <div className="mt-[2rem] mb-[3rem] px-[3rem] h-auto float-left text-sm font-semibold text-[#B2B8BB]">{`v${webVersion}`}</div>
            </div>
            :
            <div>
              <div id="form-signin">
                <FormSignin
                  lng={lng}
                  onSubmit={handleFormSubmit}
                  setResetForm={setResetForm}
                  isLoading={isLoading}
                />
              </div>
              <div
                className="mt-[2rem] mb-[2rem] px-[2rem] h-auto text-center text-[#B2B8BB] cursor-pointer hover:text-[#8f9497]"
                onClick={() => setmode("mode1")}
              >
                <span className="underline text-[#4B5563]">{"Back"}</span>
              </div>
            </div>
          }
        </div>
      </div>

      <PopupTandC
        width={1100}
        open={popuptc}
        tac={tac}
        onClose={() => {
          mutateLogout().then(response => {
            if (resetForm) {
              resetForm()
            }
            setpopuptc(false);
          });
        }}
        onSubmit={() => acceptTerm('test')}
      />

      <NetworkErrorPopup
        width={500}
        open={errorNetworkTricker}
        onClose={() => {
          mutateLogout().then(response => {
            if (resetForm) {
              resetForm();
            }
            seterrorNetworkTricker(false);
          });
        }}
      />

      {/* NEW MODAL ANOTHER DEVICE */}
      <ModalComponent
        open={isModalOpen}
        handleClose={async (e: any) => {
          setisModalOpen(false);
          setisModalTxt("");

          if (modeAcceptModal == 'password-expire') {
            setModeAcceptModal('')
            // v1.0.90 ควรไปที่หน้า reset password ถ้า user/password ถูก https://app.clickup.com/t/86ernzvhr
            // ให้กด modal ก่อนค่อยไปหน้า reset
            setTimeout(() => {
              router.push(`/en/reset-password?ref=${tempToken}`);
            }, 300);
          }

          if (e == "cancle") { // login anyway
            let user_email = {
              email: dataEmail?.email
            }

            const res_post_clear: any = await postServiceNoAuth(`/master/account-manage/update-flag-logout-email`, user_email); // clear login_flag

            // handleSendNotification(dataEmail); // ส่ง gotify ไปบอก user ว่ามีคน login ซ้อน
            handleLoginAnyway(dataEmail) // login

          } else if (e == "submit") { // no login
          }
          setModeAcceptModal('')
        }}

        title="Failed"
        description={isModalTxt}
        stat="error"
        // btntxt="Continue"
        // btnmode="split"
        // btnmode={isModalTxt == "Invalid email or password. Please try again." || isModalTxt ==  "Invalid username or password." || isModalTxt == "Your password has expired. Please update it, as passwords must be changed every 90 days for security purposes." ? "single" : "split"}
        btnmode={isModalTxt == "Your account already logged-in in another device." ? "split" : "single"}
        btnsplit1="OK"
        btnsplit2="Login anyway"
      />

      <ModalComponent
        open={isModallocked}
        handleClose={() => {
          setisModallocked(false);
          setislockedTxt("");
          // setTimeout(() => {
          //   router.push(`/${lng}/signin`)
          // }, 300);
        }}
        title="Failed"
        description={islockedTxt}
        stat="error"
        btntxt="Continue"
      />

      {announcement?.length > 0 && (
        <footer className="fixed bottom-0 left-0 w-full bg-[#0D539A80] text-white h-[50px] flex items-center">
          <Marquee className="w-full">
            <aside className="w-full flex items-center justify-center">
              {announcement?.map((item: any) => (
                <section key={item.id} className="flex items-center gap-2 py-2">
                  <CampaignIcon style={{ fontSize: "20px" }} />
                  <span className="font-semibold">{`${item.topic}`}</span>{`: ${item.detail}`}{` `}&nbsp;&nbsp;&nbsp;
                </section>
              ))}
            </aside>
          </Marquee>
        </footer>
      )}

    </section>
  );
};

export default SignInPage;