import { useEffect, useRef } from "react";
import React, { FC, useState } from 'react';
import TableSkeleton, { DefaultSkeleton } from '@/components/material_custom/DefaultSkeleton';
import { formatDateYyyyMmDd, formatNumberThreeDecimal, getCurrentWeekSundayYyyyMmDd, getNextWeekSundayYyyyMmDd, toDayjs } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import NodataTable from "@/components/other/nodataTable";

interface TableProps {
    tableData: any;
    isLoading: any;
    isSearch: any;
    isResetSearch?: any;
    setIsResetSearch?: any;
    tabIndex: any;
    columnVisibility: any;
    gasWeekFilter?: any;
    oldGasWeekFilter?: any;
    userPermission?: any;
    setIsLoading?: any;
}

const TableNomQualityPlanningWeekly: React.FC<TableProps> = ({ tableData, isLoading, isSearch, tabIndex, columnVisibility, userPermission, gasWeekFilter, oldGasWeekFilter, isResetSearch, setIsResetSearch, setIsLoading }) => {

    const [sortState, setSortState] = useState({ column: null, direction: null });
    // const [sortedData, setSortedData] = useState(tableData);
    const [sortedData, setSortedData] = useState([]);
    const [dataForSortFunction, setDataForSortFunction] = useState([]);


    // let date_next_sunday = gasWeekFilter && isSearch ? formatDateYyyyMmDd(gasWeekFilter) : getNextWeekSundayYyyyMmDd()
    let date_next_sunday = gasWeekFilter && isSearch ? formatDateYyyyMmDd(gasWeekFilter) : oldGasWeekFilter && !isResetSearch ? formatDateYyyyMmDd(oldGasWeekFilter) : getCurrentWeekSundayYyyyMmDd()

    const dayMapping = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // useEffect(() => {
    //     if (tableData && tableData.length > 0) {
    //         setSortedData(tableData);
    //     }
    //     setSortedData(tableData);
    // }, [tableData]);

    useEffect(() => {
        if (tableData && tableData.length > 0) {
            let filteredData = tableData.filter((item: any) =>
                toDayjs(item.sunday?.date, "DD/MM/YYYY").format("YYYY-MM-DD") === date_next_sunday
            );
            setSortedData(filteredData);
            setDataForSortFunction(filteredData)
            // setIsLoading(true)
        }
    }, [tableData]);

    useEffect(() => {
        if (tableData && tableData.length > 0) {
            let filteredData = tableData.filter((item: any) =>
                toDayjs(item.sunday?.date, "DD/MM/YYYY").format("YYYY-MM-DD") === date_next_sunday
            );
            setSortedData(filteredData);
            setDataForSortFunction(filteredData)
        }
        // setSortedData(tableData);
    }, [date_next_sunday]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    return (
        <div className={`relative h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md z-1`}>

            {
                isLoading ?
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-20">

                                {columnVisibility.zone && (
                                    <th scope="col" className={`${table_sort_header_style} text-center !min-w-[100px] !max-w-[150px]`} onClick={() => handleSort("zone.name", sortState, setSortState, setSortedData, dataForSortFunction)}>
                                        {`Zone`}
                                        {getArrowIcon("zone.name")}
                                    </th>
                                )}

                                {columnVisibility.area && (
                                    <th scope="col" className={`${table_sort_header_style} text-center !min-w-[100px] !max-w-[150px]`} onClick={() => handleSort("area.name", sortState, setSortState, setSortedData, dataForSortFunction)}>
                                        {`Area`}
                                        {getArrowIcon("area.name")}
                                    </th>
                                )}

                                {columnVisibility.parameter && (
                                    <th scope="col" className={`${table_sort_header_style} text-center !min-w-[100px] !max-w-[150px]`}
                                        onClick={() => handleSort("parameter", sortState, setSortState, setSortedData, dataForSortFunction)}
                                    >
                                        {`Parameter`}
                                        {getArrowIcon("parameter")}
                                    </th>
                                )}

                                {dayMapping.map((day, index) => {
                                    const formattedDate = toDayjs(date_next_sunday).add(index, "day").format("DD/MM/YYYY");
                                    const columnKey = day.toLowerCase();

                                    return columnVisibility[columnKey] ? (
                                        <th
                                            key={day}
                                            scope="col"
                                            className={`${table_sort_header_style} text-center !min-w-[200px] !max-w-[250px]`}
                                            onClick={() => handleSort(`${day.toLowerCase() + '.value'}`, sortState, setSortState, setSortedData, dataForSortFunction)}
                                        >
                                            <div>{day}</div>
                                            <div>{formattedDate}</div>
                                            {getArrowIcon(`${day.toLowerCase() + '.value'}`)}
                                        </th>
                                    ) : null;
                                })}

                            </tr>
                        </thead>

                        <tbody>
                            {sortedData && sortedData?.map((row: any, index: any) => (
                                <tr
                                    key={row?.gasday + '_' + index}
                                    className={`${table_row_style}`}
                                >

                                    {columnVisibility.zone && (
                                        <td className="px-2 py-1  justify-center ">{row?.zone && <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.zone?.color }}>{`${row?.zone?.name}`}</div>}</td>
                                    )}

                                    {columnVisibility.area && (
                                        <td className="px-2 py-1 justify-center ">
                                            {
                                                row?.area?.entry_exit_id == 2 ?
                                                    <div
                                                        className="flex justify-center items-center rounded-full p-1 text-[#464255]"
                                                        style={{ backgroundColor: row?.area?.color, width: '40px', height: '40px' }}
                                                    >
                                                        {`${row?.area?.name}`}
                                                    </div>
                                                    :
                                                    <div
                                                        className="flex justify-center items-center rounded-lg p-1 text-[#464255]"
                                                        style={{ backgroundColor: row?.area?.color, width: '40px', height: '40px' }}
                                                    >
                                                        {`${row?.area?.name}`}
                                                    </div>
                                            }
                                        </td>
                                    )}

                                    {columnVisibility.parameter && (
                                        <td className="px-2 py-1 text-[#464255]">{row?.parameter ? row?.parameter : ''}</td>
                                    )}

                                    {/* {columnVisibility.sunday && (
                                        <td className={`px-2 py-1 text-[#464255] text-right `}>
                                            {
                                                row?.sunday?.value ? formatNumberThreeDecimal(row?.sunday?.value) : ''
                                            }
                                        </td>
                                    )}

                                    {columnVisibility.tuesday && (
                                        <td className={`px-2 py-1 text-[#464255] text-right `}>
                                            {
                                                row?.tuesday?.value ? formatNumberThreeDecimal(row?.tuesday?.value) : ''
                                            }
                                        </td>
                                    )}

                                    {columnVisibility.wednesday && (
                                        <td className={`px-2 py-1 text-[#464255] text-right `}>
                                            {
                                                row?.wednesday?.value ? formatNumberThreeDecimal(row?.wednesday?.value) : ''
                                            }
                                        </td>
                                    )}

                                    {columnVisibility.thursday && (
                                        <td className={`px-2 py-1 text-[#464255] text-right `}>
                                            {
                                                row?.thursday?.value ? formatNumberThreeDecimal(row?.thursday?.value) : ''
                                            }
                                        </td>
                                    )}

                                    {columnVisibility.friday && (
                                        <td className={`px-2 py-1 text-[#464255] text-right `}>
                                            {
                                                row?.friday?.value ? formatNumberThreeDecimal(row?.friday?.value) : ''
                                            }
                                        </td>
                                    )}

                                    {columnVisibility.saturday && (
                                        <td className={`px-2 py-1 text-[#464255] text-right `}>
                                            {
                                                row?.saturday?.value ? formatNumberThreeDecimal(row?.saturday?.value) : ''
                                            }
                                        </td>
                                    )} */}

                                    {/* --------------------------------------------------------------- */}

                                    {columnVisibility.sunday && (
                                        <td className={`px-2 py-1 text-right 
                                                                                ${(row?.parameter === "HV" && (row?.sunday?.value < row?.zone?.zone_master_quality?.[0]?.v2_sat_heating_value_min || row?.sunday?.value > row?.zone?.zone_master_quality?.[0]?.v2_sat_heating_value_max)) ||
                                                (row?.parameter === "WI" && (row?.sunday?.value < row?.zone?.zone_master_quality?.[0]?.v2_wobbe_index_min || row?.sunday?.value > row?.zone?.zone_master_quality?.[0]?.v2_wobbe_index_max))
                                                ? "text-[#ED1B24]" : "text-[#464255]"}`}>
                                            {
                                                row?.sunday?.value ? formatNumberThreeDecimal(row?.sunday?.value) : ''
                                            }
                                        </td>
                                    )}

                                    {columnVisibility.monday && (
                                        <td className={`px-2 py-1 text-right 
                                                                                ${(row?.parameter === "HV" && (row?.monday?.value < row?.zone?.zone_master_quality?.[0]?.v2_sat_heating_value_min || row?.monday?.value > row?.zone?.zone_master_quality?.[0]?.v2_sat_heating_value_max)) ||
                                                (row?.parameter === "WI" && (row?.monday?.value < row?.zone?.zone_master_quality?.[0]?.v2_wobbe_index_min || row?.monday?.value > row?.zone?.zone_master_quality?.[0]?.v2_wobbe_index_max))
                                                ? "text-[#ED1B24]" : "text-[#464255]"}`}>
                                            {
                                                row?.monday?.value ? formatNumberThreeDecimal(row?.monday?.value) : ''
                                            }
                                        </td>
                                    )}

                                    {columnVisibility.tuesday && (
                                        <td className={`px-2 py-1 text-right 
                                                                                ${(row?.parameter === "HV" && (row?.tuesday?.value < row?.zone?.zone_master_quality?.[0]?.v2_sat_heating_value_min || row?.tuesday?.value > row?.zone?.zone_master_quality?.[0]?.v2_sat_heating_value_max)) ||
                                                (row?.parameter === "WI" && (row?.tuesday?.value < row?.zone?.zone_master_quality?.[0]?.v2_wobbe_index_min || row?.tuesday?.value > row?.zone?.zone_master_quality?.[0]?.v2_wobbe_index_max))
                                                ? "text-[#ED1B24]" : "text-[#464255]"}`}>
                                            {
                                                row?.tuesday?.value ? formatNumberThreeDecimal(row?.tuesday?.value) : ''
                                            }
                                        </td>
                                    )}

                                    {columnVisibility.wednesday && (
                                        <td className={`px-2 py-1 text-right 
                                                                                ${(row?.parameter === "HV" && (row?.wednesday?.value < row?.zone?.zone_master_quality?.[0]?.v2_sat_heating_value_min || row?.wednesday?.value > row?.zone?.zone_master_quality?.[0]?.v2_sat_heating_value_max)) ||
                                                (row?.parameter === "WI" && (row?.wednesday?.value < row?.zone?.zone_master_quality?.[0]?.v2_wobbe_index_min || row?.wednesday?.value > row?.zone?.zone_master_quality?.[0]?.v2_wobbe_index_max))
                                                ? "text-[#ED1B24]" : "text-[#464255]"}`}>
                                            {
                                                row?.wednesday?.value ? formatNumberThreeDecimal(row?.wednesday?.value) : ''
                                            }
                                        </td>
                                    )}

                                    {columnVisibility.thursday && (
                                        <td className={`px-2 py-1 text-right 
                                                                                ${(row?.parameter === "HV" && (row?.thursday?.value < row?.zone?.zone_master_quality?.[0]?.v2_sat_heating_value_min || row?.thursday?.value > row?.zone?.zone_master_quality?.[0]?.v2_sat_heating_value_max)) ||
                                                (row?.parameter === "WI" && (row?.thursday?.value < row?.zone?.zone_master_quality?.[0]?.v2_wobbe_index_min || row?.thursday?.value > row?.zone?.zone_master_quality?.[0]?.v2_wobbe_index_max))
                                                ? "text-[#ED1B24]" : "text-[#464255]"}`}>
                                            {
                                                row?.thursday?.value ? formatNumberThreeDecimal(row?.thursday?.value) : ''
                                            }
                                        </td>
                                    )}

                                    {columnVisibility.friday && (
                                        <td className={`px-2 py-1 text-right 
                                                                                ${(row?.parameter === "HV" && (row?.friday?.value < row?.zone?.zone_master_quality?.[0]?.v2_sat_heating_value_min || row?.friday?.value > row?.zone?.zone_master_quality?.[0]?.v2_sat_heating_value_max)) ||
                                                (row?.parameter === "WI" && (row?.friday?.value < row?.zone?.zone_master_quality?.[0]?.v2_wobbe_index_min || row?.friday?.value > row?.zone?.zone_master_quality?.[0]?.v2_wobbe_index_max))
                                                ? "text-[#ED1B24]" : "text-[#464255]"}`}>
                                            {
                                                row?.friday?.value ? formatNumberThreeDecimal(row?.friday?.value) : ''
                                            }
                                        </td>
                                    )}

                                    {columnVisibility.saturday && (
                                        <td className={`px-2 py-1 text-right 
                                                                                ${(row?.parameter === "HV" && (row?.saturday?.value < row?.zone?.zone_master_quality?.[0]?.v2_sat_heating_value_min || row?.saturday?.value > row?.zone?.zone_master_quality?.[0]?.v2_sat_heating_value_max)) ||
                                                (row?.parameter === "WI" && (row?.saturday?.value < row?.zone?.zone_master_quality?.[0]?.v2_wobbe_index_min || row?.saturday?.value > row?.zone?.zone_master_quality?.[0]?.v2_wobbe_index_max))
                                                ? "text-[#ED1B24]" : "text-[#464255]"}`}>
                                            {
                                                row?.saturday?.value ? formatNumberThreeDecimal(row?.saturday?.value) : ''
                                            }
                                        </td>
                                    )}

                                </tr>
                            ))}
                        </tbody>
                    </table>
                    :
                    <TableSkeleton />
            }

            {
                isLoading && sortedData?.length <= 0 && <NodataTable />
            }

        </div>
    )
}

export default TableNomQualityPlanningWeekly;