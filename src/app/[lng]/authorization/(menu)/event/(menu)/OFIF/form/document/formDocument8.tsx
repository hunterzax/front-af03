import { useEffect, useState } from "react";
import { convertTimeStringToDate, cutUploadFileName, formatFormDate } from '@/utils/generalFormatter';
import dayjs from 'dayjs';
import { SubmitHandler, useForm } from "react-hook-form";
import ModalConfirmSave from "@/components/other/modalConfirmSave";
import { Checkbox, ListItemText, MenuItem, Select, TextField, Typography } from "@mui/material";
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DatePickaFormThai from "@/components/library/dateRang/dateSelectFormThai";
import { uploadFileService } from "@/utils/postService";
import SelectFormProps from "@/components/other/selectProps";
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TimePickaForm from "@/components/library/dateRang/timePickerForm";
import TableDocument8 from "../tableInDocument8";

import axios from "axios";
import { PdfDoc8 } from "@/components/other/pdf_event/docEvent";


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

// key ใน DB ตามฟอร์ม
// "ref_document": 22,         // id runnumber
// "longdo_dict": "ส่วนบริการสัญญาระบบท่อส่งก๊าซ (Transmission Contracts & Regulatory Management Division โทร 025372000,35063)", //สำเนา
// "event_date": "2025-08-01", // วันที่ออกเอกสาร

// "doc_8_input_ref_doc_at": "บค.บคต./115/2567",   // doc8 ตามเอกสารเลขที่
// "doc_8_input_date": "2025-08-05",               // doc8 วันที่และเวลา วัน
// "doc_8_input_time": "15:00",                    // doc8 วันที่และเวลา เวลา
// "doc_8_input_summary": "กลับสู่สภาวะปกติ",          // doc8 สรุปการแก้ปัญหา
// "doc_8_input_summary_gas": "ด้านคุณภาพก๊าซหลุดกรอบ", // doc8 สรุปผลกระทบด้านปริมาณและด้านคุณภาพก๊าซ
// "doc_8_input_more": null,                       // doc8 ข้อมูลเพิ่มเติม

const FormDocument8: React.FC<FormExampleProps> = ({ mode, data, onSubmit, setIsOpenDocument, dataOpenDocument, modeOpenDocument, userDT, shipperData, emailGroupForEventData, refDocData }) => {
    const [dataPDFItem, setdataPDFItem] = useState<any>(null)
    
    const { control, register, handleSubmit, setValue, reset, clearErrors, formState: { errors }, watch, } = useForm<any>({ defaultValues: data, });
    const [tk, settk] = useState<boolean>(false); // ของคุ้นเคย
    const { onChange, ...restEmail } = register("email"); // register email

    const [fileName, setFileName] = useState('Maximum File 10 MB');
    const [fileUpload, setFileUpload] = useState<any>();
    const [fileUrl, setFileUrl] = useState<any>('');
    const [isUploading, setIsUploading] = useState(false);


    const [shipperArr, setShipperArr] = useState<any []>([
        {
            seq_doc8_shipper: 1,
            flag_dis: false,
            not_del: true,
            ix: +new Date,
            "doc_8_input_date": "", //doc8 วันที่และเวลา วัน
            "doc_8_input_time": "", //doc8 วันที่และเวลา เวลา
            "doc_8_input_summary": "", //doc8 สรุปการแก้ปัญหา
            "doc_8_input_summary_gas": "", //doc8 สรุปผลกระทบด้านปริมาณและด้านคุณภาพก๊าซ
            "doc_8_input_more": "", //doc8 ข้อมูลเพิ่มเติม
            "file": null,
            "shipper": [],
        },
    ])

    useEffect(() => {
      console.log('shipperArr : ', shipperArr);
    }, [shipperArr])
    

    const addDataShipper = async () => {
        setShipperArr((pre:any) => {
            console.log('pre?.length : ', pre?.length);
            console.log('pre?.length + 1 : ', pre?.length + 1);
            return [...pre, {
                seq_doc8_shipper: pre?.length + 1,
                flag_dis: false,
                not_del: false,
                ix: +new Date,
                "doc_8_input_date": "", //doc8 วันที่และเวลา วัน
                "doc_8_input_time": "", //doc8 วันที่และเวลา เวลา
                "doc_8_input_summary": "", //doc8 สรุปการแก้ปัญหา
                "doc_8_input_summary_gas": "", //doc8 สรุปผลกระทบด้านปริมาณและด้านคุณภาพก๊าซ
                "doc_8_input_more": "", //doc8 ข้อมูลเพิ่มเติม
                "file": null,
                "shipper": [],
            }]
        })
    }

    const removeDataShipper = async (ix:any) => {
        setShipperArr((pre:any) => {
            return pre?.filter((f:any) => f?.ix !== ix)
        })
    }

    const [headerFormText, setHeaderFormText] = useState('');
    const [fileNameEditText, setFileNameEditText] = useState(''); // เอาไว้แสดงชื่อไฟล์ตอนเข้ามา view หรือ edit
    const [fileNameEditTextUrl, setFileNameEditUrl] = useState(''); // เอาไว้กดโหลดตอนเข้ามา view หรือ edit
    const [documentId, setDocumentId] = useState(''); // ID ของ Document 2

    const modeDraft = dataOpenDocument?.event_doc_status_id === 1 ? true : false
    const isShipper = (userDT?.account_manage?.[0]?.user_type_id === 3 || userDT?.account_manage?.[0]?.user_type_id === 4) ? true : false;
    // const isReadOnly = mode === "view" || mode == 'edit';
    const isReadOnly = modeDraft ? false : (mode === "view" || mode == 'edit');

    const [isTsoEdited, setIsTsoEdited] = useState<boolean>(false);

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

    // #region DATA on load
    useEffect(() => {

      

        let text_header: any = 'สร้างเอกสารแจ้งสิ้นสุดคำสั่งเพิ่ม/ลดปริมาณก๊าซ (Doc 8)'
        switch (modeOpenDocument) {
            case 'view':
                text_header = 'ดูข้อมูลเอกสารแจ้งสิ้นสุดคำสั่งเพิ่ม/ลดปริมาณก๊าซ (Doc 8)'
                break;
            case 'edit':
                text_header = 'แก้ไขเอกสารแจ้งสิ้นสุดคำสั่งเพิ่ม/ลดปริมาณก๊าซ (Doc 8)'
                break;
        }
        setHeaderFormText(text_header)
        // setDocumentId(dataOpenDocument?.document1?.id)
        setDocumentId(dataOpenDocument?.id)

        if (modeOpenDocument == 'edit' || modeOpenDocument == 'view') {
            setValue('ref_document', dataOpenDocument?.event_runnumber_ofo_id)
            setValue('longdo_dict', dataOpenDocument?.longdo_dict)
            setValue('event_date', dataOpenDocument?.event_date)

            // set ชื่อ shipper กลับที่เดิม
            const groupIds = dataOpenDocument?.event_runnumber_ofo?.event_document_ofo?.map((item: any) => item.group_id);
            const filteredShippers = shipperData?.filter((item: any) => groupIds?.includes(item.id));
            const defaultIds = filteredShippers?.map((s: any) => s.id); // เอา id 
            // setDefaultShippersRender(filteredShippers); // ลบไม่ได้
            // setDefaultShippersId(defaultIds) // ลบไม่ได้

            // set email group กลับที่เดิม
            const emailGroupForEventIds = dataOpenDocument?.event_document_ofo_email_group_for_event?.map((item: any) => item.edit_email_group_for_event_id);
            const filter_email_group_for_event = emailGroupForEventData?.filter((item: any) => emailGroupForEventIds?.includes(item?.id))
            const defaultEmailGroupIds = filter_email_group_for_event?.map((s: any) => s.id); // เอา id 

            // set CC email กลับที่เดิม
            const ccEmail = dataOpenDocument?.event_document_ofo_cc_email?.map((item: any) => item.email);

            if(modeDraft){
                // setSelectedShippersRender(filteredShippers)
                // setSelectedShippers(filteredShippers?.map((e:any) => e?.id));

                setSelectedEmailGroupRender(filter_email_group_for_event)
                setSelectedEmailGroup(defaultEmailGroupIds)
                
                setValue("email_arr", ccEmail)
                setEmailGroup(ccEmail)

            }else{

                // setDefaultShippersRender(filteredShippers); // ลบไม่ได้
                // setDefaultShippersId(defaultIds) // ลบไม่ได้
                
                setDefaultEmailGroupRender(filter_email_group_for_event) // ลบไม่ได้
                setDefaultEmailGrouId(defaultEmailGroupIds) // ลบไม่ได้
                
                setDefaultCcEmailRender(ccEmail)  // ลบไม่ได้
            }

            // ข้อมูลในตารางข้างล่าง
            // setDataTable(dataOpenDocument?.event_runnumber_ofo?.event_document_ofo)
            // setDataTable(dataOpenDocument?.history_table_inside)
            const filter_only_own_doc = dataOpenDocument?.history_table_inside?.filter((item:any) => item?.event_doc_master_id == 8) // 3.9 == 309, 4 == 41
            // setDataTable(modeOpenDocument == 'edit' ? dataOpenDocument?.event_runnumber_ofo?.event_document_ofo : filter_only_own_doc)
            setDataTable(modeOpenDocument == 'edit' ? dataOpenDocument?.event_runnumber_ofo?.event_document_ofo : filter_only_own_doc?.length > 0 ? filter_only_own_doc : dataOpenDocument?.event_runnumber_ofo?.event_document_ofo)

            // SET ข้อมูลลงฟอร์มนะ
            setValue('doc_8_input_ref_doc_at', dataOpenDocument?.doc_8_input_ref_doc_at) // doc8 ตามเอกสารเลขที่
            setValue('doc_8_input_date', dataOpenDocument?.doc_8_input_date) // doc8 วันที่และเวลา วัน
            setValue('doc_8_input_time', dataOpenDocument?.doc_8_input_time ? convertTimeStringToDate(dataOpenDocument?.doc_8_input_time) : null) // doc8 วันที่และเวลา เวลา
            setValue('doc_8_input_summary', dataOpenDocument?.doc_8_input_summary) // doc8 สรุปการแก้ปัญหา
            setValue('doc_8_input_summary_gas', dataOpenDocument?.doc_8_input_summary_gas) // doc8 สรุปผลกระทบด้านปริมาณและด้านคุณภาพก๊าซ
            setValue('doc_8_input_more', dataOpenDocument?.doc_8_input_more) // doc8 ข้อมูลเพิ่มเติม

            setFileNameEditText(dataOpenDocument?.event_document_ofo_file?.length > 0 ? cutUploadFileName(dataOpenDocument?.event_document_ofo_file[0]?.url) : '')
            setFileNameEditUrl(dataOpenDocument?.event_document_ofo_file?.length > 0 ? dataOpenDocument?.event_document_ofo_file[0]?.url : '')
        }

       
    }, [mode, dataOpenDocument, shipperData, emailGroupForEventData])

    useEffect(() => {
        if(dataOpenDocument){
            if((modeDraft || modeOpenDocument == 'edit' || modeOpenDocument == 'view')){
                
                if(isShipper){
                    const doc_8_input_time = dataOpenDocument?.doc_8_input_time ? dayjs(dataOpenDocument?.doc_8_input_time, "HH:mm").toDate() : null
                    const sp =  {
                        seq_doc8_shipper: dataOpenDocument?.seq_doc8_shipper,
                        flag_dis: false,
                        not_del: true,
                        ix: +new Date + 1,
                        "doc_8_input_date": dataOpenDocument?.doc_8_input_date, //doc8 วันที่และเวลา วัน
                        "doc_8_input_time": doc_8_input_time, //doc8 วันที่และเวลา เวลา
                        "doc_8_input_summary": dataOpenDocument?.doc_8_input_summary, //doc8 สรุปการแก้ปัญหา
                        "doc_8_input_summary_gas": dataOpenDocument?.doc_8_input_summary_gas, //doc8 สรุปผลกระทบด้านปริมาณและด้านคุณภาพก๊าซ
                        "doc_8_input_more": dataOpenDocument?.doc_8_input_more, //doc8 ข้อมูลเพิ่มเติม
                        "file": null,
                        "shipper": [dataOpenDocument?.group_id],
                        event_doc_status_id: dataOpenDocument?.event_doc_status_id
                    }
                  
                    setShipperArr([sp])

                }else{
                    const shipperArrData = (dataOpenDocument?.event_runnumber_ofo?.event_document_ofo)?.map((e:any, ix:number) => {
                         const doc_8_input_time = e?.doc_8_input_time ? dayjs(e?.doc_8_input_time, "HH:mm").toDate() : null
                         return {
                             seq_doc8_shipper: e?.seq_doc8_shipper,
                             flag_dis: false,
                             not_del: true,
                             ix: +new Date + ix,
                             "doc_8_input_date": e?.doc_8_input_date, //doc8 วันที่และเวลา วัน
                             "doc_8_input_time": doc_8_input_time, //doc8 วันที่และเวลา เวลา
                             "doc_8_input_summary": e?.doc_8_input_summary, //doc8 สรุปการแก้ปัญหา
                             "doc_8_input_summary_gas": e?.doc_8_input_summary_gas, //doc8 สรุปผลกระทบด้านปริมาณและด้านคุณภาพก๊าซ
                             "doc_8_input_more": e?.doc_8_input_more, //doc8 ข้อมูลเพิ่มเติม
                             "file": null,
                             "shipper": [e?.group_id],
                             event_doc_status_id: e?.event_doc_status_id
                         }
                    })
                    const groupedData = Object.values(
                     shipperArrData.reduce((acc: any, item: any) => {
                         const key = item.seq_doc8_shipper;
     
                         if (!acc[key]) {
                         acc[key] = {
                             ...item,
                             shipper: [...(item.shipper ?? [])],
                         };
                         } else {
                         acc[key].shipper = [
                             ...(acc[key].shipper ?? []),
                             ...(item.shipper ?? []),
                         ];
                         }
     
                         return acc;
                     }, {})
                     );
        
                    setShipperArr(groupedData)

                }
           }
        }

    }, [mode, dataOpenDocument, isShipper])
    

    // #region Confirm Save
    {/* Confirm Save */ }
    const handleSaveConfirm = async (data?: any) => {
        const shipperArr_ = shipperArr?.map((e:any) => {
            return {
                ...e,
                "doc_8_input_time": e?.doc_8_input_time ? dayjs(e?.doc_8_input_time).format('HH:mm') : '',
                file: e?.file ? [e?.file] : []
            }
        })
        if (mode == 'create') {
            // const payload_tso_create = {
            //     "ref_document": watch('ref_document'), // id runnumber
            //     // "longdo_dict": data?.longdo_dict, //สำเนา
            //     "longdo_dict": watch('longdo_dict'), //สำเนา
            //     "event_date": dayjs(watch('event_date')).format("YYYY-MM-DD"), // วันที่ออกเอกสาร

            //     "doc_8_input_ref_doc_at": data?.doc_8_input_ref_doc_at, //doc8 ตามเอกสารเลขที่
            //     "doc_8_input_date": watch('doc_8_input_date') ? dayjs(watch('doc_8_input_date')).format("YYYY-MM-DD") : '', //doc8 วันที่และเวลา วัน
            //     "doc_8_input_time": data?.doc_8_input_time ? dayjs(data?.doc_8_input_time).format('HH:mm') : '', //doc8 วันที่และเวลา เวลา
            //     "doc_8_input_summary": data?.doc_8_input_summary, //doc8 สรุปการแก้ปัญหา
            //     "doc_8_input_summary_gas": data?.doc_8_input_summary_gas, //doc8 สรุปผลกระทบด้านปริมาณและด้านคุณภาพก๊าซ
            //     "doc_8_input_more": data?.doc_8_input_more, //doc8 ข้อมูลเพิ่มเติม

            //     "file": fileUrl !== '' ? [fileUrl] : [],
            //     "shipper": selectedShippers,
            //     "email_event_for_shipper": selectedEmailGroup,
            //     "cc_email": emailGroup
            // }

            const payload_tso_create = {
                "ref_document": watch('ref_document'), // id runnumber
                "longdo_dict": watch('longdo_dict'), //สำเนา
                "event_date": dayjs(watch('event_date')).format("YYYY-MM-DD"), // วันที่ออกเอกสาร
                "doc_8_input_ref_doc_at": data?.doc_8_input_ref_doc_at, //doc8 ตามเอกสารเลขที่

                // "doc_8_input_date": watch('doc_8_input_date') ? dayjs(watch('doc_8_input_date')).format("YYYY-MM-DD") : '', //doc8 วันที่และเวลา วัน
                // "doc_8_input_time": data?.doc_8_input_time ? dayjs(data?.doc_8_input_time).format('HH:mm') : '', //doc8 วันที่และเวลา เวลา
                // "doc_8_input_summary": data?.doc_8_input_summary, //doc8 สรุปการแก้ปัญหา
                // "doc_8_input_summary_gas": data?.doc_8_input_summary_gas, //doc8 สรุปผลกระทบด้านปริมาณและด้านคุณภาพก๊าซ
                // "doc_8_input_more": data?.doc_8_input_more, //doc8 ข้อมูลเพิ่มเติม
                // "file": fileUrl !== '' ? [fileUrl] : [],
                // "shipper": selectedShippers,


                "email_event_for_shipper": selectedEmailGroup,
                "cc_email": emailGroup,
                shipperArr: shipperArr_ || []
            }

            setdataPDFItem({userDT:userDT, dataOpenDocument: dataOpenDocument, data:[{item:{...data, ...payload_tso_create,}, data: data}], shipperData: shipperData})


            // "doc_8_input_time": data?.doc_8_input_time ? dayjs(data?.doc_8_input_time).format('HH:mm') : '',
         
            setDataSubmit(payload_tso_create)
            setModaConfirmSave(true)

        } else {
            let data_post_na: any = {}
            if (!isShipper) {
                // mode edit tso
                // data_post_na = {
                //     "document_id": documentId, // เอาไว้ใช้เส้น POST event/ofo/doc8/edit/${id}
                //     "longdo_dict": dataOpenDocument?.longdo_dict,
                //     "event_date": dataOpenDocument?.event_date,

                //     "doc_8_input_ref_doc_at": dataOpenDocument?.doc_8_input_ref_doc_at, //doc8 ตามเอกสารเลขที่
                //     "doc_8_input_date": dataOpenDocument?.doc_8_input_date, //doc8 วันที่และเวลา วัน
                //     "doc_8_input_time": dataOpenDocument?.doc_8_input_time ? dataOpenDocument?.doc_8_input_time : null, //doc8 วันที่และเวลา เวลา
                //     "doc_8_input_summary": dataOpenDocument?.doc_8_input_summary, //doc8 สรุปการแก้ปัญหา
                //     "doc_8_input_summary_gas": dataOpenDocument?.doc_8_input_summary_gas, //doc8 สรุปผลกระทบด้านปริมาณและด้านคุณภาพก๊าซ
                //     "doc_8_input_more": dataOpenDocument?.doc_8_input_more, //doc8 ข้อมูลเพิ่มเติม

                //     "file": fileUrl !== '' ? [fileUrl] : [fileNameEditTextUrl], // ส่งมาแค่ 1 ถ้า หน้าบ้านอัพโหลด ส่าง url ใหม่ ถ้าไม่อัพส่ง url เก่ามา
                //     "shipper": Array.from(new Set([
                //         ...selectedShippers,
                //         ...defaultShippersId,
                //     ])),
                //     "email_event_for_shipper": Array.from(new Set([
                //         ...selectedEmailGroup,
                //         ...defaultEmailGrouId,
                //     ])),
                //     "cc_email": Array.from(new Set([
                //         ...emailGroup,
                //         ...defaultCcEmailRender,
                //     ]))
                // }
                data_post_na = {
                    "document_id": documentId, // เอาไว้ใช้เส้น POST event/ofo/doc8/edit/${id}
                    "longdo_dict": dataOpenDocument?.longdo_dict,
                    "event_date": dataOpenDocument?.event_date,
                    "doc_8_input_ref_doc_at": dataOpenDocument?.doc_8_input_ref_doc_at, //doc8 ตามเอกสารเลขที่

                    "email_event_for_shipper": Array.from(new Set([
                        ...selectedEmailGroup,
                        ...defaultEmailGrouId,
                    ])),
                    "cc_email": Array.from(new Set([
                        ...emailGroup,
                        ...defaultCcEmailRender,
                    ])),
                    shipperArr: shipperArr_ || []
                }
            } else {
                // mode edit shipper
                data_post_na = {
                    "document_id": documentId, // เอาไว้ใช้เส้น PUT event/emer/doc5/${id}
                    "event_doc_status_id": 5,
                }
            }
            setdataPDFItem({userDT:userDT, dataOpenDocument: dataOpenDocument, data:[{item:{...data, ...data_post_na,}, data: data}], shipperData: shipperData})

            setDataSubmit(data_post_na)
            setModaConfirmSave(true)
        }
    }

    // #region UPLOAD FILE
    // ############# UPLOAD FILE #############

    const handleFileChange = async (e: any) => {
        setIsLoading(true);
        let url = null
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
            
            // # test
            // const formData = new FormData();
            // formData.append('file', file);
            // const { data: response }: any = await axios.post(`http://34.87.62.61:8010/files/uploadfile/`, formData, {
            //     headers: { "content-type": "multipart/form-data" },
            //     timeout: 600000
            // })

            setFileName(file.name);
            setFileUpload(file);
            setFileUrl(response?.file?.url);
            url = response?.file?.url


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
        return url
    };

    const handleRemoveFile = () => {
        setFileName("Maximum File 10 MB"); // Reset fileName
        setFileUpload(undefined);
        setValue('file', null);
        // setFileUrl('')
    };

    // #region DOWNLOAD FILE
    // ############# DOWNLOAD FILE #############
    // const downloadFile = async () => {
    //     try {
    //         const response = await fetch(fileNameEditTextUrl);
    //         const blob = await response.blob();
    //         const url = URL.createObjectURL(blob);
    //         const fileName = fileNameEditTextUrl.split('/').pop() || 'image.jpg';

    //         const link = document.createElement('a');
    //         link.href = url;
    //         link.download = fileName;
    //         link.style.display = 'none';

    //         document.body.appendChild(link);
    //         link.click();
    //         document.body.removeChild(link);
    //         URL.revokeObjectURL(url);
    //     } catch (error) {
    //         // Error downloading image:
    //     }
    // };
    const downloadFile = async (url:any) => {
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
        setIsTsoEdited(true)
        const value = event.target.value;

        if (value.includes("all")) {

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

    // #region EMAIL GROUP SELECT
    // ############# EMAIL GROUP SELECT #############
    const [selectedEmailGroup, setSelectedEmailGroup] = useState<string[]>([]);
    const [selectedEmailGroupRender, setSelectedEmailGroupRender] = useState<any[]>([]);

    const handleSelectEmailGroup = (event: any) => {
        setIsTsoEdited(true)
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
            <div className="flex gap-4 pt-4">
                <div className="w-[360px]">
                    <label htmlFor="event_nember" className={labelClass}>
                        <span className="text-red-500">*</span>
                        {`อ้างอิงจากเอกสารคำสั่งเพิ่ม/ลดปริมาณก๊าซ (Doc 7)`}
                    </label>

                    {
                        mode == 'create' ?
                            <SelectFormProps
                                id={'ref_document'}
                                register={register("ref_document", { required: false })}
                                disabled={mode == 'edit' ? true : false}
                                valueWatch={watch("ref_document") || ""}
                                handleChange={(e) => {
                                    setValue("ref_document", e.target.value);
                                    const find_doc_data = refDocData?.find((item: any) => item?.id == e.target.value)
                                    setValue("longdo_dict", find_doc_data?.event_document_ofo?.[0]?.longdo_dict); // สำเนาจาก doc7
                                    setValue("event_date", find_doc_data?.event_date); // ใส่วันที่จาก doc7


                                    // New : ตอนเลือก Ref Doc 3.9 ข้อมูล Shipper / Email Group / CC Mail ต้องดึงมาจาก Doc 4 (ล่าสุด) ที่ผูกกับ Doc 3.9 ที่เลือกมาให้อัตโนมัติ โดยยังให้สามารถเพิ่ม ลดได้ https://app.clickup.com/t/86eum0nrv
                                    // set ชื่อ shipper กลับที่เดิม
                                    const groupIds = find_doc_data?.event_document_ofo?.map((item: any) => item?.group_id);
                                    const filteredShippers = shipperData?.filter((item: any) => groupIds?.includes(item?.id));
                                    const defaultIds = filteredShippers?.map((s: any) => s?.id); // เอา id 
                                    // setDefaultShippersRender(filteredShippers); // ลบไม่ได้
                                    // setDefaultShippersId(defaultIds) // ลบไม่ได้
                                    setSelectedShippersRender(filteredShippers);
                                    setSelectedShippers(defaultIds)


                                    // // set email group กลับที่เดิม
                                    const emailGroupForEventDataX = (find_doc_data?.event_document_ofo ?? []).filter((it: any) => Array.isArray(it?.event_document_ofo_email_group_for_event) && it.event_document_ofo_email_group_for_event.length > 0).flatMap((k: any) => k.event_document_ofo_email_group_for_event);
                                    const emailGroupForEventIds = emailGroupForEventDataX?.map((s: any) => s?.edit_email_group_for_event_id); // เอา id 
                                    const filter_email_group_for_event = emailGroupForEventData?.filter((item: any) => emailGroupForEventIds?.includes(item?.id))
                                    const uniqueGroupForEventIds = emailGroupForEventIds
                                        ?.filter((v: any) => v != null)
                                        ?.filter((v: any, i: any, arr: any) => arr?.indexOf(v) === i);
                                    setSelectedEmailGroupRender(filter_email_group_for_event)
                                    setSelectedEmailGroup(uniqueGroupForEventIds)


                                    // // set CC email กลับที่เดิม
                                    // const ccEmail = dataOpenDocument?.event_document_ofo_cc_email?.map((item: any) => item.email);
                                    const ccEmailFind = (find_doc_data?.event_document_ofo ?? []).filter((it: any) => Array.isArray(it?.event_document_ofo_cc_email) && it.event_document_ofo_cc_email.length > 0).flatMap((k: any) => k.event_document_ofo_cc_email);
                                    const ccEmail = ccEmailFind?.map((s: any) => s?.email);
                                    const uniqueCcEmail = ccEmail
                                        ?.filter((v: any) => v != null)
                                        ?.filter((v: any, i: any, arr: any) => arr?.indexOf(v) === i);

                                    // setDefaultCcEmailRender(ccEmail)  // ลบไม่ได้
                                    setEmailGroup(uniqueCcEmail)
                                    setValue("email_arr", [...uniqueCcEmail]);

                                    // ========================================



                                    clearErrors('ref_document')
                                    if (errors?.ref_document) { clearErrors('ref_document') }
                                }}
                                errors={errors?.ref_document}
                                errorsText={'Select Document 7'}
                                options={refDocData}
                                optionsKey={'id'}
                                optionsValue={'id'}
                                optionsText={'event_nember'}
                                optionsResult={'event_nember'}
                                placeholder={'Select  Document 7'}
                                pathFilter={'event_nember'}
                            />
                            :
                            <div className="w-full h-[44px] p-3 text-[14px] text-[#464255] rounded-[9px] bg-[#F1F1F1] border border-[#DFE4EA]"> {dataOpenDocument?.event_runnumber_ofo?.event_nember}</div>
                    }
                </div>


                <div className="pb-2 w-[200px]">
                    <label className={labelClass}>
                        <span className="text-red-500">*</span>
                        {`วันที่ออกเอกสาร`}
                    </label>
                    <DatePickaFormThai
                        {...register('event_date', { required: "เลือกวันที่" })}
                        // readOnly={isReadOnly}
                        // readOnly={watch('ref_document') || mode == 'view' ? true : false} // ปิดเพราะตอนเลือก ref doc 
                        // readOnly={(mode == 'view' || isShipper) ? true : false}
                        readOnly={mode == 'view' || mode == 'edit'}
                        placeHolder="เลือกวันที่"
                        // mode={watch('ref_document') ? 'view' : 'create'}
                        mode={mode}
                        valueShow={watch("event_date") ? dayjs(watch("event_date")).format("DD/MM/YYYY") : undefined}
                        // min={new Date()}
                        allowClear
                        isError={errors.event_date && !watch("event_date") ? true : false}
                        onChange={(e: any) => { setValue('event_date', formatFormDate(e)), e == undefined && setValue('event_date', null, { shouldValidate: true, shouldDirty: true }); }}
                    />
                    {errors.event_date && !watch("event_date") && <p className={`${textErrorClass}`}>{'เลือกวันที่'}</p>}
                </div>

                {/* เอกสารเลขที่ */}
                <div className="w-[190px]">
                    <label htmlFor="event_nember" className={labelClass}><span className="text-red-500">*</span>{`ตามเอกสารเลขที่`}</label>

                    <input
                        id="doc_8_input_ref_doc_at"
                        {...register("doc_8_input_ref_doc_at", { required: "กรอกเอกสาร" })}
                        type="text"
                        placeholder="กรอกเอกสาร"
                        readOnly={isReadOnly}
                        maxLength={25}
                        onChange={(e) => {
                            if (e.target.value.length <= 25) {
                                setValue('doc_8_input_ref_doc_at', e.target.value);
                            }
                        }}
                        className={`text-[14px] border-[1px] border-[#DFE4EA]  bg-white ps-[21px] h-[44px] w-full rounded-lg outline-none bg-opacity-100 focus:border-[#00ADEF] ${isReadOnly && '!bg-[#EFECEC]'}`}
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
                        // disabled={(mode == 'view' || isShipper) ? true : false}
                        disabled={isReadOnly}
                        rows={2}
                        sx={textFieldSx}
                        // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        className={`${(isReadOnly) && 'bg-[#EFECEC] rounded-[8px]'}`}
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


            {/* =================================== ช่วงเวลาของเหตุการณ์ new ======================================== */}

            <>
            {
                // (Array.from({ length: 2 }, (_, i) => i) || [])
                (shipperArr || [])?.map((item:any, ix:number) => {

                    return (
                        <div key={ix} className="  mt-1 mb-3">
                            <div className="w-full grid ">
                                {
                                    !item?.not_del && <div className=" text-[#FF0000] underline cursor-pointer ml-auto" onClick={()=>{removeDataShipper(item?.ix)}}>{`Remove`}</div>
                                }
                            </div>
                            <div className="border rounded-md p-5">
                                {/* เลือก shipper */}
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
                                                // {...register("shipper_id", { required: false })}
                                                disabled={mode == 'view' ? true : false}
                                                value={(item?.shipper || [])}
                                                // onChange={handleSelectChange}
                                                onChange={(event:any) => {

                                                    const value = event.target.value;

                                                        if (value.includes("all")) {

                                                            // เอาอันที่มีอยู่แล้วออกจาก option 
                                                            setSelectedShippers(selectedShippers.length === shipperData.length ? [] : shipperData?.filter((item: any) => !defaultShippersId?.includes(item.id)).map((item: any) => item.id));
                                                            setSelectedShippersRender(selectedShippers.length === shipperData.length ? [] : shipperData?.filter((item: any) => !defaultShippersId?.includes(item.id)).map((item: any) => item));
                                                            // setValue("shipper_id", selectedShippers.length === shipperData.length ? [] : shipperData?.filter((item: any) => !defaultShippersId?.includes(item.id)).map((item: any) => item.id));
                                                            setShipperArr((pre:any) => {
                                                                const npre = pre?.map((p:any) => {
                                                                    if(p?.ix === item?.ix){
                                                                        return {
                                                                            ...p,
                                                                            shipper: selectedShippers.length === shipperData.length ? [] : shipperData?.filter((item: any) => !defaultShippersId?.includes(item.id)).map((item: any) => item.id)
                                                                        }
                                                                    }else{
                                                                        return p
                                                                    }
                                                                }) 
                                                                return npre
                                                            })
                                                        } else {
                                                            setSelectedShippers(value);
                                                            // setValue("shipper_id", value);
                                                            // shipperArr?.shipper?.filter((f) f !== )
                                                            
                                                            setShipperArr((pre:any) => {
                                                                const npre = pre?.map((p:any) => {
                                                                    if(p?.ix === item?.ix){
                                                                        return {
                                                                            ...p,
                                                                            shipper: value
                                                                        }
                                                                    }else{
                                                                        return p
                                                                    }
                                                                }) 
                                                                return npre
                                                            })

                                                            const filter_shipper = shipperData?.filter((item: any) => value.includes(item?.id))
                                                            setSelectedShippersRender(filter_shipper)
                                                        }
                                                }}
                                                className={`${selectboxClass} ${(mode == 'view') && "!bg-[#EFECEC]"} ${errors.shipper_id && "border-red-500"}`}
                                                sx={{
                                                    ".MuiOutlinedInput-notchedOutline": { borderColor: errors.shipper_id && (item?.shipper || []).length === 0 ? "#FF0000" : "#DFE4EA" },
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
                                                    // const shipper_data = shipperData?.filter((item: any) => !defaultShippersId?.includes(item.id))
                                                    const shipper_data = shipperData
                                                    return (
                                                        <span className={`pl-[10px] text-[14px]`}>
                                                            {/* {shipper_data?.length == (item?.shipper || [])?.length ? `Select All` : selected.map((id:any) => shipperData?.filter((item: any) => !defaultShippersId?.includes(item.id)).find((item: any) => item.id === id)?.name).join(", ")} */}
                                                            {shipper_data?.length == (item?.shipper || [])?.length ? `Select All` : selected.map((id:any) => shipperData?.find((item: any) => item.id === id)?.name).join(", ")}
                                                        </span>
                                                    );
                                                }}
                                                MenuProps={{ PaperProps: { style: { maxHeight: 48 * 4.5 + 8 } } }}
                                            >
                                                {/* {userDT?.account_manage?.[0]?.user_type_id !== 3 && (
                                                    <MenuItem value="all">
                                                        <Checkbox checked={(item?.shipper || []).length === shipperData.length && shipperData.length > 0} />
                                                        <ListItemText
                                                            primary="Select All"
                                                            // sx={{ fontWeight: 'bold' }}
                                                            primaryTypographyProps={{ sx: { fontWeight: 'bold', fontSize: "14px" } }}
                                                        />
                                                    </MenuItem>
                                                )} */}
                                                {shipperData
                                                    ?.filter((itemF: any) => !((shipperArr) || [])?.flatMap((ssp:any) => ssp?.shipper)?.includes(itemF.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                                    ?.sort((a: any, b: any) => (a?.name || "").localeCompare(b?.name || "")) // แล้วค่อย sort
                                                    ?.map((itemM: any) => (
                                                        <MenuItem
                                                            key={itemM.id}
                                                            value={itemM.id}
                                                            disabled={false}
                                                        >
                                                            <Checkbox checked={(item?.shipper || [])?.includes(itemM.id)} />
                                                            <ListItemText primary={itemM.name} primaryTypographyProps={{ fontSize: 14 }} />
                                                        </MenuItem>
                                                    ))
                                                }
                                            </Select>

                                            <div className="flex flex-wrap gap-2 pt-2 mt-2 w-full max-h-[120px] overflow-y-auto">
                                              
                                                {
                                                    shipperData?.filter((f:any) => (item?.shipper || [])?.includes(f?.id))?.map((item_: any, index: number) => (
                                                        <div
                                                            key={index}
                                                            className="relative w-fit h-[40px] p-2 text-[14px] bg-[#CFF2FF] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                                        >
                                                            {item_?.name}
                                                            {/* f?.event_doc_master_id !== 1 */}
                                                            {
                                                                !(((dataOpenDocument?.event_runnumber_ofo?.event_document_ofo) || [])?.filter((f:any) => f?.seq_doc8_shipper === item?.seq_doc8_shipper) || [])?.find((f:any) => f?.group_id === item_?.id && f?.event_doc_status_id > 1)
                                                                ? 
                                                                <button
                                                                type="button"
                                                                className="absolute top-[-6px] right-[-4px] w-[15px] h-[15px] rounded-full bg-[#58585A] text-white flex justify-center items-center text-[8px]"
                                                                onClick={() => {
                                                                    setShipperArr((pre:any) => {
                                                                    const npre = pre?.map((p:any) => {
                                                                        if(p?.ix === item?.ix){
                                                                            return {
                                                                                ...p,
                                                                                shipper: p?.shipper?.filter((f:any) => f !== item_?.id)
                                                                            }
                                                                        }else{
                                                                            return p
                                                                        }
                                                                    }) 
                                                                    return npre
                                                                })
                                                                }}
                                                            > 
                                                                ✕
                                                            </button>
                                                            : <></>
                                                            }
                                                        </div>
                                                    ))
                                                }

                                            </div>
                                        </div>
                                    </div>
                                }


                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div>
                                        <label className={`${labelClass}`}>{`วันที่และเวลา`}</label>
                                        <div className="flex flex-nowrap items-center gap-4">
                                            <span className="text-[14px] font-light text-[#58585A]">{`วันที่`}</span>
                                            <span className="text-[14px] w-[240px] text-[#58585A]">
                                                <DatePickaFormThai
                                                    readOnly={isShipper ? true : (!!!item?.event_doc_status_id ? false : (item?.event_doc_status_id > 1 ? true : isReadOnly))}
                                                    placeHolder="ระบุวันที่"
                                                    mode={mode}
                                                    valueShow={item?.doc_8_input_date ? dayjs(item?.doc_8_input_date).format("DD/MM/YYYY") : undefined}
                                                    allowClear
                                                    isError={!!errors.doc_8_input_date && !item?.doc_8_input_date}
                                                    onChange={(e: any) => {
                                                        setShipperArr((pre:any) => {
                                                            const npre = pre?.map((p:any) => {
                                                                if(p?.ix === item?.ix){
                                                                    return {
                                                                        ...p,
                                                                        doc_8_input_date: formatFormDate(e)
                                                                    }
                                                                }else{
                                                                    return p
                                                                }
                                                            }) 
                                                            return npre
                                                        })
                                                        if (e == undefined)
                                                            setShipperArr((pre:any) => {
                                                                const npre = pre?.map((p:any) => {
                                                                    if(p?.ix === item?.ix){
                                                                        return {
                                                                            ...p,
                                                                            doc_8_input_date: null
                                                                        }
                                                                    }else{
                                                                        return p
                                                                    }
                                                                }) 
                                                                return npre
                                                            })
                                                    }}
                                                />
                                            </span>

                                            <span className="text-[14px] font-light text-[#58585A]">{`เวลา`}</span>
                                            <span className="text-[14px] w-[240px] text-[#58585A]">
                                                <TimePickaForm
                                                    readOnly={isShipper ? true : (!!!item?.event_doc_status_id ? false : (item?.event_doc_status_id > 1 ? true : isReadOnly))}
                                                    placeHolder="ระบุเวลา"
                                                    mode={mode}
                                                    valueShow={item?.doc_8_input_time || undefined}
                                                    allowClear
                                                    onChange={(e: any) => {
                                                        setShipperArr((pre:any) => {
                                                            const npre = pre?.map((p:any) => {
                                                                if(p?.ix === item?.ix){
                                                                    return {
                                                                        ...p,
                                                                        doc_8_input_time: e
                                                                    }
                                                                }else{
                                                                    return p
                                                                }
                                                            }) 
                                                            return npre
                                                        })
                                                        if (e == undefined)
                                                            setShipperArr((pre:any) => {
                                                                const npre = pre?.map((p:any) => {
                                                                    if(p?.ix === item?.ix){
                                                                        return {
                                                                            ...p,
                                                                            doc_8_input_time: null
                                                                        }
                                                                    }else{
                                                                        return p
                                                                    }
                                                                }) 
                                                                return npre
                                                            })
                                                    }}
                                                />
                                            </span>
                                        </div>
                                    </div>


                                    {/* สรุปการแก้ไข */}
                                    <div className="w-full">
                                        <label className={`${labelClass}`}>{`สรุปการแก้ไขปัญหา`}</label>
                                        <TextField
                                            value={item?.doc_8_input_summary || ""}
                                            label=""
                                            multiline
                                            onChange={(e) => {
                                                if (e.target.value.length <= 500) {
                                                    setShipperArr((pre:any) => {
                                                            const npre = pre?.map((p:any) => {
                                                                if(p?.ix === item?.ix){
                                                                    return {
                                                                        ...p,
                                                                        doc_8_input_summary: e.target.value
                                                                    }
                                                                }else{
                                                                    return p
                                                                }
                                                            }) 
                                                            return npre
                                                        })
                                                }
                                            }}
                                            placeholder="ระบุสรุปการแก้ไขปัญหา"
                                            disabled={isShipper ? true : (!!!item?.event_doc_status_id ? false : (item?.event_doc_status_id > 1 ? true : isReadOnly))}
                                            rows={2}
                                            sx={textFieldSx}
                                            className={`${(isShipper ? true : (!!!item?.event_doc_status_id ? false : (item?.event_doc_status_id > 1 ? true : isReadOnly))) && 'bg-[#EFECEC] rounded-[8px]'}`}
                                            InputProps={inputPropsTextField}
                                            fullWidth
                                        />
                                        <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                            <span className="text-[13px]">
                                                {item?.doc_8_input_summary?.length || 0} / 500
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* สรุปผลกระทบด้านปริมาณก๊าซ และด้านคุณภาพก๊าซ */}
                                <div className="grid grid-cols-2 gap-4 pt-3">
                                    <div className="w-full col-span-2">
                                        <label className={labelClass}>
                                            {`สรุปผลกระทบด้านปริมาณและด้านคุณภาพก๊าซ`}
                                        </label>
                                        <TextField
                                            value={item?.doc_8_input_summary_gas || ""}
                                            label=""
                                            multiline
                                            onChange={(e) => {
                                                if (e.target.value.length <= 500) {
                                                    setShipperArr((pre:any) => {
                                                            const npre = pre?.map((p:any) => {
                                                                if(p?.ix === item?.ix){
                                                                    return {
                                                                        ...p,
                                                                        doc_8_input_summary_gas: e.target.value
                                                                    }
                                                                }else{
                                                                    return p
                                                                }
                                                            }) 
                                                            return npre
                                                        })
                                                }
                                            }}
                                            placeholder="ระบุรายละเอียด"
                                            disabled={isShipper ? true : (!!!item?.event_doc_status_id ? false : (item?.event_doc_status_id > 1 ? true : isReadOnly))}
                                            rows={2}
                                            className={`${(mode == 'view' || isShipper) && 'bg-[#EFECEC] rounded-[8px]'}`}
                                            InputProps={inputPropsTextField}
                                            fullWidth
                                        />
                                        <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                            <span className="text-[13px]">{item?.doc_8_input_summary_gas?.length || 0} / 500</span>
                                        </div>
                                    </div>
                                </div>

                                {/* ข้อมูลเพิ่มเติม */}
                                <div className="grid grid-cols-2 gap-4 pt-3">
                                    <div className="w-full col-span-2">
                                        <label className={labelClass}>{`ข้อมูลเพิ่มเติม`}</label>
                                        <TextField
                                            value={item?.doc_8_input_more || ""}
                                            label=""
                                            multiline
                                            onChange={(e) => {
                                                if (e.target.value.length <= 500) {
                                                    setShipperArr((pre:any) => {
                                                            const npre = pre?.map((p:any) => {
                                                                if(p?.ix === item?.ix){
                                                                    return {
                                                                        ...p,
                                                                        doc_8_input_more: e.target.value
                                                                    }
                                                                }else{
                                                                    return p
                                                                }
                                                            }) 
                                                            return npre
                                                        })
                                                }
                                            }}
                                            placeholder="ระบุรายละเอียด"
                                            disabled={isShipper ? true : (!!!item?.event_doc_status_id ? false : (item?.event_doc_status_id > 1 ? true : isReadOnly))}
                                            rows={2}
                                            sx={textFieldSx}
                                            className={`${(mode == 'view' || isShipper) && 'bg-[#EFECEC] rounded-[8px]'}`}
                                            InputProps={inputPropsTextField}
                                            fullWidth
                                        />
                                        <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                            <span className="text-[13px]">{item?.doc_8_input_more?.length || 0} / 500</span>
                                        </div>
                                    </div>
                                </div>

                                {/* File */}
                                {/* ถ้าเป็น edit view แสดงอันนี้ */}
                                {
                                    // (mode == 'edit' || mode == 'view') && fileNameEditTextUrl !== '' &&
                                    (!!!item?.event_doc_status_id ? false : (item?.event_doc_status_id > 1 ? true : isReadOnly)) &&
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
                                                    onClick={() => downloadFile(item?.file)}
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
                                    !isShipper && (mode == 'create' || modeDraft) &&
                                    <div className="grid grid-cols-2 gap-4 pt-3">
                                        <div>
                                            <label className={`${labelClass}`}>{`File`}</label>
                                            {/* <div className={`flex items-center col-span-2 ${fileName == "Invalid file type. Please upload a Excel file." || fileName == 'The file is larger than 10 MB.' ? 'border  border-[#ff0000] rounded-r-lg rounded-l-lg' : ''}`}> */}
                                            <div className={`flex items-center col-span-2 ${''}`}>
                                                <label className={`flex bg-[#00ADEF] text-white items-center justify-center font-light rounded-l-[6px] text-[16px] text-justify w-[40%] !h-[44px] px-2 cursor-pointer`}>
                                                    {`Choose File`}
                                                    {isUploading && (
                                                        <span className="ml-2 w-[14px] h-[14px] border-[2px] border-white border-t-transparent rounded-full animate-spin"></span>
                                                    )}
                                                    <input
                                                        id="url"
                                                        type="file"
                                                        className="hidden"
                                                        // accept=".xls, .xlsx"
                                                        // onChange={handleFileChange}
                                                        onChange={async (e)=> {
                                                            const fi = await handleFileChange(e)
                                                            setShipperArr((pre:any) => {
                                                            const npre = pre?.map((p:any) => {
                                                                if(p?.ix === item?.ix){
                                                                    return {
                                                                        ...p,
                                                                        file: fi
                                                                    }
                                                                }else{
                                                                    return p
                                                                }
                                                            }) 
                                                            return npre
                                                        })
                                                        }
                                                    }
                                                    />
                                                </label>

                                                <div className="bg-white text-[#9CA3AF] text-sm w-[70%] !h-[44px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden flex items-center">
                                                    <span className="truncate">
                                                        {item?.file}
                                                    </span>
                                                    {
                                                        item?.file &&
                                                        <CloseOutlinedIcon
                                                            onClick={async()=> {
                                                                handleRemoveFile()
                                                                setShipperArr((pre:any) => {
                                                                    const npre = pre?.map((p:any) => {
                                                                        if(p?.ix === item?.ix){
                                                                            return {
                                                                                ...p,
                                                                                file: null
                                                                            }
                                                                        }else{
                                                                            return p
                                                                        }
                                                                    }) 
                                                                    return npre
                                                                })
                                                            }}
                                                            className="cursor-pointer ml-2 text-[#9CA3AF] z-10"
                                                            sx={{ color: '#323232', fontSize: 18 }}
                                                            style={{ fontSize: 18 }}
                                                        />
                                                    }
                                                </div>
                                            </div>
                                            {/* <div className={`w-full flex items-center justify-between text-[14px] text-red-500 `}>
                                                {fileName == 'The file is larger than 10 MB.' && fileName}
                                                {fileName == 'Invalid file type. Please upload a Excel file.' && fileName}
                                            </div> */}
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    )
                })
            }
            {
                !isShipper &&
                <div className="bg-[#00ADEF] text-white items-center justify-center font-light px-2 py-1 rounded-md cursor-pointer w-fit" onClick={()=> addDataShipper()}>+ Add</div>
            }



            {/* Email Group */}
            {
                !isShipper && (mode == 'create' || mode == 'edit') &&
                <div className="grid grid-cols-2 gap-4 pt-5">
                    <div className="w-full col-span-2">
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
                                onChange={(e) => {
                                    onChange(e);
                                    setAlertDupMail(false);
                                    setIsTsoEdited(true)
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
                                        }
                                    }
                                }}
                            />
                        </div>
                        {
                            alertDupMail && <p className={`${textErrorClass}`}>{'Email already exists'}</p>
                        }
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
           
            </>



            {/* ตาราง แสดงเฉพาะ TSO edit view */}
            {
                !isShipper && (mode == 'edit' || mode == 'view') && <div className="pt-4"><TableDocument8 tableData={dataTable} dataOpenDocument={dataOpenDocument} /></div>
            }

            {(() => {
                const shouldHideButton = isShipper && (dataOpenDocument?.event_doc_status_id === 1 || dataOpenDocument?.event_doc_status_id === 5);

                return (
                    <div className="flex justify-end pt-8">
                        {mode !== 'view' && !shouldHideButton && (

                            // ปุ่มจะ Disabled ก็ต่อเมื่อ
                            // User ไม่ใช่ Type 3 และ
                            // ไม่ใช่ (โหมด Edit ที่ไม่มีการแก้) และ
                            // ไม่ใช่ โหมด Create
                            <button
                                type="submit"
                                className="w-[167px] h-[44px] font-semibold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                // disabled={false}
                                // disabled={(mode == 'edit' && isTsoEdited) || mode == 'create' ? false : true} // Edit : ถ้าไม่มีข้อมูลอะไร update ให้ disable ปุ่ม save ไว้ https://app.clickup.com/t/86eupj7bm
                                disabled={modeDraft ? false : (!(isShipper || (mode === 'edit') || mode === 'create' ))} // Edit : ถ้าไม่มีข้อมูลอะไร update ให้ disable ปุ่ม save ไว้ https://app.clickup.com/t/86eupj7bm
                            >
                                {mode === 'create' ? 'Save Darft' : modeDraft ? "Submit" : (isShipper ? 'Acknowledge' : 'Save')}
                            </button>
                        )}
                    </div>
                )
            })()}
        </form>

        {/* Confirm Save */}
        <ModalConfirmSave
            customWidth={(dataPDFItem?.data?.[0]?.item?.shipperArr || [])?.length > 0 ? 700 : 490}
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
                                                                <PdfDoc8 data={dataPDFItem} />
                                                            }
                                                            <div className="text-center">
                                                                {`Do you want to submit now ?`}
                                                            </div>
                                                        </div >
                                                        : isShipper ? <div className=" w-full">
                                                                            {
                                                                                dataPDFItem &&
                                                                                <PdfDoc8 data={dataPDFItem} />
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
                                                                    <PdfDoc8 data={dataPDFItem} />
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

export default FormDocument8;