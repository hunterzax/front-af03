import { useEffect } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { decorateRowsWithGroupSums, formatNumberFourDecimalNom, formatNumberSixDecimalNom, formatNumberThreeDecimal, formatNumberThreeDecimalNoComma, formatNumberThreeDecimalNom, formatNumberTwoDecimal, formatNumberTwoDecimalNom, getContrastTextColor } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort, handleSortHOnly } from "@/utils/sortTable";
import NodataTable from "@/components/other/nodataTable";
import { Tab, Tabs } from "@mui/material";
import { Tune } from "@mui/icons-material"
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import PaginationComponent from "@/components/other/globalPagination";
import BtnExport from "@/components/other/btnExport";
import SearchInput from "@/components/other/searchInput";
import dayjs from 'dayjs';
import BtnText from "@/components/other/btnText";

// หน้านี้มี Tab Nomination, Area, Total System
// tab MMSCF, MMBTU
// tab hour ['All Day' ,'1-6 Hr.' , '7-12 Hr.' , '13-18 Hr.' , '19-24 Hr.']

const TableDailyTotalSystem: React.FC<any> = ({ openWarning, nomData, dataEva, tableData, isLoading, userPermission, zoneText, tempData, setTempData, tempDataConcept, setTempDataConcept, areaMaster, zoneMaster, entryExitMaster, setIsEdited, tabEntry, tabConcept, tabIndex2ndTab, srchStartDate }) => {

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
        // { key: 'gas_day', label: 'Gas Day', visible: true }, // always show
        // { key: 'area', label: 'Area', visible: true }, // always show
        // { key: 'nomination_point', label: 'Nomination Point', visible: true }, // always show

        { key: 'zone', label: 'Zone', visible: true }, // always show
        { key: 'entry_exit', label: 'Entry/Exit', visible: true }, // always show
        { key: 'area', label: 'Area', visible: true }, // always show
        // { key: 'total_cap', label: 'Total cap', visible: true }, // always show
        { key: 'total_cap', label: 'Total', visible: true }, // always show

        { key: 'nomination_point', label: 'Nomination Point', visible: true }, // always show
        { key: 'park_unpark_instructed_flows', label: 'Park/Unpark-Instructed Flows', visible: true }, // always show
        { key: 'customer_type', label: 'Customer Type', visible: true }, // always show
        { key: 'unit', label: 'Units', visible: true }, // always show
        { key: 'utilization', label: 'Utilization (%)', visible: true },

        { key: 'wi', label: 'WI', visible: true }, // always show
        { key: 'hv', label: 'HV', visible: true }, // always show
        { key: 'sg', label: 'SG', visible: true }, // always show

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

    // const initialColumnsTabImbalance: any = [
    //     { key: 'gas_day', label: 'Gas Day', visible: true }, // always show
    //     { key: 'area', label: 'Area', visible: true }, // always show
    //     { key: 'imbalance', label: 'Imbalance', visible: true }, // tab imbalance
    //     { key: 'imbalance_percent', label: 'Imbalance (%)', visible: true }, // tab imbalance
    //     { key: 'park', label: 'Park', visible: true }, // tab imbalance
    //     { key: 'unpark', label: 'Unpark', visible: true }, // tab imbalance
    //     { key: 'change_min_invent', label: 'Change Min Invent', visible: true }, // tab imbalance
    //     { key: 'shrinkage', label: 'Shrinkage', visible: true }, // tab imbalance
    // ];

    const filterColumnsByTabIndex = (tabIndex: number) => {
        return initialColumnsTabEntryExit.filter((col: any) => {
            // Always show these columns
            // const alwaysVisibleKeys = ["gas_day", "area", "total_cap"]
            // const alwaysVisibleKeys = ["zone", "entry_exit", "area", "nomination_point", "park_unpark_instructed_flows", "customer_type", "unit", "total_cap", "utilization"];
            const alwaysVisibleKeys = ["zone", "entry_exit", "area", "nomination_point", "park_unpark_instructed_flows", "customer_type", "unit", "total_cap"];
            // const alwaysVisibleKeys = tabIndex2ndTab == 0 ? ["gas_day", "total_cap", "nomination_point", "utilization"] : ["gas_day", "total_cap", "nomination_point", "utilization"]

            if (alwaysVisibleKeys.includes(col.key)) {
                return true;
            }

            if (tabIndex === 0) {
                return true; // Show all columns if tabIndex = 4
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

    // const getInitialColumns = () => tabIndex2ndTab === 0 ? visibleColumns : initialColumnsTabImbalance;
    const getInitialColumns = () => visibleColumns;

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
            setPaginatedData(sortedData?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)) //old
            // setPaginatedData(dataTable?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)) // new
        }
    }, [sortedData, currentPage, itemsPerPage])

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();
      
        let filtered = dataTable.filter((item: any) => {

            // const entryMatch = item?.entry_exit_id === 1 && queryLower.includes('entry'); 
            // const exitMatch = item?.entry_exit_id === 2 && queryLower.includes('exit');
            const entryMatch = item?.entry_exit_id === 1 && queryLower.includes('entry') || item?.entry_exit_id === 1 && queryLower.includes('entr') || item?.entry_exit_id === 1 && queryLower.includes('ent')
            const exitMatch = item?.entry_exit_id === 2 && queryLower.includes('exit') || item?.entry_exit_id === 2 && queryLower.includes('exi') || item?.entry_exit_id === 2 && queryLower.includes('ex');

            return (
                entryMatch ||
                exitMatch ||
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

                item?.zone_text?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                item?.area_text?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                item?.gas_day_text?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                item?.totalCap?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                item?.total?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                formatNumberThreeDecimal(item?.total)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                item?.parkUnparkInstructedFlows?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                item?.customerType?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                item?.units?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                item?.wi?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                item?.hv?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                item?.sg?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                item?.nomination_point?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                item?.utilization?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                formatNumberTwoDecimalNom(item?.utilization)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                formatNumberThreeDecimalNoComma(item?.utilization)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                item?.imbalance?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                item?.imbalance_percent?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                item?.park?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                item?.unpark?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                item?.change_min_invent?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                item?.shrinkage?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
            )
        });

        setSortedData(filtered);
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
    }

    return (
        // <div className={`relative h-[calc(100vh-340px)] overflow-y-auto block  rounded-t-md z-1`}>
        <div className={`relative h-[calc(100vh-180px)] block  rounded-t-md z-1`}>

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

            <div className={`px-4 border-[#DFE4EA] border-[1px] rounded-tl-none gap-2 rounded-xl shadow-sm flex flex-col`}>

                <div className="flex items-center space-x-2 py-4 px-1">
                    <div onClick={handleTogglePopover}>
                        <Tune
                            className="cursor-pointer rounded-lg"
                            style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                        />
                    </div>
                    <div className="w-[100%] flex flex-wrap gap-2 justify-end">
                        <SearchInput onSearch={handleSearch} />
                        <BtnText 
                            handleFieldCilck={()=>openWarning({type:"TableDailyTotalSystem", paginatedData})}
                            text={`Submission Comment`}
                        />
                        <BtnExport
                            textRender={"Export"}
                            data={sortedData}
                            path="nomination/summary-nomination-report"
                            can_export={userPermission ? userPermission?.f_export : false}
                            columnVisibility={columnVisibility}
                            initialColumns={visibleColumns}
                            specificMenu='summary-nomination-report-daily-total'
                            type={`['total']['daily']`}
                            // specificData={paginatedData ? paginatedData?.[0]?.gas_day_text : ''}
                            specificData={srchStartDate ? dayjs(srchStartDate).format("DD/MM/YYYY") : ''}
                        />
                    </div>
                </div>

                <div className="overflow-y-auto overflow-x-auto w-full h-[54dvh]">
                    {
                        isLoading ?
                            <table className={`w-full text-sm text-left rtl:text-right text-gray-500 `}>
                                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                                    <tr className="h-20">

                                        {/* ที่ handleSort ส่ง paginatedData แทน dataTable เพราะข้อนี้ */}
                                        {/* All > Weekly > Nomination > MMSCF > Smart Sear แล้ว Sort Column ทำให้ Smart Search หลุด https://app.clickup.com/t/86euy05du */}

                                        {columnVisibility.zone && (
                                            // <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("zone_text", sortState, setSortState, setSortedData, dataTable)}>
                                            // <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("zone_text", sortState, setSortState, setSortedData, paginatedData)}>
                                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("zone_text", sortState, setSortState, setSortedData, dataTable)}>
                                                {`Zone`}
                                                {getArrowIcon("zone_text")}
                                            </th>
                                        )}

                                        {columnVisibility.entry_exit && (
                                            // <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("entry_exit_id", sortState, setSortState, setSortedData, dataTable)}>
                                            // <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("entry_exit_id", sortState, setSortState, setSortedData, paginatedData)}>
                                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("entry_exit_id", sortState, setSortState, setSortedData, dataTable)}>
                                                {`Entry / Exit`}
                                                {getArrowIcon("entry_exit_id")}
                                            </th>
                                        )}

                                        {columnVisibility.area && (
                                            // <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("area_text", sortState, setSortState, setSortedData, dataTable)}>
                                            // <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("area_text", sortState, setSortState, setSortedData, paginatedData)}>
                                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("area_text", sortState, setSortState, setSortedData, dataTable)}>
                                                {`Area`}
                                                {getArrowIcon("area_text")}
                                            </th>
                                        )}

                                        {columnVisibility.total_cap && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("totalCap", sortState, setSortState, setSortedData, dataTable)}>
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("totalCap", sortState, setSortState, setSortedData, paginatedData)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("totalCap", sortState, setSortState, setSortedData, dataTable)}>
                                                {`Total`}
                                                {getArrowIcon("totalCap")}
                                            </th>
                                        )}

                                        {columnVisibility.nomination_point && (
                                            // <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("nomination_point", sortState, setSortState, setSortedData, dataTable)}>
                                            // <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("nomination_point", sortState, setSortState, setSortedData, paginatedData)}>
                                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("nomination_point", sortState, setSortState, setSortedData, dataTable)}>
                                                {`Nomination Point`}
                                                {getArrowIcon("nomination_point")}
                                            </th>
                                        )}

                                        {columnVisibility.park_unpark_instructed_flows && (
                                            // <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("parkUnparkInstructedFlows", sortState, setSortState, setSortedData, dataTable)}>
                                            // <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("parkUnparkInstructedFlows", sortState, setSortState, setSortedData, paginatedData)}>
                                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("parkUnparkInstructedFlows", sortState, setSortState, setSortedData, dataTable)}>
                                                {`Park/Unpark-Instructed Flows`}
                                                {getArrowIcon("parkUnparkInstructedFlows")}
                                            </th>
                                        )}

                                        {columnVisibility.customer_type && (
                                            // <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("customerType", sortState, setSortState, setSortedData, dataTable)}>
                                            // <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("customerType", sortState, setSortState, setSortedData, paginatedData)}>
                                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("customerType", sortState, setSortState, setSortedData, dataTable)}>
                                                {`Customer Type`}
                                                {getArrowIcon("customerType")}
                                            </th>
                                        )}

                                        {columnVisibility.unit && (
                                            // <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("units", sortState, setSortState, setSortedData, dataTable)}>
                                            // <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("units", sortState, setSortState, setSortedData, paginatedData)}>
                                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("units", sortState, setSortState, setSortedData, dataTable)}>
                                                {`Units`}
                                                {getArrowIcon("units")}
                                            </th>
                                        )}

                                        {columnVisibility.utilization && (
                                            // <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("utilization", sortState, setSortState, setSortedData, dataTable)}>
                                            // <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("utilization", sortState, setSortState, setSortedData, paginatedData)}>
                                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("utilization", sortState, setSortState, setSortedData, dataTable)}>
                                                {`Utilization (%)`}
                                                {getArrowIcon("utilization")}
                                            </th>
                                        )}

                                        {columnVisibility.wi && (
                                            // <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("wi", sortState, setSortState, setSortedData, dataTable)}>
                                            // <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("wi", sortState, setSortState, setSortedData, paginatedData)}>
                                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("wi", sortState, setSortState, setSortedData, dataTable)}>
                                                {`WI`}
                                                {getArrowIcon("wi")}
                                            </th>
                                        )}

                                        {columnVisibility.hv && (
                                            // <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("hv", sortState, setSortState, setSortedData, dataTable)}>
                                            // <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("hv", sortState, setSortState, setSortedData, paginatedData)}>
                                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("hv", sortState, setSortState, setSortedData, dataTable)}>
                                                {`HV`}
                                                {getArrowIcon("hv")}
                                            </th>
                                        )}

                                        {columnVisibility.sg && (
                                            // <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("sg", sortState, setSortState, setSortedData, dataTable)}>
                                            // <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("sg", sortState, setSortState, setSortedData, paginatedData)}>
                                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("sg", sortState, setSortState, setSortedData, dataTable)}>
                                                {`SG`}
                                                {getArrowIcon("sg")}
                                            </th>
                                        )}

                                        {getVisibleHours().map(({ key, label, timeRange }) => {

                                            return (

                                                columnVisibility[key] && (
                                                    <th
                                                        key={key}
                                                        scope="col"
                                                        className={`${table_sort_header_style} min-w-[170px] text-center`}
                                                        // onClick={() => handleSort(key?.toUpperCase(), sortState, setSortState, setSortedData, dataTable)}
                                                        // onClick={() => handleSortHOnly(key?.toUpperCase(), sortState, setSortState, setSortedData, dataTable)}
                                                        // onClick={() => handleSortHOnly(key?.toUpperCase(), sortState, setSortState, setSortedData, paginatedData)}
                                                        onClick={() => handleSortHOnly(key?.toUpperCase(), sortState, setSortState, setSortedData, dataTable)}

                                                    >
                                                        <div>{label}</div>
                                                        <div>{timeRange}</div>
                                                        {getArrowIcon(key?.toUpperCase())}
                                                    </th>
                                                )
                                            )
                                        }
                                        )}
                                    </tr>
                                </thead>

                                <tbody>
                                    {
                                        // sortedData?.length > 0 && sortedData?.map((row: any, index: any) => {
                                        paginatedData?.length > 0 && paginatedData?.map((row: any, index: any) => {

                                            let find_validate = nomData?.find((item: any) => item?.nomination_point === row?.nomination_point)

                                            const targetData = dataEva?.newDaily?.find((item: any) => {
                                                const area_id = find_validate?.area?.entry_exit_id == 1 ? find_validate?.area?.id : find_validate?.area?.supply_reference_quality_area
                                                return (
                                                    item.area.id === area_id &&
                                                    item.zone.name === find_validate?.zone?.name &&
                                                    item.parameter === "HV"
                                                );
                                            });

                                            let validate
                                            let validate_total
                                            if (row?.unix === "MMBTU/D") { 
                                                // validate = (find_validate?.maximum_capacity * targetData?.valueBtuScf) / 24 // https://app.clickup.com/t/86etzchd8
                                                // validate_total = find_validate?.maximum_capacity * targetData?.valueBtuScf

                                                if(row?.zone_text === "EAST-WEST"){
                                                    validate = (row?.hv * find_validate?.maximum_capacity) / 24
                                                    validate_total = row?.hv * find_validate?.maximum_capacity
                                                }else{
                                                     validate = (find_validate?.maximum_capacity * row?.hv) / 24
                                                     validate_total = find_validate?.maximum_capacity * row?.hv
                                                }
                                            } else { 
                                                validate = find_validate?.mmscf_max_cap / 24
                                                validate_total = find_validate?.mmscf_max_cap
                                            }

                                            let total_cap_validate = row?.query_shipper_nomination_type_id === 1 ? validate_total > row?.totalCap : false
                                            let h1_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H1 > validate : false
                                            let h2_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H2 > validate : false
                                            let h3_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H3 > validate : false
                                            let h4_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H4 > validate : false
                                            let h5_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H5 > validate : false
                                            let h6_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H6 > validate : false
                                            let h7_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H7 > validate : false
                                            let h8_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H8 > validate : false
                                            let h9_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H9 > validate : false
                                            let h10_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H10 > validate : false
                                            let h11_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H11 > validate : false
                                            let h12_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H12 > validate : false
                                            let h13_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H13 > validate : false
                                            let h14_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H14 > validate : false
                                            let h15_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H15 > validate : false
                                            let h16_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H16 > validate : false
                                            let h17_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H17 > validate : false
                                            let h18_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H18 > validate : false
                                            let h19_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H19 > validate : false
                                            let h20_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H20 > validate : false
                                            let h21_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H21 > validate : false
                                            let h22_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H22 > validate : false
                                            let h23_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H23 > validate : false
                                            let h24_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H24 > validate : false

                                            // row?.query_shipper_nomination_type_id !== 1 ? true : 

                                            return (
                                                <tr
                                                    key={row?.id + '_' + index}
                                                    className={`${table_row_style}`}
                                                >

                                                    {columnVisibility.zone && (
                                                        <td className="px-2 py-1 justify-center">
                                                            {(() => {
                                                                const filter_zone = zoneMaster?.data?.find((item: any) => item.name === row?.zone_text?.trim());
                                                                return <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: filter_zone?.color }}>{`${filter_zone?.name}`}</div>
                                                            })()}
                                                        </td>
                                                    )}

                                                    {/* {columnVisibility.entry_exit && (
                                                        <td className="px-2 py-1  justify-center ">{
                                                            row?.entry_exit_id == 1 ?
                                                                <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: '#C8FFD7' }}>{`Entry`}</div>
                                                                :
                                                                <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: '#FFF3C8' }}>{`Exit`}</div>
                                                        }
                                                        </td>
                                                    )} */}

                                                    {columnVisibility.entry_exit && (
                                                        <td className="px-2 py-1  justify-center ">{
                                                            row?.entry_exit_id == 1 ?
                                                                <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: '#C8FFD7' }}>{`Entry`}</div>
                                                                : row?.entry_exit_id == 2 ?
                                                                    <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: '#FFF3C8' }}>{`Exit`}</div>
                                                                    : <div></div>
                                                        }
                                                        </td>
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
                                                        // <td className="px-2 py-1 text-[#464255] font-bold text-right">{row?.totalCap ? row?.totalCap : ''}</td>
                                                        // <td className="px-2 py-1 text-[#464255] font-bold text-right">{row?.totalCap ? formatNumberThreeDecimalNom(row?.totalCap) : ''}</td>
                                                        <td className={`px-2 py-1 ${!total_cap_validate && !isNaN(validate_total) ? 'text-red-600' : 'text-[#464255]'} text-right font-bold`}>{row?.totalCap !== null && row?.totalCap !== undefined ? `${row?.units}`.trim().toUpperCase() == 'MMSCFD' ? formatNumberSixDecimalNom(row?.totalCap) : formatNumberThreeDecimalNom(row?.totalCap) : ''}</td>
                                                    )}

                                                    {columnVisibility.nomination_point && (
                                                        <td className="px-2 py-1 text-[#464255] text-center">{row?.nomination_point ? row?.nomination_point : ''}</td>
                                                    )}

                                                    {columnVisibility.park_unpark_instructed_flows && (
                                                        <td className="px-2 py-1 text-[#464255] text-right">{row?.parkUnparkInstructedFlows ? row?.parkUnparkInstructedFlows : ''}</td>
                                                    )}

                                                    {columnVisibility.customer_type && (
                                                        <td className="px-2 py-1 text-[#464255]">{row?.nomination_row_json?.data_temp?.["6"] ? row?.nomination_row_json?.data_temp?.["6"] : ''}</td>
                                                    )}

                                                    {columnVisibility.unit && (
                                                        <td className="px-2 py-1 text-[#464255] text-center">{row?.units ? row?.units : ''}</td>
                                                    )}

                                                    {columnVisibility.utilization && (
                                                        // <td className={`px-2 py-1 text-[#464255] ${row?.utilization > 100 && 'text-red-600'} text-right`}>{typeof row?.utilization === 'number' ? formatNumberTwoDecimalNom(row?.utilization) : ''}</td>
                                                        <td className={`px-2 py-1 text-[#464255] ${row?.utilization > 100 && 'text-red-600'} text-right`}>{row?.utilization !== null && row?.utilization !== undefined && row?.utilization !== '' ? formatNumberTwoDecimalNom(row?.utilization) : ''}</td>
                                                    )}

                                                    {columnVisibility.wi && (
                                                        // <td className="px-2 py-1 text-[#464255] text-right">{row?.wi ? row?.wi : ''}</td>
                                                        <td className="px-2 py-1 text-[#464255] text-right">{row?.wi !== null && row?.wi !== undefined ? formatNumberThreeDecimalNom(row?.wi) : ''}</td>
                                                    )}

                                                    {columnVisibility.hv && (
                                                        // <td className="px-2 py-1 text-[#464255] text-right">{row?.hv ? row?.hv : ''}</td>
                                                        <td className="px-2 py-1 text-[#464255] text-right">{row?.hv !== null && row?.hv !== undefined ? formatNumberThreeDecimalNom(row?.hv) : ''}</td>
                                                    )}

                                                    {columnVisibility.sg && (
                                                        // <td className="px-2 py-1 text-[#464255] text-right">{row?.sg ? row?.sg : ''}</td>
                                                        <td className="px-2 py-1 text-[#464255] text-right">{row?.sg !== null && row?.sg !== undefined ? formatNumberFourDecimalNom(row?.sg) : ''}</td>
                                                    )}


                                                    {columnVisibility.h1 && (tabIndexHour == 1 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h1_is_over ? 'text-red-600' : 'text-[#464255]'} text-right `}>
                                                            {
                                                                // typeof row?.H1 === 'number' || !isNaN(Number(row?.H1)) ? formatNumberThreeDecimalNom(Number(row?.H1)) : ''
                                                                row?.H1 !== null && row?.H1 !== undefined && row?.H1 !== '' ? `${row?.units}`.trim().toUpperCase() == 'MMSCFD' ? formatNumberSixDecimalNom(Number(String(row?.H1).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H1).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h2 && (tabIndexHour == 1 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h2_is_over ? 'text-red-600' : 'text-[#464255]'} text-right `}>
                                                            {
                                                                // typeof row?.H2 === 'number' || !isNaN(Number(row?.H2)) ? formatNumberThreeDecimalNom(row?.H2) : ''
                                                                row?.H2 !== null && row?.H2 !== undefined && row?.H2 !== '' ? `${row?.units}`.trim().toUpperCase() == 'MMSCFD' ? formatNumberSixDecimalNom(Number(String(row?.H2).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H2).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h3 && (tabIndexHour == 1 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h3_is_over ? 'text-red-600' : 'text-[#464255]'} text-right `}>
                                                            {
                                                                // typeof row?.H3 === 'number' || !isNaN(Number(row?.H3)) ? formatNumberThreeDecimalNom(row?.H3) : ''
                                                                row?.H3 !== null && row?.H3 !== undefined && row?.H3 !== '' ? `${row?.units}`.trim().toUpperCase() == 'MMSCFD' ? formatNumberSixDecimalNom(Number(String(row?.H3).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H3).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h4 && (tabIndexHour == 1 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h4_is_over ? 'text-red-600' : 'text-[#464255]'} text-right `}>
                                                            {
                                                                // typeof row?.H4 === 'number' || !isNaN(Number(row?.H4)) ? formatNumberThreeDecimalNom(row?.H4) : ''
                                                                row?.H4 !== null && row?.H4 !== undefined && row?.H4 !== '' ? `${row?.units}`.trim().toUpperCase() == 'MMSCFD' ? formatNumberSixDecimalNom(Number(String(row?.H4).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H4).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h5 && (tabIndexHour == 1 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h5_is_over ? 'text-red-600' : 'text-[#464255]'} text-right `}>
                                                            {
                                                                // typeof row?.H5 === 'number' || !isNaN(Number(row?.H5)) ? formatNumberThreeDecimalNom(row?.H5) : ''
                                                                row?.H5 !== null && row?.H5 !== undefined && row?.H5 !== '' ? `${row?.units}`.trim().toUpperCase() == 'MMSCFD' ? formatNumberSixDecimalNom(Number(String(row?.H5).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H5).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h6 && (tabIndexHour == 1 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h6_is_over ? 'text-red-600' : 'text-[#464255]'} text-right `}>
                                                            {
                                                                // typeof row?.H6 === 'number' || !isNaN(Number(row?.H6)) ? formatNumberThreeDecimalNom(row?.H6) : ''
                                                                row?.H6 !== null && row?.H6 !== undefined && row?.H6 !== '' ? `${row?.units}`.trim().toUpperCase() == 'MMSCFD' ? formatNumberSixDecimalNom(Number(String(row?.H6).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H6).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h7 && (tabIndexHour == 2 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h7_is_over ? 'text-red-600' : 'text-[#464255]'} text-right `}>
                                                            {
                                                                // typeof row?.H7 === 'number' || !isNaN(Number(row?.H7)) ? formatNumberThreeDecimalNom(row?.H7) : ''
                                                                row?.H7 !== null && row?.H7 !== undefined && row?.H7 !== '' ? `${row?.units}`.trim().toUpperCase() == 'MMSCFD' ? formatNumberSixDecimalNom(Number(String(row?.H7).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H7).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h8 && (tabIndexHour == 2 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h8_is_over ? 'text-red-600' : 'text-[#464255]'} text-right `}>
                                                            {
                                                                // typeof row?.H8 === 'number' || !isNaN(Number(row?.H8)) ? formatNumberThreeDecimalNom(row?.H8) : ''
                                                                row?.H8 !== null && row?.H8 !== undefined && row?.H8 !== '' ? `${row?.units}`.trim().toUpperCase() == 'MMSCFD' ? formatNumberSixDecimalNom(Number(String(row?.H8).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H8).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h9 && (tabIndexHour == 2 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h9_is_over ? 'text-red-600' : 'text-[#464255]'} text-right `}>
                                                            {
                                                                // typeof row?.H9 === 'number' || !isNaN(Number(row?.H9)) ? formatNumberThreeDecimalNom(row?.H9) : ''
                                                                row?.H9 !== null && row?.H9 !== undefined && row?.H9 !== '' ? `${row?.units}`.trim().toUpperCase() == 'MMSCFD' ? formatNumberSixDecimalNom(Number(String(row?.H9).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H9).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h10 && (tabIndexHour == 2 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h10_is_over ? 'text-red-600' : 'text-[#464255]'} text-right `}>
                                                            {
                                                                // typeof row?.H10 === 'number' || !isNaN(Number(row?.H10)) ? formatNumberThreeDecimalNom(row?.H10) : ''
                                                                row?.H10 !== null && row?.H10 !== undefined && row?.H10 !== '' ? `${row?.units}`.trim().toUpperCase() == 'MMSCFD' ? formatNumberSixDecimalNom(Number(String(row?.H10).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H10).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h11 && (tabIndexHour == 2 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h11_is_over ? 'text-red-600' : 'text-[#464255]'} text-right `}>
                                                            {
                                                                // typeof row?.H11 === 'number' || !isNaN(Number(row?.H11)) ? formatNumberThreeDecimalNom(row?.H11) : ''
                                                                row?.H11 !== null && row?.H11 !== undefined && row?.H11 !== '' ? `${row?.units}`.trim().toUpperCase() == 'MMSCFD' ? formatNumberSixDecimalNom(Number(String(row?.H11).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H11).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h12 && (tabIndexHour == 2 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h12_is_over ? 'text-red-600' : 'text-[#464255]'} text-right `}>
                                                            {
                                                                // typeof row?.H12 === 'number' || !isNaN(Number(row?.H12)) ? formatNumberThreeDecimalNom(row?.H12) : ''
                                                                row?.H12 !== null && row?.H12 !== undefined && row?.H12 !== '' ? `${row?.units}`.trim().toUpperCase() == 'MMSCFD' ? formatNumberSixDecimalNom(Number(String(row?.H12).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H12).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h13 && (tabIndexHour == 3 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h13_is_over ? 'text-red-600' : 'text-[#464255]'} text-right `}>
                                                            {
                                                                // typeof row?.H13 === 'number' || !isNaN(Number(row?.H13)) ? formatNumberThreeDecimalNom(row?.H13) : ''
                                                                row?.H13 !== null && row?.H13 !== undefined && row?.H13 !== '' ? `${row?.units}`.trim().toUpperCase() == 'MMSCFD' ? formatNumberSixDecimalNom(Number(String(row?.H13).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H13).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h14 && (tabIndexHour == 3 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h14_is_over ? 'text-red-600' : 'text-[#464255]'} text-right `}>
                                                            {
                                                                // typeof row?.H14 === 'number' || !isNaN(Number(row?.H14)) ? formatNumberThreeDecimalNom(row?.H14) : ''
                                                                row?.H14 !== null && row?.H14 !== undefined && row?.H14 !== '' ? `${row?.units}`.trim().toUpperCase() == 'MMSCFD' ? formatNumberSixDecimalNom(Number(String(row?.H14).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H14).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h15 && (tabIndexHour == 3 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h15_is_over ? 'text-red-600' : 'text-[#464255]'} text-right `}>
                                                            {
                                                                // typeof row?.H15 === 'number' || !isNaN(Number(row?.H15)) ? formatNumberThreeDecimalNom(row?.H15) : ''
                                                                row?.H15 !== null && row?.H15 !== undefined && row?.H15 !== '' ? `${row?.units}`.trim().toUpperCase() == 'MMSCFD' ? formatNumberSixDecimalNom(Number(String(row?.H15).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H15).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h16 && (tabIndexHour == 3 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h16_is_over ? 'text-red-600' : 'text-[#464255]'} text-right `}>
                                                            {
                                                                // typeof row?.H16 === 'number' || !isNaN(Number(row?.H16)) ? formatNumberThreeDecimalNom(row?.H16) : ''
                                                                row?.H16 !== null && row?.H16 !== undefined && row?.H16 !== '' ? `${row?.units}`.trim().toUpperCase() == 'MMSCFD' ? formatNumberSixDecimalNom(Number(String(row?.H16).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H16).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h17 && (tabIndexHour == 3 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h17_is_over ? 'text-red-600' : 'text-[#464255]'} text-right `}>
                                                            {
                                                                // typeof row?.H17 === 'number' || !isNaN(Number(row?.H17)) ? formatNumberThreeDecimalNom(row?.H17) : ''
                                                                row?.H17 !== null && row?.H17 !== undefined && row?.H17 !== '' ? `${row?.units}`.trim().toUpperCase() == 'MMSCFD' ? formatNumberSixDecimalNom(Number(String(row?.H17).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H17).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h18 && (tabIndexHour == 3 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h18_is_over ? 'text-red-600' : 'text-[#464255]'} text-right `}>
                                                            {
                                                                // typeof row?.H18 === 'number' || !isNaN(Number(row?.H18)) ? formatNumberThreeDecimalNom(row?.H18) : ''
                                                                row?.H18 !== null && row?.H18 !== undefined && row?.H18 !== '' ? `${row?.units}`.trim().toUpperCase() == 'MMSCFD' ? formatNumberSixDecimalNom(Number(String(row?.H18).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H18).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h19 && (tabIndexHour == 4 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h19_is_over ? 'text-red-600' : 'text-[#464255]'} text-right `}>
                                                            {
                                                                // typeof row?.H19 === 'number' || !isNaN(Number(row?.H19)) ? formatNumberThreeDecimalNom(row?.H19) : ''
                                                                row?.H19 !== null && row?.H19 !== undefined && row?.H19 !== '' ? `${row?.units}`.trim().toUpperCase() == 'MMSCFD' ? formatNumberSixDecimalNom(Number(String(row?.H19).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H19).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h20 && (tabIndexHour == 4 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h20_is_over ? 'text-red-600' : 'text-[#464255]'} text-right `}>
                                                            {
                                                                // typeof row?.H20 === 'number' || !isNaN(Number(row?.H20)) ? formatNumberThreeDecimalNom(row?.H20) : ''
                                                                row?.H20 !== null && row?.H20 !== undefined && row?.H20 !== '' ? `${row?.units}`.trim().toUpperCase() == 'MMSCFD' ? formatNumberSixDecimalNom(Number(String(row?.H20).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H20).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h21 && (tabIndexHour == 4 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h21_is_over ? 'text-red-600' : 'text-[#464255]'} text-right `}>
                                                            {
                                                                // typeof row?.H21 === 'number' || !isNaN(Number(row?.H21)) ? formatNumberThreeDecimalNom(row?.H21) : ''
                                                                row?.H21 !== null && row?.H21 !== undefined && row?.H21 !== '' ? `${row?.units}`.trim().toUpperCase() == 'MMSCFD' ? formatNumberSixDecimalNom(Number(String(row?.H21).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H21).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h22 && (tabIndexHour == 4 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h22_is_over ? 'text-red-600' : 'text-[#464255]'} text-right `}>
                                                            {
                                                                // typeof row?.H22 === 'number' || !isNaN(Number(row?.H22)) ? formatNumberThreeDecimalNom(row?.H22) : ''
                                                                row?.H22 !== null && row?.H22 !== undefined && row?.H22 !== '' ? `${row?.units}`.trim().toUpperCase() == 'MMSCFD' ? formatNumberSixDecimalNom(Number(String(row?.H22).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H22).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h23 && (tabIndexHour == 4 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h23_is_over ? 'text-red-600' : 'text-[#464255]'} text-right `}>
                                                            {
                                                                // typeof row?.H23 === 'number' || !isNaN(Number(row?.H23)) ? formatNumberThreeDecimalNom(row?.H23) : ''
                                                                row?.H23 !== null && row?.H23 !== undefined && row?.H23 !== '' ? `${row?.units}`.trim().toUpperCase() == 'MMSCFD' ? formatNumberSixDecimalNom(Number(String(row?.H23).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H23).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}

                                                    {columnVisibility.h24 && (tabIndexHour == 4 || tabIndexHour == 0) && (
                                                        <td className={`px-2 py-1 ${h24_is_over ? 'text-red-600' : 'text-[#464255]'} text-right `}>
                                                            {
                                                                // typeof row?.H24 === 'number' || !isNaN(Number(row?.H24)) ? formatNumberThreeDecimalNom(row?.H24) : ''
                                                                row?.H24 !== null && row?.H24 !== undefined && row?.H24 !== '' ? `${row?.units}`.trim().toUpperCase() == 'MMSCFD' ? formatNumberSixDecimalNom(Number(String(row?.H24).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H24).replace(/,/g, '').trim())) : ''
                                                            }
                                                        </td>
                                                    )}
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                            : <TableSkeleton />
                    }

                    {
                        isLoading && sortedData?.length <= 0 && <NodataTable />
                    }
                </div>
            </div>

            <div>
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
                // initialColumns={tabIndex2ndTab == 0 ? visibleColumns : initialColumnsTabImbalance}
                initialColumns={visibleColumns}
            />

        </div>
    )
}

export default TableDailyTotalSystem;