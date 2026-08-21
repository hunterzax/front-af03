import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { formatFormDate } from "@/utils/generalFormatter";
import { TextField } from '@mui/material';
import DatePickaForm from "@/components/library/dateRang/dateSelectForm";
import dayjs from "dayjs";
import ModalConfirmSave from "@/components/other/modalConfirmSave";
import { NumericFormat } from "react-number-format";
import SelectFormProps from "@/components/other/selectProps";

type FormExampleProps = {
    mode?: "create" | "edit" | "view" | "period";
    data?: Partial<any>;
    open: boolean;
    zoneMasterData: any;
    onClose: () => void;
    onSubmit: SubmitHandler<any>;
    setResetForm: (reset: () => void) => void;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode = "create",
    data = {},
    zoneMasterData = {},
    open,
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
        formState: { errors },
        watch,
    } = useForm<any>({
        defaultValues: data,
    });
     
    const labelClass = "block mb-2 text-[14px] font-light"
    const inputClass = "text-[14px] block md:w-full p-2 ps-5 focus:!ps-5 hover:!ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"
    const textErrorClass = "text-red-500 text-[14px]"

    {/* Confirm Save */ }
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()

    // const isReadOnly = mode === "view";
    const isReadOnly = mode === "view" || (data?.gas_day && new Date(data?.gas_day) < new Date()); // 180325 Edit : ข้อมูลที่ถึงวันที่ Start Date แล้วจะไม่สามารถแก้ไขข้อมูลอะไรได้ นอกจาก End Date https://app.clickup.com/t/86erw7ah5

    // const [areaEntry, setAreaEntry] = useState([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchAndSetData = async () => {
            if (mode === 'create') {
                setIsLoading(false);
            }
            if (mode === "edit" || mode === "view") {
                setIsLoading(true);
                const formattedStartDate: any = formatFormDate(data?.gas_day);
                setValue("gas_day", formattedStartDate);

                setValue("zone_id", data?.west ? "WEST" : "EAST")
                setValue("value_mmbtu", data?.west ? data?.west : data?.east)
                setValue("remark", data?.comment?.length > 0 ? data?.comment?.[0]?.remark : '')

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

    const handleClose = () => {
        onClose();

        setValue("gas_day", null);
        setValue("zone_id", null);
        setValue("value_mmbtu", null);
        setValue("remark", null);

        clearErrors();

        reset();
    };

    {/* Confirm Save */ }
    const handleSaveConfirm = async (data?: any) => {
         
        // setDataSubmit(data)
        // setModaConfirmSave(true)

        if (mode == 'create') {
            await onSubmit(data);
        } else {
            setDataSubmit(data)
            setModaConfirmSave(true)
        }
    }

    const zoneEastWest = [
        {
            id: 1,
            value: "EAST",
            name: "East"
        },
        {
            id: 2,
            value: "WEST",
            name: "West"
        }
    ]

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
                            <div className="flex inset-0 items-center justify-center  ">
                                <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-md">
                                    <form
                                        className="bg-white p-8 rounded-[20px] shadow-lg max-w w-[400px]"
                                        // onSubmit={handleSubmit(async (data) => { // clear state when submit
                                        //     setIsLoading(true);
                                        //     setTimeout(async () => {
                                        //         await onSubmit(data);
                                        //     }, 100);
                                        // })}
                                        onSubmit={handleSubmit(handleSaveConfirm)}
                                    >
                                        <h2 className="text-xl font-bold text-[#00ADEF] pb-2">
                                            {mode === "create" ? (
                                                <>
                                                    {`New Intraday Acc. Imbalance`} <br /> {`Inventory Adjust`}
                                                </>
                                            ) : mode === "edit" ? (
                                                <>
                                                    {`Edit Intraday Acc. Imbalance`} <br /> {`Inventory Adjust`}
                                                </>
                                            ) : (
                                                <>
                                                    {`View Intraday Acc. Imbalance`} <br /> {`Inventory Adjust`}
                                                </>
                                            )}
                                        </h2>

                                        <div className="grid grid-cols-1 gap-2 pt-4">
                                            <div>
                                                <label className={labelClass}>
                                                    <span className="text-red-500">*</span>
                                                    {`Gas Day`}
                                                </label>
                                                <DatePickaForm
                                                    {...register('gas_day', { required: "Select Gas Day" })}
                                                    readOnly={isReadOnly}
                                                    placeHolder="Select Gas Day"
                                                    mode={mode}
                                                    valueShow={watch("gas_day") && dayjs(watch("gas_day")).format("DD/MM/YYYY")}
                                                    // min={formattedStartDate || undefined}
                                                    min={new Date()}
                                                    // maxNormalForm={watch('end_date') && watch('end_date')} // ไม่ให้ gas_day เกิน end_date
                                                    allowClear
                                                    isError={errors.gas_day && !watch("gas_day") ? true : false}
                                                    onChange={(e: any) => { setValue('gas_day', formatFormDate(e)), e == undefined && setValue('gas_day', null, { shouldValidate: true, shouldDirty: true }); }}
                                                />
                                                {errors.gas_day && !watch("gas_day") && <p className={`${textErrorClass}`}>{'Select Gas Day'}</p>}
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="zone_id"
                                                    className={labelClass}
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
                                                        setValue("zone_id", e.target.value);
                                                        if (errors?.zone_id) { clearErrors('zone_id') }
                                                    }}
                                                    errors={errors?.zone_id}
                                                    errorsText={'Select Zone'}
                                                    options={zoneEastWest}
                                                    optionsKey={'id'}
                                                    optionsValue={'value'}
                                                    optionsText={'name'}
                                                    optionsResult={'name'}
                                                    placeholder={'Select Zone'}
                                                    pathFilter={'name'}
                                                />

                                            </div>

                                            <div >
                                                <label
                                                    htmlFor="value_mmbtu"
                                                    className="block mb-2 text-sm font-light"
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {`Value (MMBTU)`}
                                                </label>
                                                <NumericFormat
                                                    id="value_mmbtu"
                                                    placeholder="0.0000"
                                                    value={watch("value_mmbtu")}
                                                    readOnly={isReadOnly}
                                                    {...register("value_mmbtu", { required: "Enter Value" })}
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
                                                {errors.value_mmbtu && (<p className="text-red-500 text-sm">{`Enter Value`}</p>)}
                                            </div>

                                            <div >
                                                <label htmlFor="comment" className={labelClass}>
                                                    {`Comment`}
                                                </label>
                                                <TextField
                                                    {...register('remark')}
                                                    value={watch('remark') || ''}
                                                    label=""
                                                    multiline
                                                    disabled={isReadOnly}
                                                    onChange={(e) => {
                                                        if (e.target.value.length <= 255) {
                                                            setValue('remark', e.target.value);
                                                        }
                                                    }}
                                                    placeholder='Enter comment'
                                                    rows={2}
                                                    sx={{
                                                        '.MuiOutlinedInput-root': {
                                                            borderRadius: '8px',
                                                        },
                                                        '.MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#DFE4EA',
                                                        },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#d2d4d8',
                                                        },
                                                        '&.Mui-focused .MuiOutlinedI nput-notchedOutline': {
                                                            borderColor: '#d2d4d8',
                                                        },
                                                        "& .MuiOutlinedInput-input::placeholder": {
                                                            fontSize: "14px",
                                                        },
                                                    }}
                                                    fullWidth
                                                    className={`rounded-lg ${errors.description && "border-red-500"} ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                />
                                                <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                                    <span className="text-[13px]">{watch('remark')?.length || 0} / 255</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-6">
                                            {mode === "view" ? (
                                                <button
                                                    type="button"
                                                    // onClick={onClose}
                                                    onClick={() => handleClose()}
                                                    className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                                >
                                                    {`Close`}
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    // onClick={onClose}
                                                    onClick={() => handleClose()}
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
                    </div >
                </div >
            </Dialog >

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

                        setTimeout(async () => {
                            handleClose();
                        }, 1000);
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