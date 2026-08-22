import { useEffect } from "react";
import React, { FC, useState } from 'react';
import { fillMissingUpdateByAccount, formatDate, formatDateNoTime, formatDateTimeSec, formatNumber } from '@/utils/generalFormatter';

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
interface TableProps {
    tableData: any;
    isLoading?: any;
    columnVisibility?: any;
}

const TableEmailNotiMgnHistory: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility }) => {

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

                        {columnVisibility.module && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("menus_id", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Module`}
                                {getArrowIcon("menus_id")}
                            </th>
                        )}

                        {columnVisibility.activity && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("activity_id", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Activity`}
                                {getArrowIcon("activity_id")}
                            </th>
                        )}

                        {columnVisibility.subject && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("subject", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Subject`}
                                {getArrowIcon("subject")}
                            </th>
                        )}

                        {/* {columnVisibility.active && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("active", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Active`}
                                {getArrowIcon("active")}
                            </th>
                        )} */}

                        <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("update_by_account.first_name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
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
                                {columnVisibility.module && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.menus?.name}</td>
                                )}

                                {columnVisibility.activity && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.activity?.name}</td>
                                )}

                                {columnVisibility.subject && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.subject}</td>
                                )}

                                {/* {columnVisibility.active && (
                                    <td className="px-2 py-1">
                                        <div>
                                            <label className="relative inline-block w-10 h-6 ">
                                                <input
                                                    type="checkbox"
                                                    // defaultChecked={row?.status}
                                                    checked={row?.active}
                                                    className="sr-only peer"
                                                    onChange={(e) => {
                                                        // handleChange(e.target.checked)
                                                        // handleActive(row?.id, e.target.checked);
                                                    }}
                                                />
                                                <span className="slider absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 transition duration-400 rounded-full peer-checked:bg-[#1473A1]"></span>
                                                <span className="dot absolute h-4 w-4 left-1 bottom-1 bg-white transition duration-400 rounded-full peer-checked:translate-x-full"></span>
                                            </label>
                                        </div>
                                    </td>
                                )} */}

                                <td className="px-2 py-1 text-[#464255]">
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

export default TableEmailNotiMgnHistory;