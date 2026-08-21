import { useEffect } from "react";
import React, { useState } from 'react';
import { fillMissingUpdateByAccount, formatDateTimeSec, iconButtonClass } from '@/utils/generalFormatter';
import SupervisorAccountRoundedIcon from '@mui/icons-material/SupervisorAccountRounded';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";

import { handleSort } from "@/utils/sortTable";
import ModalUserView from "./modalUserView";
interface TableProps {
    tableData: any;
    isLoading?: any;
    columnVisibility?: any;
}

const TableSystemLoginHistory: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility }) => {

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

    // ใช้สำหรับ view user ใน history | 86er0fngr

    const [mdUserViewOpen, setMdUserViewOpen] = useState(false);
    const [dataUser, setDataUser] = useState<any>([]);

    const openUserView = (id: any, data: any) => {
        setDataUser(data);
        setMdUserViewOpen(true)
    };

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    return (
        <div className={`h-[calc(100vh-500px)] overflow-y-auto block  rounded-t-md relative z-1`}>

            <table className="table-auto min-w-full text-sm rtl:text-right text-gray-500 whitespace-nowrap">
                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                    <tr className="h-9">
                        {columnVisibility.login_mode && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("mode_account.name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Login Mode`}
                                {getArrowIcon("mode_account.name")}
                            </th>
                        )}

                        {columnVisibility.role && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("role_id", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Role Name`}
                                {getArrowIcon("role_id")}
                            </th>
                        )}

                        {columnVisibility.user && (
                            <th scope="col" className={`${table_header_style} text-center`} >
                                {`Users`}
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
                    {sortedData && sortedData.map((row: any, index: any) => {

                        return (
                            <tr
                                key={row?.id}
                                className={`${table_row_style}`}
                            >
                                {columnVisibility.login_mode && (
                                    <td className="px-2 py-1 justify-center ">{row?.mode_account && <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.mode_account?.color }}>{row?.mode_account?.name} Mode</div>}</td>
                                )}

                                {columnVisibility.role && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.role?.name}</td>
                                )}

                                {/* <td className="px-2 py-1 text-[#464255]">{row?.system_login_account?.length} User{row?.system_login_account?.length > 1 && 's'} </td> */}
                                {columnVisibility.user && (
                                    <td className="px-2 py-1 text-center">
                                        <div className="inline-flex items-center justify-center relative">
                                            {/* <button
                                            type="button"
                                            // className="flex items-center justify-center px-[2px] py-[2px] rounded-md border border-none relative"
                                            className="flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                                            onClick={() => openUserView(row?.id, row?.system_login_account)}
                                            disabled={(row?.system_login_account?.length <= 0) && true}
                                        >
                                            <SupervisorAccountRoundedIcon sx={{ fontSize: 18, color: '#1473A1' }} />
                                        </button> */}

                                            <button
                                                type="button"
                                                className={iconButtonClass}
                                                onClick={() => openUserView(row?.id, row?.system_login_account)}
                                                disabled={(row?.system_login_account?.length <= 0) && true}
                                            >
                                                <SupervisorAccountRoundedIcon
                                                    fontSize="inherit"
                                                    className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                                    sx={{ color: 'currentColor', fontSize: 18 }}
                                                />
                                            </button>
                                            <span className="px-2 text-[#464255]">
                                                {row?.system_login_account?.length}
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
                        )
                    }

                    )}
                </tbody>
            </table>

            <ModalUserView
                dataUser={dataUser}
                open={mdUserViewOpen}
                onClose={() => {
                    setMdUserViewOpen(false);
                }}
            />
        </div>
    )
}

export default TableSystemLoginHistory;