import { useEffect } from "react";
import React, { useState } from 'react';
import { fillMissingUpdateByAccount, formatDateTimeSec, formatNumberFourDecimal, iconButtonClass, toDayjs } from '@/utils/generalFormatter';
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
}

const TableBalIntradayAccImbalanceInventoryAdjustHistory: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility }) => {
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState<any>([]);

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

    // ############### MODAL COMMENT ###############
    const [mdReasonView, setMdReasonView] = useState(false);
    const [dataReason, setDataReason] = useState<any>([]);
    const [dataReasonRow, setDataReasonRow] = useState<any>([]);

    const openReasonModal = (id: any, data: any, row: any) => {
        setDataReason(data)
        setDataReasonRow(row)
        setMdReasonView(true)
    };

    return (
        <div className={`h-[calc(100vh-500px)] overflow-y-auto block  rounded-t-md relative z-1`}>

            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                    <tr className="h-9">

                        {columnVisibility.gas_day && (
                            <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort("gas_day", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Gas Day`}
                                {getArrowIcon("gas_day")}
                            </th>
                        )}

                        {columnVisibility.east && (
                            <th scope="col" className={`${table_sort_header_style} text-right`} onClick={() => handleSort("east", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`East (MMBTU)`}
                                {getArrowIcon("east")}
                            </th>
                        )}

                        {columnVisibility.west && (
                            <th scope="col" className={`${table_sort_header_style} text-right`} onClick={() => handleSort("west", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`West (MMBTU)`}
                                {getArrowIcon("west")}
                            </th>
                        )}

                        {columnVisibility.comment && (
                            <th rowSpan={2} scope="col" className={`${table_header_style} text-center`}>
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
                            className={`${table_row_style} `}
                        >

                            {columnVisibility?.gas_day && (
                                <td className={`px-2 py-1 text-[#464255] text-center`}>
                                    {row?.gas_day ? toDayjs(row?.gas_day).format("DD/MM/YYYY") : ''}
                                </td>
                            )}

                            {columnVisibility?.east && (
                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                    {/* {row?.east ? formatNumberFourDecimal(row?.east) : ''} */}
                                    {row?.east !== null && row?.east !== undefined ? formatNumberFourDecimal(row?.east) : ''}
                                </td>
                            )}

                            {columnVisibility?.west && (
                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                    {/* {row?.west ? formatNumberFourDecimal(row?.west) : ''} */}
                                    {row?.west !== null && row?.west !== undefined ? formatNumberFourDecimal(row?.west) : ''}
                                </td>
                            )}

                            {columnVisibility.comment && (
                                <td className="px-2 py-1 text-center">
                                    <div className="inline-flex items-center justify-center relative">
                                        <button
                                            type="button"
                                            className={iconButtonClass}
                                            onClick={() => openReasonModal(row?.id, row?.comment, row)}
                                            disabled={row?.comment?.length <= 0 && true}
                                        >
                                            <ChatBubbleOutlineOutlinedIcon
                                                fontSize="inherit"
                                                className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                                sx={{ color: 'currentColor', fontSize: 18 }}
                                            />
                                        </button>
                                        <span className="px-2 text-[#464255]">
                                            {row?.comment?.length}
                                        </span>
                                    </div>
                                </td>
                            )}

                            {columnVisibility.updated_by && (
                                <td className="px-2 py-1">
                                    <div>
                                        <span className="text-[#464255]">{row?.update_by_account?.first_name} {row?.update_by_account?.last_name}</span>
                                        <div className="text-gray-500 text-xs">{row?.update_date ? formatDateTimeSec(row?.update_date) : ''}</div>
                                    </div>
                                </td>
                            )}

                        </tr>
                    ))}
                </tbody>
            </table>

            <ModalComment
                data={dataReason}
                dataMain={dataReasonRow}
                open={mdReasonView}
                onClose={async () => {
                    setMdReasonView(false);
                }}
            />

        </div>
    )
}

export default TableBalIntradayAccImbalanceInventoryAdjustHistory;