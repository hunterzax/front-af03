import { useEffect, useRef } from "react";
import React, { FC, useState } from 'react';
import TableSkeleton, { DefaultSkeleton } from '@/components/material_custom/DefaultSkeleton';
import { formatDate } from '@/utils/generalFormatter';

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";

interface TableProps {
  openEditForm: (id: any) => void;
  openViewForm: (id: any) => void;
  tableData: any;
  isLoading: any;
  columnVisibility: any;
}

const TableCustomerType: React.FC<TableProps> = ({ openEditForm, openViewForm, tableData, isLoading, columnVisibility }) => {
  
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

  const handleClickOutside = (event: MouseEvent) => {
    if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
      setOpenPopoverId(null);
    }
  };
  const getArrowIcon = (column: string) => {
    return <div className={`${table_col_arrow_sort_style}`}>
      <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
      <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
    </div>
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
          <table className="w-full text-sm text-left rtl:text-right table-auto">
            <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-1">
              <tr className="h-9">

                {columnVisibility.entry_exit && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("entry_exit_id", sortState, setSortState, setSortedData, tableData)}>
                    {`Entry / Exit`}
                    {getArrowIcon("entry_exit_id")}
                  </th>
                )}

                {columnVisibility.cust_type && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("name", sortState, setSortState, setSortedData, tableData)}>
                    {`Customer Type`}
                    {getArrowIcon("name")}
                  </th>
                )}

                {columnVisibility.create_by && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("create_by_account.first_name", sortState, setSortState, setSortedData, tableData)}>
                    {`Created by`}
                    {getArrowIcon("create_by_account.first_name")}
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

                  {columnVisibility.cust_type && (
                    <td className="px-2 py-1 text-[#464255]">{row?.name ? row?.name : ''}</td>
                  )}

                  {columnVisibility.create_by && (
                    <td className="px-2 py-1 text-[#464255]">
                      <div>
                        <span className="text-[#464255]">{row?.create_by_account?.first_name} {row?.create_by_account?.last_name}</span>
                        <div className="text-gray-500 text-xs">{formatDate(row?.create_date)}</div>
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

export default TableCustomerType;