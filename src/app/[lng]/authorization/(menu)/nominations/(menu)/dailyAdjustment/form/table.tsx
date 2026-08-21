import { useEffect, useRef } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatDate, formatDateNoTime, formatDateTimeSec, iconButtonClass } from '@/utils/generalFormatter';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import BtnActionTable from "@/components/other/btnActionInTable";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import NodataTable from "@/components/other/nodataTable";

interface TableProps {
  openEditForm: (id: any) => void;
  openViewForm: (id: any) => void;
  openHistoryForm: (id: any) => void;
  openAllFileModal: (id?: any, data?: any) => void;
  openShipperModal: (id?: any, group_data?: any, data?: any) => void;
  openReasonModal: (id?: any, data_comment?: any, row?: any) => void;
  setDataReGen: any;
  selectedRoles: any;
  setSelectedRoles: any;
  tableData: any;
  userDT: any;
  isLoading: any;
  columnVisibility: any;
  userPermission?: any;
}

const TableNomDailyAdjustment: React.FC<TableProps> = ({ openEditForm, openViewForm, openHistoryForm, tableData, isLoading, columnVisibility, userPermission, openAllFileModal, openReasonModal, openShipperModal, setDataReGen, selectedRoles, setSelectedRoles, userDT }) => {

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

  // const [selectAll, setSelectAll] = useState(false);

  // const handleSelectAll = () => {
  //   const newSelectAll = !selectAll;
  //   setSelectAll(newSelectAll);

  //   if (newSelectAll) {
  //     // Select all roles
  //     const allRoles = sortedData?.map((role: any) => ({ id: role.id }));
  //     setSelectedRoles(allRoles);
  //   } else {
  //     // Deselect all roles
  //     setSelectedRoles([]);
  //   }
  // };

  // const handleSelectRole = (id: any) => {
  //    
  //   const existingRole = selectedRoles.find((role: any) => role.id === id);
  //   if (existingRole) {
  //     // Deselect the role
  //     setSelectedRoles(selectedRoles.filter((role: any) => role.id !== id));
  //   } else {
  //     // Select the role
  //     setSelectedRoles([...selectedRoles, { id }]);
  //   }
  // };

  return (
    <div className={`relative h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md z-1`}>

      {
        isLoading ?
          <table className="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
              <tr className="h-9">

                {columnVisibility.status && (
                  <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("daily_adjustment_status.name", sortState, setSortState, setSortedData, tableData)}>
                    {`Status`}
                    {getArrowIcon("daily_adjustment_status.name")}
                  </th>
                )}

                {columnVisibility.gas_day && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("gas_day", sortState, setSortState, setSortedData, tableData)}>
                    {`Gas Day`}
                    {getArrowIcon("gas_day")}
                  </th>
                )}

                {columnVisibility.time && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("time", sortState, setSortState, setSortedData, tableData)}>
                    {`Time`}
                    {getArrowIcon("time")}
                  </th>
                )}

                {columnVisibility.daily_adjustment_code && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("daily_code", sortState, setSortState, setSortedData, tableData)}>
                    {`Daily Adjustment Code`}
                    {getArrowIcon("daily_code")}
                  </th>
                )}

                {columnVisibility.shipper_name && (
                  <th
                    scope="col"
                    className={`${table_header_style}`}
                  // onClick={() => handleSort("shipper_name", sortState, setSortState, setSortedData, tableData)}
                  >
                    {`Shipper Name`}
                    {/* {getArrowIcon("shipper_name")} */}
                  </th>
                )}

                {columnVisibility.reasons && (
                  <th scope="col" className={`${table_header_style} text-center`} >
                    {`Reasons`}
                  </th>
                )}

                {columnVisibility.created_by && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("create_by_account.first_name", sortState, setSortState, setSortedData, tableData)}>
                    {`Created by`}
                    {getArrowIcon("create_by_account.first_name")}
                  </th>
                )}

                {columnVisibility.updated_by && (
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
              {sortedData && sortedData?.map((row: any, index: any) => {

                return (
                  <tr
                    key={row?.id}
                    className={`${table_row_style}`}
                  >

                    {/* const initialColumns: any = [
                      { key: 'status', label: 'Status', visible: true },
                      { key: 'gas_day', label: 'Gas Day', visible: true },
                      { key: 'time', label: 'Time', visible: true },
                      { key: 'daily_adjustment_code', label: 'Daily Adjustment Code', visible: true },
                      { key: 'shipper_name', label: 'Shipper Name', visible: true },
                      { key: 'reasons', label: 'Reasons', visible: true },
                      { key: 'created_by', label: 'Created by', visible: true },
                      { key: 'updated_by', label: 'Updated by', visible: true },
                      { key: 'action', label: 'Action', visible: true }
                  ]; */}

                    {columnVisibility.status && (
                      <td className="px-2 py-1 justify-center">
                        {
                          <div className="flex min-w-[130px] max-w-[190px] w-auto text-center justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: String(row?.daily_adjustment_status?.color) }}>{row?.daily_adjustment_status?.name}</div>
                        }
                      </td>
                    )}

                    {columnVisibility.gas_day && (
                      <td className="px-2 py-1 text-[#464255]">{row?.gas_day ? formatDateNoTime(row?.gas_day) : ''}</td>
                    )}

                    {columnVisibility.time && (
                      <td className="px-2 py-1 text-[#464255]">{row?.time ? row?.time : ''}</td>
                    )}

                    {columnVisibility.daily_adjustment_code && (
                      <td className="px-2 py-1 text-[#464255]">{row?.daily_code ? row?.daily_code : ''}</td>
                    )}

                    {/* {columnVisibility.shipper_name && (
                    <td className="px-2 py-1 text-[#464255]">{row?.group ? row?.group?.name : ''}</td>
                  )} */}

                    {columnVisibility.shipper_name && (
                      <td className="px-2 py-1 text-center">
                        {row?.daily_adjustment_group?.length == 1 ?
                          <></> :
                          <div className="inline-flex items-center justify-center relative">
                            <button
                              type="button"
                              className="flex items-center justify-center px-[2px] py-[2px] bg-white rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                              onClick={() => openShipperModal(row?.id, row?.daily_adjustment_group, row)}
                              disabled={!userPermission?.f_view}
                            >
                              <PeopleAltRoundedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                            </button>
                            <span className="px-2 text-[#464255]">
                              {row?.daily_adjustment_group?.length}
                            </span>
                          </div>
                        }
                      </td>
                    )}

                    {columnVisibility.reasons && (
                      <td className="px-2 py-1 text-center">
                        <div className="inline-flex items-center justify-center relative">
                          {/* <button
                            type="button"
                            className="flex items-center justify-center px-[2px] py-[2px] bg-white rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                            onClick={() => openReasonModal(row?.id, row?.daily_adjustment_reason, row)}
                            // disabled={row?.release_summary_comment?.length <= 0 && true}
                            // disabled={!userPermission?.f_view || row?.release_summary_comment?.length <= 0}
                            disabled={!userPermission?.f_view}
                          >
                            <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                          </button> */}

                          <button
                            type="button"
                            className={iconButtonClass}
                            onClick={() => openReasonModal(row?.id, row?.daily_adjustment_reason, row)}
                            disabled={!userPermission?.f_view}
                          >
                            <ChatBubbleOutlineOutlinedIcon
                              fontSize="inherit"
                              className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                              sx={{ color: 'currentColor', fontSize: 18 }}
                            />
                          </button>

                          <span className="px-2 text-[#464255]">
                            {row?.daily_adjustment_reason?.length}
                          </span>
                        </div>
                      </td>
                    )}

                    {columnVisibility.created_by && (
                      <td className="px-2 py-1">
                        <div>
                          <span className="text-[#464255]">{row?.create_by_account?.first_name} {row?.create_by_account?.last_name}</span>
                          <div className="text-gray-500 text-xs">{row?.create_date ? formatDate(row?.create_date) : ''}</div>
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


                    {/* 
                  
                  {
                      "id": 3,
                      "name": "Rejected",
                      "color": "#FFF1CE"
                  }
                  {
                      "id": 2,
                      "name": "Approved",
                      "color": "#C2F5CA"
                  }
                  {
                      "id": 1,
                      "name": "Submitted",
                      "color": "#D0E5FD"
                  }
                  */}

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
                                {/* {
                                userPermission?.f_edit || (row?.daily_adjustment_status_id !== 2 || row?.daily_adjustment_status_id !== 3) && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("edit", row?.id) }}>
                                  <CheckCircleRoundedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Update Status`}
                                </li>
                              } */}

                                {
                                  (row?.daily_adjustment_status_id !== 2 && row?.daily_adjustment_status_id !== 3) ?
                                    userDT?.account_manage?.[0]?.user_type_id !== 3 && userPermission?.f_edit && (
                                      <li
                                        className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer"
                                        onClick={() => toggleMenu("edit", row?.id)}
                                      >
                                        <CheckCircleRoundedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} />
                                        {`Update Status`}
                                      </li>
                                    )
                                    : <></>
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

      {
        isLoading && sortedData?.length == 0 && <NodataTable />
      }

    </div>

  )
}

export default TableNomDailyAdjustment;