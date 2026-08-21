import React, { useEffect, useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react'
import { uploadFileServiceWithAuth } from '@/utils/postService';
import Spinloading from '@/components/other/spinLoading';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { useForm } from 'react-hook-form';
import ModalConfirmSave from '@/components/other/modalConfirmSave';

type FormExampleProps = {
    data?: any;
    setModalSuccessOpen?: any;
    setModalSuccessMsg?: any;
    setModalErrorOpen?: any;
    setModalErrorMsg?: any;
    setMdAmendOpen?: any;
    isAmendMode?: any;
    open: boolean;
    onClose: () => void;
};

const ModalImport: React.FC<FormExampleProps> = ({
    open,
    onClose,
    data,
    setModalSuccessOpen,
    setModalSuccessMsg,
    setModalErrorOpen,
    setModalErrorMsg,
    setMdAmendOpen,
    isAmendMode
}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [fileName, setFileName] = useState('Maximum File 10 MB');
    const [fileUpload, setFileUpload] = useState<any>();
    const [modalConfirmImport, setModalConfirmImport] = useState<any>(false)
    const { register, setValue, reset, setError, formState: { errors }, watch, clearErrors } = useForm<any>();

    const handleFileChange = async (e: any) => {
        const file = e.target.files[0];
        const setvalError = (text: any) => {
            setFileName('Maximum File 10 MB')
            setError('upload_file', { type: "custom", message: text });
            setValue('upload_file', null);
            setFileUpload(null);
        }

        if (file) {
            const validFileTypes = ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
            const maxSizeInMB = 10; // Maximum file size in MB
            const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

            if (!validFileTypes.includes(file.type)) {
                setvalError('Invalid file type. Please upload an Excel file.')
                return;
            }

            if (file.size > maxSizeInBytes) {
                setvalError('The file is larger than 10 MB.')
                return;
            }

            setFileName(file.name);
            setFileUpload(file);
            setMdAmendOpen(false);
            if (errors?.upload_file) {
                clearErrors('upload_file');
            }
        }
    };

    const handleClickUpload = async () => {
        setModalConfirmImport(true);
        // ย้าย upload ไปอยู่ที่ handleUploadSubmit
    };

    const handleUploadSubmit = async () => {
        setIsLoading(true)

        if (fileUpload) {
            try {
                // case import หรือ amend

                // on = amend / off = import ปกติ
                // let amd = isAmend ? 'on' : 'off'
                // terminateDate ถ้าไม่ amend ส่ง null
                // const response:any = await importTemplateService(`/master/capacity/path-capacity-request-management/import-template/${data?.id}`, fileUpload, null, 'off'); // ของเดิม ปิดไว้ก่อน 2025-02-13 ล่อลวงพราง
                const response: any = await uploadFileServiceWithAuth('/master/capacity/path-capacity-request-management/upload-tranform', fileUpload)
                // setValue("url", response?.file?.url);

                const status = response?.response?.status ?? response?.status ?? response?.response?.data?.status;
                const code = response?.code;
                if (status === 400) {
                    setModalErrorMsg(response?.response?.data?.error);
                    setModalErrorOpen(true)
                } else if (response?.status === 504) {
                    // 504 Gateway Timeout หรือ client timeout
                    setModalErrorMsg('This is taking longer than expected. The process is still in progress.');
                    setModalErrorOpen(true);
                } else if (status === 500 || code === "ERR_BAD_RESPONSE" || code === "ERR_NETWORK") {
                    setModalErrorMsg('Invalid template format. Please use the correct system-generated template.');
                    setModalErrorOpen(true)
                } else {
                    if (response?.response?.type) {
                        setModalSuccessMsg(response?.response?.type == 1 ? 'File has been uploaded.' : 'Invalid template format. Please use the correct system-generated template.')
                    } else {
                        setModalSuccessMsg('File has been uploaded.')
                    }
                    setModalSuccessOpen(true);
                }

                // [Pims Env 107] Import ระบบไม่เคลียร์ File Name ที่เคยเอาเข้าก่อนหน้าให้ https://app.clickup.com/t/86euyguxj
                setFileUpload(null)
                setFileName("Maximum File 10 MB")
                setIsLoading(false)

                onClose();

            } catch (error) {
                // File upload failed:
            }
        }
    }

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            handleRemoveFile(); //reset
        }, 300);
    };

    const handleRemoveFile = () => {
        setFileName("Maximum File 10 MB"); // Reset fileName
        setFileUpload(null);
        setValue('upload_file', null);
        clearErrors('upload_file')
    };

    const getNextContractCode = (code: string) => {
        // data?.contract_code = "2022-CLF-018"
        // data?.contract_code = "2022-CLF-018_Amd004"
        // data?.contract_code อยากให้เช็คว่า มันมี _Amdxxx หรือเปล่า
        // ถ้ามี เปลี่ยนเลขเป็น + 1
        // ถ้าไม่มี เติม _AmdXXX(xxx คือเลข สามหลัก 001, 002)

        const match = code.match(/_Amd(\d{3})$/);

        if (match) {
            const next = String(Number(match[1]) + 1).padStart(3, "0");
            return code.replace(/_Amd\d{3}$/, `_Amd${next}`);
        }

        return `${code}_Amd001`;
    }

    return (<>
        <Dialog open={open} onClose={handleClose} className="relative z-20">
            {/* <div className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity" /> */}
            <div className={["fixed inset-0 bg-black/45", "transition-opacity duration-100 ease-out", open ? "opacity-100" : "opacity-0 pointer-events-none"].join(" ")} />
            <div className="fixed inset-0 z-10 flex items-center justify-center">
                <DialogPanel
                    transition
                    className="flex w-auto transform transition-all bg-white inset-0 rounded-[20px] text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                >
                    <Spinloading spin={isLoading} rounded={20} />
                    <form className='rounded-[20px] shadow-lg w-full max-w'>
                        <div className="flex flex-col items-center gap-2 p-9 w-[650px]">
                            <div className="w-full">
                                <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`Import`}</h2>
                            </div>

                            <label
                                htmlFor="url"
                                className="w-full flex text-left justify-start text-[#58585A] text-[16px]"
                            >
                                <span className="text-red-500">*</span>{`File`}
                            </label>

                            <div className={`flex w-full rounded-lg ${errors.upload_file && 'border border-red-500'}`}>
                                {/* "Choose File" button */}
                                <label className={`bg-[#00ADEF] text-white flex items-center justify-center font-light rounded-l-[6px] text-sm text-justify w-[30%] !h-[40px] px-5 py-2 cursor-pointer `}> {/* ${isReadOnly && "!bg-[#B6B6B6] !text-[#828282]"} */}
                                    {`Choose File`}
                                    <input
                                        id="url"
                                        type="file"
                                        className="hidden"
                                        accept=".xls, .xlsx"
                                        {...register('upload_file')}
                                        // readOnly={isReadOnly}
                                        // disabled={isReadOnly}
                                        onChange={handleFileChange}
                                    />
                                </label>

                                <div className={`bg-white text-[#9CA3AF] text-sm w-[70%] !h-[40px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden `}>  {/* ${isReadOnly && '!bg-[#EFECEC]'} */}
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
                            <span className='w-full flex text-left justify-start text-[#1473A1] text-[14px]'>Required :  .xls, .xlsx</span>
                            <div className={`text-[14px] text-red-500 col-span-2 -mt-1 flex justify-start w-full ${!errors.upload_file ? 'hidden' : 'block'}`}>
                                <span>{errors?.upload_file && String(errors?.upload_file?.message)}</span>
                            </div>

                            <div className="flex justify-end w-full gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500"
                                >
                                    {`Cancel`}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleClickUpload}
                                    disabled={!fileUpload}
                                    //     className={` w-[167px] font-semibold py-2 rounded-lg focus:outline-none
                                    //     ${fileUpload
                                    //             ? "bg-[#17AC6B] text-white hover:bg-blue-600 focus:bg-blue-600 cursor-pointer"
                                    //             : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    //         }
                                    // `}
                                    className={`${(fileName === "Maximum File 10 MB" || fileName === "The file is larger than 10 MB." || fileName === "Invalid file type. Please upload a Excel file.") ? 'bg-[#9CA3AF] text-[#FFFFFF] pointer-events-none' : 'hover:bg-[#28805a]'} w-[167px] h-[46px] font-bold bg-[#17AC6B] text-white py-2 px-5 rounded-lg cursor-pointer focus:outline-none flex items-center justify-center text-[16px]`}
                                >
                                    {'Upload'}
                                </button>
                            </div>
                        </div>
                    </form>
                </DialogPanel>
            </div>
        </Dialog>

        {/* Confirm Save Import */}
        <ModalConfirmSave
            open={modalConfirmImport}
            handleClose={(e: any) => {
                setModalConfirmImport(false);
                if (e == "submit") {
                    setTimeout(async () => {
                        handleUploadSubmit();
                    }, 100);
                }
            }}
            title="Confirm Approve"
            description={
                <div>
                    <div className="text-center">
                        {`If you approve, the system will generate.`}
                    </div>

                    {
                        isAmendMode && <div className="text-center">
                            {`a new contract code : `} <span className='font-bold'> {getNextContractCode(data?.contract_code ?? "")} </span>
                        </div>
                    }
                </div>
            }
            menuMode="confirm-save"
            btnmode="split"
            // btntxt="Save"
            btnsplit1="Save"
            btnsplit2="Cancel"
            stat="none"
        />

    </>

    );
};

export default ModalImport;