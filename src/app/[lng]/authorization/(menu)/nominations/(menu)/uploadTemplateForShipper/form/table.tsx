import { useEffect, useRef } from "react";
import React, { FC, useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatDateTimeSec, hasPassedEffectiveEndDate, iconButtonClass } from '@/utils/generalFormatter';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import BtnActionTable from "@/components/other/btnActionInTable";
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import getUserValue from "@/utils/getuserValue";
interface TableProps {
  openEditForm: (id: any) => void;
  openViewForm: (id: any) => void;
  openHistoryForm: (id: any) => void;
  openAllFileModal: (id?: any, data?: any) => void;
  openReasonModal: (id?: any, data_comment?: any, row?: any) => void;
  setDataReGen: any;
  selectedRoles: any;
  setSelectedRoles: any;
  tableData: any;
  isLoading: any;
  columnVisibility: any;
  userPermission?: any;
}

const TableNomUploadTemplateForShipper: React.FC<TableProps> = ({ openEditForm, openViewForm, openHistoryForm, tableData, isLoading, columnVisibility, userPermission, openAllFileModal, openReasonModal, setDataReGen, selectedRoles, setSelectedRoles }) => {

  const [sortState, setSortState] = useState({ column: null, direction: null });
  const [sortedData, setSortedData] = useState(tableData);
  const userDT: any = getUserValue();

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

  const [selectAll, setSelectAll] = useState(false);

  // const handleSelectAll = () => {
  //   const newSelectAll = !selectAll;
  //   setSelectAll(newSelectAll);

  //   if (newSelectAll) {
  //     // Select all data
  //     const filter_only_approve = sortedData?.filter((item: any) => item?.contract_code?.status_capacity_request_management_id == 2)
  //     const all_data = filter_only_approve?.map((item: any) => ({ id: item.id }));
  //     setSelectedRoles(all_data);
  //   } else {
  //     // Deselect all data
  //     setSelectedRoles([]);
  //   }
  // };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    if (newSelectAll) {

      const selectableRows = sortedData?.filter((row: any) => {
        const status = row?.contract_code?.status_capacity_request_management_id;

        const isSaved = status === 1;
        const isApprove = status === 2;
        const isTerminate = status === 5;

        if (isSaved) return false; // saved ห้ามเลือก

        if (isApprove) return true; // approve เลือกได้

        if (isTerminate) {
          const { hasPassed } = hasPassedEffectiveEndDate(row?.contract_code);
          return !hasPassed; // ถ้าเลย deadline แล้ว ห้ามเลือก
        }

        return false; // status อื่น ๆ ห้ามเลือก
      });

      const allData = selectableRows?.map((item: any) => ({ id: item.id }));
      setSelectedRoles(allData ?? []);
    } else {
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
  };

  return (
    <div className={`relative h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md z-1`}>

      {/* กรณีที่ Auto gen Template มาแล้ว (ContractV.1 Approved) แล้ว Shipper มีการนำสัญญาเข้ามาใหม่ส่งผลให้สถานะของสัญญาV.2 กลับไปเป็น Save ดังนั้น Template Auto Gen จะต้องกด Regen ไม่ได้ https://app.clickup.com/t/86etzcgrc */}
      {/* 
          // status_capacity_request_management_id = [
          //     {
          //         "id": 1,
          //         "name": "Saved",
          //         "color": "#D0E5FD"
          //     },
          //     {
          //         "id": 2,
          //         "name": "Approved",
          //         "color": "#C2F5CA"
          //     },
          //     {
          //         "id": 3,
          //         "name": "Rejected",
          //         "color": "#FFF1CE"
          //     },
          //     {
          //         "id": 4,
          //         "name": "Confirmed",
          //         "color": "#EEDEFF"
          //     },
          //     {
          //         "id": 5,
          //         "name": "Terminated",
          //         "color": "#FDD0D0"
          //     }
          // ] 
      */}

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

                {columnVisibility.shipper_name && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("group.name", sortState, setSortState, setSortedData, tableData)}>
                    {`Shipper Name`}
                    {getArrowIcon("group.name")}
                  </th>
                )}

                {columnVisibility.contract_code && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("contract_code.contract_code", sortState, setSortState, setSortedData, tableData)}>
                    {`Contract Code`}
                    {getArrowIcon("contract_code.contract_code")}
                  </th>
                )}

                {columnVisibility.document_type && (
                  <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("nomination_type.document_type", sortState, setSortState, setSortedData, tableData)}>
                    {`Document Type`}
                    {getArrowIcon("nomination_type.document_type")}
                  </th>
                )}

                {columnVisibility.file && (
                  <th scope="col" className={`${table_header_style} text-center`}>
                    {`File`}
                  </th>
                )}

                {columnVisibility.comment && (
                  <th scope="col" className={`${table_header_style} text-center`}>
                    {`Comment`}
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

                let disableBtn = false
                const isSaved = row?.contract_code?.status_capacity_request_management_id == 1
                const isApprove = row?.contract_code?.status_capacity_request_management_id == 2
                const isTerminate = row?.contract_code?.status_capacity_request_management_id == 5

                if (isSaved) {
                  disableBtn = isSaved // ถ้าเป็น saved ให้ disable
                }

                if (isApprove) {
                  disableBtn = !isApprove
                }

                if (isTerminate) {
                  const { effectiveDeadline, hasPassed } = hasPassedEffectiveEndDate(row?.contract_code);
                  // hasPassed: true = วันนี้เลยวันสิ้นสุด (ตาม priority) มาแล้ว
                  // effectiveDeadline: คือวันที่ที่นำมาใช้จริง (อาจเป็น extend_deadline/terminate_date/contract_end_date)
                  disableBtn = hasPassed
                }

                return (
                  <tr
                    key={row?.id}
                    className={`${table_row_style}`}
                  >

                    {/* กรณีที่ Auto gen Template มาแล้ว (ContractV.1 Approved) แล้ว Shipper มีการนำสัญญาเข้ามาใหม่ส่งผลให้สถานะของสัญญาV.2 กลับไปเป็น Save ดังนั้น Template Auto Gen จะต้องกด Regen ไม่ได้ https://app.clickup.com/t/86etzcgrc */}
                    {
                      userDT?.account_manage?.[0]?.user_type_id !== 3 &&
                      <td className="px-2 py-1 min-w-[60px] text-center">
                        <input
                          type="checkbox"
                          checked={selectedRoles?.some((role: any) => role?.id === row?.id)}
                          // disabled={row?.contract_code?.status_capacity_request_management_id !== 2 ? true : false}
                          // disabled={row?.contract_code?.status_capacity_request_management_id !== 2 ? true : false} // เป็น approve และ terminate ถึงกดได้ แต่ถ้าเป็น terminate ต้องดูว่า today ผ่าน extend_deadline --> terminate_date --> contract_end_date หรือยัง ถ้ายังให้กดได้อยู่
                          disabled={disableBtn} // เป็น approve และ terminate ถึงกดได้ แต่ถ้าเป็น terminate ต้องดูว่า today ผ่าน extend_deadline --> terminate_date --> contract_end_date หรือยัง ถ้ายังให้กดได้อยู่
                          onChange={() => handleSelectRole(row.id)}
                          className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1]"
                        />
                      </td>
                    }

                    {columnVisibility.shipper_name && (
                      <td className="px-2 py-1 text-[#464255]">{row?.group ? row?.group?.name : ''}</td>
                    )}

                    {columnVisibility.contract_code && (
                      <td className="px-2 py-1 text-[#464255]">{row?.contract_code?.contract_code}</td>
                    )}

                    {columnVisibility.document_type && (
                      <td className="pl-2 py-1 text-center justify-center flex">
                        {row?.nomination_type && (
                          <div
                            className="flex w-[140px] !text-[14px] items-center justify-center rounded-full p-1 text-[#464255]"
                            style={{ backgroundColor: row?.nomination_type?.color }}
                          >
                            {`${row?.nomination_type?.document_type}`}
                          </div>
                        )}
                      </td>
                    )}

                    {columnVisibility.file && (
                      <td className="px-2 py-1 text-center">
                        <div className="inline-flex items-center justify-center relative">
                          {/* <button
                            type="button"
                            className="flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                            onClick={() => openAllFileModal(row?.id)}
                            // disabled={row?.file_capacity_request_management.length <= 0 && true}
                            disabled={!userPermission?.f_view || row?.upload_template_for_shipper_file.length <= 0}
                          >
                            <AttachFileRoundedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                          </button> */}

                          <button
                            type="button"
                            aria-label="Open files"
                            onClick={() => openAllFileModal(row?.id)}
                            className={iconButtonClass}
                            disabled={!userPermission?.f_view || row?.upload_template_for_shipper_file.length <= 0}
                          >
                            <AttachFileRoundedIcon
                              fontSize="inherit"
                              className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                              sx={{ color: 'currentColor', fontSize: 18 }}
                            />
                          </button>
                          <span className="px-2 text-[#464255]">
                            {/* {row?.upload_template_for_shipper_file.length} */}
                            {row?.upload_template_for_shipper_file.length >= 1 ? '1' : '0'}

                          </span>
                        </div>
                      </td>
                    )}

                    {columnVisibility.comment && (
                      <td className="px-2 py-1 text-center">
                        <div className="inline-flex items-center justify-center relative">
                          {/* <button
                            type="button"
                            className="flex items-center justify-center px-[2px] py-[2px] bg-white rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                            onClick={() => openReasonModal(row?.id, row?.upload_template_for_shipper_comment, row)}
                            // disabled={row?.release_summary_comment?.length <= 0 && true}
                            // disabled={!userPermission?.f_view || row?.release_summary_comment?.length <= 0}
                            disabled={!userPermission?.f_view}
                          >
                            <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                          </button> */}
                          <button
                            type="button"
                            className={iconButtonClass}
                            onClick={() => openReasonModal(row?.id, row?.upload_template_for_shipper_comment, row)}
                            disabled={!userPermission?.f_view}
                          >
                            <ChatBubbleOutlineOutlinedIcon
                              fontSize="inherit"
                              className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                              sx={{ color: 'currentColor', fontSize: 18 }}
                            />
                          </button>

                          <span className="px-2 text-[#464255]">
                            {row?.upload_template_for_shipper_comment?.length}
                          </span>
                        </div>
                      </td>
                    )}


                    {columnVisibility.created_by && (
                      <td className="px-2 py-1">
                        <div>
                          <span className="text-[#464255]">{row?.create_by_account?.first_name} {row?.create_by_account?.last_name}</span>
                          {/* <div className="text-gray-500 text-xs">{row?.create_date ? formatDate(row?.create_date) : ''}</div> */}
                          <div className="text-gray-500 text-xs">{row?.create_date ? formatDateTimeSec(row?.create_date) : ''}</div>
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
                                  // role shipper เฉพาะเมนู upload template for shipper ให้ปิด function history ไปเลยนะคะ
                                  // userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("history", row?.id) }}><RestoreOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`History`}</li>
                                  userDT?.account_manage?.[0]?.user_type_id !== 3 && userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("history", row?.id) }}><RestoreOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`History`}</li>
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

export default TableNomUploadTemplateForShipper;