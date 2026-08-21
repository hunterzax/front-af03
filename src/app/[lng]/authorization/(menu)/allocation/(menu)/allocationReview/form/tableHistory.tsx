import { useEffect } from "react";
import React, { useState } from 'react';
import { formatDateTimeSecNoPlusSeven, formatDateTimeSecPlusSeven, formatNumberFourDecimal } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
interface TableProps {
    tableData: any;
    isLoading?: any;
    columnVisibility?: any;
}

const TableAllocationHistory: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility }) => {

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);
    const [mainData, setMainData] = useState(tableData);
    useEffect(() => {
        if (tableData && tableData.length > 0) {
            // change each tableData.row_data into root and change create.create_by to root create_by_account : {"first_name": create.create_by.first_name, "last_name": create.create_by.last_name, "create_date": create?.create_date}
            const transformed_history = tableData.map((item: any) => {
                const {
                    row_data,
                    create,
                    ...rest
                } = item;

                return {
                    ...rest,
                    ...row_data,
                    create_by_account: {
                        first_name: create?.create_by?.first_name,
                        last_name: create?.create_by?.last_name,
                        create_date: create?.create_date
                    }
                };
            });

            setSortedData(transformed_history);
            setMainData(transformed_history);
        } else {
            setSortedData([]);
            setMainData([]);
        }
        // setSortedData(tableData);
    }, [tableData]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    return (
        <div className={`h-[calc(100vh-500px)] overflow-y-auto block  rounded-t-md relative z-1`}>

            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                    <tr className="h-20">

                        {columnVisibility.status && (
                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("allocation_status.name", sortState, setSortState, setSortedData, mainData)}>
                                {`Status`}
                                {getArrowIcon("allocation_status.name")}
                            </th>
                        )}

                        {columnVisibility.system_allocation && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("systemAllocation", sortState, setSortState, setSortedData, mainData)}>
                                {`System Allocation (MMBTU/D)`}
                                {getArrowIcon("systemAllocation")}
                            </th>
                        )}

                        {columnVisibility.previous_allocation_tpa_for_review && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("previousAllocationTPAforReview", sortState, setSortState, setSortedData, mainData)}>
                                <div>{`Previous Allocation TPA for`}</div>
                                <div>{`Review (MMBTU/D)`}</div>
                                {getArrowIcon("previousAllocationTPAforReview")}
                            </th>
                        )}

                        {columnVisibility.shipper_review_allocation && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("shipper_allocation_review", sortState, setSortState, setSortedData, mainData)}>
                                {`Shipper Review Allocation (MMBTU/D)`}
                                {getArrowIcon("shipper_allocation_review")}
                            </th>
                        )}

                        {columnVisibility.updated_by && (
                            <th
                                scope="col"
                                className={`${table_sort_header_style}`}
                                onClick={() => handleSort("create_by_account.first_name", sortState, setSortState, setSortedData, mainData)}
                            >
                                {`Updated by`}
                                {getArrowIcon("create_by_account.first_name")}
                            </th>
                        )}

                    </tr>
                </thead>

                <tbody>
                    {sortedData && sortedData.map((row: any, index: any) => {
                        return (
                            <tr
                                key={row?.id}
                                className={`${table_row_style}`}
                            >

                                {columnVisibility.status && (
                                    <td className="px-4 py-1 justify-center">
                                        {
                                            <div className="flex min-w-[140px] max-w-[250px] w-auto text-center justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: String(row?.allocation_status?.color) }}>{row?.allocation_status?.name}</div>
                                        }
                                    </td>
                                )}

                                {columnVisibility.system_allocation && (
                                    // <td className="px-4 py-1 text-[#464255] text-right">{row?.systemAllocation ? formatNumberFourDecimal(row?.systemAllocation) : '0.0000'}</td>
                                    <td className="px-4 py-1 text-[#464255] text-right">{row?.systemAllocation !== null && row?.systemAllocation !== undefined ? formatNumberFourDecimal(row?.systemAllocation) : '0.0000'}</td>
                                )}

                                {columnVisibility.previous_allocation_tpa_for_review && (
                                    // <td className="px-4 py-1 text-[#464255] text-right">{row?.previousAllocationTPAforReview ? formatNumberFourDecimal(row?.previousAllocationTPAforReview) : '0.0000'}</td>
                                    <td className="px-4 py-1 text-[#464255] text-right">{row?.previousAllocationTPAforReview !== null && row?.previousAllocationTPAforReview !== undefined ? formatNumberFourDecimal(row?.previousAllocationTPAforReview) : '0.0000'}</td>
                                )}

                                {columnVisibility.shipper_review_allocation && (
                                    // <td className="px-4 py-1 text-[#464255] text-right">{row?.shipper_allocation_review ? formatNumberFourDecimal(row?.shipper_allocation_review) : '0.0000'}</td>
                                    <td className="px-4 py-1 text-[#464255] text-right">{row?.shipper_allocation_review !== null && row?.shipper_allocation_review !== undefined ? formatNumberFourDecimal(row?.shipper_allocation_review) : '0.0000'}</td>
                                )}

                                {columnVisibility.updated_by && (
                                    <td className="px-2 py-1 text-[#464255]">
                                        <div>
                                            <span className="text-[#464255]">{row?.create_by_account?.first_name} {row?.create_by_account?.last_name}</span>
                                            {/* <div className="text-gray-500 text-xs">{row?.create_by_account?.create_date ? formatDate(row?.create_by_account?.create_date) : ''}</div> */}
                                            {/* <div className="text-gray-500 text-xs">{row?.create_by_account?.create_date ? formatDateTimeSecNoPlusSeven(row?.create_by_account?.create_date) : ''}</div> */}
                                            <div className="text-gray-500 text-xs">{row?.create_by_account?.create_date ? formatDateTimeSecPlusSeven(row?.create_by_account?.create_date) : ''}</div>
                                        </div>
                                    </td>
                                )}

                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default TableAllocationHistory;