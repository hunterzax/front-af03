import { useRouter } from "next/navigation";
import { setCookie } from "@/utils/cookie";
import { getService } from "./postService";
import { clearCookiesAndLocalStorage } from "./generalFormatter";

export const useLogout = () => {
  const router = useRouter();

  const mutateLogout = async () => {
    const { default: AuthenApi } = await import('@/app/api/AuthApi') // ต้อง import แบบนี้ไม่งั้นตอน build แตก

    try {
      // update flag login to false
      const resUpdateFlagLogin: any = await getService(`/master/account-manage/update-flag-logout`);

      if (resUpdateFlagLogin?.success) {
        await clearCookiesAndLocalStorage();
        await AuthenApi.Logout()
        console.log("Logout successfully");
      } else {
        // Logout flag update failed:
      }

      clearCookiesAndLocalStorage();

      setTimeout(() => {
        router.replace("/en/signin");
      }, 300);
    } catch (error) {
      // Error during logout
    }
  };

  return { mutateLogout };
};