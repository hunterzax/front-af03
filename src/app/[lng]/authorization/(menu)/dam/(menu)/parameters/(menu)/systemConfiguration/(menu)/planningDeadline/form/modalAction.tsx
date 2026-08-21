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
import { Typography } from "@mui/material";
import { NumericFormat } from "react-number-format";
import DatePickaForm from "@/components/library/dateRang/dateSelectForm";
import dayjs from "dayjs";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { map24hour, map31day, map60mins } from "../../../../../data";
import Spinloading from "@/components/other/spinLoading";
import SelectFormProps from "@/components/other/selectProps";
import ModalConfirmSave from "@/components/other/modalConfirmSave";

type FormData = {
    hour: string;
    minute: string;
    day: string;
    before_month: string;
    term_type_id: string;
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
    const {
        control,
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
        watch,
        clearErrors,
    } = useForm<any>({
        defaultValues: data,
    });

    const labelClass = "block mb-2 text-sm font-light";
    const inputClass = "text-[14px] block md:w-full p-2 ps-5 focus:!ps-5 hover:!ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"
    // const selectboxClass = "flex w-full h-[46px] p-1 ps-1 pe-2 !rounded-lg text-gray-900 text-sm block outline-none";
    const selectboxClass = "flex w-full h-[44px] p-2 ps-[6px] pe-10 !rounded-lg text-gray-900 text-[14px] block outline-none"
    const textErrorClass = "text-red-500 text-sm";

    // const isReadOnly = mode === "view";
    const isReadOnly: any = mode === "view" || (data?.start_date && new Date(data?.start_date) < new Date()); // Edit > รายการที่ถึงวันที่ Start date ไปแล้วจะไม่สามารถแก้ไขข้อมูลอะไรได้ นอกจาก End Date (เงื่อนไขคือ D+1) https://app.clickup.com/t/86ervtz5z

    const startDate = watch("start_date");
    const [key, setKey] = useState(0);
    const formattedStartDate = formatWatchFormDate(startDate);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchAndSetData = async () => {
            clearErrors();
            setKey((prevKey) => prevKey + 1);

            if (mode === 'create') {
                setValue("start_date", null);
                setValue("end_date", null);
                setIsLoading(false);
            }
            if (mode === "edit" || mode === "view") {
                setIsLoading(true);
                const formattedStartDate: any = formatFormDate(data?.start_date);
                // const formattedEndDate: any = formatFormDate(data?.end_date);
                let formattedEndDate: any = 'Invalid Date'
                if (data?.end_date !== null) {
                    formattedEndDate = formatFormDate(data?.end_date);
                }

                // setValue("minute", data?.minute || "");
                setValue("hour", data?.hour !== undefined && data?.hour !== null ? data?.hour : '');
                setValue("minute", data?.minute !== undefined && data?.minute !== null ? data?.minute : '');
                setValue("day", data?.day || "");
                setValue("before_month", data?.before_month);
                setValue("term_type_id", data?.term_type_id || "");
                setValue("start_date", formattedStartDate);
                setValue("end_date", formattedEndDate);

                setTimeout(() => {
                    if (data) { setIsLoading(false); }
                }, 100);
            }
        }
        fetchAndSetData();
    }, [data, mode, setValue]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    const [tabIndex, setTabIndex] = useState(0);

    const handleChange = (event: any, newValue: any) => {
        setTabIndex(newValue);
    };

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setIsLoading(true);
        }, 100);
    };

    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false);
    const [dataSubmit, setDataSubmit] = useState<any>();

    const handleSaveConfirm = async (data?: any) => {
        if (mode == 'create') {
            await onSubmit(data);
        } else {
            setDataSubmit(data)
            setModaConfirmSave(true)
        }
    }

    return (
        <Dialog open={open} onClose={handleClose} className="relative z-20">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
            />
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <DialogPanel
                        // transition={false}
                        transition
                        className="dialog-panel flex transform transition-all inset-0 rounded-lg text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in  data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                    >
                        <Spinloading spin={isLoading} rounded={20} />
                        <div className="flex inset-0 items-center justify-center w-[700px]">
                            <div className="flex flex-col items-center justify-center gap-2 rounded-md w-full">
                                <form
                                    // onSubmit={handleSubmit(onSubmit)}
                                    onSubmit={
                                        mode == 'create' ?
                                            handleSubmit(async (data) => { // clear state when submit
                                                setIsLoading(true);
                                                setTimeout(() => {
                                                    onSubmit(data);
                                                }, 100)
                                            })
                                            :
                                            handleSubmit(handleSaveConfirm)
                                    }
                                    className="bg-white p-8 rounded-[20px] shadow-lg max-w w-full"
                                >
                                    <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-5">{mode == "create" ? `New Planning Deadline` : mode == "edit" ? "Edit Planning Deadline" : "View Planning Deadline"}</h2>
                                    <div className="grid grid-cols-2 gap-2 ">

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
                                                    required: mode == 'view' ? false : "Select Term",
                                                })}
                                                disabled={isReadOnly || mode == 'edit' ? true : false}
                                                value={watch("term_type_id") || ""}
                                                className={`${selectboxClass} ${mode == 'edit' && '!bg-[#EFECEC]'} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.term_type_id && "border-red-500"}`}
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
                                                    if (e) {
                                                        clearErrors('term_type_id')
                                                    }
                                                    setValue("term_type_id", e.target.value);
                                                }}
                                                displayEmpty
                                                renderValue={(value: any) => {
                                                    if (!value) {
                                                        return <Typography color="#9CA3AF" fontSize={14}>Select Term</Typography>;
                                                    }
                                                    return termTypeMasterData?.find((item: any) => item.id === value)?.name || '';
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
                                                {termTypeMasterData?.filter((item: any) => item.id !== 4)?.map((item: any) => (
                                                    <MenuItem key={item.id} value={item.id}>
                                                        {item.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.term_type_id && (
                                                <p className="text-red-500 text-sm">{`Select Term`}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="hour" className="block mb-2 text-sm font-light">
                                                <span className="text-red-500">*</span>
                                                {`End Time`}
                                            </label>
                                            <div className="flex gap-2">
                                                <div className="w-full">
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
                                                            if (e) {
                                                                clearErrors('hour')
                                                            }
                                                            setValue("hour", e.target.value);
                                                        }}
                                                        displayEmpty
                                                        renderValue={(value: any) => {
                                                            // if (!value) {
                                                            if (value === undefined || value === "") {
                                                                return <Typography color="#9CA3AF" fontSize={14}>Select Hour</Typography>;
                                                            }
                                                            return map24hour.find((item: any) => item.id === value)?.name || '';
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
                                                        {map24hour?.map((item: any) => (
                                                            <MenuItem key={item.id} value={item.id}>
                                                                {item.name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                    {errors.hour && (<p className="text-red-500 text-sm">{`Select Hour`}</p>)}
                                                </div>
                                                <div className="w-full">
                                                    <Select
                                                        id="minute"
                                                        IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                        {...register("minute", { required: "Select Minute" })}
                                                        disabled={isReadOnly}
                                                        value={watch("minute") !== undefined ? watch("minute") : ""}
                                                        className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.minute && "border-red-500"}`}
                                                        sx={{
                                                            '.MuiOutlinedInput-notchedOutline': {
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
                                                            if (e) {
                                                                clearErrors('minute')
                                                            }
                                                            setValue("minute", e.target.value);
                                                        }}
                                                        displayEmpty
                                                        renderValue={(value: any) => {
                                                            if (value === undefined || value === "") {
                                                                return <Typography color="#9CA3AF" fontSize={14}>{`Select Minute`}</Typography>;
                                                            }
                                                            return map60mins.find((item: any) => item.id === value)?.name || '';
                                                        }}
                                                        MenuProps={{
                                                            PaperProps: {
                                                                style: {
                                                                    maxHeight: 48 * 4.5 + 8,
                                                                },
                                                            },
                                                        }}
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
                                                htmlFor="day"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Date of Month`}
                                            </label>

                                            <SelectFormProps
                                                id={'day'}
                                                register={register("day", { required: "Select Date of Month" })}
                                                disabled={isReadOnly}
                                                valueWatch={watch("day") || ""}
                                                handleChange={(e) => {
                                                    setValue("day", e.target.value);
                                                    if (errors?.day) { clearErrors('day') }
                                                }}
                                                errors={errors?.day}
                                                errorsText={'Select Date of Month'}
                                                options={map31day}
                                                optionsKey={'id'}
                                                optionsValue={'id'}
                                                optionsText={'name'}
                                                optionsResult={'name'}
                                                placeholder={'Select Date of Month'}
                                                pathFilter={'name'}
                                            />
                                        </div>

                                        <div >
                                            <label
                                                htmlFor="before_month"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Before Month`}
                                            </label>
                                            <NumericFormat
                                                id="before_month"
                                                placeholder="Enter Before Month"
                                                value={watch("before_month")}
                                                readOnly={isReadOnly}
                                                // {...register("before_month",
                                                //     { required: "Enter Before Month" }
                                                // )}
                                                {...register("before_month", {
                                                    // อนุญาตให้เป็น 0 ได้ แต่ห้ามว่าง
                                                    validate: (v) => String(v ?? '').trim() !== '' || "Enter Before Month",
                                                    // ถ้าอยากแปลงเป็นตัวเลขด้วย (optional)
                                                    setValueAs: (v) => (v === '' || v == null ? null : Number(v)),
                                                    // เผื่ออยากกำหนดให้ต่ำสุดคือ 0
                                                    min: { value: 0, message: "Must be ≥ 0" },
                                                })}
                                                className={`${inputClass} ${errors.before_month && "border-red-500"} ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                thousandSeparator={false}
                                                decimalScale={2}
                                                fixedDecimalScale={false}
                                                allowNegative={false}
                                                displayType="input"
                                                onValueChange={(values) => {
                                                    const { value } = values;
                                                    setValue("before_month", value, { shouldValidate: true, shouldDirty: true });
                                                }}
                                            />
                                            {errors.before_month && (
                                                <p className="text-red-500 text-sm">{`Enter Before Month`}</p>
                                            )}
                                        </div>

                                        <div className="pb-2">
                                            <label className={labelClass}>
                                                <span className="text-red-500">*</span>
                                                {`Start Date`}
                                            </label>
                                            <DatePickaForm
                                                key={"start" + key}
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
                                                onChange={(e: any) => {
                                                    // setValue('start_date', formatFormDate(e)), e == undefined && setValue('start_date', null, { shouldValidate: true, shouldDirty: true }); 
                                                    if (e) {
                                                        clearErrors('start_date')
                                                        setValue('start_date', formatFormDate(e))
                                                    } else if (e == undefined) {
                                                        setValue('start_date', null, { shouldValidate: true, shouldDirty: true })
                                                    }
                                                }}
                                            />
                                            {errors.start_date && !watch("start_date") && <p className={`${textErrorClass}`}>{'Select Start Date'}</p>}
                                        </div>

                                        <div className="pb-2">
                                            <label className={labelClass}>{`End Date`}</label>
                                            <DatePickaForm
                                                key={"end" + key}
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
                                                onClick={onClose}
                                                className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                            >
                                                {`Close`}
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500"
                                            >
                                                {`Cancel`}
                                            </button>
                                        )}

                                        {mode !== "view" && (
                                            <button
                                                type="submit"
                                                className="w-[167px] font-semibold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
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

            <ModalConfirmSave
                open={modaConfirmSave}
                handleClose={(e: any) => {
                    setModaConfirmSave(false);
                    if (e == "submit") {
                        setIsLoading(true);
                        setTimeout(async () => {
                            await onSubmit(dataSubmit);
                        }, 100);
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
        </Dialog>
    );
};

export default ModalAction;
