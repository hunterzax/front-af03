import { useEffect, useRef } from "react";
import React, { FC, useState } from 'react';
import TableSkeleton, { DefaultSkeleton } from '@/components/material_custom/DefaultSkeleton';
import { anonymizeEmail, formatDate, formatDateNoTime, formatDateTimeSec, formatNumber, iconButtonClass, maskLastFiveDigits } from '@/utils/generalFormatter';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import BtnActionTable from "@/components/other/btnActionInTable";

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style, table_sort_header_style_original } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
interface TableProps {
  openEditForm: (id: any) => void;
  openViewForm: (id: any) => void;
  openReason: (id: any, dataDiv: any, dataShipper: any) => void;
  openRole: (id: any, dataUser: any, dataRole: any) => void;
  openStat: (id: any, dataUser: any) => void;
  openReasonModal: (id: any, dataUser: any) => void;
  openPwGen: (id: any, dataUser: any) => void;
  openHistoryForm: (id: any) => void;
  tableData: any;
  isLoading: any;
  columnVisibility: any;
  userPermission?: any;
}

const TableUser: React.FC<TableProps> = ({ openEditForm, openViewForm, openRole, openStat, openReasonModal, openReason, openPwGen, openHistoryForm, tableData, isLoading, columnVisibility, userPermission }) => {

  const [sortState, setSortState] = useState({ column: null, direction: null });
  const [sortedData, setSortedData] = useState(tableData);
  useEffect(() => {
    // let filteredUsers = tableData?.filter((u: any) =>
    //   !u.account_manage.some((account: any) => account.user_type_id === 1)
    // );

    // if (tableData && tableData.length > 0) {
    //   // setSortedData(tableData);
    //   setSortedData(filteredUsers);
    // }
    // setSortedData(filteredUsers);
    setSortedData(tableData);

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
      setOpenPopoverId(null); // Close the popover if it's already open
    } else {
      setOpenPopoverId(id); // Open the popover for the clicked row
    }
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

  const openStatFunc = (id: any, data: any) => {
    openStat(id, { "user_id": data?.user_id, "company_name": data?.company_name, "first_name": data?.first_name, "last_name": data?.last_name, "status": data?.status });
    setOpenPopoverId(null);
  }

  const openPwFunc = (id: any, data: any) => {

    openPwGen(id, { "user_id": id, "company_name": data?.company_name, "name": data?.name, "password_gen_flag": data?.password_gen_flag, "password_gen_origin": data?.password_gen_origin, "email": data?.email });
    setOpenPopoverId(null);
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
    // You can add additional logic here
  };

  return (
    <div className="h-[calc(100vh-380px)] overflow-y-auto overflow-x-auto rounded-t-md relative z-1">
      {/* <table className="min-w-full text-sm text-left rtl:text-right text-gray-500 whitespace-nowrap"> */}

      {
        isLoading ?
          <table className="table-auto min-w-full text-sm rtl:text-right text-gray-500 whitespace-nowrap">
            <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
              <tr className="h-9">

                {columnVisibility.login_mode && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("account_manage[0].mode_account_id", sortState, setSortState, setSortedData, tableData)}>
                    {`Login Mode`}
                    {getArrowIcon("account_manage[0].mode_account_id")}
                  </th>
                )}

                {columnVisibility.status && (
                  <th scope="col" className={`${table_header_style}`} >
                    {`Status`}
                  </th>
                )}

                {columnVisibility.id_name && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("user_id", sortState, setSortState, setSortedData, tableData)}>
                    {`User ID`}
                    {getArrowIcon("user_id")}
                  </th>
                )}

                {columnVisibility.company_name && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("account_manage.group.name", sortState, setSortState, setSortedData, tableData)}>
                    {/* {`Company/Group Name`} */}
                    {`Group Name`}
                    {/* {getArrowIcon("account_manage[0].group_id")} */}
                    {getArrowIcon("account_manage.group.name")}
                  </th>
                )}

                {columnVisibility.user_type && (
                  // <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("account_manage[0].user_type_id", sortState, setSortState, setSortedData, tableData)}>
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("account_manage.user_type.name", sortState, setSortState, setSortedData, tableData)}>
                    {`User Type`}
                    {getArrowIcon("account_manage.user_type.name")}
                    {/* row?.account_manage[row?.account_manage?.length - 1]?.user_type */}
                  </th>
                )}

                {columnVisibility.division_name && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("account_manage.division.division_name", sortState, setSortState, setSortedData, tableData)}>
                    {`Division Name`}
                    {getArrowIcon("account_manage.division.division_name")}
                  </th>
                )}

                {columnVisibility.first_name && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("first_name", sortState, setSortState, setSortedData, tableData)}>
                    {`First Name`}
                    {getArrowIcon("first_name")}
                  </th>
                )}

                {columnVisibility.last_name && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("last_name", sortState, setSortState, setSortedData, tableData)}>
                    {`Last Name`}
                    {getArrowIcon("last_name")}
                  </th>
                )}

                {columnVisibility.type && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("type_account.name", sortState, setSortState, setSortedData, tableData)}>
                    {`Type`}
                    {getArrowIcon("type_account.name")}
                  </th>
                )}

                {columnVisibility.role_default && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("role.name", sortState, setSortState, setSortedData, tableData)}>
                    {`Role`}
                    {getArrowIcon("role.name")}
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

                {columnVisibility.reason && (
                  <th scope="col" className={`${table_header_style}`} >
                    {`Reason`}
                  </th>
                )}

                {columnVisibility.update_by && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("updated_by_account.first_name", sortState, setSortState, setSortedData, tableData)}>
                    {`Updated by`}
                    {getArrowIcon("updated_by_account.first_name")}
                  </th>
                )}

                {columnVisibility.last_login && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("login_logs.create_date", sortState, setSortState, setSortedData, tableData)}>
                    {`Lasted Login`}
                    {getArrowIcon("login_logs.create_date")}
                  </th>
                )}

                {columnVisibility.last_login && (
                  <th scope="col" className={`${table_header_style} text-center`}>
                    {`Action`}
                    {/* {getArrowIcon("user_type_id")} */}
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

                  {columnVisibility.login_mode && (
                    <td className="px-2 py-1 justify-center ">{row?.account_manage[0]?.mode_account && <div className={`flex w-[100px] justify-center rounded-full p-1 ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"} `} style={{ backgroundColor: row?.status ? row?.account_manage[0]?.mode_account.color : '#EFECEC' }}>{row?.account_manage[0]?.mode_account.name} Mode</div>}</td>
                  )}

                  {columnVisibility.status && (
                    <td className="px-2 py-1 ">
                      {/* <div>
                        <label className="relative inline-block w-10 h-6 cursor-pointer">
                          <input
                            type="checkbox"
                            // defaultChecked={row?.status}
                            checked={row?.status}
                            className="sr-only peer "
                            // onChange={(e) => {
                            //   setselectedKey(row?.id);
                            //   settrIsLoading(true);
                            //   handleChange(e.target.checked)
                            // }}
                            onClick={() => { 
                              openStatFunc(row?.id, { "user_id": row?.user_id, "company_name": row?.account_manage[0]?.group.name, "first_name": row?.first_name, "last_name": row?.last_name, "status": row?.status }) 
                            }}
                          />
                          <span className="slider absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 transition duration-400 rounded-full peer-checked:bg-[#1473A1]"></span>
                          <span className="dot absolute h-4 w-4 left-1 bottom-1 bg-white transition duration-400 rounded-full peer-checked:translate-x-full"></span>
                        </label>
                      </div> */}
                      <div>
                        <label className="relative inline-block w-11 h-6 cursor-pointer">
                          <input
                            type="checkbox"
                            // checked={row?.status}
                            defaultChecked={row?.status} // ใส่แทน checked จะได้ไม่มี error ใน console
                            className="sr-only peer"
                            onClick={() => {
                              openStatFunc(row?.id, { "user_id": row?.user_id, "company_name": row?.account_manage[0]?.group.name, "first_name": row?.first_name, "last_name": row?.last_name, "status": row?.status })
                            }}
                          />
                          <span className="slider absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[#828282] transition duration-400 rounded-full peer-checked:bg-[#1473A1]"></span>
                          <span className="dot absolute h-5 w-5 left-0.5 bottom-0.5 bg-white transition duration-400 rounded-full peer-checked:translate-x-full"></span>
                        </label>
                      </div>
                    </td>
                  )}

                  {/* (2 = TSO, 3 = Shipper, 4 = Other) */}
                  {columnVisibility.id_name && (
                    <td className={`px-2 py-1 ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.user_id}</td>
                  )}

                  {columnVisibility.company_name && (
                    <td className={`px-2 py-1 ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.account_manage[0]?.group?.name}</td>
                  )}

                  {columnVisibility.user_type && (
                    <td className="px-2 py-1 justify-center">
                      {
                        row?.account_manage[row?.account_manage?.length - 1]?.user_type &&
                        <div
                          // className={`flex w-[100px] font-bold bg-[#EEE4FF] justify-center !text-[14px] rounded-full p-1 ${row?.status ? "!text-[#464255]" : "!text-[#9CA3AF]"}`}
                          className={`flex w-[100px] font-bold bg-[#EEE4FF] justify-center !text-[14px] rounded-full p-1 bg-opacity-50`}
                          style={{
                            backgroundColor: row?.status ? row?.account_manage[0]?.user_type?.color : '#EFECEC',
                            color: row?.status ? row?.account_manage[0]?.user_type?.color_text : '#9CA3AF'
                          }}
                        >
                          {row?.account_manage[row?.account_manage.length - 1]?.user_type?.name}
                        </div>
                      }
                    </td>
                  )}

                  {columnVisibility.division_name && (
                    <td className={`px-2 py-1 ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.account_manage[row?.account_manage?.length - 1]?.division?.division_name}</td>
                  )}

                  {columnVisibility.first_name && (
                    <td className={`px-2 py-1 ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.first_name}</td>
                  )}

                  {columnVisibility.last_name && (
                    <td className={`px-2 py-1 ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.last_name}</td>
                  )}

                  {/* บอกว่า user มาจากไหน PTT, TPA website, Manual */}
                  {columnVisibility.type && (
                    <td className="px-2 py-1 justify-center ">
                      {
                        <div className={`flex w-[100px] justify-center rounded-full p-1 ${row?.status ? "!text-[#464255]" : "!text-[#9CA3AF]"}`} style={{ backgroundColor: row?.status ? String(row?.type_account?.color) : '#EFECEC' }}>{row?.type_account?.name}</div>
                      }
                    </td>
                  )}

                  {/* role เดิมเป็นแบบเปิด modal */}
                  {/* <td className="px-2 py-1 text-center">
                    <div className="inline-flex items-center justify-center relative">
                      <button
                        type="button"
                        className="flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-[#DFE4EA] hover:border hover:border-[#DFE4EA] relative"
                        onClick={() => openRole(row?.id, { "user_id": row?.user_id, "company_name": row?.account_manage[0]?.group.name, "first_name": row?.first_name, "last_name": row?.last_name }, row?.account_manage[0]?.account_role)}
                      >
                        <PeopleAltOutlinedIcon sx={{ fontSize: 18, color: '#58585A' }} />
                        <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-[#00ADEF] rounded-full">
                          {row?.account_manage[row?.account_manage.length - 1]?.account_role?.length}
                        </span>
                      </button>
                    </div>
                  </td> */}
                  {columnVisibility.role_default && (
                    <td className={`px-2 py-1 ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.role?.name}</td>
                  )}

                  {columnVisibility.telephone && (
                    <td className={`px-2 py-1 ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.telephone ? maskLastFiveDigits(row?.telephone) : ''}</td>
                  )}

                  {columnVisibility.email && (
                    <td className={`px-2 py-1 ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.email ? anonymizeEmail(row?.email) : ''}</td>
                  )}

                  {columnVisibility.start_date && (
                    <td className={`px-2 py-1 ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.start_date ? formatDateNoTime(row?.start_date) : ''}</td>
                  )}

                  {columnVisibility.end_date && (
                    <td className={`px-2 py-1 ${row?.status ? "text-[#0DA2A2]" : "text-[#9CA3AF]"}`}>{row?.end_date ? formatDateNoTime(row?.end_date) : ''}</td>
                  )}

                  {columnVisibility.reason && (
                    <td className="px-2 py-1 text-center">
                      <div className="inline-flex items-center justify-center relative">
                        {/* <button
                          type="button"
                          className="flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                          onClick={() => openReasonModal(row?.id, row?.account_reason)}
                          disabled={row?.account_reason?.length <= 0 && true}
                        >
                          <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 18, color: '#747474', '&:hover': { color: '#ffffff' } }} />
                        </button> */}
                        <button
                          type="button"
                          className={iconButtonClass}
                          onClick={() => openReasonModal(row?.id, row?.account_reason)}
                          disabled={row?.account_reason?.length <= 0 && true}
                        >
                          <ChatBubbleOutlineOutlinedIcon
                            fontSize="inherit"
                            className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                            sx={{ color: 'currentColor', fontSize: 18 }}
                          />
                        </button>
                        <span className="px-2 text-[#464255]">
                          {row?.account_reason?.length}
                        </span>
                      </div>
                    </td>
                  )}

                  {/* เก็บไว้ เผื่ออนาคตต้องใช้ */}
                  {/* <td className="px-2 py-1 text-[#464255]">
                    <div>
                      <span className="text-[#464255]">{row?.update_by_account?.first_name} {row?.update_by_account?.last_name}</span>
                      <div className="text-gray-500 text-xs">{row?.update_date && formatDate(row?.update_date)}</div>
                    </div>
                  </td> */}

                  {columnVisibility.update_by && (
                    <td className="px-2 py-1">
                      <div>
                        <span className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.updated_by_account?.first_name} {row?.updated_by_account?.last_name}</span>
                        <div className="text-gray-500 text-xs">{row?.update_date ? formatDateTimeSec(row?.update_date) : ''}</div>
                      </div>
                    </td>
                  )}

                  {columnVisibility.last_login && (
                    <td className={`px-2 py-1 ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.login_logs?.length > 0 ? formatDate(row?.login_logs[0]?.create_date) : ''}</td>
                  )}

                  {columnVisibility.action && (
                    <td className="px-2 py-1">
                      {/* <div className="relative inline-block text-left"> */}
                      <div className="relative inline-flex justify-center items-center w-full">
                        <BtnActionTable togglePopover={togglePopover} row_id={row?.id} />
                        {openPopoverId === row?.id && (
                          <div ref={popoverRef}
                            className="absolute left-[-12rem] top-[-10px] mt-2 w-52 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                            <ul className="py-2">
                              {/* <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("view", row?.id) }}><RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> View</li>
                              <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("edit", row?.id) }}><EditOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> Edit</li>
                              <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("history", row?.id) }}><RestoreOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> History</li>
                              <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { openStatFunc(row?.id, { "user_id": row?.user_id, "company_name": row?.account_manage[0]?.group.name, "first_name": row?.first_name, "last_name": row?.last_name, "status": row?.status }) }}><CheckCircleRoundedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> Update User Status</li>
                              {
                                // MODE LOCAL ONLY
                                row?.account_manage[0]?.mode_account?.id == 2 && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { openPwFunc(row?.id, { "company_name": row?.account_manage[0]?.group.name, "name": `${row?.first_name + ' ' + row?.last_name}`, "password_gen_flag": row?.password_gen_flag, "password_gen_origin": row?.password_gen_origin }) }}><VpnKeyOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> Password</li>
                              } */}

                              {
                                userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("view", row?.id) }}><RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`View`}</li>
                              }
                              {
                                userPermission?.f_edit && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("edit", row?.id) }}><EditOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Edit`}</li>
                              }
                              {
                                userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("history", row?.id) }}><RestoreOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`History`}</li>
                              }
                              {
                                userPermission?.f_edit && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { openStatFunc(row?.id, { "user_id": row?.user_id, "company_name": row?.account_manage[0]?.group.name, "first_name": row?.first_name, "last_name": row?.last_name, "status": row?.status }) }}><CheckCircleRoundedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> Update User Status</li>
                              }
                              {
                                (userPermission?.f_view && row?.account_manage[0]?.mode_account?.id == 2) && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { openPwFunc(row?.id, { "company_name": row?.account_manage[0]?.group.name, "name": `${row?.first_name + ' ' + row?.last_name}`, "password_gen_flag": row?.password_gen_flag, "password_gen_origin": row?.password_gen_origin, "email": row?.email }) }}><VpnKeyOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> Password</li>
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

export default TableUser;