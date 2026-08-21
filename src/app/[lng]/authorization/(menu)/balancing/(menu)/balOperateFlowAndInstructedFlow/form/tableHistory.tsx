import { useEffect } from "react";
import React, { useState } from 'react';
import { formatDateTimeSec, formatNumberFourDecimal, formatNumberSixDecimalNom } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
interface TableProps {
    tableData: any;
    isLoading?: any;
    columnVisibility?: any;
    userPermission?: any
}

const TableBalOperateAndInstruct: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility, userPermission }) => {
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);
    const [mainData, setMainData] = useState([]);
    useEffect(() => {
        if (tableData && tableData.length > 0) {

            // change each tableData.row_data into root and change create.create_by to root create_by_account : {"first_name": create.create_by.first_name, "last_name": create.create_by.last_name, "create_date": create?.create_date}
            const transformed_history = tableData.map((item: any) => {
                const {
                    row_data,
                    create,
                    ...rest
                } = item;

                return {
                    ...rest,
                    ...row_data,
                    create_by_account: {
                        first_name: create?.create_by?.first_name,
                        last_name: create?.create_by?.last_name,
                        create_date: create?.create_date
                    }
                };
            });
            setSortedData(transformed_history);
            setMainData(transformed_history);
        } else {
            setSortedData([]);
            setMainData([]);
        }
        // setSortedData(tableData);
    }, [tableData]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    return (
        <div className={`h-[calc(100vh-500px)] overflow-y-auto block  rounded-t-md relative z-1`}>

            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                    <tr className="h-20">

                        {columnVisibility?.acc_imbalance && (
                            <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-left`} onClick={() => handleSort("accImb_or_accImbInv", sortState, setSortState, setSortedData, mainData)}>
                                <div>{`Acc. Imbalance / Acc. Imbalance `}</div>
                                <div>{`Inventory (MMBTU)`}</div>
                                {getArrowIcon("accImb_or_accImbInv")}
                            </th>
                        )}

                        {columnVisibility?.acc_margin && (
                            <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-center`} onClick={() => handleSort("accMargin", sortState, setSortState, setSortedData, mainData)}>
                                {`Acc.Margin (MMBTU)`}
                                {getArrowIcon("accMargin")}
                            </th>
                        )}

                        {columnVisibility?.flow_type && (
                            <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[180px] w-[260px] text-center`} onClick={() => handleSort("level", sortState, setSortState, setSortedData, mainData)}>
                                {`Flow Type`}
                                {getArrowIcon("level")}
                            </th>
                        )}

                        {/* {columnVisibility?.operation_instructed_flow_order_mmscf && (
                            <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-left`}>
                                <div>{`Operation / Instructed Flow`}</div>
                                <div>{`Order (MMSCF)`}</div>
                                {getArrowIcon("timestamp")}
                            </th>
                        )}

                        {columnVisibility?.operation_instructed_flow_order_mmscfh && (
                            <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-left`}>
                                <div>{`Operation / Instructed Flow`}</div>
                                <div>{`Order (MMSCF/H)`}</div>
                                {getArrowIcon("timestamp")}
                            </th>
                        )} */}

                        {columnVisibility?.energy_adjustment_mmbtu && (
                            <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-center`} onClick={() => handleSort("energyAdjust", sortState, setSortState, setSortedData, mainData)}>
                                {`Energy Adjustment (MMBTU)`}
                                {getArrowIcon("energyAdjust")}
                            </th>
                        )}

                        {columnVisibility?.energy_flow_rate_adjustment_mmbtuh && (
                            <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-left`} onClick={() => handleSort("energyAdjustRate_mmbtuh", sortState, setSortState, setSortedData, mainData)}>
                                <div>{`Energy Flow Rate`}</div>
                                <div>{`Adjustment (MMBTU/H)`}</div>
                                {getArrowIcon("energyAdjustRate_mmbtuh")}
                            </th>
                        )}

                        {columnVisibility?.energy_flow_rate_adjustment_mmbtud && (
                            <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-left`} onClick={() => handleSort("energyAdjustRate_mmbtud", sortState, setSortState, setSortedData, mainData)}>
                                <div>{`Energy Flow Rate`}</div>
                                <div>{`Adjustment (MMBTU/D)`}</div>
                                {getArrowIcon("energyAdjustRate_mmbtud")}
                            </th>
                        )}

                        {columnVisibility?.volume_adjustment_mmbtu && (
                            <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-center`} onClick={() => handleSort("volumeAdjust", sortState, setSortState, setSortedData, mainData)}>
                                {/* {`Volume Adjustment (MMBTU)`} */}
                                {`Volume Adjustment (MMSCF)`}
                                {getArrowIcon("volumeAdjust")}
                            </th>
                        )}

                        {columnVisibility?.volume_flow_rate_adjustment_mmscfh && (
                            <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-left`} onClick={() => handleSort("volumeAdjustRate_mmscfh", sortState, setSortState, setSortedData, mainData)}>
                                <div>{`Volume Flow Rate`}</div>
                                <div>{`Adjustment (MMSCF/H)`}</div>
                                {getArrowIcon("volumeAdjustRate_mmscfh")}
                            </th>
                        )}

                        {columnVisibility?.volume_flow_rate_adjustment_mmscfd && (
                            <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-left`} onClick={() => handleSort("volumeAdjustRate_mmscfd", sortState, setSortState, setSortedData, mainData)}>
                                <div>{`Volume Flow Rate`}</div>
                                <div>{`Adjustment (MMSCFD)`}</div>
                                {getArrowIcon("volumeAdjustRate_mmscfd")}
                            </th>
                        )}

                        {columnVisibility?.resolvedTime_hr && (
                            <th className={`${table_sort_header_style} px-4 bg-[#1473A1] min-w-[80px] text-center`} onClick={() => handleSort("resolveHour", sortState, setSortState, setSortedData, mainData)}>
                                {`ResolvedTime (Hr.)`}
                                {getArrowIcon("resolveHour")}
                            </th>
                        )}

                        {columnVisibility?.hv_btu_scf && (
                            <th className={`${table_sort_header_style} bg-[#1473A1] min-w-[80px] text-center`} onClick={() => handleSort("heatingValue", sortState, setSortState, setSortedData, mainData)}>
                                {`HV (BTU/SCF)`}
                                {getArrowIcon("heatingValue")}
                            </th>
                        )}

                        {columnVisibility.updated_by && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("update_by_account.first_name", sortState, setSortState, setSortedData, tableData)}>
                                {`Updated by`}
                                {getArrowIcon("update_by_account.first_name")}
                            </th>
                        )}

                    </tr>
                </thead>

                <tbody>
                    {sortedData && sortedData.map((row: any, index: any) => {

                        let flow_type = ""
                        switch (row?.level) {
                            case "OFO":
                                // flow_type = "OPERATION FLOW"
                                flow_type = "OPERATION FLOW ORDER"
                                break;
                            case "DD":
                                // flow_type = "DIFFICULT DAY FLOW"
                                flow_type = "DIFFICULT DAY"
                                break;
                            case "IF":
                                flow_type = "INSTRUCTED FLOW"
                                break;
                        }

                        return (
                            <tr
                                key={row?.id}
                                className={`${table_row_style}`}
                            >

                                {columnVisibility?.acc_imbalance && (
                                    <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF]">
                                        {row?.accImb_or_accImbInv ? formatNumberFourDecimal(row?.accImb_or_accImbInv) : ''}
                                    </td>
                                )}

                                {columnVisibility?.acc_margin && (
                                    <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF]">
                                        {row?.accMargin ? formatNumberFourDecimal(row?.accMargin) : ''}
                                    </td>
                                )}

                                {columnVisibility?.flow_type && (
                                    <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF] ">
                                        {row?.level ? flow_type : ''}
                                    </td>
                                )}

                                {columnVisibility?.energy_adjustment_mmbtu && (
                                    <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF]">
                                        {row?.energyAdjust ? formatNumberFourDecimal(row?.energyAdjust) : ''}
                                    </td>
                                )}

                                {columnVisibility?.energy_flow_rate_adjustment_mmbtuh && (
                                    <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF]">
                                        {row?.energyAdjustRate_mmbtuh ? formatNumberFourDecimal(row?.energyAdjustRate_mmbtuh) : ''}
                                    </td>
                                )}

                                {columnVisibility?.energy_flow_rate_adjustment_mmbtud && (
                                    <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF]">
                                        {row?.energyAdjustRate_mmbtud ? formatNumberFourDecimal(row?.energyAdjustRate_mmbtud) : ''}
                                    </td>
                                )}

                                {columnVisibility?.volume_adjustment_mmbtu && (
                                    <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF]">
                                        {/* ตรงนี้ถึง column มันเปลี่ยนไปใช้ mmscf แล้ว */}

                                        {/* ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w  */}
                                        {/* {row?.volumeAdjust ? formatNumberFourDecimal(row?.volumeAdjust) : ''} */}
                                        {row?.volumeAdjust ? formatNumberSixDecimalNom(row?.volumeAdjust) : ''}
                                    </td>
                                )}

                                {columnVisibility?.volume_flow_rate_adjustment_mmscfh && (
                                    <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF]">
                                        {/* ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w  */}
                                        {/* {row?.volumeAdjustRate_mmscfh ? formatNumberFourDecimal(row?.volumeAdjustRate_mmscfh) : ''} */}
                                        {row?.volumeAdjustRate_mmscfh ? formatNumberSixDecimalNom(row?.volumeAdjustRate_mmscfh) : ''}
                                    </td>
                                )}

                                {columnVisibility?.volume_flow_rate_adjustment_mmscfd && (
                                    <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF]">
                                        {/* ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w  */}
                                        {/* {row?.volumeAdjustRate_mmscfd ? formatNumberFourDecimal(row?.volumeAdjustRate_mmscfd) : ''} */}
                                        {row?.volumeAdjustRate_mmscfd ? formatNumberSixDecimalNom(row?.volumeAdjustRate_mmscfd) : ''}
                                    </td>
                                )}

                                {columnVisibility?.resolvedTime_hr && (
                                    <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF]">
                                        {row?.resolveHour ? row?.resolveHour : ''}
                                    </td>
                                )}

                                {columnVisibility?.hv_btu_scf && (
                                    <td className="px-2 py-1  text-right text-[#464255] bg-[#FFFFFF]">
                                        {row?.heatingValue ? formatNumberFourDecimal(row?.heatingValue) : ''}
                                    </td>
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
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default TableBalOperateAndInstruct;