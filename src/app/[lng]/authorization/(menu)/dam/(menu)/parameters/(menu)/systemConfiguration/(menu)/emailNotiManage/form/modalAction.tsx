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
import { Tab, Tabs, TextField, Typography } from "@mui/material";
import { TabPanel } from "@/components/other/tabPanel";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SelectFormProps from "@/components/other/selectProps";

type FormData = {
    menus_id: string;
    activity_id: string;
    subject: string;
    detail: string;
};

type FormExampleProps = {
    mode?: "create" | "edit" | "view";
    data?: Partial<FormData>;
    open: boolean;
    emailNotiMgn: any
    onClose: () => void;
    onSubmit: SubmitHandler<FormData>;
    setResetForm: (reset: () => void) => void;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode = "create",
    data = {},
    emailNotiMgn = {},
    open,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const { control, register, handleSubmit, setValue, reset, formState: { errors }, watch, clearErrors } = useForm<any>({ defaultValues: data });

    const labelClass = "block mb-2 text-sm font-light";
    const inputClass = "text-sm block md:w-full p-2 ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]";
    const selectboxClass = "flex w-full h-[44px] p-1 ps-[6px] pe-2 !rounded-lg text-gray-900 text-sm block outline-none";

    const isReadOnly = mode === "view";
    const startDate = watch("start_date");
    const formattedStartDate = formatWatchFormDate(startDate);
    const [subSystem, setSubSystem] = useState<any>([]);

    const handleFindSubSysParam = (id: any) => {
        // sub_email_notification_management
        setSubSystem(emailNotiMgn.find((item: any) => item.id === id))
    }

    useEffect(() => {
        if (mode === "edit" || mode === "view") {
            // const formattedStartDate: any = formatFormDate(data?.start_date);
            // // const formattedEndDate: any = formatFormDate(data?.end_date);
            // let formattedEndDate: any = ''
            // if (data?.end_date !== null) {
            //     formattedEndDate = formatFormDate(data?.end_date);
            // }
            // const filteredData = sysParamModule.find((item: any) => item.id === data?.menus_id);
            setSubSystem(emailNotiMgn.find((item: any) => item.id === data?.menus_id))

            setValue("menus_id", data?.menus_id || "");
            setValue("activity_id", data?.activity_id || "");
            setValue("subject", data?.subject || "");
            setValue("detail", data?.detail || "");
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
                            <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-md ">
                                <form
                                    onSubmit={handleSubmit(onSubmit)}
                                    className="bg-white p-8 rounded-[20px] shadow-lg max-w"
                                >
                                    <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-5">{mode == "create" ? `Add Email Notification Management` : mode == "edit" ? "Edit Email Notification Management" : "View Email Notification Management"}</h2>
                                    <div className="grid grid-cols-[700px] gap-2 pt-4">

                                        <div className="col-span-2">
                                            <label
                                                htmlFor="menus_id"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Module`}
                                            </label>

                                            <Select
                                                id="menus_id"
                                                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                {...register("menus_id", {
                                                    required: "Select Module",
                                                })}
                                                disabled={isReadOnly}
                                                value={watch("menus_id") || ""}
                                                className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.menus_id && "border-red-500"}`}
                                                sx={{
                                                    '.MuiOutlinedInput-notchedOutline': {
                                                        // borderColor: '#DFE4EA', // Change the border color here
                                                        borderColor: errors.menus_id && !watch('menus_id') ? '#FF0000' : '#DFE4EA',
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: errors.menus_id && !watch("menus_id") ? "#FF0000" : "#d2d4d8",
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#d2d4d8',
                                                    },
                                                    '&.Mui-disabled .MuiSelect-select': {
                                                        opacity: 1, // ยกเลิกความจางของ MUI
                                                        color: '#464255 !important', // สีที่คุณต้องการ
                                                        WebkitTextFillColor: '#464255 !important',
                                                    },
                                                }}
                                                onChange={(e) => {
                                                    setValue("menus_id", e.target.value);
                                                    handleFindSubSysParam(e.target.value);
                                                }}
                                                displayEmpty
                                                renderValue={(value: any) => {
                                                    if (!value) {
                                                        return <Typography color="#9CA3AF" fontSize={14}>Select Module</Typography>;
                                                    }
                                                    return emailNotiMgn.find((item: any) => item.id === value)?.name || '';
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
                                                {emailNotiMgn?.map((item: any) => (
                                                    <MenuItem key={item.id} value={item.id}>
                                                        {item.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.menus_id && (
                                                <p className="text-red-500 text-sm">{`Select Module`}</p>
                                            )}
                                        </div>

                                        <div className="col-span-2">
                                            <label
                                                htmlFor="activity_id"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Activity`}
                                            </label>

                                            {/* <Select
                                                id="activity_id"
                                                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                {...register("activity_id", {
                                                    required: "Select Activity",
                                                })}
                                                disabled={isReadOnly}
                                                value={watch("activity_id") || ""}
                                                className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.activity_id && "border-red-500"}`}
                                                sx={{
                                                    '.MuiOutlinedInput-notchedOutline': {
                                                        // borderColor: '#DFE4EA', // Change the border color here
                                                        borderColor: errors.activity_id && !watch('activity_id') ? '#FF0000' : '#DFE4EA',
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: errors.activity_id && !watch("activity_id") ? "#FF0000" : "#d2d4d8",
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#d2d4d8',
                                                    },
                                                }}
                                                onChange={(e) => {
                                                    setValue("activity_id", e.target.value);
                                                }}
                                                displayEmpty
                                                renderValue={(value: any) => {
                                                    if (!value) {
                                                        return <Typography color="#9CA3AF" fontSize={14}>Select Activity</Typography>;
                                                    }
                                                    return subSystem?.sub_email_notification_management.find((item: any) => item.id === value)?.name || '';
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
                                                {subSystem?.sub_email_notification_management?.map((item: any) => (
                                                    <MenuItem key={item.id} value={item.id}>
                                                        {item.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.activity_id && (<p className="text-red-500 text-sm">{`Select Activity`}</p>)} */}


                                            <SelectFormProps
                                                id={'activity_id'}
                                                register={register("activity_id", { required: "Select Activity" })}
                                                disabled={isReadOnly}
                                                valueWatch={watch("activity_id") || ""}
                                                handleChange={(e) => {
                                                    setValue("activity_id", e.target.value);
                                                    if (errors?.activity_id) { clearErrors('activity_id') }
                                                }}
                                                errors={errors?.activity_id}
                                                errorsText={'Select Activity'}
                                                options={subSystem?.sub_email_notification_management}
                                                optionsKey={'id'}
                                                optionsValue={'id'}
                                                optionsText={'name'}
                                                optionsResult={'name'}
                                                placeholder={'Select Activity'}
                                                pathFilter={'name'}
                                            />
                                        </div>

                                        <div >
                                            <label
                                                htmlFor="subject"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Subject`}
                                            </label>
                                            <input
                                                id="subject"
                                                type="text"
                                                placeholder="Enter Subject"
                                                readOnly={isReadOnly}
                                                {...register("subject", {
                                                    required: "Type subject",
                                                })}
                                                className={`${inputClass} ${errors.subject && "border-red-500"} ${isReadOnly && '!bg-[#EFECEC]'}`}
                                            />
                                            {errors.subject && (
                                                <p className="text-red-500 text-sm">{`Type subject`}</p>
                                            )}
                                        </div>

                                        <div className="col-span-2">
                                            <label htmlFor="detail" className={labelClass}>
                                                <span className="text-red-500">*</span>{`detail`}
                                            </label>
                                            <TextField
                                                {...register('detail', { required: "Enter detail" })}
                                                value={watch('detail') || ''}
                                                onChange={(e) => {
                                                    if (e.target.value.length <= 255) {
                                                        setValue('detail', e.target.value);
                                                    }
                                                }}
                                                label=""
                                                multiline
                                                placeholder='Detail'
                                                disabled={isReadOnly}
                                                rows={6}
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
                                                className={`${errors.detail && "border-red-500"} ${isReadOnly && '!bg-[#EFECEC]'}`}
                                            />
                                            {errors.detail && (<p className="text-red-500 text-sm">{`Enter Detail`}</p>)}
                                            <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                                <span className="text-[13px]">{watch('detail')?.length || 0} / 255</span>
                                            </div>
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