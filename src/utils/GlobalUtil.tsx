import { EncryptStorage } from "encrypt-storage";
import globalConfig from "../config/globalConfig";
import _ from "lodash";

export const encryptStorage = new EncryptStorage("secret-key", {
    prefix: globalConfig.GLOBALCONFIGKEY.PREFIX,
});

// export const getApplicationName = (data: any) => {
//     return data.b2c === "Y" ? "B2C-" : "AD-";
// };

const decodeUFT8 = (str: string) => {
    return decodeURIComponent(escape(window.atob(str)));
};

const encodeBase64 = (str: string) => {
    return window.btoa(unescape(encodeURIComponent(str)));
};

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

export const genrateTranscriptID = () => {
    let d = new Date();
    let year = d.getFullYear().toString();
    let month = addZero(d.getMonth() + 1);
    let day = addZero(d.getDate());
    let hours = addZero(d.getHours());
    let minutes = addZero(d.getMinutes());
    let seconds = addZero(d.getSeconds());
    let ms = addZero(d.getMilliseconds(), 3);
    return year + month + day + hours + minutes + seconds + ms;
};

// const genCodeDDMMYYHHMMSS = (title: string) => {
//     const formatDate: string = moment(new Date()).format("DDMMYYhhmmss");
//     const code = `${title}_${formatDate}`;
//     return code;
// };

const addZero = (number: any, size = 2) => {
    let str = number.toString();
    while (str.length < size) {
        str = "0" + str;
    }
    return str;
};



const GlobalUtil = {
    genrateTranscriptID,
    // getApplicationName,
    decodeUFT8,
    encodeBase64,
    parseJwt,
};
export default GlobalUtil;
