import { useEffect, useRef } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { deduplicate, formatDateNoTime, formatNumberFourDecimal, toDayjs } from '@/utils/generalFormatter';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import BtnActionTable from "@/components/other/btnActionInTable";
import { postService } from "@/utils/postService";

interface TableProps {
    openEditForm: (id: any) => void;
    openViewForm: (id: any) => void;
    tableData: any;
    isLoading: any;
    columnVisibility: any;
    userPermission?: any;
    selectedRoles: any;
    setSelectedRoles: any;
    userDT: any;
    setMakeFetch?: any;
}

const TableAlloReportDaily: React.FC<TableProps> = ({ openEditForm, openViewForm, tableData, isLoading, columnVisibility, userPermission, selectedRoles, setSelectedRoles, userDT, setMakeFetch }) => {
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);

    useEffect(() => {
        if (tableData && tableData.length > 0) {
            setSortedData(tableData);
        } else {
            setSortedData([]);
        }
    }, [tableData]);

    const [openPopoverId, setOpenPopoverId] = useState(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const togglePopover = (id: any) => {
        if (openPopoverId === id) {
            setOpenPopoverId(null); // Close the popover if it's already open
        } else {
            setOpenPopoverId(id); // Open the popover for the clicked row
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

    const [selectAll, setSelectAll] = useState(false);

    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);

        if (newSelectAll) {
            const onlyFalse = sortedData?.filter((item: any) => !item.publication);
            // const onlyTrue = sortedData?.filter((item: any) => item.publication);

            // const publishedBody = deduplicate(onlyTrue);
            const notPublishedBody = deduplicate(onlyFalse);

            if (notPublishedBody?.length > 0) {
                (async () => {
                    try {
                        // Wait for all postPublicationCenter calls to complete
                        await Promise.all(
                            notPublishedBody.map(item => postPublicationCenter(item))
                        );
                        // After all posts are done
                        setMakeFetch(true);
                    } catch (error) {
                        // Error during de-selection:
                    }
                })();
            }

            // const allNotPublic = sortedData
            //     // .filter((item:any) => !item.publication)
            //     .map((item: any) => ({ id: item.id }));

            // Select all roles
            const allNotPublic = sortedData?.map((item: any) => ({ id: item.id }));
            setSelectedRoles(allNotPublic);

        } else {
            // ตรงนี้ de-select all
            const onlyTrue = sortedData?.filter((item: any) => item.publication);
            const deSelectBody = deduplicate(onlyTrue);

            // Wrap in an async IIFE if you're inside a non-async function
            (async () => {
                try {
                    // Wait for all postPublicationCenter calls to complete
                    await Promise.all(
                        deSelectBody.map(item => postPublicationCenter(item))
                    );

                    // After all posts are done
                    setMakeFetch(true);
                    setSelectedRoles([]);
                } catch (error) {
                    // Error during de-selection:
                }
            })();
        }
    };

    const handleSelectRow = (id: any) => {
        // ส่งตัวเดียว
        const find_ = sortedData.find((role: any) => role.id === id);
        postPublicationCenter(find_)
        setMakeFetch(true)

        const existingRole = selectedRoles.find((role: any) => role.id === id);
        if (existingRole) {
            // Deselect the role
            setSelectedRoles(selectedRoles.filter((role: any) => role.id !== id));
        } else {
            // Select the role
            setSelectedRoles([...selectedRoles, { id }]);
        }
    };

    const postPublicationCenter = async (data: any) => {
        // master/allocation/publication-center
        const body_post = {
            "execute_timestamp": data?.execute_timestamp,
            "gas_day": data?.gas_day,
            "gas_hour": data?.gas_hour,
        }
        const res_ = await postService('/master/allocation/publication-center', body_post);
    }

    useEffect(() => {
        const publication_yeah = sortedData.filter((item: any) => item.publication == true)
        setSelectedRoles(publication_yeah);

        // เช็คว่าในตารางทั้งหมด publication == true หรือป่าว
        // const onlyTrue = sortedData?.filter((item: any) => item.publication);

        // if (onlyTrue?.length == tableData?.length) {
        //     setSelectAll(true)
        // }

    }, [sortedData])

    return (
        <div className="h-[calc(100vh-380px)] overflow-y-auto overflow-x-auto rounded-t-md">
            {/* <table className="min-w-full text-sm text-left rtl:text-right text-gray-500 whitespace-nowrap"> */}
            {
                isLoading ?
                    <table className="table-auto min-w-full text-sm rtl:text-right text-gray-500 whitespace-nowrap">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-9">

                                {columnVisibility?.publication && userDT?.account_manage?.[0]?.user_type_id !== 3 && (
                                    <th className={`${table_header_style} rounded-tl-[10px] min-w-[80px] text-center`}>
                                        <div className="flex gap-2">
                                            <input
                                                type="checkbox"
                                                checked={selectAll}
                                                onChange={handleSelectAll}
                                                className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1]"
                                            />
                                            <div className="pt-[2px]">
                                                {`Publication`}
                                            </div>
                                        </div>
                                    </th>
                                )}

                                {columnVisibility.entry_exit && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("entry_exit", sortState, setSortState, setSortedData, tableData)}>
                                        {`Entry / Exit`}
                                        {getArrowIcon("entry_exit")}
                                    </th>
                                )}

                                {columnVisibility.gas_day && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("gas_day", sortState, setSortState, setSortedData, tableData)}>
                                        {`Gas Day`}
                                        {getArrowIcon("gas_day")}
                                    </th>
                                )}

                                {/* {columnVisibility.gas_hour && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("gas_hour", sortState, setSortState, setSortedData, tableData)}>
                                        {`Gas Hour`}
                                        {getArrowIcon("gas_hour")}
                                    </th>
                                )} */}

                                {columnVisibility.timestamp && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("timestamp", sortState, setSortState, setSortedData, tableData)}>
                                        {`Timestamp`}
                                        {getArrowIcon("timestamp")}
                                    </th>
                                )}

                                {columnVisibility.shipper_name && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("shipper", sortState, setSortState, setSortedData, tableData)}>
                                        {`Shipper Name`}
                                        {getArrowIcon("shipper")}
                                    </th>
                                )}

                                {columnVisibility.contract_code && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("contract", sortState, setSortState, setSortedData, tableData)}>
                                        {`Contract Code`}
                                        {getArrowIcon("contract")}
                                    </th>
                                )}

                                {columnVisibility.contract_point && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("contract_point", sortState, setSortState, setSortedData, tableData)}>
                                        {`Contract Point`}
                                        {getArrowIcon("contract_point")}
                                    </th>
                                )}

                                {columnVisibility.capacity_right && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("contractCapacity", sortState, setSortState, setSortedData, tableData)}>
                                        {`Capacity Right (MMBTU/D)`}
                                        {getArrowIcon("contractCapacity")}
                                    </th>
                                )}

                                {columnVisibility.nominated_value && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("nominationValue", sortState, setSortState, setSortedData, tableData)}>
                                        {`Nominated Value (MMBTU/D)`}
                                        {getArrowIcon("nominationValue")}
                                    </th>
                                )}

                                {columnVisibility.system_allocation && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("allocatedValue", sortState, setSortState, setSortedData, tableData)}>
                                        {`System Allocation (MMBTU/D)`}
                                        {getArrowIcon("allocatedValue")}
                                    </th>
                                )}

                                {columnVisibility.overusage && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("overusage", sortState, setSortState, setSortedData, tableData)}>
                                        {`Overusage (MMBTU/D)`}
                                        {getArrowIcon("overusage")}
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
                                return (
                                    <tr
                                        key={row?.id}
                                        className={`${table_row_style}`}
                                    >

                                        {columnVisibility.publication && userDT?.account_manage?.[0]?.user_type_id !== 3 && (
                                            <td className="px-2 py-1 min-w-[80px]">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRoles.some((role: any) => role.id === row.id)}
                                                    // disabled={row.query_shipper_nomination_status_id !== 1}
                                                    onChange={() => handleSelectRow(row.id)}
                                                    // className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1]"
                                                    className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1] disabled:opacity-100 disabled:cursor-not-allowed "
                                                />
                                            </td>
                                        )}

                                        {columnVisibility.entry_exit && (
                                            <td className="px-2 py-1  justify-center ">{row?.entry_exit_obj && <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.entry_exit_obj?.color }}>{`${row?.entry_exit_obj?.name}`}</div>}</td>
                                        )}

                                        {columnVisibility.gas_day && (
                                            <td className="px-2 py-1 text-[#464255]">{row?.gas_day ? formatDateNoTime(row?.gas_day) : ''}</td>
                                        )}

                                        {columnVisibility?.timestamp && (
                                            <td className="px-2 py-1 text-[#464255]">
                                                <div>{row?.execute_timestamp ? toDayjs(row?.execute_timestamp * 1000).format('DD/MM/YYYY HH:mm') : null}</div>
                                            </td>
                                        )}

                                        {columnVisibility?.shipper_name && (
                                            <td className="px-2 py-1 text-[#464255]">
                                                <div>{row?.group ? row?.group?.name : null}</div>
                                            </td>
                                        )}

                                        {columnVisibility?.contract_code && (
                                            <td className="px-2 py-1 text-[#464255]">
                                                <div>{row?.contract ? row?.contract : null}</div>
                                            </td>
                                        )}

                                        {columnVisibility?.contract_point && (
                                            <td className="px-2 py-1 text-[#464255]">
                                                <div>{row?.contract_point ? row?.contract_point : null}</div>
                                            </td>
                                        )}

                                        {columnVisibility?.capacity_right && (
                                            <td className="px-2 py-1 text-[#464255] text-right">
                                                <div>{row?.contractCapacity ? formatNumberFourDecimal(row?.contractCapacity) : null}</div>
                                            </td>
                                        )}

                                        {columnVisibility?.nominated_value && (
                                            <td className="px-2 py-1 text-[#464255] text-right">
                                                {/* <div>{row?.nominationValue ? formatNumberFourDecimal(row?.nominationValue) : null}</div> */}
                                                <div>{row?.nominationValue !== null && row?.nominationValue !== undefined ? formatNumberFourDecimal(row?.nominationValue) : null}</div>
                                            </td>
                                        )}

                                        {columnVisibility?.system_allocation && (
                                            <td className="px-2 py-1 text-[#464255] text-right">
                                                <div>{row?.allocatedValue ? formatNumberFourDecimal(row?.allocatedValue) : null}</div>
                                            </td>
                                        )}

                                        {columnVisibility?.overusage && (
                                            <td className="px-2 py-1 text-[#464255] text-right">
                                                <div>{row?.overusage ? formatNumberFourDecimal(row?.overusage) : null}</div>
                                            </td>
                                        )}

                                        {columnVisibility.action && (
                                            <td className="px-2 py-1">
                                                <div className="relative inline-flex justify-center items-center w-full">
                                                    <BtnActionTable togglePopover={togglePopover} row_id={row?.id} disable={!userPermission?.f_view ? true : false} />
                                                    {openPopoverId === row?.id && (
                                                        <div ref={popoverRef}
                                                            className="absolute left-[-8rem] top-[-10px] mt-2 w-36 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                                                            <ul className="py-2">
                                                                {
                                                                    userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("view", row?.id) }}><RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`View`}</li>
                                                                }
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

export default TableAlloReportDaily;