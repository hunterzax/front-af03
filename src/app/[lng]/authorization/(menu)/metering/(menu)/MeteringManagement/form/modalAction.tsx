import { SubmitHandler, useForm } from "react-hook-form";
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import Spinloading from "@/components/other/spinLoading";
import { useState } from "react";
import DatePickaForm from "@/components/library/dateRang/dateSelectForm";
import dayjs from "dayjs";
import { formatFormDate, formatWatchFormDate } from "@/utils/generalFormatter";
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { downloadService, uploadFileServiceWithAuth } from "@/utils/postService";
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';


type FormData = {
    id_name: string;
    name: string;
    user_type_id: string;
    telephone: string;
    email: string;
    start_date: Date | null;
    end_date: Date | null;
    status: string;
    role_default: any;
    division: any;
};

type FormExampleProps = {
    mode?: 'execute' | 'template' | 'view';
    // dataForm?: Partial<FormData>;
    open: boolean;
    setformActionOpen?: any;
    setModalErrorMsg?: any;
    setModalErrorOpen?: any;
    setModalSuccessOpen?: any;
    setModalSuccessMsg?: any;
    onClose: () => void;
    onSubmit: SubmitHandler<any>;
    setResetForm: (reset: () => void) => void;
};

const labelClass = "block mb-2 text-[14px] font-light";
const textErrorClass = "text-red-500 text-[14px]";

const ModalAction: React.FC<FormExampleProps> = ({
    mode,
    // dataForm = {},
    open,
    setformActionOpen,
    setModalErrorMsg,
    setModalErrorOpen,
    setModalSuccessOpen,
    setModalSuccessMsg,
    onClose,
    onSubmit,
    setResetForm,
}) => {

    const { register, handleSubmit, setValue, getValues, reset, formState: { errors }, watch } = useForm<any>();

    //state
    const [isLoading, setIsLoading] = useState<boolean>(false);

    //const-functions
    const startDate = watch('start_date');
    const formattedStartDate = formatWatchFormDate(startDate);

    const handleClose = () => {
        setFileUpload(undefined);
        setFileName("Maximum File 10 MB");
        setValue('upload_tranform', null);

        onClose();
        setTimeout(() => {
            reset();
        }, 200);
    };

    // ############# UPLOAD FILE #############
    const [fileName, setFileName] = useState('Maximum File 10 MB');
    const [fileUpload, setFileUpload] = useState<any>();
    const [requireText, setRequireText] = useState('Required : .xls, .xlsx');

    const handleFileChange = async (e: any) => {
        setIsLoading(true);
        const file = e.target.files[0];
        if (file) {
            const validFileTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
            const maxSizeInMB = 10; // Maximum file size in MB
            const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

            if (!validFileTypes.includes(file.type)) {
                setFileName('Invalid file type. Please upload a Excel file.');
                // Invalid file type:'
                setIsLoading(false);
                return;
            }

            if (file.size > maxSizeInBytes) {
                setFileName('The file is larger than 10 MB.');
                // File size too large:
                setIsLoading(false);
                return;
            }

            setFileName(file.name);
            setFileUpload(file);
            // setModalMsg("Your file has been uploaded")

        } else {
            setFileName('No file chosen');
        }

        setTimeout(() => {
            setIsLoading(false);
        }, 300);
    };


    const handleClickDownload = async () => {
        const res: any = await downloadService(`/master/metering-management/download-template?gasDay=${dayjs().format('YYYY-MM-DD')}`, undefined, `Metering_Execute_Template_${dayjs().format('YYYYMMDD')}`);

        if (res?.status === 400) {

            setModalErrorMsg(res?.error);
            setModalErrorOpen(true)
        } else {
            // setModalSuccessOpen(true);
        }
    };

    const handleClickUpload = async () => {

        setIsLoading(true);


        if (fileUpload) {
            try {


                let res_upload: any
                // res_upload = await uploadFileServiceWithAuth('/master/planning-submission-file/upload', fileUpload, idShipper, 'shipper_id')
                res_upload = await uploadFileServiceWithAuth('/master/metering-management/upload', fileUpload, null)

                if (res_upload?.response?.data?.status === 400 || res_upload?.response?.status === 500) {
                    setModalErrorMsg(res_upload?.response?.data?.error ? res_upload?.response?.data?.error : "Something went wrong");
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
                    setModalSuccessMsg('Your file has been uploaded.')
                    setformActionOpen(false)
                    setModalSuccessOpen(true);
                }
            } catch (error) {
                // File upload failed:
            }
        } else {
            setFileName('No file chosen');
        }
        setIsLoading(false);
    };

    const handleRemoveFile = () => {
        setFileName("Maximum File 10 MB"); // Reset fileName
        setFileUpload(undefined);
        setValue('upload_tranform', null);
        // setFileUrl('')
    };


    return (
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
                                            setIsLoading(false);
                                        }, 100);
                                    })}
                                    className='bg-white p-8 rounded-[20px] shadow-lg w-full max-w'
                                >
                                    <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-5">{mode === 'execute' ? 'Metering Process Execution' : mode === 'template' && 'Metering Process Execution From File'}</h2>
                                    {mode == 'execute' ?
                                        <div className="form-mode">
                                            <div className="grid grid-cols-2 gap-x-[20px] gap-y-2">
                                                <div className="pb-2">
                                                    <label className={labelClass}><span className="text-red-500">*</span>{`Start Date`}</label>
                                                    <DatePickaForm
                                                        {...register('start_date', { required: "Select start date" })}
                                                        placeHolder="Select Start Date"
                                                        mode={'create'}
                                                        valueShow={watch("start_date") ? dayjs(watch("start_date")).format("DD/MM/YYYY") : undefined}
                                                        // min={formattedStartDate || undefined}
                                                        // min={formattedStartDate ? formattedStartDate : new Date() || undefined}
                                                        // min={new Date()}
                                                        // maxNormalForm={watch('end_date') && watch('end_date')} // ไม่ให้ start_date เกิน end_date
                                                        maxNormalForm={watch("end_date") ? dayjs(watch("end_date")).add(1, 'day').format('YYYY-MM-DD') : dayjs().add(1, 'day').format('YYYY-MM-DD')}
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
                                                        // min={formattedStartDate || undefined}
                                                        min={formattedStartDate ? dayjs(formattedStartDate).subtract(1, 'day').format('YYYY-MM-DD') : undefined}
                                                        maxNormalForm={dayjs().add(1, 'day').format('YYYY-MM-DD')}
                                                        valueShow={watch("end_date") ? dayjs(watch("end_date")).format("DD/MM/YYYY") : undefined}
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

                                            <div className={`flex items-center col-span-2 ${fileName == "Invalid file type. Please upload a Excel file." || fileName == 'The file is larger than 10 MB.' ? 'border  border-[#ff0000] rounded-r-lg rounded-l-lg' : ''}`}>

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
                                                    <span className="truncate">
                                                        {fileName}
                                                    </span>
                                                    {fileName !== "Maximum File 10 MB" && (
                                                        <CloseOutlinedIcon
                                                            onClick={handleRemoveFile}
                                                            className="cursor-pointer ml-2 text-[#9CA3AF] z-10"
                                                            sx={{ color: '#323232', fontSize: 18 }}
                                                            style={{ fontSize: 18 }}
                                                        />
                                                    )}
                                                </div>

                                                {/* <label
                                                    // onClick={handleClickUpload} 
                                                    onClick={() => handleClickUpload()}
                                                    className={`${fileName === "Maximum File 10 MB" ? 'bg-[#9CA3AF] !text-[#FFFFFF] pointer-events-none' : 'hover:bg-[#28805a]'} w-[167px] ml-4 !h-[40px] font-bold bg-[#17AC6B] text-white py-2 px-5 rounded-lg cursor-pointer  focus:outline-none  flex items-center justify-center text-[16px] `}
                                                >
                                                    {`Upload`}
                                                    <input
                                                        type="button"
                                                        className="hidden"
                                                        // accept=".xls, .xlsx"
                                                        // readOnly={isReadOnly}
                                                        disabled={true}
                                                        // onClick={handleClickUpload}
                                                        onClick={() => handleClickUpload()}
                                                    />
                                                    <FileUploadRoundedIcon sx={{ color: '#ffffff', fontSize: '20px', marginLeft: "8px" }} />
                                                </label> */}
                                            </div>
                                            <div className="text-[12px] text-[#1473A1] mt-1">
                                                {requireText}
                                            </div>

                                            <div className={`w-full flex items-center justify-between text-[14px] text-red-500 -mt-1 `}>
                                                {fileName == 'The file is larger than 10 MB.' && fileName}
                                                {fileName == 'Invalid file type. Please upload a Excel file.' && fileName}
                                            </div>


                                            <div className="flex justify-between items-center pt-8">
                                                {/* Left Side - Template Button */}
                                                <button
                                                    type="button"
                                                    disabled={false}
                                                    onClick={() => handleClickDownload()}
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
                                                        // className={`${fileName === "Maximum File 10 MB" ? 'bg-[#9CA3AF] text-[#FFFFFF] pointer-events-none' : 'hover:bg-[#28805a]'} w-[167px] h-[46px] font-bold bg-[#17AC6B] text-white py-2 px-5 rounded-lg cursor-pointer focus:outline-none flex items-center justify-center text-[16px]`}
                                                        className={`${(fileName === "Maximum File 10 MB" || fileName === "The file is larger than 10 MB." || fileName === "Invalid file type. Please upload a Excel file.") ? 'bg-[#9CA3AF] text-[#FFFFFF] pointer-events-none' : 'hover:bg-[#28805a]'} w-[167px] h-[46px] font-bold bg-[#17AC6B] text-white py-2 px-5 rounded-lg cursor-pointer focus:outline-none flex items-center justify-center text-[16px]`}
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


                                        </>
                                    }
                                </form>
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}

export default ModalAction;