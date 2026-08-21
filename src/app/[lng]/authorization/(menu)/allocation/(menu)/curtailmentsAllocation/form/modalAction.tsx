import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DatePickaForm from "@/components/library/dateRang/dateSelectForm";
import { formatFormDate, formatNumberFourDecimal, formatNumberThreeDecimal, roundTo3, toDayjs } from "@/utils/generalFormatter";
import { NumericFormat } from "react-number-format";
import { getService } from "@/utils/postService";
import ModalComponent from "@/components/other/ResponseModal";
import getUserValue from "@/utils/getuserValue";
import BtnGeneral from "@/components/other/btnGeneral";
import { table_col_arrow_sort_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import NodataTable from "@/components/other/nodataTable";
import Spinloading from "@/components/other/spinLoading";
import SelectFormProps from "@/components/other/selectProps";


type FormExampleProps = {
    mode?: "create" | "edit" | "view" | "period";
    data?: Partial<any>;
    open: boolean;
    dataTable?: any;
    dataShipper?: any;
    tabIndex?: any;
    nominationTypeMaster?: any;
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
    tabIndex,
    areaMaster,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const {
        control,
        register,
        handleSubmit,
        setValue,
        reset,
        clearErrors,
        resetField,
        formState: { errors },
        watch,
    } = useForm<any>({
        defaultValues: data,
        mode: 'onSubmit'
    });

    const userDT: any = getUserValue();
    const labelClass = "block mb-2 text-sm font-light";
    const selectboxClass = "flex w-full h-[44px] p-1 ps-1 pe-2 !rounded-lg text-gray-900 text-sm block outline-none";
    const textErrorClass = "text-red-500 text-sm";

    // const isReadOnly = (mode === "view" || mode === 'edit');
    const isReadOnly = (mode === "view");

    const [modaSubmitConfirm, setModaSubmitConfirm] = useState<any>(false)
    const [isLoading, setIsLoading] = useState<any>(false)
    const [dataCal, setDataCal] = useState<any>([])

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState<any>([]);

    const unit_data = [
        {
            label: 'MMSCFD',
            value: 'MMSCFD'
        },
        {
            label: 'MMBTU/D',
            value: 'MMBTU/D'
        }
    ]

    // ############## CALCULATE BTN ##############
    const [disableCalculateBtn, setDisableCalculateBtn] = useState<any>(true)
    useEffect(() => {
        if (tabIndex == 0 && watch('gas_day') && watch('area_id') && watch('maximum_capacity') && watch('unit')) {
            setDisableCalculateBtn(false)
        } else if (tabIndex == 1 && watch('gas_day') && watch('area_id') && watch('maximum_capacity') && watch('unit') && watch('nomination_point')) {
            setDisableCalculateBtn(false)
        }
    }, [watch('gas_day'), watch('area_id'), watch('maximum_capacity'), watch('unit'), watch('nomination_point')])

    useEffect(() => {
        const fetchAndSetData = async () => {
            if (mode === "edit" || mode === "view") {
                setValue("shipper_id", data?.group?.id || "");
                setValue("contract_code_id", data?.contract_code.id ?? "");
                setValue("reserve_balancing_gas_contract_id", data?.reserve_balancing_gas_contract.id ?? "");
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

    const [nomDataMain, setNomDataMain] = useState<any>([])
    const [dataSubmit, setDataSubmit] = useState<any>()
    const [isExit, setIsExit] = useState<any>(false)
    const [msgSave, setmsgSave] = useState(`You can go back and check the information.`)

    const handleSubmitConfirm_ = (data?: any) => {
        let body_post = {}

        if (tabIndex == 0) {
            body_post = {
                "gasDay": toDayjs(data?.gas_day, "YYYY-MM-DD").format("DD/MM/YYYY"),
                "area": data?.area_id,
                "unit": data?.unit, //MMBTU/D    MMSCFD
                "type": '1', //1 = area, 2 = nomination
                "maxCapacity": data?.maximum_capacity
            }
        } else {
            body_post = {
                "gasDay": toDayjs(data?.gas_day, "YYYY-MM-DD").format("DD/MM/YYYY"),
                "area": data?.area_id,
                "nominationPoint": data?.nomination_point, //type = 1 ไม่ต้องส่งมา
                "unit": data?.unit, //MMBTU/D    MMSCFD
                "type": '2', //1 = area, 2 = nomination
                "maxCapacity": data?.maximum_capacity
            }
        }
        console.log('data : ', data);
        console.log('watch("maximum_capacity") : ', data?.maximum_capacity);
        console.log('totals.totalNominationValue : ', totals.totalNominationValue);
        const msg_ = Number(data?.maximum_capacity) > totals.totalNominationValue ? `⚠️ Max Capacity Exceed Total Nomination Value` : `You can go back and check the information.` 
        setmsgSave(msg_)
        setDataSubmit(body_post)
        setModaSubmitConfirm(true)
    }
    const handleSubmitConfirm = () => {
        setIsLoading(true);
      
        onSubmit(dataSubmit)

        setTimeout(() => {
            // setSelectedShippers([])
            setSortedData([])
            setDataCal([])
            setDisableCalculateBtn(true)
            // fields.forEach((_, index) => remove(index));
            reset();
            setResetForm(() => reset);
            handleClose();
            setIsLoading(false)
        }, 2000);
    }

    const [evData, setEvData] = useState<any>(null)
    const [nomData, setNomData] = useState<any>(null)

    const handleSelectArea = async (area?: any) => {

        setValue("maximum_capacity", '');
        setValue("unit", undefined);

        let find_area_check_is_exit = areaMaster?.find((item: any) => item?.name == area)
        if (find_area_check_is_exit?.entry_exit_id == 2) {
            setIsExit(true)
        } else {
            setIsExit(false)
        }

        // const res_get_nom = await getService(`/master/allocation/select-nomination?area=${area}`);
        const res_get_nom = await getService(`/master/allocation/select-nomination?area=${area}&gasDay=${toDayjs(watch("gas_day")).format("DD/MM/YYYY")}&ev=true`);
        setEvData(res_get_nom?.hvFromEntryArea)
        setNomData(res_get_nom?.nom)
        const data_nom_mod = (res_get_nom?.data || []).map((item: any) => ({
            label: item,
            value: item,
        }));
        setNomDataMain(data_nom_mod)
    }

    const [totals, setTotals] = useState({
        totalNominationValue: 0,
        totalRemainingCapacity: 0,
    });

    const handleGetMaxCap = async () => {
        setIsLoading(true)
        let url_cal

        if (tabIndex == 0) {
            url_cal = `/master/allocation/curtailments-allocation-get-max-cap?gasDay=${toDayjs(watch("gas_day", "YYYY-MM-DD")).format("DD/MM/YYYY")}&area=${watch("area_id")}&unit=${watch("unit")}&type=${tabIndex == 0 ? '1' : '2'}}`
        } else {
            url_cal = `/master/allocation/curtailments-allocation-get-max-cap?gasDay=${toDayjs(watch("gas_day", "YYYY-MM-DD")).format("DD/MM/YYYY")}&area=${watch("area_id")}&nominationPoint=${watch('nomination_point')}&unit=${watch("unit")}&type=${tabIndex == 0 ? '1' : '2'}}`
        }
        const res_get_max_cap = await getService(`${url_cal}`);

        if (res_get_max_cap && typeof res_get_max_cap === 'number') {
            setValue("maximum_capacity", res_get_max_cap)
        }

        setIsLoading(false)
    }

    const handleCalculate = async () => {
        setIsLoading(true)
        let url_cal
        if (tabIndex == 0) {
            url_cal = `/master/allocation/curtailments-allocation-calc?gasDay=${toDayjs(watch("gas_day", "YYYY-MM-DD")).format("DD/MM/YYYY")}&area=${watch("area_id")}&unit=${watch("unit")}&type=${tabIndex == 0 ? '1' : '2'}&maxCapacity=${watch("maximum_capacity")}`
        } else {
            url_cal = `/master/allocation/curtailments-allocation-calc?gasDay=${toDayjs(watch("gas_day", "YYYY-MM-DD")).format("DD/MM/YYYY")}&area=${watch("area_id")}&nominationPoint=${watch('nomination_point')}&unit=${watch("unit")}&type=${tabIndex == 0 ? '1' : '2'}&maxCapacity=${watch("maximum_capacity")}`
        }

        const res_get_cal = await getService(`${url_cal}`);
        setDataCal(res_get_cal)
        setSortedData(res_get_cal)

        const totalNominationValue = res_get_cal.reduce((sum: any, row: any) => sum + (row.nominationValue || 0), 0);
        const totalRemainingCapacity = res_get_cal.reduce((sum: any, row: any) => sum + (row.remainingCapacity || 0), 0);

        setTotals({
            totalNominationValue,
            totalRemainingCapacity,
        });
        setIsLoading(false)
    }

    const handleClose = () => {

        onClose();

        setTimeout(() => {
            reset();
            setResetForm(() => reset);
            setSortedData([])
            setDataCal([])
            setDisableCalculateBtn(true)
        }, 300);
    };

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    // useEffect(() => {
    //     if(watch("gas_day") && watch("area_id") && watch("unit") && (tabIndex == 0 || (tabIndex == 1 && watch("nomination_point")))){
    //         handleGetMaxCap()
    //     }
    // }, [watch("gas_day"), watch("area_id"), watch("nomination_point"), watch("unit")])

//  const fnHvData = async (watch("area_id"), areaMaster, watch("nomination_point"), nomDataMain) => {

//  }
const fnHvData = async (area_id:any, areaMaster:any, nomination_point:any, nomDataMain:any, unit:any) => {

    const zoneAreaMaster:any = areaMaster?.find((f:any) => {
        return f?.name === area_id
    })
    const areaUsed:any = zoneAreaMaster?.entry_exit_id === 2 ? zoneAreaMaster?.supply_reference_quality_area_by?.name : zoneAreaMaster?.name
    const evGet = `${zoneAreaMaster?.zone?.name?.toLowerCase()}-${areaUsed?.toLowerCase()}`
    const evUse = evData?.[evGet]
   
    const hv_ = evUse ? (evUse?.sumHvMultiplyVi / evUse?.sumVi) : 1

    if(tabIndex == 1){
        if(hv_ !== null && nomination_point){
            const maximum_capacity = nomData?.find((f:any) => {
                return (
                    f?.nomination_point === nomination_point
                )
            })?.maximum_capacity
           
            if(unit === "MMSCFD"){
                setValue("maximum_capacity", roundTo3(maximum_capacity)) 
            }else{
               
                setValue("maximum_capacity", (roundTo3(hv_) * roundTo3(maximum_capacity))) 
                setValue("unit", "MMBTU/D");
            }
        }
    }else{
        // tab 0 area
        if(hv_ !== null){
            if(unit === "MMSCFD"){
                    const area_nominal_capacity:any = zoneAreaMaster?.entry_exit_id === 2 ? zoneAreaMaster?.supply_reference_quality_area_by?.area_nominal_capacity : zoneAreaMaster?.area_nominal_capacity
                    console.log('area_nominal_capacity : ', area_nominal_capacity);
                    console.log('hv_ : ', hv_);
                    console.log('roundTo3(area_nominal_capacity) : ', roundTo3(area_nominal_capacity));
                    console.log('roundTo3(hv_) : ', roundTo3(hv_));
                    setValue("maximum_capacity", roundTo3(area_nominal_capacity) / roundTo3(hv_))
                }else{
                    
                    const area_nominal_capacity:any = zoneAreaMaster?.area_nominal_capacity
                    setValue("maximum_capacity", roundTo3(area_nominal_capacity))
                    setValue("unit", "MMBTU/D");
                }
            }
    }

   
}

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
                            className="relative min-w-[1300px] max-w-[1500px] bg-white transform transition-all rounded-[20px] text-left shadow-lg data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:w-[90%] lg:max-w-3xl"
                        >
                            <div className="flex flex-col items-center justify-center p-4 gap-4 ">
                                <Spinloading spin={isLoading} rounded={20} />

                                <form
                                    onSubmit={handleSubmit(handleSubmitConfirm_)}
                                    className="bg-white p-6 w-full "
                                >
                                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#00ADEF] mb-4 ">
                                        {mode === "create" ? `New Curtailments Allocation : ${tabIndex == 0 ? 'Area' : 'Nomination'}` : mode === "edit" ? "Edit Daily Adjustment" : mode === "period" ? "New Period" : `Curtailments Allocation : ${tabIndex == 0 ? 'Area' : 'Nomination'}`}
                                    </h2>

                                    <div className={`grid gap-4 ${tabIndex === 0 ? 'grid-cols-5' : 'grid-cols-6'}`}>
                                        <div className="pb-2">
                                            <label className={labelClass}>
                                                <span className="text-red-500">*</span>
                                                {`Gas Day`}
                                            </label>

                                            <DatePickaForm
                                                {...register('gas_day', { required: "Select Gas Day" })}
                                                readOnly={isReadOnly}
                                                placeHolder="Select Gas Day"
                                                mode={mode}
                                                valueShow={watch("gas_day") && toDayjs(watch("gas_day")).format("DD/MM/YYYY")}
                                                // maxNormalForm={dayjs().add(2, 'day').format("YYYY-MM-DD")} // Maximum date is tomorrow
                                                allowClear
                                                isError={errors.gas_day && !watch("gas_day") ? true : false}
                                                onChange={(e: any) => { setValue('gas_day', formatFormDate(e)), e == undefined && setValue('gas_day', null, { shouldValidate: true, shouldDirty: true }); }}
                                            />
                                            {errors.gas_day && !watch("gas_day") && <p className={`${textErrorClass}`}>{'Select Gas Day'}</p>}
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
                                                valueWatch={watch("area_id") || ""}
                                                handleChange={(e) => {
                                                    setValue("area_id", e.target.value);
                                                    handleSelectArea(e.target.value)
                                                    if(tabIndex == 0){
                                                        fnHvData(e.target.value, areaMaster, watch("nomination_point"), nomDataMain, null)
                                                    }

                                                    clearErrors('area_id')
                                                    if (errors?.area_id) { clearErrors('area_id') }

                                                    clearErrors('maximum_capacity')
                                                    if (errors?.maximum_capacity) { clearErrors('maximum_capacity') }
                                                }}
                                                errors={errors?.area_id}
                                                errorsText={'Select Area'}
                                                options={areaMaster}
                                                optionsKey={'id'}
                                                optionsValue={'name'}
                                                optionsText={'name'}
                                                optionsResult={'name'}
                                                placeholder={'Select Area'}
                                                pathFilter={'name'}
                                            />

                                        </div>

                                        {
                                            tabIndex == 1 && <div>
                                                <label
                                                    htmlFor="nomination_point"
                                                    className="block mb-2 text-sm font-light"
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {`Nomination Point`}
                                                </label>

                                                <SelectFormProps
                                                    id={'nomination_point'}
                                                    register={register("nomination_point", { required: "Select Nomination Point" })}
                                                    disabled={isReadOnly}
                                                    valueWatch={watch("nomination_point") || ""}
                                                    handleChange={(e) => {
                                                        setValue("nomination_point", e.target.value);
                                                        // watch("area_id") areaMaster
                                                        // watch("nomination_point") nomDataMain
                                                        fnHvData(watch("area_id"), areaMaster, e.target.value, nomDataMain, null)

                                                        clearErrors('nomination_point')
                                                        if (errors?.nomination_point) { clearErrors('nomination_point') }
                                                    }}
                                                    errors={errors?.nomination_point}
                                                    errorsText={'Select Nomination Point'}
                                                    options={nomDataMain}
                                                    optionsKey={'id'}
                                                    optionsValue={'value'}
                                                    optionsText={'label'}
                                                    optionsResult={'label'}
                                                    placeholder={'Select Nomination Point'}
                                                    pathFilter={'label'}
                                                />
                                            </div>
                                        }

                                        <div className="relative">
                                            <label
                                                htmlFor="maximum_capacity"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Maximum Capacity`}
                                            </label>
                                            <NumericFormat
                                                id="maximum_capacity"
                                                placeholder="0.0000"
                                                value={watch("maximum_capacity")}
                                                readOnly={isReadOnly}
                                                {...register("maximum_capacity", { required: "Enter Value" })}
                                                // className={`${inputClass} text-[14px] ${errors.maximum_capacity && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'} text-right `}
                                                className={`relative w-full h-[44px] p-5 hover:!p-5 focus:!p-5 rounded-lg border-[1px] border-[#DFE4EA] bg-white outline-none  focus:border-[#00ADEF] text-[14px] ${errors.maximum_capacity && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'} text-right `}
                                                thousandSeparator={true}
                                                decimalScale={4}
                                                fixedDecimalScale={true}
                                                allowNegative={false}
                                                displayType="input"
                                                onValueChange={(values) => {
                                                    const { value } = values;
                                                    setValue("maximum_capacity", value, { shouldValidate: true, shouldDirty: true });
                                                }}
                                            />
                                            {errors.maximum_capacity && (<p className="text-red-500 text-sm absolute">{`Enter Maximum Capacity`}</p>)}
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="unit"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Unit`}
                                            </label>
                                            <Select
                                                id="unit"
                                                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                {...register("unit", { required: "Select Unit" })}
                                                disabled={isReadOnly}
                                                value={watch("unit") || ""}
                                                className={`${selectboxClass}  ${isReadOnly && '!bg-[#EFECEC]'} ${errors.unit && "border-red-500"}`}
                                                sx={{
                                                    '.MuiOutlinedInput-notchedOutline': {
                                                        // borderColor: '#DFE4EA', // Change the border color here
                                                        borderColor: errors.unit && !watch('unit') ? '#FF0000' : '#DFE4EA',
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: errors.unit && !watch("unit") ? "#FF0000" : "#d2d4d8"
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#d2d4d8',
                                                    },
                                                }}
                                                onChange={(e) => {
                                                    fnHvData(watch("area_id"), areaMaster, watch("nomination_point"), nomDataMain, e.target.value)
                                                    setValue("unit", e.target.value);
                                                    clearErrors('unit')
                                                }}
                                                displayEmpty
                                                renderValue={(value: any) => {
                                                    if (!value) {
                                                        return <Typography color="#9CA3AF" fontSize={14}>Select Unit</Typography>;
                                                    }

                                                    const selectedLabel = unit_data.find((item: any) => item.value === value)?.label || '';
                                                    return (
                                                        <Typography fontSize={14}>
                                                            {selectedLabel}
                                                        </Typography>
                                                    );
                                                }}
                                                MenuProps={{
                                                    PaperProps: {
                                                        style: {
                                                            maxHeight: 48 * 4.5 + 8, // Item height * 4.5 + padding
                                                        },
                                                    },
                                                }}
                                            >
                                                {
                                                    isExit ?
                                                        unit_data?.filter((item: any) => item.label == "MMBTU/D").map((item: any) => {
                                                            return (
                                                                <MenuItem key={item.value} value={item.value}>
                                                                    {item.label}
                                                                </MenuItem>
                                                            )
                                                        })
                                                        :
                                                        unit_data?.map((item: any) => {
                                                            return (
                                                                <MenuItem key={item.value} value={item.value}>
                                                                    {item.label}
                                                                </MenuItem>
                                                            )
                                                        })
                                                }
                                            </Select>

                                            {errors.unit && (<p className="text-red-500 text-sm">{`Select Unit`}</p>)}
                                        </div>

                                        <div
                                            className={`flex gap-2 flex-wrap ${errors ? 'mb-7 pt-[30px]' : ' mb-[11px] pt-[30px]'}`}
                                        >
                                            <BtnGeneral
                                                textRender={"Calculate"}
                                                iconNoRender={true}
                                                bgcolor={"#24AB6A"}
                                                generalFunc={() => handleCalculate()}
                                                disable={disableCalculateBtn}
                                                can_create={true}
                                            />
                                        </div>
                                    </div>
                      
                                    <div  >
                                        <div className="h-[calc(100vh-380px)] overflow-y-auto overflow-x-auto rounded-t-md">

                                            <table className="table-auto min-w-full text-sm rtl:text-right text-gray-500 whitespace-nowrap pt-2">

                                                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                                                    <tr className="h-9">

                                                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("shipper_name", sortState, setSortState, setSortedData, dataCal)}>
                                                            {`Shipper Name`}
                                                            {getArrowIcon("shipper_name")}
                                                        </th>

                                                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("contract", sortState, setSortState, setSortedData, dataCal)}>
                                                            {`Contract Code`}
                                                            {getArrowIcon("contract")}
                                                        </th>

                                                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("nominationValue", sortState, setSortState, setSortedData, dataCal)}>
                                                            {`Nomination Value`}
                                                            {getArrowIcon("nominationValue")}
                                                        </th>

                                                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("remainingCapacity", sortState, setSortState, setSortedData, dataCal)}>
                                                            {`Remaining Capacity`}
                                                            {getArrowIcon("remainingCapacity")}
                                                        </th>

                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {sortedData?.length > 0 && sortedData?.map((row: any, index: any) => {
                                                        return (
                                                            <tr
                                                                key={row?.id}
                                                                className={`${table_row_style}`}
                                                            >
                                                                <td className="px-2 py-1 text-[#464255] text-center">{row?.shipper_name ? row?.shipper_name : ''}</td>

                                                                <td className="px-2 py-1 text-[#464255] text-center">{row?.contract ? row?.contract : ''}</td>

                                                                <td className="px-2 py-1 text-[#464255] text-right">
                                                                    <div>{row?.nominationValue ? formatNumberFourDecimal(row?.nominationValue) : '0.0000'}</div>
                                                                </td>

                                                                <td className="px-2 py-1 text-[#464255] text-right">
                                                                    <div>{row?.remainingCapacity ? formatNumberFourDecimal(row?.remainingCapacity) : '0.0000'}</div>
                                                                </td>

                                                            </tr>
                                                        )
                                                    })}

                                                    {/* Sum row */}
                                                    {
                                                        sortedData?.length > 0 && <tr className={`${table_row_style} font-semibold !bg-[#D1F2FF]`}>
                                                            <td className="px-2 py-1 text-[#464255] text-center" colSpan={2}>Total</td>
                                                            <td className="px-2 py-1 text-[#464255] text-right">
                                                                {formatNumberFourDecimal(totals.totalNominationValue)}
                                                            </td>
                                                            <td className="px-2 py-1 text-[#464255] text-right">
                                                                {formatNumberFourDecimal(totals.totalRemainingCapacity)}
                                                            </td>
                                                        </tr>
                                                    }

                                                </tbody>
                                            </table>
                                            {
                                                sortedData?.length <= 0 && <NodataTable textRender={'Please select filter to view the information.'} />
                                            }
                                        </div>

                                    </div>

                                    <div className="flex justify-end gap-4 pt-6 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={() => handleClose()}
                                            className={`py-2 px-6 rounded-lg ${mode === "view" ? "bg-[#00ADEF] text-white hover:bg-blue-600" : "bg-slate-100 text-black hover:bg-rose-500"}`}
                                        >
                                            {mode === "view" ? "Close" : "Cancel"}
                                        </button>

                                        {mode !== "view" && (
                                            <button
                                                type="submit"
                                                disabled={dataCal.length <= 0}
                                                className={`w-[160px] font-semibold py-2 px-6 rounded-lg text-white
                                                    ${dataCal.length <= 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#00ADEF] hover:bg-blue-600'}
                                                `}
                                            >
                                                {mode === "create" ? "Add" : "Save"}
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
                                        {/*  */}
            <ModalComponent
                open={modaSubmitConfirm}
                // open={true}
                handleClose={(e: any) => {
                    setModaSubmitConfirm(false);
                    if (e == "submit") {
                        // onSubmit(dataSubmit)
                        handleSubmitConfirm()
                        setTimeout(async () => {
                            handleClose();
                        }, 1000);
                    }
                }}
                title="Submit Confirm"
                description={
                    <div>
                        <div className="text-center">
                            {`Are you sure to submit data ?`}
                        </div>
                        <div className="text-center">
                            {msgSave}
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