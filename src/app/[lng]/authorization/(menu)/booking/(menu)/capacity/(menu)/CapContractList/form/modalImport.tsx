import React, { useEffect, useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { formatDate } from '@/utils/generalFormatter';
import { uploadFileService } from '@/utils/postService';

type FormExampleProps = {
    data?: any;
    open: boolean;
    onClose: () => void;
};

const ModalImport: React.FC<FormExampleProps> = ({
    open,
    onClose,
    data,
}) => {
    // const emails = data?.edit_email_group_for_event_match?.map((item: any) => item.email);

    // useEffect(() => {
    //     // setResetForm(() => reset);
    // }, []);

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
            // setFileUpload(file);
            // setModalMsg("Your file has been uploaded")

        } else {
            setFileName('No file chosen');
        }
    };

    const handleClickUpload = async () => {
        if (fileUpload) {
            try {
                 

                // case import หรือ amend
                // {{API_URL}}/master/capacity/path-capacity-request-management/import-template/35


                // const response:any = await uploadFileService('/files/uploadfile/', fileUpload);
                 
                // setValue("url", response?.file?.url);
                // setModalSuccessOpen(true)
            } catch (error) {
                // File upload failed:
            }
        } else {
            setFileName('No file chosen');
        }
    };

    const handleClose = () => {
        onClose();
        setFileUpload(null)
        setFileName("Maximum File 10 MB")
        // setSelectedValues([]);
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

                        <div className="flex w-full">
                            {/* "Choose File" button */}
                            <label className={`bg-[#00ADEF] text-white flex items-center justify-center font-light rounded-l-[6px] text-sm text-justify w-[30%] !h-[40px] px-5 py-2 cursor-pointer `}> {/* ${isReadOnly && "!bg-[#B6B6B6] !text-[#828282]"} */}
                                {`Choose File`}
                                <input
                                    id="url"
                                    type="file"
                                    className="hidden"
                                    accept=".xls, .xlsx"
                                    // readOnly={isReadOnly}
                                    // disabled={isReadOnly}
                                    onChange={handleFileChange}
                                />
                            </label>

                            <div className={`bg-white text-[#9CA3AF] text-sm w-[70%] !h-[40px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden `}>  {/* ${isReadOnly && '!bg-[#EFECEC]'} */}
                                {fileName}
                            </div>
                        </div>
                        <span className='w-full flex text-left justify-start text-[#1473A1] text-[14px]'>Required :  .xls, .xlsx</span>


                        <div className="flex justify-end w-full gap-4 pt-6">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500"
                            >
                                {`Cancel`}
                            </button>
                            <button
                                type="submit"
                                className="w-[167px] font-semibold bg-[#17AC6B] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                            >
                                {'Upload'}
                            </button>
                        </div>

                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default ModalImport;