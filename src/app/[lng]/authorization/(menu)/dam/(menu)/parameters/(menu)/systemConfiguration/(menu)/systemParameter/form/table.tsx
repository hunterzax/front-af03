import { useEffect, useRef } from "react";
import React, { FC, useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatDateNoTime, formatNumberThreeDecimal } from '@/utils/generalFormatter';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import BtnActionTable from "@/components/other/btnActionInTable";
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
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

const TableParameter: React.FC<TableProps> = ({ openEditForm, openViewForm, openHistoryForm, tableData, isLoading, columnVisibility, userPermission }) => {

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

    const downloadFile = (fileUrl: any) => {
        const link = document.createElement('a');
        link.href = fileUrl; // The file URL
        link.download = ''; // Optional: specify a file name if needed
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const openInNewTab = (url: string) => {
        if (url && url.trim() !== "") {
            const validUrl = url.startsWith('http://') || url.startsWith('https://')
                ? url : `https://${url}`;

            window.open(validUrl, '_blank', 'noopener,noreferrer');
        } else {
            // The file URL is not valid or unavailable
        }
    };

    return (
        <div className={`h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md relative z-1`}>
            {
                isLoading ?
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-9">

                                {columnVisibility.module && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("menus_id", sortState, setSortState, setSortedData, tableData)}>
                                        {`Module`}
                                        {getArrowIcon("menus_id")}
                                    </th>
                                )}

                                {columnVisibility.system_parameter && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("system_parameter_id", sortState, setSortState, setSortedData, tableData)}>
                                        {`System Parameter`}
                                        {getArrowIcon("system_parameter_id")}
                                    </th>
                                )}

                                {columnVisibility.value && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("value", sortState, setSortState, setSortedData, tableData)}>
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
                                        {columnVisibility.module && (
                                            <td className="px-2 py-1 text-[#464255]">{row?.menus?.name}</td>
                                        )}
                                        {columnVisibility.system_parameter && (
                                            <td className="px-2 py-1 text-[#464255]">{row?.system_parameter?.name}</td>
                                        )}
                                        {columnVisibility.value && (
                                            <td className="px-2 py-1 text-[#464255]">{row?.value && formatNumberThreeDecimal(row?.value)}</td>
                                        )}
                                        {/* <td className="px-2 py-1">
                                            <OpenInNewOutlinedIcon /> {row?.link}
                                        </td> */}

                                        {/* <td className="px-2 py-1 text-center justify-center">
                                            <div className="inline-flex items-center justify-center relative">
                                                <button
                                                    type="button"
                                                    className="flex items-center justify-center px-[2px] py-[2px] border border-[#A6CE39] rounded-md hover:bg-[#DFE4EA] hover:border hover:border-[#DFE4EA] relative"
                                                // onClick={() => openReasonModal(row?.id, row?.account_reason)}
                                                >
                                                    <OpenInNewOutlinedIcon sx={{ fontSize: 18, color: '#A6CE39' }} />
                                                </button>
                                            </div>
                                        </td> */}

                                        {columnVisibility.link && (
                                            <td className="px-2 py-1 text-center justify-center">
                                                <div className="inline-flex items-center justify-center relative">
                                                    <button
                                                        type="button"
                                                        disabled={row?.link ? false : true}
                                                        className={`flex items-center justify-center px-[2px] py-[2px] border  rounded-md hover:bg-[#DFE4EA] hover:border hover:border-[#DFE4EA] relative`}
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

export default TableParameter;