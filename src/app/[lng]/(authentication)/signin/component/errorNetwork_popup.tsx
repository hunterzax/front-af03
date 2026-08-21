import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { Button } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

type Props = {
    width: number;
    open: boolean;
    onClose: () => void;
    // onSubmit: SubmitHandler<FormData>;
};

const NetworkErrorPopup: React.FC<Props> = ({
    width,
    open,
    onClose,
}) => {

    // clear state when closes
    const handleClose = () => {
        onClose();
    };

    return(
        <Dialog open={open} onClose={handleClose} className="relative z-20">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
            />
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <DialogPanel
                        transition
                        className="flex transform transition-all inset-0 rounded-lg text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in  data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                    >
                        <div className="flex inset-0 items-center justify-center">
                            <div className={`bg-white w-[${width}px] h-auto rounded-[20px] p-8`}>
                                {/* ICON */}
                                <div className="flex items-center justify-center pb-2">
                                    <div className={`flex items-center justify-center w-[60px] h-[60px] mb-3 bg-[#FEEBEB] text-[#E10E0E] rounded-full`}>
                                        <CloseRoundedIcon />
                                    </div>
                                </div>
                                {/* TEXT */}
                                <div className={`flex pb-2 justify-center text-[#E10E0E] text-[24px] font-[700] mb-3`}>
                                    {'Failed'}
                                </div>
                                {/* <h5 className='text'>Error</h5> */}
                                <div className='text-center'>Unable to connect to the server. Please try again later.</div>
                                <div className='mt-5 flex justify-center'>
                                    {/* <Button className='w-full !bg-blue-300 !text-white'>OK</Button> */}
                                    <button
                                        type='button'
                                        onClick={handleClose}
                                        className="w-[120px] h-[50px] bg-[#00ADEF] text-white hover:bg-blue-600 rounded-md"
                                        >
                                        {'OK'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}

export default NetworkErrorPopup;