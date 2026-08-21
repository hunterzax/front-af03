import { useEffect } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatNumberFourDecimal } from '@/utils/generalFormatter';
import { table_col_arrow_sort_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { handleSortBalMonthlyReport, handleSortWithPaginate, sortOnPagenationWithPaginate } from "@/utils/sortTable";
import NodataTable from "@/components/other/nodataTable";

interface TableProps {
    openViewForm?: (id: any) => void;
    tableData: any;
    allData: any;
    currentPage: any;
    itemsPerPage: any;
    dataSummary: any;
    isLoading: any;
    columnVisibility: any;
    userPermission?: any;
    areaMaster?: any;
}

const TableReport: React.FC<TableProps> = ({ openViewForm, tableData, allData, currentPage, itemsPerPage, dataSummary, isLoading, columnVisibility, userPermission, areaMaster }) => {
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);

    useEffect(() => {
        if (tableData && tableData.length > 0) {
            setSortedData(tableData);
        } else {
            setSortedData([]);
        }
    }, [tableData]);

    useEffect(() => {
        if (tableData && tableData.length > 0) {
            // tableData =data ที่ทำ pagination มาแล้ว
            // allData = data ทั้งหมด

            // const newData = tableData?.map((item: any) => ({
            //     ...item,
            //     shipper_allocation_review: item?.allocation_management_shipper_review?.[0]?.shipper_allocation_review ?? null
            // }));

            if (sortState?.direction) {
                const col: any = sortState?.column;
                sortOnPagenationWithPaginate(col, sortState, setSortState, setSortedData, allData, itemsPerPage, currentPage)
            } else {
                setSortedData(tableData);
            }
            
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

    return (<>
        <div className="h-[calc(100vh-380px)] overflow-y-auto overflow-x-auto rounded-t-md">
            {/* <table className="min-w-full text-sm text-left rtl:text-right text-gray-500 whitespace-nowrap"> */}
            {
                isLoading ?
                    <table className="table-auto min-w-full text-sm rtl:text-right text-gray-500 whitespace-nowrap">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-9">

                                {columnVisibility.date && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[200px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("gas_day", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Date`}
                                        {getArrowIcon("gas_day")}
                                    </th>
                                )}

                                {columnVisibility.entry_point && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[200px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("Entry Point", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Entry Point (MMBTU)`}
                                        {getArrowIcon("Entry Point")}
                                    </th>
                                )}

                                {columnVisibility.exit_point && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[200px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("Exit", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Exit Point (MMBTU)`}
                                        {getArrowIcon("Exit")}
                                    </th>
                                )}

                                {columnVisibility.entry_exit && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[200px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("Entry - Exit", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Entry - Exit (MMBTU)`}
                                        {getArrowIcon("Entry - Exit")}
                                    </th>
                                )}

                                {columnVisibility.fuel_gas && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[200px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("Fuel Gas", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Fuel Gas (MMBTU)`}
                                        {getArrowIcon("Fuel Gas")}
                                    </th>
                                )}

                                {columnVisibility.balancing_gas && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[200px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("Balancing Gas", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Balancing Gas (MMBTU)`}
                                        {getArrowIcon("Balancing Gas")}
                                    </th>
                                )}

                                {columnVisibility.change_min_inventory && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[270px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("Change Min Inventory", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Change Min Inventory (MMBTU)`}
                                        {getArrowIcon("Change Min Inventory")}
                                    </th>
                                )}

                                {columnVisibility.shrinkagate && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[200px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("Shrinkagate", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Shrinkage (MMBTU)`}
                                        {getArrowIcon("Shrinkagate")}
                                    </th>
                                )}

                                {columnVisibility.commissioning && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[200px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("Commissioning", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Commissioning (MMBTU)`}
                                        {getArrowIcon("Commissioning")}
                                    </th>
                                )}

                                {columnVisibility.gas_vent && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[200px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("Gas Vent", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Gas Vent (MMBTU)`}
                                        {getArrowIcon("Gas Vent")}
                                    </th>
                                )}

                                {columnVisibility.other_gas && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[200px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("Other Gas", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Other Gas (MMBTU)`}
                                        {getArrowIcon("Other Gas")}
                                    </th>
                                )}

                                {columnVisibility.imbalance && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[200px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("Imbalance", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Imbalance (MMBTU)`}
                                        {getArrowIcon("Imbalance")}
                                    </th>
                                )}

                                {columnVisibility.ImbalancePercen && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[200px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("ImbalancePercen", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Imbalance (%)`}
                                        {getArrowIcon("ImbalancePercen")}
                                    </th>
                                )}

                                {columnVisibility.acc_imbalance && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[200px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("Acc. Imbqalance", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Acc. Imbalance (MMBTU)`}
                                        {getArrowIcon("Acc. Imbqalance")}
                                    </th>
                                )}

                                {columnVisibility.min_inventory && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[200px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("Min Inventory", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Min Inventory (MMBTU)`}
                                        {getArrowIcon("Min Inventory")}
                                    </th>
                                )}

                                {/* // เพิ่ม column Instructed flow แยกออกมา https://app.clickup.com/t/86ev5f77j */}
                                {columnVisibility.instructed_flow && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[200px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("Instructed Flow", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Instructed Flow (MMBTU)`}
                                        {getArrowIcon("Instructed Flow")}
                                    </th>
                                )}

                            </tr>
                        </thead>

                        <tbody>
                            {sortedData && sortedData?.map((row: any, index: any) => {
                                return (
                                    <tr
                                        key={row?.id}
                                        className={`${table_row_style}`}
                                    >
                                        {columnVisibility.date && (
                                            <td className="px-2 py-1 text-[#464255] text-right">{row?.gas_day ? row?.gas_day : ''}</td>
                                        )}

                                        {columnVisibility.entry_point && (
                                            <td className="px-2 py-1 text-[#464255] text-right">{row["Entry Point"] !== null && row["Entry Point"] !== undefined ? formatNumberFourDecimal(row["Entry Point"]) : ''}</td>
                                        )}

                                        {columnVisibility.exit_point && (
                                            <td className="px-2 py-1 text-[#464255] text-right">{row["Exit"] !== null && row["Exit"] !== undefined ? formatNumberFourDecimal(row["Exit"]) : ''}</td>
                                        )}

                                        {columnVisibility.entry_exit && (
                                            <td className="px-2 py-1 text-[#464255] text-right">{row["Entry - Exit"] !== null && row["Entry - Exit"] !== undefined ? formatNumberFourDecimal(row["Entry - Exit"]) : ''}</td>
                                        )}

                                        {columnVisibility.fuel_gas && (
                                            <td className="px-2 py-1 text-[#464255] text-right">{row["Fuel Gas"] !== null && row["Fuel Gas"] !== undefined ? formatNumberFourDecimal(row["Fuel Gas"]) : ''}</td>
                                        )}

                                        {columnVisibility.balancing_gas && (
                                            <td className="px-2 py-1 text-[#464255] text-right">{row["Balancing Gas"] !== null && row["Balancing Gas"] !== undefined ? formatNumberFourDecimal(row["Balancing Gas"]) : ''}</td>
                                        )}

                                        {columnVisibility.change_min_inventory && (
                                            <td className="px-2 py-1 text-[#464255] text-right">{row["Change Min Inventory"] !== null && row["Change Min Inventory"] !== undefined ? formatNumberFourDecimal(row["Change Min Inventory"]) : ''}</td>
                                        )}

                                        {columnVisibility.shrinkagate && (
                                            <td className="px-2 py-1 text-[#464255] text-right">{row["Shrinkagate"] !== null && row["Shrinkagate"] !== undefined ? formatNumberFourDecimal(row["Shrinkagate"]) : ''}</td>
                                        )}

                                        {columnVisibility.commissioning && (
                                            <td className="px-2 py-1 text-[#464255] text-right">{row["Commissioning"] !== null && row["Commissioning"] !== undefined ? formatNumberFourDecimal(row["Commissioning"]) : ''}</td>
                                        )}

                                        {columnVisibility.gas_vent && (
                                            <td className="px-2 py-1 text-[#464255] text-right">{row["Gas Vent"] !== null && row["Gas Vent"] !== undefined ? formatNumberFourDecimal(row["Gas Vent"]) : ''}</td>
                                        )}

                                        {columnVisibility.other_gas && (
                                            <td className="px-2 py-1 text-[#464255] text-right">{row["Other Gas"] !== null && row["Other Gas"] !== undefined ? formatNumberFourDecimal(row["Other Gas"]) : ''}</td>
                                        )}

                                        {columnVisibility.imbalance && (
                                            <td className="px-2 py-1 text-[#464255] text-right">{row["Imbalance"] !== null && row["Imbalance"] !== undefined ? formatNumberFourDecimal(row["Imbalance"]) : ''}</td>
                                        )}

                                        {columnVisibility.ImbalancePercen && (
                                            <td className="px-2 py-1 text-[#464255] text-right">{row["ImbalancePercen"] !== null && row["ImbalancePercen"] !== undefined ? formatNumberFourDecimal(row["ImbalancePercen"]) : ''}</td>
                                        )}

                                        {columnVisibility.acc_imbalance && (
                                            <td className="px-2 py-1 text-[#464255] text-right">{row["Acc. Imbqalance"] !== null && row["Acc. Imbqalance"] !== undefined ? formatNumberFourDecimal(row["Acc. Imbqalance"]) : ''}</td>
                                        )}

                                        {columnVisibility.min_inventory && (
                                            <td className="px-2 py-1 text-[#464255] text-right">{row["Min Inventory"] !== null && row["Min Inventory"] !== undefined ? formatNumberFourDecimal(row["Min Inventory"]) : ''}</td>
                                        )}

                                        {columnVisibility.instructed_flow && (
                                            <td className="px-2 py-1 text-[#464255] text-right">{row["Instructed Flow"] !== null && row["Instructed Flow"] !== undefined ? formatNumberFourDecimal(row["Instructed Flow"]) : ''}</td>
                                        )}

                                    </tr>
                                )

                            })}

                            {dataSummary && typeof dataSummary === 'object' && Object.keys(dataSummary).length > 0 &&
                                <tr
                                    key={'summary'}
                                    className={`border-b h-12 bg-[#E8FFEE]`}
                                >
                                    {columnVisibility.date && (
                                        <td className="px-2 py-1 text-[#06522E] font-semibold text-right">{`SUM`}</td>
                                    )}

                                    {columnVisibility.entry_point && (
                                        <td className="px-2 py-1 text-[#06522E] font-semibold text-right">{dataSummary?.value["Entry Point"] !== null && dataSummary?.value["Entry Point"] !== undefined ? formatNumberFourDecimal(dataSummary?.value["Entry Point"]) : ''}</td>
                                    )}

                                    {columnVisibility.exit_point && (
                                        <td className="px-2 py-1 text-[#06522E] font-semibold text-right">{dataSummary?.value["Exit"] !== null && dataSummary?.value["Exit"] !== undefined ? formatNumberFourDecimal(dataSummary?.value["Exit"]) : ''}</td>
                                    )}

                                    {columnVisibility.entry_exit && (
                                        <td className="px-2 py-1 text-[#06522E] font-semibold text-right">{dataSummary?.value["Entry - Exit"] !== null && dataSummary?.value["Entry - Exit"] !== undefined ? formatNumberFourDecimal(dataSummary?.value["Entry - Exit"]) : ''}</td>
                                    )}

                                    {columnVisibility.fuel_gas && (
                                        <td className="px-2 py-1 text-[#06522E] font-semibold text-right">{dataSummary?.value["Fuel Gas"] !== null && dataSummary?.value["Fuel Gas"] !== undefined ? formatNumberFourDecimal(dataSummary?.value["Fuel Gas"]) : ''}</td>
                                    )}

                                    {columnVisibility.balancing_gas && (
                                        <td className="px-2 py-1 text-[#06522E] font-semibold text-right">{dataSummary?.value["Balancing Gas"] !== null && dataSummary?.value["Balancing Gas"] !== undefined ? formatNumberFourDecimal(dataSummary?.value["Balancing Gas"]) : ''}</td>
                                    )}

                                    {columnVisibility.change_min_inventory && (
                                        <td className="px-2 py-1 text-[#06522E] font-semibold text-right">{dataSummary?.value["Change Min Inventory"] !== null && dataSummary?.value["Change Min Inventory"] !== undefined ? formatNumberFourDecimal(dataSummary?.value["Change Min Inventory"]) : ''}</td>
                                    )}

                                    {columnVisibility.shrinkagate && (
                                        <td className="px-2 py-1 text-[#06522E] font-semibold text-right">{dataSummary?.value["Shrinkagate"] !== null && dataSummary?.value["Shrinkagate"] !== undefined ? formatNumberFourDecimal(dataSummary?.value["Shrinkagate"]) : ''}</td>
                                    )}

                                    {columnVisibility.commissioning && (
                                        <td className="px-2 py-1 text-[#06522E] font-semibold text-right">{dataSummary?.value["Commissioning"] !== null && dataSummary?.value["Commissioning"] !== undefined ? formatNumberFourDecimal(dataSummary?.value["Commissioning"]) : ''}</td>
                                    )}

                                    {columnVisibility.gas_vent && (
                                        <td className="px-2 py-1 text-[#06522E] font-semibold text-right">{dataSummary?.value["Gas Vent"] !== null && dataSummary?.value["Gas Vent"] !== undefined ? formatNumberFourDecimal(dataSummary?.value["Gas Vent"]) : ''}</td>
                                    )}

                                    {columnVisibility.other_gas && (
                                        <td className="px-2 py-1 text-[#06522E] font-semibold text-right">{dataSummary?.value["Other Gas"] !== null && dataSummary?.value["Other Gas"] !== undefined ? formatNumberFourDecimal(dataSummary?.value["Other Gas"]) : ''}</td>
                                    )}

                                    {columnVisibility.imbalance && (
                                        <td className="px-2 py-1 text-[#06522E] font-semibold text-right">{dataSummary?.value["Imbalance"] !== null && dataSummary?.value["Imbalance"] !== undefined ? formatNumberFourDecimal(dataSummary?.value["Imbalance"]) : ''}</td>
                                    )}

                                    {columnVisibility.ImbalancePercen && (
                                        <td className="px-2 py-1 text-[#06522E] font-semibold text-right">{dataSummary?.value["ImbalancePercen"] !== null && dataSummary?.value["ImbalancePercen"] !== undefined ? formatNumberFourDecimal(dataSummary?.value["ImbalancePercen"]) : ''}</td>
                                    )}

                                    {columnVisibility.acc_imbalance && (
                                        <td className="px-2 py-1 text-[#06522E] font-semibold text-right">{dataSummary?.value["Acc. Imbqalance"] !== null && dataSummary?.value["Acc. Imbqalance"] !== undefined ? formatNumberFourDecimal(dataSummary?.value["Acc. Imbqalance"]) : ''}</td>
                                    )}

                                    {columnVisibility.min_inventory && (
                                        <td className="px-2 py-1 text-[#06522E] font-semibold text-right">{dataSummary?.value["Min Inventory"] !== null && dataSummary?.value["Min Inventory"] !== undefined ? formatNumberFourDecimal(dataSummary?.value["Min Inventory"]) : ''}</td>
                                    )}

                                    {columnVisibility.instructed_flow && (
                                        <td className="px-2 py-1 text-[#06522E] font-semibold text-right">{dataSummary?.value["Instructed Flow"] !== null && dataSummary?.value["Instructed Flow"] !== undefined ? formatNumberFourDecimal(dataSummary?.value["Instructed Flow"]) : ''}</td>
                                    )}
                                </tr>
                            }
                        </tbody>

                    </table>
                    :
                    <TableSkeleton />
            }

            {
                isLoading && sortedData?.length <= 0 && <NodataTable />
            }
        </div>
    </>
    )
}

export default TableReport;