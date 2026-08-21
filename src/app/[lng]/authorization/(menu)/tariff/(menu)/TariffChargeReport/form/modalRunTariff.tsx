import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useEffect, useState } from "react";
import SelectFormProps from "@/components/other/selectProps";
import dayjs from "dayjs";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import getUserValue from "@/utils/getuserValue";
import MonthYearPickaSearch from "@/components/library/dateRang/monthYearPicker";
import isBetween from "dayjs/plugin/isBetween";
import Spinloading from "@/components/other/spinLoading";

dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);

type FormExampleProps = {
    mode?: "create" | "edit" | "view" | "period";
    data?: Partial<any>;
    open: boolean;
    dataTariffId: any;
    dataContractCode?: any;
    onClose: () => void;
    onSubmit: SubmitHandler<any>;
    setResetForm: (reset: () => void) => void;
};

const ModalRunTariff: React.FC<FormExampleProps> = ({
    mode = "create",
    data = {},
    dataTariffId = {},
    dataContractCode = [],
    open,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const { control, register, handleSubmit, setValue, reset, clearErrors, formState: { errors }, watch, } = useForm<any>({ defaultValues: data, });
    const userDT: any = getUserValue();
    const { onChange, ...restMonthYearPick } = register("month_year_pick"); // register email

    const [key, setKey] = useState(0);
    const endOfMonth: any = dayjs().endOf('month').format('YYYY-MM-DD');
    const [srchStartDate, setSrchStartDate] = useState<Date | null>();
    const [dataShipperGroup, setDataShipperGroup] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchAndSetData = async () => {

            if (mode === 'create') {
                setIsLoading(false);
            }
            if (mode === "edit" || mode === "view") {
                setIsLoading(true);

                setTimeout(() => {
                    if (data) { setIsLoading(false); }
                }, 300);
            }
        }
        setKey((prevKey) => prevKey + 1);

        fetchAndSetData();
    }, [data, mode, setValue]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    const handleClose = () => {
        onClose();

        setTimeout(() => {
            clearErrors();
            reset();
        }, 500);
    };

    const findShipperOnMonth = async (date?: any) => {

        // ถ้า dataContractCode ไม่มีของ กันเหนียว
        if (!Array.isArray(dataContractCode) || !date) {
            setDataShipperGroup([]);
            return;
        }

        // GET tariff/tariffChargeReport/shipperMonthActive?date=2024-01-01
        // const date_for_filter = new Date(date);
        // const date_send = dayjs(date).format('YYYY-MM-DD')

        // DATA SHIPPER
        // const res_shipper_group = await getService(`/master/tariff/tariffChargeReport/shipperMonthActive?date=${date_send}`)
        // setDataShipperGroup(res_shipper_group)

        // Run Tariff : Shipper Name Select ยังขึ้นไม่ถูกต้อง https://app.clickup.com/t/86euna6ga
        // หา contract start-end ที่อยู่ในช่วงเดือนที่เลือก
        // ไม่เอา contract stat reject
        // จากนั้นเอารายชื่อ shipper จาก contract พวกนั้น

        const filter_2 = dataContractCode?.filter((item: any) => {
            const start = dayjs(item.contract_start_date);
            // const end = dayjs(item.contract_end_date);
            let end = dayjs(item.contract_end_date);

            // ถ้า stat status_capacity_request_management == 5 ("Terminated")
            // ต้องจับจาก contract_start_date --> terminate_date ("2025-06-15T00:00:00.000Z")
            // ถ้าไม่มี terminated ไปดู extend ถ้ามี จับจาก contract_start_date --> extend_deadline
            // จากนั้น ถ้าไม่มีสองอันบนนั้นค่อยดู เคส contract_end_date
            if (item?.status_capacity_request_management == 5) {
                end = dayjs(item?.terminate_date);
            } else if (item?.extend_deadline) {
                end = dayjs(item?.extend_deadline);
            }

            // return dayjs(date).isBetween(start, end, "day", "[]");
            return dayjs(date).isBetween(start, end, "month", "[]");
        });

        // status_capacity_request_management ไม่เอา reject
        // status_capacity_request_management_process ไม่เอา Waiting For Start Date, Waiting For Approval
        const filter_3 = filter_2?.filter((item: any) => ![3].includes(item?.status_capacity_request_management?.id) && ![2, 3].includes(item?.status_capacity_request_management_process?.id))

        const uniqueGroups = Array.from(
            new Map(filter_3?.map((item: any) => [item.group.id, item.group])).values()
        );

        setDataShipperGroup(uniqueGroups);
    }

    useEffect(() => {
        if (dataShipperGroup?.length == 0) {
            setValue('group_id', '')
        }
    }, [watch('group_id'), dataShipperGroup])

    return (
        <>
            <Dialog open={open} onClose={handleClose} className="relative z-30">
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
                />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <DialogPanel
                            transition
                            // className="flex transform transition-all inset-0 rounded-lg text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in  data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                            className="relative !w-[500px] max-w-xl bg-white transform transition-all rounded-[20px] text-left shadow-lg data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:w-[90%] lg:max-w-3xl"
                        >
                            <Spinloading spin={isLoading} rounded={20} />
                            <form
                                className="bg-white p-8 rounded-[20px] shadow-lg "
                                // className="bg-white p-6 w-full"
                                onSubmit={handleSubmit(async (data) => { // clear state when submit
                                    // setValue("group_id", null);

                                    let data_submit = {
                                        "month_year": dayjs(srchStartDate).format('YYYY-MM-DD'), // YYYY-MM-01
                                        "shipper_id": watch('group_id')
                                    }

                                    setIsLoading(true);
                                    setTimeout(async () => {
                                        await onSubmit(data_submit);
                                    }, 100);
                                })}
                            // onSubmit={handleSubmit(handleSaveConfirm)}
                            >
                                <h2 className="text-xl font-bold text-[#00ADEF] pb-2">
                                    {'Run Tariff'}
                                </h2>

                                <div className="grid grid-cols-1 gap-2 pt-4">
                                    <div>
                                        <label
                                            htmlFor="group_idxxx"
                                            className="block mb-2 text-sm font-light"
                                        >
                                            {/* <span className="text-red-500">*</span> */}
                                            {/* {`Shipper Name`} */}
                                        </label>
                                        <MonthYearPickaSearch
                                            key={"start" + key}
                                            label={'Month/Year Charge'}
                                            placeHolder={'Select Month/Year Charge'}
                                            isRequired={true}
                                            allowClear
                                            // min={dataTable?.date_balance}
                                            max={endOfMonth}
                                            customWidth={435}
                                            customHeight={44}
                                            // onChange={(e: any) => {
                                            //     setSrchStartDate(e ? e : null)
                                            //     setValue("group_id", undefined);
                                            //     findShipperOnMonth(e)
                                            // }}
                                            onChange={(e) => {
                                                setValue('group_id', '');
                                                setSrchStartDate(e ? e : null)
                                                findShipperOnMonth(e)
                                            }}
                                            {...restMonthYearPick}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2 pt-4">
                                    <div>
                                        <label
                                            htmlFor="group_id"
                                            className="block mb-2 text-sm font-light"
                                        >
                                            <span className="text-red-500">*</span>
                                            {`Shipper Name`}
                                        </label>

                                        <SelectFormProps
                                            id={'group_id'}
                                            register={register("group_id", { required: "Select Shipper Name" })}
                                            disabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
                                            valueWatch={userDT?.account_manage?.[0]?.user_type_id == 3 ? userDT?.account_manage?.[0]?.group?.id : watch("group_id")}
                                            handleChange={(e) => {
                                                setValue("group_id", e.target.value);
                                                if (errors?.group_id) { clearErrors('group_id') }
                                            }}
                                            errors={errors?.group_id}
                                            errorsText={'Select Shipper Name'}
                                            // options={shipperGroupData}
                                            options={dataShipperGroup?.filter((item: any) => // เห็นแค่ชื่อตัวเอง
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
                                            disabled={watch('group_id') || srchStartDate ? false : true}
                                            // className="w-[167px] font-semibold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                            className={`w-[167px] font-semibold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600 ${(!watch('group_id') || !srchStartDate) && 'border border-[#AEAEB2] cursor-not-allowed !bg-[#AEAEB2]'}`}
                                        >
                                            {mode === "create" ? "Confirm" : "Save"}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </DialogPanel>
                    </div >
                </div >
            </Dialog >
        </>
    );
};

export default ModalRunTariff;