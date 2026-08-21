import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Dialog, DialogPanel } from '@headlessui/react'
import { Checkbox, ListItemText, MenuItem, Select, TextField, Typography } from '@mui/material';
import Spinloading from '@/components/other/spinLoading';
import SelectFormProps from '@/components/other/selectProps';
import { getService } from '@/utils/postService';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import dayjs from 'dayjs';
import getUserValue from '@/utils/getuserValue';

type FormExampleProps = {
    data: any;
    dataEmail?: any;
    isLoading?: any;
    open: boolean;
    mode: any;
    onSubmitUpdate: SubmitHandler<any>;
    handleClose: () => void;
    //   modeShowDiv: any;
    fillModal: any;
    srchStartDate?: any;
    uiFilter_?: any;
    dataShipper?: any;
};

const selectboxClass = "flex w-full h-[44px] p-1 ps-[6px] pe-2 !rounded-lg text-gray-900 text-sm block outline-none";
const itemselectClass = "pl-[10px] text-[14px]"

const ModalSendEmail: React.FC<FormExampleProps> = ({
    open,
    data,
    dataEmail,
    isLoading,
    onSubmitUpdate,
    handleClose,
    mode,
    fillModal,
    srchStartDate, uiFilter_, dataShipper
}) => {
    const userDT: any = getUserValue();

    const labelClass = "block mb-2 text-sm font-light"
    const isReadOnly = mode === "view";
    const [dataUserType, setDataUserType] = useState<any>([])
    const [dataUserGroup, setDataUserGroup] = useState<any>({})
    const [dataUser, setDataUser] = useState<any>([])
    const [selectedGroupEmail, setSelectedGroupEmail] = useState<any>() // email ของ group
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
        const filtered_user = dataUserGroup?.find((item: any) => item?.id == group_id)
        setSelectedGroupEmail(filtered_user?.email)
        setDataUser(filtered_user?.account)
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
    }, [dataEmail])

    useEffect(() => {
       
      if(fillModal?.type === "Shipper"){
        setValue('group', undefined);
        setValue('user_mail', undefined);
        setValue("user_type", 3);
        filterGetGroup(3);

        if(fillModal?.shipperName && dataUserGroup?.length > 0){
            const filShipper = dataUserGroup?.find((f:any) => f?.id_name === fillModal?.shipperName)
            setValue("group", filShipper?.id);
            filterGetUser(filShipper?.id);
        }
      }
    }, [fillModal, dataUserGroup])

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
                            <div className='pb-4 text-sm font-light'>
                                    <label
                                        htmlFor="subject"
                                        className="block mb-2 text-sm font-light"
                                    >
                                        {`Filter`}
                                    </label>
                            {
                                userDT?.account_manage?.[0]?.user_type_id == 3 ?
                                    `Gas Day: ${srchStartDate ? dayjs(srchStartDate).format("DD/MM/YYYY") : dayjs().format("DD/MM/YYYY")} | Type: Shipper | Shipper Name: ${userDT?.account_manage?.[0]?.group?.name || ""}`
                                    : `Gas Day: ${uiFilter_?.gasDay || ""} | Type: ${uiFilter_?.type || ""} | Shipper Name: ${dataShipper?.find((f: any) => f?.id_name === uiFilter_?.shipperName)?.name || ""}`
                            }
                            </div>
                            <form
                                onSubmit={handleSubmit((data) => { // clear state when submit
                                    data.user_mail = selectedUserMail ? selectedUserMail : ""
                                    data.group = selectedGroupEmail ? selectedGroupEmail : ""
                                    const merged = [data.group, ...data.user_mail].join(', ');
                                    data.sendEmail = merged
                                    delete data.user_type
                                    delete data.group
                                    delete data.user_mail


                                    onSubmitUpdate(data);
                                    reset();
                                })}
                            >
                                <div className='pb-4'>
                                    <label
                                        htmlFor="subject"
                                        className="block mb-2 text-sm font-light"
                                    >
                                        <span className="text-red-500">*</span>
                                        {`Subject`}
                                    </label>
                                    <input
                                        id="subject"
                                        {...register("subject", { required: "Type subject" })}
                                        type="text"
                                        placeholder="Enter Subject"
                                        readOnly={isReadOnly}
                                        maxLength={75}
                                        onChange={(e) => {
                                            if (e.target.value.length <= 75) {
                                                setValue('subject', e.target.value);
                                            }
                                        }}
                                        // className={`${inputClass} ${errors.subject && "border-red-500"} ${isReadOnly && '!bg-[#EFECEC]'}`}
                                        className={`text-[16px] border-[1px] bg-white border-[#DFE4EA] ps-[21px] h-[44px] w-[600px] rounded-lg outline-none bg-opacity-100 focus:border-[#00ADEF] ${errors.subject && "border-red-500"} ${isReadOnly && '!bg-[#EFECEC]'}`}
                                    />
                                    <div className="flex justify-end text-[14px] text-[#B6B6B6] mt-1">
                                        <span className="text-[13px]">{watch('subject')?.length || 0} / 75</span>
                                    </div>
                                    {errors.subject && (<p className="text-red-500 text-sm">{`Type subject`}</p>)}
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        <span className="text-red-500">*</span>
                                        {`Detail`}
                                    </label>
                                    <TextField
                                        {...register('detail', { required: "Type detail" })}
                                        value={watch('detail') || ''}
                                        label=""
                                        multiline
                                        placeholder='Enter Detail'
                                        onChange={(e) => {
                                            clearErrors('detail');
                                            if (e.target.value.length <= 2000) {
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
                                        className='rounded-lg'
                                    />
                                    {errors.detail && (<p className="text-red-500 text-sm">{`Type detail`}</p>)}
                                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                        <span className="text-[13px]">
                                            {watch("detail")?.length || 0} / 2000
                                        </span>
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
                                                disabled={isReadOnly || mode === 'edit' || fillModal?.type === "Shipper"}
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

                                            <SelectFormProps
                                                id={'group'}
                                                register={register("group", { required: "Select Group" })}
                                                disabled={isReadOnly || mode === 'edit' || (fillModal?.type === "Shipper" && fillModal?.shipperName)}
                                                valueWatch={watch("group") || ""}
                                                handleChange={(e) => {
                                                    setValue('user_mail', undefined);
                                                    setValue("group", e.target.value);
                                                    filterGetUser(e.target.value);
                                                    if (errors?.group) { clearErrors('group') }
                                                }}
                                                errors={errors?.group}
                                                errorsText={'Select Group'}
                                                options={dataUserGroup?.length > 0 ? dataUserGroup : []}
                                                optionsKey={'id'}
                                                optionsValue={'id'}
                                                optionsText={'name'}
                                                optionsResult={'name'}
                                                placeholder={'Select Group'}
                                                pathFilter={'name'}
                                            />
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
                                                    {selectedOptions.map((option: any) => option.email).join(", ")}
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
                                        {
                                            dataUser?.length > 1 && <MenuItem value="all" sx={{ fontSize: "14px", color: "#454255" }}>
                                                <Checkbox checked={(watch("user_mail") ? Array.isArray(watch("user_mail")) ? watch("user_mail") : [watch("user_mail")] : []).length === dataUser?.length} sx={{ padding: "0px", marginRight: "8px" }} />
                                                <ListItemText primary={<span style={{ fontWeight: 'bold', fontSize: "14px" }}>{"Select All"}</span>} />
                                            </MenuItem>
                                        }

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
                </DialogPanel >
            </div >
        </Dialog >
    );
};

export default ModalSendEmail;