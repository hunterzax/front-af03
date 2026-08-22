import { useEffect, useMemo, useState } from "react";
import { convertTimeStringToDate, cutUploadFileName, formatDateNoTime, formatFormDate, generateUserPermission } from '@/utils/generalFormatter';
import dayjs from 'dayjs';
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import ModalConfirmSave from "@/components/other/modalConfirmSave";
import { Checkbox, InputAdornment, ListItemText, ListSubheader, MenuItem, Select, TextField, Typography } from "@mui/material";
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DatePickaFormThai from "@/components/library/dateRang/dateSelectFormThai";
import { getService, uploadFileService } from "@/utils/postService";
import SelectFormProps from "@/components/other/selectProps";
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TimePickaForm from "@/components/library/dateRang/timePickerForm";
import TableDocument3 from "./tableInDocument3";
import SearchIcon from '@mui/icons-material/Search';
import { PdfDoc3 } from "@/components/other/pdf_event/docEvent";

type FormExampleProps = {
    data?: Partial<any>;
    mode?: any;
    userDT?: any;
    shipperData?: any;
    emailGroupForEventData?: any;
    refDocData?: any;
    setIsOpenDocument?: any;
    dataOpenDocument?: any;
    modeOpenDocument?: any;
    onSubmit: SubmitHandler<any>;
};

const inputClass = "text-[14px] block md:w-full p-2 ps-5 focus:!ps-5 hover:!ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"
const labelClass = "block mb-2 text-[14px] text-[#464255] font-semibold"
const textErrorClass = "text-red-500 text-[14px] "
const selectboxClass = "flex w-full h-[44px] p-1 ps-1 pe-2 !rounded-lg text-gray-900 block outline-none";

// เงื่อนไขการแสดงผล DOC 3 
// shipper เปิด จะเป็น draft จนกว่า tso จะไป edit (พอ edit แล้ว stat จะเป็น submit ปุ่ม acknowledge ของหน้า edit shipper จะเปิด)
// tso เปิด stat จะเป็น submit เลย ตอน shipper เข้าไป edit จะเห็นปุ่ม acknowledge

// ถ้า shipper สร้าง tso เข้ามา edit ข้างบนจะแก้ไขได้ หลังจากกดแก้ไข ถึงจะ disable ส่วนบน
// ถ้า tso สร้าง กดกลับมา edit ไม่ได้แล้ว

// key ใน DB ตามฟอร์ม
// {
//     "ref_document": 46, // id runnumber ไม่ ref null
//     "event_date": "2025-08-01", // วันที่ออกเอกสาร
//     "longdo_dict": "ส่วนบริหารสัญญาระบบท่อส่งก๊าซ (บส.กตต.)", //สำเนา

//     "doc3_input_shipper_doc_number": "62/2567", // doc3 ผู้ใช้ เอกสารเลขที่
//     "doc3_input_shipper_doc_quality": "1", // doc3 ผู้ใช้ เอกสารแจ้งเตือนคุณภาพ
//     "doc3_input_shipper_down_date": "2024-05-04", // doc3 ผู้ใช้ ลงวันที่
//     "doc3_input_shipper_time_event_start_date": "2025-05-04", // doc3 ผู้ใช้ ช่วงเวลาของเหตุการณ์ เริ่ม วัน
//     "doc3_input_shipper_time_event_start_time": "07:51", // doc3 ผู้ใช้ ช่วงเวลาของเหตุการณ์ เริ่ม เวลา
//     "doc3_input_shipper_time_event_end_date": "2025-05-04", // doc3 ผู้ใช้ ช่วงเวลาของเหตุการณ์ ถึง วัน
//     "doc3_input_shipper_time_event_end_time": "12:20", // doc3 ผู้ใช้ ช่วงเวลาของเหตุการณ์ ถึง เวลา
//     "doc3_input_shipper_time_event_summary": "โรงแยกก๊าซธรรมชาติปรับกระบวนการผลิต เพื่อควบคุมคุณภาพก๊าซ", // doc3 ผู้ใช้ ช่วงเวลาของเหตุการณ์ สรุปการแก้ไข
//     "doc3_input_tso_doc_number": "บค.บคต./110/2567", // (shipper สร้างส่ง null) doc3 ผู้ให้ เอกสารเลขที่
//     "doc3_input_tso_down_date": "2025-05-04", // (shipper สร้างส่ง null) doc3 ผู้ให้ ลงวันที่
//     "doc3_input_tso_disapeared_date": "2025-05-05", // (shipper สร้างส่ง null) doc3 ผู้ให้ โดยก๊าซที่ไม่อยู่ในกำหนด TSO Code ได้หมดไปจากระบบก๊าซฯ เมื่อวันที่ วัน
//     "doc3_input_tso_disapeared_time": "00:15", // (shipper สร้างส่ง null) doc3 ผู้ให้ โดยก๊าซที่ไม่อยู่ในกำหนด TSO Code ได้หมดไปจากระบบก๊าซฯ เมื่อวันที่ เวลา

//     "shipper":[62, 63],// (shipper สร้างส่ง [])
//     "email_event_for_shipper":[7], //(shipper สร้างส่ง [])
//     "cc_email": ["teerapong.songsan@gmail.com"] //(shipper สร้างส่ง [])
// }

const FormDocument3: React.FC<FormExampleProps> = ({ mode, data, onSubmit, setIsOpenDocument, dataOpenDocument, modeOpenDocument, userDT, shipperData, emailGroupForEventData, refDocData }) => {
    const [dataPDFItem, setdataPDFItem] = useState<any>(null)
    
    const { control, register, handleSubmit, setValue, reset, clearErrors, formState: { errors }, watch, } = useForm<any>({ defaultValues: data, });
    const [tk, settk] = useState<boolean>(false); // ของคุ้นเคย

    const { onChange, ...restEmail } = register("email"); // register email

    const [optionShipper, setoptionShipper] = useState<any>(shipperData);

    const [flagAck, setflagAck] = useState(false)

    const [headerFormText, setHeaderFormText] = useState('');
    const [fileNameEditText, setFileNameEditText] = useState(''); // เอาไว้แสดงชื่อไฟล์ตอนเข้ามา view หรือ edit
    const [fileNameEditTextUrl, setFileNameEditUrl] = useState(''); // url ไฟล์ เอาไว้กดโหลดตอนเข้ามา view หรือ edit
    const [documentId, setDocumentId] = useState(''); // ID ของ Document 2
    // const isReadOnly = mode === "view" || mode == 'edit';
    const shipperCreateDraft = (userDT?.account_manage?.[0]?.user_type_id === 3 || userDT?.account_manage?.[0]?.user_type_id === 4) && dataOpenDocument?.event_doc_status_id === 1 && mode == 'edit'
    const tsoCreateDraft = (userDT?.account_manage?.[0]?.user_type_id === 2 || userDT?.account_manage?.[0]?.user_type_id === 1) && dataOpenDocument?.event_doc_status_id === 1 && mode == 'edit'

    // const isReadOnly = mode === "view" || mode == 'edit';
    // shipperCreateDraft
    
    const isReadOnly = (shipperCreateDraft || tsoCreateDraft) ? false : (mode === "view" || mode == 'edit');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [dataTable, setDataTable] = useState<any>([])

    const [isTsoEdited, setIsTsoEdited] = useState<boolean>(false); // Edit : ถ้าไม่มีข้อมูลอะไร update ให้ disable ปุ่ม save ไว้ https://app.clickup.com/t/86eupj5ug

    const [jangDoi, setJangDoi] = useState<any>(''); // ชื่อคนแจ้งโดย
    const [shipperCompanyName, setShipperCompanyName] = useState<any>(''); // shipper company name
    const [isStatSubmitAndModeEdit, setIsStatSubmitAndModeEdit] = useState<boolean>(false); // เอาไว้เช็คว่า status ของเอกสารเป็น submit และเปิดฟอร์มมาในโหมด edit หรือป่าว ถ้าใช่ จะเปลี่ยนเป็น true จะได้ไป disable ของในฟอร์ม

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

    console.log('dataOpenDocument : ', dataOpenDocument);

    {/* Confirm Save */ }
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()

     async function apiDoc12 () {
            const res_def_doc_2: any = await getService(`/master/event/offspec-gas/doc3/ref-doc-use-all`)
            const find_doc_data = res_def_doc_2?.find((item: any) => item?.event_nember == dataOpenDocument?.event_runnumber?.event_nember)
            const checkDoc2 = !(!!(find_doc_data?.event_document || [])?.find((f:any) => f?.event_doc_master_id === 2 && f?.event_doc_status_id !== 1) && (userDT?.account_manage?.[0]?.user_type_id != 3 && userDT?.account_manage?.[0]?.user_type_id != 4))
            setflagAck(checkDoc2)
    }
    
    useEffect(() => {
        let text_header: any = 'สร้างเอกสารแจ้งคุณภาพก๊าซหรือปริมาณก๊าซนำเข้ากลับเป็นปกติ 3'
        switch (modeOpenDocument) {
            case 'view':
                text_header = 'ดูข้อมูลเอกสารแจ้งคุณภาพก๊าซหรือปริมาณก๊าซนำเข้ากลับเป็นปกติ 3'
                break;
            case 'edit':
                text_header = 'แก้ไขเอกสารแจ้งคุณภาพก๊าซหรือปริมาณก๊าซนำเข้ากลับเป็นปกติ 3'
                break;
        }
        setHeaderFormText(text_header)
        // setDocumentId(dataOpenDocument?.document1?.id)
        setDocumentId(dataOpenDocument?.id)

        if (modeOpenDocument == 'edit' || modeOpenDocument == 'view') {

            setValue('ref_document', dataOpenDocument?.event_runnumber_id)
            
            
            apiDoc12()
            
        

            // setValue('event_date', dataOpenDocument?.event_runnumber?.event_date)
            setValue('event_date', dataOpenDocument?.event_date)
            setValue('longdo_dict', dataOpenDocument?.longdo_dict)

           
            // if (dataOpenDocument?.event_doc_status?.id == 1 || dataOpenDocument?.event_doc_status?.id == 2) {
            if (dataOpenDocument?.event_doc_status?.id == 2) {
                setIsStatSubmitAndModeEdit(true)
            }

            // set ข้อมูลแจ้งโดยและ shipper company name
            let jang_doi = dataOpenDocument?.create_by_account?.first_name + ' ' + dataOpenDocument?.create_by_account?.last_name
            setJangDoi(jang_doi)
            if (dataOpenDocument?.user_type_id == 3 || dataOpenDocument?.user_type_id == 4) {
                // let company_data = dataOpenDocument?.group?.company_name ? dataOpenDocument?.group?.company_name : dataOpenDocument?.group?.name
                // setShipperCompanyName(company_data)
                setShipperCompanyName(dataOpenDocument?.doc3_input_shipper_cpn_name) // Edit : ข้อมูล Shipper Company Name ขึ้นไม่ถูก https://app.clickup.com/t/86eucvc0r
            } else {
                // ถ้าคนเปิดเอกสารเป็น TSO แสดงชื่อนี้
                setShipperCompanyName('บริษัท ปตท.จำกัด (มหาชน)')
            }

            // set ชื่อ shipper กลับที่เดิม
            const groupIds = dataOpenDocument?.event_runnumber?.event_document?.map((item: any) => item.group_id);
            const filteredShippers = shipperData?.filter((item: any) => groupIds?.includes(item.id));
            const defaultIds = filteredShippers?.map((s: any) => s.id); // เอา id 
            // set email group กลับที่เดิม
            const emailGroupForEventIds = dataOpenDocument?.event_document_email_group_for_event?.map((item: any) => item.edit_email_group_for_event_id);
            const filter_email_group_for_event = emailGroupForEventData?.filter((item: any) => emailGroupForEventIds?.includes(item?.id))
            const defaultEmailGroupIds = filter_email_group_for_event?.map((s: any) => s.id); // เอา id 
            
            // set CC email กลับที่เดิม
            const ccEmail = dataOpenDocument?.event_document_cc_email?.map((item: any) => item.email);

            // shipperCreateDraft
            // tsoCreateDraft
            if(tsoCreateDraft){
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
            // setDataTable(dataOpenDocument?.event_runnumber?.event_document)
            // setDataTable(dataOpenDocument?.history_table_inside)
            const filter_only_own_doc = dataOpenDocument?.history_table_inside?.filter((item: any) => item?.event_doc_master_id == 3)
            // setDataTable(modeOpenDocument == 'edit' ? dataOpenDocument?.event_runnumber?.event_document : filter_only_own_doc)
            setDataTable(modeOpenDocument == 'edit' ? dataOpenDocument?.event_runnumber?.event_document : filter_only_own_doc?.length > 0 ? filter_only_own_doc : dataOpenDocument?.event_runnumber?.event_document)


            // SET ข้อมูลลงฟอร์มนะ
            setValue('doc3_input_shipper_doc_number', dataOpenDocument?.doc3_input_shipper_doc_number) // doc3 ผู้ใช้ เอกสารเลขที่
            setValue('doc3_input_shipper_doc_quality', dataOpenDocument?.doc3_input_shipper_doc_quality) // doc3 ผู้ใช้ เอกสารแจ้งเตือนคุณภาพ
            setValue('doc3_input_shipper_down_date', dataOpenDocument?.doc3_input_shipper_down_date)  // doc3 ผู้ใช้ ลงวันที่
            setValue('doc3_input_shipper_time_event_start_date', dataOpenDocument?.doc3_input_shipper_time_event_start_date) // doc3 ผู้ใช้ ช่วงเวลาของเหตุการณ์ เริ่ม วัน
            setValue('doc3_input_shipper_time_event_start_time', dataOpenDocument?.doc3_input_shipper_time_event_start_time ? convertTimeStringToDate(dataOpenDocument?.doc3_input_shipper_time_event_start_time) : null)  // doc3 ผู้ใช้ ช่วงเวลาของเหตุการณ์ เริ่ม เวลา
            setValue('doc3_input_shipper_time_event_end_date', dataOpenDocument?.doc3_input_shipper_time_event_end_date)  // doc3 ผู้ใช้ ช่วงเวลาของเหตุการณ์ ถึง วัน
            setValue('doc3_input_shipper_time_event_end_time', dataOpenDocument?.doc3_input_shipper_time_event_end_time ? convertTimeStringToDate(dataOpenDocument?.doc3_input_shipper_time_event_end_time) : null)  // doc3 ผู้ใช้ ช่วงเวลาของเหตุการณ์ ถึง เวลา
            setValue('doc3_input_shipper_time_event_summary', dataOpenDocument?.doc3_input_shipper_time_event_summary) // doc3 ผู้ใช้ ช่วงเวลาของเหตุการณ์ สรุปการแก้ไข
            setValue('doc3_input_tso_doc_number', dataOpenDocument?.doc3_input_tso_doc_number) // (shipper สร้างส่ง null) doc3 ผู้ให้ เอกสารเลขที่
            setValue('doc3_input_tso_down_date', dataOpenDocument?.doc3_input_tso_down_date) // (shipper สร้างส่ง null) doc3 ผู้ให้ ลงวันที่
            setValue('doc3_input_tso_disapeared_date', dataOpenDocument?.doc3_input_tso_disapeared_date) // (shipper สร้างส่ง null) doc3 ผู้ให้ โดยก๊าซที่ไม่อยู่ในกำหนด TSO Code ได้หมดไปจากระบบก๊าซฯ เมื่อวันที่ วัน
            setValue('doc3_input_tso_disapeared_time', dataOpenDocument?.doc3_input_tso_disapeared_time ? convertTimeStringToDate(dataOpenDocument?.doc3_input_tso_disapeared_time) : null) // (shipper สร้างส่ง null) doc3 ผู้ให้ โดยก๊าซที่ไม่อยู่ในกำหนด TSO Code ได้หมดไปจากระบบก๊าซฯ เมื่อวันที่ เวลา

            setValue('event_doc_status_id', dataOpenDocument?.event_doc_status_id == 3 ? 'accepted' : dataOpenDocument?.event_doc_status_id == 4 ? 'rejected' : dataOpenDocument?.event_doc_status_id == 5 ? 'acknowledge' : '')

            setFileNameEditText(dataOpenDocument?.event_document_file?.length > 0 ? cutUploadFileName(dataOpenDocument?.event_document_file[0]?.url) : '') // File Name
            setFileNameEditUrl(dataOpenDocument?.event_document_file?.length > 0 ? dataOpenDocument?.event_document_file[0]?.url : '') // File URL

        }

        setoptionShipper(shipperData);

    }, [mode, dataOpenDocument, shipperData, emailGroupForEventData])


    {/* Confirm Save */ }
    const handleSaveConfirm = async (data?: any) => {
        if (mode == 'create') {
            const tso_or_shipper_create = {
                "ref_document": watch('ref_document'),                          // id runnumber ไม่ ref null
                "event_date": dayjs(watch('event_date')).format("YYYY-MM-DD"),  // วันที่ออกเอกสาร
                // "longdo_dict": data?.longdo_dict, //สำเนา
                "longdo_dict": watch('longdo_dict'), //สำเนา
                "doc3_input_notifyby": jangDoi, //แจ้งโดย
                "doc3_input_shipper_cpn_name": shipperCompanyName, // shipper company name

                "doc3_input_shipper_doc_number": data?.doc3_input_shipper_doc_number ? data?.doc3_input_shipper_doc_number : '',            // doc3 ผู้ใช้ เอกสารเลขที่
                "doc3_input_shipper_doc_quality": data?.doc3_input_shipper_doc_quality ? data?.doc3_input_shipper_doc_quality : '',         // doc3 ผู้ใช้ เอกสารแจ้งเตือนคุณภาพ
                "doc3_input_shipper_down_date": watch('doc3_input_shipper_down_date') ? dayjs(watch('doc3_input_shipper_down_date')).format("YYYY-MM-DD") : '', // doc3 ผู้ใช้ ลงวันที่
                "doc3_input_shipper_time_event_start_date": watch('doc3_input_shipper_time_event_start_date') ? dayjs(watch('doc3_input_shipper_time_event_start_date')).format("YYYY-MM-DD") : '',  // doc3 ผู้ใช้ ช่วงเวลาของเหตุการณ์ เริ่ม วัน
                "doc3_input_shipper_time_event_start_time": data?.doc3_input_shipper_time_event_start_time ? dayjs(data?.doc3_input_shipper_time_event_start_time).format('HH:mm') : '',                                 // doc3 ผู้ใช้ ช่วงเวลาของเหตุการณ์ เริ่ม เวลา
                "doc3_input_shipper_time_event_end_date": watch('doc3_input_shipper_time_event_end_date') ? dayjs(watch('doc3_input_shipper_time_event_end_date')).format("YYYY-MM-DD") : '', // doc3 ผู้ใช้ ช่วงเวลาของเหตุการณ์ ถึง วัน
                "doc3_input_shipper_time_event_end_time": data?.doc3_input_shipper_time_event_end_time ? dayjs(data?.doc3_input_shipper_time_event_end_time).format('HH:mm') : '',                                 // doc3 ผู้ใช้ ช่วงเวลาของเหตุการณ์ ถึง เวลา
                "doc3_input_shipper_time_event_summary": data?.doc3_input_shipper_time_event_summary ? data?.doc3_input_shipper_time_event_summary : '',    // doc3 ผู้ใช้ ช่วงเวลาของเหตุการณ์ สรุปการแก้ไข
                "doc3_input_tso_doc_number": data?.doc3_input_tso_doc_number ? data?.doc3_input_tso_doc_number : '',                    // (shipper สร้างส่ง null) doc3 ผู้ให้ เอกสารเลขที่
                "doc3_input_tso_down_date": watch('doc3_input_tso_down_date') ? dayjs(watch('doc3_input_tso_down_date')).format("YYYY-MM-DD") : '', // (shipper สร้างส่ง null) doc3 ผู้ให้ ลงวันที่
                "doc3_input_tso_disapeared_date": watch('doc3_input_tso_disapeared_date') ? dayjs(watch('doc3_input_tso_disapeared_date')).format("YYYY-MM-DD") : '',   // (shipper สร้างส่ง null) doc3 ผู้ให้ โดยก๊าซที่ไม่อยู่ในกำหนด TSO Code ได้หมดไปจากระบบก๊าซฯ เมื่อวันที่ วัน
                "doc3_input_tso_disapeared_time": data?.doc3_input_tso_disapeared_time ? dayjs(data?.doc3_input_tso_disapeared_time).format('HH:mm') : '', // (shipper สร้างส่ง null) doc3 ผู้ให้ โดยก๊าซที่ไม่อยู่ในกำหนด TSO Code ได้หมดไปจากระบบก๊าซฯ เมื่อวันที่ เวลา

                "file": fileUrl !== '' ? [fileUrl] : [],                //(shipper สร้างส่ง [])
                "shipper": selectedShippers,                            // (shipper สร้างส่ง [])
                "email_event_for_shipper": selectedEmailGroup,          //(shipper สร้างส่ง [])
                "cc_email": emailGroup                                  //(shipper สร้างส่ง [])
            }

            setdataPDFItem({userDT:userDT, dataOpenDocument: dataOpenDocument, data:[{item:{...data, ...tso_or_shipper_create,}, data: data}], shipperData: shipperData})

            setDataSubmit(tso_or_shipper_create)
            setModaConfirmSave(true)

            // ไป submit ตอนกดเฟิร์ม
            // await onSubmit(tso_create); 
        } else {
            // EDIT 

            let data_post_na: any = {}
            if (userDT?.account_manage?.[0]?.user_type_id !== 3 && userDT?.account_manage?.[0]?.user_type_id !== 4) {
                // mode edit tso

                data_post_na = {
                    // flagAck
                    "document_id": documentId, // เอาไว้ใช้เส้น put master/event/offspec-gas/doc3/${id}

                    "ref_document": dataOpenDocument?.event_runnumber_id, // id runnumber ไม่ ref null
                    "event_date": dataOpenDocument?.event_runnumber?.event_date ? dayjs(dataOpenDocument?.event_runnumber?.event_date).format("YYYY-MM-DD") : '', // วันที่ออกเอกสาร
                    "longdo_dict": dataOpenDocument?.longdo_dict, //สำเนา

                    "doc3_input_notifyby": jangDoi, //แจ้งโดย
                    "doc3_input_shipper_cpn_name": shipperCompanyName, // shipper company name

                    "doc3_input_shipper_doc_number": dataOpenDocument?.doc3_input_shipper_doc_number, // doc3 ผู้ใช้ เอกสารเลขที่
                    "doc3_input_shipper_doc_quality": dataOpenDocument?.doc3_input_shipper_doc_quality, // doc3 ผู้ใช้ เอกสารแจ้งเตือนคุณภาพ
                    "doc3_input_shipper_down_date": dataOpenDocument?.doc3_input_shipper_down_date ? dayjs(dataOpenDocument?.doc3_input_shipper_down_date).format("YYYY-MM-DD") : '', // doc3 ผู้ใช้ ลงวันที่
                    "doc3_input_shipper_time_event_start_date": dataOpenDocument?.doc3_input_shipper_time_event_start_date ? dayjs(dataOpenDocument?.doc3_input_shipper_time_event_start_date).format("YYYY-MM-DD") : '', // doc3 ผู้ใช้ ช่วงเวลาของเหตุการณ์ เริ่ม วัน
                    "doc3_input_shipper_time_event_start_time": dataOpenDocument?.doc3_input_shipper_time_event_start_time, // doc3 ผู้ใช้ ช่วงเวลาของเหตุการณ์ เริ่ม เวลา
                    "doc3_input_shipper_time_event_end_date": dataOpenDocument?.doc3_input_shipper_time_event_end_date ? dayjs(dataOpenDocument?.doc3_input_shipper_time_event_end_date).format("YYYY-MM-DD") : '', // doc3 ผู้ใช้ ช่วงเวลาของเหตุการณ์ ถึง วัน
                    "doc3_input_shipper_time_event_end_time": dataOpenDocument?.doc3_input_shipper_time_event_end_time, // doc3 ผู้ใช้ ช่วงเวลาของเหตุการณ์ ถึง เวลา
                    "doc3_input_shipper_time_event_summary": dataOpenDocument?.doc3_input_shipper_time_event_summary, // doc3 ผู้ใช้ ช่วงเวลาของเหตุการณ์ สรุปการแก้ไข

                    "doc3_input_tso_doc_number": watch('doc3_input_tso_doc_number') ? watch('doc3_input_tso_doc_number') : dataOpenDocument?.doc3_input_tso_doc_number, // (shipper สร้างส่ง null) doc3 ผู้ให้ เอกสารเลขที่
                    "doc3_input_tso_down_date": watch('doc3_input_tso_down_date') ? dayjs(watch('doc3_input_tso_down_date')).format("YYYY-MM-DD") : dataOpenDocument?.doc3_input_tso_down_date ? dayjs(dataOpenDocument?.doc3_input_tso_down_date).format("YYYY-MM-DD") : '', // (shipper สร้างส่ง null) doc3 ผู้ให้ ลงวันที่
                    "doc3_input_tso_disapeared_date": watch('doc3_input_tso_disapeared_date') ? dayjs(watch('doc3_input_tso_disapeared_date')).format("YYYY-MM-DD") : dataOpenDocument?.doc3_input_tso_disapeared_date ? dayjs(dataOpenDocument?.doc3_input_tso_disapeared_date).format("YYYY-MM-DD") : '', // (shipper สร้างส่ง null) doc3 ผู้ให้ โดยก๊าซที่ไม่อยู่ในกำหนด TSO Code ได้หมดไปจากระบบก๊าซฯ เมื่อวันที่ วัน
                    "doc3_input_tso_disapeared_time": watch('doc3_input_tso_disapeared_time') ? dayjs(watch('doc3_input_tso_disapeared_time')).format('HH:mm') : dataOpenDocument?.doc3_input_tso_disapeared_time, // (shipper สร้างส่ง null) doc3 ผู้ให้ โดยก๊าซที่ไม่อยู่ในกำหนด TSO Code ได้หมดไปจากระบบก๊าซฯ เมื่อวันที่ เวลา

                    // "file": fileUrl !== '' ? [fileUrl] : [fileNameEditTextUrl], // ส่งมาแค่ 1 ถ้า หน้าบ้านอัพโหลด ส่าง url ใหม่ ถ้าไม่อัพส่ง url เก่ามา
                    "file": fileUrl !== '' ? [fileUrl] : fileNameEditTextUrl !== '' ? [fileNameEditTextUrl] : [], // ส่งมาแค่ 1 ถ้า หน้าบ้านอัพโหลด ส่าง url ใหม่ ถ้าไม่อัพส่ง url เก่ามา
                    "shipper": Array.from(new Set([...selectedShippers, ...defaultShippersId])), // (shipper สร้างส่ง [])
                    "email_event_for_shipper": Array.from(new Set([...selectedEmailGroup, ...defaultEmailGrouId])), //(shipper สร้างส่ง [])
                    "cc_email": Array.from(new Set([...emailGroup, ...defaultCcEmailRender])), //(shipper สร้างส่ง [])
                    "event_doc_status_id": flagAck ? 5 : 2
                }

            } else {
                // mode edit shipper
                // doc 3 นี้ shipper Acknowledge อย่างเดียว
                data_post_na = { 
                    ...data,
                    "document_id": documentId, // เอาไว้ใช้เส้น POST master/event/offspec-gas/doc3/edit/${id}
                    "event_doc_status_id": dataOpenDocument?.event_doc_status_id === 1 ? 2 : 5 // 5 Acknowledge
                }
            }

            setdataPDFItem({userDT:userDT, dataOpenDocument: dataOpenDocument, data:[{item:{...data, ...data_post_na,}, data: data}], shipperData: shipperData})
            setDataSubmit(data_post_na)
            setModaConfirmSave(true)
        }
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

    // ############# SHIPPER SELECT #############
    const [selectedShippers, setSelectedShippers] = useState<string[]>([]);
    const [selectedShippersRender, setSelectedShippersRender] = useState<any[]>([]);

    const handleSelectChange = (event: any) => {
        const value = event.target.value;
        setIsTsoEdited(true)
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
    };

    const removeShipper = (idToRemove: number) => {
        setSelectedShippers((prevGroup: any) => prevGroup.filter((data: any, index: number) => data !== idToRemove));
        setSelectedShippersRender((prevGroup: any) => prevGroup.filter((data: any, index: number) => data?.id !== idToRemove));
    };

    // ############# EMAIL GROUP SELECT #############
    const [selectedEmailGroup, setSelectedEmailGroup] = useState<string[]>([]);
    const [selectedEmailGroupRender, setSelectedEmailGroupRender] = useState<any[]>([]);

    const handleSelectEmailGroup = (event: any) => {
        const value = event.target.value;
        setIsTsoEdited(true)
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
    };

    const removeEmailGroup = (idToRemove: number) => {
        setSelectedEmailGroup((prevGroup: any) => prevGroup.filter((data: any, index: number) => data !== idToRemove));
        setSelectedEmailGroupRender((prevGroup: any) => prevGroup.filter((data: any, index: number) => data?.id !== idToRemove));
    };

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

            {/* ======================================================================================================================== */}
            {/* =================================== ส่วนของผู้ใช้บริการ / ผู้ให้บริการ (ผู้ที่ทำให้เกิดเหตุการณ์) ======================================== */}
            <div className="py-2 pt-4 text-[14px] font-semibold text-[#58585A]">
                {`ส่วนของผู้ใช้บริการ / ผู้ให้บริการ (ผู้ที่ทำให้เกิดเหตุการณ์)`}
            </div>

            <div className="flex flex-wrap flex-auto gap-4 pt-4">
                <div className="w-[320px]">
                    <label htmlFor="event_nember" className={labelClass}>
                        <span className="text-red-500">*</span>
                        {`อ้างอิงเอกสารแจ้งเตือนคุณภาพก๊าซฯ 1 หรือ 2`}
                    </label>

                    {
                        mode == 'create' ?
                            <SelectFormProps
                                id={'ref_document'}
                                register={register("ref_document", { required: true })}
                                disabled={mode == 'edit' ? true : false}
                                valueWatch={watch("ref_document") || ""}
                                handleChange={(e) => {
                                    setValue("ref_document", e.target.value);
                                    setValue('doc3_input_tso_doc_number', refDocData?.find((f:any) => f?.id === e.target.value)?.event_nember  || null)
                                    const find_doc_data = refDocData?.find((item: any) => item?.id == e.target.value)

                                     // event_doc_master_id
                                        // event_document
    
                                        // ตอนเลือก ref ให้เอา shipper company name และชื่อคนสร้างเอกสารมาแสดง
                                        let jang_doi = find_doc_data?.create_by_account?.first_name + ' ' + find_doc_data?.create_by_account?.last_name
    
                                        if (find_doc_data?.event_document?.length > 0) {
                                            jang_doi = find_doc_data?.event_document?.[0]?.create_by_account?.first_name + ' ' + find_doc_data?.event_document?.[0]?.create_by_account?.last_name
                                        }
                                        console.log('find_doc_data : ', find_doc_data);
                                        const findDoc1 = find_doc_data?.event_document?.find((f:any) => f?.event_doc_master_id === 1)
                                        const findDoc2 = find_doc_data?.event_document?.find((f:any) => f?.event_doc_master_id === 2)
                                        console.log('findDoc2 : ', findDoc2);
                                        console.log('findDoc1 : ', findDoc1);
                                        const docNum = (findDoc1 && findDoc2) ? 2 : (findDoc2) ? 2 : 1
                                        const docObj = docNum === 1 ? findDoc1 : findDoc2

                                        // 2026-OSG-0009/2-EGAT
                                        console.log('docNum : ', docNum);
                                        console.log('docObj : ', docObj);
                                        // doc3_input_shipper_doc_number doc3_input_shipper_doc_quality
                                        // event_doc_master_id
                                        find_doc_data ? setValue('doc3_input_shipper_doc_number', `${find_doc_data?.event_nember || ""}`) : setValue('doc3_input_shipper_doc_number', "");
                                        find_doc_data ? setValue('doc3_input_shipper_doc_quality', String(docNum)) : setValue('doc3_input_shipper_doc_quality', "");

                                        setJangDoi(jang_doi)
    
                                        if (find_doc_data?.user_type_id == 3 || find_doc_data?.user_type_id == 4) {
                                            let company_data = find_doc_data?.group?.company_name ? find_doc_data?.group?.company_name : find_doc_data?.group?.name
                                            setShipperCompanyName(company_data)
                                        } else {
                                            setShipperCompanyName('บริษัท ปตท.จำกัด (มหาชน)')
                                        }
                                        setValue('event_date', find_doc_data?.event_date) // วันที่ออกเอกสาร
                                        setValue("event_date", find_doc_data?.event_date);
                                        setValue("longdo_dict", find_doc_data?.event_document?.[0]?.longdo_dict);
    
    
                                        // New : ตอนเลือก ref doc แล้วข้อมูลตรง Shipper / Email Group / CC Email ต้อง Default เอาข้อมูลจาก doc ที่ ref มาให้ด้วย https://app.clickup.com/t/86eum0pbz
                                        // set ชื่อ shipper กลับที่เดิม
                                        const groupIds = find_doc_data?.event_document?.map((item: any) => item?.group_id);
                                        const filteredShippers = shipperData?.filter((item: any) => groupIds?.includes(item?.id));
                                        const defaultIds = filteredShippers?.map((s: any) => s?.id); // เอา id 

                                        const emailGroupForEventDataX = (find_doc_data?.event_document ?? []).filter((it: any) => Array.isArray(it?.event_document_email_group_for_event) && it.event_document_email_group_for_event.length > 0).flatMap((k: any) => k.event_document_email_group_for_event);
                                        const emailGroupForEventIds = emailGroupForEventDataX?.map((s: any) => s?.edit_email_group_for_event_id); // เอา id 
                                        const filter_email_group_for_event = emailGroupForEventData?.filter((item: any) => emailGroupForEventIds?.includes(item?.id))
                                        const uniqueGroupForEventIds = emailGroupForEventIds
                                            ?.filter((v: any) => v != null)
                                            ?.filter((v: any, i: any, arr: any) => arr?.indexOf(v) === i);

                                        // // set CC email กลับที่เดิม
                                        // const ccEmail = dataOpenDocument?.event_document_cc_email?.map((item: any) => item.email);
                                        const ccEmailFind = (find_doc_data?.event_document ?? []).filter((it: any) => Array.isArray(it?.event_document_cc_email) && it.event_document_cc_email.length > 0).flatMap((k: any) => k.event_document_cc_email);
                                        const ccEmail = ccEmailFind?.map((s: any) => s?.email);
                                        const uniqueCcEmail = ccEmail
                                            ?.filter((v: any) => v != null)
                                            ?.filter((v: any, i: any, arr: any) => arr?.indexOf(v) === i);

                                    if(userDT?.account_manage?.[0]?.user_type_id === 2 || userDT?.account_manage?.[0]?.user_type_id === 1){
                                        const checkDoc2 = !!!(find_doc_data?.event_document || [])?.find((f:any) => f?.event_doc_master_id === 2 && f?.event_doc_status_id !== 1)
                                        setflagAck(checkDoc2)
                                        if(checkDoc2){
                                            setSelectedShippersRender([]);
                                            setSelectedShippers([])
    
                                            // // set email group กลับที่เดิม
                                            
                                            setSelectedEmailGroupRender([])
                                            setSelectedEmailGroup([])
        
        
                                            
        
                                            // setDefaultCcEmailRender(ccEmail)  // ลบไม่ได้
                                            setEmailGroup([])
                                            setValue("email_arr", []);
                                        }else{
                                            setSelectedShippersRender(filteredShippers);
                                            setSelectedShippers(defaultIds)
        
        
                                            // // set email group กลับที่เดิม
                                            
                                            setSelectedEmailGroupRender(filter_email_group_for_event)
                                            setSelectedEmailGroup(uniqueGroupForEventIds)
        
        
                                            
        
                                            // setDefaultCcEmailRender(ccEmail)  // ลบไม่ได้
                                            setEmailGroup(uniqueCcEmail)
                                            setValue("email_arr", [...uniqueCcEmail]);
                                            
                                        }

                                    }else{

                                       
                                        
                                        setSelectedShippersRender(filteredShippers);
                                        setSelectedShippers(defaultIds)
    
    
                                        // // set email group กลับที่เดิม
                                        
                                        setSelectedEmailGroupRender(filter_email_group_for_event)
                                        setSelectedEmailGroup(uniqueGroupForEventIds)
    
    
                                        
    
                                        // setDefaultCcEmailRender(ccEmail)  // ลบไม่ได้
                                        setEmailGroup(uniqueCcEmail)
                                        setValue("email_arr", [...uniqueCcEmail]);
    
                                        // ========================================
    
    
    
                                        clearErrors('ref_document')
                                        if (errors?.ref_document) { clearErrors('ref_document') }
                                    }

                                }}
                                errors={errors?.ref_document}
                                errorsText={'เลือกเอกสารแจ้งเตือนคุณภาพก๊าซฯ 1 หรือ 2'}
                                options={refDocData}
                                optionsKey={'id'}
                                optionsValue={'id'}
                                optionsText={'event_nember'}
                                optionsResult={'event_nember'}
                                placeholder={'Select Document 1 or 2'}
                                pathFilter={'event_nember'}
                            />
                            :
                            <div className="w-full h-[44px] p-3 text-[14px] text-[#464255] rounded-[9px] bg-[#F1F1F1] border border-[#DFE4EA]"> {dataOpenDocument?.event_runnumber ? dataOpenDocument?.event_runnumber.event_nember : ''}</div>
                    }
                </div>

                {/* <div className="w-[200px]">
                    <label htmlFor="by_who" className={labelClass}>
                        {`แจ้งโดย`}
                    </label>
                    <div className="w-full h-[44px] p-3 text-[14px] text-[#464255] rounded-[9px] bg-[#EEECEC]">
                        {jangDoi ? jangDoi : ''}
                    </div>
                </div> */}

                <div className="inline-block max-w-full">
                    <label htmlFor="by_who" className={labelClass}>
                        {`แจ้งโดย`}
                    </label>
                    <div className="w-auto h-[44px] p-3 text-[14px] text-[#464255] rounded-[9px] bg-[#F1F1F1] border border-[#DFE4EA] whitespace-nowrap">
                        {jangDoi || ''}
                    </div>
                </div>

                <div className="w-[300px]">
                    <label htmlFor="shipper_comp_name" className={labelClass}>
                        {`Shipper Company Name`}
                    </label>
                    {/* ถ้าเป็น doc 2 ที่ TSO เป็นคนสร้าง ให้เป็นชื่อ บริษัท ปตท.จำกัด (มหาชน) */}
                    <div className="w-full h-[44px] p-3 text-[14px] text-[#464255] rounded-[9px] bg-[#F1F1F1] border border-[#DFE4EA]">
                        {shipperCompanyName ? shipperCompanyName : ''}
                    </div>
                </div>

                {/* วันที่ออกเอกสาร */}
                <div className="pb-2 w-[200px]">
                    <label className={labelClass}><span className="text-red-500">*</span>{`วันที่ออกเอกสาร`}</label>
                    <DatePickaFormThai
                        {...register('event_date', { required: "ระบุวันที่" })}
                        readOnly={isReadOnly}
                        placeHolder="ระบุวันที่"
                        mode={mode}
                        valueShow={watch("event_date") ? dayjs(watch("event_date")).format("DD/MM/YYYY") : undefined}
                        allowClear
                        isError={errors.event_date && !watch("event_date") ? true : false}
                        onChange={(e: any) => { setValue('event_date', formatFormDate(e)), e == undefined && setValue('event_date', null, { shouldValidate: true, shouldDirty: true }); }}
                    />

                    {errors.event_date && !watch("event_date") && <p className={`${textErrorClass}`}>{'ระบุวันที่'}</p>}
                </div>

                {/* เอกสารเลขที่ */}
                <div className="w-[190px]">
                    <label htmlFor="event_nember" className={labelClass}><span className="text-red-500">*</span>{`เอกสารเลขที่`}</label>

                    <input
                        id="doc3_input_shipper_doc_number"
                        {...register("doc3_input_shipper_doc_number", { required: "ระบุเอกสารเลขที่" })}
                        type="text"
                        placeholder="ระบุเอกสารเลขที่"
                        readOnly={true}
                        maxLength={25}
                        onChange={(e) => {
                            if (e.target.value.length <= 25) {
                                setValue('doc3_input_shipper_doc_number', e.target.value);
                            }
                        }}
                        className={`text-[14px] border-[1px] border-[#DFE4EA]  bg-white ps-[21px] h-[44px] w-full rounded-lg outline-none bg-opacity-100 focus:border-[#00ADEF] ${isReadOnly && '!bg-[#EFECEC]'} ${errors.doc3_input_shipper_doc_number && "border-red-500"}`}
                    />
                    {errors.doc3_input_shipper_doc_number && (<p className="text-red-500 text-sm">{`ระบุเอกสารเลขที่`}</p>)}
                </div>



                {/* เอกสารแจ้งเตือนคุณภาพ */}
                <div className="w-[230px]">
                    <label htmlFor="event_nember" className={labelClass}><span className="text-red-500">*</span>{`เอกสารแจ้งเตือนคุณภาพ`}</label>
                    <input
                        id="doc3_input_shipper_doc_quality"
                        {...register("doc3_input_shipper_doc_quality", { required: true })}
                        type="text"
                        placeholder="ระบุเอกสารแจ้งเตือนคุณภาพ"
                        readOnly={true}
                        maxLength={25}
                        onChange={(e) => {
                            if (e.target.value.length <= 25) {
                                setValue('doc3_input_shipper_doc_quality', e.target.value);
                            }
                        }}
                        className={`text-[14px] border-[1px] border-[#DFE4EA]  bg-white ps-[21px] h-[44px] w-full rounded-lg outline-none bg-opacity-100 focus:border-[#00ADEF] ${isReadOnly && '!bg-[#EFECEC]'} ${errors.doc3_input_shipper_doc_quality && "border-red-500"}`}
                    />
                    {errors.doc3_input_shipper_doc_quality && (<p className="text-red-500 text-sm">{`ระบุเอกสารแจ้งเตือนคุณภาพ`}</p>)}
                </div>

                {/* ลงวันที่ */}
                <div className="pb-2 w-[200px]">
                    <label className={labelClass}><span className="text-red-500">*</span>{`ลงวันที่`}</label>
                    <DatePickaFormThai
                        {...register('doc3_input_shipper_down_date', { required: "ระบุวันที่" })}
                        readOnly={isReadOnly}
                        placeHolder="ระบุวันที่"
                        mode={mode}
                        valueShow={watch("doc3_input_shipper_down_date") ? dayjs(watch("doc3_input_shipper_down_date")).format("DD/MM/YYYY") : undefined}
                        allowClear
                        isError={errors.doc3_input_shipper_down_date && !watch("doc3_input_shipper_down_date") ? true : false}
                        onChange={(e: any) => { setValue('doc3_input_shipper_down_date', formatFormDate(e)), e == undefined && setValue('doc3_input_shipper_down_date', null, { shouldValidate: true, shouldDirty: true }); }}
                    />
                    {errors.doc3_input_shipper_down_date && !watch("doc3_input_shipper_down_date") && <p className={`${textErrorClass}`}>{'ระบุวันที่'}</p>}
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



            {/* =========================================================================================== */}
            {/* =================================== ช่วงเวลาของเหตุการณ์ ======================================== */}
            <div className="py-2 text-[14px] font-semibold text-[#58585A]">
                {`ช่วงเวลาของเหตุการณ์`}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">

                <div>
                    <label className={`${labelClass}`}>{`วันที่และเวลา`}</label>

                    {/* เริ่ม */}
                    
                    <div className="flex flex-nowrap items-center gap-4">
                        <span className="text-[14px] w-[40px] font-semibold text-[#58585A]">{`เริ่ม :`}</span>
                        <span className="text-[14px] font-light text-[#58585A]">{`วันที่`}</span>
                        <span className="text-[14px] w-[200px] text-[#58585A]">
                            <DatePickaFormThai
                                {...register('doc3_input_shipper_time_event_start_date', { required: false })}
                                // readOnly={mode == 'view' || isStatSubmitAndModeEdit}
                                readOnly={mode == 'view' || isReadOnly}
                                placeHolder="ระบุวันที่"
                                mode={mode}
                                maxNormalForm={watch('doc3_input_shipper_time_event_end_date')}
                                valueShow={watch("doc3_input_shipper_time_event_start_date") ? dayjs(watch("doc3_input_shipper_time_event_start_date")).format("DD/MM/YYYY") : undefined}
                                allowClear
                                isError={!!errors.doc3_input_shipper_time_event_start_date && !watch("doc3_input_shipper_time_event_start_date")}
                                onChange={(e: any) => {
                                    setValue('doc3_input_shipper_time_event_start_date', formatFormDate(e));
                                    if (e == undefined)
                                        setValue('doc3_input_shipper_time_event_start_date', null, { shouldValidate: true, shouldDirty: true });
                                }}
                            />
                        </span>

                        <span className="text-[14px] font-light text-[#58585A]">{`เวลา`}</span>
                        <span className="text-[14px]  w-[200px] text-[#58585A]">
                            <TimePickaForm
                                {...register('doc3_input_shipper_time_event_start_time', { required: false })}
                                // readOnly={mode == 'view' || isStatSubmitAndModeEdit}
                                readOnly={mode == 'view' || isReadOnly}
                                placeHolder="ระบุเวลา"
                                mode={mode}
                                valueShow={watch("doc3_input_shipper_time_event_start_time") || undefined}
                                allowClear
                                isError={!!errors.doc3_input_shipper_time_event_start_time && !watch("doc3_input_shipper_time_event_start_time")}
                                onChange={(e: any) => {
                                    setValue('doc3_input_shipper_time_event_start_time', e);
                                    if (e == undefined)
                                        setValue('doc3_input_shipper_time_event_start_time', null, { shouldValidate: true, shouldDirty: true });
                                }}
                            />
                        </span>
                    </div>

                    {/* ถึง */}
                    <div className="flex flex-nowrap items-center gap-4 pt-4">
                        <span className="text-[14px] w-[40px] font-semibold text-[#58585A]">{`ถึง :`}</span>
                        <span className="text-[14px] font-light text-[#58585A]">{`วันที่`}</span>
                        <span className="text-[14px] w-[200px] text-[#58585A]">
                            <DatePickaFormThai
                                {...register('doc3_input_shipper_time_event_end_date', { required: false })}
                                // readOnly={mode == 'view' || isStatSubmitAndModeEdit}
                                readOnly={mode == 'view' || isReadOnly}
                                placeHolder="ระบุวันที่"
                                min={watch('doc3_input_shipper_time_event_start_date')}
                                mode={mode}
                                valueShow={watch("doc3_input_shipper_time_event_end_date") ? dayjs(watch("doc3_input_shipper_time_event_end_date")).format("DD/MM/YYYY") : undefined}
                                allowClear
                                isError={!!errors.doc3_input_shipper_time_event_end_date && !watch("doc3_input_shipper_time_event_end_date")}
                                onChange={(e: any) => {
                                    setValue('doc3_input_shipper_time_event_end_date', formatFormDate(e));
                                    if (e == undefined)
                                        setValue('doc3_input_shipper_time_event_end_date', null, { shouldValidate: true, shouldDirty: true });
                                }}
                            />
                        </span>

                        <span className="text-[14px] font-light text-[#58585A]">{`เวลา`}</span>
                        <span className="text-[14px]  w-[200px] text-[#58585A]">
                            <TimePickaForm
                                {...register('doc3_input_shipper_time_event_end_time', { required: false })}
                                // readOnly={mode == 'view' || isStatSubmitAndModeEdit}
                                readOnly={mode == 'view' || isReadOnly}
                                placeHolder="ระบุเวลา"
                                mode={mode}
                                valueShow={watch("doc3_input_shipper_time_event_end_time") || undefined}
                                allowClear
                                isError={!!errors.doc3_input_shipper_time_event_end_time && !watch("doc3_input_shipper_time_event_end_time")}
                                onChange={(e: any) => {
                                    setValue('doc3_input_shipper_time_event_end_time', e);
                                    if (e == undefined)
                                        setValue('doc3_input_shipper_time_event_end_time', null, { shouldValidate: true, shouldDirty: true });
                                }}
                            />
                        </span>
                    </div>
                </div>


                {/* สรุปการแก้ไข */}
                <div className="w-full">
                    <label className={`${labelClass}`}>{`สรุปการแก้ไข`}</label>
                    <TextField
                        {...register("doc3_input_shipper_time_event_summary")}
                        value={watch("doc3_input_shipper_time_event_summary") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 255) {
                                setValue("doc3_input_shipper_time_event_summary", e.target.value);
                            }
                        }}
                        placeholder="ระบุสรุปการแก้ไข"
                        disabled={isReadOnly}
                        rows={2}
                        sx={textFieldSx}
                        className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">
                            {watch("doc3_input_shipper_time_event_summary")?.length || 0} / 255
                        </span>
                    </div>
                </div>
            </div>




            {/* =========================================================================================== */}
            {/* =================================== ส่วนของผู้ให้บริการ ======================================== */}
            {
                !flagAck &&
                <>
                
                {/* shipper ไม่เห็น */}
                {
                    (userDT?.account_manage?.[0]?.user_type_id !== 3 && userDT?.account_manage?.[0]?.user_type_id !== 4) && <>
                        <div className="py-2 pt-4 text-[14px] font-semibold text-[#58585A]">
                            {`ส่วนของผู้ให้บริการ`}
                        </div>
    
                        <div className="flex flex-wrap flex-auto gap-4 pt-4">
    
                            {/* เอกสารเลขที่ */}
                            <div className="w-[250px]">
                                <label htmlFor="event_nember" className={labelClass}>
                                    {`เอกสารเลขที่`}
                                </label>
    
                                <input
                                    id="doc3_input_tso_doc_number"
                                    {...register("doc3_input_tso_doc_number", { required: false })}
                                    type="text"
                                    placeholder="ระบุเอกสารเลขที่"
                                   
                                    // readOnly={(mode == 'edit' && dataOpenDocument?.event_doc_status_id == 1) || mode == 'create' ? false : true} // ถ้าเอกสาร stat == draft ให้เปิดไว้
                                    readOnly={true} 
                                    maxLength={25}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 25) {
                                            setValue('doc3_input_tso_doc_number', e.target.value);
                                        }
                                    }}
                                    className={`text-[14px] border-[1px] border-[#DFE4EA]  bg-white ps-[21px] h-[44px] w-full rounded-lg outline-none bg-opacity-100 focus:border-[#00ADEF] 
                                        ${mode == 'edit' && dataOpenDocument?.event_doc_status_id !== 1 && (dataOpenDocument?.user_type_id !== 3 && dataOpenDocument?.user_type_id !== 4) && '!bg-[#EFECEC]'}
                                    `}
                                />
                            </div>
    
                            {/* ลงวันที่ */}
                            <div className="pb-2 w-[200px]">
                                <label className={labelClass}>{`ลงวันที่`}</label>
                                <DatePickaFormThai
                                    {...register('doc3_input_tso_down_date', { required: false })}
                                    // readOnly={mode == 'view' ? true : false}
                                    // readOnly={mode == 'view' || isStatSubmitAndModeEdit}
                                    // readOnly={mode == 'edit' && dataOpenDocument?.event_doc_status_id == 1 && dataOpenDocument?.user_type_id == 3 ? false : true} // ถ้าคน create เป็น shipper และเอกสาร stat == draft ให้เปิดไว้
                                    // readOnly={mode == 'create' ? false : true}
                                    // readOnly={(mode == 'create') ? false : true}
                                    // readOnly={(mode == 'create' || mode == 'edit') ? false : true}
                                    readOnly={
                                        (
                                            mode == 'edit' &&
                                            (
                                                dataOpenDocument?.event_doc_status_id == 1 ||
                                                (
                                                    (userDT?.account_manage?.[0]?.user_type_id === 2 || userDT?.account_manage?.[0]?.user_type_id === 1) &&
                                                    (!dataOpenDocument?.event_document_action?.some((action: any) => (action.user_type_id == 1 || action.user_type_id == 2) && action.event_doc_status_id == 2))
                                                )
                                            )
                                        ) ||
                                        mode == 'create' ?
                                        false
                                        :
                                        true
                                    }  // ถ้าเอกสาร stat == draft ให้เปิดไว้
                                    placeHolder="ระบุวันที่"
                                    mode={mode}
                                    valueShow={watch("doc3_input_tso_down_date") ? dayjs(watch("doc3_input_tso_down_date")).format("DD/MM/YYYY") : undefined}
                                    allowClear
                                    isError={errors.doc3_input_tso_down_date && !watch("doc3_input_tso_down_date") ? true : false}
                                    onChange={(e: any) => {
                                        setValue('doc3_input_tso_down_date', formatFormDate(e)), e == undefined && setValue('doc3_input_tso_down_date', null, { shouldValidate: true, shouldDirty: true });
                                        setIsTsoEdited(true)
                                    }}
                                />
                            </div>
    
    
                            <div className="pb-2">
                                <label className={labelClass}>{`โดยก๊าซที่ไม่อยู่ในกำหนด TSO Code ได้หมดไปจากระบบก๊าซฯ เมื่อวันที่`}</label>
    
                                <div className="flex flex-wrap flex-auto gap-4 ">
                                    <span className="text-[14px] font-light text-[#58585A] pt-2">{`วันที่`}</span>
                                    <span className="text-[14px] w-[200px] text-[#58585A]">
                                        <DatePickaFormThai
                                            {...register('doc3_input_tso_disapeared_date', { required: false })}
                                            // readOnly={mode == 'view'}
                                            // readOnly={mode == 'view' || isStatSubmitAndModeEdit}
                                            // readOnly={mode == 'edit' && dataOpenDocument?.event_doc_status_id == 1 && dataOpenDocument?.user_type_id == 3 ? false : true} // ถ้าคน create เป็น shipper และเอกสาร stat == draft ให้เปิดไว้
                                            // readOnly={mode == 'create' ? false : true}
                                            // readOnly={(mode == 'create') ? false : true}
                                            // readOnly={(mode == 'create' || mode == 'edit') ? false : true}
                                            readOnly={
                                                (
                                                    mode == 'edit' &&
                                                    (
                                                        dataOpenDocument?.event_doc_status_id == 1 ||
                                                        (
                                                            (userDT?.account_manage?.[0]?.user_type_id === 2 || userDT?.account_manage?.[0]?.user_type_id === 1) &&
                                                            !dataOpenDocument?.event_document_action.some((action: any) => (action.user_type_id == 1 || action.user_type_id == 2) && action.event_doc_status_id == 2)
                                                        )
                                                    )
                                                ) ||
                                                mode == 'create' ?
                                                false
                                                :
                                                true
                                            }  // ถ้าเอกสาร stat == draft ให้เปิดไว้
                                            placeHolder="ระบุวันที่"
                                            mode={mode}
                                            valueShow={watch("doc3_input_tso_disapeared_date") ? dayjs(watch("doc3_input_tso_disapeared_date")).format("DD/MM/YYYY") : undefined}
                                            allowClear
                                            isError={!!errors.doc3_input_tso_disapeared_date && !watch("doc3_input_tso_disapeared_date")}
                                            onChange={(e: any) => {
                                                setIsTsoEdited(true)
                                                setValue('doc3_input_tso_disapeared_date', formatFormDate(e));
                                                if (e == undefined)
                                                    setValue('doc3_input_tso_disapeared_date', null, { shouldValidate: true, shouldDirty: true });
                                            }}
                                        />
                                    </span>
    
                                    <span className="text-[14px] font-light text-[#58585A] pt-2">{`เวลา`}</span>
                                    <span className="text-[14px]  w-[200px] text-[#58585A]">
                                        <TimePickaForm
                                            {...register('doc3_input_tso_disapeared_time', { required: false })}
                                            // readOnly={mode == 'view'}
                                            // readOnly={mode == 'view' || isStatSubmitAndModeEdit}
                                            // readOnly={mode == 'edit' && dataOpenDocument?.event_doc_status_id == 1 && dataOpenDocument?.user_type_id == 3 ? false : true} // ถ้าคน create เป็น shipper และเอกสาร stat == draft ให้เปิดไว้
                                            // readOnly={mode == 'create' ? false : true}
                                            // readOnly={(mode == 'create') ? false : true}
                                            // readOnly={(mode == 'create' || mode == 'edit') ? false : true}
                                            readOnly={
                                                (
                                                    mode == 'edit' &&
                                                    (
                                                        dataOpenDocument?.event_doc_status_id == 1 ||
                                                        (
                                                            (userDT?.account_manage?.[0]?.user_type_id === 2 || userDT?.account_manage?.[0]?.user_type_id === 1) &&
                                                            !dataOpenDocument?.event_document_action.some((action: any) => (action.user_type_id == 1 || action.user_type_id == 2) && action.event_doc_status_id == 2)
                                                        )
                                                    )
                                                ) ||
                                                mode == 'create' ?
                                                false
                                                :
                                                true
                                            }  // ถ้าเอกสาร stat == draft ให้เปิดไว้
                                            placeHolder="ระบุเวลา"
                                            mode={mode}
                                            valueShow={watch("doc3_input_tso_disapeared_time") || undefined}
                                            allowClear
                                            isError={!!errors.doc3_input_tso_disapeared_time && !watch("doc3_input_tso_disapeared_time")}
                                            onChange={(e: any) => {
                                                setIsTsoEdited(true)
                                                setValue('doc3_input_tso_disapeared_time', e);
                                                if (e == undefined)
                                                    setValue('doc3_input_tso_disapeared_time', null, { shouldValidate: true, shouldDirty: true });
                                            }}
                                        />
                                    </span>
                                </div>
    
                            </div>
                        </div>
                    </>
                }
    
    
                {/* Edit / View Shipper จะต้องเห็น ส่วนของผู้ให้บริการด้วย (เห็นอย่างเดียว แก้ไขไม่ได้) ส่วนหน้า New ไม่มีเหมือนเดิม https://app.clickup.com/t/86eum0nuu */}
                {
                    (userDT?.account_manage?.[0]?.user_type_id == 3 || userDT?.account_manage?.[0]?.user_type_id == 4) && mode !== 'create' && <>
                        <div className="py-2 pt-4 text-[14px] font-semibold text-[#58585A]">
                            {`ส่วนของผู้ให้บริการ`}
                        </div>
    
                        <div className="flex flex-wrap flex-auto gap-4 pt-4">
    
                            {/* เอกสารเลขที่ */}
                            <div className="w-[250px]">
                                <label htmlFor="event_nember" className={labelClass}>
                                    {`เอกสารเลขที่`}
                                </label>
    
                                <input
                                    id="doc3_input_tso_doc_number"
                                    {...register("doc3_input_tso_doc_number", { required: false })}
                                    type="text"
                                    placeholder="ระบุเอกสารเลขที่"
                                    readOnly={true}
                                    maxLength={25}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 25) {
                                            setValue('doc3_input_tso_doc_number', e.target.value);
                                        }
                                    }}
                                    className={`text-[14px] border-[1px] border-[#DFE4EA]  bg-white ps-[21px] h-[44px] w-full rounded-lg outline-none bg-opacity-100 focus:border-[#00ADEF] 
                                        ${mode == 'edit' && dataOpenDocument?.event_doc_status_id !== 1 && (dataOpenDocument?.user_type_id !== 3 && dataOpenDocument?.user_type_id !== 4) && '!bg-[#EFECEC]'}
                                    `}
                                />
                            </div>
    
                            {/* ลงวันที่ */}
                            <div className="pb-2 w-[200px]">
                                <label className={labelClass}>{`ลงวันที่`}</label>
                                <DatePickaFormThai
                                    {...register('doc3_input_tso_down_date', { required: false })}
                                    readOnly={true}
                                    placeHolder="ระบุวันที่"
                                    mode={mode}
                                    valueShow={watch("doc3_input_tso_down_date") ? dayjs(watch("doc3_input_tso_down_date")).format("DD/MM/YYYY") : undefined}
                                    allowClear
                                    isError={errors.doc3_input_tso_down_date && !watch("doc3_input_tso_down_date") ? true : false}
                                    onChange={(e: any) => {
                                        setValue('doc3_input_tso_down_date', formatFormDate(e)), e == undefined && setValue('doc3_input_tso_down_date', null, { shouldValidate: true, shouldDirty: true });
                                        setIsTsoEdited(true)
                                    }}
                                />
                            </div>
    
    
                            <div className="pb-2">
                                <label className={labelClass}>{`โดยก๊าซที่ไม่อยู่ในกำหนด TSO Code ได้หมดไปจากระบบก๊าซฯ เมื่อวันที่`}</label>
    
                                <div className="flex flex-wrap flex-auto gap-4 ">
                                    <span className="text-[14px] font-light text-[#58585A] pt-2">{`วันที่`}</span>
                                    <span className="text-[14px] w-[200px] text-[#58585A]">
                                        <DatePickaFormThai
                                            {...register('doc3_input_tso_disapeared_date', { required: false })}
                                            readOnly={true}
                                            placeHolder="ระบุวันที่"
                                            mode={mode}
                                            valueShow={watch("doc3_input_tso_disapeared_date") ? dayjs(watch("doc3_input_tso_disapeared_date")).format("DD/MM/YYYY") : undefined}
                                            allowClear
                                            isError={!!errors.doc3_input_tso_disapeared_date && !watch("doc3_input_tso_disapeared_date")}
                                            onChange={(e: any) => {
                                                setIsTsoEdited(true)
                                                setValue('doc3_input_tso_disapeared_date', formatFormDate(e));
                                                if (e == undefined)
                                                    setValue('doc3_input_tso_disapeared_date', null, { shouldValidate: true, shouldDirty: true });
                                            }}
                                        />
                                    </span>
    
                                    <span className="text-[14px] font-light text-[#58585A] pt-2">{`เวลา`}</span>
                                    <span className="text-[14px]  w-[200px] text-[#58585A]">
                                        <TimePickaForm
                                            {...register('doc3_input_tso_disapeared_time', { required: false })}
                                            readOnly={true}
                                            placeHolder="ระบุเวลา"
                                            mode={mode}
                                            valueShow={watch("doc3_input_tso_disapeared_time") || undefined}
                                            allowClear
                                            isError={!!errors.doc3_input_tso_disapeared_time && !watch("doc3_input_tso_disapeared_time")}
                                            onChange={(e: any) => {
                                                setIsTsoEdited(true)
                                                setValue('doc3_input_tso_disapeared_time', e);
                                                if (e == undefined)
                                                    setValue('doc3_input_tso_disapeared_time', null, { shouldValidate: true, shouldDirty: true });
                                            }}
                                        />
                                    </span>
                                </div>
    
                            </div>
                        </div>
                    </>
                }
    
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
                    mode == 'create' &&
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

                {/* เลือก shipper && Email Group */}
                {
                    (userDT?.account_manage?.[0]?.user_type_id !== 3 && userDT?.account_manage?.[0]?.user_type_id !== 4) && (mode == 'create' || mode == 'edit') &&
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
                                    // return selected.map((id) => shipperData?.find((item: any) => item.id === id)?.name).join(", ");
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

                                {(userDT?.account_manage?.[0]?.user_type_id !== 3 && userDT?.account_manage?.[0]?.user_type_id !== 4) && (
                                    <MenuItem value="all">
                                        <Checkbox checked={selectedShippers.length === shipperData.length && shipperData.length > 0} />
                                        <ListItemText
                                            primary="Select All"
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
                                {(defaultShippersRender || [])?.filter((f:any) => f?.id !== dataOpenDocument?.create_by_account?.account_manage?.[0]?.group_id)?.map((item: any, index: number) => {
                                    // dataOpenDocument?.create_by_account?.account_manage?.[0]?.group_id
                                    return (
                                    <div
                                        key={`default-${index}`}
                                        className="relative w-fit h-[40px] p-2 text-[14px] bg-[#CFF2FF] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                    >
                                        {item?.name}
                                    </div>
                                )
                                })}

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
                                        primaryTypographyProps={{ sx: { fontWeight: 'bold', fontSize: "14px" } }}
                                    />
                                </MenuItem>

                                {emailGroupForEventData
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
                    (userDT?.account_manage?.[0]?.user_type_id !== 3 && userDT?.account_manage?.[0]?.user_type_id !== 4) && (mode == 'create' || mode == 'edit') &&
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
                                        setIsTsoEdited(true)
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
                                    emailGroup && emailGroup?.map((item: any, index: number) => (
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
                {/* 
                    event_runnumber.event_document = เอามาใส่ใน table ของ doc2
                    ใช้กับ select shipper เพื่อเช็คไม่ให้ลบอันที่มีอยู่แล้ว ด้วย 
                */}
                {
                    (userDT?.account_manage?.[0]?.user_type_id !== 3 && userDT?.account_manage?.[0]?.user_type_id !== 4) && (mode == 'edit' || mode == 'view') && <div className="pt-2"><TableDocument3 tableData={dataTable?.filter((f:any) => f?.group_id !== dataOpenDocument?.create_by_account?.account_manage?.[0]?.group_id)} dataOpenDocument={dataOpenDocument} /></div>
                }
                </>
            }



            {/* 
                ถ้า userDT?.account_manage?.[0]?.user_type_id === 3 และ dataOpenDocument.event_doc_status_id == 1 จะไม่เห็น

                กรณีไม่เห็นปุ่ม
                1. case userDT?.account_manage?.[0]?.user_type_id === 3 และ dataOpenDocument.event_doc_status_id == 1
                2. case userDT?.account_manage?.[0]?.user_type_id === 3 และ dataOpenDocument.event_doc_status_id == 5 
            */}

            {(() => {
                // const shouldHideButton = userDT?.account_manage?.[0]?.user_type_id === 3 && (dataOpenDocument?.event_doc_status_id === 1 || dataOpenDocument?.event_doc_status_id === 5);
                const shouldHideButton = (userDT?.account_manage?.[0]?.user_type_id === 3 || userDT?.account_manage?.[0]?.user_type_id === 4) && (dataOpenDocument?.event_doc_status_id === 5);
                const isTsoSubmitAfterShipperCreateDoc3 = dataOpenDocument?.event_document_action?.some((action: any) => (action.user_type_id == 1 || action.user_type_id == 2) && action.event_doc_status_id == 2)
                if(
                    (
                        (userDT?.account_manage?.[0]?.user_type_id === 3 || userDT?.account_manage?.[0]?.user_type_id === 4) &&
                        (dataOpenDocument?.event_doc_status_id === 5 || dataOpenDocument?.event_doc_status_id === 2)
                    ) &&
                    userDT?.account_manage?.[0]?.group_id === dataOpenDocument?.create_by_account?.account_manage?.[0]?.group_id &&
                    !isTsoSubmitAfterShipperCreateDoc3 // ถ้า TSO ส่งหลังจาก Shipper สร้าง doc 3 Shipper คนที่สร้าง doc 3 จะต้องเห็นปุ่ม acknowledge
                ){
                    return <></>
                }else{

                    const isTsoCanAcknowledgeWhenNotHaveDoc2 =  mode != 'create' && !tsoCreateDraft && !shipperCreateDraft && flagAck && dataOpenDocument?.event_doc_status_id != 5;
                    return (
                        <div className="flex justify-end pt-8">
                            {mode !== 'view' && !shouldHideButton && (
                                <button
                                    type="submit"
                                    className="w-[167px] h-[44px] font-semibold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    // disabled={false}
                                    disabled={
                                        (dataOpenDocument?.event_doc_status_id === 1 || isTsoCanAcknowledgeWhenNotHaveDoc2)
                                        ? false 
                                        :
                                        !(
                                        (userDT?.account_manage?.[0]?.user_type_id === 3 || userDT?.account_manage?.[0]?.user_type_id === 4) || (mode === 'edit' && isTsoEdited) || mode === 'create' // Edit : ถ้าไม่มีข้อมูลอะไร update ให้ disable ปุ่ม save ไว้ https://app.clickup.com/t/86eupj5ug
                                    )}
                                >
                                    {mode === 'create' ? 'Save Darft' : ( (tsoCreateDraft && flagAck) ? "Acknowledge" : (shipperCreateDraft || tsoCreateDraft) ? "Submit" : (flagAck ? "Acknowledge" : ((userDT?.account_manage?.[0]?.user_type_id === 3 || userDT?.account_manage?.[0]?.user_type_id === 4) && (dataOpenDocument?.event_doc_status_id === 5 || dataOpenDocument?.event_doc_status_id === 2)) ? ('Acknowledge') : 'Save'))}
                                </button>
                            )}
                        </div>
                    )
                }

            })()}
            {/* (userDT?.account_manage?.[0]?.user_type_id === 3 && (dataOpenDocument?.event_doc_status_id === 5 || dataOpenDocument?.event_doc_status_id === 2)) && userDT?.account_manage?.[0]?.group_id === dataOpenDocument?.create_by_account?.account_manage?.[0]?.group_id */}



            {/* 
            <div className="flex justify-end pt-8">
                {mode !== 'view' && (
                    <button
                        type="submit"
                        className="w-[167px] font-semibold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={false}
                    >
                        {mode === 'create' ? 'Submit' : userDT?.account_manage?.[0]?.user_type_id === 3 ? 'Acknowledge' : 'Save'}
                    </button>
                )}
            </div> */}
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
            // title="Confirm Save"
            title={mode == 'create' ? "Confirm Submission" : "Confirm Save"}
            description={
                            mode == 'create' ?
                                <div className=" w-full">
                                    {
                                        dataPDFItem &&
                                        <PdfDoc3 data={dataPDFItem} />
                                    }
                                    <div className="text-center">
                                        {`Do you want to submit now ?`}
                                    </div>
                                </div >
                                :
                                <div className=" w-full">
                                    {
                                        dataPDFItem &&
                                        <PdfDoc3 data={dataPDFItem} />
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

export default FormDocument3;