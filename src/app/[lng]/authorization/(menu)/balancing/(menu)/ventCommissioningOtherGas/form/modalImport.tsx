import { SubmitHandler, useForm } from "react-hook-form";
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import Spinloading from "@/components/other/spinLoading";
import { useState } from "react";
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { downloadService, uploadFileServiceWithAuth } from "@/utils/postService";
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
// import ModalSelShipperContract from "./modalSelShipper";

type FormExampleProps = {
    mode?: 'execute' | 'template' | 'view';
    // dataForm?: Partial<FormData>;
    open: boolean;
    setformActionOpen?: any;
    setModalErrorMsg?: any;
    setModalErrorOpen?: any;
    setModalSuccessOpen?: any;
    setModalSuccessMsg?: any;
    // shipperGroupData?: any;
    // dataContractOriginal?: any;
    userDT?: any;
    onClose: () => void;
    onSubmit: SubmitHandler<any>;
    setResetForm: (reset: () => void) => void;
};

const labelClass = "block mb-2 text-[14px] font-light";

const ModalImport: React.FC<FormExampleProps> = ({
    mode,
    // dataForm = {},
    open,
    setformActionOpen,
    setModalErrorMsg,
    setModalErrorOpen,
    setModalSuccessOpen,
    setModalSuccessMsg,
    // shipperGroupData,
    // dataContractOriginal,
    userDT,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const { register, handleSubmit, setValue, getValues, reset, formState: { errors }, watch } = useForm<any>();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleClose = () => {
        onClose();
        setFileUpload(undefined);
        setFileName('Maximum File 10 MB')
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
        setIsLoading(true);
        const file = e.target.files[0];
        if (file) {
            const validFileTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
            const maxSizeInMB = 10; // Maximum file size in MB
            const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

            if (!validFileTypes.includes(file.type)) {
                setFileName('Invalid file type. Please upload a Excel file.');
                setTimeout(() => {
                    setIsLoading(false);
                    setiserror(true);
                }, 300);
                // Invalid file type:'
                return;
            }

            if (file.size > maxSizeInBytes) {
                setFileName('The file is larger than 10 MB.');
                setTimeout(() => {
                    setIsLoading(false);
                    setiserror(true);
                }, 300);

                // File size too large:
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
        // ส่ง shipper_id ที่เป็น string
        // กับ contract_code

        // const res: any = await downloadService(`/master/metering-management/download-template?gasDay=${dayjs().format('YYYY-MM-DD')}`);
        const res: any = await downloadService(`/master/balancing/vent-commissioning-other-gas/template`, 'bal-vent-commissioning');
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
                res_upload = await uploadFileServiceWithAuth('/master/balancing/vent-commissioning-other-gas/import', fileUpload, null)

                if (res_upload?.response?.data?.status === 400 || res_upload?.response?.status === 500 || res_upload?.status === 400) {
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
                    setModalSuccessMsg('File has been uploaded.')
                    setformActionOpen(false)
                    setModalSuccessOpen(true);

                    onSubmit({});
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
                                        <h2 className="text-xl font-bold text-[#00ADEF] mb-3 pb-3">{mode === 'execute' ? 'Metering Process Execution' : mode === 'template' && 'Import'}</h2>
                                        {mode == 'template' &&
                                            <>
                                                <label
                                                    htmlFor="url"
                                                    className={labelClass}
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {`File`}
                                                </label>

                                                <div className={`flex items-center rounded-[7px] col-span-2 ${fileName == "Invalid file type. Please upload a Excel file." || fileName == "The file is larger than 10 MB." ? 'border  border-[#ff0000]' : ''}`}>

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
                                                </div>
                                                <div className="text-[12px] text-[#1473A1] mt-1">
                                                    {requireText}
                                                </div>
                                                <div className={`text-[14px] text-red-500 col-span-2 -mt-1 ${!iserror ? 'hidden' : 'block'}`}>
                                                    {(fileName == "Invalid file type. Please upload a Excel file." || fileName == "The file is larger than 10 MB.") ? fileName : ''}
                                                </div>

                                                <div className="flex justify-between items-center pt-8">
                                                    {/* Left Side - Template Button */}
                                                    <button
                                                        type="button"
                                                        disabled={false}
                                                        onClick={() => handleClickDownload()}
                                                        // onClick={() => setOpenSelShipper(true)}
                                                        // onClick={() => checkIsShipper('download')}
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

                                                {/* <ModalSelShipperContract
                                                    mode={'download'}
                                                    // data={formData}
                                                    open={openSelShipper}
                                                    // dataTable={dataTable}
                                                    shipperGroupData={shipperGroupData?.data}
                                                    dataContractOriginal={dataContractOriginal}
                                                    setIdShipper={setIdShipper}
                                                    // handleClickUpload={handleClickUpload}
                                                    // handleButtonDownload={handleButtonDownload}
                                                    onClose={() => {
                                                        setOpenSelShipper(false);
                                                        // setIsLoadingModal(false);
                                                    }}
                                                    // onSubmit={handleFormSubmit}
                                                    onSubmit={() => {
                                                        setOpenSelShipper(false);
                                                        // setIsLoadingModal(false);

                                                        handleClickDownload()
                                                    }}
                                                    // isLoading={isLoadingModal}
                                                    // setisLoading={setIsLoadingModal}
                                                /> */}

                                            </>
                                        }
                                    </form>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </>
    )
}

export default ModalImport;