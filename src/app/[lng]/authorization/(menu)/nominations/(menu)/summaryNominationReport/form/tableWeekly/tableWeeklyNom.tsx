import { useEffect } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatNumberSixDecimalNom, formatNumberThreeDecimalNoComma, formatNumberThreeDecimalNom, formatNumberTwoDecimal, formatNumberTwoDecimalNom, getCurrentWeekDatesYyyyMmDdFromDate, getNextWeekSundayYyyyMmDd } from '@/utils/generalFormatter';
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
import BtnText from "@/components/other/btnText";

// หน้านี้มี Tab Nomination, Area, Total System
// tab MMSCF, MMBTU
// tab hour ['All Day' ,'1-6 Hr.' , '7-12 Hr.' , '13-18 Hr.' , '19-24 Hr.']

const TableWeeklyNomination: React.FC<any> = ({ openWarning, tableData, isLoading, userPermission, zoneText, tempData, setTempData, tempDataConcept, setTempDataConcept, areaMaster, entryExitMaster, setIsEdited, tabEntry, tabConcep, tabIndex2ndTab, nomData, srchCheckbox, activeButton, dataEva }) => {

    const [dataTable, setDataTable] = useState<any>([]);
    const [sortedData, setSortedData] = useState<any>([]);
    useEffect(() => {
        setDataTable(tableData)
        // setSortedData(tableData?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        setSortedData(tableData)

        setCurrentPage(1); // เผื่อกดเสิช จะให้มันกลับไปหน้าแรก
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
    const dayMapping = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const startKey = 14;
    const endKey = 20;

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
        { key: 'nomination_point', label: 'Nomination Point', visible: true },

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

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const getInitialColumns = () => initialColumnsTabEntryExit;

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
    let date_next_sunday: any = []

    useEffect(() => {
        if (tableData) {
            // "11/05/2025"
            // tableData[0].gas_day_text
            date_next_sunday = getCurrentWeekDatesYyyyMmDdFromDate(tableData[0]?.gas_day_text)
            let sun_day_fun_day = getNextWeekSundayYyyyMmDd();

            setDateOnHeader(getCurrentWeekDatesYyyyMmDdFromDate(tableData[0]?.gas_day_text !== undefined ? tableData[0]?.gas_day_text : sun_day_fun_day))
        }
    }, [tableData])

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {

        let filtered = dataTable?.filter(
            (item: any) => {
                const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();

                return (
                    item?.nomination_point?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

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
                    formatNumberThreeDecimalNoComma(item?.saturday_utilization)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
                )
            }
        );

        setSortedData(filtered);
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
    }






    return (
        // <div className={`relative h-[calc(100vh-340px)] overflow-y-auto block  rounded-t-md z-1`}>
        <div className={`relative h-[calc(100vh-200px)] overflow-y-hidden  block  rounded-t-md z-1`}>

            <div className="w-full h-[82%] px-4 border-[#DFE4EA] border-[1px] gap-2 rounded-xl shadow-sm flex flex-col">

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
                            handleFieldCilck={()=>openWarning({type:"TableWeeklyNomination", paginatedData, nomData, tabIndex2ndTab, dataEva})}
                            text={`Submission Comment`}
                        />
                        <BtnExport
                            textRender={"Export"}
                            data={sortedData}
                            path="nomination/summary-nomination-report"
                            can_export={userPermission ? userPermission?.f_export : false}
                            columnVisibility={columnVisibility}
                            initialColumns={initialColumnsTabEntryExit}
                            specificMenu='summary-nomination-report'
                            type={tabIndex2ndTab == 0 ? `['nomination']['weekly']['MMSCFD']` : `['nomination']['weekly']['MMBTUD']`}
                            // specificData={date_next_sunday}
                            // specificData={dateOnHeader}
                            specificData={{
                                dateOnHeader: dateOnHeader,
                                tab: activeButton,
                                over_total_cap: srchCheckbox
                            }}
                        />
                    </div>
                </div>

                <div className="overflow-y-auto overflow-x-auto w-full h-[54dvh]">
                    {
                        isLoading ? <>
                            <table className={`w-full text-sm text-left rtl:text-right text-gray-500 `}>
                                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                                    <tr className="h-20">

                                        {/* ที่ handleSort ส่ง paginatedData แทน dataTable เพราะข้อนี้ */}
                                        {/* All > Weekly > Nomination > MMSCF > Smart Sear แล้ว Sort Column ทำให้ Smart Search หลุด https://app.clickup.com/t/86euy05du */}
                                        {columnVisibility.nomination_point && (
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] `} onClick={() => handleSort("nomination_point", sortState, setSortState, setSortedData, dataTable)}>
                                            // <th scope="col" className={`${table_sort_header_style} min-w-[120px] `} onClick={() => handleSort("nomination_point", sortState, setSortState, setSortedData, paginatedData)}>
                                            <th scope="col" className={`${table_sort_header_style} min-w-[120px] `} onClick={() => handleSort("nomination_point", sortState, setSortState, setSortedData, dataTable)}>
                                                {`Nomination Point`}
                                                {getArrowIcon("nomination_point")}
                                            </th>
                                        )}

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
                                        paginatedData.length > 0 && paginatedData?.map((row: any, index: any) => {
                                            // tabIndex2ndTab 0 = mmscf
                                            // tabIndex2ndTab 1 = mmbtu

                                            let find_validate = nomData?.find((item: any) => item?.nomination_point === row?.nomination_point)

                                            const targetData = dataEva?.newWeekly?.find((item: any) => {
                                                const area_id = find_validate?.area?.entry_exit_id == 1 ? find_validate.area.id : find_validate.area.supply_reference_quality_area
                                                return (
                                                    item.area.id === area_id &&
                                                    item.zone.name === find_validate.zone.name &&
                                                    item.parameter === "HV"
                                                );
                                            });

                                            let sunday_validate;
                                            let monday_validate;
                                            let tuesday_validate;
                                            let wednesday_validate;
                                            let thursday_validate;
                                            let friday_validate;
                                            let saturday_validate;

                                            let sunday_max_cap;
                                            let monday_max_cap;
                                            let tuesday_max_cap;
                                            let wednesday_max_cap;
                                            let thursday_max_cap;
                                            let friday_max_cap;
                                            let saturday_max_cap;
                                            
                                            if(row?.unix === "MMBTU/D"){
                                                if(row?.zone_text === "EAST-WEST"){
                                                    
                                                    sunday_max_cap = parseFloat(row?.sunday_hv) * parseFloat(find_validate?.maximum_capacity)
                                                    monday_max_cap = parseFloat(row?.monday_hv) * parseFloat(find_validate?.maximum_capacity)
                                                    tuesday_max_cap = parseFloat(row?.tuesday_hv) * parseFloat(find_validate?.maximum_capacity)
                                                    wednesday_max_cap = parseFloat(row?.wednesday_hv) * parseFloat(find_validate?.maximum_capacity)
                                                    thursday_max_cap = parseFloat(row?.thursday_hv) * parseFloat(find_validate?.maximum_capacity)
                                                    friday_max_cap = parseFloat(row?.friday_hv) * parseFloat(find_validate?.maximum_capacity)
                                                    saturday_max_cap = parseFloat(row?.saturday_hv) * parseFloat(find_validate?.maximum_capacity)

                                                    sunday_validate = sunday_max_cap > parseFloat(row?.sunday)
                                                    monday_validate = monday_max_cap > parseFloat(row?.monday)
                                                    tuesday_validate = tuesday_max_cap > parseFloat(row?.tuesday)
                                                    wednesday_validate = wednesday_max_cap > parseFloat(row?.wednesday)
                                                    thursday_validate = thursday_max_cap > parseFloat(row?.thursday)
                                                    friday_validate = friday_max_cap > parseFloat(row?.friday)
                                                    saturday_validate = saturday_max_cap > parseFloat(row?.saturday)
                                                    
                                                }else{
                                                
                                                    sunday_max_cap = parseFloat(row?.sunday_hv) * parseFloat(find_validate?.maximum_capacity)
                                                    monday_max_cap = parseFloat(row?.monday_hv) * parseFloat(find_validate?.maximum_capacity)
                                                    tuesday_max_cap = parseFloat(row?.tuesday_hv) * parseFloat(find_validate?.maximum_capacity)
                                                    wednesday_max_cap = parseFloat(row?.wednesday_hv) * parseFloat(find_validate?.maximum_capacity)
                                                    thursday_max_cap = parseFloat(row?.thursday_hv) * parseFloat(find_validate?.maximum_capacity)
                                                    friday_max_cap = parseFloat(row?.friday_hv) * parseFloat(find_validate?.maximum_capacity)
                                                    saturday_max_cap = parseFloat(row?.saturday_hv) * parseFloat(find_validate?.maximum_capacity)

                                                    sunday_validate = sunday_max_cap > parseFloat(row?.sunday)
                                                    monday_validate = monday_max_cap > parseFloat(row?.monday)
                                                    tuesday_validate = tuesday_max_cap > parseFloat(row?.tuesday)
                                                    wednesday_validate = wednesday_max_cap > parseFloat(row?.wednesday)
                                                    thursday_validate = thursday_max_cap > parseFloat(row?.thursday)
                                                    friday_validate = friday_max_cap > parseFloat(row?.friday)
                                                    saturday_validate = saturday_max_cap > parseFloat(row?.saturday)
                                                    
                                                }
                                            }else{
                                            
                                                    sunday_max_cap = find_validate?.mmscf_max_cap
                                                    monday_max_cap = find_validate?.mmscf_max_cap
                                                    tuesday_max_cap = find_validate?.mmscf_max_cap
                                                    wednesday_max_cap = find_validate?.mmscf_max_cap
                                                    thursday_max_cap = find_validate?.mmscf_max_cap
                                                    friday_max_cap = find_validate?.mmscf_max_cap
                                                    saturday_max_cap = find_validate?.mmscf_max_cap

                                                    sunday_validate = find_validate?.maximum_capacity > parseFloat(row?.sunday)
                                                    monday_validate = find_validate?.maximum_capacity > parseFloat(row?.monday)
                                                    tuesday_validate = find_validate?.maximum_capacity > parseFloat(row?.tuesday)
                                                    wednesday_validate = find_validate?.maximum_capacity > parseFloat(row?.wednesday)
                                                    thursday_validate = find_validate?.maximum_capacity > parseFloat(row?.thursday)
                                                    friday_validate = find_validate?.maximum_capacity > parseFloat(row?.friday)
                                                    saturday_validate = find_validate?.maximum_capacity > parseFloat(row?.saturday)
                                                
                                            }

                                            return (
                                                <tr
                                                    key={row?.id}
                                                    className={`${table_row_style}`}
                                                >

                                                    {columnVisibility.nomination_point && (
                                                        <td className="px-2 py-1 text-[#464255] text-center">{row?.nomination_point ? row?.nomination_point : ''}</td>
                                                    )}

                                                    {columnVisibility.sunday && (
                                                        <td className={`px-2 py-1 ${sunday_validate ? 'text-[#464255]' : 'text-red-600'} text-right`}>
                                                            {/* ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w */}
                                                            {/* {row?.sunday ? formatNumberThreeDecimalNom(row?.sunday) : ''} */}
                                                            {row?.sunday ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(row?.sunday) : formatNumberThreeDecimalNom(row?.sunday) : (row?.sunday === 0 ? (tabIndex2ndTab == 0 ? "0.000000" : "0.000") : "")}
                                                        </td>
                                                    )}

                                                    {columnVisibility.utilization_sunday && (
                                                        <td className={`px-2 py-1 text-[#464255] ${row?.sunday_utilization > 100 && 'text-red-600'} text-right`}>{row?.sunday_utilization !== null && row?.sunday_utilization !== undefined ? formatNumberTwoDecimalNom(row?.sunday_utilization) : ''}</td>
                                                    )}

                                                    {columnVisibility.monday && (
                                                        <td className={`px-2 py-1 ${monday_validate ? 'text-[#464255]' : 'text-red-600'} text-right`}>
                                                            {/* ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w */}
                                                            {/* {row?.monday ? formatNumberThreeDecimalNom(row?.monday) : ''} */}
                                                            {row?.monday ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(row?.monday) : formatNumberThreeDecimalNom(row?.monday) : (row?.sunday === 0 ? (tabIndex2ndTab == 0 ? "0.000000" : "0.000") : "")}
                                                        </td>
                                                    )}

                                                    {columnVisibility.utilization_monday && (
                                                        <td className={`px-2 py-1 text-[#464255] ${row?.monday_utilization > 100 && 'text-red-600'} text-right`}>{row?.monday_utilization !== null && row?.monday_utilization !== undefined ? formatNumberTwoDecimalNom(row?.monday_utilization) : ''}</td>
                                                    )}

                                                    {columnVisibility.tuesday && (
                                                        <td className={`px-2 py-1 ${tuesday_validate ? 'text-[#464255]' : 'text-red-600'} text-right`}>
                                                            {/* ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w */}
                                                            {/* {row?.tuesday ? formatNumberThreeDecimalNom(row?.tuesday) : ''} */}
                                                            {row?.tuesday ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(row?.tuesday) : formatNumberThreeDecimalNom(row?.tuesday) : (row?.sunday === 0 ? (tabIndex2ndTab == 0 ? "0.000000" : "0.000") : "")}
                                                        </td>
                                                    )}

                                                    {columnVisibility.utilization_tuesday && (
                                                        <td className={`px-2 py-1 text-[#464255] ${row?.tuesday_utilization > 100 && 'text-red-600'} text-right`}>{row?.tuesday_utilization !== null && row?.tuesday_utilization !== undefined ? formatNumberTwoDecimalNom(row?.tuesday_utilization) : ''}</td>
                                                    )}

                                                    {columnVisibility.wednesday && (
                                                        <td className={`px-2 py-1 ${wednesday_validate ? 'text-[#464255]' : 'text-red-600'} text-right`}>
                                                            {/* ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w */}
                                                            {/* {row?.wednesday ? formatNumberThreeDecimalNom(row?.wednesday) : ''} */}
                                                            {row?.wednesday ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(row?.wednesday) : formatNumberThreeDecimalNom(row?.wednesday) : (row?.sunday === 0 ? (tabIndex2ndTab == 0 ? "0.000000" : "0.000") : "")}
                                                        </td>
                                                    )}

                                                    {columnVisibility.utilization_wednesday && (
                                                        <td className={`px-2 py-1 text-[#464255] ${row?.wednesday_utilization > 100 && 'text-red-600'} text-right`}>{row?.wednesday_utilization !== null && row?.wednesday_utilization !== undefined ? formatNumberTwoDecimalNom(row?.wednesday_utilization) : ''}</td>
                                                    )}

                                                    {columnVisibility.thursday && (
                                                        <td className={`px-2 py-1 ${thursday_validate ? 'text-[#464255]' : 'text-red-600'} text-right`}>
                                                            {/* ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w */}
                                                            {/* {row?.thursday ? formatNumberThreeDecimalNom(row?.thursday) : ''} */}
                                                            {row?.thursday ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(row?.thursday) : formatNumberThreeDecimalNom(row?.thursday) : (row?.sunday === 0 ? (tabIndex2ndTab == 0 ? "0.000000" : "0.000") : "")}
                                                        </td>
                                                    )}

                                                    {columnVisibility.utilization_thursday && (
                                                        <td className={`px-2 py-1 text-[#464255] ${row?.thursday_utilization > 100 && 'text-red-600'} text-right`}>{row?.thursday_utilization !== null && row?.thursday_utilization !== undefined ? formatNumberTwoDecimalNom(row?.thursday_utilization) : ''}</td>
                                                    )}

                                                    {columnVisibility.friday && (
                                                        <td className={`px-2 py-1 ${friday_validate ? 'text-[#464255]' : 'text-red-600'} text-right`}>
                                                            {/* ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w */}
                                                            {/* {row?.friday ? formatNumberThreeDecimalNom(row?.friday) : ''} */}
                                                            {row?.friday ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(row?.friday) : formatNumberThreeDecimalNom(row?.friday) : (row?.sunday === 0 ? (tabIndex2ndTab == 0 ? "0.000000" : "0.000") : "")}
                                                        </td>
                                                    )}

                                                    {columnVisibility.utilization_friday && (
                                                        <td className={`px-2 py-1 text-[#464255] ${row?.friday_utilization > 100 && 'text-red-600'} text-right`}>{row?.friday_utilization !== null && row?.friday_utilization !== undefined ? formatNumberTwoDecimalNom(row?.friday_utilization) : ''}</td>
                                                    )}

                                                    {columnVisibility.saturday && (
                                                        <td className={`px-2 py-1 ${saturday_validate ? 'text-[#464255]' : 'text-red-600'} text-right`}>
                                                            {/* ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w */}
                                                            {/* {row?.saturday ? formatNumberThreeDecimalNom(row?.saturday) : ''} */}
                                                            {row?.saturday ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(row?.saturday) : formatNumberThreeDecimalNom(row?.saturday) : (row?.sunday === 0 ? (tabIndex2ndTab == 0 ? "0.000000" : "0.000") : "")}
                                                        </td>
                                                    )}

                                                    {columnVisibility.utilization_saturday && (
                                                        <td className={`px-2 py-1 text-[#464255] ${row?.saturday_utilization > 100 && 'text-red-600'} text-right`}>{row?.saturday_utilization !== null && row?.saturday_utilization !== undefined ? formatNumberTwoDecimalNom(row?.saturday_utilization) : ''}</td>
                                                    )}
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                        </>
                            :
                            <TableSkeleton />
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
                initialColumns={initialColumnsTabEntryExit}
            />

        </div>
    )
}

export default TableWeeklyNomination;