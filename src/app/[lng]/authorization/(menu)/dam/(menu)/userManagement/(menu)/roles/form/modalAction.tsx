import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { formatFormDate, formatWatchFormDate, getMinDate } from '@/utils/generalFormatter';
import DatePickaForm from '@/components/library/dateRang/dateSelectForm';
import dayjs from 'dayjs';
import { ListItemText, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ModalConfirmSave from '@/components/other/modalConfirmSave';
import Spinloading from '@/components/other/spinLoading';

type FormExampleProps = {
    mode?: 'create' | 'edit' | 'view' | 'dup';
    data?: Partial<any>;
    open: boolean;
    onClose: () => void;
    isLoading?: boolean;
    setisLoading?: any;
    onSubmit: SubmitHandler<any>;
    setResetForm: (reset: () => void) => void;
    //   fetchData: () => Promise<void>; 
};

const ModalactionRole: React.FC<FormExampleProps> = ({
    mode = 'create',
    data = {},
    open,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const { register, handleSubmit, setValue, reset, formState: { errors }, watch } = useForm<any>({
        defaultValues: data,
    });

    const [isLoading, setIsLoading] = useState<boolean>(true);

    // const isReadOnly = mode === 'view';
    const isReadOnly: any = mode === "view" && (data?.start_date && new Date(data?.start_date) < new Date()); // Edit > รายการที่ถึงวันที่ Start date ไปแล้วจะไม่สามารถแก้ไขข้อมูลอะไรได้ นอกจาก End Date (เงื่อนไขคือ D+1) https://app.clickup.com/t/86ervtz5z

    const labelClass = "block mb-2 text-[14px] font-light"
    const inputClass = "text-[14px] block md:w-full p-2 ps-5 focus:!ps-5 hover:!ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"
    const selectboxClass = "flex w-full h-[44px] p-2 ps-[6px] pe-10 !rounded-lg text-gray-900 text-[14px] block outline-none"
    const textErrorClass = "text-red-500 text-[14px]"
    const itemselectClass = "pl-[10px] text-[14px]"
    const [key, setKey] = useState(0);

    // const startDate = new Date();
    const startDate = watch('start_date');
    const formattedStartDate = formatWatchFormDate(startDate);

    {/* Confirm Save */ }
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()

    {/* Confirm Save */ }
    const handleSaveConfirm = async (data?: any) => {
        setIsLoading(true);
         
        // setDataSubmit(data)
        // setModaConfirmSave(true)

        if (mode == 'create') {
            await onSubmit(data);
        } else {
            setDataSubmit(data)
            setModaConfirmSave(true)
        }
    }

    useEffect(() => {
        const fetchAndSetData = async () => {
            setIsLoading(true);
            if (mode === 'create') {
                setValue('start_date', null);
                setValue('end_date', null);
            }
            if (mode === 'dup') {

                 

                setValue('user_type_id', data?.user_type_id || '');
                setValue('name', data?.name || '');
                setValue('start_date', null);
                setValue('end_date', null);
            }
            if (mode === 'edit' || mode === 'view') {
                 
                const formattedStartDate: any = formatFormDate(data?.start_date);
                // const formattedEndDate: any = formatFormDate(data?.end_date);
                // const formattedEndDate: any = data?.end_date ? formatFormDate(data.end_date) : null;
                let formattedEndDate: any = 'Invalid Date';
                if (data?.end_date !== null) {
                    formattedEndDate = formatFormDate(data?.end_date);
                }

                setValue('user_type_id', data?.user_type_id || '');
                setValue('name', data?.name || '');
                setValue('start_date', formattedStartDate);
                setValue('end_date', formattedEndDate);
            }
        }
        fetchAndSetData();
        setTimeout(() => {
            setIsLoading(false);
        }, 300);
    }, [data, mode, setValue]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    const handleClose = () => {
        setIsLoading(true);
        onClose();
    };

    return (
        <>

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
                                <div className="flex flex-col items-center justify-center gap-2 rounded-md w-[700px]">
                                    <Spinloading spin={isLoading} rounded={20} />
                                    <form
                                        // onSubmit={handleSubmit(onSubmit)}
                                        onSubmit={handleSubmit(handleSaveConfirm)}
                                        className='bg-white p-8 rounded-[20px] shadow-lg w-full max-w'
                                    >
                                        <h2 className="text-[24px] font-bold text-[#00ADEF] mb-4 pb-5">{mode === 'create' ? 'Add' : mode === 'edit' ? 'Edit' : mode === 'view' ? 'View' : 'Duplicate'}{` Role`}</h2>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="pb-2">
                                                <label className={labelClass}><span className="text-red-500">*</span>{`User Type`}</label>
                                                <Select
                                                    id='select_role_user_type_id'
                                                    IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                    {...register('user_type_id', { required: true })}
                                                    disabled={isReadOnly || mode == 'edit'}
                                                    value={watch('user_type_id') || ''}
                                                    className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.user_type_id && '!border-red-500'}`}
                                                    sx={{
                                                        '.MuiOutlinedInput-notchedOutline': {
                                                            // borderColor: '#DFE4EA', // Change the border color here
                                                            borderColor: errors.user_type_id && !watch('user_type_id') ? '#FF0000' : '#DFE4EA',
                                                        },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: errors.user_type_id && !watch("user_type_id") ? "#FF0000" : "#d2d4d8",
                                                        },
                                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#d2d4d8',
                                                        },
                                                    }}
                                                    displayEmpty
                                                    renderValue={(value: any) => {
                                                        if (!value) {
                                                            return <Typography color="#9CA3AF" className={isReadOnly ? 'opacity-0' : 'opacity-100'} fontSize={14}>Select User Type</Typography>;
                                                        }
                                                        const periodMap: { [key: number]: string } = {
                                                            2: 'TSO',
                                                            3: 'Shipper',
                                                            4: 'Other',
                                                        };
                                                        return <span className={itemselectClass}>{`${periodMap[value] || ''}`}</span>;
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
                                                    <MenuItem value={2}><ListItemText primary={<Typography fontSize={14}>{"TSO"}</Typography>} /></MenuItem>
                                                    <MenuItem value={3}><ListItemText primary={<Typography fontSize={14}>{"Shipper"}</Typography>} /></MenuItem>
                                                    <MenuItem value={4}><ListItemText primary={<Typography fontSize={14}>{"Other"}</Typography>} /></MenuItem>
                                                </Select>
                                                {errors.user_type_id && !watch('user_type_id') && <p className={`${textErrorClass}`}>{`Select User Type`}</p>}
                                            </div>

                                            <div className="pb-2">
                                                <label className={labelClass}><span className="text-red-500">*</span>{`Role Name`}</label>
                                                <input
                                                    type="text"
                                                    {...register('name', { required: "Enter your Role Name" })}
                                                    className={`${inputClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.name && 'border-red-500'}`}
                                                    placeholder="Enter Role Name"
                                                    readOnly={isReadOnly}
                                                />
                                                {errors.name && <p className={`${textErrorClass}`}>{`Select User Type`}</p>}
                                            </div>

                                            <div className="pb-2">
                                                <label className={labelClass}><span className="text-red-500">*</span>{`Start Date`}</label>

                                                <DatePickaForm
                                                    {...register('start_date', { required: "Select start date" })}
                                                    readOnly={isReadOnly}
                                                    placeHolder="Select Start Date"
                                                    mode={mode == 'dup' ? 'edit' : mode} // ถ้าโหมด == dup ส่ง edit ไปแทน เพราะ conponent datepicka ไม่รองรับโหมด dup ขี้เกียจไปแก้นะ
                                                    valueShow={watch("start_date") ? dayjs(watch("start_date")).format("DD/MM/YYYY") : undefined}
                                                    min={new Date()}
                                                    maxNormalForm={watch('end_date') && watch('end_date')} // ไม่ให้ start_date เกิน end_date
                                                    allowClear
                                                    isError={errors.start_date && !watch("start_date") ? true : false}
                                                    onChange={(e: any) => {
                                                        setValue('start_date', formatFormDate(e)),
                                                            e == undefined && setValue('start_date', null, { shouldValidate: true, shouldDirty: true });

                                                        if (!e) {
                                                            setValue('start_date', null, { shouldValidate: true, shouldDirty: true });
                                                            setValue('end_date', null, { shouldValidate: true, shouldDirty: true });
                                                            setKey((prevKey: any) => prevKey + 1);
                                                        } else {
                                                            setValue('start_date', formatFormDate(e));
                                                        }
                                                    }}
                                                />
                                                {errors.start_date && !watch("start_date") && <p className={`${textErrorClass}`}>{'Select Start Date'}</p>}
                                            </div>

                                            <div className="pb-2">
                                                <label className={labelClass}>{`End Date`}</label>
                                                {/* <DatePickaForm
                                                {...register('end_date')}
                                                readOnly={isReadOnly}
                                                placeHolder="End Date"
                                                // mode={mode}
                                                mode={mode == 'dup' ? 'edit' : mode} // ถ้าโหมด == dup ส่ง edit ไปแทน เพราะ conponent datepicka ไม่รองรับโหมด dup ขี้เกียจไปแก้นะ
                                                min={formattedStartDate || undefined}
                                                valueShow={dayjs(watch("end_date")).format("DD/MM/YYYY")}
                                                allowClear
                                                onChange={(e: any) => { setValue('end_date', formatFormDate(e)), e == undefined && setValue('end_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                            /> */}
                                                {/* <DatePickaForm
                                                {...register('end_date')}
                                                readOnly={!formattedStartDate ? true : isReadOnly}
                                                placeHolder="Select End Date"
                                                mode={mode == 'dup' ? 'edit' : mode} // ถ้าโหมด == dup ส่ง edit ไปแทน เพราะ conponent datepicka ไม่รองรับโหมด dup ขี้เกียจไปแก้นะ
                                                min={formattedStartDate || undefined}
                                                valueShow={watch("end_date") ? dayjs(watch("end_date")).format("DD/MM/YYYY") : "Invalid Date"}
                                                allowClear
                                                onChange={(e: any) => { setValue('end_date', formatFormDate(e)), e == undefined && setValue('end_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                            /> */}

                                                <DatePickaForm
                                                    {...register('end_date')}
                                                    key={"end" + key}
                                                    placeHolder="Select End Date"
                                                    mode={mode == 'dup' ? 'edit' : mode}
                                                    // min={formattedStartDate || undefined}
                                                    min={getMinDate(formattedStartDate)}
                                                    // valueShow={watch("end_date") !== null ? dayjs(watch("end_date")).format("DD/MM/YYYY") : "Invalid Date"}
                                                    valueShow={watch("end_date") ? dayjs(watch("end_date")).format("DD/MM/YYYY") : "Invalid Date"}
                                                    allowClear
                                                    onChange={(e: any) => { setValue('end_date', formatFormDate(e)), e == undefined && setValue('end_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                                    // readOnly={!formattedStartDate ? true : isReadOnly}
                                                    readOnly={!formattedStartDate ? true : (isReadOnly && mode === "view")}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-8">

                                            {
                                                mode == 'view' ? (
                                                    <button type="button" onClick={onClose} className="w-[167px] bg-[#00ADEF] text-white font-bold bg-slate-100  py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500">
                                                        {`Close`}
                                                    </button>
                                                )
                                                    :
                                                    <button type="button" onClick={onClose} className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500">
                                                        {`Cancel`}
                                                    </button>
                                            }

                                            {/* <button type="button" onClick={onClose} className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500">
                                        {`Close`}
                                    </button> */}
                                            {
                                                mode !== 'view' && (
                                                    <button type="submit" className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
                                                        {mode === 'create' ? 'Add' : 'Save'}
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


            {/* Confirm Save */}
            <ModalConfirmSave
                open={modaConfirmSave}
                handleClose={(e: any) => {
                    setModaConfirmSave(false);
                    if (e == "submit") {
                        // onSubmit(dataSubmit)
                        // setTimeout(async () => {
                        //     handleClose();
                        // }, 1000);

                        // setValue('concept_point', null)
                        // setValue('type_concept_point_id', null)

                        setTimeout(async () => {
                            await onSubmit(dataSubmit);
                        }, 100);

                        setTimeout(async () => {
                            handleClose();
                        }, 1000);
                    }
                    else{
                        setIsLoading(false);
                    }
                }}
                title="Confirm Save"
                description={
                    <div>
                        <div className="text-center">
                            {`Do you want to save the changes ? `}
                        </div>
                    </div>
                }
                menuMode="confirm-save"
                btnmode="split"
                btnsplit1="Save"
                btnsplit2="Cancel"
                stat="none"
            />

        </>

    );
};

export default ModalactionRole;