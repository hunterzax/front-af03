import React, { useEffect } from 'react';
import { Dialog,  DialogPanel } from '@headlessui/react'
import { SubmitHandler, useForm } from 'react-hook-form';
import { TextField } from "@mui/material";
import { formatFormDate } from '@/utils/generalFormatter';
import { useRouter } from "next/navigation";

type FormData = {
    id?: any;
    remark: string;
    start_date: Date | null;
    end_date: Date | null;
};

type FormExampleProps = {
    data: any;
    mode?: any;
    open: boolean;
    onClose: () => void;
    onSubmit: SubmitHandler<FormData>;
    setResetForm: (reset: () => void) => void;

};

const ModalReason: React.FC<FormExampleProps> = ({
    open,
    onClose,
    onSubmit,
    setResetForm,
    data,
    mode
}) => {
    const { control, register, handleSubmit, setValue, reset, formState: { errors }, watch } = useForm<any>({defaultValues: data});
    const isReadOnly = mode === "view";
    const router = useRouter();

    useEffect(() => {
        if (mode === "edit" || mode === "view") {
            const formattedStartDate: any = formatFormDate(data?.start_date);
            let formattedEndDate: any = null
            if (data?.end_date !== null) {
                formattedEndDate = formatFormDate(data?.end_date);
            }
            setValue("id", data?.id)
            setValue("remark", data?.remark || "");
            setValue("start_date", formattedStartDate);
            setValue("end_date", formattedEndDate);
        }
    }, [data, mode, setValue]);

    // https://app.clickup.com/t/86euzxxre 
    // V.2.0.109 Modal Remark ปรับปุ่ม Save เป็น Edit แล้วกดให้ Redirect ไปที่เมนู DAM > Capacity Publication Remarks (แล้วในช่องให้ Disable ไว้เลยไม่ว่าจะเป็น TSO หรือ Shipper)
    const redirectToDam = () => {
        router.push("/en/authorization/dam/parameters/uxui/capacityPublicRemarks");
    }

    return (
        <Dialog open={open} onClose={onClose} className="relative z-20">
            {/* <div className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity" /> */}
            <div className={["fixed inset-0 bg-black/45", "transition-opacity duration-100 ease-out", open ? "opacity-100" : "opacity-0 pointer-events-none"].join(" ")} />
            <div className="fixed inset-0 z-10 flex items-center justify-center">
                <DialogPanel
                    transition
                    className="flex w-auto transform transition-all bg-white inset-0 rounded-[20px] text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                >
                     <div className="flex inset-0 items-center justify-center ">
                            <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-md">
                                <form
                                    // onSubmit={handleSubmit(onSubmit)}
                                    onSubmit={handleSubmit(redirectToDam)}
                                    className="bg-white p-4 rounded-[20px]  max-w w-[600px]"
                                >
                                    <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-2">{`Remarks`}</h2>
                                    <div className="grid grid-cols-2 gap-2">

                                        <div className="col-span-2">
                                            <TextField
                                                {...register('remark', { required: false})}
                                                value={watch('remark') || ''}
                                                onChange={(e) => {
                                                    if (e.target.value.length <= 2000) {
                                                        setValue('remark', e.target.value);
                                                    }
                                                }}
                                                label=""
                                                multiline
                                                placeholder='Remark'
                                                disabled={true}
                                                rows={10}
                                                sx={{
                                                    '.MuiOutlinedInput-root': {
                                                        borderRadius: '8px',
                                                    },
                                                    '.MuiOutlinedInput-notchedOutline': {
                                                        // borderColor: '#DFE4EA',
                                                        borderColor: errors.remark && !watch('remark') ? '#FF0000' : '#DFE4EA',
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: errors.remark && !watch("remark") ? "#FF0000" : "#d2d4d8",
                                                    },
                                                    '&.Mui-focused .MuiOutlinedI nput-notchedOutline': {
                                                        borderColor: '#d2d4d8',
                                                    },
                                                    '&.MuiInputBase-input::placeholder': {
                                                        color: '#9CA3AF', // Placeholder color
                                                        fontSize: '14px', // Placeholder font size
                                                    },
                                                    '& .Mui-disabled': {
                                                        color: '#58585A', // Disabled text color
                                                    },
                                                }}
                                                fullWidth
                                                className={`${errors.remark && "border-red-500"} ${isReadOnly && '!bg-[#EFECEC]'}`}
                                            />
                                            {errors.remark && (<p className="text-red-500 text-sm">{`Enter Remark`}</p>)}
                                            <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                                <span className="text-[13px]">{watch('remark')?.length || 0} / 2000</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-6">
                                        {mode === "view" ? (
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                            >
                                                {`Close`}
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500"
                                            >
                                                {`Cancel`}
                                            </button>
                                        )}

                                        {mode !== "view" && (
                                            <button
                                                type="submit"
                                                className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default ModalReason;