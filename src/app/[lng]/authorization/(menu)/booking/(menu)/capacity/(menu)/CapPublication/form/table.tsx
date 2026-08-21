import { useEffect } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import { formatDateYearMonthDay, formatNumberThreeDecimal, getContrastTextColor } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort, handleSortYear } from "@/utils/sortTable";
import { format, parse } from 'date-fns';
import dayjs from "dayjs";
interface TableProps {
    openEditForm: (id: any) => void;
    openViewForm: (id: any) => void;
    openHistoryForm: (id: any) => void;
    handlePathDetail: any;
    handleContractClick?: any;
    openSubmissionModal: (id?: any, data?: any) => void;
    openAllFileModal: (id?: any, data?: any) => void;
    tableData: any;
    tableDataDetail?: any;
    isLoading: any;
    columnVisibility?: any;
    tabIndex?: any;
    srchStartDate?: any;
    srchEndDate?: any;
    next10Years?: any;
    next12Months?: any;
    dayInMonth?: any;
    sortedData?: any;
    setSortedData?: any;
}

const TableCapPublic: React.FC<TableProps> = ({ openEditForm, openViewForm, handlePathDetail, handleContractClick, openHistoryForm, openSubmissionModal, openAllFileModal, tableData, isLoading, columnVisibility, tabIndex, tableDataDetail, srchStartDate, next10Years, next12Months, dayInMonth, sortedData, setSortedData }) => {

    const [sortState, setSortState] = useState({ column: null, direction: null });
    // const [sortedData, setSortedData] = useState<any>([]);

    useEffect(() => {
        if (tableData && tableData.length > 0) {
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

    useEffect(() => {
        next10Years = next10Years?.filter((year: any) => columnVisibility[year]);
        next12Months = next12Months?.filter((month: any) => columnVisibility[month]);
    }, [columnVisibility])

    return (
        // <div className={`h-[calc(100vh-380px)] overflow-y-auto block rounded-t-md relative z-1`}>
        <div className={`h-[calc(100vh-440px)] overflow-x-auto overflow-y-auto block rounded-t-md relative z-10`} >
            {
                isLoading ?
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            {/* First Row */}
                            <tr className="h-9">
                                {columnVisibility.zone && (
                                    <th
                                        scope="col"
                                        rowSpan={2}
                                        className={`${table_sort_header_style} text-center max-w-[200px]`}
                                        onClick={() =>
                                            handleSort("zone.name", sortState, setSortState, setSortedData, tableData)
                                        }
                                    >
                                        {`Zone`}
                                        {getArrowIcon("zone.name")}
                                    </th>
                                )}

                                {columnVisibility.area && (
                                    <th
                                        scope="col"
                                        rowSpan={2}
                                        className={`${table_sort_header_style} text-center min-w-[100px] max-w-[250px]`}
                                        onClick={() =>
                                            handleSort("name", sortState, setSortState, setSortedData, tableData)
                                        }
                                    >
                                        {`Area`}
                                        {getArrowIcon("name")}
                                    </th>
                                )}

                                {/* {columnVisibility.avaliable_capacity_mmbtu_d && ( */}
                                    <th
                                        scope="col"
                                        colSpan={tabIndex === 0 ? 10 : tabIndex === 1 ? 12 : dayInMonth.length}
                                        className={`${table_header_style} text-center`}
                                    >
                                        {`Available Capacity (MMBTU/D)`}
                                    </th>
                                {/* )} */}

                            </tr>

                            {/* Second Row */}
                            {tabIndex === 0 && (
                                <tr
                                    className="h-13 w-full grid "
                                    style={{
                                        gridTemplateColumns: `repeat(${next10Years.length}, minmax(150px, 1fr))`,
                                    }}
                                >
                                    {next10Years.map((year: any, index: any) => (
                                        columnVisibility[year] && (
                                            <th
                                                key={index}
                                                scope="col"
                                                className={`${table_sort_header_style} min-w-[100px]  flex items-center justify-center text-center h-[50px] !bg-[#00ADEF]`}
                                                onClick={() => {
                                                    handleSortYear(`${year}`, sortState, setSortState, setSortedData, tableData, 'year_data');
                                                }}
                                            >
                                                {year}
                                                {getArrowIcon(`${year}`)}
                                            </th>
                                        )
                                    ))}
                                </tr>
                            )}

                            {tabIndex === 1 && (
                                <tr
                                    className="h-13 w-full grid "
                                    style={{
                                        gridTemplateColumns: `repeat(${next12Months.length}, minmax(150px, 1fr))`,
                                    }}
                                >
                                    {next12Months.map((month: any, index: any) => {
                                        const parsedDate = parse(month, 'MMM yyyy', new Date());
                                        const formattedMonth = format(parsedDate, 'yyyy-MM');

                                        // เพราะข้อมูลใน month_data มันเยื้องไป 1 เดือนข้างหลังจากวันที่กด filter start_month, end_month
                                        // สมมติ กด  JAN 2025 - FEB 2025
                                        // ข้อมูลมันมา DEV 2024 - JAN 2025
                                        // เลยต้อง format ย้อนไปเดือนนึง เพื่อให้คีย์มันตรงแล้วกด sort ได้
                                        const prevMonthKey = dayjs(formattedMonth, "YYYY-MM").subtract(1, "month").format("YYYY-MM");

                                        return (
                                            columnVisibility[month] && (
                                                <th
                                                    key={index}
                                                    scope="col"
                                                    className={`${table_sort_header_style} flex items-center justify-center text-center h-[50px] !bg-[#00ADEF]`}
                                                    onClick={() => {
                                                        // handleSortYear(`${formattedMonth}`, sortState, setSortState, setSortedData, tableData, 'month_data');
                                                        handleSortYear(`${prevMonthKey}`, sortState, setSortState, setSortedData, tableData, 'month_data');
                                                    }}
                                                >
                                                    {month}
                                                    {getArrowIcon(`${prevMonthKey}`)}
                                                </th>
                                            )
                                        )
                                    })}
                                </tr>
                            )}

                            {tabIndex === 2 && (
                                <tr
                                    className="h-13 w-full grid"
                                    style={{
                                        gridTemplateColumns: `repeat(${dayInMonth.length}, minmax(150px, 1fr))`,
                                    }}
                                >
                                    {dayInMonth.map((date: any, index: any) => {

                                        let date_format = formatDateYearMonthDay(date)

                                        return (
                                            columnVisibility[date] && (
                                                <th
                                                    key={index}
                                                    scope="col"
                                                    className={`${table_sort_header_style} flex items-center justify-center text-center h-[50px] !bg-[#00ADEF]`}
                                                    onClick={() => {
                                                        // handleSortYear(`${date}`, sortState, setSortState, setSortedData, tableData, 'day_data');
                                                        handleSortYear(date_format, sortState, setSortState, setSortedData, tableData, 'day_data');
                                                    }}
                                                >
                                                    {date}
                                                    {/* {getArrowIcon(date)} */}
                                                    {getArrowIcon(date_format)}
                                                </th>
                                            )
                                        )
                                    }

                                    )}
                                </tr>
                            )}
                        </thead>

                        <tbody>
                            {sortedData && sortedData?.map((row: any, index: any) => {

                                return (
                                    <tr
                                        key={row?.id}
                                        className={`${table_row_style}`}
                                    >
                                        {columnVisibility.zone && (
                                            <td className="px-2 py-1 h-[30px] text-center align-middle max-w-[200px]">
                                                {row?.zone && (
                                                    <div
                                                        className="rounded-full p-1 text-[#464255] text-center"
                                                        style={{
                                                            backgroundColor: row?.zone?.color,
                                                            minWidth: '140px',
                                                            maxWidth: 'max-content',
                                                            wordWrap: 'break-word',
                                                            whiteSpace: 'normal',
                                                            display: 'inline-block',  // Makes the div inline for centering
                                                            verticalAlign: 'middle',  // Aligns div vertically to the center
                                                        }}

                                                    >
                                                        {`${row?.zone?.name}`}
                                                    </div>
                                                )}
                                            </td>
                                        )}

                                        {columnVisibility.area && (
                                            <td className="px-2 py-1 text-center align-middle max-w-[200px]">
                                                {
                                                    row?.entry_exit_id == 2 ?
                                                        <div
                                                            className="rounded-full p-1 text-[#464255] text-center"
                                                            style={{
                                                                backgroundColor: row?.color,
                                                                color: getContrastTextColor(row?.color),
                                                                width: '40px',
                                                                height: '40px',
                                                                display: 'inline-flex',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                verticalAlign: 'middle'
                                                            }}
                                                        >
                                                            {`${row?.name}`}
                                                        </div>
                                                        :
                                                        <div
                                                            className="rounded-lg p-1 text-[#464255] text-center"
                                                            style={{
                                                                backgroundColor: row?.color,
                                                                color: getContrastTextColor(row?.color),
                                                                width: '40px',
                                                                height: '40px',
                                                                display: 'inline-flex',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                verticalAlign: 'middle'
                                                            }}
                                                        >
                                                            {`${row?.name}`}
                                                        </div>
                                                }
                                            </td>
                                        )}

                                        {
                                            tabIndex == 0 ? // 0 == year
                                                <tr
                                                    className="h-13 w-full grid grid-cols-[auto]"
                                                >
                                                    {next10Years.map((year: any, index: any) => {
                                                        const yearDataItem = row?.year_data && row?.year_data.find((item: any) => Object.keys(item)[0] === year.toString());
                                                        const capacity: any = yearDataItem ? Object.values(yearDataItem)[0] : 0; // Set to 0 if no data

                                                        return (
                                                            columnVisibility[year] && (
                                                                <td
                                                                    key={index}
                                                                    className="px-2 py-1 text-[#464255] text-right min-w-[100px] "
                                                                    style={{ gridColumn: `${index + 1}` }} // Ensure each column aligns with the header grid
                                                                >
                                                                    {/* {capacity?.area_nominal_capacity ? formatNumberThreeDecimal(capacity?.area_nominal_capacity) : formatNumberThreeDecimal(row?.area_nominal_capacity)} */}
                                                                    {capacity?.area_nominal_capacity !== null && capacity?.area_nominal_capacity !== undefined ? formatNumberThreeDecimal(capacity?.area_nominal_capacity) : null}
                                                                </td>
                                                            )
                                                        );
                                                    })}
                                                </tr>
                                                : tabIndex == 1 ?
                                                    <tr
                                                        className="h-13 w-full grid "
                                                        style={{
                                                            gridTemplateColumns: `repeat(${next12Months.length}, minmax(0, 1fr))`, // Dynamically set grid columns
                                                        }}
                                                    >
                                                        {next12Months?.map((month: any, index: any) => {
                                                            const [monthName, year] = month.split(" ");
                                                            const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth() + 1;
                                                            const monthKey = `${year}-${monthIndex.toString().padStart(2, '0')}`;

                                                            // ข้อมูลใน month_data key มันย้อนไปจากวันที่เสิช 1 เดือน
                                                            // const prevMonthKey = dayjs(monthKey, "YYYY-MM").subtract(1, "month").format("YYYY-MM");
                                                            const prevMonthKey = dayjs(monthKey, "YYYY-MM").format("YYYY-MM");

                                                            // const yearDataItem = row?.month_data && row?.month_data.find((item: any) => Object.keys(item)[0] === monthKey);
                                                            const yearDataItem = row?.month_data && row?.month_data.find((item: any) => Object.keys(item)[0] === prevMonthKey);

                                                            const capacity: any = yearDataItem ? Object.values(yearDataItem)[0] : 0;

                                                            return (
                                                                columnVisibility[month] && (
                                                                    <td
                                                                        key={index}
                                                                        className="px-2 py-1 text-[#464255] text-right w-full"
                                                                        style={{ gridColumn: `${index + 1}` }} // Ensure each column aligns with the header grid
                                                                    >
                                                                        {/* month_data */}
                                                                        {/* {capacity?.area_nominal_capacity ? formatNumberThreeDecimal(capacity?.area_nominal_capacity) : formatNumberThreeDecimal(row?.area_nominal_capacity)} */}
                                                                        {/* {capacity?.area_nominal_capacity ? formatNumberThreeDecimal(capacity?.area_nominal_capacity) : row?.area_nominal_capacity ? formatNumberThreeDecimal(row?.area_nominal_capacity) : null} */}
                                                                        {/* {capacity?.area_nominal_capacity !== null && capacity?.area_nominal_capacity !== undefined ? formatNumberThreeDecimal(capacity?.area_nominal_capacity) : row?.area_nominal_capacity !== null && row?.area_nominal_capacity !== undefined ? formatNumberThreeDecimal(row?.area_nominal_capacity) : null} */}
                                                                        {capacity?.area_nominal_capacity !== null && capacity?.area_nominal_capacity !== undefined ? formatNumberThreeDecimal(capacity?.area_nominal_capacity) : null}
                                                                    </td>
                                                                )
                                                            );
                                                        })}
                                                    </tr>
                                                    : tabIndex == 2 ? <>
                                                        <tr
                                                            className="h-13 w-full grid "
                                                            style={{
                                                                gridTemplateColumns: `repeat(${dayInMonth.length}, minmax(150px, 1fr))`,
                                                            }}
                                                        >
                                                            {dayInMonth.map((day: any, index: any) => {
                                                                const formattedDay = day.split('/').reverse().join('-');
                                                                const dayDataItem = row?.day_data && row?.day_data.find((item: any) => Object.keys(item)[0] === formattedDay);
                                                                // const capacity = dayDataItem?.[formattedDay]?.area_nominal_capacity || row?.area_nominal_capacity || 0;
                                                                // const capacity = dayDataItem?.[formattedDay]?.area_nominal_capacity || null;
                                                                const capacity = dayDataItem?.[formattedDay]?.area_nominal_capacity;
                                                                return (
                                                                    columnVisibility[day] && (
                                                                        <td
                                                                            key={index}
                                                                            className="px-2 py-1 text-[#464255] text-right flex items-center justify-end"
                                                                        >
                                                                            {capacity !== null && capacity !== undefined ? formatNumberThreeDecimal(capacity) : ''}
                                                                        </td>
                                                                    )
                                                                );
                                                            })}
                                                        </tr>
                                                    </>
                                                        : tabIndex == 3 && <>
                                                            <tr className="h-13 w-full grid ">
                                                            </tr>
                                                        </>
                                        }
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

export default TableCapPublic;