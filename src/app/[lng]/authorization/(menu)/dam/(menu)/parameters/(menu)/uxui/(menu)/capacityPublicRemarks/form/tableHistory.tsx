import { useEffect } from "react";
import React, { FC, useState } from 'react';
import { fillMissingUpdateByAccount, formatDate, formatDateNoTime, formatDateTimeSec, formatNumber } from '@/utils/generalFormatter';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_sort_header_style, table_sort_header_style_original } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
interface TableProps {
    tableData: any;
    isLoading?: any;
    columnVisibility?: any;
}

const TableCapPublicRemarkHistory: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility }) => {

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
            const normalized = fillMissingUpdateByAccount(tableData);
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

    return (
        <div className={`h-[calc(100vh-500px)] overflow-y-auto block  rounded-t-md relative z-1`}>

            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                    <tr className="h-9">
                        {columnVisibility.start_date && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("start_date", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Start Date`}
                                {getArrowIcon("start_date")}
                            </th>
                        )}

                        {columnVisibility.end_date && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("end_date", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`End Date`}
                                {getArrowIcon("end_date")}
                            </th>
                        )}

                        {columnVisibility.remark && (
                            <th scope="col" className={`${table_header_style}`}>
                                {`Remarks`}
                            </th>
                        )}

                        {columnVisibility.updated_by && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("update_by_account.first_name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Updated by`}
                                {getArrowIcon("update_by_account.first_name")}
                            </th>
                        )}
                    </tr>
                </thead>

                <tbody>
                    {sortedData && sortedData.map((row: any, index: any) => {
                        return (
                            <tr
                                key={row?.id}
                                className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} h-12 `}
                            >

                                {columnVisibility.start_date && (
                                    <td className="px-2 py-1 text-[#464255] w-[100px] ">{row?.start_date ? formatDateNoTime(row?.start_date) : ''}</td>
                                )}

                                {columnVisibility.end_date && (
                                    <td className="px-2 py-1 text-[#0DA2A2] w-[100px]">{row?.end_date ? formatDateNoTime(row?.end_date) : ''}</td>
                                )}

                                {/* {columnVisibility.remark && (
                                    <td className="px-2 py-1 text-center">
                                        <div className="inline-flex items-center justify-center relative">
                                            <button
                                                type="button"
                                                className="flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-[#DFE4EA] hover:border hover:border-[#DFE4EA] relative"
                                            // onClick={() => openReasonModal(row?.id, row?.remark, row?.create_date, row?.create_by_account, row?.start_date, row?.end_date)}
                                            >
                                                <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 18, color: '#58585A' }} />
                                                <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-[#00ADEF] rounded-full">
                                                    {'1'}
                                                </span>
                                            </button>
                                        </div>
                                    </td>
                                )} */}

                                {/* {columnVisibility.remark && (
                                    <td className="px-2 py-1 text-left">
                                        <div className="text-[#464255] truncate w-[450px]" title={row?.remark}>
                                            {row?.remark ? row?.remark : ''}
                                        </div>
                                    </td>
                                )} */}

                                {columnVisibility.remark && (
                                    <td className="px-2 py-1 text-left">
                                        <div className="text-[#464255] break-words w-full whitespace-normal">
                                            {row?.remark ? row?.remark : ""}
                                        </div>
                                    </td>
                                )}


                                {columnVisibility.updated_by && (
                                    <td className="px-2 py-1 text-[#464255]">
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

export default TableCapPublicRemarkHistory;