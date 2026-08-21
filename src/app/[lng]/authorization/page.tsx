"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Marquee from "react-fast-marquee";
import CampaignIcon from "@mui/icons-material/Campaign";
import TimeCount from "@/components/headers/TimeCount";
import tempMenu from "@/components/headers/tempMenu";
import LayoutHeader from "@/components/headers/Layout";
import { getNoTokenService, getService } from "@/utils/postService";
import { useAppDispatch } from "@/utils/store/store";
import { fetchAllData } from "@/hook/fetchAllMaster";
import useLogoutSync from "@/hook/useLogoutSync";

const PMIS_URL = process.env.NEXT_PUBLIC_PMIS_URL

/* @ts-ignore */

interface ClientProps {
  params: {
    lng: string;
  };
}

const ClientPage: React.FC<ClientProps> = (props) => {

  const [announcement, setAnnouncement] = useState<any>();
  const [pmisGraphicUrl, setPmisGraphicUrl] = useState<any>();

  // ############### REDUX DATA ###############
  const dispatch = useAppDispatch();

  // ############### ANNOUNCEMENT & BG ###############
  const [bgUrl, setBgUrl] = useState("");

  const fetchData = async () => {
    try {
      const response: any = await getNoTokenService(`/master/parameter/announcement-use`);
      setAnnouncement(response);
    } catch (err) {
      // setError(err.message);
    } finally {
      // setLoading(false);
    }

    try {
      const response: any = await getNoTokenService(`/master/parameter/setup-background`);
      if (response && Array.isArray(response) && response.length > 0) {
        const activeBgList = response.filter((item: any) => item && item.active == true && item.url).sort(
          (a: any, b: any) => (b?.id || 0) - (a.id || 1)
        )
        if (activeBgList && activeBgList.length > 0 && activeBgList[0]?.url) {
          setBgUrl(activeBgList[0].url)
        }
      }
    } catch (err) {
      // setError(err.message);
    }

    try {
      const response: any = await getService(`/master/parameter/system-parameter`);

      // ตัด Co-Ef ออก ไม่ได้มีใช้ ไม่ต้องมีทั้งใน Tariff และใน Parameter https://app.clickup.com/t/86euzxxpe
      // กรอง res_.system_parameter.name ที่มีคำว่า "Co-Efficient (%)" ออก
      const filtered = (response ?? []).filter((item: any) => {
        const name = (item?.system_parameter?.name ?? '').normalize('NFKD').toLowerCase().replace(/\s+/g, ' ');
        return !name.includes('co-efficient (%)');
      });

      const filterPmis = (filtered ?? []).filter((item: any) => {
          const pmis = item?.menus_id === 1026
        return pmis
      })

      setPmisGraphicUrl(filterPmis);
    } catch (err) {
    }

  };

  useEffect(() => {
    fetchData();
  }, [])

  const fetchAll = async (dispatch: any) => {
    try {
      await fetchAllData(dispatch);
    } catch (error) {
    }

    setisLoading(false);
  }

  useEffect(() => {
    fetchAll(dispatch);

  }, [dispatch]);

  const handleLinkClick = (url: string) => {
    if (url === 'pmis.pipeline.pttplc.com/smartTSO/login.php') {
      const url_to_open = pmisGraphicUrl?.length > 0 ? pmisGraphicUrl?.[0]?.link : PMIS_URL
      window.open(url_to_open, '_blank');
    }
  };

  const [isLoading, setisLoading] = useState<boolean>(true); //example
  return (
    <section
      className="h-[100vh] overflow-y-hidden bg-cover bg-center"
      style={{
        backgroundImage: bgUrl ? `url('${bgUrl}')` : "url('/assets/image/bg_menu_02.png')",
      }}
    >
      <div className="h-full w-full">
        <div className="h-[10%] flex px-5">
          <LayoutHeader />
        </div>
        <div id='time_count' className="h-[13%] flex items-center justify-center">
          <section className="text-center grid justify-center items-center text-[#1B1464]">
            <TimeCount
              modeShow={`out`}
              className={`flex items-center justify-center font-bold text-[#2B2A87]`}
              onSplit={false}
            />
            <h1 className=" font-bold text-[12px] sm:text-[16px] md:text-[1.4rem] lg:text-[2.1rem] pt-1 sm:pt-2 md:pt-3 lg:pt-4">{`Please select menu`}</h1>
          </section>
        </div>
        <div className=" h-[70%] overflow-y-auto py-3">
          <aside className="px-5 overflow-y-auto h-auto">
            <section className="grid 2xl:grid-cols-6 xl:grid-cols-5 lg:grid-cols-4md:grid-cols-5 sm:grid-cols-5  gap-4 transition duration-300 ease-in-out">
              {(tempMenu() || []).map((item: any, ix: number) => {
                return (
                  <Link
                    href={item?.url === 'pmis.pipeline.pttplc.com/smartTSO/login.php' ? '#' : `/en/authorization/${item?.url}`}
                    onClick={() => handleLinkClick(item?.url)}
                    prefetch={true}
                    key={ix}
                    className="row-span-1 noisy01 hover:bg-[#4F83B7] text-white py-6 sm:py-1 md:py-6 px-2 rounded-[20px] grid justify-center items-center h-[240px] sm:h-[100px] md:h-[25vh] lg:h-[10rem] xl:h-[240px] 1xl:h-[500px] bg-[#3A699373] duration-200 ease-in-out"
                  >
                    <div className="grid justify-center items-center h-[80px] sm:h-[50px] md:h-[50px] lg:h-[80px] duration-200 ease-in-out">
                      {item?.iconSize}
                    </div>
                    <div className="grid justify-center items-end text-[24px] sm:text-[1.5vw] md:text-[1.5vw] lg:text-[1.5vw] h-[35px] -mt-[50px] text-center">{item?.name}</div>
                  </Link>
                );
              })}
            </section>
          </aside>
        </div>
        <div className="h-[7%] flex items-end relative z-50">
          {announcement?.length > 0 && (
            // <footer className="fixed bottom-0 left-0 w-full bg-[#0D539A80] text-white h-[20px] sm:h-[30px] md:h-[40px] lg:h-[50px] flex items-center">
            <footer className="w-full bg-[#0D539A80] text-white h-[20px] sm:h-[30px] md:h-[40px] lg:h-[50px] flex items-center">
              <Marquee className="w-full">
                <aside className="w-full flex items-center justify-center">
                  {announcement?.map((item: any) => (
                    <section key={item.id} className="flex items-center gap-2 py-2">
                      <CampaignIcon className="!text-[14px] sm:!text-[16px] md:!text-[18px] lg:!text-[20px]" />
                      <span className="font-semibold text-[14px] sm:text-[12px] md:text-[16px] lg:text-[20px]">{`${item.topic}`}</span><span className="text-[14px] sm:text-[12px] md:text-[16px] lg:text-[20px]">{`: ${item.detail}`}{` `}</span>&nbsp;&nbsp;&nbsp;
                    </section>
                  ))}
                </aside>
              </Marquee>
            </footer>
          )}
        </div>
      </div>
    </section>
  )
};

export default ClientPage;
