import { useEffect } from "react";
import React, { useState } from 'react';
import { fillMissingUpdateByAccount, formatDateTimeSec, iconButtonClass } from '@/utils/generalFormatter';
import SupervisorAccountRoundedIcon from '@mui/icons-material/SupervisorAccountRounded';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
interface TableProps {
    tableData: any;
    isLoading?: any;
    columnVisibility?: any;
}

const TableEmailGroupForEventHistory: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility }) => {

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState<any>([]);

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
                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-1">
                    <tr className="h-9">

                        {columnVisibility.user_type && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("user_type.name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`User Type`}
                                {getArrowIcon("user_type.name")}
                            </th>
                        )}

                        {columnVisibility.group && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("group.name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Group Name`}
                                {getArrowIcon("group.name")}
                            </th>
                        )}

                        {columnVisibility.name && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Email Group Name For Event`}
                                {getArrowIcon("name")}
                            </th>
                        )}

                        {columnVisibility.person && (
                            <th scope="col" className={`${table_header_style} text-center`}>
                                {`Email`}
                            </th>
                        )}

                        {columnVisibility.update_by && (
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

                                {columnVisibility.user_type && (
                                    <td className="px-2 py-1 justify-center">
                                        {
                                            row?.user_type &&
                                            <div className="flex w-[100px] bg-[#EEE4FF] justify-center !text-[14px] font-bold rounded-full p-1" style={{ backgroundColor: row?.user_type?.color, color: row?.user_type?.color_text }}>{row?.user_type?.name}</div>
                                        }
                                    </td>
                                )}

                                {columnVisibility.group && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.group ? row?.group?.name : ''}</td>
                                )}

                                {columnVisibility.name && (
                                    <td className="px-2 py-1 text-[#464255] font-light">{row?.name}</td>
                                )}

                                {columnVisibility.person && (
                                    <td className="px-2 py-1 text-center">
                                        <div className="inline-flex items-center justify-center relative">
                                            {/* <button
                                                type="button"
                                                className="flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                                                // onClick={() => openViewModal(row)}
                                                disabled={row?.edit_email_group_for_event_match.length <= 0 && true}
                                            >
                                                <SupervisorAccountRoundedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                                            </button> */}

                                            <button
                                                type="button"
                                                className={iconButtonClass}
                                                // onClick={() => openViewModal(row)}
                                                disabled={row?.edit_email_group_for_event_match.length <= 0 && true}
                                            >
                                                <SupervisorAccountRoundedIcon
                                                    fontSize="inherit"
                                                    className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                                    sx={{ color: 'currentColor', fontSize: 18 }}
                                                />
                                            </button>
                                            <span className="px-2 text-[#464255]">
                                                {row?.edit_email_group_for_event_match?.length}
                                            </span>
                                        </div>
                                    </td>
                                )}

                                {columnVisibility.update_by && (
                                    <td className="px-2 py-1">
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

export default TableEmailGroupForEventHistory;