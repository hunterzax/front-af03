import { EncryptStorage } from "encrypt-storage";
import globalConfig from "@/config/globalConfig";
import axios from "axios";

const encryptStorage = new EncryptStorage("secret-key", {
  prefix: globalConfig.GLOBALCONFIGKEY.PREFIX,
});

const Logout = () => {
  encryptStorage.clear();
};

const authRefresh = (token: any) => {
  const url: any = new URL(`${process.env.NEXT_PUBLIC_REACT_CA_AND_A_API_URL}jwt/getRefreshToken`);
  const access_token = {
    access_token: token.access_token,
  };
  return new Promise((resolve, reject) => {
    axios
      .post(url, access_token, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.refresh_token}`,
        },
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((reason) => {
        reject(reason);
      });
  });
};

const AuthenApi = {
  authRefresh,
  Logout,
};

export default AuthenApi;
