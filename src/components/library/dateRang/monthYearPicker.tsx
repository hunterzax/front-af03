import React, { useState, forwardRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import { addYears } from "date-fns";
import { getService } from "@/utils/postService";
import { toDayjs } from "@/utils/generalFormatter";
import dayjs from "dayjs";
import { CustomTooltip } from "@/components/other/customToolTip";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';


interface DatePickerSectionProps {
  label: any;
  onChange: (date: any) => void;
  placeHolder?: string;
  allowClear?: boolean;
  mode?: any
  valueShow?: any
  min?: any
  max?: any
  isDefaultDate?: any
  isRequired?: any
  isDefaultCurrentMonth?: any
  closeBalanceDate?: any
  customWidth?: number | undefined;
  customHeight?: number | undefined;
}

const styles = {
  icon: {
    width: 15,
    height: 15,
    color: '#000000'
  }
};

const MonthYearPickaSearch: React.FC<DatePickerSectionProps> = ({
  label,
  onChange,
  placeHolder = "เลือกเดือนและปี",
  allowClear = false,
  isRequired = false,
  mode,
  valueShow,
  min,
  max,
  isDefaultDate,
  isDefaultCurrentMonth,
  closeBalanceDate,
  customWidth = undefined,
  customHeight = undefined,
}) => {
  const [selectedDate, setSelectedDate] = useState<any>();

  const getCloseBalDate = async () => {
    const res_ = await getService(`/master/balancing/closed-balancing-report`)
    return res_?.date_balance
  }

  useEffect(() => {
    if (isDefaultDate) {
      const fetchCloseBalDate = async () => {
        const date_close_bal = await getCloseBalDate();
        // const formattedDate = toDayjs(date_close_bal).add(1, 'month').startOf('month');
        const formattedDate = toDayjs(date_close_bal); // มันบวก 1 เดือนข้างนอกอยู่แล้ว
        setSelectedDate(formattedDate.toISOString());
      };

      fetchCloseBalDate();
    }
  }, [isDefaultDate]);


  useEffect(() => {
    if (valueShow == "Invalid Date" || !valueShow) { // ใช้สำหรับ clear select date ในกรณีที่มี start - end เมื่อ clear start value ของ end ก็จะ reset ด้วย
      setSelectedDate(undefined);
    } else {
      const formatted = new Date(valueShow).toString();

      setSelectedDate(formatted);
    }

  }, [valueShow])

  useEffect(() => {
    if (isDefaultCurrentMonth) {
      setSelectedDate(toDayjs().startOf('month').toDate());
    }
  }, [isDefaultCurrentMonth])

  const CustomInput = forwardRef(({ value, onClick }: any, ref: any) => (
    <div>
      <button
        className={`custom-date-input px-[10px] py-[5px] !text-[12px] cursor-pointer border rounded-lg h-[35px] z-[1] text-left bg-white ${value ? "text-[#464255]" : "text-[#9CA3AF]"}`}
        onClick={onClick}
        ref={ref}
        type="button" // เติมมากันลั่น 
        style={{
          width: customWidth ? String(customWidth + "px") : "160px",
          height: customHeight ? String(customHeight + "px") : "35px"
        }}
      >
        <div className="overflow-ellipsis overflow-hidden whitespace-nowrap !text-[14px] w-[90%]">
          {value || placeHolder}
        </div>
      </button>

      {value && allowClear == true ? (
        <button
          type="button" // เติมมากันลั่น 
          style={{ position: "absolute", top: customHeight ? "10px" : "5px", right: customHeight ? "10px" : "5px", zIndex: 5 }}
          onClick={() => {
            onChange(undefined);
            setSelectedDate(undefined);
          }}
        >
          <CloseIcon style={styles.icon} />
        </button>
      ) : (
        <button
          type="button" // เติมมากันลั่น 
          // className="absolute top-[5px] right-[5px] !z-[0]"
          style={{ position: "absolute", top: customHeight ? "10px" : "5px", right: customHeight ? "10px" : "5px", zIndex: 0 }}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <CalendarTodayOutlinedIcon style={styles.icon} />
        </button>
      )}
    </div>
  ));

  return (
    <section className="relative z-20">
      {/* <label className="block mb-2 text-[14px] text-[#58585A]"> */}
      <label className="mb-2 text-[14px] text-[#58585A] flex items-center gap-2">
        {
          isRequired && <span className="text-red-500">*</span>
        }
        {label}

        {placeHolder == "Select Closing Balance Month/Year" && (
          <CustomTooltip
            title={
              <div>
                {
                  <p className="text-[#464255] font-light">
                    {`Should be Closed After 4 years (Refer to TSO code)`}
                  </p>
                }
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
      <DatePicker
        // disabled={mode == 'view'}
        selected={selectedDate}
        // dateFormat="MM/yyyy"
        dateFormat="MMMM yyyy" // ปรับ format ของช่อง input เป็นตามภาพ  https://app.clickup.com/t/86euc9jku
        showMonthYearPicker
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

export default MonthYearPickaSearch;