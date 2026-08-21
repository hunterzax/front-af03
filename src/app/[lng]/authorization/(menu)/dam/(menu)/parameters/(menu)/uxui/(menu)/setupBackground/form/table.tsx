import { useEffect, useRef } from "react";
import React, { FC, useState } from 'react';
import TableSkeleton, { DefaultSkeleton } from '@/components/material_custom/DefaultSkeleton';
import { cutUploadFileName, formatDate, formatDateNoTime, formatDateTimeSec, formatNumber } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style, table_sort_header_style_original } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import BtnActionTable from "@/components/other/btnActionInTable";
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

interface TableProps {
    openEditForm: (id: any) => void;
    openViewForm: (id: any) => void;
    openDeleteForm: (id: any) => void;
    handleActive: (id: any, isActive: any) => void;
    tableData: any;
    isLoading: any;
    userPermission?: any;
}
const TableSetupBackground: React.FC<TableProps> = ({ openDeleteForm, openEditForm, openViewForm, handleActive, tableData, isLoading, userPermission }) => {

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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

    const handleImageClick = (imageUrl: any) => {
        setSelectedImage(imageUrl);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedImage('');
    };

      const togglePopover = (id: any) => {
            if (openPopoverId === id) {
            setOpenPopoverId(null);
            } else {
            setOpenPopoverId(id);
            }
        };

      const toggleMenu = (mode: any, id: any) => {
        switch (mode) {
        case "delete":
            openDeleteForm(id);
            setOpenPopoverId(null); // close popover
            break;
        }
    }

    return (
        <div className={`h-[calc(100vh-300px)] overflow-y-auto block  rounded-t-md relative z-1`}>
            {
                isLoading ?
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-9">
                                <th scope="col" className={`${table_header_style}`}  >
                                    {`Active`}
                                </th>

                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("id", sortState, setSortState, setSortedData, tableData)} >
                                    {`No.`}
                                    {getArrowIcon("id")}
                                </th>

                                <th scope="col" className={`${table_header_style} text-center`}>
                                    {`Image Preview`}
                                </th>
                                {/* <th scope="col" className="whitespace-nowrap px-2 py-1">
                                    {`Created by`}
                                </th> */}
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("update_by_account.first_name", sortState, setSortState, setSortedData, tableData)} >
                                    {`Updated by`}
                                    {getArrowIcon("update_by_account.first_name")}
                                </th>
                               <th scope="col" className={`${table_header_style} text-center`}>
                                {`Action`}
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {sortedData && sortedData.map((row: any, index: any) => {
                                return (
                                    <tr
                                        key={row?.id}
                                        className={`${table_row_style}`}
                                    >
                                        {/* <td className="px-2 py-1">
                                            <div>
                                                <label className="relative inline-block w-11 h-6 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        // defaultChecked={row?.status}
                                                        checked={row?.active}
                                                        className="sr-only peer"
                                                        onChange={(e) => {
                                                            // handleChange(e.target.checked)
                                                            handleActive(row?.id, e.target.checked);
                                                        }}
                                                        disabled={userPermission?.f_edit ? true : false}
                                                    />
                                                    <span className="slider absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 transition duration-400 rounded-full peer-checked:bg-[#1473A1]"></span>
                                                    <span className="dot absolute h-4 w-4 left-1 bottom-1 bg-white transition duration-400 rounded-full peer-checked:translate-x-full"></span>
                                                </label>
                                            </div>
                                        </td> */}

                                        <td className="px-2 py-1">
                                            <div>
                                                <label className="relative inline-block w-11 h-6 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        // defaultChecked={row?.status}
                                                        checked={row?.active}
                                                        className="sr-only peer"
                                                        onChange={(e) => {
                                                            // handleChange(e.target.checked)
                                                            handleActive(row?.id, e.target.checked);
                                                        }}
                                                        disabled={userPermission?.f_edit ? false : true}
                                                    />
                                                    <span className="slider absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[#828282] transition duration-400 rounded-full peer-checked:bg-[#1473A1]"></span>
                                                    <span className="dot absolute h-5 w-5 left-0.5 bottom-0.5 bg-white transition duration-400 rounded-full peer-checked:translate-x-full"></span>
                                                </label>
                                            </div>
                                        </td>

                                        <td className="px-2 py-1 text-[#464255] justify-center items-center">{index + 1}</td>

                                        <td className="px-2 py-1 text-[#464255] flex justify-center items-center">
                                            <img
                                                src={row?.url}
                                                // src={'https://demo4.nueamek.com/tpa-test/20250305133527_pg.jpg?X-Amz-Expires=86400&X-Amz-Date=20250305T092443Z&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=PXnZunw8j0OhDFhHMCNn%2F20250305%2Fth-west-rack1%2Fs3%2Faws4_request&X-Amz-SignedHeaders=host&X-Amz-Signature=9fc68e1e24affc0ddb908718be3eac1f6fa266fc14cb5f93bdc8792d60fb1c3b'}
                                                loading="lazy"
                                                className="w-auto h-[60px] rounded-[6px]"
                                                onClick={() => handleImageClick(row?.url)}
                                            >
                                            </img>
                                        </td>

                                        <td className="px-2 py-1">
                                            <div>
                                                <span className="text-[#464255]">{row?.update_by_account?.first_name} {row?.update_by_account?.last_name}</span>
                                                <div className="text-gray-500 text-xs">{row?.update_date ? formatDateTimeSec(row?.update_date) : ''}</div>
                                            </div>
                                        </td>

                                        <td className="px-2 py-1">
                                        <div className="relative inline-flex justify-center items-center">
                                            <BtnActionTable togglePopover={togglePopover} row_id={row?.id} disable={!userPermission?.f_view ? true : false} />
                                            {openPopoverId === row?.id && (
                                            <div ref={popoverRef}
                                                className="absolute left-[-12rem] top-[-10px] mt-2 w-[200px] bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                                                <ul className="py-2 w-[200px]">
                                                {
                                                    // userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("view", row?.id) }}><RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`View`}</li>
                                                    <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("delete", row?.id) }}><DeleteOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Delete`}</li>
                                                }
                                                </ul>
                                            </div>
                                            )}
                                        </div>
                                        </td>
                                        
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    :
                    <TableSkeleton />
            }


            {isModalOpen == true && selectedImage !== '' && (
                <div
                    className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-25 transition-opacity duration-300 ease-in-out ${isModalOpen == true ? 'opacity-100' : 'opacity-0'}`}
                    onClick={closeModal}
                >
                    <div className="relative">
                        <button
                            className="absolute top-2 right-2 text-white"
                            onClick={closeModal}
                        >
                            ✕
                        </button>
                        <img
                            src={selectedImage} // Use the selected image URL
                            alt="Enlarged"
                            className="max-w-full max-h-screen rounded-lg"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default TableSetupBackground;