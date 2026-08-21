import React, { useEffect, useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { formatDate } from '@/utils/generalFormatter';

type FormExampleProps = {
    data?: any;
    open: boolean;
    onClose: () => void;
};

const ModalSubmissionDetails: React.FC<FormExampleProps> = ({
    open,
    onClose,
    data,
}) => {
    // const emails = data?.edit_email_group_for_event_match?.map((item: any) => item.email);

    // useEffect(() => {
    //     // setResetForm(() => reset);
    // }, []);

    return (
        <Dialog open={open} onClose={onClose} className="relative z-20">
            {/* <div className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity" /> */}
            <div className={["fixed inset-0 bg-black/45", "transition-opacity duration-100 ease-out", open ? "opacity-100" : "opacity-0 pointer-events-none"].join(" ")} />
            <div className="fixed inset-0 z-10 flex items-center justify-center">
                <DialogPanel
                    transition
                    className="flex w-auto transform transition-all bg-white inset-0 rounded-[20px] text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                >
                    <div className="flex flex-col items-center gap-2 p-9">
                        <div className="w-full">
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`Submission Comments`}</h2>
                            <div className="mb-4 w-[100%]">
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

                        <div className="mb-4 w-[100%] h-[400px] border border-[#DFE4EA] rounded-[6px] p-4">
                            {/* <div className='text-[#464255] font-light text-[14px]'>
                                {
                                    data?.submission_comment_capacity_request_management && data?.submission_comment_capacity_request_management?.map((item: any, index: number) => (
                                        <div
                                            key={index}
                                            className="relative w-fit h-[35px] p-2 text-[13px] text-[#58585A] break-all"
                                        >
                                            {item?.remark}
                                        </div>
                                    ))
                                }
                            </div> */}

                            <div
                                className={`text-[#464255] font-light text-[14px] ${data?.submission_comment_capacity_request_management?.length > 10 ? 'max-h-[350px] overflow-y-auto' : ''}`}
                            >
                                {/* v1.0.90 เรียงลำดับเวลา submitted ใน submission comments ด้วย https://app.clickup.com/t/86ert8mpq */}
                                {data?.submission_comment_capacity_request_management
                                    ?.sort((a: any, b: any) => new Date(b.create_date).getTime() - new Date(a.create_date).getTime()) // Descending order
                                    .map((item: any, index: number) => (
                                        <div
                                            key={index}
                                            className="relative w-fit h-[35px] p-2 text-[13px] text-[#58585A] break-all"
                                        >
                                            {item?.remark}
                                        </div>
                                    ))}
                            </div>

                        </div>

                        <div className="w-full flex justify-end pt-6">
                            <button
                                onClick={onClose}
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

export default ModalSubmissionDetails;