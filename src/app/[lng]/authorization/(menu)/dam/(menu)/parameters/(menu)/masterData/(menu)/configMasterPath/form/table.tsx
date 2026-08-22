import { useEffect, useRef } from "react";
import React, { FC, useState } from 'react';
import TableSkeleton, { DefaultSkeleton } from '@/components/material_custom/DefaultSkeleton';
import { formatDate, formatDateNoTime, formatNumber } from '@/utils/generalFormatter';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import BtnActionTable from "@/components/other/btnActionInTable";
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style, table_sort_header_style_original } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";

interface TableProps {
    openEditForm: (id: any) => void;
    openViewForm: (id: any) => void;
    openStatUpdate: (id: any) => void;
    setModeForm: any;
    tableData: any;
    isLoading: any;
    columnVisibility: any;
    userPermission?: any;
}
const TableConfigMasterPath: React.FC<TableProps> = ({ openEditForm, openViewForm, openStatUpdate, setModeForm, tableData, isLoading, columnVisibility, userPermission }) => {

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);

    useEffect(() => {
        if (tableData && tableData.length > 0) {
            setSortedData(tableData);
        }else{
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
                setOpenPopoverId(null);
                setModeForm('view');
                break;
            case "edit":
                openEditForm(id);
                setOpenPopoverId(null);
                setModeForm('edit');
                break;
            case "duplicate":
                openEditForm(id);
                setOpenPopoverId(null);
                setModeForm('duplicate');
                break;
            case "update_stat":
                openStatUpdate(id);
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

    const openStatFunc = (id: any, data?: any) => {
        openStatUpdate(id);
        setOpenPopoverId(null);
    }

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

                                {columnVisibility.status && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("active", sortState, setSortState, setSortedData, tableData)}>
                                        {`Status`}
                                        {getArrowIcon("active")}
                                    </th>
                                )}
                                {columnVisibility.path_no && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("path_no", sortState, setSortState, setSortedData, tableData)}>
                                        {`Path No.`}
                                        {getArrowIcon("path_no")}
                                    </th>
                                )}
                                {columnVisibility.revised_cap && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("first_path.name", sortState, setSortState, setSortedData, tableData)}>
                                        {`Revised Capacity Path`}
                                        {getArrowIcon("first_path.name")}

                                    </th>
                                )}
                                {columnVisibility.create_by && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("create_by_account.first_name", sortState, setSortState, setSortedData, tableData)}>
                                        {`Created by`}
                                        {getArrowIcon("create_by_account.first_name")}
                                    </th>
                                )}
                                {/* {columnVisibility.update_by && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("update_by", sortState, setSortState, setSortedData, tableData)}>
                                        {`Updated by`}
                                        {getArrowIcon("update_by")}
                                    </th>
                                )} */}
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

                                        {/* {columnVisibility.status && (
                                            <td className="px-2 py-1">{
                                                row?.active ?
                                                    //  <div className="flex  justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.color }}>{`${row?.name}`}</div>
                                                    <div
                                                        className="flex justify-center items-center rounded-full p-1 text-[#464255] bg-[#EFEFEF] gap-2"
                                                    >
                                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>{`Active`}
                                                    </div>
                                                    :
                                                    <div
                                                        className="flex justify-center items-center rounded-full p-1 text-[#464255] bg-[#EFEFEF] gap-2"
                                                    >
                                                        <div className="w-2 h-2 bg-[#A2A09F] rounded-full"></div>{`Inactive`}
                                                    </div>
                                            }</td>
                                        )} */}
                                        {columnVisibility.status && (
                                            <td className="px-2 py-1">{
                                                <div>
                                                    <label className="relative inline-block w-11 h-6 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={row?.active}
                                                            className="sr-only peer"
                                                            onClick={() => {
                                                                openStatFunc(row?.id)
                                                            }}
                                                        />
                                                        <span className="slider absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[#828282] transition duration-400 rounded-full peer-checked:bg-[#1473A1]"></span>
                                                        <span className="dot absolute h-5 w-5 left-0.5 bottom-0.5 bg-white transition duration-400 rounded-full peer-checked:translate-x-full"></span>
                                                    </label>
                                                </div>
                                            }</td>
                                        )}
                                        {columnVisibility.path_no && (
                                            <td className="px-2 py-1 text-[#464255]">{row?.path_no}</td>
                                        )}
                                        {/* <td className="px-2 py-1  justify-center ">{row?.entry_exit && <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.entry_exit?.color }}>{`${row?.entry_exit?.name}`}</div>}</td> */}

                                        {columnVisibility.revised_cap && (
                                            <td className="flex px-2 py-1 items-center">
                                                {row?.revised_capacity_path?.map((item: any, index: any) => (
                                                    <React.Fragment key={item.id}>
                                                        <div
                                                            className={`flex justify-center items-center`}
                                                            style={{
                                                                backgroundColor: item?.area?.color,
                                                                width: '30px',
                                                                height: '30px',
                                                                borderRadius: item?.revised_capacity_path_type_id === 1 ? '4px' : '50%',
                                                            }}
                                                        >
                                                            {/* <span className="text-white">{item?.area?.name}</span> */}
                                                            {/* <span className={`${item?.revised_capacity_path_type_id === 1 ? 'text-white' : 'text-black'} text-[13px]`}>{item?.area?.name}</span> */}
                                                            <span className={`text-black text-[13px]`}>{item?.area?.name}</span>
                                                        </div>

                                                        {index < row?.revised_capacity_path?.length - 1 && (
                                                            <span className="text-gray-500">{'→'}</span>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </td>
                                        )}

                                        {columnVisibility.create_by && (
                                            <td className="px-2 py-1 text-[#464255]">
                                                <div>
                                                    <span className="text-[#464255]">{row?.create_by_account?.first_name} {row?.create_by_account?.last_name}</span>
                                                    <div className="text-gray-500 text-xs">{formatDate(row?.create_date)}</div>
                                                </div>
                                            </td>
                                        )}

                                        {/* {columnVisibility.update_by && (
                                            <td className="px-2 py-1 text-[#464255]">
                                                <div>
                                                    <span className="text-[#464255]">{row?.update_by_account?.first_name} {row?.update_by_account?.last_name}</span>
                                                    <div className="text-gray-500 text-xs">{row?.update_date && formatDate(row?.update_date)}</div>
                                                </div>
                                            </td>
                                        )} */}
                                        {columnVisibility.action && (
                                            <td className="px-2 py-1">
                                                {/* <div className="relative inline-block text-left "> */}
                                                <div className="relative inline-flex justify-center items-center w-full">
                                                    <BtnActionTable togglePopover={togglePopover} row_id={row?.id} disable={!userPermission?.f_edit && !userPermission?.f_create ? true : false} />
                                                    {openPopoverId === row?.id && (
                                                        <div ref={popoverRef}
                                                            className="absolute left-[-12rem] top-[-10px] mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                                                            <ul className="py-2">
                                                                {/* <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("edit", row?.id) }}><EditOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Edit`}</li>
                                                                <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("update_stat", row?.id) }}><CheckCircleRoundedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Update Status`}</li>
                                                                <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("duplicate", row?.id) }}><ContentCopyIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Duplicate`}</li> */}
                                                                {/* {
                                                                    userPermission?.f_edit && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("edit", row?.id) }}><EditOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Edit`}</li>
                                                                } */}
                                                                {
                                                                    userPermission?.f_edit && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("update_stat", row?.id) }}><CheckCircleRoundedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Update Status`}</li>
                                                                }
                                                                {
                                                                    userPermission?.f_create && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("duplicate", row?.id) }}><ContentCopyIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Duplicate`}</li>
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

export default TableConfigMasterPath;