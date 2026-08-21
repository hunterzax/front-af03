import { useEffect, useRef } from "react";
import React, { FC, useState } from 'react';
import TableSkeleton, { DefaultSkeleton } from '@/components/material_custom/DefaultSkeleton';
import { formatDateNoTime, formatNumberThreeDecimal, getContrastTextColor } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort, handleSortGasDay } from "@/utils/sortTable";
import NodataTable from "@/components/other/nodataTable";

const TableIntraday: React.FC<any> = ({ tableData, columnVisibility, subTabIndex, isLoading, userPermission, tabEntry }) => {
    const [sortedData, setSortedData] = useState<any>([]);

    // useEffect(() => {
    //     setSortedData(tabEntry);
    // }, [tabEntry])

    useEffect(() => {
        setSortedData(tableData);
    }, [tableData])

    // query_shipper_nomination_type_id == 1 || type 1 คือ tab entry/exit || type 2, 4, 5 tab concept
    // 1 = columnPointId
    // 2 = columnPointIdConcept
    // 3 = columnType
    // 4 = columnParkUnparkinstructedFlows
    // 5 = columnWHV
    const [sortState, setSortState] = useState({ column: null, direction: null });

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    const hours = Array.from({ length: 24 }, (_, i) => ({
        key: `h${i + 1}`,
        label: `H${i + 1}`,
        timeRange: `${String(i).padStart(2, "0")}:01 - ${String(i + 1).padStart(2, "0")}:00`
    }));

    const getVisibleHours = () => {
        switch (subTabIndex) {
            case 0: return hours.slice(0, 6);  // H1 - H6
            case 1: return hours.slice(6, 12); // H7 - H12
            case 2: return hours.slice(12, 18); // H13 - H18
            case 3: return hours.slice(18, 24); // H19 - H24
            case 4: return hours; // All hours
            default: return [];
        }
    };

    useEffect(() => {
        getVisibleHours();
    }, [subTabIndex])

    return (
        <div className={`relative h-[calc(100vh-340px)] overflow-y-auto block  rounded-t-md z-1`}>

            {
                isLoading ?
                    <table className={`w-full text-sm text-left rtl:text-right text-gray-500 `}>
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-20">

                                {columnVisibility.gas_day && (
                                    <th scope="col" className={`${table_sort_header_style} text-center max-w-[200px]`} onClick={() => handleSortGasDay("gasday", sortState, setSortState, setSortedData, tableData)}>
                                        {`Gas Day`}
                                        {getArrowIcon("gasday")}
                                    </th>
                                )}

                                {columnVisibility.zone && (
                                    <th scope="col" className={`${table_sort_header_style} text-center !min-w-[120px] !max-w-[200px]`} onClick={() => handleSort("zone.name", sortState, setSortState, setSortedData, tableData)}>
                                        {`Zone`}
                                        {getArrowIcon("zone.name")}
                                    </th>
                                )}

                                {columnVisibility.area && (
                                    <th scope="col" className={`${table_sort_header_style} text-center !min-w-[120px] !max-w-[200px]`} onClick={() => handleSort("area.name", sortState, setSortState, setSortedData, tableData)}>
                                        {`Area`}
                                        {getArrowIcon("area.name")}
                                    </th>
                                )}

                                {columnVisibility.parameter && (
                                    <th scope="col" className={`${table_sort_header_style} text-center !min-w-[120px] !max-w-[200px]`}
                                        onClick={() => handleSort("parameter", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Parameter`}
                                        {getArrowIcon("parameter")}
                                    </th>
                                )}

                                {getVisibleHours().map(({ key, label, timeRange }: any) =>
                                    columnVisibility[key] && (
                                        <th
                                            key={key}
                                            scope="col"
                                            className={`${table_sort_header_style} min-w-[170px] text-center`}
                                            onClick={() => handleSort(key, sortState, setSortState, setSortedData, tableData)}
                                        >
                                            <div>{label}</div>
                                            <div>{timeRange}</div>
                                            {getArrowIcon(key)}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {
                                sortedData?.length > 0 && sortedData?.map((row: any, index: any) => {

                                    return (
                                        <tr
                                            key={row?.id}
                                            className={`${table_row_style}`}
                                        >

                                            {columnVisibility.gas_day && (
                                                // <td className="px-2 py-1 text-[#464255] max-w-[60px]">{row?.gasday ? formatDateNoTime(row?.gasday) : ''}</td>
                                                <td className="px-2 py-1 text-[#464255] max-w-[60px]">{row?.gasday ? row?.gasday : ''}</td>
                                            )}

                                            {columnVisibility.zone && (
                                                <td className="px-2 py-1  justify-center">{row?.zone && <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.zone?.color }}>{`${row?.zone?.name}`}</div>}</td>
                                            )}

                                            {columnVisibility.area && (
                                                <td className="px-2 py-1 justify-center text-center flex ">
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

                                            {columnVisibility.h1 && (subTabIndex == 0 || subTabIndex == 4) && (
                                                // <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["14"]) > parseFloat(row?.newObj?.["14"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                // <td className={`px-2 py-1 text-[#464255] text-right `}>
                                                <td className={`px-2 py-1 text-[#464255] text-right
                                                    ${row?.parameter == "HV" && (row["h1"] > row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_max || row["h1"] < row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_min) && 'text-red-600'}
                                                    ${row?.parameter == "WI" && (row["h1"] > row?.zone?.zone_master_quality[0]?.v2_wobbe_index_max || row["h1"] < row?.zone?.zone_master_quality[0]?.v2_wobbe_index_min) && 'text-red-600'}
                                                `}>
                                                    {
                                                        row["h1"] ? formatNumberThreeDecimal(row["h1"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h2 && (subTabIndex == 0 || subTabIndex == 4) && (
                                                // <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["15"]) > parseFloat(row?.newObj?.["15"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>

                                                // <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                <td className={`px-2 py-1 text-[#464255] text-right
                                                    ${row?.parameter == "HV" && (row["h2"] > row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_max || row["h2"] < row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_min) && 'text-red-600'}
                                                    ${row?.parameter == "WI" && (row["h2"] > row?.zone?.zone_master_quality[0]?.v2_wobbe_index_max || row["h2"] < row?.zone?.zone_master_quality[0]?.v2_wobbe_index_min) && 'text-red-600'}
                                                `}>
                                                    {
                                                        row["h2"] ? formatNumberThreeDecimal(row["h2"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h3 && (subTabIndex == 0 || subTabIndex == 4) && (
                                                // <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["16"]) > parseFloat(row?.newObj?.["16"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                // <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                <td className={`px-2 py-1 text-[#464255] text-right
                                                    ${row?.parameter == "HV" && (row["h3"] > row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_max || row["h3"] < row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_min) && 'text-red-600'}
                                                    ${row?.parameter == "WI" && (row["h3"] > row?.zone?.zone_master_quality[0]?.v2_wobbe_index_max || row["h3"] < row?.zone?.zone_master_quality[0]?.v2_wobbe_index_min) && 'text-red-600'}
                                                `}>
                                                    {
                                                        row["h3"] ? formatNumberThreeDecimal(row["h3"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h4 && (subTabIndex == 0 || subTabIndex == 4) && (
                                                // <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["17"]) > parseFloat(row?.newObj?.["17"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                // <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                <td className={`px-2 py-1 text-[#464255] text-right
                                                    ${row?.parameter == "HV" && (row["h4"] > row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_max || row["h4"] < row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_min) && 'text-red-600'}
                                                    ${row?.parameter == "WI" && (row["h4"] > row?.zone?.zone_master_quality[0]?.v2_wobbe_index_max || row["h4"] < row?.zone?.zone_master_quality[0]?.v2_wobbe_index_min) && 'text-red-600'}
                                                `}>
                                                    {
                                                        row["h4"] ? formatNumberThreeDecimal(row["h4"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h5 && (subTabIndex == 0 || subTabIndex == 4) && (
                                                // <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["18"]) > parseFloat(row?.newObj?.["18"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                // <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                <td className={`px-2 py-1 text-[#464255] text-right
                                                    ${row?.parameter == "HV" && (row["h5"] > row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_max || row["h5"] < row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_min) && 'text-red-600'}
                                                    ${row?.parameter == "WI" && (row["h5"] > row?.zone?.zone_master_quality[0]?.v2_wobbe_index_max || row["h5"] < row?.zone?.zone_master_quality[0]?.v2_wobbe_index_min) && 'text-red-600'}
                                                `}>

                                                    {
                                                        row["h5"] ? formatNumberThreeDecimal(row["h5"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h6 && (subTabIndex == 0 || subTabIndex == 4) && (
                                                // <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["19"]) > parseFloat(row?.newObj?.["19"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                // <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                <td className={`px-2 py-1 text-[#464255] text-right
                                                    ${row?.parameter == "HV" && (row["h6"] > row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_max || row["h6"] < row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_min) && 'text-red-600'}
                                                    ${row?.parameter == "WI" && (row["h6"] > row?.zone?.zone_master_quality[0]?.v2_wobbe_index_max || row["h6"] < row?.zone?.zone_master_quality[0]?.v2_wobbe_index_min) && 'text-red-600'}
                                                `}>
                                                    {
                                                        row["h6"] ? formatNumberThreeDecimal(row["h6"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h7 && (subTabIndex == 1 || subTabIndex == 4) && (
                                                // <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["20"]) > parseFloat(row?.newObj?.["20"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                // <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                <td className={`px-2 py-1 text-[#464255] text-right
                                                    ${row?.parameter == "HV" && (row["h7"] > row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_max || row["h7"] < row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_min) && 'text-red-600'}
                                                    ${row?.parameter == "WI" && (row["h7"] > row?.zone?.zone_master_quality[0]?.v2_wobbe_index_max || row["h7"] < row?.zone?.zone_master_quality[0]?.v2_wobbe_index_min) && 'text-red-600'}
                                                `}>
                                                    {
                                                        row["h7"] ? formatNumberThreeDecimal(row["h7"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h8 && (subTabIndex == 1 || subTabIndex == 4) && (
                                                // <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["21"]) > parseFloat(row?.newObj?.["21"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                // <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                <td className={`px-2 py-1 text-[#464255] text-right
                                                    ${row?.parameter == "HV" && (row["h8"] > row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_max || row["h8"] < row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_min) && 'text-red-600'}
                                                    ${row?.parameter == "WI" && (row["h8"] > row?.zone?.zone_master_quality[0]?.v2_wobbe_index_max || row["h8"] < row?.zone?.zone_master_quality[0]?.v2_wobbe_index_min) && 'text-red-600'}
                                                `}>
                                                    {
                                                        row["h8"] ? formatNumberThreeDecimal(row["h8"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h9 && (subTabIndex == 1 || subTabIndex == 4) && (
                                                // <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["22"]) > parseFloat(row?.newObj?.["22"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                // <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                <td className={`px-2 py-1 text-[#464255] text-right
                                                    ${row?.parameter == "HV" && (row["h9"] > row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_max || row["h9"] < row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_min) && 'text-red-600'}
                                                    ${row?.parameter == "WI" && (row["h9"] > row?.zone?.zone_master_quality[0]?.v2_wobbe_index_max || row["h9"] < row?.zone?.zone_master_quality[0]?.v2_wobbe_index_min) && 'text-red-600'}
                                                `}>
                                                    {
                                                        row["h9"] ? formatNumberThreeDecimal(row["h9"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h10 && (subTabIndex == 1 || subTabIndex == 4) && (
                                                // <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["23"]) > parseFloat(row?.newObj?.["23"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                // <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                <td className={`px-2 py-1 text-[#464255] text-right
                                                    ${row?.parameter == "HV" && (row["h10"] > row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_max || row["h10"] < row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_min) && 'text-red-600'}
                                                    ${row?.parameter == "WI" && (row["h10"] > row?.zone?.zone_master_quality[0]?.v2_wobbe_index_max || row["h10"] < row?.zone?.zone_master_quality[0]?.v2_wobbe_index_min) && 'text-red-600'}
                                                `}>
                                                    {
                                                        row["h10"] ? formatNumberThreeDecimal(row["h10"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h11 && (subTabIndex == 1 || subTabIndex == 4) && (
                                                // <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["24"]) > parseFloat(row?.newObj?.["24"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                // <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                <td className={`px-2 py-1 text-[#464255] text-right
                                                    ${row?.parameter == "HV" && (row["h11"] > row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_max || row["h11"] < row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_min) && 'text-red-600'}
                                                    ${row?.parameter == "WI" && (row["h11"] > row?.zone?.zone_master_quality[0]?.v2_wobbe_index_max || row["h11"] < row?.zone?.zone_master_quality[0]?.v2_wobbe_index_min) && 'text-red-600'}
                                                `}>

                                                    {
                                                        row["h11"] ? formatNumberThreeDecimal(row["h11"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h12 && (subTabIndex == 1 || subTabIndex == 4) && (
                                                // <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["25"]) > parseFloat(row?.newObj?.["25"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                // <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                <td className={`px-2 py-1 text-[#464255] text-right
                                                    ${row?.parameter == "HV" && (row["h12"] > row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_max || row["h12"] < row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_min) && 'text-red-600'}
                                                    ${row?.parameter == "WI" && (row["h12"] > row?.zone?.zone_master_quality[0]?.v2_wobbe_index_max || row["h12"] < row?.zone?.zone_master_quality[0]?.v2_wobbe_index_min) && 'text-red-600'}
                                                `}>

                                                    {
                                                        row["h12"] ? formatNumberThreeDecimal(row["h12"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h13 && (subTabIndex == 2 || subTabIndex == 4) && (
                                                // <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["26"]) > parseFloat(row?.newObj?.["26"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                // <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                <td className={`px-2 py-1 text-[#464255] text-right
                                                    ${row?.parameter == "HV" && (row["h13"] > row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_max || row["h13"] < row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_min) && 'text-red-600'}
                                                    ${row?.parameter == "WI" && (row["h13"] > row?.zone?.zone_master_quality[0]?.v2_wobbe_index_max || row["h13"] < row?.zone?.zone_master_quality[0]?.v2_wobbe_index_min) && 'text-red-600'}
                                                `}>

                                                    {
                                                        row["h13"] ? formatNumberThreeDecimal(row["h13"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h14 && (subTabIndex == 2 || subTabIndex == 4) && (
                                                // <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["27"]) > parseFloat(row?.newObj?.["27"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                // <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                <td className={`px-2 py-1 text-[#464255] text-right
                                                    ${row?.parameter == "HV" && (row["h14"] > row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_max || row["h14"] < row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_min) && 'text-red-600'}
                                                    ${row?.parameter == "WI" && (row["h14"] > row?.zone?.zone_master_quality[0]?.v2_wobbe_index_max || row["h14"] < row?.zone?.zone_master_quality[0]?.v2_wobbe_index_min) && 'text-red-600'}
                                                `}>
                                                    {
                                                        row["h14"] ? formatNumberThreeDecimal(row["h14"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h15 && (subTabIndex == 2 || subTabIndex == 4) && (
                                                // <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["28"]) > parseFloat(row?.newObj?.["28"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                // <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                <td className={`px-2 py-1 text-[#464255] text-right
                                                    ${row?.parameter == "HV" && (row["h15"] > row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_max || row["h15"] < row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_min) && 'text-red-600'}
                                                    ${row?.parameter == "WI" && (row["h15"] > row?.zone?.zone_master_quality[0]?.v2_wobbe_index_max || row["h15"] < row?.zone?.zone_master_quality[0]?.v2_wobbe_index_min) && 'text-red-600'}
                                                `}>
                                                    {
                                                        row["h15"] ? formatNumberThreeDecimal(row["h15"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h16 && (subTabIndex == 2 || subTabIndex == 4) && (
                                                // <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["29"]) > parseFloat(row?.newObj?.["29"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                // <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                <td className={`px-2 py-1 text-[#464255] text-right
                                                    ${row?.parameter == "HV" && (row["h16"] > row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_max || row["h16"] < row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_min) && 'text-red-600'}
                                                    ${row?.parameter == "WI" && (row["h16"] > row?.zone?.zone_master_quality[0]?.v2_wobbe_index_max || row["h16"] < row?.zone?.zone_master_quality[0]?.v2_wobbe_index_min) && 'text-red-600'}
                                                `}>
                                                    {
                                                        row["h16"] ? formatNumberThreeDecimal(row["h16"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h17 && (subTabIndex == 2 || subTabIndex == 4) && (
                                                // <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["30"]) > parseFloat(row?.newObj?.["30"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                // <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                <td className={`px-2 py-1 text-[#464255] text-right
                                                    ${row?.parameter == "HV" && row["h17"] > row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_max || row["h17"] < row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_min && 'text-red-600'}
                                                    ${row?.parameter == "WI" && (row["h17"] > row?.zone?.zone_master_quality[0]?.v2_wobbe_index_max || row["h17"] < row?.zone?.zone_master_quality[0]?.v2_wobbe_index_min) && 'text-red-600'}
                                                `}>
                                                    {
                                                        row["h17"] ? formatNumberThreeDecimal(row["h17"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h18 && (subTabIndex == 2 || subTabIndex == 4) && (
                                                // <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["31"]) > parseFloat(row?.newObj?.["31"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                // <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                <td className={`px-2 py-1 text-[#464255] text-right
                                                    ${row?.parameter == "HV" && (row["h18"] > row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_max || row["h18"] < row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_min) && 'text-red-600'}
                                                    ${row?.parameter == "WI" && (row["h18"] > row?.zone?.zone_master_quality[0]?.v2_wobbe_index_max || row["h18"] < row?.zone?.zone_master_quality[0]?.v2_wobbe_index_min) && 'text-red-600'}
                                                `}>
                                                    {
                                                        row["h18"] ? formatNumberThreeDecimal(row["h18"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h19 && (subTabIndex == 3 || subTabIndex == 4) && (
                                                // <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["32"]) > parseFloat(row?.newObj?.["32"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                // <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                <td className={`px-2 py-1 text-[#464255] text-right
                                                    ${row?.parameter == "HV" && row["h19"] > row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_max || row["h19"] < row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_min && 'text-red-600'}
                                                    ${row?.parameter == "WI" && (row["h19"] > row?.zone?.zone_master_quality[0]?.v2_wobbe_index_max || row["h19"] < row?.zone?.zone_master_quality[0]?.v2_wobbe_index_min) && 'text-red-600'}
                                                `}>
                                                    {
                                                        row["h19"] ? formatNumberThreeDecimal(row["h19"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h20 && (subTabIndex == 3 || subTabIndex == 4) && (
                                                // <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["33"]) > parseFloat(row?.newObj?.["33"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                // <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                <td className={`px-2 py-1 text-[#464255] text-right
                                                    ${row?.parameter == "HV" && row["h20"] > row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_max || row["h20"] < row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_min && 'text-red-600'}
                                                    ${row?.parameter == "WI" && (row["h20"] > row?.zone?.zone_master_quality[0]?.v2_wobbe_index_max || row["h20"] < row?.zone?.zone_master_quality[0]?.v2_wobbe_index_min) && 'text-red-600'}
                                                `}>
                                                    {
                                                        row["h20"] ? formatNumberThreeDecimal(row["h20"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h21 && (subTabIndex == 3 || subTabIndex == 4) && (
                                                // <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["34"]) > parseFloat(row?.newObj?.["34"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                // <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                <td className={`px-2 py-1 text-[#464255] text-right
                                                    ${row?.parameter == "HV" && row["h21"] > row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_max || row["h21"] < row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_min && 'text-red-600'}
                                                    ${row?.parameter == "WI" && (row["h21"] > row?.zone?.zone_master_quality[0]?.v2_wobbe_index_max || row["h21"] < row?.zone?.zone_master_quality[0]?.v2_wobbe_index_min) && 'text-red-600'}
                                                `}>
                                                    {
                                                        row["h21"] ? formatNumberThreeDecimal(row["h21"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h22 && (subTabIndex == 3 || subTabIndex == 4) && (
                                                // <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["35"]) > parseFloat(row?.newObj?.["35"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                // <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                <td className={`px-2 py-1 text-[#464255] text-right
                                                    ${row?.parameter == "HV" && row["h22"] > row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_max || row["h22"] < row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_min && 'text-red-600'}
                                                    ${row?.parameter == "WI" && (row["h22"] > row?.zone?.zone_master_quality[0]?.v2_wobbe_index_max || row["h22"] < row?.zone?.zone_master_quality[0]?.v2_wobbe_index_min) && 'text-red-600'}
                                                `}>
                                                    {
                                                        row["h22"] ? formatNumberThreeDecimal(row["h22"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h23 && (subTabIndex == 3 || subTabIndex == 4) && (
                                                // <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["36"]) > parseFloat(row?.newObj?.["36"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                // <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                <td className={`px-2 py-1 text-[#464255] text-right
                                                    ${row?.parameter == "HV" && row["h23"] > row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_max || row["h23"] < row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_min && 'text-red-600'}
                                                    ${row?.parameter == "WI" && (row["h23"] > row?.zone?.zone_master_quality[0]?.v2_wobbe_index_max || row["h23"] < row?.zone?.zone_master_quality[0]?.v2_wobbe_index_min) && 'text-red-600'}
                                                `}>
                                                    {
                                                        row["h23"] ? formatNumberThreeDecimal(row["h23"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h24 && (subTabIndex == 3 || subTabIndex == 4) && (
                                                // <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["37"]) > parseFloat(row?.newObj?.["37"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                // <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                <td className={`px-2 py-1 text-[#464255] text-right
                                                    ${row?.parameter == "HV" && row["h24"] > row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_max || row["h24"] < row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_min && 'text-red-600'}
                                                    ${row?.parameter == "WI" && (row["h24"] > row?.zone?.zone_master_quality[0]?.v2_wobbe_index_max || row["h24"] < row?.zone?.zone_master_quality[0]?.v2_wobbe_index_min) && 'text-red-600'}
                                                `}>
                                                    {
                                                        row["h24"] ? formatNumberThreeDecimal(row["h24"]) : ''
                                                    }
                                                </td>
                                            )}


                                        </tr>

                                    )
                                })
                            }
                        </tbody>
                    </table>
                    :
                    <TableSkeleton />
            }

            {
                isLoading && sortedData?.length == 0 && <NodataTable />
            }

        </div>
    )
}

export default TableIntraday;