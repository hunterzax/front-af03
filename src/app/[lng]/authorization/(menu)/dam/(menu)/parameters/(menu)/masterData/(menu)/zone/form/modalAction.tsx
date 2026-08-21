import React, { useRef } from "react";
import { useForm, SubmitHandler } from 'react-hook-form';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import { useEffect, useState } from "react";
import { formatFormDate, formatWatchFormDate, getMinDate } from '@/utils/generalFormatter';
import { Tab, Tabs } from '@mui/material';
import { TabPanel } from '@/components/other/tabPanel';
import DatePickaForm from '@/components/library/dateRang/dateSelectForm';
import dayjs from 'dayjs';
import { NumericFormat } from 'react-number-format';
import { SketchPicker } from 'react-color';
import Spinloading from "@/components/other/spinLoading";
import SelectFormProps from "@/components/other/selectProps";
import ModalConfirmSave from "@/components/other/modalConfirmSave";

type FormData = {
    name: string;
    description: string;
    entry_exit_id: string;
    start_date: Date | null;
    end_date: Date;
    color: string;

    v2_wobbe_index_min: any,
    v2_wobbe_index_max: any,
    v2_methane_min: any,
    v2_methane_max: any,
    v2_oxygen_min: any,
    v2_oxygen_max: any,
    v2_carbon_dioxide_nitrogen_min: any,
    v2_carbon_dioxide_nitrogen_max: any,
    v2_total_sulphur_min: any,
    v2_total_sulphur_max: any,
    v2_hydrocarbon_dew_min: any,
    v2_hydrocarbon_dew_max: any,
    v2_sat_heating_value_min: any,
    v2_sat_heating_value_max: any,
    v2_c2_plus_min: any,
    v2_c2_plus_max: any,
    v2_nitrogen_min: any,
    v2_nitrogen_max: any,
    v2_carbon_dioxide_min: any,
    v2_carbon_dioxide_max: any,
    v2_hydrogen_sulfide_min: any,
    v2_hydrogen_sulfide_max: any,
    v2_mercury_min: any,
    v2_mercury_max: any,
    v2_moisture_min: any,
    v2_moisture_max: any,
};

type FormExampleProps = {
    mode?: 'create' | 'edit' | 'view';
    data?: Partial<FormData>;
    open: boolean;
    zoneMasterData: any;
    entryExitMasterData: any;
    onClose: () => void;
    onSubmit: SubmitHandler<FormData>;
    setResetForm: (reset: () => void) => void;
};

let isReadOnly = true;

const ModalAction: React.FC<FormExampleProps> = ({
    mode = 'create',
    data = {},
    zoneMasterData = {},
    entryExitMasterData = {},
    open,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const { control, register, handleSubmit, setValue, reset, clearErrors, formState: { errors }, watch } = useForm<any>({
        defaultValues: data,
    });

    const labelClass = "block mb-2 text-[14px] font-light"
    const inputClass = "text-[14px] block md:w-full p-2 ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"
    const textErrorClass = "text-red-500 text-sm"

    // const isReadOnly = mode === 'view';
    isReadOnly = mode === "view" ? true : false;
    const [isReadOnly2, setIsReadOnly] = useState<boolean>(isReadOnly);

    useEffect(() => {
        setIsReadOnly(isReadOnly)
    }, [isReadOnly])

    const startDate = watch('start_date');
    // const startDate = new Date();
    const formattedStartDate = formatWatchFormDate(startDate);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    let dataQuality = [
        {
            id: 'v2_wobbe_index',
            name: "Wobbe Index (BTU/SCF)"
        },
        {
            id: 'v2_sat_heating_value',
            name: "Sat. Heating Value (BTU/SCF)"
        },
        {
            id: 'v2_methane',
            name: "Methane (% mol)"
        },
        {
            id: 'v2_c2_plus',
            name: "C2+ (% mol)"
        },
        {
            id: 'v2_oxygen',
            name: "Oxygen (% mol)"
        },
        {
            id: 'v2_nitrogen',
            name: "Nitrogen (% mol)"
        },
        {
            id: 'v2_carbon_dioxide_nitrogen',
            name: "Carbon dioxide + Nitrogen (% mol)"
        },
        {
            id: 'v2_carbon_dioxide',
            name: "Carbon dioxide (% mol)"
        },
        {
            id: 'v2_total_sulphur',
            name: "Total Sulphur (ppm by volume)"
        },
        {
            id: 'v2_hydrogen_sulfide',
            name: "Hydrogen Sulfide (ppm by volume)"
        },
        {
            id: 'v2_hydrocarbon_dew',
            name: "Hydrocarbon Dew Point (Deg. F)"
        },
        {
            id: 'v2_mercury',
            name: "Mercury (ug/m3)"
        },
        {
            id: 'blank',
            name: ""
        },
        {
            id: 'v2_moisture',
            name: "Moisture (Ib/MMSCF)"
        },
    ]

    useEffect(() => {
        const fetchAndSetData = async () => {
            setTabIndex(0);
            if (mode === 'create') {
                setIsLoading(false);
                setIsReadOnly(false);
                setValue('start_date', null);
                setValue('end_date', null);
                setResetForm(() => reset);
            }

            if (mode === 'view') {
                setTabIndex(1);
            }

            if (mode === 'edit' || mode === 'view') {
                setIsLoading(true);

                if (data && mode !== 'view') {

                    const today = new Date();
                    today.setHours(0, 0, 0, 0); // Set today's time to 00:00:00 for comparison

                    const startDate = data.start_date ? new Date(data.start_date) : null;
                    if (startDate) startDate.setHours(0, 0, 0, 0); // Set startDate's time to 00:00:00
                    isReadOnly = startDate && startDate > today ? false : true;
                    setIsReadOnly(startDate && startDate > today ? false : true)
                }

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


                setValue('v2_wobbe_index_min', data?.v2_wobbe_index_min ?? null);
                setValue('v2_wobbe_index_max', data?.v2_wobbe_index_max ?? null);

                setValue('v2_methane_min', data?.v2_methane_min ?? null);
                setValue('v2_methane_max', data?.v2_methane_max ?? null);

                setValue('v2_oxygen_min', data?.v2_oxygen_min ?? null);
                setValue('v2_oxygen_max', data?.v2_oxygen_max ?? null);

                setValue('v2_carbon_dioxide_nitrogen_min', data?.v2_carbon_dioxide_nitrogen_min ?? null);
                setValue('v2_carbon_dioxide_nitrogen_max', data?.v2_carbon_dioxide_nitrogen_max ?? null);

                setValue('v2_total_sulphur_min', data?.v2_total_sulphur_min ?? null);
                setValue('v2_total_sulphur_max', data?.v2_total_sulphur_max ?? null);

                setValue('v2_hydrocarbon_dew_min', data?.v2_hydrocarbon_dew_min ?? null);
                setValue('v2_hydrocarbon_dew_max', data?.v2_hydrocarbon_dew_max ?? null);

                setValue('v2_sat_heating_value_min', data?.v2_sat_heating_value_min ?? null);
                setValue('v2_sat_heating_value_max', data?.v2_sat_heating_value_max ?? null);

                setValue('v2_c2_plus_min', data?.v2_c2_plus_min ?? null);
                setValue('v2_c2_plus_max', data?.v2_c2_plus_max ?? null);

                setValue('v2_nitrogen_min', data?.v2_nitrogen_min ?? null);
                setValue('v2_nitrogen_max', data?.v2_nitrogen_max ?? null);

                setValue('v2_carbon_dioxide_min', data?.v2_carbon_dioxide_min ?? null);
                setValue('v2_carbon_dioxide_max', data?.v2_carbon_dioxide_max ?? null);

                setValue('v2_hydrogen_sulfide_min', data?.v2_hydrogen_sulfide_min ?? null);
                setValue('v2_hydrogen_sulfide_max', data?.v2_hydrogen_sulfide_max ?? null);

                setValue('v2_mercury_min', data?.v2_mercury_min ?? null);
                setValue('v2_mercury_max', data?.v2_mercury_max ?? null);

                setValue('v2_moisture_min', data?.v2_moisture_min ?? null);
                setValue('v2_moisture_max', data?.v2_moisture_max ?? null);

                setTimeout(() => {
                    if (data) { setIsLoading(false); }
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

    const pickerRef = useRef<HTMLDivElement>(null);
    const [showPicker, setShowPicker] = useState(false); // State to control picker visibility
    const [blockPickerColor, setBlockPickerColor] = useState("#37d67a");

    const handleColorClick = () => {
        if (!isReadOnly) {
            setShowPicker((prev) => !prev);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setShowPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [pickerRef]);

    const handleClose = () => {
        onClose();
        setResetForm(() => reset);

        setTimeout(() => {
            setTabIndex(0);
            setIsLoading(true);
        }, 100);
    };

    const toNumber = (val: any) => {
        if (val === null || val === undefined || val === '') return undefined;
        if (typeof val === 'number') return val;
        return Number(String(val).replace(/,/g, ''));
    };

    // #region Confirm Save
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()

    const handleSaveConfirm = async (data?: any) => {
        if (mode == 'create') {
            setIsLoading(true);
            setTimeout(async () => {
                await onSubmit(data);
            }, 100);
        } else {
            setDataSubmit(data)
            setModaConfirmSave(true)
        }
    }

    // const onChangeInput: any = (field: any, value: any, minmax:  'min' | 'max') => {
    //     const getopposite: any = watch(`${field}_${minmax == 'max' ? 'min' : minmax == 'min' && 'max'}`)
    //     if(minmax == 'min'){
    //         setValue(`${field}_min`, value)
    //     }else if(minmax == 'max'){
    //         setValue(`${field}_max`, value)
    //     }
    // }
    const [tk, settk] = useState<boolean>(false);

    // const onChangeInput = (field: string, value: any, minmax: 'min' | 'max') => {
    //     const oppositeKey = `${field}_${minmax === 'max' ? 'min' : 'max'}`;
    //     const currentKey = `${field}_${minmax}`;

    //     const getOppositeRaw = watch(oppositeKey);
    //     let getOpposite = parseFloat(getOppositeRaw);

    //     // ✅ แปลงค่าจาก string -> number อย่างปลอดภัย
    //     let validatedValue: number = parseFloat(value);


    //     const isOppositeValid = getOppositeRaw !== undefined && getOppositeRaw !== null && getOppositeRaw !== '';

    //     if (isOppositeValid && !isNaN(getOpposite)) {
    //         if (minmax === 'min' && validatedValue > getOpposite) {
    //             validatedValue = getOpposite;
    //         } else if (minmax === 'max' && validatedValue < getOpposite) {
    //             validatedValue = getOpposite;
    //         }
    //     }

    //     // ✅ บังคับเป็นทศนิยม 3 ตำแหน่ง
    //     const formattedValue = parseFloat(validatedValue.toFixed(3));

    //     setValue(currentKey, formattedValue);
    //     settk(!tk);
    //     setKey((prevKey) => prevKey + 1);

    // };

    const onChangeInput = (
        field: string,
        value: any,
        minmax: 'min' | 'max',
        range?: { min?: number; max?: number }
    ) => {
        const currentKey = `${field}_${minmax}`;
        let validatedValue = parseFloat(value);

        const oppositeValue = minmax === 'min' ? range?.max : range?.min;

        if (oppositeValue !== undefined && !isNaN(oppositeValue)) {
            if (minmax === 'min' && validatedValue > oppositeValue) {
                validatedValue = oppositeValue;
            } else if (minmax === 'max' && validatedValue < oppositeValue) {
                validatedValue = oppositeValue;
            }
        }

        const formattedValue = parseFloat(validatedValue.toFixed(3));
        setValue(currentKey, formattedValue, {
            shouldValidate: true,
            shouldDirty: true,
        });
        settk(!tk);
    };


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
                            <Spinloading spin={isLoading} rounded={20} /> {/* loading example here */}
                            <div className="flex inset-0 items-center justify-center">
                                <div className="flex flex-col items-center justify-center gap-2 rounded-md ">

                                    <form
                                        className="bg-white p-8 rounded-[20px] shadow-lg max-w "
                                        // onSubmit={handleSubmit(onSubmit)} 
                                        onSubmit={handleSubmit(handleSaveConfirm)}
                                    // onSubmit={handleSubmit(async (data) => { // clear state when submit
                                    //     setIsLoading(true);
                                    //     setTimeout(() => {
                                    //         onSubmit(data);
                                    //     }, 100);
                                    // })}
                                    >
                                        {/* <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-5">{`New Zone / Quality`}</h2> */}
                                        <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-5">{mode == "create" ? `New Zone / Quality` : mode == "edit" ? "Edit Zone / Quality" : "View Zone / Quality"}</h2>
                                        {/* TAB */}
                                        <Tabs
                                            value={tabIndex}
                                            onChange={handleChange}
                                            aria-label="tabs"
                                            TabIndicatorProps={{
                                                sx: {
                                                    backgroundColor: '#00ADEF',
                                                },
                                            }}
                                        >
                                            <Tab
                                                label="Zone"
                                                id="tab-0"
                                                sx={{
                                                    textTransform: 'none',
                                                    fontFamily: 'Tahoma, sans-serif', // Font for unselected state
                                                    fontWeight: 'bold', // Font weight for unselected state
                                                    fontSize: '16px',
                                                    color: '#8D8D8D',
                                                    '&.Mui-selected': {
                                                        color: '#00ADEF',
                                                        fontFamily: 'Tahoma, sans-serif', // Apply Tahoma font when selected
                                                        fontWeight: 'bold', // Make the font bold when selected
                                                    },
                                                }}
                                            />
                                            <Tab
                                                label="Quality"
                                                id="tab-1"
                                                sx={{
                                                    textTransform: 'none',
                                                    fontFamily: 'Tahoma, sans-serif', // Font for unselected state
                                                    fontWeight: 'bold', // Font weight for unselected state
                                                    fontSize: '16px',
                                                    color: '#8D8D8D',
                                                    '&.Mui-selected': {
                                                        color: '#00ADEF',
                                                        fontFamily: 'Tahoma, sans-serif', // Apply Tahoma font when selected
                                                        fontWeight: 'bold', // Make the font bold when selected
                                                    },
                                                }}
                                            />
                                        </Tabs>

                                        <TabPanel value={tabIndex} index={0}>
                                            <div className="grid grid-cols-[330px_330px] gap-5 pt-4">
                                                <div>
                                                    <label htmlFor="name" className={labelClass}>
                                                        <span className="text-red-500">*</span>{`Zone Name`}
                                                    </label>
                                                    <input
                                                        id="name"
                                                        type="text"
                                                        placeholder='Enter Zone Name'
                                                        readOnly={isReadOnly2}
                                                        {...register('name', { required: "Select Zone" })}
                                                        className={`${inputClass} ${errors.name && 'border-red-500'}  ${isReadOnly2 && '!bg-[#EFECEC]'}`}
                                                    />
                                                    {errors.name && <p className="text-red-500 text-sm">{`Enter Zone Name`}</p>}
                                                </div>

                                                <div className="pb-2">
                                                    <label className={labelClass}>{`Color`}</label>
                                                    <div className="flex items-center gap-5">
                                                        <span className={`mr-2 font-light text-sm`}>{`Select your zone color.`}</span>
                                                        {/* <input
                                                        id="color"
                                                        type="color"
                                                        {...register('color')}
                                                        min={formattedStartDate || undefined}
                                                        placeholder={"Select Date"}
                                                        readOnly={isReadOnly}
                                                        disabled={isReadOnly}
                                                        className={`  !w-[70px] ${isReadOnly && '!bg-[#EFECEC]'} `}
                                                    /> */}
                                                        <div className={`!w-[70px]`}>
                                                            {mode !== 'view' ? (
                                                                <>
                                                                    <div
                                                                        className="w-full h-10 bg-[#DFE4EA] rounded-[6px] cursor-pointer border"
                                                                        style={{ backgroundColor: watch("color") }}
                                                                        onClick={handleColorClick}
                                                                    ></div>

                                                                    {/* {showPicker && !isReadOnly2 && ( */}
                                                                    {showPicker && (
                                                                        <div ref={pickerRef} className="absolute z-10 mt-0 -ml-20" >
                                                                            {/* <SketchPicker
                                                                                color={watch("color")}
                                                                                presetColors={["#189bcc", "#2c6fc3", "#fbec5d", "#ea213a", "#eeeeee", "#ff7373", "#267de3", "#4ea27a", "#854442", "#3d4761", "#becc41", "#6b3fa0", "#324033", "#2bbcbb", "#1f2431", "#ff6600", "#ccffcc", "#ff99ff", "#00ffcc", "#663300", "#189bcc", "#2c6fc3", "#fbec5d", "#ea213a"]}
                                                                                {...register("color")}
                                                                                onChange={(color) => {
                                                                                    setValue("color", color.hex)
                                                                                    setBlockPickerColor(color.hex);
                                                                                }}
                                                                            /> */}
                                                                            <input
                                                                                type="hidden"
                                                                                {...register("color")}
                                                                            />

                                                                            <SketchPicker
                                                                                color={watch("color")}
                                                                                presetColors={[
                                                                                    "#189bcc",
                                                                                    "#2c6fc3",
                                                                                    "#fbec5d",
                                                                                    "#ea213a",
                                                                                    "#eeeeee",
                                                                                    "#ff7373",
                                                                                    "#267de3",
                                                                                    "#4ea27a",
                                                                                    "#854442",
                                                                                    "#3d4761",
                                                                                    "#becc41",
                                                                                    "#6b3fa0",
                                                                                    "#324033",
                                                                                    "#2bbcbb",
                                                                                    "#1f2431",
                                                                                    "#ff6600",
                                                                                    "#ccffcc",
                                                                                    "#ff99ff",
                                                                                    "#00ffcc",
                                                                                    "#663300",
                                                                                ]}
                                                                                onChange={(color) => {
                                                                                    const {
                                                                                        r,
                                                                                        g,
                                                                                        b,
                                                                                        a = 1,
                                                                                    } = color.rgb;

                                                                                    const rgbaColor =
                                                                                        `rgba(${r}, ${g}, ${b}, ${a})`;

                                                                                    setValue("color", rgbaColor, {
                                                                                        shouldDirty: true,
                                                                                        shouldValidate: true,
                                                                                    });

                                                                                    setBlockPickerColor(rgbaColor);
                                                                                }}
                                                                            />

                                                                            {/* <SketchPicker
                                                                            color={watch("color")}
                                                                            presetColors={["#189bcc", "#2c6fc3", "#fbec5d", "#ea213a", "#eeeeee", "#ff7373", "#267de3", "#4ea27a", "#854442", "#3d4761", "#becc41", "#6b3fa0", "#324033", "#2bbcbb", "#1f2431", "#ff6600", "#ccffcc", "#ff99ff", "#00ffcc", "#663300", "#189bcc", "#2c6fc3", "#fbec5d", "#ea213a"]}
                                                                            onChange={(color) => {
                                                                                const rgbaColor = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
                                                                                setValue("color", rgbaColor); // Store RGBA format instead of HEX
                                                                                setBlockPickerColor(rgbaColor);
                                                                            }}
                                                                        /> */}

                                                                        </div>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <div
                                                                    className="w-full h-10 bg-[#DFE4EA] rounded-[6px]"
                                                                    style={{ backgroundColor: watch("color") }}
                                                                ></div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label htmlFor="entry_exit_id" className={labelClass}>
                                                        <span className="text-red-500">*</span>{`Entry/Exit`}
                                                    </label>

                                                    <SelectFormProps
                                                        id={'entry_exit_id'}
                                                        register={register("entry_exit_id", { required: "Select Entry / Exit" })}
                                                        disabled={isReadOnly2}
                                                        valueWatch={watch("entry_exit_id") || ""}
                                                        handleChange={(e) => {
                                                            setValue("entry_exit_id", e.target.value);
                                                            setValue("supply_reference_quality_area", null);
                                                            if (errors?.entry_exit_id) { clearErrors('entry_exit_id') }
                                                        }}
                                                        errors={errors?.entry_exit_id}
                                                        errorsText={'Select Entry / Exit'}
                                                        options={entryExitMasterData}
                                                        optionsKey={'id'}
                                                        optionsValue={'id'}
                                                        optionsText={'name'}
                                                        optionsResult={'name'}
                                                        placeholder={'Select Entry / Exit'}
                                                        pathFilter={'name'}
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="description" className={`${labelClass} mb-[9px]`}>
                                                        {`Description`}
                                                    </label>
                                                    <input
                                                        id="description"
                                                        type="text"
                                                        placeholder='Enter Description'
                                                        {...register('description')}
                                                        // readOnly={isReadOnly2}
                                                        readOnly={mode === "view" ? true : false}
                                                        className={`${inputClass} ${mode === "view" && '!bg-[#EFECEC]'} ${errors.description && 'border-red-500'}`}
                                                    />
                                                </div>

                                                <div className="pb-2">
                                                    <label className={labelClass}><span className="text-red-500">*</span>{`Start Date`}</label>
                                                    <DatePickaForm
                                                        {...register('start_date', { required: "Select start date" })}
                                                        readOnly={isReadOnly2}
                                                        placeHolder="Select Start Date"
                                                        mode={mode}
                                                        valueShow={watch("start_date") && dayjs(watch("start_date")).format("DD/MM/YYYY")}
                                                        // min={formattedStartDate || undefined}
                                                        min={new Date()}
                                                        maxNormalForm={watch('end_date') && watch('end_date')} // ไม่ให้ start_date เกิน end_date
                                                        allowClear
                                                        isError={errors.start_date && !watch("start_date") ? true : false}
                                                        onChange={(e: any) => { setValue('start_date', formatFormDate(e)), e == undefined && setValue('start_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                                    />
                                                    {errors.start_date && !watch("start_date") && <p className={`${textErrorClass}`}>{'Select Start Date'}</p>}
                                                </div>

                                                <div className="pb-2">
                                                    <label className={`${labelClass} mb-[10px]`}>{`End Date`}</label>
                                                    <DatePickaForm
                                                        {...register('end_date')}
                                                        readOnly={!formattedStartDate ? true : isReadOnly}
                                                        placeHolder="Select End Date"
                                                        mode={mode}
                                                        // min={formattedStartDate || undefined}
                                                        min={getMinDate(formattedStartDate)}
                                                        valueShow={watch("end_date") ? dayjs(watch("end_date")).format("DD/MM/YYYY") : undefined}
                                                        allowClear
                                                        onChange={(e: any) => { setValue('end_date', formatFormDate(e)), e == undefined && setValue('end_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                                    />
                                                </div>

                                            </div>
                                        </TabPanel>

                                        <TabPanel value={tabIndex} index={1}>
                                            {/* <div key='zone_div' className="w-[1200px] grid grid-cols-[200px_120px_140px_200px_120px_120px] gap-2 pt-4"> */}
                                            <div key='zone_div' className="w-[1200px] grid grid-cols-[200px_180px_180px_200px_180px_180px] gap-2 pt-4">
                                                <div className="font-bold">Parameter</div>
                                                <div className="text-[#24AB6A]">Min</div>
                                                <div className="text-[#FD3D44]">Max</div>
                                                <div className="font-bold">Parameter</div>
                                                <div className="text-[#24AB6A]">Min</div>
                                                <div className="text-[#FD3D44]">Max</div>

                                                {dataQuality.map((item, index) => (
                                                    <>
                                                        <div key={"quality_label_" + index} className="font-light text-sm">
                                                            {item.name}
                                                        </div>
                                                        <div key={"quality_min_" + index} >
                                                            {/* {
                                                                item?.name !== "" && <NumericFormat
                                                                    id={`${item.id}_min`}
                                                                    placeholder="0.000"
                                                                    value={watch(`${item.id}_min`)}
                                                                    readOnly={isReadOnly}
                                                                    {...register(`${item.id}_min`)}
                                                                    onValueChange={({ value }) => {
                                                                        const max = parseFloat(watch(`${item.id}_max`) || Number.MAX_SAFE_INTEGER);
                                                                        setValue(`${item.id}_min`, value);

                                                                        setTimeout(() => {
                                                                            onChangeInput(item?.id, value == '-' ? -1 : value, 'min', { max });
                                                                        }, 0);
                                                                    }}
                                                                    isAllowed={({ floatValue }) => {
                                                                        const max = parseFloat(watch(`${item.id}_max`) || Number.MAX_SAFE_INTEGER);

                                                                        if (floatValue === undefined) return true;
                                                                        if (isNaN(max)) return true;
                                                                        return floatValue <= max;
                                                                    }}
                                                                    className={`"text-sm block md:w-full !w-full p-2 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]" ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                                    thousandSeparator={true}
                                                                    decimalScale={3}
                                                                    fixedDecimalScale={true}
                                                                    allowNegative={true}
                                                                    displayType="input"
                                                                    max={watch(`${item.id}_max`) ?? Number.MAX_VALUE}
                                                                    disabled={isReadOnly}
                                                                />
                                                            } */}
                                                            {
                                                                item?.name !== "" && <NumericFormat
                                                                    id={`${item.id}_min`}
                                                                    placeholder="0.000"
                                                                    value={watch(`${item.id}_min`)}
                                                                    {...register(`${item.id}_min`)}
                                                                    thousandSeparator
                                                                    decimalScale={3}
                                                                    fixedDecimalScale
                                                                    allowNegative
                                                                    disabled={isReadOnly}
                                                                    readOnly={isReadOnly}
                                                                    className={`text-sm block w-full p-2 h-[44px] rounded-lg border border-[#DFE4EA] text-right ${isReadOnly ? "!bg-[#EFECEC]" : "bg-white"}`}
                                                                    onValueChange={({ value }) => {
                                                                        setValue(`${item.id}_min`, value);
                                                                    }}
                                                                    onBlur={() => {
                                                                        const min = toNumber(watch(`${item.id}_min`));
                                                                        const max = toNumber(watch(`${item.id}_max`));

                                                                        if (min == null) return;

                                                                        // ถ้ามี max อยู่แล้ว และ min > max → บังคับให้ max = min
                                                                        if (max != null && min > max) {
                                                                            setValue(`${item.id}_max`, String(min), { shouldValidate: true });
                                                                        }

                                                                        onChangeInput(item?.id, min, "min", { max });
                                                                    }}
                                                                />
                                                            }
                                                        </div>
                                                        <div key={"quality_max_" + index}>
                                                            {/* {
                                                                item?.name !== "" && <NumericFormat
                                                                    id={`${item.id}_max`}
                                                                    placeholder="0.000"
                                                                    value={watch(`${item.id}_max`)}
                                                                    // readOnly={isReadOnly}
                                                                    {...register(`${item.id}_max`)}
                                                                    onValueChange={({ value }) => {
                                                                        const min = parseFloat(watch(`${item.id}_min`) || Number.MIN_SAFE_INTEGER);
                                                                        setTimeout(() => {
                                                                            onChangeInput(item?.id, value == '-' ? -1 : value, 'max', { min });
                                                                        }, 0);
                                                                    }}
                                                                    isAllowed={({ floatValue }) => {
                                                                        const min = parseFloat(watch(`${item.id}_min`) || Number.MIN_SAFE_INTEGER);

                                                                        if (floatValue === undefined) return true; // อนุญาตให้ลบหมด

                                                                        return floatValue >= min;
                                                                    }}
                                                                    className={`"text-sm block md:w-full !w-full p-2 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]" ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                                    thousandSeparator={true}
                                                                    decimalScale={3}
                                                                    fixedDecimalScale={true}
                                                                    allowNegative={true}
                                                                    displayType="input"
                                                                    disabled={isReadOnly}
                                                                    readOnly={isReadOnly}

                                                                    min={watch(`${item.id}_min`) ?? Number.MIN_VALUE}
                                                                />
                                                            } */}
                                                            {
                                                                item?.name !== "" && <NumericFormat
                                                                    id={`${item.id}_max`}
                                                                    placeholder="0.000"
                                                                    value={watch(`${item.id}_max`)}
                                                                    {...register(`${item.id}_max`)}
                                                                    thousandSeparator
                                                                    decimalScale={3}
                                                                    fixedDecimalScale
                                                                    allowNegative
                                                                    disabled={isReadOnly}
                                                                    readOnly={isReadOnly}
                                                                    className={`text-sm block w-full p-2 h-[44px] rounded-lg border border-[#DFE4EA] text-right ${isReadOnly ? "!bg-[#EFECEC]" : "bg-white"
                                                                        }`}
                                                                    onValueChange={({ value }) => {
                                                                        setValue(`${item.id}_max`, value);
                                                                    }}
                                                                    onBlur={() => {
                                                                        const min = toNumber(watch(`${item.id}_min`));
                                                                        const max = toNumber(watch(`${item.id}_max`));

                                                                        if (max == null) return;

                                                                        // ถ้ามี min แล้ว และ max < min → บังคับให้ max = min
                                                                        if (min != null && max < min) {
                                                                            setValue(`${item.id}_max`, String(min), { shouldValidate: true });
                                                                        }

                                                                        onChangeInput(item?.id, max, "max", { min });
                                                                    }}
                                                                />
                                                            }
                                                        </div>
                                                    </>
                                                ))}

                                            </div>
                                        </TabPanel>

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

            <ModalConfirmSave
                open={modaConfirmSave}
                handleClose={(e: any) => {
                    setModaConfirmSave(false);
                    if (e == "submit") {
                        setIsLoading(true);
                        setTimeout(async () => {
                            await onSubmit(dataSubmit);
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