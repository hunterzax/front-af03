import { useEffect } from "react";
import React, { useState } from 'react';
import { findRightByMenuName, formatNumberFourDecimal, getContrastTextColor } from '@/utils/generalFormatter';
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

const TableViewCapacityOveruseCharge: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility, headData }) => {
    const router = useRouter();
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState<any>([]);
    const [tableDataOriginal, setTableDataOriginal] = useState<any>([]);
    const [tableDataTotal, setTableDataTotal] = useState<any>({});
    const [canView, setCanView] = useState<any>(false);
    const userDT: any = getUserValue();

    useEffect(() => {
        // tableData table view Capacity Overuse Charge
        if (tableData && tableData.length > 0) {

            {/* Tariff Detail > Type Capacity Charge ตรง Column Detail ถ้าไม่มีสิทธิ์เห็นเมนู Capacity Contract Management ก็ให้ Hide Column Detail ไปเลย https://app.clickup.com/t/86euq74fb */ }
            const res_find = findRightByMenuName("Allocation Report", userDT)
            setCanView(res_find)

            // ทำข้อมูล TOTAL ท้ายตาราง
            const totals = tableData?.[0]?.data?.data?.reduce(
                (acc: any, cur: any) => {
                    acc.bookQuantity += cur.bookQuantity || 0;
                    acc.allocationQuantity += cur.allocationQuantity || 0;
                    acc.overuse += cur.overuse || 0;
                    return acc;
                },
                { bookQuantity: 0, allocationQuantity: 0, overuse: 0 }
            );
            setTableDataTotal(totals)
            setSortedData(tableData?.[0]?.data?.data);
            setTableDataOriginal(tableData?.[0]?.data?.data);
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
        // router.push("/en/authorization/allocation/alloReport");
        const from = dayjs(headData?.month_year_charge).startOf("month").format("YYYY-MM-DD")
        const to = dayjs(headData?.month_year_charge).endOf("month").format("YYYY-MM-DD")
        router.push(`/en/authorization/allocation/alloReport?from=${from}&to=${to}`);
    }

    return (
        // <div className={`h-[calc(100vh-260px)] overflow-y-auto block  rounded-t-md relative z-1`}>
        <div className={`h-[90%] overflow-y-auto block rounded-t-md relative z-1`}>

            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                    <tr className="h-9">
                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("area", sortState, setSortState, setSortedData, tableDataOriginal)}>
                            {`Area`}
                            {getArrowIcon("area")}
                        </th>

                        {/* <th scope="col" className={`${table_sort_header_style} text-right`} onClick={() => handleSort("bookQuantity", sortState, setSortState, setSortedData, tableDataOriginal)}>
                            {`Capacity Right (MMBTU)`}
                            {getArrowIcon("bookQuantity")}
                        </th>

                        <th scope="col" className={`${table_sort_header_style} text-right`} onClick={() => handleSort("allocationQuantity", sortState, setSortState, setSortedData, tableDataOriginal)}>
                            {`System Allocation (MMBTU)`}
                            {getArrowIcon("allocationQuantity")}
                        </th> */}

                        <th scope="col" className={`${table_sort_header_style} text-right`} onClick={() => handleSort("overuse", sortState, setSortState, setSortedData, tableDataOriginal)}>
                            {/* {`Overuse Entry`} */}
                            {/* Tariff Detail > Type Capacity Overuse Charge ปรับชื่อ Column ในหน้า View ปรับทั้ง Entry และ Exit https://app.clickup.com/t/86euqg75v */}
                            {`Overusage (MMBTU)`}
                            {getArrowIcon("overuse")}
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
                            className={`${table_row_style}`}
                        >
                            {/* <td className={`px-2 py-1 justify-center w-[200px] ${row.isSummary && "bg-[#E0F7FF]"} ${row.isGrandTotal && "bg-[#FFFEE0]"}`}>
                                {''}
                            </td> */}

                            <td className="px-2 py-1 justify-center text-center ">
                                <div className="flex text-center items-center justify-center">
                                    {
                                        row?.entry_exit_obj?.id == 2 ?
                                            <div
                                                className="flex justify-center items-center rounded-full p-1 text-[#464255]"
                                                style={{ backgroundColor: row?.area_obj?.color, width: '40px', height: '40px', color: getContrastTextColor(row?.area_obj.color) }}
                                            >
                                                {`${row?.area_obj?.name}`}
                                            </div>
                                            :
                                            <div
                                                className="flex justify-center items-center rounded-lg p-1 text-[#464255]"
                                                style={{ backgroundColor: row?.area_obj?.color, width: '40px', height: '40px', color: getContrastTextColor(row?.area_obj?.color) }}
                                            >
                                                {`${row?.area_obj?.name}`}
                                            </div>
                                    }
                                </div>
                            </td>

                            {/* <td className={`px-2 py-1 justify-center  text-right text-[#464255]`}>
                                {row.bookQuantity !== null && row.bookQuantity !== undefined ? formatNumberFourDecimal(row.bookQuantity) : ''}
                            </td>

                            <td className={`px-2 py-1 justify-center  text-right text-[#464255]`}>
                                {row.allocationQuantity !== null && row.allocationQuantity !== undefined ? formatNumberFourDecimal(row.allocationQuantity) : ''}
                            </td> */}

                            <td className={`px-2 py-1 justify-center  text-right text-[#464255]`}>
                                {row.overuse !== null && row.overuse !== undefined ? formatNumberFourDecimal(row.overuse) : ''}
                            </td>

                            {/* Tariff Detail > Type Capacity Charge ตรง Column Detail ถ้าไม่มีสิทธิ์เห็นเมนู Capacity Contract Management ก็ให้ Hide Column Detail ไปเลย https://app.clickup.com/t/86euq74fb */}
                            {
                                canView &&
                                <td className={`px-2 py-1  text-[#464255] w-[180px] text-center`}>
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

                    <tr className="font-bold bg-[#FFFEE0] h-[44px]">
                        <td className="p-2 text-center text-[#464255]">{`Total`}</td>
                        {/* <td className="px-2 py-1 text-[#464255] text-right">{formatNumberFourDecimal(tableDataTotal?.bookQuantity)}</td>
                        <td className="px-2 py-1 text-[#464255] text-right">{formatNumberFourDecimal(tableDataTotal?.allocationQuantity)}</td> */}
                        <td className="px-2 py-1 text-[#464255] text-right">{formatNumberFourDecimal(tableDataTotal?.overuse)}</td>
                        {
                            canView &&
                            <td className="px-2 py-1 text-[#464255]">{''}</td>
                        }
                    </tr>

                </tbody>
            </table>

        </div>
    )
}

export default TableViewCapacityOveruseCharge;