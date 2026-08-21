import { useEffect } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import NodataTable from "@/components/other/nodataTable";
import { ContractRowWhite } from "./rowWhiteComponent";
import { ContractRowBlue } from "./rowBlueComponent";
import { ContractRowYellow } from "./rowYellowComponent";
import getUserValue from "@/utils/getuserValue";
import Spinloading from "@/components/other/spinLoading";
import { handleSort, handleSortIntraBalReportRowWhite } from "@/utils/sortTable";

const TableMain: React.FC<any> = ({ tableData, columnVisibility, initialColumns, isLoading, userPermission, showTotal, showTotalAllShipper, isBothFalse, shipperGroupData, setCheckPublic }) => {
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState<any>([]);
    const userDT: any = getUserValue();

    const [spinLoading, setspinLoading] = useState(false);

    useEffect(() => {
        if (tableData?.length > 0) {
            setSortedData(tableData)
        } else {
            setSortedData([])
        }
    }, [tableData]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    // เอาไว้ span column แบบ dynamic เคสเปิด ปิดไส้ใน
    // const getVisibleChildCount = (parentKey: string) => initialColumns?.filter((col: any) => col.parent_id === parentKey && columnVisibility[col.key]).length || 1;
    const getVisibleChildCount = (parentKey: string) => initialColumns?.filter((col: any) => col.parent_id === parentKey && columnVisibility[col.key]).length || 0;

    const getVisibleChildCountMultiLevel = (parentKey: string): number => {
        const children = initialColumns?.filter((col: any) => col.parent_id === parentKey);

        // ถ้าไม่มีลูก: เป็น leaf → เช็คว่า visible ไหม
        if (children.length === 0) {
            return columnVisibility[parentKey] ? 1 : 0;
        }

        // มีลูก: ไปดูลูกของลูกแบบ recursive แล้วรวม count ของลูกที่มองเห็น
        let count = 0;
        for (const child of children) {
            count += getVisibleChildCountMultiLevel(child.key);
        }

        return count;
    };

    const collator = new Intl.Collator(undefined, { sensitivity: 'base' });
    // --- cache ค่า key ล่วงหน้า (ทำครั้งเดียว) ---
    const preIndexed: any = tableData.map((item: any) => ({
        item,
        // topKey: item.shipperData?.[0]?.shipper ?? '',
        // subKeys: (item.shipperData ?? []).map((s: any) => s.shipper)
        topKey: item.shipperData?.[0]?.shipperName ?? '',
        subKeys: (item.shipperData ?? []).map((s: any) => s.shipperName)
    }));

    const beforeSort = (
        column: string,
        sortState: any,
        setSortState: any,
        setSortedData: any,
        tableData: any[]
    ) => {
        setspinLoading(true);
        if (column == 'execute_timestamp') {

            setTimeout(() => {
                handleSort(column, sortState, setSortState, setSortedData, tableData)

                setTimeout(() => {
                    setspinLoading(false);
                }, 500);
            }, 500);
        } else if(column == "gas_hour"){
            setTimeout(() => {
                handleSort(column, sortState, setSortState, setSortedData, tableData)

                setTimeout(() => {
                    setspinLoading(false);
                }, 500);
            }, 500);

        }else {
            // setTimeout(() => {
            //     handleSortBalanceReport(column, sortState, setSortState, setSortedData, tableData)
            // }, 500); // เดิม 1000

            handleSortIntraBalReportRowWhite(column, sortState, setSortState, setSortedData, tableData)

            setTimeout(() => {
                setspinLoading(false);
            }, 300);
        }
    }

    const handleSortBalanceReport = (
        column: string,
        sortState: any,
        setSortState: any,
        setSortedData: any,
        tableData: any[]
    ) => {

        let dir: 'asc' | 'desc' | null =
            sortState.column === column
                ? sortState.direction === 'asc'
                    ? 'desc'
                    : sortState.direction === 'desc'
                        ? null
                        : 'asc'
                : 'asc';

        setSortState({ column, direction: dir });

        // if (!dir) return setSortedData(preIndexed.map((i: any) => i.item));
        if (!dir) {
            setTimeout(() => {
                setspinLoading(false);
            }, 300); // เดิม 1000
            return setSortedData(preIndexed.map((i: any) => i.item));
        }

        const asc = dir === 'asc';

        // --- sort top level (ใช้ key ที่คำนวณไว้แล้ว + collator) ---
        const topSorted = [...preIndexed].sort((a, b) =>
            asc ? collator.compare(a.topKey, b.topKey) : collator.compare(b.topKey, a.topKey)
        );

        // --- sort shipperData ของแต่ละแถว (ใช้ key list ที่ cache ไว้) ---
        const sorted = topSorted.map(({ item, subKeys }) => {
            // zip shipperData กับ key เพื่อไม่ต้องหาใหม่ใน comparator
            const paired = subKeys.map((k: any, i: any) => [k, item.shipperData[i]]);
            paired.sort((a: any, b: any) => (asc ? collator.compare(a[0], b[0]) : collator.compare(b[0], a[0])));
            return { ...item, shipperData: paired.map((p: any) => p[1]) };
        });

        setTimeout(() => {
            setspinLoading(false);
        }, 300); // เดิม 1000
        setSortedData(sorted);
    };

    useEffect(() => {
      console.log('sortedData : ', sortedData);
    }, [sortedData])
    

    return (
        <div className={`relative h-[calc(100vh-280px)] overflow-hidden`} >
            <Spinloading spin={spinLoading} rounded={5} /> {/* loading example here */}


            {/* <div className={`relative h-[calc(100vh-200px)] overflow-y-auto block  rounded-t-md z-1`}> */}
            <div className={`relative h-full overflow-y-auto block  rounded-t-md z-1`}>
                {
                    isLoading ?
                        <table className="w-full text-sm text-left rtl:text-right text-gray-500">

                            <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                                <tr className="h-9">

                                    {columnVisibility.publicate && userDT?.account_manage?.[0]?.user_type_id !== 3 && userDT?.account_manage?.[0]?.user_type_id !== 4 && (
                                        <th
                                            className={`${table_header_style} text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={4} scope="col"
                                        >
                                            {`Publicate`}
                                        </th>
                                    )}

                                    {columnVisibility.gas_day && (
                                        <th
                                            className={`${table_header_style} text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={4} scope="col"
                                        // onClick={() => beforeSort("shipperData.contractData.valueContractPlanning.gas_day", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`Gas Day`}
                                            {/* {getArrowIcon("shipperData.contractData.valueContractPlanning.gas_day")} */}
                                        </th>
                                    )}

                                    {columnVisibility.gas_hour && (
                                        <th
                                            className={`${table_sort_header_style} text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                            rowSpan={4} 
                                            scope="col"// onClick={() => beforeSort("shipperData.contractData.valueContractPlanning.gas_hour", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => beforeSort( 
                                                    "gas_hour", sortState, setSortState, setSortedData, tableData
                                                )}
                                            
                                        >
                                            {`Gas Hour`}
                                            {getArrowIcon("gas_hour")}
                                        </th>
                                    )}

                                    {columnVisibility.timestamp && (
                                        <th
                                            className={`${table_sort_header_style} text-center min-w-[150px] w-[170px] max-w-[200px]`}
                                            rowSpan={4} 
                                            scope="col"
                                              onClick={() => beforeSort( 
                                                    "execute_timestamp", sortState, setSortState, setSortedData, tableData
                                                )}
                                        >
                                            {`Timestamp`}
                                            {getArrowIcon("execute_timestamp")}
                                        </th>
                                    )}

                                    {columnVisibility.summary_pane && (
                                        <th
                                            className={`${table_header_style} bg-[#DEA477] text-center`}
                                            // colSpan={49} // original
                                            // colSpan={51} 
                                            colSpan={getVisibleChildCountMultiLevel("summary_pane")}
                                            scope="col"
                                        >
                                            {`Summary Pane`}
                                        </th>
                                    )}

                                    {columnVisibility.detail_pane && (
                                        <th
                                            className={`${table_header_style} bg-[#6EA48D] text-center`}
                                            // colSpan={25} 
                                            colSpan={getVisibleChildCountMultiLevel("detail_pane")}
                                            scope="col"
                                        >
                                            {`Detail Pane`}
                                        </th>
                                    )}
                                </tr>


                                <tr className="h-9">
                                    {columnVisibility.summary_pane && (<>
                                        {columnVisibility.shipper_name && (
                                            <th
                                                className={`${table_header_style} min-w-[170px] w-[190px] max-w-[200px]`}
                                                rowSpan={3} scope="col"
                                            // onClick={() => beforeSort(
                                            //     // "shipperData.shipper", sortState, setSortState, setSortedData, tableData
                                            //     "shipperData.shipperName", sortState, setSortState, setSortedData, tableData
                                            // )}
                                            >
                                                {`Shipper Name`}
                                                {/* {getArrowIcon("shipperData.shipperName")} */}
                                            </th>
                                        )}

                                        {columnVisibility.plan_actual && (
                                            <th
                                                className={`${table_header_style} min-w-[170px] w-[190px] max-w-[200px]`} rowSpan={3} scope="col"
                                            >
                                                {`Plan / Actual`}
                                            </th>
                                        )}

                                        {columnVisibility.contract_code && (
                                            <th
                                                className={`${table_header_style} min-w-[120px] w-[130px]`}
                                                rowSpan={3} scope="col"
                                            // onClick={() => handleSort("contract_code", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.contract", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`Contract Code`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.contract")}
                                            </th>
                                        )}

                                        {columnVisibility.total_entry_mmbtud && (
                                            <th
                                                className={`${table_header_style} text-center`}
                                                rowSpan={1}
                                                scope="col"
                                                // colSpan={3}
                                                colSpan={getVisibleChildCount("total_entry_mmbtud")}
                                            >
                                                {`Total Entry (MMBTU/D)`}
                                            </th>
                                        )}

                                        {columnVisibility.total_exit_mmbtud && (
                                            <th
                                                className={`${table_header_style} text-center`}
                                                rowSpan={1}
                                                scope="col"
                                                // colSpan={3}
                                                colSpan={getVisibleChildCount("total_exit_mmbtud")}
                                            >
                                                {`Total Exit (MMBTU/D)`}
                                            </th>
                                        )}

                                        {columnVisibility.imbalance_zone_mmbtud && (
                                            <th
                                                className={`${table_header_style} text-center`}
                                                rowSpan={1}
                                                scope="col"
                                                // colSpan={3}
                                                colSpan={getVisibleChildCount("imbalance_zone_mmbtud")}
                                            >
                                                {`Imbalance Zone (MMBTU/D)`}
                                            </th>
                                        )}

                                        {columnVisibility.instructed_flow_mmbtud && (
                                            <th
                                                className={`${table_header_style} text-center`}
                                                rowSpan={1}
                                                scope="col"
                                                // colSpan={3}
                                                colSpan={getVisibleChildCount("instructed_flow_mmbtud")}
                                            >
                                                {`Instructed Flow (MMBTU/D)`}
                                            </th>
                                        )}

                                        {columnVisibility.shrinkage_volume_mmbtud && (
                                            <th
                                                className={`${table_header_style} text-center`}
                                                rowSpan={1}
                                                scope="col"
                                                // colSpan={2}
                                                colSpan={getVisibleChildCount("shrinkage_volume_mmbtud")}
                                            >
                                                {`Shrinkage Volume (MMBTU/D)`}
                                            </th>
                                        )}

                                        {columnVisibility.park_mmbtud && (
                                            <th
                                                className={`${table_header_style} text-center`}
                                                rowSpan={1}
                                                scope="col"
                                                // colSpan={2}
                                                colSpan={getVisibleChildCount("park_mmbtud")}
                                            >
                                                {`Park (MMBTU/D)`}
                                            </th>
                                        )}

                                        {columnVisibility.unpark_mmbtud && (
                                            <th
                                                className={`${table_header_style} text-center`}
                                                rowSpan={1}
                                                scope="col"
                                                // colSpan={2}
                                                colSpan={getVisibleChildCount("unpark_mmbtud")}
                                            >
                                                {`Unpark (MMBTU/D)`}
                                            </th>
                                        )}

                                        {columnVisibility.sod_park_mmbtud && (
                                            <th
                                                className={`${table_header_style} text-center`}
                                                rowSpan={1}
                                                scope="col"
                                                // colSpan={2}
                                                colSpan={getVisibleChildCount("sod_park_mmbtud")}
                                            >
                                                {`SOD Park (MMBTU/D)`}
                                            </th>
                                        )}

                                        {columnVisibility.eod_park_mmbtud && (
                                            <th
                                                className={`${table_header_style} text-center`}
                                                rowSpan={1}
                                                scope="col"
                                                // colSpan={2}
                                                colSpan={getVisibleChildCount("eod_park_mmbtud")}
                                            >
                                                {`EOD Park (MMBTU/D)`}
                                            </th>
                                        )}

                                        {columnVisibility.min_inventory_change_mmbtud && (
                                            <th
                                                className={`${table_header_style} text-center`}
                                                rowSpan={1}
                                                scope="col"
                                                // colSpan={2}
                                                colSpan={getVisibleChildCount("min_inventory_change_mmbtud")}
                                            >
                                                {`Change Min Inventory (MMBTU/D)`}
                                            </th>
                                        )}

                                        {columnVisibility.reserve_bal_mmbtud && (
                                            <th
                                                className={`${table_header_style} text-center`}
                                                rowSpan={1}
                                                scope="col"
                                                // colSpan={2}
                                                colSpan={getVisibleChildCount("reserve_bal_mmbtud")}
                                            >
                                                {`Reserve Bal. (MMBTU/D)`}
                                            </th>
                                        )}

                                        {columnVisibility.adjust_imbalance_mmbtud && (
                                            <th
                                                className={`${table_header_style} text-center`}
                                                rowSpan={1}
                                                scope="col"
                                                // colSpan={2}
                                                colSpan={getVisibleChildCount("adjust_imbalance_mmbtud")}
                                            >
                                                {`Adjust Imbalance (MMBTU/D)`}
                                            </th>
                                        )}

                                        {columnVisibility.vent_gas && (
                                            <th
                                                className={`${table_header_style} text-center`}
                                                rowSpan={1}
                                                scope="col"
                                                // colSpan={2}
                                                colSpan={getVisibleChildCount("vent_gas")}
                                            >
                                                {`Vent Gas`}
                                            </th>
                                        )}

                                        {columnVisibility.commissioning_gas && (
                                            <th
                                                className={`${table_header_style} text-center`}
                                                rowSpan={1}
                                                scope="col"
                                                // colSpan={2}
                                                colSpan={getVisibleChildCount("commissioning_gas")}
                                            >
                                                {`Commissioning Gas`}
                                            </th>
                                        )}

                                        {columnVisibility.other_gas && (
                                            <th
                                                className={`${table_header_style} text-center`}
                                                rowSpan={1}
                                                scope="col"
                                                // colSpan={2}
                                                colSpan={getVisibleChildCount("other_gas")}
                                            >
                                                {`Other Gas`}
                                            </th>
                                        )}

                                        {columnVisibility.daily_imb_mmbtud && (
                                            <th
                                                className={`${table_header_style} text-center`}
                                                rowSpan={1}
                                                scope="col"
                                                // colSpan={2}
                                                colSpan={getVisibleChildCount("daily_imb_mmbtud")}
                                            >
                                                {`Daily IMB (MMBTU/D)`}
                                            </th>
                                        )}

                                        {columnVisibility.aip_mmbtud && (
                                            <th
                                                className={`${table_header_style} text-center`}
                                                rowSpan={1}
                                                scope="col"
                                                // colSpan={1}
                                                colSpan={getVisibleChildCount("aip_mmbtud")}
                                            >
                                                {`AIP (MMBTU/D)`}
                                            </th>
                                        )}

                                        {columnVisibility.ain_mmbtud && (
                                            <th
                                                className={`${table_header_style} text-center`}
                                                rowSpan={1}
                                                scope="col"
                                                // colSpan={1}
                                                colSpan={getVisibleChildCount("ain_mmbtud")}
                                            >
                                                {`AIN (MMBTU/D)`}
                                            </th>
                                        )}

                                        {columnVisibility.percentage_imb && (
                                            <th
                                                className={`${table_header_style} text-center`}
                                                rowSpan={1}
                                                scope="col"
                                                // colSpan={1}
                                                colSpan={getVisibleChildCount("percentage_imb")}
                                            >
                                                {`%Imb`}
                                            </th>
                                        )}

                                        {columnVisibility.percentage_abslmb && (
                                            <th
                                                className={`${table_header_style} text-center`}
                                                rowSpan={1}
                                                scope="col"
                                                // colSpan={1}
                                                colSpan={getVisibleChildCount("percentage_abslmb")}
                                            >
                                                {`%Abslmb`}
                                            </th>
                                        )}

                                        {columnVisibility.acc_imb_month_mmbtud && (
                                            <th
                                                className={`${table_header_style} text-center`}
                                                rowSpan={1}
                                                scope="col"
                                                // colSpan={2}
                                                colSpan={getVisibleChildCount("acc_imb_month_mmbtud")}
                                            >
                                                {`Acc. IMB. (MONTH) (MMBTU/D)`}
                                            </th>
                                        )}

                                        {columnVisibility.acc_imb_mmbtud && (
                                            <th
                                                className={`${table_header_style} text-center`}
                                                rowSpan={1}
                                                scope="col"
                                                // colSpan={2}
                                                colSpan={getVisibleChildCount("acc_imb_mmbtud")}
                                            >
                                                {`Acc. IMB. (MMBTU/D)`}
                                            </th>
                                        )}


                                        {columnVisibility.acc_imb_inventory_mmbtud && (
                                            <th
                                                className={`${table_header_style} text-center`}
                                                rowSpan={1}
                                                scope="col"
                                                // colSpan={2}
                                                colSpan={getVisibleChildCount("acc_imb_inventory_mmbtud")}
                                            >
                                                {`Acc. IMB. Inventory (MMBTU/D)`}
                                            </th>
                                        )}

                                        {columnVisibility.min_inventory_mmbtud && (
                                            <th
                                                className={`${table_header_style} text-center`}
                                                rowSpan={1}
                                                scope="col"
                                                // colSpan={2}
                                                colSpan={getVisibleChildCount("min_inventory_mmbtud")}
                                            >
                                                {`Min. Inventory (MMBTU/D)`}
                                            </th>
                                        )}

                                    </>
                                    )}

                                    {columnVisibility.detail_pane && (
                                        <>
                                            {/* under detail pane */}
                                            {columnVisibility.entry && (
                                                <th
                                                    className={`${table_header_style} text-center bg-[#1AB9CF]`}
                                                    rowSpan={1}
                                                    scope="col"
                                                    // colSpan={12}
                                                    // colSpan={getVisibleChildCountMultiLevel("entry")}
                                                    colSpan={getVisibleChildCount("east_entry_detail_pane") + getVisibleChildCount("west_entry_detail_pane") + getVisibleChildCount("east_west_entry_detail_pane")}
                                                >
                                                    {`Entry`}
                                                </th>
                                            )}

                                            {/* under detail pane */}
                                            {columnVisibility.exit && (
                                                <th
                                                    className={`${table_header_style} text-center bg-[#3A8FB8]`}
                                                    rowSpan={1}
                                                    scope="col"
                                                    // colSpan={13}
                                                    // colSpan={getVisibleChildCountMultiLevel("exit")}
                                                    colSpan={getVisibleChildCount("east_exit_detail_pane") + getVisibleChildCount("west_exit_detail_pane") + getVisibleChildCount("east_west_exit_detail_pane") + getVisibleChildCount("f2_and_g") + getVisibleChildCount("e")}
                                                >
                                                    {`Exit`}
                                                </th>
                                            )}

                                        </>
                                    )}
                                </tr>

                                <tr className="h-9">

                                    {/* List : Column ย่อยพวก East / West / East-West ปรับจัดกลาง https://app.clickup.com/t/86etje74w */}
                                    {columnVisibility.summary_pane && (<>

                                        {/* ################################################################################################## */}
                                        {/* ########################## Under Summary Pane ---> Total Entry (MMBTU/D) ########################## */}
                                        {columnVisibility.east_total_entry_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style}  text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("East", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.total_entry_east", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`East`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.total_entry_east")}
                                            </th>
                                        )}

                                        {columnVisibility.west_total_entry_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("West", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.total_entry_west", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`West`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.total_entry_west")}
                                            </th>
                                        )}

                                        {columnVisibility.east_west_total_entry_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#C8FFD7] hover:bg-[#a6f5bf] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("east_west", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.total_entry_east-west", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`East-West`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.total_entry_east-west")}
                                            </th>
                                        )}


                                        {/* ################################################################################################## */}
                                        {/* ########################## Under Summary Pane ---> Total Exit (MMBTU/D) ########################## */}
                                        {columnVisibility.east_total_exit_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("East", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.total_exit_east", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`East`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.total_exit_east")}
                                            </th>
                                        )}

                                        {columnVisibility.west_total_exit_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("West", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.total_exit_west", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`West`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.total_exit_west")}
                                            </th>
                                        )}

                                        {columnVisibility.east_west_total_exit_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#C8FFD7] hover:bg-[#a6f5bf] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("east_west", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.total_exit_east-west", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`East-West`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.total_exit_east-west")}
                                            </th>
                                        )}


                                        {/* ################################################################################################## */}
                                        {/* ########################## Under Summary Pane ---> Imbalance Zone (MMBTU/D) ########################## */}
                                        {columnVisibility.east_imbalance_zone_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("East", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.imbZone_east", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`East`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.imbZone_east")}
                                            </th>
                                        )}

                                        {columnVisibility.west_imbalance_zone_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("West", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.imbZone_west", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`West`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.imbZone_west")}
                                            </th>
                                        )}

                                        {columnVisibility.total_imbalance_zone_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#F2F2F2] hover:bg-[#e0e0e0] text-right min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("total", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.imbZone_total", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`Total`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.imbZone_total")}
                                            </th>
                                        )}



                                        {/* ################################################################################################## */}
                                        {/* ########################## Under Summary Pane ---> Instructed flow (MMBTU) ########################## */}
                                        {columnVisibility.east_instructed_flow_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("East", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.InstructedFlow_east", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`East`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.InstructedFlow_east")}
                                            </th>
                                        )}

                                        {columnVisibility.west_instructed_flow_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("West", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.InstructedFlow_west", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`West`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.InstructedFlow_west")}
                                            </th>
                                        )}

                                        {columnVisibility.east_west_instructed_flow_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#C8FFD7] hover:bg-[#a6f5bf] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("east_west", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.InstructedFlow_westss", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`East-West`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.InstructedFlow_westss")}
                                            </th>
                                        )}


                                        {/* ################################################################################################## */}
                                        {/* ########################## Under Summary Pane ---> Shrinkage Volume (MMBTU/D) ########################## */}
                                        {columnVisibility.east_shrinkage_volume_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("East", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.shrinkage_east", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`East`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.shrinkage_east")}
                                            </th>
                                        )}

                                        {columnVisibility.west_shrinkage_volume_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("West", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.shrinkage_west", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`West`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.shrinkage_west")}
                                            </th>
                                        )}


                                        {/* ################################################################################################## */}
                                        {/* ########################## Under Summary Pane ---> Park (MMBTU/D) ########################## */}
                                        {columnVisibility.east_park_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("East", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.park_east", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`East`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.park_east")}
                                            </th>
                                        )}

                                        {columnVisibility.west_park_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("West", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.park_west", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`West`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.park_west")}
                                            </th>
                                        )}


                                        {/* ################################################################################################## */}
                                        {/* ########################## Under Summary Pane ---> Unpark (MMBTU/D) ########################## */}
                                        {columnVisibility.east_unpark_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("East", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.Unpark_east", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`East`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.Unpark_east")}
                                            </th>
                                        )}

                                        {columnVisibility.west_unpark_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                // colSpan={1} onClick={() => handleSort("West", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.Unpark_west", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`West`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.Unpark_west")}
                                            </th>
                                        )}


                                        {/* ################################################################################################## */}
                                        {/* ########################## Under Summary Pane ---> SOD Park (MMBTU/D) ########################## */}
                                        {columnVisibility.east_sod_park_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("East", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.SodPark_east", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`East`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.SodPark_east")}
                                            </th>
                                        )}

                                        {columnVisibility.west_sod_park_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("West", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.SodPark_west", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`West`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.SodPark_west")}
                                            </th>
                                        )}


                                        {/* ################################################################################################## */}
                                        {/* ########################## Under Summary Pane ---> EOD Park (MMBTU/D) ########################## */}
                                        {columnVisibility.east_eod_park_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("East", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.EodPark_east", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`East`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.EodPark_east")}
                                            </th>
                                        )}

                                        {columnVisibility.west_eod_park_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("West", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.EodPark_west", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`West`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.EodPark_west")}
                                            </th>
                                        )}


                                        {/* ################################################################################################## */}
                                        {/* ########################## Under Summary Pane ---> Min. Inventory Change (MMBTU/D) ########################## */}
                                        {columnVisibility.east_min_inventory_change_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("East", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.minInventoryChange_east", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`East`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.minInventoryChange_east")}
                                            </th>
                                        )}

                                        {columnVisibility.west_min_inventory_change_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("West", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.minInventoryChange_west", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`West`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.minInventoryChange_west")}
                                            </th>
                                        )}

                                        {/* ################################################################################################## */}
                                        {/* ########################## Under Summary Pane ---> Reserve Bal. (MMBTU/D) ########################## */}
                                        {columnVisibility.east_reserve_bal_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("East", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.reserveBal_east", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`East`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.reserveBal_east")}
                                            </th>
                                        )}

                                        {columnVisibility.west_reserve_bal_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("West", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.reserveBal_west", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`West`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.reserveBal_west")}
                                            </th>
                                        )}

                                        {/* ################################################################################################## */}
                                        {/* ########################## Under Summary Pane ---> Adjust Imbalance (MMBTU/D) ########################## */}
                                        {columnVisibility.east_adjust_imbalance_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("East", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.adjustDailyImb_east", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`East`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.adjustDailyImb_east")}
                                            </th>
                                        )}

                                        {columnVisibility.west_adjust_imbalance_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("West", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.adjustDailyImb_west", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`West`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.adjustDailyImb_west")}
                                            </th>
                                        )}


                                        {/* ################################################################################################## */}
                                        {/* ########################## Under Summary Pane ---> Vent Gas ########################## */}
                                        {columnVisibility.east_vent_gas && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("East", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.ventGas_east", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`East`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.ventGas_east")}
                                            </th>
                                        )}

                                        {columnVisibility.west_vent_gas && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("West", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.ventGas_west", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`West`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.ventGas_west")}
                                            </th>
                                        )}


                                        {/* ################################################################################################## */}
                                        {/* ########################## Under Summary Pane ---> Commissioning Gas ########################## */}
                                        {columnVisibility.east_commissioning_gas && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                // colSpan={1} onClick={() => handleSort("East", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.commissioningGas_east", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`East`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.commissioningGas_east")}
                                            </th>
                                        )}

                                        {columnVisibility.west_commissioning_gas && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("West", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.commissioningGas_west", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`West`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.commissioningGas_west")}
                                            </th>
                                        )}

                                        {/* ################################################################################################## */}
                                        {/* ########################## Under Summary Pane ---> Other Gas ########################## */}
                                        {columnVisibility.east_other_gas && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("East", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.otherGas_east", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`East`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.otherGas_east")}
                                            </th>
                                        )}

                                        {columnVisibility.west_other_gas && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("West", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.otherGas_west", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`West`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.otherGas_west")}
                                            </th>
                                        )}


                                        {/* ################################################################################################## */}
                                        {/* ########################## Under Summary Pane ---> Daily IMB (MMBTU/D) ########################## */}
                                        {columnVisibility.east_daily_imb_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("East", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.dailyImb_east", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`East`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.dailyImb_east")}
                                            </th>
                                        )}

                                        {columnVisibility.west_daily_imb_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("West", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.dailyImb_west", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`West`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.dailyImb_west")}
                                            </th>
                                        )}


                                        {/* ################################################################################################## */}
                                        {/* ########################## Under Summary Pane ---> AIP (MMBTU/D) ########################## */}
                                        {columnVisibility.total_aip_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#F2F2F2] hover:bg-[#e0e0e0] text-right min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("total", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.aip", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`Total`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.aip")}
                                            </th>
                                        )}

                                        {/* ################################################################################################## */}
                                        {/* ########################## Under Summary Pane ---> AIN (MMBTU/D) ########################## */}
                                        {columnVisibility.total_ain_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#F2F2F2] hover:bg-[#e0e0e0] text-right min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("total", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.ain", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`Total`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.ain")}
                                            </th>
                                        )}

                                        {/* ################################################################################################## */}
                                        {/* ########################## Under Summary Pane ---> % Imb ########################## */}
                                        {columnVisibility.total_percentage_imb && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#F2F2F2] hover:bg-[#e0e0e0] text-right min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("total", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.total_percentage_imb", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`Total`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.total_percentage_imb")}
                                            </th>
                                        )}

                                        {/* ################################################################################################## */}
                                        {/* ########################## Under Summary Pane ---> %Abslmb ########################## */}
                                        {columnVisibility.total_percentage_abslmb && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#F2F2F2] hover:bg-[#e0e0e0] text-right min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                // colSpan={1} 
                                                // onClick={() => handleSort("total", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.absimb", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`Total`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.absimb")}
                                            </th>
                                        )}

                                        {/* ################################################################################################## */}
                                        {/* ########################## Under Summary Pane ---> Acc. IMB. (MONTH) (MMBTU/D) ########################## */}
                                        {columnVisibility.east_acc_imb_month_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("East", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.accImbMonth_east", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`East`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.accImbMonth_east")}
                                            </th>
                                        )}

                                        {columnVisibility.west_acc_imb_month_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("West", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.accImbMonth_west", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`West`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.accImbMonth_west")}
                                            </th>
                                        )}


                                        {/* ################################################################################################## */}
                                        {/* ########################## Under Summary Pane ---> Acc. IMB. (MMBTU/D) ########################## */}
                                        {columnVisibility.east_acc_imb_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("East", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.accImb_east", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`East`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.accImb_east")}
                                            </th>
                                        )}

                                        {columnVisibility.west_acc_imb_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("West", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.accImb_west", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`West`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.accImb_west")}
                                            </th>
                                        )}


                                        {/* ################################################################################################## */}
                                        {/* ########################## Under Summary Pane ---> Acc. IMB. Inventory (MMBTU/D) ########################## */}
                                        {columnVisibility.east_acc_imb_inventory_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("East", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.accImbInv_east", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`East`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.accImbInv_east")}
                                            </th>
                                        )}

                                        {columnVisibility.west_acc_imb_inventory_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("West", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.accImbInv_west", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`West`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.accImbInv_west")}
                                            </th>
                                        )}


                                        {/* ################################################################################################## */}
                                        {/* ########################## Under Summary Pane ---> Min. Inventory (MMBTU) ########################## */}
                                        {columnVisibility.east_min_inventory_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("East", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.minInventory_east", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`East`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.minInventory_east")}
                                            </th>
                                        )}

                                        {columnVisibility.west_min_inventory_mmbtud && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`}
                                                rowSpan={2}
                                                scope="col"
                                                colSpan={1}
                                                // onClick={() => handleSort("West", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => beforeSort(
                                                    "shipperData.contractData.valueContractPlanning.minInventory_west", sortState, setSortState, setSortedData, tableData
                                                )}
                                            >
                                                {`West`}
                                                {getArrowIcon("shipperData.contractData.valueContractPlanning.minInventory_west")}
                                            </th>
                                        )}

                                    </>)}





                                    {columnVisibility.detail_pane && (
                                        <>
                                            {/* ################################################################################################## */}
                                            {/* ########################## Under Detail Pane ---> Entry ########################## */}
                                            {columnVisibility.east_entry_detail_pane && (
                                                <th
                                                    className={`${table_header_style} text-[#58585A] bg-[#DBE4FF] text-center`}
                                                    rowSpan={1}
                                                    scope="col"
                                                    // colSpan={4}
                                                    colSpan={getVisibleChildCount("east_entry_detail_pane")}
                                                >
                                                    {`East`}
                                                </th>
                                            )}

                                            {columnVisibility.west_entry_detail_pane && (
                                                <th
                                                    className={`${table_header_style} text-[#58585A] bg-[#FFCEE2] text-center`}
                                                    rowSpan={1}
                                                    scope="col"
                                                    // colSpan={4}
                                                    colSpan={getVisibleChildCount("west_entry_detail_pane")}
                                                >
                                                    {`West`}
                                                </th>
                                            )}

                                            {columnVisibility.east_west_entry_detail_pane && (
                                                <th
                                                    className={`${table_header_style} text-[#58585A] bg-[#C8FFD7] text-center`}
                                                    rowSpan={1}
                                                    scope="col"
                                                    // colSpan={4}
                                                    colSpan={getVisibleChildCount("east_west_entry_detail_pane")}
                                                >
                                                    {`East-West`}
                                                </th>
                                            )}


                                            {/* ################################################################################################## */}
                                            {/* ########################## Under Detail Pane ---> Exit ########################## */}
                                            {columnVisibility.east_exit_detail_pane && (
                                                <th
                                                    className={`${table_header_style} text-[#58585A] bg-[#DBE4FF] text-center`}
                                                    rowSpan={1}
                                                    scope="col"
                                                    // colSpan={3}
                                                    colSpan={getVisibleChildCount("east_exit_detail_pane")}
                                                >
                                                    {`East`}
                                                </th>
                                            )}

                                            {columnVisibility.west_exit_detail_pane && (
                                                <th
                                                    className={`${table_header_style} text-[#58585A] bg-[#FFCEE2] text-center`}
                                                    rowSpan={1}
                                                    scope="col"
                                                    // colSpan={3}
                                                    colSpan={getVisibleChildCount("west_exit_detail_pane")}
                                                >
                                                    {`West`}
                                                </th>
                                            )}

                                            {columnVisibility.east_west_exit_detail_pane && (
                                                <th
                                                    className={`${table_header_style} text-[#58585A] bg-[#C8FFD7] text-center`}
                                                    rowSpan={1}
                                                    scope="col"
                                                    // colSpan={3}
                                                    colSpan={getVisibleChildCount("east_west_exit_detail_pane")}
                                                >
                                                    {`East-West`}
                                                </th>
                                            )}

                                            {columnVisibility.f2_and_g && (
                                                <th
                                                    className={`${table_header_style} text-[#FFFFFF] bg-[#1473A1] text-center`}
                                                    rowSpan={1}
                                                    scope="col"
                                                    // colSpan={2}
                                                    colSpan={getVisibleChildCount("f2_and_g")}
                                                >
                                                    {`F2&G`}
                                                </th>
                                            )}

                                            {columnVisibility.e && (
                                                <th
                                                    className={`${table_header_style} text-[#FFFFFF] bg-[#1473A1] text-center`}
                                                    rowSpan={1}
                                                    scope="col"
                                                    // colSpan={2}
                                                    colSpan={getVisibleChildCount("e")}

                                                >
                                                    {`E`}
                                                </th>
                                            )}

                                        </>
                                    )}
                                </tr>

                                <tr className="h-9">
                                    {columnVisibility.detail_pane && (
                                        <>

                                            {/* ################################################################################################## */}
                                            {/* ########################## Under Detail Pane ---> Entry ---> East ########################## */}
                                            {columnVisibility.gsp && (
                                                <th
                                                    className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`}
                                                    rowSpan={1}
                                                    scope="col"
                                                    colSpan={1}
                                                    onClick={() => beforeSort(
                                                        "shipperData.contractData.valueContractPlanning.detail_entry_east_gsp", sortState, setSortState, setSortedData, tableData
                                                    )}
                                                >
                                                    {`GSP`}
                                                    {getArrowIcon("shipperData.contractData.valueContractPlanning.detail_entry_east_gsp")}
                                                </th>
                                            )}

                                            {columnVisibility.bypass_gas && (
                                                <th
                                                    className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`}
                                                    rowSpan={1}
                                                    scope="col"
                                                    colSpan={1}
                                                    onClick={() => beforeSort(
                                                        "shipperData.contractData.valueContractPlanning.detail_entry_east_bypassGas", sortState, setSortState, setSortedData, tableData
                                                    )}
                                                >
                                                    {`Bypass Gas`}
                                                    {getArrowIcon("shipperData.contractData.valueContractPlanning.detail_entry_east_bypassGas")}
                                                </th>
                                            )}

                                            {columnVisibility.lng && (
                                                <th
                                                    className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`}
                                                    rowSpan={1}
                                                    scope="col"
                                                    colSpan={1}
                                                    onClick={() => beforeSort(
                                                        "shipperData.contractData.valueContractPlanning.detail_entry_east_lng", sortState, setSortState, setSortedData, tableData
                                                    )}
                                                >
                                                    {`LNG`}
                                                    {getArrowIcon("shipperData.contractData.valueContractPlanning.detail_entry_east_lng")}
                                                </th>
                                            )}

                                            {columnVisibility.others_east && (
                                                <th
                                                    className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`}
                                                    rowSpan={1}
                                                    scope="col"
                                                    colSpan={1}
                                                    onClick={() => beforeSort(
                                                        "shipperData.contractData.valueContractPlanning.other_east", sortState, setSortState, setSortedData, tableData
                                                    )}
                                                >
                                                    {`Others`}
                                                    {getArrowIcon("shipperData.contractData.valueContractPlanning.other_east")}
                                                </th>
                                            )}


                                            {/* ################################################################################################## */}
                                            {/* ########################## Under Detail Pane ---> Entry ---> West ########################## */}
                                            {columnVisibility.ydn && (
                                                <th
                                                    className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`}
                                                    rowSpan={1}
                                                    scope="col"
                                                    colSpan={1}
                                                    onClick={() => beforeSort(
                                                        "shipperData.contractData.valueContractPlanning.detail_entry_west_yadana", sortState, setSortState, setSortedData, tableData
                                                    )}
                                                >
                                                    {`YDN`}
                                                    {getArrowIcon("shipperData.contractData.valueContractPlanning.detail_entry_west_yadana")}
                                                </th>
                                            )}

                                            {columnVisibility.ytg && (
                                                <th
                                                    className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`}
                                                    rowSpan={1}
                                                    scope="col"
                                                    colSpan={1}
                                                    onClick={() => beforeSort(
                                                        "shipperData.contractData.valueContractPlanning.detail_entry_west_yetagun", sortState, setSortState, setSortedData, tableData
                                                    )}
                                                >
                                                    {`YTG`}
                                                    {getArrowIcon("shipperData.contractData.valueContractPlanning.detail_entry_west_yetagun")}
                                                </th>
                                            )}

                                            {columnVisibility.ztk && (
                                                <th
                                                    className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`}
                                                    rowSpan={1}
                                                    scope="col"
                                                    colSpan={1}
                                                    onClick={() => beforeSort(
                                                        "shipperData.contractData.valueContractPlanning.detail_entry_west_zawtika", sortState, setSortState, setSortedData, tableData
                                                    )}
                                                >
                                                    {`ZTK`}
                                                    {getArrowIcon("shipperData.contractData.valueContractPlanning.detail_entry_west_zawtika")}
                                                </th>
                                            )}

                                            {columnVisibility.others_west && (
                                                <th
                                                    className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`}
                                                    rowSpan={1} scope="col" colSpan={1}
                                                    onClick={() => beforeSort(
                                                        "shipperData.contractData.valueContractPlanning.detail_entry_west_other_west", sortState, setSortState, setSortedData, tableData
                                                    )}
                                                >
                                                    {`Others`}
                                                    {getArrowIcon("shipperData.contractData.valueContractPlanning.detail_entry_west_other_west")}
                                                </th>
                                            )}



                                            {/* ################################################################################################## */}
                                            {/* ########################## Under Detail Pane ---> Entry ---> East-West ########################## */}
                                            {columnVisibility.ra6_east && (
                                                <th
                                                    className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`}
                                                    rowSpan={1} scope="col" colSpan={1}
                                                    onClick={() => beforeSort(
                                                        "shipperData.contractData.valueContractPlanning.detail_entry_east-west_ra6East", sortState, setSortState, setSortedData, tableData
                                                    )}
                                                >
                                                    {`RA6 East`}
                                                    {getArrowIcon("shipperData.contractData.valueContractPlanning.detail_entry_east-west_ra6East")}
                                                </th>
                                            )}

                                            {columnVisibility.ra6_west && (
                                                <th
                                                    className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`}
                                                    rowSpan={1} scope="col" colSpan={1}
                                                    onClick={() => beforeSort(
                                                        "shipperData.contractData.valueContractPlanning.detail_entry_east-west_ra6West", sortState, setSortState, setSortedData, tableData
                                                    )}
                                                >
                                                    {`RA6 West`}
                                                    {getArrowIcon("shipperData.contractData.valueContractPlanning.detail_entry_east-west_ra6West")}
                                                </th>
                                            )}

                                            {columnVisibility.bvw10_east && (
                                                <th
                                                    className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`}
                                                    rowSpan={1} scope="col" colSpan={1}
                                                    onClick={() => beforeSort(
                                                        "shipperData.contractData.valueContractPlanning.detail_entry_east-west_bvw10East", sortState, setSortState, setSortedData, tableData
                                                    )}
                                                >
                                                    {`BVW10 East`}
                                                    {getArrowIcon("shipperData.contractData.valueContractPlanning.detail_entry_east-west_bvw10East")}
                                                </th>
                                            )}

                                            {columnVisibility.bvw10_West && (
                                                <th
                                                    className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`}
                                                    rowSpan={1} scope="col" colSpan={1}
                                                    onClick={() => beforeSort(
                                                        "shipperData.contractData.valueContractPlanning.detail_entry_east-west_bvw10West", sortState, setSortState, setSortedData, tableData
                                                    )}
                                                >
                                                    {`BVW10 West`}
                                                    {getArrowIcon("shipperData.contractData.valueContractPlanning.detail_entry_east-west_bvw10West")}
                                                </th>
                                            )}


                                            {/* ################################################################################################## */}
                                            {/* ########################## Under Detail Pane ---> Exit ---> East ########################## */}
                                            {columnVisibility.egat && (
                                                <th
                                                    className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`}
                                                    rowSpan={1} scope="col" colSpan={1}
                                                    onClick={() => beforeSort(
                                                        "shipperData.contractData.valueContractPlanning.detail_exit_east_egat", sortState, setSortState, setSortedData, tableData
                                                    )}
                                                >
                                                    {`EGAT`}
                                                    {getArrowIcon("shipperData.contractData.valueContractPlanning.detail_exit_east_egat")}
                                                </th>
                                            )}

                                            {columnVisibility.ipp && (
                                                <th
                                                    className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`}
                                                    rowSpan={1} scope="col" colSpan={1}
                                                    onClick={() => beforeSort(
                                                        "shipperData.contractData.valueContractPlanning.detail_exit_east_ipp", sortState, setSortState, setSortedData, tableData
                                                    )}
                                                >
                                                    {`IPP`}
                                                    {getArrowIcon("shipperData.contractData.valueContractPlanning.detail_exit_east_ipp")}
                                                </th>
                                            )}

                                            {columnVisibility.others_east_exit && (
                                                <th
                                                    className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`}
                                                    rowSpan={1} scope="col" colSpan={1}
                                                    onClick={() => beforeSort(
                                                        "shipperData.contractData.valueContractPlanning.detail_exit_east_other_east", sortState, setSortState, setSortedData, tableData
                                                    )}
                                                >
                                                    {`Others`}
                                                    {getArrowIcon("shipperData.contractData.valueContractPlanning.detail_exit_east_other_east")}
                                                </th>
                                            )}


                                            {/* ################################################################################################## */}
                                            {/* ########################## Under Detail Pane ---> Exit ---> West ########################## */}
                                            {columnVisibility.egat_west && (
                                                <th
                                                    className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`}
                                                    rowSpan={1} scope="col" colSpan={1}
                                                    onClick={() => beforeSort(
                                                        "shipperData.contractData.valueContractPlanning.detail_exit_west_egat", sortState, setSortState, setSortedData, tableData
                                                    )}
                                                >
                                                    {`EGAT`}
                                                    {getArrowIcon("shipperData.contractData.valueContractPlanning.detail_exit_west_egat")}
                                                </th>
                                            )}

                                            {columnVisibility.ipp_west && (
                                                <th
                                                    className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`}
                                                    rowSpan={1} scope="col" colSpan={1}
                                                    onClick={() => beforeSort(
                                                        "shipperData.contractData.valueContractPlanning.detail_exit_west_ipp", sortState, setSortState, setSortedData, tableData
                                                    )}
                                                >
                                                    {`IPP`}
                                                    {getArrowIcon("shipperData.contractData.valueContractPlanning.detail_exit_west_ipp")}
                                                </th>
                                            )}

                                            {columnVisibility.others_west_exit && (
                                                <th
                                                    className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`}
                                                    rowSpan={1} scope="col" colSpan={1}
                                                    onClick={() => beforeSort(
                                                        "shipperData.contractData.valueContractPlanning.detail_exit_west_other_west", sortState, setSortState, setSortedData, tableData
                                                    )}
                                                >
                                                    {`Others`}
                                                    {getArrowIcon("shipperData.contractData.valueContractPlanning.detail_exit_west_other_west")}
                                                </th>
                                            )}

                                            {/* ################################################################################################## */}
                                            {/* ########################## Under Detail Pane ---> Exit ---> East-West ########################## */}
                                            {columnVisibility.egat_east_west && (
                                                <th
                                                    className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`}
                                                    rowSpan={1} scope="col" colSpan={1}
                                                    onClick={() => beforeSort(
                                                        "shipperData.contractData.valueContractPlanning.detail_exit_east-west_egat", sortState, setSortState, setSortedData, tableData
                                                    )}
                                                >
                                                    {`EGAT`}
                                                    {getArrowIcon("shipperData.contractData.valueContractPlanning.detail_exit_east-west_egat")}
                                                </th>
                                            )}

                                            {columnVisibility.ipp_east_west && (
                                                <th
                                                    className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`}
                                                    rowSpan={1} scope="col" colSpan={1}
                                                    onClick={() => beforeSort(
                                                        "shipperData.contractData.valueContractPlanning.detail_exit_east-west_ipp", sortState, setSortState, setSortedData, tableData
                                                    )}
                                                >
                                                    {`IPP`}
                                                    {getArrowIcon("shipperData.contractData.valueContractPlanning.detail_exit_east-west_ipp")}
                                                </th>
                                            )}

                                            {columnVisibility.others_east_west_exit && (
                                                <th
                                                    className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`}
                                                    rowSpan={1} scope="col" colSpan={1}
                                                    onClick={() => beforeSort(
                                                        "shipperData.contractData.valueContractPlanning.detail_exit_east-other_east_west", sortState, setSortState, setSortedData, tableData
                                                    )}
                                                >
                                                    {`Others`}
                                                    {getArrowIcon("shipperData.contractData.valueContractPlanning.detail_exit_east-other_east_west")}
                                                </th>
                                            )}


                                            {/* ################################################################################################## */}
                                            {/* ########################## Under Detail Pane ---> Exit ---> F2&G ########################## */}
                                            {/* E5EED9  DBE1F2 */}
                                            {/* DBE4FF  FFCEE2 */}
                                            {columnVisibility.east_f2andg && (
                                                <th
                                                    className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#DBE4FF] text-center min-w-[173px] w-[180px] max-w-[200px]`}
                                                    rowSpan={1} scope="col" colSpan={1}
                                                    onClick={() => beforeSort(
                                                        "shipperData.contractData.valueContractPlanning.detail_exit_east_F2andG", sortState, setSortState, setSortedData, tableData
                                                    )}
                                                >
                                                    {`East`}
                                                    {getArrowIcon("shipperData.contractData.valueContractPlanning.detail_exit_east_F2andG")}
                                                </th>
                                            )}

                                            {columnVisibility.west_f2andg && (
                                                <th
                                                    className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#FFCEE2] text-center min-w-[173px] w-[180px] max-w-[200px]`}
                                                    rowSpan={1} scope="col" colSpan={1}
                                                    onClick={() => beforeSort(
                                                        "shipperData.contractData.valueContractPlanning.detail_exit_west_F2andG", sortState, setSortState, setSortedData, tableData
                                                    )}
                                                >
                                                    {`West`}
                                                    {getArrowIcon("shipperData.contractData.valueContractPlanning.detail_exit_west_F2andG")}
                                                </th>
                                            )}


                                            {/* ################################################################################################## */}
                                            {/* ########################## Under Detail Pane ---> Exit ---> E ########################## */}
                                            {columnVisibility.east_e && (
                                                <th
                                                    className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#DBE4FF] text-center min-w-[173px] w-[180px] max-w-[200px]`}
                                                    rowSpan={1} scope="col" colSpan={1}
                                                    onClick={() => beforeSort(
                                                        "shipperData.contractData.valueContractPlanning.detail_exit_E_east", sortState, setSortState, setSortedData, tableData
                                                    )}
                                                >
                                                    {`East`}
                                                    {getArrowIcon("shipperData.contractData.valueContractPlanning.detail_exit_E_east")}
                                                </th>
                                            )}

                                            {columnVisibility.west_e && (
                                                <th
                                                    className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#FFCEE2] text-center min-w-[173px] w-[180px] max-w-[200px]`}
                                                    rowSpan={1} scope="col" colSpan={1}
                                                    onClick={() => beforeSort(
                                                        "shipperData.contractData.valueContractPlanning.detail_exit_E_west", sortState, setSortState, setSortedData, tableData
                                                    )}
                                                >
                                                    {`West`}
                                                    {getArrowIcon("shipperData.contractData.valueContractPlanning.detail_exit_E_west")}
                                                </th>
                                            )}

                                        </>
                                    )}

                                </tr>
                            </thead>

                            <tbody>
                                {/* TEST 3 Steps map */}
                                {sortedData && sortedData?.map((row: any, index: any) => {

                                    const hasPlanningKeyRow = row != null && ('totalAllPlanning' in row);
                                    const hasActualKeyRow = row != null && ('totalAllActual' in row);


                                    return (
                                        // <React.Fragment key={'main-' + row?.request_number}>
                                        <React.Fragment key={`main-${row?.request_number}-${index}`}>

                                            {/* 1st & 2nd Levels */}
                                            {row?.shipperData?.map((shipperItem: any, cIdx: number) => {
                                                const hasPlanningKeyShipper = shipperItem != null && ('totalShipperPlanning' in shipperItem);
                                                const hasActualKeyShipper = shipperItem != null && ('totalShipperActual' in shipperItem);

                                                return (
                                                    <React.Fragment key={`subb-${cIdx}`}>

                                                        {/* 1st Level - แถบขาว จะแสดงต่อเมื่อ isBothFalse == true */}
                                                        {/* {isBothFalse && shipperItem?.contractData?.map((contract: any, index: number) => {
                                                            // const hasPlanningKey = contract != null && ('valueContractPlanning' in contract);
                                                            // const hasActualKey = contract != null && ('valueContractActual' in contract);

                                                            const hasPlanningKey = contract?.valueContractPlanning && Object.keys(contract.valueContractPlanning).length > 0;
                                                            const hasActualKey = contract?.valueContractActual && Object.keys(contract.valueContractActual).length > 0;

                                                            return (
                                                                <React.Fragment key={`subb2-${cIdx}-${index}`}>

                                                                    {
                                                                        // contract?.["valueContractPlanning"] &&
                                                                        hasPlanningKey &&
                                                                        <ContractRowWhite
                                                                            row={row}
                                                                            shipperItem={shipperItem}
                                                                            type='planning'
                                                                            setCheckPublic={setCheckPublic}
                                                                            // contract={contract}
                                                                            contract={contract?.["valueContractPlanning"]}
                                                                            cIdx={cIdx}
                                                                            index={index}
                                                                            table_row_style={table_row_style}
                                                                            shipperGroupData={shipperGroupData}
                                                                            columnVisibility={columnVisibility}
                                                                        />
                                                                    }

                                                                    {
                                                                        // contract?.["valueContractActual"] && 
                                                                        hasActualKey &&
                                                                        <ContractRowWhite
                                                                            row={row}
                                                                            shipperItem={shipperItem}
                                                                            type='actual'
                                                                            setCheckPublic={setCheckPublic}
                                                                            // contract={contract}
                                                                            contract={contract?.["valueContractActual"]}
                                                                            cIdx={cIdx}
                                                                            index={index}
                                                                            table_row_style={table_row_style}
                                                                            shipperGroupData={shipperGroupData}
                                                                            columnVisibility={columnVisibility}
                                                                        />
                                                                    }

                                                                </React.Fragment>
                                                            )
                                                        }
                                                        )} */}

                                                        {/* คุยกับท้อป ปรับให้เป็นการ sort row ขาว เฉพาะ contract นั้น ๆ (ตัว contract ไม่วิ่งสลับไปมา สลับแค่ plan actual) */}
                                                        {/* ปรับ render row ขาวให้ใช้ __rowOrder แทนการ planning ก่อน actual ตายตัว */}
                                                        {isBothFalse && shipperItem?.contractData?.map((contract: any, index: number) => {
                                                            const hasPlanningKey = contract?.valueContractPlanning !== null && contract?.valueContractPlanning !== undefined;
                                                            const hasActualKey = contract?.valueContractActual !== null && contract?.valueContractActual !== undefined;

                                                            const order: ("planning" | "actual")[] = contract?.__rowOrder ?? ["planning", "actual"];

                                                            return (
                                                                <React.Fragment key={`subb2-${cIdx}-${index}`}>
                                                                    {order.map((t) => {
                                                                        if (t === "planning" && hasPlanningKey) {
                                                                            return (
                                                                                <ContractRowWhite
                                                                                    key={`p-${cIdx}-${index}`}
                                                                                    row={row}
                                                                                    shipperItem={shipperItem}
                                                                                    type="planning"
                                                                                    setCheckPublic={setCheckPublic}
                                                                                    contract={contract.valueContractPlanning}
                                                                                    cIdx={cIdx}
                                                                                    index={index}
                                                                                    table_row_style={table_row_style}
                                                                                    shipperGroupData={shipperGroupData}
                                                                                    columnVisibility={columnVisibility}
                                                                                />
                                                                            );
                                                                        }

                                                                        if (t === "actual" && hasActualKey) {
                                                                            return (
                                                                                <ContractRowWhite
                                                                                    key={`a-${cIdx}-${index}`}
                                                                                    row={row}
                                                                                    shipperItem={shipperItem}
                                                                                    type="actual"
                                                                                    setCheckPublic={setCheckPublic}
                                                                                    contract={contract.valueContractActual}
                                                                                    cIdx={cIdx}
                                                                                    index={index}
                                                                                    table_row_style={table_row_style}
                                                                                    shipperGroupData={shipperGroupData}
                                                                                    columnVisibility={columnVisibility}
                                                                                />
                                                                            );
                                                                        }

                                                                        return null;
                                                                    })}
                                                                </React.Fragment>
                                                            );
                                                        })}




                                                        {(isBothFalse || showTotal) && (<>

                                                            {
                                                                // shipperItem?.["totalShipperPlanning"] && 
                                                                hasPlanningKeyShipper &&
                                                                <ContractRowBlue
                                                                    row={row}
                                                                    shipperItem={shipperItem?.["totalShipperPlanning"]}
                                                                    type='planning'
                                                                    cIdx={cIdx}
                                                                    index={0} // or whatever makes sense
                                                                    table_row_style={table_row_style}
                                                                    shipperGroupData={shipperGroupData}
                                                                    columnVisibility={columnVisibility}
                                                                />
                                                            }

                                                            {
                                                                // shipperItem?.["totalShipperActual"] &&
                                                                hasActualKeyShipper &&
                                                                <ContractRowBlue
                                                                    row={row}
                                                                    shipperItem={shipperItem?.["totalShipperActual"]}
                                                                    type='actual'
                                                                    cIdx={cIdx}
                                                                    index={0} // or whatever makes sense
                                                                    table_row_style={table_row_style}
                                                                    shipperGroupData={shipperGroupData}
                                                                    columnVisibility={columnVisibility}
                                                                />
                                                            }

                                                        </>
                                                        )}

                                                    </React.Fragment>
                                                )
                                            }

                                            )}

                                            <React.Fragment key={`ALL-${index}`}>

                                                {/* 2nd Level - TOTAL : ALL แถบเหลือง  */}
                                                {
                                                    (isBothFalse || showTotalAllShipper) && userDT?.account_manage?.[0]?.user_type_id !== 3 && <>

                                                        {
                                                            // row?.["totalAllPlanning"] &&
                                                            hasPlanningKeyRow &&
                                                            <ContractRowYellow
                                                                row={row?.["totalAllPlanning"]}
                                                                // shipperItem={shipperItem}
                                                                // contract={contract}
                                                                // cIdx={cIdx}
                                                                index={index}
                                                                type='planning'
                                                                table_row_style={table_row_style}
                                                                shipperGroupData={shipperGroupData}
                                                                columnVisibility={columnVisibility}
                                                            />
                                                        }

                                                        {
                                                            // row?.["totalAllActual"] &&
                                                            hasActualKeyRow &&
                                                            <ContractRowYellow
                                                                row={row?.["totalAllActual"]}
                                                                // shipperItem={shipperItem}
                                                                // contract={contract}
                                                                // cIdx={cIdx}
                                                                index={index}
                                                                type='actual'
                                                                table_row_style={table_row_style}
                                                                shipperGroupData={shipperGroupData}
                                                                columnVisibility={columnVisibility}
                                                            />
                                                        }

                                                    </>
                                                }

                                            </React.Fragment>
                                        </React.Fragment>
                                    )
                                }

                                )}

                            </tbody>

                        </table>
                        :
                        <TableSkeleton />
                }

                {
                    isLoading && sortedData?.length == 0 && <NodataTable />
                }

            </div >

        </div >


    )
}

export default TableMain;