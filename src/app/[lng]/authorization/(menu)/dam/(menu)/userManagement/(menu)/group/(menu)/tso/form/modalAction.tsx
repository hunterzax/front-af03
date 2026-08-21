import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { formatFormDate, formatWatchFormDate, getMinDate, validatePhoneNumber } from '@/utils/generalFormatter';
import DatePickaForm from '@/components/library/dateRang/dateSelectForm';
import dayjs from 'dayjs';
import { Checkbox, InputAdornment, ListItemText, ListSubheader, TextField, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Spinloading from '@/components/other/spinLoading';
import SelectFormProps from '@/components/other/selectProps';
import SearchIcon from '@mui/icons-material/Search';

type FormData = {
    id_name: string;
    name: string;
    user_type_id: string;
    telephone: string;
    email: string;
    start_date: Date | null;
    end_date: Date | null;
    status: string;
    role_default: any;
    division: any;
    division_: any;
};

type FormExampleProps = {
    mode?: 'create' | 'edit' | 'view';
    dataForm?: Partial<FormData>;
    dataDivNotUse: any;
    divNotUseAndUsed: any;
    dataDefaultRole: any;
    dataAllRole?: any;
    dataBank: any;
    open: boolean;
    isLoading: boolean;
    onClose: () => void;
    onSubmit: SubmitHandler<FormData>;
    setResetForm: (reset: () => void) => void;
    setIsLoading: (isLoading: boolean) => void;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode = 'create',
    dataForm = {},
    open,
    isLoading,
    dataDivNotUse,
    divNotUseAndUsed,
    dataDefaultRole,
    dataAllRole = [],
    dataBank,
    onClose,
    onSubmit,
    setResetForm,
    setIsLoading
}) => {
    // division_group_show
    const { register, handleSubmit, setValue, reset, clearErrors, formState: { errors }, watch } = useForm<FormData>({
        defaultValues: dataForm,
    });
    const [isReadOnly, setIsReadOnly] = useState<any>(false);

    // let isReadOnly: any = mode === "view" || (dataForm?.start_date && new Date(dataForm?.start_date) < new Date()); // Edit > รายการที่ถึงวันที่ Start date ไปแล้วจะไม่สามารถแก้ไขข้อมูลอะไรได้ นอกจาก End Date (เงื่อนไขคือ D+1) https://app.clickup.com/t/86ervtz5z



    const labelClass = "block mb-2 text-[14px] font-light"
    const inputClass = "text-[14px] block md:w-full p-2 ps-5 focus:!ps-5 hover:!ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"
    const selectboxClass = "flex w-full h-[44px] p-2 ps-[7px] pe-10 !rounded-lg text-gray-900 text-[14px] block outline-none"
    const textErrorClass = "text-red-500 text-[14px]"
    const itemselectClass = "pl-[10px] text-[14px]"

    const startDate = watch('start_date');
    // const startDate = new Date();
    const formattedStartDate = formatWatchFormDate(startDate);
    const [roleEx, setroleEx] = useState<boolean>(true);
    const [division_option, setdivision_option] = useState<any>([]);
    const [tk, settk] = useState<boolean>(false);

    useEffect(() => {
        // เมื่อปิด modal dataForm จะถูกส่งมาเป็น null ทำให้เข้า resetThis()
        if (dataForm) {
            const fetchAndSetData = async () => {
                if (mode === 'create') {
                    setValue('status', "1");
                    setValue('role_default', null);
                    setIsLoading(false);
                    if (watch('start_date') && !dataForm?.start_date) {
                        setValue('start_date', null);
                    }
                    if (watch('end_date') && !dataForm?.end_date) {
                        setValue('end_date', null)
                    }
                }
                if (mode === 'edit' || mode === 'view') {
                    
                    setIsLoading(true);
                    const formattedStartDate: any = formatFormDate(dataForm?.start_date);
                    // const formattedEndDate: any = formatFormDate(dataForm?.end_date);
                    let formattedEndDate: any = 'Invalid Date'
                    if (dataForm?.end_date !== null) {
                        formattedEndDate = formatFormDate(dataForm?.end_date);
                    }

                    setValue('id_name', dataForm?.id_name || '');
                    setValue('name', dataForm?.name || '');
                    setValue('user_type_id', dataForm?.user_type_id || '');
                    setValue('telephone', dataForm?.telephone || '');
                    setValue('email', dataForm?.email || '');
                    setValue('start_date', formattedStartDate);
                    setValue('end_date', formattedEndDate);
                    setValue('status', dataForm?.status || "1"); // 1 == true, 2 == false
                    setValue('role_default', dataForm?.role_default || []);

                    let checkOption: any = dataDefaultRole?.find((item: any) => item?.id == dataForm?.role_default);

                    if (!checkOption) {
                        setroleEx(false);
                    }
                    // division_group_show
                    console.log('dataForm : ', dataForm);

                    setValue('division', (dataForm?.division && dataForm?.division?.length > 0) ? dataForm?.division?.map((item: any) => item?.id) : dataForm?.division_?.map((item: any) => item?.id) || []);
                    // setSelectedValues(dataForm?.division?.map((item: any) => item?.id));
                    // division_

                    setSelectedValues((dataForm?.division && dataForm?.division?.length > 0) ? dataForm?.division?.map((item: any) => item?.id) : dataForm?.division_?.map((item: any) => item?.id) || []);
                    setTimeout(() => {
                        if (dataForm) { setIsLoading(false); }
                    }, 100);
                }

                setdivision_option((mode === 'edit' || mode === 'view') ? divNotUseAndUsed : dataDivNotUse);
            }
            fetchAndSetData();
        } else {
            // ล้างค่า เผื่อไว้ใน กรณีที่ [reset, setResetForm] ไม่ทำงาน
            resetThis();
        }
    }, [dataForm, mode, setValue]);

    const [selectedValues, setSelectedValues] = useState<any>([]);

    const handleChange = (event: any) => {
        const value = event.target.value;
        // Check if 'Select All' is selected
        if (value.includes('select-all')) {
            // Select all options
            const allValues = mode === 'edit' || mode === 'view' ?
                divNotUseAndUsed?.map((item: any) => item?.id) :
                dataDivNotUse?.map((item: any) => item?.id);

            // If already selected all, unselect all
            if (selectedValues.length === allValues?.length) {
                setSelectedValues([]);
                setValue("division", [])
            } else {
                // Otherwise, select all
                setSelectedValues(allValues || []);
                setValue("division", allValues || [])
            }

            // setSelectedValues(allValues);
        } else {
            setSelectedValues(value);
            setValue("division", value)
        }
    };

    const isAllSelected = () => {
        const allValues = mode === 'edit' || mode === 'view' ?
            divNotUseAndUsed?.map((item: any) => item?.id) :
            dataDivNotUse?.map((item: any) => item?.id);
        return allValues?.length === selectedValues?.length;
    };

    const handleClose = () => {
        onClose();
        setSelectedValues([]);
        resetThis();
    };

    const resetThis = () => {
        setResetForm(() => reset);
        setSelectedValues([]);
        setroleEx(true);
    }

    useEffect(() => {
        if (mode == "create") {
            setIsReadOnly(false)
        } else if (mode == 'view') {
            setIsReadOnly(true)
        } else {
            setIsReadOnly(dataForm?.start_date && new Date(dataForm?.start_date) < new Date())
        }
    }, [mode, dataForm])

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
                            <div className="flex flex-col items-center justify-center gap-2 rounded-md w-[700px]">
                                <Spinloading spin={isLoading} rounded={20} />
                                <form
                                    // onSubmit={handleSubmit(onSubmit)} 
                                    onSubmit={handleSubmit(async (data) => { // clear state when submit
                                        setIsLoading(true);
                                        setTimeout(async () => {
                                            await onSubmit(data);
                                            // setSelectedValues([]);
                                        }, 100);
                                    })}
                                    className='bg-white p-8 rounded-[20px] shadow-lg w-full max-w'
                                >
                                    <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-5">{mode === 'create' ? 'Add' : mode === 'edit' ? 'Edit' : mode === 'view' ? 'View' : 'Duplicate'}{` TSO Group`}</h2>

                                    <div className="grid grid-cols-2 gap-x-[20px] gap-y-2">
                                        <div className="pb-2">
                                            <label className={labelClass}><span className="text-red-500">*</span>{`TSO ID`}</label>
                                            <input
                                                type="text"
                                                {...register('id_name', { required: "Enter Your TSO ID" })}
                                                className={`${inputClass} ${mode === 'edit' && '!bg-[#DFE4EA]'} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.id_name && 'border-red-500'}`}
                                                placeholder="Enter TSO ID"
                                                readOnly={isReadOnly}
                                                disabled={mode === 'edit'}
                                            />
                                            {errors.id_name && <p className={`${textErrorClass}`}>{errors.id_name.message}</p>}
                                        </div>

                                        <div className="pb-2">
                                            <label className={labelClass}><span className="text-red-500">*</span>{`Group Name`}</label>
                                            <input
                                                type="text"
                                                {...register('name', { required: "Enter Your Group Name" })}
                                                className={`${inputClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.name && 'border-red-500'}`}
                                                placeholder="Enter Group Name"
                                                readOnly={isReadOnly}
                                            />
                                            {errors.name && <p className={`${textErrorClass}`}>{errors.name.message}</p>}
                                        </div>

                                        <div className="pb-2">
                                            <label className={labelClass}><span className="text-red-500">*</span>{`Division Name`}</label>
                                            <Select
                                                id='select_tso_division'
                                                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                {...register('division', { required: true })}
                                                disabled={isReadOnly}
                                                value={watch("division") ? Array.isArray(watch("division")) ? watch("division") : [watch("division")] : []}
                                                onChange={handleChange}
                                                multiple
                                                displayEmpty
                                                className={`${selectboxClass} ${errors.division && selectedValues.length <= 0 && '!border-red-500'}`}
                                                sx={{
                                                    '.MuiOutlinedInput-notchedOutline': {
                                                        borderColor: errors.division && selectedValues.length <= 0 ? '#FF0000' : '#DFE4EA',
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: errors.division && !watch("division") ? "#FF0000" : "#d2d4d8",
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#d2d4d8',
                                                    },
                                                }}
                                                renderValue={(selected) => {
                                                    if (selected.length === 0) {
                                                        return <Typography color="#9CA3AF" className={isReadOnly ? 'opacity-0' : 'opacity-100'} fontSize={14}>Select Division Name</Typography>;
                                                    }
                                                    return <span className={`${itemselectClass}`}>{`${selected?.length} Selected`}</span>;
                                                }}
                                                MenuProps={{
                                                    PaperProps: {
                                                        style: {
                                                            maxHeight: 48 * 4.5 + 8, // Item height * 4.5 + padding
                                                        },
                                                    },
                                                    autoFocus: false,
                                                    disableAutoFocusItem: true,
                                                }}
                                                onClose={() => {
                                                    const options: any = (mode === 'edit' || mode === 'view') ? divNotUseAndUsed : dataDivNotUse;
                                                    setTimeout(() => { setdivision_option(options) }, 200)
                                                }}
                                            >

                                                {/* {
                                                division_option?.length >= 5 &&
                                                    <ListSubheader style={{ width: '100%' }}> */}
                                                {
                                                    ((mode === 'edit' || mode === 'view')
                                                        ? divNotUseAndUsed?.length > 0
                                                        : dataDivNotUse?.length > 0
                                                    ) && 
                                                        <ListSubheader style={{ width: '100%' }}>
                                                        <TextField
                                                            size="small"
                                                            // Autofocus on textfield
                                                            autoFocus={true}
                                                            focused
                                                            placeholder="Type to search..."
                                                            // fullWidth
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <InputAdornment position="start">
                                                                        <SearchIcon sx={{ fontSize: 16 }} />
                                                                    </InputAdornment>
                                                                ),
                                                                sx: {
                                                                    fontSize: 14 // <-- ขนาดตัวอักษรนะจ้ะ
                                                                }
                                                            }}
                                                            className='inputSearchk'
                                                            style={{ width: '100%', height: 40 }}
                                                            onChange={(e) => {
                                                                const loadData: any = (mode === 'edit' || mode === 'view') ? divNotUseAndUsed : dataDivNotUse;
                                                                if (e?.target?.value) {
                                                                    const queryLower = e?.target?.value.toLowerCase().replace(/\s+/g, '')?.trim();
                                                                    let newItem: any = loadData?.filter((item: any) => item?.division_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower));

                                                                    setdivision_option(() => newItem);
                                                                    settk(!tk);
                                                                } else {
                                                                    setdivision_option(loadData);
                                                                    settk(!tk);
                                                                }
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key !== "Escape") {
                                                                    e.stopPropagation();
                                                                }
                                                            }}
                                                        />
                                                    </ListSubheader>
                                                }

                                                {/* 'Select All' option */}
                                                {division_option?.length > 0 && (
                                                    <MenuItem value="select-all">
                                                        <Checkbox checked={isAllSelected()} style={{ padding: "0", marginRight: 10 }} />
                                                        <ListItemText primary={<Typography sx={{ fontWeight: 'bold' }} fontSize={14}>All</Typography>} />
                                                    </MenuItem>
                                                )}

                                                {/* Dynamic options */}
                                                {division_option?.length > 0 && division_option?.slice() // เพื่อไม่เปลี่ยนต้นฉบับ
                                                    .sort((a: any, b: any) => {
                                                        const textA = (a?.division_name ?? '').toString().toLowerCase();
                                                        const textB = (b?.division_name ?? '').toString().toLowerCase();
                                                        return textA?.localeCompare(textB);
                                                    }).map((item: any, key: any) => (
                                                        <MenuItem key={item?.id} value={item?.id}>
                                                            <Checkbox checked={selectedValues.indexOf(item?.id) > -1} style={{ padding: "0", marginRight: 10 }} />
                                                            <ListItemText primary={<Typography fontSize={14}>{item?.division_name}</Typography>} />
                                                        </MenuItem>
                                                    ))
                                                }
                                            </Select>
                                            {errors.division && selectedValues.length <= 0 && <p className={`${textErrorClass}`}>{`Select Division Name`}</p>}
                                        </div>

                                        <div className="pb-2">
                                            <label className={labelClass}><span className="text-red-500">*</span>{`Default Role`}</label>

                                            {roleEx == true ?
                                                <SelectFormProps
                                                    id={'role_default'}
                                                    register={register("role_default", { required: "Select default role" })}
                                                    // disabled={isReadOnly || mode !== 'view'}
                                                    disabled={isReadOnly}
                                                    valueWatch={watch("role_default") || ""}
                                                    handleChange={(e) => {
                                                        setValue("role_default", e.target.value);
                                                        if (errors?.role_default) { clearErrors('role_default') }
                                                    }}
                                                    errors={errors?.role_default}
                                                    errorsText={'Select default role'}
                                                    options={dataDefaultRole}
                                                    // options={dataDefaultRole && dataDefaultRole?.filter((item: any) => {
                                                    //     const startDate = new Date(item?.start_date);
                                                    //     const endDate = new Date(item?.end_date);
                                                    //     const today = new Date();

                                                    //     return (
                                                    //         (item?.end_date == null || endDate >= today) && // end_date ยังมาไม่ถึง
                                                    //         (item?.start_date == null || startDate <= today) // start_date เลยมาหรือเท่ากับวันปัจจุบัน
                                                    //     );
                                                    // })}
                                                    optionsKey={'id'}
                                                    optionsValue={'id'}
                                                    optionsText={'name'}
                                                    optionsResult={'name'}
                                                    placeholder={'Select default role'}
                                                    pathFilter={'name'}
                                                />
                                                :
                                                <div className='rounded-lg bg-[#f1f1f1] h-[44px] border-[1px] border-[#DFE4EA] flex justify-between items-center ps-[6px] pe-2'>
                                                    <div className='p-[5px]'><span className='pl-[10px] text-[14px]'>{dataAllRole?.find((item: any) => item?.id == dataForm?.role_default)?.name || ''}</span></div>
                                                    <ExpandMoreIcon fontSize="medium" sx={{ color: '#00000042' }} />
                                                </div>
                                            }
                                        </div>

                                        <div className="pb-2">
                                            <label className={labelClass}>{`Telephone`}</label>
                                            <input
                                                type="text" // Use 'text' type for full control over input validation
                                                {...register('telephone', {
                                                    validate: (value) => {
                                                        // if (!/^\d{10}$/.test(value)) return "Telephone must be exactly 10 digits.";
                                                        // if (!value.startsWith('0')) return "Telephone must start with 0.";
                                                        return true;
                                                    },
                                                })}
                                                className={`${inputClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.telephone && 'border-red-500'}`}
                                                placeholder="Enter Telephone"
                                                readOnly={isReadOnly}
                                                maxLength={10} // Restrict to 10 characters
                                                inputMode="numeric" // Enables numeric keypad on mobile
                                                onInput={(e: any) => e.target.value = e.target.value.replace(/[^0-9]/g, '')} // Filters non-numeric characters
                                            />
                                            {errors.telephone && (
                                                <p className={`${textErrorClass}`}>{errors.telephone.message}</p>
                                            )}
                                        </div>

                                        <div className="pb-2">
                                            <label className={labelClass}>{`Email`}</label>
                                            <input
                                                type="email"
                                                {...register('email')}
                                                className={`${inputClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.email && 'border-red-500'}`}
                                                placeholder="Enter Email"
                                                readOnly={isReadOnly}
                                            />
                                            {errors.email && <p className={`${textErrorClass}`}>{errors.email.message}</p>}
                                        </div>

                                        <div className="pb-2">
                                            <label className={labelClass}><span className="text-red-500">*</span>{`Start Date`}</label>
                                            <DatePickaForm
                                                {...register('start_date', { required: "Select start date" })}
                                                readOnly={isReadOnly}
                                                placeHolder="Select Start Date"
                                                mode={mode}
                                                valueShow={watch("start_date") ? dayjs(watch("start_date")).format("DD/MM/YYYY") : undefined}
                                                // min={formattedStartDate || undefined}
                                                // min={formattedStartDate ? formattedStartDate : new Date() || undefined}
                                                min={new Date()}
                                                maxNormalForm={watch('end_date') && watch('end_date')} // ไม่ให้ start_date เกิน end_date
                                                allowClear
                                                isError={errors.start_date && !watch("start_date") ? true : false}
                                                onChange={(e: any) => { setValue('start_date', formatFormDate(e)), e == undefined && setValue('start_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                                forMode='form'
                                            />
                                            {errors.start_date && !watch("start_date") && <p className={`${textErrorClass}`}>{'Select Start Date'}</p>}
                                        </div>

                                        <div className="pb-2">
                                            <label className={labelClass}>{`End Date`}<span></span></label>
                                            <DatePickaForm
                                                {...register('end_date')}
                                                // readOnly={!formattedStartDate ? true : isReadOnly}
                                                readOnly={!formattedStartDate ? true : (isReadOnly && mode === "view")}
                                                placeHolder="Select End Date"
                                                mode={mode}
                                                // min={formattedStartDate || undefined}
                                                min={getMinDate(formattedStartDate)}
                                                valueShow={watch("end_date") ? dayjs(watch("end_date")).format("DD/MM/YYYY") : undefined}
                                                allowClear
                                                onChange={(e: any) => { setValue('end_date', formatFormDate(e)), e == undefined && setValue('end_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                                forMode='form'
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}><span className="text-red-500">*</span>{`Status`}</label>
                                        <Select
                                            id='select_tso_status'
                                            IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                            {...register('status', { required: "Select Status" })}
                                            disabled={isReadOnly}
                                            value={watch('status') || ''}
                                            className={`!w-[49%] ${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.status && 'border-red-500'}`}
                                            sx={{
                                                '.MuiOutlinedInput-notchedOutline': {
                                                    // borderColor: '#DFE4EA', // Change the border color here
                                                    borderColor: errors.status ? '#FF0000' : '#DFE4EA',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: errors.status && !watch("status") ? "#FF0000" : "#d2d4d8",
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#d2d4d8',
                                                },
                                            }}
                                            displayEmpty
                                            renderValue={(value: any) => {
                                                if (!value) {
                                                    return <Typography color="#9CA3AF" className={isReadOnly ? 'opacity-0' : 'opacity-100'} fontSize={14}>Select Status</Typography>;
                                                }
                                                const periodMap: { [key: string]: string } = {
                                                    "1": 'Active',
                                                    "2": 'Inactive',
                                                };
                                                return <span className={itemselectClass}>{periodMap[value] || ''}</span>;
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
                                            <MenuItem value={"1"}><ListItemText primary={<Typography fontSize={14}>{"Active"}</Typography>} /></MenuItem>
                                            <MenuItem value={"2"}><ListItemText primary={<Typography fontSize={14}>{"Inactive"}</Typography>} /></MenuItem>
                                        </Select>
                                        {errors.status && <p className={`${textErrorClass}`}>{errors.status.message}</p>}
                                    </div>

                                    <div className="flex justify-end pt-8">
                                        {
                                            mode == 'view' ? (
                                                <button type="button" onClick={handleClose} className="w-[167px] bg-[#00ADEF] text-white font-bold bg-slate-100  py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500">
                                                    {`Close`}
                                                </button>
                                            )
                                                :
                                                <button type="button" onClick={handleClose} className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500">
                                                    {`Cancel`}
                                                </button>
                                        }
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
    );
};

export default ModalAction;