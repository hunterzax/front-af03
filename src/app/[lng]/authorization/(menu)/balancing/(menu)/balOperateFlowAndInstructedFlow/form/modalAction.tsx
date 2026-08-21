import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import { useEffect, useState } from "react";
import Spinloading from '@/components/other/spinLoading';
import ModalConfirmSave from '@/components/other/modalConfirmSave';
import SelectFormProps from '@/components/other/selectProps';
import { NumericFormat } from 'react-number-format';

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
    data?: Partial<any>;
    open: boolean;
    dataTable: any;
    dataShipperGroup: any;
    onClose: () => void;
    onSubmit: SubmitHandler<any>;
    setResetForm: (reset: () => void) => void;
};

const roundDecimal = (value: number, decimal = 6) => {
    const factor = Math.pow(10, decimal);
    return Math.round((value + Number.EPSILON) * factor) / factor;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode = 'create',
    data = {},
    dataTable = {},
    dataShipperGroup = {},
    open,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const { control, register, handleSubmit, setValue, clearErrors, reset, setError, formState: { errors }, watch } = useForm<any>({
        defaultValues: data,
    });

    const inputClass = "text-[14px] block md:w-full p-2 ps-5 focus:!ps-5 hover:!ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"

    {/* Confirm Save */ }
    const [tk, settk] = useState<boolean>(true);
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()

    // const isReadOnly = (mode === "view" || mode === 'edit');
    const isReadOnly = mode === "view" || (data?.start_date && new Date(data?.start_date) < new Date());
    const isPastStartDate = (data?.start_date && new Date(data?.start_date) < new Date());

    // const startDate = new Date();

    //state
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [showDescAndPoint, setShowDescAndPoint] = useState(false);
    const [isEdited, setIsEdited] = useState(false); // เอาไว้จับ mode new period ว่าแก้ไขข้อมูลอะไรไปหรือยัง ถ้ายังปุ่ม add จะ disable
    const [ShipperData, setShipperData] = useState<any>({});

    const option_flow_type = [
        {
            id: 1,
            value: "DD",
            // name: "DIFFICULT DAY FLOW"
            name: "DIFFICULT DAY FLOW"
        },
        {
            id: 2,
            value: "OFO",
            // name: "OPERATION FLOW"
            name: "OPERATION FLOW ORDER"
        },
        {
            id: 3,
            value: "IF",
            name: "INSTRUCTED FLOW"
        }
    ]

    const fetchAndSetData = async () => {
        clearErrors();

        const find_shipper = dataShipperGroup?.find((itemx: any) => itemx?.id_name == data?.shipperName)
        setShipperData(find_shipper)

        if (mode === 'create') {
            setIsLoading(false);
            setShowDescAndPoint(true);
        }

        if (mode === 'edit' || mode === 'view') {
            setIsLoading(true);

            let flow_type_val: any

            if (data?.flow_type == "DIFFICULT DAY FLOW" || data?.flow_type == "DIFFICULT DAY") {
                flow_type_val = "DD"
            } else if (data?.flow_type == "OPERATION FLOW" || data?.flow_type == "OPERATION FLOW ORDER") {
                flow_type_val = "OFO"
            } else if (data?.flow_type == "INSTRUCTED FLOW") {
                flow_type_val = "IF"
            } else {
                flow_type_val = ""
            }

            setValue('accImb_or_accImbInv', data?.accImb_or_accImbInv || '');
            setValue('accMargin', data?.accMargin || '');
            setValue('energyAdjust', data?.energyAdjust || '');
            setValue('energyAdjustRate_mmbtud', data?.energyAdjustRate_mmbtud || '');
            setValue('energyAdjustRate_mmbtuh', data?.energyAdjustRate_mmbtuh || '');
            setValue('flow_type', flow_type_val || '');
            setValue('heatingValue', data?.heatingValue || '');
            setValue('resolveHour', data?.resolveHour || '');
            setValue('volumeAdjust', data?.volumeAdjust || '');
            setValue('volumeAdjustRate_mmscfd', data?.volumeAdjustRate_mmscfd || '');
            setValue('volumeAdjustRate_mmscfh', data?.volumeAdjustRate_mmscfh || '');

            setTimeout(() => {
                setIsLoading(false)
            }, 300);
        }
    }
    //load data
    useEffect(() => {
        fetchAndSetData();
         
    }, [data, mode, setValue]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    const handleClose = () => {
        onClose();

        clearErrors();
        setResetForm(() => reset);
        setTimeout(() => {
            setIsLoading(false);
        }, 100);
    };

    {/* Confirm Save */ }
    const handleSaveConfirm = async (data?: any) => {
         
        if (mode == 'create') {
            await onSubmit(data);
        } else {
            setDataSubmit(data)
            setModaConfirmSave(true)
        }
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
                            <div className="flex inset-0 items-center justify-center ">
                                <div className="flex flex-col items-center justify-center rounded-md">
                                    <Spinloading spin={isLoading} rounded={20} />
                                    <form
                                        className="bg-white p-8 rounded-[20px] shadow-lg w-[1200px]"
                                        onSubmit={handleSubmit(handleSaveConfirm)}
                                    >
                                        <h2 className="text-xl font-bold text-[#00ADEF] mb-3 pb-3">{mode == "create" ? `New Metered Point` : mode == "edit" ? `Edit ` : `View`}</h2>
                                        <div className="mb-4 w-[70%]">

                                            <div className="grid grid-cols-5 w-full text-sm font-semibold text-[#58585A] pb-2">
                                                <p>{`Timestamp`}</p>
                                                <p>{`Shipper Name`}</p>
                                                <p>{`Zone`}</p>
                                            </div>

                                            <div className="grid grid-cols-5 text-sm font-light text-[#58585A]">
                                                <p>{data?.timestamp || ''}</p>
                                                {/* <p>{data?.shipperName || ''}</p> */}
                                                <p>{data?.shipperName ? ShipperData?.name : ''}</p>
                                                <p>{data?.zone || ''}</p>
                                            </div>
                                        </div>

                                        <div className={`grid ${!showDescAndPoint && '!grid-cols-1'} grid-cols-3 gap-2 pt-4`}>


                                            <div>
                                                <label
                                                    htmlFor="accImb_or_accImbInv"
                                                    className="block mb-2 text-sm font-light"
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {`Acc. Imbalance / Acc. Imbalance Inventory (MMBTU)`}
                                                </label>
                                                <NumericFormat
                                                    id="accImb_or_accImbInv"
                                                    placeholder="0.0000"
                                                    value={watch("accImb_or_accImbInv")}
                                                    readOnly={isReadOnly}
                                                    {...register("accImb_or_accImbInv", { required: "Enter Acc. Imbalance / Acc. Imbalance Inventory (MMBTU)" })}
                                                    className={`${inputClass} ${errors.accImb_or_accImbInv && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                    thousandSeparator={true}
                                                    decimalScale={4}
                                                    fixedDecimalScale={true}
                                                    allowNegative={true} // https://app.clickup.com/t/86eujrgtp
                                                    displayType="input"
                                                    onValueChange={(values) => {
                                                        const { value } = values;
                                                        setValue("accImb_or_accImbInv", value, { shouldValidate: true, shouldDirty: true });
                                                    }}
                                                />
                                                {errors.accImb_or_accImbInv && (<p className="text-red-500 text-sm">{`Enter Acc. Imbalance / Acc. Imbalance Inventory (MMBTU)`}</p>)}
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="accMargin"
                                                    className="block mb-2 text-sm font-light"
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {`Acc.Margin (MMBTU)`}
                                                </label>
                                                <NumericFormat
                                                    id="accMargin"
                                                    placeholder="0.0000"
                                                    value={watch("accMargin")}
                                                    readOnly={isReadOnly}
                                                    {...register("accMargin", { required: "Enter Acc.Margin (MMBTU)" })}
                                                    className={`${inputClass} ${errors.accMargin && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                    thousandSeparator={true}
                                                    decimalScale={4}
                                                    fixedDecimalScale={true}
                                                    allowNegative={true}
                                                    displayType="input"
                                                    onValueChange={(values) => {
                                                        const { value } = values;
                                                        setValue("accMargin", value, { shouldValidate: true, shouldDirty: true });
                                                    }}
                                                />
                                                {errors.accMargin && (<p className="text-red-500 text-sm">{`Enter Acc.Margin (MMBTU)`}</p>)}
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="flow_type"
                                                    className="block mb-2 text-sm font-light"
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {`Flow Type`}
                                                </label>
                                                <SelectFormProps
                                                    id={'flow_type'}
                                                    register={register("flow_type", { required: mode == 'period' ? true : false })}
                                                    disabled={isReadOnly}
                                                    valueWatch={watch("flow_type")}
                                                    handleChange={(e) => {
                                                        setValue("flow_type", e?.target?.value)
                                                        clearErrors('flow_type');
                                                    }}
                                                    errors={errors?.flow_type}
                                                    errorsText={'Select Flow Type'}
                                                    options={option_flow_type}
                                                    optionsKey={'id'}
                                                    optionsValue={'value'}
                                                    optionsText={'name'}
                                                    optionsResult={'name'}
                                                    placeholder={'Select Flow Type'}
                                                    pathFilter={'name'}
                                                />
                                                {errors.flow_type && (<p className="text-red-500 text-sm">{`Enter Value`}</p>)}
                                            </div>



                                            <div>
                                                <label
                                                    htmlFor="energyAdjust"
                                                    className="block mb-2 text-sm font-light"
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {`Energy Adjustment (MMBTU)`}
                                                </label>
                                                <NumericFormat
                                                    id="energyAdjust"
                                                    placeholder="0.0000"
                                                    value={watch("energyAdjust")}
                                                    readOnly={isReadOnly}
                                                    {...register("energyAdjust", { required: "Enter Energy Adjustment (MMBTU)" })}
                                                    className={`${inputClass} ${errors.energyAdjust && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                    thousandSeparator={true}
                                                    decimalScale={4}
                                                    fixedDecimalScale={true}
                                                    allowNegative={false}
                                                    displayType="input"
                                                    onValueChange={(values) => {
                                                        const { value } = values;

                                                        const energyAdjust = value !== "" ? Number(value) : null
                                                        const heatingValue = watch("heatingValue") !== "" ? Number(watch("heatingValue")) : null

                                                        if(heatingValue !== null && energyAdjust !== null){
                                                            // setValue("volumeAdjust", energyAdjust / heatingValue); // https://app.clickup.com/t/9018502823/86eujrgtn
                                                            setValue("volumeAdjust", roundDecimal((energyAdjust / heatingValue), 6));

                                                            // setValue("volumeAdjust", heatingValue * energyAdjust);
                                                        }else{
                                                            setValue("volumeAdjust", "");
                                                        }

                                                        setValue("energyAdjust", value, { shouldValidate: true, shouldDirty: true });
                                                    }}
                                                />
                                                {errors.energyAdjust && (<p className="text-red-500 text-sm">{`Enter Energy Adjustment (MMBTU)`}</p>)}
                                            </div>



                                            <div>
                                                <label
                                                    htmlFor="energyAdjustRate_mmbtuh"
                                                    className="block mb-2 text-sm font-light"
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {`Energy Flow Rate Adjustment (MMBTU/H)`}
                                                </label>
                                                <NumericFormat
                                                    id="energyAdjustRate_mmbtuh"
                                                    placeholder="0.0000"
                                                    value={watch("energyAdjustRate_mmbtuh")}
                                                    readOnly={isReadOnly}
                                                    {...register("energyAdjustRate_mmbtuh", { required: "Enter Energy Flow Rate Adjustment (MMBTU/H)" })}
                                                    className={`${inputClass} ${errors.energyAdjustRate_mmbtuh && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                    thousandSeparator={true}
                                                    decimalScale={4}
                                                    fixedDecimalScale={true}
                                                    allowNegative={false}
                                                    displayType="input"
                                                    onValueChange={(values) => {
                                                        const { value } = values;
                                                        
                                                        const energyAdjustRate_mmbtuh = value !== "" ? Number(value) : null
                                                        const heatingValue = watch("heatingValue") !== "" ? Number(watch("heatingValue")) : null

                                                        if(heatingValue !== null && energyAdjustRate_mmbtuh !== null){
                                                            // setValue("volumeAdjustRate_mmscfh", energyAdjustRate_mmbtuh / heatingValue); // https://app.clickup.com/t/9018502823/86eujrgtn
                                                            setValue("volumeAdjustRate_mmscfh", roundDecimal((energyAdjustRate_mmbtuh / heatingValue), 6));
                                                            
                                                            // setValue("volumeAdjustRate_mmscfh", heatingValue * energyAdjustRate_mmbtuh);
                                                        }else{
                                                            setValue("volumeAdjustRate_mmscfh", "");
                                                        }
                                                        

                                                        setValue("energyAdjustRate_mmbtuh", value, { shouldValidate: true, shouldDirty: true });
                                                    }}
                                                />
                                                {errors.energyAdjustRate_mmbtuh && (<p className="text-red-500 text-sm">{`Enter Energy Flow Rate Adjustment (MMBTU/H)`}</p>)}
                                            </div>


                                            <div>
                                                <label
                                                    htmlFor="energyAdjustRate_mmbtud"
                                                    className="block mb-2 text-sm font-light"
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {`Energy Flow Rate Adjustment (MMBTU/D)`}
                                                </label>
                                                <NumericFormat
                                                    id="energyAdjustRate_mmbtud"
                                                    placeholder="0.0000"
                                                    value={watch("energyAdjustRate_mmbtud")}
                                                    readOnly={isReadOnly}
                                                    {...register("energyAdjustRate_mmbtud", { required: "Enter Energy Flow Rate Adjustment (MMBTU/D)" })}
                                                    className={`${inputClass} ${errors.energyAdjustRate_mmbtud && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                    thousandSeparator={true}
                                                    decimalScale={4}
                                                    fixedDecimalScale={true}
                                                    allowNegative={false}
                                                    displayType="input"
                                                    onValueChange={(values) => {
                                                        const { value } = values;

                                                        const energyAdjustRate_mmbtud = value !== "" ? Number(value) : null
                                                        const heatingValue = watch("heatingValue") !== "" ? Number(watch("heatingValue")) : null

                                                        if(heatingValue !== null && energyAdjustRate_mmbtud !== null){
                                                            // setValue("volumeAdjustRate_mmscfd", energyAdjustRate_mmbtud / heatingValue); // https://app.clickup.com/t/9018502823/86eujrgtn
                                                            setValue("volumeAdjustRate_mmscfd", roundDecimal((energyAdjustRate_mmbtud / heatingValue), 6));
                                                        }else{
                                                            setValue("volumeAdjustRate_mmscfd", "");
                                                        }

                                                        setValue("energyAdjustRate_mmbtud", value, { shouldValidate: true, shouldDirty: true });
                                                    }}
                                                />
                                                {errors.energyAdjustRate_mmbtud && (<p className="text-red-500 text-sm">{`Enter Energy Flow Rate Adjustment (MMBTU/D)`}</p>)}
                                            </div>


                                            <div>
                                                <label
                                                    htmlFor="volumeAdjust"
                                                    className="block mb-2 text-sm font-light"
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {/* {`Volume Adjustment (MMBTU)`} */}
                                                    {`Volume Adjustment (MMSCF)`}
                                                </label>
                                                <NumericFormat
                                                    id="volumeAdjust"
                                                    placeholder="0.000000"
                                                    value={watch("volumeAdjust")}
                                                    readOnly={isReadOnly || mode === "edit"}
                                                    // {...register("volumeAdjust", { required: "Enter Volume Adjustment (MMBTU)" })}
                                                    {...register("volumeAdjust", { required: "Enter Volume Adjustment (MMSCF)" })}
                                                    className={`${inputClass} ${errors.volumeAdjust && "border-red-500"}  ${isReadOnly || mode === "edit" && '!bg-[#EFECEC]'} text-right`}
                                                    thousandSeparator={true}
                                                    // decimalScale={4}
                                                    decimalScale={6} // ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w 
                                                    fixedDecimalScale={true}
                                                    allowNegative={true}
                                                    displayType="input"
                                                    onValueChange={(values) => {
                                                        const { value } = values;
                                                        setValue("volumeAdjust", value, { shouldValidate: true, shouldDirty: true });
                                                    }}
                                                />
                                                {errors.volumeAdjust && (<p className="text-red-500 text-sm">{`Enter Volume Adjustment (MMBTU)`}</p>)}
                                            </div>


                                            <div>
                                                <label
                                                    htmlFor="volumeAdjustRate_mmscfh"
                                                    className="block mb-2 text-sm font-light"
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {`Volume Flow Rate Adjustment (MMSCF/H)`}
                                                </label>
                                                <NumericFormat
                                                    id="volumeAdjustRate_mmscfh"
                                                    placeholder="0.000000"
                                                    value={watch("volumeAdjustRate_mmscfh")}
                                                    readOnly={isReadOnly || mode === "edit"}
                                                    {...register("volumeAdjustRate_mmscfh", { required: "Enter Volume Flow Rate Adjustment (MMSCF/H)" })}
                                                    className={`${inputClass} ${errors.volumeAdjustRate_mmscfh && "border-red-500"}  ${isReadOnly || mode === "edit" && '!bg-[#EFECEC]'} text-right`}
                                                    thousandSeparator={true}
                                                    // decimalScale={4}
                                                    decimalScale={6} // ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w 
                                                    fixedDecimalScale={true}
                                                    allowNegative={true}
                                                    displayType="input"
                                                    onValueChange={(values) => {
                                                        const { value } = values;
                                                        setValue("volumeAdjustRate_mmscfh", value, { shouldValidate: true, shouldDirty: true });
                                                    }}
                                                />
                                                {errors.volumeAdjustRate_mmscfh && (<p className="text-red-500 text-sm">{`Enter Volume Flow Rate Adjustment (MMSCF/H)`}</p>)}
                                            </div>


                                            <div>
                                                <label
                                                    htmlFor="volumeAdjustRate_mmscfd"
                                                    className="block mb-2 text-sm font-light"
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {`Volume Flow Rate Adjustment (MMSCFD)`}
                                                </label>
                                                <NumericFormat
                                                    id="volumeAdjustRate_mmscfd"
                                                    placeholder="0.000000"
                                                    value={watch("volumeAdjustRate_mmscfd")}
                                                    readOnly={isReadOnly || mode === "edit"}
                                                    {...register("volumeAdjustRate_mmscfd", { required: "Enter Volume Flow Rate Adjustment (MMSCFD)" })}
                                                    className={`${inputClass} ${errors.volumeAdjustRate_mmscfd && "border-red-500"}  ${isReadOnly || mode === "edit" && '!bg-[#EFECEC]'} text-right`}
                                                    thousandSeparator={true}
                                                    // decimalScale={4}
                                                    decimalScale={6} // ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w 
                                                    fixedDecimalScale={true}
                                                    allowNegative={true}
                                                    displayType="input"
                                                    onValueChange={(values) => {
                                                        const { value } = values;
                                                        setValue("volumeAdjustRate_mmscfd", value, { shouldValidate: true, shouldDirty: true });
                                                    }}
                                                />
                                                {errors.volumeAdjustRate_mmscfd && (<p className="text-red-500 text-sm">{`Enter Volume Flow Rate Adjustment (MMSCFD)`}</p>)}
                                            </div>


                                            <div>
                                                <label
                                                    htmlFor="resolveHour"
                                                    className="block mb-2 text-sm font-light"
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {`Resolved Time (Hr.)`}
                                                </label>
                                                <NumericFormat
                                                    id="resolveHour"
                                                    placeholder="0.0000"
                                                    value={watch("resolveHour")}
                                                    readOnly={isReadOnly}
                                                    {...register("resolveHour", { required: "Enter Resolved Time (Hr.)" })}
                                                    className={`${inputClass} ${errors.resolveHour && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                    thousandSeparator={true}
                                                    decimalScale={0}
                                                    fixedDecimalScale={false}
                                                    allowNegative={false}
                                                    displayType="input"
                                                    onValueChange={(values) => {
                                                        const { value } = values;
                                                        setValue("resolveHour", value, { shouldValidate: true, shouldDirty: true });
                                                    }}
                                                />
                                                {errors.resolveHour && (<p className="text-red-500 text-sm">{`Enter Resolved Time (Hr.)`}</p>)}
                                            </div>


                                            <div>
                                                <label
                                                    htmlFor="heatingValue"
                                                    className="block mb-2 text-sm font-light"
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {`HV (BTU/SCF)`}
                                                </label>
                                                <NumericFormat
                                                    id="heatingValue"
                                                    placeholder="0.0000"
                                                    value={watch("heatingValue")}
                                                    // readOnly={isReadOnly || mode === "edit"}
                                                    readOnly={isReadOnly}
                                                    {...register("heatingValue", { required: "Enter HV (BTU/SCF)" })}
                                                    className={`${inputClass} ${errors.heatingValue && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                    thousandSeparator={true}
                                                    decimalScale={3}
                                                    fixedDecimalScale={false}
                                                    allowNegative={false}
                                                    displayType="input"
                                                    onValueChange={(values) => {
                                                        const { value } = values;
                                                        const heatingValue = value !== "" ? Number(value) : null

                                                        const energyAdjust = watch("energyAdjust") !== "" ? Number(watch("energyAdjust")) : null
                                                        if(heatingValue !== null && energyAdjust !== null){
                                                            // setValue("volumeAdjust", energyAdjust / heatingValue); // https://app.clickup.com/t/9018502823/86eujrgtn
                                                            setValue("volumeAdjust", roundDecimal((energyAdjust / heatingValue), 6));
                                                            
                                                            // setValue("volumeAdjust", heatingValue * energyAdjust);
                                                        }else{
                                                            setValue("volumeAdjust", "");
                                                        }

                                                        const energyAdjustRate_mmbtuh = watch("energyAdjustRate_mmbtuh") !== "" ? Number(watch("energyAdjustRate_mmbtuh")) : null
                                                        if(heatingValue !== null && energyAdjustRate_mmbtuh !== null){
                                                            // setValue("volumeAdjustRate_mmscfh", energyAdjustRate_mmbtuh / heatingValue); // https://app.clickup.com/t/9018502823/86eujrgtn
                                                            setValue("volumeAdjustRate_mmscfh", roundDecimal((energyAdjustRate_mmbtuh / heatingValue), 6));
                                                            // setValue("volumeAdjustRate_mmscfh", heatingValue * energyAdjustRate_mmbtuh);
                                                        }else{
                                                            setValue("volumeAdjustRate_mmscfh", "");
                                                        }
                                                        
                                                        const energyAdjustRate_mmbtud = watch("energyAdjustRate_mmbtud") !== "" ? Number(watch("energyAdjustRate_mmbtud")) : null
                                                        if(heatingValue !== null && energyAdjustRate_mmbtud !== null){
                                                            // setValue("volumeAdjustRate_mmscfd", energyAdjustRate_mmbtud / heatingValue); // https://app.clickup.com/t/9018502823/86eujrgtn
                                                            setValue("volumeAdjustRate_mmscfd", roundDecimal((energyAdjustRate_mmbtud / heatingValue), 6));
                                                            // setValue("volumeAdjustRate_mmscfd", heatingValue * energyAdjustRate_mmbtud);
                                                        }else{
                                                            setValue("volumeAdjustRate_mmscfd", "");
                                                        }

                                                        setValue("heatingValue", value, { shouldValidate: true, shouldDirty: true });
                                                    }}
                                                />
                                                {errors.heatingValue && (<p className="text-red-500 text-sm">{`Enter HV (BTU/SCF)`}</p>)}
                                            </div>




                                        </div>

                                        <div className="flex justify-end pt-6">
                                            {
                                                mode === 'view' ?
                                                    <button type="button" onClick={handleClose} className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
                                                        {`Close`}
                                                    </button>
                                                    :
                                                    <button type="button" onClick={handleClose} className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500">
                                                        {`Cancel`}
                                                    </button>
                                            }

                                            {
                                                mode !== 'view' && (
                                                    <button
                                                        type="submit"
                                                        className={`w-[167px] font-light py-2 rounded-lg focus:outline-none ${mode === 'period' && !isEdited ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#00ADEF] hover:bg-blue-600 focus:bg-blue-600 text-white'}`}
                                                        disabled={mode === 'period' && !isEdited}
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