import { useEffect, useRef } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatDateNoTime, formatNumberFourDecimal } from '@/utils/generalFormatter';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import BtnActionTable from "@/components/other/btnActionInTable";
import NodataTable from "@/components/other/nodataTable";

interface TableProps {
    openEditForm: (id: any) => void;
    openViewForm: (id: any) => void;
    tableData: any;
    isLoading: any;
    columnVisibility: any;
    userPermission?: any;
    selectedRoles: any;
    setSelectedRoles: any;
    userDT: any;
    setMakeFetch?: any;
}

const TableAlloCurtailNomination: React.FC<TableProps> = ({ openEditForm, openViewForm, tableData, isLoading, columnVisibility, userPermission, selectedRoles, setSelectedRoles, userDT, setMakeFetch }) => {

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);

    useEffect(() => {
        if (tableData && tableData.length > 0) {
            setSortedData(tableData);
        }else{
            setSortedData([]);
        }
    }, [tableData]);

    const [openPopoverId, setOpenPopoverId] = useState(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const togglePopover = (id: any) => {
        if (openPopoverId === id) {
            setOpenPopoverId(null); // Close the popover if it's already open
        } else {
            setOpenPopoverId(id); // Open the popover for the clicked row
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

    return (
        <div className="h-[calc(100vh-380px)] overflow-y-auto overflow-x-auto rounded-t-md">
            {/* <table className="min-w-full text-sm text-left rtl:text-right text-gray-500 whitespace-nowrap"> */}
            {
                isLoading ?
                    <table className="table-auto min-w-full text-sm rtl:text-right text-gray-500 whitespace-nowrap">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-9">

                                {columnVisibility.case_id && (
                                    <th scope="col" className={`${table_sort_header_style} `} onClick={() => handleSort("case_id", sortState, setSortState, setSortedData, tableData)}>
                                        {`Case ID`}
                                        {getArrowIcon("case_id")}
                                    </th>
                                )}

                                {columnVisibility.gas_day && (
                                    <th scope="col" className={`${table_sort_header_style} `} onClick={() => handleSort("gas_day", sortState, setSortState, setSortedData, tableData)}>
                                        {`Gas Day`}
                                        {getArrowIcon("gas_day")}
                                    </th>
                                )}

                                {columnVisibility.area && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("areaObj.name", sortState, setSortState, setSortedData, tableData)}>
                                        {`Area`}
                                        {getArrowIcon("areaObj.name")}
                                    </th>
                                )}

                                {columnVisibility.nomination_point && (
                                    <th scope="col" className={`${table_sort_header_style} `} onClick={() => handleSort("nomination_point", sortState, setSortState, setSortedData, tableData)}>
                                        {`Nomination Point`}
                                        {getArrowIcon("nomination_point")}
                                    </th>
                                )}

                                {columnVisibility.maximum_capacity && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("max_capacity", sortState, setSortState, setSortedData, tableData)}>
                                        {`Maximum Capacity`}
                                        {getArrowIcon("max_capacity")}
                                    </th>
                                )}

                                {columnVisibility.nominated_value && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("nomination_value", sortState, setSortState, setSortedData, tableData)}>
                                        {`Nomination Value`}
                                        {getArrowIcon("nomination_value")}
                                    </th>
                                )}

                                {columnVisibility.units && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("unit", sortState, setSortState, setSortedData, tableData)}>
                                        {`Unit`}
                                        {getArrowIcon("unit")}
                                    </th>
                                )}

                                {columnVisibility.action && (
                                    <th scope="col" className={`${table_header_style} text-center`}>
                                        {`Action`}
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

                                        {columnVisibility.case_id && (
                                            <td className="px-2 py-1  text-[#464255] justify-center ">{row?.case_id ? row?.case_id : ''}</td>
                                        )}

                                        {columnVisibility.gas_day && (
                                            <td className="px-2 py-1 text-[#464255]">{row?.gas_day ? formatDateNoTime(row?.gas_day) : ''}</td>
                                        )}

                                        {columnVisibility.area && (
                                            <td className="px-2 py-1 justify-center flex min-w-[120px] text-center">
                                                {
                                                    row?.areaObj ?
                                                        row?.areaObj?.entry_exit_id == 2 ?
                                                            <div
                                                                className="flex justify-center items-center rounded-full p-1 text-[#464255]"
                                                                style={{ backgroundColor: row?.areaObj?.color, width: '40px', height: '40px' }}
                                                            >
                                                                {`${row?.areaObj?.name}`}
                                                            </div>
                                                            :
                                                            <div
                                                                className="flex justify-center items-center rounded-lg p-1 text-[#464255]"
                                                                style={{ backgroundColor: row?.areaObj?.color, width: '40px', height: '40px' }}
                                                            >
                                                                {`${row?.areaObj?.name}`}
                                                            </div>
                                                        : null
                                                }
                                            </td>
                                        )}

                                        {columnVisibility?.nomination_point && (
                                            <td className="px-4 py-1 text-[#464255] ">
                                                <div>{row?.nomination_point ? row?.nomination_point : null}</div>
                                            </td>
                                        )}

                                        {columnVisibility?.maximum_capacity && (
                                            <td className="px-4 py-1 text-[#464255] text-right">
                                                <div>{row?.max_capacity ? formatNumberFourDecimal(row?.max_capacity) : null}</div>
                                            </td>
                                        )}

                                        {columnVisibility?.nominated_value && (
                                            <td className="px-4 py-1 text-[#464255] text-right">
                                                <div>{row?.nomination_value ? formatNumberFourDecimal(row?.nomination_value) : null}</div>
                                            </td>
                                        )}

                                        {columnVisibility?.units && (
                                            <td className="px-2 py-1 text-[#464255] text-right">
                                                <div>{row?.unit ? row?.unit : null}</div>
                                            </td>
                                        )}

                                        {columnVisibility.action && (
                                            <td className="px-2 py-1">
                                                <div className="relative inline-flex justify-center items-center w-full">
                                                    <BtnActionTable togglePopover={togglePopover} row_id={row?.id} disable={!userPermission?.f_view ? true : false} />
                                                    {openPopoverId === row?.id && (
                                                        <div ref={popoverRef}
                                                            className="absolute left-[-8rem] top-[-10px] mt-2 w-36 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                                                            <ul className="py-2">
                                                                {
                                                                    userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("view", row?.id) }}><RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`View`}</li>
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

            {
                isLoading && sortedData?.length <= 0 && <NodataTable />
            }
        </div>
    )
}

export default TableAlloCurtailNomination;