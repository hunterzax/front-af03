import { useEffect, useState } from "react";
import { cutUploadFileName, formatFormDate } from '@/utils/generalFormatter';
import dayjs from 'dayjs';
import { SubmitHandler, useForm } from "react-hook-form";
import ModalConfirmSave from "@/components/other/modalConfirmSave";
import { Checkbox, InputAdornment, ListItemText, ListSubheader, MenuItem, Select, TextField, Typography } from "@mui/material";
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DatePickaFormThai from "@/components/library/dateRang/dateSelectFormThai";
import { uploadFileService } from "@/utils/postService";
import SelectFormProps from "@/components/other/selectProps";
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { mock_emergency_type } from "../mockData";
import TableDocument39 from "../tableInDocument39";
import SearchIcon from '@mui/icons-material/Search';
import { PdfDoc309 } from "@/components/other/pdf_event/docEvent";

type FormExampleProps = {
    data?: Partial<any>;
    mode?: any;
    userDT?: any;
    shipperData?: any;
    emailGroupForEventData?: any;
    refDoc1Data?: any;
    setIsOpenDocument?: any;
    dataOpenDocument?: any;
    modeOpenDocument?: any;
    maiHedDocSamKaoLasted?: any;
    onSubmit: SubmitHandler<any>;
};

const inputClass = "text-[14px] block md:w-full p-2 ps-5 focus:!ps-5 hover:!ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"
const labelClass = "block mb-2 text-[14px] text-[#464255] font-semibold"
const textErrorClass = "text-red-500 text-[14px] "
const selectboxClass = "flex w-full h-[44px] p-1 ps-1 pe-2 !rounded-lg text-gray-900 block outline-none";

// key ใน DB ตามฟอร์ม
// "longdo_dict": "ส่วนบริการสัญญาระบบท่อส่งก๊าซ (Transmission Contracts & Regulatory Management Division โทร 025372000,35063)", //สำเนา
// "event_date": "2025-08-01", // วันที่ออกเอกสาร

// event_doc_emer_gas_tranmiss_id Int? //ระบบส่งก๊าซ
// event_doc_emer_gas_tranmiss_other String? // ระบบส่งก๊าซ other comment

// doc_39_input_date_time_of_the_incident String? // doc3.9 วัน/เวลาที่เกิดเหตุ
// doc_39_input_incident String? // doc3.9 สถานที่เกิดเหตุ
// doc_39_input_detail_incident String? // doc3.9 รายละเอียดของเหตุการณ์ และผลกระทบต่อระบบส่งก๊าซ
// doc_39_input_expected_day_time String? // doc3.9 คาดว่าจะแก้ไขปัญหาแล้วเสร็จในวันที่/เวลา

// "shipper":[62, 63],
// "email_event_for_shipper":[7],
// "cc_email": ["teerapong.songsan@gmail.com"]

const FormDocument39: React.FC<FormExampleProps> = ({ mode, data, onSubmit, setIsOpenDocument, dataOpenDocument, modeOpenDocument, userDT, shipperData, emailGroupForEventData, refDoc1Data, maiHedDocSamKaoLasted }) => {
    const [dataPDFItem, setdataPDFItem] = useState<any>(null)
    
    const { control, register, handleSubmit, setValue, reset, clearErrors, formState: { errors }, setError, watch, } = useForm<any>({ defaultValues: data, });
    const [tk, settk] = useState<boolean>(false); // ของคุ้นเคย
    const { onChange, ...restEmail } = register("email"); // register email
    const isShipper = (userDT?.account_manage?.[0]?.user_type_id === 3 || userDT?.account_manage?.[0]?.user_type_id === 4) ? true : false;

    const [optionShipper, setoptionShipper] = useState(shipperData)

    const [headerFormText, setHeaderFormText] = useState('');
    const [fileNameEditText, setFileNameEditText] = useState(''); // เอาไว้แสดงชื่อไฟล์ตอนเข้ามา view หรือ edit
    const [fileNameEditTextUrl, setFileNameEditUrl] = useState(''); // เอาไว้กดโหลดตอนเข้ามา view หรือ edit
    const [documentId, setDocumentId] = useState(''); // ID ของ Document 2

    const modeDraft = dataOpenDocument?.event_doc_status_id === 1 ? true : false
    // const isReadOnly = mode === "view" || mode == 'edit';
    const isReadOnly = modeDraft ? false : (mode === "view" || mode == 'edit');
    // userDT?.account_manage?.[0]?.user_type_id

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [dataTable, setDataTable] = useState<any>([])

    const [defaultShippersRender, setDefaultShippersRender] = useState<any[]>([]); // SELECT SHIPPER สำหรับ mode edit ที่ไม่ให้ลบของเก่า
    const [defaultShippersId, setDefaultShippersId] = useState<any[]>([]); // SELECT SHIPPER สำหรับ mode edit ที่ไม่ให้ลบของเก่า

    const [defaultEmailGroupRender, setDefaultEmailGroupRender] = useState<any[]>([]); // EMAIL GROUP สำหรับ mode edit ที่ไม่ให้ลบของเก่า
    const [defaultEmailGrouId, setDefaultEmailGrouId] = useState<any[]>([]); // EMAIL GROUP สำหรับ mode edit ที่ไม่ให้ลบของเก่า

    const [defaultCcEmailRender, setDefaultCcEmailRender] = useState<any[]>([]); // CC EMAIL สำหรับ mode edit ที่ไม่ให้ลบของเก่า

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
            color: isReadOnly ? "#464255" : "inherit",
        },
        disableUnderline: true,
    }

    {/* Confirm Save */ }
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()
    const [IsStatGenerate, setIsStatGenerate] = useState<boolean>(false)

    // #region DATA on load
    useEffect(() => {
        
        // event_doc_status.id == 6 | Generate
        // ถ้าเป็น Generate เปิด วัน/เวลาที่เกิดเหตุ สถานที่เกิดเหตุ รายละเอียดของเหตุการณ์ และผลกระทบต่อระบบส่งก๊าซ
        // Generated Doc3.9/Doc.4 : จะต้องสามารถแก้ไขได้ทุก field ยกเว้น Type กับ Zone https://app.clickup.com/t/86ev5f7a7
        if (modeOpenDocument == 'edit') {
            let is_stat_generate = dataOpenDocument?.event_doc_status?.id == 6 ? true : false
            setIsStatGenerate(is_stat_generate)
        }

        let text_header: any = 'สร้างเอกสารแจ้งเหตุการณ์ฉุกเฉิน/เหตุการณ์ความไม่สมดุลอย่างรุนแรง (Emergency Doc.1)'
        switch (modeOpenDocument) {
            case 'view':
                text_header = 'ดูเอกสารแจ้งเหตุการณ์ฉุกเฉิน/เหตุการณ์ความไม่สมดุลอย่างรุนแรง (Emergency Doc.1)'
                break;
            case 'edit':
                text_header = 'แก้ไขเอกสารแจ้งเหตุการณ์ฉุกเฉิน/เหตุการณ์ความไม่สมดุลอย่างรุนแรง (Emergency Doc.1)'
                break;
        }
        setHeaderFormText(text_header)
        // setDocumentId(dataOpenDocument?.document1?.id)
        setDocumentId(dataOpenDocument?.id)

        if (modeOpenDocument == 'edit' || modeOpenDocument == 'view') {
            
            setValue('event_date', dataOpenDocument?.event_date)
            setValue('longdo_dict', dataOpenDocument?.longdo_dict)

            // set ชื่อ shipper กลับที่เดิม
            const groupIds = dataOpenDocument?.event_runnumber_emer?.event_document_emer?.map((item: any) => item.group_id);
            const filteredShippers = shipperData?.filter((item: any) => groupIds?.includes(item.id));
            const defaultIds = filteredShippers?.map((s: any) => s.id); // เอา id 

             // set email group กลับที่เดิม
            const emailGroupForEventIds = dataOpenDocument?.event_document_emer_email_group_for_event?.map((item: any) => item.edit_email_group_for_event_id);
            const filter_email_group_for_event = emailGroupForEventData?.filter((item: any) => emailGroupForEventIds?.includes(item?.id))
            const defaultEmailGroupIds = filter_email_group_for_event?.map((s: any) => s.id); // เอา id 

            // set CC email กลับที่เดิม
            const ccEmail = dataOpenDocument?.event_document_emer_cc_email?.map((item: any) => item.email);
            // modeDraft
            // if(modeDraft){

            //     setSelectedShippersRender(filteredShippers)
            //     setSelectedShippers(defaultIds)
            // }else{

            //     setDefaultShippersRender(filteredShippers); // ลบไม่ได้
            //     setDefaultShippersId(defaultIds) // ลบไม่ได้
            // }

            if(modeDraft){
                setSelectedShippersRender(filteredShippers)
                setSelectedShippers(filteredShippers?.map((e:any) => e?.id));

                setSelectedEmailGroupRender(filter_email_group_for_event)
                setSelectedEmailGroup(defaultEmailGroupIds)
                
                setValue("email_arr", ccEmail)
                setEmailGroup(ccEmail)

            }else{

                setDefaultShippersRender(filteredShippers); // ลบไม่ได้
                setDefaultShippersId(defaultIds) // ลบไม่ได้
                
                setDefaultEmailGroupRender(filter_email_group_for_event) // ลบไม่ได้
                setDefaultEmailGrouId(defaultEmailGroupIds) // ลบไม่ได้
                
                setDefaultCcEmailRender(ccEmail)  // ลบไม่ได้
            }
           


            // ข้อมูลที่ shipper กด accept หรือ reject ในตารางข้างล่าง
            // setDataTable(dataOpenDocument?.event_runnumber_emer?.event_document_emer)
            // setDataTable(dataOpenDocument?.history_table_inside)
            const filter_only_own_doc = dataOpenDocument?.history_table_inside?.filter((item:any) => item?.event_doc_master_id == 309) // 3.9 == 309, 4 == 41
            // setDataTable(modeOpenDocument == 'edit' ? dataOpenDocument?.event_runnumber_emer?.event_document_emer : filter_only_own_doc)
            setDataTable(modeOpenDocument == 'edit' ? dataOpenDocument?.event_runnumber_emer?.event_document_emer : filter_only_own_doc?.length > 0 ? filter_only_own_doc : dataOpenDocument?.event_runnumber_emer?.event_document_emer)

            // SET ข้อมูลลงฟอร์มนะ
            setValue('doc_39_input_date_time_of_the_incident', dataOpenDocument?.doc_39_input_date_time_of_the_incident) // doc39 วัน/เวลาที่เกิดเหตุ
            setValue('doc_39_input_incident', dataOpenDocument?.doc_39_input_incident) // doc39 สถานที่เกิดเหตุ
            setValue('doc_39_input_detail_incident', dataOpenDocument?.doc_39_input_detail_incident) // doc39 รายละเอียดของเหตุการณ์ และผลกระทบต่อระบบส่งก๊าซ
            setValue('doc_39_input_expected_day_time', dataOpenDocument?.doc_39_input_expected_day_time)  // doc39 คาดว่าจะแก้ไขปัญหาแล้วเสร็จในวันที่/เวลา
            setValue('event_doc_emer_type_id', dataOpenDocument?.event_runnumber_emer?.event_doc_emer_type_id)  // doc39 ประเภท
            setValue('event_doc_emer_gas_tranmiss_id', dataOpenDocument?.event_runnumber_emer?.event_doc_emer_gas_tranmiss_id) // doc39 ระบบส่งก๊าซ 
            setValue('event_doc_emer_gas_tranmiss_other', dataOpenDocument?.event_runnumber_emer?.event_doc_emer_gas_tranmiss_other) // doc39 ระบบส่งก๊าซ อื่น ๆ

            setValue('doc_39_input_shipper_operation', dataOpenDocument?.doc_39_input_shipper_operation) // doc39 การดำเนินการ shipper
            setValue('doc_39_input_shipper_note', dataOpenDocument?.doc_39_input_shipper_note) // doc39 หมายเหตุ shipper
            setValue('doc_39_input_note', dataOpenDocument?.doc_39_input_note) // doc39 หมายเหตุ shipper

            setValue('event_doc_status_id', dataOpenDocument?.event_doc_status_id == 3 ? 'accepted' : dataOpenDocument?.event_doc_status_id == 4 ? 'rejected' : dataOpenDocument?.event_doc_status_id == 5 ? 'acknowledge' : '')

            setFileNameEditText(dataOpenDocument?.event_document_emer_file?.length > 0 ? cutUploadFileName(dataOpenDocument?.event_document_emer_file[0]?.url) : '')
            setFileNameEditUrl(dataOpenDocument?.event_document_emer_file?.length > 0 ? dataOpenDocument?.event_document_emer_file[0]?.url : '')
        }

        // New : Field หมายเหตุ ของทุก Doc ต้อง Default ข้อความตามเอกสาร (ในครั้งแรก) มาให้อัตโนมัติ และเมื่อมีการแก้ไข ให้ยึดตามล่าสุดเป็น Default ในครั้งถัดไป https://app.clickup.com/t/86eum0nwd
        if (modeOpenDocument == 'create') {
            setValue('doc_39_input_note', maiHedDocSamKaoLasted)  // หมายเหตุ
        }

        //option
        setoptionShipper(shipperData)
    }, [mode, dataOpenDocument, shipperData, emailGroupForEventData])


    useEffect(() => {
      if(mode === "create"){
        setValue("longdo_dict", `ส่วนบริหารสัญญาระบบท่อส่งก๊าซ (บส.กตต.)`)
      }
    }, [mode])
    
    // #region Confirm Save
    {/* Confirm Save */ }
    const handleSaveConfirm = async (data?: any) => {
        if (mode == 'create') {
            const tso_create = {
                // "longdo_dict": data?.longdo_dict, //สำเนา
                "longdo_dict": watch('longdo_dict'), //สำเนา
                "event_date": dayjs(watch('event_date')).format("YYYY-MM-DD"), // วันที่ออกเอกสาร

                "event_doc_emer_gas_tranmiss_id": watch("event_doc_emer_gas_tranmiss_id") ? parseInt(watch("event_doc_emer_gas_tranmiss_id")) : null, // พวก onshore
                "event_doc_emer_gas_tranmiss_other": watch("event_doc_emer_gas_tranmiss_other") ? watch("event_doc_emer_gas_tranmiss_other") : null, // พวก onshore
                "doc_39_input_date_time_of_the_incident": data?.doc_39_input_date_time_of_the_incident,
                "doc_39_input_incident": data?.doc_39_input_incident,
                "doc_39_input_detail_incident": data?.doc_39_input_detail_incident,
                "doc_39_input_expected_day_time": data?.doc_39_input_expected_day_time,
                // "doc_39_input_note": "กรณีพื้นที่เกิดเหตุเป็นพื้นที่ให้บริการตาม TSO Code จะอ้างอิงการสั่งการจาก TSO Code ข้อที่ 8.10.1 เรื่องขั้นตอนการปฏิบัติงานในกรณีเหตุการณ์ไม่สมดุลอย่างรุนแรง (Difficult Day) และ 8.10.2 ขั้นตอนการดำเนินการในกรณีภาวะฉุกเฉิน ", // fix ไว้
                "doc_39_input_note": data?.doc_39_input_note,
                "event_doc_emer_type_id": data?.event_doc_emer_type_id,

                "file": fileUrl !== '' ? [fileUrl] : [],
                "shipper": selectedShippers,
                "email_event_for_shipper": selectedEmailGroup,
                "cc_email": emailGroup
            }
            setdataPDFItem({userDT:userDT, dataOpenDocument: dataOpenDocument, data:[{item:{...data, ...tso_create,}, data: data}], shipperData: shipperData})

            setDataSubmit(tso_create)
            setModaConfirmSave(true)

        } else {

            let data_post_na: any = {}
            if (!isShipper) {
                // mode edit tso
                data_post_na = {
                    "generate": dataOpenDocument?.event_doc_status_id == 6 ? true : false, // true gen , false default
                    "event_date": watch('event_date'),
                    "document_id": documentId, // เอาไว้ใช้เส้น POST master/event/offspec-gas/doc2/edit/${id}
                    "file": fileUrl !== '' ? [fileUrl] : [fileNameEditTextUrl], // ส่งมาแค่ 1 ถ้า หน้าบ้านอัพโหลด ส่าง url ใหม่ ถ้าไม่อัพส่ง url เก่ามา
                    "shipper": Array.from(new Set([
                        ...selectedShippers,
                        ...defaultShippersId,
                    ])),
                    "email_event_for_shipper": Array.from(new Set([
                        ...selectedEmailGroup,
                        ...defaultEmailGrouId,
                    ])),
                    "cc_email": Array.from(new Set([
                        ...emailGroup,
                        ...defaultCcEmailRender,
                    ])),
                    "longdo_dict": watch('longdo_dict'), // สำเนา
                    // ------------------- V เพิ่มให้รองรับ generate
                    "doc_39_input_date_time_of_the_incident": watch('doc_39_input_date_time_of_the_incident'), //วัน/เวลาที่เกิดเหตุ
                    "doc_39_input_incident": watch('doc_39_input_incident'), //สถานที่เกิดเหตุ
                    "doc_39_input_detail_incident": watch('doc_39_input_detail_incident'), //รายละเอียดของเหตุการณ์ และผลกระทบต่อระบบส่งก๊าซ
                    "doc_39_input_expected_day_time": watch('doc_39_input_expected_day_time'), //คาดว่าจะแก้ไขปัญหาแล้วเสร็จในวันที่/เวลา
                    "doc_39_input_note": watch('doc_39_input_note'), //หมายเหตุ
                    "event_doc_emer_type_id": watch('event_doc_emer_type_id'),
                    "event_doc_emer_gas_tranmiss_id": watch("event_doc_emer_gas_tranmiss_id") ? parseInt(watch("event_doc_emer_gas_tranmiss_id")) : null, // พวก onshore
                    "event_doc_emer_gas_tranmiss_other": watch("event_doc_emer_gas_tranmiss_other") ? watch("event_doc_emer_gas_tranmiss_other") : null, // พวก onshore
                }
            } else {
                // mode edit shipper
                let stat_shipper_edit: any = 3
                switch (data?.event_doc_status_id) {
                    case 'accepted':
                        stat_shipper_edit = 3
                        break;
                    case 'rejected':
                        stat_shipper_edit = 4
                        break;
                    case 'acknowledge':
                        stat_shipper_edit = 5 // 5 Acknowledge
                        break;
                }
                data_post_na = {
                    "document_id": documentId, // เอาไว้ใช้เส้น POST master/event/offspec-gas/doc2/edit/${id}
                    "event_doc_status_id": 5, // 3 Accept, 4 Reject, 5 Acknowledge
                    "doc_39_input_shipper_operation": data?.doc_39_input_shipper_operation, //การดำเนินการ
                    "doc_39_input_shipper_note": data?.doc_39_input_shipper_note, //หมายเหตุ
                }
            }
            setdataPDFItem({userDT:userDT, dataOpenDocument: dataOpenDocument, data:[{item:{...data, ...data_post_na,}, data: data}], shipperData: shipperData})
            setDataSubmit(data_post_na)
            setModaConfirmSave(true)
        }
    }

    // #region UPLOAD FILE
    // ############# UPLOAD FILE #############
    const [fileName, setFileName] = useState('Maximum File 10 MB');
    const [fileUpload, setFileUpload] = useState<any>();
    const [fileUrl, setFileUrl] = useState<any>('');
    const [isUploading, setIsUploading] = useState(false);

    //#region SAVEBTN
    const [trickerEdit, settrickerEdit] = useState<boolean>(mode == 'edit' ? true : false)

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

    // #region DOWNLOAD FILE
    // ############# DOWNLOAD FILE #############
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

    // #region SHIPPER SELECT
    // ############# SHIPPER SELECT #############
    const [selectedShippers, setSelectedShippers] = useState<string[]>([]);
    const [selectedShippersRender, setSelectedShippersRender] = useState<any[]>([]);

    const handleSelectChange = (event: any) => {
        const value = event.target.value;

        if (value.includes("all")) {
            // setSelectedShippers(selectedShippers.length === shipperData.length ? [] : shipperData.map((item: any) => item.id));
            // setSelectedShippersRender(selectedShippers.length === shipperData.length ? [] : shipperData.map((item: any) => item));
            // setValue("shipper_id", selectedShippers.length === shipperData.length ? [] : shipperData.map((item: any) => item.id));

            // เอาอันที่มีอยู่แล้วออกจาก option 
            setSelectedShippers(selectedShippers.length === shipperData.length ? [] : shipperData?.filter((item: any) => !defaultShippersId?.includes(item.id)).map((item: any) => item.id));
            setSelectedShippersRender(selectedShippers.length === shipperData.length ? [] : shipperData?.filter((item: any) => !defaultShippersId?.includes(item.id)).map((item: any) => item));
            setValue("shipper_id", selectedShippers.length === shipperData.length ? [] : shipperData?.filter((item: any) => !defaultShippersId?.includes(item.id)).map((item: any) => item.id));
        } else {
            setSelectedShippers(value);
            setValue("shipper_id", value);

            const filter_shipper = shipperData?.filter((item: any) => value.includes(item?.id))
            setSelectedShippersRender(filter_shipper)
        }
        clearErrors('shipper_id');
        handletrickerEdit();
    };

    //#region RENDER-SAVEBTN
    const handletrickerEdit = () => {
        if (trickerEdit == true && mode == 'edit') {
            settrickerEdit(false);
        }
    }

    const removeShipper = (idToRemove: number) => {
        setSelectedShippers((prevGroup: any) => prevGroup.filter((data: any, index: number) => data !== idToRemove));
        setSelectedShippersRender((prevGroup: any) => prevGroup.filter((data: any, index: number) => data?.id !== idToRemove));
    };

    // #region EMAIL GROUP SELECT
    // ############# EMAIL GROUP SELECT #############
    const [selectedEmailGroup, setSelectedEmailGroup] = useState<string[]>([]);
    const [selectedEmailGroupRender, setSelectedEmailGroupRender] = useState<any[]>([]);

    const handleSelectEmailGroup = (event: any) => {
        const value = event.target.value;

        if (value.includes("all")) {
            setSelectedEmailGroup(selectedEmailGroup.length === emailGroupForEventData.length ? [] : emailGroupForEventData.map((item: any) => item.id));
            setSelectedEmailGroupRender(selectedEmailGroup.length === emailGroupForEventData.length ? [] : emailGroupForEventData.map((item: any) => item));
            setValue("shipper_id", selectedEmailGroup.length === emailGroupForEventData.length ? [] : emailGroupForEventData.map((item: any) => item.id));
        } else {
            setSelectedEmailGroup(value);
            setValue("shipper_id", value);

            const filter_shipper = emailGroupForEventData?.filter((item: any) => value.includes(item?.id))
            setSelectedEmailGroupRender(filter_shipper)
        }
        clearErrors('shipper_id');
        handletrickerEdit();
    };

    const removeEmailGroup = (idToRemove: number) => {
        setSelectedEmailGroup((prevGroup: any) => prevGroup.filter((data: any, index: number) => data !== idToRemove));
        setSelectedEmailGroupRender((prevGroup: any) => prevGroup.filter((data: any, index: number) => data?.id !== idToRemove));
    };

    // #region CC MAIL
    // ############# CC MAIL #############
    const [emailGroup, setEmailGroup] = useState<any>([]);
    const [alertDupMail, setAlertDupMail] = useState<any>(false);
    const addEmailGroup = (data: any) => {
        setEmailGroup((prev: any): any => [
            ...prev,
            data
        ]);

        setValue("email", "");
        setValue("email_arr", [...emailGroup, data]);
    };

    const removeEmail = (indexToRemove: number) => {
        setEmailGroup((prevGroup: any) => prevGroup.filter((_: any, index: number) => index !== indexToRemove));

        const currentEmails = watch("email_arr");
        const updatedEmails = currentEmails.filter((_: any, index: number) => index !== indexToRemove);
        setValue("email_arr", updatedEmails);
    };

    return (<>
        <span className="text-[20px] text-[#58585A] font-semibold">{headerFormText}</span>
        <form
            onSubmit={handleSubmit(handleSaveConfirm)}
            className='bg-white w-full max-w'
        >

            <div className="py-2 text-[14px] font-semibold text-[#58585A]">
                {`ส่วนของผู้ให้บริการ`}
            </div>


            <div className="flex gap-4 pt-4">

                <div className="pb-2 w-[200px]">
                    <label className={labelClass}>
                        <span className="text-red-500">*</span>
                        {`วันที่ออกเอกสาร`}
                    </label>
                    <DatePickaFormThai
                        {...register('event_date', { required: "เลือกวันที่" })}
                        // readOnly={isReadOnly}
                        // readOnly={watch('ref_doc_1') || mode == 'view' ? true : false} // ปิดเพราะตอนเลือก ref doc 
                        readOnly={mode == 'view' || mode == 'edit' ? true : false}
                        placeHolder="เลือกวันที่"
                        // mode={watch('ref_doc_1') ? 'view' : 'create'}
                        mode={mode}
                        valueShow={watch("event_date") ? dayjs(watch("event_date")).format("DD/MM/YYYY") : undefined}
                        // min={new Date()}
                        allowClear
                        isError={errors.event_date && !watch("event_date") ? true : false}
                        onChange={(e: any) => { setValue('event_date', formatFormDate(e)), e == undefined && setValue('event_date', null, { shouldValidate: true, shouldDirty: true }); }}
                    />
                    {errors.event_date && !watch("event_date") && <p className={`${textErrorClass}`}>{'เลือกวันที่'}</p>}
                </div>

                <div className="w-[350px]">
                    <label htmlFor="event_nember" className={labelClass}>
                        <span className="text-red-500">*</span>
                        {`ประเภท`}
                    </label>

                    <SelectFormProps
                        id={'event_doc_emer_type_id'}
                        register={register("event_doc_emer_type_id", { required: true })}
                        disabled={mode == 'view' || mode == 'edit' ? true : false}
                        valueWatch={watch("event_doc_emer_type_id") || ""}
                        handleChange={(e) => {
                            setValue("event_doc_emer_type_id", e.target.value);

                            clearErrors('event_doc_emer_type_id')
                            if (errors?.event_doc_emer_type_id) { clearErrors('event_doc_emer_type_id') }
                        }}
                        errors={errors?.event_doc_emer_type_id}
                        errorsText={'Select Type'}
                        options={mock_emergency_type}
                        optionsKey={'id'}
                        optionsValue={'id'}
                        optionsText={'name'}
                        optionsResult={'name'}
                        placeholder={'Select Type'}
                        pathFilter={'name'}
                    />
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
                        // disabled={isReadOnly}
                        disabled={IsStatGenerate ? false : isReadOnly}
                        rows={2}
                        sx={textFieldSx}
                        // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        className={`${(isReadOnly && !IsStatGenerate) && 'bg-[#F1F1F1] rounded-[8px]'}`}

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


            {/* ระบบส่งก๊าซ */}
            <div className="flex flex-wrap flex-auto gap-4 pt-2 pb-2">
                <div className="w-full">
                    <label className={`${labelClass}`}>
                        <span className="text-red-500">*</span>
                        {`ระบบส่งก๊าซ`}
                    </label>

                    <div className="w-full">
                        <div className="gap-2 w-full h-[44px] flex items-center ">
                            <label className="w-[180px] text-[#58585A]">
                                <input
                                    type="radio"
                                    {...register("event_doc_emer_gas_tranmiss_id", { required: !watch("event_doc_emer_gas_tranmiss_id") ? true : false })}
                                    value="1"
                                    disabled={mode === "view" || mode == 'edit'}
                                    checked={watch("event_doc_emer_gas_tranmiss_id") == 1}
                                    // onChange={handleChange}
                                    // onChange={(e) => { handleChange(e, 'everyday') }}
                                    className="mr-1 accent-[#1473A1]"
                                />
                                {`Onshore East`}
                            </label>

                            <label className="w-[180px] text-[#58585A]">
                                <input
                                    type="radio"
                                    {...register("event_doc_emer_gas_tranmiss_id", { required: !watch("event_doc_emer_gas_tranmiss_id") ? true : false })}
                                    value="2"
                                    disabled={mode === "view" || mode == 'edit'}
                                    checked={watch("event_doc_emer_gas_tranmiss_id") == 2}
                                    // onChange={handleChange}
                                    // onChange={(e) => { handleChange(e, 'everyday') }}
                                    className="mr-1 accent-[#1473A1]"
                                />
                                {`Onshore West`}
                            </label>

                            <label className="w-[250px] text-[#58585A]">
                                <input
                                    type="radio"
                                    {...register("event_doc_emer_gas_tranmiss_id", { required: !watch("event_doc_emer_gas_tranmiss_id") ? true : false })}
                                    value="3"
                                    disabled={mode === "view" || mode == 'edit'}
                                    checked={watch("event_doc_emer_gas_tranmiss_id") == 3}
                                    // onChange={handleChange}
                                    // onChange={(e) => { handleChange(e, 'everyday') }}
                                    className="mr-1 accent-[#1473A1]"
                                />
                                {`Onshore East - West`}
                            </label>

                            <label className="w-full flex items-center gap-2 text-[#58585A] mr-8">
                                <input
                                    type="radio"
                                    {...register("event_doc_emer_gas_tranmiss_id", { required: !watch("event_doc_emer_gas_tranmiss_id") ? true : false })}
                                    value="4"
                                    disabled={mode === "view" || mode == 'edit'}
                                    checked={watch("event_doc_emer_gas_tranmiss_id") == 4}
                                    // onChange={handleChange}
                                    // onChange={(e) => { handleChange(e, 'everyday') }}
                                    className="mr-1 accent-[#1473A1]"
                                />
                                {`Other`}

                                {
                                    watch('event_doc_emer_gas_tranmiss_id') == 4 && <input
                                        type="text"
                                        disabled={(watch('event_doc_emer_gas_tranmiss_id') == 4 ? false : true) || mode == 'view' || mode == 'edit'} // ถ้าเลือก radio เป็น other ค่อยเปิด
                                        {...register('event_doc_emer_gas_tranmiss_other', { required: "Enter other" })}
                                        value={watch('event_doc_emer_gas_tranmiss_other')}
                                        // onKeyDown={handleKeyPress} // เอาไว้ใช้ตอนกด enter
                                        onChange={(e) => setValue('event_doc_emer_gas_tranmiss_other', e.target.value)}
                                        className={`text-[14px] block md:w-full ps-5 focus:!ps-5 hover:!ps-5 pe-10 h-[34px] border-b-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF] ${errors.event_doc_emer_gas_tranmiss_other && 'border-red-500'}`}
                                    />
                                }

                            </label>
                        </div>
                        {errors?.event_doc_emer_gas_tranmiss_id && (<p className="text-red-500 text-sm w-full">{`เลือกระบบส่งก๊าซ`}</p>)}
                    </div>
                </div>
            </div>

            {/* วัน/เวลาที่เกิดเหตุ */}
            <div className="grid grid-cols-2 gap-4 pt-3">
                <div className="w-full">
                    <label className={`${labelClass}`}>
                        <span className="text-red-500">*</span>
                        {`วัน/เวลาที่เกิดเหตุ`}
                    </label>
                    <TextField
                        {...register("doc_39_input_date_time_of_the_incident", { required: true })}
                        value={watch("doc_39_input_date_time_of_the_incident") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            clearErrors('doc_39_input_date_time_of_the_incident')
                            handletrickerEdit();
                            if (e.target.value.length <= 255) {
                                setValue("doc_39_input_date_time_of_the_incident", e.target.value);
                            }
                        }}
                        placeholder="ระบุรายละเอียด"
                        // disabled={isReadOnly}
                        disabled={IsStatGenerate ? false : isReadOnly}
                        rows={2}
                        sx={{
                            ...textFieldSx,
                            '.MuiOutlinedInput-notchedOutline': {
                                borderColor: errors.doc_39_input_date_time_of_the_incident && !watch('doc_39_input_date_time_of_the_incident') ? '#FF0000' : '#DFE4EA',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: errors.doc_39_input_date_time_of_the_incident && !watch("doc_39_input_date_time_of_the_incident") ? "#FF0000" : '#DFE4EA !important',
                            },
                        }}
                        // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        className={`${(isReadOnly && !IsStatGenerate) && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />

                    <div className="flex justify-between text-sm text-[#B6B6B6] mt-1">
                        <div>
                            {errors.doc_39_input_date_time_of_the_incident && (<p className={`${textErrorClass} inline`}>{'ระบุวัน/เวลาที่เกิดเหตุ'}</p>)}
                        </div>
                        <span className="text-[13px]">
                            {watch("doc_39_input_date_time_of_the_incident")?.length || 0} / 255
                        </span>
                    </div>


                </div>








                {/* สถานที่เกิดเหตุ */}
                <div className="w-full">
                    <label className={labelClass}>
                        <span className="text-red-500">*</span>
                        {`สถานที่เกิดเหตุ`}
                    </label>
                    <TextField
                        {...register("doc_39_input_incident", { required: true })}
                        value={watch("doc_39_input_incident") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            clearErrors('doc_39_input_incident')
                            handletrickerEdit();
                            if (e.target.value.length <= 255) {
                                setValue("doc_39_input_incident", e.target.value);
                            }
                        }}
                        placeholder="ระบุรายละเอียด"
                        // disabled={isReadOnly}
                        disabled={IsStatGenerate ? false : isReadOnly}
                        rows={2}
                        sx={{
                            ...textFieldSx,
                            '.MuiOutlinedInput-notchedOutline': {
                                borderColor: errors.doc_39_input_incident && !watch('doc_39_input_incident') ? '#FF0000' : '#DFE4EA',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: errors.doc_39_input_incident && !watch("doc_39_input_incident") ? "#FF0000" : '#DFE4EA !important',
                            },
                        }}
                        // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        className={`${(isReadOnly && !IsStatGenerate) && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />

                    <div className="flex justify-between text-sm text-[#B6B6B6] mt-1">
                        <div>
                            {errors.doc_39_input_incident && (<p className={`${textErrorClass} inline`}>{'ระบุสถานที่เกิดเหตุ'}</p>)}
                        </div>
                        <span className="text-[13px]">
                            {watch("doc_39_input_incident")?.length || 0} / 255
                        </span>
                    </div>
                </div>
            </div>

            {/* รายละเอียดของเหตุการณ์ และผลกระทบต่อระบบส่งก๊าซ */}
            <div className="grid grid-cols-2 gap-4 pt-3">
                <div className="w-full col-span-2">
                    <label className={labelClass}>
                        <span className="text-red-500">*</span>
                        {`รายละเอียดของเหตุการณ์ และผลกระทบต่อระบบส่งก๊าซ`}
                    </label>
                    <TextField
                        {...register("doc_39_input_detail_incident", { required: true })}
                        value={watch("doc_39_input_detail_incident") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            clearErrors('doc_39_input_detail_incident')
                            handletrickerEdit();
                            if (e.target.value.length <= 500) {
                                setValue("doc_39_input_detail_incident", e.target.value);
                            }
                        }}
                        placeholder="ระบุรายละเอียด"
                        // disabled={isReadOnly}
                        disabled={IsStatGenerate ? false : isReadOnly}
                        rows={2}
                        sx={{
                            ...textFieldSx,
                            '.MuiOutlinedInput-notchedOutline': {
                                borderColor: errors.doc_39_input_detail_incident && !watch('doc_39_input_detail_incident') ? '#FF0000' : '#DFE4EA',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: errors.doc_39_input_detail_incident && !watch("doc_39_input_detail_incident") ? "#FF0000" : '#DFE4EA !important',
                            },
                        }}
                        // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        className={`${(isReadOnly && !IsStatGenerate) && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-between text-sm text-[#B6B6B6] mt-1">
                        <div>
                            {errors.doc_39_input_detail_incident && (<p className={`${textErrorClass} inline`}>{'ระบุรายละเอียดของเหตุการณ์ และผลกระทบต่อระบบส่งก๊าซ'}</p>)}
                        </div>
                        <span className="text-[13px]">
                            {watch("doc_39_input_detail_incident")?.length || 0} / 255
                        </span>
                    </div>
                </div>
            </div>

            {/* คาดว่าจะแก้ไขปัญหาแล้วเสร็จในวันที่/เวลา: */}
            <div className="grid grid-cols-2 gap-4 pt-3">
                <div className="w-full col-span-2">
                    <label className={labelClass}>{`คาดว่าจะแก้ไขปัญหาแล้วเสร็จในวันที่/เวลา:`}</label>
                    <TextField
                        {...register("doc_39_input_expected_day_time")}
                        value={watch("doc_39_input_expected_day_time") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 255) {
                                setValue("doc_39_input_expected_day_time", e.target.value);
                            }
                        }}
                        placeholder="ระบุรายละเอียด"
                        // disabled={isReadOnly}
                        disabled={IsStatGenerate ? false : isReadOnly}
                        rows={2}
                        sx={textFieldSx}
                        // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        className={`${(isReadOnly && !IsStatGenerate) && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">{watch("doc_39_input_expected_day_time")?.length || 0} / 255</span>
                    </div>
                </div>

                <div className="w-full col-span-2">
                    <label className={labelClass}>{`หมายเหตุ`}</label>
                    <TextField
                        {...register("doc_39_input_note")}
                        value={watch("doc_39_input_note") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 255) {
                                setValue("doc_39_input_note", e.target.value);
                            }
                        }}
                        placeholder="ระบุหมายเหตุ"
                        // disabled={isReadOnly}
                        disabled={IsStatGenerate ? false : isReadOnly}
                        rows={2}
                        sx={textFieldSx}
                        // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        className={`${(isReadOnly && !IsStatGenerate) && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">{watch("doc_39_input_note")?.length || 0} / 255</span>
                    </div>
                </div>
            </div>


            {/* File */}
            {/* ถ้าเป็น edit view แสดงอันนี้ */}
            {
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
                !isShipper && mode == 'create' &&
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
                        {/* {errors?.file && (<p className="text-red-500 text-sm w-full">{`${errors?.file?.message}`}</p>)} */}
                        <div className={`w-full flex items-center justify-between text-[14px] text-red-500 `}>
                            {fileName == 'The file is larger than 10 MB.' && fileName}
                            {fileName == 'Invalid file type. Please upload a Excel file.' && fileName}
                        </div>
                    </div>
                </div>
            }


            {/* เลือก shipper && Email Group */}
            {
                !isShipper && (mode == 'create' || mode == 'edit') &&
                <div className="grid grid-cols-2 gap-4 pt-5">
                    <div className="w-full ">
                        <div className='pb-2'>
                            <span className="text-[#464255] font-semibold pb-2 mb-2">Shipper</span>
                        </div>
                        <Select
                            id="shipper_id"
                            multiple
                            IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                            {...register("shipper_id", { required: false })}
                            disabled={mode == 'view' ? true : false}
                            value={selectedShippers}
                            onChange={handleSelectChange}
                            className={`${selectboxClass} ${(mode == 'view') && "!bg-[#EFECEC]"} ${errors.shipper_id && "border-red-500"}`}
                            sx={{
                                ".MuiOutlinedInput-notchedOutline": { borderColor: errors.shipper_id && selectedShippers.length === 0 ? "#FF0000" : "#DFE4EA" },
                                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#d2d4d8" },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#d2d4d8" },
                                ".MuiSelect-multiple": {
                                    fontSize: 14 // ขนาดของ tag ที่แสดงรายการที่เลือก
                                },
                                ".MuiSelect-select": {
                                    fontSize: 14 // สำคัญที่สุด – ขนาดข้อความหลักของ Select
                                },
                                fontSize: 14
                            }}
                            displayEmpty
                            renderValue={(selected) => {
                                if (selected.length === 0) {
                                    return <Typography color="#9CA3AF" fontSize={14}>Select Shipper Name</Typography>;
                                }
                                // return selected.map((id) => shipperData.find((item: any) => item.id === id)?.name).join(", ");
                                const shipper_data = shipperData?.filter((item: any) => !defaultShippersId?.includes(item.id))
                                return (
                                    <span className={`pl-[10px] text-[14px]`}>
                                        {shipper_data?.length == selectedShippers?.length ? `Select All` : selected.map((id) => shipperData?.filter((item: any) => !defaultShippersId?.includes(item.id)).find((item: any) => item.id === id)?.name).join(", ")}
                                    </span>
                                );
                            }}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 48 * 4.5 + 8, // Item height * 4.5 + padding
                                        // width: 250, // Adjust width as needed
                                    },
                                },
                                autoFocus: false,
                                disableAutoFocusItem: true,
                            }}
                            onClose={() => { setTimeout(() => { setoptionShipper(shipperData) }, 200) }}
                        >
                            {shipperData?.length >= 5 &&
                                <ListSubheader style={{ width: '100%' }}>
                                    <TextField
                                        size="small"
                                        // Autofocus on textfield
                                        autoFocus={true}
                                        focused
                                        placeholder="Type to search..."
                                        // fullWidth
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon sx={{ fontSize: 16 }} />
                                                </InputAdornment>
                                            ),
                                            sx: {
                                                fontSize: 14 // <-- ขนาดตัวอักษรนะจ้ะ
                                            }
                                        }}
                                        className='inputSearchk'
                                        style={{ width: '100%', height: 40 }}
                                        onChange={(e) => {
                                            const loadData: any = shipperData;
                                            if (e?.target?.value) {
                                                const queryLower = e?.target?.value.toLowerCase().replace(/\s+/g, '')?.trim();
                                                let newItem: any = shipperData?.filter((item: any) => item?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower));

                                                setoptionShipper(() => newItem);
                                                settk(!tk);
                                            } else {
                                                setoptionShipper(loadData);
                                                settk(!tk);
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key !== "Escape") {
                                                e.stopPropagation();
                                            }
                                        }}
                                    />
                                </ListSubheader>
                            }

                            {!isShipper && (
                                <MenuItem value="all">
                                    <Checkbox checked={selectedShippers.length === optionShipper.length && optionShipper.length > 0} />
                                    <ListItemText
                                        primary="Select All"
                                        // sx={{ fontWeight: 'bold' }}
                                        primaryTypographyProps={{ sx: { fontWeight: 'bold', fontSize: "14px" } }}
                                    />
                                </MenuItem>
                            )}

                            {optionShipper?.length > 0 && optionShipper
                                ?.filter((item: any) => !defaultShippersId?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                ?.sort((a: any, b: any) => (a?.name || "").localeCompare(b?.name || "")) // แล้วค่อย sort
                                ?.map((item: any) => (
                                    <MenuItem
                                        key={item.id}
                                        value={item.id}
                                        disabled={false}
                                    >
                                        <Checkbox checked={selectedShippers?.includes(item.id)} />
                                        <ListItemText primary={item.name} primaryTypographyProps={{ fontSize: 14 }} />
                                    </MenuItem>
                                ))
                            }
                        </Select>

                        {/* <div className="flex flex-wrap gap-3 pt-4 w-full h-[100px] max-h-[120px] overflow-y-auto"> */}
                        <div className="flex flex-wrap gap-2 pt-2 mt-2 w-full max-h-[120px] overflow-y-auto">

                            {/* ลบไม่ได้เว่ย */}
                            {defaultShippersRender?.map((item: any, index: number) => (
                                <div
                                    key={`default-${index}`}
                                    className="relative w-fit h-[40px] p-2 text-[14px] bg-[#CFF2FF] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                >
                                    {item?.name}
                                </div>
                            ))}

                            {
                                selectedShippersRender?.map((item: any, index: number) => (
                                    <div
                                        key={index}
                                        className="relative w-fit h-[40px] p-2 text-[14px] bg-[#CFF2FF] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                    >
                                        {item?.name}
                                        <button
                                            type="button"
                                            className="absolute top-[-6px] right-[-4px] w-[15px] h-[15px] rounded-full bg-[#58585A] text-white flex justify-center items-center text-[8px]"
                                            onClick={() => removeShipper(item?.id)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                    <div className="w-full ">
                        <div className='pb-2'>
                            <span className="text-[#464255] font-semibold pb-2 mb-2">Email Group</span>
                        </div>
                        <Select
                            id="email_group"
                            multiple
                            IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                            {...register("email_group", { required: false })}
                            disabled={mode == 'view' ? true : false}
                            value={selectedEmailGroup}
                            onChange={handleSelectEmailGroup}
                            className={`${selectboxClass} ${(mode == 'view') && "!bg-[#EFECEC]"} ${errors.email_group && "border-red-500"}`}
                            sx={{
                                ".MuiOutlinedInput-notchedOutline": { borderColor: errors.email_group && selectedEmailGroup.length === 0 ? "#FF0000" : "#DFE4EA" },
                                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#d2d4d8" },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#d2d4d8" },
                                ".MuiSelect-multiple": {
                                    fontSize: 14 // ขนาดของ tag ที่แสดงรายการที่เลือก
                                },
                                ".MuiSelect-select": {
                                    fontSize: 14 // สำคัญที่สุด – ขนาดข้อความหลักของ Select
                                },
                                fontSize: 14
                            }}
                            displayEmpty
                            renderValue={(selected) => {
                                if (selected.length === 0) {
                                    return <Typography color="#9CA3AF" fontSize={14}>Select Email Group</Typography>;
                                }
                                // return selected.map((id) => emailGroupForEventData.find((item: any) => item.id === id)?.name).join(", ");
                                const email_group_data = emailGroupForEventData?.filter((item: any) => !defaultEmailGrouId?.includes(item.id))
                                return (
                                    <span className={`pl-[10px] text-[14px]`}>
                                        {email_group_data?.length == selectedEmailGroup?.length ? `Select All` : selected.map((id) => emailGroupForEventData?.filter((item: any) => !defaultEmailGrouId?.includes(item.id)).find((item: any) => item.id === id)?.name).join(", ")}
                                    </span>
                                );
                            }}
                            MenuProps={{ PaperProps: { style: { maxHeight: 48 * 4.5 + 8 } } }}
                        >

                            <MenuItem value="all" sx={{ fontSize: "14px", color: "#454255" }}>
                                <Checkbox checked={selectedEmailGroup.length === emailGroupForEventData.length && emailGroupForEventData.length > 0} />
                                <ListItemText
                                    primary="Select All"
                                    // sx={{ fontWeight: 'bold' }}
                                    primaryTypographyProps={{ sx: { fontWeight: 'bold', fontSize: "14px" } }}
                                />
                            </MenuItem>

                            {emailGroupForEventData?.length > 0 && emailGroupForEventData
                                ?.filter((item: any) => !defaultEmailGrouId?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                .sort((a: any, b: any) => (a?.name || "").localeCompare(b?.name || ""))?.map((item: any) => (
                                    <MenuItem
                                        key={item.id}
                                        value={item.id}
                                        disabled={false}
                                    >
                                        <Checkbox checked={selectedEmailGroup?.includes(item.id)} />
                                        <ListItemText primary={item.name} primaryTypographyProps={{ fontSize: 14 }} />
                                    </MenuItem>
                                ))}
                        </Select>

                        {/* <div className="flex flex-wrap gap-3 pt-4 w-full h-[100px] max-h-[120px] overflow-y-auto"> */}
                        <div className="flex flex-wrap gap-2 pt-2 mt-2 w-full max-h-[120px] overflow-y-auto">
                            {/* ลบไม่ได้เว่ย */}
                            {defaultEmailGroupRender?.map((item: any, index: number) => (
                                <div
                                    key={`default-${index}`}
                                    className="relative w-fit h-[40px] p-2 text-[14px] bg-[#F3F2F2] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                >
                                    {item?.name}
                                </div>
                            ))}

                            {
                                selectedEmailGroupRender?.map((item: any, index: number) => (
                                    <div
                                        key={index}
                                        className="relative w-fit h-[40px] p-2 text-[14px] bg-[#F3F2F2] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                    >
                                        {item?.name}

                                        <button
                                            type="button"
                                            className="absolute top-[-6px] right-[-4px] w-[15px] h-[15px] rounded-full bg-[#58585A] text-white flex justify-center items-center text-[8px]"
                                            onClick={() => removeEmailGroup(item?.id)}
                                        >
                                            ✕
                                        </button>

                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            }


            {/* เลือก CC Email */}
            {
                !isShipper && (mode == 'create' || mode == 'edit') &&
                <div className="grid grid-cols-2 gap-4 pt-3">
                    <div className="w-full col-span-2">
                        <div className='pb-2'>
                            <span className="text-[#464255] font-semibold pb-2 mb-2">CC Email</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                id="email"
                                type="email"
                                value={watch("email")}
                                placeholder="Enter Email"
                                readOnly={mode == 'view' ? true : false}
                                // {...register("email")}
                                onChange={(e) => {
                                    onChange(e);
                                    setAlertDupMail(false);
                                }}
                                {...restEmail}
                                className={`${inputClass} ${errors.email && "border-red-500"} ${mode == 'view' && '!bg-[#EFECEC]'}`}
                            />

                            <AddOutlinedIcon
                                sx={{ fontSize: 33, width: 44, height: 44 }}
                                className={`text-[#ffffff] border rounded-md p-1 cursor-pointer ${mode == 'view' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watch("email")) ? 'bg-[#58585A] border-gray-500' : 'bg-[#24AB6A] border-[#24AB6A]'}`}
                                onClick={() => {
                                    const email: any = watch("email");
                                    if (mode !== 'view' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                                        if (!emailGroup?.includes(email) && !defaultCcEmailRender?.includes(email)) {
                                            setAlertDupMail(false);
                                            addEmailGroup(email);
                                            handletrickerEdit();
                                        } else {
                                            setAlertDupMail(true);
                                            // alert("Email already exists!");
                                        }
                                    }
                                }}
                            />
                        </div>
                        {
                            alertDupMail && <p className={`${textErrorClass}`}>{'Email already exists'}</p>
                        }

                        {/* <div className="flex flex-wrap gap-2 pt-4 w-full h-[120px] overflow-y-auto"> */}
                        <div className="flex flex-wrap gap-2 pt-2 mt-2 w-full max-h-[120px] overflow-y-auto">
                            {
                                defaultCcEmailRender && defaultCcEmailRender?.map((item: any, index: number) => (
                                    <div
                                        key={index}
                                        className="relative w-fit h-[40px] p-2 text-[14px] bg-[#FFFFFF] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                    >
                                        {item}
                                    </div>
                                ))
                            }

                            {
                                emailGroup?.length > 0 && emailGroup?.map((item: any, index: number) => (
                                    <div
                                        key={index}
                                        className="relative w-fit h-[40px] p-2 text-[14px] bg-[#FFFFFF] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                    >
                                        {item}
                                        <button
                                            type="button"
                                            className="absolute top-[-6px] right-[-4px] w-[15px] h-[15px] rounded-full bg-[#58585A] text-white flex justify-center items-center text-[8px]"
                                            onClick={() => removeEmail(index)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                </div>
            }


            {/* ตาราง แสดงเฉพาะ TSO edit view */}
            {
                // userDT?.account_manage?.[0]?.user_type_id !== 3 && (mode == 'edit' || mode == 'view') && <div className="pt-4"><TableDocument39 tableData={dataTable} dataOpenDocument={dataOpenDocument} /></div>
                !isShipper && (mode == 'edit' || mode == 'view') && <div className="pt-4"><TableDocument39 tableData={dataTable} dataOpenDocument={dataOpenDocument} /></div>
            }



            {/* ส่วนของผู้ให้บริการ แค่ shipper เห็น */}
            {
                isShipper && (mode == 'edit' || mode == 'view') &&
                <div className="grid grid-cols-2 gap-4 pt-3">
                    <span className="text-[#58585A] font-semibold">ส่วนของผู้ใช้บริการ / คู่สัญญาของผู้ใช้บริการ</span>
                </div>
            }

            {/* การดำเนินการ แค่ shipper เห็น */}
            {
                isShipper && (mode == 'edit' || mode == 'view') &&
                <div className="grid grid-cols-2 gap-4 pt-3">
                    <div className="w-full col-span-2">
                        <label className={`${labelClass} `}>{`การดำเนินการ`}</label>
                        <TextField
                            {...register("doc_39_input_shipper_operation")}
                            value={watch("doc_39_input_shipper_operation") || ""}
                            label=""
                            multiline
                            onChange={(e) => {
                                if (e.target.value.length <= 500) {
                                    setValue("doc_39_input_shipper_operation", e.target.value);
                                }
                            }}
                            placeholder="ระบุรายละเอียด"
                            disabled={mode == 'view' ? true : false}
                            rows={2}
                            sx={textFieldSx}
                            className={`${mode == 'view' && 'bg-[#EFECEC] rounded-[8px]'}`}
                            InputProps={inputPropsTextField}
                            fullWidth
                        />
                        <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                            <span className="text-[13px]">
                                {watch("doc_39_input_shipper_operation")?.length || 0} / 500
                            </span>
                        </div>
                    </div>
                </div>
            }

            {/* หมายเหตุ แค่ shipper เห็น */}
            {
                isShipper && (mode == 'edit' || mode == 'view') &&
                <div className="grid grid-cols-2 gap-4 ">
                    <div className="w-full col-span-2">
                        <label className={`${labelClass} `}>{`หมายเหตุ`}</label>
                        <TextField
                            {...register("doc_39_input_shipper_note")}
                            value={watch("doc_39_input_shipper_note") || ""}
                            label=""
                            multiline
                            onChange={(e) => {
                                if (e.target.value.length <= 500) {
                                    setValue("doc_39_input_shipper_note", e.target.value);
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
                                {watch("doc_39_input_shipper_note")?.length || 0} / 500
                            </span>
                        </div>
                    </div>
                </div>
            }


            {(() => {
                const shouldHideButton = isShipper && (dataOpenDocument?.event_doc_status_id === 1 || dataOpenDocument?.event_doc_status_id === 5);

                return (
                    <div className="flex justify-end pt-8">
                        {mode !== 'view' && !shouldHideButton && (
                            <button
                                type="submit"
                                className="w-[167px] h-[44px] font-semibold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                // disabled={trickerEdit || false}
                                disabled={modeDraft ? false : (isShipper ? false : !!trickerEdit)}
                            >
                                {mode === 'create' ? 'Save Darft' : modeDraft ? "Submit" : (isShipper ? 'Acknowledge' : 'Save')}
                            </button>
                        )}
                    </div>
                )
            })()}
        </form >


        {/* Confirm Save */}
        <ModalConfirmSave
            customWidth={(dataPDFItem?.data?.[0]?.item?.shipper || [])?.length > 0 ? 700 : 490}
            open={modaConfirmSave}
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
            title={mode == 'create' ? "Confirm Submission" : isShipper ? "Confirm Acknowledge" : mode == 'edit' ? "Confirm Save" : 'Confirm'}
            description={
                mode == 'create' ?
                    <div className=" w-full">
                        {
                            dataPDFItem &&
                            <PdfDoc309 data={dataPDFItem} />
                        }
                        <div className="text-center">
                            {`Do you want to submit now ?`}
                        </div>
                    </div >
                    : isShipper ? <div className=" w-full">
                                        {
                                            dataPDFItem &&
                                            <PdfDoc309 data={dataPDFItem} />
                                        }
                                    <div className="text-center">
                                        {`Do you want to Acknowledge now ?`}
                                    </div>
                                </div >
                        :
                        mode == 'edit' &&
                        <div className=" w-full">
                            {
                                dataPDFItem &&
                                <PdfDoc309 data={dataPDFItem} />
                            }
                            <div className="text-center">
                                {`Do you want to save the changes ?`}
                            </div>
                        </div >
            }
            menuMode="confirm-save"
            btnmode="split"
            btnsplit1={mode == 'create' ? "Submit" : mode == 'edit' ? "Save" : "Acknowledge"}
            btnsplit2="Cancel"
            stat="none"
        />

    </>
    );
};

export default FormDocument39;