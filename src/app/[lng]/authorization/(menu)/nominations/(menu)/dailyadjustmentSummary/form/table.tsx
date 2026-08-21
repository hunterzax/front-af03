import { useEffect } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatNumberThreeDecimal } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort, handleSortNomCode } from "@/utils/sortTable";
import NodataTable from "@/components/other/nodataTable";

const TableDailyAdjustmentSummary: React.FC<any> = ({ tableData, columnVisibility, subTabIndex, isLoading, userPermission, tabEntry }) => {
    const [sortedData, setSortedData] = useState<any>([]);

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

    const getHighlightStartIndex = (row: any) => {
        const hourMap = row?.dailyAdjustFindPoint?.map((item: any) => parseInt(item.hourTime?.replace('H', ''))) || [];
        const minHour = Math.min(...hourMap);
        return isFinite(minHour) ? minHour : null;
    };

    return (
        <div className={`relative h-[calc(100vh-340px)] overflow-y-auto block  rounded-t-md z-1`}>

            {
                isLoading ?
                    <table className={`w-full text-sm text-left rtl:text-right text-gray-500 `}>
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-20">

                                {columnVisibility.gas_day && (
                                    <th scope="col" className={`${table_sort_header_style} text-center max-w-[200px]`} onClick={() => handleSort("gasDayUse", sortState, setSortState, setSortedData, tableData)}>
                                        {`Gas Day`}
                                        {getArrowIcon("gasDayUse")}
                                    </th>
                                )}

                                {columnVisibility.nominations_code && (
                                    <th scope="col" className={`${table_sort_header_style} text-center !min-w-[120px] !max-w-[200px]`} onClick={() => handleSortNomCode("nomination_code", sortState, setSortState, setSortedData, tableData)}>
                                        {`Nominations Code`}
                                        {getArrowIcon("nomination_code")}
                                    </th>
                                )}

                                {columnVisibility.entry_exit && (
                                    <th scope="col" className={`${table_sort_header_style} text-center !min-w-[120px] !max-w-[200px]`} onClick={() => handleSort("entryExitObj.name", sortState, setSortState, setSortedData, tableData)}>
                                        {`Entry/Exit`}
                                        {getArrowIcon("entryExitObj.name")}
                                    </th>
                                )}

                                {columnVisibility.adjustment && (
                                    <th scope="col" className={`${table_sort_header_style} text-center !min-w-[120px] !max-w-[200px]`}
                                        onClick={() => handleSort("adjustment", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Adjustment`}
                                        {getArrowIcon("adjustment")}
                                    </th>
                                )}

                                {columnVisibility.contract_code && (
                                    <th scope="col" className={`${table_sort_header_style} text-center !min-w-[120px] !max-w-[200px]`}
                                        onClick={() => handleSort("contract", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Contract Code`}
                                        {getArrowIcon("contract")}
                                    </th>
                                )}

                                {columnVisibility.shipper_name && (
                                    <th scope="col" className={`${table_sort_header_style} text-center !min-w-[120px] !max-w-[200px]`}
                                        onClick={() => handleSort("shipper_name", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Shipper Name`}
                                        {getArrowIcon("shipper_name")}
                                    </th>
                                )}

                                {columnVisibility.nomination_point && (
                                    <th scope="col" className={`${table_sort_header_style} text-center !min-w-[120px] !max-w-[200px]`}
                                        onClick={() => handleSort("point", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Nomination Point`}
                                        {getArrowIcon("point")}
                                    </th>
                                )}

                                {getVisibleHours().map(({ key, label, timeRange }: any) =>
                                    columnVisibility[key] && (
                                        <th
                                            key={key}
                                            scope="col"
                                            className={`${table_sort_header_style} min-w-[170px] text-center`}
                                            onClick={() => handleSort(label, sortState, setSortState, setSortedData, tableData)}
                                        >
                                            <div>{label}</div>
                                            <div>{timeRange}</div>
                                            {getArrowIcon(label)}
                                        </th>
                                    )
                                )}

                                {columnVisibility.total && (
                                    <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("totalH1ToH24Adjust", sortState, setSortState, setSortedData, tableData)}>
                                        {`Total`}
                                        {getArrowIcon("totalH1ToH24Adjust")}
                                    </th>
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {
                                sortedData?.length > 0 && sortedData?.map((row: any, index: any) => {

                                    // const minHour = getHighlightStartIndex(row); // Call this at top of each row loop
                                    const minHour: any = (() => {
                                        const hourMap = row?.dailyAdjustFindPoint?.map((item: any) => parseInt(item.hourTime?.replace('H', ''))) || [];
                                        const min = Math.min(...hourMap);
                                        return isFinite(min) ? min : 25;
                                    })();


                                    return (
                                        <tr
                                            key={row?.id}
                                            className={`${table_row_style}`}
                                        >

                                            {columnVisibility.gas_day && (
                                                // <td className="px-2 py-1 text-[#464255] max-w-[60px]">{row?.gasday ? formatDateNoTime(row?.gasday) : ''}</td>
                                                <td className="px-2 py-1 text-[#464255] max-w-[60px]">{row?.gasDayUse ? row?.gasDayUse : ''}</td>
                                            )}

                                            {columnVisibility.nominations_code && (
                                                <td className="px-2 py-1 text-[#464255]  justify-center">{row?.nomination_code ? row?.nomination_code : ''}</td>
                                            )}

                                            {columnVisibility.entry_exit && (
                                                <td className="px-2 py-1  justify-center">{row?.entryExitObj && <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.entryExitObj?.color }}>{`${row?.entryExitObj?.name}`}</div>}</td>
                                            )}

                                            {columnVisibility.adjustment && (
                                                <td className="px-2 py-1  justify-center">{
                                                    row?.adjustment == 'YES' ?
                                                        <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: '#B5FFCE' }}>{`${row?.adjustment}`}</div>
                                                        : <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: '#FFDEDE' }}>{`${row?.adjustment}`}</div>
                                                }
                                                </td>
                                            )}

                                            {columnVisibility.contract_code && (
                                                <td className="px-2 py-1 text-[#464255]">{row?.contract ? row?.contract : ''}</td>
                                            )}

                                            {columnVisibility.shipper_name && (
                                                <td className="px-2 py-1 text-[#464255]">{row?.shipper_name ? row?.shipper_name : ''}</td>
                                            )}

                                            {columnVisibility.nomination_point && (
                                                <td className="px-2 py-1 text-[#464255]">{row?.point ? row?.point : ''}</td>
                                            )}

                                            {/* #1B1464 ค่าที่โดน Adjust สีแดงให้ปรับเป็นสีน้ำเงินเข้ม ตามธีม PTT https://app.clickup.com/t/86etzchad */}
                                            {columnVisibility.h1 && (subTabIndex == 0 || subTabIndex == 4) && (
                                                <td className={`px-2 py-1  text-right ${1 >= minHour ? 'text-[#1473a1]' : 'text-[#464255]'}`}>
                                                    {
                                                        (row["H1"] || row["H1"] == 0) ? formatNumberThreeDecimal(row["H1"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h2 && (subTabIndex == 0 || subTabIndex == 4) && (
                                                <td className={`px-2 py-1  text-right ${2 >= minHour ? 'text-[#1473a1]' : 'text-[#464255]'}`}>
                                                    {
                                                        (row["H2"] || row["H2"] == 0) ? formatNumberThreeDecimal(row["H2"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h3 && (subTabIndex == 0 || subTabIndex == 4) && (
                                                <td className={`px-2 py-1  text-right ${3 >= minHour ? 'text-[#1473a1]' : 'text-[#464255]'}`}>
                                                    {
                                                        (row["H3"] || row["H3"] == 0) ? formatNumberThreeDecimal(row["H3"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h4 && (subTabIndex == 0 || subTabIndex == 4) && (
                                                <td className={`px-2 py-1  text-right ${4 >= minHour ? 'text-[#1473a1]' : 'text-[#464255]'}`}>
                                                    {
                                                        (row["H4"] || row["H4"] == 0) ? formatNumberThreeDecimal(row["H4"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h5 && (subTabIndex == 0 || subTabIndex == 4) && (
                                                <td className={`px-2 py-1  text-right ${5 >= minHour ? 'text-[#1473a1]' : 'text-[#464255]'}`}>
                                                    {
                                                        (row["H5"] || row["H5"] == 0) ? formatNumberThreeDecimal(row["H5"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h6 && (subTabIndex == 0 || subTabIndex == 4) && (
                                                <td className={`px-2 py-1  text-right ${6 >= minHour ? 'text-[#1473a1]' : 'text-[#464255]'}`}>
                                                    {
                                                        (row["H6"] || row["H6"] == 0) ? formatNumberThreeDecimal(row["H6"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h7 && (subTabIndex == 1 || subTabIndex == 4) && (
                                                <td className={`px-2 py-1  text-right ${7 >= minHour ? 'text-[#1473a1]' : 'text-[#464255]'}`}>
                                                    {
                                                        (row["H7"] || row["H7"] == 0) ? formatNumberThreeDecimal(row["H7"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h8 && (subTabIndex == 1 || subTabIndex == 4) && (
                                                <td className={`px-2 py-1  text-right ${8 >= minHour ? 'text-[#1473a1]' : 'text-[#464255]'}`}>
                                                    {
                                                        (row["H8"] || row["H8"] == 0) ? formatNumberThreeDecimal(row["H8"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h9 && (subTabIndex == 1 || subTabIndex == 4) && (
                                                <td className={`px-2 py-1  text-right ${9 >= minHour ? 'text-[#1473a1]' : 'text-[#464255]'}`}>
                                                    {
                                                        (row["H9"] || row["H9"] == 0) ? formatNumberThreeDecimal(row["H9"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h10 && (subTabIndex == 1 || subTabIndex == 4) && (
                                                <td className={`px-2 py-1  text-right ${10 >= minHour ? 'text-[#1473a1]' : 'text-[#464255]'}`}>
                                                    {
                                                        (row["H10"] || row["H10"] == 0) ? formatNumberThreeDecimal(row["H10"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h11 && (subTabIndex == 1 || subTabIndex == 4) && (
                                                <td className={`px-2 py-1  text-right ${11 >= minHour ? 'text-[#1473a1]' : 'text-[#464255]'}`}>
                                                    {
                                                        (row["H11"] || row["H11"] == 0) ? formatNumberThreeDecimal(row["H11"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h12 && (subTabIndex == 1 || subTabIndex == 4) && (
                                                <td className={`px-2 py-1  text-right ${12 >= minHour ? 'text-[#1473a1]' : 'text-[#464255]'}`}>
                                                    {
                                                        (row["H12"] || row["H12"] == 0) ? formatNumberThreeDecimal(row["H12"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h13 && (subTabIndex == 2 || subTabIndex == 4) && (
                                                <td className={`px-2 py-1  text-right ${13 >= minHour ? 'text-[#1473a1]' : 'text-[#464255]'}`}>
                                                    {
                                                        (row["H13"] || row["H13"] == 0) ? formatNumberThreeDecimal(row["H13"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h14 && (subTabIndex == 2 || subTabIndex == 4) && (
                                                <td className={`px-2 py-1  text-right ${14 >= minHour ? 'text-[#1473a1]' : 'text-[#464255]'}`}>
                                                    {
                                                        (row["H14"] || row["H14"] == 0) ? formatNumberThreeDecimal(row["H14"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h15 && (subTabIndex == 2 || subTabIndex == 4) && (
                                                <td className={`px-2 py-1  text-right ${15 >= minHour ? 'text-[#1473a1]' : 'text-[#464255]'}`}>
                                                    {
                                                        (row["H15"] || row["H15"] == 0) ? formatNumberThreeDecimal(row["H15"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h16 && (subTabIndex == 2 || subTabIndex == 4) && (
                                                <td className={`px-2 py-1  text-right ${16 >= minHour ? 'text-[#1473a1]' : 'text-[#464255]'}`}>
                                                    {
                                                        (row["H16"] || row["H16"] == 0) ? formatNumberThreeDecimal(row["H16"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h17 && (subTabIndex == 2 || subTabIndex == 4) && (
                                                <td className={`px-2 py-1  text-right ${17 >= minHour ? 'text-[#1473a1]' : 'text-[#464255]'}`}>
                                                    {
                                                        (row["H17"] || row["H17"] == 0) ? formatNumberThreeDecimal(row["H17"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h18 && (subTabIndex == 2 || subTabIndex == 4) && (
                                                <td className={`px-2 py-1  text-right ${18 >= minHour ? 'text-[#1473a1]' : 'text-[#464255]'}`}>
                                                    {
                                                        (row["H18"] || row["H18"] == 0) ? formatNumberThreeDecimal(row["H18"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h19 && (subTabIndex == 3 || subTabIndex == 4) && (
                                                <td className={`px-2 py-1  text-right ${19 >= minHour ? 'text-[#1473a1]' : 'text-[#464255]'}`}>
                                                    {
                                                        (row["H19"] || row["H19"] == 0) ? formatNumberThreeDecimal(row["H19"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h20 && (subTabIndex == 3 || subTabIndex == 4) && (
                                                <td className={`px-2 py-1  text-right ${20 >= minHour ? 'text-[#1473a1]' : 'text-[#464255]'}`}>
                                                    {
                                                        (row["H20"] || row["H20"] == 0) ? formatNumberThreeDecimal(row["H20"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h21 && (subTabIndex == 3 || subTabIndex == 4) && (
                                                <td className={`px-2 py-1  text-right ${21 >= minHour ? 'text-[#1473a1]' : 'text-[#464255]'}`}>
                                                    {
                                                        (row["H21"] || row["H21"] == 0) ? formatNumberThreeDecimal(row["H21"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h22 && (subTabIndex == 3 || subTabIndex == 4) && (
                                                <td className={`px-2 py-1  text-right ${22 >= minHour ? 'text-[#1473a1]' : 'text-[#464255]'}`}>
                                                    {
                                                        (row["H22"] || row["H22"] == 0) ? formatNumberThreeDecimal(row["H22"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h23 && (subTabIndex == 3 || subTabIndex == 4) && (
                                                <td className={`px-2 py-1  text-right ${23 >= minHour ? 'text-[#1473a1]' : 'text-[#464255]'}`}>
                                                    {
                                                        (row["H23"] || row["H23"] == 0) ? formatNumberThreeDecimal(row["H23"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h24 && (subTabIndex == 3 || subTabIndex == 4) && (
                                                <td className={`px-2 py-1  text-right ${24 >= minHour ? 'text-[#1473a1]' : 'text-[#464255]'}`}>
                                                    {
                                                        (row["H24"] || row["H24"] == 0) ? formatNumberThreeDecimal(row["H24"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.total && (
                                                <td className="px-2 py-1 text-[#464255] text-right font-semibold">{row?.totalH1ToH24Adjust ? formatNumberThreeDecimal(row?.totalH1ToH24Adjust) : '0.000'}</td>
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

export default TableDailyAdjustmentSummary;