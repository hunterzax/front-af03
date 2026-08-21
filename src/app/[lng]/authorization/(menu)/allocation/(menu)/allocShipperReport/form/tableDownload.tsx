import { useEffect } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { exportCyberpunk4, exportCyberpunk4_2, formatDate, iconButtonClass, toDayjs } from "@/utils/generalFormatter";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { handleSort } from "@/utils/sortTable";

interface TableProps {
    tableData: any;
    isLoading: any;
    columnVisibility?: any
    userPermission?: any
}

const TableDownload: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility, userPermission }) => {

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);

    useEffect(() => {
        if (tableData && tableData.length > 0) {
            setSortedData(tableData);
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

    const downloadFile = async (data: any) => {
        const data_to_export = JSON.parse(data.jsonData)
        // exportCyberpunk(data_to_export)
        // exportCyberpunk2(data_to_export)
        // exportCyberpunk3(data_to_export)
        exportCyberpunk4_2(data_to_export, data)
    };

    return (
        <div className="h-[calc(100vh-380px)] overflow-y-auto overflow-x-auto rounded-t-md">
            {/* <table className="min-w-full text-sm text-left rtl:text-right text-gray-500 whitespace-nowrap"> */}
            {
                isLoading ?
                    <table className="table-auto min-w-full text-sm rtl:text-right text-gray-500 whitespace-nowrap">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-9">

                                {columnVisibility?.gas_day_from && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} text-left`}
                                        onClick={() => handleSort("gas_day_from", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Gas Day From`}
                                        {getArrowIcon("gas_day_from")}
                                    </th>
                                )}

                                {columnVisibility?.gas_day_to && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} text-left`}
                                        onClick={() => handleSort("gas_day_to", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Gas Day To`}
                                        {getArrowIcon("gas_day_to")}
                                    </th>
                                )}

                                {columnVisibility?.file && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} text-left`}
                                        onClick={() => handleSort("file", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`File`}
                                        {getArrowIcon("file")}
                                    </th>
                                )}

                                {columnVisibility.approved_by && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} text-left`}
                                        onClick={() => handleSort("create_by_account.first_name", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Approved by`}
                                        {getArrowIcon("create_by_account.first_name")}
                                    </th>
                                )}

                                {columnVisibility.download && (
                                    <th scope="col" className="px-2 py-1 text-center">
                                        {`Download`}
                                    </th>
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {sortedData && sortedData.map((row: any, index: any) => (
                                <tr
                                    key={row?.id}
                                    // className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} h-12`}
                                    className={`${table_row_style}`}
                                >

                                    {columnVisibility?.gas_day_from && (
                                        <td className="px-2 py-1 text-[#464255]">{row?.gas_day_from ? toDayjs(row?.gas_day_from, "YYYY-MM-DD").format("DD/MM/YYYY") : ''}</td>
                                    )}

                                    {columnVisibility?.gas_day_to && (
                                        <td className="px-2 py-1 text-[#464255]">{row?.gas_day_to ? toDayjs(row?.gas_day_to, "YYYY-MM-DD").format("DD/MM/YYYY") : ''}</td>
                                    )}

                                    {columnVisibility?.file && (
                                        <td className="px-2 py-1 text-[#464255]">
                                            {row?.file ? <><InsertDriveFileOutlinedIcon sx={{ fontSize: '20px' }} /> {row?.file}</> : ''}
                                        </td>
                                    )}

                                    {columnVisibility.approved_by && (
                                        <td className="px-2 py-1 text-[#464255]">
                                            <div>
                                                <span className="text-[#464255]">{row?.create_by_account?.first_name} {row?.create_by_account?.last_name}</span>
                                                <div className="text-gray-500 text-xs">{formatDate(row?.create_date)}</div>
                                            </div>
                                        </td>
                                    )}

                                    {columnVisibility.download && (
                                        <td className="px-2 py-1 text-center justify-center">
                                            <div className="inline-flex items-center justify-center relative">

                                                {/* <button
                                                    type="button"
                                                    className={`flex items-center justify-center px-[2px] py-[2px] border border-[#EAECF0] rounded-md hover:bg-[#DFE4EA] hover:border hover:border-[#DFE4EA] relative `}
                                                    onClick={() => downloadFile(row)}
                                                // disabled={!canDownload}
                                                >
                                                    <FileDownloadIcon sx={{ fontSize: 20, color: '#1473A1' }} />
                                                </button> */}

                                                <button
                                                    type="button"
                                                    className={iconButtonClass}
                                                    onClick={() => downloadFile(row)}
                                                >
                                                    <FileDownloadIcon
                                                        fontSize="inherit"
                                                        className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                                        sx={{ color: 'currentColor', fontSize: 18 }}
                                                    />
                                                </button>
                                            </div>
                                        </td>
                                    )}

                                </tr>
                            ))}
                        </tbody>
                    </table>
                    :
                    <TableSkeleton />
            }
        </div>
    )
}

export default TableDownload;