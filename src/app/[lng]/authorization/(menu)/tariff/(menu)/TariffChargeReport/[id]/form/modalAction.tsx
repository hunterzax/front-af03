import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useEffect, useState } from "react";
import ModalConfirmSave from "@/components/other/modalConfirmSave";
import { NumericFormat } from "react-number-format";
import dayjs from "dayjs";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isSameOrAfter);

type FormExampleProps = {
    mode?: "create" | "edit" | "view" | "period";
    data?: Partial<any>;
    open: boolean;
    headData: any;
    viewDetailData?: any;
    onClose: () => void;
    onSubmit: SubmitHandler<any>;
    setResetForm: (reset: () => void) => void;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode = "create",
    data = {},
    open,
    headData,
    viewDetailData,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const { control, register, handleSubmit, setValue, reset, clearErrors, formState: { errors }, watch, } = useForm<any>({ defaultValues: data, });

    {/* Confirm Save */ }
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()
    const isTodayOrFuture = data?.gas_day && dayjs(data.gas_day).isSameOrAfter(dayjs(), 'day');
    // const isReadOnly = mode == 'create' ? false : mode === "view" || !isTodayOrFuture;
    const isReadOnly = (mode == 'create' || mode === "edit") ? false : mode === "view" || !isTodayOrFuture;

    // const [areaEntry, setAreaEntry] = useState([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchAndSetData = async () => {
            if (mode === 'create') {
                setIsLoading(false);
            }
            if (mode === "edit" || mode === "view") {

                setIsLoading(true);
                setValue("quantity_mmbtu", parseInt(data?.[0]?.tariff_charge?.quantity));
                setValue("fee_baht", data?.[0]?.tariff_charge?.fee);
                setValue("amount_baht", data?.[0]?.tariff_charge?.amount);
                setValue("quantity_operator", data?.[0]?.tariff_charge?.quantity_operator);
                setValue("amount_operator", data?.[0]?.tariff_charge?.amount_operator);

                // กรณีที่กดมาจาก Type ที่มี co-ef ให้ใน modal edit มีแสดง field นี้ด้วย
                setValue("difference", data?.[0]?.tariff_charge?.co_efficient);

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

        setTimeout(() => {
            clearErrors();
            setValue("quantity_mmbtu", '');
            setValue("fee_baht", '');
            setValue("amount_baht", '');
            setValue("quantity_operator", '');
            setValue("difference", '');
            reset();
        }, 500);

    };

    {/* Confirm Save */ }
    const handleSaveConfirm = async (data?: any) => {

        // setDataSubmit(data)
        // setModaConfirmSave(true)

        if (mode == 'create') {
            // await onSubmit(data);
            // setTimeout(() => {
            //     setValue("gas_day", null);
            //     setValue("zone_id", null);
            //     setValue("value_mmbtu", null);
            //     setValue("remark", null);

            //     clearErrors();

            //     reset();
            // }, 500);
        } else {
            const body_post = {
                "quantity_operator": data.quantity_operator.toString(),
                "amount_operator": data.amount_operator.toString()
            }

            setDataSubmit(body_post)
            setModaConfirmSave(true)
        }
    }

    const handleCalculate = (quantity_operator?: any, fee?: any, coefficient?: any) => {
        // คอลัมน์ Amount Operator มาจากค่า Quantity Operator x Fee 
        // ในกรณีที่เป็น Type Damage Charge จะเป็น Quantity Operator x Coefficient x Fee
        // ทศนิยม 2 ตำแหน่ง
        let fee_val = watch('fee_baht') ? watch('fee_baht') : 1

        // ตัด Co-Ef ออก ไม่ได้มีใช้ ไม่ต้องมีทั้งใน Tariff และใน Parameter https://app.clickup.com/t/86euzxxpe
        let result = watch('quantity_operator') * fee_val
        setValue("amount_operator", result);

        // if (viewDetailData?.tariff_type_charge?.name == 'Damage Charge') {
        //     let co_eff = viewDetailData.co_efficient ? viewDetailData.co_efficient : 1

        //     let co_eff_divided = co_eff / 100
        //     // ในกรณีที่เป็น Type Damage Charge จะเป็น Quantity Operator x Coefficient x Fee
        //     // let result = quantity_operator * viewDetailData.co_efficient * fee
        //     let result = watch('quantity_operator') * co_eff_divided * fee_val
        //     setValue("amount_operator", result);
        // } else {
        //     // คอลัมน์ Amount Operator มาจากค่า Quantity Operator x Fee 
        //     let result = watch('quantity_operator') * fee_val
        //     setValue("amount_operator", result);
        // }
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
                            <div className="flex inset-0 items-center justify-center  ">
                                <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-md">
                                    <form
                                        className="bg-white p-8 rounded-[20px] shadow-lg max-w w-[750px]"
                                        // onSubmit={handleSubmit(async (data) => { // clear state when submit
                                        //     setIsLoading(true);
                                        //     setTimeout(async () => {
                                        //         await onSubmit(data);
                                        //     }, 100);
                                        // })}
                                        onSubmit={handleSubmit(handleSaveConfirm)}
                                    >
                                        <h2 className="text-xl font-bold text-[#00ADEF] pb-2">
                                            {'Edit Tariff'}
                                        </h2>

                                        <div className="w-[650px]">
                                            <section className="relative z-20 pr-4 flex flex-col sm:flex-row w-full gap-10">
                                                {/* Month/Year */}
                                                <div className="flex flex-col">
                                                    <p className="!text-[14px] font-semibold text-[#58585A]">{`Month/Year`}</p>
                                                    <p className="!text-[14px] font-light text-[#757575]">{headData?.month_year_charge ? dayjs(headData?.month_year_charge).format("MMMM YYYY") : ''}</p>
                                                </div>

                                                {/* Tariff ID */}
                                                {/* <div className="flex flex-col">
                                                    <p className="!text-[14px] font-semibold text-[#58585A]">{`Tariff ID`}</p>
                                                    <p className="!text-[14px] font-light text-[#757575]">{headData?.tariff_id ? headData?.tariff_id : ''}</p>
                                                </div> */}

                                                {/* Type Charge */}
                                                <div className="flex flex-col">
                                                    <p className="!text-[14px] font-semibold text-[#58585A]">{`Type Charge`}</p>
                                                    <p className="!text-[14px] font-light text-[#757575]">{viewDetailData?.tariff_type_charge ? viewDetailData?.tariff_type_charge?.name : ''}</p>
                                                </div>

                                                {/* Shipper Name */}
                                                <div className="flex flex-col">
                                                    <p className="!text-[14px] font-semibold text-[#58585A]">{`Shipper Name`}</p>
                                                    <p className="!text-[14px] font-light text-[#757575]">{headData?.shipper ? headData?.shipper?.name : ''}</p>
                                                </div>

                                                {/* Contract Code */}
                                                <div className="flex flex-col">
                                                    <p className="!text-[14px] font-semibold text-[#58585A]">{`Contract Code`}</p>
                                                    <p className="!text-[14px] font-light text-[#757575]">{viewDetailData?.contract_code ? viewDetailData?.contract_code?.contract_code : ''}</p>
                                                </div>
                                            </section>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-6">
                                            <div className="relative">
                                                <label
                                                    htmlFor="quantity_mmbtu"
                                                    className="block mb-2 text-sm font-light"
                                                >
                                                    {`Quantity (MMBTU)`}
                                                </label>
                                                <NumericFormat
                                                    id="quantity_mmbtu"
                                                    placeholder="0"
                                                    value={watch("quantity_mmbtu")}
                                                    readOnly={true}
                                                    {...register("quantity_mmbtu", { required: false })}
                                                    className={`relative w-full h-[44px] p-5 hover:!p-5 focus:!p-5 rounded-lg border-[1px] border-[#DFE4EA] bg-white outline-none  focus:border-[#00ADEF] text-[14px] ${isReadOnly && '!bg-[#EFECEC]'} text-right `}
                                                    thousandSeparator={true}
                                                    // decimalScale={4}
                                                    fixedDecimalScale={true}
                                                    allowNegative={false}
                                                    displayType="input"
                                                    onValueChange={(values) => {
                                                        const { value } = values;
                                                        setValue("quantity_mmbtu", value, { shouldValidate: true, shouldDirty: true });
                                                    }}
                                                />
                                            </div>

                                            <div className="relative">
                                                <label
                                                    htmlFor="fee_baht"
                                                    className="block mb-2 text-sm font-light"
                                                >
                                                    {`Fee (Baht/MMBTU)`}
                                                </label>
                                                <NumericFormat
                                                    id="fee_baht"
                                                    placeholder="0"
                                                    value={watch("fee_baht")}
                                                    readOnly={true}
                                                    {...register("fee_baht", { required: false })}
                                                    className={`relative w-full h-[44px] p-5 hover:!p-5 focus:!p-5 rounded-lg border-[1px] border-[#DFE4EA] bg-white outline-none  focus:border-[#00ADEF] text-[14px] ${isReadOnly && '!bg-[#EFECEC]'} text-right `}
                                                    thousandSeparator={true}
                                                    decimalScale={4} // กันส่งมา 2. Tariff Charge Report > ในหน้า Edit ที่ Field Fee ต้องแสดงค่าเป็นทศนิยม 4 ตำแหน่ง
                                                    fixedDecimalScale={true}
                                                    allowNegative={false}
                                                    displayType="input"
                                                    onValueChange={(values) => {
                                                        const { value } = values;
                                                        setValue("fee_baht", value, { shouldValidate: true, shouldDirty: true });
                                                    }}
                                                />
                                            </div>

                                            <div className="relative">
                                                <label
                                                    htmlFor="amount_baht"
                                                    className="block mb-2 text-sm font-light"
                                                >
                                                    {`Amount (Baht)`}
                                                </label>
                                                <NumericFormat
                                                    id="amount_baht"
                                                    placeholder="0"
                                                    value={watch("amount_baht")}
                                                    readOnly={true}
                                                    {...register("amount_baht", { required: false })}
                                                    className={`relative w-full h-[44px] p-5 hover:!p-5 focus:!p-5 rounded-lg border-[1px] border-[#DFE4EA] bg-white outline-none  focus:border-[#00ADEF] text-[14px] ${isReadOnly && '!bg-[#EFECEC]'} text-right `}
                                                    thousandSeparator={true}
                                                    decimalScale={2}
                                                    fixedDecimalScale={true}
                                                    allowNegative={false}
                                                    displayType="input"
                                                    onValueChange={(values) => {
                                                        const { value } = values;
                                                        setValue("amount_baht", value, { shouldValidate: true, shouldDirty: true });
                                                    }}
                                                />
                                            </div>


                                            <div className="relative">
                                                <label
                                                    htmlFor="quantity_operator"
                                                    className="block mb-2 text-sm font-light"
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {`Quantity Operator (MMBTU)`}
                                                </label>
                                                <NumericFormat
                                                    id="quantity_operator"
                                                    placeholder="0"
                                                    value={watch("quantity_operator")}
                                                    readOnly={isReadOnly}
                                                    {...register("quantity_operator", { required: "Enter Quantity Operator (MMBTU)" })}
                                                    className={`relative w-full h-[44px] p-5 hover:!p-5 focus:!p-5 rounded-lg border-[1px] border-[#DFE4EA] bg-white outline-none  focus:border-[#00ADEF] text-[14px] ${errors.quantity_operator && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'} text-right `}
                                                    thousandSeparator={true}
                                                    decimalScale={0}
                                                    // fixedDecimalScale={true}
                                                    allowNegative={false}
                                                    displayType="input"
                                                    onValueChange={(values) => {
                                                        const { value } = values;
                                                        setValue("quantity_operator", value, { shouldValidate: true, shouldDirty: true });
                                                        handleCalculate(value, watch("fee_baht"))
                                                    }}
                                                />
                                                {errors.quantity_operator && (<p className="text-red-500 text-sm absolute">{`Enter Quantity Operator (MMBTU)`}</p>)}
                                            </div>

                                            {/* กรณีที่กดมาจาก Type ที่มี co-ef ให้ใน modal edit มีแสดง field (DIFFERENCE) นี้ด้วย เอาไว้ล่าง Amount (Baht) เป็นเทา แก้ไม่ได้ */}
                                            {/* {
                                                ['Capacity Overuse Charge (Entry)', 'Capacity Overuse Charge (Exit)', 'Damage Charge'].includes(viewDetailData?.tariff_type_charge?.name) &&
                                                <div className="relative">
                                                    <label
                                                        htmlFor="difference"
                                                        className="block mb-2 text-sm font-light"
                                                    >
                                                        {`Co-Efficient (%)`}
                                                    </label>
                                                    <NumericFormat
                                                        id="difference"
                                                        placeholder="0"
                                                        value={watch("difference")}
                                                        readOnly={true}
                                                        {...register("difference", { required: false })}
                                                        // className={`${inputClass} text-[14px] ${errors.difference && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'} text-right `}
                                                        className={`relative w-full h-[44px] p-5 hover:!p-5 focus:!p-5 rounded-lg border-[1px] border-[#DFE4EA] bg-white outline-none  focus:border-[#00ADEF] text-[14px] ${isReadOnly && '!bg-[#EFECEC]'} text-right `}
                                                        thousandSeparator={true}
                                                        decimalScale={3}
                                                        // fixedDecimalScale={true}
                                                        allowNegative={false}
                                                        displayType="input"
                                                        onValueChange={(values) => {
                                                            const { value } = values;
                                                            setValue("difference", value, { shouldValidate: true, shouldDirty: true });
                                                            // setValue("difference", value.replace(/\./g, ''), { shouldValidate: true, shouldDirty: true });
                                                        }}
                                                    />
                                                </div>
                                            } */}

                                            {/* เอาออกเพราะมัน auto cal ตอนพิมพ์ quantity อยู่แล้ว มันซ้ำซ้อน */}
                                            {/* <div className="flex flex-wrap gap-2 justify-start pt-2 col-span-2">
                                                <BtnGeneral
                                                    textRender={"Calculate"}
                                                    iconNoRender={true}
                                                    bgcolor={"#24AB6A"}
                                                    generalFunc={() => handleCalculate(0, 0)}
                                                    disable={false}
                                                    customWidthSpecific={100}
                                                    can_create={true}
                                                />
                                            </div> */}

                                            <div className="relative col-span-2">
                                                <label
                                                    htmlFor="amount_operator"
                                                    className="block mb-2 text-sm font-light"
                                                >
                                                    {`Amount Operator (Baht)`}
                                                </label>
                                                <NumericFormat
                                                    id="amount_operator"
                                                    placeholder="0.00"
                                                    value={watch("amount_operator")}
                                                    readOnly={true}
                                                    {...register("amount_operator", { required: true })}
                                                    className={`relative w-full h-[44px] p-5 hover:!p-5 focus:!p-5 rounded-lg border-[1px] border-[#DFE4EA] bg-white outline-none  focus:border-[#00ADEF] text-[14px] ${errors.amount_operator && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'} text-right `}
                                                    thousandSeparator={true}
                                                    decimalScale={2}
                                                    fixedDecimalScale={true}
                                                    allowNegative={false}
                                                    displayType="input"
                                                    onValueChange={(values) => {
                                                        const { value } = values;
                                                        setValue("amount_operator", value, { shouldValidate: true, shouldDirty: true });
                                                    }}
                                                />
                                                {errors.amount_operator && (<p className="text-red-500 text-sm absolute">{`Enter Quantity Operator (MMBTU)`}</p>)}
                                            </div>

                                            {/* <div className="col-span-2">
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
                                                    placeholder="Enter comment"
                                                    rows={2}
                                                    sx={{
                                                        '.MuiOutlinedInput-root': {
                                                            borderRadius: '8px',
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
                                                            color: '#58585A', // Disabled text color
                                                        },
                                                        "& .MuiOutlinedInput-input::placeholder": {
                                                            fontSize: "14px",
                                                        },
                                                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                            borderColor: "#00ADEF !important", // 👈 force black border on focus
                                                            borderWidth: '1px', // 👈 Force border 1px on focus
                                                        },
                                                    }}
                                                    fullWidth
                                                    className={`rounded-lg ${errors.description && 'border-red-500'} ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                />

                                                <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                                    <span className="text-[13px]">{watch('remark')?.length || 0} / 255</span>
                                                </div>
                                            </div> */}

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