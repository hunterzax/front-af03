import { useEffect } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatNumberSixDecimal, formatNumberThreeDecimal } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";

const TableTabDetail: React.FC<any> = ({ tableDataCurrent, tableDataAll, tableDataRender, columnVisibility, isLoading, userPermission, tabEntry, tableType, dataForSorting, displayUnit }) => {
    const [sortedData, setSortedData] = useState<any>([]);
    const [originalData, setOriginalData] = useState<any>([]);
    const [isNodata, setIsNodata] = useState<boolean>(true);
    const [sortState, setSortState] = useState({ column: null, direction: null });

    // แปลง "HH:MM" -> จำนวนนาทีตั้งแต่ 00:00
    const toMinutes = (t?: string | null) => {
        if (!t) return Number.POSITIVE_INFINITY; // ไม่มีค่า => ไปท้ายสุด
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    };

    useEffect(() => {
        if (tableType == 'current') {
            setSortedData(tableDataCurrent);
            setIsNodata(tableDataCurrent?.length > 0 ? false : true)
        } else {

            // ไม่แก้ต้นฉบับ
            const sorted_time = [...tableDataRender].sort((a, b) => toMinutes(a.time) - toMinutes(b.time));

            // setSortedData(tableDataRender);
            // setIsNodata(tableDataRender?.length > 0 ? false : true)
            setSortedData(sorted_time);
            setOriginalData(sorted_time)
            setIsNodata(sorted_time?.length > 0 ? false : true)
        }
    }, [tableDataCurrent, tableDataAll, tableDataRender])


    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    useEffect(() => {
        // ไม่แก้ต้นฉบับ
        const sorted_time = [...tableDataRender].sort((a, b) => toMinutes(a.time) - toMinutes(b.time));
        // setFlatTimeRows(tableDataRender)
        // setSortedData(tableDataRender)
        setSortedData(sorted_time)
        setOriginalData(sorted_time)
    }, [tableDataAll])

    return (
        // <div className={`relative ${tableType == 'current' ? 'h-[calc(100vh-650px)]' : 'h-[calc(100vh-500px)]'} overflow-y-auto block  rounded-t-md z-1`}>
        <div className={`relative h-[calc(100vh-300px)] overflow-y-auto block  rounded-t-md z-1`}>

            {
                isLoading ?
                    <table className={`w-full text-sm text-left rtl:text-right text-gray-500 `}>
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-9">

                                {columnVisibility.current_time && tableType == 'current' && (
                                    // <th scope="col" className={`${table_sort_header_style} w-[150px] max-w-[200px]`} onClick={() => handleSort("time", sortState, setSortState, setSortedData, tableDataRender)}>
                                    // <th scope="col" className={`${table_sort_header_style} w-[150px] max-w-[200px]`} onClick={() => handleSort("time", sortState, setSortState, setSortedData, originalData)}>
                                    <th scope="col" className={`${table_sort_header_style} w-[150px] max-w-[200px]`} onClick={() => handleSort("time", sortState, setSortState, setSortedData, dataForSorting)}>
                                        {`Current Time`}
                                        {getArrowIcon("time")}
                                    </th>
                                )}

                                {columnVisibility.time && tableType == 'all' && (
                                    // <th scope="col" className={`${table_sort_header_style} w-[150px] max-w-[200px]`} onClick={() => handleSort("time", sortState, setSortState, setSortedData, tableDataRender)}>
                                    // <th scope="col" className={`${table_sort_header_style} w-[150px] max-w-[200px]`} onClick={() => handleSort("time", sortState, setSortState, setSortedData, originalData)}>
                                    <th scope="col" className={`${table_sort_header_style} w-[150px] max-w-[200px]`} onClick={() => handleSort("time", sortState, setSortState, setSortedData, dataForSorting)}>
                                        {`Time`}
                                        {getArrowIcon("time")}
                                    </th>
                                )}

                                {columnVisibility.shipper_name && (
                                    // <th scope="col" className={`${table_sort_header_style} !min-w-[120px] w-[300px] max-w-[450px]`} onClick={() => handleSort("shipper_name", sortState, setSortState, setSortedData, tableDataRender)}>
                                    // <th scope="col" className={`${table_sort_header_style} !min-w-[120px] w-[300px] max-w-[450px]`} onClick={() => handleSort("shipper_name", sortState, setSortState, setSortedData, originalData)}>
                                    <th scope="col" className={`${table_sort_header_style} !min-w-[120px] w-[300px] max-w-[450px]`} onClick={() => handleSort("shipper_name", sortState, setSortState, setSortedData, dataForSorting)}>
                                        {`Shipper Name`}
                                        {getArrowIcon("shipper_name")}
                                    </th>
                                )}

                                {columnVisibility.nomination_point && (
                                    // <th scope="col" className={`${table_sort_header_style}  !min-w-[120px] w-[300px] max-w-[450px]`} onClick={() => handleSort("point", sortState, setSortState, setSortedData, tableDataRender)}>
                                    // <th scope="col" className={`${table_sort_header_style}  !min-w-[120px] w-[300px] max-w-[450px]`} onClick={() => handleSort("point", sortState, setSortState, setSortedData, originalData)}>
                                    <th scope="col" className={`${table_sort_header_style}  !min-w-[120px] w-[300px] max-w-[450px]`} onClick={() => handleSort("point", sortState, setSortState, setSortedData, dataForSorting)}>
                                        {`Nomination Point`}
                                        {getArrowIcon("point")}
                                    </th>
                                )}

                                {columnVisibility.nomination_value && (
                                    // <th scope="col" className={`${table_sort_header_style} text-right !min-w-[120px] !max-w-[300px]`} onClick={() => handleSort("value", sortState, setSortState, setSortedData, tableDataRender)}>
                                    // <th scope="col" className={`${table_sort_header_style} text-right !min-w-[120px] !max-w-[300px]`} onClick={() => handleSort("value", sortState, setSortState, setSortedData, originalData)}>
                                    <th scope="col" className={`${table_sort_header_style} text-right !min-w-[120px] !max-w-[300px]`} onClick={() => handleSort(displayUnit == 'MMBTUD' ? "value" : "valueMmscfd", sortState, setSortState, setSortedData, dataForSorting)}>
                                        {`Nomination Value (${displayUnit})`}
                                        {getArrowIcon("value")}
                                    </th>
                                )}

                            </tr>
                        </thead>

                        <tbody>

                            {/* {tableType === 'all' && flatTimeRows?.map((row: any, index: any) => ( */}
                            {tableType === 'all' && sortedData?.map((row: any, index: any) => {
                                return (
                                    <tr key={`${row.shipper_name}-${row.time}-${index}`} className={table_row_style}>
                                        {columnVisibility.time && (
                                            <td className="px-2 py-1 text-[#464255] font-semibold w-[150px] max-w-[200px]">
                                                {row.time}
                                            </td>
                                        )}

                                        {columnVisibility.shipper_name && (
                                            <td className="px-2 py-1 text-[#464255] !min-w-[120px] w-[300px] max-w-[450px]">
                                                {row.shipper_name}
                                            </td>
                                        )}

                                        {columnVisibility.nomination_point && (
                                            <td className="px-4 py-1 text-[#464255] !min-w-[120px] w-[200px] max-w-[250px]">
                                                {row.point}
                                            </td>
                                        )}

                                        {columnVisibility.nomination_value && (
                                            <td className="px-4 py-1 text-[#464255] max-w-[300px] text-right">
                                                {/* {row.value ? formatNumberThreeDecimal(row.value) : '0.000'} */}
                                                {/* {row.value !== null && row.value !== undefined ? formatNumberThreeDecimal(row.value) : '0.000'} */}
                                                {
                                                    displayUnit == 'MMBTUD' ?
                                                    ((row.value !== null && row.value !== undefined) ? formatNumberThreeDecimal(row.value) : '')
                                                    :
                                                    ((row.valueMmscfd !== null && row.valueMmscfd !== undefined) ? formatNumberSixDecimal(row.valueMmscfd) : '')
                                                }
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

export default TableTabDetail;