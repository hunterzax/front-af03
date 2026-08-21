import { useEffect, useRef } from "react";
import React, { FC, useState } from 'react';
import TableSkeleton, { DefaultSkeleton } from '@/components/material_custom/DefaultSkeleton';
import { formatDateNoTime, formatDateNoTimeNoPlusSeven, formatDateTimeSec, formatDateTimeSecNoPlusSeven, iconButtonClass } from '@/utils/generalFormatter';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
interface TableProps {
  openEditForm: (id: any) => void;
  openViewForm: (id: any) => void;
  openAllFileModal: (id?: any, data?: any) => void;
  tableData: any;
  isLoading: any;
  columnVisibility: any;
  userPermission?: any;
}

const TableQueryShipperFiles: React.FC<TableProps> = ({ openEditForm, openViewForm, tableData, isLoading, columnVisibility, userPermission, openAllFileModal }) => {
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

  return (
    <div className={`relative h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md z-1`}>

      {
        isLoading ?
          <table className="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
              <tr className="h-9">

                {columnVisibility.term && (
                  <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("term_type.name", sortState, setSortState, setSortedData, tableData)}>
                    {`Term`}
                    {getArrowIcon("term_type.name")}
                  </th>
                )}

                {columnVisibility.planning_code && (
                  <th scope="col" className={`${table_sort_header_style} `} onClick={() => handleSort("planning_code", sortState, setSortState, setSortedData, tableData)}>
                    {`Planning Code`}
                    {getArrowIcon("planning_code")}
                  </th>
                )}

                {columnVisibility.file && (
                  <th scope="col" className={`${table_header_style} text-center`} >
                    {`File`}
                  </th>
                )}

                {columnVisibility.shipper_name && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("group.name", sortState, setSortState, setSortedData, tableData)}>
                    {`Shipper Name`}
                    {getArrowIcon("group.name")}
                  </th>
                )}

                {columnVisibility.shipper_file_date && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("shipper_file_submission_date", sortState, setSortState, setSortedData, tableData)}>
                    {`Shipper File Submission Date`}
                    {getArrowIcon("shipper_file_submission_date")}
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
              </tr>
            </thead>

            <tbody>
              {sortedData && sortedData?.map((row: any, index: any) => (
                <tr
                  key={row?.id}
                  className={`${table_row_style}`}
                >

                  {columnVisibility.term && (
                    <td className="pl-2 py-1 text-center">
                      {row?.term_type && (
                        <div className="w-full flex items-center justify-center">
                          <div
                            className="flex w-[80%] !text-[14px] items-center justify-center rounded-full py-1 px-2 text-[#464255]"
                            style={{ backgroundColor: row?.term_type?.color }}
                          >
                            {`${row?.term_type?.name}`}
                          </div>
                        </div>
                      )}
                    </td>
                  )}

                  {columnVisibility.planning_code && (
                    <td className="px-2 py-1 text-[#464255]">{row?.planning_code}</td>
                  )}

                  {columnVisibility.file && (
                    <td className="px-2 py-1 text-center">
                      <div className="inline-flex items-center justify-center relative">
                        {/* <button
                          type="button"
                          className="flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                          onClick={() => openAllFileModal(row?.id)}
                          // disabled={row?.file_capacity_request_management.length <= 0 && true}
                          // disabled={!userPermission?.f_view || row?.query_shipper_planning_files_file.length <= 0}
                          disabled={row?.query_shipper_planning_files_file.length <= 0}
                        >
                          <AttachFileRoundedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                        </button> */}

                        <button
                          type="button"
                          aria-label="Open files"
                          onClick={() => openAllFileModal(row?.id)}
                          className={iconButtonClass}
                          disabled={row?.query_shipper_planning_files_file.length <= 0}
                        >
                          <AttachFileRoundedIcon
                            fontSize="inherit"
                            className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                            sx={{ color: 'currentColor', fontSize: 18 }}
                          />
                        </button>

                        <span className="px-2 text-[#464255]">
                          {row?.query_shipper_planning_files_file.length}
                        </span>
                      </div>
                    </td>
                  )}

                  {columnVisibility.shipper_name && (
                    <td className="px-2 py-1 text-[#464255]">{row?.group ? row?.group?.name : ''}</td>
                  )}

                  {columnVisibility.shipper_file_date && (
                    // <td className="px-2 py-1 text-[#464255]">{row?.shipper_file_submission_date ? formatDateTimeSecNoPlusSeven(row?.shipper_file_submission_date) : ''}</td>
                    <td className="px-2 py-1 text-[#464255]">{row?.shipper_file_submission_date ? formatDateTimeSec(row?.shipper_file_submission_date) : ''}</td>
                  )}

                  {columnVisibility.start_date && (
                    <td className="px-2 py-1 text-[#464255]">{row?.start_date ? formatDateNoTime(row?.start_date) : ''}</td>
                  )}

                  {columnVisibility.end_date && (
                    <td className="px-2 py-1 text-[#0DA2A2]">{row?.end_date ? formatDateNoTime(row?.end_date) : ''}</td>
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

export default TableQueryShipperFiles;