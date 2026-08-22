import { SubmitHandler, useForm } from "react-hook-form";
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import Spinloading from "@/components/other/spinLoading";
import { useState } from "react";
import DatePickaForm from "@/components/library/dateRang/dateSelectForm";
import { formatFormDate, formatWatchFormDate, toDayjs } from "@/utils/generalFormatter";
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { getService, uploadFileServiceWithAuth } from "@/utils/postService";
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ModalSelShipperContract from "./modalSelShipper";
import ConfirmModal from "@/components/other/confirmModal";

type FormExampleProps = {
    mode?: 'execute' | 'template' | 'view';
    // dataForm?: Partial<FormData>;
    open: boolean;
    setformActionOpen?: any;
    setModalErrorMsg?: any;
    setModalErrorOpen?: any;
    setModalSuccessOpen?: any;
    setModalSuccessMsg?: any;
    setIsUpload?: any;
    shipperGroupData?: any;
    dataContractOriginal?: any;
    userDT?: any;
    onClose: () => void;
    onSubmit: SubmitHandler<any>;
    setResetForm: (reset: () => void) => void;
};

const labelClass = "block mb-2 text-[14px] font-light";
const textErrorClass = "text-red-500 text-[14px]";

const ModalImport: React.FC<FormExampleProps> = ({
    mode,
    // dataForm = {},
    open,
    setformActionOpen,
    setModalErrorMsg,
    setModalErrorOpen,
    setModalSuccessOpen,
    setModalSuccessMsg,
    setIsUpload,
    shipperGroupData,
    dataContractOriginal,
    userDT,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const { register, handleSubmit, setValue, getValues, reset, formState: { errors }, watch, setError, clearErrors } = useForm<any>();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const startDate = watch('start_date');
    const formattedStartDate = formatWatchFormDate(startDate);

    const [modalWarningOpen, setModalWarningOpen] = useState(false);
    const [modalWarningMsg, setModalWarningMsg] = useState('');

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            reset();
        }, 200);
    };

    // ############# UPLOAD FILE #############
    const [fileName, setFileName] = useState('Maximum File 10 MB');
    const [fileUpload, setFileUpload] = useState<any>();
    const [requireText, setRequireText] = useState('Required : .xls, .xlsx');
    const [iserror, setiserror] = useState<boolean>(false);

    const handleFileChange = async (e: any) => {
        const file = e.target.files[0];

        const setvalError = (text: any) => {
            setFileName('Maximum File 10 MB')
            setError('upload_tranform', { type: "custom", message: text });
            setValue('upload_tranform', null);

            setFileUpload(null);
            setTimeout(() => {
                setIsLoading(false);
            }, 300);
        }

        if (file) {
            setIsLoading(true);
            const validFileTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
            const maxSizeInMB = 10; // Maximum file size in MB
            const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

            if (!validFileTypes.includes(file.type)) {
                setvalError('Invalid file type. Please upload a Excel file.');
                setTimeout(() => { setIsLoading(false) }, 300);
                return;
            }

            if (file.size > maxSizeInBytes) {
                setvalError('The file is larger than 10 MB.');
                setTimeout(() => { setIsLoading(false) }, 300);
                return;
            }

            setFileName(file.name);
            setFileUpload(file);
            if (errors?.upload_tranform) clearErrors('upload_tranform');

            setTimeout(() => {
                setIsLoading(false);
            }, 300);
        }
    };

    const handleRemoveFile = () => {
        setFileName("Maximum File 10 MB"); // Reset fileName
        setFileUpload(undefined);
        setValue('upload_tranform', null);
        // setFileUrl('')
    };

    const handleClickDownload = async (data: any) => {
        // ส่ง shipper_id ที่เป็น string
        // กับ contract_code
        const res_download = await getService(`/master/allocation/gen-excel-template-url?contract_code_name=${data?.contract_code}&shipper_code=${data?.group_id}`);

        if (res_download?.status === 400) {
            setModalErrorMsg(res_download?.error);
            setModalErrorOpen(true)
        } else {
            // setModalSuccessOpen(true);
            const { url, filename = "Allocation_Review.xlsx" } = res_download?.file
            const link = document.createElement("a")
            link.href = url
            link.download = filename
            link.target = "_blank"
            document.body.appendChild(link)
            link.click()
            link.remove()

            setTimeout(() => {
                setOpenSelShipper(false);
                setIsLoading(false);
            }, 1000);
        }
    };

    const handleClickUpload = async (ignoreWaring: boolean = false) => {
        setIsLoading(true);
        if (fileUpload) {
            try {
                let res_upload: any
                res_upload = await uploadFileServiceWithAuth(`/master/allocation/allocation-review-import?ignore=${ignoreWaring}`, fileUpload, null)
                
                if (res_upload?.response?.data?.status === 400 || res_upload?.response?.status === 500) {
                    setModalErrorMsg(res_upload?.response?.data?.error ? res_upload?.response?.data?.error : "Missing required columns, Please check the file structure"); // ปรับ Error Message เคสที่ไม่มี column gas day เลย หรือ เคสที่ column ใด column นึงหายไป (เคสStructure template ไม่เหมือนเดิม) https://app.clickup.com/t/86eu4duyz
                    setModalErrorOpen(true);
                } else {
                    // warning ก่อนสำเร็จ
                    // if (res_upload?.warning) {
                    //     setModalWarningMsg("Total Entry & Total Exit equals zero.")
                    //     setModalWarningOpen(true)
                    //     setformActionOpen(false)
                    // } else {
                    //     setformActionOpen(false)
                    //     setModalSuccessOpen(true);
                    // }
                    if (res_upload?.data?.warning && Array.isArray(res_upload.data.warning) && res_upload.data.warning.length > 0) {
                        setModalWarningMsg(res_upload.data.warning.join('<br/>'))
                        setModalWarningOpen(true)
                    } else {
                        setModalSuccessMsg('File has been uploaded.')
                        setModalSuccessOpen(true);
                        setIsUpload(true)
                    }
                    setformActionOpen(false)
                }
            } catch (error) {
                // File upload failed:
            }
        } else {
            setFileName('No file chosen');
        }
        setIsLoading(false);
    };

    // ############### MODAL SELECT SHIPPER ###############
    const [openSelShipper, setOpenSelShipper] = useState<boolean>(false);
    const [idShipper, setIdShipper] = useState<any>();

    const checkIsShipper = (mode?: any) => {
        setOpenSelShipper(true);
    };

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
                                <div className="flex flex-col items-center justify-center gap-2 rounded-md w-[700px]">
                                    <Spinloading spin={isLoading} rounded={20} />
                                    <form
                                        onSubmit={handleSubmit(async (data) => { // clear state when submit
                                            setIsLoading(true);
                                            setTimeout(async () => {
                                                await onSubmit(data);
                                            }, 100);
                                        })}
                                        className='bg-white p-8 rounded-[20px] shadow-lg w-full max-w'
                                    >
                                        <h2 className="text-xl font-bold text-[#00ADEF] mb-3 pb-3">{mode === 'execute' ? 'Metering Process Execution' : mode === 'template' && 'Import Allocation Review File'}</h2>
                                        {mode == 'execute' ?
                                            <div className="form-mode">
                                                <div className="grid grid-cols-2 gap-x-[20px] gap-y-2">
                                                    <div className="pb-2">
                                                        <label className={labelClass}><span className="text-red-500">*</span>{`Start Date`}</label>
                                                        <DatePickaForm
                                                            {...register('start_date', { required: "Select start date" })}
                                                            placeHolder="Select Start Date"
                                                            mode={'create'}
                                                            valueShow={watch("start_date") ? toDayjs(watch("start_date")).format("DD/MM/YYYY") : undefined}
                                                            // min={formattedStartDate || undefined}
                                                            // min={formattedStartDate ? formattedStartDate : new Date() || undefined}
                                                            min={new Date()}
                                                            maxNormalForm={watch('end_date') && watch('end_date')} // ไม่ให้ start_date เกิน end_date
                                                            allowClear
                                                            isError={errors.start_date && !watch("start_date") ? true : false}
                                                            onChange={(e: any) => { setValue('start_date', formatFormDate(e)), e == undefined && setValue('start_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                                            forMode='form'
                                                        />
                                                        {errors.start_date && !watch("start_date") && <p className={`${textErrorClass}`}>{'Select Start Date'}</p>}
                                                    </div>

                                                    <div className="pb-2">
                                                        <label className={labelClass}><span className="text-red-500">*</span>{`End Date`}</label>
                                                        <DatePickaForm
                                                            {...register('end_date', { required: "Select end date" })}
                                                            readOnly={!formattedStartDate ? true : false}
                                                            placeHolder="Select End Date"
                                                            mode={'create'}
                                                            min={formattedStartDate || undefined}
                                                            // min={getMinDate(formattedStartDate)}
                                                            valueShow={watch("end_date") ? toDayjs(watch("end_date")).format("DD/MM/YYYY") : undefined}
                                                            allowClear
                                                            isError={errors?.end_date && !watch("end_date") ? true : false}
                                                            onChange={(e: any) => { setValue('end_date', formatFormDate(e)), e == undefined && setValue('end_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                                            forMode='form'
                                                        />
                                                        {errors.end_date && !watch("end_date") && <p className={`${textErrorClass}`}>{'Select end date'}</p>}
                                                    </div>
                                                </div>
                                                <div className="flex justify-end pt-8 gap-[40px]">
                                                    <div className="font-light bg-slate-100 text-black flex items-center cursor-pointer" onClick={handleClose}>{`Cancel`}</div>
                                                    <button type="submit" className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
                                                        {`Execute`}
                                                    </button>
                                                </div>
                                            </div>
                                            : mode == 'template' &&
                                            <>
                                                <label
                                                    htmlFor="url"
                                                    className={labelClass}
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {`File`}
                                                </label>

                                                {/* <div className="flex items-center col-span-2"> */}
                                                <div className={`flex items-center col-span-2 -mt-2 rounded-[6px] ${errors.upload_tranform ? 'border  border-[#ff0000]' : ''}`}>

                                                    {/* "Choose File" button */}
                                                    <label className={`flex bg-[#00ADEF] text-white items-center justify-center font-light rounded-l-[6px] text-[16px] text-justify w-[40%] !h-[44px] px-2 cursor-pointer`}>
                                                        {`Choose File`}
                                                        <input
                                                            id="url"
                                                            type="file"
                                                            className="hidden"
                                                            {...register('upload_tranform')}
                                                            accept=".xls, .xlsx"
                                                            onChange={handleFileChange}
                                                        />
                                                    </label>

                                                    <div className="bg-white text-[#9CA3AF] text-sm w-[70%] !h-[44px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden flex items-center">
                                                        {/* <span className="truncate">{fileName}</span> */}
                                                        <span className={`truncate ${fileName == 'Maximum File 10 MB' ? 'text-[#9CA3AF]' : 'text-[#464255]'} `}>{fileName}</span>

                                                        {fileName !== "Maximum File 10 MB" && (
                                                            <CloseOutlinedIcon
                                                                onClick={handleRemoveFile}
                                                                className="cursor-pointer ml-2 text-[#9CA3AF] z-10"
                                                                sx={{ color: '#323232', fontSize: 18 }}
                                                                style={{ fontSize: 18 }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-[12px] text-[#1473A1] mt-1">{requireText}</div>
                                                <div className={`text-[14px] text-red-500 col-span-2 -mt-1 flex justify-start w-full ${!errors.upload_tranform ? 'hidden' : 'block'}`}>
                                                    <span>{errors?.upload_tranform && String(errors?.upload_tranform?.message)}</span>
                                                </div>

                                                <div className="flex justify-between items-center pt-8">
                                                    {/* Left Side - Template Button */}
                                                    <button
                                                        type="button"
                                                        disabled={false}
                                                        onClick={() => checkIsShipper('download')}
                                                        className="w-[167px] h-[46px] font-normal text-white py-2 rounded-lg focus:outline-none text-[16px] bg-[#36B1AB] hover:bg-[#29938e] flex items-center justify-center"
                                                    >
                                                        {`Template`}
                                                        <DownloadRoundedIcon sx={{ color: '#ffffff', fontSize: '20px', marginLeft: '8px' }} />
                                                    </button>

                                                    {/* Right Side - Cancel & Upload Buttons */}
                                                    <div className="flex items-center gap-4">
                                                        <div className="font-light bg-slate-100 text-black flex items-center cursor-pointer px-4 py-2 rounded-lg" onClick={handleClose}>
                                                            {`Cancel`}
                                                        </div>
                                                        <label
                                                            onClick={() => handleClickUpload()}
                                                            className={`${fileName === "Maximum File 10 MB" ? 'bg-[#9CA3AF] text-[#FFFFFF] pointer-events-none' : 'hover:bg-[#28805a]'} w-[167px] h-[46px] font-bold bg-[#17AC6B] text-white py-2 px-5 rounded-lg cursor-pointer focus:outline-none flex items-center justify-center text-[16px]`}
                                                        >
                                                            {`Upload`}
                                                            <input
                                                                type="button"
                                                                className="hidden"
                                                                disabled={true}
                                                                onClick={() => handleClickUpload()}
                                                            />
                                                        </label>
                                                    </div>
                                                </div>

                                                <ModalSelShipperContract
                                                    mode={'download'}
                                                    open={openSelShipper}
                                                    isLoading={isLoading}
                                                    userDT={userDT}
                                                    shipperGroupData={Array.isArray(shipperGroupData) ? shipperGroupData : shipperGroupData?.data}
                                                    dataContractOriginal={dataContractOriginal}
                                                    setIdShipper={setIdShipper}
                                                    onClose={() => {
                                                        setOpenSelShipper(false);
                                                    }}
                                                    onSubmit={(e: any) => {
                                                        handleClickDownload(e)

                                                        // setIsLoadingModal(false);
                                                    }}
                                                />
                                            </>
                                        }
                                    </form>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>

            <ConfirmModal
                open={modalWarningOpen}
                handleClose={() => {
                    setModalWarningOpen(false)
                    handleRemoveFile()
                }}
                handleConfirm={() => {
                    handleClickUpload(true)
                    setModalWarningOpen(false)
                    setModalWarningMsg('')
                }}
                stat='confirm'
                title="Warning"
                btnText='Confirm'
                description={modalWarningMsg}
            />
        </>
    )
}

export default ModalImport;