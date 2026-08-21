import AlphabetCaptcha from '@/components/library/localCaptcha/localCapcha';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import "../styles.css"
import { isIPAllowed } from '@/utils/generalFormatter';
import { log } from 'console';
import ModalComponent from '@/components/other/ResponseModal';
import Spinloading2 from '@/components/other/spinLoading2';
import Spinloading from '@/components/other/spinLoading';
import Spinloading3 from '@/components/other/spinLoading3';

type FormData = {
    email?: string;
    password?: string;
};

const FormSignin: React.FC<any> = ({
    data = {},
    onSubmit,
    setResetForm,
    isLoading,
    lng
}) => {

    const router = useRouter();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ defaultValues: data });
    const inputClass = "text-sm block w-full p-2 ps-5 pe-10 h-[50px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF] text-black"
    const textErrorClass = "text-red-500 text-sm"

    React.useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isVerify, setIsVerify] = useState(false);
    const [xyz, setXyz] = useState(true);
    const [isSubmit, setIsSubmit] = useState(false);
    const [hardResetCaptcha, setHardResetCaptcha] = useState(false);
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);

    function togglePasswordVisibility() {
        setIsPasswordVisible((prevState) => !prevState);
    }

    const checkIP = async () => {
        try {
            const clientIP = await fetch("https://api.ipify.org?format=json")
                .then((res) => res.json())
                .then((data) => data.ip);

            const allowed = isIPAllowed(clientIP);
            setIsVerify(allowed);
        } catch (error) {
            // Error verifying IP
            setIsVerify(false);
        }
    };

    useEffect(() => {
        checkIP();
    }, []);

    return (
        <div className='px-10 h-auto'>
            <Spinloading3 spin={isLoading} rounded={20} />
            <form
                // onSubmit={handleSubmit(onSubmit)}
                onSubmit={handleSubmit((data) => { // clear state when submit
                    if (xyz == true) { // original
                    // if (xyz == true && !isVerify) { // !isVerify เอาไว้ผ่าน capcha
                        // capcha is wrong
                        // v1.0.90 ใส่ captcha ผิดควร สามารถ กด login ได้แล้ว refresh captcha อย่างเดียว https://app.clickup.com/t/86ernzz11
                        // refresh captcha
                        setModalErrorOpen(true);
                        setHardResetCaptcha(true);
                    } else {
                        setIsVerify(false);
                        setIsSubmit(true) // หน้า Local หลังจากใส่รหัสผ่าน หรือ อีเมลผิด เมื่อกด Continue จาก Alert Failed แล้ว Re-captcha ควร Reset ให้	https://app.clickup.com/t/86eqq6huc
                        onSubmit(data);
                        checkIP(); // เอาไว้ check allow ip อีกรอบเผื่อกดรหัสผ่านผิดจะได้ไม่ต้อง refresh
                    }
                })}
            >
                <div id='form-input' className='responsive-margin-bottom-7'>
                    <input
                        type="text"
                        {...register('email', { required: "Enter your email or user id" })}
                        // className={`${inputClass} ${errors.email && 'border-red-500'}`}
                        // text-sm block w-full p-2 ps-5 pe-10 h-[50px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF] text-black
                        className={`text-[16px] bg-white ps-[21px] border-[1px] focus:border-[#00ADEF] h-[50px] w-full rounded-lg outline-none bg-opacity-100  ${errors.email && 'border-red-500'}`}
                        placeholder="Email or User ID"
                    />
                    {errors.email && <p className={`${textErrorClass}`}>{errors.email.message}</p>}
                </div>

                <div id='form-input' className='mb-5 relative'>
                    <input
                        id='hs-toggle-password'
                        type={isPasswordVisible ? "text" : "password"}
                        {...register('password', { required: "Enter your password" })}
                        // className={`${inputClass} ${errors.password && 'border-red-500'}`}
                        className={`text-[16px] bg-white ps-[21px] border-[1px] focus:border-[#00ADEF] h-[50px] w-full rounded-lg outline-none bg-opacity-100  ${errors.password && 'border-red-500'}`}
                        placeholder="Password"
                    />
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 flex items-center z-20 px-3 cursor-pointer text-gray-400 rounded-r-md focus:outline-none"
                    >
                        {isPasswordVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                    </button>
                    {errors.password && <p className={`${textErrorClass}`}>{errors.password.message}</p>}
                </div>

                <div className='float-right  cursor-pointer' onClick={() => router.push(`/${lng}/forgot-password`)}><span className='underline text-[#9CA3AF]'>{"Forgot Password ?"}</span></div>

                <AlphabetCaptcha
                    setIsVerify={setIsVerify}
                    xyz={xyz}
                    setXyz={setXyz}
                    isSubmit={isSubmit}
                    hardResetCaptcha={hardResetCaptcha}
                    setHardResetCaptcha={setHardResetCaptcha}
                />

                <div className='mt-[20px]'>
                    <button
                        className={`${isVerify ? 'bg-[#00ADEF]' : 'bg-gray-400 cursor-not-allowed'} button-submit-unauth`}
                        // className={`${xyz ? 'bg-[#00ADEF]' : 'bg-gray-400 cursor-not-allowed'} button-submit-unauth`}
                        disabled={!isVerify}
                        // disabled={xyz ? false : true}
                        onClick={(e) => {
                            if (!isVerify) {
                                e.preventDefault(); // Prevent the button from doing anything
                                return;
                            }
                            // Logging in...
                        }}
                    >
                        {"Login"}
                    </button>
                </div>

            </form>

            <ModalComponent
                open={isModalErrorOpen}
                handleClose={() => {
                    setModalErrorOpen(false);
                    // if (resetForm) resetForm();
                }}
                title="Failed"
                description={
                    <div>
                        <div className="text-center">
                            {'Captcha is Wrong'}
                        </div>
                    </div>
                }
                stat="error"
            />
        </div>
    );
};

export default FormSignin;