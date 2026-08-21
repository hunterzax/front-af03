import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
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
import { map24hour, map60mins } from "../../../../../data";
import Spinloading from "@/components/other/spinLoading";
import ModalConfirmSave from "@/components/other/modalConfirmSave";
import SelectFormProps from "@/components/other/selectProps";

// type FormData = {
//     hour: string;
//     minute: string;
//     before_gas_day: string;
//     user_type_id: string;
//     process_type_id: string;
//     nomination_type_id: string;
//     start_date: Date;
//     end_date: Date;
// };

type FormExampleProps = {
    mode?: "create" | "edit" | "view";
    data?: Partial<any>;
    open: boolean;
    nominationTypeMasterData: any;
    processTypeMasterData: any;
    userTypeMasterData: any
    onClose: () => void;
    onSubmit: SubmitHandler<any>;
    setResetForm: (reset: () => void) => void;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode = "create",
    data = {},
    nominationTypeMasterData = [],
    processTypeMasterData = [],
    userTypeMasterData = [],
    open,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const { control, register, handleSubmit, setValue, resetField, reset, clearErrors, formState: { errors }, watch } = useForm<any>({ defaultValues: data });

    const labelClass = "block mb-2 text-[14px] font-light"
    const inputClass = `text-sm block md:w-full !p-2 !ps-5 hover:!p-2 hover:!ps-5 focus:!p-2 focus:!ps-5 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF] ${mode == 'view' && '!border-none'}`;
    const selectboxClass = "flex w-full h-[44px] p-1 ps-[6px] pe-2 !rounded-lg text-gray-900 text-sm block outline-none";
    const textErrorClass = "text-red-500 text-[14px]"

    // const isReadOnly = mode === "view"; // v2.0.11 ควร Edit ได้ทุกช่อง https://app.clickup.com/t/86et0vthh
    const isReadOnly = mode === "view" || (data?.start_date && new Date(data?.start_date) < new Date()); // Edit > รายการที่ถึงวันที่ Start date ไปแล้วจะไม่สามารถแก้ไขข้อมูลอะไรได้ นอกจาก End Date (เงื่อนไขคือ D+1) https://app.clickup.com/t/86ervtz5z

    const isPastStartDate = (data?.start_date && new Date(data?.start_date) < new Date());

    const startDate = watch("start_date");
    const formattedStartDate = formatWatchFormDate(startDate);

    //state
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [userType, setUserType] = useState<any>([]);

    {/* Confirm Save */ }
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()

    useEffect(() => {
        const fetchAndSetData = async () => {
            clearErrors();
            if (mode === 'create') {
                reset();
                setIsLoading(false);
            }
            if (mode === "edit" || mode === "view") {
                setIsLoading(true);
                const formattedStartDate: any = formatFormDate(data?.start_date);
                // const formattedEndDate: any = formatFormDate(data?.end_date);
                let formattedEndDate: any = ''
                if (data?.end_date !== null) {
                    formattedEndDate = formatFormDate(data?.end_date);
                    setValue("end_date", formattedEndDate);
                } else {
                    resetField("end_date");
                }

                // setValue("hour", data?.hour || "");
                setValue("hour", data?.hour !== undefined && data?.hour !== null ? data?.hour : '');
                //   setValue("minute", data?.minute ? data?.minute : '');
                setValue("minute", data?.minute !== undefined && data?.minute !== null ? data?.minute : '');
                // setValue("before_gas_day", data?.before_gas_day || "");
                setValue("before_gas_day", data?.before_gas_day !== undefined ? data?.before_gas_day : "");

                setValue("user_type_id", data?.user_type_id || "");
                setValue("nomination_type_id", data?.nomination_type_id || "");
                setValue("process_type_id", data?.process_type_id || "");
                setValue("start_date", formattedStartDate);
                setDataSubmit(undefined);


                setUserType(userTypeMasterData)
                setTimeout(() => {
                    if (data) { setIsLoading(false); }
                }, 300);
            }
        }
        fetchAndSetData();
    }, [data, mode, setValue]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    // useEffect(() => {
    //     fetchData();
    // }, []);

    const handleClose = () => {
        // resetField("start_date")
        // resetField("end_date")
        // setResetForm(() => reset);
        onClose();
        // reset();
    };

    {/* Confirm Save */ }
    const handleSaveConfirm = async (data?: any) => {
        if (mode == 'create') {
            setIsLoading(true);
            setTimeout(async () => {
                await onSubmit(data);
            }, 100);
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
                                        className="bg-white p-8 rounded-[20px] shadow-lg max-w"
                                        // onSubmit={handleSubmit(async (data) => { // clear state when submit
                                        //     setIsLoading(true);
                                        //     setTimeout(async () => {
                                        //         await onSubmit(data);
                                        //     }, 100);
                                        // })}
                                        onSubmit={handleSubmit(handleSaveConfirm)}
                                    >
                                        <h2 className="text-xl font-bold text-[#00ADEF] mb-2 pb-2">{mode == "create" ? `New Nomination Deadline` : mode == "edit" ? "Edit Nomination Deadline" : "View Nomination Deadline"}</h2>
                                        <div className="grid grid-cols-2 gap-2 pt-2">

                                            <div className="col-span-2">
                                                <label
                                                    htmlFor="process_type_id"
                                                    className="block mb-2 text-sm font-light"
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {`Process Type`}
                                                </label>

                                                <SelectFormProps
                                                    id={'process_type_id'}
                                                    register={register("process_type_id", { required: "Select Process Type" })}
                                                    disabled={isReadOnly}
                                                    valueWatch={watch("process_type_id") || ""}
                                                    handleChange={(e) => {

                                                        // ถ้าเลือก type --> management, validity response of renomination ให้กรอง shipper ออกจาก user_type
                                                        // ปรับ Process Type ของ Shipper ให้มีแค่ Submission และ Reception Of Renomination และเรียง sequence ของ shipper เป็น Submission > Reception Of Renomination https://app.clickup.com/t/86euzxxp8
                                                        if (e.target.value == 2 || e.target.value == 4) { // 2 == Management, 4 == validity response of renomination
                                                            setUserType(userTypeMasterData?.filter((item: any) => item.id !== 3))
                                                        } else {
                                                            setUserType(userTypeMasterData)
                                                        }

                                                        resetField("user_type_id"); // ล้างค่า user_type_id เพื่อป้องกันการซ้ำกัน https://app.clickup.com/t/9018502823/86euzxxp8
                                                        setValue("process_type_id", e.target.value);
                                                        if (errors?.process_type_id) { clearErrors('process_type_id') }
                                                    }}
                                                    errors={errors?.process_type_id}
                                                    errorsText={'Select Process Type'}
                                                    options={processTypeMasterData}
                                                    optionsKey={'id'}
                                                    optionsValue={'id'}
                                                    optionsText={'name'}
                                                    optionsResult={'name'}
                                                    placeholder={'Select Process Type'}
                                                    pathFilter={'name'}
                                                />
                                            </div>

                                            <div >
                                                <label
                                                    htmlFor="user_type_id"
                                                    className="block mb-2 text-sm font-light"
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {`User Type`}
                                                </label>
                                                <Select
                                                    id="user_type_id"
                                                    IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                    {...register("user_type_id", {
                                                        required: "Select User Type",
                                                    })}
                                                    disabled={isReadOnly}
                                                    value={watch("user_type_id") || ""}
                                                    className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.user_type_id && "border-red-500"}`}
                                                    sx={{
                                                        '.MuiOutlinedInput-notchedOutline': {
                                                            // borderColor: '#DFE4EA', // Change the border color here
                                                            borderColor: errors.user_type_id && !watch('user_type_id') ? '#FF0000' : '#DFE4EA',
                                                        },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: errors.user_type_id && !watch("user_type_id") ? "#FF0000" : "#d2d4d8",
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
                                                        setValue("user_type_id", e.target.value);
                                                        // fetchData(e?.target);
                                                    }}
                                                    displayEmpty
                                                    renderValue={(value: any) => {
                                                        if (!value) {
                                                            return <Typography color="#9CA3AF" fontSize={14}>Select User Type</Typography>;
                                                        }
                                                        return userTypeMasterData?.find((item: any) => item.id === value)?.name || '';
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
                                                    {/* <MenuItem value="" style={{ color: '#A0A0A0', height: '30px' }}>{""}</MenuItem> */}
                                                    {/* {(userTypeMasterData || [])?.map((item: any) => (
                                                        <MenuItem key={item.id} value={item.id}>
                                                            {item.name}
                                                        </MenuItem>
                                                    ))} */}

                                                    {(userType || [])?.map((item: any) => (
                                                        <MenuItem key={item.id} value={item.id}>
                                                            {item.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                {errors.user_type_id && (
                                                    <p className="text-red-500 text-sm">{`Select User Type`}</p>
                                                )}
                                            </div>

                                            <div >
                                                <label
                                                    htmlFor="nomination_type_id"
                                                    className="block mb-2 text-sm font-light"
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {`Nomination Type`}
                                                </label>
                                                <Select
                                                    id="nomination_type_id"
                                                    IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                    {...register("nomination_type_id", {
                                                        required: "Select Nomination Type",
                                                    })}
                                                    disabled={isReadOnly}
                                                    value={watch("nomination_type_id") || ""}
                                                    className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.nomination_type_id && "border-red-500"}`}
                                                    sx={{
                                                        '.MuiOutlinedInput-notchedOutline': {
                                                            // borderColor: '#DFE4EA', // Change the border color here
                                                            borderColor: errors.nomination_type_id && !watch('nomination_type_id') ? '#FF0000' : '#DFE4EA',
                                                        },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: errors.nomination_type_id && !watch("nomination_type_id") ? "#FF0000" : "#d2d4d8",
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
                                                        setValue("nomination_type_id", e.target.value);
                                                        // fetchData(e?.target);
                                                    }}
                                                    displayEmpty
                                                    renderValue={(value: any) => {
                                                        if (!value) {
                                                            return <Typography color="#9CA3AF" fontSize={14}>Select Nomination Type</Typography>;
                                                        }
                                                        return nominationTypeMasterData?.find((item: any) => item.id === value)?.document_type || '';
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
                                                    {/* <MenuItem value="" style={{ color: '#A0A0A0', height: '30px' }}>{""}</MenuItem> */}
                                                    {nominationTypeMasterData?.map((item: any) => (
                                                        <MenuItem key={item.id} value={item.id}>
                                                            {item.document_type}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                {errors.nomination_type_id && (
                                                    <p className="text-red-500 text-sm">{`Select Nomination Type`}</p>
                                                )}
                                            </div>



                                            <div>
                                                <div className="flex gap-2">
                                                    <div className="w-[100%]">
                                                        <label htmlFor="hour" className="block mb-2 text-sm font-light">
                                                            <span className="text-red-500">*</span>
                                                            {`Hour`}
                                                        </label>
                                                        <Select
                                                            id="hour"
                                                            IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                            {...register("hour", {
                                                                required: "Select Hour",
                                                            })}
                                                            disabled={isReadOnly}
                                                            // value={watch("hour") || ""}
                                                            value={watch("hour") !== undefined ? watch("hour") : ""}
                                                            className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.hour && "border-red-500"}`}
                                                            sx={{
                                                                width: 120,
                                                                maxWidth: 120,
                                                                minWidth: 120,
                                                                '.MuiOutlinedInput-notchedOutline': {
                                                                    // borderColor: '#DFE4EA', // Change the border color here
                                                                    borderColor: errors.hour && !watch('hour') ? '#FF0000' : '#DFE4EA',
                                                                },
                                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: errors.hour && !watch("hour") ? "#FF0000" : "#d2d4d8",
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
                                                                setValue("hour", e.target.value);
                                                            }}
                                                            displayEmpty
                                                            renderValue={(value: any) => {
                                                                // if (!value) {
                                                                if (value === undefined || value === "") {
                                                                    return <Typography color="#9CA3AF" fontSize={14}>Hour</Typography>;
                                                                }
                                                                return map24hour?.find((item: any) => item.id === value)?.name || '';
                                                            }}
                                                            MenuProps={{
                                                                PaperProps: {
                                                                    style: {
                                                                        maxHeight: 48 * 4.5 + 8, // Item height * 4.5 + padding
                                                                        // width: 250, // Adjust width as needed
                                                                        width: 120,
                                                                    },
                                                                },
                                                            }}
                                                            style={{ width: '100%' }}
                                                        >
                                                            {map24hour?.map((item: any) => (
                                                                <MenuItem key={item.id} value={item.id}>
                                                                    {item.name}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                        {errors.hour && (<p className="text-red-500 text-sm">{`Select Hour`}</p>)}
                                                    </div>

                                                    <div className="w-[100%]">
                                                        <label htmlFor="minute" className="block mb-2 text-sm font-light">
                                                            <span className="text-red-500">*</span>
                                                            {`Minute`}
                                                        </label>
                                                        <Select
                                                            id="minute"
                                                            IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                            {...register("minute", {
                                                                required: "Select Minute",
                                                            })}
                                                            disabled={isReadOnly}
                                                            // value={watch("minute") || ""}
                                                            value={watch("minute") !== undefined ? watch("minute") : ""}
                                                            className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.minute && "border-red-500"}`}
                                                            sx={{
                                                                width: 120,
                                                                maxWidth: 120,
                                                                minWidth: 120,
                                                                '.MuiOutlinedInput-notchedOutline': {
                                                                    // borderColor: '#DFE4EA', // Change the border color here
                                                                    borderColor: errors.minute && !watch('minute') ? '#FF0000' : '#DFE4EA',
                                                                },
                                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: errors.minute && !watch("minute") ? "#FF0000" : "#d2d4d8",
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
                                                                setValue("minute", e.target.value);
                                                            }}
                                                            displayEmpty
                                                            renderValue={(value: any) => {
                                                                // if (!value) {
                                                                if (value === undefined || value === "") {
                                                                    return <Typography color="#9CA3AF" fontSize={14}>{`Minute`}</Typography>;
                                                                }
                                                                return map60mins?.find((item: any) => item.id === value)?.name || '';
                                                            }}
                                                            MenuProps={{
                                                                PaperProps: {
                                                                    style: {
                                                                        maxHeight: 48 * 4.5 + 8, // Item height * 4.5 + padding
                                                                        // width: 250, // Adjust width as needed
                                                                        width: 120,
                                                                    },
                                                                },
                                                            }}
                                                            style={{ width: '100%' }}
                                                        >
                                                            {map60mins?.map((item: any) => (
                                                                <MenuItem key={item.id} value={item.id}>
                                                                    {item.name}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                        {errors.minute && (<p className="text-red-500 text-sm">{`Select Minute`}</p>)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div >
                                                <label
                                                    htmlFor="before_gas_day"
                                                    className="block mb-2 text-sm font-light"
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {`Before Gas Day`}
                                                </label>
                                                <NumericFormat
                                                    id="before_gas_day"
                                                    placeholder="Enter Gas Day"
                                                    // value={watch("before_gas_day")}
                                                    value={watch("before_gas_day") ?? ""} // Ensure 0 is displayed
                                                    readOnly={isReadOnly}
                                                    {...register("before_gas_day", {
                                                        required: "Enter Gas Day",
                                                    })}
                                                    className={`${inputClass} ${errors.before_gas_day && "border-red-500"} ${isReadOnly && '!bg-[#EFECEC]'} `}
                                                    thousandSeparator={false}
                                                    decimalScale={2}
                                                    fixedDecimalScale={false}
                                                    allowNegative={false}
                                                    displayType="input"
                                                    onValueChange={(values) => {
                                                        const { value } = values;
                                                        // setValue("before_gas_day", value, { shouldValidate: true, shouldDirty: true });
                                                        setValue("before_gas_day", value === "" ? "" : value, { shouldValidate: true, shouldDirty: true });
                                                    }}
                                                />
                                                {errors.before_gas_day && (<p className="text-red-500 text-sm">{`Enter Gas Day`}</p>)}
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
                                                {errors.start_date && (
                                                    <p className={`${textErrorClass}`}>{`Select Start Date`}</p>
                                                )} */}

                                                <DatePickaForm
                                                    {...register('start_date', { required: "Select start date" })}
                                                    readOnly={isReadOnly}
                                                    placeHolder="Select Start Date"
                                                    mode={mode}
                                                    valueShow={watch("start_date") && dayjs(watch("start_date")).format("DD/MM/YYYY")}
                                                    // min={formattedStartDate || undefined}
                                                    // min={new Date()}
                                                    min={dayjs().format("YYYY-MM-DD")} // Minimum date is today
                                                    maxNormalForm={watch('end_date') && watch('end_date')} // ไม่ให้ start_date เกิน end_date
                                                    allowClear
                                                    isError={errors.start_date && !watch("start_date") ? true : false}
                                                    onChange={(e: any) => {
                                                        setValue('start_date', formatFormDate(e)),
                                                            e == undefined && setValue('start_date', null, { shouldValidate: true, shouldDirty: true });
                                                        e == undefined && setValue('end_date', null, { shouldValidate: true, shouldDirty: true });
                                                    }}
                                                />
                                                {errors.start_date && !watch("start_date") && <p className={`${textErrorClass}`}>{'Select Start Date'}</p>}
                                            </div>

                                            <div className="pb-2">
                                                <label className={labelClass}>{`End Date`}</label>
                                                <DatePickaForm
                                                    {...register('end_date')}
                                                    // readOnly={!formattedStartDate ? true : isReadOnly} // v2.0.11 ควร Edit ได้ทุกช่อง https://app.clickup.com/t/86et0vthh
                                                    readOnly={!formattedStartDate ? true : (isReadOnly && mode === "view")}  // Edit > รายการที่ถึงวันที่ Start date ไปแล้วจะไม่สามารถแก้ไขข้อมูลอะไรได้ นอกจาก End Date (เงื่อนไขคือ D+1) https://app.clickup.com/t/86ervtz5z
                                                    placeHolder="Select End Date"
                                                    mode={mode}
                                                    // min={formattedStartDate || undefined}
                                                    // min={isPastStartDate ? dayjs().add(1, 'day').format('YYYY-MM-DD') : formattedStartDate || undefined}
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
                            {`Do you want to save the changes ? `}
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
