import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useEffect } from "react";
import { formatFormDate, formatWatchFormDate } from "@/utils/generalFormatter";
import { NumericFormat } from "react-number-format";
import DatePickaForm from "@/components/library/dateRang/dateSelectForm";
import dayjs from "dayjs";
import { Typography } from "@mui/material";
import { map24hour, map60mins } from "@/app/[lng]/authorization/(menu)/dam/(menu)/parameters/data";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

type FormData = {
    hour: string;
    minute: string;
    before_gas_day: string;
    user_type_id: string;
    process_type_id: string;
    nomination_type_id: string;
    start_date: Date;
    end_date: Date;
};

type FormExampleProps = {
    mode?: "create" | "edit" | "view";
    data?: Partial<FormData>;
    open: boolean;
    nominationTypeMasterData: any;
    processTypeMasterData: any;
    userTypeMasterData: any
    onClose: () => void;
    onSubmit: SubmitHandler<FormData>;
    setResetForm: (reset: () => void) => void;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode = "create",
    data = {},
    nominationTypeMasterData = {},
    processTypeMasterData = {},
    userTypeMasterData = {},
    open,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const { control, register, handleSubmit, setValue, reset, formState: { errors }, watch, } = useForm<any>({ defaultValues: data });

    const labelClass = "block mb-2 text-sm font-light";
    const inputClass = "text-sm block md:w-full p-2 ps-5 pe-10 h-[35px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]";
    const selectboxClass = "flex w-full h-[35px] p-1 ps-1 pe-2 !rounded-lg text-gray-900 text-sm block outline-none";
    const textErrorClass = "text-red-500 text-sm";

    const isReadOnly = mode === "view";
    const startDate = watch("start_date");
    const formattedStartDate = formatWatchFormDate(startDate);

    const fetchData = async () => {
        try {
            // const responseAreaEntry = await getService(`/master/asset/area-entry`);
            // setAreaEntry(responseAreaEntry || [])
        } catch (err) {
        } finally {
        }
    };

    useEffect(() => {
        if (mode === "edit" || mode === "view") {
            const formattedStartDate: any = formatFormDate(data?.start_date);
            // const formattedEndDate: any = formatFormDate(data?.end_date);
            let formattedEndDate: any = 'Invalid Date'
            if (data?.end_date !== null) {
                formattedEndDate = formatFormDate(data?.end_date);
            }
            setValue("end_date", formattedEndDate);

            setValue("hour", data?.hour || "");
            // setValue("minute", data?.minute || "");
            setValue("minute", data?.minute !== undefined && data?.minute !== null ? data?.minute : '');
            setValue("before_gas_day", data?.before_gas_day || "");
            setValue("user_type_id", data?.user_type_id || "");
            setValue("nomination_type_id", data?.nomination_type_id || "");
            setValue("process_type_id", data?.process_type_id || "");
            setValue("start_date", formattedStartDate);
        }
    }, [data, mode, setValue]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <Dialog open={open} onClose={onClose} className="relative z-20">
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
                            <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-md ">
                                <form
                                    onSubmit={handleSubmit(onSubmit)}
                                    className="bg-white p-8 rounded-[20px] shadow-lg max-w"
                                >
                                    <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-5">{mode == "create" ? `New Nomination Deadline` : mode == "edit" ? "Edit Nomination Deadline" : "View Nomination Deadline"}</h2>
                                    <div className="grid grid-cols-2 gap-2 pt-4">

                                        <div className="col-span-2">
                                            <label
                                                htmlFor="process_type_id"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Process Type`}
                                            </label>
                                            <Select
                                                id="process_type_id"
                                                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                {...register("process_type_id", {
                                                    required: "Select Process Type",
                                                })}
                                                disabled={isReadOnly}
                                                value={watch("process_type_id") || ""}
                                                className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.process_type_id && "border-red-500"}`}
                                                sx={{
                                                    '.MuiOutlinedInput-notchedOutline': {
                                                        // borderColor: '#DFE4EA', // Change the border color here
                                                        borderColor: errors.process_type_id && !watch('process_type_id') ? '#FF0000' : '#DFE4EA',
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: errors.process_type_id && !watch("process_type_id") ? "#FF0000" : "#d2d4d8",
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#d2d4d8',
                                                    },
                                                }}
                                                onChange={(e) => {
                                                    setValue("process_type_id", e.target.value);
                                                    // fetchData(e?.target);
                                                }}
                                                displayEmpty
                                                renderValue={(value: any) => {
                                                    if (!value) {
                                                        return <Typography color="#9CA3AF" fontSize={14}>Select Process Type</Typography>;
                                                    }
                                                    return processTypeMasterData?.find((item: any) => item.id === value)?.name || '';
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
                                                {processTypeMasterData?.length > 0 && processTypeMasterData?.map((item: any) => (
                                                    <MenuItem key={item.id} value={item.id}>
                                                        {item.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.process_type_id && (
                                                <p className="text-red-500 text-sm">{`Select Process Type`}</p>
                                            )}
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
                                                {userTypeMasterData?.length > 0 && userTypeMasterData?.map((item: any) => (
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
                                                    return nominationTypeMasterData?.find((item: any) => item.id === value)?.name || '';
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
                                                {nominationTypeMasterData?.length > 0 && nominationTypeMasterData?.map((item: any) => (
                                                    <MenuItem key={item.id} value={item.id}>
                                                        {item.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.nomination_type_id && (
                                                <p className="text-red-500 text-sm">{`Select Nomination Type`}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="hour" className="block mb-2 text-sm font-light">
                                                <span className="text-red-500">*</span>
                                                {`Hour`}
                                            </label>

                                            <div className="flex gap-2">
                                                <Select
                                                    id="hour"
                                                    IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                    {...register("hour", {
                                                        required: "Select Hour",
                                                    })}
                                                    disabled={isReadOnly}
                                                    value={watch("hour") || ""}
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
                                                    }}
                                                    onChange={(e) => {
                                                        setValue("hour", e.target.value);
                                                    }}
                                                    displayEmpty
                                                    renderValue={(value: any) => {
                                                        if (!value) {
                                                            return <Typography color="#9CA3AF" fontSize={14}>Hour</Typography>;
                                                        }
                                                        return map24hour?.find((item: any) => item.id === value)?.name || '';
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

                                                <Select
                                                    id="minute"
                                                    IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                    {...register("minute", {
                                                        required: "Select Minute",
                                                    })}
                                                    disabled={isReadOnly}
                                                    value={watch("minute") || ""}
                                                    className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.minute && "border-red-500"}`}
                                                    sx={{
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
                                                    }}
                                                    onChange={(e) => {
                                                        setValue("minute", e.target.value);
                                                    }}
                                                    displayEmpty
                                                    renderValue={(value: any) => {
                                                        if (!value) {
                                                            return <Typography color="#9CA3AF" fontSize={14}>Minute</Typography>;
                                                        }
                                                        return map60mins?.find((item: any) => item.id === value)?.name || '';
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
                                                    {map60mins?.map((item: any) => (
                                                        <MenuItem key={item.id} value={item.id}>
                                                            {item.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </div>

                                            {errors.hour && (<p className="text-red-500 text-sm">{`Select Minute`}</p>)}
                                        </div>

                                        <div >
                                            <label
                                                htmlFor="before_gas_day"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Before Gas Day`}
                                            </label>
                                            {/* <input
                                                id="before_gas_day"
                                                type="number"
                                                placeholder="Enter Before Gas Day"
                                                readOnly={isReadOnly}
                                                {...register("before_gas_day", {
                                                    required: "Type Before Gas Day",
                                                })}
                                                className={`${inputClass} ${errors.before_gas_day && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                            /> */}
                                            <NumericFormat
                                                id="before_gas_day"
                                                placeholder="Enter Gas Day"
                                                value={watch("before_gas_day")}
                                                readOnly={isReadOnly}
                                                {...register("before_gas_day")}
                                                className={`${inputClass} ${errors.before_gas_day && "border-red-500"} ${isReadOnly && '!bg-[#EFECEC]'} `}
                                                thousandSeparator={false}
                                                decimalScale={2}
                                                fixedDecimalScale={false}
                                                allowNegative={false}
                                                displayType="input"
                                                onValueChange={(values) => {
                                                    const { value } = values;
                                                    setValue("before_gas_day", value, { shouldValidate: true, shouldDirty: true });
                                                }}
                                            />
                                            {errors.before_gas_day && (
                                                <p className="text-red-500 text-sm">{`Type Before Gas Day`}</p>
                                            )}
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
                                                valueShow={dayjs(watch("start_date")).format("DD/MM/YYYY")}
                                                // min={formattedStartDate || undefined}
                                                min={new Date()}
                                                // valueShow={watch("start_date")}
                                                allowClear
                                                isError={errors.start_date && !watch("start_date") ? true : false}
                                                onChange={(e: any) => { setValue('start_date', formatFormDate(e)), e == undefined && setValue('start_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                            />
                                            {errors.start_date && !watch("start_date") && <p className={`${textErrorClass}`}>{'Select Start Date'}</p>}
                                        </div>

                                        <div className="pb-2">
                                            <label className={labelClass}>{`End Date`}</label>
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
                                                readOnly={!formattedStartDate ? true : isReadOnly}
                                                placeHolder="Select End Date"
                                                mode={mode}
                                                min={formattedStartDate || undefined}
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

                                        {/* <button type="submit" className="w-[167px] font-light bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
                                            Add
                                        </button> */}
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
    );
};

export default ModalAction;
