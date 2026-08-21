import { useEffect, useRef } from "react";
import React, { FC, useState } from 'react';
import TableSkeleton, { DefaultSkeleton } from '@/components/material_custom/DefaultSkeleton';
import { formatDate, formatDateNoTime } from '@/utils/generalFormatter';

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style, table_sort_header_style_original } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
interface TableProps {
    // openHistoryForm: (id: any) => void;
    tableData: any;
    isLoading: any;
    columnVisibility: any;
    userPermission?: any;
}

const TableAllocationMode: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility, userPermission }) => {
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);
    useEffect(() => {
        if (tableData && tableData.length > 0) {
            setSortedData(tableData);
        }
        setSortedData(tableData);

    }, [tableData]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    return (
        <div className={`h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md relative z-1`}>
            {
                isLoading ?
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-9">

                                {columnVisibility.mode && (
                                    <th scope="col" className={`${table_sort_header_style} `} onClick={() => handleSort("allocation_mode_type.mode", sortState, setSortState, setSortedData, tableData)}>
                                        {`Mode`}
                                        {getArrowIcon("allocation_mode_type.mode")}
                                    </th>
                                )}

                                {columnVisibility.start_date && (
                                    <th scope="col" className={`${table_sort_header_style} w-[170px]`} onClick={() => handleSort("start_date", sortState, setSortState, setSortedData, tableData)}>
                                        {`Start Date`}
                                        {getArrowIcon("start_date")}
                                    </th>
                                )}

                                {columnVisibility.created_by && (
                                    <th scope="col" className={`${table_sort_header_style}  w-[170px]`} onClick={() => handleSort("create_by_account.first_name", sortState, setSortState, setSortedData, tableData)}>
                                        {`Created by`}
                                        {getArrowIcon("create_by_account.first_name")}
                                    </th>
                                )}

                            </tr>
                        </thead>

                        <tbody>
                            {sortedData && sortedData.map((row: any, index: any) => {
                                return (
                                    <tr
                                        key={row?.id}
                                        className={`${table_row_style}`}
                                    >
                                        {columnVisibility.mode && (
                                            <td className="px-2 py-1 text-[#464255]">{row?.allocation_mode_type && row?.allocation_mode_type?.mode}</td>
                                        )}

                                        {columnVisibility.start_date && (
                                            <td className="px-2 py-1 text-[#464255]">{row?.start_date ? formatDateNoTime(row?.start_date) : ''}</td>
                                        )}

                                        {columnVisibility.created_by && (
                                            <td className="px-2 py-1 text-[#464255]">
                                                <div>
                                                    <span className="text-[#464255]">{row?.create_by_account?.first_name} {row?.create_by_account?.last_name}</span>
                                                    <div className="text-gray-500 text-xs">{formatDate(row?.create_date)}</div>
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
        </div>
    )
}

export default TableAllocationMode;