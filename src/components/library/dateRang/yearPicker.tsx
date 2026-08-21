
import React, { useState, forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './custom-datepicker.css'; // ใช้ไฟล์ custom CSS ที่เราสร้างเอง
import CloseIcon from '@mui/icons-material/Close';
import "@/app/globals.css";
import { addYears } from "date-fns";
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

//!!!! Manual to use date pic ka search !!!!
// 1.เช็ค key ให้ดีทั้งที่ Components และจุดที่ resetFilter (code: setKey((prevKey) => prevKey + 1);)
// 2.กลับไปดูข้อแรก
// ======================================================================================

interface DatePickerSectionProps {
  label: any;
  onChange: (date: any) => void;
  placeHolder?: string;
  allowClear?: boolean;
  min?: any
  max?: any
  customWidth?: number | undefined;
}

const styles = {
  icon: {
    width: 15,
    height: 15,
    color: '#000000'
  }
};

const YearPickaSearch: React.FC<DatePickerSectionProps> = ({
  label,
  onChange,
  placeHolder = "เลือกวันที่",
  allowClear = false,
  min,
  max,
  customWidth = undefined,
}) => {

  const [selectedDate, setSelectedDate] = useState<any>();

  const CustomInput = forwardRef(({ value, onClick }: any, ref: any) => (
    <div>
      <button
        className={`custom-date-input px-[10px] py-[5px] !text-[12px] cursor-pointer border rounded-lg h-[35px] z-[1] text-left bg-white ${value ? 'text-[#464255]' : 'text-[#9CA3AF]'}`}
        onClick={onClick}
        ref={ref}
        style={{ width: customWidth ? String(customWidth + "px") : "160px" }}
      >
        <div className=' overflow-ellipsis overflow-hidden whitespace-nowrap !text-[14px] w-[90%]'>
          {value || placeHolder}
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
  ));

  return (
    <section className="relative z-20">
      <label className="block mb-2 text-[14px] text-[#58585A]">{label}</label>
      <DatePicker
        selected={selectedDate}
        dateFormat="yyyy"
        showYearPicker
        yearDropdownItemNumber={56}
        scrollableYearDropdown
        minDate={min}
        maxDate={max ? max : addYears(new Date(), 56)}
        onChange={(e: any) => {
          onChange(e);
          setSelectedDate(e);
        }}
        customInput={<CustomInput />}
        popperPlacement="bottom-start"
        withPortal={false}
      />
    </section>
  );
};

export default YearPickaSearch;