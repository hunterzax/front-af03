import { useEffect } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatNumberThreeDecimal } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort, handleSortWithPaginate, sortOnPagenationWithPaginate } from "@/utils/sortTable";
import NodataTable from "@/components/other/nodataTable";

interface TableProps {
  tableData?: any;
  isLoading: any;
  columnVisibility: any;
  userPermission?: any;
  dataForSorting?: any
  itemsPerPage?: any
  currentPage?: any
}

const TableAll: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility, userPermission, dataForSorting, itemsPerPage, currentPage }) => {
  const [sortState, setSortState] = useState({ column: null, direction: null });
  const [sortedData, setSortedData] = useState(tableData);

  useEffect(() => {
    if (sortState?.direction) {
      const col: any = sortState?.column;
      sortOnPagenationWithPaginate(col, sortState, setSortState, setSortedData, dataForSorting, itemsPerPage, currentPage)
    } else {
      const flattened = tableData.map((item: any) => ({
        ...item,
        min_inventory_change_value: item?.minInven ?? item?.data?.find((d: any) => d.type === "Min_Inventory_Change")?.value ?? null,
        exchange_min_inventory: item?.exchangeMinInven ?? item?.data?.find((d: any) => (d.type === "Exchange_Mininventory" || d.type === "Exchange_Min_Inventory"))?.value ?? null
      }));

      const updated_total_rows = flattened?.map((obj: any) => ({
        ...obj,
        total_row: (obj.min_inventory_change_value || 0) + (obj.exchange_min_inventory || 0),
      }));
      setSortedData(updated_total_rows)

      const totalChangeMin = tableData.reduce((sum: any, row: any) => sum + Number(row?.minInven ?? (row?.data?.find((d: any) => d.type === "Min_Inventory_Change")?.value || 0)), 0);
      const totalExchangeMin = tableData.reduce((sum: any, row: any) => sum + Number(row?.exchangeMinInven ?? (row?.data?.find((d: any) => (d.type === "Exchange_Mininventory" || d.type === "Exchange_Min_Inventory"))?.value || 0)), 0);
      
      setTotals({
        totalChangeMin,
        totalExchangeMin,
      });
    }
  }, [tableData])

  // useEffect(() => {
  //   // เอาออกมาข้างนอก
  //   const flattened = tableData.map((item: any) => ({
  //     ...item,
  //     min_inventory_change_value: item?.minInven ?? item?.data?.find((d: any) => d.type === "Min_Inventory_Change")?.value ?? null,
  //     exchange_min_inventory: item?.exchangeMinInven ?? item?.data?.find((d: any) => (d.type === "Exchange_Mininventory" || d.type === "Exchange_Min_Inventory"))?.value ?? null
  //   }));

  //   const updated_total_rows = flattened?.map((obj: any) => ({
  //     ...obj,
  //     total_row: (obj.min_inventory_change_value || 0) + (obj.exchange_min_inventory || 0),
  //   }));

  //   // setDataMain(flattened)
  //   // setSortedData(flattened)

  //   setDataMain(updated_total_rows)
  //   setSortedData(updated_total_rows)

  //   const totalChangeMin = tableData.reduce((sum: any, row: any) => sum + (row?.minInven ?? (row?.data?.find((d: any) => d.type === "Min_Inventory_Change")?.value || 0)), 0);
  //   const totalExchangeMin = tableData.reduce((sum: any, row: any) => sum + (row?.exchangeMinInven ?? (row?.data?.find((d: any) => (d.type === "Exchange_Mininventory" || d.type === "Exchange_Min_Inventory"))?.value || 0)), 0);

  //   setTotals({
  //     totalChangeMin,
  //     totalExchangeMin,
  //   });

  // }, [tableData]);

  const getArrowIcon = (column: string) => {
    return <div className={`${table_col_arrow_sort_style}`}>
      <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
      <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
    </div>
  };

  const [totals, setTotals] = useState({
    totalChangeMin: 0,
    totalExchangeMin: 0,
  });

  return (
    <div className={`relative h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md z-1`}>
      {
        isLoading ?
          <table className="w-full text-sm text-left rtl:text-right text-gray-500">

            {/* #################################### TABLE CURRENT #################################### */}
            <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
              <tr className="h-9">
                {columnVisibility.gas_day && (
                  <th
                    className={`${table_sort_header_style} `}
                    // onClick={() => handleSort("gas_day", sortState, setSortState, setSortedData, dataMain)}
                    onClick={() => handleSortWithPaginate("gas_day", sortState, setSortState, setSortedData, dataForSorting, itemsPerPage, currentPage)}
                  >
                    {`Gas Day`}
                    {getArrowIcon("gas_day")}
                  </th>
                )}

                {columnVisibility.shipper_name && (
                  <th
                    className={`${table_sort_header_style} !w-[150px] !max-w-[250px]`}
                    // onClick={() => handleSort("group", sortState, setSortState, setSortedData, dataMain)}
                    onClick={() => handleSortWithPaginate("group", sortState, setSortState, setSortedData, dataForSorting, itemsPerPage, currentPage)}
                  >
                    {`Shipper Name`}
                    {getArrowIcon("group")}
                  </th>
                )}

                {columnVisibility.contract_code && (
                  <th
                    className={`${table_sort_header_style} `}
                    // onClick={() => handleSort("contract_code", sortState, setSortState, setSortedData, dataMain)}
                    onClick={() => handleSortWithPaginate("contract_code", sortState, setSortState, setSortedData, dataForSorting, itemsPerPage, currentPage)}
                  >
                    {`Contract Code`}
                    {getArrowIcon("contract_code")}
                  </th>
                )}

                {columnVisibility.zone && (
                  <th
                    className={`${table_sort_header_style} text-center`}
                    // onClick={() => handleSort("zoneObj.name", sortState, setSortState, setSortedData, dataMain)}
                    onClick={() => handleSortWithPaginate("zoneObj.name", sortState, setSortState, setSortedData, dataForSorting, itemsPerPage, currentPage)}
                  >
                    {`Zone`}
                    {getArrowIcon("zoneObj.name")}
                  </th>
                )}

                {columnVisibility.change_min_inventory && (
                  <th
                    className={`${table_sort_header_style} `}
                    // onClick={() => handleSort("min_inventory_change_value", sortState, setSortState, setSortedData, dataMain)}
                    onClick={() => handleSortWithPaginate("min_inventory_change_value", sortState, setSortState, setSortedData, dataForSorting, itemsPerPage, currentPage)}
                  >
                    {`Change Min Inventory (MMBTU)`}
                    {getArrowIcon("min_inventory_change_value")}
                  </th>
                )}

                {columnVisibility.exchange_min_invent && (
                  <th
                    className={`${table_sort_header_style} `}
                    // onClick={() => handleSort("exchange_min_inventory", sortState, setSortState, setSortedData, dataMain)}
                    onClick={() => handleSortWithPaginate("exchange_min_inventory", sortState, setSortState, setSortedData, dataForSorting, itemsPerPage, currentPage)}
                  >
                    {`Exchange Min Inventory (MMBTU)`}
                    {getArrowIcon("exchange_min_inventory")}
                  </th>
                )}

                {columnVisibility.total && (
                  <th
                    className={`${table_sort_header_style} text-center`}
                    // onClick={() => handleSort("total_row", sortState, setSortState, setSortedData, dataMain)}
                    onClick={() => handleSortWithPaginate("total_row", sortState, setSortState, setSortedData, dataForSorting, itemsPerPage, currentPage)}
                  >
                    {`Total`}
                    {getArrowIcon("total_row")}
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {sortedData && sortedData?.map((row: any, index: any) => {

                // let min = row?.minInven ?? (row?.data?.find((d: any) => d.type === "Min_Inventory_Change")?.value)
                // let exchange = row?.exchangeMinInven ?? (row?.data?.find((d: any) => (d.type === "Exchange_Mininventory" || d.type === "Exchange_Min_Inventory"))?.value)
                // let total = min + exchange

                return (
                  <tr
                    key={row?.id}
                    className={`${table_row_style}`}
                  >

                    {columnVisibility.gas_day && (
                      <td className="px-2 py-1 text-[#464255]">{row?.gas_day ? row?.gas_day : ''}</td>
                    )}

                    {columnVisibility?.shipper_name && (
                      <td className="px-2 py-1 text-[#464255] !w-[150px] !max-w-[250px]">
                        <div>{row?.group ? row?.group : null}</div>
                      </td>
                    )}

                    {columnVisibility?.contract_code && (
                      <td className="px-2 py-1 text-[#464255]">
                        <div>{row?.contract_code ? row?.contract_code : row?.reserve_balancing_gas_contract ? row.reserve_balancing_gas_contract : null}</div>
                      </td>
                    )}

                    {columnVisibility?.zone && (
                      <td className={`px-2 py-1`}>
                        <div className="w-full flex justify-center items-center px-[20px]">
                          <div className="flex w-[120px] justify-center rounded-full px-1 py-2 text-[#464255]" style={{ backgroundColor: row?.zoneObj?.color }}>{`${row?.zoneObj?.name ? row?.zoneObj?.name : ''}`}</div>
                        </div>
                      </td>
                    )}

                    {columnVisibility?.change_min_inventory && (
                      <td className="px-2 py-1 text-[#464255] text-right">
                        <div>
                          {(row?.min_inventory_change_value || row?.min_inventory_change_value === 0) ? formatNumberThreeDecimal(row?.min_inventory_change_value) : ""}
                        </div>
                      </td>
                    )}

                    {columnVisibility?.exchange_min_invent && (
                      <td className="px-2 py-1 text-[#464255] text-right">
                        <div>
                          {(row?.exchange_min_inventory || row?.exchange_min_inventory === 0) ? formatNumberThreeDecimal(row?.exchange_min_inventory) : ""}
                        </div>
                      </td>
                    )}

                    {columnVisibility?.total && (
                      <td className="px-2 py-1 text-[#464255] text-right font-semibold">
                        <div>{(row?.total_row || row?.total_row === 0) ? formatNumberThreeDecimal(row?.total_row) : ''}</div>
                      </td>
                    )}

                  </tr>
                )
              })}


              {/* Sum row */}
              {columnVisibility?.total && (
                sortedData?.length > 0 && <tr className={`${table_row_style} text-[15px] font-semibold !bg-[#D1F2FF]`}>

                  {columnVisibility.gas_day && (
                    <td className="px-2 py-1 text-[#464255] text-left" >{`Total`}</td>
                  )}

                  {columnVisibility?.shipper_name && (
                    <td className="px-2 py-1 text-[#464255] text-left" ></td>
                  )}

                  {columnVisibility?.contract_code && (
                    <td className="px-2 py-1 text-[#464255] text-left" ></td>
                  )}

                  {columnVisibility?.zone && (
                    <td className="px-2 py-1 text-[#464255] text-left" ></td>
                  )}

                  {columnVisibility?.change_min_inventory && (
                    <td className={`px-2 py-1 ${!!totals.totalChangeMin && totals.totalChangeMin !== 0 ? "text-[#ff4c4c]" : "text-[#464255]"} text-right`}>
                      {formatNumberThreeDecimal(totals.totalChangeMin)}
                    </td>
                  )}

                  {columnVisibility?.exchange_min_invent && (
                    <td className={`px-2 py-1 ${!!totals.totalExchangeMin && totals.totalExchangeMin !== 0 ? "text-[#ff4c4c]" : "text-[#464255]"} text-right`}>
                      {formatNumberThreeDecimal(totals.totalExchangeMin)}
                    </td>
                  )}

                  {columnVisibility?.total && (
                    <td className={`px-2 py-1 ${!!(totals.totalChangeMin + totals.totalExchangeMin) && (totals.totalChangeMin + totals.totalExchangeMin) > 0 ? "text-[#ff4c4c]" : "text-[#464255]"} text-right`} >{formatNumberThreeDecimal(totals.totalChangeMin + totals.totalExchangeMin)}</td>
                  )}

                </tr>
              )}

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

export default TableAll;