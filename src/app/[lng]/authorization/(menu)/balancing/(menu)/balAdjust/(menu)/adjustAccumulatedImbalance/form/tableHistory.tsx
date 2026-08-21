import { useEffect } from "react";
import React, { useState } from 'react';
import { formatDateTimeSec, formatNumberFourDecimal, iconButtonClass, toDayjs } from '@/utils/generalFormatter';
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
    initialColumns?: any;
}

const TableBalAdjustmentAccImbalanceHistory: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility, initialColumns }) => {
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);
    useEffect(() => {
        if (tableData && tableData.length > 0) {
            setSortedData(tableData);
        } else {
            setSortedData([]);
        }
    }, [tableData]);

    // เอาไว้ span column แบบ dynamic เคสเปิด ปิดไส้ใน
    const getVisibleChildCount = (parentKey: string) => initialColumns?.filter((col: any) => col.parent_id === parentKey && columnVisibility[col.key]).length || 1;

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
                            <th rowSpan={2} scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("gas_day", sortState, setSortState, setSortedData, tableData)}>
                                {`Gas Day`}
                                {getArrowIcon("gas_day")}
                            </th>
                        )}

                        {columnVisibility.shipper_name && (
                            <th rowSpan={2} scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("shipper_name", sortState, setSortState, setSortedData, tableData)}>
                                {`Shipper Name`}
                                {getArrowIcon("shipper_name")}
                            </th>
                        )}

                        {columnVisibility.zone && (
                            <th rowSpan={2} scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("zone", sortState, setSortState, setSortedData, tableData)}>
                                {`Zone`}
                                {getArrowIcon("zone")}
                            </th>
                        )}

                        {columnVisibility.adjust_imbalance && (
                            <th rowSpan={2} scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("adjust_imbalance", sortState, setSortState, setSortedData, tableData)}>
                                {`Adjust Acc. Imbalance (MMBTU)`}
                                {getArrowIcon("adjust_imbalance")}
                            </th>
                        )}

                        {/* {columnVisibility.daily_imbalance && (
                            <th colSpan={2} scope="col" className={`${table_header_style} text-center`} >
                                {`Daily Acc. Imbalance`}
                            </th>
                        )}

                        {columnVisibility.intraday_imbalance && (
                            <th colSpan={2} scope="col" className={`${table_header_style} text-center`} >
                                {`Intraday Acc. Imbalance`}
                            </th>
                        )} */}

                        {columnVisibility.daily_imbalance && (
                            <th colSpan={getVisibleChildCount("daily_imbalance")} scope="col" className={`${table_header_style} text-center`} >
                                {`Daily Acc. Imbalance (MMBTU)`}
                            </th>
                        )}

                        {columnVisibility.intraday_imbalance && (
                            <th colSpan={getVisibleChildCount("intraday_imbalance")} scope="col" className={`${table_header_style} text-center`} >
                                {`Intraday Acc. Imbalance (MMBTU)`}
                            </th>
                        )}

                        {columnVisibility.comment && (
                            <th rowSpan={2} scope="col" className={`${table_header_style} text-center`}>
                                {`Comment`}
                            </th>
                        )}

                        {columnVisibility.updated_by && (
                            <th rowSpan={2} scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("update_by_account.first_name", sortState, setSortState, setSortedData, tableData)}>
                                {`Updated by`}
                                {getArrowIcon("update_by_account.first_name")}
                            </th>
                        )}

                    </tr>

                    <tr className="h-9 bg-[#00ADEF]">
                        {columnVisibility.daily_initial_imbalance && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("dailyAccIm", sortState, setSortState, setSortedData, tableData)}>
                                {`Initial Acc. Imbalance`}
                                {getArrowIcon("dailyAccIm")}
                            </th>
                        )}

                        {columnVisibility.daily_final_imbalance && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("finalDailyAccIm", sortState, setSortState, setSortedData, tableData)}>
                                {`Final Acc. Imbalance`}
                                {getArrowIcon("finalDailyAccIm")}
                            </th>
                        )}

                        {columnVisibility.intraday_initial_imbalance && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("intradayAccIm", sortState, setSortState, setSortedData, tableData)}>
                                {`Initial Acc.Imbalance`}
                                {getArrowIcon("intradayAccIm")}
                            </th>
                        )}

                        {columnVisibility.intraday_final_imbalance && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("finalIntradayAccIm", sortState, setSortState, setSortedData, tableData)}>
                                {`Final Acc. Imbalance`}
                                {getArrowIcon("finalIntradayAccIm")}
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

                            {columnVisibility?.gas_day && (
                                <td className={`px-2 py-1 text-[#464255] text-center`}>
                                    {row?.gas_day ? toDayjs(row?.gas_day).format("DD/MM/YYYY") : ''}
                                </td>
                            )}

                            {columnVisibility?.shipper_name && (
                                <td className={`px-2 py-1 text-[#464255] text-center`}>
                                    {row?.group ? row?.group?.name : ''}
                                </td>
                            )}

                            {columnVisibility?.zone && (
                                <td className={`px-2 py-1`}>
                                    <div className="w-full flex justify-center items-center px-[20px]">
                                        <div className="flex w-[120px] justify-center rounded-full px-1 py-2 text-[#464255]" style={{ backgroundColor: row?.zone_obj?.color }}>{`${row?.zone_obj?.name ? row?.zone_obj?.name : ''}`}</div>
                                    </div>
                                </td>
                            )}

                            {columnVisibility?.adjust_imbalance && (
                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                    {/* {row?.adjust_imbalance ? formatNumberFourDecimal(row?.adjust_imbalance) : ''} */}
                                    {formatNumberFourDecimal(row?.adjust_imbalance)}
                                </td>
                            )}

                            {columnVisibility?.daily_initial_imbalance && (
                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                    {row?.dailyAccIm || row?.dailyAccIm == 0 ? formatNumberFourDecimal(row?.dailyAccIm) : ''}
                                </td>
                            )}

                            {columnVisibility?.daily_final_imbalance && (
                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                    {row?.finalDailyAccIm || row?.finalDailyAccIm == 0 ? formatNumberFourDecimal(row?.finalDailyAccIm) : ''}
                                </td>
                            )}

                            {columnVisibility?.intraday_initial_imbalance && (
                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                    {row?.intradayAccIm || row?.intradayAccIm == 0 ? formatNumberFourDecimal(row?.intradayAccIm) : ''}
                                </td>
                            )}

                            {columnVisibility?.intraday_final_imbalance && (
                                <td className={`px-2 py-1 text-[#464255] text-right`}>
                                    {row?.finalIntradayAccIm || row?.finalIntradayAccIm == 0 ? formatNumberFourDecimal(row?.finalIntradayAccIm) : ''}
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
                                        {/* <div className="text-gray-500 text-xs">{row?.update_date ? formatDateTimeSec(row?.update_date) : ''}</div> */}

                                        {/* History : เวลา Updated by ไม่ตรง มันโดน -7 https://app.clickup.com/t/86eujrgf2 */}
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

export default TableBalAdjustmentAccImbalanceHistory;