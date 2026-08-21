import { useEffect, useMemo, useRef } from "react";
import React, { FC, useState } from 'react';
import TableSkeleton, { DefaultSkeleton } from '@/components/material_custom/DefaultSkeleton';
import { formatDate, formatDateNoTime, formatNumber, formatNumberThreeDecimal } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style, table_sort_header_style_original } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import { NumericFormat } from "react-number-format";
import { useForm } from "react-hook-form";
interface TableProps {
    tableData: any;
    // dataMaster: any;
    setDataPost?: any;
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

const TableReleaseCapSub: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility, setIsAllTotalZero, setDataPost, userPermission }) => {
  
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
    const [sortedData, setSortedData] = useState<any>(tableData || []);
    const [dataMaster, setDataMaster] = useState(tableData);

    useEffect(() => {
        if (tableData && tableData.length > 0) {
            setSortedData(tableData);
            setDataMaster(tableData);
        }else{
            setSortedData([]);
        }

    }, [tableData]);

    // const getArrowIcon = (column: string) => {
    //     return <div className={`${table_col_arrow_sort_style}`}>
    //         <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
    //         <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
    //     </div>
    // };

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
        sortedData.forEach((row: any, index: any) => {
            const valueOne = watch(`entry_release_mmbtud.${index}`);
            const valueTwo = watch(`exit_release_mmbtud.${index}`);
            newTotalValues[index] = {
                value: Math.abs((valueOne || 0) - (valueTwo || 0)),
            };
        });
        setTotalValues(newTotalValues);

        // ยัด total_release_mmbtu_d เข้า data หลัก เอาไว้ใช้ตอนส่ง submission !!
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
    }, [
        ...(Array.isArray(sortedData) ? sortedData.map((_: any, index: any) => watch(`entry_release_mmbtud.${index}`)) : []),
        ...(Array.isArray(sortedData) ? sortedData.map((_: any, index: any) => watch(`exit_release_mmbtud.${index}`)) : []),
        ...(Array.isArray(sortedData) ? sortedData.map((_: any, index: any) => watch(`entry_release_mmscfd.${index}`)) : []),
        ...(Array.isArray(sortedData) ? sortedData.map((_: any, index: any) => watch(`exit_release_mmscfd.${index}`)) : []),
    ]);
    // }, [sortedData, ...sortedData?.map((_: any, index: any) => watch(`entry_release_mmbtud.${index}`)), ...sortedData.map((_: any, index: any) => watch(`exit_release_mmbtud.${index}`))]);

    const dataMasterRef = useRef(dataMaster); // Keep a reference to the previous value
    useEffect(() => {
        const isDataMasterChanged = JSON.stringify(dataMasterRef.current) !== JSON.stringify(dataMaster);
        if (isDataMasterChanged) {
            dataMasterRef.current = dataMaster; // Update the reference
            setDataPost(dataMaster); // Trigger update only if necessary
        }
    }, [dataMaster]);
    
    return (
        <div className={`h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md relative z-1`}>
            {
                isLoading ?
                    <div>
                        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                            <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                                <tr className="h-9">

                                    {columnVisibility.contract_point && (
                                        <th scope="col" className={`${table_header_style}`} 
                                            // onClick={() => handleSort("contract_point", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`Point`}
                                            {/* {getArrowIcon("contract_point")} */}
                                        </th>
                                    )}

                                    {columnVisibility.entry_exit && (
                                        <th scope="col" className={`${table_header_style}`} 
                                            // onClick={() => handleSort("entry_exit_id", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`Entry / Exit`}
                                            {/* {getArrowIcon("entry_exit_id")} */}
                                        </th>
                                    )}

                                    {columnVisibility.start_date && (
                                        <th scope="col" className={`${table_header_style}`} 
                                            // onClick={() => handleSort("start_date", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`Start Date`}
                                            {/* {getArrowIcon("start_date")} */}
                                        </th>
                                    )}

                                    {columnVisibility.end_date && (
                                        <th scope="col" className={`${table_header_style}`} 
                                            // onClick={() => handleSort("end_date", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`End Date`}
                                            {/* {getArrowIcon("end_date")} */}
                                        </th>
                                    )}

                                    {columnVisibility.contracted_mmbtu_d && (
                                        <th scope="col" className={`${table_header_style}`} 
                                            // onClick={() => handleSort("contracted_mmbtu_d", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`Contracted (MMBTU/D)`}
                                            {/* {getArrowIcon("contracted_mmbtu_d")} */}
                                        </th>
                                    )}

                                    {columnVisibility.contracted_mmscfd && (
                                        <th scope="col" className={`${table_header_style}`} 
                                            // onClick={() => handleSort("contracted_mmscfd", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`Contracted (MMSCFD)`}
                                            {/* {getArrowIcon("contracted_mmscfd")} */}
                                        </th>
                                    )}

                                    {columnVisibility.release_mmscfd && (
                                        <th scope="col" className={`${table_header_style}`} >
                                            {`Release (MMSCFD)`}
                                        </th>
                                    )}

                                    {columnVisibility.release_mmbtud && (
                                        <th scope="col" className={`${table_header_style}`} >
                                            {`Release (MMBTU/D)`}
                                        </th>
                                    )}

                                </tr>
                            </thead>

                            <tbody>
                                {sortedData?.length > 0 && sortedData?.map((row: any, index: any) => {
                                    const total = totalValues[index]; // Get the total for the current row

                                    return (<>
                                        {/* ENTRY */}
                                        <tr
                                            key={index}
                                            className={`${table_row_style}`}
                                        >
                                            {columnVisibility.contract_point && (
                                                <td className="px-2 py-1 text-[#464255]">{row?.entryData ? row?.entryData?.contract_point : ''}</td>
                                            )}

                                            {columnVisibility.entry_exit && (
                                                <td className="px-2 py-1  justify-center ">{row?.entryData?.entry_exit && <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.entryData?.entry_exit?.color }}>{`${row?.entryData?.entry_exit?.name}`}</div>}</td>
                                            )}

                                            {columnVisibility.start_date && (
                                                // <td className={`px-2 py-1 ${row?.entryData ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.entryData?.start_date ? formatDateNoTime(dayjs(row?.entryData?.start_date).format("DD/MM/YYYY")) : ''}</td>
                                                <td className={`px-2 py-1 ${row?.entryData ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.entryData?.start_date ? row?.entryData?.start_date : ''}</td>
                                            )}

                                            {columnVisibility.end_date && (
                                                // <td className={`px-2 py-1 ${row?.entryData ? "text-[#0DA2A2]" : "text-[#9CA3AF]"}`}>{row?.entryData?.end_date ? formatDateNoTime(dayjs(row?.entryData?.end_date).format("DD/MM/YYYY")) : ''}</td>
                                                <td className={`px-2 py-1 ${row?.entryData ? "text-[#0DA2A2]" : "text-[#9CA3AF]"}`}>{row?.entryData?.end_date ? row?.entryData?.end_date : ''}</td>
                                            )}

                                            {columnVisibility.contracted_mmbtu_d && (
                                                <td className="px-2 py-1 text-[#464255] text-right">{row?.entryData?.contracted_mmbtu_d && formatNumberThreeDecimal(row?.entryData?.contracted_mmbtu_d)}</td>
                                            )}

                                            {columnVisibility.contracted_mmscfd && (
                                                <td className="px-2 py-1 text-[#464255] text-right">{row?.entryData?.contracted_mmscfd && formatNumberThreeDecimal(row?.entryData?.contracted_mmscfd)}</td>
                                            )}

                                            {columnVisibility.release_mmscfd && (
                                                <td className="px-2 py-1 text-[#464255]">
                                                    <NumericFormat
                                                        id="entry_release_mmscfd"
                                                        placeholder=""
                                                        // value={watch("before_gas_day")}
                                                        readOnly={false}
                                                        {...register(`entry_release_mmscfd.${index}`, {
                                                            required: true,
                                                            valueAsNumber: true,
                                                            validate: (value: any) => value >= 0 || "Value must be non-negative",
                                                        })}
                                                        className={`${inputClass}`}
                                                        thousandSeparator={true}
                                                        decimalScale={3}
                                                        fixedDecimalScale={true}
                                                        allowNegative={false}
                                                        displayType="input"
                                                        onValueChange={(values) => {
                                                            const { value } = values;
                                                            setValue(`entry_release_mmscfd.${index}`, parseFloat(value), { shouldValidate: true });
                                                        }}
                                                    />
                                                </td>
                                            )}

                                            {columnVisibility.release_mmbtud && (
                                                <td className="px-2 py-1 text-[#464255]">
                                                    <NumericFormat
                                                        id={`entry_release_mmbtud.${index}`}
                                                        placeholder=""
                                                        // value={watch("before_gas_day")}
                                                        readOnly={false}
                                                        {...register(`entry_release_mmbtud.${index}`, {
                                                            required: true,
                                                            valueAsNumber: true,
                                                            validate: (value: any) => value >= 0 || "Value must be non-negative",
                                                        })}
                                                        className={`${inputClass}`}
                                                        thousandSeparator={true}
                                                        decimalScale={3}
                                                        fixedDecimalScale={true}
                                                        allowNegative={false}
                                                        displayType="input"
                                                        onValueChange={(values) => {
                                                            const { value } = values;
                                                            setValue(`entry_release_mmbtud.${index}`, parseFloat(value), { shouldValidate: true });
                                                        }}
                                                    />
                                                </td>
                                            )}
                                        </tr>

                                        {/* EXIT */}
                                        <tr
                                            key={index}
                                            className={`${table_row_style}`}
                                        >
                                            {columnVisibility.contract_point && (
                                                <td className="px-2 py-1 text-[#464255]">{row?.exitData ? row?.exitData?.contract_point : ''}</td>
                                            )}

                                            {columnVisibility.entry_exit && (
                                                <td className="px-2 py-1  justify-center ">{row?.exitData?.entry_exit && <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.exitData?.entry_exit?.color }}>{`${row?.exitData?.entry_exit?.name}`}</div>}</td>
                                            )}

                                            {columnVisibility.start_date && (
                                                <td className={`px-2 py-1 ${row?.exitData ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.exitData?.start_date ? formatDateNoTime(row?.exitData?.start_date) : ''}</td>
                                            )}

                                            {columnVisibility.end_date && (
                                                // <td className={`px-2 py-1 ${row?.exitData ? "text-[#0DA2A2]" : "text-[#9CA3AF]"}`}>{row?.exitData?.end_date ? formatDateNoTime(dayjs(row?.exitData?.end_date, "DD/MM/YYYY").format("DD/MM/YYYY")) : ''}</td>
                                                <td className={`px-2 py-1 ${row?.exitData ? "text-[#0DA2A2]" : "text-[#9CA3AF]"}`}>{row?.exitData?.end_date ? row?.exitData?.end_date : ''}</td>
                                            )}

                                            {columnVisibility.contracted_mmbtu_d && (
                                                <td className="px-2 py-1 text-[#464255] text-right">{row?.exitData?.contracted_mmbtu_d && formatNumberThreeDecimal(row?.exitData?.contracted_mmbtu_d)}</td>
                                            )}

                                            {columnVisibility.contracted_mmscfd && (
                                                <td className="px-2 py-1 text-[#464255] text-right">{row?.exitData?.contracted_mmscfd && formatNumberThreeDecimal(row?.exitData?.contracted_mmscfd)}</td>
                                            )}

                                            {columnVisibility.release_mmscfd && (
                                                <td className="px-2 py-1 text-[#464255]">
                                                    <NumericFormat
                                                        id={`exit_release_mmscfd.${index}`}
                                                        placeholder=""
                                                        // value={watch("before_gas_day")}
                                                        readOnly={row?.exitData?.contracted_mmscfd ? false : true}
                                                        disabled={row?.exitData?.contracted_mmscfd ? false : true}
                                                        className={`${inputClass} ${row?.exitData?.contracted_mmscfd ? '' : '!bg-[#EFECEC] cursor-not-allowed hover:!bg-[#EFECEC]'}`}
                                                        {...register(`exit_release_mmscfd.${index}`, {
                                                            required: true,
                                                            valueAsNumber: true,
                                                            validate: (value: any) => value >= 0 || "Value must be non-negative",
                                                        })}
                                                        thousandSeparator={true}
                                                        decimalScale={3}
                                                        fixedDecimalScale={true}
                                                        allowNegative={false}
                                                        displayType="input"
                                                        onValueChange={(values) => {
                                                            const { value } = values;
                                                            setValue(`exit_release_mmscfd.${index}`, parseFloat(value), { shouldValidate: true });
                                                        }}
                                                    />
                                                </td>
                                            )}

                                            {columnVisibility.release_mmbtud && (
                                                <td className="px-2 py-1 text-[#464255]">
                                                    <NumericFormat
                                                        id={`exit_release_mmbtud.${index}`}
                                                        placeholder=""
                                                        readOnly={false}
                                                        {...register(`exit_release_mmbtud.${index}`, {
                                                            required: true,
                                                            valueAsNumber: true,
                                                            validate: (value: any) => value >= 0 || "Value must be non-negative",
                                                        })}
                                                        className={`${inputClass}`}
                                                        thousandSeparator={true}
                                                        decimalScale={3}
                                                        fixedDecimalScale={true}
                                                        allowNegative={false}
                                                        displayType="input"
                                                        onValueChange={(values) => {
                                                            const { value } = values;
                                                            setValue(`exit_release_mmbtud.${index}`, parseFloat(value), { shouldValidate: true });
                                                        }}
                                                    />
                                                </td>
                                            )}
                                        </tr>

                                        <tr
                                            key={row?.id}
                                            className={`${table_row_style}`}
                                        >
                                            <td className="px-2 py-1 font-semibold text-[#464255] bg-[#00ADEF47]" colSpan={7}>{`Total`}</td>
                                            <td className={`px-2 py-1 font-semibold text-[#464255] bg-[#00ADEF47] text-right ${total && total.value.toFixed(3) !== "0.000" ? 'text-[#ED1B24]' : ''}`}>
                                                {total ? total.value.toFixed(3) : "0.000"}
                                            </td>

                                        </tr>
                                    </>
                                    )
                                })}
                            </tbody>
                        </table>

                        {
                            sortedData?.length <= 0 && <div className="flex flex-col justify-center items-center w-[100%] pt-24">
                                <img className="w-[40px] h-auto mb-2" src="/assets/image/no_data_icon.svg" alt="No data icon" />
                                <div className="text-[16px] text-[#9CA3AF]">
                                    Please select a contract code filter to view the information.
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

export default TableReleaseCapSub;


