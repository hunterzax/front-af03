import { useEffect, useRef } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatDateNoTime, formatNumberFourDecimal, iconButtonClass } from '@/utils/generalFormatter';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import BtnActionTable from "@/components/other/btnActionInTable";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import getUserValue from "@/utils/getuserValue";
import dayjs from 'dayjs';

interface TableProps {
  openEditForm: (id: any) => void;
  openViewForm: (id: any) => void;
  openHistoryForm: (id: any) => void;
  openReasonModal: (id?: any, data_comment?: any, row?: any) => void;
  setDataReGen: any;
  selectedRoles: any;
  setSelectedRoles: any;
  tableData: any;
  isLoading: any;
  columnVisibility: any;
  userPermission?: any;
  closeBalanceData?: any;
}

const TableVentCommissioningOtherGas: React.FC<TableProps> = ({ openEditForm, openViewForm, openHistoryForm, tableData, isLoading, columnVisibility, userPermission, openReasonModal, setDataReGen, selectedRoles, setSelectedRoles, closeBalanceData }) => {

  const [sortState, setSortState] = useState({ column: null, direction: null });
  const [sortedData, setSortedData] = useState(tableData);
  const [tk, settk] = useState(false);

  const userDT: any = getUserValue();

  useEffect(() => {
    if (tableData && tableData.length > 0) {
      setSortedData(tableData);
    } else {
      setSortedData([]);
    }

  }, [tableData, closeBalanceData]);

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



  // กรองข้อมูลที่วันที่ gas_day อยู่ก่อน close balance date
  const filterDeletables = (rows: any[], closeBalanceData?: { date_balance: string }) => {
    if (!closeBalanceData) return rows;

    // const closed = dayjs(closeBalanceData.date_balance);
    const closed = dayjs(closeBalanceData?.date_balance).endOf('month');

    return rows.filter((row) => {
      const d = dayjs(row.gas_day);
      // isDisable = closed.isAfter(d)  // (ตามสูตรเดิม)
      // ต้องการ "ลบได้" => !isDisable => !closed.isAfter(d)  => d.isSameOrAfter(closed)
      return !closed.isAfter(d); // d >= closed
    });
  };

  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    // Delete : ต้องไม่สามารถ Delete รายการก่อน Closed Balance ได้ ให้ disable ไปเลย https://app.clickup.com/t/86eujrgq1
    const deletableRows = filterDeletables(sortedData, closeBalanceData);

    if (newSelectAll) {
      // Select all roles
      // const allRoles = sortedData?.map((role: any) => ({ id: role.id }));
      const allRoles = deletableRows?.map((role: any) => ({ id: role.id }));
      setSelectedRoles(allRoles);
    } else {
      // Deselect all roles
      setSelectedRoles([]);
    }
  };

  const handleSelectRole = (id: any) => {
    const existingRole = selectedRoles.find((role: any) => role.id === id);
    if (existingRole) {
      // Deselect the role
      setSelectedRoles(selectedRoles.filter((role: any) => role.id !== id));
    } else {
      // Select the role
      setSelectedRoles([...selectedRoles, { id }]);
    }

    settk(!tk);
  };

  // setSelectAll มันโดน set อยู่ใน handleSelectAll อยู่แล้ว ตรงนี้ไม่จำเป็น 
  // useEffect(() => {
  //   if (selectedRoles?.length > 0 && selectedRoles?.length == sortedData?.length) {
  //     setSelectAll(true);
  //   } else if (selectedRoles?.length == 0 || selectedRoles?.length > 0 && selectedRoles?.length !== sortedData?.length) {
  //     setSelectAll(false);
  //   }
  // }, [selectedRoles])

  return (
    <div className={`relative h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md z-1`}>

      {
        isLoading ?
          <table className="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
              <tr className="h-9">

                {
                  userDT?.account_manage?.[0]?.user_type_id !== 3 && <th className={`${table_header_style} rounded-tl-[10px] min-w-[60px] text-center`}>
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1]"
                    />
                  </th>
                }

                {columnVisibility.gas_day && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("gas_day", sortState, setSortState, setSortedData, tableData)}>
                    {`Gas Day`}
                    {getArrowIcon("gas_day")}
                  </th>
                )}

                {columnVisibility.shipper_name && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("group.name", sortState, setSortState, setSortedData, tableData)}>
                    {`Shipper Name`}
                    {getArrowIcon("group.name")}
                  </th>
                )}

                {columnVisibility.zone && (
                  <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("zone.name", sortState, setSortState, setSortedData, tableData)}>
                    {`Zone`}
                    {getArrowIcon("zone.name")}
                  </th>
                )}

                {columnVisibility.vent_gas && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("vent_gas_value_mmbtud", sortState, setSortState, setSortedData, tableData)}>
                    {`Vent Gas (MMBTU)`}
                    {getArrowIcon("vent_gas_value_mmbtud")}
                  </th>
                )}

                {columnVisibility.commissioning_gas && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("commissioning_gas_value_mmbtud", sortState, setSortState, setSortedData, tableData)}>
                    {`Commissioning Gas (MMBTU)`}
                    {getArrowIcon("commissioning_gas_value_mmbtud")}
                  </th>
                )}

                {columnVisibility.other_gas && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("other_gas_value_mmbtud", sortState, setSortState, setSortedData, tableData)}>
                    {`Other Gas (MMBTU)`}
                    {getArrowIcon("other_gas_value_mmbtud")}
                  </th>
                )}

                {columnVisibility.comment && (
                  <th scope="col" className={`${table_header_style}`}>
                    {`Comment`} 
                    {/* จาก Remarks เป็น Comment SHEET Sprint 4 NO.128 */}
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
                let isDisable = false

                if (closeBalanceData) {
                  // Delete : ต้องไม่สามารถ Delete รายการก่อน Closed Balance ได้ ให้ disable ไปเลย https://app.clickup.com/t/86eujrgq1
                  // isDisable = dayjs(closeBalanceData?.date_balance).isAfter(dayjs(row.gas_day))

                  const balanceEom = dayjs(closeBalanceData?.date_balance).endOf('month'); // วันสุดท้ายของเดือนที่ close balance
                  const gasDay = dayjs(row.gas_day);

                  isDisable = balanceEom.isAfter(gasDay);
                }

                return (
                  <tr
                    key={row?.id}
                    className={`${table_row_style}`}
                  >

                    {
                      userDT?.account_manage?.[0]?.user_type_id !== 3 &&
                      <td className="px-2 py-1 min-w-[60px] text-center">
                        <input
                          type="checkbox"
                          checked={selectedRoles.some((role: any) => role.id === row.id)}
                          onChange={() => handleSelectRole(row.id)}
                          disabled={isDisable}
                          // onChange={() => handleSelectRole(row)}
                          className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1]"
                        />
                      </td>
                    }

                    {columnVisibility.gas_day && (
                      <td className="px-2 py-1 text-[#464255]">{row?.gas_day_text ? formatDateNoTime(row?.gas_day_text) : ''}</td>
                    )}

                    {columnVisibility.shipper_name && (
                      <td className="px-2 py-1 text-[#464255]">{row?.group ? row?.group?.name : ''}</td>
                    )}

                    {columnVisibility.zone && (
                      <td className="px-2 py-1 text-center align-middle">
                        {row?.zone && (
                          // <div className="inline-flex w-[100px] items-center justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.zone?.color, color: getContrastTextColor(row?.zone?.color) }}>
                          <div className="inline-flex w-[100px] items-center justify-center rounded-full p-1 text-[#464255]" >
                            {row?.zone?.name}
                          </div>
                        )}
                      </td>
                    )}

                    {columnVisibility.vent_gas && (
                      // <td className="px-4 py-1 text-[#464255] text-right">{row?.vent_gas_value_mmbtud ? formatNumberFourDecimal(row?.vent_gas_value_mmbtud) : ''}</td>
                      <td className="px-4 py-1 text-[#464255] text-right">{row?.vent_gas_value_mmbtud !== null && row?.vent_gas_value_mmbtud !== undefined ? formatNumberFourDecimal(row?.vent_gas_value_mmbtud) : ''}</td>
                    )}

                    {columnVisibility.commissioning_gas && (
                      <td className="px-4 py-1 text-[#464255] text-right">{row?.commissioning_gas_value_mmbtud !== null && row?.commissioning_gas_value_mmbtud !== undefined ? formatNumberFourDecimal(row?.commissioning_gas_value_mmbtud) : ''}</td>
                    )}

                    {columnVisibility.other_gas && (
                      <td className="px-4 py-1 text-[#464255] text-right">{row?.other_gas_value_mmbtud !== null && row?.other_gas_value_mmbtud !== undefined ? formatNumberFourDecimal(row?.other_gas_value_mmbtud) : ''}</td>
                    )}

                    {columnVisibility.comment && (
                      <td className="px-2 py-1 text-center">
                        <div className="inline-flex items-center justify-center relative">
                          {/* <button
                            type="button"
                            className="flex items-center justify-center px-[2px] py-[2px] bg-white rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                            onClick={() => openReasonModal(row?.id, row?.vent_commissioning_other_gas_remark, row)}
                            // disabled={!userPermission?.f_view || row?.release_summary_comment?.length <= 0}
                            // disabled={!userPermission?.f_view}
                            disabled={row?.vent_commissioning_other_gas_remark?.length <= 0}
                          >
                            <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                          </button> */}

                          <button
                            type="button"
                            className={iconButtonClass}
                            onClick={() => openReasonModal(row?.id, row?.vent_commissioning_other_gas_remark, row)}
                            disabled={row?.vent_commissioning_other_gas_remark?.length <= 0}
                          >
                            <ChatBubbleOutlineOutlinedIcon
                              fontSize="inherit"
                              className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                              sx={{ color: 'currentColor', fontSize: 18 }}
                            />
                          </button>

                          <span className="px-2 text-[#464255]">
                            {row?.vent_commissioning_other_gas_remark?.length}
                          </span>
                        </div>
                      </td>
                    )}

                    {columnVisibility.action && (
                      <td className="px-2 py-1">
                        <div className="relative inline-flex justify-center items-center w-full">
                          {/* <BtnActionTable togglePopover={togglePopover} row_id={row?.id} disable={!userPermission?.f_view && !userPermission?.f_edit ? true : false} /> */}
                          <BtnActionTable togglePopover={togglePopover} row_id={row?.id} disable={!userPermission?.f_view ? true : false} />
                          {openPopoverId === row?.id && (
                            <div ref={popoverRef}
                              className="absolute left-[-9rem] top-[-10px] mt-2 w-36 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                              <ul className="py-2">
                                {
                                  userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("view", row?.id) }}><RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`View`}</li>
                                }
                                {
                                  !isDisable && userPermission?.f_edit && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("edit", row?.id) }}><EditOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Edit`}</li>
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

export default TableVentCommissioningOtherGas;