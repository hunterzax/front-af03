import { useEffect, useRef } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatNumberFourDecimal, iconButtonClass, toDayjs } from '@/utils/generalFormatter';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import BtnActionTable from "@/components/other/btnActionInTable";
import { handleSort, handleSortAllocMgn } from "@/utils/sortTable";

interface TableProps {
    openEditForm: (id: any) => void;
    openViewForm: (id: any) => void;
    openReasonModal: (id?: any, data_comment?: any, row?: any) => void;
    tableData: any;
    isLoading: any;
    columnVisibility: any;
    userPermission?: any;
    selectedItem?: any;
    setselectedItem?: any;
    openHistoryForm: (id: any) => void;
    sortedData?: any;
    setSortedData?: any;
    filteredDataTable?: any;
    setFilteredDataTable?: any;
}

  const statusOrder: any = {
    "Shipper Reviewed": 1,
    "Accepted": 2,
    "Accept": 2,
    "Allocated": 3,
    "Allocate": 3,
    "Rejected": 4,
    "Reject": 4,
    "Not Review": 5,
    };

    const sortByStatus = (data: any[]) => {
    return [...data].sort((a, b) => {
        const aOrder = statusOrder[a?.allocation_status_name] ?? 999;
        const bOrder = statusOrder[b?.allocation_status_name] ?? 999;
        return aOrder - bOrder;
    });
    };

    /**
     * เพิ่ม field ที่ใช้ sort แต่ไม่ได้อยู่ใน response โดยตรง
     * เช่น allocation_status_name ของ parent และ child
     */
    const transformDataForSort = (data: any[]) => {
        return (Array.isArray(data) ? data : []).map((item: any) => ({
            ...item,
            allocation_status_name:
                item?.allocation_status_name ??
                item?.data?.[0]?.allocation_status?.name ??
                "Not Review",
            data: Array.isArray(item?.data)
                ? item.data.map((child: any) => ({
                    ...child,
                    allocation_status_name:
                        child?.allocation_status_name ??
                        child?.allocation_status?.name ??
                        "Not Review",
                }))
                : item?.data,
        }));
    };


const TableAlloManage: React.FC<TableProps> = ({ filteredDataTable, setFilteredDataTable, openEditForm, openViewForm, tableData, isLoading, columnVisibility, userPermission, selectedItem, setselectedItem, openHistoryForm, openReasonModal, sortedData, setSortedData }) => {

    const [tk, settk] = useState<boolean>(true);
    const [sortState, setSortState] = useState<{
        column: string | null;
        direction: "asc" | "desc" | null;
    }>({ column: null, direction: null });

    // ข้อมูล 10 แถวของหน้าปัจจุบัน หลัง transform
    const [sortedDataTransform, setSortedDataTransform] = useState(tableData);
    const [toggleData, settoggleData] = useState<any>();
    const [checkedData, setcheckedData] = useState<any>();

    /**
     * เก็บข้อมูลทั้งหมดก่อน sort ไว้สำหรับ:
     * 1. sort asc/desc จากข้อมูลต้นฉบับทั้งหมด
     * 2. คืนลำดับเดิมเมื่อกด sort รอบที่ 3
     */
    const originalFilteredDataRef = useRef<any[]>([]);

    /**
     * ป้องกัน useEffect ด้านล่างไม่ให้เอาผลลัพธ์หลัง sort
     * ไปทับข้อมูลต้นฉบับใน originalFilteredDataRef
     */
    const isSortUpdateRef = useRef(false);

    useEffect(() => {
        if (isSortUpdateRef.current) {
            isSortUpdateRef.current = false;
            return;
        }

        originalFilteredDataRef.current = Array.isArray(filteredDataTable)
            ? [...filteredDataTable]
            : [];

        // เมื่อ Search/Filter ใหม่ ให้ reset icon sort
        setSortState({ column: null, direction: null });
    }, [filteredDataTable]);

    /**
     * Sort ข้อมูลทั้งหมดก่อน pagination รองรับครบทั้ง:
     * - dataInOut.xxx
     * - data.xxx
     * - field ปกติ เช่น point_text, allocation_status_name
     */
    const handleSortAll = (column: string) => {
        if (typeof setFilteredDataTable !== "function") return;

        const originalData =
            originalFilteredDataRef.current.length > 0
                ? originalFilteredDataRef.current
                : Array.isArray(filteredDataTable)
                    ? filteredDataTable
                    : [];

        // allocation_status_name เป็น field ที่สร้างเพิ่ม จึงต้อง transform
        // ข้อมูลทั้งหมดก่อนส่งเข้า handleSort
        const sourceData = transformDataForSort(originalData);

        isSortUpdateRef.current = true;

        handleSort(
            column,
            sortState,
            setSortState,
            setFilteredDataTable,
            sourceData
        );
    };

    useEffect(() => {
  if (tableData && tableData.length > 0) {
    const transformed = transformDataForSort(tableData);

    const hasActiveSort =
      Boolean(sortState.column) && sortState.direction !== null;

    // ถ้ามี sort คอลัมน์ใดก็ตาม ห้าม sortByStatus ทับผลที่ pagination ส่งมา
    const sortedInit = hasActiveSort
      ? transformed
      : sortByStatus(transformed);

    setSortedDataTransform(sortedInit);
    setSortedData(sortedInit);
    setcheckedAll(false);

    let toggleDT: any[] = [];
    let checkedDT: any[] = [];

    for (let index = 0; index < sortedInit.length; index++) {
      const id = sortedInit[index]?.id;

      const existingToggle = toggleData?.find((item: any) => item.id === id);

      toggleDT.push({
        id,
        toggle: existingToggle ? existingToggle.toggle : false,
      });

      if (sortedInit[index]?.data?.length > 0) {
        const dataSub = sortedInit[index]?.data;

        const itemDT = dataSub.map((sub: any) => ({
          parent: id,
          id: sub.id,
          allocation_status: sub.allocation_status,
          checked: false,
        }));

        checkedDT.push({
          checked: false,
          id,
          allocation_status: sortedInit[index]?.status,
          data: itemDT,
        });
      }
    }

    settoggleData(toggleDT);
    setcheckedData(checkedDT);
  } else {
    setSortedData([]);
  }
}, [tableData, sortState.column, sortState.direction]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    const [openPopoverId, setOpenPopoverId] = useState(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const togglePopover = (id: any) => {
        if (openPopoverId === id) {
            setOpenPopoverId(null); // Close the popover if it's already open
        } else {
            setOpenPopoverId(id); // Open the popover for the clicked row
        }
    };

    const toggleMenu = (mode: any, id: any) => {
        switch (mode) {
            case "history":
                openHistoryForm(id);
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

    const renderStatus: any = (data: any) => {
        let items: any = [
            {
                id: 0,
                label: 'Shipper Reviewed',
                color: '#D0E5FD'
            },
            {
                id: 1,
                label: 'Accepted',
                color: '#C8FFD7'
            },
            {
                id: 2,
                label: 'Allocated',
                color: '#A7EFFF'
            },
            {
                id: 3,
                label: 'Rejected',
                color: '#FFF1CE'
            },
            {
                id: 4,
                label: 'Not Review',
                color: '#DEDEDE'
            }
        ];

        // let m11: any = data?.filter((item: any) => item?.allocation_status?.id == 2); //shipper
        // let m13: any = data?.filter((item: any) => item?.allocation_status?.id == 3); //accepted
        // let m14: any = data?.filter((item: any) => item?.allocation_status?.id == 4); //allowcated
        // let m12: any = data?.filter((item: any) => item?.allocation_status?.id == 5); //rejected
        let m11: any = data?.filter((item: any) => item?.allocation_status?.id == 2); //shipper
        let m12: any = data?.filter((item: any) => item?.allocation_status?.id == 3); //accepted
        let m13: any = data?.filter((item: any) => item?.allocation_status?.id == 4); //allowcated
        let m14: any = data?.filter((item: any) => item?.allocation_status?.id == 5); //rejected
        
      
        let renderColor: any = m11?.length > 0 ? items[0]?.color : m12?.length > 0 ? items[1]?.color : m13?.length > 0 ? items[2]?.color : m14?.length > 0 ? items[3]?.color : items[4]?.color;
        let renderTxt: any = m11?.length > 0 ? items[0]?.label : m12?.length > 0 ? items[1]?.label : m13?.length > 0 ? items[2]?.label : m14?.length > 0 ? items[3]?.label : items[4]?.label;

        return (<div className="w-[160px] p-1 text-center rounded-[50px]" style={{ background: renderColor }}>{renderTxt}</div>)
    }

    const [checkedAll, setcheckedAll] = useState<boolean>(false);


    const renderCheckedAll: any = (checked: any, mode: 'clickAll' | 'checkAll') => {

        // 2 = shipper review
        // 3 = accepted
        // 4 = allowcated
        // 5 = rejected

        if (mode === 'clickAll') {
            let checkFirst: any = [...checkedData]; // clone กัน state เพี้ยน

            const result: any[] = [];

            for (let i1 = 0; i1 < checkFirst.length; i1++) {
                let hasValidChild = false;

                for (let i2 = 0; i2 < checkFirst[i1]?.data?.length; i2++) {
                    const child = checkFirst[i1].data[i2];
                    const statusId = Number(child?.allocation_status?.id);

                    if ([2, 3, 5].includes(statusId)) {
                        hasValidChild = true;

                        // ✅ update checked
                        checkFirst[i1].data[i2].checked = checked;

                        // ✅ เก็บ result เฉพาะตอน checked = true
                        if (checked) {
                            result.push({
                                id: child.id,
                                parent: true
                            });
                        }
                    }
                }

                if (hasValidChild) {
                    checkFirst[i1].checked = checked;

                    // ✅ push parent
                    if (checked) {
                        result.push({ id: checkFirst[i1].id });
                    }
                }
            }

            // ✅ set state ทีเดียว
            setselectedItem(checked ? result : []);
            setcheckedAll(checked);
        } else if (mode == 'checkAll') {
            if (checkedAll !== checked) {
                let checkFirst: any = checkedData;
                let checkResult: any = [];
                for (let i1 = 0; i1 < checkFirst?.length; i1++) {
                    // let checkedShipper: any = checkFirst[i1]?.data?.filter((item: any) => item?.allocation_status?.id == 2);
                    let checkedShipper: any = checkFirst[i1]?.data?.filter((item: any) => item?.allocation_status?.id == 2 || item?.allocation_status?.id == 3 || item?.allocation_status?.id == 5);
                    if (checkedShipper?.length > 0) {
                        for (let i2 = 0; i2 < checkFirst[i1]?.data?.length; i2++) {
                            // if (checkFirst[i1]?.data[i2]?.allocation_status?.id == 2 && checkFirst[i1].data[i2].checked !== checked) {
                            if ((checkFirst[i1]?.data[i2]?.allocation_status?.id == 2 || checkFirst[i1]?.data[i2]?.allocation_status?.id == 3 || checkFirst[i1]?.data[i2]?.allocation_status?.id == 5) && checkFirst[i1].data[i2].checked !== checked) {
                                checkResult.push({
                                    id: checkFirst[i1]?.data[i2]?.id,
                                    checked: checkFirst[i1]?.data[i2]?.checked
                                });
                            }
                        }
                    }
                }

                if (checkResult?.length == 0) {
                    setcheckedAll(checked);
                }
            }
        }
        settk(!tk);
    }

    const genManoStatus = (data: any[]) => {
        // ถ้ากำลัง sort ข้อมูลลูก ให้ใช้ลำดับที่ handleSort เรียงมาแล้ว
        const isChildSort =
            sortState.column?.startsWith("dataInOut.") ||
            sortState.column?.startsWith("data.");

        if (isChildSort && sortState.direction !== null) {
            return data;
        }

        const priority = [
            "Shipper Reviewed",
            "Accepted",
            "Allocated",
            "Rejected",
            "Not Review",
        ];

        // clone ก่อน sort เพื่อไม่แก้ state โดยตรง
        return [...data].sort((a: any, b: any) => {
            const indexA = priority.indexOf(a.allocation_status_name);
            const indexB = priority.indexOf(b.allocation_status_name);

            const priorityA = indexA === -1 ? 999 : indexA;
            const priorityB = indexB === -1 ? 999 : indexB;

            return priorityA - priorityB;
        });
    };


    useEffect(() => {
      console.log('filteredDataTable : ', filteredDataTable);
    }, [filteredDataTable])

    useEffect(() => {
      console.log('sortedData : ', sortedData);
    }, [sortedData])

    useEffect(() => {
      console.log('tableData : ', tableData);
    }, [tableData])
    

    return (
        <div className="h-[calc(100vh-380px)] overflow-y-auto overflow-x-auto rounded-t-md">
            {
                isLoading ?
                    <table className="table-auto min-w-full text-sm rtl:text-right text-gray-500 whitespace-nowrap">
                        <thead className="text-xs text-[#ffffff] sticky top-0 z-10">
                            <tr className="h-9">
                                {columnVisibility?.total && (
                                    <th scope="col" className={`${table_header_style} bg-[#1473A1]`}>
                                        <div className="flex justify-center items-center">
                                            <input
                                                type="checkbox"
                                                onChange={(e) => renderCheckedAll(e?.target?.checked, 'clickAll')}
                                                checked={checkedAll}
                                                className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1] disabled:opacity-100 disabled:cursor-not-allowed "
                                            />
                                        </div>
                                    </th>
                                )}
                                {columnVisibility?.status && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} text-center bg-[#1473A1]`}
                                        // onClick={() => handleSort("data.allocation_status.name", sortState, setSortState, setSortedData, tableData)}
                                        // onClick={() => handleSortAllocMgn(
                                        //     // "data.allocation_status.name", // path
                                        //     "data?.allocation_status_name", // path
                                        //     sortState,
                                        //     setSortState,
                                        //     setSortedData,
                                        //     // tableData,
                                        //     sortedDataTransform,
                                        //     "first" // ใช้ค่าของ sub-row ตัวแรก
                                        // )}
                                        onClick={() => handleSortAll("data.allocation_status_name")}
                                    >
                                        {`Status`}
                                        {/* {getArrowIcon("data.allocation_status.name")} */}
                                        {/* {getArrowIcon("data.allocation_status_name")} */}
                                        {getArrowIcon("data.allocation_status_name")}
                                    </th>
                                )}
                                {columnVisibility?.gas_day && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} bg-[#1473A1]`}
                                        // onClick={() => handleSort("data.gas_day", sortState, setSortState, setSortedData, tableData)}
                                        // onClick={() => handleSort("data.gas_day", sortState, setSortState, setSortedData, sortedDataTransform)}
                                        // onClick={() => handleSort("data.gas_day", sortState, setSortState, setSortedData, sortedDataTransform)}
                                        onClick={() => handleSortAll("dataInOut.gas_day")}
                                    >
                                        {`Gas Day`}
                                        {getArrowIcon("dataInOut.gas_day")}

                                        
                                    </th>
                                )}
                                {columnVisibility?.shipper && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} bg-[#1473A1]`}
                                        // onClick={() => handleSort("data.group.name", sortState, setSortState, setSortedData, tableData)}
                                        onClick={() => handleSortAll("data.group.name")}
                                    >
                                        {`Shipper Name`}
                                        {getArrowIcon("data.group.name")}
                                    </th>
                                )}
                                {columnVisibility?.contract && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} text-center bg-[#1473A1]`}
                                        // onClick={() => handleSort("data.contract_code.contract_code", sortState, setSortState, setSortedData, tableData)}
                                        onClick={() => handleSortAll("data.contract_code.contract_code")}
                                    >
                                        {`Contract Code`}
                                        {getArrowIcon("data.contract_code.contract_code")}
                                    </th>
                                )}
                                {columnVisibility?.nompoint && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} py-5 bg-[#1473A1]`}
                                        // onClick={() => handleSort("point_text", sortState, setSortState, setSortedData, tableData)}
                                        onClick={() => handleSortAll("point_text")}
                                        
                                    >
                                        <div>{`Nomination Point /`}</div>
                                        <div className="mt-[5px]">{`Concept Point`}</div>
                                        {getArrowIcon("point_text")}
                                    </th>
                                )}
                                {columnVisibility?.entryexit && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} text-center bg-[#1473A1]`}
                                        // onClick={() => handleSort("data.entry_exit", sortState, setSortState, setSortedData, tableData)}
                                        onClick={() => handleSortAll("entry_exit")}
                                    >
                                        {`Entry / Exit`}
                                        {getArrowIcon("entry_exit")}
                                    </th>
                                )}
                                {columnVisibility?.nominatedval && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} py-5 bg-[#1473A1]`}
                                        // onClick={() => handleSort("data.nominationValue", sortState, setSortState, setSortedData, tableData)}
                                        // onClick={() => handleSort("data.nominationValue", sortState, setSortState, setSortedData, sortedDataTransform)}
                                        // onClick={() => handleSort("nomination_value", sortState, setSortState, setSortedData, sortedDataTransform)}
                                        onClick={() => handleSortAll("dataInOut.nomination_value")}
                                        // onClick={() => handleSort("nomination_value", sortState, setSortState, setSortedData, filteredDataTable)}
                                        // filteredDataTable, setFilteredDataTable
                                    >
                                        <div>{`Nominated Value`}</div>
                                        <div className="mt-[5px]">{`(MMBTU/D)`}</div>
                                        {/* {getArrowIcon("data.nominationValue")} */}
                                        {getArrowIcon("dataInOut.nomination_value")}
                                    </th>
                                )}
                                {columnVisibility?.system_allo && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} py-5 bg-[#1473A1]`}
                                        // onClick={() => handleSort("data.systemAllocation", sortState, setSortState, setSortedData, tableData)}
                                        // onClick={() => handleSort("system_allocation", sortState, setSortState, setSortedData, tableData)}
                                        onClick={() => handleSortAll("dataInOut.system_allocation")}
                                    >
                                        <div>{`System Allocation`}</div>
                                        <div className="mt-[5px]">{`(MMBTU/D)`}</div>
                                        {/* {getArrowIcon("data.systemAllocation")} */}
                                        {getArrowIcon("dataInOut.system_allocation")}
                                    </th>
                                )}
                                {columnVisibility?.intraday_allo && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} py-5 bg-[#1473A1]`}
                                        // onClick={() => handleSort("data.intradaySystem", sortState, setSortState, setSortedData, tableData)}
                                        // onClick={() => handleSort("data.intradaySystem", sortState, setSortState, setSortedData, sortedDataTransform)}
                                        onClick={() => handleSortAll("dataInOut.intraday_system")}
                                    >
                                        <div>{`Intraday System Allocation`}</div>
                                        <div className="mt-[5px]">{`(MMBTU/D)`}</div>
                                        {/* {getArrowIcon("data.intradaySystem")} */}
                                        {getArrowIcon("dataInOut.intraday_system")}
                                    </th>
                                )}
                                {columnVisibility?.previous_allo && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} py-5 bg-[#B8E6FE] text-[#1473A1] hover:text-[#ffffff]`}
                                        // onClick={() => handleSort("data.previousAllocationTPAforReview", sortState, setSortState, setSortedData, tableData)}
                                        // onClick={() => handleSort("previous_allocation_tpa_for_review", sortState, setSortState, setSortedData, tableData)}
                                        onClick={() => handleSortAll("dataInOut.previous_allocation_tpa_for_review")}
                                    >
                                        <div>{`Previous Allocation`}</div>
                                        <div className="mt-[5px]">{`(MMBTU/D)`}</div>
                                        {getArrowIcon("dataInOut.previous_allocation_tpa_for_review")}
                                    </th>
                                )}
                                {columnVisibility?.shipper_allo && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} py-1 bg-[#B8E6FE] text-[#1473A1] hover:text-[#ffffff]`}
                                        // onClick={() => handleSort("data.shipperAllocationReview", sortState, setSortState, setSortedData, tableData)}
                                        // onClick={() => handleSort("shipper_allocation_review", sortState, setSortState, setSortedData, tableData)}
                                        onClick={() => handleSortAll("dataInOut.shipper_allocation_review")}
                                    >
                                        <div>{`Shipper Allocation Review`}</div>
                                        <div className="mt-[5px]">{`(MMBTU/D)`}</div>
                                        {getArrowIcon("dataInOut.shipper_allocation_review")}
                                    </th>
                                )}
                                {columnVisibility?.metering_allo && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} py-1 bg-[#B8E6FE] text-[#1473A1] hover:text-[#ffffff]`}
                                        // onClick={() => handleSort("data.meteringValue", sortState, setSortState, setSortedData, tableData)}
                                        // onClick={() => handleSort("metering_value", sortState, setSortState, setSortedData, tableData)}
                                        onClick={() => handleSortAll("dataInOut.metering_value")}
                                    >
                                        {`Metering Value (MMBTU/D)`}
                                        {getArrowIcon("dataInOut.metering_value")}
                                    </th>
                                )}
                                {columnVisibility?.review && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} py-1 bg-[#B8E6FE] text-[#1473A1] hover:text-[#ffffff]`}
                                        // onClick={() => handleSort("data.reviewCode", sortState, setSortState, setSortedData, tableData)}
                                        onClick={() => handleSortAll("data.reviewCode")}
                                    >
                                        {`Review Code`}
                                        {getArrowIcon("data.reviewCode")}
                                    </th>
                                )}
                                {columnVisibility?.comment && (
                                    <th scope="col" className={`${table_header_style} py-1 bg-[#B8E6FE] text-[#1473A1]`}>
                                        {`Comment`}
                                    </th>
                                )}
                                {columnVisibility?.action && (
                                    <th scope="col" className="px-2 py-1 text-center bg-[#1473A1]">
                                        {`Action`}
                                    </th>
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {sortedData && sortedData?.map((row: any, key: any) => {

                                return (
                                    <>
                                        <tr
                                            key={'main-' + key}
                                            className={`${table_row_style} !bg-[#E8FFEE] cursor-pointer`}
                                            onClick={() => {
                                                let toggleIDX: any = toggleData?.findIndex((item: any) => item?.id == row?.id);

                                                if (toggleIDX !== -1) {
                                                    settoggleData((prev: any) =>
                                                        prev.map((item: any, index: any) =>
                                                            index === toggleIDX ? { ...item, toggle: !item.toggle } : item
                                                        )
                                                    );
                                                    settk((prev) => !prev);
                                                }
                                            }}
                                        >
                                            {columnVisibility?.total && (
                                                // <td className="px-2 py-1 text-[#464255]">{row?.menus?.name}</td>
                                                <td className="px-2 py-1 text-[#464255]">
                                                    <div className="flex gap-2">
                                                        <div
                                                            className="cursor-pointer"
                                                        >
                                                            {toggleData?.find((item: any) => item?.id == row?.id)?.toggle == true ? <KeyboardArrowUpIcon className="mr-[13px]" /> : <KeyboardArrowDownIcon className="mr-[13px]" />}
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            onClick={(e) => e.stopPropagation()} // ⛔ ใส่ไว้เพื่อตอนติ๊ก checkbox จะไม่ทำงาน onClick ของ <tr>
                                                            // onChange={(e) => {
                                                            //     let itemChange: any = checkedData?.find((item: any) => item?.id == row?.id);
                                                            //     itemChange.checked = e?.target?.checked;

                                                            //     if (e?.target?.checked == true) {
                                                            //         let itemPush: any = { id: itemChange?.id };
                                                            //         setselectedItem((pre: any) => [...pre, itemPush]);
                                                            //     } else if (e?.target?.checked == false) {
                                                            //         let newItem: any = selectedItem;
                                                            //         let findIDX: any = selectedItem?.findIndex((item: any) => item?.id == itemChange?.id);
                                                            //         if (findIDX !== -1 || findIDX) {
                                                            //             newItem?.splice(findIDX, 1);
                                                            //             setselectedItem((pre: any) => [...newItem]);
                                                            //         }
                                                            //     }

                                                            //     for (let index = 0; index < itemChange?.data?.length; index++) {
                                                            //         if (itemChange?.data[index]?.allocation_status?.id == 2) {
                                                            //             itemChange.data[index].checked = e?.target?.checked;

                                                            //             if (e?.target?.checked == true) {
                                                            //                 let itemPush: any = { id: itemChange?.data[index]?.id, parent: true };
                                                            //                 setselectedItem((pre: any) => [...pre, itemPush]);
                                                            //             } else if (e?.target?.checked == false) {
                                                            //                 let newItem: any = selectedItem;
                                                            //                 let findIDX: any = selectedItem?.findIndex((item: any) => item?.id == itemChange?.data[index]?.id && item?.parent == true);
                                                            //                 if (findIDX !== -1 || findIDX) {
                                                            //                     newItem?.splice(findIDX, 1);
                                                            //                     setselectedItem((pre: any) => [...newItem]);
                                                            //                 }
                                                            //             }
                                                            //         }
                                                            //     }
                                                            //     settk(!tk);

                                                            //     renderCheckedAll(e?.target?.checked, 'checkAll');
                                                            // }}

                                                            // เวลาที่เอา checkboxes ออกจนเหลือรายการเดียว ปุ่ม accept/reject เป็น disable กดไม่ได้ https://app.clickup.com/t/86eub6d9j
                                                            // onChange={(e) => {
                                                            //     const isChecked = e.target.checked;
                                                            //     // 1. หาข้อมูลที่ต้องการเปลี่ยน
                                                            //     let itemChange = checkedData?.find((item:any) => item?.id === row?.id);
                                                            //     if (!itemChange) return;

                                                            //     itemChange.checked = isChecked;

                                                            //     // เตรียมรายการที่จะ "เพิ่ม" หรือ "ลบ"
                                                            //     let idsToAdd = [];
                                                            //     let idsToRemove = [];

                                                            //     // เช็คตัว Parent เอง
                                                            //     if (isChecked) {
                                                            //         idsToAdd.push({ id: itemChange.id });
                                                            //     } else {
                                                            //         idsToRemove.push(itemChange.id);
                                                            //     }

                                                            //     // เช็คตัวลูกๆ ใน data
                                                            //     itemChange.data?.forEach((child:any) => {
                                                            //         if (child?.allocation_status?.id === 2) {
                                                            //             child.checked = isChecked;
                                                            //             if (isChecked) {
                                                            //                 idsToAdd.push({ id: child.id, parent: true });
                                                            //             } else {
                                                            //                 idsToRemove.push(child.id);
                                                            //             }
                                                            //         }
                                                            //     });

                                                            //     // 2. อัปเดต State ทีเดียว
                                                            //     setselectedItem((prev:any) => {
                                                            //         if (isChecked) {
                                                            //             // กรองตัวที่อาจจะมีอยู่แล้วออกก่อนกันซ้ำ แล้วค่อย Spread รวมกัน
                                                            //             const filteredPrev = prev.filter((p:any) => !idsToAdd.some(a => a.id === p.id));
                                                            //             return [...filteredPrev, ...idsToAdd];
                                                            //         } else {
                                                            //             // ลบทุก ID ที่อยู่ในรายการ idsToRemove
                                                            //             return prev.filter((p:any) => !idsToRemove.includes(p.id));
                                                            //         }
                                                            //     });

                                                            //     settk(!tk);
                                                            //     renderCheckedAll(isChecked, 'checkAll');
                                                            // }}


                                                            onChange={(e) => {
                                                                const checked = e?.target?.checked;

                                                                const itemChange = checkedData?.find(
                                                                    (item: any) => item?.id == row?.id
                                                                );

                                                                if (!itemChange) return;

                                                                itemChange.checked = checked;

                                                                // ===== PARENT =====
                                                                if (checked) {
                                                                    setselectedItem((prev: any) => [...prev, { id: itemChange.id }]);
                                                                } else {
                                                                    setselectedItem((prev: any) =>
                                                                        prev.filter((item: any) => item.id !== itemChange.id)
                                                                    );
                                                                }

                                                                // ===== CHILD =====
                                                                itemChange?.data?.forEach((child: any) => {
                                                                    if (child?.allocation_status?.id == 2) {
                                                                        child.checked = checked;

                                                                        if (checked) {
                                                                            setselectedItem((prev: any) => [
                                                                                ...prev,
                                                                                { id: child.id, parent: true }
                                                                            ]);
                                                                        } else {
                                                                            setselectedItem((prev: any) =>
                                                                                prev.filter((item: any) => !(item.id === child.id && item.parent === true))
                                                                            );
                                                                        }
                                                                    }
                                                                });

                                                                settk(prev => !prev);
                                                                renderCheckedAll(checked, 'checkAll');
                                                            }}


                                                            // 2 = shipper review
                                                            // 3 = accepted
                                                            // 4 = allowcated
                                                            // 5 = rejected

                                                            // disabled={tableData?.find((item: any) => item?.id == row?.id)?.data?.filter((searchitem: any) => searchitem?.allocation_status?.id == 2)?.length > 0 ? false : true}
                                                            // disabled={sortedDataTransform?.find((item: any) => item?.id == row?.id)?.data?.filter((searchitem: any) => searchitem?.allocation_status?.id == 2)?.length > 0 ? false : true}
                                                            disabled={sortedDataTransform?.find((item: any) => item?.id == row?.id)?.data?.filter((searchitem: any) => searchitem?.allocation_status?.id == 2 || searchitem?.allocation_status?.id == 3 || searchitem?.allocation_status?.id == 5)?.length > 0 ? false : true} // CR status accept / reject สามารถเปลี่ยนได้ แต่ถ้าเป็น status allocated ไม่ให้เปลี่ยนแล้ว https://app.clickup.com/t/86ev29x10
                                                            checked={checkedData?.find((item: any) => item?.id == row?.id)?.checked}
                                                            className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1] disabled:opacity-100 disabled:cursor-not-allowed "
                                                        />
                                                        <div className="text-[#06522E] font-bold">{'Total'}</div>
                                                    </div>
                                                </td>
                                            )}

                                            {columnVisibility?.status && (
                                                <td className="px-2 py-1 text-[#464255]">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {renderStatus(row?.data)}
                                                        {/* <div className="w-[160px] p-1 text-center rounded-[50px]" style={{background: row?.status ? row?.status?.color : '#FFF1CE'}}>{row?.status?.name}</div> */}
                                                    </div>
                                                </td>
                                            )}

                                            {columnVisibility?.gas_day && (
                                                <td className="px-2 py-1 text-[#464255]">
                                                    {/* v2.0.33 รูปแบบวันที่ gas day ต้องเปลี่ยนเป็น dd/mm/yyyy ให้เหมือนเมนูอื่นๆ https://app.clickup.com/t/86etetaxc */}
                                                    {/* <div className="font-bold">{row?.gas_day ? row?.gas_day : null}</div> */}
                                                    <div className="font-bold">{row?.gas_day ? toDayjs(row?.gas_day, 'YYYY-MM-DD').format("DD/MM/YYYY") : null}</div>
                                                </td>
                                            )}

                                            {columnVisibility?.shipper && (
                                                <td className="px-2 py-1 text-[#464255]" />
                                            )}

                                            {columnVisibility?.contract && (
                                                <td className="px-2 py-1 text-[#464255]" />
                                            )}

                                            {columnVisibility?.nompoint && (
                                                <td className="px-2 py-1 text-[#06522E]">
                                                    <div className="font-bold">{row?.point_text ? row?.point_text : null}</div>
                                                </td>
                                            )}

                                            {
                                                columnVisibility?.entryexit && row?.entry_exit ?
                                                    <td className="px-2 py-1 text-[#464255]">
                                                        <div className="flex items-center justify-center">
                                                            <div className="w-[120px] p-1 text-center rounded-[50px]" style={{ background: row?.entry_exit == "Exit" ? '#FFF3C8' : '#C8FED7' }}>{row?.entry_exit}</div>
                                                        </div>
                                                    </td>
                                                    : columnVisibility?.entryexit && !row?.entry_exit && <td className="px-2 py-1 text-[#464255]">
                                                        <div className="flex items-center justify-center">
                                                            <div className="w-[120px] p-1 text-center rounded-[50px]" >{``}</div>
                                                        </div>
                                                    </td>
                                            }

                                            {columnVisibility?.nominatedval && (
                                                <td className="px-2 py-1 text-[#06522E] text-right">
                                                    {/* <div className="font-bold">{row?.nomination_value ? formatNumberFourDecimal(row?.nomination_value) : null}</div> */}
                                                    <div className="font-bold">{row?.nomination_value !== null && row?.nomination_value !== undefined ? formatNumberFourDecimal(row?.nomination_value) : null}</div>
                                                </td>
                                            )}

                                            {columnVisibility?.system_allo && (
                                                <td className="px-2 py-1 text-[#06522E] text-right">
                                                    <div className="font-bold">{row?.system_allocation !== null && row?.system_allocation !== undefined ? formatNumberFourDecimal(row?.system_allocation) : null}</div>
                                                </td>
                                            )}

                                            {columnVisibility?.intraday_allo && (
                                                <td className="px-2 py-1 text-[#06522E] text-right">
                                                    <div className="font-bold">{row?.intraday_system !== null && row?.intraday_system !== undefined ? formatNumberFourDecimal(row?.intraday_system) : null}</div>
                                                </td>
                                            )}

                                            {columnVisibility?.previous_allo && (
                                                <td className="px-2 py-1 text-[#06522E] text-right">
                                                    <div className="font-bold">{row?.previous_allocation_tpa_for_review !== null && row?.previous_allocation_tpa_for_review !== undefined ? formatNumberFourDecimal(row?.previous_allocation_tpa_for_review) : null}</div>
                                                </td>
                                            )}

                                            {columnVisibility?.shipper_allo && (
                                                <td className={`px-2 py-1  ${formatNumberFourDecimal(row?.shipper_allocation_review) !== formatNumberFourDecimal(row?.metering_value) ? 'text-[#ED1B24]' : 'text-[#06522E]'} text-right`}>
                                                    <div className="font-bold">{row?.shipper_allocation_review !== null && row?.shipper_allocation_review !== undefined ? formatNumberFourDecimal(row?.shipper_allocation_review) : null}</div>
                                                </td>
                                            )}


                                            {/* List : Column Metering Value จะต้องขึ้นเฉพาะที่ Row เขียว ความเป็นจริงจะไม่สามารถขึ้นตามรายสัญญาได้ มันต้องขึ้นตามราย Nom Point (ตอนนี้ค่ามันเบิ้ล) เช่น ถ้าค่า Meter มา 1000 มันต้องแสดงแค่ 1000 ตอนนี้มันแสดงเป็น 2000 https://app.clickup.com/t/86eub6dgd */}
                                            {columnVisibility?.metering_allo && (
                                                <td className={`px-2 py-1  ${formatNumberFourDecimal(row?.shipper_allocation_review) !== formatNumberFourDecimal(row?.metering_value) ? 'text-[#ED1B24]' : 'text-[#06522E]'} text-right`}>
                                                    <div className="font-bold">{row?.metering_value !== null && row?.metering_value !== undefined ? formatNumberFourDecimal(row?.metering_value) : ''}</div>
                                                </td>
                                            )}

                                            {columnVisibility?.review && (
                                                <td className="px-2 py-1 text-[#464255]" />
                                            )}

                                            {columnVisibility?.comment && (
                                                <td className="px-2 py-1 text-[#464255]" />
                                            )}

                                            {columnVisibility?.action && (
                                                <td className="px-2 py-1 text-[#464255]" />
                                            )}
                                        </tr>

                                        {/* EXPAND */}
                                        {toggleData?.find((item: any) => item?.id == row?.id)?.toggle == true && row?.data?.length > 0 && genManoStatus(row?.data)?.map((item: any, key: any) => {
                                            let thisCheckItem: any = checkedData?.find((item: any) => item?.id == row?.id);

                                            return (
                                                <tr
                                                    key={'sub-' + key + row?.id}
                                                    className={`${table_row_style}`}
                                                >
                                                    {columnVisibility?.total && (
                                                        <td className="px-2 py-1 text-[#464255]">
                                                            <div className="flex gap-2 justify-center items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    onChange={(e) => {
                                                                        let itemChange: any = thisCheckItem?.data?.find((f: any) => f?.id == item?.id);
                                                                        itemChange.checked = e?.target?.checked;
                                                                        settk(!tk);

                                                                        // 2 = shipper review
                                                                        // 3 = accepted
                                                                        // 4 = allowcated
                                                                        // 5 = rejected

                                                                        // let countData: any = thisCheckItem?.data?.filter((f: any) => f?.allocation_status?.id == 2)?.length;
                                                                        let countData: any = thisCheckItem?.data?.filter((f: any) => f?.allocation_status?.id == 2 || f?.allocation_status?.id == 3 || f?.allocation_status?.id == 5)?.length;
                                                                        let countChecked: any = 0;

                                                                        if (e?.target?.checked == true) {
                                                                            let itemPush: any = { id: itemChange?.id, parent: true };
                                                                            setselectedItem((pre: any) => [...pre, itemPush]);

                                                                            let checkParent: any = selectedItem?.find((item: any) => item?.id == thisCheckItem?.id);
                                                                            if (!checkParent) {
                                                                                let itempushParent: any = { id: thisCheckItem?.id };
                                                                                setselectedItem((pre: any) => [...pre, itempushParent]);
                                                                            }
                                                                        } else if (e?.target?.checked == false) {
                                                                            let newItem: any = selectedItem;
                                                                            let findIDX: any = selectedItem?.findIndex((item: any) => item?.id == itemChange?.id && item?.parent == true);

                                                                            if (findIDX !== -1 || findIDX) {
                                                                                newItem?.splice(findIDX, 1);
                                                                                setselectedItem((pre: any) => [...newItem]);
                                                                            }
                                                                        }

                                                                        for (let index = 0; index < thisCheckItem?.data?.length; index++) {
                                                                            if (thisCheckItem?.checked == true) {
                                                                                // if (thisCheckItem?.data[index]?.allocation_status?.id == 2 && thisCheckItem?.data[index]?.checked == false) {
                                                                                if ((thisCheckItem?.data[index]?.allocation_status?.id == 2 || thisCheckItem?.data[index]?.allocation_status?.id == 3 || thisCheckItem?.data[index]?.allocation_status?.id == 5) && thisCheckItem?.data[index]?.checked == false) {
                                                                                    countChecked = countChecked + 1;
                                                                                }
                                                                            } else if (thisCheckItem?.checked == false) {
                                                                                // if (thisCheckItem?.data[index]?.allocation_status?.id == 2 && thisCheckItem?.data[index]?.checked == true) {
                                                                                if ((thisCheckItem?.data[index]?.allocation_status?.id == 2 || thisCheckItem?.data[index]?.allocation_status?.id == 3 || thisCheckItem?.data[index]?.allocation_status?.id == 5) && thisCheckItem?.data[index]?.checked == true) {
                                                                                    countChecked = countChecked + 1;
                                                                                }
                                                                            }
                                                                        }

                                                                        if (thisCheckItem?.checked == true) {
                                                                            thisCheckItem.checked = !thisCheckItem?.checked;
                                                                            let findIDX_MAIN: any = selectedItem?.findIndex((item: any) => item?.id == thisCheckItem?.id);

                                                                            if (findIDX_MAIN !== -1 || findIDX_MAIN) {
                                                                                let newItem: any = selectedItem;
                                                                                newItem?.splice(findIDX_MAIN, 1);
                                                                                setselectedItem((pre: any) => [...newItem]);
                                                                            }
                                                                        } else if (thisCheckItem?.checked == false) {
                                                                            if (countChecked == countData) {
                                                                                thisCheckItem.checked = !thisCheckItem?.checked
                                                                            }
                                                                        }

                                                                        settk(!tk);
                                                                        renderCheckedAll(e?.target?.checked, 'checkAll');
                                                                    }}

                                                                    // 2 = shipper review
                                                                    // 3 = accepted
                                                                    // 4 = allowcated
                                                                    // 5 = rejected

                                                                    // disabled={item?.allocation_status?.id !== 2 ? true : false}
                                                                    disabled={(item?.allocation_status?.id == 2 || item?.allocation_status?.id == 3 || item?.allocation_status?.id == 5) ? false : true} // status accept / reject สามารถเปลี่ยนได้ แต่ถ้าเป็น status allocated ไม่ให้เปลี่ยนแล้ว https://app.clickup.com/t/86ev29x10
                                                                    // disabled={false}
                                                                    checked={thisCheckItem?.data?.find((f: any) => f?.id == item?.id)?.checked}
                                                                    className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1] disabled:opacity-100 disabled:cursor-not-allowed "
                                                                />
                                                            </div>
                                                        </td>
                                                    )}

                                                    {columnVisibility?.status && (
                                                        <td className="px-2 py-1 text-[#464255]">
                                                            <div className="flex items-center justify-center">
                                                                <div className="w-[160px] p-1 text-center rounded-[50px]" style={{ background: item?.allocation_status ? item?.allocation_status?.color : '#FFF1CE' }}>{item?.allocation_status && item?.allocation_status?.name}</div>
                                                            </div>
                                                        </td>
                                                    )}

                                                    {columnVisibility?.gas_day && (
                                                        <td className="px-2 py-1 text-[#464255]">
                                                            {/* <div>{item?.gas_day ? item?.gas_day : ''}</div> */}
                                                            <div>{item?.gas_day ? toDayjs(item?.gas_day, 'YYYY-MM-DD').format("DD/MM/YYYY") : ''}</div>
                                                        </td>
                                                    )}

                                                    {columnVisibility?.shipper && (
                                                        <td className="px-2 py-1 text-[#464255]">
                                                            {/* <div>{item?.shipper_name_text ? item?.shipper_name_text : null}</div> */}
                                                            <div>{item?.group ? item?.group?.name : null}</div>
                                                        </td>
                                                    )}

                                                    {columnVisibility?.contract && (
                                                        <td className="px-2 py-1 text-[#464255] text-center">
                                                            {/* <div>{item?.contract_code ? item?.contract_code?.contract_code : null}</div> */}
                                                            {/* <div>{item?.contract_code_text ? item?.contract_code_text : null}</div> */}
                                                            <div>{item?.contract ? item?.contract : null}</div>
                                                        </td>
                                                    )}

                                                    {columnVisibility?.nompoint && (
                                                        <td className="px-2 py-1 text-[#464255]">
                                                            {/* <div>{item?.evidenUse ? item?.evidenUse?.data.point : null}</div> */}
                                                            {/* <div>{item?.point_text ? item?.point_text : null}</div> */}
                                                            <div>{item?.point ? item?.point : null}</div>
                                                        </td>
                                                    )}

                                                    {
                                                        columnVisibility?.entryexit && item?.entry_exit_obj ?
                                                            <td className="px-2 py-1 text-[#464255]">
                                                                <div className="flex items-center justify-center">
                                                                    <div className="w-[120px] p-1 text-center rounded-[50px]" style={{ background: item?.entry_exit_obj ? item?.entry_exit_obj?.color : '#FFF1CE' }}>{item?.entry_exit_obj && item?.entry_exit_obj?.name}</div>
                                                                </div>
                                                            </td>
                                                            : columnVisibility?.entryexit && !item?.entry_exit_obj && <td className="px-2 py-1 text-[#464255]">
                                                                <div className="flex items-center justify-center">
                                                                    <div className="w-[120px] p-1 text-center rounded-[50px]" >{``}</div>
                                                                </div>
                                                            </td>
                                                    }


                                                    {columnVisibility?.nominatedval && (
                                                        <td className="px-2 py-1 text-[#464255]">
                                                            {/* <div className="text-right">{item?.nominationValue !== null && item?.nominationValue !== undefined ? formatNumberFourDecimal(item?.nominationValue) : ''}</div> */}
                                                            {/* <div className="text-right">{item?.nominationValue !== null && item?.nominationValue !== undefined ? formatNumberFourDecimal(item?.nominationValue) : ''}</div> */}
                                                            <div className="text-right">{item?.nominationValue !== null && item?.nominationValue !== undefined ? formatNumberFourDecimal(Number(String(item?.nominationValue).replace(/,/g, '').trim())) : ''}</div>

                                                        </td>
                                                    )}

                                                    {columnVisibility?.system_allo && (
                                                        <td className="px-2 py-1 text-[#464255]">
                                                            <div className="text-right">{item?.systemAllocation !== null && item?.systemAllocation !== undefined ? formatNumberFourDecimal(item?.systemAllocation) : ''}</div>
                                                        </td>
                                                    )}

                                                    {columnVisibility?.intraday_allo && (
                                                        <td className="px-2 py-1 text-[#464255]">
                                                            <div className="text-right">{item?.intradaySystem !== null && item?.intradaySystem !== undefined ? formatNumberFourDecimal(item?.intradaySystem) : ''}</div>
                                                        </td>
                                                    )}

                                                    {columnVisibility?.previous_allo && (
                                                        <td className="px-2 py-1 text-[#464255]">
                                                            <div className="text-right">{item?.previousAllocationTPAforReview !== null && item?.previousAllocationTPAforReview !== undefined ? formatNumberFourDecimal(item?.previousAllocationTPAforReview) : ''}</div>
                                                        </td>
                                                    )}

                                                    {columnVisibility?.shipper_allo && (
                                                        <td className="px-2 py-1 text-[#464255]">
                                                            {/* <div className="text-right">{item?.shipperAllocationReview ? formatNumberFourDecimal(item?.shipperAllocationReview) : ''}</div> */}
                                                            <div className="text-right">{item?.allocation_management_shipper_review !== null && item?.allocation_management_shipper_review !== undefined ? formatNumberFourDecimal(item?.allocation_management_shipper_review?.[0]?.shipper_allocation_review) : ''}</div>
                                                        </td>
                                                    )}


                                                    {/* List : Column Metering Value จะต้องขึ้นเฉพาะที่ Row เขียว ความเป็นจริงจะไม่สามารถขึ้นตามรายสัญญาได้ มันต้องขึ้นตามราย Nom Point (ตอนนี้ค่ามันเบิ้ล) เช่น ถ้าค่า Meter มา 1000 มันต้องแสดงแค่ 1000 ตอนนี้มันแสดงเป็น 2000 https://app.clickup.com/t/86eub6dgd */}
                                                    {columnVisibility?.metering_allo && (
                                                        <td className="px-2 py-1 text-[#464255]">
                                                            {/* <div className="text-right">{item?.meteringValue ? formatNumberFourDecimal(item?.meteringValue) : ''}</div> */}
                                                            <div className="text-right"> </div>
                                                        </td>
                                                    )}

                                                    {columnVisibility?.review && (
                                                        <td className="px-2 py-1 text-[#464255]">
                                                            <div>{item?.review_code ? item?.review_code : null}</div>
                                                        </td>
                                                    )}

                                                    {columnVisibility?.comment && (
                                                        <td className="px-2 py-1 text-[#464255] text-center">
                                                            <div className="inline-flex items-center justify-center relative">
                                                                {/* <button
                                                                    type="button"
                                                                    className="flex items-center justify-center px-[2px] py-[2px] bg-white rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                                                                    // onClick={() => openReasonModal()}
                                                                    onClick={() => openReasonModal(item?.id, item?.allocation_management_comment, item)}
                                                                >
                                                                    <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                                                                </button> */}

                                                                <button
                                                                    type="button"
                                                                    className={iconButtonClass}
                                                                    onClick={() => openReasonModal(item?.id, item?.allocation_management_comment, item)}
                                                                >
                                                                    <ChatBubbleOutlineOutlinedIcon
                                                                        fontSize="inherit"
                                                                        className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                                                        sx={{ color: 'currentColor', fontSize: 18 }}
                                                                    />
                                                                </button>

                                                                <span className="px-2 text-[#464255]">
                                                                    {item?.allocation_management_comment ? item?.allocation_management_comment?.length : null}
                                                                </span>
                                                            </div>
                                                            {/* <div>{item?.comment ? item?.comment?.length : null}</div> */}
                                                        </td>
                                                    )}

                                                    {columnVisibility?.action && (
                                                        <td className="px-2 py-1">
                                                            {/* <div className="relative inline-block text-left "> */}
                                                            <div className="relative inline-flex justify-center items-center w-full">
                                                                <BtnActionTable togglePopover={togglePopover} row_id={item?.id} />
                                                                {openPopoverId === item?.id && (
                                                                    <div ref={popoverRef}
                                                                        className="absolute left-[-9rem] top-[-10px] mt-2 w-36 bg-white border border-gray-300 rounded-lg shadow-lg z-0">
                                                                        <ul className="py-2">
                                                                            {
                                                                                <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("history", item?.id) }}><RestoreOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`History`}</li>
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
                                    </>
                                )
                            })}
                        </tbody>
                    </table>
                    :
                    <TableSkeleton />
            }
        </div>
    )
}

export default TableAlloManage;