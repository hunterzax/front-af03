import React from 'react';
import { Dialog, DialogPanel } from '@headlessui/react'
import { formatDate, toDayjs } from '@/utils/generalFormatter';

type FormExampleProps = {
    data: any;
    dataRow: any;
    open: boolean;
    onClose: () => void;
};

const ModalComment: React.FC<FormExampleProps> = ({
    open,
    onClose,
    data,
    dataRow
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
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`Comment`}</h2>
                            {/* จาก Remarks เป็น Comment SHEET Sprint 4 NO.128 */}
                            <div className="mb-4 w-[100%]">
                                <div className="grid grid-cols-4 text-sm font-semibold text-[#58585A]">
                                    <p>{`Gas Day`}</p>
                                    <p>{`Shipper Name`}</p>
                                    <p>{`Zone`}</p>
                                </div>

                                <div className="grid grid-cols-4 text-sm font-light text-[#58585A]">
                                    <p>{dataRow?.gas_day_text ? toDayjs(dataRow?.gas_day).format("DD/MM/YYYY") : ''}</p>
                                    <p>{dataRow?.group ? dataRow?.group?.name : ''}</p>
                                    <p>{dataRow?.zone ? dataRow?.zone?.name : ''}</p>
                                </div>
                            </div>
                        </div>

                        <div className={`mb-1 w-[100%] ${data?.length > 2 ? 'max-h-[350px] overflow-y-auto' : ''}`}>
                            {data?.length > 0 && data?.map((item: any) => (
                                <div key={item.id} className="w-full h-auto mb-2 p-2 border rounded-lg">
                                    <div className="flex flex-col p-2">
                                        <div className="mb-2 flex justify-between items-center">
                                            <div className="flex items-center">
                                                <span className='font-light'>By <span className="font-bold">{item?.create_by_account && item?.create_by_account?.first_name + ' ' + item?.create_by_account?.last_name}</span></span>
                                            </div>
                                            {/* <span className="text-gray-500">{formatDateK(item?.create_date)}</span> */}

                                            {/* R1 : Comment Modal เวลาขึ้นไม่ถูก https://app.clickup.com/t/86eue3u5w */}
                                            <span className="text-gray-500">{formatDate(item?.create_date)}</span>
                                        </div>
                                        {/* <div className="w-full h-[50px] border rounded-lg mb-2 p-4">
                                            <p>{item?.comment || ''}</p>
                                        </div> */}

                                        <div className="flex justify-between items-center w-full border rounded-lg mb-2 p-4">
                                            <p className="flex items-center break-words text-ellipsis overflow-hidden">
                                                {item?.remark}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
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

export default ModalComment;