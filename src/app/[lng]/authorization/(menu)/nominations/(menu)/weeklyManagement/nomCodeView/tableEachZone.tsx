import { useEffect } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatNumberFourDecimal, formatNumberThreeDecimal, formatNumberThreeDecimalNoComma, getContrastTextColor, validateWeekdaysByPoint } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import NodataTable from "@/components/other/nodataTable";
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ModeEditOutlinedIcon from '@mui/icons-material/ModeEditOutlined';
import { NumericFormat } from "react-number-format";
import { Tune } from "@mui/icons-material"
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import { Tab, Tabs } from "@mui/material";
import PaginationComponent from "@/components/other/globalPagination";
import { parseToNumber } from "@/utils/number";

const TableEachZone: React.FC<any> = ({ type, tableData, tableHeader, isLoading, userPermission, zoneText, nomVersionData, tempData, setTempData, tempDataAll, setTempDataAll, tempDataConcept, setTempDataConcept, areaMaster, entryExitMaster, setIsEdited, tabEntry, isAfterGasDay, readOnly, isDisableAction, dataNomCode, disableColumnAt, dataConceptPoint }) => {

    const [sortedData, setSortedData] = useState<any>([]);
    const [tempDataOriginal, setTempDataOriginal] = useState<any>([]); // เอาไว้ set ตอน cancel
    const [tempDataOriginalConcept, setTempDataOriginalConcept] = useState<any>([]); // เอาไว้ set ตอน cancel
    const [tabMain, setTabMain] = useState(0);
    const [check, setCheck] = useState(false); // filter over val

    // useEffect(() => {
    //     setSortedData(tabEntry);
    // }, [tabEntry])

    const inputClass = "text-[14px] block p-2 h-[37px] w-full border-[1px] bg-white border-[#9CA3AF] outline-none bg-opacity-100 focus:border-[#00ADEF] hover:!p-2 focus:!p-2";

    const [sortState, setSortState] = useState({ column: null, direction: null });
    // const [sortedData, setSortedData] = useState<Record<string, any>[]>([]);
    // const [tempData, setTempData] = useState<Record<string, any>[]>([]); // ย้ายไปส่งมาจากข้างหน้า

    // ===================== TABLE HEADER MAP =====================
    const dayMapping = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const startKey = 14;
    const endKey = 20;

    useEffect(() => {
        // query_shipper_nomination_type_id == 1 || type 1 คือ tab entry/exit || type 2, 4, 5 tab concept
        // 1 = columnPointId
        // 2 = columnPointIdConcept
        // 3 = columnType
        // 4 = columnParkUnparkinstructedFlows
        // 5 = columnWHV

        // ---------------- DATA TAB ENTRY / EXIT
        const filteredData = tableData?.filter(
            (item: any) => item?.zone_text === zoneText && item?.query_shipper_nomination_type_id === 1
        );

        const hua_jai_bok_hai_long = validateWeekdaysByPoint(tabEntry)
        
        setTempData(hua_jai_bok_hai_long);
        setSortedData([...hua_jai_bok_hai_long]);

        // เก็บข้อมูลไม่ให้เปลี่ยนตามต้นฉบับ
        const masterData = JSON.parse(JSON.stringify(hua_jai_bok_hai_long));
        setTempDataOriginal(masterData);  // เก็บเป็น master (ห้ามเปลี่ยน)


        // ---------------- DATA TAB CONCEPT POINT
        const filteredDataConcept = tableData?.filter(
            // (item: any) => item?.query_shipper_nomination_type_id !== 1
            // (item: any) => item?.query_shipper_nomination_type_id == 2 // 2 แสดงใน tab concept ไปก่อน
            (item: any) => item?.zone_text == zoneText && item?.query_shipper_nomination_type_id !== 1
        );

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
        setTempDataConcept(withConceptPoint)

        // เก็บข้อมูลไม่ให้เปลี่ยนตามต้นฉบับ
        const masterDataTabConcept = JSON.parse(JSON.stringify(filteredDataConcept));
        setTempDataOriginalConcept(masterDataTabConcept);  // เก็บเป็น master (ห้ามเปลี่ยน)

    }, [tableData]);
    // }, [tabEntry]);

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
            // setSortedData([...tempData]);
            const hua_jai_bok_hai_long = validateWeekdaysByPoint([...tempData])
            setSortedData([...hua_jai_bok_hai_long]);

            setIsEditing(false)
        } else {
            setSortedData([...tempDataConcept]);
            setIsEditing(false)
        }
    }, [isSaveClick])


    const handleSaveClick = async (rowId?: any) => {
        if (tabMain == 0) {
            const hua_jai_bok_hai_long = validateWeekdaysByPoint([...tempData])

            // setSortedData([...tempData]);
            setSortedData([...hua_jai_bok_hai_long]);
        } else {
            setSortedData([...tempDataConcept]);
        }

        // ส่งค่าทั้งหมด ทั้ง entry/exit และ concept point รวมกัน
        const mergedData = [...tempData, ...tempDataConcept];
        setTemp(mergedData);

        setIsEdited(true); // Nom Code Detail > ปุ่ม submit จะ active ต่อเมื่อมีการ Edit ข้อมูลบางอย่าง https://app.clickup.com/t/86erwqc7q
        setIsEditing(!isEditing);
        setRowEditing(undefined)
    }

    const setTemp = (data: any) => {
        // ดักแค่เฉพาะ 3 tab EAST | WEST | EAST-WEST
        if (type == 'EAST' || type == 'WEST' || type == 'EAST-WEST') {
            const checked = tempDataAll?.find((item: any) => item?.type == type);
            if (!checked) {
                setTempDataAll((pre: any) => [...pre, { type: type, items: data }])
            } else {
                setTempDataAll((pre: any) => pre.map((item: any) => item.type === type ? { ...item, items: data } : item))
            }
        }
    }

    // #region handleCancelClick
    const handleCancelClick = (rowId: any) => {
        if (tabMain == 0) {
            setSortedData([...tempDataOriginal]); // เอาไว้ใช้ตอน cancel
        } else {
            setSortedData([...tempDataOriginalConcept]); // เอาไว้ใช้ตอน cancel
        }

        setIsEditing(!isEditing);
        setRowEditing(undefined)
    };

    // ############### COLUMN SHOW/HIDE ENTRY / EXIT ###############
    const initialColumnsTabEntryExit: any = [
        { key: 'supply_demand', label: 'Supply/Demand', visible: true },
        { key: 'area', label: 'Area', visible: true },
        { key: 'nomination_point', label: 'Nomination Point', visible: true },
        { key: 'unit', label: 'Unit', visible: true },
        { key: 'type', label: 'Type', visible: true },
        { key: 'entry_exit', label: 'Entry/Exit', visible: true },
        { key: 'wi', label: 'WI', visible: true },
        { key: 'hv', label: 'HV', visible: true },
        { key: 'sg', label: 'SG', visible: true },
        { key: 'sunday', label: 'Sunday', visible: true },
        { key: 'monday', label: 'Monday', visible: true },
        { key: 'tuesday', label: 'Tuesday', visible: true },
        { key: 'wednesday', label: 'Wednesday', visible: true },
        { key: 'thursday', label: 'Thursday', visible: true },
        { key: 'friday', label: 'Friday', visible: true },
        { key: 'saturday', label: 'Saturday', visible: true },
        { key: 'edit', label: 'Edit', visible: true },
    ];

    const initialColumnsTabConceptPoint: any = [
        { key: 'supply_demand', label: 'Supply/Demand', visible: true },
        { key: 'concept_id', label: 'Concept ID', visible: true },
        { key: 'unit', label: 'Unit', visible: true },
        { key: 'entry_exit', label: 'Entry/Exit', visible: true },
        { key: 'wi', label: 'WI', visible: true },
        { key: 'hv', label: 'HV', visible: true },
        { key: 'sg', label: 'SG', visible: true },
        { key: 'sunday', label: 'Sunday', visible: true },
        { key: 'monday', label: 'Monday', visible: true },
        { key: 'tuesday', label: 'Tuesday', visible: true },
        { key: 'wednesday', label: 'Wednesday', visible: true },
        { key: 'thursday', label: 'Thursday', visible: true },
        { key: 'friday', label: 'Friday', visible: true },
        { key: 'saturday', label: 'Saturday', visible: true },
        { key: 'edit', label: 'Edit', visible: true },
    ];

    // const filterColumnsByTabIndex = (tabIndex: number) => {
    //     return initialColumnsTabEntryExit.filter((col: any) => {
    //         // const alwaysVisibleKeys = [ "supply_demand", "area", "nomination_point", "unit", "type", "entry_exit", "wi", "hv", "sg", "total", "edit"];
    //         const alwaysVisibleKeys = tabMain == 0 ? ["supply_demand", "area", "nomination_point", "unit", "type", "entry_exit", "wi", "hv", "sg", "sunday", "edit"] : ["supply_demand", "concept_id", "unit", "entry_exit"]

    //         if (alwaysVisibleKeys.includes(col.key)) {
    //             return true;
    //         }

    //         if (tabIndex === 4) { // All day
    //             return true; // Show all columns if tabIndex = 4
    //         }

    //         // Define hourly column visibility based on tab index
    //         const hourColumnMapping: { [key: number]: string[] } = {
    //             0: ["h1", "h2", "h3", "h4", "h5", "h6"],
    //             1: ["h7", "h8", "h9", "h10", "h11", "h12"],
    //             2: ["h13", "h14", "h15", "h16", "h17", "h18"],
    //             3: ["h19", "h20", "h21", "h22", "h23", "h24"],
    //         };

    //         return hourColumnMapping[tabIndex]?.includes(col.key) ?? false;
    //     });
    // };

    // Usage
    // const visibleColumns = filterColumnsByTabIndex(tabMain);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const getInitialColumns = () => tabMain === 0 ? initialColumnsTabEntryExit : initialColumnsTabConceptPoint;

    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(getInitialColumns().map((column: any) => [column.key, column.visible]))
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

    useEffect(() => {
        setColumnVisibility(
            Object.fromEntries(getInitialColumns().map((column: any) => [column.key, column.visible]))
        );

        if (tabMain == 0) {
            setSortedData(tempData)
        } else {
            setSortedData(tempDataConcept)
        }
    }, [tabMain]);

    // ############### SET DATA ###############
    const setTempDataByTab = (tabMain: number, oldIndex: number, value: string, updateKey: any) => {

        if (tabMain == 0) {
            // update in tab entry/exit
            tempData.forEach((item: any) => {
                if (item.old_index === oldIndex) {
                    item.data_temp2[updateKey] = value

                    // update พวก Sunday, Monday ... ที่อยู่ชั้นนอกด้วย
                    const updateKeyNum = parseInt(updateKey);
                    switch (updateKeyNum) {
                        case 14:
                            item["Sunday"] = value;
                            break;
                        case 15:
                            item["Monday"] = value;
                            break;
                        case 16:
                            item["Tuesday"] = value;
                            break;
                        case 17:
                            item["Wednesday"] = value;
                            break;
                        case 18:
                            item["Thursday"] = value;
                            break;
                        case 19:
                            item["Friday"] = value;
                            break;
                        case 20:
                            item["Saturday"] = value;
                            break;
                    }

                }
            });
        } else {
            // update in tab concept point
            tempDataConcept.forEach((item: any) => {
                if (item.old_index === oldIndex) {
                    item.data_temp2[updateKey] = value

                    // update พวก Sunday, Monday ... ที่อยู่ชั้นนอกด้วย
                    const updateKeyNum = parseInt(updateKey);
                    switch (updateKeyNum) {
                        case 14:
                            item["Sunday"] = value;
                            break;
                        case 15:
                            item["Monday"] = value;
                            break;
                        case 16:
                            item["Tuesday"] = value;
                            break;
                        case 17:
                            item["Wednesday"] = value;
                            break;
                        case 18:
                            item["Thursday"] = value;
                            break;
                        case 19:
                            item["Friday"] = value;
                            break;
                        case 20:
                            item["Saturday"] = value;
                            break;

                    }

                }
            });
        }

        // const updateData = (prevData: any[]) =>
        //     prevData.map((entry) => {
        //         if (entry.old_index === oldIndex) {
        //             // const updatedData = { ...entry.data_temp2, ["35"]: value };
        //             const updatedData = { ...entry.data_temp2, [updateKey]: value };

        //             // Calculate sum of keys 14 to 37
        //             // const sum = Object.entries(updatedData)
        //             //     .filter(([key]) => parseInt(key) >= 14 && parseInt(key) <= 37)
        //             //     .reduce((acc, [, val]: any) => acc + (parseFloat(val) || 0), 0);
        //             // updatedData["38"] = sum.toFixed(3); // Keep decimal precision

        //             return { ...entry, data_temp2: updatedData };
        //         }
        //         return entry;
        //     });

        // if (tabMain == 0) {
        //     setTempData(updateData);
        // } else {
        //     setTempDataConcept(updateData);
        // }

        // setTempData(updateData);

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

    const handleChangeTabMain = (event: any, newValue: any) => {
        setTabMain(newValue);
    };

    useEffect(() => {
        // filterSortDataOverVal ฟังก์ชั่นกรองเอาข้อมูลจาก sort_data ตามเงื่อนไขต่อไปนี้

        // condition
        // 1. row.data_temp2["11"] < row?.newObj["11"].min || row.data_temp2["11"] > row?.newObj["11"].max                                         ---> column WI
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
            // if (tabMain == 0) {
            //     setSortedData(tempData)
            // } else {
            //     setSortedData(tempDataConcept)
            // }

            if (tabMain == 0) {
                setSortedData([...tempData]);
                setIsEditing(false)
            } else {
                setSortedData([...tempDataConcept]);
                setIsEditing(false)
            }
        }

    }, [check])

    // Nom Detail ต้องการเพิ่ม Filter or Checkbox สำหรับกรองเฉพาะรายการสีแดง https://app.clickup.com/t/86etzcgte
    const filterSortDataOverVal = (sort_data: any) => {
        return sort_data.filter((row: any) => {
            const dt = row.data_temp2;
            const no = row?.newObj;

            // 1. WI: เช็คว่าค่าอยู่นอกช่วง min-max
            const wi = parseFloat(dt["11"]);
            const wiMin = parseFloat(no?.["11"]?.min);
            const wiMax = parseFloat(no?.["11"]?.max);
            const wiInvalid = Number.isFinite(wi) && Number.isFinite(wiMin) && Number.isFinite(wiMax) ? (wi < wiMin || wi > wiMax) : false;

            // 2. HV: เช็คว่าอยู่นอกช่วง min-max
            const hv = parseFloat(dt["12"]);
            const hvMin = parseFloat(no?.["12"]?.min);
            const hvMax = parseFloat(no?.["12"]?.max);
            const hvInvalid = Number.isFinite(hv) && Number.isFinite(hvMin) && Number.isFinite(hvMax) ? (hv < hvMin || hv > hvMax) : false;

            // 3. SG: มากกว่า valueBook
            // const sg = parseFloat(dt["13"]);
            // const sgBook = parseFloat(no?.["13"]?.valueBook || "0");
            // const sgInvalid = sg > sgBook;
            const sgInvalid = false;

            // 4-27: Sunday ถึง Saturday (index 14 ถึง 20)
            const hInvalid = Object.keys(dt)
                .filter((key) => {
                    const index = Number(key);
                    return Number.isInteger(index) && index >= 14 && index <= 37;
                })
                .some((key) => {
                    const val = Number(dt[key]);
                    const book = Number(no?.[key]?.valueBook);

                    // ถ้าอย่างใดอย่างหนึ่งไม่ใช่ตัวเลขที่ finite ให้ข้าม (ถือว่าไม่ invalid)
                    if (!Number.isFinite(val) || !Number.isFinite(book)) return false;

                    return val > book;
                });

            return wiInvalid || hvInvalid || sgInvalid || hInvalid;
        });
    };

    const handleFilterOverVal = () => {
        setCheck(!check)
    }

    useEffect(() => {
        if (sortedData) {

            if (tabMain == 0) {
                // setPaginatedData(tempData?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
                setSortedData(tempData?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
            } else {
                // setPaginatedData(tempDataConcept?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
                setSortedData(tempDataConcept?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
            }
        }
    }, [tabMain, currentPage, itemsPerPage, zoneText, tempData])


    const [dataCTvalidate, setDataCTvalidate] = useState([])
    useEffect(() => {
        let groupedBywarningLogHrWeeklyTemp: any = Object.values(
            tableData.reduce((acc:any, item:any) => {
            const key = `${item?.contract_point_list?.[0]?.contract_point}|${item?.unit_text}`
            if (!acc[key]) {
                acc[key] = {
                contractPoint: item?.contract_point_list?.[0]?.contract_point,
                unit: item.unit_text,
                data: []
                }
            }
            acc[key].data.push(item)
            return acc
            }, {})
        )?.filter((f:any) => !!f?.contractPoint)?.map((d_:any) => {
            return {
                ...d_,
                day:{
                    Sunday:d_?.data?.reduce((accumulator:any, currentValue:any) => accumulator + parseToNumber(currentValue?.Sunday ?? 0),0,),
                    Monday:d_?.data?.reduce((accumulator:any, currentValue:any) => accumulator + parseToNumber(currentValue?.Monday ?? 0),0,),
                    Thursday:d_?.data?.reduce((accumulator:any, currentValue:any) => accumulator + parseToNumber(currentValue?.Thursday ?? 0),0,),
                    Tuesday:d_?.data?.reduce((accumulator:any, currentValue:any) => accumulator + parseToNumber(currentValue?.Tuesday ?? 0),0,),
                    Wednesday:d_?.data?.reduce((accumulator:any, currentValue:any) => accumulator + parseToNumber(currentValue?.Wednesday ?? 0),0,),
                    Friday:d_?.data?.reduce((accumulator:any, currentValue:any) => accumulator + parseToNumber(currentValue?.Friday ?? 0),0,),
                    Saturday:d_?.data?.reduce((accumulator:any, currentValue:any) => accumulator + parseToNumber(currentValue?.Saturday ?? 0),0,),
                }
            }
        })
        setDataCTvalidate(groupedBywarningLogHrWeeklyTemp)
    }, [tableData])

    return (<div className="h-full">

        <div className={`relative h-[calc(100vh-180px)]  block rounded-t-md z-1 `}>

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

            {
                isLoading ?
                    <div className="h-[calc(100vh-290px)] overflow-y-auto">
                        {/* // <table className="w-full text-sm text-left rtl:text-right text-gray-500"> */}
                        <table className={`w-full text-sm text-left rtl:text-right text-gray-500 `}>
                            <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                                <tr className="h-20">

                                     {columnVisibility.nomination_point && (
                                        <th scope="col" className={`sticky left-0 z-30 bg-[#1473A1] ${table_sort_header_style} min-w-[180px] `} onClick={() => handleSort("nomination_point_text", sortState, setSortState, setSortedData, tabMain == 0 ? tempData : tempDataConcept)}>
                                            {`Nomination Point`}
                                            {getArrowIcon("nomination_point_text")}
                                        </th>
                                    )}

                                     {/* tabs concept point */}
                                    {columnVisibility.concept_id && (
                                        <th scope="col"
                                            className={`sticky left-0 z-30 bg-[#1473A1] ${table_sort_header_style} min-w-[180px]`}
                                            // onClick={() => handleSort("nomination_point_text", sortState, setSortState, setSortedData, tabMain == 0 ? tempData : tempDataConcept)}
                                            onClick={() => handleSort("concept_point_text", sortState, setSortState, setSortedData, tabMain == 0 ? tempData : tempDataConcept)}
                                        >
                                            {`Concept ID`}
                                            {/* {getArrowIcon("nomination_point_text")} */}
                                            {getArrowIcon("concept_point_text")}
                                        </th>
                                    )}

                                    {columnVisibility.unit && (
                                        <th scope="col" className={`sticky left-[180px] z-30 bg-[#1473A1] ${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("unit_text", sortState, setSortState, setSortedData, tabMain == 0 ? tempData : tempDataConcept)}>
                                            {`Unit`}
                                            {getArrowIcon("unit_text")}
                                        </th>
                                    )}

                                    {columnVisibility.supply_demand && (
                                        <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("supply_demand_text", sortState, setSortState, setSortedData, tabMain == 0 ? tempData : tempDataConcept)}>
                                            {`Supply/Demand`}
                                            {getArrowIcon("supply_demand_text")}
                                        </th>
                                    )}

                                   

                                    {/* tabs entry/exit */}
                                    {columnVisibility.area && (
                                        <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("area_text", sortState, setSortState, setSortedData, tabMain == 0 ? tempData : tempDataConcept)}>
                                            {`Area`}
                                            {getArrowIcon("area_text")}
                                        </th>
                                    )}

                                   

                                    {columnVisibility.type && (
                                        <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("type_text", sortState, setSortState, setSortedData, tabMain == 0 ? tempData : tempDataConcept)}>
                                            {`Type`}
                                            {getArrowIcon("type_text")}
                                        </th>
                                    )}

                                    {columnVisibility.entry_exit && (
                                        <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort("entry_exit_text", sortState, setSortState, setSortedData, tabMain == 0 ? tempData : tempDataConcept)}>
                                            {`Entry/Exit`}
                                            {getArrowIcon("entry_exit_text")}
                                        </th>
                                    )}

                                    {columnVisibility.wi && (
                                        <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("wi_text", sortState, setSortState, setSortedData, tabMain == 0 ? tempData : tempDataConcept)}>
                                            {`WI`}
                                            {getArrowIcon("wi_text")}
                                        </th>
                                    )}

                                    {columnVisibility.hv && (
                                        <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("hv_text", sortState, setSortState, setSortedData, tabMain == 0 ? tempData : tempDataConcept)}>
                                            {`HV`}
                                            {getArrowIcon("hv_text")}
                                        </th>
                                    )}

                                    {columnVisibility.sg && (
                                        <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("sg_text", sortState, setSortState, setSortedData, tabMain == 0 ? tempData : tempDataConcept)}>
                                            {`SG`}
                                            {getArrowIcon("sg_text")}
                                        </th>
                                    )}

                                    {Object.entries(tableHeader[0].data_temp2.headData).filter(([key]) => parseInt(key) >= startKey && parseInt(key) <= endKey).map(([key, date]: any, index) => {
                                        const day = dayMapping[index]; // Map index to weekday name
                                        const columnKey = day.toLowerCase(); // Convert to lowercase to match columnVisibility

                                        return columnVisibility[columnKey] ? (
                                            <th
                                                key={key}
                                                scope="col"
                                                className={`${table_sort_header_style} min-w-[120px] text-center`}
                                                onClick={() => handleSort(day, sortState, setSortState, setSortedData, tabMain == 0 ? tempData : tempDataConcept)}
                                            >
                                                <div>{day}</div>
                                                <div>{date}</div>
                                                {getArrowIcon(day)}
                                            </th>
                                        ) : null;
                                    })
                                    }

                                    {columnVisibility.edit && (
                                        <th scope="col" className={`${table_header_style} text-center`} >
                                            {`Edit`}
                                        </th>
                                    )}
                                </tr>
                            </thead>

                            <tbody>
                                {
                                    sortedData && sortedData?.map((row: any, index: any) => {

                                        let isAllowNegativeForConceptPoint = false;
                                        if (tabMain == 1) {
                                            const conceptPointName = `${row?.concept_point_text ?? ''}`;
                                            isAllowNegativeForConceptPoint = dataConceptPoint?.some((item: any) => `${item?.concept_point ?? ''}`.trim().toUpperCase() === conceptPointName.trim().toUpperCase());
                                        }


                                        // สำหรับเช็ค WI
                                        // min, max ถ้าสองตัวนี้เป็น null ไม่ต้องเช็คทำ  text-[#ED1B24] 
                                        // https://app.clickup.com/t/86ev29wzr
                                        // https://app.clickup.com/t/86ev29wzn
                                        const wiValue = parseFloat(String(row?.data_temp2?.["11"] ?? "").replace(/,/g, ""));
                                        const wiMin = row?.newObj?.["11"]?.min;
                                        const wiMax = row?.newObj?.["11"]?.max;

                                        const shouldCheckWi = wiMin != null && wiMax != null;
                                        const isWiOutOfRange = shouldCheckWi && !isNaN(wiValue) && (wiValue < wiMin || wiValue > wiMax);
                                        console.log('row : ', row);

                                        console.log('dataCTvalidate : ', dataCTvalidate);

                                        const filValiValue = (kt_:any) => {
                                            if(kt_ === "total"){

                                                const f_:any = dataCTvalidate?.find((f:any) => f?.contractPoint === row?.contract_point_list?.[0]?.contract_point && f?.unit === row?.unit_text)
                                                const calc_ = (
                                                    f_?.day?.H1 +
                                                    f_?.day?.H2 +
                                                    f_?.day?.H3 +
                                                    f_?.day?.H4 +
                                                    f_?.day?.H5 +
                                                    f_?.day?.H6 +
                                                    f_?.day?.H7 +
                                                    f_?.day?.H8 +
                                                    f_?.day?.H9 +
                                                    f_?.day?.H10 +
                                                    f_?.day?.H11 +
                                                    f_?.day?.H12 +
                                                    f_?.day?.H13 +
                                                    f_?.day?.H14 +
                                                    f_?.day?.H15 +
                                                    f_?.day?.H16 +
                                                    f_?.day?.H17 +
                                                    f_?.day?.H18 +
                                                    f_?.day?.H19 +
                                                    f_?.day?.H20 +
                                                    f_?.day?.H21 +
                                                    f_?.day?.H22 +
                                                    f_?.day?.H23 +
                                                    f_?.day?.H24
                                                )

                                                return calc_
                                            }else{

                                                const f_:any = dataCTvalidate?.find((f:any) => f?.contractPoint === row?.contract_point_list?.[0]?.contract_point && f?.unit === row?.unit_text)
                                               
                                                return f_?.day?.[kt_]
                                            }
                                        }
                                        // console.log('filValiValue : ', filValiValue("H1"));

                                        // className={`px-2 py-1 text-right ${(tabMain === 1 ? false : (row?.newObj?.['14']?.valueBook !== null && row?.newObj?.['14']?.valueBook !== "") && (((parseToNumber(row?.data_temp2?.['14']) ?? 0) > (formatNumberThreeDecimalNoComma(row?.newObj?.['14']?.valueBook) ?? 0)))) && row?.reserve_balancing_gas_contract_id === null ? 'text-[#ED1B24]' : 'text-[#464255]'}`}

                                        return (
                                            <tr
                                                key={row?.id}
                                                className={`${table_row_style}`}
                                            >

                                                {columnVisibility.nomination_point && (
                                                    <td className="sticky left-0 z-30 min-w-[180px] bg-[#ffffff] px-2 py-1 text-[#464255]">{row?.data_temp2["3"] ? row?.data_temp2["3"] : ''}</td>
                                                )}

                                                 {columnVisibility.concept_id && (
                                                    <td className="sticky left-0 z-30 min-w-[180px] bg-[#ffffff] px-2 py-1 text-[#464255]">
                                                        {row?.concept_point_text ? row?.concept_point_text : ''}
                                                    </td>
                                                )}

                                                {columnVisibility.unit && (
                                                    <td className="sticky left-[180px] bg-[#ffffff] z-30 min-w-[120px] px-2 py-1 text-[#464255]">{row?.data_temp2["9"] ? row?.data_temp2["9"] : ''}</td>
                                                )}

                                                {columnVisibility.supply_demand && (
                                                    <td className="px-2 py-1 text-[#464255] ">{row?.data_temp2["1"] ? row?.data_temp2["1"] : ''}</td>
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

                                                

                                                {columnVisibility.type && (
                                                    <td className="px-2 py-1 text-[#464255]">{row?.data_temp2["6"] ? row?.data_temp2["6"] : ''}</td>
                                                )}

                                                {columnVisibility.entry_exit && (
                                                    <td className="px-2 py-1  justify-center ">
                                                        {(() => {
                                                            const filter_entry_exit = entryExitMaster?.data?.find((item: any) => item.name === row?.data_temp2["10"]?.trim());
                                                            return <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: filter_entry_exit?.color }}>{`${filter_entry_exit ? filter_entry_exit?.name : ''}`}</div>
                                                        })()}
                                                    </td>
                                                )}

                                                {columnVisibility.wi && (
                                                    // <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["11"]) < row?.newObj?.["11"]?.min || parseFloat(row?.data_temp2["11"]) > row?.newObj?.["11"]?.max ? 'text-[#ED1B24]' : ''}`}>
                                                    <td className={`px-2 py-1 text-[#464255] text-right ${isWiOutOfRange ? 'text-[#ED1B24]' : ''}`}>
                                                        {
                                                            isEditing && rowEditing == row?.old_index ?
                                                                <NumericFormat
                                                                    value={row?.data_temp2["11"] || ''}
                                                                    onValueChange={(values) => {
                                                                        const { value } = values;

                                                                        setTempDataByTab(tabMain, row?.old_index, value, '11');
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
                                                                row?.data_temp2?.["11"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["11"].toString()?.trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["11"].toString().trim().replace(/,/g, ""))) : ""
                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.hv && (
                                                    // <td className="px-2 py-1 text-[#464255] text-right">
                                                    <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["12"]) < row?.newObj?.["12"]?.min || parseFloat(row?.data_temp2["12"]) > row?.newObj?.["12"]?.max ? 'text-[#ED1B24]' : ''}`}>
                                                        {
                                                            isEditing && rowEditing == row?.old_index ?
                                                                <NumericFormat
                                                                    value={row?.data_temp2["12"] || ''}
                                                                    onValueChange={(values) => {
                                                                        const { value } = values;
                                                                        setTempDataByTab(tabMain, row?.old_index, value, '12');
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
                                                                row?.data_temp2?.["12"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["12"]?.toString()?.trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["12"]?.toString()?.trim().replace(/,/g, ""))) : ""

                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.sg && (
                                                    // <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp2["13"]) > parseFloat(row?.newObj?.["13"]?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                                                    <td className={`px-2 py-1 text-[#464255] text-right`}>
                                                        {
                                                            isEditing && rowEditing == row?.old_index ?
                                                                <NumericFormat
                                                                    value={row?.data_temp2["13"] || ''}
                                                                    onValueChange={(values) => {
                                                                        const { value } = values;
                                                                        setTempDataByTab(tabMain, row?.old_index, value, '13');
                                                                        setIsEditedInRow(true)
                                                                    }}
                                                                    thousandSeparator=","
                                                                    decimalScale={4}
                                                                    fixedDecimalScale={true}
                                                                    allowNegative={false}
                                                                    className={`${inputClass} `}
                                                                    style={{ textAlign: "right", width: "100%" }}
                                                                />
                                                                :
                                                                // row?.data_temp2["13"] ? formatNumberThreeDecimal(row?.data_temp2["13"]) : ''
                                                                row?.data_temp2?.["13"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["13"].toString().trim().replace(/,/g, ""))) ? formatNumberFourDecimal(Number(row?.data_temp2?.["13"]?.toString()?.trim().replace(/,/g, ""))) : ""

                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.sunday && (
                                                    <td
                                                        // className={`px-2 py-1 text-right ${(tabMain === 1 ? false : (row?.validate_Sunday ?? ((parseToNumber(row?.data_temp2?.['14']) ?? 0) > (formatNumberThreeDecimalNoComma(row?.newObj?.['14']?.valueBook) ?? 0)))) && row?.reserve_balancing_gas_contract_id === null ? 'text-[#ED1B24]' : 'text-[#464255]'}`}
                                                        className={`px-2 py-1 text-right ${(tabMain === 1 ? false : (row?.newObj?.['14']?.valueBook !== null && row?.newObj?.['14']?.valueBook !== "") && ((filValiValue("Sunday") > (formatNumberThreeDecimalNoComma(row?.newObj?.['14']?.valueBook) ?? 0)))) && row?.reserve_balancing_gas_contract_id === null ? 'text-[#ED1B24]' : 'text-[#464255]'}`}
                                                    >
                                                        {
                                                            isEditing && rowEditing == row?.old_index && !disableColumnAt.includes(14) ?
                                                                <NumericFormat
                                                                    value={row?.data_temp2["14"] || ''}
                                                                    onValueChange={(values) => {
                                                                        const { value } = values;
                                                                        setTempDataByTab(tabMain, row?.old_index, value, '14');
                                                                    }}
                                                                    thousandSeparator=","
                                                                    decimalScale={3}
                                                                    fixedDecimalScale={true}
                                                                    allowNegative={isAllowNegativeForConceptPoint} // concept point อนุญาติการใส่ค่าลบ
                                                                    className={`${inputClass} `}
                                                                    style={{ textAlign: "right", width: "100%" }}
                                                                />
                                                                :
                                                                // row?.data_temp2["14"] ? formatNumberThreeDecimal(row?.data_temp2["14"]) : ''
                                                                row?.data_temp2?.["14"]?.toString()?.trim() && !isNaN(Number(row?.data_temp2?.["14"].toString()?.trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["14"].toString()?.trim().replace(/,/g, ""))) : ""

                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.monday && (
                                                    <td
                                                        // className={`px-2 py-1 text-right ${(tabMain === 1 ? false : (row?.validate_Monday ?? ((parseToNumber(row?.data_temp2?.['15']) ?? 0) > (formatNumberThreeDecimalNoComma(row?.newObj?.['15']?.valueBook) ?? 0)))) && row?.reserve_balancing_gas_contract_id === null ? 'text-[#ED1B24]' : 'text-[#464255]'}`}
                                                        className={`px-2 py-1 text-right ${(tabMain === 1 ? false : (row?.newObj?.['15']?.valueBook !== null && row?.newObj?.['15']?.valueBook !== "") && ((filValiValue("Monday") > (formatNumberThreeDecimalNoComma(row?.newObj?.['15']?.valueBook) ?? 0)))) && row?.reserve_balancing_gas_contract_id === null ? 'text-[#ED1B24]' : 'text-[#464255]'}`}
                                                    >
                                                        {
                                                            isEditing && rowEditing == row?.old_index && !disableColumnAt.includes(15) ?
                                                                <NumericFormat
                                                                    value={row?.data_temp2["15"] || ''}
                                                                    onValueChange={(values) => {
                                                                        const { value } = values;
                                                                        setTempDataByTab(tabMain, row?.old_index, value, '15');
                                                                    }}
                                                                    thousandSeparator=","
                                                                    decimalScale={3}
                                                                    fixedDecimalScale={true}
                                                                    allowNegative={isAllowNegativeForConceptPoint} // concept point อนุญาติการใส่ค่าลบ
                                                                    className={`${inputClass} `}
                                                                    style={{ textAlign: "right", width: "100%" }}
                                                                />
                                                                :
                                                                // row?.data_temp2["15"] ? formatNumberThreeDecimal(row?.data_temp2["15"]) : ''
                                                                row?.data_temp2?.["15"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["15"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["15"].toString().trim().replace(/,/g, ""))) : ""

                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.tuesday && (
                                                    <td
                                                        // className={`px-2 py-1 text-right ${(tabMain === 1 ? false : (row?.validate_Tuesday ?? ((parseToNumber(row?.data_temp2?.['16']) ?? 0) > (formatNumberThreeDecimalNoComma(row?.newObj?.['16']?.valueBook) ?? 0)))) && row?.reserve_balancing_gas_contract_id === null ? 'text-[#ED1B24]' : 'text-[#464255]'}`}
                                                        className={`px-2 py-1 text-right ${(tabMain === 1 ? false : (row?.newObj?.['16']?.valueBook !== null && row?.newObj?.['16']?.valueBook !== "") && ((filValiValue("Tuesday") > (formatNumberThreeDecimalNoComma(row?.newObj?.['16']?.valueBook) ?? 0)))) && row?.reserve_balancing_gas_contract_id === null ? 'text-[#ED1B24]' : 'text-[#464255]'}`}
                                                    >
                                                        {
                                                            isEditing && rowEditing == row?.old_index && !disableColumnAt.includes(16) ?
                                                                <NumericFormat
                                                                    value={row?.data_temp2["16"] || ''}
                                                                    onValueChange={(values) => {
                                                                        const { value } = values;
                                                                        setTempDataByTab(tabMain, row?.old_index, value, '16');
                                                                    }}
                                                                    thousandSeparator=","
                                                                    decimalScale={3}
                                                                    fixedDecimalScale={true}
                                                                    allowNegative={isAllowNegativeForConceptPoint} // concept point อนุญาติการใส่ค่าลบ
                                                                    className={`${inputClass} `}
                                                                    style={{ textAlign: "right", width: "100%" }}
                                                                />
                                                                :
                                                                // row?.data_temp2["16"] ? formatNumberThreeDecimal(row?.data_temp2["16"]) : ''
                                                                row?.data_temp2?.["16"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["16"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["16"].toString().trim().replace(/,/g, ""))) : ""

                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.wednesday && (
                                                    <td
                                                        // className={`px-2 py-1 text-right ${(tabMain === 1 ? false : (row?.validate_Wednesday ?? ((parseToNumber(row?.data_temp2?.['17']) ?? 0) > (formatNumberThreeDecimalNoComma(row?.newObj?.['17']?.valueBook) ?? 0)))) && row?.reserve_balancing_gas_contract_id === null ? 'text-[#ED1B24]' : 'text-[#464255]'}`}
                                                        className={`px-2 py-1 text-right ${(tabMain === 1 ? false : (row?.newObj?.['17']?.valueBook !== null && row?.newObj?.['17']?.valueBook !== "") && ((filValiValue("Wednesday") > (formatNumberThreeDecimalNoComma(row?.newObj?.['17']?.valueBook) ?? 0)))) && row?.reserve_balancing_gas_contract_id === null ? 'text-[#ED1B24]' : 'text-[#464255]'}`}
                                                    >
                                                        {
                                                            isEditing && rowEditing == row?.old_index && !disableColumnAt.includes(17) ?
                                                                <NumericFormat
                                                                    value={row?.data_temp2["17"] || ''}
                                                                    onValueChange={(values) => {
                                                                        const { value } = values;
                                                                        setTempDataByTab(tabMain, row?.old_index, value, '17');
                                                                    }}
                                                                    thousandSeparator=","
                                                                    decimalScale={3}
                                                                    fixedDecimalScale={true}
                                                                    allowNegative={isAllowNegativeForConceptPoint} // concept point อนุญาติการใส่ค่าลบ
                                                                    className={`${inputClass} `}
                                                                    style={{ textAlign: "right", width: "100%" }}
                                                                />
                                                                :
                                                                // row?.data_temp2["17"] ? formatNumberThreeDecimal(row?.data_temp2["17"]) : ''
                                                                row?.data_temp2?.["17"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["17"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["17"].toString().trim().replace(/,/g, ""))) : ""

                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.thursday && (
                                                    <td
                                                        // className={`px-2 py-1 text-right ${(tabMain === 1 ? false : (row?.validate_Thursday ?? ((parseToNumber(row?.data_temp2?.['18']) ?? 0) > (formatNumberThreeDecimalNoComma(row?.newObj?.['18']?.valueBook) ?? 0)))) && row?.reserve_balancing_gas_contract_id === null ? 'text-[#ED1B24]' : 'text-[#464255]'}`}
                                                        className={`px-2 py-1 text-right ${(tabMain === 1 ? false : (row?.newObj?.['18']?.valueBook !== null && row?.newObj?.['18']?.valueBook !== "") && ((filValiValue("Thursday") > (formatNumberThreeDecimalNoComma(row?.newObj?.['18']?.valueBook) ?? 0)))) && row?.reserve_balancing_gas_contract_id === null ? 'text-[#ED1B24]' : 'text-[#464255]'}`}
                                                    >
                                                        {
                                                            isEditing && rowEditing == row?.old_index && !disableColumnAt.includes(18) ?
                                                                <NumericFormat
                                                                    value={row?.data_temp2["18"] || ''}
                                                                    onValueChange={(values) => {
                                                                        const { value } = values;
                                                                        setTempDataByTab(tabMain, row?.old_index, value, '18');
                                                                    }}
                                                                    thousandSeparator=","
                                                                    decimalScale={3}
                                                                    fixedDecimalScale={true}
                                                                    allowNegative={isAllowNegativeForConceptPoint} // concept point อนุญาติการใส่ค่าลบ
                                                                    className={`${inputClass} `}
                                                                    style={{ textAlign: "right", width: "100%" }}
                                                                />
                                                                :
                                                                // row?.data_temp2["18"] ? formatNumberThreeDecimal(row?.data_temp2["18"]) : ''
                                                                row?.data_temp2?.["18"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["18"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["18"].toString().trim().replace(/,/g, ""))) : ""

                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.friday && (
                                                    <td
                                                        // className={`px-2 py-1 text-right ${(tabMain === 1 ? false : (row?.validate_Friday ?? ((parseToNumber(row?.data_temp2?.['19']) ?? 0) > (formatNumberThreeDecimalNoComma(row?.newObj?.['19']?.valueBook) ?? 0)))) && row?.reserve_balancing_gas_contract_id === null ? 'text-[#ED1B24]' : 'text-[#464255]'}`}
                                                        className={`px-2 py-1 text-right ${(tabMain === 1 ? false : (row?.newObj?.['19']?.valueBook !== null && row?.newObj?.['19']?.valueBook !== "") && ((filValiValue("Friday") > (formatNumberThreeDecimalNoComma(row?.newObj?.['19']?.valueBook) ?? 0)))) && row?.reserve_balancing_gas_contract_id === null ? 'text-[#ED1B24]' : 'text-[#464255]'}`}
                                                    >
                                                        {
                                                            isEditing && rowEditing == row?.old_index && !disableColumnAt.includes(19) ?
                                                                <NumericFormat
                                                                    value={row?.data_temp2["19"] || ''}
                                                                    onValueChange={(values) => {
                                                                        const { value } = values;
                                                                        setTempDataByTab(tabMain, row?.old_index, value, '19');
                                                                    }}
                                                                    thousandSeparator=","
                                                                    decimalScale={3}
                                                                    fixedDecimalScale={true}
                                                                    allowNegative={isAllowNegativeForConceptPoint} // concept point อนุญาติการใส่ค่าลบ
                                                                    className={`${inputClass} `}
                                                                    style={{ textAlign: "right", width: "100%" }}
                                                                />
                                                                :
                                                                // row?.data_temp2["19"] ? formatNumberThreeDecimal(row?.data_temp2["19"]) : ''
                                                                row?.data_temp2?.["19"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["19"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["19"].toString().trim().replace(/,/g, ""))) : ""

                                                        }
                                                    </td>
                                                )}

                                                {columnVisibility.saturday && (
                                                    <td
                                                        // className={`px-2 py-1 text-right ${(tabMain === 1 ? false : (row?.validate_Saturday ?? ((parseToNumber(row?.data_temp2?.['20']) ?? 0) > (formatNumberThreeDecimalNoComma(row?.newObj?.['20']?.valueBook) ?? 0)))) && row?.reserve_balancing_gas_contract_id === null ? 'text-[#ED1B24]' : 'text-[#464255]'}`}
                                                        className={`px-2 py-1 text-right ${(tabMain === 1 ? false : (row?.newObj?.['20']?.valueBook !== null && row?.newObj?.['20']?.valueBook !== "") && ((filValiValue("Saturday") > (formatNumberThreeDecimalNoComma(row?.newObj?.['20']?.valueBook) ?? 0)))) && row?.reserve_balancing_gas_contract_id === null ? 'text-[#ED1B24]' : 'text-[#464255]'}`}
                                                    >
                                                        {
                                                            isEditing && rowEditing == row?.old_index && !disableColumnAt.includes(20) ?
                                                                <NumericFormat
                                                                    value={row?.data_temp2["20"] || ''}
                                                                    onValueChange={(values) => {
                                                                        const { value } = values;
                                                                        setTempDataByTab(tabMain, row?.old_index, value, '20');
                                                                    }}
                                                                    thousandSeparator=","
                                                                    decimalScale={3}
                                                                    fixedDecimalScale={true}
                                                                    allowNegative={isAllowNegativeForConceptPoint} // concept point อนุญาติการใส่ค่าลบ
                                                                    className={`${inputClass} `}
                                                                    style={{ textAlign: "right", width: "100%" }}
                                                                />
                                                                :
                                                                // row?.data_temp2["20"] ? formatNumberThreeDecimal(row?.data_temp2["20"]) : ''
                                                                row?.data_temp2?.["20"]?.toString().trim() && !isNaN(Number(row?.data_temp2?.["20"].toString().trim().replace(/,/g, ""))) ? formatNumberThreeDecimal(Number(row?.data_temp2?.["20"].toString().trim().replace(/,/g, ""))) : ""
                                                        }
                                                    </td>
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
                                                                    // disabled={!isEditedInRow} // Disable if isEditedInRow is false
                                                                    className={`flex w-[130px] h-[33px] px-4 py-2 rounded-[8px] items-center justify-center
                                                                ${isEditedInRow ? "bg-[#17AC6B] text-white cursor-pointer" : "bg-gray-400 text-gray-200 cursor-not-allowed"}`}
                                                                >
                                                                    <div className="gap-2 flex">
                                                                        {'Save Draft'}
                                                                        <CheckOutlinedIcon sx={{ fontSize: 18, color: '#ffffff' }} />
                                                                    </div>
                                                                </button>

                                                                <button
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
                                                                <ModeEditOutlinedIcon
                                                                    // onClick={(isDisableAction == false && ![2, 3, 4, 5].includes(dataNomCode?.query_shipper_nomination_status?.id)) ? () => handleEditClick(row?.old_index) : undefined} // เงื่อนไขเดียวกับ เปิดปิดปุ่ม Action
                                                                    // className={`border-[1px] rounded-[4px] ${(isDisableAction == true || [2, 3, 4, 5].includes(dataNomCode?.query_shipper_nomination_status?.id)) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}

                                                                    onClick={(isDisableAction == false && ![4].includes(dataNomCode?.query_shipper_nomination_status?.id)) ? () => handleEditClick(row?.old_index) : undefined}
                                                                    className={`border-[1px] rounded-[4px] ${(isDisableAction == true || [4].includes(dataNomCode?.query_shipper_nomination_status?.id)) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}

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
                // initialColumns={visibleColumns}
                initialColumns={tabMain == 0 ? initialColumnsTabEntryExit : initialColumnsTabConceptPoint}

            />
        </div>

        <PaginationComponent
            // totalItems={100}
            // itemsPerPage={itemsPerPage}
            // currentPage={currentPage}
            totalItems={tabMain == 0 ? tempData?.length : tempDataConcept?.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
        />
    </div>


    )
}

export default TableEachZone;