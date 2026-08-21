import React, { useEffect, useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react'
import { cutUploadFileName, formatDate } from '@/utils/generalFormatter';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import { postService, uploadFileService } from '@/utils/postService';
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
    // clear state when closes
    const handleClose = () => {
        onClose();
        // setEmailGroup([]);
        // setFileName("Maximum File 10 MB")
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
                    <div className="flex flex-col items-center gap-2 p-9 w-[700px]">
                        <div className="w-full">
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`All Files`}</h2>
                            <div className="mb-4 w-[80%]">
                                <div className="grid grid-cols-3 text-sm font-semibold text-[#58585A]">
                                    <p>{`Nominations Code`}</p>
                                    <p>{`Contract Code`}</p>
                                    <p>{`Shipper Name`}</p>
                                </div>

                                <div className="grid grid-cols-3 text-sm font-light text-[#58585A]">
                                    <p>{data?.nomination_code || ''}</p>
                                    <p>{data?.contract_code?.contract_code || ''}</p>
                                    <p>{data?.group?.name || ''}</p>
                                </div>
                            </div>
                        </div>

                        <div
                            className={`mb-4 w-[100%] ${data?.query_shipper_nomination_file_url?.length > 3 ? 'max-h-[350px] overflow-y-auto' : ''}`}
                        >
                            {data?.query_shipper_nomination_file_url?.map((item: any) => (
                                <div key={item.id} className="w-full h-auto mb-2 p-2 border rounded-lg">
                                    <div className="flex flex-col p-2">

                                        <div className="mb-2 flex justify-between items-center">
                                            <div className="flex items-baseline gap-2">
                                                <span className='rounded-[20px] px-1 '>
                                                    <div className="flex min-w-[180px] max-w-[250px] w-auto text-center justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: String(item?.query_shipper_nomination_status?.color) }}>{item?.query_shipper_nomination_status?.name}</div>
                                                </span>

                                                <span className='rounded-md bg-[#D3E6F8] px-4 font-semibold text-[#464255]'> {item?.nomination_version?.version} </span>
                                                <span className='font-light'>By <span className="font-bold !text-[#58585A]">{item?.create_by_account && item?.create_by_account?.first_name + ' ' + item?.create_by_account?.last_name}</span></span>
                                            </div>
                                            <span className="text-gray-500">{formatDate(item?.create_date)}</span>
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