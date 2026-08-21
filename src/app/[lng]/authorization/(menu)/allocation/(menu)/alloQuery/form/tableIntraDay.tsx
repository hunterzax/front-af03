import { useEffect } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { formatNumberThreeDecimal, toDayjs } from "@/utils/generalFormatter";
import { handleSort } from "@/utils/sortTable";

interface TableProps {
    openEditForm?: (id: any) => void;
    openViewForm?: (id: any) => void;
    tableData: any;
    isLoading: any;
    columnVisibility?: any;
}

const TableIntraDay: React.FC<TableProps> = ({ openEditForm, openViewForm, tableData, isLoading, columnVisibility }) => {

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    useEffect(() => {
        if (tableData?.length > 0) {
            setSortedData(tableData);
        } else {
            setSortedData([]);
        }
    }, [tableData])

    return (
        <div className="h-[calc(100vh-380px)] overflow-y-auto overflow-x-auto rounded-t-md">
            {
                isLoading ?
                    <table className="table-auto min-w-full text-sm rtl:text-right text-gray-500 whitespace-nowrap">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-9">
                                {columnVisibility?.entryexit && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("entry_exit_obj.name", sortState, setSortState, setSortedData, tableData)}>
                                        {`Entry / Exit`}
                                        {getArrowIcon("entry_exit_obj.name")}
                                    </th>
                                )}

                                {columnVisibility?.gas_day && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("gas_day", sortState, setSortState, setSortedData, tableData)}>
                                        {`Gas Day`}
                                        {getArrowIcon("gas_day")}
                                    </th>
                                )}

                                {columnVisibility?.gas_hour && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("gas_hour", sortState, setSortState, setSortedData, tableData)}>
                                        {`Gas Hour`}
                                        {getArrowIcon("gas_hour")}
                                    </th>
                                )}

                                {columnVisibility?.shipper && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("shipper", sortState, setSortState, setSortedData, tableData)}>
                                        {`Shipper Name`}
                                        {getArrowIcon("shipper")}
                                    </th>
                                )}

                                {columnVisibility?.contract && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("contract", sortState, setSortState, setSortedData, tableData)}>
                                        {`Contract Code`}
                                        {getArrowIcon("contract")}
                                    </th>
                                )}

                                {columnVisibility?.nompoint && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("point", sortState, setSortState, setSortedData, tableData)}>
                                        {`Nomination Point / Concept Point`}
                                        {getArrowIcon("point")}
                                    </th>
                                )}

                                {columnVisibility?.nominatedval && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("nominationValue", sortState, setSortState, setSortedData, tableData)}>
                                        {`Nominated Value (MMBTU/D)`}
                                        {getArrowIcon("nominationValue")}
                                    </th>
                                )}

                                {columnVisibility?.system_allo && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("systemAllocation", sortState, setSortState, setSortedData, tableData)}>
                                        {`System Allocation (MMBTU/D)`}
                                        {getArrowIcon("systemAllocation")}
                                    </th>
                                )}

                                {columnVisibility?.timestamp && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("execute_timestamp", sortState, setSortState, setSortedData, tableData)}>
                                        {`Timestamp`}
                                        {getArrowIcon("execute_timestamp")}
                                    </th>
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {sortedData && sortedData?.map((row: any, key: any) => {
                                return (
                                    <tr
                                        key={key}
                                        className={`${table_row_style}`}
                                    >
                                        {columnVisibility?.entryexit && (
                                            <td className="px-2 py-1 text-[#464255]">
                                                <div className="flex items-center justify-center">
                                                    {
                                                        row?.entry_exit_obj?.name ?
                                                            <div
                                                                className="w-[120px] p-1 text-center rounded-[50px]"
                                                                style={{ background: row?.entry_exit_obj ? row?.entry_exit_obj?.color : '#FFF1CE' }}>
                                                                {row?.entry_exit_obj && row?.entry_exit_obj?.name}
                                                            </div>
                                                            : null
                                                    }
                                                </div>
                                            </td>
                                        )}

                                        {columnVisibility?.gas_day && (
                                            <td className="px-2 py-1 text-[#464255] ">
                                                {/* <div>{row?.checkDb ? row?.checkDb?.gas_day_text : null}</div> */}
                                                <div>{row?.gas_day ? toDayjs(row?.gas_day).format('DD/MM/YYYY') : null}</div>
                                            </td>
                                        )}

                                        {columnVisibility?.gas_hour && (
                                            <td className="px-2 py-1 text-[#464255] text-center">
                                                <div>{row?.gas_hour ? row?.gas_hour + ":00" : null}</div>
                                            </td>
                                        )}

                                        {columnVisibility?.shipper && (
                                            <td className="px-2 py-1 text-[#464255]">
                                                <div>{row?.group ? row?.group?.name : null}</div>
                                            </td>
                                        )}

                                        {columnVisibility?.contract && (
                                            <td className="px-2 py-1 text-[#464255] text-center">
                                                <div>{row?.contract ? row?.contract : null}</div>
                                            </td>
                                        )}

                                        {columnVisibility?.nompoint && (
                                            <td className="px-2 py-1 text-[#464255]">
                                                <div>{row?.point ? row?.point : null}</div>
                                            </td>
                                        )}

                                        {columnVisibility?.nominatedval && (
                                            <td className="px-2 py-1 text-[#464255]">
                                                {/* <div className="text-right">{row?.nominationValue ? formatNumberThreeDecimal(row?.nominationValue) : null}</div> */}
                                                <div className="text-right">{row?.nominationValue !== null && row?.nominationValue !== undefined ? formatNumberThreeDecimal(row?.nominationValue) : null}</div>
                                            </td>
                                        )}

                                        {columnVisibility?.system_allo && (
                                            <td className="px-2 py-1 text-[#464255]">
                                                {/* <div className="text-right">{row?.systemAllocation ? formatNumberThreeDecimal(row?.systemAllocation) : null}</div> */}
                                                <div className="text-right">{row?.systemAllocation !== null && row?.systemAllocation !== undefined ? formatNumberThreeDecimal(row?.systemAllocation) : null}</div>
                                            </td>
                                        )}

                                        {columnVisibility?.timestamp && (
                                            <td className="px-2 py-1 text-[#464255]">
                                                <div>{row?.execute_timestamp ? toDayjs(row?.execute_timestamp * 1000).format('DD/MM/YYYY HH:mm') : null}</div>
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

export default TableIntraDay;