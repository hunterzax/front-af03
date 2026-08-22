import { useCallback, useEffect } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatNumberFourDecimal } from '@/utils/generalFormatter';
import { table_col_arrow_sort_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { handleSortBalMonthlyReport, handleSortWithPaginate, sortOnPagenationWithPaginate } from "@/utils/sortTable";
import NodataTable from "@/components/other/nodataTable";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

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

const TableReportExpanded: React.FC<TableProps> = ({ openViewForm, tableData, allData, currentPage, itemsPerPage, dataSummary, isLoading, columnVisibility, userPermission, areaMaster }) => {
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
                // sortOnPagenation(col, sortState, setSortState, setSortedData, newData)
                sortOnPagenationWithPaginate(col, sortState, setSortState, setSortedData, allData, itemsPerPage, currentPage)
            } else {
                // setSortedData(newData);
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

    // expand เร็ว: ใช้ Set
    const [expandedDay, setExpandedDay] = useState<Set<string>>(new Set());

    const toggleExpandDay = useCallback((day: string) => {
        setExpandedDay((prev) => {
            const next = new Set(prev);
            next.has(day) ? next.delete(day) : next.add(day);
            return next;
        });
    }, []);

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
                                        onClick={() => handleSortBalMonthlyReport("day", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Date`}
                                        {getArrowIcon("day")}
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
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[250px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("Balancing Gas", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Balancing Gas (MMBTU)`}
                                        {getArrowIcon("Balancing Gas")}
                                    </th>
                                )}

                                {columnVisibility.change_min_inventory && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[300px] text-center`}
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
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[250px] text-center`}
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
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[250px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("Acc. Imbqalance", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Acc. Imbalance (MMBTU)`}
                                        {getArrowIcon("Acc. Imbqalance")}
                                    </th>
                                )}

                                {columnVisibility.min_inventory && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[250px] text-center`}
                                        onClick={() => handleSortBalMonthlyReport("Min Inventory", sortState, setSortState, setSortedData, allData, currentPage, itemsPerPage)}
                                    >
                                        {`Min Inventory (MMBTU)`}
                                        {getArrowIcon("Min Inventory")}
                                    </th>
                                )}

                                {/* // เพิ่ม column Instructed flow แยกออกมา https://app.clickup.com/t/86ev5f77j */}
                                {columnVisibility.instructed_flow && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} min-w-[120px] max-w-[250px] text-center`}
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
                                const day = row?.day;
                                const sum = row?.sum ?? {};
                                const val = row?.value;
                                const isExpanded = expandedDay.has(day);

                                const columnsCount = Object.values(columnVisibility).filter(Boolean).length;

                                return (
                                    <React.Fragment key={day}>
                                        {/* ----- GREEN ROW: Total Area ----- */}
                                        <tr className={`${table_row_style} !bg-[#E8FFEE] cursor-pointer`} onClick={() => toggleExpandDay(day)}>
                                            {columnVisibility.date && (
                                                <td className="px-2 py-1 text-[#06522E] font-bold">
                                                    {isExpanded ? (
                                                        <ExpandLessIcon sx={{ fontSize: "25px", color: "#06522E" }} />
                                                    ) : (
                                                        <ExpandMoreIcon sx={{ fontSize: "25px", color: "#06522E" }} />
                                                    )}
                                                    {day}
                                                </td>
                                            )}

                                            {columnVisibility.entry_point && (
                                                <td className="px-2 py-1 text-[#464255] text-right">{sum["Entry Point"] !== null && sum["Entry Point"] !== undefined ? formatNumberFourDecimal(sum["Entry Point"]) : ''}</td>
                                            )}

                                            {columnVisibility.exit_point && (
                                                <td className="px-2 py-1 text-[#464255] text-right">{sum["Exit"] !== null && sum["Exit"] !== undefined ? formatNumberFourDecimal(sum["Exit"]) : ''}</td>
                                            )}

                                            {columnVisibility.entry_exit && (
                                                <td className="px-2 py-1 text-[#464255] text-right">{sum["Entry - Exit"] !== null && sum["Entry - Exit"] !== undefined ? formatNumberFourDecimal(sum["Entry - Exit"]) : ''}</td>
                                            )}

                                            {columnVisibility.fuel_gas && (
                                                <td className="px-2 py-1 text-[#464255] text-right">{sum["Fuel Gas"] !== null && sum["Fuel Gas"] !== undefined ? formatNumberFourDecimal(sum["Fuel Gas"]) : ''}</td>
                                            )}

                                            {columnVisibility.balancing_gas && (
                                                <td className="px-2 py-1 text-[#464255] text-right">{sum["Balancing Gas"] !== null && sum["Balancing Gas"] !== undefined ? formatNumberFourDecimal(sum["Balancing Gas"]) : ''}</td>
                                            )}

                                            {columnVisibility.change_min_inventory && (
                                                <td className="px-2 py-1 text-[#464255] text-right">{sum["Change Min Inventory"] !== null && sum["Change Min Inventory"] !== undefined ? formatNumberFourDecimal(sum["Change Min Inventory"]) : ''}</td>
                                            )}

                                            {columnVisibility.shrinkagate && (
                                                <td className="px-2 py-1 text-[#464255] text-right">{sum["Shrinkagate"] !== null && sum["Shrinkagate"] !== undefined ? formatNumberFourDecimal(sum["Shrinkagate"]) : ''}</td>
                                            )}

                                            {columnVisibility.commissioning && (
                                                <td className="px-2 py-1 text-[#464255] text-right">{sum["Commissioning"] !== null && sum["Commissioning"] !== undefined ? formatNumberFourDecimal(sum["Commissioning"]) : ''}</td>
                                            )}

                                            {columnVisibility.gas_vent && (
                                                <td className="px-2 py-1 text-[#464255] text-right">{sum["Gas Vent"] !== null && sum["Gas Vent"] !== undefined ? formatNumberFourDecimal(sum["Gas Vent"]) : ''}</td>
                                            )}

                                            {columnVisibility.other_gas && (
                                                <td className="px-2 py-1 text-[#464255] text-right">{sum["Other Gas"] !== null && sum["Other Gas"] !== undefined ? formatNumberFourDecimal(sum["Other Gas"]) : ''}</td>
                                            )}

                                            {columnVisibility.imbalance && (
                                                <td className="px-2 py-1 text-[#464255] text-right">{sum["Imbalance"] !== null && sum["Imbalance"] !== undefined ? formatNumberFourDecimal(sum["Imbalance"]) : ''}</td>
                                            )}

                                            {columnVisibility.ImbalancePercen && (
                                                <td className="px-2 py-1 text-[#464255] text-right">{sum["ImbalancePercen"] !== null && sum["ImbalancePercen"] !== undefined ? formatNumberFourDecimal(sum["ImbalancePercen"]) : ''}</td>
                                            )}

                                            {columnVisibility.acc_imbalance && (
                                                <td className="px-2 py-1 text-[#464255] text-right">{sum["Acc. Imbqalance"] !== null && sum["Acc. Imbqalance"] !== undefined ? formatNumberFourDecimal(sum["Acc. Imbqalance"]) : ''}</td>
                                            )}

                                            {columnVisibility.min_inventory && (
                                                <td className="px-2 py-1 text-[#464255] text-right">{sum["Min Inventory"] !== null && sum["Min Inventory"] !== undefined ? formatNumberFourDecimal(sum["Min Inventory"]) : ''}</td>
                                            )}

                                            {columnVisibility.instructed_flow && (
                                                <td className="px-2 py-1 text-[#464255] text-right">{sum["Instructed Flow"] !== null && sum["Instructed Flow"] !== undefined ? formatNumberFourDecimal(sum["Instructed Flow"]) : ''}</td>
                                            )}
                                        </tr>

                                        {isExpanded && val?.length > 0 ?
                                            val?.map((item: any) => {
                                                const data = item?.data ?? {};
                                                return (
                                                    <React.Fragment key={`${day}_${item?.key}`}>
                                                        <tr>
                                                            {/* <td className="px-2 py-1 text-[#464255]" /> */}
                                                            {columnVisibility.date && (
                                                                <td className="px-2 py-1 text-[#464255] text-left border-r border-gray-300">{item?.key !== null && item?.key !== undefined ? item.key : ''}</td>
                                                            )}

                                                            {columnVisibility.entry_point && (
                                                                <td className="px-2 py-1 text-[#464255] text-right border-r border-gray-300">{data["Entry Point"] !== null && data["Entry Point"] !== undefined ? formatNumberFourDecimal(data["Entry Point"]) : ''}</td>
                                                            )}

                                                            {columnVisibility.exit_point && (
                                                                <td className="px-2 py-1 text-[#464255] text-right border-r border-gray-300">{data["Exit"] !== null && data["Exit"] !== undefined ? formatNumberFourDecimal(data["Exit"]) : ''}</td>
                                                            )}

                                                            {columnVisibility.entry_exit && (
                                                                <td className="px-2 py-1 text-[#464255] text-right border-r border-gray-300">{data["Entry - Exit"] !== null && data["Entry - Exit"] !== undefined ? formatNumberFourDecimal(data["Entry - Exit"]) : ''}</td>
                                                            )}

                                                            {columnVisibility.fuel_gas && (
                                                                <td className="px-2 py-1 text-[#464255] text-right border-r border-gray-300">{data["Fuel Gas"] !== null && data["Fuel Gas"] !== undefined ? formatNumberFourDecimal(data["Fuel Gas"]) : ''}</td>
                                                            )}

                                                            {columnVisibility.balancing_gas && (
                                                                <td className="px-2 py-1 text-[#464255] text-right border-r border-gray-300">{data["Balancing Gas"] !== null && data["Balancing Gas"] !== undefined ? formatNumberFourDecimal(data["Balancing Gas"]) : ''}</td>
                                                            )}

                                                            {columnVisibility.change_min_inventory && (
                                                                <td className="px-2 py-1 text-[#464255] text-right border-r border-gray-300">{data["Change Min Inventory"] !== null && data["Change Min Inventory"] !== undefined ? formatNumberFourDecimal(data["Change Min Inventory"]) : ''}</td>
                                                            )}

                                                            {columnVisibility.shrinkagate && (
                                                                <td className="px-2 py-1 text-[#464255] text-right border-r border-gray-300">{data["Shrinkagate"] !== null && data["Shrinkagate"] !== undefined ? formatNumberFourDecimal(data["Shrinkagate"]) : ''}</td>
                                                            )}

                                                            {columnVisibility.commissioning && (
                                                                <td className="px-2 py-1 text-[#464255] text-right border-r border-gray-300">{data["Commissioning"] !== null && data["Commissioning"] !== undefined ? formatNumberFourDecimal(data["Commissioning"]) : ''}</td>
                                                            )}

                                                            {columnVisibility.gas_vent && (
                                                                <td className="px-2 py-1 text-[#464255] text-right border-r border-gray-300">{data["Gas Vent"] !== null && data["Gas Vent"] !== undefined ? formatNumberFourDecimal(data["Gas Vent"]) : ''}</td>
                                                            )}

                                                            {columnVisibility.other_gas && (
                                                                <td className="px-2 py-1 text-[#464255] text-right border-r border-gray-300">{data["Other Gas"] !== null && data["Other Gas"] !== undefined ? formatNumberFourDecimal(data["Other Gas"]) : ''}</td>
                                                            )}

                                                            {columnVisibility.imbalance && (
                                                                <td className="px-2 py-1 text-[#464255] text-right border-r border-gray-300">{data["Imbalance"] !== null && data["Imbalance"] !== undefined ? formatNumberFourDecimal(data["Imbalance"]) : ''}</td>
                                                            )}

                                                            {columnVisibility.ImbalancePercen && (
                                                                <td className="px-2 py-1 text-[#464255] text-right border-r border-gray-300">{data["ImbalancePercen"] !== null && data["ImbalancePercen"] !== undefined ? formatNumberFourDecimal(data["ImbalancePercen"]) : ''}</td>
                                                            )}

                                                            {columnVisibility.acc_imbalance && (
                                                                <td className="px-2 py-1 text-[#464255] text-right border-r border-gray-300">{data["Acc. Imbqalance"] !== null && data["Acc. Imbqalance"] !== undefined ? formatNumberFourDecimal(data["Acc. Imbqalance"]) : ''}</td>
                                                            )}

                                                            {columnVisibility.min_inventory && (
                                                                <td className="px-2 py-1 text-[#464255] text-right border-r border-gray-300">{data["Min Inventory"] !== null && data["Min Inventory"] !== undefined ? formatNumberFourDecimal(data["Min Inventory"]) : ''}</td>
                                                            )}

                                                            {columnVisibility.instructed_flow && (
                                                                <td className="px-2 py-1 text-[#464255] text-right border-r border-gray-300">{data["Instructed Flow"] !== null && data["Instructed Flow"] !== undefined ? formatNumberFourDecimal(data["Instructed Flow"]) : ''}</td>
                                                            )}
                                                        </tr>
                                                    </React.Fragment>
                                                )
                                            })
                                            :
                                            isExpanded && val?.length == 0 && (
                                                <td
                                                    colSpan={columnsCount}
                                                    className="px-3 py-4 bg-gray-50"
                                                >
                                                    <div className="flex items-center justify-center">
                                                        No data.
                                                    </div>
                                                </td>
                                            )
                                        }
                                    </React.Fragment>
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

export default TableReportExpanded;