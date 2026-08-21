"use client";
import React, { useEffect, useState } from "react";
import {RemoveRedEye, VisibilityOff, Check, FiberManualRecord} from '@mui/icons-material';

type componentsTK = {
  id: string,
  required: boolean,
  errors: any,
  errors_message: any,
  clearErrors: any,
  placeholder: string,
  onChange: (data: any) => void,
  setflag: any,
};

const PasswordStrong: React.FC<componentsTK> = ({
  id,
  required = false,
  errors,
  errors_message,
  clearErrors,
  placeholder,
  onChange,
  setflag
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [countLeast, setCountLeast] = useState([false, false, false, false]);
  const [infoShow, setInfoShow] = useState(false);

  const inputClass = "text-sm block w-full p-2 ps-5 hover:!ps-5 focus:!ps-5 pe-10 h-[50px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF] text-black"
  const textErrorClass = "text-red-500 text-sm"

  function containsNumbers(input: any) {
    return /[0-9]/.test(input);
  }

  function containsLowercase(input: any) {
    return /[a-z]/.test(input);
  }

  function containsUppercase(input: any) {
    return /[A-Z]/.test(input);
  }

  function containsSpecialCharacters(input: any) {
    // return /[!@#$%^&*()]/.test(input);
    return /[^a-zA-Z0-9]/.test(input);
  }

  useEffect(() => {
    setCountLeast([
      containsNumbers(password),
      containsLowercase(password),
      containsUppercase(password),
      containsSpecialCharacters(password),
    ]);

    if(countLeast[0] == true && countLeast[1] == true && countLeast[2] == true && countLeast[3] == true && password?.length >= 10){
      setflag(true);
    }else{
      setflag(false);
    }
  }, [password]);
  
  // ปุ่มเปิดปิดลูกตา
  function togglePasswordVisibility() {
    setIsPasswordVisible((prevState) => !prevState);
  }

  return (
    <div className=" relative">
      <input
          id={`hs-toggle-password ${id}`}
          type={isPasswordVisible ? "text" : "password"}
          className={`${inputClass} ${ errors && 'border-red-500'}`}
          placeholder={placeholder}
          onChange={(e) =>{
            setPassword(e.target.value);
            onChange(e.target.value)
            if(errors?.type == "alert"){
              if(e?.target?.value?.length >= 10 &&
                errors && 
                errors?.message !== "Password do not match" &&
                errors?.ref?.name == id
              ){
                clearErrors(errors?.ref?.name);
              }
            }
          }}
          onFocus={(e) => setInfoShow(true)}
          onBlur={(e) => setInfoShow(false)}
          // onPaste={(e)  => e.preventDefault()}
      />
      <button 
        type="button" 
        onClick={togglePasswordVisibility}
        className="absolute inset-y-0 end-0 flex items-center z-0 px-3 cursor-pointer text-gray-400 rounded-e-md focus:outline-none hover:text-blue-600 h-[50px] duration-300 focus:!shadow-none focus:!border-none"
      >
          {/* <svg className="shrink-0 size-3.5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path className="hs-password-active:hidden" d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
              <path className="hs-password-active:hidden" d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
              <path className="hs-password-active:hidden" d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
              <line className="hs-password-active:hidden" x1="2" x2="22" y1="2" y2="22"></line>
              <path className="hidden hs-password-active:block" d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
              <circle className="hidden hs-password-active:block" cx="12" cy="12" r="3"></circle>
          </svg> */}
          {isPasswordVisible ? <RemoveRedEye sx={{fontSize: 20}}/> : <VisibilityOff sx={{fontSize: 20}}/>}
      </button>
      {required == true && errors && <p className={`${textErrorClass}`}>{errors_message}</p>}
      {password.length > 0 && !!infoShow && (
        <div className="absolute bottom-[60px] right-0">
          <div className=" relative">
            <div
              className={` bg-[#fff] border-[1px] border-[#DFE4EA] text-[#A8A9AD] px-3 py-4 text-[12px] rounded-md relative z-[1] top-[1px]`}
            >
              <div
                className={`flex gap-2 items-center ${
                  password.length >= 10 && "text-green-500"
                }`}
              >
                  {password.length >= 10 ?
                  <Check style={{ fontSize: "13px" }}/>
                  :
                  <FiberManualRecord style={{ fontSize: "10px" }}/>
                  }
                {`10 or more characters`}
              </div>
              <div
                className={`flex gap-2 items-center ${
                  !!countLeast[1] && !!countLeast[2] && "text-green-500"
                }`}
              >
                {!!countLeast[1] && !!countLeast[2] ?
                  <Check style={{ fontSize: "13px" }}/>
                  :
                  <FiberManualRecord style={{ fontSize: "10px" }}/>
                }
                {`Upper & lowercase letters`}
              </div>
              <div
                className={`flex gap-2 items-center ${
                  !!countLeast[0] && "text-green-500"
                }`}
              >
                {!!countLeast[0] ?
                  <Check style={{ fontSize: "13px" }}/>
                  :
                  <FiberManualRecord style={{ fontSize: "10px" }}/>
                }
                {`At least one number`}
              </div>
              <div
                className={`flex gap-2 items-center ${
                  !!countLeast[3] && "text-green-500"
                }`}
              >
                {!!countLeast[3] ?
                  <Check style={{ fontSize: "13px" }}/>
                  :
                  <FiberManualRecord style={{ fontSize: "10px" }}/>
                }
                {`Contains a symbol`}
              </div>
              {/* <div className={`grid grid-cols-[4fr,1fr]`}>
                <div
                  className={`h-[10px] border-[1px] bg-gray-300 rounded-full mt-2 w-[100%]`}
                >
                  <div
                    className={`h-[100%] rounded-full ${
                      (countLeast || []).filter((value) => value).length === 1
                        ? " bg-red-500 w-[25%]"
                        : (countLeast || []).filter((value) => value)
                            .length === 2
                        ? " bg-orange-500 w-[50%]"
                        : (countLeast || []).filter((value) => value)
                            .length === 3
                        ? " bg-yellow-500 w-[75%]"
                        : (countLeast || []).filter((value) => value)
                            .length === 4
                        ? " bg-green-500 w-[100%]"
                        : "bg-gray-300 w-[0%]"
                    } `}
                  ></div>
                </div>
                <div className="text-center">
                  <span
                    className={` ${
                      (countLeast || []).filter((value) => value).length === 1
                        ? " text-red-500"
                        : (countLeast || []).filter((value) => value)
                            .length === 2
                        ? " text-orange-500"
                        : (countLeast || []).filter((value) => value)
                            .length === 3
                        ? " text-yellow-500"
                        : (countLeast || []).filter((value) => value)
                            .length === 4
                        ? " text-green-500"
                        : "text-gray-300"
                    }`}
                  >
                    {(countLeast || []).filter((value) => value).length === 1
                      ? "Weak"
                      : (countLeast || []).filter((value) => value).length ===
                        2
                      ? "Med"
                      : (countLeast || []).filter((value) => value).length ===
                        3
                      ? "Mid S"
                      : (countLeast || []).filter((value) => value).length ===
                        4
                      ? "Strong"
                      : ""}
                  </span>
                </div>
              </div> */}
            </div>
            <div
              className=" absolute right-3 w-0 h-0 
                border-l-[10px] border-l-transparent
                border-t-[7px] border-t-[#fff]
                border-r-[10px] border-r-transparent z-[3]"
            />
            <div
              className=" absolute right-[0.6rem] w-0 h-0
                border-l-[12px] border-l-transparent
                border-t-[9px] border-t-[#DFE4EA]
                border-r-[12px] border-r-transparent z-[2]"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default PasswordStrong;
