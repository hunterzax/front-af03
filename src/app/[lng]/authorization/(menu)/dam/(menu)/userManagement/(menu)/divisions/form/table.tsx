import { useEffect } from "react";
import React, { useState } from 'react';
import TableSkeleton from "@/components/material_custom/DefaultSkeleton";
import { formatDate } from "@/utils/generalFormatter";
import { table_col_arrow_sort_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface TableProps {
    dataTable: any;
    isLoading: any;
    columnVisibility?: any;
}

const TableDivision: React.FC<TableProps> = ({ dataTable, isLoading, columnVisibility }) => {
     
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(dataTable);
    useEffect(() => {
        if (dataTable && dataTable.length > 0) {
            setSortedData(dataTable);
        }else{
            setSortedData([]);
        }
    }, [dataTable]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    return (
        <div className="h-[calc(100vh-380px)] overflow-y-auto overflow-x-auto rounded-t-md">
            {
                isLoading ?
                    <table className="min-w-full text-sm text-left rtl:text-right text-gray-500 whitespace-nowrap relative z-1">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-9">
             
                                {columnVisibility.division_id && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("division_id", sortState, setSortState, setSortedData, dataTable)}>
                                        {`Division ID`}
                                        {getArrowIcon("division_id")}
                                    </th>
                                )}

                                {columnVisibility.division_name && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("division_name", sortState, setSortState, setSortedData, dataTable)}>
                                        {`Division Name`}
                                        {getArrowIcon("division_name")}
                                    </th>
                                )}

                                {columnVisibility.division_short_name && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("division_short_name", sortState, setSortState, setSortedData, dataTable)}>
                                        {`Division Short Name`}
                                        {getArrowIcon("division_short_name")}
                                    </th>
                                )}

                                {columnVisibility.create_date && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("create_date", sortState, setSortState, setSortedData, dataTable)}>
                                        {`Create Date`}
                                        {getArrowIcon("create_date")}
                                    </th>
                                )}

                            </tr>
                        </thead>

                        <tbody>
                            {
                                sortedData && sortedData?.map((row: any, index: any) => (
                                    <tr
                                        key={row?.id}
                                        className={`${table_row_style}`}
                                    >

                                        {columnVisibility.division_id && (
                                            <td className="px-2 py-1 text-[#464255]">{row?.division_id}</td>
                                        )}

                                        {columnVisibility.division_name && (
                                            <td className="px-2 py-1 text-[#464255]">{row?.division_name}</td>
                                        )}

                                        {columnVisibility.division_short_name && (
                                            <td className="px-2 py-1 text-[#464255]">{row?.division_short_name}</td>
                                        )}

                                        {columnVisibility.create_date && (
                                            <td className="px-2 py-1 text-[#464255]">
                                                <div>
                                                    <span className="text-[#464255]">{formatDate(row?.create_date)}</span>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                    :
                    <TableSkeleton />
            }
        </div>
    )
}

export default TableDivision;