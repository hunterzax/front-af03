"use client";
import Cookies from 'js-cookie';

const getCookieValue = (cookieName:any) => {
    const token = Cookies.get(cookieName);
    return token
};

export default getCookieValue