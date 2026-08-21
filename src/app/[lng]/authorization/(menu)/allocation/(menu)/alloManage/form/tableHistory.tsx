import { useEffect } from "react";
import React, { FC, useState } from 'react';
import { formatDate, formatDateNoTime, formatDateTimeSec, formatNumber, formatNumberFourDecimal } from '@/utils/generalFormatter';

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
interface TableProps {
    tableData: any;
    isLoading?: any;
    columnVisibility?: any;
}

const TableAllocationMGNHistory: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility }) => {

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);
    const [masterData, setMasterData] = useState(tableData);
    useEffect(() => {
        if (tableData && tableData.length > 0) {

            // change each tableData.row_data into root and change create.create_by to root create_by_account : {"first_name": create.create_by.first_name, "last_name": create.create_by.last_name, "create_date": create?.create_date}
            const transformed_history = tableData?.map((item: any) => {
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
            setMasterData(transformed_history);
            setSortedData(transformed_history);
        }else{
            setSortedData([])
        }
        // setSortedData(tableData);
    }, [tableData]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    // const initialColumnsHistory: any = [
    //     { key: 'status', label: 'Status', visible: true },
    //     { key: 'nominated_value', label: 'Nominated Value (MMBTU/D)', visible: true },
    //     { key: 'system_allocation', label: 'System Allocation (MMBTU/D)', visible: true },
    //     { key: 'intraday_system_allocation', label: 'Intraday System Allocation', visible: true },
    //     { key: 'shipper_review_allocation', label: 'Shipper Review Allocation (MMBTU/D)', visible: true },
    //     { key: 'updated_by', label: 'Updated by', visible: true },
    // ];
    
    return (
        <div className={`h-[calc(100vh-500px)] overflow-y-auto block  rounded-t-md relative z-1`}>

            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                    <tr className="h-20">

                        {columnVisibility.status && (
                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("status", sortState, setSortState, setSortedData, masterData)}>
                                {`Status`}
                                {getArrowIcon("status")}
                            </th>
                        )}

                        {columnVisibility.nominated_value && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("nominationValue", sortState, setSortState, setSortedData, masterData)}>
                                <div>{`Nominated Value`}</div>
                                <div>{`(MMBTU/D)`}</div>
                                {getArrowIcon("nominationValue")}
                            </th>
                        )}

                        {columnVisibility.system_allocation && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("systemAllocation", sortState, setSortState, setSortedData, masterData)}>
                                <div>{`System Allocation`}</div>
                                <div>{`(MMBTU/D)`}</div>
                                {getArrowIcon("systemAllocation")}
                            </th>
                        )}

                        {columnVisibility.intraday_system_allocation && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("intradaySystem", sortState, setSortState, setSortedData, masterData)}>
                                <div>{`Intraday System`}</div>
                                <div>{`Allocation`}</div>
                                {getArrowIcon("intradaySystem")}
                            </th>
                        )}

                        {columnVisibility.shipper_review_allocation && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("shipper_review_allocation", sortState, setSortState, setSortedData, masterData)}>
                                {`Shipper Review Allocation (MMBTU/D)`}
                                {getArrowIcon("shipper_review_allocation")}
                            </th>
                        )}

                        {columnVisibility.updated_by && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("create.create_by.first_name", sortState, setSortState, setSortedData, masterData)}>
                                {`Updated by`}
                                {getArrowIcon("create.create_by.first_name")}
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

                                {columnVisibility.nominated_value && (
                                    <td className="px-4 py-1 text-[#464255] text-right">{row?.nominationValue ? formatNumberFourDecimal(row?.nominationValue) : ''}</td>
                                )}

                                {columnVisibility.system_allocation && (
                                    <td className="px-4 py-1 text-[#464255] text-right">{row?.systemAllocation ? formatNumberFourDecimal(row?.systemAllocation) : ''}</td>
                                )}

                                {columnVisibility.intraday_system_allocation && (
                                    <td className="px-4 py-1 text-[#464255] text-right">{row?.intradaySystem ? formatNumberFourDecimal(row?.intradaySystem) : ''}</td>
                                )}

                                {columnVisibility.shipper_review_allocation && (
                                    <td className="px-4 py-1 text-[#464255] text-right">{row?.allocation_management_shipper_review ? formatNumberFourDecimal(row?.allocation_management_shipper_review[0]?.shipper_allocation_review) : ''}</td>
                                )}

                                {columnVisibility.updated_by && (
                                    <td className="px-2 py-1 text-[#464255]">
                                        <div>
                                            <span className="text-[#464255]">{row?.create_by_account?.first_name} {row?.create_by_account?.last_name}</span>
                                            {/* <div className="text-gray-500 text-xs">{row?.create_by_account?.create_date ? formatDate(row?.create_by_account?.create_date) : ''}</div> */}
                                            <div className="text-gray-500 text-xs">{row?.create_by_account?.create_date ? formatDateTimeSec(row?.create_by_account?.create_date) : ''}</div>
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

export default TableAllocationMGNHistory;