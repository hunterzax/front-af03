import React from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { formatFormDate, formatWatchFormDate } from "@/utils/generalFormatter";
import DatePickaForm from "@/components/library/dateRang/dateSelectForm";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import SelectFormProps from "@/components/other/selectProps";
import ModalConfirmSave from "@/components/other/modalConfirmSave";
import Spinloading from "@/components/other/spinLoading";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Bangkok");

type FormExampleProps = {
    mode?: "create" | "edit" | "view";
    data?: Partial<any>;
    open: boolean;
    dataShipper: any
    dataHvType: any
    dataHvMeter: any
    onClose: () => void;
    onSubmit: SubmitHandler<any>;
    setResetForm: (reset: () => void) => void;
    dataHvConcept?: any
    dataTypeMC?: any
    dataZone?: any[]
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode = "create",
    data = {},
    dataShipper,
    dataHvType,
    dataHvMeter,
    open,
    onClose,
    onSubmit,
    setResetForm,
    dataHvConcept,
    dataTypeMC,
    dataZone,
}) => {
    const { control, register, handleSubmit, setValue, reset, resetField, formState: { errors }, watch, setError, clearErrors } = useForm<any>({ defaultValues: data });

    const labelClass = "block mb-2 text-sm font-light";
    const textErrorClass = "text-red-500 text-sm";
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [filteredDataHvMeter, setFilteredDataHvMeter] = useState<any[]>([]);
    const [filteredDataHvConcept, setFilteredDataHvConcept] = useState<any[]>([]);

    // const isReadOnly = mode === "view";
    // const isReadOnly = mode === "view" || (data?.start_date && new Date(data?.start_date) < new Date());
    const isReadOnly = mode === "view" || (data?.start_date ? dayjs(data.start_date).tz("Asia/Bangkok").isBefore(dayjs().tz("Asia/Bangkok"), 'day') : false); // https://app.clickup.com/t/86eujrg8d Edit : สามารถให้ Edit วันปัจจุบันได้ด้วย

    const startDate = watch("start_date");
    const formattedStartDate = formatWatchFormDate(startDate);

    {/* Confirm Save */ }
    const [tk, settk] = useState<boolean>(true);
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()
    const [key, setKey] = useState(0);

    useEffect(() => {
        if (!data) return; // ถ้าไม่มี data ไม่ต้องทำอะไร
        // setKey((prevKey) => prevKey + 1);
        
        if (mode === "create") {
            // setValue("start_date", null);
            setIsLoading(false)
        }

        if (mode === "edit" || mode === "view") {
            setIsLoading(true);

            const formattedStartDate: any = formatFormDate(data?.start_date);

            setValue("hv_type_id", data?.hv_type_id || "");
            setValue("group_id", data?.group_id || "");
            setValue("meter_concept_type", data?.meter_concept_type_id || 1);
            setValue("meter_point", data?.metering_point_id || "");
            setValue("concept_point", data?.concept_point_id || "");
            setValue("start_date", formattedStartDate);

            setTimeout(() => {
                if (data) { setIsLoading(false); }
            }, 300);
        }
    }, [data, mode]);

    useEffect(() => {
        if (dataHvMeter) {
            if(watch('zone')) {
                setFilteredDataHvMeter(dataHvMeter.filter((item: any) => item.zone?.name?.toLowerCase() === watch('zone').toLowerCase()))
            }
            else{
                setFilteredDataHvMeter(dataHvMeter)
            }
        }
    }, [dataHvMeter, watch('zone')]);

    useEffect(() => {
        if (dataHvConcept) {
            if(watch('zone')) {
                setFilteredDataHvConcept(dataHvConcept.filter((item: any) => item.concept_point?.toLowerCase()?.includes(watch('zone').toLowerCase())))
            }
            else{
                setFilteredDataHvConcept(dataHvConcept)
            }
        }
    }, [dataHvConcept, watch('zone')]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    const handleClose = () => {
        setValue("start_date", null);
        onClose();
        clearErrors();
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
                                <div className="flex flex-col items-center justify-center gap-2 rounded-md ">
                                    <Spinloading spin={isLoading} rounded={20} />
                                    <form
                                        // onSubmit={handleSubmit(onSubmit)}
                                        onSubmit={handleSubmit(handleSaveConfirm)}
                                        className="bg-white p-8 rounded-[20px] shadow-lg max-w w-[750px]"
                                    >
                                        <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-5">{mode == "create" ? `New HV for Operation Flow and Instructed Flow` : mode == "edit" ? "Edit HV for Operation Flow and Instructed Flow" : "View HV for Operation Flow and Instructed Flow"}</h2>
                                        {/* <div className="grid grid-cols-[200px_400px_400px] gap-4"> */}
                                        <div className="grid grid-cols-2 gap-4">

                                            <div>
                                                <label
                                                    htmlFor="name"
                                                    className="block mb-2 text-sm font-light"
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {`Type`}
                                                </label>

                                                <SelectFormProps
                                                    id={'hv_type_id'}
                                                    register={register('hv_type_id', { required: true })}
                                                    disabled={isReadOnly}
                                                    valueWatch={watch('hv_type_id') || ''}
                                                    handleChange={(e) => {
                                                        setValue('hv_type_id', e.target.value)
                                                        if (errors?.hv_type_id) {
                                                            clearErrors('hv_type_id')
                                                        }
                                                        if(e.target.value != 2){
                                                            resetField('group_id')
                                                        }
                                                    }}
                                                    errors={errors?.hv_type_id}
                                                    errorsText={'Select Type'}
                                                    // options={option_type}
                                                    options={dataHvType}
                                                    optionsKey={'id'}
                                                    optionsValue={'id'}
                                                    optionsText={'type'}
                                                    optionsResult={'type'}
                                                    placeholder={'Select Type'}
                                                    pathFilter={'type'}
                                                />
                                            </div>

                                            {
                                                watch('hv_type_id') == 2 ? <div>
                                                    <label
                                                        htmlFor="name"
                                                        className="block mb-2 text-sm font-light"
                                                    >
                                                        <span className="text-red-500">*</span>
                                                        {`Shipper`}
                                                    </label>

                                                    <SelectFormProps
                                                        id={'group_id'}
                                                        register={register('group_id', { required: true })}
                                                        disabled={isReadOnly}
                                                        valueWatch={watch('group_id') || ''}
                                                        handleChange={(e) => {
                                                            setValue('group_id', e.target.value)
                                                            if (errors?.group_id) {
                                                                clearErrors('group_id')
                                                            }
                                                        }}
                                                        errors={errors?.group_id}
                                                        errorsText={'Select Shipper'}
                                                        options={dataShipper}
                                                        optionsKey={'id'}
                                                        optionsValue={'id'}
                                                        optionsText={'name'}
                                                        optionsResult={'name'}
                                                        placeholder={'Select Shipper'}
                                                        pathFilter={'name'}
                                                    />
                                                </div>
                                                : <div></div>
                                            }

                                
                                            <div>
                                                <label
                                                    htmlFor="zone"
                                                    className="block mb-2 text-sm font-light"
                                                >
                                                    {`Zone`}
                                                </label>

                                                <SelectFormProps
                                                    id={'zone'}
                                                    register={register('zone', { required: true })}
                                                    disabled={isReadOnly}
                                                    valueWatch={watch('zone') || ''}
                                                    handleChange={(e) => {
                                                        setValue('zone', e.target.value)
                                                        resetField('meter_point')
                                                        resetField('concept_point')
                                                    }}
                                                    errors={errors?.zone}
                                                    errorsText={'Select Zone'}
                                                    options={dataZone}
                                                    optionsKey={'id'}
                                                    optionsValue={'name'}
                                                    optionsText={'name'}
                                                    optionsResult={'name'}
                                                    placeholder={'Select Zone'}
                                                    pathFilter={'name'}
                                                />
                                            </div>
                                          
                                            <div>
                                                <label
                                                    htmlFor="name"
                                                    className="block mb-2 text-sm font-light"
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {`Type Meter/Concept`}
                                                </label>

                                                <SelectFormProps
                                                    id={'meter_concept_type'}
                                                    register={register('meter_concept_type', { required: true })}
                                                    disabled={isReadOnly}
                                                    valueWatch={watch('meter_concept_type') || ''}
                                                    handleChange={(e) => {
                                                        setValue('meter_concept_type', e.target.value)
                                                        if (errors?.meter_concept_type) {
                                                            clearErrors('meter_concept_type')
                                                        }
                                                        if(e.target.value == 1){
                                                            resetField('concept_point')
                                                        }
                                                        if(e.target.value == 2){
                                                            resetField('meter_point')
                                                        }
                                                    }}
                                                    errors={errors?.meter_concept_type}
                                                    errorsText={'Select Type Meter/Concept'}
                                                    options={dataTypeMC}
                                                    optionsKey={'id'}
                                                    optionsValue={'id'}
                                                    optionsText={'name'}
                                                    optionsResult={'name'}
                                                    placeholder={'Select Type Meter/Concept'}
                                                    pathFilter={'name'}
                                                />
                                            </div>
                                            {
                                                watch('meter_concept_type') === 1 ?
                                                <div>
                                                    <label
                                                        htmlFor="name"
                                                        className="block mb-2 text-sm font-light"
                                                    >
                                                        <span className="text-red-500">*</span>
                                                        {`Meter Point (Entry)`}
                                                    </label>

                                                    <SelectFormProps
                                                        id={'meter_point'}
                                                        register={register('meter_point', { required: true })}
                                                        disabled={isReadOnly}
                                                        valueWatch={watch('meter_point') || ''}
                                                        handleChange={(e) => {
                                                            setValue('meter_point', e.target.value)
                                                            if (errors?.meter_point) {
                                                                clearErrors('meter_point')
                                                            }
                                                        }}
                                                        errors={errors?.meter_point}
                                                        errorsText={'Select Meter Point (Entry)'}
                                                        options={filteredDataHvMeter}
                                                        optionsKey={'id'}
                                                        optionsValue={'id'}
                                                        optionsText={'metered_point_name'}
                                                        optionsResult={'metered_point_name'}
                                                        placeholder={'Select Meter Point (Entry)'}
                                                        pathFilter={'metered_point_name'}
                                                    />
                                                </div>
                                                : watch('meter_concept_type') === 2 ? 
                                              <div>
                                                    <label
                                                        htmlFor="name"
                                                        className="block mb-2 text-sm font-light"
                                                    >
                                                        <span className="text-red-500">*</span>
                                                        {`Concept Point (Type Meter)`}
                                                    </label>

                                                    <SelectFormProps
                                                        id={'concept_point'}
                                                        register={register('concept_point', { required: true })}
                                                        disabled={isReadOnly}
                                                        valueWatch={watch('concept_point') || ''}
                                                        handleChange={(e) => {
                                                            setValue('concept_point', e.target.value)
                                                            if (errors?.concept_point) {
                                                                clearErrors('concept_point')
                                                            }
                                                        }}
                                                        errors={errors?.concept_point}
                                                        errorsText={'Select Concept Point (Type Meter)'}
                                                        options={filteredDataHvConcept}
                                                        optionsKey={'id'}
                                                        optionsValue={'id'}
                                                        optionsText={'concept_point'}
                                                        optionsResult={'concept_point'}
                                                        placeholder={'Select Meter Point (Entry)'}
                                                        pathFilter={'concept_point'}
                                                    />
                                                </div>
                                                : <></>

                                            }


                                            <div className="pb-2">
                                                <label className={labelClass}>
                                                    <span className="text-red-500">*</span>
                                                    {`Start Date`}
                                                </label>
                                                <DatePickaForm
                                                    key={"start" + key}
                                                    {...register('start_date', { required: "Select start date" })}
                                                    readOnly={isReadOnly}
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

                                            <div></div>

                                        </div>

                                        <div className="flex justify-end pt-6">
                                            {mode === "view" ? (
                                                <button
                                                    type="button"
                                                    onClick={handleClose}
                                                    className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                                >
                                                    {`Close`}
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={handleClose}
                                                    className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500"
                                                >
                                                    {`Cancel`}
                                                </button>
                                            )}

                                            {mode !== "view" && (
                                                <button
                                                    type="submit"
                                                    className="w-[167px] font-semibold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                                >
                                                    {mode === "create" ? "Add" : "Save"}
                                                </button>
                                            )}
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
