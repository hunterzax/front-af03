import axios from "axios";
import Swal from "sweetalert2";
import AuthenApi from "./AuthApi";
import globalConfig from "@/config/globalConfig";
import { EncryptStorage } from "encrypt-storage";
import GlobalUtil from "@/utils/GlobalUtil";
import { clearCookiesAndLocalStorage } from "@/utils/generalFormatter";

const encryptStorage = new EncryptStorage("secret-key", {
  prefix: globalConfig.GLOBALCONFIGKEY.PREFIX,
});

// const { instance } = useMsal();
let jwt = {
  access_token: "",
  refresh_token: "",
};
let jwtLocal: any = encryptStorage.getItem("jwt");
if (jwtLocal) {
  jwt = jwtLocal;
}

///////////////////////// Mock
// let loadToken: any = encryptStorage.getItem("loadToken");
// if (loadToken) {
//   jwt = loadToken.access_token;
// }
////////////////////////////

const parseJwt = (token: string) => {
  let base64Url = token.split(".")[1];
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  let jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
  return JSON.parse(jsonPayload);
};

const axiosApiInstance = axios.create();
// const dispatchPage: AppDispatch = useDispatch();

// Request interceptor for API calls
// Add a request interceptor
axiosApiInstance.interceptors.request.use(function (config: any) {
  let jwt: any = encryptStorage.getItem("jwt");
  if (jwt) {
    config.headers.Authorization = "Bearer " + jwt.access_token;
  }
  return config;
});

// Response interceptor for API calls
axiosApiInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async function (error) {
    try {
      //   return null
      if (error.response.status === 401) {
        return await checkJWT(error);
      } else if (error.response.status !== 200) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          Swal.fire({
            icon: "error",
            titleText: error.response.data.transaction_id
              ? `Transaction ID : ${error.response.data.transaction_id}`
              : "",
            html: `${GlobalUtil.decodeUFT8(
              error.response.data.response_message
            )}`,
          });
        } else if (error.request) {
          // The request was made but no response was received
          Swal.fire({
            icon: "error",
            html: `${error.request}`,
          });
        } else {
          // Something happened in setting up the request that triggered an Error
          Swal.fire({
            icon: "error",
            html: `${error.message}`,
          });
        }
      }
      return Promise.reject(error);
    } catch (error) { }
  }
);

const checkJWT = async (error: any) => {
  const originalRequest = error.config;
  try {
    originalRequest._retry = true;
    let jwt: any = encryptStorage.getItem("jwt");
    if (jwt) {
      // let tokenData: any = GlobalUtil.parseJwt(jwt.access_token);
      let tokenData: any = parseJwt(jwt.access_token);
      const currentTime = Math.floor(Date.now() / 1000);
      if (tokenData.exp < currentTime) {
        const token: any = await AuthenApi.authRefresh(jwt);
        if (token.result === "Error") {
          await clearCookiesAndLocalStorage(true);
          AuthenApi.Logout();
          window.location.reload();
          return;
        }
        let jwt_token;
        if (token.data) {
          jwt_token = JSON.parse(atob(token.data));
          encryptStorage.setItem("jwt", jwt_token);
        }
        axios.defaults.headers.common["Authorization"] = "Bearer " + jwt_token.access_token;
        return axiosApiInstance(originalRequest);
      }
    } else {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        Swal.fire({
          icon: "error",
          text: `${GlobalUtil.decodeUFT8(
            error.response.data.response_message
          )}`,
        });
      } else if (error.request) {
        // The request was made but no response was received
        Swal.fire({
          icon: "error",
          text: `${error.request}`,
        });
      } else {
        // Something happened in setting up the request that triggered an Error
        Swal.fire({
          icon: "error",
          text: `${error.message}`,
        });
      }
      return Promise.reject(error);
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      text: "Session expired please login again",
    }).then(async () => {
      await clearCookiesAndLocalStorage(true);
      AuthenApi.Logout();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    });
  }
};
export default axiosApiInstance;
