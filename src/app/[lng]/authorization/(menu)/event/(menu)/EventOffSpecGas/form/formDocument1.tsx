import { useEffect, useState } from "react";
import { cutUploadFileName, formatFormDate } from '@/utils/generalFormatter';
import dayjs from 'dayjs';
import { SubmitHandler, useForm } from "react-hook-form";
import ModalConfirmSave from "@/components/other/modalConfirmSave";
import { TextField } from "@mui/material";
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DatePickaFormThai from "@/components/library/dateRang/dateSelectFormThai";
import { uploadFileService } from "@/utils/postService";
import getUserValue from "@/utils/getuserValue";
import { PdfDoc1 } from "@/components/other/pdf_event/docEvent";

type FormExampleProps = {
    data?: Partial<any>;
    mode?: any;
    setIsOpenDocument?: any;
    dataOpenDocument?: any;
    modeOpenDocument?: any;
    onSubmit: SubmitHandler<any>;
};

const inputClass = "text-[14px] block md:w-full p-2 ps-5 focus:!ps-5 hover:!ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"
const labelClass = "block mb-2 text-[14px] text-[#464255] font-semibold"
const textErrorClass = "text-red-500 text-[14px] "


{/* // key ใน DB ตามฟอร์ม
    // จุดส่งเข้าที่เกิดเหตุ | input_delivery_point_at_the_scene
    // วัน/เวลาที่เกิดเหตุ | input_date_time_of_the_incident
    // ประเภทและค่าของคุณภาพก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ | input_gas_quality_is_not_in_the_gas_quality_requirements
    // เพิ่มเติม | input_more
    // สาเหตุที่ทำให้ก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ | input_reason_the_gas_quality_requirements
    // ระยะเวลาที่คาดว่าจะแก้ไขแล้วเสร็จ | input_duration_that_is_expected_to_be_completed
    // หมายเหตุ | input_note 
    // 
*/}

const FormDocument1: React.FC<FormExampleProps> = ({ mode, data, onSubmit, setIsOpenDocument, dataOpenDocument, modeOpenDocument }) => {
    const [dataPDFItem, setdataPDFItem] = useState<any>(null)
    const userDT: any = getUserValue();
    const { control, register, handleSubmit, setValue, reset, resetField, clearErrors, formState: { errors }, watch, } = useForm<any>({ defaultValues: data, });
    const [headerFormText, setHeaderFormText] = useState('');
    const [fileNameEditText, setFileNameEditText] = useState(''); // เอาไว้แสดงชื่อไฟล์ตอนเข้ามา view หรือ edit
    const [fileNameEditTextUrl, setFileNameEditUrl] = useState(''); // เอาไว้กดโหลดตอนเข้ามา view หรือ edit
    const [documentOneId, setDocumentOneId] = useState(''); // ID ของ Document 1
    // const isReadOnly = mode === "view" || mode == 'edit';
   
    // const darftEdit = (mode == 'edit' ? ((userDT?.account_manage?.[0]?.user_type_id === 3 || userDT?.account_manage?.[0]?.user_type_id == 4) && dataOpenDocument?.event_doc_status_id === 1 ? false : (mode == 'edit')) : (mode == 'edit'))
    // const isReadOnly = darftEdit ? false : mode === "view";
    const modeDraft = dataOpenDocument?.document1?.event_doc_status_id === 1 ? true : false
    const isShipper = (userDT?.account_manage?.[0]?.user_type_id === 3 || userDT?.account_manage?.[0]?.user_type_id === 4) ? true : false;
    const isReadOnly = modeDraft ? false : (mode === "view" || mode == 'edit');
    // console.log('dataOpenDocument : ', dataOpenDocument);
    // console.log('modeDraft : ', modeDraft);
    // // console.log('darftEdit : ', darftEdit);
    // console.log('isReadOnly : ', isReadOnly);
    // userDT?.account_manage?.[0]?.user_type_id === 3
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isTsoEdited, setIsTsoEdited] = useState<boolean>(false);

    const textFieldSx = {
        '.MuiOutlinedInput-root': {
            borderRadius: '8px',
            fontSize: "14px",
            color: '#464255 !important', // Disabled text color
        },
        '.MuiOutlinedInput-notchedOutline': {
            // borderColor: '#DFE4EA',
            borderColor: errors.remark && !watch('remark') ? '#FF0000' : '#DFE4EA',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: errors.remark && !watch("remark") ? "#FF0000" : '#DFE4EA !important',
        },
        '&.Mui-focused .MuiOutlinedI nput-notchedOutline': {
            borderColor: '#00ADEF',
        },
        '&.MuiInputBase-input::placeholder': {
            color: '#9CA3AF', // Placeholder color
            fontSize: '14px', // Placeholder font size
        },
        '& .Mui-disabled': {
            color: '#464255 !important', // Disabled text color
        },
        "& .MuiOutlinedInput-input::placeholder": {
            fontSize: "14px",
        },
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#00ADEF !important", // 👈 force black border on focus
            borderWidth: '1px', // 👈 Force border 1px on focus
        },
    }

    const inputPropsTextField = {
        style: {
            color: isReadOnly ? "#464255" : "inherit", // 👈 Another enforcement for cross-browser support
        },
        disableUnderline: true,
    }

    {/* Confirm Save */ }
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()

    useEffect(() => {
        let text_header: any = 'สร้างเอกสารแจ้งเตือนคุณภาพก๊าซฯ 1'
        switch (modeOpenDocument) {
            case 'view':
                text_header = 'ดูข้อมูลเอกสารแจ้งเตือนคุณภาพก๊าซฯ 1'
                break;
            case 'edit':
                text_header = 'แก้ไขเอกสารแจ้งเตือนคุณภาพก๊าซฯ 1'
                break;
            case 'create':
                setValue('zone_ck', 1)
                break;
        }
        setHeaderFormText(text_header)

        if (modeOpenDocument == 'edit' || modeOpenDocument == 'view') {
            setDocumentOneId(dataOpenDocument?.document1?.id)

            // SET ข้อมูลลงฟอร์มนะ
            setValue('zone_ck', dataOpenDocument?.zone_ck)

            setValue('event_nember', dataOpenDocument?.event_nember)
            setValue('event_date', dataOpenDocument?.document1?.event_date)
            setValue('longdo_dict', dataOpenDocument?.document1?.longdo_dict)

            setValue('input_delivery_point_at_the_scene', dataOpenDocument?.document1?.input_delivery_point_at_the_scene)
            setValue('input_date_time_of_the_incident', dataOpenDocument?.document1?.input_date_time_of_the_incident)
            setValue('input_gas_quality_is_not_in_the_gas_quality_requirements', dataOpenDocument?.document1?.input_gas_quality_is_not_in_the_gas_quality_requirements)
            setValue('input_more', dataOpenDocument?.document1?.input_more)
            // setValue('input_reason_that_the_gas_is_not_in_the_gas_quality_requirements', dataOpenDocument?.document1?.input_reason_that_the_gas_is_not_in_the_gas_quality_requirements) // แบงค์บอกคีย์มันยาวเกิน
            setValue('input_reason_the_gas_quality_requirements', dataOpenDocument?.document1?.input_reason_the_gas_quality_requirements)
            setValue('input_duration_that_is_expected_to_be_completed', dataOpenDocument?.document1?.input_duration_that_is_expected_to_be_completed)
            // setValue('event_doc_status_id', dataOpenDocument?.document1?.event_doc_status_id)
            setValue('event_doc_status_id', dataOpenDocument?.document1?.event_doc_status_id == 3 ? 'accepted' : dataOpenDocument?.document1?.event_doc_status_id == 4 ? 'rejected' : dataOpenDocument?.document1?.event_doc_status_id == 5 ? 'acknowledge' : '')
            setValue('input_note', dataOpenDocument?.document1?.input_note)
            setFileNameEditText(dataOpenDocument?.document1?.event_document_file?.length > 0 ? cutUploadFileName(dataOpenDocument?.document1?.event_document_file[0]?.url) : '')
            setFileNameEditUrl(dataOpenDocument?.document1?.event_document_file?.length > 0 ? dataOpenDocument?.document1?.event_document_file[0]?.url : '')
        }

    }, [mode])

    {/* Confirm Save */ }
    const handleSaveConfirm = async (data?: any) => {
        if (mode == 'create') {
            const shipper_create = {
                zone_ck: watch("zone_ck") && Number(watch("zone_ck")) || null,
                zone_other: watch("zone_other") || null,
                zone_text: watch("zone_ck") == 1 ? "East" : watch("zone_ck") == 2 ? "West" : watch("zone_ck") == 3 ? "East - West" : (watch("zone_other") || null),

                "event_date": data?.event_date,
                "longdo_dict": data?.longdo_dict, //สำเนา
                "input_delivery_point_at_the_scene": data?.input_delivery_point_at_the_scene,
                "input_date_time_of_the_incident": data?.input_date_time_of_the_incident,
                "input_gas_quality_is_not_in_the_gas_quality_requirements": data?.input_gas_quality_is_not_in_the_gas_quality_requirements,
                "input_more": data?.input_more,
                // "input_reason_that_the_gas_is_not_in_the_gas_quality_requirements": data?.input_reason_that_the_gas_is_not_in_the_gas_quality_requirements, // แบงค์บอกคีย์มันยาวเกิน
                "input_reason_the_gas_quality_requirements": data?.input_reason_the_gas_quality_requirements,
                "input_duration_that_is_expected_to_be_completed": data?.input_duration_that_is_expected_to_be_completed,
                "file": fileUrl !== '' ? [fileUrl] : []
            }
            setdataPDFItem({userDT:userDT, dataOpenDocument: dataOpenDocument, data:[{item:shipper_create, data: data}]})
            setDataSubmit(shipper_create)
            setModaConfirmSave(true)

            // await onSubmit(shipper_create); // ไป submit ตอนกดเฟิร์ม
        } else {
            // https://localhost:4001/master/event/offspec-gas/doc1/pdf/33

            if(((isShipper) && dataOpenDocument?.event_status_id === 1)){
              
                const shipper_action = {
                    ...data,
                    "document_id": documentOneId, // เอาไว้ใช้เส้น put master/event/offspec-gas/doc1/13
                    "event_doc_status_id": 2, // 3 Accept, 4 Reject, 5 Acknowledge
                }
                setdataPDFItem({userDT:userDT, dataOpenDocument: dataOpenDocument, data:[{item:shipper_action, data: data}]})
                setDataSubmit(shipper_action)
                setModaConfirmSave(true)
            }else{

                let stat_tso_edit: any = 3
                switch (data?.event_doc_status_id) {
                    case 'accepted':
                        stat_tso_edit = 3
                        break;
                    case 'rejected':
                        stat_tso_edit = 4
                        break;
                    case 'acknowledge':
                        stat_tso_edit = 5
                        break;
                    default:
                        return stat_tso_edit
                }
    
                const tso_action = {
                    "document_id": documentOneId, // เอาไว้ใช้เส้น put master/event/offspec-gas/doc1/13
                    "event_doc_status_id": stat_tso_edit, // 3 Accept, 4 Reject, 5 Acknowledge
                    "input_note": data?.input_note
                }
                setdataPDFItem({userDT:userDT, dataOpenDocument: dataOpenDocument, data:[{item:{...data, ...tso_action}, data: data}]})
                setDataSubmit(tso_action)
                setModaConfirmSave(true)
            }
        }

        // reset();
    }

    // ############# UPLOAD FILE #############
    const [fileName, setFileName] = useState('Maximum File 10 MB');
    const [fileUpload, setFileUpload] = useState<any>();
    const [fileUrl, setFileUrl] = useState<any>('');
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: any) => {
        setIsLoading(true);
        const file = e.target.files[0];
        if (file) {
            setIsUploading(true);

            const maxSizeInMB = 10; // Maximum file size in MB
            const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

            if (file.size > maxSizeInBytes) {
                setFileName('The file is larger than 10 MB.');
                setIsUploading(false)
                // File size too large:
                return;
            }

            const response: any = await uploadFileService('/files/uploadfile/', file);

            setFileName(file.name);
            setFileUpload(file);
            setFileUrl(response?.file?.url);

            setTimeout(() => {
                setIsUploading(false);
            }, 500);
            // setModalMsg("Your file has been uploaded")

        } else {
            setFileName('No file chosen');
        }

        setTimeout(() => {
            setIsLoading(false);
        }, 300);
    };

    const handleRemoveFile = () => {
        setFileName("Maximum File 10 MB"); // Reset fileName
        setFileUpload(undefined);
        setValue('file', null);
        // setFileUrl('')
    };

    // ############# DOWNLOAD FILE #############
    // const downloadFile = () => {
    //     const link = document.createElement('a');
    //     link.href = fileNameEditTextUrl;

    //     const fileName = fileNameEditTextUrl.split('/').pop();
    //     link.download = fileName || 'download';

    //     document.body.appendChild(link);
    //     link.click();
    //     document.body.removeChild(link);
    // };

    const downloadFile = async () => {
        try {
            const response = await fetch(fileNameEditTextUrl);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const fileName = fileNameEditTextUrl.split('/').pop() || 'image.jpg';

            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            // Error downloading image:
        }
    };

    return (<>
        <span className="text-[20px] text-[#58585A] font-semibold">{headerFormText}</span>
        <form
            onSubmit={handleSubmit(handleSaveConfirm)}
            className='bg-white w-full max-w'
        >
            <div className="flex gap-4 pt-4">
                {
                    mode == 'edit' && <div className="w-[350px]">
                        <label htmlFor="event_nember" className={labelClass}>
                            {`Event Code`}
                        </label>
                        <input
                            id="event_nember"
                            {...register('event_nember')}
                            type="text"
                            placeholder="Enter Event Code"
                            readOnly={true}
                            className={`${inputClass} !bg-[#EFECEC]`}
                            onInput={(e) => (e.currentTarget.value = e.currentTarget.value.toUpperCase())}
                        />
                    </div>
                }

                <div className="pb-2 w-[200px]">
                    <label className={labelClass}>
                        <span className="text-red-500">*</span>
                        {`วันที่ออกเอกสาร`}
                    </label>
                    <DatePickaFormThai
                        {...register('event_date', { required: "เลือกวันที่" })}
                        readOnly={isReadOnly}
                        placeHolder="เลือกวันที่"
                        mode={mode}
                        valueShow={watch("event_date") ? dayjs(watch("event_date")).format("DD/MM/YYYY") : undefined}
                        // min={new Date()}
                        allowClear
                        isError={errors.event_date && !watch("event_date") ? true : false}
                        onChange={(e: any) => { setValue('event_date', formatFormDate(e)), e == undefined && setValue('event_date', null, { shouldValidate: true, shouldDirty: true }); }}
                    />
                    {errors.event_date && !watch("event_date") && <p className={`${textErrorClass}`}>{'เลือกวันที่'}</p>}
                </div>
            </div>

            <div className="flex gap-4 pt-4">

                <div className="gap-2 w-full h-[44px] flex items-center ">
                        <label className="w-[180px] text-[#58585A] whitespace-nowrap">
                            <input
                                type="radio"
                                {...register("zone_ck", { required: false })}
                                value="1"
                                disabled={mode === "create" ? false : true}
                                checked={watch("zone_ck") == 1}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`Onshore East`}
                        </label>

                        <label className="w-[180px] text-[#58585A] whitespace-nowrap">
                            <input
                                type="radio"
                                {...register("zone_ck", { required: false })}
                                value="2"
                                disabled={mode === "create" ? false : true}
                                checked={watch("zone_ck") == 2}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`Onshore West`}
                        </label>

                        <label className="w-[250px] text-[#58585A] whitespace-nowrap">
                            <input
                                type="radio"
                                {...register("zone_ck", { required: false })}
                                value="3"
                                disabled={mode === "create" ? false : true}
                                checked={watch("zone_ck") == 3}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`Onshore East - West`}
                        </label>

                        <label className="w-full flex items-center gap-2 text-[#58585A] mr-8 whitespace-nowrap">
                            <input
                                type="radio"
                                {...register("zone_ck", { required: false })}
                                value="4"
                                disabled={mode === "create" ? false : true}
                                checked={watch("zone_ck") == 4}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`Other`}

                            {
                                watch('zone_ck') == 4 && <input
                                    type="text"
                                    disabled={mode === "create" ? false : true}
                                    {...register('zone_other', { required: false })}
                                    value={watch('zone_other')}
                                    onChange={(e) => setValue('zone_other', e.target.value)}
                                    className={`text-[14px] block md:w-full ps-5 focus:!ps-5 hover:!ps-5 pe-10 h-[34px] border-b-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF] ${errors.zone_other && 'border-red-500'}`}
                                />
                            }

                        </label>
                    </div>

            </div>

            {/* สำเนา */}
            <div className="flex flex-wrap flex-auto gap-4 pt-4">
                <div className="w-full">
                    <label className={`${labelClass}`}>{`สำเนา`}</label>
                    <TextField
                        {...register("longdo_dict")}
                        value={watch("longdo_dict") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 255) {
                                setValue("longdo_dict", e.target.value);
                            }
                        }}
                        placeholder="ระบุรายละเอียด"
                        disabled={isReadOnly}
                        rows={2}
                        sx={textFieldSx}
                        className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">
                            {watch("longdo_dict")?.length || 0} / 255
                        </span>
                    </div>
                </div>
            </div>

            <div className="py-2 text-[14px] font-semibold text-[#58585A]">
                {`ส่วนของผู้ใช้บริการ (ผู้ที่ทำให้เกิดเหตุการณ์)`}
            </div>

            {/* จุดส่งเข้าที่เกิดเหตุ */}
            <div className="grid grid-cols-2 gap-4 pt-3">
                <div className="w-full">
                    <label className={`${labelClass}`}>{`จุดส่งเข้าที่เกิดเหตุ`}</label>
                    <TextField
                        {...register("input_delivery_point_at_the_scene")}
                        value={watch("input_delivery_point_at_the_scene") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 255) {
                                setValue("input_delivery_point_at_the_scene", e.target.value);
                            }
                        }}
                        placeholder="ระบุรายละเอียด"
                        disabled={isReadOnly}
                        rows={2}
                        sx={textFieldSx}
                        className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">
                            {watch("input_delivery_point_at_the_scene")?.length || 0} / 255
                        </span>
                    </div>
                </div>


                <div className="w-full">
                    <label className={labelClass}>{`วัน/เวลาที่เกิดเหตุ`}</label>
                    <TextField
                        {...register("input_date_time_of_the_incident")}
                        value={watch("input_date_time_of_the_incident") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 255) {
                                setValue("input_date_time_of_the_incident", e.target.value);
                            }
                        }}
                        placeholder="ระบุรายละเอียด"
                        disabled={isReadOnly}
                        rows={2}
                        sx={textFieldSx}
                        className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">
                            {watch("input_date_time_of_the_incident")?.length || 0} / 255
                        </span>
                    </div>
                </div>
            </div>

            {/* ประเภทและค่าของคุณภาพก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ */}
            <div className="grid grid-cols-2 gap-4 pt-3">
                <div className="w-full col-span-2">
                    <label className={labelClass}>{`ประเภทและค่าของคุณภาพก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ`}</label>
                    <TextField
                        {...register("input_gas_quality_is_not_in_the_gas_quality_requirements")}
                        value={watch("input_gas_quality_is_not_in_the_gas_quality_requirements") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 500) {
                                setValue("input_gas_quality_is_not_in_the_gas_quality_requirements", e.target.value);
                            }
                        }}
                        placeholder="ระบุรายละเอียด"
                        disabled={isReadOnly}
                        rows={2}
                        sx={textFieldSx}
                        className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">
                            {watch("input_gas_quality_is_not_in_the_gas_quality_requirements")?.length || 0} / 500
                        </span>
                    </div>
                </div>
            </div>

            {/* เพิ่มเติม */}
            <div className="grid grid-cols-2 gap-4 pt-3">
                <div className="w-full">
                    <label className={labelClass}>{`เพิ่มเติม`}</label>
                    <TextField
                        {...register("input_more")}
                        value={watch("input_more") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 255) {
                                setValue("input_more", e.target.value);
                            }
                        }}
                        placeholder="ระบุรายละเอียด"
                        disabled={isReadOnly}
                        rows={2}
                        sx={textFieldSx}
                        className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">
                            {watch("input_more")?.length || 0} / 255
                        </span>
                    </div>
                </div>

                <div className="w-full">
                    <label className={labelClass}>{`สาเหตุที่ทำให้ก๊าซไม่อยู่ในข้อกำหนดคุณภาพก๊าซ`}</label>
                    <TextField
                        {...register("input_reason_the_gas_quality_requirements")}
                        value={watch("input_reason_the_gas_quality_requirements") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 500) {
                                setValue("input_reason_the_gas_quality_requirements", e.target.value);
                            }
                        }}
                        placeholder="ระบุรายละเอียด"
                        disabled={isReadOnly}
                        rows={2}
                        sx={textFieldSx}
                        className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">
                            {watch("input_reason_the_gas_quality_requirements")?.length || 0} / 500
                        </span>
                    </div>
                </div>
            </div>

            {/* ระยะเวลาที่คาดว่าจะแก้ไขแล้วเสร็จ */}
            <div className="grid grid-cols-2 gap-4 pt-3">
                <div className="w-full col-span-2">
                    <label className={labelClass}>{`ระยะเวลาที่คาดว่าจะแก้ไขแล้วเสร็จ`}</label>
                    <TextField
                        {...register("input_duration_that_is_expected_to_be_completed")}
                        value={watch("input_duration_that_is_expected_to_be_completed") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 255) {
                                setValue("input_duration_that_is_expected_to_be_completed", e.target.value);
                            }
                        }}
                        placeholder="ระบุรายละเอียด"
                        disabled={isReadOnly}
                        rows={2}
                        sx={textFieldSx}
                        className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">
                            {watch("input_duration_that_is_expected_to_be_completed")?.length || 0} / 255
                        </span>
                    </div>
                </div>
            </div>


            {/* File */}
            {/* ถ้าเป็น edit แสดงอันนี้ */}
            {
                // (mode == 'edit' || mode == 'view') && fileNameEditTextUrl !== '' &&
                (mode == 'edit' || mode == 'view') && fileNameEditTextUrl !== '' &&
                <div className="grid grid-cols-2 gap-4 pt-3">
                    <div className="col-span-2 ">
                        <label className={`${labelClass} !font-light`}>
                            {`File`}
                        </label>
                        <div className="h-[46px] text-[#464255] p-3 rounded-[6px] bg-[#F3F2F2] flex justify-between w-full">
                            <div className="flex items-center gap-2">
                                <InsertDriveFileOutlinedIcon sx={{ fontSize: '20px' }} /> {fileNameEditText}
                            </div>

                            <button
                                type="button"
                                className={`flex items-center justify-center px-[2px] py-[2px] rounded-[4px] relative ${fileNameEditTextUrl === '' ? 'bg-[#f0f0f0] cursor-not-allowed pointer-events-none' : 'hover:bg-[#DFE4EA] hover:border hover:border-[#DFE4EA]'}`}
                                onClick={() => downloadFile()}
                                disabled={fileNameEditTextUrl !== '' ? false : true}
                            >
                                <FileDownloadIcon sx={{ fontSize: 23, color: '#1473A1', backgroundColor: '#ffffff', borderRadius: '4px', borderColor: '#DFE4EA' }} />
                            </button>
                        </div>
                    </div>
                </div>
            }

            {/* File */}
            {/* ถ้าเป็น create แสดงอันนี้ */}
            {
                (mode == 'create' || ((isShipper) && dataOpenDocument?.event_doc_status_id === 1)) &&
                <div className="grid grid-cols-2 gap-4 pt-3">
                    <div>
                        <label className={`${labelClass}`}>{`File`}</label>
                        <div className={`flex items-center col-span-2 ${fileName == "Invalid file type. Please upload a Excel file." || fileName == 'The file is larger than 10 MB.' ? 'border  border-[#ff0000] rounded-r-lg rounded-l-lg' : ''}`}>
                            <label className={`flex bg-[#00ADEF] text-white items-center justify-center font-light rounded-l-[6px] text-[16px] text-justify w-[40%] !h-[44px] px-2 cursor-pointer`}>
                                {`Choose File`}
                                {isUploading && (
                                    <span className="ml-2 w-[14px] h-[14px] border-[2px] border-white border-t-transparent rounded-full animate-spin"></span>
                                )}
                                <input
                                    id="url"
                                    type="file"
                                    className="hidden"
                                    {...register('file')}
                                    // accept=".xls, .xlsx"
                                    onChange={handleFileChange}
                                />
                            </label>

                            <div className="bg-white text-[#9CA3AF] text-sm w-[70%] !h-[44px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden flex items-center">
                                <span className="truncate">
                                    {fileName}
                                </span>
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
                        <div className={`w-full flex items-center justify-between text-[14px] text-red-500 `}>
                            {fileName == 'The file is larger than 10 MB.' && fileName}
                            {fileName == 'Invalid file type. Please upload a Excel file.' && fileName}
                        </div>
                    </div>
                </div>
            }


            {/* ส่วนของผู้ให้บริการ */}
            {
                isReadOnly && !isShipper &&
                <div className="grid grid-cols-2 gap-4 pt-3">
                    <span className="text-[#58585A] font-semibold"><span className="text-red-500">*</span>ส่วนของผู้ให้บริการ</span>
                    <div className="w-full col-span-2">
                        {/* <label className="mr-8 text-[#58585A]">
                            <input
                                type="radio"
                                {...register("event_doc_status_id", { required: mode == 'edit' ? true : false })}
                                value="accepted"
                                disabled={mode == 'view' ? true : false}
                                // checked={watch("status") === "1"}
                                // onChange={handleChange}
                                onChange={(e) => {
                                    setValue('event_doc_status_id', 'accepted')
                                    setIsTsoEdited(true)
                                }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            <span className="font-semibold text-[#464255]">{` รับ`}</span>{` ก๊าซไม่อยู่ในข้อกำหนด/เกณฑ์ที่กำหนด`}
                        </label>

                        <label className="mr-8 text-[#58585A]">
                            <input
                                type="radio"
                                {...register("event_doc_status_id", { required: mode == 'edit' ? true : false })}
                                value="rejected"
                                disabled={mode == 'view' ? true : false}
                                onChange={(e) => {
                                    setValue('event_doc_status_id', 'rejected')
                                    setIsTsoEdited(true)
                                }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            <span className="font-semibold text-[#464255]">{` ปฏิเสธ`}</span>{` ก๊าซไม่อยู่ในข้อกำหนด/เกณฑ์ที่กำหนด`}
                        </label>

                        <label className="mr-8 text-[#58585A]">
                            <input
                                type="radio"
                                {...register("event_doc_status_id", { required: mode == 'edit' ? true : false })}
                                value="acknowledge"
                                disabled={mode == 'view' ? true : false}
                                onChange={(e) => {
                                    setValue('event_doc_status_id', 'acknowledge')
                                    setIsTsoEdited(true)
                                }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            <span className="font-semibold text-[#464255]">{` รับทราบ`}</span>
                        </label> */}
                        
                        <div className="flex">
                            {mode == 'view' ?
                                <div className="flex items-center mr-8">
                                    <div className={`w-3 h-3 rounded-full border relative mt-[1px] mr-2 p-[1px] cursor-not-allowed ${mode == 'view' ? 'border-gray-400' : 'border-[#1473A1]'}`}>
                                        {watch('event_doc_status_id') == 'accepted' && (
                                            <div className="bg-[#1473A1] w-full h-full rounded-full"></div>
                                        )}
                                    </div>
                                    <div><span className="font-semibold text-[#464255]">{` รับ`}</span><span>{` ก๊าซไม่อยู่ในข้อกำหนด/เกณฑ์ที่กำหนด`}</span></div>
                                </div>
                                :
                                <label className="mr-8 text-[#58585A]">
                                    <input
                                        type="radio"
                                        {...register("event_doc_status_id", { required: mode == 'edit' ? true : false })}
                                        value="accepted"
                                        disabled={mode == 'view' ? true : false}
                                        // checked={watch("status") === "1"}
                                        // onChange={handleChange}
                                        onChange={(e) => {
                                            setValue('event_doc_status_id', 'accepted')
                                            setIsTsoEdited(true)
                                        }}
                                        className="mr-1 accent-[#1473A1]"
                                    />
                                    <span className="font-semibold text-[#464255]">{` รับ`}</span>{` ก๊าซไม่อยู่ในข้อกำหนด/เกณฑ์ที่กำหนด`}
                                </label>
                            }

                            {mode == 'view' ?
                                <div className="flex items-center mr-8">

                                    <div className={`w-3 h-3 rounded-full border relative mt-[1px] mr-2 p-[1px] cursor-not-allowed ${mode == 'view' ? 'border-gray-400' : 'border-[#1473A1]'}`}>
                                        {watch('event_doc_status_id') == 'rejected' && (
                                            <div className="bg-[#1473A1] w-full h-full rounded-full"></div>
                                        )}
                                    </div>
                                    <div><span className="font-semibold text-[#464255]">{` ปฏิเสธ`}</span><span>{` ก๊าซไม่อยู่ในข้อกำหนด/เกณฑ์ที่กำหนด`}</span></div>
                                </div>
                                :
                                <label className="mr-8 text-[#58585A]">
                                    <input
                                        type="radio"
                                        {...register("event_doc_status_id", { required: mode == 'edit' ? true : false })}
                                        value="rejected"
                                        disabled={mode == 'view' ? true : false}
                                        onChange={(e) => {
                                            setValue('event_doc_status_id', 'rejected')
                                            setIsTsoEdited(true)
                                        }}
                                        className="mr-1 accent-[#1473A1]"
                                    />
                                    <span className="font-semibold text-[#464255]">{` ปฏิเสธ`}</span>{` ก๊าซไม่อยู่ในข้อกำหนด/เกณฑ์ที่กำหนด`}
                                </label>
                            }

                            {mode == 'view' ?
                                <div className="flex items-center mr-8">

                                    <div className={`w-3 h-3 rounded-full border relative mt-[1px] mr-2 p-[1px] cursor-not-allowed ${mode == 'view' ? 'border-gray-400' : 'border-[#1473A1]'}`}>
                                        {watch('event_doc_status_id') == 'acknowledge' && (
                                            <div className="bg-[#1473A1] w-full h-full rounded-full"></div>
                                        )}
                                    </div>
                                    <div className="font-semibold text-[#464255]">{` รับทราบ`}</div>
                                </div>
                                :
                                <label className="mr-8 text-[#58585A]">
                                    <input
                                        type="radio"
                                        {...register("event_doc_status_id", { required: mode == 'edit' ? true : false })}
                                        value="acknowledge"
                                        disabled={mode == 'view' ? true : false}
                                        onChange={(e) => {
                                            setValue('event_doc_status_id', 'acknowledge')
                                            setIsTsoEdited(true)
                                        }}
                                        className="mr-1 accent-[#1473A1]"
                                    />
                                    <span className="font-semibold text-[#464255]">{` รับทราบ`}</span>
                                </label>
                            }
                        </div>
                    </div>
                </div >
            }


            {/* หมายเหตุ */}
            {
                isReadOnly && !isShipper && 
                <div className="grid grid-cols-2 gap-4 pt-3">
                    <div className="w-full col-span-2">
                        <label className={`${labelClass} !font-light`}>{`หมายเหตุ`}</label>
                        <TextField
                            {...register("input_note")}
                            value={watch("input_note") || ""}
                            label=""
                            multiline
                            onChange={(e) => {
                                if (e.target.value.length <= 500) {
                                    setValue("input_note", e.target.value);
                                }
                            }}
                            placeholder="ระบุหมายเหตุ"
                            disabled={mode == 'view' ? true : false}
                            rows={2}
                            sx={textFieldSx}
                            className={`${mode == 'view' && 'bg-[#EFECEC] rounded-[8px]'}`}
                            InputProps={inputPropsTextField}
                            fullWidth
                        />
                        <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                            <span className="text-[13px]">
                                {watch("input_note")?.length || 0} / 500
                            </span>
                        </div>
                    </div>
                </div>
            }

            <div className="flex justify-end pt-8">
                {mode !== 'view' && (
                    <button
                        type="submit"
                        className="w-[167px] h-[44px] font-semibold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        // disabled={false}
                        disabled={(isShipper && dataOpenDocument?.event_status_id === 1) ? false : (mode == 'edit' && isTsoEdited) || mode == 'create' ? false : true} // Edit : กรณีที่ยังไม่ใส่ข้อมูลอะไร ให้ disable ปุ่ม save ไว้ https://app.clickup.com/t/86eupj55d
                    >
                        {/* {mode === 'create' ? 'Submit' : 'Save'} */}
                        {mode === 'create' ? 'Save Darft' : (modeDraft ? "Submit" : 'Save')}
                    </button>
                )}
            </div>
        </form >

        {/* Confirm Save */}
        < ModalConfirmSave
            customWidth={dataPDFItem ? 700 : 490}
            open={modaConfirmSave}
            // open={true}
            handleClose={(e: any) => {
                setModaConfirmSave(false);
                if (e == "submit") {

                    // setIsLoading(true);
                    setTimeout(async () => {
                        await onSubmit(dataSubmit);
                    }, 100);

                    setTimeout(async () => {
                        setIsOpenDocument(false); // สร้างแล้วปิดหน้า create doc 
                    }, 1000);
                }
            }}
            // title="Confirm Save"
            title={mode == 'create' ? "Confirm Submission" : "Confirm Save"}
            description={
                mode == 'create' ?
                    <div className=" w-full">
                        {
                            dataPDFItem && 
                        <PdfDoc1 data={dataPDFItem} />
                        }
                        <div className="text-center">
                            {`Do you want to submit now ?`}
                        </div>
                    </div >
                    :
                    <div className=" w-full">
                        {
                            dataPDFItem &&
                        <PdfDoc1 data={dataPDFItem} />
                        }
                        <div className="text-center">
                            {`Do you want to save the changes ?`}
                        </div>
                    </div >
            }
            menuMode="confirm-save"
            btnmode="split"
            // btnsplit1="Save"
            btnsplit1={mode == 'create' ? "Submit" : "Save"}
            btnsplit2="Cancel"
            stat="none"
        />

    </>
    );
};

export default FormDocument1;