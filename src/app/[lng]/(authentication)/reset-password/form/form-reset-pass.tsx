import PasswordStrong from '@/components/library/passwordStrong/PasswordStrong';
import { postService } from '@/utils/postService';
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

type FormData = {
    password?: string;
    confirmpassword?: string;
};

const FormResetPwd: React.FC<any> = ({
    lng,
    data = {},
    onSubmit,
    setResetForm
}) => {

    let page = window?.location?.href.split("ref=");
    let pageTOKEN: any = page[1];
    const { register, handleSubmit, reset, formState: { errors }, clearErrors, setError, setValue, getValues } = useForm<FormData>({ defaultValues: data });
    const [flgpwd, setflgpwd] = useState<boolean>(false);
    const [flgconfpwd, setflgconfpwd] = useState<boolean>(false);
    const [enabledContinue, setEnabledContinue] = useState<boolean>(false);

    React.useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    // function checkedPwd() {
    //     const password = getValues('password');
    //     const confpassword = getValues('confirmpassword');

    //     let validPassword = true;
    //     let validConfPassword = true;

    //     // Check password length
    //     if (!password || password.length < 10) {
    //         setflgpwd(false);
    //         setError('password', { type: "alert", message: 'Password must be at least 10 characters' });
    //         validPassword = false;
    //     } else {
    //         clearErrors('password');
    //         setflgpwd(true);
    //     }

    //     // Check confirm password length
    //     if (!confpassword || confpassword.length < 10) {
    //         setflgconfpwd(false);
    //         setError('confirmpassword', { type: "alert", message: 'Password must be at least 10 characters' });
    //         validConfPassword = false;
    //     } else {
    //         clearErrors('confirmpassword');
    //         setflgconfpwd(true);
    //     }

    //     // If both passwords are valid, check for equality
    //     if (validPassword && validConfPassword) {
    //         if (password !== confpassword) {
    //             setError('confirmpassword', { type: "alert", message: 'Passwords do not match' });
    //             setEnabledContinue(false);
    //             return false;
    //         } else {
    //             clearErrors('confirmpassword');
    //             setEnabledContinue(true);
    //             return true;
    //         }
    //     }

    //     // Disable continue if any validation fails
    //     setEnabledContinue(false);
    //     return false;
    // }

    function checkedPwd() {
        const password = getValues('password');
        const confpassword = getValues('confirmpassword');

        let validPassword = true;
        let validConfPassword = true;

        // Regular expressions for validation
        const hasLowercase = /[a-z]/;
        const hasUppercase = /[A-Z]/;
        const hasSymbol = /[^A-Za-z0-9]/; // ตัวอักษรพิเศษ

        // Check password
        if (!password || password.length < 10) {
            setError('password', { type: "alert", message: 'Password must be at least 10 characters' });
            setflgpwd(false);
            validPassword = false;
        } else if (!hasLowercase.test(password)) {
            setError('password', { type: "alert", message: 'Password must contain at least one lowercase letter (a-z)' });
            setflgpwd(false);
            validPassword = false;
        } else if (!hasUppercase.test(password)) {
            setError('password', { type: "alert", message: 'Password must contain at least one uppercase letter (A-Z)' });
            setflgpwd(false);
            validPassword = false;
        } else if (!hasSymbol.test(password)) {
            setError('password', { type: "alert", message: 'Password must contain at least one special character (!@#$%^&*)' });
            setflgpwd(false);
            validPassword = false;
        } else {
            clearErrors('password');
            setflgpwd(true);
        }

        // Check confirm password
        if (!confpassword || confpassword.length < 10) {
            setError('confirmpassword', { type: "alert", message: 'Password must be at least 10 characters' });
            setflgconfpwd(false);
            validConfPassword = false;
        } else {
            clearErrors('confirmpassword');
            setflgconfpwd(true);
        }

        // If both passwords are valid, check for equality
        if (validPassword && validConfPassword) {
            if (password !== confpassword) {
                setError('confirmpassword', { type: "alert", message: 'Passwords do not match' });
                setEnabledContinue(false);
                return false;
            } else {
                clearErrors('confirmpassword');
                setEnabledContinue(true);
                return true;
            }
        }

        // Disable continue if any validation fails
        setEnabledContinue(false);
        return false;
    }



    async function checkBFsubmit() {
        let password: any = getValues('password');
        let confpassword: any = getValues('confirmpassword');
        let resultPWD: any = await checkedPwd();

        if (resultPWD == true) {
            handleFormSubmit(confpassword);
        } else {
            if (password?.length <= 10) {
                setflgpwd(false);
                setError('password', { type: "alert", message: 'Password at least 10 characters' });
            }

            if (confpassword?.length <= 10) {
                setflgconfpwd(false);
                setError('confirmpassword', { type: "alert", message: 'Password at least 10 characters' });
            }
        }
    }

    const handleFormSubmit = async (password: any) => {
        // let data: any = {
        //   ref: pageTOKEN,
        //   password: password
        // }

        // const result = await postService('/master/account-manage/check-password', data);

        // if(result?.status == 400){
        //     setflgpwd(false);
        //     setError('password', { type: "alert", message: 'Your new password cannot be same as old password.' });
        // }else if(result){
        //   onSubmit(password);
        // }
        onSubmit(password);
    };


    return (
        <div className='px-10 h-auto'>
            <form onSubmit={handleSubmit(checkBFsubmit)}>
                <div id='form-input' className='mb-7'>
                    <PasswordStrong
                        {...register('password', { required: "Enter new password" })}
                        id={"password"}
                        required={true}
                        errors={errors.password}
                        errors_message={errors.password && errors?.password?.message}
                        clearErrors={clearErrors}
                        placeholder={"New Password"}
                        onChange={(e: any) => {
                            setValue('password', e)
                            checkedPwd();
                        }}
                        setflag={setflgpwd}
                    />
                </div>
                <div id='form-input' className='mb-7'>
                    <PasswordStrong
                        {...register('confirmpassword', { required: "Enter new test password" })}
                        id={"confirmpassword"}
                        required={true}
                        errors={errors.confirmpassword}
                        errors_message={errors.confirmpassword && errors?.confirmpassword?.message}
                        clearErrors={clearErrors}
                        placeholder={"Confirm New Password"}
                        onChange={(e: any) => {
                            setValue('confirmpassword', e)
                            checkedPwd();
                        }}
                        setflag={setflgconfpwd}
                    />
                </div>
                <div>
                    <button disabled={!enabledContinue} className={`w-full h-[60px] ${enabledContinue ? 'bg-[#00ADEF]' : 'bg-[#9CA3AF]'} text-center font-bold rounded-lg text-white`}>{"Continue"}</button>
                </div>
            </form>
        </div>
    );
};

export default FormResetPwd;