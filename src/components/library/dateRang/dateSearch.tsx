import React, { useState, forwardRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './custom-datepicker.css'; // ใช้ไฟล์ custom CSS ที่เราสร้างเอง
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import "@/app/globals.css";
import { addYears } from "date-fns";
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import { CustomTooltip } from '@/components/other/customToolTip';


//!!!! Manual to use date pic ka search !!!!
// 1.เช็ค key ให้ดีทั้งที่ Components และจุดที่ resetFilter (code: setKey((prevKey) => prevKey + 1);)
// 2.กลับไปดูข้อแรก
// ======================================================================================

interface DatePickerSectionProps {
  label: any;
  onChange: (date: any) => void;
  placeHolder?: string;
  allowClear?: boolean;
  disabledTooltipInfo?: boolean;
  min?: any
  max?: any
  isDefaultToday?: any // set วันที่ default วันนี้
  isDefaultYesterday?: any // set วันที่ default เมื่อวาน
  isDefaultFirstDayOfMonth?: any  // set วันที่ default วันที่ 1 ของเดือนปัจจุบัน
  isDefaultTomorrow?: any // set วันที่ default พรุ่งนี้
  isGasWeekPlusOne?: any  // set วันที่ default วันอาทิตย์หน้า
  isGasWeek?: any  // calendar แสดงให้กดได้แค่วันเสาร์อาทิตย์
  isGasDay?: any
  isToday?: any
  isFixDay?: any
  dateToFix?: any
  modeSearch?: any
  customWidth?: number | undefined;
  disabled?: boolean
  defaultValue?: any // ส่งวันเข้ามา
}

const styles = {
  icon: {
    width: 15,
    height: 15,
    color: '#000000'
  }
};

const DatePickaSearch: React.FC<DatePickerSectionProps> = ({
  label,
  onChange,
  placeHolder = "เลือกวันที่",
  allowClear = false,
  disabledTooltipInfo = true,
  min,
  max,
  isDefaultFirstDayOfMonth,
  isDefaultToday,
  isDefaultYesterday,
  isDefaultTomorrow,
  isGasWeekPlusOne,
  isGasWeek,
  isGasDay,
  isToday,
  isFixDay,
  dateToFix,
  modeSearch,
  customWidth = undefined,
  disabled = false,
  defaultValue
}) => {
  const [selectedDate, setSelectedDate] = useState<any>();

  useEffect(() => {
    if (defaultValue) {
      console.log('defaultValue : ', defaultValue);
      console.log(dayjs(defaultValue).toISOString());
      setSelectedDate(dayjs(defaultValue).toISOString())
    }
  }, [defaultValue])

  useEffect(() => {
    console.log('selectedDate : ', selectedDate);
  }, [selectedDate])
  

  // useEffect(() => {
  //   if (isFixDay) {
  //     // Invalid time value
  //     setSelectedDate(dayjs(dateToFix).toISOString())
  //   }
  // }, [isFixDay])

  useEffect(() => {
    if (!isFixDay) return;

    if (!dateToFix) {
      setSelectedDate(null); // หรือจะไม่ทำอะไรเลยก็ได้
      return;
    }

    const d = dayjs(dateToFix);
    if (!d.isValid()) {
      setSelectedDate(null);
      return;
    }
    console.log('d : ', d.toISOString());
    setSelectedDate(d.toISOString());
  }, [isFixDay, dateToFix]);

  useEffect(() => {
    if (isDefaultFirstDayOfMonth) {
      const firstDay = dayjs().startOf('month').toISOString();
      setSelectedDate(firstDay);
    }
  }, [isDefaultFirstDayOfMonth]);

  useEffect(() => {
    if (isDefaultToday) {
      setSelectedDate(dayjs().toISOString())
    }
  }, [isDefaultToday])

  useEffect(() => {
    if (isDefaultYesterday) {
      setSelectedDate(dayjs().subtract(1, 'day').toISOString());
    }
  }, [isDefaultYesterday])

  useEffect(() => {
    if (isDefaultTomorrow) {
      setSelectedDate(dayjs().add(1, 'day').toISOString()); // ➔ เพิ่ม 1 วัน
    }
  }, [isDefaultTomorrow])

  useEffect(() => {
    if (isGasWeek) {
      //  const lastSunday = dayjs().day(0).isAfter(dayjs()) ? dayjs().subtract(1, 'week').day(0) : dayjs().day(0);
      // setSelectedDate(lastSunday.toISOString());
      let lastSunday
        // console.log('1........');

      if (defaultValue) {
        setSelectedDate(dayjs(defaultValue).toISOString());
      } else {
        // 
        // console.log('........');
        //  const defaultDate = dayjs().format("YYYY-MM-DD");
        //     let baseDate = dayjs(defaultDate); // ใช้วันนี้เป็นตัวตัดสิน
        //     const dayOfWeek = baseDate.day(); // 0 = อาทิตย์, 5 = ศุกร์, 6 = เสาร์
              // ถ้าเป็น ศุกร์ (5) หรือ เสาร์ (6) → เอาอาทิตย์สัปดาห์หน้า
              lastSunday = (dayjs().day() === 5 || dayjs().day() === 6 ? dayjs().add(1, 'week').day(0) : dayjs().day(0))
              setSelectedDate(lastSunday.toISOString());
              // if (dayOfWeek === 5 || dayOfWeek === 6) {
              //   lastSunday = baseDate.add(1, 'week').day(0)// ไปอาทิตย์สัปดาห์หน้า
              //   // lastSunday = baseDate.add(1, 'week').startOf("week")// ไปอาทิตย์สัปดาห์หน้า
              //   console.log('lastSunday : ', lastSunday);
              //   setSelectedDate(lastSunday.toISOString());
              // } else {
              //   lastSunday = dayjs().day(0).isAfter(dayjs()) ? dayjs().subtract(1, 'week').day(0) : dayjs().day(0);
              //   setSelectedDate(lastSunday.toISOString());
              // }

      

      }
    }
  }, [isGasWeek]);

  useEffect(() => {
    if (isGasWeek && isGasWeekPlusOne) {

      // set select date next sunday week
      const today = dayjs();
      const nextSunday = today.day() === 0 ? today.add(7, 'day') : today.add(7 - today.day(), 'day');
      setSelectedDate(nextSunday.toISOString());

    }
  }, [isGasWeek, isGasWeekPlusOne]);

  useEffect(() => {
    if (isGasDay) {
      const tomorrowDay = dayjs().add(1, 'day'); // Just add 1 day
      setSelectedDate(tomorrowDay.toISOString());
    }
  }, [isGasDay]);

  useEffect(() => {
    if (isToday) {
      const tomorrowDay = dayjs();
      setSelectedDate(tomorrowDay.toISOString());
    }
  }, [isToday]);

  const CustomInput = forwardRef(({ value, onClick }: any, ref: any) => {
    return (
      <div>
        <button
          // className={`custom-date-input px-[10px] py-[5px] text-sm cursor-pointer border rounded-lg w-[160px] h-[35px] z-[4] text-left bg-white ${value ? 'text-[#bdbdbd]' : 'text-[#b9b9b9]'}`}
          className={`custom-date-input px-[10px] py-[5px] !text-[12px] cursor-pointer border-[1px] border-[#DFE4EA] rounded-lg h-[35px] z-[1] text-left bg-white ${value ? 'text-[#464255]' : 'text-[#9CA3AF]'}`}
          onClick={onClick}
          ref={ref}
          style={{
            width: customWidth ? String(customWidth + "px") : "160px",
            background: disabled == true ? '#f1f1f1' : '#fff',
          }}
        >
          <div className=' overflow-ellipsis overflow-hidden whitespace-nowrap !text-[14px] w-[90%]'>
            {/* {value || placeHolder} */}
            {value ? dayjs(selectedDate)?.format('DD/MM/YYYY') : placeHolder}
          </div>
        </button>
        {value && allowClear == true ?
          <button
            style={{ position: "absolute", top: "5px", right: "5px", zIndex: 5 }}
            onClick={() => {
              onChange(undefined);
              setSelectedDate(undefined)
            }}
          >
            <CloseIcon style={styles.icon} />
          </button>
          :
          <button
            // style={{ position: "absolute", top: "5px", right: "5px", zIndex: 10 }}
            className="absolute top-[5px] right-[5px] !z-[0]"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            <CalendarTodayOutlinedIcon style={styles.icon} />
          </button>
        }
      </div>
    )
  }
  );

  const [currentMonthX, setCurrentMonthX] = useState(dayjs().month() + 1); // Initialize with the current month

  const handleMonthChange = (date: any) => {
    const month = dayjs(date).month(); // Get the 0-indexed month
    setCurrentMonthX(month + 1);
  };

  const handleChange = (date: Date) => {
    // Remove time from the selected date to avoid date shift (e.g., 31 Dec changing to 1 Jan next year)
    const adjustedDate = new Date(date);
    adjustedDate.setHours(0, 0, 0, 0); // Ensure time is reset to 00:00:00
    onChange(adjustedDate)
    setSelectedDate(adjustedDate);
  };

  return (
    <section className="relative z-15">
      <label className="mb-2 text-[14px] text-[#58585A] flex items-center gap-2">
        {label}
        {disabledTooltipInfo == true && (placeHolder === "Select Start Date" || placeHolder === "Start Date" || placeHolder === "Select End Date" || placeHolder === "End Date") && (
          <CustomTooltip
            title={
              <div>
                {(placeHolder === "Select Start Date" || placeHolder === "Start Date") ? (
                  <p className="text-[#464255] font-light">
                    {/* {`The start date filter will search for data where the start date is on or before the selected date.`} */}
                    {`Select the filter Start Date to display records with an End Date on or after that date.`}
                  </p>
                ) : (
                  <p className="text-[#464255] font-light">
                    {/* {`The end date filter will search for data where the end date is on or after the selected date.`} */}
                    {`Select the filter End Date to display records with a Start Date on or before that date.`}
                  </p>
                )}
              </div>
            }
            placement="top-end"
            arrow
          >
            <div className="w-[20px] h-[20px] flex items-center justify-center rounded-lg cursor-pointer">
              <InfoOutlinedIcon sx={{ fontSize: 16 }} />
            </div>
          </CustomTooltip>
        )}

      </label>

      {/* <div>{selectedDate && dayjs(selectedDate)?.format('DD/MM/YYYY')}</div> */}
      
      {/* ทำไว้รองรับแสดงผลวันอาทิตย์อย่างเดียว */}
      <DatePicker
        // selected={defaultValue && selectedDate || null}
        selected={selectedDate}
        // dateFormat={"d/MM/YYYY"} // ทุกการลงทุนมีความเสี่ยง today is 11/7/2025
        dateFormat={"dd/MM/YYYY"}
        peekNextMonth
        showMonthDropdown
        showYearDropdown
        dropdownMode="scroll"
        scrollableYearDropdown={true}
        yearDropdownItemNumber={56}
        onMonthChange={handleMonthChange}
        minDate={min}
        maxDate={max ? max : addYears(new Date(), 56)} // Optional: Define a max date if needed
        onChange={(e: any) => {
          onChange(e);
          setSelectedDate(e);
        }}
        inline={false} // ไม่แสดงปฏิทินตลอด แต่จะเปิดเมื่อคลิก
        customInput={<CustomInput />} // ใช้ custom input ที่เราปรับแต่ง
        popperPlacement="bottom-start" // จัดตำแหน่งให้ปฏิทินแสดงด้านล่าง
        withPortal={false} // true จะแสดงเต็มจอ
        filterDate={(date) => (modeSearch === 'sunday' ? date.getDay() === 0 : true)} // Allow only Sundays if modeSearch is 'sunday'
        disabled={disabled}
      >
      </DatePicker>

    </section>
  );
};

export default DatePickaSearch;