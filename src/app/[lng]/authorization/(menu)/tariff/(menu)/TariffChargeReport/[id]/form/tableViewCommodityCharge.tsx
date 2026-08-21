import { useEffect } from "react";
import React, { useState } from 'react';
import { fillMonthDays, findRightByMenuName, formatNumber } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import BtnDetailGeneral from "@/components/other/btnDetailsGeneral";
import { useRouter } from "next/navigation";
import getUserValue from "@/utils/getuserValue";
import dayjs from "dayjs";

interface TableProps {
    tableData: any;
    headData: any;
    isLoading?: any;
    columnVisibility?: any;
}

const TableViewCommodityCharge: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility, headData }) => {
    const router = useRouter();
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState<any>([]);
    const [tariffType, setTariffType] = useState<any>('');
    const [tableDataOriginal, setTableDataOriginal] = useState<any>([]);
    const [tableDataTotal, setTableDataTotal] = useState<any>({});
    const [canView, setCanView] = useState<any>(false);
    const userDT: any = getUserValue();

    useEffect(() => {
        if (tableData && tableData.length > 0) {

            {/* Tariff Detail > Type Capacity Charge ตรง Column Detail ถ้าไม่มีสิทธิ์เห็นเมนู Capacity Contract Management ก็ให้ Hide Column Detail ไปเลย https://app.clickup.com/t/86euq74fb */ }
            const res_find = findRightByMenuName("Allocation Report", userDT)
            setCanView(res_find)

            // tariff_type_ab_id == 1 A
            // tariff_type_ab_id == 2 B
            if (tableData?.[0]?.tariff?.tariff_type_ab_id == 1 || tableData?.[0]?.tariff_charge?.tariff?.tariff_type_ab_id == 1) { // TYPE A
                setTariffType('A')
                // ทำข้อมูล TOTAL ท้ายตาราง
                if (tableData?.[0]?.data?.day) {
                    const totals = { calc: 0, calcNotRound: 0 }
                    const dataGroupByPoint: any[] = []
                    tableData[0]?.data?.day?.map((day: any) => {
                        day?.value?.map((value: any) => {
                            const dataIndex = dataGroupByPoint.findIndex((item: any) => item.point === value.point)
                            if (dataIndex >= 0) {
                                if (dataGroupByPoint[dataIndex].calc) {
                                    dataGroupByPoint[dataIndex].calc += value.calc || 0;
                                }
                                else {
                                    dataGroupByPoint[dataIndex].calc = value.calc;
                                }

                                if (dataGroupByPoint[dataIndex].calcNotRound) {
                                    dataGroupByPoint[dataIndex].calcNotRound += value.calcNotRound || 0;
                                }
                                else {
                                    dataGroupByPoint[dataIndex].calcNotRound = value.calcNotRound;
                                }
                            }
                            else {
                                dataGroupByPoint.push(
                                    {
                                        point: value.point,
                                        calc: value.calc,
                                        calcNotRound: value.calcNotRound
                                    }
                                )
                            }
                            totals.calc += value.calc || 0;
                            totals.calcNotRound += value.calcNotRound || 0;
                        })
                    })
                    setTableDataTotal(totals)
                    setSortedData(dataGroupByPoint);
                    setTableDataOriginal(dataGroupByPoint);
                } else {
                    const totals = tableData?.[0]?.data?.value?.reduce(
                        (acc: any, cur: any) => {
                            acc.calc += cur.calc || 0;
                            acc.calcNotRound += cur.calcNotRound || 0;
                            return acc;
                        },
                        { calc: 0, calcNotRound: 0 }
                    );

                    setTableDataTotal(totals)
                    setSortedData(tableData?.[0]?.data?.value);
                    setTableDataOriginal(tableData?.[0]?.data?.value);
                }
            } else {
                setTariffType('B')

                // เติมวันที่ให้เต็มเดือน
                const filledMonth = fillMonthDays(tableData?.[0]?.data?.day);

                // setSortedData(tableData?.[0]?.data?.day);
                // setTableDataOriginal(tableData?.[0]?.data?.day);
                setSortedData(filledMonth);
                setTableDataOriginal(filledMonth);

                const totals = { calc: 0, calcNotRound: 0 }
                // tableData[0]?.data?.day?.map((day: any) => {
                filledMonth?.map((day: any) => {
                    totals.calc += day.totalRoundRound || 0;
                    totals.calcNotRound += day.totalNotRound || 0;
                })

                setTableDataTotal(totals)
            }

            // setSortedData(tableDataNew);
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

    const routeToSomewhere = () => {
        // route to Allocation Report...
        // เมื่อกดปุ่ม Detail ระบบจะแสดงหน้าจอของเมนู Allocation Report Auto Filter Gas From - Gas To ให้เต็มเดือน

        const from = dayjs(headData?.month_year_charge).startOf("month").format("YYYY-MM-DD")
        const to = dayjs(headData?.month_year_charge).endOf("month").format("YYYY-MM-DD")

        // router.push(`/en/authorization/allocation/alloReport?from=${from}&to=${to}`);
        router.push(`/en/authorization/allocation/alloReport?from=${from}&to=${to}&shipper=${headData?.shipper?.id}&contract_code=${tableData[0]?.data?.contract}`); // Type A และ Type B ปุ่ม Detail ตอนลิ้งไปที่เมนู Allo Report ให้เพิ่ม Default Filter Shipper Name และ Contract Code ให้ด้วย https://app.clickup.com/t/86euzxxu7
    }

    return (
        // <div className={`h-[calc(100vh-260px)] overflow-y-auto block  rounded-t-md relative z-1`}>
        <div className={`h-[90%] overflow-y-auto block rounded-t-md relative z-1`}>

            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                    <tr className="h-9">

                        {
                            tariffType == 'A' && <>
                                <th scope="col" className={`${table_sort_header_style} w-[150px]`} onClick={() => handleSort("point", sortState, setSortState, setSortedData, tableDataOriginal)}>
                                    {`Nomination Point`}
                                    {getArrowIcon("point")}
                                </th>

                                <th scope="col" className={`${table_sort_header_style} text-right`} onClick={() => handleSort("calc", sortState, setSortState, setSortedData, tableDataOriginal)}>
                                    {`Allocate Exit Quantity (MMBTU)`}
                                    {getArrowIcon("calc")}
                                </th>
                            </>
                        }

                        {
                            tariffType == 'B' && <>
                                <th scope="col" className={`${table_sort_header_style} w-[150px]`} onClick={() => handleSort("gas_day", sortState, setSortState, setSortedData, tableDataOriginal)}>
                                    {`Gas Day`}
                                    {getArrowIcon("gas_day")}
                                </th>

                                <th scope="col" className={`${table_sort_header_style} text-right`} onClick={() => handleSort("totalRoundRound", sortState, setSortState, setSortedData, tableDataOriginal)}>
                                    {`Daily Allocated Exit Value (MMBTU)`}
                                    {getArrowIcon("totalRoundRound")}
                                </th>
                            </>
                        }

                        {
                            canView &&
                            <th scope="col" className={`${table_header_style} !w-[180px] text-center`} >
                                {`Detail`}
                            </th>
                        }

                    </tr>
                </thead>

                <tbody>
                    {sortedData && sortedData?.map((row: any, index: number) => (
                        <tr
                            key={index}
                            className={`${table_row_style} ${row.isSummary ? "bg-gray-200 font-bold" : ""}`}
                        >

                            {
                                tariffType == 'A' && <>
                                    <td className={`px-2 py-1 justify-center text-[#464255] w-[150px] ${row.isGrandTotal && "bg-[#FFFEE0] font-semibold"}`}>
                                        {row.point ? row.point : ''}
                                    </td>

                                    <td className={`px-2 py-1 justify-center text-right text-[#464255] ${row.isGrandTotal && "bg-[#FFFEE0] font-semibold"}`}>
                                        {row.calc !== null && row.calc !== undefined ? formatNumber(row.calc) : ''}
                                    </td>
                                </>
                            }

                            {
                                tariffType == 'B' && <>
                                    <td className={`px-2 py-1 justify-center text-[#464255] w-[150px] ${row.isGrandTotal && "bg-[#FFFEE0] font-semibold"}`}>
                                        {row.gas_day ? dayjs(row.gas_day, 'YYYY-MM-DD').format('DD/MM/YYYY') : ''}
                                    </td>

                                    <td className={`px-2 py-1 justify-center text-right text-[#464255] ${row.isGrandTotal && "bg-[#FFFEE0] font-semibold"}`}>
                                        {row.totalRoundRound !== null && row.totalRoundRound !== undefined ? formatNumber(row.totalRoundRound) : ''}
                                    </td>
                                </>
                            }

                            {/* Tariff Detail > Type Capacity Charge ตรง Column Detail ถ้าไม่มีสิทธิ์เห็นเมนู Capacity Contract Management ก็ให้ Hide Column Detail ไปเลย https://app.clickup.com/t/86euq74fb */}
                            {
                                canView &&
                                <td className={`px-2 py-1  text-[#464255] w-[180px] text-center ${row.isGrandTotal && "bg-[#FFFEE0]"}`}>
                                    {
                                        (!row.isSummary && !row.isGrandTotal) && <div className="relative inline-block text-left ">
                                            <BtnDetailGeneral
                                                handleFunc={routeToSomewhere}
                                                row_id={''}
                                                disable={false}
                                            />
                                        </div>
                                    }
                                </td>
                            }

                        </tr>
                    ))}
                </tbody>

                <tfoot className="sticky bottom-0 bg-gray-100 font-bold">
                    <tr className="font-bold bg-[#FFFEE0] h-[44px]">
                        <td className="p-2 text-center text-[#464255]">{`Total`}</td>
                        <td className="px-2 py-1 text-[#464255] text-right">{formatNumber(tableDataTotal?.calc)}</td>

                        {
                            canView &&
                            <td className="px-2 py-1 text-[#464255]">{''}</td>
                        }

                    </tr>
                </tfoot>
            </table>
        </div>
    )
}

export default TableViewCommodityCharge;