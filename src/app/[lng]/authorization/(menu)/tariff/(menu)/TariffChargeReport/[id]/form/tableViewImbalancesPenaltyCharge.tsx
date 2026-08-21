import { useEffect } from "react";
import React, { useState } from 'react';
import { fillMonthDaysPenalty, findRightByMenuName, formatDateNoTime, formatNumberFourDecimal, formatNumberFourDecimalNomRound, formatNumberTwoDecimalNom } from '@/utils/generalFormatter';
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

const TableViewImbalanncePenaltyCharge: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility, headData }) => {
    const router = useRouter();
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState<any>([]);
    const [tableDataOriginal, setTableDataOriginal] = useState<any>([]);
    const [tableDataTotal, setTableDataTotal] = useState<any>({});
    const [canView, setCanView] = useState<any>(false);
    const userDT: any = getUserValue();

    useEffect(() => {
        if (tableData && tableData.length > 0) {

            {/* Tariff Detail > Type Capacity Charge ตรง Column Detail ถ้าไม่มีสิทธิ์เห็นเมนู Capacity Contract Management ก็ให้ Hide Column Detail ไปเลย https://app.clickup.com/t/86euq74fb */ }
            const res_find = findRightByMenuName("Allocation Report", userDT)
            setCanView(res_find)

            // ทำข้อมูล TOTAL ท้ายตาราง
            const totals = tableData?.[0]?.data?.data?.reduce(
                (acc: any, cur: any) => {
                    acc.entry += cur.entry || 0;
                    acc.exit += cur.exit || 0;
                    acc.fuel_gas += cur.fuel_gas || 0;
                    acc.balancing_gas += cur.balancing_gas || 0;
                    acc.change_in_ivent += cur.change_in_ivent || 0;
                    acc.shrinkage += cur.shrinkage || 0;
                    acc.commissioning += cur.commissioning || 0;
                    acc.gas_vent += cur.gas_vent || 0;
                    acc.other_gas += cur.other_gas || 0;
                    acc.imbalance += cur.imbalance || 0;
                    acc.imbalance_over_5_percen += cur.imbalance_over_5_percen || 0;
                    return acc;
                },
                { entry: 0, exit: 0, fuel_gas: 0, balancing_gas: 0, change_in_ivent: 0, shrinkage: 0, commissioning: 0, gas_vent: 0, other_gas: 0, imbalance: 0, imbalance_over_5_percen: 0, }
            );

            // Tariff Detail > Type Imbalance Penalty Charge (Positive,Negative) เรียงลำดับวันที่ น้อยสุดอยู่บน https://app.clickup.com/t/86euqhxz6 
            const sorted_gas_day = [...tableData?.[0]?.data?.data]?.sort(
                (a, b) => new Date(a.gas_day).getTime() - new Date(b.gas_day).getTime()
            );
            // เติมวันที่ให้เต็มเดือน
            const filledMonth = fillMonthDaysPenalty(sorted_gas_day);
            
            setTableDataTotal(totals)
            // setSortedData(sorted_gas_day);
            // setTableDataOriginal(sorted_gas_day);
            setSortedData(filledMonth);
            setTableDataOriginal(filledMonth);

        } else {
            setSortedData([]);
            setTableDataOriginal([]);
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
        router.push(`/en/authorization/balancing/balReport?from=${from}&to=${to}`);
    }

    return (
        // <div className={`h-[calc(100vh-355px)] overflow-y-auto block rounded-t-md relative z-1`}>
        <div className={`h-[90%] overflow-y-auto block rounded-t-md relative z-1`}>

            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                    <tr className="h-9">
                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("gas_day", sortState, setSortState, setSortedData, tableDataOriginal)}>
                            {`Gas Day`}
                            {getArrowIcon("gas_day")}
                        </th>

                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("entry", sortState, setSortState, setSortedData, tableDataOriginal)}>
                            {`Entry`}
                            {getArrowIcon("entry")}
                        </th>

                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("exit", sortState, setSortState, setSortedData, tableDataOriginal)}>
                            {`Exit`}
                            {getArrowIcon("exit")}
                        </th>

                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("fuel_gas", sortState, setSortState, setSortedData, tableDataOriginal)}>
                            {`Fuel Gas`}
                            {getArrowIcon("fuel_gas")}
                        </th>

                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("balancing_gas", sortState, setSortState, setSortedData, tableDataOriginal)}>
                            {`Balancing Gas`}
                            {getArrowIcon("balancing_gas")}
                        </th>

                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("change_in_ivent", sortState, setSortState, setSortedData, tableDataOriginal)}>
                            {`Change Min Invent`}
                            {getArrowIcon("change_in_ivent")}
                        </th>

                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("shrinkage", sortState, setSortState, setSortedData, tableDataOriginal)}>
                            {`Shrinkage`}
                            {getArrowIcon("shrinkage")}
                        </th>

                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("commissioning", sortState, setSortState, setSortedData, tableDataOriginal)}>
                            {`Commissioning`}
                            {getArrowIcon("commissioning")}
                        </th>

                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("gas_vent", sortState, setSortState, setSortedData, tableDataOriginal)}>
                            {`Gas Vent`}
                            {getArrowIcon("gas_vent")}
                        </th>

                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("other_gas", sortState, setSortState, setSortedData, tableDataOriginal)}>
                            {`Other Gas`}
                            {getArrowIcon("other_gas")}
                        </th>

                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("imbalance", sortState, setSortState, setSortedData, tableDataOriginal)}>
                            {`Imbalance`}
                            {getArrowIcon("imbalance")}
                        </th>

                        <th
                            scope="col"
                            className={`${table_header_style} text-center`}
                        // onClick={() => handleSort("imbalance", sortState, setSortState, setSortedData, tableDataOriginal)}
                        >
                            {`Imbalance %`}
                            {/* {getArrowIcon("imbalance")} */}
                        </th>

                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("imbalance_over_5_percen", sortState, setSortState, setSortedData, tableDataOriginal)}>
                            {`Imbalance Over 5 %`}
                            {getArrowIcon("imbalance_over_5_percen")}
                        </th>

                        {
                            canView &&
                            <th scope="col" className={`${table_header_style} !w-[180px] text-center`} >
                                {`Detail`}
                            </th>
                        }

                    </tr>
                </thead>

                <tbody>
                    {sortedData && sortedData.map((row: any, index: number) => (
                        <tr
                            key={index}
                            className={`${table_row_style} ${row.isSummary ? "bg-gray-200 font-bold" : ""}`}
                        >
                            <td className={`px-2 py-1 justify-center  text-right text-[#464255] ${row.isGrandTotal && "bg-[#FFFEE0] font-semibold"}`}>
                                {row.gas_day ? formatDateNoTime(row.gas_day) : ''}
                            </td>

                            <td className={`px-2 py-1 justify-center  text-right text-[#464255] ${row.isGrandTotal && "bg-[#FFFEE0] font-semibold"}`}>
                                {row.entry !== null && row.entry !== undefined ? formatNumberFourDecimalNomRound(row.entry) : ''}
                            </td>

                            <td className={`px-2 py-1 justify-center  text-right text-[#464255] ${row.isGrandTotal && "bg-[#FFFEE0] font-semibold"}`}>
                                {row.exit !== null && row.exit !== undefined ? formatNumberFourDecimalNomRound(row.exit) : ''}
                            </td>

                            <td className={`px-2 py-1 justify-center  text-right text-[#464255] ${row.isGrandTotal && "bg-[#FFFEE0] font-semibold"}`}>
                                {row.fuel_gas !== null && row.fuel_gas !== undefined ? formatNumberFourDecimalNomRound(row.fuel_gas) : ''}
                            </td>

                            <td className={`px-2 py-1 justify-center  text-right text-[#464255] ${row.isGrandTotal && "bg-[#FFFEE0] font-semibold"}`}>
                                {row.balancing_gas !== null && row.balancing_gas !== undefined ? formatNumberFourDecimalNomRound(row.balancing_gas) : ''}
                            </td>

                            <td className={`px-2 py-1 justify-center  text-right text-[#464255] ${row.isGrandTotal && "bg-[#FFFEE0] font-semibold"}`}>
                                {row.change_in_ivent !== null && row.change_in_ivent !== undefined ? formatNumberFourDecimalNomRound(row.change_in_ivent) : ''}
                            </td>

                            <td className={`px-2 py-1 justify-center  text-right text-[#464255] ${row.isGrandTotal && "bg-[#FFFEE0] font-semibold"}`}>
                                {row.shrinkage !== null && row.shrinkage !== undefined ? formatNumberFourDecimalNomRound(row.shrinkage) : ''}
                            </td>

                            <td className={`px-2 py-1 justify-center  text-right text-[#464255] ${row.isGrandTotal && "bg-[#FFFEE0] font-semibold"}`}>
                                {row.commissioning !== null && row.commissioning !== undefined ? formatNumberFourDecimalNomRound(row.commissioning) : ''}
                            </td>

                            <td className={`px-2 py-1 justify-center  text-right text-[#464255] ${row.isGrandTotal && "bg-[#FFFEE0] font-semibold"}`}>
                                {row.gas_vent !== null && row.gas_vent !== undefined ? formatNumberFourDecimalNomRound(row.gas_vent) : ''}
                            </td>

                            <td className={`px-2 py-1 justify-center  text-right text-[#464255] ${row.isGrandTotal && "bg-[#FFFEE0] font-semibold"}`}>
                                {row.other_gas !== null && row.other_gas !== undefined ? formatNumberFourDecimalNomRound(row.other_gas) : ''}
                            </td>

                            <td className={`px-2 py-1 justify-center  text-right text-[#464255] ${row.isGrandTotal && "bg-[#FFFEE0] font-semibold"}`}>
                                {row.imbalance !== null && row.imbalance !== undefined ? formatNumberFourDecimalNomRound(row.imbalance) : ''}
                            </td>

                            <td className={`px-2 py-1 justify-center  text-right text-[#464255] ${row.isGrandTotal && "bg-[#FFFEE0] font-semibold"}`}>
                                {/* {row.imbalance !== null && row.imbalance !== undefined ? formatNumberFourDecimal(row.imbalance) : ''} */}
                                {row.imbalance !== null && row.imbalance !== undefined ? formatNumberTwoDecimalNom(parseFloat(((row.imbalance / row.entry) * 100).toFixed(2))) + '%' : ''}
                            </td>

                            <td className={`px-2 py-1 justify-center  text-right text-[#464255] ${row.isGrandTotal && "bg-[#FFFEE0] font-semibold"}`}>
                                {row.imbalance_over_5_percen !== null && row.imbalance_over_5_percen !== undefined ? formatNumberFourDecimalNomRound(row.imbalance_over_5_percen) : ''}
                            </td> 

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
                        <td className="px-2 py-1 text-[#464255] text-right">{formatNumberFourDecimalNomRound(tableDataTotal?.entry)}</td>
                        <td className="px-2 py-1 text-[#464255] text-right">{formatNumberFourDecimalNomRound(tableDataTotal?.exit)}</td>
                        <td className="px-2 py-1 text-[#464255] text-right">{formatNumberFourDecimalNomRound(tableDataTotal?.fuel_gas)}</td>
                        <td className="px-2 py-1 text-[#464255] text-right">{formatNumberFourDecimalNomRound(tableDataTotal?.balancing_gas)}</td>
                        <td className="px-2 py-1 text-[#464255] text-right">{formatNumberFourDecimalNomRound(tableDataTotal?.change_in_ivent)}</td>
                        <td className="px-2 py-1 text-[#464255] text-right">{formatNumberFourDecimalNomRound(tableDataTotal?.shrinkage)}</td>
                        <td className="px-2 py-1 text-[#464255] text-right">{formatNumberFourDecimalNomRound(tableDataTotal?.commissioning)}</td>
                        <td className="px-2 py-1 text-[#464255] text-right">{formatNumberFourDecimalNomRound(tableDataTotal?.gas_vent)}</td>
                        <td className="px-2 py-1 text-[#464255] text-right">{formatNumberFourDecimalNomRound(tableDataTotal?.other_gas)}</td>
                        <td className="px-2 py-1 text-[#464255] text-right">{formatNumberFourDecimalNomRound(tableDataTotal?.imbalance)}</td>
                        <td className="px-2 py-1 text-[#464255] text-right">{''}</td>
                        <td className="px-2 py-1 text-[#464255] text-right">{''}</td>

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

export default TableViewImbalanncePenaltyCharge;