import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { uploadFileService } from "@/utils/postService";
import { cutUploadFileName, formatFormDate, formatWatchFormDate, getMinDate } from "@/utils/generalFormatter";
import { NumericFormat } from "react-number-format";
import DatePickaForm from "@/components/library/dateRang/dateSelectForm";
import dayjs from "dayjs";
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ModalConfirmSave from "@/components/other/modalConfirmSave";

type FormData = {
    orange_value: string;
    orange_mode: string;
    orange_url: string;
    yellow_value: string;
    yellow_mode: string;
    yellow_url: string;
    purple_url: string;
    red_url: string;
    green_url: string;
    gray_url: string;
    start_date: Date;
    end_date: Date;
};

type FormExampleProps = {
    mode?: "create" | "edit" | "view";
    data?: Partial<any>;
    open: boolean;
    termTypeMasterData: any
    onClose: () => void;
    onSubmit: SubmitHandler<any>;
    setResetForm: (reset: () => void) => void;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode = "create",
    data = {},
    termTypeMasterData = {},
    open,
    onClose,
    onSubmit,
    setResetForm,
}) => {

    const { control, register, handleSubmit, setValue, clearErrors, reset, formState: { errors }, watch } = useForm<any>({ defaultValues: data });
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const labelClass = "block mb-2 text-[14px] font-light"
    const inputClass = "text-[14px] block md:w-full p-2 ps-5 focus:!ps-5 hover:!ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"
    const textErrorClass = "text-red-500 text-[14px]"

    {/* Confirm Save */ }
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()

    // const isReadOnly = mode === "view";
    const isReadOnly: any = mode === "view" || (data?.start_date && new Date(data?.start_date) < new Date()); // Edit > รายการที่ถึงวันที่ Start date ไปแล้วจะไม่สามารถแก้ไขข้อมูลอะไรได้ นอกจาก End Date (เงื่อนไขคือ D+1) https://app.clickup.com/t/86ervtz5z

    const startDate = watch("start_date");
    const formattedStartDate = formatWatchFormDate(startDate);
    const [fileName, setFileName] = useState('No file chosen');

    const [storeBackup, setstoreBackup] = useState<any>();

    const [orangeFile, setOrangeFile] = useState<any>('No file chosen');
    const [yellowFile, setYellowFile] = useState<any>('No file chosen');
    const [purpleFile, setPurpleFile] = useState<any>('No file chosen');
    const [redFile, setRedFile] = useState<any>('No file chosen');
    const [greenFile, setGreenFile] = useState<any>('No file chosen');
    const [grayFile, setGrayFile] = useState<any>('No file chosen');

    const [isUploadingOrange, setIsUploadingOrange] = useState(false);
    const [isUploadingYellow, setIsUploadingYellow] = useState(false);
    const [isUploadingPurple, setIsUploadingPurple] = useState(false);
    const [isUploadingRed, setIsUploadingRed] = useState(false);
    const [isUploadingGreen, setIsUploadingGreen] = useState(false);
    const [isUploadingGrey, setIsUploadingGrey] = useState(false);

    const [orangeMode, setOrangeMode] = useState<any>("1");
    const [yellowMode, setYellowMode] = useState<any>("1");

    const handleFileChange = async (e: any, mode: any) => {
        const file = e.target.files[0];
        if (errors?.[mode]) {
            clearErrors(mode);
        }

        if (file) {
            const allowedTypes = ['image/png'];

            if (allowedTypes.includes(file.type)) {
                // setFileName(file.name);

                switch (mode) {
                    case 'orange_url':
                        setIsUploadingOrange(true);
                        break;
                    case 'yellow_url':
                        setIsUploadingYellow(true);
                        break;
                    case 'purple_url':
                        setIsUploadingPurple(true);
                        break;
                    case 'red_url':
                        setIsUploadingRed(true);
                        break;
                    case 'green_url':
                        setIsUploadingGreen(true);
                        break;
                    case 'gray_url':
                        setIsUploadingGrey(true);
                        break;
                }

                try {
                    const response: any = await uploadFileService('/files/uploadfile/', file);

                    switch (mode) {
                        case 'orange_url':
                            setValue("orange_url", response?.file?.url || "");
                            setOrangeFile(response?.file?.url)
                            setTimeout(() => {
                                setIsUploadingOrange(false);
                            }, 500);
                            break;
                        case 'yellow_url':
                            setValue("yellow_url", response?.file?.url || "");
                            setYellowFile(response?.file?.url)
                            setTimeout(() => {
                                setIsUploadingYellow(false);
                            }, 500);
                            break;
                        case 'purple_url':
                            setValue("purple_url", response?.file?.url || "");
                            setPurpleFile(response?.file?.url)
                            setTimeout(() => {
                                setIsUploadingPurple(false);
                            }, 500);
                            break;
                        case 'red_url':
                            setValue("red_url", response?.file?.url || "");
                            setRedFile(response?.file?.url)
                            setTimeout(() => {
                                setIsUploadingRed(false);
                            }, 500);
                            break;
                        case 'green_url':
                            setValue("green_url", response?.file?.url || "");
                            setGreenFile(response?.file?.url)
                            setTimeout(() => {
                                setIsUploadingGreen(false);
                            }, 500);
                            break;
                        case 'gray_url':
                            setValue("gray_url", response?.file?.url || "");
                            setGrayFile(response?.file?.url)
                            setTimeout(() => {
                                setIsUploadingGrey(false);
                            }, 500);
                            break;
                    }

                } catch (error) {
                    // File upload failed:
                }

            } else {
                setFileName('Invalid file type. Please upload a PDF.');
                // Invalid file type:'
            }
        } else {
            setFileName('No file chosen');
        }

    };

    const handleChange = (e: any, mode: any) => {
        switch (mode) {
            case 'orange_mode':
                setOrangeMode(e.target.value)

                break;
            case 'yellow_mode':
                setYellowMode(e.target.value)
                break;
        }
    };

    const handleClose = () => {
        onClose();
    }

    const rendercancleUpload = (tricker: any, settricker: any, value: any) => {
        // const orange_url: any = data?.orange_url
        const renderVal: any = storeBackup?.[value] == tricker ? undefined : storeBackup?.[value];

        return (
            tricker && tricker !== 'No file chosen' && (
                <div className="absolute right-0 top-0 cursor-pointer"
                    onClick={() => {
                        setValue(value, renderVal || '')
                        settricker(renderVal || 'No file chosen')
                    }}
                >
                    <CloseOutlinedIcon />
                </div>
            )
        )
    }

    useEffect(() => {
        if (open == true) {
            clearErrors();
            setstoreBackup(undefined);
            if (mode === 'create') {
                clearErrors();

                setValue("orange_value", "");
                setValue("orange_mode", "");
                setValue("orange_url", "");

                setValue("yellow_value", "");
                setValue("yellow_mode", "");
                setValue("yellow_url", "");

                setValue("purple_url", "");
                setValue("red_url", "");
                setValue("green_url", "");
                setValue("gray_url", "");

                setOrangeMode("1")
                setYellowMode("1")
                setOrangeFile('No file chosen');
                setYellowFile('No file chosen');

                setPurpleFile('No file chosen');
                setRedFile('No file chosen');
                setGreenFile('No file chosen');
                setGrayFile('No file chosen');

            } else if ((mode === "edit" || mode === "view") && data) {
                const formattedStartDate: any = formatFormDate(data?.start_date);
                // const formattedEndDate: any = formatFormDate(data?.end_date);
                let formattedEndDate: any = 'Invalid Date'
                if (data?.end_date !== null) {
                    formattedEndDate = formatFormDate(data?.end_date);
                }

                // for https://app.clickup.com/t/86eu07k7w เมื่อกด x ต้องคืนค่าเดิม
                setstoreBackup(data);
               
                const orange_url: any = data?.orange_url
                const yellow_url: any = data?.yellow_url
                const purple_url: any = data?.purple_url
                const red_url: any = data?.red_url
                const green_url: any = data?.green_url
                const gray_url: any = data?.gray_url

                setOrangeFile(orange_url)
                setYellowFile(yellow_url)
                setPurpleFile(purple_url)
                setRedFile(red_url)
                setGreenFile(green_url)
                setGrayFile(gray_url)
                setValue("orange_value", data?.orange_value || "");
                setValue("orange_mode", data?.orange_mode || "");
                setValue("orange_url", data?.orange_url || "");

                setValue("yellow_value", data?.yellow_value || "");
                setValue("yellow_mode", data?.yellow_mode || "");
                setValue("yellow_url", data?.yellow_url || "");

                setValue("purple_url", data?.purple_url || "");
                setValue("red_url", data?.red_url || "");
                setValue("green_url", data?.green_url || "");
                setValue("gray_url", data?.gray_url || "");

                setValue("start_date", formattedStartDate);
                setValue("end_date", formattedEndDate);

                setValue("thershold_float", (data?.thershold_float || data?.thershold_float === 0) ? data?.thershold_float : data?.thershold);

                setOrangeMode(data?.orange_mode?.toString());
                setYellowMode(data?.yellow_mode?.toString());
            }
        }
    }, [data, mode, setValue, open]);

    useEffect(() => {
        setOrangeFile('No file chosen');
        setYellowFile('No file chosen');
        setPurpleFile('No file chosen');
        setRedFile('No file chosen');
        setGreenFile('No file chosen');
        setGrayFile('No file chosen');

        setResetForm(() => reset);
    }, [reset, setResetForm]);

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
                            <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-md ">
                                <form
                                    // onSubmit={handleSubmit(async (data) => { // clear state when submit
                                    //     // handleFormSubmit(data);
                                    //     setTimeout(async () => {
                                    //         await onSubmit(data);
                                    //     }, 200);
                                    // })}
                                    onSubmit={handleSubmit(handleSaveConfirm)}
                                    className="bg-white p-8 rounded-[20px] shadow-lg max-w w-[1100px]"
                                >
                                    <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-5">{mode == "create" ? `New Metering Checking Condition` : mode == "edit" ? "Edit Metering Checking Condition" : "View Metering Checking Condition"}</h2>
                                    {/* <div className="grid grid-cols-[200px_400px_400px] gap-4"> */}
                                    <div className="grid grid-cols-[45%_55%] gap-4 mt-[-35px]">
                                        {/* ============== ORANGE ============== */}
                                        <div>
                                            <div className="grid grid-cols-[35%_40%] pt-[34px]">
                                                <div className="flex justify-start items-center">
                                                    <label
                                                        htmlFor="orange_value"
                                                        className={labelClass}
                                                    >
                                                        <span className="text-red-500">*</span>
                                                        {`สีส้ม ระบุค่ามากกว่า (%)`}
                                                    </label>
                                                </div>
                                                {/* <input
                                                    id="orange_value"
                                                    type="number"
                                                    placeholder="Orange"
                                                    readOnly={isReadOnly}
                                                    {...register("orange_value")}
                                                    className={`${inputClass} ${errors.orange_value && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                /> */}

                                                {/* orangeMode == 1 */}

                                                <div>
                                                    <NumericFormat
                                                        id="orange_value"
                                                        placeholder="0.000"
                                                        value={watch("orange_value")}
                                                        readOnly={isReadOnly}
                                                        {...register("orange_value", { required: true })}
                                                        className={`${inputClass} ${errors.orange_value && "border-red-500"} ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                        thousandSeparator={true}
                                                        decimalScale={3}
                                                        fixedDecimalScale={true}
                                                        allowNegative={false}
                                                        displayType="input"
                                                        onValueChange={(values) => {
                                                            const { value } = values;
                                                            if (value == '0.000') {
                                                                setValue("orange_value", null, { shouldValidate: true, shouldDirty: true });
                                                            } else {
                                                                setValue("orange_value", value, { shouldValidate: true, shouldDirty: true });
                                                            }
                                                        }}
                                                    />
                                                    {/* {errors.orange_value && (<p className="text-red-500 text-[14px]">{`Type orange_value`}</p>)} */}
                                                </div>
                                            </div>
                                            <div className="flex items-center !pt-5 !text-[14px] !text-[#58585A]">
                                                <h2 className="mr-4 !text-[14px]">{`สัญลักษณ์`}</h2>
                                                <div className="flex items-center">
                                                    <label className="mr-4 !text-[14px]">
                                                        <input
                                                            type="radio"
                                                            value="1"
                                                            {...register("orange_mode")}
                                                            checked={orangeMode === "1"}
                                                            onChange={(e) => {
                                                                if (isReadOnly) return; // กัน user กด
                                                                handleChange(e, 'orange_mode')

                                                                setValue('orange_url', '')
                                                                setOrangeFile('No file chosen')

                                                                clearErrors('orange_url');
                                                            }}
                                                            // className="mr-1  accent-[#1473A1]"
                                                              className={`mr-1 accent-[#1473A1] ${isReadOnly ? ' accent-[#58585A] pointer-events-none opacity-60' : ''}`}
                                                            // readOnly={isReadOnly}
                                                            // disabled={isReadOnly}
                                                        />
                                                        {`แสดง %`}
                                                    </label>
                                                    <label className="mr-4 !text-[14px]">
                                                        <input
                                                            type="radio"
                                                            // value={orangeMode}
                                                            value="2"
                                                            {...register("orange_mode")}
                                                            checked={orangeMode === "2"}
                                                            // onChange={handleChange}
                                                            onChange={(e) => {
                                                                if (isReadOnly) return; // กัน user กด
                                                                handleChange(e, 'orange_mode');
                                                                setValue('orange_value', '')
                                                                clearErrors('orange_value');
                                                            }}
                                                            // className="mr-1 accent-[#1473A1]"
                                                            className={`mr-1 accent-[#1473A1] ${isReadOnly ? ' accent-[#58585A] pointer-events-none opacity-60' : ''}`}

                                                            // readOnly={isReadOnly}
                                                            // disabled={isReadOnly}
                                                        />
                                                        {`ใช้สัญลักษณ์`}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* kom */}
                                        {/* ============================ ORANGE RIGHT PANEL ============================ */}
                                        <div className="grid grid-cols-[40px_auto] gap-2">
                                            <div className="flex justify-center items-center">
                                                <div style={{ border: '1px solid #dedede', background: isReadOnly ? '#EFECEC' : '#FFF' }} className="w-[40px] h-[40px] mt-[-10px] rounded-lg flex justify-center items-center">
                                                    {/* {orangeFile && <img src={orangeFile?.url ? (orangeFile?.url?.split('/')?.[0] == 'http:' || 'https:') && orangeFile?.url : '/assets/image/no_data_icon.svg'} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />} */}
                                                    {/* {orangeFile && <img src={orangeFile !== 'No file chosen' ? (orangeFile?.split('/')?.[0] == 'http:' || 'https:') && orangeFile : '/assets/image/no_data_icon.svg'} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />} */}
                                                    {orangeFile ?
                                                        <img src={orangeFile !== 'No file chosen' ? (orangeFile?.split('/')?.[0] == 'http:' || 'https:') && orangeFile : '/assets/image/no_data_icon.svg'} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                                                        :
                                                        <img src={'/assets/image/no_data_icon.svg'} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                                                    }
                                                </div>
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="url"
                                                    className="block mt-2 text-[14px] font-light pb-1 text-[#58585A]"
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {`ภาพสัญลักษณ์`}
                                                </label>

                                                <div className={`grid grid-cols-[30%_70%] items-center duration-100 ease-in-out ${errors.orange_url && "border border-red-500 rounded-md"}`}>
                                                    {/* "Choose File" button */}

                                                    <div className="w-full !h-[40px]">
                                                        <label className={`flex justify-center items-center !h-[40px] bg-[#00ADEF] text-white rounded-l-[6px] cursor-pointer ${isReadOnly && "!bg-[#B6B6B6] !text-[#828282]"} ${orangeMode == "1" && "!bg-[#B0B0B0] !text-[#828282]"}`}>
                                                            {`Choose File`}
                                                            {isUploadingOrange && (
                                                                <span className="ml-2 w-[14px] h-[14px] border-[2px] border-white border-t-transparent rounded-full animate-spin"></span>
                                                            )}
                                                            <input
                                                                id="url"
                                                                type="file"
                                                                className="hidden"
                                                                // {...register('orange_url', { required: orangeMode == "2" ? true : false })}
                                                                {...register('orange_url', {
                                                                    required: orangeMode === "2" && !watch('orange_url') ? 'This field is required' : false,
                                                                    validate: (value) => {
                                                                        if (orangeMode === "2" && !value) {
                                                                            return 'This field is required';
                                                                        }
                                                                        return true;
                                                                    }
                                                                })}
                                                                // accept=".pdf"
                                                                // accept=".png, .jpg, .jpeg, .ico"
                                                                accept=".png"
                                                                readOnly={isReadOnly || orangeMode == "1" && true}
                                                                disabled={isReadOnly || orangeMode == "1" && true}
                                                                // onChange={handleFileChange}
                                                                onChange={(e) => {
                                                                    handleFileChange(e, 'orange_url')
                                                                }}
                                                            />
                                                        </label>
                                                    </div>

                                                    <div className={`flex justify-between bg-white text-[#9CA3AF] text-[14px] w-[100%] !h-[40px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden ${isReadOnly && "!bg-[#EEEEEE] !text-[#878787]"} ${orangeMode == "1" && "!bg-[#EEEEEE] !text-[#878787]"}`}>
                                                        <div className="text-ellipsis overflow-hidden whitespace-nowrap w-[90%] relative">
                                                            {orangeFile && orangeFile !== 'No file chosen' ? cutUploadFileName(orangeFile) : orangeFile}
                                                        </div>
                                                        <div className="relative">
                                                            {!isReadOnly && open == true && rendercancleUpload(orangeFile, setOrangeFile, 'orange_url')}
                                                        </div>
                                                    </div>

                                                    {/* <div className={`bg-white text-[#9CA3AF] text-[14px] w-[70%] !h-[40px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden ${isReadOnly && "!bg-[#EEEEEE]"} ${orangeMode == "1" && "!bg-[#EEEEEE] !text-[#878787]"}`}>
                                                        {orangeFile}
                                                    </div> */}

                                                    {/* "Upload" button */}
                                                    {/* <label className={`w-[167px] ml-2 !h-[40px] font-bold bg-[#00ADEF] text-white py-2 px-5 rounded-lg cursor-pointer hover:bg-blue-600 focus:outline-none focus:bg-blue-600 flex items-center justify-center text-[14px] ${orangeMode == "1" && "!bg-[#9CA3AF] !text-[#DFE4EA]"}`}>
                                                        {`Upload`}
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            // accept=".pdf"
                                                            accept=".png, .jpg, .jpeg, .ico"
                                                            readOnly={isReadOnly || orangeMode == "1" && true}
                                                            disabled={isReadOnly || orangeMode == "1" && true}
                                                            // onChange={handleFileChange}
                                                            onChange={(e) => handleFileChange(e, 'orange_url')}
                                                        />
                                                    </label> */}
                                                </div>
                                                <div className="text-[14px] text-[#1473A1]">{'Required: .png'}</div>
                                            </div>
                                            {/* {errors.orange_url && (<p className="text-red-500 text-[14px] mb-5">{`Please upload file`}</p>)} */}
                                        </div>


                                        {/* ============== YELLOW ============== */}
                                        <div>
                                            <div className="grid grid-cols-[45%_30%]">
                                                <div className="flex justify-start items-center">
                                                    <label
                                                        htmlFor="yellow_value"
                                                        className={labelClass}
                                                    >
                                                        <span className="text-red-500">*</span>
                                                        {`สีเหลือง เมื่อมีค่าน้อยกว่า (%)`}
                                                    </label>
                                                </div>
                                                {/* <input
                                                    id="yellow_value"
                                                    type="number"
                                                    placeholder="Yellow"
                                                    readOnly={isReadOnly}
                                                    {...register("yellow_value")}
                                                    className={`${inputClass} ${errors.yellow_value && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                                /> */}
                                                <div>
                                                    <NumericFormat
                                                        id="yellow_value"
                                                        placeholder="0.000"
                                                        value={watch("yellow_value")}
                                                        readOnly={isReadOnly}
                                                        {...register("yellow_value", { required: true })}
                                                        className={`${inputClass} ${errors.yellow_value && "border-red-500"} ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                        thousandSeparator={true}
                                                        decimalScale={3}
                                                        fixedDecimalScale={true}
                                                        allowNegative={false}
                                                        displayType="input"
                                                        onValueChange={(values) => {
                                                            const { value } = values;
                                                            if (value == '0.000') {
                                                                setValue("yellow_value", null, { shouldValidate: true, shouldDirty: true });
                                                            } else {
                                                                setValue("yellow_value", value, { shouldValidate: true, shouldDirty: true });
                                                            }
                                                        }}
                                                    />
                                                    {/* {errors.yellow_value && (<p className="text-red-500 text-[14px]">{`Type yellow_value`}</p>)} */}
                                                </div>
                                            </div>
                                            <div className="flex items-center !pt-5 text-[14px] !text-[#58585A]">
                                                <h2 className="mr-4 !text-[14px]">{`สัญลักษณ์`}</h2>
                                                <div className="flex items-center">
                                                    <label className="mr-4 !text-[14px]">
                                                        <input
                                                            type="radio"
                                                            // value={yellowMode}
                                                            value="1"
                                                            checked={yellowMode === "1"}
                                                            {...register("yellow_mode")}
                                                            // onChange={handleChange}
                                                            // onChange={(e) => handleChange(e, 'yellow_mode')}
                                                            onChange={(e) => {
                                                                if (isReadOnly) return; // กัน user กด
                                                                handleChange(e, 'yellow_mode')

                                                                setValue('yellow_url', '')
                                                                setYellowFile('No file chosen')

                                                                clearErrors('yellow_url');
                                                            }}
                                                            // className="mr-1 accent-[#1473A1]"
                                                            className={`mr-1 accent-[#1473A1] ${isReadOnly ? ' accent-[#58585A] pointer-events-none opacity-60' : ''}`}

                                                            // readOnly={isReadOnly}
                                                            // disabled={isReadOnly}
                                                        />
                                                        {`แสดง %`}
                                                    </label>
                                                    <label className="mr-4 !text-[14px]">
                                                        <input
                                                            type="radio"
                                                            // value={yellowMode}
                                                            value="2"
                                                            checked={yellowMode === "2"}
                                                            {...register("yellow_mode")}
                                                            // onChange={handleChange}
                                                            onChange={(e) => {
                                                                if (isReadOnly) return; // กัน user กด
                                                                handleChange(e, 'yellow_mode');
                                                                setValue('yellow_value', '')
                                                                clearErrors('yellow_value');
                                                            }}
                                                            // className="mr-1 accent-[#1473A1]"
                                                            className={`mr-1 accent-[#1473A1] ${isReadOnly ? ' accent-[#58585A] pointer-events-none opacity-60' : ''}`}
                                                            // readOnly={isReadOnly}
                                                            // disabled={isReadOnly}
                                                        />
                                                        {`ใช้สัญลักษณ์`}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ============================ YELLOW RIGHT PANEL ============================ */}
                                        <div className="mt-[-35px] grid grid-cols-[40px_auto] gap-2">
                                            <div className="flex justify-center items-center">
                                                <div style={{ border: '1px solid #dedede', background: isReadOnly ? '#EFECEC' : '#FFF' }} className="w-[40px] h-[40px] mt-[-10px] rounded-lg flex justify-center items-center">
                                                    {/* {yellowFile && <img src={yellowFile?.split('/')?.[0] == 'http:' && 'https:' ? yellowFile : '/assets/image/no_data_icon.svg'} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />} */}
                                                    {/* {yellowFile && <img src={yellowFile !== 'No file chosen' ? (yellowFile?.split('/')?.[0] == 'http:' || 'https:') && yellowFile : '/assets/image/no_data_icon.svg'} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />} */}
                                                    {yellowFile ?
                                                        <img src={yellowFile !== 'No file chosen' ? (yellowFile?.split('/')?.[0] == 'http:' || 'https:') && yellowFile : '/assets/image/no_data_icon.svg'} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                                                        :
                                                        <img src={'/assets/image/no_data_icon.svg'} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                                                    }
                                                </div>
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="url"
                                                    className="block mt-2 text-[14px] font-light pb-1 text-[#58585A]"
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {`ภาพสัญลักษณ์`}
                                                </label>

                                                <div className={`grid grid-cols-[30%_70%] items-center duration-100 ease-in-out ${errors.yellow_url && "border border-red-500 rounded-md"}`}>
                                                    <div className="w-full !h-[40px]">
                                                        <label className={`flex justify-center items-center !h-[40px] bg-[#00ADEF] text-white rounded-l-[6px] cursor-pointer ${isReadOnly && "!bg-[#B6B6B6] !text-[#828282]"} ${yellowMode == "1" && "!bg-[#B0B0B0] !text-[#828282]"}`}>
                                                            {`Choose File`}
                                                            {isUploadingYellow && (
                                                                <span className="ml-2 w-[14px] h-[14px] border-[2px] border-white border-t-transparent rounded-full animate-spin"></span>
                                                            )}
                                                            <input
                                                                id="url"
                                                                type="file"
                                                                className="hidden"
                                                                accept=".png, .jpg, .jpeg, .ico"
                                                                // {...register('yellow_url', { required: yellowMode == "2" ? true : false })}
                                                                {...register('yellow_url', {
                                                                    required: yellowMode === "2" && !watch('yellow_url') ? 'This field is required' : false,
                                                                    validate: (value) => {
                                                                        if (yellowMode === "2" && !value) {
                                                                            return 'This field is required';
                                                                        }
                                                                        return true;
                                                                    }
                                                                })}
                                                                readOnly={isReadOnly || yellowMode == "1" && true}
                                                                disabled={isReadOnly || yellowMode == "1" && true}
                                                                // onChange={handleFileChange}
                                                                onChange={(e) => handleFileChange(e, 'yellow_url')}
                                                            />
                                                        </label>
                                                    </div>

                                                    {/* Filename display */}
                                                    {/* <div className={`bg-white text-[#9CA3AF] text-[14px] w-[70%] !h-[40px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden ${isReadOnly && "!bg-[#EFEDEC]"} ${yellowMode == "1" && "!bg-[#EEEEEE] !text-[#878787]"}`}>
                                                        {yellowFile}
                                                    </div> */}

                                                    <div className={`flex justify-between bg-white text-[#9CA3AF] text-[14px] w-[100%] !h-[40px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden ${isReadOnly && "!bg-[#EEEEEE] !text-[#878787]"} ${yellowMode == "1" && "!bg-[#EEEEEE] !text-[#878787]"}`}>
                                                        <div className="text-ellipsis overflow-hidden whitespace-nowrap w-[90%] relative">
                                                            {yellowFile && yellowFile !== 'No file chosen' ? cutUploadFileName(yellowFile) : yellowFile}
                                                        </div>
                                                        <div className="relative">
                                                            {!isReadOnly && open == true && rendercancleUpload(yellowFile, setYellowFile, 'yellow_url')}
                                                        </div>
                                                    </div>

                                                    {/* "Upload" button */}
                                                    {/* <label className={`w-[167px] ml-2 !h-[40px] font-bold bg-[#00ADEF] text-white py-2 px-5 rounded-lg cursor-pointer hover:bg-blue-600 focus:outline-none focus:bg-blue-600 flex items-center justify-center text-[14px] ${yellowMode == "1" && "!bg-[#9CA3AF] !text-[#DFE4EA]"}`}>
                                                        {`Upload`}
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            // accept=".pdf"
                                                            accept=".png, .jpg, .jpeg, .ico"
                                                            readOnly={isReadOnly || yellowMode == "1" && true}
                                                            disabled={isReadOnly || yellowMode == "1" && true}
                                                            // onChange={handleFileChange}
                                                            onChange={(e) => handleFileChange(e, 'yellow_url')}

                                                        />
                                                    </label> */}
                                                </div>

                                                <div className="text-[14px] text-[#1473A1]">{'Required: .png'}</div>
                                            </div>
                                            {/* {errors.yellow_url && (<p className="text-red-500 text-[14px] mb-5">{`Please upload file`}</p>)} */}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-[45%_55%] gap-4 !pt-5">
                                        {/* ============================ LEFT PANEL ============================ */}
                                        <div>
                                            <div>
                                                <div className="pb-2 col-span-2 w-[75%]">
                                                    <label className={labelClass}>
                                                        <span className="text-red-500">*</span>
                                                        {`Threshold (MMBTU)`}
                                                    </label>

                                                    <NumericFormat
                                                        id="thershold_float"
                                                        placeholder="0.000"
                                                        value={watch("thershold_float")}
                                                        readOnly={isReadOnly}
                                                        {...register("thershold_float", { required: "Enter Thershold" })}
                                                        className={`${inputClass} ${errors.thershold_float && "border-red-500"} ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                        thousandSeparator={true}
                                                        decimalScale={3}
                                                        fixedDecimalScale={true}
                                                        allowNegative={false}
                                                        displayType="input"
                                                        onValueChange={(values) => {
                                                            const { value } = values;
                                                            setValue("thershold_float", value, { shouldValidate: true, shouldDirty: true });
                                                        }}
                                                    />
                                                    {errors.thershold_float && (<p className="text-red-500 text-[14px]">{`Enter Threshold`}</p>)}
                                                </div>
                                            </div>
                                            <div className="pb-2 col-span-2 w-[75%] mt-[20px]">
                                                <label className={labelClass}>
                                                    <span className="text-red-500">*</span>
                                                    {`Start Date`}
                                                </label>

                                                {/* <DatePickaForm
                                                    {...register('start_date', { required: true })}
                                                    readOnly={isReadOnly}
                                                    placeHolder="Start Date"
                                                    mode={mode}
                                                    valueShow={dayjs(watch("start_date")).format("DD/MM/YYYY")}
                                                    // valueShow={watch("start_date")}
                                                    allowClear
                                                    onChange={(e: any) => { setValue('start_date', formatFormDate(e)), e == undefined && setValue('start_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                                />
                                                {errors.start_date && (<p className={`${textErrorClass}`}>{`Select Start Date`}</p>)} */}

                                                <DatePickaForm
                                                    {...register('start_date', { required: "Select start date" })}
                                                    readOnly={isReadOnly}
                                                    placeHolder="Select Start Date"
                                                    mode={mode}
                                                    valueShow={watch("start_date") && dayjs(watch("start_date")).format("DD/MM/YYYY")}
                                                    // min={formattedStartDate || undefined}
                                                    min={new Date()}
                                                    maxNormalForm={watch('end_date') && watch('end_date')} // ไม่ให้ start_date เกิน end_date
                                                    allowClear
                                                    isError={errors.start_date && !watch("start_date") ? true : false}
                                                    onChange={(e: any) => { setValue('start_date', formatFormDate(e)), e == undefined && setValue('start_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                                />
                                                {errors.start_date && !watch("start_date") && <p className={`${textErrorClass}`}>{'Select Start Date'}</p>}
                                            </div>

                                            <div className="pb-2 col-span-2 w-[75%] mt-[20px]">
                                                <label className={labelClass}>
                                                    {`End Date`}
                                                </label>
                                                <DatePickaForm
                                                    {...register('end_date')}
                                                    // readOnly={!formattedStartDate ? true : isReadOnly}
                                                    readOnly={!formattedStartDate ? true : (isReadOnly && mode === "view")}
                                                    placeHolder="Select End Date"
                                                    mode={mode}
                                                    // min={formattedStartDate || undefined}
                                                    min={getMinDate(formattedStartDate)}
                                                    valueShow={watch("end_date") ? dayjs(watch("end_date")).format("DD/MM/YYYY") : undefined}
                                                    allowClear
                                                    onChange={(e: any) => { setValue('end_date', formatFormDate(e)), e == undefined && setValue('end_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                                />
                                                {/* {errors.start_date && (<p className={`${textErrorClass}`}>{`Select End Date`}</p>)} */}
                                            </div>
                                        </div>

                                        {/* ============================ RIGHT PANEL ============================ */}
                                        <div className="mt-[-35px]">
                                            <div className="grid grid-cols-[40px_auto] gap-2">
                                                <div className="flex justify-center items-center">
                                                    <div style={{ border: '1px solid #dedede', background: isReadOnly ? '#EFECEC' : '#FFF' }} className="w-[40px] h-[40px] mt-[15px] rounded-lg flex justify-center items-center">
                                                        {/* {purpleFile && <img src={purpleFile} style={{width: '80%', height: '80%', objectFit: 'contain'}}/>} */}
                                                        {/* {purpleFile && <img src={purpleFile?.split('/')?.[0] == 'http:' && 'https:' ? purpleFile : '/assets/image/no_data_icon.svg'} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />} */}
                                                        {purpleFile && <img src={purpleFile !== 'No file chosen' ? (purpleFile?.split('/')?.[0] == 'http:' || 'https:') && purpleFile : '/assets/image/no_data_icon.svg'} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label
                                                        htmlFor="url"
                                                        className="block mt-2 text-[14px] font-light pb-1 text-[#58585A]"
                                                    >
                                                        <span className="text-red-500">*</span>
                                                        {/* {`สีม่วง กรณีค่าไม่เข้ามาในระบบ`} */}
                                                        {`สีม่วง กรณีค่าไม่เปลี่ยนแปลง`}
                                                    </label>

                                                    <div className={`grid grid-cols-[30%_70%] items-center duration-100 ease-in-out ${errors.purple_url && "border border-red-500 rounded-md"}`}>
                                                        {/* "Choose File" button */}
                                                        <div className="w-full !h-[40px]">
                                                            <label className={`flex justify-center items-center !h-[40px] bg-[#00ADEF] text-white rounded-l-[6px] cursor-pointer ${isReadOnly && "!bg-[#B6B6B6] !text-[#828282]"}`}>
                                                                {`Choose File`}
                                                                {isUploadingPurple && (
                                                                    <span className="ml-2 w-[14px] h-[14px] border-[2px] border-white border-t-transparent rounded-full animate-spin"></span>
                                                                )}
                                                                <input
                                                                    id="url"
                                                                    type="file"
                                                                    className="hidden"
                                                                    // {...register('purple_url', { required: true })}
                                                                    {...register('purple_url', {
                                                                        required: !watch('purple_url') ? 'This field is required' : false,
                                                                    })}
                                                                    // accept=".pdf"
                                                                    accept=".png"
                                                                    readOnly={isReadOnly}
                                                                    disabled={isReadOnly}
                                                                    // onChange={handleFileChange}
                                                                    onChange={(e) => handleFileChange(e, 'purple_url')}
                                                                />
                                                            </label>
                                                        </div>

                                                        {/* Filename display */}
                                                        <div className={` flex justify-between bg-white text-[#9CA3AF] text-[14px] w-[100%] !h-[40px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden ${isReadOnly && "!bg-[#EEEEEE] !text-[#878787]"}`}>
                                                            <div className="text-ellipsis overflow-hidden whitespace-nowrap w-[90%] relative">
                                                                {purpleFile && purpleFile !== 'No file chosen' ? cutUploadFileName(purpleFile) : purpleFile}
                                                            </div>
                                                            <div className="relative">
                                                                {!isReadOnly && open == true && rendercancleUpload(purpleFile, setPurpleFile, 'purple_url')}
                                                            </div>
                                                        </div>

                                                        {/* "Upload" button */}
                                                        {/* <label className={`w-[167px] ml-2 !h-[40px] font-bold bg-[#00ADEF] text-white py-2 px-5 rounded-lg cursor-pointer hover:bg-blue-600 focus:outline-none focus:bg-blue-600 flex items-center justify-center text-[14px] ${isReadOnly && "!bg-[#DFE4EA] !text-[#9CA3AF]"}`}>
                                                            {`Upload`}
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                // accept=".pdf"
                                                                accept=".png, .jpg, .jpeg, .ico"
                                                                readOnly={isReadOnly}
                                                                disabled={isReadOnly}
                                                                // onChange={handleFileChange}
                                                                onChange={(e) => handleFileChange(e, 'purple_url')}
                                                            />
                                                        </label> */}
                                                    </div>
                                                    <div className="text-[14px] text-[#1473A1]">{'Required: .png'}</div>
                                                    {/* {errors.purple_url && (<p className="text-red-500 text-[14px] mb-5">{`Please upload file`}</p>)} */}
                                                </div>
                                            </div>

                                            <div className="mt-[15px] grid grid-cols-[40px_auto] gap-2">
                                                <div className="flex justify-center items-center">
                                                    <div style={{ border: '1px solid #dedede', background: isReadOnly ? '#EFECEC' : '#FFF' }} className="w-[40px] h-[40px] mt-[15px] rounded-lg flex justify-center items-center">
                                                        {/* {redFile && <img src={redFile} style={{width: '80%', height: '80%', objectFit: 'contain'}}/>} */}
                                                        {/* {redFile && <img src={redFile?.split('/')?.[0] == 'http:' && 'https:' ? redFile : '/assets/image/no_data_icon.svg'} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />} */}
                                                        {redFile && <img src={redFile !== 'No file chosen' ? (redFile?.split('/')?.[0] == 'http:' || 'https:') && redFile : '/assets/image/no_data_icon.svg'} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label
                                                        htmlFor="url"
                                                        className="block mt-2 text-[14px] font-light pb-1 text-[#58585A]"
                                                    >
                                                        <span className="text-red-500">*</span>
                                                        {`สีแดง กรณีค่าติดลบ`}
                                                    </label>

                                                    {/* <div className="grid grid-cols-[30%_70%] items-center "> */}
                                                    <div className={`grid grid-cols-[30%_70%] items-center duration-100 ease-in-out ${errors.red_url && "border border-red-500 rounded-md"}`}>
                                                        {/* "Choose File" button */}
                                                        <div className="w-full !h-[40px]">
                                                            <label className={`flex justify-center items-center !h-[40px] bg-[#00ADEF] text-white rounded-l-[6px] cursor-pointer ${isReadOnly && "!bg-[#B6B6B6] !text-[#828282]"}`}>
                                                                {`Choose File`}
                                                                {isUploadingRed && (
                                                                    <span className="ml-2 w-[14px] h-[14px] border-[2px] border-white border-t-transparent rounded-full animate-spin"></span>
                                                                )}
                                                                <input
                                                                    id="url"
                                                                    type="file"
                                                                    className="hidden"
                                                                    // accept=".pdf"
                                                                    // accept=".png, .jpg, .jpeg, .ico"
                                                                    accept=".png"
                                                                    // {...register('red_url', { required: true })}
                                                                    {...register('red_url', {
                                                                        required: !watch('red_url') ? 'This field is required' : false,
                                                                    })}
                                                                    readOnly={isReadOnly}
                                                                    disabled={isReadOnly}
                                                                    // onChange={handleFileChange}
                                                                    onChange={(e) => handleFileChange(e, 'red_url')}
                                                                />
                                                            </label>
                                                        </div>

                                                        {/* Filename display */}
                                                        <div className={`flex justify-between bg-white text-[#9CA3AF] text-[14px] w-[100%] !h-[40px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden ${isReadOnly && "!bg-[#EEEEEE] !text-[#878787]"}`}>
                                                            <div className="text-ellipsis overflow-hidden whitespace-nowrap w-[90%] relative">
                                                                {redFile && redFile !== 'No file chosen' ? cutUploadFileName(redFile) : redFile}
                                                            </div>
                                                            <div className="relative">
                                                                {!isReadOnly && open == true && rendercancleUpload(redFile, setRedFile, 'red_url')}
                                                            </div>
                                                        </div>
                                                        {/* <div className={`bg-white text-[#9CA3AF] text-[14px] w-[70%] !h-[40px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden ${isReadOnly && "!bg-[#EEEEEE] !text-[#878787]"}`}>
                                                            {redFile}
                                                        </div> */}
                                                        {/* "Upload" button */}
                                                        {/* <label className={`w-[167px] ml-2 !h-[40px] font-bold bg-[#00ADEF] text-white py-2 px-5 rounded-lg cursor-pointer hover:bg-blue-600 focus:outline-none focus:bg-blue-600 flex items-center justify-center text-[14px] ${isReadOnly && "!bg-[#DFE4EA] !text-[#9CA3AF]"}`}>
                                                            {`Upload`}
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                // accept=".pdf"
                                                                accept=".png, .jpg, .jpeg, .ico"
                                                                readOnly={isReadOnly}
                                                                disabled={isReadOnly}
                                                                // onChange={handleFileChange}
                                                                onChange={(e) => handleFileChange(e, 'red_url')}
                                                            />
                                                        </label> */}
                                                    </div>
                                                    <div className="text-[14px] text-[#1473A1]">{'Required: .png'}</div>
                                                    {/* {errors.red_url && (<p className="text-red-500 text-[14px] mb-5">{`Please upload file`}</p>)} */}
                                                </div>
                                            </div>

                                            <div className="mt-[15px] grid grid-cols-[40px_auto] gap-2">
                                                <div className="flex justify-center items-center">
                                                    <div style={{ border: '1px solid #dedede', background: isReadOnly ? '#EFECEC' : '#FFF' }} className="w-[40px] h-[40px] mt-[15px] rounded-lg flex justify-center items-center">
                                                        {/* {greenFile && <img src={greenFile} style={{width: '80%', height: '80%', objectFit: 'contain'}}/>} */}
                                                        {/* {greenFile && <img src={greenFile?.split('/')?.[0] == 'http:' && 'https:' ? greenFile : '/assets/image/no_data_icon.svg'} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />} */}
                                                        {greenFile && <img src={greenFile !== 'No file chosen' ? (greenFile?.split('/')?.[0] == 'http:' || 'https:') && greenFile : '/assets/image/no_data_icon.svg'} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label
                                                        htmlFor="url"
                                                        className="block mt-2 text-[14px] font-light pb-1 text-[#58585A]"
                                                    >
                                                        <span className="text-red-500">*</span>
                                                        {`สีเขียว กรณี meter ปกติ`}
                                                    </label>

                                                    {/* <div className="grid grid-cols-[30%_70%] items-center "> */}
                                                    <div className={`grid grid-cols-[30%_70%] items-center duration-100 ease-in-out ${errors.green_url && "border border-red-500 rounded-md"}`}>
                                                        {/* "Choose File" button */}
                                                        <div className="w-full !h-[40px]">
                                                            <label className={`flex justify-center items-center !h-[40px] bg-[#00ADEF] text-white rounded-l-[6px] cursor-pointer ${isReadOnly && "!bg-[#B6B6B6] !text-[#828282]"}`}>
                                                                {`Choose File`}
                                                                {isUploadingGreen && (
                                                                    <span className="ml-2 w-[14px] h-[14px] border-[2px] border-white border-t-transparent rounded-full animate-spin"></span>
                                                                )}
                                                                <input
                                                                    id="url"
                                                                    type="file"
                                                                    className="hidden"
                                                                    // {...register('green_url', { required: true })}
                                                                    {...register('green_url', {
                                                                        required: !watch('green_url') ? 'This field is required' : false,
                                                                    })}
                                                                    // accept=".pdf"
                                                                    // accept=".png, .jpg, .jpeg, .ico"
                                                                    accept=".png"
                                                                    readOnly={isReadOnly}
                                                                    disabled={isReadOnly}
                                                                    // onChange={handleFileChange}
                                                                    onChange={(e) => handleFileChange(e, 'green_url')}
                                                                />
                                                            </label>
                                                        </div>

                                                        {/* Filename display */}
                                                        {/* <div className={`bg-white text-[#9CA3AF] text-[14px] w-[70%] !h-[40px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden ${isReadOnly && "!bg-[#EEEEEE] !text-[#878787]"}`}>
                                                            {greenFile}
                                                        </div> */}
                                                        <div className={`flex justify-between bg-white text-[#9CA3AF] text-[14px] w-[100%] !h-[40px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden ${isReadOnly && "!bg-[#EEEEEE] !text-[#878787]"}`}>
                                                            <div className="text-ellipsis overflow-hidden whitespace-nowrap w-[90%] relative">
                                                                {greenFile && greenFile !== 'No file chosen' ? cutUploadFileName(greenFile) : greenFile}
                                                            </div>
                                                            <div className="relative">
                                                                {!isReadOnly && open == true && rendercancleUpload(greenFile, setGreenFile, 'green_url')}
                                                            </div>
                                                        </div>

                                                        {/* "Upload" button */}
                                                        {/* <label className={`w-[167px] ml-2 !h-[40px] font-bold bg-[#00ADEF] text-white py-2 px-5 rounded-lg cursor-pointer hover:bg-blue-600 focus:outline-none focus:bg-blue-600 flex items-center justify-center text-[14px] ${isReadOnly && "!bg-[#DFE4EA] !text-[#9CA3AF]"}`}>
                                                            {`Upload`}
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                // accept=".pdf"
                                                                accept=".png, .jpg, .jpeg, .ico"
                                                                readOnly={isReadOnly}
                                                                disabled={isReadOnly}
                                                                // onChange={handleFileChange}
                                                                onChange={(e) => handleFileChange(e, 'green_url')}
                                                            />
                                                        </label> */}
                                                    </div>
                                                    <div className="text-[14px] text-[#1473A1]">{'Required: .png'}</div>
                                                    {/* {errors.green_url && (<p className="text-red-500 text-[14px] mb-5">{`Please upload file`}</p>)} */}
                                                </div>
                                            </div>

                                            <div className="mt-[15px] grid grid-cols-[40px_auto] gap-2">
                                                <div className="flex justify-center items-center">
                                                    <div style={{ border: '1px solid #dedede', background: isReadOnly ? '#EFECEC' : '#FFF' }} className="w-[40px] h-[40px] mt-[15px] rounded-lg flex justify-center items-center">
                                                        {/* {grayFile && <img src={grayFile} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />} */}
                                                        {grayFile && <img src={grayFile !== 'No file chosen' ? (grayFile?.split('/')?.[0] == 'http:' || 'https:') && grayFile : '/assets/image/no_data_icon.svg'} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor="url"
                                                        className="block mt-2 text-[14px] font-light pb-1 text-[#58585A]"
                                                    >
                                                        <span className="text-red-500">*</span>
                                                        {`สีเทา N/A กรณีค่าไม่เข้า`}
                                                    </label>

                                                    {/* <div className="grid grid-cols-[30%_70%] items-center "> */}
                                                    <div className={`grid grid-cols-[30%_70%] items-center duration-100 ease-in-out ${errors.gray_url && "border border-red-500 rounded-md"}`}>
                                                        {/* "Choose File" button */}
                                                        <div className="w-full !h-[40px]">
                                                            <label className={`flex justify-center items-center !h-[40px] bg-[#00ADEF] text-white rounded-l-[6px] cursor-pointer ${isReadOnly && "!bg-[#B6B6B6] !text-[#828282]"}`}>
                                                                {`Choose File`}
                                                                {isUploadingGrey && (
                                                                    <span className="ml-2 w-[14px] h-[14px] border-[2px] border-white border-t-transparent rounded-full animate-spin"></span>
                                                                )}
                                                                <input
                                                                    id="url"
                                                                    type="file"
                                                                    className="hidden"
                                                                    // {...register('gray_url', { required: true })}
                                                                    {...register('gray_url', {
                                                                        required: !watch('gray_url') ? 'This field is required' : false,
                                                                    })}
                                                                    // accept=".pdf"
                                                                    // accept=".png, .jpg, .jpeg, .ico"
                                                                    accept=".png"
                                                                    readOnly={isReadOnly}
                                                                    disabled={isReadOnly}
                                                                    // onChange={handleFileChange}
                                                                    onChange={(e) => handleFileChange(e, 'gray_url')}
                                                                />
                                                            </label>
                                                        </div>

                                                        {/* Filename display */}
                                                        {/* <div className={`bg-white text-[#9CA3AF] text-[14px] w-[70%] !h-[40px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden ${isReadOnly && "!bg-[#EEEEEE] !text-[#878787]"}`}>
                                                            {grayFile}
                                                        </div> */}
                                                        <div className={`flex justify-between bg-white text-[#9CA3AF] text-[14px] w-[100%] !h-[40px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden ${isReadOnly && "!bg-[#EEEEEE] !text-[#878787]"}`}>
                                                            <div className="text-ellipsis overflow-hidden whitespace-nowrap w-[90%] relative">
                                                                {grayFile && grayFile !== 'No file chosen' ? cutUploadFileName(grayFile) : grayFile}
                                                            </div>
                                                            <div className="relative">
                                                                {!isReadOnly && open == true && rendercancleUpload(grayFile, setGrayFile, 'gray_url')}
                                                            </div>
                                                        </div>

                                                        {/* "Upload" button */}
                                                        {/* <label className={`w-[167px] ml-2 !h-[40px] font-bold bg-[#00ADEF] text-white py-2 px-5 rounded-lg cursor-pointer hover:bg-blue-600 focus:outline-none focus:bg-blue-600 flex items-center justify-center text-[14px] ${isReadOnly && "!bg-[#DFE4EA] !text-[#9CA3AF]"}`}>
                                                            {`Upload`}
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                // accept=".pdf"
                                                                accept=".png, .jpg, .jpeg, .ico"
                                                                readOnly={isReadOnly}
                                                                disabled={isReadOnly}
                                                                // onChange={handleFileChange}
                                                                onChange={(e) => handleFileChange(e, 'gray_url')}
                                                            />
                                                        </label> */}
                                                    </div>
                                                    <div className="text-[14px] text-[#1473A1]">{'Required: .png'}</div>
                                                    {/* {errors.gray_url && (<p className="text-red-500 text-[14px] mb-5">{`Please upload file`}</p>)} */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-6">
                                        {mode === "view" ? (
                                            <button
                                                type="button"
                                                onClick={handleClose}
                                                className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                            >
                                                {`Close`}
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleClose}
                                                className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500"
                                            >
                                                {`Cancel`}
                                            </button>
                                        )}

                                        {mode !== "view" && (
                                            <button
                                                type="submit"
                                                className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                            >
                                                {mode === "create" ? "Add" : "Save"}
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