import { useFetchMasters } from '@/hook/fetchMaster';
import { formatDateToDayMonthYear, formatDateToMonthYear, formatNumberThreeDecimal, generateDailyRange, generateMonthlyRange, generateMonthlyRangeNotfix, sortByMonthYear, sumByZone, sumValuesByKey } from '@/utils/generalFormatter';
import { table_col_arrow_sort_style, table_header_style, table_sort_header_style } from '@/utils/styles';
import React, { useEffect, useRef, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import DatePickaForm from '../library/dateRang/dateSelectForm';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import minMax from 'dayjs/plugin/minMax';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useAppDispatch } from '@/utils/store/store';
import { fetchContractPoint } from '@/utils/store/slices/contractPointSlice';

dayjs.extend(customParseFormat);
dayjs.extend(minMax);

interface HeaderEntry {
    key?: string; // Optional key property
    Max?: {
        key: string; // Key for Max
    };
    Min?: {
        key: string; // Key for Min
    };
    [date: string]: { key: string } | string | undefined; // For date-based values
}

interface ValueEntry {
    key: string;
}

const generateHeaders = (data: { [key: string]: HeaderEntry }, prefix = '') => {
    const headers: any[] = [];

    for (const [label, value] of Object.entries(data)) {
        // Check if the current value is an object
        if (typeof value === 'object' && value !== null) {
            const subHeaders = [];
            // Handle Max and Min keys if they exist
            if ('Max' in value) {
                const maxValue = value.Max as { key: string };
                subHeaders.push({ label: 'Max', key: `${prefix}${label}.Max`, value: maxValue.key });
            }
            if ('Min' in value) {
                const minValue = value.Min as { key: string };
                subHeaders.push({ label: 'Min', key: `${prefix}${label}.Min`, value: minValue.key });
            }

            // Handle date-based sub-columns
            const dates = Object.keys(value).filter(key => key !== 'key' && key !== 'Max' && key !== 'Min');

            const dateKeyValuePairs = Object.entries(value)
                .filter(([key]) => key !== 'key' && key !== 'Max' && key !== 'Min') // Filter out unwanted keys
                .map(([key, entry]) => {
                    // Check if the entry is of type ValueEntry
                    const valueKey = (entry as ValueEntry).key;
                    return { date: key, value: valueKey };
                }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date

            if (dates?.length > 0) {
                let dates2 = []
                for (let index = 0; index < dateKeyValuePairs.length; index++) {
                    dates2.push({ label: dateKeyValuePairs[index]?.date, key: dateKeyValuePairs[index]?.value, value: dateKeyValuePairs[index]?.date });
                }

                headers.push({
                    label,
                    key: value.key || `${prefix}${label}`,
                    subHeaders,
                    dates,
                    dates2,
                });
            } else {
                headers.push({ label, key: value.key || `${prefix}${label}`, subHeaders });
            }
        } else {
            // If it's a simple value, just add it
            headers.push({ label, key: `${prefix}${label}` });
        }
    }
    return headers.sort((a, b) => parseInt(a.key) - parseInt(b.key));

    // return headers;
};

const sortDatesAsc = (dates: string[]): string[] => {
    return dates.sort((a: string, b: string) => new Date(a).getTime() - new Date(b).getTime());
};

const FatherTable: React.FC<any> = ({
    columnVisibility,
    setcolumnVisibility,
    initialColumnsDynamic,
    setinitialColumnsDynamic,
    dataTable,
    mode,
    isEditing,
    modeEditing,
    isSaved,
    setIsDateChange,
    originOrSum,
    dataContractTermType,
    srchStartdate = null,
    srchEnddate = null
}) => {
    const inputClass = "text-[14px] block md:w-full p-2 h-[37px] !w-[110px] border-[1px] bg-white border-[#464255] outline-none bg-opacity-100 focus:border-[#00ADEF]"

    // ############### REDUX DATA ###############
    const { contractPointData } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (forceRefetch) {
            dispatch(fetchContractPoint());
        }
        if (forceRefetch) {
            setForceRefetch(false);
        }
    }, [dispatch, contractPointData, forceRefetch]);


    const generateColumnVisibility = (columns: any) => Object.fromEntries(columns.map(({ key, visible }: any) => [key, visible]));

    const renderDateColumnMenu = async (key: any, label: any, parent?: any) => {
        let newData: any = initialColumnsDynamic;
        if (parent) {
            let findObject: any = newData?.find((item: any) => item?.label == parent);
            let findIDX: any = newData?.findIndex((item: any) => item?.label == parent) + 1;
            if (findObject) {
                newData.splice(findIDX, 0,
                    {
                        key: findObject?.key + "_" + key,
                        label: label,
                        visible: true,
                        parent_id: findObject?.key
                    }
                )
            }

        } else {
            newData.push(
                {
                    key: key,
                    label: label,
                    visible: true,
                }
            )
        }

        // Update visibility and initial columns in parallel to avoid blocking
        const columnVisibilityMerge = generateColumnVisibility(newData);

        setcolumnVisibility(columnVisibilityMerge);
        setinitialColumnsDynamic(newData);
    }


    let data_table_val = null;
    try {
        let jsonString: any
        if (originOrSum == "ORIGINAL") {
            jsonString = dataTable?.booking_full_json[0]?.data_temp;
        } else if (originOrSum == "SUMMARY") {
            jsonString = dataTable?.booking_full_json_release[0]?.data_temp ? dataTable?.booking_full_json_release[0]?.data_temp : dataTable?.booking_full_json[0]?.data_temp;
        }
        if (jsonString) {
            data_table_val = JSON.parse(jsonString);
        } else {
            // data_temp is undefined or empty.
            return <div className="flex flex-col justify-center items-center w-[100%] pt-4">
                <img className="w-[40px] h-auto mb-2" src="/assets/image/no_data_icon.svg" alt="No data icon" />
                <div className="text-[16px] text-[#9CA3AF]">
                    No data.
                </div>
            </div>
        }
    } catch (error) {
        // Failed to parse JSON
    }

    const [checkedRender, setcheckedRender] = useState<boolean>(true)

    useEffect(() => {
        if (checkedRender == true && data_table_val) {
            processingData(data_table_val);
            setcheckedRender(false);
        }
    }, [checkedRender])

    const processingData = async (data: any) => {
        const changeArr = Object.entries(data_table_val["headerEntry"]).map(([txt, data]: any) => {
            let dataArr: any = Object.entries(data).map(([date, values]: any) => {
                return { key: formatDateToMonthYear(date) }
            })
            return {
                key: txt, // In case the key is directly present, not inside an object
                label: txt,
                data: sortByMonthYear(dataArr)
            };
        });

        let convertDataArr: any = changeArr?.filter((item: any) => item?.key !== 'Entry' && item?.key !== 'Period');

        if (convertDataArr?.length > 0) {
            // Iterate over the array once
            for (let i = 0; i < convertDataArr.length; i++) {
                const dataArr = convertDataArr[i]?.data;

                // Filter and reverse the array once
                const filteredData = dataArr?.filter((item: any) => item?.key !== 'key')?.reverse();

                if (filteredData?.length > 0) {
                    // Iterate over the filtered and reversed array
                    for (let ix = 0; ix < filteredData.length; ix++) {
                        const item = filteredData[ix];
                        const key = item?.key;
                        const parentKey = convertDataArr[i]?.key;

                        // Call the render function
                        renderDateColumnMenu(key, key, parentKey);
                    }
                }
            }
        }
    }

    // ENTRY DATA
    // const { Entry, ...rest } = mockDataExcel.headerEntry;
    const { Entry, ...rest } = data_table_val.headerEntry;
    const res_entry = { ...rest, ...Entry };
    const { key, ["Sub Area"]: subAreaEntry, ...rest_res } = res_entry; // เอา column key ออก
    const headers = generateHeaders(rest_res);

    // EXIT DATA
    const { Exit, ...restExit } = data_table_val.headerExit;
    const res_exit = { ...restExit, ...Exit };
    const { key: keyExit, Type, ["Sub Area"]: subArea, ["Block Valve"]: blockValve, ...rest_res_exit } = res_exit;  // เอา column key, Type, Block Valve, Sub Area ออก
    const headersExit = generateHeaders(rest_res_exit);
    const { entryValue } = data_table_val;
    const { exitValue } = data_table_val;

    useEffect(() => {
      setEntryVal(entryValue)
      setExitVal(exitValue)
    }, [srchStartdate, srchEnddate])

    const [entryVal, setEntryVal] = useState<any>(entryValue);
    const [exitVal, setExitVal] = useState<any>(exitValue);
    const [tomorrowDay, setTomorrowDay] = useState<any>(undefined);

    useEffect(() => {
        if (tomorrowDay == undefined) {
            // Get the current date
            const currentDate = new Date();
            // Add 1 day to the current date
            currentDate.setDate(currentDate.getDate() + 1);
            setTomorrowDay(currentDate)
        }
    }, [tomorrowDay])

    useEffect(() => {
        if (entryValue?.length !== entryVal?.length) {
            setEntryVal(entryValue);
        }
    }, [entryValue, entryVal]);

    useEffect(() => {
        if (exitValue?.length !== exitVal?.length) {
            setExitVal(exitValue);
        }
    }, [exitValue, exitVal]);

    // ############### SUMMARY DATA EXIT ###############
    // const summedExits: any = sumByZone(exitVal, contractPointData);
    const [summedExits, setSummedExits] = useState<any>(sumByZone(exitVal, contractPointData));

    // ############### SUMMARY DATA ENTRY ###############
    // const summedEntries: any = sumByZone(entryVal, contractPointData);
    const [summedEntries, setSummedEntries] = useState<any>(sumByZone(entryVal, contractPointData));

    // ############### SUMMARY ของ SUMMARY อีกทีหนึ่ง ###############
    const summedEntryRef: any = useRef<any>(null);
    const summedExitRef: any = useRef<any>(null);

    useEffect(() => {
        const summedEntryResult = sumValuesByKey(summedEntries);
        const summedExitResult = sumValuesByKey(summedExits);

        summedEntryRef.current = summedEntryResult;
        summedExitRef.current = summedExitResult;
    }, [summedEntries, summedExits, data_table_val]);

    // const summedEntryResult = sumValuesByKey(summedEntries);
    //     const summedExitResult = sumValuesByKey(summedExits);
    //     summedEntryRef.current = summedEntryResult;
    //     summedExitRef.current = summedExitResult;

    function updateHeadersLastFive(headerss: any[], fromDate: string, toDate: string) {
        // Helper to generate monthly range in "DD/MM/YYYY" format

        // const newDates = generateMonthlyRange(fromDate, toDate);
        let newDates: any
        if (dataContractTermType?.id === 4) { // 4 คือ short term non-firm
            // daily
            newDates = generateDailyRange(fromDate, toDate);
        } else {
            // monthly
            newDates = generateMonthlyRangeNotfix(fromDate, toDate);
        }

        let keyCounter = 7; // original 35 ---> new 7 เริ่ม key ที่มี value
        const updatedHeaders = headerss.map((header, index) => {
            // Update only the last 4 objects
            if (index >= headerss.length - 4) {
                const updatedDates2 = newDates.map((date?: any) => ({
                    label: date,
                    // key: keyCounter++,
                    key: String(keyCounter++),
                    value: date,
                }));

                return {
                    ...header,
                    dates: newDates,
                    dates2: updatedDates2,
                    // key: updatedDates2[0]?.key || header.key, // Update key to the first key in dates2
                    key: String(updatedDates2[0]?.key || header.key),
                };
            }

            // Return other objects unchanged
            return header;
        });

        return updatedHeaders;
    }

    function updateHeadersLastTwo(headerss: any[], fromDate: string, toDate: string) {
        let newDates: any;

        // ✅ เพิ่ม: ปรับ toDate ให้ครอบคลุมเดือนสุดท้าย
        const [d, m, y] = toDate.split('/').map(Number);
        const toDateObj = new Date(y, m - 1, d);
        toDateObj.setMonth(toDateObj.getMonth() + 1);
        const extendedToDate = toDateObj.toLocaleDateString('en-GB'); // '22/01/2026' เป็นต้น

        if (dataContractTermType?.id === 4) {
            newDates = generateDailyRange(fromDate, extendedToDate);
        } else {
            newDates = generateMonthlyRange(fromDate, extendedToDate);
        }

        const updatedHeaders = headerss?.map((header, index) => {
            if (index >= headerss.length - 2) {
                const existingKeys = header.dates2?.map((d: any) => d.key) || [];

                const updatedDates2 = newDates.map((date: string, i: number) => ({
                    label: date,
                    key: existingKeys[i] ?? String(100 + i),
                    value: date,
                }));

                return {
                    ...header,
                    dates: newDates,
                    dates2: updatedDates2,
                    key: header.key,
                };
            }

            return header;
        });

        return updatedHeaders;
    }

    const fromDate = mode == 'entry' && srchStartdate ? dayjs(srchStartdate)?.format('DD/MM/YYYY') : entryVal?.[0]?.[5]; // original 33 ---> new 5
    const toDate = mode == 'entry' && srchEnddate ? dayjs(srchEnddate)?.format('DD/MM/YYYY') :entryVal?.[0]?.[6]; // original 34 ---> new 6
    const fromDateExit = mode == 'exit' && srchStartdate ? dayjs(srchStartdate)?.format('DD/MM/YYYY') :exitVal?.[0]?.[5]; // original 33 ---> new 5
    const toDateExit = mode == 'exit' && srchEnddate ? dayjs(srchEnddate)?.format('DD/MM/YYYY') :exitVal?.[0]?.[6]; // original 34 ---> new 6

    const updatedHeaders = updateHeadersLastFive(headers, fromDate, toDate);
    const updatedHeadersExit = updateHeadersLastTwo(headersExit, fromDateExit, toDateExit);

    // ################## SORTING ##################
    const [sortState, setSortState] = useState({ column: null, direction: null });

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    // ################## SHOW/HIDE COL ##################
    const visibilityMap: Record<string, string> = {
        "Capacity Daily Booking (MMBTU/d)": "capacity_daily_booking_mmbtu",
        "Maximum Hour Booking (MMBTU/h)": "maximum_hour_booking_mmbtu",
        "Capacity Daily Booking (MMscfd)": "capacity_daily_booking_mmscfd",
        "Maximum Hour Booking (MMscfh)": "maximum_hour_booking_mmscfd",
        "Period": "period",
        "Temperature Range": "temperature_range",
        "Pressure Range": "pressure_range",
    };

    const functionControlcolSpan = (header: any, mode: 'date' | 'sub_header') => {
        if (mode == 'date') {
            let dataDate: any = header?.dates; //สำหรับเอา data ทั้งหมดของหัวข้อที่ map มา
            let findKey: any = initialColumnsDynamic?.find((item: any) => item?.label == header?.label); //หา parent ที่ถูกต้องของข้อมูล
            let checkDate: any = []; //สำหรับเอา data มาใช้ในการ hide column

            if (dataDate) {
                for (let index = 0; index < dataDate?.length; index++) {
                    let pathKey: any = findKey?.key + "_" + formatDateToMonthYear(dataDate[index]); //กำหนด key ของ menu โดยใช้ parent id ของหัว table + กับวันที่
                    if (findKey?.key == "period") {
                        if (columnVisibility[dataDate[index]] == false) {// กรณีถ้า data เป็น period
                            checkDate.push({
                                key: formatDateToMonthYear(dataDate[index]),
                                active: false,
                                parent: header?.label
                            })
                        } else if (columnVisibility[dataDate[index]] == true) {
                            checkDate.push({
                                key: formatDateToMonthYear(dataDate[index]),
                                active: true,
                                parent: header?.label
                            })
                        }
                    } else {
                        if (columnVisibility[pathKey] == false) {// กรณีถ้า data เป็น date ปกติ
                            checkDate.push({
                                key: formatDateToMonthYear(dataDate[index]),
                                active: false,
                                parent: header?.label
                            })
                        } else if (columnVisibility[pathKey] == true) {
                            checkDate.push({
                                key: formatDateToMonthYear(dataDate[index]),
                                active: true,
                                parent: header?.label
                            })
                        }
                    }
                }
            }

            return checkDate;
        } else if (mode == 'sub_header') {
            let dataSub: any = header?.subHeaders; //สำหรับเอา data ทั้งหมดของหัวข้อที่ map มา
            let checkData: any = []; //สำหรับเอา data มาใช้ในการ hide column
            if (dataSub) {
                for (let index = 0; index < dataSub?.length; index++) {
                    if (columnVisibility[dataSub[index]?.key] == false) {
                        checkData.push({
                            ...dataSub[index],
                            active: false
                        })
                    } else if (columnVisibility[dataSub[index]?.key] == true) {
                        checkData.push({
                            ...dataSub[index],
                            active: true
                        })
                    }
                }
            }

            return checkData;
        }
    }

    const [sortedDataEntry, setSortedDataEntry] = useState(entryVal); // initial sorted data
    const [sortedDataExit, setSortedDataExit] = useState(exitVal); // initial sorted data

    useEffect(() => {
        if (mode == "entry") {
            setSortedDataEntry(entryVal)
        } else {
            setSortedDataExit(exitVal)
        }
    }, [entryVal, exitVal])

    return (
        <div className="overflow-auto rounded-t-md">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                {/* Table Header */}
                <thead className="text-xs text-[#ffffff] bg-[#1473A1] border-[#1473A1] sticky top-0 z-10">
                    <tr className="h-9">
                        {
                            mode == "entry" ?

                                <>
                                    {columnVisibility?.zone && (
                                        <th
                                            scope="col"
                                            className={`${table_sort_header_style}  border-none text-center bg-[#1473A1]`}
                                        // onClick={() => handleSort("id_name", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`Zone`}
                                            {/* {getArrowIcon("id_name")} */}
                                        </th>
                                    )}

                                    {columnVisibility?.area && (
                                        <th
                                            scope="col"
                                            className={`${table_sort_header_style}  border-none text-center bg-[#1473A1]`}
                                        // onClick={() => handleSort("id_name", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`Area`}
                                            {/* {getArrowIcon("id_name")} */}
                                        </th>
                                    )}

                                    {columnVisibility?.contract_point && (
                                        <th
                                            scope="col"
                                            className={`${table_sort_header_style}  border-none text-center bg-[#1473A1]`}
                                        // onClick={() => handleSort("id_name", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`Contract Point`}
                                            {/* {getArrowIcon("id_name")} */}
                                        </th>
                                    )}

                                    {
                                        updatedHeaders?.map((header: any, index: any) => {
                                            const visibilityKey = visibilityMap[header.label];
                                            if (!columnVisibility[visibilityKey]) {
                                                return null
                                            }

                                            const checkDate: any = functionControlcolSpan(header, 'date'); //example here only data == date

                                            return (
                                                <th
                                                    key={index}
                                                    colSpan={checkDate?.filter((item: any) => item?.active == false)?.length > 0 ? checkDate?.filter((item: any) => item?.active == true)?.length : header.dates && header.dates.length > 0 ? header.dates.length : header.subHeaders ? header.subHeaders.length : 1}
                                                    className={`${["Zone", "Area", "Entry Meter ID", "Contract Point", "New Point"].includes(header.label) ? table_sort_header_style : table_header_style} text-center w-[100px] border-r-2 border-gray-300`}
                                                >
                                                    {
                                                        header.label == "Pressure Range" ? 'Pressure Range (PSIG)' : header.label == "Temperature Range" ? 'Temperature Range (Deg. F)' : header.label
                                                    }
                                                    {["Zone", "Area", "Entry Meter ID", "Contract Point", "New Point"].includes(header.label) && getArrowIcon("entry_item" + index)}
                                                </th>
                                            )
                                        })
                                    }

                                </>
                                :
                                <>
                                    {columnVisibility.zone && (
                                        <th
                                            scope="col"
                                            className={`${table_sort_header_style}  border-none text-center bg-[#1473A1]`}
                                        // onClick={() => handleSort("id_name", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`Zone`}
                                            {/* {getArrowIcon("id_name")} */}
                                        </th>
                                    )}

                                    {columnVisibility.area && (
                                        <th
                                            scope="col"
                                            className={`${table_sort_header_style}  border-none text-center bg-[#1473A1]`}
                                        // onClick={() => handleSort("id_name", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`Area`}
                                            {/* {getArrowIcon("id_name")} */}
                                        </th>
                                    )}

                                    {columnVisibility.contract_point && (
                                        <th
                                            scope="col"
                                            className={`${table_sort_header_style}  border-none text-center bg-[#1473A1]`}
                                        // onClick={() => handleSort("id_name", sortState, setSortState, setSortedData, tableData)}
                                        >
                                            {`Contract Point`}
                                            {/* {getArrowIcon("id_name")} */}
                                        </th>
                                    )}

                                    {/* ############################ พวกหัว table ตัวบน eg. Pressure Range (PSig) ############################ */}
                                    {
                                        updatedHeadersExit?.map((header: any, index: any) => {
                                            const visibilityKey = visibilityMap[header.label];
                                            if (!columnVisibility[visibilityKey]) {
                                                return null
                                            }

                                            const checkDate: any = functionControlcolSpan(header, 'date'); //example here only data == date

                                            return (
                                                <th
                                                    key={index}
                                                    // colSpan={header.dates && header.dates.length > 0 ? header.dates.length : header.subHeaders ? header.subHeaders.length : 1}
                                                    colSpan={checkDate?.filter((item: any) => item?.active == false)?.length > 0 ? checkDate?.filter((item: any) => item?.active == true)?.length : header.dates && header.dates.length > 0 ? header.dates.length : header.subHeaders ? header.subHeaders.length : 1}
                                                    className={`${["Zone", "Area", "Exit Meter ID", "Contract Point", "New Point"].includes(header.label) ? table_sort_header_style : table_header_style} border-r-2 border-gray-300 text-center w-[100px]`}
                                                // onClick={() => handleSort("entry_item" + index, sortState, setSortState, setSortedData, tableData)}
                                                >
                                                    {/* {header.label} */}
                                                    {
                                                        header.label == "Pressure Range" ? 'Pressure Range (PSIG)' : header.label == "Temperature Range" ? 'Temperature Range (Deg. F)' : header.label
                                                    }
                                                    {/* {getArrowIcon("exit_item" + index)} */}
                                                    {["Zone", "Area", "Exit Meter ID", "Contract Point", "New Point"].includes(header.label) && getArrowIcon("exit_item" + index)}
                                                </th>
                                            )
                                        })
                                    }
                                </>
                        }
                    </tr>

                    {/* SUB HEADER หรือ header row ที่สอง */}
                    <tr className="h-9">
                        {columnVisibility.zone && (
                            <th key={'10000'} className={`${table_header_style} border-none text-center bg-[#1473A1]`}></th>
                        )}
                        {/* <th key={'10001'} className={`${table_header_style} border-none text-center bg-[#1473A1]`}></th> */}
                        {columnVisibility.area && (
                            <th key={'10002'} className={`${table_header_style} border-none text-center bg-[#1473A1]`}></th>
                        )}
                        {columnVisibility.contract_point && (
                            <th key={'10003'} className={`${table_header_style} border-none text-center bg-[#1473A1]`}></th>
                        )}

                        {mode == "entry" ?
                            updatedHeaders?.map((header: any, index: any) => {
                                const visibilityKey = visibilityMap[header.label];
                                if (!columnVisibility[visibilityKey]) {
                                    return null
                                }

                                let findKey: any = initialColumnsDynamic?.find((item: any) => item?.label == header?.label);
                                const checkDate: any = functionControlcolSpan(header, 'date'); //example here only data == date
                                const checkSubheader: any = functionControlcolSpan(header, 'sub_header'); //example here only data == sub_header

                                return (
                                    header?.dates ? (
                                        sortDatesAsc([...header.dates]).map((date: any, dateIndex: any, arr: any) => ( // Sort before rendering
                                            date == 'From' || date == 'To' ?
                                                columnVisibility[formatDateToMonthYear(date)] && (
                                                    <th
                                                        key={`${index}-${dateIndex}`}
                                                        colSpan={
                                                            checkDate?.filter((item: any) => item?.active == false)?.length > 0 ? checkDate?.filter((item: any) => item?.active == true)?.length : 1
                                                        }
                                                        className={`
                                                                ${table_sort_header_style} 
                                                                text-center 
                                                                bg-[#00ADEF]
                                                                !border-b-0
                                                                ${dateIndex === arr.length - 1 ?
                                                                "border-r-2 border-gray-300"
                                                                : checkDate?.filter((item: any) => item?.active == false)?.length > 0 ?
                                                                    checkDate?.filter((item: any) => item?.active == true)[checkDate?.filter((item: any) => item?.active == true)?.length - 1]?.key == formatDateToMonthYear(date) && //หาตัวสุดท้าย โดยการเอา check date filter หาของที่มี และ - ด้วย(ของที่มี -1) เพื่อเช็ค index ตัวสุดท้ายสำหรับใส่ style
                                                                    "border-r-2 border-gray-300" : ""}
                                                            `}
                                                    >
                                                        {/* {formatDateToMonthYear(date)} */}
                                                        {dataContractTermType?.id == 4 ? formatDateToDayMonthYear(date) : formatDateToMonthYear(date)}
                                                        {getArrowIcon("entry_date" + dateIndex)}
                                                    </th>
                                                )
                                                : columnVisibility[findKey?.key + "_" + formatDateToMonthYear(date)] && (
                                                    <th
                                                        key={`${index}-${dateIndex}`}
                                                        // className={`${table_sort_header_style} text-center bg-[#00ADEF] ${dateIndex === arr.length - 1 ? "border-r-2 border-gray-300" : ""}`}
                                                        colSpan={1}
                                                        className={`
                                                                ${table_sort_header_style} 
                                                                text-center 
                                                                bg-[#00ADEF]
                                                                !border-b-0
                                                                ${dateIndex === arr.length - 1 ?
                                                                "border-r-2 border-gray-300"
                                                                : checkDate?.filter((item: any) => item?.active == false)?.length > 0 ?
                                                                    checkDate?.filter((item: any) => item?.active == true)[checkDate?.filter((item: any) => item?.active == true)?.length - 1]?.key == formatDateToMonthYear(date) && //หาตัวสุดท้าย โดยการเอา check date filter หาของที่มี และ - ด้วย(ของที่มี -1) เพื่อเช็ค index ตัวสุดท้ายสำหรับใส่ style
                                                                    "border-r-2 border-gray-300" : ""}
                                                            `}
                                                    >
                                                        {/* {formatDateToMonthYear(date)} */}
                                                        {dataContractTermType?.id == 4 ? formatDateToDayMonthYear(date) : formatDateToMonthYear(date)}
                                                        {getArrowIcon("entry_date" + dateIndex)}
                                                    </th>
                                                )
                                        ))
                                    ) : header?.subHeaders && header?.subHeaders.length > 0 ? (
                                        header?.subHeaders?.map((subHeader: any, subIndex: any, arr: any) => (
                                            columnVisibility[subHeader?.key] && (
                                                <th
                                                    key={`${index}-${subIndex}`}
                                                    colSpan={
                                                        checkSubheader?.filter((item: any) => item?.active == false)?.length > 0 ? 2 : 1
                                                    }
                                                    className={`${table_sort_header_style} text-center bg-[#00ADEF] ${subIndex === arr.length - 1 ? "border-r-2 border-gray-300" : checkSubheader?.filter((item: any) => item?.active == false)?.length > 0 ? "border-r-2 border-gray-300" : ""}`}
                                                >
                                                    {subHeader.label}
                                                    {getArrowIcon("entry_sub_min_max" + subIndex)}
                                                </th>
                                            )
                                        ))
                                    ) : (
                                        <th key={index}
                                            // className="px-4 py-2 border border-gray-300 text-center"
                                            className={`${table_header_style} border border-[#1473A1] text-center `}
                                        >
                                            {/* Empty header for standalone columns */}
                                        </th>
                                    )
                                )

                            }
                            )
                            :
                            // headersExit.map((header: any, index: any) =>
                            updatedHeadersExit.map((header: any, index: any) => {
                                const visibilityKey = visibilityMap[header.label];
                                if (!columnVisibility[visibilityKey]) {
                                    return null
                                }

                                let findKey: any = initialColumnsDynamic?.find((item: any) => item?.label == header?.label);
                                const checkDate: any = functionControlcolSpan(header, 'date'); //example here only data == date
                                const checkSubheader: any = functionControlcolSpan(header, 'sub_header'); //example here only data == sub_header
                                return (
                                    header.dates ? (
                                        sortDatesAsc([...header.dates]).map((date: any, dateIndex: any, arr: any) => ( // Sort before rendering
                                            date == 'From' || date == 'To' ?
                                                columnVisibility[formatDateToMonthYear(date)] && (
                                                    <th
                                                        key={`${index}-${dateIndex}`}
                                                        colSpan={
                                                            checkDate?.filter((item: any) => item?.active == false)?.length > 0 ? checkDate?.filter((item: any) => item?.active == true)?.length : 1
                                                        }
                                                        className={`
                                                                ${table_sort_header_style} 
                                                                text-center 
                                                                bg-[#00ADEF]
                                                                !border-b-0
                                                                ${dateIndex === arr.length - 1 ?
                                                                "border-r-2 border-gray-300"
                                                                : checkDate?.filter((item: any) => item?.active == false)?.length > 0 ?
                                                                    "border-r-2 border-gray-300" : ""}
                                                            `}
                                                    // className={`${table_sort_header_style} border-b border-[#00ADEF] text-center bg-[#00ADEF] ${dateIndex === arr.length - 1 ? "border-b border-b-[#00ADEF] border-r-2 border-gray-300" : ""}`}
                                                    // onClick={() => handleSort("name", sortState, setSortState, setSortedData, tableData)}
                                                    >
                                                        {/* {formatDateToMonthYear(date)} */}
                                                        {dataContractTermType?.id == 4 ? formatDateToDayMonthYear(date) : formatDateToMonthYear(date)}
                                                        {getArrowIcon("exit_date" + dateIndex)}
                                                    </th>
                                                )
                                                : columnVisibility[findKey?.key + "_" + formatDateToMonthYear(date)] && (
                                                    <th
                                                        key={`${index}-${dateIndex}`}
                                                        colSpan={
                                                            checkDate?.filter((item: any) => item?.active == false)?.length > 0 ? checkDate?.filter((item: any) => item?.active == true)?.length : 1
                                                        }
                                                        className={`
                                                                ${table_sort_header_style} 
                                                                text-center 
                                                                bg-[#00ADEF]
                                                                !border-b-0
                                                                ${dateIndex === arr.length - 1 ?
                                                                "border-r-2 border-gray-300"
                                                                : checkDate?.filter((item: any) => item?.active == false)?.length > 0 ?
                                                                    checkDate?.filter((item: any) => item?.active == true)[checkDate?.filter((item: any) => item?.active == true)?.length - 1]?.key == formatDateToMonthYear(date) && //หาตัวสุดท้าย โดยการเอา check date filter หาของที่มี และ - ด้วย(ของที่มี -1) เพื่อเช็ค index ตัวสุดท้ายสำหรับใส่ style
                                                                    "border-r-2 border-gray-300" : ""}
                                                            `}
                                                    >
                                                        {/* {formatDateToMonthYear(date)} */}
                                                        {dataContractTermType?.id == 4 ? formatDateToDayMonthYear(date) : formatDateToMonthYear(date)}
                                                        {getArrowIcon("exit_date" + dateIndex)}
                                                    </th>
                                                )
                                        ))
                                    ) : header.subHeaders && header.subHeaders.length > 0 ? (
                                        header.subHeaders.map((subHeader: any, subIndex: any, arr: any) => (
                                            columnVisibility[subHeader?.key] && (
                                                <th
                                                    key={`${index}-${subIndex}`}
                                                    colSpan={
                                                        checkSubheader?.filter((item: any) => item?.active == false)?.length > 0 ? 2 : 1
                                                    }
                                                    className={`${table_sort_header_style} text-center bg-[#00ADEF] ${subIndex === arr.length - 1 ? "border-r-2 border-gray-300" : checkSubheader?.filter((item: any) => item?.active == false)?.length > 0 ? "border-r-2 border-gray-300" : ""}`}
                                                >
                                                    {subHeader.label}
                                                    {getArrowIcon("exit_sub_min_max" + subIndex)}
                                                </th>
                                            )
                                        ))
                                    ) : (
                                        <th key={index}
                                            className={`${table_header_style} border border-[#1473A1] text-center `}
                                        >
                                            {/* Empty header for standalone columns */}
                                        </th>
                                    )
                                )
                            })
                        }
                    </tr>
                </thead>

                <tbody>
                    {
                        mode == "entry" ? sortedDataEntry?.map((row: any, rowIndex: any) => (
                            <tr key={rowIndex} className="hover:bg-gray-50">
                                {/* ZONE */}
                                {columnVisibility.zone && (
                                    <td
                                        key={`10000`}
                                        className="px-4 py-2 border-b border-gray-300 text-center text-[#464255]"
                                    >
                                        {(() => {
                                            const filter_contract_point = contractPointData?.data?.find((item: any) => item.contract_point === row["0"].trim());

                                            return filter_contract_point ? (
                                                <div
                                                    className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]"
                                                    style={{ backgroundColor: filter_contract_point?.zone?.color }}
                                                >
                                                    {filter_contract_point?.zone?.name}
                                                </div>
                                            ) : null;
                                        })()}
                                    </td>
                                )}

                                {/* AREA */}
                                {columnVisibility.area && (
                                    <td
                                        key={`10001`}
                                        className="px-4 py-2 border-b border-gray-300 text-center text-[#464255]"
                                    >
                                        {(() => {
                                            const filter_contract_point = contractPointData?.data?.find((item: any) => item.contract_point === row["0"].trim());

                                            return filter_contract_point ? (
                                                <div
                                                    className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]"
                                                    style={{ backgroundColor: filter_contract_point?.area?.color }}
                                                >
                                                    {filter_contract_point?.area?.name}
                                                </div>
                                            ) : null;
                                        })()}
                                    </td>
                                )}

                                {/* CONTRACT POINT */}
                                {columnVisibility.contract_point && (
                                    <td
                                        key={`10002`}
                                        className="px-4 py-2 border-b border-gray-300 text-center text-[#464255]"
                                    >
                                        {
                                            row?.[0]
                                        }
                                    </td>
                                )}

                                {updatedHeaders?.map((header: any, colIndex: any) => {
                                    const visibilityKey = visibilityMap[header.label];

                                    // Check if the header has dates
                                    if (header.dates && header.dates.length > 0) {
                                        let findKey: any = initialColumnsDynamic?.find((item: any) => item?.label == header?.label);
                                        const checkDate: any = functionControlcolSpan(header, 'date'); //example here only data == date

                                        return (header?.dates2?.map((date: any, dateIndex: any, arr: any) => {
                                            return (
                                                date?.value == 'From' || date?.value == 'To' ?
                                                    (columnVisibility[formatDateToMonthYear(date?.value)] && (
                                                        <td
                                                            key={`${colIndex}-${dateIndex}`}
                                                            className={`
                                                            px-4 
                                                            py-2 
                                                            border-b 
                                                            border-gray-300 
                                                            text-center 
                                                            text-[#464255] 
                                                            ${dateIndex === arr.length - 1 ? "border-r-2 border-gray-300"
                                                                    : checkDate?.filter((item: any) => item?.active == false)?.length > 0 ?
                                                                        checkDate?.filter((item: any) => item?.active == true)[checkDate?.filter((item: any) => item?.active == true)?.length - 1]?.key == formatDateToMonthYear(date?.value) && //หาตัวสุดท้าย โดยการเอา check date filter หาของที่มี และ - ด้วย(ของที่มี -1) เพื่อเช็ค index ตัวสุดท้ายสำหรับใส่ style
                                                                        "border-r-2 border-gray-300" : ""}
                                                        `}
                                                        >
                                                            {isEditing && modeEditing == 'entry' ? (
                                                                /^\d{2}\/\d{2}\/\d{4}$/.test(row[date.key]) || row[date.key] == undefined && (date.key === 5 || date.key === 6) ? (
                                                                    <>
                                                                        <DatePickaForm
                                                                            key={"start" + key}
                                                                            readOnly={false}
                                                                            placeHolder="Select Date"
                                                                            mode={'edit-table'}
                                                                            valueShow={row[date.key] && dayjs(row[date.key], "DD/MM/YYYY").format("DD/MM/YYYY")}
                                                                            min={tomorrowDay || undefined}
                                                                            allowClear
                                                                            onChange={(e: any) => {

                                                                            }}
                                                                        />
                                                                    </>
                                                                ) : (
                                                                    // ใหม่ ค่าในแต่ละเดือน หลัง key 6
                                                                    <NumericFormat
                                                                        value={row[date.key] || ''}
                                                                        onValueChange={(values) => {
                                                                        }}
                                                                        thousandSeparator=","
                                                                        decimalScale={3}
                                                                        fixedDecimalScale={true}
                                                                        allowNegative={false}
                                                                        className={`${inputClass} text-right`}
                                                                    />
                                                                )
                                                            ) : (
                                                                formatNumberThreeDecimal(row[date.key]) || ''
                                                            )}
                                                        </td>
                                                    ))
                                                    : columnVisibility[findKey?.key + "_" + formatDateToMonthYear(date?.value)] && (
                                                        <td
                                                            key={`${colIndex}-${dateIndex}`}
                                                            className={`
                                                            px-4 
                                                            py-2 
                                                            border-b 
                                                            border-gray-300 
                                                            text-center 
                                                            text-[#464255] 
                                                            ${dateIndex === arr.length - 1 ? "border-r-2 border-gray-300"
                                                                    : checkDate?.filter((item: any) => item?.active == false)?.length > 0 ?
                                                                        checkDate?.filter((item: any) => item?.active == true)[checkDate?.filter((item: any) => item?.active == true)?.length - 1]?.key == formatDateToMonthYear(date?.value) && //หาตัวสุดท้าย โดยการเอา check date filter หาของที่มี และ - ด้วย(ของที่มี -1) เพื่อเช็ค index ตัวสุดท้ายสำหรับใส่ style
                                                                        "border-r-2 border-gray-300" : ""}
                                                        `}
                                                        >
                                                            {isEditing && modeEditing == 'entry' ? (
                                                                /^\d{2}\/\d{2}\/\d{4}$/.test(row[date.key]) || row[date.key] == undefined && (date.key === 5 || date.key === 6) ? (
                                                                    <>
                                                                        <DatePickaForm
                                                                            key={"start" + key}
                                                                            readOnly={false}
                                                                            placeHolder="Select Date"
                                                                            mode={'edit-table'}
                                                                            valueShow={row[date.key] && dayjs(row[date.key], "DD/MM/YYYY").format("DD/MM/YYYY")}
                                                                            min={tomorrowDay || undefined}
                                                                            allowClear
                                                                            onChange={(e: any) => {

                                                                            }}
                                                                        />
                                                                    </>
                                                                ) : (
                                                                    // ใหม่ ค่าในแต่ละเดือน หลัง key 6
                                                                    <NumericFormat
                                                                        value={row[date.key] || ''}
                                                                        onValueChange={(values) => {
                                                                        }}
                                                                        thousandSeparator=","
                                                                        decimalScale={3}
                                                                        fixedDecimalScale={true}
                                                                        allowNegative={false}
                                                                        className={`${inputClass} text-right`}
                                                                    />
                                                                )
                                                            ) : (
                                                                formatNumberThreeDecimal(row[date.key]) || ''
                                                            )}
                                                        </td>
                                                    )
                                            )
                                        }));
                                    } else if ((header?.subHeaders?.length ?? 0) > 0) {
                                        // Render data for columns with subHeaders
                                        // ตรงนี้ render Min, Max

                                        const checkSubheader: any = functionControlcolSpan(header, 'sub_header'); //example here only data == sub_header

                                        return header?.subHeaders?.map((subHeader: any, subIndex: any, arr: any) => (

                                            columnVisibility[subHeader?.key] && (
                                                <td
                                                    key={`${colIndex}-${subIndex}`}
                                                    colSpan={
                                                        checkSubheader?.filter((item: any) => item?.active == false)?.length > 0 ? 2 : 1
                                                    }
                                                    className={`px-4 py-2 border-b border-gray-300 text-center text-[#464255] ${subIndex === arr.length - 1 ? "border-r-2 border-[#E0E0E0]" : checkSubheader?.filter((item: any) => item?.active == false)?.length > 0 ? "border-r-2 border-[#E0E0E0]" : ""}`}
                                                >
                                                    {/* {row[subHeader?.value] || ''} */}
                                                    {isEditing && modeEditing == 'entry' ? (
                                                        <NumericFormat
                                                            value={row[subHeader?.value] || ''}
                                                            onValueChange={(values) => {
                                                            }}
                                                            thousandSeparator=","
                                                            decimalScale={3}
                                                            fixedDecimalScale={true}
                                                            allowNegative={false}
                                                            // className="w-full text-center border border-gray-300 rounded"
                                                            className={`${inputClass} text-right`}
                                                        />
                                                    ) : (
                                                        // row[subHeader?.value] || ''
                                                        formatNumberThreeDecimal(row[subHeader?.value]) || ''
                                                    )}
                                                </td>
                                            )
                                        ));
                                    }
                                })}
                            </tr>
                        ))
                            : exitVal?.map((row: any, rowIndex: any) => (
                                <tr key={rowIndex} className="hover:bg-gray-50">

                                    {/* ZONE */}
                                    {columnVisibility.zone && (
                                        <td
                                            key={`20000` + rowIndex}
                                            className="px-4 py-2 border-b border-gray-300 text-center text-[#464255]"
                                        >
                                            {(() => {
                                                const filter_contract_point = contractPointData?.data?.find((item: any) => item.contract_point === row["0"].trim());

                                                return filter_contract_point ? (
                                                    <div
                                                        className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]"
                                                        style={{ backgroundColor: filter_contract_point?.zone?.color }}
                                                    >
                                                        {filter_contract_point?.zone?.name}
                                                    </div>
                                                ) : null;
                                            })()}
                                        </td>
                                    )}


                                    {/* AREA */}
                                    {columnVisibility.area && (
                                        <td
                                            key={`20002` + rowIndex}
                                            className="px-4 py-2 border-b border-gray-300 text-center text-[#464255]"
                                        >
                                            {(() => {
                                                const filter_contract_point = contractPointData?.data?.find((item: any) => item.contract_point === row["0"].trim());

                                                return filter_contract_point ? (
                                                    <div
                                                        className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]"
                                                        style={{ backgroundColor: filter_contract_point?.area?.color }}
                                                    >
                                                        {filter_contract_point?.area?.name}
                                                    </div>
                                                ) : null;
                                            })()}
                                        </td>
                                    )}

                                    {/* CONTRACT POINT */}
                                    {columnVisibility.area && (
                                        <td
                                            key={`20004` + rowIndex}
                                            className="px-4 py-2 border-b border-gray-300 text-center text-[#464255]"
                                        >
                                            {row?.[0]}
                                        </td>
                                    )}

                                    {updatedHeadersExit?.map((header: any, colIndex: any) => {
                                        const visibilityKey = visibilityMap[header.label];

                                        // Check if the header has dates
                                        if (header.dates && header.dates.length > 0) {
                                            let findKey: any = initialColumnsDynamic?.find((item: any) => item?.label == header?.label);
                                            const checkDate: any = functionControlcolSpan(header, 'date'); //example here only data == date

                                            return (header?.dates2?.map((date: any, dateIndex: any, arr: any) => {

                                                return (
                                                    date?.value == 'From' || date?.value == 'To' ?
                                                        (columnVisibility[formatDateToMonthYear(date?.value)] && (
                                                            <td
                                                                key={`${colIndex}-${dateIndex}`}
                                                                className={`
                                                                    px-4 
                                                                    py-2 
                                                                    border-b 
                                                                    border-gray-300 
                                                                    text-center 
                                                                    text-[#464255] 
                                                                    ${dateIndex === arr.length - 1 ? "border-r-2 border-gray-300"
                                                                        : checkDate?.filter((item: any) => item?.active == false)?.length > 0 ?
                                                                            checkDate?.filter((item: any) => item?.active == true)[checkDate?.filter((item: any) => item?.active == true)?.length - 1]?.key == formatDateToMonthYear(date?.value) && //หาตัวสุดท้าย โดยการเอา check date filter หาของที่มี และ - ด้วย(ของที่มี -1) เพื่อเช็ค index ตัวสุดท้ายสำหรับใส่ style
                                                                            "border-r-2 border-gray-300" : ""}
                                                                `}
                                                            >
                                                                {isEditing && modeEditing == 'exit' ? (
                                                                    /^\d{2}\/\d{2}\/\d{4}$/.test(row[date.key]) || row[date.key] == undefined && (date.key === 33 || date.key === 34) ? (
                                                                        <>
                                                                            <DatePickaForm
                                                                                key={"start" + key}
                                                                                // {...register('start_date')}
                                                                                readOnly={false}
                                                                                placeHolder="Select Date"
                                                                                mode={'edit-table'}
                                                                                valueShow={row[date.key] && dayjs(row[date.key], "DD/MM/YYYY").format("DD/MM/YYYY")}
                                                                                // min={formattedStartDate || undefined}
                                                                                min={tomorrowDay || undefined}
                                                                                allowClear
                                                                                onChange={(e: any) => {

                                                                                }}
                                                                            />
                                                                        </>
                                                                    ) : (
                                                                        <NumericFormat
                                                                            value={row[date.key] || ''}
                                                                            onValueChange={(values) => { }}
                                                                            thousandSeparator=","
                                                                            decimalScale={3}
                                                                            fixedDecimalScale={true}
                                                                            allowNegative={false}
                                                                            className={`${inputClass} text-right`}
                                                                        />
                                                                    )
                                                                ) : (
                                                                    formatNumberThreeDecimal(row[date.key]) || ''
                                                                )}
                                                            </td>
                                                        ))
                                                        : columnVisibility[findKey?.key + "_" + formatDateToMonthYear(date?.value)] && (
                                                            <td
                                                                key={`${colIndex}-${dateIndex}`}
                                                                className={`
                                                                px-4 
                                                                py-2 
                                                                border-b 
                                                                border-gray-300 
                                                                text-center 
                                                                text-[#464255] 
                                                                ${dateIndex === arr.length - 1 ? "border-r-2 border-gray-300"
                                                                        : checkDate?.filter((item: any) => item?.active == false)?.length > 0 ?
                                                                            checkDate?.filter((item: any) => item?.active == true)[checkDate?.filter((item: any) => item?.active == true)?.length - 1]?.key == formatDateToMonthYear(date?.value) && //หาตัวสุดท้าย โดยการเอา check date filter หาของที่มี และ - ด้วย(ของที่มี -1) เพื่อเช็ค index ตัวสุดท้ายสำหรับใส่ style
                                                                            "border-r-2 border-gray-300" : ""}
                                                            `}
                                                            >
                                                                {isEditing && modeEditing == 'exit' ? (
                                                                    /^\d{2}\/\d{2}\/\d{4}$/.test(row[date.key]) || row[date.key] == undefined && (date.key === 33 || date.key === 34) ? (
                                                                        <>
                                                                            <DatePickaForm
                                                                                key={"start" + key}
                                                                                // {...register('start_date')}
                                                                                readOnly={false}
                                                                                placeHolder="Select Date"
                                                                                mode={'edit-table'}
                                                                                valueShow={row[date.key] && dayjs(row[date.key], "DD/MM/YYYY").format("DD/MM/YYYY")}
                                                                                // min={formattedStartDate || undefined}
                                                                                min={tomorrowDay || undefined}
                                                                                allowClear
                                                                                onChange={(e: any) => {

                                                                                }}
                                                                            />
                                                                        </>
                                                                    ) : (
                                                                        <NumericFormat
                                                                            value={row[date.key] || ''}
                                                                            onValueChange={(values) => { }}
                                                                            thousandSeparator=","
                                                                            decimalScale={3}
                                                                            fixedDecimalScale={true}
                                                                            allowNegative={false}
                                                                            className={`${inputClass} text-right`}
                                                                        />
                                                                    )
                                                                ) : (
                                                                    formatNumberThreeDecimal(row[date.key]) || ''
                                                                )}
                                                            </td>
                                                        )
                                                )
                                            }));
                                        } else if (header.subHeaders && header.subHeaders.length > 0) {
                                            // Render data for columns with subHeaders
                                            // ตรงนี้ render Min, Max
                                            const checkSubheader: any = functionControlcolSpan(header, 'sub_header'); //example here only data == sub_header

                                            return header.subHeaders.map((subHeader: any, subIndex: any, arr: any) => (

                                                columnVisibility[subHeader?.key] && (
                                                    <td
                                                        key={`${colIndex}-${subIndex}`}
                                                        colSpan={
                                                            checkSubheader?.filter((item: any) => item?.active == false)?.length > 0 ? 2 : 1
                                                        }
                                                        className={`px-4 py-2 border-b border-gray-300 text-center text-[#464255] ${subIndex === arr.length - 1 ? "border-r-2 border-[#E0E0E0]" : checkSubheader?.filter((item: any) => item?.active == false)?.length > 0 ? "border-r-2 border-[#E0E0E0]" : ""}`}
                                                    >
                                                        {/* {row[subHeader?.value] || ''} */}
                                                        {isEditing && modeEditing == 'exit' ? (
                                                            <NumericFormat
                                                                value={row[subHeader?.value] || ''}
                                                                onValueChange={(values) => {

                                                                }}
                                                                thousandSeparator=","
                                                                decimalScale={3}
                                                                fixedDecimalScale={true}
                                                                allowNegative={false}
                                                                // className="w-full text-center border border-gray-300 rounded"
                                                                className={`${inputClass} text-right`}
                                                            />
                                                        ) : (
                                                            // row[subHeader?.value] || ''
                                                            formatNumberThreeDecimal(row[subHeader?.value]) || ''
                                                        )}
                                                    </td>
                                                )
                                            ));
                                        }
                                    })}
                                </tr>
                            ))
                    }





                    {/* ############### SUMMARY ENTRY ############### */}
                    {
                        // mode == "entry" ? outputEntry.map((entry: any, rowIndex: any) => {
                        mode == "entry" && summedEntries?.length > 0 && summedEntries?.map((entry: any, rowIndex: any) => {

                            return (
                                <tr key={rowIndex} className='h-[50px]' style={{ backgroundColor: entry?.zone?.color ? entry?.zone?.color : '#ffffff' }}>

                                    <td
                                        colSpan={2}
                                        className="px-4 py-2 text-left font-bold text-[#464255]"
                                    >
                                        {/* {`Sum Entry ${entry["region"]?.name}`} */}
                                        {`Sum Entry ${entry?.zone?.name}`}
                                    </td>

                                    {Array.from({ length: 7 }).map((_, index) => {
                                        const findUse: any = initialColumnsDynamic?.filter((item: any, key: any) => key == 2 || key == 4 || key == 5 || key == 7 || key == 8 || key == 10 || key == 11);
                                        const parentID: any = findUse?.find((item: any, key: any) => key == index)?.parent_id;
                                        const checkParent: any = parentID && parentID !== 'period' ? findUse?.filter((item: any) => item?.parent_id == parentID) : undefined;
                                        let resultParent: any = false;
                                        // let resultMaster: any = false;
                                        if (checkParent) {
                                            let count: any = 0;
                                            for (let index = 0; index < checkParent?.length; index++) {
                                                if (columnVisibility[checkParent[index]?.key] == false) {
                                                    count = count + 1;
                                                    resultParent = false;
                                                }

                                                if (count == checkParent?.length) {
                                                    resultParent = true;
                                                }
                                            }
                                        }

                                        if (!checkParent) {
                                            if (findUse?.find((item: any, key: any) => key == index)?.key) {
                                                return columnVisibility[findUse?.find((item: any, key: any) => key == index)?.key] == true && (
                                                    <td
                                                        key={index}
                                                        className="px-4 py-2 text-center text-[#464255]"
                                                    >
                                                    </td>
                                                )
                                            }
                                        } else if (checkParent) {
                                            if (resultParent == false) {
                                                return (
                                                    <td
                                                        key={index}
                                                        className="px-4 py-2 text-center text-[#464255]"
                                                    >
                                                    </td>
                                                )
                                            }
                                        }
                                    })}

                                    {
                                        Object.keys(entry).map((key: any, index: any) => {
                                            if (key !== "region" && key !== "zone" && Number(key) >= 7) {
                                                const groupSize = updatedHeaders[3]?.dates2?.length || 1;
                                                const isGroupEnd = groupSize > 1 ? (index - 6) % groupSize === 0 : 1;
                                                const col_order_num = groupSize > 1 ? Math.floor((index - 7) / groupSize) : 1

                                                const columnOrder = [
                                                    "Capacity Daily Booking (MMBTU/d)",
                                                    "Maximum Hour Booking (MMBTU/h)",
                                                    "Capacity Daily Booking (MMscfd)",
                                                    "Maximum Hour Booking (MMscfh)"
                                                ];

                                                const visibilityKey = visibilityMap[columnOrder[Math.floor(col_order_num)]];
                                                if (!columnVisibility[visibilityKey]) {
                                                    return null;
                                                }

                                                return (
                                                    <td
                                                        key={index + "_map_sum_entry"}
                                                        className={`px-4 py-2 font-bold text-center text-[#464255] ${isGroupEnd ? "border-r-2 border-[#E0E0E0]" : ""} `}
                                                    >
                                                        {formatNumberThreeDecimal(entry[key]) || ""}
                                                    </td>
                                                );
                                            }
                                            return null;
                                        })
                                    }
                                </tr>
                            )
                        })
                    }

                    {/* ############### SUMMARY EXIT ############### */}
                    {
                        mode == "exit" && summedExits?.length > 0 && summedExits?.map((exit: any, rowIndex: any) => {
                            return (
                                <tr key={rowIndex} className='h-[50px]' style={{ backgroundColor: exit?.zone?.color ? exit?.zone?.color : '#ffffff' }}>
                                    <td
                                        colSpan={2}
                                        className="px-4 py-2 text-left font-bold text-[#464255] border-b border-gray-300"
                                    >
                                        {`Sum Exit ${exit?.zone?.name}`}
                                    </td>

                                    {/* length 7 เพราะ column แรก span ไป 2 */}
                                    {Array.from({ length: 7 }).map((_, index) => {
                                        const findUse: any = initialColumnsDynamic?.filter((item: any, key: any) => key == 2 || key == 4 || key == 5 || key == 7 || key == 8 || key == 10 || key == 11);
                                        const parentID: any = findUse?.find((item: any, key: any) => key == index)?.parent_id;
                                        const checkParent: any = parentID && parentID !== 'period' ? findUse?.filter((item: any) => item?.parent_id == parentID) : undefined;
                                        let resultParent: any = false;
                                        // let resultMaster: any = false;
                                        if (checkParent) {
                                            let count: any = 0;
                                            for (let index = 0; index < checkParent?.length; index++) {
                                                if (columnVisibility[checkParent[index]?.key] == false) {
                                                    count = count + 1;
                                                    resultParent = false;
                                                }

                                                if (count == checkParent?.length) {
                                                    resultParent = true;
                                                }
                                            }
                                        }

                                        if (!checkParent) {
                                            if (findUse?.find((item: any, key: any) => key == index)?.key) {
                                                return columnVisibility[findUse?.find((item: any, key: any) => key == index)?.key] == true && (
                                                    <td
                                                        key={index}
                                                        className="px-4 py-2 border-b border-gray-300 text-center text-[#464255]"
                                                        
                                                    >
                                                    </td>
                                                )
                                            }
                                        } else if (checkParent) {
                                            if (resultParent == false) {
                                                return (
                                                    <td
                                                        key={index}
                                                        className="border-b border-gray-300 text-center text-[#464255]"
                                                    >
                                                    </td>
                                                )
                                            }
                                        }
                                    })}

                                    {Object.keys(exit)?.map((key, index) => {
                                        if (key !== "region" && key !== "zone" && Number(key) >= 7) {
                                            const groupSize = updatedHeadersExit[3]?.dates2?.length || 1;
                                            // const isGroupEnd = (index + 1) % groupSize === 0;
                                            // const isGroupEnd = (index - 6) % groupSize === 0;

                                            const isGroupEnd = groupSize > 1 ? (index - 6) % groupSize === 0 : 1;
                                            const col_order_num = groupSize > 1 ? Math.floor((index - 7) / groupSize) : 1

                                            const columnOrder = [
                                                "Capacity Daily Booking (MMBTU/d)",
                                                "Maximum Hour Booking (MMBTU/h)",
                                            ];

                                            const visibilityKey = visibilityMap[columnOrder[col_order_num]];

                                            // if (!columnVisibility[visibilityKey]) {
                                            //     return null;
                                            // }
                                            return (
                                                <td
                                                    key={index + "_map_sum_exit"}
                                                    className={`px-4 py-2 border-b font-bold border-gray-300 text-center text-[#464255] ${isGroupEnd ? "border-r-2 border-[#E0E0E0]" : ""}`}
                                                >
                                                    {formatNumberThreeDecimal(exit[key]) || ""}
                                                </td>
                                            );
                                        }
                                        return null;
                                    })}
                                </tr>
                            )
                        })
                    }

                    {/* ############### SUMMARY ของ SUMMARY คือ SUUUUUMMAAAAAARYYYYYYYYY! ############### */}
                    {
                        mode == "entry" && summedEntryRef.current &&
                        <tr key={`sum_sum_sum_entry`} className='h-[50px]' style={{ backgroundColor: '#1473A1' }}>
                            <td
                                colSpan={2}
                                className="px-4 py-2 text-left font-bold text-[#ffffff] border-b border-gray-300"
                            >
                                {`TOTAL ENTRY`}
                            </td>

                            {/* length 7 เพราะ column แรก span ไป 2 */}
                            {Array.from({ length: 7 }).map((_, index) => {
                                // key == 0 || key == 1 ||
                                const findUse: any = initialColumnsDynamic?.filter((item: any, key: any) => key == 2 || key == 4 || key == 5 || key == 7 || key == 8 || key == 10 || key == 11);
                                const parentID: any = findUse?.find((item: any, key: any) => key == index)?.parent_id;
                                const checkParent: any = parentID && parentID !== 'period' ? findUse?.filter((item: any) => item?.parent_id == parentID) : undefined;
                                let resultParent: any = false;
                                if (checkParent) {
                                    let count: any = 0;
                                    for (let index = 0; index < checkParent?.length; index++) {
                                        if (columnVisibility[checkParent[index]?.key] == false) {
                                            count = count + 1;
                                            resultParent = false;
                                        }

                                        if (count == checkParent?.length) {
                                            resultParent = true;
                                        }
                                    }
                                }

                                if (!checkParent) {
                                    if (findUse?.find((item: any, key: any) => key == index)?.key) {
                                        return columnVisibility[findUse?.find((item: any, key: any) => key == index)?.key] == true && (
                                            <td
                                                key={index}
                                                className="px-4 py-2 text-center text-[#464255]"
                                            >
                                                {/* Blank values for keys 1 - 7 */}
                                            </td>
                                        )
                                    }
                                } else if (checkParent) {
                                    if (resultParent == false) {
                                        return (
                                            <td
                                                key={index}
                                                className="px-4 py-2 text-center text-[#464255]"
                                            >
                                                {/* Blank values for keys 1 - 7 */}
                                            </td>
                                        )
                                    }
                                }
                            })}

                            {
                                Object.entries(summedEntryRef.current).map((key: any, value: any, index: any) => {

                                    if (key[0] !== "region" && key[0] !== "zone" && (value >= 7 || Number(key[0]) >= 7)) {

                                        const groupSize = updatedHeaders[3]?.dates2?.length || 1;
                                        // const isGroupEnd = (value + 1) % groupSize === 0;
                                        // const isGroupEnd = (index - 6) % groupSize === 0;

                                        const isGroupEnd = groupSize > 1 ? (value - 6) % groupSize === 0 : 1;
                                        const col_order_num = groupSize > 1 ? Math.floor((value - 7) / groupSize) : 1

                                        const columnOrder = [
                                            "Capacity Daily Booking (MMBTU/d)",
                                            "Maximum Hour Booking (MMBTU/h)",
                                            "Capacity Daily Booking (MMscfd)",
                                            "Maximum Hour Booking (MMscfh)"
                                        ];

                                        const visibilityKey = visibilityMap[columnOrder[col_order_num]];
                                        if (!columnVisibility[visibilityKey]) {
                                            return null;
                                        }

                                        return (
                                            <td
                                                key={value + "_map_entry"}
                                                className={`px-4 py-2 font-bold text-center text-[#ffffff] ${isGroupEnd ? "border-r-2 border-[#E0E0E0]" : ""} `}
                                            >
                                                {formatNumberThreeDecimal(key[1]) || ""}
                                            </td>
                                        );
                                    }
                                    return null;
                                })
                            }
                        </tr>
                    }


                    {
                        mode == "exit" && summedExitRef.current &&
                        <tr key={`sum_sum_sum_exit`} className='h-[50px]' style={{ backgroundColor: '#1473A1' }}>
                            <td
                                colSpan={2}
                                className="px-4 py-2 text-left font-bold text-[#ffffff] border-b border-gray-300"
                            >
                                {`TOTAL EXIT`}
                            </td>

                            {/* length 7 เพราะ column แรก span ไป 2 */}
                            {Array.from({ length: 7 }).map((_, index) => {
                                // key == 0 || key == 1 ||
                                const findUse: any = initialColumnsDynamic?.filter((item: any, key: any) => key == 2 || key == 4 || key == 5 || key == 7 || key == 8 || key == 10 || key == 11);
                                const parentID: any = findUse?.find((item: any, key: any) => key == index)?.parent_id;
                                const checkParent: any = parentID && parentID !== 'period' ? findUse?.filter((item: any) => item?.parent_id == parentID) : undefined;
                                let resultParent: any = false;
                                if (checkParent) {
                                    let count: any = 0;
                                    for (let index = 0; index < checkParent?.length; index++) {
                                        if (columnVisibility[checkParent[index]?.key] == false) {
                                            count = count + 1;
                                            resultParent = false;
                                        }

                                        if (count == checkParent?.length) {
                                            resultParent = true;
                                        }
                                    }
                                }

                                if (!checkParent) {
                                    if (findUse?.find((item: any, key: any) => key == index)?.key) {
                                        return columnVisibility[findUse?.find((item: any, key: any) => key == index)?.key] == true && (
                                            <td
                                                key={index}
                                                className="px-4 py-2 text-center text-[#464255]"
                                            >
                                                {/* Blank values for keys 1 - 7 */}
                                            </td>
                                        )
                                    }
                                } else if (checkParent) {
                                    if (resultParent == false) {
                                        return (
                                            <td
                                                key={index}
                                                className="px-4 py-2 text-center text-[#464255]"
                                            >
                                                {/* Blank values for keys 1 - 7 */}
                                            </td>
                                        )
                                    }
                                }
                            })}

                            {
                                Object.entries(summedExitRef.current).map((key: any, value: any, index: any) => {
                                    if (key[0] !== "region" && key[0] !== "zone" && (value >= 7 || Number(key[0]) >= 7)) {
                                        const groupSize = updatedHeadersExit[3]?.dates2?.length || 1;
                                        // const isGroupEnd = (value + 1) % groupSize === 0;
                                        // const isGroupEnd = (value - 6) % groupSize === 0;

                                        const isGroupEnd = groupSize > 1 ? (value - 6) % groupSize === 0 : 1;
                                        const col_order_num = groupSize > 1 ? Math.floor((value - 7) / groupSize) : 1

                                        const columnOrder = [
                                            "Capacity Daily Booking (MMBTU/d)",
                                            "Maximum Hour Booking (MMBTU/h)",
                                        ];

                                        const visibilityKey = visibilityMap[columnOrder[col_order_num]];
                                        // if (!columnVisibility[visibilityKey]) {
                                        //     return null;
                                        // }

                                        return (
                                            <td
                                                key={value + "_map_exit"}
                                                className={`px-4 py-2 font-bold text-center text-[#ffffff] ${isGroupEnd ? "border-r-2 border-[#E0E0E0]" : ""} `}
                                            >
                                                {formatNumberThreeDecimal(key[1]) || ""}
                                            </td>
                                        );
                                    }
                                    return null;
                                })
                            }
                        </tr>
                    }

                </tbody>

            </table>
        </div>
    );
};

export default FatherTable;