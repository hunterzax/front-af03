import { useEffect, useRef } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { calculateIsDisableBtn, formatDateNoTime, formatNumberFourDecimal, formatNumberThreeDecimal, getContrastTextColor, iconButtonClass } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort, handleSortWithPaginate, sortOnPagenation, sortOnPagenationWithPaginate } from "@/utils/sortTable";
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import NodataTable from "@/components/other/nodataTable";
import BtnActionTable from "@/components/other/btnActionInTable";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import { toDayjs } from "@/utils/generalFormatter";

interface TableProps {
  openEditForm: (id: any) => void;
  openViewForm: (id: any) => void;
  openHistoryForm: (id: any) => void;
  openAllFileModal: (id?: any, data?: any) => void;
  openReasonModal: (id?: any, data_comment?: any, row?: any) => void;
  // openSubmissionModal: (id?: any, data_comment?: any, row?: any) => void;
  handleNomCodeClick?: any
  setDataReGen: any;
  selectedRoles: any;
  setSelectedRoles: any;
  tableData: any;
  allData: any;
  isLoading: any;
  columnVisibility: any;
  userPermission?: any;
  dataSystemParam?: any;
  userDT?: any;
  itemsPerPage?: any;
  currentPage?: any;
}

const TableAllocationReview: React.FC<TableProps> = ({ openEditForm, openViewForm, openHistoryForm, tableData, allData, isLoading, columnVisibility, userPermission, openAllFileModal, openReasonModal, setDataReGen, selectedRoles, setSelectedRoles, handleNomCodeClick, dataSystemParam, userDT, itemsPerPage, currentPage }) => {

  const [sortState, setSortState] = useState({ column: null, direction: null });
  const [sortedData, setSortedData] = useState(tableData);

  useEffect(() => {
    if (tableData && tableData.length > 0) {
      // tableData =data ที่ทำ pagination มาแล้ว
      // allData = data ทั้งหมด

      const newData = tableData?.map((item: any) => ({
        ...item,
        shipper_allocation_review: item?.allocation_management_shipper_review?.[0]?.shipper_allocation_review ?? null
      }));

      if (sortState?.direction) {
        const col: any = sortState?.column;
        // sortOnPagenation(col, sortState, setSortState, setSortedData, newData)
        sortOnPagenationWithPaginate(col, sortState, setSortState, setSortedData, allData, itemsPerPage, currentPage)
      } else {
        setSortedData(newData);
      }
      
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

  // const [selectAll, setSelectAll] = useState(false);

  // const handleSelectAll = () => {
  //   const newSelectAll = !selectAll;
  //   setSelectAll(newSelectAll);

  //   if (newSelectAll) {
  //     // Select all roles
  //     // const allRoles = sortedData?.map((item: any) => ({ id: item.id }));
  //     const allRoles = allData?.map((item: any) => ({ id: item.id }));
  //     setSelectedRoles(allRoles);
  //   } else {
  //     // Deselect all roles
  //     setSelectedRoles([]);
  //   }
  // };

  // ID ของข้อมูลเฉพาะหน้าปัจจุบัน
const currentPageIds = (sortedData ?? []).map((item: any) => item.id);

// เช็กว่ารายการในหน้าปัจจุบันถูกเลือกครบหรือยัง
const isAllCurrentPageSelected =
  currentPageIds.length > 0 &&
  currentPageIds.every((id: any) =>
    selectedRoles.some((role: any) => role.id === id)
  );

// เช็กว่าหน้าปัจจุบันถูกเลือกบางรายการหรือไม่
const isSomeCurrentPageSelected =
  currentPageIds.some((id: any) =>
    selectedRoles.some((role: any) => role.id === id)
  ) && !isAllCurrentPageSelected;

const handleSelectAll = () => {
  const currentPageIdSet = new Set(currentPageIds);

  if (isAllCurrentPageSelected) {
    // ถ้าหน้านี้เลือกครบอยู่แล้ว
    // ให้ยกเลิกเฉพาะรายการของหน้าปัจจุบัน
    setSelectedRoles(
      selectedRoles.filter(
        (role: any) => !currentPageIdSet.has(role.id)
      )
    );
  } else {
    // เก็บรายการที่เลือกจากหน้าอื่นเอาไว้
    // แล้วเพิ่มรายการของหน้าปัจจุบันที่ยังไม่ได้เลือก
    const selectedIdSet = new Set(
      selectedRoles.map((role: any) => role.id)
    );

    const newSelectedRoles = currentPageIds
      .filter((id: any) => !selectedIdSet.has(id))
      .map((id: any) => ({ id }));

    setSelectedRoles([
      ...selectedRoles,
      ...newSelectedRoles,
    ]);
  }
};

  // ------

  // const handleSelectRow = (id: any) => {
  //   const existingRole = selectedRoles.find((role: any) => role.id === id);
  //   if (existingRole) {
  //     // Deselect the role
  //     setSelectedRoles(selectedRoles.filter((role: any) => role.id !== id));
  //   } else {
  //     // Select the role
  //     setSelectedRoles([...selectedRoles, { id }]);
  //   }
  // };

  const handleSelectRow = (id: any) => {
    const isSelected = selectedRoles.some(
      (role: any) => role.id === id
    );

    if (isSelected) {
      setSelectedRoles(
        selectedRoles.filter((role: any) => role.id !== id)
      );
    } else {
      setSelectedRoles([
        ...selectedRoles,
        { id },
      ]);
    }
  };

  return (
    <div className={`relative h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md z-1`}>
      {
        isLoading ?
          // <table className="w-full text-sm text-left rtl:text-right text-gray-500">
          <table className={`w-full text-sm text-left rtl:text-right text-gray-500 `}>

            <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
              <tr className="h-20">

                <th className={`${table_header_style} rounded-tl-[10px] min-w-[80px] text-center`}>
                  <input
                    type="checkbox"
                    // checked={selectAll}
                      checked={isAllCurrentPageSelected}
                      // ref={(element) => {
                      //   if (element) {
                      //     element.indeterminate = isSomeCurrentPageSelected;
                      //   }
                      // }}
                    onChange={handleSelectAll}
                    className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1]"
                  />
                </th>

                {columnVisibility.status && (
                  <th scope="col" className={`${table_sort_header_style} text-center`}
                    // onClick={() => handleSort("allocation_status.name", sortState, setSortState, setSortedData, allNewData)}
                    onClick={() => handleSortWithPaginate("allocation_status.name", sortState, setSortState, setSortedData, allData, itemsPerPage, currentPage)}
                  >
                    {`Status`}
                    {getArrowIcon("allocation_status.name")}
                  </th>
                )}

                {columnVisibility.gas_day && (
                  <th scope="col" className={`${table_sort_header_style} min-w-[160px]`} 
                    // onClick={() => handleSort("gas_day", sortState, setSortState, setSortedData, allNewData)}
                    onClick={() => handleSortWithPaginate("gas_day", sortState, setSortState, setSortedData, allData, itemsPerPage, currentPage)}
                  >
                    {`Gas Day`}
                    {getArrowIcon("gas_day")}
                  </th>
                )}

                {columnVisibility.shipper_name && (
                  <th scope="col" className={`${table_sort_header_style}`} 
                    // onClick={() => handleSort("shipper.name", sortState, setSortState, setSortedData, allNewData)}
                    onClick={() => handleSortWithPaginate("shipper.name", sortState, setSortState, setSortedData, allData, itemsPerPage, currentPage)}
                  >
                    {`Shipper Name`}
                    {getArrowIcon("shipper.name")}
                  </th>
                )}

                {columnVisibility.contract_code && (
                  <th scope="col" className={`${table_sort_header_style} min-w-[160px]`} 
                    // onClick={() => handleSort("contract", sortState, setSortState, setSortedData, allNewData)}
                    onClick={() => handleSortWithPaginate("contract", sortState, setSortState, setSortedData, allData, itemsPerPage, currentPage)}
                  >
                    {`Contract Code`}
                    {getArrowIcon("contract")}
                  </th>
                )}

                {columnVisibility.nom_point_concept_point && (
                  <th scope="col" className={`${table_sort_header_style}`} 
                    // onClick={() => handleSort("point", sortState, setSortState, setSortedData, allNewData)}
                    onClick={() => handleSortWithPaginate("point", sortState, setSortState, setSortedData, allData, itemsPerPage, currentPage)}
                  >
                    {`Nomination Point / Concept Point`}
                    {getArrowIcon("point")}
                  </th>
                )}

                {/* {columnVisibility.entry_exit && (
                  <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} 
                    // onClick={() => handleSort("entry_exit_obj.name", sortState, setSortState, setSortedData, sortedData)}
                    onClick={() => handleSortWithPaginate("entry_exit_obj.name", sortState, setSortState, setSortedData, allData, itemsPerPage, currentPage)}
                  >
                    {`Entry / Exit`}
                    {getArrowIcon("entry_exit_obj.name")}
                  </th>
                )} */}
                {/* https://app.clickup.com/t/9018502823/86eub6d0j */}

                {columnVisibility.zone && (
                  // <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("zone", sortState, setSortState, setSortedData, allNewData)}>
                  <th scope="col" className={`${table_sort_header_style} text-center`} 
                    // onClick={() => handleSort("zone_obj.name", sortState, setSortState, setSortedData, allNewData)}
                    onClick={() => handleSortWithPaginate("zone_obj.name", sortState, setSortState, setSortedData, allData, itemsPerPage, currentPage)}
                  >
                    {`Zone`}
                    {getArrowIcon("zone_obj.name")}
                  </th>
                )}

                {columnVisibility.area && (
                  <th scope="col" className={`${table_sort_header_style} text-center`} 
                    // onClick={() => handleSort("area", sortState, setSortState, setSortedData, allNewData)}
                    onClick={() => handleSortWithPaginate("area", sortState, setSortState, setSortedData, allData, itemsPerPage, currentPage)}
                  >
                    {`Area`}
                    {getArrowIcon("area")}
                  </th>
                )}

                {columnVisibility.nominated_value && (
                  <th scope="col" className={`${table_sort_header_style}`}
                    // onClick={() => handleSort("nominationValue", sortState, setSortState, setSortedData, allNewData)}
                    onClick={() => handleSortWithPaginate("nominationValue", sortState, setSortState, setSortedData, allData, itemsPerPage, currentPage)}
                  >
                    {`Nominated Value (MMBTU/D)`}
                    {getArrowIcon("nominationValue")}
                  </th>
                )}

                {columnVisibility.system_allocation && (
                  <th scope="col" className={`${table_sort_header_style}`} 
                    // onClick={() => handleSort("systemAllocation", sortState, setSortState, setSortedData, allNewData)}
                    onClick={() => handleSortWithPaginate("systemAllocation", sortState, setSortState, setSortedData, allData, itemsPerPage, currentPage)}
                  >
                    {`System Allocation (MMBTU/D)`}
                    {getArrowIcon("systemAllocation")}
                  </th>
                )}

                {columnVisibility.previous_allocation_tpa_for_review && (
                  <th scope="col" className={`${table_sort_header_style}  !text-[#1473A1] !bg-[#B8E6FE]`} 
                    // onClick={() => handleSort("previousAllocationTPAforReview", sortState, setSortState, setSortedData, allNewData)}
                    onClick={() => handleSortWithPaginate("previousAllocationTPAforReview", sortState, setSortState, setSortedData, allData, itemsPerPage, currentPage)}
                  >
                    <div>{`Previous Allocation TPA for`}</div>
                    <div>{`Review (MMBTU/D)`}</div>
                    {getArrowIcon("previousAllocationTPAforReview")}
                  </th>
                )}

                {columnVisibility.shipper_review_allocation && (
                  <th scope="col" className={`${table_sort_header_style} !text-[#1473A1] !bg-[#B8E6FE]`} 
                    // onClick={() => handleSort("shipper_allocation_review", sortState, setSortState, setSortedData, allNewData)}
                    onClick={() => handleSortWithPaginate("shipper_allocation_review", sortState, setSortState, setSortedData, allData, itemsPerPage, currentPage)}
                  >
                    {`Shipper Review Allocation (MMBTU/D)`}
                    {getArrowIcon("shipper_allocation_review")}
                  </th>
                )}

                {columnVisibility.review_code && (
                  <th scope="col" className={`${table_sort_header_style} !min-w-[150px] !text-[#1473A1] !bg-[#B8E6FE]`} 
                    // onClick={() => handleSort("review_code", sortState, setSortState, setSortedData, allNewData)}
                    onClick={() => handleSortWithPaginate("review_code", sortState, setSortState, setSortedData, allData, itemsPerPage, currentPage)}
                  >
                    {`Review Code`}
                    {getArrowIcon("review_code")}
                  </th>
                )}

                {columnVisibility.comment && (
                  <th rowSpan={2} scope="col" className={`${table_header_style} !min-w-[150px] text-center  !text-[#1473A1] !bg-[#B8E6FE]`}>
                    {`Comment`}
                  </th>
                )}

                {columnVisibility.action && (
                  <th scope="col" className={`${table_header_style} !min-w-[100px] text-center`}>
                    {`Action`}
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {
                sortedData && sortedData?.map((row: any, index: any) => {
                  // กรณีที่ Shipper จะเข้ามา Edit เพื่อใส่ค่า review allocation จะต้องเช็คกับ parameter ใน DAM ด้วย ถ้าเกินวันที่กำหนด ให้ hide ปุ่ม edit ไป (เฉพาะ user type shipper) https://app.clickup.com/t/86eu4dmey
                  const isDisableBtn = calculateIsDisableBtn(toDayjs(), row?.gas_day, dataSystemParam?.value);
                  // const isDisableBtn = calculateIsDisableBtn(toDayjs(), row?.gas_day, "100");

                  return (
                    <tr
                      key={row?.id}
                      className={`${table_row_style}`}
                    >
                      <td className="px-2 py-1 min-w-[80px] text-center">
                        <input
                          type="checkbox"
                          checked={selectedRoles.some((role: any) => role.id === row.id)}
                          // disabled={row.query_shipper_nomination_status_id !== 1}
                          onChange={() => handleSelectRow(row.id)}
                          // className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1]"
                          className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1] disabled:opacity-100 disabled:cursor-not-allowed "
                        />
                      </td>

                      {columnVisibility.status && (
                        <td className="px-4 py-1 justify-center">
                          {
                            <div className="flex min-w-[140px] max-w-[250px] w-auto text-center justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: String(row?.allocation_status?.color) }}>{row?.allocation_status?.name}</div>
                          }
                        </td>
                      )}

                      {columnVisibility.gas_day && (
                        <td className="px-2 py-1 text-[#464255]">{row?.gas_day ? formatDateNoTime(row?.gas_day) : ''}</td>
                      )}

                      {columnVisibility.shipper_name && (
                        // <td className="px-2 py-1 text-[#464255]">{row?.checkDb ? row?.checkDb?.shipper_name_text : ''}</td>
                        <td className="px-2 py-1 text-[#464255]">{row?.group ? row?.group?.name : row?.shipper ? row?.shipper?.name : null}</td>
                      )}

                      {columnVisibility.contract_code && (
                        // <td className="px-2 py-1 text-[#464255]">{row?.contract_code ? row?.contract_code?.contract_code : ''}</td>
                        // <td className="px-2 py-1 text-[#464255]">{row?.checkDb ? row?.checkDb?.contract_code_text : ''}</td>
                        <td className="px-2 py-1 text-[#464255]">{row?.contract ? row?.contract : ''}</td>
                      )}

                      {columnVisibility.nom_point_concept_point && (
                        // <td className="px-2 py-1 text-[#464255]">{row?.nomination_point ? row?.nomination_point?.nomination_point : ''}</td>
                        // <td className="px-2 py-1 text-[#464255]">{row?.checkDb ? row?.checkDb?.point_text : ''}</td>
                        <td className="px-2 py-1 text-[#464255]">{row?.point ? row?.point : ''}</td>
                      )}

                      {/* {columnVisibility.entry_exit && (
                        // <td className="px-2 py-1  justify-center ">{row?.entry_exit && <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.entry_exit?.color }}>{`${row?.entry_exit?.name}`}</div>}</td>
                        <td className="px-2 py-1  justify-center ">{row?.entry_exit_obj && <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.entry_exit_obj?.color }}>{`${row?.entry_exit_obj?.name}`}</div>}</td>
                      )} */}
                      {/* https://app.clickup.com/t/9018502823/86eub6d0j */}

                      {/* {columnVisibility.zone && (
                        // <td className="px-2 py-1  justify-center ">{row?.zone && <div className="flex w-[140px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.zone?.color }}>{`${row?.zone?.name}`}</div>}</td>
                        <td className="px-2 py-1  justify-center ">{row?.zone_obj && <div className="flex w-[140px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.zone_obj?.color }}>{`${row?.zone_obj?.name}`}</div>}</td>
                      )} */}

                      {columnVisibility.zone && (
                        <td className="px-2 py-1 text-center align-middle">
                          {(row?.zone_obj || row?.zone) && (
                            <div className="inline-flex w-[100px] items-center justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.zone_obj?.color, color: getContrastTextColor(row?.zone_obj?.color) }}>
                              {row?.zone_obj?.name || row?.zone}
                            </div>
                          )}
                        </td>
                      )}

                      {columnVisibility.area && (
                        <td className="px-2 py-1 justify-center flex min-w-[120px] text-center">
                          {
                            (row?.area_obj || row?.area) ?
                              (row?.area_obj?.entry_exit_id == 2 || row?.entry_exit?.toUpperCase() == 'EXIT') ?
                                <div
                                  className="flex justify-center items-center rounded-full p-1 text-[#464255]"
                                  style={{ backgroundColor: row?.area_obj?.color, width: '40px', height: '40px' }}
                                >
                                  {`${row?.area_obj?.name || row?.area}`}
                                </div>
                                :
                                <div
                                  className="flex justify-center items-center rounded-lg p-1 text-[#464255]"
                                  style={{ backgroundColor: row?.area_obj?.color, width: '40px', height: '40px' }}
                                >
                                  {`${row?.area_obj?.name || row?.area}`}
                                </div>
                              : null
                          }
                        </td>
                      )}

                      {columnVisibility.nominated_value && (
                        // <td className="px-4 py-1 text-[#464255] text-right">{row?.nominationValue !== null && row?.nominationValue !== undefined ? formatNumberFourDecimal(row?.nominationValue)) : ''}</td>
                        // <td className="px-4 py-1 text-[#464255] text-right">{row?.nominationValue !== null && row?.nominationValue !== undefined ? formatNumberFourDecimal(Number(String(row?.nominationValue ?? "").replace(/[^\d.-]/g, ""))) : ''}</td>
                        <td className="px-4 py-1 text-[#464255] text-right">{formatNumberThreeDecimal(Number(String(row?.nominationValue ?? 0).replace(/[^\d.-]/g, "")))}</td>
                      )}

                      {columnVisibility.system_allocation && (
                        <td className="px-4 py-1 text-[#464255] text-right">{row?.systemAllocation !== null && row?.systemAllocation !== undefined ? formatNumberFourDecimal(row?.systemAllocation) : ''}</td>
                      )}

                      {columnVisibility.previous_allocation_tpa_for_review && (
                        <td className="px-4 py-1 text-[#464255] text-right">{row?.previousAllocationTPAforReview !== null && row?.previousAllocationTPAforReview !== undefined ? formatNumberFourDecimal(row?.previousAllocationTPAforReview) : ''}</td>
                      )}

                      {columnVisibility.shipper_review_allocation && (
                        <td className="px-4 py-1 text-[#464255] text-right">{row?.allocation_management_shipper_review?.length > 0 ? formatNumberFourDecimal(row?.allocation_management_shipper_review?.[0]?.shipper_allocation_review) : ''}</td>
                      )}

                      {columnVisibility.review_code && (
                        <td className="px-2 py-1 text-[#464255]">{row?.review_code ? row?.review_code : ''}</td>
                      )}

                      {columnVisibility.comment && (
                        <td className="px-2 py-1 text-center">
                          <div className="inline-flex items-center justify-center relative">
                            {/* <button
                              type="button"
                              className="flex items-center justify-center px-[2px] py-[2px] bg-white rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                              onClick={() => openReasonModal(row?.id, row?.allocation_management_comment, row)}
                              // disabled={row?.allocation_management_comment?.length <= 0 && true}
                              // disabled={!userPermission?.f_view || row?.allocation_management_comment?.length <= 0}
                              disabled={!userPermission?.f_view}
                            >
                              <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                            </button> */}

                            <button
                              type="button"
                              className={iconButtonClass}
                              onClick={() => openReasonModal(row?.id, row?.allocation_management_comment, row)}
                              disabled={!userPermission?.f_view}
                            >
                              <ChatBubbleOutlineOutlinedIcon
                                fontSize="inherit"
                                className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                sx={{ color: 'currentColor', fontSize: 18 }}
                              />
                            </button>
                            <span className="px-2 text-[#464255]">
                              {row?.allocation_management_comment?.length}
                            </span>
                          </div>
                        </td>
                      )}

                      {columnVisibility.action && (
                        <td className="px-2 py-1">
                          <div className="relative inline-flex justify-center items-center w-full">

                            <BtnActionTable
                              togglePopover={togglePopover}
                              row_id={row?.id}
                              disable={!userPermission?.f_view && !userPermission?.f_edit ? true : false}
                            />

                            {openPopoverId === row?.id && (
                              <div ref={popoverRef}
                                className="absolute left-[-8rem] top-[-10px] mt-2 w-36 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                                <ul className="py-2">
                                  {/* {
                                    userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("view", row?.id) }}><RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`View`}</li>
                                  } */}

                                  {/* accepted edit ไม่ได้ */}
                                  {/* {
                                    userDT?.account_manage?.[0]?.user_type_id == 3 && isDisableBtn ? null :
                                      userPermission?.f_edit && row?.allocation_status?.id !== 3 && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("edit", row?.id) }}><EditOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Edit`}</li>
                                  } */}

                                  {
                                    (() => {
                                      const isUserType3 = userDT?.account_manage?.[0]?.user_type_id === 3; // เป็น shipper มั้ย
                                      const isEditable = userPermission?.f_edit; // มีสิทธิ edit มั้ย
                                      const isStatusFinal = row?.allocation_status?.id === 3; // status accept ป่าว ถ้าเป็นปิดปุ่ม

                                      // const shouldHideEdit =
                                      //   (isUserType3 && isDisableBtn) || !isEditable || isStatusFinal;

                                      const shouldHideEdit = isDisableBtn || !isEditable || isStatusFinal;

                                      if (shouldHideEdit) return null;

                                      return (
                                        <li
                                          className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer"
                                          onClick={() => toggleMenu("edit", row?.id)}
                                        >
                                          <EditOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} />
                                          {`Edit`}
                                        </li>
                                      );
                                    })()
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

export default TableAllocationReview;