import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Dialog, DialogPanel } from '@headlessui/react'
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

type FormData = {
    timestamps: string;
    gasDay: string;
};

type FormExampleProps = {
    data: any;
    open: boolean;
    onClose: () => void;
    onSubmitUpdate: SubmitHandler<FormData>;
    //   modeShowDiv: any;
};

const ModalTimestamps: React.FC<FormExampleProps> = ({
    open,
    onClose,
    data,
    onSubmitUpdate
    //   modeShowDiv
}) => {
    const { register, handleSubmit, setValue, reset, formState: { errors }, watch } = useForm<FormData>({
        defaultValues: data,
    });
    const labelClass = "block mb-2 text-sm font-light"
    const selectboxClass = "flex w-full h-[44px] p-1 ps-1 pe-2 !rounded-lg text-gray-900 text-sm block outline-none"
    const textErrorClass = "text-red-500 text-sm"
    const inputClass = "text-sm block md:w-full p-2 ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"

    return (
        <Dialog open={open} onClose={onClose} className="relative z-20">
            {/* <div className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity" /> */}
            <div className={["fixed inset-0 bg-black/45", "transition-opacity duration-100 ease-out", open ? "opacity-100" : "opacity-0 pointer-events-none"].join(" ")} />
            <div className="fixed inset-0 z-10 flex items-center justify-center">
                <DialogPanel
                    transition
                    className="flex w-auto transform transition-all bg-white inset-0 rounded-lg text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                >
                    <div className="flex flex-col items-center gap-2 p-9">
                        <div className="mb-4 w-[300px]">
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`Timestamps Display`}</h2>

                            <form onSubmit={handleSubmit(onSubmitUpdate)} >

                                <div className='pb-2'>
                                    <label className={labelClass}><span className="text-red-500">*</span>{`Gas Day`}</label>
                                    <input
                                        type="date"
                                        {...register('gasDay')}
                                        className={`${inputClass} ${errors.gasDay && 'border-red-500'}`}
                                    />
                                    {errors.gasDay && <p className={`${textErrorClass}`}>{errors.gasDay.message}</p>}
                                </div>

                                <div className='pb-2'>
                                    <label className={labelClass}><span className="text-red-500">*</span>{`Timestamps`}</label>
                                    <Select
                                        {...register('timestamps', { required: "Select Timestamps" })}
                                        value={watch('timestamps') || ''}
                                        className={`!w-[100%] ${selectboxClass} ${errors.timestamps && 'border-red-500'}`}
                                    >
                                        {/* <MenuItem value="" style={{ color: '#A0A0A0', height: '30px' }}>{""}</MenuItem> */}
                                        <MenuItem value={"1"}>1</MenuItem>
                                        <MenuItem value={"2"}>2</MenuItem>
                                    </Select>
                                    {errors.timestamps && <p className={`${textErrorClass}`}>{errors.timestamps.message}</p>}
                                </div>

                                <div className="flex justify-end pt-8">
                                    <button type="button" onClick={onClose} className="w-[167px] mr-2 font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500">
                                        {`Cancel`}
                                    </button>
                                    <button type="submit" className="w-[167px] mr-2 font-light bg-slate-100 bg-[#1473A1] text-white py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500">
                                        {`Unpublish`}
                                    </button>
                                    <button type="submit" className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
                                        {`Publish`}
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

export default ModalTimestamps;