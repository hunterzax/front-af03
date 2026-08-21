import { useEffect, useRef } from "react";
import React, { FC, useState } from 'react';
import TableSkeleton, { DefaultSkeleton } from '@/components/material_custom/DefaultSkeleton';
import { cutUploadFileName, formatDate, formatDateNoTime, formatNumber, formatNumberThreeDecimal, iconButtonClass } from '@/utils/generalFormatter';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import NodataTable from "@/components/other/nodataTable";

interface TableProps {
  openAllFileModal: (id?: any, data?: any) => void;
  openReasonModal: (id?: any, data_comment?: any, row?: any) => void;
  tableData: any;
  isLoading: any;
  tabIndex: any;
  columnVisibility: any;
  userPermission?: any;
}

const TableNomQueryShipperNomFile: React.FC<TableProps> = ({ tableData, isLoading, tabIndex, columnVisibility, userPermission, openAllFileModal, openReasonModal }) => {

  const [sortState, setSortState] = useState({ column: null, direction: null });
  const [sortedData, setSortedData] = useState(tableData);
  const [originalData, setOriginalData] = useState(tableData);

  useEffect(() => {
    if (tableData && tableData.length > 0) {
      const updatedDataDaily = tableData?.map((item: any) => ({
        ...item,
        k_file_name: cutUploadFileName(item?.query_shipper_nomination_file_url?.[0]?.url)
      }));

      setSortedData(updatedDataDaily);
      setOriginalData(updatedDataDaily)
    } else {
      setSortedData([]);
    }
    // setSortedData(tableData);

  }, [tableData]);

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

                {columnVisibility.status && (
                  <th scope="col" className={`${table_sort_header_style} text-center !min-w-[100px] !max-w-36`} onClick={() => handleSort("query_shipper_nomination_status.name", sortState, setSortState, setSortedData, originalData)}>
                    {`Status`}
                    {getArrowIcon("query_shipper_nomination_status.name")}
                  </th>
                )}

                {columnVisibility.gas_day && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("gas_day", sortState, setSortState, setSortedData, originalData)}>
                    {`${tabIndex == 0 ? 'Gas Day' : 'Gas Week'}`}
                    {getArrowIcon("gas_day")}
                  </th>
                )}

                {columnVisibility.shipper_name && (
                  <th scope="col" className={`${table_sort_header_style}`}
                    onClick={() => handleSort("group.name", sortState, setSortState, setSortedData, originalData)}
                  >
                    {`Shipper Name`}
                    {getArrowIcon("group.name")}
                  </th>
                )}

                {columnVisibility.contract_code && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("contract_code.contract_code", sortState, setSortState, setSortedData, originalData)}>
                    {`Contract Code`}
                    {getArrowIcon("contract_code.contract_code")}
                  </th>
                )}

                {columnVisibility.file_name && (
                  <th
                    scope="col"
                    className={`${table_sort_header_style} `}
                    onClick={() => handleSort("k_file_name", sortState, setSortState, setSortedData, originalData)}
                  >
                    {`File Name`}
                    {getArrowIcon("k_file_name")}
                  </th>
                )}

                {columnVisibility.submission_comment && (
                  <th scope="col" className={`${table_header_style} text-center`}
                  >
                    {`Submission Comment`}
                  </th>
                )}

                {columnVisibility.file && (
                  <th scope="col" className={`${table_header_style} text-center`}
                  >
                    {`File`}
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

                  {columnVisibility.status && (
                    <td className="px-2 py-1 justify-center ">
                      {
                        <div className="flex justify-center items-center">
                          <div className="flex min-w-[180px] max-w-[250px] w-auto text-center justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: String(row?.query_shipper_nomination_status?.color) }}>{row?.query_shipper_nomination_status?.name}</div>
                        </div>
                      }
                    </td>
                  )}

                  {columnVisibility.gas_day && (
                    <td className="px-2 py-1 text-[#464255]">{row?.gas_day ? formatDateNoTime(row?.gas_day) : ''}</td>
                  )}

                  {columnVisibility.shipper_name && (
                    <td className="px-2 py-1 text-[#464255]">{row?.group ? row?.group?.name : ''}</td>
                  )}

                  {columnVisibility.contract_code && (
                    <td className="px-2 py-1 text-[#464255]">{row?.contract_code?.contract_code}</td>
                  )}

                  {columnVisibility.file_name && (
                    <td className="px-2 py-1 text-[#464255] !min-w-[180px]">
                      <div className="flex items-center">
                        {/* <img className="w-[20px] h-[20px] mr-2" src="/assets/image/pdf_icon.png" alt="pdf icon" /> */}
                        {/* <span>{row?.query_shipper_nomination_file_url?.length > 0 && cutUploadFileName(row?.query_shipper_nomination_file_url?.[0]?.url)}</span> */}
                        <span>{row?.query_shipper_nomination_file_url?.length > 0 && row?.k_file_name}</span>
                      </div>
                    </td>
                  )}

                  {columnVisibility.submission_comment && (
                    <td className="px-2 py-1 text-center">
                      <div className="inline-flex items-center justify-center relative">
                        {/* <button
                          type="button"
                          className="flex items-center justify-center px-[2px] py-[2px] bg-white rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative "
                          onClick={() => openReasonModal(row?.id, row?.submission_comment_query_shipper_nomination_file, row)}
                          disabled={!userPermission?.f_view || row?.submission_comment_query_shipper_nomination_file?.length <= 0}
                        >
                          <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                        </button> */}

                        <button
                          type="button"
                          className={iconButtonClass}
                          onClick={() => openReasonModal(row?.id, row?.submission_comment_query_shipper_nomination_file, row)}
                          disabled={!userPermission?.f_view || row?.submission_comment_query_shipper_nomination_file?.length <= 0}
                        >
                          <ChatBubbleOutlineOutlinedIcon
                            fontSize="inherit"
                            className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                            sx={{ color: 'currentColor', fontSize: 18 }}
                          />
                        </button>
                
                        <span className={`px-2 text-[#429D3A] ${row?.submission_comment_query_shipper_nomination_file?.length > 0 ? 'text-[#ED1B24]' : ''}`}>
                          {row?.submission_comment_query_shipper_nomination_file?.length}
                        </span>

                      </div>
                    </td>
                  )}

                  {columnVisibility.file && (
                    <td className="px-2 py-1 text-center">
                      <div className="inline-flex items-center justify-center relative">
                        <button
                          type="button"
                          className="flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                          onClick={() => openAllFileModal(row?.id)}
                          disabled={!userPermission?.f_view || row?.query_shipper_nomination_file_url.length <= 0}
                        >
                          <AttachFileRoundedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                        </button>
                        <span className="px-2 text-[#464255]">
                          {row?.query_shipper_nomination_file_url.length}
                        </span>
                      </div>
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

export default TableNomQueryShipperNomFile;