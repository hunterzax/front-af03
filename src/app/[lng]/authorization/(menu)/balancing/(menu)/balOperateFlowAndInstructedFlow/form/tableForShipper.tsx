import { useEffect, useRef } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatNumberFourDecimal, formatNumberSixDecimalNom, formatNumberThreeDecimal, iconButtonClass, mapShipperData } from '@/utils/generalFormatter';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import BtnActionTable from "@/components/other/btnActionInTable";
import { handleSort } from "@/utils/sortTable";
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import { postService } from "@/utils/postService";
import NodataTable from "@/components/other/nodataTable";
import ModalComponent from "@/components/other/ResponseModal";

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

const TableBalOperateAndInstructFlowShipper: React.FC<TableProps> = ({ openEditForm, openViewForm, tableData, isLoading, columnVisibility, userPermission, selectedItem, setselectedItem, openHistoryForm, openReasonModal, openAllFileModal, userDT, closeBalanceData, dataShipperGroup, setCheckPublic }) => {

    const [tk, settk] = useState<boolean>(true);
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState<any>([]);
    const [toggleData, settoggleData] = useState<any>();
    const [original_tableData, setoriginal_tableData] = useState([])

    {/* Confirm Save */ }
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()

    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const handleCloseModal = () => setModalSuccessOpen(false);
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);
    const [modalSuccessMsg, setModalSuccessMsg] = useState('Document has been created.');

    useEffect(() => {
        if (tableData && tableData.length > 0 && toggleData == undefined) { // for first comming
            const combinedShipperData = tableData?.flatMap((item: any) => item?.shipperData);
            setSortedData(combinedShipperData);
            setoriginal_tableData(combinedShipperData);
        } else { // for toggle and reset
            setSortedData([]);
        }

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

        switch (type.toLowerCase()) {
            case 'dd':
                // doc39and4
                setDocGenerate('3.9 And 4')
                break;
            case 'difficult day':
                // doc39and4
                setDocGenerate('3.9 And 4')
                break;
            case 'ofo':
                //doc7
                setDocGenerate('7')
                break;
            case 'operation flow':
                //doc7
                setDocGenerate('7')
                break;
            case 'if':
                //doc7
                setDocGenerate('7')
                break;
            case 'instructed flow':
                //doc7
                setDocGenerate('7')
                break;
        }

        setTypeGenerate(type)

        let data_post_real = {
            "gas_day": row_data?.gas_day,
            "gas_hour": row_data?.valuesData?.gas_hour,
            "zone": row_data?.zone,
            "level": row_data?.level, // flow type | DD = DIFFICULT DAY FLOW
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

    const handlePostGenEvent = async (data_post?: any, doc_no?: any) => {
        switch (doc_no) {
            case 39:
                // gen 39 and 4
                const res_gen_doc_39_4 = await postService(`/master/event/emer/generatedoc39and4`, data_post);
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
                const res_gen_doc_7 = await postService(`/master/event/ofo/generatedoc7`, data_post);
                // const status_2 = res_gen_doc_7?.response?.data?.status ?? res_gen_doc_7?.response?.data?.statusCode;
                const status_2 = res_gen_doc_7?.response?.data?.statusCode ?? res_gen_doc_7?.response?.data?.status ?? res_gen_doc_7?.status ?? res_gen_doc_7?.statusCode ?? res_gen_doc_7?.code;
                const errorMsg2 = res_gen_doc_7?.response?.data?.error ?? res_gen_doc_7?.data?.error ?? res_gen_doc_7?.response?.error ?? res_gen_doc_7?.error;

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
    }

    {/* Confirm Save */ }
    const handleSaveConfirm = async (data?: any, type?: any) => {

        setDataSubmit(data)
        setModaConfirmSave(true)
    }

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
                                    <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-center`} onClick={() => handleSort("timestamp", sortState, setSortState, setSortedData, original_tableData)}>
                                        {`Timestamp`}
                                        {getArrowIcon("timestamp")}
                                    </th>
                                )}

                                {columnVisibility?.hourly && (
                                    <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-center`} onClick={() => handleSort("gas_hour", sortState, setSortState, setSortedData, original_tableData)}>
                                        {`Hourly`}
                                        {getArrowIcon("gas_hour")}
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
                                    <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-center`} onClick={() => handleSort("zone", sortState, setSortState, setSortedData, original_tableData)}>
                                        {`Zone`}
                                        {getArrowIcon("zone")}
                                    </th>
                                )}

                                {columnVisibility?.acc_imbalance && (
                                    <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-left`} onClick={() => handleSort("accImb_or_accImbInv", sortState, setSortState, setSortedData, original_tableData)}>
                                        <div>{`Acc. Imbalance / Acc. Imbalance `}</div>
                                        <div>{`Inventory (MMBTU)`}</div>
                                        {getArrowIcon("accImb_or_accImbInv")}
                                    </th>
                                )}

                                {columnVisibility?.acc_margin && (
                                    <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-center`} onClick={() => handleSort("accMargin", sortState, setSortState, setSortedData, original_tableData)}>
                                        {`Acc.Margin (MMBTU)`}
                                        {getArrowIcon("accMargin")}
                                    </th>
                                )}

                                {columnVisibility?.flow_type && (
                                    <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-center`} onClick={() => handleSort("flow_type", sortState, setSortState, setSortedData, original_tableData)}>
                                        {`Flow Type`}
                                        {getArrowIcon("flow_type")}
                                    </th>
                                )}

                                {columnVisibility?.energy_adjustment_mmbtu && (
                                    <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-center`} onClick={() => handleSort("energyAdjust", sortState, setSortState, setSortedData, original_tableData)}>
                                        {`Energy Adjustment (MMBTU)`}
                                        {getArrowIcon("energyAdjust")}
                                    </th>
                                )}

                                {columnVisibility?.energy_flow_rate_adjustment_mmbtuh && (
                                    <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-left`} onClick={() => handleSort("energyAdjustRate_mmbtuh", sortState, setSortState, setSortedData, original_tableData)}>
                                        <div>{`Energy Flow Rate`}</div>
                                        <div>{`Adjustment (MMBTU/H)`}</div>
                                        {getArrowIcon("energyAdjustRate_mmbtuh")}
                                    </th>
                                )}

                                {columnVisibility?.energy_flow_rate_adjustment_mmbtud && (
                                    <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-left`} onClick={() => handleSort("energyAdjustRate_mmbtud", sortState, setSortState, setSortedData, original_tableData)}>
                                        <div>{`Energy Flow Rate`}</div>
                                        <div>{`Adjustment (MMBTU/D)`}</div>
                                        {getArrowIcon("energyAdjustRate_mmbtud")}
                                    </th>
                                )}

                                {columnVisibility?.volume_adjustment_mmbtu && (
                                    <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-center`} onClick={() => handleSort("volumeAdjust", sortState, setSortState, setSortedData, original_tableData)}>
                                        {`Volume Adjustment (MMBTU)`}
                                        {getArrowIcon("volumeAdjust")}
                                    </th>
                                )}

                                {columnVisibility?.volume_flow_rate_adjustment_mmscfh && (
                                    <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-left`} onClick={() => handleSort("volumeAdjustRate_mmscfh", sortState, setSortState, setSortedData, original_tableData)}>
                                        <div>{`Volume Flow Rate`}</div>
                                        <div>{`Adjustment (MMSCF/H)`}</div>
                                        {getArrowIcon("volumeAdjustRate_mmscfh")}
                                    </th>
                                )}

                                {columnVisibility?.volume_flow_rate_adjustment_mmscfd && (
                                    <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-left`} onClick={() => handleSort("volumeAdjustRate_mmscfd", sortState, setSortState, setSortedData, original_tableData)}>
                                        <div>{`Volume Flow Rate`}</div>
                                        <div>{`Adjustment (MMSCFD)`}</div>
                                        {getArrowIcon("volumeAdjustRate_mmscfd")}
                                    </th>
                                )}

                                {columnVisibility?.resolvedTime_hr && (
                                    <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-center`} onClick={() => handleSort("resolveHour", sortState, setSortState, setSortedData, original_tableData)}>
                                        {`ResolvedTime (Hr.)`}
                                        {getArrowIcon("resolveHour")}
                                    </th>
                                )}

                                {columnVisibility?.hv_btu_scf && (
                                    <th className={`${table_sort_header_style} bg-[#1473A1] min-w-[80px] text-center`} onClick={() => handleSort("heatingValue", sortState, setSortState, setSortedData, original_tableData)}>
                                        {`HV (BTU/SCF)`}
                                        {getArrowIcon("heatingValue")}
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

                                const find_shipper = dataShipperGroup?.find((itemx: any) => itemx?.id_name == row?.shipperName)
                                // const count_comment_only_shipper = row?.comment?.filter((item:any) => item?.create_by_account?.userType?.id == 3)
                                const count_comment_only_shipper = row?.comment?.filter((item:any) => item?.comment_tap_user_type == 3)

                                return (
                                    <tr
                                        key={'sub-' + key}
                                        className={`${table_row_style}`}
                                    >

                                        {columnVisibility?.timestamp && (
                                            <td className="px-2 py-1  text-[#464255] bg-[#FFFFFF]">
                                                <div className="flex items-center justify-center gap-2">
                                                    {row?.timestamp ? row?.timestamp : ''}
                                                </div>
                                            </td>
                                        )}

                                        {columnVisibility?.hourly && (
                                            <td className="px-2 py-1  text-[#464255] bg-[#FFFFFF]">
                                                <div className="flex items-center justify-center gap-2">
                                                    {row?.gas_hour ? row?.gas_hour : ''}
                                                </div>
                                            </td>
                                        )}

                                        {columnVisibility?.shipper_name && (
                                            <td className="px-2 py-1  text-[#464255] bg-[#FFFFFF]">
                                                <div className="flex items-center justify-center gap-2">
                                                    {/* {item ? row?.shipperName : ''} */}
                                                    {find_shipper ? find_shipper?.name : 'System'}
                                                    {/* https://app.clickup.com/t/9018502823/86eujrgrr */}
                                                </div>
                                            </td>
                                        )}

                                        {columnVisibility?.zone && (
                                            <td className="px-2 py-1  text-[#464255] bg-[#FFFFFF]">
                                                <div className="w-full flex justify-center items-center px-[20px]">
                                                    <div className="flex w-[120px] justify-center rounded-full px-1 py-2 text-[#464255]" style={{ backgroundColor: row?.zoneObj?.color }}>{`${row?.zoneObj?.name ? row?.zoneObj?.name : ''}`}</div>
                                                </div>
                                            </td>
                                        )}

                                        {columnVisibility?.acc_imbalance && (
                                            <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF]">
                                                {row?.accImb_or_accImbInv ? formatNumberFourDecimal(row?.accImb_or_accImbInv) : ''}
                                            </td>
                                        )}

                                        {columnVisibility?.acc_margin && (
                                            <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF]">
                                                {row?.accMargin ? formatNumberFourDecimal(row?.accMargin) : ''}
                                            </td>
                                        )}

                                        {columnVisibility?.flow_type && (
                                            <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF]">
                                                {/* {row?.flow_type ? row?.flow_type : ''} */}
                                            </td>
                                        )}

                                        {columnVisibility?.energy_adjustment_mmbtu && (
                                            <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF]">
                                                {/* {row?.energyAdjustRate_mmbtud ? formatNumberFourDecimal(row?.energyAdjustRate_mmbtud) : ''} */}
                                                {row?.energyAdjust ? formatNumberFourDecimal(row?.energyAdjust) : ''}
                                            </td>
                                        )}

                                        {columnVisibility?.energy_flow_rate_adjustment_mmbtuh && (
                                            <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF]">
                                                {row?.energyAdjustRate_mmbtuh ? formatNumberFourDecimal(row?.energyAdjustRate_mmbtuh) : ''}
                                            </td>
                                        )}

                                        {columnVisibility?.energy_flow_rate_adjustment_mmbtud && (
                                            <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF]">
                                                {row?.energyAdjustRate_mmbtud ? formatNumberFourDecimal(row?.energyAdjustRate_mmbtud) : ''}
                                            </td>
                                        )}

                                        {columnVisibility?.volume_adjustment_mmbtu && (
                                            <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF]">
                                                {row?.volumeAdjust ? formatNumberSixDecimalNom(row?.volumeAdjust) : ''}
                                            </td>
                                        )}

                                        {columnVisibility?.volume_flow_rate_adjustment_mmscfh && (
                                            <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF]">
                                                {/* ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w  */}
                                                {/* {row?.volumeAdjustRate_mmscfh ? formatNumberFourDecimal(row?.volumeAdjustRate_mmscfh) : ''} */}
                                                {row?.volumeAdjustRate_mmscfh ? formatNumberSixDecimalNom(row?.volumeAdjustRate_mmscfh) : ''}
                                            </td>
                                        )}

                                        {columnVisibility?.volume_flow_rate_adjustment_mmscfd && (
                                            <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF]">
                                                {/* ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w  */}
                                                {/* {row?.volumeAdjustRate_mmscfd ? formatNumberFourDecimal(row?.volumeAdjustRate_mmscfd) : ''} */}
                                                {row?.volumeAdjustRate_mmscfd ? formatNumberSixDecimalNom(row?.volumeAdjustRate_mmscfd) : ''}
                                            </td>
                                        )}

                                        {columnVisibility?.resolvedTime_hr && (
                                            <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF]">
                                                {row?.resolveHour ? row?.resolveHour : ''}
                                            </td>
                                        )}

                                        {columnVisibility?.hv_btu_scf && (
                                            <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF]">
                                                {/* {row?.heatingValue ? formatNumberThreeDecimal(row?.heatingValue) : ''} */}
                                                {row?.heatingValue !== null && row?.heatingValue !== undefined ? formatNumberThreeDecimal(row?.heatingValue) : ''}
                                            </td>
                                        )}

                                        {/* 
                                {columnVisibility?.file && (
                                    <td className="px-2 py-1 text-[#464255]">
                                        {row?.file ? <><InsertDriveFileOutlinedIcon sx={{ fontSize: '20px' }} /> {row?.file}</> : ''}
                                    </td>
                                )} */}

                                        {columnVisibility.file && (
                                            <td className="px-2 py-1 text-center">
                                                <div className="inline-flex items-center justify-center relative">
                                                    {/* <button
                                                        type="button"
                                                        className="flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                                                        onClick={() => openAllFileModal(row?.id, row?.id, row)}
                                                        // disabled={!userPermission?.f_view || row?.file_capacity_request_management.length <= 0}
                                                        disabled={!userPermission?.f_view}
                                                    >
                                                        <AttachFileRoundedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                                                    </button> */}
                                                    <button
                                                        type="button"
                                                        aria-label="Open files"
                                                        onClick={() => openAllFileModal(row?.id, row?.id, row)}
                                                        disabled={!userPermission?.f_view}
                                                        className={iconButtonClass}
                                                    >
                                                        <AttachFileRoundedIcon
                                                            fontSize="inherit"
                                                            className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                                            sx={{ color: 'currentColor', fontSize: 18 }}
                                                        />
                                                    </button>
                                                    <span className="px-2 text-[#464255]">
                                                        {row?.file?.length}
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
                                                        onClick={() => openReasonModal(row?.id, row?.comment, row)}
                                                    >
                                                        <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                                                    </button> */}

                                                    <button
                                                        type="button"
                                                        className={iconButtonClass}
                                                        onClick={() => openReasonModal(row?.id, row?.comment, row)}
                                                    >
                                                        <ChatBubbleOutlineOutlinedIcon
                                                            fontSize="inherit"
                                                            className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                                            sx={{ color: 'currentColor', fontSize: 18 }}
                                                        />
                                                    </button>

                                                    <span className="px-2 text-[#464255]">
                                                        {/* {row?.comment ? row?.comment?.length : null} */}
                                                        {count_comment_only_shipper?.length > 0 ? count_comment_only_shipper?.length : 0}
                                                    </span>
                                                </div>
                                            </td>
                                        )}

                                        {columnVisibility.action && userDT?.account_manage?.[0]?.user_type_id !== 3 && (
                                            <td className="px-2 py-1">
                                                <div className="relative inline-flex justify-center items-center w-full">
                                                    <BtnActionTable
                                                        togglePopover={togglePopoverWhiteRow}
                                                        // row_id={row?.id}
                                                        row_id={row?.id + row?.timestamp}
                                                        disable={!userPermission?.f_view && !userPermission?.f_edit ? true : false}
                                                    />

                                                    {openPopoverIdWhiteRow === row?.id + row?.timestamp && (
                                                        <div
                                                            ref={popoverRefWhiteRow}
                                                            className="absolute left-[-8rem] top-[-10px] mt-2 w-36 bg-white border border-gray-300 rounded-lg shadow-lg z-50"
                                                        >
                                                            <ul className="py-2">
                                                                {
                                                                    userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer"
                                                                        // onClick={() => { toggleMenu("view", row?.id) }}
                                                                        onClick={() => {
                                                                            toggleMenu("view", row?.id, row?.id);
                                                                        }}
                                                                    >
                                                                        <RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} />{`View`}
                                                                    </li>
                                                                }
                                                                {
                                                                    userPermission?.f_edit && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("edit", row?.id, row?.id) }}><EditOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Edit`}</li>
                                                                }
                                                                {
                                                                    userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("history", row?.id, row?.id) }}><RestoreOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`History`}</li>
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

                        </tbody>
                    </table>
                    :
                    <TableSkeleton />
            }


            {
                isLoading && sortedData?.length <= 0 && <NodataTable />
            }
        </div>


        <ModalComponent
            open={modaConfirmSave}
            handleClose={(e: any) => {
                setModaConfirmSave(false);
                if (e == "submit") {
                    // setIsLoading(true);
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
                            case 'ofo':
                                //doc7
                                handlePostGenEvent(dataSubmit, 7)
                                break;
                            case 'operation flow':
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

export default TableBalOperateAndInstructFlowShipper;