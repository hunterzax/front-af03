import React from 'react';
import { Dialog, DialogPanel } from '@headlessui/react'
import { formatNumberFourDecimal } from '@/utils/generalFormatter';

type FormExampleProps = {
    data: any;
    open: boolean;
    onClose: () => void;
    onSubmitDel: () => void;
};

const ModalConfirmDel: React.FC<FormExampleProps> = ({
    open,
    onClose,
    onSubmitDel,
    data
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
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`Confirm to delete ?`}</h2>
                            {/* <div className="mb-4 w-[100%]">
                                <div className="grid grid-cols-[100px_120px_130px_120px_160px_160px] text-sm font-semibold text-[#58585A]">
                                    <p>{`Gas Day`}</p>
                                    <p>{`Shipper Name`}</p>
                                    <p className='text-center'>{`Zone`}</p>
                                    <p className='text-right'>{`Vent Gas`}</p>
                                    <p className='text-right'>{`Commissioning Gas`}</p>
                                    <p className='text-right'>{`Other Gas`}</p>
                                </div>

                                <div className="grid grid-cols-[100px_120px_130px_120px_160px_160px] text-sm font-light text-[#58585A]">
                                    <p>{data?.contract_code ? data?.contract_code?.contract_code : ''}</p>
                                    <p>{data?.group ? data?.group?.name : ''}</p>
                                    <p className='text-center'>{data?.group ? data?.group?.name : ''}</p>
                                    <p className='text-right'>{data?.group ? data?.group?.name : ''}</p>
                                    <p className='text-right'>{data?.group ? data?.group?.name : ''}</p>
                                    <p className='text-right'>{data?.group ? data?.group?.name : ''}</p>
                                </div>
                            </div>
                            <div className="my-1 pt-4 pb-4">
                                <hr className=" border-t border-[#9CA3AF] w-full mx-auto" />
                            </div> */}
                        </div>


                        <div className={`mb-1 p-3 w-[100%] ${data?.length > 3 ? 'max-h-[350px] overflow-y-auto' : ''}`}>
                            {data?.length > 0 && data?.map((item: any) => (<>

                                {/* <div key={item.id} className="w-full h-auto mb-2 p-2 border rounded-lg">
                                    <div className="flex flex-col p-2">
                                        <div className="mb-2 flex justify-between items-center">
                                            <div className="flex items-center">
                                                <span className='font-light'>By <span className="font-bold">{item?.create_by_account && item?.create_by_account?.first_name + ' ' + item?.create_by_account?.last_name}</span></span>
                                            </div>
                                            <span className="text-gray-500">{formatDate(item?.create_date)}</span>
                                        </div>

                                        <div className="flex justify-between items-center w-full border rounded-lg mb-2 p-4">
                                            <p className="flex items-center break-words text-ellipsis overflow-hidden">
                                                {item?.comment}
                                            </p>
                                        </div>
                                    </div>
                                </div> */}

                                <div key={item.id} className="mb-4 w-[100%]">
                                    <div className="grid grid-cols-[100px_120px_130px_150px_240px_170px] text-sm font-semibold text-[#58585A]">
                                        <p>{`Gas Day`}</p>
                                        <p>{`Shipper Name`}</p>
                                        <p className='text-center'>{`Zone`}</p>
                                        <p className='text-right'>{`Vent Gas (MMBTU)`}</p>
                                        <p className='text-right'>{`Commissioning Gas (MMBTU)`}</p>
                                        <p className='text-right'>{`Other Gas (MMBTU)`}</p>
                                    </div>

                                    <div className="grid grid-cols-[100px_120px_130px_150px_240px_170px] text-sm font-light text-[#58585A]">
                                        <p>{item?.gas_day_text ? item?.gas_day_text : ''}</p>
                                        <p>{item?.group ? item?.group?.name : ''}</p>
                                        <p className='text-center'>{item?.zone ? item?.zone?.name : ''}</p>
                                        <p className='text-right'>{item?.vent_gas_value_mmbtud ? formatNumberFourDecimal(item?.vent_gas_value_mmbtud) : ''}</p>
                                        <p className='text-right'>{item?.commissioning_gas_value_mmbtud ? formatNumberFourDecimal(item?.commissioning_gas_value_mmbtud) : ''}</p>
                                        <p className='text-right'>{item?.other_gas_value_mmbtud ? formatNumberFourDecimal(item?.other_gas_value_mmbtud) : ''}</p>
                                    </div>
                                </div>
                                <div className="my-1 pt-4 pb-4">
                                    <hr className=" border-t border-[#9CA3AF] w-full mx-auto" />
                                </div>

                            </>

                            ))}
                        </div>

                        <div className="w-full flex justify-end pt-8">
                            <button
                                type="button"
                                onClick={() => onClose()}
                                className={`py-2 px-6 rounded-lg w-[167px] text-black`}
                            >
                                {'Cancel'}
                            </button>
                            <button
                                onClick={() => onSubmitDel()}
                                className="w-[167px] font-ligth bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
                                {'Delete'}
                            </button>
                        </div>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default ModalConfirmDel;