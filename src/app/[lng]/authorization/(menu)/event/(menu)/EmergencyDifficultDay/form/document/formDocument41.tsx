"use client";
import { useEffect, useState } from "react";
import { cutUploadFileName, formatFormDate } from '@/utils/generalFormatter';
import dayjs from 'dayjs';
import { SubmitHandler, useForm } from "react-hook-form";
import ModalConfirmSave from "@/components/other/modalConfirmSave";
import { Button, Checkbox, ListItemText, MenuItem, Select, TextField, Typography, } from "@mui/material";
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DatePickaFormThai from "@/components/library/dateRang/dateSelectFormThai";
import { uploadFileService } from "@/utils/postService";
import SelectFormProps from "@/components/other/selectProps";
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import TableDocument41 from "../tableDocument41";
import { mock_emergency_type } from "../mockData";
import { Doc41FormValue, genEmptyDoc41FormValue } from "../../lib/doc41";
import React from "react";
import { PdfDoc4 } from "@/components/other/pdf_event/docEvent";
// import TableDocument7 from "../tableDocument7";

type FormExampleProps = {
    data?: Partial<any>;
    mode?: any;
    userDT?: any;
    shipperData?: any;
    ofoTypeData?: any;
    emailGroupForEventData?: any;
    dataNomPointForDoc7?: any;
    refDocData?: any;
    setIsOpenDocument?: any;
    dataOpenDocument?: any;
    modeOpenDocument?: any;
    maiHedDocSeeLasted?: any;
    onSubmit: SubmitHandler<any>;
};

const inputClass = "text-[14px] block md:w-full p-2 ps-5 focus:!ps-5 hover:!ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"
const labelClass = "block mb-2 text-[14px] text-[#464255] font-semibold"
const textErrorClass = "text-red-500 text-[14px] "
const selectboxClass = "flex w-full h-[44px] p-1 ps-1 pe-2 !rounded-lg text-gray-900 block outline-none";
// NOTE: Native radio rendering is OS/browser-controlled; to mimic disabled 1:1 without using `disabled`,
// we render a custom radio UI and keep the real input enabled (but non-interactive via guards).
const radioLabelClass = "w-[85px] text-[#58585A]";
const radioLabelDisabledClass = "w-[85px] text-[#B6B6B6] select-none";
const radioLabelWideClass = "w-[100px] text-[#58585A]";
const radioLabelWideDisabledClass = "w-[100px] text-[#B6B6B6] select-none";

const customRadioOuterClass =
    "relative inline-flex h-[14px] w-[14px] items-center justify-center rounded-full border";
const customRadioDotAfterBase =
    "after:content-[''] after:absolute after:h-[8px] after:w-[8px] after:rounded-full after:opacity-0 peer-checked:after:opacity-100";

const pseudoDisabledProps = (disabled: boolean) => ({
    tabIndex: disabled ? -1 : undefined,
    "aria-disabled": disabled ? true : undefined,
});
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

const FormDocument41: React.FC<FormExampleProps> = ({ mode, data, onSubmit, setIsOpenDocument, dataOpenDocument, modeOpenDocument, userDT, shipperData, ofoTypeData, emailGroupForEventData, dataNomPointForDoc7, refDocData, maiHedDocSeeLasted }) => {
    const [dataPDFItem, setdataPDFItem] = useState<any>(null)
    
    const { control, register, handleSubmit, setValue, getValues, reset, clearErrors, formState: { errors }, watch, } = useForm<any>({ defaultValues: data, });
    const [tk, settk] = useState<boolean>(false); // ของคุ้นเคย
    const { onChange, ...restEmail } = register("email"); // register email
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
    const [idRefDocRunnumber, setIDRefDocRunnumber] = useState('');
    const [documentId, setDocumentId] = useState(''); // ID ของ Document 2
    // const isReadOnly = mode === "view" || mode == 'edit';
    const modeDraft = dataOpenDocument?.event_doc_status_id === 1 ? true : false
    const isReadOnly = modeDraft ? false : mode === "view";
    const isShipper = (userDT?.account_manage?.[0]?.user_type_id === 3 || userDT?.account_manage?.[0]?.user_type_id === 4) ? true : false;
    
    console.log('modeDraft : ', modeDraft);
    console.log('dataOpenDocument : ', dataOpenDocument);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [dataTable, setDataTable] = useState<any>([])

    const [isResetCommandList, setIsResetCommandList] = useState<boolean>(false);
    const [commandList, setCommandList] = useState<Doc41FormValue[]>([])


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

    // #region สำหรับตอน SET RESET
    // เอาไว้ set onload และตอน reset
    const setDataChudTee = () => {
        const isGenerate = dataOpenDocument?.event_doc_status_id == 6;
        (dataOpenDocument?.event_doc_gas_shipper_41 ?? []).map((eventDocGasShipper41: any, index: number) => {
            const commandIndex = index + 1;
            const groupIds = eventDocGasShipper41?.event_doc_gas_shipper_match_41?.map((item: any) => item?.event_document_emer?.group_id);
            if(groupIds){
                const filteredShippers = dataShipperMaster?.filter((item: any) => groupIds?.includes(item.id)) || [];
                const defaultIds = filteredShippers?.map((s: any) => s.id) || []; // เอา id 

                if(commandList.find((item: any) => item.id == eventDocGasShipper41?.id)){
                    setCommandList(prev => prev.map((item: any) => item.id == eventDocGasShipper41?.id ?
                        {
                            id: isGenerate ? null : eventDocGasShipper41?.id,
                            defaultShippersRender: modeDraft ? [] : filteredShippers,
                            defaultShippersId: modeDraft ? [] : defaultIds,
                            selectedShippers: modeDraft ? defaultIds : [],
                            selectedShippersRender: modeDraft ? filteredShippers : [],
                            ir: eventDocGasShipper41.ir ? eventDocGasShipper41.ir : 3,
                            io: eventDocGasShipper41.io,
                            value: eventDocGasShipper41.value,
                            more: eventDocGasShipper41.more,
                            fileNameEditText: eventDocGasShipper41.event_doc_gas_shipper_file_41?.length > 0 ? cutUploadFileName(eventDocGasShipper41.event_doc_gas_shipper_file_41[0]?.url) : '',
                            fileNameEditTextUrl: eventDocGasShipper41.event_doc_gas_shipper_file_41?.length > 0 ? eventDocGasShipper41.event_doc_gas_shipper_file_41[0]?.url : '',
                            fileName: 'Maximum File 10 MB',
                            fileUrl: ''
                        }
                        :
                        item
                    ))
                } else {
                    setCommandList(prev => [...prev, {
                        id: isGenerate ? null : eventDocGasShipper41?.id,
                        defaultShippersRender: modeDraft ? [] : filteredShippers,
                        defaultShippersId: modeDraft ? [] : defaultIds,
                        selectedShippers: modeDraft ? defaultIds : [],
                        selectedShippersRender: modeDraft ? filteredShippers : [],
                        ir: eventDocGasShipper41?.ir ? eventDocGasShipper41.ir : 3,
                        io: eventDocGasShipper41?.io,
                        value: eventDocGasShipper41?.value,
                        more: eventDocGasShipper41?.more,
                        fileNameEditText: (eventDocGasShipper41?.event_doc_gas_shipper_file_41?.length ?? 0) > 0 ? cutUploadFileName(eventDocGasShipper41?.event_doc_gas_shipper_file_41?.[0]?.url) : '',
                        fileNameEditTextUrl: (eventDocGasShipper41?.event_doc_gas_shipper_file_41?.length ?? 0) > 0 ? eventDocGasShipper41?.event_doc_gas_shipper_file_41?.[0]?.url : '',
                        fileName: 'Maximum File 10 MB',
                        fileUrl: ''
                    }])
                }
                setValue(`doc_41_perm_lod_${commandIndex}`, eventDocGasShipper41?.ir ? eventDocGasShipper41.ir : 3) // ถ้่า ir เป็น null ให้ใส่ doc_41_perm_lod_1 == 3 (อื่น ๆ)
                setValue(`doc_41_jud_soong_kaw_ook_${commandIndex}`, eventDocGasShipper41?.io)
                setValue(`doc_41_value_${commandIndex}`, eventDocGasShipper41?.value)
                setValue(`doc_41_more_${commandIndex}`, eventDocGasShipper41?.more)
                // doc_41_perm_lod_1
                // doc_41_jud_soong_kaw_ook_1
                // doc_41_value_1
                // doc_41_more_1
            }
        })
    }

    // #region SET RESET for Shipper
    const setDataChudTeeForShipper = () => {
        const isGenerate = dataOpenDocument?.event_doc_status_id == 6;
        (dataOpenDocument?.event_doc_gas_shipper_41 ?? []).map((eventDocGasShipper41: any, index: number) => {
            const commandIndex = index + 1;
            const groupIds = eventDocGasShipper41?.event_document_emer?.group_id;
            if(groupIds){
                const filteredShippers = dataShipperMaster?.filter((item: any) => groupIds == item.id) || [];
                const defaultIds = filteredShippers?.map((s: any) => s.id) || []; // เอา id
                if(commandList.find((item: any) => item.id == eventDocGasShipper41?.id)){
                    setCommandList(prev => prev.map((item: any) => item.id == eventDocGasShipper41?.id ?
                        {
                            id: isGenerate ? null : eventDocGasShipper41?.id,
                            defaultShippersRender: filteredShippers,
                            defaultShippersId: defaultIds,
                            selectedShippers: [],
                            selectedShippersRender: [],
                            ir: eventDocGasShipper41.ir ? eventDocGasShipper41.ir : 3,
                            io: eventDocGasShipper41.io,
                            value: eventDocGasShipper41.value,
                            more: eventDocGasShipper41.more,
                            fileNameEditText: eventDocGasShipper41.event_doc_gas_shipper_file_41?.length > 0 ? cutUploadFileName(eventDocGasShipper41.event_doc_gas_shipper_file_41[0]?.url) : '',
                            fileNameEditTextUrl: eventDocGasShipper41.event_doc_gas_shipper_file_41?.length > 0 ? eventDocGasShipper41.event_doc_gas_shipper_file_41[0]?.url : '',
                            fileName: 'Maximum File 10 MB',
                            fileUrl: ''
                        }
                        :
                        item
                    ))
                }
                else{
                    setCommandList(prev => [...prev, {
                        id: isGenerate ? null : eventDocGasShipper41?.id,
                        defaultShippersRender: filteredShippers,
                        defaultShippersId: defaultIds,
                        selectedShippers: [],
                        selectedShippersRender: [],
                        ir: eventDocGasShipper41?.ir ? eventDocGasShipper41.ir : 3,
                        io: eventDocGasShipper41?.io,
                        value: eventDocGasShipper41?.value,
                        more: eventDocGasShipper41?.more,
                        fileNameEditText: (eventDocGasShipper41?.event_doc_gas_shipper_file_41?.length ?? 0) > 0 ? cutUploadFileName(eventDocGasShipper41?.event_doc_gas_shipper_file_41?.[0]?.url) : '',
                        fileNameEditTextUrl: (eventDocGasShipper41?.event_doc_gas_shipper_file_41?.length ?? 0) > 0 ? eventDocGasShipper41?.event_doc_gas_shipper_file_41?.[0]?.url : '',
                        fileName: 'Maximum File 10 MB',
                        fileUrl: ''
                    }])
                }
                setValue(`doc_41_perm_lod_${commandIndex}`, eventDocGasShipper41?.ir ? eventDocGasShipper41.ir : 3) // ถ้่า ir เป็น null ให้ใส่ doc_41_perm_lod_1 == 3 (อื่น ๆ)
                setValue(`doc_41_jud_soong_kaw_ook_${commandIndex}`, eventDocGasShipper41?.io)
                setValue(`doc_41_value_${commandIndex}`, eventDocGasShipper41?.value)
                setValue(`doc_41_more_${commandIndex}`, eventDocGasShipper41?.more)
            }
        })
    }


    // const [IsStatGenerate, setIsStatGenerate] = useState<boolean>(false)

    // #region set data on load
    useEffect(() => {

        // // event_doc_status.id == 6 | Generate
        // // ถ้าเป็น Generate เปิด วัน/เวลาที่เกิดเหตุ สถานที่เกิดเหตุ รายละเอียดของเหตุการณ์ และผลกระทบต่อระบบส่งก๊าซ
        // // Generated Doc3.9/Doc.4 : จะต้องสามารถแก้ไขได้ทุก field ยกเว้น Type กับ Zone https://app.clickup.com/t/86ev5f7a7
        // if (modeOpenDocument == 'edit') {
        //     let is_stat_generate = dataOpenDocument?.event_doc_status?.id == 6 ? true : false
        //     setIsStatGenerate(is_stat_generate)
        // }

        let text_header: any = 'สร้างเอกสารคำสั่งปรับปริมาณก๊าซจากเหตุการณ์ฉุกเฉิน/เหตุการณ์ความไม่สมดุลอย่างรุนแรง (Emergency Doc.2)'
        switch (modeOpenDocument) {
            case 'view':
                text_header = 'ดูเอกสารคำสั่งปรับปริมาณก๊าซจากเหตุการณ์ฉุกเฉิน/เหตุการณ์ความไม่สมดุลอย่างรุนแรง (Emergency Doc.2)'
                break;
            case 'edit':
                text_header = 'แก้ไขเอกสารคำสั่งปรับปริมาณก๊าซจากเหตุการณ์ฉุกเฉิน/เหตุการณ์ความไม่สมดุลอย่างรุนแรง (Emergency Doc.2)'
                break;
        }

        setHeaderFormText(text_header)
        // setDocumentId(dataOpenDocument?.document1?.id)
        setDocumentId(dataOpenDocument?.id)

        if (modeOpenDocument == 'edit' || modeOpenDocument == 'view') {
            setValue('ref_document', dataOpenDocument?.event_runnumber_emer_id)
            setValue('event_date', dataOpenDocument?.event_date)
            setValue('longdo_dict', dataOpenDocument?.longdo_dict)
            setValue('event_doc_emer_type_id', dataOpenDocument?.event_runnumber_emer?.event_doc_emer_type_id)

            if (!isShipper) {
                // SET DATA ชุดต่าง ๆ สำหรับ TSO
                setDataChudTee();
            } else {
                // SET DATA ชุดต่าง ๆ สำหรับ Shipper
                setDataChudTeeForShipper();
            }

            // set email group กลับที่เดิม
            const emailGroupForEventIds = dataOpenDocument?.event_document_emer_email_group_for_event?.map((item: any) => item.edit_email_group_for_event_id);
            const filter_email_group_for_event = emailGroupForEventData?.filter((item: any) => emailGroupForEventIds?.includes(item?.id))
            const defaultEmailGroupIds = filter_email_group_for_event?.map((s: any) => s.id); // เอา id 
            // set CC email กลับที่เดิม
            const ccEmail = dataOpenDocument?.event_document_emer_cc_email?.map((item: any) => item.email);


            // setDefaultEmailGroupRender(filter_email_group_for_event) // ลบไม่ได้
            // setDefaultEmailGrouId(defaultEmailGroupIds) // ลบไม่ได้
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


            // 

            // #region ข้อมูลใน TABLE ล่าง
            // ข้อมูลในตารางข้างล่าง
            setDataTable(dataOpenDocument?.event_runnumber_emer?.event_document_emer)
            // setDataTable(dataOpenDocument?.history_table_inside)

            // const filter_only_own_doc = dataOpenDocument?.history_table_inside?.filter((item:any) => item?.event_doc_master_id == 41) // 3.9 == 309, 4 == 41
            // setDataTable(modeOpenDocument == 'edit' ? dataOpenDocument?.event_runnumber_emer?.event_document_emer : filter_only_own_doc)

            // SET ข้อมูลลงฟอร์มนะ
            setValue('event_doc_emer_gas_tranmiss_id', dataOpenDocument?.event_runnumber_emer?.event_doc_emer_gas_tranmiss_id)
            setValue('event_doc_emer_gas_tranmiss_other', dataOpenDocument?.event_runnumber_emer?.event_doc_emer_gas_tranmiss_other)

            setValue("doc_41_input_date_time_of_the_incident", dataOpenDocument?.doc_41_input_date_time_of_the_incident); //วัน/เวลาที่เกิดเหตุ
            setValue("doc_41_input_incident", dataOpenDocument?.doc_41_input_incident); // สถานที่เกิดเหตุ
            setValue("doc_41_input_detail_incident", dataOpenDocument?.doc_41_input_detail_incident);  //รายละเอียดของเหตุการณ์ และผลกระทบต่อระบบส่งก๊าซ
            setValue("doc_41_input_expected_day_time", dataOpenDocument?.doc_41_input_expected_day_time);//คาดว่าจะแก้ไขปัญหาแล้วเสร็จในวันที่/เวลา
            setValue("doc_41_input_note", dataOpenDocument?.doc_41_input_note); // หมายเหตุ
            // ของ shipper
            setValue("doc_41_input_shipper_operation", dataOpenDocument?.doc_41_input_shipper_operation); //การดำเนินการ
            setValue("doc_41_input_shipper_note", dataOpenDocument?.doc_41_input_shipper_note); // หมายเหตุ

        }

        // New : Field หมายเหตุ ของทุก Doc ต้อง Default ข้อความตามเอกสาร (ในครั้งแรก) มาให้อัตโนมัติ และเมื่อมีการแก้ไข ให้ยึดตามล่าสุดเป็น Default ในครั้งถัดไป https://app.clickup.com/t/86eum0nwd
        if (modeOpenDocument == 'create') {
            setCommandList([genEmptyDoc41FormValue()])
            setValue('doc_41_input_note', maiHedDocSeeLasted)  // หมายเหตุ
        }

    }, [mode, dataOpenDocument, dataNomPointForDoc7, shipperData, emailGroupForEventData])

    // #region handle Confirm Save
    const validateData = (data?: any) => {
        let validateList: string[] = []

        if(!(dataOpenDocument?.event_runnumber_emer?.event_nember || idRefDocRunnumber || watch("ref_document"))){
            validateList.push('กรุณาระบุ อ้างอิงจากเอกสารแจ้งเหตุการณ์ฉุกเฉิน/เหตุการณ์ความไม่สมดุลอย่างรุนแรง (Emergency Doc.1)')
        }

        if(!watch('event_date')){
            validateList.push('กรุณาระบุ วันที่ออกเอกสาร')
        }
        
        if(!watch('event_doc_emer_type_id')){
            validateList.push('กรุณาระบุ ประเภท')
        }
        
        if(!watch('doc_41_input_date_time_of_the_incident')){
            validateList.push('กรุณาระบุ วัน/เวลาที่เกิดเหตุ')
        }
        
        if(!watch('doc_41_input_incident')){
            validateList.push('กรุณาระบุ สถานที่เกิดเหตุ')
        }
        
        if(!watch('doc_41_input_detail_incident')){
            validateList.push('กรุณาระบุ รายละเอียดของเหตุการณ์ และผลกระทบต่อระบบส่งก๊าซ')
        }


        commandList.some((commandItem, index) => {
            const commandIndex = index + 1

            if(!watch(`doc_41_perm_lod_${commandIndex}`)){
                validateList.push(`กรุณาระบุ เพิ่ม/ลด ในการสั่งการที่${commandIndex}`)
            }

            if(
                !watch(`doc_41_jud_soong_kaw_ook_${commandIndex}`) &&
                watch(`doc_41_perm_lod_${commandIndex}`) &&
                !(watch(`doc_41_perm_lod_${commandIndex}`) == 3 || watch(`doc_41_perm_lod_${commandIndex}`) == '3')
            ){
                validateList.push(`กรุณาระบุ จุดส่งเข้า/จุดส่งออก ในการสั่งการที่ ${commandIndex}`)
            }

            // if(!watch(`doc_41_value_${commandIndex}`)){
            //     validateList.push(`กรุณาระบุ ปริมาณ ในการสั่งการที่${commandIndex}`)
            // }

            // if(!watch(`doc_41_more_${commandIndex}`)){
            //     validateList.push(`กรุณาระบุ เพิ่มเติม ในการสั่งการที่${commandIndex}`)
            // }
        })

        return validateList
    }

    {/* Confirm Save */ }
    const handleSaveConfirm = async (data?: any) => {
        if (mode == 'create') {

            {/* 
                key ในแต่ละชุด
                // ชุด 1 
                doc_41_perm_lod_1 : เพิ่ม = 1, ลด = 2, อื่น ๆ = 5
                doc_41_jud_soong_kaw_ook_1 : เข้า = 3, ออก = 4
                doc_41_value_1  : ปริมาณ
                doc_41_more_1  : เพิ่มเติม
                shipper_id_1 : shipper

            */}

            const gasShipper41 = commandList.map((commandItem, index) => {
                const commandIndex = index + 1
                return {
                    "id": null,
                    "ir": (watch(`doc_41_perm_lod_${commandIndex}`) == 3 || watch(`doc_41_perm_lod_${commandIndex}`) == '3') ? null : parseInt(watch(`doc_41_perm_lod_${commandIndex}`)), // 1 เพิ่ม, 2 ลด
                    "iother": (watch(`doc_41_perm_lod_${commandIndex}`) == 3 || watch(`doc_41_perm_lod_${commandIndex}`) == '3') ? 5 : null, // 5 อื่นๆ ถ้าเลือก ir รน 1 - 4 ให้ null
                    "io": (watch(`doc_41_perm_lod_${commandIndex}`) == 3 || watch(`doc_41_perm_lod_${commandIndex}`) == '3') ? null : watch(`doc_41_jud_soong_kaw_ook_${commandIndex}`) ? parseInt(watch(`doc_41_jud_soong_kaw_ook_${commandIndex}`)) : null, // 3 จุดส่งเข้า, 4 จุดส่งออก
                    "value": watch(`doc_41_value_${commandIndex}`),
                    "more": watch(`doc_41_more_${commandIndex}`),
                    "shipper": Array.from(new Set([
                        ...commandItem.selectedShippers,
                        ...commandItem.defaultShippersId ,
                    ])),
                    "file": commandItem?.fileUrl !== '' ? [commandItem?.fileUrl] : [],
                }
            })

            const payload_tso_create = {
                "generate": false, // true gen , false default
                "id_runnumber": idRefDocRunnumber, // ใส่มา
                "id_documents": null, // ตอนสร้าง null | ถ้าใส่ id_runnumber ใส่มาด้วย | ตอน edit version ส่งมาด้วย | (ถ้าตอน status generate ส่ง id มาด้วย )

                "longdo_dict": watch('longdo_dict'), //สำเนา
                "event_date": dayjs(watch('event_date')).format("YYYY-MM-DD"), // วันที่ออกเอกสาร

                "doc_41_input_date_time_of_the_incident": watch('doc_41_input_date_time_of_the_incident'), //วัน/เวลาที่เกิดเหตุ
                "doc_41_input_incident": watch('doc_41_input_incident'), // สถานที่เกิดเหตุ
                "doc_41_input_detail_incident": watch('doc_41_input_detail_incident'), //รายละเอียดของเหตุการณ์ และผลกระทบต่อระบบส่งก๊าซ
                "doc_41_input_expected_day_time": watch('doc_41_input_expected_day_time'),  //คาดว่าจะแก้ไขปัญหาแล้วเสร็จในวันที่/เวลา
                "doc_41_input_note": watch('doc_41_input_note'),//หมายเหตุ 

                "gas_shipper_41": gasShipper41,
                "email_event_for_shipper": selectedEmailGroup,
                "cc_email": emailGroup
            }
            setdataPDFItem({userDT:userDT, dataOpenDocument: dataOpenDocument, data:[{item:{...data, ...payload_tso_create,}, data: data}], shipperData: shipperData})

            setDataSubmit(payload_tso_create)
            setModaConfirmSave(true)

        } else {
            let data_post_na: any = {}
            if (!isShipper) {

                const gasShipper41 = commandList.map((commandItem, index) => {
                    const commandIndex = index + 1;
                    return {
                        "id": dataOpenDocument?.event_doc_status_id == 6 ? commandItem?.id : null,
                        "ir": (watch(`doc_41_perm_lod_${commandIndex}`) == 3 || watch(`doc_41_perm_lod_${commandIndex}`) == '3') ? null : parseInt(watch(`doc_41_perm_lod_${commandIndex}`)), // 1 เพิ่ม, 2 ลด
                        "iother": (watch(`doc_41_perm_lod_${commandIndex}`) == 3 || watch(`doc_41_perm_lod_${commandIndex}`) == '3') ? 5 : null, // 5 อื่นๆ ถ้าเลือก ir รน 1 - 4 ให้ null
                        "io": (watch(`doc_41_perm_lod_${commandIndex}`) == 3 || watch(`doc_41_perm_lod_${commandIndex}`) == '3') ? null : watch(`doc_41_jud_soong_kaw_ook_${commandIndex}`) ? parseInt(watch(`doc_41_jud_soong_kaw_ook_${commandIndex}`)) : null, // 3 จุดส่งเข้า, 4 จุดส่งออก
                        "value": watch(`doc_41_value_${commandIndex}`), // ปริมาณ
                        "more": watch(`doc_41_more_${commandIndex}`), // เพิ่มเติม
                        "shipper": Array.from(new Set([
                            ...(commandItem?.selectedShippers || []),
                            ...(commandItem?.defaultShippersId || []),
                        ])),
                        "file": commandItem?.fileUrl !== '' ? [commandItem?.fileUrl] : [],
                    }
                })
                // mode edit tso
                data_post_na = {
                    // "document_id": documentId, // เอาไว้ใช้เส้น POST event/ofo/doc5/edit/${id}
                    "generate": dataOpenDocument?.event_doc_status_id == 6 ? true : false, // true gen , false default
                    "id_runnumber": dataOpenDocument?.event_runnumber_emer_id, // ใส่มาตอน edit version 
                    "id_documents": dataOpenDocument?.id, // ตอนสร้าง null | ถ้าใส่ id_runnumber ใส่มาด้วย | ตอน edit version ส่งมาด้วย | (ถ้าตอน status generate ส่ง id มาด้วย )

                    "longdo_dict": watch('longdo_dict'), //สำเนา
                    "event_date": dayjs(watch('event_date')).format("YYYY-MM-DD"), // วันที่ออกเอกสาร

                    "doc_41_input_date_time_of_the_incident": watch('doc_41_input_date_time_of_the_incident'), //วัน/เวลาที่เกิดเหตุ
                    "doc_41_input_incident": watch('doc_41_input_incident'), // สถานที่เกิดเหตุ
                    "doc_41_input_detail_incident": watch('doc_41_input_detail_incident'), //รายละเอียดของเหตุการณ์ และผลกระทบต่อระบบส่งก๊าซ
                    "doc_41_input_expected_day_time": watch('doc_41_input_expected_day_time'),  //คาดว่าจะแก้ไขปัญหาแล้วเสร็จในวันที่/เวลา
                    "doc_41_input_note": watch('doc_41_input_note'),//หมายเหตุ 

                    "gas_shipper_41": gasShipper41,
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
                    "doc_41_input_shipper_operation": watch('doc_41_input_shipper_operation'), //การดำเนินการ
                    "doc_41_input_shipper_note": watch('doc_41_input_shipper_note') //หมายเหตุ
                }
            }

            setdataPDFItem({userDT:userDT, dataOpenDocument: dataOpenDocument, data:[{item:{...data, ...data_post_na,}, data: data}], shipperData: shipperData})


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
    const [isUploading, setIsUploading] = useState(false);

    const [IsErrorChudTee, setIsErrorChudTee] = useState<any>('');

    const handleFileChange = async (e: any, chud_tee: number) => {
        if(commandList.length >= chud_tee){
        setIsLoading(true);
        const file = e.target.files[0];
        const maxSizeInMB = 10;
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

        // // เก็บ setter functions ตาม chud_tee index
        // const fileNameSetters = [setFileName1, setFileName2, setFileName3, setFileName4, setFileName5];
        // const fileUrlSetters = [setFileUrl1, setFileUrl2, setFileUrl3, setFileUrl4, setFileUrl5];

        // index array (chud_tee เริ่มจาก 1)
        const index = chud_tee - 1;

        // if (!fileNameSetters[index] || !fileUrlSetters[index]) {
        //     // Invalid chud_tee value: chud_tee
        //     setIsLoading(false);
        //     return;
        // }

        if (!file) {
            setCommandList((prev: any) => prev.map((item: any, i: number) => i === index ? { ...item, fileName: 'No file chosen' } : item));
            setIsLoading(false);
            return;
        }

        setIsUploading(true);

        if (file.size > maxSizeInBytes) {
            setCommandList((prev: any) => prev.map((item: any, i: number) => i === index ? { ...item, fileName: 'The file is larger than 10 MB.' } : item));
            setIsLoading(false);
            setIsUploading(false);
            setIsErrorChudTee(chud_tee)
            // File size too large:
            return;
        }

        try {
            const response: any = await uploadFileService('/files/uploadfile/', file);
            setCommandList((prev: any) => prev.map((item: any, i: number) => i === index ? { ...item, fileName: file.name, fileUrl: response?.file?.url } : item));
        } catch (error) {
            // Upload failed:
            setCommandList((prev: any) => prev.map((item: any, i: number) => i === index ? { ...item, fileName: 'Upload failed' } : item));
        }

        setTimeout(() => {
            setIsUploading(false);
            setIsLoading(false);
        }, 500);
        }
        else{
            //show error
        }
    };
    // #endregion

    const handleRemoveFile = (chud_tee: any) => {
        if(commandList.length >= chud_tee){
        setIsErrorChudTee('')
            const index = chud_tee - 1;
            setCommandList((prev: any) => prev.map((item: any, i: number) => i === index ? { ...item, fileName: 'Maximum File 10 MB', fileUrl: '' } : item));

        setValue('file', null);
        }
        else{
            //show error
        }
    };

    // #region DOWNLOAD FILE
    // ############# DOWNLOAD FILE #############
    const downloadFile = async (chud_tee: any) => {
        if(commandList.length >= chud_tee){
            const index = chud_tee - 1;
            const url_ = commandList[index].fileNameEditTextUrl ?? '';

        try {
            const response = await fetch(url_);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const fileName = url_.split('/').pop() || 'image.jpg';

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
        }
        else{
            //show error
        }
    };

    // #region SHIPPER DATA
    const [dataShipperMaster, setDataShipperMaster] = useState<any>([])

    useEffect(() => {
        setDataShipperMaster(shipperData)
    }, [shipperData])


    // #region SHIPPER SELECT
    // ############# SHIPPER SELECT #############

    const handleSelectChange = (event: any, chod_tee: any) => {
        const value = event.target.value;

        if(commandList.length >= chod_tee){
            const commandIndex = chod_tee - 1;
            const commandItem = commandList[commandIndex];
            if(value.includes("all")){
                const nextSelectedShippers = commandItem.selectedShippers.length === dataShipperMaster?.length ? [] : dataShipperMaster?.filter((item: any) => !commandItem?.defaultShippersId?.includes(item.id)).map((item: any) => item.id);
                const nextSelectedShippersRender = commandItem.selectedShippers.length === dataShipperMaster?.length ? [] : dataShipperMaster?.filter((item: any) => !commandItem?.defaultShippersId?.includes(item.id)).map((item: any) => item);
                setCommandList((prev: any) => prev.map((item: any, i: number) => i === commandIndex ? { ...item, selectedShippers: nextSelectedShippers, selectedShippersRender: nextSelectedShippersRender } : item));
                setValue(`shipper_id_${chod_tee}`, nextSelectedShippers);
            }
            else{
                const nextSelectedShippersRender = dataShipperMaster?.filter((item: any) => value.includes(item?.id));
                setCommandList((prev: any) => prev.map((item: any, i: number) => i === commandIndex ? { ...item, selectedShippers: value, selectedShippersRender: nextSelectedShippersRender } : item));
                setValue(`shipper_id_${chod_tee}`, value);
            }
            clearErrors(`shipper_id_${chod_tee}`);
        }
        else{
            //show error
        }

        handletrickerEdit()
    };

    const removeShipper = (idToRemove: number, chud_tee: any) => {
        if(commandList.length >= chud_tee){
            const commandIndex = chud_tee - 1;
            const nextSelectedShippers = commandList[commandIndex].selectedShippers.filter((item: any) => item !== idToRemove);
            const nextSelectedShippersRender = commandList[commandIndex].selectedShippersRender.filter((item: any) => item?.id !== idToRemove);
            setCommandList((prev: any) => prev.map((item: any, i: number) => i === commandIndex ? { ...item, selectedShippers: nextSelectedShippers, selectedShippersRender: nextSelectedShippersRender } : item));
            setValue(`shipper_id_${chud_tee}`, nextSelectedShippers);
        }
        else{
            //show error
        }
    };

    // ############# EMAIL GROUP SELECT #############
    const [selectedEmailGroup, setSelectedEmailGroup] = useState<string[]>([]);
    const [selectedEmailGroupRender, setSelectedEmailGroupRender] = useState<any[]>([]);

    const handleSelectEmailGroup = (event: any) => {
        const value = event.target.value;
        handletrickerEdit()
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

    const horizoneDivide = () => {
        return (<div className="my-2 col-span-2">
            <hr className="border-t border-[#DFE4EA] w-full mx-auto" />
        </div>)
    }

    // #region สำหรับปุ่ม RESET
    const resetPermLod = () => {
        for(let commandIndex = 1; commandIndex <= commandList.length; commandIndex++){
            // clear เพิ่ม = 1, ลด = 2
            setValue(`doc_41_perm_lod_${commandIndex}`, null)
    
            // clear จุดส่งเข้า = 3, จุดส่งออก = 4
            setValue(`doc_41_jud_soong_kaw_ook_${commandIndex}`, null)
    
            // clear ปริมาณ
            setValue(`doc_41_value_${commandIndex}`, null)
    
            // clear ข้อมูลเพิ่มเติม
            setValue(`doc_41_more_${commandIndex}`, null)
    
            setValue(`shipper_id_${commandIndex}`, null)
        }
        if (mode == 'create') {
            setCommandList([genEmptyDoc41FormValue()]) // add empty object ไปเป็น default ด้วย
        } else {
            setCommandList([])
            setIsResetCommandList(true);
            // reset mode อื่น
        }
    }

    //#region SAVEBTN
    const [trickerEdit, settrickerEdit] = useState<boolean>(mode == 'edit' ? true : false)

    const handletrickerEdit = () => {
        if (trickerEdit == true && mode == 'edit') {
            settrickerEdit(false);
        }
    }

    const removeCommandAt = (commandIndex: number) => {
        const indexToRemove = commandIndex - 1; // commandIndex เป็น 1-based (ใช้กับ field suffix)
        if (indexToRemove < 0 || indexToRemove >= commandList.length) return;

        handletrickerEdit();
        setIsErrorChudTee('');

        const total = commandList.length; // ก่อนลบ
        const fieldPrefixes = [
            'doc_41_perm_lod_',
            'doc_41_jud_soong_kaw_ook_',
            'doc_41_value_',
            'doc_41_more_',
            'shipper_id_',
        ] as const;

        // shift ค่าในฟอร์ม: i+1 -> i (เริ่มที่ index ที่ถูกลบ)
        for (let i = commandIndex; i < total; i++) {
            const from = i + 1;
            const to = i;
            fieldPrefixes.forEach((prefix) => {
                setValue(`${prefix}${to}`, getValues(`${prefix}${from}`));
            });
        }

        // เคลียร์ชุดสุดท้าย (หลัง shift แล้ว)
        fieldPrefixes.forEach((prefix) => {
            setValue(`${prefix}${total}`, null);
        });

        setCommandList((prev: any) => {
            const next = prev.filter((_: any, i: number) => i !== indexToRemove);
            if (next.length > 0) return next;
            // ถ้าลบหมด ให้เหลืออย่างน้อย 1 ชุดในโหมด create
            return mode === 'create' ? [genEmptyDoc41FormValue()] : [];
        });
    }

    useEffect(() => {
        if(isResetCommandList && commandList.length == 0){
            {/* 
                key ในแต่ละชุด
    
                // ชุด 1 
                doc_41_perm_lod_1 : เพิ่ม = 1, ลด = 2, อื่น ๆ = 5
                doc_41_jud_soong_kaw_ook_1 : เข้า = 3, ออก = 4
                doc_41_value_1  : ปริมาณ
                doc_41_more_1  : เพิ่มเติม
                shipper_id_1 : shipper
    
            */}
    
            // ตรงนี้ต้อง set ของเดิมเข้า
            if (!isShipper) {
                // SET DATA ชุดต่าง ๆ สำหรับ TSO
                setDataChudTee();
            } else {
                // SET DATA ชุดต่าง ๆ สำหรับ Shipper
                setDataChudTeeForShipper();
            }
            setIsResetCommandList(false);
        }
    }, [commandList, isResetCommandList]);

    return (<>
        <span className="text-[20px] text-[#58585A] font-semibold">{headerFormText}</span>
        <form
            onSubmit={handleSubmit(handleSaveConfirm)}
            className='bg-white w-full max-w'
        >
            <div className="flex gap-4 pt-4">

                <div className="w-[560px]">
                    <label htmlFor="event_nember" className={labelClass}>
                        <span className="text-red-500">*</span>
                        {`อ้างอิงจากเอกสารแจ้งเหตุการณ์ฉุกเฉิน/เหตุการณ์ความไม่สมดุลอย่างรุนแรง (Emergency Doc.1)`}
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

                                    const find_doc1_data = refDocData?.find((item: any) => item?.id == e.target.value)
                                    setIDRefDocRunnumber(find_doc1_data?.id)
                                    setValue("event_date", find_doc1_data?.event_date); // ใส่วันที่จาก doc39
                                    setValue("event_doc_emer_type_id", find_doc1_data?.event_doc_emer_type_id); // ประเภทจาก doc39

                                    setValue("event_doc_emer_gas_tranmiss_id", find_doc1_data?.event_doc_emer_gas_tranmiss_id); // ระบบส่งก๊าซจาก doc39
                                    setValue("event_doc_emer_gas_tranmiss_other", find_doc1_data?.event_doc_emer_gas_tranmiss_other); // อื่น ๆ ในระบบส่งก๊าซจาก doc39

                                    setValue("longdo_dict", find_doc1_data?.event_document_emer?.[0]?.longdo_dict); // สำเนาจาก doc39
                                    setValue("doc_41_input_date_time_of_the_incident", find_doc1_data?.event_document_emer?.[0].doc_39_input_date_time_of_the_incident); //จาก doc39
                                    setValue("doc_41_input_incident", find_doc1_data?.event_document_emer?.[0].doc_39_input_incident); //จาก doc39
                                    setValue("doc_41_input_detail_incident", find_doc1_data?.event_document_emer?.[0].doc_39_input_detail_incident); //จาก doc39
                                    setValue("doc_41_input_expected_day_time", find_doc1_data?.event_document_emer?.[0].doc_39_input_expected_day_time); //จาก doc39

                                    // set email group กลับที่เดิม
                                    const emailGroupForEventDataX = (find_doc1_data?.event_document_emer ?? []).filter((it: any) => Array.isArray(it?.event_document_emer_email_group_for_event) && it.event_document_emer_email_group_for_event.length > 0).flatMap((k: any) => k.event_document_emer_email_group_for_event);
                                    const emailGroupForEventIds = emailGroupForEventDataX?.map((s: any) => s?.edit_email_group_for_event_id); // เอา id 
                                    const filter_email_group_for_event = emailGroupForEventData?.filter((item: any) => emailGroupForEventIds?.includes(item?.id))
                                    const uniqueGroupForEventIds = emailGroupForEventIds
                                        ?.filter((v: any) => v != null)
                                        ?.filter((v: any, i: any, arr: any) => arr?.indexOf(v) === i);
                                    setSelectedEmailGroupRender(filter_email_group_for_event)
                                    setSelectedEmailGroup(uniqueGroupForEventIds)

                                    // set CC email กลับที่เดิม
                                    // const ccEmail = dataOpenDocument?.event_document_emer_cc_email?.map((item: any) => item.email);
                                    const ccEmailFind = (find_doc1_data?.event_document_emer ?? []).filter((it: any) => Array.isArray(it?.event_document_emer_cc_email) && it.event_document_emer_cc_email.length > 0).flatMap((k: any) => k.event_document_emer_cc_email);
                                    const ccEmail = ccEmailFind?.map((s: any) => s?.email);
                                    const uniqueCcEmail = ccEmail
                                        ?.filter((v: any) => v != null)
                                        ?.filter((v: any, i: any, arr: any) => arr?.indexOf(v) === i);

                                    // setDefaultCcEmailRender(ccEmail)  // ลบไม่ได้
                                    setEmailGroup(uniqueCcEmail)
                                    setValue("email_arr", [...uniqueCcEmail]);

                                    clearErrors('ref_document')
                                    if (errors?.ref_document) { clearErrors('ref_document') }
                                }}
                                errors={errors?.ref_document}
                                errorsText={'Select Document 1'}
                                options={refDocData}
                                optionsKey={'id'}
                                optionsValue={'id'}
                                optionsText={'event_nember'}
                                optionsResult={'event_nember'}
                                placeholder={'Select Emergency Doc.1'}
                                pathFilter={'event_nember'}
                            />
                            :
                            <div className="w-full h-[44px] p-3 text-[14px] text-[#464255] rounded-[9px] bg-[#F1F1F1] border border-[#DFE4EA]"> {dataOpenDocument?.event_runnumber_emer.event_nember}</div>
                    }
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
                            setValue('event_date', formatFormDate(e)), e == undefined && setValue('event_date', null, { shouldValidate: true, shouldDirty: true });
                            handletrickerEdit()
                        }}
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
                        disabled={true}
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
                            handletrickerEdit()
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
                                {...register("event_doc_emer_gas_tranmiss_id", { required: false })}
                                value="1"
                                // disabled={isReadOnly || isShipper}
                                disabled={true}
                                checked={watch("event_doc_emer_gas_tranmiss_id") == 1}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`Onshore East`}
                        </label>

                        <label className="w-[180px] text-[#58585A]">
                            <input
                                type="radio"
                                {...register("event_doc_emer_gas_tranmiss_id", { required: false })}
                                value="2"
                                // disabled={isReadOnly || isShipper}
                                disabled={true}
                                checked={watch("event_doc_emer_gas_tranmiss_id") == 2}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`Onshore West`}
                        </label>

                        <label className="w-[250px] text-[#58585A]">
                            <input
                                type="radio"
                                {...register("event_doc_emer_gas_tranmiss_id", { required: false })}
                                value="3"
                                // disabled={isReadOnly || isShipper}
                                disabled={true}
                                checked={watch("event_doc_emer_gas_tranmiss_id") == 3}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`Onshore East - West`}
                        </label>

                        <label className="w-full flex items-center gap-2 text-[#58585A] mr-8">
                            <input
                                type="radio"
                                {...register("event_doc_emer_gas_tranmiss_id", { required: false })}
                                value="4"
                                // disabled={isReadOnly || isShipper}
                                disabled={true}
                                checked={watch("event_doc_emer_gas_tranmiss_id") == 4}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`Other`}

                            {
                                watch('event_doc_emer_gas_tranmiss_id') == 4 && <input
                                    type="text"
                                    // disabled={isReadOnly || isShipper}
                                    disabled={true}
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

            {/* วัน/เวลาที่เกิดเหตุ */}
            {/* สถานที่เกิดเหตุ */}
            <div className="grid grid-cols-2 gap-4 pt-3">
                <div className="w-full">
                    <label className={`${labelClass}`}>
                        <span className="text-red-500">*</span>
                        {`วัน/เวลาที่เกิดเหตุ`}
                    </label>
                    <TextField
                        {...register("doc_41_input_date_time_of_the_incident", { required: true })}
                        value={watch("doc_41_input_date_time_of_the_incident") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 255) {
                                setValue("doc_41_input_date_time_of_the_incident", e.target.value);
                            }
                            handletrickerEdit()
                        }}
                        placeholder="ระบุรายละเอียด"
                        // disabled={isReadOnly}
                        disabled={(mode == 'view' || isShipper) ? true : false}
                        rows={2}
                        sx={{
                            ...textFieldSx,
                            '.MuiOutlinedInput-notchedOutline': {
                                borderColor: errors.doc_41_input_date_time_of_the_incident && !watch('doc_41_input_date_time_of_the_incident') ? '#FF0000' : '#DFE4EA',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: errors.doc_41_input_date_time_of_the_incident && !watch("doc_41_input_date_time_of_the_incident") ? "#FF0000" : '#DFE4EA !important',
                            },
                        }}
                        // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        className={`${(mode == 'view' || isShipper) && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">{watch("doc_41_input_date_time_of_the_incident")?.length || 0} / 255</span>
                    </div>
                </div>


                {/* สถานที่เกิดเหตุ */}
                <div className="w-full">
                    <label className={labelClass}>
                        <span className="text-red-500">*</span>
                        {`สถานที่เกิดเหตุ`}
                    </label>
                    <TextField
                        {...register("doc_41_input_incident", { required: true })}
                        value={watch("doc_41_input_incident") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 255) {
                                setValue("doc_41_input_incident", e.target.value);
                            }
                            handletrickerEdit()
                        }}
                        placeholder="ระบุรายละเอียด"
                        // disabled={isReadOnly}
                        disabled={(mode == 'view' || isShipper) ? true : false}
                        rows={2}
                        sx={{
                            ...textFieldSx,
                            '.MuiOutlinedInput-notchedOutline': {
                                borderColor: errors.doc_41_input_incident && !watch('doc_41_input_incident') ? '#FF0000' : '#DFE4EA',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: errors.doc_41_input_incident && !watch("doc_41_input_incident") ? "#FF0000" : '#DFE4EA !important',
                            },
                        }}
                        // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        className={`${(mode == 'view' || isShipper) && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">{watch("doc_41_input_incident")?.length || 0} / 255</span>
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
                        {...register("doc_41_input_detail_incident", { required: true })}
                        value={watch("doc_41_input_detail_incident") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 500) {
                                setValue("doc_41_input_detail_incident", e.target.value);
                            }
                            handletrickerEdit()
                        }}
                        placeholder="ระบุรายละเอียด"
                        // disabled={isReadOnly}
                        disabled={(mode == 'view' || isShipper) ? true : false}
                        rows={2}
                        sx={{
                            ...textFieldSx,
                            '.MuiOutlinedInput-notchedOutline': {
                                borderColor: errors.doc_41_input_detail_incident && !watch('doc_41_input_detail_incident') ? '#FF0000' : '#DFE4EA',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: errors.doc_41_input_detail_incident && !watch("doc_41_input_detail_incident") ? "#FF0000" : '#DFE4EA !important',
                            },
                        }}
                        // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        className={`${(mode == 'view' || isShipper) && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">{watch("doc_41_input_detail_incident")?.length || 0} / 500</span>
                    </div>
                </div>
            </div>

            {/* คาดว่าจะแก้ไขปัญหาแล้วเสร็จในวันที่/เวลา: */}
            <div className="grid grid-cols-2 gap-4 pt-3">
                <div className="w-full col-span-2">
                    <label className={labelClass}>{`คาดว่าจะแก้ไขปัญหาแล้วเสร็จในวันที่/เวลา:`}</label>
                    <TextField
                        {...register("doc_41_input_expected_day_time")}
                        value={watch("doc_41_input_expected_day_time") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 255) {
                                setValue("doc_41_input_expected_day_time", e.target.value);
                            }
                            handletrickerEdit()
                        }}
                        placeholder="ระบุรายละเอียด"
                        // disabled={isReadOnly}
                        disabled={(mode == 'view' || isShipper) ? true : false}
                        rows={2}
                        sx={textFieldSx}
                        // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                        className={`${(mode == 'view' || isShipper) && 'bg-[#EFECEC] rounded-[8px]'}`}
                        InputProps={inputPropsTextField}
                        fullWidth
                    />
                    <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                        <span className="text-[13px]">{watch("doc_41_input_expected_day_time")?.length || 0} / 255</span>
                    </div>
                </div>
            </div>


            {/* {
                errors.doc_7_input_detail_incident && <span>asdasd</span>
            } */}

            {/* 
                key ในแต่ละชุด

                // ชุด 1 
                doc_41_perm_lod_1 : เพิ่ม = 1, ลด = 2, อื่น ๆ = 5
                doc_41_jud_soong_kaw_ook_1 : เข้า = 3, ออก = 4
                doc_41_value_1  : ปริมาณ
                doc_41_more_1  : เพิ่มเติม
                shipper_id_1 : shipper

            */}

            {/* =================================== เพิ่ม/ ลดปริมาณก๊าซ  ======================================== */}
            <div className="flex flex-wrap items-center justify-between pt-4">
                <div className="py-2 text-[14px] font-semibold text-[#58585A]">
                    {`การสั่งการ`}
                </div>

                {
                    !(mode == 'view' || isShipper) &&
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        type="button"
                        onClick={() => {setCommandList(prev => [...prev, genEmptyDoc41FormValue()])}}
                        disabled={(mode == 'view' || isShipper) ? true : false}
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
                        disabled={(mode == 'view' || isShipper) ? true : false}
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
                }
            </div>

            {
                commandList.map((commandItem: Doc41FormValue, cIndex: number) => {
                    const commandIndex = cIndex + 1
                    /**
                     * ห้ามใช้ native `disabled` บน radio ที่ผูกกับ RHF
                     * เพราะตอน append/update field array RHF อ่านค่าจาก ref แล้วจะข้าม `<input disabled>` ที่ checked
                     * ทำให้ได้ value null และทับ `ir`/`io` ใน form state — ใช้ pointer-events + guard แทน
                     */
                    const isDisabled = !!(isReadOnly || isShipper || (!modeDraft && commandItem?.id));
                    const isServerPersistedRow = !!(!modeDraft && commandItem?.id);
                    const isIrDisabled = commandIndex > 1 ? watch(`doc_41_perm_lod_${commandIndex - 1}`) ? false : true : false;
                    const isIoDisabled = watch(`doc_41_perm_lod_${commandIndex}`) ? false : true
                    /** สีจุด radio: ใช้สตริงคลาสเต็ม (อย่า concat ใน `accent-[...]` เพราะ Tailwind JIT จะไม่ generate) */
                    return (
                        <React.Fragment key={`doc41-command-${commandIndex}`}>
                            <div className="pb-5">

                                <div className="gap-2 w-full flex items-center">
                                    <div className={`flex items-center gap-2 flex-wrap flex-1 ${isDisabled ? "pointer-events-none opacity-90" : ""}`} >
                                        {/* เพิ่ม - ลด */}
                                        <div className={`grid grid-cols-3 gap-1 pt-4 ${isIrDisabled ? "pointer-events-none opacity-90" : ""}`}>
                                            <label
                                                className={`flex items-center gap-2 ${isDisabled || isIrDisabled ? radioLabelDisabledClass : radioLabelClass} ${isDisabled || isIrDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
                                                <input
                                                    type="radio"
                                                    {...register(`doc_41_perm_lod_${commandIndex}`, { required: false })}
                                                    value={1}
                                                    // disabled={(isReadOnly || isShipper || (!modeDraft && commandItem?.id)) ? true : commandIndex > 1 ? watch(`doc_41_perm_lod_${commandIndex - 1}`) ? false : true : false}
                                                    {...pseudoDisabledProps(isDisabled || isIrDisabled)}
                                                    checked={watch(`doc_41_perm_lod_${commandIndex}`) == 1 || watch(`doc_41_perm_lod_${commandIndex}`) == "1" || commandItem?.ir == 1}
                                                    onChange={(e) => {
                                                        if (isDisabled || isIrDisabled) return;
                                                        setValue(`doc_41_perm_lod_${commandIndex}`, e.target.value)
                                                        setCommandList(prev => prev.map((item, index) => index === cIndex ? { ...item, ir: 1 } : item))
                                                        handletrickerEdit()
                                                    }}
                                                    className="peer sr-only"
                                                />
                                                <span
                                                    className={`${customRadioOuterClass} ${customRadioDotAfterBase} ${
                                                        isDisabled || isIrDisabled
                                                            ? "border-[#D1D5DB] bg-[#F3F4F6] after:bg-[#9CA3AF]"
                                                            : "border-[#1473A1] bg-white after:bg-[#1473A1]"
                                                    }`}
                                                />
                                                {`เพิ่ม`}
                                            </label>

                                            <label className={`flex items-center gap-2 ${isDisabled || isIrDisabled ? radioLabelDisabledClass : radioLabelClass} ${isDisabled || isIrDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
                                                <input
                                                    type="radio"
                                                    {...register(`doc_41_perm_lod_${commandIndex}`, { required: false })}
                                                    value={2}
                                                    // disabled={(isReadOnly || isShipper || (!modeDraft && commandItem?.id)) ? true : commandIndex > 1 ? watch(`doc_41_perm_lod_${commandIndex - 1}`) ? false : true : false}
                                                    {...pseudoDisabledProps(isDisabled || isIrDisabled)}
                                                    checked={watch(`doc_41_perm_lod_${commandIndex}`) == 2 || watch(`doc_41_perm_lod_${commandIndex}`) == "2" || commandItem?.ir == 2}
                                                    onChange={(e) => {
                                                        if (isDisabled || isIrDisabled) return;
                                                        setValue(`doc_41_perm_lod_${commandIndex}`, e.target.value)
                                                        setCommandList(prev => prev.map((item, index) => index === cIndex ? { ...item, ir: 2} : item))
                                                        handletrickerEdit()
                                                    }}
                                                    className="peer sr-only"
                                                />
                                                <span
                                                    className={`${customRadioOuterClass} ${customRadioDotAfterBase} ${
                                                        isDisabled || isIrDisabled
                                                            ? "border-[#D1D5DB] bg-[#F3F4F6] after:bg-[#9CA3AF]"
                                                            : "border-[#1473A1] bg-white after:bg-[#1473A1]"
                                                    }`}
                                                />
                                                {`ลด`}
                                            </label>

                                            <label className={`flex items-center gap-2 ${isDisabled || isIrDisabled ? radioLabelDisabledClass : radioLabelClass} ${ isDisabled || isIrDisabled ? "cursor-not-allowed" : "cursor-pointer" }`} >
                                                <input
                                                    type="radio"
                                                    {...register(`doc_41_perm_lod_${commandIndex}`, { required: false })}
                                                    value={3}
                                                    // disabled={(isReadOnly || isShipper || (!modeDraft && commandItem?.id)) ? true : commandIndex > 1 ? watch(`doc_41_perm_lod_${commandIndex - 1}`) ? false : true : false}
                                                    {...pseudoDisabledProps(isDisabled || isIrDisabled)}
                                                    checked={watch(`doc_41_perm_lod_${commandIndex}`) == 3 || watch(`doc_41_perm_lod_${commandIndex}`) == "3" || commandItem?.ir == 3}
                                                    onChange={(e) => {
                                                        if (isDisabled || isIrDisabled) return;
                                                        setValue(`doc_41_perm_lod_${commandIndex}`, e.target.value)
                                                        setValue(`doc_41_jud_soong_kaw_ook_${commandIndex}`, null)
                                                        setCommandList(prev => prev.map((item, index) => index === cIndex ? { ...item, ir: 3, io: null } : item))
                                                        handletrickerEdit()
                                                    }}
                                                    className="peer sr-only"
                                                />
                                                <span
                                                    className={`${customRadioOuterClass} ${customRadioDotAfterBase} ${
                                                        isDisabled || isIrDisabled
                                                            ? "border-[#D1D5DB] bg-[#F3F4F6] after:bg-[#9CA3AF]"
                                                            : "border-[#1473A1] bg-white after:bg-[#1473A1]"
                                                    }`}
                                                />
                                                {`อื่น ๆ`}
                                            </label>
                                        </div>

                                        {/* จุดส่งเข้า - จุดส่งออก */}
                                        {
                                            (
                                                watch(`doc_41_perm_lod_${commandIndex}`) !== 3 && watch(`doc_41_perm_lod_${commandIndex}`) !== "3") &&
                                            <div className={`grid grid-cols-2 gap-1 pt-4 ${isIoDisabled ? "pointer-events-none opacity-90" : ""}`}>
                                                <label className={`flex items-center gap-2 ${isDisabled || isIrDisabled ? radioLabelWideDisabledClass : radioLabelWideClass} ${ isDisabled || isIoDisabled ? "cursor-not-allowed" : "cursor-pointer" }`} >
                                                    <input
                                                        type="radio"
                                                        {...register(`doc_41_jud_soong_kaw_ook_${commandIndex}`, { required: false })}
                                                        value={3}
                                                        // disabled={(isReadOnly || isShipper || !watch(`doc_41_perm_lod_${commandIndex}`) || (!modeDraft && commandItem?.id)) ? true : commandIndex > 1 ? watch(`doc_41_perm_lod_${commandIndex - 1}`) ? false : true : false}
                                                        {...pseudoDisabledProps(isDisabled || isIoDisabled)}
                                                        checked={watch(`doc_41_jud_soong_kaw_ook_${commandIndex}`) == 3 || watch(`doc_41_jud_soong_kaw_ook_${commandIndex}`) == "3" || commandItem?.io == 3}
                                                        onChange={(e) => {
                                                            if (isServerPersistedRow) return;
                                                            setValue(`doc_41_jud_soong_kaw_ook_${commandIndex}`, e.target.value)
                                                            setCommandList(prev => prev.map((item, index) => index === cIndex ? { ...item, io: 3 } : item))
                                                            handletrickerEdit()
                                                        }}
                                                        className="peer sr-only"
                                                    />
                                                    <span
                                                        className={`${customRadioOuterClass} ${customRadioDotAfterBase} ${
                                                            isDisabled || isIoDisabled
                                                                ? "border-[#D1D5DB] bg-[#F3F4F6] after:bg-[#9CA3AF]"
                                                                : "border-[#1473A1] bg-white after:bg-[#1473A1]"
                                                        }`}
                                                    />
                                                    {`จุดส่งเข้า`}
                                                </label>

                                                <label className={`flex items-center gap-2 ${isDisabled || isIrDisabled ? radioLabelWideDisabledClass : radioLabelWideClass} ${ isDisabled || isIoDisabled ? "cursor-not-allowed" : "cursor-pointer" }`}>
                                                    <input
                                                        type="radio"
                                                        {...register(`doc_41_jud_soong_kaw_ook_${commandIndex}`, { required: false })}
                                                        value={4}
                                                        // disabled={(isReadOnly || isShipper || !watch(`doc_41_perm_lod_${commandIndex}`) || (!modeDraft && commandItem?.id)) ? true : commandIndex > 1 ? watch(`doc_41_perm_lod_${commandIndex - 1}`) ? false : true : false}
                                                        {...pseudoDisabledProps(isDisabled || isIoDisabled)}
                                                        checked={watch(`doc_41_jud_soong_kaw_ook_${commandIndex}`) == 4 || watch(`doc_41_jud_soong_kaw_ook_${commandIndex}`) == "4" || commandItem?.io == 4}
                                                        onChange={(e) => {
                                                            setValue(`doc_41_jud_soong_kaw_ook_${commandIndex}`, e.target.value)
                                                            setCommandList(prev => prev.map((item, index) => index === cIndex ? { ...item, io: 4 } : item))
                                                            handletrickerEdit()
                                                        }}
                                                        className="peer sr-only"
                                                    />
                                                    <span
                                                        className={`${customRadioOuterClass} ${customRadioDotAfterBase} ${
                                                            isDisabled || isIoDisabled
                                                                ? "border-[#D1D5DB] bg-[#F3F4F6] after:bg-[#9CA3AF]"
                                                                : "border-[#1473A1] bg-white after:bg-[#1473A1]"
                                                        }`}
                                                    />
                                                    {`จุดส่งออก`}
                                                </label>
                                            </div>
                                        }
                                    </div>

                                    {(mode != 'view' && !isDisabled) && (
                                        <Button
                                            type="button"
                                            size="small"
                                            color="error"
                                            variant="text"
                                            onClick={() => removeCommandAt(commandIndex)}
                                            startIcon={<DeleteOutlineOutlinedIcon />}
                                            sx={{ textTransform: "none" }}
                                            className="ml-auto !mt-4"
                                        >
                                            {`ลบชุดนี้`}
                                        </Button>
                                    )}

                                </div>


                                {/* ปริมาณ */}
                                {
                                    (
                                        watch(`doc_41_perm_lod_${commandIndex}`) !== 3 &&
                                        watch(`doc_41_perm_lod_${commandIndex}`) !== "3" &&
                                        watch(`doc_41_perm_lod_${commandIndex}`) &&
                                        watch(`doc_41_jud_soong_kaw_ook_${commandIndex}`)
                                    ) &&
                                    <div className="gap-2 w-full flex items-center pt-4">
                                        <div className="w-full ">
                                            <label className={labelClass}>{`ปริมาณ:`}</label>
                                            <TextField
                                                {...register(`doc_41_value_${commandIndex}`)}
                                                value={watch(`doc_41_value_${commandIndex}`) || ""}
                                                label=""
                                                multiline
                                                onChange={(e) => {
                                                    if (e.target.value.length <= 255) {
                                                        setValue(`doc_41_value_${commandIndex}`, e.target.value);
                                                        setCommandList(prev => prev.map((item, index) => index === cIndex ? { ...item, value: e.target.value } : item))
                                                    }
                                                    handletrickerEdit()
                                                }}
                                                placeholder="ระบุรายละเอียด"
                                                // disabled={isReadOnly}
                                                disabled={(isReadOnly || isShipper || (!modeDraft && commandItem?.id)) ? true : false}
                                                rows={2}
                                                sx={textFieldSx}
                                                // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                                                className={`${(isReadOnly || isShipper) && 'bg-[#EFECEC] rounded-[8px]'}`}
                                                InputProps={inputPropsTextField}
                                                fullWidth
                                            />
                                            <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                                <span className="text-[13px]">{watch(`doc_41_value_${commandIndex}`)?.length || 0} / 255</span>
                                            </div>
                                        </div>
                                    </div>
                                }

                                {/* เพิ่มเติม */}
                                {
                                    (
                                        watch(`doc_41_perm_lod_${commandIndex}`) == 3 ||
                                        watch(`doc_41_perm_lod_${commandIndex}`) == "3" ||
                                        watch(`doc_41_jud_soong_kaw_ook_${commandIndex}`)
                                    )
                                    &&
                                    <div className="gap-2 w-full flex items-center pt-2">
                                        <div className="w-full ">
                                            <label className={labelClass}>{`เพิ่มเติม:`}</label>
                                            <TextField
                                                {...register(`doc_41_more_${commandIndex}`)}
                                                value={watch(`doc_41_more_${commandIndex}`) || ""}
                                                label=""
                                                multiline
                                                onChange={(e) => {
                                                    if (e.target.value.length <= 255) {
                                                        setValue(`doc_41_more_${commandIndex}`, e.target.value);
                                                        setCommandList(prev => prev.map((item, index) => index === cIndex ? { ...item, more: e.target.value } : item))
                                                    }
                                                    handletrickerEdit()
                                                }}
                                                placeholder="ระบุรายละเอียด"
                                                // disabled={isReadOnly}
                                                disabled={(isReadOnly || isShipper || (!modeDraft && commandItem?.id)) ? true : false}
                                                rows={2}
                                                sx={textFieldSx}
                                                // className={`${isReadOnly && 'bg-[#EFECEC] rounded-[8px]'}`}
                                                className={`${(isReadOnly || isShipper) && 'bg-[#EFECEC] rounded-[8px]'}`}
                                                InputProps={inputPropsTextField}
                                                fullWidth
                                            />
                                            <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                                <span className="text-[13px]">{watch(`doc_41_more_${commandIndex}`)?.length || 0} / 255</span>
                                            </div>
                                        </div>
                                    </div>
                                }

                                {/* Shipper */}
                                {
                                    (
                                        watch(`doc_41_perm_lod_${commandIndex}`) == 3 ||
                                        watch(`doc_41_perm_lod_${commandIndex}`) == "3" ||
                                        watch(`doc_41_jud_soong_kaw_ook_${commandIndex}`)
                                    )
                                    &&
                                    <div className="flex flex-wrap flex-auto">
                                        <div className="grid grid-cols-2 gap-4 pt-2 w-full">
                                            <div>
                                                <label className={`${labelClass}`}>{`Shipper`}</label>
                                                <Select
                                                    id={`shipper_id_${commandIndex}`}
                                                    multiple
                                                    IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                    {...register(`shipper_id_${commandIndex}`, { required: false })}
                                                    disabled={(isReadOnly || (!modeDraft && commandItem?.id) || !watch(`doc_41_perm_lod_${commandIndex}`) || isShipper) ? true : false}
                                                    value={commandItem?.selectedShippers}
                                                    onChange={(e: any) => handleSelectChange(e, commandIndex)}
                                                    className={`${selectboxClass} ${(isReadOnly) && "!bg-[#EFECEC]"}`}
                                                    sx={selectSx}
                                                    displayEmpty
                                                    renderValue={(selected) => {
                                                        if (selected.length === 0) {
                                                            return <Typography color="#9CA3AF" fontSize={14}>Select Shipper Name</Typography>;
                                                        }
                                                        // return selected.map((id) => dataShipper1.find((item: any) => item.id === id)?.name).join(", ");
                                                        const shipper_data = dataShipperMaster?.filter((item: any) => !commandItem?.defaultShippersId?.includes(item.id))
                                                        return (
                                                            <span className={`pl-[10px] text-[14px]`}>
                                                                {shipper_data?.length == commandItem?.selectedShippers?.length ? `Select All` : selected.map((id) => dataShipperMaster?.filter((item: any) => !commandItem?.defaultShippersId?.includes(item.id)).find((item: any) => item.id === id)?.name).join(", ")}
                                                            </span>
                                                        );
                                                    }}
                                                    MenuProps={{ PaperProps: { style: { maxHeight: 48 * 4.5 + 8 } } }}
                                                >
                                                    {(!isShipper) && (
                                                        <MenuItem value="all">
                                                            <Checkbox checked={commandItem?.selectedShippers?.length === dataShipperMaster?.length && (dataShipperMaster?.length ?? 0) > 0} />
                                                            <ListItemText
                                                                primary="Select All"
                                                                // sx={{ fontWeight: 'bold' }}
                                                                primaryTypographyProps={{ sx: { fontWeight: 'bold' } }}
                                                            />
                                                        </MenuItem>
                                                    )}

                                                    {dataShipperMaster?.length > 0 && dataShipperMaster
                                                        // ?.filter((item: any) => !defaultShippersId1?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                                        // ?.filter((item: any) => !defaultShippersId2?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                                        // ?.filter((item: any) => !defaultShippersId3?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                                        // ?.filter((item: any) => !defaultShippersId4?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                                        // ?.filter((item: any) => !defaultShippersId5?.includes(item.id)) // เอาอันที่มีอยู่แล้วออกจาก option 

                                                        // // ?.filter((item: any) => !selectedShippers1.includes(item.id)) // เอาอันที่เลือกอยู่แล้วออกจาก option 
                                                        // ?.filter((item: any) => !selectedShippers2.includes(item.id)) // เอาอันที่เลือกอยู่แล้วออกจาก option 
                                                        // ?.filter((item: any) => !selectedShippers3.includes(item.id)) // เอาอันที่เลือกอยู่แล้วออกจาก option 
                                                        // ?.filter((item: any) => !selectedShippers4.includes(item.id)) // เอาอันที่เลือกอยู่แล้วออกจาก option 
                                                        // ?.filter((item: any) => !selectedShippers5.includes(item.id)) // เอาอันที่เลือกอยู่แล้วออกจาก option 
                                                        ?.filter((item: any) => 
                                                            !(
                                                                (
                                                                    modeDraft ? 
                                                                        commandList
                                                                        :
                                                                        commandList.filter((commandItem2: Doc41FormValue) => !commandItem2.id)
                                                                )
                                                                .some((commandItem2: Doc41FormValue, cIndex2: number) => {
                                                                    return commandItem2.defaultShippersId.includes(item.id)
                                                                    || (
                                                                        cIndex2 != cIndex &&
                                                                        commandItem2.selectedShippers.includes(item.id)
                                                                    )
                                                                })
                                                            )
                                                        )
                                                        ?.sort((a: any, b: any) => (a?.name || "").localeCompare(b?.name || "")) // แล้วค่อย sort
                                                        ?.map((item: any) => (
                                                            <MenuItem
                                                                key={item.id}
                                                                value={item.id}
                                                                disabled={false}
                                                            >
                                                                <Checkbox checked={commandItem?.selectedShippers?.includes(item.id)} />
                                                                <ListItemText primary={item.name} />
                                                            </MenuItem>
                                                        ))
                                                    }
                                                </Select>


                                            </div>


                                            {/* File */}
                                            <div>
                                                {/* ถ้าเป็น create แสดงอันนี้ */}
                                                {
                                                    !isShipper && mode == 'create' &&
                                                    <div className="grid grid-cols-2 w-full">
                                                        <label className={`${labelClass}`}>{`File`}</label>
                                                        <div className={`flex items-center col-span-2 ${IsErrorChudTee == '1' ? 'border  border-[#ff0000] rounded-r-lg rounded-l-lg' : ''}`}>
                                                            <label className={`flex bg-[#00ADEF] text-white items-center justify-center font-light rounded-l-[6px] text-[16px] text-justify w-[20%] !h-[44px] px-2 cursor-pointer`}>
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
                                                                    onChange={(e) => handleFileChange(e, commandIndex)}
                                                                />
                                                            </label>

                                                            <div className="bg-white text-[#9CA3AF] text-sm w-[80%] !h-[44px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden flex items-center">
                                                                <span className="truncate">
                                                                    {commandItem?.fileName ?? ''}
                                                                </span>
                                                                {commandItem?.fileName !== "Maximum File 10 MB" && (
                                                                    <CloseOutlinedIcon
                                                                        onClick={() => handleRemoveFile(commandIndex)}
                                                                        className="cursor-pointer ml-2 text-[#9CA3AF] z-10"
                                                                        sx={{ color: '#323232', fontSize: 18 }}
                                                                        style={{ fontSize: 18 }}
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className={`w-full flex items-center justify-between text-[14px] text-red-500 `}>
                                                            {IsErrorChudTee == '1' && 'The file is larger than 10 MB.'}
                                                        </div>
                                                    </div>
                                                }

                                                {/* File */}
                                                {/* ถ้าเป็น edit view แสดงอันนี้ */}
                                                {
                                                    (mode == 'edit' || mode == 'view') && commandItem?.fileNameEditTextUrl !== '' &&
                                                    <div className="grid grid-cols-2 w-full gap-4 ">
                                                        <div className="col-span-2 ">
                                                            <label className={`${labelClass}`}>
                                                                {`File`}
                                                            </label>
                                                            <div className="h-[46px] text-[#464255] p-3 rounded-[6px] bg-[#F3F2F2] flex justify-between w-full">
                                                                <div className="flex items-center gap-2">
                                                                    <InsertDriveFileOutlinedIcon sx={{ fontSize: '20px' }} /> {commandItem?.fileNameEditText}
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    className={`flex items-center justify-center px-[2px] py-[2px] rounded-[4px] relative ${commandItem?.fileNameEditTextUrl === '' ? 'bg-[#f0f0f0] cursor-not-allowed pointer-events-none' : 'hover:bg-[#DFE4EA] hover:border hover:border-[#DFE4EA]'}`}
                                                                    onClick={() => downloadFile(commandIndex)}
                                                                    disabled={commandItem?.fileNameEditTextUrl !== '' ? false : true}
                                                                >
                                                                    <FileDownloadIcon sx={{ fontSize: 23, color: '#1473A1', backgroundColor: '#ffffff', borderRadius: '4px', borderColor: '#DFE4EA' }} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                }

                                {/* shipper render */}
                                {
                                    watch(`doc_41_perm_lod_${commandIndex}`) && <>
                                        <div className="flex flex-wrap flex-auto">

                                            <div className="grid grid-cols-2 w-full">
                                                <div className="w-full flex flex-wrap items-end justify-end gap-4">
                                                    <div className="flex flex-wrap gap-2 pt-2 mt-2 w-full max-h-[120px] overflow-y-auto">
                                                        {/* ลบไม่ได้เว่ย */}
                                                        {commandItem?.defaultShippersRender?.map((item: any, index: number) => (
                                                            <div
                                                                key={`default-${index}`}
                                                                className="relative w-fit h-[40px] p-2 text-[13px] bg-[#CFF2FF] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                                            >
                                                                {item?.name}
                                                            </div>
                                                        ))}

                                                        {
                                                            commandItem?.selectedShippersRender?.map((item: any, index: number) => (
                                                                <div
                                                                    key={index}
                                                                    className="relative w-fit h-[40px] p-2 text-[13px] bg-[#CFF2FF] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                                                >
                                                                    {item?.name}
                                                                    <button
                                                                        type="button"
                                                                        className="absolute top-[-6px] right-[-4px] w-[15px] h-[15px] rounded-full bg-[#58585A] text-white flex justify-center items-center text-[8px]"
                                                                        onClick={() => removeShipper(item?.id, commandIndex)}
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                }


                            </div>
                            {horizoneDivide()}
                        </React.Fragment>
                    )
                })
            }







            {/* =================================== หมายเหตุ ======================================== */}
            <div className="grid grid-cols-2 gap-4 pt-4">

                {/* หมายเหตุ */}
                <div className="w-full col-span-2">
                    <label className={`${labelClass}`}>{`หมายเหตุ`}</label>
                    <TextField
                        {...register("doc_41_input_note")}
                        value={watch("doc_41_input_note") || ""}
                        label=""
                        multiline
                        onChange={(e) => {
                            if (e.target.value.length <= 500) {
                                setValue("doc_41_input_note", e.target.value);
                                handletrickerEdit()
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
                            {watch("doc_41_input_note")?.length || 0} / 500
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
                                ?.filter((item: any) => !defaultEmailGrouId?.includes(item?.id)) // เอาอันที่มีอยู่แล้วออกจาก option 
                                .sort((a: any, b: any) => (a?.name || "").localeCompare(b?.name || ""))?.map((item: any) => (
                                    <MenuItem
                                        key={item?.id}
                                        value={item?.id}
                                        disabled={false}
                                    >
                                        <Checkbox checked={selectedEmailGroup?.includes(item?.id)} />
                                        <ListItemText primary={item?.name} />
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
                                    handletrickerEdit()
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
                            {...register("doc_41_input_shipper_operation")}
                            value={watch("doc_41_input_shipper_operation") || ""}
                            label=""
                            multiline
                            onChange={(e) => {
                                if (e.target.value.length <= 500) {
                                    setValue("doc_41_input_shipper_operation", e.target.value);
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
                                {watch("doc_41_input_shipper_operation")?.length || 0} / 500
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
                            {...register("doc_41_input_shipper_note")}
                            value={watch("doc_41_input_shipper_note") || ""}
                            label=""
                            multiline
                            onChange={(e) => {
                                if (e.target.value.length <= 500) {
                                    setValue("doc_41_input_shipper_note", e.target.value);
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
                                {watch("doc_41_input_shipper_note")?.length || 0} / 500
                            </span>
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
                !isShipper && (mode == 'edit' || mode == 'view') && <div className="pt-4"><TableDocument41 tableData={dataTable} dataOpenDocument={dataOpenDocument} /></div>
            }


            {(() => {
                const shouldHideButton = isShipper &&
                (dataOpenDocument?.event_doc_status_id === 1 || dataOpenDocument?.event_doc_status_id === 5);
                const validateList = validateData();
                console.log('validateList', validateList)
                return (
                    <div className="flex justify-end pt-8">
                        {mode !== 'view' && !shouldHideButton && (
                            // <button
                            //     type="submit"
                            //     className="w-[167px] h-[44px] font-semibold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            //     disabled={trickerEdit || false}
                            // >
                            //     {mode === 'create' ? 'Submit' : userDT?.account_manage?.[0]?.user_type_id === 3 ? 'Acknowledge' : 'Save'}
                            // </button>


                            // เพิ่มเงื่อนไข ถ้า userDT?.account_manage?.[0]?.user_type_id == 3 ไม่ต้อง disable
                            <button
                                type="submit"
                                className="w-[167px] h-[44px] font-semibold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                // disabled={trickerEdit || false}
                                disabled={modeDraft ? false : (validateList.length > 0 || isShipper ? false : !!trickerEdit)}
                            >
                                {/* {mode === 'create' ? 'Submit' : userDT?.account_manage?.[0]?.user_type_id === 3 ? 'Acknowledge' : 'Save'} */}
                                {/* {modeDraft ? "Submit" : (mode === 'create' ? 'Save Darft' : userDT?.account_manage?.[0]?.user_type_id === 3 ? 'Acknowledge' : 'Save')} */}
                                {(mode === 'create' ? 'Save Darft' : ( modeDraft ? "Submit" : (isShipper ? 'Acknowledge' : 'Save')))}
                            </button>
                        )}
                    </div>
                )
            })()}
        </form>


        {/* Confirm Save */}
        <ModalConfirmSave
            customWidth={(dataPDFItem?.data?.[0]?.item?.gas_shipper_41 || [])?.length > 0 ? 700 : 490}
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
                            <PdfDoc4 data={dataPDFItem} />
                        }
                        <div className="text-center">
                            {`Do you want to submit now ?`}
                        </div>
                    </div >
                    : isShipper ? <div className=" w-full">
                                        {
                                            dataPDFItem &&
                                            <PdfDoc4 data={dataPDFItem} />
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
                                <PdfDoc4 data={dataPDFItem} />
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

export default FormDocument41;