"use client";
import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  /* @ts-ignore */
  Menu,
  /* @ts-ignore */
  MenuHandler,
  /* @ts-ignore */
  MenuList,
  /* @ts-ignore */
  MenuItem,
  /* @ts-ignore */
  Button,
  /* @ts-ignore */
  Badge,
} from "@material-tailwind/react";
import { useEffect, useRef, useState } from "react";
import { getStoredNotifications, markAllAsRead, storeNotification, storeNotificationList } from "@/components/other/notifyStorage";
import getUserValue from "@/utils/getuserValue";
import NotificationArea from "@/components/headers/NotificationArea";
import axios from "axios";
import { getService, postService } from "@/utils/postService";
import getCookieValue from "@/utils/getCookieValue";
import { decryptData } from "@/utils/encryptionData";
import tempMenu from "./tempMenu";
import WSClient from "../other/wsClient";

const Notifys = () => {
  const userDT: any = getUserValue();
  const userEmail = userDT?.email;
  const [notifList, setNotifList] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<any>(null);

  // const refreshNotifications = async () => {

  //   try {
  //     const limit = 100;
  //     let size = 0;
  //     let since: any = null;

  //     do {
  //       // Wait 0.5 second before next loop
  //       await new Promise(resolve => setTimeout(resolve, 500)); // --> coverity security

  //       const response = await axios.get(
  //         `/api/notifications?limit=${limit}&userEmail=${encodeURIComponent(userEmail)}${since ? `&since=${since}` : ''
  //         }`,
  //         { timeout: 600000 }
  //       );

  //       const res = response?.data?.messages ?? [];
  //       const paging = response?.data?.paging;

  //       storeNotificationList(res);

  //       const uniqueNotifications = [...notifList, ...res].filter(
  //         (notification, index, self) =>
  //           index === self.findIndex(n => n.id === notification.id)
  //       );
  //       setNotifList(uniqueNotifications);

  //       if (!since) {
  //         // const storedNotiList = getStoredNotifications();
  //         // setUnreadCount(
  //         //   res?.filter((item: any) => {
  //         //     const exist = storedNotiList.find((n: any) => n.id === item.id);
  //         //     return exist ? !exist.isRead : true;
  //         //   }).length
  //         // );
  //       }

  //       // Find the oldest ID from the current batch of notifications
  //       since = response?.data?.oldestId;
  //       size = paging?.size ?? 0;
  //     } while (size >= limit);
  //   } catch (error) {
  //     if (axios.isAxiosError(error)) {
  //       // Axios error
  //     } else {
  //       // Unexpected error
  //     }

  //     // ❌ เอา throw error ออก → จะไม่โยน error ไปข้างนอกแล้วโค้ดไม่แตก
  //     // ✅ แทนด้วย return ค่า default
  //     setNotifList(getStoredNotifications());
  //   } finally {
  //     // Fallback to stored notifications
  //     const storedNotiList = getStoredNotifications();
  //     setNotifList(storedNotiList);

  //     countUnread(storedNotiList)
  //     // setUnreadCount(storedNotiList?.filter((n: any) => !n.isRead).length);
  //   }

  // };

  const refreshingRef = useRef(false);

  const refreshNotifications = async () => {
    // ป้องกันเรียกซ้อน
    if (refreshingRef.current) return;
    refreshingRef.current = true;

    try {
      const limit = 200; // max limit ของ gotify คือ 200
      let since: string | null = null;

      const collected: any[] = [];

      do {
        // กันยิงถี่เกิน 
        await new Promise(r => setTimeout(r, 500));

        const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
        let tokenFromLcstr: any = localStorage?.getItem("v4r2d9z5m3h0c1p0x7l");
        tokenFromLcstr = tokenFromLcstr ? decryptData(tokenFromLcstr) : null;

        const auth_token = tokenFromLcstr ? tokenFromLcstr : token;

        const url: any = `/api/notifications?limit=${limit}&userEmail=${encodeURIComponent(userEmail)}${since ? `&since=${since}` : ''}`;
        const { data } = await axios.get(url,
          {
            timeout: 600000,
            headers: {
              Authorization: auth_token ? `Bearer ${auth_token.replace(/^"|"$/g, "")}` : null
            }
          }
        );

        const page = data?.messages?.map((e:any) => {
          const { title, ...nE } = e
          return {
            ...nE,
            title: title === "Nomination" ? "Nominations" : title
          }
        }) ?? [];
        const oldestId = data?.oldestId ?? null;

        // เก็บก่อน ค่อย merge ตอนจบ
        collected.push(...page);

        // เตรียมไปหน้าเก่ากว่า
        since = oldestId;

        // ถ้าหน้าล่าสุดมีจำนวนน้อยกว่า limit แปลว่าหมดแล้ว
        if (page.length < limit) break;
      } while (collected.length < 1200); //ป้องกัน Failed to execute 'setItem' on 'Storage': Setting the value of 'notifications' exceeded the quota.
      // dedupe ด้วย Map/Set ตาม id
      const dedup = (list: any[]) => {
        const m: any = new Map<string, any>();
        for (const n of list) m.set(n.id, n);
        return [...m.values()];
      };

      // เก็บลง storage ทีเดียว
      await storeNotificationList(collected);
      // รวมกับที่มีอยู่ แล้วค่อย set ครั้งเดียว
      // if(item.title === "Nomination"){
      setNotifList(prev => dedup([...(prev ?? []), ...collected]));

      // นับ unread จากข้อมูลใน storage หรือจาก collected ที่เพิ่งมา
      const stored = await getStoredNotifications();
      countUnread(stored);

    } catch (err) {
      // fallback บน error
      const stored = await getStoredNotifications();
      setNotifList(stored);
      countUnread(stored);
    } finally {
      refreshingRef.current = false;
    }
  };


  // WEB SOCKET
  const ws: any = useRef(null);

  useEffect(() => {
    if (ws.current) return; // ถ้ามีแล้ว ไม่ต้องสร้างซ้ำ

    // WebSocket connected
    refreshNotifications(); // โหลดเมื่อเปิดหน้า
    try {
      let isAdmin = false;
      try {
        isAdmin = (userDT?.account_manage ?? []).filter((item: any) => item?.user_type_id === 1 || item?.user_type_id === '1').length > 0;
      } catch (error) {
        isAdmin = false;
      }
      // // #แบบยิงตรง
      // let notiInAppDomain = process.env.NEXT_PUBLIC_NOTI_IN_APP_DOMAIN ?? ''
      // const notiInAppToken = process.env.NEXT_PUBLIC_NOTI_IN_APP_TOKEN ?? ''
      // notiInAppDomain = notiInAppDomain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
      // const wsUrl = `wss://${notiInAppDomain}/stream?token=${encodeURIComponent(notiInAppToken)}`;
      const wsUrl = `${process.env.NEXT_PUBLIC_NOTI_IN_APP_WS}`;
      const socket = new WebSocket(wsUrl);

      // // #แบบHook
      // let URL_BACK = process.env.NEXT_PUBLIC_API_URL ?? ''
      // let notiInAppDomain = process.env.NEXT_PUBLIC_NOTI_IN_APP_DOMAIN ?? ''
      // notiInAppDomain = URL_BACK.replace("https://", "")
      // notiInAppDomain = notiInAppDomain.replace("http://", "")
      // const socket = new WebSocket(`wss://${notiInAppDomain}/master/api/ws`);

      ws.current = socket;

      socket.onopen = () => console.log("WS OPEN 1 ✅");
      socket.onerror = (e) => console.log("WS ERROR 1 ❌");
      socket.onclose = (e) => {
        if (ws.current === socket) ws.current = null;
      };

      ws.current.onmessage = (message: any) => {
        refreshNotifications();
        const response = JSON.parse(message.data);
        const isTarget = isAdmin || response?.extras?.email?.includes(userEmail);

        if (isTarget) {
          // storeNotification({
          //   id: response?.id,
          //   title: response?.title,
          //   message: response?.message,
          //   create_date: response?.date,
          //   date: response?.date,
          //   extras: response?.extras,
          // });
          // // refreshNotifications();
          // const storedNotiList = getStoredNotifications()
          // setNotifList(storedNotiList);
          // countUnread(storedNotiList)
          // setUnreadCount(storedNotiList?.filter((n: any) => !n.isRead).length)
        }
      };
    } catch (error) {

    }


    return () => ws.current?.close();
  }, []);

  const countUnread = async (data: any) => {
    const res_readed_data = await getService(`/master/account-manage/noti-read`);
    const menu_authorization = tempMenu();
    try {
      // กรองข้อมูลอ่านแล้วออกไปซะ
      const readIds = new Set((res_readed_data ?? [])?.map((x: any) => x?.id_noti));
      // const readIds = (res_readed_data ?? []).map((x: any) => x?.id_noti);

      const filtered = (data ?? []).filter((x: any) => !readIds.has(x?.id));

      // กรอง noti เกี่ยวกับ login ออก
      const clearOnlyLogin = filtered?.filter((item: any) => item?.title !== 'login')

      // หาข้อมูลที่เกี่ยวกับกับเมนูที่ user สามารถเห็นได้ 
      const nameSet = new Set(menu_authorization.map((item: any) => item.name));

      const result = clearOnlyLogin.filter((item: any) =>
        nameSet.has(item.title)
      );
      // setFinalData(filtered) // ----> กรองอ่านแล้วออก
      setUnreadCount(result?.length)
    } catch (error) {
      setUnreadCount(null)
    }
  }


  return (
    <>
    <WSClient refreshNotifications={refreshNotifications} />
    <Menu>
      <Badge
        content={unreadCount > 99 ? '99+' : unreadCount}
        // content={notifList?.length > 99 ? '99+' : notifList?.length}
        placement="top-end"
        withBorder
        className={unreadCount > 0 ? '' : 'hidden'}
      // className={notifList?.length > 0 ? '' : 'hidden'}
      >
        <MenuHandler>
          <Button
            variant="text"
            className="p-0 m-0 flex items-center gap-2"
            onClick={async () => {
              await markAllAsRead();
              try {
                refreshNotifications(); // refresh list from localStorage
              } catch (error) {
                // Failed to refresh notifications
              }
            }}
          >
            <NotificationsIcon className="text-[#58585A]" />
          </Button>
        </MenuHandler>
      </Badge>

      <div className="flex">
        <MenuList className="grid grid-cols-1 p-0 w-auto overflow-hidden">
          <NotificationArea
            data={notifList}
            onUpdateBadge={() => {
              // const storedNotiList = getStoredNotifications()
              // setUnreadCount(storedNotiList?.filter((n: any) => !n.isRead).length)
              // setUnreadCount(notifList?.length)
            }}
            setUnreadCount={setUnreadCount}
          />

        </MenuList>
      </div>

    </Menu>
    </>
  );
}

export default Notifys;