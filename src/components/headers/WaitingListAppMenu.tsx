"use client";

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
} from "@material-tailwind/react";

import tempMenu from "./tempMenu";
import { useRouter } from "next/navigation";
import { getService } from "@/utils/postService";
import { useRef, useState } from "react";
import ViewAgendaOutlinedIcon from "@mui/icons-material/ViewAgendaOutlined";

function WaitingListAppMenu() {
  const router = useRouter();

  const [openMenu, setOpenMenu] = useState(false);

  const [menuWL, setMenuWL] = useState<any[]>(() => {
    return (tempMenu() || [])
      .filter((f: any) => [101, 201, 601, 801].includes(f?.id))
      .map((item: any) => ({
        ...item,
        val_: 0,
        loading: false,
      }));
  });

  /**
   * ป้องกัน request รอบเก่า
   * กรณีเปิด menu หลายรอบติดกัน
   */
  const requestIdRef = useRef(0);

  const handleClick = async (data: any) => {
    router.push(
      `/en/authorization/dashboardandreport/waitinglist?menu=${data}`,
    );
  };

  /**
   * =====================================================
   * Waiting List config
   * =====================================================
   */
  const WAITING_LIST_CONFIG = [
    {
      url: "booking",
      menuName: "Capacity Management",
      list: [
        "Capacity Contract Management",
        "Capacity Contract Management (Saved)",
        "Capacity Contract Management (Confirmed)",
        "Capacity Contract List",
        "Capacity Contract List (Saved)",
        "Capacity Contract List (Confirmed)",
        "Release Capacity Management",
      ],
    },
    {
      url: "allocation",
      menuName: "Allocation",
      list: [
        "Allocation Management",
        "Allocation Review",
      ],
    },
    {
      url: "nominations",
      menuName: "Nominations",
      list: [
        "Daily Query Shipper Nomination File",
        "Weekly Query Shipper Nomination File",
        "Daily Management",
        "Weekly Management",
        "Daily Adjustment",
      ],
    },
    {
      url: "event",
      menuName: "Event",
      list: [
        "Offspec Gas",
        "Emergency/Difficult Day",
        "OFO/IF",
        "Offspec Gas (Acknowledge)",
        "Emergency/Difficult Day (Acknowledge)",
        "OFO/IF (Acknowledge)",
      ],
    },
  ];

  /**
   * =====================================================
   * คำนวณ remainingTasks
   * =====================================================
   */
  const calculateWaitingList = (
    response: any,
    list: string[],
  ) => {
    return list.reduce((total, menuName) => {
      return (
        total +
        Number(response?.[menuName]?.remainingTasks || 0)
      );
    }, 0);
  };

  /**
   * =====================================================
   * ดึง Waiting List แยกแต่ละหมวด
   *
   * ยิงพร้อมกัน
   * ใครเสร็จก่อน update ก่อน
   * =====================================================
   */
  const fetchData = () => {
    const currentRequestId = ++requestIdRef.current;

    /**
     * ตั้ง loading เฉพาะ 4 menu ก่อน
     */
    setMenuWL((prev) =>
      prev.map((item) => ({
        ...item,
        loading: WAITING_LIST_CONFIG.some(
          (config) => config.url === item?.url,
        ),
      })),
    );

    /**
     * ไม่ใช้ await Promise.all
     *
     * เพราะต้องการให้ response ตัวไหนมาก่อน
     * update UI ก่อนทันที
     */
    WAITING_LIST_CONFIG.forEach(async (config) => {
      try {
        const response = await getService(
          `/master/waiting-list/v2?menuName=${encodeURIComponent(
            config.menuName,
          )}`,
        );

        /**
         * ถ้ามีการเปิดรอบใหม่แล้ว
         * ไม่เอา response รอบเก่ามาทับ
         */
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        const total = calculateWaitingList(
          response,
          config.list,
        );

        /**
         * update เฉพาะ menu ที่ response กลับมา
         */
        setMenuWL((prev) =>
          prev.map((item) => {
            if (item?.url === config.url) {
              return {
                ...item,
                val_: total,
                loading: false,
              };
            }

            return item;
          }),
        );
      } catch (error) {
        console.error(
          `Waiting List API error: ${config.menuName}`,
          error,
        );

        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        /**
         * Error เฉพาะ card นี้
         * ตัวอื่นยังโหลดต่อได้
         */
        setMenuWL((prev) =>
          prev.map((item) => {
            if (item?.url === config.url) {
              return {
                ...item,
                val_: 0,
                loading: false,
                error: true,
              };
            }

            return item;
          }),
        );
      }
    });
  };

  /**
   * =====================================================
   * เปิด / ปิด Menu
   * =====================================================
   */
  const handleMenuOpen = (value: boolean) => {
    setOpenMenu(value);

    /**
     * ดึง API เฉพาะตอน "เปิด"
     */
    if (value) {
      fetchData();
    }
  };

  return (
    <>
      <Menu
        open={openMenu}
        handler={handleMenuOpen}
      >
        <MenuHandler>
          <Button
            variant="text"
            className="p-0 m-0 -ml-2 flex items-center gap-2"
          >
            <ViewAgendaOutlinedIcon className="text-[#58585A]" />
          </Button>
        </MenuHandler>

        <div className="flex">
          <MenuList className="grid grid-cols-3 p-0">

            <div className="text-[#8A99AF] col-span-3 px-4 py-3 font-bold">
              Waiting List Menu
            </div>

            {menuWL.map((item: any, ix: number) => (
              <MenuItem
                key={item?.id ?? ix}
                className="
                  w-[120px]
                  h-[120px]
                  border
                  rounded-none
                  grid
                  items-center
                  justify-center
                  bg-[#ffffff]
                  text-[#374151]
                  text-xs
                "
                onClick={() =>
                  handleClick(item?.menus_config_id)
                }
              >
                <div className="grid items-center justify-center text-[#9CA3AF]">
                  {item?.icon}
                </div>

                <div className="grid items-center justify-center text-center pt-2 text-[#374151]">
                  {item?.loading ? (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 border-2 border-[#00ADEF] border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px] text-[#9CA3AF]">
                        Loading
                      </span>
                    </div>
                  ) : item?.error ? (
                    <span className="text-red-400 text-[10px]">
                      Error
                    </span>
                  ) : (
                    item?.val_ || 0
                  )}
                </div>

                <div className="grid items-center justify-center text-center pt-2 text-[#374151]">
                  {item?.name}
                </div>
              </MenuItem>
            ))}
          </MenuList>
        </div>
      </Menu>
    </>
  );
}

export default WaitingListAppMenu;