import { useEffect, useRef } from "react";
import React, { FC, useState } from 'react';
import TableSkeleton, { DefaultSkeleton } from '@/components/material_custom/DefaultSkeleton';
import { formatDate, formatDateNoTime, formatNumber, formatNumberThreeDecimal } from '@/utils/generalFormatter';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AdjustIcon from '@mui/icons-material/Adjust';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import BtnActionTable from "@/components/other/btnActionInTable";

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";

interface TableProps {
  openEditForm: (id: any) => void;
  openViewForm: (id: any) => void;
  openHistoryForm: (id: any) => void;
  openDiv: (id: any, dataDiv: any, dataShipper: any) => void;
  openContractViewModal: (id?: any, group_data?:any, data?: any) => void;
  tableData: any;
  isLoading: any;
  columnVisibility: any;
  userPermission?: any;
}

const TableNominationPoint: React.FC<TableProps> = ({ openEditForm, openViewForm, openDiv, openHistoryForm, tableData, isLoading, columnVisibility, userPermission, openContractViewModal }) => {

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

                {columnVisibility.entry_exit && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("entry_exit_id", sortState, setSortState, setSortedData, tableData)}>
                    {`Entry / Exit`}
                    {getArrowIcon("entry_exit_id")}
                  </th>
                )}

                {columnVisibility.zone && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("zone_id", sortState, setSortState, setSortedData, tableData)}>
                    {`Zone`}
                    {getArrowIcon("zone_id")}
                  </th>
                )}

                {columnVisibility.area && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("area_id", sortState, setSortState, setSortedData, tableData)}>
                    {`Area`}
                    {getArrowIcon("area_id")}
                  </th>
                )}

                {columnVisibility.contract_point && (
                  // <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("contract_point_id", sortState, setSortState, setSortedData, tableData)}>
                  //   {`Contract Point`}
                  //   {getArrowIcon("contract_point_id")}
                  // </th>
                  <th scope="col" className={`${table_header_style}`}>
                    {`Contract Point`}
                  </th>
                )}

                {columnVisibility.nom_point && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("nomination_point", sortState, setSortState, setSortedData, tableData)}>
                    {`Nomination Point`}
                    {getArrowIcon("nomination_point")}
                  </th>
                )}

                {columnVisibility.desc && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("description", sortState, setSortState, setSortedData, tableData)}>
                    {`Description`}
                    {getArrowIcon("description")}
                  </th>
                )}

                {columnVisibility.customer_type && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("customer_type_id", sortState, setSortState, setSortedData, tableData)}>
                    {`Customer Type`}
                    {getArrowIcon("customer_type_id")}
                  </th>
                )}

                {columnVisibility.max_cap && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("maximum_capacity", sortState, setSortState, setSortedData, tableData)}>
                    {`Maximum Capacity (MMSFCD)`}
                    {getArrowIcon("maximum_capacity")}
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

                  {columnVisibility.entry_exit && (
                    <td className="px-2 py-1  justify-center ">{row?.entry_exit_id && <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.entry_exit?.color }}>{`${row?.entry_exit?.name}`}</div>}</td>
                  )}

                  {columnVisibility.zone && (
                    <td className="px-2 py-1  justify-center ">{row?.zone && <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.zone?.color }}>{`${row?.zone?.name}`}</div>}</td>
                  )}

                  {columnVisibility.area && (
                    <td className="px-2 py-1 justify-center ">
                      {
                        row?.area.entry_exit_id == 2 ?
                          <div
                            className="flex justify-center items-center rounded-full p-1 text-[#464255]"
                            style={{ backgroundColor: row?.area?.color, width: '40px', height: '40px' }}
                          >
                            {`${row?.area?.name}`}
                          </div>
                          :
                          <div
                            className="flex justify-center items-center rounded-lg p-1 text-[#464255]"
                            style={{ backgroundColor: row?.area?.color, width: '40px', height: '40px' }}
                          >
                            {`${row?.area?.name}`}
                          </div>
                      }
                    </td>
                  )}

                  {columnVisibility.contract_point && (
                    // <td className="px-2 py-1 text-[#464255]">{row?.contract_point?.contract_point}</td>
                    <td className="px-2 py-1 text-center">
                      <div className="inline-flex items-center justify-center relative">
                        <button
                          type="button"
                          className={`flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative`}
                          // onClick={() => openDiv(row?.id, row?.contract_point_list, { "entry_exit": row?.entry_exit, "zone": row?.zone, "area": row?.area, "nomination_point": row?.nomination_point })}
                          onClick={() => openContractViewModal(row?.id, row?.daily_adjustment_group, row)}
                          disabled={!userPermission?.f_view || row?.daily_adjustment_group?.length <= 0}
                        >
                          <AdjustIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                        </button>
                        <span className="px-2 text-[#464255]">
                          {row?.contract_point_list?.length || 0}
                        </span>
                      </div>
                    </td>
                  )}

                  {columnVisibility.nom_point && (
                    <td className="px-2 py-1 text-[#464255]">{row?.nomination_point}</td>
                  )}

                  {columnVisibility.desc && (
                    <td className="px-2 py-1 text-[#464255]">{row?.description}</td>
                  )}

                  {/* {columnVisibility.customer_type && (
                      <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("customer_type_id", sortState, setSortState, setSortedData, tableData)}>
                        {`Customer Type`}
                        {getArrowIcon("customer_type_id")}
                      </th>
                  )} */}

                  {columnVisibility.customer_type && (
                    <td className="px-2 py-1 text-[#464255]">{row?.customer_type?.name}</td>
                  )}

                  {columnVisibility.max_cap && (
                    // <td className="px-2 py-1 text-[#464255]">{row?.maximum_capacity ? formatNumber(row?.maximum_capacity) : ''}</td>
                    <td className="px-2 py-1 text-[#464255] text-right">{row?.maximum_capacity ? formatNumberThreeDecimal(row?.maximum_capacity) : ''}</td>
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
              ))}
            </tbody>
          </table>
          :
          <TableSkeleton />
      }
    </div>

  )
}

export default TableNominationPoint;