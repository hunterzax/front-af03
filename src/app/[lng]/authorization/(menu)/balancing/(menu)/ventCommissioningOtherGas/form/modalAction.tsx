import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { TextField } from "@mui/material";
import Spinloading from "@/components/other/spinLoading";
import { formatFormDate, toDayjs } from "@/utils/generalFormatter";
import ModalConfirmSave from "@/components/other/modalConfirmSave";
import DatePickaForm from "@/components/library/dateRang/dateSelectForm";
import dayjs from "dayjs";
import { NumericFormat } from "react-number-format";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import SelectFormProps from "@/components/other/selectProps";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Bangkok");

type FormExampleProps = {
    mode?: "create" | "edit" | "view" | "period";
    data?: Partial<any>;
    open: boolean;
    userDT?: any;
    dataTable?: any;
    dataShipper?: any;
    closeBalanceData?: any;
    zoneMasterData: any;
    onClose: () => void;
    onSubmit: SubmitHandler<any>;
    setResetForm: (reset: () => void) => void;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode,
    data = {},
    dataTable = {},
    userDT,
    zoneMasterData = {},
    open,
    dataShipper,
    closeBalanceData,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const { control, register, handleSubmit, setValue, reset, clearErrors, resetField, formState: { errors }, watch, } = useForm<any>({ defaultValues: data, });

    const textFieldSx = {
        '.MuiOutlinedInput-root': {
            borderRadius: '8px',
            fontSize: "14px",
            color: '#464255 !important', // Disabled text color
        },
        '.MuiOutlinedInput-notchedOutline': {
            // borderColor: '#DFE4EA',
            borderColor: errors.remark && !watch('remark') ? '#FF0000' : '#DFE4EA',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: errors.remark && !watch("remark") ? "#FF0000" : '#DFE4EA !important',
        },
        '&.Mui-focused .MuiOutlinedI nput-notchedOutline': {
            borderColor: '#00ADEF',
        },
        '&.MuiInputBase-input::placeholder': {
            color: '#9CA3AF', // Placeholder color
            fontSize: '14px', // Placeholder font size
        },
        '& .Mui-disabled': {
            color: '#464255 !important', // Disabled text color
        },
        "& .MuiOutlinedInput-input::placeholder": {
            fontSize: "14px",
        },
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#00ADEF !important", // 👈 force black border on focus
            borderWidth: '1px', // 👈 Force border 1px on focus
        },
    }

    const labelClass = "block mb-2 text-sm font-light";
    const inputClass = "text-sm block md:w-full p-2 ps-5 pe-10 h-[46px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]";
    const textErrorClass = "text-red-500 text-sm";

    {/* Confirm Save */ }
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // const isReadOnly = (mode === "view" || mode === 'edit');
    const isReadOnly = (mode === "view");

    useEffect(() => {
        const fetchAndSetData = async () => {
            const getZone: any = zoneMasterData?.find((item: any) => item?.name == data?.zone?.name); //กรณีที่ zone ชื่อเหมือนกับตัวอื่น แต่ zonemaster filter มาผิดตัว ก็จะใช้ name เดียวกันได้

            if (mode === "edit") {
                setValue('gas_day', data?.gas_day)
                setValue("group_id", data?.group?.id);
                // setValue("zone_id", data?.zone?.id);
                setValue("zone_id", getZone?.id);
                setValue("vent_gas_value_mmbtud", data?.vent_gas_value_mmbtud);
                setValue("commissioning_gas_value_mmbtud", data?.commissioning_gas_value_mmbtud);
                setValue("other_gas_value_mmbtud", data?.other_gas_value_mmbtud);
                // setValue("remark", data?.vent_commissioning_other_gas_remark?.length > 0 ? data?.vent_commissioning_other_gas_remark?.[0]?.remark : '');
                setValue("remark", null);
            }

            if (mode === "view") {
                setValue("group_id", data?.group?.id || "");
                setValue('gas_day', data?.gas_day)
                setValue("group_id", data?.group?.id);
                setValue("zone_id", getZone?.id);
                setValue("vent_gas_value_mmbtud", data?.vent_gas_value_mmbtud);
                setValue("commissioning_gas_value_mmbtud", data?.commissioning_gas_value_mmbtud);
                setValue("other_gas_value_mmbtud", data?.other_gas_value_mmbtud);
                setValue("remark", data?.vent_commissioning_other_gas_remark?.length > 0 ? data?.vent_commissioning_other_gas_remark?.[0]?.remark : '');
            }

            setTimeout(() => {
                setIsLoading(false)
            }, 500);
        }
        fetchAndSetData();
    }, [data, mode, setValue]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    const handleClose = () => {
        onClose();
        // setSelectedValues([]);

        setTimeout(() => {
            setValue('gas_day', null)
            setValue("group_id", null);
            setValue("zone_id", null);
            setValue("vent_gas_value", null);
            setValue("commissioning_gas_value_mmbtud", null);
            setValue("other_gas_value_mmbtud", null);
            setValue("remark", null);

            reset();
        }, 500);
    };

    {/* Confirm Save */ }
    const handleSaveConfirm = async (data?: any) => {
        setIsLoading(true)
         
        if (mode == 'create') {
            await onSubmit(data);
        } else {
            setDataSubmit(data)
            setModaConfirmSave(true)
        }

        setTimeout(() => {
            setIsLoading(false)
        }, 500);
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
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <DialogPanel
                            transition
                            className="relative w-full max-w-xl bg-white transform transition-all rounded-[20px] text-left shadow-lg data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:w-[90%] lg:max-w-3xl"
                        >
                            <Spinloading spin={isLoading} rounded={20} />

                            <div className="flex flex-col items-center justify-center p-4 gap-4">
                                <form
                                    // onSubmit={handleSubmit(async (data) => { // clear state when submit
                                    //      
                                    //     onSubmit(data);
                                    //     // setIsLoading(true);
                                    //     setTimeout(async () => {
                                    //         handleClose();
                                    //     }, 1000);
                                    // })}
                                    onSubmit={handleSubmit(handleSaveConfirm)}
                                    className="bg-white p-6  w-full"
                                >
                                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#00ADEF] mb-4">
                                        {mode === "create" ? `New Vent/Commissioning/Other Gas` : mode === "edit" ? "Edit Vent/Commissioning/Other Gas" : mode === "period" ? "New Period" : "View Vent/Commissioning/Other Gas"}
                                    </h2>
                                    <div
                                        className={`grid gap-4 grid-cols-2`}
                                    >
                                        <div>
                                            <label className={labelClass}>
                                                <span className="text-red-500">*</span>
                                                {`Gas Day`}
                                            </label>
                                            {/* เลือกได้ today ย้อนไปถึง close balance */}
                                            <DatePickaForm
                                                {...register('gas_day', { required: "Select Gas Day" })}
                                                readOnly={isReadOnly || mode === 'edit'}
                                                placeHolder="Select Gas Day"
                                                mode={mode}
                                                valueShow={watch("gas_day") && dayjs(watch("gas_day")).format("DD/MM/YYYY")}
                                                min={closeBalanceData ? toDayjs(closeBalanceData.date_balance).add(1, 'month').startOf('month').tz('Asia/Bangkok').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ (z)') : new Date()}
                                                isToday={true}
                                                // maxNormalForm={watch('end_date') && watch('end_date')} // ไม่ให้ gas_day เกิน end_date
                                                allowClear
                                                isError={errors.gas_day && !watch("gas_day") ? true : false}
                                                onChange={(e: any) => { setValue('gas_day', formatFormDate(e)), e == undefined && setValue('gas_day', null, { shouldValidate: true, shouldDirty: true }); }}
                                            />
                                            {errors.gas_day && !watch("gas_day") && <p className={`${textErrorClass}`}>{'Select Gas Day'}</p>}
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="group_id"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span> {`Shipper Name`}
                                            </label>

                                            {/* New > กรณีที่ Shipper เข้ามา New ต้องเห็นเฉพาะชื่อตัวเอง lock ไว้เลย https://app.clickup.com/t/86eubtuff */}
                                            <SelectFormProps
                                                id={'group_id'}
                                                register={register("group_id", { required: "Select Shipper Name" })}
                                                disabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false || mode == 'view'}
                                                valueWatch={userDT?.account_manage?.[0]?.user_type_id == 3 ? userDT?.account_manage?.[0]?.group?.id : watch("group_id")}
                                                handleChange={(e) => {
                                                    setValue("group_id", e.target.value);
                                                    if (errors?.group_id) { clearErrors('group_id') }
                                                }}
                                                errors={errors?.group_id}
                                                errorsText={'Select Shipper Name'}
                                                options={dataShipper?.filter((item: any) => // เห็นแค่ชื่อตัวเอง
                                                    userDT?.account_manage?.[0]?.user_type_id == 3 ? item?.id === userDT?.account_manage?.[0]?.group?.id : true
                                                )}
                                                optionsKey={'id'}
                                                optionsValue={'id'}
                                                optionsText={'name'}
                                                optionsResult={'name'}
                                                placeholder={'Select Shipper Name'}
                                                pathFilter={'name'}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="zone_id"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Zone Name`}
                                            </label>

                                            <SelectFormProps
                                                id={'zone_id'}
                                                register={register("zone_id", { required: "Select Zone" })}
                                                disabled={isReadOnly || mode === 'edit'}
                                                valueWatch={watch("zone_id") || ""}
                                                handleChange={(e) => {
                                                    setValue("zone_id", e.target.value);
                                                    if (errors?.zone_id) { clearErrors('zone_id') }
                                                }}
                                                errors={errors?.zone_id}
                                                errorsText={'Select Zone'}
                                                options={zoneMasterData}
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
                                                htmlFor="vent_gas_value_mmbtud"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Vent Gas Value (MMBTU)`}
                                            </label>
                                            <NumericFormat
                                                id="vent_gas_value_mmbtud"
                                                placeholder="0.0000"
                                                value={watch("vent_gas_value_mmbtud")}
                                                readOnly={isReadOnly}
                                                {...register("vent_gas_value_mmbtud", { required: "Enter Vent Gas Value (MMBTU)" })}
                                                className={`${inputClass} ${errors.vent_gas_value_mmbtud && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                thousandSeparator={true}
                                                decimalScale={4}
                                                fixedDecimalScale={true}
                                                // allowNegative={false}
                                                allowNegative={true} // v2.0.132 New/Edit ค่าต้องสามารถใส่เป็นค่าติดลบได้ https://app.clickup.com/t/86ev5f703
                                                displayType="input"
                                                onValueChange={(values) => {
                                                    const { value } = values;
                                                    setValue("vent_gas_value_mmbtud", value, { shouldValidate: true, shouldDirty: true });
                                                }}
                                            />
                                            {errors.vent_gas_value_mmbtud && (<p className="text-red-500 text-sm">{`Enter Vent Gas Value (MMBTU)`}</p>)}
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="commissioning_gas_value_mmbtud"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Commissioning Gas Value (MMBTU)`}
                                            </label>
                                            <NumericFormat
                                                id="commissioning_gas_value_mmbtud"
                                                placeholder="0.0000"
                                                value={watch("commissioning_gas_value_mmbtud")}
                                                readOnly={isReadOnly}
                                                {...register("commissioning_gas_value_mmbtud", { required: "Enter Commissioning Gas Value (MMBTU)" })}
                                                className={`${inputClass} ${errors.commissioning_gas_value_mmbtud && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                thousandSeparator={true}
                                                decimalScale={4}
                                                fixedDecimalScale={true}
                                                // allowNegative={false}
                                                allowNegative={true} // v2.0.132 New/Edit ค่าต้องสามารถใส่เป็นค่าติดลบได้ https://app.clickup.com/t/86ev5f703
                                                displayType="input"
                                                onValueChange={(values) => {
                                                    const { value } = values;
                                                    setValue("commissioning_gas_value_mmbtud", value, { shouldValidate: true, shouldDirty: true });
                                                }}
                                            />
                                            {errors.commissioning_gas_value_mmbtud && (<p className="text-red-500 text-sm">{`Enter Commissioning Gas Value (MMBTU)`}</p>)}
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="other_gas_value_mmbtud"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Other Gas Value (MMBTU)`}
                                            </label>
                                            <NumericFormat
                                                id="other_gas_value_mmbtud"
                                                placeholder="0.0000"
                                                value={watch("other_gas_value_mmbtud")}
                                                readOnly={isReadOnly}
                                                {...register("other_gas_value_mmbtud", { required: "Enter Other Gas Value (MMBTU)" })}
                                                className={`${inputClass} ${errors.other_gas_value_mmbtud && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                thousandSeparator={true}
                                                decimalScale={4}
                                                fixedDecimalScale={true}
                                                // allowNegative={false}
                                                allowNegative={true} // v2.0.132 New/Edit ค่าต้องสามารถใส่เป็นค่าติดลบได้ https://app.clickup.com/t/86ev5f703
                                                displayType="input"
                                                onValueChange={(values) => {
                                                    const { value } = values;
                                                    setValue("other_gas_value_mmbtud", value, { shouldValidate: true, shouldDirty: true });
                                                }}
                                            />
                                            {errors.other_gas_value_mmbtud && (<p className="text-red-500 text-sm">{`Enter Other Gas Value (MMBTU)`}</p>)}
                                        </div>

                                        {/* Remark Field */}
                                        <div className="col-span-2">
                                            <label className={labelClass}>{`Comment`}</label> 
                                            {/* จาก Remarks เป็น Comment SHEET Sprint 4 NO.128 */}
                                            <TextField
                                                {...register("remark")}
                                                value={watch("remark") || ""}
                                                label=""
                                                multiline
                                                onChange={(e) => {
                                                    if (e.target.value.length <= 255) {
                                                        setValue("remark", e.target.value);
                                                    }
                                                }}
                                                placeholder="Enter Comment"
                                                disabled={isReadOnly}
                                                rows={2}
                                                sx={{
                                                    ...textFieldSx,
                                                    '.MuiOutlinedInput-notchedOutline': {
                                                        borderColor: errors.doc_4_input_incident && !watch('doc_4_input_incident') ? '#FF0000' : '#DFE4EA',
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: errors.doc_4_input_incident && !watch("doc_4_input_incident") ? "#FF0000" : '#DFE4EA !important',
                                                    },
                                                }}
                                                InputProps={{
                                                    style: {
                                                        color: isReadOnly ? "#464255" : "inherit", // 👈 Another enforcement for cross-browser support
                                                    },
                                                    disableUnderline: true,
                                                }}
                                                fullWidth
                                            />

                                            <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                                <span className="text-[13px]">
                                                    {watch("remark")?.length || 0} / 255
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <label
                                    htmlFor="r"
                                    className="block mb-2 text-sm font-light text-gray-500"
                                >
                                   {`When gas flows out of the system, input a negative value.`}
                                </label>



                                    <div className="flex justify-end gap-4 pt-6 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={() => handleClose()}
                                            className={`py-2 px-6 rounded-lg w-[150px] ${mode === "view" ? "bg-[#00ADEF] text-white hover:bg-blue-600" : "bg-slate-100 text-black hover:bg-rose-500"}`}
                                        >
                                            {mode === "view" ? "Close" : "Cancel"}
                                        </button>
                                        {mode !== "view" && (
                                            <button
                                                type="submit"
                                                className="py-2 px-6 rounded-lg bg-[#00ADEF] text-white hover:bg-blue-600 w-[157px] font-semibold"
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