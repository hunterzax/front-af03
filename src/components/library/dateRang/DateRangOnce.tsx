import React, { useState, forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './custom-datepicker.css'; // ใช้ไฟล์ custom CSS ที่เราสร้างเอง
import { Tooltip } from 'react-tooltip'; // นำเข้า Tooltip แบบใหม่
import 'react-tooltip/dist/react-tooltip.css'; // นำเข้า CSS ของ Tooltip

type Props = {}

// Custom Input component สำหรับใช้กับ DatePicker
const CustomInput = forwardRef(({ value, onClick }: any, ref:any) => (
  <button
    className="custom-date-input px-[10px] py-[5px] text-[16px] cursor-pointer border-[2px] border-[#fee86f] w-[200px]"
    onClick={onClick}
    ref={ref}
  >
    {value || 'เลือกวันที่'}
  </button>
));

function DateRangOnce({}: Props) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [eventDate, setEventDate] = useState([
    {
      id: 1,
      date: new Date("2024-09-12"),
      message: "วันพ่อแห่งชาติ",
    },
    {
      id: 2,
      date: new Date("2024-09-20"),
      message: "วันแม่แห่งชาติ",
    },
    {
      id: 3,
      date: new Date("2024-09-22"),
      message: "วันตาแห่งชาติ",
    },
  ]);

  // เช็คว่ามี event ในวันที่เลือกหรือไม่
  const getHighlightedDate = (date: Date) => {
    const event = eventDate.find((e) => {
      return (
        date.getFullYear() === e.date.getFullYear() &&
        date.getMonth() === e.date.getMonth() &&
        date.getDate() === e.date.getDate()
      );
    });
    return event ? event.message : null;
  };

  return (
    <div>
      <DatePicker
        selected={selectedDate}
        onChange={(date: Date | null) => setSelectedDate(date)}
        inline={false} // ไม่แสดงปฏิทินตลอด แต่จะเปิดเมื่อคลิก
        customInput={<CustomInput />} // ใช้ custom input ที่เราปรับแต่ง
        popperPlacement="bottom-start"  // จัดตำแหน่งให้ปฏิทินแสดงด้านล่าง
        withPortal={false} // true จะแสดงเต็มจอ
        renderDayContents={(day, date) => {
          const eventMessage = date ? getHighlightedDate(date) : null;
          const tooltipId = `tooltip-${day}`; // กำหนด ID สำหรับ Tooltip

          return (
            <div style={{ position: 'relative' }}>
              <span>{day}</span>
              {/* แสดงจุดถ้ามี event */}
              {eventMessage && (
                <span
                  id={tooltipId} // ใช้ ID เพื่อเชื่อมกับ Tooltip
                  style={{
                    width: '6px',
                    height: '6px',
                    backgroundColor: 'red',
                    borderRadius: '50%',
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                  }}
                ></span>
              )}
              {/* Tooltip ที่แสดงเมื่อ hover บนจุดสีแดง */}
              {eventMessage && (
                <Tooltip anchorId={tooltipId} place="top">
                  {eventMessage}
                </Tooltip>
              )}
            </div>
          );
        }}
      />
    </div>
  );
}

export default DateRangOnce;
