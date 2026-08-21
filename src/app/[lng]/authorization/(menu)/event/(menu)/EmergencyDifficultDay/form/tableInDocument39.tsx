import { useEffect } from "react";
import React, { FC, useState } from 'react';
import { formatDate, formatDateNoTime, formatNumber, formatNumberFourDecimal, formatNumberThreeDecimal, handleDownloadPDFTsoView, handleDownloadPDFTsoViewEmer } from '@/utils/generalFormatter';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import NodataTable from "@/components/other/nodataTable";
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import { getServiceArrayBuffer } from "@/utils/postService";
interface TableProps {
    tableData: any;
    dataOpenDocument?: any;
    isLoading?: any;
    columnVisibility?: any;
}

const class_btn_ = `flex items-center justify-center px-[2px] py-[2px] border border-[#EAECF0] rounded-md hover:bg-[#DFE4EA] hover:border hover:border-[#DFE4EA] relative `

const TableDocument39: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility, dataOpenDocument }) => {

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);
    const [mainData, setMainData] = useState(tableData);

    useEffect(() => {
        if (tableData && tableData.length > 0) {
            setSortedData(tableData.reverse())
            setMainData(tableData.reverse())
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

    return (
        // <div className={`h-[calc(100vh-500px)] overflow-y-auto block  rounded-t-md relative z-1`}>
        <div className={`h-full overflow-y-auto block  rounded-t-md relative z-1`}>
            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                    <tr className="h-9">

                        <th scope="col" className={`${table_header_style}`} >
                            {`Event Code`}
                        </th>

                        <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("group.name", sortState, setSortState, setSortedData, mainData)}>
                            {`Shipper Name`}
                            {getArrowIcon("group.name")}
                        </th>

                        <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("event_doc_status.name", sortState, setSortState, setSortedData, mainData)}>
                            {`Acknowledge`}
                            {getArrowIcon("event_doc_status.name")}
                        </th>

                        <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("id", sortState, setSortState, setSortedData, mainData)}>
                            {`File`}
                            {getArrowIcon("id")}
                        </th>

                        <th scope="col" className={`${table_header_style} text-center`} >
                            {`Download `}
                        </th>

                        <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("create_date", sortState, setSortState, setSortedData, mainData)}>
                            {`การดำเนินการ`}
                            {getArrowIcon("create_date")}
                        </th>

                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("event_doc_status.name", sortState, setSortState, setSortedData, mainData)}>
                            {`หมายเหตุ`}
                            {getArrowIcon("event_doc_status.name")}
                        </th>

                    </tr>
                </thead>

                <tbody>
                    {sortedData && sortedData.map((row: any, index: any) => {
                        return (
                            <tr
                                key={row?.id}
                                className={`${table_row_style}`}
                            >
                                {/* <td className="px-4 py-1 text-[#464255] ">{row?.create_date ? formatDate(row?.create_date) : ''}</td> */}

                                <td className="px-4 py-1 text-[#464255] ">{dataOpenDocument ? dataOpenDocument?.event_runnumber_emer?.event_nember : ''}</td>
                                <td className="px-4 py-1 text-[#464255] ">{row?.group ? row?.group?.name : ''}</td>

                                <td className="px-4 py-1 text-center">
                                    {row?.event_doc_status_id == 5 && <DoneOutlinedIcon sx={{ fontSize: 20, color: '#1473A1' }} />}
                                </td>

                                <td className="px-4 py-1 text-[#464255] ">{`Document_${row?.id}.pdf`}</td>

                                <td className="px-4 py-1 text-center">
                                    <div className="mx-auto flex w-[120px] justify-center rounded-full px-1 py-2 text-[#464255]">
                                        <button type="button" className={class_btn_} disabled={false}
                                            onClick={() => handleDownloadPDFTsoViewEmer('doc39', row?.id, row?.update_by, row?.group_id)}
                                        >
                                            <FileDownloadIcon sx={{ fontSize: 20, color: '#1473A1' }} />
                                        </button>
                                    </div>
                                </td>

                                {/* <td className="px-4 py-1  text-[#464255]">
                                    {row?.doc_39_input_shipper_operation ? row?.doc_39_input_shipper_operation : ''}
                                </td> */}

                                <td className="px-4 py-1 text-[#464255] whitespace-normal break-words">
                                    {row?.doc_39_input_shipper_operation || ''}
                                </td>

                                <td className="px-4 py-1 text-[#464255] ">
                                    {row?.doc_39_input_shipper_note ? row?.doc_39_input_shipper_note : ''}
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
    )
}

export default TableDocument39;