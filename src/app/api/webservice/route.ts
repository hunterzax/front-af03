import { NextRequest, NextResponse } from "next/server";

export async function OPTIONS() {
  // ถ้าต้องให้ origin อื่นเรียก route นี้ได้ ให้ตั้งเป็นโดเมนของคุณแทน "*"
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization,access-token",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    // ดึง token จาก env (ห้ามฮาร์ดโค้ดใน client)
    const ACCESS_TOKEN = process.env.TPA_ACCESS_TOKEN ?? "";
    const JWT_COOKIE = process.env.TPA_JWT_COOKIE ?? "";

    const upstream = await fetch(
      "https://tpasystem-pre.pttplc.com/TPA_WEBCONFIG_UAT/Manage/AllMeter",
      {
        method: "GET",
        // ปิด cache เพื่อให้ได้ข้อมูลสด
        cache: "no-store",
        headers: {
          "access-token": ACCESS_TOKEN,
          Cookie: `jwt_token=${JWT_COOKIE}`,
        },
      }
    );

    // ส่งต่อสถานะและ header สำคัญ (อย่างน้อย content-type)
    const resHeaders = new Headers();
    const contentType = upstream.headers.get("content-type") || "application/json";
    resHeaders.set("content-type", contentType);

    // ถ้าต้องการให้ frontend ที่อยู่อีก origin เรียก route นี้ได้ ให้เปิด CORS ที่นี่
    resHeaders.set("Access-Control-Allow-Origin", "*");
    resHeaders.set("Access-Control-Expose-Headers", "content-type");

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: resHeaders,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: true, message: err?.message || "proxy failed" },
      { status: 500 }
    );
  }
}