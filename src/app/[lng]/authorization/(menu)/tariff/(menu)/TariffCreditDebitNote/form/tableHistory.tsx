import { useEffect } from "react";
import React, { useState } from 'react';
import { fillMissingUpdateByAccount, formatDateTimeSec, iconButtonClass } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import ModalComment from "./modalComment";

interface TableProps {
    tableData: any;
    isLoading?: any;
    columnVisibility?: any;
    userPermission?: any
}

const TableTariffCreditDebitNoteHistory: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility, userPermission }) => {
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState<any>([]);

    // useEffect(() => {
    //     if (tableData && tableData.length > 0) {
    //         setSortedData(tableData);
    //     } else {
    //         setSortedData([]);
    //     }
    // }, [tableData]);

    useEffect(() => {
        if (tableData && tableData.length > 0) {
            const normalized = fillMissingUpdateByAccount(tableData);
            setSortedData(normalized);
        } else {
            setSortedData([]);
        }
    }, [tableData]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    // ############### REASON VIEW ###############
    const [mdReasonView, setMdReasonView] = useState(false);
    const [dataReason, setDataReason] = useState<any>([]);
    const [dataReasonRow, setDataReasonRow] = useState<any>([]);

    const openReasonModal = (id: any, data: any, row: any) => {
        setDataReason(data)
        setDataReasonRow(row)
        setMdReasonView(true)
    };

    return (<>
        <div className={`h-[calc(100vh-500px)] overflow-y-auto block  rounded-t-md relative z-1`}>

            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                    <tr className="h-9">

                        {columnVisibility.cndn_id && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("cndn_id", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`CNDN ID`}
                                {getArrowIcon("cndn_id")}
                            </th>
                        )}

                        {columnVisibility.tariff_id && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("filter_tariff_id", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Tariff ID`}
                                {getArrowIcon("filter_tariff_id")}
                            </th>
                        )}

                        {columnVisibility.comment && (
                            <th scope="col" className={`${table_header_style} text-center`}>
                                {`Comment`}
                            </th>
                        )}

                        {columnVisibility.updated_by && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("update_by_account.first_name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Updated by`}
                                {getArrowIcon("update_by_account.first_name")}
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

                            {columnVisibility?.cndn_id && (
                                <td className={`px-2 py-1 text-[#464255] min-w-[120px] `}>{row?.cndn_id ? row?.cndn_id : ''}</td>
                            )}

                            {columnVisibility?.tariff_id && (
                                <td className={`px-2 py-1 text-[#464255] min-w-[120px] `}>{row?.filter_tariff_id ? row?.filter_tariff_id : ''}</td>
                            )}

                            {columnVisibility.comment && (
                                <td className="px-2 py-1 text-center">
                                    <div className="inline-flex items-center justify-center relative">
                                        {/* <button
                                            type="button"
                                            className="flex items-center justify-center px-[2px] py-[2px] bg-white rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                                            // onClick={() => openReasonModal(row?.id, row?.tariff_credit_debit_note_comment, row)}
                                            onClick={() => openReasonModal(row?.id, row?.tariff_credit_debit_note_comment.reverse(), row)}
                                        // disabled={row?.release_summary_comment?.length <= 0 && true}
                                        // disabled={!userPermission?.f_view || row?.release_summary_comment?.length <= 0}
                                        // disabled={!userPermission?.f_view}
                                        >
                                            <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                                        </button> */}

                                        <button
                                            type="button"
                                            className={iconButtonClass}
                                            onClick={() => openReasonModal(row?.id, row?.tariff_credit_debit_note_comment.reverse(), row)}
                                            disabled={false}
                                        >
                                            <ChatBubbleOutlineOutlinedIcon
                                                fontSize="inherit"
                                                className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                                sx={{ color: 'currentColor', fontSize: 18 }}
                                            />
                                        </button>
                                        <span className="px-2 text-[#464255]">
                                            {row?.tariff_credit_debit_note_comment?.length}
                                        </span>
                                    </div>
                                </td>
                            )}

                            {columnVisibility.updated_by && (
                                <td className="px-2 py-1 text-[#464255]">
                                    <div>
                                        {/* <span className="text-[#464255]">{row?.update_by_account?.first_name} {row?.update_by_account?.last_name}</span>
                                        <div className="text-gray-500 text-xs">{row?.update_date ? formatDateTimeSec(row?.update_date) : ''}</div> */}

                                        <span className="text-[#464255]">
                                            {row?.update_by_account?.first_name} {row?.update_by_account?.last_name}
                                        </span>
                                        <div className="text-gray-500 text-xs">
                                            {row?.update_date ? formatDateTimeSec(row?.update_date) : ''}
                                        </div>

                                        {/* History > ให้ขึ้นชื่อคน Create ใน row แรก https://app.clickup.com/t/86euqkpzt */}
                                        {/* {index == sortedData.length - 1 ? (
                                            <>
                                                <span className="text-[#464255]">
                                                    {row?.create_by_account?.first_name} {row?.create_by_account?.last_name}
                                                </span>
                                                <div className="text-gray-500 text-xs">
                                                    {row?.create_date ? formatDateTimeSec(row?.create_date) : ''}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-[#464255]">
                                                    {row?.update_by_account?.first_name} {row?.update_by_account?.last_name}
                                                </span>
                                                <div className="text-gray-500 text-xs">
                                                    {row?.update_date ? formatDateTimeSec(row?.update_date) : ''}
                                                </div>
                                            </>
                                        )} */}
                                    </div>
                                </td>

                            )}

                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <ModalComment
            data={dataReason}
            dataRow={dataReasonRow}
            open={mdReasonView}
            onClose={() => {
                setMdReasonView(false);
            }}
        />
    </>
    )
}

export default TableTariffCreditDebitNoteHistory;