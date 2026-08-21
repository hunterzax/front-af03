import { useEffect } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { exportToExcel, formatNumberThreeDecimalNoComma, formatNumberThreeDecimalNom, formatNumberTwoDecimal, formatNumberTwoDecimalNom, getContrastTextColor, getCurrentWeekDatesYyyyMmDd, getCurrentWeekDatesYyyyMmDdFromDate, getCurrentWeekSundayYyyyMmDd } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import NodataTable from "@/components/other/nodataTable";
import { Tune } from "@mui/icons-material"
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import PaginationComponent from "@/components/other/globalPagination";
import BtnExport from "@/components/other/btnExport";
import SearchInput from "@/components/other/searchInput";
import BtnGeneral from "@/components/other/btnGeneral";
import BtnText from "@/components/other/btnText";

// หน้านี้มี Tab Nomination, Area, Total System
// tab MMSCF, MMBTU
// tab hour ['All Day' ,'1-6 Hr.' , '7-12 Hr.' , '13-18 Hr.' , '19-24 Hr.']

const TableWeeklyArea: React.FC<any> = ({ checkIsAllAreaImbalance, openWarning, tableData, isLoading, userPermission, zoneText, tempData, setTempData, tempDataConcept, setTempDataConcept, areaMaster, entryExitMaster, setIsEdited, tabEntry, tabConcept, tabIndex2ndTab, srchCheckbox, activeButton }) => {

    const [dataTable, setDataTable] = useState<any>([]);
    const [sortedData, setSortedData] = useState<any>([]);
    useEffect(() => {
        setDataTable(tableData);
        // setSortedData(tableData?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        setSortedData(tableData)

        setCurrentPage(1); // เผื่อกดเสิช จะให้มันกลับไปหน้าแรก
    }, [tableData])

    const [sortState, setSortState] = useState({ column: null, direction: null });

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    // ===================== TABLE HEADER MAP =====================
    // const dayMapping = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    // const startKey = 14;
    // const endKey = 20;

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

    const initialColumnsTabEntryExit: any = [
        // { key: 'gas_day', label: 'Gas Day', visible: true },
        // แถบ Weekly > Area > MMBTU : เปลี่ยน column gas day เป็น gas week https://app.clickup.com/t/86et681fh
        // { key: 'gas_day', label: 'Gas Week', visible: true },
        { key: 'area', label: 'Area', visible: true },
        // { key: 'total_cap', label: 'Total cap', visible: true },
        // { key: 'nomination_point', label: 'Nomination Point', visible: true }, // 

        { key: 'sunday', label: 'Sunday', visible: true },
        { key: 'utilization_sunday', label: 'Utilization (%)', visible: true },
        { key: 'monday', label: 'Monday', visible: true },
        { key: 'utilization_monday', label: 'Utilization (%)', visible: true },
        { key: 'tuesday', label: 'Tuesday', visible: true },
        { key: 'utilization_tuesday', label: 'Utilization (%)', visible: true },
        { key: 'wednesday', label: 'Wednesday', visible: true },
        { key: 'utilization_wednesday', label: 'Utilization (%)', visible: true },
        { key: 'thursday', label: 'Thursday', visible: true },
        { key: 'utilization_thursday', label: 'Utilization (%)', visible: true },
        { key: 'friday', label: 'Friday', visible: true },
        { key: 'utilization_friday', label: 'Utilization (%)', visible: true },
        { key: 'saturday', label: 'Saturday', visible: true },
        { key: 'utilization_saturday', label: 'Utilization (%)', visible: true },
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

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    // const getInitialColumns = () => initialColumnsTabEntryExit;
    const getInitialColumns = () => tabIndex2ndTab === 0 ? initialColumnsTabEntryExit : initialColumnsTabImbalance;

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
    const [dateOnHeader, setDateOnHeader] = useState<any>([]);

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
    // let date_next_sunday = getCurrentWeekDatesYyyyMmDd()

    useEffect(() => {
        if (tableData) {
            // "11/05/2025"
            // tableData[0].gas_day_text
            // date_next_sunday = getCurrentWeekDatesYyyyMmDdFromDate(tableData[0].gas_day_text)
            setDateOnHeader(getCurrentWeekDatesYyyyMmDdFromDate(tableData[0]?.gas_day_text))
        }
    }, [tableData])

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {

        const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();

        let filtered = dataTable.filter(
            (item: any) => {
                return (
                    // item?.nomination_point?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.area_text?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.sunday?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.monday?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.tuesday?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.wednesday?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.thursday?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.friday?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.saturday?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.sunday)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.monday)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.tuesday)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.wednesday)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.thursday)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.friday)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.saturday)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatNumberThreeDecimalNoComma(item?.sunday)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.monday)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.tuesday)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.wednesday)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.thursday)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.friday)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.saturday)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.sunday_utilization?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.monday_utilization?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.tuesday_utilization?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.wednesday_utilization?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.thursday_utilization?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.friday_utilization?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.saturday_utilization?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.sunday_utilization)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.monday_utilization)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.tuesday_utilization)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.wednesday_utilization)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.thursday_utilization)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.friday_utilization)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.saturday_utilization)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatNumberThreeDecimalNoComma(item?.sunday_utilization)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.monday_utilization)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.tuesday_utilization)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.wednesday_utilization)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.thursday_utilization)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.friday_utilization)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.saturday_utilization)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||


                    // อิงเติมมา
                    item?.change_min_invent?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.gas_day_text?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.imbalance?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.imbalance_percent?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.park?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.shrinkage?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.unpark?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.imbalance)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.change_min_invent)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.changimbalancee_min_invent)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.imbalance_percent)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.park)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.shrinkage)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNom(item?.unpark)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatNumberThreeDecimalNoComma(item?.imbalance)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.change_min_invent)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.changimbalancee_min_invent)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.imbalance_percent)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.park)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.shrinkage)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.unpark)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
                )
            }
        );

        setSortedData(filtered);
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
    }

    return (
        // <div className={`relative h-[calc(100vh-340px)] overflow-y-auto block  rounded-t-md z-1`}>
        <div className={`relative h-[calc(100vh-200px)] overflow-hidden  block  rounded-t-md z-1`}>

            <div className="w-full h-[82%] px-4 border-[#DFE4EA] border-[1px] gap-2 rounded-xl overflow-hidden shadow-sm flex flex-col">
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
                                handleFieldCilck={()=>openWarning({type:"TableWeeklyArea", paginatedData, areaMaster, tabIndex2ndTab})}
                                text={`Submission Comment`}
                            />
                        }

                        {
                            tabIndex2ndTab == 0 ?
                                <BtnExport
                                    textRender={"Export"}
                                    data={sortedData}
                                    path="nomination/summary-nomination-report"
                                    can_export={userPermission ? userPermission?.f_export : false}
                                    columnVisibility={columnVisibility}
                                    initialColumns={tabIndex2ndTab == 0 ? initialColumnsTabEntryExit : initialColumnsTabImbalance}
                                    specificMenu='summary-nomination-report-weekly-area-mmbtu'
                                    type={tabIndex2ndTab == 0 ? `['area']['weekly']['MMBTUD']` : `['area']['weekly']['Imbalance']`}
                                    // specificData={dateOnHeader}
                                    specificData={{
                                        dateOnHeader: dateOnHeader,
                                        tab: activeButton, 
                                        over_total_cap: srchCheckbox
                                    }}
                                />
                                // เผื่อไว้
                                // <BtnGeneral
                                //     bgcolor={"#24AB6A"}
                                //     modeIcon={'export'}
                                //     textRender={"Export"}
                                //     generalFunc={() => exportToExcel(paginatedData, 'summary-nomination-report-weekly-area-mbtu', columnVisibility)}
                                //     can_export={userPermission ? userPermission?.f_export : false}
                                // />
                                :
                                <BtnGeneral
                                    bgcolor={"#24AB6A"}
                                    modeIcon={'export'}
                                    textRender={"Export"}
                                    generalFunc={() => exportToExcel(paginatedData, 'summary-nomination-report-weekly-area-imbal', columnVisibility)}
                                    can_export={userPermission ? userPermission?.f_export : false}
                                />
                        }

                    </div>
                </div>

                <div className="overflow-y-auto overflow-x-auto w-full h-[54dvh]">
                    {/******************* TABLE TAB MMBTU *******************/}
                    {
                        isLoading && tabIndex2ndTab == 0 ? <>
                            <table className={`w-full text-sm text-left rtl:text-right text-gray-500 `}>
                                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                                    <tr className="h-20">

                                        {/* ที่ handleSort ส่ง paginatedData แทน dataTable เพราะข้อนี้ */}
                                        {/* All > Weekly > Nomination > MMSCF > Smart Sear แล้ว Sort Column ทำให้ Smart Search หลุด https://app.clickup.com/t/86euy05du */}

                                        {/* {columnVisibility.gas_day && (
                                            // แถบ Weekly > Area > MMBTU : เปลี่ยน column gas day เป็น gas week https://app.clickup.com/t/86et681fh
                                            <th scope="col" className={`${table_sort_header_style} min-w-[160px] text-center`} onClick={() => handleSort("gas_day_text", sortState, setSortState, setSortedData, tableData)}>
                                                {`Gas Week`}
                                                {getArrowIcon("gas_day_text")}
                                            </th>
                                        )} */}

                                        {columnVisibility.area && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] w-[130px] text-center`} onClick={() => handleSort("area_text", sortState, setSortState, setSortedData, dataTable)}>
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] w-[130px] text-center`} onClick={() => handleSort("area_text", sortState, setSortState, setSortedData, paginatedData)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px] w-[130px] text-center`} onClick={() => handleSort("area_text", sortState, setSortState, setSortedData, dataTable)}>
                                                {`Area`}
                                                {getArrowIcon("area_text")}
                                            </th>
                                        )}

                                        {/* {columnVisibility.total_cap && (
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("totalCap", sortState, setSortState, setSortedData, sortedData)}>
                                                {`Total`}
                                                {getArrowIcon("totalCap")}
                                            </th>
                                        )} */}

                                        {/* {columnVisibility.nomination_point && (
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px] `} onClick={() => handleSort("nomination_point", sortState, setSortState, setSortedData, sortedData)}>
                                                {`Nomination Point`}
                                                {getArrowIcon("nomination_point")}
                                            </th>
                                        )} */}

                                        {columnVisibility.sunday && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("sunday", sortState, setSortState, setSortedData, dataTable)}>
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("sunday", sortState, setSortState, setSortedData, paginatedData)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("sunday", sortState, setSortState, setSortedData, dataTable)}>
                                                <div>{`Sunday`}</div>
                                                {/* <div>{date_next_sunday[0]}</div> */}
                                                <div>{dateOnHeader[0] !== 'Invalid Date' ? dateOnHeader[0] : ''}</div>
                                                {getArrowIcon("sunday")}
                                            </th>
                                        )}
                                        {columnVisibility.utilization_sunday && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("sunday_utilization", sortState, setSortState, setSortedData, dataTable)}>
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("sunday_utilization", sortState, setSortState, setSortedData, paginatedData)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("sunday_utilization", sortState, setSortState, setSortedData, dataTable)}>
                                                {`Utilization (%)`}
                                                {getArrowIcon("sunday_utilization")}
                                            </th>
                                        )}

                                        {columnVisibility.monday && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("monday", sortState, setSortState, setSortedData, dataTable)}>
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("monday", sortState, setSortState, setSortedData, paginatedData)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("monday", sortState, setSortState, setSortedData, dataTable)}>
                                                <div>{`Monday`}</div>
                                                {/* <div>{date_next_sunday[1]}</div> */}
                                                {/* <div>{dateOnHeader[1]}</div> */}
                                                <div>{dateOnHeader[1] !== 'Invalid Date' ? dateOnHeader[1] : ''}</div>
                                                {getArrowIcon("monday")}
                                            </th>
                                        )}

                                        {columnVisibility.utilization_monday && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("monday_utilization", sortState, setSortState, setSortedData, dataTable)}>
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("monday_utilization", sortState, setSortState, setSortedData, paginatedData)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("monday_utilization", sortState, setSortState, setSortedData, dataTable)}>
                                                {`Utilization (%)`}
                                                {getArrowIcon("monday_utilization")}
                                            </th>
                                        )}

                                        {columnVisibility.tuesday && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("tuesday", sortState, setSortState, setSortedData, dataTable)}>
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("tuesday", sortState, setSortState, setSortedData, paginatedData)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("tuesday", sortState, setSortState, setSortedData, dataTable)}>
                                                <div>{`Tuesday`}</div>
                                                {/* <div>{date_next_sunday[2]}</div> */}
                                                {/* <div>{dateOnHeader[2]}</div> */}
                                                <div>{dateOnHeader[2] !== 'Invalid Date' ? dateOnHeader[2] : ''}</div>
                                                {getArrowIcon("tuesday")}
                                            </th>
                                        )}

                                        {columnVisibility.utilization_tuesday && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("tuesday_utilization", sortState, setSortState, setSortedData, dataTable)}>
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("tuesday_utilization", sortState, setSortState, setSortedData, paginatedData)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("tuesday_utilization", sortState, setSortState, setSortedData, dataTable)}>
                                                {`Utilization (%)`}
                                                {getArrowIcon("tuesday_utilization")}
                                            </th>
                                        )}

                                        {columnVisibility.wednesday && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("wednesday", sortState, setSortState, setSortedData, dataTable)}>
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("wednesday", sortState, setSortState, setSortedData, paginatedData)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("wednesday", sortState, setSortState, setSortedData, dataTable)}>
                                                <div>{`Wednesday`}</div>
                                                {/* <div>{date_next_sunday[3]}</div> */}
                                                {/* <div>{dateOnHeader[3]}</div> */}
                                                <div>{dateOnHeader[3] !== 'Invalid Date' ? dateOnHeader[3] : ''}</div>
                                                {getArrowIcon("wednesday")}
                                            </th>
                                        )}

                                        {columnVisibility.utilization_wednesday && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("wednesday_utilization", sortState, setSortState, setSortedData, dataTable)}>
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("wednesday_utilization", sortState, setSortState, setSortedData, paginatedData)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("wednesday_utilization", sortState, setSortState, setSortedData, dataTable)}>
                                                {`Utilization (%)`}
                                                {getArrowIcon("wednesday_utilization")}
                                            </th>
                                        )}

                                        {columnVisibility.thursday && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("thursday", sortState, setSortState, setSortedData, dataTable)}>
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("thursday", sortState, setSortState, setSortedData, paginatedData)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("thursday", sortState, setSortState, setSortedData, dataTable)}>
                                                <div>{`Thursday`}</div>
                                                {/* <div>{date_next_sunday[4]}</div> */}
                                                {/* <div>{dateOnHeader[4]}</div> */}
                                                <div>{dateOnHeader[4] !== 'Invalid Date' ? dateOnHeader[4] : ''}</div>
                                                {getArrowIcon("thursday")}
                                            </th>
                                        )}

                                        {columnVisibility.utilization_thursday && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("thursday_utilization", sortState, setSortState, setSortedData, dataTable)}>
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("thursday_utilization", sortState, setSortState, setSortedData, paginatedData)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("thursday_utilization", sortState, setSortState, setSortedData, dataTable)}>
                                                {`Utilization (%)`}
                                                {getArrowIcon("thursday_utilization")}
                                            </th>
                                        )}

                                        {columnVisibility.friday && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("friday", sortState, setSortState, setSortedData, dataTable)}>
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("friday", sortState, setSortState, setSortedData, paginatedData)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("friday", sortState, setSortState, setSortedData, dataTable)}>
                                                <div>{`Friday`}</div>
                                                {/* <div>{date_next_sunday[5]}</div> */}
                                                {/* <div>{dateOnHeader[5]}</div> */}
                                                <div>{dateOnHeader[5] !== 'Invalid Date' ? dateOnHeader[5] : ''}</div>
                                                {getArrowIcon("friday")}
                                            </th>
                                        )}

                                        {columnVisibility.utilization_friday && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("friday_utilization", sortState, setSortState, setSortedData, dataTable)}>
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("friday_utilization", sortState, setSortState, setSortedData, paginatedData)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("friday_utilization", sortState, setSortState, setSortedData, dataTable)}>
                                                {`Utilization (%)`}
                                                {getArrowIcon("friday_utilization")}
                                            </th>
                                        )}

                                        {columnVisibility.saturday && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("saturday", sortState, setSortState, setSortedData, dataTable)}>
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("saturday", sortState, setSortState, setSortedData, paginatedData)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("saturday", sortState, setSortState, setSortedData, dataTable)}>
                                                <div>{`Saturday`}</div>
                                                {/* <div>{date_next_sunday[6]}</div> */}
                                                {/* <div>{dateOnHeader[6]}</div> */}
                                                <div>{dateOnHeader[6] !== 'Invalid Date' ? dateOnHeader[6] : ''}</div>
                                                {getArrowIcon("saturday")}
                                            </th>
                                        )}

                                        {columnVisibility.utilization_saturday && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] `} onClick={() => handleSort("saturday_utilization", sortState, setSortState, setSortedData, dataTable)}>
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] `} onClick={() => handleSort("saturday_utilization", sortState, setSortState, setSortedData, paginatedData)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px] `} onClick={() => handleSort("saturday_utilization", sortState, setSortState, setSortedData, dataTable)}>
                                                {`Utilization (%)`}
                                                {getArrowIcon("saturday_utilization")}
                                            </th>
                                        )}

                                    </tr>
                                </thead>

                                <tbody>
                                    {
                                        // sortedData?.length > 0 && sortedData?.map((row: any, index: any) => {
                                        paginatedData?.length > 0 && paginatedData?.map((row: any, index: any) => {

                                            let find_validate = areaMaster?.data?.find((item: any) => item?.name === row?.area_text)
                                            let sunday_validate = find_validate?.area_nominal_capacity > parseFloat(row?.sunday)
                                            let monday_validate = find_validate?.area_nominal_capacity > parseFloat(row?.monday)
                                            let tuesday_validate = find_validate?.area_nominal_capacity > parseFloat(row?.tuesday)
                                            let wednesday_validate = find_validate?.area_nominal_capacity > parseFloat(row?.wednesday)
                                            let thursday_validate = find_validate?.area_nominal_capacity > parseFloat(row?.thursday)
                                            let friday_validate = find_validate?.area_nominal_capacity > parseFloat(row?.friday)
                                            let saturday_validate = find_validate?.area_nominal_capacity > parseFloat(row?.saturday)

                                            return (
                                                <tr
                                                    key={row?.id}
                                                    className={`${table_row_style}`}
                                                >

                                                    {/* {columnVisibility.gas_day && (
                                                        <td className="px-2 py-1 text-[#464255] text-center">{row?.gas_day_text ? row?.gas_day_text : ''}</td>
                                                    )} */}

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

                                                    {/* {columnVisibility.total_cap && (
                                                        <td className="px-2 py-1 text-[#464255] font-bold text-right">{row?.totalCap ? formatNumberThreeDecimal(row?.totalCap) : ''}</td>
                                                    )} */}

                                                    {/* {columnVisibility.nomination_point && (
                                                        <td className="px-2 py-1 text-[#464255] text-center">{row?.nomination_point ? row?.nomination_point : ''}</td>
                                                    )} */}

                                                    {columnVisibility.sunday && (
                                                        // <td className="px-2 py-1 text-[#464255] text-right">{row?.sunday ? formatNumberThreeDecimalNom(row?.sunday) : ''}</td>
                                                        <td className={`px-2 py-1 ${sunday_validate ? 'text-[#464255]' : 'text-red-600'} text-right`}>{row?.sunday ? formatNumberThreeDecimalNom(row?.sunday) : ''}</td>
                                                    )}

                                                    {columnVisibility.utilization_sunday && (
                                                        // <td className={`px-2 py-1 text-[#464255] ${row?.sunday_utilization > 100 && 'text-red-600'} text-right`}>{typeof row?.sunday_utilization === 'number' ? formatNumberTwoDecimalNom(row?.sunday_utilization) : ''}</td>
                                                        <td className={`px-2 py-1 text-[#464255] ${row?.sunday_utilization > 100 && 'text-red-600'} text-right`}>{row?.sunday_utilization !== null && row?.sunday_utilization !== undefined && row?.sunday_utilization !== '' ? formatNumberTwoDecimalNom(row?.sunday_utilization) : ''}</td>
                                                    )}

                                                    {columnVisibility.monday && (
                                                        // <td className="px-2 py-1 text-[#464255] text-right">{typeof row?.monday === 'number' ? formatNumberThreeDecimalNom(row?.monday) : ''}</td>
                                                        <td className={`px-2 py-1 ${monday_validate ? 'text-[#464255]' : 'text-red-600'} text-right`}>{row?.monday ? formatNumberThreeDecimalNom(row?.monday) : ''}</td>
                                                    )}

                                                    {columnVisibility.utilization_monday && (
                                                        // <td className={`px-2 py-1 text-[#464255] ${row?.monday_utilization > 100 && 'text-red-600'} text-right`}>{typeof row?.monday_utilization === 'number' ? formatNumberTwoDecimalNom(row?.monday_utilization) : ''}</td>
                                                        <td className={`px-2 py-1 text-[#464255] ${row?.monday_utilization > 100 && 'text-red-600'} text-right`}>{row?.monday_utilization !== null && row?.monday_utilization !== undefined && row?.monday_utilization !== '' ? formatNumberTwoDecimalNom(row?.monday_utilization) : ''}</td>
                                                    )}

                                                    {columnVisibility.tuesday && (
                                                        // <td className="px-2 py-1 text-[#464255] text-right">{typeof row?.tuesday === 'number' ? formatNumberThreeDecimalNom(row?.tuesday) : ''}</td>
                                                        <td className={`px-2 py-1 ${tuesday_validate ? 'text-[#464255]' : 'text-red-600'} text-right`}>{row?.tuesday ? formatNumberThreeDecimalNom(row?.tuesday) : ''}</td>
                                                    )}

                                                    {columnVisibility.utilization_tuesday && (
                                                        // <td className={`px-2 py-1 text-[#464255] ${row?.tuesday_utilization > 100 && 'text-red-600'} text-right`}>{typeof row?.tuesday_utilization === 'number' ? formatNumberTwoDecimalNom(row?.tuesday_utilization) : ''}</td>
                                                        <td className={`px-2 py-1 text-[#464255] ${row?.tuesday_utilization > 100 && 'text-red-600'} text-right`}>{row?.tuesday_utilization !== null && row?.tuesday_utilization !== undefined && row?.tuesday_utilization !== '' ? formatNumberTwoDecimalNom(row?.tuesday_utilization) : ''}</td>
                                                    )}

                                                    {columnVisibility.wednesday && (
                                                        // <td className="px-2 py-1 text-[#464255] text-right">{typeof row?.wednesday === 'number' ? formatNumberThreeDecimalNom(row?.wednesday) : ''}</td>
                                                        <td className={`px-2 py-1 ${wednesday_validate ? 'text-[#464255]' : 'text-red-600'} text-right`}>{row?.wednesday ? formatNumberThreeDecimalNom(row?.wednesday) : ''}</td>
                                                    )}

                                                    {columnVisibility.utilization_wednesday && (
                                                        // <td className={`px-2 py-1 text-[#464255] ${row?.wednesday_utilization > 100 && 'text-red-600'} text-right`}>{typeof row?.wednesday_utilization === 'number' ? formatNumberTwoDecimalNom(row?.wednesday_utilization) : ''}</td>
                                                        <td className={`px-2 py-1 text-[#464255] ${row?.wednesday_utilization > 100 && 'text-red-600'} text-right`}>{row?.wednesday_utilization !== null && row?.wednesday_utilization !== undefined && row?.wednesday_utilization !== '' ? formatNumberTwoDecimalNom(row?.wednesday_utilization) : ''}</td>
                                                    )}

                                                    {columnVisibility.thursday && (
                                                        // <td className="px-2 py-1 text-[#464255] text-right">{typeof row?.thursday === 'number' ? formatNumberThreeDecimalNom(row?.thursday) : ''}</td>
                                                        <td className={`px-2 py-1 ${thursday_validate ? 'text-[#464255]' : 'text-red-600'} text-right`}>{row?.thursday ? formatNumberThreeDecimalNom(row?.thursday) : ''}</td>
                                                    )}

                                                    {columnVisibility.utilization_thursday && (
                                                        // <td className={`px-2 py-1 text-[#464255] ${row?.thursday_utilization > 100 && 'text-red-600'} text-right`}>{typeof row?.thursday_utilization === 'number' ? formatNumberTwoDecimalNom(row?.thursday_utilization) : ''}</td>
                                                        <td className={`px-2 py-1 text-[#464255] ${row?.thursday_utilization > 100 && 'text-red-600'} text-right`}>{row?.thursday_utilization !== null && row?.thursday_utilization !== undefined && row?.thursday_utilization !== '' ? formatNumberTwoDecimalNom(row?.thursday_utilization) : ''}</td>
                                                    )}

                                                    {columnVisibility.friday && (
                                                        // <td className="px-2 py-1 text-[#464255] text-right">{typeof row?.friday === 'number' ? formatNumberThreeDecimalNom(row?.friday) : ''}</td>
                                                        <td className={`px-2 py-1 ${friday_validate ? 'text-[#464255]' : 'text-red-600'} text-right`}>{row?.friday ? formatNumberThreeDecimalNom(row?.friday) : ''}</td>
                                                    )}

                                                    {columnVisibility.utilization_friday && (
                                                        // <td className={`px-2 py-1 text-[#464255] ${row?.friday_utilization > 100 && 'text-red-600'} text-right`}>{typeof row?.friday_utilization === 'number' ? formatNumberTwoDecimalNom(row?.friday_utilization) : ''}</td>
                                                        <td className={`px-2 py-1 text-[#464255] ${row?.friday_utilization > 100 && 'text-red-600'} text-right`}>{row?.friday_utilization !== null && row?.friday_utilization !== undefined && row?.friday_utilization !== '' ? formatNumberTwoDecimalNom(row?.friday_utilization) : ''}</td>
                                                    )}

                                                    {columnVisibility.saturday && (
                                                        // <td className="px-2 py-1 text-[#464255] text-right">{typeof row?.saturday === 'number' ? formatNumberThreeDecimalNom(row?.saturday) : ''}</td>
                                                        <td className={`px-2 py-1 ${saturday_validate ? 'text-[#464255]' : 'text-red-600'} text-right`}>{row?.saturday ? formatNumberThreeDecimalNom(row?.saturday) : ''}</td>
                                                    )}

                                                    {columnVisibility.utilization_saturday && (
                                                        // <td className={`px-2 py-1 text-[#464255]  ${row?.saturday_utilization > 100 && 'text-red-600'} text-right`}>{typeof row?.saturday_utilization === 'number' ? formatNumberTwoDecimalNom(row?.saturday_utilization) : ''}</td>
                                                        <td className={`px-2 py-1 text-[#464255]  ${row?.saturday_utilization > 100 && 'text-red-600'} text-right`}>{row?.saturday_utilization !== null && row?.saturday_utilization !== undefined && row?.saturday_utilization !== '' ? formatNumberTwoDecimalNom(row?.saturday_utilization) : ''}</td>
                                                    )}

                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                        </>
                            : tabIndex2ndTab == 0 && <TableSkeleton />
                    }

                    {/******************* TABLE TAB IMBALANCE *******************/}
                    {
                        isLoading && tabIndex2ndTab == 1 ? <table className={`w-full text-sm text-left rtl:text-right text-gray-500 `}>
                            <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                                <tr className="h-20">
                                    {columnVisibility.gas_day && (
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
                                        <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("imbalance", sortState, setSortState, setSortedData, dataTable)}>
                                            {`Imbalance`}
                                            {getArrowIcon("imbalance")}
                                        </th>
                                    )}

                                    {columnVisibility.imbalance_percent && (
                                        <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("imbalance_percent", sortState, setSortState, setSortedData, dataTable)}>
                                            {`Imbalance (%)`}
                                            {getArrowIcon("imbalance_percent")}
                                        </th>
                                    )}

                                    {columnVisibility.park && (
                                        <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("park", sortState, setSortState, setSortedData, dataTable)}>
                                            {`Park`}
                                            {getArrowIcon("park")}
                                        </th>
                                    )}

                                    {columnVisibility.unpark && (
                                        <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("unpark", sortState, setSortState, setSortedData, dataTable)}>
                                            {`Unpark`}
                                            {getArrowIcon("unpark")}
                                        </th>
                                    )}

                                    {columnVisibility.change_min_invent && (
                                        <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("change_min_invent", sortState, setSortState, setSortedData, dataTable)}>
                                            {`Change Min Invent`}
                                            {getArrowIcon("change_min_invent")}
                                        </th>
                                    )}

                                    {columnVisibility.shrinkage && (
                                        <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("shrinkage", sortState, setSortState, setSortedData, dataTable)}>
                                            {`Shrinkage`}
                                            {getArrowIcon("shrinkage")}
                                        </th>
                                    )}

                                </tr>
                            </thead>

                            <tbody>
                                {
                                    sortedData.length > 0 && sortedData?.map((row: any, index: any) => {
                                        // paginatedData.length > 0 && paginatedData?.map((row: any, index: any) => { //old
                                        return (
                                            <tr
                                                key={row?.id}
                                                className={`${table_row_style}`}
                                            >

                                                {columnVisibility.gas_day && (
                                                    <td className="px-2 py-1 text-[#464255] ">{row?.gas_day_text ? row?.gas_day_text : ''}</td>
                                                )}

                                                {columnVisibility.imbalance && (
                                                    <td className="px-2 py-1 text-[#464255] text-right">{row?.imbalance !== null && row?.imbalance !== undefined ? formatNumberThreeDecimalNom(row?.imbalance) : ''}</td>
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
                        isLoading && sortedData?.length == 0 && <NodataTable />
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
                // initialColumns={initialColumnsTabEntryExit}
                initialColumns={tabIndex2ndTab == 0 ? initialColumnsTabEntryExit : initialColumnsTabImbalance}
            />

        </div>
    )
}

export default TableWeeklyArea;