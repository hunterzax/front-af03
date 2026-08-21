import { useEffect, useRef } from "react";
import React, { FC, useState } from 'react';
import TableSkeleton, { DefaultSkeleton } from '@/components/material_custom/DefaultSkeleton';
import { cutUploadFileName, formatDateNoTime, formatNumberThreeDecimal } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort, handleSortGasDay } from "@/utils/sortTable";
import NodataTable from "@/components/other/nodataTable";

interface TableProps {
  tableData: any;
  isLoading: any;
  tabIndex: any;
  gasWeekFilter?: any;
  columnVisibility: any;
  userPermission?: any;
}

const TableNomQualityPlanningDaily: React.FC<TableProps> = ({ tableData, isLoading, tabIndex, columnVisibility, userPermission, gasWeekFilter }) => {
  const [sortState, setSortState] = useState({ column: null, direction: null });
  const [sortedData, setSortedData] = useState(tableData);

  const getArrowIcon = (column: string) => {
    return <div className={`${table_col_arrow_sort_style}`}>
      <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
      <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
    </div>
  };

  useEffect(() => {
    if (tableData && tableData.length > 0) {
      setSortedData(tableData);
    }else{
      setSortedData([]);
    }

  }, [tableData]);

  return (
    <div className={`relative h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md z-1`}>

      {
        isLoading ?
          <table className="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
              <tr className="h-9">

                {columnVisibility.gas_day && (
                  <th scope="col" className={`${table_sort_header_style} text-center w-[100px] !max-w-[120px]`} onClick={() => handleSortGasDay("gasday", sortState, setSortState, setSortedData, tableData)}>
                    {`${tabIndex == 0 || tabIndex == 1 ? 'Gas Day' : 'Gas Week'}`}
                    {getArrowIcon("gasday")}
                  </th>
                )}

                {columnVisibility.zone && (
                  <th scope="col" className={`${table_sort_header_style} text-center  w-[100px] !max-w-[120px] `} onClick={() => handleSort("zone.name", sortState, setSortState, setSortedData, tableData)}>
                    {`Zone`}
                    {getArrowIcon("zone.name")}
                  </th>
                )}

                {columnVisibility.area && (
                  <th scope="col" className={`${table_sort_header_style} text-center w-[100px] !max-w-[120px] `} onClick={() => handleSort("area.name", sortState, setSortState, setSortedData, tableData)}>
                    {`Area`}
                    {getArrowIcon("area.name")}
                  </th>
                )}

                {columnVisibility.parameter && (
                  <th scope="col" className={`${table_sort_header_style} text-center w-[100px] !max-w-[120px] `}
                    onClick={() => handleSort("parameter", sortState, setSortState, setSortedData, tableData)}
                  >
                    {`Parameter`}
                    {getArrowIcon("parameter")}
                  </th>
                )}

                {columnVisibility.value && (
                  <th scope="col" className={`${table_sort_header_style} text-right`}
                    onClick={() => handleSort("valueBtuScf", sortState, setSortState, setSortedData, tableData)}
                  >
                    {`Value (BTU/SCF)`}
                    {getArrowIcon("valueBtuScf")}
                  </th>
                )}

              </tr>
            </thead>

            <tbody>
              {sortedData && sortedData?.map((row: any, index: any) => (
                <tr
                  key={row?.id}
                  className={`${table_row_style}`}
                >

                  {columnVisibility.gas_day && (
                    // <td className="px-2 py-1 text-[#464255] !min-w-[60px] !max-w-[80px] text-center">{row?.gasday ? formatDateNoTime(row?.gasday) : ''}</td>
                    <td className="px-2 py-1 text-[#464255] !min-w-[60px] !max-w-[80px] text-center">{row?.gasday ? row?.gasday : ''}</td>
                  )}

                  {columnVisibility.zone && (
                    <td className="px-2 py-1 justify-center">{row?.zone && <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.zone?.color }}>{`${row?.zone?.name}`}</div>}</td>
                  )}

                  {columnVisibility.area && (
                    <td className="px-2 py-1 justify-center text-center flex ">
                      {
                        row?.area?.entry_exit_id == 2 ?
                          <div
                            className="flex justify-center items-center rounded-full p-1 text-[#464255]"
                            style={{ backgroundColor: row?.area?.color, width: '40px', height: '40px' }}
                          >
                            {`${row?.area?.name}`}
                          </div>
                          :
                          <div
                            className="flex justify-center items-center rounded-lg p-1 text-[#464255]"
                            style={{ backgroundColor: row?.area?.color, width: '40px', height: '40px' }}
                          >
                            {`${row?.area?.name}`}
                          </div>
                      }
                    </td>
                  )}

                  {columnVisibility.parameter && (
                    <td className="px-2 py-1 text-[#464255] text-center">{row?.parameter ? row?.parameter : ''}</td>
                  )}

                  {columnVisibility.value && (
                    // <td className="px-2 py-1 text-[#464255] text-right">
                    <td className={`px-2 py-1 text-[#464255] text-right
                      ${row?.parameter == "HV" && (row?.valueBtuScf > row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_max || row?.valueBtuScf < row?.zone?.zone_master_quality[0]?.v2_sat_heating_value_min) && 'text-red-600'}
                      ${row?.parameter == "WI" && (row?.valueBtuScf > row?.zone?.zone_master_quality[0]?.v2_wobbe_index_max || row?.valueBtuScf < row?.zone?.zone_master_quality[0]?.v2_wobbe_index_min) && 'text-red-600'}
                  `}>
                      {row?.valueBtuScf ? formatNumberThreeDecimal(row?.valueBtuScf) : ''}
                    </td>
                  )}

                </tr>
              ))}
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

export default TableNomQualityPlanningDaily;