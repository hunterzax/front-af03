"use client";
import "@/app/globals.css";
import { useForm } from "react-hook-form";
import { Tab, Tabs, TextField } from "@mui/material";
import { findRoleConfigByMenuName, generateUserPermission } from "@/utils/generalFormatter";
import { uploadFileServiceWithAuth, uploadFileServiceWithAuth2 } from "@/utils/postService";
import { useEffect, useRef, useState } from "react";
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ModalComponent from "@/components/other/ResponseModal";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import Spinloading from "@/components/other/spinLoading";
import BtnGeneral from "@/components/other/btnGeneral";
import { useRouter } from "next/navigation";
import { decryptData, encryptData } from "@/utils/encryptionData";
import getUserValue from "@/utils/getuserValue";
// const API_URL = process.env.NEXT_PUBLIC_API_URL

interface ClientProps {
    params: {
        lng: string;
    };
}

const ClientPage: React.FC<ClientProps> = (props) => {
    const { register, setValue, reset, formState: { errors }, watch } = useForm<any>();
    const labelClass = "block mb-2 text-[16px] font-light text-[#58585A]"
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [tabIndex, setTabIndex] = useState(0); // 0=Daily, 1=Weekly
    const router = useRouter();
    let isReadOnly = false

    const userDT: any = getUserValue();
    // ############### Check Authen ###############
    const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
    useRestrictedPage(token);

    // ############### PERMISSION ###############
    const [userPermission, setUserPermission] = useState<any>();
    let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
    // let user_permission: any = getCookieValue("k3a9r2b6m7t0x5w1s8j");
    user_permission = user_permission ? decryptData(user_permission) : null;

    // ############# MODAL RESPONSE  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const handleCloseModal = () => setModalSuccessOpen(false);
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [modalWarningOpen, setModalWarningOpen] = useState(false);
    const [modalWarningMsg, setModalWarningMsg] = useState('');

    // if (resetForm) resetForm(); // reset form
    const [fileName, setFileName] = useState('Maximum File 10 MB');
    const [fileUpload, setFileUpload] = useState<any>();
    const [requireText, setRequireText] = useState('Required : .xls, .xlsx');
    const [iserror, setiserror] = useState<boolean>(false);

    // ############### POPUP ###############
    const popupRef = useRef<HTMLDivElement>(null);
    const [isPopupVisible, setIsPopupVisible] = useState(false);

    const getPermission = () => {
        try {
            user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object

            // if (user_permission?.role_config) {
            //     const updatedUserPermission = generateUserPermission(user_permission);
            //     setUserPermission(updatedUserPermission);
            // } else {
            //     const permission = findRoleConfigByMenuName('Submission File', userDT)
            //     setUserPermission(permission);
            // }

            const permission = findRoleConfigByMenuName(`Submission File`, userDT)
            if (permission) {
                setUserPermission(permission);
            } else if (user_permission?.role_config) {
                const updatedUserPermission = generateUserPermission(user_permission);
                setUserPermission(updatedUserPermission);
            }
        } catch (error) {
            // Failed to parse user_permission:
        }
    }

    useEffect(() => {
        // fetchData();
        getPermission();
    }, []);

    const handleFormSubmit = async (data: any) => {
        setTimeout(() => { handleRemoveFile() }, 100);
    }

    const handleFileChange = async (e: any) => {
        setIsLoading(true);
        const file = e.target.files[0];
        if (file) {
            const validFileTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
            const maxSizeInMB = 10; // Maximum file size in MB
            const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

            if (!validFileTypes.includes(file.type)) {
                setFileName('Invalid file type. Please upload a Excel file.');
                // // Invalid file type:'
                setTimeout(() => {
                    setIsLoading(false);
                    setiserror(true);
                }, 300);
                return;
            }

            if (file.size > maxSizeInBytes) {
                setFileName('The file is larger than 10 MB.');
                // // File size too large:
                setTimeout(() => {
                    setIsLoading(false);
                    setiserror(true);
                }, 300);
                return;
            }

            setiserror(false);
            setFileName(file?.name);
            setFileUpload(file);
            // setModalMsg("Your file has been uploaded")

        } else {
            setFileName('No file chosen');
        }

        setTimeout(() => {
            setIsLoading(false);
        }, 300);
    };

    const handleClickUpload = async () => {
        setIsLoading(true);

        const dynamicFields = {
            tabType: tabIndex == 0 ? 1 : 2, // 1 = daily, 2=weekly
            comment: watch('remark') ? watch('remark') : "",
        };
    
        if (fileUpload) {
            try {
                // const response: any = await uploadFileServiceWithAuth('/master/submission-file/upload', fileUpload)
                const response: any = await uploadFileServiceWithAuth2('/master/submission-file/upload', fileUpload, dynamicFields);
                const statusCode = response?.response?.data?.statusCode ?? response?.response?.data?.status ?? response?.status ?? response?.statusCode ?? response?.code ?? response?.response?.status;
                const errorMsg = response?.response?.data?.error ?? response?.data?.error ?? response?.response?.error ?? response?.error;
                if (statusCode === 400 || statusCode === 500 || statusCode === 403) {
                    // setModalErrorMsg(response?.response?.data?.error ? response?.response?.data?.error : response?.error ? response?.error : 'Internal Error, please contact Admin.');
                    setModalErrorMsg(errorMsg || 'Internal Error, please contact Admin.');
                    setModalErrorOpen(true)
                } else {
                    if(tabIndex == 0 && (response?.warningLogHr?.length > 0 || response?.warningLogDay?.length > 0 || response?.sheet2Quality?.length > 0 || response?.sheet1Quality?.length > 0)){
                        // const msg1 = tabIndex == 0 && (response?.warningLogHr?.length > 0 || response?.warningLogDay?.length > 0) && `Capacity Exceeds Capacity Right Amount.` || ""
                        const msg1 = tabIndex == 0 && (response?.warningLogHr?.length > 0 || response?.warningLogDay?.length > 0 || response?.sheet1Quality?.length > 0 || response?.sheet2Quality?.length > 0) && [...(response?.warningLogHr || []), ...(response?.warningLogDay || []), ...(response?.sheet1Quality || []), ...(response?.sheet2Quality || [])].join('<br/>') || ""
                        // const msg2 = response?.sheet2Quality?.length > 0 && "Quality Exceed Value Out of Range." || ""
                        // const msg3 = response?.sheet1Quality?.length > 0 && "Nomination Exceed Value" || ""
                        // setModalWarningMsg(`${msg1}\n ${msg2}\n ${msg3}`)
                        setModalWarningMsg(`${msg1}`)
                        setModalWarningOpen(true)
                    }else if(tabIndex == 1 && (response?.warningLogDayWeek?.length > 0 || response?.warningLogDay?.length > 0 || response?.sheet2Quality?.length > 0 || response?.sheet1Quality?.length > 0)){
                        // const msg1 = tabIndex == 1 && (response?.warningLogDayWeek?.length > 0 || response?.warningLogDay?.length > 0) && `Capacity Exceeds Capacity Right Amount.` || ""
                        const msg1 = tabIndex == 1 && (response?.warningLogDayWeek?.length > 0 || response?.warningLogDay?.length > 0 || response?.sheet2Quality?.length > 0 || response?.sheet1Quality?.length > 0) && [...(response?.warningLogDayWeek || []), ...(response?.warningLogDay || []), ...(response?.sheet1Quality || []), ...(response?.sheet2Quality || [])].join('<br/>') || ""
                        
                        // const msg2 = response?.sheet2Quality?.length > 0 && "Quality Exceed Value Out of Range." || ""
                        // const msg3 = response?.sheet1Quality?.length > 0 && "Nomination Exceed Value" || ""
                        // setModalWarningMsg(`${msg1}\n ${msg2}\n ${msg3}`)
                        setModalWarningMsg(`${msg1}`)
                        setModalWarningOpen(true)
                    }else{
                        setModalSuccessOpen(true);
                    }
                  
                    // if (response?.sheet2Quality?.length > 0) {
                    //     setModalWarningMsg("Quality Exceed Value Out of Range.")
                    //     setModalWarningOpen(true)
                    // } else if (tabIndex == 0 && (response?.warningLogHr?.length > 0 || response?.warningLogDay?.length > 0)) { // daily
                    //     // Nomination Exceed Value
                    //     // sheet1Quality
                    //     setModalWarningMsg("Capacity Exceeds Capacity Right Amount.")
                    //     setModalWarningOpen(true)
                    // } else if (tabIndex == 1 && (response?.warningLogDayWeek?.length > 0 || response?.warningLogDay?.length > 0)) { // weekly
                    //     setModalWarningMsg("Capacity Exceeds Capacity Right Amount.")
                    //     setModalWarningOpen(true)
                    // } else {
                    //     setModalSuccessOpen(true);
                    // }

                    // ตอนกด upload File ไปแล้ว ให้เคลียร์ของเลย ตอนนี้ file กับ comment ยังค้างอยู่ https://app.clickup.com/t/86erxfbq4
                    setFileName('No file chosen');
                    setValue('remark', '')

                }
            } catch (error) {
                // File upload failed:
            }
        } else {
            setFileName('No file chosen');
        }
        setTimeout(() => {
            setIsLoading(false);
        }, 100);
    };

    const handleRemoveFile = () => {
        setFileName("Maximum File 10 MB"); // Reset fileName
        setFileUpload(undefined);
        setValue('upload_tranform', null);
        setiserror(false);
    };

    const handleClickOutside = (event: any) => {
        if (popupRef.current && !popupRef.current.contains(event.target)) {
            setIsPopupVisible(false);
            setValue("period_number", null);
        }
    };

    useEffect(() => {
        if (isPopupVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isPopupVisible]);

    const handleChange = (event: any, newValue: any) => {
        // switch (newValue) {
        //     case 0:
        //         //tab daily
        //         // setFilteredDataTable(dataTable);
        //         break;
        //     case 1:
        //         //tab weekly
        //         // setFilteredDataTable(dataTableMonth);
        //         break;
        //     default:
        //         break;
        // }

        // ถ้าเปลี่ยน tab clear เลย
        setValue('remark', null)
        setFileName("Maximum File 10 MB"); // Reset fileName
        setFileUpload(undefined);

        setTabIndex(newValue);
    };

    const routeToUploadTemplate = () => {
        // let find_role_menu = userDT?.account_manage[0]?.account_role[0]?.role?.menus_config.find((item: any) => item.menus_id == 71)
        
        // const menu_upload = {
        //     "id": 6011,
        //     "url": "nominations/uploadTemplateForShipper",
        //     "name": "Upload template for shipper",
        //     "icon": {
        //         "type": {
        //             "type": {},
        //             "compare": null
        //         },
        //         "key": null,
        //         "ref": null,
        //         "props": {},
        //         "_owner": null,
        //         "_store": {}
        //     },
        //     "iconSize": {
        //         "type": {
        //             "type": {},
        //             "compare": null
        //         },
        //         "key": null,
        //         "ref": null,
        //         "props": {
        //             "style": {
        //                 "fontSize": "72px"
        //             }
        //         },
        //         "_owner": null,
        //         "_store": {}
        //     },
        //     "active": true,
        //     "toggle": false,
        //     "shortcut": [
        //         "nomuptempforshipper"
        //     ],
        //     "keywords": "nomuptempforshipper",
        //     "section": "Nominations",
        //     "subtitle": "Nominations > Upload template for shipper",
        //     "menus_config_id": 71,
        //     "menu": [],
        //     "role_config": find_role_menu
        // }
        // localStorage.setItem("k3a9r2b6m7t0x5w1s8j", encryptData(menu_upload));

        router.push("/en/authorization/nominations/uploadTemplateForShipper");
    }

    return (
        <div className="space-y-2">
            <div className="w-full h-[calc(100vh-160px)] flex flex-col items-center justify-start bg-center">

                <div className="w-full flex justify-start p-4 ">
                    <Tabs
                        value={tabIndex}
                        onChange={handleChange}
                        aria-label="tabs"
                        sx={{
                            marginBottom: "-19px !important",
                            "& .MuiTabs-indicator": {
                                display: "none", // Remove the underline
                            },
                            "& .Mui-selected": {
                                color: "#58585A !important",
                            },
                        }}
                    >
                        {["Daily", "Weekly"].map((label, index) => (
                            <Tab
                                key={label}
                                label={label}
                                id={`tab-${index}`}
                                sx={{
                                    fontFamily: "Tahoma !important",
                                    border: "0.5px solid",
                                    borderColor: "#DFE4EA",
                                    borderBottom: "none",
                                    borderTopLeftRadius: "9px",
                                    borderTopRightRadius: "9px",
                                    textTransform: "none",
                                    padding: "8px 16px",
                                    backgroundColor: tabIndex === index ? "#FFFFFF" : "#9CA3AF1A",
                                    color: tabIndex === index ? "#58585A" : "#9CA3AF",
                                    "&:hover": {
                                        backgroundColor: "#F3F4F6",
                                    },
                                }}
                            />
                        ))}
                    </Tabs>
                </div>
                <div className="w-full flex justify-start -mt-2 border-b border-gray-300"></div>

                <div className="w-full flex justify-end p-4">
                    <BtnGeneral
                        bgcolor={"#36B1AB"}
                        modeIcon={'template'}
                        textRender={"Template"}
                        // generalFunc={() => { router.push("/en/authorization/nominations/uploadTemplateForShipper"); }}
                        generalFunc={() => { routeToUploadTemplate() }}
                        // can_view={userPermission ? userPermission?.f_view : false}
                        can_view={true}
                    />
                </div>

                <div className="w-full flex justify-center pb-4">
                    <img
                        src={(`/assets/image/submission_file_img.svg`)}
                        alt="Uploaded Preview"
                        className="w-[200px] h-auto rounded mt-2 transition-opacity duration-300"
                    />
                </div>

                <div className="flex items-center justify-center ">
                    <div className="w-full max-w-lg space-y-2">
                        <div className="flex justify-between w-full">
                            {
                                tabIndex == 0 ?
                                    <>
                                        <span className="text-[#58585A]">Nomination Submission Deadline (For Tomorrow)</span>
                                        <span className="font-semibold text-[#58585A]"><span className="font-light">: </span>Today At 18:00</span>
                                    </>
                                    :
                                    <>
                                        <span className="text-[#58585A]">Nomination Submission Deadline (For Next Week)</span>
                                        <span className="font-semibold text-[#58585A]"><span className="font-light">: </span>Friday At 15:00</span>
                                    </>
                            }
                        </div>
                        <div className="flex justify-between w-full">
                            {
                                tabIndex == 0 ?
                                    <>
                                        <span className="text-[#58585A]">Renomination Submission Deadline (For Tomorrow)</span>
                                        <span className="font-semibold text-[#58585A]"><span className="font-light"> : </span>Today At 22:00</span>
                                    </>
                                    :
                                    <>
                                        <span className="text-[#58585A]">Renomination Submission Deadline (For Next Week)</span>
                                        <span className="font-semibold text-[#58585A]"><span className="font-light">: </span>Friday At 21:00</span>
                                    </>
                            }
                        </div>
                    </div>
                </div>

                <form onSubmit={handleFormSubmit} className="bg-white p-2 max-w">
                    <div className="grid grid-cols-[250px_250px] gap-2 pt-6 relative">
                        <Spinloading spin={isLoading} rounded={20} />
                        <label htmlFor="file" className={`${labelClass} -mb-[14px]`}>
                            <span className="text-red-500">*</span>{`File`}
                        </label>


                        {/* <div className="flex items-center col-span-2 -mt-2 "> */}
                        <div className={`flex items-center col-span-2 -mt-2 rounded-[6px] ${fileName == "Invalid file type. Please upload a Excel file." || fileName == 'The file is larger than 10 MB.' ? 'border  border-[#ff0000]' : ''}`}>
                            {/* "Choose File" button */}
                            <label className={`flex bg-[#00ADEF] text-white items-center justify-center font-light rounded-l-[6px] text-[16px] text-justify w-[40%] !h-[46px] px-2 cursor-pointer`}>
                                {`Choose File`}
                                <input
                                    id="url"
                                    type="file"
                                    className="hidden"
                                    {...register('upload_tranform')}
                                    accept=".xls, .xlsx"
                                    onChange={(e: any) => {
                                        handleFileChange(e)
                                    }}
                                />
                            </label>

                            <div className="bg-white text-[#9CA3AF] text-sm w-[70%] !h-[46px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden flex items-center">
                                <span className={`truncate ${fileName == 'Maximum File 10 MB' ? 'text-[#9CA3AF]' : 'text-[#464255]'} `}>{fileName}</span>
                                {fileName !== "Maximum File 10 MB" && (
                                    <CloseOutlinedIcon
                                        onClick={handleRemoveFile}
                                        className="cursor-pointer ml-2 text-[#9CA3AF] z-10"
                                        sx={{ color: '#323232', fontSize: 18 }}
                                        style={{ fontSize: 18 }}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="text-[14px] text-[#1473A1] -mt-1">
                            {requireText}
                        </div>
                        <div className={`text-[14px] text-red-500 col-span-2 -mt-1 ${!iserror ? 'hidden' : 'block'}`}>
                            {fileName !== 'Maximum File 10 MB' && fileName}
                        </div>

                        <div className="col-span-2 pt-3">
                            <label htmlFor="remark" className={labelClass}>
                                {`Comment`}
                            </label>
                            <TextField
                                {...register('remark', { required: false })}
                                value={watch('remark') || ''}
                                onChange={(e) => {
                                    if (e.target.value.length <= 255) {
                                        setValue('remark', e.target.value);
                                    }
                                }}
                                label=""
                                multiline
                                placeholder='Enter Comment'
                                // disabled={isReadOnly}
                                rows={4}
                                // sx={{
                                //     '.MuiOutlinedInput-root': {
                                //         borderRadius: '8px',
                                //     },
                                //     '.MuiOutlinedInput-notchedOutline': {
                                //         // borderColor: '#DFE4EA',
                                //         borderColor: errors.remark && !watch('remark') ? '#FF0000' : '#DFE4EA',
                                //     },
                                //     '&:hover .MuiOutlinedInput-notchedOutline': {
                                //         borderColor: errors.remark && !watch("remark") ? "#FF0000" : "#DFE4EA",
                                //     },
                                //     '&.Mui-focused .MuiOutlinedI nput-notchedOutline': {
                                //         borderColor: '#DFE4EA',
                                //     },
                                //     '&.MuiInputBase-input::placeholder': {
                                //         color: '#9CA3AF', // Placeholder color
                                //         fontSize: '14px', // Placeholder font size
                                //     },
                                //     '& .Mui-disabled': {
                                //         color: '#58585A', // Disabled text color
                                //     },
                                //     "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                //         borderColor: "#DFE4EA !important", // 👈 force black border on focus
                                //     },
                                //     "& .MuiOutlinedInput-root.Mui-hover .MuiOutlinedInput-notchedOutline": {
                                //         borderColor: "#DFE4EA !important", // 👈 force black border on focus
                                //     },
                                // }}
                                sx={{
                                    "& .MuiOutlinedInput-input": {
                                        color: isReadOnly ? "#464255 !important" : "inherit", // 👈 Ensures the actual text color changes
                                    },
                                    '.MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                    },
                                    '.MuiOutlinedInput-notchedOutline': {
                                        borderColor: errors.remark && !watch('remark') ? '#FF0000' : '#d2d4d8',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: errors.remark && !watch("remark") ? "#FF0000" : "#d2d4d8",
                                    },
                                    '&.Mui-focused .MuiOutlinedI nput-notchedOutline': {
                                        borderColor: '#d2d4d8',
                                    },
                                    '&.MuiInputBase-input::placeholder': {
                                        color: '#9CA3AF', // Placeholder color
                                        fontSize: '14px', // Placeholder font size
                                    },
                                    '& .Mui-disabled': {
                                        color: '#58585A', // Disabled text color
                                    },
                                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "#d2d4d8 !important", // 👈 force black border on focus
                                    },
                                }}
                                fullWidth
                                className={`${errors.remark && "border-red-500"} ${isReadOnly && '!bg-[#EFECEC]'}`}
                            />
                            {errors.remark && (<p className="text-red-500 text-sm">{`Enter Remark`}</p>)}
                            <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                <span className="text-[13px]">{watch('remark')?.length || 0} / 255</span>
                            </div>
                        </div>

                        <div className="flex items-end justify-end col-span-2 pt-3">
                            <label
                                onClick={handleClickUpload}
                                className={`${fileName === "Maximum File 10 MB" ? 'bg-[#B6B6B6] !text-[#FFFFFF] pointer-events-none !cursor-not-allowed' : 'hover:bg-[#28805a]'} ${fileName === "Invalid file type. Please upload a Excel file." || fileName == 'The file is larger than 10 MB.' || iserror ? 'bg-[#B6B6B6] !text-[#FFFFFF] pointer-events-none cursor-not-allowed' : 'hover:bg-[#28805a]'} w-[130px] ml-4 !h-[46px] font-bold bg-[#17AC6B] text-white py-2 px-5 rounded-lg cursor-pointer  focus:outline-none  flex items-center justify-center text-[16px] `}
                            >
                                {`Upload`}
                                <input
                                    type="button"
                                    className="hidden"
                                    // accept=".xls, .xlsx"
                                    // readOnly={isReadOnly}
                                    disabled={true}
                                    onClick={handleClickUpload}
                                />
                                <FileUploadRoundedIcon sx={{ color: '#ffffff', fontSize: '20px', marginLeft: "8px" }} />
                            </label>
                        </div>

                    </div>
                </form>
            </div >

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Success"
                description="Your file has been uploaded."
            />

            <ModalComponent
                open={isModalErrorOpen}
                handleClose={() => {
                    setModalErrorOpen(false);
                    handleRemoveFile();
                    // if (resetForm) resetForm();
                }}
                title="Failed"
                description={
                    modalErrorMsg?.split('<br/>')?.length > 1 ?
                        <div className={`${modalErrorMsg?.length > 400 ? "h-[calc(300px)] overflow-y-auto text-sm" : ""}`}>
                            <ul className=" text-start list-disc space-y-3 pl-4">
                                {
                                    modalErrorMsg.split('<br/>').map(item => {
                                        return (
                                            <li className="">{item}</li>
                                        )
                                    })
                                }
                            </ul>
                        </div>
                    :
                    <div>
                        <div className="text-center">
                            {`${modalErrorMsg}`}
                        </div>
                    </div>
                }
                stat="error"
            />

            <ModalComponent
                open={modalWarningOpen}
                handleClose={() => {
                    setModalWarningOpen(false);
                    // setModalSuccessOpen(true);
                    // if (resetForm) resetForm();
                }}
                title="Warning"
                description={
                    modalWarningMsg?.split('<br/>')?.length > 1 ?
                        <div className={`${modalWarningMsg?.length > 400 ? "h-[calc(300px)] overflow-y-auto text-sm" : ""}`}>
                            <ul className=" text-start list-disc space-y-3">
                                {
                                    modalWarningMsg.split('<br/>').map(item => {
                                        return (
                                            <li className="">- {item}</li>
                                        )
                                    })
                                }
                            </ul>
                        </div>
                    :
                    <div>
                        <div className="text-center">
                            {`${modalWarningMsg}`}
                        </div>
                    </div>
                }
                stat="confirm"
            />
        </div >

    );
};

export default ClientPage;