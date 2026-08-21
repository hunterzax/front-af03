import { decryptData } from "./encryptionData";

const getUserValue = () => {
    let getuserDT: any = localStorage?.getItem("x9f3w1m8q2y0u5d7v1z");
    getuserDT = getuserDT ? decryptData(getuserDT) : null;
    const userDT: any = getuserDT ? JSON.parse(getuserDT) : {}
    // const userDT: any = (typeof getuserDT === 'object') ? JSON.parse(getuserDT) : getuserDT;
    return userDT
};

export default getUserValue