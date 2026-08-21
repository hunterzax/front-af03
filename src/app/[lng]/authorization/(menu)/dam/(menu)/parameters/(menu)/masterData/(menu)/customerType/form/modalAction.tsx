import React from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useEffect, useState } from "react";
import { formatDate, formatDateNoTime, formatFormDate, formatWatchFormDate } from '@/utils/generalFormatter';
import { ListItemText, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Spinloading from '@/components/other/spinLoading';

type FormData = {
    name: string;
    description: string;
    entry_exit_id: string;
    start_date: Date;
    end_date: Date;
    color: string;
};

type FormExampleProps = {
    mode?: 'create' | 'edit' | 'view';
    data?: Partial<FormData>;
    open: boolean;
    entryExitMasterData: any;
    onClose: () => void;
    onSubmit: SubmitHandler<FormData>;
    setResetForm: (reset: () => void) => void;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode = 'create',
    data = {},
    entryExitMasterData = {},
    open,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const { control, register, handleSubmit, setValue, reset, formState: { errors }, watch } = useForm<any>({
        defaultValues: data,
    });

    const labelClass = "block mb-2 text-[14px] font-light"
    const inputClass = "text-[14px] block md:w-full p-2 ps-5 focus:!ps-5 hover:!ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"
    const selectboxClass = "flex w-full h-[44px] p-2 ps-[7px] pe-10 !rounded-lg text-gray-900 text-[14px] block outline-none"
    const textErrorClass = "text-red-500 text-[14px]"
    const itemselectClass = "pl-[10px] text-[14px]"

    const pxpyClass = "px-2 py-1 text-[#464255]"
    const isReadOnly = mode === 'view';

    //state
    const [isLoading, setIsLoading] = useState<boolean>(true);

    //load data
    useEffect(() => {
        const fetchAndSetData = async () => {
            if (mode === 'create') {
                setIsLoading(false);
            }
            if (mode === 'edit' || mode === 'view') {
                setIsLoading(true);
                const formattedStartDate: any = formatFormDate(data?.start_date);
                // const formattedEndDate: any = formatFormDate(data?.end_date);
                let formattedEndDate: any = 'Invalid Date'
                if (data?.end_date !== null) {
                    formattedEndDate = formatFormDate(data?.end_date);
                }
                setValue('end_date', formattedEndDate);
                setValue('name', data?.name || '');
                setValue('description', data?.description || '');
                setValue('entry_exit_id', data?.entry_exit_id || '');
                setValue('start_date', formattedStartDate);
                setValue('color', data?.color || '');
                setTimeout(() => {
                    setIsLoading(false);
                }, 300);
            }
        }

        fetchAndSetData();
    }, [data, mode, setValue]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    const [tabIndex, setTabIndex] = useState(0);
    const handleChange = (event: any, newValue: any) => {
        setTabIndex(newValue);
    };

    const handleClose = () => {
        setIsLoading(false);
        onClose();
    }

    return (
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
                        <div className="flex inset-0 items-center justify-center ">
                            <div className="flex flex-col items-center justify-center gap-2 rounded-md">
                                <Spinloading spin={isLoading} rounded={20}/>
                                <form 
                                    className="bg-white p-8 rounded-[20px] shadow-lg max-w  w-[400px]"
                                    onSubmit={handleSubmit(async (data) => { // clear state when submit
                                        setIsLoading(true);
                                        setTimeout(async () => {
                                            await onSubmit(data);
                                        }, 100);
                                    })}
                                >
                                    <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-5">{`New Customer Type`}</h2>
                                    <div className="grid grid-cols-1 gap-2">
                                        <div style={{marginBottom: 10}}>
                                            <label htmlFor="entry_exit_id" className={labelClass}>
                                                <span className="text-red-500">*</span>{`Entry/Exit`}
                                            </label>
                                            <Select
                                                id="entry_exit_id"
                                                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                {...register('entry_exit_id', { required: "Select Entry/Exit" })}
                                                disabled={isReadOnly}
                                                value={watch('entry_exit_id') || ''}
                                                className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.entry_exit_id && 'border-red-500'}`}
                                                sx={{
                                                    '.MuiOutlinedInput-notchedOutline': {
                                                        // borderColor: '#DFE4EA', // Change the border color here
                                                        borderColor: errors.entry_exit_id && !watch('entry_exit_id') ? '#FF0000' : '#DFE4EA',
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: errors.entry_exit_id && !watch("entry_exit_id") ? "#FF0000" : "#d2d4d8",
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#d2d4d8',
                                                    },
                                                }}
                                                onChange={(e) => {
                                                    setValue('entry_exit_id', e.target.value);
                                                }}
                                                displayEmpty
                                                renderValue={(value: any) => {
                                                    if (!value) {
                                                        return <Typography color="#9CA3AF" className={isReadOnly ? 'opacity-0' : 'opacity-100'} fontSize={14}>Select Entry/Exit</Typography>;
                                                    }
                                                    return <span className={itemselectClass}>{entryExitMasterData.find((item: any) => item.id === value)?.name || ''}</span>;
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
                                                {entryExitMasterData?.map((item: any) => (
                                                    <MenuItem key={item.id} value={item.id}>
                                                        <ListItemText primary={<Typography fontSize={14}>{item.name}</Typography>} />
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.entry_exit_id && <p className="text-red-500 text-sm">{`Select Entry / Exit`}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="name" className={labelClass}>
                                                <span className="text-red-500">*</span>{`Customer Type`}
                                            </label>
                                            <input
                                                id="name"
                                                type="text"
                                                placeholder='Enter Customer Type'
                                                readOnly={isReadOnly}
                                                {...register('name', { required: "Enter Customer Type" })}
                                                className={`${inputClass} ${errors.name && 'border-red-500'}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                            />
                                            {errors.name && <p className="text-red-500 text-sm">{`Enter Customer Type`}</p>}
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-6">
                                        {
                                            mode === 'view' ?
                                                <button type="button" onClick={onClose} className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
                                                    {`Close`}
                                                </button>
                                                :
                                                <button type="button" onClick={onClose} className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500">
                                                    {`Cancel`}
                                                </button>
                                        }

                                        {/* <button type="submit" className="w-[167px] font-light bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
                                            Add
                                        </button> */}
                                        {
                                            mode !== 'view' && (
                                                <button type="submit" className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
                                                    {mode === 'create' ? 'Save' : 'Save'}
                                                </button>
                                            )
                                        }
                                    </div>
                                </form>
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
};

export default ModalAction;