"use client";

import React, { useState, useRef, useEffect, Dispatch, SetStateAction, useMemo } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    getFilteredRowModel,
    VisibilityState,
    TableOptions,
    SortingFn,
} from "@tanstack/react-table";
import { Tune } from "@mui/icons-material"
import { table_header_style, table_sort_header_style } from "@/utils/styles";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import SearchInput2 from "@/components/other/searchInput2";
import NodataTable from "@/components/other/nodataTable";
import Spinloading from "@/components/other/spinLoading";
import TableSkeleton from "@/components/material_custom/DefaultSkeleton";
import { Pagination } from "@mui/material";
import { toDayjs } from "@/utils/generalFormatter";
import { CustomTooltip } from "../other/customToolTip";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function OffsetTable(
    {
        data,
        columns,
        isLoading,
        isTableLoading,
        exportBtn = undefined,
        onColumnVisibilityChange,
        initialColumns,
        onFilteredDataChange,
        border = true,
        fixHeight = true,
        filter = true,
        filterProps = undefined,
        fullWidth = false,
        tuneOption = true,
        showPagesize = true,
        showPagination = true,
        haveTooltip = false,
        tooltipMsg = '',
        defaultSorting = undefined,
        onSortDataChange,
        resetInitial = false,
        setresetInitial,

        totalItems,
        currentPage,
        itemsPerPage,
        onPageChange,
        onItemsPerPageChange,
        globalFilter,
        setGlobalFilter,
    }: any
    // }: AppTableProps
) {

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const [columnVisibilityState, setColumnVisibilityState] = useState<VisibilityState>(initialColumns || {});
    const [tk, settk] = useState<boolean>(false);
    const [dataTable, setdataTable] = useState<any>(data);


    useEffect(() => {
        if (resetInitial == true) {
            setColumnVisibilityState(initialColumns);
            setTimeout(() => {
                setresetInitial(false);
            }, 100);
        }
    }, [resetInitial])

    const memoData = useMemo(() => (Array.isArray(data) ? data : []), [data]);
    const memoCols = useMemo(() => columns, [columns]);

    const tableConfig: TableOptions<any> = {
        data: memoData,
        columns: memoCols,
        state: {
            globalFilter: globalFilter?.trim(),
            columnVisibility: columnVisibilityState,
            // pagination: { pageIndex: currentPage, pageSize: itemsPerPage }
        },
        onColumnVisibilityChange: (updater) => {
            const newState = typeof updater === 'function' ? updater(columnVisibilityState) : updater;
            // const f_initialColumns = initialColumns?.find((item: any) => item?.key == )

            setColumnVisibilityState(newState);
            onColumnVisibilityChange?.(newState);
        },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        initialState: {
            sorting: defaultSorting && (
                [
                    {
                        id: defaultSorting,
                        desc: false
                    }
                ]
            )
        }
    };

    let table = useReactTable(tableConfig);

    useEffect(() => {
        table.setOptions(prev => ({ ...prev, data: memoData })); // บังคับ table รับ data ใหม่
        table.setPageIndex(0);
        table.setPageSize(memoData.length); // หรือเลขที่ต้องการ เช่น 100
    }, [memoData, table]);

    // Function to get filtered data for export
    const getFilteredData = () => {
        return table.getFilteredRowModel().rows.map(row => row.original);
    };

    // Update filtered data when filters change
    useEffect(() => {
        if (onFilteredDataChange) {
            const filteredData = getFilteredData();
            if (onSortDataChange) {
                const sortedRows = table.getSortedRowModel().rows.map(row => row.original);
                onFilteredDataChange(sortedRows);
            } else {
                onFilteredDataChange(filteredData);
            }

            setdataTable((pre: any) => filteredData);
            settk(!tk);
        }
    }, [globalFilter, columnVisibilityState, data, onFilteredDataChange]);

    const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(event.target as Node) &&
                anchorEl &&
                !(anchorEl as Node).contains(event.target as Node)
            ) {
                setAnchorEl(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [anchorEl]);

    useEffect(() => {
        if (dataTable?.length == 0 && data?.length > 0) {
            setdataTable(data)
        }
    }, [data])

    useEffect(() => {
        if (onSortDataChange) {
            const sortedRows = table.getSortedRowModel().rows.map(row => row.original);
            onSortDataChange(sortedRows);
        }
    }, [table.getState().sorting, data]);

    return (
        <div className={`py-4 ${fixHeight == true ? 'h-[calc(100vh-380px)]' : 'h-full'}  block w-full rounded-t-md z-1`}>
            <div className="w-full h-[100%]">
                <div className={`border-[#DFE4EA] ${border == true ? 'border-[1px] p-4' : fullWidth == true ? 'border-none px-0 py-0' : 'border-none px-4 py-0'} rounded-xl shadow-sm`}>
                    <div className="mb-2 flex gap-4 items-center relative ">
                        {filter == true && (
                            <div className=" text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4 gap-4 w-full">
                                <div className="flex items-center gap-2">
                                    {tuneOption == true &&
                                        <div onClick={handleTogglePopover}>
                                            <Tune
                                                className="cursor-pointer rounded-lg"
                                                style={{
                                                    fontSize: "18px",
                                                    color: "#2B2A87",
                                                    borderRadius: "4px",
                                                    width: "22px",
                                                    height: "22px",
                                                    border: "1px solid rgba(43, 42, 135, 0.4)",
                                                }}
                                            />
                                        </div>
                                    }

                                    {
                                        haveTooltip == true && <CustomTooltip
                                            title={tooltipMsg}
                                            placement="top-end"
                                            arrow
                                        >
                                            <div className="w-[20px] h-[20px] flex items-center justify-center rounded-lg cursor-pointer">
                                                <InfoOutlinedIcon
                                                    style={{ fontSize: "11px", color: '#747474', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                                />
                                            </div>
                                        </CustomTooltip>
                                    }


                                    {filterProps &&
                                        filterProps
                                    }
                                </div>

                                <div className="flex flex-wrap gap-2 justify-end">
                                    <SearchInput2 value={globalFilter ?? ""} setGlobalFilter={setGlobalFilter} />
                                    {exportBtn && exportBtn}
                                </div>
                            </div>
                        )}

                        {anchorEl && (
                            <div
                                ref={popoverRef}
                                className=" z-10 bg-white border p-4 shadow rounded absolute left-[30px] top-0"
                            >
                                {table?.getAllLeafColumns()?.map((column) => {

                                    return (
                                        <div key={column.id} className="text-sm mt-2">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 border border-gray-400 rounded-md checked:bg-[#1473A1] checked:border-transparent text-white focus:ring-0"
                                                    checked={column?.getIsVisible()}
                                                    onChange={column?.getToggleVisibilityHandler()}
                                                    style={{
                                                        accentColor: '#1473A1',
                                                    }}
                                                />
                                                <span className="text-[#58585A] font-semibold !text-[15px]">{column?.columnDef?.header as string}</span>
                                                {/* <span className="text-[#58585A] font-semibold !text-[15px]">{column?.columnDef?.meta ? column?.columnDef?.meta?.specialHeader :  column?.columnDef?.header as string}</span> */}
                                            </label>
                                        </div>
                                    )
                                }

                                )}
                            </div>
                        )}
                    </div>
                    <div className="w-full overflow-auto relative h-full">
                        <Spinloading spin={isTableLoading} rounded={0} />
                        {
                            isLoading ?
                                <table
                                    className="relative overflow-y-auto text-sm text-left rtl:text-right text-gray-500 w-full"
                                >
                                    <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-[9]" >
                                        {table?.getHeaderGroups()?.map((headerGroup) => {
                                            return (
                                                <tr key={headerGroup?.id} className="h-9 relative z-50">
                                                    {headerGroup?.headers?.map((header, index) => {
                                                        const getStyle: any = columns?.find((item: any) => item?.accessorKey == (header?.column?.columnDef as any)?.accessorKey);
                                                        const canSort = header.column.getCanSort()
                                                        const enableSorting = canSort || header?.column?.columnDef?.enableSorting == true;
                                                        const size = header.getSize() == 150 ? undefined : header.getSize() // 150 is default size of column
                                                        const meta = header.column.columnDef.meta as any
                                                        const width = getStyle?.width ? getStyle?.width : size ? size : meta?.width ? meta?.width : '100%'
                                                        const align = getStyle?.align ? getStyle?.align : meta?.align ? meta?.align : 'left'
                                                        return (
                                                            <th
                                                                key={header.id}
                                                                scope="col"
                                                                colSpan={header.colSpan}
                                                                className={`${enableSorting ? table_sort_header_style : table_header_style} ${index == 0 ? 'rounded-tl-md' : (headerGroup?.headers?.length - 1 == index) && 'rounded-tr-md'} text-center relative z-50`}
                                                                onClick={enableSorting ? header.column.getToggleSortingHandler() : undefined}
                                                                style={{
                                                                    textAlign: align,
                                                                    backgroundColor: getStyle?.headerColor ? getStyle?.headerColor : meta?.headerColor ? meta?.headerColor : '#1473A1',
                                                                    justifyItems: (enableSorting || !['center', 'right', 'left', 'start', 'end'].includes(align)) ? undefined : align
                                                                }}
                                                            >
                                                                <div style={{ width: width }}>
                                                                    {flexRender(
                                                                        header?.column?.columnDef?.header,
                                                                        header?.getContext()
                                                                    )}
                                                                    {enableSorting && (
                                                                        <div className={`absolute right-0 top-1/2 transform -translate-y-1/2 flex flex-col items-center -space-y-3`}>
                                                                            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: header.column.getIsSorted() === "asc" ? 1 : 0.4, }} />
                                                                            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: header.column.getIsSorted() === "desc" ? 1 : 0.4, }} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </th>
                                                        )
                                                    })}
                                                </tr>
                                            )
                                        })}
                                    </thead>
                                    {data?.length > 0 && dataTable?.length > 0 &&
                                        <tbody>
                                            {table?.getRowModel()?.rows?.map((row: any) => (
                                                <tr key={row?.id} className="border-b-[1px] ">
                                                    {row?.getVisibleCells().map((cell: any, index: any) => {
                                                        const getStyle: any = columns?.find((item: any) => item?.accessorKey == cell?.column?.columnDef?.accessorKey);
                                                        const meta = cell.column.columnDef.meta as any
                                                        return (
                                                            <td key={cell.id} className="border px-4 py-2 text-[#464255] bg-white border-none h-[53px]"
                                                                style={{
                                                                    color: getStyle?.textColor ? getStyle?.textColor : meta?.textColor ? meta?.textColor : '#464255',
                                                                    textAlign: getStyle?.align ? getStyle?.align : meta?.align ? meta?.align : 'left',
                                                                    backgroundColor: getStyle?.cellColor ? getStyle?.cellColor : meta?.cellColor ? meta?.cellColor : '#fff',
                                                                    fontWeight: getStyle?.textStyle ? getStyle?.textStyle : meta?.textStyle ? meta?.textStyle : 'normal'
                                                                }}
                                                            >
                                                                {flexRender(cell?.column?.columnDef?.cell, cell?.getContext())}
                                                            </td>
                                                        )
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    }
                                </table>
                                :
                                <TableSkeleton />
                        }

                        {isLoading && (data?.length == 0 || dataTable?.length == 0) && <NodataTable />}
                    </div>
                </div>

                {data?.length > 0 && showPagination && (
                    <div className="w-full relative">
                        {/* ส่วนแสดงผลการแบ่งหน้า */}
                        <div className="h-[50px] flex items-center justify-between whitespace-nowrap w-full">
                            <div className="flex items-center gap-3 text-sm" style={{ visibility: showPagesize == true ? 'visible' : 'hidden' }}>
                                {`Show`}
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#DFE4EA] focus:border-[#DFE4EA] block w-full p-1"
                                >
                                    <option value={10}>10</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                            <Pagination
                                shape="rounded"
                                page={currentPage}
                                count={totalPages}
                                onChange={(_, page) => onPageChange(page)}

                                sx={{
                                    "& .Mui-selected": {
                                        backgroundColor: "#1473A1 !important",
                                        color: "#ffffff !important",
                                    },
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}