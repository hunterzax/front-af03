"use client";
import Image from "next/image";
// import { useTranslation } from "@/app/i18n";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { getNoTokenService, getService, postService, postServiceNoAuth } from "@/utils/postService";
import ModalComponent from "@/components/other/ResponseModal";
import FormResetPwd from "./form/form-reset-pass";
import { clearCookiesAndLocalStorage } from "@/utils/generalFormatter";
import { useLogout } from "@/utils/logoutFunc";

const ResetPwdPage: React.FC<any> = (props) => {
  const { params: { lng }, } = props;
  const { t } = useTranslation(lng);
  const [isModalOpen, setisModalOpen] = useState<boolean>(false);
  const [modalErrorMsg, setModalErrorMsg] = useState('');
  const [isModalErrorOpen, setModalErrorOpen] = useState(false);
  const { mutateLogout } = useLogout();

  const [resetForm, setResetForm] = useState<() => void | null>();
  const router = useRouter();

  let page = window?.location?.href.split("ref=");
  let pageTOKEN: any = page[1];

  const handleFormSubmit = async (password: any) => {

    let data_reset = {
      "ref": pageTOKEN,
      "password": password
    }

    const result = await postService('/master/account-manage/reset-password', data_reset);
    const statusCode = result?.response?.data?.statusCode ?? result?.response?.data?.status ?? result?.status ?? result?.statusCode ?? result?.code ?? result?.response?.status;
    const errorMsg = result?.response?.data?.key ?? result?.data?.key;

    if (statusCode === 400 || statusCode === 500) {
      setModalErrorMsg(errorMsg ? errorMsg : "This password has been used before. Please choose a new password.");
      setModalErrorOpen(true)
    } else {
      const res_update_flag_logout: any = await getService(`/master/account-manage/update-flag-logout`);
      await clearCookiesAndLocalStorage();
      setisModalOpen(true);
    }

  };

// google.com/url?q=http://localhost:5001/en/reset-password?ref%3DeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0LCJ1c2VybmFtZSI6InRlZXJhcG9uZy5zb25nc2FuQGdtYWlsLmNvbSIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3ODIzNzEwMDksImV4cCI6MTc4MjM3MjgwOX0.pukQlsX-2lPLiHLQOMSa4ENOmGGKdxTKZnuchqUCjr8&source=gmail&ust=1782457681325000&usg=AOvVaw1KtW2is0A1u5lAUxGorCf1
  
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

  return (
    <section
      className=" h-[100vh] overflow-y-hidden bg-cover bg-center"
      style={{
        // backgroundImage: "url('/assets/image/bg_menu_02.png')",
        backgroundImage: bgUrl ? `url('${bgUrl}')` : "url('/assets/image/bg_menu_02.png')",
      }}
    >
      <div className="w-full h-full flex justify-center items-center">
        <div className="bg-white w-[500px] h-auto rounded-[20px]">
          <div className="w-full h-[150px] flex justify-center items-center mt-[1rem]">
            <Image
              src={`/assets/icon/ptt-logo-2.svg`}
              width={150}
              height={30}
              alt={`/assets/icon/ptt-logo-2.svg`}
              priority
            />
          </div>
          <div className="text-center text-[#2B2A87] text-[28px] font-bold mb-[3rem]">{"Reset Your Password"}</div>
          <div className="mb-10">
            <FormResetPwd
              lng={lng}
              onSubmit={handleFormSubmit}
              setResetForm={setResetForm}
            />
          </div>
          <div
            className="mt-[2rem] mb-[3rem] px-[2rem] h-auto text-center text-[#B2B8BB] cursor-pointer hover:text-[#8f9497]"
            onClick={() => {
              mutateLogout();
              router.replace(`/${lng}/signin`)
            }
            }
          >
            <span className="underline text-[#4B5563]">{"Back"}</span>
          </div>
          <ModalComponent
            open={isModalOpen}
            handleClose={() => {
              setisModalOpen(false);
              setTimeout(() => {
                router.replace(`/${lng}/signin`)
              }, 300);
            }}
            title="Success"
            description="Your password has been successfully changed."
          />
          <ModalComponent
            open={isModalErrorOpen}
            handleClose={() => {
              setModalErrorOpen(false);
              if (resetForm) resetForm();
            }}
            title="Failed"
            description={
              <div>
                <div className="text-center">
                  {`${modalErrorMsg}`}
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

export default ResetPwdPage;