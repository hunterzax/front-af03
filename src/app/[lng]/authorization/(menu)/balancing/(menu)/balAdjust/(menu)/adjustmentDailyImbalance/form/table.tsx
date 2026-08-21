import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatDateTimeSec, formatNumberFourDecimal, iconButtonClass, toDayjs } from '@/utils/generalFormatter';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import BtnActionTable from "@/components/other/btnActionInTable";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'; // เผื่อยังต้องใช้ที่อื่น
dayjs.extend(isSameOrAfter);

interface TableProps {
    openEditForm: (id: any) => void;
    openViewForm: (id: any) => void;
    openHistoryForm: (id: any) => void;
    openDeleteForm: (id: any) => void;
    openReasonModal: (id?: any, dataUser?: any, row?: any) => void;
    tableData: any;
    isLoading: any;
    zoneMaster?: any;
    dataShipper?: any;
    columnVisibility: any;
    userPermission?: any;
    initialColumns?: any;
    closeBalanceData?: any;
    onSort?: () => void;
}
const TableBalAdjustmentDailyImbalance = forwardRef<any, TableProps>(({ openEditForm, openViewForm, openHistoryForm, openDeleteForm, openReasonModal, tableData, isLoading, columnVisibility, userPermission, zoneMaster, dataShipper, initialColumns, closeBalanceData, onSort }, ref) => {
    // const TableBalAdjustmentDailyImbalance: React.FC<TableProps> = ({ openEditForm, openViewForm, openHistoryForm, openDeleteForm, openReasonModal, tableData, isLoading, columnVisibility, userPermission, zoneMaster, dataShipper, initialColumns, closeBalanceData, onSort }) => {

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);
    // const [isAfterCloseBal, setIsAfterCloseBal] = useState<boolean>(false);

    // useEffect(() => {
    //     // const target = dayjs(closeBalanceData?.date_balance);
    //     // const isSameOrAfterByMonth = dayjs(tableData?.[0]?.gas_day).isAfter(target, 'month');
    //     // let canEditCheck = isSameOrAfterByMonth ? false : true
    //     // setIsAfterCloseBal(canEditCheck)
    // }, [closeBalanceData])

    useEffect(() => {
        if (tableData && tableData.length > 0) {
            setSortedData(tableData);
        } else {
            setSortedData([]);
        }

    }, [tableData]);

    // เอาไว้ span column แบบ dynamic เคสเปิด ปิดไส้ใน
    const getVisibleChildCount = (parentKey: string) => initialColumns?.filter((col: any) => col.parent_id === parentKey && columnVisibility[col.key]).length || 1;

    const [openPopoverId, setOpenPopoverId] = useState(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const togglePopover = (id: any) => {
        if (openPopoverId === id) {
            setOpenPopoverId(null);
        } else {
            setOpenPopoverId(id);
        }
    };

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    const toggleMenu = (mode: any, id: any) => {
        switch (mode) {
            case "view":
                openViewForm(id);
                setOpenPopoverId(null); // close popover
                break;
            case "edit":
                openEditForm(id);
                setOpenPopoverId(null);
                break;
            case "history":
                openHistoryForm(id);
                setOpenPopoverId(null);
                break;
            case "delete":
                openDeleteForm(id);
                setOpenPopoverId(null);
                break;
        }
    }

    // useEffect(() => {}, []);
    const handleClickOutside = (event: MouseEvent) => {
        if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
            setOpenPopoverId(null);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [popoverRef]);

    useEffect(() => {
        if (onSort) {
            onSort()
        }
    }, [sortState]);

    useImperativeHandle(ref, () => ({
        // Expose a specific method to the parent
        getSort: () => {
            return sortState; // Return data that the parent can access
        }
    }));


    return (
        <div className={`relative h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md z-1`}>
            {
                isLoading ?
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
                                    <th rowSpan={2} scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("group.name", sortState, setSortState, setSortedData, tableData)}>
                                        {`Shipper Name`}
                                        {getArrowIcon("group.name")}
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
                                        {`Adjust Imbalance (MMBTU)`}
                                        {getArrowIcon("adjust_imbalance")}
                                    </th>
                                )}

                                {columnVisibility.daily_imbalance && (
                                    <th colSpan={getVisibleChildCount("daily_imbalance")} scope="col" className={`${table_header_style} text-center`} >
                                        {`Daily Imbalance (MMBTU)`}
                                    </th>
                                )}

                                {columnVisibility.intraday_imbalance && (
                                    <th colSpan={getVisibleChildCount("intraday_imbalance")} scope="col" className={`${table_header_style} text-center`} >
                                        {`Intraday Imbalance (MMBTU)`}
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

                                {columnVisibility.action && (
                                    <th rowSpan={2} scope="col" className={`${table_header_style} text-center`}>
                                        {`Action`}
                                    </th>
                                )}
                            </tr>

                            <tr className="h-9 bg-[#00ADEF]">

                                {columnVisibility.daily_initial_imbalance && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("dailyAccIm", sortState, setSortState, setSortedData, tableData)}>
                                        {`Initial Imbalance`}
                                        {getArrowIcon("dailyAccIm")}
                                    </th>
                                )}

                                {columnVisibility.daily_final_imbalance && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("finalDailyAccIm", sortState, setSortState, setSortedData, tableData)}>
                                        {`Final Imbalance`}
                                        {getArrowIcon("finalDailyAccIm")}
                                    </th>
                                )}

                                {columnVisibility.intraday_initial_imbalance && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("intradayAccIm", sortState, setSortState, setSortedData, tableData)}>
                                        {`Initial Imbalance`}
                                        {getArrowIcon("intradayAccIm")}
                                    </th>
                                )}

                                {columnVisibility.intraday_final_imbalance && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("finalIntradayAccIm", sortState, setSortState, setSortedData, tableData)}>
                                        {`Final Imbalance`}
                                        {getArrowIcon("finalIntradayAccIm")}
                                    </th>
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {sortedData && sortedData?.map((row: any, index: any) => {
                                let canEditCheck = true

                                if (closeBalanceData) {
                                    const target = dayjs(closeBalanceData?.date_balance);
                                    const isSameOrAfterByMonth = dayjs(row.gas_day, 'YYYY-MM-DD').isAfter(target, 'month');
                                    canEditCheck = isSameOrAfterByMonth
                                }

                                const find_shipper = dataShipper?.find((itemx: any) => itemx?.id_name == row?.shipper)

                                return (
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
                                                {/* {row?.group ? row?.group?.name : ''} */}
                                                {find_shipper ? find_shipper?.name : ''}
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
                                                {row?.adjust_imbalance !== null && row?.adjust_imbalance !== undefined ? formatNumberFourDecimal(row?.adjust_imbalance) : ''}
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

                                        {/* เพิ่ม Field Comment ในหน้า List , Edit , History https://app.clickup.com/t/86eujrg8t */}
                                        {/* ในหน้า List , History เอาไว้ข้างหน้า Column Updated by ที่เป็น icon รูป comment */}
                                        {/* ในหน้า Edit เพิ่ม field ให้สามารถใส่ comment ได้ด้วย */}
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

                                        {columnVisibility.action && (
                                            <td className="px-2 py-1">
                                                <div className="relative inline-flex justify-center items-center w-full">
                                                    <BtnActionTable togglePopover={togglePopover} row_id={row?.id} disable={!userPermission?.f_view && !userPermission?.f_edit ? true : false} />
                                                    {openPopoverId === row?.id && (
                                                        <div ref={popoverRef}
                                                            className="absolute left-[-8rem] top-[-10px] mt-2 w-36 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                                                            <ul className="py-2">
                                                                {
                                                                    userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("view", row?.id) }}><RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`View`}</li>
                                                                }

                                                                {/* Function Edit ต้องสามารถ edit ได้เฉพาะรายการหลัง closing balance https://app.clickup.com/t/86eujrgd1 */}
                                                                {
                                                                    // userPermission?.f_edit && isAfterCloseBal && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("edit", row?.id) }}><EditOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Edit`}</li>
                                                                    userPermission?.f_edit && canEditCheck && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("edit", row?.id) }}><EditOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Edit`}</li>
                                                                }

                                                                {
                                                                    userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("history", row?.id) }}><RestoreOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`History`}</li>
                                                                }
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                )
                            }

                            )}
                        </tbody>
                    </table>
                    :
                    <TableSkeleton />
            }
        </div>
    )
})

export default TableBalAdjustmentDailyImbalance;