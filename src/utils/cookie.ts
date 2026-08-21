export const deleteCookie = async (name: any) => {
  setCookie(name, null, 0);
};

export const deleteCookieCustom = async (name: any, damain: any) => {
  setCookieDelete(name, null, 0, damain);
};

export const setCookieDelete = (name: any, value: any, daysToExpire: any, domain: any) => {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + daysToExpire);

  const cookieValue =
    encodeURIComponent(name) +
    "=" +
    encodeURIComponent(value) +
    "; expires=" +
    expirationDate.toUTCString() +
    "; path=/; domain=" +
    domain +
    "; SameSite=None; Secure";

  document.cookie = cookieValue;
};

export const setCookie = async (name: any, value: any, daysToExpire: any) => {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + daysToExpire);

  const cookieValue =
    encodeURIComponent(name) +
    "=" +
    encodeURIComponent(value) +
    "; expires=" +
    expirationDate.toUTCString() +
    "; path=/";

  document.cookie = cookieValue;
};


// ปรับให้รองรับ SameSite / Secure / Domain / Path โดยยัง backward-compatible
// export const setCookie = (
//   name: string,
//   value: string,
//   daysToExpire: number,
//   options?: {
//     sameSite?: 'Strict' | 'Lax' | 'None';
//     secure?: boolean;    // ถ้าไม่ระบุ จะ auto จากโปรโตคอลปัจจุบัน
//     domain?: string;
//     path?: string;       // ดีฟอลต์ '/'
//   }
// ) => {
//   const { sameSite = 'Lax', domain, path = '/', secure } = options || {};

//   const isHttps = typeof location !== 'undefined' && location.protocol === 'https:';
//   // ถ้า SameSite=None ต้องกำกับ Secure เสมอ (สเปคเบราว์เซอร์)
//   // const useSecure = secure ?? isHttps || sameSite === 'None';
//   const useSecure = sameSite === 'None' ? true : (secure ?? isHttps);

//   const expirationDate = new Date();
//   expirationDate.setDate(expirationDate.getDate() + (Number.isFinite(daysToExpire) ? daysToExpire : 0));

//   let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Expires=${expirationDate.toUTCString()}; Path=${path}; SameSite=${sameSite}`;
//   if (domain) cookie += `; Domain=${domain}`;
//   if (useSecure) cookie += `; Secure`;

//   document.cookie = cookie;
// };


export const getCookie = async (name: any) => {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=");

    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
};
