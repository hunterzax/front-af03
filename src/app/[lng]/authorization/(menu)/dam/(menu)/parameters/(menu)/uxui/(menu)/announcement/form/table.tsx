import { useEffect, useRef } from "react";
import React, { FC, useState } from 'react';
import TableSkeleton, { DefaultSkeleton } from '@/components/material_custom/DefaultSkeleton';
import { formatDate, formatDateNoTime, formatNumber } from '@/utils/generalFormatter';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import BtnActionTable from "@/components/other/btnActionInTable";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_sort_header_style, table_sort_header_style_original } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
interface TableProps {
    openEditForm: (id: any) => void;
    openViewForm: (id: any) => void;
    openHistoryForm: (id: any) => void;
    tableData: any;
    isLoading: any;
    columnVisibility: any;
    userPermission?: any;
    handleActive: (id: any, isActive: any) => void;
}
const TableNomiDeadline: React.FC<TableProps> = ({ openEditForm, openViewForm, openHistoryForm, tableData, isLoading, columnVisibility, userPermission, handleActive }) => {
     
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
        <div className={`h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md relative z-10`}>
            {
                isLoading ?
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-9">

                                {/* {columnVisibility.status && ( */}
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("status", sortState, setSortState, setSortedData, tableData)}>
                                    {`Status`}
                                    {getArrowIcon("status")}
                                </th>
                                {/* )} */}

                                {columnVisibility.topic && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("topic", sortState, setSortState, setSortedData, tableData)}>
                                        {`Topic`}
                                        {getArrowIcon("topic")}
                                    </th>
                                )}

                                {columnVisibility.detail && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("detail", sortState, setSortState, setSortedData, tableData)}>
                                        {`Detail`}
                                        {getArrowIcon("detail")}
                                    </th>
                                )}

                                {columnVisibility.start_date && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("start_date", sortState, setSortState, setSortedData, tableData)}>
                                        {`Start Date`}
                                        {getArrowIcon("start_date")}
                                    </th>
                                )}

                                {columnVisibility.end_date && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("end_date", sortState, setSortState, setSortedData, tableData)}>
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
                                        // className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} h-12`}
                                        className={`border-b bg-white h-12`}
                                    >

                                        {columnVisibility.status && (
                                            <td className="px-2 py-1">{
                                                <div>
                                                    <label className="relative inline-block w-11 h-6 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            // checked={row?.active}
                                                            checked={row?.status}
                                                            className="sr-only peer"
                                                            onChange={(e) => {
                                                                handleActive(row?.id, e.target.checked);
                                                            }}
                                                        />
                                                        <span className="slider absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[#828282] transition duration-400 rounded-full peer-checked:bg-[#1473A1]"></span>
                                                        <span className="dot absolute h-5 w-5 left-0.5 bottom-0.5 bg-white transition duration-400 rounded-full peer-checked:translate-x-full"></span>
                                                    </label>
                                                </div>
                                            }</td>
                                        )}

                                        {columnVisibility.topic && (
                                            <td className="px-2 py-1 text-[#464255] font-bold">{row?.topic && row?.topic}</td>
                                        )}

                                        {columnVisibility.detail && (
                                            <td className="px-2 py-1 text-[#464255]">{row?.detail && row?.detail}</td>
                                        )}

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
                                                        <div ref={popoverRef}
                                                            className="absolute left-[-9rem] top-[-10px] mt-2 w-36 bg-white border border-gray-300 rounded-lg shadow-lg z-1">
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

export default TableNomiDeadline;