import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { formatNumberFourDecimal, toDayjs } from "@/utils/generalFormatter";
import ModalConfirmSave from "@/components/other/modalConfirmSave";
import { NumericFormat } from "react-number-format";
import { TextField } from "@mui/material";

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
    const { control, register, handleSubmit, setValue, reset, clearErrors, formState: { errors }, watch } = useForm<any>({ defaultValues: data });
    const inputClass = "text-[14px] block md:w-full p-2 ps-5 focus:!ps-5 hover:!ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"
    const labelClass = "block mb-2 text-[14px] font-light"

    {/* Confirm Save */ }
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()

    const isReadOnly = mode === "view";
    // const isReadOnly = mode === "view" || (data?.gas_day && new Date(data?.gas_day) < new Date()); // 180325 Edit : ข้อมูลที่ถึงวันที่ Start Date แล้วจะไม่สามารถแก้ไขข้อมูลอะไรได้ นอกจาก End Date https://app.clickup.com/t/86erw7ah5

    // const [areaEntry, setAreaEntry] = useState([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchAndSetData = async () => {
            if (mode === 'create') {
                setIsLoading(false);
            }

            if (mode === "edit" || mode === "view") {
                // setIsLoading(true);
                setValue("adjust_imbalance", data?.adjust_imbalance ? data?.adjust_imbalance : null)
                setValue("remark", data?.comment?.length > 0 ? data?.comment?.[0]?.remark : '')

                // setTimeout(() => {
                //     if (data) { setIsLoading(false); }
                // }, 300);
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
            setValue("adjust_imbalance", 0);
            clearErrors();
            reset();
        }, 500);
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
                                        className="bg-white p-8 rounded-[20px] shadow-lg max-w w-[550px]"
                                        // onSubmit={handleSubmit(async (data) => { // clear state when submit
                                        //     setIsLoading(true);
                                        //     setTimeout(async () => {
                                        //         await onSubmit(data);
                                        //     }, 100);
                                        // })}
                                        onSubmit={handleSubmit(handleSaveConfirm)}
                                    >
                                        <h2 className="text-xl font-bold text-[#00ADEF] pb-2">
                                            {mode === "edit" ? `Edit` : `View`}
                                        </h2>

                                        <div className="mb-2 w-[70%] pt-6">
                                            <div className="grid grid-cols-[100px_150px_1fr] text-sm font-semibold text-[#58585A]">
                                                <p>{`Gas Day`}</p>
                                                <p>{`Shipper Name`}</p>
                                                <p>{`Zone`}</p>
                                            </div>

                                            <div className="grid grid-cols-[100px_150px_1fr] text-sm font-light text-[#58585A]">
                                                <p>{data?.gas_day ? toDayjs(data?.gas_day).format("DD/MM/YYYY") : '-'}</p>
                                                <p>{data?.group ? data?.group?.name : '-'}</p>
                                                <p>{data?.zone_obj ? data?.zone_obj?.name : '-'}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-2 pt-4">

                                            {/* #################################################################################### */}
                                            <div className="border border-[#DFE4EA] rounded-xl p-4">
                                                <div className="font-semibold text-[#1473A1]">{`Daily Imbalance :`}</div>
                                                <div className="grid grid-cols-3 gap-4 font-semibold text-[#58585A] w-full">
                                                    <div>{`Initial Imbalance`}</div>
                                                    <div></div>
                                                    <div>{`Final Imbalance`}</div>
                                                </div>
                                                <div className="grid grid-cols-3 font-light text-[#58585A] w-full">
                                                    <div className="text-right pr-8">{data?.dailyAccIm ? formatNumberFourDecimal(data?.dailyAccIm) : '0.0000'}</div>
                                                    <div></div>
                                                    <div className="text-right pr-8">{data?.finalDailyAccIm ? formatNumberFourDecimal(data?.finalDailyAccIm) : '0.0000'}</div>
                                                </div>
                                            </div>


                                            {/* #################################################################################### */}
                                            <div className="border border-[#DFE4EA] rounded-xl p-4 ">

                                                <div className="font-semibold text-[#1473A1] ">{`Intraday Imbalance :`}</div>
                                                <div className="grid grid-cols-3 gap-4 font-semibold text-[#58585A] w-full">
                                                    <div>{`Initial Imbalance`}</div>
                                                    <div></div>
                                                    <div>{`Final Imbalance`}</div>
                                                </div>

                                                <div className="grid grid-cols-3 font-light text-[#58585A] w-full">
                                                    <div className="text-right pr-8">{data?.intradayAccIm ? formatNumberFourDecimal(data?.intradayAccIm) : '0.0000'}</div>
                                                    <div></div>
                                                    <div className="text-right pr-8">{data?.finalIntradayAccIm ? formatNumberFourDecimal(data?.finalIntradayAccIm) : '0.0000'}</div>
                                                </div>
                                            </div>

                                            <div className="pt-10">
                                                <label
                                                    htmlFor="adjust_imbalance"
                                                    className="block mb-2 text-sm font-light"
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {`Adjust Imbalance`}
                                                </label>
                                                <NumericFormat
                                                    id="adjust_imbalance"
                                                    placeholder="0.0000"
                                                    value={watch("adjust_imbalance")}
                                                    readOnly={isReadOnly}
                                                    {...register("adjust_imbalance", { required: "Enter Adjust Imbalance" })}
                                                    className={`${inputClass} ${errors.adjust_imbalance && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                    thousandSeparator={true}
                                                    decimalScale={4}
                                                    fixedDecimalScale={true}
                                                    allowNegative={true}
                                                    displayType="input"
                                                    onValueChange={(values) => {
                                                        const { value } = values;
                                                        setValue("adjust_imbalance", value, { shouldValidate: true, shouldDirty: true });
                                                    }}
                                                />
                                                {errors.adjust_imbalance && (<p className="text-red-500 text-sm">{`Enter Adjust Imbalance`}</p>)}
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
                                            </div>

                                        </div>

                                        <div className="flex justify-end pt-6">
                                            {mode === "view" ? (
                                                <button
                                                    type="button"
                                                    // onClick={onClose}
                                                    onClick={() => handleClose()}
                                                    className="w-[167px] font-semibold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
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
                            {`Do you want to save the changes ?`}
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