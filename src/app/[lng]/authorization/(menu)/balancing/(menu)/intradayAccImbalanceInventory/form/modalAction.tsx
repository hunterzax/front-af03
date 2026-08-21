import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { checkExceedTime, formatFormDate } from "@/utils/generalFormatter";
import DatePickaForm from "@/components/library/dateRang/dateSelectForm";
import dayjs from "dayjs";
import { map60mins, map24hour } from "../../../../dam/(menu)/parameters/data";
import SelectFormProps from "@/components/other/selectProps";
import ModalComponent from "@/components/other/ResponseModal";

type FormExampleProps = {
    mode?: "create" | "edit" | "view";
    data?: Partial<any>;
    open: boolean;
    termTypeMasterData: any
    zoneMasterData: any
    dataModeZone?: any
    onClose: () => void;
    onSubmit: SubmitHandler<any>;
    setResetForm: (reset: () => void) => void;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode = "create",
    data = {},
    termTypeMasterData = {},
    zoneMasterData = {},
    dataModeZone,
    open,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const { control, register, handleSubmit, setValue, clearErrors, reset, formState: { errors }, watch } = useForm<any>({ defaultValues: data });

    const labelClass = "block mb-2 text-sm font-light";
    const textErrorClass = "text-red-500 text-sm";

    const isReadOnly = mode === "view";
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);

    const [filteredMap24hour, setFilteredMap24hour] = useState<any>(map24hour)
    const [filteredMap15mins, setFilteredMap15mins] = useState<any>(map60mins)

    useEffect(() => {
        if (mode === "edit" || mode === "view") {
            const formattedStartDate: any = formatFormDate(data?.start_date);

            setValue("mode", data?.mode || "");
            setValue("zone_id", data?.zone_id || "");
            setValue("start_date", formattedStartDate);
        }
    }, [data, mode, setValue]);

    useEffect(() => {
        const today = dayjs().format("YYYY-MM-DD");
        const today2 = new Date();
        const gasDay = watch("start_date");
        const currentHour = today2.getHours();
        const currentMinutes = today2.getMinutes();

        const isToday = gasDay === today;

        if (isToday) {

            // Remove the current hour if minutes are past 59
            const filteredHours = currentMinutes > 59
                ? map24hour.filter(hour => hour.id > currentHour) // Exclude current hour
                : map24hour.filter(hour => hour.id >= currentHour); // Keep current hour

            setFilteredMap24hour(filteredHours);

            if (watch('hour') == currentHour) {
                // setFilteredMap15mins(map60mins?.filter(min => parseInt(min.name) > (Math.floor(currentMinutes / 15) * 15)));
                setFilteredMap15mins(map60mins?.filter(min => parseInt(min.name) > (Math.floor(currentMinutes))));
            } else {
                setFilteredMap15mins(map60mins);
            }
        } else {
            setFilteredMap24hour(map24hour);
            setFilteredMap15mins(map60mins);
        }
    }, [watch("start_date"), watch("hour")]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

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
                            <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-md ">
                                <form
                                    // onSubmit={handleSubmit(onSubmit)}
                                    onSubmit={handleSubmit(async (data) => { // clear state when submit
                                        // setisLoading(true);

                                        // Change Mode/Zone : กรณีที่จังหวะที่จะกด add มันเลยเวลาที่เลือกมาแล้ว ระบบต้องแจ้ง error ไม่สามารถ add ได้ https://app.clickup.com/t/86eudau9a
                                        // Change Mode/Zone exceeds the selected time. Please select the next time period.
                                        // const message = checkExceedTime(data.hour, data.minute);
                                        const message = checkExceedTime(watch("start_date"), data.hour, data.minute); // เพิ่มจับจากวันที่ด้วย
                                        if (message) {
                                            setModalErrorMsg(message);
                                            setModalErrorOpen(true);
                                        } else {
                                            setTimeout(async () => {
                                                await onSubmit(data);
                                            }, 200);
                                        }
                                    })}
                                    className="bg-white p-8 rounded-[20px] shadow-lg max-w w-[750px]"
                                >
                                    <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-5">{mode == "create" ? `Change Mode/Zone Base Inventory` : mode == "edit" ? "Edit Mode/Zone Base Inventory" : "View Mode/Zone Base Inventory"}</h2>
                                    {/* <div className="grid grid-cols-[200px_400px_400px] gap-4"> */}
                                    <div className="grid grid-cols-2 gap-4">

                                        <div>
                                            <label
                                                htmlFor="zone_id"
                                                className="block text-[16px] font-light text-[#58585A]"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Zone`}
                                            </label>
                                            <SelectFormProps
                                                id={'zone_id'}
                                                register={register("zone_id", { required: "Select Zone" })}
                                                disabled={isReadOnly}
                                                valueWatch={watch("zone_id") || ""}
                                                handleChange={(e) => {
                                                    setValue("zone_id", e.target.value);
                                                    if (errors?.zone_id) { clearErrors('zone_id') }
                                                }}
                                                errors={errors?.zone_id}
                                                errorsText={'Select Zone'}
                                                options={zoneMasterData.filter((zone: any) => zone.zone_name === "EAST" || zone.zone_name === "WEST")}
                                                optionsKey={'zone_name'}
                                                optionsValue={'zone_name'}
                                                optionsText={'zone_name'}
                                                optionsResult={'zone_name'}
                                                placeholder={'Select Zone'}
                                                pathFilter={'zone_name'}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="mode"
                                                className="block  text-[16px] font-light text-[#58585A]"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Mode`}
                                            </label>
                                            <SelectFormProps
                                                id={'mode'}
                                                register={register("mode", { required: "Select Mode" })}
                                                disabled={isReadOnly}
                                                valueWatch={watch("mode") || ""}
                                                handleChange={(e) => {
                                                    setValue("mode", e.target.value);
                                                    if (errors?.mode) { clearErrors('mode') }
                                                }}
                                                errors={errors?.mode}
                                                errorsText={'Select Mode'}
                                                options={dataModeZone?.filter((item: any) => item?.zone?.name == watch('zone_id'))}
                                                optionsKey={'id'}
                                                optionsValue={'id'}
                                                optionsText={'mode'}
                                                optionsResult={'mode'}
                                                placeholder={'Select Mode'}
                                                pathFilter={'mode'}
                                            />
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
                                                onChange={(e: any) => {
                                                    setValue('start_date', formatFormDate(e)), e == undefined && setValue('start_date', null, { shouldValidate: true, shouldDirty: true });
                                                    setValue("hour", null);
                                                    setValue("minute", null);
                                                }}
                                            />
                                            {errors.start_date && !watch("start_date") && <p className={`${textErrorClass}`}>{'Select Start Date'}</p>}
                                        </div>

                                        <div>
                                            <label htmlFor="hour" className="block mb-2 text-sm font-light">
                                                <span className="text-red-500">*</span>
                                                {`Time`}
                                            </label>

                                            <div className="flex gap-2">
                                                <div className="w-[50%]">
                                                    <SelectFormProps
                                                        id={'hour'}
                                                        register={register("hour", { required: "Select Hour" })}
                                                        disabled={isReadOnly}
                                                        valueWatch={watch("hour") || ""}
                                                        handleChange={(e) => {
                                                            setValue("hour", e.target.value);
                                                            if (errors?.hour) { clearErrors('hour') }
                                                        }}
                                                        errors={errors?.hour}
                                                        errorsText={'Select Hour'}
                                                        options={filteredMap24hour}
                                                        optionsKey={'name'}
                                                        optionsValue={'name'}
                                                        // optionsKey={'id'}
                                                        // optionsValue={'id'}
                                                        optionsText={'name'}
                                                        optionsResult={'name'}
                                                        placeholder={'Select Hour'}
                                                        pathFilter={'name'}
                                                    />
                                                </div>

                                                <div className="w-[50%]">
                                                    <SelectFormProps
                                                        id={'minute'}
                                                        register={register("minute", { required: "Select Minute" })}
                                                        disabled={isReadOnly}
                                                        valueWatch={watch("minute") || ""}
                                                        handleChange={(e) => {
                                                            setValue("minute", e.target.value);
                                                            if (errors?.minute) { clearErrors('minute') }
                                                        }}
                                                        errors={errors?.minute}
                                                        errorsText={'Select Minute'}
                                                        options={filteredMap15mins}
                                                        optionsKey={'id'}
                                                        optionsValue={'name'}
                                                        optionsText={'name'}
                                                        optionsResult={'name'}
                                                        placeholder={'Select Minute'}
                                                        pathFilter={'name'}
                                                    />
                                                </div>
                                            </div>

                                            {/* {errors.hour && (<p className="text-red-500 text-sm">{`Select Time`}</p>)} */}
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
                                                className="w-[167px] font-semibold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                            >
                                                {/* {mode === "create" ? "Save" : "Save"} */}
                                                {'Add'}
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

        <ModalComponent
            open={isModalErrorOpen}
            handleClose={() => {
                setModalErrorOpen(false);
                // if (resetForm) resetForm();
            }}
            title="Failed"
            description={
                <div>
                    <div className="text-center">
                        {`${modalErrorMsg}`}
                    </div>
                </div>
            }
            stat="error"
        />

    </>

    );
};

export default ModalAction;
