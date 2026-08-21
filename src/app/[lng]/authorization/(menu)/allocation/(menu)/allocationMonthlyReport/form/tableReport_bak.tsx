import { useCallback, useEffect, useMemo } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatNumberFourDecimal, getContrastTextColor, toDayjs } from '@/utils/generalFormatter';
import { table_col_arrow_sort_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { handleSort, handleSortAllocMonthlyReport } from "@/utils/sortTable";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NodataTable from "@/components/other/nodataTable";

interface TableProps {
    openViewForm: (id: any) => void;
    tableData: any;
    isLoading: any;
    columnVisibility: any;
    userPermission?: any;
    areaMaster?: any;
}

const TableReport: React.FC<TableProps> = ({ openViewForm, tableData, isLoading, columnVisibility, userPermission, areaMaster }) => {
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);

    useEffect(() => {
        if (tableData && tableData.length > 0) {
            setSortedData(tableData);
        } else {
            setSortedData([]);
        }
    }, [tableData]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    // const getSumByDate = (areaData: any[], dateKey: string) => {
    //     const sum = areaData
    //         ?.flatMap((point: any) => point.data)
    //         ?.filter((d: any) => toDayjs(d?.date, "YYYY-MM-DD").format("DD/MM/YYYY") === dateKey)
    //         ?.reduce((total: number, d: any) => total + (d?.value || 0), 0);

    //     return sum;
    // };

    // EXPAND OLD
    // const [expandedArea, setExpandedArea] = useState<string | null>(null);
    // const toggleExpand = (area: string) => {
    //     setExpandedArea(prev => (prev === area ? null : area));
    // };

    // EXPAND NEW
    // const [expandedAreas, setExpandedAreas] = useState<string[]>([]);

    // const toggleExpand = (area: string) =>
    //     setExpandedAreas(prev =>
    //         prev.includes(area)
    //             ? prev.filter(a => a !== area)
    //             : [...prev, area]
    //     );


    // REFACTOR ให้ตอน expand เร็วขึ้นหน่อยนึง
    const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());   // ใช้ Set แทน Array (เร็วกว่า includes)

    const toggleExpand = (area: string) => {
        setExpandedAreas(prev => {
            const next = new Set(prev);
            next.has(area) ? next.delete(area) : next.add(area);
            return next;
        });
    };
    const visibleDateKeys = useMemo(() => {
        return Object.entries(columnVisibility)
            .filter(([key, visible]) =>
                visible && !['point', 'type', 'area'].includes(key)
            )
            .map(([key]) => key);
    }, [columnVisibility]);

    const sumMap = useMemo(() => {
        const map = new Map<string, number>();

        sortedData?.[0]?.data?.forEach((areaGroup: any) => {
            areaGroup.data.forEach((point: any) => {
                point.data.forEach((d: any) => {
                    const dateKey = toDayjs(d.date, "YYYY-MM-DD").format("DD/MM/YYYY");
                    const key = `${areaGroup.area}|${dateKey}`;
                    map.set(key, (map.get(key) ?? 0) + (d.value ?? 0));
                });
            });
        });

        return map;
    }, [sortedData]);

    return (<>
        <div className="h-[calc(100vh-380px)] overflow-y-auto overflow-x-auto rounded-t-md">
            {
                isLoading ?
                    <table className="table-auto min-w-full text-sm rtl:text-right text-gray-500 whitespace-nowrap">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-9">

                                <th scope="col" className="px-2 py-1 text-left cursor-pointer">
                                    {``}
                                </th>

                                {columnVisibility.point && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[200px] text-center`}
                                        onClick={() => handleSort("data.point", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Point`}
                                        {getArrowIcon("data.point")}
                                    </th>
                                )}

                                {columnVisibility.type && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[200px] text-center`}
                                        onClick={() => handleSort("data.type", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Type`}
                                        {getArrowIcon("data.type")}
                                    </th>
                                )}

                                {columnVisibility.area && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[200px] text-center`}
                                        onClick={() => handleSort("data.area", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Area`}
                                        {getArrowIcon("data.area")}
                                    </th>
                                )}

                                {Object.entries(columnVisibility).map(([key, visible]) => {
                                    if (!visible || ['point', 'type', 'area'].includes(key)) return null;
                                    const key_format = toDayjs(key, 'DD/MM/YYYY').format("YYYY-MM-DD")
                                    return (
                                        <th
                                            key={key}
                                            scope="col"
                                            className={`${table_sort_header_style} text-right min-w-[120px] max-w-[200px]`}
                                            onClick={() => handleSortAllocMonthlyReport(
                                                key_format, sortState, setSortState, setSortedData, tableData
                                            )}
                                        >
                                            {key}
                                            {getArrowIcon(key_format)}
                                        </th>
                                    );
                                })}

                            </tr>
                        </thead>

                        <tbody>
                            {/* {sortedData && sortedData[0]?.data?.map((areaGroup: any) => {
                                // const isExpanded = expandedArea === areaGroup.area; // expand old
                                const isExpanded = expandedAreas.includes(areaGroup.area); // expand new

                                return (
                                    <React.Fragment key={areaGroup.area}>
                                        MAIN
                                        <tr
                                            key={areaGroup.area + '_main'}
                                            className={`${table_row_style} !bg-[#E8FFEE] cursor-pointer`}
                                            onClick={() => toggleExpand(areaGroup.area)}
                                        >
                                            <td className="px-2 py-1 text-[#06522E] font-bold">{isExpanded ? <ExpandLessIcon sx={{ fontSize: '25px', color: '#06522E' }} /> : <ExpandMoreIcon sx={{ fontSize: '25px', color: '#06522E' }} />} {`Total`} </td>
                                            {columnVisibility?.point && <td className="px-2 py-1 text-[#06522E]" />}
                                            {columnVisibility?.type && <td className="px-2 py-1 text-[#06522E]" />}

                                            {columnVisibility?.area && (
                                                <td className="px-10 py-1 text-[#06522E]">
                                                    {(() => {
                                                        const filter_area = areaMaster?.data?.find((item: any) => item.name === areaGroup?.area);

                                                        return filter_area?.entry_exit_id == 2 ? (
                                                            <div
                                                                className="flex justify-center items-center rounded-full p-1 text-[#464255]"
                                                                style={{ backgroundColor: filter_area?.color, width: '35px', height: '35px', color: getContrastTextColor(filter_area?.color) }}
                                                            >
                                                                {`${filter_area?.name}`}
                                                            </div>
                                                        ) : filter_area?.entry_exit_id == 1 ? (
                                                            <div
                                                                className="flex justify-center items-center rounded-lg p-1 text-[#464255]"
                                                                style={{ backgroundColor: filter_area?.color, width: '35px', height: '35px', color: getContrastTextColor(filter_area?.color) }}
                                                            >
                                                                {`${filter_area?.name}`}
                                                            </div>
                                                        )
                                                            : null;
                                                    })()}
                                                </td>
                                            )}

                                            {Object.entries(columnVisibility).map(([dateKey, visible]) => {
                                                if (!visible || ['point', 'type', 'area'].includes(dateKey)) return null;
                                                return (
                                                    <td key={dateKey} className="px-2 py-1 text-[#06522E] font-bold text-right min-w-[120px] max-w-[200px]">
                                                        {formatNumberFourDecimal(getSumByDate(areaGroup.data, dateKey))}
                                                    </td>
                                                );
                                            })}
                                        </tr>


                                        EXPAND
                                        {isExpanded &&
                                            areaGroup.data.map((point: any, i: any) => {
                                                const areaDetail = areaMaster?.data?.find((item: any) => item.name === areaGroup?.area);
                                                return (
                                                    <tr key={`${areaGroup.area}_${point.point}_${i}`} className={`${table_row_style} bg-white`}>

                                                        <td className="px-2 py-1 text-[#464255]"></td>

                                                        {columnVisibility?.point && (
                                                            <td className="px-2 py-1 text-[#464255] text-center">{point.point}</td>
                                                        )}

                                                        {columnVisibility?.type && (
                                                            <td className="px-2 py-1 text-[#464255] text-center">{point.customer_type}</td>
                                                        )}

                                                        {columnVisibility?.area &&
                                                            (i === 0 ? (
                                                                <td
                                                                    className="px-10 py-1 text-[#464255] text-center align-middle border-l-[1px] border-r-[1px]"
                                                                    rowSpan={areaGroup.data.length}
                                                                >
                                                                    {(() => {
                                                                        return areaDetail?.entry_exit_id == 2 ? (
                                                                            <div
                                                                                className="flex justify-center items-center rounded-full p-1 text-[#464255]"
                                                                                style={{ backgroundColor: areaDetail?.color, width: '35px', height: '35px', color: getContrastTextColor(areaDetail?.color) }}
                                                                            >
                                                                                {`${areaDetail?.name}`}
                                                                            </div>
                                                                        ) : areaDetail?.entry_exit_id == 1 ? (
                                                                            <div
                                                                                className="flex justify-center items-center rounded-lg p-1 text-[#464255]"
                                                                                style={{ backgroundColor: areaDetail?.color, width: '35px', height: '35px', color: getContrastTextColor(areaDetail?.color) }}
                                                                            >
                                                                                {`${areaDetail?.name}`}
                                                                            </div>
                                                                        )
                                                                            : null;
                                                                    })()}
                                                                </td>
                                                            ) : null)}

                                                        {Object.entries(columnVisibility).map(([dateKey, visible]) => {
                                                            if (!visible || ['point', 'type', 'area'].includes(dateKey)) return null;
                                                            const data = point?.data?.find(
                                                                (d: any) => toDayjs(d.date, "YYYY-MM-DD").format("DD/MM/YYYY") === dateKey
                                                            );
                                                            return (
                                                                <td key={dateKey} className="px-2 py-1 text-right text-[#464255] min-w-[120px] max-w-[200px]">
                                                                    {data?.value !== null && data?.value !== undefined ? formatNumberFourDecimal(data.value) : ''}
                                                                </td>
                                                            );
                                                        })}

                                                    </tr>
                                                )
                                            })}
                                    </React.Fragment>
                                );
                            })} */}




                            {/* --------------- REFACTOR ตอน expand ให้เร็วขึ้น --------------- */}
                            {sortedData?.[0]?.data?.map((areaGroup: any) => {
                                const isExpanded = expandedAreas.has(areaGroup.area);

                                return (
                                    <React.Fragment key={areaGroup.area}>
                                        {/* ===== MAIN ROW ===== */}
                                        <tr
                                            className={`${table_row_style} !bg-[#E8FFEE] cursor-pointer`}
                                            onClick={() => toggleExpand(areaGroup.area)}
                                        >
                                            <td className="px-2 py-1 text-[#06522E] font-bold">
                                                {isExpanded ? <ExpandLessIcon sx={{ fontSize: '25px', color: '#06522E' }} /> : <ExpandMoreIcon sx={{ fontSize: '25px', color: '#06522E' }} />} Total
                                            </td>

                                            {columnVisibility.point && <td className="px-2 py-1 text-[#06522E]" />}
                                            {columnVisibility.type && <td className="px-2 py-1 text-[#06522E]" />}

                                            {columnVisibility?.area && (
                                                <td className="px-10 py-1 text-[#06522E]">
                                                    {(() => {
                                                        const filter_area = areaMaster?.data?.find((item: any) => item.name === areaGroup?.area);

                                                        return filter_area?.entry_exit_id == 2 ? (
                                                            <div
                                                                className="flex justify-center items-center rounded-full p-1 text-[#464255]"
                                                                style={{ backgroundColor: filter_area?.color, width: '35px', height: '35px', color: getContrastTextColor(filter_area?.color) }}
                                                            >
                                                                {`${filter_area?.name}`}
                                                            </div>
                                                        ) : filter_area?.entry_exit_id == 1 ? (
                                                            <div
                                                                className="flex justify-center items-center rounded-lg p-1 text-[#464255]"
                                                                style={{ backgroundColor: filter_area?.color, width: '35px', height: '35px', color: getContrastTextColor(filter_area?.color) }}
                                                            >
                                                                {`${filter_area?.name}`}
                                                            </div>
                                                        )
                                                            : null;
                                                    })()}
                                                </td>
                                            )}

                                            {visibleDateKeys.map(dateKey => {
                                                const sum = sumMap.get(`${areaGroup.area}|${dateKey}`) ?? 0;

                                                return (
                                                    <td key={dateKey} className="px-2 py-1 text-[#06522E] font-bold text-right min-w-[120px] max-w-[200px]">
                                                        {formatNumberFourDecimal(sum)}
                                                    </td>
                                                );
                                            })}
                                        </tr>

                                        {/* main row เขียว ต้องรวม area ไว้ก่อน */}
                                        {/* Row ฟ้า ชื่อ Shipper */}


                                        {/* Row เหลือง contract */}

                                        {/* ===== EXPANDED ROWS ===== */}
                                        {isExpanded &&
                                            areaGroup.data.map((point: any, i: number) => (
                                                <tr key={`${areaGroup.area}_${point.point}_${i}`} className={`${table_row_style} bg-white`}>
                                                    <td className="px-2 py-1 text-[#464255]" />

                                                    {columnVisibility.point && (
                                                        <td className="px-2 py-1 text-[#464255] text-center">{point.point}</td>
                                                    )}

                                                    {columnVisibility.type && (
                                                        <td className="px-2 py-1 text-[#464255] text-center">
                                                            {point.customer_type}
                                                        </td>
                                                    )}

                                                    {columnVisibility.area && i === 0 && (
                                                        <td
                                                            rowSpan={areaGroup.data.length}
                                                            className="px-10 py-1 text-[#464255] text-center align-middle border-l-[1px] border-r-[1px]"
                                                        >
                                                            {(() => {

                                                                const filter_area = areaMaster?.data?.find((item: any) => item.name === areaGroup?.area);

                                                                return filter_area?.entry_exit_id == 2 ? (
                                                                    <div
                                                                        className="flex justify-center items-center rounded-full p-1 text-[#464255]"
                                                                        style={{ backgroundColor: filter_area?.color, width: '35px', height: '35px', color: getContrastTextColor(filter_area?.color) }}
                                                                    >
                                                                        {`${filter_area?.name}`}
                                                                    </div>
                                                                ) : filter_area?.entry_exit_id == 1 ? (
                                                                    <div
                                                                        className="flex justify-center items-center rounded-lg p-1 text-[#464255]"
                                                                        style={{ backgroundColor: filter_area?.color, width: '35px', height: '35px', color: getContrastTextColor(filter_area?.color) }}
                                                                    >
                                                                        {`${filter_area?.name}`}
                                                                    </div>
                                                                )
                                                                    : null;
                                                            })()}
                                                        </td>
                                                    )}

                                                    {visibleDateKeys.map(dateKey => {
                                                        const data = point?.data?.find(
                                                            (d: any) =>
                                                                toDayjs(d.date, "YYYY-MM-DD")
                                                                    .format("DD/MM/YYYY") === dateKey
                                                        );

                                                        return (
                                                            <td key={dateKey} className="px-2 py-1 text-right text-[#464255] min-w-[120px] max-w-[200px]">
                                                                {data?.value != null ? formatNumberFourDecimal(data.value) : ""}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                    :
                    <TableSkeleton />
            }

            {
                isLoading && sortedData?.length == 0 && <NodataTable textRender={'Please select filter to view the information.'} />
            }
        </div>
    </>
    )
}

export default TableReport;