import { Description } from '@mui/icons-material';
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';


type FormData = {
    email?: string;
};
  
const FormForgotPwd: React.FC<any> = ({
    lng,
    data = {},
    onSubmit,
    setResetForm
}) => {

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({defaultValues: data});
    const inputClass = "text-sm block md:w-full p-2 ps-5 pe-10 h-[50px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF] text-black"
    const textErrorClass = "text-red-500 text-sm"

    React.useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    return (
        <div className='px-10 h-auto'>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div id='form-input' className='mb-7'>
                    <input
                        type="text"
                        {...register('email',  { required: "Enter email or user id"  })}
                        className={`${inputClass} ${ errors.email && 'border-red-500'}`}
                        placeholder="Email or User ID"
                    />
                    {errors.email && <p className={`${textErrorClass}`}>{errors.email.message}</p>}
                </div>
                <div>
                    <button 
                        className='w-full h-[60px] bg-[#00ADEF] text-center font-bold rounded-lg text-[#fff]'
                    >
                        {"Continue"}
                    </button>
                </div>
            </form>
            {/* <div>
                <button 
                        className='w-full h-[60px] bg-[#00ADEF] text-center font-bold rounded-lg text-[#fff]'
                        onClick={() => renderTemplate()}
                    >
                        {"Test template Email"}
                    </button>
            </div> */}
        </div>
    );
  };
  
  export default FormForgotPwd;