import { useEffect, useRef } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatDate, formatDateNoTime } from '@/utils/generalFormatter';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SupervisedUserCircleOutlinedIcon from '@mui/icons-material/SupervisedUserCircleOutlined';
import BtnActionTable from "@/components/other/btnActionInTable";

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
interface TableProps {
  openEditForm: (id: any) => void;
  openViewForm: (id: any) => void;
  openDupForm: (id: any) => void;
  openRoleModal: (id: any) => void;
  openHistoryForm: (id: any) => void;
  tableData: any;
  isLoading: any;
  columnVisibility?: any;
  userPermission?: any;
}

const TableRole: React.FC<TableProps> = ({ openEditForm, openViewForm, openDupForm, openHistoryForm, openRoleModal, tableData, isLoading, columnVisibility, userPermission }) => {

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
      setOpenPopoverId(null);
    } else {
      setOpenPopoverId(id);
    }
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
      case "dup":
        openDupForm(id);
        setOpenPopoverId(null);
        break;
      case "rolemgn":
        openRoleModal(id);
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
    <div className="h-[calc(100vh-380px)] overflow-y-auto overflow-x-auto rounded-t-md relative z-1">
      {
        isLoading ?
          <table className="min-w-full text-sm text-left rtl:text-right text-gray-500 whitespace-nowrap ">
            <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
              <tr className="h-9">
                {/* <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("user_type_id", sortState, setSortState, setSortedData, tableData)}>
                  {`User Type`}
                  {getArrowIcon("user_type_id")}
                </th>
                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("name", sortState, setSortState, setSortedData, tableData)}>
                  {`Role Name`}
                  {getArrowIcon("name")}
                </th>
                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("start_date", sortState, setSortState, setSortedData, tableData)}>
                  {`Start Date`}
                  {getArrowIcon("start_date")}
                </th>
                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("end_date", sortState, setSortState, setSortedData, tableData)}>
                  {`End Date`}
                  {getArrowIcon("end_date")}
                </th>
                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("update_by", sortState, setSortState, setSortedData, tableData)}>
                  {`Updated by`}
                  {getArrowIcon("update_by")}
                </th> */}

                {columnVisibility.user_type_id && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("user_type_id", sortState, setSortState, setSortedData, tableData)}>
                    {`User Type`}
                    {getArrowIcon("user_type_id")}
                  </th>
                )}
                {columnVisibility.name && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("name", sortState, setSortState, setSortedData, tableData)}>
                    {`Role Name`}
                    {getArrowIcon("name")}
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
              {sortedData && sortedData.map((row: any, index: any) => (
                <tr
                  key={row?.id}
                  className={`${table_row_style}`}
                >

                  {/* <td className="px-2 py-1 justify-center">
                    {
                      row?.user_type &&
                      <div className="flex w-[100px] bg-[#EEE4FF] justify-center !text-[14px] font-bold rounded-full p-1" style={{ backgroundColor: row?.user_type?.color, color: row?.user_type?.color_text }}>{row?.user_type?.name}</div>
                    }
                  </td>

                  <td className="px-2 py-1 text-[#464255]">{row?.name}</td>
                  <td className="px-2 py-1 text-[#464255]">{row?.start_date ? formatDateNoTime(row?.start_date) : ''}</td>
                  <td className="px-2 py-1 text-[#0DA2A2]">{row?.end_date ? formatDateNoTime(row?.end_date) : ''}</td>
                  <td className="px-2 py-1">
                    <div>
                      <span className="text-[#464255]">{row?.update_by_account?.first_name} {row?.update_by_account?.last_name}</span>
                      <div className="text-gray-500 text-xs">{row?.update_date ? formatDate(row?.update_date) : ''}</div>
                    </div>
                  </td> */}

                  {columnVisibility.user_type_id && (
                    <td className="px-2 py-1 justify-center">
                      {row.user_type && (
                        <div className="flex w-[100px] bg-[#EEE4FF] justify-center !text-[14px] font-bold rounded-full p-1" style={{ backgroundColor: row.user_type.color, color: row.user_type.color_text }}>
                          {row.user_type.name}
                        </div>
                      )}
                    </td>
                  )}
                  {columnVisibility.name && (
                    <td className="px-2 py-1 text-[#464255]">{row.name}</td>
                  )}
                  {columnVisibility.start_date && (
                    <td className="px-2 py-1 text-[#464255]">{row.start_date ? formatDateNoTime(row.start_date) : ''}</td>
                  )}
                  {columnVisibility.end_date && (
                    <td className="px-2 py-1 text-[#0DA2A2]">{row.end_date ? formatDateNoTime(row.end_date) : ''}</td>
                  )}
                  {columnVisibility.update_by && (
                    <td className="px-2 py-1">
                      <div>
                        <span className="text-[#464255]">{row.update_by_account?.first_name} {row.update_by_account?.last_name}</span>
                        <div className="text-gray-500 text-xs">{row.update_date ? formatDate(row.update_date) : ''}</div>
                      </div>
                    </td>
                  )}

                  {columnVisibility.action && (
                    <td className="px-2 py-1">
                      {/* <div className="relative inline-block text-left"> */}
                      <div className="relative inline-flex justify-center items-center w-full">
                        <BtnActionTable togglePopover={togglePopover} row_id={row?.id} disable={!userPermission?.f_view && !userPermission?.f_edit ? true : false} />
                        {openPopoverId === row?.id && (
                          <div ref={popoverRef}
                            className="absolute left-[-13rem] top-[-10px] mt-2 w-52 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                            <ul className="py-2">
                              {/* <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("view", row?.id) }}>
                                <RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> View
                              </li>
                              <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("edit", row?.id) }}>
                                <EditOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> Edit
                              </li>
                              <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("dup", row?.id) }}>
                                <ContentCopyIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> Duplicate
                              </li>
                              <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("rolemgn", row?.id) }}>
                                <SupervisedUserCircleOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> Role Management
                              </li>
                              <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("history", row?.id) }}>
                                <RestoreOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> History
                              </li> */}
                              {
                                userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("view", row?.id) }}><RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`View`}</li>
                              }
                              {
                                userPermission?.f_edit && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("edit", row?.id) }}><EditOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Edit`}</li>
                              }
                              {
                                userPermission?.f_edit && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("dup", row?.id) }}><ContentCopyIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> Duplicate</li>
                              }
                              {
                                userPermission?.f_edit && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("rolemgn", row?.id) }}><SupervisedUserCircleOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> Role Management</li>
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
              ))}
            </tbody>
          </table>
          :
          <TableSkeleton />
      }

    </div>
  )
}

export default TableRole;