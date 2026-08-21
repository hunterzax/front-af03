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

const TablePlanDeadHistory: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility }) => {

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
                        {columnVisibility.term && (
                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("term_type_id", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}  >
                                {`Term`}
                                {getArrowIcon("term_type_id")}
                            </th>
                        )}

                        {columnVisibility.end_time && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("hour", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))} >
                                {`End Time`}
                                {getArrowIcon("hour")}

                            </th>
                        )}

                        {columnVisibility.date_of_month && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("day", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))} >
                                {`Date of Month`}
                                {getArrowIcon("day")}

                            </th>
                        )}

                        {columnVisibility.before_month && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("before_month", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))} >
                                {`Before Month`}
                                {getArrowIcon("before_month")}
                            </th>
                        )}

                        {columnVisibility.start_date && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("start_date", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))} >
                                {`Start Date`}
                                {getArrowIcon("start_date")}

                            </th>
                        )}

                        {columnVisibility.end_date && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("end_date", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))} >
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

                    </tr>
                </thead>

                <tbody>
                    {sortedData && sortedData.map((row: any, index: any) => {
                        return (
                            <tr
                                key={row?.id}
                                className={`${table_row_style}`}
                            >
                                {columnVisibility.term && (
                                    // <td className="px-2 py-1 justify-center ">{row?.term_type && <div className="flex w-[130px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.term_type?.color }}>{`${row?.term_type?.name}`}</div>}</td>
                                    <td className="px-2 py-1">
                                        {row?.term_type &&
                                            <div className="flex w-full h-ful justify-center items-center">
                                                <div className="flex w-[130px] justify-center rounded-full p-1 text-[#464255]"
                                                    style={{ backgroundColor: row?.term_type?.color }}
                                                >
                                                    {`${row?.term_type?.name}`}
                                                </div>
                                            </div>
                                        }
                                    </td>
                                )}

                                {columnVisibility.end_time && (
                                    <td className="px-2 py-1 text-[#464255]">
                                        {row?.hour !== undefined && String(row?.hour).padStart(2, '0')}
                                        {`:`}
                                        {row?.minute !== undefined && String(row?.minute).padStart(2, '0')}
                                    </td>
                                )}

                                {columnVisibility.date_of_month && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.day && row?.day}</td>
                                )}

                                {columnVisibility.before_month && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.before_month && row?.before_month}</td>
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

export default TablePlanDeadHistory;