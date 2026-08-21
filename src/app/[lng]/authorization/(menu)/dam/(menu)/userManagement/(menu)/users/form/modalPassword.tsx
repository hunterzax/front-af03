import React, { useEffect, useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import { patchService } from '@/utils/postService';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import RemoveRedEyeRoundedIcon from '@mui/icons-material/RemoveRedEyeRounded';
import { sendEmailResetPassword } from '@/utils/sendEmailResetPass';

type FormExampleProps = {
    data: any;
    open: boolean;
    onClose: () => void;
};

const ModalPassword: React.FC<FormExampleProps> = ({
    open,
    onClose,
    data,
}) => {
    const inputClass = "text-sm block md:w-full py-2 p-2 ps-5 pe-10 h-[40px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"
    const [passwordValue, setPasswordValue] = useState(data.password_gen_flag && data.password_gen_origin);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isGenerate, setIsGenerate] = useState(false);

    useEffect(() => {
        setPasswordValue(data?.password_gen_flag && data?.password_gen_origin);
        setIsGenerate(data?.password_gen_flag && true)
    }, [data])

    const fetchData = async () => {
        try {
            // Group (2 = TSO, 3 = Shipper, 4 = Other)
            const response: any = await patchService(`/master/account-manage/account-local-gen-password/${data.id}`);
            setPasswordValue(response?.password_gen_origin)
            setIsGenerate(true)

            // ส่ง email หา user ที่โดน generate password
            let body_email = {
                "email": data?.email
            }
            await sendEmailResetPassword(body_email, 'createuser', response?.password_gen_origin)
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(passwordValue).then(() => {
            setIsCopied(true);
            setTimeout(() => {
                setIsCopied(false);
            }, 2000); // ซ่อน noti หลัง 2 วินาที
        });
    };

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const handleClose = () => {
        setIsPasswordVisible(false)
        onClose()
    }

    return (
        <Dialog open={open} onClose={() => handleClose()} className="relative z-20">
            {/* <div className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity" /> */}
            <div className={["fixed inset-0 bg-black/45", "transition-opacity duration-100 ease-out", open ? "opacity-100" : "opacity-0 pointer-events-none"].join(" ")} />
            <div className="fixed inset-0 z-10 flex items-center justify-center">
                <DialogPanel
                    transition
                    className="flex w-auto transform transition-all bg-white inset-0 rounded-[20px] text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                >
                    <div className="flex flex-col items-center gap-2 p-9">
                        <div className="w-[400px]">
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`Password`}</h2>
                            <div className="mb-4 w-[100%]">
                                <div className="grid grid-cols-2 text-sm font-light w-[400px] pb-2 text-[#58585A]">
                                    <p className=' pb-2 w-[80%]'>Company/Group Name</p>
                                    <p>: {data?.company_name || '-'}</p>
                                    <p className=' pb-2 w-[80%]'>Name</p>
                                    <p>: {data?.name !== "null null" ? data?.name : ''}</p>
                                </div>
                                <div className='pt-2 pb-5 font-bold text-[#464255]'>
                                    {`Your password`}
                                </div>

                                <div className="flex gap-2 w-full">
                                    <input
                                        // type="text"
                                        type={isPasswordVisible ? 'text' : 'password'}
                                        className={`${inputClass} !bg-[#00ADEF1A] !border-[#00ADEF1A] !text-[#0E688B] !text-[18px] font-bold text-center !w-[282px] !h-[50px] pointer-events-none user-select-none`}
                                        placeholder=""
                                        // value={data.password_gen_flag ? data.password_gen_origin : '************'}
                                        // value={data?.password_gen_flag ? passwordValue : '************'}
                                        value={data?.password_gen_flag || isGenerate ? passwordValue : '************'}
                                        readOnly={true}
                                    />
                                    {/* <button 
                                        type="button" 
                                        onClick={copyToClipboard}
                                        className="w-10 h-9 font-light bg-slate-100 text-grey py-2 rounded-lg border flex justify-center items-center hover:bg-rose-500 focus:outline-none focus:bg-rose-500"
                                    >
                                        <ContentCopyOutlinedIcon />
                                    </button> */}
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        // className={`!w-[50px] !h-[50px] font-light bg-[#0E688B]  ${!data?.password_gen_flag && '!bg-[#EFECEC]'}  bg-slate-100 text-grey py-2 rounded-lg border flex justify-center items-center hover:bg-rose-500 focus:outline-none focus:bg-rose-500`}
                                        className={`!w-[50px] !h-[50px] font-light bg-[#0E688B] ${(!isGenerate) && '!bg-[#EFECEC]'}  bg-slate-100 text-grey py-2 rounded-lg border flex justify-center items-center hover:bg-rose-500 focus:outline-none focus:bg-rose-500`}
                                        // disabled={!data?.password_gen_flag && true}
                                        // disabled={((data?.password_gen_flag == false || data?.password_gen_flag !== null ) && isGenerate == false) ? true : false}
                                        disabled={isGenerate ? false : true}
                                    >
                                        {/* <RemoveRedEyeRoundedIcon sx={{ color: '#ffffff', fontSize: '22px' }} /> */}
                                        {isPasswordVisible ? (
                                            // <VisibilityOffRoundedIcon sx={{ color: '#ffffff', fontSize: '22px' }} />
                                            <RemoveRedEyeRoundedIcon sx={{ color: '#ffffff', fontSize: '22px' }} />
                                        ) : (
                                            // <RemoveRedEyeRoundedIcon sx={{ color: data?.password_gen_flag ? '#ffffff' : '#B6B6B6', fontSize: '22px' }} />
                                            // <RemoveRedEyeRoundedIcon sx={{ color: isGenerate ? '#ffffff' : '#B6B6B6', fontSize: '22px' }} />
                                            <VisibilityOffRoundedIcon sx={{ color: isGenerate ? '#ffffff' : '#B6B6B6', fontSize: '22px' }} />
                                        )}
                                    </button>

                                    <div className="relative flex items-center">
                                        <button
                                            type="button"
                                            onClick={copyToClipboard}
                                            // className={`!w-[50px] !h-[50px] font-light bg-[#24AB6A] ${(!data?.password_gen_flag && !isGenerate) && '!bg-[#EFECEC]'}  text-grey py-2 rounded-lg border flex justify-center items-center hover:bg-rose-500 focus:outline-none focus:bg-rose-500`}
                                            className={`!w-[50px] !h-[50px] font-light bg-[#24AB6A] ${(!isGenerate) && '!bg-[#EFECEC]'}  text-grey py-2 rounded-lg border flex justify-center items-center hover:bg-rose-500 focus:outline-none focus:bg-rose-500`}
                                            // disabled={!data?.password_gen_flag && !isGenerate ? true : false}
                                            // disabled={data?.password_gen_flag == false && isGenerate == false ? true : false}
                                            disabled={isGenerate ? false : true}
                                        >
                                            {/* <ContentCopyOutlinedIcon sx={{ color: data?.password_gen_flag ? '#ffffff' : '#B6B6B6', fontSize: '18px' }} /> */}
                                            <ContentCopyOutlinedIcon sx={{ color: isGenerate ? '#ffffff' : '#B6B6B6', fontSize: '18px' }} />
                                        </button>

                                        {isCopied && (
                                            <div className="absolute top-[-40px] left-[-10px] transform -translate-x-1/2 bg-green-500 text-white px-2 py-1 rounded animate-fadeInOut">
                                                {`Copied!`}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="w-full flex justify-center pt-3">
                                    <button
                                        onClick={fetchData}
                                        className="w-full h-[50px] font-light bg-[#2F56BA] hover:bg-[#2448a5] text-white py-2 rounded-lg focus:outline-none duration-200 ease-in-out">
                                        {'Re-Generate Password'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* <div className="mb-4 w-[100%]"> */}
                        {/* {data?.map((item: any) => (
                            <div key={item.id} className="w-full h-auto mb-2 p-2 border rounded-lg">
                                <div className="flex flex-col p-2">

                                <div className="mb-2 flex justify-between">
                                    <span className='font-light'>By <span className="font-bold"> {item.account_id}</span></span>
                                    <span className="text-gray-500">{formatDate(item.create_date)}</span> 
                                </div>

                                <div className="w-full h-[50px] border rounded-lg mb-2 p-4">
                                    <p>{item.reason || '-'}</p>
                                </div>

                                </div>
                            </div>
                        ))} */}
                        {/* </div> */}

                        <div className="w-full flex justify-end pt-8">
                            <button
                                // onClick={onClose}
                                onClick={() => handleClose()}
                                className="w-[167px] h-[44px] font-bold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
                                {'Close'}
                            </button>
                        </div>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>

    );
};

export default ModalPassword;