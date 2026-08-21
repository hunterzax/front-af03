import React from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { getService, uploadFileService } from "@/utils/postService";
import { filterStartEndDateInRange, formatWatchFormDate } from "@/utils/generalFormatter";
import { TextField, Typography } from "@mui/material";
import { Search, CloseOutlined } from '@mui/icons-material';
import { table_row_style } from "@/utils/styles";
import Spinloading from "@/components/other/spinLoading";

type FormData = {
    document_name: string;
    file: string;
    description: string;
    role: [];
};

type FormExampleProps = {
    mode?: "create" | "edit" | "view";
    data?: Partial<FormData>;
    open: boolean;
    // userGuideRole: any
    onClose: () => void;
    onSubmit: SubmitHandler<FormData>;
    setResetForm: (reset: () => void) => void;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode = "create",
    data = {},
    // userGuideRole = {},
    open,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const { control, register, handleSubmit, getValues, setValue, reset, formState: { errors }, setError, clearErrors, watch, } = useForm<any>({ defaultValues: data, });

    const [selectAll, setSelectAll] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [fileName, setFileName] = useState('Maximum File 10 MB');
    const [fileUpload, setFileUpload] = useState<any>();
    const [userGuideRole, setuserGuideRole] = useState<any>([]);

    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);

        if (newSelectAll) {
            // Select all roles
            // const allRoles = userGuideRole?.map((role: any) => ({ id: role.id }));

            // v1.0.81 เมื่อใช้ function search และเลือก select all ภายใต้รายการที่ search ไว้ หลังจาก save แล้วพบว่าทุก role ถูก select หมด https://app.clickup.com/t/86erm0qdf
            const allRoles = filteredRoles?.map((role: any) => ({ id: role.id })); // select all แค่ตัวที่ filter
            setSelectedRoles(allRoles);
            setValue('role', allRoles);
        } else {
            // Deselect all roles
            setSelectedRoles([]);
            setValue('role', []);
        }
    };

    const handleSelectRole = (id: any) => {

        const existingRole = selectedRoles.find(role => role.id === id);
        if (existingRole) {
            // Deselect the role
            setSelectedRoles(selectedRoles.filter(role => role.id !== id));
            setValue('role', selectedRoles.filter(role => role.id !== id));
        } else {
            // Select the role
            setSelectedRoles([...selectedRoles, { id }]);
            setValue('role', [...selectedRoles, { id }]);
        }
    };

    const labelClass = "block mb-2 text-[14px] font-light"
    const inputClass = "text-[14px] block md:w-full p-2 ps-5 focus:!ps-5 hover:!ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"

    const isReadOnly = mode === "view";
    const [fileLoading, setfileLoading] = useState<boolean>(false);
    const [filteredRoles, setfilteredRoles] = useState([]);
    const [tk, settk] = useState<any>(false);

    useEffect(() => {
        setSearchTerm('');
        settk(!tk);

        const fetchAndSetData = async () => {
            handleRemoveFile();
            if (mode === "create") {
                setSelectedRoles([]);
                setSelectAll(false);
            }
            if (mode === "edit" || mode === "view") {
                const filterRoleNull: any = data?.role?.filter((item: any) => item?.id !== null && item?.id !== undefined);

                setValue("document_name", data?.document_name || "");
                setValue("file", data?.file || "");
                setValue("description", data?.description || "");
                setValue("role", filterRoleNull || "");

                const filex: any = data?.file;
                const fileName = filex ? filex.split('/').pop() : 'Maximum File 10 MB';

                setFileName(fileName)

                const dataEditRole: any = filterRoleNull
                setSelectedRoles(dataEditRole);
            }
        }

        fetchAndSetData();
        fetchRoleMaster();
    }, [data, mode, setValue]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    const fetchRoleMaster: any = async () => {
        try {
            const responseRole: any = await getService(`/master/account-manage/role-master`);
            setuserGuideRole(responseRole);
            renderRoles()
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    }

    const handleFileChange = async (e: any) => {
        const file = e.target.files[0];
        setfileLoading(true);
        if (file) {
            const validFileTypes = ['application/pdf'];
            const maxSizeInMB = 10; // Maximum file size in MB
            const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

            if (!validFileTypes?.includes(file.type)) {
                setFileName('Invalid file type. Please upload a PDF');
                setError("file", {
                    type: "custom",
                    message: "Invalid file type. Please upload a PDF",
                });
                setfileLoading(false);
                // // Invalid file type:'
                return;
            }

            if (file.size > maxSizeInBytes) {
                setFileName('The file is larger than 10 MB.');
                setError("file", {
                    type: "custom",
                    message: "The file is larger than 10 MB.",
                });
                setfileLoading(false);
                // // File size too large:
                return;
            }

            try {
                const response: any = await uploadFileService('/files/uploadfile/', file);
                setFileName(file?.name);
                setFileUpload(file);
                setValue("file", response?.file?.url);
                if (errors?.file) {
                    clearErrors('file');
                }
            } catch (error) {
                setfileLoading(false);
                // File upload failed:
            }
        } else {
            setFileName('No file chosen');
        }

        setTimeout(() => {
            setfileLoading(false);
        }, 200);
    };

    const renderRoles = (query?: any) => {
        if (userGuideRole?.length > 0) {
            let item = userGuideRole?.filter((item: any) => item.user_type?.id !== 1).filter((item: any) => {
                if (query) {
                    const queryLower = query.toLowerCase().replace(/\s+/g, '')?.trim();
                    return (
                        item.user_type?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
                    )
                } else {
                    return item
                }
            });

            let filterStartandEndItem = filterStartEndDateInRange(item)

            setfilteredRoles(filterStartandEndItem);
        } else {
            setfilteredRoles([])
        }
    }

    const handleRemoveFile = () => {
        setFileName("Maximum File 10 MB"); // Reset fileName
        setFileUpload(undefined);
        setValue('file', null);
    };

    // clear state when closes
    const handleClose = async () => {
        setFileName("Maximum File 10 MB"); // Reset fileName
        setFileUpload(undefined);
        setValue('file', null);
        setfileLoading(false);
        setSelectedRoles([]);
        setTimeout(() => {
            onClose();
            reset();
        }, 100);
    };

    useEffect(() => {
        if (selectedRoles?.length > 0 && filteredRoles?.length > 0 && selectedRoles?.length == filteredRoles?.length) {
            setSelectAll(true); //เผื่อ user check หมด แล้ว กด edit เข้ามา
        }
    }, [selectedRoles, filteredRoles, mode == 'edit'])

    return (
        <Dialog open={open} onClose={() => { handleClose() }} className="relative z-20">
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
                            <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-md">
                                <form
                                    onSubmit={handleSubmit(onSubmit)}
                                    className="bg-white p-8 rounded-[20px] shadow-lg max-w  !w-[800px]"
                                >
                                    <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{mode == "create" ? `Add User Guide` : mode == "edit" ? "Edit User Guide" : "View User Guide"}</h2>
                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <div >
                                            <label
                                                htmlFor="document_name"
                                                className={labelClass}
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Document Name`}
                                            </label>
                                            <input
                                                id="document_name"
                                                type="text"
                                                placeholder="Enter Document Name"
                                                readOnly={isReadOnly}
                                                {...register("document_name", { required: "Enter Document Name" })}
                                                className={`${inputClass} ${errors.document_name && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                            />
                                            {errors.document_name && (<p className="text-red-500 text-[14px]">{`Enter Document Name`}</p>)}
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="file"
                                                className={labelClass}
                                            >
                                                <span className="text-red-500">*</span>
                                                {`File`}
                                            </label>

                                            <div className={`grid w-full grid-cols-[30%_70%] rounded-[7px] border ${errors?.file ? 'border-[#FF0000] h-[39px]' : 'border-none h-[40px]'} relative`}>
                                                <Spinloading spin={fileLoading} rounded={7} />
                                                <label className={`bg-[#00ADEF] text-white flex items-center justify-center font-light rounded-l-[6px] text-[14px] text-justify w-[100%] h-[100%] cursor-pointer ${isReadOnly && "!bg-[#828282] !text-[#FFFFFF]"}`}>
                                                    {`Choose File`}
                                                    <input
                                                        id="url"
                                                        type="file"
                                                        className="hidden"
                                                        // {...register('file_upload', { required: "Select File" })}
                                                        {...register('file', { required: (fileUpload || fileName !== 'Maximum File 10 MB') ? false : "Select File" })}
                                                        accept=".pdf"
                                                        readOnly={isReadOnly}
                                                        disabled={isReadOnly}
                                                        onChange={handleFileChange}
                                                    />
                                                </label>

                                                <div
                                                    className={`
                                                        bg-white 
                                                        text-[#9CA3AF] 
                                                        text-[14px] w-[100%] 
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
                                                    {/* <div className={`truncate ${fileName == 'Maximum File 10 MB' ? 'text-[#9CA3AF]' : 'text-[#464255]'} ${isReadOnly ? 'opacity-0' : 'opacity-100'}`}>{fileName}</div> */}
                                                    <Typography color="#9CA3AF" className={`truncate ${fileName == 'Maximum File 10 MB' ? 'text-[#9CA3AF]' : 'text-[#464255]'} ${isReadOnly ? 'opacity-100' : 'opacity-100'}`} fontSize={14}>{fileName}</Typography>
                                                    {fileName !== "Maximum File 10 MB" && !isReadOnly && (
                                                        <CloseOutlined
                                                            onClick={handleRemoveFile}
                                                            className={`cursor-pointer ml-2 text-[#9CA3AF] z-10`}
                                                            sx={{ color: '#323232', fontSize: 18 }}
                                                            style={{ fontSize: 18 }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            {errors?.file && (<p className="text-red-500 text-[14px]">{errors?.file?.message ? String(errors?.file?.message) : `Select File`}</p>)}
                                        </div>

                                        <div className="col-span-2">
                                            <label htmlFor="description" className={labelClass}>
                                                {/* <span className="text-red-500">*</span> */}
                                                {`Description`}
                                            </label>
                                            <TextField
                                                {...register('description', { required: false, maxLength: 200 })} // v2.0.98 Add/Edit เอา Required Description ออก https://app.clickup.com/t/86euzxxnm
                                                value={watch('description') || ''}
                                                onChange={(e) => {
                                                    if (e.target.value.length <= 255) {
                                                        setValue('description', e.target.value);
                                                    }
                                                }}
                                                label=""
                                                multiline
                                                placeholder='Enter Description'
                                                disabled={isReadOnly}
                                                rows={6}
                                                sx={{
                                                    '.MuiOutlinedInput-root': {
                                                        borderRadius: '8px',
                                                    },
                                                    '.MuiOutlinedInput-notchedOutline': {
                                                        // borderColor: '#DFE4EA',
                                                        borderColor: errors.remark && !watch('remark') ? '#FF0000' : '#DFE4EA',
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: errors.remark && !watch("remark") ? "#FF0000" : '#DFE4EA !important',
                                                    },
                                                    '&.Mui-focused .MuiOutlinedI nput-notchedOutline': {
                                                        borderColor: '#00ADEF',
                                                    },
                                                    '&.MuiInputBase-input::placeholder': {
                                                        color: '#9CA3AF', // Placeholder color
                                                        fontSize: '14px', // Placeholder font size
                                                    },
                                                    '& .Mui-disabled': {
                                                        color: '#58585A', // Disabled text color
                                                    },
                                                    "& .MuiOutlinedInput-input::placeholder": {
                                                        fontSize: "14px",
                                                    },
                                                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                        borderColor: "#00ADEF !important", // 👈 force black border on focus
                                                        borderWidth: '1px', // 👈 Force border 1px on focus
                                                    },
                                                }}
                                                fullWidth
                                                className={`${errors.description && "border-red-500"} ${isReadOnly && '!bg-[#EFECEC]'}`}
                                            />
                                            {errors.description && (<p className="text-red-500 text-[14px]">{`Enter description`}</p>)}
                                            <div className="flex justify-end text-[14px] text-[#B6B6B6] mt-1">
                                                <span className="text-[13px]">{watch('description')?.length || 0} / 255</span>
                                            </div>
                                        </div>

                                        {/* Search input */}
                                        <div className="relative col-span-2">
                                            <label className={labelClass}>
                                                {`User Guide for`}
                                            </label>
                                            <Search
                                                className="text-[#58585A] absolute cursor-pointer top-[43px] right-[15px]"
                                                style={{ fontSize: '16px' }}
                                            />
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                // onChange={handleSearchChange}
                                                onChange={(e: any) => {
                                                    setSearchTerm(e.target.value)
                                                    renderRoles(e.target.value)
                                                }}
                                                placeholder="Search type or role"
                                                className={inputClass}
                                            />
                                        </div>

                                        <div className="col-span-2 relative h-auto overflow-auto block rounded-t-md pt-1 s">
                                            <div className="max-h-[200px] overflow-y-auto ">
                                                <table className="w-full max-h-[200px] text-[14px] text-center justify-center rtl:text-right text-gray-500 ">
                                                    <thead className="text-[14px] rounded-tl-[10px] rounded-tr-[10px] text-[#ffffff] h-[35px] bg-[#1473A1] sticky z-10">
                                                        <tr>
                                                            <th className="rounded-tl-[10px] w-[25%] ">
                                                                <div className="flex justify-center items-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectAll}
                                                                        onChange={handleSelectAll}
                                                                        className="form-checkbox w-4 h-4"
                                                                        disabled={isReadOnly}
                                                                    />
                                                                </div>
                                                            </th>

                                                            <th className=" w-[25%] text-left">{`User Type`}</th>
                                                            <th className="rounded-tr-[10px] w-[50%] text-left ">{`Role`}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredRoles?.map((item: any, index: any) => (
                                                            <tr
                                                                key={item.id}
                                                                className={`${table_row_style}`}
                                                            >
                                                                <td className="px-2 py-1">
                                                                    <div className="flex justify-center items-center">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedRoles?.some(role => role.id === item.id)}
                                                                            onChange={() => handleSelectRole(item.id)}
                                                                            className="form-checkbox w-4 h-4"
                                                                            disabled={isReadOnly}
                                                                        />
                                                                    </div>
                                                                </td>
                                                                <td className="py-1 text-left text-[#464255]">
                                                                    {item.user_type?.name || ''}
                                                                </td>
                                                                <td className="py-1 text-left text-[#464255]">
                                                                    {item.name || ''}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {/* {filteredRoles.map((item: any, index: any) => {
                                                            const isChecked = selectedRoles.some(role => role.id === item.id);
                                                            return (
                                                                <tr
                                                                    key={item.id}
                                                                    className={`${table_row_style}`}
                                                                    >
                                                                    <td className="px-2 py-1">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isChecked}
                                                                            onChange={() => handleSelectRole(item.id)}
                                                                            // className="form-checkbox"
                                                                            className={`w-4 h-4 rounded border-2 cursor-pointer ${isChecked? '!bg-[#9CA3AF] !border-[#9CA3AF]' : 'bg-white border-[#AEAEB2]'} `}
                                                                        />
                                                                    </td>
                                                                    <td className="py-1 text-left text-[#464255]">
                                                                        {item.user_type?.name || ''}
                                                                    </td>
                                                                    <td className="py-1 text-left text-[#464255]">
                                                                        {item.name || ''}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })} */}
                                                    </tbody>
                                                </table>
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

                                        {mode !== "view" && (
                                            <button
                                                type="submit"
                                                className="w-[167px] font-bold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
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