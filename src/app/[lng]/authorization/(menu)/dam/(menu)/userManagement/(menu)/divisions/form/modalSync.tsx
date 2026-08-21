import React from 'react';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';

type FormExampleProps = {
    open: boolean;
    onClose?: () => void;
};

const ModalSync: React.FC<FormExampleProps> = ({
    open,
    onClose,
}) => {

    return (
        <Dialog open={open} onClose={() => {}} className="relative z-20">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-[#000000] bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
            />
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <DialogPanel
                        transition
                        className="flex transform transition-all inset-0 rounded-lg text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in  data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                    >
                        <div className="flex flex-col inset-0 items-center justify-center w-[100%] h-full">
                            <div>
                                {/* <SyncRoundedIcon sx={{ color: '#ffffff', fontSize: '60px', transform: 'rotate(-90deg)' }} /> */}
                                <SyncRoundedIcon
                                    sx={{
                                        color: '#ffffff',
                                        fontSize: '60px',
                                        transform: 'rotate(-90deg)',
                                        animation: 'rotation 2s infinite linear',
                                        '@keyframes rotation': {
                                            from: { transform: 'rotate(270deg)' },
                                            to: { transform: 'rotate(-90deg)' },
                                        },
                                    }}
                                />
                            </div>
                            <div className=' text-[#ffffff] text-[24px] font-semibold tracking-wide'>{`Synchronization in progress`}</div>
                            <div className=' text-[#ffffff] text-[24px] font-light tracking-wide'>{`Keep the browser open until finished.`}</div>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
};

export default ModalSync;