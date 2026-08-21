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
import { NumericFormat } from "react-number-format";
import ModalConfirmSave from "@/components/other/modalConfirmSave";
import { toDayjs } from "@/utils/generalFormatter";

type FormExampleProps = {
    mode?: "create" | "edit" | "view" | "period";
    data?: Partial<any>;
    open: boolean;
    dataTable?: any;
    dataShipper?: any;
    nominationTypeMaster?: any;
    dataContractOriginal?: any;
    onClose: () => void;
    onSubmit: SubmitHandler<any>;
    setResetForm: (reset: () => void) => void;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode,
    data = {},
    dataTable = {},
    open,
    dataShipper,
    nominationTypeMaster,
    dataContractOriginal,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const { control, register, handleSubmit, setValue, reset, clearErrors, resetField, formState: { errors }, watch, } = useForm<any>({ defaultValues: data });
    const labelClass = "block mb-2 text-sm font-light";
    const inputClass = "text-sm block md:w-full p-2 ps-5 pe-10 h-[46px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]";

    const [ShipperData, setShipperData] = useState<any>({});

    useEffect(() => {
        const find_shipper = dataShipper?.find((itemx: any) => itemx?.id_name == data?.shipper)
        setShipperData(find_shipper)
    }, [data])

    const [isLoading, setIsLoading] = useState<boolean>(true);

    {/* Confirm Save */ }
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()

    // const isReadOnly = (mode === "view" || mode === 'edit');
    const isReadOnly = (mode === "view");

    useEffect(() => {
        clearErrors();
        const fetchAndSetData = async () => {
            if (mode === "edit" || mode === "view") {
                setValue("shipper_review_allocation", data?.shipper_review_allocation || "");
                setIsLoading(false)
            }
        }
        fetchAndSetData();
    }, [data, mode, setValue]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    const handleClose = () => {
        onClose();
        clearErrors
        setValue("shipper_review_allocation", null);
        setValue("comment", null);
        reset();
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
                            <div className="flex flex-col items-center justify-center p-4 gap-4">
                                <div className="w-[700px]">
                                    {/* <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`Comment`}</h2> */}
                                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#00ADEF] mb-4 pb-3 pt-3">
                                        {mode === "create" ? `New Shipper Allocation Review` : mode === "edit" ? "Edit Shipper Allocation Review" : mode === "period" ? "New Period" : "View Shipper Allocation Review"}
                                    </h2>

                                    <div className="mb-1 w-[100%]">
                                        <div className="grid grid-cols-[100px_175px_120px_120px] text-sm font-semibold text-[#58585A]">
                                            <p>{`Gas Day`}</p>
                                            <p>{`Nomination Point / Concept Point`}</p>
                                            <p>{`Shipper Name`}</p>
                                            <p>{`Contract Code`}</p>
                                        </div>

                                        <div className="grid grid-cols-[100px_175px_120px_120px] text-sm font-light text-[#58585A]">
                                            <p>{data?.gas_day ? toDayjs(data?.gas_day, 'YYYY-MM-DD').format("DD/MM/YYYY") : ''}</p>
                                            <p>{data?.point ? data?.point : ''}</p>
                                            <p>{data?.group ? data?.group?.name : ''}</p>  {/* https://app.clickup.com/t/86eu4826q Edit : Head Detail Shipper Name ต้องแสดงเป็น Short Name */}
                                            <p>{data?.contract ? data?.contract : ''}</p>
                                        </div>
                                    </div>
                                </div>

                                <Spinloading spin={isLoading} rounded={20} />
                                <form
                                    // onSubmit={(data:any) => handleFormSubmit(data)}
                                    // onSubmit={handleSubmit(async (data) => { // clear state when submit
                                    //     // setIsLoading(true);
                                    //     // setTimeout(async () => {
                                    //     //     await onSubmit(data);
                                    //     //     setSelectedValues([]);
                                    //     // }, 100);
                                    // })}
                                    onSubmit={handleSubmit(handleSaveConfirm)}
                                    className="bg-white p-6 w-full"
                                >
                                    <div
                                        className={`grid gap-4 grid-cols-2`}
                                    >
                                        <div className="col-span-2">
                                            <label
                                                htmlFor="shipper_review_allocation"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Shipper Review Allocation (MMBTU/D)`}
                                            </label>
                                            <NumericFormat
                                                id="shipper_review_allocation"
                                                placeholder="0.0000"
                                                value={watch("shipper_review_allocation")}
                                                readOnly={isReadOnly}
                                                {...register("shipper_review_allocation", { required: "Enter Shipper Review Allocation (MMBTU/D)" })}
                                                className={`${inputClass} ${errors.shipper_review_allocation && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                thousandSeparator={true}
                                                decimalScale={4}
                                                fixedDecimalScale={true}
                                                allowNegative={false}
                                                displayType="input"
                                                onValueChange={(values) => {
                                                    const { value } = values;
                                                    setValue("shipper_review_allocation", value, { shouldValidate: true, shouldDirty: true });
                                                }}
                                            />
                                            {errors.shipper_review_allocation && (<p className="text-red-500 text-sm">{`Enter Shipper Review Allocation (MMBTU/D)`}</p>)}
                                        </div>

                                        {/* Comment Field */}
                                        <div className="col-span-2">
                                            <label className={labelClass}>{`Comment`}</label>
                                            <TextField
                                                {...register("comment")}
                                                value={watch("comment") || ""}
                                                label=""
                                                multiline
                                                onChange={(e) => {
                                                    if (e.target.value.length <= 255) {
                                                        setValue("comment", e.target.value);
                                                    }
                                                }}
                                                placeholder="Enter Comment"
                                                disabled={isReadOnly}
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
                                                className={`rounded-lg ${isReadOnly && '!bg-[#EFECEC]'}`}
                                            />
                                            <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                                <span className="text-[13px]">
                                                    {watch("comment")?.length || 0} / 255
                                                </span>
                                            </div>
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
                                                className="py-2 px-6 font-semibold w-[167px] h-[44px] rounded-lg bg-[#00ADEF] text-white hover:bg-blue-600"
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