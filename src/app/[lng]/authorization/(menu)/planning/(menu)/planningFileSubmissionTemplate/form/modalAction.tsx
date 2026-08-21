import React from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { formatFormDate, formatWatchFormDate, getMinDate } from "@/utils/generalFormatter";
import DatePickaForm from "@/components/library/dateRang/dateSelectForm";
import dayjs from "dayjs";
import Spinloading from "@/components/other/spinLoading";
import CustomSelectMulti from "@/components/other/selectBoxMultiForm";
import SelectFormProps from "@/components/other/selectProps";

type FormData = {
    planning_file_submission_template_nom: any;
    group_id: any;
    term_type_id: any;
    start_date: Date;
    end_date: Date | null;
    id: any;
};

type FormExampleProps = {
    mode?: "create" | "edit" | "view";
    data?: Partial<FormData>;
    open: boolean;
    dataTable?: any;
    termTypeMasterData: any;
    shipperGroupData: any;
    nominationPointData: any;
    entryExitMasterData: any[];
    onClose: () => void;
    onSubmit: SubmitHandler<FormData>;
    setResetForm: (reset: () => void) => void;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode,
    data = {},
    dataTable = {},
    nominationPointData = [],
    entryExitMasterData = [],
    termTypeMasterData = [],
    shipperGroupData = [],
    open,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const { control, register, handleSubmit, setValue, reset, formState: { errors }, watch, clearErrors } = useForm<any>({ defaultValues: data });

    const labelClass = "block mb-2 text-[16px] font-light";
    const textErrorClass = "text-red-500 text-[16px]";

    const isReadOnly = (mode === "view");
    const startDate = watch("start_date");
    const formattedStartDate = formatWatchFormDate(startDate);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedValues, setSelectedValues] = useState<any>([]);

    const getIdsByType = (type: "1" | "2") => nominationPointData?.filter((item: any) => `${item.entry_exit_id}` === type)?.map((item: any) => item.id);

    const entryIds = getIdsByType("1");
    const exitIds = getIdsByType("2");
    // console.log('entryIds : ', entryIds);
    // console.log('exitIds : ', exitIds);
    const getSelectedByType = (typeIds: any[]) =>
    (selectedValues || []).filter((id: any) => typeIds.includes(id));

    const mergeSelectedByType = (newValues: any[], typeIds: any[]) => {
        const otherValues = (selectedValues || []).filter(
            (id: any) => !typeIds.includes(id)
        );

        const mergedValues = [...otherValues, ...newValues];

        setSelectedValues(mergedValues);
        setValue("nomination_point", mergedValues);
        clearErrors("nomination_point");
    };
    console.log('mode ; ', mode);
    useEffect(() => {
        const fetchAndSetData = async () => {
            if (mode == "create") {
                await reset();
                setIsLoading(false);
            }
            if (mode === "edit" || mode === "view") {
                console.log('...');
                setIsLoading(true);
                await reset();
                console.log('data : ', data);
                const formattedStartDate: any = formatFormDate(data?.start_date);
                console.log('..1');
                // const formattedEndDate: any = formatFormDate(data?.end_date);
                let formattedEndDate: any = 'Invalid Date'
                if (data?.end_date !== null) {
                    formattedEndDate = formatFormDate(data?.end_date);
                }
                console.log('..2');
                setValue("start_date", formattedStartDate);
                setValue("end_date", formattedEndDate);
                setValue("term_type_id", data?.term_type_id || "");
                setValue("group_id", data?.group_id || "");
                // const nominationPointIds = data?.planning_file_submission_template_nom.map((item: any) => item.nomination_point_id);
                console.log('nominationPointIdsEntry : 1');
                const nominationPointIdsEntry = data?.planning_file_submission_template_nom?.filter((item: any) => `${item?.nomination_point?.entry_exit_id}` === `1`)?.map((item: any) => item.nomination_point_id);
                console.log('nominationPointIdsEntry : ', nominationPointIdsEntry);
                const nominationPointIdsExit = data?.planning_file_submission_template_nom?.filter((item: any) => `${item?.nomination_point?.entry_exit_id}` === `2`)?.map((item: any) => item.nomination_point_id);
                // setValue("nomination_point", data?.planning_file_submission_template_nom || []);
                setValue("nomination_point_entry", nominationPointIdsEntry);
                setValue("nomination_point_exit", nominationPointIdsExit);
                
                setValue("id", data?.id || "");
                setSelectedValues(data?.planning_file_submission_template_nom ? data?.planning_file_submission_template_nom?.map((item: any) => item.nomination_point_id) : []);
                setTimeout(() => {
                    if (data) { setIsLoading(false); }
                }, 300);
            }
        }
        fetchAndSetData();
    }, [data, mode, setValue]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    const handleClose = async () => {
        await onClose();

        setTimeout(() => {
            setSelectedValues([]);
        }, 300);
    };

    const handleSub = async (data?: any) => {
        console.log('data : ', data);
        await onSubmit(data);
        setSelectedValues([]);
    };

    const updateValue = (fieldName: string, value: any) => {
        setValue(fieldName, value); // Update the value
        clearErrors(fieldName); // Clear the error for this field
    };


    return (
        <Dialog open={open} onClose={handleClose} className="relative z-20">
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
                            <div className="flex flex-col items-center justify-center gap-2 rounded-md ">
                                <Spinloading spin={isLoading} rounded={20} />
                                <form
                                    className="bg-white p-8 rounded-[20px] shadow-lg max-w w-[700px]"
                                    onSubmit={handleSubmit(async (data) => { // clear state when submit
                                        setIsLoading(true);
                                        await setTimeout(async () => {
                                            await handleSub(data)
                                            // await onSubmit(data);
                                        }, 100);
                                    })}
                                >
                                    <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-5">{mode == "create" ? `New Template` : mode == "edit" ? "Edit Template" : "View Template"}</h2>
                                    {/* <div className="grid grid-cols-2 gap-2 pt-4"> */}
                                    <div className={`grid grid-cols-2 gap-2 pt-4`}>

                                        <div>
                                            <label
                                                htmlFor="term_type_id"
                                                className="block mb-2 text-[16px] font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Term`}
                                            </label>

                                            <SelectFormProps
                                                id={'term_type_id'}
                                                register={register("term_type_id", { required: "Select Term" })}
                                                disabled={isReadOnly}
                                                valueWatch={watch("term_type_id") || ""}
                                                handleChange={(e) => {
                                                    updateValue("term_type_id", e.target.value);
                                                    if (errors?.term_type_id) { clearErrors('term_type_id') }
                                                }}
                                                errors={errors?.term_type_id}
                                                errorsText={'Select Term'}
                                                options={(termTypeMasterData || []).filter((item: any) => item.id !== 4)}
                                                optionsKey={'id'}
                                                optionsValue={'id'}
                                                optionsText={'name'}
                                                optionsResult={'name'}
                                                placeholder={'Select Term'}
                                                pathFilter={'name'}
                                            />

                                        </div>

                                        <div>
                                            <label
                                                htmlFor="group_id"
                                                className="block mb-2 text-[16px] font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Shipper Name`}
                                            </label>

                                            <SelectFormProps
                                                id={'group_id'}
                                                register={register("group_id", { required: "Select Shipper Name" })}
                                                disabled={isReadOnly}
                                                valueWatch={watch("group_id") || ""}
                                                handleChange={(e) => {
                                                    setValue("group_id", e.target.value);
                                                    if (errors?.group_id) { clearErrors('group_id') }
                                                }}
                                                errors={errors?.group_id}
                                                errorsText={'Select Shipper Name'}
                                                options={shipperGroupData}
                                                optionsKey={'id'}
                                                optionsValue={'id'}
                                                optionsText={'name'}
                                                optionsResult={'name'}
                                                placeholder={'Select Shipper Name'}
                                                pathFilter={'name'}
                                            />
                                        </div>

                                        {/* <div>
                                            <label
                                                htmlFor="entry_exit_id"
                                                className="block mb-2 text-[16px] font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Entry/Exit`}
                                            </label>

                                            <SelectFormProps
                                                id={'entry_exit_id'}
                                                register={register("entry_exit_id", { required: "Select Entry/Exit" })}
                                                disabled={isReadOnly}
                                                valueWatch={watch("entry_exit_id") || ""}
                                                handleChange={(e) => {
                                                    if(watch("entry_exit_id") != e.target.value){
                                                        setSelectedValues([]);
                                                    }
                                                    setValue("entry_exit_id", e.target.value);
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
                                        </div> */}

                                        <div>
                                            <label
                                                htmlFor="nomination_point_en"
                                                className="block mb-2 text-[16px] font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Nomination Point (Entry)`}
                                            </label>
{/* 
                                            <CustomSelectMulti
                                                optionData={
                                                    nominationPointData
                                                    .filter((item: any) => `${item.entry_exit_id}` === `1` )
                                                    .sort((a: any, b: any) => a.nomination_point.localeCompare(b.nomination_point))
                                                }
                                                selectedValues={selectedValues}
                                                // selectedValues={(selectedValues || [])?.filter((f:any) => (nominationPointData.filter((item: any) => `${item.entry_exit_id}` === `1` )?.map((m:any) => m?.id) || [])?.includes(f))}
                                                onChange={setSelectedValues}
                                                isReadOnly={isReadOnly}
                                                control={control}
                                                name="nomination_point"
                                                error={!!errors.nomination_point}
                                                register={register}
                                                errorMsg="Select Nomination Point (Entry)"
                                                placeHolder="Select Nomination Point (Entry)"
                                            /> */}
                                            
                                            <CustomSelectMulti
                                                optionData={nominationPointData
                                                    .filter((item: any) => `${item.entry_exit_id}` === `1`)
                                                    .sort((a: any, b: any) =>
                                                    a.nomination_point.localeCompare(b.nomination_point)
                                                    )}
                                                selectedValues={getSelectedByType(entryIds)}
                                                onChange={(values: any[]) => mergeSelectedByType(values, entryIds)}
                                                isReadOnly={isReadOnly}
                                                control={control}
                                                name="nomination_point_entry"
                                                error={!!errors.nomination_point}
                                                register={register}
                                                errorMsg="Select Nomination Point (Entry)"
                                                placeHolder="Select Nomination Point (Entry)"
                                                />

                                        </div>
                                        
                                        <div>
                                            <label
                                                htmlFor="nomination_point_ex"
                                                className="block mb-2 text-[16px] font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Nomination Point (Exit)`}
                                            </label>

                                            {/* <CustomSelectMulti
                                                optionData={
                                                    nominationPointData
                                                    .filter((item: any) => `${item.entry_exit_id}` === `2` )
                                                    .sort((a: any, b: any) => a.nomination_point.localeCompare(b.nomination_point))
                                                }
                                                selectedValues={selectedValues}
                                                // selectedValues={(selectedValues || [])?.filter((f:any) => (nominationPointData.filter((item: any) => `${item.entry_exit_id}` === `2` )?.map((m:any) => m?.id) || [])?.includes(f))}
                                                onChange={setSelectedValues}
                                                isReadOnly={isReadOnly}
                                                control={control}
                                                name="nomination_point"
                                                error={!!errors.nomination_point}
                                                register={register}
                                                errorMsg="Select Nomination Point (Exit)"
                                                placeHolder="Select Nomination Point (Exit)"
                                            /> */}
                                            <CustomSelectMulti
                                                optionData={nominationPointData
                                                    .filter((item: any) => `${item.entry_exit_id}` === `2`)
                                                    .sort((a: any, b: any) =>
                                                    a.nomination_point.localeCompare(b.nomination_point)
                                                    )}
                                                selectedValues={getSelectedByType(exitIds)}
                                                onChange={(values: any[]) => mergeSelectedByType(values, exitIds)}
                                                isReadOnly={isReadOnly}
                                                control={control}
                                                name="nomination_point_exit"
                                                error={!!errors.nomination_point}
                                                register={register}
                                                errorMsg="Select Nomination Point (Exit)"
                                                placeHolder="Select Nomination Point (Exit)"
                                                />

                                        </div>

                                        <div className="pb-2">
                                            <label className={labelClass}>
                                                <span className="text-red-500">*</span>
                                                {`Start Date`}
                                            </label>

                                            <DatePickaForm
                                                {...register('start_date', { required: "Select start date" })}
                                                readOnly={
                                                    isReadOnly ||
                                                    (watch("start_date") &&
                                                        new Date().setHours(0, 0, 0, 0) >= new Date(watch("start_date")).setHours(0, 0, 0, 0))  // Edit : กรณีที่ข้อมูลถึงหรือเลยวันที่ Start Date ไปแล้ว ระบบจะไม่เปิดให้แก้ไขวันที่ start date เทาไปเลย https://app.clickup.com/t/86eraf2re
                                                }
                                                placeHolder="Select Start Date"
                                                mode={mode}
                                                valueShow={watch("start_date") && dayjs(watch("start_date")).format("DD/MM/YYYY")}
                                                // min={formattedStartDate || undefined}
                                                min={new Date()}
                                                maxNormalForm={watch('end_date') && watch('end_date')}
                                                // min={new Date()}
                                                allowClear
                                                isError={errors.start_date && !watch("start_date") ? true : false}
                                                onChange={(e: any) => {
                                                    setValue('start_date', formatFormDate(e)),
                                                        e == undefined && setValue('start_date', null, { shouldValidate: true, shouldDirty: true });
                                                }}
                                            />
                                            {errors.start_date && !watch("start_date") && <p className={`${textErrorClass}`}>{'Select Start Date'}</p>}
                                        </div>

                                        <div className="pb-2">
                                            <label className={labelClass}>{`End Date`}</label>
                                            <DatePickaForm
                                                {...register('end_date')}
                                                readOnly={!formattedStartDate ? true : isReadOnly}
                                                placeHolder="Select End Date"
                                                mode={mode}
                                                // min={formattedStartDate || undefined}
                                                // min={mode == 'create' ? watch("start_date") : formattedStartDate}
                                                // min={formattedStartDate}
                                                min={getMinDate(formattedStartDate)}
                                                valueShow={watch("end_date") !== null && watch("end_date") !== undefined && watch("end_date") !== "Invalid Date" ? dayjs(watch("end_date")).format("DD/MM/YYYY") : undefined}
                                                // valueShow={watch("end_date") && dayjs(watch("end_date")).format("DD/MM/YYYY")}
                                                allowClear
                                                onChange={(e: any) => { setValue('end_date', formatFormDate(e)), e == undefined && setValue('end_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-6">
                                        {mode === "view" ? (
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
                </div >
            </div >
        </Dialog >
    );
};

export default ModalAction;