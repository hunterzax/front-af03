import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import { useEffect } from "react";
import { TextField } from "@mui/material";

type FormExampleProps = {
    mode?: "create" | "edit" | "view" | "period";
    data?: Partial<any>;
    open: boolean;
    dataTable?: any;
    editOneOrTwo?: any;
    onClose: () => void;
    onSubmit: SubmitHandler<any>;
    setResetForm?: (reset: () => void) => void;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode,
    editOneOrTwo,
    data = {},
    dataTable = {},
    open,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const { control, register, handleSubmit, setValue, reset, clearErrors, resetField, formState: { errors }, watch, } = useForm<any>({ defaultValues: data, });
    const labelClass = "block mb-2 text-sm font-light";
    // const isReadOnly = (mode === "view" || mode === 'edit');
    const isReadOnly = (mode === "view");

    useEffect(() => {
        const fetchAndSetData = async () => {
            switch (editOneOrTwo) {
                case "1":
                    setValue("detail", data?.[0]?.text || "");
                    break;
                case 1:
                    setValue("detail", data?.[0]?.text || "");
                    break;

                case "2":
                    setValue("detail", data?.[1]?.text || "");
                    break;
                case 2:
                    setValue("detail", data?.[1]?.text || "");
                    break;
                default:
                    setValue("detail", "");
                    break;
            }
        }
        fetchAndSetData();
    }, [data, mode, editOneOrTwo, setValue]);

    // useEffect(() => {
    //     setResetForm(() => reset);
    // }, [reset, setResetForm]);

    const handleClose = () => {
        onClose();
        setValue("detail", null);
        reset();
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
                        <div className="flex flex-col items-center justify-center p-4 gap-4">
                            <form
                                onSubmit={handleSubmit(async (data) => { // clear state when submit
                                    // setIsLoading(true);
                                    setTimeout(async () => {
                                        await onSubmit(data);
                                        // setSelectedValues([]);
                                        setValue("detail", null);
                                    }, 100);
                                })}
                                className="bg-white p-6  w-full"
                            >
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#00ADEF] mb-4">
                                    {/* {mode === "create" ? `New Template for Shipper` : mode === "edit" ? "Edit Template for Shipper" : mode === "period" ? "New Period" : "View Template for Shipper"} */}
                                    {`Edit TSO Code ${editOneOrTwo}`}
                                </h2>
                                <div
                                    className={`grid gap-4 grid-cols-2`}
                                >

                                    {/* detail Field */}
                                    <div className="col-span-2">
                                        <label className={labelClass}> <span className="text-red-500">*</span>{`Detail`}</label>
                                        <TextField
                                            {...register("detail", { required: "Enter Detail" })}
                                            value={watch("detail") || ""}
                                            label=""
                                            multiline
                                            onChange={(e) => {
                                                if (e.target.value.length <= 300) {
                                                    setValue("detail", e.target.value);
                                                }
                                            }}
                                            placeholder="Enter detail"
                                            disabled={isReadOnly}
                                            rows={4}
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
                                                {watch("detail")?.length || 0} / 300
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
                                            className="py-2 px-6 rounded-lg bg-[#00ADEF] text-white hover:bg-blue-600"
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
    );
};

export default ModalAction;