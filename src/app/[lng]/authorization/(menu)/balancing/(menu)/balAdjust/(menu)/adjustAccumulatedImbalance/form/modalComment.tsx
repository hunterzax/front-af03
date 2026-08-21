import React, { useEffect, useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react'
import { formatDate, toDayjs } from '@/utils/generalFormatter';

type FormExampleProps = {
    data: any;
    dataMain: any;
    open: boolean;
    onClose: () => void;
    modeShowDiv?: any;
    setModalMsg?: any;
    setModalSuccessOpen?: any;
    setModalSuccessMsg?: any;
};

const ModalComment: React.FC<FormExampleProps> = ({
    open,
    onClose,
    data,
    dataMain,
    modeShowDiv,
    setModalMsg,
    setModalSuccessOpen,
    setModalSuccessMsg
}) => {

    // const userDT: any = getUserValue();
    const [comments, setComments] = useState<any>([]);

    useEffect(() => {
        setComments(data)
    }, [open])

    // clear state when closes
    const handleClose = () => {
        onClose();
        setComments([]);
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
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`Comment`}</h2>
                            <div className="mb-4 w-[100%]">
                                <div className="grid grid-cols-4 w-full text-sm font-semibold text-[#58585A] pb-2">
                                    <p>{`Gas Day`}</p>
                                </div>

                                <div className="grid grid-cols-4 text-sm font-light text-[#58585A]">
                                    <p>{dataMain?.gas_day ? toDayjs(dataMain?.gas_day).format("DD/MM/YYYY") : ''}</p>
                                </div>
                            </div>
                        </div>

                        <div className={`mb-1 w-[100%] ${comments?.length > 2 ? 'max-h-[350px] overflow-y-auto' : ''}`}>
                            {comments && comments?.map((item: any) => (
                                <div key={item.id} className="w-full h-auto mb-2 p-2 border rounded-lg">
                                    <div className="flex flex-col p-2">
                                        <div className="mb-2 flex justify-between">
                                            <span className='font-light'>
                                                By <span className="font-bold text-[#58585A]">
                                                    {item?.create_by_account?.first_name} {" "} {item?.create_by_account?.last_name}
                                                </span>
                                            </span>
                                            <span className="text-[#9CA3AF] font-light">{formatDate(item?.create_date)}</span>
                                        </div>

                                        <div className="flex justify-between items-center w-full border rounded-lg mb-2 p-4">
                                            <p className="flex items-center break-words text-ellipsis overflow-hidden">
                                                {item?.remark}
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

export default ModalComment;