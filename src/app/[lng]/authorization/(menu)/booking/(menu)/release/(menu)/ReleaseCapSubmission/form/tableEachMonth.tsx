import { useEffect, useRef } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatDateNoTime, formatNumberThreeDecimal, isInPastOrCurrentMonth } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style } from "@/utils/styles";
import { NumericFormat } from "react-number-format";
import { useForm } from "react-hook-form";
import { addDays, parse } from "date-fns";

interface TableProps {
    tableData: any;
    callBack: any;
    isLoading: any;
    isResetForm: boolean;
    isResetFormCallBack: any;
    columnVisibility: any;
    userPermission?: any;
}

const TableReleaseCapSubEachMonth: React.FC<TableProps> = ({ tableData, callBack, isLoading, isResetForm, isResetFormCallBack, columnVisibility, userPermission }) => {
    const { register, handleSubmit, clearErrors, setError, setValue, reset, formState: { errors }, watch } = useForm<any>();

    const inputClass = "text-sm block md:w-full p-2 ps-5 pe-10 h-[35px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]";
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState<any>(tableData || []);

    useEffect(() => {
        // ถ้าจะเปิด region หาทุก exit ในทุก entry ไปเปิด servive getReleaseGroupByEntryAreaAndDate, หน้า ReleaseCapSubmission , ReleaseCapManagement ModalSubmissionDetails กับ tbody ข้างล่างด้วย
        // #region หาทุก exit ในทุก entry
        // if (tableData && tableData.length > 0) {
        //     setSortedData(tableData);
        //     tableData?.map((row: any, index: any) => {
        //         row?.map((subRow: any, subRowIndex: any) => {
        //             const id = subRow?.booking_row_json_id
        //             const startDate = subRow?.temp_start_date
        //             const endDate = subRow?.temp_end_date

        //             const scfKey = `release_mmscfd_${id}_${startDate}_${endDate}_${subRow?.temp_date}`
        //             const btuKey = `release_mmbtud_${id}_${startDate}_${endDate}_${subRow?.temp_date}`

        //             if(subRow?.total_release_mmbtu_d){
        //                 setValue(btuKey, subRow.total_release_mmbtu_d, { shouldValidate: true });
        //             }
        //             if(subRow?.total_release_mmscfd){
        //                 setValue(scfKey, subRow.total_release_mmscfd , { shouldValidate: true });
        //             }
        //         })
        //     })
        // }
        // #endregion หาทุก exit ในทุก entry
        //#region ของเดิม
        if (tableData && tableData.length > 0) {
            setSortedData(tableData);
            tableData?.map((row: any, index: any) => {
                row?.map((subRow: any, subRowIndex: any) => {
                    const name = (subRow?.entry_exit?.name?.toLowerCase()) || (subRowIndex == 0 ? 'entry' : 'exit')
                    const entryName = subRow?.pathMatch?.entry?.name
                    const exitName = subRow?.pathMatch?.exit?.name

                    if(subRow?.total_release_mmbtu_d){
                        setValue(`${name}_release_mmbtud_${entryName}_${exitName}_${subRow?.temp_date}`, subRow?.total_release_mmbtu_d || '-', { shouldValidate: true });
                    }
                    if(subRow?.total_release_mmscfd){
                        setValue(`${name}_release_mmscfd_${entryName}_${exitName}_${subRow?.temp_date}`, subRow?.total_release_mmscfd || '-', { shouldValidate: true });
                    }
                })
            })
        }
        //#endregion ของเดิม
        setSortedData(tableData);

    }, [tableData]);

    useEffect(() => {
        if (isResetForm == true) {
            reset()
            isResetFormCallBack()
        }
    }, [isResetForm]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    return (
        <div className={`h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md relative z-1`}>
            {
                !isLoading ?
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
                                {
                                    // ถ้าจะเปิด region หาทุก exit ในทุก entry ไปเปิด servive getReleaseGroupByEntryAreaAndDate, หน้า ReleaseCapSubmission , ReleaseCapManagement ModalSubmissionDetails กับ useEffect ข้างบนด้วย
                                    // #region หาทุก exit ในทุก entry
                                    // sortedData?.length > 0 && sortedData.map((row: any, index: any) => {
                                    //     let total: number = 0
                                    //     const subRow = row?.map((subRow: any, subRowIndex: any) => {
                                    //         const id = subRow?.booking_row_json_id
                                    //         const startDate = subRow?.temp_start_date
                                    //         const endDate = subRow?.temp_end_date

                                    //         const scfKey = `release_mmscfd_${id}_${startDate}_${endDate}_${subRow?.temp_date}`
                                    //         const btuKey = `release_mmbtud_${id}_${startDate}_${endDate}_${subRow?.temp_date}`

                                    //         if(watch(btuKey)){
                                    //             if(subRow.entry_exit_id == 1){
                                    //                 total = total + watch(btuKey)
                                    //             }
                                    //             else{
                                    //                 total = total - watch(btuKey)
                                    //             }
                                    //         }

                                    //         // subRow?.temp_start_date = 01/01/2026
                                    //         // subRow?.temp_end_date = 31/01/2026
                                    //         //  readOnly={subRow?.total_contracted_mmscfd ? false : true} เพิ่มเงื่อนไข ถ้า subRow?.temp_start_date กับ subRow?.temp_end_date เป็นช่วงเดือนที่ผ่านมาหรือเดือนปัจจุบัน ให้ readOnly = true
                                            
                                    //         let maxMmbtud: number = 0
                                    //         let maxMmscfd: number = 0

                                    //         try {
                                    //             maxMmbtud = parseFloat(subRow?.total_contracted_mmbtu_d || -1)
                                    //             if(isNaN(maxMmbtud)){
                                    //                 maxMmbtud = 0
                                    //             }
                                    //         } catch (error) {
                                    //             maxMmbtud = 0
                                    //         }

                                    //         try {
                                    //             maxMmscfd = parseFloat(subRow?.total_contracted_mmscfd || -1)
                                    //             if(isNaN(maxMmscfd)){
                                    //                 maxMmscfd = 0
                                    //             }
                                    //         } catch (error) {
                                    //             maxMmscfd = 0
                                    //         }
                                            
                                    //         return <tr
                                    //                     key={`${index}.${subRowIndex}`}
                                    //                     className={`${table_row_style}`}
                                    //                 >
                                    //                     {columnVisibility.contract_point && (
                                    //                         <td className="px-2 py-1 text-[#464255]">{subRow?.temp_contract_point || ''}</td>
                                    //                     )}

                                    //                     {columnVisibility.entry_exit && (
                                    //                         <td className="px-2 py-1  justify-center ">{subRow?.entry_exit && <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: subRow?.entry_exit?.color }}>{`${subRow?.entry_exit?.name}`}</div>}</td>
                                    //                     )}

                                    //                     {columnVisibility.start_date && (
                                    //                         <td className={`px-2 py-1 ${subRow?.temp_start_date? "text-[#464255]" : "text-[#9CA3AF]"}`}>{subRow?.temp_start_date || ''}</td>
                                    //                     )}

                                    //                     {columnVisibility.end_date && (
                                    //                         <td className={`px-2 py-1 ${subRow?.temp_end_date? "text-[#0DA2A2]" : "text-[#9CA3AF]"}`}>{subRow?.temp_end_date ? formatDateNoTime(addDays(parse(subRow?.temp_end_date , 'dd/MM/yyyy', new Date()), subRow?.is_terminate != true ? 1 : 0).toISOString()) : ''}</td>
                                    //                     )}

                                    //                     {columnVisibility.contracted_mmbtu_d && (
                                    //                         <td className="px-2 py-1 text-[#464255] text-right">{subRow?.total_contracted_mmbtu_d && formatNumberThreeDecimal(subRow?.total_contracted_mmbtu_d)}</td>
                                    //                     )}

                                    //                     {columnVisibility.contracted_mmscfd && (
                                    //                         <td className="px-2 py-1 text-[#464255] text-right">{subRow?.total_contracted_mmscfd && formatNumberThreeDecimal(subRow?.total_contracted_mmscfd)}</td>
                                    //                     )}


                                    //                     {columnVisibility.release_mmscfd && (
                                    //                         <td className="px-2 py-1 text-[#464255]">
                                    //                             <NumericFormat
                                    //                                 id={`${id}_release_mmscfd_${startDate}_${endDate}_${subRow?.temp_date}`}
                                    //                                 placeholder=""
                                    //                                 // readOnly={subRow?.total_contracted_mmscfd ? false : true}
                                    //                                 // disabled={subRow?.total_contracted_mmscfd ? false : true}

                                    //                                 // v2.0.29 ต้องไม่ให้ใส่ข้อมูล release ของเดือนที่ผ่านมาแล้วกับเดือนปัจจุบันได้ ให้ disable ช่องไว้เลย ตอนทดสอบยังให้ใส่ได้ แต่ submit ไม่ได้ และขึ้น error mesg ผิด https://app.clickup.com/t/86etjye00 
                                    //                                 readOnly={
                                    //                                     !subRow?.total_contracted_mmscfd ||
                                    //                                     isInPastOrCurrentMonth(subRow?.temp_start_date, subRow?.temp_end_date)
                                    //                                 }
                                    //                                 disabled={subRow?.total_contracted_mmscfd ? false : true}
                                    //                                 className={`${inputClass} ${ errors[scfKey] && 'border-red-500'} ${subRow?.total_contracted_mmscfd ? '' : '!bg-[#EFECEC] cursor-not-allowed hover:!bg-[#EFECEC]'}`}
                                    //                                 {...register(scfKey, {
                                    //                                     required: true,
                                    //                                     valueAsNumber: true,
                                    //                                     validate: (value: any) => value >= 0 || "Value must be non-negative",
                                    //                                     // setValueAs: (v) => v === "" ? undefined : Number(v), // แปลงค่าว่างเป็น undefined
                                    //                                 })}
                                    //                                 thousandSeparator={true}
                                    //                                 decimalScale={3}
                                    //                                 fixedDecimalScale={true}
                                    //                                 allowNegative={false}
                                    //                                 displayType="input"
                                    //                                 value={watch(scfKey) || ''}
                                    //                                 isAllowed={(values) => {
                                    //                                     let float: number = 0

                                    //                                     try {
                                    //                                         const { value } = values;
                                    //                                         float = parseFloat(value)
                                    //                                         if(isNaN(float)){
                                    //                                             float = 0
                                    //                                         }
                                    //                                     } catch (error) {
                                    //                                         float = 0
                                    //                                     }
                                    //                                     return float <= maxMmscfd;
                                    //                                 }}
                                    //                                 onValueChange={(values) => {
                                    //                                     let float: number | undefined = undefined

                                    //                                     try {
                                    //                                         const { value } = values;
                                    //                                         float = parseFloat(value)
                                    //                                         if(isNaN(float)){
                                    //                                             float = undefined
                                    //                                         }
                                    //                                     } catch (error) {
                                    //                                         float = undefined
                                    //                                     }
                                    //                                     if(float){
                                    //                                         if(maxMmscfd && float > maxMmscfd){
                                    //                                             float = maxMmscfd
                                    //                                         }
                                    //                                         clearErrors(scfKey);
                                    //                                     }
                                    //                                     if(!watch(btuKey)){
                                    //                                         setError(btuKey, { type: "alert", message: 'Password must be at least 10 characters' });
                                    //                                     }
                                    //                                     setValue(scfKey, float, { shouldValidate: true });
                                    //                                     callBack(subRow, 'mmscfd', float)
                                    //                                 }}
                                    //                             />
                                    //                         </td>
                                    //                     )}

                                    //                     {columnVisibility.release_mmbtud && (
                                    //                         <td className="px-2 py-1 text-[#464255]">
                                    //                             <NumericFormat
                                    //                                 id={btuKey}
                                    //                                 placeholder=""
                                    //                                 // value={watch("before_gas_day")}
                                    //                                 // readOnly={false}
                                    //                                 // v2.0.29 ต้องไม่ให้ใส่ข้อมูล release ของเดือนที่ผ่านมาแล้วกับเดือนปัจจุบันได้ ให้ disable ช่องไว้เลย ตอนทดสอบยังให้ใส่ได้ แต่ submit ไม่ได้ และขึ้น error mesg ผิด https://app.clickup.com/t/86etjye00 
                                    //                                 readOnly={isInPastOrCurrentMonth(subRow?.temp_start_date, subRow?.temp_end_date)}

                                    //                                 {...register(btuKey, {
                                    //                                     required: true,
                                    //                                     valueAsNumber: true,
                                    //                                     validate: (value: any) => value >= 0 || "Value must be non-negative",
                                    //                                 })}
                                    //                                 className={`${inputClass} ${ errors[btuKey] && 'border-red-500'}`}
                                    //                                 thousandSeparator={true}
                                    //                                 decimalScale={3}
                                    //                                 fixedDecimalScale={true}
                                    //                                 allowNegative={false}
                                    //                                 displayType="input"
                                    //                                 value={watch(btuKey) || ''}
                                    //                                 isAllowed={(values) => {
                                    //                                     let float: number = 0

                                    //                                     try {
                                    //                                         const { value } = values;
                                    //                                         float = parseFloat(value)
                                    //                                         if(isNaN(float)){
                                    //                                             float = 0
                                    //                                         }
                                    //                                     } catch (error) {
                                    //                                         float = 0
                                    //                                     }
                                    //                                     return float <= maxMmbtud;
                                    //                                 }}
                                    //                                 onValueChange={(values) => {
                                    //                                     let float: number | undefined = undefined

                                    //                                     try {
                                    //                                         const { value } = values;
                                    //                                         float = parseFloat(value)
                                    //                                         if(isNaN(float)){
                                    //                                             float = undefined
                                    //                                         }
                                    //                                     } catch (error) {
                                    //                                         float = undefined
                                    //                                     }
                                                                        
                                    //                                     if(float){
                                    //                                         if(maxMmbtud && float > maxMmbtud){
                                    //                                             float = maxMmbtud
                                    //                                         }
                                    //                                         clearErrors(btuKey);
                                    //                                     }
                                    //                                     if(subRow?.total_contracted_mmscfd && !watch(scfKey)){
                                    //                                         setError(scfKey, { type: "alert", message: 'Password must be at least 10 characters' });
                                    //                                     }
                                    //                                     setValue(btuKey, float, { shouldValidate: true });
                                    //                                     callBack(subRow, 'mmbtud', float)
                                    //                                 }}
                                    //                             />
                                    //                         </td>
                                    //                     )}
                                    //                 </tr>
                                    //     }) || (<></>)
                                        
                                    //     return (<React.Fragment key={`line_${index}`}>
                                    //         {/* ENTRY & EXIT */}
                                    //         {subRow}
    
                                    //         {/* TOTAL */}
    
                                    //         <tr
                                    //             key={row?.id}
                                    //             className={`${table_row_style}`}
                                    //         >
                                    //             <td className="px-2 py-1 font-semibold text-[#464255] bg-[#00ADEF47]" colSpan={7}>{`Total`}</td>
                                    //             <td className={`px-2 py-1 font-semibold text-[#464255] bg-[#00ADEF47] text-right ${total && total.toFixed(3) !== "0.000" ? 'text-[#ED1B24]' : ''}`}>
                                    //                 {total ? Math.abs(total).toFixed(3) : "0.000"}
                                    //             </td>
    
                                    //         </tr>
                                    //     </React.Fragment>
                                    //     )
                                    // })
                                    // #endregion หาทุก exit ในทุก entry
                                    //#region ของเดิม
                                    sortedData?.length > 0 && sortedData.map((row: any, index: any) => {
                                        let firstRow: any
                                        let total: number | undefined
                                        try {
                                            firstRow = row[0]
                                        } catch (error) {
                                            firstRow = undefined
                                        }
                                        if(firstRow){
                                            const entryName = firstRow?.pathMatch?.entry?.name
                                            const exitName = firstRow?.pathMatch?.exit?.name
                                            const totalReleaseEntry = watch(`entry_release_mmbtud_${entryName}_${exitName}_${firstRow?.temp_date}`)
                                            const totalReleaseExit = watch(`exit_release_mmbtud_${entryName}_${exitName}_${firstRow?.temp_date}`)
                                            total = (totalReleaseEntry && totalReleaseExit) ? Math.abs(totalReleaseEntry - totalReleaseExit) : totalReleaseEntry ? totalReleaseEntry : totalReleaseExit ? totalReleaseExit : undefined;
                                        }
                                        
                                        const subRow = row?.map((subRow: any, subRowIndex: any) => {
                                            const name = (subRow?.entry_exit?.name?.toLowerCase()) || (subRowIndex == 0 ? 'entry' : 'exit')
                                            const entryName = subRow?.pathMatch?.entry?.name
                                            const exitName = subRow?.pathMatch?.exit?.name

                                            // subRow?.temp_start_date = 01/01/2026
                                            // subRow?.temp_end_date = 31/01/2026
                                            //  readOnly={subRow?.total_contracted_mmscfd ? false : true} เพิ่มเงื่อนไข ถ้า subRow?.temp_start_date กับ subRow?.temp_end_date เป็นช่วงเดือนที่ผ่านมาหรือเดือนปัจจุบัน ให้ readOnly = true
                                            
                                            let maxMmbtud: number = 0
                                            let maxMmscfd: number = 0

                                            try {
                                                maxMmbtud = parseFloat(subRow?.total_contracted_mmbtu_d || -1)
                                                if(isNaN(maxMmbtud)){
                                                    maxMmbtud = 0
                                                }
                                            } catch (error) {
                                                maxMmbtud = 0
                                            }

                                            try {
                                                maxMmscfd = parseFloat(subRow?.total_contracted_mmscfd || -1)
                                                if(isNaN(maxMmscfd)){
                                                    maxMmscfd = 0
                                                }
                                            } catch (error) {
                                                maxMmscfd = 0
                                            }
                                            
                                            return <tr
                                                        key={`${index}.${subRowIndex}`}
                                                        className={`${table_row_style}`}
                                                    >
                                                        {columnVisibility.contract_point && (
                                                            <td className="px-2 py-1 text-[#464255]">{subRow?.temp_contract_point || ''}</td>
                                                        )}

                                                        {columnVisibility.entry_exit && (
                                                            <td className="px-2 py-1  justify-center ">{subRow?.entry_exit && <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: subRow?.entry_exit?.color }}>{`${subRow?.entry_exit?.name}`}</div>}</td>
                                                        )}

                                                        {columnVisibility.start_date && (
                                                            <td className={`px-2 py-1 ${subRow?.temp_start_date? "text-[#464255]" : "text-[#9CA3AF]"}`}>{subRow?.temp_start_date || ''}</td>
                                                        )}

                                                        {columnVisibility.end_date && (
                                                            <td className={`px-2 py-1 ${subRow?.temp_end_date? "text-[#0DA2A2]" : "text-[#9CA3AF]"}`}>{subRow?.temp_end_date ? formatDateNoTime(addDays(parse(subRow?.temp_end_date , 'dd/MM/yyyy', new Date()), subRow?.is_terminate != true ? 1 : 0).toISOString()) : ''}</td>
                                                        )}

                                                        {columnVisibility.contracted_mmbtu_d && (
                                                            <td className="px-2 py-1 text-[#464255] text-right">{subRow?.total_contracted_mmbtu_d && formatNumberThreeDecimal(subRow?.total_contracted_mmbtu_d)}</td>
                                                        )}

                                                        {columnVisibility.contracted_mmscfd && (
                                                            <td className="px-2 py-1 text-[#464255] text-right">{subRow?.total_contracted_mmscfd && formatNumberThreeDecimal(subRow?.total_contracted_mmscfd)}</td>
                                                        )}


                                                        {columnVisibility.release_mmscfd && (
                                                            <td className="px-2 py-1 text-[#464255]">
                                                                <NumericFormat
                                                                    id={`${name}_release_mmscfd_${entryName}_${exitName}_${subRow?.temp_date}`}
                                                                    placeholder=""
                                                                    // readOnly={subRow?.total_contracted_mmscfd ? false : true}
                                                                    // disabled={subRow?.total_contracted_mmscfd ? false : true}

                                                                    // v2.0.29 ต้องไม่ให้ใส่ข้อมูล release ของเดือนที่ผ่านมาแล้วกับเดือนปัจจุบันได้ ให้ disable ช่องไว้เลย ตอนทดสอบยังให้ใส่ได้ แต่ submit ไม่ได้ และขึ้น error mesg ผิด https://app.clickup.com/t/86etjye00 
                                                                    readOnly={
                                                                        !subRow?.total_contracted_mmscfd ||
                                                                        isInPastOrCurrentMonth(subRow?.temp_start_date, subRow?.temp_end_date)
                                                                    }
                                                                    disabled={subRow?.total_contracted_mmscfd ? false : true}
                                                                    className={`${inputClass} ${ errors[`${name}_release_mmscfd_${entryName}_${exitName}_${subRow?.temp_date}`] && 'border-red-500'} ${subRow?.total_contracted_mmscfd ? '' : '!bg-[#EFECEC] cursor-not-allowed hover:!bg-[#EFECEC]'}`}
                                                                    {...register(`${name}_release_mmscfd_${entryName}_${exitName}_${subRow?.temp_date}`, {
                                                                        required: true,
                                                                        valueAsNumber: true,
                                                                        validate: (value: any) => value >= 0 || "Value must be non-negative",
                                                                        // setValueAs: (v) => v === "" ? undefined : Number(v), // แปลงค่าว่างเป็น undefined
                                                                    })}
                                                                    thousandSeparator={true}
                                                                    decimalScale={3}
                                                                    fixedDecimalScale={true}
                                                                    allowNegative={false}
                                                                    displayType="input"
                                                                    value={watch(`${name}_release_mmscfd_${entryName}_${exitName}_${subRow?.temp_date}`) || ''}
                                                                    isAllowed={(values) => {
                                                                        let float: number = 0
                                                                        try {
                                                                            const { value } = values;
                                                                            float = parseFloat(value)
                                                                            if(isNaN(float)){
                                                                                float = 0
                                                                            }
                                                                        } catch (error) {
                                                                            float = 0
                                                                        }
                                                                        // return float < maxMmscfd; // เดิมโรงงาน มันบังคับในน้อยกว่า column contracted (MMSCFD)
                                                                        return float <= maxMmscfd;
                                                                    }}
                                                                    onValueChange={(values) => {
                                                                        let float: number | undefined = undefined

                                                                        try {
                                                                            const { value } = values;
                                                                            float = parseFloat(value)
                                                                            if(isNaN(float)){
                                                                                float = undefined
                                                                            }
                                                                        } catch (error) {
                                                                            float = undefined
                                                                        }
                                                                        if(float){
                                                                            if(maxMmscfd && float > maxMmscfd){
                                                                                float = maxMmscfd
                                                                            }
                                                                            clearErrors(`${name}_release_mmscfd_${entryName}_${exitName}_${subRow?.temp_date}`);
                                                                        }
                                                                        if(!watch(`${name}_release_mmbtud_${entryName}_${exitName}_${subRow?.temp_date}`)){
                                                                            setError(`${name}_release_mmbtud_${entryName}_${exitName}_${subRow?.temp_date}`, { type: "alert", message: 'Password must be at least 10 characters' });
                                                                        }
                                                                        setValue(`${name}_release_mmscfd_${entryName}_${exitName}_${subRow?.temp_date}`, float, { shouldValidate: true });
                                                                        callBack(subRow?.temp_contract_point, subRow.pathMatch, subRow.temp_date, 'mmscfd', float)
                                                                    }}
                                                                />
                                                            </td>
                                                        )}

                                                        {columnVisibility.release_mmbtud && (
                                                            <td className="px-2 py-1 text-[#464255]">
                                                                <NumericFormat
                                                                    id={`${name}_release_mmbtud_${entryName}_${exitName}_${subRow?.temp_date}`}
                                                                    placeholder=""
                                                                    // value={watch("before_gas_day")}
                                                                    // readOnly={false}
                                                                    // v2.0.29 ต้องไม่ให้ใส่ข้อมูล release ของเดือนที่ผ่านมาแล้วกับเดือนปัจจุบันได้ ให้ disable ช่องไว้เลย ตอนทดสอบยังให้ใส่ได้ แต่ submit ไม่ได้ และขึ้น error mesg ผิด https://app.clickup.com/t/86etjye00 
                                                                    readOnly={isInPastOrCurrentMonth(subRow?.temp_start_date, subRow?.temp_end_date)}

                                                                    {...register(`${name}_release_mmbtud_${entryName}_${exitName}_${subRow?.temp_date}`, {
                                                                        required: true,
                                                                        valueAsNumber: true,
                                                                        validate: (value: any) => value >= 0 || "Value must be non-negative",
                                                                    })}
                                                                    className={`${inputClass} ${ errors[`${name}_release_mmbtud_${entryName}_${exitName}_${subRow?.temp_date}`] && 'border-red-500'}`}
                                                                    thousandSeparator={true}
                                                                    decimalScale={3}
                                                                    fixedDecimalScale={true}
                                                                    allowNegative={false}
                                                                    displayType="input"
                                                                    value={watch(`${name}_release_mmbtud_${entryName}_${exitName}_${subRow?.temp_date}`) || ''}
                                                                    isAllowed={(values) => {
                                                                        let float: number = 0

                                                                        try {
                                                                            const { value } = values;
                                                                            float = parseFloat(value)
                                                                            if(isNaN(float)){
                                                                                float = 0
                                                                            }
                                                                        } catch (error) {
                                                                            float = 0
                                                                        }
                                                                        // return float < maxMmbtud; // เดิมโรงงาน มันบังคับในน้อยกว่า column contracted (MMSCFD)
                                                                        return float <= maxMmbtud;
                                                                    }}
                                                                    onValueChange={(values) => {
                                                                        let float: number | undefined = undefined

                                                                        try {
                                                                            const { value } = values;
                                                                            float = parseFloat(value)
                                                                            if(isNaN(float)){
                                                                                float = undefined
                                                                            }
                                                                        } catch (error) {
                                                                            float = undefined
                                                                        }
                                                                        
                                                                        if(float){
                                                                            if(maxMmbtud && float > maxMmbtud){
                                                                                float = maxMmbtud
                                                                            }
                                                                            clearErrors(`${name}_release_mmbtud_${entryName}_${exitName}_${subRow?.temp_date}`);
                                                                        }
                                                                        if(subRow?.total_contracted_mmscfd && !watch(`${name}_release_mmscfd_${entryName}_${exitName}_${subRow?.temp_date}`)){
                                                                            setError(`${name}_release_mmscfd_${entryName}_${exitName}_${subRow?.temp_date}`, { type: "alert", message: 'Password must be at least 10 characters' });
                                                                        }
                                                                        setValue(`${name}_release_mmbtud_${entryName}_${exitName}_${subRow?.temp_date}`, float, { shouldValidate: true });
                                                                        callBack(subRow?.temp_contract_point, subRow.pathMatch, subRow.temp_date, 'mmbtud', float)
                                                                    }}
                                                                />
                                                            </td>
                                                        )}
                                                    </tr>
                                        }) || (<></>)
                                        
                                        return (<React.Fragment key={`line_${index}`}>
                                            {/* ENTRY & EXIT */}
                                            {subRow}
    
                                            {/* TOTAL */}
    
                                            <tr
                                                key={row?.id}
                                                className={`${table_row_style}`}
                                            >
                                                <td className="px-2 py-1 font-semibold text-[#464255] bg-[#00ADEF47]" colSpan={7}>{`Total`}</td>
                                                <td className={`px-2 py-1 font-semibold text-[#464255] bg-[#00ADEF47] text-right ${total && total.toFixed(3) !== "0.000" ? 'text-[#ED1B24]' : ''}`}>
                                                    {/* {total ? total.toFixed(3) : "0.000"} */}
                                                    {total ? formatNumberThreeDecimal(total) : "0.000"}
                                                </td>
    
                                            </tr>
                                        </React.Fragment>
                                        )
                                    })
                                    //#endregion ของเดิม
                                }
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

export default TableReleaseCapSubEachMonth;


