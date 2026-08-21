import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Dialog, DialogPanel } from '@headlessui/react'
import { TextField } from '@mui/material';

type FormData = {
    id: any;
    reason: string;
};

type FormExampleProps = {
    data: any;
    dataModalAcceptReject?: any;
    mode?: any;
    type?: any;
    open: boolean;
    onClose: () => void;
    // onSubmitUpdate: SubmitHandler<FormData>;
    onSubmit: SubmitHandler<FormData>;
    //   modeShowDiv: any;
};

const ModalAcceptReject: React.FC<FormExampleProps> = ({
    open,
    onClose,
    data,
    dataModalAcceptReject,
    mode,
    type,
    onSubmit,
    // onSubmitUpdate
    //   modeShowDiv
}) => {
    const { register, handleSubmit, setValue, reset, formState: { errors }, watch } = useForm<FormData>({ defaultValues: data });

    const labelClass = "block mb-2 text-sm font-light"

    // clear state when closes
    const handleClose = () => {
        onClose();
        reset();
    };

    useEffect(() => {
        setValue('id', data?.id)
    }, [data])

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
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`${mode == 'accept' ? `Approve ${type == 'all' ? 'All' : ''}` : `Reject ${type == 'all' ? 'All' : ''}`}`}</h2>

                            {
                                type !== 'all' && <div className="mb-4 w-[100%]">
                                    <div className="grid grid-cols-4 text-sm font-semibold text-[#58585A]">
                                        <p>{`Nominations Code`}</p>
                                        <p>{`Contract Code`}</p>
                                        <p>{`Shipper Name`}</p>
                                    </div>

                                    <div className="grid grid-cols-4 text-sm font-light text-[#58585A]">
                                        <p>{dataModalAcceptReject[0]?.nomination_code ? dataModalAcceptReject[0]?.nomination_code : ''}</p>
                                        <p>{dataModalAcceptReject[0]?.contract_code ? dataModalAcceptReject[0]?.contract_code?.contract_code : ''}</p>
                                        <p>{dataModalAcceptReject[0]?.group ? dataModalAcceptReject[0]?.group?.name : ''}</p>
                                    </div>
                                </div>
                            }

                        </div>

                        <div className="mb-4 w-[100%]">
                            <form
                                // onSubmit={handleSubmit(onSubmitUpdate)} 
                                onSubmit={handleSubmit((data) => { // clear state when submit
                                    onSubmit(data);
                                    reset();
                                })}
                            >
                                <div>
                                    <label className={labelClass}>{`Reasons`}</label>
                                    <TextField
                                        {...register('reason')}
                                        value={watch('reason') || ''}
                                        label=""
                                        multiline
                                        onChange={(e) => {
                                            if (e.target.value.length <= 255) {
                                                setValue('reason', e.target.value);
                                            }
                                        }}
                                        placeholder='Enter Reasons'
                                        rows={6}
                                        // sx={{
                                        //     '.MuiOutlinedInput-root': {
                                        //         borderRadius: '8px',
                                        //     },
                                        //     '.MuiOutlinedInput-notchedOutline': {
                                        //         borderColor: '#DFE4EA',
                                        //     },
                                        //     '&:hover .MuiOutlinedInput-notchedOutline': {
                                        //         borderColor: '#d2d4d8',
                                        //         borderWidth: '1px !important',
                                        //     },
                                        //     '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        //         borderColor: '#d2d4d8',
                                        //         borderWidth: '1px !important',
                                        //     },
                                        //     "& .MuiOutlinedInput-input::placeholder": {
                                        //         fontSize: "14px",
                                        //     },
                                        // }}
                                        sx={{
                                            '.MuiOutlinedInput-root': {
                                                borderRadius: '8px',
                                            },
                                            '.MuiOutlinedInput-notchedOutline': {
                                                // borderColor: '#DFE4EA',
                                                borderColor: '#DFE4EA',
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#DFE4EA !important',
                                            },
                                            '&.Mui-focused .MuiOutlinedI nput-notchedOutline': {
                                                borderColor: '#00ADEF',
                                            },
                                            '&.MuiInputBase-input::placeholder': {
                                                color: '#9CA3AF', // Placeholder color
                                                fontSize: '14px', // Placeholder font size
                                            },
                                            '& .Mui-disabled': {
                                                color: '#58585A', // Disabled text color
                                            },
                                            "& .MuiOutlinedInput-input::placeholder": {
                                                fontSize: "14px",
                                            },
                                            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                borderColor: "#00ADEF !important", // 👈 force black border on focus
                                                borderWidth: '1px', // 👈 Force border 1px on focus
                                            },
                                        }}
                                        fullWidth
                                        className='rounded-lg'
                                    />
                                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                        <span className="text-[13px]">{watch('reason')?.length || 0} / 255</span>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-8">
                                    <button type="button" onClick={handleClose} className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500">
                                        {`Cancel`}
                                    </button>

                                    <button type="submit" className="w-[167px] font-semibold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
                                        {`${mode == 'accept' ? 'Approve' : 'Reject'}`}
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

export default ModalAcceptReject;