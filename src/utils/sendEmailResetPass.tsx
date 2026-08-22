import templateMail from "@/components/other/rendermailTemplate";
import { postService } from "./postService";
const LOGIN_PAGE_URL = process.env.NEXT_PUBLIC_API_URL_LOGIN_PAGE

export const sendEmailResetPassword = async (data: any, mode?:any, pwd?:any) => {
    const resultLink: any = await postService('/master/account-manage/get-link', data);


    if (resultLink?.link) {
        const bodyMail = await templateMail({
            header: "Activate Account",
            description: "Activate Account",
            btntxt: "Activate Account",
            url: LOGIN_PAGE_URL,
            pwd: pwd,
            mode: mode
        });

        let body: any = {
            "to": data?.email,
            "subject": "Reset Your Password",
            "body": JSON.parse(bodyMail)
        }
        await postService('/mail/send-email', body);

    }
};