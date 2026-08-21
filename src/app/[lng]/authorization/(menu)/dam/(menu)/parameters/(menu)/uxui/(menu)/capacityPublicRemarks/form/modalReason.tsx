import React, { useEffect, useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { formatDate, formatDateNoTime } from '@/utils/generalFormatter';

type FormExampleProps = {
    data: any;
    open: boolean;
    onClose: () => void;
};

const ModalReason: React.FC<FormExampleProps> = ({
    open,
    onClose,
    data,
}) => {
  
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
                        <div className="w-[700px]">
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`Reason`}</h2>
                        </div>

                        <div className="mb-4 w-[100%]">
                             <div className="mb-4 w-[100%]">
                                <div className="grid grid-cols-5 text-[#58585A] text-sm font-semibold">
                                    <p>{`Start Date`}</p>
                                    <p>{`End Date`}</p>
                                </div>

                                <div className="grid grid-cols-5 text-sm font-light">
                                    <p>{formatDateNoTime(data?.start_date) || '-'}</p>
                                    <p>{formatDateNoTime(data?.end_date) || '-'}</p>
                                </div>
                            </div>
                            <div key={data.id} className="w-full h-auto mb-2 p-2 border rounded-lg">
                                <div className="flex flex-col p-2">
                                    <div className="mb-2 flex justify-between">
                                        <span className='font-light text-[#58585A]'>By <span className="font-bold text-[#58585A]"> {data?.create_by_account?.first_name} {data?.create_by_account?.last_name}</span></span>
                                        <span className="text-[#9CA3AF]">{formatDate(data?.create_date)}</span>
                                    </div>
                                    <div className="w-full border rounded-lg mb-2 p-4">
                                        <p className="max-w-[630px] whitespace-normal">{data?.remark || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full flex justify-end pt-8">
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

export default ModalReason;