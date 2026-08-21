import { useEffect, useRef } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatNumberFourDecimal, formatNumberFourDecimalNom, formatNumberFourDecimalNomRound, formatNumberSixDecimalNom, formatNumberSixDecimalNomRound, formatNumberThreeDecimal, iconButtonClass, mapShipperData, toDayjs } from '@/utils/generalFormatter';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import BtnActionTable from "@/components/other/btnActionInTable";
import { handleSort } from "@/utils/sortTable";
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import { getService, postService } from "@/utils/postService";
import NodataTable from "@/components/other/nodataTable";
import ModalComponent from "@/components/other/ResponseModal";
import { InputSearch } from "@/components/other/SearchForm";
import Spinicon from "@/components/other/spinIcon";

interface TableProps {
    openEditForm: (id: any, id_main: any) => void;
    openViewForm: (id: any, id_main: any) => void;
    openReasonModal: (id?: any, data_comment?: any, row?: any) => void;
    openAllFileModal: any;
    tableData: any;
    isLoading: any;
    columnVisibility: any;
    userPermission?: any;
    selectedItem?: any;
    setCheckPublic: any;
    setselectedItem?: any;
    userDT: any;
    closeBalanceData: any;
    dataShipperGroup?: any;
    setIsLoading?: any;
    openHistoryForm: (id: any) => void;
}

// parameter ที่ใช้ gen doc 3.9,4,7

// ข้อมูล row เขียว
// gas_day : string (2025-01-01)
// gas_hour : number
// zone : string
// level : string
// accImb_or_accImbInv : number
// energyAdjust : number
// volumeAdjust : number
// volumeAdjustRate_mmscfd : number
// volumeAdjustRate_mmscfh : number

// ข้อมูล row ขาว (ราย shipper เป็น array)
// gas_hour : string (06:00)
// shipperName : string
// zone : string
// flow_type : string
// accImb_or_accImbInv : number
// energyAdjust : number
// volumeAdjust : number
// volumeAdjustRate_mmscfd : number
// volumeAdjustRate_mmscfh : number

// row ขาว ให้ filter เฉพาะที่ energyAdjust ค่าเป็นบวกเหมือน row เขียว หรือ เป็นลบหมือน row เขียว

// ตัวอย่าง level/flow_type
// DD, OFO, IF, Alert, NORMAL

// DD: Difficult Day 
// OFO: Operation Flow Order 
// IF: Instructed Flow Order 
// Alert: Alert 
// NORMAL: Normal

const TableBalOperateAndInstructFlow: React.FC<TableProps> = ({ openEditForm, openViewForm, tableData, isLoading, columnVisibility, userPermission, selectedItem, setselectedItem, openHistoryForm, openReasonModal, openAllFileModal, userDT, closeBalanceData, dataShipperGroup, setCheckPublic, setIsLoading }) => {

    const [tk, settk] = useState<boolean>(true);
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);
    const [toggleData, settoggleData] = useState<any>();

    {/* Confirm Save */ }
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()
    const [isLoadingGen, setIsLoadingGen] = useState(false);

    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const handleCloseModal = () => setModalSuccessOpen(false);
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);
    const [modalSuccessMsg, setModalSuccessMsg] = useState('Document has been created.');
    const [eventList, setEventList] = useState<any[] | undefined>(undefined);
    const [selectedEvent, setSelectedEvent] = useState<any>(undefined);
    
    useEffect(() => {
        if (tableData && tableData.length > 0 && toggleData == undefined) { // for first comming
            setSortedData(tableData);

            let toggleDT: any = [];
            for (let index = 0; index < tableData?.length; index++) {
                toggleDT.push(
                    {
                        toggle: false,
                        id: tableData[index]?.id,
                        timeStamp: tableData[index]?.valuesData?.timestamp
                    }
                );
            }

            if (toggleDT?.length > 0) { settoggleData(toggleDT) }
        } else if (tableData && tableData.length > 0 && toggleData !== undefined) { // for toggle and reset
            setSortedData(tableData);

            let toggleDT: any = toggleData;
            let toggleDTNEW: any = [];
            for (let index = 0; index < tableData?.length; index++) {
                let checkedData: any = toggleDT?.find((item: any) => item?.id == tableData[index]?.id);
                if (checkedData) {
                    toggleDTNEW.push(
                        {
                            toggle: checkedData?.toggle,
                            id: tableData[index]?.id,
                            timeStamp: tableData[index]?.valuesData?.timestamp
                        }
                    );
                } else {
                    toggleDTNEW.push(
                        {
                            toggle: false,
                            id: tableData[index]?.id,
                            timeStamp: tableData[index]?.valuesData?.timestamp
                        }
                    );
                }
            }

            if (toggleDTNEW?.length > 0) { settoggleData(toggleDTNEW) }
        }

        setSortedData(tableData);
        settk(!tk);
    }, [tableData]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    const [openPopoverId, setOpenPopoverId] = useState(null);
    const [openPopoverIdWhiteRow, setOpenPopoverIdWhiteRow] = useState(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const popoverRefWhiteRow = useRef<HTMLDivElement>(null);

    const togglePopover = (id: any) => {
        if (openPopoverId === id) {
            setOpenPopoverId(null); // Close the popover if it's already open
        } else {
            setOpenPopoverId(id); // Open the popover for the clicked row
        }
    };

    const togglePopoverWhiteRow = (id: any) => {
        if (openPopoverIdWhiteRow === id) {
            setOpenPopoverIdWhiteRow(null);
        } else {
            setOpenPopoverIdWhiteRow(id);
        }
    };

    const toggleMenu = (mode: any, id: any, id_main?: any) => {

        switch (mode) {
            case "view":
                openViewForm(id, id_main);
                setOpenPopoverIdWhiteRow(null);
                break;
            case "edit":
                openEditForm(id, id_main);
                setOpenPopoverIdWhiteRow(null);
                break;
            case "history":
                openHistoryForm(id);
                setOpenPopoverIdWhiteRow(null);
                break;
        }
    }

    const handleClickOutside = (event: MouseEvent) => {
        if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
            setTimeout(() => setOpenPopoverId(null), 100);
        }
    };

    const handleClickOutsideWhiteRow = (event: MouseEvent) => {
        if (popoverRefWhiteRow.current && !popoverRefWhiteRow.current.contains(event.target as Node)) {
            setTimeout(() => setOpenPopoverIdWhiteRow(null), 100);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [popoverRef]);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutsideWhiteRow);
        return () => {
            document.removeEventListener('mousedown', handleClickOutsideWhiteRow);
        };
    }, [popoverRefWhiteRow]);

    const postPublicationCenter = async (data: any) => {

        // master/allocation/publication-center
        const body_post = {
            "execute_timestamp": data?.execute_timestamp,
            "gas_day": data?.gas_day,
            "gas_hour": data?.gas_hour
        }

        const res_ = await postService('/master/allocation/publication-center', body_post);
        setCheckPublic(true)
    }

    const [typeGenerate, setTypeGenerate] = useState('');
    const [docGenerate, setDocGenerate] = useState('');

    const generateEvent = (row_data: any, type: any) => {
        let eventPath = ''
        switch (type.toLowerCase()) {
            case 'dd':
                // // doc39and4
                // setDocGenerate('3.9 And 4')
                // break;
            case 'difficult day':
                // // doc39and4
                // setDocGenerate('3.9 And 4')
                // break;
            case 'difficult day flow':
                // doc39and4
                setDocGenerate('3.9 And 4')
                eventPath = 'emer'
                break;

            case 'ofo':
                // //doc7
                // setDocGenerate('7')
                // break;
            case 'operation flow':
            case 'operation flow order':
                // //doc7
                // setDocGenerate('7')
                // break;
            case 'if':
                // //doc7
                // setDocGenerate('7')
                // break;
            case 'instructed flow':
                //doc7
                setDocGenerate('7')
                eventPath = 'ofo'
                break;
        }

        setTypeGenerate(type)

        if(eventPath == 'ofo'){
            const gasDayjs = row_data?.gas_day ? toDayjs(row_data?.gas_day) : undefined;
            const eventDateFrom = gasDayjs?.isValid() ? gasDayjs.startOf('day').format('YYYY-MM-DD') : '';
            const eventDateTo = gasDayjs?.isValid() ? gasDayjs.endOf('day').format('YYYY-MM-DD') : '';
            const eventStat = '1'; //'Open' = '1' , 'Close' = '2'
    
            getService(`/master/event/${eventPath}?eventDateFrom=${eventDateFrom}&eventDateTo=${eventDateTo}&EventStatus=${eventStat}&offset=0&limit=100`).then(response => {
                if (response?.data && Array.isArray(response.data)){
                    setEventList(response.data)
                }
                else{
                    setEventList([])
                }
            })
        }
        else{
            setEventList([])
        }


        let data_post_real = {
            "gas_day": row_data?.gas_day,
            // "gas_hour": row_data?.valuesData?.gas_hour,
            "gas_hour": row_data?.gas_hour,
            "zone": row_data?.zone,
            "level": row_data?.level == "DD" ? "DIFFICULT DAY FLOW" : row_data?.level, // flow type | DD = DIFFICULT DAY FLOW
            "accImb_or_accImbInv": row_data?.valuesData?.accImb_or_accImbInv,
            "energyAdjust": row_data?.valuesData?.energyAdjust,
            "volumeAdjust": row_data?.valuesData?.volumeAdjust,
            "volumeAdjustRate_mmscfd": row_data?.valuesData?.volumeAdjustRate_mmscfd,
            "volumeAdjustRate_mmscfh": row_data?.valuesData?.volumeAdjustRate_mmscfh,
            "shipper": [
                {
                    "shipperName": "EGAT-001-1",
                    "gas_hour": "06:00",
                    "zone": "EAST",
                    "flow_type": "DIFFICULT DAY FLOW",  // flow type | DD = DIFFICULT DAY FLOW
                    "accImb_or_accImbInv": 100,
                    "energyAdjust": 100,
                    "volumeAdjust": 100,
                    "volumeAdjustRate_mmscfd": 100,
                    "volumeAdjustRate_mmscfh": 100
                }
            ]
        }


        // ตัวอย่าง level/flow_type
        // DD, OFO, IF, Alert, NORMAL

        // DD: Difficult Day 
        // OFO: Operation Flow Order 
        // IF: Instructed Flow Order 
        // Alert: Alert 
        // NORMAL: Normal
        const result = mapShipperData(row_data, data_post_real);
        // res.status(200).json(result);
        handleSaveConfirm(result, type)
    }

    // #region จังหวะกด yes
    const handlePostGenEvent = async (data_post?: any, doc_no?: any) => {
        switch (doc_no) {
            case 39:
                // gen 39 and 4
                const res_gen_doc_39_4 = await postService(`/master/event/emer/generatedoc39and4`, {...data_post, event_id: selectedEvent});
                // const status = res_gen_doc_39_4?.response?.data?.status ?? res_gen_doc_39_4?.response?.data?.statusCode;
                const status = res_gen_doc_39_4?.response?.data?.statusCode ?? res_gen_doc_39_4?.response?.data?.status ?? res_gen_doc_39_4?.status ?? res_gen_doc_39_4?.statusCode ?? res_gen_doc_39_4?.code;
                const errorMsg = res_gen_doc_39_4?.response?.data?.error ?? res_gen_doc_39_4?.data?.error ?? res_gen_doc_39_4?.response?.error ?? res_gen_doc_39_4?.error;

                // เมื่อกดปุ่ม Generate Event แล้วจะมี Modal Confirm ขึ้น ถ้ากด confirm แล้ว success ก็จะมี modal ขึ้นอีกรอบ https://app.clickup.com/t/86eugptfb
                if ([400, 500].includes(status)) {
                    // setModalErrorMsg(res_gen_doc_39_4?.response?.data?.error ? res_gen_doc_39_4?.response?.data?.error : "Something went wrong.");
                    setModalErrorMsg(errorMsg ? errorMsg : "Something went wrong.");
                    setModalErrorOpen(true)
                } else {
                    // setFormOpen(false);
                    setModalSuccessMsg('Emergency Doc.1 and 2 has been created.')
                    setModalSuccessOpen(true);
                }

                break;
            case 7:
                // gen 7
                const res_gen_doc_7 = await postService(`/master/event/ofo/generatedoc7`, {...data_post, event_id: selectedEvent});
                // const status_2 = res_gen_doc_7?.response?.data?.status ?? res_gen_doc_7?.response?.data?.statusCode;
                const status_2 = res_gen_doc_7?.response?.data?.statusCode ?? res_gen_doc_7?.response?.data?.status ?? res_gen_doc_7?.status ?? res_gen_doc_7?.statusCode ?? res_gen_doc_7?.code;
                const errorMsg2 = res_gen_doc_7?.response?.data?.error ?? res_gen_doc_7?.data?.error ?? res_gen_doc_7?.response?.error ?? res_gen_doc_7?.error ?? res_gen_doc_7?.response?.data?.message;

                // เมื่อกดปุ่ม Generate Event แล้วจะมี Modal Confirm ขึ้น ถ้ากด confirm แล้ว success ก็จะมี modal ขึ้นอีกรอบ https://app.clickup.com/t/86eugptfb
                if ([400, 500].includes(status_2)) {
                    // setModalErrorMsg(res_gen_doc_7?.response?.data?.error ? res_gen_doc_7?.response?.data?.error : "Something went wrong.");
                    setModalErrorMsg(errorMsg2 ? errorMsg2 : "Something went wrong.");
                    setModalErrorOpen(true)
                } else {
                    // setFormOpen(false);
                    setModalSuccessMsg('Document 7 has been created.')
                    setModalSuccessOpen(true);
                }
                break;
        }

        setTimeout(() => {
            setIsLoadingGen(false);
            setModaConfirmSave(false);
        }, 400);
    }

    {/* Confirm Save */ }
    const handleSaveConfirm = async (data?: any, type?: any) => {
        setDataSubmit(data)
        setModaConfirmSave(true)
    }

    // useEffect(() => {
    //   console.log('sortedData : ', sortedData);
    // }, [sortedData])
    
    // #FFEAA033

    return (<>

        <div className="h-[calc(100vh-380px)] overflow-y-auto overflow-x-auto rounded-t-md">
            {
                isLoading ?
                    <table className="table-auto min-w-full text-sm rtl:text-right text-gray-500 whitespace-nowrap">

                        <thead className="text-xs text-[#ffffff] sticky top-0 z-10">
                            <tr className="h-20">

                                {columnVisibility?.publicate && userDT?.account_manage?.[0]?.user_type_id !== 3 && (
                                    <th className={`${table_header_style} px-4 bg-[#1473A1] rounded-tl-[10px] min-w-[80px] text-center`}>
                                        {`Publicate`}
                                    </th>
                                )}

                                {columnVisibility?.timestamp && (
                                    <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-center`} onClick={() => handleSort("valuesData.timestamp", sortState, setSortState, setSortedData, tableData)}>
                                        {`Timestamp`}
                                        {getArrowIcon("valuesData.timestamp")}
                                    </th>
                                )}

                                {columnVisibility?.hourly && (
                                    <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-center`} onClick={() => handleSort("valuesData.gas_hour", sortState, setSortState, setSortedData, tableData)}>
                                        {`Hourly`}
                                        {getArrowIcon("valuesData.gas_hour")}
                                    </th>
                                )}

                                {columnVisibility?.shipper_name && (
                                    <th
                                        className={`${table_header_style} px-4 bg-[#1473A1] min-w-[80px] text-center`}
                                    // onClick={() => handleSort("shipper_name", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Shipper Name`}
                                        {/* {getArrowIcon("shipper_name")} */}
                                    </th>
                                )}

                                {columnVisibility?.zone && (
                                    <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-center`} onClick={() => handleSort("zone", sortState, setSortState, setSortedData, tableData)}>
                                        {`Zone`}
                                        {getArrowIcon("zone")}
                                    </th>
                                )}

                                {columnVisibility?.acc_imbalance && (
                                    <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-left`} onClick={() => handleSort("valuesData.accImb_or_accImbInv", sortState, setSortState, setSortedData, tableData)}>
                                        <div>{`Acc. Imbalance / Acc. Imbalance `}</div>
                                        <div>{`Inventory (MMBTU)`}</div>
                                        {getArrowIcon("valuesData.accImb_or_accImbInv")}
                                    </th>
                                )}

                                {columnVisibility?.acc_margin && (
                                    <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-center`} onClick={() => handleSort("valuesData.accMargin", sortState, setSortState, setSortedData, tableData)}>
                                        {`Acc.Margin (MMBTU)`}
                                        {getArrowIcon("valuesData.accMargin")}
                                    </th>
                                )}

                                {columnVisibility?.flow_type && (
                                    <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-center`} onClick={() => handleSort("valuesData.flow_type", sortState, setSortState, setSortedData, tableData)}>
                                        {`Flow Type`}
                                        {getArrowIcon("valuesData.flow_type")}
                                    </th>
                                )}

                                {columnVisibility?.energy_adjustment_mmbtu && (
                                    <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-center`} onClick={() => handleSort("valuesData.energyAdjust", sortState, setSortState, setSortedData, tableData)}>
                                        {`Energy Adjustment (MMBTU)`}
                                        {getArrowIcon("valuesData.energyAdjust")}
                                    </th>
                                )}

                                {columnVisibility?.energy_flow_rate_adjustment_mmbtuh && (
                                    <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-left`} onClick={() => handleSort("valuesData.energyAdjustRate_mmbtuh", sortState, setSortState, setSortedData, tableData)}>
                                        <div>{`Energy Flow Rate`}</div>
                                        <div>{`Adjustment (MMBTU/H)`}</div>
                                        {getArrowIcon("valuesData.energyAdjustRate_mmbtuh")}
                                    </th>
                                )}

                                {columnVisibility?.energy_flow_rate_adjustment_mmbtud && (
                                    <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-left`} onClick={() => handleSort("valuesData.energyAdjustRate_mmbtud", sortState, setSortState, setSortedData, tableData)}>
                                        <div>{`Energy Flow Rate`}</div>
                                        <div>{`Adjustment (MMBTU/D)`}</div>
                                        {getArrowIcon("valuesData.energyAdjustRate_mmbtud")}
                                    </th>
                                )}

                                {columnVisibility?.volume_adjustment_mmbtu && (
                                    <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-center`} onClick={() => handleSort("valuesData.volumeAdjust", sortState, setSortState, setSortedData, tableData)}>
                                        {/* {`Volume Adjustment (MMBTU)`} */}
                                        {`Volume Adjustment (MMSCF)`}
                                        {getArrowIcon("valuesData.volumeAdjust")}
                                    </th>
                                )}

                                {columnVisibility?.volume_flow_rate_adjustment_mmscfh && (
                                    <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-left`} onClick={() => handleSort("valuesData.volumeAdjustRate_mmscfh", sortState, setSortState, setSortedData, tableData)}>
                                        <div>{`Volume Flow Rate`}</div>
                                        <div>{`Adjustment (MMSCF/H)`}</div>
                                        {getArrowIcon("valuesData.volumeAdjustRate_mmscfh")}
                                    </th>
                                )}

                                {columnVisibility?.volume_flow_rate_adjustment_mmscfd && (
                                    <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-left`} onClick={() => handleSort("valuesData.volumeAdjustRate_mmscfd", sortState, setSortState, setSortedData, tableData)}>
                                        <div>{`Volume Flow Rate`}</div>
                                        <div>{`Adjustment (MMSCFD)`}</div>
                                        {getArrowIcon("valuesData.volumeAdjustRate_mmscfd")}
                                    </th>
                                )}

                                {columnVisibility?.resolvedTime_hr && (
                                    <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-center`} onClick={() => handleSort("valuesData.resolveHour", sortState, setSortState, setSortedData, tableData)}>
                                        {`ResolvedTime (Hr.)`}
                                        {getArrowIcon("valuesData.resolveHour")}
                                    </th>
                                )}

                                {columnVisibility?.hv_btu_scf && (
                                    <th className={`${table_sort_header_style} bg-[#1473A1] min-w-[80px] text-center`} onClick={() => handleSort("valuesData.heatingValue", sortState, setSortState, setSortedData, tableData)}>
                                        {`HV (BTU/SCF)`}
                                        {getArrowIcon("valuesData.heatingValue")}
                                    </th>
                                )}

                                {columnVisibility?.file && (
                                    <th className={`${table_header_style} bg-[#1473A1] min-w-[80px] text-center`} >
                                        {`File`}
                                    </th>
                                )}

                                {columnVisibility?.comment && (
                                    <th className={`${table_header_style} bg-[#1473A1] min-w-[80px] text-center`}>
                                        {`Comment`}
                                    </th>
                                )}

                                {/* Shipper ไม่ให้เห็น Column Action https://app.clickup.com/t/86etuzb7x */}
                                {columnVisibility?.action && userDT?.account_manage?.[0]?.user_type_id !== 3 && (
                                    <th scope="col" className="px-2 py-1 text-center bg-[#1473A1]">
                                        {`Action`}
                                    </th>
                                )}

                            </tr>
                        </thead>

                        <tbody>
                            {sortedData && sortedData.map((row: any, key: any) => {
                                // console.log('row : ', row);
                                return (
                                    <>
                                        <tr
                                            key={'main-' + key + row?.valuesData?.timestamp}
                                            className={`${table_row_style} !bg-[#E8FFEE] cursor-pointer`}
                                            onClick={() => {
                                                // let toggleIDX: any = toggleData?.findIndex((item: any) => item?.id == row?.id);

                                                let toggleIDX: any = toggleData?.findIndex((item: any) => item?.id == row?.id && item?.timeStamp == row?.valuesData?.timestamp);

                                                if (toggleIDX !== -1) {
                                                    toggleData[toggleIDX].toggle = !toggleData[toggleIDX]?.toggle;
                                                    settk(!tk);
                                                }
                                            }}
                                        >

                                            {columnVisibility?.publicate && (
                                                <td className="px-2 py-1 text-[#464255] bg-[#E8FFEE]">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {toggleData && toggleData?.[key]?.toggle === true ? (
                                                            <ExpandLessRoundedIcon sx={{ fontSize: 30 }} />
                                                        ) : (
                                                            <ExpandMoreRoundedIcon sx={{ fontSize: 30 }} />
                                                        )}
                                                    </div>
                                                </td>
                                            )}

                                            {columnVisibility?.timestamp && (
                                                <td className="px-2 py-1 font-semibold text-[#464255] bg-[#E8FFEE]">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {row?.valuesData ? row?.valuesData?.timestamp : ''}
                                                    </div>
                                                </td>
                                            )}

                                            {columnVisibility?.hourly && (
                                                <td className="px-2 py-1 font-semibold text-[#464255] bg-[#E8FFEE]">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {row?.valuesData ? row?.valuesData?.gas_hour : ''}
                                                    </div>
                                                </td>
                                            )}

                                            {columnVisibility?.shipper_name && (
                                                <td className="px-2 py-1 font-semibold text-[#464255] bg-[#E8FFEE]">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {/* {row?.valuesData ? row?.valuesData?.shipperName : ''} */}
                                                        {'System'}
                                                        {/* https://app.clickup.com/t/9018502823/86eujrgrr */}
                                                    </div>
                                                </td>
                                            )}

                                            {columnVisibility?.zone && (
                                                <td className="px-2 py-1  text-[#464255] bg-[#E8FFEE]">
                                                    <div className="w-full flex justify-center items-center px-[20px]">
                                                        <div className="flex w-[120px] justify-center rounded-full px-1 py-2 text-[#464255]" style={{ backgroundColor: row?.valuesData?.zoneObj?.color }}>{`${row?.valuesData?.zoneObj?.name ? row?.valuesData?.zoneObj?.name : ''}`}</div>
                                                    </div>
                                                </td>
                                            )}

                                            {columnVisibility?.acc_imbalance && (
                                                <td className="px-2 py-1 font-semibold text-right text-[#06522E] bg-[#E8FFEE]">
                                                    {/* {row?.valuesData?.accImb_or_accImbInv ? formatNumberFourDecimal(row?.valuesData?.accImb_or_accImbInv) : ''} */}
                                                    {row?.valuesData?.accImb_or_accImbInv !== null && row?.valuesData?.accImb_or_accImbInv !== undefined ? formatNumberFourDecimalNom(row?.valuesData?.accImb_or_accImbInv) : ''}
                                                </td>
                                            )}

                                            {columnVisibility?.acc_margin && (
                                                <td className="px-2 py-1 font-semibold text-right text-[#06522E] bg-[#E8FFEE]">
                                                    {/* {row?.valuesData?.accMargin ? formatNumberFourDecimal(row?.valuesData?.accMargin) : ''} */}
                                                    {formatNumberFourDecimalNom(row?.valuesData?.accMargin)}
                                                </td>
                                            )}

                                            {columnVisibility?.flow_type && (
                                                <td className="px-2 py-1 font-semibold text-right text-[#06522E] bg-[#E8FFEE]">
                                                    {row?.valuesData?.flow_type ? row?.valuesData?.flow_type : ''}
                                                </td>
                                            )}

                                            {columnVisibility?.energy_adjustment_mmbtu && (
                                                <td className="px-2 py-1 font-semibold text-right text-[#06522E] bg-[#E8FFEE]">
                                                    {/* {row?.valuesData?.energyAdjustRate_mmbtud ? formatNumberFourDecimal(row?.valuesData?.energyAdjustRate_mmbtud) : ''} */}
                                                    {/* {row?.valuesData?.energyAdjust ? formatNumberFourDecimal(row?.valuesData?.energyAdjust) : ''} */}
                                                    {formatNumberFourDecimalNom(row?.valuesData?.energyAdjust)}
                                                </td>
                                            )}

                                            {columnVisibility?.energy_flow_rate_adjustment_mmbtuh && (
                                                <td className="px-2 py-1 font-semibold text-right text-[#06522E] bg-[#E8FFEE]">
                                                    {/* {row?.valuesData?.energyAdjustRate_mmbtuh ? formatNumberFourDecimal(row?.valuesData?.energyAdjustRate_mmbtuh) : ''} */}
                                                    {formatNumberFourDecimalNom(row?.valuesData?.energyAdjustRate_mmbtuh)}
                                                </td>
                                            )}

                                            {columnVisibility?.energy_flow_rate_adjustment_mmbtud && (
                                                <td className="px-2 py-1 font-semibold text-right text-[#06522E] bg-[#E8FFEE]">
                                                    {/* {row?.valuesData?.energyAdjustRate_mmbtud ? formatNumberFourDecimal(row?.valuesData?.energyAdjustRate_mmbtud) : ''} */}
                                                    {formatNumberFourDecimalNom(row?.valuesData?.energyAdjustRate_mmbtud)}
                                                </td>
                                            )}

                                            {columnVisibility?.volume_adjustment_mmbtu && (
                                                <td className="px-2 py-1 font-semibold text-right text-[#06522E] bg-[#E8FFEE]">
                                                    {/* {row?.valuesData?.volumeAdjust ? formatNumberFourDecimal(row?.valuesData?.volumeAdjust) : ''} */}
                                                    {formatNumberSixDecimalNom(row?.valuesData?.volumeAdjust)}
                                                </td>
                                            )}

                                            {columnVisibility?.volume_flow_rate_adjustment_mmscfh && (
                                                <td className="px-2 py-1 font-semibold text-right text-[#06522E] bg-[#E8FFEE]">
                                                    {/* {row?.valuesData?.volumeAdjustRate_mmscfh ? formatNumberFourDecimal(row?.valuesData?.volumeAdjustRate_mmscfh) : ''} */}

                                                    {/* ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w  */}
                                                    {/* {formatNumberFourDecimalNom(row?.valuesData?.volumeAdjustRate_mmscfh)} */}
                                                    {formatNumberSixDecimalNom(row?.valuesData?.volumeAdjustRate_mmscfh)}
                                                </td>
                                            )}

                                            {columnVisibility?.volume_flow_rate_adjustment_mmscfd && (
                                                <td className="px-2 py-1 font-semibold text-right text-[#06522E] bg-[#E8FFEE]">
                                                    {/* {row?.valuesData?.volumeAdjustRate_mmscfd ? formatNumberFourDecimal(row?.valuesData?.volumeAdjustRate_mmscfd) : ''} */}

                                                    {/* ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w  */}
                                                    {/* {formatNumberFourDecimalNom(row?.valuesData?.volumeAdjustRate_mmscfd)} */}
                                                    {formatNumberSixDecimalNom(row?.valuesData?.volumeAdjustRate_mmscfd)}
                                                </td>
                                            )}

                                            {columnVisibility?.resolvedTime_hr && (
                                                <td className="px-2 py-1 font-semibold text-right text-[#06522E] bg-[#E8FFEE]">
                                                    {row?.valuesData?.resolveHour ? row?.valuesData?.resolveHour : ''}
                                                </td>
                                            )}

                                            {columnVisibility?.hv_btu_scf && (
                                                <td className="px-2 py-1 font-semibold text-right text-[#06522E] bg-[#E8FFEE]">
                                                    {/* {row?.valuesData?.heatingValue ? formatNumberThreeDecimal(row?.valuesData?.heatingValue) : ''} */}
                                                    {row?.valuesData?.heatingValue !== null && row?.valuesData?.heatingValue !== undefined ? formatNumberFourDecimalNom(row?.valuesData?.heatingValue) : ''}
                                                </td>
                                            )}

                                            {columnVisibility?.file && (
                                                <td className="px-2 py-1 font-semibold text-right text-[#06522E] bg-[#E8FFEE]">
                                                </td>
                                            )}

                                            {columnVisibility?.comment && (
                                                <td className="px-2 py-1 font-semibold text-right text-[#06522E] bg-[#E8FFEE]">
                                                </td>
                                            )}

                                            {columnVisibility?.action && (userDT?.account_manage?.[0]?.user_type_id !== 3 && userDT?.account_manage?.[0]?.user_type_id !== 4) && (
                                                <td className="px-2 py-1 text-[#464255]" >
                                                    {/* ปุ่ม Action Row เขียว ซ่อนไปเลยเพราะกดไม่ได้อยู่แล้ว https://app.clickup.com/t/86etuxub9 */}

                                                    {/* level ต้องเป็น type == "DD", "OFO", IF เท่านั้น */}
                                                    {
                                                        // ["DD", "OFO", "IF", "OPERATION FLOW", "INSTRUCTED FLOW", "DIFFICULT DAY FLOW"].includes(row?.level) &&
                                                        ["DD", "OFO", "IF", "OPERATION FLOW", "OPERATION FLOW ORDER", "INSTRUCTED FLOW", "DIFFICULT DAY FLOW", "DIFFICULT DAY"].includes(row?.valuesData?.flow_type) &&
                                                        // ["NORMAL"].includes(row?.level) &&
                                                        <div className="relative inline-flex justify-center items-center w-full">
                                                            <BtnActionTable
                                                                togglePopover={togglePopover}
                                                                row_id={row?.id + row?.valuesData?.timestamp}
                                                                disable={!userPermission?.f_edit ? true : false}
                                                            />
                                                            {openPopoverId === row?.id + row?.valuesData?.timestamp && (
                                                                <div
                                                                    ref={popoverRef}
                                                                    className="absolute left-[-8rem] top-[-10px] mt-2 w-46 bg-white border border-gray-300 rounded-lg shadow-lg z-50"
                                                                >
                                                                    <ul className="py-2">
                                                                        {/* orignal is f_create */}
                                                                        {userPermission?.f_edit && (
                                                                            <li
                                                                                className="w-full flex items-center gap-x-2 px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer"
                                                                                onClick={() => {
                                                                                    generateEvent(row, row?.valuesData?.flow_type)
                                                                                }}
                                                                            >
                                                                                <InsertDriveFileOutlinedIcon sx={{ fontSize: 20, color: '#58585A' }} />
                                                                                {`Generate Event`}
                                                                            </li>
                                                                        )}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    }

                                                </td>
                                            )}
                                        </tr>

                                        {/* EXPAND */}
                                        {/* {toggleData?.find((item: any) => item?.id == row?.id)?.toggle == true && row?.shipperData?.length > 0 && row?.shipperData?.map((item: any, key: any) => { */}
                                        {/* {toggleData?.find((item: any) => item?.id == row?.id)?.toggle == true && toggleData?.find((item: any) => item?.timeStamp == row?.valuesData.timestamp).timeStamp == row?.valuesData.timestamp && row?.shipperData?.length > 0 && row?.shipperData?.map((item: any, key: any) => { */}
                                        {
                                            toggleData?.find((item: any) => item?.id == row?.id && item?.timeStamp == row?.valuesData?.timestamp)?.toggle === true &&
                                            Array.isArray(row?.shipperData) && row?.shipperData.length > 0 && row.shipperData.map((item: any, key: number) => {

                                                // let thisCheckItem: any = checkedData?.find((item: any) => item?.id == row?.id);

                                                // https://app.clickup.com/t/86etuy23q List : Column Shipper Name ต้องแสดงเป็น Short Name (ปัจจุบันแสดงเป็น Shipper Code Name)
                                                const find_shipper = dataShipperGroup?.find((itemx: any) => itemx?.id_name == item?.shipperName)

                                                return (
                                                    <tr
                                                        key={'sub-' + key}
                                                        className={`${table_row_style}`}
                                                    >

                                                        {columnVisibility?.publicate && (
                                                            <td className="px-2 py-1 text-[#464255] max-w-[60px] text-center">
                                                                {/* <div className="flex items-center justify-center gap-2">
                                                            </div> */}

                                                                <input
                                                                    type="checkbox"
                                                                    checked={item?.publication}
                                                                    // disabled={row.query_shipper_nomination_status_id !== 1}
                                                                    // onChange={() => handleSelectRow(row)}
                                                                    onChange={() => postPublicationCenter(row)}
                                                                    // className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1]"
                                                                    className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1] disabled:opacity-100 disabled:cursor-not-allowed"
                                                                />
                                                            </td>
                                                        )}

                                                        {columnVisibility?.timestamp && (
                                                            <td className="px-2 py-1  text-[#464255] bg-[#FFFFFF]">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    {item?.timestamp ? item?.timestamp : ''}
                                                                </div>
                                                            </td>
                                                        )}

                                                        {columnVisibility?.hourly && (
                                                            <td className="px-2 py-1  text-[#464255] bg-[#FFFFFF]">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    {item?.gas_hour ? item?.gas_hour : ''}
                                                                </div>
                                                            </td>
                                                        )}

                                                        {columnVisibility?.shipper_name && (
                                                            <td className="px-2 py-1  text-[#464255] bg-[#FFFFFF]">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    {/* {item ? item?.shipperName : ''} */}
                                                                    {find_shipper ? find_shipper?.name : ''}
                                                                </div>
                                                            </td>
                                                        )}

                                                        {columnVisibility?.zone && (
                                                            <td className="px-2 py-1  text-[#464255] bg-[#FFFFFF]">
                                                                <div className="w-full flex justify-center items-center px-[20px]">
                                                                    <div className="flex w-[120px] justify-center rounded-full px-1 py-2 text-[#464255]" style={{ backgroundColor: item?.zoneObj?.color }}>{`${item?.zoneObj?.name ? item?.zoneObj?.name : ''}`}</div>
                                                                </div>
                                                            </td>
                                                        )}

                                                        {columnVisibility?.acc_imbalance && (
                                                            <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF]">
                                                                {/* {item?.accImb_or_accImbInv ? formatNumberFourDecimal(item?.accImb_or_accImbInv) : ''} */}
                                                                {item?.accImb_or_accImbInv !== null && item?.accImb_or_accImbInv !== undefined ? formatNumberFourDecimal(item?.accImb_or_accImbInv) : ''}
                                                            </td>
                                                        )}

                                                        {columnVisibility?.acc_margin && (
                                                            <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF]">
                                                                {/* {item?.accMargin ? formatNumberFourDecimal(item?.accMargin) : ''} */}
                                                                {item?.accMargin !== null && item?.accMargin !== undefined ? formatNumberFourDecimal(item?.accMargin) : ''}
                                                            </td>
                                                        )}

                                                        {columnVisibility?.flow_type && (
                                                            <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF]">
                                                                {/* {item?.flow_type ? item?.flow_type : ''} */}
                                                                {/* {item?.flow_type !== null && item?.flow_type !== undefined ? item?.flow_type : ''} */}
                                                            </td>
                                                        )}

                                                        {columnVisibility?.energy_adjustment_mmbtu && (
                                                            <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF]">
                                                                {/* {item?.energyAdjustRate_mmbtud ? formatNumberFourDecimal(item?.energyAdjustRate_mmbtud) : ''} */}
                                                                {/* {item?.energyAdjust ? formatNumberFourDecimal(item?.energyAdjust) : ''} */}
                                                                {item?.energyAdjust !== null && item?.energyAdjust !== undefined ? formatNumberFourDecimal(item?.energyAdjust) : ''}
                                                            </td>
                                                        )}

                                                        {columnVisibility?.energy_flow_rate_adjustment_mmbtuh && (
                                                            <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF]">
                                                                {/* {item?.energyAdjustRate_mmbtuh ? formatNumberFourDecimal(item?.energyAdjustRate_mmbtuh) : ''} */}
                                                                {item?.energyAdjustRate_mmbtuh !== null && item?.energyAdjustRate_mmbtuh !== undefined ? formatNumberFourDecimal(item?.energyAdjustRate_mmbtuh) : ''}
                                                            </td>
                                                        )}

                                                        {columnVisibility?.energy_flow_rate_adjustment_mmbtud && (
                                                            <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF]">
                                                                {/* {item?.energyAdjustRate_mmbtud ? formatNumberFourDecimal(item?.energyAdjustRate_mmbtud) : ''} */}
                                                                {item?.energyAdjustRate_mmbtud !== null && item?.energyAdjustRate_mmbtud !== undefined ? formatNumberFourDecimal(item?.energyAdjustRate_mmbtud) : ''}
                                                            </td>
                                                        )}

                                                        {columnVisibility?.volume_adjustment_mmbtu && (
                                                            <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF]">
                                                                {/* {item?.volumeAdjust ? formatNumberFourDecimal(item?.volumeAdjust) : ''} */}
                                                                {item?.volumeAdjust !== null && item?.volumeAdjust !== undefined ? formatNumberSixDecimalNom(item?.volumeAdjust) : ''}
                                                            </td>
                                                        )}

                                                        {columnVisibility?.volume_flow_rate_adjustment_mmscfh && (
                                                            <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF]">
                                                                {/* {item?.volumeAdjustRate_mmscfh ? formatNumberFourDecimal(item?.volumeAdjustRate_mmscfh) : ''} */}

                                                                {/* ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w  */}
                                                                {/* {item?.volumeAdjustRate_mmscfh !== null && item?.volumeAdjustRate_mmscfh !== undefined ? formatNumberFourDecimal(item?.volumeAdjustRate_mmscfh) : ''} */}
                                                                {item?.volumeAdjustRate_mmscfh !== null && item?.volumeAdjustRate_mmscfh !== undefined ? formatNumberSixDecimalNom(item?.volumeAdjustRate_mmscfh) : ''}
                                                            </td>
                                                        )}

                                                        {columnVisibility?.volume_flow_rate_adjustment_mmscfd && (
                                                            <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF]">
                                                                {/* {item?.volumeAdjustRate_mmscfd ? formatNumberFourDecimal(item?.volumeAdjustRate_mmscfd) : ''} */}

                                                                {/* ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w  */}
                                                                {/* {item?.volumeAdjustRate_mmscfd !== null && item?.volumeAdjustRate_mmscfd !== undefined ? formatNumberFourDecimal(item?.volumeAdjustRate_mmscfd) : ''} */}
                                                                {item?.volumeAdjustRate_mmscfd !== null && item?.volumeAdjustRate_mmscfd !== undefined ? formatNumberSixDecimalNom(item?.volumeAdjustRate_mmscfd) : ''}
                                                            </td>
                                                        )}

                                                        {columnVisibility?.resolvedTime_hr && (
                                                            <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF]">
                                                                {item?.resolveHour ? item?.resolveHour : ''}
                                                            </td>
                                                        )}

                                                        {columnVisibility?.hv_btu_scf && (
                                                            <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF]">
                                                                {/* {item?.heatingValue ? formatNumberThreeDecimal(item?.heatingValue) : ''} */}
                                                                {item?.heatingValue !== null && item?.heatingValue !== undefined ? formatNumberThreeDecimal(item?.heatingValue) : ''}
                                                            </td>
                                                        )}

                                                        {/* 
                                                    {columnVisibility?.file && (
                                                        <td className="px-2 py-1 text-[#464255]">
                                                            {item?.file ? <><InsertDriveFileOutlinedIcon sx={{ fontSize: '20px' }} /> {item?.file}</> : ''}
                                                        </td>
                                                    )} */}

                                                        {columnVisibility.file && (
                                                            <td className="px-2 py-1 text-center">
                                                                <div className="inline-flex items-center justify-center relative">
                                                                    {/* <button
                                                                        type="button"
                                                                        className="flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                                                                        onClick={() => openAllFileModal(item?.id, row?.id, row)}
                                                                        // disabled={!userPermission?.f_view || row?.file_capacity_request_management.length <= 0}
                                                                        disabled={!userPermission?.f_view}
                                                                    >
                                                                        <AttachFileRoundedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                                                                    </button> */}

                                                                    <button
                                                                        type="button"
                                                                        aria-label="Open files"
                                                                        onClick={() => openAllFileModal(item?.id, row?.id, row)}
                                                                        // disabled={!userPermission?.f_view}
                                                                        disabled={!userPermission?.f_import} // กันส่งมา 3. Operation Flow and Instructed Flow > ปุ่ม File กดไม่ได้ มันต้องกดได้ พอคลิกแล้วขึ้นแบบตามรูป โดยปุ่มนี้จะยึดตามสิทธิ์ Import
                                                                        className={iconButtonClass}
                                                                    >
                                                                        <AttachFileRoundedIcon
                                                                            fontSize="inherit"
                                                                            className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                                                            sx={{ color: 'currentColor', fontSize: 18 }}
                                                                        />
                                                                    </button>
                                                                    <span className="px-2 text-[#464255]">
                                                                        {item?.file?.length}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        )}

                                                        {columnVisibility?.comment && (
                                                            <td className="px-2 py-1 text-[#464255] text-center ">
                                                                <div className="inline-flex items-center justify-center relative">
                                                                    {/* <button
                                                                        type="button"
                                                                        className="flex items-center justify-center px-[2px] py-[2px] bg-white rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                                                                        onClick={() => openReasonModal(item?.id, item?.comment, item)}
                                                                    >
                                                                        <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                                                                    </button> */}

                                                                    <button
                                                                        type="button"
                                                                        className={iconButtonClass}
                                                                        onClick={() => openReasonModal(item?.id, item?.comment, item)}
                                                                    >
                                                                        <ChatBubbleOutlineOutlinedIcon
                                                                            fontSize="inherit"
                                                                            className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                                                            sx={{ color: 'currentColor', fontSize: 18 }}
                                                                        />
                                                                    </button>

                                                                    <span className="px-2 text-[#464255]">
                                                                        {item?.comment ? item?.comment?.length : null}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        )}

                                                        {columnVisibility.action && (userDT?.account_manage?.[0]?.user_type_id !== 3 && userDT?.account_manage?.[0]?.user_type_id !== 4) && (
                                                            <td className="px-2 py-1">
                                                                <div className="relative inline-flex justify-center items-center w-full">
                                                                    <BtnActionTable
                                                                        togglePopover={togglePopoverWhiteRow}
                                                                        // row_id={item?.id}
                                                                        row_id={item?.id + item?.timestamp}
                                                                        disable={!userPermission?.f_view && !userPermission?.f_edit ? true : false}
                                                                    />

                                                                    {openPopoverIdWhiteRow === item?.id + item?.timestamp && (
                                                                        <div
                                                                            ref={popoverRefWhiteRow}
                                                                            className="absolute left-[-8rem] top-[-10px] mt-2 w-36 bg-white border border-gray-300 rounded-lg shadow-lg z-50"
                                                                        >
                                                                            <ul className="py-2">
                                                                                {
                                                                                    userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer"
                                                                                        // onClick={() => { toggleMenu("view", item?.id) }}
                                                                                        onClick={() => {
                                                                                            toggleMenu("view", item?.id, row?.id);
                                                                                        }}
                                                                                    >
                                                                                        <RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} />{`View`}
                                                                                    </li>
                                                                                }
                                                                                {
                                                                                    userPermission?.f_edit && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("edit", item?.id, row?.id) }}><EditOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Edit`}</li>
                                                                                }
                                                                                {
                                                                                    userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("history", item?.id, row?.id) }}><RestoreOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`History`}</li>
                                                                                }
                                                                            </ul>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        )}

                                                    </tr>
                                                )
                                            })}


                                        {/* ---- yel */}

                                        <tr
                                            key={'total-main-' + key + row?.valuesData?.timestamp}
                                            className={`${table_row_style} !bg-[#FFEAA033] cursor-pointer`}
                                        >

                                            {columnVisibility?.publicate && (
                                                <td className="px-2 py-1 text-[#464255] bg-[#FFEAA033]"></td>
                                            )}

                                            {columnVisibility?.timestamp && (
                                                <td className="px-2 py-1 font-semibold text-[#464255] bg-[#FFEAA033]">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {/* {row?.valuesData ? row?.valuesData?.timestamp : ''} */}
                                                        {`TOTAL`}
                                                    </div>
                                                </td>
                                            )}

                                            {columnVisibility?.hourly && (
                                                <td className="px-2 py-1 font-semibold text-[#464255] bg-[#FFEAA033]">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {row?.valuesData ? row?.valuesData?.gas_hour : ''}
                                                    </div>
                                                </td>
                                            )}

                                            {columnVisibility?.shipper_name && (
                                                <td className="px-2 py-1 font-semibold text-[#464255] bg-[#FFEAA033]">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {/* {row?.valuesData ? row?.valuesData?.shipperName : ''} */}
                                                        {'Total Shipper'}
                                                    </div>
                                                </td>
                                            )}

                                            {columnVisibility?.zone && (
                                                <td className="px-2 py-1  text-[#464255] bg-[#FFEAA033]">
                                                    <div className="w-full flex justify-center items-center px-[20px]">
                                                        <div className="flex w-[120px] justify-center rounded-full px-1 py-2 text-[#464255]" style={{ backgroundColor: row?.valuesData?.zoneObj?.color }}>
                                                            {`${row?.valuesData?.zoneObj?.name ? row?.valuesData?.zoneObj?.name : ''}`}
                                                        </div>
                                                    </div>
                                                </td>
                                            )}

                                            {columnVisibility?.acc_imbalance && (
                                                <td className="px-2 py-1 font-semibold text-right text-[#06522E] bg-[#FFEAA033]">
                                                    {/* {row?.valuesData?.accImb_or_accImbInv !== null && row?.valuesData?.accImb_or_accImbInv !== undefined ? formatNumberFourDecimalNom(row?.valuesData?.accImb_or_accImbInv) : ''} */}
                                                    {formatNumberFourDecimalNomRound(row?.shipperData?.reduce(
                                                        (accumulator:any, currentValue:any) => accumulator + Number(currentValue?.accImb_or_accImbInv),
                                                        0,
                                                        ))}
                                                    {/* https://app.clickup.com/t/9018502823/86eujrgrv */}
                                                </td>
                                            )}

                                            {columnVisibility?.acc_margin && (
                                                <td className="px-2 py-1 font-semibold text-right text-[#06522E] bg-[#FFEAA033]">
                                                    {/* {formatNumberFourDecimalNom(row?.valuesData?.accMargin)} */}
                                                    {formatNumberFourDecimalNomRound(row?.shipperData?.reduce(
                                                        (accumulator:any, currentValue:any) => accumulator + Number(currentValue?.accMargin),
                                                        0,
                                                        ))}
                                                </td>
                                            )}

                                            {columnVisibility?.flow_type && (
                                                <td className="px-2 py-1 font-semibold text-right text-[#06522E] bg-[#FFEAA033]"></td>
                                            )}

                                            {columnVisibility?.energy_adjustment_mmbtu && (
                                                <td className="px-2 py-1 font-semibold text-right text-[#06522E] bg-[#FFEAA033]">
                                                    {/* {formatNumberFourDecimalNom(row?.valuesData?.energyAdjust)} */}
                                                    {formatNumberFourDecimalNomRound(row?.shipperData?.reduce(
                                                        (accumulator:any, currentValue:any) => accumulator + Number(currentValue?.energyAdjust),
                                                        0,
                                                        ))}
                                                </td>
                                            )}

                                            {columnVisibility?.energy_flow_rate_adjustment_mmbtuh && (
                                                <td className="px-2 py-1 font-semibold text-right text-[#06522E] bg-[#FFEAA033]">
                                                    {/* {formatNumberFourDecimalNom(row?.valuesData?.energyAdjustRate_mmbtuh)} */}
                                                    {formatNumberFourDecimalNomRound(row?.shipperData?.reduce(
                                                        (accumulator:any, currentValue:any) => accumulator + Number(currentValue?.energyAdjustRate_mmbtuh),
                                                        0,
                                                        ))}
                                                </td>
                                            )}

                                            {columnVisibility?.energy_flow_rate_adjustment_mmbtud && (
                                                <td className="px-2 py-1 font-semibold text-right text-[#06522E] bg-[#FFEAA033]">
                                                    {/* {formatNumberFourDecimalNom(row?.valuesData?.energyAdjustRate_mmbtud)} */}
                                                    {formatNumberFourDecimalNomRound(row?.shipperData?.reduce(
                                                        (accumulator:any, currentValue:any) => accumulator + Number(currentValue?.energyAdjustRate_mmbtud),
                                                        0,
                                                        ))}
                                                </td>
                                            )}

                                            {columnVisibility?.volume_adjustment_mmbtu && (
                                                <td className="px-2 py-1 font-semibold text-right text-[#06522E] bg-[#FFEAA033]">
                                                    {/* {formatNumberFourDecimalNom(row?.valuesData?.volumeAdjust)} */}
                                                    {formatNumberSixDecimalNomRound(row?.shipperData?.reduce(
                                                        (accumulator:any, currentValue:any) => accumulator + Number(currentValue?.volumeAdjust),
                                                        0,
                                                        ))}
                                                </td>
                                            )}

                                            {columnVisibility?.volume_flow_rate_adjustment_mmscfh && (
                                                <td className="px-2 py-1 font-semibold text-right text-[#06522E] bg-[#FFEAA033]">
                                                    {/* {formatNumberSixDecimalNom(row?.valuesData?.volumeAdjustRate_mmscfh)} */}
                                                    {formatNumberSixDecimalNomRound(row?.shipperData?.reduce(
                                                        (accumulator:any, currentValue:any) => accumulator + Number(currentValue?.volumeAdjustRate_mmscfh),
                                                        0,
                                                        ))}
                                                </td>
                                            )}

                                            {columnVisibility?.volume_flow_rate_adjustment_mmscfd && (
                                                <td className="px-2 py-1 font-semibold text-right text-[#06522E] bg-[#FFEAA033]">
                                                    {/* {formatNumberSixDecimalNom(row?.valuesData?.volumeAdjustRate_mmscfd)} */}
                                                    {formatNumberSixDecimalNomRound(row?.shipperData?.reduce(
                                                        (accumulator:any, currentValue:any) => accumulator + Number(currentValue?.volumeAdjustRate_mmscfd),
                                                        0,
                                                        ))}
                                                </td>
                                            )}

                                            {columnVisibility?.resolvedTime_hr && (
                                                <td className="px-2 py-1 font-semibold text-right text-[#06522E] bg-[#FFEAA033]">
                                                    {row?.valuesData?.resolveHour ? row?.valuesData?.resolveHour : ''}
                                                </td>
                                            )}

                                            {columnVisibility?.hv_btu_scf && (
                                                <td className="px-2 py-1 font-semibold text-right text-[#06522E] bg-[#FFEAA033]">
                                                    {""}
                                                    {/* {row?.valuesData?.heatingValue !== null && row?.valuesData?.heatingValue !== undefined ? formatNumberFourDecimalNomRound(row?.valuesData?.heatingValue) : ''} */}
                                                </td>
                                            )}

                                            {columnVisibility?.file && (
                                                <td className="px-2 py-1 font-semibold text-right text-[#06522E] bg-[#FFEAA033]">
                                                </td>
                                            )}

                                            {columnVisibility?.comment && (
                                                <td className="px-2 py-1 font-semibold text-right text-[#06522E] bg-[#FFEAA033]">
                                                </td>
                                            )}

                                            {columnVisibility?.action && (userDT?.account_manage?.[0]?.user_type_id !== 3 && userDT?.account_manage?.[0]?.user_type_id !== 4) && (
                                                <td className="px-2 py-1 text-[#464255]" ></td>
                                            )}
                                        </tr>

                                        {/* ---- */}

                                    </>
                                )
                            })}

                        </tbody>
                    </table>
                    :
                    <TableSkeleton />
            }

            {
                isLoading && sortedData?.length <= 0 && <NodataTable />
            }
        </div>

        {/* Confirm Save */}
        <ModalComponent
            open={modaConfirmSave}
            isLoading={isLoadingGen}
            handleClose={(e: any) => {
                setIsLoadingGen(true);
                // setModaConfirmSave(false);

                if (e == "submit") {
                    setIsLoading(true);

                    setTimeout(async () => {
                        // await onSubmit(dataSubmit);

                        switch (typeGenerate.toLowerCase()) {
                            case 'dd':
                                // doc39and4
                                handlePostGenEvent(dataSubmit, 39)
                                break;
                            case 'difficult day':
                                // doc39and4
                                handlePostGenEvent(dataSubmit, 39)
                                break;
                            case 'difficult day flow':
                                // doc39and4
                                handlePostGenEvent(dataSubmit, 39)
                                break;

                            case 'ofo':
                                //doc7
                                handlePostGenEvent(dataSubmit, 7)
                                break;
                            case 'operation flow':
                            case 'operation flow order':
                                //doc7
                                handlePostGenEvent(dataSubmit, 7)
                                break;
                            case 'if':
                                //doc7
                                handlePostGenEvent(dataSubmit, 7)
                                break;
                            case 'instructed flow':
                                //doc7
                                handlePostGenEvent(dataSubmit, 7)
                                break;
                        }
                    }, 100);

                } else {
                    setSelectedEvent(undefined);
                    setEventList(undefined);
                    setIsLoadingGen(false);
                    setModaConfirmSave(false);
                }
                // setModalSuccessOpen(true);
                // if (resetForm) resetForm();
            }}
            title={`Confirm Create Document ${docGenerate}`}
            description={
                <div>
                    <div className="text-center">
                        {`To proceed, click 'Yes'.`}
                    </div>
                    <br/>
                    {
                        (!eventList || eventList?.length > 0) &&
                        <div className="text-center">
                            {`Or Select Event code to update existing document.`}
                        </div>
                    }
                    {
                        eventList ? 
                        eventList.length > 0 ?
                        <InputSearch
                            id="selectedEvent"
                            label=""
                            placeholder="Select Event Code"
                            type="select"
                            value={selectedEvent}
                            onChange={(e) => setSelectedEvent(e.target.value)}
                            isDisabled={(userDT?.account_manage?.[0]?.user_type_id == 3 || userDT?.account_manage?.[0]?.user_type_id == 4) ? true : false}
                            options={
                                (Array.isArray(eventList) ? eventList : [])
                                .map((item: any) => ({
                                    value: item.id,
                                    label: item.event_nember,
                                }))
                            }
                        />
                        :
                        <></>
                        :
                        <Spinicon />
                    }
                </div>
            }
            // menuMode="daily-adjust"
            btnmode="split"
            btnsplit1="Yes"
            btnsplit2="No"
            stat="confirm"
        />

        <ModalComponent
            open={isModalErrorOpen}
            handleClose={() => {
                setModalErrorOpen(false);
                // if (resetForm) resetForm();
            }}
            title="Failed"
            description={
                <div>
                    <div className="text-center">
                        {`${modalErrorMsg}`}
                    </div>
                </div>
            }
            stat="error"
        />

        <ModalComponent
            open={isModalSuccessOpen}
            handleClose={handleCloseModal}
            title="Success"
            // description="Your changes have been saved."
            description={modalSuccessMsg}
        />
    </>
    )
}

export default TableBalOperateAndInstructFlow;