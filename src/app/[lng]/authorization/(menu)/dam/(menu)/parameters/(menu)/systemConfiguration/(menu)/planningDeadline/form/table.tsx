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
const TablePlanDeadline: React.FC<TableProps> = ({ openEditForm, openViewForm, openHistoryForm, tableData, isLoading, columnVisibility, userPermission }) => {

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
            setOpenPopoverId(null); // Close the popover if it's already open
        } else {
            setOpenPopoverId(id); // Open the popover for the clicked row
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
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-9">
                                {columnVisibility.type && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("term_type_id", sortState, setSortState, setSortedData, tableData)}  >
                                        {`Term`}
                                        {getArrowIcon("term_type_id")}
                                    </th>
                                )}

                                {/* {columnVisibility.hour && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("hour", sortState, setSortState, setSortedData, tableData)} >
                                        {`Hour`}
                                        {getArrowIcon("hour")}
                                    </th>
                                )}

                                {columnVisibility.day && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("day", sortState, setSortState, setSortedData, tableData)} >
                                        {`Day`}
                                        {getArrowIcon("day")}
                                    </th>
                                )} */}

                                {columnVisibility.hour && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("custom_endtime", sortState, setSortState, setSortedData, tableData)} >
                                        {`End Time`}
                                        {getArrowIcon("custom_endtime")}
                                    </th>
                                )}

                                {columnVisibility.day && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("day", sortState, setSortState, setSortedData, tableData)} >
                                        {`Date of Month`}
                                        {getArrowIcon("day")}
                                    </th>
                                )}

                                {columnVisibility.before_month && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("before_month", sortState, setSortState, setSortedData, tableData)} >
                                        {`Before Month`}
                                        {getArrowIcon("before_month")}
                                    </th>
                                )}

                                {columnVisibility.start_date && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("start_date", sortState, setSortState, setSortedData, tableData)} >
                                        {`Start Date`}
                                        {getArrowIcon("start_date")}
                                    </th>
                                )}

                                {columnVisibility.end_date && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("end_date", sortState, setSortState, setSortedData, tableData)} >
                                        {`End Date`}
                                        {getArrowIcon("end_date")}
                                    </th>
                                )}
                                {/* <th scope="col" className="whitespace-nowrap px-2 py-1">
                                    {`Created by`}
                                </th> */}
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
                                        {/* <td className="px-2 py-1 text-[#464255]">{row?.term_type?.name}</td> */}
                                        {columnVisibility.type && (
                                            <td className="px-2 py-1">
                                                {row?.term_type && 
                                                <div className="flex w-full h-ful justify-center items-center">
                                                    <div className="flex w-[130px] justify-center rounded-full p-1 text-[#464255]" 
                                                        style={{ backgroundColor: row?.term_type?.color }}
                                                    >
                                                        {`${row?.term_type?.name}`}
                                                    </div>
                                                </div>
                                                }
                                            </td>
                                        )}

                                        {columnVisibility.hour && (
                                            <td className="px-2 py-1 text-[#464255] text-center">
                                                {/* {row?.hour !== undefined && String(row?.hour).padStart(2, '0')}
                                                {`:`}
                                                {row?.minute !== undefined && String(row?.minute).padStart(2, '0')} */}
                                                {row?.custom_endtime} {/* /ใช้สำหรับ custom end time ในการ sort */}
                                            </td>
                                        )}

                                        {columnVisibility.day && (
                                            <td className="px-2 py-1 text-[#464255]">{row?.day}</td>
                                        )}

                                        {columnVisibility.before_month && (
                                            <td className="px-2 py-1 text-[#464255]">{row?.before_month}</td>
                                        )}

                                        {/* <td className="px-2 py-1 text-right text-[#464255]">{formatNumber(row?.area_nominal_capacity)}</td> */}
                                        {columnVisibility.start_date && (
                                            <td className="px-2 py-1 text-[#464255]">{row?.start_date ? formatDateNoTime(row?.start_date) : ''}</td>
                                        )}

                                        {columnVisibility.end_date && (
                                            <td className="px-2 py-1 text-[#0DA2A2]">{row?.end_date ? formatDateNoTime(row?.end_date) : ''}</td>
                                        )}

                                        {columnVisibility.action && (
                                            <td className="px-2 py-1">
                                                {/* <div className="relative inline-block text-left "> */}
                                                <div className="relative inline-flex justify-center items-center w-full">
                                                    <BtnActionTable togglePopover={togglePopover} row_id={row?.id} disable={!userPermission?.f_view && !userPermission?.f_edit ? true : false} />
                                                    {openPopoverId === row?.id && (
                                                        <div ref={popoverRef} className="absolute left-[-8rem] top-[-10px] mt-2 w-36 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
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

export default TablePlanDeadline;