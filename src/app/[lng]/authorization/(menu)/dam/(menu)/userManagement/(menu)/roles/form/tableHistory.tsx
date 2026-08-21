import { useEffect } from "react";
import React, { useState } from 'react';
import { fillMissingUpdateByAccount, formatDateNoTime, formatDateTimeSec } from '@/utils/generalFormatter';

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_row_style, table_sort_header_style } from "@/utils/styles";

import { handleSort } from "@/utils/sortTable";
interface TableProps {
    tableData: any;
    isLoading?: any;
    columnVisibility?: any;
}

const TableRoleHistory: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility }) => {

    // smart search ใช้งานไม่ได้เกือบทุก column https://app.clickup.com/t/86er0g6xw
    // Test at 8 Jan 2025
    // ใส่ 01/01/2025 ไปใน smart search แล้วยังหา start date/ end date ไม่ได้ครับ เหมือนพอใส่ / เข้าไปก็จะหาอะไรไม่เจอแล้วครับ
    // รบกวนแก้ไขแล้วส่งมาใหม่อีกทีนะครับ

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState<any>([]);

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

            <table className="min-w-full text-sm text-left rtl:text-right text-gray-500 whitespace-nowrap ">
                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                    <tr className="h-9">
                        {columnVisibility.user_type && (
                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("user_type_id", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`User Type`}
                                {getArrowIcon("user_type_id")}
                            </th>
                        )}

                        {columnVisibility.role_name && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Role Name`}
                                {getArrowIcon("name")}
                            </th>
                        )}

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

                        {columnVisibility.updated_by && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("update_by_account.first_name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Updated by`}
                                {getArrowIcon("update_by_account.first_name")}
                            </th>
                        )}

                        {columnVisibility.update_permission_by_account && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("update_permission_by_account.first_name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Updated Role Management`}
                                {getArrowIcon("update_permission_by_account.first_name")}
                            </th>
                        )}

                    </tr>
                </thead>

                <tbody>
                    {sortedData && sortedData.map((row: any, index: any) => (
                        <tr
                            key={row?.id}
                            className={`${table_row_style}`}
                        >
                            {columnVisibility.user_type && (
                                <td className="px-2 py-1 justify-center">
                                    {
                                        row?.user_type &&
                                        <div className="flex justify-center items-center">
                                            <div className="flex w-[100px] bg-[#EEE4FF] justify-center !text-[14px] font-bold rounded-full p-1" style={{ backgroundColor: row?.user_type?.color, color: row?.user_type?.color_text }}>{row?.user_type?.name}</div>
                                        </div>
                                    }
                                </td>
                            )}

                            {columnVisibility.role_name && (
                                <td className="px-2 py-1 text-[#464255]">{row?.name}</td>
                            )}

                            {columnVisibility.start_date && (
                                <td className="px-2 py-1 text-[#464255]">{row?.start_date ? formatDateNoTime(row?.start_date) : ''}</td>
                            )}

                            {columnVisibility.end_date && (
                                <td className="px-2 py-1 text-[#0DA2A2]">{row?.end_date ? formatDateNoTime(row?.end_date) : ''}</td>
                            )}

                            {columnVisibility.updated_by && (
                                <td className="px-2 py-1">
                                    <div>
                                        <span className="text-[#464255]">{row?.update_by_account?.first_name} {row?.update_by_account?.last_name}</span>
                                        <div className="text-gray-500 text-xs">{row?.update_date ? formatDateTimeSec(row?.update_date) : ''}</div>
                                    </div>
                                </td>
                            )}

                            {columnVisibility.update_permission_by_account && (
                                <td className="px-2 py-1">
                                    <div>
                                        <span className="text-[#464255]">{row?.update_permission_by_account?.first_name} {row?.update_permission_by_account?.last_name}</span>
                                        <div className="text-gray-500 text-xs">{row?.update_permission_date ? formatDateTimeSec(row?.update_permission_date) : ''}</div>
                                    </div>
                                </td>
                            )}

                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    )
}

export default TableRoleHistory;