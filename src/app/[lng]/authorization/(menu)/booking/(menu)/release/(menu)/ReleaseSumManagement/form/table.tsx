import { useEffect, useRef } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import BtnActionTable from "@/components/other/btnActionInTable";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';

import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import { formatDateNoTime, formatNumber, formatNumberThreeDecimal, formatNumberThreeDecimalNom, iconButtonClass, removeComma, toDayjs } from "@/utils/generalFormatter";
interface TableProps {
    openEditForm: (id: any) => void;
    openViewForm: (id: any) => void;
    openViewModal: (data: any) => void;
    openHistoryForm: (id: any) => void;
    openReasonModal: (id?: any, dataUser?: any, row?: any) => void;
    tableData: any;
    areaMaster: any;
    zoneMaster: any;
    isLoading: any;
    columnVisibility: any;
    userPermission?: any;
}

const TableReleaseSumMgn: React.FC<TableProps> = ({ openEditForm, openViewForm, openHistoryForm, openViewModal, openReasonModal, areaMaster, zoneMaster, tableData, isLoading, columnVisibility, userPermission }) => {
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);

    useEffect(() => {
        if (tableData && tableData.length > 0) {
            setSortedData(tableData);
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

    const [openPopoverId, setOpenPopoverId] = useState(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const togglePopover = (id: any) => {

        if (openPopoverId === id) {
            setOpenPopoverId(null); // Close the popover if it's already open
        } else {
            setOpenPopoverId(id); // Open the popover for the clicked row
        }
    };

    const toggleMenu = (mode: any, id: any) => {
        switch (mode) {
            case "release":
                openViewForm(id);
                setOpenPopoverId(null);
                break;
            // case "edit":
            //     openEditForm(id);
            //     setOpenPopoverId(null);
            //     break;
            // case "history":
            //     openHistoryForm(id);
            //     setOpenPopoverId(null);
            //     break;
        }
    }
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

    // map data into column under Used Cap (%)
    return (
        <div className={`h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md relative z-1`}>
            {
                isLoading ?
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">

                            <tr className="h-9">
                                {columnVisibility.release_start_date && (
                                    <th
                                        rowSpan={2}
                                        scope="col"
                                        className={`${table_sort_header_style}`}
                                        onClick={() => handleSort("release_summary_detail[0].release_start_date", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Release Start Date`}
                                        {getArrowIcon("release_summary_detail[0].release_start_date")}
                                    </th>
                                )}

                                {columnVisibility.release_end_date && (
                                    <th
                                        rowSpan={2}
                                        scope="col"
                                        className={`${table_sort_header_style}`}
                                        onClick={() => handleSort("release_summary_detail[0].release_end_date", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Release End Date`}
                                        {getArrowIcon("release_summary_detail[0].release_end_date")}
                                    </th>
                                )}

                                {columnVisibility.submitted_timestamp && (
                                    <th
                                        rowSpan={2}
                                        scope="col"
                                        className={`${table_sort_header_style}`}
                                        onClick={() => handleSort("submitted_timestamp", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Submitted Timestamp`}
                                        {getArrowIcon("submitted_timestamp")}
                                    </th>
                                )}

                                {columnVisibility.contract_code && (
                                    <th
                                        rowSpan={2}
                                        scope="col"
                                        className={`${table_sort_header_style}`}
                                        onClick={() => handleSort("contract_code.contract_code", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Contract Code`}
                                        {getArrowIcon("contract_code.contract_code")}
                                    </th>
                                )}

                                {columnVisibility.group && (
                                    <th
                                        rowSpan={2}
                                        scope="col"
                                        className={`${table_sort_header_style}`}
                                        onClick={() => handleSort("group.name", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Shipper Name`}
                                        {getArrowIcon("group.name")}
                                    </th>
                                )}

                                {columnVisibility.point && (
                                    <th
                                        rowSpan={2}
                                        scope="col"
                                        className={`${table_sort_header_style} whitespace-nowrap`}
                                        onClick={() => handleSort("release_summary_detail[0].temp_contract_point", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Point`}
                                        {getArrowIcon("release_summary_detail[0].temp_contract_point")}
                                    </th>
                                )}

                                {columnVisibility.contracted_mmbtu_d && (
                                    <th
                                        rowSpan={2}
                                        scope="col"
                                        className={`${table_sort_header_style} !bg-[#B8E6FE] !text-[#1473A1]`}
                                        onClick={() => handleSort("release_summary_detail[0].total_contracted_mmbtu_d", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Contracted (MMBTU/D)`}
                                        {getArrowIcon("release_summary_detail[0].total_contracted_mmbtu_d")}
                                    </th>
                                )}

                                {columnVisibility.contracted_mmscfd && (
                                    <th
                                        rowSpan={2}
                                        scope="col"
                                        className={`${table_sort_header_style} !bg-[#B8E6FE] !text-[#1473A1]`}
                                        onClick={() => handleSort("release_summary_detail[0].total_contracted_mmbtu_d", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Contracted (MMSCFD)`}
                                        {getArrowIcon("release_summary_detail[0].total_contracted_mmbtu_d")}
                                    </th>
                                )}

                                {columnVisibility.release_mmbtu_d && (
                                    <th
                                        rowSpan={2}
                                        scope="col"
                                        className={`${table_sort_header_style} !bg-[#B8E6FE] !text-[#1473A1]`}
                                        onClick={() => handleSort("release_summary_detail[0].total_release_mmbtu_d", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Release (MMBTU/D)`}
                                        {getArrowIcon("release_summary_detail[0].total_release_mmbtu_d")}
                                    </th>
                                )}

                                {columnVisibility.release_mmscfd && (
                                    <th
                                        rowSpan={2}
                                        scope="col"
                                        className={`${table_sort_header_style} !bg-[#B8E6FE] !text-[#1473A1]`}
                                        onClick={() => handleSort("release_summary_detail[0].total_release_mmbtu_d", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Release (MMSCFD)`}
                                        {getArrowIcon("release_summary_detail[0].total_release_mmbtu_d")}
                                    </th>
                                )}

                                {columnVisibility.comment && (
                                    <th rowSpan={2} scope="col" className={`${table_header_style}`}>
                                        {`Comment`}
                                    </th>
                                )}

                                {columnVisibility.release_type && (
                                    <th
                                        rowSpan={2}
                                        scope="col"
                                        className={`${table_sort_header_style}`}
                                        onClick={() => handleSort("release_type.name", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Type`}
                                        {getArrowIcon("release_type.name")}
                                    </th>
                                )}

                                {columnVisibility.action && (
                                    <th scope="col" className={`${table_header_style} text-center`}>
                                        {`Action`}
                                    </th>
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {sortedData && sortedData?.map((row: any, index: any) => {
                                const theMostTotalRelease = row?.release_summary_detail?.length > 0 && row?.release_summary_detail?.reduce((prev: any, curr: any) => {
                                    if (!curr.total_release_mmbtu_d) {
                                        return prev
                                    }
                                    return prev.total_release_mmbtu_d < curr.total_release_mmbtu_d ? prev : curr
                                })?.total_release_mmbtu_d

                                return (
                                    <tr
                                        key={index}
                                        className={`${table_row_style} border-b ${index % 2 === 0 ? '!bg-[#EBF9FF]' : 'bg-white'} h-12`}
                                    >
                                        {columnVisibility.release_start_date && (
                                            row?.entryReleaseStartDate == row?.exitReleaseStartDate
                                                ?
                                                <td className="px-2 py-1 text-[#464255] font-light">{row?.entryReleaseStartDate ? row.entryReleaseStartDate : row?.release_summary_detail?.length > 0 && row?.release_summary_detail[0].release_start_date ? formatDateNoTime(row?.release_summary_detail[0].release_start_date) : ''}</td>
                                                :
                                                <td className="px-2 py-1 justify-center ">
                                                    {(() => {
                                                        return (
                                                            <div
                                                                className={`flex mt-1 mb-1 items-center p-1 text-[#464255] font-light`}
                                                            >
                                                                {row?.entryReleaseStartDate}
                                                            </div>
                                                        );
                                                    })()}

                                                    {(() => {
                                                        return (
                                                            <div
                                                                className={`flex items-center p-1 text-[#464255] `}
                                                            >
                                                                {row?.exitReleaseStartDate}
                                                            </div>
                                                        );
                                                    })()}
                                                </td>
                                        )}

                                        {columnVisibility.release_end_date && (
                                            row?.entryReleaseEndDate == row?.exitReleaseEndDate
                                                ?
                                                <td className="px-2 py-1 text-[#464255] font-light">{row?.entryReleaseEndDate ? formatDateNoTime(toDayjs(row.entryReleaseEndDate, 'DD/MM/YYYY').add(1, 'day').toISOString()) : row?.release_summary_detail?.length > 0 && row?.release_summary_detail[0].release_end_date ? formatDateNoTime(row?.release_summary_detail[0].release_end_date) : ''}</td>
                                                // <td className="px-2 py-1 text-[#464255] font-light">{row?.entryReleaseEndDate ? formatDateNoTime(toDayjs(row.entryReleaseEndDate, 'DD/MM/YYYY').toISOString()) : row?.release_summary_detail?.length > 0 && row?.release_summary_detail[0].release_end_date ? formatDateNoTime(row?.release_summary_detail[0].release_end_date) : ''}</td>
                                                :
                                                <td className="px-2 py-1 justify-center ">
                                                    {(() => {
                                                        return (
                                                            <div
                                                                className={`flex mt-1 mb-1 items-center p-1 text-[#464255] font-light`}
                                                            >
                                                                {row?.entryReleaseEndDate ? formatDateNoTime(toDayjs(row.entryReleaseEndDate, 'DD/MM/YYYY').add(1, 'day').toISOString()) : ''}
                                                                {/* {row?.entryReleaseEndDate ? formatDateNoTime(toDayjs(row.entryReleaseEndDate, 'DD/MM/YYYY').toISOString()) : ''} */}
                                                            </div>
                                                        );
                                                    })()}

                                                    {(() => {
                                                        return (
                                                            <div
                                                                className={`flex items-center p-1 text-[#464255] `}
                                                            >
                                                                {row?.exitReleaseEndDate ? formatDateNoTime(toDayjs(row.exitReleaseEndDate, 'DD/MM/YYYY').add(1, 'day').toISOString()) : ''}
                                                                {/* {row?.exitReleaseEndDate ? formatDateNoTime(toDayjs(row.exitReleaseEndDate, 'DD/MM/YYYY').toISOString()) : ''} */}
                                                            </div>
                                                        );
                                                    })()}
                                                </td>
                                        )}

                                        {columnVisibility.submitted_timestamp && (
                                            // <td className={`px-2 py-1 text-[#464255] font-light`}>{row?.submitted_timestamp ? formatDateNoTimeNoPlusSeven(row?.submitted_timestamp) : ''}</td>
                                            // <td className={`px-2 py-1 text-[#464255] font-light`}>{row?.submitted_timestamp ? formatDateTimeNoPlusSeven(row?.submitted_timestamp) : ''}</td>
                                            <td className={`px-2 py-1 text-[#464255] font-light`}>{row?.submitted_timestamp ? formatDateNoTime(row?.submitted_timestamp) : ''}</td>
                                        )}

                                        {columnVisibility.contract_code && (
                                            <td className={`px-2 py-1 text-[#464255] font-light`}>{row?.contract_code ? row?.contract_code?.contract_code : ''}</td>
                                        )}

                                        {columnVisibility.group && (
                                            <td className={`px-2 py-1 text-[#464255] font-light`}>{row?.group ? row?.group?.name : ''}</td>
                                        )}

                                        {columnVisibility.point && (
                                            <td className="px-2 py-1 justify-center whitespace-nowrap">
                                                {(() => {
                                                    return (
                                                        <div
                                                            className={`flex justify-end mt-1 mb-1 items-end p-1 text-[#464255] `}
                                                        >
                                                            {row?.entryContractPoint ? row.entryContractPoint : row?.release_summary_detail?.length > 0 && row?.release_summary_detail[0].temp_contract_point}
                                                        </div>
                                                    );
                                                })()}

                                                {(() => {
                                                    return (
                                                        <div
                                                            className={`flex justify-end items-end p-1 text-[#464255] `}
                                                        >
                                                            {row?.exitContractPoint ? row.exitContractPoint : row?.release_summary_detail?.length > 1 ? row?.release_summary_detail[1].temp_contract_point : ''}
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                        )}

                                        {columnVisibility.contracted_mmbtu_d && (
                                            <td className="px-2 py-1  ">
                                                {(() => {
                                                    return (
                                                        <div
                                                            className={`flex justify-end mt-1 mb-1  text-[#464255] `}
                                                        >
                                                            {/* {row?.entryContractedMmbtud ? row.entryContractedMmbtud : row?.release_summary_detail?.length > 0 && formatNumber(row?.release_summary_detail[0].total_contracted_mmbtu_d)} */}
                                                            {row?.entryContractedMmbtud ? formatNumberThreeDecimal(removeComma(row.entryContractedMmbtud)) : row?.release_summary_detail?.length > 0 && formatNumberThreeDecimalNom(row?.release_summary_detail[0].total_contracted_mmbtu_d)}
                                                        </div>
                                                    );
                                                })()}

                                                {(() => {
                                                    return (
                                                        <div
                                                            className={`flex justify-end items-center text-[#464255] `}
                                                        >
                                                            {/* {row?.exitContractedMmbtud ? row.exitContractedMmbtud : row?.release_summary_detail?.length > 1 ? formatNumber(row?.release_summary_detail[1].total_contracted_mmbtu_d) : ''} */}
                                                            {row?.exitContractedMmbtud ? formatNumberThreeDecimal(removeComma(row.exitContractedMmbtud)) : row?.release_summary_detail?.length > 1 ? formatNumberThreeDecimalNom(row?.release_summary_detail[1].total_contracted_mmbtu_d) : ''}
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                        )}

                                        {columnVisibility.contracted_mmscfd && (
                                            <td className="px-2 py-1 justify-center ">
                                                {(() => {
                                                    return (
                                                        <div
                                                            className={`flex justify-end mt-1 mb-1 items-center p-1 ${row.entryContractedMmscfd == '-' ? 'text-transparent' : 'text-[#464255]'} `}
                                                        >
                                                            {/* {row?.entryContractedMmscfd ? row.entryContractedMmscfd : row?.release_summary_detail?.length > 0 ? formatNumber(row?.release_summary_detail[0].total_contracted_mmbtu_d) : ''} */}
                                                            {row?.entryContractedMmscfd ? formatNumberThreeDecimal(removeComma(row.entryContractedMmscfd)) : row?.release_summary_detail?.length > 0 ? formatNumberThreeDecimalNom(row?.release_summary_detail[0].total_contracted_mmbtu_d) : ''}
                                                        </div>
                                                    );
                                                })()}

                                                {(() => {
                                                    return (
                                                        <div
                                                            className={`flex justify-end items-center p-1 ${row.exitContractedMmscfd == '-' ? 'text-transparent' : 'text-[#464255]'} `}
                                                        >
                                                            {/* {row?.exitContractedMmscfd ? row.exitContractedMmscfd : row?.release_summary_detail?.length > 1 ? formatNumber(row?.release_summary_detail[1].total_contracted_mmbtu_d) : ''} */}
                                                            {row?.exitContractedMmscfd ? formatNumberThreeDecimal(removeComma(row.exitContractedMmscfd)) : row?.release_summary_detail?.length > 1 ? formatNumberThreeDecimalNom(row?.release_summary_detail[1].total_contracted_mmbtu_d) : ''}

                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                        )}

                                        {columnVisibility.release_mmbtu_d && (
                                            <td className="px-2 py-1 justify-center ">
                                                {row?.release_summary_detail?.length >= 2 ?
                                                    <>

                                                        {(() => {
                                                            return (
                                                                <div
                                                                    className={`flex justify-end mt-1 mb-1 items-center p-1 ${row.entryReleaseMmbtud == '-' ? 'text-transparent' : 'text-[#464255]'} `}
                                                                >
                                                                    {row?.entryReleaseMmbtud ? row.entryReleaseMmbtud : theMostTotalRelease ? theMostTotalRelease != 'undefined' ? theMostTotalRelease : '' : ''}
                                                                </div>
                                                            );
                                                        })()}

                                                        {(() => {
                                                            return (
                                                                <div
                                                                    className={`flex justify-end items-center p-1 ${row.exitReleaseMmbtud == '-' ? 'text-transparent' : 'text-[#464255]'}`}
                                                                >
                                                                    {row?.exitReleaseMmbtud ? row.exitReleaseMmbtud : theMostTotalRelease ? theMostTotalRelease != 'undefined' ? theMostTotalRelease : '' : ''}
                                                                </div>
                                                            );
                                                        })()}
                                                    </>
                                                    : row?.release_summary_detail?.length == 1 &&

                                                        row?.release_summary_detail[0]?.entry_exit == 'Entry' ?
                                                        <>
                                                            {(() => {
                                                                return (
                                                                    <div
                                                                        className={`flex justify-end mt-1 mb-1 items-center p-1 ${row.entryReleaseMmbtud == '-' ? 'text-transparent' : 'text-[#464255]'} `}
                                                                    >
                                                                        {row?.entryReleaseMmbtud ? row.entryReleaseMmbtud : theMostTotalRelease ? theMostTotalRelease != 'undefined' ? theMostTotalRelease : '' : ''}
                                                                    </div>
                                                                );
                                                            })()}
                                                        </>
                                                        :
                                                        <>
                                                            {(() => {
                                                                return (
                                                                    <div
                                                                        className={`flex justify-end items-center p-1 ${row.exitReleaseMmbtud == '-' ? 'text-transparent' : 'text-[#464255]'}`}
                                                                    >
                                                                        {row?.exitReleaseMmbtud ? row.exitReleaseMmbtud : theMostTotalRelease ? theMostTotalRelease != 'undefined' ? theMostTotalRelease : '' : ''}
                                                                    </div>
                                                                );
                                                            })()}
                                                        </>

                                                }
                                            </td>
                                        )}

                                        {columnVisibility.release_mmscfd && (
                                            <td className="px-2 py-1 justify-center ">
                                                {(() => {
                                                    return (
                                                        <div
                                                            className={`flex justify-end mt-1 mb-1 items-center p-1 ${row.entryReleaseMmscfd == '-' ? 'text-transparent' : 'text-[#464255]'} `}
                                                        >
                                                            {row?.entryReleaseMmscfd ? row.entryReleaseMmscfd : row?.release_summary_detail?.length > 0 && row?.release_summary_detail[0].total_release_mmbtu_d !== 'undefined' ? formatNumber(row?.release_summary_detail[0].total_release_mmbtu_d) : ''}
                                                        </div>
                                                    );
                                                })()}

                                                {(() => {
                                                    return (
                                                        <div
                                                            className={`flex justify-end items-center p-1 ${row.exitReleaseMmscfd == '-' ? 'text-transparent' : 'text-[#464255]'} `}
                                                        >
                                                            {row?.exitReleaseMmscfd ? row.exitReleaseMmscfd : row?.release_summary_detail?.length > 1 && row?.release_summary_detail[1].total_release_mmbtu_d !== 'undefined' ? formatNumber(row?.release_summary_detail[1].total_release_mmbtu_d) : ''}
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                        )}

                                        {columnVisibility.comment && (
                                            <td className="px-2 py-1 text-center">
                                                <div className="inline-flex items-center justify-center relative">
                                                    {/* <button
                                                        type="button"
                                                        className="flex items-center justify-center px-[2px] py-[2px] bg-white rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                                                        onClick={() => openReasonModal(row?.id, row?.release_summary_comment, row)}
                                                        // disabled={row?.release_summary_comment?.length <= 0 && true}
                                                        // disabled={!userPermission?.f_view || row?.release_summary_comment?.length <= 0}
                                                        // disabled={!userPermission?.f_view}
                                                        disabled={false}
                                                    >
                                                        <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                                                    </button> */}

                                                    <button
                                                        type="button"
                                                        className={iconButtonClass}
                                                        onClick={() => openReasonModal(row?.id, row?.release_summary_comment, row)}
                                                        disabled={false}
                                                    >
                                                        <ChatBubbleOutlineOutlinedIcon
                                                            fontSize="inherit"
                                                            className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                                            sx={{ color: 'currentColor', fontSize: 18 }}
                                                        />
                                                    </button>

                                                    <span className="px-2 text-[#464255]">
                                                        {row?.release_summary_comment?.length}
                                                    </span>
                                                </div>
                                            </td>
                                        )}

                                        {columnVisibility.release_type && (
                                            <td className={`px-2 py-1 text-[#464255] font-light`}>{row?.release_type ? row?.release_type?.name : ''}</td>
                                        )}

                                        {columnVisibility.action && (
                                            <td className="px-2 py-1">
                                                <div className="relative inline-flex justify-center items-center w-full">

                                                    {/* ปุ่ม confirm capacity ใช้ approve https://app.clickup.com/t/86ereurmq */}
                                                    <BtnActionTable togglePopover={togglePopover} row_id={index} disable={!userPermission?.f_approved ? true : false} />
                                                    {/* <BtnActionTable togglePopover={togglePopover} row_id={index} disable={false} /> */}
                                                    {openPopoverId === index && (
                                                        <div ref={popoverRef}
                                                            className="absolute left-[-12rem] top-[-10px] mt-2 w-52 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                                                            <ul className="py-2">
                                                                {
                                                                    userPermission?.f_approved && // ปุ่ม confirm capacity ใช้ approve https://app.clickup.com/t/86ereurmq
                                                                    <li className="px-4 py-2 font-simibold text-[14px] text-[#637381] hover:bg-gray-100 hover:text-[#000000] cursor-pointer" onClick={() => { toggleMenu("release", row) }}>
                                                                        <div className="flex justify-center">
                                                                            <CheckCircleOutlinedIcon sx={{ fontSize: 20, marginRight: "10px", color: '#58585A' }} />
                                                                            <div className="text-[#58585A] font-bold">{"Confirm Capacity"}</div>
                                                                        </div>
                                                                    </li>
                                                                }

                                                                {/* <li className="px-4 py-2 font-simibold text-[14px] text-[#637381] hover:bg-gray-100 hover:text-[#000000] cursor-pointer" onClick={() => { toggleMenu("release", row) }}>
                                                                    <div className="flex justify-center">
                                                                        <CheckCircleOutlinedIcon sx={{ fontSize: 20, marginRight: "10px", color: '#58585A' }} />
                                                                        <div className="text-[#58585A] font-bold">{"Confirm Capacity"}</div>
                                                                    </div>
                                                                </li> */}
                                                            </ul>
                                                        </div>
                                                    )}
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

export default TableReleaseSumMgn;