import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { formatDate, formatFormDate, formatWatchFormDate, getMinDate } from "@/utils/generalFormatter";
import { InputSearch } from "@/components/other/SearchForm";
import { Button } from "@material-tailwind/react";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DatePickaForm from "@/components/library/dateRang/dateSelectForm";
import dayjs from "dayjs";
import Spinloading from "@/components/other/spinLoading";
import ModalConfirmSave from "@/components/other/modalConfirmSave";
import SelectFormProps from "@/components/other/selectProps";

type FormData = {
    concept_point: string;
    type_concept_point_id: string;
    start_date: Date;
    end_date: Date;
};

type FormExampleProps = {
    mode: "create" | "edit" | "view" | "period";
    data?: Partial<FormData>;
    open: boolean;
    dataTable: any;
    typeConceptData: any;
    limitConceptPointData: any;
    shipperGroupData: any;
    setLimitDataPost: any;
    onClose: () => void;
    onSubmit: SubmitHandler<FormData>;
    setResetForm: (reset: () => void) => void;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode = 'period',
    data = {},
    dataTable = {},
    typeConceptData = {},
    limitConceptPointData = {},
    shipperGroupData = {},
    setLimitDataPost = [],
    open,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const {
        control,
        register,
        handleSubmit,
        setValue,
        reset,
        clearErrors,
        formState: { errors },
        watch,
    } = useForm<any>({
        defaultValues: data,
    });

    {/* Confirm Save */ }
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()

    // const isReadOnly = mode === "view";
    const isReadOnly = mode === "view" || (data?.start_date && new Date(data?.start_date) < new Date()); // Edit > รายการที่ถึงวันที่ Start date ไปแล้วจะไม่สามารถแก้ไขข้อมูลอะไรได้ นอกจาก End Date (เงื่อนไขคือ D+1) https://app.clickup.com/t/86ervtz5z

    const labelClass = "block mb-2 text-[14px] font-light"
    const inputClass = `text-sm block md:w-full !p-2 !ps-5 hover:!p-2 hover:!ps-5 focus:!p-2 focus:!ps-5 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF] ${isReadOnly && '!border-none'}`;
    const textErrorClass = "text-red-500 text-[14px]"
    const pxpyClass = "px-2 py-1 text-[#464255]"

    // const isPastStartDate = (data?.start_date && new Date(data?.start_date) < new Date());

    const startDate = watch("start_date");
    const formattedStartDate = formatWatchFormDate(startDate);
    const [srchShipperName, setSrchShipperName] = useState('');
    const [srchConceptPoint, setSrchConceptPoint] = useState('');

    const [limitConcept, setLimitConcept] = useState([]);
    const [requireFromNew, setRequireFormNew] = useState(true);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const handleFieldSearch = () => {
        const result = dataTable.filter((item: any) => {
            return (
                (srchConceptPoint ? item?.id == srchConceptPoint : true) &&
                (srchShipperName ? item?.name == srchShipperName : true)
            );
        });
        setFilteredDataTable(result);
    };

    const handleReset = () => {
        setSrchConceptPoint('')
        setSrchShipperName('')
    };

    //load data
    useEffect(() => {
        const fetchAndSetData = async () => {
            clearErrors();
            setLimitConcept(limitConceptPointData);
            setLimitDataPost(limitConceptPointData);

            setValue('start_date', null);
            setValue('end_date', null);
            setValue('concept_point', null);
            setValue('type_concept_point_id', null);

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
                setValue("concept_point", data?.concept_point || "");
                setValue("type_concept_point_id", data?.type_concept_point_id || "");
                setValue("start_date", formattedStartDate);

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

    const addLimit = () => {
        const selectedShipper = watch('shipper_name');
        const selectedConceptPoint = watch('concept_pointx');
        setRequireFormNew(false)
        // หา shipper
        const shipperGroup: any = shipperGroupData.find((item: any) => item?.id.toString() === selectedShipper);

        // หา concept point
        const conceptPoint: any = dataTable.find((item: any) => item?.id.toString() === selectedConceptPoint);

        if (shipperGroup && conceptPoint) {
            setLimitConcept((prev): any => [
                ...prev,
                {
                    id: limitConcept?.length + 10000,
                    concept_point: conceptPoint,
                    concept_point_id: conceptPoint?.id,
                    group: shipperGroup,
                    group_id: shipperGroup?.id,
                }
            ]);
        }

        setLimitDataPost((prev: any): any => [
            ...prev,
            {
                id: limitConcept?.length + 10000,
                concept_point: conceptPoint,
                concept_point_id: conceptPoint?.id,
                group: shipperGroup,
                group_id: shipperGroup?.id,
            }
        ]);
    };

    const deleteLimit = (id: any) => {
        setLimitConcept(limitConcept.filter((item: any) => item?.id !== id));
    };

    const handleClose = () => {
        clearErrors();
        // setFileName("Maximum File 10 MB"); // Reset fileName
        // setFileUpload(undefined);
        // setfileLoading(false);

        onClose();
    };

    {/* Confirm Save */ }
    const handleSaveConfirm = async (data?: any) => {

        if (mode == 'create') {
            await onSubmit(data);
        } else {
            setDataSubmit(data)
            setModaConfirmSave(true)
        }
    }

    return (
        <>
            <Dialog open={open} onClose={handleClose} className="relative z-20">
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
                />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto ">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <DialogPanel
                            transition
                            className="flex transform transition-all inset-0 rounded-lg text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in  data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95 relative"
                        >
                            <div className="flex inset-0 items-center  justify-center w-full">
                                <div className="flex flex-col items-center justify-center gap-2 rounded-md">
                                    <Spinloading spin={isLoading} rounded={20} />
                                    <form
                                        className="bg-white p-8 rounded-[20px] shadow-lg max-w-[1000px] w-[600px]"
                                        onSubmit={handleSubmit(handleSaveConfirm)}
                                    >
                                        <h2 className="text-xl font-bold text-[#00ADEF] mb-3 pb-3">{mode == "create" ? `New Concept Point` : mode == "edit" ? "Edit Concept Point" : mode == "period" ? "Limit Concept Point" : "View Concept Point"}</h2>
                                        {
                                            mode == "create" || mode == "edit" || mode == "view" ? (
                                                <div className="grid grid-cols-2 gap-2 pt-2">
                                                    <div className="">
                                                        <label
                                                            htmlFor="concept_point"
                                                            className={labelClass}
                                                        >
                                                            <span className="text-red-500">*</span>
                                                            {`Concept Point `}
                                                        </label>
                                                        <input
                                                            id="concept_point"
                                                            type="text"
                                                            placeholder="Enter Concept Point"
                                                            readOnly={isReadOnly}
                                                            {...register("concept_point", { required: requireFromNew })}
                                                            // {...register("concept_point")}
                                                            className={`${inputClass} ${errors.concept_point && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                        />
                                                        {errors.concept_point && (<p className="text-red-500 text-sm">{`Enter Concept Point`}</p>)}
                                                    </div>

                                                    <div className="">
                                                        <label
                                                            htmlFor="type_concept_point_id"
                                                            className={labelClass}
                                                        >
                                                            <span className="text-red-500">*</span>
                                                            {`Type Concept Point`}
                                                        </label>
                                                        <SelectFormProps
                                                            id={'type_concept_point_id'}
                                                            register={register("type_concept_point_id", { required: requireFromNew })}
                                                            disabled={isReadOnly}
                                                            valueWatch={watch("type_concept_point_id") || ""}
                                                            handleChange={(e) => {
                                                                setValue("type_concept_point_id", e.target.value);
                                                                if (errors?.type_concept_point_id) { clearErrors('type_concept_point_id') }
                                                            }}
                                                            errors={errors?.type_concept_point_id}
                                                            errorsText={'Select Type Concept Point'}
                                                            options={typeConceptData}
                                                            optionsKey={'id'}
                                                            optionsValue={'id'}
                                                            optionsText={'name'}
                                                            optionsResult={'name'}
                                                            placeholder={'Select Type Concept Point'}
                                                            pathFilter={'name'}
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
                                                            // valueShow={watch("start_date")}
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
                                                </div>)
                                                :
                                                <div className="">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="flex-1">
                                                            {/* Shipper Name Input */}
                                                            <InputSearch
                                                                id="searchShipperName"
                                                                label="Shipper Name"
                                                                type="select"
                                                                value={srchShipperName}
                                                                onChange={(e) => setSrchShipperName(e.target.value)}
                                                                options={shipperGroupData?.length > 0 && shipperGroupData?.map((item: any) => ({
                                                                    value: item?.id,
                                                                    label: item?.name
                                                                }))}
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            {/* Concept Point Input */}
                                                            <InputSearch
                                                                id="searchTypeConcept"
                                                                label="Concept Point"
                                                                type="select"
                                                                value={srchConceptPoint}
                                                                onChange={(e) => setSrchConceptPoint(e.target.value)}
                                                                options={dataTable?.map((item: any) => ({
                                                                    value: item?.id,
                                                                    label: item?.concept_point
                                                                }))}
                                                            />
                                                        </div>
                                                        <div className="flex items-center space-x-2 mt-auto">
                                                            <Button className="flex items-center gap-3 px-2 h-[30px] bg-[#00ADEF]" onClick={handleFieldSearch}>
                                                                <SearchIcon style={{ fontSize: "16px" }} />
                                                            </Button>

                                                            <Button
                                                                variant="outlined"
                                                                className="flex items-center gap-3 px-2 h-[30px] border-[#00ADEF] text-[#00ADEF]"
                                                                onClick={handleReset}
                                                            >
                                                                <RefreshIcon style={{ fontSize: "16px" }} />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div className="border-[#DFE4EA] border-[1px] p-2 mt-4 rounded-xl flex flex-col justify-between shadow-sm">
                                                        <aside className="flex flex-col sm:flex-row gap-2">
                                                            <div className="flex-1">
                                                                <InputSearch
                                                                    id="inputShipperName"
                                                                    label="Shipper Name"
                                                                    type="select"
                                                                    {...register("shipper_name")}
                                                                    value={watch("shipper_name") || ""}
                                                                    // value={srchShipperName}
                                                                    onChange={(e) => {
                                                                        setValue("shipper_name", e.target.value);
                                                                        // fetchData(e?.target);
                                                                    }}
                                                                    options={shipperGroupData?.length > 0 && shipperGroupData?.map((item: any) => ({
                                                                        value: item?.id.toString(),
                                                                        label: item?.name
                                                                    }))}
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                {/* Concept Point Input */}
                                                                <InputSearch
                                                                    id="inputTypeConcept"
                                                                    label="Concept Point"
                                                                    type="select"
                                                                    {...register("concept_pointx")}
                                                                    value={watch("concept_pointx") || ""}
                                                                    // onChange={(e) => setSrchConceptPoint(e.target.value)}
                                                                    onChange={(e) => {
                                                                        setValue("concept_pointx", e.target.value);
                                                                    }}
                                                                    options={dataTable?.map((item: any) => ({
                                                                        value: item?.id.toString(),
                                                                        label: item?.concept_point
                                                                    }))}
                                                                />
                                                            </div>
                                                            <Button className="flex items-center justify-center mt-auto h-[35px] w-[60px] bg-[#24AB6A] normal-case" onClick={addLimit}>
                                                                <span>{`Add`}</span>
                                                            </Button>

                                                        </aside>

                                                        <div className="h-auto overflow-auto block rounded-t-md pt-3 mt-4"> {/* Add margin-top here */}
                                                            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                                                                <thead className="text-sm !h-[44px] text-[#ffffff] bg-[#1473A1] sticky top-0 z-10 rounded-tl-lg rounded-tr-lg">
                                                                    <tr>
                                                                        <th className="rounded-tl-lg font-light">{`Shipper Name`}</th> {/* Rounded top-left corner */}
                                                                        <th className="font-light">{`Concept Point`}</th>
                                                                        <th className="font-light">{`Create by`}</th>
                                                                        <th className="rounded-tr-lg font-light">{`Delete`}</th> {/* Rounded top-right corner */}
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {limitConcept?.map((item: any) => (
                                                                        <tr key={item?.id}>
                                                                            <td className={pxpyClass}>{item?.group?.name}</td>
                                                                            <td className={pxpyClass}>{item?.concept_point?.concept_point}</td>

                                                                            <td className={pxpyClass}>
                                                                                <div>
                                                                                    <div className="text-gray-500 text-xs">
                                                                                        {item?.create_date ? formatDate(item?.create_date) : '-'}
                                                                                    </div>
                                                                                    <span className="text-[#464255]">
                                                                                        {item?.create_by_account ? `${item?.create_by_account?.first_name} ${item?.create_by_account?.last_name} ` : ''}
                                                                                    </span>
                                                                                </div>
                                                                            </td>

                                                                            <td className="px-2 py-1">
                                                                                <DeleteOutlineOutlinedIcon
                                                                                    className="text-[#EA6060] bg-[#ffffff] border border-[#DFE4EA] rounded-md p-1 cursor-pointer"
                                                                                    onClick={() => deleteLimit(item?.id)}
                                                                                />
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>

                                                    </div>
                                                </div>

                                        }

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
                                                    {
                                                        mode === "create" ? "Add" : "Save"
                                                    }
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
               
                        setValue('concept_point', null)
                        setValue('type_concept_point_id', null)

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
                            {`Do you want to save the changes ?`}
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
