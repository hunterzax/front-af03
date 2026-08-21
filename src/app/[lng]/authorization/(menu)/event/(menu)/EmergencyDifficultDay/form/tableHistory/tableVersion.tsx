import { useEffect } from "react";
import React, { FC, useState } from 'react';
import { formatDate, formatDateNoTime, formatNumber, formatNumberFourDecimal, formatNumberThreeDecimal, handleDownloadPDFTsoView, underDevelopment } from '@/utils/generalFormatter';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import NodataTable from "@/components/other/nodataTable";
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { getService } from "@/utils/postService";
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';


interface TableProps {
    tableData: any;
    dataTableHeader?: any;
    WhichOpenDocument?: any; // เปิดเอกสารเบอร์ไหน -> 'document_1', 'document_2', 'document_3'
    modeOpenDocument?: any; // mode -> 'view', 'edit'
    isLoading?: any;
    columnVisibility?: any;

    setWhichDocumentOpen?: any; // เปิดเอกสารเบอร์ไหน -> 'document_1', 'document_2', 'document_3'
    setModeOpenDocument?: any; // mode -> 'view', 'edit'
    setIsOpenDocument?: any; // เปิด-ปิดหน้าดูข้อมูล doc
    setDataOpenDocument?: any;
    setIsOpenHistory?: any; // เปิด-ปิดหน้าตาราง history

    userDT?: any;
}

const class_btn_ = `flex items-center justify-center px-[2px] py-[2px] border border-[#EAECF0] rounded-md hover:bg-[#DFE4EA] hover:border hover:border-[#DFE4EA] relative `

const TableVersion: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility, dataTableHeader, WhichOpenDocument, modeOpenDocument, setWhichDocumentOpen, setModeOpenDocument, setIsOpenDocument, setDataOpenDocument, setIsOpenHistory, userDT }) => {

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);
    const [mainData, setMainData] = useState(tableData);
    const [documentNoText, setDocumentNoText] = useState('');

    useEffect(() => {

        switch (WhichOpenDocument) {
            case 'document_4':
                let text_header: any = ''
                if (modeOpenDocument == 'version_edit') {
                    text_header = 'แก้ไขเอกสารคำสั่งปรับปริมาณก๊าซจากเหตุการณ์ฉุกเฉิน/เหตุการณ์ความไม่สมดุลอย่างรุนแรง (Emergency Doc.2)'
                } else if (modeOpenDocument == 'history') {
                    text_header = 'ประวัติเอกสารคำสั่งปรับปริมาณก๊าซจากเหตุการณ์ฉุกเฉิน/เหตุการณ์ความไม่สมดุลอย่างรุนแรง (Emergency Doc.2)'
                } else if (modeOpenDocument == 'view') {
                    text_header = 'ดูข้อมูลเอกสารคำสั่งปรับปริมาณก๊าซจากเหตุการณ์ฉุกเฉิน/เหตุการณ์ความไม่สมดุลอย่างรุนแรง (Emergency Doc.2)'
                }
                setDocumentNoText(text_header)
                break;
        }

        if (tableData && tableData.length > 0) {
            setSortedData(tableData)
            setMainData(tableData)
        } else {
            setSortedData([]);
            setMainData([]);
        }
        // setSortedData(tableData);
    }, [tableData]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    // ############### OPEN DOCUMENT ###############
    const getDataDocument = async (id: String, doc_no: any) => {
        try {
            // master/event/emer/doc4/version/doc/49
            const res_document_data = await getService(`/master/event/emer/doc${doc_no}/version/doc/${id}`)
            return res_document_data
        } catch (error) {
            // error fetch doc 2
        }
    }

    const openDocument = async (document: String, mode?: String, data?: any) => {
        if (document == 'document_4') {
            // const data_doc_4 = await getDataDocument(data.id, 4) // old
            const data_doc_4 = await getDataDocument(data.id, 41) // new 
            setDataOpenDocument(data_doc_4)
        }

        setIsOpenDocument(true)
        setIsOpenHistory(false) // ปิดหน้าตาราง history

        setWhichDocumentOpen(document)
        setModeOpenDocument(mode)
    }

    return (<>
        {/* <div className="text-[22px] text-[#58585A] font-semibold">{`History Event Code : ${dataTableHeader?.event_number ? dataTableHeader?.event_number : ''}`}</div> */}
        {/* <div className="text-[20px] text-[#58585A] pb-4 font-semibold">{documentNoText}</div> */}

        <div className={`h-[calc(100vh-440px)] overflow-y-auto block rounded-t-md relative z-1 `}>
            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                    <tr className="h-9">

                        <th scope="col"
                            className={`${table_sort_header_style} w-[120px] text-center`}
                            onClick={() => handleSort("version_text", sortState, setSortState, setSortedData, tableData)}
                        >
                            {`Version`}
                            {getArrowIcon("version_text")}
                        </th>

                        <th scope="col"
                            className={`${table_sort_header_style} w-[300px] text-center`}
                            onClick={() => handleSort("create_date", sortState, setSortState, setSortedData, tableData)}
                        >
                            {`Action Date`}
                            {getArrowIcon("create_date")}
                        </th>

                        <th scope="col"
                            className={`${table_sort_header_style} `}
                            onClick={() => handleSort("create_by_account.first_name", sortState, setSortState, setSortedData, tableData)}
                        >
                            {`Edited By`}
                            {getArrowIcon("create_by_account.first_name")}
                        </th>

                        {/* shipper เห็น column acknowledge */}
                        {
                            (userDT?.account_manage?.[0]?.user_type_id == 3 || userDT?.account_manage?.[0]?.user_type_id == 4) &&
                            <th scope="col" className={`${table_header_style} w-[120px] text-center`} >
                                {`Acknowledge`}
                            </th>
                        }

                        <th scope="col" className={`${table_header_style} w-[120px] text-center`} >
                            {`Info`}
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {sortedData && sortedData.map((row: any, index: any) => {
                        return (
                            <tr key={row?.id} className={`${table_row_style}`}>
                                <td className="px-4 py-1 text-[#464255] text-center">{row?.version_text ? row?.version_text : ''}</td>
                                <td className="px-4 py-1 text-[#464255] text-center">{row?.create_date ? formatDate(row?.create_date) : ''}</td>
                                <td className="px-4 py-1 text-[#464255]">
                                    <div>
                                        <span className="text-[#464255]">{row?.create_by_account?.first_name} {row?.create_by_account?.last_name}</span>
                                        {/* <div className="text-gray-500 text-xs">{row?.row?.create_date ? formatDate(row?.row?.create_date) : ''}</div> */}
                                    </div>
                                </td>

                                {/* shipper เห็น column acknowledge */}
                                {
                                    (userDT?.account_manage?.[0]?.user_type_id == 3 || userDT?.account_manage?.[0]?.user_type_id == 4) &&
                                    <td className="px-4 py-1 text-center">
                                        {row?.event_doc_status_id == 5 && <DoneOutlinedIcon sx={{ fontSize: 20, color: '#1473A1' }} />}
                                    </td>
                                }

                                <td className="px-4 py-1 text-center">
                                    <div
                                        className="mx-auto flex w-[120px] justify-center rounded-full px-1 py-2 text-[#464255]"
                                    >

                                        {
                                            modeOpenDocument !== 'history' ?
                                                (userDT?.account_manage?.[0]?.user_type_id == 3 || userDT?.account_manage?.[0]?.user_type_id == 4) ? // SHIPPER
                                                    ((userDT?.account_manage?.[0]?.user_type_id == 3 || userDT?.account_manage?.[0]?.user_type_id == 4) && row?.event_doc_status_id == 5) || modeOpenDocument == 'view' ?

                                                        <button type="button"
                                                            className={class_btn_}
                                                            disabled={false}
                                                            // onClick={() => underDevelopment()}
                                                            onClick={() => openDocument('document_4', 'view', row)}
                                                        >
                                                            <RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, color: '#1473A1' }} />
                                                        </button>
                                                        :
                                                        <button
                                                            type="button"
                                                            className={class_btn_}
                                                            onClick={() => openDocument('document_4', 'edit', row)}
                                                        >
                                                            <EditOutlinedIcon sx={{ fontSize: 20, color: '#1473A1' }} />
                                                        </button>

                                                    : // TSO
                                                    modeOpenDocument == 'version_edit' && index == 0 ? // edit ได้แค่รายการแรก version ล่าสุด
                                                        <button
                                                            type="button"
                                                            className={class_btn_}
                                                            onClick={() => openDocument('document_4', 'edit', row)}
                                                        >
                                                            <EditOutlinedIcon sx={{ fontSize: 20, color: '#1473A1' }} />
                                                        </button>
                                                        :
                                                        <button
                                                            type="button"
                                                            className={class_btn_}
                                                            onClick={() => openDocument('document_4', 'view', row)}
                                                        >
                                                            <RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, color: '#1473A1' }} />
                                                        </button>

                                                :
                                                <button type="button"
                                                    className={class_btn_}
                                                    disabled={false}
                                                    onClick={() => openDocument('document_4', 'view', row)}
                                                >
                                                    <RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, color: '#1473A1' }} />
                                                </button>
                                        }






                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            {
                sortedData?.length == 0 && <NodataTable />
            }
        </div>
    </>

    )
}

export default TableVersion;