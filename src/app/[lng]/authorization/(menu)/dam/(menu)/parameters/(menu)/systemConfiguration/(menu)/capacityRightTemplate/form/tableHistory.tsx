import { useEffect } from "react";
import React, { FC, useState } from 'react';
import { fillMissingUpdateByAccount, formatDate, formatDateNoTime, formatDateTimeSec, formatNumber } from '@/utils/generalFormatter';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_sort_header_style, table_sort_header_style_original } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
interface TableProps {
    tableData: any;
    isLoading?: any;
    columnVisibility?: any;
}

const TableBookingTemplateHistory: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility }) => {
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


    // { key: 'term', label: 'Term', visible: true },
    // { key: 'file_period', label: 'File Period', visible: true },
    // { key: 'min', label: 'Period Min', visible: true },
    // { key: 'max', label: 'Period Max', visible: true },
    // { key: 'file_start_date', label: 'File Recurring Start Date', visible: true },
    // { key: 'shadow_time', label: 'Shadow Time', visible: true },
    // { key: 'unit', label: 'Unit', visible: true },
    // { key: 'start_date', label: 'Start Date', visible: true },
    // { key: 'end_date', label: 'End Date', visible: true },
    // { key: 'updated_by', label: 'Updated by', visible: true },

    return (
        <div className={`h-[calc(100vh-500px)] overflow-y-auto block  rounded-t-md relative z-1`}>

            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs h-[44px] text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                    <tr className="h-9">

                        {columnVisibility.term && (
                            <th
                                scope="col"
                                className={`${table_sort_header_style} text-center`}
                                onClick={() => handleSort("term_type_id", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}
                            >
                                {`Term`}
                                {getArrowIcon("term_type_id")}
                            </th>
                        )}

                        {columnVisibility.file_period && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("file_period", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`File Period`}
                                {getArrowIcon("file_period")}
                            </th>
                        )}

                        {columnVisibility.min && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("min", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Period Min`}
                                {getArrowIcon("min")}
                            </th>
                        )}

                        {columnVisibility.max && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("max", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Period Max`}
                                {getArrowIcon("max")}
                            </th>
                        )}

                        {columnVisibility.file_start_date && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("file_start_date_mode", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`File Recurring Start Date`}
                                {getArrowIcon("file_start_date_mode")}
                            </th>
                        )}

                        {columnVisibility.shadow_time && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("shadow_time", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Shadow Time`}
                                {getArrowIcon("shadow_time")}
                            </th>
                        )}

                        {columnVisibility.unit && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("unit", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Unit`}
                                {getArrowIcon("unit")}
                            </th>
                        )}

                        {/* {columnVisibility.shadow_period && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("shadow_period", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Shadow Period`}
                                {getArrowIcon("shadow_period")}
                            </th>
                        )} */}

                        {columnVisibility.start_date && (
                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("start_date", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Start Date`}
                                {getArrowIcon("start_date")}
                            </th>
                        )}

                        {columnVisibility.end_date && (
                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("end_date", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
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
                                // className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} h-12`} // สลับสี row
                                className={`border-b bg-white h-12`}
                            >

                                {columnVisibility.term && (
                                    <td className="pl-2 py-1 text-center">
                                        <div className="flex justify-center items-center max-w-[200px] ">
                                            {row?.term_type &&
                                                <div className="flex min-w-[180px] justify-center text-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.term_type?.color }}>
                                                    {`${row?.term_type?.name}`}
                                                </div>
                                            }
                                        </div>
                                    </td>
                                )}

                                {columnVisibility.file_period && (
                                    <td className="px-2 py-1 text-[#464255]">
                                        {
                                            row?.file_period_mode == 1 ? // 1 = วัน
                                                <div>{`${row?.file_period ? row?.file_period : ''} Day${row?.file_period !== 1 && 's'}`}</div>
                                                : row?.file_period_mode == 2 ? // 2 = เดือน
                                                    <div>{`${row?.file_period ? row?.file_period : ''} Month${row?.file_period !== 1 && 's'}`}</div>
                                                    : // 3 = ปี
                                                    <div>{`${row?.file_period ? row?.file_period : ''} Year${row?.file_period !== 1 && 's'}`}</div>
                                        }
                                    </td>
                                )}


                                {columnVisibility.min && (
                                    <td className="px-5 py-1 text-[#464255] text-start">{row?.min ? row?.min : <span></span>}</td>
                                )}

                                {columnVisibility.max && (
                                    <td className="px-5 py-1 text-[#464255] text-start">{row?.max ? row?.max : <span></span>}</td>
                                )}

                                {/* {columnVisibility.file_start_date && (
                                    <td className="px-2 py-1 text-[#464255]">
                                        {
                                            row?.file_start_date_mode == 1 ? // 1 = every day
                                                <div>{`Every Day`}</div>
                                                : row?.file_start_date_mode == 2 ? // 2 = fix day
                                                    <div>{`Fix Day ${row?.fixdayday} Day`}</div>
                                                    : // 3 = to day+
                                                    <div>{`Today + ${row?.todayday} Day`}</div>
                                        }
                                    </td>
                                )} */}

                                {/* R : v1.0.90 ปรับ wording จาก "Fix day 1 day" เป็น "Fix date 1" ทั้งใน modal และ List https://app.clickup.com/t/86err0d6f */}
                                {columnVisibility.file_start_date && (
                                    <td className="px-2 py-1 text-[#464255]">
                                        {
                                            row?.file_start_date_mode == 1 ? // 1 = every day
                                                <div>{`Every Day`}</div>
                                                : row?.file_start_date_mode == 2 ? // 2 = fix day
                                                    // <div>{`Fix Day ${row?.fixdayday} Day`}</div>
                                                    <div>{`Fix Date ${row?.fixdayday}`}</div> // v1.0.90 ปรับ wording จาก "Fix day 1 day" เป็น "Fix date 1" ทั้งใน modal และ List https://app.clickup.com/t/86err0d6f
                                                    : // 3 = to day+
                                                    <div>{`Today + ${row?.todayday} Day`}</div>
                                        }
                                    </td>
                                )}

                                {columnVisibility.shadow_time && (
                                    // <td className="px-2 py-1 text-[#464255] text-right">{row?.shadow_time || '0'}</td>
                                    <td className="px-2 py-1 text-[#464255] text-right">{row?.shadow_time ? row?.shadow_time : '0'}</td>
                                )}

                                {/* {columnVisibility.shadow_period && (
                                    <td className="px-2 py-1 text-[#464255] text-right">{row?.shadow_period ? row?.shadow_period : ''}</td>
                                )} */}
                                {columnVisibility.unit && (
                                    <td className="px-2 py-1 text-[#464255] text-center">
                                        {(row?.term_type_id === 4) ? <span>Days</span> : (row?.term_type_id < 4) ? <span>Months</span> : <span></span>}
                                    </td>
                                )}

                                {columnVisibility.start_date && (
                                    <td className="px-2 py-1 text-[#464255] text-center">{row?.start_date ? formatDateNoTime(row?.start_date) : <span></span>}</td>
                                )}

                                {columnVisibility.end_date && (
                                    <td className="px-2 py-1 text-[#0DA2A2] text-center">{row?.end_date ? formatDateNoTime(row?.end_date) : <span></span>}</td>
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

export default TableBookingTemplateHistory;