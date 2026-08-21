import { useEffect, useRef } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { filterSortedDataByDisable, formatDate, formatDateNoTime, iconButtonClass, isDisabledByContractEnd, shouldDisableByDeadline, toDayjs } from '@/utils/generalFormatter';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort, handleSortNomCode } from "@/utils/sortTable";
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import NodataTable from "@/components/other/nodataTable";

interface TableProps {
  openEditForm?: (id: any) => void;
  openViewForm?: (id: any) => void;
  openAllFileModal: (id?: any, data?: any) => void;
  openReasonModal: (id?: any, data_comment?: any, row?: any) => void;
  openSubmissionModal: (id?: any, data_comment?: any, row?: any) => void;
  handleNomCodeClick?: any
  setDataReGen: any;
  dataNomDeadline?: any;
  selectedRoles: any;
  setSelectedRoles: any;
  tableData: any;
  isLoading: any;
  columnVisibility: any;
  userPermission?: any;
  userDT?: any;
}

const TableNomDailyMgn: React.FC<TableProps> = ({ openEditForm, openViewForm, tableData, isLoading, columnVisibility, userPermission, userDT, openAllFileModal, openReasonModal, openSubmissionModal, setDataReGen, selectedRoles, setSelectedRoles, handleNomCodeClick, dataNomDeadline }) => {

  const [sortState, setSortState] = useState({ column: null, direction: null });
  const [sortedData, setSortedData] = useState(tableData);
  const [originalData, setOriginalData] = useState(tableData);
  const today = toDayjs(); // วันนี้

  useEffect(() => {
    if (tableData && tableData.length > 0) {
      // setSortedData(tableData);

      // ปั้น data
      const updatedDataDaily = tableData.map((item: any) => ({
        ...item,
        version: item.nomination_version?.[0]?.version || null
      }));

      setOriginalData(updatedDataDaily)
      setSortedData(updatedDataDaily);
    } else {
      setOriginalData([])
      setSortedData([]);
    }

  }, [tableData]);

  const [openPopoverId, setOpenPopoverId] = useState(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const getArrowIcon = (column: string) => {
    return <div className={`${table_col_arrow_sort_style}`}>
      <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
      <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
    </div>
  };

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

  const [selectAll, setSelectAll] = useState(false);

  // const handleSelectAll = () => {
  //   const newSelectAll = !selectAll;
  //   setSelectAll(newSelectAll);

  //   let sort_data_filtered = []
  //   // const dl = dataNomDeadline[0];
  //   const tzOffsetHours = 7;

  //   // กรองเงื่อนไข nom deadline
  //   if (dataNomDeadline?.length > 0) {
  //     sort_data_filtered = sortedData.filter((row?: any) => {

  //       const dl = dataNomDeadline?.find((item: any) => {
  //         if (row?.query_shipper_nomination_file_renom_id == 2) {  // renom == NO
  //           return item?.process_type_id == 2 // 2 = management
  //         } else {
  //           return item?.process_type_id == 4 // 4 = "Validity response of renomination"
  //         }
  //       });

  //       return !shouldDisableByDeadline(row.gas_day, dl, { tzOffsetHours })
  //     }
  //     );
  //     sort_data_filtered = sort_data_filtered?.filter((item: any) => item.query_shipper_nomination_status_id == 1) // กรองเอาแต่ status Waiting For Response
  //   } else {
  //     sort_data_filtered = sortedData
  //   }

  //   // กรองเงื่อนไข terminate_date
  //   const { filtered, removed, count } = filterSortedDataByDisable(sort_data_filtered, dataNomDeadline, 7);
  //   sort_data_filtered = filtered

  //   if (newSelectAll) {
  //     // Select all
  //     // const allRoles = sortedData?.filter((item: any) => item.query_shipper_nomination_status_id == 1).map((role: any) => ({ id: role.id }));
  //     const allRoles = sort_data_filtered?.map((role: any) => ({ id: role.id }));

  //     setSelectedRoles(allRoles);
  //   } else {
  //     // Deselect all
  //     setSelectedRoles([]);
  //   }
  // };


  const handleSelectRow = (id: any) => {

    const existingRole = selectedRoles.find((role: any) => role.id === id);
    if (existingRole) {
      // Deselect the role
      setSelectedRoles(selectedRoles.filter((role: any) => role.id !== id));
    } else {
      // Select the role
      setSelectedRoles([...selectedRoles, { id }]);
    }
  };


  // ---------------------------------------------------------------------------
  const tzOffsetHours = 7;

  const getDeadlineByRow = (row: any, dataNomDeadline: any[]) => {
    return dataNomDeadline?.find((item: any) => {
      if (row?.query_shipper_nomination_file_renom_id == 2) {
        // renom == NO
        return item?.process_type_id == 2; // Management
      }
      return item?.process_type_id == 4; // Validity response of renomination
    });
  };

  const isRowDisabled = (row: any, dataNomDeadline: any[], today: any) => {
    // 1) status ไม่ใช่ Waiting For Response (==1) => disabled
    if (row?.query_shipper_nomination_status_id !== 1) return true;

    // 2) disable_checkbox จาก before_gas_day window
    let disable_checkbox = false;
    if (dataNomDeadline?.length > 0) {
      const dataNomMod = getDeadlineByRow(row, dataNomDeadline);
      const rowGassDay = row?.gas_day;

      const targetDate = toDayjs(rowGassDay).subtract(dataNomMod?.before_gas_day ?? 0, "day");
      disable_checkbox = today.isBetween(targetDate, toDayjs(rowGassDay), null, "[]");
    }

    // 3) terminate/contract end rule
    let isDisable = false;
    if (row?.contract_code?.status_capacity_request_management_id == 5) {
      const { isDisableAction } = isDisabledByContractEnd(row, tzOffsetHours);
      isDisable = isDisableAction;
    }

    // 4) nom deadline rule (ใช้ shouldDisableByDeadline) — เหมือน tbody
    if (!isDisable && dataNomDeadline?.length > 0) {
      const dl = getDeadlineByRow(row, dataNomDeadline);
      isDisable = shouldDisableByDeadline(row?.gas_day, dl, { tzOffsetHours });
    }

    // disabled สุดท้าย เหมือน tbody เป๊ะ
    return disable_checkbox || isDisable;
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    if (newSelectAll) {
      // เลือกเฉพาะแถวที่ "ไม่ disabled" เท่านั้น
      const selectableRows = (sortedData ?? []).filter((row: any) => {
        return !isRowDisabled(row, dataNomDeadline, today);
      });

      const allRoles = selectableRows.map((role: any) => ({ id: role.id }));
      setSelectedRoles(allRoles);
    } else {
      setSelectedRoles([]);
    }
  };



  return (
    <div className={`relative h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md z-1`}>
      {

        isLoading ?
          <table className={`w-full text-sm text-left rtl:text-right text-gray-500 `}>
            <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
              <tr className="h-9">

                {/* {
                  // ในกรณี Shipper เข้ามาจะต้องไม่เห็น Column Check Box https://app.clickup.com/t/86et682z1
                  userDT?.account_manage?.[0]?.user_type_id !== 3 &&
                  <th className={`${table_header_style} rounded-tl-[10px] min-w-[80px] text-center`}>
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1]"
                    />
                  </th>
                } */}

                {
                  userDT?.account_manage?.[0]?.user_type_id !== 3 &&
                  columnVisibility?.check_box && (
                    <th className={`${table_header_style} rounded-tl-[10px] min-w-[80px] text-center`}>
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1]"
                      />
                    </th>
                  )
                }

                {columnVisibility.gas_week && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("gas_day", sortState, setSortState, setSortedData, originalData)}>
                    {`Gas Week`}
                    {getArrowIcon("gas_day")}
                  </th>
                )}

                {columnVisibility.nominations_code && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSortNomCode("nomination_code", sortState, setSortState, setSortedData, originalData)}>
                    {`Nominations Code`}
                    {getArrowIcon("nomination_code")}
                  </th>
                )}

                {columnVisibility.renominations && (
                  <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("query_shipper_nomination_file_renom.name", sortState, setSortState, setSortedData, originalData)}>
                    {`Renominations`}
                    {getArrowIcon("query_shipper_nomination_file_renom.name")}
                  </th>
                )}

                {columnVisibility.status && (
                  <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("query_shipper_nomination_status.name", sortState, setSortState, setSortedData, originalData)}>
                    {`Status`}
                    {getArrowIcon("query_shipper_nomination_status.name")}
                  </th>
                )}

                {columnVisibility.version && (
                  <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("version", sortState, setSortState, setSortedData, originalData)}>
                    {`Version`}
                    {getArrowIcon("version")}
                  </th>
                )}

                {columnVisibility.contract_code && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("contract_code.contract_code", sortState, setSortState, setSortedData, originalData)}>
                    {`Contract Code`}
                    {getArrowIcon("contract_code.contract_code")}
                  </th>
                )}

                {columnVisibility.shipper_name && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("group.name", sortState, setSortState, setSortedData, originalData)}>
                    {`Shipper Name`}
                    {getArrowIcon("group.name")}
                  </th>
                )}

                {columnVisibility.submitted_timestamp && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("latestSubmittedTimestamp", sortState, setSortState, setSortedData, originalData)}>
                    {`Submitted Timestamp`}
                    {getArrowIcon("latestSubmittedTimestamp")}
                  </th>
                )}

                {columnVisibility.submission_comment && (
                  <th scope="col" className={`${table_header_style} text-center`} >
                    {`Submission Comment`}
                  </th>
                )}

                {columnVisibility.comment && (
                  <th scope="col" className={`${table_header_style} text-center`} >
                    {`Comment`}
                  </th>
                )}

                {columnVisibility.shipper_file && (
                  <th scope="col" className={`${table_header_style} text-center`} >
                    {`Shipper File`}
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {
                sortedData && sortedData?.map((row: any, index: any) => {
                  let isRenom = row?.query_shipper_nomination_file_renom?.name
                  let rowGassDay = row?.gas_day
                  let disable_checkbox = false
                  let isDisable = false
                  let dataNomMod: any = {}

                  // หน้า List > ปุ่ม Approve/Reject ต้องไม่สามารถกดได้ หากเลยเวลาที่ set ไว้ใน DAM > Nomination Deadline (TSO Management File Nom) https://app.clickup.com/t/86ettg8r8
                  if (isRenom == "NO") {
                    // process_type = "Management" ใช้กับ row ที่ renom = no

                    // rowGassDay = 2025-06-15T00:00:00.000Z
                    // dataNomMod.before_gas_day = 25
                    // คำนวนหาวันย้อนหลัง 25 วัน จาก rowGassDay ถ้าวันปัจจุบันไม่อยู่ใน 25 วันนี้ ให้ disable_checkbox = false แต่ถ้าวันปัจจุบันอยู่ให้ disable_checkbox = true
                    dataNomMod = dataNomDeadline?.find((item: any) => item?.process_type_id == 2)
                  } else {
                    // process_type = "Validity response of renomination" ใช้กับ row ที่ renom = yes
                    dataNomMod = dataNomDeadline?.find((item: any) => item?.process_type_id == 4)
                  }

                  // targetDate วันที่สามารถกด accept reject ได้ วันสุดท้าย
                  const targetDate = toDayjs(rowGassDay).subtract(dataNomMod?.before_gas_day ?? 0, 'day'); // วันที่ย้อนหลัง 25 วันจาก rowGassDay
                  // const targetDate = toDayjs(rowGassDay).subtract(4, 'day'); // *** สมมติว่าเป็น 4 วัน

                  // disable_checkbox = today.isBetween(targetDate, toDayjs(rowGassDay), null, '[]'); // เช็คว่าอยู่ในช่วงหรือไม่ ถ้ายังอยู่ มันจะกด checkbox ได้

                  // เช็คว่า 
                  // 1. ถ้า today อยู่ก่อน targetDate ให้ disable_checkbox == false
                  // 2. ถ้า today เท่ากับ targetDate ให้เช็คเวลา ถ้าเวลาของ today อยู่ก่อน targetDate ให้ disable_checkbox == false ถ้าเวลาของ today อยู่หลัง targetDate ให้ disable_checkbox == true
                  // 3. ถ้า today อยู่หลัง targetDate ให้ disable_checkbox == true
                  if (today.isBefore(targetDate)) {
                    disable_checkbox = false;
                  } else if (today.isSame(targetDate, "day")) {

                    const targetTime = targetDate
                      .hour(dataNomMod?.hour ?? 0)
                      .minute(dataNomMod?.minute ?? 0)
                      .second(0)
                      .millisecond(0);

                    disable_checkbox = today.isAfter(targetTime);
                  } else {
                    disable_checkbox = true;
                  }

                  // กรอง terminate และ nom deadline
                  if (row?.contract_code?.status_capacity_request_management_id == 5) { // 5 = terminate
                    // priority terminate --> extend --> contract_end_date
                    // เช็คว่า dataNomCode.contract_code มีข้อมูลวันจบสัญญาตามระดับความสำคัญนี้หรือไม่
                    // 1. dataNomCode.contract_code.terminate_date
                    // 2. dataNomCode.contract_code.extend_deadline
                    // 3. dataNomCode.contract_code.contract_end_date

                    // แล้วมาเช็คกับ dataNomCode.gas_day ถ้า dataNomCode.gas_day เกินวันจบสัญญา ให้ set isDisable == true
                    const { isDisableAction, endDateKey, gasDayLocalDate, endDateLocalDate } = isDisabledByContractEnd(row, 7);

                    isDisable = isDisableAction
                  }

                  if (!isDisable && dataNomDeadline?.length > 0) {

                    // const dl = dataNomDeadline[0];
                    const dl = dataNomDeadline?.find((item: any) => {
                      if (row?.query_shipper_nomination_file_renom_id == 2) {  // renom == NO
                        return item?.process_type_id == 2 // 2 = management
                      } else {
                        return item?.process_type_id == 4 // 4 = "Validity response of renomination"
                      }
                    });
                    isDisable = shouldDisableByDeadline(row.gas_day, dl, { tzOffsetHours: 7 });
                  }

                  // const disabled = row.query_shipper_nomination_status_id !== 1 || disable_checkbox || row.disabledFlag == true || isDisable
                  const disabled = row.query_shipper_nomination_status_id !== 1 || disable_checkbox || isDisable

                  return (
                    <tr
                      key={row?.id}
                      className={`${table_row_style}`}
                    >
                      {/* {
                        // ในกรณี Shipper เข้ามาจะต้องไม่เห็น Column Check Box https://app.clickup.com/t/86et682z1

                        // process_type = "Validity response of renomination" ใช้กับ row ที่ renom = yes
                        // process_type = "Management" ใช้กับ row ที่ renom = no

                        userDT?.account_manage?.[0]?.user_type_id !== 3 &&
                        <td className="px-2 py-1 min-w-[80px] text-center">
                          <input
                            type="checkbox"
                            checked={selectedRoles.some((role: any) => role.id === row.id)}
                            disabled={disabled}
                            onChange={() => handleSelectRow(row.id)}
                            // className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1]"
                            className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1] disabled:opacity-100 disabled:cursor-not-allowed "
                          />
                        </td>
                      } */}

                      {
                        // ในกรณี Shipper เข้ามาจะต้องไม่เห็น Column Check Box https://app.clickup.com/t/86et682z1
                        userDT?.account_manage?.[0]?.user_type_id !== 3 &&
                        columnVisibility?.check_box && (
                          <td className="px-2 py-1 min-w-[80px] text-center">
                            <input
                              type="checkbox"
                              checked={selectedRoles.some((role: any) => role.id === row.id)}
                              disabled={(row.query_shipper_nomination_status_id === 2 || row.query_shipper_nomination_status_id === 5) ? isDisable : disabled} // https://app.clickup.com/t/86euzxxn6
                              onChange={() => handleSelectRow(row.id)}
                              // className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1]"
                              className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1] disabled:opacity-100 disabled:cursor-not-allowed "
                            />
                          </td>
                        )
                      }

                      {columnVisibility.gas_week && (
                        <td className="px-2 py-1 text-[#464255]">{row?.gas_day ? formatDateNoTime(row?.gas_day) : ''}</td>
                      )}

                      {columnVisibility.nominations_code && (
                        <td
                          className="px-2 py-1 text-[#464255] "
                        >
                          <span
                            onClick={() => handleNomCodeClick(row?.id)}
                            className="cursor-pointer underline text-[#1473A1]"
                          >
                            {row?.nomination_code || '-'}
                          </span>
                        </td>
                      )}

                      {columnVisibility.renominations && (
                        <td className="px-2 py-1 justify-center">
                          {
                            <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: String(row?.query_shipper_nomination_file_renom?.color) }}>{row?.query_shipper_nomination_file_renom?.name}</div>
                          }
                        </td>
                      )}

                      {columnVisibility.status && (
                        <td className="px-2 py-1 justify-center">
                          {
                            <div className="flex min-w-[180px] max-w-[250px] w-auto text-center justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: String(row?.query_shipper_nomination_status?.color) }}>{row?.query_shipper_nomination_status?.name}</div>
                          }
                        </td>
                      )}

                      {columnVisibility.version && (
                        // <td className="px-2 py-1 text-[#464255] text-center">{row?.nomination_version ? row?.nomination_version?.[0]?.version : ''}</td>
                        <td className="px-2 py-1 text-[#464255] text-center">{row?.nomination_version ? row?.version : ''}</td>
                      )}

                      {columnVisibility.contract_code && (
                        // <td className="px-2 py-1 text-[#464255]">{row?.contract_code ? row?.contract_code?.contract_code : ''}</td>
                        <td className="px-2 py-1 text-[#464255]">{row?.reserve_balancing_gas_contract ? row?.reserve_balancing_gas_contract?.res_bal_gas_contract : row?.contract_code?.contract_code || ''}</td>
                      )}

                      {columnVisibility.shipper_name && (
                        <td className="px-2 py-1 text-[#464255]">{row?.group?.name}</td>
                      )}

                      {columnVisibility.submitted_timestamp && (
                        <td className="px-2 py-1 text-[#464255]">{row?.latestSubmittedTimestamp ? formatDate(row?.latestSubmittedTimestamp) : ''}</td>
                      )}

                      {columnVisibility.submission_comment && (
                        <td className="px-2 py-1 text-center">
                          <div className="inline-flex items-center justify-between relative w-[60px] gap-1">
                            <button
                              type="button"
                              className={`${iconButtonClass} w-[45px]`}
                              onClick={() => openSubmissionModal(row?.id, row?.submission_comment_query_shipper_nomination_file, row)}
                              disabled={!userPermission?.f_view}
                            >
                              <ChatBubbleOutlineOutlinedIcon
                                fontSize="inherit"
                                className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                sx={{ color: 'currentColor', fontSize: 18 }}
                              />
                            </button>

                            {/* <div className={`w-10 text-center text-[#429D3A] ${row?.submission_comment_query_shipper_nomination_file?.length > 0 && 'text-[#ED1B24]'}`}> */}
                            <div className={`w-10 text-center text-[#429D3A] ${row?._count?.submission_comment_query_shipper_nomination_file > 0 && 'text-[#ED1B24]'}`}>
                              {/* {row?.submission_comment_query_shipper_nomination_file?.length} */}
                              {row?._count?.submission_comment_query_shipper_nomination_file}
                            </div>
                          </div>
                        </td>
                      )}

                      {columnVisibility.comment && (
                        <td className="px-2 py-1 text-center">
                          <div className="inline-flex items-center justify-center relative">

                            <button
                              type="button"
                              className={iconButtonClass}
                              onClick={() => openReasonModal(row?.id, row?.query_shipper_nomination_file_comment, row)}
                              disabled={!userPermission?.f_view}
                            >
                              <ChatBubbleOutlineOutlinedIcon
                                fontSize="inherit"
                                className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                sx={{ color: 'currentColor', fontSize: 18 }}
                              />
                            </button>
                          </div>
                        </td>
                      )}

                      {columnVisibility.shipper_file && (
                        <td className="px-2 py-1 text-center">
                          <div className="inline-flex items-center justify-center relative">

                            <button
                              type="button"
                              aria-label="Open files"
                              onClick={() => openAllFileModal(row?.id)}
                              className={iconButtonClass}
                              // disabled={!userPermission?.f_view || row?.query_shipper_nomination_file_url.length <= 0}
                              disabled={!userPermission?.f_view || row?.query_shipper_nomination_file_url <= 0}
                            >
                              <AttachFileRoundedIcon
                                fontSize="inherit"
                                className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                sx={{ color: 'currentColor', fontSize: 18 }}
                              />
                            </button>

                            <span className="px-2 text-[#464255]">
                              {/* {row?.query_shipper_nomination_file_url.length} */}
                              {row?._count?.query_shipper_nomination_file_url}
                            </span>
                          </div>
                        </td>
                      )}

                    </tr>
                  )
                })
              }
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

export default TableNomDailyMgn;