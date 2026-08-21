import React, { useEffect, useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react'
import { cutUploadFileName, formatDate } from '@/utils/generalFormatter';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import { postService, uploadFileService } from '@/utils/postService';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { useForm } from 'react-hook-form';

type FormExampleProps = {
    data: any;
    open: boolean;
    onClose: () => void;
    modeShowDiv?: any;
    setModalMsg?: any;
    setModalSuccessOpen?: any;
    setModalSuccessMsg?: any;
};

const ModalFiles: React.FC<FormExampleProps> = ({
    open,
    onClose,
    data,
    modeShowDiv,
    setModalMsg,
    setModalSuccessOpen,
    setModalSuccessMsg
}) => {
     
    const { register, setValue, reset, formState: { errors }, watch } = useForm<any>();
    const [fileName, setFileName] = useState('Maximum File 10 MB');
    const [fileUpload, setFileUpload] = useState<any>();

    const handleFileChange = async (e: any) => {
        const file = e.target.files[0];
        if (file) {
            const validFileTypes = ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
            const maxSizeInMB = 10; // Maximum file size in MB
            const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

            if (!validFileTypes.includes(file.type)) {
                setFileName('Invalid file type. Please upload a Excel file.');
                // Invalid file type:'
                return;
            }

            if (file.size > maxSizeInBytes) {
                setFileName('The file is larger than 10 MB.');
                // File size too large:
                return;
            }

            setFileName(file.name);
            setFileUpload(file);
            setModalMsg("Your file has been uploaded")

        } else {
            setFileName('No file chosen');
        }
    };

    const handleClickUpload = async () => {
        if (fileUpload) {
            try {
                 
                const response:any = await uploadFileService('/files/uploadfile/', fileUpload);
                 

                // response?.file?.url
                let data_post = {
                    "url": response?.file?.url,
                    "contract_code_id": data?.id
                }
                const res_file = await postService('/master/capacity/file-capacity-request-management', data_post)

                setModalSuccessMsg("Your file has been uploaded.")
                setModalSuccessOpen(true)
            } catch (error) {
                // File upload failed:
            }
        } else {
            setFileName('No file chosen');
        }
    };

    const handleRemoveFile = () => {
        setFileName("Maximum File 10 MB"); // Reset fileName
        setFileUpload(undefined);
        setValue('upload_tranform', null);
    };

    // clear state when closes
    const handleClose = () => {
        setFileUpload(undefined);
        setFileName("Maximum File 10 MB");
        setValue('upload_tranform', null);
        onClose();
        reset();
    };

    useEffect(() => {
        const fetchAndSetData = async () => {
            setFileUpload(undefined);
            setFileName("Maximum File 10 MB");
            setValue('upload_tranform', null);
        }
        fetchAndSetData();
    }, [data, setValue]);

    return (
        <Dialog open={open} onClose={handleClose} className="relative z-20">
            {/* <div className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity" /> */}
            <div className={["fixed inset-0 bg-black/45", "transition-opacity duration-100 ease-out", open ? "opacity-100" : "opacity-0 pointer-events-none"].join(" ")} />
            <div className="fixed inset-0 z-10 flex items-center justify-center">
                <DialogPanel
                    transition
                    className="flex w-auto transform transition-all bg-white inset-0 rounded-[20px] text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                >
                    <div className="flex flex-col items-center gap-2 p-9 w-[700px]">
                        <div className="w-full">
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`All File`}</h2>
                            <div className="mb-4 w-[80%]">
                                <div className="grid grid-cols-3 text-sm font-semibold text-[#58585A]">
                                    <p>{`Contract Code`}</p>
                                    <p>{`Shipper Name`}</p>
                                    <p>{`Submitted Timestamp`}</p>
                                </div>

                                <div className="grid grid-cols-3 text-sm font-light text-[#58585A]">
                                    <p>{data?.contract_code || '-'}</p>
                                    <p>{data?.group?.name || '-'}</p>
                                    <p>{formatDate(data?.submitted_timestamp) || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* ORIGINAL */}
                        {/* <div className="mb-4 w-[100%]">
                            {data?.file_capacity_request_management?.map((item: any) => (
                                <div key={item.id} className="w-full h-auto mb-2 p-2 border rounded-lg">
                                    <div className="flex flex-col p-2">
                                        <div className="mb-2 flex justify-between">
                                            <span className='font-light'>By <span className="font-bold text-[#58585A]"> {item?.create_by_account?.first_name} {" "} {item?.create_by_account?.last_name}</span></span>
                                            <span className="text-[#9CA3AF] font-light">{formatDate(item?.create_date)}</span>
                                        </div>
                                        <div className="flex justify-between items-center w-full h-[50px] border rounded-lg mb-2 p-4">
                                            <p className="flex items-center">
                                                <InsertDriveFileOutlinedIcon sx={{ fontSize: '20px' }} />
                                                {" "}
                                                {cutUploadFileName(item?.url) || '-'}
                                            </p>
                                            <span className="flex items-center">
                                                <FileDownloadRoundedIcon />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div> */}

                        <div
                            className={`mb-4 w-[100%] ${data?.file_capacity_request_management?.length > 3 ? 'max-h-[350px] overflow-y-auto' : ''}`}
                        >
                            {data?.file_capacity_request_management?.map((item: any) => (
                                <div key={item.id} className="w-full h-auto mb-2 p-2 border rounded-lg">
                                    <div className="flex flex-col p-2">
                                        <div className="mb-2 flex justify-between">
                                            <span className='font-light'>
                                                By <span className="font-bold text-[#58585A]">
                                                    {item?.create_by_account?.first_name} {" "} {item?.create_by_account?.last_name}
                                                </span>
                                            </span>
                                            <span className="text-[#9CA3AF] font-light">{formatDate(item?.create_date)}</span>
                                        </div>
                                        <div className="flex justify-between items-center w-full h-[50px] border rounded-lg mb-2 p-4">
                                            <p className="flex items-center">
                                                <InsertDriveFileOutlinedIcon sx={{ fontSize: '20px' }} />
                                                {" "}
                                                {cutUploadFileName(item?.url) || '-'}
                                            </p>

                                            <span className="flex items-center">
                                                <a
                                                    href={item?.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    download
                                                    className="flex items-center text-[#323232] hover:text-blue-600"
                                                >
                                                    <FileDownloadRoundedIcon />
                                                </a>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>


                        {/* <label
                            htmlFor="url"
                            className="w-full flex text-left justify-start text-[#58585A] text-[16px]"
                        >
                            {`File`}
                        </label>

                        <div className="flex w-full">
                            <label className={`bg-[#00ADEF] text-white flex items-center justify-center font-light rounded-l-[6px] text-sm text-justify w-[30%] !h-[40px] px-5 py-2 cursor-pointer `}> 
                                {`Choose File`}
                                <input
                                    id="url"
                                    type="file"
                                    className="hidden"
                                    {...register('upload_tranform')}
                                    accept=".xls, .xlsx"
                                    // readOnly={isReadOnly}
                                    // disabled={isReadOnly}
                                    onChange={handleFileChange}
                                />
                            </label>

                            <div className={`bg-white text-[#9CA3AF] text-sm w-[70%] !h-[40px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden `}> 
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

                            <label className={`${fileName === "Maximum File 10 MB" ? 'bg-[#E5E7EB] !text-[#9CA3AF] pointer-events-none' : 'hover:bg-[#28805a]'} w-[167px] ml-2 !h-[40px] font-bold bg-[#17AC6B] text-white py-2 px-5 rounded-lg cursor-pointer  focus:outline-none  flex items-center justify-center text-[14px] `}>
                                {`Upload`}
                                <input
                                    type="button"
                                    className="hidden"
                                    // accept=".xls, .xlsx"
                                    // readOnly={isReadOnly}
                                    // disabled={isReadOnly}
                                    onClick={handleClickUpload}
                                />
                            </label>
                        </div>
                        <span className='w-full flex text-left justify-start text-[#1473A1] text-[14px]'>Required :  .xls, .xlsx</span> */}

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