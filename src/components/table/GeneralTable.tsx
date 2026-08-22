"use client";

import React, { useState, useEffect } from 'react';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  VisibilityState,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { Popover, Pagination } from '@mui/material';
import { table_col_arrow_sort_style, table_row_style, table_sort_header_style, table_header_style } from '@/utils/styles';
import { dayinWeek } from '@/utils/date/week';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import Spinloading from "@/components/other/spinLoading";
import NodataTable from '@/components/other/nodataTable';

// ประกาศ interface สำหรับ props ของ component
interface GeneralTableProps {
  data: any[];  // ข้อมูลที่จะแสดงในตาราง
  columns: ColumnDef<any>[];  // คอลัมน์ที่จะแสดงในตาราง
  anchorEl?: null | HTMLElement;
  mainColumns?: string[];  // คอลัมน์ที่จะแสดงตอนกดซ่อนคอลัมน์ทั้งหทด
  conditionColumns?:  Record<string, boolean>;  // คอลัมน์ที่จะซ่อนคอลัมน์ทั้งหมด
  columnVisibility: VisibilityState;  // สถานะการแสดง/ซ่อนคอลัมน์
  onColumnVisibilityChange?: (visibility: VisibilityState) => void;  // callback เมื่อมีการเปลี่ยนแปลงการแสดง/ซ่อนคอลัมน์
  onHandleVisibilityClose?: () => void;
  searchQuery?: string | null; // ค่าค้นหา
  isLoading: boolean;  // สถานะการโหลดข้อมูล
  hourRange?: [number, number];  // ช่วงชั่วโมงที่จะแสดง [เริ่มต้น, สิ้นสุด]
  isShowDayInWeek?: boolean; // สถานะการแสดงวันในสัปดาห์
}

export function GeneralTable({ 
  data, 
  columns,
  anchorEl,
  mainColumns,
  conditionColumns,
  columnVisibility, 
  onColumnVisibilityChange,
  onHandleVisibilityClose,
  searchQuery,
  isLoading, 
  hourRange,
  isShowDayInWeek
}: GeneralTableProps) {
  // สถานะสำหรับการจัดการตาราง
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibilityState, setColumnVisibilityState] = useState<VisibilityState>(columnVisibility || {});
  const [currentHourRange, setCurrentHourRange] = useState<[number, number] | undefined>(undefined);  
  const [removeFromShowHideColList, setRemoveFromShowHideColList] = useState<string[]>([]);

  const headerColor = '#1473A1'

  // ฟังก์ชันจัดการการเปลี่ยนแปลงการแสดง/ซ่อนคอลัมน์
  const handleColumnVisibilityChange = (updatedVisibility: VisibilityState) => {
    // Compare the objects
    const areEqual = JSON.stringify(updatedVisibility) === JSON.stringify(columnVisibilityState);
    if(!areEqual){
      setColumnVisibilityState(updatedVisibility);
      onColumnVisibilityChange?.(updatedVisibility);
    }
  };

  const handleShowAll = () => {
    const allKeys = table.getAllLeafColumns().map(col => col.id);
    const newVisibility = { ...columnVisibilityState };
    allKeys.forEach(key => {
      newVisibility[key] = true;
    });
    handleColumnVisibilityChange(newVisibility);
    
  }

  const handleHideAll = () => {
    const allKeys = table.getAllLeafColumns().map(col => col.id);
    const newVisibility = { ...columnVisibilityState };
    allKeys.forEach(key => {
      newVisibility[key] = false;
    });
    // คงคอลัมน์หลักไว้เสมอ
    if(mainColumns && mainColumns.length > 0){
      mainColumns.forEach(key => {
        newVisibility[key] = true;
      });
    }
    else if(allKeys.length > 0){
      newVisibility[allKeys[0]] = false;
    }
    handleColumnVisibilityChange(newVisibility);
  }

  // สร้าง instance ของตาราง
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility: columnVisibilityState,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: (updater) => {
      const newState = typeof updater === 'function' ? updater(columnVisibilityState) : updater;
      handleColumnVisibilityChange(newState);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), // needed for client-side global filtering
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // อัพเดทการแสดง/ซ่อนคอลัมน์ตามช่วงชั่วโมงที่เลือก หรือ วันในสัปดาห์
  useEffect(() => {
    const newVisibility = { ...columnVisibilityState };
    const removeFromShowHideColKeyList = []

    if(!hourRange){
      for (let i = 1; i <= 24; i++) {
        const key = `h${i}`
        removeFromShowHideColKeyList.push(key)
        newVisibility[key] = false;
      }
      setCurrentHourRange(undefined)
    }

    if(conditionColumns){
      const keys = Object.keys(conditionColumns)
      if(keys.length > 0){
        Object.keys(conditionColumns).forEach(key => {
          if(conditionColumns[key] == true){
            newVisibility[key] = true;
          }
          else{
            removeFromShowHideColKeyList.push(key)
            newVisibility[key] = false;
          }
        })
      }
    }

    if(isShowDayInWeek == true){
      dayinWeek.map((day) => {
        newVisibility[day] = true;
      })
    }
    else{
      dayinWeek.map((day) => {
        removeFromShowHideColKeyList.push(day)
        newVisibility[day] = false;
      })

      if(hourRange && hourRange.length > 1){
        const keys = []
        for (let i = hourRange[0]; i <= hourRange[1]; i++) {
          const key = `h${i}`
          keys.push(key)
        }
        
        // Compare keys and dynamicColumnKey
        const areArraysEqual = hourRange[0] === currentHourRange?.[0] && hourRange[1] === currentHourRange?.[1]
        for (let i = 1; i <= 24; i++) {
          const key = `h${i}`
          if(i < hourRange[0] || i > hourRange[1]){
            removeFromShowHideColKeyList.push(key)
            if(!areArraysEqual){
              newVisibility[key] = false;
            }
          }
          else if(i >= hourRange[0] && i <= hourRange[1] && !areArraysEqual){
            newVisibility[key] = true;
          }
        }
        setCurrentHourRange(hourRange)
      }
    }
    
    setRemoveFromShowHideColList(removeFromShowHideColKeyList)
    handleColumnVisibilityChange(newVisibility);
  }, [hourRange, isShowDayInWeek, conditionColumns]);

  useEffect(() => {
    table.setGlobalFilter(searchQuery)
  }, [searchQuery]);

  return (
    <>
      {/* ส่วนควบคุมการแสดง/ซ่อนคอลัมน์ */}
      {
        onHandleVisibilityClose && (
          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={onHandleVisibilityClose}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
            sx={{
                borderRadius: '20px',
                overflow: 'hidden',
            }}
            className="z-50"
          >
            <div className="px-4">
              {/* Daily > Hide/Unhide เอา Select All หรือ ซ่อน Select All ไปก่อน เพราะเดี่ยวมีคำถามว่า ที่นี้มีที่นั้นไม่มี https://app.clickup.com/t/86euy4bma */}
                {/* ปุ่มแสดง/ซ่อนคอลัมน์ทั้งหมด */}
              {/* <div className="mt-4">
                <label key="showHideAll" className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={table.getAllLeafColumns().filter(column => !removeFromShowHideColList.includes(column.id)).length <= Object.values(columnVisibilityState).filter(value => value === true).length}
                    onChange={() => {
                      table.getAllLeafColumns().filter(column => !removeFromShowHideColList.includes(column.id)).length <= Object.values(columnVisibilityState).filter(value => value === true).length ? handleHideAll() : handleShowAll()
                    }}
                    className={`h-4 w-4 border border-gray-400 rounded-md checked:bg-[${headerColor}] checked:border-transparent text-white focus:ring-0`}
                    style={{
                        accentColor: headerColor,
                    }}
                />
                <span className="text-[#58585A] font-semibold !text-[15px]">
                  Select All
                </span>
                </label>
              </div> */}

              
                <div className="mb-4">
                    <div className="flex flex-col gap-2 mt-2">
                      {/* รายการคอลัมน์ทั้งหมด */}
                      {
                        table.getAllLeafColumns()
                        .filter(column => !removeFromShowHideColList.includes(column.id))
                        .map(column => {
                          let displayText = typeof column.columnDef.header === 'string' 
                            ? column.columnDef.header 
                            : column.id
                          if(dayinWeek.includes(displayText)){
                            displayText = displayText.charAt(0).toUpperCase() + displayText.slice(1)
                          }
                          return (
                            <label key={column?.id} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={column.getIsVisible()}
                                onChange={column.getToggleVisibilityHandler()}
                                className={`h-4 w-4 border border-gray-400 rounded-md checked:bg-[${headerColor}] checked:border-transparent text-white focus:ring-0`}
                                style={{
                                    accentColor: headerColor,
                                }}
                            />
                            <span className="text-[#58585A] font-semibold !text-[15px]">
                              {displayText}
                            </span>
                            </label>
                          )
                        })
                      }
                    </div>
                </div>
            </div>
          </Popover>
        )
      }

      {/* ตารางแสดงข้อมูล */}
        <div className="w-full overflow-auto relative h-full rounded-t-md"> 
          {/* <Spinloading spin={isLoading} rounded={0} /> */} {/* ขอปิดไว้ก่อน มันซ้ำซ้อนกับ */}
          {
            isLoading ?
              <TableSkeleton />
              :
              <table className="relative overflow-y-auto text-sm text-left rtl:text-right text-gray-500 w-full">
                <thead className={`text-xs text-[#ffffff] bg-[${headerColor}] sticky top-0 z-[9]`} >
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id} className="h-9 relative z-50">
                      {headerGroup.headers.map(header => {
                        const canSort = header.column.getCanSort()
                        const size = header.getSize() == 150 ? undefined : header.getSize() // 150 is default size of column
                        const meta = header.column.columnDef.meta as any
                        return (
                          <th
                            key={header.id}
                            scope="col" 
                            className={`${canSort ? table_sort_header_style : table_header_style} text-center relative z-50`}
                            colSpan={header.colSpan}
                            style={{
                              textAlign: meta?.align ? meta?.align : 'left',
                              backgroundColor: meta?.headerColor ? meta?.headerColor : headerColor
                            }}
                            onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                          >
                            <div style={{ width: size ? size : meta?.width ? meta?.width : '100%' }}>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {canSort && (
                                <div className={`${table_col_arrow_sort_style}`}>
                                    <ArrowDropUpIcon sx={{ fontSize: 18, opacity: header.column.getIsSorted() === "asc"  ? 1 : 0.4, }} />
                                    <ArrowDropDownIcon sx={{ fontSize: 18, opacity: header.column.getIsSorted() === "desc" ? 1 : 0.4, }} />
                                </div>
                              )}
                            </div>
                          </th>
                        )
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map(row => (
                    <tr
                      key={row.id}
                      className={`${table_row_style} hover:bg-gray-50 even:bg-gray-50 even:hover:bg-gray transition-colors duration-200"`}
                    >
                      {row.getVisibleCells().map(cell => {
                        const meta = cell?.column?.columnDef?.meta as any
                        return (
                          <td
                            key={cell?.id}
                            className="border px-4 py-2 text-[#464255] bg-white border-none h-[53px]"
                            style={{
                              color: meta?.textColor ? meta?.textColor : '#464255',
                              textAlign: meta?.align ? meta?.align : 'left',
                              backgroundColor: meta?.cellColor ? meta?.cellColor : '#fff',
                              fontWeight: meta?.textStyle ? meta?.textStyle : 'normal'
                            }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
          }

          {/* {data?.length == 0 && <NodataTable />} */}
          {(data?.length == 0 && !isLoading) && <NodataTable />}
        </div>

        {/* ส่วนแสดงผลการแบ่งหน้า */}
        <div className="h-[50px] flex items-center justify-between whitespace-nowrap w-full">
          <div className="flex items-center gap-3 text-sm">
            {`Show`}
            <select
              value={table.getState().pagination.pageSize}
              onChange={e => {
                table.setPageSize(Number(e.target.value));
              }}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#DFE4EA] focus:border-[#DFE4EA] block w-full p-1"
            >
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <Pagination
            shape="rounded"
            page={table.getState().pagination.pageIndex + 1}
            count={table.getPageCount()}
            onChange={(_, page) => table.setPageIndex(page -1)}
            sx={{
              "& .Mui-selected": {
                backgroundColor: `${headerColor} !important`,
                color: "#ffffff !important",
              },
            }}
          />
        </div>
    </>
  );
} 