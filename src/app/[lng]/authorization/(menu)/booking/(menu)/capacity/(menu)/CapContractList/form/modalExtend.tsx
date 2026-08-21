import React, { useEffect, useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react'
import { formatDate, formatFormDate, formatWatchFormDate } from '@/utils/generalFormatter';
import DatePickaForm from '@/components/library/dateRang/dateSelectForm';
import dayjs from 'dayjs';
import { useForm, SubmitHandler } from 'react-hook-form';
import { TextField } from '@mui/material';
import { NumericFormat } from 'react-number-format';

type FormData = {
    // start_date: Date | null;
    end_date: Date | null;
    reason: any;
    shadow_time: any;
    shadow_period: any;
    stat_id: any;
};

type FormExampleProps = {
    data?: any;
    open: boolean;
    onClose: () => void;
    modeShow: any;
    dataForm?: Partial<FormData>;
    onSubmit: SubmitHandler<FormData>;
};

const ModalExtend: React.FC<FormExampleProps> = ({
    open,
    data,
    onClose,
    dataForm,
    onSubmit,
    modeShow
}) => {
    const { register, handleSubmit, setValue, reset, formState: { errors }, watch } = useForm<FormData>({
        defaultValues: dataForm,
    });
     
    // modeShow = 'approve'

    {/* status_capacity_request_management
            [
                { "id": 1, "name": "Saved" },
                { "id": 2, "name": "Approved" },
                { "id": 3, "name": "Rejected" },
                { "id": 4, "name": "Comfirmed" },
                { "id": 5, "name": "Terminated" }
            ] 
    */}

    useEffect(() => {
        setValue(
            "stat_id",
            modeShow === "approve"
                ? 2
                : modeShow === "reject"
                    ? 3
                    : modeShow === "terminate"
                        ? 5
                        : modeShow === "confirm"
                            ? 4
                            : modeShow === "saved"
                                ? 1
                                : null // Default 
        );
        setValue("shadow_time", data?.shadow_time)
        setValue("shadow_period", data?.shadow_period)
    }, [data])

    const labelClass = "block mb-2 text-sm font-light"
    const buttonClass = "w-[167px] py-2 rounded-lg focus:outline-none";
    const cancelClass = "font-light bg-slate-100 text-black hover:bg-rose-500 focus:bg-rose-500";
    const actionClass = "font-bold bg-[#00ADEF] text-white hover:bg-blue-600 focus:bg-blue-600";
    const inputClass = "text-sm block md:w-full p-2 ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF] !w-[94%]";

    const startDate = new Date();
    const formattedStartDate = formatWatchFormDate(startDate);
    // useEffect(() => {
    //     // setResetForm(() => reset);
    // }, []);
    const actionButtons: any = {
        terminate: 'Terminate',
        approve: 'Approve',
        reject: 'Reject',
    };

    const handleClose = () => {
        onClose();
        // setSelectedValues([]);
        reset();
    };

    return (
        <Dialog open={open} onClose={onClose} className="relative z-20">
            {/* <div className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity" /> */}
            <div className={["fixed inset-0 bg-black/45", "transition-opacity duration-100 ease-out", open ? "opacity-100" : "opacity-0 pointer-events-none"].join(" ")} />
            <div className="fixed inset-0 z-10 flex items-center justify-center">
                <DialogPanel
                    transition
                    className="flex w-auto transform transition-all bg-white inset-0 rounded-[20px] text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                >
                    <div className="flex flex-col items-center gap-2 p-9 w-[700px]">
                        <div className="w-full">
                            {/* <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`${modeShow}`}</h2> */}
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">
                                {`${modeShow.charAt(0).toUpperCase()}${modeShow.slice(1)}`}
                            </h2>

                            {/* แถวแรก */}
                            <div className="mb-4 w-[100%] text-[#58585A]">
                                <div className="grid grid-cols-3 text-sm font-semibold">
                                    <p>{`Contract Code`}</p>
                                    <p>{`Shipper Name`}</p>
                                    <p>{`Submitted Timestamp`}</p>
                                </div>

                                <div className="grid grid-cols-3 text-sm font-light">
                                    <p>{data?.contract_code || '-'}</p>
                                    <p>{data?.group?.name || '-'}</p>
                                    <p>{formatDate(data?.submitted_timestamp) || '-'}</p>
                                </div>
                            </div>

                            {/* "file_period_mode": 2,  // 1 = วัน, 2 = เดือน, 3 = ปี */}
                            {/* แถวสอง */}
                            <div className="mb-4 w-[100%] text-[#58585A]">
                                <div className="grid grid-cols-3 text-sm font-semibold">
                                    <p>{`Shadow Time ${data?.file_period_mode == 1 ? '(Day)' : data?.file_period_mode == 2 ? '(Month)' : '(Year)'}`}</p>
                                    <p>{`Shadow Period ${data?.file_period_mode == 1 ? '(Day)' : data?.file_period_mode == 2 ? '(Month)' : '(Year)'}`}</p>
                                </div>

                                {modeShow == 'approve' ? <div className="grid grid-cols-3 text-sm font-light pt-2">
                                    <p>
                                        <NumericFormat
                                            id="shadow_time"
                                            placeholder="Enter Shadow Time"
                                            value={watch("shadow_time") ? watch("shadow_time") : data?.shadow_time}
                                            readOnly={false}
                                            {...register("shadow_time")}
                                            className={`${inputClass}  ${errors.shadow_time && "border-red-500"} text-right`}
                                            thousandSeparator={false}
                                            decimalScale={0}
                                            fixedDecimalScale={false}
                                            allowNegative={false}
                                            displayType="input"
                                            onValueChange={(values) => {
                                                const { value } = values;
                                                setValue("shadow_time", value, { shouldValidate: true, shouldDirty: true });
                                            }}
                                        />
                                    </p>
                                    <p>
                                        <NumericFormat
                                            id="shadow_period"
                                            placeholder="Enter Shadow Period"
                                            value={watch("shadow_period") ? watch("shadow_period") : data?.shadow_period}
                                            readOnly={false}
                                            {...register("shadow_period")}
                                            className={`${inputClass} ${errors.shadow_period && "border-red-500"} text-right`}
                                            thousandSeparator={false}
                                            decimalScale={0}
                                            fixedDecimalScale={false}
                                            allowNegative={false}
                                            displayType="input"
                                            onValueChange={(values) => {
                                                const { value } = values;
                                                setValue("shadow_period", value, { shouldValidate: true, shouldDirty: true });
                                            }}
                                        />
                                    </p>
                                </div>
                                    : <div className="grid grid-cols-3 text-sm font-light">
                                        <p>{data?.shadow_time || '-'}</p>
                                        <p>{data?.shadow_period || '-'}</p>
                                    </div>
                                }
                            </div>
                        </div>

                        <form
                            onSubmit={handleSubmit((data) => { // clear state when submit
                                // setSelectedValues([]);
                                onSubmit(data);
                                reset();
                            })}
                            className='p-2 w-full max-w'
                        >
                            {
                                modeShow == "terminate" && <div className="pb-2 w-[50%]">
                                    <label className={labelClass}><span className="text-red-500">*</span>{`End Date`}</label>
                                    <DatePickaForm
                                        {...register('end_date')}
                                        // readOnly={isReadOnly}
                                        readOnly={false}
                                        placeHolder="Select End Date"
                                        termMaxDate={data?.extend_deadline !== null ? data?.extend_deadline : data?.contract_end_date}
                                        mode={'create'}
                                        isEndDate={true}
                                        min={formattedStartDate || undefined}
                                        valueShow={watch("end_date") ? dayjs(watch("end_date")).format("DD/MM/YYYY") : undefined}
                                        allowClear
                                        onChange={(e: any) => { setValue('end_date', formatFormDate(e)), e == undefined && setValue('end_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                    />
                                </div>
                            }

                            {
                                modeShow == "reject" && <div>
                                    <label className={labelClass}>{`Reasons`}</label>
                                    <TextField
                                        {...register('reason')}
                                        value={watch('reason') || ''}
                                        label=""
                                        multiline
                                        onChange={(e) => {
                                            if (e.target.value.length <= 255) {
                                                setValue('reason', e.target.value);
                                            }
                                        }}
                                        placeholder='Enter Reasons'
                                        rows={6}
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
                                        className='rounded-lg'
                                    />
                                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                        <span className="text-[13px]">{watch('reason')?.length || 0} / 255</span>
                                    </div>
                                </div>
                            }

                            <div className="w-full flex justify-end pt-8">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className={`${buttonClass} ${cancelClass}`}
                                >
                                    Cancel
                                </button>
                                {actionButtons[modeShow] && (
                                    <button
                                        type="submit"
                                        className={`${buttonClass} ${actionClass} `}
                                    >
                                        {actionButtons[modeShow]}
                                    </button>
                                )}
                            </div>

                        </form>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>

    );
};

export default ModalExtend;