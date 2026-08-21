import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useEffect, useState } from "react";
import { formatFormDate, formatWatchFormDate, getMinDate } from "@/utils/generalFormatter";
import DatePickaForm from "@/components/library/dateRang/dateSelectForm";
import dayjs from "dayjs";
import { NumericFormat } from "react-number-format";
import SelectFormProps from "@/components/other/selectProps";
import ModalConfirmSave from "@/components/other/modalConfirmSave";
import { CustomTooltip } from "@/components/other/customToolTip";

type FormData = {
    menus_id: string;
    system_parameter_id: string;
    value: string;
    link: string;
    start_date: Date;
    end_date: Date;
};

type FormExampleProps = {
    mode?: "create" | "edit" | "view";
    data?: Partial<FormData>;
    open: boolean;
    termTypeMasterData: any
    sysParamModule: any
    onClose: () => void;
    onSubmit: SubmitHandler<FormData>;
    setResetForm: (reset: () => void) => void;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode = "create",
    data = {},
    termTypeMasterData = {},
    sysParamModule = {},
    open,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const { control, register, handleSubmit, setValue, reset, clearErrors, formState: { errors }, watch } = useForm<any>({ defaultValues: data });

    const labelClass = "block mb-2 text-sm font-light";
    const inputClass = `text-sm block md:w-full !p-2 !ps-5 hover:!p-2 hover:!ps-5 focus:!p-2 focus:!ps-5 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF] ${mode == 'view' && '!border-none'}`;
    const textErrorClass = "text-red-500 text-sm";
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // const isReadOnly = mode === "view";
    const isReadOnly = mode === "view" || (data?.start_date && new Date(data?.start_date) < new Date()); // Edit ถ้าในกรณีที่เลย Start Date ไปแล้วต้องแก้ไขได้เฉพาะ Link กับ End Date https://app.clickup.com/t/86etzcgvf

    const startDate = watch("start_date");
    const formattedStartDate = formatWatchFormDate(startDate);
    const [subSystem, setSubSystem] = useState<any>([]);

    {/* Confirm Save */ }
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()
    const [isNameInclude, setIsNameInclude] = useState<any>(false)
    const [isAutoExecCommercial, setIsAutoExecCommercial] = useState<any>(false)

    const handleFindSubSysParam = (id: any) => {
        const sub_system = sysParamModule.find((item: any) => item.id === id)

        // ตัด Co-Ef ออก ไม่ได้มีใช้ ไม่ต้องมีทั้งใน Tariff และใน Parameter https://app.clickup.com/t/86euzxxpe
        // กรอง res_.system_parameter.name ที่มีคำว่า "Co-Efficient (%)" ออก

        // เพิ่มเงื่อนไข ให้ตัด name พวกนี้ด้วย
        // Intraday: HV for System(BTU / SCF)
        // Intraday: HV for each Shipper(BTU / SCF)

        // const filtered = sub_system?.sub_system_parameter?.filter((item: any) => {
        //     const name = (item?.name ?? '').normalize('NFKD').toLowerCase().replace(/\s+/g, ' ');
        //     return !name.includes('co-efficient (%)');
        // });

        const filtered = (sub_system?.sub_system_parameter ?? []).filter((item: any) => {
            const name = (item?.name ?? "").normalize("NFKD").toLowerCase().replace(/\s+/g, " ");

            // คำที่ต้องตัดทิ้ง
            const blacklist = [
                "Tariff/Onshore: Capacity Over-Use Charge Fee (%)",
                "tariff/onshore: capacity over-use charge fee (%)",
                "co-efficient (%)",
                "intraday: hv for system (btu/scf)",
                "intraday: hv for each shipper (btu/scf)",
            ];

            // ถ้าชื่อมีคำใดคำหนึ่งใน blacklist ให้ตัดออก
            const isBlacklisted = blacklist.some(term => name.includes(term));

            return !isBlacklisted;
        });

        // ตัด name ซ้ำ
        const uniqueByNameKeepOldestId = Object.values(
            filtered.reduce((acc: Record<string, any>, cur: any) => {
                const key = cur.name;
                // ถ้ามีชื่อซ้ำแล้ว ให้เก็บตัวที่ id น้อยกว่า (เก่าที่สุด)
                if (!acc[key] || cur.id < acc[key].id) {
                    acc[key] = cur;
                }
                return acc;
            }, {})
        );

        setSubSystem(uniqueByNameKeepOldestId)
    }

    useEffect(() => {
        clearErrors();
        if (mode === "edit" || mode === "view") {

            const formattedStartDate: any = formatFormDate(data?.start_date);
            // const formattedEndDate: any = formatFormDate(data?.end_date);
            let formattedEndDate: any = 'Invalid Date'
            if (data?.end_date !== null) {
                formattedEndDate = formatFormDate(data?.end_date);
            }
            const filteredData = sysParamModule.filter((item: any) => item.id === data?.menus_id);
            // setSubSystem(sysParamModule.find((item: any) => item.id === data?.menus_id))
            setSubSystem(filteredData?.[0]?.sub_system_parameter || [])

            setValue("menus_id", data?.menus_id || "");
            setValue("system_parameter_id", data?.system_parameter_id || "");
            setValue("value", data?.value || "");
            setValue("link", data?.link || "");
            setValue("start_date", formattedStartDate);
            setValue("end_date", formattedEndDate);
        }
    }, [data, mode, setValue]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    {/* Confirm Save */ }
    const handleSaveConfirm = async (data?: any) => {

        if (mode == 'create') {
            await onSubmit(data);
        } else {
            setDataSubmit(data)
            setModaConfirmSave(true)
        }
    }

    useEffect(() => {
        const ssss = subSystem?.find((item: any) => item.id == watch("system_parameter_id"))
        const isNameInclude = ssss?.name?.toLowerCase().trim()?.includes('automatic execution of')
        setIsNameInclude(isNameInclude)

        const isCommercialExec = watch("system_parameter_id") == 5 //Automatic execution of commercial balances (Daily at 04:30AM, 07:30AM and 00:30AM)
        setIsAutoExecCommercial(isCommercialExec)
    }, [subSystem, watch("system_parameter_id")])

    return (<>
        <Dialog open={open} onClose={onClose} className="relative z-20">
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
                        <div className="flex inset-0 items-center justify-center ">
                            {/* <Spinloading spin={isLoading} rounded={20} /> */}
                            <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-md ">

                                <form
                                    // onSubmit={handleSubmit(onSubmit)}
                                    onSubmit={handleSubmit(handleSaveConfirm)}
                                    className="bg-white p-8 rounded-[20px] shadow-lg max-w"
                                >
                                    <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-2">{mode == "create" ? `New System Parameter` : mode == "edit" ? "Edit System Parameter" : "View System Parameter"}</h2>
                                    <div className="grid grid-cols-2 gap-2">

                                        <div className="col-span-2">
                                            <label
                                                htmlFor="menus_id"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Module`}
                                            </label>

                                            <SelectFormProps
                                                id={'menus_id'}
                                                register={register("menus_id", { required: "Select Module" })}
                                                disabled={isReadOnly}
                                                valueWatch={watch("menus_id") || ""}
                                                handleChange={(e) => {
                                                    setValue("menus_id", e.target.value);
                                                    handleFindSubSysParam(e.target.value);
                                                    if (errors?.menus_id) { clearErrors('menus_id') }
                                                }}
                                                errors={errors?.menus_id}
                                                errorsText={'Select Module'}
                                                options={sysParamModule}
                                                optionsKey={'id'}
                                                optionsValue={'id'}
                                                optionsText={'name'}
                                                optionsResult={'name'}
                                                placeholder={'Select Module'}
                                                pathFilter={'name'}
                                            />

                                        </div>

                                        <div className="col-span-2">
                                            <label
                                                htmlFor="system_parameter_id"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`System Parameter`}
                                            </label>

                                            <SelectFormProps
                                                id={'system_parameter_id'}
                                                register={register("system_parameter_id", { required: "Select System Parameter" })}
                                                disabled={isReadOnly}
                                                valueWatch={watch("system_parameter_id") || ""}
                                                handleChange={(e) => {
                                                    setValue("system_parameter_id", e.target.value);
                                                    if (errors?.system_parameter_id) { clearErrors('system_parameter_id') }
                                                }}
                                                errors={errors?.system_parameter_id}
                                                errorsText={'Select System Parameter'}
                                                // options={subSystem?.sub_system_parameter}
                                                options={subSystem}
                                                optionsKey={'id'}
                                                optionsValue={'id'}
                                                optionsText={'name'}
                                                optionsResult={'name'}
                                                placeholder={'Select System Parameter'}
                                                pathFilter={'name'}
                                            />
                                        </div>

                                        <div >
                                            {
                                                // subSystem?.sub_system_parameter?.find((item: any) => item.id === watch("system_parameter_id"))?.name?.toLowerCase().trim()?.includes('automatic execution of') ?
                                                isNameInclude ?
                                                    <>
                                                        <label
                                                            htmlFor="value"
                                                            className="flex items-center gap-2 mb-2 text-sm font-light"
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-red-500">*</span>
                                                                {`Value`}
                                                            </div>
                                                            <CustomTooltip
                                                                title={
                                                                    isAutoExecCommercial ?
                                                                        <div>
                                                                            <p>
                                                                                <strong>รูปแบบการตั้งค่าการดึงข้อมูล:</strong> กรุณากรอกข้อมูลในรูปแบบ <code>HH:MM, HH:MM</code> โดยมีรายละเอียดดังนี้:
                                                                            </p>
                                                                            <ul>
                                                                                <li>
                                                                                    <strong>HH (ชั่วโมงที่ execute):</strong> กำหนดว่าระบบจะทำงาน <strong>ตอนชั่วโมงที่เท่าไร</strong> (เช่น <code>1</code> สำหรับตี 1, <code>6</code> สำหรับ 6 โมงเช้า.)
                                                                                </li>
                                                                                <li>
                                                                                    <strong>MM (นาทีที่ execute):</strong> กำหนดว่าระบบจะเริ่มทำงานที่ <strong>นาทีที่เท่าไรของชั่วโมงนั้นๆ</strong> (เช่น <code>0</code> สำหรับนาทีที่ 00, <code>15</code> สำหรับนาทีที่ 15)
                                                                                </li>
                                                                                <li>
                                                                                    <strong>, (ใช้สำหรับเป็นตัวคั่นในกรณีที่ต้องการใส่มากกว่า 1 เวลา):</strong>
                                                                                </li>
                                                                            </ul>
                                                                            <p>
                                                                                <strong>ตัวอย่าง:</strong> ถ้าคุณกรอก <code>03:15,11:30</code> หมายถึง:
                                                                            </p>
                                                                            <ul>
                                                                                <li>ระบบจะทำงานตอน <strong>3 นาฬิกา 15 นาที</strong></li>
                                                                                <li>และ <strong>11 นาฬิกา 30 นาที</strong> ของทุกวัน</li>
                                                                                <li>ข้อมูลจะถูกดึงไป <strong>จนถึงเมื่อวาน</strong></li>
                                                                                <li>และจะดึงข้อมูลย้อนหลังไปอีก <strong>3 วัน</strong> จากเมื่อวาน</li>
                                                                                <li>เช่นวันนี้คือวันที่ 10 มิถุนายน 2566 จะการเป็นเริ่มดึงข้อมูลตั้งแต่วันที่ 6 มิถุนายน 2566 ถึงวันที่ 9 มิถุนายน 2566</li>
                                                                            </ul>
                                                                        </div>
                                                                        :
                                                                        <div>
                                                                            <p>
                                                                                <strong>รูปแบบการตั้งค่าการดึงข้อมูล:</strong> กรุณากรอกข้อมูลในรูปแบบ <code>HH,MM,LP,ND</code> โดยมีรายละเอียดดังนี้:
                                                                            </p>
                                                                            <ul>
                                                                                <li>
                                                                                    <strong>HH (ชั่วโมงที่ execute):</strong> กำหนดว่าระบบจะทำงาน <strong>ทุกๆ กี่ชั่วโมง</strong> (เช่น <code>1</code> สำหรับทุก 1 ชม., <code>6</code> สำหรับทุก 6 ชม.)
                                                                                </li>
                                                                                <li>
                                                                                    <strong>MM (นาทีที่ execute):</strong> กำหนดว่าระบบจะเริ่มทำงานที่ <strong>นาทีที่เท่าไรของชั่วโมงนั้นๆ</strong> (เช่น <code>0</code> สำหรับนาทีที่ 00, <code>15</code> สำหรับนาทีที่ 15)
                                                                                </li>
                                                                                {/* <li>
                                                                                    <strong>LP (ระยะเวลาดึงย้อนหลัง):</strong> กำหนดว่าระบบจะดึงข้อมูลย้อนหลังไป <strong>เป็นระยะเวลากี่วัน</strong> นับจากวันที่ที่ระบุในส่วน ND (เช่น <code>3</code> สำหรับย้อนหลัง 3 วัน, <code>6</code> สำหรับย้อนหลัง 6 วัน)
                                                                                </li>
                                                                                <li>
                                                                                    <strong>ND (ดึงข้อมูลถึงวันที่):</strong> กำหนดว่าข้อมูลจะถูกดึงไป <strong>ถึงวันที่ย้อนหลังนับจากวันนี้ไปกี่วัน</strong> (เช่น <code>01</code> สำหรับ 1 วันที่แล้ว, <code>07</code> สำหรับ 7 วันที่แล้ว)
                                                                                </li> */}
                                                                                {/* https://app.clickup.com/t/9018502823/86eub6d17 */}
                                                                                <li>
                                                                                    <strong>LP (ดึงข้อมูลถึงวันที่):</strong> กำหนดว่าข้อมูลจะถูกดึงไป <strong>ถึงวันที่ย้อนหลังนับจากวันนี้ไปกี่วัน</strong> (เช่น <code>01</code> สำหรับ 1 วันที่แล้ว, <code>07</code> สำหรับ 7 วันที่แล้ว)
                                                                                </li>
                                                                                <li>
                                                                                    <strong>ND (ระยะเวลาดึงย้อนหลัง):</strong> กำหนดว่าระบบจะดึงข้อมูลย้อนหลังไป <strong>เป็นระยะเวลากี่วัน</strong> นับจากวันที่ที่ระบุในส่วน ND (เช่น <code>3</code> สำหรับย้อนหลัง 3 วัน, <code>6</code> สำหรับย้อนหลัง 6 วัน)
                                                                                </li>
                                                                            </ul>
                                                                            <p>
                                                                                <strong>ตัวอย่าง:</strong> ถ้าคุณกรอก <code>03,15,03,02</code> หมายถึง:
                                                                            </p>
                                                                            <ul>
                                                                                <li>ระบบจะทำงาน <strong>ทุกๆ 3 ชั่วโมง</strong></li>
                                                                                <li>โดยทำงานที่ <strong>นาทีที่ 15</strong> ของทุกรอบ</li>
                                                                                <li>ข้อมูลจะถูกดึงไป <strong>จนถึง 2 วันที่แล้ว</strong></li>
                                                                                <li>และจะดึงข้อมูลย้อนหลังไปอีก <strong>3 วัน</strong> จากวันนั้น</li>
                                                                                {/* <li>เช่นวันนี้คือวันที่ 10 มิถุนายน 2566 จะการเป็นเริ่มดึงข้อมูลตั้งแต่วันที่ 5 มิถุนายน 2566 ถึงวันที่ 8 มิถุนายน 2566</li> */}
                                                                                {/* https://app.clickup.com/t/9018502823/86eub6d17 */}
                                                                                <li>เช่นวันนี้คือวันที่ 10 มิถุนายน 2566 จะการเป็นเริ่มดึงข้อมูลตั้งแต่วันที่ 5 มิถุนายน 2566 (LP) ถึงวันที่ 8 มิถุนายน 2566 (ND)</li>
                                                                            </ul>
                                                                        </div>
                                                                }
                                                                placement="top-end"
                                                                arrow
                                                            >
                                                                <span className="w-[20px] h-[20px] flex items-center justify-center border border-[#B6B6B6] rounded-lg">
                                                                    <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                                                                </span>
                                                            </CustomTooltip>
                                                        </label>

                                                        <input
                                                            id="value"
                                                            // placeholder={isAutoExecCommercial ? "(Ex: 3,15,2,3)" : "(Ex: 04:30, 07:30)"}
                                                            placeholder={isAutoExecCommercial ? "(Ex: 04:30, 07:30)" : "(Ex: 3,15,2,3)"} // https://app.clickup.com/t/86ex4r6aq
                                                            value={watch("value")}
                                                            readOnly={isReadOnly}
                                                            type="text"
                                                            {...register("value", { required: "Type value" })}
                                                            className={`${inputClass} ${errors.value && "border-red-500"} ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                        />

                                                    </>
                                                    :
                                                    <>
                                                        <label
                                                            htmlFor="value"
                                                            className="block mb-2 text-sm font-light"
                                                        >
                                                            {
                                                                watch('system_parameter_id') !== 47 ? // 47 == PMIS Graphic Redirect URL
                                                                    <span className="text-red-500">*</span>
                                                                    : <></>
                                                            }
                                                            {`Value`}
                                                        </label>
                                                        <NumericFormat
                                                            id="value"
                                                            placeholder="Enter Value"
                                                            value={watch("value")}
                                                            readOnly={isReadOnly}
                                                            {...register("value", { required: watch('system_parameter_id') !== 47 ? "Type value" : false })}
                                                            className={`${inputClass} ${errors.value && "border-red-500"} ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                            thousandSeparator={true}
                                                            decimalScale={4}
                                                            fixedDecimalScale={true}
                                                            allowNegative={false}
                                                            displayType="input"
                                                            onValueChange={(values) => {
                                                                const { value } = values;
                                                                setValue("value", value, { shouldValidate: true, shouldDirty: true });
                                                            }}
                                                        />

                                                    </>
                                            }
                                            {errors.value && (<p className="text-red-500 text-sm">{`Enter value`}</p>)}
                                        </div>

                                        <div >
                                            <label
                                                htmlFor="link"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                {`Link`}
                                            </label>
                                            <input
                                                id="link"
                                                type="text"
                                                placeholder="Enter Link"
                                                // readOnly={isReadOnly}
                                                readOnly={isReadOnly && mode === "view" ? true : false}
                                                // {...register("link", {required: "Type Link",})}
                                                {...register("link")}
                                                className={`${inputClass} ${errors.link && "border-red-500"}  ${isReadOnly && mode === "view" && '!bg-[#EFECEC]'}`}
                                            />
                                            {/* {errors.link && (<p className="text-red-500 text-sm">{`Type Link`}</p>)} */}
                                        </div>

                                        <div className="pb-2">
                                            <label className={labelClass}>
                                                <span className="text-red-500">*</span>
                                                {`Start Date`}
                                            </label>

                                            <DatePickaForm
                                                {...register('start_date', { required: "Select start date" })}
                                                readOnly={isReadOnly}
                                                placeHolder="Select Start Date"
                                                mode={mode}
                                                valueShow={watch("start_date") && dayjs(watch("start_date")).format("DD/MM/YYYY")}
                                                // min={formattedStartDate || undefined}
                                                min={new Date()}
                                                maxNormalForm={watch('end_date') && watch('end_date')} // ไม่ให้ start_date เกิน end_date
                                                allowClear
                                                isError={errors.start_date && !watch("start_date") ? true : false}
                                                onChange={(e: any) => { setValue('start_date', formatFormDate(e)), e == undefined && setValue('start_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                            />
                                            {errors.start_date && !watch("start_date") && <p className={`${textErrorClass}`}>{'Select Start Date'}</p>}
                                        </div>

                                        <div className="pb-2">
                                            <label className={labelClass}>{`End Date`}</label>
                                            <DatePickaForm
                                                {...register('end_date')}
                                                // readOnly={!formattedStartDate ? true : isReadOnly}
                                                readOnly={!formattedStartDate ? true : (isReadOnly && mode === "view")}
                                                placeHolder="Select End Date"
                                                mode={mode}
                                                // min={formattedStartDate || undefined}
                                                min={getMinDate(formattedStartDate)}
                                                valueShow={watch("end_date") ? dayjs(watch("end_date")).format("DD/MM/YYYY") : undefined}
                                                allowClear
                                                onChange={(e: any) => { setValue('end_date', formatFormDate(e)), e == undefined && setValue('end_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                            />
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
                                                {mode === "create" ? "Add" : "Save"}
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
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
