import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '100';
    const since = searchParams.get('since');
    const userEmail = searchParams.get('userEmail');
    let userTypeIdList: any[] = [];


    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }
    else{
      const authToken = request.headers.get('Authorization');
      if(!authToken) {
        return NextResponse.json(
          { error: 'Authorization token is required' },
          { status: 400 }
        );
      }
      try {
        const userTypeResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/master/account-manage/account-user-type`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `${authToken}`
            },
          }
        );


        if (!userTypeResponse.ok || userTypeResponse.statusText !== "OK") {
          throw new Error(`User type API responded with status: ${userTypeResponse.status}`);
        }
    
        const userTypeList = await userTypeResponse.json();
        if(userTypeList && Array.isArray(userTypeList)) {
          userTypeIdList = userTypeList.map((item: any) => item.id);
        }
      } catch (error) {

      }
    }

    // const gotifyDomain = process.env.NEXT_PUBLIC_NOTI_IN_APP_DOMAIN ?? 'https://gotify.i24.dev';
    // const gotifyToken = process.env.NEXT_PUBLIC_NOTI_IN_APP_TOKEN;
  
    // if (!gotifyToken) {
    //   return NextResponse.json(
    //     { error: 'Gotify token not configured' },
    //     { status: 500 }
    //   );
    // }

    // const gotifyResponse = await fetch(
    //   `${gotifyDomain}/message?limit=${limit}${since ? `&since=${since}` : ''}`,
    //   {
    //     method: 'GET',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${gotifyToken}`
    //     },
    //     // Add timeout
    //     signal: AbortSignal.timeout(600000) // 10 minutes timeout
    //   }
    // );

    
    // if (!gotifyResponse.ok || gotifyResponse.statusText !== "OK") {
    //   throw new Error(`Gotify API responded with status: ${gotifyResponse.status}`);
    // }

    // const data = await gotifyResponse.json();
    
    // let filteredMessages: any[] = [];
    // try {
    //   if(userTypeIdList.includes(1) || userTypeIdList.includes('1')){
    //     filteredMessages = data?.messages ?? [];
    //   } else {
    //     filteredMessages = data?.messages?.filter((item: any) => 
    //       item?.extras?.email?.includes(userEmail)
    //     ) || [];
    //   }
    // } catch (error) {
    //   filteredMessages = data?.messages?.filter((item: any) => 
    //     item?.extras?.email?.includes(userEmail)
    //   ) || [];
    // }

    // return NextResponse.json({
    //   messages: filteredMessages,
    //   paging: data?.paging,
    //   totalRecord: filteredMessages.length,
    //   oldestId: data?.messages?.length > 0 ? Math.min(...data.messages.map((n: any) => n.id)) : null
    // });

    const gotifyDomain =
      process.env.NEXT_PUBLIC_NOTI_IN_APP_DOMAIN ?? "https://gotify.i24.dev";

    const gotifyToken = process.env.NEXT_PUBLIC_NOTI_IN_APP_TOKEN;

    if (!gotifyToken) {
      return NextResponse.json(
        { error: "Gotify token not configured" },
        { status: 500 }
      );
    }

    const allMessages: any[] = [];

    let nextSince: any = since ?? undefined;
    let hasNext = true;

    while (hasNext) {
      const url = `${gotifyDomain}/message?limit=${limit}${
        nextSince ? `&since=${nextSince}` : ""
      }`;

      const gotifyResponse = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${gotifyToken}`,
        },
        signal: AbortSignal.timeout(600000),
      });

      if (!gotifyResponse.ok) {
        throw new Error(
          `Gotify API responded with status: ${gotifyResponse.status}`
        );
      }

      const data = await gotifyResponse.json();

      const messages = data?.messages ?? [];

      allMessages.push(...messages);

      if (data?.paging?.next) {
        const nextUrl = new URL(data.paging.next, gotifyDomain);
        const nextSinceFromPaging = nextUrl.searchParams.get("since");

        if (!nextSinceFromPaging || nextSinceFromPaging === String(nextSince)) {
          hasNext = false;
        } else {
          nextSince = nextSinceFromPaging;
        }
      } else {
        if (messages.length >= Number(limit)) {
          const oldestId = Math.min(...messages.map((n: any) => Number(n.id)));

          if (!oldestId || String(oldestId) === String(nextSince)) {
            hasNext = false;
          } else {
            nextSince = oldestId;
          }
        } else {
          hasNext = false;
        }
      }

      if (messages.length === 0) {
        hasNext = false;
      }
    }

    let filteredMessages: any[] = [];

    try {
      if (userTypeIdList.includes(1) || userTypeIdList.includes("1")) {
        filteredMessages = allMessages;
      } else {
        filteredMessages = allMessages.filter((item: any) =>
          item?.extras?.email?.includes(userEmail)
        );
      }
    } catch (error) {
      filteredMessages = allMessages.filter((item: any) =>
        item?.extras?.email?.includes(userEmail)
      );
    }

    return NextResponse.json({
      messages: filteredMessages,
      totalRecord: filteredMessages.length,
      oldestId:
        allMessages.length > 0
          ? Math.min(...allMessages.map((n: any) => Number(n.id)))
          : null,
    });

  } catch (error) {
    console.log('Failed to fetch notifications :', error)
    // Error fetching notifications
    return NextResponse.json(
      { error: 'Failed to fetch notifications', error_: error },
      { status: 500 },
    );
  }
}