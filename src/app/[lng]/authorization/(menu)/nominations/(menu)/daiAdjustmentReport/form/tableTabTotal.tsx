import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import TableSkeleton from "@/components/material_custom/DefaultSkeleton";
import { filterItemsAllNullMmscfd, formatNumberSixDecimal, formatNumberThreeDecimal, formatNumberThreeDecimalNom } from "@/utils/generalFormatter";
import { table_col_arrow_sort_style, table_header_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import NodataTable from "@/components/other/nodataTable";

const TableTabTotal: React.FC<any> = ({
  tableData,
  isLoading,
  columnVisibility,
  userPermission,
  tableType,
  tableDataCurrent,
  tableDataAll,
  autoHeight = false,
  displayUnit
}) => {
  const [sortState, setSortState] = useState<{ column: string | null; direction: "asc" | "desc" | null }>({
    column: null,
    direction: null,
  });

  const [closestTimeGroup, setClosestTimeGroup] = useState<any>(tableData);
  const [headerMap, setHeaderMap] = useState<Record<string, Set<string>>>({});
  const [isNodata, setIsNodata] = useState<boolean>(true);

  const [rows, setRows] = useState<any[]>([]);

  // ====== หา closest time group หรือทั้งหมด ======
  useEffect(() => {
    if (tableType === "current") {
      const now = dayjs();
      if (tableDataCurrent?.length > 0) {
        const closed_time = tableDataCurrent.reduce((prev: any, curr: any) => {
          const prevTime = dayjs(`${dayjs().format("YYYY-MM-DD")}T${prev.time}`).valueOf();
          const currTime = dayjs(`${dayjs().format("YYYY-MM-DD")}T${curr.time}`).valueOf();
          const nowTime = now.valueOf();

          const prevDiff = Math.abs(prevTime - nowTime);
          const currDiff = Math.abs(currTime - nowTime);

          return currDiff < prevDiff ? curr : prev;
        });

        const sortedClosedTime = {
          ...closed_time,
          groups: [...closed_time.groups].sort((a, b) =>
            a.point.localeCompare(b.point, 'en', { sensitivity: 'base' })
          )
        };

        setClosestTimeGroup(sortedClosedTime);
      }
      setIsNodata(!(tableDataCurrent?.length > 0 && tableDataCurrent[0]?.groups?.length > 0));
    } else {
      setClosestTimeGroup(tableDataAll);
      setIsNodata(!(tableDataAll?.length > 0));
    }
  }, [tableDataCurrent, tableDataAll, tableType]);

  // ====== สร้าง headerMap ======
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

    const sortedHeaderMap = Object.fromEntries(
      Object.entries(newHeaderMap).sort(([keyA], [keyB]) =>
        keyA.localeCompare(keyB, "en", { sensitivity: "base" })
      )
    );

    // setHeaderMap(newHeaderMap);
    setHeaderMap(sortedHeaderMap);
  }, [tableDataAll]);

  // ====== แปลง closestTimeGroup → rows ======
  useEffect(() => {
    if (tableType === "all" && tableDataAll?.length > 0) {
      if (!closestTimeGroup) {
        setRows([]);
        return;
      }

      const allTotalRows = closestTimeGroup?.filter((entry: any) => entry.time == "Total")?.flatMap((entry: any) =>
        entry?.groups?.flatMap((group: any) => {
          return group?.items?.flatMap((item: any) =>
            (item.timeShow || [])
              .slice()
              .sort((a: any, b: any) => a.time.localeCompare(b.time))
              .map((ts: any) => ({ entry, group, item, ts }))
          )
        })
      ).map((e: any) => e.entry);

      const totalSeen = new Set();
      const uniqueTotal = allTotalRows.filter((item: any) => {
        const key = JSON.stringify(item);
        if (totalSeen.has(key)) return false;
        totalSeen.add(key);
        return true;
      });
      const sortedTotalRows = uniqueTotal?.map((row: any) => ({
        ...row,
        groups: [...row.groups].sort((a, b) =>
          a.point.localeCompare(b.point, "en", { sensitivity: "base" })
        )
      }));

      const allRows = closestTimeGroup?.filter((entry: any) => entry.time != "Total")?.flatMap((entry: any) =>
        entry?.groups?.flatMap((group: any) => {
          return group?.items?.flatMap((item: any) =>
            (item.timeShow || [])
              .slice()
              .sort((a: any, b: any) => a.time.localeCompare(b.time))
              .map((ts: any) => ({ entry, group, item, ts }))
          )
        })
      ).map((e: any) => e.entry);

      const seen = new Set();
      const unique = allRows.filter((item: any) => {
        const key = JSON.stringify(item);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      const sortedRows = unique?.map((row: any) => ({
        ...row,
        groups: [...row.groups].sort((a, b) =>
          a.point.localeCompare(b.point, "en", { sensitivity: "base" })
        )
      }));

      setRows([...sortedRows, ...sortedTotalRows]);
      setSortState({ column: null, direction: null });
    }
  }, [closestTimeGroup, tableDataAll, tableType]);

  // ====== ฟังก์ชัน sort ======
  const handleSortDailyAdjustment = (
    column: string,
    sortState: any,
    setSortState: any,
    setRows: any,
    tableData: any[]
  ) => {
    let direction: "asc" | "desc" | null = "asc";
    if (sortState.column === column) {
      direction = sortState.direction === "asc" ? "desc" : sortState.direction === "desc" ? null : "asc";
    }
    setSortState({ column, direction });

    const tableDataNotTotal = tableData.filter((item: any) => item.time != "Total");
    const tableDataTotal = tableData.filter((item: any) => item.time == "Total");
    if (!direction) {
      setRows([...tableDataNotTotal, ...tableDataTotal]);
      return;
    }

    const accessor = (row: any): number | string | null => {
      if (column === "current_time") {
        const ts = dayjs(row.time, "HH:mm", true);
        return ts.isValid() ? ts.valueOf() : row.time ?? null;
      }

      const totalMatch = column.match(/^(.+)-total$/);
      if (totalMatch) {
        const point = totalMatch[1];
        const group = row.groups.find((g: any) => g.point === point);
        if (!group) return null;
        return group.items.reduce((sum: number, it: any) => {
          const f = it.timeShow?.find((x: any) => x.time === row.time);
          return (f ? (displayUnit == 'MMBTUD' ? f.value : f.valueMmscfd) : null) != null ? sum + Number(displayUnit == 'MMBTUD' ? f.value : f.valueMmscfd) : sum;
        }, 0);
      }

      const psMatch = column.match(/^(.+)\|(.+)$/);
      if (psMatch) {
        const point = psMatch[1];
        const shipper = psMatch[2];
        const group = row.groups.find((g: any) => g.point === point);
        const item = group?.items.find((it: any) => it.shipper_name === shipper);
        const f = item?.timeShow?.find((x: any) => x.time === row.time);
        return f ? Number(displayUnit == 'MMBTUD' ? f.value : f.valueMmscfd) : null;
      }

      return null;
    };

    const cmp = (a: any, b: any) => {
      const av = accessor(a);
      const bv = accessor(b);
      if (av == null && bv == null) return 0;
      if (av == null) return direction === "asc" ? -1 : 1;
      if (bv == null) return direction === "asc" ? 1 : -1;
      const aNum = typeof av === "number" ? av : Number(av);
      const bNum = typeof bv === "number" ? bv : Number(bv);
      if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
        return direction === "asc" ? aNum - bNum : bNum - aNum;
      }
      return direction === "asc"
        ? String(av).localeCompare(String(bv), undefined, { sensitivity: "base" })
        : String(bv).localeCompare(String(av), undefined, { sensitivity: "base" });
    };

    setRows([
      ...tableDataNotTotal.sort(cmp),
      ...tableDataTotal.sort(cmp),
    ]);
  };
  

  const getArrowIcon = (column: string) => {
    return <div className={`${table_col_arrow_sort_style}`}>
      <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
      <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
    </div>
  };

  return (
    <div
      className={`relative ${autoHeight == true ? 'h-auto' : tableType == "current" ? "h-[calc(100vh-490px)]" : "h-[calc(100vh-200px)]"} overflow-y-auto overflow-x-auto block rounded-t-md z-1`}
    >
      {isLoading ? (
        !isNodata ?
          <table className="table-auto min-w-full w-full text-sm text-left rtl:text-right text-gray-500 whitespace-nowrap">

            {tableType === "all" && !isNodata && (
              <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                <tr className="h-9">
                  <th
                    scope="col"
                    rowSpan={2}
                    className={`${table_sort_header_style} sticky left-0 z-50 bg-[#1473A1] border-r border-[#308DBA] !min-w-[50px] !w-[150px] !max-w-[170px]`}
                    onClick={() => handleSortDailyAdjustment("current_time", sortState, setSortState, setRows, tableDataAll)}
                  >
                    {`Time`}
                    {getArrowIcon("current_time")}
                  </th>
                  {Object.entries(headerMap).map(([point, shippers]) => (
                    <th key={point} colSpan={shippers.size + 1} className="text-center px-2 py-1 border-x border-[#308DBA]">
                      {point}
                    </th>
                  ))}
                </tr>
                <tr className="h-9">
                  {Object.entries(headerMap).flatMap(([point, shippers]) => [
                    ...Array.from(shippers).map((shipper) => (
                      <th
                        key={`${point}-${shipper}`}
                        className={`${table_sort_header_style} text-center bg-[#00ADEF] `}
                        onClick={() => handleSortDailyAdjustment(`${point}|${shipper}`, sortState, setSortState, setRows, tableDataAll)}
                      >
                        {shipper}
                        {getArrowIcon(`${point}|${shipper}`)}
                      </th>
                    )),
                    <th
                      key={`${point}-total`}
                      className={`${table_sort_header_style} w-[150px] max-w-[200px] min-w-[110px] bg-[#E3E9F0] text-[#58585A] text-center hover:bg-[#d7dfe8] select-none`}
                      onClick={() => handleSortDailyAdjustment(`${point}-total`, sortState, setSortState, setRows, tableDataAll)}
                    >
                      Total
                      {getArrowIcon(`${point}-total`)}
                    </th>,
                  ])}
                </tr>
              </thead>
            )}

            {tableType === "all" && !isNodata && (
              <tbody>
                {rows.map((data: any, ix: number) => (
                  <tr key={ix} className="h-10 border-b border-gray-200 text-sm text-[#333]">
                    {/* <td className="px-4 py-2 font-semibold">{data.time}</td> */}

                    <td className="px-4 py-2 font-semibold sticky left-0 z-[5] bg-white border-r border-gray-200">
                      {data.isNow ? "now" : data.time}
                    </td>

                    {Object.entries(headerMap).flatMap(([point, shippers]) => {
                      const pointGroup = data.groups.find((g: any) => g.point === point);
                      const shipperMap: Record<string, number> = {};
                      const isAdjustMap: Record<string, boolean> = {};
                      if (pointGroup) {
                        pointGroup.items.forEach((it: any) => {
                          const lookup = Object.fromEntries(it.timeShow.map((t: any) => [t.time, (displayUnit == 'MMBTUD' ? data.time == 'Total' ? t.valuePerHour : t.value : data.time == 'Total' ? t.valueMmscfh : t.valueMmscfd)]));
                          if(data.time == 'Total'){
                            const totalPerHour = parseFloat(`${lookup[data.time]}`)
                            if(isNaN(totalPerHour)){
                          shipperMap[it.shipper_name] = lookup[data.time]
                            }
                            else{
                              // const totalPerHour = (totalPerDay / 24)
                              shipperMap[it.shipper_name] = totalPerHour
                            }
                          }
                          else{
                            shipperMap[it.shipper_name] = lookup[data.time]
                          }
                          isAdjustMap[it.shipper_name] = (it?.isAdjust ?? false);
                        });
                      }
                      const cells = Array.from(shippers).map((sh) => (
                        <td key={`${data.time}-${point}-${sh}`} className={`px-2 py-1 text-right ${isAdjustMap[sh] ? 'text-[#1473a1]' : ''}`}>
                          {(shipperMap[sh] || shipperMap[sh] == 0) ? displayUnit == 'MMBTUD' ? formatNumberThreeDecimal(shipperMap[sh] ?? 0) : formatNumberSixDecimal(shipperMap[sh] ?? 0) : displayUnit == 'MMBTUD' ? '0.000' : '0.000000'}
                        </td>
                      ));
                      const total: number | undefined = Object.values(shipperMap).reduce((sum: number | undefined, val) => {
                        if (val || val == 0) {
                          if (sum) {
                            sum = sum + val;
                          }
                          else {
                            sum = val;
                          }
                        }
                        return sum;
                      }, undefined);
                      return [
                        ...cells,
                        <td key={`${data.time}-${point}-total`} className="px-2 py-1 text-right font-semibold">
                          {(total || total == 0) ? displayUnit == 'MMBTUD' ? formatNumberThreeDecimal(total) : formatNumberSixDecimal(total) : displayUnit == 'MMBTUD' ? '0.000' : '0.000000'}
                        </td>,
                      ];
                    })}
                  </tr>
                ))}
              </tbody>
            )}

          </table>
          :
          <div className="p-4 w-full border rounded-[6px] h-[calc(100%-20px)] flex justify-center items-center"> <NodataTable textRender={`No data available at the current time.`} /></div>
      ) : (
        <TableSkeleton />
      )}
    </div>
  );
};

export default TableTabTotal;
