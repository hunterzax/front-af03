import { useEffect } from "react";
import React, { useState } from 'react';
import { formatNumberFourDecimal } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
interface TableProps {
    tableData: any;
    isLoading?: any;
    columnVisibility?: any;
}

const TableViewCurtailsmentAlloc: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility }) => {
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState<any>([]);
  
    const [totals, setTotals] = useState({
        totalNominationValue: 0,
        totalRemainingCapacity: 0,
    });

    useEffect(() => {
        setSortedData(tableData);

        const totalNominationValue = tableData?.reduce((sum: number, row: any) => sum + (parseFloat(row.nomination_value) || 0), 0);
        const totalRemainingCapacity = tableData?.reduce((sum: number, row: any) => sum + (parseFloat(row.remaining_capacity) || 0), 0);

        setTotals({
            totalNominationValue,
            totalRemainingCapacity,
        });

    }, [tableData]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    return (
        <div className={`h-[calc(100vh-450px)] overflow-y-auto block  rounded-t-md relative z-1`}>
            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                    <tr className="h-9">
                        <th scope="col" className={`${table_sort_header_style} text-left`} onClick={() => handleSort("shipper_name", sortState, setSortState, setSortedData, sortedData)}>
                            {`Shipper Name`}
                            {getArrowIcon("shipper_name")}
                        </th>

                        <th scope="col" className={`${table_sort_header_style} text-left`} onClick={() => handleSort("contract", sortState, setSortState, setSortedData, sortedData)}>
                            {`Contract Code`}
                            {getArrowIcon("contract")}
                        </th>

                        <th scope="col" className={`${table_sort_header_style} text-right`} onClick={() => handleSort("nomination_value", sortState, setSortState, setSortedData, sortedData)}>
                            {`Nomination Value`}
                            {getArrowIcon("nomination_value")}
                        </th>

                        <th scope="col" className={`${table_sort_header_style} text-right`} onClick={() => handleSort("remaining_capacity", sortState, setSortState, setSortedData, sortedData)}>
                            {`Remaining Capacity`}
                            {getArrowIcon("remaining_capacity")}
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {sortedData?.length > 0 && sortedData?.map((row: any, index: any) => {
                        return (
                            <tr
                                key={row?.id}
                                className={`${table_row_style}`}
                            >
                                <td className="px-2 py-1 text-[#464255] text-left">{row?.shipper_name ? row?.shipper_name : ''}</td>

                                <td className="px-2 py-1 text-[#464255] text-left">{row?.contract ? row?.contract : ''}</td>

                                <td className="px-2 py-1 text-[#464255] text-right">
                                    <div>{row?.nomination_value ? formatNumberFourDecimal(row?.nomination_value) : '0.0000'}</div>
                                </td>

                                <td className="px-2 py-1 text-[#464255] text-right">
                                    <div>{row?.remaining_capacity ? formatNumberFourDecimal(row?.remaining_capacity) : '0.0000'}</div>
                                </td>
                            </tr>
                        )
                    })}

                    {/* Sum row */}
                    {
                        sortedData?.length > 0 && <tr className={`${table_row_style} font-semibold !bg-[#D1F2FF]`}>
                            <td className="px-2 py-1 text-[#464255] text-left" colSpan={2}>Total</td>
                            <td className="px-2 py-1 text-[#464255] text-right">
                                {formatNumberFourDecimal(totals.totalNominationValue)}
                            </td>
                            <td className="px-2 py-1 text-[#464255] text-right">
                                {formatNumberFourDecimal(totals.totalRemainingCapacity)}
                            </td>
                        </tr>
                    }
                </tbody>
            </table>

        </div>
    )
}

export default TableViewCurtailsmentAlloc;