import React, { useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react'
import { cutUploadFileName, formatDate } from '@/utils/generalFormatter';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import { uploadFileServiceWithAuth } from '@/utils/postService';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { useForm } from 'react-hook-form';
import Spinloading from '@/components/other/spinLoading';

type FormExampleProps = {
    data: any;
    dataMain: any;
    open: boolean;
    onClose: () => void;
    modeShowDiv?: any;
    setModalMsg?: any;
    setModalSuccessOpen?: any;
    setModalSuccessMsg?: any;
    setIsUploaded?: any;
};

const ModalFiles: React.FC<FormExampleProps> = ({
    open,
    onClose,
    data,
    dataMain,
    modeShowDiv,
    setModalMsg,
    setModalSuccessOpen,
    setModalSuccessMsg,
    setIsUploaded
}) => {
    const { register, handleSubmit, setValue, getValues, reset, formState: { errors }, watch } = useForm<any>();
    // clear state when closes
    const handleClose = () => {
        onClose();
        setFileName('Maximum File 10 MB')
    };

    const [isLoading, setIsLoading] = useState<boolean>(false);
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

    const handleClickUpload = async () => {
        setIsLoading(true);

        if (fileUpload) {
            try {

                let res_upload: any
                res_upload = await uploadFileServiceWithAuth('/master/balancing/instructed-operation-flow-shippers-upload', fileUpload, data?.id, 'id')

                if (res_upload?.response?.data?.status === 400 || res_upload?.response?.status === 500) {
                    // error upload
                    // setModalErrorMsg(res_upload?.response?.data?.error ? res_upload?.response?.data?.error : "Something went wrong");
                    // setModalErrorOpen(true);
                } else {
                    setIsUploaded(true)
                    onClose()
                    setIsLoading(false);
                    setFileName('Maximum File 10 MB')

                    // setModalSuccessMsg('File has been uploaded.')
                    // setModalSuccessOpen(true);
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
            {/* <div className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity" /> */}
            <div className={["fixed inset-0 bg-black/45", "transition-opacity duration-100 ease-out", open ? "opacity-100" : "opacity-0 pointer-events-none"].join(" ")} />
            <div className="fixed inset-0 z-10 flex items-center justify-center">

                <DialogPanel
                    transition
                    className="flex w-auto transform transition-all bg-white inset-0 rounded-[20px] text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                >
                    <Spinloading spin={isLoading} rounded={20} />

                    <div className="flex flex-col items-center gap-2 p-9 w-[800px]">
                        <div className="w-full">
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`All Files`}</h2>

                            <div className="mb-4 w-[100%]">
                                <div className="grid grid-cols-5 w-full text-sm font-semibold text-[#58585A] pb-2">
                                    <p>{`Timestamp`}</p>
                                    <p>{`Shipper Name`}</p>
                                    <p>{`Zone`}</p>
                                </div>

                                <div className="grid grid-cols-5 text-sm font-light text-[#58585A]">
                                    <p>{data?.timestamp || ''}</p>
                                    <p>{data?.shipperName || ''}</p>
                                    <p>{data?.zone || ''}</p>
                                </div>
                            </div>
                        </div>

                        <div className="w-full flex ">
                            <label
                                htmlFor="url"
                                className={'block mb-2 text-[14px] font-light'}
                            >
                                <span className="text-red-500">*</span>
                                {`File`}
                            </label>
                        </div>

                        <div className={`w-full flex items-center justify-between gap-4 `}>
                            <div className={`flex items-center flex-grow gap-0 ${fileName == "Invalid file type. Please upload a Excel file." || fileName == 'The file is larger than 10 MB.' ? 'border  border-[#ff0000] rounded-r-lg rounded-l-lg' : ''}`}>
                                <label className="flex bg-[#00ADEF] text-white items-center justify-center font-light rounded-l-[6px] text-[16px] w-[160px] h-[44px] px-2 cursor-pointer">
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

                                {/* File Name Display */}
                                <div className="bg-white text-[#9CA3AF] max-w-[395px] text-sm h-[44px] px-2 py-2 rounded-r-[6px] border border-l-0 border-gray-300 truncate overflow-hidden flex items-center flex-grow min-w-0">
                                    <span className={`truncate `}>{fileName}</span>
                                    {fileName !== "Maximum File 10 MB" && (
                                        <CloseOutlinedIcon
                                            onClick={handleRemoveFile}
                                            className="cursor-pointer ml-2 text-[#9CA3AF]"
                                            sx={{ color: '#323232', fontSize: 18 }}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Upload Button */}
                            <label
                                onClick={handleClickUpload}
                                className={`${(fileName === "Maximum File 10 MB" || fileName === "The file is larger than 10 MB." || fileName === "Invalid file type. Please upload a Excel file.")
                                    ? 'bg-[#9CA3AF] text-white pointer-events-none'
                                    : 'hover:bg-[#28805a]'
                                    } w-[167px] h-[44px] font-bold bg-[#17AC6B] text-white py-2 px-5 rounded-lg cursor-pointer flex items-center justify-center text-[16px]`}
                            >
                                Upload
                                <input type="button" className="hidden" disabled />
                            </label>
                        </div>

                        <div className="w-full flex items-center justify-between gap-4 text-[12px] text-[#1473A1] mt-1">
                            {requireText}
                        </div>

                        <div className={`w-full flex items-center justify-between text-[14px] text-red-500 -mt-1 ${fileName == 'Maximum File 10 MB' ? 'hidden' : 'block'}`}>
                            {fileName == 'Invalid file type. Please upload a Excel file' || fileName == 'The file is larger than 10 MB.' && fileName}
                        </div>

                        <div
                            className={`mb-4 w-[100%] ${data?.file?.length > 3 ? 'max-h-[350px] overflow-y-auto' : ''}`}
                        >
                            {data?.file?.map((item: any) => (
                                <div key={item.id} className="w-full h-auto mb-2 p-2 border rounded-lg">
                                    <div className="flex flex-col p-2">

                                        <div className="mb-2 flex justify-between items-center">
                                            <div className="flex items-baseline gap-2">
                                                <span className='font-light'>By <span className="font-bold !text-[#58585A]">{item?.create_by_account && item?.create_by_account?.first_name + ' ' + item?.create_by_account?.last_name}</span></span>
                                            </div>
                                            <span className="text-gray-500">{item?.create_date ? formatDate(item?.create_date) : ''}</span>
                                            {/* <span className="text-gray-500">{formatDate(item?.create_date)}</span> */}
                                        </div>

                                        <div className="flex justify-between items-center w-full h-[50px] border rounded-lg mb-2 p-4">
                                            <p className="flex items-center">
                                                <InsertDriveFileOutlinedIcon sx={{ fontSize: '20px' }} />
                                                {" "}
                                                {item?.url ? cutUploadFileName(item?.url) : 'no data'}
                                            </p>

                                            <span className="flex items-center">
                                                {
                                                    item?.url ?
                                                        <a
                                                            href={item?.url ? item?.url : ''}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            download
                                                            className="flex items-center text-[#323232] hover:text-blue-600"
                                                        >
                                                            <FileDownloadRoundedIcon />
                                                        </a>
                                                        : null
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="w-full flex justify-end pt-8">
                            <button
                                onClick={handleClose}
                                className="w-[167px] font-bold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
                                {'Close'}
                            </button>
                        </div>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>

    );
};

export default ModalFiles;