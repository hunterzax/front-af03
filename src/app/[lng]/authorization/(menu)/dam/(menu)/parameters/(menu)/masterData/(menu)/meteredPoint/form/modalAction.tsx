import React, { useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import Select from '@mui/material/Select';
import { useEffect, useState } from "react";
import { formatFormDate, formatWatchFormDate, getMinDate, toDayjs } from '@/utils/generalFormatter';
import DatePickaForm from '@/components/library/dateRang/dateSelectForm';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import utc from "dayjs/plugin/utc";
import { InputAdornment, ListItemText, ListSubheader, MenuItem, TextField, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Spinloading from '@/components/other/spinLoading';
import ModalConfirmSave from '@/components/other/modalConfirmSave';
import SearchIcon from '@mui/icons-material/Search';
import SelectFormProps from '@/components/other/selectProps';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(utc);

type FormData = {
    metered_point_name: string;
    description: string;
    point_type_id: string;
    entry_exit_id: string;
    customer_type_id: string;
    non_tpa_point_id: string;
    nomination_point_id: string;
    zone_id: string;
    area_id: string;
    ref_id: string;
    id: any;
    start_date: Date;
    end_date: Date;
};

type FormExampleProps = {
    mode?: 'create' | 'edit' | 'view' | 'period';
    data?: Partial<FormData>;
    open: boolean;
    dataTable: any;
    zoneMasterData: any;
    areaMasterData: any;
    entryExitMasterData: any;
    customerType: any;
    meterPointType: any;
    onClose: () => void;
    onSubmit: SubmitHandler<FormData>;
    setResetForm: (reset: () => void) => void;
    loadingModal: any;
    setLoadingModal: any;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode = 'create',
    data = {},
    dataTable = {},
    zoneMasterData = {},
    areaMasterData = {},
    entryExitMasterData = {},
    customerType = {},
    meterPointType = {},
    open,
    onClose,
    onSubmit,
    setResetForm,
    loadingModal = false,
    setLoadingModal
}) => {
    const { control, register, handleSubmit, setValue, clearErrors, reset, setError, formState: { errors, isSubmitting, isValid }, watch, trigger, getValues } = useForm<any>({
        defaultValues: data,
        mode: 'onChange',
        shouldUnregister: false,
    });

    const labelClass = "block mb-2 text-[14px] font-light"
    const inputClass = "text-[14px] block md:w-full p-2 ps-5 focus:!ps-5 hover:!ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"
    const selectboxClass = "flex w-full h-[44px] p-2 ps-[7px] pe-10 !rounded-lg text-gray-900 text-[14px] block outline-none"
    const textErrorClass = "text-red-500 text-[14px]"
    const itemselectClass = "pl-[10px] text-[14px]"

    {/* Confirm Save */ }
    const [tk, settk] = useState<boolean>(true);
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()

    // const isReadOnly = (mode === "view" || mode === 'edit');
    const isReadOnly = mode === "view" || (data?.start_date && new Date(data?.start_date) < new Date()); // Edit > ถ้ายังไม่ถึง Start Date ต้องแก้ไขข้อมูลได้ทั้งหมด (ยกเว้นที่ auto fill) https://app.clickup.com/t/86ervt6gg
    const isPastStartDate = (data?.start_date && new Date(data?.start_date) < new Date());

    const startDate = watch('start_date');
    // const startDate = new Date();
    const formattedStartDate = formatWatchFormDate(startDate);

    const today = dayjs();
    const formattedStart = dayjs(formattedStartDate);

    //state
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [showDescAndPoint, setShowDescAndPoint] = useState(false);
    const [showTheRest, setShowTheRest] = useState(false);
    const [selectType, setSelectType] = useState();

    // New Period : ตอนเลือกข้อมูล Point มาแล้วกด Add ตรงปุ่ม add จะยังไม่ active จนกว่าจะมีการแก้ไขข้อมูลอะไรสักอย่างถึงจะ active https://app.clickup.com/t/86ervtbwu
    const [isEdited, setIsEdited] = useState(false); // เอาไว้จับ mode new period ว่าแก้ไขข้อมูลอะไรไปหรือยัง ถ้ายังปุ่ม add จะ disable

    const [meteredPointId, setMeteredPointId] = useState('');
    const [stepAdd, setstepAdd] = useState<any>(1); // เริ่มต้น หน้า add == 1 หลังจาก add == 2
    const [filteredDataTable, setfilteredDataTable] = useState<any>(dataTable);

    // Helper functions to reduce code duplication
    const getEmptyFormData = () => ({
        metered_point_name: '',
        description: '',
        point_type_id: '',
        entry_exit_id: '',
        customer_type_id: '',
        non_tpa_point_id: '',
        nomination_point_id: '',
        zone_id: '',
        area_id: '',
        ref_id: '',
        start_date: '',
        end_date: '',
    });

    const resetFormFields = (formData: any) => {
        Object.entries(formData).forEach(([key, value]) => {
            setValue(key as keyof FormData, value);
        });
    };

    const resetAdditionalStates = () => {
        setSelectType(undefined);
        setMeteredPointId('');
        setIsEdited(false);
    };

    const getValidationFields = (currentMode: string) => {
        switch (currentMode) {
            case 'create':
            case 'edit':
                return ['metered_point_name', 'description', 'point_type_id', 'start_date'];
            case 'period':
                return ['ref_id'];
            default:
                return [];
        }
    };

    const getConditionalValidationFields = () => [
        'nomination_point_id',
        'non_tpa_point_id',
        'entry_exit_id',
        'customer_type_id',
        'zone_id',
        'area_id'
    ];

    const setEditViewModeData = (formData: any) => {
        const formattedStartDate: any = formatFormDate(formData?.start_date);
        let formattedEndDate: any = 'Invalid Date'
        if (formData?.end_date !== null) {
            formattedEndDate = formatFormDate(formData?.end_date);
        }

        const editData = {
            end_date: formattedEndDate !== 'Invalid Date' ? formattedEndDate : '',
            metered_point_name: formData?.metered_point_name || '',
            description: formData?.description || '',
            point_type_id: formData?.point_type_id || '',
            entry_exit_id: formData?.entry_exit_id || '',
            customer_type_id: formData?.customer_type_id || '',
            non_tpa_point_id: formData?.non_tpa_point_id || '',
            nomination_point_id: formData?.nomination_point_id || '',
            zone_id: formData?.zone_id || '',
            area_id: formData?.area_id || '',
            ref_id: formData?.ref_id || '',
            start_date: formattedStartDate,
        };

        resetFormFields(editData);

        // Set metered point ID for modal title
        const filteredData = dataTable?.filter((item: any) => item.id === formData?.id);
        setMeteredPointId(filteredData[0]?.metered_id);
    };

    const handleFormSubmission = async (data: any) => {

        // Ensure form is ready for submission
        if (!open) {
            // Modal is not open, preventing submission
            return;
        }

        if (isSubmitting) {
            // Form is already submitting, preventing duplicate submission
            return;
        }

        // Trigger validation only for required fields based on mode
        const validationFields = getValidationFields(mode);
        const isValid = await trigger(validationFields);

        if (!isValid) {
            // Form validation failed, preventing submission
            return;
        }

        // Always get the full form values
        // const formData = getValues();

        // Ensure end_date is formatted as string if it exists
        if (data.end_date) {
            if (typeof data.end_date !== 'string') {
                data.end_date = formatFormDate(data.end_date);
            }
        }
        // if (formData.end_date) {
        //     if (typeof formData.end_date !== 'string') {
        //         formData.end_date = formatFormDate(formData.end_date);
        //     }
        // }

        handleSaveConfirm(data)
    };

    //load data
    useEffect(() => {
        const fetchAndSetData = async () => {

            // Only handle data fetching, form reset is handled by the consolidated useEffect
            if (open) {
                // Don't reset form here - it's handled by the consolidated useEffect
            }

            if (mode === 'create') {
                setIsLoading(false);
                setstepAdd(1);
                setShowTheRest(true);
                setShowDescAndPoint(true);

                // Clear all form fields for create mode
                resetFormFields(getEmptyFormData());
                resetAdditionalStates();
            }
            if (mode === 'period') {
                setIsLoading(false);
                setstepAdd(1);
                setShowTheRest(false);
                setShowDescAndPoint(false);

                // Clear all form fields for period mode
                resetFormFields(getEmptyFormData());
                resetAdditionalStates();
            }
            if (mode === 'edit' || mode === 'view') {
                setIsLoading(true);
                setstepAdd(2);

                setEditViewModeData(data);

                setShowDescAndPoint(true);
                setShowTheRest(true);
                setTimeout(() => {
                    if (data) { setIsLoading(false); }
                }, 300);
            }

            setfilteredDataTable(dataTable);
        }

        fetchAndSetData();
    }, [data, mode, setValue, open]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    // Consolidated useEffect to handle modal open and mode changes
    useEffect(() => {
        if (open) {

            // Always clear errors and reset states first
            clearErrors();
            setDataSubmit(undefined);
            setIsEdited(false);
            setModaConfirmSave(false);

            // Handle form reset based on mode
            if (mode === 'create' || mode === 'period') {

                // Reset additional states first
                resetAdditionalStates();

                // Clear all form fields
                reset(getEmptyFormData(), { keepDefaultValues: false });

            }

            // Force form reset and validation clearing
            setTimeout(() => {
                clearErrors();
                // Force a complete form reset to ensure clean state
                if (mode === 'edit' || mode === 'view') {
                    // For edit/view modes, reset with the original data to ensure clean state
                    reset(data, { keepDefaultValues: false });
                } else if (mode === 'create' || mode === 'period') {
                    // For create/period modes, ensure all conditional validation fields are cleared
                    clearErrors(getConditionalValidationFields());
                }
            }, 100);
        }
    }, [open, mode, clearErrors, reset]);

    useEffect(() => {
        if (mode == "period") {
            const ref_id = watch("ref_id")
            const refPoint = dataTable?.find((item: any) => item.id === ref_id);
            if (refPoint) {
                // watch('nomination_point_id')
                // watch('non_tpa_point_id')

                const metered_point_name = watch("metered_point_name")
                const description = watch("description")
                const point_type_id = watch("point_type_id")
                const entry_exit_id = watch("entry_exit_id")
                const customer_type_id = watch("customer_type_id")
                const nomination_point_id = watch("nomination_point_id")
                const non_tpa_point_id = watch("non_tpa_point_id")
                const zone_id = watch("zone_id")
                const area_id = watch("area_id")
                const start_date = watch("start_date")
                const end_date = watch("end_date")
                let startDateString: string | null = null
                let endDateString: string | null = null

                if (point_type_id) {
                    setSelectType(point_type_id)
                }

                if (start_date) {
                    try {
                        const startDate = dayjs.utc(start_date)
                        if (startDate.isValid()) {
                            startDateString = startDate.toISOString()
                        }
                        else {
                            startDateString = null
                        }
                    } catch (error) {
                        startDateString = null
                    }
                }
                else {
                    startDateString = null
                }
                if (end_date) {
                    try {
                        const endDate = dayjs.utc(end_date)
                        if (endDate.isValid()) {
                            endDateString = endDate.toISOString()
                        }
                        else {
                            endDateString = null
                        }
                    } catch (error) {
                        endDateString = null
                    }
                }
                else {
                    endDateString = null
                }

                if (
                    ((!metered_point_name && !refPoint.metered_point_name) ? false : metered_point_name != refPoint.metered_point_name)
                    || ((!description && !refPoint.description) ? false : description != refPoint.description)
                    || ((!point_type_id && !refPoint.point_type_id) ? false : point_type_id != refPoint.point_type_id)
                    || ((!entry_exit_id && !refPoint.entry_exit_id) ? false : entry_exit_id != refPoint.entry_exit_id)
                    || ((!customer_type_id && !refPoint.customer_type_id) ? false : customer_type_id != refPoint.customer_type_id)
                    || ((!nomination_point_id && !refPoint.nomination_point_id) ? false : nomination_point_id != refPoint.nomination_point_id)
                    || ((!non_tpa_point_id && !refPoint.non_tpa_point_id) ? false : non_tpa_point_id != refPoint.non_tpa_point_id)
                    || ((!zone_id && !refPoint.zone_id) ? false : zone_id != refPoint.zone_id)
                    || ((!area_id && !refPoint.area_id) ? false : area_id != refPoint.area_id)
                    || start_date != refPoint.startDateString
                    || end_date != refPoint.endDateString
                ) {
                    setIsEdited(true)
                }
                else {
                    setIsEdited(false)
                }
            }
        }
    }, [
        watch("metered_point_name"),
        watch("description"),
        watch("point_type_id"),
        watch("entry_exit_id"),
        watch("customer_type_id"),
        watch("nomination_point_id"),
        watch("non_tpa_point_id"),
        watch("zone_id"),
        watch("area_id"),
        watch("start_date"),
        watch("end_date")
    ])

    const findZoneAndArea = ((id: any) => {
        if (selectType == 1 || watch('point_type_id') == 1) {
            if (id) {
                const filteredData = meterPointType[0]?.data?.filter((item: any) => item.id === id);
                setValue("zone_id", filteredData[0]?.zone_id);
                setValue("area_id", filteredData[0]?.area_id);
            } else {
                //for clear 
                setValue('zone_id', '');
                setValue('area_id', '');
            }
        }
    })

    const resetWhenSelectType = (() => {
        setValue('zone_id', '');
        setValue('area_id', '');
        setValue('entry_exit_id', '');
        setValue('customer_type_id', '');
    })

    const modeNewPeriod = ((id: any) => {
        const filteredData = dataTable?.find((item: any) => item.id === id);

        setValue("metered_point_name", filteredData?.metered_point_name);
        setValue('description', filteredData?.description || '');
        setValue('point_type_id', filteredData?.point_type_id || '');
        setValue('entry_exit_id', filteredData?.entry_exit_id || '');
        setValue('customer_type_id', filteredData?.customer_type_id || '');

        if (filteredData?.point_type?.name == 'Nomination Point') {
            let findOption: any = meterPointType?.find((item: any) => item?.type == 'Nomination Point');
            let checkOption: any = findOption?.data?.find((item: any) => item?.id == filteredData?.nomination_point_id);
            // let checkOption: any = findOption?.data?.find((item: any) => item?.id == filteredData?.nomination_point_id && item?.customer_type_id == filteredData?.customer_type_id);
            // let checkOption: any = findOption?.data?.find((item: any) => (item?.id == filteredData?.nomination_point_id || item?.ref_id == filteredData?.nomination_point_id || item?.nomination_point?.trim()?.toUpperCase() == filteredData?.nomination_point?.nomination_point?.trim()?.toUpperCase()) && item?.customer_type_id == filteredData?.customer_type_id);

            setValue('nomination_point_id', checkOption ? filteredData?.nomination_point_id : '');
            setValue('non_tpa_point_id', '');
        } else if (filteredData?.point_type?.name == 'Non-TPA Point') {
            setValue('non_tpa_point_id', filteredData?.non_tpa_point_id || '');
            setValue('nomination_point_id', '');
        } else {
            setValue('nomination_point_id', '');
            setValue('non_tpa_point_id', '');
        }

        setValue('zone_id', filteredData?.zone_id || '');
        setValue('area_id', filteredData?.area_id || '');
        setValue('start_date', formattedStartDate);
        setValue('metered_id', filteredData?.metered_id || '');

        // New Period : ตอนเลือกข้อมูล Point มาแล้วกด Add อยากให้มี Metering ID แสดงเหมือนหน้า view/Edit ด้วย https://app.clickup.com/t/86ervtb3w
        setMeteredPointId(filteredData?.metered_id)

        // setValue("metered_id", filteredData?.id || "");
        // setValue("id", filteredData?.id || "");
        // setValue('end_date', formattedEndDate);
        // Initialize end_date as empty for new period
        setValue('end_date', '');
    })

    const handleClose = () => {
        onClose();
        setResetForm(() => reset);

        // Reset all form states
        clearErrors();
        setDataSubmit(undefined);
        resetAdditionalStates();
        setModaConfirmSave(false);

        setTimeout(() => {
            setIsLoading(true);
        }, 100);
    };

    {/* Confirm Save */ }
    const handleSaveConfirm = async (data?: any) => {
        if (!open) {
            // Modal is not open, preventing save confirmation
            return;
        }

        if (mode == 'create') {
            await onSubmit(data);
        } else {
            setDataSubmit(data)
            setModaConfirmSave(true)
        }
    }

    const buttonSubmitRef = useRef<HTMLButtonElement>(null);

    const onSubmitRef = () => {
        buttonSubmitRef?.current?.click();
    }

    return (
        <>
            <Dialog open={open} onClose={handleClose} className="relative z-30">
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
                            <Spinloading spin={loadingModal} rounded={20} />

                            <div className="flex inset-0 items-center justify-center ">
                                <div className="flex flex-col items-center justify-center rounded-md">
                                    {/* <Spinloading spin={isLoading} rounded={20} /> */}
                                    <form
                                        className="bg-white p-8 rounded-[20px] shadow-lg w-[900px]"
                                        // onSubmit={handleSubmit(onSubmit)} 
                                        onSubmit={handleSubmit(handleFormSubmission)}
                                    >
                                        <h2 className="text-xl font-bold text-[#00ADEF] mb-3 pb-3">{mode == "create" ? `New Metered Point` : mode == "edit" ? `Edit Metering ID : ${meteredPointId}` : mode == "period" ? `New Period : ${meteredPointId}` : `View Metering ID : ${meteredPointId}`}</h2>
                                        <div className={`grid ${!showDescAndPoint && '!grid-cols-1'} grid-cols-3 gap-2 pt-4`}>
                                            <div>
                                                <label htmlFor="metered_point_name" className={labelClass}>
                                                    <span className="text-red-500">*</span>{`Metered Point Name`}
                                                </label>
                                                {
                                                    (mode == "create" || mode == 'edit' || mode == 'view') ?
                                                        <>
                                                            <input
                                                                id="metered_point_name"
                                                                type="text"
                                                                placeholder='Enter Metered Point Name'
                                                                readOnly={isReadOnly}
                                                                {...register('metered_point_name', { required: "Enter Metered Point Name " })}
                                                                className={`${inputClass} ${errors.metered_point_name && 'border-red-500'}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                                onChange={() => { if (errors?.metered_point_name) { clearErrors('metered_point_name') } }}
                                                            />
                                                            {(errors.metered_id || errors.metered_point_name) && (<p className="text-red-500 text-sm">{`Enter Metered Point Name`}</p>)}
                                                        </>
                                                        // : (mode == "period" && stepAdd == 1 || stepAdd == 2) &&
                                                        : (mode == "period" && stepAdd == 1) ?
                                                            <div>
                                                                <Select
                                                                    id="ref_id"
                                                                    IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                                    {...register("ref_id", {
                                                                        required: "Select Metered Point",
                                                                    })}
                                                                    disabled={isReadOnly}
                                                                    value={watch("ref_id") || ""}
                                                                    className={`${selectboxClass} ${isReadOnly && "!bg-[#EFECEC]"} ${errors.ref_id && "border-red-500"}`}
                                                                    sx={{
                                                                        '.MuiOutlinedInput-notchedOutline': {
                                                                            // borderColor: '#DFE4EA', // Change the border color here
                                                                            borderColor: errors.ref_id && !watch('ref_id') ? '#FF0000' : '#DFE4EA',
                                                                        },
                                                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                            borderColor: errors.ref_id && !watch("ref_id") ? "#FF0000" : "#d2d4d8",
                                                                        },
                                                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                            borderColor: '#d2d4d8',
                                                                        },
                                                                    }}
                                                                    onChange={(e) => {
                                                                        setValue("ref_id", e.target.value);
                                                                        setValue("metered_point_name", e.target.value);
                                                                        modeNewPeriod(e.target.value);

                                                                        if (errors?.ref_id && e.target.value) { clearErrors('ref_id') }
                                                                    }}
                                                                    displayEmpty
                                                                    renderValue={(value: any) => {
                                                                        if (!value) {
                                                                            return <Typography color="#9CA3AF" className={isReadOnly ? 'opacity-0' : 'opacity-100'} fontSize={14}>{'Select Metered Point'}</Typography>;
                                                                        }
                                                                        return <span className={itemselectClass}>{dataTable?.find((item: any) => item.id === value)?.metered_point_name || ''}</span>;
                                                                    }}
                                                                    MenuProps={{
                                                                        PaperProps: {
                                                                            style: {
                                                                                maxHeight: 48 * 4.5 + 8, // Item height * 4.5 + padding
                                                                                // width: 250, // Adjust width as needed
                                                                            },
                                                                        },
                                                                        autoFocus: false,
                                                                        disableAutoFocusItem: true,
                                                                    }}
                                                                >
                                                                    {/* filter where dataTable.start_date <= present date and dataTable.end_date > present date */}
                                                                    {/* {dataTable?.length > 0 && dataTable?.map((item: any) => (
                                                                    <MenuItem key={item.id} value={item.id}>
                                                                        <ListItemText primary={<Typography fontSize={14}>{item.metered_point_name}</Typography>} />
                                                                    </MenuItem>
                                                                ))} */}
                                                                    {dataTable?.length > 5 &&
                                                                        <ListSubheader style={{ width: '100%' }}>
                                                                            <TextField
                                                                                size="small"
                                                                                // Autofocus on textfield
                                                                                autoFocus
                                                                                placeholder="Type to search..."
                                                                                // fullWidth
                                                                                InputProps={{
                                                                                    startAdornment: (
                                                                                        <InputAdornment position="start">
                                                                                            <SearchIcon sx={{ fontSize: 16 }} />
                                                                                        </InputAdornment>
                                                                                    )
                                                                                }}
                                                                                className='inputSearchk'
                                                                                // style={{ paddingLeft: '5px !important'}}
                                                                                style={{ width: '100%', height: 40 }}
                                                                                // onChange={(e) => setSearchText(e.target.value)}
                                                                                // onChange={(e) => e.target.value ? onFilter(e.target.value, 'search') : onFilter(undefined, 'clear')}
                                                                                onChange={(e) => {
                                                                                    if (e?.target?.value) {
                                                                                        const queryLower = e?.target?.value.toLowerCase().replace(/\s+/g, '')?.trim();
                                                                                        let newItem: any = dataTable?.filter((item: any) => item?.metered_point_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower));
                                                                                        setfilteredDataTable(newItem);
                                                                                        settk(!tk);
                                                                                    } else {
                                                                                        setfilteredDataTable(dataTable);
                                                                                        settk(!tk);
                                                                                    }
                                                                                }}
                                                                                onKeyDown={(e) => {
                                                                                    if (e.key !== "Escape") {
                                                                                        // Prevents autoselecting item while typing (default Select behaviour)
                                                                                        e.stopPropagation();
                                                                                    }
                                                                                }}
                                                                            />
                                                                        </ListSubheader>
                                                                    }

                                                                    {/* New Period : ชื่อ Metered Point ที่สามารถเลือกได้ จะต้องเป็น Point ที่ Active อยู่  https://app.clickup.com/t/86ervtqga */}
                                                                    {filteredDataTable
                                                                        ?.filter((item: any) => {

                                                                            const today = toDayjs().startOf('day'); // Remove time from today's date
                                                                            const startDate = toDayjs(item.start_date).startOf('day'); // Remove time from start date
                                                                            const endDate = item.end_date ? toDayjs(item.end_date).startOf('day') : null; // Remove time from end date

                                                                            return startDate.isValid() &&
                                                                                startDate.isSameOrBefore(today) &&
                                                                                (!endDate || (endDate.isValid() && endDate.isAfter(today)));

                                                                        })?.slice() // เพื่อไม่เปลี่ยนต้นฉบับ
                                                                        ?.sort((a: any, b: any) => {
                                                                            const textA = (a?.metered_point_name ?? '').toString().toLowerCase();
                                                                            const textB = (b?.metered_point_name ?? '').toString().toLowerCase();
                                                                            return textA?.localeCompare(textB);
                                                                        })?.map((item: any) => (
                                                                            <MenuItem key={item.id} value={item.id}>
                                                                                <ListItemText primary={<Typography fontSize={14}>{item?.metered_point_name}</Typography>} />
                                                                            </MenuItem>
                                                                        ))
                                                                    }


                                                                </Select>
                                                                {(errors.ref_id || errors.metered_point_name) && (<p className="text-red-500 text-sm">{`Select Metered Point`}</p>)}
                                                            </div>
                                                            : (mode == "period" && stepAdd == 2) && <>
                                                                <input
                                                                    id="metered_point_name"
                                                                    type="text"
                                                                    placeholder='Enter Contract Point'
                                                                    readOnly={isReadOnly}
                                                                    {...register('metered_point_name', { required: "Enter Contract Point " })}
                                                                    className={`${inputClass} ${errors.metered_point_name && 'border-red-500'}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                                    onChange={(e) => {
                                                                        if (errors?.metered_point_name) {
                                                                            clearErrors('metered_point_name')
                                                                        }
                                                                        setValue('metered_point_name', e.target.value);
                                                                    }}
                                                                />
                                                                {(errors.ref_id || errors.metered_point_name) && (<p className="text-red-500 text-sm">{`Enter Contract Point`}</p>)}
                                                            </>
                                                }
                                            </div>

                                            {
                                                showDescAndPoint && <>
                                                    <div>
                                                        <label htmlFor="description" className={labelClass}>
                                                            {`Description`}<span className='opacity-0 none'>*</span> {/* /กันบรรทัดไม่เท่า/ */}
                                                        </label>
                                                        <input
                                                            id="description"
                                                            type="text"
                                                            placeholder='Enter Description'
                                                            // {...register('description', { required: "Enter Description" })}
                                                            {...register('description')}
                                                            // readOnly={isReadOnly}
                                                            readOnly={mode == 'view' ? true : false}
                                                            onChange={(e) => {
                                                                if (e.target.value.length <= 50) {
                                                                    setValue('description', e.target.value);
                                                                }
                                                            }}
                                                            maxLength={50}
                                                            className={`${inputClass} ${mode == 'view' && '!bg-[#EFECEC]'} ${errors.description && 'border-red-500'}`}
                                                        />
                                                        <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                                            <span className="text-[13px]">{watch('description')?.length || 0} / 50</span>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label htmlFor="point_type_id" className={labelClass}>
                                                            <span className="text-red-500">*</span>{`Nomination Point / Non-TPA Point`}
                                                        </label>
                                                        <Select
                                                            id="point_type_id"
                                                            IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                            {...register("point_type_id", {
                                                                required: "Select Nomination Point / Non-TPA Point",
                                                            })}
                                                            disabled={isReadOnly}
                                                            value={watch("point_type_id") || ""}
                                                            className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.point_type_id && "border-red-500"}`}
                                                            sx={{
                                                                '.MuiOutlinedInput-notchedOutline': {
                                                                    // borderColor: '#DFE4EA', // Change the border color here
                                                                    borderColor: errors.point_type_id && !watch('point_type_id') ? '#FF0000' : '#DFE4EA',
                                                                },
                                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: errors.point_type_id && !watch("point_type_id") ? "#FF0000" : "#d2d4d8",
                                                                },
                                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: '#d2d4d8',
                                                                },
                                                            }}
                                                            onChange={(e) => {
                                                                setValue("point_type_id", e.target.value);
                                                                setSelectType(e.target.value)
                                                                e.target.value == 2 && resetWhenSelectType()
                                                                clearErrors();
                                                                setValue('nomination_point_id', '');
                                                                setValue('non_tpa_point_id', '');
                                                                if (errors?.point_type_id && e.target.value) { clearErrors('point_type_id') }
                                                            }}
                                                            displayEmpty
                                                            renderValue={(value: any) => {
                                                                if (!value) {
                                                                    return <Typography color="#9CA3AF" className={isReadOnly ? 'opacity-0' : 'opacity-100'} style={{ width: 200, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }} fontSize={14}>{'Select Nomination Point / Non-TPA Point'}</Typography>;
                                                                }
                                                                return <span className={itemselectClass}>{meterPointType?.find((item: any) => item.id === value)?.type || ''}</span>;
                                                            }}
                                                            MenuProps={{
                                                                PaperProps: {
                                                                    style: {
                                                                        maxHeight: 48 * 4.5 + 8, // Item height * 4.5 + padding
                                                                        width: 250,
                                                                        minWidth: 250
                                                                    },
                                                                },
                                                            }}
                                                        >
                                                            {meterPointType?.length > 0 && meterPointType?.map((item: any) => (
                                                                <MenuItem key={item.id} value={item.id}>
                                                                    <ListItemText primary={<Typography fontSize={14}>{item.type}</Typography>} />
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                        {errors.point_type_id && (<p className="text-red-500 text-sm">{`Select Nomination Point / Non-TPA Point`}</p>)}
                                                    </div>
                                                </>
                                            }


                                            {
                                                showTheRest && <>
                                                    <div>
                                                        <label htmlFor="entry_exit_id" className={labelClass}>
                                                            {selectType == 1 && <span className="text-red-500">*</span>}
                                                            {`Entry/Exit`}<span className='opacity-0 none'>*</span> {/* /กันบรรทัดไม่เท่า/ */}
                                                        </label>
                                                        <SelectFormProps
                                                            id={'entry_exit_id'}
                                                            register={register('entry_exit_id', { required: selectType == 1 ? true : false })}
                                                            disabled={isReadOnly || selectType == 2 || watch('point_type_id') == 2}
                                                            valueWatch={watch('entry_exit_id') || ''}
                                                            handleChange={(e) => {
                                                                setValue('entry_exit_id', e.target.value);
                                                                findZoneAndArea('') //for clear if select new option

                                                                setValue('customer_type_id', '');
                                                                setValue('nomination_point_id', '');
                                                                if (errors?.entry_exit_id) {
                                                                    clearErrors('entry_exit_id');
                                                                }
                                                            }}
                                                            errors={errors?.entry_exit_id}
                                                            errorsText={'Select Entry / Exit'}
                                                            options={entryExitMasterData}
                                                            optionsKey={'id'}
                                                            optionsValue={'id'}
                                                            optionsText={'name'}
                                                            optionsResult={'name'}
                                                            placeholder={'Select Entry/Exit'}
                                                            pathFilter={'id'}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label htmlFor="customer_type_id" className={labelClass}>
                                                            {selectType == 1 && <span className="text-red-500">*</span>}
                                                            {`Customer Type`}<span className='opacity-0'>*</span> {/* /กันบรรทัดไม่เท่า/ */}
                                                        </label>
                                                        <SelectFormProps
                                                            id={'customer_type_id'}
                                                            register={register('customer_type_id', { required: selectType == 1 ? true : false })}
                                                            disabled={isReadOnly || selectType == 2 || watch('point_type_id') == 2}
                                                            valueWatch={watch('customer_type_id') || ''}
                                                            handleChange={(e) => {
                                                                findZoneAndArea('') //for clear if select new option
                                                                setValue('customer_type_id', e.target.value)
                                                                setValue('nomination_point_id', '');
                                                                if (errors?.customer_type_id) {
                                                                    clearErrors('customer_type_id')
                                                                }
                                                            }}
                                                            errors={errors?.customer_type_id}
                                                            errorsText={'Select Customer Type'}
                                                            // options={customerType}
                                                            options={customerType?.filter((item: any) => item?.entry_exit_id == watch('entry_exit_id'))} // v2.0.65 เลือก create New metered point แล้วการ relate ของข้อมูลจากการเลือกข้อมูลก่อนหน้าไม่ถูกต้อง https://app.clickup.com/t/86eu36r45
                                                            optionsKey={'id'}
                                                            optionsValue={'id'}
                                                            optionsText={'name'}
                                                            optionsResult={'name'}
                                                            placeholder={'Select Customer Type'}
                                                            pathFilter={'name'}
                                                        />
                                                    </div>



                                                    {/* selectType 1 == "Nomination Point" */}
                                                    {/* selectType 2 == "Non-TPA Point" */}
                                                    <div>
                                                        <label className={labelClass}>
                                                            <span className="text-red-500">*</span>{`Point`}
                                                        </label>
                                                        {selectType == 1 || watch('point_type_id') == 1 ?
                                                            <SelectFormProps
                                                                id={'nomination_point_id'}
                                                                register={register("nomination_point_id", { required: "Select Point" })}
                                                                disabled={isReadOnly}
                                                                valueWatch={watch('nomination_point_id') || ''}
                                                                handleChange={(e) => {
                                                                    findZoneAndArea(e.target.value); // เอา id ไปกรองหา zone, area ของ type 1
                                                                    setValue('nomination_point_id', e.target.value);

                                                                    if (errors?.nomination_point_id) {
                                                                        clearErrors('nomination_point_id');
                                                                    }
                                                                }}
                                                                errors={errors.nomination_point_id}
                                                                errorsText={'Select Point'}
                                                                // options={meterPointType[0]?.data}
                                                                // options={
                                                                //     meterPointType[0]?.data?.filter((item: any) =>
                                                                //         watch('entry_exit_id') && watch('customer_type_id') && item?.entry_exit_id == watch('entry_exit_id') && item?.customer_type_id == watch('customer_type_id'))
                                                                // } // v2.0.65 เลือก create New metered point แล้วการ relate ของข้อมูลจากการเลือกข้อมูลก่อนหน้าไม่ถูกต้อง https://app.clickup.com/t/86eu36r45

                                                                // field customer type มันคือ customer type ของ meter ไม่ได้เกี่ยวข้องกับการเลือก Nom Point https://app.clickup.com/t/86euzxxa1
                                                                options={
                                                                    meterPointType[0]?.data?.filter((item: any) =>
                                                                        watch('entry_exit_id') && item?.entry_exit_id == watch('entry_exit_id'))
                                                                }

                                                                optionsKey={'id'}
                                                                optionsValue={'id'}
                                                                optionsText={'nomination_point'}
                                                                optionsResult={'nomination_point'}
                                                                placeholder={'Select Point'}
                                                                pathFilter={'nomination_point'}
                                                            />
                                                            :
                                                            <SelectFormProps
                                                                id={'non_tpa_point_id'}
                                                                register={register("non_tpa_point_id", { required: "Select Point" })}
                                                                disabled={isReadOnly}
                                                                valueWatch={watch('non_tpa_point_id') || ''}
                                                                handleChange={(e) => {
                                                                    findZoneAndArea(e.target.value); // เอา id ไปกรองหา zone, area ของ type 1
                                                                    setValue('non_tpa_point_id', e.target.value);

                                                                    if (errors?.non_tpa_point_id) {
                                                                        clearErrors('non_tpa_point_id');
                                                                    }
                                                                }}
                                                                errors={errors.non_tpa_point_id}
                                                                errorsText={'Select Point'}
                                                                // options={meterPointType[1]?.data}
                                                                options={selectType == 2 || watch('point_type_id') == 2 ? meterPointType[1]?.data : []}
                                                                optionsKey={'id'}
                                                                optionsValue={'id'}
                                                                optionsText={'non_tpa_point_name'}
                                                                optionsResult={'non_tpa_point_name'}
                                                                placeholder={'Select Point'}
                                                                pathFilter={'non_tpa_point_name'}
                                                            />
                                                        }
                                                    </div>

                                                    <div>
                                                        <label
                                                            htmlFor="zone_id"
                                                            className={labelClass}
                                                        >
                                                            {selectType == 1 || watch('point_type_id') == 1 && <span className="text-red-500">*</span>}
                                                            {`Zone`}<span className='opacity-0 none'>*</span> {/* /กันบรรทัดไม่เท่า/ */}
                                                        </label>
                                                        <Select
                                                            id="zone_id"
                                                            IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                            {...register("zone_id", { required: selectType == 1 || watch('point_type_id') == 1 ? true : false })}
                                                            // disabled={isReadOnly}
                                                            // disabled={isReadOnly || selectType == 2}
                                                            disabled={true}
                                                            value={watch("zone_id") || ""}
                                                            className={`${selectboxClass} !bg-[#EFECEC] ${errors.zone_id && "border-red-500"}`}
                                                            sx={{
                                                                '.MuiOutlinedInput-notchedOutline': {
                                                                    // borderColor: '#DFE4EA', // Change the border color here
                                                                    borderColor: errors.point_type_id && !watch('point_type_id') ? '#FF0000' : '#DFE4EA',
                                                                },
                                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: errors.point_type_id && !watch("point_type_id") ? "#FF0000" : "#d2d4d8",
                                                                },
                                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: '#d2d4d8',
                                                                },
                                                            }}
                                                            onChange={(e) => {
                                                                setValue("zone_id", e.target.value);
                                                                // fetchData(e?.target);
                                                            }}
                                                            displayEmpty
                                                            renderValue={(value: any) => {
                                                                // if (!value) {
                                                                //     return <Typography color="#9CA3AF" className={isReadOnly || selectType !== 1 || watch('point_type_id') !== 1 ? 'opacity-0' : 'opacity-100'} fontSize={14}>{'Select Zone'}</Typography>;
                                                                // }

                                                                if (!value) {
                                                                    if (selectType == 1 || watch('point_type_id') == 1) return null;

                                                                    return (
                                                                        <Typography
                                                                            color="#9CA3AF"
                                                                            className={selectType !== 1 || watch('point_type_id') !== 1 ? 'opacity-0' : 'opacity-100'}
                                                                            fontSize={14}
                                                                        >
                                                                            {'Select Zone'}
                                                                        </Typography>
                                                                    );
                                                                }

                                                                return <span className={itemselectClass}>{zoneMasterData?.find((item: any) => item.id === value)?.name || ''}</span>;
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
                                                            {zoneMasterData?.map((zone: any) => {
                                                                return (
                                                                    <MenuItem key={zone.id} value={zone.id}>
                                                                        {zone.name}
                                                                    </MenuItem>
                                                                )
                                                            })}
                                                        </Select>
                                                        {errors.name && (
                                                            <p className="text-red-500 text-sm">{`Select Zone Name`}</p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label
                                                            htmlFor="area_id"
                                                            className={labelClass}
                                                        >
                                                            {selectType == 1 || watch('point_type_id') == 1 && <span className="text-red-500">*</span>}
                                                            {`Area`}<span className='opacity-0 none'>*</span> {/* /กันบรรทัดไม่เท่า/ */}
                                                        </label>
                                                        <Select
                                                            id="area_id"
                                                            IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                            {...register("area_id", { required: selectType == 1 || watch('point_type_id') == 1 ? true : false })}
                                                            // disabled={isReadOnly}
                                                            // disabled={isReadOnly || selectType == 2}
                                                            disabled={true}
                                                            value={watch("area_id") || ""}
                                                            className={`${selectboxClass} !bg-[#EFECEC] ${errors.area_id && "border-red-500"}`}
                                                            sx={{
                                                                '.MuiOutlinedInput-notchedOutline': {
                                                                    // borderColor: '#DFE4EA', // Change the border color here
                                                                    borderColor: errors.point_type_id && !watch('point_type_id') ? '#FF0000' : '#DFE4EA',
                                                                },
                                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: errors.point_type_id && !watch("point_type_id") ? "#FF0000" : "#d2d4d8",
                                                                },
                                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: '#d2d4d8',
                                                                },
                                                            }}
                                                            onChange={(e) => {
                                                                setValue("area_id", e.target.value);
                                                                // fetchData(e?.target);
                                                            }}
                                                            displayEmpty
                                                            renderValue={(value: any) => {
                                                                // if (!value) {
                                                                //     return <Typography color="#9CA3AF" className={isReadOnly || selectType !== 1 || watch('point_type_id') !== 1 ? 'opacity-0' : 'opacity-100'} fontSize={14}>{'Select Area'}</Typography>;
                                                                // }

                                                                if (!value) {
                                                                    if (selectType == 1 || watch('point_type_id') == 1) return null;

                                                                    return (
                                                                        <Typography
                                                                            color="#9CA3AF"
                                                                            className={selectType !== 1 || watch('point_type_id') !== 1 ? 'opacity-0' : 'opacity-100'}
                                                                            fontSize={14}
                                                                        >
                                                                            {'Select Area'}
                                                                        </Typography>
                                                                    );
                                                                }
                                                                return <span className={itemselectClass}>{areaMasterData?.find((item: any) => item.id === value)?.name || ''}</span>;
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
                                                            {areaMasterData?.map((zone: any) => {
                                                                return (
                                                                    <MenuItem key={zone.id} value={zone.id}>
                                                                        {zone.name}
                                                                    </MenuItem>
                                                                )
                                                            })}
                                                        </Select>
                                                        {errors.name && (<p className="text-red-500 text-sm">{`Select Area`}</p>)}

                                                    </div>

                                                    <div className="pb-2">
                                                        <label className={labelClass}>
                                                            <span className="text-red-500">*</span>
                                                            {`Start Date`}
                                                        </label>
                                                        <DatePickaForm
                                                            {...register('start_date', { required: "Select start date" })}
                                                            readOnly={isReadOnly}
                                                            placeHolder="Select Start Date"
                                                            // mode={mode}
                                                            // mode={mode == 'period' ? 'create' : mode == 'edit' ? 'view' : mode} // ของดี เฮียเก็บไว้ก่อน
                                                            mode={mode == 'period' ? 'create' : mode == 'edit' ? 'edit' : mode}

                                                            valueShow={watch("start_date") && dayjs(watch("start_date")).format("DD/MM/YYYY")}
                                                            // min={formattedStartDate || undefined}
                                                            // min={mode === 'period' ? dayjs().add(1, 'day').format('YYYY-MM-DD') : formattedStartDate || undefined} // New Period : ตอนเลือกข้อมูล Point มาแล้วกด Add กรณีที่จะเปลี่ยน Start Date จะสามารถเลือกได้เป็น D+1 https://app.clickup.com/t/86ervtcxh

                                                            // ถ้า formattedStartDate > today ให้ใช้ today 
                                                            // min={mode === 'period' ? dayjs().add(1, 'day').format('YYYY-MM-DD') : (formattedStart.isAfter(today) ? today : formattedStart).format('YYYY-MM-DD') || undefined} // New Period : ตอนเลือกข้อมูล Point มาแล้วกด Add กรณีที่จะเปลี่ยน Start Date จะสามารถเลือกได้เป็น D+1 https://app.clickup.com/t/86ervtcxh
                                                            min={mode === 'period' && dayjs().add(1, 'day').format('YYYY-MM-DD')}

                                                            maxNormalForm={watch('end_date') && watch('end_date')} // ไม่ให้ start_date เกิน end_date
                                                            allowClear
                                                            isError={errors.start_date && !watch("start_date") ? true : false}
                                                            onChange={(e: any) => {
                                                                setValue('start_date', formatFormDate(e));

                                                                e == undefined && setValue('start_date', null, { shouldValidate: true, shouldDirty: true });
                                                            }}
                                                        />
                                                        {errors.start_date && !watch("start_date") && <p className={`${textErrorClass}`}>{'Select Start Date'}</p>}
                                                    </div>

                                                    <div className="pb-2">
                                                        <label className={labelClass}>{`End Date`}</label>

                                                        {/* <DatePickaForm
                                                            {...register('end_date')}
                                                            // readOnly={!formattedStartDate ? true : isReadOnly}
                                                            readOnly={!formattedStartDate ? true : mode == 'edit' || mode == 'create' || mode == 'period' ? false : true}
                                                            placeHolder="Select End Date"
                                                            mode={mode == 'period' ? 'create' : mode == 'edit' ? 'view' : mode}
                                                            // min={formattedStartDate || undefined}
                                                            // min={isPastStartDate ? dayjs().add(1, 'day').format('YYYY-MM-DD') : formattedStartDate || undefined}
                                                            min={getMinDate(formattedStartDate)}
                                                            valueShow={watch("end_date") ? dayjs(watch("end_date")).format("DD/MM/YYYY") : undefined}
                                                            allowClear
                                                            onChange={(e: any) => { setValue('end_date', formatFormDate(e)), e == undefined && setValue('end_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                                        /> */}

                                                        <DatePickaForm
                                                            {...register('end_date')}
                                                            // readOnly={!formattedStartDate ? true : isReadOnly}
                                                            readOnly={mode == 'edit' || mode == 'create' || mode == 'period' ? false : true}
                                                            placeHolder="Select End Date"
                                                            mode={mode == 'period' ? 'create' : mode == 'edit' ? 'edit' : mode}
                                                            // min={formattedStartDate || undefined}
                                                            min={getMinDate(formattedStartDate)}
                                                            valueShow={watch("end_date") ? dayjs(watch("end_date")).format("DD/MM/YYYY") : undefined}
                                                            allowClear
                                                            onChange={(e: any) => { setValue('end_date', formatFormDate(e)), e == undefined && setValue('end_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                                        />
                                                    </div>
                                                </>
                                            }

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
                                                    // mode == "period" && stepAdd == 1 ?
                                                    mode == "period" && stepAdd == 1 ?
                                                        <div
                                                            id="fake-button-add"
                                                            className="w-[167px] font-light bg-[#00ADEF] text-center cursor-pointer transition duration-75 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                                            onClick={() => {
                                                                if (watch('ref_id')) {
                                                                    setShowTheRest(true)
                                                                    setShowDescAndPoint(true);
                                                                    clearErrors('');
                                                                    setTimeout(() => {
                                                                        setstepAdd(2); // ใช้กด add หลักจากเลือก period แล้ว
                                                                    }, 100)
                                                                } else {
                                                                    setError('ref_id', { type: "custom", message: "Select Metered Point" })
                                                                }
                                                            }
                                                            }
                                                        >
                                                            {"Add"}
                                                        </div>
                                                        : mode == "create" && stepAdd == 1 ?
                                                            <div
                                                                id="fake-button-add"
                                                                className="w-[167px] font-light bg-[#00ADEF] text-center cursor-pointer transition duration-75 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                                                onClick={() => {
                                                                    if (!selectType) {
                                                                        setError('metered_point_name', { type: "custom", message: "" })
                                                                        setError('point_type_id', { type: "custom", message: "" })
                                                                        setError('non_tpa_point_id', { type: "custom", message: "" })
                                                                        setError('start_date', { type: "custom", message: "" })
                                                                    } else {
                                                                        if (selectType == 1) {
                                                                            let listValidate = [
                                                                                'metered_point_name',
                                                                                'entry_exit_id',
                                                                                'customer_type_id',
                                                                                'nomination_point_id',
                                                                                'start_date'
                                                                            ]

                                                                            let resultPass: number = 0;

                                                                            const checkOption: any = (item: any) => {
                                                                                let checkWatch = watch(item) || undefined;
                                                                                if (checkWatch) {
                                                                                    resultPass = resultPass + 1
                                                                                } else {
                                                                                    setError(item, { type: "custom", message: '' })
                                                                                }

                                                                                // for finish
                                                                                if (resultPass == listValidate?.length) {
                                                                                    setstepAdd(2); // ใช้กด add หลักจากเลือก period แล้ว
                                                                                    setTimeout(() => {
                                                                                        onSubmitRef()
                                                                                    }, 300)
                                                                                }
                                                                            }

                                                                            listValidate?.map((item: any) => {
                                                                                return checkOption(item);
                                                                            })
                                                                        } else {
                                                                            let listValidate = [
                                                                                'metered_point_name',
                                                                                'non_tpa_point_id',
                                                                                'start_date'
                                                                            ]

                                                                            let resultPass: number = 0;

                                                                            const checkOption: any = (item: any) => {
                                                                                let checkWatch = watch(item) || undefined;
                                                                                if (checkWatch) {
                                                                                    resultPass = resultPass + 1
                                                                                } else {
                                                                                    setError(item, { type: "custom", message: '' })
                                                                                }

                                                                                // for finish
                                                                                if (resultPass == listValidate?.length) {
                                                                                    setstepAdd(2); // ใช้กด add หลักจากเลือก period แล้ว
                                                                                    setTimeout(() => {
                                                                                        onSubmitRef()
                                                                                    }, 300)
                                                                                }
                                                                            }

                                                                            listValidate?.map((item: any) => {
                                                                                return checkOption(item);
                                                                            })
                                                                        }
                                                                    }
                                                                }
                                                                }
                                                            >
                                                                {"Add"}
                                                            </div>
                                                            :

                                                            // if mode == 'period' and isEdited == false then disable this button
                                                            <button
                                                                ref={buttonSubmitRef}
                                                                type="submit"
                                                                className={`w-[167px] font-light py-2 rounded-lg focus:outline-none ${mode === 'period' && !isEdited ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#00ADEF] hover:bg-blue-600 focus:bg-blue-600 text-white'}`}
                                                                disabled={mode === 'period' && !isEdited || isSubmitting}
                                                                onClick={() => {
                                                                    // Button click handler - form submission is handled by onSubmit
                                                                }}
                                                            >
                                                                {mode === 'create' || mode === 'period' ? 'Add' : 'Save'}
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
                        setIsLoading(true);
                        setTimeout(async () => {
                            try {
                                await onSubmit(dataSubmit);
                                // Reset form state after successful submission
                                setDataSubmit(undefined);
                                clearErrors();

                                // Force a complete form reset
                                setTimeout(() => {
                                    reset(data, { keepDefaultValues: false }); // Reset to original data
                                    clearErrors();
                                }, 50);

                            } catch (error) {
                                // Even on error, reset the form state
                                setDataSubmit(undefined);
                                clearErrors();
                            } finally {
                                setIsLoading(false);
                            }
                        }, 100);
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

export default ModalAction;