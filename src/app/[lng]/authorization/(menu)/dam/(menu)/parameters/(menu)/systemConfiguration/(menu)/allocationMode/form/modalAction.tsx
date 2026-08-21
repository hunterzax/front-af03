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
import { getService } from "@/utils/postService";
import { formatFormDate, formatWatchFormDate } from "@/utils/generalFormatter";
import { Tab, Tabs, Typography } from "@mui/material";
import DatePickaForm from "@/components/library/dateRang/dateSelectForm";
import dayjs from "dayjs";
import { NumericFormat } from "react-number-format";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SelectFormProps from "@/components/other/selectProps";

// type FormData = {
//     menus_id: string;
//     system_parameter_id: string;
//     value: string;
//     link: string;
//     start_date: Date;
//     end_date: Date;
// };

type FormExampleProps = {
    mode?: "create" | "edit" | "view";
    data?: Partial<any>;
    open: boolean;
    allocationModeMaster: any
    onClose: () => void;
    onSubmit: SubmitHandler<any>;
    setResetForm: (reset: () => void) => void;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode = "create",
    data = {},
    allocationModeMaster,
    open,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const { control, register, handleSubmit, setValue, reset, clearErrors, formState: { errors }, watch } = useForm<any>({ defaultValues: data });

    const labelClass = "block mb-2 text-sm font-light";
    const textErrorClass = "text-red-500 text-sm";
    const isReadOnly = mode === "view";

    useEffect(() => {
        if (mode === "edit" || mode === "view") {
            const formattedStartDate: any = formatFormDate(data?.start_date);
            // const formattedEndDate: any = formatFormDate(data?.end_date);
            let formattedEndDate: any = 'Invalid Date'
            if (data?.end_date !== null) {
                formattedEndDate = formatFormDate(data?.end_date);
            }
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
                                    <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-5">{mode == "create" ? `New Allocation Mode` : mode == "edit" ? "Edit Allocation Mode" : "View Allocation Mode"}</h2>
                                    <div className="grid grid-cols-2 gap-2 pt-1">

                                        <div className="col-span-2">
                                            <label
                                                htmlFor="menus_id"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Allocation Mode`}
                                            </label>

                                            {/* <Select
                                                id="allocation_mode_type_id"
                                                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                {...register("allocation_mode_type_id", {
                                                    required: "Select Allocation Mode",
                                                })}
                                                disabled={isReadOnly}
                                                value={watch("allocation_mode_type_id") || ""}
                                                className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.allocation_mode_type_id && "border-red-500"}`}
                                                sx={{
                                                    '.MuiOutlinedInput-notchedOutline': {
                                                        // borderColor: '#DFE4EA', // Change the border color here
                                                        borderColor: errors.allocation_mode_type_id && !watch('allocation_mode_type_id') ? '#FF0000' : '#DFE4EA',
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: errors.allocation_mode_type_id && !watch("allocation_mode_type_id") ? "#FF0000" : "#d2d4d8",
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#d2d4d8',
                                                    },
                                                }}
                                                onChange={(e) => {
                                                    setValue("allocation_mode_type_id", e.target.value);
                                                }}
                                                displayEmpty
                                                renderValue={(value: any) => {
                                                    if (!value) {
                                                        return <Typography color="#9CA3AF" fontSize={14}>Select Allocation Mode</Typography>;
                                                    }
                                                    return allocationModeMaster?.find((item: any) => item.id === value)?.mode || '';
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
                                                {allocationModeMaster?.map((item: any) => (
                                                    <MenuItem key={item.id} value={item.id}>
                                                        {item.mode}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.allocation_mode_type_id && (<p className="text-red-500 text-sm">{`Select Allocation Mode`}</p>)} */}

                                            <SelectFormProps
                                                id={'allocation_mode_type_id'}
                                                register={register("allocation_mode_type_id", { required: "Select Allocation Mode" })}
                                                disabled={isReadOnly}
                                                valueWatch={watch("allocation_mode_type_id") || ""}
                                                handleChange={(e) => {
                                                    setValue("allocation_mode_type_id", e.target.value);
                                                    if (errors?.allocation_mode_type_id) { clearErrors('allocation_mode_type_id') }
                                                }}
                                                errors={errors?.allocation_mode_type_id}
                                                errorsText={'Select Allocation Mode'}
                                                options={allocationModeMaster}
                                                optionsKey={'id'}
                                                optionsValue={'id'}
                                                optionsText={'mode'}
                                                optionsResult={'mode'}
                                                placeholder={'Select Allocation Mode'}
                                                pathFilter={'mode'}
                                            />
                                        </div>


                                        <div className="pb-2 col-span-2">
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
        </Dialog>
    );
};

export default ModalAction;
