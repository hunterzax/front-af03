import { useEffect, useRef } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatDateTimeSec, formatNumberFourDecimal, iconButtonClass, toDayjs } from '@/utils/generalFormatter';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import BtnActionTable from "@/components/other/btnActionInTable";
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort, handleSortIntradayAccImbalanceInventoryAdjust, handleSortUpdateByFirstName } from "@/utils/sortTable";
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

interface TableProps {
    openEditForm: (id: any) => void;
    openViewForm: (id: any) => void;
    openHistoryForm: (id: any) => void;
    openDeleteForm: (id: any) => void;
    openReasonModal: (id?: any, dataUser?: any, row?: any) => void;
    tableData: any;
    isLoading: any;
    zoneMaster?: any;
    columnVisibility: any;
    userPermission?: any;
    dataCloseBal?: any;
}

const TableBalIntradayAccImbalanceInventoryAdjust: React.FC<TableProps> = ({ openEditForm, openViewForm, openHistoryForm, openDeleteForm, openReasonModal, tableData, isLoading, columnVisibility, userPermission, zoneMaster, dataCloseBal }) => {
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);
    useEffect(() => {
        if (tableData && tableData.length > 0) {
            setSortedData(tableData);
        } else {
            setSortedData([]);
        }

    }, [tableData]);

    const [openPopoverId, setOpenPopoverId] = useState(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const togglePopover = (id: any) => {
        if (openPopoverId === id) {
            setOpenPopoverId(null);
        } else {
            setOpenPopoverId(id);
        }
    };

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    const toggleMenu = (mode: any, id: any) => {
        switch (mode) {
            case "view":
                openViewForm(id);
                setOpenPopoverId(null); // close popover
                break;
            case "edit":
                openEditForm(id);
                setOpenPopoverId(null);
                break;
            case "history":
                openHistoryForm(id);
                setOpenPopoverId(null);
                break;
            case "delete":
                openDeleteForm(id);
                setOpenPopoverId(null);
                break;
        }
    }

    // useEffect(() => {}, []);
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
        <div className={`relative h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md z-1`}>
            {
                isLoading ?
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-9">

                                {columnVisibility.gas_day && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSortIntradayAccImbalanceInventoryAdjust("gas_day", sortState, setSortState, setSortedData, tableData)}>
                                        {`Gas Day`}
                                        {getArrowIcon("gas_day")}
                                    </th>
                                )}

                                {columnVisibility.east && (
                                    <th scope="col" className={`${table_sort_header_style} text-right`} onClick={() => handleSortIntradayAccImbalanceInventoryAdjust("east", sortState, setSortState, setSortedData, tableData)}>
                                        {`East (MMBTU)`}
                                        {getArrowIcon("east")}
                                    </th>
                                )}

                                {columnVisibility.west && (
                                    <th scope="col" className={`${table_sort_header_style} text-right`} onClick={() => handleSortIntradayAccImbalanceInventoryAdjust("west", sortState, setSortState, setSortedData, tableData)}>
                                        {`West (MMBTU)`}
                                        {getArrowIcon("west")}
                                    </th>
                                )}

                                {columnVisibility.comment && (
                                    <th rowSpan={2} scope="col" className={`${table_header_style} text-center`}>
                                        {`Comment`}
                                    </th>
                                )}

                                {columnVisibility.created_by && (
                                    <th scope="col" className={`${table_sort_header_style} `} onClick={() => handleSortIntradayAccImbalanceInventoryAdjust("create_by_account.first_name", sortState, setSortState, setSortedData, tableData)}>
                                        {`Created by`}
                                        {getArrowIcon("create_by_account.first_name")}
                                    </th>
                                )}

                                {columnVisibility.updated_by && (
                                    // <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSortIntradayAccImbalanceInventoryAdjust("update_by_account.first_name", sortState, setSortState, setSortedData, tableData)}>
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSortUpdateByFirstName("update_by_account.first_name", sortState, setSortState, setSortedData, tableData)}>
                                        {`Updated by`}
                                        {getArrowIcon("update_by_account.first_name")}
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
                            {sortedData && sortedData?.map((row: any, index: any) => {
                                // const isGasDayPass = dayjs().isSameOrBefore(dayjs(row.gas_day));
                                const isGasDayPass = dayjs().isSameOrBefore(dayjs(row.gas_day), 'day');

                                return (
                                    <tr
                                        key={row?.id}
                                        className={`${table_row_style}`}
                                    >

                                        {columnVisibility?.gas_day && (
                                            <td className={`px-2 py-1 text-[#464255] text-center`}>
                                                {row?.gas_day ? toDayjs(row?.gas_day).format("DD/MM/YYYY") : ''}
                                            </td>
                                        )}

                                        {columnVisibility?.east && (
                                            <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                {/* {row?.east ? formatNumberFourDecimal(row?.east) : ''} */}
                                                {row?.east !== null && row?.east !== undefined ? formatNumberFourDecimal(row?.east) : ''}
                                            </td>
                                        )}

                                        {columnVisibility?.west && (
                                            <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                {/* {row?.west ? formatNumberFourDecimal(row?.west) : ''} */}
                                                {row?.west !== null && row?.west !== undefined ? formatNumberFourDecimal(row?.west) : ''}
                                            </td>
                                        )}

                                        {columnVisibility.comment && (
                                            <td className="px-2 py-1 text-center">
                                                <div className="inline-flex items-center justify-center relative">
                                                    {/* <button
                                                        type="button"
                                                        className="flex items-center justify-center px-[2px] py-[2px] bg-white rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                                                        onClick={() => openReasonModal(row?.id, row?.comment, row)}
                                                        disabled={row?.comment?.length <= 0 && true}
                                                    // disabled={!userPermission?.f_view || row?.comment?.length <= 0}
                                                    // disabled={!userPermission?.f_view}
                                                    >
                                                        <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                                                    </button> */}

                                                    <button
                                                        type="button"
                                                        className={iconButtonClass}
                                                        onClick={() => openReasonModal(row?.id, row?.comment, row)}
                                                        disabled={row?.comment?.length <= 0 && true}
                                                    >
                                                        <ChatBubbleOutlineOutlinedIcon
                                                            fontSize="inherit"
                                                            className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                                            sx={{ color: 'currentColor', fontSize: 18 }}
                                                        />
                                                    </button>

                                                    <span className="px-2 text-[#464255]">
                                                        {row?.comment?.length}
                                                    </span>
                                                </div>
                                            </td>
                                        )}

                                        {columnVisibility.created_by && (
                                            <td className="px-2 py-1">
                                                <div>
                                                    <span className="text-[#464255]">{row?.create_by_account?.first_name} {row?.create_by_account?.last_name}</span>
                                                    <div className="text-gray-500 text-xs">{row?.create_date ? formatDateTimeSec(row?.create_date) : ''}</div>
                                                </div>
                                            </td>
                                        )}

                                        {columnVisibility.updated_by && (
                                            <td className="px-2 py-1">
                                                <div>
                                                    <span className="text-[#464255]">{row?.update_by_account?.first_name} {row?.update_by_account?.last_name}</span>
                                                    <div className="text-gray-500 text-xs">{row?.update_date ? formatDateTimeSec(row?.update_date) : ''}</div>
                                                </div>
                                            </td>
                                        )}

                                        {columnVisibility.action && (
                                            <td className="px-2 py-1">
                                                {/* <div className="relative inline-block text-left "> */}
                                                <div className="relative inline-flex justify-center items-center w-full">
                                                    <BtnActionTable togglePopover={togglePopover} row_id={row?.id} disable={!userPermission?.f_view && !userPermission?.f_edit ? true : false} />
                                                    {openPopoverId === row?.id && (
                                                        <div ref={popoverRef}
                                                            className="absolute left-[-8rem] top-[-10px] mt-2 w-36 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
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
                                                                {/* {
                                                                    userPermission?.f_edit && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("delete", row?.id) }}><DeleteOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Delete`}</li>
                                                                } */}


                                                                {/* Delete > ลบได้ห้ามเกิน Close Balancing ที่ set ไว้ รายการไหนเกิน ไม่ต้องให้เห็นปุ่ม Delete เลย https://app.clickup.com/t/86eubknpn */}
                                                                {/* {
                                                                    userPermission?.f_edit &&
                                                                    toDayjs(row.gas_day).isBefore(toDayjs(dataCloseBal.date_balance)) && (
                                                                        <li
                                                                            className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer"
                                                                            onClick={() => toggleMenu("delete", row?.id)}
                                                                        >
                                                                            <DeleteOutlinedIcon
                                                                                sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }}
                                                                            />
                                                                            Delete
                                                                        </li>
                                                                    )
                                                                } */}


                                                                {/* UAT Comment พี่แนนแจ้งว่า ปรับใหม่เป็นให้สามารถ Delete ได้ตั้งแต่วันปัจจุบันเป็นต้นไป --> คำนี้มาจากคอมเม้น figma */}
                                                                {
                                                                    userPermission?.f_edit && isGasDayPass && (
                                                                        <li
                                                                            className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer"
                                                                            onClick={() => toggleMenu("delete", row?.id)}
                                                                        >
                                                                            <DeleteOutlinedIcon
                                                                                sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }}
                                                                            />
                                                                            Delete
                                                                        </li>
                                                                    )
                                                                }
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                )
                            }
                            )}
                        </tbody>
                    </table>
                    :
                    <TableSkeleton />
            }
        </div>
    )
}

export default TableBalIntradayAccImbalanceInventoryAdjust;