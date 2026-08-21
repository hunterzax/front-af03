import { useEffect } from "react";
import React, { useState } from 'react';
import { findRightByMenuName, formatNumberFourDecimalNom, formatNumberNoDecimal, getContrastTextColor } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import BtnDetailGeneral from "@/components/other/btnDetailsGeneral";
import { useRouter } from "next/navigation";
import getUserValue from "@/utils/getuserValue";
interface TableProps {
    tableData: any;
    headData: any;
    isLoading?: any;
    columnVisibility?: any;
}

const TableViewCapacityCharge: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility, headData }) => {
    const router = useRouter();
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState<any>([]);
    const [tableDataNew, setTableDataNew] = useState<any>([]);
    const [canView, setCanView] = useState<any>(false);
    const userDT: any = getUserValue();

    useEffect(() => {
        if (tableData && tableData.length > 0) {


            {/* Tariff Detail > Type Capacity Charge ตรง Column Detail ถ้าไม่มีสิทธิ์เห็นเมนู Capacity Contract Management ก็ให้ Hide Column Detail ไปเลย https://app.clickup.com/t/86euq74fb */ }
            const res_find = findRightByMenuName("Capacity Contract Management", userDT)
            setCanView(res_find)

            // const sumCapacity = (arr: any[]) => arr.reduce((acc, cur) => acc + parseFloat(cur.capacityMMBTUValue || 0), 0);

            // มันต้อง replace string
            // const sumCapacity = (arr: any[]) =>
            //     arr.reduce(
            //         (acc, cur) =>
            //             acc + parseFloat((cur.capacityMMBTUValue || "0")?.replace(/,/g, "")),
            //         0
            //     );

            const sumCapacity = (arr: any[]) =>
                arr.reduce((acc, cur) => {
                    const raw = cur?.capacityMMBTUValue ?? 0; // กัน null/undefined
                    const num =
                        typeof raw === "number"
                            ? raw
                            : parseFloat(String(raw).replace(/,/g, "")) || 0;
                    return acc + num;
                }, 0);

            const entry = tableData[0]?.data?.booking_row_json_use.filter((r: any) => r.entry_exit_id === 1);
            const exit = tableData[0]?.data?.booking_row_json_use.filter((r: any) => r.entry_exit_id === 2);

            const tableDataNew = [
                ...entry.map((r: any) => ({
                    area_text: r.area_text,
                    areaObj: r.areaObj,
                    capacityMMBTUValue: r.capacityMMBTUValue
                })),
                { area_text: "Total Entry", capacityMMBTUValue: sumCapacity(entry), isSummary: true },

                ...exit.map((r: any) => ({
                    area_text: r.area_text,
                    areaObj: r.areaObj,
                    capacityMMBTUValue: r.capacityMMBTUValue
                })),
                { area_text: "Total Exit", capacityMMBTUValue: sumCapacity(exit), isSummary: true },
                { area_text: "Total", capacityMMBTUValue: sumCapacity([...entry, ...exit]), isGrandTotal: true }
            ];
            setTableDataNew(tableDataNew)
            setSortedData(tableDataNew);
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
        // route to capacity mgn...
        // router.push(`/en/authorization/booking/capacity/CapReqMgn?contract_code=${tableData?.[0]?.data?.contract_code}&id=${tableData?.[0]?.data?.id}`);
        router.push(`/en/authorization/booking/capacity/CapReqMgn?contract_code=${tableData?.[0]?.data?.id}`);
    }

    return (
        // <div className={`h-[calc(100vh-260px)] overflow-y-auto block  rounded-t-md relative z-1`}>
        <div className={`h-[90%] overflow-y-auto block rounded-t-md relative z-1`}>

            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                    <tr className="h-9">
                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("area_text", sortState, setSortState, setSortedData, tableDataNew)}>
                            {`Area`}
                            {getArrowIcon("area_text")}
                        </th>

                        <th scope="col" className={`${table_sort_header_style} text-right`} onClick={() => handleSort("capacityMMBTUValue", sortState, setSortState, setSortedData, tableDataNew)}>
                            {`Capacity Right (MMBTU)`}
                            {getArrowIcon("capacityMMBTUValue")}
                        </th>

                        {/* Tariff Detail > Type Capacity Charge ตรง Column Detail ถ้าไม่มีสิทธิ์เห็นเมนู Capacity Contract Management ก็ให้ Hide Column Detail ไปเลย https://app.clickup.com/t/86euq74fb */}
                        {
                            canView && <th scope="col" className={`${table_header_style} !w-[180px] text-center`} >
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
                            <td className={`px-2 py-1 justify-center w-[200px] ${row.isSummary && "bg-[#E0F7FF]"} ${row.isGrandTotal && "bg-[#FFFEE0]"}`}>
                                {/* <div
                                    className={`p-1 text-[#464255] text-center items-center justify-center`}
                                >
                                    {row.area_text}
                                </div> */}

                                {
                                    (row.isSummary || row.isGrandTotal) ?
                                        <div
                                            className={`p-1 text-[#464255] font-semibold `}
                                        >
                                            {row.area_text}
                                        </div>

                                        : row?.areaObj?.entry_exit_id == 2 ?
                                            <div className="flex text-center items-center justify-center">
                                                <div
                                                    className="flex text-center items-center justify-center rounded-full p-1 text-[#464255]"
                                                    style={{ backgroundColor: row?.areaObj?.color, width: '40px', height: '40px', color: getContrastTextColor(row?.areaObj?.color) }}
                                                >
                                                    {`${row.area_text}`}
                                                </div>
                                            </div>
                                            :
                                            <div className="flex text-center items-center justify-center">
                                                <div
                                                    className="flex text-center items-center justify-center rounded-lg p-1 text-[#464255]"
                                                    style={{ backgroundColor: row?.areaObj?.color, width: '40px', height: '40px', color: getContrastTextColor(row?.areaObj?.color) }}
                                                >
                                                    {`${row.area_text}`}
                                                </div>
                                            </div>
                                }
                            </td>

                            <td className={`px-2 py-1 justify-center  text-right text-[#464255] ${row.isSummary && "bg-[#E0F7FF] font-semibold"} ${row.isGrandTotal && "bg-[#FFFEE0] font-semibold"}`}>
                                {/* {row.capacityMMBTUValue !== null && row.capacityMMBTUValue !== undefined ? formatNumberFourDecimalNom(row.capacityMMBTUValue) : ''} */}

                                {/* Row Total แสดงเป็นจำนวนเต็ม https://app.clickup.com/t/86euzxxuy */}
                                {/* {row.capacityMMBTUValue !== null && row.capacityMMBTUValue !== undefined ? formatNumber(row.capacityMMBTUValue) : ''} */}
                                {/* {row.capacityMMBTUValue !== null && row.capacityMMBTUValue !== undefined ? formatNumberNoDecimal(row.capacityMMBTUValue) : ''} */}

                                {/* เดิมโรงงาน */}
                                {/* {row.capacityMMBTUValue !== null && row.capacityMMBTUValue !== undefined ? formatNumberFourDecimalNom(row.capacityMMBTUValue) : ''} */} 

                                {/* 1. Tariff Charge Report > ในหน้า View ของ Type Demand Charge ตรง row Total สีฟ้า ต้อง round ค่าแล้วแสดงเป็นจำนวนเต็ม ส่วนบรรทัดสีเหลืองค่ามันมาจาก sum row ฟ้า ก็ต้องแสดงเป็นจำนวนเต็มเหมือนกัน */}
                                {row.capacityMMBTUValue !== null && row.capacityMMBTUValue !== undefined ? (row.isSummary || row.isGrandTotal) ? formatNumberNoDecimal(row.capacityMMBTUValue)  : formatNumberFourDecimalNom(row.capacityMMBTUValue) : ''}
                            </td>


                            {/* Tariff Detail > Type Capacity Charge ตรง Column Detail ถ้าไม่มีสิทธิ์เห็นเมนู Capacity Contract Management ก็ให้ Hide Column Detail ไปเลย https://app.clickup.com/t/86euq74fb */}
                            {
                                canView && <td className={`px-2 py-1  text-[#464255] w-[180px] text-center ${row.isSummary && "bg-[#E0F7FF]"} ${row.isGrandTotal && "bg-[#FFFEE0]"}`}>
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
            </table>
        </div>
    )
}

export default TableViewCapacityCharge;