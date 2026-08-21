import React, { useState, forwardRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './custom-datepicker.css'; // ใช้ไฟล์ custom CSS ที่เราสร้างเอง
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import { formatDateBulletin } from '@/utils/generalFormatter';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import { Typography } from '@mui/material';
import { eventDate } from '../special_day';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'dayjs/locale/th'; // ✅ import locale ภาษาไทย
dayjs.extend(customParseFormat);

//!!!! Manual to use date pic ka search !!!!
// 1.เช็ค key ให้ดีทั้งที่ Components และจุดที่ resetFilter (code: setKey((prevKey) => prevKey + 1);)
// 2.กลับไปดูข้อแรก
// ======================================================================================

interface DatePickerSectionProps {
    label?: string;
    onChange: (date: any) => void;
    placeHolder?: string;
    placeHolderSize?: number;
    allowClear?: boolean;
    readOnly?: boolean;
    valueShow?: string;
    termCondition?: any;
    bookingTemple?: any;
    termMinDate?: any;
    termMaxDate?: any;
    isStartDate?: boolean;
    isEndDate?: boolean;
    isError?: boolean;
    mode?: any
    min?: any
    isToday?: any
    maxNormalForm?: any
    forMode?: "form" | "filter" // ใช้แยกเรื่องของ padding input ไม่ให้กินข้างขวาไป form สำหรับใช้ input ในฟอร์ม สามารถ dynamic ได้ filter จะ fix size padding
}

const styles: any = {
    icon: {
        width: 20,
        height: 20,
    }
};

const DatePickaForm: React.FC<DatePickerSectionProps> = ({
    label,
    onChange,
    placeHolder = "เลือกวันที่",
    placeHolderSize = 14,
    allowClear = false,
    readOnly,
    valueShow,
    termCondition,
    bookingTemple,
    termMinDate,
    termMaxDate,
    isStartDate,
    isEndDate,
    isError,
    isToday,
    mode,
    min,
    maxNormalForm,
    forMode = "form",
}) => {

    const splaceHolder: any = placeHolderSize.toString() + "px";
    const [selectedDate, setSelectedDate] = useState<any>();

    useEffect(() => {

        if (mode == 'edit-bulletin') {
            valueShow = formatDateBulletin(valueShow)
        }
        // 31/01/2025
        if (mode == 'edit-table') {
            if (valueShow) {
                const [day, month, year] = valueShow.split("/");
                // valueShow = `${year}-${month}-${day}`;
                valueShow = `${day}/${month}/${year}`;
            }
        }

        if (mode === 'view') {
            readOnly = true
        }

        if (valueShow && !valueShow.includes("/")) {
            const [year, month, day] = valueShow.split("-");
            valueShow = `${day}/${month}/${year}`;
        }

        if (valueShow == "Invalid Date" || !valueShow || valueShow == 'undefined/undefined/Invalid Date') { // ใช้สำหรับ clear select date ในกรณีที่มี start - end เมื่อ clear start value ของ end ก็จะ reset ด้วย
            setSelectedDate(undefined);
        }
    }, [valueShow])

    useEffect(() => {
        if (isToday) {
            const tomorrowDay = dayjs();
            setSelectedDate(tomorrowDay.toISOString());
        }
    }, [isToday]);


    const btnProps = "grid grid-cols-[90%_10%] w-full justify-center rounded-lg h-[44px] bg-white border pl-2 pr-[1px] border-[#DFE4EA]";

    const CustomInput: any = forwardRef(({ value, onClick }: any, ref: any) => (
        <div
            className={`
                ${btnProps}
                ${isError && '!border-[#ED1B24]'}
                ${mode === "create" && !value ? 'text-[#b9b9b9]' : value || valueShow ? 'text-[#464255]' : 'text-[#b9b9b9]'}
                ${readOnly && '!bg-[#f1f1f1]'}
                ${mode === 'edit-table' && '!w-[180px] border !border-[#000000] !rounded-none'}
            `}
        >
            <button
                type='button'
                className={`text-left ${forMode == 'form' ? 'pl-[12px]' : 'p-0'}`}
                onClick={onClick}
                disabled={readOnly}
                ref={ref}
            >
                {/* original code 2025-02-17 */}
                {
                    mode == 'edit-bulletin' || mode == 'edit-table' ?
                        <div className={`${valueShow ? 'text-current' : 'text-[#9CA3AF]'} !text-[${splaceHolder}] placeholder-txt`}>
                            {valueShow ? valueShow : placeHolder || placeHolder}
                        </div>

                        : mode == 'edit' || (readOnly && mode == 'edit') ?
                            <Typography
                                fontSize={14} sx={{ textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden", width: "90%" }}
                                className={`${value || (valueShow !== "Invalid Date" && valueShow !== "undefined/undefined/Invalid Date") ? 'text-current' : 'text-[#9CA3AF] placeholder-txt'} !text-[${splaceHolder}] ${mode == 'view' && valueShow == "Invalid Date" ? 'opacity-0' : 'opacity-100'}`}
                            >
                                {valueShow && valueShow !== "Invalid Date" && valueShow !== "undefined/undefined/Invalid Date" ? valueShow : placeHolder}
                            </Typography>
                            : mode == 'create' ?
                                <Typography fontSize={14} sx={{ textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden", width: "90%" }} className={`${valueShow && valueShow !== null ? 'text-[#464255]' : 'text-[#9CA3AF]'} !text-[${splaceHolder}] placeholder-txt ${mode == 'view' && valueShow == "Invalid Date" ? 'opacity-0' : 'opacity-100'}`}>
                                    {valueShow && valueShow !== "Invalid Date" && valueShow !== null && valueShow !== "undefined/undefined/Invalid Date" ? valueShow : placeHolder}
                                </Typography>
                                : mode == 'view' &&
                                <Typography fontSize={14} sx={{ textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden", width: "90%" }} className={`${value || valueShow !== "Invalid Date" ? 'text-current' : 'text-[#9CA3AF] placeholder-txt'} !text-[${splaceHolder}] ${mode == 'view' && valueShow == "Invalid Date" ? 'opacity-0' : 'opacity-100'}`}>
                                    {valueShow && valueShow !== "Invalid Date" && valueShow !== "undefined/undefined/Invalid Date" ? valueShow : placeHolder}
                                </Typography>
                }
            </button>

            {
                // mode === 'create' && (!value || !valueShow) || mode == 'edit' && valueShow == 'Invalid Date' ?
                (mode === 'create' && (!value || !valueShow)) || (mode == 'edit' && (valueShow == 'Invalid Date' || valueShow == undefined || valueShow == "undefined/undefined/Invalid Date")) ?
                    <button
                        type='button'
                        // className="absolute top-[7px] right-[12px] !z-[0]"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick();
                        }}
                    >
                        <CalendarTodayOutlinedIcon style={styles.icon} className={`${readOnly ? 'text-[#B6b6b6]' : 'text-[rgba(44,44,44,0.54)]'}`} />
                    </button>
                    : mode == 'edit' && valueShow !== 'Invalid Date' && valueShow !== "undefined/undefined/Invalid Date" ? // เอาโหมด edit-table ออกเพราะไม่อยากให้กดเคลียร์หน้า edit table
                        <button
                            type='button'
                            className='!z-[0]'
                            onClick={() => {
                                setSelectedDate(undefined);
                                onChange(undefined);
                            }}
                            disabled={readOnly}
                        >
                            {readOnly ?
                                <CalendarTodayOutlinedIcon style={styles.icon} className={`${readOnly ? 'text-[#B6b6b6]' : 'text-[rgba(44,44,44,0.54)]'}`} />
                                :
                                <CloseIcon style={styles.icon} className={`${readOnly ? 'text-[#B6b6b6]' : 'text-[rgba(44,44,44,0.54)]'}`} />
                            }
                        </button>
                        : mode === 'view' ?
                            <button
                                type='button'
                                className='!z-[0]'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // onClick();
                                }}
                            >
                                <CalendarTodayOutlinedIcon style={{ width: 20, height: 20, color: '#B6B6B6' }} />
                            </button>
                            // เอาโหมด edit-table ออกเพราะไม่อยากให้กดเคลียร์
                            : (mode === 'create' || mode === 'edit-bulletin') && (value || valueShow) ? <button
                                type='button'
                                className='!z-[0]'
                                onClick={() => {
                                    setSelectedDate(undefined);
                                    onChange(undefined);
                                }}
                                disabled={readOnly}
                            >
                                <CloseIcon style={styles.icon} className={`${readOnly ? '!text-[#B6b6b6]' : '!text-[rgba(44,44,44,0.6)]'}`} />
                            </button>
                                // : mode === 'edit-bulletin' && (!value || !valueShow) && <button
                                : (mode === 'edit-bulletin' || mode == 'edit-table') && (!value || !valueShow) && <button
                                    type='button'
                                    className='!z-[0]'
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

    const currentYear = dayjs().year();
    const currentMonth = dayjs().month(); // Note: month is 0-indexed, so January is 0, February is 1, etc.
    const [currentMonthX, setCurrentMonthX] = useState(dayjs().month() + 1); // Initialize with the current month

    const eventsThisMonth = eventDate.filter((event: any) => {
        const eventYear = dayjs(event.date).year();
        const eventMonth = dayjs(event.date).month() + 1;
        return eventYear === currentYear && eventMonth === currentMonthX;
    });

    const handleMonthChange = (date: any) => {
        const month = dayjs(date).month(); // Get the 0-indexed month
        setCurrentMonthX(month + 1);
    };

    return (
        <DatePicker
            disabled={mode == 'edit-bulletin' && !!!bookingTemple}
            selected={selectedDate ? selectedDate : null}
            dateFormat={"dd/MM/yyyy"}
            peekNextMonth
            showMonthDropdown
            showYearDropdown
            dropdownMode="scroll"
            scrollableYearDropdown={true}
            yearDropdownItemNumber={56}
            maxDate={
                isToday
                    ? dayjs().toDate()
                    : isEndDate
                        ? (termMaxDate && termMaxDate !== "Invalid Date" ? dayjs(termMaxDate).toDate() : undefined)
                        : (maxNormalForm && maxNormalForm !== "Invalid Date"
                            ? dayjs(maxNormalForm).subtract(1, "day").toDate()
                            : dayjs().add(56, "year").toDate())
            }
            minDate={min}
            onMonthChange={handleMonthChange}
            onChange={(date: any) => {
                onChange(date);
                setSelectedDate(date);
            }}
            inline={false} // ไม่แสดงปฏิทินตลอด แต่จะเปิดเมื่อคลิก
            customInput={<CustomInput />} // ใช้ custom input 
            popperPlacement="bottom-start"
            withPortal={false} // true จะแสดงเต็มจอ
            filterDate={(date) => {
                // เงื่อนไขหน้า bulletin board ของ start end ใหม่ให้เลือกวันได้ตาม file_start_date_mode
                if (mode === 'edit-bulletin' && (Number(bookingTemple?.file_start_date_mode) === 2)) {
                    const day = date.getDate();
                    return day === Number(bookingTemple?.fixdayday);
                } else if (termCondition && (Number(termCondition) === 1 || Number(termCondition) === 2)) {
                    // ใช้กับ modal extend ใน capacity contract mgn
                    const day = date.getDate();
                    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
                    return day === lastDayOfMonth;
                }

                return true;
            }}
        >
        </DatePicker>
    );
};

export default DatePickaForm;