"use client";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import {
  MenuItem,
} from "@material-tailwind/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { encryptData } from "@/utils/encryptionData";
import { TooltipWrapper } from "../other/tooltipSideMenu";
import { setCookie } from "@/utils/cookie";
const webVersion = process.env.NEXT_PUBLIC_WEB_VERSION

const NavMenu = ({ toggleNav, setToggleNav, menu, setMenu, goToUrl, permission }: any) => {
  const pathname_profile = usePathname();
  const popupRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [selectedMenu, setSelectedMenu] = useState<any>(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState({ top: 0, left: 0 });

  const toggleMenu = (menuItems: any, url: any) => {
    return menuItems.map((item: any) => {
      if (item.url === url) {
        return { ...item, toggle: !item.toggle };
      } else if (item.menu && item.menu.length > 0) {
        return { ...item, menu: toggleMenu(item.menu, url) };
      }
      return item;
    });
  };

  // ทำ toggle menu ตอนย่อ sider
  const flattenMenu = (menu: any) => {
    let flatArray: any = [];
    menu.forEach((item: any) => {
      if (!item.menu || item.menu.length === 0) {
        flatArray.push({
          id: item.id,
          url: item.url,
          name: item.name
        });
      }
      if (item.menu && item.menu.length > 0) {
        flatArray = flatArray.concat(flattenMenu(item.menu));
      }
    });
    return flatArray;
  }

  // เอาไว้ใช้ตอนย่อแถบเมนูข้าง ๆ 
  const handleClick = (menuItem: any) => {
    if (menuItem?.menu.length > 0) {
      const flatMenu = flattenMenu(menuItem?.menu);
      // setSelectedMenu(menuItem?.menu);
      setSelectedMenu(flatMenu);
      // const { top, left, height } = event.target.getBoundingClientRect();
      // setAnchorPosition({ top: top + height, left });
      setPopupVisible(true);
    }
  };

  const closePopup = () => {
    setPopupVisible(false);
  };

  const [expandedMenu, setExpandedMenu] = useState<{ [key: string]: boolean }>({});
  const currentPath = usePathname();
  const isActive = (url: string) => currentPath === url; // Only match exactly, not includes

  const toggleMenuXX = (url: string) => {
    setExpandedMenu((prevState) => ({
      ...prevState,
      [url]: !prevState[url], // Toggle the expanded state for this specific item
    }));
  };

  const isExpanded = (url: string) => expandedMenu[url] || isActive(url);

  const isHightLight = (url: string) => currentPath.includes(url);

  // เดิมโรงงาน
  // const renderMenu = (items: any, level = 0) => {
  //   return items?.map((item: any, ix: any) => {
  //     const isLastItem = ix === items.length - 1;
  //     const isMenuExpanded = isExpanded(item.url);

  //     return (
  //       <section key={ix} className={`${!toggleNav ? 'pl-[15px]' : 'pl-[5px]'} relative pt-2 ${item?.menu?.length > 0 && toggleNav ? '' : 'flex'}`}>
  //         {level > 0 && (
  //           <span
  //             className="absolute left-[-10px] top-0 h-full border-l-2 border-gray-300"
  //             style={{
  //               height: isLastItem ? '20%' : '100%',
  //             }}
  //           ></span>
  //         )}

  //         {level > 0 && (
  //           <span
  //             className="absolute mt-1 left-[-10px] top-[11px] transform -translate-y-1/2 border-b-2 border-l-2 rounded-bl-lg border-gray-300"
  //             style={{ width: "15px", height: "15px" }}
  //           ></span>
  //         )}

  //         {/* Menu item header */}
  //         <header
  //           className={`
  //             relative 
  //             ${item?.menu?.length > 0 && toggleNav ? 'grid grid-cols-[80%_20%]' : 'flex'} 
  //             items-center 
  //             rounded-md 
  //             cursor-pointer
  //             ${level > 0 ? 'w-full' : !toggleNav ? 'w-auto' : 'w-full'}
  //             ${!toggleNav ? 'pl-[5px] pr-[5px]' : 'pl-[10px]'} 
  //             ${isHightLight(item.url) || isMenuExpanded ? `bg-[#F6F6F6] ${!toggleNav ? 'py-[0px]' : item?.menu?.length > 0 && toggleNav ? 'py-[0px]' : level > 0 ? 'py-[0px]' : 'py-[10px]'}` : ""}
  //           `}

  //           onClick={() => {
  //             if (!toggleNav) {
  //               handleClick(item);
  //             }

  //             if ((item?.menu || []).length <= 0) {
  //               localStorage.setItem("k3a9r2b6m7t0x5w1s8j", encryptData(item));
  //               setCookie("k3a9r2b6m7t0x5w1s8j", encryptData(item), 1);
  //               router.push("/en/authorization/" + item.url);
  //             } else {
  //               toggleMenuXX(item.url);
  //             }
  //           }}
  //         >
  //           {/* side menu */}
  //           <section className="flex items-center gap-2 py-1">
  //             {(toggleNav && item?.icon) || null}
  //             {toggleNav ? (
  //               <h1 className={`break-words whitespace-normal text-[#757575] ${level === 0 ? "text-[14px]" : "text-[12px]"}`}>
  //                 <div
  //                   className={`flex justify-center items-center px-2 h-[26px] text-[#757575] ${(isHightLight(item.url) || isMenuExpanded) && "!text-[#000000]"} ${level === 0 ? "text-[14px]" : "text-[12px]"}`}
  //                 >
  //                   {item?.name || "-"}
  //                 </div>
  //               </h1>
  //             ) : (
  //               <TooltipWrapper text={item?.name || "Default tooltip"} placement="right">
  //                 <h1 className="text-[#757575]">{item?.icon || "-"}</h1>
  //               </TooltipWrapper>
  //             )}
  //           </section>

  //           {item?.menu?.length > 0 && toggleNav && (isMenuExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />)}
  //         </header>

  //         {toggleNav && isMenuExpanded && item?.menu?.length > 0 && (
  //           <section className="ml-5">
  //             {renderMenu(item.menu, level + 1)}
  //           </section>
  //         )}

  //       </section>
  //     );
  //   });
  // };


  const renderMenu = (list?: any[], level = 0) => {
    if (!list?.length) return null;

    return list.map((item, ix) => {
      const isLastItem = ix === list.length - 1;
      const expanded = isExpanded(item.url);

      return (
        <section
          key={`${level}-${ix}-${item.url ?? ix}`}
          className={`${!toggleNav ? "pl-[15px]" : "pl-[5px]"} ${level > 0 ? "pl-[12px]" : ""} relative pt-2 ${item?.menu?.length && toggleNav ? "" : "flex"}`}
        >

          {/* เส้นแนวตั้ง */}
          {level > 0 && (
            <span
              className="absolute left-0 top-0 border-l-2 border-gray-300"
              // style={{ height: isLastItem ? "20%" : "100%" }}
              style={{ height: (isLastItem && item?.id !== 1320) ? "25%" : (isLastItem && item?.id === 1320) ? "6%" : "100%" }}
            />
          )}

          {/* ข้องอ */}
          {level > 0 && (
            <span
              className="absolute mt-1 left-0 top-[11px] -translate-y-1/2 border-b-2 border-l-2 rounded-bl-lg border-gray-300"
              style={{ width: "15px", height: "15px" }}
            />
          )}

          {/* Header ของแถวเมนู */}
          <header
            className={`
              relative
              ${item?.menu?.length && toggleNav ? "grid grid-cols-[80%_20%]" : "flex"}
              items-center
              rounded-md
              cursor-pointer
              ${level > 0 ? "w-full" : !toggleNav ? "w-auto" : "w-full"}
              ${!toggleNav ? "pl-[5px] pr-[5px]" : "pl-[10px]"}
              ${isHightLight(item.url) || expanded
                ? `bg-[#F6F6F6] ${!toggleNav
                  ? "py-[0px]"
                  : item?.menu?.length && toggleNav
                    ? "py-[0px]"
                    : level > 0
                      ? "py-[0px]"
                      : "py-[10px]"
                }`
                : ""
              }
            `}
            onClick={() => {
              if (!toggleNav) {
                // โหมดย่อ
                handleClick(item);
              }

              if ((item?.menu ?? []).length === 0) {
                const key = "k3a9r2b6m7t0x5w1s8j";
                const enc = encryptData(item);
                localStorage.setItem(key, enc);
                setCookie(key, enc, 1);
                if (item.url) router.push("/en/authorization/" + item.url);
              } else {
                // node มีลูก: toggle expand/collapse
                toggleMenuXX(item.url);
              }

              // clear item หากย้ายไปหน้าอื่น (เฉพาะหน้า Capacity Contract Management)
              const path = localStorage.getItem("t9j5u3k2f0w7p1m4r6a");
              if(path){
                localStorage.removeItem("t9j5u3k2f0w7p1m4r6a");
                localStorage.setItem("i0y7l2w4o8c5v9b1r3z", encryptData('1'));
              }
            }}
            aria-expanded={expanded}
          >
            {/* ส่วนซ้ายของ header (ไอคอน + ข้อความ) */}
            <section className="flex items-center gap-2 py-1">
              {(toggleNav && item?.icon) || null}
              {toggleNav ? (
                <h1
                  className={`break-words whitespace-normal text-[#757575] ${level === 0 ? "text-[14px]" : "text-[12px]"}`}
                >
                  <div
                    className={`flex justify-center items-center px-2 h-[26px] text-[#757575] ${(isHightLight(item.url) || expanded) && "!text-[#000000]"} ${level === 0 ? "text-[14px]" : "text-[12px]"}`}
                  >
                    {item?.name || "-"}
                  </div>
                </h1>
              ) : (
                <TooltipWrapper text={item?.name || "Default tooltip"} placement="right">
                  <h1 className="text-[#757575]">{item?.icon || "-"}</h1>
                </TooltipWrapper>
              )}
            </section>

            {/* ลูกศรหมุนตอนขยาย/ยุบ */}
            {item?.menu?.length > 0 && toggleNav && (
              <span
                className={`justify-self-end transition-transform duration-200 ease-out ${expanded ? "rotate-180" : "rotate-0"}`}
              >
                <KeyboardArrowDownIcon />
              </span>
            )}
          </header>

          {/* เมนูย่อย: แอนิเมชัน auto-height + fade/translate */}
          {toggleNav && (item?.menu?.length ?? 0) > 0 && (
            <div
              className={`
                ml-5
                grid transition-[grid-template-rows] duration-300 ease-out
                ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}
              `}
            >
              <section
                className={`
                  overflow-hidden
                  transition-opacity duration-300 ease-out
                  ${expanded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}
                `}
              >
                {renderMenu(item.menu, level + 1)}
              </section>
            </div>
          )}
        </section>
      );
    });
  };


  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      // If click is outside the popup, close it
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        closePopup();
      }
    };
    if (popupVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popupVisible, closePopup]);

  // หน้า edit profile ไม่มี sideMenu
  if (pathname_profile === "/en/authorization/profile") {
    return <></>;
  } else {
    return (
      <nav
        // className={`relative h-[calc(100vh-50px-40px-0.5rem)]border-[#DFE4EA] border-[1px] p-2 rounded-tr-xl ${toggleNav ? "w-[300px] text-sm" : "w-[20px] text-[0px]"} duration-200 ease-in-out space-y-2`}
        className={`relative h-[calc(100vh-135px)] border-[#DFE4EA] border-[1px] p-2 rounded-tr-xl ${toggleNav ? "w-[250px] text-sm" : "w-[92px] text-[0px]"} duration-200 ease-in-out space-y-2`}
      >
        <div
          // className="absolute top-[20px] right-[-9px] border-[#DFE4EA] border-[1px] rounded-md cursor-pointer bg-white"
          className={`absolute top-[20px] right-[-9px] border-[#DFE4EA] border-[1px] rounded-md cursor-pointer bg-white `}
          onClick={() => setToggleNav(!toggleNav)}
        >
          {
            toggleNav ? <KeyboardArrowLeftIcon style={{ fontSize: "20px", marginBottom: "1px" }} /> : <KeyboardArrowRightIcon style={{ fontSize: "20px", marginBottom: "1px" }} />
          }
        </div>

        {/* Header section หัวเมนูใหญ่ */}
        <header className="whitespace-nowrap flex items-center gap-2 pl-[20px] !my-[20px]">
          {/* {(toggleNav && menu?.icon) || null}
          <h1>{menu?.name || "-"}</h1> */}
          {
            !toggleNav ?
              // <div className="pl-6">
              <div>
                <div>{menu?.icon}</div>
                <div className="my-3">
                  <hr className="border-[2px] border-[#F6F6F6] w-full mx-auto" />
                </div>
              </div>
              :
              <>
                {(toggleNav && menu?.icon) || null}
                <div className="w-[120px] break-words whitespace-normal ">
                  <h1 className="font-bold text-[18px]">{menu?.name || "-"}</h1>
                  <span className="text-[12px]">
                    v.{webVersion}
                  </span>
                </div>
              </>
          }
        </header>

        <div className="h-[calc(100vh-245px)] flex flex-col overflow-hidden">
          <div className="overflow-y-auto h-full scrollbar-hide">
            {renderMenu(menu?.menu || [])}
          </div>
        </div>
        {/* Rendering the menu */}

        {popupVisible && selectedMenu && (
          <div
            ref={popupRef}
            className="absolute bg-white shadow-lg rounded-[20px] p-4 border w-[200px] !z-50"
            style={{ top: anchorPosition.top + 70, left: anchorPosition.left + 60 }}
          >
            <h2 className="text-lg font-bold mb-2">{selectedMenu.name}</h2>
            <ul>
              {selectedMenu?.map((subMenu: any) => (
                <li key={subMenu.id} className="mb-2">
                  <Link href={`/en/authorization/${subMenu?.url}`} passHref>
                    <MenuItem className="-mx-1 text-[14px]" onClick={closePopup}>{subMenu.name}</MenuItem>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    );
  }
};

export default NavMenu;