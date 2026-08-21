import { useEffect } from "react";
import React, { FC, useState } from 'react';
import { formatDate, sortByIdDesc } from '@/utils/generalFormatter';
import { table_header_style, table_row_style } from "@/utils/styles";
import NodataTable from "@/components/other/nodataTable";
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import { getService } from "@/utils/postService";

interface TableProps {
    tableData: any;
    dataTableHeader?: any;
    WhichOpenDocument?: any;

    modeOpenDocument?: any; // mode -> 'view', 'edit'

    setWhichDocumentOpen?: any; // เปิดเอกสารเบอร์ไหน -> 'document_1', 'document_2', 'document_3'
    setModeOpenDocument?: any; // mode -> 'view', 'edit'
    setIsOpenDocument?: any; // เปิด-ปิดหน้าดูข้อมูล doc
    setDataOpenDocument?: any;
    setIsOpenHistory?: any; // เปิด-ปิดหน้าตาราง history

    isLoading?: any;
    columnVisibility?: any;

}

const class_btn_ = `flex items-center justify-center px-[2px] py-[2px] border border-[#EAECF0] rounded-md hover:bg-[#DFE4EA] hover:border hover:border-[#DFE4EA] relative `

const TableHistoryDocument1: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility, dataTableHeader, WhichOpenDocument, setWhichDocumentOpen, setModeOpenDocument, setIsOpenDocument, setDataOpenDocument, setIsOpenHistory }) => {

    // const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);
    const [mainData, setMainData] = useState(tableData);

    useEffect(() => {
        if (tableData && tableData.length > 0) {
            // setSortedData(tableData)
            // setMainData(tableData)
            setSortedData(sortByIdDesc(tableData)) // เรียง id มากไปน้อย
            setMainData(sortByIdDesc(tableData)) // เรียง id มากไปน้อย
        } else {
            setSortedData([]);
            setMainData([]);
        }
        // setSortedData(tableData);
    }, [tableData]);

    // const getArrowIcon = (column: string) => {
    //     return <div className={`${table_col_arrow_sort_style}`}>
    //         <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
    //         <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
    //     </div>
    // };

    // ############### OPEN DOCUMENT ###############
    const getDataDocument = async (id: String, doc_no: any) => {
        try {
            const res_document_data = await getService(`/master/event/emer/doc${doc_no}/${id}`)
            return res_document_data
        } catch (error) {
            // error fetch doc
        }
    }

    const openDocument = async (document: String, mode?: String, data?: any) => {
        setWhichDocumentOpen(document)
        setModeOpenDocument(mode)

        if (document == 'document_8') {
            const data_doc_8 = await getDataDocument(data.id, 8)
            const newDataDoc8 = {
                ...data_doc_8,
                history_table_inside: data?.event_document_emer?.length > 0 ? data?.event_document_emer?.filter((item:any) => (item?.user_type_id !== 2 && item?.user_type_id !== 1)) : [],
            };
            setDataOpenDocument(newDataDoc8)
        } else if (document == 'document_5') {
            const data_doc_5 = await getDataDocument(data.id, 5)
            const newDataDoc5 = {
                ...data_doc_5,
                history_table_inside: data?.event_document_emer?.length > 0 ? data?.event_document_emer?.filter((item:any) => (item?.user_type_id !== 2 && item?.user_type_id !== 1)) : [],
            };
            setDataOpenDocument(newDataDoc5)
        } else if (document == 'document_39') {
            const data_doc_39 = await getDataDocument(data.id, 39)
            const newDataDoc39 = {
                ...data_doc_39,
                history_table_inside: data?.event_document_emer?.length > 0 ? data?.event_document_emer?.filter((item:any) => (item?.user_type_id !== 2 && item?.user_type_id !== 1)) : [],
            };
            setDataOpenDocument(newDataDoc39)
        } else if (document == 'document_6') {
            const data_doc_6 = await getDataDocument(data.id, 6)
            const newDataDoc6 = {
                ...data_doc_6,
                history_table_inside: data?.event_document_emer?.length > 0 ? data?.event_document_emer?.filter((item:any) => (item?.user_type_id !== 2 && item?.user_type_id !== 1)) : [],
            };
            setDataOpenDocument(newDataDoc6)
        }

        setIsOpenDocument(true)
        setIsOpenHistory(false) // ปิดหน้าตาราง history
    }


    return (<>
        {/* <div className="text-[22px] text-[#58585A] font-semibold">{`History Event Code : ${dataTableHeader?.event_number ? dataTableHeader?.event_number : ''}`}</div>
        <div className="text-[16px] text-[#58585A] font-semibold">{documentNoText}</div> */}

        <div className={`h-[calc(100vh-400px)] overflow-y-auto block  rounded-t-md relative z-1`}>
            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                    <tr className="h-9">
                        <th scope="col" className={`${table_header_style}`} >
                            {`Action Date`}
                        </th>

                        <th scope="col" className={`${table_header_style}`} >
                            {`Edited By`}
                        </th>

                        <th scope="col" className={`${table_header_style} text-center`} >
                            {`Detail`}
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {sortedData && sortedData.map((row: any, index: any) => {
                        return (
                            <tr key={row?.id} className={`${table_row_style}`}>
                                <td className="px-4 py-1 text-[#464255] ">{row?.create_date ? formatDate(row?.create_date) : ''}</td>
                                <td className="px-2 py-1 text-[#464255]">
                                    <div>
                                        <span className="text-[#464255]">{row?.create_by_account?.first_name} {row?.create_by_account?.last_name}</span>
                                        {/* เดิมโรงงาน */}
                                        {/* <span className="text-[#464255]">{row?.row?.create_by_account?.first_name} {row?.row?.create_by_account?.last_name}</span> */} 
                                        {/* <div className="text-gray-500 text-xs">{row?.row?.create_date ? formatDate(row?.row?.create_date) : ''}</div> */}
                                    </div>
                                </td>

                                <td className="px-4 py-1 text-center">
                                    <div
                                        className="mx-auto flex w-[120px] justify-center rounded-full px-1 py-2 text-[#464255]"
                                    >
                                        <button type="button" className={class_btn_} disabled={false}
                                            // onClick={() => underDevelopment()}
                                            onClick={() => openDocument(WhichOpenDocument, 'view', row?.row)}
                                        >
                                            <RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, color: '#1473A1' }} />
                                        </button>
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

export default TableHistoryDocument1;