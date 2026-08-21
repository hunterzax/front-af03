import { useEffect } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatNumberThreeDecimal } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import NodataTable from "@/components/other/nodataTable";
import { Tune } from "@mui/icons-material"
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import PaginationComponent from "@/components/other/globalPagination";

interface TableProps {
    openEditForm: (id: any) => void;
    openViewForm: (id: any) => void;
    openAllFileModal: (id?: any, data?: any) => void;
    openReasonModal: (id?: any, data_comment?: any, row?: any) => void;
    openSubmissionModal: (id?: any, data_comment?: any, row?: any) => void;
    setDataReGen: any;
    selectedRoles: any;
    setSelectedRoles: any;
    tableData: any;
    isLoading: any;
    columnVisibility: any;
    userPermission?: any;
}

const TableEntryComposition: React.FC<any> = ({ tableData, isLoading, zoneMaster, dataMasterZone, nominationPointMaster }) => {

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData?.data_temp2?.valueData);
    const [sortedMasterData, setMasterData] = useState(tableData?.data_temp2?.valueData);
    const [isReserveNull, setIsReserveNull] = useState<boolean>(false);

    useEffect(() => {

        if (tableData && tableData?.data_temp2?.valueData?.length > 0) {
            if (tableData?.reserve_balancing_gas_contract == null) {
                setIsReserveNull(true)
            }
            const updated_table_data = tableData?.data_temp2?.valueData?.map((row: any) => {
                const point_name = row?.["1"]
                const findPoint = nominationPointMaster?.find((np: any) => np?.nomination_point == point_name)
                const matchingZone = dataMasterZone?.find((f: any) => f?.name === row["0"] && f?.entry_exit_id === findPoint?.entry_exit_id)

                // const matchingZone = dataMasterZone?.find((zone: any) => zone.name === row["0"]); // เดิมโรงงาน
                return {
                    ...row,
                    zone: matchingZone || null,
                };
            });
            setSortedData(updated_table_data);
            setMasterData(updated_table_data);
        } else {
            setSortedData([]);
            setMasterData([]);
        }
    }, [tableData]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    const initialColumns: any = [
        { key: 'zone', label: 'Zone', visible: true },
        { key: 'point', label: 'Point', visible: true },
        { key: 'co2', label: 'CO2', visible: true },
        { key: 'c1', label: 'C1', visible: true },
        { key: 'c2', label: 'C2', visible: true },
        { key: 'c3', label: 'C3', visible: true },
        { key: 'ic4', label: 'IC4', visible: true },
        { key: 'nc4', label: 'nC4', visible: true },
        { key: 'ic5', label: 'IC5', visible: true },
        { key: 'nc5', label: 'nC5', visible: true },
        { key: 'c6', label: 'C6', visible: true },
        { key: 'c7', label: 'C7', visible: true },
        { key: 'c2_plus', label: 'C2+', visible: true },
        { key: 'n2', label: 'N2', visible: true },
        { key: 'o2', label: 'O2', visible: true },
        { key: 'h2s', label: 'H2S', visible: true },
        { key: 's', label: 'S', visible: true },
        { key: 'hg', label: 'HG', visible: true },
    ];

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
    );

    const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const handleColumnToggle = (columnKey: string) => {
        setColumnVisibility((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    };

    // ############### PAGINATION ###############
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [paginatedData, setPaginatedData] = useState<any[]>([]);

    useEffect(() => {
        if (sortedMasterData) {
            setPaginatedData(sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        }
    }, [sortedData, currentPage, itemsPerPage])

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (itemsPerPage: number) => {
        setItemsPerPage(itemsPerPage);
        setCurrentPage(1);
    };

    return (
        <>
            <div className={`relative h-[calc(100vh-340px)] overflow-y-auto block  rounded-t-md z-1`}>
                <div className="text-sm flex sm:flex-row flex-wrap items-center justify-between py-2">
                    <div onClick={handleTogglePopover} >
                        <Tune
                            className="cursor-pointer rounded-lg"
                            style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                        />
                    </div>
                </div>

                {
                    isLoading ?
                        // <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                        <table className={`w-full text-sm text-left rtl:text-right text-gray-500 `}>
                            <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                                <tr className="h-9">

                                    {columnVisibility.zone && (
                                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("0", sortState, setSortState, setSortedData, sortedMasterData)}>
                                            {`Zone`}
                                            {getArrowIcon("0")}
                                        </th>
                                    )}

                                    {columnVisibility.point && (
                                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("1", sortState, setSortState, setSortedData, sortedMasterData)}>
                                            {`Point`}
                                            {getArrowIcon("1")}
                                        </th>
                                    )}

                                    {columnVisibility.co2 && (
                                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("2", sortState, setSortState, setSortedData, sortedMasterData)}>
                                            {`CO2 % mol`}
                                            {getArrowIcon("2")}
                                        </th>
                                    )}

                                    {columnVisibility.c1 && (
                                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("3", sortState, setSortState, setSortedData, sortedMasterData)}>
                                            {`C1 % mol`}
                                            {getArrowIcon("3")}
                                        </th>
                                    )}

                                    {columnVisibility.c2 && (
                                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("4", sortState, setSortState, setSortedData, sortedMasterData)}>
                                            {`C2 % mol`}
                                            {getArrowIcon("4")}
                                        </th>
                                    )}

                                    {columnVisibility.c3 && (
                                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("5", sortState, setSortState, setSortedData, sortedMasterData)}>
                                            {`C3 % mol`}
                                            {getArrowIcon("5")}
                                        </th>
                                    )}

                                    {columnVisibility.ic4 && (
                                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("6", sortState, setSortState, setSortedData, sortedMasterData)}>
                                            {`IC4 % mol`}
                                            {getArrowIcon("6")}
                                        </th>
                                    )}

                                    {columnVisibility.nc4 && (
                                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("7", sortState, setSortState, setSortedData, sortedMasterData)}>
                                            {`nC4 % mol`}
                                            {getArrowIcon("7")}
                                        </th>
                                    )}

                                    {columnVisibility.ic5 && (
                                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("8", sortState, setSortState, setSortedData, sortedMasterData)}>
                                            {`IC5 % mol`}
                                            {getArrowIcon("8")}
                                        </th>
                                    )}

                                    {columnVisibility.nc5 && (
                                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("9", sortState, setSortState, setSortedData, sortedMasterData)}>
                                            {`nC5 % mol`}
                                            {getArrowIcon("9")}
                                        </th>
                                    )}

                                    {columnVisibility.c6 && (
                                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("10", sortState, setSortState, setSortedData, sortedMasterData)}>
                                            {`C6 % mol`}
                                            {getArrowIcon("10")}
                                        </th>
                                    )}

                                    {columnVisibility.c7 && (
                                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("11", sortState, setSortState, setSortedData, sortedMasterData)}>
                                            {`C7 % mol`}
                                            {getArrowIcon("11")}
                                        </th>
                                    )}

                                    {columnVisibility.c2_plus && (
                                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("12", sortState, setSortState, setSortedData, sortedMasterData)}>
                                            {`C2+ % mol`}
                                            {getArrowIcon("12")}
                                        </th>
                                    )}

                                    {columnVisibility.n2 && (
                                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("13", sortState, setSortState, setSortedData, sortedMasterData)}>
                                            {`N2 % mol`}
                                            {getArrowIcon("13")}
                                        </th>
                                    )}

                                    {columnVisibility.o2 && (
                                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("14", sortState, setSortState, setSortedData, sortedMasterData)}>
                                            {`O2 % mol`}
                                            {getArrowIcon("14")}
                                        </th>
                                    )}

                                    {columnVisibility.h2s && (
                                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("15", sortState, setSortState, setSortedData, sortedMasterData)}>
                                            {`H2S % mol`}
                                            {getArrowIcon("15")}
                                        </th>
                                    )}

                                    {columnVisibility.s && (
                                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("16", sortState, setSortState, setSortedData, sortedMasterData)}>
                                            {`S % mol`}
                                            {getArrowIcon("16")}
                                        </th>
                                    )}

                                    {columnVisibility.hg && (
                                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("17", sortState, setSortState, setSortedData, sortedMasterData)}>
                                            {`HG % mol`}
                                            {getArrowIcon("17")}
                                        </th>
                                    )}
                                </tr>
                            </thead>

                            <tbody>
                                {
                                    paginatedData && paginatedData?.map((row: any, index: any) => {
                                        return (
                                            <tr
                                                key={row?.id}
                                                className={`${table_row_style}`}
                                            >
                                                {columnVisibility.zone && (
                                                    <td className="px-2 py-1 h-[30px] justify-center">
                                                        {(() => {
                                                            const filter_zone = zoneMaster?.data?.find((item: any) => item.name === row?.["0"].trim() && item.entry_exit_id == 1);

                                                            return filter_zone && <div
                                                                className="flex justify-center items-center rounded-full p-1 text-[#464255] text-center"
                                                                style={{
                                                                    backgroundColor: filter_zone?.color,
                                                                    minWidth: '130px',
                                                                    maxWidth: 'max-content',
                                                                    wordWrap: 'break-word',
                                                                    whiteSpace: 'normal',
                                                                }}
                                                            >
                                                                {`${filter_zone?.name}`}
                                                            </div>
                                                        })()}
                                                    </td>
                                                )}

                                                {columnVisibility.point && (
                                                    <td className="px-2 py-1 text-[#464255] min-w-[120px] text-center">{row?.["1"] ? row?.["1"] : ''}</td>
                                                )}

                                                {columnVisibility.co2 && (
                                                    // <td className="px-2 py-1 text-[#464255] min-w-[120px] text-right">{row?.["2"] ? formatNumberThreeDecimal(row?.["2"]) : ''}</td>
                                                    // <td className={`px-2 py-1 min-w-[120px] text-right ${((parseFloat(row?.["2"]) < row?.zone?.zone_master_quality?.[0]?.v2_carbon_dioxide_min || parseFloat(row?.["2"]) > row?.zone?.zone_master_quality?.[0]?.v2_carbon_dioxide_max)) && isReserveNull ? "text-[#ED1B24]" : "text-[#464255]"}`}>{row?.["2"] ? formatNumberThreeDecimal(row?.["2"]) : ''}</td>

                                                    <td
                                                        className={(() => {
                                                            const val = row?.["2"];
                                                            const n = val == null ? null : Number(String(val).replace(/,/g, "").trim());

                                                            const qm = row?.zone?.zone_master_quality?.[0];
                                                            const min = qm?.v2_carbon_dioxide_min;
                                                            const max = qm?.v2_carbon_dioxide_max;

                                                            const hasMin = Number.isFinite(min);
                                                            const hasMax = Number.isFinite(max);
                                                            const hasBounds = hasMin || hasMax; // ถ้าทั้งคู่ไม่มี → ไม่เช็ค

                                                            const outOfRange =
                                                                n != null &&
                                                                Number.isFinite(n) &&
                                                                hasBounds &&
                                                                ((hasMin && n < (min as number)) || (hasMax && n > (max as number)));

                                                            return `px-2 py-1 min-w-[120px] text-right ${(outOfRange && isReserveNull) ? "text-[#ED1B24]" : "text-[#464255]"}`;
                                                        })()}
                                                    >
                                                        {row?.["2"] ? formatNumberThreeDecimal(row?.["2"]) : ''}
                                                    </td>
                                                )}

                                                {columnVisibility.c1 && (
                                                    // <td className="px-2 py-1 text-[#464255] min-w-[120px] text-right">{row?.["3"] ? formatNumberThreeDecimal(row?.["3"]) : ''}</td>
                                                    // <td className={`px-2 py-1 min-w-[120px] text-right ${((parseFloat(row?.["3"]) < row?.zone?.zone_master_quality?.[0]?.v2_methane_min || parseFloat(row?.["3"]) > row?.zone?.zone_master_quality?.[0]?.v2_methane_max)) && isReserveNull ? "text-[#ED1B24]" : "text-[#464255]"}`}>{row?.["3"] ? formatNumberThreeDecimal(row?.["3"]) : ''}</td>
                                                    <td
                                                        className={(() => {
                                                            const val = row?.["3"];
                                                            const n = val == null ? null : Number(String(val).replace(/,/g, "").trim());

                                                            const qm = row?.zone?.zone_master_quality?.[0];
                                                            const min = qm?.v2_methane_min;
                                                            const max = qm?.v2_methane_max;

                                                            const hasMin = Number.isFinite(min);
                                                            const hasMax = Number.isFinite(max);
                                                            const hasBounds = hasMin || hasMax; // ถ้าทั้งคู่ไม่มี → ไม่เช็ค

                                                            const outOfRange =
                                                                n != null &&
                                                                Number.isFinite(n) &&
                                                                hasBounds &&
                                                                ((hasMin && n < (min as number)) || (hasMax && n > (max as number)));

                                                            return `px-2 py-1 min-w-[120px] text-right ${(outOfRange && isReserveNull) ? "text-[#ED1B24]" : "text-[#464255]"}`;
                                                        })()}
                                                    >
                                                        {row?.["3"] ? formatNumberThreeDecimal(row?.["3"]) : ''}
                                                    </td>
                                                )}

                                                {columnVisibility.c2 && (
                                                    <td className={`px-2 py-1 text-[#464255] min-w-[120px] text-right `}>{row?.["4"] ? formatNumberThreeDecimal(row?.["4"]) : ''}</td>
                                                )}

                                                {columnVisibility.c3 && (
                                                    <td className={`px-2 py-1 text-[#464255] min-w-[120px] text-right`}>{row?.["5"] ? formatNumberThreeDecimal(row?.["5"]) : ''}</td>
                                                )}

                                                {columnVisibility.ic4 && (
                                                    <td className={`px-2 py-1 text-[#464255] min-w-[120px] text-right`}>{row?.["6"] ? formatNumberThreeDecimal(row?.["6"]) : ''}</td>
                                                )}

                                                {columnVisibility.nc4 && (
                                                    <td className={`px-2 py-1 text-[#464255] min-w-[120px] text-right`}>{row?.["7"] ? formatNumberThreeDecimal(row?.["7"]) : ''}</td>
                                                )}

                                                {columnVisibility.ic5 && (
                                                    <td className={`px-2 py-1 text-[#464255] min-w-[120px] text-right`}>{row?.["8"] ? formatNumberThreeDecimal(row?.["8"]) : ''}</td>
                                                )}

                                                {columnVisibility.nc5 && (
                                                    <td className={`px-2 py-1 text-[#464255] min-w-[120px] text-right`}>{row?.["9"] ? formatNumberThreeDecimal(row?.["9"]) : ''}</td>
                                                )}

                                                {columnVisibility.c6 && (
                                                    <td className={`px-2 py-1 text-[#464255] min-w-[120px] text-right`}>{row?.["10"] ? formatNumberThreeDecimal(row?.["10"]) : ''}</td>
                                                )}

                                                {columnVisibility.c7 && (
                                                    <td className={`px-2 py-1 text-[#464255] min-w-[120px] text-right`}>{row?.["11"] ? formatNumberThreeDecimal(row?.["11"]) : ''}</td>
                                                )}

                                                {columnVisibility.c2_plus && (
                                                    // <td className={`px-2 py-1 min-w-[120px] text-right ${((parseFloat(row?.["12"]) < row?.zone?.zone_master_quality?.[0]?.v2_c2_plus_min || parseFloat(row?.["12"]) > row?.zone?.zone_master_quality?.[0]?.v2_c2_plus_max)) && isReserveNull ? "text-[#ED1B24]" : "text-[#464255]"}`}>{row?.["12"] ? formatNumberThreeDecimal(row?.["12"]) : ''}</td>
                                                    <td
                                                        className={(() => {
                                                            const val = row?.["12"];
                                                            const n = val == null ? null : Number(String(val).replace(/,/g, "").trim());

                                                            const qm = row?.zone?.zone_master_quality?.[0];
                                                            const min = qm?.v2_c2_plus_min;
                                                            const max = qm?.v2_c2_plus_max;

                                                            const hasMin = Number.isFinite(min);
                                                            const hasMax = Number.isFinite(max);
                                                            const hasBounds = hasMin || hasMax; // ถ้าทั้งคู่ไม่มี → ไม่เช็ค

                                                            const outOfRange =
                                                                n != null &&
                                                                Number.isFinite(n) &&
                                                                hasBounds &&
                                                                ((hasMin && n < (min as number)) || (hasMax && n > (max as number)));

                                                            return `px-2 py-1 min-w-[120px] text-right ${(outOfRange && isReserveNull) ? "text-[#ED1B24]" : "text-[#464255]"}`;
                                                        })()}
                                                    >
                                                        {row?.["12"] ? formatNumberThreeDecimal(row?.["12"]) : ''}
                                                    </td>
                                                )}

                                                {columnVisibility.n2 && (
                                                    // <td className={`px-2 py-1 min-w-[120px] text-right ${((parseFloat(row?.["13"]) < row?.zone?.zone_master_quality?.[0]?.v2_nitrogen_min || parseFloat(row?.["13"]) > row?.zone?.zone_master_quality?.[0]?.v2_nitrogen_max)) && isReserveNull ? "text-[#ED1B24]" : "text-[#464255]"}`}>{row?.["13"] ? formatNumberThreeDecimal(row?.["13"]) : ''}</td>
                                                    <td
                                                        className={(() => {
                                                            const val = row?.["13"];
                                                            const n = val == null ? null : Number(String(val).replace(/,/g, "").trim());

                                                            const qm = row?.zone?.zone_master_quality?.[0];
                                                            const min = qm?.v2_nitrogen_min;
                                                            const max = qm?.v2_nitrogen_max;

                                                            const hasMin = Number.isFinite(min);
                                                            const hasMax = Number.isFinite(max);
                                                            const hasBounds = hasMin || hasMax; // ถ้าทั้งคู่ไม่มี → ไม่เช็ค

                                                            const outOfRange =
                                                                n != null &&
                                                                Number.isFinite(n) &&
                                                                hasBounds &&
                                                                ((hasMin && n < (min as number)) || (hasMax && n > (max as number)));

                                                            return `px-2 py-1 min-w-[120px] text-right ${(outOfRange && isReserveNull) ? "text-[#ED1B24]" : "text-[#464255]"}`;
                                                        })()}
                                                    >
                                                        {row?.["13"] ? formatNumberThreeDecimal(row?.["13"]) : ''}
                                                    </td>
                                                )}

                                                {columnVisibility.o2 && (
                                                    // <td className={`px-2 py-1 min-w-[120px] text-right ${((parseFloat(row?.["14"]) < row?.zone?.zone_master_quality?.[0]?.v2_oxygen_min || parseFloat(row?.["14"]) > row?.zone?.zone_master_quality?.[0]?.v2_oxygen_max)) && isReserveNull ? "text-[#ED1B24]" : "text-[#464255]"}`}>{row?.["14"] ? formatNumberThreeDecimal(row?.["14"]) : ''}</td>
                                                    <td
                                                        className={(() => {
                                                            const val = row?.["14"];
                                                            const n = val == null ? null : Number(String(val).replace(/,/g, "").trim());

                                                            const qm = row?.zone?.zone_master_quality?.[0];
                                                            const min = qm?.v2_oxygen_min;
                                                            const max = qm?.v2_oxygen_max;

                                                            const hasMin = Number.isFinite(min);
                                                            const hasMax = Number.isFinite(max);
                                                            const hasBounds = hasMin || hasMax; // ถ้าทั้งคู่ไม่มี → ไม่เช็ค

                                                            const outOfRange =
                                                                n != null &&
                                                                Number.isFinite(n) &&
                                                                hasBounds &&
                                                                ((hasMin && n < (min as number)) || (hasMax && n > (max as number)));

                                                            return `px-2 py-1 min-w-[120px] text-right ${(outOfRange && isReserveNull) ? "text-[#ED1B24]" : "text-[#464255]"}`;
                                                        })()}
                                                    >
                                                        {row?.["14"] ? formatNumberThreeDecimal(row?.["14"]) : ''}
                                                    </td>

                                                )}

                                                {columnVisibility.h2s && (
                                                    // <td className={`px-2 py-1 min-w-[120px] text-right ${((parseFloat(row?.["15"]) < row?.zone?.zone_master_quality?.[0]?.v2_hydrogen_sulfide_min || parseFloat(row?.["15"]) > row?.zone?.zone_master_quality?.[0]?.v2_hydrogen_sulfide_max)) && isReserveNull ? "text-[#ED1B24]" : "text-[#464255]"}`}>{row?.["15"] ? formatNumberThreeDecimal(row?.["15"]) : ''}</td>
                                                    <td
                                                        className={(() => {
                                                            const val = row?.["15"];
                                                            const n = val == null ? null : Number(String(val).replace(/,/g, "").trim());

                                                            const qm = row?.zone?.zone_master_quality?.[0];
                                                            const min = qm?.v2_hydrogen_sulfide_min;
                                                            const max = qm?.v2_hydrogen_sulfide_max;

                                                            const hasMin = Number.isFinite(min);
                                                            const hasMax = Number.isFinite(max);
                                                            const hasBounds = hasMin || hasMax; // ถ้าทั้งคู่ไม่มี → ไม่เช็ค

                                                            const outOfRange =
                                                                n != null &&
                                                                Number.isFinite(n) &&
                                                                hasBounds &&
                                                                ((hasMin && n < (min as number)) || (hasMax && n > (max as number)));

                                                            return `px-2 py-1 min-w-[120px] text-right ${(outOfRange && isReserveNull) ? "text-[#ED1B24]" : "text-[#464255]"}`;
                                                        })()}
                                                    >
                                                        {row?.["15"] ? formatNumberThreeDecimal(row?.["15"]) : ''}
                                                    </td>
                                                )}

                                                {columnVisibility.s && (
                                                    // <td className={`px-2 py-1 min-w-[120px] text-right ${((parseFloat(row?.["16"]) < row?.zone?.zone_master_quality?.[0]?.v2_total_sulphur_min || parseFloat(row?.["16"]) > row?.zone?.zone_master_quality?.[0]?.v2_total_sulphur_max)) && isReserveNull ? "text-[#ED1B24]" : "text-[#464255]"}`}>{row?.["16"] ? formatNumberThreeDecimal(row?.["16"]) : ''}</td>
                                                    <td
                                                        className={(() => {
                                                            const val = row?.["16"];
                                                            const n = val == null ? null : Number(String(val).replace(/,/g, "").trim());

                                                            const qm = row?.zone?.zone_master_quality?.[0];
                                                            const min = qm?.v2_total_sulphur_min;
                                                            const max = qm?.v2_total_sulphur_max;

                                                            const hasMin = Number.isFinite(min);
                                                            const hasMax = Number.isFinite(max);
                                                            const hasBounds = hasMin || hasMax; // ถ้าทั้งคู่ไม่มี → ไม่เช็ค

                                                            const outOfRange =
                                                                n != null &&
                                                                Number.isFinite(n) &&
                                                                hasBounds &&
                                                                ((hasMin && n < (min as number)) || (hasMax && n > (max as number)));

                                                            return `px-2 py-1 min-w-[120px] text-right ${(outOfRange && isReserveNull) ? "text-[#ED1B24]" : "text-[#464255]"}`;
                                                        })()}
                                                    >
                                                        {row?.["16"] ? formatNumberThreeDecimal(row?.["16"]) : ''}
                                                    </td>
                                                )}

                                                {columnVisibility.hg && (
                                                    // <td className={`px-2 py-1 min-w-[120px] text-right ${((parseFloat(row?.["17"]) < row?.zone?.zone_master_quality?.[0]?.v2_mercury_min || parseFloat(row?.["17"]) > row?.zone?.zone_master_quality?.[0]?.v2_mercury_max)) && isReserveNull ? "text-[#ED1B24]" : "text-[#464255]"}`}>{row?.["17"] ? formatNumberThreeDecimal(row?.["17"]) : ''}</td>
                                                    <td
                                                        className={(() => {
                                                            const val = row?.["17"];
                                                            const n = val == null ? null : Number(String(val).replace(/,/g, "").trim());

                                                            const qm = row?.zone?.zone_master_quality?.[0];
                                                            const min = qm?.v2_mercury_min;
                                                            const max = qm?.v2_mercury_max;

                                                            const hasMin = Number.isFinite(min);
                                                            const hasMax = Number.isFinite(max);
                                                            const hasBounds = hasMin || hasMax; // ถ้าทั้งคู่ไม่มี → ไม่เช็ค

                                                            const outOfRange =
                                                                n != null &&
                                                                Number.isFinite(n) &&
                                                                hasBounds &&
                                                                ((hasMin && n < (min as number)) || (hasMax && n > (max as number)));

                                                            return `px-2 py-1 min-w-[120px] text-right ${(outOfRange && isReserveNull) ? "text-[#ED1B24]" : "text-[#464255]"}`;
                                                        })()}
                                                    >
                                                        {row?.["17"] ? formatNumberThreeDecimal(row?.["17"]) : ''}
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

                <ColumnVisibilityPopover
                    open={open}
                    anchorEl={anchorEl}
                    setAnchorEl={setAnchorEl}
                    columnVisibility={columnVisibility}
                    handleColumnToggle={handleColumnToggle}
                    initialColumns={initialColumns}
                />
            </div>

            <PaginationComponent
                totalItems={sortedMasterData?.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
            />
        </>
    )
}

export default TableEntryComposition;