import React, { useEffect, useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react'
import { formatDate, formatDateNoTime } from '@/utils/generalFormatter';

type FormExampleProps = {
    data: any;
    dataRow: any;
    open: boolean;
    tabSelected? : any
    onClose: () => void;
};

const ModalComment: React.FC<FormExampleProps> = ({
    open,
    onClose,
    data,
    dataRow,
    tabSelected = 0
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
                        <div className="w-full">
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`Submission Comments`}</h2>
                            <div className="mb-4 w-[100%]">
                                <div className="grid grid-cols-[150px_150px_200px] text-sm font-semibold text-[#58585A]">
                                    <p>{`Shipper Name`}</p>
                                    <p>{`Contract Code`}</p>
                                    <p>{tabSelected == 0 ? `Gas Day`: `Gas Week`}</p>
                                </div>

                                <div className="grid grid-cols-[150px_150px_200px] text-sm font-light text-[#58585A]">
                                    <p>{dataRow?.group?.name || '-'}</p>
                                    <p>{dataRow?.contract_code?.contract_code || '-'}</p>
                                    <p>{formatDateNoTime(dataRow?.gas_day) || '-'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4 w-[100%] h-[400px] border border-[#DFE4EA] rounded-[6px] p-4">
                            <div
                                className={`text-[#464255] font-light text-[14px] ${data?.length > 10 ? 'max-h-[350px] overflow-y-auto' : ''}`}
                            >
                                {data?.map((item: any, index: number) => (
                                    <div
                                        key={index}
                                        className="relative w-fit h-[27px] p-2 text-[13px] text-[#58585A] break-all"
                                    >
                                        {item?.remark}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="w-full flex justify-end pt-2">
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

export default ModalComment;