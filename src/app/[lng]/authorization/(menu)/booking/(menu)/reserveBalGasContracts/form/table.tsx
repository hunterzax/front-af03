import { useEffect, useRef } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import BtnActionTable from "@/components/other/btnActionInTable";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import { iconButtonClass } from "@/utils/generalFormatter";

interface TableProps {
    openEditForm: (id: any) => void;
    openViewForm: (id: any) => void;
    openViewModal: (data: any) => void;
    openHistoryForm: (id: any) => void;
    openAddDocModal: (id: any, data: any) => void;
    openReasonModal: (id?: any, dataUser?: any, row?: any) => void;
    tableData: any;
    areaMaster: any;
    zoneMaster: any;
    isLoading: any;
    columnVisibility: any;
    userPermission?: any;
}

const TableReserveBalGas: React.FC<TableProps> = ({ openEditForm, openViewForm, openAddDocModal, openHistoryForm, openViewModal, openReasonModal, areaMaster, zoneMaster, tableData, isLoading, columnVisibility, userPermission }) => {
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);

    useEffect(() => {
        if (tableData && tableData.length > 0) {
            setSortedData(tableData);
        } else {
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
            // case "history":
            //     openHistoryForm(id);
            //     setOpenPopoverId(null);
            //     break;
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

    // map data into column under Used Cap (%)
    return (
        <div className={`h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md relative z-1`}>
            {
                isLoading ?
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-1">

                            <tr className="h-9">
                                {columnVisibility.res_bal_gas_contract && (
                                    <th
                                        rowSpan={2}
                                        scope="col"
                                        className={`${table_sort_header_style}`}
                                        onClick={() => handleSort("res_bal_gas_contract", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Reserve Bal. Contract Code`}
                                        {getArrowIcon("res_bal_gas_contract")}
                                    </th>
                                )}

                                {columnVisibility.group && (
                                    <th
                                        rowSpan={2}
                                        scope="col"
                                        className={`${table_sort_header_style}`}
                                        onClick={() => handleSort("group.name", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Shipper Name`}
                                        {getArrowIcon("group.name")}
                                    </th>
                                )}

                                {columnVisibility.comment && (
                                    <th rowSpan={2} scope="col" className={`${table_header_style}`}>
                                        {`Comment`}
                                        {/* {getArrowIcon("comment")} */}
                                    </th>
                                )}

                                {columnVisibility.file && (
                                    <th rowSpan={2} scope="col" className={`${table_header_style}`}>
                                        {`File`}
                                        {/* {getArrowIcon("file")} */}
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
                                        key={index}
                                        className={`${table_row_style} border-b h-12`}
                                    >

                                        {columnVisibility.res_bal_gas_contract && (
                                            <td className="px-2 py-1 text-[#464255] font-light">{row?.res_bal_gas_contract ? row?.res_bal_gas_contract : ''}</td>
                                        )}

                                        {columnVisibility.group && (
                                            <td className={`px-2 py-1 text-[#464255] font-light`}>{row?.group ? row?.group?.name : ''}</td>
                                        )}

                                        {columnVisibility.comment && (
                                            <td className="px-2 py-1 text-center">
                                                <div className="inline-flex items-center justify-center relative">
                                                    {/* <button
                                                        type="button"
                                                        className="flex items-center justify-center px-[2px] py-[2px] bg-white rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative "
                                                        onClick={() => openReasonModal(row?.id, row?.reserve_balancing_gas_contract_comment, row)}
                                                        // disabled={row?.reserve_balancing_gas_contract_comment?.length <= 0 && true}
                                                        disabled={!userPermission?.f_view || row?.reserve_balancing_gas_contract_comment?.length <= 0}
                                                    >
                                                        <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                                                    </button> */}

                                                    <button
                                                        type="button"
                                                        className={iconButtonClass}
                                                        onClick={() => openReasonModal(row?.id, row?.reserve_balancing_gas_contract_comment, row)}
                                                        disabled={!userPermission?.f_view || row?.reserve_balancing_gas_contract_comment?.length <= 0}
                                                    >
                                                        <ChatBubbleOutlineOutlinedIcon
                                                            fontSize="inherit"
                                                            className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                                            sx={{ color: 'currentColor', fontSize: 18 }}
                                                        />
                                                    </button>
                                                    <span className="px-2 text-[#464255]">
                                                        {row?.reserve_balancing_gas_contract_comment?.length}
                                                    </span>
                                                </div>
                                            </td>
                                        )}

                                        {columnVisibility.file && (
                                            <td className="px-2 py-1 text-center">
                                                <div className="inline-flex items-center justify-center relative">
                                                    <button
                                                        type="button"
                                                        className="flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                                                        onClick={() => openAddDocModal(row?.id, row)}
                                                        // disabled={row?.reserve_balancing_gas_contract_files.length <= 0 && true}
                                                        disabled={!userPermission?.f_view || row?.reserve_balancing_gas_contract_files.length <= 0}
                                                    >
                                                        <AttachFileRoundedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                                                    </button>
                                                    <span className="px-2 text-[#464255]">
                                                        {row?.reserve_balancing_gas_contract_files.length}
                                                    </span>
                                                </div>
                                            </td>
                                        )}

                                        {columnVisibility.action && (
                                            <td className="px-2 py-1">
                                                <div className="relative inline-flex justify-center items-center w-full">
                                                    <BtnActionTable togglePopover={togglePopover} row_id={row?.id} disable={!userPermission?.f_view && !userPermission?.f_edit ? true : false} />

                                                    {openPopoverId === row?.id && (
                                                        <div ref={popoverRef}
                                                            className="absolute left-[-7.4rem] top-[-10px] mt-2 w-36 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                                                            <ul className="py-2">
                                                                {/* <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("view", row?.id) }}><RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> View</li>
                                                                <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("edit", row?.id) }}><EditOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> Edit</li> */}
                                                                {
                                                                    userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("view", row?.id) }}><RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`View`}</li>
                                                                }
                                                                {
                                                                    userPermission?.f_edit && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("edit", row?.id) }}><EditOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Edit`}</li>
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

export default TableReserveBalGas;