import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TextField, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Spinloading from '@/components/other/spinLoading';

type FormData = {
    status: string;
    reason: string;
};

type FormExampleProps = {
    dataUser: any;
    data: any;
    open: boolean;
    onClose: () => void;
    onSubmitUpdate: SubmitHandler<FormData>;
    setResetForm: (reset: () => void) => void;
    //   modeShowDiv: any;
};

const ModalUpdateStat: React.FC<FormExampleProps> = ({
    open,
    onClose,
    dataUser,
    data,
    onSubmitUpdate,
    setResetForm
    //   modeShowDiv
}) => {
    const { register, handleSubmit, setValue, reset, formState: { errors }, watch } = useForm<FormData>({
        defaultValues: data,
    });

    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(false);
        // v2.0.22 ฺButton status user แสดงแปลกๆ เมื่อมีการ Update status นั้นๆ ซ้ำ https://app.clickup.com/t/86et7pqbr
        if (dataUser?.status) {
            setValue("status", '2')
        } else {
            setValue("status", '1')
        }
    }, [dataUser])

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    const labelClass = "block mb-2 text-sm font-light"
    const selectboxClass = "flex w-full h-[44px] p-1 ps-1 pe-2 !rounded-lg text-gray-900 text-sm block outline-none"
    const textErrorClass = "text-red-500 text-sm"

    // clear state when closes
    const handleClose = () => {
        onClose();
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
                    <Spinloading spin={isLoading} rounded={20} />
                    <div className="flex flex-col items-center gap-2 p-9">
                        <div className="w-[450px]">
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`Update Status`}</h2>
                            <div className="mb-4 w-[100%]">
                                <div className="grid grid-cols-2 text-sm font-semibold w-[450px]">
                                    <p className='font-light pb-2 w-[75%]'>{`User ID`} </p> <p>: {dataUser?.user_id || '-'}</p>
                                    <p className='font-light pb-2 w-[75%]'>{`Company/Group Name`} </p> <p>: {dataUser?.company_name || '-'}</p>
                                    <p className='font-light pb-2 w-[75%]'>{`First Name`} </p> <p>: {dataUser?.first_name || '-'}</p>
                                    <p className='font-light pb-2 w-[75%]'>{`Last Name`} </p> <p>: {dataUser?.last_name || '-'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4 w-[100%]">
                            <form
                                // onSubmit={handleSubmit(onSubmitUpdate)} 
                                // onSubmit={handleSubmit(async (data) => { // clear state when submit
                                //     await onSubmitUpdate(data);
                                //     reset();
                                // })}
                                onSubmit={handleSubmit(async (data) => { // clear state when submit
                                    setIsLoading(true);
                                    setTimeout(async () => {
                                        await onSubmitUpdate(data);
                                    }, 100);
                                })}
                            >
                                <div className='pb-2'>
                                    <label className={labelClass}><span className="text-red-500">*</span>{`Status`}</label>
                                    <Select
                                        id='select_user_status_in_modal'
                                        IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                        {...register('status', { required: "Select Status" })}
                                        value={watch('status') || ''}
                                        disabled={true}
                                        className={`!w-[100%] ${selectboxClass} ${errors.status && 'border-red-500'}`}
                                        displayEmpty
                                        sx={{
                                            '.MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#DFE4EA', // Change the border color here
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#d2d4d8',
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#d2d4d8',
                                            },
                                        }}
                                        renderValue={(value: any) => {
                                            if (!value) {
                                                return <Typography color="#9CA3AF" fontSize={15}>Select Status</Typography>;
                                            }
                                            const periodMap: { [key: string]: string } = {
                                                "1": 'Active',
                                                "2": 'Inactive',
                                            };
                                            return periodMap[value] || '';
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
                                        <MenuItem value={"1"} sx={{ fontSize: "14px", color: "#333333" }}>Active</MenuItem>
                                        <MenuItem value={"2"} sx={{ fontSize: "14px", color: "#333333" }}>Inactive</MenuItem>
                                    </Select>
                                    {errors.status && <p className={`${textErrorClass}`}>{errors.status.message}</p>}
                                </div>

                                <div>
                                    <label className={labelClass}>{`Reason`}</label>
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
                                        placeholder='Enter Reason'
                                        rows={6}
                                        // sx={{
                                        //     '.MuiOutlinedInput-root': {
                                        //         borderRadius: '8px',
                                        //         padding: 0.6
                                        //     },
                                        //     '.MuiOutlinedInput-notchedOutline': {
                                        //         borderColor: '#DFE4EA',
                                        //     },
                                        //     '&:hover .MuiOutlinedInput-notchedOutline': {
                                        //         borderColor: '#d2d4d8',
                                        //     },
                                        //     '&.Mui-focused .MuiOutlinedI nput-notchedOutline': {
                                        //         borderColor: '#d2d4d8',
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
                                        className='rounded-lg p-0'
                                    />
                                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                        <span className="text-[13px]">{watch('reason')?.length || 0} / 255</span>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-8">
                                    <button type="button" onClick={handleClose} className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500">
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