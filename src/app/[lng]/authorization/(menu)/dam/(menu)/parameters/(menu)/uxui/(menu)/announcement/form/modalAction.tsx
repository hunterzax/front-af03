import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import { useEffect } from "react";
import { formatFormDate, formatWatchFormDate, getMinDate } from "@/utils/generalFormatter";
import { ListItemText, Select, TextField } from "@mui/material";
import DatePickaForm from "@/components/library/dateRang/dateSelectForm";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Typography } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import dayjs from "dayjs";
import ModalConfirmSave from "@/components/other/modalConfirmSave";

type FormData = {
    topic: string;
    detail: string;
    start_date: Date;
    end_date: Date;
    status: any;
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
    const { control, register, handleSubmit, setValue, reset, formState: { errors }, watch } = useForm<any>({ defaultValues: data });
    const [isLoading, setIsLoading] = useState<boolean>(true);

    {/* Confirm Save */ }
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()

    const labelClass = "block mb-2 text-[14px] font-light"
    const inputClass = "text-[14px] block md:w-full p-2 ps-5 focus:!ps-5 hover:!ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"
    const selectboxClass = "flex w-full h-[44px] p-2 ps-4 pe-10 !rounded-lg text-gray-900 text-[14px] block outline-none"
    const textErrorClass = "text-red-500 text-[14px]"
    const itemselectClass = "pl-[10px] text-[14px]"

    // const isReadOnly = mode === "view";
    const isReadOnly = mode === "view" || (data?.start_date && new Date(data?.start_date) < new Date());
    const startDate = watch("start_date");
    const formattedStartDate = formatWatchFormDate(startDate);

    useEffect(() => {
        if (mode === "edit" || mode === "view") {
            const formattedStartDate: any = formatFormDate(data?.start_date);
            // const formattedEndDate: any = formatFormDate(data?.end_date);
            let formattedEndDate: any = null;
            if (data?.end_date !== null) {
                formattedEndDate = formatFormDate(data?.end_date);
            }
            setValue("end_date", formattedEndDate);
            setValue("topic", data?.topic || "");
            setValue("detail", data?.detail || "");
            setValue("start_date", formattedStartDate);
            setValue("status", data?.status == true ? "1" : data?.status == false && "2");
        }
    }, [data, mode, setValue]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    {/* Confirm Save */ }
    const handleSaveConfirm = async (data?: any) => {
        if (mode == 'create') {
            await onSubmit(data);
        } else {
            setDataSubmit(data)
            setModaConfirmSave(true)
        }
    }

    return (
        <>
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
                                        // onSubmit={handleSubmit(onSubmit)}
                                        onSubmit={handleSubmit(handleSaveConfirm)}
                                        className="bg-white p-8 rounded-[20px] shadow-lg max-w !w-[600px]"
                                    >
                                        <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-5">{mode == "create" ? `New Announcement` : mode == "edit" ? "Edit Announcement" : "View Announcement"}</h2>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="col-span-2">
                                                <label
                                                    htmlFor="topic"
                                                    className="block mb-2 text-[14px] font-light"
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {`Topic`}
                                                </label>
                                                <input
                                                    id="topic"
                                                    type="text"
                                                    placeholder="Enter Topic"
                                                    readOnly={isReadOnly}
                                                    {...register("topic", { required: "Type Topic" })}
                                                    onChange={(e) => {
                                                        if (e.target.value.length <= 255) {
                                                            setValue('topic', e.target.value);
                                                        }
                                                    }}
                                                    maxLength={255}
                                                    className={`${inputClass} ${errors.topic && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                />
                                                <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                                    <span className="text-[13px]">{watch('topic')?.length || 0} / 255</span>
                                                </div>
                                                {errors.topic && (
                                                    <p className="text-red-500 text-[14px]">{`Type Topic`}</p>
                                                )}
                                            </div>

                                            <div className="col-span-2">
                                                <label className={labelClass}><span className="text-red-500">*</span>{`Detail`}</label>
                                                <TextField
                                                    {...register("detail", {
                                                        required: "Type Detail",
                                                    })}
                                                    value={watch('detail') || ''}
                                                    onChange={(e) => {
                                                        if (e.target.value.length <= 500) {
                                                            setValue('detail', e.target.value);
                                                        }
                                                    }}
                                                    label=""
                                                    multiline
                                                    placeholder='Enter Detail'
                                                    disabled={isReadOnly}
                                                    rows={6}
                                                    // sx={{
                                                    //     '.MuiOutlinedInput-root': {
                                                    //         borderRadius: '8px',
                                                    //         padding: "15px 20px"
                                                    //     },
                                                    //     '.MuiOutlinedInput-notchedOutline': {
                                                    //         // borderColor: '#DFE4EA',
                                                    //         borderColor: errors.detail && !watch('detail') ? '#FF0000' : '#DFE4EA',
                                                    //     },
                                                    //     '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    //         borderColor: errors.detail && !watch("detail") ? "#FF0000" : "#d2d4d8",
                                                    //     },
                                                    //     '&.Mui-focused .MuiOutlinedI nput-notchedOutline': {
                                                    //         borderColor: '#d2d4d8',
                                                    //     },
                                                    //     '& .MuiInputBase-input::placeholder': {
                                                    //         color: '#9CA3AF', // Placeholder color
                                                    //         fontSize: '14px', // Placeholder font size
                                                    //         opacity: 10
                                                    //     },
                                                    // }}
                                                    sx={{
                                                        '.MuiOutlinedInput-root': {
                                                            borderRadius: '8px',
                                                        },
                                                        '.MuiOutlinedInput-notchedOutline': {
                                                            // borderColor: '#DFE4EA',
                                                            borderColor: errors.detail && !watch('detail') ? '#FF0000' : '#DFE4EA',
                                                        },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: errors.detail && !watch("detail") ? "#FF0000" : '#DFE4EA !important',
                                                        },
                                                        '&.Mui-focused .MuiOutlinedI nput-notchedOutline': {
                                                            borderColor: '#00ADEF',
                                                        },
                                                        '&.MuiInputBase-input::placeholder': {
                                                            color: '#9CA3AF', // Placeholder color
                                                            fontSize: '14px', // Placeholder font size
                                                        },
                                                        '& .Mui-disabled': {
                                                            color: '#58585A', // Disabled text color
                                                        },
                                                        "& .MuiOutlinedInput-input::placeholder": {
                                                            fontSize: "14px",
                                                        },
                                                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                            borderColor: "#00ADEF !important", // 👈 force black border on focus
                                                            borderWidth: '1px', // 👈 Force border 1px on focus
                                                        },
                                                    }}
                                                    fullWidth
                                                    className={`${errors.description && "border-red-500"} ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                />
                                                {errors.detail && <p className="text-red-500 text-[14px]">{`Type Detail`}</p>}
                                                <div className="flex justify-end text-[14px] text-[#B6B6B6] mt-1">
                                                    <span className="text-[13px]">{watch('detail')?.length || 0} / 500</span>
                                                </div>
                                            </div>

                                            <div className="pb-2">
                                                <label className={labelClass}>
                                                    <span className="text-red-500">*</span>
                                                    {`Start Date`}
                                                </label>

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
                                                <label className={labelClass}>
                                                    {/* <span className="text-red-500">*</span> */}
                                                    {`End Date`}
                                                </label>
                                                <DatePickaForm
                                                    {...register('end_date')}
                                                    readOnly={!formattedStartDate ? true : mode == 'edit' ? false : isReadOnly}
                                                    placeHolder="Select End Date"
                                                    mode={mode}
                                                    // min={formattedStartDate || undefined}
                                                    min={getMinDate(formattedStartDate)}
                                                    valueShow={watch("end_date") ? dayjs(watch("end_date")).format("DD/MM/YYYY") : undefined}
                                                    allowClear
                                                    onChange={(e: any) => { setValue('end_date', formatFormDate(e)), e == undefined && setValue('end_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                                />
                                                {/* {errors.start_date && (<p className={`${textErrorClass}`}>{`Select End Date`}</p>)} */}
                                            </div>
                                        </div>

                                        <div>
                                            <label className={labelClass}>{`Status`}</label>
                                            <Select
                                                id='select_announcement_status'
                                                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                {...register('status', { required: false })}
                                                disabled={isReadOnly}
                                                value={watch('status') || ''}
                                                className={`!w-[49%] ${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.status && 'border-red-500'}`}
                                                sx={{
                                                    '.MuiOutlinedInput-notchedOutline': {
                                                        // borderColor: '#DFE4EA', // Change the border color here
                                                        borderColor: errors.status ? '#FF0000' : '#DFE4EA',
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: errors.status && !watch("status") ? "#FF0000" : "#d2d4d8",
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#d2d4d8',
                                                    },
                                                }}
                                                displayEmpty
                                                renderValue={(value: any) => {
                                                    if (!value) {
                                                        return <Typography color="#9CA3AF" className={isReadOnly ? 'opacity-0' : 'opacity-100'} fontSize={14}>Select Status</Typography>;
                                                    }
                                                    const periodMap: { [key: string]: string } = {
                                                        "1": 'Active',
                                                        "2": 'Inactive',
                                                    };
                                                    return <span className={itemselectClass}>{periodMap[value] || ''}</span>;
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
                                                <MenuItem value={"1"}><ListItemText primary={<Typography fontSize={14}>{"Active"}</Typography>} /></MenuItem>
                                                <MenuItem value={"2"}><ListItemText primary={<Typography fontSize={14}>{"Inactive"}</Typography>} /></MenuItem>
                                            </Select>
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