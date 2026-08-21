"use client";

// import Link from "next/link";
// import { lazy, Suspense, useEffect, useState } from "react";
// import { useTranslation } from "@/app/i18n/client";
// import LocalSwitcher from "@/utils/LocalSwitcher";
// import ThemeMode from "@/utils/ThemeMode";
// import { useDispatch, useSelector } from "react-redux";
// import { setExample } from "@/utils/store/slices/exampleSlice";
// import dayjs from "dayjs";
// import Swal from "sweetalert2";
// import { DrawerDefault } from "@/components/material_custom/DrawerDefault";
// import { LabeledValue } from "@/Interfaces/Interfaces";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// import { driver } from "driver.js";
import "driver.js/dist/driver.css";
// import { useKBar } from "kbar";
import React from "react";
// import {
//   resetState,
//   setExamplePersist,
// } from "@/utils/store/slices/exampleSlicePersist";
// import { persistor } from "@/utils/store/store";
// import HelpIcon from '@mui/icons-material/Help';
// // import ReactFlowLib from "../other/ReactFlowLib";

// import { DateRangePicker } from "react-date-range";
// import { addDays, format, isWeekend } from "date-fns";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file
// import CloseIcon from "@mui/icons-material/Close";
// import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
// import DateRang from "../library/dateRang/DateRang";
// import DateRangOnce from "../library/dateRang/DateRangOnce";
// import CustomCopyClip from "../library/customCopyClip/CustomCopyClip";

// const queryClient = new QueryClient();

interface ClientProps {
  params: {
    lng: string;
  };
}

const ClientContent: React.FC<ClientProps> = (props) => {
  // const {
  //   params: { lng },
  // } = props;
  // const { t } = useTranslation(lng, "client");
  // const { query } = useKBar();
  // const dispatch = useDispatch();
  // const exampleReducer = useSelector((state: any) => state.exampleReducer);
  // const { exampleId } = exampleReducer;
  // const examplePersistReducer = useSelector(
  //   (state: any) => state.examplePersistReducer
  // );
  // const { exampleIdPersist } = examplePersistReducer;
  // const [dateDemo, setDateDemo] = useState("");

  // const alertBtn = async () => {
  //   Swal.fire({
  //     title: "success!",
  //     text: "OMG.",
  //     icon: "success",
  //     confirmButtonText: "Cool",
  //   });
  // };

  // const labelDemos = (value: LabeledValue) => `${value.labelDemo} 555.`;

  // const helpDemo = async () => {
  //   const driverObj = driver({
  //     showProgress: true,
  //     steps: [
  //       {
  //         element: "#locale",
  //         popover: { title: "locale", description: "สำหรับเปลี่ยนภาษา" },
  //       },
  //       {
  //         element: "#theme",
  //         popover: { title: "theme", description: "สำหรับ Theme Mode" },
  //       },
  //       {
  //         element: "#redux",
  //         popover: { title: "redux", description: "เป็น store กลาง ทำให้ใช้ state ร่วมกันได้ทุกที่ (รีเฟรชหาย)" },
  //       },
  //       {
  //         element: "#redux-persist",
  //         popover: { title: "redux-persist", description: "เป็น store กลาง ทำให้ใช้ state ร่วมกันได้ทุกที่ (รีเฟรชไม่หาย)" },
  //       },
  //       {
  //         element: "#format",
  //         popover: { title: "format", description: "library สำหรับจัดการวันที่ต่างๆ" },
  //       },
  //       {
  //         element: "#library-components",
  //         popover: { title: "library-components", description: "library Components ต่างๆ" },
  //       },
  //       {
  //         element: "#interfaces",
  //         popover: { title: "interfaces", description: "ตัวอย่าง Interfaces Typescript" },
  //       },
  //       {
  //         element: "#k-bar",
  //         popover: { title: "k-bar", description: "ตัวอย่าง การใช้งาน k-bar" },
  //       },
  //       {
  //         element: "#alert",
  //         popover: { title: "alert", description: "ตัวอย่าง การใช้งาน alert" },
  //       },
  //       {
  //         element: "#link",
  //         popover: { title: "link", description: "ตัวอย่าง การใช้งาน link page" },
  //       },
  //       {
  //         element: "#apis",
  //         popover: { title: "apis", description: "ตัวอย่าง การใช้งาน api / lazy load / react query" },
  //       },
  //       {
  //         element: "#flow",
  //         popover: { title: "flow", description: "ตัวอย่าง การใช้งาน Flow" },
  //       },
  //       {
  //         element: "#table",
  //         popover: { title: "table", description: "ตัวอย่าง การ UI Table" },
  //       },
  //     ],
  //   });

  //   driverObj.drive();
  // };

  // useEffect(() => {
  //   setDateDemo(dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss"));
  // }, []);

  return <></>


  // return (
  //   <QueryClientProvider client={queryClient}>
  //     <h1 className=" text-red-300 dark:text-green-300">{t("clientPage")}</h1>
  //     <hr />
  //     <div>
  //       ref :{" "}
  //       <a
  //         href="https://driverjs.com/docs/basic-usage"
  //         target="_blank"
  //         rel="noopener noreferrer"
  //       >
  //         https://driverjs.com/docs/basic-usage
  //       </a>
  //     </div>
  //     <div onClick={() => { helpDemo() }} className=" cursor-pointer">
  //       <HelpIcon />
  //       <span>{`วิธีการใช้งาน`}</span>
  //     </div>
  //     <hr />
  //     <div id="locale" className=" w-fit">
  //       <LocalSwitcher />
  //     </div>
  //     <hr />
  //     <div id="theme" className=" w-fit">
  //       <ThemeMode />
  //     </div>
  //     <hr />
  //     <hr />
  //     <div id="redux" className=" w-fit">
  //       <div>
  //         ref :{" "}
  //         <a
  //           href="https://redux-toolkit.js.org/"
  //           target="_blank"
  //           rel="noopener noreferrer"
  //         >
  //           https://redux-toolkit.js.org/
  //         </a>
  //       </div>
  //       <div>redux store : {exampleId}</div>
  //       <div
  //         onClick={() => {
  //           dispatch(setExample(exampleId));
  //         }}
  //         className=" cursor-pointer"
  //       >
  //         update store
  //       </div>
  //     </div>
  //     <hr />
  //     <div id="redux-persist" className=" w-fit">
  //       <div>
  //         ref :{" "}
  //         <a
  //           href="https://github.com/rt2zz/redux-persist"
  //           target="_blank"
  //           rel="noopener noreferrer"
  //         >
  //           https://github.com/rt2zz/redux-persist
  //         </a>
  //       </div>
  //       <div>redux store persist : {exampleIdPersist}</div>
  //       <div
  //         onClick={() => {
  //           dispatch(setExamplePersist(exampleIdPersist));
  //         }}
  //         className=" cursor-pointer"
  //       >
  //         update store persist
  //       </div>
  //       <div
  //         onClick={() => {
  //           persistor.purge().then(() => {
  //             dispatch(resetState());
  //           });
  //         }}
  //         className=" cursor-pointer"
  //       >
  //         clear store persist
  //       </div>
  //     </div>
  //     <hr />
  //     <div id="format" className=" w-fit">
  //       formate date : {dateDemo}
  //     </div>
  //     <hr />
  //     <div id="library-components" className=" w-fit">
  //       <h1>
  //         ใช้ library :{" "}
  //         <a
  //           href="https://www.material-tailwind.com/"
  //           target="_blank"
  //           rel="noopener noreferrer"
  //         >
  //           https://www.material-tailwind.com/
  //         </a>
  //       </h1>
  //       <DrawerDefault />
  //     </div>
  //     <hr />
  //     <div id="interfaces" className=" w-fit">interfaces : {labelDemos({ labelDemo: "Hello" })}</div>
  //     <hr />
  //     <div id="k-bar" className=" w-fit">
  //       Key :
  //       <button
  //         type="button"
  //         className=" p-[3px] bg-[#58585A] text-[#ffffff] rounded-sm text-[10px] mx-3"
  //         onClick={query.toggle}
  //       >
  //         <div className=" flex items-center justify-center font-bold">
  //           {`⌘K`}
  //         </div>
  //       </button>
  //     </div>
  //     <hr />
  //     <div id="alert" className=" w-fit">
  //       <h1>
  //         ใช้ library :{" "}
  //         <a
  //           href="https://sweetalert2.github.io/"
  //           target="_blank"
  //           rel="noopener noreferrer"
  //         >
  //           https://sweetalert2.github.io/
  //         </a>
  //       </h1>
  //       <div className=" cursor-pointer" onClick={alertBtn}>
  //         alert
  //       </div>
  //     </div>
  //     <hr />
  //     <div id="link" className=" w-fit">
  //       <Link href={`/${lng}`} prefetch={true}>
  //         {t("gotoHome")}
  //       </Link>
  //     </div>
  //     <hr />
  //     <hr />
  //     <div id="flow" className=" h-[50vh] w-[100vw]">
  //       <ReactFlowLib />
  //     </div>
  //     <hr />
  //     <div>
  //       <DateRang />
  //     </div>
  //     <hr />
  //     <div className=" py-5">
  //       <DateRangOnce />
  //     </div>
  //     <hr />
  //     <hr />
  //     <hr />
  //     <hr />
  //     <hr />
  //     <div className=" py-5">
  //       <CustomCopyClip />
  //     </div>
  //     <hr />
  //     <ReactQueryDevtools initialIsOpen={false} />
  //   </QueryClientProvider>
  // );
};

export default ClientContent;

// function DateRang() {
//   const [collapsed, setCollapsed] = useState(false);
//   const [focusTab, setFocusTab] = useState<any>(null);
//   const [state, setState] = useState({
//     selection1: {
//       startDate: addDays(new Date(), -6),
//       endDate: new Date(),
//       key: "selection1",
//     },
//   });
//   const [eventDate, setEventDate] = useState([
//     {
//       id: 1,
//       date: "2024-03-12",
//       message: "วันพ่อแห่งชาติ",
//     },
//     {
//       id: 2,
//       date: "2024-02-20",
//       message: "วันแม่แห่งชาติ",
//     },
//     {
//       id: 3,
//       date: "2024-02-22",
//       message: "วันตาแห่งชาติ",
//     },
//   ]);
//   const [messageEvent, setMessageEvent] = useState("");
//   const [countDay, setCountDay] = useState(0);

//   function customDayContent(day: any) {
//     // let extraDot = null;
//     // if (isWeekend(day)) {
//     //   extraDot = (
//     //     <div
//     //       style={{
//     //         height: "5px",
//     //         width: "5px",
//     //         borderRadius: "100%",
//     //         background: "orange",
//     //         position: "absolute",
//     //         top: 2,
//     //         right: 2,
//     //       }}
//     //     />
//     //   )
//     // }
//     return (
//       <div
//         onMouseEnter={() => handleMouseEnter(day)}
//         onMouseLeave={() => handleMouseLeave(day)}
//       >
//         {/* {extraDot} */}
//         {(eventDate || []).map((e: any, i: number) => {
//           return (
//             (dayjs(day).format("YYYY-MM-DD") === e?.date && (
//               <div
//                 key={i}
//                 style={{
//                   height: "5px",
//                   width: "5px",
//                   borderRadius: "100%",
//                   background: "orange",
//                   position: "absolute",
//                   top: 2,
//                   right: 2,
//                 }}
//               />
//             )) ||
//             null
//           );
//         })}
//         <span>{format(day, "d")}</span>
//       </div>
//     );
//   }

//   function handleMouseEnter(day: any) {
//     let fil = (eventDate || []).find((f: any) => {
//       return f?.date === dayjs(day).format("YYYY-MM-DD");
//     });
//     if (!!fil) {
//       setMessageEvent(fil?.message);
//     } else {
//       setMessageEvent("");
//     }
//   }

//   function handleMouseLeave(day: any) {}

//   const [focusedInput, setFocusedInput] = useState(null);

//   const handleFocusChange = (focusedInput: any) => {
//     setFocusTab(focusedInput);
//   };

//   useEffect(() => {
//     let daystart = dayjs(state?.selection1?.startDate).format("YYYY-MM-DD");
//     let dayend = dayjs(state?.selection1?.endDate).format("YYYY-MM-DD");
//     let startDate = dayjs(daystart);
//     let endDate = dayjs(dayend);

//     let daysAway = endDate.diff(startDate, "day");
//     setCountDay(daysAway || 0);

//   }, [state]);

//   useEffect(() => {
//     if (!collapsed) {
//       setFocusTab(null);
//     }
//   }, [collapsed]);

//   return (
//     <div className=" w-fit min-w-[680px] relative">
//       <div className="grid grid-cols-2 border-[2px] border-[#eff2f7] bg-[#eff2f7] rounded-md">
//         <div
//           className="bg-[#ffffff] px-2 py-1 flex justify-start items-center cursor-pointer gap-2"
//           onClick={() => {
//             focusTab === 0 ? setCollapsed(false) : setCollapsed(true);
//             setFocusTab(0);
//           }}
//         >
//           <CalendarTodayIcon />
//           <div>
//             <div>
//               {dayjs(state?.selection1?.startDate).format("DD MMM YYYY")}
//             </div>
//             <div className=" text-gray-400 text-sm">
//               {dayjs(state?.selection1?.startDate).format("dddd")}
//             </div>
//           </div>
//         </div>
//         <div
//           className="bg-[#ffffff] px-2 py-1 flex justify-start items-center cursor-pointer gap-2 border-l-[1px]"
//           onClick={() => {
//             focusTab === 1 ? setCollapsed(false) : setCollapsed(true);
//             setFocusTab(1);
//           }}
//         >
//           <CalendarTodayIcon />
//           <div>
//             <div>{dayjs(state?.selection1?.endDate).format("DD MMM YYYY")}</div>
//             <div className=" text-gray-400 text-sm">
//               {dayjs(state?.selection1?.endDate).format("dddd")}
//             </div>
//           </div>
//         </div>
//       </div>
//       {collapsed && (
//         <div className=" absolute z-10">
//           <div className="grid grid-cols-2">
//             <div>
//               {focusTab === 0 && (
//                 <div
//                   className="ml-2 w-0 h-0 
//             border-l-[10px] border-l-transparent
//             border-b-[15px] border-b-[#ffffff]
//             border-r-[10px] border-r-transparent"
//                 ></div>
//               )}
//             </div>
//             <div>
//               {focusTab === 1 && (
//                 <div
//                   className="ml-2 w-0 h-0 
//             border-l-[10px] border-l-transparent
//             border-b-[15px] border-b-[#ffffff]
//             border-r-[10px] border-r-transparent"
//                 ></div>
//               )}
//             </div>
//           </div>
//           <div className=" bg-[#ffffff] rounded-md p-2">
//             {/* @ts-ignore */}
//             <DateRangePicker
//               focusedRange={[0, focusTab]}
//               editableDateInputs={false}
//               onChange={(item: any) => {
//                 focusTab === 1 ? setFocusTab(0) : setFocusTab(1);
//                 // focusTab === 1 && setCollapsed(false)
//                 return setState({ ...state, ...item });
//               }}
//               showSelectionPreview={true}
//               moveRangeOnFirstSelection={false}
//               months={2}
//               ranges={[state.selection1]}
//               direction="horizontal"
//               dayContentRenderer={customDayContent}
//               ariaLabels={{
//                 dateInput: {
//                   selection1: {
//                     startDate: "start date input of selction 1",
//                     endDate: "end date input of selction 1",
//                   },
//                 },
//                 monthPicker: "month picker",
//                 yearPicker: "year picker",
//                 prevButton: "previous month button",
//                 nextButton: "next month button",
//               }}
//             />
//             <div className=" flex justify-between items-end">
//               <div>
//                 <div className=" text-blue-500">{`จำนวน : ${
//                   countDay + 1 || 1
//                 } วัน`}</div>
//                 <div className=" text-red-500">{`วันสำคัญ : ${
//                   messageEvent || "-"
//                 }`}</div>
//               </div>
//               <div>
//                 <button
//                   className=" border-[1px] rounded-md px-3 py-1 text-[12px] flex items-center gap-1"
//                   onClick={() => {
//                     setCollapsed(false);
//                   }}
//                 >
//                   <CloseIcon style={{ fontSize: "12px" }} />
//                   <span>ปิด</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

