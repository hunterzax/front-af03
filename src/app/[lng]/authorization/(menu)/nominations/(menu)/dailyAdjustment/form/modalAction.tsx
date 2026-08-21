import React from "react";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useEffect, useState } from "react";
import { Checkbox, ListItemText, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DatePickaForm from "@/components/library/dateRang/dateSelectForm";
import { formatFormDate } from "@/utils/generalFormatter";
import dayjs from "dayjs";
import { map24hour, map15mins } from "../../../../dam/(menu)/parameters/data";
import { NumericFormat } from "react-number-format";
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RemoveOutlinedIcon from '@mui/icons-material/RemoveOutlined';
import { unitMaster } from "./mockData";
import { getService } from "@/utils/postService";
import ModalComponent from "@/components/other/ResponseModal";
import getUserValue from "@/utils/getuserValue";
import SelectFormProps from "@/components/other/selectProps";

type FormExampleProps = {
    mode?: "create" | "edit" | "view" | "period";
    data?: Partial<any>;
    open: boolean;
    dataTable?: any;
    dataShipper?: any;
    nominationTypeMaster?: any;
    entryExitMasterData: any;
    nominationPointData?: any;
    areaMaster: any;
    onClose: () => void;
    onSubmit: SubmitHandler<any>;
    setResetForm: (reset: () => void) => void;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode,
    data = {
        rows: [
            { nomination_point_id: "", nomination_point: "", heating_value: "", volume: "", unit: "", cal_volume: "", unit2: "" },
        ]
    },
    dataTable = {},
    open,
    dataShipper,
    entryExitMasterData,
    areaMaster,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const { control, register, handleSubmit, setValue, reset, clearErrors, resetField, formState: { errors }, watch } = useForm<any>({ defaultValues: data, mode: 'onSubmit' });

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "rows",
    });

    const userDT: any = getUserValue();

    // 1. field ด้านบน รายชื่อ shipper ให้ดึงจากเส้นนี้
    // daily-adjustment/shipper-data
    // select box area ให้ใช้ res จากเส้นข้างบนมา map ดังนี้ query_shipper_nomination_file.nomination_version.nomination_row_json.area_text กับ query_shipper_nomination_file.nomination_version.nomination_row_json.areaId

    // 2. หลังจากเลือกฟิลด์ข้างบนหมดแล้วยิงเส้นนี้
    // daily-adjustment/nomination-point-data?shipper_id=[49]&entry_exit_id=1&area_id=31&gas_day=2025-06-11&time=15:30
    // จะได้ข้อมูล nom มา map ลง fields ด้านล่าง

    const [modaSubmitConfirm, setModaSubmitConfirm] = useState<any>(false)

    const labelClass = "block mb-2 text-sm font-light";
    const inputClass = "text-sm block md:w-full !text-[14px] p-2 ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]";
    const selectboxClass = "flex w-full h-[44px] p-1 ps-1 pe-2 !rounded-lg text-gray-900 block outline-none";
    const textErrorClass = "text-red-500 text-sm";
    const itemselectClass = "pl-[10px] text-[14px]"

    // const isReadOnly = (mode === "view" || mode === 'edit');
    const isReadOnly = (mode === "view");

    useEffect(() => {
        const fetchAndSetData = async () => {
            if (mode == 'create') {
                setBtnEnable(false);
                clearErrors();
            } else if (mode === "edit" || mode === "view") {
                setValue("shipper_id", data?.group?.id || "");
                setValue("contract_code_id", data?.contract_code.id || "");
                setValue("document_type", data?.nomination_type?.id || "");
                // setValue("comment", data?.upload_template_for_shipper_comment?.length > 0 ? data?.upload_template_for_shipper_comment?.[0]?.comment : '');
                // {setFileName(data?.upload_template_for_shipper_file?.length > 0 && data?.upload_template_for_shipper_file?.[0]?.url !== null ? cutUploadFileName(data?.upload_template_for_shipper_file?.[0]?.url) : 'Maximum File 10 MB')}
            }
        }
        fetchAndSetData();
    }, [data, mode, setValue]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    useEffect(() => {
        if (userDT?.account_manage?.[0]?.user_type_id === 3) {
            setValue("shipper_id", [userDT?.account_manage?.[0]?.group_id]);
        }
    }, [])

    // MULTI SELECT SHIPPER
    const [selectedShippers, setSelectedShippers] = useState<string[]>([]);
    // const handleSelectChange = (event: any) => {
    //     const value = event.target.value;
    //     if (value.includes("all")) {
    //         // If "Select All" is checked, select all shippers; otherwise, clear selection
    //         setSelectedShippers(selectedShippers.length === dataShipper.length ? [] : dataShipper.map((item: any) => item.id));
    //     } else {
    //         setSelectedShippers(value);
    //     }
    //     clearErrors('shipper_id')
    //     setValue("shipper_id", value);
    // };

    const handleSelectChange = (event: any) => {
        const value = event.target.value;

        if (value.includes("all")) {
            // Use shipperData instead of dataShipper
            setSelectedShippers(selectedShippers.length === shipperData.length ? [] : shipperData.map((item: any) => item.id));
            setValue("shipper_id", selectedShippers.length === shipperData.length ? [] : shipperData.map((item: any) => item.id));
        } else {
            setSelectedShippers(value);
            setValue("shipper_id", value);
        }
        clearErrors('shipper_id');
    };

    // useEffect(() => {
    //     // New > ถ้า Shipper เป็นคน Adjust Field Shipper Name จะ Fix ชื่อไว้เลย เลือกไม่ได้ ตาม figma https://app.clickup.com/t/86erx36bp
    //     if(userDT?.account_manage?.[0]?.user_type_id == 3){
    //         setSelectedShippers([userDT?.account_manage?.[0]?.group_id])
    //         setValue("shipper_id", userDT?.account_manage?.[0]?.group_id);
    //     }
    // }, [userDT])

    const [filteredMap24hour, setFilteredMap24hour] = useState<any>(map24hour)
    const [filteredMap15mins, setFilteredMap15mins] = useState<any>(map15mins)

    // useEffect(() => {
    //     const today = dayjs().format("YYYY-MM-DD");
    //     const today2 = new Date();
    //     const gasDay = watch("gas_day");
    //     const currentHour = today2.getHours();
    //     const currentMinutes = today2.getMinutes();

    //     const isToday = gasDay === today;

    //     if (isToday) {
    //         setFilteredMap24hour(map24hour.filter(hour => hour.id >= currentHour));

    //         if (watch('hour') == currentHour) {
    //             setFilteredMap15mins(map15mins.filter(min => parseInt(min.name) > (Math.floor(currentMinutes / 15) * 15)));
    //         } else {
    //             setFilteredMap15mins(map15mins);
    //         }
    //     } else {
    //         setFilteredMap24hour(map24hour);
    //         setFilteredMap15mins(map15mins);
    //     }
    // }, [watch("gas_day"), watch("hour")])

    useEffect(() => {
        const today = dayjs().format("YYYY-MM-DD");
        const today2 = new Date();
        const gasDay = watch("gas_day");
        const currentHour = today2.getHours();
        const currentMinutes = today2.getMinutes();

        const isToday = gasDay === today;

        if (isToday && (userDT?.account_manage?.[0]?.user_type_id != 1 && userDT?.account_manage?.[0]?.user_type_id != 2) ) {
            // Remove the current hour if minutes are past 45
            const filteredHours = currentMinutes > 45
                ? map24hour.filter(hour => hour.id > currentHour) // Exclude current hour
                : map24hour.filter(hour => hour.id >= currentHour); // Keep current hour

            setFilteredMap24hour(filteredHours);

            if (watch('hour') == currentHour) {
                setFilteredMap15mins(map15mins.filter(min => parseInt(min.name) > (Math.floor(currentMinutes / 15) * 15)));
            } else {
                setFilteredMap15mins(map15mins);
            }
        } else {
            setFilteredMap24hour(map24hour);
            setFilteredMap15mins(map15mins);
        }
    }, [watch("gas_day"), watch("hour")]);

    const area_map: any = [];
    const [areaByShipper, setAreaByShipper] = useState<any>([])
    const [shipperData, setShipperData] = useState<any>([])

    const fetchData = async () => {
        // let apiUrl = `/master/daily-adjustment/shipper-data?excludeReverseBal=false`;
        let apiUrl = `/master/daily-adjustment/shipper-data`;
        if(watch("gas_day")){
            apiUrl += `?gas_day=${watch("gas_day")}`;
        }
        const res_: any = await getService(apiUrl);
        if(Array.isArray(res_)) {
        setShipperData(res_)
        const newAreaMap: any[] = [];

        res_?.forEach((resItem: any) => {
            // resItem?.query_shipper_nomination_file?.forEach((file: any) => {
            //     file?.nomination_version?.forEach((version: any) => {
            //         const uniqueAreas = new Map(); // Use Map to prevent duplicates

            //         version.nomination_row_json.forEach((row: any) => {
            //             if (row.areaId && !uniqueAreas.has(row?.areaId)) {
            //                 uniqueAreas.set(row?.areaId, {
            //                     id: row?.areaId,
            //                     name: row?.area_text,
            //                     entry_exit_id: row?.entry_exit_id,
            //                     group: {
            //                         id: resItem?.id,
            //                         name: resItem?.name
            //                     }
            //                 });
            //             }
            //         });

            //         newAreaMap.push(...Array.from(uniqueAreas.values()));
            //     });
            // });
            resItem?.contract_code?.forEach((contract: any) => {
                contract?.booking_version?.forEach((version: any) => {
                    const uniqueAreas = new Map(); // Use Map to prevent duplicates

                    version.booking_row_json.forEach((row: any) => {
                        if (row.areaId && !uniqueAreas.has(row?.areaId)) {
                            uniqueAreas.set(row?.areaId, {
                                id: row?.areaId,
                                name: row?.area_text,
                                entry_exit_id: row?.entry_exit_id,
                                group: {
                                    id: resItem?.id,
                                    name: resItem?.name
                                }
                            });
                        }
                    });

                    newAreaMap.push(...Array.from(uniqueAreas.values()));
                });
            });
        });

        setAreaByShipper(newAreaMap);
        }
    }

    useEffect(() => {
        fetchData();
    }, [])

    useEffect(() => {
        if(watch("gas_day")){
            fetchData();
        }
    }, [watch("gas_day")])

    const [nomDataMain, setNomDataMain] = useState<any>([])
    const [btnEnable, setBtnEnable] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()
    const [lastInputForHvChange, setLastInputForHvChange] = useState<string>("")

    const fetchNomData = async () => {
        try {

            const res_nom_data = await getService(`/master/daily-adjustment/nomination-point-data?shipper_id=[${selectedShippers?.length > 0 ? selectedShippers : watch('shipper_id')}]&entry_exit_id=${watch("entry_exit_id")}&area_id=[${watch("area_id")}]&gas_day=${watch("gas_day")}&time=${watch("hour")}:${watch("minute")}`);
            if (res_nom_data?.status == 500) {
                setNomDataMain([]) // <---- mock
            } else {
                setNomDataMain(res_nom_data?.nom)
            }
            setBtnEnable(true)

        } catch (error) {

        }
    }

    useEffect(() => {
        // if (selectedShippers.length > 0 && watch("entry_exit_id") && watch("area_id") && watch("gas_day") && watch("hour") && watch("minute")) {
        if (watch('shipper_id') && watch("entry_exit_id") && watch("area_id") && watch("gas_day") && watch("hour") && watch("minute")) {
            fetchNomData();
        }
    }, [selectedShippers, watch("entry_exit_id"), watch("area_id"), watch("gas_day"), watch("hour"), watch("minute"), watch('shipper_id')])

    const handleSubmitConfirm = (data?: any) => {

        setDataSubmit(data)
        setModaSubmitConfirm(true)

        // ย้ายไปอยู่ใน handleClose ของ modal summit confirm
        // setTimeout(() => {
        //     setSelectedShippers([])

        //     fields.forEach((_, index) => remove(index));

        //     reset();
        //     setResetForm(() => reset);
        // }, 4000);
    }

    const handleClose = () => {
        setSelectedShippers([])
        reset();

        fields.forEach((_, index) => remove(index));
        setResetForm(() => reset);
        onClose();
    };

    useEffect(() => {
        clearErrors
        clearErrors(`rows.${fields.length}`);
    }, [fields])

    // เลือก MMSCFD เอา /24 จะได้ MMSCFH
    // เลือก MMSCFH เอา *24 จะได้ MMSCFD

    // ช่อง volume 2 เกืดจาก heating val * volume

    return (
        <>
            <Dialog
                open={open}
                onClose={() => {
                    handleClose();
                }}
                className="relative z-20"
            >
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
                />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto ">
                    <div className="flex min-h-full items-center justify-center p-4 text-center ">
                        <DialogPanel
                            transition
                            className="relative min-w-[1100px] max-w-[1500px] bg-white transform transition-all rounded-[20px] text-left shadow-lg data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:w-[90%] lg:max-w-3xl"
                        >
                            <div className="flex flex-col items-center justify-center p-4 gap-4 ">
                                <form
                                    onSubmit={handleSubmit(handleSubmitConfirm)}
                                    // onSubmit={(data:any) => handleFormSubmit(data)}
                                    // onSubmit={(data: any) => {
                                    //     // open submit confirm
                                    //     handleSubmitConfirm(data)

                                    //     // handleSubmit(async (data) => { // clear state when submit
                                    //     //      
                                    //     //     onSubmit(data);
                                    //     //     // setIsLoading(true);
                                    //     //     setTimeout(async () => {
                                    //     //         handleClose();
                                    //     //     }, 1000);
                                    //     // })
                                    // }}
                                    className="bg-white p-6  w-full "
                                >
                                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#00ADEF] mb-4 ">
                                        {mode === "create" ? `New Daily Adjustment` : mode === "edit" ? "Edit Daily Adjustment" : mode === "period" ? "New Period" : "View Daily Adjustment"}
                                    </h2>

                                    <div className="grid gap-4 grid-cols-4">
                                        <div className="pb-2">
                                            <label className={labelClass}>
                                                <span className="text-red-500">*</span>
                                                {`Gas Day`}
                                            </label>

                                            <DatePickaForm
                                                {...register('gas_day', { required: "Select Gas Day" })}
                                                readOnly={isReadOnly}
                                                placeHolder="Select Gas Day"
                                                // mode={mode == 'period' ? 'create' : mode == 'edit' ? 'view' : mode}
                                                mode={mode}
                                                valueShow={watch("gas_day") && dayjs(watch("gas_day")).format("DD/MM/YYYY")}
                                                // min={formattedStartDate || undefined}
                                                min={dayjs().format("YYYY-MM-DD")} // Minimum date is today
                                                maxNormalForm={dayjs().add(2, 'day').format("YYYY-MM-DD")} // Maximum date is tomorrow
                                                allowClear
                                                isError={errors.gas_day && !watch("gas_day") ? true : false}
                                                onChange={(e: any) => {
                                                    if (e) {
                                                        setValue('gas_day', formatFormDate(e))
                                                        clearErrors('gas_day');
                                                    } else if (e == undefined) {
                                                        setValue('gas_day', null, { shouldValidate: true, shouldDirty: true });
                                                    }
                                                }}
                                            />
                                            {errors.gas_day && !watch("gas_day") && <p className={`${textErrorClass}`}>{'Select Gas Day'}</p>}
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="shipper_id"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span> {`Shipper Name`}
                                            </label>

                                            <Select
                                                id="shipper_id"
                                                multiple
                                                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                {...register("shipper_id", { required: "Select Shipper Name" })}
                                                disabled={isReadOnly || mode === "edit" || userDT?.account_manage?.[0]?.user_type_id === 3}
                                                value={
                                                    userDT?.account_manage?.[0]?.user_type_id === 3
                                                        ? [userDT?.account_manage?.[0]?.group?.id]
                                                        : selectedShippers
                                                }
                                                onChange={handleSelectChange}
                                                className={`${selectboxClass} ${(isReadOnly || mode === "edit" || userDT?.account_manage?.[0]?.user_type_id === 3) && "!bg-[#EFECEC]"} ${errors.shipper_id && "border-red-500"}`}
                                                sx={{
                                                    ".MuiOutlinedInput-notchedOutline": {
                                                        borderColor: errors.shipper_id && selectedShippers.length === 0 ? "#FF0000" : "#DFE4EA"
                                                    },
                                                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#d2d4d8" },
                                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#d2d4d8" },
                                                }}
                                                displayEmpty
                                                renderValue={(selected) => {
                                                    if (selected.length === 0) {
                                                        return <Typography color="#9CA3AF" fontSize={14}>Select Shipper Name</Typography>;
                                                    }
                                                    return selected
                                                        .map((id) => shipperData.find((item: any) => item.id === id)?.name)
                                                        .join(", ");
                                                }}
                                                MenuProps={{ PaperProps: { style: { maxHeight: 48 * 4.5 + 8 } } }}
                                            >
                                                {userDT?.account_manage?.[0]?.user_type_id !== 3 && (
                                                    <MenuItem value="all">
                                                        <Checkbox checked={selectedShippers.length === shipperData.length && shipperData.length > 0} />
                                                        <ListItemText
                                                            primary="Select All"
                                                            // sx={{ fontWeight: 'bold' }}
                                                            primaryTypographyProps={{ sx: { fontWeight: 'bold' } }}
                                                        />
                                                    </MenuItem>
                                                )}

                                                {shipperData?.map((item: any) => (
                                                    <MenuItem
                                                        key={item.id}
                                                        value={item.id}
                                                        disabled={userDT?.account_manage?.[0]?.user_type_id === 3 && item.id !== userDT?.account_manage?.[0]?.group_id}
                                                    >
                                                        <Checkbox checked={selectedShippers?.includes(item.id)} />
                                                        <ListItemText primary={item.name} />
                                                    </MenuItem>
                                                ))}
                                            </Select>

                                            {errors.shipper_id && (<p className="text-red-500 text-sm">{`Select Shipper Name`}</p>)}
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="entry_exit_id"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Entry/Exit`}
                                            </label>
                                            <Select
                                                id="entry_exit_id"
                                                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                {...register("entry_exit_id", {
                                                    required: "Select Entry/Exit",
                                                })}
                                                disabled={isReadOnly}
                                                value={watch("entry_exit_id") || ""}
                                                className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.entry_exit_id && "border-red-500"}`}
                                                sx={{
                                                    '.MuiOutlinedInput-notchedOutline': { borderColor: errors.entry_exit_id && !watch('entry_exit_id') ? '#FF0000' : '#DFE4EA' },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: errors.entry_exit_id && !watch("entry_exit_id") ? "#FF0000" : "#d2d4d8" },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#d2d4d8' },
                                                }}
                                                onChange={(e) => {
                                                    setValue("entry_exit_id", e.target.value);
                                                    setValue('area_id', null)
                                                    clearErrors('entry_exit_id')

                                                    // const filteredZones = zoneMasterData.filter((zone: any) => zone.entry_exit_id === e.target.value);
                                                    // setZoneMaster(filteredZones)
                                                    // // fetchData(e?.target);
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
                                            {errors.entry_exit_id && (<p className="text-red-500 text-sm">{`Select Entry / Exit`}</p>)}
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="area_id"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Area`}
                                            </label>

                                            <SelectFormProps
                                                id={'area_id'}
                                                register={register("area_id", { required: "Select Area" })}
                                                disabled={isReadOnly}
                                                type='checkbox-list'
                                                // valueWatch={watch("area_id") || ""}
                                                valueWatch={watch("area_id") ? Array.isArray(watch("area_id")) ? watch("area_id") : [watch("area_id")] : []}
                                                handleChange={(e) => {
                                                    // setValue("area_id", e.target.value);
                                                    const value = watch("area_id") ? Array.isArray(watch("area_id")) ? watch("area_id") : [watch("area_id")] : []
                                                    const selectedValues = e.target.value as string[];
                                                    let newValues;
                                                    if (selectedValues.includes("all")) {
                                                        const filteredArea = areaByShipper?.filter((item: any) => selectedShippers?.includes(item.group.id) && item.entry_exit_id === watch('entry_exit_id') || watch('shipper_id')?.includes(item.group.id) && item.entry_exit_id === watch('entry_exit_id'))
                                                        newValues = value.length === filteredArea.length ? [] : filteredArea.map((item: any) => item.id);
                                                    } else {
                                                        newValues = selectedValues;
                                                    }

                                                    setValue("area_id", newValues);
                                                    clearErrors('area_id')
                                                    if (errors?.area_id) { clearErrors('area_id') }
                                                }}
                                                errors={errors?.area_id}
                                                errorsText={'Select Area'}
                                                options={areaByShipper?.filter((item: any) => selectedShippers?.includes(item.group.id) && item.entry_exit_id === watch('entry_exit_id') || watch('shipper_id')?.includes(item.group.id) && item.entry_exit_id === watch('entry_exit_id')
                                                ).reduce((acc: any[], curr: any) => {
                                                    if (!acc.some(item => item.id === curr.id)) {
                                                        acc.push(curr);
                                                    }
                                                    return acc;
                                                }, [])}
                                                optionsKey={'id'}
                                                optionsValue={'id'}
                                                optionsText={'name'}
                                                optionsResult={'name'}
                                                placeholder={'Select Area'}
                                                pathFilter={'name'}
                                            />
                                        </div>
                                    </div>

                                    <div className={`grid gap-4 grid-cols-3`}>
                                        <div>
                                            <label htmlFor="hour" className="block mb-2 text-sm font-light">
                                                <span className="text-red-500">*</span>
                                                {`Time`}
                                            </label>

                                            <div className="flex gap-2">
                                                <div className="w-[50%]">
                                                    <Select
                                                        id="hour"
                                                        IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                        {...register("hour", {
                                                            required: "Select Hour",
                                                        })}
                                                        disabled={isReadOnly}
                                                        // value={watch("hour") || ""}
                                                        value={watch("hour") !== undefined ? watch("hour") : ""}
                                                        className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.hour && "border-red-500"}`}
                                                        sx={{
                                                            '.MuiOutlinedInput-notchedOutline': {
                                                                // borderColor: '#DFE4EA', // Change the border color here
                                                                borderColor: errors.hour && !watch('hour') ? '#FF0000' : '#DFE4EA',
                                                            },
                                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: errors.hour && !watch("hour") ? "#FF0000" : "#d2d4d8"
                                                            },
                                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: '#d2d4d8',
                                                            },
                                                        }}
                                                        onChange={(e) => {
                                                            setValue("hour", e.target.value?.toString());
                                                            clearErrors('hour')
                                                        }}
                                                        displayEmpty
                                                        renderValue={(value: any) => {
                                                            // if (!value) {
                                                            if (value === undefined || value === "") {
                                                                return <Typography color="#9CA3AF" fontSize={14}>Hour</Typography>;
                                                            }
                                                            return map24hour?.find((item: any) => item?.id?.toString() === value?.toString())?.name || '';
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
                                                        {filteredMap24hour?.map((item: any) => (
                                                            <MenuItem key={item.id} value={item.id}>
                                                                {item.name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                    {errors.hour && (<p className="text-red-500 text-sm">{`Select Hour`}</p>)}
                                                </div>

                                                <div className="w-[50%]">
                                                    <Select
                                                        id="minute"
                                                        IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                        {...register("minute", {
                                                            required: "Select Minute",
                                                        })}
                                                        disabled={isReadOnly}
                                                        // value={watch("minute") || ""}
                                                        value={watch("minute") !== undefined ? watch("minute") : ""}
                                                        className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.minute && "border-red-500"}`}
                                                        sx={{
                                                            '.MuiOutlinedInput-notchedOutline': {
                                                                // borderColor: '#DFE4EA', // Change the border color here
                                                                borderColor: errors.minute && !watch('minute') ? '#FF0000' : '#DFE4EA',
                                                            },
                                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: errors.minute && !watch("minute") ? "#FF0000" : "#d2d4d8"
                                                            },
                                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: '#d2d4d8',
                                                            },
                                                        }}
                                                        onChange={(e) => {
                                                            setValue("minute", e.target.value);
                                                            clearErrors('minute')
                                                        }}
                                                        displayEmpty
                                                        renderValue={(value: any) => {
                                                            if (value === undefined || value === "") {
                                                                return <Typography color="#9CA3AF" fontSize={14}>{`Minute`}</Typography>;
                                                            }
                                                            return map15mins?.find((item: any) => item.name === value)?.name || '';
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
                                                        {filteredMap15mins?.map((item: any) => (
                                                            <MenuItem key={item.id} value={item.name}>
                                                                {item.name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                    {errors.minute && (<p className="text-red-500 text-sm">{`Select minute`}</p>)}
                                                </div>
                                            </div>

                                            {/* {errors.hour && (<p className="text-red-500 text-sm">{`Select Time`}</p>)} */}
                                        </div>
                                    </div>

                                    {/* Horizon Divider */}
                                    <div className="my-1 pt-4 pb-4">
                                        <hr className="border-t border-[#AEAEAE] w-full mx-auto" />
                                    </div>

                                    {fields.map((field: any, index: any) => {
                                        const row = watch(`rows.${index}`); // Get current row state
                                        const errorRows: any = errors?.rows;
                                        const selectedNominationPointList: any[] = [];
                                        fields.map((tmpField: any, tmpIndex: any) => {
                                            const selectedNominationPoint = watch(`rows.${tmpIndex}.nomination_point`)
                                            if(tmpIndex != index && selectedNominationPoint){
                                                selectedNominationPointList.push(selectedNominationPoint);
                                            }
                                        })
                                        return (
                                            // <div key={field.id} className="flex gap-2 items-center pt-2">
                                            <div key={field.id} className="grid grid-cols-[20%_18%_13%_15%_12%_13%_5%] gap-2 items-center pt-2">

                                                {/* Nomination Point */}
                                                <div>
                                                    <label htmlFor="nomination_point_id" className={labelClass}>
                                                        <span className="text-red-500">*</span>
                                                        {`Nomination Point`}
                                                    </label>
                                                    <Select
                                                        id="nomination_point_id"
                                                        IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                        // {...register("nomination_point_id", { required: "Select Nomination Point", })}
                                                        {...register(`rows.${index}.nomination_point_id`, { required: "Select Nomination Point" })}
                                                        disabled={isReadOnly}
                                                        // value={watch(`rows.${index}.nomination_point_id`) || ""}
                                                        value={row?.nomination_point_id || ""}
                                                        // className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${!watch(`rows.${index}.nomination_point_id`) && "border-red-500"}`}
                                                        className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errorRows ? errorRows[index]?.nomination_point_id && "border-red-500" : ''}`}
                                                        sx={{
                                                            minWidth: 140,
                                                            width: '100%',
                                                            maxWidth: 300,
                                                            '.MuiOutlinedInput-notchedOutline': {
                                                                // borderColor: !watch(`rows.${index}.nomination_point_id`) ? '#FF0000' : '#DFE4EA',
                                                                borderColor: errorRows ? errorRows[index]?.nomination_point_id && "#FF0000" : '#DFE4EA',
                                                            },
                                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: '#d2d4d8',
                                                            },
                                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: '#d2d4d8',
                                                            },
                                                        }}
                                                        onChange={(e) => {
                                                            // setValue(`rows.${index}.nomination_point_id`, e.target.value);
                                                            update(index, { ...row, nomination_point_id: e.target.value });

                                                            let filter_nom = nomDataMain?.filter((item: any) => item?.id == e.target.value)
                                                            // update(index, { ...row, nomination_point: filter_nom[0]?.nomination_point });
                                                            setValue(`rows.${index}.nomination_point`, filter_nom[0]?.nomination_point);
                                                            clearErrors(`rows.${index}.nomination_point_id`);

                                                            // filter_nom.calc = {
                                                            //     "heating_value": "90",
                                                            //     "valumeMMSCFD": "60", ช่องแรก
                                                            //     "valumeMMSCFH": "2.5", ช่องแรก
                                                            //     "valumeMMSCFD2": "60", ช่องหลัง
                                                            //     "valumeMMSCFH2": "2.5" ช่องหลัง
                                                            // }

                                                            const updatedRowHv = { ...watch(`rows.${index}`), heating_value: filter_nom[0]?.calc?.heating_value };
                                                            setValue(`rows.${index}.heating_value`, filter_nom[0]?.calc?.heating_value);
                                                            if(filter_nom[0]?.calc?.heating_value || filter_nom[0]?.calc?.heating_value == 0){
                                                                clearErrors(`rows.${index}.heating_value`);
                                                            }
                                                            update(index, updatedRowHv);

                                                            // New > ค่า Volume : ให้ User กรอกเอง ไม่มีการดึงค่ามาจากไหน https://app.clickup.com/t/86erx300q
                                                            // const updatedRowVol1 = { ...watch(`rows.${index}`), volume: filter_nom[0]?.calc?.valumeMMSCFD };
                                                            // setValue(`rows.${index}.volume`, filter_nom[0]?.calc?.valumeMMSCFD);
                                                            // update(index, updatedRowVol1);

                                                            let cal_vol_2 = filter_nom[0]?.calc?.heating_value * filter_nom[0]?.calc?.valumeMMSCFD
                                                            const updatedRowVol2 = { ...watch(`rows.${index}`), cal_volume: cal_vol_2 };
                                                            setValue(`rows.${index}.cal_volume`, cal_vol_2);
                                                            if(cal_vol_2|| cal_vol_2 == 0){
                                                                clearErrors(`rows.${index}.cal_volume`);
                                                            }
                                                            update(index, updatedRowVol2);

                                                        }}
                                                        displayEmpty
                                                        renderValue={(value: any) => {
                                                            if (!value) {
                                                                // return <Typography color="#9CA3AF" fontSize={14}>Select Nomination Point</Typography>;
                                                                return (
                                                                    <Typography
                                                                        color="#9CA3AF"
                                                                        fontSize={14}
                                                                        sx={{
                                                                            whiteSpace: "nowrap",
                                                                            overflow: "hidden",
                                                                            textOverflow: "ellipsis",
                                                                            display: "block",
                                                                            maxWidth: "160px" // Adjust width as needed
                                                                        }}
                                                                    >
                                                                        Select Nomination Point
                                                                    </Typography>
                                                                );
                                                            }
                                                            // return <span className={itemselectClass}>{nominationPointData.find((item: any) => item?.id === value)?.nomination_point || ''}</span>;
                                                            return <span className={itemselectClass}>{nomDataMain.find((item: any) => item?.id === value)?.nomination_point || ''}</span>;
                                                        }}
                                                        MenuProps={{
                                                            PaperProps: {
                                                                style: {
                                                                    maxHeight: 48 * 4.5 + 8,
                                                                },
                                                            },
                                                        }}
                                                    >
                                                        {/* {nominationPointData?.length > 0 && nominationPointData?.filter((item: any) => (watch('area_id') ? item?.area?.id === watch('area_id') : true)).map((item: any) => (
                                                        <MenuItem key={item?.id} value={item?.id}>
                                                            <ListItemText primary={<Typography fontSize={14}>{item?.nomination_point}</Typography>} />
                                                        </MenuItem>
                                                    ))} */}

                                                        {/* {nomDataMain?.length > 0 && nomDataMain?.map((item: any) => (
                                                            <MenuItem key={item?.id} value={item?.id}>
                                                                <ListItemText primary={<Typography fontSize={14}>{item?.nomination_point}</Typography>} />
                                                            </MenuItem>
                                                        ))} */}


                                                        {/* {nomDataMain?.length > 0 && nomDataMain?.filter((item: any) =>
                                                            watch("area_id") ? item?.area_id == watch("area_id") : true)?.map((item: any) => (
                                                                <MenuItem key={item?.id} value={item?.id}>
                                                                    <ListItemText primary={<Typography fontSize={14}>{item?.nomination_point}</Typography>} />
                                                                </MenuItem>
                                                            ))} */}

                                                        {/* add this condition item?.entry_exit_id == watch("entry_exit_id") */}

                                                        {/* {nomDataMain?.length > 0 && nomDataMain?.filter((item: any) =>
                                                            (watch("area_id") ? item?.area_id == watch("area_id") : true) &&
                                                            (item?.entry_exit_id == watch("entry_exit_id")) // Adding the additional condition
                                                        )?.map((item: any) => (
                                                            <MenuItem key={item?.id} value={item?.id}>
                                                                <ListItemText primary={<Typography fontSize={14}>{item?.nomination_point}</Typography>} />
                                                            </MenuItem>
                                                        ))} */}


                                                        {/* 
                                                            https://app.clickup.com/t/86eth5yx1
                                                            v2.0.37 dropdown Nomination point ยังไม่เรียงตามตัวอักษร และขึ้นรายการที่ชื่อเหมือนกันซ้ำ
                                                        */}
                                                        {nomDataMain?.length > 0 &&
                                                            Array.from(
                                                                new Map(
                                                                    nomDataMain
                                                                        .filter((item: any) =>
                                                                        (
                                                                            (watch("area_id") ? item?.area_id == watch("area_id") : true) ||
                                                                            (Array.isArray(watch("area_id")) ? watch("area_id").includes(item?.area_id) : false)
                                                                        )
                                                                            &&
                                                                            (item?.entry_exit_id == watch("entry_exit_id"))
                                                                            &&
                                                                            !selectedNominationPointList.includes(item?.nomination_point)
                                                                        )
                                                                        .sort((a: any, b: any) =>
                                                                            a.nomination_point?.localeCompare(b.nomination_point)
                                                                        )
                                                                        .map((item: any) => [item.id, item])
                                                                ).values() // only get unique values
                                                            ).map((item: any) => (
                                                                <MenuItem key={item?.id} value={item?.id}>
                                                                    <ListItemText primary={<Typography fontSize={14}>{item?.nomination_point}</Typography>} />
                                                                </MenuItem>
                                                            ))}

                                                    </Select>
                                                    {/* rows.${index}.nomination_point_id */}
                                                    {/* {errorRows ? errorRows[index]?.nomination_point_id && (<p className="text-red-500 text-sm">{`Select Nomination Point`}</p>): ''} */}
                                                </div>

                                                {/* Heating Value */}
                                                <div>
                                                    <label htmlFor="heating_value" className="block mb-2 text-sm font-light">
                                                        <span className="text-red-500">*</span>
                                                        {`Heating Value (BTU/SCF)`}
                                                    </label>
                                                    <NumericFormat
                                                        id="heating_value"
                                                        placeholder="0.000"
                                                        // value={watch(`rows.${index}.heating_value`)}
                                                        value={row?.heating_value || ""}
                                                        readOnly={isReadOnly}
                                                        // {...register("heating_value", { required: "Type Heating Value" })}
                                                        {...register(`rows.${index}.heating_value`, { required: "Type Heating Value" })}
                                                        // {...register(`rows.${index}.heating_value`)}

                                                        className={`${inputClass} !pe-2 hover:!pe-2 focus:!pe-2 ${errorRows ? errorRows[index]?.heating_value && "border-red-500" : ''}  ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                        thousandSeparator={true}
                                                        decimalScale={3}
                                                        fixedDecimalScale={true}
                                                        allowNegative={false}
                                                        displayType="input"
                                                        onValueChange={(values) => {
                                                            const { value } = values;
                                                            // setValue(`rows.${index}.heating_value`, value, { shouldValidate: true, shouldDirty: true });
                                                            setValue(`rows.${index}.heating_value`, value);
                                                        }}
                                                        onBlur={() => {
                                                            const updatedRow = { ...watch(`rows.${index}`), heating_value: watch(`rows.${index}.heating_value`) };
                                                            update(index, updatedRow);


                                                            if(lastInputForHvChange == 'volume' && watch(`rows.${index}.volume`)){
                                                            let cal_vol_2 = watch(`rows.${index}.heating_value`) * watch(`rows.${index}.volume`)
                                                            const updatedRowVol2 = { ...watch(`rows.${index}`), cal_volume: cal_vol_2 };
                                                            setValue(`rows.${index}.cal_volume`, cal_vol_2);
                                                                if(cal_vol_2 || cal_vol_2 == 0){
                                                                    clearErrors(`rows.${index}.cal_volume`);
                                                                }
                                                            update(index, updatedRowVol2);
                                                            }
                                                            else if(lastInputForHvChange == 'energy' && watch(`rows.${index}.cal_volume`)){
                                                                let cal_vol_2 = watch(`rows.${index}.cal_volume`) / watch(`rows.${index}.heating_value`)
                                                                const updatedRowVol2 = { ...watch(`rows.${index}`), volume: cal_vol_2 };
                                                                setValue(`rows.${index}.volume`, cal_vol_2);
                                                                if(cal_vol_2 || cal_vol_2 == 0){
                                                                    clearErrors(`rows.${index}.volume`);
                                                                }
                                                                update(index, updatedRowVol2);
                                                            }
                                                        }}
                                                    />
                                                    {/* {errors.heating_value && (<p className="text-red-500 text-sm">{`Type Heating Value`}</p>)} */}
                                                    {/* {errorRows ? errorRows[index]?.heating_value && (<p className="text-red-500 text-sm">{`Type Heating Value`}</p>): ''} */}
                                                </div>

                                                {/* Volume */}
                                                <div>
                                                    <label htmlFor="volume" className="block mb-2 text-sm font-light">
                                                        <span className="text-red-500">*</span>
                                                        {`Volume `}
                                                    </label>
                                                    <NumericFormat
                                                        id="volume"
                                                        placeholder="0.000000"
                                                        // value={watch(`rows.${index}.volume`)}
                                                        value={(row?.volume || row?.volume == 0) ? row?.volume : ""}
                                                        readOnly={isReadOnly}
                                                        // {...register("volume", { required: "Type Heating Value" })}
                                                        // {...register(`rows.${index}.volume`, { required: "Type Heating Value" })}
                                                        {...register(`rows.${index}.volume`, { required: "Type Volume" })}

                                                        className={`${inputClass} !pe-2 hover:!pe-2 focus:!pe-2 ${errorRows ? errorRows[index]?.volume && "border-red-500" : ''}  ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                        thousandSeparator={true}
                                                        decimalScale={6}
                                                        fixedDecimalScale={true}
                                                        allowNegative={false}
                                                        displayType="input"
                                                        onValueChange={(values) => {
                                                            const { value } = values;
                                                            // setValue(`rows.${index}.volume`, value, { shouldValidate: true, shouldDirty: true });
                                                            setValue(`rows.${index}.volume`, value);
                                                            // update(index, { ...row, volume: value });
                                                        }}
                                                        onBlur={() => {
                                                            const updatedRow = { ...watch(`rows.${index}`), volume: watch(`rows.${index}.volume`) };
                                                            update(index, updatedRow);

                                                            let cal_vol_2 = watch(`rows.${index}.heating_value`) * watch(`rows.${index}.volume`)
                                                            const updatedRowVol2 = { ...watch(`rows.${index}`), cal_volume: cal_vol_2 };
                                                            setValue(`rows.${index}.cal_volume`, cal_vol_2);
                                                            if(cal_vol_2 || cal_vol_2 == 0){
                                                                clearErrors(`rows.${index}.cal_volume`);
                                                            }
                                                            update(index, updatedRowVol2);
                                                            setLastInputForHvChange('volume')
                                                        }}
                                                    />
                                                    {/* {errors.volume && (<p className="text-red-500 text-sm">{`Type Heating Value`}</p>)} */}
                                                </div>

                                                {/* Unit */}
                                                <div>
                                                    <label htmlFor="unit" className="block mb-2 text-sm font-light">
                                                        <span className="text-red-500">*</span>
                                                        {`Unit`}
                                                    </label>
                                                    <Select
                                                        id="unit"
                                                        IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                        {...register(`rows.${index}.unit`, { required: "Select Unit" })}
                                                        disabled={isReadOnly}
                                                        // value={watch(`rows.${index}.unit`) || ""}
                                                        value={row?.unit || ""}
                                                        // className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.unit && "border-red-500"}`}
                                                        className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.unit && "border-red-500"}`}
                                                        sx={{
                                                            // minWidth: 100,
                                                            width: 150,
                                                            // maxWidth: 140,
                                                            '.MuiOutlinedInput-notchedOutline': {
                                                                // borderColor: !watch(`rows.${index}.unit`) ? '#FF0000' : '#DFE4EA',
                                                                borderColor: errorRows ? errorRows[index]?.unit && "#FF0000" : '#DFE4EA',
                                                            },
                                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: '#d2d4d8',
                                                            },
                                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: '#d2d4d8',
                                                            },
                                                        }}
                                                        onChange={(e) => {
                                                            // setValue(`rows.${index}.unit`, e.target.value);
                                                            update(index, { ...row, unit: e.target.value });

                                                            // if unit == 1 (MMSCFD ) show MMBTU/D
                                                            // if unit == 2 (MMSCFH) show MMBTU/H
                                                            const updatedRowUnit2 = { ...watch(`rows.${index}`), unit2: e.target.value == 1 ? 'MMBTU/D' : 'MMBTU/H' };
                                                            clearErrors(`rows.${index}.unit`);
                                                            update(index, updatedRowUnit2);
                                                        }}
                                                        displayEmpty
                                                        renderValue={(value: any) => {
                                                            if (!value) {
                                                                return <Typography color="#9CA3AF" fontSize={14}>{`Select Unit`}</Typography>;
                                                            }
                                                            return unitMaster.find((item: any) => item?.id?.toString() === value.toString())?.name || '';
                                                        }}
                                                        MenuProps={{
                                                            PaperProps: {
                                                                style: {
                                                                    maxHeight: 48 * 4.5 + 8,
                                                                },
                                                            },
                                                        }}
                                                    >
                                                        {
                                                            unitMaster?.map((item: any) => {
                                                                return (
                                                                    <MenuItem key={item.id} value={item.id}>
                                                                        {item.name}
                                                                    </MenuItem>
                                                                )
                                                            })
                                                        }
                                                    </Select>
                                                    {/* {!watch(`rows.${index}.unit`) && (<p className="text-red-500 text-sm">{`Select Unit`}</p>)} */}
                                                </div>

                                                {/* Calculated Volume */}
                                                <div>
                                                    <label htmlFor="unit" className="block mb-2 text-sm font-light">
                                                        <span className="text-red-500">*</span>
                                                        {`Energy`}
                                                    </label>
                                                    <NumericFormat
                                                        id="cal_volume"
                                                        placeholder="0.000"
                                                        // value={watch(`rows.${index}.cal_volume`)}
                                                        value={(row?.cal_volume || row?.cal_volume == 0) ? row?.cal_volume : ""}
                                                        readOnly={isReadOnly}
                                                        {...register(`rows.${index}.cal_volume`, { required: "Type energy" })}
                                                        // className={`${inputClass} ${!watch(`rows.${index}.cal_volume`) && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                        className={`${inputClass} !pe-2 hover:!pe-2 focus:!pe-2 ${errorRows ? errorRows[index]?.cal_volume && "border-red-500" : ''}  ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                        thousandSeparator={true}
                                                        decimalScale={3}
                                                        fixedDecimalScale={true}
                                                        allowNegative={false}
                                                        displayType="input"
                                                        onValueChange={(values) => {
                                                            const { value } = values;
                                                            // setValue(`rows.${index}.cal_volume`, value, { shouldValidate: true, shouldDirty: true });
                                                            setValue(`rows.${index}.cal_volume`, value);
                                                            // update(index, { ...row, cal_volume: value});
                                                            // update(index, { ...row, unit2: value});
                                                        }}
                                                        onBlur={() => {
                                                            const updatedRow = { ...watch(`rows.${index}`), cal_volume: watch(`rows.${index}.cal_volume`) };
                                                            update(index, updatedRow);

                                                            if(watch(`rows.${index}.heating_value`)){
                                                                let cal_vol_2 =  watch(`rows.${index}.cal_volume`) / watch(`rows.${index}.heating_value`)
                                                                const updatedRowVol2 = { ...watch(`rows.${index}`), volume: cal_vol_2 };
                                                                setValue(`rows.${index}.volume`, cal_vol_2);
                                                                if(cal_vol_2 || cal_vol_2 == 0){
                                                                    clearErrors(`rows.${index}.volume`);
                                                                }
                                                                update(index, updatedRowVol2);
                                                            }
                                                            setLastInputForHvChange('energy')
                                                        }}
                                                    />
                                                    {/* {errors.cal_volume && (<p className="text-red-500 text-sm">{`Type Heating Value`}</p>)} */}
                                                </div>

                                                {/* Unit (Read Only) */}
                                                <div>
                                                    <label htmlFor="unit2" className="block mb-2 text-sm font-light">
                                                        <span className="text-red-500">*</span>
                                                        {`Unit`}
                                                    </label>
                                                    <input
                                                        id="unit2"
                                                        type="text"
                                                        placeholder=""
                                                        value={row?.unit2 || ""}
                                                        readOnly={true}
                                                        // {...register("unit2")}
                                                        {...register(`rows.${index}.unit2`)}
                                                        className={`${inputClass} !bg-[#EFECEC] pointer-events-none ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                    />
                                                </div>

                                                {/* Remove Button */}
                                                <div className="pt-7 flex justify-center pr-1">
                                                    <RemoveOutlinedIcon
                                                        sx={{ fontSize: 40 }}
                                                        className={`text-[#ffffff] border rounded-md p-1 ${isReadOnly ? 'bg-[#B6B6B6] border-[#B6B6B6] pointer-events-none' : 'bg-[#EA6060] border-[#EA6060] hover:bg-[#ea6060dd] cursor-pointer'}`}
                                                        onClick={() => !isReadOnly && remove(index)}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    }

                                    )}

                                    {/* Add Row Button */}
                                    <div className="flex pt-2 justify-end">
                                        <AddOutlinedIcon
                                            sx={{ fontSize: 40 }}
                                            className={`text-[#ffffff] border rounded-md p-1 ${!btnEnable
                                                ? 'bg-[#B6B6B6] border-[#B6B6B6] pointer-events-none'
                                                : 'bg-[#24AB6A] border-[#24AB6A] hover:bg-[#24ab6acf] cursor-pointer'
                                                }`}
                                            onClick={() => {

                                                // btnEnable &&
                                                // append({ nomination_point_id: "", heating_value: "", volume: "", unit: "", cal_volume: "", unit2: "" })
                                                btnEnable &&
                                                    append(
                                                        { nomination_point_id: "", heating_value: "", volume: "", unit: "", cal_volume: "", unit2: "" },
                                                        { shouldFocus: false }
                                                    )

                                                setTimeout(() => {
                                                    clearErrors();
                                                }, 300);
                                                // if(errors?.rows){
                                                //     clearErrors(`rows.${fields?.length}`);
                                                // }else{
                                                //     clearErrors('rows');
                                                // }
                                            }
                                            }
                                        />
                                    </div>

                                    <div className="flex justify-end gap-4 pt-6 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={() => handleClose()}
                                            className={`py-2 px-6 rounded-lg ${mode === "view" ? "bg-[#00ADEF] text-white hover:bg-blue-600" : "bg-slate-100 text-black hover:bg-rose-500"}`}
                                        >
                                            {mode === "view" ? "Close" : "Cancel"}
                                        </button>

                                        {/* if fields.length <= 0 then disable this button */}
                                        {/* {mode !== "view" && (
                                            <button
                                                type="submit"
                                                className="w-[160px] font-semibold py-2 px-6 rounded-lg bg-[#00ADEF] text-white hover:bg-blue-600"
                                            >
                                                {mode === "create" ? "Submit" : "Save"}
                                            </button>
                                        )} */}

                                        {mode !== "view" && (
                                            <button
                                                type="submit"
                                                disabled={fields.length <= 0}
                                                className={`w-[160px] font-semibold py-2 px-6 rounded-lg text-white
                                                    ${fields.length <= 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#00ADEF] hover:bg-blue-600'}
                                                `}
                                            >
                                                {mode === "create" ? "Submit" : "Save"}
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>

            <ModalComponent
                open={modaSubmitConfirm}
                handleClose={(e: any) => {
                    setModaSubmitConfirm(false);
                    if (e == "submit") {

                        onSubmit(dataSubmit)
                        // setTimeout(async () => {
                        //     handleClose();
                        // }, 1000);

                        setTimeout(() => {
                            setSelectedShippers([])

                            fields.forEach((_, index) => remove(index));

                            reset();
                            setResetForm(() => reset);
                            handleClose();

                        }, 1000);
                    }
                    // setModalSuccessOpen(true);
                    // if (resetForm) resetForm();
                }}
                title="Submit Confirm"
                description={
                    <div>
                        <div className="text-center">
                            {`Are you sure to submit data ?`}
                        </div>
                        <div className="text-center">
                            {`You can go back and check the information.`}
                        </div>
                    </div>
                }
                menuMode="daily-adjust"
                btnmode="split"
                btnsplit1="Submit"
                btnsplit2="Check Info."
                stat="confirm"
            />
        </>
    );
};

export default ModalAction;