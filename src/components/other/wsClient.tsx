// components/WSClient.js
import getUserValue from "@/utils/getuserValue";
import { useLogout } from "@/utils/logoutFunc";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined';

import 'react-toastify/dist/ReactToastify.css';
import { getService } from "@/utils/postService";
const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  //   border: '2px solid #000',
  //   boxShadow: 24,
  p: 4,
  borderRadius: '10px',
};

export default function WSClient({refreshNotifications}:any) {
  const ws: any = useRef(null);
  const userDT: any = getUserValue();
  const { mutateLogout } = useLogout();
  const router = useRouter();

  const [inactive, setInactive] = useState(false);


  // const handleLogout = async () => {
  //   setInactive(true)
  //   // localStorage.clear();
  //   // const channel = new BroadcastChannel("auth_channel");

  //   // // ส่งสัญญาณ logout ให้ทุก tab
  //   // channel.postMessage("logout");
  //   // channel.close();

  //   // await mutateLogout();
  // };

  const handleLoginRedirect = async () => {
    setInactive(false)
    localStorage.clear();
    const channel = new BroadcastChannel("auth_channel");

    // ส่งสัญญาณ logout ให้ทุก tab
    channel.postMessage("logout");
    channel.close();
    router.replace("/en/signin");
    // await mutateLogout();

  };

  useEffect(() => {
    try {

      // #แบบยิงตรง
      let notiInAppDomain = process.env.NEXT_PUBLIC_NOTI_IN_APP_DOMAIN ?? ''
      const notiInAppToken = process.env.NEXT_PUBLIC_NOTI_IN_APP_TOKEN ?? ''
      notiInAppDomain = notiInAppDomain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
      // const wsUrl = `ws://${notiInAppDomain}/stream?token=${encodeURIComponent(notiInAppToken)}`; 
      const wsUrl = `${process.env.NEXT_PUBLIC_NOTI_IN_APP_WS}`;
      ws.current = new WebSocket(wsUrl);

      // // #แบบHook
      // let URL_BACK = process.env.NEXT_PUBLIC_API_URL ?? "";
      // let notiInAppDomain = process.env.NEXT_PUBLIC_NOTI_IN_APP_DOMAIN ?? "";
      // notiInAppDomain = URL_BACK.replace("https://", "");
      // notiInAppDomain = notiInAppDomain.replace("http://", "");
      // ws.current = new WebSocket(`wss://${notiInAppDomain}/master/api/ws`);

      ws.current.onopen = () => console.log("WS OPEN 2 ✅");
      ws.current.onerror = (e: any) => console.log("WS ERROR 2 ❌");

      ws.current.onclose = (e: any) => {
        if (ws.current === ws.current) ws.current = null;
      };

      ws.current.onmessage = (message: any) => {
        if(refreshNotifications){
          refreshNotifications()
        }
        const response = JSON.parse(message.data);
        if (response?.title === "login") {

          if (response?.extras?.email?.find((f: any) => f === userDT?.email)) {
            // handleLogout()
            setInactive(true)
          }
        }

        if(response?.title.includes("waitinglist.")){
          const target = response?.title.replace("waitinglist.", "");
          let menuName = '';
          switch(target){
            case "booking":
              menuName = 'Capacity Management';
              break;
            case "allocation":
              menuName = 'Allocation';
              break;
            case "nomination":
              menuName = 'Nominations';
              break;
            case "event":
              menuName = 'Event';
              break;
          }

          if(menuName){
            try {
              getService(`/master/waiting-list/v2?menuName=${encodeURIComponent(menuName)}`).then((response) => {
                const wl = localStorage.getItem("WL");
                let wlList = null;
                if(wl){
                  wlList = JSON.parse(wl);
                }
                Object.keys(response).map((key) => {
                  if(wlList?.[key] && response[key]){
                    wlList[key] = response[key];
                  }
                })
                if(wlList){
                  localStorage.setItem("WL", JSON.stringify(wlList));
                }
              }).catch((error) => {
                console.error(`Refresh Waiting List "${menuName}" error:`, error)
              });
            } catch (error) {
              console.error(`Refresh Waiting List "${menuName}" error:`, error)
            }
          }
        }
      };
    } catch (error) {

    }

    return () => {
      try {
        ws?.current?.close();
      } catch (error) {

      }
    };
  }, []);

  return <>
    <Modal open={inactive} onClose={() => handleLoginRedirect()}>
      <Box sx={style}>
        <div className="flex items-center justify-center pb-2">
          <div className={`flex items-center justify-center w-12 h-12 bg-[#fff9cb] text-[#EED202]  rounded-full`}>
            <PriorityHighOutlinedIcon />
          </div>
        </div>
        <div className={`flex pb-2 justify-center text-[#EED202] text-2`}>
          {`Logged in from another device`}
        </div>
        <div className="flex p-4 justify-center text-[#637381] text-ellipsis text-center">
          {`Your account already logged-in in another device.`}
        </div>
        <div className='flex pt-4 justify-center'>
          <button
            type='button'
            onClick={() => handleLoginRedirect()}
            className="w-[120px] h-[40px] bg-blue-500 text-white hover:bg-blue-600 rounded-md"
          >
            {`OK`}
          </button>
        </div>
      </Box>
    </Modal>
  </>;
}
