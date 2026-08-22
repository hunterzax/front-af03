import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    Dispatch,
    SetStateAction
} from "react";

import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    VisibilityState,
    TableOptions,
    SortingState,
    flexRender,
} from "@tanstack/react-table";

import { Tune } from "@mui/icons-material";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import SearchInput2 from "@/components/other/searchInput2";
import NodataTable from "@/components/other/nodataTable";
import Spinloading from "@/components/other/spinLoading";
import TableSkeleton from "@/components/material_custom/DefaultSkeleton";
import { Pagination } from "@mui/material";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import {
    table_header_style,
    table_sort_header_style
} from "@/utils/styles";
import { CustomTooltip } from "@/components/other/customToolTip";

type TableProps = {
    data?: any;
    columns: any[];

    isLoading?: any;
    isTableLoading?: any;

    exportBtn?: any;

    initialColumns?: any;
    onColumnVisibilityChange?: (visibility: VisibilityState) => void;

    onFilteredDataChange?: (filteredData: any[]) => void;
    onSortDataChange?: (filteredData: any[]) => void;

    pagination?: {
        pageIndex: number;
        pageSize: number;
    };
    setPagination?: Dispatch<SetStateAction<any>>;

    manualPagination?: boolean;
    totalItems?: number;
    pageCount?: number;

    sorting?: SortingState;
    setSorting?: Dispatch<SetStateAction<SortingState>>;

    // toolbar
    filter?: boolean;
    filterProps?: any;
    onQueryChange?: (query: string) => void;
    onQueryKeyDown?: (query: string) => void;
    onQueryBlur?: (query: string) => void;
    tuneOption?: boolean;
    showPagesize?: boolean;
    showPagination?: boolean;
    haveTooltip?: boolean
    tooltipMsg?: any,
    border?: boolean
    fixHeight?: boolean
    fullWidth?: boolean
    detailRows?: any
    expandedType?: "single" | "multi";
    onExpandRow?: (id: string) => void;
    detailMap?: Record<string, any[]>;
    loadingMap?: Record<string, boolean>;
};

const TableExpanded: React.FC<TableProps> = ({
    data,
    columns,
    isLoading,
    isTableLoading,
    exportBtn,

    initialColumns,
    onColumnVisibilityChange,

    onFilteredDataChange,
    onSortDataChange,

    pagination,
    setPagination,

    manualPagination = false,
    totalItems,
    pageCount,

    sorting,
    setSorting,

    filter = true,
    filterProps,
    onQueryChange,
    onQueryKeyDown,
    onQueryBlur,
    tuneOption = true,
    showPagesize = true,
    showPagination = true,
    haveTooltip,
    tooltipMsg,
    border,
    fixHeight,
    fullWidth,
    detailRows,
    expandedType = "single",
    onExpandRow,
    detailMap = {},
    loadingMap = {},
}) => {

    // ================= STATE =================
    const [globalFilter, setGlobalFilter] = useState("");
    const [columnVisibilityState, setColumnVisibilityState] = useState<VisibilityState>(initialColumns || {});
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    // expand
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const toggleExpand = useCallback((id: string) => {
        setExpandedRows(prev => {

            if (expandedType === "single") {
                if (prev.has(id)) return new Set();
                return new Set([id]);
            }

            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

        // 🔥 CALL API จาก parent
        // row?.id + '_' + row?.request_number
        onExpandRow?.(id);

    }, [expandedType, onExpandRow]);

    // ================= TABLE CONFIG =================
    const tableConfig: TableOptions<any> = {
        data: data ?? [],
        columns,
        state: {
            globalFilter,
            columnVisibility: columnVisibilityState,
            ...(manualPagination && sorting ? { sorting } : {}),
            ...(pagination ? { pagination } : {})
        },
        onGlobalFilterChange: setGlobalFilter,
        onColumnVisibilityChange: (updater) => {
            const newState = typeof updater === 'function'
                ? updater(columnVisibilityState)
                : updater;

            setColumnVisibilityState(newState);
            onColumnVisibilityChange?.(newState);
        },
        getCoreRowModel: getCoreRowModel(),
        ...(manualPagination ? {} : { getPaginationRowModel: getPaginationRowModel() }),
        ...(manualPagination ? {} : { getSortedRowModel: getSortedRowModel() }),
        getFilteredRowModel: getFilteredRowModel(),
        manualPagination,
        manualSorting: manualPagination,
    };

    if (pagination && setPagination) {
        tableConfig.onPaginationChange = setPagination;
    }

    if (manualPagination) {
        tableConfig.pageCount = pageCount ?? 1;

        if (sorting && setSorting) {
            tableConfig.onSortingChange = setSorting;
        }
    }

    const table = useReactTable(tableConfig);

    // ================= CALLBACK =================
    useEffect(() => {
        if (onFilteredDataChange) {
            const filtered = table.getFilteredRowModel().rows.map(r => r.original);
            onFilteredDataChange(filtered);
        }
    }, [globalFilter, columnVisibilityState, data]);

    useEffect(() => {
        if (onSortDataChange) {
            const sorted = table.getSortedRowModel().rows.map(r => r.original);
            onSortDataChange(sorted);
        }
    }, [sorting]);

    // ================= HANDLER =================
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


    // ================= RENDER =================
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

                    <div className="w-full overflow-auto relative h-full">
                        <Spinloading spin={isTableLoading} rounded={0} />

                        <Spinloading spin={isTableLoading} />

                        {isLoading ? (
                            <table className="w-full text-sm">

                                {/* HEADER */}
                                <thead className="bg-[#1473A1] text-white sticky top-0">
                                    {table.getHeaderGroups().map(hg => (
                                        <tr key={hg.id}>
                                            {hg.headers.map((header, index) => {

                                                const getStyle: any = columns?.find((item: any) => item?.accessorKey == (header?.column?.columnDef as any)?.accessorKey);
                                                const canSort = header.column.getCanSort()
                                                const enableSorting = canSort || header?.column?.columnDef?.enableSorting == true;
                                                const size = header.getSize() == 150 ? undefined : header.getSize() // 150 is default size of column
                                                const meta = header.column.columnDef.meta as any
                                                const width = getStyle?.width ? getStyle?.width : size ? size : meta?.width ? meta?.width : '100%'
                                                const align = getStyle?.align ? getStyle?.align : meta?.align ? meta?.align : 'left'

                                                return (
                                                    <th
                                                        key={header?.id}
                                                        scope="col"
                                                        colSpan={header.colSpan}
                                                        className={`${enableSorting ? table_sort_header_style : table_header_style} ${index == 0 ? 'rounded-tl-md' : (hg?.headers?.length - 1 == index) && 'rounded-tr-md'} text-center relative z-50`}
                                                        onClick={enableSorting ? header.column.getToggleSortingHandler() : undefined}
                                                        style={{
                                                            textAlign: align,
                                                            backgroundColor: getStyle?.headerColor ? getStyle?.headerColor : meta?.headerColor ? meta?.headerColor : '#1473A1',
                                                            justifyItems: (enableSorting || !['center', 'right', 'left', 'start', 'end'].includes(align)) ? undefined : align
                                                        }}
                                                    >
                                                        {flexRender(header.column.columnDef.header, header.getContext())}

                                                        {enableSorting && <div className={`absolute right-0 top-1/2 transform -translate-y-1/2 flex flex-col items-center -space-y-3`}>
                                                            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: header.column.getIsSorted() === "asc" ? 1 : 0.4, }} />
                                                            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: header.column.getIsSorted() === "desc" ? 1 : 0.4, }} />
                                                        </div>
                                                        }
                                                    </th>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </thead>

                                {/* BODY (ของมึง + expand) */}
                                <tbody>
                                    {table.getRowModel().rows.map((row: any) => {
                                        const dataRow = row.original;
                                        // const id = dataRow?.id ?? row.id;
                                        const id = dataRow?.id + '_' + dataRow?.request_number;
                                        const isExpanded = expandedRows.has(id);

                                        return (
                                            <React.Fragment key={id}>

                                                <tr
                                                    className="border-b cursor-pointer !bg-[#E8FFEE]"
                                                    onClick={() => toggleExpand(id)}
                                                >
                                                    {row.getVisibleCells().map((cell: any, index: number) => {
                                                        const isFirst = index === 0;

                                                        return (
                                                            <td key={cell?.id} className="px-3 py-2">

                                                                <div className="flex gap-2 items-center">

                                                                    {isFirst && (
                                                                        <span onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            toggleExpand(id);
                                                                        }}>
                                                                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                                        </span>
                                                                    )}

                                                                    {flexRender(cell?.column?.columnDef?.cell, cell.getContext())}

                                                                </div>

                                                            </td>
                                                        );
                                                    })}
                                                </tr>

                                                {isExpanded && (
                                                    loadingMap[id] ? (

                                                        // ===== LOADING =====
                                                        <tr>
                                                            <td
                                                                colSpan={row.getVisibleCells().length}
                                                                className="px-3 py-4 bg-gray-50"
                                                            >
                                                                <div className="flex items-center justify-center">
                                                                    Loading...
                                                                </div>
                                                            </td>
                                                        </tr>

                                                    ) : (

                                                        // ===== DATA =====
                                                        detailMap[id]?.length > 0 ? detailMap[id]?.map((detailRow: any, i: number) => (
                                                            <tr key={i} className="bg-gray-50 border-b">

                                                                {row.getVisibleCells().map((cell: any, index: number) => {
                                                                    const column = cell.column;
                                                                    const accessorKey = column.columnDef.accessorKey;

                                                                    return (
                                                                        <td key={column?.id} className="px-3 py-2">

                                                                            <div className="flex gap-2 items-center">

                                                                                {/* icon placeholder */}
                                                                                {index === 0 && (
                                                                                    <span className="w-[25px]" />
                                                                                )}

                                                                                {/* render detail row */}
                                                                                {column?.id !== 'publication' && column.columnDef.cell
                                                                                    ? flexRender(
                                                                                        column.columnDef.cell,
                                                                                        {
                                                                                            row: {
                                                                                                original: detailRow
                                                                                            },
                                                                                            getValue: () =>
                                                                                                detailRow[accessorKey as string]
                                                                                        }
                                                                                    )
                                                                                    : column?.id !== 'publication' ? detailRow[accessorKey as string] : null
                                                                                }

                                                                            </div>

                                                                        </td>
                                                                    );
                                                                })}

                                                            </tr>
                                                        ))
                                                            :
                                                            <tr>
                                                                <td
                                                                    colSpan={row.getVisibleCells().length}
                                                                    className="px-3 py-4 bg-gray-50"
                                                                >
                                                                    <div className="flex items-center justify-center">
                                                                        No data.
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                    )
                                                )}

                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>

                            </table>
                        ) : (
                            <TableSkeleton />
                        )}

                        {isLoading && data?.length === 0 && <NodataTable />}
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
    )
};

export default TableExpanded;