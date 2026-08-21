import { useEffect, useRef } from "react";
import React, { FC, useState } from 'react';
import TableSkeleton, { DefaultSkeleton } from '@/components/material_custom/DefaultSkeleton';
import BtnActionTable from "@/components/other/btnActionInTable";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import OpacityOutlinedIcon from '@mui/icons-material/OpacityOutlined';

import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style, table_sort_header_style_original } from "@/utils/styles";
import { handleSort, handleSortUseItMonth } from "@/utils/sortTable";
import { formatNumberThreeDecimal, toDayjs } from "@/utils/generalFormatter";
import Decimal from 'decimal.js';
interface TableProps {
    openEditForm: (id: any) => void;
    openViewForm: (id: any) => void;
    openViewModal: (data: any) => void;
    openHistoryForm: (id: any) => void;
    tableData: any;
    combinedSortKey: {
        original: string;
        formatted: string;
    }[];
    areaMaster: any;
    zoneMaster: any;
    sysParam: any;
    isLoading: any;
    columnVisibility: any;
    userPermission?: any;
}

const TableUseItOrLoseIt: React.FC<TableProps> = ({ openEditForm, openViewForm, openHistoryForm, openViewModal, areaMaster, zoneMaster, sysParam, tableData, combinedSortKey, isLoading, columnVisibility, userPermission }) => {
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);
    // const [usedCap, setUsedCap] = useState<number>(0)

    useEffect(() => {
        if (tableData && tableData.length > 0) {
            setSortedData(tableData);
        } else {
            setSortedData([]);
        }

    }, [tableData]);

    // useEffect(() => {
    //     if(sysParam?.value){
    //         const capPercentage = new Decimal(sysParam?.value)
    //         if(!capPercentage.isNaN()){
    //             setUsedCap(capPercentage.toNumber())
    //         }
    //     }
    // }, [sysParam]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    const [openPopoverId, setOpenPopoverId] = useState(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const togglePopover = (id: any) => {

        if (openPopoverId === id) {
            setOpenPopoverId(null); // Close the popover if it's already open
        } else {
            setOpenPopoverId(id); // Open the popover for the clicked row
        }
    };

    const toggleMenu = (mode: any, id: any) => {
        switch (mode) {
            case "release":
                openViewForm(id);
                setOpenPopoverId(null);
                break;
            // case "edit":
            //     openEditForm(id);
            //     setOpenPopoverId(null);
            //     break;
            // case "history":
            //     openHistoryForm(id);
            //     setOpenPopoverId(null);
            //     break;
        }
    }
    const handleClickOutside = (event: MouseEvent) => {
        if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
            setOpenPopoverId(null);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [popoverRef]);
    const averageValue = columnVisibility["Average"];

    // get col_visibility where value is true and count length only key is month and Average 
    const countVisibleMonths = Object.keys(columnVisibility).filter(key => {
        return (key.match(/^[A-Za-z]{3} \d{4}$/) || key === "Average") && columnVisibility[key];
    }).length;

    // map data into column under Used Cap (%)
    return (
        <div className={`h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md relative z-10`}>
            {
                !isLoading ?
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            {/* First row: Parent columns */}
                            <tr className="h-9">

                                {/* {columnVisibility.version && (
                                    <>
                                        <th rowSpan={2} scope="col" className={`${table_sort_header_style}`}>
                                            {`Shipper Name`}
                                            {getArrowIcon("name")}
                                        </th>
                                        <th rowSpan={2} scope="col" className={`${table_sort_header_style}`}>
                                            {`Contract Code`}
                                            {getArrowIcon("name")}
                                        </th>
                                        <th rowSpan={2} scope="col" className={`${table_sort_header_style}`}>
                                            {`Area`}
                                            {getArrowIcon("name")}
                                        </th>
                                        <th rowSpan={2} scope="col" className={`${table_sort_header_style}`}>
                                            {`Entry / Exit`}
                                            {getArrowIcon("name")}
                                        </th>
                                    </>
                                )} */}

                                {columnVisibility.shipper_name && (
                                    <th rowSpan={2} scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("group.name", sortState, setSortState, setSortedData, tableData)}>
                                        {`Shipper Name`}
                                        {getArrowIcon("group.name")}
                                    </th>
                                )}

                                {columnVisibility.contract_code && (
                                    <th rowSpan={2} scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("contract_code", sortState, setSortState, setSortedData, tableData)}>
                                        {`Contract Code`}
                                        {getArrowIcon("contract_code")}
                                    </th>
                                )}

                                {columnVisibility.area && (
                                    <th
                                        rowSpan={2}
                                        scope="col"
                                        className={`${table_header_style}`}
                                    // onClick={() => handleSort("data[0].exitData.area_text", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Area`}
                                        {/* {getArrowIcon("data[0].exitData.area_text")} */}
                                    </th>
                                )}

                                {columnVisibility.entry_exit && (
                                    <th
                                        rowSpan={2}
                                        scope="col"
                                        className={`${table_header_style}`}
                                    // onClick={() => handleSort("data[0].exitData.entry_exit.name", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Entry / Exit`}
                                        {/* {getArrowIcon("data[0].exitData.entry_exit.name")} */}
                                    </th>
                                )}

                                {/* Parent column for Used Cap (%) */}
                                {columnVisibility.used_cap && (
                                    // <th colSpan={averageValue ? combinedSortKey.length  : combinedSortKey.length -1} scope="col" className={`${table_sort_header_style} text-center`}>
                                    <th colSpan={countVisibleMonths} scope="col" className={`${table_sort_header_style} text-center`}>
                                        {`Used Cap (%)`}
                                    </th>
                                )}

                                {columnVisibility.action && (
                                    <th rowSpan={2} scope="col" className={`${table_header_style} text-center`}>
                                        {`Action`}
                                    </th>
                                )}
                            </tr>

                            {/* Second row: Subcolumns under Used Cap (%) */}
                            {columnVisibility.used_cap && (
                                <tr className="h-9 bg-gray-200">
                                    {combinedSortKey.map((date, index) => (
                                        columnVisibility[date.formatted] && (
                                            <th
                                                key={index}
                                                scope="col"
                                                className={`${table_sort_header_style} bg-[#00ADEF]`}
                                                onClick={() => handleSortUseItMonth(`${date.original}`, sortState, setSortState, setSortedData, tableData)}
                                            >
                                                {date.formatted}
                                                {getArrowIcon(`${date.original}`)}
                                            </th>
                                        )
                                    ))}
                                </tr>
                            )}
                        </thead>

                        <tbody>
                            {sortedData && sortedData.map((row: any, index: any) => {

                                // Calculate the average values for entryData and exitData
                                const totalEntryValues = combinedSortKey.slice(0, -1).reduce((sum, date) => {
                                    // const entryValue = parseFloat(row?.data[0]?.entryData.value[date.original]?.value) || 0;
                                    // const entryValue = parseFloat(row?.data[0]?.entryData.valueBefor12Month[date.original]?.value) || 0;
                                    // const entryValue = parseFloat(row?.data[0]?.entryData.valueBefor12Month[date.original]?.allocated_value) || 0;
                                    const entryValue = parseFloat(row?.data[0]?.entryData.valueBefor12Month[date.original]?.percent_used_cap) || 0;
                                    return sum + entryValue;
                                }, 0);

                                const totalExitValues = combinedSortKey.slice(0, -1).reduce((sum, date) => {
                                    // const exitValue = parseFloat(row?.data[0]?.exitData.value[date.original]?.value) || 0;
                                    // const exitValue = parseFloat(row?.data[0]?.exitData.valueBefor12Month[date.original]?.value) || 0;
                                    // const exitValue = parseFloat(row?.data[0]?.exitData.valueBefor12Month[date.original]?.allocated_value) || 0;
                                    const exitValue = parseFloat(row?.data[0]?.exitData.valueBefor12Month[date.original]?.percent_used_cap) || 0;
                                    return sum + exitValue;
                                }, 0);

                                const entryAverage = totalEntryValues / combinedSortKey.slice(0, -1).length;
                                const exitAverage = totalExitValues / combinedSortKey.slice(0, -1).length;

                                return (
                                    <tr
                                        key={index}
                                        className={`${table_row_style} border-b ${index % 2 === 0 ? '!bg-[#EBF9FF]' : 'bg-white'} h-12`}
                                    >
                                        {columnVisibility.shipper_name && (
                                            <td className="px-2 py-1 text-[#464255] font-light">{row?.group && row?.group?.name}</td>
                                        )}

                                        {columnVisibility.contract_code && (
                                            <td className="px-2 py-1 text-[#464255] font-light">{row?.contract_code ? row?.contract_code : ''}</td>
                                        )}

                                        {columnVisibility.area && (
                                            <td className="px-2 py-1 justify-center ">
                                                {(() => {
                                                    const matchedArea = areaMaster?.data?.find((area: any) => row?.data[0]?.entryData?.area_text === area.name);
                                                    if (matchedArea) {
                                                        const commonStyles = {
                                                            backgroundColor: matchedArea.color,
                                                            width: "30px",
                                                            height: "30px",
                                                        };

                                                        return (
                                                            <div
                                                                className={`flex justify-center mt-1 mb-1 items-center p-1 text-[#464255] ${row?.data[0]?.entryData?.entry_exit_id == 1 ? "rounded-lg" : "rounded-full"} truncate`}
                                                                style={commonStyles}
                                                            >
                                                                {matchedArea.name}
                                                            </div>
                                                        );
                                                    }
                                                })()}

                                                {(() => {
                                                    const matchedArea = areaMaster?.data?.find((area: any) => row?.data[0]?.exitData?.area_text === area.name);
                                                    if (matchedArea) {
                                                        const commonStyles = {
                                                            backgroundColor: matchedArea.color,
                                                            width: "30px",
                                                            height: "30px",
                                                        };

                                                        return (
                                                            <div
                                                                className={`flex justify-center items-center p-1 text-[#464255] ${row?.data[0]?.exitData?.entry_exit_id == 1 ? "rounded-lg" : "rounded-full"} truncate`}
                                                                style={commonStyles}
                                                            >
                                                                {matchedArea.name}
                                                            </div>
                                                        );
                                                    }
                                                })()}
                                            </td>
                                        )}

                                        {columnVisibility.entry_exit && (
                                            <td className="px-2 py-1 justify-center ">
                                                {(() => {
                                                    if (row?.data[0]?.entryData?.entry_exit_id == 1 && row?.data[0]?.entryData?.entry_exit) {
                                                        return (
                                                            <div
                                                                className="flex w-[100px] justify-center rounded-full p-1 text-[#464255] mb-1"
                                                                style={{ backgroundColor: row?.data[0]?.entryData?.entry_exit?.color }}
                                                            >
                                                                {row?.data[0]?.entryData?.entry_exit?.name}
                                                            </div>
                                                        );
                                                    }
                                                })()}

                                                {(() => {
                                                    if (row?.data[0]?.exitData?.entry_exit_id == 2) {
                                                        return (
                                                            <div
                                                                className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]"
                                                                style={{ backgroundColor: row?.data[0]?.exitData?.entry_exit?.color }}
                                                            >
                                                                {row?.data[0]?.exitData?.entry_exit?.name}
                                                            </div>
                                                        );
                                                    }
                                                })()}
                                            </td>
                                        )}

                                        {columnVisibility.used_cap && (
                                            <>

                                                {combinedSortKey.slice(0, -1).map((date, index) => {
                                                    const startOfMonth = toDayjs(date.original, 'MM/YYYY').startOf('month')
                                                    const endOfMonth = toDayjs(date.original, 'MM/YYYY').endOf('month')
                                                    const actviceSysParam = sysParam.filter((item: any) => {
                                                        const itemStartDate = toDayjs(item.start_date)
                                                        const itemEndDate = toDayjs(item.end_date)
                                                        return itemStartDate.isSameOrBefore(endOfMonth)
                                                    })
                                                    const lastestSysParam = actviceSysParam.length > 0 ? actviceSysParam.sort((a: any, b: any) => toDayjs(b.start_date).diff(toDayjs(a.start_date)))[0] : null
                                                    let usedCap = undefined

                                                    if (lastestSysParam?.value) {
                                                        const capPercentage = new Decimal(lastestSysParam?.value)
                                                        if (!capPercentage.isNaN()) {
                                                            usedCap = capPercentage.toNumber()
                                                        }
                                                    }
                                                    // const entryTmp = row?.data[0]?.entryData.valueBefor12Month[date.original]?.value
                                                    // const exitTmp = row?.data[0]?.exitData.valueBefor12Month[date.original]?.value       
                                                    // const entryTmp = row?.data[0]?.entryData.valueBefor12Month[date.original]?.allocated_value
                                                    // const exitTmp = row?.data[0]?.exitData.valueBefor12Month[date.original]?.allocated_value
                                                    const entryTmp = row?.data[0]?.entryData.valueBefor12Month[date.original]?.percent_used_cap
                                                    const exitTmp = row?.data[0]?.exitData.valueBefor12Month[date.original]?.percent_used_cap
                                                    const entryValue = entryTmp || "-"
                                                    const exitValue = exitTmp || "-"
                                                    const entryDecimal = new Decimal(entryTmp || NaN).toNumber()
                                                    const exitDecimal = new Decimal(exitTmp || NaN).toNumber()

                                                    return (
                                                        columnVisibility[date.formatted] && (
                                                            <td key={index} className="px-2 py-1 font-light text-right">
                                                                {(entryValue !== '-' && usedCap !== null && usedCap !== undefined) && (
                                                                    <span className={Number(entryDecimal) > Number(usedCap) ? 'text-red-500' : 'text-[#464255]'}>
                                                                        {formatNumberThreeDecimal(entryValue)}
                                                                    </span>
                                                                )}

                                                                <br />
                                                                <br />

                                                                {(exitValue !== '-' && usedCap !== null && usedCap !== undefined) && (
                                                                    <span className={Number(exitDecimal) > Number(usedCap) ? 'text-red-500' : 'text-[#464255]'}>
                                                                        {formatNumberThreeDecimal(exitValue)}
                                                                    </span>
                                                                )}
                                                            </td>
                                                        ))

                                                    // return (
                                                    //     columnVisibility[date.formatted] && (
                                                    //         <td key={index} className="px-2 py-1 font-light text-right">
                                                    //             {/* {row?.data[0]?.entryData.value[date.original]?.value || "-"} */}
                                                    //             {/* add formatNumberThreeDecimal */}
                                                    //             <span className={`${(entryValue != '-' && usedCap) ? entryDecimal > usedCap ? 'text-red-500' : 'text-[#464255]' : 'text-transparent'}`}>{formatNumberThreeDecimal(entryValue)}</span>
                                                    //             <br />
                                                    //             <br />
                                                    //             {/* {row?.data[0]?.exitData.value[date.original]?.value || "-"} */}
                                                    //             {/* add formatNumberThreeDecimal */}
                                                    //             <span className={`${(exitValue != '-' && usedCap) ? exitDecimal > usedCap ? 'text-red-500' : 'text-[#464255]' : 'text-transparent'}`}>{formatNumberThreeDecimal(exitValue)}</span>
                                                    //         </td>
                                                    //     ))

                                                })}

                                                {/* // Add a new row for averages */}
                                                {
                                                    columnVisibility.Average && (
                                                        <td className="px-2 py-1 text-[#464255] font-semibold text-right">
                                                            {entryAverage ? entryAverage.toFixed(3) : ""}
                                                            <br />
                                                            <br />
                                                            {exitAverage ? exitAverage.toFixed(3) : ""}
                                                        </td>
                                                    )
                                                }

                                            </>
                                        )}

                                        {columnVisibility.action && (
                                            <td className="px-2 py-1">
                                                <div className="relative inline-flex justify-center items-center w-full">
                                                    <BtnActionTable togglePopover={togglePopover} row_id={index} disable={!userPermission?.f_view && !userPermission?.f_edit ? true : false} />
                                                    {openPopoverId === index && (
                                                        <div ref={popoverRef}
                                                            className="absolute left-[-12rem] top-[-10px] mt-2 w-52 bg-white border border-gray-300 rounded-lg shadow-lg z-1">
                                                            <ul className="py-2">
                                                                {/* <li className="px-4 py-2 font-simibold text-sm text-[#637381] hover:bg-gray-100 hover:text-[#000000] cursor-pointer" onClick={() => { toggleMenu("release", row) }}><OpacityOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> Release UILOI</li> */}
                                                                {
                                                                    userPermission?.f_edit && <li className="px-4 py-2 font-simibold text-sm text-[#637381] hover:bg-gray-100 hover:text-[#000000] cursor-pointer" onClick={() => { toggleMenu("release", row) }}><OpacityOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Release UILOI`}</li>
                                                                }
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        )}

                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    :
                    <TableSkeleton />
            }
        </div>
    )
}

export default TableUseItOrLoseIt;