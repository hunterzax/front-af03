import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { formatFormDate } from "@/utils/generalFormatter";
import DatePickaForm from "@/components/library/dateRang/dateSelectForm";
import dayjs from "dayjs";
import { NumericFormat } from "react-number-format";
import BtnGeneral from "@/components/other/btnGeneral";
import { getService } from "@/utils/postService";
import SelectFormProps from "@/components/other/selectProps";
import Spinloading from "@/components/other/spinLoading";

type FormExampleProps = {
    mode?: "create" | "edit" | "view" | "period";
    data?: Partial<any>;
    open: boolean;
    zoneMaster?: any;
    onClose: () => void;
    onSubmit: SubmitHandler<any>;
    setResetForm: (reset: () => void) => void;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode,
    data = {},
    open,
    zoneMaster,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const { control, register, handleSubmit, setValue, reset, clearErrors, resetField, formState: { errors }, watch, } = useForm<any>({ defaultValues: data, });

    const labelClass = "block mb-2 text-sm font-light";
    const inputClass = "text-sm block md:w-full p-2 ps-5 pe-10 h-[46px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]";
    const textErrorClass = "text-red-500 text-sm";

    const [dataZone, setDataZone] = useState<any>([]);
    const [selectedDateData, setSelectedDateData] = useState<any>(undefined);
    const [isLoading, setIsLoading] = useState<any>(undefined);

    // const isReadOnly = (mode === "view" || mode === 'edit');
    const isReadOnly = (mode === "view");

    useEffect(() => {
        const fetchAndSetData = async () => {
            setValue('gas_day', dayjs().add(1, 'day').format("YYYY-MM-DD"))
        }
        fetchAndSetData();
    }, [data, mode, setValue]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    useEffect(() => {
        const uniqueZones = Object.values(
            zoneMaster?.data?.reduce((acc: any, zone: any) => {
                const name = zone.name;
                if (!acc[name] || dayjs(zone.update_date).isAfter(dayjs(acc[name].update_date))) {
                    acc[name] = zone;
                }
                return acc;
            }, {})
        );
        setDataZone(uniqueZones)

    }, [zoneMaster?.data])

    useEffect(() => {
        const zoneId = watch('zone');
        if (!zoneId || !selectedDateData) return;

        (async () => {
            try {
                const zoneName = zoneMaster?.data?.find((zone: any) => zone.id == zoneId)?.name

                const targetData = selectedDateData.find((item: any) => item.zone == zoneName)
                if(targetData){
                    setValue('last_user_park', targetData.lastUserParkValue ?? '');
                    setValue('park_default_val', targetData?.parkDefault?.value ?? '');
                }
                else{
                    setValue('last_user_park', '');
                    setValue('park_default_val', '');
                }

            } catch (err) {
                // fetch zone error
            }
        })();
    }, [watch('zone')]);

    useEffect(() => {
        if(watch('gas_day')){
            setIsLoading(true);
            getService(`/master/parking-allocation?gas_day=${watch('gas_day')}`).then(response => {
                if(Array.isArray(response)){
                    setSelectedDateData(response);
                    const zoneId = watch('zone');
                    if(zoneId){
                        const zoneName = zoneMaster?.data?.find((zone: any) => zone.id == zoneId)?.name
                        const targetData = response.find((item: any) => item.zone == zoneName)
                        if(targetData){
                            setValue('last_user_park', targetData?.lastUserParkValue);
                            setValue('park_default_val', targetData?.parkDefault?.value);
                        }
                    }
                }
                setIsLoading(false);
            });
        }
    }, [watch('gas_day')])

    const findParkDefault = async () => {
        if (watch('park_default_val') || watch('last_user_park')) {
            const calc = (watch('park_default_val') ?? 0) - (watch('last_user_park') ?? 0)
            setValue('value_mmbtu', calc >= 0 ? calc : 0 )
        }
    }

    const handleClose = () => {
        onClose();

        setTimeout(() => {
            setValue('gas_day', null)
            setValue('zone', null)
            setValue('value_mmbtu', null)
            setValue('last_user_park', null)
            setValue('park_default_val', null)
            reset();
        }, 500);
    };

    return (
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
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <DialogPanel
                        transition
                        className="relative w-full max-w-xl bg-white transform transition-all rounded-[20px] text-left shadow-lg data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:w-[90%] lg:max-w-3xl"
                    >
                        <Spinloading spin={isLoading} rounded={20} />
                        <div className="flex flex-col items-center justify-center p-4 gap-4">
                            <form
                                // onSubmit={(data:any) => handleFormSubmit(data)}
                                onSubmit={handleSubmit(async (data) => { // clear state when submit
                                    onSubmit(data);
                                    // setIsLoading(true);
                                    setTimeout(async () => {
                                        handleClose();
                                    }, 1000);
                                })}
                                className="bg-white p-6  w-full"
                            >
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#00ADEF] mb-4">
                                    {/* {mode === "create" ? `New Template for Shipper` : mode === "edit" ? "Edit Template for Shipper" : mode === "period" ? "New Period" : "View Template for Shipper"} */}
                                    {`Park Allocated`}
                                </h2>

                                <div className={`grid gap-4 grid-cols-2`}>
                                    {/* GAS DAY */}
                                    <div>
                                        <label className={labelClass}>
                                            <span className="text-red-500">*</span>
                                            {`Gas Day`}
                                        </label>
                                        <DatePickaForm
                                            {...register('gas_day')}
                                            readOnly={false}
                                            placeHolder="Select Gas Day"
                                            // mode={mode}
                                            mode={'edit'}
                                            valueShow={watch("gas_day") && dayjs(watch("gas_day")).format("DD/MM/YYYY")}
                                            // min={formattedStartDate || undefined}
                                            // min={new Date()}
                                            min={dayjs().startOf('day').add(1, 'day').toDate()}
                                            // maxNormalForm={watch('end_date') && watch('end_date')} // ไม่ให้ gas_day เกิน end_date
                                            allowClear
                                            isError={errors.gas_day && !watch("gas_day") ? true : false}
                                            onChange={(e: any) => { setValue('gas_day', formatFormDate(e)), e == undefined && setValue('gas_day', null, { shouldValidate: true, shouldDirty: true }); }}
                                        />
                                        {errors.gas_day && !watch("gas_day") && <p className={`${textErrorClass}`}>{'Select Gas Day'}</p>}
                                    </div>


                                    {/* ZONE */}
                                    <div>
                                        <label htmlFor="zone" className="block mb-2 text-sm font-light">
                                            <span className="text-red-500">*</span>
                                            {`Zone`}
                                        </label>

                                        <SelectFormProps
                                            id={'zone'}
                                            register={register("zone", { required: "Select Zone" })}
                                            disabled={isReadOnly}
                                            valueWatch={watch("zone") || ""}
                                            handleChange={(e) => {
                                                setValue("zone", e.target.value);
                                                if (errors?.zone) { clearErrors('zone') }
                                            }}
                                            errors={errors?.zone}
                                            errorsText={'Select Zone'}
                                            // options={zoneMaster?.data}
                                            options={dataZone}
                                            optionsKey={'id'}
                                            optionsValue={'id'}
                                            optionsText={'name'}
                                            optionsResult={'name'}
                                            placeholder={'Select Zone'}
                                            pathFilter={'name'}
                                        />
                                    </div>

                                    {/* Total Parking Value (MMBTU/D) */}
                                    <div >
                                        <label
                                            htmlFor="value_mmbtu"
                                            className="block mb-2 text-sm font-light"
                                        >
                                            <span className="text-red-500">*</span>
                                            {`Available Parking Value (MMBTU)`}
                                        </label>
                                        <NumericFormat
                                            id="value_mmbtu"
                                            placeholder="0.0000"
                                            value={watch("value_mmbtu")}
                                            readOnly={isReadOnly}
                                            {...register("value_mmbtu", { required: "Enter Total Parking Value (MMBTU)" })}
                                            className={`${inputClass} ${errors.value_mmbtu && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                            thousandSeparator={true}
                                            decimalScale={4}
                                            fixedDecimalScale={true}
                                            allowNegative={false}
                                            displayType="input"
                                            onValueChange={(values) => {
                                                const { value } = values;
                                                setValue("value_mmbtu", value, { shouldValidate: true, shouldDirty: true });
                                            }}
                                        />
                                        {errors.value_mmbtu && (<p className="text-red-500 text-sm">{`Enter Total Parking Value (MMBTU)`}</p>)}
                                    </div>

                                    <div></div>

                                    {/* Last User Park Value (MMBTU/D) */}
                                    <div >
                                        <label
                                            htmlFor="value_mmbtu"
                                            className="block mb-2 text-sm font-light"
                                        >
                                            {`EOD Value (D-1)`}
                                        </label>
                                        <NumericFormat
                                            id="last_user_park"
                                            placeholder="0.0000"
                                            value={watch("last_user_park")}
                                            {...register("last_user_park")}
                                            readOnly={true}
                                            className={`${inputClass} !bg-[#EFECEC] text-right`}
                                            thousandSeparator={true}
                                            decimalScale={4}
                                            fixedDecimalScale={true}
                                            allowNegative={false}
                                            displayType="input"
                                            onValueChange={(values) => {
                                                const { value } = values;
                                                setValue("last_user_park", value, { shouldValidate: true, shouldDirty: true });
                                            }}
                                        />
                                        {errors.last_user_park && (<p className="text-red-500 text-sm">{`Enter Value`}</p>)}
                                    </div>

                                    {/* Park Default Value (MMBTU/D) */}
                                    <div >
                                        <label
                                            htmlFor="value_mmbtu"
                                            className="block mb-2 text-sm font-light"
                                        >
                                            {`Maximum Park Value (MMBTU)`}
                                        </label>
                                        <NumericFormat
                                            id="park_default_val"
                                            placeholder="0.0000"
                                            // value={watch("park_default_val")}
                                            value={watch("park_default_val")}
                                            {...register("park_default_val")}
                                            readOnly={true}
                                            className={`${inputClass} !bg-[#EFECEC] text-right`}
                                            thousandSeparator={true}
                                            decimalScale={4}
                                            fixedDecimalScale={true}
                                            allowNegative={false}
                                            displayType="input"
                                            onValueChange={(values) => {
                                                const { value } = values;
                                                setValue("park_default_val", value, { shouldValidate: true, shouldDirty: true });
                                            }}
                                        />
                                        {errors.park_default_val && (<p className="text-red-500 text-sm">{`Enter Value`}</p>)}
                                    </div>
                                </div>

                                {/* <div className="flex justify-end gap-4 pt-6 flex-wrap">
                                    <BtnGeneral
                                        textRender={"Default Value Calculation"}
                                        iconNoRender={true}
                                        bgcolor={"#24AB6A"}
                                        // generalFunc={openCreateForm}
                                        can_create={true}
                                        customWidth={true}
                                    />

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
                                            className="py-2 px-6 h-[44px] font-semibold tracking-wide rounded-lg bg-[#00ADEF] text-white hover:bg-blue-600"
                                        >
                                            {mode === "create" ? "Allocate" : "Save"}
                                        </button>
                                    )}
                                </div> */}

                                <div className="flex justify-between items-center flex-wrap pt-6">
                                    <div>

                                        {/* master/parking-allocation/park-default?zone_id=30 */}
                                        {/* เอา zone id ยิง ตอนกดปุ่มนี่ */}
                                        <BtnGeneral
                                            textRender={"Default Value Calculation"}
                                            iconNoRender={true}
                                            bgcolor={"#24AB6A"}
                                            disable={watch('zone') ? false : true}
                                            can_create={true}
                                            customWidth={true}
                                            generalFunc={findParkDefault}
                                        />
                                    </div>

                                    <div className="flex gap-4">
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
                                                className="py-2 px-6 h-[44px] font-semibold tracking-wide rounded-lg bg-[#00ADEF] text-white hover:bg-blue-600"
                                            >
                                                {mode === "create" ? "Allocate" : "Save"}
                                            </button>
                                        )}
                                    </div>
                                </div>

                            </form>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
};

export default ModalAction;