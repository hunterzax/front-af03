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
import { table_col_arrow_sort_style, table_header_style, table_sort_header_style, table_sort_header_style_original } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
interface TableProps {
    openEditForm: (id: any) => void;
    openViewForm: (id: any) => void;
    openHistoryForm: (id: any) => void;
    openReasonModal: (id: any, dataUser: any, create_date: any, create_by: any, start_date: any, end_date: any) => void;
    tableData: any;
    isLoading: any;
    columnVisibility: any;
    userPermission?: any;
}
const TableCapRemark: React.FC<TableProps> = ({ openEditForm, openViewForm, openReasonModal, openHistoryForm, tableData, isLoading, columnVisibility, userPermission }) => {
     
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
                    <table className="w-full table-fixed text-sm text-left rtl:text-right text-gray-500">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-9">
                                {columnVisibility.start_date && (
                                    <th scope="col" className={`${table_sort_header_style} min-w-[80px] w-[120px] max-w-[150px]`} onClick={() => handleSort("start_date", sortState, setSortState, setSortedData, tableData)}>
                                        {`Start Date`}
                                        {getArrowIcon("start_date")}
                                    </th>
                                )}

                                {columnVisibility.end_date && (
                                    <th scope="col" className={`${table_sort_header_style} min-w-[80px] w-[120px] max-w-[150px]`} onClick={() => handleSort("end_date", sortState, setSortState, setSortedData, tableData)}>
                                        {`End Date`}
                                        {getArrowIcon("end_date")}
                                    </th>
                                )}

                                {columnVisibility.remark && (
                                    <th scope="col" className={`${table_header_style} !w-[1000px] !max-w-[1500px]`}>
                                        {`Remarks`}
                                    </th>
                                )}

                                {/* {columnVisibility.remark && (
                                    <th scope="col" className={`${table_header_style} text-left !w-[300px]`}>
                                        Remarks
                                    </th>
                                )} */}

                                {columnVisibility.create_by && (
                                    <th scope="col" className={`${table_sort_header_style} min-w-[80px] w-[120px] max-w-[150px]`} onClick={() => handleSort("create_by_account.first_name", sortState, setSortState, setSortedData, tableData)}>
                                        {`Created by`}
                                        {getArrowIcon("create_by_account.first_name")}
                                    </th>
                                )}

                                {columnVisibility.action && (
                                    <th scope="col" className={`${table_header_style} min-w-[80px] w-[120px] max-w-[150px] text-center`}>
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
                                        className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} h-12 `}
                                    >
                                        {columnVisibility.start_date && (
                                            <td className="px-2 py-1 text-[#464255] min-w-[80px] w-[120px] max-w-[150px]">{row?.start_date ? formatDateNoTime(row?.start_date) : ''}</td>
                                        )}

                                        {columnVisibility.end_date && (
                                            <td className="px-2 py-1 text-[#0DA2A2] min-w-[80px] w-[120px] max-w-[150px]">{row?.end_date ? formatDateNoTime(row?.end_date) : ''}</td>
                                        )}

                                        {columnVisibility.remark && (
                                            // <td className="px-2 py-1 text-left ">
                                            //     <td className="px-2 py-1 text-[#464255]  ">{row?.remark ? row?.remark : ''}</td>
                                            // </td>

                                            <td className="px-2 py-1 text-left w-[1000px] max-w-[1500px]">
                                                <div
                                                    className="truncate whitespace-nowrap overflow-hidden text-ellipsis text-[#464255] w-full"
                                                    title={row?.remark}
                                                >
                                                    {row?.remark || ''}
                                                </div>
                                            </td>

                                        )}


                                        {/* {columnVisibility.remark && (
                                            <td className="px-2 py-1 text-left">
                                                <div className="text-[#464255] truncate w-[450px]" title={row?.remark}>
                                                    {row?.remark ? row?.remark : ''}
                                                </div>
                                            </td>
                                        )} */}

                                        {/* {columnVisibility.remark && (
                                            <td className="px-2 py-1 text-left !w-[300px]">
                                                <div
                                                    className="text-[#464255] truncate  md:max-w-[800px] lg:max-w-[1000px] xl:max-w-ful lw-full whitespace-nowrapover flow-hidden text-ellipsis cursor-default"
                                                    title={row?.remark}
                                                >
                                                    {row?.remark || ''}
                                                </div>
                                            </td>
                                        )} */}

                                        {/* {columnVisibility.remark && (
                                            <td className="px-2 py-1 text-left w-[1000px]">
                                                <div
                                                    className="text-[#464255] truncate whitespace-nowrap overflow-hidden text-ellipsis cursor-default w-full"
                                                    title={row?.remark}
                                                >
                                                    {row?.remark || ''}
                                                </div>
                                            </td>
                                        )} */}

                                        {columnVisibility.create_by && (
                                            <td className="px-2 py-1 min-w-[80px] w-[120px] max-w-[150px]">
                                                <div>
                                                    <span className="text-[#464255]">{row?.create_by_account?.first_name} {row?.create_by_account?.last_name}</span>
                                                    <div className="text-gray-500 text-xs">{row?.create_date ? formatDate(row?.create_date) : ''}</div>
                                                </div>
                                            </td>
                                        )}

                                        {columnVisibility.action && (
                                            <td className="px-2 py-1 min-w-[80px] w-[120px] max-w-[150px]">
                                                {/* <div className="relative inline-block text-left "> */}
                                                <div className="relative inline-flex justify-center items-center w-full">
                                                    <BtnActionTable togglePopover={togglePopover} row_id={row?.id} disable={!userPermission?.f_view && !userPermission?.f_edit ? true : false} />
                                                    {openPopoverId === row?.id && (
                                                        <div ref={popoverRef}
                                                            className="absolute left-[-9rem] top-[-10px] mt-2 w-36 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                                                            <ul className="py-2">
                                                                {/* <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("view", row?.id) }}><RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> View</li>
                                                                <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("edit", row?.id) }}><EditOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> Edit</li>
                                                                <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("history", row?.id) }}><RestoreOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> History</li> */}
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

export default TableCapRemark;