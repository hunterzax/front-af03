import { useEffect } from "react";
import React, { useState } from 'react';
import { formatDateTimeSec } from '@/utils/generalFormatter';
import SupervisorAccountRoundedIcon from '@mui/icons-material/SupervisorAccountRounded';

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
interface TableProps {
    tableData: any;
    isLoading?: any;
}

const TableTablePathMgnHistory: React.FC<TableProps> = ({ tableData, isLoading }) => {

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);
    useEffect(() => {
        if (tableData && tableData.length > 0) {
            setSortedData(tableData);
        }else{
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
                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-1">
                    <tr className="h-9">
                        <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("name", sortState, setSortState, setSortedData, tableData)}>
                            {`Email Group Name`}
                            {getArrowIcon("name")}
                        </th>
                        <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("edit_email_group_for_event_match", sortState, setSortState, setSortedData, tableData)}>
                            {`Person`}
                            {getArrowIcon("edit_email_group_for_event_match")}
                        </th>
                        <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("update_by_account.first_name", sortState, setSortState, setSortedData, tableData)}>
                            {`Updated by`}
                            {getArrowIcon("update_by_account.first_name")}
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
                                <td className="px-2 py-1 text-[#464255] font-light">{row?.name && row?.name}</td>

                                <td className="px-2 py-1 text-center">
                                    <div className="inline-flex items-center justify-center relative">
                                        <button
                                            type="button"
                                            className="flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                                            // onClick={() => openViewModal(row)}
                                            disabled={row?.edit_email_group_for_event_match.length <= 0 && true}
                                        >
                                            <SupervisorAccountRoundedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                                        </button>
                                        <span className="px-2 text-[#464255]">
                                            {row?.edit_email_group_for_event_match?.length}
                                        </span>
                                    </div>
                                </td>

                                <td className="px-2 py-1">
                                    <div>
                                        <span className="text-[#464255]">{row?.update_by_account?.first_name} {row?.update_by_account?.last_name}</span>
                                        <div className="text-gray-500 text-xs">{row?.update_date ? formatDateTimeSec(row?.update_date) : ''}</div>
                                    </div>
                                </td>

                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default TableTablePathMgnHistory;