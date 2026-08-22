import React, { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
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
    SortingState,
    ColumnPinningState,
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

type AppTableProps = {
    data?: any;
    columns: ColumnDef<any>[];
    isLoading?: any
    filter?: any
    filterProps?: any
    isTableLoading?: any
    exportBtn?: any
    initialColumns?: any;  // สถานะการแสดง/ซ่อนคอลัมน์
    onColumnVisibilityChange?: (visibility: VisibilityState) => void;  // callback เมื่อมีการเปลี่ยนแปลงการแสดง/ซ่อนคอลัมน์
    smartquery?: any
    setsmartquery?: any
    onFilteredDataChange?: (filteredData: any[]) => void;  // callback to get filtered data
    border?: boolean
    fixHeight?: boolean
    fullWidth?: boolean
    pagination?: {
        pageIndex: number;
        pageSize: number;
    },
    setPagination?: Dispatch<SetStateAction<{
        pageIndex: number;
        pageSize: number;
    }>>
    manualPagination?: boolean
    totalItems?: number
    pageCount?: number
    sorting?: SortingState
    setSorting?: Dispatch<SetStateAction<SortingState>>
    onQueryChange?: (query: string) => void;
    onQueryKeyDown?: (query: string) => void;
    onQueryBlur?: (query: string) => void;
    tuneOption?: boolean
    showPagesize?: boolean
    showPagination?: boolean
    haveTooltip?: boolean
    tooltipMsg?: any,
    defaultSorting?: any,
    onSortDataChange?: (filteredData: any[]) => void, // callback to get filtered data
    resetInitial?: boolean, // ใช้สำหรับ กรณีมีหลาย tab และต้องการ reset hide/unhide
    setresetInitial?: any,
    columnPinning? : ColumnPinningState | undefined
};


// helper: แปลง "DD/MM/YYYY" → คีย์ตัวเลข YYYYMMDD
const toYmdKey = (s?: string | null): number | null => {
    if (!s) return null;
    const [d, m, y] = s?.split('/').map(Number);
    if (!d || !m || !y) return null;
    return y * 1e4 + m * 1e2 + d;
};

export const myCustomSortingByDateFn: SortingFn<any> = (rowA, rowB, columnId) => {
    // ดึงค่าจาก accessor (อย่าใช้ row.original[columnId])
    const a = rowA.getValue<string | undefined>(columnId);
    const b = rowB.getValue<string | undefined>(columnId);

    const ka = toYmdKey(a ?? null);
    const kb = toYmdKey(b ?? null);

    // เท่ากัน (รวมถึงทั้งคู่ว่าง) → ไม่ขยับลำดับ
    if (ka === kb) return 0;

    // จัดการค่าว่างให้ไปท้าย
    // if (ka === null) return 1;
    // if (kb === null) return -1;
    if (ka === null) return -1; // a ว่าง -> มาก่อน
    if (kb === null) return 1; // b ว่าง -> a ไปหลัง

    // ASC (TanStack จะสลับสัญญาณให้เองเมื่อกด DESC)
    return ka - kb;
};

export const sortingByDateFn: (dateA: any, dateB: any, dateFormat?: string) => number = (dateA, dateB, dateFormat) => {
    // Handle null or undefined values
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1; // Valid dates come before nulls
    if (!dateB) return -1;  // Nulls come before valid dates

    const dayA = toDayjs(dateA, dateFormat)
    const dayB = toDayjs(dateB, dateFormat)
    return dayA.isAfter(dayB) ? 1 : dayA.isSame(dayB) ? 0 : -1
};

export default function AppTable(
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
        pagination,
        setPagination,
        manualPagination = false,
        totalItems,
        pageCount,
        sorting,
        setSorting,
        onQueryChange,
        onQueryKeyDown,
        onQueryBlur,
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
        columnPinning,
    }: AppTableProps) {

    const [globalFilter, setGlobalFilter] = useState("");
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

    console.log('columnPinning : ', columnPinning);

    // Build table configuration object
    const tableConfig: TableOptions<any> = {
        data: data?.length > 0 ? data : [],
        columns,
        state: {
            globalFilter: globalFilter?.trim(),
            columnVisibility: columnVisibilityState,
            ...(manualPagination && sorting ? { sorting } : {}),
        },
        // onColumnVisibilityChange: setColumnVisibility,
        onColumnVisibilityChange: (updater) => {
            const newState = typeof updater === 'function' ? updater(columnVisibilityState) : updater;
            // const f_initialColumns = initialColumns?.find((item: any) => item?.key == )

            setColumnVisibilityState(newState);
            onColumnVisibilityChange?.(newState);
        },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        ...(manualPagination ? {} : { getPaginationRowModel: getPaginationRowModel() }),
        ...(manualPagination ? {} : { getSortedRowModel: getSortedRowModel() }),
        getFilteredRowModel: getFilteredRowModel(),
        manualPagination: manualPagination,
        manualSorting: manualPagination,
        initialState: {
            sorting: defaultSorting && (
                [
                    {
                        id: defaultSorting,
                        desc: false
                    }
                ]
            ),
            ...(columnPinning && {columnPinning: columnPinning})
        }
    };

    // Only add pagination configuration if both props are provided
    if (pagination && setPagination) {
        tableConfig.state = {
            ...tableConfig.state,
            pagination: pagination,
        };
        tableConfig.onPaginationChange = (updater: any) => {
            const newState = typeof updater === 'function' ? updater(pagination) : updater;
            if (JSON.stringify(pagination) !== JSON.stringify(newState)) {
                setPagination(newState);
            }
        };
    }

    if (manualPagination) {
        const effectivePageSize = pagination?.pageSize ?? 10;
        const effectiveTotalItems = typeof totalItems === 'number' ? totalItems : (Array.isArray(data) ? data.length : 0);
        const computedPageCount = Math.max(1, Math.ceil(effectiveTotalItems / Math.max(1, effectivePageSize)));
        tableConfig.pageCount = typeof pageCount === 'number' ? pageCount : computedPageCount;
        if (sorting && setSorting) {
            tableConfig.onSortingChange = (updater: any) => {
                const newState = typeof updater === 'function' ? updater(sorting) : updater;
                if (JSON.stringify(sorting) !== JSON.stringify(newState)) {
                    setSorting(newState);
                }
            };
        }
    }

    const table = useReactTable(tableConfig);

    // Function to get filtered data for export
    const getFilteredData = () => {
        return table.getFilteredRowModel().rows.map(row => row.original);
    };

    // Update filtered data when filters change
    useEffect(() => {
        if (onFilteredDataChange) {
            const filteredData = getFilteredData();

            // กัน return data ออกไปเมื่อโหลด ข้อมูลจาก onSortDataChange
            // อธิบาย onSortDataChange จะส่ง data ออกไป ก็ต่อเมื่อทำการ sort ที่ useEffect ด้านล่าง
            // BANGJU
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

    const handleQueryOnChange = (query: string) => {
        setGlobalFilter(query);
        onQueryChange?.(query);
    };

    const handleQueryKeyPress = (query: string) => {
        onQueryKeyDown?.(query);
    };

    const handleQueryBlur = (query: string) => {
        onQueryBlur?.(query);
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


                                    {filterProps}
                                </div>

                                <div className="flex flex-wrap gap-2 justify-end">
                                    <SearchInput2
                                        value={globalFilter ?? ""}
                                        setGlobalFilter={handleQueryOnChange}
                                        onKeyDown={handleQueryKeyPress}
                                        onBlur={handleQueryBlur}
                                    />
                                    {exportBtn}
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
                                        <div key={column?.id} className="text-sm mt-2">
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
                    <div className="w-full overflow-auto relative max-h-[59dvh] h-auto overflow-y-auto">
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
                                                        const canSort = header?.column?.getCanSort?.()
                                                        const enableSorting = canSort || header?.column?.columnDef?.enableSorting == true;
                                                        const size = header?.getSize?.() == 150 ? undefined : header?.getSize?.() // 150 is default size of column
                                                        const meta = header?.column?.columnDef?.meta as any
                                                        const width = getStyle?.width ? getStyle?.width : size ? size : meta?.width ? meta?.width : '100%'
                                                        const align = getStyle?.align ? getStyle?.align : meta?.align ? meta?.align : 'left'

                                                        const isPinned = header?.column?.getIsPinned?.()
                                                        const isLastLeftPinnedColumn =
                                                            isPinned === 'left' && header?.column?.getIsLastColumn?.('left')
                                                        const isFirstRightPinnedColumn =
                                                            isPinned === 'right' && header?.column?.getIsFirstColumn?.('right')

                                                        let leftPositionValue = header?.column?.getStart?.('left') ?? 0
                                                        if(leftPositionValue > 0 ){
                                                            leftPositionValue = leftPositionValue + 22 // 22 is width of sort icon
                                                        }


                                                        return (
                                                            <th
                                                                key={header?.id}
                                                                scope="col"
                                                                colSpan={header?.colSpan}
                                                                className={`${enableSorting ? table_sort_header_style : table_header_style} ${index == 0 ? 'rounded-tl-md' : (headerGroup?.headers?.length - 1 == index) && 'rounded-tr-md'} text-center`}
                                                                onClick={enableSorting ? header?.column?.getToggleSortingHandler?.() : undefined}
                                                                style={{
                                                                    textAlign: align,
                                                                    backgroundColor: getStyle?.headerColor ? getStyle?.headerColor : meta?.headerColor ? meta?.headerColor : '#1473A1',
                                                                    justifyItems: (enableSorting || !['center', 'right', 'left', 'start', 'end'].includes(align)) ? undefined : align,
                                                                    boxShadow: isLastLeftPinnedColumn
                                                                    ? '-4px 0 4px -4px gray inset'
                                                                    : isFirstRightPinnedColumn
                                                                        ? '4px 0 4px -4px gray inset'
                                                                        : undefined,
                                                                    left: isPinned === 'left' ? `${leftPositionValue}px` : undefined,
                                                                    right: isPinned === 'right' ? `${(header?.column?.getAfter?.('right') ?? 0) + 22}px` : undefined, // 22 is width of sort icon
                                                                    // opacity: isPinned ? 0.95 : 1,
                                                                    position: isPinned ? 'sticky' : 'relative',
                                                                    // width: header?.column?.getSize?.() + 22, // 22 is width of sort icon
                                                                    zIndex: isPinned ? 9 : 8,
                                                                }}
                                                            >
                                                                <div style={{ width: width }}>
                                                                    {flexRender(
                                                                        header?.column?.columnDef?.header,
                                                                        header?.getContext()
                                                                    )}
                                                                    {enableSorting && (
                                                                        <div className={`absolute right-0 top-1/2 transform -translate-y-1/2 flex flex-col items-center -space-y-3`}>
                                                                            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: header?.column?.getIsSorted?.() === "asc" ? 1 : 0.4, }} />
                                                                            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: header?.column?.getIsSorted?.() === "desc" ? 1 : 0.4, }} />
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
                                                    {row?.getVisibleCells()?.map((cell: any, index: any) => {
                                                        const getStyle: any = columns?.find((item: any) => item?.accessorKey == cell?.column?.columnDef?.accessorKey);
                                                        const meta = cell?.column?.columnDef?.meta as any

                                                        const isPinned = cell?.column?.getIsPinned?.()

                                                        let leftPositionValue = cell?.column?.getStart?.('left') ?? 0
                                                        if(leftPositionValue > 0 ){
                                                            leftPositionValue = leftPositionValue + 22 // 22 is width of sort icon
                                                        }

                                                        return (
                                                            <td key={cell?.id} className="border px-4 py-2 text-[#464255] bg-white border-none h-[53px]"
                                                                style={{
                                                                    color: getStyle?.textColor ? getStyle?.textColor : meta?.textColor ? meta?.textColor : '#464255',
                                                                    textAlign: getStyle?.align ? getStyle?.align : meta?.align ? meta?.align : 'left',
                                                                    backgroundColor: getStyle?.cellColor ? getStyle?.cellColor : meta?.cellColor ? meta?.cellColor : '#fff',
                                                                    fontWeight: getStyle?.textStyle ? getStyle?.textStyle : meta?.textStyle ? meta?.textStyle : 'normal',
                                                                    left: isPinned === 'left' ? `${leftPositionValue}px` : undefined,
                                                                    right: isPinned === 'right' ? `${(cell?.column?.getAfter?.('right') ?? 0) + 22}px` : undefined, // 22 is width of sort icon
                                                                    position: isPinned ? 'sticky' : undefined,
                                                                    zIndex: isPinned ? 9 : undefined,
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

                {((typeof totalItems === 'number' ? (totalItems > 0) : (data?.length ?? 0)) > 0) &&
                    <div className="w-full relative">
                        {/* ส่วนแสดงผลการแบ่งหน้า */}
                        <div className="h-[50px] flex items-center justify-between whitespace-nowrap w-full">
                            <div className="flex items-center gap-3 text-sm" style={{ visibility: showPagesize == true ? 'visible' : 'hidden' }}>
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
                                // count={table.getPageCount()}
                                count={table.getPageCount()}
                                onChange={(_, page) => table.setPageIndex(page - 1)}
                                sx={{
                                    "& .Mui-selected": {
                                        backgroundColor: "#1473A1 !important",
                                        color: "#ffffff !important",
                                    },
                                }}
                            />
                        </div>
                    </div>
                }
            </div>
        </div>
    );
}