import { useEffect } from "react";
import React, { FC, useState } from 'react';
import { formatDate, formatDateNoTime, formatDateTimeSec, formatNumber } from '@/utils/generalFormatter';

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
interface TableProps {
    tableData: any;
    isLoading?: any;
    columnVisibility?: any;
}

const TableNomiDeadHistory: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility }) => {
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);
    const [tableDataMod, setTableDataMod] = useState(tableData);

    useEffect(() => {
        if (tableData && tableData.length > 0) {

            // ปั้น DATA
            const updatedData = tableData?.map((item: any) => {
                const hour = String(item.hour).padStart(2, "0");    // เติม 0 ถ้าจำนวนน้อยกว่า 10
                const minute = String(item.minute).padStart(2, "0"); // เช่น 0 → "00"
                return {
                    ...item,
                    final_time: `${hour}:${minute}`,
                };
            });

            setSortedData(updatedData);
            setTableDataMod(updatedData);
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

                        {columnVisibility.user_type && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("user_type_id", sortState, setSortState, setSortedData, tableDataMod)}>
                                {`User Type`}
                                {getArrowIcon("user_type_id")}
                            </th>
                        )}

                        {columnVisibility.process_type && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("process_type_id", sortState, setSortState, setSortedData, tableDataMod)}>
                                {`Process Type`}
                                {getArrowIcon("process_type_id")}
                            </th>
                        )}

                        {columnVisibility.nom_type && (
                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("nomination_type_id", sortState, setSortState, setSortedData, tableDataMod)}>
                                {`Nomination Type`}
                                {getArrowIcon("nomination_type_id")}
                            </th>
                        )}

                        {columnVisibility.time && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("final_time", sortState, setSortState, setSortedData, tableDataMod)}>
                                {`Time`}
                                {getArrowIcon("final_time")}
                            </th>
                        )}

                        {columnVisibility.before_gas && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("before_gas_day", sortState, setSortState, setSortedData, tableDataMod)}>
                                {`Before Gas Day`}
                                {getArrowIcon("before_gas_day")}
                            </th>
                        )}

                        {columnVisibility.start_date && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("start_date", sortState, setSortState, setSortedData, tableDataMod)}>
                                {`Start Date`}
                                {getArrowIcon("start_date")}
                            </th>
                        )}

                        {columnVisibility.end_date && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("end_date", sortState, setSortState, setSortedData, tableDataMod)}>
                                {`End Date`}
                                {getArrowIcon("end_date")}
                            </th>
                        )}

                        {columnVisibility.updated_by && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("update_by_account.first_name", sortState, setSortState, setSortedData, tableDataMod)}>
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
                                className={`${table_row_style}`}
                            >
                                {columnVisibility.user_type && (
                                    <td className="px-2 py-1 justify-center">
                                        {
                                            row?.user_type &&
                                            <div className="flex w-[100px] bg-[#EEE4FF] justify-center !text-[14px] font-bold rounded-full p-1" style={{ backgroundColor: row?.user_type?.color, color: row?.user_type?.color_text }}>{row?.user_type?.name}</div>
                                        }
                                    </td>
                                )}

                                {columnVisibility.process_type && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.process_type && row?.process_type?.name}</td>
                                )}

                                {columnVisibility.nom_type && (
                                    <td className="px-2 py-1 text-[#464255]">
                                        <div className="flex justify-center items-center w-full">
                                            <div className="w-[200px] text-center py-1 rounded-[20px]" style={{ background: row?.nomination_type?.color }}>{row?.nomination_type && row?.nomination_type?.name + " Nomination"}</div>
                                        </div>
                                    </td>
                                )}

                                {columnVisibility.time && (
                                    <td className="px-2 py-1 text-[#464255]">
                                        {/* {row?.hour !== undefined && String(row?.hour).padStart(2, '0')}
                                        {`:`}
                                        {row?.minute !== undefined && String(row?.minute).padStart(2, '0')} */}

                                        {row?.final_time}
                                    </td>
                                )}

                                {columnVisibility.before_gas && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.before_gas_day && row?.before_gas_day}</td>
                                )}

                                {/* <td className="px-2 py-1 text-right text-[#464255]">{formatNumber(row?.area_nominal_capacity)}</td> */}
                                {columnVisibility.start_date && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.start_date ? formatDateNoTime(row?.start_date) : ''}</td>
                                )}

                                {columnVisibility.end_date && (
                                    <td className="px-2 py-1 text-[#0DA2A2]">{row?.end_date ? formatDateNoTime(row?.end_date) : ''}</td>
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

export default TableNomiDeadHistory;