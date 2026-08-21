import { useEffect } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatNumberFourDecimal, toDayjs } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import dayjs from "dayjs";
interface TableProps {
    openEditForm: (id: any) => void;
    openViewForm: (id: any) => void;
    tableData: any;
    isLoading: any;
    zoneMaster?: any;
    columnVisibility: any;
    userPermission?: any;
}

// 2026-01-23 เอา column hv, base inventory value, High Max และ Low Max ออกทั้งจากหน้า UI และ export https://app.clickup.com/t/86ev5f74e

const TableBalanceIntradayBaseInventoryShipper: React.FC<TableProps> = ({ openEditForm, openViewForm, tableData, isLoading, columnVisibility, userPermission, zoneMaster }) => {

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState<any>([]);
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

    const getValueByTag = (values: any[], tag: string): string => {
        const found = values.find(v => v.tag === tag);
        return found ? formatNumberFourDecimal(found.value) : '0.0000';
    };

    return (
        <div className={`relative h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md z-1`}>
            {
                isLoading ?
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-9">

                                {columnVisibility.gas_day && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("gas_day", sortState, setSortState, setSortedData, tableData)}>
                                        {`Gas Day`}
                                        {getArrowIcon("gas_day")}
                                    </th>
                                )}

                                {columnVisibility.gas_hour && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("gas_hour", sortState, setSortState, setSortedData, tableData)}>
                                        {`Gas Hour`}
                                        {getArrowIcon("gas_hour")}
                                    </th>
                                )}

                                {columnVisibility.timestamp && (
                                    <th scope="col" className={`${table_sort_header_style}  text-center`} onClick={() => handleSort("timestamp", sortState, setSortState, setSortedData, tableData)}>
                                        {`Timestamp`}
                                        {getArrowIcon("timestamp")}
                                    </th>
                                )}

                                {columnVisibility.zone && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("zoneObj.name", sortState, setSortState, setSortedData, tableData)}>
                                        {`Zone`}
                                        {getArrowIcon("zoneObj.name")}
                                    </th>
                                )}

                                {columnVisibility.mode && (
                                    <th scope="col" className={`${table_sort_header_style} `} onClick={() => handleSort("mode", sortState, setSortState, setSortedData, tableData)}>
                                        {`Mode`}
                                        {getArrowIcon("mode")}
                                    </th>
                                )}

                                {columnVisibility.group && (
                                    <th scope="col" className={`${table_sort_header_style} `} onClick={() => handleSort("groupObj.name", sortState, setSortState, setSortedData, tableData)}>
                                        {`Shipper Name`}
                                        {getArrowIcon("groupObj.name")}
                                    </th>
                                )}

                                {/* {columnVisibility.hv && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("heatingValue_base", sortState, setSortState, setSortedData, tableData)}>
                                        {`HV (BTU/SCF)`}
                                        {getArrowIcon("heatingValue_base")}
                                    </th>
                                )} */}

                                {/* {columnVisibility.base_inventory_value && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("baseInv", sortState, setSortState, setSortedData, tableData)}>
                                        {`Base Inventory Value (MMBTU)`}
                                        {getArrowIcon("baseInv")}
                                    </th>
                                )} */}

                                {/* {columnVisibility.high_max && (
                                    <th scope="col" className={`${table_sort_header_style} text-center hover:bg-[#4b4b4b] bg-[#606060]`} onClick={() => handleSort("high_max", sortState, setSortState, setSortedData, tableData)}>
                                        {`High Max (MMBTU)`}
                                        {getArrowIcon("high_max")}
                                    </th>
                                )} */}

                                {columnVisibility.high_difficult_day && (
                                    <th scope="col" className={`${table_sort_header_style} text-center hover:bg-[#a247c3] bg-[#A855C5]`} onClick={() => handleSort("high_dd", sortState, setSortState, setSortedData, tableData)}>
                                        {`High Difficult Day (MMBTU)`}
                                        {getArrowIcon("high_dd")}
                                    </th>
                                )}

                                {columnVisibility.high_red && (
                                    <th scope="col" className={`${table_sort_header_style} text-center hover:bg-[#cd373e] bg-[#EB484F]`} onClick={() => handleSort("high_red", sortState, setSortState, setSortedData, tableData)}>
                                        {`High Red (MMBTU)`}
                                        {getArrowIcon("high_red")}
                                    </th>
                                )}

                                {columnVisibility.high_orange && (
                                    <th scope="col" className={`${table_sort_header_style} text-center hover:bg-[#ce7231] bg-[#EF8538]`} onClick={() => handleSort("high_orange", sortState, setSortState, setSortedData, tableData)}>
                                        {`High Orange (MMBTU)`}
                                        {getArrowIcon("high_orange")}
                                    </th>
                                )}

                                {columnVisibility.alert_high && (
                                    <th scope="col" className={`${table_sort_header_style} text-center hover:bg-[#c9a830] bg-[#EAC12E]`} onClick={() => handleSort("high_alert", sortState, setSortState, setSortedData, tableData)}>
                                        {`Alert High (MMBTU)`}
                                        {getArrowIcon("high_alert")}
                                    </th>
                                )}

                                {columnVisibility.alert_low && (
                                    <th scope="col" className={`${table_sort_header_style} text-center hover:bg-[#c9a830] bg-[#EAC12E]`} onClick={() => handleSort("low_alert", sortState, setSortState, setSortedData, tableData)}>
                                        {`Alert Low (MMBTU)`}
                                        {getArrowIcon("low_alert")}
                                    </th>
                                )}

                                {columnVisibility.low_orange && (
                                    <th scope="col" className={`${table_sort_header_style} text-center hover:bg-[#ce7231] bg-[#EF8538]`} onClick={() => handleSort("low_orange", sortState, setSortState, setSortedData, tableData)}>
                                        {`Low Orange (MMBTU)`}
                                        {getArrowIcon("low_orange")}
                                    </th>
                                )}

                                {columnVisibility.low_red && (
                                    <th scope="col" className={`${table_sort_header_style} text-center hover:bg-[#cd373e] bg-[#EB484F]`} onClick={() => handleSort("low_red", sortState, setSortState, setSortedData, tableData)}>
                                        {`Low Red (MMBTU)`}
                                        {getArrowIcon("low_red")}
                                    </th>
                                )}

                                {columnVisibility.low_difficult_day && (
                                    <th scope="col" className={`${table_sort_header_style} text-center hover:bg-[#a247c3] bg-[#A855C5]`} onClick={() => handleSort("low_dd", sortState, setSortState, setSortedData, tableData)}>
                                        {`Low Difficult Day (MMBTU)`}
                                        {getArrowIcon("low_dd")}
                                    </th>
                                )}

                                {/* {columnVisibility.low_max && (
                                    <th scope="col" className={`${table_sort_header_style} text-center hover:bg-[#4b4b4b] bg-[#606060]`} onClick={() => handleSort("low_max", sortState, setSortState, setSortedData, tableData)}>
                                        {`Low Max (MMBTU)`}
                                        {getArrowIcon("low_max")}
                                    </th>
                                )} */}

                            </tr>
                        </thead>

                        <tbody>
                            {sortedData && sortedData?.map((row: any, index: any) => (
                                <tr
                                    key={row?.id}
                                    className={`${table_row_style}`}
                                >

                                    {columnVisibility?.gas_day && (
                                        <td className={`px-2 py-1 text-[#464255] text-center`}>
                                            {row?.gas_day ? toDayjs(row?.gas_day).format("DD/MM/YYYY") : ''}
                                        </td>
                                    )}

                                    {columnVisibility?.gas_hour && (
                                        <td className={`px-2 py-1 text-[#464255] text-center`}>
                                            {/* {row?.gas_hour ? row?.gas_hour  : ''} */}
                                            {row?.gas_hour !== undefined ? String(row.gas_hour).padStart(2, '0') + ':00' : ''}
                                        </td>
                                    )}

                                    {columnVisibility?.timestamp && (
                                        <td className={`px-2 py-1 text-[#464255] text-center min-w-[170px] max-w-[500px]`}>
                                            {row?.timestamp ? row?.timestamp : ''}
                                        </td>
                                        // <td className="px-2 py-1 text-[#464255]">{row?.submitted_timestamp ? formatDate(row?.submitted_timestamp) : ''}</td>
                                    )}

                                    {columnVisibility?.zone && (
                                        <td className={`px-2 py-1`}>
                                            <div className="w-full flex justify-center items-center px-[20px]">
                                                {/* <div className="flex w-[120px] justify-center rounded-full px-1 py-2 text-[#464255]" style={{ backgroundColor: row?.zone?.color }}>{`${row?.zone?.name ? row?.zone?.name : ''}`}</div> */}
                                                <div className="flex w-[120px] justify-center rounded-full px-1 py-2 text-[#464255]" style={{ backgroundColor: row?.zoneObj?.color }}>{`${row?.zoneObj?.name ? row?.zoneObj?.name : ''}`}</div>
                                            </div>
                                        </td>
                                    )}

                                    {columnVisibility?.mode && (
                                        <td className={`px-2 py-1 text-[#464255] min-w-[120px] max-w-[300px]`}>
                                            {row?.mode ? row?.mode : ''}
                                        </td>
                                    )}

                                    {columnVisibility?.group && (
                                        <td className="px-2 py-1 text-[#464255] min-w-[180px] max-w-[300px]">
                                            <div>{row?.groupObj ? row?.groupObj?.name : null}</div>
                                        </td>
                                    )}

                                    {/* {columnVisibility?.hv && (
                                        <td className={`px-2 py-1 text-[#464255] text-right`}>
                                            {row?.heatingValue_base ? formatNumberFourDecimal(row?.heatingValue_base) : '0.0000'}
                                        </td>
                                    )} */}

                                    {/* {columnVisibility?.base_inventory_value && (
                                        <td className={`px-2 py-1 text-[#464255] text-right`}>
                                            {getValueByTag(row?.values, 'baseInv')}
                                        </td>
                                    )} */}

                                    {/* {columnVisibility?.high_max && (
                                        <td className={`px-2 py-1 text-[#4b4b4b] bg-[#c9c9c9] font-semibold text-right`}>
                                            {getValueByTag(row?.values, "high_max")}
                                        </td>
                                    )} */}

                                    {columnVisibility?.high_difficult_day && (
                                        <td className={`px-2 py-1 text-[#A855C5] bg-[#A855C51A] font-semibold text-right`}>
                                            {/* {row?.high_difficult_day ? formatNumberFourDecimal(row?.high_difficult_day) : '0.0000'} */}
                                            {getValueByTag(row?.values, "high_dd")}
                                        </td>
                                    )}

                                    {columnVisibility?.high_red && (
                                        <td className={`px-2 py-1 text-[#ED1B24] bg-[#EB484F1A] font-semibold text-right`}>
                                            {/* {row?.high_red ? formatNumberFourDecimal(row?.high_red) : '0.0000'} */}
                                            {getValueByTag(row?.values, "high_red")}
                                        </td>
                                    )}

                                    {columnVisibility?.high_orange && (
                                        <td className={`px-2 py-1 text-[#F06500] bg-[#EF85381A] font-semibold text-right`}>
                                            {/* {row?.high_orange ? formatNumberFourDecimal(row?.high_orange) : '0.0000'} */}
                                            {getValueByTag(row?.values, "high_orange")}
                                        </td>
                                    )}

                                    {columnVisibility?.alert_high && (
                                        <td className={`px-2 py-1 text-[#DFB419] bg-[#EAC12E1A] font-semibold text-right`}>
                                            {/* {row?.alert_high ? formatNumberFourDecimal(row?.alert_high) : '0.0000'} */}
                                            {getValueByTag(row?.values, "high_alert")}
                                        </td>
                                    )}

                                    {columnVisibility?.alert_low && (
                                        <td className={`px-2 py-1 text-[#DFB419] bg-[#EAC12E1A] font-semibold text-right`}>
                                            {/* {row?.alert_low ? formatNumberFourDecimal(row?.alert_low) : '0.0000'} */}
                                            {getValueByTag(row?.values, "low_alert")}
                                        </td>
                                    )}

                                    {columnVisibility?.low_orange && (
                                        <td className={`px-2 py-1 text-[#F06500] bg-[#EF85381A] font-semibold text-right`}>
                                            {/* {row?.low_orange ? formatNumberFourDecimal(row?.low_orange) : '0.0000'} */}
                                            {getValueByTag(row?.values, "low_orange")}
                                        </td>
                                    )}

                                    {columnVisibility?.low_red && (
                                        <td className={`px-2 py-1 text-[#ED1B24] bg-[#EB484F1A] font-semibold text-right`}>
                                            {/* {row?.low_red ? formatNumberFourDecimal(row?.low_red) : '0.0000'} */}
                                            {getValueByTag(row?.values, "low_red")}
                                        </td>
                                    )}

                                    {columnVisibility?.low_difficult_day && (
                                        <td className={`px-2 py-1 text-[#A855C5] bg-[#A855C51A] font-semibold text-right`}>
                                            {/* {row?.low_difficult_day ? formatNumberFourDecimal(row?.low_difficult_day) : '0.0000'} */}
                                            {getValueByTag(row?.values, "low_dd")}
                                        </td>
                                    )}

                                    {/* {columnVisibility?.low_max && (
                                        <td className={`px-2 py-1 text-[#4b4b4b] bg-[#c9c9c9] font-semibold text-right`}>
                                            {getValueByTag(row?.values, "low_max")}
                                        </td>
                                    )} */}

                                </tr>
                            ))}
                        </tbody>
                    </table>
                    :
                    <TableSkeleton />
            }
        </div>
    )
}

export default TableBalanceIntradayBaseInventoryShipper;