import React, { useEffect, useState, useRef } from "react";
// @ts-ignore
import { DateRangePicker } from "react-date-range";
import { addDays, format, isWeekend } from "date-fns";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file
import dayjs from "dayjs";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

function DateRang() {
  const [collapsed, setCollapsed] = useState(false);
  const [focusTab, setFocusTab] = useState<any>(null);
  const [state, setState] = useState({
    selection1: {
      startDate: addDays(new Date(), -6),
      endDate: new Date(),
      key: "selection1",
    },
  });

  
  const [eventDate, setEventDate] = useState([
    {
      id: 1,
      date: "2024-03-12",
      message: "วันพ่อแห่งชาติ",
    },
    {
      id: 2,
      date: "2024-02-20",
      message: "วันแม่แห่งชาติ",
    },
    {
      id: 3,
      date: "2024-02-22",
      message: "วันตาแห่งชาติ",
    },
  ]);



  const [messageEvent, setMessageEvent] = useState("");
  const [countDay, setCountDay] = useState(0);

  function customDayContent(day: any) {
    // let extraDot = null;
    // if (isWeekend(day)) {
    //   extraDot = (
    //     <div
    //       style={{
    //         height: "5px",
    //         width: "5px",
    //         borderRadius: "100%",
    //         background: "orange",
    //         position: "absolute",
    //         top: 2,
    //         right: 2,
    //       }}
    //     />
    //   )
    // }
    return (
      <div
        onMouseEnter={() => handleMouseEnter(day)}
        onMouseLeave={() => handleMouseLeave(day)}
      >
        {/* {extraDot} */}
        {(eventDate || []).map((e: any, i: number) => {
          return (
            (dayjs(day).format("YYYY-MM-DD") === e?.date && (
              <div
                key={i}
                style={{
                  height: "5px",
                  width: "5px",
                  borderRadius: "100%",
                  background: "orange",
                  position: "absolute",
                  top: 2,
                  right: 2,
                }}
              />
            )) ||
            null
          );
        })}
        <span>{format(day, "d")}</span>
      </div>
    );
  }

  function handleMouseEnter(day: any) {
    let fil = (eventDate || []).find((f: any) => {
      return f?.date === dayjs(day).format("YYYY-MM-DD");
    });
    if (!!fil) {
      setMessageEvent(fil?.message);
    } else {
      setMessageEvent("");
    }
  }

  function handleMouseLeave(day: any) {}

  const [focusedInput, setFocusedInput] = useState(null);

  const handleFocusChange = (focusedInput: any) => {
    setFocusTab(focusedInput);
  };

  useEffect(() => {
    let daystart = dayjs(state?.selection1?.startDate).format("YYYY-MM-DD");
    let dayend = dayjs(state?.selection1?.endDate).format("YYYY-MM-DD");
    let startDate = dayjs(daystart);
    let endDate = dayjs(dayend);

    let daysAway = endDate.diff(startDate, "day");
    setCountDay(daysAway || 0);

  }, [state]);

  useEffect(() => {
    if (!collapsed) {
      setFocusTab(null);
    }
  }, [collapsed]);

  return (
      <div className=" w-fit min-w-[680px] relative">
        <div className="grid grid-cols-2 border-[2px] border-[#eff2f7] bg-[#eff2f7] rounded-md">
          <div
            className="bg-[#ffffff] px-2 py-1 flex justify-start items-center cursor-pointer gap-2"
            onClick={() => {
              focusTab === 0 ? setCollapsed(false) : setCollapsed(true);
              setFocusTab(0);
            }}
          >
            <CalendarTodayIcon />
            <div>
              <div>
                {dayjs(state?.selection1?.startDate).format("DD MMM YYYY")}
              </div>
              <div className=" text-gray-400 text-sm">
                {dayjs(state?.selection1?.startDate).format("dddd")}
              </div>
            </div>
          </div>
          <div
            className="bg-[#ffffff] px-2 py-1 flex justify-start items-center cursor-pointer gap-2 border-l-[1px]"
            onClick={() => {
              focusTab === 1 ? setCollapsed(false) : setCollapsed(true);
              setFocusTab(1);
            }}
          >
            <CalendarTodayIcon />
            <div>
              <div>
                {dayjs(state?.selection1?.endDate).format("DD MMM YYYY")}
              </div>
              <div className=" text-gray-400 text-sm">
                {dayjs(state?.selection1?.endDate).format("dddd")}
              </div>
            </div>
          </div>
        </div>
        {collapsed && (
          <div className=" absolute">
            <div className="grid grid-cols-2">
              <div>
                {focusTab === 0 && (
                  <div
                    className="ml-2 w-0 h-0 
            border-l-[10px] border-l-transparent
            border-b-[15px] border-b-[#ffffff]
            border-r-[10px] border-r-transparent"
                  ></div>
                )}
              </div>
              <div>
                {focusTab === 1 && (
                  <div
                    className="ml-2 w-0 h-0 
            border-l-[10px] border-l-transparent
            border-b-[15px] border-b-[#ffffff]
            border-r-[10px] border-r-transparent"
                  ></div>
                )}
              </div>
            </div>
            <div className=" bg-[#ffffff] rounded-md p-2">
              {/* @ts-ignore */}
              <DateRangePicker
                focusedRange={[0, focusTab]}
                editableDateInputs={false}
                onChange={(item: any) => {
                  focusTab === 1 ? setFocusTab(0) : setFocusTab(1);
                  // focusTab === 1 && setCollapsed(false)
                  return setState({ ...state, ...item });
                }}
                // showSelectionPreview={true}
                moveRangeOnFirstSelection={false}
                months={2}
                ranges={[state.selection1]}
                direction="horizontal"
                dayContentRenderer={customDayContent}
                ariaLabels={{
                  dateInput: {
                    selection1: {
                      startDate: "start date input of selction 1",
                      endDate: "end date input of selction 1",
                    },
                  },
                  monthPicker: "month picker",
                  yearPicker: "year picker",
                  prevButton: "previous month button",
                  nextButton: "next month button",
                }}
              />
              <div className=" flex justify-between items-end">
                <div>
                  <div className=" text-blue-500">{`จำนวน : ${
                    countDay + 1 || 1
                  } วัน`}</div>
                  <div className=" text-red-500">{`วันสำคัญ : ${
                    messageEvent || "-"
                  }`}</div>
                </div>
                <div>
                  <button
                    className=" border-[1px] rounded-md px-3 py-1 text-[12px] flex items-center gap-1"
                    onClick={() => {
                      setCollapsed(false);
                    }}
                  >
                    <CloseIcon style={{ fontSize: "12px" }} />
                    <span>ปิด</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}

export default DateRang;
