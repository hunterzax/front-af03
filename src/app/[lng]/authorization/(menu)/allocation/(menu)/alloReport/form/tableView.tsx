import { useEffect } from "react";
import React, { useState } from 'react';
import { formatDateNoTime, formatNumberFourDecimal, toDayjs } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";

interface TableProps {
    tableData: any;
    isLoading?: any;
    columnVisibility?: any;
}

const TableViewAllocReport: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility }) => {

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState<any>([]);

    useEffect(() => {
        setSortedData(tableData);
    }, [tableData]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    return (
        <div className={`h-[calc(100vh-450px)] overflow-y-auto block  rounded-t-md relative z-1`}>
            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                    <tr className="h-9">

                        {columnVisibility.entry_exit && (
                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("entry_exit_obj.name", sortState, setSortState, setSortedData, tableData)}>
                                {`Entry / Exit`}
                                {getArrowIcon("entry_exit_obj.name")}
                            </th>
                        )}

                        {columnVisibility.gas_day && (
                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("gas_day", sortState, setSortState, setSortedData, tableData)}>
                                {`Gas Day`}
                                {getArrowIcon("gas_day")}
                            </th>
                        )}

                        {columnVisibility.timestamp && (
                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("execute_timestamp", sortState, setSortState, setSortedData, tableData)}>
                                {`Timestamp`}
                                {getArrowIcon("execute_timestamp")}
                            </th>
                        )}

                        {columnVisibility.nomination_point_concept_point && (
                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("point", sortState, setSortState, setSortedData, tableData)}>
                                {`Nomination Point/Concept Point`}
                                {getArrowIcon("point")}
                            </th>
                        )}

                        {/* View : List เอา Column Capacity Right ออก https://app.clickup.com/t/86eub6dbq */}
                        {/* {columnVisibility.capacity_right && (
                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("contractCapacity", sortState, setSortState, setSortedData, tableData)}>
                                {`Capacity Right (MMBTU/D)`}
                                {getArrowIcon("contractCapacity")}
                            </th>
                        )} */}

                        {columnVisibility.nominated_value && (
                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("nominationValue", sortState, setSortState, setSortedData, tableData)}>
                                {`Nominated Value (MMBTU/D)`}
                                {getArrowIcon("nominationValue")}
                            </th>
                        )}

                        {columnVisibility.system_allocation && (
                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("allocatedValue", sortState, setSortState, setSortedData, tableData)}>
                                {`System Allocation (MMBTU/D)`}
                                {getArrowIcon("allocatedValue")}
                            </th>
                        )}

                    </tr>
                </thead>

                <tbody>
                    {sortedData?.length > 0 && sortedData?.map((row: any, index: any) => {
                        return (
                            <tr
                                key={row?.id + '_' + index}
                                className={`${table_row_style}`}
                            >
                                {columnVisibility.entry_exit && (
                                    <td className="px-2 py-1  justify-center ">{row?.entry_exit_obj && <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.entry_exit_obj?.color }}>{`${row?.entry_exit_obj?.name}`}</div>}</td>
                                )}

                                {columnVisibility.gas_day && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.gas_day ? formatDateNoTime(row?.gas_day) : ''}</td>
                                )}

                                {columnVisibility?.timestamp && (
                                    <td className="px-2 py-1 text-[#464255] min-w-[150px]">
                                        <div>{row?.execute_timestamp ? toDayjs(row?.execute_timestamp * 1000).format('DD/MM/YYYY HH:mm') : null}</div>
                                    </td>
                                )}

                                {columnVisibility.nomination_point_concept_point && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.point ? row?.point : ''}</td>
                                )}

                                {/* View : List เอา Column Capacity Right ออก https://app.clickup.com/t/86eub6dbq */}
                                {/* {columnVisibility?.capacity_right && (
                                    <td className="px-2 py-1 text-[#464255] text-right">
                                        <div>{row?.contractCapacity ? formatNumberFourDecimal(row?.contractCapacity) : null}</div>
                                    </td>
                                )} */}

                                {columnVisibility?.nominated_value && (
                                    <td className="px-2 py-1 text-[#464255] text-right">
                                        <div>{(row?.nominationValue || row?.nominationValue == 0) ? formatNumberFourDecimal(row?.nominationValue) : null}</div>
                                    </td>
                                )}

                                {columnVisibility?.system_allocation && (
                                    <td className="px-2 py-1 text-[#464255] text-right">
                                        <div>{(row?.allocatedValue || row?.allocatedValue == 0) ? formatNumberFourDecimal(row?.allocatedValue) : null}</div>
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

export default TableViewAllocReport;