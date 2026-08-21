import { useEffect, useRef } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatDateNoTime, formatNumberThreeDecimal } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";

interface TableProps {
    openEditForm: (id: any) => void;
    openViewForm: (id: any) => void;
    openHistoryForm: (id: any) => void;
    handlePathDetail: any;
    handleContractClick?: any;
    openSubmissionModal: (id?: any, data?: any) => void;
    openAllFileModal: (id?: any, data?: any) => void;
    tableData: any;
    tableDataDetail?: any;
    isLoading: any;
    columnVisibility?: any;
    tabIndex?: any;
    sortedData?: any;
    setSortedData?: any;
}

const TableCapPublicDetail: React.FC<TableProps> = ({ openEditForm, openViewForm, handlePathDetail, handleContractClick, openHistoryForm, openSubmissionModal, openAllFileModal, tableData, isLoading, columnVisibility, tabIndex, tableDataDetail, sortedData, setSortedData }) => {

    const [sortState, setSortState] = useState({ column: null, direction: null });

    useEffect(() => {
        if (tableData && tableData.length > 0) {
            setSortedData(tableData);
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
        // <div className={`h-[calc(100vh-380px)] overflow-y-auto block rounded-t-md relative z-1`}>
        <div className={`h-[calc(100vh-440px)] overflow-x-auto overflow-y-auto block rounded-t-md relative z-10`} >
            {
                isLoading ?
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            {/* First Row */}
                            <tr className="h-9">
                                {columnVisibility.zone && (
                                    <th
                                        scope="col"
                                        rowSpan={2}
                                        className={`${table_sort_header_style} text-center`}
                                        onClick={() =>
                                            handleSort("area.zone.name", sortState, setSortState, setSortedData, tableData)
                                        }
                                    >
                                        {`Zone`}
                                        {getArrowIcon("area.zone.name")}
                                    </th>
                                )}

                                {columnVisibility.area && (
                                    <th
                                        scope="col"
                                        rowSpan={2}
                                        className={`${table_sort_header_style} text-center`}
                                        onClick={() =>
                                            handleSort("area.name", sortState, setSortState, setSortedData, tableData)
                                        }
                                    >
                                        {`Area`}
                                        {getArrowIcon("area.name")}
                                    </th>
                                )}

                                {columnVisibility.avaliable_capacity_mmbtu_d && (
                                    <th scope="col" className={`${table_sort_header_style} text-right`} onClick={() => handleSort("avaliable_capacity_mmbtu_d", sortState, setSortState, setSortedData, tableData)}>
                                        {`Available Capacity (MMBTU/D)`}
                                        {getArrowIcon("avaliable_capacity_mmbtu_d")}
                                    </th>
                                )}

                                {columnVisibility.start_date && (
                                    <th className={`${table_sort_header_style} text-center`} onClick={() => handleSort("start_date", sortState, setSortState, setSortedData, tableData)}>
                                        {`Start Date`}
                                        {getArrowIcon("start_date")}
                                    </th>
                                )}

                                {columnVisibility.end_date && (
                                    <th className={`${table_sort_header_style} text-center`} onClick={() => handleSort("end_date", sortState, setSortState, setSortedData, tableData)}>
                                        {`End Date`}
                                        {getArrowIcon("end_date")}
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
                                        {columnVisibility.zone && (
                                            <td className="px-2 py-1 h-[30px] text-center align-middle">
                                                {row?.area?.zone && (
                                                    <div
                                                        className="rounded-full p-1 text-[#464255] text-center"
                                                        style={{
                                                            backgroundColor: row?.area?.zone?.color,
                                                            minWidth: '140px',
                                                            maxWidth: 'max-content',
                                                            wordWrap: 'break-word',
                                                            whiteSpace: 'normal',
                                                            display: 'inline-block',  // Makes the div inline for centering
                                                            verticalAlign: 'middle',  // Aligns div vertically to the center
                                                        }}
                                                    >
                                                        {`${row?.area?.zone?.name}`}
                                                    </div>
                                                )}
                                            </td>
                                        )}

                                        {columnVisibility.area && (
                                            <td className="px-2 py-1 text-center align-middle">
                                                {
                                                    row?.area?.entry_exit_id == 2 ?
                                                        <div
                                                            className="rounded-full p-1 text-[#464255] text-center"
                                                            style={{
                                                                backgroundColor: row?.area?.color,
                                                                width: '40px',
                                                                height: '40px',
                                                                display: 'inline-flex',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                verticalAlign: 'middle'
                                                            }}
                                                        >
                                                            {`${row?.area?.name}`}
                                                        </div>
                                                        :
                                                        <div
                                                            className="rounded-lg p-1 text-[#464255] text-center"
                                                            style={{
                                                                backgroundColor: row?.area?.color,
                                                                width: '40px',
                                                                height: '40px',
                                                                display: 'inline-flex',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                verticalAlign: 'middle'
                                                            }}
                                                        >
                                                            {`${row?.area?.name}`}
                                                        </div>
                                                }
                                            </td>
                                        )}

                                        {columnVisibility.avaliable_capacity_mmbtu_d && (
                                            <td className="px-2 py-1 text-[#464255] text-right">{row?.avaliable_capacity_mmbtu_d ? formatNumberThreeDecimal(row?.avaliable_capacity_mmbtu_d) : ''}</td>
                                        )}

                                        {columnVisibility.start_date && (
                                            <td className="px-2 py-1 text-[#464255] text-center">{row?.start_date ? formatDateNoTime(row?.start_date) : ''}</td>
                                        )}

                                        {columnVisibility.end_date && (
                                            <td className="px-2 py-1 text-[#0DA2A2] text-center">{row?.end_date ? formatDateNoTime(row?.end_date) : ''}</td>
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

export default TableCapPublicDetail;