import { useEffect } from "react";
import React, { FC, useState } from 'react';
import { fillMissingUpdateByAccount, formatDate, formatDateK, formatDateNoTime, formatDateTimeSec, formatNumber, getContrastTextColor } from '@/utils/generalFormatter';

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
interface TableProps {
    tableData: any;
    isLoading?: any;
    columnVisibility?: any;
    userPermission?: any;
}

const TableHvOperateFlowHistory: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility, userPermission }) => {

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

                        {columnVisibility.type && (
                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("hv_type.type", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))} >
                                {`Type`}
                                {getArrowIcon("hv_type.type")}
                            </th>
                        )}

                        {columnVisibility.shipper_name && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("group.name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))} >
                                {`Shipper Name`}
                                {getArrowIcon("group.name")}
                            </th>
                        )}

                        {columnVisibility.meter_point && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("metering_point.metered_point_name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))} >
                                {`Meter Point`}
                                {getArrowIcon("metering_point.metered_point_name")}
                            </th>
                        )}

                        {columnVisibility.start_date && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("start_date", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))} >
                                {`Start Date`}
                                {getArrowIcon("start_date")}
                            </th>
                        )}

                        {columnVisibility.created_by && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("create_by_account.first_name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))} >
                                {`Created by`}
                                {getArrowIcon("create_by_account.first_name")}
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
                                {columnVisibility.type && (
                                    <td className="px-2 py-1">
                                        <div className="flex items-center justify-center h-full">
                                            {row?.hv_type && (
                                                <div
                                                    className="flex items-center font-semibold justify-center w-[140px] h-[30px] rounded-full p-1"
                                                    style={{
                                                        backgroundColor: row?.hv_type?.color,
                                                        // color: row?.hv_type_id == 1 ? '#0DA2A2' : getContrastTextColor(row?.hv_type?.color),
                                                        color: row?.hv_type_id == 1 ? '#0DA2A2' : '#2F9ADC',
                                                    }}
                                                >
                                                    {row?.hv_type?.type}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                )}

                                {columnVisibility?.shipper_name && (
                                    <td className={`px-2 py-1 text-[#464255] `}>
                                        {row?.group ? row?.group?.name : ''}
                                    </td>
                                )}

                                {columnVisibility.meter_point && (
                                    <td className={`px-2 py-1 text-[#464255] `}>
                                        {row?.metering_point ? row?.metering_point?.metered_point_name : ''}
                                    </td>
                                )}

                                {columnVisibility.start_date && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.start_date ? formatDateNoTime(row?.start_date) : ''}</td>
                                )}

                                {columnVisibility.created_by && (
                                    <td className="px-2 py-1">
                                        <div>
                                            <span className="text-[#464255]">{row?.create_by_account?.first_name} {row?.create_by_account?.last_name}</span>
                                            <div className="text-gray-500 text-xs">{row?.create_date ? formatDateTimeSec(row?.create_date) : ''}</div>
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
                                    // <>
                                    //     {
                                    //         index == 0 ?
                                    //             <td className="px-2 py-1 text-[#464255]">
                                    //                 <div>
                                    //                     <span className="text-[#464255]">{row?.create_by_account?.first_name} {row?.create_by_account?.last_name}</span>
                                    //                     <div className="text-gray-500 text-xs">{row?.create_date ? formatDateTimeSec(row?.create_date) : ''}</div>
                                    //                 </div>
                                    //             </td>
                                    //             :
                                    //             <td className="px-2 py-1 text-[#464255]">
                                    //                 <div>
                                    //                     <span className="text-[#464255]">{row?.update_by_account?.first_name} {row?.update_by_account?.last_name}</span>
                                    //                     <div className="text-gray-500 text-xs">{row?.update_date ? formatDateTimeSec(row?.update_date) : ''}</div>
                                    //                 </div>
                                    //             </td>
                                    //     }
                                    // </>
                                )}

                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default TableHvOperateFlowHistory;