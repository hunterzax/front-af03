import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Dialog, DialogPanel } from '@headlessui/react'
import { TextField } from '@mui/material';

type FormData = {
    status: string;
    reason: string;
};

type FormExampleProps = {
    data: any;
    open: boolean;
    mode: any;
    onSubmitUpdate: SubmitHandler<FormData>;
    handleClose: () => void;
    //   modeShowDiv: any;
};

const ModalUpdateReason: React.FC<FormExampleProps> = ({
    open,
    data,
    onSubmitUpdate,
    handleClose,
    mode
    //   modeShowDiv
}) => {
    const { register, handleSubmit, setValue, reset, formState: { errors }, watch } = useForm<FormData>({
        defaultValues: data,
    });
    const labelClass = "block mb-2 text-sm font-light"

    return (
        <Dialog open={open} onClose={handleClose} className="relative z-10">
            {/* <div className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity" /> */}
            <div className={["fixed inset-0 bg-black/45", "transition-opacity duration-100 ease-out", open ? "opacity-100" : "opacity-0 pointer-events-none"].join(" ")} />
            <div className="fixed inset-0 z-10 flex items-center justify-center">
                <DialogPanel
                    transition
                    className="flex w-auto transform transition-all bg-white inset-0 rounded-[20px] text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                >
                    <div className="flex flex-col items-center gap-2 p-9">
                        <div className="w-[700px]">
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{mode == "all" ? `Reject All Selections` : `Reject`}</h2>
                            {
                                mode !== "all" &&
                                <div className="mb-4 w-[100%]">
                                    <div className="grid grid-cols-[140px_140px_1fr] text-sm font-semibold">
                                        <p>{`Shipper Name`}</p>
                                        <p>{`Contract Code`}</p>
                                    </div>
                                    <div className="grid grid-cols-[140px_140px_1fr] text-sm font-light">
                                        <p>{data?.user_id || '-'}</p>
                                        <p>{data?.company_name || '-'}</p>
                                    </div>
                                </div>
                            }
                        </div>

                        <div className="mb-4 w-[100%]">
                            <form onSubmit={handleSubmit(onSubmitUpdate)} >
                                <div>
                                    <label className={labelClass}>{`Reason`}</label>
                                    <TextField
                                        {...register('reason')}
                                        value={watch('reason') || ''}
                                        label=""
                                        multiline
                                        placeholder='Reason'
                                        rows={6}
                                        sx={{
                                            '.MuiOutlinedInput-root': {
                                                borderRadius: '8px',
                                            },
                                            '.MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#DFE4EA',
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#d2d4d8',
                                            },
                                            '&.Mui-focused .MuiOutlinedI nput-notchedOutline': {
                                                borderColor: '#d2d4d8',
                                            },
                                            '& .MuiInputBase-input::placeholder': {
                                                color: '#9CA3AF', // Placeholder color
                                                fontSize: '14px', // Placeholder font size
                                            },
                                        }}
                                        fullWidth
                                        className='rounded-lg'
                                    />
                                </div>

                                <div className="flex justify-end pt-8">
                                    <button type="button" onClick={handleClose} className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500">
                                        {`Cancel`}
                                    </button>

                                    <button type="submit" className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
                                        {`Reject`}
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

export default ModalUpdateReason;