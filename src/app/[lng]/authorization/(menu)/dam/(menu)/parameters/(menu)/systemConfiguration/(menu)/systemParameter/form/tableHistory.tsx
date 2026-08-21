import { useEffect } from "react";
import React, { FC, useState } from 'react';
import { fillMissingUpdateByAccount, formatDate, formatDateNoTime, formatDateTimeSec, formatNumber, formatNumberFourDecimalNoComma, formatNumberFourDecimalNom } from '@/utils/generalFormatter';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
// import { table_col_arrow_sort_style, table_header_style, table_sort_header_style } from "@/utils/styles";
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style, table_sort_header_style_original } from "@/utils/styles";

import { handleSort } from "@/utils/sortTable";
interface TableProps {
    tableData: any;
    isLoading?: any;
    columnVisibility?: any;
}

const TableSystemParamHistory: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility }) => {

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

    //  

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    const openInNewTab = (url: string) => {
        if (url && url.trim() !== "") {
            const validUrl = url.startsWith('http://') || url.startsWith('https://')
                ? url : `https://${url}`;

            window.open(validUrl, '_blank');
        } else {
            // The file URL is not valid or unavailable.
        }
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

                        {columnVisibility.system_parameter && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("system_parameter_id", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`System Parameter`}
                                {getArrowIcon("system_parameter_id")}
                            </th>
                        )}

                        {columnVisibility.value && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("value", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Value`}
                                {getArrowIcon("value")}
                            </th>
                        )}

                        {columnVisibility.link && (
                            <th scope="col" className={`${table_header_style} text-center`}>
                                {`Link`}
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

                    </tr>
                </thead>

                <tbody>
                    {sortedData && sortedData?.map((row: any, index: any) => {
                        return (
                            <tr
                                key={row?.id}
                                className={`${table_row_style}`}
                            >
                                {columnVisibility.module && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.menus && row?.menus?.name}</td>
                                )}

                                {columnVisibility.system_parameter && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.system_parameter && row?.system_parameter?.name}</td>
                                )}

                                {columnVisibility.value && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.value && formatNumberFourDecimalNom(row?.value)}</td>
                                )}

                                {columnVisibility.link && (
                                    <td className="px-2 py-1 text-center justify-center">
                                        <div className="inline-flex items-center justify-center relative">
                                            <button
                                                type="button"
                                                disabled={row?.link ? false : true}
                                                className={`flex items-center justify-center px-[2px] py-[2px] border  ${row?.link ? 'border-[#A6CE39]' : 'border-[#9CA3AF80]'} rounded-md hover:bg-[#DFE4EA] hover:border hover:border-[#DFE4EA] relative`}
                                                onClick={() => openInNewTab(row?.link)}
                                            >
                                                <OpenInNewOutlinedIcon sx={{ fontSize: 18, color: row?.link ? '#A6CE39' : '#9CA3AF' }} />
                                            </button>
                                        </div>
                                    </td>
                                )}

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

export default TableSystemParamHistory;