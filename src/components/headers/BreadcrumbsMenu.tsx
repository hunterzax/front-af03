import React from 'react'
import TimeCount from './TimeCount';
/* @ts-ignore */
import { Breadcrumbs } from "@material-tailwind/react";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { usePathname } from 'next/navigation';
import { splitCamelCase } from '@/utils/generalFormatter';
import { decryptData } from '@/utils/encryptionData';

function BreadcrumbsMenu({ menu, goToUrl }: any) {
  const pathname = usePathname();
  const excludedPaths = ["group", "masterData", "systemConfiguration", "uxui"];
  const currentPath = pathname?.split("/")[5];

  const getRenderItem = () => {
    return excludedPaths.includes(currentPath) ? renderItem("group") : renderItem("normal");
  };

  const gradient_tso = "linear-gradient(90deg, #0BACF2 0%, #4BB285 100%)"
  const gradient_shipper = "linear-gradient(90deg, #0BACF2 0%, #B24B89 100%)"

  // const userDT: any = getUserValue();
  let getuserDT: any = localStorage?.getItem("x9f3w1m8q2y0u5d7v1z");
  getuserDT = getuserDT ? decryptData(getuserDT) : null;
  const userDT: any = getuserDT ? JSON.parse(getuserDT) : {}

  const renderItem = (mode: "group" | "normal") => {
    // return 
    if (mode == "group") {

      const pageTitle = (() => {
        const current = splitCamelCase(pathname.split("/")[6]);

        // https://app.clickup.com/t/86etmzrqp ปรับชื่อเมนูตรงบาร์ด้านบนจาก Non Tpa Point เป็น Non TPA Point
        if (current === "non Tpa Point") return "non TPA Point";
        if (current === "hv Operation Flow") return "HV for Operation Flow and Instructed Flow";
        if (current === "config Mode Zone Base Inven") return "Config Mode/Zone Base Inventory";
        if (current === "mode Zone Base Inventory") return "Mode/Zone Baseline Inventory";
        if (current === "term And Condition") return "Term & Conditions";

        return current;
      })();

      return (
        <Breadcrumbs
          separator={
            !!pathname.split("/")[4] && <KeyboardArrowRightIcon
              className="h-4 w-4 text-white"
              strokeWidth={2.5}
            />
          }
          className="m-0 p-0 bg-inherit"
        >
          <div
            className=" cursor-pointer hover:opacity-80 text-white font-bold"
            onClick={() => {
              goToUrl(menu?.url);
            }}
          >
            {menu?.name || "-"}
          </div>
          {!!pathname.split("/")[4] && (
            <>
              <div className=" cursor-not-allowed opacity-80 text-white font-bold">
                {menu?.menu.find((f: any) => {
                  return (f?.url === `${pathname.split("/")[3]}/${pathname.split("/")[4]}`);
                })?.name || null}
              </div>
            </>
          )}
          {!!pathname.split("/")[5] && (
            <>
              <div className=" cursor-not-allowed opacity-80 text-white font-bold">
                {menu?.menu
                  .find((f: any) => {
                    return (f?.url === `${pathname.split("/")[3]}/${pathname.split("/")[4]}`);
                  })
                  ?.menu.find((f: any) => {
                    return (
                      f?.url === `${pathname.split("/")[3]}/${pathname.split("/")[4]}/${pathname.split("/")[5]}`
                    );
                  })?.name || null}
              </div>
            </>
          )}
          {/* <div className={`cursor-not-allowed opacity-80 text-white font-bold capitalize`}> */}
          <div className={`cursor-not-allowed opacity-80 text-white font-bold ${pageTitle !== 'Hv for Operation Flow and Instructed Flow' ? 'capitalize' : ''} `}>
            {pageTitle}
          </div>
        </Breadcrumbs>
      )
    } else {
      return (
        <Breadcrumbs
          separator={
            !!pathname.split("/")[4] && !!pathname.split("/")[5] && (
              <KeyboardArrowRightIcon
                className="h-4 w-4 text-white"
                strokeWidth={2.5}
              />
            )
          }
          className="m-0 p-0 bg-inherit"
        >
          {/* Level 1 */}
          <div
            className="cursor-pointer hover:opacity-80 text-white font-bold"
            onClick={() => {
              goToUrl(menu?.url);
            }}
          >
            {menu?.name || "-"}
          </div>

          {/* Level 2 */}
          {!!pathname.split("/")[4] && (
            <>
              {
                pathname.split("/")[5] == undefined && <KeyboardArrowRightIcon className="h-4 w-4 text-white mr-3" strokeWidth={2.5} />
              }
              <div className="cursor-not-allowed opacity-80 text-white font-bold">
                {menu?.menu.find((f: any) => {
                  return f?.url === `${pathname.split("/")[3]}/${pathname.split("/")[4]}`;
                })?.name || null}
              </div>
            </>
          )}

          {/* Level 3 */}
          {!!pathname.split("/")[5] && (
            <div className="cursor-not-allowed opacity-80 text-white font-bold">
              {menu?.menu
                ?.find((f: any) => {
                  return f?.url === `${pathname.split("/")[3]}/${pathname.split("/")[4]}`;
                })
                ?.menu?.find((f: any) => {
                  return (
                    f?.url === `${pathname.split("/")[3]}/${pathname.split("/")[4]}/${pathname.split("/")[5]}`
                  );
                })?.name || null}
            </div>
          )}
        </Breadcrumbs>
      )
    }
  }

  if (pathname.split("/")[3] == "profile") {
    return (
      <section
        className=" flex justify-between items-center h-[55px] px-2 text-white"
        style={{
          // background: "linear-gradient(90deg, #0BACF2 0%, #4BB285 100%)", 
          // background: "linear-gradient(90deg, #0BACF2 0%, #B24B89 100%)",
          background: userDT?.account_manage?.length > 0 && userDT?.account_manage[0]?.user_type?.id !== 3 ? gradient_tso : gradient_shipper,
        }}
      >
        <Breadcrumbs
          className="m-0 p-0 bg-inherit"
        >
          <div
            className=" cursor-pointer hover:opacity-80 text-white font-bold"
            onClick={() => {
              goToUrl(pathname);
            }}
          >
            {`My Profile`}
          </div>
        </Breadcrumbs>
        <TimeCount modeShow={`in`} className={`flex items-center font-light`} onSplit={true} />
      </section>
    )
  } else {
    return (
      <section
        className=" flex justify-between items-center h-[55px] px-2 pl-[25px] text-white"
        style={{
          // background: "linear-gradient(90deg, #0BACF2 0%, #4BB285 100%)",
          // background: "linear-gradient(90deg, #0BACF2 0%, #B24B89 100%)",
          background: userDT?.account_manage?.length > 0 && userDT?.account_manage[0]?.user_type?.id !== 3 ? gradient_tso : gradient_shipper,
        }}
      >
        {/* {
          (pathname?.split("/")[5] !== "group" && pathname?.split("/")[5] !== "masterData" && pathname?.split("/")[5] !== "systemParameters" && pathname?.split("/")[5] !== "uxui") ?
            renderItem("normal")
            : (pathname?.split("/")[5] == "group" || pathname?.split("/")[5] == "masterData" || pathname?.split("/")[5] == "systemParameters" || pathname?.split("/")[5] == "uxui") &&
            renderItem("group")
        } */}
        {getRenderItem()}
        <TimeCount modeShow={`in`} className={`flex items-center font-light`} onSplit={true} />
      </section>
    )
  }

}

export default BreadcrumbsMenu