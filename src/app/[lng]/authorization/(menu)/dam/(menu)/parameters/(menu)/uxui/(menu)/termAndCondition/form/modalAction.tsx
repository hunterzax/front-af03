import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { uploadFileService } from "@/utils/postService";
import { cutUploadFileName, formatFormDate, formatWatchFormDate, getMinDate } from "@/utils/generalFormatter";
import DatePickaForm from "@/components/library/dateRang/dateSelectForm";
import dayjs from "dayjs";
import { Typography } from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";
import ModalConfirmSave from "@/components/other/modalConfirmSave";

type FormData = {
    topic: string;
    url: string;
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
    const { control, register, handleSubmit, setValue, reset, formState: { errors }, setError, clearErrors, watch } = useForm<any>({ defaultValues: data });

    const labelClass = "block mb-2 text-[14px] font-light"
    const inputClass = "text-[14px] block md:w-full p-2 ps-5 focus:!ps-5 hover:!ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"
    const textErrorClass = "text-red-500 text-[14px]"

    const isReadOnly = mode === "view" || (data?.start_date && new Date(data?.start_date) < new Date());
    const startDate = watch("start_date");
    const formattedStartDate = formatWatchFormDate(startDate);
    const [fileName, setFileName] = useState('No file Choose');

    {/* Confirm Save */ }
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()

    useEffect(() => {
        if (mode === "edit" || mode === "view") {
            const formattedStartDate: any = formatFormDate(data?.start_date);
            // const formattedEndDate: any = formatFormDate(data?.end_date);
            let formattedEndDate: any = 'Invalid Date'
            if (data?.end_date !== null) {
                formattedEndDate = formatFormDate(data?.end_date);
            }
            const file_name: any = data?.url
            // setFileName(file_name)
            setFileName(cutUploadFileName(file_name))

            setValue("topic", data?.topic || "");
            setValue("url", data?.url || "");
            setValue("start_date", formattedStartDate);
            setValue("end_date", formattedEndDate);
        }
    }, [data, mode, setValue]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    const handleFileChange = async (e: any) => {
        const file = e.target.files[0];
        if (file) {
            const validFileTypes = ['application/pdf'];

            if (!validFileTypes?.includes(file.type)) {
                setFileName('Invalid file type. Please upload a PDF');
                setError("file", {
                    type: "custom",
                    message: "Invalid file type. Please upload a PDF",
                });
                return;
            }

            if (file.type === 'application/pdf') {
                setFileName(file.name);

                try {
                    const response: any = await uploadFileService('/files/uploadfile/', file);

                    setValue("url", response?.file?.url);
                    if (errors?.file) {
                        clearErrors('file');
                    }

                } catch (error) {
                    // File upload failed:
                }

            } else {
                setFileName('Invalid file type. Please upload a PDF.');
                // Invalid file type:'
            }
        } else {
            setFileName('No file Choose');
        }
    };

    const handleClose = () => {
        setFileName('No file Choose');
        setValue('url', null);
        setValue("start_date", null);
        setValue("end_date", null);
        onClose();
        reset();
    };

    const handleRemoveFile = () => {
        setFileName('No file Choose'); // Reset fileName
        setValue('file', null);
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
                                <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-md ">
                                    <form
                                        // onSubmit={handleSubmit(onSubmit)}
                                        // onSubmit={handleSubmit((data) => { // clear state when submit
                                        //     // setSelectedValues([]);
                                        //     onSubmit(data);
                                        //     setFileName('No file Choose');
                                        //     setValue("start_date", null);
                                        //     setValue("end_date", null);
                                        //     setValue('url', null);
                                        //     reset();
                                        // })}
                                        onSubmit={handleSubmit(handleSaveConfirm)}
                                        className="bg-white p-8 rounded-[20px] shadow-lg max-w w-[600px]"
                                    >
                                        <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-5">{mode == "create" ? `New Term & Condition` : mode == "edit" ? "Edit Term & Condition" : "View Term & Condition"}</h2>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="col-span-2">
                                                <label
                                                    htmlFor="topic"
                                                    className={labelClass}
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
                                                        if (e.target.value.length <= 75) {
                                                            setValue('topic', e.target.value);
                                                        }
                                                    }}
                                                    maxLength={75}
                                                    className={`${inputClass} ${errors.topic && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                />
                                                <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                                    <span className="text-[13px]">{watch('topic')?.length || 0} / 75</span>
                                                </div>
                                                {errors.topic && (
                                                    <p className="text-red-500 text-sm mt-[-23px]">{`Enter Topic`}</p>
                                                )}
                                            </div>

                                            <div className="col-span-2">
                                                <label
                                                    htmlFor="url"
                                                    className={labelClass}
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {`File`}
                                                </label>

                                                {/* <div className="flex items-center "> */}
                                                <div className={`grid w-full grid-cols-[30%_70%] rounded-[7px] border ${errors?.file ? 'border-[#FF0000] h-[39px]' : 'border-none h-[40px]'} relative`}>
                                                    {/* "Choose File" button */}
                                                    <label className={`bg-[#00ADEF]  text-white text-center items- justify-center font-semibold rounded-l-[6px] text-sm px-5 py-2 cursor-pointer ${isReadOnly && "!bg-[#B6B6B6] !text-[#828282]"}`}>
                                                        {`Choose File`}
                                                        <input
                                                            id="url"
                                                            type="file"
                                                            className="hidden"
                                                            accept=".pdf"
                                                            {...register('file', { required: (fileName !== 'No file Choose') ? false : "Please Choose File" })}
                                                            readOnly={isReadOnly}
                                                            disabled={isReadOnly}
                                                            onChange={handleFileChange}
                                                        />
                                                    </label>

                                                    {/* Filename display */}
                                                    <div
                                                        className={`
                                                        bg-white 
                                                        text-[#9CA3AF] 
                                                        text-[14px] w-[100%] 
                                                        !h-[100%] 
                                                        px-2 
                                                        py-2 
                                                        rounded-r-[6px] 
                                                        border-l-0 
                                                        border 
                                                        border-gray-300 
                                                        truncate 
                                                        overflow-hidden 
                                                        ${isReadOnly && '!bg-[#EFECEC]'} 
                                                        flex 
                                                        items-center
                                                    `}
                                                    >
                                                        <Typography className={`truncate ${fileName == 'Maximum File 10 MB' || fileName == "No file Choose" ? 'text-[#9CA3AF]' : 'text-[#464255]'} ${isReadOnly && fileName == 'No file Choose' ? 'opacity-0' : 'opacity-100'}`} fontSize={14}>{fileName}</Typography>
                                                        {/* {fileName} */}
                                                        {fileName !== "No file Choose" && !isReadOnly && (
                                                            <CloseOutlined
                                                                onClick={handleRemoveFile}
                                                                className={`cursor-pointer ml-2 text-[#9CA3AF] z-10`}
                                                                sx={{ color: '#323232', fontSize: 18 }}
                                                                style={{ fontSize: 18 }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                {errors?.file && (<p className="text-red-500 text-[14px]">{errors?.file?.message ? String(errors?.file?.message) : `Please Choose File`}</p>)}
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
                        // setIsLoading(true);
                        setTimeout(async () => {
                            await onSubmit(dataSubmit);

                            setFileName('No file Choose');
                            setValue("start_date", null);
                            setValue("end_date", null);
                            setValue('url', null);
                            reset();
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