import { useEffect } from "react";
import React, { useState } from 'react';
import { fillMissingUpdateByAccount, formatDateNoTime, formatDateTimeSec, formatDateTimeSecNoPlusSeven, formatNumberFourDecimal, iconButtonClass } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort, handleSortUpdateByFirstName } from "@/utils/sortTable";
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import ModalComment from "./modalComment";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Bangkok")

interface TableProps {
    tableData: any;
    isLoading?: any;
    columnVisibility?: any;
    userPermission?: any;
}

const TableVentCommissioningOtherGasHistory: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility, userPermission }) => {

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

                        {columnVisibility.gas_day && (
                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("gas_day", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Gas Day`}
                                {getArrowIcon("gas_day")}
                            </th>
                        )}

                        {columnVisibility.shipper_name && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("group.name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Shipper Name`}
                                {getArrowIcon("group.name")}
                            </th>
                        )}

                        {columnVisibility.zone && (
                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("zone.name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Zone`}
                                {getArrowIcon("zone.name")}
                            </th>
                        )}

                        {columnVisibility.vent_gas && (
                            <th scope="col" className={`${table_sort_header_style} text-right`} onClick={() => handleSort("vent_gas_value_mmbtud", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Vent Gas (MMBTU)`}
                                {getArrowIcon("vent_gas_value_mmbtud")}
                            </th>
                        )}

                        {columnVisibility.commissioning_gas && (
                            <th scope="col" className={`${table_sort_header_style} text-right`} onClick={() => handleSort("commissioning_gas_value_mmbtud", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Commissioning Gas (MMBTU)`}
                                {getArrowIcon("commissioning_gas_value_mmbtud")}
                            </th>
                        )}

                        {columnVisibility.other_gas && (
                            <th scope="col" className={`${table_sort_header_style} text-right`} onClick={() => handleSort("other_gas_value_mmbtud", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Other Gas (MMBTU)`}
                                {getArrowIcon("other_gas_value_mmbtud")}
                            </th>
                        )}

                        {columnVisibility.comment && (
                            <th scope="col" className={`${table_header_style} text-center`} >
                                {`Comment`}
                            </th>
                        )}

                        {columnVisibility.updated_by && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSortUpdateByFirstName("update_by_account.first_name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Updated by`}
                                {getArrowIcon("update_by_account.first_name")}
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
                                {columnVisibility.gas_day && (
                                    <td className="px-2 py-1 text-[#464255] text-center">{row?.gas_day_text ? formatDateNoTime(row?.gas_day_text) : ''}</td>
                                )}

                                {columnVisibility.shipper_name && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.group ? row?.group?.name : ''}</td>
                                )}

                                {/* {columnVisibility.zone && (
                                    <td className="px-2 py-1 text-center align-middle">
                                        {row?.zone && (
                                            <div className="inline-flex w-[100px] items-center justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.zone?.color }}>
                                                {row?.zone?.name}
                                            </div>
                                        )}
                                    </td>
                                )} */}

                                {/* History : Zone มันยังขึ้น tag สีอยู่ ขึ้นให้เหมือนกับหน้า list https://app.clickup.com/t/86eujrgeq */}
                                {columnVisibility.zone && (
                                    <td className="px-2 py-1 text-center align-middle">
                                        {row?.zone && (
                                            <div className="inline-flex w-[100px] items-center justify-center rounded-full p-1 text-[#464255]" >
                                                {row?.zone?.name}
                                            </div>
                                        )}
                                    </td>
                                )}

                                {columnVisibility.vent_gas && (
                                    <td className="px-4 py-1 text-[#464255] text-right">{row?.vent_gas_value_mmbtud ? formatNumberFourDecimal(row?.vent_gas_value_mmbtud) : ''}</td>
                                )}

                                {columnVisibility.commissioning_gas && (
                                    <td className="px-4 py-1 text-[#464255] text-right">{row?.commissioning_gas_value_mmbtud ? formatNumberFourDecimal(row?.commissioning_gas_value_mmbtud) : ''}</td>
                                )}

                                {columnVisibility.other_gas && (
                                    <td className="px-4 py-1 text-[#464255] text-right">{row?.other_gas_value_mmbtud ? formatNumberFourDecimal(row?.other_gas_value_mmbtud) : ''}</td>
                                )}

                                {columnVisibility.comment && (
                                    <td className="px-2 py-1 text-center">
                                        <div className="inline-flex items-center justify-center relative">
                                            {/* <button
                                                type="button"
                                                className="flex items-center justify-center px-[2px] py-[2px] bg-white rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                                                onClick={() => openReasonModal(row?.id, row?.vent_commissioning_other_gas_remark, row)}
                                                // disabled={row?.release_summary_comment?.length <= 0 && true}
                                                // disabled={!userPermission?.f_view || row?.release_summary_comment?.length <= 0}
                                                disabled={!userPermission?.f_view}
                                            >
                                                <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                                            </button> */}

                                            <button
                                                type="button"
                                                className={iconButtonClass}
                                                onClick={() => openReasonModal(row?.id, row?.vent_commissioning_other_gas_remark, row)}
                                                disabled={!userPermission?.f_view}
                                            >
                                                <ChatBubbleOutlineOutlinedIcon
                                                    fontSize="inherit"
                                                    className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                                    sx={{ color: 'currentColor', fontSize: 18 }}
                                                />
                                            </button>

                                            <span className="px-2 text-[#464255]">
                                                {row?.vent_commissioning_other_gas_remark?.length}
                                            </span>
                                        </div>
                                    </td>
                                )}

                                {/* {columnVisibility.updated_by && (
                                    <td className="px-2 py-1 text-[#464255]">
                                        <div>
                                            <span className="text-[#464255]">{row?.update_by_account?.first_name} {row?.update_by_account?.last_name}</span>
                                            <div className="text-gray-500 text-xs">{row?.update_date ? formatDateTimeSec(row?.update_date) : ''}</div>
                                        </div>
                                    </td>
                                )} */}

                                {columnVisibility.updated_by && (
                                    <td className="px-2 py-1 text-[#464255]">
                                        <div>
                                            {/* History Updated by ให้ขึ้นชื่อคนสร้างตั้งแต่ Row แรกเลย */}
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

                                            <span className="text-[#464255]">{row?.update_by_account?.first_name} {row?.update_by_account?.last_name}</span>
                                            <div className="text-gray-500 text-xs">{row?.update_date ? formatDateTimeSec(row?.update_date) : ''}</div>
                                        </div>
                                    </td>
                                )}

                            </tr>
                        )
                    }
                    )}
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

export default TableVentCommissioningOtherGasHistory;