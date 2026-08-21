import { useEffect } from "react";
import React, { useState } from 'react';
import { anonymizeEmail, fillMissingUpdateByAccount, formatDateNoTime, formatDateTimeSec, iconButtonClass, maskLastFiveDigits } from '@/utils/generalFormatter';
import SupervisorAccountRoundedIcon from '@mui/icons-material/SupervisorAccountRounded';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";

import { handleSort, handleSortStatus } from "@/utils/sortTable";
import ModalDivision from "./modalDivision";
interface TableProps {
    tableData: any;
    isLoading?: any;
    columnVisibility: any;
}

const TableGroupShipperHistory: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility }) => {


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

    const [dataDiv, setDataDiv] = useState<any>([]);
    const [dataGroup, setDataGroup] = useState<any>([]);
    const [mdDivOpen, setMdDivOpen] = useState(false);

    const openDiv = (id: any, dataDiv: any, dataGroup: any) => {
        setDataDiv(dataDiv);
        setDataGroup(dataGroup);
        setMdDivOpen(true)
    };

    return (
        <>
            <div className={`h-[calc(100vh-500px)] overflow-y-auto block  rounded-t-md relative z-1`}>

                <table className="min-w-full text-sm text-left rtl:text-right text-gray-500 whitespace-nowrap">
                    <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                        <tr className="h-9">

                            {columnVisibility.status && (
                                <th
                                    scope="col"
                                    className={`${table_sort_header_style}`}
                                    // onClick={() => handleSort("status", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}
                                    onClick={() =>
                                        handleSortStatus(
                                            "status",
                                            ["Active", "Inactive"],  // ลำดับที่อยากเรียง
                                            sortState,
                                            setSortState,
                                            setSortedData,
                                            fillMissingUpdateByAccount(tableData)
                                        )
                                    }
                                >
                                    {`Status`}
                                    {getArrowIcon("status")}
                                </th>
                            )}

                            {/* {columnVisibility.id_name && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("id_name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Shipper ID`}
                                {getArrowIcon("id_name")}
                            </th>
                        )} */}

                            {columnVisibility.name && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("id_name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                    {`Shipper Name`}
                                    {getArrowIcon("id_name")}
                                </th>
                            )}

                            {columnVisibility.company_name && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("company_name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                    {`Shipper Company Name`}
                                    {getArrowIcon("company_name")}
                                </th>
                            )}

                            {columnVisibility.division_name && (
                                <th scope="col" className={`${table_header_style}`}>
                                    {`Division Name`}
                                </th>
                            )}

                            {columnVisibility.role_default && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("role_default.name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                    {`Default Role`}
                                    {getArrowIcon("role_default.name")}
                                </th>
                            )}

                            {columnVisibility.address && (
                                <th scope="col" className={`${table_sort_header_style} !w-[600px]`} onClick={() => handleSort("address", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                    {`Address`}
                                    {getArrowIcon("address")}
                                </th>
                            )}

                            {columnVisibility.telephone && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("telephone", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                    {`Telephone`}
                                    {getArrowIcon("telephone")}
                                </th>
                            )}

                            {columnVisibility.email && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("email", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                    {`Email`}
                                    {getArrowIcon("email")}
                                </th>
                            )}

                            {columnVisibility.bank_no && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("bank_no", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                    {`Bank Account`}
                                    {getArrowIcon("bank_no")}
                                </th>
                            )}

                            {columnVisibility.start_date && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("start_date", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                    {`Start Date`}
                                    {getArrowIcon("start_date")}
                                </th>
                            )}

                            {columnVisibility.end_date && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("end_date", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                    {`End Date`}
                                    {getArrowIcon("end_date")}
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
                        {sortedData && sortedData.map((row: any, index: any) => (
                            <tr
                                key={row?.id}
                                className={`${table_row_style}`}
                            >
                                {columnVisibility.status && (
                                    <td className="px-2 py-1">
                                        {/* <div>
                                        <label className="relative inline-block w-10 h-6">
                                            <input
                                                type="checkbox"
                                                // defaultChecked={row?.status}
                                                checked={row?.status}
                                                className="sr-only peer"
                                                onChange={(e) => {
                                                    // handleChange(e.target.checked)
                                                    // handleActive(row?.id, e.target.checked);
                                                }}
                                            />
                                            <span className="slider absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 transition duration-400 rounded-full peer-checked:bg-[#1473A1]"></span>
                                            <span className="dot absolute h-4 w-4 left-1 bottom-1 bg-white transition duration-400 rounded-full peer-checked:translate-x-full"></span>
                                        </label>
                                    </div> */}
                                        <div className={`flex items-center justify-center w-[105px] h-[30px] rounded-[16px] ${row?.status ? 'bg-[#C2F5CA] text-[#464255]' : 'bg-[#EFEFEF] text-[#828282]'}`}>
                                            {row?.status ? 'Active' : 'Inactive'}
                                        </div>
                                    </td>
                                )}


                                {/* {columnVisibility.id_name && (
                                <td className="px-2 py-1 text-[#464255]">{row?.id_name ? row?.id_name : ''}</td>
                            )} */}

                                {columnVisibility.name && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.name ? row?.name : ''}</td>
                                )}

                                {columnVisibility.company_name && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.company_name ? row?.company_name : ''}</td>
                                )}

                                {columnVisibility.division_name && (
                                    <td className="px-2 py-1 text-center">
                                        <div className="inline-flex items-center justify-center relative">
                                            {/* <button
                                                type="button"
                                                className="flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                                                onClick={() => openDiv(row?.id, row?.division, { "id_name": row?.id_name, "name": row?.name, "company_name": row?.company_name })}
                                                disabled={row?.division.length <= 0 && true}
                                            >
                                                <SupervisorAccountRoundedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                                            </button> */}
                                            <button
                                                type="button"
                                                className={iconButtonClass}
                                                onClick={() => openDiv(row?.id, row?.division, { "id_name": row?.id_name, "name": row?.name, "company_name": row?.company_name })}
                                                disabled={row?.division.length <= 0 && true}
                                            >
                                                <SupervisorAccountRoundedIcon
                                                    fontSize="inherit"
                                                    className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                                    sx={{ color: 'currentColor', fontSize: 18 }}
                                                />
                                            </button>
                                            <span className="px-2 text-[#464255]">
                                                {row?.division.length}
                                            </span>
                                        </div>
                                    </td>
                                )}

                                {columnVisibility.role_default && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.role_default?.length > 0 ? row?.role_default[0]?.role ? row?.role_default[0]?.role?.name : '' : ''}</td>
                                )}

                                {columnVisibility.address && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.address ? row?.address : ''}</td>
                                )}

                                {columnVisibility.telephone && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.telephone ? maskLastFiveDigits(row?.telephone) : ''}</td>
                                )}

                                {columnVisibility.email && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.email ? anonymizeEmail(row?.email) : ''}</td>
                                )}

                                {columnVisibility.bank_no && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.bank_no ? maskLastFiveDigits(row?.bank_no) : ''}</td>
                                )}

                                {columnVisibility.start_date && (
                                    // <td className="px-2 py-1 text-[#464255]">{row?.start_date ? formatDateTimeSec(row?.start_date) : ''}</td>
                                    <td className="px-2 py-1 text-[#464255]">{row?.start_date ? formatDateNoTime(row?.start_date) : ''}</td>
                                )}

                                {columnVisibility.end_date && (
                                    // <td className="px-2 py-1 text-[#0DA2A2]">{row?.end_date ? formatDateTimeSec(row?.end_date) : ''}</td>
                                    <td className="px-2 py-1 text-[#0DA2A2]">{row?.end_date ? formatDateNoTime(row?.end_date) : ''}</td>
                                )}

                                {columnVisibility.updated_by && (
                                    <td className="px-2 py-1 text-[#464255]">
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

            </div>

            <ModalDivision
                dataDiv={dataDiv}
                dataGroup={dataGroup}
                open={mdDivOpen}
                onClose={() => {
                    setMdDivOpen(false);
                }}
                modeShowDiv="tso"
            />

        </>
    )
}

export default TableGroupShipperHistory;