import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import Spinloading from '@/components/other/spinLoading';
import SelectFormProps from '@/components/other/selectProps';
import ModalConfirmSave from '@/components/other/modalConfirmSave';

type FormData = {
    id: '',
    mode_account: any,
    // mode_account: [],
    role: '',
    system_login_account: any,
};

type FormExampleProps = {
    mode?: 'create' | 'edit' | 'view';
    // dataForm?: Partial<FormData>;
    dataForm?: any;
    dataPost: any;
    setDataPost: any;
    dataDefaultRole: any;
    open: boolean;
    onClose: () => void;
    onSubmit: SubmitHandler<FormData>;
    setResetForm: (reset: () => void) => void;
    setSystemLoginAccount: any;
    setRoleDefaultUse: any;
    setUserData: any;
    setSelectedItems: any;
    systemLoginAccount: any;
    roleDefaultUse: any;
    userData: any;
    selectedItems: any;
    setModeLogIn: any;
    srchLginMode: any;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode = 'create',
    dataForm = {},
    open,
    dataDefaultRole,
    dataPost,
    setDataPost,
    onClose,
    onSubmit,
    setResetForm,
    setSystemLoginAccount,
    setRoleDefaultUse,
    setUserData,
    setSelectedItems,
    systemLoginAccount,
    roleDefaultUse,
    userData,
    selectedItems,
    setModeLogIn,
    srchLginMode
}) => {
    const { register, handleSubmit, setValue, reset, clearErrors, formState: { errors }, watch } = useForm<FormData>({ defaultValues: dataForm });

    const isReadOnly = mode === 'view';
    const labelClass = "block mb-2 text-[14px] font-light"
    const inputClass = "text-[14px] block md:w-full p-2 ps-5 focus:!ps-5 hover:!ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"

    const [userDataMaster, setUserDataMaster] = useState<any>([]);
    const [selectedMode, setSelectedMode] = useState<any>('Local Login');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const roleValue: any = watch('role');
    const userValue: any = watch('system_login_account');

    {/* Confirm Save */ }
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()

    const handleAddClick = () => {
        const filterUserData: any = userData?.filter((item: any) => item?.account_manage?.account?.id === userValue);

        const makeData: any = userDataMaster?.map((mf: any) => {
            return ({
                ...mf,
                selected: mf?.account_userid == userValue ? true : mf?.selected,
            })
        });
        setUserDataMaster(makeData)

        if (roleValue && userValue) {
            setSelectedItems((pre: any) => [...pre, { role: roleValue, user: userValue, user_data: {...filterUserData[0]?.account_manage?.account, mode_account: filterUserData[0]?.account_manage?.mode_account}, mode_account_id: srchLginMode }])
            setDataPost((pre: any) => [...pre, { role: roleValue, user: userValue, user_data: filterUserData[0]?.account_manage?.account, mode_account_id: srchLginMode }])
            setUserData((pre: any) => [...pre.filter((item: any) => { return item?.account_manage?.account_id !== userValue })])
        } else {
            // Please select both Role and User
        }
    };

    const handleDelete = (indexToRemove: any, item: any) => {
        const makeData: any = userDataMaster?.map((mf: any) => {
            return ({
                ...mf,
                selected: mf?.account_userid == item?.user ? false : mf?.selected,
            })
        });
        setUserDataMaster(makeData)

        setSelectedItems((pre: any) => {
            const sItem = pre?.filter((f: any) => { return f?.user_data?.id !== item?.user_data?.id })
            return sItem || []
        })
        setUserData((pre: any) => {
            return [...pre, {
                account_manage: {
                    account: {
                        ...item?.user_data
                    }, account_id: item?.user_data?.id
                }
            }]
        })
        const genarateDataPost: any = dataPost?.filter((fitem: any) => fitem?.user !== item?.user);
        setDataPost(genarateDataPost);
    };

    // delete edit
    // const handleDeleteUse = (indexToRemove: any) => {
    //     setSystemLoginAccount(systemLoginAccount.filter((_: any, index: any) => index !== indexToRemove));
    // };

    // #region user under role
    const getUserUnderRole = async (data: any) => {
        const filterComp: any = dataDefaultRole?.find((item: any) => item.id === data?.value);
        setUserData(filterComp?.account_role)

        const makeData: any = filterComp?.account_role?.map((item: any) => {
            return {
                ...item,
                account_fullname: `${item?.account_manage?.account?.first_name} ${item?.account_manage?.account?.last_name}`,
                account_userid: item?.account_manage?.account?.id,
                selected: false
            }
        })

        setUserDataMaster(makeData)
    };

    useEffect(() => {
        const makeData: any = userData?.map((item: any) => {
            return {
                ...item,
                account_fullname: `${item?.account_manage?.account?.first_name} ${item?.account_manage?.account?.last_name}`,
                account_userid: item?.account_manage?.account?.id,
                selected: false
            }
        })
        setUserDataMaster(makeData)
    }, [userData])

    useEffect(() => {
        if (dataForm) {
            const fetchAndSetData = async () => {
                setSelectedMode('Local Login');
                if (mode == 'create') {
                    setSelectedMode('Local Login')
                    setIsLoading(false);
                } else if (mode === 'edit' || mode === 'view') {
                    setIsLoading(true);
                    setValue('id', dataForm?.id || '');
                    setValue('mode_account', selectedMode || '');
                    setValue('role', dataForm?.role || '');
                    setSelectedMode(dataForm?.mode_account_id == 2 ? 'Local Login' : 'SSO Login');

                    setTimeout(() => {
                        if (dataForm) { setIsLoading(false); }
                    }, 300);
                }
            }
            fetchAndSetData();
        }else{
            resetThis();
        }
    }, [dataForm, mode, setValue]);

    const resetThis = () => {
        setResetForm(() => reset);
        setSelectedItems([]);
        setDataPost([]);
    }

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    const handleClose = () => {
        resetThis();
        onClose();
    };

    const resetVal = () => {
        setValue('id', "");
        setValue('mode_account', "");
        setValue('role', "");
        setSelectedMode("");
        setDataPost([])
        setUserData([])
        setSelectedItems([]);
    }

    const handleModeChange = (value: any) => {
        setSelectedMode(value);
        setValue('mode_account', value || '');
        setModeLogIn(value)
        // Add any additional action here, e.g., updating state or making an API call
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

    return (<>
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
                            <div className="flex flex-col items-center justify-center gap-2 rounded-md w-[700px]">
                                <Spinloading spin={isLoading} rounded={20} /> {/* loading example here */}
                                <form
                                    // onSubmit={handleSubmit(onSubmit)} 
                                    // onSubmit={handleSubmit(async (data) => { // clear state when submit
                                    //     setIsLoading(true);
                                    //     setTimeout(async () => {
                                    //         await onSubmit(data);
                                    //         resetVal(); // reset value after submit
                                    //     }, 100);
                                    // })}
                                    onSubmit={handleSubmit(handleSaveConfirm)}
                                    className='bg-white p-8 rounded-[20px] shadow-lg w-full max-w'
                                >
                                    <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-5">{mode == "create" ? `Configure` : 'Edit'}</h2>
                                    <div className="pb-2">
                                        <div className="flex items-center space-x-2 mb-5">
                                            <label htmlFor="mode_account" className="block mb-1 mr-4 text-[14px] font-light">
                                                <span className='font-bold'>{`System Login Mode`}</span>
                                            </label>
                                            <div id="mode_account" className="flex space-x-4">
                                                {[{ key: 'SSO Login', label: 'SSO Login' }, { key: 'Local Login', label: 'LOCAL Login' }].map((value, index) => (
                                                    <label key={index} className="inline-flex items-center space-x-2">
                                                        <input
                                                            type="radio"
                                                            {...register('mode_account')}
                                                            // value={value}
                                                            // defaultChecked={value === 'Local Login'}
                                                            defaultChecked={selectedMode === 'Local Login'}
                                                            // checked={selectedMode == value}
                                                            checked={mode == 'create' ? true : selectedMode == value?.key}
                                                            onChange={() => {
                                                                handleModeChange(value?.key)
                                                            }}
                                                            disabled={mode === 'edit' ? false : true}
                                                        />
                                                        <span className="text-sm text-gray-700">{value?.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-[45%_46%_9%]">
                                        <div className="w-full pb-2">
                                            <label className={labelClass}>
                                                <span className="text-red-500">*</span>{`Role Name`}
                                            </label>

                                            {
                                                mode === "edit" ?
                                                    <div>
                                                        <input
                                                            id="non_tpa_point_name"
                                                            type="text"
                                                            value={roleDefaultUse[0]?.name}
                                                            placeholder="Enter Nomination Point"
                                                            readOnly={isReadOnly}
                                                            disabled={true}
                                                            className={`${inputClass} !bg-[#EFECEC]`}
                                                        />
                                                    </div>
                                                    : <>
                                                        <SelectFormProps
                                                            id={'role'}
                                                            register={register("role", { required: "Select default role" })}
                                                            disabled={selectedItems?.length > 0}
                                                            valueWatch={watch("role") || ""}
                                                            handleChange={(e) => {
                                                                setValue('role', e.target.value);
                                                                setValue('system_login_account', undefined)
                                                                getUserUnderRole(e?.target);
                                                                if (errors?.role) { clearErrors('role') }
                                                            }}
                                                            errors={errors?.role}
                                                            errorsText={'Select default role'}
                                                            options={
                                                                mode == 'create' ?
                                                                    dataDefaultRole?.filter((item: any) => (item.end_date === null || new Date(item.end_date) >= new Date()) && item.id !== 1)
                                                                    :
                                                                    roleDefaultUse?.filter((item: any) => (item.end_date === null || new Date(item.end_date) >= new Date()) && item.id !== 1)
                                                            }
                                                            optionsKey={'id'}
                                                            optionsValue={'id'}
                                                            optionsText={'name'}
                                                            optionsResult={'name'}
                                                            placeholder={'Select default role'}
                                                            pathFilter={'name'}
                                                        />
                                                        <span className='text-[#9D9D9D] text-[14px]'>{`You can select only one role.`}</span>
                                                    </>
                                            }
                                            {/* <span className='text-[#9D9D9D] text-[14px]'>{`You can select only one role.`}</span>
                                            {errors.role && !watch('role') && <p className={`${textErrorClass}`}>{`Select default role`}</p>} */}

                                        </div>

                                        <div className="w-full pb-2 pl-2">
                                            <label className={labelClass}>
                                                <span className="text-red-500">*</span>{`Users`}
                                            </label>
                                            <SelectFormProps
                                                id={'select_system_login_account'}
                                                // register={register('system_login_account', { required: selectedItems?.length > 0 ? false : true })}
                                                register={register('system_login_account', { required: false })}
                                                disabled={isReadOnly}
                                                valueWatch={watch('system_login_account') || ''}
                                                handleChange={(e) => {
                                                    setValue('system_login_account', e.target.value);
                                                }}
                                                errors={errors?.role}
                                                errorsText={'Select Users'}
                                                // options={userDataMaster?.filter((item: any) => (item?.selected == false || item?.selected == null))}
                                                options={userDataMaster}
                                                optionsKey={'id'}
                                                optionsValue={'account_userid'}
                                                optionsText={'account_fullname'}
                                                optionsResult={'account_fullname'}
                                                placeholder={'Select User'}
                                                pathFilter={'account_fullname'}

                                            />
                                        </div>

                                        {/* CHECK BY watch('system_login_account') */}
                                        <div
                                            className={`w-full flex items-center justify-end ${!watch('system_login_account') ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                            onClick={() => {
                                                if (watch('system_login_account')) {
                                                    handleAddClick();
                                                    setValue('system_login_account', '');
                                                }
                                            }}
                                        >
                                            <AddOutlinedIcon
                                                sx={{ fontSize: 38, marginTop: mode == 'create' ? '0' : '24px' }}
                                                className={`text-[#ffffff] border  rounded-md p-1 ${!watch('system_login_account') ? 'bg-[#BABABA] border-[#BABABA]' : 'bg-[#24AB6A] border-[#24AB6A]'} `}
                                            />
                                        </div>
                                    </div>

                                    {
                                        selectedItems?.length > 0 && <div className='font-bold px-2 pt-2'>{`User Name`}</div>
                                    }

                                    <div
                                        className={`overflow-y-auto ${selectedItems.length > 3 ? 'max-h-[200px]' : ''}`}
                                    >
                                        {
                                            selectedItems && selectedItems.map((item: any, index: any) => (
                                                <div key={index} className="flex justify-between items-center w-full mt-2 pt-3 pb-3 border rounded-[8px] px-4">
                                                    <div className="flex justify-between items-center">
                                                        <div
                                                            className="flex w-[100px] justify-center rounded-full mr-2 p-1 text-[#464255] capitalize"
                                                                style={{ backgroundColor: item.user_data?.mode_account?.color }}>{item.user_data?.mode_account?.name == 'SSO' ? item.user_data?.mode_account?.name : item.user_data?.mode_account?.name?.toLowerCase()} Mode
                                                        </div>
                                                    <div className="flex flex-col text-[#58585A]">
                                                        {
                                                            item.user_data?.first_name ?
                                                                <div>{`${item.user_data?.first_name} ${item.user_data?.last_name}`}</div>
                                                                :
                                                                <div>{`${item.user_data?.email}`}</div>
                                                        }
                                                    </div>
                                                    </div>
                                                    <DeleteOutlineOutlinedIcon
                                                        sx={{ fontSize: 28, borderRadius: 1 }}
                                                        className="cursor-pointer text-[#EA6060] border border-[#EA6060] rounded-[8px] p-1"
                                                        onClick={() => handleDelete(index, item)}
                                                    />
                                                </div>
                                            ))
                                        }
                                    </div>

                                    <div className="flex justify-end pt-8">
                                        <button type="button" onClick={handleClose} className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500">
                                            {`Cancel`}
                                        </button>
                                        {mode !== 'view' && (
                                            <button
                                                type="submit"
                                                className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                disabled={selectedItems.length <= 0}
                                            >
                                                Save
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
                    resetVal();
                    setTimeout(async () => {
                        await onSubmit(dataSubmit);
                    }, 100);
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