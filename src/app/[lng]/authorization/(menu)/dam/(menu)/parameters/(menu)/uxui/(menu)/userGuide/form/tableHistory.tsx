import { useEffect } from "react";
import React, { FC, useState } from 'react';
import { cutUploadFileName, fillFileName, fillMissingUpdateByAccount, formatDate, formatDateNoTime, formatDateTimeSec, formatNumber, normalizeHistoryData } from '@/utils/generalFormatter';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style, table_sort_header_style_original } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import getUserValue from "@/utils/getuserValue";
interface TableProps {
    tableData: any;
    isLoading?: any;
    columnVisibility?: any;
    userPermission?: any
}

const TableUserGuideHistory: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility, userPermission }) => {
    const userDT: any = getUserValue();
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState<any>([]);

    // useEffect(() => {
    //     if (tableData && tableData.length > 0) {
    //         setSortedData(tableData);
    //     } else {
    //         setSortedData([]);
    //     }
    // }, [tableData]);

    useEffect(() => {
        if (tableData && tableData.length > 0) {
            const normalized = normalizeHistoryData(tableData);
            setSortedData(normalized);
        } else {
            setSortedData([]);
        }
    }, [tableData]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    const downloadFile = (fileUrl: string) => {
        if (!fileUrl) {
            // File URL is invalid
            return;
        }
        window.open(fileUrl, '_blank');
    };

    return (
        <div className={`h-[calc(100vh-500px)] overflow-y-auto block  rounded-t-md relative z-1`}>

            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                    <tr className="h-9">

                        {columnVisibility.document_name && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("document_name", sortState, setSortState, setSortedData, normalizeHistoryData(tableData))}>
                                {`Document Name`}
                                {getArrowIcon("document_name")}
                            </th>
                        )}

                        {columnVisibility.file && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("file_name", sortState, setSortState, setSortedData, normalizeHistoryData(tableData))}>
                                {`File`}
                                {getArrowIcon("file_name")}
                            </th>
                        )}

                        {columnVisibility.desc && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("description", sortState, setSortState, setSortedData, normalizeHistoryData(tableData))}>
                                {`Description`}
                                {getArrowIcon("description")}
                            </th>
                        )}

                        {columnVisibility.download && (
                            <th scope="col" className={`${table_header_style}`} >
                                {`Download`}
                            </th>
                        )}

                        {columnVisibility.create_by && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("create_by_account.first_name", sortState, setSortState, setSortedData, normalizeHistoryData(tableData))}>
                                {`Created by`}
                                {getArrowIcon("create_by_account.first_name")}
                            </th>
                        )}

                        {columnVisibility.update_by && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("update_by_account.first_name", sortState, setSortState, setSortedData, normalizeHistoryData(tableData))}>
                                {`Updated by`}
                                {getArrowIcon("update_by_account.first_name")}
                            </th>
                        )}

                    </tr>
                </thead>

                <tbody>
                    {sortedData && sortedData.map((row: any, index: any) => {

                        let canDownload = false
                        if (userDT?.account_manage?.[0]?.user_type_id == 1) {
                            canDownload = true
                        } else if (row?.user_guide_match?.some((match: any) => match.role_id === userDT?.account_manage?.[0]?.account_role?.[0]?.role_id) && userPermission?.f_export) {
                            canDownload = true
                        }

                        return (
                            <tr
                                key={row?.id}
                                className={`${table_row_style}`}
                            >
                                {columnVisibility.document_name && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.document_name}</td>
                                )}

                                {columnVisibility.file && (
                                    <td className="px-2 py-1 text-[#464255]">
                                        <div className="flex items-center">
                                            <img className="w-[20px] h-[20px] mr-2" src="/assets/image/pdf_icon.png" alt="pdf icon" />
                                            {/* <span>{row?.file && cutUploadFileName(row?.file)}</span> */}
                                            <span>{row?.file && row?.file_name}</span>
                                        </div>
                                    </td>
                                )}

                                {columnVisibility.desc && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.description}</td>
                                )}

                                {columnVisibility.download && (
                                    <td className="px-2 py-1 text-center justify-center">
                                        <div className="inline-flex items-center justify-center relative">
                                            {/* <button
                                                type="button"
                                                className="flex items-center justify-center px-[2px] py-[2px] border border-[#555479] rounded-md hover:bg-[#DFE4EA] hover:border hover:border-[#DFE4EA] relative"
                                            // onClick={() => downloadFile(row?.file)}
                                            >
                                                <FileDownloadOutlinedIcon sx={{ fontSize: 18, color: '#2B2A87' }} />
                                            </button> */}
                                            <button
                                                type="button"
                                                className={`flex items-center justify-center px-[2px] py-[2px] border border-[#555479] rounded-md hover:bg-[#DFE4EA] hover:border hover:border-[#DFE4EA] relative ${!canDownload && "opacity-50 cursor-not-allowed !border-[#555479]"}`}
                                                onClick={() => canDownload && downloadFile(row?.file)}
                                                disabled={!canDownload}
                                            >
                                                <FileDownloadOutlinedIcon sx={{ fontSize: 18, color: '#2B2A87' }} />
                                            </button>
                                        </div>
                                    </td>
                                )}

                                {columnVisibility.create_by && (
                                    <td className="px-2 py-1 ">
                                        <div>
                                            <span className="text-[#464255]">{row?.create_by_account?.first_name} {row?.create_by_account?.last_name}</span>
                                            <div className="text-gray-500 text-xs">{formatDate(row?.create_date)}</div>
                                        </div>
                                    </td>
                                )}

                                {columnVisibility.update_by && (
                                    <td className="px-2 py-1">
                                        <div>
                                            <span className="text-[#464255]">{row?.update_by_account?.first_name} {row?.update_by_account?.last_name}</span>
                                            <div className="text-gray-500 text-xs">{row?.update_date ? formatDateTimeSec(row?.update_date) : ''}</div>
                                        </div>
                                    </td>
                                )}

                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default TableUserGuideHistory;