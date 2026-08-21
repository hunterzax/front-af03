import { useEffect, useRef } from "react";
import React, { FC, useState } from 'react';
import TableSkeleton, { DefaultSkeleton } from '@/components/material_custom/DefaultSkeleton';
import { formatNumberThreeDecimal, getContrastTextColor } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort, handleSortConcept } from "@/utils/sortTable";
import NodataTable from "@/components/other/nodataTable";
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ModeEditOutlinedIcon from '@mui/icons-material/ModeEditOutlined';
import { NumericFormat } from "react-number-format";
import { Tab, Tabs } from "@mui/material";
import { Tune } from "@mui/icons-material"
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import PaginationComponent from "@/components/other/globalPagination";

const inputClass = "text-[14px] block p-2 h-[37px] w-full border-[1px] bg-white border-[#9CA3AF] outline-none bg-opacity-100 focus:border-[#00ADEF] hover:!p-2 focus:!p-2";

const TableEachZone: React.FC<any> = ({ tableData, isLoading, userPermission, zoneText, tempData, setTempData, tempDataConcept, setTempDataConcept, areaMaster, entryExitMaster, setIsEdited, tabEntry, tabConcept, isAfterGasDay, readOnly }) => {
    const [sortedData, setSortedData] = useState<any>([]);
    const [sortState, setSortState] = useState({ column: null, direction: null });

    useEffect(() => {
        setSortedData(tabEntry);
    }, [tabEntry])

    // query_shipper_nomination_type_id == 1 || type 1 คือ tab entry/exit || type 2, 4, 5 tab concept
    // 1 = columnPointId
    // 2 = columnPointIdConcept
    // 3 = columnType
    // 4 = columnParkUnparkinstructedFlows
    // 5 = columnWHV

    useEffect(() => {
        // DATA TAB ENTRY / EXIT
        const filteredData = tableData?.filter(
            (item: any) => item?.zone_text === zoneText && item?.query_shipper_nomination_type_id === 1
        );
        setTempData(filteredData);

        // DATA TAB CONCEPT POINT
        const filteredDataConcept = tableData?.filter(
            // (item: any) => item?.query_shipper_nomination_type_id !== 1
            // (item: any) => item?.query_shipper_nomination_type_id == 2 // 2 แสดงใน tab concept ไปก่อน
            (item: any) => item?.zone_text == zoneText && item?.query_shipper_nomination_type_id !== 1
        );

        const data_tab_concept = filteredDataConcept?.flat().map(({ data_temp2, ...rest }:any) => ({
            ...rest,
            ...data_temp2,
            data_temp2, // keep original data_temp intact
        }));

        // setTempDataConcept(filteredDataConcept)
        setTempDataConcept(data_tab_concept)

    }, [tableData, isLoading]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    // ===================== EDIT BTN =====================
    const [isEditing, setIsEditing] = useState(false); // ถ้ากด edit isEditing จะเป็น true
    const [isEditedInRow, setIsEditedInRow] = useState(false); // ถ้าแก้ไขข้อมูลใน row จะเป็น true
    const [isSaveClick, setIsSaveClick] = useState(false); // ถ้ากด edit isEditing จะเป็น true
    const [rowEditing, setRowEditing] = useState<any>(); // เก็บ id ของ record ที่ edit

    const handleEditClick = (rowId: any) => {
        if (!rowEditing || rowId == rowEditing) {
            setIsEditing(!isEditing);
        }
        setRowEditing(rowId);
    };

    useEffect(() => {
        if (tabMain == 0) {
            // setSortedData(tempData)
            setSortedData([...tempData]);
            setIsEditing(false)
        } else {
            // setSortedData(tempDataConcept)
            setSortedData([...tempDataConcept]);
            setIsEditing(false)
        }
    }, [isSaveClick])

    const handleSaveClick = async (rowId?: any) => {
        if (tabMain == 0) {
            // setSortedData(tempData)
            setSortedData([...tempData]);  // ✅ Clone the array
        } else {
            // setSortedData(tempDataConcept)
            setSortedData([...tempDataConcept]);  // ✅ Clone the array
        }

        setIsEdited(true); // Nom Code Detail > ปุ่ม submit จะ active ต่อเมื่อมีการ Edit ข้อมูลบางอย่าง https://app.clickup.com/t/86erwqc7q
        setIsEditing(!isEditing);
        setRowEditing(undefined);
    }

    const handleCancelClick = (rowId: any) => {
        setIsEditing(!isEditing);
        setRowEditing(undefined)
    };

    // ===================== TABLE HEADER MAP =====================
    const hours = Array.from({ length: 24 }, (_, i) => ({
        key: `h${i + 1}`,
        label: `H${i + 1}`,
        timeRange: `${String(i).padStart(2, "0")}:01 - ${String(i + 1).padStart(2, "0")}:00`
    }));

    // ############### TAB ###############
    const [tabIndex, setTabIndex] = useState(0);
    const handleChange = (event: any, newValue: any) => {
        // 0 = 1-6 Hr
        // 1 = 7-12 Hr
        // 2 = 13-18 Hr
        // 3 = 19-24 Hr
        // 4 = All Day
        setTabIndex(newValue);
    };

    const getVisibleHours = () => {
        switch (tabIndex) {
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
    }, [tabIndex])

    const [tabMain, setTabMain] = useState(0);
    const handleChangeTabMain = (event: any, newValue: any) => {
        setTabMain(newValue);
    };

    // ############### COLUMN SHOW/HIDE ENTRY / EXIT ###############
    // if tabIndex = 4 show all
    const initialColumnsTabEntryExit: any = [
        { key: 'supply_demand', label: 'Supply/Demand', visible: true }, // always show
        { key: 'area', label: 'Area', visible: true }, // always show
        { key: 'nomination_point', label: 'Nomination Point', visible: true }, // always show
        { key: 'unit', label: 'Unit', visible: true }, // always show
        { key: 'type', label: 'Type', visible: true }, // always show
        { key: 'entry_exit', label: 'Entry/Exit', visible: true }, // always show
        { key: 'wi', label: 'WI', visible: true }, // always show
        { key: 'hv', label: 'HV', visible: true }, // always show
        { key: 'sg', label: 'SG', visible: true }, // always show

        { key: 'h1', label: 'H1 00:00 - 01:00', visible: true }, // show if tabIndex = 0
        { key: 'h2', label: 'H2 01:01 - 02:00', visible: true }, // show if tabIndex = 0
        { key: 'h3', label: 'H3 02:01 - 03:00', visible: true }, // show if tabIndex = 0
        { key: 'h4', label: 'H4 03:01 - 04:00', visible: true }, // show if tabIndex = 0
        { key: 'h5', label: 'H5 04:01 - 05:00', visible: true }, // show if tabIndex = 0
        { key: 'h6', label: 'H6 05:01 - 06:00', visible: true }, // show if tabIndex = 0

        { key: 'h7', label: 'H7 06:01 - 07:00', visible: true }, // show if tabIndex = 1
        { key: 'h8', label: 'H8 07:01 - 08:00', visible: true }, // show if tabIndex = 1
        { key: 'h9', label: 'H9 08:01 - 09:00', visible: true }, // show if tabIndex = 1
        { key: 'h10', label: 'H10 09:01 - 10:00', visible: true }, // show if tabIndex = 1
        { key: 'h11', label: 'H11 10:01 - 11:00', visible: true }, // show if tabIndex = 1
        { key: 'h12', label: 'H12 11:01 - 12:00', visible: true }, // show if tabIndex = 1

        { key: 'h13', label: 'H13 12:01 - 13:00', visible: true }, // show if tabIndex = 2
        { key: 'h14', label: 'H14 13:01 - 14:00', visible: true }, // show if tabIndex = 2
        { key: 'h15', label: 'H15 14:01 - 15:00', visible: true }, // show if tabIndex = 2
        { key: 'h16', label: 'H16 15:01 - 16:00', visible: true }, // show if tabIndex = 2
        { key: 'h17', label: 'H17 16:01 - 17:00', visible: true }, // show if tabIndex = 2
        { key: 'h18', label: 'H18 17:01 - 18:00', visible: true }, // show if tabIndex = 2

        { key: 'h19', label: 'H19 18:01 - 19:00', visible: true }, // show if tabIndex = 3
        { key: 'h20', label: 'H20 19:01 - 20:00', visible: true }, // show if tabIndex = 3
        { key: 'h21', label: 'H21 20:01 - 21:00', visible: true }, // show if tabIndex = 3
        { key: 'h22', label: 'H22 21:01 - 22:00', visible: true }, // show if tabIndex = 3
        { key: 'h23', label: 'H23 22:01 - 23:00', visible: true }, // show if tabIndex = 3
        { key: 'h24', label: 'H24 23:01 - 24:00', visible: true }, // show if tabIndex = 3
        { key: 'total', label: 'Total', visible: true }, // always show
        { key: 'edit', label: 'Edit', visible: true }, // always show
    ];

    const initialColumnsTabConceptPoint: any = [
        { key: 'supply_demand', label: 'Supply/Demand', visible: true },
        { key: 'concept_id', label: 'Concept ID', visible: true },
        { key: 'unit', label: 'Unit', visible: true },
        { key: 'entry_exit', label: 'Entry/Exit', visible: true },
        { key: 'h1', label: 'H1 00:00 - 01:00', visible: true },
        { key: 'h2', label: 'H2 01:01 - 02:00', visible: true },
        { key: 'h3', label: 'H3 02:01 - 03:00', visible: true },
        { key: 'h4', label: 'H4 03:01 - 04:00', visible: true },
        { key: 'h5', label: 'H5 04:01 - 05:00', visible: true },
        { key: 'h6', label: 'H6 05:01 - 06:00', visible: true },
        { key: 'h7', label: 'H7 06:01 - 07:00', visible: true },
        { key: 'h8', label: 'H8 07:01 - 08:00', visible: true },
        { key: 'h9', label: 'H9 08:01 - 09:00', visible: true },
        { key: 'h10', label: 'H10 09:01 - 10:00', visible: true },
        { key: 'h11', label: 'H11 10:01 - 11:00', visible: true },
        { key: 'h12', label: 'H12 11:01 - 12:00', visible: true },
        { key: 'h13', label: 'H13 12:01 - 13:00', visible: true },
        { key: 'h14', label: 'H14 13:01 - 14:00', visible: true },
        { key: 'h15', label: 'H15 14:01 - 15:00', visible: true },
        { key: 'h16', label: 'H16 15:01 - 16:00', visible: true },
        { key: 'h17', label: 'H17 16:01 - 17:00', visible: true },
        { key: 'h18', label: 'H18 17:01 - 18:00', visible: true },
        { key: 'h19', label: 'H19 18:01 - 19:00', visible: true },
        { key: 'h20', label: 'H20 19:01 - 20:00', visible: true },
        { key: 'h21', label: 'H21 20:01 - 21:00', visible: true },
        { key: 'h22', label: 'H22 21:01 - 22:00', visible: true },
        { key: 'h23', label: 'H23 22:01 - 23:00', visible: true },
        { key: 'h24', label: 'H24 23:01 - 24:00', visible: true },
        { key: 'total', label: 'Total', visible: true },
        { key: 'edit', label: 'Edit', visible: true },
    ];

    const filterColumnsByTabIndex = (tabIndex: number) => {
        return initialColumnsTabEntryExit.filter((col: any) => {
            // Always show these columns

            // const alwaysVisibleKeys = [ "supply_demand", "area", "nomination_point", "unit", "type", "entry_exit", "wi", "hv", "sg", "total", "edit"];
            const alwaysVisibleKeys = tabMain == 0 ?
                ["supply_demand", "area", "nomination_point", "unit", "type", "entry_exit", "wi", "hv", "sg", "total", "edit"]
                : ["supply_demand", "concept_id", "unit", "entry_exit"]

            if (alwaysVisibleKeys.includes(col.key)) {
                return true;
            }

            if (tabIndex === 4) { // All day
                return true; // Show all columns if tabIndex = 4
            }

            // Define hourly column visibility based on tab index
            const hourColumnMapping: { [key: number]: string[] } = {
                0: ["h1", "h2", "h3", "h4", "h5", "h6"],
                1: ["h7", "h8", "h9", "h10", "h11", "h12"],
                2: ["h13", "h14", "h15", "h16", "h17", "h18"],
                3: ["h19", "h20", "h21", "h22", "h23", "h24"],
            };

            return hourColumnMapping[tabIndex]?.includes(col.key) ?? false;
        });
    };

    // Usage
    const visibleColumns = filterColumnsByTabIndex(tabIndex);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    // const getInitialColumns = () => tabMain === 0 ? initialColumnsTabEntryExit : initialColumnsTabConceptPoint;
    const getInitialColumns = () => tabMain === 0 ? visibleColumns : initialColumnsTabConceptPoint;

    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(getInitialColumns().map((column: any) => [column.key, column.visible]))
    );

    useEffect(() => {
        setColumnVisibility(Object.fromEntries(getInitialColumns().map((column: any) => [column.key, column.visible])));

        if (tabMain == 0) {
            setSortedData(tempData)
        } else {
            setSortedData(tempDataConcept)
        }
    }, [tabMain]);

    useEffect(() => {
        setColumnVisibility(
            Object.fromEntries(getInitialColumns().map((column: any) => [column.key, column.visible]))
        );
    }, [tabIndex]);

    const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const handleColumnToggle = (columnKey: string) => {
        setColumnVisibility((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    };

    // ############### SET DATA ###############
    const setTempDataByTab = (tabMain: number, oldIndex: number, value: string, updateKey: any) => {

        if (tabMain == 0) {
            // update in tab entry/exit
            tempData.forEach((item: any) => {
                if (item.old_index === oldIndex) {
                    item.data_temp2[updateKey] = value

                    // update พวก H1, H2 ... ที่อยู่ชั้นนอกด้วย
                    const updateKeyNum = parseInt(updateKey);
                    if (updateKeyNum >= 14 && updateKeyNum <= 37) {
                        const hKey = `H${updateKeyNum - 13}`; // "14" -> H1, "15" -> H2, ..., "37" -> H24
                        item[hKey] = value;
                    }

                    // 2. รวมค่าตั้งแต่ key "14" ถึง "37"
                    let sum = 0;
                    for (let i = 14; i <= 37; i++) {
                        const num = parseFloat(item.data_temp2[i.toString()] || "0");
                        sum += isNaN(num) ? 0 : num;
                    }

                    // อัปเดต key "38" ด้วยผลรวม
                    item.data_temp2["38"] = sum.toFixed(3);
                    item.total = sum.toFixed(3);
                }
            });
        } else {
            // update in tab concept point
            tempDataConcept.forEach((item: any) => {
                if (item.old_index === oldIndex) {
                    item.data_temp2[updateKey] = value

                    // update พวก H1, H2 ... ที่อยู่ชั้นนอกด้วย
                    const updateKeyNum = parseInt(updateKey);
                    if (updateKeyNum >= 14 && updateKeyNum <= 37) {
                        const hKey = `H${updateKeyNum - 13}`;
                        item[hKey] = value;
                    }

                    // 2. รวมค่าตั้งแต่ key "14" ถึง "37"
                    let sum = 0;
                    for (let i = 14; i <= 37; i++) {
                        const num = parseFloat(item.data_temp2[i.toString()] || "0");
                        sum += isNaN(num) ? 0 : num;
                    }

                    // อัปเดต key "38" ด้วยผลรวม
                    item.data_temp2["38"] = sum.toFixed(3);
                    item.total = sum.toFixed(3);
                }
            });
        }

        // if (tabMain === 0) {
        //     setTempData(updateData);
        // } else {
        //     setTempDataConcept(updateData);
        // }

        // ถ้าแก้ไข เปิดปุ่ม save draft
        setIsEditedInRow(true)
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
            // setPaginatedData(sortedData?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))

            if (tabMain == 0) {
                setPaginatedData(tempData?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
                // setSortedData(tempData?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
            } else {
                setPaginatedData(tempDataConcept?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
                // setSortedData(tempDataConcept?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
            }
        }
    }, [sortedData, currentPage, itemsPerPage])

    return (<>
        {/* h-[calc(100vh-340px)] */}
        <div className={`relative h-[calc(100vh-180px)] overflow-y-auto block  rounded-t-md z-1`}>

            <div className="pb-2 -ml-5">
                <Tabs
                    value={tabMain}
                    onChange={handleChangeTabMain}
                    aria-label="wrapped label tabs example"
                    sx={{
                        '& .Mui-selected': {
                            color: '#00ADEF !important',
                            fontWeight: 'bold !important',
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#00ADEF !important',
                            width: tabMain === 0 ? '90px !important' : '110px !important',
                            transform: tabMain === 0 ? 'translateX(30%)' : 'translateX(15%)',
                            bottom: '10px',
                        },
                        '& .MuiTab-root': {
                            minWidth: 'auto !important',
                        },
                    }}
                >
                    {['Entry/Exit', 'Concept Point'].map((label, index) => (
                        <Tab
                            key={label}
                            label={label}
                            id={`tab-${index}`}
                            sx={{
                                fontFamily: 'Tahoma !important',
                                textTransform: 'none',
                                padding: '8px 16px',
                                minWidth: '50px',
                                maxWidth: '140px',
                                flexShrink: 0,
                                color: tabMain === index ? '#58585A' : '#9CA3AF',
                            }}
                        />
                    ))}
                </Tabs>
            </div>

            <div className="flex items-center space-x-2 pb-4">
                <div onClick={handleTogglePopover}>
                    <Tune
                        className="cursor-pointer rounded-lg"
                        style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                    />
                </div>
            </div>

            <div className="tabPlanning pb-4 ">
                <Tabs
                    value={tabIndex}
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
                    {['1-6 Hr.', '7-12 Hr.', '13-18 Hr.', '19-24 Hr.', 'All Day'].map((label, index) => (
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
                                backgroundColor: tabIndex === index ? '#FFFFFF' : '#9CA3AF1A',
                                color: tabIndex === index ? '#58585A' : '#9CA3AF',
                                '&:hover': {
                                    backgroundColor: '#F3F4F6',
                                },
                            }}
                        />
                    ))}
                </Tabs>
            </div>

            {
                isLoading ?
                    <table className={`w-full text-sm text-left rtl:text-right text-gray-500 `}>
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-20">

                                {/* tabs concept point */}
                                {columnVisibility.supply_demand && (
                                    <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("supply_demand_text", sortState, setSortState, setSortedData, paginatedData)}>
                                        {`Supply/Demand`}
                                        {getArrowIcon("supply_demand_text")}
                                    </th>
                                )}

                                {columnVisibility.area && (
                                    <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("area_text", sortState, setSortState, setSortedData, paginatedData)}>
                                        {`Area`}
                                        {getArrowIcon("area_text")}
                                    </th>
                                )}

                                {columnVisibility.nomination_point && (
                                    <th scope="col" className={`${table_sort_header_style} min-w-[120px] `} onClick={() => handleSort("nomination_point_text", sortState, setSortState, setSortedData, paginatedData)}>
                                        {`Nomination Point`}
                                        {getArrowIcon("nomination_point_text")}
                                    </th>
                                )}

                                {/* tabs concept point */}
                                {columnVisibility.concept_id && (
                                    <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSortConcept(["3", "4", "5"], sortState, setSortState, setSortedData, paginatedData)}>
                                        {`Concept ID`}
                                        {getArrowIcon('3,4,5')}
                                    </th>
                                )}

                                {/* tabs concept point */}
                                {columnVisibility.unit && (
                                    <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("unit_text", sortState, setSortState, setSortedData, paginatedData)}>
                                        {`Unit`}
                                        {getArrowIcon("unit_text")}
                                    </th>
                                )}

                                {columnVisibility.type && (
                                    <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("type_text", sortState, setSortState, setSortedData, paginatedData)}>
                                        {`Type`}
                                        {getArrowIcon("type_text")}
                                    </th>
                                )}

                                {/* tabs concept point */}
                                {columnVisibility.entry_exit && (
                                    <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("entry_exit_text", sortState, setSortState, setSortedData, paginatedData)}>
                                        {`Entry/Exit`}
                                        {getArrowIcon("entry_exit_text")}
                                    </th>
                                )}

                                {columnVisibility.wi && (
                                    <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("wi_text", sortState, setSortState, setSortedData, paginatedData)}>
                                        {`WI`}
                                        {getArrowIcon("wi_text")}
                                    </th>
                                )}

                                {columnVisibility.hv && (
                                    <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("hv_text", sortState, setSortState, setSortedData, paginatedData)}>
                                        {`HV`}
                                        {getArrowIcon("hv_text")}
                                    </th>
                                )}

                                {columnVisibility.sg && (
                                    <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("sg_text", sortState, setSortState, setSortedData, paginatedData)}>
                                        {`SG`}
                                        {getArrowIcon("sg_text")}
                                    </th>
                                )}

                                {getVisibleHours().map(({ key, label, timeRange }, index) => {
                                    return (
                                        columnVisibility[key] && (
                                            <th
                                                key={key}
                                                scope="col"
                                                className={`${table_sort_header_style} min-w-[170px] text-center`}
                                                onClick={() => handleSort(label, sortState, setSortState, setSortedData, paginatedData)}
                                            >
                                                <div>{label}</div>
                                                <div>{timeRange}</div>
                                                {getArrowIcon(label)}
                                            </th>
                                        )
                                    )
                                })}


                                {columnVisibility.total && (
                                    <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("total", sortState, setSortState, setSortedData, tableData)}>
                                        {`Total`}
                                        {getArrowIcon("total")}
                                    </th>
                                )}

                                {columnVisibility.edit && (
                                    <th scope="col" className={`${table_header_style} text-center`} >
                                        {`Edit`}
                                    </th>
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {
                                sortedData.length > 0 && sortedData?.map((row: any, index: any) => {
                                    // paginatedData.length > 0 && paginatedData?.map((row: any, index: any) => {

                                    return (
                                        <tr
                                            key={row?.id}
                                            className={`${table_row_style}`}
                                        >

                                            {columnVisibility.supply_demand && (
                                                <td className="px-2 py-1 text-[#464255] ">{row?.data_temp2["1"] ? row?.data_temp2["1"] : ''}</td>
                                            )}

                                            {columnVisibility.concept_id && (
                                                // <td className="px-2 py-1 text-[#464255]">{row?.data_temp2["3"] ? row?.data_temp2["3"] : ''}</td>
                                                <td className="px-2 py-1 text-[#464255]">
                                                    {
                                                        row?.data_temp2["3"]?.trim() !== "" ? row?.data_temp2["3"] :
                                                            row?.data_temp2["4"]?.trim() !== "" ? row?.data_temp2["4"] :
                                                                row?.data_temp2["5"]?.trim() !== "" ? row?.data_temp2["5"] : ''
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

                                            {columnVisibility.nomination_point && (
                                                <td className="px-2 py-1 text-[#464255]">{row?.data_temp2["3"] ? row?.data_temp2["3"] : ''}</td>
                                            )}

                                            {columnVisibility.unit && (
                                                <td className="px-2 py-1 text-[#464255]">{row?.data_temp2["9"] ? row?.data_temp2["9"] : ''}</td>
                                            )}

                                            {columnVisibility.type && (
                                                <td className="px-2 py-1 text-[#464255]">{row?.data_temp2["6"] ? row?.data_temp2["6"] : ''}</td>
                                            )}

                                            {columnVisibility.entry_exit && (
                                                <td className="px-2 py-1  justify-center ">
                                                    {(() => {
                                                        const filter_entry_exit = entryExitMaster?.data?.find((item: any) => item.name === row?.data_temp2["10"]?.trim());
                                                        return filter_entry_exit ?
                                                            <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: filter_entry_exit?.color }}>{`${filter_entry_exit?.name}`}</div>
                                                            : ''
                                                    })()}
                                                </td>
                                            )}

                                            {columnVisibility.wi && (
                                                // <td className={`px-2 py-1 text-[#464255] text-right ${row?.data_temp2["11"] < row?.newObj?.["11"]?.min || row?.data_temp2["11"] > row?.newObj?.["11"]?.max ? 'text-[#ED1B24] ' : ''}`}>
                                                <td
                                                    className={`px-2 py-1 text-[#464255] text-right 
                                                            ${row?.data_temp2?.["11"] !== undefined &&
                                                            row?.newObj?.["11"]?.min !== undefined &&
                                                            row?.newObj?.["11"]?.max !== undefined &&
                                                            (row.data_temp2["11"] < row.newObj["11"].min || row.data_temp2["11"] > row.newObj["11"].max)
                                                            ? 'text-[#ED1B24]'
                                                            : ''
                                                        }
                                                    `}
                                                >

                                                    {
                                                        isEditing && rowEditing == row?.old_index ?
                                                            <NumericFormat
                                                                value={row?.data_temp2["11"] || ''}
                                                                onValueChange={(values) => {
                                                                    const { value } = values;
                                                                    setTempData((prev: any) => {
                                                                        const updatedEntry = prev.find((entry: any) => entry.old_index === row?.old_index);
                                                                        if (!updatedEntry) return prev; // If no match, return unchanged state
                                                                        return prev.map((entry: any) =>
                                                                            entry.old_index === row?.old_index ? { ...entry, data_temp2: { ...entry.data_temp2, ["11"]: value } } : entry
                                                                        );
                                                                    });
                                                                    setIsEditedInRow(true)
                                                                }}
                                                                thousandSeparator=","
                                                                decimalScale={3}
                                                                fixedDecimalScale={true}
                                                                allowNegative={false}
                                                                className={`${inputClass} `}
                                                                style={{ textAlign: "right", width: "100%" }}
                                                            />
                                                            :
                                                            row?.data_temp2["11"] ? formatNumberThreeDecimal(row?.data_temp2["11"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.hv && (
                                                <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["12"]) < row?.newObj?.["12"]?.min || parseFloat(row?.data_temp2["12"]) > row?.newObj?.["12"]?.max ? 'text-[#ED1B24]' : ''}`}>
                                                    {
                                                        isEditing && rowEditing == row?.old_index ?
                                                            <NumericFormat
                                                                value={row?.data_temp2["12"] || ''}
                                                                onValueChange={(values) => {
                                                                    const { value } = values;
                                                                    setTempData((prev: any) => {
                                                                        const updatedEntry = prev.find((entry: any) => entry.old_index === row?.old_index);
                                                                        if (!updatedEntry) return prev; // If no match, return unchanged state
                                                                        return prev.map((entry: any) =>
                                                                            entry.old_index === row?.old_index ? { ...entry, data_temp2: { ...entry.data_temp2, ["12"]: value } } : entry
                                                                        );
                                                                    });
                                                                    setIsEditedInRow(true)

                                                                }}
                                                                thousandSeparator=","
                                                                decimalScale={3}
                                                                fixedDecimalScale={true}
                                                                allowNegative={false}
                                                                className={`${inputClass} `}
                                                                style={{ textAlign: "right", width: "100%" }}
                                                            />
                                                            :
                                                            row?.data_temp2["12"] ? formatNumberThreeDecimal(row?.data_temp2["12"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.sg && (
                                                <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["13"]) > parseFloat(row?.newObj?.["13"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                    {
                                                        isEditing && rowEditing == row?.old_index ?
                                                            <NumericFormat
                                                                value={row?.data_temp2["13"] || ''}
                                                                onValueChange={(values) => {
                                                                    const { value } = values;
                                                                    setTempData((prev: any) => {
                                                                        const updatedEntry = prev.find((entry: any) => entry.old_index === row?.old_index);
                                                                        if (!updatedEntry) return prev; // If no match, return unchanged state
                                                                        return prev.map((entry: any) =>
                                                                            entry.old_index === row?.old_index ? { ...entry, data_temp2: { ...entry.data_temp2, ["13"]: value } } : entry
                                                                        );
                                                                    });
                                                                    setIsEditedInRow(true)
                                                                }}
                                                                thousandSeparator=","
                                                                decimalScale={3}
                                                                fixedDecimalScale={true}
                                                                allowNegative={false}
                                                                className={`${inputClass} `}
                                                                style={{ textAlign: "right", width: "100%" }}
                                                            />
                                                            :
                                                            row?.data_temp2["13"] ? formatNumberThreeDecimal(row?.data_temp2["13"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h1 && (tabIndex == 0 || tabIndex == 4) && (
                                                <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["14"]) > parseFloat(row?.newObj?.["14"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                    {
                                                        isEditing && rowEditing == row?.old_index ?
                                                            <NumericFormat
                                                                value={row?.data_temp2["14"] || ''}
                                                                onValueChange={(values) => {
                                                                    const { value } = values;
                                                                    setTempDataByTab(tabMain, row?.old_index, value, '14');
                                                                }}
                                                                thousandSeparator=","
                                                                decimalScale={3}
                                                                fixedDecimalScale={true}
                                                                allowNegative={false}
                                                                className={`${inputClass} `}
                                                                style={{ textAlign: "right", width: "100%" }}
                                                            />
                                                            :
                                                            row?.data_temp2["14"] ? formatNumberThreeDecimal(row?.data_temp2["14"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h2 && (tabIndex == 0 || tabIndex == 4) && (
                                                <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["15"]) > parseFloat(row?.newObj?.["15"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                    {
                                                        isEditing && rowEditing == row?.old_index ?
                                                            <NumericFormat
                                                                value={row?.data_temp2["15"] || ''}
                                                                onValueChange={(values) => {
                                                                    const { value } = values;
                                                                    setTempDataByTab(tabMain, row?.old_index, value, '15');
                                                                }}
                                                                thousandSeparator=","
                                                                decimalScale={3}
                                                                fixedDecimalScale={true}
                                                                allowNegative={false}
                                                                className={`${inputClass} `}
                                                                style={{ textAlign: "right", width: "100%" }}
                                                            />
                                                            :
                                                            row?.data_temp2["15"] ? formatNumberThreeDecimal(row?.data_temp2["15"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h3 && (tabIndex == 0 || tabIndex == 4) && (
                                                <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["16"]) > parseFloat(row?.newObj?.["16"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                    {
                                                        isEditing && rowEditing == row?.old_index ?
                                                            <NumericFormat
                                                                value={row?.data_temp2["16"] || ''}
                                                                onValueChange={(values) => {
                                                                    const { value } = values;
                                                                    setTempDataByTab(tabMain, row?.old_index, value, '16');
                                                                }}
                                                                thousandSeparator=","
                                                                decimalScale={3}
                                                                fixedDecimalScale={true}
                                                                allowNegative={false}
                                                                className={`${inputClass} `}
                                                                style={{ textAlign: "right", width: "100%" }}
                                                            />
                                                            :
                                                            row?.data_temp2["16"] ? formatNumberThreeDecimal(row?.data_temp2["16"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h4 && (tabIndex == 0 || tabIndex == 4) && (
                                                <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["17"]) > parseFloat(row?.newObj?.["17"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                    {
                                                        isEditing && rowEditing == row?.old_index ?
                                                            <NumericFormat
                                                                value={row?.data_temp2["17"] || ''}
                                                                onValueChange={(values) => {
                                                                    const { value } = values;
                                                                    setTempDataByTab(tabMain, row?.old_index, value, '17');
                                                                }}
                                                                thousandSeparator=","
                                                                decimalScale={3}
                                                                fixedDecimalScale={true}
                                                                allowNegative={false}
                                                                className={`${inputClass} `}
                                                                style={{ textAlign: "right", width: "100%" }}
                                                            />
                                                            :
                                                            row?.data_temp2["17"] ? formatNumberThreeDecimal(row?.data_temp2["17"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h5 && (tabIndex == 0 || tabIndex == 4) && (
                                                <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["18"]) > parseFloat(row?.newObj?.["18"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                    {
                                                        isEditing && rowEditing == row?.old_index ?
                                                            <NumericFormat
                                                                value={row?.data_temp2["18"] || ''}
                                                                onValueChange={(values) => {
                                                                    const { value } = values;
                                                                    setTempDataByTab(tabMain, row?.old_index, value, '18');
                                                                }}
                                                                thousandSeparator=","
                                                                decimalScale={3}
                                                                fixedDecimalScale={true}
                                                                allowNegative={false}
                                                                className={`${inputClass} `}
                                                                style={{ textAlign: "right", width: "100%" }}
                                                            />
                                                            :
                                                            row?.data_temp2["18"] ? formatNumberThreeDecimal(row?.data_temp2["18"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h6 && (tabIndex == 0 || tabIndex == 4) && (
                                                <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["19"]) > parseFloat(row?.newObj?.["19"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                    {
                                                        isEditing && rowEditing == row?.old_index ?
                                                            <NumericFormat
                                                                value={row?.data_temp2["19"] || ''}
                                                                onValueChange={(values) => {
                                                                    const { value } = values;
                                                                    setTempDataByTab(tabMain, row?.old_index, value, '19');
                                                                }}
                                                                thousandSeparator=","
                                                                decimalScale={3}
                                                                fixedDecimalScale={true}
                                                                allowNegative={false}
                                                                className={`${inputClass} `}
                                                                style={{ textAlign: "right", width: "100%" }}
                                                            />
                                                            :
                                                            row?.data_temp2["19"] ? formatNumberThreeDecimal(row?.data_temp2["19"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h7 && (tabIndex == 1 || tabIndex == 4) && (
                                                <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["20"]) > parseFloat(row?.newObj?.["20"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                    {
                                                        isEditing && rowEditing == row?.old_index ?
                                                            <NumericFormat
                                                                value={row?.data_temp2["20"] || ''}
                                                                onValueChange={(values) => {
                                                                    const { value } = values;
                                                                    setTempDataByTab(tabMain, row?.old_index, value, '20');
                                                                }}
                                                                thousandSeparator=","
                                                                decimalScale={3}
                                                                fixedDecimalScale={true}
                                                                allowNegative={false}
                                                                className={`${inputClass} `}
                                                                style={{ textAlign: "right", width: "100%" }}
                                                            />
                                                            :
                                                            row?.data_temp2["20"] ? formatNumberThreeDecimal(row?.data_temp2["20"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h8 && (tabIndex == 1 || tabIndex == 4) && (
                                                <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["21"]) > parseFloat(row?.newObj?.["21"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                    {
                                                        isEditing && rowEditing == row?.old_index ?
                                                            <NumericFormat
                                                                value={row?.data_temp2["21"] || ''}
                                                                onValueChange={(values) => {
                                                                    const { value } = values;
                                                                    setTempDataByTab(tabMain, row?.old_index, value, '21');
                                                                }}
                                                                thousandSeparator=","
                                                                decimalScale={3}
                                                                fixedDecimalScale={true}
                                                                allowNegative={false}
                                                                className={`${inputClass} `}
                                                                style={{ textAlign: "right", width: "100%" }}
                                                            />
                                                            :
                                                            row?.data_temp2["21"] ? formatNumberThreeDecimal(row?.data_temp2["21"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h9 && (tabIndex == 1 || tabIndex == 4) && (
                                                <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["22"]) > parseFloat(row?.newObj?.["22"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                    {
                                                        isEditing && rowEditing == row?.old_index ?
                                                            <NumericFormat
                                                                value={row?.data_temp2["22"] || ''}
                                                                onValueChange={(values) => {
                                                                    const { value } = values;
                                                                    setTempDataByTab(tabMain, row?.old_index, value, '22');
                                                                }}
                                                                thousandSeparator=","
                                                                decimalScale={3}
                                                                fixedDecimalScale={true}
                                                                allowNegative={false}
                                                                className={`${inputClass} `}
                                                                style={{ textAlign: "right", width: "100%" }}
                                                            />
                                                            :
                                                            row?.data_temp2["22"] ? formatNumberThreeDecimal(row?.data_temp2["22"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h10 && (tabIndex == 1 || tabIndex == 4) && (
                                                <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["23"]) > parseFloat(row?.newObj?.["23"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                    {
                                                        isEditing && rowEditing == row?.old_index ?
                                                            <NumericFormat
                                                                value={row?.data_temp2["23"] || ''}
                                                                onValueChange={(values) => {
                                                                    const { value } = values;
                                                                    setTempDataByTab(tabMain, row?.old_index, value, '23');
                                                                }}
                                                                thousandSeparator=","
                                                                decimalScale={3}
                                                                fixedDecimalScale={true}
                                                                allowNegative={false}
                                                                className={`${inputClass} `}
                                                                style={{ textAlign: "right", width: "100%" }}
                                                            />
                                                            :
                                                            row?.data_temp2["23"] ? formatNumberThreeDecimal(row?.data_temp2["23"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h11 && (tabIndex == 1 || tabIndex == 4) && (
                                                <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["24"]) > parseFloat(row?.newObj?.["24"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                    {
                                                        isEditing && rowEditing == row?.old_index ?
                                                            <NumericFormat
                                                                value={row?.data_temp2["24"] || ''}
                                                                onValueChange={(values) => {
                                                                    const { value } = values;
                                                                    setTempDataByTab(tabMain, row?.old_index, value, '24');
                                                                }}
                                                                thousandSeparator=","
                                                                decimalScale={3}
                                                                fixedDecimalScale={true}
                                                                allowNegative={false}
                                                                className={`${inputClass} `}
                                                                style={{ textAlign: "right", width: "100%" }}
                                                            />
                                                            :
                                                            row?.data_temp2["24"] ? formatNumberThreeDecimal(row?.data_temp2["24"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h12 && (tabIndex == 1 || tabIndex == 4) && (
                                                <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["25"]) > parseFloat(row?.newObj?.["25"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                    {
                                                        isEditing && rowEditing == row?.old_index ?
                                                            <NumericFormat
                                                                value={row?.data_temp2["25"] || ''}
                                                                onValueChange={(values) => {
                                                                    const { value } = values;
                                                                    setTempDataByTab(tabMain, row?.old_index, value, '25');
                                                                }}
                                                                thousandSeparator=","
                                                                decimalScale={3}
                                                                fixedDecimalScale={true}
                                                                allowNegative={false}
                                                                className={`${inputClass} `}
                                                                style={{ textAlign: "right", width: "100%" }}
                                                            />
                                                            :
                                                            row?.data_temp2["25"] ? formatNumberThreeDecimal(row?.data_temp2["25"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h13 && (tabIndex == 2 || tabIndex == 4) && (
                                                <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["26"]) > parseFloat(row?.newObj?.["26"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                    {
                                                        isEditing && rowEditing == row?.old_index ?
                                                            <NumericFormat
                                                                value={row?.data_temp2["26"] || ''}
                                                                onValueChange={(values) => {
                                                                    const { value } = values;
                                                                    setTempDataByTab(tabMain, row?.old_index, value, '26');
                                                                }}
                                                                thousandSeparator=","
                                                                decimalScale={3}
                                                                fixedDecimalScale={true}
                                                                allowNegative={false}
                                                                className={`${inputClass} `}
                                                                style={{ textAlign: "right", width: "100%" }}
                                                            />
                                                            :
                                                            row?.data_temp2["26"] ? formatNumberThreeDecimal(row?.data_temp2["26"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h14 && (tabIndex == 2 || tabIndex == 4) && (
                                                <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["27"]) > parseFloat(row?.newObj?.["27"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                    {
                                                        isEditing && rowEditing == row?.old_index ?
                                                            <NumericFormat
                                                                value={row?.data_temp2["27"] || ''}
                                                                onValueChange={(values) => {
                                                                    const { value } = values;
                                                                    setTempDataByTab(tabMain, row?.old_index, value, '27');
                                                                }}
                                                                thousandSeparator=","
                                                                decimalScale={3}
                                                                fixedDecimalScale={true}
                                                                allowNegative={false}
                                                                className={`${inputClass} `}
                                                                style={{ textAlign: "right", width: "100%" }}
                                                            />
                                                            :
                                                            row?.data_temp2["27"] ? formatNumberThreeDecimal(row?.data_temp2["27"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h15 && (tabIndex == 2 || tabIndex == 4) && (
                                                <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["28"]) > parseFloat(row?.newObj?.["28"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                    {
                                                        isEditing && rowEditing == row?.old_index ?
                                                            <NumericFormat
                                                                value={row?.data_temp2["28"] || ''}
                                                                onValueChange={(values) => {
                                                                    const { value } = values;
                                                                    setTempDataByTab(tabMain, row?.old_index, value, '28');
                                                                }}
                                                                thousandSeparator=","
                                                                decimalScale={3}
                                                                fixedDecimalScale={true}
                                                                allowNegative={false}
                                                                className={`${inputClass} `}
                                                                style={{ textAlign: "right", width: "100%" }}
                                                            />
                                                            :
                                                            row?.data_temp2["28"] ? formatNumberThreeDecimal(row?.data_temp2["28"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h16 && (tabIndex == 2 || tabIndex == 4) && (
                                                <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["29"]) > parseFloat(row?.newObj?.["29"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                    {
                                                        isEditing && rowEditing == row?.old_index ?
                                                            <NumericFormat
                                                                value={row?.data_temp2["29"] || ''}
                                                                onValueChange={(values) => {
                                                                    const { value } = values;
                                                                    setTempDataByTab(tabMain, row?.old_index, value, '29');
                                                                }}
                                                                thousandSeparator=","
                                                                decimalScale={3}
                                                                fixedDecimalScale={true}
                                                                allowNegative={false}
                                                                className={`${inputClass} `}
                                                                style={{ textAlign: "right", width: "100%" }}
                                                            />
                                                            :
                                                            row?.data_temp2["29"] ? formatNumberThreeDecimal(row?.data_temp2["29"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h17 && (tabIndex == 2 || tabIndex == 4) && (
                                                <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["30"]) > parseFloat(row?.newObj?.["30"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                    {
                                                        isEditing && rowEditing == row?.old_index ?
                                                            <NumericFormat
                                                                value={row?.data_temp2["30"] || ''}
                                                                onValueChange={(values) => {
                                                                    const { value } = values;
                                                                    setTempDataByTab(tabMain, row?.old_index, value, '30');
                                                                }}
                                                                thousandSeparator=","
                                                                decimalScale={3}
                                                                fixedDecimalScale={true}
                                                                allowNegative={false}
                                                                className={`${inputClass} `}
                                                                style={{ textAlign: "right", width: "100%" }}
                                                            />
                                                            :
                                                            row?.data_temp2["30"] ? formatNumberThreeDecimal(row?.data_temp2["30"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h18 && (tabIndex == 2 || tabIndex == 4) && (
                                                <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["31"]) > parseFloat(row?.newObj?.["31"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                    {
                                                        isEditing && rowEditing == row?.old_index ?
                                                            <NumericFormat
                                                                value={row?.data_temp2["31"] || ''}
                                                                onValueChange={(values) => {
                                                                    const { value } = values;
                                                                    setTempDataByTab(tabMain, row?.old_index, value, '31');
                                                                }}
                                                                thousandSeparator=","
                                                                decimalScale={3}
                                                                fixedDecimalScale={true}
                                                                allowNegative={false}
                                                                className={`${inputClass} `}
                                                                style={{ textAlign: "right", width: "100%" }}
                                                            />
                                                            :
                                                            row?.data_temp2["31"] ? formatNumberThreeDecimal(row?.data_temp2["31"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h19 && (tabIndex == 3 || tabIndex == 4) && (
                                                <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["32"]) > parseFloat(row?.newObj?.["32"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                    {
                                                        isEditing && rowEditing == row?.old_index ?
                                                            <NumericFormat
                                                                value={row?.data_temp2["32"] || ''}
                                                                onValueChange={(values) => {
                                                                    const { value } = values;
                                                                    setTempDataByTab(tabMain, row?.old_index, value, '32');
                                                                }}
                                                                thousandSeparator=","
                                                                decimalScale={3}
                                                                fixedDecimalScale={true}
                                                                allowNegative={false}
                                                                className={`${inputClass} `}
                                                                style={{ textAlign: "right", width: "100%" }}
                                                            />
                                                            :
                                                            row?.data_temp2["32"] ? formatNumberThreeDecimal(row?.data_temp2["32"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h20 && (tabIndex == 3 || tabIndex == 4) && (
                                                <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["33"]) > parseFloat(row?.newObj?.["33"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                    {
                                                        isEditing && rowEditing == row?.old_index ?
                                                            <NumericFormat
                                                                value={row?.data_temp2["33"] || ''}
                                                                onValueChange={(values) => {
                                                                    const { value } = values;
                                                                    setTempDataByTab(tabMain, row?.old_index, value, '33');
                                                                }}
                                                                thousandSeparator=","
                                                                decimalScale={3}
                                                                fixedDecimalScale={true}
                                                                allowNegative={false}
                                                                className={`${inputClass} `}
                                                                style={{ textAlign: "right", width: "100%" }}
                                                            />
                                                            :
                                                            row?.data_temp2["33"] ? formatNumberThreeDecimal(row?.data_temp2["33"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h21 && (tabIndex == 3 || tabIndex == 4) && (
                                                <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["34"]) > parseFloat(row?.newObj?.["34"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                    {
                                                        isEditing && rowEditing == row?.old_index ?
                                                            <NumericFormat
                                                                value={row?.data_temp2["34"] || ''}
                                                                onValueChange={(values) => {
                                                                    const { value } = values;
                                                                    setTempDataByTab(tabMain, row?.old_index, value, '34');
                                                                }}
                                                                thousandSeparator=","
                                                                decimalScale={3}
                                                                fixedDecimalScale={true}
                                                                allowNegative={false}
                                                                className={`${inputClass} `}
                                                                style={{ textAlign: "right", width: "100%" }}
                                                            />
                                                            :
                                                            row?.data_temp2["34"] ? formatNumberThreeDecimal(row?.data_temp2["34"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h22 && (tabIndex == 3 || tabIndex == 4) && (
                                                <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["35"]) > parseFloat(row?.newObj?.["35"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                    {
                                                        isEditing && rowEditing == row?.old_index ?
                                                            <NumericFormat
                                                                value={row?.data_temp2["35"] || ''}
                                                                onValueChange={(values) => {
                                                                    const { value } = values;
                                                                    setTempDataByTab(tabMain, row?.old_index, value, '35');
                                                                }}
                                                                thousandSeparator=","
                                                                decimalScale={3}
                                                                fixedDecimalScale={true}
                                                                allowNegative={false}
                                                                className={`${inputClass} `}
                                                                style={{ textAlign: "right", width: "100%" }}
                                                            />
                                                            :
                                                            row?.data_temp2["35"] ? formatNumberThreeDecimal(row?.data_temp2["35"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h23 && (tabIndex == 3 || tabIndex == 4) && (
                                                <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["36"]) > parseFloat(row?.newObj?.["36"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                    {
                                                        isEditing && rowEditing == row?.old_index ?
                                                            <NumericFormat
                                                                value={row?.data_temp2["36"] || ''}
                                                                onValueChange={(values) => {
                                                                    const { value } = values;
                                                                    setTempDataByTab(tabMain, row?.old_index, value, '36');
                                                                }}
                                                                thousandSeparator=","
                                                                decimalScale={3}
                                                                fixedDecimalScale={true}
                                                                allowNegative={false}
                                                                className={`${inputClass} `}
                                                                style={{ textAlign: "right", width: "100%" }}
                                                            />
                                                            :
                                                            row?.data_temp2["36"] ? formatNumberThreeDecimal(row?.data_temp2["36"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.h24 && (tabIndex == 3 || tabIndex == 4) && (
                                                <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["37"]) > parseFloat(row?.newObj?.["37"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                    {
                                                        isEditing && rowEditing == row?.old_index ?
                                                            <NumericFormat
                                                                value={row?.data_temp2["37"] || ''}
                                                                onValueChange={(values) => {
                                                                    const { value } = values;
                                                                    setTempDataByTab(tabMain, row?.old_index, value, '37');
                                                                }}
                                                                thousandSeparator=","
                                                                decimalScale={3}
                                                                fixedDecimalScale={true}
                                                                allowNegative={false}
                                                                className={`${inputClass} `}
                                                                style={{ textAlign: "right", width: "100%" }}
                                                            />
                                                            :
                                                            row?.data_temp2["37"] ? formatNumberThreeDecimal(row?.data_temp2["37"]) : ''
                                                    }
                                                </td>
                                            )}

                                            {columnVisibility.total && (
                                                <td className="px-2 py-1 text-[#464255] text-right font-semibold">{row?.data_temp2["38"] ? formatNumberThreeDecimal(row?.data_temp2["38"]) : ''}</td>
                                            )}

                                            {columnVisibility.edit && (
                                                isEditing && rowEditing == row?.old_index ? (
                                                    <td className="px-2 py-1 min-w-[140px]">
                                                        <div className="flex gap-2 w-full">

                                                            {/* if isEditedInRow == false then make this button disable */}
                                                            {/* <button
                                                                onClick={() => {
                                                                    handleSaveClick(row?.old_index)
                                                                    setIsSaveClick(true)
                                                                }}
                                                                className={`flex w-[130px] h-[33px] bg-[#17AC6B] text-white px-4 py-2 rounded-[8px] items-center justify-center`}
                                                            >
                                                                <div className="gap-2 flex">
                                                                    {'Save Draft'}
                                                                    <CheckOutlinedIcon sx={{ fontSize: 18, color: '#ffffff' }} />
                                                                </div>
                                                            </button> */}

                                                            <button
                                                                onClick={() => {
                                                                    handleSaveClick(row?.old_index);
                                                                    setIsSaveClick(true);
                                                                }}
                                                                disabled={!isEditedInRow} // Disable if isEditedInRow is false
                                                                className={`flex w-[130px] h-[33px] px-4 py-2 rounded-[8px] items-center justify-center
                                                                ${isEditedInRow ? "bg-[#17AC6B] text-white cursor-pointer" : "bg-gray-400 text-gray-200 cursor-not-allowed"}`}
                                                            >
                                                                <div className="gap-2 flex">
                                                                    {'Save Draft'}
                                                                    <CheckOutlinedIcon sx={{ fontSize: 18, color: '#ffffff' }} />
                                                                </div>
                                                            </button>



                                                            <button
                                                                // onClick={handleEditClick}
                                                                // onClick={handleCancelClick}
                                                                onClick={() => handleCancelClick(row?.old_index)}
                                                                className={`flex w-[130px] h-[33px] bg-[#ffffff] border border-[#646464]  text-[#464255] px-4 py-2 rounded-[8px] items-center justify-center`}
                                                            >
                                                                <div className="gap-2 flex">
                                                                    {'Cancel'}
                                                                    <CloseOutlinedIcon sx={{ fontSize: 18, color: '#464255' }} />
                                                                </div>
                                                            </button>
                                                        </div>
                                                    </td>
                                                ) : (
                                                    <td className="px-2 py-1 min-w-[140px]">
                                                        <div className="relative inline-flex justify-center items-center w-full">
                                                            {/* <ModeEditOutlinedIcon
                                                                onClick={() => handleEditClick(row?.old_index)}
                                                                className={`cursor-pointer border-[1px] rounded-[4px] `}
                                                                style={{
                                                                    fontSize: "18px",
                                                                    width: '22px',
                                                                    height: '22px',
                                                                    color: '#2B2A87',
                                                                    borderColor: '#DFE4EA'
                                                                }}
                                                            /> */}
                                                            <ModeEditOutlinedIcon
                                                                onClick={(!isAfterGasDay && !readOnly) ? () => handleEditClick(row?.old_index) : undefined}
                                                                className={`border-[1px] rounded-[4px] ${(isAfterGasDay || readOnly) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                                                style={{
                                                                    fontSize: "18px",
                                                                    width: '22px',
                                                                    height: '22px',
                                                                    color: '#2B2A87',
                                                                    borderColor: '#DFE4EA'
                                                                }}
                                                            />
                                                        </div>
                                                    </td>
                                                )
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
                // initialColumns={initialColumnsTabEntryExit}
                initialColumns={visibleColumns}
            // initialColumns={tabMain == 0 ? initialColumnsTabEntryExit : initialColumnsTabConceptPoint}
            />
        </div>

        <PaginationComponent
            totalItems={tabMain == 0 ? tempData?.length : tempDataConcept?.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
        />
    </>
    )
}

export default TableEachZone;