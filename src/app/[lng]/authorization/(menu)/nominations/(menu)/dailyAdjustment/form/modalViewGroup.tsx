import React from 'react';
import { Dialog, DialogPanel } from '@headlessui/react'

const ModalViewGroup: React.FC<any> = ({
    open,
    onClose,
    data,
    row,
}) => {
    const sp_group = data?.daily_adjustment_group?.map((item: any) => item?.group?.name);

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
                        <div className="w-[400px]">
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`View Shipper Name`}</h2>
                        </div>

                        <div className="mb-4 w-[100%]">
                            <div className='text-[#58585A] font-bold text-[14px]'>
                                All Shipper List ({sp_group?.length})
                            </div>
                            <div className='text-[#58585A] font-light text-[14px]'>
                                {
                                    data && data?.daily_adjustment_group?.map((item: any, index: number) => (
                                        <div
                                            key={index}
                                            className="relative w-fit h-[35px] p-2 text-[13px] text-[#58585A] break-all"
                                        >
                                            {item?.group?.company_name} {`(${item?.group?.name})`}
                                        </div>
                                    ))
                                }
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

export default ModalViewGroup;