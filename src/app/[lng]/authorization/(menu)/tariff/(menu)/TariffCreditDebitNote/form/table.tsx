import { useEffect, useRef } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import BtnActionTable from "@/components/other/btnActionInTable";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import NodataTable from "@/components/other/nodataTable";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import dayjs from "dayjs";
import { iconButtonClass } from "@/utils/generalFormatter";

interface TableProps {
  openEditForm: (id: any) => void;
  openViewForm: (id: any) => void;
  openHistoryForm: (id: any) => void;
  openReasonModal: (id?: any, data_comment?: any, row?: any) => void;
  tableData: any;
  userDT: any;
  isLoading: any;
  columnVisibility: any;
  userPermission?: any;
}

// หน้า credit/debit note

// ที่ต้องให้แบงค์เพิ่ม เส้น GET tariff/tariffCreditDebitNote/findAllTariffCreditDebitNote?limit=100&offset=0
// 1. ข้อมูล shipper
// 2. ข้อมูล tariff_type_charge
// 3. ข้อมูล tariff_id


// หน้า tariff charge report
// 1. ข้อมูล commodity

const TableTariffCreditDebitNote: React.FC<TableProps> = ({ openEditForm, openViewForm, openHistoryForm, tableData, isLoading, columnVisibility, userPermission, openReasonModal, userDT }) => {

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
    <div className={`relative h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md z-1`}>

      {
        isLoading ?
          <table className="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
              <tr className="h-9">

                {columnVisibility.shipper_name && (
                  <th scope="col" className={`${table_sort_header_style} `} onClick={() => handleSort("shipper.name", sortState, setSortState, setSortedData, tableData)}>
                    {`Shipper Name`}
                    {getArrowIcon("shipper.name")}
                  </th>
                )}

                {columnVisibility.month_year && (
                  <th scope="col" className={`${table_sort_header_style} `} onClick={() => handleSort("month_year_charge_format", sortState, setSortState, setSortedData, tableData)}>
                    {`Month/Year`}
                    {getArrowIcon("month_year_charge_format")}
                  </th>
                )}

                {columnVisibility.cndn_id && (
                  <th scope="col" className={`${table_sort_header_style} `} onClick={() => handleSort("cndn_id", sortState, setSortState, setSortedData, tableData)}>
                    {`CNDN ID`}
                    {getArrowIcon("cndn_id")}
                  </th>
                )}

                {columnVisibility.type_charge && (
                  <th scope="col" className={`${table_sort_header_style} `} onClick={() => handleSort("tariff_type_charge.name", sortState, setSortState, setSortedData, tableData)}>
                    {`Type Charge`}
                    {getArrowIcon("tariff_type_charge.name")}
                  </th>
                )}

                {columnVisibility.cndn_type && (
                  <th scope="col" className={`${table_sort_header_style} `} onClick={() => handleSort("tariff_credit_debit_note_type.name", sortState, setSortState, setSortedData, tableData)}>
                    {`CNDN Type`}
                    {getArrowIcon("tariff_credit_debit_note_type.name")}
                  </th>
                )}

                {columnVisibility.comment && (
                  <th scope="col" className={`${table_header_style} text-center`} >
                    {`Comment`}
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
              {sortedData && sortedData?.map((row: any, index: any) => (
                <tr
                  key={row?.id}
                  className={`${table_row_style}`}
                >

                  {columnVisibility.shipper_name && (
                    <td className="px-2 py-1 text-[#464255]">{row?.shipper ? row?.shipper?.name : ''}</td>
                  )}

                  {columnVisibility.month_year && (
                    <td className={`px-2 py-1 text-[#464255] min-w-[120px] `}>{row?.month_year_charge ? dayjs(row?.month_year_charge).format("MMMM YYYY") : '-'}</td>
                  )}

                  {columnVisibility.cndn_id && (
                    <td className="px-2 py-1 text-[#464255]">{row?.cndn_id ? row?.cndn_id : ''}</td>
                  )}

                  {columnVisibility.type_charge && (
                    <td className="px-2 py-1 text-[#464255]">{row?.tariff_type_charge ? row?.tariff_type_charge?.name : ''}</td>
                  )}

                  {columnVisibility.cndn_type && (
                    <td className="px-2 py-1 text-[#464255]">{row?.tariff_credit_debit_note_type ? row?.tariff_credit_debit_note_type?.name : ''}</td>
                  )}

                  {columnVisibility.comment && (
                    <td className="px-2 py-1 text-center">
                      <div className="inline-flex items-center justify-center relative">
                        {/* <button
                          type="button"
                          className="flex items-center justify-center px-[2px] py-[2px] bg-white rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                          onClick={() => openReasonModal(row?.id, row?.tariff_credit_debit_note_comment, row)}
                          // disabled={!userPermission?.f_view}
                          disabled={false}
                        >
                          <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                        </button> */}

                        <button
                          type="button"
                          className={iconButtonClass}
                          onClick={() => openReasonModal(row?.id, row?.tariff_credit_debit_note_comment, row)}
                          disabled={false}
                        >
                          <ChatBubbleOutlineOutlinedIcon
                            fontSize="inherit"
                            className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                            sx={{ color: 'currentColor', fontSize: 18 }}
                          />
                        </button>

                        <span className="px-2 text-[#464255]">
                          {row?.tariff_credit_debit_note_comment?.length}
                        </span>
                      </div>
                    </td>
                  )}

                  {columnVisibility.action && (
                    <td className="px-2 py-1">
                      <div className="relative inline-flex justify-center items-center">
                        {/* <BtnActionTable togglePopover={togglePopover} row_id={row?.id} disable={!userPermission?.f_view && !userPermission?.f_edit ? true : false} /> */}
                        <BtnActionTable togglePopover={togglePopover} row_id={row?.id} disable={!userPermission?.f_view ? true : false} />
                        {openPopoverId === row?.id && (
                          <div ref={popoverRef}
                            className="absolute left-[-12rem] top-[-10px] mt-2 w-[200px] bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                            <ul className="py-2 w-[200px]">
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

      {
        isLoading && sortedData?.length == 0 && <NodataTable />
      }
    </div>
  )
}

export default TableTariffCreditDebitNote;