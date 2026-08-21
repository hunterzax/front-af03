import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Typography } from '@mui/material';
import { opacity } from 'html2canvas/dist/types/css/property-descriptors/opacity';
import Spinloading from '@/components/other/spinLoading';

type FormData = {
    status: string;
    reason: string;
};

type FormExampleProps = {
    data: any;
    open: boolean;
    pathNo: any;
    onClose: () => void;
    onSubmitUpdate: SubmitHandler<FormData>;
    isLoading?: boolean;
    setisLoading?: any
    //   modeShowDiv: any;
};

const ModalUpdateStat: React.FC<FormExampleProps> = ({
    open,
    onClose,
    data,
    pathNo,
    onSubmitUpdate,
    isLoading = false,
    setisLoading
    //   modeShowDiv
}) => {

    const { register, handleSubmit, setValue, reset, formState: { errors }, watch } = useForm<FormData>({
        defaultValues: data,
    });
    const labelClass = "block mb-2 text-sm font-light"
    const selectboxClass = "flex w-full h-[44px] p-1 ps-1 pe-2 !rounded-lg text-gray-900 text-sm block outline-none"
    const textErrorClass = "text-red-500 text-sm"

    useEffect(() => {
        setValue('status', !data?.active ? "1" : "2");

        setTimeout(() => {
            setisLoading(false);
        }, 300);
    }, [data]);

    return (
        <Dialog open={open} onClose={onClose} className="relative z-20">
            {/* <div className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity" /> */}
            <div className={["fixed inset-0 bg-black/45", "transition-opacity duration-100 ease-out", open ? "opacity-100" : "opacity-0 pointer-events-none"].join(" ")} />
            <div className="fixed inset-0 z-10 flex items-center justify-center">
                <DialogPanel
                    transition
                    className="flex w-auto transform transition-all bg-white inset-0 rounded-[20px] text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                >
                    <Spinloading spin={isLoading} rounded={20} />
                    <div className="flex flex-col items-center gap-2 p-5">
                        <div className="w-[300px] ">
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`Update Status`}</h2>
                            <div className="mb-2 w-[100%]">
                                <div className="grid grid-cols-2 text-sm font-semibold w-[200px]">
                                    <p className='font-light w-[75%]'>{`Path No.`} </p> <p>: {pathNo || ''}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4 w-[90%]">
                            <form onSubmit={handleSubmit(onSubmitUpdate)} >
                                <div className='pb-2'>
                                    <label className={labelClass}><span className="text-red-500">*</span>{`Update Status`}</label>
                                    <Select
                                        disabled
                                        id='select_config_master_path_status'
                                        {...register('status', { required: "Select Status" })}
                                        IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                        value={watch('status') || ''}
                                        className={`!w-[100%] ${selectboxClass} ${errors.status && 'border-red-500'}`}
                                        sx={{
                                            '.MuiOutlinedInput-notchedOutline': {
                                                // borderColor: '#DFE4EA', // Change the border color here
                                                borderColor: errors.status && !watch('status') ? '#FF0000' : '#DFE4EA',
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: errors.status && !watch("status") ? "#FF0000" : "#d2d4d8",
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#d2d4d8',
                                            },
                                        }}
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 48 * 4.5 + 8, // Item height * 4.5 + padding
                                                    // width: 250, // Adjust width as needed
                                                },
                                            },
                                        }}
                                    >
                                        {/* <MenuItem value="" style={{ color: '#A0A0A0', height: '30px' }}>{""}</MenuItem> */}
                                        <MenuItem value={"1"} sx={{ fontSize: "14px", color: "#454255" }}>Active</MenuItem>
                                        <MenuItem value={"2"} sx={{ fontSize: "14px", color: "#454255" }}>Inactive</MenuItem>
                                    </Select>
                                    {errors.status && <p className={`${textErrorClass}`}>{errors.status.message}</p>}
                                </div>

                                <div className="flex justify-end pt-8">
                                    <button type="button" onClick={onClose} className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500">
                                        {`Cancel`}
                                    </button>

                                    <button type="submit" className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
                                        {`Update`}
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

export default ModalUpdateStat;