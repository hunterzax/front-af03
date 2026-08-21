import React from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from "@headlessui/react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useEffect, useState } from "react";
import { getService } from "@/utils/postService";
import { formatFormDate, formatWatchFormDate, getMinDate, toDayjs } from "@/utils/generalFormatter";
import { Checkbox, InputAdornment, ListItemText, ListSubheader, Tab, Tabs, TextField, Typography } from "@mui/material";
import { NumericFormat } from "react-number-format";
import DatePickaForm from "@/components/library/dateRang/dateSelectForm";
import dayjs from "dayjs";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Spinloading from "@/components/other/spinLoading";
import SearchIcon from '@mui/icons-material/Search';
import SelectFormProps from "@/components/other/selectProps";
import ModalConfirmSave from "@/components/other/modalConfirmSave";

type FormData = {
    nomination_point: string;
    description: string;
    entry_exit_id: string;
    zone_id: string;
    area_id: string;
    contract_point_list: any[];
    customer_type_id: any;
    maximum_capacity: any;
    start_date: Date;
    end_date: Date;
    ref_id: string;
    id: any;
};

type FormExampleProps = {
    mode?: "create" | "edit" | "view" | "period";
    data?: Partial<FormData>;
    open: boolean;
    dataTable?: any;
    dataCustType?: any;
    zoneMasterData: any;
    areaMasterData: any;
    entryExitMasterData: any;
    contractPointData: any;
    nominationPointData: any;
    validationContractList: any[];
    onClose: () => void;
    onSubmit: SubmitHandler<FormData>;
    setResetForm: (reset: () => void) => void;
    trickerLoading?: boolean
    settrickerLoading?: any
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode,
    data = {},
    dataTable = {},
    dataCustType = {},
    zoneMasterData = {},
    areaMasterData = {},
    entryExitMasterData = {},
    contractPointData = {},
    nominationPointData = {},
    validationContractList = [],
    open,
    onClose,
    onSubmit,
    setResetForm,
    trickerLoading = false,
    settrickerLoading
}) => {
    const {
        control,
        register,
        handleSubmit,
        setValue,
        reset,
        resetField,
        formState: { errors },
        watch,
        setError,
        clearErrors,
    } = useForm<any>({
        defaultValues: data,
    });

    const labelClass = "block mb-2 text-[14px] font-light"
    const inputClass = `text-sm block md:w-full !p-2 !ps-5 hover:!p-2 hover:!ps-5 focus:!p-2 focus:!ps-5 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF] ${mode == 'view' && '!border-none'}`;
    const selectboxClass = "flex w-full h-[44px] p-1 ps-[6px] pe-2 !rounded-lg text-gray-900 text-sm block outline-none";
    const textErrorClass = "text-red-500 text-[14px]"
    const itemselectClass = "pl-[10px] text-[14px]"

    const [isReadOnly, setIsReadOnly] = useState<boolean>(mode === "view" ? true : false);
    const [disableSaveBtn, setDisableSaveBtn] = useState<boolean>(false);
    useEffect(() => {
        setIsReadOnly(mode === "view" ? true : false)
    }, [mode])

    const startDate = watch("start_date");
    const formattedStartDate = formatWatchFormDate(startDate);
    const [stepAdd, setstepAdd] = useState<any>(1); // เริ่มต้น หน้า add == 1 หลังจาก add == 2
    const [areaEntry, setAreaEntry] = useState([])
    const [contractPointDataOriginal, setcontractPointDataOriginal] = useState<any>([])
    const [contractPointDataX, setContractPointData] = useState<any>([])
    const [tk, settk] = useState(false);

    const [zoneMaster, setZoneMaster] = useState(zoneMasterData);
    const [areaMaster, setAreaMaster] = useState(areaMasterData);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [dataNomPointFiltered, setDataNomPointFiltered] = useState<any>([]);

    const flatArea = entryExitMasterData?.flatMap((entryExit: any) => entryExit.area);

    const fetchData = async () => {
        try {
            const responseAreaEntry = await getService(`/master/asset/area-entry`);
            setAreaEntry(responseAreaEntry || [])
        } catch (err) {
        } finally {
        }
    };

    const entryExitId = watch("entry_exit_id");

    useEffect(() => {
        const filteredArea = flatArea.filter((item: any) => item.zone_id === watch("zone_id"));
        setAreaMaster(filteredArea)
    }, [entryExitMasterData, watch("nomination_point")])

    useEffect(() => {
      if(trickerLoading){
        setIsLoading(false);
        settrickerLoading(false);
      }
    }, [trickerLoading])
    

    useEffect(() => {
        const filteredContract = (contractPointData && Array.isArray(contractPointData) ? contractPointData : []).filter((item: any) => item.area_id == watch('area_id')) || []
        // if (data?.id) {
        //     const contractPointIDList = filteredContract.map((item: any) => item.id)
        //     // const contractCodeThatUseThisNominationPoint = validationContractList.filter(conntract => conntract.nominationPointInContract.some((point: any) => point.nominationPoint.some((nominationPoint: any) => Number(nominationPoint.id) == Number(data.id))))
        //     const contractWithContractChoice = [...validationContractList].filter(conntract => {
        //         const contractUseThisNominationPoint = conntract.nominationPointInContract.filter((point: any) => point.nominationPoint.some((nominationPoint: any) => Number(nominationPoint.id) == Number(data.id)))
        //         if (contractUseThisNominationPoint.length > 1) {
        //             const contractUseThisContractPointChoice = contractUseThisNominationPoint.filter((point: any) => point.contractPoint.some((contractPoint: any) => contractPointIDList.includes(Number(contractPoint.id))))
        //             if (contractUseThisContractPointChoice.length > 0) {
        //                 conntract.choice = contractUseThisContractPointChoice
        //                 return true
        //             }
        //         }
        //         return false
        //     })
        //     const selectedContractPointIDList = [48]//(watch("contract_point_id") ? Array.isArray(watch("contract_point_id")) ? watch("contract_point_id") : [watch("contract_point_id")] : [])
        //     const isRemove = contractWithContractChoice.filter(conntract => {
        //         const a = conntract.choice.filter((point: any) => {
        //             if (point.contractPoint.some((contractPoint: any) => selectedContractPointIDList.includes(Number(contractPoint.id)))) {
        //                 return true
        //             }
        //             return false
        //         })
        //         return true
        //     })
        //     // filteredContract.filter((item: any) => {
        //     //     const validationListOnlyThisPoint = validationContractList.filter(conntract => conntract.nominationPointInContract.some((point: any) => point.contractPoint.some((contractPoint: any) => contractPoint.id == item.id)))

        //     //     return validationListOnlyThisPoint
        //     // })
        // }
        setcontractPointDataOriginal(filteredContract);
        setContractPointData(filteredContract);
    }, [watch('area_id')]);

    const [showTheRest, setShowTheRest] = useState<any>(false);

    useEffect(() => {
        const fetchAndSetData = async () => {

            clearErrors();
            if (errors?.maximum_capacity) { clearErrors('maximum_capacity') }
            resetField("start_date");
            resetField("end_date");

            if (mode == 'period') {
                setIsLoading(false);
                setstepAdd(1);
                setShowTheRest(false);
                setIsReadOnly(false);
            }
            if (mode === "edit" || mode === "view") {
                clearErrors();
                setstepAdd(2);

                // v1.0.77 ถ้ายังไม่ถึง start date ควรแก้ไขได้ทุกอย่าง https://app.clickup.com/t/86erfr3uf
                // isReadOnly

                if (data && mode !== 'view') {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0); // Set today's time to 00:00:00 for comparison

                    const startDate = data.start_date ? new Date(data.start_date) : null;
                    if (startDate) startDate.setHours(0, 0, 0, 0); // Set startDate's time to 00:00:00
                    setIsReadOnly(startDate && startDate > today ? false : true)
                }

                const formattedStartDate: any = formatFormDate(data?.start_date);
                // const formattedEndDate: any = formatFormDate(data?.end_date);
                let formattedEndDate: any = 'Invalid Date'
                if (data?.end_date !== null) {
                    formattedEndDate = formatFormDate(data?.end_date);
                }

                setValue("end_date", formattedEndDate);

                // setValue("nomination_point", data?.nomination_point || "");
                setValue("nomination_point_id", data?.id || "");
                setValue("nomination_point", data?.nomination_point || "");
                setNomPointText(data?.nomination_point)
                setValue("description", data?.description || "");
                setValue("customer_type_id", data?.customer_type_id || "");
                setValue("entry_exit_id", data?.entry_exit_id || "");
                setValue("zone_id", data?.zone_id || "");
                setValue("area_id", data?.area_id || "");
                setValue("contract_point_id", data?.contract_point_list?.map(item => item.id) || []);
                setValue("maximum_capacity", data?.maximum_capacity || null);
                setValue("start_date", formattedStartDate);
                setValue("ref_id", data?.ref_id || "");
                setValue("id", data?.id || "");

                setContractPointData(contractPointData);

                const filteredArea = flatArea.filter((item: any) => item.zone_id === data?.zone_id);
                setAreaMaster(filteredArea)
                setShowTheRest(true)
                setTimeout(() => {
                    if (data) { setIsLoading(false); }
                }, 300);
            }
            if (mode == 'create') {
                clearErrors();
                setstepAdd(2);
                setShowTheRest(true);
                setIsLoading(false);
            }
        }
        fetchAndSetData();
    }, [data, mode, setValue]);

    useEffect(() => {
        setNomPointText('')
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    useEffect(() => {
        fetchData();
    }, []);

    const [nomPointText, setNomPointText] = useState<any>('');

    const modeNewPeriod = ((id: any) => {
        // const filteredData = nominationPointData?.find((item: any) => item.id === id);
        const filteredData = dataNomPointFiltered?.find((item: any) => item.id === id);
        const filteredArea = flatArea.filter((item: any) => item.zone_id === filteredData?.zone_id);

        setNomPointText(filteredData?.nomination_point)
        setAreaMaster(filteredArea)

        setValue("nomination_point", filteredData?.id || "");
        setValue("description", filteredData?.description || "");
        setValue("entry_exit_id", filteredData?.entry_exit_id || "");
        setValue("zone_id", filteredData?.zone_id || "");
        setValue("area_id", filteredData?.area_id || "");
        setValue("contract_point_id", filteredData?.contract_point_list?.map((item: any) => item.id) || []);
        setValue("customer_type_id", filteredData?.customer_type_id || "");
        setValue("maximum_capacity", filteredData?.maximum_capacity || 0);
        // setValue("start_date", filteredData?.start_date);
        // setValue("end_date", filteredData?.end_date);
        setValue("ref_id", filteredData?.ref_id || "");
        setValue("id", filteredData?.id || "");

        // setShowTheRest(true);
        // setIsReadOnly(false);
    })

    const handleClose = () => {
        onClose();

        setTimeout(() => {
            setIsLoading(true);
        }, 100);
    };

    useEffect(() => {
        setDisableSaveBtn(false);
    }, [watch('nomination_point'), watch('description'), watch('entry_exit_id'), watch('zone_id'), watch('area_id'), watch('contract_point_id'), watch('customer_type_id'), watch('maximum_capacity'), watch('start_date')])

    useEffect(() => {
        const today = toDayjs();
        const filterNomPoint = dataTable.filter((item: any) => {
            const startDate = toDayjs(item.start_date);
            const endDate = item.end_date ? toDayjs(item.end_date) : null;

            return startDate.isSameOrBefore(today, 'day') && (!endDate || endDate.isAfter(today, 'day'));
        });

        setDataNomPointFiltered(filterNomPoint)
    }, [nominationPointData])

    useEffect(() => {
        if (watch('nomination_point') && mode == "period" && stepAdd == 2) {
            setValue("nomination_point", nomPointText);
        }
    }, [stepAdd]);

    // #region Confirm Save
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()

    const handleSaveConfirm = async (data?: any) => {
        if (mode == 'create' || mode == 'period' && stepAdd == 2) {
            setIsLoading(true);
            setTimeout(async () => {
                await onSubmit(data);
            }, 100);
        } else {
            let listValidate = [
                'nomination_point',
                'entry_exit_id',
                'zone_id',
                'area_id',
                'contract_point_id',
                'customer_type_id',
                'maximum_capacity',
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
                        setDataSubmit(data)
                        setModaConfirmSave(true)
                    }, 300)
                }
            }

            listValidate?.map((item: any) => {
                return checkOption(item);
            })
        }
    }

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
                            <Spinloading spin={isLoading} rounded={20} /> {/* loading example here */}
                            <div className="flex inset-0 items-center justify-center ">
                                <div className="flex flex-col items-center justify-center gap-2 rounded-md ">
                                    <form
                                        onSubmit={handleSubmit(handleSaveConfirm)}
                                        className="bg-white p-8 rounded-[20px] shadow-lg w-[600px]"
                                    >
                                        <h2 className="text-xl font-bold text-[#00ADEF] mb-2 pb-2">{mode == "create" ? `New Nomination Point` : mode == "edit" ? "Edit Nomination Point" : mode == "period" ? "New Period" : "View Nomination Point"}</h2>
                                        {/* <div className="grid grid-cols-2 gap-2 pt-4"> */}
                                        <div className={`grid ${!showTheRest && '!grid-cols-1'} grid-cols-2 gap-2 pt-4`}>

                                            <div>
                                                <label
                                                    htmlFor="name"
                                                    className="block mb-2 text-sm font-light"
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {`Nomination Point`}
                                                </label>
                                                {
                                                    (mode == "create" || mode == 'edit' || mode == 'view' || (mode == "period" && stepAdd == 2)) ?
                                                        <>
                                                            <input
                                                                id="nomination_point"
                                                                type="text"
                                                                placeholder="Enter Nomination Point"
                                                                // value={nomPointText ?? watch("nomination_point")}
                                                                value={nomPointText}
                                                                {...register("nomination_point", {
                                                                    required: mode === 'create' || mode === 'period' && stepAdd == 2,
                                                                    onChange: (e) => {
                                                                        setNomPointText(e.target.value); // update your local state if needed
                                                                        setValue("nomination_point", e.target.value)
                                                                    }
                                                                })}
                                                                readOnly={isReadOnly}
                                                                className={`${inputClass} ${errors.nomination_point && "border-red-500"} ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                            />

                                                            {(errors.ref_id || errors.nomination_point) && (<p className="text-red-500 text-sm">{`Enter Nomination Point`}</p>)}
                                                        </>
                                                        : (mode == "period" && stepAdd == 1) &&
                                                        <SelectFormProps
                                                            id={'ref_id'}
                                                            register={register("ref_id", { required: mode == 'period' ? true : false })}
                                                            disabled={isReadOnly}
                                                            valueWatch={stepAdd == 1 ? watch("nomination_point") : nomPointText}
                                                            handleChange={(e) => {
                                                                modeNewPeriod(e.target.value);
                                                                clearErrors('ref_id');
                                                            }}
                                                            errors={errors?.ref_id}
                                                            errorsText={'Select Nomination Point'}
                                                            options={dataNomPointFiltered}
                                                            optionsKey={'id'}
                                                            optionsValue={'id'}
                                                            optionsText={'nomination_point'}
                                                            optionsResult={'nomination_point'}
                                                            placeholder={'Select Nomination Point'}
                                                            pathFilter={'nomination_point'}
                                                        />
                                                }
                                            </div>

                                            {
                                                showTheRest && <>
                                                    <div>
                                                        <label
                                                            htmlFor="description"
                                                            className="block mt-[1px] mb-[8.5px] text-sm font-light"
                                                        >
                                                            {`Description`}
                                                        </label>
                                                        <input
                                                            id="description"
                                                            type="text"
                                                            placeholder="Enter Description"
                                                            // readOnly={isReadOnly}
                                                            readOnly={mode == 'view' ? true : false}
                                                            // {...register("description", {required: "Type Description"})}
                                                            {...register("description")}
                                                            className={`${inputClass} ${errors.description && "border-red-500"}  ${mode == 'view' && '!bg-[#EFECEC]'}`}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label
                                                            htmlFor="entry_exit_id"
                                                            className="block mb-2 text-sm font-light"
                                                        >
                                                            <span className="text-red-500">*</span>
                                                            {`Entry/Exit`}
                                                        </label>

                                                        <SelectFormProps
                                                            id={'entry_exit_id'}
                                                            register={register("entry_exit_id", { required: "Select Entry/Exit" })}
                                                            disabled={mode == "period" ? true : isReadOnly}
                                                            valueWatch={watch("entry_exit_id") || ""}
                                                            handleChange={(e) => {
                                                                if (watch("entry_exit_id") != e.target.value) {
                                                                    resetField("zone_id")
                                                                    resetField("area_id")
                                                                    resetField("contract_point_id")
                                                                }
                                                                setValue("entry_exit_id", e.target.value);
                                                                const filteredZones = zoneMasterData.filter((zone: any) => zone.entry_exit_id === e.target.value);
                                                                setZoneMaster(filteredZones)
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
                                                        <label
                                                            htmlFor="zone_id"
                                                            className="block mb-2 text-sm font-light"
                                                        >
                                                            <span className="text-red-500">*</span>
                                                            {`Zone`}
                                                        </label>

                                                        <SelectFormProps
                                                            id={'zone_id'}
                                                            register={register("zone_id", { required: "Select Zone" })}
                                                            disabled={isReadOnly}
                                                            valueWatch={watch("zone_id") || ""}
                                                            handleChange={(e) => {
                                                                if (watch("zone_id") != e.target.value) {
                                                                    resetField("area_id")
                                                                    resetField("contract_point_id")
                                                                }

                                                                setValue("zone_id", e.target.value);
                                                                const filteredArea = flatArea.filter((item: any) => item.zone_id === e.target.value);
                                                                setAreaMaster(filteredArea)
                                                                if (errors?.zone_id) { clearErrors('zone_id') }
                                                            }}
                                                            errors={errors?.zone_id}
                                                            errorsText={'Select Zone'}
                                                            options={zoneMaster?.filter((f: any) => { return f?.entry_exit_id === entryExitId })}
                                                            optionsKey={'id'}
                                                            optionsValue={'id'}
                                                            optionsText={'name'}
                                                            optionsResult={'name'}
                                                            placeholder={'Select Zone'}
                                                            pathFilter={'name'}
                                                        />

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
                                                                if (watch("area_id") != e.target.value) {
                                                                    resetField("contract_point_id")
                                                                }
                                                                setValue("area_id", e.target.value);
                                                                if (errors?.area_id) { clearErrors('area_id') }
                                                            }}
                                                            errors={errors?.area_id}
                                                            errorsText={'Select Area'}
                                                            options={areaMaster}
                                                            optionsKey={'id'}
                                                            optionsValue={'id'}
                                                            optionsText={'name'}
                                                            optionsResult={'name'}
                                                            placeholder={'Select Area'}
                                                            pathFilter={'name'}
                                                        />

                                                    </div>

                                                    <div>
                                                        <label
                                                            htmlFor="contract_point_id"
                                                            className="block mb-2 text-sm font-light"
                                                        >
                                                            <span className="text-red-500">*</span>
                                                            {`Contract Point`}
                                                        </label>
                                                        <Select
                                                            id="contract_point_id"
                                                            multiple
                                                            displayEmpty
                                                            IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                            {...register("contract_point_id", { required: "Select Contract Point" })}
                                                            disabled={isReadOnly}
                                                            value={watch("contract_point_id") ? Array.isArray(watch("contract_point_id")) ? watch("contract_point_id") : [watch("contract_point_id")] : []}
                                                            className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.contract_point_id && "border-red-500"}`}
                                                            sx={{
                                                                '.MuiOutlinedInput-notchedOutline': {
                                                                    // borderColor: '#DFE4EA', // Change the border color here
                                                                    borderColor: errors.contract_point_id && (!watch("contract_point_id") || watch("contract_point_id").length < 1) ? '#FF0000' : '#DFE4EA',
                                                                },
                                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: errors.contract_point_id && !watch("contract_point_id") ? "#FF0000" : "#d2d4d8",
                                                                },
                                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: '#d2d4d8',
                                                                },
                                                            }}
                                                            onChange={(e: any) => {
                                                                const value = watch("contract_point_id") ? Array.isArray(watch("contract_point_id")) ? watch("contract_point_id") : [watch("contract_point_id")] : []
                                                                const selectedValues = e.target.value as string[];
                                                                let newValues;
                                                                if (selectedValues.includes("all")) {
                                                                    newValues = value.length === contractPointDataX.length ? [] : contractPointDataX.map((item: any) => item.id);
                                                                } else {
                                                                    newValues = selectedValues;
                                                                }

                                                                setValue("contract_point_id", newValues);
                                                            }}
                                                            renderValue={(selected) => {
                                                                let selectedList = []
                                                                if (selected) {
                                                                    if (Array.isArray(selected)) {
                                                                        selectedList = selected
                                                                    }
                                                                    else {
                                                                        selectedList = [selected]
                                                                    }
                                                                }
                                                                if (selectedList.length === 0) {
                                                                    return <Typography color="#9CA3AF" className={isReadOnly ? 'opacity-0' : 'opacity-100'} fontSize={14}>Select Contract Point</Typography>;
                                                                }
                                                                const selectedOptions = contractPointDataX?.filter((item: any) => selectedList.includes(item.id));

                                                                // return <span className={`${itemselectClass}`}>{contractPointDataX?.length == selected?.length ? `Select All` : `${selected?.length} Selected`}</span>;
                                                                return (
                                                                    <span className={itemselectClass}>
                                                                        {contractPointDataX?.length == selectedOptions?.length ? `Select All` : selectedOptions?.map((option: any) => option.contract_point).join(", ")}
                                                                    </span>
                                                                );
                                                            }}
                                                            MenuProps={{
                                                                PaperProps: {
                                                                    style: {
                                                                        maxHeight: 48 * 4.5 + 8,
                                                                    },
                                                                },
                                                                autoFocus: false,
                                                                disableAutoFocusItem: true,
                                                            }}
                                                        >

                                                            {contractPointDataOriginal?.length >= 5 &&
                                                                <ListSubheader style={{ width: '100%' }}>
                                                                    <TextField
                                                                        size="small"
                                                                        autoFocus
                                                                        placeholder="Type to search..."
                                                                        InputProps={{
                                                                            startAdornment: (
                                                                                <InputAdornment position="start">
                                                                                    <SearchIcon sx={{ fontSize: 16 }} />
                                                                                </InputAdornment>
                                                                            )
                                                                        }}
                                                                        className='inputSearchk'
                                                                        style={{ width: '100%', height: 40 }}
                                                                        onChange={(e) => {
                                                                            const loadData: any = contractPointDataOriginal;
                                                                            if (e?.target?.value) {
                                                                                const queryLower = e?.target?.value.toLowerCase().replace(/\s+/g, '')?.trim();
                                                                                let newItem: any = loadData?.filter((item: any) => item?.contract_point?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower));

                                                                                setContractPointData(newItem)
                                                                                settk(!tk);
                                                                            } else {

                                                                                setContractPointData(loadData)
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

                                                            {/* Select All Option */}
                                                            {contractPointDataX?.length >= 1 &&
                                                                <MenuItem value="all" sx={{ fontSize: "14px", color: "#454255" }}>
                                                                    <Checkbox checked={(watch("contract_point_id") ? Array.isArray(watch("contract_point_id")) ? watch("contract_point_id") : [watch("contract_point_id")] : []).length === contractPointDataX.length} sx={{ padding: "0px", marginRight: "8px" }} />
                                                                    <ListItemText primary={<span style={{ fontWeight: 'bold', fontSize: "14px" }}>{"Select All"}</span>} />
                                                                </MenuItem>
                                                            }

                                                            {/* Other Options */}
                                                            {contractPointDataX?.map((item: any) => {
                                                                return (
                                                                    <MenuItem key={item.id} value={item.id} sx={{ fontSize: "14px", color: "#454255" }}>
                                                                        <Checkbox checked={(watch("contract_point_id") ? Array.isArray(watch("contract_point_id")) ? watch("contract_point_id") : [watch("contract_point_id")] : []).includes(item.id)} sx={{ padding: "0px", marginRight: "8px" }} />
                                                                        <ListItemText primary={<span style={{ fontSize: "14px" }}>{item.contract_point}</span>} />
                                                                    </MenuItem>
                                                                )
                                                            })}
                                                        </Select>
                                                        {errors.contract_point_id && (<p className="text-red-500 text-sm">{`Select Contract Point`}</p>)}
                                                    </div>

                                                    <div>
                                                        <label
                                                            htmlFor="customer_type_id"
                                                            className="block mb-2 text-sm font-light"
                                                        >
                                                            <span className="text-red-500">*</span>
                                                            {`Customer Type`}
                                                        </label>

                                                        <SelectFormProps
                                                            id={'customer_type_id'}
                                                            register={register("customer_type_id", { required: "Select Customer Type" })}
                                                            disabled={isReadOnly}
                                                            valueWatch={watch("customer_type_id") || ""}
                                                            handleChange={(e) => {
                                                                setValue("customer_type_id", e.target.value);
                                                            }}
                                                            errors={errors?.customer_type_id}
                                                            errorsText={'Select Customer Type'}
                                                            options={dataCustType}
                                                            optionsKey={'id'}
                                                            optionsValue={'id'}
                                                            optionsText={'name'}
                                                            optionsResult={'name'}
                                                            placeholder={'Select Customer Type'}
                                                            pathFilter={'name'}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label htmlFor="maximum_capacity" className="block mb-2 text-sm font-light">
                                                            <span className="text-red-500">*</span>{`Maximum Capacity (MMSCFD)`}
                                                        </label>
                                                        <NumericFormat
                                                            id="maximum_capacity"
                                                            placeholder="0.000"
                                                            value={watch("maximum_capacity")}
                                                            readOnly={isReadOnly}
                                                            {...register("maximum_capacity", { required: "Enter Maximum Capacity (MMSCFD)" })}
                                                            className={`${inputClass} ${errors.maximum_capacity && "border-red-500"} ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                            thousandSeparator={true}
                                                            decimalScale={3}
                                                            fixedDecimalScale={true}
                                                            allowNegative={false}
                                                            displayType="input"
                                                            onValueChange={(values) => {
                                                                const { value } = values;
                                                                if (value !== '') {
                                                                    setValue("maximum_capacity", value, { shouldValidate: true, shouldDirty: true });
                                                                }
                                                            }}
                                                        />
                                                        {errors.maximum_capacity && <p className="text-red-500 text-sm">{`Enter Maximum Capacity (MMSCFD)`}</p>}
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
                                                            // mode={mode == 'period' ? 'create' : mode}
                                                            // mode={mode == 'period' ? 'create' : mode == 'edit' ? 'view' : mode}
                                                            mode={mode == 'period' ? 'create' : mode == 'edit' ? 'edit' : mode}
                                                            valueShow={watch("start_date") && dayjs(watch("start_date")).format("DD/MM/YYYY")}
                                                            min={mode == 'period' ? dayjs().add(1, 'day').toISOString() : new Date()}
                                                            maxNormalForm={watch('end_date') && watch('end_date')} // ไม่ให้ start_date เกิน end_date
                                                            allowClear
                                                            isError={errors.start_date && !watch("start_date") ? true : false}
                                                            onChange={(e: any) => {
                                                                setValue('start_date', formatFormDate(e))
                                                                e == undefined && setValue('start_date', null, { shouldValidate: true, shouldDirty: true })
                                                            }}
                                                        />

                                                        {errors.start_date && !watch("start_date") && <p className={`${textErrorClass}`}>{'Select Start Date'}</p>}
                                                    </div>

                                                    <div className="pb-2">
                                                        <label className={`${labelClass} mt-[1px] mb-[8.5px]`}>{`End Date`}</label>

                                                        <DatePickaForm
                                                            {...register('end_date')}
                                                            readOnly={!formattedStartDate ? true : mode == 'edit' || mode == 'create' || mode == 'period' ? false : true}
                                                            placeHolder="Select End Date"
                                                            mode={mode == 'period' ? 'create' : mode == 'edit' ? 'edit' : mode}
                                                            // min={formattedStartDate || undefined}
                                                            min={getMinDate(formattedStartDate)}
                                                            // valueShow={watch("end_date") ? dayjs(watch("end_date")).format("DD/MM/YYYY") : undefined}
                                                            valueShow={watch("end_date") && dayjs(watch("end_date")).format("DD/MM/YYYY")}
                                                            // valueShow={
                                                            //     mode === 'period'
                                                            //         ? watch("end_date")
                                                            //         : watch("end_date") && dayjs(watch("end_date")).format("DD/MM/YYYY")
                                                            // }
                                                            allowClear
                                                            onChange={(e: any) => {
                                                                setValue('end_date', formatFormDate(e))
                                                                e == undefined && setValue('end_date', null, { shouldValidate: true, shouldDirty: true })
                                                            }}
                                                        />
                                                    </div>
                                                </>
                                            }
                                        </div>

                                        <div className="flex justify-end pt-6">
                                            {mode === "view" ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleClose()}
                                                    className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                                >
                                                    {`Close`}
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleClose()}
                                                    className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500"
                                                >
                                                    {`Cancel`}
                                                </button>
                                            )}

                                            {mode !== "view" && (
                                                mode == "period" && stepAdd == 1 ?
                                                    <div
                                                        id="fake-button-add"
                                                        className="w-[167px] font-light bg-[#00ADEF] text-center cursor-pointer transition duration-75 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                                        onClick={() => {
                                                            if (watch('ref_id')) {
                                                                setShowTheRest(true)
                                                                clearErrors('');
                                                                setDisableSaveBtn(true); // v1.0.90 Nomination Point New Period ขึ้นปุ่ม Save ก่อนมีการแก้ไขข้อมูล https://app.clickup.com/t/86ervrxj6
                                                                setTimeout(() => {
                                                                    setstepAdd(2); // ใช้กด add หลักจากเลือก period แล้ว
                                                                }, 100)
                                                            } else {
                                                                setError('ref_id', { type: "custom", message: "Select Nomination Point" })
                                                            }
                                                        }
                                                        }
                                                    >
                                                        {"Add"}
                                                    </div>
                                                    :
                                                    <button
                                                        id="button-save"
                                                        type="submit"
                                                        disabled={disableSaveBtn}
                                                        className={`w-[167px] font-light py-2 rounded-lg focus:outline-none ${disableSaveBtn ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#00ADEF] text-white hover:bg-blue-600 focus:bg-blue-600'}`}
                                                    >
                                                        {mode === "create" || mode === "period" ? "Add" : "Save"}
                                                    </button>

                                            )}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </DialogPanel>
                    </div >
                </div >
            </Dialog >

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