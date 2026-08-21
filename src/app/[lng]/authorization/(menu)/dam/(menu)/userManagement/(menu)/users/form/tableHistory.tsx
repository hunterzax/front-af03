import { useEffect } from "react";
import React, { FC, useState } from 'react';
import { anonymizeEmail, fillMissingUpdateByAccount, formatDate, formatDateNoTime, formatDateNoTimeNoPlusSeven, formatDateTimeSec, formatNumber, maskLastFiveDigits } from '@/utils/generalFormatter';
// import SupervisorAccountRoundedIcon from '@mui/icons-material/SupervisorAccountRounded';
// import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_sort_header_style, table_sort_header_style_original } from "@/utils/styles";

import { handleSort, handleSortStatus } from "@/utils/sortTable";
import ModalReason from "./modalReason";
interface TableProps {
    tableData: any;
    isLoading?: any;
    columnVisibility?: any;
}

const TableUserHistory: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility }) => {

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState<any>([]);
    const [tableDataOrigin, setTableDataOrigin] = useState<any>([]);

    // useEffect(() => {
    //     if (tableData && tableData.length > 0) {
    //         setSortedData(tableData);
    //     } else {
    //         setSortedData([]);
    //     }
    // }, [tableData]);

    useEffect(() => {
        if (tableData && tableData.length > 0) {

            const made_data = tableData?.map((item: any) => ({
                ...item,
                login_mode_: item?.account_manage[0].mode_account ? item?.account_manage[0].mode_account : null,
                group_name_: item?.account_manage[0]?.group ? item?.account_manage[0]?.group.name : null,
                role_name_: item?.account_manage[0]?.account_role?.length > 0 ? item?.account_manage[0]?.account_role[0]?.role?.name : null,
                user_type_: item?.account_manage[0]?.user_type ? item?.account_manage[0]?.user_type : null,
                division_: item?.account_manage[0].division ? item?.account_manage[0].division : null,
            }));
            const normalized = fillMissingUpdateByAccount(made_data);

            setSortedData(normalized);
            setTableDataOrigin(normalized);

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

    const [mdReasonView, setMdReasonView] = useState(false);
    const [dataReason, setDataReason] = useState<any>([]);

    // REASON VIEW
    const openReasonModal = (id: any, data: any) => {

        setDataReason(data)
        setMdReasonView(true)
    };

    return (
        <>
            <div className={`h-[calc(100vh-500px)] overflow-y-auto block  rounded-t-md relative z-1`}>
                <table className="table-auto min-w-full text-sm rtl:text-right text-gray-500 whitespace-nowrap">
                    <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                        <tr className="h-9">
                            {columnVisibility.login_mode && (
                                // <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("account_manage", sortState, setSortState, setSortedData, tableData)}>
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("login_mode_.name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableDataOrigin))}>
                                    {`Login Mode`}
                                    {getArrowIcon("login_mode_.name")}
                                </th>
                            )}

                            {columnVisibility.status && (
                                <th
                                    scope="col"
                                    className={`${table_sort_header_style}`}
                                    onClick={() =>
                                        handleSortStatus(
                                            "status",
                                            ["Active", "Inactive"],  // ลำดับที่อยากเรียง
                                            sortState,
                                            setSortState,
                                            setSortedData,
                                            fillMissingUpdateByAccount(tableDataOrigin)
                                        )
                                    }
                                >
                                    {`Status`}
                                    {getArrowIcon("status")}
                                </th>
                            )}

                            {columnVisibility.id_name && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("user_id", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableDataOrigin))}>
                                    {`User ID`}
                                    {getArrowIcon("user_id")}
                                </th>
                            )}

                            {columnVisibility.company_name && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("group_name_", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableDataOrigin))}>
                                    {/* {`Company/Group Name`} */}
                                    {`Group Name`}
                                    {getArrowIcon("group_name_")}
                                </th>
                            )}

                            {columnVisibility.user_type && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("user_type_.name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableDataOrigin))}>
                                    {`User Type`}
                                    {getArrowIcon("user_type_.name")}
                                </th>
                            )}

                            {columnVisibility.division_name && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("division_.division_name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableDataOrigin))}>
                                    {`Division Name`}
                                    {getArrowIcon("division_.division_name")}
                                </th>
                            )}

                            {columnVisibility.first_name && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("first_name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableDataOrigin))}>
                                    {`First Name`}
                                    {getArrowIcon("first_name")}
                                </th>
                            )}

                            {columnVisibility.last_name && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("last_name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableDataOrigin))}>
                                    {`Last Name`}
                                    {getArrowIcon("last_name")}
                                </th>
                            )}

                            {columnVisibility.type && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("user_type_name_", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableDataOrigin))}>
                                    {`Type`}
                                    {getArrowIcon("user_type_name_")}
                                </th>
                            )}

                            {columnVisibility.role_default && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("role_name_", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableDataOrigin))}>
                                    {`Role`}
                                    {getArrowIcon("role_name_")}
                                </th>
                            )}

                            {columnVisibility.telephone && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("telephone", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableDataOrigin))}>
                                    {`Telephone`}
                                    {getArrowIcon("telephone")}
                                </th>
                            )}

                            {columnVisibility.email && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("email", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableDataOrigin))}>
                                    {`Email`}
                                    {getArrowIcon("email")}
                                </th>
                            )}

                            {columnVisibility.start_date && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("start_date", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableDataOrigin))}>
                                    {`Start Date`}
                                    {getArrowIcon("start_date")}
                                </th>
                            )}

                            {columnVisibility.end_date && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("end_date", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableDataOrigin))}>
                                    {`End Date`}
                                    {getArrowIcon("end_date")}
                                </th>
                            )}
                            {/* 
                            {columnVisibility.reason && (
                                <th scope="col" className={`${table_header_style}`} >
                                    {`Reason`}
                                </th>
                            )} */}

                            {/* {columnVisibility.last_login && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("login_logs", sortState, setSortState, setSortedData, tableDataOrigin)}>
                                    {`Lasted Login`}
                                    {getArrowIcon("login_logs")}
                                </th>
                            )} */}

                            {columnVisibility.update_by && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("update_by_account.first_name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableDataOrigin))}>
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
                                    className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} h-12 `}
                                >
                                    {columnVisibility.login_mode && (
                                        // <td className="px-2 py-1 justify-center ">{row?.account_manage[0]?.mode_account && <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.account_manage[0]?.mode_account.color }}>{row?.account_manage[0]?.mode_account.name} Mode</div>}</td>
                                        <td className="px-2 py-1 justify-center ">{row?.login_mode_ && <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.login_mode_.color }}>{row?.login_mode_.name} Mode</div>}</td>
                                    )}

                                    {columnVisibility.status && (
                                        <td className="px-2 py-1 ">
                                            {/* <div>
                                                    <label className="relative inline-block w-10 h-6 ">
                                                        <input
                                                            type="checkbox"
                                                            // defaultChecked={row?.status}
                                                            checked={row?.status}
                                                            className="sr-only peer "
                                                        //   onChange={(e) => handleChange(e.target.checked)}
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

                                    {/* (2 = TSO, 3 = Shipper, 4 = Other) */}
                                    {columnVisibility.id_name && (
                                        <td className="px-2 py-1 text-[#464255]">{row?.user_id}</td>
                                    )}

                                    {/* {columnVisibility.company_name && (
                                        <td className="px-2 py-1 text-[#464255]">{row?.account_manage[0]?.group?.name}</td>
                                    )} */}

                                    {columnVisibility.company_name && (
                                        <td className="px-2 py-1 text-[#464255]">{row?.group_name_}</td>
                                    )}

                                    {columnVisibility.user_type && (
                                        <td className="px-2 py-1 justify-center">
                                            {/* {
                                                row?.account_manage[row?.account_manage?.length - 1]?.user_type &&
                                                <div className="flex w-[100px] bg-[#EEE4FF] justify-center !text-[14px] font-bold rounded-full p-1" style={{ backgroundColor: row?.account_manage[row?.account_manage.length - 1]?.user_type?.color, color: row?.account_manage[row?.account_manage.length - 1]?.user_type?.color_text }}>{row?.account_manage[row?.account_manage.length - 1]?.user_type?.name}</div>
                                            } */}
                                            {
                                                row?.user_type_ &&
                                                <div className="flex w-[100px] bg-[#EEE4FF] justify-center !text-[14px] font-bold rounded-full p-1" style={{ backgroundColor: row?.user_type_?.color, color: row?.user_type_?.color_text }}>{row?.user_type_?.name}</div>
                                            }
                                        </td>
                                    )}

                                    {columnVisibility.division_name && (
                                        // <td className="px-2 py-1 text-[#464255]">{row?.account_manage[row?.account_manage?.length - 1]?.division?.division_name}</td>
                                        <td className="px-2 py-1 text-[#464255]">{row?.division_ ? row?.division_?.division_name : ''}</td>
                                    )}

                                    {columnVisibility.first_name && (
                                        <td className="px-2 py-1 text-[#464255]">{row?.first_name}</td>
                                    )}

                                    {columnVisibility.last_name && (
                                        <td className="px-2 py-1 text-[#464255]">{row?.last_name}</td>
                                    )}

                                    {/* บอกว่า user มาจากไหน PTT, TPA website, Manual */}
                                    {columnVisibility.type && (
                                        <td className="px-2 py-1 justify-center ">
                                            {
                                                <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: String(row?.type_account?.color) }}>{row?.type_account?.name}</div>
                                            }
                                        </td>
                                    )}

                                    {columnVisibility.role_default && (
                                        // <td className="px-2 py-1 text-[#464255]">{row?.account_manage[0]?.account_role[0]?.role?.name}</td>
                                        <td className="px-2 py-1 text-[#464255]">{row?.role_name_}</td>
                                    )}

                                    {columnVisibility.telephone && (
                                        <td className="px-2 py-1 text-[#464255]">{row?.telephone ? maskLastFiveDigits(row?.telephone) : ''}</td>
                                    )}

                                    {columnVisibility.email && (
                                        <td className="px-2 py-1 text-[#464255]">{row?.email ? anonymizeEmail(row?.email) : ''}</td>
                                    )}

                                    {/* 
                                        start_date: "2025-02-20T17:00:00.000Z"
                                        start_date: "2025-02-21T00:00:00.000Z"
                                    */}

                                    {columnVisibility.start_date && (
                                        // <td className="px-2 py-1 text-[#464255]">{row?.start_date ? formatDateTimeSec(row?.start_date) : ''}</td>
                                        <td className="px-2 py-1 text-[#464255]">{row?.start_date ? formatDateNoTimeNoPlusSeven(row?.start_date) : ''}</td>
                                    )}

                                    {columnVisibility.end_date && (
                                        // <td className="px-2 py-1 text-[#0DA2A2]">{row?.end_date ? formatDateTimeSec(row?.end_date) : ''}</td>
                                        <td className="px-2 py-1 text-[#0DA2A2]">{row?.end_date ? formatDateNoTimeNoPlusSeven(row?.end_date) : ''}</td>
                                    )}

                                    {/* {columnVisibility.reason && (
                                    <td className="px-2 py-1 text-center">
                                        <div className="inline-flex items-center justify-center relative">
                                            <button
                                                type="button"
                                                className="flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                                                onClick={() => openReasonModal(row?.id, row?.account_reason)}
                                                disabled={row?.account_reason?.length <= 0 && true}
                                            >
                                                <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 18, color: '#747474', '&:hover': { color: '#ffffff' } }} />
                                            </button>
                                            <span className="px-2 text-[#464255]">
                                                {row?.account_reason?.length}
                                            </span>
                                        </div>
                                    </td>
                                )} */}

                                    {/* {columnVisibility.last_login && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.login_logs?.length > 0 ? formatDate(row?.login_logs[0]?.create_date) : ''}</td>
                                )} */}

                                    {columnVisibility.update_by && (
                                        <td className="px-2 py-1">
                                            {/* <div>
                                                <span className="text-[#464255]">{row?.updated_by_account?.first_name} {row?.updated_by_account?.last_name}</span>
                                                <div className="text-gray-500 text-xs">{row?.update_date ? formatDateTimeSec(row?.update_date) : ''}</div>
                                            </div> */}
                                            <div>
                                                <span className="text-[#464255]">{row?.update_by_mod?.first_name} {row?.update_by_mod?.last_name}</span>
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

            <ModalReason
                data={dataReason}
                open={mdReasonView}
                onClose={() => {
                    setMdReasonView(false);
                }}
            />
        </>
    )
}

export default TableUserHistory;