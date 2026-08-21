import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useEffect, useState } from "react";
import { getService } from '@/utils/postService';
import { formatFormDate, formatWatchFormDate, getMinDate } from '@/utils/generalFormatter';
import DatePickaForm from '@/components/library/dateRang/dateSelectForm';
import dayjs from 'dayjs';
import { ListItemText, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Spinloading from '@/components/other/spinLoading';
import SelectFormProps from '@/components/other/selectProps';

type FormData = {
    email: string;
    start_date: Date | undefined | null;
    end_date: Date | undefined | null;
    detail: string;
    address: string;
    first_name: string;
    last_name: string;
    telephone: string;
    user_id: string;
    status: string;
    mode_account_id: any;
    division_id: string;
    user_type_id: number;
    group_id: string;
    // role_manage: string[]; // CASE MULTISELECT
    role_manage: string;
    role: any;
};

type FormExampleProps = {
    mode?: 'create' | 'edit' | 'view';
    data?: Partial<any>;
    open: boolean;
    dataDivNotUse: any;
    userTypeMasterData: any;
    dataUserToEdit: any;
    dataRole: any;
    setSelectedCompany?: any;
    setSelectedDiv?: any;
    onClose: () => void;
    onSubmit: SubmitHandler<FormData>;
    setResetForm: (reset: () => void) => void;
    isLoading?: boolean;
    setIsLoading?: any
};


const ModalAction: React.FC<FormExampleProps> = ({
    mode = 'create',
    data = {},
    open,
    dataDivNotUse,
    userTypeMasterData,
    dataUserToEdit,
    dataRole,
    setSelectedCompany,
    setSelectedDiv,
    onClose,
    onSubmit,
    setResetForm,
    isLoading = true,
    setIsLoading
}) => {
    const { control, register, handleSubmit, setValue, reset, clearErrors, resetField, formState: { errors, isValid }, watch, } = useForm<FormData>({
        defaultValues: data,
    });

    const labelClass = "block mb-2 text-[14px] font-light"
    const inputClass = "text-[14px] block md:w-full p-2 ps-5 focus:!ps-5 hover:!ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"
    const selectboxClass = "flex w-full h-[44px] p-2 ps-[7px] pe-10 !rounded-lg text-gray-900 text-[14px] block outline-none"
    const textErrorClass = "text-red-500 text-[14px]"
    const itemselectClass = "pl-[10px] text-[14px]"

    // const isReadOnly = mode === 'view';
    // const isReadOnly: any = mode === "view" || (data?.start_date && new Date(data?.start_date) < new Date()); // Edit > รายการที่ถึงวันที่ Start date ไปแล้วจะไม่สามารถแก้ไขข้อมูลอะไรได้ นอกจาก End Date (เงื่อนไขคือ D+1) https://app.clickup.com/t/86ervtz5z

    // ยังทดสอบไม่ได้ เนื่องจากไม่สามารถแก้ไขข้อมูลใดๆได้เมื่อเลยวัน start date แล้ว ซึ่งสำหรับ user เมื่อเลยวัน start date ต้องเปิดให้แก้ไขได้หมด ยกเว้น email และวัน start date https://app.clickup.com/t/86ernzz0c
    const isReadOnly: any = mode === "view"

    const startDate = watch('start_date');
    // const startDate = new Date();
    let formattedStartDate: any = formatWatchFormDate(startDate);
    const [formatEdit, setformatEdit] = useState<any>();
    const [isBeforeStartDate, setIsBeforeStartDate] = useState<boolean>();
    const [companyData, setCompanyData] = useState<any>([]);
    const [divisionData, setDivisionData] = useState<any>([]);
    const [roleDefault, setRoleDefault] = useState<any>([]);
    const [masterDefaultRole, setMasterDefaultRole] = useState<any>([]);
    const [masterRole, setMasterRole] = useState<any>([]);
    const [key, setKey] = useState(0);
    const currentDate = new Date();

    const fetchData = async (data: any) => {
        const { name, value } = data
        const id = parseInt(value)

        try {
            // Group (2 = TSO, 3 = Shipper, 4 = Other)
            if (value) {
                const response: any = await getService(`/master/account-manage/group-master?user_type=${id}`);
                // const response: any = await getService(`/master/account-manage/group-master?user_type=${watch("user_type_id")}`);
                const filteredCompanies = response?.filter((company: any) => {
                    const endDate = new Date(company.end_date);
                    return (
                        (company.end_date == null || endDate >= currentDate) && // Keep if end_date is null or in the future
                        company.status === true // Keep if status is true
                    );
                });
                setCompanyData(filteredCompanies)
            }

            const response_role: any = await getService(`/master/account-manage/role-master`);
            const filteredRoles = response_role?.filter((item: any) => {
                const currentDate = new Date(); // Get today's date
                const startDate: any = item.start_date ? new Date(item.start_date) : null;
                const endDate = new Date(item.end_date);
                return (
                    (item.end_date == null || endDate >= currentDate) && // กรอง end_date ยังมาไม่ถึงหรือเป็น null
                    startDate <= currentDate && // กรองอันที่ start_date เริ่มไปแล้ว
                    item.active === true
                );
            });
            setMasterRole(filteredRoles)

             
            // const filterRole = response_role?.filter((item:any) => item.user_type.id === 3);
            // setDataDefaultRole(filterRole);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    const fetchDataEdit = async (data: any) => {
        const { name, value } = data
        const id = parseInt(value)
        try {
            // Group (2 = TSO, 3 = Shipper, 4 = Other)
            // const response: any = await getService(`/master/account-manage/group-master?user_type=${id}`);
            if (dataUserToEdit?.account_manage[0]?.user_type_id) {
                const response: any = await getService(`/master/account-manage/group-master?user_type=${dataUserToEdit?.account_manage[0]?.user_type_id}`);
                const filteredComp = response?.filter((item: any) => {
                    const endDate = new Date(item.end_date);
                    return (
                        (item.end_date == null || endDate >= currentDate) &&
                        item.status === true
                    );
                });
                setCompanyData(filteredComp)

                // const response_role: any = await getService(`/master/account-manage/role-master`);
                // setMasterDefaultRole(response_role)

                const filterComp: any = response?.filter((item: any) => item.id === watch("group_id"));
                setDivisionData(filterComp[0]?.division)
                setRoleDefault(filterComp[0]?.role_default)
            }

        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    const getRoleMaster = async () => {
        const response_role: any = await getService(`/master/account-manage/role-master`);
        const filteredRoles = response_role?.filter((item: any) => {
            const endDate = new Date(item.end_date);
            return (
                (item.end_date == null || endDate >= currentDate) &&
                item.active === true
            );
        });
        setMasterRole(filteredRoles)
    }

    useEffect(() => {
        fetchDataEdit({ name: '', value: watch("user_type_id") });
    }, [dataUserToEdit])

    const getDivision = async (data: any) => {
        const { name, value } = data
        const filterComp: any = companyData?.filter((item: any) => item.id === value);

        setDivisionData(filterComp[0]?.division)
        setRoleDefault(filterComp[0]?.role_default)
    };

    useEffect(() => {
        const fetchAndSetData = async () => {
            if (mode === 'create') {
                setValue('group_id', '');
                setValue('division_id', '');
                setValue('status', '1');
                setValue('start_date', null);
                setValue('end_date', null);
                setKey((prevKey) => prevKey + 1);
                setResetForm(() => reset);
                setformatEdit(undefined);
                getRoleMaster();
                setIsLoading(false);
            }
            if (mode === 'edit' || mode === 'view') {
                try {
                    setIsLoading(true);
                    // const response_role: any = await getService(`/master/account-manage/role-master`);
                    // setMasterRole(response_role);

                    // กรอง role ที่หมด end_date หรือ active = false ออก
                    const response_role: any = await getService(`/master/account-manage/role-master`);
                    const filteredRoles = response_role?.filter((item: any) => {
                        const endDate = new Date(item.end_date);
                        return (
                            (item.end_date == null || endDate >= currentDate) &&
                            item.active === true
                        );
                    });

                    setMasterRole(filteredRoles)

                    const formattedStartDate: any = formatFormDate(data?.start_date);

                    setformatEdit(formatFormDate(data?.start_date));
                    let formattedEndDate: any = 'Invalid Date';
                    if (data?.end_date !== null) {
                        formattedEndDate = formatFormDate(data?.end_date);
                    }

                    setValue('email', data?.email || '');
                    setValue('start_date', formattedStartDate);
                    setValue('end_date', formattedEndDate);
                    setValue('detail', data?.detail || '');
                    setValue('address', data?.address || '');
                    setValue('first_name', data?.first_name || '');
                    setValue('last_name', data?.last_name || '');
                    setValue('telephone', data?.telephone || '');
                    setValue('user_id', data?.user_id || '');
                    setValue('status', data?.status || '');
                    // setValue('mode_account_id', data?.mode_account_id || 2); // 2 = LOCAL
                    setValue('mode_account_id', data?.login_mode == "LOCAL" ? "2" : "1"); // 2 = LOCAL
                    setValue('division_id', dataUserToEdit?.account_manage[0]?.division_id || '');
                    setValue('user_type_id', data?.user_type_id || 0);
                    setValue('group_id', dataUserToEdit?.account_manage[0]?.group_id || '');
                    setValue('role_manage', data?.role?.length > 0 ? data.role[0]?.role_id : '');

                    await fetchData({
                        name: "",
                        value: data?.user_type_id
                    }
                    );

                    let filter_role = masterRole?.filter((role: any) => role?.user_type_id === Number(data?.user_type_id))
                    setMasterDefaultRole(filter_role) // ถ้าโหมด edit ให้ role กรองตาม user type มาเลย

                    setTimeout(() => {
                        if (data) { setIsLoading(false); }
                    }, 100);
                } catch (error) {
                    // Error fetching or setting data
                }
            }
        };
        fetchAndSetData();
    }, [data, mode, setValue]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    const handleClose = () => {
        // change onclose to this under these condition
        // 1. when close show another modal ask "do you want to save"
        // 2. in that modal have 2 button "cancel" and "save"
        // 3. if click cancel then call onclose function
        // 4. if click save then call function handleSubmit(onSubmit)

        // setMasterDefaultRole([]);

        // // setRoleDefault([])
        // setSelectedCompany();
        // setSelectedDiv();
        // resetField('group_id');
        // resetField('division_id');
        // reset();

        setTimeout(() => {
            onClose();
        }, 100);
    };

    useEffect(() => {
        const isBeforeStart = data?.start_date ? dayjs().isBefore(dayjs(data?.start_date)) : false; // วันนี้อยู่ก่อนวัน start_date ป่าว
        setIsBeforeStartDate(isBeforeStart)
        // watch('start_date') 2033-09-01
    }, [watch('start_date'), data])

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
                            <div className="flex flex-col items-center justify-center gap-2 rounded-md w-[900px]">
                                <Spinloading spin={isLoading} rounded={20} /> {/* loading example here */}
                                <form
                                    className='bg-white p-8 rounded-[20px] shadow-lg w-full max-w'
                                    onSubmit={handleSubmit(async (data) => {
                                        setIsLoading(true);
                                        setTimeout(() => {
                                            onSubmit(data);
                                        }, 100);
                                    })}
                                >
                                    <h2 className="text-[24px] font-bold text-[#00ADEF] mb-4 pb-5">{mode === 'create' ? 'Add' : mode === 'edit' ? 'Edit' : 'View'}{` User`}</h2>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label
                                                htmlFor="mode_account_id"
                                                className={labelClass}
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Login Mode`}
                                            </label>
                                            <Select
                                                id="mode_account_id"
                                                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                {...register("mode_account_id", {
                                                    required: "Select User Type"
                                                })}
                                                disabled={isReadOnly || mode == "create"}
                                                value={watch("mode_account_id") || ''}
                                                className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${mode == "create" && "!bg-[#EFECEC]"} ${errors.mode_account_id && "border-red-500"}`}
                                                sx={{
                                                    '.MuiOutlinedInput-notchedOutline': { borderColor: errors.mode_account_id && !watch('mode_account_id') ? '#FF0000' : '#DFE4EA' },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: errors.mode_account_id && !watch("mode_account_id") ? "#FF0000" : "#d2d4d8" },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#d2d4d8' },
                                                }}
                                                onChange={(e) => {
                                                    setValue("mode_account_id", Number(e.target.value));
                                                }}
                                                renderValue={(selected) => {
                                                    if (!selected || selected && selected?.length <= 0) {
                                                        return <Typography color="#9CA3AF" className={isReadOnly ? 'opacity-0' : 'opacity-100'} fontSize={14}>Select Login Mode</Typography>;
                                                    }
                                                    return <span className={itemselectClass}>{selected == 1 ? "SSO" : selected == 2 ? "LOCAL" : ''}</span>;
                                                }}
                                                MenuProps={{
                                                    PaperProps: {
                                                        style: {
                                                            maxHeight: 48 * 4.5 + 8, // Item height * 4.5 + padding
                                                        },
                                                    },
                                                }}
                                            >
                                                <MenuItem value="1"><ListItemText primary={<Typography fontSize={14}>{`SSO`}</Typography>} /></MenuItem>
                                                <MenuItem value="2"><ListItemText primary={<Typography fontSize={14}>{`LOCAL`}</Typography>} /></MenuItem>
                                            </Select>
                                            {errors.mode_account_id && <p className={`${textErrorClass}`}>{`Select User Type`}</p>}
                                        </div>

                                        <div className="pb-2">
                                            <label className={labelClass} style={{ marginBottom: '9.5px' }}>
                                                {/* <span className="text-red-500">*</span> */}
                                                {`User ID`}
                                            </label>
                                            <input
                                                type="text"
                                                {...register('user_id')}
                                                readOnly={isReadOnly}
                                                placeholder='Enter User ID'
                                                className={`${inputClass} ${isReadOnly && '!bg-[#EFECEC]'} `}
                                            />
                                            {/* {errors.user_id && <p className={`${textErrorClass}`}>{errors.user_id.message}</p>} */}
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="user_type_id"
                                                className={labelClass}
                                            >
                                                <span className="text-red-500">*</span>
                                                {`User Type`}
                                            </label>
                                            <Select
                                                id="user_type_id"
                                                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                {...register("user_type_id", {
                                                    required: "Select User Type",
                                                })}
                                                disabled={isReadOnly}
                                                value={watch("user_type_id") || ''}
                                                className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.user_type_id && !watch('user_type_id') && "border-red-500"}`}
                                                sx={{
                                                    '.MuiOutlinedInput-notchedOutline': {
                                                        // borderColor: '#DFE4EA', // Change the border color here
                                                        borderColor: errors.user_type_id && !watch('user_type_id') ? '#FF0000' : '#DFE4EA',
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: errors.user_type_id && !watch("user_type_id") ? "#FF0000" : "#d2d4d8"
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#d2d4d8',
                                                    },
                                                }}
                                                onChange={(e) => {
                                                    // setValue("user_type_id", e.target.value);
                                                    setValue("user_type_id", Number(e.target.value));
                                                    setValue("group_id", '');
                                                    setValue("division_id", '');
                                                    setValue("role_manage", '');
                                                    let filter_role = masterRole?.filter((role: any) => role?.user_type_id === Number(e.target.value))
                                                    setMasterDefaultRole(filter_role)
                                                    fetchData(e?.target);
                                                }}
                                                displayEmpty
                                                renderValue={(value: any) => {
                                                    if (!value) {
                                                        return <Typography color="#9CA3AF" className={isReadOnly ? 'opacity-0' : 'opacity-100'} fontSize={14}>Select User Type</Typography>;
                                                    }
                                                    return <span className={itemselectClass}>{`${userTypeMasterData?.find((item: any) => item.id === value)?.name || ''} Selected`}</span>;
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
                                                {(userTypeMasterData || [])?.map((item: any) => (
                                                    <MenuItem key={item.id} value={item.id}>
                                                        <ListItemText primary={<Typography fontSize={14}>{item.name}</Typography>} />
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.user_type_id && !watch('user_type_id') && <p className={`${textErrorClass}`}>{errors.user_type_id.message}</p>}
                                        </div>

                                        <div className="pb-2">
                                            <label className={labelClass}><span className="text-red-500">*</span>
                                                {/* {`Company/Group Name`} */}
                                                {`Group Name`}
                                            </label>

                                            <SelectFormProps
                                                id={'group_id'}
                                                register={register("group_id", { required: "Select Group Name" })}
                                                disabled={isReadOnly}
                                                valueWatch={watch("group_id") || ''}
                                                handleChange={(e) => {
                                                    setValue('group_id', e.target.value);
                                                    getDivision(e?.target);
                                                    setValue("division_id", '');
                                                    setValue("role_manage", '');
                                                    if (errors?.group_id) { clearErrors('group_id') }
                                                }}
                                                errors={errors?.group_id}
                                                errorsText={'Select Group Name'}
                                                options={companyData}
                                                optionsKey={'id'}
                                                optionsValue={'id'}
                                                optionsText={'name'}
                                                optionsResult={'name'}
                                                placeholder={'Select Group Name'}
                                                pathFilter={'name'}
                                            />
                                        </div>

                                        <div className="pb-2">
                                            {/* <label className={labelClass}><span className="text-red-500">*</span>{`Division Name`}</label> */}
                                            <label className={labelClass} style={{ marginBottom: '9.5px' }}>{`Division Name`}</label>
                                            <SelectFormProps
                                                id={'division_id'}
                                                register={register("division_id", { required: false })}
                                                disabled={isReadOnly}
                                                valueWatch={watch("division_id") || ''}
                                                handleChange={(e) => {
                                                    setValue("division_id", e.target.value);
                                                    if (errors?.division_id) { clearErrors('division_id') }
                                                }}
                                                errors={errors?.division_id}
                                                errorsText={'Select Division Name'}
                                                options={divisionData}
                                                optionsKey={'id'}
                                                optionsValue={'id'}
                                                optionsText={'division_name'}
                                                optionsResult={'division_name'}
                                                placeholder={'Select Division Name'}
                                                pathFilter={'division_name'}
                                            />

                                        </div>

                                        <div className="pb-2">
                                            <label className={labelClass}>
                                                <span className="text-red-500">*</span>{`Role`}
                                            </label>
                                            <SelectFormProps
                                                id={'role_manage'}
                                                register={register("role_manage", { required: "Select Role" })}
                                                disabled={isReadOnly}
                                                valueWatch={watch("role_manage") || ''}
                                                handleChange={(e) => {
                                                    setValue("role_manage", e.target.value);
                                                    if (errors?.role_manage) { clearErrors('role_manage') }
                                                }}
                                                errors={errors?.role_manage}
                                                errorsText={'Select Role'}
                                                options={masterDefaultRole}
                                                optionsKey={'id'}
                                                optionsValue={'id'}
                                                optionsText={'name'}
                                                optionsResult={'name'}
                                                placeholder={'Select Role'}
                                                pathFilter={'name'}
                                            />
                                        </div>

                                        <div className="pb-2">
                                            <label className={labelClass}><span className="text-red-500">*</span>{`First Name`}</label>
                                            <input
                                                type="text"
                                                {...register('first_name', { required: "Enter First Name" })}
                                                placeholder='Enter First Name'
                                                readOnly={isReadOnly}
                                                className={`${inputClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.first_name && 'border-red-500'}`}
                                            />
                                            {errors.first_name && <p className={`${textErrorClass}`}>{errors.first_name.message}</p>}
                                        </div>

                                        <div className="pb-2">
                                            <label className={labelClass}><span className="text-red-500">*</span>{`Last Name`}</label>
                                            <input
                                                type="text"
                                                {...register('last_name', { required: "Enter Last Name" })}
                                                placeholder='Enter Last Name'
                                                readOnly={isReadOnly}
                                                className={`${inputClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.last_name && 'border-red-500'}`}
                                            />
                                            {errors.last_name && <p className={`${textErrorClass}`}>{errors.last_name.message}</p>}
                                        </div>

                                        <div className="pb-2">
                                            <label className={labelClass} style={{ marginBottom: '9.5px' }}>{`Telephone`}</label>
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
                                            {errors.telephone && (<p className={`${textErrorClass}`}>{errors.telephone.message}</p>)}
                                        </div>

                                        <div className="pb-2">
                                            <label className={labelClass}>
                                                <span className="text-red-500">*</span>
                                                {`Email`}
                                            </label>

                                            {/* <input
                                                type="email"
                                                {...register("email", { required: "Enter Email" })}
                                                placeholder="Enter Email"
                                                className={`${inputClass} 
                                                    ${isReadOnly && '!bg-[#EFECEC]'} 
                                                    ${(mode === 'edit' && isBeforeStartDate) && '!bg-[#DFE4EA]'} 
                                                    ${errors.email && "border-red-500"}
                                                `}
                                                readOnly={isReadOnly && isBeforeStartDate}
                                                disabled={mode === "edit" && isBeforeStartDate}
                                                onInput={(e: any) => (e.target.value = e.target.value.toLowerCase())}
                                            /> */}

                                            <input
                                                type="email"
                                                {...register('email', { required: "Enter Email" })}
                                                placeholder="Enter Email"
                                                className={`${inputClass} 
                                                    ${isReadOnly && '!bg-[#EFECEC]'} 
                                                    ${(mode === 'edit' && !isBeforeStartDate) && '!bg-[#DFE4EA]'} 
                                                    ${errors.email && 'border-red-500'}
                                                `}
                                                readOnly={isReadOnly && !isBeforeStartDate}
                                                disabled={mode === 'edit' && !isBeforeStartDate}
                                                onInput={(e: any) => (e.target.value = e.target.value.toLowerCase())} // Convert input to lowercase
                                            />

                                            {errors.email && <p className={`${textErrorClass}`}>{errors.email.message}</p>}
                                        </div>


                                        <div className="pb-2 col-span-2">
                                            <label htmlFor="address" className={labelClass} style={{ marginBottom: '9.5px' }}>
                                                {`Address`}
                                            </label>
                                            <input
                                                type="text"
                                                {...register('address')}
                                                className={`${inputClass} ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                placeholder="Enter Address"
                                                readOnly={isReadOnly}
                                            />
                                        </div>

                                        <div className="pb-2">
                                            <label className={labelClass}><span className="text-red-500">*</span>{`Start Date`}</label>
                                            <DatePickaForm
                                                // key={"start" + key}
                                                {...register('start_date', { required: "Select start date" })}
                                                // readOnly={isReadOnly}
                                                readOnly={mode == 'create' || isBeforeStartDate ? false : true} // v2.0.98-test Edit ในกรณีที่ยังไม่ถึง Start Date Field Start Date ต้องแก้ไขได้ https://app.clickup.com/t/86euzxx7j
                                                placeHolder="Select Start Date"
                                                mode={mode}
                                                valueShow={dayjs(watch("start_date")).format("DD/MM/YYYY")}
                                                // min={formatEdit}
                                                // min={formatEdit || formattedStartDate || undefined}
                                                min={new Date()}
                                                maxNormalForm={watch('end_date') && watch('end_date')} // ไม่ให้ start_date เกิน end_date
                                                allowClear
                                                isError={errors.start_date && !watch("start_date") ? true : false}
                                                onChange={(e: any) => {
                                                    if (e && watch('start_date')) {
                                                        setValue('start_date', formatFormDate(e));
                                                        setValue('end_date', null, { shouldValidate: true, shouldDirty: true });
                                                        setKey((prevKey) => prevKey + 1);
                                                    }
                                                    if (!e) {
                                                        setValue('start_date', null, { shouldValidate: true, shouldDirty: true });
                                                        setValue('end_date', null, { shouldValidate: true, shouldDirty: true });
                                                        setKey((prevKey) => prevKey + 1);
                                                    } else {
                                                        setValue('start_date', formatFormDate(e));
                                                    }
                                                }}

                                            />
                                            {errors.start_date && !watch("start_date") && <p className={`${textErrorClass}`}>{'Select Start Date'}</p>}
                                        </div>
                                        <div className="pb-2">
                                            <label className={labelClass} style={{ marginBottom: '9.5px' }}>{`End Date`}</label>
                                            <DatePickaForm
                                                key={"end" + key}
                                                {...register('end_date')}
                                                // readOnly={!formattedStartDate ? true : isReadOnly}
                                                readOnly={!formattedStartDate ? true : (isReadOnly && mode === "view")}

                                                placeHolder="Select End Date"
                                                mode={mode}
                                                // min={formattedStartDate || undefined}
                                                min={getMinDate(formattedStartDate)}
                                                // min={watch("start_date") || undefined}
                                                // valueShow={watch("end_date") ? dayjs(watch("end_date")).format("DD/MM/YYYY") : undefined}
                                                valueShow={watch("end_date") ? dayjs(watch("end_date")).format("DD/MM/YYYY") : "Invalid Date"}
                                                allowClear
                                                onChange={(e: any) => { setValue('end_date', formatFormDate(e)), e == undefined && setValue('end_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                            />
                                        </div>

                                        <div>
                                            <label className={labelClass}><span className="text-red-500">*</span>{`Status`}</label>
                                            <Select
                                                id='select_user_status'
                                                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                {...register('status', { required: "Select Status" })}
                                                disabled={isReadOnly}
                                                value={watch('status') || ''}
                                                className={`!w-[100%] ${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.status && 'border-red-500'}`}
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
                                                displayEmpty
                                                renderValue={(value: any) => {
                                                    if (!value) {
                                                        return <Typography color="#9CA3AF" className={isReadOnly ? 'opacity-0' : 'opacity-100'} fontSize={14}>Select Status</Typography>;
                                                    }
                                                    const periodMap: { [key: string]: string } = { "1": 'Active', "2": 'Inactive' };
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
                                                <MenuItem value={"1"}><ListItemText primary={<Typography fontSize={14}>{'Active'}</Typography>} /></MenuItem>
                                                <MenuItem value={"2"}><ListItemText primary={<Typography fontSize={14}>{'Inactive'}</Typography>} /></MenuItem>
                                            </Select>
                                            {errors.status && <p className={`${textErrorClass}`}>{errors.status.message}</p>}
                                        </div>
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