import React from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from "@headlessui/react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useEffect, useState } from "react";
import { formatFormDate, formatWatchFormDate, getMinDate } from "@/utils/generalFormatter";
import { NumericFormat } from "react-number-format";
import DatePickaForm from "@/components/library/dateRang/dateSelectForm";
import dayjs from "dayjs";
import { Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { CustomTooltip } from "@/components/other/customToolTip";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { map31day } from "../../../../../data";
import Spinloading from "@/components/other/spinLoading";
import ModalConfirmSave from "@/components/other/modalConfirmSave";

type FormData = {
    term_type_id: string;
    file_period: string;
    min: string;
    max: string;
    file_period_mode: string;
    file_start_date_mode: any;
    fixdayday: string;
    todayday: string;
    shadow_time: string;
    shadow_period: string;
    start_date: Date;
    end_date: Date;
};

type FormExampleProps = {
    mode?: "create" | "edit" | "view";
    data?: Partial<FormData>;
    open: boolean;
    termTypeMasterData: any
    onClose: () => void;
    onSubmit: SubmitHandler<FormData>;
    setResetForm: (reset: () => void) => void;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode = "create",
    data = {},
    termTypeMasterData = {},
    open,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const { control, register, handleSubmit, setValue, reset, formState: { errors }, clearErrors, watch } = useForm<any>({ defaultValues: data });

    const labelClass = "block mb-2 text-[14px] font-light"
    const inputClass = "text-[14px] block md:w-full p-2 ps-5 focus:!ps-5 hover:!ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"
    const selectboxClass = "flex w-full h-[44px] p-2 ps-[7px] pe-10 !rounded-lg text-gray-900 text-[14px] block outline-none"
    const textErrorClass = "text-red-500 text-[14px]"

    // const isReadOnly = mode === "view";
    const isReadOnly: any = mode === "view" || (data?.start_date && new Date(data?.start_date) < new Date()); // Edit > รายการที่ถึงวันที่ Start date ไปแล้วจะไม่สามารถแก้ไขข้อมูลอะไรได้ นอกจาก End Date (เงื่อนไขคือ D+1) https://app.clickup.com/t/86ervtz5z
    const startDate = watch("start_date");
    const formattedStartDate = formatWatchFormDate(startDate);

    //state
    const [isLoading, setIsLoading] = useState<boolean>(true);

    {/* Confirm Save */ }
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()

    useEffect(() => {
        const fetchAndSetData = async () => {
            // clearErrors(['shadow_time'])
            clearErrors();
            if (mode === 'create') {
                clearErrors(['fixdayday', 'todayday'])
                setIsLoading(false);
            }

            if (mode === "edit" || mode === "view") {
                setIsLoading(true);
                const formattedStartDate: any = formatFormDate(data?.start_date);

                let formattedEndDate: any = 'Invalid Date'
                if (data?.end_date !== null) {
                    formattedEndDate = formatFormDate(data?.end_date);
                }
                setValue("end_date", formattedEndDate);

                let fileStartItem: string = String(data?.file_start_date_mode);
                setValue("file_start_date_mode", fileStartItem);
                setValue("term_type_id", data?.term_type_id || "");
                setValue("file_period", data?.file_period || "");
                setValue("min", data?.min || "");
                setValue("max", data?.max || "");
                setValue("file_period_mode", data?.file_period_mode || "");
                // setValue("file_start_date_mode", data?.file_start_date_mode || "");
                setValue("fixdayday", data?.fixdayday || "");
                setValue("todayday", data?.todayday || "");
                // setValue("shadow_time", data?.shadow_time || "");
                setValue("shadow_time", data?.shadow_time ?? "");
                setValue("shadow_period", data?.shadow_period || "");
                setValue("start_date", formattedStartDate);

                setTimeout(() => {
                    if (data) { setIsLoading(false); }
                }, 300);
            }
        }
        fetchAndSetData();
    }, [data, mode, setValue]);

    useEffect(() => {
        if (mode === "view") {
            setValue("file_start_date_mode", data?.file_start_date_mode?.toString());
        }
    }, [data, mode])

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    const [fileStartDate, setFileStartDate] = useState('')

    const handleChange = (e: any, mode: any) => {
        switch (mode) {
            case "everyday":
                setValue('fixdayday', null);
                setValue('todayday', null);

                clearErrors('todayday');
                clearErrors('fixdayday');
                break;
            case "fixday":
                setValue("fixdayday", data?.fixdayday || "");
                setValue('todayday', null);

                clearErrors('todayday');
                break;
            case "todayplus":
                setValue("todayday", data?.todayday || "");
                setValue('fixdayday', null);

                clearErrors('fixdayday');
                break;
        }

        setFileStartDate(e.target.value)
        setValue("file_start_date_mode", e.target.value)
    };

    // const handleClose = () => {
    //     clearErrors();
    //     onClose();
    //     // setResetForm(() => reset);
    //     setTimeout(() => {
    //         setIsLoading(true);
    //     }, 100);
    // };

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setIsLoading(true);
        }, 200);
    };

    {/* Confirm Save */ }
    const handleSaveConfirm = async (data?: any) => {

        // setDataSubmit(data)
        // setModaConfirmSave(true)

        if (mode == 'create') {
            await onSubmit(data);
        } else {
            setDataSubmit(data)
            setModaConfirmSave(true)
        }
    }

    return (
        <>
            <Dialog open={open} onClose={handleClose} className="relative z-20">
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
                />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <DialogPanel
                            transition
                            className="flex transform transition-all inset-0 rounded-lg text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in  data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                        >
                            <div className="flex inset-0 items-center justify-center ">
                                <div className="flex flex-col items-center justify-center gap-2 rounded-md ">
                                    <Spinloading spin={isLoading} rounded={20} />
                                    <form
                                        className="bg-white p-8 rounded-[20px] shadow-lg max-w w-[600px]"
                                        // onSubmit={handleSubmit(async (data) => { // clear state when submit
                                        //     setIsLoading(true);
                                        //     setTimeout(async () => {
                                        //         await onSubmit(data);
                                        //     }, 100);
                                        // })}
                                        onSubmit={handleSubmit(handleSaveConfirm)}
                                    >
                                        <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-2">{mode == "create" ? `New Capacity Right Template` : mode == "edit" ? "Edit Capacity Right Template" : "View Capacity Right Template"}</h2>
                                        <div className="grid grid-cols-2 gap-2 pt-1">

                                            {/* OLD */}
                                            {/* {
                                            "term_type_id": 1,
                                            "file_period": 3,
                                            "file_period_mode": 1,  // 1 = วัน, 2 = เดือน, 3 = ปี
                                            "file_start_date_mode": 2, // 1 = every day, 2 = fix day, 3 = to day+
                                            "fixdayday": 10,
                                            "todayday": null,
                                            "start_date": "2024-10-01 00:00:00",
                                            "end_date": "2025-10-10 00:00:00",
                                            "shadow_time": 3,
                                            "shadow_period": 5
                                        } */}

                                            {/* NEW */}
                                            {/* {
                                            "term_type_id": 1,
                                            "file_period_mode": 2,  // 1 = วัน, 2 = เดือน, 3 = ปี
                                            "file_start_date_mode": 2, // 1 = every day, 2 = fix day, 3 = to day+
                                            "fixdayday": 10,
                                            "todayday": null,
                                            "start_date": "2024-10-01 00:00:00",
                                            "end_date": "2025-10-10 00:00:00",
                                            "shadow_time": 3,
                                            "shadow_period": 5,
                                            "min": 1,
                                            "max": 3
                                        } */}

                                            <div>
                                                <label
                                                    htmlFor="term_type_id"
                                                    className="block mb-2 text-sm font-light"
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {`Term`}
                                                </label>

                                                <Select
                                                    id="term_type_id"
                                                    IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                    {...register("term_type_id", {
                                                        required: "Select Term",
                                                    })}

                                                    disabled={isReadOnly}
                                                    value={watch("term_type_id") || ""}
                                                    className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.term_type_id && "border-red-500"}`}
                                                    sx={{
                                                        '.MuiOutlinedInput-notchedOutline': {
                                                            // borderColor: '#DFE4EA', // Change the border color here
                                                            borderColor: errors.term_type_id && !watch('term_type_id') ? '#FF0000' : '#DFE4EA',
                                                        },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: errors.term_type_id && !watch("term_type_id") ? "#FF0000" : "#d2d4d8",
                                                        },
                                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#d2d4d8',
                                                        },
                                                        '&.Mui-disabled .MuiSelect-select': {
                                                            opacity: 1, // ยกเลิกความจางของ MUI
                                                            color: '#464255 !important', // สีที่คุณต้องการ
                                                            WebkitTextFillColor: '#464255 !important'
                                                        },
                                                    }}
                                                    onChange={(e) => {
                                                        setValue("term_type_id", e.target.value);
                                                    }}
                                                    displayEmpty
                                                    renderValue={(value: any) => {
                                                        if (!value) {
                                                            return <Typography color="#9CA3AF" fontSize={14}>Select Term</Typography>;
                                                        }
                                                        return termTypeMasterData.find((item: any) => item.id === value)?.name || '';
                                                    }}
                                                    MenuProps={{
                                                        PaperProps: {
                                                            style: {
                                                                maxHeight: 48 * 4.5 + 8, // Item height * 4.5 + padding
                                                                // width: 250, // Adjust width as needed
                                                            },
                                                        },
                                                    }}
                                                >
                                                    {termTypeMasterData?.map((item: any) => (
                                                        <MenuItem key={item.id} value={item.id}>
                                                            {item.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                {errors?.term_type_id && (<p className="text-red-500 text-sm">{`Select Term`}</p>)}
                                            </div>

                                            <div className="flex col-span-2 gap-2">
                                                <div className="mt-2">
                                                    <label
                                                        htmlFor="file_period_mode"
                                                        className="block mb-2 text-sm font-light"
                                                    >
                                                        <span className="text-red-500">*</span>
                                                        {`File Period`}
                                                    </label>
                                                    <Select
                                                        id="file_period_mode"
                                                        IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                        {...register("file_period_mode", {
                                                            required: true,
                                                        })}
                                                        disabled={isReadOnly}
                                                        value={watch("file_period_mode") || ""}
                                                        className={`!w-[170px] ${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.file_period_mode && "border-red-500"}`}
                                                        sx={{
                                                            '.MuiOutlinedInput-notchedOutline': {
                                                                // borderColor: '#DFE4EA', // Change the border color here
                                                                borderColor: errors.file_period_mode && !watch('file_period_mode') ? '#FF0000' : '#DFE4EA',
                                                            },
                                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: errors.file_period_mode && !watch("file_period_mode") ? "#FF0000" : "#d2d4d8",
                                                            },
                                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: '#d2d4d8',
                                                            },
                                                            '&.Mui-disabled .MuiSelect-select': {
                                                                opacity: 1, // ยกเลิกความจางของ MUI
                                                                color: '#464255 !important', // สีที่คุณต้องการ
                                                                WebkitTextFillColor: '#464255 !important'
                                                            },
                                                        }}
                                                        onChange={(e) => {
                                                            setValue("file_period_mode", e.target.value);
                                                            // setFilePeriodMode(e.target.value)
                                                        }}
                                                        displayEmpty
                                                        renderValue={(value: any) => {
                                                            if (!value) {
                                                                return <Typography color="#9CA3AF" fontSize={14}>Select Period</Typography>;
                                                            }
                                                            const periodMap: { [key: number]: string } = {
                                                                1: 'Day',
                                                                2: 'Month',
                                                                3: 'Year'
                                                            };
                                                            return periodMap[value] || '';
                                                        }}
                                                        MenuProps={{
                                                            PaperProps: {
                                                                style: {
                                                                    maxHeight: 48 * 4.5 + 8, // Item height * 4.5 + padding
                                                                    // // width: 250, // Adjust width as needed
                                                                },
                                                            },
                                                        }}
                                                    >
                                                        <MenuItem value={1}>{`Days`}</MenuItem>
                                                        <MenuItem value={2}>{`Months`}</MenuItem>
                                                        <MenuItem value={3}>{`Years`}</MenuItem>
                                                    </Select>

                                                    {errors?.file_period_mode && (<p className="text-red-500 text-sm">{`Select Period`}</p>)}
                                                </div>

                                                <div className="mt-[9px]">
                                                    <NumericFormat
                                                        id="min"
                                                        placeholder="Min"
                                                        value={watch("min")}
                                                        readOnly={isReadOnly}
                                                        {...register("min", { required: true })}
                                                        className={`mt-7 ${inputClass} ${errors?.min && "border-red-500"} ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                        thousandSeparator={true}
                                                        decimalScale={2}
                                                        fixedDecimalScale={false}
                                                        allowNegative={false}
                                                        displayType="input"
                                                        onValueChange={(values) => {
                                                            const { value } = values;
                                                            if (open == true) { //เวลา close diaglog มันจะขึ้นกรอบแดง ใช้ open เช็คไว้กันลั่น ====> by bangju
                                                                setValue("min", value, { shouldValidate: true, shouldDirty: true });
                                                            }
                                                        }}
                                                        onBlur={() => {
                                                            const minValue = parseFloat(watch("min"));
                                                            const maxValue = parseFloat(watch("max") || "10000");
                                                            // Adjust min if it's greater than max
                                                            if (minValue > maxValue) {
                                                                setValue("min", maxValue.toString(), { shouldValidate: true, shouldDirty: true });
                                                            }
                                                        }}
                                                    />

                                                    {errors?.min && (<p className="text-red-500 text-sm">{`Enter Min`}</p>)}
                                                </div>

                                                <div className="mt-[9px]">
                                                    <NumericFormat
                                                        id="max"
                                                        placeholder="Max"
                                                        value={watch("max")}
                                                        readOnly={isReadOnly}
                                                        {...register("max", { required: true })}
                                                        className={`mt-7 ${inputClass} ${errors?.max && "border-red-500"} ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                        thousandSeparator={true}
                                                        decimalScale={2}
                                                        fixedDecimalScale={false}
                                                        allowNegative={false}
                                                        displayType="input"
                                                        onValueChange={(values) => {
                                                            const { value } = values;
                                                            if (open == true) { //เวลา close diaglog มันจะขึ้นกรอบแดง ใช้ open เช็คไว้กันลั่น ====> by bangju
                                                                setValue("max", value, { shouldValidate: true, shouldDirty: true });
                                                            }
                                                        }}
                                                        onBlur={() => {
                                                            const minValue = parseFloat(watch("min") || "0");
                                                            const maxValue = parseFloat(watch("max"));
                                                            // Adjust max if it's less than min
                                                            if (maxValue < minValue) {
                                                                setValue("max", minValue.toString(), { shouldValidate: true, shouldDirty: true });
                                                            }
                                                        }}
                                                    />

                                                    {errors?.max && (<p className="text-red-500 text-sm">{`Enter Max`}</p>)}
                                                </div>
                                            </div>

                                            <div className="col-span-2 mt-2">
                                                {/* <h2 className="mr-4">{`สัญลักษณ์`}</h2> */}
                                                {/* <label
                                                htmlFor="file_period"
                                                className="block mb-2 text-sm font-light text-[#58585A]"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`File Recurring Start Date`}
                                                <CustomTooltip
                                                    title={
                                                        <div>
                                                            <p className="text-[#464255]">
                                                                <span className="font-semibold">Original : </span>ค่า Capacity Right และรายละเอียดตาม Capacity Right ที่เอาเข้ามาจาก Bulletin หรือ TPA Website
                                                            </p>
                                                            <p className="text-[#464255]">
                                                                <span className="font-semibold">Summary Capacity Right : </span>ค่า Capacity Right ที่ถูกปรับค่ามาจากเมนู Release/UIOLI Summary Management (ยอดจาก Column Confirm Capacity) และค่าจากนี้ จะส่งไปที่เมนู Tariff และเมนูอื่นๆ ที่ต้องใช้ค่า Book
                                                            </p>
                                                        </div>
                                                    }
                                                    placement="top-end"
                                                    arrow
                                                >
                                                    <div className="w-[22px] h-[22px] flex items-center justify-center border border-[#B6B6B6] rounded-lg">
                                                        <InfoOutlinedIcon sx={{ fontSize: 14 }} />
                                                    </div>
                                                </CustomTooltip>
                                            </label> */}

                                                <label
                                                    htmlFor="file_period"
                                                    className="mb-2 text-sm font-light text-[#58585A] flex items-center" // Add flex and items-center
                                                >
                                                    <span className="mr-2"><span className="text-red-500">*</span>{`File Recurring Start Date`}</span> {/* Add a small margin */}
                                                    <CustomTooltip
                                                        title={
                                                            <div className="text-[#464255]">
                                                                <p>{`File Period : Years`}</p>
                                                                <p>{`แนะนำให้ระบุเวลาสูงสุดไม่เกิน ดังนี้`}</p>
                                                                <p>{`• Every Day ไม่ควรเกิน 10 ปี`}</p>
                                                                <p>{`• Fix Day ไม่ควรเกิน 60 ปี`}</p>
                                                                <p>{`• Today+ ไม่ควรเกิน 10 ปี`}</p>
                                                                <p>{`• Every Day และ Today+ เหมาะกับ Short Term`}</p>
                                                                <p>{`• Fix Day เหมาะกับ Medium Term และ Long Term`}</p>
                                                            </div>
                                                        }
                                                        placement="top-end"
                                                        arrow
                                                    >
                                                        <div className="w-[22px] h-[22px] flex items-center justify-center border border-[#B6B6B6] rounded-lg">
                                                            <InfoOutlinedIcon sx={{ fontSize: 14 }} />
                                                        </div>
                                                    </CustomTooltip>
                                                </label>

                                                <div className="-[mt-20] ">
                                                    <label className="mr-8 text-[#58585A]">
                                                        <input
                                                            type="radio"
                                                            {...register("file_start_date_mode", { required: !watch("file_start_date_mode") ? true : false })}
                                                            value="1"
                                                            disabled={isReadOnly}
                                                            // checked={watch("file_start_date_mode") === "1"}
                                                            // onChange={handleChange}
                                                            onChange={(e) => { handleChange(e, 'everyday') }}
                                                            className="mr-1 accent-[#1473A1]"
                                                        />
                                                        {`Every Day`}
                                                    </label>

                                                    <label className="mr-8 text-[#58585A]">
                                                        <input
                                                            type="radio"
                                                            {...register("file_start_date_mode", { required: !watch("file_start_date_mode") ? true : false })}
                                                            value="2"
                                                            // {...register("file_start_date_mode")}
                                                            // checked={watch("file_start_date_mode") === "2"}
                                                            disabled={isReadOnly}
                                                            // onChange={handleChange}
                                                            onChange={(e) => handleChange(e, 'fixday')}
                                                            className="mr-1 accent-[#1473A1]"
                                                        />
                                                        {/* v1.0.90 ปรับ wording จาก "Fix day 1 day" เป็น "Fix date 1" ทั้งใน modal และ List https://app.clickup.com/t/86err0d6f */}
                                                        {/* {`Fix Day `} */}
                                                        {`Fix Date `}
                                                        <Select
                                                            id="fixdayday"
                                                            IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                            {...register("fixdayday",
                                                                { required: watch("file_start_date_mode") == "2" ? true : false }
                                                            )}
                                                            disabled={isReadOnly || watch("file_start_date_mode") !== '2'}
                                                            value={watch("fixdayday") || ""}
                                                            className={`!w-[15%] ${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors?.fixdayday && "border-red-500"} ${watch('file_start_date_mode') !== "2" && '!border-[1px] !border-[#dedede] !cursor-pointer !bg-[#EFECEC]'}`}
                                                            sx={{
                                                                '.MuiOutlinedInput-notchedOutline': {
                                                                    // borderColor: '#DFE4EA', // Change the border color here
                                                                    // borderColor: watch('file_start_date_mode') && watch('file_start_date_mode') !== "1" && watch('file_start_date_mode') !== "3" && !watch("fixdayday") && errors?.fixdayday ? '#FF0000' : '#DFE4EA',
                                                                    borderColor: watch("file_start_date_mode") == "2" && !watch("fixdayday") && errors?.fixdayday ? '#FF0000' : '#DFE4EA',
                                                                },
                                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: '#d2d4d8',
                                                                },
                                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: '#d2d4d8',
                                                                },
                                                                '&.Mui-disabled .MuiSelect-select': {
                                                                    opacity: 1, // ยกเลิกความจางของ MUI
                                                                    color: '#464255 !important', // สีที่คุณต้องการ
                                                                    WebkitTextFillColor: '#464255 !important'
                                                                },
                                                                // '& .MuiOutlinedInput-root.Mui-disabled': {
                                                                //     ':hover': {
                                                                //         border: '1px solid #909090 !important',
                                                                //         boxShadow: '5px 10px #888888'
                                                                //     }
                                                                // },
                                                            }}
                                                            onChange={(e) => {
                                                                setValue("fixdayday", e.target.value);
                                                            }}
                                                            MenuProps={{
                                                                PaperProps: {
                                                                    style: {
                                                                        maxHeight: 48 * 4.5 + 8, // Item height * 4.5 + padding
                                                                        // width: 250, // Adjust width as needed
                                                                    },
                                                                },
                                                            }}
                                                        >
                                                            {map31day?.map((item: any) => (
                                                                <MenuItem key={item.id} value={item.id}>
                                                                    {item.name}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                        {/* v1.0.90 ปรับ wording จาก "Fix day 1 day" เป็น "Fix date 1" ทั้งใน modal และ List https://app.clickup.com/t/86err0d6f */}
                                                        {/* {` Day`} */}
                                                        {watch('file_start_date_mode') == "2" && errors?.fixdayday && !watch('fixdayday') && (<p className="text-red-500 text-sm absolute right-[310px]">{`Enter Fix Date`}</p>)}
                                                    </label>
                                                    <label className="text-[#58585A]">
                                                        <input
                                                            type="radio"
                                                            {...register("file_start_date_mode", { required: !watch("file_start_date_mode") ? true : false })}
                                                            value="3"
                                                            // {...register("file_start_date_mode")}
                                                            // checked={watch("file_start_date_mode") === "3"}
                                                            disabled={isReadOnly}
                                                            // onChange={handleChange}
                                                            onChange={(e) => handleChange(e, 'todayplus')}
                                                            className="mr-1 accent-[#1473A1]"
                                                        />
                                                        {`Today+ `}
                                                        <Select
                                                            id="todayday"
                                                            IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                            {...register("todayday",
                                                                { required: watch("file_start_date_mode") == "3" ? true : false }
                                                            )}
                                                            disabled={isReadOnly || watch("file_start_date_mode") !== '3'}
                                                            value={watch("todayday") || ""}
                                                            className={`!w-[15%] ${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors?.todayday && "border-red-500"} ${watch('file_start_date_mode') !== "3" && '!border-[1px] !border-[#dedede] !cursor-pointer !bg-[#EFECEC]'}`}
                                                            sx={{
                                                                '.MuiOutlinedInput-notchedOutline': {
                                                                    // borderColor: '#DFE4EA', // Change the border color here
                                                                    // borderColor: watch('file_start_date_mode') && watch('file_start_date_mode') !== "1" && watch('file_start_date_mode') !== "2" && !watch("todayday") ? '#FF0000' : '#DFE4EA',
                                                                    borderColor: watch("file_start_date_mode") == "3" && !watch("todayday") && errors?.todayday ? '#FF0000' : '#DFE4EA',
                                                                },
                                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: '#d2d4d8',
                                                                },
                                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: '#d2d4d8',
                                                                },
                                                                '&.Mui-disabled .MuiSelect-select': {
                                                                    opacity: 1, // ยกเลิกความจางของ MUI
                                                                    color: '#464255 !important', // สีที่คุณต้องการ
                                                                    WebkitTextFillColor: '#464255 !important'
                                                                },
                                                            }}
                                                            onChange={(e) => {
                                                                setValue("todayday", e.target.value);
                                                                // setFilePeriodMode(e.target.value)
                                                            }}
                                                            MenuProps={{
                                                                PaperProps: {
                                                                    style: {
                                                                        maxHeight: 48 * 4.5 + 8, // Item height * 4.5 + padding
                                                                        // width: 250, // Adjust width as needed
                                                                    },
                                                                },
                                                            }}
                                                        >
                                                            {
                                                                watch("file_period_mode") == 1 ? // mode DAY
                                                                    watch("max") >= 10 ?
                                                                        map31day.slice(0, 10).map((item: any) => (
                                                                            <MenuItem key={item.id} value={item.id}>
                                                                                {item.name}
                                                                            </MenuItem>
                                                                        ))
                                                                        :
                                                                        map31day.slice(0, watch("max")).map((item: any) => (
                                                                            <MenuItem key={item.id} value={item.id}>
                                                                                {item.name}
                                                                            </MenuItem>
                                                                        ))
                                                                    :
                                                                    map31day.slice(0, 10).map((item: any) => (
                                                                        <MenuItem key={item.id} value={item.id}>
                                                                            {item.name}
                                                                        </MenuItem>
                                                                    ))
                                                            }
                                                        </Select>
                                                        {` Day`}
                                                        {watch('file_start_date_mode') == "3" && errors?.todayday && !watch('todayday') && (
                                                            <p className="text-red-500 text-sm absolute right-[100px]">{`Enter Today+`}</p>
                                                        )}
                                                    </label>
                                                </div>

                                                {!watch('file_start_date_mode') && errors.file_start_date_mode && (<p className="text-red-500 text-sm">{`Select File Recurring`}</p>)}
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="shadow_time"
                                                    className="block mb-2 text-sm font-light"
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {/* {`Shadow Time`} */}
                                                    {`Shadow Time ${!watch("term_type_id") ? '' : watch("term_type_id") === 4 ? '(Day)' : '(Month)'}`}
                                                </label>
                                                <NumericFormat
                                                    id="shadow_time"
                                                    placeholder="0"
                                                    value={watch("shadow_time")}
                                                    readOnly={isReadOnly}
                                                    {...register("shadow_time", { required: true })}
                                                    // {...register("shadow_time", { required: mode == 'create' ? true : false })}
                                                    className={`${inputClass} ${!watch("shadow_time") && errors.shadow_time && "border-red-500"} ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                    thousandSeparator={true}
                                                    decimalScale={2}
                                                    min={0}
                                                    fixedDecimalScale={false}
                                                    allowNegative={false}
                                                    displayType="input"
                                                    onValueChange={(values) => {
                                                        const { value } = values;
                                                        setValue("shadow_time", value, { shouldValidate: true, shouldDirty: true });
                                                    }}
                                                />
                                                {/* {!watch("shadow_time") && errors.shadow_time && (<p className="text-red-500 text-sm">{`Enter Shadow Time`}</p>)} */}
                                                {errors?.shadow_time && (<p className="text-red-500 text-sm">{`Enter Shadow Time`}</p>)}
                                            </div>


                                            <div >
                                                {/* <label
                                                htmlFor="shadow_period"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Shadow Period ${!watch("term_type_id") ? '' : watch("term_type_id") === 4 ? '(Day)' : '(Month)'}`}
                                            </label>
                                            <NumericFormat
                                                id="shadow_period"
                                                placeholder="0"
                                                value={watch("shadow_period")}
                                                readOnly={isReadOnly}
                                                {...register("shadow_period", { required: true })}
                                                className={`${inputClass} ${errors.shadow_period && "border-red-500"} ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                thousandSeparator={true}
                                                min={0}
                                                decimalScale={2}
                                                fixedDecimalScale={false}
                                                allowNegative={false}
                                                displayType="input"
                                                onValueChange={(values) => {
                                                    const { value } = values;
                                                    setValue("shadow_period", value, { shouldValidate: true, shouldDirty: true });
                                                }}
                                            />
                                            {errors.shadow_period && (
                                                <p className="text-red-500 text-sm">{`Enter Shadow Period`}</p>
                                            )} */}
                                            </div>

                                            <div className="pb-2">
                                                <label className={labelClass}>
                                                    <span className="text-red-500">*</span>
                                                    {`Start Date`}
                                                </label>
                                                {/* <DatePickaForm
                                                {...register('start_date', { required: "Select start date" })}
                                                readOnly={isReadOnly}
                                                placeHolder="Start Date"
                                                mode={mode}
                                                valueShow={dayjs(watch("start_date")).format("DD/MM/YYYY")}
                                                // valueShow={watch("start_date")}
                                                allowClear
                                                onChange={(e: any) => { setValue('start_date', formatFormDate(e)), e == undefined && setValue('start_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                            />
                                            {errors.start_date && (<p className={`${textErrorClass}`}>{`Select Start Date`}</p>)} */}
                                                <DatePickaForm
                                                    {...register('start_date', { required: "Select start date" })}
                                                    readOnly={isReadOnly}
                                                    placeHolder="Select Start Date"
                                                    mode={mode}
                                                    valueShow={watch("start_date") && dayjs(watch("start_date")).format("DD/MM/YYYY")}
                                                    // min={formattedStartDate || undefined}
                                                    min={new Date()}
                                                    maxNormalForm={watch('end_date') && watch('end_date')} // ไม่ให้ start_date เกิน end_date
                                                    allowClear
                                                    isError={errors.start_date && !watch("start_date") ? true : false}
                                                    onChange={(e: any) => { setValue('start_date', formatFormDate(e)), e == undefined && setValue('start_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                                />
                                                {errors.start_date && !watch("start_date") && <p className={`${textErrorClass}`}>{'Select Start Date'}</p>}
                                            </div>

                                            <div className="pb-2">
                                                <label className={labelClass} style={{ marginTop: '2px' }}>
                                                    {/* <span className="text-red-500">*</span> */}
                                                    {`End Date`}
                                                </label>
                                                {/* <DatePickaForm
                                                {...register('end_date')}
                                                readOnly={isReadOnly}
                                                placeHolder="End Date"
                                                mode={mode}
                                                min={formattedStartDate || undefined}
                                                valueShow={dayjs(watch("end_date")).format("DD/MM/YYYY")}
                                                allowClear
                                                onChange={(e: any) => { setValue('end_date', formatFormDate(e)), e == undefined && setValue('end_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                            /> */}
                                                <DatePickaForm
                                                    {...register('end_date')}
                                                    // readOnly={!formattedStartDate ? true : isReadOnly}
                                                    readOnly={!formattedStartDate ? true : (isReadOnly && mode === "view")}
                                                    placeHolder="Select End Date"
                                                    mode={mode}
                                                    // min={formattedStartDate || undefined}
                                                    min={getMinDate(formattedStartDate)}
                                                    valueShow={watch("end_date") ? dayjs(watch("end_date")).format("DD/MM/YYYY") : undefined}
                                                    allowClear
                                                    onChange={(e: any) => { setValue('end_date', formatFormDate(e)), e == undefined && setValue('end_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-6">
                                            {mode === "view" ? (
                                                <button
                                                    type="button"
                                                    onClick={handleClose}
                                                    className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                                >
                                                    {`Close`}
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={handleClose}
                                                    className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500"
                                                >
                                                    {`Cancel`}
                                                </button>
                                            )}

                                            {mode !== "view" && (
                                                <button
                                                    type="submit"
                                                    className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                                >
                                                    {mode === "create" ? "Add" : "Save"}
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>

            {/* Confirm Save */}
            <ModalConfirmSave
                open={modaConfirmSave}
                handleClose={(e: any) => {
                    setModaConfirmSave(false);
                    if (e == "submit") {
                        setIsLoading(true);
                        setTimeout(async () => {
                            await onSubmit(dataSubmit);
                        }, 100);

                        setTimeout(async () => {
                            handleClose();
                        }, 1000);
                    }
                }}
                title="Confirm Save"
                description={
                    <div>
                        <div className="text-center">
                            {`Do you want to save the changes ?`}
                        </div>
                    </div>
                }
                menuMode="confirm-save"
                btnmode="split"
                btnsplit1="Save"
                btnsplit2="Cancel"
                stat="none"
            />
        </>
    );
};

export default ModalAction;