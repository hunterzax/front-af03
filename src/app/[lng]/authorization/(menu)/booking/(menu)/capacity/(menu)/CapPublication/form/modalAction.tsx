import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { formatFormDate } from "@/utils/generalFormatter";
import { NumericFormat } from "react-number-format";
import DatePickaForm from "@/components/library/dateRang/dateSelectForm";
import dayjs from "dayjs";
import Spinloading from "@/components/other/spinLoading";
import SelectFormProps from "@/components/other/selectProps";

type FormData = {
    area_id: string;
    zone_id: string;
    avaliable_capacitor_d: string;
    start_date: Date;
    end_date: Date;
};

type FormExampleProps = {
    mode?: "create" | "edit" | "view";
    data?: Partial<FormData>;
    open: boolean;
    zoneMasterData: any;
    areaMasterData: any;
    entryExitMasterData: any;
    onClose: () => void;
    onSubmit: SubmitHandler<FormData>;
    setResetForm: (reset: () => void) => void;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode = "create",
    data = {},
    zoneMasterData = {},
    areaMasterData = {},
    entryExitMasterData = {},
    open,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const { control, register, handleSubmit, setValue, reset, clearErrors, formState: { errors }, watch } = useForm<any>({ defaultValues: data });

    const labelClass = "block mb-2 text-sm font-light";
    const inputClass = "text-[14px] block md:w-full p-2 ps-5 pe-10 hover:!p-2 hover:!ps-5 hover:!pe-10 focus:!p-2 focus:!ps-5 focus:!pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"
    const textErrorClass = "text-red-500 text-sm";

    const isReadOnly = mode === "view";
    const formattedStartDate = new Date();

    const [tmpData, setTmpData] = useState(data);
    const [areaMaster, setAreaMaster] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const flatArea = entryExitMasterData?.flatMap((entryExit: any) => entryExit.area);

    const [zoneMaster, setZoneMaster] = useState<any>(zoneMasterData);
    const [zoneMasterOptions, setzoneMasterOptions] = useState<any>(); // ใช้ในการ filter item แบบ input
    const [areaMasterOptions, setareaMasterOptions] = useState<any>(); // ใช้ในการ filter item แบบ input
    const [tk, settk] = useState<boolean>(true); //tricker

    useEffect(() => {
        //clear before use modal
        clearErrors();
        setzoneMasterOptions(undefined);
        setareaMasterOptions(undefined);

        setValue('start_date', null)

        if (mode == 'create') {
            // setValue('start_date', '');
            // setValue('end_date', '');
        } else if (mode === "edit" || mode === "view") {
            setIsLoading(true);
            // const formattedStartDate: any = formatFormDate(tmpData?.start_date);
            // const formattedEndDate: any = formatFormDate(data?.end_date);
            let formattedEndDate: any = 'Invalid Date'
            if (tmpData?.end_date !== null) {
                formattedEndDate = formatFormDate(tmpData?.end_date);
            }
            setValue("end_date", formattedEndDate);

            setTimeout(() => {
                if (tmpData) { setIsLoading(false); }
            }, 300);
        }
        setIsLoading(false);

    }, [data, mode, setValue, tmpData]);

    useEffect(() => {
        setResetForm(() => reset);
        setValue('start_date', '');
        setValue('end_date', '');
    }, [reset, setResetForm]);

    return (
        <Dialog open={open} onClose={onClose} className="relative z-20">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
            />
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <Spinloading spin={isLoading} rounded={0} />
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
                                        setIsLoading(true);
                                        setTimeout(async () => {
                                            await onSubmit(data);
                                        }, 1000);
                                    })}
                                    className="bg-white p-8 rounded-[20px] shadow-lg max-w"
                                >

                                    <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-2">{mode == "create" ? `Adjust Available Capacity` : mode == "edit" ? "Edit Available Capacity" : "View Available Capacity"}</h2>
                                    <div className="grid grid-cols-2 gap-2 pt-4">

                                        <div>
                                            <label htmlFor="entry_exit_id" className={labelClass}>
                                                <span className="text-red-500">*</span>{`Entry/Exit`}
                                            </label>

                                            <SelectFormProps
                                                id={'entry_exit_id'}
                                                register={register("entry_exit_id", { required: "Select Entry/Exit" })}
                                                disabled={isReadOnly}
                                                valueWatch={watch("entry_exit_id") || ""}
                                                handleChange={(e) => {
                                                    setValue("entry_exit_id", e.target.value);
                                                    setValue('zone_id', '')
                                                    setValue('area_id', '')
                                                    setAreaMaster([]);
                                                    setareaMasterOptions([]);
                                                    const filteredZone: any = zoneMaster?.filter((item: any) => item?.entry_exit?.id == e.target.value);
                                                    setzoneMasterOptions(filteredZone);
                                                    if (errors?.entry_exit_id) { clearErrors('entry_exit_id') }
                                                }}
                                                errors={errors?.entry_exit_id}
                                                errorsText={'Select Entry/Exit'}
                                                options={entryExitMasterData}
                                                optionsKey={'id'}
                                                optionsValue={'id'}
                                                optionsText={'name'}
                                                optionsResult={'name'}
                                                placeholder={'Select Entry/Exit'}
                                                pathFilter={'name'}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="zone_id"
                                                className={labelClass}
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
                                                    const filteredArea = flatArea.filter((item: any) => item.zone_id === e.target.value);
                                                    setAreaMaster(filteredArea)
                                                    setareaMasterOptions(filteredArea);

                                                    setValue('area_id', '')
                                                    setValue("zone_id", e.target.value);
                                                    if (errors?.zone_id) { clearErrors('zone_id') }
                                                }}
                                                errors={errors?.zone_id}
                                                errorsText={'Select Zone'}
                                                options={zoneMasterOptions}
                                                optionsKey={'id'}
                                                optionsValue={'id'}
                                                optionsText={'name'}
                                                optionsResult={'name'}
                                                placeholder={'Select Zone'}
                                                pathFilter={'name'}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="area_id"
                                                className={labelClass}
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Area`}
                                            </label>

                                            <SelectFormProps
                                                id={'area_id'}
                                                register={register("area_id", { required: "Select Area" })}
                                                disabled={isReadOnly}
                                                valueWatch={watch("area_id") || ""}
                                                handleChange={(e) => {
                                                    setValue("area_id", e.target.value);
                                                    if (errors?.area_id) { clearErrors('area_id') }
                                                }}
                                                errors={errors?.area_id}
                                                errorsText={'Select Area'}
                                                options={areaMasterOptions}
                                                optionsKey={'id'}
                                                optionsValue={'id'}
                                                optionsText={'name'}
                                                optionsResult={'name'}
                                                placeholder={'Select Area'}
                                                pathFilter={'name'}
                                            />
                                        </div>

                                        <div >
                                            <label
                                                htmlFor="avaliable_capacitor_d"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Available Capacity (MMBTU/D)`}
                                            </label>
                                            <NumericFormat
                                                id="avaliable_capacitor_d"
                                                // placeholder="Enter Gas Day"
                                                placeholder="0.000"
                                                value={watch("avaliable_capacitor_d")}
                                                readOnly={isReadOnly}
                                                {...register("avaliable_capacitor_d", { required: "Type Available Capacity" })}
                                                // className={`${inputClass} ${errors.avaliable_capacitor_d && "border-red-500"} ${isReadOnly && '!bg-[#EFECEC]'} `}
                                                className={`${inputClass} ${errors.avaliable_capacitor_d && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                thousandSeparator={true}
                                                decimalScale={3}
                                                fixedDecimalScale={false}
                                                allowNegative={false}
                                                displayType="input"
                                                onValueChange={(values) => {
                                                    const { value } = values;
                                                    setValue("avaliable_capacitor_d", value, { shouldValidate: true, shouldDirty: true });
                                                }}
                                            />
                                            {errors.avaliable_capacitor_d && (<p className="text-red-500 text-sm">{`Type Available Capacity`}</p>)}
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
                                                valueShow={dayjs(watch("start_date")).format("DD/MM/YYYY")}
                                                // min={formattedStartDate || undefined}
                                                min={new Date()}
                                                termMaxDate={tmpData?.end_date ? formatFormDate(tmpData.end_date) : undefined}
                                                isEndDate={watch("end_date") ? true : false}
                                                // valueShow={watch("start_date")}
                                                allowClear
                                                isError={errors.start_date && !watch("start_date") ? true : false}
                                                onChange={(e: any) => {
                                                    setValue('start_date', formatFormDate(e)), e == undefined && setValue('start_date', null, { shouldValidate: true, shouldDirty: true });
                                                    // setTmpData({
                                                    //     ...tmpData,
                                                    //     start_date: e == undefined ? null : formatFormDate(e)
                                                    // })
                                                }}
                                            />
                                            {errors.start_date && !watch("start_date") && <p className={`${textErrorClass}`}>{'Select Start Date'}</p>}
                                        </div>

                                        <div className="pb-2">
                                            <label className={labelClass}>
                                                <span className="text-red-500">*</span>
                                                {`End Date`}
                                            </label>
                                            <DatePickaForm
                                                {...register('end_date', { required: "Select end date" })}
                                                readOnly={!watch('start_date') ? true : isReadOnly}
                                                placeHolder="Select End Date"
                                                mode={mode}
                                                min={watch('start_date') ? formatFormDate(watch('start_date')) : formattedStartDate || undefined}
                                                valueShow={watch("end_date") ? dayjs(watch("end_date")).format("DD/MM/YYYY") : undefined}
                                                allowClear
                                                isError={errors.end_date && !watch("end_date") ? true : false}
                                                onChange={(e: any) => {
                                                    setValue('end_date', formatFormDate(e)), e == undefined && setValue('end_date', null, { shouldValidate: true, shouldDirty: true });
                                                    // setTmpData({
                                                    //     ...tmpData,
                                                    //     end_date: e == undefined ? null : formatFormDate(e)
                                                    // })
                                                }}
                                            />
                                            {errors.end_date && !watch("end_date") && <p className={`${textErrorClass}`}>{'Select End Date'}</p>}

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
    );
};

export default ModalAction;