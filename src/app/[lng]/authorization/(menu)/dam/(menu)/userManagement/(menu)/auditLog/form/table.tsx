import React, { useEffect, useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatDate, matchTypeWithMenu, renameMethod } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";

interface TableProps {
    tableData: any;
    isLoading: any;
    columnVisibility: any;
}
const TableAuditLog: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility }) => {

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);
    useEffect(() => {
        if (tableData && tableData.length > 0) {
            setSortedData(tableData);
        }else{
            setSortedData([]);
        }

    }, [tableData]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    // const matchTypeWithMenu = (type: any) => {
    //     if(type){
    //         switch (type) {
    //             case 'group-2':
    //                 return 'Group TSO'
    //             case 'group-3':
    //                 return 'Group Shippers'
    //             case 'group-4':
    //                 return 'Group Other'
    //             case 'booking-template':
    //                 return 'Capacity Right Template'
    //             case 'setup-background':
    //                 return 'Main Menu Background'
    //             case 'account':
    //                 return 'Users'
    //             case 'term-and-condition':
    //                 return 'Terms & Conditions'
    //             case 'systemLogin':
    //                 return 'Login Management Tool'
    //             case 'limit-concept-point':
    //                 return 'concept point'
    //             default:
    //                 return type.replaceAll('-', ' ')
    //         }
    //     }
    //     return ''
    // }

    // const renameMethod = (method: any, type: any) => {
    //     if(method){
    //         switch (method) {
    //             case 'changeFromAccount':
    //                 return 'edit'
    //             case 'duplicate-new':
    //                 return 'duplicate'
    //             case 'reason-account':
    //                 return 'edit reason'
    //             case 'status':
    //                 return 'update status'
    //             case 'reset':
    //                 switch (type) {
    //                     case 'system-login':
    //                     case 'account':
    //                         return 'reset password'
    //                     default:
    //                         return method
    //                 }
    //             case 'signature':
    //                 return 'update signature'
    //             case 'change':
    //                 switch (type) {
    //                     case 'account':
    //                         return 'edited from login management tool'
    //                     default:
    //                         return method
    //                 }
    //             default:
    //                 return method
    //         }
    //     }
    //     return ''
    // }

    return (
        <div className={`h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md relative z-1`}>
            {
                isLoading ?
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-9">
                                {columnVisibility.id && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("id", sortState, setSortState, setSortedData, tableData)}>
                                        {`ID`}
                                        {getArrowIcon("id")}
                                    </th>
                                )}

                                {columnVisibility.module && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("module", sortState, setSortState, setSortedData, tableData)}>
                                        {`Module`}
                                        {getArrowIcon("module")}
                                    </th>
                                )}

                                {columnVisibility.create_date && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("create_date", sortState, setSortState, setSortedData, tableData)}>
                                        {`Action Date`}
                                        {getArrowIcon("create_date")}
                                    </th>
                                )}

                                {columnVisibility.name && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("reqUser", sortState, setSortState, setSortedData, tableData)}>
                                        {`First Name / Last Name`}
                                        {getArrowIcon("reqUser")}
                                    </th>
                                )}

                                {columnVisibility.desc && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("method", sortState, setSortState, setSortedData, tableData)}>
                                        {`Description`}
                                        {getArrowIcon("method")}
                                    </th>
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {sortedData && sortedData.map((row: any, index: any) => {
                                console.log('row : ', row);
                                return (
                                    <tr
                                        key={row?.id}
                                        className={`${table_row_style}`}
                                    >
                                        {columnVisibility.id && (
                                            <td className="px-2 py-1 text-[#464255]">{row?.id && row?.id}</td>
                                        )}

                                        {columnVisibility.module && (
                                            <td className="px-2 py-1 text-[#464255]">{row?.module && row?.module}</td>
                                        )}

                                        {columnVisibility.create_date && (
                                            <td className="px-2 py-1 text-[#464255]">{row?.create_date && formatDate(row?.create_date)}</td>
                                        )}

                                        {columnVisibility.name && (
                                            <td className="px-2 py-1 text-[#464255]">
                                                {row?.reqUser ? JSON.parse(row.reqUser).first_name + ' ' + JSON.parse(row.reqUser).last_name : ''}
                                            </td>
                                        )}

                                        {columnVisibility.desc && (
                                            <td className="px-2 py-1 text-[#464255] capitalize">{renameMethod(row?.method, row?.type)} {matchTypeWithMenu(row?.type)}</td>
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

export default TableAuditLog;