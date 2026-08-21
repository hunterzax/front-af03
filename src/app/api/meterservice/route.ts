// app/api/tpa/all-meter/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const upstream = await fetch(
        "https://tpasystem-pre.pttplc.com/TPA_WEBCONFIG_UAT/Manage/AllMeter",
        {
            headers: {
                // ถ้าต้องการ cookie เพิ่ม: Cookie: `jwt_token=${process.env.TPA_JWT!}`
            },
            // อยากได้สด ๆ
            cache: "no-store",
        }
    );

    const headers = new Headers();
    headers.set(
        "content-type",
        upstream.headers.get("content-type") || "text/html; charset=utf-8"
    );

    return new NextResponse(upstream.body, {
        status: upstream.status,
        headers,
    });
}
