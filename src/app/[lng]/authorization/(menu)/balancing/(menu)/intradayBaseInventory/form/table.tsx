import { useEffect, useRef } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatNumberFourDecimal, toDayjs } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort, handleSortTimeStamp } from "@/utils/sortTable";
import dayjs from "dayjs";
import { postService } from "@/utils/postService";
interface TableProps {
    openEditForm: (id: any) => void;
    openViewForm: (id: any) => void;
    tableData: any;
    isLoading: any;
    zoneMaster?: any;
    columnVisibility: any;
    userPermission?: any;
    handleModeZone?: any;
}

const TableBalanceIntradayBaseInventory: React.FC<TableProps> = ({ openEditForm, openViewForm, tableData, isLoading, columnVisibility, userPermission, zoneMaster, handleModeZone }) => {

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState<any>(tableData);
    useEffect(() => {
        if (tableData && tableData.length > 0) {
            setSortedData(tableData);
        } else {
            setSortedData([]);
        }

    }, [tableData]);

    const [openPopoverId, setOpenPopoverId] = useState(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const togglePopover = (id: any) => {
        if (openPopoverId === id) {
            setOpenPopoverId(null);
        } else {
            setOpenPopoverId(id);
        }
    };

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    const toggleMenu = (mode: any, id: any) => {
        switch (mode) {
            case "view":
                openViewForm(id);
                setOpenPopoverId(null); // close popover
                break;
            case "edit":
                openEditForm(id);
                setOpenPopoverId(null);
                break;
        }
    }

    // useEffect(() => {}, []);
    const handleClickOutside = (event: MouseEvent) => {
        if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
            setOpenPopoverId(null);
        }
    };

    const today = dayjs().startOf('day');





    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [popoverRef]);

    return (
        <div className={`relative h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md z-1`}>
            {
                isLoading ?
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-9">


                                {!columnVisibility.active_mode && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`}>
                                        {`Active Mode`}
                                    </th>
                                )}

                                {columnVisibility.gas_day && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("gas_day_text", sortState, setSortState, setSortedData, tableData)}>
                                        {`Gas Day`}
                                        {getArrowIcon("gas_day_text")}
                                    </th>
                                )}

                                {columnVisibility.gas_hour && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("gas_hour", sortState, setSortState, setSortedData, tableData)}>
                                        {`Gas Hour`}
                                        {getArrowIcon("gas_hour")}
                                    </th>
                                )}

                                {columnVisibility.timestamp && (
                                    <th scope="col" className={`${table_sort_header_style}  text-center`} onClick={() => handleSortTimeStamp("timestamp", sortState, setSortState, setSortedData, tableData)}>
                                        {`Timestamp`}
                                        {getArrowIcon("timestamp")}
                                    </th>
                                )}

                                {columnVisibility.zone && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("zone_text", sortState, setSortState, setSortedData, tableData)}>
                                        {`Zone`}
                                        {getArrowIcon("zone_text")}
                                    </th>
                                )}

                                {columnVisibility.mode && (
                                    <th scope="col" className={`${table_sort_header_style} `} onClick={() => handleSort("mode", sortState, setSortState, setSortedData, tableData)}>
                                        {`Mode`}
                                        {getArrowIcon("mode")}
                                    </th>
                                )}

                                {columnVisibility.hv && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("hv", sortState, setSortState, setSortedData, tableData)}>
                                        {`HV (BTU/SCF)`}
                                        {getArrowIcon("hv")}
                                    </th>
                                )}

                                {columnVisibility.base_inventory_value && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("base_inventory_value", sortState, setSortState, setSortedData, tableData)}>
                                        {`Base Inventory Value (MMBTU)`}
                                        {getArrowIcon("base_inventory_value")}
                                    </th>
                                )}

                                {columnVisibility.high_max && (
                                    <th scope="col" className={`${table_sort_header_style} text-center hover:bg-[#4b4b4b] bg-[#606060]`} onClick={() => handleSort("high_max", sortState, setSortState, setSortedData, tableData)}>
                                        {`High Max (MMBTU)`}
                                        {getArrowIcon("high_max")}
                                    </th>
                                )}

                                {columnVisibility.high_difficult_day && (
                                    <th scope="col" className={`${table_sort_header_style} text-center hover:bg-[#a247c3] bg-[#A855C5]`} onClick={() => handleSort("high_difficult_day", sortState, setSortState, setSortedData, tableData)}>
                                        {`High Difficult Day`}
                                        {getArrowIcon("high_difficult_day")}
                                    </th>
                                )}

                                {columnVisibility.high_red && (
                                    <th scope="col" className={`${table_sort_header_style} text-center hover:bg-[#cd373e] bg-[#EB484F]`} onClick={() => handleSort("high_red", sortState, setSortState, setSortedData, tableData)}>
                                        {`High Red (MMBTU)`}
                                        {getArrowIcon("high_red")}
                                    </th>
                                )}

                                {columnVisibility.high_orange && (
                                    <th scope="col" className={`${table_sort_header_style} text-center hover:bg-[#ce7231] bg-[#EF8538]`} onClick={() => handleSort("high_orange", sortState, setSortState, setSortedData, tableData)}>
                                        {`High Orange (MMBTU)`}
                                        {getArrowIcon("high_orange")}
                                    </th>
                                )}

                                {columnVisibility.alert_high && (
                                    <th scope="col" className={`${table_sort_header_style} text-center hover:bg-[#c9a830] bg-[#EAC12E]`} onClick={() => handleSort("alert_high", sortState, setSortState, setSortedData, tableData)}>
                                        {`Alert High (MMBTU)`}
                                        {getArrowIcon("alert_high")}
                                    </th>
                                )}

                                {columnVisibility.alert_low && (
                                    <th scope="col" className={`${table_sort_header_style} text-center hover:bg-[#c9a830] bg-[#EAC12E]`} onClick={() => handleSort("alert_low", sortState, setSortState, setSortedData, tableData)}>
                                        {`Alert Low (MMBTU)`}
                                        {getArrowIcon("alert_low")}
                                    </th>
                                )}

                                {columnVisibility.low_orange && (
                                    <th scope="col" className={`${table_sort_header_style} text-center hover:bg-[#ce7231] bg-[#EF8538]`} onClick={() => handleSort("low_orange", sortState, setSortState, setSortedData, tableData)}>
                                        {`Low Orange (MMBTU)`}
                                        {getArrowIcon("low_orange")}
                                    </th>
                                )}

                                {columnVisibility.low_red && (
                                    <th scope="col" className={`${table_sort_header_style} text-center hover:bg-[#cd373e] bg-[#EB484F]`} onClick={() => handleSort("low_red", sortState, setSortState, setSortedData, tableData)}>
                                        {`Low Red (MMBTU)`}
                                        {getArrowIcon("low_red")}
                                    </th>
                                )}

                                {columnVisibility.low_difficult_day && (
                                    <th scope="col" className={`${table_sort_header_style} text-center hover:bg-[#a247c3] bg-[#A855C5]`} onClick={() => handleSort("low_difficult_day", sortState, setSortState, setSortedData, tableData)}>
                                        {`Low Difficult Day`}
                                        {getArrowIcon("low_difficult_day")}
                                    </th>
                                )}

                                {columnVisibility.low_max && (
                                    <th scope="col" className={`${table_sort_header_style} text-center hover:bg-[#4b4b4b] bg-[#606060]`} onClick={() => handleSort("low_max", sortState, setSortState, setSortedData, tableData)}>
                                        {`Low Min (MMBTU)`}
                                        {getArrowIcon("low_max")}
                                    </th>
                                )}

                            </tr>
                        </thead>

                        <tbody>
                            {sortedData && sortedData?.map((row: any, index: any) => {
                                const isBeforeToday = row?.gas_day ? toDayjs(row?.gas_day).isBefore(today) : true;
                                return (
                                    <tr
                                        key={row?.id}
                                        className={`${table_row_style}`}
                                        >

                                        {!columnVisibility?.active_mode && (
                                            <td className={`px-2 py-1 text-[#464255] text-center`}>
                                                <input
                                                    type="checkbox"
                                                    checked={row?.active_mode}
                                                    disabled={(row?.active_mode || false) || isBeforeToday}
                                                    onChange={() => {
                                                        handleModeZone(row)
                                                        // mode: "Base"
                                                        // zone_text: "East"
                                                        // active
                                                    }}
                                                    className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1] disabled:opacity-100 disabled:cursor-not-allowed "
                                                />
                                            </td>
                                        )}

                                        {columnVisibility?.gas_day && (
                                            <td className={`px-2 py-1 text-[#464255] text-center`}>
                                                {row?.gas_day ? toDayjs(row?.gas_day).format("DD/MM/YYYY") : ''}
                                            </td>
                                        )}

                                        {columnVisibility?.gas_hour && (
                                            <td className={`px-2 py-1 text-[#464255] text-center`}>
                                                {/* {row?.gas_hour ? row?.gas_hour + ':00' : ''} */}
                                                {row?.gas_hour ? row?.gas_hour : ''}
                                            </td>
                                        )}

                                        {columnVisibility?.timestamp && (
                                            <td className={`px-2 py-1 text-[#464255] text-center min-w-[170px] max-w-[500px]`}>
                                                {/* {row?.timestamp ? row?.timestamp : ''} */}
                                                {row?.timestamp ? dayjs(row?.timestamp, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY HH:mm:ss') : ''}
                                            </td>
                                            // <td className="px-2 py-1 text-[#464255]">{row?.submitted_timestamp ? formatDate(row?.submitted_timestamp) : ''}</td>

                                        )}

                                        {columnVisibility?.zone && (
                                            // <td className={`px-2 py-1`}>
                                            //     <div className="w-full flex justify-center items-center px-[20px]">
                                            //         <div className="flex w-[120px] justify-center rounded-full px-1 py-2 text-[#464255]" style={{ backgroundColor: row?.zoneObj?.color }}>{`${row?.zoneObj?.name ? row?.zoneObj?.name : ''}`}</div>
                                            //     </div>
                                            // </td>
                                            <td className={`px-2 py-1 text-[#464255] text-center`}>
                                                {row?.zone_text ? row.zone_text : row?.zoneObj?.name ? row.zoneObj.name : ''}
                                            </td>
                                        )}

                                        {columnVisibility?.mode && (
                                            <td className={`px-2 py-1 text-[#464255] min-w-[200px] max-w-[500px]`}>
                                                {row?.mode ? row?.mode : ''}
                                            </td>
                                        )}

                                        {columnVisibility?.hv && (
                                            <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                {row?.hv ? formatNumberFourDecimal(row?.hv) : ''}
                                            </td>
                                        )}

                                        {columnVisibility?.base_inventory_value && (
                                            <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                {row?.base_inventory_value ? formatNumberFourDecimal(row?.base_inventory_value) : ''}
                                            </td>
                                        )}

                                        {columnVisibility?.high_max && (
                                            <td className={`px-2 py-1 text-[#4b4b4b] bg-[#c9c9c9] font-semibold text-right`}>
                                                {row?.high_max ? formatNumberFourDecimal(row?.high_max) : ''}
                                            </td>
                                        )}

                                        {columnVisibility?.high_difficult_day && (
                                            <td className={`px-2 py-1 text-[#A855C5] bg-[#A855C51A] font-semibold text-right`}>
                                                {row?.high_difficult_day ? formatNumberFourDecimal(row?.high_difficult_day) : ''}
                                            </td>
                                        )}

                                        {columnVisibility?.high_red && (
                                            <td className={`px-2 py-1 text-[#ED1B24] bg-[#EB484F1A] font-semibold text-right`}>
                                                {row?.high_red ? formatNumberFourDecimal(row?.high_red) : ''}
                                            </td>
                                        )}

                                        {columnVisibility?.high_orange && (
                                            <td className={`px-2 py-1 text-[#F06500] bg-[#EF85381A] font-semibold text-right`}>
                                                {row?.high_orange ? formatNumberFourDecimal(row?.high_orange) : ''}
                                            </td>
                                        )}


                                        {columnVisibility?.alert_high && (
                                            <td className={`px-2 py-1 text-[#DFB419] bg-[#EAC12E1A] font-semibold text-right`}>
                                                {row?.alert_high ? formatNumberFourDecimal(row?.alert_high) : ''}
                                            </td>
                                        )}

                                        {columnVisibility?.alert_low && (
                                            <td className={`px-2 py-1 text-[#DFB419] bg-[#EAC12E1A] font-semibold text-right`}>
                                                {row?.alert_low ? formatNumberFourDecimal(row?.alert_low) : ''}
                                            </td>
                                        )}

                                        {columnVisibility?.low_orange && (
                                            <td className={`px-2 py-1 text-[#F06500] bg-[#EF85381A] font-semibold text-right`}>
                                                {row?.low_orange ? formatNumberFourDecimal(row?.low_orange) : ''}
                                            </td>
                                        )}

                                        {columnVisibility?.low_red && (
                                            <td className={`px-2 py-1 text-[#ED1B24] bg-[#EB484F1A] font-semibold text-right`}>
                                                {row?.low_red ? formatNumberFourDecimal(row?.low_red) : ''}
                                            </td>
                                        )}

                                        {columnVisibility?.low_difficult_day && (
                                            <td className={`px-2 py-1 text-[#A855C5] bg-[#A855C51A] font-semibold text-right`}>
                                                {row?.low_difficult_day ? formatNumberFourDecimal(row?.low_difficult_day) : ''}
                                            </td>
                                        )}

                                        {columnVisibility?.low_max && (
                                            <td className={`px-2 py-1 text-[#4b4b4b] bg-[#c9c9c9] font-semibold text-right`}>
                                                {row?.low_max ? formatNumberFourDecimal(row?.low_max) : ''}
                                            </td>
                                        )}

                                    </tr>
                                )
                            }

                            )}
                        </tbody>
                    </table>
                    :
                    <TableSkeleton />
            }
        </div>
    )
}

export default TableBalanceIntradayBaseInventory;