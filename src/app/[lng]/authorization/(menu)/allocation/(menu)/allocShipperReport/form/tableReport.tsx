import { useEffect } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatDateNoTime, formatNumberFourDecimal, formatNumberThreeDecimalNom, formatNumberTwoDecimalNom } from '@/utils/generalFormatter';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { handleSortAllocShipperReport, handleSortAllocShipperReport2 } from "@/utils/sortTable";
import NodataTable from "@/components/other/nodataTable";

interface TableProps {
    tableData: any;
    isLoading: any;
    columnVisibility: any;
    userPermission?: any;
    areaMaster?: any;
    initialColumns?: any;
}

const TableReport: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility, initialColumns }) => {

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);
    const [headerMap, setHeaderMap] = useState<any>([]);
    const [hideTable, setHideTable] = useState<any>(false);

    const getVisibleChildCount = (parentKey: string) => initialColumns?.filter((col: any) => col.parent_id === parentKey && columnVisibility[col.key]).length || 1;

    useEffect(() => {
        if (tableData && tableData.length > 0) {
            setSortedData(tableData);
        } else {
            setSortedData([]);
        }
    }, [tableData]);

    useEffect(() => {

        if (tableData && tableData.length > 0) {
            let headerStructure: any = extractUniqueShippersAsArray(tableData)?.sort((a, b) => {
                // ตรวจสอบว่าทั้ง a?.point และ b?.point เป็น string
                const pointA = a?.point || ""; // ใช้ค่าเริ่มต้นเป็น "" ถ้าไม่มี point
                const pointB = b?.point || ""; // ใช้ค่าเริ่มต้นเป็น "" ถ้าไม่มี point

                // การเปรียบเทียบเพื่อจัดเรียง
                if (pointA < pointB) {
                    return -1;  // a มาก่อน b
                }
                if (pointA > pointB) {
                    return 1;   // b มาก่อน a
                }
                return 0;       // ถ้าเท่ากัน
            });

            setHeaderMap(headerStructure);
        }
    }, [tableData]);

    function extractUniqueShippersAsArray(tableData: any) {
        const tempResult: any = {};

        tableData.forEach((entry: any) => {
            entry.nomPoint.forEach((nom: any) => {
                const point = nom?.point;
                const nomdata = nom?.data;
                nomdata?.map((item: any) => {
                    let shipperName = item?.shipper_name;

                    if (point && shipperName) {
                        if (!tempResult[point]) {
                            tempResult[point] = new Set();
                        }
                        tempResult[point].add(shipperName);
                    }
                });
            });
        });

        // แปลงจาก object เป็น array ตามรูปแบบที่ต้องการ
        const finalResult = Object.entries(tempResult).map(([point, shippersSet]: any) => ({
            point,
            shippers: Array.from(shippersSet)
        }));

        return finalResult;
    }

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    useEffect(() => {
        const shouldHideTable = !Object.values(columnVisibility).some(Boolean);
        setHideTable(shouldHideTable);
    }, [columnVisibility])

    return (<>
        <div className="h-[calc(100vh-380px)] w-full overflow-y-auto overflow-x-auto rounded-t-md">
            {
                isLoading ?
                    <table className="table-auto min-w-full text-sm rtl:text-right text-gray-500 whitespace-nowrap">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-9">

                                {columnVisibility.gas_day && (
                                    <th
                                        scope="col"
                                        rowSpan={2}
                                        className={`${table_sort_header_style} bg-[#1473A1] sticky left-0 z-50 !min-w-[50px] !w-[150px] !max-w-[170px]`}
                                        onClick={() => handleSortAllocShipperReport("current_time", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Gas Day`}
                                        {getArrowIcon("current_time")}
                                    </th>
                                )}

                                {headerMap?.map((p: any) => (
                                    columnVisibility[p?.point] && (
                                        <th
                                            key={p.point}
                                            scope="col"
                                            colSpan={getVisibleChildCount(p?.point)}
                                            className={`${table_header_style} border-r-[1px] border-[#195774] text-center `} // v2.0.40 ปรับหัว column ให้มีกรอบแบ่งข้อมูล nom point ชัดเจน https://app.clickup.com/t/86etnehpp
                                        >
                                            {p?.point}
                                        </th>
                                    )

                                ))}
                            </tr>

                            <tr className="h-9">
                                {headerMap?.map((p: any) =>
                                    [...p.shippers?.sort((a: any, b: any) => {
                                        const pointA = a || "";
                                        const pointB = b || "";

                                        if (pointA < pointB) {
                                            return -1;
                                        }
                                        if (pointA > pointB) {
                                            return 1;
                                        }
                                        return 0;
                                    }), "Total", "Metering"]?.map((name) => {
                                        const sortKey =
                                            name === "Total"
                                                ? `${p.point}-total`
                                                : name === "Metering"
                                                    ? `${p.point}-meter`
                                                    : `${p.point}-${name}`;

                                        if (!columnVisibility[sortKey]) return null;

                                        return (
                                            <th
                                                key={sortKey}
                                                className={`${table_sort_header_style} ${name === "Total" || name === "Metering"
                                                    ? "bg-[#E3E9F0] text-[#58585A] hover:text-white ease-in-out duration-200"
                                                    : "bg-[#00ADEF] ease-in-out duration-200"
                                                    } px-4 py-2 min-w-[120px] !w-[200px] !max-w-[300px] text-right `}
                                                onClick={() =>
                                                    handleSortAllocShipperReport2(
                                                        sortKey,
                                                        sortState,
                                                        setSortState,
                                                        setSortedData,
                                                        tableData
                                                    )
                                                }
                                                scope="col"
                                            // colSpan={getVisibleChildCount(p?.point, 'sub')}
                                            // colSpan={1.5}
                                            >
                                                {name}
                                                {getArrowIcon(sortKey)}
                                            </th>
                                        );
                                    })
                                )}
                            </tr>

                        </thead>

                        <tbody>
                            {sortedData?.length > 0 && sortedData?.map((day: any) => (
                                <tr
                                    key={day.gas_day}
                                    className={`${table_row_style} text-[#464255] z-0 `}
                                >
                                    {columnVisibility.gas_day && (
                                        <td className="px-4 py-2 bg-white sticky left-0 z-0">
                                            {day.gas_day ? formatDateNoTime(day.gas_day) : ''}
                                        </td>
                                    )}

                                    {headerMap?.map((hp: any) => {
                                        const pointData = day.nomPoint.find((p: any) => p.point === hp.point);

                                        if (pointData == undefined && pointData == null) {
                                            return (
                                                <>
                                                    {hp.shippers.map((name: any) => {
                                                        return (
                                                            <td
                                                                key={`${day.gas_day}-${hp.point}-${name}`}
                                                                className="px-4 py-2 text-right"
                                                            />
                                                        )
                                                    })}
                                                    <td
                                                        key={`${day.gas_day}-${hp.point}-total`}
                                                        className="px-4 py-2 text-right font-semibold"
                                                    />
                                                    <td
                                                        key={`${day.gas_day}-${hp.point}-meter`}
                                                        className="px-4 py-2 text-right "
                                                    />
                                                </>
                                            )
                                        }

                                        const shipperCells = hp.shippers.map((name: any) => {
                                            const key = `${hp.point}-${name}`;
                                            if (!columnVisibility[key]) return null;

                                            const shipper = pointData?.data.find((d: any) => d.shipper_name === name);
                                            return (
                                                <td
                                                    key={`${day.gas_day}-${hp.point}-${name}`}
                                                    className="px-4 py-2 text-right"
                                                >
                                                    {shipper && shipper?.allocatedValue !== null && shipper?.allocatedValue !== undefined ? formatNumberFourDecimal(shipper.allocatedValue) : ''}
                                                </td>
                                            );
                                        });

                                        const totalKey = `${hp.point}-total`;
                                        const meterKey = `${hp.point}-meter`;

                                        const total = (pointData?.total !== undefined && pointData?.total !== null) ? formatNumberFourDecimal(pointData?.total) : pointData?.total == 0 ? '' : null;
                                        // const meter = (pointData?.meterValue !== undefined && pointData?.meterValue !== null) ? pointData?.meterValue?.toFixed(2) : pointData?.meterValue == 0 ? '0.0000' : null;
                                        // const meter = (pointData?.meterValue !== undefined && pointData?.meterValue !== null) ? formatNumberTwoDecimalNom(pointData?.meterValue) : pointData?.meterValue == 0 ? '' : null;
                                        const meter = (pointData?.meterValue !== undefined && pointData?.meterValue !== null) ? formatNumberThreeDecimalNom(pointData?.meterValue) : pointData?.meterValue == 0 ? '' : null;

                                        return (
                                            <>
                                                {shipperCells}

                                                {columnVisibility[totalKey] && (
                                                    <td
                                                        key={`${day.gas_day}-${hp.point}-total`}
                                                        className="px-4 py-2 text-right font-semibold"
                                                    >
                                                        {/* {typeof total === 'number' ? formatNumberFourDecimal(total) : '0.0000'} */}
                                                        {total}
                                                    </td>
                                                )}

                                                {columnVisibility[meterKey] && (
                                                    <td
                                                        key={`${day.gas_day}-${hp.point}-meter`}
                                                        className="px-4 py-2 text-right "
                                                    >
                                                        {/* {typeof meter === 'number' ? meter.toFixed(2) : '0.0000'} */}
                                                        {meter}
                                                    </td>
                                                )}
                                            </>
                                        );
                                    })}

                                </tr>
                            ))}
                        </tbody>

                    </table>
                    :
                    <TableSkeleton />
            }


            {
                (isLoading && tableData?.length == 0) || hideTable && <NodataTable />
            }
        </div>
    </>
    )
}

export default TableReport;