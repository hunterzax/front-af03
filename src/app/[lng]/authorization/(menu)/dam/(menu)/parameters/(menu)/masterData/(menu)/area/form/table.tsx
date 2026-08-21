import { useEffect, useRef } from "react";
import React, { FC, useState } from 'react';
import TableSkeleton, { DefaultSkeleton } from '@/components/material_custom/DefaultSkeleton';
import { formatDate, formatDateNoTime, formatNumber, formatNumberThreeDecimal, getContrastTextColor } from '@/utils/generalFormatter';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import BtnActionTable from "@/components/other/btnActionInTable";
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";

interface TableProps {
  openEditForm: (id: any) => void;
  openViewForm: (id: any) => void;
  openHistoryForm: (id: any) => void;
  tableData: any;
  isLoading: any;
  columnVisibility: any;
  userPermission?: any;
}

const TableArea: React.FC<TableProps> = ({ openEditForm, openViewForm, openHistoryForm, tableData, isLoading, columnVisibility, userPermission }) => {

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

  return (
    <div className={`h-[calc(100vh-380px)] overflow-y-auto block rounded-t-md relative z-10`}>
      {
        isLoading ?
          <table className="w-full text-sm text-left rtl:text-right table-auto">
            <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-30">
              <tr className="h-9">

                {columnVisibility.entry_exit && (
                  <th
                    scope="col"
                    className={`${table_sort_header_style}`}
                    onClick={() => handleSort("entry_exit_id", sortState, setSortState, setSortedData, tableData)}
                  >
                    {`Entry / Exit`}
                    {getArrowIcon("entry_exit_id")}
                  </th>
                )}

                {columnVisibility.zone && (
                  <th
                    scope="col"
                    className={`${table_sort_header_style}`}
                    onClick={() => handleSort("zone_id", sortState, setSortState, setSortedData, tableData)}
                  >
                    {`Zone`}
                    {getArrowIcon("zone_id")}
                  </th>
                )}

                {columnVisibility.name && (
                  <th
                    scope="col"
                    className={`${table_sort_header_style}`}
                    onClick={() => handleSort("name", sortState, setSortState, setSortedData, tableData)}
                  >
                    {`Area Name`}
                    {getArrowIcon("name")}
                  </th>
                )}

                {columnVisibility.desc && (
                  <th
                    scope="col"
                    className={`${table_sort_header_style}`}
                    onClick={() => handleSort("description", sortState, setSortState, setSortedData, tableData)}
                  >
                    {`Description`}
                    {getArrowIcon("description")}
                  </th>
                )}

                {columnVisibility.area_nom_cap && (
                  <th
                    scope="col"
                    className={`${table_sort_header_style}`}
                    onClick={() => handleSort("area_nominal_capacity", sortState, setSortState, setSortedData, tableData)}
                  >
                    {`Area Nominal Capacity (MMBTU/D)`}
                    {getArrowIcon("area_nominal_capacity")}
                  </th>
                )}

                {columnVisibility.supply_ref_quality && (
                  <th
                    scope="col"
                    className={`${table_sort_header_style}`}
                    onClick={() => handleSort("supply_reference_quality_area", sortState, setSortState, setSortedData, tableData)}
                  >
                    {`Supply Reference Quality Area`}
                    {getArrowIcon("supply_reference_quality_area")}
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

                {columnVisibility.create_by && (
                  <th
                    scope="col"
                    className={`${table_sort_header_style}`}
                    onClick={() => handleSort("create_by_account.first_name", sortState, setSortState, setSortedData, tableData)}
                  >
                    {`Created by`}
                    {getArrowIcon("create_by_account.first_name")}
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
                    key={row?.id}
                    className={`${table_row_style}`}
                  >

                    {columnVisibility.entry_exit && (
                      <td className="px-2 py-1  justify-center ">{row?.entry_exit && <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.entry_exit?.color }}>{`${row?.entry_exit?.name}`}</div>}</td>
                    )}

                    {columnVisibility.zone && (
                      <td className="px-2 py-1 h-[30px] justify-center">
                        {row?.zone && (
                          <div
                            className="flex justify-center items-center rounded-full p-1 text-[#464255] text-center"
                            style={{
                              backgroundColor: row?.zone?.color,
                              minWidth: '130px',
                              maxWidth: 'max-content',
                              wordWrap: 'break-word',
                              whiteSpace: 'normal',
                            }}
                          >
                            {`${row?.zone?.name}`}
                          </div>
                        )}
                      </td>
                    )}

                    {columnVisibility.name && (
                      <td className="px-2 py-1 justify-center ">
                        {
                          row?.entry_exit_id == 2 ?
                            <div
                              className="flex justify-center items-center rounded-full p-1 text-[#464255]"
                              style={{ backgroundColor: row?.color, width: '40px', height: '40px', color: getContrastTextColor(row?.color) }}
                            >
                              {`${row?.name}`}
                            </div>
                            :
                            <div
                              className="flex justify-center items-center rounded-lg p-1 text-[#464255]"
                              style={{ backgroundColor: row?.color, width: '40px', height: '40px', color: getContrastTextColor(row?.color) }}
                            >
                              {`${row?.name}`}
                            </div>
                        }
                      </td>
                    )}

                    {columnVisibility.desc && (
                      <td className="px-2 py-1 text-[#464255]">{row?.description}</td>
                    )}

                    {columnVisibility.area_nom_cap && (
                      <td className="px-2 py-1 text-right text-[#464255]">{row?.area_nominal_capacity ? formatNumberThreeDecimal(row?.area_nominal_capacity) : ''}</td>
                    )}

                    {/* {columnVisibility.supply_ref_quality && (
                      <td className="px-2 py-1 text-right text-[#464255]">{!!row?.supply_reference_quality_area && row?.supply_reference_quality_area_by?.name}</td>
                    )} */}

                    {columnVisibility.supply_ref_quality && (
                      <td className="flex justify-center items-center mt-2">
                        {row?.supply_reference_quality_area_by ? (
                          row?.supply_reference_quality_area_by?.entry_exit_id == 2 ? (
                            <div
                              className="flex justify-center items-center rounded-full p-1 text-[#464255]"
                              style={{
                                backgroundColor: row?.supply_reference_quality_area_by?.color,
                                color: getContrastTextColor(row?.supply_reference_quality_area_by?.color),
                                width: '40px',
                                height: '40px',
                              }}
                            >
                              {row?.supply_reference_quality_area_by?.name}
                            </div>
                          ) : (
                            <div
                              className="flex justify-center items-center rounded-lg p-1 text-[#464255]"
                              style={{
                                backgroundColor: row?.supply_reference_quality_area_by?.color,
                                color: getContrastTextColor(row?.supply_reference_quality_area_by?.color),
                                width: '40px',
                                height: '40px',
                              }}
                            >
                              {row?.supply_reference_quality_area_by?.name}
                            </div>
                          )
                        ) : null}
                      </td>
                    )}

                    {columnVisibility.start_date && (
                      <td className="px-2 py-1 text-[#464255]">{row?.start_date ? formatDateNoTime(row?.start_date) : ''}</td>
                    )}

                    {columnVisibility.end_date && (
                      <td className="px-2 py-1 text-[#0DA2A2]">{row?.end_date ? formatDateNoTime(row?.end_date) : ''}</td>
                    )}

                    {columnVisibility.create_by && (
                      <td className="px-2 py-1 text-[#464255]">
                        <div>
                          <span className="text-[#464255]">{row?.create_by_account?.first_name} {row?.create_by_account?.last_name}</span>
                          <div className="text-gray-500 text-xs">{formatDate(row?.create_date)}</div>
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
                              className="absolute left-[-8rem] top-[-10px] mt-2 w-36 bg-white border border-gray-300 rounded-lg shadow-lg z-20"
                            >
                              <ul className="py-2">
                                {
                                  userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("view", row?.id) }}><RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> View</li>
                                }
                                {
                                  userPermission?.f_edit && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("edit", row?.id) }}><EditOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> Edit</li>
                                }
                                {
                                  userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("history", row?.id) }}><RestoreOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> History</li>
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

export default TableArea;