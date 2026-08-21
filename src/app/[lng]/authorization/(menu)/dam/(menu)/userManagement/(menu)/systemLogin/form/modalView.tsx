import React, { useEffect, useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import RemoveRedEyeRoundedIcon from '@mui/icons-material/RemoveRedEyeRounded';
import CheckIcon from '@mui/icons-material/Check';

type FormExampleProps = {
    data: any;
    open: boolean;
    onClose: () => void;
    viewCreate?: any;
    setViewCreate?: any;
};

const ModalView: React.FC<FormExampleProps> = ({
    open,
    onClose,
    data,
    viewCreate,
    setViewCreate
}) => {

    const [isCopied, setIsCopied] = useState(null);
    const [isCopiedAll, setIsCopiedAll] = useState(false);
    const [passwordVisibility, setPasswordVisibility] = useState<any>({});

    const togglePasswordVisibility = (id: any) => {
        // setIsPasswordVisible(!isPasswordVisible);
        setPasswordVisibility((prev: any) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const copyToClipboard = (text: any, id: any) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                setIsCopied(id);
                setTimeout(() => setIsCopied(null), 2000); // Hide "Copied!" after 2 seconds
            })
            .catch((error) => {
                // Copy failed
            });
    };

    const copyToClipboardAll = () => {
        // Create a string with email and password
        const dataMap = data?.system_login_account
            .map(
                (item: any) =>
                    `user_name: ${item.account.email}, password: ${item.account.password_gen_flag ? item.account.password_gen_origin : '**********'}`
            )
            .join("\n"); // Joining each entry with a newline for better readability

        navigator.clipboard.writeText(dataMap)
            .then(() => {
                // Emails and passwords copied to clipboard!
                setIsCopiedAll(true)
                setTimeout(() => setIsCopiedAll(false), 2000); // Hide "Copied!" after 2 seconds
            })
            .catch((err) => {
                // Failed to copy data:
            });
    };

    const handleClose = () => {
        onClose();
        setViewCreate(false);
    };

    return (
        <Dialog open={open} onClose={handleClose} className="relative z-20">
            {/* <div className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity" /> */}
            <div className={["fixed inset-0 bg-black/45", "transition-opacity duration-100 ease-out", open ? "opacity-100" : "opacity-0 pointer-events-none"].join(" ")} />
            <div className="fixed inset-0 z-10 flex items-center justify-center">
                <DialogPanel
                    transition
                    className="flex w-auto transform transition-all bg-white inset-0 rounded-[20px] text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                >
                    <div className="flex flex-col gap-2 p-9">
                        <div className="w-[700px]">
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-1">{viewCreate ? `Configure` : 'View'}</h2>
                        </div>

                        {
                            viewCreate &&
                            <div className='flex p-4 bg-[#C7EA7C33] border border-[#5FB442] rounded-[8px] w-full h-[60px] text-[#5FB442] font-bold'>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center justify-center w-[24px] h-[24px] bg-[#5FB442] text-[#ffffff] rounded-full">
                                        <CheckIcon sx={{ fontSize: 18 }} />
                                    </div>
                                    <span>{`Saved.`}</span>
                                </div>
                            </div>
                        }

                        <div className="pb-2">
                            <div className="flex space-x-2">
                                <label htmlFor="userLgnMode" className="block mb-2 mr-4 text-sm font-light">
                                    <span className='font-bold text-[#000000B2]'>{`System Login Mode`}</span>
                                </label>
                                <div id="mode_account" className="flex space-x-4 mb-1">
                                    {['SSO Login', 'Local Login'].map((value, index) => (
                                        <label key={index} className="inline-flex space-x-2">
                                            <input
                                                type="radio"
                                                value={value}
                                                defaultChecked={value === 'Local Login'}
                                                checked={value === 'Local Login'}
                                                disabled
                                            />
                                            <span className="text-[16px] text-[#58585A] ">{value}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* <div className="ml-auto">
                            <button
                                onClick={() => copyToClipboardAll()}
                                className="w-[130px] h-[46px] font-light bg-[#1473A1] text-white py-2 rounded-[6px] hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                            >{'Copy All '} <ContentCopyOutlinedIcon sx={{ fontSize: 18 }} /></button>

                            {isCopiedAll && (
                                <div className="absolute top-[-30px] font-light left-[-10px] transform -translate-x-1/2 bg-green-500 text-white px-2 py-1 rounded animate-fadeInOut">
                                    {`Copied!`}
                                </div>
                            )}
                        </div> */}

                        <div className="ml-auto relative">
                            <button
                                onClick={() => copyToClipboardAll()}
                                className="w-[130px] h-[46px] font-light bg-[#1473A1] text-white py-2 rounded-[6px] hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                            >
                                {'Copy All '} <ContentCopyOutlinedIcon sx={{ fontSize: 18 }} />
                            </button>

                            {isCopiedAll && (
                                <div className="absolute bottom-full mb-2 left-2 transform -translate-x-1/2 font-light bg-[#ffffff] border border-[#1473A140] text-[#1473A1] px-4 py-2 rounded-[8px] animate-fadeInOut">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center justify-center w-[24px] h-[24px] bg-[#D6F2FF] text-[#1473A1] rounded-full">
                                            <CheckIcon sx={{ fontSize: 18 }} />
                                        </div>
                                        <span>{`Copied!`}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mb-4 w-[100%]">
                            <div className='grid grid-cols-2 pb-2'>
                                <div>
                                    <span className='font-bold col-span-2 text-[#58585A]'>User Name</span>
                                </div>
                                <div>
                                    <span className='font-bold text-[#58585A]'>Password</span>
                                </div>
                            </div>
                            {data?.system_login_account?.map((item: any) => (
                                <div key={item.id} className="w-full h-auto p-2 ">

                                    {/* <div className='grid grid-cols-2 pb-2'>
                                        <div>
                                            <span className='font-bold col-span-2 text-[#58585A]'>User Name</span>
                                        </div>
                                        <div>
                                            <span className='font-bold text-[#58585A]'>Password</span>
                                        </div>
                                    </div> */}

                                    <div className="grid grid-cols-[350px_250px_50px_50px] justify-center items-center p-3 text-sm font-semibold w-full border rounded-lg">
                                        <div>
                                            <span className='font-light'>{item?.account?.email}</span>
                                        </div>

                                        <div className='flex items-center'>
                                            {/* <span className='font-light'>
                                                {item?.account?.password_gen_flag ? item?.account?.password_gen_origin : '**********'}
                                            </span> */}
                                            <input
                                                type={passwordVisibility[item.id] ? 'text' : 'password'}
                                                className={`font-light !text-[14px] w-[230px] h-[35px] border rounded-[6px] border-[#DFE4EA] px-2 pointer-events-none user-select-none`}
                                                placeholder=""
                                                value={item?.account?.password_gen_flag ? item?.account?.password_gen_origin : 'Iputmyfingersintomyeyes'}
                                                readOnly={true}
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            // onClick={togglePasswordVisibility}
                                            onClick={() => togglePasswordVisibility(item.id)}
                                            // className={`${!item?.account?.password_gen_flag && '!bg-[#EFECEC]'} w-[35px] h-[35px] font-light bg-[#0E688B] bg-slate-100 text-grey py-2 rounded-lg border flex justify-center items-center hover:bg-rose-500 focus:outline-none focus:bg-rose-500`}
                                            className={`${!item?.account?.password_gen_flag && '!bg-[#EFECEC]'} w-[35px] h-[35px] font-light bg-[#ffffff] bg-slate-100 text-grey py-2 rounded-lg border flex justify-center items-center hover:bg-rose-500 focus:outline-none focus:bg-rose-500`}
                                            disabled={!item?.account?.password_gen_flag && true}
                                        >
                                            {/* {isPasswordVisible ? ( */}
                                            {/* {passwordVisibility[item.id] ? ( */}

                                            {/* {item?.account?.password_gen_flag && passwordVisibility[item.id] ? (
                                                // <VisibilityOffRoundedIcon sx={{ color: '#58585A', fontSize: '16px' }} />
                                                // <RemoveRedEyeRoundedIcon sx={{ color: '#58585A', fontSize: '20px' }} />
                                                <RemoveRedEyeRoundedIcon sx={{ color: '#58585A', fontSize: '20px' }} />
                                            ) : (
                                                // <RemoveRedEyeRoundedIcon sx={{ color: '#ffffff', fontSize: '16px' }} />
                                                // <VisibilityOffRoundedIcon sx={{ color: '#B6B6B6', fontSize: '20px' }} />
                                                <VisibilityOffRoundedIcon sx={{ color: '#B6B6B6', fontSize: '20px' }} />
                                            )} */}

                                            {passwordVisibility[item.id] ? (
                                                <RemoveRedEyeRoundedIcon sx={{ color: '#58585A', fontSize: '20px' }} />
                                            ) : (
                                                // <VisibilityOffRoundedIcon sx={{ color: '#58585A', fontSize: '20px', opacity: !item?.account?.password_gen_flag && '0.2' }} />
                                                <VisibilityOffRoundedIcon
                                                    sx={{
                                                        color: '#58585A',
                                                        fontSize: '20px',
                                                        opacity: !item?.account?.password_gen_flag ? 0.2 : 1
                                                    }}
                                                />
                                            )}

                                        </button>

                                        <div className="relative flex items-center">
                                            <button
                                                type="button"
                                                // onClick={() => copyToClipboard(item?.account?.password_gen_origin)}
                                                onClick={() => copyToClipboard(item?.account?.password_gen_origin, item.id)}
                                                // className={`${!item?.account?.password_gen_flag && '!bg-[#EFECEC]'} w-[35px] h-[35px] font-light bg-[#24AB6A] text-grey py-2 rounded-lg border flex justify-center items-center hover:bg-rose-500 focus:outline-none focus:bg-rose-500`}
                                                className={`${!item?.account?.password_gen_flag && '!bg-[#EFECEC]'} w-[35px] h-[35px] font-light bg-[#FFFFFF] text-grey py-2 rounded-lg border flex justify-center items-center hover:bg-rose-500 focus:outline-none focus:bg-rose-500`}
                                                disabled={!item?.account?.password_gen_flag && true}
                                            >
                                                {/* <ContentCopyOutlinedIcon sx={{ color: '#ffffff', fontSize: '16px' }} /> */}
                                                {item?.account?.password_gen_flag ? (
                                                    <ContentCopyOutlinedIcon sx={{ color: '#58585A', fontSize: '20px' }} />
                                                ) : (
                                                    <ContentCopyOutlinedIcon sx={{ color: '#B6B6B6', fontSize: '20px' }} />
                                                )}
                                            </button>

                                            {/* {isCopied && (
                                                <div className="absolute top-[-30px] font-light left-[-10px] transform -translate-x-1/2 bg-green-500 text-white px-2 py-1 rounded animate-fadeInOut">
                                                    Copied!
                                                </div>
                                            )} */}
                                            {isCopied === item.id && (
                                                <div className="absolute top-[-30px] font-light left-[-10px] transform -translate-x-1/2 bg-green-500 text-white px-2 py-1 rounded animate-fadeInOut">
                                                    Copied!
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="w-full flex justify-end pt-8">
                            <button
                                onClick={handleClose}
                                className="w-[167px] font-bold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
                                {'Close'}
                            </button>
                        </div>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>

    );
};

export default ModalView;