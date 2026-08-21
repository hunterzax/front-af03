import React from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { formatFormDate, formatWatchFormDate, getMinDate } from "@/utils/generalFormatter";
import { Tab, Tabs, TextField } from "@mui/material";
import DatePickaForm from "@/components/library/dateRang/dateSelectForm";
import dayjs from "dayjs";

type FormData = {
    remark: string;
    start_date: Date | null;
    end_date: Date | null;
};

type FormExampleProps = {
    mode?: "create" | "edit" | "view";
    data?: Partial<FormData>;
    open: boolean;
    onClose: () => void;
    onSubmit: SubmitHandler<FormData>;
    setResetForm: (reset: () => void) => void;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode = "create",
    data = {},
    open,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const { control, register, handleSubmit, setValue, reset, formState: { errors }, watch } = useForm<any>({ defaultValues: data });
    const labelClass = "block mb-2 text-[14px] font-light"
    const textErrorClass = "text-red-500 text-[14px]"

    const isReadOnly: any = mode === "view" || (data?.start_date && new Date(data?.start_date) < new Date());
    const startDate = watch("start_date");
    const formattedStartDate = formatWatchFormDate(startDate);

    useEffect(() => {
        if (mode === "edit" || mode === "view") {
            const formattedStartDate: any = formatFormDate(data?.start_date);
            // const formattedEndDate: any = formatFormDate(data?.end_date);
            let formattedEndDate: any = 'Invalid Date'
            if (data?.end_date !== null) {
                formattedEndDate = formatFormDate(data?.end_date);
            }
            setValue("end_date", formattedEndDate);
            setValue("remark", data?.remark || "");
            setValue("start_date", formattedStartDate);
        }
    }, [data, mode, setValue]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    return (
        <Dialog open={open} onClose={onClose} className="relative z-20">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
            />
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0 ">
                    <DialogPanel
                        transition
                        className="flex transform transition-all inset-0 rounded-lg text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in  data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                    >
                        <div className="flex inset-0 items-center justify-center ">
                            <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-md ]">
                                <form
                                    onSubmit={handleSubmit(onSubmit)}
                                    className="bg-white p-8 rounded-[20px] shadow-lg max-w w-[600px]"
                                >
                                    <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-5">{mode == "create" ? `New Capacity Publication Remark` : mode == "edit" ? "Edit Capacity Publication Remark" : "View Capacity Publication Remark"}</h2>
                                    <div className="grid grid-cols-2 gap-2 pt-4">

                                        <div className="col-span-2">
                                            <label htmlFor="remark" className={labelClass}>
                                                <span className="text-red-500">*</span>{`Remarks`}
                                            </label>
                                            <TextField
                                                {...register('remark', { required: "Enter Remark" })}
                                                value={watch('remark') || ''}
                                                onChange={(e) => {
                                                    if (e.target.value.length <= 2000) {
                                                        setValue('remark', e.target.value);
                                                    }
                                                }}
                                                label=""
                                                multiline
                                                placeholder='Remark'
                                                disabled={isReadOnly}
                                                rows={10}
                                                // sx={{
                                                //     '.MuiOutlinedInput-root': {
                                                //         borderRadius: '8px',
                                                //         padding: "15px 20px"
                                                //     },
                                                //     '.MuiOutlinedInput-notchedOutline': {
                                                //         // borderColor: '#DFE4EA',
                                                //         borderColor: errors.remark && !watch('remark') ? '#FF0000' : '#DFE4EA',
                                                //     },
                                                //     '&:hover .MuiOutlinedInput-notchedOutline': {
                                                //         borderColor: errors.remark && !watch("remark") ? "#FF0000" : "#d2d4d8",
                                                //     },
                                                //     '&.Mui-focused .MuiOutlinedI nput-notchedOutline': {
                                                //         borderColor: '#d2d4d8',
                                                //     },
                                                //     '& .MuiInputBase-input::placeholder': {
                                                //         color: '#9CA3AF', // Placeholder color
                                                //         fontSize: '14px', // Placeholder font size
                                                //         opacity: 10
                                                //     },
                                                //     '& .Mui-disabled': {
                                                //         color: '#58585A', // Disabled text color
                                                //     },
                                                // }}

                                                sx={{
                                                    '.MuiOutlinedInput-root': {
                                                        borderRadius: '8px',
                                                    },
                                                    '.MuiOutlinedInput-notchedOutline': {
                                                        // borderColor: '#DFE4EA',
                                                        borderColor: errors.remark && !watch('remark') ? '#FF0000' : '#DFE4EA',
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: errors.remark && !watch("remark") ? "#FF0000" : '#DFE4EA !important',
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
                                                className={`${errors.remark && "border-red-500"} ${isReadOnly && '!bg-[#EFECEC]'}`}
                                            />
                                            {errors.remark && (<p className="text-red-500 text-[14px]">{`Enter Remark`}</p>)}
                                            <div className="flex justify-end text-[14px] text-[#B6B6B6] mt-1">
                                                <span className="text-[13px]">{watch('remark')?.length || 0} / 2000</span>
                                            </div>
                                        </div>

                                        <div className="pb-2">
                                            <label className={labelClass}><span className="text-red-500">*</span>{`Start Date`}</label>
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
                                            {/* {errors.end_date && <p className={`${textErrorClass}`}>{`Select End Date`}</p>} */}
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