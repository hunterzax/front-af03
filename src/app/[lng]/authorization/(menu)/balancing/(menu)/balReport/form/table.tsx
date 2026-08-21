import { useEffect } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort, handleSortBalReport, handleSortBalReportRowWhiteModify, handleSortBalReportRowWhiteModifyX, handleSortBalReportRowWhiteModifyY, handleSortOnlyBalReport } from "@/utils/sortTable";
import NodataTable from "@/components/other/nodataTable";
import { ContractRowWhite } from "./rowWhiteComponent";
import { ContractRowBlue } from "./rowBlueComponent";
import { ContractRowYellow } from "./rowYellowComponent";

const TableMain: React.FC<any> = ({ tableData, columnVisibility, initialColumns, isLoading, userPermission, showTotal, showTotalAllShipper, isBothFalse, shipperGroupData, sortedData, setSortedData, isShipper }) => {
    const [sortState, setSortState] = useState({ column: null, direction: null });
    // const [sortedData, setSortedData] = useState<any>([]);

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
    const getVisibleChildCount = (parentKey: string) => initialColumns?.filter((col: any) => col.parent_id === parentKey && columnVisibility[col.key]).length || 1;
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

    return (
        <div className={`relative h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md z-1`}>

            {
                isLoading ?
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500">

                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">

                            {/* MAIN */}
                            <tr className="h-9">

                                {/* สามารถ Freeze column ถึง column ไหนได้ ซึ่งยังอยากให้เห็นข้อมูล ตรง  row total ครบอยู่ https://app.clickup.com/t/86eujrg5x */}
                                {columnVisibility.gas_day && (
                                    <th
                                        className={`${table_header_style} text-center min-w-[120px] w-[130px] max-w-[150px] sticky left-0 bg-[#1473A1] z-[99]`}
                                        rowSpan={4}
                                        scope="col"
                                    // onClick={() => handleSort("gas_day", sortState, setSortState, setSortedData, tableData)} // https://app.clickup.com/t/86eujrg4t R: Sort ยังไม่ได้บาง column (ดูเพิ่มเติมว่ามันสามารถ sort ได้แบบไหน)
                                    >
                                        {`Gas Day`}
                                        {/* {getArrowIcon("gas_day")} */}
                                    </th>
                                )}

                                {columnVisibility.summary_pane && (
                                    <th
                                        className={`${table_header_style} bg-[#DEA477] text-center`}
                                        // colSpan={48} 
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

                            {/* SUB MAIN */}
                            <tr className="h-9">

                                {columnVisibility.summary_pane && (<>


                                    {columnVisibility.shipper_name && (
                                        <th
                                            className={`
                                                ${table_sort_header_style} text-center sticky z-50 bg-[#1473A1]
                                                ${!columnVisibility?.gas_day ? 'left-0' // ถ้าปิด gas_day
                                                    : 'left-[120px]' // default
                                                }
                                            `}
                                            rowSpan={3}
                                            scope="col"
                                            colSpan={1}
                                        // onClick={() => handleSortBalReport("shipper_data.shipper", sortState, setSortState, setSortedData, tableData, shipperGroupData)}  // https://app.clickup.com/t/86eujrg4t R: Sort ยังไม่ได้บาง column (ดูเพิ่มเติมว่ามันสามารถ sort ได้แบบไหน)
                                        >
                                            <div className="w-[200px]">
                                                {`Shipper Name`}
                                                {/* {getArrowIcon("shipper_data.shipper")} */}
                                            </div>
                                        </th>
                                    )}

                                    {columnVisibility.contract_code && (
                                        <th
                                            className={`${table_sort_header_style} sticky bg-[#1473A1] z-50
                                            ${(columnVisibility?.gas_day && !columnVisibility.shipper_name) ? 'left-[120px]' // ถ้าไม่ปิด gas_day แต่ปิด shipper_name
                                                    : (!columnVisibility?.gas_day && columnVisibility.shipper_name) ? 'left-[216px]' // ถ้าปิด gas_day แต่ไม่ปิด shipper_name
                                                        : (!columnVisibility?.gas_day && !columnVisibility.shipper_name) ? 'left-0' // ถ้าปิดทั้งคู่
                                                            : 'left-[352px]' // default
                                                }
                                        `}
                                            rowSpan={3}
                                            scope="col"
                                            colSpan={1}
                                            onClick={() => handleSortOnlyBalReport("shipper_data.contract_data.contract", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            <div className="w-[150px]">
                                                {`Contract Code`}
                                                {getArrowIcon("shipper_data.contract_data.contract")}
                                            </div>
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
                                            {`Total Entry (MMBTU)`}
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
                                            {`Total Exit (MMBTU)`}
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
                                            {`Imbalance Zone (MMBTU)`}
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
                                            {`Instructed Flow (MMBTU)`}
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
                                            {`Shrinkage Volume (MMBTU)`}
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
                                            {`Park (MMBTU)`}
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
                                            {`Unpark (MMBTU)`}
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
                                            {`SOD Park (MMBTU)`}
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
                                            {`EOD Park (MMBTU)`}
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
                                            {`Change Min Inventory (MMBTU)`}
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
                                            {`Reserve Bal. (MMBTU)`}
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
                                            {`Adjust Imbalance (MMBTU)`}
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
                                            {/* {`Vent Gas`} */}
                                            {/* Column ตามภาพ เพิ่มหน่วย (MMBTU) https://app.clickup.com/t/86eujrg8e */}
                                            {`Vent Gas (MMBTU)`}
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
                                            {/* {`Commissioning Gas`} */}
                                            {/* Column ตามภาพ เพิ่มหน่วย (MMBTU) https://app.clickup.com/t/86eujrg8e */}
                                            {`Commissioning Gas (MMBTU)`}
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
                                            {/* {`Other Gas`} */}
                                            {/* Column ตามภาพ เพิ่มหน่วย (MMBTU) https://app.clickup.com/t/86eujrg8e */}
                                            {`Other Gas (MMBTU)`}
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
                                            {`Daily IMB. (MMBTU)`}
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
                                            {`AIP (MMBTU)`}
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
                                            {`AIN (MMBTU)`}
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
                                            {`Acc. IMB. (MONTH) (MMBTU)`}
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
                                            {`Acc. IMB. (MMBTU)`}
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
                                            {`Min. Inventory (MMBTU)`}
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
                                                colSpan={getVisibleChildCount("east_exit_detail_pane") + getVisibleChildCount("west_exit_detail_pane") + getVisibleChildCount("east_west_exit_detail_pane") + getVisibleChildCount("f2_and_g") + getVisibleChildCount("e")}
                                            >
                                                {`Exit`}
                                            </th>
                                        )}

                                    </>
                                )}
                            </tr>


                            <tr className="h-9">

                                {/* เรื่อง SORT เปลี่ยนไปใช้ handleSortBalReportRowWhite() (อ่านคอมเม้นนะ) R: Sort ยังไม่ได้บาง column (ดูเพิ่มเติมว่ามันสามารถ sort ได้แบบไหน) https://app.clickup.com/t/86eujrg4t */}
                                {/* List : Column ย่อยพวก East / West / East-West ปรับจัดกลาง https://app.clickup.com/t/86etje74w */}
                                {columnVisibility.summary_pane && (<>

                                    {/* ################################################################################################## */}
                                    {/* ########################## Under Summary Pane ---> Total Entry (MMBTU) ########################## */}
                                    {columnVisibility.east_total_entry_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style}  text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("total_entry_east", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("total_entry_east", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`East`}
                                            {getArrowIcon("total_entry_east")}
                                        </th>
                                    )}

                                    {columnVisibility.west_total_entry_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("total_entry_west", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("total_entry_west", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`West`}
                                            {getArrowIcon("total_entry_west")}
                                        </th>
                                    )}

                                    {columnVisibility.east_west_total_entry_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#C8FFD7] hover:bg-[#a6f5bf] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("total_entry_east-west", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("total_entry_east-west", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`East-West`}
                                            {getArrowIcon("total_entry_east-west")}
                                        </th>
                                    )}


                                    {/* ################################################################################################## */}
                                    {/* ########################## Under Summary Pane ---> Total Exit (MMBTU) ########################## */}
                                    {columnVisibility.east_total_exit_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("total_exit_east", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("total_exit_east", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`East`}
                                            {getArrowIcon("total_exit_east")}
                                        </th>
                                    )}

                                    {columnVisibility.west_total_exit_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("total_exit_west", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("total_exit_west", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`West`}
                                            {getArrowIcon("total_exit_west")}
                                        </th>
                                    )}

                                    {columnVisibility.east_west_total_exit_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#C8FFD7] hover:bg-[#a6f5bf] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("total_exit_east-west", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("total_exit_east-west", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`East-West`}
                                            {getArrowIcon("total_exit_east-west")}
                                        </th>
                                    )}


                                    {/* ################################################################################################## */}
                                    {/* ########################## Under Summary Pane ---> Imbalance Zone (MMBTU) ########################## */}
                                    {columnVisibility.east_imbalance_zone_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("imbZone_east", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("imbZone_east", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`East`}
                                            {getArrowIcon("imbZone_east")}
                                        </th>
                                    )}

                                    {columnVisibility.west_imbalance_zone_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("imbZone_west", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("imbZone_west", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`West`}
                                            {getArrowIcon("imbZone_west")}
                                        </th>
                                    )}

                                    {columnVisibility.total_imbalance_zone_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#F2F2F2] hover:bg-[#e0e0e0] text-right min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("imbZone_total", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("imbZone_total", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`Total`}
                                            {getArrowIcon("imbZone_total")}
                                        </th>
                                    )}



                                    {/* ################################################################################################## */}
                                    {/* ########################## Under Summary Pane ---> Instructed flow (MMBTU) ########################## */}
                                    {columnVisibility.east_instructed_flow_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("instructedFlow_east", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("instructedFlow_east", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`East`}
                                            {getArrowIcon("instructedFlow_east")}
                                        </th>
                                    )}

                                    {columnVisibility.west_instructed_flow_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("instructedFlow_west", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("instructedFlow_west", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`West`}
                                            {getArrowIcon("instructedFlow_west")}
                                        </th>
                                    )}

                                    {columnVisibility.east_west_instructed_flow_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#C8FFD7] hover:bg-[#a6f5bf] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("instructedFlow_east-west", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("instructedFlow_east-west", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`East-West`}
                                            {getArrowIcon("instructedFlow_east-west")}
                                        </th>
                                    )}


                                    {/* ################################################################################################## */}
                                    {/* ########################## Under Summary Pane ---> Shrinkage Volume (MMBTU) ########################## */}
                                    {columnVisibility.east_shrinkage_volume_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("shrinkage_east", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("shrinkage_east", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`East`}
                                            {getArrowIcon("shrinkage_east")}
                                        </th>
                                    )}

                                    {columnVisibility.west_shrinkage_volume_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("shrinkage_west", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("shrinkage_west", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`West`}
                                            {getArrowIcon("shrinkage_west")}
                                        </th>
                                    )}


                                    {/* ################################################################################################## */}
                                    {/* ########################## Under Summary Pane ---> Park (MMBTU) ########################## */}
                                    {columnVisibility.east_park_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("park_east", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("park_east", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`East`}
                                            {getArrowIcon("park_east")}
                                        </th>
                                    )}

                                    {columnVisibility.west_park_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("park_west", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("park_west", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`West`}
                                            {getArrowIcon("park_west")}
                                        </th>
                                    )}


                                    {/* ################################################################################################## */}
                                    {/* ########################## Under Summary Pane ---> Unpark (MMBTU) ########################## */}
                                    {columnVisibility.east_unpark_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("unpark_east", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("unpark_east", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`East`}
                                            {getArrowIcon("unpark_east")}
                                        </th>
                                    )}

                                    {columnVisibility.west_unpark_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("unpark_west", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("unpark_west", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`West`}
                                            {getArrowIcon("unpark_west")}
                                        </th>
                                    )}


                                    {/* ################################################################################################## */}
                                    {/* ########################## Under Summary Pane ---> SOD Park (MMBTU) ########################## */}
                                    {columnVisibility.east_sod_park_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("SodPark_east", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("SodPark_east", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`East`}
                                            {getArrowIcon("SodPark_east")}
                                        </th>
                                    )}

                                    {columnVisibility.west_sod_park_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("SodPark_west", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("SodPark_west", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`West`}
                                            {getArrowIcon("SodPark_west")}
                                        </th>
                                    )}


                                    {/* ################################################################################################## */}
                                    {/* ########################## Under Summary Pane ---> EOD Park (MMBTU) ########################## */}
                                    {columnVisibility.east_eod_park_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("EodPark_east", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("EodPark_east", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`East`}
                                            {getArrowIcon("EodPark_east")}
                                        </th>
                                    )}

                                    {columnVisibility.west_eod_park_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("EodPark_west", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("EodPark_west", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`West`}
                                            {getArrowIcon("EodPark_west")}
                                        </th>
                                    )}


                                    {/* ################################################################################################## */}
                                    {/* ########################## Under Summary Pane ---> Min. Inventory Change (MMBTU) ########################## */}
                                    {columnVisibility.east_min_inventory_change_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("minInventoryChange_east", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("minInventoryChange_east", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`East`}
                                            {getArrowIcon("minInventoryChange_east")}
                                        </th>
                                    )}

                                    {columnVisibility.west_min_inventory_change_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("minInventoryChange_west", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("minInventoryChange_west", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`West`}
                                            {getArrowIcon("minInventoryChange_west")}
                                        </th>
                                    )}

                                    {/* ################################################################################################## */}
                                    {/* ########################## Under Summary Pane ---> Reserve Bal. (MMBTU) ########################## */}
                                    {columnVisibility.east_reserve_bal_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("reserveBal_east", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("reserveBal_east", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`East`}
                                            {getArrowIcon("reserveBal_east")}
                                        </th>
                                    )}

                                    {columnVisibility.west_reserve_bal_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("reserveBal_west", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("reserveBal_west", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`West`}
                                            {getArrowIcon("reserveBal_west")}
                                        </th>
                                    )}

                                    {/* ################################################################################################## */}
                                    {/* ########################## Under Summary Pane ---> Adjust Imbalance (MMBTU) ########################## */}
                                    {columnVisibility.east_adjust_imbalance_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("adjustDailyImb_east", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("adjustDailyImb_east", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`East`}
                                            {getArrowIcon("adjustDailyImb_east")}
                                        </th>
                                    )}

                                    {columnVisibility.west_adjust_imbalance_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("adjustDailyImb_west", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("adjustDailyImb_west", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`West`}
                                            {getArrowIcon("adjustDailyImb_west")}
                                        </th>
                                    )}


                                    {/* ################################################################################################## */}
                                    {/* ########################## Under Summary Pane ---> Vent Gas ########################## */}
                                    {columnVisibility.east_vent_gas && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("ventGas_east", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("ventGas_east", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`East`}
                                            {getArrowIcon("ventGas_east")}
                                        </th>
                                    )}

                                    {columnVisibility.west_vent_gas && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("ventGas_west", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("ventGas_west", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`West`}
                                            {getArrowIcon("ventGas_west")}
                                        </th>
                                    )}


                                    {/* ################################################################################################## */}
                                    {/* ########################## Under Summary Pane ---> Commissioning Gas ########################## */}
                                    {columnVisibility.east_commissioning_gas && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("commissioningGas_east", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("commissioningGas_east", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`East`}
                                            {getArrowIcon("commissioningGas_east")}
                                        </th>
                                    )}

                                    {columnVisibility.west_commissioning_gas && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("commissioningGas_west", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("commissioningGas_west", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`West`}
                                            {getArrowIcon("commissioningGas_west")}
                                        </th>
                                    )}

                                    {/* ################################################################################################## */}
                                    {/* ########################## Under Summary Pane ---> Other Gas ########################## */}
                                    {columnVisibility.east_other_gas && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("otherGas_east", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("otherGas_east", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`East`}
                                            {getArrowIcon("otherGas_east")}
                                        </th>
                                    )}

                                    {columnVisibility.west_other_gas && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("otherGas_west", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("otherGas_west", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`West`}
                                            {getArrowIcon("otherGas_west")}
                                        </th>
                                    )}


                                    {/* ################################################################################################## */}
                                    {/* ########################## Under Summary Pane ---> Daily IMB (MMBTU) ########################## */}
                                    {columnVisibility.east_daily_imb_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("dailyImb_east", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("dailyImb_east", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`East`}
                                            {getArrowIcon("dailyImb_east")}
                                        </th>
                                    )}

                                    {columnVisibility.west_daily_imb_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("dailyImb_west", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("dailyImb_west", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`West`}
                                            {getArrowIcon("dailyImb_west")}
                                        </th>
                                    )}


                                    {/* ################################################################################################## */}
                                    {/* ########################## Under Summary Pane ---> AIP (MMBTU) ########################## */}
                                    {columnVisibility.total_aip_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#F2F2F2] hover:bg-[#e0e0e0] text-right min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("aip", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("aip", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`Total`}
                                            {getArrowIcon("aip")}
                                        </th>
                                    )}

                                    {/* ################################################################################################## */}
                                    {/* ########################## Under Summary Pane ---> AIN (MMBTU) ########################## */}
                                    {columnVisibility.total_ain_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#F2F2F2] hover:bg-[#e0e0e0] text-right min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("ain", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("ain", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`Total`}
                                            {getArrowIcon("ain")}
                                        </th>
                                    )}

                                    {/* ################################################################################################## */}
                                    {/* ########################## Under Summary Pane ---> % Imb ########################## */}
                                    {columnVisibility.total_percentage_imb && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#F2F2F2] hover:bg-[#e0e0e0] text-right min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("absimb", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("absimb", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`Total`}
                                            {getArrowIcon("absimb")}
                                        </th>
                                    )}

                                    {/* ################################################################################################## */}
                                    {/* ########################## Under Summary Pane ---> %Abslmb ########################## */}
                                    {columnVisibility.total_percentage_abslmb && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#F2F2F2] hover:bg-[#e0e0e0] text-right min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("absimb", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("absimb", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`Total`}
                                            {getArrowIcon("absimb")}
                                        </th>
                                    )}

                                    {/* ################################################################################################## */}
                                    {/* ########################## Under Summary Pane ---> Acc. IMB. (MONTH) (MMBTU) ########################## */}
                                    {columnVisibility.east_acc_imb_month_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("accImbMonth_east", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("accImbMonth_east", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`East`}
                                            {getArrowIcon("accImbMonth_east")}
                                        </th>
                                    )}

                                    {columnVisibility.west_acc_imb_month_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("accImbMonth_west", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("accImbMonth_west", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`West`}
                                            {getArrowIcon("accImbMonth_west")}
                                        </th>
                                    )}


                                    {/* ################################################################################################## */}
                                    {/* ########################## Under Summary Pane ---> Acc. IMB. (MMBTU) ########################## */}
                                    {columnVisibility.east_acc_imb_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("accImb_east", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("accImb_east", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`East`}
                                            {getArrowIcon("accImb_east")}
                                        </th>
                                    )}

                                    {columnVisibility.west_acc_imb_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("accImb_west", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("accImb_west", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`West`}
                                            {getArrowIcon("accImb_west")}
                                        </th>
                                    )}


                                    {/* ################################################################################################## */}
                                    {/* ########################## Under Summary Pane ---> Min. Inventory (MMBTU) ########################## */}
                                    {columnVisibility.east_min_inventory_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("minInventory_east", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("minInventory_east", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`East`}
                                            {getArrowIcon("minInventory_east")}
                                        </th>
                                    )}

                                    {columnVisibility.west_min_inventory_mmbtud && (
                                        <th
                                            className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("minInventory_west", sortState, setSortState, setSortedData, tableData)}
                                            onClick={() => handleSortBalReportRowWhiteModify("minInventory_west", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`West`}
                                            {getArrowIcon("minInventory_west")}
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
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`} rowSpan={1} scope="col" colSpan={1}
                                                // onClick={() => handleSortBalReport("detail_entry_east_gsp", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => handleSortBalReportRowWhiteModify("detail_entry_east_gsp", sortState, setSortState, setSortedData, tableData)}
                                            >
                                                {`GSP`}
                                                {getArrowIcon("detail_entry_east_gsp")}
                                            </th>
                                        )}

                                        {columnVisibility.bypass_gas && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`} rowSpan={1} scope="col" colSpan={1}
                                                // onClick={() => handleSortBalReport("detail_entry_east_bypassGas", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => handleSortBalReportRowWhiteModify("detail_entry_east_bypassGas", sortState, setSortState, setSortedData, tableData)}
                                            >
                                                {`Bypass Gas`}
                                                {getArrowIcon("detail_entry_east_bypassGas")}
                                            </th>
                                        )}

                                        {columnVisibility.lng && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`} rowSpan={1} scope="col" colSpan={1}
                                                // onClick={() => handleSortBalReport("detail_entry_east_lng", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => handleSortBalReportRowWhiteModify("detail_entry_east_lng", sortState, setSortState, setSortedData, tableData)}
                                            >
                                                {`LNG`}
                                                {getArrowIcon("detail_entry_east_lng")}
                                            </th>
                                        )}

                                        {columnVisibility.others_east && (
                                            <th
                                                className={`${table_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`} rowSpan={1} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("minInventory_east", sortState, setSortState, setSortedData, tableData)}
                                            >
                                                {`Others`}
                                                {/* {getArrowIcon("West")} */}
                                            </th>
                                        )}



                                        {/* ################################################################################################## */}
                                        {/* ########################## Under Detail Pane ---> Entry ---> West ########################## */}
                                        {columnVisibility.ydn && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`} rowSpan={1} scope="col" colSpan={1}
                                                // onClick={() => handleSortBalReport("detail_entry_west_yadana", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => handleSortBalReportRowWhiteModify("detail_entry_west_yadana", sortState, setSortState, setSortedData, tableData)}
                                            >
                                                {`YDN`}
                                                {getArrowIcon("West")}
                                            </th>
                                        )}

                                        {columnVisibility.ytg && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`} rowSpan={1} scope="col" colSpan={1}
                                                // onClick={() => handleSortBalReport("detail_entry_west_yetagun", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => handleSortBalReportRowWhiteModify("detail_entry_west_yetagun", sortState, setSortState, setSortedData, tableData)}
                                            >
                                                {`YTG`}
                                                {getArrowIcon("detail_entry_west_yetagun")}
                                            </th>
                                        )}

                                        {columnVisibility.ztk && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`} rowSpan={1} scope="col" colSpan={1}
                                                // onClick={() => handleSortBalReport("detail_entry_west_zawtika", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => handleSortBalReportRowWhiteModify("detail_entry_west_zawtika", sortState, setSortState, setSortedData, tableData)}
                                            >
                                                {`ZTK`}
                                                {getArrowIcon("detail_entry_west_zawtika")}
                                            </th>
                                        )}

                                        {columnVisibility.others_west && (
                                            <th
                                                className={`${table_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`} rowSpan={1} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("detail_entry_east_lng", sortState, setSortState, setSortedData, tableData)}
                                            >
                                                {`Others`}
                                                {/* {getArrowIcon("West")} */}
                                            </th>
                                        )}



                                        {/* ################################################################################################## */}
                                        {/* ########################## Under Detail Pane ---> Entry ---> East-West ########################## */}
                                        {columnVisibility.ra6_east && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`} rowSpan={1} scope="col" colSpan={1}
                                                // onClick={() => handleSortBalReport("detail_entry_east-west_ra6East", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => handleSortBalReportRowWhiteModify("detail_entry_east-west_ra6East", sortState, setSortState, setSortedData, tableData)}
                                            >
                                                {`RA6 East`}
                                                {getArrowIcon("detail_entry_east-west_ra6East")}
                                            </th>
                                        )}

                                        {columnVisibility.ra6_west && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`} rowSpan={1} scope="col" colSpan={1}
                                                // onClick={() => handleSortBalReport("detail_entry_east-west_ra6West", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => handleSortBalReportRowWhiteModify("detail_entry_east-west_ra6West", sortState, setSortState, setSortedData, tableData)}
                                            >
                                                {`RA6 West`}
                                                {getArrowIcon("detail_entry_east-west_ra6West")}
                                            </th>
                                        )}

                                        {columnVisibility.bvw10_east && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`} rowSpan={1} scope="col" colSpan={1}
                                                // onClick={() => handleSortBalReport("detail_entry_east-west_bvw10East", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => handleSortBalReportRowWhiteModify("detail_entry_east-west_bvw10East", sortState, setSortState, setSortedData, tableData)}
                                            >
                                                {`BVW10 East`}
                                                {getArrowIcon("detail_entry_east-west_bvw10East")}
                                            </th>
                                        )}

                                        {columnVisibility.bvw10_West && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`} rowSpan={1} scope="col" colSpan={1}
                                                // onClick={() => handleSortBalReport("detail_entry_east-west_bvw10West", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => handleSortBalReportRowWhiteModify("detail_entry_east-west_bvw10West", sortState, setSortState, setSortedData, tableData)}
                                            >
                                                {`BVW10 West`}
                                                {getArrowIcon("detail_entry_east-west_bvw10West")}
                                            </th>
                                        )}


                                        {/* ################################################################################################## */}
                                        {/* ########################## Under Detail Pane ---> Exit ---> East ########################## */}
                                        {columnVisibility.egat && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`} rowSpan={1} scope="col" colSpan={1}
                                                // onClick={() => handleSortBalReport("detail_exit_east_egat", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => handleSortBalReportRowWhiteModify("detail_exit_east_egat", sortState, setSortState, setSortedData, tableData)}
                                            >
                                                {`EGAT`}
                                                {getArrowIcon("detail_exit_east_egat")}
                                            </th>
                                        )}

                                        {columnVisibility.ipp && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`} rowSpan={1} scope="col" colSpan={1}
                                                // onClick={() => handleSortBalReport("detail_exit_east_ipp", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => handleSortBalReportRowWhiteModify("detail_exit_east_ipp", sortState, setSortState, setSortedData, tableData)}
                                            >
                                                {`IPP`}
                                                {getArrowIcon("detail_exit_east_ipp")}
                                            </th>
                                        )}

                                        {columnVisibility.others_east_exit && (
                                            <th
                                                className={`${table_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`} rowSpan={1} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("detail_entry_east-west_bvw10West", sortState, setSortState, setSortedData, tableData)}
                                            >
                                                {`Others`}
                                                {/* {getArrowIcon("West")} */}
                                            </th>
                                        )}


                                        {/* ################################################################################################## */}
                                        {/* ########################## Under Detail Pane ---> Exit ---> West ########################## */}
                                        {columnVisibility.egat_west && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`} rowSpan={1} scope="col" colSpan={1}
                                                // onClick={() => handleSortBalReport("detail_exit_west_egat", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => handleSortBalReportRowWhiteModify("detail_exit_west_egat", sortState, setSortState, setSortedData, tableData)}
                                            >
                                                {`EGAT`}
                                                {getArrowIcon("detail_exit_west_egat")}
                                            </th>
                                        )}

                                        {columnVisibility.ipp_west && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`} rowSpan={1} scope="col" colSpan={1}
                                                // onClick={() => handleSortBalReport("detail_exit_west_ipp", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => handleSortBalReportRowWhiteModify("detail_exit_west_ipp", sortState, setSortState, setSortedData, tableData)}
                                            >
                                                {`IPP`}
                                                {getArrowIcon("detail_exit_west_ipp")}
                                            </th>
                                        )}

                                        {columnVisibility.others_west_exit && (
                                            <th
                                                className={`${table_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`} rowSpan={1} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("detail_exit_east_ipp", sortState, setSortState, setSortedData, tableData)}
                                            >
                                                {`Others`}
                                                {/* {getArrowIcon("West")} */}
                                            </th>
                                        )}

                                        {/* ################################################################################################## */}
                                        {/* ########################## Under Detail Pane ---> Exit ---> East-West ########################## */}
                                        {columnVisibility.egat_east_west && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`} rowSpan={1} scope="col" colSpan={1}
                                                // onClick={() => handleSortBalReport("detail_exit_east-west_egat", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => handleSortBalReportRowWhiteModify("detail_exit_east-west_egat", sortState, setSortState, setSortedData, tableData)}
                                            >
                                                {`EGAT`}
                                                {getArrowIcon("detail_exit_east-west_egat")}
                                            </th>
                                        )}

                                        {columnVisibility.ipp_east_west && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`} rowSpan={1} scope="col" colSpan={1}
                                                // onClick={() => handleSortBalReport("detail_exit_east-west_ipp", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => handleSortBalReportRowWhiteModify("detail_exit_east-west_ipp", sortState, setSortState, setSortedData, tableData)}
                                            >
                                                {`IPP`}
                                                {getArrowIcon("detail_exit_east-west_ipp")}
                                            </th>
                                        )}

                                        {columnVisibility.others_east_west_exit && (
                                            <th
                                                className={`${table_header_style} text-[#58585A] bg-[#E5E5E5] hover:bg-[#e0e0e0] text-center min-w-[173px] w-[180px] max-w-[200px]`} rowSpan={1} scope="col" colSpan={1}
                                            // onClick={() => handleSortBalReport("detail_exit_west_ipp", sortState, setSortState, setSortedData, tableData)}
                                            >
                                                {`Others`}
                                                {/* {getArrowIcon("West")} */}
                                            </th>
                                        )}


                                        {/* ################################################################################################## */}
                                        {/* ########################## Under Detail Pane ---> Exit ---> F2&G ########################## */}
                                        {columnVisibility.east_f2andg && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#E5EED9] hover:bg-[#def5c0] text-center min-w-[173px] w-[180px] max-w-[200px]`} rowSpan={1} scope="col" colSpan={1}
                                                // onClick={() => handleSortBalReport("detail_exit_east_F2andG", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => handleSortBalReportRowWhiteModify("detail_exit_east_F2andG", sortState, setSortState, setSortedData, tableData)}
                                            >
                                                {`East`}
                                                {getArrowIcon("detail_exit_east_F2andG")}
                                            </th>
                                        )}

                                        {columnVisibility.west_f2andg && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#DBE1F2] hover:bg-[#c8d4f4] text-center min-w-[173px] w-[180px] max-w-[200px]`} rowSpan={1} scope="col" colSpan={1}
                                                // onClick={() => handleSortBalReport("detail_exit_west_F2andG", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => handleSortBalReportRowWhiteModify("detail_exit_west_F2andG", sortState, setSortState, setSortedData, tableData)}
                                            >
                                                {`West`}
                                                {getArrowIcon("detail_exit_west_F2andG")}
                                            </th>
                                        )}


                                        {/* ################################################################################################## */}
                                        {/* ########################## Under Detail Pane ---> Exit ---> E ########################## */}
                                        {columnVisibility.east_e && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#E5EED9] hover:bg-[#def5c0] text-center min-w-[173px] w-[180px] max-w-[200px]`} rowSpan={1} scope="col" colSpan={1}
                                                // onClick={() => handleSortBalReport("detail_exit_E_east", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => handleSortBalReportRowWhiteModify("detail_exit_E_east", sortState, setSortState, setSortedData, tableData)}
                                            >
                                                {`East`}
                                                {getArrowIcon("detail_exit_E_east")}
                                            </th>
                                        )}

                                        {columnVisibility.west_e && (
                                            <th
                                                className={`${table_sort_header_style} text-[#58585A] bg-[#DBE1F2] hover:bg-[#c8d4f4] text-center min-w-[173px] w-[180px] max-w-[200px]`} rowSpan={1} scope="col" colSpan={1}
                                                // onClick={() => handleSortBalReport("detail_exit_E_west", sortState, setSortState, setSortedData, tableData)}
                                                onClick={() => handleSortBalReportRowWhiteModify("detail_exit_E_west", sortState, setSortState, setSortedData, tableData)}
                                            >
                                                {`West`}
                                                {getArrowIcon("detail_exit_E_west")}
                                            </th>
                                        )}

                                    </>
                                )}

                            </tr>
                        </thead>

                        <tbody>
                            {/* TEST 3 Steps map */}
                            {sortedData && sortedData.map((row: any, index: any) => (
                                <>
                                    {row?.shipper_data?.map((shipperItem: any, cIdx: number) => (
                                        <>
                                            {isBothFalse && shipperItem?.contract_data?.map((contract: any, index: number) => (
                                                <ContractRowWhite
                                                    key={`contract-${row.request_number}-${cIdx}-${index}`}
                                                    row={row}
                                                    shipperItem={shipperItem}
                                                    contract={contract}
                                                    cIdx={cIdx}
                                                    index={index}
                                                    table_row_style={table_row_style}
                                                    shipperGroupData={shipperGroupData}
                                                    columnVisibility={columnVisibility}
                                                />
                                            ))}

                                            {/* {(isBothFalse || showTotal) && ( */}
                                            {((isBothFalse || showTotal) && (row?.matchDataRowBlue == undefined || row?.matchDataRowBlue)) && (
                                                <ContractRowBlue
                                                    key={`contract-${row.request_number}-${cIdx}-blue`}
                                                    row={row}
                                                    shipperItem={shipperItem}
                                                    cIdx={cIdx}
                                                    index={0} // or whatever makes sense
                                                    table_row_style={table_row_style}
                                                    shipperGroupData={shipperGroupData}
                                                    columnVisibility={columnVisibility}
                                                />
                                            )}
                                        </>
                                    ))}

                                    {/* {
                                        // (isBothFalse || showTotalAllShipper) && <ContractRowYellow
                                        ((isBothFalse || showTotalAllShipper) && (row?.matchDataRowYellow == undefined || row?.matchDataRowYellow)) && <ContractRowYellow
                                            key={'main-' + row?.request_number}
                                            row={row}
                                            // shipperItem={shipperItem}
                                            // contract={contract}
                                            // cIdx={cIdx}
                                            index={index}
                                            table_row_style={table_row_style}
                                            shipperGroupData={shipperGroupData}
                                            columnVisibility={columnVisibility}
                                        />
                                    } */}

                                    {
                                        !isShipper &&
                                        ((isBothFalse || showTotalAllShipper) && (row?.matchDataRowYellow == undefined || row?.matchDataRowYellow)) && (
                                            <ContractRowYellow
                                                key={'main-' + row?.request_number}
                                                row={row}
                                                index={index}
                                                table_row_style={table_row_style}
                                                shipperGroupData={shipperGroupData}
                                                columnVisibility={columnVisibility}
                                            />
                                        )
                                    }
                                </>
                            ))}
                        </tbody>

                    </table>
                    :
                    <TableSkeleton />
            }

            {
                isLoading && sortedData?.length == 0 && <NodataTable />
            }

        </div >
    )
}

export default TableMain;