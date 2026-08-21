import acceptLanguage from "accept-language";
import { NextResponse, NextRequest } from "next/server";
import { fallbackLng, languages, cookieName } from "@/app/i18n/settings";

acceptLanguage.languages(languages);


export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
  runtime: 'nodejs',  // Explicitly using node runtime instead of edge runtime
};

// export function middleware(req: any) {

//   if (
//     req.nextUrl.pathname.indexOf("icon") > -1 ||
//     req.nextUrl.pathname.indexOf("chrome") > -1
//   ) {
//     // Skipping middleware for icon or chrome
//     return NextResponse.next();
//   }

//   let lng = req.cookies.get(cookieName);

//   if (!lng) lng = acceptLanguage.get(req.headers.get("Accept-Language"));

//   if (!lng) lng = fallbackLng;



//   if (req.nextUrl.pathname === "/") {
//     return NextResponse.redirect(new URL(`/${lng.value || 'en'}${req.nextUrl.pathname}/signin`, req.url));
//   }

//   // ######## check หน้าที่ไม่มีสิทธิเข้า ########
//   // const url = req.nextUrl.clone();
//   // const { pathname } = url;
//   // const restrictedPages = ["/restricted-page", "/another-restricted-page"];
//   // // const token = req.cookies.get("authToken");
//   // const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");

//   // // If accessing a restricted page without a token, redirect to login
//   // if (restrictedPages.includes(pathname) && !token) {
//   //    //ไม่มี token
//   //   url.pathname = "/en/signin";  
//   //   return NextResponse.redirect(url);
//   // } else if(!restrictedPages.includes(pathname) && token) {
//   // //มี token แต่ไม่มีสิทธิ
//   //   url.pathname = "/en/authorization"; 
//   //   return NextResponse.redirect(url);
//   // }

//   // const redirectPaths = [
//   //   "/en/authorization/dam",
//   //   "/en/authorization/dam/userManagement/group/tso",
//   //   "/en/authorization/dam/userManagement/group/shippers",
//   //   "/en/authorization/dam/userManagement/group/other",
//   //   "/en/authorization/dam/userManagement/divisions",
//   //   "/en/authorization/dam/userManagement/users",
//   //   "/en/authorization/dam/userManagement/roles",
//   //   "/en/authorization/dam/userManagement/systemLogin",
//   //   "/en/authorization/dam/Assets/zone",
//   //   "/en/authorization/dam/Assets/area",
//   //   "/en/authorization/dam/Assets/configMasterPath",
//   //   "/en/authorization/dam/Assets/contractPoint",
//   //   "/en/authorization/dam/Assets/nominationPoint",
//   //   "/en/authorization/dam/Assets/nonTpaPoint",
//   //   "/en/authorization/dam/Assets/meteredPoint",
//   //   "/en/authorization/dam/Assets/conceptPoint",
//   //   "/en/authorization/dam/parameters/nomiDeadline",
//   //   "/en/authorization/dam/parameters/planDeadline",
//   //   "/en/authorization/dam/parameters/announcement",
//   //   "/en/authorization/dam/parameters/systemParameter",
//   //   "/en/authorization/dam/parameters/emailNotiManage",
//   //   "/en/authorization/dam/parameters/userGuide",
//   //   "/en/authorization/dam/parameters/auditLog",
//   //   "/en/authorization/dam/parameters/capacityPublicRemark",
//   //   "/en/authorization/dam/parameters/setupBackground",
//   //   "/en/authorization/dam/parameters/termAndCondition",
//   //   "/en/authorization/dam/parameters/bookingTemplate",
//   //   "/en/authorization/dam/parameters/modeZoneBaseInven",
//   //   "/en/authorization/booking",
//   //   "/en/authorization/booking/bulletinBoard",
//   //   "/en/authorization/booking/capacity/CapPublication",
//   //   "/en/authorization/booking/capacity/CapacityChart",
//   //   "/en/authorization/booking/capacity/CapReqMgn",
//   //   "/en/authorization/booking/capacity/CapContractList",
//   //   "/en/authorization/booking/release/ReleaseCapSubmission",
//   //   "/en/authorization/booking/release/ReleaseCapManagement",
//   //   "/en/authorization/booking/release/ReleaseSumManagement",
//   //   "/en/authorization/booking/useItOrLoseIt",
//   //   "/en/authorization/booking/reserveBalGasContracts",
//   //   "/en/authorization/booking/pathManagement",
//   //   "/en/authorization/planning",
//   //   "/en/authorization/planning/planningDashboard",
//   //   "/en/authorization/planning/planningFileSubmissionTemplate",
//   //   "/en/authorization/planning/planningSubmissionFiles",
//   //   "/en/authorization/planning/planningQueryShipperFiles",
//   //   "/en/authorization/planning/planningNewPoint",
//   // ];

//   //  // Check if the user is trying to access a specific route
//   // //  if (req.nextUrl.pathname === "/en/authorization/planning") {
//   //  if (redirectPaths.includes(req.nextUrl.pathname)) {
//   //   return NextResponse.redirect(new URL(`/en/authorization`, req.url));
//   // }

//   // Redirect if lng in path is not supported
//   if (
//     !languages.some((loc) => req.nextUrl.pathname.startsWith(`/${loc}`)) &&
//     !req.nextUrl.pathname.startsWith("/_next")
//   ) {
//     return NextResponse.redirect(
//       new URL(`/${lng.value || 'en'}${req.nextUrl.pathname}`, req.url)
//     );
//   }

//   // Check for auth_token in cookies
//   // const v4r2d9z5m3h0c1p0x7l = req.cookies.get('v4r2d9z5m3h0c1p0x7l');

//   // #region middleware redirect
//   // if (!v4r2d9z5m3h0c1p0x7l && req.nextUrl.pathname.includes('/authorization')) {
//   //   return NextResponse.redirect(new URL(`/${'en'}/signin`, req.url));
//   // }

//   const response: any = NextResponse.next();

//   // Remove X-Frame-Options header if it exists
//   response.headers.delete('X-Frame-Options');

//   // Optionally, you can set a Content-Security-Policy header to allow iframes
//   response.headers.set(
//     'Content-Security-Policy',
//     "frame-ancestors 'self' *" // Allows embedding from any origin
//   );


//   if (req.headers.has("referer")) {
//     const refererUrl = new URL(req.headers.get("referer") || "");
//     const lngInReferer = languages.find((l) =>
//       refererUrl.pathname.startsWith(`/${l}`)
//     );
//     const response: any = NextResponse.next();

//     if (lngInReferer) response.cookies.set(cookieName, lngInReferer);

//     return response;
//   }

//   return NextResponse.next();
// }


const getCanonicalHost = () => {
  const urlFromEnv = process.env.NEXT_PUBLIC_API_URL_LOGIN_PAGE
  if (!urlFromEnv) return null
  try {
    // รองรับทั้งแบบมี/ไม่มี protocol
    const u = urlFromEnv.startsWith('http') ? new URL(urlFromEnv) : new URL(`https://${urlFromEnv}`)

    return u.hostname // -> "tpasystem-pre.pttplc.com"
  } catch {
    return null
  }
}

const SKIP_PREFIXES = ['/_next', '/favicon', '/assets', '/api']
const CANONICAL_HOST = getCanonicalHost() || 'tpasystem-pre.pttplc.com' // fallback ไว้กันพัง

export function middleware(req: NextRequest) {
  const url = req.nextUrl

  // 0) ข้ามบาง resource
  if (
    url.pathname.includes('icon') ||
    url.pathname.includes('chrome') ||
    SKIP_PREFIXES.some((p) => url.pathname.startsWith(p))
  ) {
    return NextResponse.next()
  }

  // 1) บังคับ canonical host (ตัด www)
  if (url.hostname === `www.${CANONICAL_HOST}`) {
    const to: any = new URL(url)
    to.hostname = CANONICAL_HOST
    return NextResponse.redirect(to, 308)
  }

  // 2) i18n: หา language จาก cookie / header
  let lng = req.cookies.get(cookieName)
  if (!lng) lng = acceptLanguage.get(req.headers.get('Accept-Language') || undefined) as any
  const activeLng = (lng as any)?.value || (lng as any) || fallbackLng

  // 3) root → /{lng}/signin
  if (url.pathname === '/') {
    // เดิมมี "//signin" เลยแก้ให้เป็น path ตรง ๆ
    const to = new URL(`/${activeLng}/signin`, req.url)
    return NextResponse.redirect(to)
  }

  // 4) ถ้า path ไม่ได้ขึ้นต้นด้วยภาษาที่รองรับ ให้ prepend
  const isLngInPath = languages.some((loc: string) => url.pathname.startsWith(`/${loc}`))
  if (!isLngInPath) {
    const to = new URL(`/${activeLng}${url.pathname}${url.search}`, req.url)
    return NextResponse.redirect(to)
  }

  // 5) สร้าง response เพื่อตั้ง header ความปลอดภัย + จัด referer cookie
  const res = NextResponse.next()

  // ลบ X-Frame-Options (ถ้ามี)
  res.headers.delete('X-Frame-Options')

  // อนุญาตให้ embed ใน iframe (ปรับตามนโยบายจริงขององค์กรได้)
  res.headers.set('Content-Security-Policy', `frame-ancestors 'self' *`)

  // 6) ตั้ง cookie ภาษา จาก referer (ถ้ามี)
  if (req.headers.has('referer')) {
    try {
      const refererUrl = new URL(req.headers.get('referer') || '')
      const lngInReferer = languages.find((l: string) => refererUrl.pathname.startsWith(`/${l}`))
      if (lngInReferer) {
        res.cookies.set(cookieName, lngInReferer)
      }
    } catch {
      // ignore bad referer
    }
  }

  return res
}