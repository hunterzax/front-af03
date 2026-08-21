import { useEffect } from "react";
import React, { useState } from 'react';
import { fillMissingUpdateByAccount, formatDateNoTime, formatDateTimeSec, formatNumberThreeDecimal, getContrastTextColor } from '@/utils/generalFormatter';

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
interface TableProps {
    tableData: any;
    isLoading?: any;
    columnVisibility?: any;
}

const TableAreaHistory: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility }) => {
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState<any>([]);

    useEffect(() => {
        if (tableData && tableData.length > 0) {
            const normalized = fillMissingUpdateByAccount(tableData);
            setSortedData(normalized);
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

    return (
        <div className={`h-[calc(100vh-500px)] overflow-y-auto block  rounded-t-md relative z-1`}>

            <table className="w-full text-sm text-left rtl:text-right table-auto">
                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-1">
                    <tr className="h-9">
                        {columnVisibility.entry_exit && (
                            <th
                                scope="col"
                                className={`${table_sort_header_style}`}
                                onClick={() => handleSort("entry_exit_id", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}
                            >
                                {`Entry / Exit`}
                                {getArrowIcon("entry_exit_id")}
                            </th>
                        )}

                        {columnVisibility.zone && (
                            <th
                                scope="col"
                                className={`${table_sort_header_style}`}
                                onClick={() => handleSort("zone_id", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}
                            >
                                {`Zone`}
                                {getArrowIcon("zone_id")}
                            </th>
                        )}

                        {columnVisibility.name && (
                            <th
                                scope="col"
                                className={`${table_sort_header_style}`}
                                onClick={() => handleSort("name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}
                            >
                                {`Area Name`}
                                {getArrowIcon("name")}
                            </th>
                        )}

                        {columnVisibility.desc && (
                            <th
                                scope="col"
                                className={`${table_sort_header_style}`}
                                onClick={() => handleSort("description", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}
                            >
                                {`Description`}
                                {getArrowIcon("description")}
                            </th>
                        )}

                        {columnVisibility.area_nom_cap && (
                            <th
                                scope="col"
                                className={`${table_sort_header_style} text-center`}
                                onClick={() => handleSort("area_nominal_capacity", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}
                            >
                                {`Area Nominal Capacity (MMBTU/D)`}
                                {getArrowIcon("area_nominal_capacity")}
                            </th>
                        )}

                        {columnVisibility.supply_ref_quality && (
                            <th
                                scope="col"
                                className={`${table_sort_header_style}`}
                                onClick={() => handleSort("supply_reference_quality_area", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}
                            >
                                {`Supply Reference Quality Area`}
                                {getArrowIcon("supply_reference_quality_area")}
                            </th>
                        )}



                        {columnVisibility.start_date && (
                            <th
                                scope="col"
                                className={`${table_sort_header_style}`}
                                onClick={() => handleSort("start_date", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}
                            >
                                {`Start Date`}
                                {getArrowIcon("start_date")}
                            </th>
                        )}

                        {columnVisibility.end_date && (
                            <th
                                scope="col"
                                className={`${table_sort_header_style}`}
                                onClick={() => handleSort("end_date", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}
                            >
                                {`End Date`}
                                {getArrowIcon("end_date")}
                            </th>
                        )}

                        {columnVisibility.updated_by && (
                            <th
                                scope="col"
                                className={`${table_sort_header_style}`}
                                onClick={() => handleSort("update_by_account.first_name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}
                            >
                                {`Updated by`}
                                {getArrowIcon("update_by_account.first_name")}
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
                                {columnVisibility.entry_exit && (
                                    <td className="px-2 py-1  justify-center ">{row?.entry_exit && <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.entry_exit?.color }}>{`${row?.entry_exit?.name}`}</div>}</td>
                                )}

                                {columnVisibility.zone && (
                                    <td className="px-2 py-1 h-[30px] justify-center">
                                        {row?.zone && (
                                            <div
                                                className="flex justify-center items-center rounded-full p-1 text-[#464255] text-center"
                                                style={{
                                                    backgroundColor: row?.zone?.color,
                                                    minWidth: '130px',
                                                    maxWidth: 'max-content',
                                                    wordWrap: 'break-word',
                                                    whiteSpace: 'normal',
                                                }}
                                            >
                                                {`${row?.zone?.name}`}
                                            </div>
                                        )}
                                    </td>
                                )}

                                {/* {columnVisibility.name && (
                                    <td className="px-2 py-1 justify-center ">
                                        {
                                            row?.entry_exit_id == 2 ?
                                                <div
                                                    className="flex justify-center items-center rounded-full p-1 text-[#464255]"
                                                    style={{ backgroundColor: row?.color, width: '40px', height: '40px' }}
                                                >
                                                    {`${row?.name}`}
                                                </div>
                                                :
                                                <div
                                                    className="flex justify-center items-center rounded-lg p-1 text-[#464255]"
                                                    style={{ backgroundColor: row?.color, width: '40px', height: '40px' }}
                                                >
                                                    {`${row?.name}`}
                                                </div>
                                        }
                                    </td>
                                )} */}

                                {columnVisibility.name && (
                                    <td className="px-2 py-1 flex justify-center items-center">
                                        {row?.entry_exit_id == 2 ? (
                                            <div
                                                className="flex justify-center items-center rounded-full p-1 text-[#464255]"
                                                style={{ backgroundColor: row?.color, width: '40px', height: '40px', color: getContrastTextColor(row?.color) }}
                                            >
                                                {`${row?.name}`}
                                            </div>
                                        ) : (
                                            <div
                                                className="flex justify-center items-center rounded-lg p-1 text-[#464255]"
                                                style={{ backgroundColor: row?.color, width: '40px', height: '40px', color: getContrastTextColor(row?.color) }}
                                            >
                                                {`${row?.name}`}
                                            </div>
                                        )}
                                    </td>
                                )}


                                {columnVisibility.desc && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.description}</td>
                                )}

                                {columnVisibility.area_nom_cap && (
                                    <td className="px-2 py-1 text-right text-[#464255]">{row?.area_nominal_capacity ? formatNumberThreeDecimal(row?.area_nominal_capacity) : ''}</td>
                                )}

                                {/* {columnVisibility.supply_ref_quality && (
                                    <td className="px-2 py-1 text-right text-[#464255]">{!!row?.supply_reference_quality_area && formatNumberThreeDecimal(row?.supply_reference_quality_area)}</td>
                                )} */}

                                {columnVisibility.supply_ref_quality && (
                                    <td className="flex justify-center items-center mt-2">
                                        {row?.supply_reference_quality_area_by ? (
                                            row?.supply_reference_quality_area_by?.entry_exit_id == 2 ? (
                                                <div
                                                    className="flex justify-center items-center rounded-full p-1 text-[#464255]"
                                                    style={{
                                                        backgroundColor: row?.supply_reference_quality_area_by?.color,
                                                        width: '40px',
                                                        height: '40px',
                                                    }}
                                                >
                                                    {row?.supply_reference_quality_area_by?.name}
                                                </div>
                                            ) : (
                                                <div
                                                    className="flex justify-center items-center rounded-lg p-1 text-[#464255]"
                                                    style={{
                                                        backgroundColor: row?.supply_reference_quality_area_by?.color,
                                                        width: '40px',
                                                        height: '40px',
                                                    }}
                                                >
                                                    {row?.supply_reference_quality_area_by?.name}
                                                </div>
                                            )
                                        ) : null}
                                    </td>
                                )}

                                {columnVisibility.start_date && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.start_date ? formatDateNoTime(row?.start_date) : ''}</td>
                                )}

                                {columnVisibility.end_date && (
                                    <td className="px-2 py-1 text-[#0DA2A2]">{row?.end_date ? formatDateNoTime(row?.end_date) : ''}</td>
                                )}

                                {columnVisibility.updated_by && (
                                    <td className="px-2 py-1 text-[#464255]">
                                        <div>
                                            <span className="text-[#464255]">{row?.update_by_account?.first_name} {row?.update_by_account?.last_name}</span>
                                            <div className="text-gray-500 text-xs">{row?.update_date ? formatDateTimeSec(row?.update_date) : ''}</div>
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

export default TableAreaHistory;