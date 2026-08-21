import React from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { formatFormDate, formatWatchFormDate } from "@/utils/generalFormatter";
import { MenuItem, Select, Typography } from "@mui/material";
import { NumericFormat } from 'react-number-format';
import DatePickaForm from "@/components/library/dateRang/dateSelectForm";
import dayjs from "dayjs";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SelectFormProps from "@/components/other/selectProps";

type FormData = {
    mode: string;
    zone_id: string;
    high_difficult_day: number;
    to_high_difficult_day: number;
    high_red: number;
    to_high_red: number;
    high_orange: number;
    to_high_orange: number;
    alert_high: number;
    to_alert_high: number;
    low_orange: number;
    to_low_orange: number;
    low_red: number;
    to_low_red: number;
    low_difficult_day: number;
    to_low_difficult_day: number;
    start_date: Date;
    // end_date: Date;
};

type FormExampleProps = {
    mode?: "create" | "edit" | "view";
    data?: Partial<FormData>;
    open: boolean;
    termTypeMasterData: any
    zoneMasterData: any
    onClose: () => void;
    onSubmit: SubmitHandler<FormData>;
    setResetForm: (reset: () => void) => void;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode = "create",
    data = {},
    termTypeMasterData = {},
    zoneMasterData = {},
    open,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const { control, register, handleSubmit, setValue, reset, clearErrors, formState: { errors }, watch } = useForm<any>({ defaultValues: data });

    const labelClass = "block mb-2 text-sm font-light";
    const inputClass = "text-sm block md:w-full p-2 ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]";
    const textErrorClass = "text-red-500 text-sm";

    const isReadOnly = mode === "view";

    useEffect(() => {
        if (mode === "edit" || mode === "view") {
            const formattedStartDate: any = formatFormDate(data?.start_date);
            // const formattedEndDate: any = formatFormDate(data?.end_date);
            // if (data?.end_date !== null) {
            //     formattedEndDate = formatFormDate(data?.end_date);
            // }

            setValue("mode", data?.mode || "");
            setValue("zone_id", data?.zone_id || "");
            setValue("start_date", formattedStartDate);

            setValue("high_difficult_day", data?.high_difficult_day);
            setValue("to_high_difficult_day", data?.to_high_difficult_day);

            setValue("high_red", data?.high_red);
            setValue("to_high_red", data?.to_high_red);

            setValue("high_orange", data?.high_orange);
            setValue("to_high_orange", data?.to_high_orange);

            setValue("alert_high", data?.alert_high);
            setValue("to_alert_high", data?.to_alert_high);

            setValue("low_orange", data?.low_orange);
            setValue("to_low_orange", data?.to_low_orange);

            setValue("low_red", data?.low_red);
            setValue("to_low_red", data?.to_low_red);

            setValue("low_difficult_day", data?.low_difficult_day);
            setValue("to_low_difficult_day", data?.to_low_difficult_day);

        }
    }, [data, mode, setValue]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    return (
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
                                    onSubmit={handleSubmit(onSubmit)}
                                    className="bg-white p-8 rounded-[20px] shadow-lg max-w w-[750px]"
                                >
                                    <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-5">{mode == "create" ? `New Config Mode/Zone Base Inventory` : mode == "edit" ? "Edit Config Mode/Zone Base Inventory" : "View Config Mode/Zone Base Inventory"}</h2>
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
                                            {/* <Select
                                                id="zone_id"
                                                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                {...register("zone_id", { required: "Select Zone" })}
                                                disabled={isReadOnly}
                                                value={watch("zone_id") || ""}
                                                className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.zone_id && "border-red-500"}`}
                                                sx={{
                                                    '.MuiOutlinedInput-notchedOutline': {
                                                        // borderColor: '#DFE4EA', // Change the border color here
                                                        borderColor: errors.zone_id && !watch('zone_id') ? '#FF0000' : '#DFE4EA',
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: errors.zone_id && !watch("zone_id") ? "#FF0000" : "#d2d4d8",
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#d2d4d8',
                                                    },
                                                }}
                                                onChange={(e) => {
                                                    setValue("zone_id", e.target.value);
                                                    // fetchData(e?.target);
                                                }}
                                                displayEmpty
                                                renderValue={(value: any) => {
                                                    if (!value) {
                                                        return <Typography color="#9CA3AF" fontSize={14}>Select Zone</Typography>;
                                                    }
                                                    return zoneMasterData?.find((item: any) => item.id === value)?.name || '';
                                                }}
                                                MenuProps={{
                                                    PaperProps: {
                                                        style: {
                                                            maxHeight: 48 * 4.5 + 8, // Item height * 4.5 + padding
                                                            // width: 250, // Adjust width as needed
                                                        },
                                                    },
                                                }}
                                            >
                                                {zoneMasterData?.map((zone: any) => {
                                                    return (
                                                        <MenuItem key={zone.id} value={zone.id}>
                                                            {zone.name}
                                                        </MenuItem>
                                                    )
                                                })}
                                            </Select>
                                            {errors.zone_id && (<p className="text-red-500 text-sm">{`Select Zone`}</p>)} */}

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
                                                options={zoneMasterData}
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
                                                htmlFor="mode"
                                                className="block  text-[16px] font-light text-[#58585A]"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Mode`}
                                            </label>
                                            <input
                                                id="mode"
                                                type="text"
                                                placeholder="Enter Mode"
                                                readOnly={isReadOnly}
                                                {...register("mode")}
                                                className={`${inputClass} ${errors.mode && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                            />
                                            {errors.mode && (<p className="text-red-500 text-sm">{`Type mode`}</p>)}
                                        </div>

                                        <div className="pb-2">
                                            <label className={labelClass}>
                                                <span className="text-red-500">*</span>
                                                {`Start Date`}
                                            </label>
                                            {/* <DatePickaForm
                                                {...register('start_date', { required: "Select start date" })}
                                                readOnly={isReadOnly}
                                                placeHolder="Start Date"
                                                mode={mode}
                                                valueShow={dayjs(watch("start_date")).format("DD/MM/YYYY")}
                                                // valueShow={watch("start_date")}
                                                allowClear
                                                onChange={(e: any) => { setValue('start_date', formatFormDate(e)), e == undefined && setValue('start_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                            />
                                            {errors.start_date && (<p className={`${textErrorClass}`}>{`Select Start Date`}</p>)} */}

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

                                        <div></div>

                                        <div className="col-span-2">

                                            <div className="flex items-center space-x-4 py-2">
                                                <div className="w-[125px]">{`High Difficult Day`}</div>
                                                <div>
                                                    {/* <input
                                                        id="high_difficult_day"
                                                        type="number"
                                                        placeholder=""
                                                        readOnly={isReadOnly}
                                                        {...register("high_difficult_day")}
                                                        className={`${inputClass} ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                    /> */}
                                                    <NumericFormat
                                                        id="high_difficult_day"
                                                        value={watch("high_difficult_day")}
                                                        placeholder=""
                                                        readOnly={isReadOnly}
                                                        {...register("high_difficult_day")}
                                                        onChange={(e) => setValue("high_difficult_day", e.target.value)}
                                                        className={`${inputClass} ${errors.high_difficult_day && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                        thousandSeparator={true}
                                                        decimalScale={2}
                                                        fixedDecimalScale={true}
                                                        allowNegative={false}
                                                        displayType="input"
                                                    />
                                                </div>
                                                <div>{`To`}</div>
                                                <div>
                                                    <NumericFormat
                                                        id="to_high_difficult_day"
                                                        value={watch("to_high_difficult_day")}
                                                        placeholder=""
                                                        readOnly={isReadOnly}
                                                        {...register("to_high_difficult_day")}
                                                        onChange={(e) => setValue("to_high_difficult_day", e.target.value)}
                                                        className={`${inputClass} ${errors.to_high_difficult_day && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                        thousandSeparator={true}
                                                        decimalScale={2}
                                                        fixedDecimalScale={true}
                                                        allowNegative={false}
                                                        displayType="input"
                                                    />
                                                </div>
                                                <div>{`MMBTU`}</div>
                                            </div>

                                            <div className="flex items-center space-x-4 py-2">
                                                <div className="w-[125px]">{`High Red`}</div>
                                                <div>
                                                    <NumericFormat
                                                        id="high_red"
                                                        value={watch("high_red")}
                                                        placeholder=""
                                                        readOnly={isReadOnly}
                                                        {...register("high_red")}
                                                        onChange={(e) => setValue("high_red", e.target.value)}
                                                        className={`${inputClass} ${errors.high_red && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                        thousandSeparator={true}
                                                        decimalScale={2}
                                                        fixedDecimalScale={true}
                                                        allowNegative={false}
                                                        displayType="input"
                                                    />
                                                </div>
                                                <div>{`To`}</div>
                                                <div>
                                                    <NumericFormat
                                                        id="to_high_red"
                                                        value={watch("to_high_red")}
                                                        placeholder=""
                                                        readOnly={isReadOnly}
                                                        {...register("to_high_red")}
                                                        onChange={(e) => setValue("to_high_red", e.target.value)}
                                                        className={`${inputClass} ${errors.to_high_red && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                        thousandSeparator={true}
                                                        decimalScale={2}
                                                        fixedDecimalScale={true}
                                                        allowNegative={false}
                                                        displayType="input"
                                                    />
                                                </div>
                                                <div>{`MMBTU`}</div>
                                            </div>

                                            <div className="flex items-center space-x-4 py-2">
                                                <div className="w-[125px]">{`High Orange`}</div>
                                                <div>
                                                    <NumericFormat
                                                        id="high_orange"
                                                        value={watch("high_orange")}
                                                        placeholder=""
                                                        readOnly={isReadOnly}
                                                        {...register("high_orange")}
                                                        onChange={(e) => setValue("high_orange", e.target.value)}
                                                        className={`${inputClass} ${errors.high_orange && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                        thousandSeparator={true}
                                                        decimalScale={2}
                                                        fixedDecimalScale={true}
                                                        allowNegative={false}
                                                        displayType="input"
                                                    />
                                                </div>
                                                <div>{`To`}</div>
                                                <div>
                                                    <NumericFormat
                                                        id="to_high_orange"
                                                        placeholder=""
                                                        value={watch("to_high_orange")}
                                                        readOnly={isReadOnly}
                                                        {...register("to_high_orange")}
                                                        onChange={(e) => setValue("to_high_orange", e.target.value)}
                                                        className={`${inputClass} ${errors.to_high_orange && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                        thousandSeparator={true}
                                                        decimalScale={2}
                                                        fixedDecimalScale={true}
                                                        allowNegative={false}
                                                        displayType="input"
                                                    />
                                                </div>
                                                <div>{`MMBTU`}</div>
                                            </div>

                                            <div className="flex items-center space-x-4 py-2">
                                                <div className="w-[125px]">{`Alert High`}</div>
                                                <div>
                                                    <NumericFormat
                                                        id="alert_high"
                                                        value={watch("alert_high")}
                                                        placeholder=""
                                                        readOnly={isReadOnly}
                                                        {...register("alert_high")}
                                                        onChange={(e) => setValue("alert_high", e.target.value)}
                                                        className={`${inputClass} ${errors.alert_high && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                        thousandSeparator={true}
                                                        decimalScale={2}
                                                        fixedDecimalScale={true}
                                                        allowNegative={false}
                                                        displayType="input"
                                                    />
                                                </div>
                                                <div>{`To`}</div>
                                                <div>
                                                    <NumericFormat
                                                        id="to_alert_high"
                                                        value={watch("to_alert_high")}
                                                        placeholder=""
                                                        readOnly={isReadOnly}
                                                        {...register("to_alert_high")}
                                                        onChange={(e) => setValue("to_alert_high", e.target.value)}
                                                        className={`${inputClass} ${errors.to_alert_high && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                        thousandSeparator={true}
                                                        decimalScale={2}
                                                        fixedDecimalScale={true}
                                                        allowNegative={false}
                                                        displayType="input"
                                                    />
                                                </div>
                                                <div>{`MMBTU`}</div>
                                            </div>

                                            <div className="flex items-center space-x-4 py-2">
                                                <div className="w-[125px]">{`Low Orange`}</div>
                                                <div>
                                                    <NumericFormat
                                                        id="low_orange"
                                                        value={watch("low_orange")}
                                                        placeholder=""
                                                        readOnly={isReadOnly}
                                                        {...register("low_orange")}
                                                        onChange={(e) => setValue("low_orange", e.target.value)}
                                                        className={`${inputClass} ${errors.low_orange && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                        thousandSeparator={true}
                                                        decimalScale={2}
                                                        fixedDecimalScale={true}
                                                        allowNegative={false}
                                                        displayType="input"
                                                    />
                                                </div>
                                                <div>{`To`}</div>
                                                <div>
                                                    <NumericFormat
                                                        id="to_low_orange"
                                                        value={watch("to_low_orange")}
                                                        placeholder=""
                                                        readOnly={isReadOnly}
                                                        {...register("to_low_orange")}
                                                        onChange={(e) => setValue("to_low_orange", e.target.value)}
                                                        className={`${inputClass} ${errors.to_low_orange && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                        thousandSeparator={true}
                                                        decimalScale={2}
                                                        fixedDecimalScale={true}
                                                        allowNegative={false}
                                                        displayType="input"
                                                    />
                                                </div>
                                                <div>{`MMBTU`}</div>
                                            </div>

                                            <div className="flex items-center space-x-4 py-2">
                                                <div className="w-[125px]">{`Low Red`}</div>
                                                <div>
                                                    <NumericFormat
                                                        id="low_red"
                                                        value={watch("low_red")}
                                                        placeholder=""
                                                        readOnly={isReadOnly}
                                                        {...register("low_red")}
                                                        onChange={(e) => setValue("low_red", e.target.value)}
                                                        className={`${inputClass} ${errors.low_red && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                        thousandSeparator={true}
                                                        decimalScale={2}
                                                        fixedDecimalScale={true}
                                                        allowNegative={false}
                                                        displayType="input"
                                                    />
                                                </div>
                                                <div>{`To`}</div>
                                                <div>
                                                    <NumericFormat
                                                        id="to_low_red"
                                                        value={watch("to_low_red")}
                                                        placeholder=""
                                                        readOnly={isReadOnly}
                                                        {...register("to_low_red")}
                                                        onChange={(e) => setValue("to_low_red", e.target.value)}
                                                        className={`${inputClass} ${errors.to_low_red && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                        thousandSeparator={true}
                                                        decimalScale={2}
                                                        fixedDecimalScale={true}
                                                        allowNegative={false}
                                                        displayType="input"
                                                    />
                                                </div>
                                                <div>{`MMBTU`}</div>
                                            </div>

                                            <div className="flex items-center space-x-4 py-2">
                                                <div className="w-[125px]">{`Low Difficult Day`}</div>
                                                <div>
                                                    <NumericFormat
                                                        id="low_difficult_day"
                                                        value={watch("low_difficult_day")}
                                                        placeholder=""
                                                        readOnly={isReadOnly}
                                                        {...register("low_difficult_day")}
                                                        onChange={(e) => setValue("low_difficult_day", e.target.value)}
                                                        className={`${inputClass} ${errors.low_difficult_day && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                        thousandSeparator={true}
                                                        decimalScale={2}
                                                        fixedDecimalScale={true}
                                                        allowNegative={false}
                                                        displayType="input"
                                                    />
                                                </div>
                                                <div>{`To`}</div>
                                                <div>
                                                    <NumericFormat
                                                        id="to_low_difficult_day"
                                                        value={watch("to_low_difficult_day")}
                                                        placeholder=""
                                                        readOnly={isReadOnly}
                                                        {...register("to_low_difficult_day")}
                                                        onChange={(e) => setValue("to_low_difficult_day", e.target.value)}
                                                        className={`${inputClass} ${errors.to_low_difficult_day && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                        thousandSeparator={true}
                                                        decimalScale={2}
                                                        fixedDecimalScale={true}
                                                        allowNegative={false}
                                                        displayType="input"
                                                    />
                                                </div>
                                                <div>{`MMBTU`}</div>
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

                                        {/* <button type="submit" className="w-[167px] font-light bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
                                            Add
                                        </button> */}
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
