import { useEffect, useRef } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { anonymizeEmail, formatDateNoTime, maskLastFiveDigits } from '@/utils/generalFormatter';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import SupervisorAccountRoundedIcon from '@mui/icons-material/SupervisorAccountRounded';
import BtnActionTable from "@/components/other/btnActionInTable";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
interface TableProps {
  openEditForm: (id: any) => void;
  openViewForm: (id: any) => void;
  openTransfer: (id: any) => void;
  handleActive: (id: any, isActive: any) => void;
  openHistoryForm: (id: any) => void;
  openDiv: (id: any, dataDiv: any, dataShipper: any) => void;
  tableData: any;
  isLoading: any;
  columnVisibility?: any;
  istrLoading: any;
  settrIsLoading: any;
  selectedKey: any;
  setselectedKey: any;
  userPermission?: any;
}

const TableShippersGroup: React.FC<TableProps> = ({ openEditForm, openViewForm, openTransfer, openDiv, handleActive, openHistoryForm, tableData, isLoading, columnVisibility, istrLoading, settrIsLoading, selectedKey, setselectedKey, userPermission }) => {

  const [sortState, setSortState] = useState({ column: null, direction: null });
  const [sortedData, setSortedData] = useState(tableData);
  useEffect(() => {
    if (tableData && tableData.length > 0) {
      setSortedData(tableData);
    }
    setSortedData(tableData);

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

  const handleChange = (isChecked: any) => {
  };

  return (
    <div className="h-[calc(100vh-380px)] overflow-y-auto overflow-x-auto rounded-t-md relative z-1">
      {
        isLoading ?
          <table className="min-w-full text-sm text-left rtl:text-right text-gray-500 whitespace-nowrap">
            <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
              <tr className="h-9">

                {columnVisibility.status && (
                  <th scope="col" className={`${table_header_style}`}>
                    {`Status`}
                  </th>
                )}

                {columnVisibility.id_name && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("id_name", sortState, setSortState, setSortedData, tableData)}>
                    {`Shipper ID`}
                    {getArrowIcon("id_name")}
                  </th>
                )}

                {columnVisibility.name && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("name", sortState, setSortState, setSortedData, tableData)}>
                    {`Shipper Name`}
                    {getArrowIcon("name")}
                  </th>
                )}

                {columnVisibility.company_name && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("company_name", sortState, setSortState, setSortedData, tableData)}>
                    {`Shipper Company Name`}
                    {getArrowIcon("company_name")}
                  </th>
                )}

                {columnVisibility.division_name && (
                  <th scope="col" className={`${table_header_style}`}>
                    {`Division Name`}
                  </th>
                )}

                {columnVisibility.role_default && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("role.name", sortState, setSortState, setSortedData, tableData)}>
                    {`Default Role`}
                    {getArrowIcon("role.name")}
                  </th>
                )}

                {columnVisibility.address && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("address", sortState, setSortState, setSortedData, tableData)}>
                    {`Address`}
                    {getArrowIcon("address")}
                  </th>
                )}

                {columnVisibility.telephone && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("telephone", sortState, setSortState, setSortedData, tableData)}>
                    {`Telephone`}
                    {getArrowIcon("telephone")}
                  </th>
                )}

                {columnVisibility.email && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("email", sortState, setSortState, setSortedData, tableData)}>
                    {`Email`}
                    {getArrowIcon("email")}
                  </th>
                )}

                {columnVisibility.bank_account && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("bank_no", sortState, setSortState, setSortedData, tableData)}>
                    {`Bank Account`}
                    {getArrowIcon("bank_no")}
                  </th>
                )}

                {columnVisibility.start_date && (
                  <th
                    scope="col"
                    className={`${table_sort_header_style}`}
                    onClick={() => handleSort("start_date", sortState, setSortState, setSortedData, tableData)}
                  >
                    {`Start Date`}
                    {getArrowIcon("start_date")}
                  </th>
                )}

                {columnVisibility.end_date && (
                  <th
                    scope="col"
                    className={`${table_sort_header_style}`}
                    onClick={() => handleSort("end_date", sortState, setSortState, setSortedData, tableData)}
                  >
                    {`End Date`}
                    {getArrowIcon("end_date")}
                  </th>
                )}

                {columnVisibility.group_id && (
                  <th scope="col" className={`${table_header_style}`}>
                    {`Group ID`}
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
                  style={{ backgroundColor: istrLoading && selectedKey == row?.id ? "#f8f8f8" : "#fff" }}
                >
              
                  {columnVisibility.status && (
                    <td className="px-2 py-1">

                      <div>
                        <label className="relative inline-block w-11 h-6 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={row?.status}
                            className="sr-only peer"
                            onChange={(e) => {
                              handleActive(row?.id, e.target.checked);
                            }}
                            disabled={!userPermission?.f_edit}
                          />
                          <span className="slider absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[#828282] transition duration-400 rounded-full peer-checked:bg-[#1473A1]"></span>
                          <span className="dot absolute h-5 w-5 left-0.5 bottom-0.5 bg-white transition duration-400 rounded-full peer-checked:translate-x-full"></span>
                        </label>
                      </div>

                    </td>
                  )}

                  {columnVisibility.id_name && (
                    <td className={`px-2 py-1 ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.id_name ? row?.id_name : '-'}</td>
                  )}

                  {columnVisibility.name && (
                    <td className={`px-2 py-1 ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.name ? row?.name : '-'}</td>
                  )}

                  {columnVisibility.company_name && (
                    <td className={`px-2 py-1`}>
                      <div className={`max-w-[500px] ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>
                        {row?.company_name ? row?.company_name : '-'}
                      </div>
                    </td>
                  )}

                  {columnVisibility.division_name && (
                    <td className="px-2 py-1 text-center">
                      <div className="inline-flex items-center justify-center relative">
                        <button
                          type="button"
                          className={`flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative`}
                          onClick={() => openDiv(row?.id, row?.division, { "id_name": row?.id_name, "name": row?.name, "company_name": row?.company_name })}
                          // disabled={row?.division.length <= 0 && true}
                          disabled={!userPermission?.f_view || row?.system_login_account?.length <= 0}
                        >
                          <SupervisorAccountRoundedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                        </button>
                        <span className="px-2 text-[#464255]">
                          {row?.division.length}
                        </span>
                      </div>
                    </td>
                  )}

                  {columnVisibility.role_default && (
                    <td className={`px-2 py-1 ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.role_default?.length > 0 ? row?.role_default[0]?.role ? row?.role_default[0]?.role?.name : '' : ''}</td>
                  )}

                  {columnVisibility.address && (
                    <td className={`px-2 py-1 ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.address ? row?.address : ''}</td>
                  )}

                  {columnVisibility.telephone && (
                    <td className={`px-2 py-1 ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.telephone ? maskLastFiveDigits(row?.telephone) : ''}</td>
                  )}

                  {columnVisibility.email && (
                    <td className={`px-2 py-1 ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.email ? anonymizeEmail(row?.email) : ''}</td>
                  )}

                  {columnVisibility.bank_account && (
                    <td className={`px-2 py-1 ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.bank_no ? maskLastFiveDigits(row?.bank_no) : ''}</td>
                  )}

                  {columnVisibility.start_date && (
                    <td className={`px-2 py-1 ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"} `}>{row.start_date ? formatDateNoTime(row.start_date) : ''}</td>
                  )}

                  {columnVisibility.end_date && (
                    <td className={`px-2 py-1 ${row?.status ? "text-[#0DA2A2]" : "text-[#9CA3AF]"}`}>{row.end_date ? formatDateNoTime(row.end_date) : ''}</td>
                  )}

                  {columnVisibility.group_id && (
                    <td className="px-2 py-1">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          // onClick={() => openTransfer(row?.id)}
                          onClick={() => {
                            if (userPermission?.f_edit) {
                              openTransfer(row?.id);
                            }
                          }}
                          disabled={!userPermission?.f_edit}
                          className={`px-[2px] py-[2px] rounded-md border border-[#DFE4EA] ${userPermission?.f_edit ? "text-[#00ADEF] hover:bg-blue-600 hover:text-white" : "text-gray-400 cursor-not-allowed bg-gray-200"}`}
                        >
                          <SettingsIcon sx={{ fontSize: 18 }} />
                        </button>
                      </div>
                    </td>
                  )}

                  {columnVisibility.action && (
                    <td className="px-2 py-1">
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
              ))}
            </tbody>
          </table>
          :
          <TableSkeleton />
      }
    </div>
  )
}

export default TableShippersGroup;