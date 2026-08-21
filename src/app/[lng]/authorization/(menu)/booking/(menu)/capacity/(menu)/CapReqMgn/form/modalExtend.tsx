import React, { useEffect, useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react'
import { formatDate, formatFormDate, toDayjs } from '@/utils/generalFormatter';
import DatePickaForm from '@/components/library/dateRang/dateSelectForm';
import dayjs from 'dayjs';
import { useForm, SubmitHandler } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';
import { getService } from '@/utils/postService';
import Spinloading from '@/components/other/spinLoading';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isSameOrAfter);

type FormData = {
    contract_start_date: Date | null;
    contract_end_date: Date | null;
    original_contract_end_date: Date | null;
    reason: any;
    id: any;
    shadow_time: any;
    shadow_period: any;
};

type FormExampleProps = {
    data?: any;
    data2?: any;
    bookingTemplate?: any;
    open: boolean;
    isLoading?: any;
    onClose: () => void;
    modeShow?: any;
    dataForm?: Partial<FormData>;
    setModalMsg?: any;
    setModalSuccessOpen?: any;
    setModalSuccessMsg?: any;
    onSubmit: SubmitHandler<any>;
};

const ModalExtend: React.FC<FormExampleProps> = ({
    open,
    data,
    data2,
    bookingTemplate,
    onClose,
    dataForm,
    onSubmit,
    modeShow,
    isLoading
}) => {
    const { register, handleSubmit, setValue, reset, resetField, formState: { errors }, watch } = useForm<FormData>({ defaultValues: dataForm });
    const [tomorrowDay, setTomorrowDay] = useState<any>();
    const [isdisableExtend, setIsdisableExtend] = useState<any>(false);
    const [defaultContractEndDate, setDefaultContractEndDate] = useState<any>();
    const [selectedBookingTemplate, setSelectedBookingTemplate] = useState<any>();
    const [maxEndDate, setMaxEndDate] = useState<any>();

    const labelClass = "block mb-2 text-sm font-light"
    const inputClass = "text-sm block md:w-full p-2 ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF] !w-[100%]";
    const textErrorClass = "text-red-500 text-sm";

    useEffect(() => {

        // ถ้า status เป็น active (status_capacity_request_management_process?.id == 1) ปิด start_date
        const fetchAndSetData = async () => {
            const formattedStartDate: any = formatFormDate(data?.contract_start_date);
            let formattedEndDate: any = 'Invalid Date'
            if (data?.end_date !== null) {
                // formattedEndDate = formatFormDate(data?.contract_end_date);
                formattedEndDate = formatFormDate(data?.booking_version?.[0].contract_end_date);
            }

            // Get the current date
            const currentDate = new Date();
            const today = dayjs(); // วันนี้

            // Add 1 day to the current date
            currentDate.setDate(currentDate.getDate() + 1);

            setTomorrowDay(currentDate)

            if (dayjs(formattedStartDate).isBefore(today, "day")) {
                setIsdisableExtend(true);
            } else {
                setIsdisableExtend(false);
            }

            // Set the value
            setValue("contract_start_date", formattedStartDate);

            setValue("id", data?.id)
            setValue("shadow_time", data?.shadow_time)
            setValue("shadow_period", data?.shadow_period)
            setValue("contract_end_date", formattedEndDate);

            setDefaultContractEndDate(formattedEndDate)
        }
        fetchAndSetData();
        fetchBookingTemplate();

    }, [data, setValue, open])

    const handleClose = () => {
        onClose();
        // setSelectedValues([]);
        reset();
    };

    const fetchBookingTemplate = async () => {
        try {
            const response: any = await getService(`/master/parameter/booking-template`);
            if (response && Array.isArray(response)) {
                const now = dayjs()
                const activeTemplate = response.filter(item => {
                    let isActive = true
                    isActive = toDayjs(item?.start_date).isSameOrBefore(now)
                    if (isActive == true && item?.end_date) {
                        isActive = toDayjs(item?.end_date).isSameOrAfter(now)
                    }
                    return isActive
                })

                setSelectedBookingTemplate(activeTemplate?.find(item => item.term_type_id == data?.term_type_id))
            }
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    // หา max end_date
    useEffect(() => {
        // เดิมโรงงาน
        // ตย 01/03/2025 + 31 days (shadow_period) + 60 days (template.max)
        // const max_date_picker = dayjs(watch("contract_start_date")).add(data?.shadow_period || 0, data?.term_type_id == 4 ? 'day' : 'month').add(
        //     selectedBookingTemplate?.max || 0,
        //     selectedBookingTemplate?.file_period_mode === 1 ? 'day' : selectedBookingTemplate?.file_period_mode === 2 ? 'month' : selectedBookingTemplate?.file_period_mode === 3 ? 'year' : 'day'
        // ).toDate()

        const nowDate = dayjs().toDate();
        const isContractStart = dayjs(nowDate).isAfter(dayjs(watch("contract_start_date"))) || dayjs(nowDate).isSame(dayjs(watch("contract_start_date")));
        let max_date_picker: any = dayjs().toDate();

        if (isContractStart) {
            // ##### CASE contract active นับจาก shadow_period เท่านั้น นับจากวัน contract_end_date เดิมของสัญญา
            max_date_picker = dayjs(data?.contract_end_date).add(data?.shadow_period || 0, data?.term_type_id == 4 ? 'day' : 'month').toDate()
        } else {
            // ##### CASE contract ยังไม่ active นับจาก booking template เริ่มวัน contract_start_date
            max_date_picker = dayjs(watch("contract_start_date")).add(
                selectedBookingTemplate?.max || 0,
                selectedBookingTemplate?.file_period_mode === 1 ? 'day' : selectedBookingTemplate?.file_period_mode === 2 ? 'month' : selectedBookingTemplate?.file_period_mode === 3 ? 'year' : 'day'
            ).toDate()
        }

        setMaxEndDate(max_date_picker)
    }, [selectedBookingTemplate, watch("contract_start_date")])

    return (
        <Dialog open={open} onClose={handleClose} className="relative z-20">
            <div className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity" />
            <div className="fixed inset-0 z-10 flex items-center justify-center">
                <DialogPanel
                    transition
                    className="flex w-auto transform transition-all bg-white inset-0 rounded-[20px] text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                >
                    <Spinloading spin={isLoading ? false : true} rounded={20} />

                    <div className="flex flex-col items-center gap-2 p-9 w-[700px]">
                        <div className="w-full">
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">
                                {`Extend Contract`}
                            </h2>

                            {/* แถวแรก */}
                            <div className="mb-4 w-[100%] text-[rgb(88,88,90)]">
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
                                    <p>{`Shadow Time ${data?.term_type_id == 4 ? '(Day)' : '(Month)'}`}</p>
                                    <p>{`Shadow Period ${data?.term_type_id == 4 ? '(Day)' : '(Month)'}`}</p>
                                </div>

                                <div className="grid grid-cols-3 text-sm font-light">
                                    <p>{data?.shadow_time || '-'}</p>
                                    <p>{data?.shadow_period || '-'}</p>
                                </div>

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

                            <div className="grid grid-cols-2 gap-2 pt-4">
                                <div className="pb-2">
                                    <label className={labelClass}>
                                        {`New Shadow Time ${data?.term_type_id == 4 ? '(Day)' : '(Month)'}`}
                                    </label>
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
                                </div>

                                <div className="pb-2">
                                    <label className={labelClass}>
                                        {`New Shadow Period ${data?.term_type_id == 4 ? '(Day)' : '(Month)'}`}
                                    </label>
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
                                            setValue("contract_end_date", defaultContractEndDate);
                                        }}
                                    />
                                </div>

                                <div className="pb-2">
                                    <label className={labelClass}>
                                        <span className="text-red-500">*</span>
                                        {`Start Date`}
                                    </label>

                                    {/* // ถ้า status เป็น active (status_capacity_request_management_process?.id == 1) ปิด start_date */}
                                    <DatePickaForm
                                        {...register('contract_start_date', { required: "Select start date" })}
                                        readOnly={isdisableExtend || data?.status_capacity_request_management_process?.id == 1 ? true : false}
                                        placeHolder="Select Start Date"
                                        mode={data?.status_capacity_request_management_process?.id == 1 ? 'view' : 'edit'}
                                        valueShow={dayjs(watch("contract_start_date")).format("DD/MM/YYYY")}
                                        // min={formattedStartDate || undefined}
                                        // min={tomorrowDay || undefined}
                                        min={tomorrowDay}
                                        allowClear
                                        isError={errors.contract_start_date && !watch("contract_start_date") ? true : false}
                                        onChange={(e: any) => {
                                            setValue('contract_start_date', formatFormDate(e)), e == undefined && setValue('contract_start_date', null, { shouldValidate: true, shouldDirty: true });
                                            if(e && toDayjs(e).isSameOrAfter(toDayjs(watch("contract_end_date"), 'YYYY-MM-DD'))){
                                                resetField('contract_end_date');
                                            }
                                        }}
                                    />
                                    {errors.contract_start_date && !watch("contract_start_date") && <p className={`${textErrorClass}`}>{'Select Start Date'}</p>}
                                </div>

                                <div className="pb-2 ">
                                    <label className={labelClass}>{`End Date`}</label>

                                    {/* การกำหนด min, max ดู term ของสัญญา แล้วใช้เงื่อนไขเดียวกับ bulletin board */}
                                    {/* 
                                        1 = long term
                                        2 = medium term
                                        3 = short term
                                        4 = short term (non-firm) 
                                    */}
                                    {/* 
                                        3. Long term และ medium term เมื่อเลือกแล้ว Start date ต้องเป็นวันที่ 1 ของทุกเดือน และ End date  ต้องเป็นวันสุดท้ายของเดือนเสมอ - done
                                        4. ทำให้ปุ่มคำนวณวันที่รองรับเงื่อนไขที่ 2 กับ 3 ด้วย 
                                    */}

                                    {/* 
                                        add condition in termMaxDate if there's data?.shadow_period make data?.contract_end_date + data?.shadow_period (data?.shadow_period it's number if 3 then data?.contract_end_date + 3 months)
                                    */}

                                    {/* "file_period_mode": 2,  // 1 = วัน, 2 = เดือน, 3 = ปี */}
                                    <DatePickaForm
                                        {...register('contract_end_date')}
                                        readOnly={false}
                                        placeHolder="Select End Date"
                                        // // if data?.file_period_mode == 1 use day,  data?.file_period_mode == 2 use month, data?.file_period_mode == 3 use year

                                        // // v1.0.85 เมื่อเลยวัน Start date ของสัญญาแล้ว การ Extend ยังไม่ถูกต้อง โดย End Date ที่เลือกได้จะต้องเลือกได้ถึงช่วง shadow period และวัน Start Date จะต้อง default เป็นวันสุดท้ายของสัญญาเดิมโดยที่แก้ไขไม่ได้ https://app.clickup.com/t/86erm0qhb
                                        // // ตามภาพตัวอย่าง start date จะขึ้นเป็น 22/05/2025 และ end date สามารถเลือกได้ถึงวันที่ 22/08/2025 เนื่องจากสัญญาเดิมมี Shadow period 3 months
                                        // // Noted : เมื่อกด Extend กรณีที่เลยวันที่ Start Date ไปแล้ว ระบบจะแสดงวันที่ start date ของสัญญานั้นโดยไม่สามารถแก้ไขได้ค่ะ
                                        // // >> ISSUE ข้อนี้คือ End Date ที่เลือกได้จะต้องเลือกได้ถึงช่วง shadow period ของสัญญานี้ << 

                                        // https://app.clickup.com/t/86ermjpqn
                                        // max สุดที่จะสามารถเลือก end date ได้คือ
                                        // ต้องเอา ค่า max ของ term นั้น + shadow period 
                                        // เช่น max คือ 240 เดือน + shadow period ของสัญญานั้นไปอีก (กันคุยกับบีมไว้ ทำแบบนี้ไปก่อน)
                                        // เคสนี้ยกตัวอย่างเช่น
                                        // Min 5 , Max , 20
                                        // สัญญาแรกเริ่ม 5 ปี อยากจะ extend เป็น 20 ปี ก็ต้องได้ เพราะมันยังอยู่ในช่วง max ของ term

                                        // termMaxDate={data?.extend_deadline !== null
                                        //     ? data?.extend_deadline
                                        //     : data?.shadow_period
                                        //         ? data?.status_capacity_request_management_process?.id == 1
                                        //             ? dayjs(data?.contract_end_date).add(
                                        //                 data?.shadow_period || 0,
                                        //                 data?.term_type_id == 4
                                        //                     ? 'day'
                                        //                     : 'month'
                                        //             ).toDate()
                                        //             : dayjs(watch("contract_start_date")).add(
                                        //                 data?.shadow_period || 0,
                                        //                 data?.term_type_id == 4
                                        //                     ? 'day'
                                        //                     : 'month'
                                        //             ).add(
                                        //                 bookingTemplate?.max || 0,
                                        //                 bookingTemplate?.file_period_mode === 1
                                        //                     ? 'day'
                                        //                     : bookingTemplate?.file_period_mode === 2
                                        //                         ? 'month'
                                        //                         : bookingTemplate?.file_period_mode === 3
                                        //                             ? 'year'
                                        //                             : 'day' // Default to 'day' if file_period_mode is undefined
                                        //             ).toDate()
                                        //         : data?.contract_end_date
                                        // }


                                        // เดิมโรงงาน 2
                                        // termMaxDate={data?.extend_deadline !== null
                                        //     ? data?.extend_deadline
                                        //     : data?.shadow_period
                                        //         ? data?.status_capacity_request_management_process?.id == 1 // 1 == active
                                        //             ? dayjs(data?.contract_end_date).add(
                                        //                 watch("shadow_period") || 0,
                                        //                 data?.term_type_id == 4
                                        //                     ? 'day'
                                        //                     : 'month'
                                        //             ).toDate()
                                        //             : dayjs(watch("contract_start_date")).add(
                                        //                 // data?.shadow_period || 0,
                                        //                 watch("shadow_period") || 0,
                                        //                 data?.term_type_id == 4 ? 'day' : 'month' // 4 == short term non firm
                                        //             ).add(
                                        //                 selectedBookingTemplate?.max || 0,
                                        //                 selectedBookingTemplate?.file_period_mode === 1
                                        //                     ? 'day'
                                        //                     : selectedBookingTemplate?.file_period_mode === 2
                                        //                         ? 'month'
                                        //                         : selectedBookingTemplate?.file_period_mode === 3
                                        //                             ? 'year'
                                        //                             : 'day' // Default to 'day' if file_period_mode is undefined
                                        //             ).toDate()
                                        //         : dayjs(data?.contract_end_date).toDate()
                                        // }

                                        termMaxDate={maxEndDate}
                                        mode={'edit'}
                                        isEndDate={true}
                                        min={
                                            data?.status_capacity_request_management_process?.id == 1 ?
                                                dayjs(data?.contract_end_date).toDate()
                                                :
                                                dayjs(watch("contract_start_date")).add(
                                                    selectedBookingTemplate?.min || 1,
                                                    selectedBookingTemplate?.file_period_mode === 1
                                                        ? 'day'
                                                        : selectedBookingTemplate?.file_period_mode === 2
                                                            ? 'month'
                                                            : selectedBookingTemplate?.file_period_mode === 3
                                                                ? 'year'
                                                                : 'day'
                                                ).toDate()
                                        }
                                        // valueShow={watch("contract_end_date") ? dayjs(watch("contract_end_date")).format("DD/MM/YYYY") : "Invalid Date"}
                                        valueShow={watch("contract_end_date") ? dayjs(watch("contract_end_date")).format("DD/MM/YYYY") : "Invalid Date"}
                                        allowClear
                                        onChange={(e: any) => {
                                            setValue('contract_end_date', formatFormDate(e));
                                            if (e == undefined) {
                                                setValue('contract_end_date', null, { shouldValidate: true, shouldDirty: true });
                                            }
                                        }}
                                    />

                                </div>
                            </div>

                            <div className="flex justify-end pt-6">
                                {modeShow === "view" ? (
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                    >
                                        {`Close`}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500"
                                    >
                                        {`Cancel`}
                                    </button>
                                )}

                                {modeShow !== "view" && (
                                    <button
                                        type="submit"
                                        className="w-[167px] font-semibold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                    >
                                        {modeShow === "create" ? "Add" : "Extend"}
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