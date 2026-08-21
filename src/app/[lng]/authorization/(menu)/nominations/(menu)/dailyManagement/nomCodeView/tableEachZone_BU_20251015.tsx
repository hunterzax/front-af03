import { useEffect, useRef } from "react";
import React, { FC, useState } from 'react';
import TableSkeleton, { DefaultSkeleton } from '@/components/material_custom/DefaultSkeleton';
import { formatNumberThreeDecimal, getContrastTextColor } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort, handleSortConcept, handleSortHOnly } from "@/utils/sortTable";
import NodataTable from "@/components/other/nodataTable";
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ModeEditOutlinedIcon from '@mui/icons-material/ModeEditOutlined';
import { NumericFormat } from "react-number-format";
import { Tab, Tabs } from "@mui/material";
import { Tune } from "@mui/icons-material"
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import PaginationComponent from "@/components/other/globalPagination";
import { parseToNumber } from "@/utils/number";

const inputClass = "text-[14px] block p-2 h-[37px] w-full border-[1px] bg-white border-[#9CA3AF] outline-none bg-opacity-100 focus:border-[#00ADEF] hover:!p-2 focus:!p-2";

const TableEachZone: React.FC<any> = ({ tableData, isLoading, userPermission, zoneText, tempData, setTempData, tempDataConcept, setTempDataConcept, areaMaster, entryExitMaster, setIsEdited, tabEntry, tabConcept, isAfterGasDay, readOnly, nomVersionData }) => {
    const [sortedData, setSortedData] = useState<any>([]);
    const [tempDataOriginal, setTempDataOriginal] = useState<any>([]); // เอาไว้ set ตอน cancel
    const [tempDataOriginalConcept, setTempDataOriginalConcept] = useState<any>([]); // เอาไว้ set ตอน cancel
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [check, setCheck] = useState(false); // filter over val

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

        // เก็บข้อมูลไม่ให้เปลี่ยนตามต้นฉบับ
        const masterData = JSON.parse(JSON.stringify(filteredData));
        setTempDataOriginal(masterData);  // เก็บเป็น master (ห้ามเปลี่ยน)


        // DATA TAB CONCEPT POINT
        const filteredDataConcept = tableData?.filter(
            // (item: any) => item?.query_shipper_nomination_type_id !== 1
            // (item: any) => item?.query_shipper_nomination_type_id == 2 // 2 แสดงใน tab concept ไปก่อน
            (item: any) => item?.zone_text == zoneText && item?.query_shipper_nomination_type_id !== 1
        );

        const data_tab_concept = filteredDataConcept?.flat().map(({ data_temp2, ...rest }: any) => ({
            ...rest,
            ...data_temp2,
            data_temp2, // keep original data_temp intact
        }));

        // สร้างคีย์เพิ่มที่ root ของแต่ละ object ชื่อว่า concept_point_text โดยจับจาก 
        // ถ้ามี temp_data_concept.data_temp2["3"] ให้ใช้ตัวนี้ก่อน
        // ถ้ามี temp_data_concept.data_temp2["4"] ถ้าไม่มี 3 ให้ใช้ 4
        // ถ้ามี temp_data_concept.data_temp2["5"] ถ้าไม่มี 4 ให้ใช้ 5
        const withConceptPoint = filteredDataConcept?.map((row: any) => {
            const t3 = row?.data_temp2?.["3"]?.trim();
            const t4 = row?.data_temp2?.["4"]?.trim();
            const t5 = row?.data_temp2?.["5"]?.trim();

            const concept = t3 || t4 || t5 || null; // ถ้าทั้งหมดว่างให้เป็น null

            return { ...row, concept_point_text: concept };
        });

        // setTempDataConcept(filteredDataConcept)
        // setTempDataConcept(data_tab_concept)
        setTempDataConcept(withConceptPoint)

        // เก็บข้อมูลไม่ให้เปลี่ยนตามต้นฉบับ
        const masterDataTabConcept = JSON.parse(JSON.stringify(data_tab_concept));
        setTempDataOriginalConcept(masterDataTabConcept);  // เก็บเป็น master (ห้ามเปลี่ยน)


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

    // #region handleSaveClick
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

    // #region handleCancelClick
    const handleCancelClick = (rowId: any) => {

        if (tabMain == 0) {
            // setSortedData(tempData)
            setSortedData([...tempDataOriginal]); // เอาไว้ใช้ตอน cancel
        } else {

            const objectToArray = (input: Record<string | number, string> | null | undefined) => {
                if (!input || typeof input !== 'object') return [];

                return Object.entries(input).map(([key, value]) => ({
                    key: Number(key),
                    value: value ?? "" // ถ้า value เป็น undefined/null ให้เป็น ""
                }));
            };

            const arrayToObject = (arr: any[]): Record<number, any> => {
                return arr.reduce((obj, value, index) => {
                    obj[index] = value?.value;
                    return obj;
                }, {} as Record<number, any>);
            };
            const originalTempx: any = tempDataOriginalConcept?.find((item: any) => item?.old_index == rowId);
            const originalTemp: any = tempDataOriginalConcept

            const transArray = objectToArray(originalTempx?.data_temp2)

            let count: any = 0;
            let lastIDX: any = transArray?.length - 1;
            for (let index = 14; index < transArray?.length; index++) {
                count = count + 1
                if (index == lastIDX) {
                    transArray[index].value = originalTempx["total"];
                } else {
                    transArray[index].value = originalTempx["H" + count];
                }
            }

            originalTemp.find((item: any) => item?.old_index == rowId).data_temp2 = arrayToObject(transArray)
            setSortedData(originalTemp); // เอาไว้ใช้ตอน cancel
        }

        setIsEditing(!isEditing);
        setRowEditing(undefined)
        settk(!tk);
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
        // 0 = All Day
        // 1 = 1-6 Hr
        // 2 = 7-12 Hr
        // 3 = 13-18 Hr
        // 4 = 19-24 Hr
        setTabIndex(newValue);
    };

    const getVisibleHours = () => {
        switch (tabIndex) {
            case 0: return hours; // All hours
            case 1: return hours.slice(0, 6);  // H1 - H6
            case 2: return hours.slice(6, 12); // H7 - H12
            case 3: return hours.slice(12, 18); // H13 - H18
            case 4: return hours.slice(18, 24); // H19 - H24
            default: return [];
        }
    };

    useEffect(() => {
        getVisibleHours();
    }, [tabIndex])

    const [tabMain, setTabMain] = useState(0);
    const [tk, settk] = useState<boolean>(false);
    const handleChangeTabMain = (event: any, newValue: any) => {
        setTabMain(newValue);
        settk(!tk);
        setIsEditing(false)
        setRowEditing(undefined);
        // handleEditClick(undefined);
    };

    // ############### COLUMN SHOW/HIDE ENTRY / EXIT ###############
    // if tabIndex = 0 show all
    const initialColumnsTabEntryExit: any = [
        { key: 'supply_demand', label: 'Supply/Demand', visible: true }, // always show
        { key: 'area', label: 'Area', visible: true }, // always show
        { key: 'nomination_point', label: 'Nomination Point', visible: true }, // always show

        { key: 'concept_id', label: 'Concept ID', visible: true },

        { key: 'unit', label: 'Unit', visible: true }, // always show
        { key: 'type', label: 'Type', visible: true }, // always show
        { key: 'entry_exit', label: 'Entry/Exit', visible: true }, // always show
        { key: 'wi', label: 'WI', visible: true }, // always show
        { key: 'hv', label: 'HV', visible: true }, // always show
        { key: 'sg', label: 'SG', visible: true }, // always show

        { key: 'h1', label: 'H1 00:00 - 01:00', visible: true }, // show if tabIndex = 1
        { key: 'h2', label: 'H2 01:01 - 02:00', visible: true }, // show if tabIndex = 1
        { key: 'h3', label: 'H3 02:01 - 03:00', visible: true }, // show if tabIndex = 1
        { key: 'h4', label: 'H4 03:01 - 04:00', visible: true }, // show if tabIndex = 1
        { key: 'h5', label: 'H5 04:01 - 05:00', visible: true }, // show if tabIndex = 1
        { key: 'h6', label: 'H6 05:01 - 06:00', visible: true }, // show if tabIndex = 1

        { key: 'h7', label: 'H7 06:01 - 07:00', visible: true }, // show if tabIndex = 2
        { key: 'h8', label: 'H8 07:01 - 08:00', visible: true }, // show if tabIndex = 2
        { key: 'h9', label: 'H9 08:01 - 09:00', visible: true }, // show if tabIndex = 2
        { key: 'h10', label: 'H10 09:01 - 10:00', visible: true }, // show if tabIndex = 2
        { key: 'h11', label: 'H11 10:01 - 11:00', visible: true }, // show if tabIndex = 2
        { key: 'h12', label: 'H12 11:01 - 12:00', visible: true }, // show if tabIndex = 2

        { key: 'h13', label: 'H13 12:01 - 13:00', visible: true }, // show if tabIndex = 3
        { key: 'h14', label: 'H14 13:01 - 14:00', visible: true }, // show if tabIndex = 3
        { key: 'h15', label: 'H15 14:01 - 15:00', visible: true }, // show if tabIndex = 3
        { key: 'h16', label: 'H16 15:01 - 16:00', visible: true }, // show if tabIndex = 3
        { key: 'h17', label: 'H17 16:01 - 17:00', visible: true }, // show if tabIndex = 3
        { key: 'h18', label: 'H18 17:01 - 18:00', visible: true }, // show if tabIndex = 3

        { key: 'h19', label: 'H19 18:01 - 19:00', visible: true }, // show if tabIndex = 4
        { key: 'h20', label: 'H20 19:01 - 20:00', visible: true }, // show if tabIndex = 4
        { key: 'h21', label: 'H21 20:01 - 21:00', visible: true }, // show if tabIndex = 4
        { key: 'h22', label: 'H22 21:01 - 22:00', visible: true }, // show if tabIndex = 4
        { key: 'h23', label: 'H23 22:01 - 23:00', visible: true }, // show if tabIndex = 4
        { key: 'h24', label: 'H24 23:01 - 24:00', visible: true }, // show if tabIndex = 4
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
            const alwaysVisibleKeys = tabMain == 0 ? ["supply_demand", "area", "nomination_point", "unit", "type", "entry_exit", "wi", "hv", "sg", "total", "edit"]
                : ["supply_demand", "concept_id", "unit", "entry_exit"]

            if (alwaysVisibleKeys.includes(col.key)) {
                return true;
            }

            if (tabIndex === 0) { // All day
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
    const visibleColumns = filterColumnsByTabIndex(tabIndex);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    // key ที่จะเอาออก tab concept point
    const hiddenKeysWhenTab1 = [
        "area",
        "nomination_point",
        "type",
        "wi",
        "hv",
        "sg"
    ];

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
            setPaginatedData(sortedData?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        }
    }, [sortedData, currentPage, itemsPerPage])

    useEffect(() => {
        // filterSortDataOverVal ฟังก์ชั่นกรองเอาข้อมูลจาก sort_data ตามเงื่อนไขต่อไปนี้

        // condition
        // 1. row.data_temp2["11"] < row.newObj["11"].min || row.data_temp2["11"] > row.newObj["11"].max                                         ---> column WI
        // 2. parseFloat(row?.data_temp2["12"]) < row?.newObj?.["12"]?.min || parseFloat(row?.data_temp2["12"]) > row?.newObj?.["12"]?.max       ---> column HV
        // 3. parseFloat(row?.data_temp2["13"]) > parseFloat(row?.newObj?.["13"]?.valueBook                                                      ---> column SG
        // 4. parseFloat(row?.data_temp2["14"]) > parseFloat(row?.newObj?.["14"]?.valueBook                                                      ---> column H1
        // 5. parseFloat(row?.data_temp2["15"]) > parseFloat(row?.newObj?.["15"]?.valueBook                                                      ---> column H2
        // ...
        // 27. parseFloat(row?.data_temp2["37"]) > parseFloat(row?.newObj?.["37"]?.valueBook                                                     ---> column H24

        if (check) {
            const res_x = filterSortDataOverVal(sortedData)
            setSortedData(res_x)
        } else {
            if (tabMain == 0) {
                setSortedData(tempData)
            } else {
                setSortedData(tempDataConcept)
            }
        }

    }, [check])


    // Nom Detail ต้องการเพิ่ม Filter or Checkbox สำหรับกรองเฉพาะรายการสีแดง https://app.clickup.com/t/86etzcgt4
    const filterSortDataOverVal = (sort_data: any) => {
        return sort_data.filter((row: any) => {
            const dt = row.data_temp2;
            const no = row.newObj;

            // 1. WI: เช็คว่าค่าอยู่นอกช่วง min-max
            const wi = parseFloat(dt["11"]);
            const wiMin = parseFloat(no?.["11"]?.min);
            const wiMax = parseFloat(no?.["11"]?.max);
            const wiInvalid = wi < wiMin || wi > wiMax;

            // 2. HV: เช็คว่าอยู่นอกช่วง min-max
            const hv = parseFloat(dt["12"]);
            const hvMin = parseFloat(no?.["12"]?.min);
            const hvMax = parseFloat(no?.["12"]?.max);
            const hvInvalid = hv < hvMin || hv > hvMax;

            // 3. SG: มากกว่า valueBook
            const sg = parseFloat(dt["13"]);
            const sgBook = parseFloat(no?.["13"]?.valueBook || "0");
            const sgInvalid = sg > sgBook;

            // 4-27: H1 ถึง H24 (index 14 ถึง 37)
            const hInvalid = Object.keys(dt)
                .filter((key) => {
                    const index = parseInt(key);
                    return index >= 14 && index <= 37;
                })
                .some((key) => {
                    const val = parseFloat(dt[key]);
                    const book = parseFloat(no?.[key]?.valueBook);
                    return val > book;
                });

            return wiInvalid || hvInvalid || sgInvalid || hInvalid;
        });
    };

    const handleFilterOverVal = () => {
        setCheck(!check)
    }

    return (<>
        {/* h-[calc(100vh-340px)] */}
        {/* <div className={`relative h-[calc(100vh-180px)] overflow-y-auto block  rounded-t-md z-1`}> */}
        <div className={`relative h-[calc(100vh-180px)] block rounded-t-md z-1`}>

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

            <div className="flex items-center space-x-4 pb-4">
                <div onClick={handleTogglePopover}>
                    <Tune
                        className="cursor-pointer rounded-lg"
                        style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                    />
                </div>

                <div className="flex gap-2 text-[#58585A] align-middle justify-center items-center">
                    <input
                        type="checkbox"
                        checked={check}
                        // disabled={row.query_shipper_nomination_status_id !== 1}
                        onChange={() => handleFilterOverVal()}
                        // onChange={() => postPublicationCenter(row)}
                        className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1] disabled:opacity-100 disabled:cursor-not-allowed "
                    />
                    {`Over Value`}
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
                    <div className="h-[calc(100vh-320px)] overflow-y-auto">
                        <table className={`w-full text-sm text-left rtl:text-right  text-gray-500 `}>
                            <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                                <tr className="h-20">

                                    {/* tabs concept point */}
                                    {columnVisibility.supply_demand && (
                                        // <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("supply_demand_text", sortState, setSortState, setSortedData, paginatedData)}>
                                        <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("supply_demand_text", sortState, setSortState, setSortedData, tabMain == 0 ? tempData : tempDataConcept)}>
                                            {`Supply/Demand`}
                                            {getArrowIcon("supply_demand_text")}
                                        </th>
                                    )}

                                    {columnVisibility.area && (
                                        // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("area_text", sortState, setSortState, setSortedData, paginatedData)}>
                                        <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("area_text", sortState, setSortState, setSortedData, tabMain == 0 ? tempData : tempDataConcept)}>
                                            {`Area`}
                                            {getArrowIcon("area_text")}
                                        </th>
                                    )}

                                    {columnVisibility.nomination_point && (
                                        // <th scope="col" className={`${table_sort_header_style} min-w-[120px] `} onClick={() => handleSort("nomination_point_text", sortState, setSortState, setSortedData, paginatedData)}>
                                        <th scope="col" className={`${table_sort_header_style} min-w-[120px] `} onClick={() => handleSort("nomination_point_text", sortState, setSortState, setSortedData, tabMain == 0 ? tempData : tempDataConcept)}>
                                            {`Nomination Point`}
                                            {getArrowIcon("nomination_point_text")}
                                        </th>
                                    )}

                                    {/* tabs concept point */}
                                    {columnVisibility.concept_id && (
                                        // <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSortConcept(["3", "4", "5"], sortState, setSortState, setSortedData, paginatedData)}>
                                        <th scope="col"
                                            className={`${table_sort_header_style} min-w-[120px]`}
                                            // onClick={() => handleSortConcept(["3", "4", "5"], sortState, setSortState, setSortedData, tabMain == 0 ? tempData : tempDataConcept)}
                                            onClick={() => handleSort("concept_point_text", sortState, setSortState, setSortedData, tabMain == 0 ? tempData : tempDataConcept)}
                                        >
                                            {`Concept ID`}
                                            {/* {getArrowIcon('3,4,5')} */}
                                            {getArrowIcon("concept_point_text")}

                                        </th>
                                    )}

                                    {/* tabs concept point */}
                                    {columnVisibility.unit && (
                                        // <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("unit_text", sortState, setSortState, setSortedData, paginatedData)}>
                                        <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("unit_text", sortState, setSortState, setSortedData, tabMain == 0 ? tempData : tempDataConcept)}>
                                            {`Unit`}
                                            {getArrowIcon("unit_text")}
                                        </th>
                                    )}

                                    {columnVisibility.type && (
                                        // <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("type_text", sortState, setSortState, setSortedData, paginatedData)}>
                                        <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("type_text", sortState, setSortState, setSortedData, tabMain == 0 ? tempData : tempDataConcept)}>
                                            {`Type`}
                                            {getArrowIcon("type_text")}
                                        </th>
                                    )}

                                    {/* tabs concept point */}
                                    {columnVisibility.entry_exit && (
                                        // <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("entry_exit_text", sortState, setSortState, setSortedData, paginatedData)}>
                                        <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("entry_exit_text", sortState, setSortState, setSortedData, tabMain == 0 ? tempData : tempDataConcept)}>
                                            {`Entry/Exit`}
                                            {getArrowIcon("entry_exit_text")}
                                        </th>
                                    )}

                                    {columnVisibility.wi && (
                                        // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("wi_text", sortState, setSortState, setSortedData, paginatedData)}>
                                        <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("wi_text", sortState, setSortState, setSortedData, tabMain == 0 ? tempData : tempDataConcept)}>
                                            {`WI`}
                                            {getArrowIcon("wi_text")}
                                        </th>
                                    )}

                                    {columnVisibility.hv && (
                                        // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("hv_text", sortState, setSortState, setSortedData, paginatedData)}>
                                        <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("hv_text", sortState, setSortState, setSortedData, tabMain == 0 ? tempData : tempDataConcept)}>
                                            {`HV`}
                                            {getArrowIcon("hv_text")}
                                        </th>
                                    )}

                                    {columnVisibility.sg && (
                                        // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("sg_text", sortState, setSortState, setSortedData, paginatedData)}>
                                        <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("sg_text", sortState, setSortState, setSortedData, tabMain == 0 ? tempData : tempDataConcept)}>
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
                                                    // onClick={() => handleSort(label, sortState, setSortState, setSortedData, paginatedData)}
                                                    // onClick={() => handleSortHOnly(key?.toUpperCase(), sortState, setSortState, setSortedData, paginatedData)}
                                                    onClick={() => handleSortHOnly(key?.toUpperCase(), sortState, setSortState, setSortedData, tabMain == 0 ? tempData : tempDataConcept)}
                                                >
                                                    <div>{label}</div>
                                                    <div>{timeRange}</div>
                                                    {getArrowIcon(label)}
                                                </th>
                                            )
                                        )
                                    })}


                                    {columnVisibility.total && (
                                        // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("total", sortState, setSortState, setSortedData, tableData)}>
                                        // <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("total", sortState, setSortState, setSortedData, paginatedData)}>
                                        <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("total", sortState, setSortState, setSortedData, tabMain == 0 ? tempData : tempDataConcept)}>
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

                            {/* เพิ่มเงื่อนไขถ้า tabMain == 1 ให้ใช้ paginatedData ในการ map แทน sortedData */}
                            <tbody>

                                {
                                    // sortedData.length > 0 && sortedData?.map((row: any, index: any) => {
                                    paginatedData.length > 0 && paginatedData?.map((row: any, index: any) => {
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
                                                                // row?.data_temp2["11"] ? formatNumberThreeDecimal(row?.data_temp2["11"]) : ''
                                                                row?.data_temp2?.["11"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["11"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["11"].toString().trim().replace(/,/g, ""))) : ""
                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.hv && (
                                                    <td
                                                        // className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["12"]) < row?.newObj?.["12"]?.min || parseFloat(row?.data_temp2["12"]) > row?.newObj?.["12"]?.max ? 'text-[#ED1B24]' : ''}`}
                                                        className={`px-2 py-1 text-[#464255] text-right ${row?.newObj?.["12"]?.min != null && row?.newObj?.["12"]?.max != null &&
                                                            (parseFloat(row?.data_temp2?.["12"]) < row?.newObj?.["12"]?.min ||
                                                                parseFloat(row?.data_temp2?.["12"]) > row?.newObj?.["12"]?.max)
                                                            ? 'text-[#ED1B24]'
                                                            : ''
                                                            }`}
                                                    >
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
                                                                // row?.data_temp2["12"] ? formatNumberThreeDecimal(row?.data_temp2["12"]) : ''
                                                                row?.data_temp2?.["12"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["12"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["12"].toString().trim().replace(/,/g, ""))) : ""
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
                                                                // row?.data_temp2["13"] ? formatNumberThreeDecimal(row?.data_temp2["13"]) : ''
                                                                row?.data_temp2?.["13"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["13"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["13"].toString().trim().replace(/,/g, ""))) : ""

                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.h1 && (tabIndex == 1 || tabIndex == 0) && (
                                                    <td
                                                        // className={`px-2 py-1 text-[#464255] text-right ${(parseToNumber(row?.data_temp2["14"]) ?? 0) > (parseToNumber(row?.newObj?.["14"]?.valueBook) ?? 0) ? 'text-[#ED1B24]' : ''}`}
                                                        className={`px-2 py-1 text-[#464255] text-right 
                                                        ${tabMain === 1
                                                                ? 'text-[#464255]'
                                                                : ((parseToNumber(row?.data_temp2?.['14']) ?? 0) > (parseToNumber(row?.newObj?.['14']?.valueBook) ?? 0)) ? 'text-[#ED1B24]' : ''
                                                            }
                                                    `}
                                                    >
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
                                                                // row?.data_temp2["14"] ? formatNumberThreeDecimal(row?.data_temp2["14"]) : ''
                                                                row?.data_temp2?.["14"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["14"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["14"].toString().trim().replace(/,/g, ""))) : ""
                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.h2 && (tabIndex == 1 || tabIndex == 0) && (
                                                    <td
                                                        // className={`px-2 py-1 text-[#464255] text-right ${(parseToNumber(row?.data_temp2["15"]) ?? 0) > (parseToNumber(row?.newObj?.["15"]?.valueBook) ?? 0) ? 'text-[#ED1B24]' : ''}`}
                                                        className={`px-2 py-1 text-[#464255] text-right 
                                                        ${tabMain === 1
                                                                ? 'text-[#464255]'
                                                                : ((parseToNumber(row?.data_temp2?.['15']) ?? 0) > (parseToNumber(row?.newObj?.['15']?.valueBook) ?? 0)) ? 'text-[#ED1B24]' : ''
                                                            }
                                                    `}
                                                    >
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
                                                                // row?.data_temp2["15"] ? formatNumberThreeDecimal(row?.data_temp2["15"]) : ''
                                                                row?.data_temp2?.["15"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["15"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["15"].toString().trim().replace(/,/g, ""))) : ""
                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.h3 && (tabIndex == 1 || tabIndex == 0) && (
                                                    <td
                                                        // className={`px-2 py-1 text-[#464255] text-right ${(parseToNumber(row?.data_temp2["16"]) ?? 0) > (parseToNumber(row?.newObj?.["16"]?.valueBook) ?? 0) ? 'text-[#ED1B24]' : ''}`}
                                                        className={`px-2 py-1 text-[#464255] text-right 
                                                        ${tabMain === 1
                                                                ? 'text-[#464255]'
                                                                : ((parseToNumber(row?.data_temp2?.['16']) ?? 0) > (parseToNumber(row?.newObj?.['16']?.valueBook) ?? 0)) ? 'text-[#ED1B24]' : ''
                                                            }
                                                    `}
                                                    >
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
                                                                // row?.data_temp2["16"] ? formatNumberThreeDecimal(row?.data_temp2["16"]) : ''
                                                                row?.data_temp2?.["16"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["16"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["16"].toString().trim().replace(/,/g, ""))) : ""

                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.h4 && (tabIndex == 1 || tabIndex == 0) && (
                                                    <td
                                                        // className={`px-2 py-1 text-[#464255] text-right ${(parseToNumber(row?.data_temp2["17"]) ?? 0) > (parseToNumber(row?.newObj?.["17"]?.valueBook) ?? 0) ? 'text-[#ED1B24]' : ''}`}
                                                        className={`px-2 py-1 text-[#464255] text-right 
                                                        ${tabMain === 1
                                                                ? 'text-[#464255]'
                                                                : ((parseToNumber(row?.data_temp2?.['17']) ?? 0) > (parseToNumber(row?.newObj?.['17']?.valueBook) ?? 0)) ? 'text-[#ED1B24]' : ''
                                                            }
                                                    `}
                                                    >
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
                                                                // row?.data_temp2["17"] ? formatNumberThreeDecimal(row?.data_temp2["17"]) : ''
                                                                row?.data_temp2?.["17"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["17"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["17"].toString().trim().replace(/,/g, ""))) : ""

                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.h5 && (tabIndex == 1 || tabIndex == 0) && (
                                                    <td
                                                        // className={`px-2 py-1 text-[#464255] text-right ${(parseToNumber(row?.data_temp2["18"]) ?? 0) > (parseToNumber(row?.newObj?.["18"]?.valueBook) ?? 0) ? 'text-[#ED1B24]' : ''}`}
                                                        className={`px-2 py-1 text-[#464255] text-right 
                                                        ${tabMain === 1
                                                                ? 'text-[#464255]'
                                                                : ((parseToNumber(row?.data_temp2?.['18']) ?? 0) > (parseToNumber(row?.newObj?.['18']?.valueBook) ?? 0)) ? 'text-[#ED1B24]' : ''
                                                            }
                                                    `}
                                                    >
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
                                                                // row?.data_temp2["18"] ? formatNumberThreeDecimal(row?.data_temp2["18"]) : ''
                                                                row?.data_temp2?.["18"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["18"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["18"].toString().trim().replace(/,/g, ""))) : ""
                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.h6 && (tabIndex == 1 || tabIndex == 0) && (
                                                    <td
                                                        // className={`px-2 py-1 text-[#464255] text-right ${(parseToNumber(row?.data_temp2["19"]) ?? 0) > (parseToNumber(row?.newObj?.["19"]?.valueBook) ?? 0) ? 'text-[#ED1B24]' : ''}`}
                                                        className={`px-2 py-1 text-[#464255] text-right 
                                                        ${tabMain === 1
                                                                ? 'text-[#464255]'
                                                                : ((parseToNumber(row?.data_temp2?.['19']) ?? 0) > (parseToNumber(row?.newObj?.['19']?.valueBook) ?? 0)) ? 'text-[#ED1B24]' : ''
                                                            }
                                                    `}
                                                    >
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
                                                                // row?.data_temp2["19"] ? formatNumberThreeDecimal(row?.data_temp2["19"]) : ''
                                                                row?.data_temp2?.["19"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["19"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["19"].toString().trim().replace(/,/g, ""))) : ""

                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.h7 && (tabIndex == 2 || tabIndex == 0) && (
                                                    <td
                                                        // className={`px-2 py-1 text-[#464255] text-right ${(parseToNumber(row?.data_temp2["20"]) ?? 0) > (parseToNumber(row?.newObj?.["20"]?.valueBook) ?? 0) ? 'text-[#ED1B24]' : ''}`}
                                                        className={`px-2 py-1 text-[#464255] text-right 
                                                        ${tabMain === 1
                                                                ? 'text-[#464255]'
                                                                : ((parseToNumber(row?.data_temp2?.['20']) ?? 0) > (parseToNumber(row?.newObj?.['20']?.valueBook) ?? 0)) ? 'text-[#ED1B24]' : ''
                                                            }
                                                    `}
                                                    >
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
                                                                // row?.data_temp2["20"] ? formatNumberThreeDecimal(row?.data_temp2["20"]) : ''
                                                                row?.data_temp2?.["20"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["20"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["20"].toString().trim().replace(/,/g, ""))) : ""

                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.h8 && (tabIndex == 2 || tabIndex == 0) && (
                                                    <td
                                                        // className={`px-2 py-1 text-[#464255] text-right ${(parseToNumber(row?.data_temp2["21"]) ?? 0) > (parseToNumber(row?.newObj?.["21"]?.valueBook) ?? 0) ? 'text-[#ED1B24]' : ''}`}
                                                        className={`px-2 py-1 text-[#464255] text-right 
                                                        ${tabMain === 1
                                                                ? 'text-[#464255]'
                                                                : ((parseToNumber(row?.data_temp2?.['21']) ?? 0) > (parseToNumber(row?.newObj?.['21']?.valueBook) ?? 0)) ? 'text-[#ED1B24]' : ''
                                                            }
                                                    `}
                                                    >
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
                                                                // row?.data_temp2["21"] ? formatNumberThreeDecimal(row?.data_temp2["21"]) : ''
                                                                row?.data_temp2?.["21"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["21"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["21"].toString().trim().replace(/,/g, ""))) : ""

                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.h9 && (tabIndex == 2 || tabIndex == 0) && (
                                                    <td
                                                        // className={`px-2 py-1 text-[#464255] text-right ${(parseToNumber(row?.data_temp2["22"]) ?? 0) > (parseToNumber(row?.newObj?.["22"]?.valueBook) ?? 0) ? 'text-[#ED1B24]' : ''}`}
                                                        className={`px-2 py-1 text-[#464255] text-right 
                                                        ${tabMain === 1
                                                                ? 'text-[#464255]'
                                                                : ((parseToNumber(row?.data_temp2?.['22']) ?? 0) > (parseToNumber(row?.newObj?.['22']?.valueBook) ?? 0)) ? 'text-[#ED1B24]' : ''
                                                            }
                                                    `}
                                                    >
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
                                                                // row?.data_temp2["22"] ? formatNumberThreeDecimal(row?.data_temp2["22"]) : ''
                                                                row?.data_temp2?.["22"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["22"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["22"].toString().trim().replace(/,/g, ""))) : ""

                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.h10 && (tabIndex == 2 || tabIndex == 0) && (
                                                    <td
                                                        // className={`px-2 py-1 text-[#464255] text-right ${(parseToNumber(row?.data_temp2["23"]) ?? 0) > (parseToNumber(row?.newObj?.["23"]?.valueBook) ?? 0) ? 'text-[#ED1B24]' : ''}`}
                                                        className={`px-2 py-1 text-[#464255] text-right 
                                                        ${tabMain === 1
                                                                ? 'text-[#464255]'
                                                                : ((parseToNumber(row?.data_temp2?.['23']) ?? 0) > (parseToNumber(row?.newObj?.['23']?.valueBook) ?? 0)) ? 'text-[#ED1B24]' : ''
                                                            }
                                                    `}
                                                    >
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
                                                                // row?.data_temp2["23"] ? formatNumberThreeDecimal(row?.data_temp2["23"]) : ''
                                                                row?.data_temp2?.["23"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["23"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["23"].toString().trim().replace(/,/g, ""))) : ""

                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.h11 && (tabIndex == 2 || tabIndex == 0) && (
                                                    <td
                                                        // className={`px-2 py-1 text-[#464255] text-right ${(parseToNumber(row?.data_temp2["24"]) ?? 0) > (parseToNumber(row?.newObj?.["24"]?.valueBook) ?? 0) ? 'text-[#ED1B24]' : ''}`}
                                                        className={`px-2 py-1 text-[#464255] text-right 
                                                        ${tabMain === 1
                                                                ? 'text-[#464255]'
                                                                : ((parseToNumber(row?.data_temp2?.['24']) ?? 0) > (parseToNumber(row?.newObj?.['24']?.valueBook) ?? 0)) ? 'text-[#ED1B24]' : ''
                                                            }
                                                    `}
                                                    >
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
                                                                // row?.data_temp2["24"] ? formatNumberThreeDecimal(row?.data_temp2["24"]) : ''
                                                                row?.data_temp2?.["24"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["24"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["24"].toString().trim().replace(/,/g, ""))) : ""

                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.h12 && (tabIndex == 2 || tabIndex == 0) && (
                                                    <td
                                                        // className={`px-2 py-1 text-[#464255] text-right ${(parseToNumber(row?.data_temp2["25"]) ?? 0) > (parseToNumber(row?.newObj?.["25"]?.valueBook) ?? 0) ? 'text-[#ED1B24]' : ''}`}
                                                        className={`px-2 py-1 text-[#464255] text-right 
                                                        ${tabMain === 1
                                                                ? 'text-[#464255]'
                                                                : ((parseToNumber(row?.data_temp2?.['25']) ?? 0) > (parseToNumber(row?.newObj?.['25']?.valueBook) ?? 0)) ? 'text-[#ED1B24]' : ''
                                                            }
                                                    `}
                                                    >
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
                                                                // row?.data_temp2["25"] ? formatNumberThreeDecimal(row?.data_temp2["25"]) : ''
                                                                row?.data_temp2?.["25"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["25"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["25"].toString().trim().replace(/,/g, ""))) : ""

                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.h13 && (tabIndex == 3 || tabIndex == 0) && (
                                                    <td
                                                        // className={`px-2 py-1 text-[#464255] text-right ${(parseToNumber(row?.data_temp2["26"]) ?? 0) > (parseToNumber(row?.newObj?.["26"]?.valueBook) ?? 0) ? 'text-[#ED1B24]' : ''}`}
                                                        className={`px-2 py-1 text-[#464255] text-right 
                                                        ${tabMain === 1
                                                                ? 'text-[#464255]'
                                                                : ((parseToNumber(row?.data_temp2?.['26']) ?? 0) > (parseToNumber(row?.newObj?.['26']?.valueBook) ?? 0)) ? 'text-[#ED1B24]' : ''
                                                            }
                                                    `}
                                                    >
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
                                                                // row?.data_temp2["26"] ? formatNumberThreeDecimal(row?.data_temp2["26"]) : ''
                                                                row?.data_temp2?.["26"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["26"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["26"].toString().trim().replace(/,/g, ""))) : ""

                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.h14 && (tabIndex == 3 || tabIndex == 0) && (
                                                    <td
                                                        // className={`px-2 py-1 text-[#464255] text-right ${(parseToNumber(row?.data_temp2["27"]) ?? 0) > (parseToNumber(row?.newObj?.["27"]?.valueBook) ?? 0) ? 'text-[#ED1B24]' : ''}`}
                                                        className={`px-2 py-1 text-[#464255] text-right 
                                                        ${tabMain === 1
                                                                ? 'text-[#464255]'
                                                                : ((parseToNumber(row?.data_temp2?.['27']) ?? 0) > (parseToNumber(row?.newObj?.['27']?.valueBook) ?? 0)) ? 'text-[#ED1B24]' : ''
                                                            }
                                                    `}
                                                    >
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
                                                                // row?.data_temp2["27"] ? formatNumberThreeDecimal(row?.data_temp2["27"]) : ''
                                                                row?.data_temp2?.["27"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["27"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["27"].toString().trim().replace(/,/g, ""))) : ""

                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.h15 && (tabIndex == 3 || tabIndex == 0) && (
                                                    <td
                                                        // className={`px-2 py-1 text-[#464255] text-right ${(parseToNumber(row?.data_temp2["28"]) ?? 0) > (parseToNumber(row?.newObj?.["28"]?.valueBook) ?? 0) ? 'text-[#ED1B24]' : ''}`}
                                                        className={`px-2 py-1 text-[#464255] text-right 
                                                        ${tabMain === 1
                                                                ? 'text-[#464255]'
                                                                : ((parseToNumber(row?.data_temp2?.['28']) ?? 0) > (parseToNumber(row?.newObj?.['28']?.valueBook) ?? 0)) ? 'text-[#ED1B24]' : ''
                                                            }
                                                    `}
                                                    >
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
                                                                // row?.data_temp2["28"] ? formatNumberThreeDecimal(row?.data_temp2["28"]) : ''
                                                                row?.data_temp2?.["28"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["28"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["28"].toString().trim().replace(/,/g, ""))) : ""

                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.h16 && (tabIndex == 3 || tabIndex == 0) && (
                                                    <td
                                                        // className={`px-2 py-1 text-[#464255] text-right ${(parseToNumber(row?.data_temp2["29"]) ?? 0) > (parseToNumber(row?.newObj?.["29"]?.valueBook) ?? 0) ? 'text-[#ED1B24]' : ''}`}
                                                        className={`px-2 py-1 text-[#464255] text-right 
                                                        ${tabMain === 1
                                                                ? 'text-[#464255]'
                                                                : ((parseToNumber(row?.data_temp2?.['29']) ?? 0) > (parseToNumber(row?.newObj?.['29']?.valueBook) ?? 0)) ? 'text-[#ED1B24]' : ''
                                                            }
                                                    `}
                                                    >
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
                                                                // row?.data_temp2["29"] ? formatNumberThreeDecimal(row?.data_temp2["29"]) : ''
                                                                row?.data_temp2?.["29"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["29"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["29"].toString().trim().replace(/,/g, ""))) : ""

                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.h17 && (tabIndex == 3 || tabIndex == 0) && (
                                                    <td
                                                        // className={`px-2 py-1 text-[#464255] text-right ${(parseToNumber(row?.data_temp2["30"]) ?? 0) > (parseToNumber(row?.newObj?.["30"]?.valueBook) ?? 0) ? 'text-[#ED1B24]' : ''}`}
                                                        className={`px-2 py-1 text-[#464255] text-right 
                                                        ${tabMain === 1
                                                                ? 'text-[#464255]'
                                                                : ((parseToNumber(row?.data_temp2?.['30']) ?? 0) > (parseToNumber(row?.newObj?.['30']?.valueBook) ?? 0)) ? 'text-[#ED1B24]' : ''
                                                            }
                                                    `}
                                                    >
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
                                                                // row?.data_temp2["30"] ? formatNumberThreeDecimal(row?.data_temp2["30"]) : ''
                                                                row?.data_temp2?.["30"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["30"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["30"].toString().trim().replace(/,/g, ""))) : ""

                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.h18 && (tabIndex == 3 || tabIndex == 0) && (
                                                    <td
                                                        // className={`px-2 py-1 text-[#464255] text-right ${(parseToNumber(row?.data_temp2["31"]) ?? 0) > (parseToNumber(row?.newObj?.["31"]?.valueBook) ?? 0) ? 'text-[#ED1B24]' : ''}`}
                                                        className={`px-2 py-1 text-[#464255] text-right 
                                                        ${tabMain === 1
                                                                ? 'text-[#464255]'
                                                                : ((parseToNumber(row?.data_temp2?.['31']) ?? 0) > (parseToNumber(row?.newObj?.['31']?.valueBook) ?? 0)) ? 'text-[#ED1B24]' : ''
                                                            }
                                                    `}
                                                    >
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
                                                                // row?.data_temp2["31"] ? formatNumberThreeDecimal(row?.data_temp2["31"]) : ''
                                                                row?.data_temp2?.["31"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["31"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["31"].toString().trim().replace(/,/g, ""))) : ""

                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.h19 && (tabIndex == 4 || tabIndex == 0) && (
                                                    <td
                                                        // className={`px-2 py-1 text-[#464255] text-right ${(parseToNumber(row?.data_temp2["32"]) ?? 0) > (parseToNumber(row?.newObj?.["32"]?.valueBook) ?? 0) ? 'text-[#ED1B24]' : ''}`}
                                                        className={`px-2 py-1 text-[#464255] text-right 
                                                        ${tabMain === 1
                                                                ? 'text-[#464255]'
                                                                : ((parseToNumber(row?.data_temp2?.['32']) ?? 0) > (parseToNumber(row?.newObj?.['32']?.valueBook) ?? 0)) ? 'text-[#ED1B24]' : ''
                                                            }
                                                    `}
                                                    >
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
                                                                // row?.data_temp2["32"] ? formatNumberThreeDecimal(row?.data_temp2["32"]) : ''
                                                                row?.data_temp2?.["32"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["32"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["32"].toString().trim().replace(/,/g, ""))) : ""

                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.h20 && (tabIndex == 4 || tabIndex == 0) && (
                                                    <td
                                                        // className={`px-2 py-1 text-[#464255] text-right ${(parseToNumber(row?.data_temp2["33"]) ?? 0) > (parseToNumber(row?.newObj?.["33"]?.valueBook) ?? 0) ? 'text-[#ED1B24]' : ''}`}
                                                        className={`px-2 py-1 text-[#464255] text-right 
                                                        ${tabMain === 1
                                                                ? 'text-[#464255]'
                                                                : ((parseToNumber(row?.data_temp2?.['33']) ?? 0) > (parseToNumber(row?.newObj?.['33']?.valueBook) ?? 0)) ? 'text-[#ED1B24]' : ''
                                                            }
                                                    `}
                                                    >
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
                                                                // row?.data_temp2["33"] ? formatNumberThreeDecimal(row?.data_temp2["33"]) : ''
                                                                row?.data_temp2?.["33"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["33"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["33"].toString().trim().replace(/,/g, ""))) : ""

                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.h21 && (tabIndex == 4 || tabIndex == 0) && (
                                                    <td
                                                        // className={`px-2 py-1 text-[#464255] text-right ${(parseToNumber(row?.data_temp2["34"]) ?? 0) > (parseToNumber(row?.newObj?.["34"]?.valueBook) ?? 0) ? 'text-[#ED1B24]' : ''}`}
                                                        className={`px-2 py-1 text-[#464255] text-right 
                                                        ${tabMain === 1
                                                                ? 'text-[#464255]'
                                                                : ((parseToNumber(row?.data_temp2?.['34']) ?? 0) > (parseToNumber(row?.newObj?.['34']?.valueBook) ?? 0)) ? 'text-[#ED1B24]' : ''
                                                            }
                                                    `}
                                                    >
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
                                                                // row?.data_temp2["34"] ? formatNumberThreeDecimal(row?.data_temp2["34"]) : ''
                                                                row?.data_temp2?.["34"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["34"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["34"].toString().trim().replace(/,/g, ""))) : ""

                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.h22 && (tabIndex == 4 || tabIndex == 0) && (
                                                    <td
                                                        // className={`px-2 py-1 text-[#464255] text-right ${(parseToNumber(row?.data_temp2["35"]) ?? 0) > (parseToNumber(row?.newObj?.["35"]?.valueBook) ?? 0) ? 'text-[#ED1B24]' : ''}`}
                                                        className={`px-2 py-1 text-[#464255] text-right 
                                                        ${tabMain === 1
                                                                ? 'text-[#464255]'
                                                                : ((parseToNumber(row?.data_temp2?.['35']) ?? 0) > (parseToNumber(row?.newObj?.['35']?.valueBook) ?? 0)) ? 'text-[#ED1B24]' : ''
                                                            }
                                                    `}
                                                    >
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
                                                                // row?.data_temp2["35"] ? formatNumberThreeDecimal(row?.data_temp2["35"]) : ''
                                                                row?.data_temp2?.["35"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["35"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["35"].toString().trim().replace(/,/g, ""))) : ""

                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.h23 && (tabIndex == 4 || tabIndex == 0) && (
                                                    <td
                                                        // className={`px-2 py-1 text-[#464255] text-right ${(parseToNumber(row?.data_temp2["36"]) ?? 0) > (parseToNumber(row?.newObj?.["36"]?.valueBook) ?? 0) ? 'text-[#ED1B24]' : ''}`}
                                                        className={`px-2 py-1 text-[#464255] text-right 
                                                        ${tabMain === 1
                                                                ? 'text-[#464255]'
                                                                : ((parseToNumber(row?.data_temp2?.['36']) ?? 0) > (parseToNumber(row?.newObj?.['36']?.valueBook) ?? 0)) ? 'text-[#ED1B24]' : ''
                                                            }
                                                    `}
                                                    >
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
                                                                // row?.data_temp2["36"] ? formatNumberThreeDecimal(row?.data_temp2["36"]) : ''
                                                                row?.data_temp2?.["36"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["36"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["36"].toString().trim().replace(/,/g, ""))) : ""

                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.h24 && (tabIndex == 4 || tabIndex == 0) && (
                                                    <td
                                                        // className={`px-2 py-1 text-[#464255] text-right ${(parseToNumber(row?.data_temp2["37"]) ?? 0) > (parseToNumber(row?.newObj?.["37"]?.valueBook) ?? 0) ? 'text-[#ED1B24]' : ''}`}
                                                        className={`px-2 py-1 text-[#464255] text-right 
                                                        ${tabMain === 1
                                                                ? 'text-[#464255]'
                                                                : ((parseToNumber(row?.data_temp2?.['37']) ?? 0) > (parseToNumber(row?.newObj?.['37']?.valueBook) ?? 0)) ? 'text-[#ED1B24]' : ''
                                                            }
                                                    `}
                                                    >
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
                                                                // row?.data_temp2["37"] ? formatNumberThreeDecimal(row?.data_temp2["37"]) : ''
                                                                row?.data_temp2?.["37"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["37"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["37"].toString().trim().replace(/,/g, ""))) : ""

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
                                                                    // onClick={() => handleEditClick(row?.old_index)} // dev mode
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
                    </div>
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
                // initialColumns={visibleColumns} // ของเดิม
                initialColumns={tabMain == 0 ? visibleColumns : visibleColumns.filter((col: any) => !hiddenKeysWhenTab1.includes(col.key))}

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