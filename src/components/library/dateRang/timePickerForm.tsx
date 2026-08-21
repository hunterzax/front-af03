

import React, { useState, forwardRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './custom-datepicker.css'; // ใช้ไฟล์ custom CSS ที่เราสร้างเอง
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import { Typography } from '@mui/material';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined';
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
    isError?: boolean;
    mode?: any;
    forMode?: 'form' | 'filter';
}

const styles: any = {
    icon: {
        width: 20,
        height: 20,
        color: '#000000',
    },
};

const TimePickaForm: React.FC<DatePickerSectionProps> = ({
    label,
    onChange,
    placeHolder = 'เลือกวันที่',
    placeHolderSize = 14,
    allowClear = false,
    readOnly: readOnlyProp = false,
    valueShow,
    isError,
    mode,
    forMode = 'form',
}) => {
    const splaceHolder = `${placeHolderSize}px`;
    const [selectedDate, setSelectedDate] = useState<any>();
    const [readOnly, setReadOnly] = useState(readOnlyProp);

    useEffect(() => {
        setReadOnly(mode === 'view' || readOnlyProp);
    }, [mode, readOnlyProp]);

    useEffect(() => {

        // if (
        //     !valueShow ||
        //     valueShow === 'Invalid Date' ||
        //     valueShow === 'undefined/undefined/Invalid Date'
        // ) {
        //     setSelectedDate(undefined);
        //     return;
        // }

        // // Parse from valueShow
        // let parsed: any = null;
        // if (valueShow.includes('/')) {
        //     parsed = dayjs(valueShow, 'HH:mm');
        // } else {
        //     parsed = dayjs(valueShow, 'HH:mm');
        // }

        // if (parsed.isValid()) {
        //     setSelectedDate(valueShow);
        // } else {
        //     setSelectedDate(undefined);
        // }

        setSelectedDate(valueShow);

    }, [valueShow]);

    const btnProps = 'grid grid-cols-[90%_10%] w-full justify-center rounded-lg h-[44px] bg-white border pl-2 pr-3 border-[#DFE4EA]';

    const CustomInput = forwardRef<any, any>(({ value, onClick }, ref) => (
        <div
            className={`
          ${btnProps}
          ${isError ? '!border-[#ED1B24]' : ''}
          ${readOnly ? '!bg-[#F1F1F1]' : ''}
          ${mode === 'edit-table' ? '!w-[180px] border !border-[#000000] !rounded-none' : ''}
          flex justify-end items-center
        `}
        >
            <button
                type="button"
                className={`text-left ${forMode === 'form' ? 'pl-[12px]' : 'p-0'}`}
                onClick={onClick}
                disabled={readOnly}
                ref={ref}
            >
                <Typography
                    fontSize={14}
                    sx={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', width: '90%' }}
                    className={`${value ? 'text-[#464255]' : 'text-[#9CA3AF]'} !text-[${splaceHolder}]`}
                >
                    {value ? value : placeHolder}
                </Typography>
            </button>

            {!readOnly && allowClear && selectedDate ? (
                <button
                    type="button"
                    onClick={() => {
                        setSelectedDate(undefined);
                        onChange(undefined);
                    }}
                >
                    <CloseIcon style={styles.icon} />
                </button>
            ) : (
                <WatchLaterOutlinedIcon style={{ width: 20, height: 20, color: readOnly ? '#B6B6B6' : '#000000' }} />
            )}
        </div>
    ));

    return (
        <DatePicker
            selected={selectedDate}
            onChange={(date: any) => {
                setSelectedDate(date);
                onChange(date);
            }}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={1}
            timeCaption="เวลา"
            customInput={<CustomInput />}
            timeFormat="HH:mm" // ← บอกให้ใช้รูปแบบ 24 ชั่วโมง
            dateFormat="HH:mm"
            placeholderText={placeHolder}
            disabled={readOnly}
        />
    );
};

export default TimePickaForm;