// // import client from '../../lib/redis';
// import client from '../../../../redis';
// import type { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse } from "next/server";

// export async function POST(request: any) {  
//   let body = await request.json()
//   let res = await client.set(body.key , body.value);
//   return NextResponse.json(res)
// }

// export async function GET(request: any) {  
//   const searchParams = await request.nextUrl.searchParams
//   const query = searchParams.get('key')
//   let res = await client.get(query);
//   return NextResponse.json(res)
// }