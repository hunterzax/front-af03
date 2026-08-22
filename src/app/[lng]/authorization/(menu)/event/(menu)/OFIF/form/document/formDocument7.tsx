import { useEffect, useState } from "react";
import { convertTimeStringToDate, cutUploadFileName, formatFormDate, formatNumberSixDecimalNoComma } from '@/utils/generalFormatter';
import dayjs from 'dayjs';
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import ModalConfirmSave from "@/components/other/modalConfirmSave";
import { Button, Checkbox, ListItemText, MenuItem, Select, TextField, Typography } from "@mui/material";
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DatePickaFormThai from "@/components/library/dateRang/dateSelectFormThai";
import { getService, putService, uploadFileService } from "@/utils/postService";
import SelectFormProps from "@/components/other/selectProps";
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import getUserValue from "@/utils/getuserValue";
import TimePickaForm from "@/components/library/dateRang/timePickerForm";
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import TableDocument7 from "../tableDocument7";
import ModeEditOutlinedIcon from '@mui/icons-material/ModeEditOutlined';
import ModalAction from "./modalEditDoc7";
import Doc7ExtraGasFieldArray from "./Doc7ExtraGasFieldArray";
import {
    assembleDoc7CreateGasShipper,
    assembleDoc7TsoEditGasShipper,
    buildGasShipperRowsForCreate,
    buildGasShipperRowsForTsoEdit,
    doc7ExtraFormRowsToLegacyInputs,
    emptyDoc7ExtraBlock,
    type Doc7LegacyBlockInput,
    type Doc7ExtraBlockFormValue,
} from "../../lib/doc7GasShipper";
import { PdfDoc7 } from "@/components/other/pdf_event/docEvent";

type FormExampleProps = {
    data?: Partial<any>;
    mode?: any;
    userDT?: any;
    refDoc7?: any;
    shipperData?: any;
    ofoTypeData?: any;
    emailGroupForEventData?: any;
    dataNomPointForDoc7?: any;
    refDocData?: any;
    setIsOpenDocument?: any;
    dataOpenDocument?: any;
    modeOpenDocument?: any;
    maiHedDocJedLasted?: any;
    onSubmit: SubmitHandler<any>;
};

const inputClass = "text-[14px] block md:w-full p-2 ps-5 focus:!ps-5 hover:!ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"
const labelClass = "block mb-2 text-[14px] text-[#464255] font-semibold"
const textErrorClass = "text-red-500 text-[14px] "
const selectboxClass = "flex w-full h-[44px] p-1 ps-1 pe-2 !rounded-lg text-gray-900 block outline-none";

// key ใน DB ตามฟอร์ม
// "generate": false, // true gen , false default
// "id_documents": null, // ตอนสร้าง null | ถ้าใส่ id_runnumber ใส่มาด้วย | ตอน edit version ส่งมาด้วย | (ถ้าตอน status generate ส่ง id มาด้วย )
// "id_runnumber": null, // ใส่มาตอน edit version 
// "longdo_dict": "ส่วนบริการสัญญาระบบท่อส่งก๊าซ (Transmission Contracts & Regulatory Management Division โทร 025372000,35063)", //สำเนา

// "event_date": "2025-08-01", // วันที่ออกเอกสาร
// "doc_7_input_date_time_of_the_incident": "วันที่ 9 มิ.ย. 2567 เวลา 17.20 และวันที่ 10 มิ.ย. 2567 เวลา 00.36 น.", //วัน/เวลาที่เกิดเหตุ
// "doc_7_input_detail_incident": "เนื่องด้วยในวันที่ 9/5/2567 เวลา 14:10 น. เกิดเหตุการณ์ไม่สมดุลอย่างรุนแรง / ภาวาวะฉุกเฉิน ซึ่งมีรายละเอียดดังนี้ \nรายละเอียดของเหตุการณ์ และผลกระทบต่อระบบส่งก๊าซ: เกิดเหตุไฟไหม้ถังเก็บสารเคมีของ Maptaphut Tank Terminalส่งผลให้หน่วยงาน ปฝ. อพยพ และ LNG ลดการส่งก๊าซ", //รายละเอียดของเหตุการณ์ และผลกระทบต่อระบบส่งก๊าซ
// "doc_7_input_time_event_start_date": "2025-03-01", //วันที่เริ่มดำเนินการ เริ่ม วัน
// "doc_7_input_time_event_start_time": "10:00", //วันที่เริ่มดำเนินการ เริ่ม เวลา
// "doc_7_input_time_event_end_date": "2025-03-01", //วันที่เริ่มดำเนินการ ถึง วัน
// "doc_7_input_time_event_end_time": "15:00", //วันที่เริ่มดำเนินการ ถึง เวลา
// "doc_7_input_note": "กรณีพื้นที่เกิดเหตุเป็นพื้นที่ให้บริการตาม TSO Code จะอ้างอิงการสั่งการจาก TSO Code ข้อที่ 8.10.2.6 เรื่องขั้นตอนการปฏิบัติงานในกรณีเหตุการณ์ไม่สมดุลอย่างรุนแรง และ 8.10.2.7 ขั้นตอนการด าเนินการในกรณีภาวะฉุกเฉิน", //หมายเหตุ
// "doc_7_input_ref_1_id": 1, // อ้างอิง อันแรก ติ้กใส่ 1 ไม่ติ๊ก null
// "doc_7_input_ref_2_id": null, // อ้างอิง อันแรก ติ้กใส่ 2 ไม่ติ๊ก null

// "doc_7_input_order_ir_id": 1, // เพิ่ม 1 , ลด 2, อื่นๆ ใส่ null 
// "doc_7_input_order_io_id": 3, // เข้า 3 , ออก 4, อื่นๆ ใส่ null 
// "doc_7_input_order_other_id": null, // อื่นๆ 5, ถ้าเลือก doc_4_input_order_ir_id, doc_4_input_order_io_id ใส่ null 
// "doc_7_input_order_other_value": null, // อื่นๆ ให้ใส่, นอกเหนือ null 

// "event_doc_ofo_type_id": 1, //ประเภท 
// "event_doc_ofo_gas_tranmiss_id": 1, //ระบบส่งก๊าซ 
// "event_doc_ofo_gas_tranmiss_other": null, // event_doc_ofo_gas_tranmiss_other 4 ใส่ด้วย

const FormDocument7: React.FC<FormExampleProps> = ({ mode, data, onSubmit, setIsOpenDocument, dataOpenDocument, modeOpenDocument, userDT, shipperData, ofoTypeData, emailGroupForEventData, dataNomPointForDoc7, refDocData, refDoc7, maiHedDocJedLasted }) => {
    const [dataPDFItem, setdataPDFItem] = useState<any>(null)
    
    const { control, register, handleSubmit, setValue, reset, clearErrors, getValues, formState: { errors }, watch, } = useForm<any>({ defaultValues: data, });
    const {
        fields: doc7ExtraFields,
        append: appendDoc7Extra,
        remove: removeDoc7Extra,
        replace: replaceDoc7Extra,
    } = useFieldArray({ control, name: "doc7_extra_blocks" });
    const [tk, settk] = useState<boolean>(false); // ของคุ้นเคย
    const [dataRefDoc7, setDataRefDoc7] = useState<any>([]); // ของคุ้นเคย
    const { onChange, ...restEmail } = register("email"); // register email

    const isLocked = mode === 'view' || (userDT?.account_manage?.[0]?.user_type_id === 3 || userDT?.account_manage?.[0]?.user_type_id === 4);


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

    const selectSx = {
        '.MuiOutlinedInput-notchedOutline': {
            borderColor: '#DFE4EA', // Change the border color here
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#d2d4d8',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#d2d4d8',
        },
        '&.Mui-disabled .MuiSelect-select': {
            opacity: 1, // ยกเลิกความจางของ MUI
            color: '#464255 !important', // สีที่คุณต้องการ
            WebkitTextFillColor: '#464255 !important'
        },
    }

    const [headerFormText, setHeaderFormText] = useState('');
    const [documentId, setDocumentId] = useState(''); // ID ของ Document 2
    // const isReadOnly = mode === "view" || mode == 'edit';
    // const isReadOnly = mode === "view";
    
    const modeDraft = dataOpenDocument?.event_doc_status_id === 1 ? true : false
    const isReadOnly = modeDraft ? false : (mode === "view" || mode == 'edit');
    const isShipper = modeDraft ? false :  ((userDT?.account_manage?.[0]?.user_type_id === 3 || userDT?.account_manage?.[0]?.user_type_id === 4) ? true : false);


    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [dataTable, setDataTable] = useState<any>([])


    // hotfix
    const [isEditPermLod, setIsEditPermLod] = useState<any>([]) // hotfix เอาไว้จับว่าต้องเพิ่ม เพิ่ม ลด ก่อนถึงจะ save ได้

    //#region SAVEBTN
    const [trickerEdit, settrickerEdit] = useState<boolean>(mode == 'edit' ? true : false)


    // // ชุดที่ 1
    // const [defaultShippersRender1, setDefaultShippersRender1] = useState<any[]>([]); // SELECT SHIPPER สำหรับ mode edit ที่ไม่ให้ลบของเก่า
    // const [defaultShippersId1, setDefaultShippersId1] = useState<any[]>([]); // SELECT SHIPPER สำหรับ mode edit ที่ไม่ให้ลบของเก่า
    // const [fileNameEditText1, setFileNameEditText1] = useState(''); // เอาไว้แสดงชื่อไฟล์ตอนเข้ามา view หรือ edit
    // const [fileNameEditTextUrl1, setFileNameEditUrl1] = useState(''); // เอาไว้กดโหลดตอนเข้ามา view หรือ edit

    // // ชุดที่ 2
    // const [defaultShippersRender2, setDefaultShippersRender2] = useState<any[]>([]);
    // const [defaultShippersId2, setDefaultShippersId2] = useState<any[]>([]);
    // const [fileNameEditText2, setFileNameEditText2] = useState(''); // เอาไว้แสดงชื่อไฟล์ตอนเข้ามา view หรือ edit
    // const [fileNameEditTextUrl2, setFileNameEditUrl2] = useState(''); // เอาไว้กดโหลดตอนเข้ามา view หรือ edit

    // // ชุดที่ 3
    // const [defaultShippersRender3, setDefaultShippersRender3] = useState<any[]>([]);
    // const [defaultShippersId3, setDefaultShippersId3] = useState<any[]>([]);
    // const [fileNameEditText3, setFileNameEditText3] = useState(''); // เอาไว้แสดงชื่อไฟล์ตอนเข้ามา view หรือ edit
    // const [fileNameEditTextUrl3, setFileNameEditUrl3] = useState(''); // เอาไว้กดโหลดตอนเข้ามา view หรือ edit

    // // ชุดที่ 4
    // const [defaultShippersRender4, setDefaultShippersRender4] = useState<any[]>([]);
    // const [defaultShippersId4, setDefaultShippersId4] = useState<any[]>([]);
    // const [fileNameEditText4, setFileNameEditText4] = useState(''); // เอาไว้แสดงชื่อไฟล์ตอนเข้ามา view หรือ edit
    // const [fileNameEditTextUrl4, setFileNameEditUrl4] = useState(''); // เอาไว้กดโหลดตอนเข้ามา view หรือ edit

    // // ชุดที่ 5
    // const [defaultShippersRender5, setDefaultShippersRender5] = useState<any[]>([]);
    // const [defaultShippersId5, setDefaultShippersId5] = useState<any[]>([]);
    // const [fileNameEditText5, setFileNameEditText5] = useState(''); // เอาไว้แสดงชื่อไฟล์ตอนเข้ามา view หรือ edit
    // const [fileNameEditTextUrl5, setFileNameEditUrl5] = useState(''); // เอาไว้กดโหลดตอนเข้ามา view หรือ edit


    const [defaultEmailGroupRender, setDefaultEmailGroupRender] = useState<any[]>([]); // EMAIL GROUP สำหรับ mode edit ที่ไม่ให้ลบของเก่า
    const [defaultEmailGrouId, setDefaultEmailGrouId] = useState<any[]>([]); // EMAIL GROUP สำหรับ mode edit ที่ไม่ให้ลบของเก่า

    const [defaultCcEmailRender, setDefaultCcEmailRender] = useState<any[]>([]); // CC EMAIL สำหรับ mode edit ที่ไม่ให้ลบของเก่า

    const inputPropsTextField = {
        style: {
            color: isReadOnly ? "#464255" : "inherit",
        },
        disableUnderline: true,
    }

    {/* Confirm Save */ }
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()

    // const [idChudTee1, setIdChudTee1] = useState<any>(null)
    // const [idChudTee2, setIdChudTee2] = useState<any>(null)
    // const [idChudTee3, setIdChudTee3] = useState<any>(null)
    // const [idChudTee4, setIdChudTee4] = useState<any>(null)
    // const [idChudTee5, setIdChudTee5] = useState<any>(null)

    // #region สำหรับตอน SET RESET
    const setDataForEachChudTee  = ({index, eventDocGasShipperOfo, isGenerate}:{index: number, eventDocGasShipperOfo: any, isGenerate: boolean}) => {
        const commandIndex = index + 1;
        const groupIds = eventDocGasShipperOfo?.event_doc_gas_shipper_ofo_match?.map((item: any) => item?.event_document_ofo?.group_id) ?? [];
        const ir = eventDocGasShipperOfo?.ir ?? "";
        const io = eventDocGasShipperOfo?.io ?? "";
        const area = eventDocGasShipperOfo?.area_id ?? "";
        const nom_point = eventDocGasShipperOfo?.nom_point ?? "";
        const nom_value_mmscfh = eventDocGasShipperOfo?.nom_value_mmscfh ?? "";
        const gas_command = eventDocGasShipperOfo?.gas_command ?? "";
        const gas_more = eventDocGasShipperOfo?.gas_more ?? "";

        const entry_exit_id = io == 3 || io === "3" ? 1 : 2;
        const areaOptions = (dataNomPointForDoc7 ?? []).filter((it: any) => it.entry_exit_id == entry_exit_id);
        const areaObj = areaOptions.find((a: any) => a.id == area);
        const nomObj = (areaObj?.nom ?? []).find((n: any) => n.id == nom_point);
        const shipperList = nomObj?.shipper ?? [];
        const defaultShipperIds = isShipper ? [userDT?.account_manage?.[0]?.group_id] : shipperList.filter((s: any) => groupIds?.includes(s.id)).map((s: any) => s.id);

        const persistedFileUrl =
            eventDocGasShipperOfo?.event_doc_gas_shipper_ofo_file?.length > 0 ? eventDocGasShipperOfo?.event_doc_gas_shipper_ofo_file?.[0]?.url ?? "" : "";
        const persistedFileName = persistedFileUrl ? cutUploadFileName(persistedFileUrl) : "Maximum File 10 MB";

        const base = `doc7_extra_blocks.${index}` as const;
        setValue(`shipper_id_${commandIndex}`, null); // ตอนเปลี่ยน nom ให้เคลียร์ shipper
        setValue(`doc_7_perm_lod_${commandIndex}`, ir)
        setValue(`doc_7_jud_soong_kaw_ook_${commandIndex}`, io)
        setValue(`doc_7_area_${commandIndex}`, area ?? '') // เดา
        setValue(`doc_7_nom_point_${commandIndex}`, nom_point ?? '')
        setValue(`doc_7_nom_value_${commandIndex}`, nom_value_mmscfh)
        setValue(`doc_7_gas_command_${commandIndex}`, gas_command)
        setValue(`doc_7_gas_more_${commandIndex}`, gas_more)

        setValue(`${base}.area` as any, area ?? '');
        setValue(`${base}.nom_point` as any, nom_point ?? '');
        setValue(`${base}.ir` as any, ir);
        setValue(`${base}.io` as any, io);
        setValue(`${base}.nom_value_mmscfh` as any, nom_value_mmscfh);
        setValue(`${base}.gas_command` as any, gas_command);
        setValue(`${base}.gas_more` as any, gas_more);
        if(modeDraft){

            setValue(`${base}.shipper` as any, defaultShipperIds);
            setValue(`${base}.defaultShipperIds` as any, []);
            setValue(`${base}.shipperIdValue` as any, defaultShipperIds);
        }else{

            setValue(`${base}.shipper` as any, []);
            setValue(`${base}.defaultShipperIds` as any, defaultShipperIds);
            setValue(`${base}.shipperIdValue` as any, null);
        }
        setValue(`${base}.fileUrl` as any, persistedFileUrl);
        setValue(`${base}.fileName` as any, eventDocGasShipperOfo.event_doc_gas_shipper_ofo_file?.length > 0 ? cutUploadFileName(eventDocGasShipperOfo.event_doc_gas_shipper_ofo_file[0]?.url) : '');

        return {
            ir,
            io,
            area,
            nom_point,
            nom_value_mmscfh,
            gas_command,
            gas_more,
            shipper: modeDraft ? defaultShipperIds : [],
            defaultShipperIds: modeDraft ? [] : defaultShipperIds,
            shipperIdValue: modeDraft ? defaultShipperIds : null,
            // shipper: [],
            // defaultShipperIds,
            // shipperIdValue: null,
            fileUrl: persistedFileUrl,
            persistedFileUrl,
            fileName: persistedFileName,
            serverId: isGenerate ? null : eventDocGasShipperOfo?.id ?? null,
        } as Doc7ExtraBlockFormValue;
    }

    const setDataChudTee = () => {
        let blocks: Doc7ExtraBlockFormValue[] = []
        const isGenerate = dataOpenDocument.event_doc_status_id == 6
        if(isShipper){
            blocks = (dataOpenDocument?.event_doc_gas_shipper_ofo_match ?? [])
            .filter((eventDocGasShipperOfoMatch: any) => eventDocGasShipperOfoMatch.event_document_ofo.group_id == userDT?.account_manage?.[0]?.group_id)
            .map((eventDocGasShipperOfoMatch: any, index: number) => {
                const eventDocGasShipperOfo = eventDocGasShipperOfoMatch?.event_doc_gas_shipper_ofo
                return setDataForEachChudTee({index, eventDocGasShipperOfo, isGenerate})
            })
        }
        else{
            blocks = (dataOpenDocument?.event_doc_gas_shipper_ofo ?? []).map((eventDocGasShipperOfo: any, index: number) => {
                return setDataForEachChudTee({index, eventDocGasShipperOfo, isGenerate})
            })
        }
        replaceDoc7Extra(blocks.length > 0 ? blocks : [emptyDoc7ExtraBlock()]);
    }


    // #region set data on load
    useEffect(() => {
        let text_header: any = 'สร้างเอกสารคำสั่งเพิ่ม/ลดปริมาณก๊าซ (Doc 7)'
        switch (modeOpenDocument) {
            case 'view':
                text_header = 'ดูเอกสารคำสั่งเพิ่ม/ลดปริมาณก๊าซ (Doc 7)'
                break;
            case 'edit':
                text_header = 'แก้ไขเอกสารคำสั่งเพิ่ม/ลดปริมาณก๊าซ (Doc 7)'
                break;
        }

        setHeaderFormText(text_header)
        // setDocumentId(dataOpenDocument?.document1?.id)
        setDocumentId(dataOpenDocument?.id)

        if (modeOpenDocument == 'edit' || modeOpenDocument == 'view') {

            setValue('ref_document', dataOpenDocument?.event_runnumber_emer_id)
            setValue('event_date', dataOpenDocument?.event_date)
            setValue('longdo_dict', dataOpenDocument?.longdo_dict)
            setValue('event_doc_ofo_type_id', dataOpenDocument?.event_runnumber_ofo?.event_doc_ofo_type_id)
            // สำหรับ TSO
            // event_doc_gas_shipper array ข้างนอกคือชุดที่ 1, 2, 3, 4, 5 ตาม array
            // event_doc_gas_shipper.event_doc_gas_shipper_match คือรายชื่อ shipper ใน select box shipper

            // เก็บไว้ดู
            // const xxxxx = dataOpenDocument?.event_runnumber_emer?.event_document_emer?.map((item: any) => item.group_id);

                setDataChudTee();

            // set email group กลับที่เดิม
            const emailGroupForEventIds = dataOpenDocument?.event_document_ofo_email_group_for_event?.map((item: any) => item.edit_email_group_for_event_id);
            const filter_email_group_for_event = emailGroupForEventData?.filter((item: any) => emailGroupForEventIds?.includes(item?.id))
            const defaultEmailGroupIds = filter_email_group_for_event?.map((s: any) => s.id); // เอา id 
            // setDefaultEmailGroupRender(filter_email_group_for_event) // ลบไม่ได้
            // setDefaultEmailGrouId(defaultEmailGroupIds) // ลบไม่ได้

            // set CC email กลับที่เดิม
            const ccEmail = dataOpenDocument?.event_document_ofo_cc_email?.map((item: any) => item.email);
            // setDefaultCcEmailRender(ccEmail)  // ลบไม่ได้

             if(modeDraft){

                setSelectedEmailGroupRender(filter_email_group_for_event)
                setSelectedEmailGroup(defaultEmailGroupIds)
                
                setValue("email_arr", ccEmail)
                setEmailGroup(ccEmail)
            }else{
               
                setDefaultEmailGroupRender(filter_email_group_for_event) // ลบไม่ได้
                setDefaultEmailGrouId(defaultEmailGroupIds) // ลบไม่ได้
                
                setDefaultCcEmailRender(ccEmail)  // ลบไม่ได้
            }

            // #region ข้อมูลใน TABLE ล่าง
            // ข้อมูลในตารางข้างล่าง
            setDataTable(dataOpenDocument?.event_runnumber_ofo?.event_document_ofo)

           


            // setDataTable(dataOpenDocument?.history_table_inside)


            // SET ข้อมูลลงฟอร์มนะ
            setValue('event_doc_ofo_gas_tranmiss_id', dataOpenDocument?.event_runnumber_ofo?.event_doc_ofo_gas_tranmiss_id)
            setValue('event_doc_ofo_gas_tranmiss_other', dataOpenDocument?.event_runnumber_ofo?.event_doc_ofo_gas_tranmiss_other)

            setValue('doc_7_input_ref_1_id', dataOpenDocument?.doc_7_input_ref_1_id) // checkbox 1
            setValue('doc_7_input_ref_2_id', dataOpenDocument?.doc_7_input_ref_2_id) // checkbox 2
            setValue('doc_7_input_date_time_of_the_incident', dataOpenDocument?.doc_7_input_date_time_of_the_incident) // วัน/เวลาที่เกิดเหตุ
            setValue('doc_7_input_detail_incident', dataOpenDocument?.doc_7_input_detail_incident) // รายละเอียดของเหตุการณ์ และผลกระทบต่อระบบส่งก๊าซ

            setValue('doc_7_input_time_event_start_date', dataOpenDocument?.doc_7_input_time_event_start_date)  // //วันที่เริ่มดำเนินการ เริ่ม วัน
            setValue('doc_7_input_time_event_start_time', dataOpenDocument?.doc_7_input_time_event_start_time ? convertTimeStringToDate(dataOpenDocument?.doc_7_input_time_event_start_time) : null) // วันที่เริ่มดำเนินการ เริ่ม เวลา
            setValue('doc_7_input_time_event_end_date', dataOpenDocument?.doc_7_input_time_event_end_date)  // วันที่เริ่มดำเนินการ ถึง วัน
            setValue('doc_7_input_time_event_end_time', dataOpenDocument?.doc_7_input_time_event_end_time ? convertTimeStringToDate(dataOpenDocument?.doc_7_input_time_event_end_time) : null) // วันที่เริ่มดำเนินการ เริ่ม เวลา

            setValue('doc_7_input_note', dataOpenDocument?.doc_7_input_note)  // หมายเหตุ

            setValue('doc_7_input_note_shipper', dataOpenDocument?.doc_7_input_note_shipper)  // หมายเหตุ

        }

        // New : หมายเหตุ ให้มีการ Default ข้อความตามเอกสาร และเมื่อมีการแก้ไข ให้ยึดตัวล่าสุดเป็นตัว Default ในการ New ครั้งต่อไป https://app.clickup.com/t/86eum0nuj
        if (modeOpenDocument == 'create') {
            setValue('doc_7_input_note', maiHedDocJedLasted)  // หมายเหตุ

            setValue('event_doc_ofo_gas_tranmiss_id', "1") // hotfix
        }
    }, [mode, dataOpenDocument, dataNomPointForDoc7, shipperData, emailGroupForEventData])


    // #region handle Confirm Save
    const validateData = (data?: any) => {
        let validateList: string[] = []

        if(mode != 'create' && isShipper){
            if(!documentId){
                validateList.push('กรุณาระบุ เอกสาร')
            }
        }
        else{
            if(!watch('event_doc_ofo_type_id')){
                validateList.push('กรุณาระบุ ประเภท')
            }
    
            if(!watch('event_date')){
                validateList.push('กรุณาระบุ วันที่ออกเอกสาร')
            }
            
            if(!watch('doc_7_input_detail_incident')){
                validateList.push('กรุณาระบุ รายละเอียดเหตุการณ์ความไม่สมดุล หรือเหตุการณ์เพื่อควบคุมคุณภาพก๊าซที่ต้องสั่งการอย่างจำเป็นเร่งด่วนเพื่อปกป้องหรือระงับความเสียหายหรืออันตรายที่อาจเกิดขึ้นกับระบบส่งก๊าซ และรายละเอียดการสั่งการ')
            }
    
    
            const extraLegacyBlocks = doc7ExtraFormRowsToLegacyInputs(getValues("doc7_extra_blocks") ?? []);
            extraLegacyBlocks.some((legacyCommandItem, index) => {
                const commandIndex = index + 1
    
                if(!legacyCommandItem?.permLod){
                    validateList.push(`กรุณาระบุ เพิ่ม/ลด ในการสั่งการที่ ${commandIndex}`)
                }
    
                if(!legacyCommandItem?.io){
                    validateList.push(`กรุณาระบุ จุดส่งเข้า/จุดส่งออก ในการสั่งการที่ ${commandIndex}`)
                }
    
                if(!legacyCommandItem?.area){
                    validateList.push(`กรุณาระบุ Area ในการสั่งการที่ ${commandIndex}`)
                }
    
                if(!legacyCommandItem?.nomPoint){
                    validateList.push(`กรุณาระบุ ปริมาณก๊าซที่ ในการสั่งการที่ ${commandIndex}`)
                }
    
                if((!legacyCommandItem?.defaultShipperIds || legacyCommandItem?.defaultShipperIds?.length == 0) && (!legacyCommandItem?.selectedShipperIds || legacyCommandItem?.selectedShipperIds?.length == 0)){
                    validateList.push(`กรุณาระบุ Shipper ในการสั่งการที่ ${commandIndex}`)
                }
            })
        }

        return validateList
    }

    {/* Confirm Save */ }
    const handleSaveConfirm = async (data?: any) => {
        if (mode == 'create') {

            {/* 
                key ในแต่ละชุด

              // ชุด 1 
                doc_7_perm_lod_1 : เพิ่ม = 1, ลด = 2
                doc_7_jud_soong_kaw_ook_1 : เข้า = 3, ออก = 4
                doc_7_area_1 : area
                doc_7_nom_point_1  : ปริมาณก๊าซที่
                doc_7_nom_value_1 : คิดเป็นปริมาณ (MMSCFH)
                shipper_id_1 : shipper
                doc_7_gas_command_1 : การสั่งการ
                doc_7_gas_more_1 : ข้อมูลเพิ่มเติม

            */}

            const extraLegacyBlocks = doc7ExtraFormRowsToLegacyInputs(getValues("doc7_extra_blocks") ?? []);
            const extraGasShippers = buildGasShipperRowsForCreate(extraLegacyBlocks);

            const payload_tso_create = {
                "generate": false, // true gen , false default
                "id_runnumber": null, // ใส่มาตอน edit version 
                "id_documents": null, // ตอนสร้าง null | ถ้าใส่ id_runnumber ใส่มาด้วย | ตอน edit version ส่งมาด้วย | (ถ้าตอน status generate ส่ง id มาด้วย )

                // "longdo_dict": data?.longdo_dict, //สำเนา
                "longdo_dict": watch('longdo_dict'), //สำเนา
                "event_date": dayjs(watch('event_date')).format("YYYY-MM-DD"), // วันที่ออกเอกสาร

                "doc_7_input_date_time_of_the_incident": watch('doc_7_input_date_time_of_the_incident'), //วัน/เวลาที่เกิดเหตุ
                "doc_7_input_detail_incident": watch('doc_7_input_detail_incident'), //รายละเอียดของเหตุการณ์ และผลกระทบต่อระบบส่งก๊าซ

                "doc_7_input_time_event_start_date": watch('doc_7_input_time_event_start_date') ? watch('doc_7_input_time_event_start_date') : null, //วันที่เริ่มดำเนินการ เริ่ม วัน
                "doc_7_input_time_event_start_time": watch('doc_7_input_time_event_start_time') ? dayjs(watch('doc_7_input_time_event_start_time')).format('HH:mm') : null, //วันที่เริ่มดำเนินการ เริ่ม เวลา
                "doc_7_input_time_event_end_date": watch('doc_7_input_time_event_end_date') ? watch('doc_7_input_time_event_end_date') : null, //วันที่เริ่มดำเนินการ ถึง วัน
                "doc_7_input_time_event_end_time": watch('doc_7_input_time_event_end_time') ? dayjs(watch('doc_7_input_time_event_end_time')).format('HH:mm') : null, //วันที่เริ่มดำเนินการ ถึง เวลา
                "doc_7_input_note": watch('doc_7_input_note'), //หมายเหตุ 

                "doc_7_input_ref_1_id": watch('doc_7_input_ref_1_id') ? 1 : null, // อ้างอิง อันแรก ติ้กใส่ 1 ไม่ติ๊ก null
                "doc_7_input_ref_2_id": watch('doc_7_input_ref_2_id') ? 2 : null, // อ้างอิง อันแรก ติ้กใส่ 2 ไม่ติ๊ก null

                "event_doc_ofo_type_id": watch('event_doc_ofo_type_id'), //ประเภท 
                "event_doc_ofo_gas_tranmiss_id": watch('event_doc_ofo_gas_tranmiss_id') ? parseInt(watch('event_doc_ofo_gas_tranmiss_id')) : null, //ระบบส่งก๊าซ 
                "event_doc_ofo_gas_tranmiss_other": watch('event_doc_ofo_gas_tranmiss_other') ? watch('event_doc_ofo_gas_tranmiss_other') : null, // event_doc_ofo_gas_tranmiss_other 4 ใส่ด้วย

                // gas_shipper อันนี้มันจะมีเต็มที่ 5 ตัว
                "gas_shipper": [
                    // ...(watch('doc_7_perm_lod_1') && watch('shipper_id_1') ? [{
                    //     "id": null,
                    //     "ir": watch('doc_7_perm_lod_1') ? parseInt(watch('doc_7_perm_lod_1')) : null, // 1 เพิ่ม, 2 ลด
                    //     "io": watch('doc_7_jud_soong_kaw_ook_1') ? parseInt(watch('doc_7_jud_soong_kaw_ook_1')) : null, // 3 จุดส่งเข้า, 4 จุดส่งออก
                    //     "area": watch('doc_7_area_1'), // area
                    //     "nom_point": watch('doc_7_nom_point_1'),
                    //     "nom_value_mmscfh": watch('doc_7_nom_value_1') ? formatNumberSixDecimalNoComma(watch('doc_7_nom_value_1')) : '',
                    //     "gas_command": watch('doc_7_gas_command_1'),
                    //     "gas_more": watch('doc_7_gas_more_1'),
                    //     "shipper": Array.from(new Set([
                    //         ...selectedShippers1,
                    //         ...defaultShippersId1,
                    //     ])),
                    //     "file": fileUrl1 !== '' ? [fileUrl1] : [],
                    // }] : []),
                    // ...(watch('doc_7_perm_lod_2') && watch('shipper_id_2') ? [{
                    //     "id": null,
                    //     "ir": watch('doc_7_perm_lod_2') ? parseInt(watch('doc_7_perm_lod_2')) : null,
                    //     "io": watch('doc_7_jud_soong_kaw_ook_2') ? parseInt(watch('doc_7_jud_soong_kaw_ook_2')) : null, // 3 จุดส่งเข้า, 4 จุดส่งออก
                    //     "area": watch('doc_7_area_2'), // area
                    //     "nom_point": watch('doc_7_nom_point_2'),
                    //     "nom_value_mmscfh": watch('doc_7_nom_value_2') ? formatNumberSixDecimalNoComma(watch('doc_7_nom_value_2')) : '',
                    //     "gas_command": watch('doc_7_gas_command_2'),
                    //     "gas_more": watch('doc_7_gas_more_2'),
                    //     "shipper": Array.from(new Set([
                    //         ...selectedShippers2,
                    //         ...defaultShippersId2,
                    //     ])),
                    //     "file": fileUrl2 !== '' ? [fileUrl2] : [],
                    // }] : []),
                    // ...(watch('doc_7_perm_lod_3') && watch('shipper_id_3') ? [{
                    //     "id": null,
                    //     "ir": watch('doc_7_perm_lod_3') ? parseInt(watch('doc_7_perm_lod_3')) : null,
                    //     "io": watch('doc_7_jud_soong_kaw_ook_3') ? parseInt(watch('doc_7_jud_soong_kaw_ook_3')) : null, // 3 จุดส่งเข้า, 4 จุดส่งออก
                    //     "area": watch('doc_7_area_3'), // area
                    //     "nom_point": watch('doc_7_nom_point_3'),
                    //     "nom_value_mmscfh": watch('doc_7_nom_value_3') ? formatNumberSixDecimalNoComma(watch('doc_7_nom_value_3')) : '',
                    //     "gas_command": watch('doc_7_gas_command_3'),
                    //     "gas_more": watch('doc_7_gas_more_3'),
                    //     "shipper": Array.from(new Set([
                    //         ...selectedShippers3,
                    //         ...defaultShippersId3,
                    //     ])),
                    //     "file": fileUrl3 !== '' ? [fileUrl3] : [],
                    // }] : []),
                    // ...(watch('doc_7_perm_lod_4') && watch('shipper_id_4') ? [{
                    //     "id": null,
                    //     "ir": watch('doc_7_perm_lod_4') ? parseInt(watch('doc_7_perm_lod_4')) : null,
                    //     "io": watch('doc_7_jud_soong_kaw_ook_4') ? parseInt(watch('doc_7_jud_soong_kaw_ook_4')) : null, // 3 จุดส่งเข้า, 4 จุดส่งออก
                    //     "area": watch('doc_7_area_4'), // area
                    //     "nom_point": watch('doc_7_nom_point_4'),
                    //     "nom_value_mmscfh": watch('doc_7_nom_value_4') ? formatNumberSixDecimalNoComma(watch('doc_7_nom_value_4')) : '',
                    //     "gas_command": watch('doc_7_gas_command_4'),
                    //     "gas_more": watch('doc_7_gas_more_4'),
                    //     "shipper": Array.from(new Set([
                    //         ...selectedShippers4,
                    //         ...defaultShippersId4,
                    //     ])),
                    //     "file": fileUrl4 !== '' ? [fileUrl4] : [],
                    // }] : []),
                    // ...(watch('doc_7_perm_lod_5') && watch('shipper_id_5') ? [{
                    //     "id": null,
                    //     "ir": watch('doc_7_perm_lod_5') ? parseInt(watch('doc_7_perm_lod_5')) : null,
                    //     "io": watch('doc_7_jud_soong_kaw_ook_5') ? parseInt(watch('doc_7_jud_soong_kaw_ook_5')) : null, // 3 จุดส่งเข้า, 4 จุดส่งออก
                    //     "area": watch('doc_7_area_5'), // area
                    //     "nom_point": watch('doc_7_nom_point_5'),
                    //     "nom_value_mmscfh": watch('doc_7_nom_value_5') ? formatNumberSixDecimalNoComma(watch('doc_7_nom_value_5')) : '',
                    //     "gas_command": watch('doc_7_gas_command_5'),
                    //     "gas_more": watch('doc_7_gas_more_5'),
                    //     "shipper": Array.from(new Set([
                    //         ...selectedShippers5,
                    //         ...defaultShippersId5,
                    //     ])),
                    //     "file": fileUrl5 !== '' ? [fileUrl5] : [],
                    // }] : []),
                    ...(extraGasShippers ?? []),
                ],
                "email_event_for_shipper": selectedEmailGroup,
                "cc_email": emailGroup
            }
            setdataPDFItem({userDT:userDT, dataOpenDocument: dataOpenDocument, data:[{item:{...data, ...payload_tso_create,}, data: data}], shipperData: shipperData, dataNomPointForDoc7: dataNomPointForDoc7})

            setDataSubmit(payload_tso_create)
            setModaConfirmSave(true)

        } else {
            let data_post_na: any = {}
            if (!isShipper) {
                // mode edit tso
                const generate = dataOpenDocument?.event_doc_status_id == 6 ? true : false;
                const extraLegacyBlocks = doc7ExtraFormRowsToLegacyInputs(getValues("doc7_extra_blocks") ?? []);
                const extraGasShippers = buildGasShipperRowsForTsoEdit({ blocks: extraLegacyBlocks, generate });
                data_post_na = {
                    // "document_id": documentId, // เอาไว้ใช้เส้น POST event/ofo/doc5/edit/${id}
                    "generate": dataOpenDocument?.event_doc_status_id == 6 ? true : false, // true gen , false default
                    "id_runnumber": dataOpenDocument?.event_runnumber_ofo_id, // ใส่มาตอน edit version 
                    "id_documents": dataOpenDocument?.id, // ตอนสร้าง null | ถ้าใส่ id_runnumber ใส่มาด้วย | ตอน edit version ส่งมาด้วย | (ถ้าตอน status generate ส่ง id มาด้วย )

                    "longdo_dict": data?.longdo_dict, //สำเนา
                    "event_date": dayjs(watch('event_date')).format("YYYY-MM-DD"), // วันที่ออกเอกสาร

                    "doc_7_input_date_time_of_the_incident": watch('doc_7_input_date_time_of_the_incident'), //วัน/เวลาที่เกิดเหตุ
                    "doc_7_input_detail_incident": watch('doc_7_input_detail_incident'), //รายละเอียดของเหตุการณ์ และผลกระทบต่อระบบส่งก๊าซ

                    "doc_7_input_time_event_start_date": watch('doc_7_input_time_event_start_date') ? watch('doc_7_input_time_event_start_date') : null, //วันที่เริ่มดำเนินการ เริ่ม วัน
                    "doc_7_input_time_event_start_time": watch('doc_7_input_time_event_start_time') ? dayjs(watch('doc_7_input_time_event_start_time')).format('HH:mm') : null, //วันที่เริ่มดำเนินการ เริ่ม เวลา
                    "doc_7_input_time_event_end_date": watch('doc_7_input_time_event_end_date') ? watch('doc_7_input_time_event_end_date') : null, //วันที่เริ่มดำเนินการ ถึง วัน
                    "doc_7_input_time_event_end_time": watch('doc_7_input_time_event_end_time') ? dayjs(watch('doc_7_input_time_event_end_time')).format('HH:mm') : null, //วันที่เริ่มดำเนินการ ถึง เวลา
                    "doc_7_input_note": watch('doc_7_input_note'), //หมายเหตุ 

                    "doc_7_input_ref_1_id": watch('doc_7_input_ref_1_id') ? 1 : null, // อ้างอิง อันแรก ติ้กใส่ 1 ไม่ติ๊ก null
                    "doc_7_input_ref_2_id": watch('doc_7_input_ref_2_id') ? 2 : null, // อ้างอิง อันแรก ติ้กใส่ 2 ไม่ติ๊ก null

                    "event_doc_ofo_type_id": watch('event_doc_ofo_type_id'), //ประเภท 
                    "event_doc_ofo_gas_tranmiss_id": watch('event_doc_ofo_gas_tranmiss_id') ? parseInt(watch('event_doc_ofo_gas_tranmiss_id')) : null, //ระบบส่งก๊าซ 
                    "event_doc_ofo_gas_tranmiss_other": watch('event_doc_ofo_gas_tranmiss_other') ? watch('event_doc_ofo_gas_tranmiss_other') : null, // event_doc_ofo_gas_tranmiss_other 4 ใส่ด้วย

                    "gas_shipper": [
                        // ...(watch('doc_7_perm_lod_1') ? [{
                        //     "id": dataOpenDocument?.event_doc_status_id == 6 ? idChudTee1 : null,
                        //     "ir": watch('doc_7_perm_lod_1') ? parseInt(watch('doc_7_perm_lod_1')) : null,
                        //     "io": watch('doc_7_jud_soong_kaw_ook_1') ? parseInt(watch('doc_7_jud_soong_kaw_ook_1')) : null, // 3 จุดส่งเข้า, 4 จุดส่งออก
                        //     "area": watch('doc_7_area_1'), // area
                        //     "nom_point": watch('doc_7_nom_point_1'),
                        //     "nom_value_mmscfh": watch('doc_7_nom_value_1') ? formatNumberSixDecimalNoComma(watch('doc_7_nom_value_1')) : '',
                        //     "gas_command": watch('doc_7_gas_command_1'),
                        //     "gas_more": watch('doc_7_gas_more_1'),
                        //     "shipper": Array.from(new Set([
                        //         ...selectedShippers1,
                        //         ...defaultShippersId1,
                        //     ])),
                        //     "file": fileUrl1 !== '' ? [fileUrl1] : [],
                        // }] : []),
                        // ...(watch('doc_7_perm_lod_2') ? [{
                        //     "id": dataOpenDocument?.event_doc_status_id == 6 ? idChudTee2 : null,
                        //     "ir": watch('doc_7_perm_lod_2') ? parseInt(watch('doc_7_perm_lod_2')) : null,
                        //     "io": watch('doc_7_jud_soong_kaw_ook_2') ? parseInt(watch('doc_7_jud_soong_kaw_ook_2')) : null, // 3 จุดส่งเข้า, 4 จุดส่งออก
                        //     "area": watch('doc_7_area_2'), // area
                        //     "nom_point": watch('doc_7_nom_point_2'),
                        //     "nom_value_mmscfh": watch('doc_7_nom_value_2') ? formatNumberSixDecimalNoComma(watch('doc_7_nom_value_2')) : '',
                        //     "gas_command": watch('doc_7_gas_command_2'),
                        //     "gas_more": watch('doc_7_gas_more_2'),
                        //     "shipper": Array.from(new Set([
                        //         ...selectedShippers2,
                        //         ...defaultShippersId2,
                        //     ])),
                        //     "file": fileUrl2 !== '' ? [fileUrl2] : [],
                        // }] : []),
                        // ...(watch('doc_7_perm_lod_3') ? [{
                        //     "id": dataOpenDocument?.event_doc_status_id == 6 ? idChudTee3 : null,
                        //     "ir": watch('doc_7_perm_lod_3') ? parseInt(watch('doc_7_perm_lod_3')) : null,
                        //     "io": watch('doc_7_jud_soong_kaw_ook_3') ? parseInt(watch('doc_7_jud_soong_kaw_ook_3')) : null, // 3 จุดส่งเข้า, 4 จุดส่งออก
                        //     "area": watch('doc_7_area_3'), // area
                        //     "nom_point": watch('doc_7_nom_point_3'),
                        //     "nom_value_mmscfh": watch('doc_7_nom_value_3') ? formatNumberSixDecimalNoComma(watch('doc_7_nom_value_3')) : '',
                        //     "gas_command": watch('doc_7_gas_command_3'),
                        //     "gas_more": watch('doc_7_gas_more_3'),
                        //     "shipper": Array.from(new Set([
                        //         ...selectedShippers3,
                        //         ...defaultShippersId3,
                        //     ])),
                        //     "file": fileUrl3 !== '' ? [fileUrl3] : [],
                        // }] : []),
                        // ...(watch('doc_7_perm_lod_4') ? [{
                        //     "id": dataOpenDocument?.event_doc_status_id == 6 ? idChudTee4 : null,
                        //     "ir": watch('doc_7_perm_lod_4') ? parseInt(watch('doc_7_perm_lod_4')) : null,
                        //     "io": watch('doc_7_jud_soong_kaw_ook_4') ? parseInt(watch('doc_7_jud_soong_kaw_ook_4')) : null, // 3 จุดส่งเข้า, 4 จุดส่งออก
                        //     "area": watch('doc_7_area_4'), // area
                        //     "nom_point": watch('doc_7_nom_point_4'),
                        //     "nom_value_mmscfh": watch('doc_7_nom_value_4') ? formatNumberSixDecimalNoComma(watch('doc_7_nom_value_4')) : '',
                        //     "gas_command": watch('doc_7_gas_command_4'),
                        //     "gas_more": watch('doc_7_gas_more_4'),
                        //     "shipper": Array.from(new Set([
                        //         ...selectedShippers4,
                        //         ...defaultShippersId4,
                        //     ])),
                        //     "file": fileUrl4 !== '' ? [fileUrl4] : [],
                        // }] : []),
                        // ...(watch('doc_7_perm_lod_5') ? [{
                        //     "id": dataOpenDocument?.event_doc_status_id == 6 ? idChudTee5 : null,
                        //     "ir": watch('doc_7_perm_lod_5') ? parseInt(watch('doc_7_perm_lod_5')) : null,
                        //     "io": watch('doc_7_jud_soong_kaw_ook_5') ? parseInt(watch('doc_7_jud_soong_kaw_ook_5')) : null, // 3 จุดส่งเข้า, 4 จุดส่งออก
                        //     "area": watch('doc_7_area_5'), // area
                        //     "nom_point": watch('doc_7_nom_point_5'),
                        //     "nom_value_mmscfh": watch('doc_7_nom_value_5') ? formatNumberSixDecimalNoComma(watch('doc_7_nom_value_5')) : '',
                        //     "gas_command": watch('doc_7_gas_command_5'),
                        //     "gas_more": watch('doc_7_gas_more_5'),
                        //     "shipper": Array.from(new Set([
                        //         ...selectedShippers5,
                        //         ...defaultShippersId5,
                        //     ])),
                        //     "file": fileUrl5 !== '' ? [fileUrl5] : [],
                        // }] : []),
                        ...(extraGasShippers ?? []),
                    ],
                    "email_event_for_shipper": Array.from(new Set([
                        ...selectedEmailGroup,
                        ...defaultEmailGrouId,
                    ])),
                    "cc_email": Array.from(new Set([
                        ...emailGroup,
                        ...defaultCcEmailRender,
                    ]))
                }

            } else {
                // mode edit shipper
                data_post_na = {
                    "document_id": documentId, // เอาไว้ใช้เส้น PUT event/ofo/doc7/${id}
                    "event_doc_status_id": 5,
                    "event_date": dayjs(watch('event_date')).format("YYYY-MM-DD"), // วันที่ออกเอกสาร
                    "id_runnumber": dataOpenDocument?.event_runnumber_ofo_id,
                    "doc_7_input_note_shipper": watch('doc_7_input_note_shipper') || null
                }
            }
            console.log('data_post_na : ', data_post_na);
            setdataPDFItem({userDT:userDT, dataOpenDocument: dataOpenDocument, data:[{item:{...data, ...data_post_na,}, data: data}], shipperData: shipperData, dataNomPointForDoc7: dataNomPointForDoc7})

            setDataSubmit(data_post_na)
            setModaConfirmSave(true)
        }
    }

    // #region UPLOAD FILE
    // ############# UPLOAD FILE #############
    // const [fileName1, setFileName1] = useState('Maximum File 10 MB');
    // const [fileName2, setFileName2] = useState('Maximum File 10 MB');
    // const [fileName3, setFileName3] = useState('Maximum File 10 MB');
    // const [fileName4, setFileName4] = useState('Maximum File 10 MB');
    // const [fileName5, setFileName5] = useState('Maximum File 10 MB');

    // const [fileUrl1, setFileUrl1] = useState<any>('');
    // const [fileUrl2, setFileUrl2] = useState<any>('');
    // const [fileUrl3, setFileUrl3] = useState<any>('');
    // const [fileUrl4, setFileUrl4] = useState<any>('');
    // const [fileUrl5, setFileUrl5] = useState<any>('');
    // const [isUploading, setIsUploading] = useState(false);

    const [IsErrorChudTee, setIsErrorChudTee] = useState<any>('');


    // const handleFileChange = async (e: any, chud_tee: number) => {
    //     setIsLoading(true);
    //     const file = e.target.files[0];
    //     const maxSizeInMB = 10;
    //     const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

    //     // เก็บ setter functions ตาม chud_tee index
    //     const fileNameSetters = [setFileName1, setFileName2, setFileName3, setFileName4, setFileName5];
    //     const fileUrlSetters = [setFileUrl1, setFileUrl2, setFileUrl3, setFileUrl4, setFileUrl5];

    //     // index array (chud_tee เริ่มจาก 1)
    //     const index = chud_tee - 1;

    //     if (!fileNameSetters[index] || !fileUrlSetters[index]) {
    //         // Invalid chud_tee value: chud_tee
    //         setIsLoading(false);
    //         return;
    //     }

    //     if (!file) {
    //         fileNameSetters[index]('No file chosen');
    //         setIsLoading(false);
    //         return;
    //     }

    //     setIsUploading(true);

    //     if (file.size > maxSizeInBytes) {
    //         fileNameSetters[index]('The file is larger than 10 MB.');
    //         setIsLoading(false);
    //         setIsUploading(false);
    //         setIsErrorChudTee(chud_tee)
    //         // File size too large:
    //         return;
    //     }

    //     try {
    //         const response: any = await uploadFileService('/files/uploadfile/', file);
    //         fileNameSetters[index](file.name);
    //         fileUrlSetters[index](response?.file?.url);
    //     } catch (error) {
    //         // Upload failed:
    //         fileNameSetters[index]('Upload failed');
    //     }

    //     setTimeout(() => {
    //         setIsUploading(false);
    //         setIsLoading(false);
    //     }, 500);
    // };
    // #endregion

    // const handleRemoveFile = (chud_tee: any) => {
    //     setIsErrorChudTee('')
    //     switch (chud_tee) {
    //         case 1:
    //             setFileName1("Maximum File 10 MB");
    //             setFileUrl1('')
    //             break;
    //         case 2:
    //             setFileName2("Maximum File 10 MB");
    //             setFileUrl2('')
    //             break;
    //         case 3:
    //             setFileName3("Maximum File 10 MB");
    //             setFileUrl3('')
    //             break;
    //         case 4:
    //             setFileName4("Maximum File 10 MB");
    //             setFileUrl4('')
    //             break;
    //         case 5:
    //             setFileName5("Maximum File 10 MB");
    //             setFileUrl5('')
    //             break;
    //     }

    //     // setFileName("Maximum File 10 MB"); // Reset fileName
    //     // setFileUrl('')
    //     setValue('file', null);
    // };

    // #region DOWNLOAD FILE
    // ############# DOWNLOAD FILE #############
    // const downloadFile = async (chud_tee: any) => {
    //     let url_ = ''
    //     switch (chud_tee) {
    //         case 1:
    //             url_ = fileNameEditTextUrl1
    //             break;
    //         case 2:
    //             url_ = fileNameEditTextUrl2
    //             break;
    //         case 3:
    //             url_ = fileNameEditTextUrl3
    //             break;
    //         case 4:
    //             url_ = fileNameEditTextUrl4
    //             break;
    //         case 5:
    //             url_ = fileNameEditTextUrl5
    //             break;
    //     }

    //     try {
    //         const response = await fetch(url_);
    //         const blob = await response.blob();
    //         const url = URL.createObjectURL(blob);
    //         const fileName = url_.split('/').pop() || 'image.jpg';

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


    // #region SHIPPER SELECT
    // // ############# SHIPPER SELECT #############
    // const [selectedShippers1, setSelectedShippers1] = useState<string[]>([]);
    // const [selectedShippers2, setSelectedShippers2] = useState<string[]>([]);
    // const [selectedShippers3, setSelectedShippers3] = useState<string[]>([]);
    // const [selectedShippers4, setSelectedShippers4] = useState<string[]>([]);
    // const [selectedShippers5, setSelectedShippers5] = useState<string[]>([]);

    // const [selectedShippersRender1, setSelectedShippersRender1] = useState<any[]>([]);
    // const [selectedShippersRender2, setSelectedShippersRender2] = useState<any[]>([]);
    // const [selectedShippersRender3, setSelectedShippersRender3] = useState<any[]>([]);
    // const [selectedShippersRender4, setSelectedShippersRender4] = useState<any[]>([]);
    // const [selectedShippersRender5, setSelectedShippersRender5] = useState<any[]>([]);

    // const handleSelectChange = (event: any, chod_tee: any) => {
    //     const value = event.target.value;

    //     switch (chod_tee) {
    //         case 1: // ชุดที่ 1
    //             if (value.includes("all")) {
    //                 // เอาอันที่มีอยู่แล้วออกจาก option 
    //                 setSelectedShippers1(selectedShippers1.length === dataShipper1?.length ? [] : dataShipper1?.filter((item: any) => !defaultShippersId1?.includes(item.id)).map((item: any) => item.id));
    //                 setSelectedShippersRender1(selectedShippers1.length === dataShipper1?.length ? [] : dataShipper1?.filter((item: any) => !defaultShippersId1?.includes(item.id)).map((item: any) => item));
    //                 setValue("shipper_id_1", selectedShippers1.length === dataShipper1?.length ? [] : dataShipper1?.filter((item: any) => !defaultShippersId1?.includes(item.id)).map((item: any) => item.id));
    //             } else {
    //                 setSelectedShippers1(value);
    //                 setValue("shipper_id_1", value);

    //                 const filter_shipper = dataShipper1?.filter((item: any) => value.includes(item?.id))
    //                 setSelectedShippersRender1(filter_shipper)
    //             }
    //             clearErrors('shipper_id_1');
    //             break;
    //         case 2: // ชุดที่ 2
    //             if (value.includes("all")) {
    //                 // เอาอันที่มีอยู่แล้วออกจาก option 
    //                 setSelectedShippers2(selectedShippers2.length === dataShipper2.length ? [] : dataShipper2?.filter((item: any) => !defaultShippersId2?.includes(item.id)).map((item: any) => item.id));
    //                 setSelectedShippersRender2(selectedShippers2.length === dataShipper2.length ? [] : dataShipper2?.filter((item: any) => !defaultShippersId2?.includes(item.id)).map((item: any) => item));
    //                 setValue("shipper_id_2", selectedShippers2.length === dataShipper2.length ? [] : dataShipper2?.filter((item: any) => !defaultShippersId2?.includes(item.id)).map((item: any) => item.id));
    //             } else {
    //                 setSelectedShippers2(value);
    //                 setValue("shipper_id_2", value);

    //                 const filter_shipper = dataShipper2?.filter((item: any) => value.includes(item?.id))
    //                 setSelectedShippersRender2(filter_shipper)
    //             }
    //             clearErrors('shipper_id_2');
    //             break;
    //         case 3: // ชุดที่ 3
    //             if (value.includes("all")) {
    //                 // เอาอันที่มีอยู่แล้วออกจาก option 
    //                 setSelectedShippers3(selectedShippers3.length === dataShipper3.length ? [] : dataShipper3?.filter((item: any) => !defaultShippersId3?.includes(item.id)).map((item: any) => item.id));
    //                 setSelectedShippersRender3(selectedShippers3.length === dataShipper3.length ? [] : dataShipper3?.filter((item: any) => !defaultShippersId3?.includes(item.id)).map((item: any) => item));
    //                 setValue("shipper_id_3", selectedShippers3.length === dataShipper3.length ? [] : dataShipper3?.filter((item: any) => !defaultShippersId3?.includes(item.id)).map((item: any) => item.id));
    //             } else {
    //                 setSelectedShippers3(value);
    //                 setValue("shipper_id_3", value);

    //                 const filter_shipper = dataShipper3?.filter((item: any) => value.includes(item?.id))
    //                 setSelectedShippersRender3(filter_shipper)
    //             }
    //             clearErrors('shipper_id_3');
    //             break;
    //         case 4: // ชุดที่ 4
    //             if (value.includes("all")) {
    //                 // เอาอันที่มีอยู่แล้วออกจาก option 
    //                 setSelectedShippers4(selectedShippers4.length === dataShipper4.length ? [] : dataShipper4?.filter((item: any) => !defaultShippersId4?.includes(item.id)).map((item: any) => item.id));
    //                 setSelectedShippersRender4(selectedShippers4.length === dataShipper4.length ? [] : dataShipper4?.filter((item: any) => !defaultShippersId4?.includes(item.id)).map((item: any) => item));
    //                 setValue("shipper_id_4", selectedShippers4.length === dataShipper4.length ? [] : dataShipper4?.filter((item: any) => !defaultShippersId4?.includes(item.id)).map((item: any) => item.id));
    //             } else {
    //                 setSelectedShippers4(value);
    //                 setValue("shipper_id_4", value);

    //                 const filter_shipper = dataShipper4?.filter((item: any) => value.includes(item?.id))
    //                 setSelectedShippersRender4(filter_shipper)
    //             }
    //             clearErrors('shipper_id_4');
    //             break;
    //         case 5: // ชุดที่ 5
    //             if (value.includes("all")) {
    //                 // เอาอันที่มีอยู่แล้วออกจาก option 
    //                 setSelectedShippers5(selectedShippers5.length === dataShipper5.length ? [] : dataShipper5?.filter((item: any) => !defaultShippersId5?.includes(item.id)).map((item: any) => item.id));
    //                 setSelectedShippersRender5(selectedShippers5.length === dataShipper5.length ? [] : dataShipper5?.filter((item: any) => !defaultShippersId5?.includes(item.id)).map((item: any) => item));
    //                 setValue("shipper_id_5", selectedShippers5.length === dataShipper5.length ? [] : dataShipper5?.filter((item: any) => !defaultShippersId5?.includes(item.id)).map((item: any) => item.id));
    //             } else {
    //                 setSelectedShippers5(value);
    //                 setValue("shipper_id_5", value);

    //                 const filter_shipper = dataShipper5?.filter((item: any) => value.includes(item?.id))
    //                 setSelectedShippersRender5(filter_shipper)
    //             }
    //             clearErrors('shipper_id_5');
    //             break;
    //     }
    // };

    // const removeShipper = (idToRemove: number, chud_tee: any) => {

    //     switch (chud_tee) {
    //         case 1:
    //             setSelectedShippers1((prevGroup: any) => prevGroup.filter((data: any, index: number) => data !== idToRemove));
    //             setSelectedShippersRender1((prevGroup: any) => prevGroup.filter((data: any, index: number) => data?.id !== idToRemove));
    //             break;
    //         case 2:
    //             setSelectedShippers2((prevGroup: any) => prevGroup.filter((data: any, index: number) => data !== idToRemove));
    //             setSelectedShippersRender2((prevGroup: any) => prevGroup.filter((data: any, index: number) => data?.id !== idToRemove));
    //             break;
    //         case 3:
    //             setSelectedShippers3((prevGroup: any) => prevGroup.filter((data: any, index: number) => data !== idToRemove));
    //             setSelectedShippersRender3((prevGroup: any) => prevGroup.filter((data: any, index: number) => data?.id !== idToRemove));
    //             break;
    //         case 4:
    //             setSelectedShippers4((prevGroup: any) => prevGroup.filter((data: any, index: number) => data !== idToRemove));
    //             setSelectedShippersRender4((prevGroup: any) => prevGroup.filter((data: any, index: number) => data?.id !== idToRemove));
    //             break;
    //         case 5:
    //             setSelectedShippers5((prevGroup: any) => prevGroup.filter((data: any, index: number) => data !== idToRemove));
    //             setSelectedShippersRender5((prevGroup: any) => prevGroup.filter((data: any, index: number) => data?.id !== idToRemove));
    //             break;
    //     }
    // };

    // ############# EMAIL GROUP SELECT #############
    const [selectedEmailGroup, setSelectedEmailGroup] = useState<string[]>([]);
    const [selectedEmailGroupRender, setSelectedEmailGroupRender] = useState<any[]>([]);

    const handleSelectEmailGroup = (event: any) => {
        handletrickerEdit();
        const value = event.target.value;

        if (value.includes("all")) {
            setSelectedEmailGroup(selectedEmailGroup.length === emailGroupForEventData.length ? [] : emailGroupForEventData.map((item: any) => item.id));
            setSelectedEmailGroupRender(selectedEmailGroup.length === emailGroupForEventData.length ? [] : emailGroupForEventData.map((item: any) => item));
            // setValue("shipper_id", selectedEmailGroup.length === emailGroupForEventData.length ? [] : emailGroupForEventData.map((item: any) => item.id));
        } else {
            setSelectedEmailGroup(value);
            // setValue("shipper_id", value);

            const filter_shipper = emailGroupForEventData?.filter((item: any) => value.includes(item?.id))
            setSelectedEmailGroupRender(filter_shipper)
        }
        // clearErrors('shipper_id');
    };

    const removeEmailGroup = (idToRemove: number) => {
        setSelectedEmailGroup((prevGroup: any) => prevGroup.filter((data: any, index: number) => data !== idToRemove));
        setSelectedEmailGroupRender((prevGroup: any) => prevGroup.filter((data: any, index: number) => data?.id !== idToRemove));
    };

    // ############# CC MAIL #############
    const [emailGroup, setEmailGroup] = useState<any>([]);
    const [alertDupMail, setAlertDupMail] = useState<any>(false);
    const addEmailGroup = (data: any) => {
        handletrickerEdit();

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

    // const horizoneDivide = () => {
    //     return (<div className="my-2 col-span-2">
    //         <hr className="border-t border-[#DFE4EA] w-full mx-auto" />
    //     </div>)
    // }

    // #region สำหรับปุ่ม RESET
    const resetPermLod = () => {
        const commandList = getValues("doc7_extra_blocks")
        for(let i = 0; i <= commandList.length; i++){
            const commandIndex = i + 1;
            // clear เพิ่ม = 1, ลด = 2
            setValue(`doc_7_perm_lod_${commandIndex}`, null)
    
            // clear จุดส่งเข้า = 3, จุดส่งออก = 4
            setValue(`doc_7_jud_soong_kaw_ook_${commandIndex}`, null)


            setValue(`doc_7_area_${commandIndex}`, null)

            // clear ปริมาณก๊าซที่
            setValue(`doc_7_nom_point_${commandIndex}`, null)

            // clear คิดเป็นปริมาณ (MMSCFH)
            setValue(`doc_7_nom_value_${commandIndex}`, '') // จะเคลียร์ value ให้ numbericFormat ต้อง set string ไม่ใช่ undefined หรือ null

            // clear การสั่งการ
            setValue(`doc_7_gas_command_${commandIndex}`, null)

            // clear ข้อมูลเพิ่มเติม
            setValue(`doc_7_gas_more_${commandIndex}`, null)

            setValue(`shipper_id_${commandIndex}`, null);
            
            const base = `doc7_extra_blocks.${i}` as const;
            setValue(`${base}.area` as any, null);
            setValue(`${base}.nom_point` as any, null);
            setValue(`${base}.ir` as any, null);
            setValue(`${base}.io` as any, null);
            setValue(`${base}.nom_value_mmscfh` as any, '');
            setValue(`${base}.gas_command` as any, null);
            setValue(`${base}.gas_more` as any, null);
            setValue(`${base}.shipper` as any, null);
            setValue(`${base}.defaultShipperIds` as any, null);
            setValue(`${base}.shipperIdValue` as any, null);
            setValue(`${base}.fileUrl` as any, null);
            setValue(`${base}.fileName` as any, null);
        }
        if (mode == 'create') {
            // reset mode create
            // reset(); // อันนี้มัน set undefined เข้าทุก ๆ  register ของ react-hook-form

            // reset dynamic blocks 6..N -> back to 1 empty row (no default ir/io)
            replaceDoc7Extra([emptyDoc7ExtraBlock()]);

        } else {
            // reset mode อื่น

            {/* 
                key ในแต่ละชุด

              // ชุด 1 
                doc_7_perm_lod_1 : เพิ่ม = 1, ลด = 2
                doc_7_jud_soong_kaw_ook_1 : เข้า = 3, ออก = 4
                doc_7_area_1 : area
                doc_7_nom_point_1  : ปริมาณก๊าซที่
                doc_7_nom_value_1 : คิดเป็นปริมาณ (MMSCFH)
                shipper_id_1 : shipper
                doc_7_gas_command_1 : การสั่งการ
                doc_7_gas_more_1 : ข้อมูลเพิ่มเติม

            */}

            // ตรงนี้ต้อง set ของเดิมเข้า
                setDataChudTee();

            // reset dynamic blocks 6..N for TSO edit/view
            // if (!isShipper) {
            //     const DOC7_LEGACY_BLOCK_COUNT = 5;
            //     const extrasServer = (dataOpenDocument?.event_doc_gas_shipper_ofo ?? []).slice(DOC7_LEGACY_BLOCK_COUNT);
            //     const blocks = extrasServer.map((g: any) => {
            //         const ir = g?.ir ?? "";
            //         const io = g?.io ?? "";
            //         const area = g?.area_id ?? "";
            //         const nom_point = g?.nom_point ?? "";
            //         const nom_value_mmscfh = g?.nom_value_mmscfh ?? "";
            //         const gas_command = g?.gas_command ?? "";
            //         const gas_more = g?.gas_more ?? "";

            //         const groupIds = (g?.event_doc_gas_shipper_ofo_match ?? []).map(
            //             (m: any) => m?.event_document_ofo?.group_id,
            //         );

            //         const entry_exit_id = io == 3 || io === "3" ? 1 : 2;
            //         const areaOptions = (dataNomPointForDoc7 ?? []).filter((it: any) => it.entry_exit_id == entry_exit_id);
            //         const areaObj = areaOptions.find((a: any) => a.id == area);
            //         const nomObj = (areaObj?.nom ?? []).find((n: any) => n.id == nom_point);
            //         const shipperList = nomObj?.shipper ?? [];
            //         const defaultShipperIds = shipperList.filter((s: any) => groupIds?.includes(s.id)).map((s: any) => s.id);

            //         const persistedFileUrl =
            //             g?.event_doc_gas_shipper_ofo_file?.length > 0 ? g?.event_doc_gas_shipper_ofo_file?.[0]?.url ?? "" : "";
            //         const persistedFileName = persistedFileUrl ? cutUploadFileName(persistedFileUrl) : "Maximum File 10 MB";

            //         return {
            //             ir,
            //             io,
            //             area,
            //             nom_point,
            //             nom_value_mmscfh,
            //             gas_command,
            //             gas_more,
            //             shipper: [],
            //             defaultShipperIds,
            //             shipperIdValue: null,
            //             fileUrl: "",
            //             persistedFileUrl,
            //             fileName: persistedFileName,
            //             serverId: g?.id ?? null,
            //         } as Doc7ExtraBlockFormValue;
            //     });

            //     replaceDoc7Extra(mode === "view" ? [] : blocks.length > 0 ? blocks : [emptyDoc7ExtraBlock()]);
            // }
        }
    }

    // #region Shipper Of NomPoint

    // const getShipperOfNomPoint = (id_nom?: any, chud_tee?: any) => {
    //     // const filtered_ = dataNomPointForDoc7?.find((item: any) => item.id == id_nom)
    //     // handletrickerEdit();

    //     switch (chud_tee) {
    //         case 1:
    //             setValue("shipper_id_1", null); // ตอนเปลี่ยน nom ให้เคลียร์ shipper
    //             setSelectedShippers1([]); // ตอนเปลี่ยน nom ให้เคลียร์ shipper
    //             setSelectedShippersRender1([]); // ตอนเปลี่ยน nom ให้เคลียร์ shipper
    //             const filtered_ = dataNomPoint1?.find((item: any) => item.id == id_nom)
    //             setDataShipper1(filtered_?.shipper)
    //             break;
    //         case 2:
    //             setValue("shipper_id_2", null); // ตอนเปลี่ยน nom ให้เคลียร์ shipper
    //             setSelectedShippers2([]); // ตอนเปลี่ยน nom ให้เคลียร์ shipper
    //             setSelectedShippersRender2([]); // ตอนเปลี่ยน nom ให้เคลียร์ shipper
    //             const filtered_2 = dataNomPoint2?.find((item: any) => item.id == id_nom)
    //             setDataShipper2(filtered_2?.shipper)
    //             break;
    //         case 3:
    //             setValue("shipper_id_3", null); // ตอนเปลี่ยน nom ให้เคลียร์ shipper
    //             setSelectedShippers3([]); // ตอนเปลี่ยน nom ให้เคลียร์ shipper
    //             setSelectedShippersRender3([]); // ตอนเปลี่ยน nom ให้เคลียร์ shipper
    //             const filtered_3 = dataNomPoint3?.find((item: any) => item.id == id_nom)
    //             setDataShipper3(filtered_3?.shipper)
    //             break;
    //         case 4:
    //             setValue("shipper_id_4", null); // ตอนเปลี่ยน nom ให้เคลียร์ shipper
    //             setSelectedShippers4([]); // ตอนเปลี่ยน nom ให้เคลียร์ shipper
    //             setSelectedShippersRender4([]); // ตอนเปลี่ยน nom ให้เคลียร์ shipper
    //             const filtered_4 = dataNomPoint4?.find((item: any) => item.id == id_nom)
    //             setDataShipper4(filtered_4?.shipper)
    //             break;
    //         case 5:
    //             setValue("shipper_id_5", null); // ตอนเปลี่ยน nom ให้เคลียร์ shipper
    //             setSelectedShippers5([]); // ตอนเปลี่ยน nom ให้เคลียร์ shipper
    //             setSelectedShippersRender5([]); // ตอนเปลี่ยน nom ให้เคลียร์ shipper
    //             const filtered_5 = dataNomPoint5?.find((item: any) => item.id == id_nom)
    //             setDataShipper5(filtered_5?.shipper)
    //             break;
    //     }
    // }
    // #endregion Shipper Of NomPoint

    // #region NomPoint Of Area
    // const [dataShipper2, setDataShipper2] = useState<any>([])
    // const [dataShipper3, setDataShipper3] = useState<any>([])
    // const [dataShipper4, setDataShipper4] = useState<any>([])
    // const [dataShipper5, setDataShipper5] = useState<any>([])

    // const getNomPointOfArea = (id_area?: any, chud_tee?: any) => {
    //     // handletrickerEdit();
    //     const filtered_ = dataNomPointForDoc7?.find((item: any) => item.id == id_area)

    //     switch (chud_tee) {
    //         case 1:
    //             setValue("doc_7_nom_point_1", null); // ตอนเปลี่ยน area ให้เคลียร์ nom
    //             setValue("shipper_id_1", null); // ตอนเปลี่ยน area ให้เคลียร์ shipper
    //             setSelectedShippers1([]); // ตอนเปลี่ยน area ให้เคลียร์ shipper
    //             setSelectedShippersRender1([]); // ตอนเปลี่ยน area ให้เคลียร์ shipper
    //             setDataNomPoint1(filtered_?.nom)
    //             break;
    //         case 2:
    //             setValue("doc_7_nom_point_2", null); // ตอนเปลี่ยน area ให้เคลียร์ nom
    //             setValue("shipper_id_2", null); // ตอนเปลี่ยน area ให้เคลียร์ shipper
    //             setSelectedShippers2([]); // ตอนเปลี่ยน area ให้เคลียร์ shipper
    //             setSelectedShippersRender2([]); // ตอนเปลี่ยน area ให้เคลียร์ shipper
    //             setDataNomPoint2(filtered_?.nom)
    //             break;
    //         case 3:
    //             setValue("doc_7_nom_point_3", null); // ตอนเปลี่ยน area ให้เคลียร์ nom
    //             setValue("shipper_id_3", null); // ตอนเปลี่ยน area ให้เคลียร์ shipper
    //             setSelectedShippers3([]); // ตอนเปลี่ยน area ให้เคลียร์ shipper
    //             setSelectedShippersRender3([]); // ตอนเปลี่ยน area ให้เคลียร์ shipper
    //             setDataNomPoint3(filtered_?.nom)
    //             break;
    //         case 4:
    //             setValue("doc_7_nom_point_4", null); // ตอนเปลี่ยน area ให้เคลียร์ nom
    //             setValue("shipper_id_4", null); // ตอนเปลี่ยน area ให้เคลียร์ shipper
    //             setSelectedShippers4([]); // ตอนเปลี่ยน area ให้เคลียร์ shipper
    //             setSelectedShippersRender4([]); // ตอนเปลี่ยน area ให้เคลียร์ shipper
    //             setDataNomPoint4(filtered_?.nom)
    //             break;
    //         case 5:
    //             setValue("doc_7_nom_point_5", null); // ตอนเปลี่ยน area ให้เคลียร์ nom
    //             setValue("shipper_id_5", null); // ตอนเปลี่ยน area ให้เคลียร์ shipper
    //             setSelectedShippers5([]); // ตอนเปลี่ยน area ให้เคลียร์ shipper
    //             setSelectedShippersRender5([]); // ตอนเปลี่ยน area ให้เคลียร์ shipper
    //             setDataNomPoint5(filtered_?.nom)
    //             break;
    //     }
    // }

    // const getShipperOfNomPointForOnload = (id_nom?: any, chud_tee?: any) => {
    //     const filtered_ = dataNomPointForDoc7?.find((item: any) => item.id == id_nom)
    //     return filtered_?.shipper
    // }
    // #endregion Shipper Of NomPoint

    // #region Area of Chudtee
    // const [dataAreaChud1, setDataAreaChud1] = useState<any>([])
    // const [dataAreaChud2, setDataAreaChud2] = useState<any>([])
    // const [dataAreaChud3, setDataAreaChud3] = useState<any>([])
    // const [dataAreaChud4, setDataAreaChud4] = useState<any>([])
    // const [dataAreaChud5, setDataAreaChud5] = useState<any>([])

    // const filterAreaEntryExit = (entry_or_exit: any, chud_tee: any) => {
    //     handletrickerEdit();
    //     let entry_exit = entry_or_exit == 3 ? 1 : 2
    //     switch (chud_tee) {
    //         case 1:
    //             setValue("doc_7_area_1", null); // ตอนเปลี่ยนจุดส่งเข้า ออก ให้เคลียร์ area
    //             setValue("doc_7_nom_point_1", null); // ตอนเปลี่ยน area ให้เคลียร์ nom
    //             setValue("shipper_id_1", null); // ตอนเปลี่ยน area ให้เคลียร์ shipper
    //             setSelectedShippers1([]); // ตอนเปลี่ยน area ให้เคลียร์ shipper
    //             setSelectedShippersRender1([]); // ตอนเปลี่ยน area ให้เคลียร์ shipper
    //             const filtered_1 = dataNomPointForDoc7?.filter((item: any) => item.entry_exit_id == entry_exit)
    //             setDataAreaChud1(filtered_1)
    //             break;
    //         case 2:
    //             setValue("doc_7_area_2", null); // ตอนเปลี่ยนจุดส่งเข้า ออก ให้เคลียร์ area
    //             setValue("doc_7_nom_point_2", null); // ตอนเปลี่ยน area ให้เคลียร์ nom
    //             setValue("shipper_id_2", null); // ตอนเปลี่ยน area ให้เคลียร์ shipper
    //             setSelectedShippers2([]); // ตอนเปลี่ยน area ให้เคลียร์ shipper
    //             setSelectedShippersRender2([]); // ตอนเปลี่ยน area ให้เคลียร์ shipper
    //             const filtered_2 = dataNomPointForDoc7?.filter((item: any) => item.entry_exit_id == entry_exit)
    //             setDataAreaChud2(filtered_2)
    //             break;
    //         case 3:
    //             setValue("doc_7_area_3", null); // ตอนเปลี่ยนจุดส่งเข้า ออก ให้เคลียร์ area
    //             setValue("doc_7_nom_point_3", null); // ตอนเปลี่ยน area ให้เคลียร์ nom
    //             setValue("shipper_id_3", null); // ตอนเปลี่ยน area ให้เคลียร์ shipper
    //             setSelectedShippers3([]); // ตอนเปลี่ยน area ให้เคลียร์ shipper
    //             setSelectedShippersRender3([]); // ตอนเปลี่ยน area ให้เคลียร์ shipper
    //             const filtered_3 = dataNomPointForDoc7?.filter((item: any) => item.entry_exit_id == entry_exit)
    //             setDataAreaChud3(filtered_3)
    //             break;
    //         case 4:
    //             setValue("doc_7_area_4", null); // ตอนเปลี่ยนจุดส่งเข้า ออก ให้เคลียร์ area
    //             setValue("doc_7_nom_point_4", null); // ตอนเปลี่ยน area ให้เคลียร์ nom
    //             setValue("shipper_id_4", null); // ตอนเปลี่ยน area ให้เคลียร์ shipper
    //             setSelectedShippers4([]); // ตอนเปลี่ยน area ให้เคลียร์ shipper
    //             setSelectedShippersRender4([]); // ตอนเปลี่ยน area ให้เคลียร์ shipper
    //             const filtered_4 = dataNomPointForDoc7?.filter((item: any) => item.entry_exit_id == entry_exit)
    //             setDataAreaChud4(filtered_4)
    //             break;
    //         case 5:
    //             setValue("doc_7_area_5", null); // ตอนเปลี่ยนจุดส่งเข้า ออก ให้เคลียร์ area
    //             setValue("doc_7_nom_point_5", null); // ตอนเปลี่ยน area ให้เคลียร์ nom
    //             setValue("shipper_id_5", null); // ตอนเปลี่ยน area ให้เคลียร์ shipper
    //             setSelectedShippers5([]); // ตอนเปลี่ยน area ให้เคลียร์ shipper
    //             setSelectedShippersRender5([]); // ตอนเปลี่ยน area ให้เคลียร์ shipper
    //             const filtered_5 = dataNomPointForDoc7?.filter((item: any) => item.entry_exit_id == entry_exit)
    //             setDataAreaChud5(filtered_5)
    //             break;
    //     }
    // }
    // #endregion Area of Chudtee

    // check box select
    // const handleCheckOne = (what?: any) => {
    //     handletrickerEdit();

    //     // switch (what) {
    //     //     case 1:
    //     //         setValue('doc_7_input_ref_1_id', !watch('doc_7_input_ref_1_id'))
    //     //         break;
    //     //     case 2:
    //     //         setValue('doc_7_input_ref_2_id', !watch('doc_7_input_ref_2_id'))
    //     //         break;
    //     // }
    // }
    const handleCheckOne = (what?: any) => {
        handletrickerEdit();

        setValue('doc_7_input_ref_1_id', what === 1 ? true : null, {
            shouldDirty: true,
            shouldValidate: true,
        });

        setValue('doc_7_input_ref_2_id', what === 2 ? true : null, {
            shouldDirty: true,
            shouldValidate: true,
        });
        };

    // useEffect(() => {
    //     console.log('watch("doc_7_input_ref_1_id") : ', watch("doc_7_input_ref_1_id"));
    // }, [watch("doc_7_input_ref_1_id")]);
    // useEffect(() => {
    //     console.log('watch("doc_7_input_ref_2_id") : ', watch("doc_7_input_ref_2_id"));
    // }, [watch("doc_7_input_ref_2_id")]);
    // useEffect(() => {
    // register('doc_7_input_ref_1_id');
    // register('doc_7_input_ref_2_id');
    // }, [register]);

    const hasValue = (value: any) => {
        return value !== null && value !== undefined && value !== "";
    };

    const ref1 = watch("doc_7_input_ref_1_id");
    const ref2 = watch("doc_7_input_ref_2_id");

    // ถ้าข้อมูลเก่ามีทั้ง 1 และ 2 ให้เลือก 2 เป็นหลัก
    const selectedRef = hasValue(ref2) ? 2 : hasValue(ref1) ? 1 : null;

    const [formOpen, setFormOpen] = useState(false);
    const [modeOneOrTwo, setModeOneOrTwo] = useState<any>('');
    const [textAngIng1, setTextAngIng1] = useState<any>('');
    const [textAngIng2, setTextAngIng2] = useState<any>('');

    const handleEditClick = (mode: any) => {
        // handletrickerEdit();
        switch (mode) {
            case 1:
                setModeOneOrTwo('1')
                break;
            case 2:
                setModeOneOrTwo('2')
                break;
        }

        setFormOpen(true)
    }

    // #region อัพเดทอ้างอิง
    const handleFormSubmit = async (data: any) => {
        const url = '/master/event/ofo/doc7/updateRef';

        const body_post = {
            "id": parseInt(modeOneOrTwo), // 1 อ้างอิง 1, 2 อ้างอิง 2
            "text": data?.detail
        }

        let res_edit = await putService(url, body_post); // edit ให้ใช้เส้น upload เหมือนกัน by bank
        const statusCodePut = res_edit?.response?.data?.statusCode ?? res_edit?.response?.data?.status ?? res_edit?.status ?? res_edit?.statusCode ?? res_edit?.code ?? res_edit?.response?.status;
        const errorMsgPut = res_edit?.response?.data?.error ?? res_edit?.data?.error ?? res_edit?.response?.error ?? res_edit?.error;

        if (statusCodePut === 400 || statusCodePut === 500) {
            setFormOpen(false);
            // setModalErrorMsg(res_edit?.response?.data?.error);
            // setModalErrorOpen(true)
        } else {
            switch (parseInt(modeOneOrTwo)) {
                case 1:
                    setTextAngIng1(res_edit?.text)
                    break;
                case 2:
                    setTextAngIng2(res_edit?.text)
                    break;
            }

            setFormOpen(false);
            // setModalSuccessMsg('Your changes have been saved.')
            // setModalSuccessOpen(true);
        }
    }

    //#region RENDER-SAVEBTN
    const handletrickerEdit = () => {
        if (trickerEdit == true && mode == 'edit') {
            settrickerEdit(false);
        }
    }

    const getAngIng = async () => {
        // DATA อ้างอิง ที่เป็น checkbox doc 7
        // master/event/ofo/doc7/ref-master
        const res_ref_doc7: any = await getService(`/master/event/ofo/doc7/ref-master`);
        setDataRefDoc7(res_ref_doc7)
    }

    useEffect(() => {
        setDataRefDoc7(refDoc7)
        setTextAngIng1(refDoc7?.[0]?.text)
        setTextAngIng2(refDoc7?.[1]?.text)
    }, [refDoc7])

    useEffect(() => {
        getAngIng();
    }, [textAngIng1, textAngIng2])

    useEffect(() => {
        if(mode === "create"){
        setValue("longdo_dict", `ส่วนบริหารสัญญาระบบท่อส่งก๊าซ (บส.กตต.)`)
        }
    }, [mode])


    return (<>
        <span className="text-[20px] text-[#58585A] font-semibold">{headerFormText}</span>
        <form
            onSubmit={handleSubmit(handleSaveConfirm)}
            className='bg-white w-full max-w'
        >
            <div className="flex gap-4 pt-4">

                <div className="w-[240px]">
                    <label htmlFor="event_nember" className={labelClass}>
                        <span className="text-red-500">*</span>
                        {`ประเภท`}
                    </label>

                    <SelectFormProps
                        id={'event_doc_ofo_type_id'}
                        register={register("event_doc_ofo_type_id", { required: true })}
                        disabled={mode == 'edit' || mode == 'view' ? true : false}
                        valueWatch={watch("event_doc_ofo_type_id") || ""}
                        handleChange={(e) => {
                            setValue("event_doc_ofo_type_id", e.target.value);
                            clearErrors('event_doc_ofo_type_id')
                            if (errors?.event_doc_ofo_type_id) { clearErrors('event_doc_ofo_type_id') }
                        }}
                        errors={errors?.event_doc_ofo_type_id}
                        errorsText={'Select Type'}
                        options={ofoTypeData}
                        optionsKey={'id'}
                        optionsValue={'id'}
                        optionsText={'name'}
                        optionsResult={'name'}
                        placeholder={'Select Type'}
                        pathFilter={'name'}
                    />
                </div>

                {/* วันที่ออกเอกสาร */}
                <div className="pb-2 w-[200px]">
                    <label className={labelClass}>
                        <span className="text-red-500">*</span>
                        {`วันที่ออกเอกสาร`}
                    </label>
                    <DatePickaFormThai
                        {...register('event_date', { required: "เลือกวันที่" })}
                        readOnly={mode == 'view' || isShipper}
                        placeHolder="เลือกวันที่"
                        mode={mode}
                        valueShow={watch("event_date") ? dayjs(watch("event_date")).format("DD/MM/YYYY") : undefined}
                        allowClear
                        isError={errors.event_date && !watch("event_date") ? true : false}
                        onChange={(e: any) => {
                            setValue('event_date', formatFormDate(e))
                            e == undefined && setValue('event_date', null, { shouldValidate: true, shouldDirty: true });
                            handletrickerEdit();
                        }}
                    />
                    {errors.event_date && !watch("event_date") && <p className={`${textErrorClass}`}>{'เลือกวันที่'}</p>}
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
                                handletrickerEdit();
                            }
                        }}
                        placeholder="ระบุรายละเอียด"
                        // disabled={isReadOnly}
                        // disabled={(mode == 'view' || isShipper) ? true : false}
                        disabled={mode == 'view' || isShipper}
                        rows={2}
                        sx={textFieldSx}
                        // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        className={`${(mode == 'view') && 'bg-[#EFECEC] rounded-[8px]'}`}
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
                        {`ระบบส่งก๊าซ`}
                    </label>

                    <div className="gap-2 w-full h-[44px] flex items-center ">
                        <label className="w-[180px] text-[#58585A]">
                            <input
                                type="radio"
                                {...register("event_doc_ofo_gas_tranmiss_id", { required: false })}
                                value="1"
                                disabled={isReadOnly || isShipper}
                                checked={watch("event_doc_ofo_gas_tranmiss_id") == 1}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`Onshore East`}
                        </label>

                        <label className="w-[180px] text-[#58585A]">
                            <input
                                type="radio"
                                {...register("event_doc_ofo_gas_tranmiss_id", { required: false })}
                                value="2"
                                disabled={isReadOnly || isShipper}
                                checked={watch("event_doc_ofo_gas_tranmiss_id") == 2}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`Onshore West`}
                        </label>

                        <label className="w-[250px] text-[#58585A]">
                            <input
                                type="radio"
                                {...register("event_doc_ofo_gas_tranmiss_id", { required: false })}
                                value="3"
                                disabled={isReadOnly || isShipper}
                                checked={watch("event_doc_ofo_gas_tranmiss_id") == 3}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`Onshore East - West`}
                        </label>

                        <label className="w-full flex items-center gap-2 text-[#58585A] mr-8">
                            <input
                                type="radio"
                                {...register("event_doc_ofo_gas_tranmiss_id", { required: false })}
                                value="4"
                                disabled={isReadOnly || isShipper}
                                checked={watch("event_doc_ofo_gas_tranmiss_id") == 4}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`Other`}

                            {
                                watch('event_doc_ofo_gas_tranmiss_id') == 4 && <input
                                    type="text"
                                    disabled={isReadOnly || isShipper}
                                    {...register('event_doc_ofo_gas_tranmiss_other', { required: false })}
                                    value={watch('event_doc_ofo_gas_tranmiss_other')}
                                    onChange={(e) => setValue('event_doc_ofo_gas_tranmiss_other', e.target.value)}
                                    className={`text-[14px] block md:w-full ps-5 focus:!ps-5 hover:!ps-5 pe-10 h-[34px] border-b-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF] ${errors.event_doc_ofo_gas_tranmiss_other && 'border-red-500'}`}
                                />
                            }

                        </label>
                    </div>
                </div>
            </div>

            {/* CHECKBOX อ้างอิง */}
            <div className="flex flex-wrap flex-auto gap-4 pt-2 pb-2">
                <div className="flex items-center gap-2">
                    <input
                        // {...register('doc_7_input_ref_1_id', { required: false })}
                        name="doc_7_input_ref_group"
                        type="radio"
                        // checked={watch('doc_7_input_ref_1_id')}
                        checked={selectedRef === 1}
                        disabled={mode == 'view' || isShipper}
                        onChange={() => handleCheckOne(1)}
                        className="form-radio w-5 h-5 flex-shrink-0 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1]"
                    />
                    <div className="text-[#58585A] text-[14px] w-[95%]">
                        {
                            textAngIng1
                        }
                    </div>

                    <div className="text-[#58585A] text-[14px] w-[5%]">
                        {
                            isLocked ?
                                <></>
                                :
                                <ModeEditOutlinedIcon
                                    onClick={() => {
                                        handleEditClick(1)
                                        setModeOneOrTwo('1')
                                    }}
                                    className={`border-[1px] rounded-[4px] ${(mode === 'view' || isShipper) ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
                                    style={{
                                        fontSize: "18px",
                                        width: '22px',
                                        height: '22px',
                                        color: '#1473A1',
                                        borderColor: '#DFE4EA'
                                    }}
                                />
                        }
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap flex-auto gap-4 pt-2 pb-2">
                <div className="flex items-center gap-2">
                    <input
                        // {...register('doc_7_input_ref_2_id', { required: false })}
                        name="doc_7_input_ref_group"
                        type="radio"
                        // checked={watch('doc_7_input_ref_2_id')}
                        checked={selectedRef === 2}
                        disabled={mode == 'view' || isShipper}
                        onChange={() => handleCheckOne(2)}
                        className="form-radio w-5 h-5 flex-shrink-0 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1]"
                    />
                    <div className="text-[#58585A] text-[14px] w-[95%]">
                        {
                            textAngIng2
                        }
                    </div>
                    <div className="text-[#58585A] text-[14px] w-[5%]">

                        {
                            isLocked ?
                                <></>
                                :
                                <ModeEditOutlinedIcon
                                    onClick={() => {
                                        handleEditClick(2)
                                        setModeOneOrTwo('2')
                                    }}
                                    className={`border-[1px] rounded-[4px] ${(mode === 'view' || isShipper) ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
                                    style={{
                                        fontSize: "18px",
                                        width: '22px',
                                        height: '22px',
                                        color: '#1473A1',
                                        borderColor: '#DFE4EA'
                                    }}
                                />
                        }

                    </div>
                </div>
            </div>

            {/* วัน/เวลา ที่เกิดเหตุการณ์ */}
            <div className="flex flex-wrap flex-auto gap-4 pt-4">
                <div className="w-full">
                    <label className={`${labelClass}`}>{`วัน/เวลา ที่เกิดเหตุการณ์`}</label>
                    <TextField
                        {...register("doc_7_input_date_time_of_the_incident")}
                        value={watch("doc_7_input_date_time_of_the_incident") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 255) {
                                setValue("doc_7_input_date_time_of_the_incident", e.target.value);
                                handletrickerEdit();
                            }
                        }}
                        placeholder="ระบุรายละเอียด"
                        // disabled={isReadOnly}
                        // disabled={(mode == 'view' || isShipper) ? true : false}
                        disabled={mode == 'view' || isShipper}
                        rows={2}
                        sx={textFieldSx}
                        // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        className={`${(mode == 'view') && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">
                            {watch("doc_7_input_date_time_of_the_incident")?.length || 0} / 255
                        </span>
                    </div>
                </div>
            </div>


            {/* รายละเอียดเหตุการณ์ความไม่สมดุล หรือเหตุการณ์เพื่อควบคุมคุณภาพก๊าซที่ต้องสั่งการอย่างจำเป็นเร่งด่วนเพื่อปกป้องหรือระงับความเสียหายหรืออันตรายที่อาจเกิดขึ้นกับระบบส่งก๊าซ และรายละเอียดการสั่งการ */}
            <div className="flex flex-wrap flex-auto gap-4 pt-4">
                <div className="w-full">
                    <label className={`${labelClass}`}><span className="text-red-500">*</span>
                        {`รายละเอียดเหตุการณ์ความไม่สมดุล หรือเหตุการณ์เพื่อควบคุมคุณภาพก๊าซที่ต้องสั่งการอย่างจำเป็นเร่งด่วนเพื่อปกป้องหรือระงับความเสียหายหรืออันตรายที่อาจเกิดขึ้นกับระบบส่งก๊าซ และรายละเอียดการสั่งการ`}
                    </label>
                    <TextField
                        {...register("doc_7_input_detail_incident", { required: true })}
                        value={watch("doc_7_input_detail_incident") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            clearErrors('doc_7_input_detail_incident')
                            if (e.target.value.length <= 255) {
                                setValue("doc_7_input_detail_incident", e.target.value);
                                handletrickerEdit();
                            }
                        }}
                        placeholder="ระบุรายละเอียด"
                        // disabled={isReadOnly}
                        // disabled={(mode == 'view' || isShipper) ? true : false}
                        disabled={mode == 'view' || isShipper}
                        rows={2}
                        sx={{
                            ...textFieldSx,
                            '.MuiOutlinedInput-notchedOutline': {
                                borderColor: errors.doc_7_input_detail_incident && !watch('doc_7_input_detail_incident') ? '#FF0000' : '#DFE4EA',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: errors.doc_7_input_detail_incident && !watch("doc_7_input_detail_incident") ? "#FF0000" : '#DFE4EA !important',
                            },
                        }}
                        // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        className={`${(mode == 'view') && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />

                    <div className="flex justify-between text-sm text-[#B6B6B6] mt-1">
                        <div>
                            {errors.doc_7_input_detail_incident && (
                                <p className={`${textErrorClass} inline`}>{'ระบุรายละเอียด'}</p>
                            )}
                        </div>
                        <span className="text-[13px]">
                            {watch("doc_7_input_detail_incident")?.length || 0} / 255
                        </span>
                    </div>
                </div>
            </div>
            {/* {
                errors.doc_7_input_detail_incident && <span>asdasd</span>
            } */}

            {/* 
                key ในแต่ละชุด

                // ชุด 1 
                doc_7_perm_lod_1 : เพิ่ม = 1, ลด = 2
                doc_7_jud_soong_kaw_ook_1 : เข้า = 3, ออก = 4
                doc_7_area_1 : area
                doc_7_nom_point_1  : ปริมาณก๊าซที่
                doc_7_nom_value_1 : คิดเป็นปริมาณ (MMSCFH)
                shipper_id_1 : shipper
                doc_7_gas_command_1 : การสั่งการ
                doc_7_gas_more_1 : ข้อมูลเพิ่มเติม
            */}

            {/* =================================== เพิ่ม/ ลดปริมาณก๊าซ  ======================================== */}
            <div className="flex flex-wrap items-center justify-between pt-4">
                <div className="py-2 text-[14px] font-semibold text-[#58585A]">
                    {/* hotfix */}
                    {/* <span className="text-red-500">*</span>  */}
                    {`เพิ่ม/ ลดปริมาณก๊าซ`}
                </div>

                {!isShipper && mode?.toLowerCase() != 'view' && (
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            type="button"
                            onClick={() => {
                                appendDoc7Extra(emptyDoc7ExtraBlock() as any)
                            }}
                            disabled={mode == 'view' || isShipper}
                            sx={{
                                width: "120px",
                                height: "43px",
                                minWidth: "120px",
                                borderRadius: "6px",
                                border: "1px solid #00ADEF",
                                backgroundColor: "#FFFFFF",
                                color: "#00ADEF",
                                textTransform: "none",
                                "&:hover": {
                                    backgroundColor: "#00ADEF",
                                    color: "#FFFFFF",
                                    borderColor: "#008FCC",
                                },
                            }}
                            startIcon={<AddOutlinedIcon />}
                        >
                            {`Add`}
                        </Button>
                        <Button
                            onClick={resetPermLod}
                            disabled={mode == 'view' || isShipper}
                            sx={{
                                width: '120px',
                                height: '43px',
                                minWidth: '120px',
                                borderRadius: '6px',
                                border: '1px solid #00ADEF',
                                backgroundColor: '#FFFFFF',
                                color: '#00ADEF',
                                textTransform: 'none', // ไม่ให้ uppercase อัตโนมัติ
                                '&:hover': {
                                    backgroundColor: '#00ADEF',
                                    color: '#FFFFFF',
                                    borderColor: '#008FCC',
                                },
                            }}
                            startIcon={<ReplayRoundedIcon />}
                        >
                            {`Reset`}
                        </Button>
                    </div>
                )}

            </div>


            {/* =============== ชุด 1 ===============*/}
                <Doc7ExtraGasFieldArray
                    flow="extras"
                    fields={doc7ExtraFields as any}
                    append={appendDoc7Extra as any}
                    remove={removeDoc7Extra as any}
                    register={register}
                    watch={watch}
                    getValues={getValues}
                    setValue={setValue}
                    errors={errors}
                    clearErrors={clearErrors}
                    dataNomPointForDoc7={dataNomPointForDoc7}
                    mode={mode}
                    modeOpenDocument={modeOpenDocument}
                    isShipper={isShipper}
                    userDT={userDT}
                    selectboxClass={selectboxClass}
                    selectSx={selectSx}
                    inputClass={inputClass}
                    labelClass={labelClass}
                    onTouchEdit={handletrickerEdit}
                    modeDraft={modeDraft}
                />

            



            {/* =================================== วันที่และเวลาดำเนินการ ======================================== */}
            <div className="flex flex-wrap items-center justify-between pt-4">
                <div className="py-2 text-[14px] font-semibold text-[#58585A]">
                    {`วันที่และเวลาดำเนินการ`}
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between pt-4">
                {/* เริ่ม */}
                <div className="flex flex-nowrap items-center gap-4">
                    <span className="text-[14px] font-semibold text-[#58585A]">{`เริ่ม : `}</span>
                    <span className="text-[14px] font-light text-[#58585A]">{`วันที่`}</span>
                    <span className="text-[14px] w-[240px] text-[#58585A]">
                        <DatePickaFormThai
                            {...register('doc_7_input_time_event_start_date', { required: false })}
                            readOnly={mode == 'view' || isShipper}
                            placeHolder="ระบุวันที่"
                            mode={mode}
                            valueShow={watch("doc_7_input_time_event_start_date") ? dayjs(watch("doc_7_input_time_event_start_date")).format("DD/MM/YYYY") : undefined}
                            allowClear
                            isError={!!errors.doc_7_input_time_event_start_date && !watch("doc_7_input_time_event_start_date")}
                            onChange={(e: any) => {
                                handletrickerEdit();
                                setValue('doc_7_input_time_event_start_date', formatFormDate(e));
                                if (e == undefined)
                                    setValue('doc_7_input_time_event_start_date', null, { shouldValidate: true, shouldDirty: true });
                            }}
                        />
                    </span>


                    <span className="text-[14px] font-light text-[#58585A]">{`เวลา`}</span>
                    <span className="text-[14px] w-[240px] text-[#58585A]">
                        <TimePickaForm
                            {...register('doc_7_input_time_event_start_time', { required: false })}
                            readOnly={mode == 'view' || isShipper}
                            placeHolder="ระบุเวลา"
                            mode={mode}
                            valueShow={watch("doc_7_input_time_event_start_time") || undefined}
                            allowClear
                            isError={!!errors.doc_7_input_time_event_start_time && !watch("doc_7_input_time_event_start_time")}
                            onChange={(e: any) => {
                                handletrickerEdit();
                                setValue('doc_7_input_time_event_start_time', e);
                                if (e == undefined)
                                    setValue('doc_7_input_time_event_start_time', null, { shouldValidate: true, shouldDirty: true });
                            }}
                        />
                    </span>
                </div>
            </div>

            {
                mode?.toLowerCase() != 'create' &&
                <div className="flex flex-wrap items-center justify-between pt-4">
                    {/* ถึง */}
                    <div className="flex flex-nowrap items-center gap-4">
                        <span className="text-[14px] font-semibold text-[#58585A]">{`ถึง : `}</span>
                        <span className="text-[14px] font-light text-[#58585A]">{`วันที่`}</span>
                        <span className="text-[14px] w-[240px] text-[#58585A]">
                            <DatePickaFormThai
                                {...register('doc_7_input_time_event_end_date', { required: false })}
                                readOnly={mode == 'view' || isShipper}
                                placeHolder="ระบุวันที่"
                                mode={mode}
                                valueShow={watch("doc_7_input_time_event_end_date") ? dayjs(watch("doc_7_input_time_event_end_date")).format("DD/MM/YYYY") : undefined}
                                allowClear
                                isError={!!errors.doc_7_input_time_event_end_date && !watch("doc_7_input_time_event_end_date")}
                                onChange={(e: any) => {
                                    handletrickerEdit();
                                    setValue('doc_7_input_time_event_end_date', formatFormDate(e));
                                    if (e == undefined)
                                        setValue('doc_7_input_time_event_end_date', null, { shouldValidate: true, shouldDirty: true });
                                }}
                            />
                        </span>


                        <span className="text-[14px] font-light text-[#58585A]">{`เวลา`}</span>
                        <span className="text-[14px] w-[240px] text-[#58585A]">
                            <TimePickaForm
                                {...register('doc_7_input_time_event_end_time', { required: false })}
                                readOnly={mode == 'view' || isShipper}
                                placeHolder="ระบุเวลา"
                                mode={mode}
                                valueShow={watch("doc_7_input_time_event_end_time") || undefined}
                                allowClear
                                isError={!!errors.doc_7_input_time_event_end_time && !watch("doc_7_input_time_event_end_time")}
                                onChange={(e: any) => {
                                    handletrickerEdit();
                                    setValue('doc_7_input_time_event_end_time', e);
                                    if (e == undefined)
                                        setValue('doc_7_input_time_event_end_time', null, { shouldValidate: true, shouldDirty: true });
                                }}
                            />
                        </span>
                    </div>
                </div>
            }


            {/* =================================== หมายเหตุ ======================================== */}
            <div className="grid grid-cols-2 gap-4 pt-4">

                {/* หมายเหตุ */}
                <div className="w-full col-span-2">
                    <label className={`${labelClass}`}>{`หมายเหตุ`}</label>
                    <TextField
                        {...register("doc_7_input_note")}
                        value={watch("doc_7_input_note") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 500) {
                                setValue("doc_7_input_note", e.target.value);
                                handletrickerEdit();
                            }
                        }}
                        placeholder="ระบุรายละเอียด"
                        disabled={mode == 'view' || isShipper}
                        rows={2}
                        sx={textFieldSx}
                        className={`${mode == 'view' && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">
                            {watch("doc_7_input_note")?.length || 0} / 500
                        </span>
                    </div>
                </div>
            </div>

            {/* เลือก Email Group */}
            {
                !isShipper && (mode == 'create' || mode == 'edit') &&
                <div className="grid grid-cols-2 gap-4 pt-2">

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

                            {emailGroupForEventData
                                ?.filter((item: any) => !defaultEmailGrouId?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                .sort((a: any, b: any) => (a?.name || "").localeCompare(b?.name || ""))?.map((item: any) => (
                                    <MenuItem
                                        key={item.id}
                                        value={item.id}
                                        disabled={false}
                                    >
                                        <Checkbox checked={selectedEmailGroup?.includes(item.id)} />
                                        <ListItemText primary={item.name} />
                                    </MenuItem>
                                ))}
                        </Select>

                        {/* <div className="flex flex-wrap gap-3 pt-4 w-full h-[100px] max-h-[120px] overflow-y-auto"> */}
                        <div className="flex flex-wrap gap-2 pt-2 mt-2 w-full max-h-[120px] overflow-y-auto">
                            {/* ลบไม่ได้เว่ย */}
                            {defaultEmailGroupRender?.map((item: any, index: number) => (
                                <div
                                    key={`default-${index}`}
                                    className="relative w-fit h-[40px] p-2 text-[13px] bg-[#F3F2F2] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                >
                                    {item?.name}
                                </div>
                            ))}

                            {
                                selectedEmailGroupRender?.map((item: any, index: number) => (
                                    <div
                                        key={index}
                                        className="relative w-fit h-[40px] p-2 text-[13px] bg-[#F3F2F2] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
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
                                        className="relative w-fit h-[40px] p-2 text-[13px] bg-[#FFFFFF] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                    >
                                        {item}
                                    </div>
                                ))
                            }

                            {
                                emailGroup && emailGroup?.map((item: any, index: number) => (
                                    <div
                                        key={index}
                                        className="relative w-fit h-[40px] p-2 text-[13px] bg-[#FFFFFF] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
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
                !isShipper && (mode == 'edit' || mode == 'view') && <div className="pt-4"><TableDocument7 tableData={dataTable} dataOpenDocument={dataOpenDocument} /></div>
            }

            {
                isShipper && (mode == 'edit' || mode == 'view') &&
                <div className="grid grid-cols-2 gap-4 pt-4">

                {/* หมายเหตุ */}
                <div className="w-full col-span-2">
                    <label className={`${labelClass}`}>{`ส่วนของผู้ใช้บริการ/คู่สัญญาของผู้ใช้บริการ`}</label>
                    <label className={`${labelClass}`}>{`หมายเหตุ`}</label>
                    <TextField
                        {...register("doc_7_input_note_shipper")}
                        value={watch("doc_7_input_note_shipper") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 500) {
                                setValue("doc_7_input_note_shipper", e.target.value);
                                handletrickerEdit();
                            }
                        }}
                        placeholder="ระบุรายละเอียด"
                        // disabled={mode == 'view' || isShipper}
                        disabled={mode == 'view'}
                        rows={2}
                        sx={textFieldSx}
                        className={`${mode == 'view' && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">
                            {watch("doc_7_input_note_shipper")?.length || 0} / 500
                        </span>
                    </div>
                </div>
            </div>
            }


            {(() => {
                const shouldHideButton = isShipper && (dataOpenDocument?.event_doc_status_id === 1 || dataOpenDocument?.event_doc_status_id === 5);
                const validateList = validateData();

                return (
                    <div className="flex justify-end pt-8">
                        {mode !== 'view' && !shouldHideButton && (
                            <button
                                type="submit"
                                className="w-[167px] h-[44px] font-semibold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                // disabled={false}
                                // disabled={!!trickerEdit}

                                disabled={
                                    !(
                                        isShipper || (mode === 'edit' && !trickerEdit) || mode === 'create' // Edit : ถ้าไม่มีข้อมูลอะไร update ให้ disable ปุ่ม save ไว้ https://app.clickup.com/t/86eupj5ug
                                    )
                                    || (!isShipper && validateList.length > 0)
                                }

                            // เพิ่มเงื่อนไข isEditPermLod ถ้าเป็น true แล้ว mode == 'create' ถึงจะเปิด
                            // disabled={
                            //     !(
                            //         isShipper ||           // สิทธิพิเศษ (admin/ops)
                            //         (mode === 'edit' && !trickerEdit) ||                         // โหมดแก้ไข และไม่มี trigger บล็อค
                            //         (mode === 'create' && isEditPermLod === true)                // โหมดสร้าง ต้องได้อนุญาต
                            //     )
                            // }

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
            customWidth={(dataPDFItem?.data?.[0]?.item?.gas_shipper || [])?.length > 0 ? 700 : 490}
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
                            <PdfDoc7 data={dataPDFItem} />
                        }
                        <div className="text-center">
                            {`Do you want to submit now ?`}
                        </div>
                    </div >
                    : isShipper ? <div className=" w-full">
                                        {
                                            dataPDFItem &&
                                            <PdfDoc7 data={dataPDFItem} />
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
                                <PdfDoc7 data={dataPDFItem} />
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


        <ModalAction
            mode={'edit'}
            // data={refDoc7}
            data={dataRefDoc7}
            // textAngIng1={textAngIng1}
            // textAngIng2={textAngIng2}
            open={formOpen}
            editOneOrTwo={modeOneOrTwo}
            dataTable={{}}
            onClose={() => {
                setFormOpen(false);
                // if (resetForm) {
                //     setTimeout(() => {
                //         resetForm();
                //         setFormData(null);
                //     }, 200);
                // }
            }}
            onSubmit={handleFormSubmit}
        // setResetForm={{}}
        />

    </>
    );
};

export default FormDocument7;