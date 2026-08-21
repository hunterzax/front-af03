import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useEffect, useState } from "react";
import { TextField, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import Spinloading from "@/components/other/spinLoading";
import SelectFormProps from "@/components/other/selectProps";

type FormExampleProps = {
    mode?: "create" | "edit" | "view" | "period";
    data?: Partial<any>;
    open: boolean;
    dataTable?: any;
    dataShipper?: any;
    nominationTypeMaster?: any;
    dataContractOriginal?: any;
    onClose: () => void;
    onSubmit: SubmitHandler<any>;
    setResetForm: (reset: () => void) => void;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode,
    data = {},
    dataTable = {},
    open,
    dataShipper,
    nominationTypeMaster,
    dataContractOriginal,
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
        resetField,
        formState: { errors },
        watch,
    } = useForm<any>({
        defaultValues: data,
    });

    const labelClass = "block mb-2 text-sm font-light";
    const selectboxClass = "flex w-full h-[46px] p-1 ps-1 pe-2 !rounded-lg text-gray-900 text-sm block outline-none";

    // const isReadOnly = (mode === "view" || mode === 'edit');
    const isReadOnly = (mode === "view");
    const [fileLoading, setfileLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchAndSetData = async () => {
            handleRemoveFile();
            if (mode === "edit" || mode === "view") {
                setDataContract([data?.contract_code])
                setValue("shipper_id", data?.group?.id || "");
                setValue("contract_code_id", data?.contract_code.id || "");
                setValue("document_type", data?.nomination_type?.id || "");
                // setValue("comment", data?.upload_template_for_shipper_comment?.length > 0 ? data?.upload_template_for_shipper_comment?.[0]?.comment : '');
                // {setFileName(data?.upload_template_for_shipper_file?.length > 0 && data?.upload_template_for_shipper_file?.[0]?.url !== null ? cutUploadFileName(data?.upload_template_for_shipper_file?.[0]?.url) : 'Maximum File 10 MB')}
            }
        }
        fetchAndSetData();
    }, [data, mode, setValue]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    const [fileName, setFileName] = useState('Maximum File 10 MB');
    const [fileUpload, setFileUpload] = useState<any>();

    const handleFileChange = async (e: any) => {
        const file = e.target.files[0];
        setfileLoading(true);
        if (file) {
            const validFileTypes = ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
            const maxSizeInMB = 10; // Maximum file size in MB
            const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

            if (!validFileTypes.includes(file.type)) {
                setFileName('Invalid file type. Please upload a Excel file.');
                // Invalid file type:'
                return;
            }

            if (file.size > maxSizeInBytes) {
                setFileName('The file is larger than 10 MB.');
                // File size too large:
                return;
            }

            setFileName(file.name);
            setFileUpload(file);

            setValue("file_upload", file);
            if (errors?.file_upload) {
                clearErrors('file_upload');
            }

        } else {
            setFileName('No file chosen');
        }

        setTimeout(() => {
            setfileLoading(false);
        }, 200);
    };

    const handleRemoveFile = () => {
        setFileName("Maximum File 10 MB"); // Reset fileName
        setFileUpload(undefined);
        setValue('file_upload', null)
        setValue('upload_tranform', null);
    };

    const [dataContract, setDataContract] = useState<any>([]);
    const findContractCode = (id?: any, data?: any) => {
        const filteredDataShipper = data.filter((shipper: any) => shipper.id === id);
        const filteredContract = dataContractOriginal?.filter((contract: any) =>
            filteredDataShipper?.[0]?.contract_code?.some((filtered: any) => filtered.id === contract.id)
        );
        setDataContract(filteredContract)
    }

    const handleClose = () => {
        onClose();
        handleRemoveFile();
        // setSelectedValues([]);
        setValue('file_upload', null)
        setValue("shipper_id", null);
        setValue("contract_code_id", null);
        setValue("document_type", null);
        setValue("comment", null);
        reset();
    };

    return (
        <Dialog
            open={open}
            onClose={() => {
                handleClose();
            }}
            className="relative z-20"
        >
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
            />
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <DialogPanel
                        transition
                        className="relative w-full max-w-xl bg-white transform transition-all rounded-[20px] text-left shadow-lg data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:w-[90%] lg:max-w-3xl"
                    >
                        <div className="flex flex-col items-center justify-center p-4 gap-4">
                            <form
                                // onSubmit={(data:any) => handleFormSubmit(data)}
                                onSubmit={handleSubmit(async (data) => { // clear state when submit
                                    // setIsLoading(true);
                                    // setTimeout(async () => {
                                    //     await onSubmit(data);
                                    //     setSelectedValues([]);
                                    // }, 100);
                                })}
                                className="bg-white p-6  w-full"
                            >
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#00ADEF] mb-4">
                                    {mode === "create" ? `New Template for Shipper` : mode === "edit" ? "Edit Template for Shipper" : mode === "period" ? "New Period" : "View Template for Shipper"}
                                </h2>
                                <div
                                    className={`grid gap-4 grid-cols-2`}
                                >
                                    <div>
                                        <label
                                            htmlFor="shipper_id"
                                            className="block mb-2 text-sm font-light"
                                        >
                                            <span className="text-red-500">*</span> {`Shipper Name`}
                                        </label>

                                        <SelectFormProps
                                            id={'shipper_id'}
                                            register={register("shipper_id", { required: "Select Shipper Name" })}
                                            disabled={isReadOnly || mode === 'edit'}
                                            valueWatch={watch("shipper_id") || ""}
                                            handleChange={(e) => {
                                                setValue("shipper_id", e.target.value);
                                                findContractCode(e.target.value, dataShipper);
                                                if (errors?.shipper_id) { clearErrors('shipper_id') }
                                            }}
                                            errors={errors?.shipper_id}
                                            errorsText={'Select Shipper Name'}
                                            options={dataShipper}
                                            optionsKey={'id'}
                                            optionsValue={'id'}
                                            optionsText={'name'}
                                            optionsResult={'name'}
                                            placeholder={'Select Shipper Name'}
                                            pathFilter={'name'}
                                        />
                                    </div>

                                    {/* Contract Code Field */}
                                    <div>
                                        <label
                                            htmlFor="contract_code_id"
                                            className="block mb-2 text-sm font-light"
                                        >
                                            <span className="text-red-500">*</span> Contract Code
                                        </label>

                                        <SelectFormProps
                                            id={'contract_code_id'}
                                            register={register("contract_code_id", { required: "Select Contract Code" })}
                                            disabled={isReadOnly || mode === 'edit'}
                                            valueWatch={watch("contract_code_id") || ""}
                                            handleChange={(e) => {
                                                setValue("contract_code_id", e.target.value);
                                                if (errors?.contract_code_id) { clearErrors('contract_code_id') }
                                            }}
                                            errors={errors?.contract_code_id}
                                            errorsText={'Select Contract Code'}
                                            options={dataContract}
                                            optionsKey={'id'}
                                            optionsValue={'id'}
                                            optionsText={'contract_code'}
                                            optionsResult={'contract_code'}
                                            placeholder={'Select Contract Code'}
                                            pathFilter={'contract_code'}
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label
                                            htmlFor="document_type"
                                            className="block mb-2 text-sm font-light"
                                        >
                                            <span className="text-red-500">*</span>
                                            {`Document Type`}
                                        </label>
                                        <Select
                                            id="document_type"
                                            IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                            {...register("document_type", { required: "Select Document Type" })}
                                            disabled={isReadOnly || mode === 'edit'}
                                            value={watch("document_type") || ""}
                                            className={`${selectboxClass} ${(isReadOnly || mode === 'edit') && '!bg-[#EFECEC]'} ${errors.document_type && "border-red-500"}`}
                                            sx={{
                                                '.MuiOutlinedInput-notchedOutline': {
                                                    borderColor: errors.document_type && !watch('document_type') ? '#FF0000' : '#DFE4EA',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: errors.document_type && !watch("document_type") ? "#FF0000" : "#d2d4d8"
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#d2d4d8',
                                                },
                                            }}
                                            onChange={(e) => {
                                                setValue("document_type", e.target.value);
                                                // fetchData(e?.target);
                                            }}
                                            displayEmpty
                                            renderValue={(value: any) => {
                                                if (!value) {
                                                    return <Typography color="#9CA3AF" fontSize={14}>{`Select Document Type`}</Typography>;
                                                }
                                                return nominationTypeMaster.find((item: any) => item.id === value)?.name || '';
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
                                            {
                                                nominationTypeMaster?.map((item: any) => {
                                                    return (
                                                        <MenuItem key={item.id} value={item.id}>
                                                            {item.name}
                                                        </MenuItem>
                                                    )
                                                })
                                            }
                                        </Select>
                                        {errors.document_type && (<p className="text-red-500 text-sm">{`Select Document Type`}</p>)}
                                    </div>

                                    <div className="col-span-2">
                                        <label
                                            htmlFor="document_type"
                                            className="block text-sm font-light"
                                        >
                                            <span className="text-red-500">*</span>
                                            {`File`}
                                        </label>

                                        <div className={`grid w-full grid-cols-[30%_70%] rounded-[7px] border ${errors?.file_upload ? 'border-[#FF0000] h-[45px]' : 'border-none h-[46px]'} relative`}>
                                            {/* "Choose File" button */}
                                            <Spinloading spin={fileLoading} rounded={7} />
                                            <label className={`bg-[#00ADEF] text-white flex items-center justify-center font-light rounded-l-[6px] text-sm text-justify w-[100%] !h-[100%] px-5 py-2 cursor-pointer ${isReadOnly && "!bg-[#828282] !text-[#FFFFFF]"}`}>
                                                {`Choose File`}
                                                <input
                                                    id="url"
                                                    type="file"
                                                    className="hidden"
                                                    // {...register('file_upload', { required: "Select File" })}
                                                    {...register('file_upload', { required: fileUpload ? false : "Select File" })}
                                                    accept=".xls, .xlsx"
                                                    readOnly={isReadOnly}
                                                    disabled={isReadOnly}
                                                    onChange={handleFileChange}
                                                />
                                            </label>

                                            <div
                                                className={`
                                                    bg-white 
                                                    text-[#9CA3AF] 
                                                    text-sm w-[100%] 
                                                    !h-[100%] 
                                                    px-2 
                                                    py-2 
                                                    rounded-r-[6px] 
                                                    border-l-0 
                                                    border 
                                                    border-gray-300 
                                                    truncate 
                                                    overflow-hidden 
                                                    ${isReadOnly && '!bg-[#EFECEC]'} 
                                                    flex 
                                                    items-center
                                                `}
                                            >
                                                <div className={`truncate ${fileName == 'Maximum File 10 MB' ? 'text-[#9CA3AF]' : 'text-[#464255]'} `}>{fileName}</div>
                                                {fileName !== "Maximum File 10 MB" && (
                                                    <CloseOutlinedIcon
                                                        onClick={handleRemoveFile}
                                                        className="cursor-pointer ml-2 text-[#9CA3AF] z-10"
                                                        sx={{ color: '#323232', fontSize: 18 }}
                                                        style={{ fontSize: 18 }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <span className='w-full flex text-left justify-start text-[#1473A1] text-[14px]'>Required :  .xls, .xlsx</span>
                                        {errors?.file_upload && (<p className="text-red-500 text-sm">{`Select File`}</p>)}
                                    </div>

                                    {/* Comment Field */}
                                    <div className="col-span-2">
                                        <label className={labelClass}>{`Comment`}</label>
                                        <TextField
                                            {...register("comment")}
                                            value={watch("comment") || ""}
                                            label=""
                                            multiline
                                            onChange={(e) => {
                                                if (e.target.value.length <= 255) {
                                                    setValue("comment", e.target.value);
                                                }
                                            }}
                                            placeholder="Enter Comment"
                                            disabled={isReadOnly}
                                            rows={4}
                                            sx={{
                                                ".MuiOutlinedInput-root": {
                                                    borderRadius: "8px",
                                                },
                                                ".MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "#DFE4EA",
                                                },
                                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "#d2d4d8",
                                                },
                                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "#d2d4d8",
                                                },
                                                "& .MuiOutlinedInput-input::placeholder": {
                                                    fontSize: "14px",
                                                },
                                            }}
                                            fullWidth
                                            className={`rounded-lg ${isReadOnly && '!bg-[#EFECEC]'}`}
                                        />
                                        <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                            <span className="text-[13px]">
                                                {watch("comment")?.length || 0} / 255
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4 pt-6 flex-wrap">
                                    <button
                                        type="button"
                                        onClick={() => handleClose()}
                                        className={`py-2 px-6 rounded-lg ${mode === "view" ? "bg-[#00ADEF] text-white hover:bg-blue-600" : "bg-slate-100 text-black hover:bg-rose-500"}`}
                                    >
                                        {mode === "view" ? "Close" : "Cancel"}
                                    </button>
                                    {mode !== "view" && (
                                        <button
                                            type="submit"
                                            className="py-2 px-6 rounded-lg bg-[#00ADEF] text-white hover:bg-blue-600"
                                        >
                                            {mode === "create" ? "Add" : "Save"}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
};

export default ModalAction;