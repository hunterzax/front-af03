import { useEffect } from "react";
import React, { FC, useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatNumberThreeDecimal } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import NodataTable from "@/components/other/nodataTable";
import dayjs from "dayjs";
import { handleSortDailyAdjustment } from "../sortFunc";

interface TableProps {
  tableData?: any;
  tableDataCurrent?: any;
  tableDataAll?: any;
  isLoading: any;
  tableType?: any;
  columnVisibility: any;
  userPermission?: any;
}

const TableTabTotal: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility, userPermission, tableType, tableDataCurrent, tableDataAll }) => {
  const [sortState, setSortState] = useState({ column: null, direction: null });
  const [sortedData, setSortedData] = useState(tableData);
  const [closestTimeGroup, setClosestTimeGroup] = useState<any>(tableData);
  const [headerMap, setHeaderMap] = useState<Record<string, Set<string>>>({});

  const [isNodata, setIsNodata] = useState<boolean>(true);

  // ###################### SORT timeShow of closestTimeGroup ######################
  const [rows, setRows] = useState<
    { entry: any; group: any; item: any; ts: any }[]
  >([]);

  useEffect(() => {
    if (tableType == 'current') {
      const now = dayjs(); // current time

      if (tableDataCurrent?.length > 0) {
        const closed_time = tableDataCurrent?.reduce((prev: any, curr: any) => {
          const prevTime = dayjs(`${dayjs().format('YYYY-MM-DD')}T${prev.time}`).valueOf();
          const currTime = dayjs(`${dayjs().format('YYYY-MM-DD')}T${curr.time}`).valueOf();
          const nowTime = now.valueOf();

          const prevDiff = Math.abs(prevTime - nowTime);
          const currDiff = Math.abs(currTime - nowTime);

          return currDiff < prevDiff ? curr : prev;
        });
        setClosestTimeGroup(closed_time)
      }

      setIsNodata(tableDataCurrent?.length > 0 ? false : true)
    } else {

      setClosestTimeGroup(tableDataAll)
      setIsNodata(tableDataAll?.length > 0 ? false : true)

      // setClosestTimeGroup(closed_time)
    }
    // setSortedData(closed_time)
  }, [tableDataCurrent, tableDataAll]);

  // >>>>>> MAP Header table filter

  useEffect(() => {
    const newHeaderMap: Record<string, Set<string>> = {};

    if (tableDataAll?.length > 0) {

      tableDataAll.forEach((entry: any) => {
        entry.groups.forEach((group: any) => {
          if (!newHeaderMap[group.point]) {
            newHeaderMap[group.point] = new Set();
          }
          group.items.forEach((item: any) => {
            newHeaderMap[group.point].add(item.shipper_name);
          });
        });
      });
    }

    setHeaderMap(newHeaderMap);
  }, [tableDataAll]);

  const getArrowIcon = (column: string) => {
    return <div className={`${table_col_arrow_sort_style}`}>
      <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
      <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
    </div>
  };

  // 1017 == allocation shipper report (parent = 80, seq = 7)
  // role EGAT SHIPPER == 58
  // role PTT == 74

  // ###################### SORT timeShow of closestTimeGroup ######################

  useEffect(() => {
    if (tableType == 'all' && tableDataAll?.length > 0) {
      if (!closestTimeGroup) {
        setRows([]);
        return;
      }

      if (tableDataAll?.length == 0) {
        setRows([]);
        return;
      }

      // 1) flatten every timeShow into a row object
      const allRows = closestTimeGroup?.flatMap((entry: any) =>
        entry.groups?.flatMap((group: any) =>
          group.items?.flatMap((item: any) =>
            (item.timeShow || [])
              .slice() // clone
              .sort((a: any, b: any) => a.time.localeCompare(b.time))
              .map((ts: any) => ({ entry, group, item, ts }))
          )
        )
      )?.map((e: any) => e?.entry);

      // 2) global sort by ts.time
      // allRows.sort((a: any, b: any) => a.ts.time.localeCompare(b.ts.time));
      // allRows.sort((a: any, b: any) => a.ts.time.localeCompare(b.ts.time))

      const seenallRows = new Set();
      const uniqueallRows = allRows.filter((item: any) => {
        const key = JSON.stringify(item);
        if (seenallRows.has(key)) return false;
        seenallRows.add(key);
        return true;
      });

      // 3) push into state
      setRows(uniqueallRows);
    }

  }, [closestTimeGroup, tableDataAll]);

  return (
    <div className={`relative ${tableType == 'current' ? 'h-[calc(100vh-490px)]' : 'h-[calc(100vh-200px)]'}  overflow-y-auto block  rounded-t-md z-1`}>

      {
        isLoading ?
          <table className="w-full text-sm text-left rtl:text-right text-gray-500">

            {/* #################################### TABLE CURRENT #################################### */}
            {
              tableType == 'current' && !isNodata &&
              <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                <tr className="h-9">
                  {/* 1st col: Current Time */}
                  {columnVisibility.current_time && tableType === 'current' && (
                    <th
                      scope="col"
                      rowSpan={2}
                      className={`${table_sort_header_style} !min-w-[50px] !w-[150px] !max-w-[170px] border-r-[1px] border-r-[#308DBA]`}
                      onClick={() =>
                        handleSort(
                          "current_time",
                          sortState,
                          setSortState,
                          setSortedData,
                          tableType === 'current' ? tableDataCurrent : tableDataAll
                        )
                      }
                    >
                      {`Current Time`}
                      {getArrowIcon("current_time")}
                    </th>
                  )}

                  {columnVisibility.current_time && tableType === 'all' && (
                    <th
                      scope="col"
                      rowSpan={2}
                      className={`${table_sort_header_style} !min-w-[50px] !w-[150px] !max-w-[170px]`}
                      onClick={() => handleSort("current_time", sortState, setSortState, setSortedData, tableType === 'current' ? tableDataCurrent : tableDataAll)}
                    >
                      {`Time`}
                      {getArrowIcon("current_time")}
                    </th>
                  )}

                  {/* 2nd+ cols: point headers with colSpan */}
                  {closestTimeGroup?.groups?.map((group: any) => (
                    <th
                      key={group.point}
                      colSpan={group.items.length + 1} // shipper names + total
                      className={`${table_header_style} border-r-[1px] border-r-[#308DBA] border-l-[1px] border-l-[#308DBA] text-center`}
                    >
                      {group.point}
                    </th>
                  ))}
                </tr>

                {/* 2nd header row: shipper names + Total under each point */}
                <tr className="h-9">
                  {closestTimeGroup?.groups?.map((group: any) =>
                    group.items.map((item: any, idx: any) => (
                      <th
                        key={`${group.point}-${item.rowId}`}
                        className={`${table_sort_header_style} text-center bg-[#00ADEF] `}
                        onClick={() => handleSort(`${group.point}-${item.rowId}`, sortState, setSortState, setSortedData, tableType === 'current' ? tableDataCurrent : tableDataAll)}
                      >
                        {item.shipper_name}
                        {getArrowIcon(`${group.point}-${item.rowId}`)}
                      </th>
                    )).concat(
                      <th
                        key={`${group.point}-total`}
                        className={`${table_sort_header_style} w-[150px] max-w-[200px] min-w-[110px] bg-[#E3E9F0] text-[#58585A] text-center hover:bg-[#d7dfe8] select-none`}
                        onClick={() => handleSort(`${group.point}-total`, sortState, setSortState, setSortedData, tableType === 'current' ? tableDataCurrent : tableDataAll)}
                      >
                        {`Total`}
                        {getArrowIcon(`${group.point}-total`)}
                      </th>
                    )
                  )}
                </tr>
              </thead>
            }

            {
              tableType == 'current' && !isNodata && <tbody>
                {closestTimeGroup && (
                  <tr className="h-10 border-b border-gray-200 text-sm text-[#333]">
                    {/* Current Time Column */}
                    {columnVisibility.current_time && tableType === 'current' && (
                      <td className="px-4 py-2 font-semibold">
                        {/* {closestTimeGroup.time} */}
                        {dayjs().format("HH:mm")}
                      </td>
                    )}

                    {columnVisibility.current_time && tableType === 'all' && (
                      <td className="px-4 py-2 font-semibold">
                        {closestTimeGroup.time}
                      </td>
                    )}

                    {/* Loop through groups to display shipper values and totals */}
                    {closestTimeGroup.groups.map((group: any) => (
                      <>
                        {/* Each shipper's value */}
                        {group.items.map((item: any) => (
                          <td
                            key={`val-${group.point}-${item.rowId}`}
                            className="px-4 py-2 text-right"
                          >
                            {/* {item.timeShow[0]?.value?.toFixed(2) ?? "-"} */}
                            {/* {formatNumberThreeDecimal(item.timeShow[0]?.value)} */}
                            {formatNumberThreeDecimal(item.timeShow?.value)}
                          </td>
                        ))}

                        {/* Total column for the group */}
                        <td
                          key={`total-${group.point}`}
                          className="px-4 py-2 text-right font-semibold "
                        >
                          {formatNumberThreeDecimal(group.total)}
                        </td>
                      </>
                    ))}
                  </tr>
                )}

              </tbody>
            }

            {/* #################################### TABLE ALL #################################### */}
            {
              tableType == 'all' && !isNodata &&
              <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                <tr className="h-9">
                  <th
                    scope="col"
                    rowSpan={2}
                    className={`${table_sort_header_style} !min-w-[50px] !w-[150px] !max-w-[170px]`}
                    // onClick={() => handleSortDailyAdjustment("current_time", sortState, setSortState, setSortedData, tableType === 'current' ? tableDataCurrent : tableDataAll)}
                    onClick={() => handleSortDailyAdjustment("current_time", sortState, setSortState, setSortedData, tableType === 'current' ? tableDataCurrent : tableDataAll)}
                  >
                    {`Time`}
                    {getArrowIcon("current_time")}
                  </th>

                  {Object.entries(headerMap).map(([point, shippers]) => (
                    <th
                      key={point}
                      colSpan={shippers.size + 1}
                      className="text-center  px-2 py-1 border-r-[1px] border-r-[#308DBA] border-l-[1px] border-l-[#308DBA]"
                    >
                      {point}
                    </th>
                  ))}
                </tr>

                <tr className="h-9">
                  {Object.entries(headerMap).flatMap(([point, shippers]) => [
                    ...Array.from(shippers).map((shipper) => (
                      <th
                        key={`${point}-${shipper}`}
                        className={`${table_sort_header_style} text-right bg-[#00ADEF]`}
                        // onClick={() => handleSortDailyAdjustment(`${shipper}`, sortState, setSortState, setSortedData, tableType === 'current' ? tableDataCurrent : tableDataAll)}
                        onClick={() =>
                          handleSortDailyAdjustment(
                            `${point}|${shipper}`, // ✅ เปลี่ยนจาก `${shipper}` เป็น `${point}|${shipper}`
                            sortState, setSortState, setSortedData,
                            tableType === 'current' ? tableDataCurrent : tableDataAll
                          )
                        }
                      >
                        {shipper}
                        {/* {getArrowIcon(`${shipper}`)} */}
                        {getArrowIcon(`${point}|${shipper}`)}

                      </th>
                    )),
                    <th
                      key={`${point}-total`}
                      className={`${table_sort_header_style} w-[150px] max-w-[200px] min-w-[110px] bg-[#E3E9F0] text-[#58585A] text-right hover:bg-[#d7dfe8] select-none`}
                      onClick={() => handleSortDailyAdjustment(`${point}-total`, sortState, setSortState, setSortedData, tableType === 'current' ? tableDataCurrent : tableDataAll)}
                    >
                      {`Total`}
                      {getArrowIcon(`${point}-total`)}
                    </th>,
                  ])}
                </tr>
              </thead>
            }

            {tableType === 'all' && !isNodata && (
              <tbody>

                {/* {rows.map(({ entry, group, item, ts }) => { */}
                {rows.map((data: any, ix: number) => {
                // {dataSource?.map((data: any, ix: number) => {

                  return (<tr
                    key={`${ix}`}
                    className="h-10 border-b border-gray-200 text-sm text-[#333]"
                  >
                    <td className="px-4 py-2 font-semibold">{data.time}</td>

                    {Object.entries(headerMap).flatMap(([point, shippers]) => {
                      // Find the group for this point
                      const pointGroup = data.groups.find((g: any) => g.point === point);

                      // Build a map shipper_name → value at this ts.time
                      const shipperMap: Record<string, number> = {};
                      if (pointGroup) {
                        pointGroup.items.forEach((it: any) => {
                          const lookup = Object.fromEntries(it.timeShow.map((t: any) => [t.time, t.value]));
                          shipperMap[it.shipper_name] = lookup[data.time] ?? 0;
                        });
                      }

                      // Render each shipper's value cell
                      const cells = Array.from(shippers).map((sh) => (
                        <td
                          key={`${data.time}-${point}-${sh}`}
                          className="px-2 py-1 text-right"
                        >
                          {formatNumberThreeDecimal(shipperMap[sh] || 0)}
                        </td>
                      ));

                      // Calculate total for all shippers in this point at this time
                      const total = Object.values(shipperMap).reduce((sum, val) => sum + val, 0);

                      // Return all shipper cells + total cell
                      return [
                        ...cells,
                        <td
                          key={`${data.time}-${point}-total`}
                          className="px-2 py-1 text-right font-semibold"
                        >
                          {formatNumberThreeDecimal(total)}
                        </td>,
                      ];
                    })}
                  </tr>)
                })}
              </tbody>
            )}

          </table>
          :
          <TableSkeleton />
      }


      {
        tableType == 'current' && isNodata && <div className="p-4 w-full border rounded-[6px]"> <NodataTable textRender={`No data available at the current time.`} /></div>
      }

      {
        tableType == 'all' && isNodata && <div className="p-4 w-full border rounded-[6px]"> <NodataTable textRender={`Please select filter to view information.`} /></div>
      }


    </div>
  )
}

export default TableTabTotal;