import React, { useEffect, useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react'
import { formatFormDate, formatWatchFormDate } from '@/utils/generalFormatter';
import DatePickaForm from '@/components/library/dateRang/dateSelectForm';
import dayjs from 'dayjs';
import { useForm, SubmitHandler } from 'react-hook-form';

type FormData = {
    terminate_date: Date | null;
    new_contract_start_date: Date | null;
    reason: any;
    id: any;
    shadow_time: any;
    shadow_period: any;
};

type FormExampleProps = {
    data?: any;
    open: boolean;
    onClose: () => void;
    modeShow?: any;
    dataForm?: Partial<FormData>;
    setModalMsg?: any;
    setModalSuccessOpen?: any;
    setModalSuccessMsg?: any;
    setExpandedRow?: any;
    setIsAmendMode?: any;
    setAmendNewContractStartDate?: any;
    setExpandedEntry?: any;
    setExpandedExit?: any;
    setModeEditing?: any;
    setMdImportOpen?: any;
    setIsEditing?: any;
    setSelectedButton?: any;
    onSubmit: SubmitHandler<any>;
};

const ModalAmend: React.FC<FormExampleProps> = ({
    open,
    data,
    onClose,
    dataForm,
    onSubmit,
    modeShow,
    setModalMsg,
    setModalSuccessOpen,
    setModalSuccessMsg,
    setMdImportOpen,
    setSelectedButton,
    setExpandedEntry,
    setExpandedExit,
    setModeEditing,
    setIsEditing,
    setExpandedRow,
    setIsAmendMode,
    setAmendNewContractStartDate
}) => {

    const { register, handleSubmit, setValue, reset, resetField, formState: { errors }, watch, setError } = useForm<FormData>({
        defaultValues: dataForm,
    });

    const [tomorrowDay, setTomorrowDay] = useState<any>();
    const [contractEndDate, setContractEndDate] = useState<any>();

    useEffect(() => {
        setValue('terminate_date', null)

        // if data?.status_capacity_request_management_process?.id == 1 then disable select box start_date
        // const formattedStartDate: any = formatFormDate(data?.contract_start_date);
        let formattedEndDate: any = 'Invalid Date'
        if (data?.end_date !== null) {
            formattedEndDate = formatFormDate(data?.end_date);
        }

        if (data?.contract_end_date) {
            // let contract_end = dayjs(data?.contract_end_date).format("DD/MM/YYYY")

            // let contract_end = formatFormDate(data?.contract_end_date)
            // let contract_end = formatFormDate(dayjs(data?.contract_end_date).add(1, "day")) // https://app.clickup.com/t/9018502823/86ewwazzu
            let contract_end = formatFormDate(dayjs(data?.contract_end_date))
            setContractEndDate(contract_end) 
        }

        // Get the current date
        const currentDate = new Date();
        // Add 1 day to the current date
        currentDate.setDate(currentDate.getDate() + 1);
        setTomorrowDay(currentDate)

        // Set the value
        // setValue("terminate_date", formattedStartDate);

        setValue("id", data?.id)
        setValue("shadow_time", data?.shadow_time)
        setValue("shadow_period", data?.shadow_period)
        // setValue("new_contract_start_date", formattedEndDate);

    }, [data])

    useEffect(() => {
        if(open) {
            resetField('terminate_date')
            resetField('new_contract_start_date')
        }
    }, [open])

    const labelClass = "block mb-2 text-sm font-light"
    const textErrorClass = "text-red-500 text-sm";
    const startDate = new Date();
    const formattedStartDate = formatWatchFormDate(startDate);

    const handleExpand = () => {

        if (watch("terminate_date") == undefined) {
            // ทำให้กรอบ terminate มันแดง
            setError('terminate_date', { type: "manual", message: "Select Terminate Date" });

        } else {
            // https://app.clickup.com/t/86ereurxu
            // เมื่อกด Edit แล้ว ระบบต้องขึ้นวัน period from ของสัญญาใหม่ให้อัตโนมัติ และไม่ให้แก้วัน period to เนื่องจากเป็นการ amend จะขยายวันสิ้นสุดสัญญาไม่ได้
            // ค่า Cap. ต้องเริ่มตามวัน period from ใหม่ ตามตัวอย่างเลือกไว้เป็น 20/02/2025 ดังนั้นแค่ Cap. ที่จะแสดงในหน้า UI และแก้ไขได้จะเริ่มที่ Feb 2025 ไม่ต้องมีข้อมูลของ Jan 2025 เนื่องจากไม่ได้อยู่ใน period ใหม่
            // Contract Start Date ทั้งหน้ารายการหลัก และใน details ของ contract code ขึ้นไม่ถูกต้อง - (เกี่ยวเนื่องจากข้อ 2)

            setAmendNewContractStartDate(watch('terminate_date'))
            setIsAmendMode(true)
            setExpandedRow(data?.booking_version?.[0]?.id);
            setSelectedButton('original')
            setExpandedEntry("entry" + data?.booking_version?.[0]?.id);
            setExpandedExit("exit" + data?.booking_version?.[0]?.id)

            setIsEditing(true)
            setModeEditing('entry')
            resetField('terminate_date')
            resetField('new_contract_start_date')
            onClose();
        }
    }

    const handleImport = () => {
        setIsAmendMode(true) // เติมมา เอาไว้ใช้กับ modal import
        setMdImportOpen(true)
    }

    const handleClose = () => {
        resetField('terminate_date')
        resetField('new_contract_start_date')
        onClose();
        reset();
    };

    return (
        <Dialog open={open} onClose={handleClose} className="relative z-20">
            <div className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity" />
            <div className="fixed inset-0 z-10 flex items-center justify-center">
                <DialogPanel
                    transition
                    className="flex w-auto transform transition-all bg-white inset-0 rounded-[20px] text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                >
                    <div className="flex flex-col items-center gap-2 p-9 w-[600px]">
                        <div className="w-full">
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">
                                {`Amend : ${data?.contract_code}`}
                            </h2>
                        </div>

                        <form
                            onSubmit={handleSubmit((data) => { // clear state when submit
                                // setSelectedValues([]);
                                onSubmit(data);
                                reset();
                            })}
                            className='p-2 w-full max-w'
                        >
                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <div className="pb-2">
                                    <label className={labelClass}>
                                        <span className="text-red-500">*</span>
                                        {`Terminate Date`}
                                    </label>

                                    <DatePickaForm
                                        {...register('terminate_date', { required: "Select terminate date" })}
                                        readOnly={false}
                                        placeHolder="Select Start Date"
                                        mode={'create'}
                                        // valueShow={dayjs(watch("terminate_date")).format("DD/MM/YYYY")}
                                        valueShow={watch("terminate_date") ? dayjs(watch("terminate_date")).format("DD/MM/YYYY") : "Invalid Date"}
                                        // min={formattedStartDate || undefined}
                                        min={tomorrowDay || undefined}
                                        maxNormalForm={contractEndDate} // ตอนเลือก Terminated Date ห้ามเลือกเกินวันที่ End Date ของสัญญาเดิม https://app.clickup.com/t/86erm0qhg
                                        allowClear
                                        isError={errors.terminate_date && !watch("terminate_date") ? true : false}
                                        onChange={(e: any) => {
                                            setValue('terminate_date', formatFormDate(e)),
                                                e == undefined && setValue('terminate_date', null, { shouldValidate: true, shouldDirty: true }),
                                                setValue('new_contract_start_date', formatFormDate(e))
                                        }}
                                    />
                                    {errors.terminate_date && !watch("terminate_date") && <p className={`${textErrorClass}`}>{'Select Terminate Date'}</p>}
                                </div>

                                <div className="pb-2 ">
                                    <label className={labelClass}>{`New Contract Start Date`}</label>
                                    <DatePickaForm
                                        {...register('new_contract_start_date')}
                                        // readOnly={isReadOnly}
                                        readOnly={true}
                                        placeHolder=""
                                        termMaxDate={data?.extend_deadline !== null ? data?.extend_deadline : data?.new_contract_start_date}
                                        mode={'view'}
                                        isEndDate={true}
                                        min={formattedStartDate || undefined}
                                        valueShow={watch("new_contract_start_date") ? dayjs(watch("new_contract_start_date")).format("DD/MM/YYYY") : "Invalid Date"}
                                        allowClear
                                        onChange={(e: any) => { setValue('new_contract_start_date', formatFormDate(e)), e == undefined && setValue('new_contract_start_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-6 gap-2">

                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="w-[167px] h-[44px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500"
                                >
                                    {`Cancel`}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleExpand}
                                    className="w-[167px] h-[44px] font-semibold bg-[#3582D5] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                >
                                    {`Edit`}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleImport}
                                    className="w-[167px] h-[44px] font-semibold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                >
                                    {`Import`}
                                </button>

                            </div>
                        </form>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>

    );
};

export default ModalAmend;