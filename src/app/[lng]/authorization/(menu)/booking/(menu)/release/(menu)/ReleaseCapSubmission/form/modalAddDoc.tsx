import React, { useEffect, useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react'
import { cutUploadFileName, formatDate } from '@/utils/generalFormatter';
import { getService, postService, putService, uploadFileService } from '@/utils/postService';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import Spinloading from '@/components/other/spinLoading';
import { useForm } from 'react-hook-form';
import { CloseOutlined } from '@mui/icons-material';
import ConfirmModal from '@/components/other/confirmModal';

type FormExampleProps = {
    data?: any;
    specificData?: any
    open: boolean;
    onClose: () => void;
    setModalMsg?: any;
    setModalErrorMsg?: any;
    setModalErrorOpen?: any;
    setModalSuccessOpen?: any;
    setModalSuccessMsg?: any;
};

const ModalAddDocument: React.FC<FormExampleProps> = ({
    open,
    onClose,
    data,
    specificData,
    setModalMsg,
    setModalErrorMsg,
    setModalErrorOpen,
    setModalSuccessOpen,
    setModalSuccessMsg
}) => {
    const { control, register, handleSubmit, getValues, setValue, setError, reset, formState: { errors }, clearErrors, watch, } = useForm<any>({ defaultValues: data, });

    const [comments, setComments] = useState<any[]>([]);
    // const [fileLoading, setfileLoading] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedInactive, setSelectedInactive] = useState<any>();

    useEffect(() => {
        if (open && specificData) {
            fetchData()
        }
    }, [open])

    // clear state when closes
    const handleClose = () => {
        setFileName("Maximum File 10 MB"); // Reset fileName
        setFileUpload(undefined);
        // setfileLoading(false);
        onClose();
    };

    const [fileName, setFileName] = useState('Maximum File 10 MB');
    const [fileUpload, setFileUpload] = useState<any>();
    const [fileUrl, setFileUrl] = useState<any>();

    const fetchData = async () => {
        try {
            setIsLoading(true);
            // const response:any = await getService(`/master/capacity/capacity-request-management`);
            const resDocument = await getService(`/master/release-capacity-submission/document-file/${specificData}`);

            if (resDocument && Array.isArray(resDocument)) {
                setIsLoading(false);
                setComments(resDocument)
                handleRemoveFile()
            }
            else {
                setIsLoading(false);
                setModalErrorMsg(resDocument?.response?.data?.error || "Something wrong");
                setModalErrorOpen(true);
            }
        } catch (error) {
            // 
            setIsLoading(false)
        }
    };

    const handleSubmitDoc = async (url: any) => {
        try {
            setIsLoading(true);
            const data = {
                "contract_code_id": specificData,
                "url": url
            }
            const resSubmit = await postService('/master/release-capacity-submission/document-file-create', data)

            if (resSubmit?.id) {
                fetchData()
            }
            else {
                setIsLoading(false);
                setModalErrorMsg(resSubmit?.response?.data?.error || "Something wrong");
                setModalErrorOpen(true);
            }
        } catch (error) {
            // 
            setIsLoading(false);
        }
    };

    const handleInactive = async (id: any) => {
        try {
            setIsLoading(true);
            const data = {
                "id": id
            }
            const resInactive = await putService('/master/release-capacity-submission/document-file-inactive', data)

            if (resInactive?.id) {
                fetchData()
                setSelectedInactive(undefined)
            }
            else {
                setIsLoading(false);
                setModalErrorMsg(resInactive?.response?.data?.error || "Something wrong");
                setModalErrorOpen(true);
            }
        } catch (error) {
            // 
            setIsLoading(false);
        }
    };

    const handleFileChange = async (e: any) => {
        const file = e.target.files[0];
        if (file) {
            // const validFileTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
            const maxSizeInMB = 10; // Maximum file size in MB
            const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
            // if (!validFileTypes.includes(file.type)) {
            //     // setFileName('Invalid file type. Please upload a Excel file.');
            //     // Invalid file type:'
            //     setError("file", {
            //         type: "manual",
            //         message: "Invalid file type. Please upload a Excel file.",
            //     });
            //     return;
            // }

            if (file.size > maxSizeInBytes) {
                // setFileName('The file is larger than 10 MB.');
                setError("file", {
                    type: "manual",
                    message: "The file is larger than 10 MB.",
                });
                handleRemoveFile()
                // File size too large:
                return;
            }

            setFileName(file.name);
            setFileUpload(file);
            // setfileLoading(true);
            // setModalMsg("Your file has been uploaded")
            clearErrors("file")

        } else {
            setFileName('No file chosen');
        }

        // setTimeout(() => {
        //     setfileLoading(false);
        // }, 200);
    };

    const handleClickUpload = async () => {
        if (fileUpload) {
            try {

                const response: any = await uploadFileService('/files/uploadfile/', fileUpload);

                setFileUrl(response?.file?.url)
                // handleSendComment(response?.file?.url);
                handleSubmitDoc(response?.file?.url);
                // setValue("url", response?.file?.url);
                // setModalSuccessOpen(true)
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
        setValue('file', null);
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
                    <div className="flex flex-col items-center gap-2 p-9 w-[700px]">
                        <div className="w-full">
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`Additional Document`}</h2>
                        </div>

                        <div className={`mb-1 w-[100%] ${comments?.length > 2 ? 'max-h-[350px] overflow-y-auto' : ''}`}>
                            {/* {data?.booking_version_comment?.map((item: any) => ( */}
                            {comments && comments?.map((item: any) => (
                                <div key={item.id} className="w-full h-auto mb-2 p-2 border rounded-lg">
                                    <div className="flex flex-col p-2">
                                        <div className="mb-2 flex justify-between items-center">
                                            <span className="font-light">
                                                By <span className="font-bold text-[#58585A]">{item?.create_by_account?.first_name} {item?.create_by_account?.last_name}</span>
                                            </span>
                                            <div className="flex items-center space-x-4">
                                                <span className="text-[#9CA3AF] font-light">{formatDate(item?.create_date)}</span>
                                                <DeleteOutlineOutlinedIcon
                                                    sx={{ fontSize: '30px' }}
                                                    className="text-[#EA6060] bg-[#ffffff] border border-[#DFE4EA] rounded-md p-1 cursor-pointer"
                                                    // onClick={() => handleDelete(item.url)}
                                                    onClick={() => setSelectedInactive(item.id)}
                                                />
                                            </div>
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

                        <div className='w-full'>
                            <label
                                htmlFor="url"
                                className="w-full flex text-left justify-start text-[#58585A] text-[16px]"
                            >
                                {`File`}
                            </label>

                            <div className={`flex w-full ${errors?.file ? 'border-[#FF0000] h-[39px]' : 'border-none h-[40px]'}`}>
                                {/* "Choose File" button */}
                                {/* <Spinloading spin={fileLoading} rounded={7} /> */}
                                <label className={`bg-[#00ADEF] text-white flex items-center justify-center font-light rounded-l-[6px] text-sm text-justify w-[30%] !h-[40px] px-5 py-2 cursor-pointer `}> {/* ${isReadOnly && "!bg-[#B6B6B6] !text-[#828282]"} */}
                                    {`Choose File`}
                                    <input
                                        id="url"
                                        type="file"
                                        className="hidden"
                                        {...register('file', { required: fileUpload ? false : "Select File" })}

                                        // accept=".xls, .xlsx"
                                        // readOnly={isReadOnly}
                                        // disabled={isReadOnly}
                                        onChange={handleFileChange}
                                    />
                                </label>

                                {/* Filename display */}
                                {/* <div className={`bg-white text-[#9CA3AF] text-sm w-[70%] !h-[40px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden `}>  
                                    {fileName}
                                </div> */}

                                <div
                                    className={`bg-white text-[#9CA3AF] text-sm w-[100%] !h-[100%] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden flex items-center`}
                                >
                                    <div className={`truncate ${fileName == 'Maximum File 10 MB' ? 'text-[#9CA3AF]' : 'text-[#464255]'} `}>{fileName}</div>
                                    {fileName !== "Maximum File 10 MB" && (
                                        <CloseOutlined
                                            onClick={handleRemoveFile}
                                            className="cursor-pointer ml-2 text-[#9CA3AF] z-10"
                                            sx={{ color: '#323232', fontSize: 18 }}
                                            style={{ fontSize: 18 }}
                                        />
                                    )}
                                </div>

                                {/* "Upload" button */}
                                <label
                                    // className={`${fileName === "Maximum File 10 MB" ? 'bg-[#E5E7EB] !text-[#9CA3AF] pointer-events-none' : 'hover:bg-[#28805a]'} w-[167px] ml-2 !h-[40px] font-bold bg-[#17AC6B] text-white py-2 px-5 rounded-lg cursor-pointer  focus:outline-none  flex items-center justify-center text-[14px] `}
                                    className={`${(fileName === "Maximum File 10 MB" || fileName === "The file is larger than 10 MB." || fileName === "Invalid file type. Please upload a Excel file.") ? 'bg-[#9CA3AF] text-[#FFFFFF] pointer-events-none' : 'hover:bg-[#28805a]'} w-[167px] h-[46px] font-bold bg-[#17AC6B] text-white py-2 px-5 rounded-lg cursor-pointer focus:outline-none flex items-center justify-center text-[16px]`}
                                > {/* ${isReadOnly && "!bg-[#DFE4EA] !text-[#9CA3AF]"} */}
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

                            {/* <span className='w-full flex text-left justify-start text-[#1473A1] text-[14px]'>Required :  .xls, .xlsx</span> */}
                            {errors?.file && (<p className="text-red-500 text-sm">{`${errors?.file?.message}`}</p>)}
                        </div>

                        <div className="w-full flex justify-end pt-8">
                            <button
                                onClick={handleClose}
                                className="w-[167px] font-bold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
                                {'Close'}
                            </button>
                        </div>
                    </div>

                    <ConfirmModal
                        open={!!selectedInactive}
                        handleClose={() => setSelectedInactive(undefined)}
                        handleConfirm={() => {
                            handleInactive(selectedInactive)
                        }}
                        title='Confirm to delete ?'
                        btnText='Delete'
                        description="To proceed, click 'Delete'."
                    />
                </DialogPanel>
            </div>
        </Dialog>

    );
};

export default ModalAddDocument;