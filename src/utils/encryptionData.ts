import CryptoJS from "crypto-js";

const SECRET_KEY:any = process.env.NEXT_PUBLIC_RESPONSE_ENCRYPT_KEY
const KEY2:any = process.env.NEXT_PUBLIC_RESPONSE_ENCRYPT_KEY2

export const encryptData = (data: any) => {
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
  return encrypted;
};

export const decryptData = (ciphertext: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted;
  } catch (error) {
    return null;
  }
};

export const decryptResponse = (encryptedData:any) => {
   const key = CryptoJS.enc.Utf8.parse(KEY2);
   const decrypted = CryptoJS.AES.decrypt(encryptedData.encryptedData, key, {
    iv: CryptoJS.enc.Base64.parse(encryptedData.iv),
     mode: CryptoJS.mode.CBC,
     padding: CryptoJS.pad.Pkcs7,
   });

   const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

   try {
     return JSON.parse(decryptedText); // Convert JSON string to object if valid JSON
   } catch (error) {
     return decryptedText; // Return plain text if it's not JSON
   }

}