import { useEffect, useRef } from "react";
import React, { FC, useState } from 'react';
import TableSkeleton, { DefaultSkeleton } from '@/components/material_custom/DefaultSkeleton';
import { decorateRowsWithGroupSums, formatNumberSixDecimalNom, formatNumberThreeDecimal, formatNumberThreeDecimalNoComma, formatNumberThreeDecimalNom, formatNumberTwoDecimal, formatNumberTwoDecimalNom, getContrastTextColor } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort, handleSortHOnly } from "@/utils/sortTable";
import NodataTable from "@/components/other/nodataTable";
import { Tab, Tabs } from "@mui/material";
import { Tune } from "@mui/icons-material"
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import PaginationComponent from "@/components/other/globalPagination";
import BtnExport from "@/components/other/btnExport";
import SearchInput from "@/components/other/searchInput";
import BtnText from "@/components/other/btnText";

// หน้านี้มี Tab Nomination, Area, Total System
// tab MMSCF, MMBTU
// tab hour ['All Day' ,'1-6 Hr.' , '7-12 Hr.' , '13-18 Hr.' , '19-24 Hr.']

const TableAllArea: React.FC<any> = ({ checkIsAllAreaImbalance, openWarning, tableData, isLoading, userPermission, zoneText, tempData, setTempData, tempDataConcept, setTempDataConcept, areaMaster, entryExitMaster, setIsEdited, tabEntry, tabConcept, nomData, tabIndex2ndTab, srchCheckbox, activeButton }) => {

    const [dataTable, setDataTable] = useState<any>([]);
    const [sortedData, setSortedData] = useState<any>([]);
    useEffect(() => {

        // v2.0.51 การคำนวณและ validate เพื่อแสดงสีแดง ยังผิดอยู่ ของทุก tab https://app.clickup.com/t/86ev8tun8
        // sum เพื่อ validate summary nom report
        const decorated = decorateRowsWithGroupSums(tableData);
        setDataTable(decorated)
        setSortedData(decorated)

        setCurrentPage(1); // เผื่อกดเสิช จะให้มันกลับไปหน้าแรก

        // setDataTable(tableData)
        // // setSortedData(tableData?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        // setSortedData(tableData)

    }, [tableData])

    const inputClass = "text-[14px] block p-2 h-[37px] w-full border-[1px] bg-white border-[#9CA3AF] outline-none bg-opacity-100 focus:border-[#00ADEF] hover:!p-2 focus:!p-2";
    const [sortState, setSortState] = useState({ column: null, direction: null });

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    // ===================== TABLE HEADER MAP =====================
    const hours = Array.from({ length: 24 }, (_, i) => ({
        key: `h${i + 1}`,
        label: `H${i + 1}`,
        timeRange: `${String(i).padStart(2, "0")}:01 - ${String(i + 1).padStart(2, "0")}:00`
    }));

    // ############### TAB ###############
    const [tabIndexHour, setTabIndexHour] = useState(0);
    const handleChange = (event: any, newValue: any) => {
        // 0 = All Day
        // 1 = 1-6 Hr
        // 2 = 7-12 Hr
        // 3 = 13-18 Hr
        // 4 = 19-24 Hr
        setTabIndexHour(newValue);
    };

    const getVisibleHours = () => {

        switch (tabIndexHour) {
            case 0: return hours;  // H1 - H6
            case 1: return hours.slice(0, 6);  // H1 - H6
            case 2: return hours.slice(6, 12); // H7 - H12
            case 3: return hours.slice(12, 18); // H13 - H18
            case 4: return hours.slice(18, 24); // H19 - H24

            default: return [];
        }
    };

    useEffect(() => {
        getVisibleHours();
    }, [tabIndexHour])

    // ############### COLUMN SHOW/HIDE ENTRY / EXIT ###############

    // if tabIndex = 0 show all
    const initialColumnsTabEntryExit: any = [
        { key: 'gas_day', label: 'Gas Day', visible: true }, // always show
        { key: 'area', label: 'Area', visible: true }, // always show
        // { key: 'total_cap', label: 'Total cap', visible: true }, // always show
        { key: 'total_cap', label: 'Total', visible: true }, // always show
        { key: 'utilization', label: 'Utilization (%)', visible: true }, // always show

        // { key: 'imbalance', label: 'Imbalance', visible: true }, // tab imbalance
        // { key: 'imbalance_percent', label: 'Imbalance (%)', visible: true }, // tab imbalance
        // { key: 'park', label: 'Park', visible: true }, // tab imbalance
        // { key: 'unpark', label: 'Unpark', visible: true }, // tab imbalance
        // { key: 'change_min_invent', label: 'Change Min Invent', visible: true }, // tab imbalance
        // { key: 'shrinkage', label: 'Shrinkage', visible: true }, // tab imbalance

        { key: 'h1', label: 'H1 00:00 - 01:00', visible: true }, // show if tabIndexHour = 0
        { key: 'h2', label: 'H2 01:01 - 02:00', visible: true }, // show if tabIndexHour = 0
        { key: 'h3', label: 'H3 02:01 - 03:00', visible: true }, // show if tabIndexHour = 0
        { key: 'h4', label: 'H4 03:01 - 04:00', visible: true }, // show if tabIndexHour = 0
        { key: 'h5', label: 'H5 04:01 - 05:00', visible: true }, // show if tabIndexHour = 0
        { key: 'h6', label: 'H6 05:01 - 06:00', visible: true }, // show if tabIndexHour = 0

        { key: 'h7', label: 'H7 06:01 - 07:00', visible: true }, // show if tabIndexHour = 1
        { key: 'h8', label: 'H8 07:01 - 08:00', visible: true }, // show if tabIndexHour = 1
        { key: 'h9', label: 'H9 08:01 - 09:00', visible: true }, // show if tabIndexHour = 1
        { key: 'h10', label: 'H10 09:01 - 10:00', visible: true }, // show if tabIndexHour = 1
        { key: 'h11', label: 'H11 10:01 - 11:00', visible: true }, // show if tabIndexHour = 1
        { key: 'h12', label: 'H12 11:01 - 12:00', visible: true }, // show if tabIndexHour = 1

        { key: 'h13', label: 'H13 12:01 - 13:00', visible: true }, // show if tabIndexHour = 2
        { key: 'h14', label: 'H14 13:01 - 14:00', visible: true }, // show if tabIndexHour = 2
        { key: 'h15', label: 'H15 14:01 - 15:00', visible: true }, // show if tabIndexHour = 2
        { key: 'h16', label: 'H16 15:01 - 16:00', visible: true }, // show if tabIndexHour = 2
        { key: 'h17', label: 'H17 16:01 - 17:00', visible: true }, // show if tabIndexHour = 2
        { key: 'h18', label: 'H18 17:01 - 18:00', visible: true }, // show if tabIndexHour = 2

        { key: 'h19', label: 'H19 18:01 - 19:00', visible: true }, // show if tabIndexHour = 3
        { key: 'h20', label: 'H20 19:01 - 20:00', visible: true }, // show if tabIndexHour = 3
        { key: 'h21', label: 'H21 20:01 - 21:00', visible: true }, // show if tabIndexHour = 3
        { key: 'h22', label: 'H22 21:01 - 22:00', visible: true }, // show if tabIndexHour = 3
        { key: 'h23', label: 'H23 22:01 - 23:00', visible: true }, // show if tabIndexHour = 3
        { key: 'h24', label: 'H24 23:01 - 24:00', visible: true }, // show if tabIndexHour = 3
    ];

    const initialColumnsTabImbalance: any = [
        { key: 'gas_day', label: 'Gas Day', visible: true }, // always show
        // { key: 'area', label: 'Area', visible: true }, // always show
        { key: 'imbalance', label: 'Imbalance', visible: true }, // tab imbalance
        { key: 'imbalance_percent', label: 'Imbalance (%)', visible: true }, // tab imbalance
        { key: 'park', label: 'Park', visible: true }, // tab imbalance
        { key: 'unpark', label: 'Unpark', visible: true }, // tab imbalance
        { key: 'change_min_invent', label: 'Change Min Invent', visible: true }, // tab imbalance
        { key: 'shrinkage', label: 'Shrinkage', visible: true }, // tab imbalance
    ];

    const filterColumnsByTabIndex = (tabIndex: number) => {
        return initialColumnsTabEntryExit.filter((col: any) => {
            // Always show these columns
            // const alwaysVisibleKeys = ["gas_day", "area", "total_cap", "utilization"]
            const alwaysVisibleKeys = ["gas_day", "area", "total_cap"]
            // const alwaysVisibleKeys = tabIndex2ndTab == 0 ? ["gas_day", "area", "total_cap", "utilization"] : []

            if (alwaysVisibleKeys.includes(col.key)) {
                return true;
            }

            if (tabIndex === 0) {
                return true; // Show all columns if tabIndex = 0
            }

            // Define hourly column visibility based on tab index
            const hourColumnMapping: { [key: number]: string[] } = {
                1: ["h1", "h2", "h3", "h4", "h5", "h6"],
                2: ["h7", "h8", "h9", "h10", "h11", "h12"],
                3: ["h13", "h14", "h15", "h16", "h17", "h18"],
                4: ["h19", "h20", "h21", "h22", "h23", "h24"],
            };

            return hourColumnMapping[tabIndex]?.includes(col.key) ?? false;
        });
    };

    // Usage
    const visibleColumns = filterColumnsByTabIndex(tabIndexHour);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const getInitialColumns = () => tabIndex2ndTab === 0 ? visibleColumns : initialColumnsTabImbalance;
    // const getInitialColumns = () => visibleColumns;

    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(getInitialColumns().map((column: any) => [column.key, column.visible]))
    );

    useEffect(() => {
        setColumnVisibility(
            Object.fromEntries(getInitialColumns().map((column: any) => [column.key, column.visible]))
        );
    }, [tabIndexHour]); // Runs when tabIndex changes

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

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (itemsPerPage: number) => {
        setItemsPerPage(itemsPerPage);
        setCurrentPage(1);
    };

    useEffect(() => {
        if (sortedData) {
            setPaginatedData(sortedData?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)) // old
            // setPaginatedData(dataTable?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)) // new
        }
    }, [sortedData, currentPage, itemsPerPage])

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        let filtered = dataTable?.filter(
            // let filtered = sortedData?.filter(
            (item: any) => {
                const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();
                return (
                    item?.H1?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H2?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H3?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H4?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H5?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H6?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H7?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H8?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H9?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H10?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H11?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H12?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H13?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H14?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H15?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H16?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H17?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H18?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H19?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H20?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H21?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H22?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H23?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.H24?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatNumberThreeDecimal(item?.H1)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H2)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H3)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H4)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H5)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H6)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H7)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H8)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H9)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H10)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H11)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H12)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H13)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H14)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H15)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H16)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H17)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H18)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H19)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H20)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H21)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H22)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H23)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.H24)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatNumberThreeDecimalNoComma(item?.H1)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H2)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H3)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H4)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H5)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H6)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H7)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H8)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H9)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H10)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H11)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H12)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H13)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H14)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H15)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H16)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H17)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H18)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H19)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H20)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H21)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H22)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H23)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.H24)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.gas_day_text?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.area_text?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.totalCap?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.totalCap)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.totalCap)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.nomination_point?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.utilization?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.imbalance?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.imbalance)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.imbalance)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.imbalance_percent?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.imbalance_percent)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.imbalance_percent)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.park?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.park)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.park)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.unpark?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.unpark)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.unpark)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.change_min_invent?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.change_min_invent)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.change_min_invent)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.shrinkage?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.shrinkage)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.shrinkage)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
                )
            }
        );

        setSortedData(filtered);
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
    }

    return (
        // <div className={`relative h-[calc(100vh-340px)] overflow-y-auto block  rounded-t-md z-1`}>
        <div className={`relative h-[calc(100vh-230px)] overflow-y-auto block  rounded-t-md z-1`}>

            {
                tabIndex2ndTab === 0 &&
                <div className="tabPlanning pb-2">
                    <Tabs
                        value={tabIndexHour}
                        onChange={handleChange}
                        aria-label="tabs"
                        sx={{
                            marginBottom: '-19px !important',
                            '& .MuiTabs-indicator': {
                                display: 'none', // Remove the underline
                            },
                            '& .Mui-selected': {
                                color: '#58585A !important',
                            },
                        }}
                    >
                        {['All Day', '1-6 Hr.', '7-12 Hr.', '13-18 Hr.', '19-24 Hr.'].map((label, index) => (
                            <Tab
                                key={label}
                                label={label}
                                id={`tab-${index}`}
                                sx={{
                                    fontFamily: 'Tahoma !important',
                                    border: '0.5px solid',
                                    borderColor: '#DFE4EA',
                                    borderBottom: 'none',
                                    borderTopLeftRadius: '9px',
                                    borderTopRightRadius: '9px',
                                    textTransform: 'none',
                                    padding: '8px 16px',
                                    minWidth: '80px',
                                    maxWidth: '80px',
                                    flexShrink: 0, // Prevents shrinking
                                    backgroundColor: tabIndexHour === index ? '#FFFFFF' : '#9CA3AF1A',
                                    color: tabIndexHour === index ? '#58585A' : '#9CA3AF',
                                    '&:hover': {
                                        backgroundColor: '#F3F4F6',
                                    },
                                }}
                            />
                        ))}
                    </Tabs>
                </div>
            }

            <div className={`w-full h-[82%] px-4 border-[#DFE4EA] border-[1px] ${tabIndex2ndTab === 0 && 'rounded-tl-none'} gap-2 rounded-xl shadow-sm flex flex-col`}>

                <div className="flex items-center space-x-2 py-4 px-1">
                    <div onClick={handleTogglePopover}>
                        <Tune
                            className="cursor-pointer rounded-lg"
                            style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                        />
                    </div>

                    <div className="w-[100%] flex flex-wrap gap-2 justify-end">
                        <SearchInput onSearch={handleSearch} />
                        {
                            !checkIsAllAreaImbalance && 
                            <BtnText 
                                handleFieldCilck={()=>openWarning({type:"TableAllArea", paginatedData, areaMaster, tabIndex2ndTab})}
                                text={`Submission Comment`}
                            />
                        }
                        <BtnExport
                            textRender={"Export"}
                            data={sortedData}
                            path="nomination/summary-nomination-report"
                            can_export={userPermission ? userPermission?.f_export : false}
                            columnVisibility={columnVisibility}
                            initialColumns={tabIndex2ndTab == 0 ? visibleColumns : initialColumnsTabImbalance}
                            specificMenu='summary-nomination-report-all-nomi'
                            type={tabIndex2ndTab == 0 ? `['area']['all']['MMBTUD']` : `['area']['all']['Imbalance']`}
                            // specificData={paginatedData ? paginatedData?.[0]?.gas_day_text : ''}
                            specificData={
                                paginatedData ? { gas_day_text: paginatedData?.[0]?.gas_day_text, tab: activeButton, over_total_cap: srchCheckbox } : ''
                            }
                        />
                    </div>
                </div>

                <div className="overflow-y-auto overflow-x-auto w-full h-[54dvh]">
                    {
                        // TABLE TAB MMSCF
                        isLoading && tabIndex2ndTab == 0 ?
                            <table className={`w-full text-sm text-left rtl:text-right text-gray-500 `}>
                                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                                    <tr className="h-20">

                                        {/* ที่ handleSort ส่ง paginatedData แทน dataTable เพราะข้อนี้ */}
                                        {/* All > Weekly > Nomination > MMSCF > Smart Sear แล้ว Sort Column ทำให้ Smart Search หลุด https://app.clickup.com/t/86euy05du */}
                                        {columnVisibility.gas_day && (
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("gas_day_text", sortState, setSortState, setSortedData, dataTable)}>
                                            {/* <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("gas_day_text", sortState, setSortState, setSortedData, paginatedData)}> */}
                                                {`Gas Day`}
                                                {getArrowIcon("gas_day_text")}
                                            </th>
                                        )}

                                        {columnVisibility.area && (
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("area_text", sortState, setSortState, setSortedData, dataTable)}>
                                            {/* <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("area_text", sortState, setSortState, setSortedData, paginatedData)}> */}
                                                {`Area`}
                                                {getArrowIcon("area_text")}
                                            </th>
                                        )}

                                        {columnVisibility.total_cap && (
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("totalCap", sortState, setSortState, setSortedData, dataTable)}>
                                            {/* <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("totalCap", sortState, setSortState, setSortedData, paginatedData)}> */}
                                                {`Total`}
                                                {getArrowIcon("totalCap")}
                                            </th>
                                        )}

                                        {columnVisibility.utilization && (
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("utilization", sortState, setSortState, setSortedData, dataTable)}>
                                            {/* <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("utilization", sortState, setSortState, setSortedData, paginatedData)}> */}
                                                {`Utilization (%)`}
                                                {getArrowIcon("utilization")}
                                            </th>
                                        )}

                                        {getVisibleHours().map(({ key, label, timeRange }) =>
                                            columnVisibility[key] && (
                                                <th
                                                    key={key}
                                                    scope="col"
                                                    className={`${table_sort_header_style} min-w-[170px] text-center`}
                                                    onClick={() => handleSortHOnly(key?.toUpperCase(), sortState, setSortState, setSortedData, dataTable)}
                                                    // onClick={() => handleSortHOnly(key?.toUpperCase(), sortState, setSortState, setSortedData, paginatedData)}
                                                >
                                                    <div>{label}</div>
                                                    <div>{timeRange}</div>
                                                    {getArrowIcon(key?.toUpperCase())}
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </thead>

                                <tbody>
                                    {
                                        // sortedData?.length > 0 && sortedData?.map((row: any, index: any) => {
                                        paginatedData.length > 0 && paginatedData?.map((row: any, index: any) => {

                                            let find_validate = areaMaster?.data?.find((item: any) => item?.name === row?.area_text)
                                            // https://app.clickup.com/t/9018502823/86ey4nagb
                                            const area_nominal_capacity = find_validate?.area_nominal_capacity
                                            let total_cap_validate = area_nominal_capacity > row?.totalCap
                                            let h1_validate = (area_nominal_capacity / 24) > row?.H1
                                            let h2_validate = (area_nominal_capacity / 24) > row?.H2
                                            let h3_validate = (area_nominal_capacity / 24) > row?.H3
                                            let h4_validate = (area_nominal_capacity / 24) > row?.H4
                                            let h5_validate = (area_nominal_capacity / 24) > row?.H5
                                            let h6_validate = (area_nominal_capacity / 24) > row?.H6
                                            let h7_validate = (area_nominal_capacity / 24) > row?.H7
                                            let h8_validate = (area_nominal_capacity / 24) > row?.H8
                                            let h9_validate = (area_nominal_capacity / 24) > row?.H9
                                            let h10_validate = (area_nominal_capacity / 24) > row?.H10
                                            let h11_validate = (area_nominal_capacity / 24) > row?.H11
                                            let h12_validate = (area_nominal_capacity / 24) > row?.H12
                                            let h13_validate = (area_nominal_capacity / 24) > row?.H13
                                            let h14_validate = (area_nominal_capacity / 24) > row?.H14
                                            let h15_validate = (area_nominal_capacity / 24) > row?.H15
                                            let h16_validate = (area_nominal_capacity / 24) > row?.H16
                                            let h17_validate = (area_nominal_capacity / 24) > row?.H17
                                            let h18_validate = (area_nominal_capacity / 24) > row?.H18
                                            let h19_validate = (area_nominal_capacity / 24) > row?.H19
                                            let h20_validate = (area_nominal_capacity / 24) > row?.H20
                                            let h21_validate = (area_nominal_capacity / 24) > row?.H21
                                            let h22_validate = (area_nominal_capacity / 24) > row?.H22
                                            let h23_validate = (area_nominal_capacity / 24) > row?.H23
                                            let h24_validate = (area_nominal_capacity / 24) > row?.H24
                                          
                                            return (
                                                <tr
                                                    key={row?.id}
                                                    className={`${table_row_style}`}
                                                >

                                                    {columnVisibility.gas_day && (
                                                        <td className="px-2 py-1 text-[#464255] ">{row?.gas_day_text ? row?.gas_day_text : ''}</td>
                                                    )}

                                                    {columnVisibility?.area && (
                                                        <td className={`px-2 py-1 ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"} !justify-center items-center text-center flex`}>

                                                            {(() => {
                                                                const filter_area = areaMaster?.data?.find((item: any) => item.name === row?.area_text?.trim());

                                                                return filter_area?.entry_exit_id == 2 ? (
                                                                    <div
                                                                        className="flex justify-center items-center rounded-full p-1 text-[#464255]"
                                                                        style={{ backgroundColor: filter_area?.color, width: '40px', height: '40px', color: getContrastTextColor(filter_area?.color) }}
                                                                    >
                                                                        {`${filter_area?.name}`}
                                                                    </div>
                                                                ) : filter_area?.entry_exit_id == 1 ? (
                                                                    <div
                                                                        className="flex justify-center items-center rounded-lg p-1 text-[#464255]"
                                                                        style={{ backgroundColor: filter_area?.color, width: '40px', height: '40px', color: getContrastTextColor(filter_area?.color) }}
                                                                    >
                                                                        {`${filter_area?.name}`}
                                                                    </div>
                                                                )
                                                                    : null;
                                                            })()}
                                                        </td>
                                                    )}

                                                    {columnVisibility.total_cap && (
                                                        // <td className={`px-2 py-1 ${total_cap_validate ? 'text-[#464255]' : 'text-red-600'} text-right font-bold`}>{row?.totalCap ? formatNumberThreeDecimalNom(row?.totalCap) : ''}</td>
                                                        <td className={`px-2 py-1 ${total_cap_validate ? 'text-[#464255]' : 'text-red-600'} text-right font-bold`}>{row?.totalCap !== null && row?.totalCap !== undefined ? formatNumberThreeDecimalNom(row?.totalCap) : ''}</td>
                                                    )}

                                                    {columnVisibility.utilization && (
                                                        // <td className={`px-2 py-1 text-[#464255] ${row?.utilization > 100 && 'text-red-600'} text-right`}>{typeof row?.utilization === 'number' ? formatNumberTwoDecimalNom(row?.utilization) : ''}</td>
                                                        <td className={`px-2 py-1 text-[#464255] ${row?.utilization > 100 && 'text-red-600'} text-right`}>{row?.utilization !== null && row?.utilization !== undefined && row?.utilization !== '' ? formatNumberTwoDecimalNom(row?.utilization) : ''}</td>
                                                    )}

                                                    {columnVisibility.h1 && (tabIndexHour == 1 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h1_validate ? 'text-[#464255]' : 'text-red-600'} text-right `}>
                                                            {
                                                                // ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w
                                                                row?.H1 !== null && row?.H1 !== undefined && row?.H1 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H1).replace(/,/g, '').trim())) : ''
                                                                // row?.H1 !== null && row?.H1 !== undefined && row?.H1 !== '' ? formatNumberSixDecimalNom(Number(String(row?.H1).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h2 && (tabIndexHour == 1 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h2_validate ? 'text-[#464255]' : 'text-red-600'} text-right `}>
                                                            {
                                                                // typeof row?.H2 === 'number' || !isNaN(Number(row?.H2)) ? formatNumberThreeDecimalNom(row?.H2) : ''

                                                                // ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w
                                                                row?.H2 !== null && row?.H2 !== undefined && row?.H2 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H2).replace(/,/g, '').trim())) : ''
                                                                // row?.H2 !== null && row?.H2 !== undefined && row?.H2 !== '' ? formatNumberSixDecimalNom(Number(String(row?.H2).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h3 && (tabIndexHour == 1 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h3_validate ? 'text-[#464255]' : 'text-red-600'} text-right `}>
                                                            {
                                                                // ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w
                                                                row?.H3 !== null && row?.H3 !== undefined && row?.H3 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H3).replace(/,/g, '').trim())) : ''
                                                                // row?.H3 !== null && row?.H3 !== undefined && row?.H3 !== '' ? formatNumberSixDecimalNom(Number(String(row?.H3).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h4 && (tabIndexHour == 1 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h4_validate ? 'text-[#464255]' : 'text-red-600'} text-right `}>
                                                            {
                                                                // ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w
                                                                row?.H4 !== null && row?.H4 !== undefined && row?.H4 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H4).replace(/,/g, '').trim())) : ''
                                                                // row?.H4 !== null && row?.H4 !== undefined && row?.H4 !== '' ? formatNumberSixDecimalNom(Number(String(row?.H4).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h5 && (tabIndexHour == 1 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h5_validate ? 'text-[#464255]' : 'text-red-600'} text-right `}>
                                                            {
                                                                // ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w
                                                                row?.H5 !== null && row?.H5 !== undefined && row?.H5 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H5).replace(/,/g, '').trim())) : ''
                                                                // row?.H5 !== null && row?.H5 !== undefined && row?.H5 !== '' ? formatNumberSixDecimalNom(Number(String(row?.H5).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h6 && (tabIndexHour == 1 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h6_validate ? 'text-[#464255]' : 'text-red-600'} text-right `}>
                                                            {
                                                                // ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w
                                                                row?.H6 !== null && row?.H6 !== undefined && row?.H6 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H6).replace(/,/g, '').trim())) : ''
                                                                // row?.H6 !== null && row?.H6 !== undefined && row?.H6 !== '' ? formatNumberSixDecimalNom(Number(String(row?.H6).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h7 && (tabIndexHour == 2 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h7_validate ? 'text-[#464255]' : 'text-red-600'} text-right `}>
                                                            {
                                                                // ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w
                                                                row?.H7 !== null && row?.H7 !== undefined && row?.H7 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H7).replace(/,/g, '').trim())) : ''
                                                                // row?.H7 !== null && row?.H7 !== undefined && row?.H7 !== '' ? formatNumberSixDecimalNom(Number(String(row?.H7).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h8 && (tabIndexHour == 2 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h8_validate ? 'text-[#464255]' : 'text-red-600'} text-right `}>
                                                            {
                                                                // ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w
                                                                row?.H8 !== null && row?.H8 !== undefined && row?.H8 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H8).replace(/,/g, '').trim())) : ''
                                                                // row?.H8 !== null && row?.H8 !== undefined && row?.H8 !== '' ? formatNumberSixDecimalNom(Number(String(row?.H8).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h9 && (tabIndexHour == 2 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h9_validate ? 'text-[#464255]' : 'text-red-600'} text-right `}>
                                                            {
                                                                // ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w
                                                                row?.H9 !== null && row?.H9 !== undefined && row?.H9 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H9).replace(/,/g, '').trim())) : ''
                                                                // row?.H9 !== null && row?.H9 !== undefined && row?.H9 !== '' ? formatNumberSixDecimalNom(Number(String(row?.H9).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h10 && (tabIndexHour == 2 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h10_validate ? 'text-[#464255]' : 'text-red-600'} text-right `}>
                                                            {
                                                                // ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w
                                                                row?.H10 !== null && row?.H10 !== undefined && row?.H10 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H10).replace(/,/g, '').trim())) : ''
                                                                // row?.H10 !== null && row?.H10 !== undefined && row?.H10 !== '' ? formatNumberSixDecimalNom(Number(String(row?.H10).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h11 && (tabIndexHour == 2 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h11_validate ? 'text-[#464255]' : 'text-red-600'} text-right `}>
                                                            {
                                                                // ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w
                                                                row?.H11 !== null && row?.H11 !== undefined && row?.H11 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H11).replace(/,/g, '').trim())) : ''
                                                                // row?.H11 !== null && row?.H11 !== undefined && row?.H11 !== '' ? formatNumberSixDecimalNom(Number(String(row?.H11).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h12 && (tabIndexHour == 2 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h12_validate ? 'text-[#464255]' : 'text-red-600'} text-right `}>
                                                            {
                                                                // ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w
                                                                row?.H12 !== null && row?.H12 !== undefined && row?.H12 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H12).replace(/,/g, '').trim())) : ''
                                                                // row?.H12 !== null && row?.H12 !== undefined && row?.H12 !== '' ? formatNumberSixDecimalNom(Number(String(row?.H12).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h13 && (tabIndexHour == 3 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h13_validate ? 'text-[#464255]' : 'text-red-600'} text-right `}>
                                                            {
                                                                // ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w
                                                                row?.H13 !== null && row?.H13 !== undefined && row?.H13 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H13).replace(/,/g, '').trim())) : ''
                                                                // row?.H13 !== null && row?.H13 !== undefined && row?.H13 !== '' ? formatNumberSixDecimalNom(Number(String(row?.H13).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h14 && (tabIndexHour == 3 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h14_validate ? 'text-[#464255]' : 'text-red-600'} text-right `}>
                                                            {
                                                                // ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w
                                                                row?.H14 !== null && row?.H14 !== undefined && row?.H14 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H14).replace(/,/g, '').trim())) : ''
                                                                // row?.H14 !== null && row?.H14 !== undefined && row?.H14 !== '' ? formatNumberSixDecimalNom(Number(String(row?.H14).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h15 && (tabIndexHour == 3 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h15_validate ? 'text-[#464255]' : 'text-red-600'} text-right `}>
                                                            {
                                                                // ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w
                                                                row?.H15 !== null && row?.H15 !== undefined && row?.H15 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H15).replace(/,/g, '').trim())) : ''
                                                                // row?.H15 !== null && row?.H15 !== undefined && row?.H15 !== '' ? formatNumberSixDecimalNom(Number(String(row?.H15).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h16 && (tabIndexHour == 3 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h16_validate ? 'text-[#464255]' : 'text-red-600'} text-right `}>
                                                            {
                                                                // ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w
                                                                row?.H16 !== null && row?.H16 !== undefined && row?.H16 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H16).replace(/,/g, '').trim())) : ''
                                                                // row?.H16 !== null && row?.H16 !== undefined && row?.H16 !== '' ? formatNumberSixDecimalNom(Number(String(row?.H16).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h17 && (tabIndexHour == 3 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h17_validate ? 'text-[#464255]' : 'text-red-600'} text-right `}>
                                                            {
                                                                // ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w
                                                                row?.H17 !== null && row?.H17 !== undefined && row?.H17 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H17).replace(/,/g, '').trim())) : ''
                                                                // row?.H17 !== null && row?.H17 !== undefined && row?.H17 !== '' ? formatNumberSixDecimalNom(Number(String(row?.H17).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h18 && (tabIndexHour == 3 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h18_validate ? 'text-[#464255]' : 'text-red-600'} text-right `}>
                                                            {
                                                                // ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w
                                                                row?.H18 !== null && row?.H18 !== undefined && row?.H18 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H18).replace(/,/g, '').trim())) : ''
                                                                // row?.H18 !== null && row?.H18 !== undefined && row?.H18 !== '' ? formatNumberSixDecimalNom(Number(String(row?.H18).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h19 && (tabIndexHour == 4 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h19_validate ? 'text-[#464255]' : 'text-red-600'} text-right `}>
                                                            {
                                                                // ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w
                                                                row?.H19 !== null && row?.H19 !== undefined && row?.H19 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H19).replace(/,/g, '').trim())) : ''
                                                                // row?.H19 !== null && row?.H19 !== undefined && row?.H19 !== '' ? formatNumberSixDecimalNom(Number(String(row?.H19).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h20 && (tabIndexHour == 4 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h20_validate ? 'text-[#464255]' : 'text-red-600'} text-right `}>
                                                            {
                                                                // ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w
                                                                row?.H20 !== null && row?.H20 !== undefined && row?.H20 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H20).replace(/,/g, '').trim())) : ''
                                                                // row?.H20 !== null && row?.H20 !== undefined && row?.H20 !== '' ? formatNumberSixDecimalNom(Number(String(row?.H20).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h21 && (tabIndexHour == 4 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h21_validate ? 'text-[#464255]' : 'text-red-600'} text-right `}>
                                                            {
                                                                // ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w
                                                                row?.H21 !== null && row?.H21 !== undefined && row?.H21 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H21).replace(/,/g, '').trim())) : ''
                                                                // row?.H21 !== null && row?.H21 !== undefined && row?.H21 !== '' ? formatNumberSixDecimalNom(Number(String(row?.H21).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h22 && (tabIndexHour == 4 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h22_validate ? 'text-[#464255]' : 'text-red-600'} text-right `}>
                                                            {
                                                                // ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w
                                                                row?.H22 !== null && row?.H22 !== undefined && row?.H22 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H22).replace(/,/g, '').trim())) : ''
                                                                // row?.H22 !== null && row?.H22 !== undefined && row?.H22 !== '' ? formatNumberSixDecimalNom(Number(String(row?.H22).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h23 && (tabIndexHour == 4 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h23_validate ? 'text-[#464255]' : 'text-red-600'} text-right `}>
                                                            {
                                                                // ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w
                                                                row?.H23 !== null && row?.H23 !== undefined && row?.H23 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H23).replace(/,/g, '').trim())) : ''
                                                                // row?.H23 !== null && row?.H23 !== undefined && row?.H23 !== '' ? formatNumberSixDecimalNom(Number(String(row?.H23).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h24 && (tabIndexHour == 4 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h24_validate ? 'text-[#464255]' : 'text-red-600'} text-right`}>
                                                            {
                                                                // ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w
                                                                row?.H24 !== null && row?.H24 !== undefined && row?.H24 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H24).replace(/,/g, '').trim())) : ''
                                                                // row?.H24 !== null && row?.H24 !== undefined && row?.H24 !== '' ? formatNumberSixDecimalNom(Number(String(row?.H24).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                            : tabIndex2ndTab == 0 && <TableSkeleton />
                    }

                    {/******************* TABLE TAB IMBALANCE *******************/}
                    {
                        isLoading && tabIndex2ndTab == 1 ? <table className={`w-full text-sm text-left rtl:text-right text-gray-500 `}>
                            <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                                <tr className="h-20">
                                    {columnVisibility.gas_day && (
                                        // <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("gas_day_text", sortState, setSortState, setSortedData, sortedData)}>
                                        <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("gas_day_text", sortState, setSortState, setSortedData, dataTable)}>
                                            {`Gas Day`}
                                            {getArrowIcon("gas_day_text")}
                                        </th>
                                    )}

                                    {/* {columnVisibility.area && (
                                        <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("area", sortState, setSortState, setSortedData, sortedData)}>
                                            {`Area`}
                                            {getArrowIcon("area")}
                                        </th>
                                    )} */}

                                    {columnVisibility.imbalance && (
                                        // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("imbalance", sortState, setSortState, setSortedData, sortedData)}>
                                        <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("imbalance", sortState, setSortState, setSortedData, dataTable)}>
                                            {`Imbalance`}
                                            {getArrowIcon("imbalance")}
                                        </th>
                                    )}

                                    {columnVisibility.imbalance_percent && (
                                        // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("imbalance_percent", sortState, setSortState, setSortedData, sortedData)}>
                                        <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("imbalance_percent", sortState, setSortState, setSortedData, dataTable)}>
                                            {`Imbalance (%)`}
                                            {getArrowIcon("imbalance_percent")}
                                        </th>
                                    )}

                                    {columnVisibility.park && (
                                        // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("park", sortState, setSortState, setSortedData, sortedData)}>
                                        <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("park", sortState, setSortState, setSortedData, dataTable)}>
                                            {`Park`}
                                            {getArrowIcon("park")}
                                        </th>
                                    )}

                                    {columnVisibility.unpark && (
                                        // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("unpark", sortState, setSortState, setSortedData, sortedData)}>
                                        <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("unpark", sortState, setSortState, setSortedData, dataTable)}>
                                            {`Unpark`}
                                            {getArrowIcon("unpark")}
                                        </th>
                                    )}

                                    {columnVisibility.change_min_invent && (
                                        // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("change_min_invent", sortState, setSortState, setSortedData, sortedData)}>
                                        <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("change_min_invent", sortState, setSortState, setSortedData, dataTable)}>
                                            {`Change Min Invent`}
                                            {getArrowIcon("change_min_invent")}
                                        </th>
                                    )}

                                    {columnVisibility.shrinkage && (
                                        // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("shrinkage", sortState, setSortState, setSortedData, sortedData)}>
                                        <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("shrinkage", sortState, setSortState, setSortedData, dataTable)}>
                                            {`Shrinkage`}
                                            {getArrowIcon("shrinkage")}
                                        </th>
                                    )}

                                </tr>
                            </thead>

                            <tbody>
                                {
                                    // sortedData.length > 0 && sortedData?.map((row: any, index: any) => {
                                    paginatedData?.length > 0 && paginatedData?.map((row: any, index: any) => {

                                        // All > Area > Imbalance > ในตารางมี Row ว่างเกินมา (ลองเปลี่ยนวันก็มีทุกวันเลย เหมือนจะมี Row นี้อยู่ทุกวัน) https://app.clickup.com/t/86euy2143
                                        if (row?.length == 0) { return false }

                                        return (
                                            <tr
                                                key={row?.id}
                                                className={`${table_row_style}`}
                                            >

                                                {columnVisibility.gas_day && (
                                                    <td className="px-2 py-1 text-[#464255] ">{row?.gas_day_text ? row?.gas_day_text : ''}</td>
                                                )}

                                                {/* {columnVisibility?.area && (
                                                    <td className={`px-2 py-1 ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"} !justify-center items-center text-center flex`}>

                                                        {(() => {
                                                            const filter_area = areaMaster?.data?.find((item: any) => item.name === row?.area_text?.trim());

                                                            return filter_area?.entry_exit_id == 2 ? (
                                                                <div
                                                                    className="flex justify-center items-center rounded-full p-1 text-[#464255]"
                                                                    style={{ backgroundColor: filter_area?.color, width: '40px', height: '40px', color: getContrastTextColor(filter_area?.color) }}
                                                                >
                                                                    {`${filter_area?.name}`}
                                                                </div>
                                                            ) : filter_area?.entry_exit_id == 1 ? (
                                                                <div
                                                                    className="flex justify-center items-center rounded-lg p-1 text-[#464255]"
                                                                    style={{ backgroundColor: filter_area?.color, width: '40px', height: '40px', color: getContrastTextColor(filter_area?.color) }}
                                                                >
                                                                    {`${filter_area?.name}`}
                                                                </div>
                                                            )
                                                                : null;
                                                        })()}
                                                    </td>
                                                )} */}

                                                {columnVisibility.imbalance && (
                                                    <td className="px-2 py-1 text-[#464255] text-center">{row?.imbalance !== null && row?.imbalance !== undefined ? formatNumberThreeDecimalNom(row?.imbalance) : ''}</td>
                                                )}

                                                {columnVisibility.imbalance_percent && (
                                                    <td className="px-2 py-1 text-[#464255] text-right">{row?.imbalance_percent !== null && row?.imbalance_percent !== undefined ? formatNumberThreeDecimalNom(row?.imbalance_percent) : ''}</td>
                                                )}

                                                {columnVisibility.park && (
                                                    <td className="px-2 py-1 text-[#464255] text-right">{row?.park !== null && row?.park !== undefined ? formatNumberThreeDecimalNom(row?.park) : ''}</td>
                                                )}

                                                {columnVisibility.unpark && (
                                                    <td className="px-2 py-1 text-[#464255] text-right">{row?.unpark !== null && row?.unpark !== undefined ? formatNumberThreeDecimalNom(row?.unpark) : ''}</td>
                                                )}

                                                {columnVisibility.change_min_invent && (
                                                    <td className="px-2 py-1 text-[#464255] text-right">{row?.change_min_invent !== null && row?.change_min_invent !== undefined ? formatNumberThreeDecimalNom(row?.change_min_invent) : ''}</td>
                                                )}

                                                {columnVisibility.shrinkage && (
                                                    <td className="px-2 py-1 text-[#464255] text-right">{row?.shrinkage !== null && row?.shrinkage !== undefined ? formatNumberThreeDecimalNom(row?.shrinkage) : ''}</td>
                                                )}

                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                            : tabIndex2ndTab == 1 && <TableSkeleton />
                    }

                    {
                        isLoading && sortedData?.length <= 0 && <NodataTable />
                    }
                </div>

            </div>

            <div>
                {/* <PaginationComponent
                    totalItems={5}
                    itemsPerPage={10}
                    currentPage={1}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                /> */}
                <PaginationComponent
                    totalItems={sortedData?.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                />
            </div>

            <ColumnVisibilityPopover
                open={open}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                columnVisibility={columnVisibility}
                handleColumnToggle={handleColumnToggle}
                // initialColumns={initialColumnsTabEntryExit}
                initialColumns={tabIndex2ndTab == 0 ? visibleColumns : initialColumnsTabImbalance}
            />

        </div>
    )
}

export default TableAllArea;