import { useEffect, useRef } from "react";
import React, { FC, useState } from 'react';
import TableSkeleton, { DefaultSkeleton } from '@/components/material_custom/DefaultSkeleton';
import { cutUploadFileName, formatDate, formatDateNoTime, formatDateTimeSec, formatNumber } from '@/utils/generalFormatter';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import BtnActionTable from "@/components/other/btnActionInTable";
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style, table_sort_header_style_original } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import getUserValue from "@/utils/getuserValue";

interface TableProps {
    openEditForm: (id: any) => void;
    openViewForm: (id: any) => void;
    openHistoryForm: (id: any) => void;
    tableData: any;
    isLoading: any;
    columnVisibility: any;
    userPermission?: any;
}
const TableUserGuide: React.FC<TableProps> = ({ openEditForm, openViewForm, openHistoryForm, tableData, isLoading, columnVisibility, userPermission }) => {

    const userDT: any = getUserValue();
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

    const downloadFile = (fileUrl: string) => {
        if (!fileUrl) {
            // File URL is invalid
            return;
        }
        window.open(fileUrl, '_blank');
    };

    return (
        <div className={`h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md relative z-1`}>
            {
                isLoading ?
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-9">
                                {columnVisibility.name && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("document_name", sortState, setSortState, setSortedData, tableData)}>
                                        {`Document Name`}
                                        {getArrowIcon("document_name")}
                                    </th>
                                )}
                                {columnVisibility.file && (
                                    <th scope="col" className={`${table_sort_header_style} !min-w-[180px]`} onClick={() => handleSort("file", sortState, setSortState, setSortedData, tableData)}>
                                        {`File`}
                                        {getArrowIcon("file")}
                                    </th>
                                )}
                                {columnVisibility.desc && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("description", sortState, setSortState, setSortedData, tableData)}>
                                        {`Description`}
                                        {getArrowIcon("description")}
                                    </th>
                                )}
                                {columnVisibility.download && (
                                    <th scope="col" className={`${table_header_style}`} >
                                        {`Download`}
                                    </th>
                                )}
                                {columnVisibility.create_by && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("create_by_account.first_name", sortState, setSortState, setSortedData, tableData)}>
                                        {`Created by`}
                                        {getArrowIcon("create_by_account.first_name")}
                                    </th>
                                )}
                                {columnVisibility.update_by && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("update_by_account.first_name", sortState, setSortState, setSortedData, tableData)}>
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
                            {sortedData && sortedData.map((row: any, index: any) => {
                                // check ว่า มี role ตัวที่ใช้งานอยู่ใน record พวกนี้มั้ย ถ้าไม่มีโหลดไม่ได้
                                let canDownload = false
                                if (userDT?.account_manage?.[0]?.user_type_id == 1) { // super admin โหลดได้หมด
                                    canDownload = true
                                } else if (row?.user_guide_match?.some((match: any) => match.role_id === userDT?.account_manage?.[0]?.account_role?.[0]?.role_id) && userPermission?.f_edit) { // ถ้าตรง role ตัวเอง และมีสิทธิ edit ถึงจะโหลดได้
                                    canDownload = true
                                }

                                return (
                                    <tr
                                        key={row?.id}
                                        className={`${table_row_style}`}
                                    >
                                        {columnVisibility.name && (
                                            <td className="px-2 py-1 text-[#464255]">{row?.document_name}</td>
                                        )}
                                        {/* <td className="px-2 py-1 text-[#464255]">{row?.file}</td> */}
                                        {columnVisibility.file && (
                                            <td className="px-2 py-1 text-[#464255] !min-w-[180px]">
                                                <div className="flex items-center">
                                                    <img className="w-[20px] h-[20px] mr-2" src="/assets/image/pdf_icon.png" alt="pdf icon" />
                                                    <span>{row?.file && cutUploadFileName(row?.file)}</span>
                                                </div>
                                            </td>
                                        )}

                                        {columnVisibility.desc && (
                                            <td className="px-2 py-1 text-[#464255]">{row?.description}</td>
                                        )}

                                        {columnVisibility.download && (
                                            <td className="px-2 py-1 text-center justify-center">
                                                <div className="inline-flex items-center justify-center relative">
                                                    <button
                                                        type="button"
                                                        className={`flex items-center justify-center px-[2px] py-[2px] border border-[#555479] rounded-md hover:bg-[#DFE4EA] hover:border hover:border-[#DFE4EA] relative ${!canDownload && "opacity-50 cursor-not-allowed"}`}
                                                        onClick={() => canDownload && downloadFile(row?.file)}
                                                        disabled={!canDownload}
                                                    >
                                                        <FileDownloadOutlinedIcon sx={{ fontSize: 18, color: '#2B2A87' }} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                        {columnVisibility.create_by && (
                                            <td className="px-2 py-1 ">
                                                <div>
                                                    <span className="text-[#464255]">{row?.create_by_account?.first_name} {row?.create_by_account?.last_name}</span>
                                                    <div className="text-gray-500 text-xs">{formatDate(row?.create_date)}</div>
                                                </div>
                                            </td>
                                        )}
                                        {columnVisibility.update_by && (
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

export default TableUserGuide;