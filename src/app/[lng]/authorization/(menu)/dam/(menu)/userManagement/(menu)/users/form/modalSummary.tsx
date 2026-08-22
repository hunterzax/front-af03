import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { formatFormDate, formatWatchFormDate } from '@/utils/generalFormatter';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import RemoveRedEyeRoundedIcon from '@mui/icons-material/RemoveRedEyeRounded';
import { getService } from '@/utils/postService';

type FormData = {
    status: string;
    reason: string;
};

type FormExampleProps = {
    dataUser: any;
    selectedCompany?: any;
    selectedDiv?: any;
    open: boolean;
    onClose: () => void;
    handleClose: () => void;
    onSubmitUpdate: SubmitHandler<FormData>;
    //   modeShowDiv: any;
};

const ModalSummary: React.FC<FormExampleProps> = ({
    open,
    onClose,
    handleClose,
    dataUser,
    selectedCompany,
    selectedDiv,
    onSubmitUpdate
    //   modeShowDiv
}) => {

    // const labelClass = "block mb-2 text-sm font-light"
    // const selectboxClass = "flex w-full h-[35px] p-1 ps-1 pe-2 !rounded-lg text-gray-900 text-sm block outline-none"
    // const textErrorClass = "text-red-500 text-sm"
    const inputClass = "text-sm block md:w-full py-2 p-2 ps-5 pe-10 h-[40px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"
    const [passwordValue, setPasswordValue] = useState(dataUser[0]?.passwordGen);
    const [companyData, setCompanyData] = useState<any>([]);
    const [divisionData, setDivisionData] = useState<any>([]);
    const [roleData, setRoleData] = useState<any>([]);
    const [isCopied, setIsCopied] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    useEffect(() => {
        // setResetForm(() => reset);
        setPasswordValue(dataUser[0]?.passwordGen);
    }, []);

    const copyToClipboard = () => {
        // navigator.clipboard.writeText(passwordValue).then(() => {
        navigator.clipboard.writeText(dataUser[0]?.passwordGen).then(() => {
            setIsCopied(true);
            setTimeout(() => {
                setIsCopied(false);
            }, 2000); // ซ่อน noti หลัง 2 วินาที
        });
    };

    const fetchData = async (id: any) => {
        try {
            // const response: any = await getService(`/master/account-manage/group-master?user_type=${id}`);
            // setDivisionData(response?.filter((item: any) => item?.division?.id === dataUser[1]?.account_manage?.division_id))
            // setCompanyData(response)
           
            const response_role: any = await getService(`/master/account-manage/role-master`);
            const roleIds = dataUser[1]?.role_manage?.map((role: any) => role.id);
            setRoleData(response_role?.filter((item: any) => roleIds.includes(item.id)));

        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    useEffect(() => {
        if (dataUser[1]?.account_manage?.group_id) {
            fetchData(dataUser[1]?.account_manage?.group_id);
        }
    }, [dataUser?.[1]?.account_manage?.group_id])

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };
    return (
        <Dialog open={open} onClose={onClose} className="relative z-20">
            {/* <div className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity" /> */}
            <div className={["fixed inset-0 bg-black/45", "transition-opacity duration-100 ease-out", open ? "opacity-100" : "opacity-0 pointer-events-none"].join(" ")} />
            <div className="fixed inset-0 z-10 flex items-center justify-center">
                <DialogPanel
                    transition
                    className="flex w-auto transform transition-all bg-white inset-0 rounded-[20px] text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                >
                    <div className="flex flex-col gap-2 p-9">
                        <div className="w-[500px] ">
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`Generated app password`}</h2>
                            {/* <h2 className="text-xl font-bold text-[#4D4D4D] mb-4 pb-3 justify-center items-center">{`Your Password`}</h2> */}

                            <div className="flex justify-center items-center">
                                <h2 className="text-xl font-bold text-[#4D4D4D] mb-2 pb-2">{`Your Password`}</h2>
                            </div>
                            <div>
                                <div className="flex pb-4 gap-2 w-full">
                                    <input
                                        // type="text"
                                        type={isPasswordVisible ? 'text' : 'password'}
                                        className={`${inputClass} !bg-[#00ADEF1A] !border-[#00ADEF1A] !text-[#0E688B] !text-[18px] font-bold text-center !w-[400px] !h-[50px] pointer-events-none user-select-none`}
                                        placeholder=""
                                        // value={data.password_gen_flag ? data.password_gen_origin : '************'}
                                        value={dataUser[0]?.passwordGen}
                                        // value={`XXXTESTSDAK{FO{SxxxxKF}}`}
                                        readOnly={true}
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="w-[50px] h-[50px] font-light bg-[#0E688B] bg-slate-100 text-grey py-2 rounded-lg border flex justify-center items-center hover:bg-rose-500 focus:outline-none focus:bg-rose-500"
                                    >
                                        {/* <RemoveRedEyeRoundedIcon sx={{ color: '#ffffff', fontSize: '22px' }} /> */}
                                        {isPasswordVisible ? (
                                            <RemoveRedEyeRoundedIcon sx={{ color: '#ffffff', fontSize: '22px' }} />
                                        ) : (
                                            <VisibilityOffRoundedIcon sx={{ color: '#ffffff', fontSize: '22px' }} />
                                        )}
                                    </button>
                                    <div className="relative flex items-center">
                                        <button
                                            type="button"
                                            onClick={copyToClipboard}
                                            className="w-[50px] h-[50px] font-light bg-[#24AB6A] text-grey py-2 rounded-lg border flex justify-center items-center hover:bg-rose-500 focus:outline-none focus:bg-rose-500"
                                        >
                                            <ContentCopyOutlinedIcon sx={{ color: '#ffffff', fontSize: '18px' }} />
                                        </button>

                                        {isCopied && (
                                            <div className="absolute top-[-40px] left-[-10px] transform -translate-x-1/2 bg-green-500 text-white px-2 py-1 rounded animate-fadeInOut">
                                                Copied!
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>

                            <div className='w-full h-auto bg-[#17171708] rounded-[20px] p-8'>
                                <div className="grid grid-cols-[250px_250px] text-sm font-semibold w-[400px]">
                                    <div className="flex flex-col pb-2 w-[75%]">
                                        <p>{`Login Mode`}</p>
                                        {/* <p className="font-light">{dataUser[0]?.data?.user_id}</p> */}
                                        <p className="font-light">{dataUser[1]?.account_manage?.mode_account_id == '2' ? 'LOCAL' : 'SSO'}</p>
                                    </div>
                                    <div className="flex flex-col pb-2 w-[75%]">
                                        <p>{`User ID`} </p>
                                        <p className="font-light">{dataUser[0]?.data?.user_id}</p>
                                    </div>
                                    <div className="flex flex-col pb-2 w-[75%] pt-4">
                                        <p>{`User Type`} </p>
                                        <p className="font-light">{dataUser[1]?.account_manage?.user_type_id == '2' ? 'TSO' : dataUser[1]?.account_manage?.user_type_id == '3' ? 'Shipper' : "Other"}</p>
                                    </div>
                                    <div className="flex flex-col pb-2 w-[75%] pt-4">
                                        <p>{`Company/Group Name`} </p>
                                        {/* <p className="font-light">{companyData[0] && companyData[0]?.name}</p> */}
                                        <p className="font-light">{selectedCompany}</p>
                                    </div>
                                    <div className="flex flex-col pb-2 w-[75%] pt-4">
                                        <p>{`Division`} </p>
                                        {/* <p className="font-light">{divisionData.length > 0 ? divisionData[0]?.division_name : ''}</p> */}
                                        <p className="font-light">{selectedDiv}</p>
                                    </div>
                                    <div className="flex flex-col pb-2 w-[75%] pt-4">
                                        <p>{`Role`} </p>
                                        <p className="font-light">{roleData?.map((role: any) => role.name).join(', ')}</p>
                                    </div>
                                    <div className="flex flex-col pb-2 w-[75%] pt-4">
                                        <p>{`First Name`} </p>
                                        <p className="font-light">{dataUser[0]?.data?.first_name}</p>
                                    </div>
                                    <div className="flex flex-col pb-2 w-[75%] pt-4">
                                        <p>{`Last Name`} </p>
                                        <p className="font-light">{dataUser[0]?.data?.last_name}</p>
                                    </div>
                                    <div className="flex flex-col pb-2 w-[75%] pt-4">
                                        <p>{`Telephone`} </p>
                                        <p className="font-light">{dataUser[0]?.data?.telephone}</p>
                                    </div>
                                    <div className="flex flex-col pb-2 w-[75%] pt-4">
                                        <p>{`Email`} </p>
                                        <p className="font-light">{dataUser[0]?.data?.email}</p>
                                    </div>
                                    <div className="flex flex-col pb-2 w-[75%] pt-4">
                                        <p>{`Address`} </p>
                                        <p className="font-light break-words whitespace-normal">{dataUser[0]?.data?.address}</p>
                                    </div>
                                    {/* <div className="flex flex-col pb-2 w-[75%] pt-4">
                                        <p>{`Address Detail`} </p>
                                        <p className="font-light break-words whitespace-normal">{dataUser[0]?.data?.detail}</p>
                                    </div> */}
                                    <div className="flex flex-col pb-2 w-[75%] pt-4">
                                        <p>{`Start Date`} </p>
                                        <p className="font-light">{dataUser[0]?.data?.start_date && formatFormDate(dataUser[0]?.data?.start_date)}</p>
                                    </div>
                                    <div className="flex flex-col pb-2 w-[75%] pt-4">
                                        <p>{`End Date`} </p>
                                        <p className="font-light">{dataUser[0]?.data?.end_date && formatFormDate(dataUser[0]?.data?.end_date)}</p>
                                    </div>
                                    <div className="flex flex-col pb-2 w-[75%] pt-4">
                                        <p>{`Status`} </p>
                                        <p className="font-light">{dataUser[0]?.data?.status ? 'Active' : 'Inactive'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* <div className="mb-4 w-[100%]">
                                <div className="grid grid-cols-[400px_300px] text-sm font-semibold w-[400px]">
                                    <div>
                                        <p className="text-sm pb-2 font-bold text-[#464255]">User Detail</p>
                                        <div className="flex pb-2 w-[75%]">
                                            <p >{`Login Mode`} </p><p className="font-light ml-2">: {dataUser[0]?.data?.user_id}</p>
                                        </div>
                                        <div className="flex pb-2 w-[75%]">
                                            <p>{`User ID`} </p><p className="font-light ml-2">: {dataUser[0]?.data?.user_id}</p>
                                        </div>
                                        <div className="flex pb-2 w-[75%]">
                                            <p>{`User Type`} </p><p className="font-light ml-2">: {dataUser[0]?.account_manage?.mode_account_id == '2' ? 'LOCAL' : 'SSO'}</p>
                                        </div>
                                        <div className="flex pb-2 w-[75%]">
                                            <p>{`Company/Group Name`} </p><p className="font-light ml-2">: {companyData[0] && companyData[0]?.name}</p>
                                        </div>
                                        <div className="flex pb-2 w-[75%]">
                                            <p>{`Division`} </p><p className="font-light ml-2">: {divisionData[0] && divisionData[0]?.division_name}</p>
                                        </div>
                                        <div className="flex pb-2 w-[75%]">
                                            <p>{`Role`} </p><p className="font-light ml-2">: {roleData?.map((role: any) => role.name).join(', ')}</p>
                                        </div>
                                        <div className="flex pb-2 w-[75%]">
                                            <p>{`First Name`} </p><p className="font-light ml-2">: {dataUser[0]?.data?.first_name}</p>
                                        </div>
                                        <div className="flex pb-2 w-[75%]">
                                            <p>{`Last Name`} </p><p className="font-light ml-2">: {dataUser[0]?.data?.last_name}</p>
                                        </div>
                                        <div className="flex pb-2 w-[75%]">
                                            <p>{`Telephone`} </p><p className="font-light ml-2">: {dataUser[0]?.data?.telephone}</p>
                                        </div>
                                        <div className="flex pb-2 w-[75%]">
                                            <p>{`Email`} </p><p className="font-light ml-2">: {dataUser[0]?.data?.email}</p>
                                        </div>
                                        <div className="flex pb-2 w-[75%]">
                                            <p>{`Address`} </p><p className="font-light ml-2">: {dataUser[0]?.data?.address}</p>
                                        </div>
                                        <div className="flex pb-2 w-[75%]">
                                            <p>{`Address Detail`} </p><p className="font-light ml-2">: {dataUser[0]?.data?.detail}</p>
                                        </div>
                                        <div className="flex pb-2 w-[75%]">
                                            <p>{`Start Date`} </p><p className="font-light ml-2">: {dataUser[0]?.data?.start_date && formatFormDate(dataUser[0]?.data?.start_date)}</p>
                                        </div>
                                        <div className="flex pb-2 w-[75%]">
                                            <p>{`End Date`} </p><p className="font-light ml-2">: {dataUser[0]?.data?.end_date && formatFormDate(dataUser[0]?.data?.end_date)}</p>
                                        </div>
                                        <div className="flex pb-2 w-[75%]">
                                            <p>{`Status`} </p><p className="font-light ml-2">: {dataUser[0]?.data?.status ? 'Active' : 'Inactive'}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm pb-2 font-bold text-[#464255]">Your password</p>
                                        <div className="flex pb-2 gap-2 w-full">
                                            <input
                                                type="text"
                                                className={`${inputClass} bg-[#FFEEBB] text-center w-full pointer-events-none user-select-none`}
                                                placeholder=""
                                                // value={data.password_gen_flag ? data.password_gen_origin : '************'}
                                                value={dataUser[0]?.passwordGen}
                                                readOnly={true}
                                            />
                                            <button
                                                type="button"
                                                onClick={copyToClipboard}
                                                className="w-10 h-9 font-light bg-slate-100 text-grey py-2 rounded-lg border flex justify-center items-center hover:bg-rose-500 focus:outline-none focus:bg-rose-500"
                                            >
                                                <ContentCopyOutlinedIcon />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div> */}
                        </div>

                        <div className=" pt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-[140px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500"
                            >
                                {`Close`}
                            </button>
                        </div>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default ModalSummary;