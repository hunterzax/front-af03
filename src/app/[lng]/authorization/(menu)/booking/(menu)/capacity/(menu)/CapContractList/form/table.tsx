import { useEffect } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatDate, formatDateNoTime, iconButtonClass } from '@/utils/generalFormatter';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style, table_sort_header_style_original } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import BtnDetailTable from "@/components/other/btnDetailsOnTable";

interface TableProps {
    openHistoryForm?: (id: any) => void;
    handlePathDetail: any;
    handleContractClick?: any;
    openSubmissionModal: (id?: any, data?: any) => void;
    openAllFileModal: (id?: any, data?: any) => void;
    tableData: any;
    isLoading: any;
    columnVisibility?: any;
    userPermission?: any;
}

const TableCapContractList: React.FC<TableProps> = ({ handlePathDetail, handleContractClick, openHistoryForm, openSubmissionModal, openAllFileModal, tableData, isLoading, userPermission, columnVisibility }) => {

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState<any>();

    useEffect(() => {
        if (tableData && tableData.length > 0) {
            setSortedData((prevData: any) => (prevData !== tableData ? tableData : prevData));
        }
        setSortedData(tableData);
    }, [tableData]);

    // useEffect(() => {
    //     if (tableData && tableData.length > 0) {
    //         setSortedData((prevData: any) => 
    //             JSON.stringify(prevData) !== JSON.stringify(tableData) ? tableData : prevData
    //         );
    //     }
    // }, [tableData]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    return (
        <div className={`h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md relative z-1`}>
            {
                isLoading ?
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-9">
                                {columnVisibility.status && (
                                    <th scope="col" className={`${table_sort_header_style} text-center !w-[300px]`} onClick={() => handleSort("status_capacity_request_management_process.name", sortState, setSortState, setSortedData, tableData)}>
                                        {`Status`}
                                        {getArrowIcon("status_capacity_request_management_process.name")}
                                    </th>
                                )}

                                {columnVisibility.contract_type && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("term_type.name", sortState, setSortState, setSortedData, tableData)}>
                                        {`Contract Type`}
                                        {getArrowIcon("term_type.name")}
                                    </th>
                                )}

                                {columnVisibility.contract_code && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("contract_code", sortState, setSortState, setSortedData, tableData)}>
                                        {`Contract Code`}
                                        {getArrowIcon("contract_code")}
                                    </th>
                                )}

                                {columnVisibility.submitted_ts && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("submitted_timestamp", sortState, setSortState, setSortedData, tableData)}>
                                        {`Submitted Timestamp`}
                                        {getArrowIcon("submitted_timestamp")}
                                    </th>
                                )}

                                {columnVisibility.contract_start_date && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("contract_start_date", sortState, setSortState, setSortedData, tableData)}>
                                        {`Contract Start Date`}
                                        {getArrowIcon("contract_start_date")}
                                    </th>
                                )}

                                {columnVisibility.contract_end_date && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("contract_end_date", sortState, setSortState, setSortedData, tableData)}>
                                        {`Contract End Date`}
                                        {getArrowIcon("contract_end_date")}
                                    </th>
                                )}

                                {columnVisibility.terminate_date && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("terminate_date", sortState, setSortState, setSortedData, tableData)}>
                                        {`Terminate Date`}
                                        {getArrowIcon("terminate_date")}
                                    </th>
                                )}

                                {columnVisibility.extend_deadline && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("extend_deadline", sortState, setSortState, setSortedData, tableData)}>
                                        {`Extend Deadline`}
                                        {getArrowIcon("extend_deadline")}
                                    </th>
                                )}

                                {columnVisibility.id_name && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("group.id_name", sortState, setSortState, setSortedData, tableData)}>
                                        {`Shipper ID`}
                                        {getArrowIcon("group.id_name")}
                                    </th>
                                )}

                                {columnVisibility.name && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("group.name", sortState, setSortState, setSortedData, tableData)}>
                                        {`Shipper Name`}
                                        {getArrowIcon("group.name")}
                                    </th>
                                )}

                                {columnVisibility.type && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("type_account.name", sortState, setSortState, setSortedData, tableData)}>
                                        {`Type`}
                                        {getArrowIcon("type_account.name")}
                                    </th>
                                )}

                                {columnVisibility.contract_status && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("status_capacity_request_management.name", sortState, setSortState, setSortedData, tableData)}>
                                        {`Contract Status`}
                                        {getArrowIcon("status_capacity_request_management.name")}
                                    </th>
                                )}

                                {columnVisibility.submission_comment && (
                                    <th scope="col" className={`${table_header_style} text-center`} >
                                        {`Submission Comment`}
                                    </th>
                                )}

                                {columnVisibility.file && (
                                    <th scope="col" className={`${table_header_style}`} >
                                        {`File`}
                                    </th>
                                )}

                                {columnVisibility.path_detail && (
                                    <th scope="col" className={`${table_header_style} text-center`} >
                                        {`Path Detail`}
                                    </th>
                                )}

                            </tr>
                        </thead>

                        <tbody>
                            {sortedData && sortedData?.map((row: any, index: any) => {
                                return (
                                    <tr
                                        key={row?.id}
                                        className={`${table_row_style}`}
                                    >
                                        {/* {columnVisibility.status && (
                                            <td className="px-2 py-1 justify-center ">
                                                {
                                                    <div className="flex justify-center items-center">
                                                        <div className="flex min-w-[200px] max-w-[250px] w-auto text-center justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: String(row?.status_capacity_request_management_process?.color) }}>{row?.status_capacity_request_management_process?.name}</div>
                                                    </div>
                                                }
                                            </td>
                                        )} */}

                                        {columnVisibility.status && (
                                            <td className="px-2 py-1 justify-center ">
                                                {
                                                    <div className="flex justify-center items-center">
                                                        <div className="flex min-w-[180px] max-w-[250px] w-auto text-center justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: String(row?.status_capacity_request_management_process?.color) }}>{row?.status_capacity_request_management_process?.name}</div>
                                                    </div>
                                                }
                                            </td>
                                        )}

                                        {/* {columnVisibility.contract_type && (
                                            <td className="px-2 py-1 justify-center ">{row?.term_type && <div className="flex w-[130px] justify-center text-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.term_type?.color }}>{`${row?.term_type?.name}`}</div>}</td>
                                        )} */}

                                        {columnVisibility.contract_type && (
                                            <td className="px-2 py-1 justify-center ">
                                                <div className="flex justify-center items-center">
                                                    {row?.term_type &&
                                                        <div className="flex min-w-[180px] max-w-[250px] justify-center text-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.term_type?.color }}>
                                                            {`${row?.term_type?.name}`}
                                                        </div>
                                                    }
                                                </div>
                                            </td>
                                        )}

                                        {columnVisibility.contract_code && (
                                            <td
                                                className="px-2 py-1 text-[#464255] "
                                            >
                                                <span
                                                    onClick={() => handleContractClick(row?.id)}
                                                    className="cursor-pointer underline text-[#1473A1]"
                                                >
                                                    {row?.contract_code || '-'}
                                                </span>
                                            </td>
                                        )}

                                        {columnVisibility.submitted_ts && (
                                            <td className="px-2 py-1 text-[#464255]">{row?.submitted_timestamp ? formatDate(row?.submitted_timestamp) : ''}</td>
                                        )}

                                        {columnVisibility.contract_start_date && (
                                            <td className="px-2 py-1 text-[#464255]">{row?.contract_start_date ? formatDateNoTime(row?.contract_start_date) : ''}</td>
                                        )}

                                        {columnVisibility.contract_end_date && (
                                            <td className="px-2 py-1 text-[#0DA2A2]">{row?.contract_end_date ? formatDateNoTime(row?.contract_end_date) : ''}</td>
                                        )}

                                        {columnVisibility.terminate_date && (
                                            <td className="px-2 py-1 text-[#0DA2A2]">{row?.terminate_date ? formatDateNoTime(row?.terminate_date) : ''}</td>
                                        )}

                                        {columnVisibility.extend_deadline && (
                                            <td className="px-2 py-1 text-[#0DA2A2]">{row?.extend_deadline ? formatDateNoTime(row?.extend_deadline) : ''}</td>
                                        )}

                                        {columnVisibility.id_name && (
                                            <td className="px-2 py-1 text-[#464255]">{row?.group && row?.group?.id_name}</td>
                                        )}

                                        {columnVisibility.name && (
                                            <td className="px-2 py-1 text-[#464255]">{row?.group && row?.group?.name}</td>
                                        )}

                                        {columnVisibility.type && (
                                            <td className="px-2 py-1 justify-center ">
                                                {
                                                    <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: String(row?.type_account?.color) }}>{row?.type_account?.name}</div>
                                                }
                                            </td>
                                        )}

                                        {columnVisibility.contract_status && (
                                            <td className="px-2 py-1 justify-center ">
                                                {
                                                    <div className="flex justify-center items-center">
                                                        <div className="flex min-w-[100px] max-w-[200px] w-auto justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: String(row?.status_capacity_request_management?.color) }}>{row?.status_capacity_request_management?.name}</div>
                                                    </div>
                                                }
                                            </td>
                                        )}

                                        {columnVisibility.submission_comment && (
                                            <td className="px-2 py-1">
                                                <div className="flex justify-center items-center">
                                                    <div className="relative inline-block text-left ">
                                                        <BtnDetailTable
                                                            openSubmissionModal={openSubmissionModal}
                                                            row_id={row?.id}
                                                            disable={!userPermission?.f_view ? true : false}
                                                        />
                                                    </div>
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
                                                        disabled={
                                                            !userPermission?.f_view
                                                        }
                                                    >
                                                        <AttachFileRoundedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                                                    </button>
                                                    <span className="px-2 text-[#464255]">
                                                        {row?.file_capacity_request_management.length}
                                                    </span>
                                                </div>
                                            </td>
                                        )}

                                        {columnVisibility.path_detail && (
                                            <td className="px-2 py-1 text-center">
                                                <div className="inline-flex items-center justify-center relative">
                                                    <button
                                                        type="button"
                                                        className="flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#809F2C66] relative"
                                                        disabled={!userPermission?.f_view || row?.file_capacity_request_management.length <= 0}
                                                        onClick={() => handlePathDetail(row.id)}
                                                    >
                                                        <TimelineRoundedIcon sx={{ fontSize: 18, color: '#809F2C', '&:hover': { color: '#ffffff' } }} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}

                                    </tr>
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

export default TableCapContractList;