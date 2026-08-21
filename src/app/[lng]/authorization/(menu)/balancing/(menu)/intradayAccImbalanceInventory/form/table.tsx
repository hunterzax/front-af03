import { useEffect } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatNumberFourDecimal } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort, handleSortTimeStamp } from "@/utils/sortTable";
import NodataTable from "@/components/other/nodataTable";
import { postService } from "@/utils/postService";

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isBetween from "dayjs/plugin/isBetween";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import weekday from "dayjs/plugin/weekday";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(isBetween); // Extend Day.js with isBetween plugin
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(weekday);
dayjs.tz.setDefault("Asia/Bangkok")

interface TableProps {
  tableData: any;
  setCheckPublic: any;
  isLoading: any;
  tabIndex: any;
  gasWeekFilter?: any;
  columnVisibility: any;
  initialColumns: any;
  userPermission?: any;
  userDT?: any;
  sortedData?: any;
  setSortedData?: any;
}

const TableBalIntradayAccImbalanceInventory: React.FC<TableProps> = ({ tableData, setCheckPublic, isLoading, tabIndex, columnVisibility, initialColumns, userPermission, gasWeekFilter, userDT, sortedData, setSortedData }) => {

  const [sortState, setSortState] = useState({ column: null, direction: null });
  // const [sortedData, setSortedData] = useState(tableData);

  const colorMap: Record<string, string> = {
    // NORMAL: '#229E60', // v2.0.46 การแสดงสี highlight ถ้าเป็น Alert (สีเหลือง), Normal (สีเขียว) ไม่ต้องแสดง และปรับโทนสีม่วง แดง ส้ม ให้เหมือนกันกับสีใน Intraday Base Inventory https://app.clickup.com/t/86etym1r8
    // ALERT: '#E8B83D', // v2.0.46 การแสดงสี highlight ถ้าเป็น Alert (สีเหลือง), Normal (สีเขียว) ไม่ต้องแสดง และปรับโทนสีม่วง แดง ส้ม ให้เหมือนกันกับสีใน Intraday Base Inventory https://app.clickup.com/t/86etym1r8
    NORMAL: '#464255',
    ALERT: '#464255',
    IF: '#F06500',
    OFO: '#ED1B24',
    DD: '#A855C5',
    MAX: '#A855C5',
    DEFAULT: '#464255',
  };

  const pushBackValidationColors = (data: any[]) => {
    data.forEach((row: any) => {
      const applyColor = (section: any[] = []) => {
        section.forEach((item: any) => {
          const validation = item?.validation;
          item.color = colorMap[validation] || colorMap.DEFAULT;
        });
      };

      applyColor(row.valiedateEast);
      applyColor(row.valiedateWest);
    });
  };

  useEffect(() => {

    if (tableData && tableData.length > 0) {
      setSortedData(tableData);
      pushBackValidationColors(tableData);
    } else {
      setSortedData([]); // v2.0.46 smart search ใช้งานไม่ได้ https://app.clickup.com/t/86etym1qw ถ้าไม่ set  [] table จะมีข้อมูลค้าง
    }
    // setSortedData(tableData);
  }, [tableData]);

  // เอาไว้ span column แบบ dynamic เคสเปิด ปิดไส้ใน
  const getVisibleChildCount = (parentKey: string) => initialColumns?.filter((col: any) => col.parent_id === parentKey && columnVisibility[col.key]).length || 1;

  const postPublicationCenter = async (data: any) => {

    // master/allocation/publication-center
    const body_post = {
      "execute_timestamp": data?.execute_timestamp,
      "gas_day": data?.gas_day,
      "gas_hour": data?.gas_hour
    }

    const res_ = await postService('/master/allocation/publication-center', body_post);
    setCheckPublic(true)
  }

  const getArrowIcon = (column: string) => {
    return <div className={`${table_col_arrow_sort_style}`}>
      <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
      <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
    </div>
  };

  return (
    <div className={`relative h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md z-1`}>

      {
        isLoading ?
          <table className="w-full text-sm text-left rtl:text-right text-gray-500">

            <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
              <tr className="h-9">

                 {columnVisibility.publicate && userDT?.account_manage?.[0]?.user_type_id !== 3 && (
                  <th
                    className={`${table_header_style} text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={4} scope="col"
                  >
                    {`Publicate`}
                  </th>
                )}

                {columnVisibility.gas_day && (
                  <th
                    className={`${table_sort_header_style} text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={4} scope="col" onClick={() => handleSort("gasHour", sortState, setSortState, setSortedData, tableData)}
                  >
                    {`Gas Day`}
                    {getArrowIcon("gasDay")}
                  </th>
                )}

                {columnVisibility.gas_hour && (
                  <th
                    className={`${table_sort_header_style} text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={4} scope="col" onClick={() => handleSort("gasHour", sortState, setSortState, setSortedData, tableData)}
                  >
                    {`Gas Hour`}
                    {getArrowIcon("gasHour")}
                  </th>
                )}

               {columnVisibility.timestamp && (
                  <th
                    className={`${table_sort_header_style} text-center min-w-[150px] w-[170px] max-w-[200px]`}
                    rowSpan={4}
                    scope="col"
                    onClick={() => handleSortTimeStamp("timestamp", sortState, setSortState, setSortedData, tableData)}
                  >
                    {`Timestamp`}
                    {getArrowIcon("timestamp")}
                  </th>
                )}

                {columnVisibility.acc_total_inventory_mmbtu && (
                  <th
                    className={`${table_header_style} bg-[#1473A1] text-center`}
                    // colSpan={2}
                    colSpan={getVisibleChildCount("acc_total_inventory_mmbtu")}
                    scope="col"
                  >
                    {`Acc. Total Inventory (MMBTU)`}
                  </th>
                )}

                {columnVisibility.base_inventory && (
                  <th
                    className={`${table_header_style} bg-[#1473A1] text-center`}
                    // colSpan={2} 
                    colSpan={getVisibleChildCount("base_inventory")}
                    scope="col"
                  >
                    {`Base Inventory (MMBTU)`}
                  </th>
                )}

                {columnVisibility.total_acc_imb_inventory_mmbtu && (
                  <th
                    className={`${table_header_style} bg-[#1473A1] text-center`}
                    // colSpan={2} 
                    colSpan={getVisibleChildCount("total_acc_imb_inventory_mmbtu")}
                    scope="col"
                  >
                    {`Total Acc. IMB. (Inventory) (MMBTU)`}
                  </th>
                )}

                {columnVisibility.acc_imb_exclude_ptt_shipper_mmbtu && (
                  <th
                    className={`${table_header_style} bg-[#1473A1] text-center`}
                    // colSpan={2} 
                    colSpan={getVisibleChildCount("acc_imb_exclude_ptt_shipper_mmbtu")}
                    scope="col"
                  >
                    {`Acc. IMB. Exclude PTT Shipper (MMBTU)`}
                  </th>
                )}

                {columnVisibility.other_mmbtu && (
                  <th
                    className={`${table_header_style} bg-[#1473A1] text-center`}
                    // colSpan={2} 
                    colSpan={getVisibleChildCount("other_mmbtu")}
                    scope="col"
                  >
                    {`Others (MMBTU)`}
                  </th>
                )}

                {columnVisibility.acc_imb_inventory_for_ptt_shipper_mmbtu && (
                  <th
                    className={`${table_header_style} bg-[#1473A1] text-center`}
                    // colSpan={2}
                    colSpan={getVisibleChildCount("acc_imb_inventory_for_ptt_shipper_mmbtu")}
                    scope="col"
                  >
                    {`Acc. IMB. Inventory for PTT Shipper (MMBTU)`}
                  </th>
                )}

                {columnVisibility.mode_zone && (
                  <th
                    className={`${table_header_style} bg-[#1473A1] text-center`}
                    // colSpan={2}
                    colSpan={getVisibleChildCount("mode_zone")}
                    scope="col"
                  >
                    {`Mode/Zone`}
                  </th>
                )}
              </tr>

              <tr className="h-9">

                {columnVisibility.acc_total_inventory_mmbtu && (<>
                  {columnVisibility.east_acc_total_inventory_mmbtu && (
                    <th
                      className={`${table_sort_header_style}  text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={1} scope="col" colSpan={1} onClick={() => handleSort("east_totalInv", sortState, setSortState, setSortedData, tableData)}
                    >
                      {`East`}
                      {getArrowIcon("east_totalInv")}
                    </th>
                  )}

                  {columnVisibility.west_acc_total_inventory_mmbtu && (
                    <th
                      className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={1} scope="col" colSpan={1} onClick={() => handleSort("west_totalInv", sortState, setSortState, setSortedData, tableData)}
                    >
                      {`West`}
                      {getArrowIcon("west_totalInv")}
                    </th>
                  )}
                </>)}


                {columnVisibility.base_inventory && (<>
                  {columnVisibility.east_base_inventory && (
                    <th
                      className={`${table_sort_header_style}  text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={1} scope="col" colSpan={1} onClick={() => handleSort("east_baseInv", sortState, setSortState, setSortedData, tableData)}
                    >
                      {`East`}
                      {getArrowIcon("east_baseInv")}
                    </th>
                  )}

                  {columnVisibility.west_base_inventory && (
                    <th
                      className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={1} scope="col" colSpan={1} onClick={() => handleSort("west_baseInv", sortState, setSortState, setSortedData, tableData)}
                    >
                      {`West`}
                      {getArrowIcon("west_baseInv")}
                    </th>
                  )}
                </>)}


                {columnVisibility.total_acc_imb_inventory_mmbtu && (<>
                  {columnVisibility.east_total_acc_imb_inventory_mmbtu && (
                    <th
                      className={`${table_sort_header_style}  text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={1} scope="col" colSpan={1} onClick={() => handleSort("east_totalAccImbInv", sortState, setSortState, setSortedData, tableData)}
                    >
                      {`East`}
                      {getArrowIcon("east_totalAccImbInv")}
                    </th>
                  )}

                  {columnVisibility.west_total_acc_imb_inventory_mmbtu && (
                    <th
                      className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={1} scope="col" colSpan={1} onClick={() => handleSort("west_totalAccImbInv", sortState, setSortState, setSortedData, tableData)}
                    >
                      {`West`}
                      {getArrowIcon("west_totalAccImbInv")}
                    </th>
                  )}
                </>)}


                {columnVisibility.acc_imb_exclude_ptt_shipper_mmbtu && (<>
                  {columnVisibility.east_acc_imb_exclude_ptt_shipper_mmbtu && (
                    <th
                      className={`${table_sort_header_style}  text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={1} scope="col" colSpan={1} onClick={() => handleSort("east_accImbExculdePTT", sortState, setSortState, setSortedData, tableData)}
                    >
                      {`East`}
                      {getArrowIcon("east_accImbExculdePTT")}
                    </th>
                  )}

                  {columnVisibility.west_acc_imb_exclude_ptt_shipper_mmbtu && (
                    <th
                      className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={1} scope="col" colSpan={1} onClick={() => handleSort("west_accImbExculdePTT", sortState, setSortState, setSortedData, tableData)}
                    >
                      {`West`}
                      {getArrowIcon("west_accImbExculdePTT")}
                    </th>
                  )}
                </>)}


                {columnVisibility.other_mmbtu && (<>
                  {columnVisibility.east_other_mmbtu && (
                    <th
                      className={`${table_sort_header_style}  text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={1} scope="col" colSpan={1} onClick={() => handleSort("east_other", sortState, setSortState, setSortedData, tableData)}
                    >
                      {`East`}
                      {getArrowIcon("east_other")}
                    </th>
                  )}

                  {columnVisibility.west_other_mmbtu && (
                    <th
                      className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={1} scope="col" colSpan={1} onClick={() => handleSort("west_other", sortState, setSortState, setSortedData, tableData)}
                    >
                      {`West`}
                      {getArrowIcon("west_other")}
                    </th>
                  )}
                </>)}


                {columnVisibility.acc_imb_inventory_for_ptt_shipper_mmbtu && (<>
                  {columnVisibility.east_acc_imb_inventory_for_ptt_shipper_mmbtu && (
                    <th
                      className={`${table_sort_header_style}  text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={1} scope="col" colSpan={1} onClick={() => handleSort("east_accImbInvPTT", sortState, setSortState, setSortedData, tableData)}
                    >
                      {`East`}
                      {getArrowIcon("east_accImbInvPTT")}
                    </th>
                  )}

                  {columnVisibility.west_acc_imb_inventory_for_ptt_shipper_mmbtu && (
                    <th
                      className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={1} scope="col" colSpan={1} onClick={() => handleSort("west_accImbInvPTT", sortState, setSortState, setSortedData, tableData)}
                    >
                      {`West`}
                      {getArrowIcon("west_accImbInvPTT")}
                    </th>
                  )}
                </>)}


                {columnVisibility.mode_zone && (<>
                  {columnVisibility.east_mode_zone && (
                    <th
                      className={`${table_sort_header_style}  text-[#58585A] bg-[#DBE4FF] hover:bg-[#CBD8F0] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={1} scope="col" colSpan={1} onClick={() => handleSort("east_mode_zone", sortState, setSortState, setSortedData, tableData)}
                    >
                      {`East`}
                      {getArrowIcon("east_mode_zone")}
                    </th>
                  )}

                  {columnVisibility.west_mode_zone && (
                    <th
                      className={`${table_sort_header_style} text-[#58585A] bg-[#FFCEE2] hover:bg-[#fcb3ce] text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={1} scope="col" colSpan={1} onClick={() => handleSort("west_mode_zone", sortState, setSortState, setSortedData, tableData)}
                    >
                      {`West`}
                      {getArrowIcon("west_mode_zone")}
                    </th>
                  )}
                </>)}

              </tr>
            </thead>

            <tbody>
              {sortedData && sortedData?.map((row: any, index: any) => {
                return (
                  <tr
                    key={row?.id}
                    className={`${table_row_style}`}
                  >

                    


                    {columnVisibility.publicate && userDT?.account_manage?.[0]?.user_type_id !== 3 && (
                      <td className="px-2 py-1 text-[#464255] max-w-[60px] text-center">

                        <input
                          type="checkbox"
                          checked={row?.publication ? row?.publication : false}
                          // disabled={row.query_shipper_nomination_status_id !== 1}
                          // onChange={() => handleSelectRow(row)}
                          onChange={() => postPublicationCenter(row)}
                          // className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1]"
                          className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1] disabled:opacity-100 disabled:cursor-not-allowed"
                        />
                      </td>
                    )}

                  

                    {columnVisibility.gas_day && (
                      <td className="px-2 py-1 text-[#464255] max-w-[60px] text-center">{row?.gas_day ? dayjs(row["gas_day"], "YYYY-MM-DD").format("DD/MM/YYYY") : ''}</td>
                    )}
                  

                    {columnVisibility.gas_hour && (
                      <td className="px-2 py-1 text-[#464255] max-w-[60px] text-center">{row?.gasHour ? row?.gasHour : ''}</td>
                    )}

                      {columnVisibility.timestamp && (
                      <td className="px-2 py-1 text-[#464255] max-w-[60px] text-center">{row?.timestamp ? row?.timestamp : ''}</td>
                    )}

                    {columnVisibility.east_acc_total_inventory_mmbtu && (
                      <td className={`px-2 py-1 max-w-[60px] text-right`} style={{ color: row?.valiedateEast?.find((item: any) => item.tag === "totalInv")?.color, }}>
                        {/* {row?.east_totalInv ? formatNumberFourDecimal(row?.east_totalInv) : ''} */}
                        {row?.east_totalInv !== null && row?.east_totalInv !== undefined ? formatNumberFourDecimal(row?.east_totalInv) : ''}
                      </td>
                    )}

                    {columnVisibility.west_acc_total_inventory_mmbtu && (
                      <td className={`px-2 py-1 text-[#464255] max-w-[60px] text-right`} style={{ color: row?.valiedateWest?.find((item: any) => item.tag === "totalInv")?.color }}>
                        {/* {row?.west_totalInv ? formatNumberFourDecimal(row?.west_totalInv) : ''} */}
                        {row?.west_totalInv !== null && row?.west_totalInv !== undefined ? formatNumberFourDecimal(row?.west_totalInv) : ''}
                      </td>
                    )}

                    {columnVisibility.east_base_inventory && (
                      <td className={`px-2 py-1 text-[#464255] max-w-[60px] text-right`} style={{ color: row?.valiedateEast?.find((item: any) => item.tag === "baseInv")?.color }}>
                        {/* {row?.east_baseInv ? formatNumberFourDecimal(row?.east_baseInv) : ''} */}
                        {row?.east_baseInv !== null && row?.east_baseInv !== undefined ? formatNumberFourDecimal(row?.east_baseInv) : ''}
                      </td>
                    )}

                    {columnVisibility.west_base_inventory && (
                      <td className={`px-2 py-1 text-[#464255] max-w-[60px] text-right`} style={{ color: row?.valiedateWest?.find((item: any) => item.tag === "baseInv")?.color }}>
                        {/* {row?.west_baseInv ? formatNumberFourDecimal(row?.west_baseInv) : ''} */}
                        {row?.west_baseInv !== null && row?.west_baseInv !== undefined ? formatNumberFourDecimal(row?.west_baseInv) : ''}
                      </td>
                    )}

                    {columnVisibility.east_total_acc_imb_inventory_mmbtu && (
                      <td className={`px-2 py-1 text-[#464255] max-w-[60px] text-right`} style={{ color: row?.valiedateEast?.find((item: any) => item.tag === "totalAccImbInv")?.color }}>
                        {/* {row?.east_totalAccImbInv ? formatNumberFourDecimal(row?.east_totalAccImbInv) : ''} */}
                        {row?.east_totalAccImbInv !== null && row?.east_totalAccImbInv !== undefined ? formatNumberFourDecimal(row?.east_totalAccImbInv) : ''}
                      </td>
                    )}

                    {columnVisibility.west_total_acc_imb_inventory_mmbtu && (
                      <td className={`px-2 py-1 text-[#464255] max-w-[60px] text-right`} style={{ color: row?.valiedateWest?.find((item: any) => item.tag === "totalAccImbInv")?.color }}>
                        {/* {row?.west_totalAccImbInv ? formatNumberFourDecimal(row?.west_totalAccImbInv) : ''} */}
                        {row?.west_totalAccImbInv !== null && row?.west_totalAccImbInv !== undefined ? formatNumberFourDecimal(row?.west_totalAccImbInv) : ''}
                      </td>
                    )}

                    {columnVisibility.east_acc_imb_exclude_ptt_shipper_mmbtu && (
                      <td className={`px-2 py-1 text-[#464255] max-w-[60px] text-right`} style={{ color: row?.valiedateEast?.find((item: any) => item.tag === "accImbExculdePTT")?.color }}>
                        {/* {row?.east_accImbExculdePTT ? formatNumberFourDecimal(row?.east_accImbExculdePTT) : ''} */}
                        {row?.east_accImbExculdePTT !== null && row?.east_accImbExculdePTT !== undefined ? formatNumberFourDecimal(row?.east_accImbExculdePTT) : ''}
                      </td>
                    )}

                    {columnVisibility.west_acc_imb_exclude_ptt_shipper_mmbtu && (
                      <td className={`px-2 py-1 text-[#464255] max-w-[60px] text-right`} style={{ color: row?.valiedateWest?.find((item: any) => item.tag === "accImbExculdePTT")?.color }}>
                        {/* {row?.west_accImbExculdePTT ? formatNumberFourDecimal(row?.west_accImbExculdePTT) : ''} */}
                        {row?.west_accImbExculdePTT !== null && row?.west_accImbExculdePTT !== undefined ? formatNumberFourDecimal(row?.west_accImbExculdePTT) : ''}
                      </td>
                    )}

                    {columnVisibility.east_other_mmbtu && (
                      <td className={`px-2 py-1 text-[#464255] max-w-[60px] text-right`} style={{ color: row?.valiedateEast?.find((item: any) => item.tag === "other")?.color }}>
                        {/* {row?.east_other ? formatNumberFourDecimal(row?.east_other) : ''} */}
                        {row?.east_other !== null && row?.east_other !== undefined ? formatNumberFourDecimal(row?.east_other) : ''}
                      </td>
                    )}

                    {columnVisibility.west_other_mmbtu && (
                      <td className={`px-2 py-1 text-[#464255] max-w-[60px] text-right`} style={{ color: row?.valiedateWest?.find((item: any) => item.tag === "other")?.color }}>
                        {/* {row?.west_other ? formatNumberFourDecimal(row?.west_other) : ''} */}
                        {row?.west_other !== null && row?.west_other !== undefined ? formatNumberFourDecimal(row?.west_other) : ''}
                      </td>
                    )}

                    {columnVisibility.east_acc_imb_inventory_for_ptt_shipper_mmbtu && (
                      <td className={`px-2 py-1 text-[#464255] max-w-[60px] text-right`} style={{ color: row?.valiedateEast?.find((item: any) => item.tag === "accImbInvPTT")?.color }}>
                        {/* {row?.east_accImbInvPTT ? formatNumberFourDecimal(row?.east_accImbInvPTT) : ''} */}
                        {row?.east_accImbInvPTT !== null && row?.east_accImbInvPTT !== undefined ? formatNumberFourDecimal(row?.east_accImbInvPTT) : ''}
                      </td>
                    )}

                    {columnVisibility.west_acc_imb_inventory_for_ptt_shipper_mmbtu && (
                      <td className={`px-2 py-1 text-[#464255] max-w-[60px] text-right`} style={{ color: row?.valiedateWest?.find((item: any) => item.tag === "accImbInvPTT")?.color }}>
                        {/* {row?.west_accImbInvPTT ? formatNumberFourDecimal(row?.west_accImbInvPTT) : ''} */}
                        {row?.west_accImbInvPTT !== null && row?.west_accImbInvPTT !== undefined ? formatNumberFourDecimal(row?.west_accImbInvPTT) : ''}
                      </td>
                    )}

                    {columnVisibility.east_mode_zone && (
                      // <td className={`px-2 py-1 text-[#464255] max-w-[60px] `}>{row?.east_mode_zone ? formatNumberFourDecimal(row?.east_mode_zone) : ''}</td>
                      <td className={`px-2 py-1 text-[#464255] max-w-[60px] `}>{row?.east_mode_zone ? row?.east_mode_zone : ''}</td>
                    )}

                    {columnVisibility.west_mode_zone && (
                      <td className={`px-2 py-1 text-[#464255] max-w-[60px] `}>{row?.west_mode_zone ? row?.west_mode_zone : ''}</td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
          :
          <TableSkeleton />
      }

      {
        isLoading && sortedData?.length == 0 && <NodataTable />
      }
    </div>
  )
}

export default TableBalIntradayAccImbalanceInventory;