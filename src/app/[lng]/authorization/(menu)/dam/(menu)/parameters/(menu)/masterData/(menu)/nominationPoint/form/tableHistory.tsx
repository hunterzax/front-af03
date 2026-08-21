import { useEffect } from "react";
import React, { FC, useState } from 'react';
import { fillMissingUpdateByAccount, formatDate, formatDateNoTime, formatDateTimeSec, formatNumber, formatNumberThreeDecimal } from '@/utils/generalFormatter';
import AdjustIcon from '@mui/icons-material/Adjust';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import ModalViewContractPoint from "./modalViewContract";
interface TableProps {
    tableData: any;
    isLoading?: any;
    // openContractViewModal: (id?: any, group_data?: any, data?: any) => void;
    columnVisibility?: any;
}

const TableNomPointHistory: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility }) => {

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState<any>([]);

    // useEffect(() => {
    //     if (tableData && tableData.length > 0) {
    //         setSortedData(tableData);
    //     }
    //     setSortedData(tableData);
    // }, [tableData]);

    useEffect(() => {
        if (tableData && tableData.length > 0) {
            const normalized = fillMissingUpdateByAccount(tableData);
            setSortedData(normalized);
        } else {
            setSortedData([]);
        }
    }, [tableData]);

    // ############### MODAL CONTRACT POINT VIEW ###############
    const [mdContractView, setMdContractView] = useState<any>(false);
    const [dataContractModal, setDataContractModal] = useState<any>([]);

    const openContractViewModal = (id?: any, group_data?: any, data?: any) => {
         
        const filtered = tableData?.find((item: any) => item.id === id);
        setDataContractModal(filtered)
        setMdContractView(true)
    };

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    return (
        <>
            <div className={`h-[calc(100vh-500px)] overflow-y-auto block  rounded-t-md relative z-1`}>

                <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                    <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                        <tr className="h-9">

                            {columnVisibility.nomination_point && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("nomination_point", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                    {`Nomination Point`}
                                    {getArrowIcon("nomination_point")}
                                </th>
                            )}

                            {columnVisibility.description && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("description", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                    {`Description`}
                                    {getArrowIcon("description")}
                                </th>
                            )}

                            {columnVisibility.entry_exit && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("entry_exit_id", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                    {`Entry / Exit`}
                                    {getArrowIcon("entry_exit_id")}
                                </th>
                            )}

                            {columnVisibility.zone && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("zone_id", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                    {`Zone`}
                                    {getArrowIcon("zone_id")}
                                </th>
                            )}

                            {columnVisibility.area && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("area.name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                    {`Area`}
                                    {getArrowIcon("area.name")}
                                </th>
                            )}

                            {columnVisibility.contract_point && (
                                <th scope="col" className={`${table_sort_header_style}`}>
                                    {`Contract Point`}
                                    {/* {getArrowIcon("contract_point_id")} */}
                                </th>
                            )}

                            {columnVisibility.customer_type && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("customer_type.name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                    {`Customer Type`}
                                    {getArrowIcon("customer_type.name")}
                                </th>
                            )}

                            {columnVisibility.maximum_capacity && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("maximum_capacity", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                    {`Maximum Capacity (MMSCFD)`}
                                    {getArrowIcon("maximum_capacity")}
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
                        {sortedData && sortedData?.map((row: any, index: any) => (
                            <tr
                                key={row?.id}
                                className={`${table_row_style}`}
                            >

                                {columnVisibility.nomination_point && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.nomination_point}</td>
                                )}

                                {columnVisibility.description && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.description}</td>
                                )}

                                {columnVisibility.entry_exit && (
                                    <td className="px-2 py-1  justify-center ">{row?.entry_exit_id && <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.entry_exit?.color }}>{`${row?.entry_exit?.name}`}</div>}</td>
                                )}

                                {columnVisibility.zone && (
                                    <td className="px-2 py-1  justify-center ">{row?.zone && <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.zone?.color }}>{`${row?.zone?.name}`}</div>}</td>
                                )}

                                {columnVisibility.area && (
                                    <td className="px-2 py-1 justify-center ">
                                        {
                                            row?.area.entry_exit_id == 2 ?
                                                <div
                                                    className="flex justify-center items-center rounded-full p-1 text-[#464255]"
                                                    style={{ backgroundColor: row?.area?.color, width: '40px', height: '40px' }}
                                                >
                                                    {`${row?.area?.name}`}
                                                </div>
                                                :
                                                <div
                                                    className="flex justify-center items-center rounded-lg p-1 text-[#464255]"
                                                    style={{ backgroundColor: row?.area?.color, width: '40px', height: '40px' }}
                                                >
                                                    {`${row?.area?.name}`}
                                                </div>
                                        }
                                    </td>
                                )}

                                {/* {columnVisibility.contract_point && (
                                <td className="px-2 py-1 text-[#464255]">{row?.contract_point?.contract_point}</td>
                            )} */}

                                {columnVisibility.contract_point && (
                                    // <td className="px-2 py-1 text-[#464255]">{row?.contract_point?.contract_point}</td>
                                    <td className="px-2 py-1 text-center">
                                        <div className="inline-flex items-center justify-center relative">
                                            <button
                                                type="button"
                                                className={`flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative`}
                                                onClick={() => openContractViewModal(row?.id, row?.daily_adjustment_group, row)}
                                                disabled={row?.daily_adjustment_group?.length <= 0}
                                            >
                                                <AdjustIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                                            </button>
                                            <span className="px-2 text-[#464255]">
                                                {row?.contract_point_list?.length || 0}
                                            </span>
                                        </div>
                                    </td>
                                )}

                                {columnVisibility.customer_type && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.customer_type?.name}</td>
                                )}

                                {columnVisibility.maximum_capacity && (
                                    <td className="px-2 py-1 text-[#464255] text-right">{row?.maximum_capacity ? formatNumberThreeDecimal(row?.maximum_capacity) : ''}</td>
                                )}

                                {columnVisibility.start_date && (
                                    <td className="px-2 py-1 text-[#464255]">{row?.start_date ? formatDateNoTime(row?.start_date) : ''}</td>
                                )}

                                {columnVisibility.end_date && (
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

            <ModalViewContractPoint
                data={dataContractModal}
                open={mdContractView}
                onClose={() => {
                    setMdContractView(false);
                }}
            />
        </>
    )
}

export default TableNomPointHistory;