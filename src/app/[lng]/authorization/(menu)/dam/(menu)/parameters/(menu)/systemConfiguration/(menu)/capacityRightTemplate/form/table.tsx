import { useEffect, useRef } from "react";
import React, { FC, useState } from 'react';
import TableSkeleton, { DefaultSkeleton } from '@/components/material_custom/DefaultSkeleton';
import { formatDate, formatDateNoTime, formatNumber } from '@/utils/generalFormatter';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import BtnActionTable from "@/components/other/btnActionInTable";
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style, table_sort_header_style_original } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
interface TableProps {
    openEditForm: (id: any) => void;
    openViewForm: (id: any) => void;
    openHistoryForm: (id: any) => void;
    tableData: any;
    isLoading: any;
    columnVisibility: any;
    userPermission?: any;
}
const TableBookingTemplate: React.FC<TableProps> = ({ openEditForm, openViewForm, openHistoryForm, tableData, isLoading, columnVisibility, userPermission }) => {
     
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);
    useEffect(() => {
        if (tableData && tableData.length > 0) {
            setSortedData(tableData);
        }
        setSortedData(tableData);

    }, [tableData]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    const [openPopoverId, setOpenPopoverId] = useState(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const togglePopover = (id: any) => {
        if (openPopoverId === id) {
            setOpenPopoverId(null);
        } else {
            setOpenPopoverId(id);
        }
    };

    const toggleMenu = (mode: any, id: any) => {
        switch (mode) {
            case "view":
                openViewForm(id);
                setOpenPopoverId(null);
                break;
            case "edit":
                openEditForm(id);
                setOpenPopoverId(null);
                break;
            case "history":
                openHistoryForm(id);
                setOpenPopoverId(null);
                break;
        }
    }
    const handleClickOutside = (event: MouseEvent) => {
        if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
            setOpenPopoverId(null);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [popoverRef]);
    
    return (
        <div className={`h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md relative z-1`}>
            {
                isLoading ?
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                        <thead className="text-xs h-[44px] text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-9">

                                {columnVisibility.term && (
                                    <th
                                        scope="col"
                                        className={`${table_sort_header_style} text-center w-auto max-w-[300px]`}
                                        onClick={() => handleSort("term_type_id", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Term`}
                                        {getArrowIcon("term_type_id")}
                                    </th>
                                )}

                                {columnVisibility.file_period && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("file_period", sortState, setSortState, setSortedData, tableData)}>
                                        {`File Period`}
                                        {getArrowIcon("file_period")}
                                    </th>
                                )}

                                {columnVisibility.min && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("min", sortState, setSortState, setSortedData, tableData)}>
                                        {`Period Min`}
                                        {getArrowIcon("min")}
                                    </th>
                                )}

                                {columnVisibility.max && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("max", sortState, setSortState, setSortedData, tableData)}>
                                        {`Period Max`}
                                        {getArrowIcon("max")}
                                    </th>
                                )}

                                {columnVisibility.file_start_date && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("file_start_date_mode", sortState, setSortState, setSortedData, tableData)}>
                                        {`File Recurring Start Date`}
                                        {getArrowIcon("file_start_date_mode")}
                                    </th>
                                )}

                                {columnVisibility.shadow_time && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("shadow_time", sortState, setSortState, setSortedData, tableData)}>
                                        {`Shadow Time`}
                                        {getArrowIcon("shadow_time")}
                                    </th>
                                )}

                                {/* {columnVisibility.shadow_period && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("shadow_period", sortState, setSortState, setSortedData, tableData)}>
                                        {`Shadow Period`}
                                        {getArrowIcon("shadow_period")}
                                    </th>
                                )} */}

                                {columnVisibility.unit && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("file_start_date_mode", sortState, setSortState, setSortedData, tableData)}>
                                        {`Unit`}
                                        {getArrowIcon("file_start_date_mode")}
                                    </th>
                                )}

                                {columnVisibility.start_date && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("start_date", sortState, setSortState, setSortedData, tableData)}>
                                        {`Start Date`}
                                        {getArrowIcon("start_date")}
                                    </th>
                                )}

                                {columnVisibility.end_date && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("end_date", sortState, setSortState, setSortedData, tableData)}>
                                        {`End Date`}
                                        {getArrowIcon("end_date")}
                                    </th>
                                )}

                                {columnVisibility.action && (
                                    <th scope="col" className={`${table_header_style} text-center`}>
                                        {`Action`}
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
                                        {/* "file_period_mode": 1,  // 1 = วัน, 2 = เดือน, 3 = ปี
                                        "file_start_date_mode": 2, // 1 = every day, 2 = fix day, 3 = to day+ */}

                                        {/* <td className="px-2 py-1 ">
                                            {row?.term_type && <div className="flex w-[140px] !text-[14px] items-center justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.term_type?.color }}>{`${row?.term_type?.name}`}</div>}
                                        </td> */}

                                        {columnVisibility.term && (
                                            <td className="h-full pl-2 py-1 text-center">
                                                {row?.term_type && (
                                                    <div className="flex items-center justify-center">
                                                        <div
                                                            className="flex w-[90%] min-w-[150px] max-w-[200px] !text-[14px] items-center justify-center rounded-full p-1 text-[#464255]"
                                                            style={{ backgroundColor: row?.term_type?.color }}
                                                        >
                                                            {`${row?.term_type?.name}`}
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        )}

                                        {columnVisibility.file_period && (
                                            <td className="px-2 py-1 text-[#464255]">
                                                {
                                                    row?.file_period_mode == 1 ? // 1 = วัน
                                                        // <div>{`${row?.file_period} Day${row?.file_period !== 1 && 's'}`}</div>
                                                        <div>{`Day${row?.file_period !== 1 && 's'}`}</div>
                                                        : row?.file_period_mode == 2 ? // 2 = เดือน
                                                            // <div>{`${row?.file_period} Month${row?.file_period !== 1 && 's'}`}</div>
                                                            <div>{`Month${row?.file_period !== 1 && 's'}`}</div>
                                                            : // 3 = ปี
                                                            // <div>{`${row?.file_period} Year${row?.file_period !== 1 && 's'}`}</div>
                                                            <div>{`Year${row?.file_period !== 1 && 's'}`}</div>
                                                }
                                            </td>
                                        )}

                                        {columnVisibility.min && (
                                            <td className="px-5 py-1 text-[#464255] text-start">{row?.min ? row?.min : ''}</td>
                                        )}

                                        {columnVisibility.max && (
                                            <td className="px-5 py-1 text-[#464255] text-start">{row?.max ? row?.max : ''}</td>
                                        )}

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
                                            <td className="px-2 py-1 text-[#464255] text-right">{row?.shadow_time ? row?.shadow_time : '0'}</td>
                                        )}

                                        {/* {columnVisibility.shadow_period && (
                                            <td className="px-2 py-1 text-[#464255] text-right">{row?.shadow_period ? row?.shadow_period : ''}</td>
                                        )} */}

                                        {/* 
                                            การแสดงผล unit
                                            file_start_date_mode: 1, 3 แสดง Days
                                            file_start_date_mode: 2 แสดง Months
                                        */}
                                        {columnVisibility.unit && (
                                            <td className="pl-2 py-1 text-center text-[#464255] ">
                                                {(row?.term_type_id === 4) ? <span>Days</span> : (row?.term_type_id < 4) ? <span>Months</span> : <span></span>}
                                            </td>
                                        )}

                                        {columnVisibility.start_date && (
                                            <td className="px-2 py-1 text-[#464255] text-center">{row?.start_date ? formatDateNoTime(row?.start_date) : ''}</td>
                                        )}

                                        {columnVisibility.end_date && (
                                            <td className="px-2 py-1 text-[#0DA2A2] text-center">{row?.end_date ? formatDateNoTime(row?.end_date) : ''}</td>
                                        )}

                                        {columnVisibility.action && (
                                            <td className="px-2 py-1">
                                                {/* <div className="relative inline-block text-left "> */}
                                                <div className="relative inline-flex justify-center items-center w-full">
                                                    <BtnActionTable togglePopover={togglePopover} row_id={row?.id} disable={!userPermission?.f_view && !userPermission?.f_edit ? true : false} />
                                                    {openPopoverId === row?.id && (
                                                        <div ref={popoverRef}
                                                            className="absolute left-[-9rem] top-[-10px] mt-2 w-36 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                                                            <ul className="py-2">
                                                                {
                                                                    userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("view", row?.id) }}><RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`View`}</li>
                                                                }
                                                                {
                                                                    userPermission?.f_edit && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("edit", row?.id) }}><EditOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Edit`}</li>
                                                                } 
                                                                {
                                                                    userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("history", row?.id) }}><RestoreOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`History`}</li>
                                                                }
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
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

export default TableBookingTemplate;