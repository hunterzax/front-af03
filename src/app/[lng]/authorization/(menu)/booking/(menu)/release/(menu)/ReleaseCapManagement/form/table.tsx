import { useEffect, useRef } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatDate, iconButtonClass } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import { useForm } from "react-hook-form";
import BtnDetailTable from "@/components/other/btnDetailsOnTable";
import BtnActionTable from "@/components/other/btnActionInTable";
import Spinloading from "@/components/other/spinLoading";
interface TableProps {
    tableData: any;
    // dataMaster: any;
    openReasonModal: (id?: any, dataUser?: any, row?: any) => void;
    openUpdateStatModal: (id?: any, dataUser?: any, row?: any) => void;
    openAddDocModal: (id?: any, dataUser?: any, row?: any) => void;
    openSubmissionModal: (id?: any, dataUser?: any, row?: any) => void;
    openAllFileModal?: (id?: any, data?: any) => void;
    openApproveForm?: (id: any) => void;
    openRejectForm?: (id: any) => void;
    setDataPost?: any;
    setMdUpdateStat?: any;
    setModeUpdateStat?: any;
    setIsAllTotalZero: any;
    isLoading: any;
    columnVisibility: any;
    userPermission?: any;
}

type FormData = {
    entry_release_mmscfd: Record<string, number>; // Object where keys are dynamic row IDs and values are numbers
    entry_release_mmbtud: Record<string, number>;
    exit_release_mmscfd: Record<string, number>; // Object where keys are dynamic row IDs and values are numbers
    exit_release_mmbtud: Record<string, number>;
};

const TableReleaseCapMgn: React.FC<TableProps> = ({ tableData, openReasonModal, openAddDocModal, openUpdateStatModal, openSubmissionModal, openAllFileModal, setMdUpdateStat, setModeUpdateStat, isLoading, columnVisibility, setIsAllTotalZero, setDataPost, userPermission }) => {

    const { register, handleSubmit, setValue, reset, formState: { errors }, watch } = useForm<FormData>({
        defaultValues: {
            entry_release_mmscfd: {},
            entry_release_mmbtud: {},
            exit_release_mmscfd: {},
            exit_release_mmbtud: {},
        },
    });

    const inputClass = "text-sm block md:w-full p-2 ps-5 pe-10 h-[35px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]";
    const [totalValues, setTotalValues] = useState<any>({});
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);
    const [dataMaster, setDataMaster] = useState(tableData);

    useEffect(() => {
        if (tableData && tableData.length > 0) {
            setSortedData(tableData);
            setDataMaster(tableData);
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

    useEffect(() => {
        if (Object.keys(totalValues).length === 0) {
            // Do not proceed if totalValues is an empty object
            return;
        }

        // Check if all values in totalValues are 0
        const allZero = Object.values(totalValues).every((item: any) => item.value === 0);
        // If all values are 0, set setIsAllTotalZero to true
        setIsAllTotalZero(allZero);
    }, [totalValues]); // Trigger when totalValues changes

    useEffect(() => {
        const newTotalValues: any = {};

        if (sortedData && Array.isArray(sortedData)) {

            sortedData.forEach((row: any, index: any) => {
                const valueOne = watch(`entry_release_mmbtud.${index}`);
                const valueTwo = watch(`exit_release_mmbtud.${index}`);
                newTotalValues[index] = {
                    value: Math.abs((valueOne || 0) - (valueTwo || 0)),
                };
            });
            setTotalValues(newTotalValues);

            // ยัด total_release_mmbtu_d เข้า data หลัก เอาไว้ใช้ตอนส่ง submission YEAD-MAE!!
            const updatedDataMaster = [...dataMaster];
            updatedDataMaster.forEach((row, index) => {
                const entryValueMMSCFD: any = watch(`entry_release_mmscfd.${index}`);
                const exitValueMMSCFD: any = watch(`exit_release_mmscfd.${index}`);

                const entryValue: any = watch(`entry_release_mmbtud.${index}`);
                const exitValue: any = watch(`exit_release_mmbtud.${index}`);

                // Update the respective fields in the array
                if (entryValue !== undefined) {
                    row.entryData.total_release_mmbtu_d = parseFloat(entryValue) || 0;
                    row.entryData.total_release_mmscfd = parseFloat(entryValueMMSCFD) || 0;
                }
                if (exitValue !== undefined) {
                    row.exitData.total_release_mmbtu_d = parseFloat(exitValue) || 0;
                    row.exitData.total_release_mmscfd = parseFloat(exitValueMMSCFD) || 0;
                }
            });
            setDataMaster(updatedDataMaster);
        }

    }, [
        sortedData,
        ...(sortedData || []).map((_: any, index: any) => watch(`entry_release_mmbtud.${index}`)),
        ...(sortedData || []).map((_: any, index: any) => watch(`exit_release_mmbtud.${index}`))
    ]);

    // [sortedData, ...sortedData.map((_: any, index: any) => watch(`entry_release_mmbtud.${index}`)), ...sortedData.map((_: any, index: any) => watch(`exit_release_mmbtud.${index}`))]);

    const dataMasterRef = useRef(dataMaster); // Keep a reference to the previous value
    useEffect(() => {
        const isDataMasterChanged = JSON.stringify(dataMasterRef.current) !== JSON.stringify(dataMaster);
        if (isDataMasterChanged) {
            dataMasterRef.current = dataMaster; // Update the reference
            setDataPost(dataMaster); // Trigger update only if necessary
        }
    }, [dataMaster]);

    const [openPopoverId, setOpenPopoverId] = useState(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const togglePopover = (id: any) => {

        if (openPopoverId === id) {
            setOpenPopoverId(null); // Close the popover if it's already open
        } else {
            setOpenPopoverId(id); // Open the popover for the clicked row
        }
    };

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

    const toggleMenu = (mode: any, id: any) => {
        switch (mode) {
            case "approve":
                // openApproveForm(id);
                setModeUpdateStat('approve')
                openUpdateStatModal(id);
                setOpenPopoverId(null);
                break;
            case "reject":
                // openRejectForm(id);
                // setMdUpdateStat(true)
                setModeUpdateStat('reject')
                openUpdateStatModal(id);
                setOpenPopoverId(null);
                break;
        }
    }

    return (
        <div className={`h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md relative z-1`}>
            <Spinloading spin={isLoading} rounded={0} />
            {
                !isLoading ?
                    <div>
                        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                            <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                                <tr className="h-9">

                                    {columnVisibility.submission_time && (
                                        <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("submission_time", sortState, setSortState, setSortedData, tableData)}>
                                            {`Submission Time`}
                                            {getArrowIcon("submission_time")}
                                        </th>
                                    )}

                                    {columnVisibility.group && (
                                        <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("group.name", sortState, setSortState, setSortedData, tableData)}>
                                            {`Shipper Name`}
                                            {getArrowIcon("group.name")}
                                        </th>
                                    )}

                                    {columnVisibility.contract_code && (
                                        <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("contract_code_id", sortState, setSortState, setSortedData, tableData)}>
                                            {`Contract Code`}
                                            {getArrowIcon("contract_code_id")}
                                        </th>
                                    )}

                                    {columnVisibility.detail && (
                                        <th scope="col" className={`${table_header_style} text-center`} >
                                            {`Detail`}
                                        </th>
                                    )}

                                    {columnVisibility.status && (
                                        <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("release_capacity_status.name", sortState, setSortState, setSortedData, tableData)} >
                                            {`Status`}
                                            {getArrowIcon("release_capacity_status.name")}
                                        </th>
                                    )}

                                    {columnVisibility.reason && (
                                        <th scope="col" className={`${table_header_style} text-center`} >
                                            {`Reason`}
                                        </th>
                                    )}

                                    {columnVisibility.file && (
                                        <th scope="col" className={`${table_header_style}`} >
                                            {`File`}
                                        </th>
                                    )}

                                    {columnVisibility.req_code && (
                                        <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("request_code", sortState, setSortState, setSortedData, tableData)}>
                                            {`Requested Code`}
                                            {getArrowIcon("request_code")}
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
                                {sortedData?.length > 0 && sortedData.map((row: any, index: any) => {

                                    return (
                                        <tr
                                            key={row?.id}
                                            className={`${table_row_style}`}
                                        >
                                            {columnVisibility.submission_time && (
                                                <td className="px-2 py-1 text-[#464255]">{row?.submission_time ? formatDate(row?.submission_time) : ''}</td>
                                            )}

                                            {columnVisibility.group && (
                                                <td className="px-2 py-1 text-[#464255]">{row?.group ? row?.group?.name : ''}</td>
                                            )}

                                            {columnVisibility.contract_code && (
                                                <td className="px-2 py-1 text-[#464255]">{row?.contract_code ? row?.contract_code?.contract_code : ''}</td>
                                            )}

                                            {columnVisibility.detail && (
                                                <td className="px-2 py-1">
                                                    <div className="relative inline-block text-left ">
                                                        <BtnDetailTable
                                                            openSubmissionModal={openSubmissionModal}
                                                            row_id={row?.id}
                                                            disable={!userPermission?.f_view ? true : false}
                                                        />
                                                    </div>
                                                </td>
                                            )}

                                            {columnVisibility.status && (
                                                <td className="px-2 py-1 justify-center ">{row?.release_capacity_status && <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.release_capacity_status?.color }}>{`${row?.release_capacity_status?.name}`}</div>}</td>
                                            )}

                                            {columnVisibility.reason && (() => {
                                                const reasonsArray = row?.release_capacity_active
                                                    // .map((item: any) => item.reasons)
                                                    .map((item: any) => item)
                                                    .filter((item: any) => (item.reasons !== null && item.reasons !== ''));

                                                // const statusId3Filtered = row?.release_capacity_active.filter(
                                                //     (item: any) => item.release_capacity_status.id === 3
                                                // );

                                                // const statusId3Filtered = row?.release_capacity_active?.filter((item: any) => item?.release_capacity_status?.id === 3) || [];
                                                return (
                                                    <td className="px-2 py-1 text-center">
                                                        <div className="inline-flex items-center justify-center relative">
                                                            {/* <button
                                                                type="button"
                                                                className="flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                                                                // onClick={() => openReasonModal(row?.id, statusId3Filtered, row)}
                                                                onClick={() => openReasonModal(row?.id, reasonsArray, row)}
                                                                // disabled={reasonsArray?.length <= 0}
                                                                disabled={!userPermission?.f_view || reasonsArray?.length <= 0}
                                                            >
                                                                <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                                                            </button> */}

                                                            <button
                                                                type="button"
                                                                className={iconButtonClass}
                                                                onClick={() => openReasonModal(row?.id, reasonsArray, row)}
                                                                disabled={!userPermission?.f_view || reasonsArray?.length <= 0}
                                                            >
                                                                <ChatBubbleOutlineOutlinedIcon
                                                                    fontSize="inherit"
                                                                    className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                                                    sx={{ color: 'currentColor', fontSize: 18 }}
                                                                />
                                                            </button>

                                                            <span className="px-2 text-[#464255]">
                                                                {reasonsArray?.length}
                                                            </span>
                                                        </div>
                                                    </td>
                                                );
                                            })()}

                                            {columnVisibility.file && (
                                                <td className="px-2 py-1 text-center">
                                                    <div className="inline-flex items-center justify-center relative">
                                                        {/* <button
                                                            type="button"
                                                            className="flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                                                            onClick={() => openAddDocModal(row?.id)}
                                                            // disabled={row?.release_capacity_submission_file.length <= 0 && true}
                                                            disabled={!userPermission?.f_view || row?.release_capacity_submission_file.length <= 0}
                                                        >
                                                            <AttachFileRoundedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                                                        </button> */}

                                                        <button
                                                            type="button"
                                                            className={iconButtonClass}
                                                            onClick={() => openAddDocModal(row?.id)}
                                                            disabled={!userPermission?.f_view || row?.release_capacity_submission_file.length <= 0}
                                                        >
                                                            <AttachFileRoundedIcon
                                                                fontSize="inherit"
                                                                className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                                                sx={{ color: 'currentColor', fontSize: 18 }}
                                                            />
                                                        </button>

                                                        <span className="px-2 text-[#464255]">
                                                            {row?.release_capacity_submission_file.length}
                                                        </span>
                                                    </div>
                                                </td>
                                            )}

                                            {columnVisibility.req_code && (
                                                <td className="px-2 py-1 text-[#464255]">{row?.requested_code ? row?.requested_code : ''}</td>
                                            )}

                                            {/* [
                                                {
                                                    "id": 1,
                                                    "name": "Submitted",
                                                    "color": "#D0E5FD"
                                                },
                                                {
                                                    "id": 2,
                                                    "name": "Approved",
                                                    "color": "#C2F5CA"
                                                },
                                                {
                                                    "id": 3,
                                                    "name": "Rejected",
                                                    "color": "#FFF1CE"
                                                }
                                            ] */}

                                            {columnVisibility.action && (
                                                <td className="px-2 py-1">
                                                    <div className="relative inline-block text-left">
                                                        <BtnActionTable
                                                            togglePopover={togglePopover}
                                                            row_id={row?.id}
                                                            // disable={(!userPermission?.f_view && !userPermission?.f_edit ) || row?.release_capacity_status_id == 2 || row?.release_capacity_status_id == 3 ? true : false} 
                                                            // disable={!userPermission?.f_edit || (row?.release_capacity_status_id == 2 || row?.release_capacity_status_id == 3) ? true : false} 
                                                            disable={!userPermission?.f_edit || row?.release_capacity_status_id === 2 || row?.release_capacity_status_id === 3}
                                                        />

                                                        {openPopoverId === row?.id && (
                                                            <div ref={popoverRef}
                                                                className="absolute left-[-12rem] top-[-10px] mt-2 w-52 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                                                                <ul className="py-2">
                                                                    <li className="px-4 py-2 font-simibold text-sm text-[#637381] hover:bg-gray-100 hover:text-[#000000] cursor-pointer" onClick={() => { toggleMenu("approve", row?.id) }}><DoneOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Approved`}</li>
                                                                    <li className="px-4 py-2 font-simibold text-sm text-[#637381] hover:bg-gray-100 hover:text-[#000000] cursor-pointer" onClick={() => { toggleMenu("reject", row?.id) }}><ClearOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Rejected`}</li>
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

                        {
                            sortedData?.length <= 0 && <div className="flex flex-col justify-center items-center w-[100%] pt-24">
                                <img className="w-[40px] h-auto mb-2" src="/assets/image/no_data_icon.svg" alt="No data icon" />
                                <div className="text-[16px] text-[#9CA3AF]">
                                    No data.
                                </div>
                            </div>
                        }
                    </div>
                    :
                    <TableSkeleton />
            }

        </div>
    )
}

export default TableReleaseCapMgn;