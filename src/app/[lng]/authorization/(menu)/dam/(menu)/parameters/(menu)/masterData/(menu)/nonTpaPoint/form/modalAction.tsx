import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { filterTodayInRangeStartEndDate, filterTodayInRangeStartEndDatetoArray, formatFormDate, formatWatchFormDate, getMinDate } from "@/utils/generalFormatter";
import DatePickaForm from "@/components/library/dateRang/dateSelectForm";
import dayjs from "dayjs";
import ModalConfirmSave from "@/components/other/modalConfirmSave";
import SelectFormProps from "@/components/other/selectProps";

type FormData = {
    non_tpa_point_name: string;
    description: string;
    area_id: string;
    nomination_point_id: string;
    start_date: Date;
    end_date: Date;
};

type FormExampleProps = {
    mode?: "create" | "edit" | "view" | "period";
    data?: Partial<FormData>;
    open: boolean;
    zoneMasterData: any;
    areaMasterData: any;
    entryExitMasterData: any;
    contractPointData: any;
    nominationPointData: any;
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
    contractPointData = {},
    nominationPointData = [],
    open,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const { control, register, handleSubmit, setValue, reset, clearErrors, formState: { errors }, watch } = useForm<any>({ defaultValues: data });

    const labelClass = "block mb-2 text-[14px] font-light"
    const inputClass = "text-[14px] block md:w-full p-2 ps-5 focus:!ps-5 hover:!ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"
    const textErrorClass = "text-red-500 text-[14px]"

    {/* Confirm Save */ }
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()

    // const isReadOnly = mode === "view";
    const isReadOnly = mode === "view" || (data?.start_date && new Date(data?.start_date) < new Date()); // 180325 Edit : ข้อมูลที่ถึงวันที่ Start Date แล้วจะไม่สามารถแก้ไขข้อมูลอะไรได้ นอกจาก End Date https://app.clickup.com/t/86erw7ah5
    const isPastStartDate = (data?.start_date && new Date(data?.start_date) < new Date());
    const startDate = watch("start_date");
    const formattedStartDate = formatWatchFormDate(startDate);
    // const [areaEntry, setAreaEntry] = useState([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchAndSetData = async () => {
            if (mode === 'create') {
                setIsLoading(false);
            }
            if (mode === "edit" || mode === "view") {

                setIsLoading(true);
                const formattedStartDate: any = formatFormDate(data?.start_date);
                let formattedEndDate: any = 'Invalid Date'
                if (data?.end_date !== null) {
                    formattedEndDate = formatFormDate(data?.end_date);
                }
                setValue("end_date", formattedEndDate);

                setValue("non_tpa_point_name", data?.non_tpa_point_name || "");
                setValue("description", data?.description || "");
                setValue("area_id", data?.area_id || "");
                setValue("nomination_point_id", data?.nomination_point_id || "");
                setValue("start_date", formattedStartDate);

                setTimeout(() => {
                    if (data) { setIsLoading(false); }
                }, 300);
            }
        }

        const regenarateNomination: any = filterTodayInRangeStartEndDatetoArray(nominationPointData);

        setnominationData(regenarateNomination)

        fetchAndSetData();
    }, [data, mode, setValue]);

    const [nominationData, setnominationData] = useState([]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    const handleClose = () => {
        onClose();
    };

    {/* Confirm Save */ }
    const handleSaveConfirm = async (data?: any) => {
        // setDataSubmit(data)
        // setModaConfirmSave(true)

        if (mode == 'create') {
            await onSubmit(data);
        } else {
            setDataSubmit(data)
            setModaConfirmSave(true)
        }
    }

    return (
        <>
            <Dialog open={open} onClose={handleClose} className="relative z-30">
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
                            <div className="flex inset-0 items-center justify-center  ">
                                <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-md">
                                    <form
                                        className="bg-white p-8 rounded-[20px] shadow-lg max-w-[1000px] w-[700px]"
                                        // onSubmit={handleSubmit(async (data) => { // clear state when submit
                                        //     setIsLoading(true);
                                        //     setTimeout(async () => {
                                        //         await onSubmit(data);
                                        //     }, 100);
                                        // })}
                                        onSubmit={handleSubmit(handleSaveConfirm)}

                                    >
                                        <h2 className="text-xl font-bold text-[#00ADEF] pb-2">{mode == "create" ? `New Non TPA Point` : mode == "edit" ? "Edit Non TPA Point" : "View Non TPA Point"}</h2>
                                        {/* <h4 className="text-sm font-bold text-[#58585A]">{"Nomination Point 1 - Non TPA Point 2"}</h4> */}
                                        <h4 className="text-sm font-light text-[#9D9D9D]">{"Formula : Nomination Point 1 - Non TPA Point 2"}</h4>

                                        <div className="grid grid-cols-2 gap-2 pt-4">
                                            <div>
                                                <label
                                                    htmlFor="non_tpa_point_name"
                                                    className={labelClass}
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {`Non TPA Point Name (Point2)`}
                                                </label>
                                                <input
                                                    id="non_tpa_point_name"
                                                    type="text"
                                                    placeholder="Enter Non TPA Point Name (Point2)"
                                                    readOnly={isReadOnly}
                                                    {...register("non_tpa_point_name", { required: "Enter Nomination Point" })}
                                                    className={`${inputClass} ${errors.non_tpa_point_name && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                />
                                                {errors.non_tpa_point_name && (
                                                    <p className="text-red-500 text-sm">{`Enter Non TPA Point Name (Point2)`}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="description" className={`${labelClass} mb-[8.5px] mt-[1px]`}>
                                                    {`Description`}
                                                </label>
                                                <input
                                                    id="description"
                                                    type="text"
                                                    placeholder='Enter Description'
                                                    // {...register('description', { required: "Enter Description" })}
                                                    {...register('description')}
                                                    // readOnly={isReadOnly}
                                                    readOnly={mode == 'view' ? true : false}
                                                    onChange={(e) => {
                                                        if (e.target.value.length <= 50) {
                                                            setValue('description', e.target.value);
                                                        }
                                                    }}
                                                    maxLength={50}
                                                    className={`${inputClass} ${mode == 'view' && '!bg-[#EFECEC]'} ${errors.description && 'border-red-500'}`}
                                                />
                                                <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                                    <span className="text-[13px]">{watch('description')?.length || 0} / 50</span>
                                                </div>
                                            </div>


                                            {/* <div></div>

                                        <div className="col-span-2">
                                            <label htmlFor="description" className={labelClass}>
                                                {`Description`}
                                            </label>
                                            <TextField
                                                {...register('description', { required: false })}
                                                value={watch('description') || ''}
                                                onChange={(e) => {
                                                    if (e.target.value.length <= 255) {
                                                        setValue('description', e.target.value);
                                                    }
                                                }}
                                                label=""
                                                multiline
                                                placeholder='Description'
                                                disabled={isReadOnly}
                                                rows={6}
                                                sx={{
                                                    '.MuiOutlinedInput-root': {
                                                        borderRadius: '8px', // Adjust the border-radius as needed
                                                        padding: '15px 20px',
                                                    },
                                                    '.MuiOutlinedInput-notchedOutline': {
                                                        // borderColor: '#DFE4EA',
                                                        borderColor: errors.description && !watch('description') ? '#FF0000' : '#DFE4EA',
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#d2d4d8',
                                                    },
                                                    '&.Mui-focused .MuiOutlinedI nput-notchedOutline': {
                                                        borderColor: '#d2d4d8',
                                                    },
                                                    '& .MuiInputBase-input::placeholder': {
                                                        color: '#9CA3AF', // Placeholder color
                                                        fontSize: '14px', // Placeholder font size
                                                        opacity: 10
                                                    },
                                                }}
                                                fullWidth
                                                className={`${errors.description && "border-red-500"} ${isReadOnly && '!bg-[#EFECEC]'}`}
                                            />
                                            {errors.description && (<p className="text-red-500 text-sm">{`Enter Description`}</p>)}
                                            <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                                <span className="text-[13px]">{watch('description')?.length || 0} / 255</span>
                                            </div>
                                        </div> */}

                                            <div className="-mt-4">
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
                                                        setValue("nomination_point_id", null);
                                                        if (errors?.area_id) {
                                                            clearErrors('area_id')
                                                        }
                                                    }}
                                                    errors={errors?.area_id}
                                                    errorsText={'Select Area'}
                                                    options={areaMasterData}
                                                    optionsKey={'id'}
                                                    optionsValue={'id'}
                                                    optionsText={'name'}
                                                    optionsResult={'name'}
                                                    placeholder={'Select Area'}
                                                    pathFilter={'name'}
                                                />

                                            </div>

                                            <div className="-mt-4">
                                                <label
                                                    htmlFor="nomination_point_id"
                                                    className={labelClass}
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {`Nomination Point (Point1)`}
                                                </label>

                                                <SelectFormProps
                                                    id={'nomination_point_id'}
                                                    register={register("nomination_point_id", { required: "Select Nomination Point (Point1)" })}
                                                    disabled={isReadOnly}
                                                    valueWatch={watch("nomination_point_id") || ""}
                                                    handleChange={(e) => {
                                                        setValue("nomination_point_id", e.target.value);
                                                        if (errors?.nomination_point_id) {
                                                            clearErrors('nomination_point_id')
                                                        }
                                                    }}
                                                    errors={errors?.nomination_point_id}
                                                    errorsText={'Select Nomination Point (Point1)'}
                                                    options={watch('area_id') ? nominationData?.filter((item: any) => item?.area?.id === watch('area_id')) : []}
                                                    optionsKey={'id'}
                                                    optionsValue={'id'}
                                                    optionsText={'nomination_point'}
                                                    optionsResult={'nomination_point'}
                                                    placeholder={'Select Nomination Point (Point1)'}
                                                    pathFilter={'nomination_point'}
                                                />

                                            </div>

                                            <div className="pb-2 mt-2">
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

                                            <div className="pb-2 mt-2">
                                                <label className={`${labelClass} mb-[9px]`}>{`End Date`}</label>

                                                {/* 
                                                if isPastStartDate == true then make min = today + 1
                                            */}
                                                <DatePickaForm
                                                    {...register('end_date')}
                                                    // readOnly={!formattedStartDate ? true : isReadOnly}
                                                    readOnly={!formattedStartDate ? true : (isReadOnly && mode === "view")}
                                                    placeHolder="Select End Date"
                                                    mode={mode}
                                                    // min={formattedStartDate || undefined}
                                                    // min={isPastStartDate ? dayjs().add(1, 'day').format('YYYY-MM-DD') : formattedStartDate || undefined}
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
                                                    className="w-[167px] font-semibold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
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

            {/* Confirm Save */}
            <ModalConfirmSave
                open={modaConfirmSave}
                handleClose={(e: any) => {
                    setModaConfirmSave(false);
                    if (e == "submit") {
                        // onSubmit(dataSubmit)
                        // setTimeout(async () => {
                        //     handleClose();
                        // }, 1000);

                        // setValue('concept_point', null)
                        // setValue('type_concept_point_id', null)

                        setIsLoading(true);
                        setTimeout(async () => {
                            await onSubmit(dataSubmit);
                        }, 100);

                        setTimeout(async () => {
                            handleClose();
                        }, 1000);
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
