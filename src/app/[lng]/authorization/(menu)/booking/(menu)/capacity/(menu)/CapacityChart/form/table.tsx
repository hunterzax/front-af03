import { useEffect, useMemo } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import { calculateMonthDifference, filterCapChart, filterStartEndDate, filterStartEndDateNewLogic, formatDateNoTime } from "@/utils/generalFormatter";
import { getService } from "@/utils/postService";
import getUserValue from "@/utils/getuserValue";

const TableChart: React.FC<any> = ({
  contractId,
  srchStartDateTable,
  srchEndDateTable,
  srchShipperTable,
  isClickSearch
}) => {
  const userDT: any = getUserValue();

  const [dataMain, setDataMain] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sortedData, setSortedData] = useState<any[]>([]);

  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: 'asc' | 'desc' | null;
  }>({
    column: null,
    direction: null
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const response: any = await getService(
        `/master/capacity/capacity-request-management-chart`
      );
      // console.log('response : ', response);
      const updatedData = response.map((row: any) => ({
        ...row,
        num_of_months: calculateMonthDifference(
          row?.contract_start_date,
          row?.contract_end_date
        )
      }));

      let result: any[] = [];

      if (userDT?.account_manage?.[0]?.user_type_id === 3) {
        result = updatedData
          .filter(
            (item: any) =>
              item?.status_capacity_request_management?.id !== 3
          )
          .filter(
            (item: any) => item?.group?.id === userDT?.account_manage?.[0]?.group_id
          );

          // console.log('result : ', result);
          // console.log('updatedData : ', updatedData);
          // console.log('userDT?.account_manage?.[0]?.group_id : ', userDT?.account_manage?.[0]?.group_id);
          // console.log('- - - -');
      } else {
        result = updatedData.filter(
          (item: any) =>
            item?.status_capacity_request_management?.id !== 3
        );
      }

      setDataMain(result);
      setSortedData(result);
    } catch (error) {
      console.error('fetchData error:', error);
      setDataMain([]);
      setSortedData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...dataMain];

    if (isClickSearch) {
      result = filterStartEndDateNewLogic(
        result,
        srchStartDateTable,
        srchEndDateTable
      );

      result = result.filter((item: any) => {
        return srchShipperTable?.length > 0
          ? srchShipperTable.includes(item?.group_id)
          : true;
      });
    }

    setSortedData(result);

    // รีเซ็ตลูกศรเมื่อค้นหาใหม่
    setSortState({
      column: null,
      direction: null
    });
  }, [
    dataMain,
    srchStartDateTable,
    srchEndDateTable,
    srchShipperTable,
    isClickSearch
  ]);

  const displayData = useMemo(() => {
    if (!Array.isArray(contractId) || contractId.length === 0) {
      return [];
    }

    return sortedData.filter((item: any) =>
      contractId.includes(item?.id)
    );
  }, [sortedData, contractId]);

  const onSort = (column: string) => {
    handleSort(
      column,
      sortState,
      setSortState,
      setSortedData,
      displayData
    );
  };

  const getArrowIcon = (column: string) => {
    return (
      <div className={table_col_arrow_sort_style}>
        <ArrowDropUpIcon
          sx={{
            fontSize: 18,
            opacity:
              sortState.column === column &&
              sortState.direction === 'asc'
                ? 1
                : 0.4
          }}
        />

        <ArrowDropDownIcon
          sx={{
            fontSize: 18,
            opacity:
              sortState.column === column &&
              sortState.direction === 'desc'
                ? 1
                : 0.4
          }}
        />
      </div>
    );
  };

  useEffect(() => {
    console.log('displayData : ', displayData);
  }, [displayData])

  useEffect(() => {
    console.log('contractId : ', contractId);
  }, [contractId])

  useEffect(() => {
    console.log('sortedData : ', sortedData);
  }, [sortedData])
  

  return (
    <div className="h-auto min-h-[300px] overflow-y-auto block rounded-t-md relative z-1">
      {!isLoading ? (
        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
          <thead className="text-xs text-white bg-[#1473A1] sticky top-0 z-1">
            <tr className="h-9">
              <th
                rowSpan={2}
                scope="col"
                className={table_sort_header_style}
                onClick={() => onSort('group.name')}
              >
                Shipper Name
                {getArrowIcon('group.name')}
              </th>

              <th
                rowSpan={2}
                scope="col"
                className={table_sort_header_style}
                onClick={() => onSort('contract_code')}
              >
                Contract Code
                {getArrowIcon('contract_code')}
              </th>

              <th
                rowSpan={2}
                scope="col"
                className={table_sort_header_style}
                onClick={() => onSort('num_of_months')}
              >
                No. of months Capacity Right
                {getArrowIcon('num_of_months')}
              </th>

              <th
                rowSpan={2}
                scope="col"
                className={table_sort_header_style}
                onClick={() => onSort('contract_start_date')}
              >
                Start Date
                {getArrowIcon('contract_start_date')}
              </th>

              <th
                rowSpan={2}
                scope="col"
                className={table_sort_header_style}
                onClick={() => onSort('contract_end_date')}
              >
                End Date
                {getArrowIcon('contract_end_date')}
              </th>
            </tr>
          </thead>

          <tbody>
            {displayData.map((row: any) => (
              <tr
                key={row?.id}
                className="border-b bg-white h-12"
              >
                <td className="px-2 py-1 text-[#464255] text-left">
                  {row?.group?.name ?? ''}
                </td>

                <td className="px-2 py-1 text-[#464255] text-left">
                  {row?.contract_code ?? ''}
                </td>

                <td className="px-2 py-1 text-[#464255] text-right">
                  {row?.num_of_months ?? 0}
                </td>

                <td className="px-2 py-1 text-[#464255] text-center">
                  {row?.contract_start_date
                    ? formatDateNoTime(row.contract_start_date)
                    : ''}
                </td>

                <td className="px-2 py-1 text-[#0DA2A2] text-center">
                  {row?.contract_end_date
                    ? formatDateNoTime(row.contract_end_date)
                    : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <TableSkeleton />
      )}
    </div>
  );
};

export default TableChart;