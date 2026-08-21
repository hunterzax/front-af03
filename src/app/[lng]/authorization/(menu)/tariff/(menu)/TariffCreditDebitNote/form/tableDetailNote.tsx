import { useEffect } from "react";
import React, { useState } from 'react';
import { formatNumberFourDecimalNom, formatNumberThreeDecimal, formatNumberThreeDecimalNom, formatNumberTwoDecimalNom, formatNumberTwoDecimalNomRound } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import ModeEditOutlinedIcon from '@mui/icons-material/ModeEditOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { NumericFormat } from "react-number-format";

interface TableProps {
    tableData: any;
    isLoading?: any;
    columnVisibility?: any;
    handleCheckboxChange?: any;
    selectedRows?: any;
    setSelectedRows?: any;
    isAllSelected?: any;
    handleSelectAll?: any;

    isEditing?: any;
    setIsEditing?: any;
    isEditedInRow?: any;
    setIsEditedInRow?: any;
    isSaveClick?: any;
    setIsSaveClick?: any;
    rowEditing?: any;
    setRowEditing?: any;
    handleEditClick?: any;
    handleSaveClick?: any;
    handleCancelClick?: any;

    handleSetTempData?: any;
    mode?: any
}

const TableDetailNote: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility, handleCheckboxChange, selectedRows, setSelectedRows, isAllSelected, handleSelectAll, isEditing, setIsEditing, isEditedInRow, setIsEditedInRow, isSaveClick, setIsSaveClick, rowEditing, setRowEditing, handleEditClick, handleSaveClick, handleCancelClick, handleSetTempData, mode }) => {
    const inputClass = "text-[14px] block p-2 h-[37px] w-full border-[1px] bg-white border-[#9CA3AF] outline-none bg-opacity-100 focus:border-[#00ADEF] hover:!p-2 focus:!p-2";

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState<any>([]);
    const [tableDataNew, setTableDataNew] = useState<any>([]);
    useEffect(() => {
        if (tableData && tableData.length > 0) {
            setTableDataNew(tableData)
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

    return (
        // <div className={`h-[calc(100vh-460px)] overflow-y-auto block  rounded-t-md relative z-1`}>
        <div className={`h-auto overflow-y-auto block  rounded-t-md relative z-1`}>

            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                    <tr className="h-9">

                        {
                            mode !== 'view' && <th className="rounded-tl-[10px] w-[5%]">
                                <div className="flex gap-2 text-[#58585A] align-middle justify-center items-center">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                        className="form-checkbox w-4 h-4"
                                        disabled={false}
                                    />
                                </div>
                            </th>
                        }

                        {columnVisibility.contract_code && (
                            <th scope="col" className={`${table_sort_header_style} `} onClick={() => handleSort("contract_code", sortState, setSortState, setSortedData, tableDataNew)}>
                                {`Contract Code`}
                                {getArrowIcon("contract_code")}
                            </th>
                        )}

                        {columnVisibility.contract_type && (
                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("term_obj.name", sortState, setSortState, setSortedData, tableDataNew)}>
                                {`Contract Type`}
                                {getArrowIcon("term_obj.name")}
                            </th>
                        )}

                        {columnVisibility.quantity && (
                            <th scope="col" className={`${table_sort_header_style} text-right`} onClick={() => handleSort("quantity", sortState, setSortState, setSortedData, tableDataNew)}>
                                {`Quantity`}
                                {getArrowIcon("quantity")}
                            </th>
                        )}

                        {columnVisibility.unit && (
                            <th scope="col" className={`${table_sort_header_style} text-right`} onClick={() => handleSort("unit", sortState, setSortState, setSortedData, tableDataNew)}>
                                {`Unit`}
                                {getArrowIcon("unit")}
                            </th>
                        )}

                        {columnVisibility.fee_baht && (
                            <th scope="col" className={`${table_sort_header_style} text-right`} onClick={() => handleSort("fee", sortState, setSortState, setSortedData, tableDataNew)}>
                                {`Fee (Baht/MMBTU)`}
                                {getArrowIcon("fee")}
                            </th>
                        )}

                        {columnVisibility.amount_baht && (
                            <th scope="col" className={`${table_sort_header_style} text-right`} onClick={() => handleSort("amount", sortState, setSortState, setSortedData, tableDataNew)}>
                                {`Amount (Baht)`}
                                {getArrowIcon("amount")}
                            </th>
                        )}

                        {columnVisibility.edit && mode !== 'view' && (
                            <th scope="col" className={`${table_header_style} !w-[180px] text-center`} >
                                {`Edit`}
                            </th>
                        )}
                    </tr>
                </thead>

                <tbody>
                    {sortedData && sortedData.map((row: any, index: number) => (
                        <tr
                            key={index}
                            className={`${table_row_style} ${row.isSummary ? "bg-gray-200 font-bold" : ""}`}
                        >
                            {
                                mode !== 'view' &&
                                <td className="px-2 py-1">
                                    <div className="flex gap-2 text-[#58585A] align-middle justify-center items-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.includes(index)}
                                            onChange={() => handleCheckboxChange(index)}
                                            className="form-checkbox w-4 h-4"
                                            disabled={false}
                                        />
                                    </div>
                                </td>
                            }

                            {columnVisibility.contract_code && (
                                <td className="px-2 py-1  text-[#464255]  ">{row?.contract_code ? row?.contract_code : ''}</td>
                            )}

                            {columnVisibility.contract_type && (
                                // <td className="px-2 py-1 items-center text-center justify-center ">{row?.contract_code ? row?.contract_code : ''}</td>
                                // <td className="px-2 py-1 justify-center ">
                                //     <div className="flex justify-center items-center">
                                //         {row?.term_type &&
                                //             <div className="flex min-w-[180px] max-w-[250px] justify-center text-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.term_type?.color }}>
                                //                 {`${row?.term_type?.name}`}
                                //             </div>
                                //         }
                                //     </div>
                                // </td>

                                <td className="h-full pl-2 py-1 text-center">
                                    {row?.term_obj && (
                                        <div className="flex items-center justify-center">
                                            <div
                                                className="flex w-[90%] min-w-[150px] max-w-[200px] !text-[14px] items-center justify-center rounded-full p-1 text-[#464255]"
                                                style={{ backgroundColor: row?.term_obj?.color }}
                                            >
                                                {`${row?.term_obj?.name}`}
                                            </div>
                                        </div>
                                    )}
                                </td>
                            )}

                            {columnVisibility.quantity && (
                                <td className="px-2 py-1 items-center text-[#464255] text-right justify-center ">
                                    {/* {row?.quantity ? row?.quantity : ''} */}
                                    {
                                        isEditing && rowEditing == row?.id ?
                                            <NumericFormat
                                                value={row?.quantity || ''}
                                                onValueChange={(values) => {
                                                    const { value } = values;
                                                    handleSetTempData(row?.id, value, 'quantity');
                                                }}
                                                thousandSeparator=","
                                                decimalScale={0}
                                                fixedDecimalScale={true}
                                                allowNegative={true}
                                                className={`${inputClass} `}
                                                style={{ textAlign: "right", width: "100%" }}
                                            />
                                            :
                                            // row?.quantity ? formatNumber(row?.quantity) : ''
                                            row?.quantity ? formatNumberThreeDecimal(row?.quantity) : ''
                                    }

                                </td>
                            )}

                            {columnVisibility.unit && (
                                <td className="px-2 py-1 items-center text-[#464255] text-center justify-center ">{row?.unit ? row?.unit : ''}</td>
                            )}

                            {columnVisibility.fee_baht && (
                                <td className="px-2 py-1 items-center text-[#464255] text-right justify-center ">
                                    {/* {row?.fee ? row?.fee : ''} */}

                                    {
                                        isEditing && rowEditing == row?.id ?
                                            <NumericFormat
                                                value={row?.fee || ''}
                                                onValueChange={(values) => {
                                                    const { value } = values;
                                                    handleSetTempData(row?.id, value, 'fee');
                                                }}
                                                thousandSeparator=","
                                                decimalScale={4}
                                                fixedDecimalScale={true}
                                                allowNegative={true}
                                                className={`${inputClass} `}
                                                style={{ textAlign: "right", width: "100%" }}
                                            />
                                            :
                                            // row?.fee ? formatNumberTwoDecimalNom(row?.fee) : ''
                                            row?.fee ? formatNumberFourDecimalNom(row?.fee) : '' // New/Edit : ปรับทศนิยม https://app.clickup.com/t/86euzxxmh
                                    }
                                </td>
                            )}

                            {columnVisibility.amount_baht && (
                                <td className="px-2 py-1 items-center text-[#464255] text-right justify-center ">
                                    {/* {row?.amount_baht ? row?.amount_baht : ''} */}

                                    {/* {
                                        isEditing && rowEditing == row?.id ?
                                            <NumericFormat
                                                value={row?.amount || ''}
                                                onValueChange={(values) => {
                                                    const { value } = values;
                                                    handleSetTempData(row?.id, value, 'amount');
                                                }}
                                                thousandSeparator=","
                                                decimalScale={3} // New/Edit/View : ที่ Column Fee(Baht) จะมีทศนิยม 3 ตำแหน่ง https://app.clickup.com/t/86euqmepw
                                                fixedDecimalScale={true}
                                                allowNegative={false}
                                                className={`${inputClass} `}
                                                style={{ textAlign: "right", width: "100%" }}
                                            />
                                            :
                                            // row?.amount ? formatNumberThreeDecimalNom(row?.amount) : '' // New/Edit/View : ที่ Column Fee(Baht) จะมีทศนิยม 3 ตำแหน่ง https://app.clickup.com/t/86euqmepw
                                            row?.amount ? formatNumberTwoDecimalNom(row?.amount) : '' // New/Edit : ปรับทศนิยม https://app.clickup.com/t/86euzxxmh
                                    } */}

                                    {row?.amount ? formatNumberTwoDecimalNomRound(row?.amount) : ''} 
                                </td>
                            )}

                            {columnVisibility.edit && mode !== 'view' && (
                                isEditing && rowEditing == row?.id ? (
                                    <td className="px-2 py-1 min-w-[140px]">
                                        <div className="flex gap-2 w-full">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    handleSaveClick(row?.id);
                                                    setIsSaveClick(true);
                                                }}
                                                disabled={!isEditedInRow} // Disable if isEditedInRow is false
                                                className={`flex w-[130px] h-[33px] px-4 py-2 rounded-[8px] items-center justify-center
                                                                ${isEditedInRow ? "bg-[#17AC6B] text-white cursor-pointer" : "bg-gray-400 text-gray-200 cursor-not-allowed"}`}
                                            >
                                                <div className="gap-2 flex">
                                                    {'Save Draft'}
                                                    <CheckOutlinedIcon sx={{ fontSize: 18, color: '#ffffff' }} />
                                                </div>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleCancelClick(row?.id)}
                                                className={`flex w-[130px] h-[33px] bg-[#ffffff] border border-[#646464]  text-[#464255] px-4 py-2 rounded-[8px] items-center justify-center`}
                                            >
                                                <div className="gap-2 flex">
                                                    {'Cancel'}
                                                    <CloseOutlinedIcon sx={{ fontSize: 18, color: '#464255' }} />
                                                </div>
                                            </button>
                                        </div>
                                    </td>
                                ) : (
                                    <td className="px-2 py-1 min-w-[140px]">
                                        <div className="relative inline-flex justify-center items-center w-full">

                                            <ModeEditOutlinedIcon
                                                onClick={(mode !== 'view') ? () => handleEditClick(row?.id) : undefined}
                                                // className={`border-[1px] rounded-[4px] cursor-pointer`}
                                                className={`border-[1px] rounded-[4px] ${mode === 'view' ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
                                                style={{
                                                    fontSize: "18px",
                                                    width: '22px',
                                                    height: '22px',
                                                    color: '#2B2A87',
                                                    borderColor: '#DFE4EA'
                                                }}
                                            />
                                        </div>
                                    </td>
                                )
                            )}
                        </tr>
                    ))}

                </tbody>
            </table>

            {
                sortedData?.length <= 0 &&
                <div className="flex flex-col justify-center items-center w-[100%] pt-10">
                    <img className="w-[40px] h-auto mb-2" src="/assets/image/no_data_icon.svg" alt="No data icon" />
                    <div className="text-[16px] text-[#9CA3AF]">
                        {`Please select filter to view the information.`}
                    </div>
                </div>
            }

        </div>
    )
}

export default TableDetailNote;