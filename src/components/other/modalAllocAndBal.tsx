import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { toDayjs } from '@/utils/generalFormatter';

type FormData = {
    status: string;
    reason: string;
  };

type FormExampleProps = {
  data: any;
  dataCloseBal?: any;
  open: boolean;
  onClose: () => void;
  onSubmitUpdate: SubmitHandler<FormData>;
//   modeShowDiv: any;
};

const ModalAllocAndBal: React.FC<FormExampleProps> = ({
  open,
  onClose,
  data,
  dataCloseBal,
  onSubmitUpdate
//   modeShowDiv
}) => {

    const { register, handleSubmit, setValue, reset, formState: { errors }, watch } = useForm<FormData>({
        defaultValues: data,
    });

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
                        <div className="w-[350px] ">
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`Allocation and Balancing Execution`}</h2>
                            <div className='pb-6'>{`Allocation and Balancing calculation for all shippers will be executed for the following period:`}</div>
                            <div className="mb-4 w-[100%]">
                                <div className="grid grid-cols-[120px_1fr] text-sm font-ligth w-[400px]">
                                    {/* <p className='font-semibold pb-2 w-[75%]'>From Date </p> <p>: {'มาจากวันที่ close balancing'}</p> */}
                                    <p className='font-semibold pb-2 w-[75%]'>From Date </p> <p>: {`${toDayjs(dataCloseBal?.date_balance).add(1, 'month').startOf('month').format("DD/MM/YYYY")}`}</p>
                                    <p className='font-semibold pb-2 w-[75%]'>To Date </p> <p>: {`${toDayjs().format("DD/MM/YYYY")}`}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4 w-[100%]">
                            <form onSubmit={handleSubmit(onSubmitUpdate)} >
                                <div className="flex justify-end pt-8">
                                    <button type="button" onClick={onClose} className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500">
                                        {`Cancel`}
                                    </button>
                                    <button type="submit" className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
                                        {`Execute`}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default ModalAllocAndBal;