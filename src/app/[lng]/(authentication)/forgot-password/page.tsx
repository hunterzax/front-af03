"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { getNoTokenService, postService } from "@/utils/postService";
import FormForgotPwd from "./form/form-forgot-pass";
import ModalComponent from "@/components/other/ResponseModal";
import TemplateMail from '@/components/other/rendermailTemplate';
import Spinloading from "@/components/other/spinLoading";

const ForgotPwdPage: React.FC<any> = (props) => {
  const { params: { lng }, } = props;
  const { t } = useTranslation(lng);
  const [isModalSuccess, setisModalSuccess] = useState<boolean>(false);
  const [modalSuccessMsg, setModalSuccessMsg] = useState('');
  const [isModalError, setisModalError] = useState<boolean>(false);
  const [resetForm, setResetForm] = useState<() => void | null>();
  const router = useRouter();

  const handleFormSubmit = async (data: any) => {
    setIsLoading(true);
    data.email = data.email.toLowerCase();

    const result = await postService('/master/account-manage/get-link', data);

    if (result?.link) {
      await renderTemplate(result?.link, data);
    } else {
      setisModalError(true);
      setIsLoading(false);
    }
  };

  const [bgUrl, setBgUrl] = useState("");
  const fetchData = async () => {
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
    fetchData();
  }, [])

  async function renderTemplate(link: any, data: any) {
    console.log('link : ', link);
    const bodyMail = await TemplateMail({
      header: "Reset Your Password",
      description: "A request has been received to reset the password for your account. <br/> Please click the button below to reset your password",
      btntxt: "Reset Password",
      url: link,
      mode: "resetmail"
    });

    let body: any = {
      "to": data?.email,
      "subject": "Reset Your Password",
      "body": JSON.parse(bodyMail),
      "attachments": [
        {
          filename: "logo-ptt.png",
          path: "/assets/email/logo-ptt.png",
          cid: "logo_ptt"
        },
        {
          filename: "email-img.png",
          path: "/assets/email/email-img.png",
          cid: "email_img"
        }
      ]
    }

    const result = await postService('/mail/send-email', body);

    if (result) {
      // Please check your email for the instructions to reset your password.
      setModalSuccessMsg("Please check your email for the instructions to reset your password.")
      setisModalSuccess(true);
    } else {
      setisModalError(true);
    }
  }

  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <section
      className=" h-[100vh] overflow-y-hidden bg-cover bg-center"
      style={{
        // backgroundImage:"url('/assets/image/bg_menu_02.png')",
        backgroundImage: bgUrl ? `url('${bgUrl}')` : "url('/assets/image/bg_menu_02.png')",

      }}
    >
      <div className="w-full h-full flex justify-center items-center">
        <div className="bg-white w-[500px] h-auto rounded-[20px] relative">
          <Spinloading spin={isLoading} rounded={20} /> {/* loading example here */}
          <div className="w-full h-[150px] flex justify-center items-center mt-[1rem]">
            <Image
              src={`/assets/icon/ptt-logo-2.svg`}
              width={150}
              height={30}
              alt={`/assets/icon/ptt-logo-2.svg`}
              priority
            />
          </div>
          <div className="text-center text-[#2B2A87] text-[28px] font-bold mb-[3rem]">{"Forgot Password"}</div>
          <div className="mb-10">
            <FormForgotPwd
              lng={lng}
              onSubmit={handleFormSubmit}
              setResetForm={setResetForm}
            />
          </div>
          <div
            className="mt-[2rem] mb-[3rem] px-[2rem] h-auto text-center text-[#B2B8BB] cursor-pointer hover:text-[#8f9497]"
            onClick={() => router.replace(`/${lng}/signin`)}
          >
            <span className="underline text-[#4B5563]">{"Back"}</span>
          </div>
          <ModalComponent
            open={isModalSuccess}
            handleClose={() => {
              setisModalSuccess(false);
              router.replace(`/${lng}/signin`)
            }}
            title="Success"
            // description="Your password has been successfully changed."
            description={modalSuccessMsg}
            stat="success"
          />
          <ModalComponent
            open={isModalError}
            handleClose={() => {
              setisModalError(false);
              setIsLoading(false)
              if (resetForm) resetForm();
            }}
            title="Failed"
            description={
              <div>
                <div className="text-center">
                  {"Not found user in the system."}
                </div>
                <div className="text-center">
                  {" Please contact administrator."}
                </div>
              </div>
            }
            stat="error"
          />
        </div>
      </div>
    </section>
  );
};

export default ForgotPwdPage;