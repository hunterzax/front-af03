import React from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { formatFormDate, formatWatchFormDate } from "@/utils/generalFormatter";
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ModalConfirmSave from "@/components/other/modalConfirmSave";
import Spinloading from "@/components/other/spinLoading";
import { Checkbox, ListItemText, MenuItem, Select, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getService } from "@/utils/postService";

type FormData = {
    name: string;
    email: string;
    email_arr: any;
    user_type_id?: number;
    group_id?: number;
    edit_email_group_for_event_match?: any[]
    // start_date: Date;
    // end_date: Date;
};

type FormExampleProps = {
    mode?: "create" | "edit" | "view";
    data?: Partial<FormData>;
    open: boolean;
    userTypeMaster?: any;
    onClose: () => void;
    onSubmit: SubmitHandler<FormData>;
    setResetForm: (reset: () => void) => void;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode = "create",
    data = {},
    open,
    userTypeMaster,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const { control, register, handleSubmit, setValue, reset, formState: { errors }, watch, clearErrors } = useForm<any>({ defaultValues: data });

    const inputClass = "text-sm block md:w-full p-2 ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]";
    const selectboxClass = "flex w-full h-[44px] p-1 ps-2 pe-2 !rounded-lg text-gray-900 text-sm block outline-none";
    const itemselectClass = "pl-[8px] text-[14px]"

    const isReadOnly = mode === "view";
    const startDate = watch("start_date");
    const formattedStartDate = formatWatchFormDate(startDate);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    {/* Confirm Save */ }
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()

    useEffect(() => {
        const fetchAndSetData = async () => {
            if (mode == 'create') {
                setIsLoading(false);
            } else if (mode === "edit" || mode === "view") {
                setValue("name", data?.name || "");
                setValue("email", data?.email || "");
                setValue("email_arr", data?.email_arr || "");
                setValue("user_type_id", data?.user_type_id || "");
                setValue("group_id", data?.group_id || "");
                setValue("email", data?.email)
                getGroupByType(data?.user_type_id)
                getUserUnderGroup(data?.group_id)
                setEmailGroup(data?.email_arr)
                setSelectedUserMail(data?.email_arr);

                setTimeout(() => {
                    if (data) { setIsLoading(false); }
                }, 500);
            }
        }

        fetchAndSetData();
    }, [data, mode, setValue]);

    useEffect(() => {
        //reset
        if (open == false) {
            setTimeout(() => {
                setEmailGroup([]); // clear state when closes
                setSelectedUserMail([]);
                setDataUser([]);
                setIsLoading(true);
            }, 300);
        }
    }, [open])


    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    const [emailGroup, setEmailGroup] = useState<any>([]);
    const [dataGroup, setDataGroup] = useState<any>([]);
    const [dataUser, setDataUser] = useState<any>([]);
    const [alertDupMail, setAlertDupMail] = useState<any>(false);

    const getGroupByType = async (user_type?: any) => {
        try {
            // Group (2 = TSO, 3 = Shipper, 4 = Other)
            const res_group = await getService(`/master/account-manage/group-master?user_type=${user_type}`);
            setDataGroup(res_group)
        } catch (error) {

        }
    }

    // const getUserUnderGroup = async (group_id?: any) => {
    //     try {
    //         // user account
    //         const res_user: any = await getService(`/master/account-manage/account`);
    //         const remove_key_user_data = res_user?.map(({ password, ...rest }: any) => rest);
    //         const filteredUsers = remove_key_user_data?.filter((user: any) => user.account_manage?.[0]?.group_id === group_id);
    //         setDataUser(filteredUsers)
    //     } catch (error) {

    //     }
    // }

    const getUserUnderGroup = async (group_id?: any) => {
        try {
            const res_user: any = await getService(`/master/account-manage/emailOnly`);
            const filteredUsers = res_user?.filter((user: any) => user.account_manage?.[0]?.group_id === group_id);
            setDataUser(filteredUsers)
        } catch (error) {
        }
    }

    const addEmailGroup = (data: any) => {

        setEmailGroup((prev: any): any => [
            ...prev,
            data
        ]);

        setValue("email", "");
        setValue("email_arr", [...emailGroup, data]);
    };

    const removeEmail = (indexToRemove: number) => {
        setEmailGroup((prevGroup: any) => prevGroup.filter((_: any, index: number) => index !== indexToRemove));

        const currentEmails = watch("email");
        const updatedEmails = currentEmails.filter((_: any, index: number) => index !== indexToRemove);
        setSelectedUserMail(updatedEmails)
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

    const handleClose = () => {
        onClose();
        setIsLoading(false);
    };
    const [selectedUserMail, setSelectedUserMail] = useState<any>([]) // email ของ user

    return (<>
        <Dialog open={open} onClose={handleClose} className="relative z-20">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
            />
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto ">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <DialogPanel
                        transition
                        className="flex transform transition-all inset-0 rounded-lg text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in  data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                    >
                        <Spinloading spin={isLoading} rounded={20} />
                        <div className="flex inset-0 items-center justify-center ">
                            <div className="flex flex-col items-center justify-center gap-2 rounded-md ">
                                <form
                                    // onSubmit={handleSubmit((data) => { // clear state when submit
                                    //     onSubmit(data);
                                    //     setEmailGroup([]);
                                    // })}
                                    onSubmit={handleSubmit(handleSaveConfirm)}
                                    className="bg-white p-8 rounded-[20px] shadow-lg max-w !w-[600px]"
                                >
                                    <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-5">{mode == "create" ? `New Email Group For Event` : mode == "edit" ? "Edit Email Group For Event" : "View Email Group For Event"}</h2>
                                    <div className="grid grid-cols-2 gap-2">

                                        <div >
                                            <label
                                                htmlFor="user_type_id"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`User Type`}
                                            </label>
                                            <Select
                                                id="user_type_id"
                                                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                {...register("user_type_id", { required: "Select User Type", })}
                                                disabled={isReadOnly}
                                                value={watch("user_type_id") || ""}
                                                className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.user_type_id && "border-red-500"}`}
                                                sx={{
                                                    '.MuiOutlinedInput-notchedOutline': {
                                                        borderColor: errors.user_type_id && (!watch("user_type_id") || watch("user_type_id").length < 1) ? '#FF0000' : '#DFE4EA',
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: errors.user_type_id && !watch("user_type_id") ? "#FF0000" : "#d2d4d8",
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#d2d4d8',
                                                    },
                                                }}
                                                onChange={(e) => {
                                                    setValue("user_type_id", e.target.value);
                                                    setValue("group_id", null); // clear ที่เลือก group ไว้ถ้ากดเลือก user type ใหม่
                                                    setValue("email", null); // clear ที่เลือก email ไว้ถ้ากดเลือก user type ใหม่
                                                    getGroupByType(e.target.value)
                                                    clearErrors('user_type_id');
                                                }}
                                                displayEmpty
                                                renderValue={(value: any) => {
                                                    if (!value) {
                                                        return <Typography color="#9CA3AF" className={isReadOnly ? 'opacity-0' : 'opacity-100'} fontSize={14}>Select User Type</Typography>;
                                                    }
                                                    return <span className={itemselectClass}>{userTypeMaster?.find((item: any) => item.id === value)?.name || ''}</span>;
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
                                                {userTypeMaster?.map((item: any) => (
                                                    <MenuItem key={item.id} value={item.id}>
                                                        {item.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.user_type_id && (<p className="text-red-500 text-sm">{`Select User Type`}</p>)}
                                        </div>

                                        <div >
                                            <label
                                                htmlFor="group_id"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Group Name`}
                                            </label>
                                            <Select
                                                id="group_id"
                                                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                {...register("group_id", { required: "Select Group Name", })}
                                                disabled={isReadOnly}
                                                value={watch("group_id") || ""}
                                                className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.group_id && "border-red-500"}`}
                                                sx={{
                                                    '.MuiOutlinedInput-notchedOutline': {
                                                        borderColor: errors.group_id && (!watch("group_id") || watch("group_id").length < 1) ? '#FF0000' : '#DFE4EA',
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: errors.group_id && !watch("group_id") ? "#FF0000" : "#d2d4d8",
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#d2d4d8',
                                                    },
                                                }}
                                                onChange={(e) => {
                                                    setValue("group_id", e.target.value);
                                                    setValue("email", null); // clear ที่เลือก email ไว้ถ้ากดเลือก shipper ใหม่
                                                    getUserUnderGroup(e.target.value)
                                                    clearErrors('group_id');
                                                }}
                                                displayEmpty
                                                renderValue={(value: any) => {
                                                    if (!value) {
                                                        return <Typography color="#9CA3AF" className={isReadOnly ? 'opacity-0' : 'opacity-100'} fontSize={14}>Select Group Name</Typography>;
                                                    }
                                                    return <span className={itemselectClass}>{dataGroup?.length > 0 && dataGroup?.find((item: any) => item.id === value)?.name || ''}</span>;
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
                                                {dataGroup?.length > 0 && dataGroup?.map((item: any) => (
                                                    <MenuItem key={item.id} value={item.id}>
                                                        {item.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.group_id && (<p className="text-red-500 text-sm">{`Select Group Name`}</p>)}
                                        </div>

                                        <div className="col-span-2">
                                            <label
                                                htmlFor="name"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Email Group Name For Event`}
                                            </label>
                                            <input
                                                id="name"
                                                type="text"
                                                placeholder="Enter Email Group Name"
                                                readOnly={isReadOnly}
                                                {...register("name", { required: "Enter Email Group Name" })}
                                                className={`${inputClass} ${errors.name && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                            />
                                            {errors.name && (
                                                <p className="text-red-500 text-sm">{`Enter Email Group Name`}</p>
                                            )}
                                        </div>

                                        {/* <div className="pt-2 col-span-2">
                                            <label
                                                htmlFor="email"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Add Email`}
                                            </label>

                                            <div className="flex items-center gap-2 ">
                                                <input
                                                    id="email"
                                                    type="email"
                                                    value={watch("email")}
                                                    placeholder="Enter Email"
                                                    readOnly={isReadOnly}
                                                    {...register("email")}
                                                    className={`${inputClass} ${errors.email && "border-red-500"} ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                />

                                                <AddOutlinedIcon
                                                    sx={{ fontSize: 33, width: 44, height: 44 }}
                                                    className={`text-[#ffffff]  border rounded-md p-1 cursor-pointer ${isReadOnly || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watch("email")) ? 'bg-[#58585A] border-gray-500' : 'bg-[#24AB6A] border-[#24AB6A]'}`}
                                                    onClick={() => {
                                                        const email: any = watch("email");
                                                        if (!isReadOnly && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                                                            if (!emailGroup?.includes(email)) {
                                                                setAlertDupMail(false);
                                                                addEmailGroup(email);
                                                            } else {
                                                                setAlertDupMail(true);
                                                                // alert("Email already exists!");
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                            {errors.email && (<p className="text-red-500 text-sm">{`Enter Email`}</p>)}
                                            {alertDupMail && (<p className="text-red-500 text-sm">{`Email already exists!`}</p>)}
                                        </div> */}


                                        <div className="pt-2 col-span-2">
                                            <label
                                                htmlFor="email"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Select Email`}
                                            </label>
                                            <Select
                                                id="email"
                                                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                {...register("email", { required: "Select Email", })}
                                                disabled={isReadOnly}
                                                value={watch("email") ? Array.isArray(watch("email")) ? watch("email") : [watch("email")] : []}
                                                className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.email && "border-red-500"}`}
                                                // sx={selectboxSx}
                                                sx={{
                                                    '.MuiOutlinedInput-notchedOutline': {
                                                        borderColor: errors.email && (!watch("email") || watch("email").length < 1) ? '#FF0000' : '#DFE4EA',
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: errors.email && !watch("email") ? "#FF0000" : "#d2d4d8",
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#d2d4d8',
                                                    },
                                                }}
                                                multiple
                                                onChange={(e: any) => {
                                                    const value = watch("email") ? Array.isArray(watch("email")) ? watch("email") : [watch("email")] : []
                                                    const selectedValues = e.target.value as string[];
                                                    let newValues;
                                                    let emailVal;

                                                    if (selectedValues.includes("all")) {
                                                        newValues = value.length === dataUser?.length ? [] : dataUser?.map((item: any) => item.email);
                                                        emailVal = value.length === dataUser?.length ? [] : dataUser?.map((item: any) => item.email);
                                                    } else {
                                                        newValues = selectedValues;

                                                        const filter_x = dataUser.filter((item: any) => selectedValues.map(String).includes(String(item.email)));
                                                        const emails = filter_x.map((u: any) => u.email);
                                                        emailVal = emails
                                                    }
                                                    setSelectedUserMail(emailVal)
                                                    setValue("email", newValues);
                                                    clearErrors('email');
                                                }}
                                                displayEmpty
                                                renderValue={(selected) => {
                                                    let selectedList = []
                                                    if (selected) {
                                                        if (Array.isArray(selected)) {
                                                            selectedList = selected
                                                        }
                                                        else {
                                                            selectedList = [selected]
                                                        }
                                                    }
                                                    if (selectedList.length === 0) {
                                                        return <Typography color="#9CA3AF" className={isReadOnly ? 'opacity-0' : 'opacity-100'} fontSize={14}>Select Email</Typography>;
                                                    }

                                                    const selectedOptions = dataUser?.filter((item: any) => selectedList.includes(item.email));
                                                    return (
                                                        <span className={itemselectClass}>
                                                            {selectedOptions.map((option: any) => option.email).join(", ")}
                                                        </span>
                                                    );
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
                                                {/* Select All Option */}
                                                <MenuItem value="all" sx={{ fontSize: "14px", color: "#454255" }}>
                                                    <Checkbox checked={(watch("email") ? Array.isArray(watch("email")) ? watch("email") : [watch("email")] : []).length === dataUser?.length} sx={{ padding: "0px", marginRight: "8px" }} />
                                                    <ListItemText primary={<span style={{ fontWeight: 'bold', fontSize: "14px" }}>{"Select All"}</span>} />
                                                </MenuItem>

                                                {/* Other Options */}
                                                {dataUser?.map((item: any) => {
                                                    return (
                                                        <MenuItem key={item.email} value={item.email} sx={{ fontSize: "14px", color: "#454255" }}>
                                                            <Checkbox checked={(watch("email") ? Array.isArray(watch("email")) ? watch("email") : [watch("email")] : []).includes(item.email)} sx={{ padding: "0px", marginRight: "8px" }} />
                                                            <ListItemText primary={item.email} />
                                                        </MenuItem>
                                                    )
                                                })}
                                            </Select>
                                            {errors.email && (<p className="text-red-500 text-sm">{`Select Email`}</p>)}
                                        </div>
                                    </div>

                                    {/* <div className="flex flex-wrap gap-2 pt-3 mt-3 w-full max-h-[120px] overflow-y-auto">
                                        {
                                            emailGroup && emailGroup?.map((item: any, index: number) => (
                                                <div
                                                    key={index}
                                                    className="relative w-fit h-[35px] p-2 text-[13px] bg-[#F3F2F2] border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                                >
                                                    {item}
                                                    <button
                                                        type="button"
                                                        className="absolute top-[-6px] right-[-4px] w-[15px] h-[15px] rounded-full bg-[#58585A] text-white flex justify-center items-center text-[8px]"
                                                        onClick={() => removeEmail(index)}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))
                                        }
                                    </div> */}

                                    <div className="flex flex-wrap gap-2 pt-3 mt-3 w-full max-h-[120px] overflow-y-auto">
                                        {
                                            selectedUserMail && selectedUserMail?.map((item: any, index: number) => (
                                                <div
                                                    key={index}
                                                    className="relative w-fit h-[35px] p-2 text-[13px] bg-[#F3F2F2] border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                                >
                                                    {item}
                                                    {!isReadOnly &&
                                                        <button
                                                            type="button"
                                                            className="absolute top-[-6px] right-[-4px] w-[15px] h-[15px] rounded-full bg-[#58585A] text-white flex justify-center items-center text-[8px]"
                                                            onClick={() => removeEmail(index)}
                                                        >
                                                            ✕
                                                        </button>
                                                    }
                                                </div>
                                            ))
                                        }
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
                    setEmailGroup([]);
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
