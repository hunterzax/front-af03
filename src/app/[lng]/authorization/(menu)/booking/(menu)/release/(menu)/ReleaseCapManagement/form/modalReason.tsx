import React from 'react';
import { Dialog, DialogPanel } from '@headlessui/react'
import { formatDate } from '@/utils/generalFormatter';

type FormExampleProps = {
    data: any;
    dataRow: any;
    open: boolean;
    onClose: () => void;
};

const ModalReason: React.FC<FormExampleProps> = ({
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
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`Reasons`}</h2>
                            <div className="mb-4 w-[100%]">
                                <div className="grid grid-cols-4 text-sm font-semibold text-[#58585A]">
                                    <p>{`Submission Time`}</p>
                                    <p>{`Shipper Name`}</p>
                                    <p>{`Contract Code`}</p>
                                    <p>{`Requested Code`}</p>
                                </div>

                                <div className="grid grid-cols-4 text-sm font-light text-[#58585A]">
                                    <p>{dataRow?.submission_time ? formatDate(dataRow?.submission_time) : ''}</p>
                                    <p>{dataRow?.group ? dataRow?.group?.company_name : ''}</p>
                                    <p>{dataRow?.contract_code ? dataRow?.contract_code?.contract_code : ''}</p>
                                    <p>{dataRow?.requested_code ? dataRow?.requested_code : ''}</p>
                                    {/* <p>{data?.group?.name || '-'}</p>
                                    <p>{formatDate(data?.submitted_timestamp) || '-'}</p> */}
                                </div>
                            </div>
                        </div>

                        <div className={`mb-1 w-[100%] ${data?.length > 2 ? 'max-h-[350px] overflow-y-auto' : ''}`}>
                            {data?.length > 0 && data?.reverse()?.map((item: any) => (
                                <div key={item.id} className="w-full h-auto mb-2 p-2 border rounded-lg">
                                    <div className="flex flex-col p-2">
                                        {/* <div className="mb-2 flex justify-between">
                                            <span className='font-light '>By <span className="font-bold"> {item?.account_id}</span></span> <div className='flex !w-[60px] h-[21px] justify-center items-center rounded-lg bg-[#D3F8E2] font-semibold text-[12px] text-[#464255]'> {`Active`} </div>
                                            <span className="text-gray-500">{formatDate(item?.create_date)}</span>
                                        </div> */}
                                        <div className="mb-2 flex justify-between items-center">
                                            <div className="flex items-center">
                                                {/* <div className='ml-2 flex !w-[65px] h-[24px] justify-center items-center rounded-lg font-semibold text-[12px] text-[#464255]' style={{ backgroundColor: item?.status ? '#D3F8E2' : '#EAECF0' }}>
                                                    {item?.status ? 'Active' : 'Inactive'}
                                                </div> */}
                                                <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: item?.release_capacity_status?.color }}>{`${item?.release_capacity_status?.name}`}</div>
                                                <span className='font-light'>By <span className="font-bold">{item?.create_by_account && item?.create_by_account?.first_name + ' ' + item?.create_by_account?.last_name}</span></span>
                                            </div>
                                            <span className="text-gray-500">{formatDate(item?.create_date)}</span>
                                        </div>
                                        {/* <div className="w-full h-[50px] border rounded-lg mb-2 p-4">
                                            <p>{item?.reasons || '-'}</p>
                                        </div> */}

                                        <div className="flex justify-between items-center w-full border rounded-lg mb-2 p-4">
                                            <p className="flex items-center break-words text-ellipsis overflow-hidden">
                                                {item?.reasons}
                                            </p>

                                            <span className="flex items-center">
                                            </span>
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

export default ModalReason;