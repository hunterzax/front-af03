"use client";
import AppsIcon from "@mui/icons-material/Apps";
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
import { useEffect, useState } from "react";

function AppMenu() {
  const router = useRouter();
  const [pmisGraphicUrl, setPmisGraphicUrl] = useState<any>();

  const handleClick = async (data: any) => {
    if (data == 'pmis.pipeline.pttplc.com/smartTSO/login.php') {
      const href = /^https?:\/\//i.test(data) ? data : `https://${data}`;
      const url_to_open = pmisGraphicUrl?.length > 0 ? pmisGraphicUrl?.[0]?.link : href

      // window.open(href, '_blank', 'noopener,noreferrer');
      window.open(url_to_open, '_blank', 'noopener,noreferrer');
    } else {
      router.push(`/en/authorization/${data}`);
    }
  };

  const fetchData = async () => {
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
      // setError(err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [])

  return (
    <>
      <Menu>
        <MenuHandler>
          <Button variant="text" className="p-0 m-0 -ml-2 flex items-center gap-2">
            <AppsIcon className=" text-[#58585A]" />
          </Button>
        </MenuHandler>

        <div className="flex">
          <MenuList className="grid grid-cols-3 p-0">
            <div className="text-[#8A99AF] col-span-3 px-4 py-3 font-bold"> {`Menu`} </div>
            {
              (tempMenu() || []).map((item: any, ix: number) => {

                return (
                  <MenuItem
                    key={ix}
                    className=" w-[120px] h-[80px] border rounded-none grid items-center justify-center bg-[#ffffff] text-[#374151] text-xs"
                    onClick={() => handleClick(item?.url)}
                  >
                    <div className="grid items-center justify-center text-[#9CA3AF]">{item?.icon}</div>
                    <div className="grid items-center justify-center text-center pt-2 text-[#374151]">{item?.name}</div>
                  </MenuItem>
                )
              })
            }
          </MenuList>
        </div>
      </Menu >
    </>
  );
}

export default AppMenu;
