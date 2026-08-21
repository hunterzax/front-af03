import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Dialog, DialogPanel } from '@headlessui/react'
import { Checkbox, ListItemText, MenuItem, Select, TextField, Typography } from '@mui/material';
import SelectFormProps from '@/components/other/selectProps';
import { getService } from '@/utils/postService';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Spinloading from '@/components/other/spinLoading';

type FormExampleProps = {
    data: any;
    open: boolean;
    mode: any;
    isLoading?: any;
    dataEmail?: any;
    onSubmitUpdate: SubmitHandler<any>;
    handleClose: () => void;
    //   modeShowDiv: any;
};

const ModalSendEmail: React.FC<FormExampleProps> = ({
    open,
    data,
    dataEmail,
    isLoading,
    onSubmitUpdate,
    handleClose,
    mode
    //   modeShowDiv
}) => {

    const selectboxClass = "flex w-full h-[44px] p-1 ps-[6px] pe-2 !rounded-lg text-gray-900 text-sm block outline-none";
    const labelClass = "block mb-2 text-sm font-light"
    const itemselectClass = "pl-[10px] text-[14px] !w-[80px] !max-w-[120px]"
    const isReadOnly = mode === "view";
    const [dataUserType, setDataUserType] = useState<any>([])
    const [dataUserGroup, setDataUserGroup] = useState<any>([])
    const [dataUser, setDataUser] = useState<any>([])
    const [selectedUserMail, setSelectedUserMail] = useState<any>([]) // email ของ user

    const { register, handleSubmit, setValue, reset, clearErrors, formState: { errors }, watch } = useForm<any>({
        defaultValues: data,
    });

    const fetchUserType = async () => {
        const res_user_type = await getService(`/master/balancing/balance-intraday-dashboard/user-type`);
        setDataUserType(res_user_type)
    }

    const filterGetGroup = (user_type_id?: any) => {
        const filtered_group = dataUserType?.find((item: any) => item?.id == user_type_id)
        setDataUserGroup(filtered_group?.group)
    }

    const filterGetUser = (group_id?: any) => {
        // หาเอาแค่ dataUserGroup.id ที่มีใน group_id แล้วเอาแค่ข้อมูลใน account มาสร้างเป็นตัวแปรใหม่
        const filteredAccounts = dataUserGroup
            .filter((group: any) => group_id.includes(group.id)) // เอาเฉพาะ group ที่ id อยู่ใน group_id
            .flatMap((group: any) => group.account);             // ดึงเฉพาะ account ของแต่ละ group

        setDataUser(filteredAccounts)
    }

    const handleCloseX = () => {
        handleClose();
        clearErrors();
        reset();
    };

    useEffect(() => {
        fetchUserType();
        if (dataEmail) {
            setValue('subject', dataEmail?.subject)
            setValue('detail', dataEmail?.detail)
        }
    }, [dataEmail, open])

    return (
        <Dialog open={open} onClose={handleCloseX} className="relative z-10">
            {/* <div className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity" /> */}
            <div className={["fixed inset-0 bg-black/45", "transition-opacity duration-100 ease-out", open ? "opacity-100" : "opacity-0 pointer-events-none"].join(" ")} />
            <div className="fixed inset-0 z-10 flex items-center justify-center">
                <DialogPanel
                    transition
                    className="flex w-auto transform transition-all bg-white inset-0 rounded-[20px] text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                >
                    <Spinloading spin={isLoading ? false : true} rounded={20} />

                    <div className="flex flex-col items-center gap-2 p-9">
                        <div className="w-[600px]">
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`Send Email`}</h2>
                        </div>

                        <div className="mb-4 w-[100%]">
                            <form
                                onSubmit={handleSubmit((data) => { // clear state when submit
                                    data.user_mail = selectedUserMail ? selectedUserMail : ""
                                    data.group = watch('group') ? watch('group') : ""
                                    // const merged = [data.group, ...data.user_mail].join(', ');
                                    // data.sendEmail = merged
                                    onSubmitUpdate(data);
                                    reset();
                                })}
                            >
                                <div className='pb-1'>
                                    <label
                                        htmlFor="subject"
                                        className="block mb-2 text-sm font-light"
                                    >
                                        <span className="text-red-500">*</span>
                                        {`Subject`}
                                    </label>
                                    <input
                                        id="subject"
                                        {...register("subject", { required: "Enter Subject" })}
                                        type="text"
                                        placeholder="Enter Subject"
                                        readOnly={isReadOnly}
                                        maxLength={200}
                                        onChange={(e) => {
                                            if (e.target.value.length <= 200) {
                                                setValue('subject', e.target.value);
                                            }
                                        }}
                                        className={`text-[16px] border-[1px] border-[#DFE4EA]  bg-white ps-[21px] h-[46px] w-[600px] rounded-lg outline-none bg-opacity-100 focus:border-[#00ADEF] ${errors.subject && "border-red-500"} ${isReadOnly && '!bg-[#EFECEC]'}`}
                                    />

                                    {/* text field ที่มี limit ทำ error อยู่บรรทัดเดียวกันกับ limit */}
                                    <div className="flex justify-between items-center mt-1 text-sm">
                                        {errors.subject ? (
                                            <p className="text-red-500">{`Enter Subject`}</p>
                                        ) : (
                                            <span />
                                        )}
                                        <span className="text-[13px] text-[#B6B6B6]">{watch('subject')?.length || 0} / 200</span>
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        <span className="text-red-500">*</span>
                                        {`Detail`}
                                    </label>
                                    <TextField
                                        {...register('detail', { required: "Enter Detail" })}
                                        value={watch('detail') || ''}
                                        label=""
                                        multiline
                                        placeholder='Enter Detail'
                                        onChange={(e) => {
                                            clearErrors('detail');
                                            if (e.target.value.length <= 1000) {
                                                setValue("detail", e.target.value);
                                            }
                                        }}
                                        rows={4}
                                        sx={{
                                            '.MuiOutlinedInput-root': {
                                                borderRadius: '8px',
                                            },
                                            '.MuiOutlinedInput-notchedOutline': {
                                                // borderColor: '#DFE4EA',
                                                borderColor: errors.detail && !watch('detail') ? '#FF0000' : '#DFE4EA',
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: errors.detail && !watch("detail") ? "#FF0000" : '#DFE4EA !important',
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
                                        className='rounded-lg'
                                    />

                                    {/* text field ที่มี limit ทำ error อยู่บรรทัดเดียวกันกับ limit */}
                                    <div className="flex justify-between items-center mt-1 text-sm">
                                        {errors.detail ? (
                                            <p className="text-red-500">{`Enter Detail`}</p>
                                        ) : (
                                            <span /> // placeholder เพื่อดัน counter ไปขวาสุดแม้ไม่มี error
                                        )}
                                        <span className="text-[13px] text-[#B6B6B6]">{watch('detail')?.length || 0} / 1000</span>
                                    </div>

                                    <div className='grid grid-cols-2 gap-4'>
                                        <div>
                                            <label
                                                htmlFor="user_type"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`User Type`}
                                            </label>

                                            <SelectFormProps
                                                id={'user_type'}
                                                register={register("user_type", { required: "Select User Type" })}
                                                disabled={isReadOnly || mode === 'edit'}
                                                valueWatch={watch("user_type") || ""}
                                                handleChange={(e) => {
                                                    setValue('group', undefined);
                                                    setValue('user_mail', undefined);
                                                    setValue("user_type", e.target.value);
                                                    filterGetGroup(e.target.value);
                                                    if (errors?.user_type) { clearErrors('user_type') }
                                                }}
                                                errors={errors?.user_type}
                                                errorsText={'Select User Type'}
                                                options={dataUserType?.length > 0 ? dataUserType : []}
                                                optionsKey={'id'}
                                                optionsValue={'id'}
                                                optionsText={'name'}
                                                optionsResult={'name'}
                                                placeholder={'Select User Type'}
                                                pathFilter={'name'}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="group"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Company/Group Name`}
                                            </label>

                                            <Select
                                                id="group"
                                                multiple
                                                displayEmpty
                                                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                {...register("group", { required: true })}
                                                disabled={isReadOnly}
                                                value={watch("group") ? Array.isArray(watch("group")) ? watch("group") : [watch("group")] : []}
                                                className={`${selectboxClass} max-w-[600px] ${isReadOnly && '!bg-[#EFECEC]'} ${errors.group && "border-red-500"}`}
                                                sx={{
                                                    maxWidth: 280,
                                                    '.MuiOutlinedInput-notchedOutline': {
                                                        // borderColor: '#DFE4EA', // Change the border color here
                                                        borderColor: errors.group && (!watch("group") || watch("group").length < 1) ? '#FF0000' : '#DFE4EA',
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: errors.group && !watch("group") ? "#FF0000" : "#d2d4d8",
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#d2d4d8',
                                                    },
                                                }}
                                                onChange={(e: any) => {
                                                    const value = watch("group") ? Array.isArray(watch("group")) ? watch("group") : [watch("group")] : []

                                                    const selectedValues = e.target.value as string[];
                                                    let newValues;
                                                    if (selectedValues.includes("all")) {
                                                        newValues = value.length === dataUserGroup.length ? [] : dataUserGroup.map((item: any) => item.id);
                                                    } else {
                                                        newValues = selectedValues;
                                                    }

                                                    setValue("group", newValues);
                                                    filterGetUser(newValues);
                                                    if (errors?.group) { clearErrors('group') }
                                                }}
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
                                                        return <Typography color="#9CA3AF" className={isReadOnly ? 'opacity-0' : 'opacity-100'} fontSize={14}>Select Company / Group Name</Typography>;
                                                    }
                                                    const selectedOptions = dataUserGroup?.filter((item: any) => selectedList.includes(item.id));
                                                    return (
                                                        <span className={itemselectClass}>
                                                            {watch("group").length === dataUserGroup.length ? "Selected All" : selectedOptions.map((option: any) => option.name).join(", ")}
                                                        </span>
                                                    );
                                                }}
                                                MenuProps={{
                                                    PaperProps: {
                                                        style: {
                                                            maxHeight: 48 * 4.5 + 8, // Item height * 4.5 + padding
                                                            // width: 210,
                                                        },
                                                    },
                                                }}
                                            >
                                                <MenuItem value="all" sx={{ fontSize: "14px", color: "#454255" }}>
                                                    <Checkbox checked={(watch("group") ? Array.isArray(watch("group")) ? watch("group") : [watch("group")] : []).length === dataUserGroup?.length} sx={{ padding: "0px", marginRight: "8px" }} />
                                                    <ListItemText primary={<span style={{ fontWeight: 'bold', fontSize: "14px" }}>{"Select All"}</span>} />
                                                </MenuItem>

                                                {dataUserGroup?.map((item: any) => {
                                                    return (
                                                        <MenuItem key={item.id} value={item.id} sx={{ fontSize: "14px", color: "#454255" }}>
                                                            <Checkbox checked={(watch("group") ? Array.isArray(watch("group")) ? watch("group") : [watch("group")] : []).includes(item.id)} sx={{ padding: "0px", marginRight: "8px" }} />
                                                            <ListItemText primary={item.name} />
                                                        </MenuItem>
                                                    )
                                                })}
                                            </Select>
                                            {errors.group && (<p className="text-red-500 text-sm">{`Select Company/Group Name`}</p>)}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="user_mail"
                                        className="block mb-2 text-sm font-light mt-2"
                                    >
                                        {`User`}
                                    </label>

                                    <Select
                                        id="user_mail"
                                        multiple
                                        displayEmpty
                                        IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                        {...register("user_mail", { required: false })}
                                        disabled={isReadOnly}
                                        value={watch("user_mail") ? Array.isArray(watch("user_mail")) ? watch("user_mail") : [watch("user_mail")] : []}
                                        className={`${selectboxClass} max-w-[600px] ${isReadOnly && '!bg-[#EFECEC]'} ${errors.user_mail && "border-red-500"}`}
                                        sx={{
                                            '.MuiOutlinedInput-notchedOutline': {
                                                // borderColor: '#DFE4EA', // Change the border color here
                                                borderColor: errors.user_mail && (!watch("user_mail") || watch("user_mail").length < 1) ? '#FF0000' : '#DFE4EA',
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: errors.user_mail && !watch("user_mail") ? "#FF0000" : "#d2d4d8",
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#d2d4d8',
                                            },
                                        }}
                                        onChange={(e: any) => {
                                            const value = watch("user_mail") ? Array.isArray(watch("user_mail")) ? watch("user_mail") : [watch("user_mail")] : []
                                            const selectedValues = e.target.value as string[];
                                            let newValues;
                                            let emailVal;

                                            if (selectedValues.includes("all")) {
                                                newValues = value.length === dataUser?.length ? [] : dataUser?.map((item: any) => item.id);
                                                emailVal = value.length === dataUser?.length ? [] : dataUser?.map((item: any) => item.email);
                                            } else {
                                                newValues = selectedValues;

                                                const filter_x = dataUser.filter((item: any) => selectedValues.map(String).includes(String(item.id)));
                                                const emails = filter_x.map((u: any) => u.email);
                                                emailVal = emails
                                            }
                                            setSelectedUserMail(emailVal)

                                            setValue("user_mail", newValues);
                                        }}
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
                                                return <Typography color="#9CA3AF" className={isReadOnly ? 'opacity-0' : 'opacity-100'} fontSize={14}>Select User</Typography>;
                                            }
                                            const selectedOptions = dataUser?.filter((item: any) => selectedList.includes(item.id));
                                            return (
                                                <span className={itemselectClass}>
                                                    {/* {selectedOptions.map((option: any) => option.email).join(", ")} */}
                                                    {watch("user_mail").length === dataUser.length ? "Selected All" : selectedOptions.map((option: any) => option.email).join(", ")}

                                                </span>
                                            );
                                        }}
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 48 * 4.5 + 8, // Item height * 4.5 + padding
                                                    // width: 250,
                                                },
                                            },
                                        }}
                                    >
                                        {/* Select All Option */}
                                        <MenuItem value="all" sx={{ fontSize: "14px", color: "#454255" }}>
                                            <Checkbox checked={(watch("user_mail") ? Array.isArray(watch("user_mail")) ? watch("user_mail") : [watch("user_mail")] : []).length === dataUser?.length} sx={{ padding: "0px", marginRight: "8px" }} />
                                            <ListItemText primary={<span style={{ fontWeight: 'bold', fontSize: "14px" }}>{"Select All"}</span>} />
                                        </MenuItem>

                                        {/* Other Options */}
                                        {dataUser?.map((item: any) => {
                                            return (
                                                <MenuItem key={item.id} value={item.id} sx={{ fontSize: "14px", color: "#454255" }}>
                                                    <Checkbox checked={(watch("user_mail") ? Array.isArray(watch("user_mail")) ? watch("user_mail") : [watch("user_mail")] : []).includes(item.id)} sx={{ padding: "0px", marginRight: "8px" }} />
                                                    <ListItemText primary={item.email} />
                                                </MenuItem>
                                            )
                                        })}
                                    </Select>
                                </div>

                                <div className="flex justify-end pt-8">
                                    <button type="button" onClick={handleCloseX} className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500">
                                        {`Cancel`}
                                    </button>

                                    <button type="submit" className="w-[167px] h-[44px] font-semibold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
                                        {`Send`}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default ModalSendEmail;