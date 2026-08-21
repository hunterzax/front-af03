import { useEffect, useRef } from "react";
import React, { FC, useState } from 'react';
import TableSkeleton, { DefaultSkeleton } from '@/components/material_custom/DefaultSkeleton';
import { formatDate, formatDateNoTime, formatNumber, getContrastTextColor } from '@/utils/generalFormatter';
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
}
const TableHvForOperationFlow: React.FC<TableProps> = ({ openEditForm, openViewForm, openHistoryForm, tableData, isLoading, columnVisibility }) => {

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);
    useEffect(() => {
        if (tableData && tableData.length > 0) {
            setSortedData(tableData);
        }else{
            setSortedData([]);
        }

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
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-9">

                                {columnVisibility.type && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("hv_type.type", sortState, setSortState, setSortedData, tableData)} >
                                        {`Type`}
                                        {getArrowIcon("hv_type.type")}
                                    </th>
                                )}

                                {columnVisibility.shipper_name && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("group.name", sortState, setSortState, setSortedData, tableData)} >
                                        {`Shipper Name`}
                                        {getArrowIcon("group.name")}
                                    </th>
                                )}

                                {columnVisibility.meter_point && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("metering_point.metered_point_name", sortState, setSortState, setSortedData, tableData)} >
                                        {`Meter Point`}
                                        {getArrowIcon("metering_point.metered_point_name")}
                                    </th>
                                )}

                                {columnVisibility.start_date && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("start_date", sortState, setSortState, setSortedData, tableData)} >
                                        {`Start Date`}
                                        {getArrowIcon("start_date")}
                                    </th>
                                )}

                                {columnVisibility.created_by && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("create_by_account.first_name", sortState, setSortState, setSortedData, tableData)} >
                                        {`Created by`}
                                        {getArrowIcon("create_by_account.first_name")}
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

                                        {columnVisibility.type && (
                                            <td className="px-2 py-1">
                                                <div className="flex items-center justify-center h-full">
                                                    {row?.hv_type && (
                                                        <div
                                                            className="flex items-center font-semibold justify-center w-[140px] h-[30px] rounded-full p-1"
                                                            style={{
                                                                backgroundColor: row?.hv_type?.color,
                                                                // color: row?.hv_type_id == 1 ? '#0DA2A2' : getContrastTextColor(row?.hv_type?.color),
                                                                color: row?.hv_type_id == 1 ? '#0DA2A2' : '#2F9ADC',
                                                            }}
                                                        >
                                                            {row?.hv_type?.type}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        )}

                                        {columnVisibility?.shipper_name && (
                                            <td className={`px-2 py-1 text-[#464255] `}>
                                                {row?.group ? row?.group?.name : ''}
                                            </td>
                                        )}

                                        {columnVisibility.meter_point && (
                                            <td className={`px-2 py-1 text-[#464255] `}>
                                                {row?.metering_point ? row?.metering_point?.metered_point_name : ''}
                                            </td>
                                        )}

                                        {columnVisibility.start_date && (
                                            <td className="px-2 py-1 text-[#464255]">{row?.start_date ? formatDateNoTime(row?.start_date) : ''}</td>
                                        )}

                                        {columnVisibility.created_by && (
                                            <td className="px-2 py-1">
                                                <div>
                                                    <span className="text-[#464255]">{row?.create_by_account?.first_name} {row?.create_by_account?.last_name}</span>
                                                    <div className="text-gray-500 text-xs">{row?.create_date ? formatDate(row?.create_date) : ''}</div>
                                                </div>
                                            </td>
                                        )}

                                        {columnVisibility.action && (
                                            <td className="px-2 py-1">
                                                <div className="relative inline-flex justify-center items-center w-full">
                                                    <BtnActionTable togglePopover={togglePopover} row_id={row?.id} />
                                                    {openPopoverId === row?.id && (
                                                        <div ref={popoverRef} className="absolute left-[-6rem] top-[-10px] mt-2 w-36 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                                                            <ul className="py-2">
                                                                <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("view", row?.id) }}><RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> View</li>
                                                                <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("edit", row?.id) }}><EditOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> Edit</li>
                                                                <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("history", row?.id) }}><RestoreOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> History</li>
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

export default TableHvForOperationFlow;