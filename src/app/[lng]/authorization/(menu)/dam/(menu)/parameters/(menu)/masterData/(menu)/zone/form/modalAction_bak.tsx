import React, { useRef } from "react";
import { useForm, SubmitHandler } from 'react-hook-form';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useEffect, useState } from "react";
import { formatFormDate, formatWatchFormDate } from '@/utils/generalFormatter';
import { Tab, Tabs, Typography } from '@mui/material';
import { TabPanel } from '@/components/other/tabPanel';
import DatePickaForm from '@/components/library/dateRang/dateSelectForm';
import dayjs from 'dayjs';
import { NumericFormat } from 'react-number-format';
import { SketchPicker } from 'react-color';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

type FormData = {
    name: string;
    description: string;
    entry_exit_id: string;
    start_date: Date | null;
    end_date: Date;
    color: string;

    c1_min: any;
    c1_max: any;
    c3_min: any;
    c3_max: any;
    k5_min: any;
    k5_max: any;
    c7_min: any;
    c7_max: any;
    oxygen_min: any;
    oxygen_max: any;
    mercury_min: any;
    mercury_max: any;
    wobbe_index_min: any;
    wobbe_index_max: any;
    c2_min: any;
    c2_max: any;
    ic4_min: any;
    ic4_max: any;
    nc5_min: any;
    nc5_max: any;
    carbon_dioxide_min: any;
    carbon_dioxide_max: any;
    dew_point_min: any;
    dew_point_max: any;
    hydrogen_suifide_min: any;
    hydrogen_suifide_max: any;
    sg_min: any;
    sg_max: any;
    c2_plus_min: any;
    c2_plus_max: any;
    nc4_min: any;
    nc4_max: any;
    c6_min: any;
    c6_max: any;
    nitrogen_min: any;
    nitrogen_max: any;
    moisture_min: any;
    moisture_max: any;
    total_sulphur_min: any;
    total_sulphur_max: any;
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
    const { control, register, handleSubmit, setValue, reset, formState: { errors }, watch } = useForm<any>({ defaultValues: data });

    const labelClass = "block mb-2 text-sm font-light"
    const inputClass = "text-sm block md:w-full p-2 ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"
    const selectboxClass = "flex w-full h-[44px] p-1 ps-1 pe-2 !rounded-lg text-gray-900 text-sm block outline-none"
    const textErrorClass = "text-red-500 text-sm"

    const isReadOnly = mode === 'view';
    const startDate = watch('start_date');
    // const startDate = new Date();
    const formattedStartDate = formatWatchFormDate(startDate);

    let dataQuality = [
        {
            id: 'c1',
            name: "C1 (% mol)"
        },
        {
            id: 'wobbe_index',
            name: "Wobbe Index(BTU/SCF)"
        },
        {
            id: 'sg',
            name: "SG (Unitless)"
        },
        {
            id: 'c3',
            name: "C3 (% mol)"
        },
        {
            id: 'c2',
            name: "C2 (% mol)"
        },
        {
            id: 'c2_plus',
            name: "C2+ (% mol)"
        },
        {
            id: 'k5',
            name: "K5 (% mol)"
        },
        {
            id: 'ic4',
            name: "IC4 (% mol)"
        },
        {
            id: 'nc4',
            name: "nC4 (% mol)"
        },
        {
            id: 'c7',
            name: "C7 (% mol)"
        },
        {
            id: 'nc5',
            name: "nC5 (% mol)"
        },
        {
            id: 'c6',
            name: "C6 (% mol)"
        },
        {
            id: 'oxygen',
            name: "Oxygen (% mol)"
        },
        {
            id: 'carbon_dioxide',
            name: "Carbon dioxide (% mol)"
        },
        {
            id: 'nitrogen',
            name: "Nitrogen (% mol)"
        },
        {
            id: 'mercury',
            name: "Mercury (μg/m3)"
        },
        {
            id: 'dew_point',
            name: "Dew point (Deg.F)"
        },
        {
            id: 'moisture',
            name: "Moisture (lb/MMscf)"
        },
        {
            id: 'hydrogen_suifide',
            name: "Hydrogen Suifide (ppm by volume)"
        },
        {
            id: 'total_sulphur',
            name: "Total Sulphur (ppm by volume)"
        },
    ]

    useEffect(() => {
        if (mode === 'edit' || mode === 'view') {
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

            setValue('c1_min', data?.c1_min || null);
            setValue('c1_max', data?.c1_max || null);

            setValue('c3_min', data?.c3_min || null);
            setValue('c3_max', data?.c3_max || null);

            setValue('k5_min', data?.k5_min || null);
            setValue('k5_max', data?.k5_max || null);

            setValue('c7_min', data?.c7_min || null);
            setValue('c7_max', data?.c7_max || null);

            setValue('oxygen_min', data?.oxygen_min || null);
            setValue('oxygen_max', data?.oxygen_max || null);

            setValue('mercury_min', data?.mercury_min || null);
            setValue('mercury_max', data?.mercury_max || null);

            setValue('wobbe_index_min', data?.wobbe_index_min || null);
            setValue('wobbe_index_max', data?.wobbe_index_max || null);

            setValue('c2_min', data?.c2_min || null);
            setValue('c2_max', data?.c2_max || null);

            setValue('ic4_min', data?.ic4_min || null);
            setValue('ic4_max', data?.ic4_max || null);

            setValue('nc5_min', data?.nc5_min || null);
            setValue('nc5_max', data?.nc5_max || null);

            setValue('carbon_dioxide_min', data?.carbon_dioxide_min || null);
            setValue('carbon_dioxide_max', data?.carbon_dioxide_max || null);

            setValue('dew_point_min', data?.dew_point_min || null);
            setValue('dew_point_max', data?.dew_point_max || null);

            setValue('hydrogen_suifide_min', data?.hydrogen_suifide_min || null);
            setValue('hydrogen_suifide_max', data?.hydrogen_suifide_max || null);

            setValue('sg_min', data?.sg_min || null);
            setValue('sg_max', data?.sg_max || null);

            setValue('c2_plus_min', data?.c2_plus_min || null);
            setValue('c2_plus_max', data?.c2_plus_max || null);

            setValue('nc4_min', data?.nc4_min || null);
            setValue('nc4_max', data?.nc4_max || null);

            setValue('c6_min', data?.c6_min || null);
            setValue('c6_max', data?.c6_max || null);

            setValue('nitrogen_min', data?.nitrogen_min || null);
            setValue('nitrogen_max', data?.nitrogen_max || null);

            setValue('moisture_min', data?.moisture_min || null);
            setValue('moisture_max', data?.moisture_max || null);

            setValue('total_sulphur_min', data?.total_sulphur_min || null);
            setValue('total_sulphur_max', data?.total_sulphur_max || null);

        }

    }, [data, mode, setValue]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    const [tabIndex, setTabIndex] = useState(0);
    const handleChange = (event: any, newValue: any) => {
        setTabIndex(newValue);
    };

    const [inputValues, setInputValues] = useState(
        dataQuality.reduce((acc: any, item) => {
            acc[item.id] = { min: '', max: '' };
            return acc;
        }, {})
    );

    const handleInputChange = (id: any, type: any, value: any) => {
        setInputValues((prevState: any) => {
            let newValues = { ...prevState[id], [type]: value, error: '' };

            const min = Number(newValues.min);
            const max = Number(newValues.max);

            // Validate Min and Max values while typing
            // if (type === 'min' && value !== '' && value > max && max !== null) {
            //     newValues.error = 'Min cannot be more than Max';
            // }

            // if (type === 'max' && value !== '' && value < min && min !== null) {
            //     newValues.error = 'Max cannot be less than Min';
            // }

            return { ...prevState, [id]: newValues };
        });
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

    return (
        <Dialog open={open} onClose={onClose} className="relative z-30">
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
                            <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-md ">

                                <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-[20px] shadow-lg max-w">
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
                                            label="New Zone xx"
                                            id="tab-0"
                                            sx={{
                                                textTransform: 'none',
                                                color: '#8D8D8D',
                                                '&.Mui-selected': {
                                                    color: '#00ADEF',
                                                    fontFamily: 'Tahoma, sans-serif', // Apply Tahoma font when selected
                                                    fontWeight: 'bold', // Make the font bold when selected
                                                },
                                            }}
                                        />
                                        <Tab
                                            label="New Quality"
                                            id="tab-1"
                                            sx={{
                                                textTransform: 'none',
                                                color: '#8D8D8D',
                                                fontFamily: 'Tahoma, sans-serif !important', // Force Tahoma font
                                                fontWeight: 'bold !important', // Force bold
                                                '&.Mui-selected': {
                                                    color: '#00ADEF',
                                                },
                                            }}
                                        />
                                    </Tabs>

                                    <TabPanel value={tabIndex} index={0}>
                                        <div className="grid grid-cols-[330px_330px] gap-2 pt-4">
                                            <div>
                                                <label htmlFor="name" className="block mb-2 text-sm font-light">
                                                    <span className="text-red-500">*</span>{`Zone Name`}
                                                </label>
                                                <input
                                                    id="name"
                                                    type="text"
                                                    placeholder='Enter Zone Name'
                                                    readOnly={isReadOnly}
                                                    {...register('name', { required: "Select Zone" })}
                                                    className={`${inputClass} ${errors.name && 'border-red-500'}  ${isReadOnly && '!bg-[#EFECEC]'} uppercase`}
                                                />
                                                {errors.name && <p className="text-red-500 text-sm">{`Type Zone Name`}</p>}
                                            </div>

                                            <div className="pb-2">
                                                <label className={labelClass}>{`Color`}</label>
                                                <div className="flex items-center gap-5">
                                                    <span className={`mr-2 font-light text-sm `}>{`Select your zone color.`}</span>
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
                                                        {!isReadOnly ? (
                                                            <>
                                                                <div
                                                                    className="w-full h-10 bg-[#DFE4EA] rounded-[6px] cursor-pointer border"
                                                                    style={{ backgroundColor: watch("color") }}
                                                                    onClick={handleColorClick}
                                                                ></div>

                                                                {showPicker && !isReadOnly && (
                                                                    <div ref={pickerRef} className="absolute z-10 mt-0 -ml-20" >
                                                                        <SketchPicker
                                                                            color={watch("color")}
                                                                            presetColors={["#189bcc", "#2c6fc3", "#fbec5d", "#ea213a", "#eeeeee", "#ff7373", "#267de3", "#4ea27a", "#854442", "#3d4761", "#becc41", "#6b3fa0", "#324033", "#2bbcbb", "#1f2431", "#ff6600", "#ccffcc", "#ff99ff", "#00ffcc", "#663300", "#189bcc", "#2c6fc3", "#fbec5d", "#ea213a"]}
                                                                            {...register("color")}
                                                                            onChange={(color) => {
                                                                                setValue("color", color.hex)
                                                                                setBlockPickerColor(color.hex);
                                                                            }}
                                                                        />
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
                                                <label htmlFor="entry_exit_id" className="block mb-2 text-sm font-light">
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
                                                        // fetchData(e?.target);
                                                    }}
                                                    displayEmpty
                                                    renderValue={(value: any) => {
                                                        if (!value) {
                                                            return <Typography color="#9CA3AF" fontSize={14}>Select Entry/Exit</Typography>;
                                                        }
                                                        return entryExitMasterData.find((item: any) => item.id === value)?.name || '';
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
                                                            {item.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                {errors.entry_exit_id && <p className="text-red-500 text-sm">{`Select Entry / Exit`}</p>}
                                            </div>

                                            <div>
                                                <label htmlFor="description" className="block mb-2 text-sm font-light">
                                                    {`Description`}
                                                </label>
                                                <input
                                                    id="description"
                                                    type="text"
                                                    placeholder='Enter Description'
                                                    {...register('description')}
                                                    readOnly={isReadOnly}
                                                    className={`${inputClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.description && 'border-red-500'}`}
                                                />
                                            </div>

                                            <div className="pb-2">
                                                <label className={labelClass}><span className="text-red-500">*</span>{`Start Date`}</label>
                                                {/* <DatePickaForm
                                                    {...register('start_date', { required: "Select start date" })}
                                                    readOnly={isReadOnly}
                                                    placeHolder="Start Date"
                                                    mode={mode}
                                                    valueShow={dayjs(watch("start_date")).format("DD/MM/YYYY")}
                                                    // valueShow={watch("start_date")}
                                                    allowClear
                                                    onChange={(e: any) => { setValue('start_date', formatFormDate(e)), e == undefined && setValue('start_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                                />
                                                {errors.start_date && <p className={`${textErrorClass}`}>{`Select Start Date`}</p>} */}
                                                <DatePickaForm
                                                    {...register('start_date', { required: "Select start date" })}
                                                    readOnly={isReadOnly}
                                                    placeHolder="Select Start Date"
                                                    mode={mode}
                                                    valueShow={watch("start_date") && dayjs(watch("start_date")).format("DD/MM/YYYY")}
                                                    min={formattedStartDate || undefined}
                                                    maxNormalForm={watch('end_date') && watch('end_date')} // ไม่ให้ start_date เกิน end_date
                                                    allowClear
                                                    isError={errors.start_date && !watch("start_date") ? true : false}
                                                    onChange={(e: any) => { setValue('start_date', formatFormDate(e)), e == undefined && setValue('start_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                                />
                                                {errors.start_date && !watch("start_date") && <p className={`${textErrorClass}`}>{'Select Start Date'}</p>}
                                            </div>

                                            <div className="pb-2">
                                                <label className={labelClass}>{`End Date`}</label>
                                                {/* <DatePickaForm
                                                    {...register('end_date')}
                                                    readOnly={isReadOnly}
                                                    placeHolder="End Date"
                                                    mode={mode}
                                                    min={formattedStartDate || undefined}
                                                    valueShow={dayjs(watch("end_date")).format("DD/MM/YYYY")}
                                                    allowClear
                                                    onChange={(e: any) => { setValue('end_date', formatFormDate(e)), e == undefined && setValue('end_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                                /> */}
                                                <DatePickaForm
                                                    {...register('end_date')}
                                                    readOnly={!formattedStartDate ? true : isReadOnly}
                                                    placeHolder="Select End Date"
                                                    mode={mode}
                                                    min={formattedStartDate || undefined}
                                                    valueShow={watch("end_date") ? dayjs(watch("end_date")).format("DD/MM/YYYY") : undefined}
                                                    allowClear
                                                    onChange={(e: any) => { setValue('end_date', formatFormDate(e)), e == undefined && setValue('end_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                                />
                                            </div>


                                        </div>
                                    </TabPanel>

                                    <TabPanel value={tabIndex} index={1}>
                                        <div className="w-full grid grid-cols-9 gap-2 pt-4">
                                            <div className="font-bold">Parameter</div>
                                            <div className="text-[#24AB6A]">Min</div>
                                            <div className="text-[#FD3D44]">Max</div>
                                            <div className="font-bold">Parameter</div>
                                            <div className="text-[#24AB6A]">Min</div>
                                            <div className="text-[#FD3D44]">Max</div>
                                            <div className="font-bold">Parameter</div>
                                            <div className="text-[#24AB6A]">Min</div>
                                            <div className="text-[#FD3D44]">Max</div>

                                            {dataQuality.map((item, index) => (
                                                <>
                                                    <div key={item.id} className="font-light text-sm">
                                                        {item.name}
                                                    </div>
                                                    <div>
                                                        {/* <input
                                                            type="number"
                                                            className={`border rounded-lg p-1 w-[120px] h-[40px] text-center ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                            readOnly={isReadOnly}
                                                            step="0.001"
                                                            {...register(`${item.id}_min`)}
                                                            // placeholder="Min"
                                                            // value={inputValues[item.id].min}
                                                            // defaultValue={0}
                                                            // name={`${item.id}_min`}
                                                            id={`${item.id}_min`}
                                                            // onChange={(e) => handleInputChange(item.id, 'min', e.target.value)}
                                                        /> */}

                                                        <NumericFormat
                                                            id={`${item.id}_min`}
                                                            placeholder="0.000"
                                                            value={watch(`${item.id}_min`)}
                                                            readOnly={isReadOnly}
                                                            {...register(`${item.id}_min`)}
                                                            className={`border rounded-lg p-1 w-[120px] h-[40px] text-center ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                            thousandSeparator={true}
                                                            decimalScale={3}
                                                            fixedDecimalScale={true}
                                                            allowNegative={false}
                                                            displayType="input"
                                                            onValueChange={(values) => {
                                                                const { value } = values;
                                                                setValue(`${item.id}_min`, value, { shouldValidate: true, shouldDirty: true });
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        {/* <input
                                                            type="number"
                                                            className={`border rounded-lg p-1 w-[120px] h-[40px] text-center ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                            step="0.001"
                                                            readOnly={isReadOnly}
                                                            // {...register(item.id + "_min")}
                                                            {...register(`${item.id}_max`)}
                                                            // placeholder="Max"
                                                            // value={inputValues[item.id].max}
                                                            // name={`${item.id}_max`}
                                                            id={`${item.id}_max`}
                                                            // defaultValue={0}
                                                            // onChange={(e) => handleInputChange(item.id, 'max', e.target.value)}
                                                        /> */}

                                                        <NumericFormat
                                                            id={`${item.id}_max`}
                                                            placeholder="0.000"
                                                            value={watch(`${item.id}_max`)}
                                                            readOnly={isReadOnly}
                                                            {...register(`${item.id}_max`)}
                                                            className={`border rounded-lg p-1 w-[120px] h-[40px] text-center ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                            thousandSeparator={true}
                                                            decimalScale={3}
                                                            fixedDecimalScale={true}
                                                            allowNegative={false}
                                                            displayType="input"
                                                            onValueChange={(values) => {
                                                                const { value } = values;
                                                                setValue(`${item.id}_max`, value, { shouldValidate: true, shouldDirty: true });
                                                            }}
                                                        />
                                                    </div>
                                                    {/* Error Message */}
                                                    {/* {inputValues[item.id].error && (
                                                        <div className="col-span-3 text-red-500 text-sm">{inputValues[item.id].error}</div>
                                                    )} */}
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


                                        {/* <button type="submit" className="w-[167px] font-light bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
                                            Add
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
    );
};

export default ModalAction;