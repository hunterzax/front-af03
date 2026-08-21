import { useFetchMasters } from "@/hook/fetchMaster"
import { formatDateToDayMonthYear, formatDateToMonthYear, formatDateToMonthYearContractList, formatNumberThreeDecimal, generateDailyRange, generateHeaders, generateMonthlyRange, generateMonthlyRangeNotfix, sortByMonthYear, sumByZone, sumValuesByKey } from "@/utils/generalFormatter"
import { table_col_arrow_sort_style, table_header_style, table_sort_header_style } from "@/utils/styles"
import { useEffect, useState } from "react"

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import dayjs from "dayjs";
import { NumericFormat } from "react-number-format";
import { endOfMonth } from "date-fns";
import { handleSortFatherModify } from "@/utils/sortTable";
import { parse, isAfter, isBefore, isEqual } from 'date-fns';
import SelectFormProps from "@/components/other/selectProps";
import DatePickaForm from "@/components/library/dateRang/dateSelectForm";

type Props = {
    columnVisibility: any
    setcolumnVisibility: any
    initialColumnsDynamic: any
    setinitialColumnsDynamic: any
    data: any
    mode: 'entry' | 'exit'
    originOrSum: 'original' | 'summary'
    dataContract: any
    srchStartdate: any
    srchEnddate: any
    isEditing?: any
    modeEditing?: 'entry' | 'exit' | null
    trickerColumn: boolean
    settrickerColumn: any
    masterColumnsDynamicEntry: any
    masterColumnsDynamicExit: any
    amendContractStartDate: any
    isAmendMode: boolean
    isFinish?: boolean
    handleSave: (data: any) => void
}

const inputClass = "text-[14px] block md:w-full p-2 h-[37px] !w-[110px] border-[1px] bg-white border-[#464255] outline-none bg-opacity-100 focus:border-[#00ADEF]"

const TableModify: React.FC<Props> = ({
    columnVisibility,
    setcolumnVisibility,
    initialColumnsDynamic,
    setinitialColumnsDynamic,
    data,
    mode,
    originOrSum = null,
    dataContract = null,
    srchStartdate = null,
    srchEnddate = null,
    isEditing = null,
    modeEditing = null,
    trickerColumn = false,
    settrickerColumn,
    masterColumnsDynamicEntry,
    masterColumnsDynamicExit,
    amendContractStartDate = null,
    isAmendMode = false,
    isFinish = false,
    handleSave
}) => {
    const { contractPointData } = useFetchMasters();

    const [dataTable, setdataTable] = useState<any>(null);
    const [sortdataTable, setsortdataTable] = useState<any>([]); //เอาไว้ sort data

    // ################## SORTING ##################
    const [sortState, setSortState] = useState({ column: null, direction: null });

    const [logEntry, setlogEntry] = useState<any>(null);
    const [logrExit, setlogExit] = useState<any>(null);

    const [headerEntry, setheaderEntry] = useState<any>(null);
    const [headerExit, setheaderExit] = useState<any>(null);
    const [sortedDataEntry, setSortedDataEntry] = useState<any>(null); // initial sorted data
    const [sortedDataExit, setSortedDataExit] = useState<any>(null); // initial sorted data

    const [summedEntry, setSummedEntry] = useState<any>(null);
    const [summedExit, setSummedExit] = useState<any>(null);

    const [totalResultEntry, settotalResultEntry] = useState<any>(null);
    const [totalResultExit, settotalResultExit] = useState<any>(null);

    const [tomorrowDay, setTomorrowDay] = useState<any>(undefined);
    const [key, setKey] = useState(0);

    useEffect(() => {
        if (tomorrowDay == undefined) {
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() + 1);
            setTomorrowDay(currentDate)
        }
    }, [tomorrowDay])

    useEffect(() => {
        let jsonString: any;

        if (originOrSum == "original") {
            jsonString = data?.booking_full_json[0]?.data_temp;
        } else if (originOrSum == "summary") {
            jsonString = data?.booking_full_json_release[0]?.data_temp ? data?.booking_full_json_release[0]?.data_temp : data?.booking_full_json[0]?.data_temp;
        }

        if (jsonString) {
            let tableVal = JSON.parse(jsonString);

            if (trickerColumn == false) {
                processingData(tableVal, mode);
            }

            const { Entry, ...rest } = tableVal?.headerEntry;
            const res_entry = { ...rest, ...Entry };
            const { key, ["Sub Area"]: subAreaEntry, ...rest_res_entry } = res_entry; // เอา column key ออก

            const { Exit, ...restExit } = tableVal?.headerExit;
            const res_exit = { ...restExit, ...Exit };
            const { key: keyExit, Type, ["Sub Area"]: subArea, ["Block Valve"]: blockValve, ...rest_res_exit } = res_exit;  // เอา column key, Type, Block Valve, Sub Area ออก

            const { entryValue, exitValue } = tableVal;

            const fromDateEntry = mode == 'entry' && srchStartdate ? dayjs(srchStartdate)?.format('DD/MM/YYYY') : entryValue?.[0]?.[5]; // original 33 ---> new 5
            const toDateEntry = mode == 'entry' && srchEnddate ? dayjs(srchEnddate)?.format('DD/MM/YYYY') : entryValue?.[0]?.[6]; // original 34 ---> new 6
            const fromDateExit = mode == 'exit' && srchStartdate ? dayjs(srchStartdate)?.format('DD/MM/YYYY') : exitValue?.[0]?.[5]; // original 33 ---> new 5
            const toDateExit = mode == 'exit' && srchEnddate ? dayjs(srchEnddate)?.format('DD/MM/YYYY') : exitValue?.[0]?.[6]; // original 34 ---> new 6

            if (mode == 'entry') {
                let logresultEntry = generateHeaders(rest_res_entry);
                setlogEntry(logresultEntry);

                setSortedDataEntry(entryValue);

                let sumEntry = sumByZone(entryValue, contractPointData);
                setSummedEntry(sumEntry);

                const resultTotalEntry = sumValuesByKey(sumEntry);
                settotalResultEntry(resultTotalEntry);

                setheaderEntry(updateHeadersLastFive(logresultEntry, fromDateEntry, toDateEntry));
            } else if (mode == 'exit') {
                let logresultExit = generateHeaders(rest_res_exit);
                setlogExit(logresultExit);
                setSortedDataExit(exitValue);
                let sumExit = sumByZone(exitValue, contractPointData);
                setSummedExit(sumExit);

                const resultTotalExit = sumValuesByKey(sumExit);
                settotalResultExit(resultTotalExit);
                setheaderExit(updateHeadersLastTwo(logresultExit, fromDateExit, toDateExit));
            }

            setdataTable(tableVal);
        }
    }, [data])

    const processingData = async (data_val: any, mode: 'entry' | 'exit') => {
        const changeArr = Object.entries(data_val[mode == 'entry' ? "headerEntry" : 'headerExit'])?.map(([txt, data]: any) => {
            let dataArr: any = Object.entries(data)?.map(([date, values]: any) => {
                if (dataContract?.id == 4) {
                    return { key: formatDateToDayMonthYear(date) }
                }

                return { key: formatDateToMonthYear(date) }
            })

            const resultRender: any = dataArr?.filter((item: any) => item?.key !== 'key')
            return {
                key: txt, // In case the key is directly present, not inside an object
                label: txt,
                data: sortByMonthYear(resultRender)
            };
        });

        let convertDataArr: any = null;

        if (mode == 'entry') {
            convertDataArr = changeArr?.filter((item: any) => item?.key !== 'Entry' && item?.key !== 'Period');
        } else if (mode == 'exit') {
            convertDataArr = changeArr?.filter((item: any) => item?.key !== 'Exit' && item?.key !== 'Period');
        }

        if (convertDataArr?.length > 0) {
            let newData: any = [];
            let parentData: any = [];

            if (mode == 'entry') {
                newData = masterColumnsDynamicEntry?.map((item: any) => {
                    return { ...item, visible: columnVisibility[item?.key] }
                })
            } else if (mode == 'exit') {
                newData = masterColumnsDynamicExit?.map((item: any) => {
                    return { ...item, visible: columnVisibility[item?.key] }
                })
            }


            // Iterate over the array once
            for (let i = 0; i < convertDataArr.length; i++) {
                const dataArr = convertDataArr[i]?.data;

                // Filter and reverse the array once
                const filteredData = dataArr?.filter((item: any) => item?.key !== 'key')?.reverse();

                if (filteredData?.length > 0) {
                    let resultRange: any;
                    if (dataContract?.id == 4) {
                        resultRange = filterByDateRange(filteredData, srchStartdate, srchEnddate)
                    } else {
                        resultRange = filterByMonthRange(filteredData, srchStartdate, srchEnddate)
                    }

                    // const filterResult: any = filterByMonthRange(filteredData, srchStartdate, srchEnddate)
                    const filterResult: any = resultRange;

                    for (let ix = 0; ix < filterResult.length; ix++) {
                        const item = filterResult[ix];
                        const key = item?.key;
                        const parentKey = convertDataArr[i]?.key;

                        // Call the render function
                        const result = await renderDateColumnMenu(key, key, parentKey);

                        parentData.push(...result)
                    }
                }
            }

            parentData.reverse()?.map((f: any) => {
                let findIDX: any = newData?.findIndex((item: any) => item?.key == f?.parent_id) + 1;
                let resultLabel: any;

                if (dataContract?.id == 4) {
                    resultLabel = dayjs(f?.label).format?.("DD/MM/YYYY")
                } else {
                    resultLabel = dayjs(f?.label).format?.("MMMM YYYY")
                }

                newData.splice(findIDX, 0,
                    {
                        key: f?.key,
                        label: resultLabel,
                        visible: true,
                        parent_id: f?.parent_id
                    }
                )
            })

            const columnVisibilityMerge = generateColumnVisibility(newData);
            setcolumnVisibility(columnVisibilityMerge);

            setinitialColumnsDynamic(newData);

            settrickerColumn(true);
        }
    }

    // ✅ ฟังก์ชันช่วยแปลงชื่อเดือนให้ถูกต้อง
    const fixMonthAbbreviation = (dateStr: string): string => {
        return dateStr.replace('Sept', 'Sep');
    };

    const filterByDateRange = (
        data: any[],
        startDate: Date | null,
        endDate: Date | null
    ) => {
        const parsedData = data.map((item) => ({
            ...item,
            itemDate: parse(
                fixMonthAbbreviation(item.key), // ✅ แก้ชื่อเดือนก่อน parse
                'dd MMM yyyy',
                new Date()
            )
        }));

        const maxDate = parsedData.reduce((max, item) =>
            item.itemDate > max ? item.itemDate : max,
            parsedData[0]?.itemDate ?? new Date()
        );

        if (startDate && !endDate) {
            return parsedData
                .filter((item) =>
                    (isAfter(item.itemDate, startDate) || isEqual(item.itemDate, startDate)) &&
                    item.itemDate <= maxDate
                )
                .map(({ itemDate, ...rest }) => rest);
        }

        if (!startDate && endDate) {
            return parsedData
                .filter((item) =>
                    isBefore(item.itemDate, endDate) || isEqual(item.itemDate, endDate)
                )
                .map(({ itemDate, ...rest }) => rest);
        }

        if (startDate && endDate) {
            return parsedData
                .filter((item) =>
                    (isAfter(item.itemDate, startDate) || isEqual(item.itemDate, startDate)) &&
                    (isBefore(item.itemDate, endDate) || isEqual(item.itemDate, endDate))
                )
                .map(({ itemDate, ...rest }) => rest);
        }

        return data;
    };


    const filterByMonthRange = (
        data: any[],
        startDate: Date | null,
        endDate: Date | null
    ) => {
        // ✅ แปลง key เป็นวันที่ทั้งหมด
        const parsedData = data.map((item) => ({
            ...item,
            itemDate: new Date(`1 ${item.key}`)
        }));

        // ✅ หา "วันที่มากที่สุด" จากข้อมูล
        const maxDate = parsedData.reduce((max, item) =>
            item.itemDate > max ? item.itemDate : max,
            parsedData[0]?.itemDate ?? new Date()
        );

        // ✅ กรณีมีแค่ startDate
        if (startDate && !endDate) {
            const start = startOfMonth(startDate);
            return parsedData
                .filter((item) =>
                    item.itemDate >= start && item.itemDate <= maxDate
                )
                .map(({ itemDate, ...rest }) => rest); // ลบ itemDate ออก
        }

        // ✅ กรณีมีแค่ endDate
        if (!startDate && endDate) {
            const end = startOfMonth(endDate);
            return parsedData
                .filter((item) => item.itemDate <= end)
                .map(({ itemDate, ...rest }) => rest);
        }

        // ✅ มีทั้ง startDate และ endDate
        if (startDate && endDate) {
            const start = startOfMonth(startDate);
            const end = startOfMonth(endDate);
            return parsedData
                .filter((item) =>
                    item.itemDate >= start && item.itemDate <= end
                )
                .map(({ itemDate, ...rest }) => rest);
        }

        // ✅ ไม่มีอะไรเลย → return ทั้งหมด
        return data;
    };

    // Helper to get 1st of the month for comparison
    const startOfMonth = (date: Date): Date => {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    };

    const generateColumnVisibility = (columns: any) => Object.fromEntries(columns.map(({ key, visible }: any) => [key, visible]));

    const renderDateColumnMenu = async (key: any, label: any, parent?: any) => {
        const newData: any = [];

        if (parent) {
            let findObject: any = initialColumnsDynamic?.find((item: any) => item?.label == parent);

            if (findObject) {
                newData.push(
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

        return newData
    }

    function updateHeadersLastFive(headerss: any[], fromDate: string, toDate: string) {
        let newDates: any;

        // ✅ ขยาย toDate ให้ครอบคลุมถึงสิ้นเดือน
        const [d, m, y] = toDate?.split('/')?.map(Number);
        const toDateObj = new Date(y, m - 1, d);
        if (dataContract?.id === 4) {
            toDateObj.setDate(toDateObj.getDate() + 1);
        } else {
            toDateObj.setMonth(toDateObj.getMonth() + 1);
        }
        const extendedToDate = toDateObj.toLocaleDateString('en-GB'); // '01/01/2026'

        // ✅ Generate date range
        if (dataContract?.id === 4) {
            newDates = generateDailyRange(fromDate, extendedToDate);
        } else {
            newDates = generateMonthlyRange(fromDate, extendedToDate);
        }
        const updatedHeaders = headerss?.map((header, index) => {
            if (index >= headerss.length - 4) {
                // ✅ Map value → key
                const existingMap = new Map(
                    (header.dates2 ?? []).map((d: any) => [d.value, d.key])
                );

                const updatedDates2 = newDates
                    .map((date: string) => {
                        const existingKey = existingMap.get(date);
                        if (!existingKey) return null; // ❌ ไม่มี key เดิม = ไม่เอา
                        return {
                            label: date,
                            key: existingKey,
                            value: date,
                        };
                    })
                    .filter(Boolean); // ตัด null ออก

                return {
                    ...header,
                    dates: updatedDates2.map((d: any) => d.value), // sync dates
                    dates2: updatedDates2,
                    key: header.key,
                };
            }

            return header;
        });

        return updatedHeaders;
    }

    function updateHeadersLastTwo(headerss: any[], fromDate: string, toDate?: string) {
        let newDates: any;

        // ✅ ถ้าไม่มี toDate → ใช้วันที่มากที่สุดใน headerss
        if (!toDate) {
            const allDates = headerss
                .flatMap(header => header?.dates2 ?? [])
                .map((d: any) => d?.value)
                .filter(Boolean);

            const maxDate = allDates.reduce((latest: string, current: string) => {
                const d1 = dayjs(current, 'DD/MM/YYYY');
                const d2 = dayjs(latest, 'DD/MM/YYYY');
                return d1.isAfter(d2) ? current : latest;
            }, allDates[0]);

            toDate = maxDate;
        }

        // ✅ ขยาย toDate อีก 1 เดือน
        const [d, m, y]: any = toDate?.split('/').map(Number);
        const toDateObj = new Date(y, m - 1, d);
        if (dataContract?.id === 4) {
            toDateObj.setDate(toDateObj.getDate() + 1);
        } else {
            toDateObj.setMonth(toDateObj.getMonth() + 1);
        }
        // toDateObj.setMonth(toDateObj.getMonth() + 1);
        const extendedToDate = toDateObj.toLocaleDateString('en-GB');

        // ✅ สร้าง range
        if (dataContract?.id === 4) {
            newDates = generateDailyRange(fromDate, extendedToDate);
        } else {
            newDates = generateMonthlyRange(fromDate, extendedToDate);
        }

        const updatedHeaders = headerss?.map((header, index) => {
            if (index >= headerss.length - 2) {
                const existingMap = new Map(
                    (header.dates2 ?? []).map((d: any) => [d.value, d.key])
                );

                const updatedDates2 = newDates
                    .map((date: string) => {
                        const existingKey = existingMap.get(date);
                        if (!existingKey) return null; // ❌ ถ้าไม่มี key เดิม ไม่เพิ่ม
                        return {
                            label: date,
                            key: existingKey,
                            value: date,
                        };
                    })
                    .filter(Boolean); // ลบ entry ที่ไม่มี key ออก

                return {
                    ...header,
                    dates: updatedDates2.map((d: any) => d.value), // sync dates ด้วย
                    dates2: updatedDates2,
                    key: header.key,
                };
            }

            return header;
        });

        return updatedHeaders;
    }

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    const functionControlcolSpan = (header: any, mode: 'date' | 'sub_header') => {
        if (mode == 'date') {
            let checkDate: any = []; //สำหรับเอา data มาใช้ในการ hide column
            let findKey: any = initialColumnsDynamic?.find((item: any) => item?.label == header?.label); //หา parent ที่ถูกต้องของข้อมูล

            if (header?.subHeaders?.length > 0) {
                let dataSub: any = header?.subHeaders; //สำหรับเอา data ทั้งหมดของหัวข้อที่ map มา
                if (dataSub) {
                    let pathKey: any = findKey?.key

                    for (let index = 0; index < dataSub?.length; index++) {
                        if (columnVisibility[pathKey] == false) {
                            checkDate.push({
                                key: dataSub[index]?.key,
                                active: false,
                                parent: pathKey
                            })
                        } else if (columnVisibility[pathKey] == true) {
                            checkDate.push({
                                key: dataSub[index]?.key,
                                active: true,
                                parent: pathKey
                            })
                        }
                    }
                }
            } else {
                let dataDate: any = header?.dates; //สำหรับเอา data ทั้งหมดของหัวข้อที่ map มา
                if (dataDate) {
                    for (let index = 0; index < dataDate?.length; index++) {
                        let pathKey: any;
                        if (dataContract?.id == 4) {
                            pathKey = findKey?.key + "_" + formatDateToDayMonthYear(dataDate[index])
                        } else {
                            pathKey = findKey?.key + "_" + formatDateToMonthYear(dataDate[index]); //กำหนด key ของ menu โดยใช้ parent id ของหัว table + กับวันที่
                        }

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

                            let resultKey: any;
                            if (dataContract?.id == 4) {
                                resultKey = formatDateToDayMonthYear(dataDate[index])
                            } else {
                                resultKey = formatDateToMonthYear(dataDate[index])
                            }

                            if (columnVisibility[pathKey] == false) {// กรณีถ้า data เป็น date ปกติ
                                checkDate.push({
                                    key: resultKey,
                                    active: false,
                                    parent: header?.label
                                })
                            } else if (columnVisibility[pathKey] == true) {
                                checkDate.push({
                                    key: resultKey,
                                    active: true,
                                    parent: header?.label
                                })
                            }
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

    const sortDatesAsc = (dates: string[]): string[] => {
        return dates.sort((a: string, b: string) => new Date(a).getTime() - new Date(b).getTime());
    };

    const editdataTable = (
        rowid: any, //id ของ data
        colid: any, //id ของ data
        value: any, //value ที่ใส่
        mode: 'entry' | 'exit',
        type?: 'input' | 'date' | ''
    ) => {

        function getDateRange(from: any, to: any) {
            const [fromDay, fromMonth, fromYear] = from.split('/').map(Number);
            const [toDay, toMonth, toYear] = to.split('/').map(Number);

            const fromDate = new Date(fromYear, fromMonth - 1, fromDay);
            const toDate = new Date(toYear, toMonth - 1, toDay);

            // ลด toDate ลง 1 วัน
            toDate.setDate(toDate.getDate() - 1);

            const dateArray = [];

            const currentDate = new Date(fromDate);

            while (currentDate <= toDate) {
                const day = String(currentDate.getDate()).padStart(2, '0');
                const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                const year = currentDate.getFullYear();

                dateArray.push(`${day}/${month}/${year}`);

                currentDate.setDate(currentDate.getDate() + 1);
            }

            return dateArray;
        }

        if (mode == 'entry') {
            const new_entryValue = sortedDataEntry;
            // entryValue[rowid]?.[colid]

            new_entryValue[rowid][colid] = value
            if (type == 'date') {
                let genarateFrom: any = new_entryValue[rowid][5];
                let genarateTo: any = new_entryValue[rowid][6];

                let genarateDate: any = getDateRange(genarateFrom, genarateTo);
                let new_headerEntry: any = [];
                let startKey = 6;
                for (let index = 0; index < headerEntry.length; index++) {
                    if (headerEntry[index]?.dates?.length > 0 && headerEntry[index]?.label !== "Period") {

                        let genarateDate2: any = genarateDate?.map((item: any, idx: any) => {
                            startKey = startKey + 1
                            return { label: item, key: String(startKey), value: item }
                        })

                        let getkeypath: any = (startKey - genarateDate?.length) + 1;

                        new_headerEntry.push({
                            label: headerEntry[index]?.label,
                            key: String(getkeypath),
                            subHeaders: headerEntry[index]?.subHeaders,
                            dates: genarateDate,
                            dates2: genarateDate2,
                        })
                    } else {
                        new_headerEntry.push(headerEntry[index])
                    }
                }
                
                setheaderEntry(new_headerEntry)
                setSortedDataEntry(new_entryValue);
            }
        } else if (mode == 'exit') {
            // let logresultExit = generateHeaders(rest_res_exit);
            // setlogExit(logresultExit);
            // setSortedDataExit(exitValue);
            // let sumExit = sumByZone(exitValue, contractPointData);
            // setSummedExit(sumExit);

            // const resultTotalExit = sumValuesByKey(sumExit);
            // settotalResultExit(resultTotalExit);
            // setheaderExit(updateHeadersLastTwo(logresultExit, fromDateExit, toDateExit));
        }

        setKey((prevKey) => prevKey + 1);
    }

    useEffect(() => {
        if (isFinish == true) {
            let datasave: any = {
                data: dataTable,
                mode: mode
            }
            handleSave(datasave)
        }
    }, [isFinish])

    return (
        <div className="overflow-auto rounded-t-md">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-[#ffffff] bg-[#1473A1] border-[#1473A1] sticky top-0 z-10">
                    <tr className="h-9">
                        {columnVisibility?.zone && (
                            <th
                                scope="col"
                                rowSpan={2}
                                className={`${table_sort_header_style}  border-none text-center bg-[#1473A1]`}
                            >
                                {`Zone`}
                            </th>
                        )}

                        {columnVisibility?.area && (
                            <th
                                scope="col"
                                rowSpan={2}
                                className={`${table_sort_header_style}  border-none text-center bg-[#1473A1]`}
                            >
                                {`Area`}
                            </th>
                        )}

                        {columnVisibility?.contract_point && (
                            <th
                                scope="col"
                                rowSpan={2}
                                className={`${table_sort_header_style}  border-none text-center bg-[#1473A1]`}
                            >
                                {`Contract Point`}
                            </th>
                        )}

                        {
                            mode == 'entry' ? (
                                headerEntry?.map((header: any, index: any) => {
                                    const visibilityKey = visibilityMap[header.label];

                                    const checkDate: any = functionControlcolSpan(header, 'date'); //example here only data == date
                                    const getCol: any = checkDate?.filter((item: any) => item?.active == false)?.length > 0 ? checkDate?.filter((item: any) => item?.active == true)?.length : header.dates && header.dates.length > 0 ? header.dates.length : header.subHeaders ? header.subHeaders.length : 1

                                    if (header?.label == "Period") {
                                        const getPeriod = header?.dates;
                                        return (
                                            getPeriod?.map((item: any, idx: number) => {
                                                return (columnVisibility[item] && (
                                                    <th
                                                        key={`period-${item}-${idx}`}
                                                        rowSpan={2}
                                                        className={`${["Zone", "Area", "Entry Meter ID", "Contract Point", "New Point"].includes(header.label) ? table_sort_header_style : table_header_style} text-center w-[100px] border-r-2 border-gray-300`}
                                                    >
                                                        {item}
                                                    </th>
                                                ))
                                            })
                                        )
                                    }

                                    if (!columnVisibility[visibilityKey]) {
                                        return null
                                    }

                                    return (
                                        <th
                                            key={index}
                                            colSpan={getCol}
                                            // colSpan={1}
                                            className={`${["Zone", "Area", "Entry Meter ID", "Contract Point", "New Point"].includes(header.label) ? table_sort_header_style : table_header_style} text-center w-[100px] border-r-2 border-gray-300`}
                                        >
                                            {
                                                header.label == "Pressure Range" ? 'Pressure Range (PSIG)' : header.label == "Temperature Range" ? 'Temperature Range (Deg. F)' : header.label
                                            }
                                            {["Zone", "Area", "Entry Meter ID", "Contract Point", "New Point"].includes(header.label) && getArrowIcon("entry_item" + index)}
                                        </th>
                                    )
                                })
                            )
                                :
                                mode == 'exit' &&
                                headerExit?.map((header: any, index: any) => {
                                    const visibilityKey = visibilityMap[header.label];

                                    const checkDate: any = functionControlcolSpan(header, 'date'); //example here only data == date
                                    const getCol: any = checkDate?.filter((item: any) => item?.active == false)?.length > 0 ? checkDate?.filter((item: any) => item?.active == true)?.length : header.dates && header.dates.length > 0 ? header.dates.length : header.subHeaders ? header.subHeaders.length : 1

                                    if (header?.label == "Period") {
                                        const getPeriod = header?.dates;
                                        return (
                                            getPeriod?.map((item: any, idx: number) => {
                                                return (columnVisibility[item] && (
                                                    <th
                                                        key={`period-${item}-${idx}`}
                                                        rowSpan={2}
                                                        className={`${["Zone", "Area", "Entry Meter ID", "Contract Point", "New Point"].includes(header.label) ? table_sort_header_style : table_header_style} text-center w-[100px] border-r-2 border-gray-300`}
                                                    >
                                                        {item}
                                                    </th>
                                                ))
                                            })
                                        )
                                    }

                                    if (!columnVisibility[visibilityKey]) {
                                        return null
                                    }

                                    return (
                                        <th
                                            key={index}
                                            // colSpan={checkDate?.filter((item: any) => item?.active == true)?.length}
                                            colSpan={getCol}
                                            className={`${["Zone", "Area", "Exit Meter ID", "Contract Point", "New Point"].includes(header.label) ? table_sort_header_style : table_header_style} border-r-2 border-gray-300 text-center w-[100px]`}
                                        >
                                            {
                                                header?.label == "Pressure Range" ? 'Pressure Range (PSIG)' : header.label == "Temperature Range" ? 'Temperature Range (Deg. F)' : header.label
                                            }
                                            {["Zone", "Area", "Exit Meter ID", "Contract Point", "New Point"].includes(header.label) && getArrowIcon("exit_item" + index)}
                                        </th>
                                    )
                                })
                        }
                    </tr>

                    {/* SUB HEADER หรือ header row ที่สอง */}
                    <tr className="h-9">

                        {mode == "entry" ?
                            headerEntry?.map((header: any, index: any) => {
                                const visibilityKey = visibilityMap[header.label];
                                if (!columnVisibility[visibilityKey]) {
                                    return null
                                }

                                let findKey: any = initialColumnsDynamic?.find((item: any) => item?.label == header?.label);
                                const checkDate: any = functionControlcolSpan(header, 'date'); //example here only data == date
                                const checkSubheader: any = functionControlcolSpan(header, 'sub_header'); //example here only data == sub_header

                                return (
                                    header?.dates ? (
                                        sortDatesAsc([...header.dates]).map((date: any, dateIndex: any, arr: any) => { // Sort before rendering

                                            if (date == 'From' || date == 'To') {
                                                return null
                                            }

                                            return (
                                                columnVisibility[findKey?.key + "_" + formatDateToMonthYear(date)] || columnVisibility[findKey?.key + "_" + formatDateToDayMonthYear(date)]) && (
                                                    <th
                                                        key={`${index}-${dateIndex}`}
                                                        // className={`${table_sort_header_style} text-center bg-[#00ADEF] ${dateIndex === arr.length - 1 ? "border-r-2 border-gray-300" : ""}`}
                                                        // colSpan={1}
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
                                                        {/* {dataContract?.id == 4 ? formatDateToDayMonthYear(date) : formatDateToMonthYear(date)} */}
                                                        {dataContract?.id == 4 ? date : formatDateToMonthYearContractList(date)}
                                                        {getArrowIcon("entry_date" + dateIndex)}
                                                    </th>
                                                )
                                        })
                                    ) : header?.subHeaders && header?.subHeaders.length > 0 ? (
                                        header?.subHeaders.map((subHeader: any, subIndex: any, arr: any) => (
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
                            : mode == "exit" && headerExit?.map((header: any, index: any) => {
                                const visibilityKey = visibilityMap[header.label];
                                if (!columnVisibility[visibilityKey]) {
                                    return null
                                }

                                let findKey: any = initialColumnsDynamic?.find((item: any) => item?.label == header?.label);
                                const checkDate: any = functionControlcolSpan(header, 'date'); //example here only data == date
                                const checkSubheader: any = functionControlcolSpan(header, 'sub_header'); //example here only data == sub_header
                                return (
                                    header.dates ? (
                                        sortDatesAsc([...header?.dates]).map((date: any, dateIndex: any, arr: any) => { // Sort before rendering
                                            if (date == 'From' || date == 'To') {
                                                return null
                                            }

                                            return (
                                                columnVisibility[findKey?.key + "_" + formatDateToMonthYear(date)] || columnVisibility[findKey?.key + "_" + formatDateToDayMonthYear(date)]) && (
                                                    <th
                                                        key={`${index}-${dateIndex}`}
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
                                                    // onClick={() => handleSort("supply_reference_quality_area", sortState, setSortState, setSortedData, tableData)}
                                                    // onClick={() => handleSortFatherModify("exit_date" + formatDateToMonthYear(date), findKey?.key,  sortedDataExit, dateIndex)}
                                                    >
                                                        {/* {formatDateToMonthYear(date)} */}
                                                        {/* {dataContract?.id == 4 ? formatDateToDayMonthYear(date) : formatDateToMonthYear(date)} */}
                                                        {dataContract?.id == 4 ? date : formatDateToMonthYearContractList(date)}

                                                        {getArrowIcon("exit_date" + dateIndex)}
                                                    </th>
                                                )
                                        })
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
                        mode == "entry" ? sortedDataEntry?.map((row: any, rowIndex: any) => {
                            return (
                                <tr key={rowIndex} className="hover:bg-gray-50">
                                    {/* ZONE */}
                                    {columnVisibility?.zone && (
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
                                    {columnVisibility?.area && (
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
                                    {columnVisibility?.contract_point && (
                                        <td
                                            key={`10002`}
                                            className="px-4 py-2 border-b border-gray-300 text-center text-[#464255]"
                                        >
                                            {isEditing ? (
                                                <SelectFormProps
                                                    id={'area_id'}
                                                    disabled={false}
                                                    valueWatch={row?.[0]}
                                                    handleChange={(e) => {
                                                        const value: any = e?.target?.value
                                                        editdataTable(rowIndex, 0, value, mode, 'input')
                                                    }}
                                                    errorsText={'Select Contract Point'}
                                                    options={contractPointData?.data?.filter((item: any) => item?.entry_exit_id === 1)}
                                                    optionsKey={'id'}
                                                    optionsValue={'contract_point'}
                                                    optionsText={'contract_point'}
                                                    optionsResult={'contract_point'}
                                                    placeholder={'Select Contract Point'}
                                                    pathFilter={'contract_point'}
                                                />
                                            )
                                                :
                                                (
                                                    row?.[0]
                                                )}

                                        </td>
                                    )}

                                    {headerEntry?.map((header: any, colIndex: any) => {
                                        const visibilityKey = visibilityMap[header.label];

                                        // Check if the header has dates
                                        if (header?.dates && header?.dates?.length > 0) {
                                            let findKey: any = initialColumnsDynamic?.find((item: any) => item?.label == header?.label);
                                            const checkDate: any = functionControlcolSpan(header, 'date'); //example here only data == date

                                            return (header?.dates2?.map((date: any, dateIndex: any, arr: any) => {
                                                return (
                                                    date?.value == 'From' || date?.value == 'To' ?
                                                        columnVisibility[formatDateToMonthYear(date?.value)] && (
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
                                                                            "border-r-2 border-gray-300" : ""}`}
                                                            >
                                                                {isEditing ? (
                                                                    <DatePickaForm
                                                                        key={"start" + key}
                                                                        readOnly={false} // amend ก็เปิดให้แก้ไขได้
                                                                        placeHolder="Select Date"
                                                                        mode={'edit-table'}
                                                                        valueShow={
                                                                            date?.value == 'From' ? isAmendMode && rowIndex == 5 ? dayjs(amendContractStartDate, "YYYY-MM-DD").format("DD/MM/YYYY") : row[5] !== undefined ? row[5] : dayjs().format("DD/MM/YYYY") :
                                                                                date?.value == 'To' && isAmendMode && rowIndex == 6 ? dayjs(amendContractStartDate, "YYYY-MM-DD").format("DD/MM/YYYY") : row[6] !== undefined ? row[6] : dayjs().format("DD/MM/YYYY")
                                                                        } // ถ้า isAmendMode == true กำหนด date.key == 5 ให้ใช้วันที่ amendNewContractStartDate ลงใน valueShow
                                                                        min={tomorrowDay || undefined}
                                                                        allowClear
                                                                        onChange={(e: any) => {
                                                                            const formattedNewDate = e ? dayjs(e).format("DD/MM/YYYY") : undefined;
                                                                            const currentDate = date?.value == 'From' ? row[5] : date?.value == 'To' && row[6];
                                                                            const hasDateChanged = formattedNewDate !== currentDate;

                                                                            if (date?.value == 'From') {
                                                                                editdataTable(rowIndex, 5, formattedNewDate, mode, 'date')
                                                                            } else if (date?.value == 'To') {
                                                                                editdataTable(rowIndex, 6, formattedNewDate, mode, 'date')
                                                                            }

                                                                            if (hasDateChanged) {
                                                                                // setIsDateChange(true);
                                                                            } else {
                                                                                // Set the flag to false if the new date is the same as the current one
                                                                                // setIsDateChange(false);
                                                                            }
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    formatNumberThreeDecimal(row[date.key]) || ''
                                                                )}
                                                            </td>
                                                        )
                                                        : (columnVisibility[findKey?.key + "_" + formatDateToMonthYear(date?.value)] || columnVisibility[findKey?.key + "_" + formatDateToDayMonthYear(date?.value)]) && (
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
                                                                {isEditing ? (
                                                                    <NumericFormat
                                                                        value={row[date.key] || ''}
                                                                        onValueChange={(values) => {
                                                                            const { value } = values;

                                                                            // // editdataTable(rowIndex, 2, value, mode)
                                                                            editdataTable(rowIndex, date?.key, value, mode, 'input')
                                                                        }}
                                                                        thousandSeparator=","
                                                                        decimalScale={3}
                                                                        fixedDecimalScale={true}
                                                                        allowNegative={false}
                                                                        className={`${inputClass} text-right`}
                                                                    />
                                                                )
                                                                    : (
                                                                        formatNumberThreeDecimal(row[date.key]) || ''
                                                                        // "X"
                                                                    )}
                                                            </td>
                                                        )
                                                )
                                            }));
                                        } else if (header?.subHeaders && header?.subHeaders?.length > 0) {
                                            // ตรงนี้ render Pressure Range | Temperature Range () => Min, Max

                                            const checkSubheader: any = functionControlcolSpan(header, 'sub_header'); //example here only data == sub_header

                                            return header?.subHeaders.map((subHeader: any, subIndex: any, arr: any) => {
                                                return (
                                                    columnVisibility[subHeader?.key] && (
                                                        <td
                                                            key={`${colIndex}-${subIndex}`}
                                                            colSpan={
                                                                checkSubheader?.filter((item: any) => item?.active == false)?.length > 0 ? 2 : 1
                                                            }
                                                            className={`px-4 py-2 border-b border-gray-300 text-center text-[#464255] ${subIndex === arr.length - 1 ? "border-r-2 border-[#E0E0E0]" : checkSubheader?.filter((item: any) => item?.active == false)?.length > 0 ? "border-r-2 border-[#E0E0E0]" : ""}`}
                                                        >
                                                            {/* {row[subHeader?.value] || ''} */}
                                                            {isEditing ? (
                                                                <NumericFormat
                                                                    value={
                                                                        header?.label == 'Pressure Range' ? (
                                                                            subHeader?.label == 'Min' ? row[1] :
                                                                                subHeader?.label == 'Max' && row[2]
                                                                        ) : header?.label == 'Temperature Range' && (
                                                                            subHeader?.label == 'Min' ? row[3] :
                                                                                subHeader?.label == 'Max' && row[4]
                                                                        )
                                                                    }
                                                                    onValueChange={(values) => {
                                                                        const { value } = values;

                                                                        if (header?.label == 'Pressure Range') {
                                                                            if (subHeader?.label == 'Min') {
                                                                                editdataTable(rowIndex, 1, value, mode, 'input')
                                                                            } else if (subHeader?.label == 'Max') {
                                                                                editdataTable(rowIndex, 2, value, mode, 'input')
                                                                            }
                                                                        } else if (header?.label == 'Temperature Range') {
                                                                            if (subHeader?.label == 'Min') {
                                                                                editdataTable(rowIndex, 3, value, mode, 'input')
                                                                            } else if (subHeader?.label == 'Max') {
                                                                                editdataTable(rowIndex, 4, value, mode, 'input')
                                                                            }
                                                                        }
                                                                    }}
                                                                    thousandSeparator=","
                                                                    decimalScale={3}
                                                                    fixedDecimalScale={true}
                                                                    allowNegative={false}
                                                                    className={`${inputClass} `}
                                                                    style={{
                                                                        textAlign: "right",
                                                                        width: "100%",
                                                                    }}
                                                                />
                                                            ) : (
                                                                header?.label == 'Pressure Range' ? (
                                                                    subHeader?.label == 'Min' ?
                                                                        row?.[1] !== null && row?.[1] !== undefined && row?.[1] !== '' ? formatNumberThreeDecimal(Number(String(row?.[1]).replace(/,/g, '').trim())) : ''
                                                                        : subHeader?.label == 'Max' &&
                                                                            row?.[2] !== null && row?.[2] !== undefined && row?.[2] !== '' ? formatNumberThreeDecimal(Number(String(row?.[2]).replace(/,/g, '').trim())) : ''
                                                                ) : header?.label == 'Temperature Range' && (
                                                                    subHeader?.label == 'Min' ?
                                                                        row?.[3] !== null && row?.[3] !== undefined && row?.[3] !== '' ? formatNumberThreeDecimal(Number(String(row?.[3]).replace(/,/g, '').trim())) : ''
                                                                        : subHeader?.label == 'Max' &&
                                                                            row?.[4] !== null && row?.[4] !== undefined && row?.[4] !== '' ? formatNumberThreeDecimal(Number(String(row?.[4]).replace(/,/g, '').trim())) : ''
                                                                )

                                                            )}
                                                        </td>
                                                    )
                                                )
                                            })
                                        }
                                    })}
                                </tr>
                            )
                        })
                            : mode == "exit" && sortedDataExit?.map((row: any, rowIndex: any) => (
                                <tr key={rowIndex} className="hover:bg-gray-50">

                                    {/* ZONE */}
                                    {columnVisibility.zone && (
                                        <td
                                            key={`20000` + rowIndex}
                                            className="px-4 py-2 border-b border-gray-300 text-center text-[#464255]"
                                        >
                                            {(() => {
                                                const rows: any = row["0"] ? row["0"]?.trim() : null;
                                                const filter_contract_point = contractPointData?.data?.find((item: any) => item?.contract_point === rows);

                                                if (rows && filter_contract_point) {
                                                    return (
                                                        <div
                                                            className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]"
                                                            style={{ backgroundColor: filter_contract_point?.zone?.color }}
                                                        >
                                                            {filter_contract_point?.zone?.name}
                                                        </div>
                                                    )
                                                } else {
                                                    return null
                                                }
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

                                    {headerExit?.map((header: any, colIndex: any) => {
                                        const visibilityKey = visibilityMap[header?.label];
                                        // Check if the header has dates
                                        if (header.dates && header.dates.length > 0) {
                                            let findKey: any = initialColumnsDynamic?.find((item: any) => item?.label == header?.label);
                                            const checkDate: any = functionControlcolSpan(header, 'date'); //example here only data == date
                                            return (header?.dates2.map((date: any, dateIndex: any, arr: any) => {
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
                                                                            {/* <DatePickaForm
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
                                                                            /> */}
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

                                                        //DATE
                                                        : (columnVisibility[findKey?.key + "_" + formatDateToMonthYear(date?.value)] || columnVisibility[findKey?.key + "_" + formatDateToDayMonthYear(date?.value)]) && (
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
                                                                            {/* <DatePickaForm
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
                                                                            /> */}
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
                                        } else if (header?.subHeaders && header?.subHeaders.length > 0) {
                                            // Render data for columns with subHeaders
                                            // ตรงนี้ render Min, Max
                                            const checkSubheader: any = functionControlcolSpan(header, 'sub_header'); //example here only data == sub_header
                                            return header?.subHeaders.map((subHeader: any, subIndex: any, arr: any) => (

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
                                                            subHeader?.label == 'Min' ?
                                                                row?.[1] !== null && row?.[1] !== undefined && row?.[1] !== '' ? formatNumberThreeDecimal(Number(String(row?.[1]).replace(/,/g, '').trim())) : ''
                                                                : subHeader?.label == 'Max' &&
                                                                    row?.[2] !== null && row?.[2] !== undefined && row?.[2] !== '' ? formatNumberThreeDecimal(Number(String(row?.[2]).replace(/,/g, '').trim())) : ''
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
                        mode == "entry" && summedEntry?.length > 0 && summedEntry?.map((entry: any, rowIndex: any) => {

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

                                    {(() => {
                                        const dataKeys = Object.keys(entry)
                                            .filter((k) => k !== "region" && k !== "zone" && Number(k) >= 7)
                                            .sort((a, b) => Number(a) - Number(b));

                                        const groupSize = headerEntry[3]?.dates2?.length || 1;

                                        const columnOrder = [
                                            "Capacity Daily Booking (MMBTU/d)",
                                            "Maximum Hour Booking (MMBTU/h)",
                                            "Capacity Daily Booking (MMscfd)",
                                            "Maximum Hour Booking (MMscfh)"
                                        ];

                                        const findKeyFromColumns = (data: any, key: string, columns: string[]): any => {
                                            for (let index = 0; index < columns?.length; index++) {
                                                const items = data?.headerEntry?.[columns[index]];

                                                const optionarray = Object.keys(items)?.map((date) => {
                                                    const value = items[date]; // value จะเป็น { key: string }
                                                    return {
                                                        date,
                                                        key: value?.key || null,
                                                    };
                                                });

                                                const found = optionarray?.find((item: any) => item?.key === key);

                                                if (found) {
                                                    let findKey: any = initialColumnsDynamic?.find((item: any) => item?.label == columns[index]);
                                                    if (dataContract?.id == 4) {
                                                        const date = dayjs(found?.date, 'DD/MM/YYYY');
                                                        const formatted = dayjs(date).format('DD MMM YYYY').replace('Sep', 'Sept');
                                                        return {
                                                            date: date,
                                                            key: found?.key,
                                                            parent_id: findKey?.key + "_" + formatted,
                                                        };
                                                    }

                                                    const date = dayjs(found?.date, 'DD/MM/YYYY');
                                                    const formatted = dayjs(date)?.format('MMM YYYY');
                                                    return {
                                                        date: date,
                                                        key: found?.key,
                                                        parent_id: findKey?.key + "_" + formatted,
                                                    };
                                                }
                                            }
                                        };

                                        // การจัดกลุ่มโดยอิงจาก headerExit และ columnOrder
                                        return dataKeys?.map((key, dataIndex) => {
                                            const col_order_num = Math.floor(dataIndex / groupSize); // หาจำนวนกลุ่มใน columnOrder
                                            const getKey = findKeyFromColumns(dataTable, key, columnOrder);


                                            const visibilityKey = getKey?.parent_id;

                                            if (!columnVisibility[visibilityKey]) return null;

                                            // ตรวจสอบตำแหน่งในกลุ่มของ headerExit
                                            const groupStartIndex = Math.floor(dataIndex / groupSize) * groupSize;
                                            const currentGroup = dataKeys.slice(groupStartIndex, groupStartIndex + groupSize);
                                            const isFirstInGroup = dataIndex === groupStartIndex; // คอลัมน์แรกในกลุ่ม
                                            const isLastInGroup = dataIndex === groupStartIndex + currentGroup.length - 1; // คอลัมน์สุดท้ายในกลุ่ม

                                            // หากเป็นคอลัมน์แรกในกลุ่มจะมีสีเหลืองและเส้น
                                            const shouldApplyYellowAndBorder = isFirstInGroup;
                                            // หากเป็นคอลัมน์สุดท้ายในกลุ่มจะมีเส้นขวา
                                            const shouldApplyRightBorder = isLastInGroup;

                                            return (
                                                <td
                                                    key={key + "_map_sum_exit"}
                                                    className={`px-4 py-2 border-b font-bold border-gray-300 text-center text-[#464255] 
                                                        ${shouldApplyYellowAndBorder ? "border-l-2 border-[#E0E0E0]" : ""} 
                                                        ${shouldApplyRightBorder ? "border-r-2 border-[#E0E0E0]" : ""}`} // เพิ่ม border ขวา
                                                >
                                                    {formatNumberThreeDecimal(entry[key]) || ""}
                                                </td>
                                            );
                                        });
                                    })()}
                                </tr>
                            )
                        })
                    }

                    {/* ############### SUMMARY EXIT ############### */}
                    {
                        mode == "exit" && summedExit?.length > 0 && summedExit?.map((exit: any, rowIndex: any) => {
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

                                    {(() => {
                                        const dataKeys = Object.keys(exit)
                                            .filter((k) => k !== "region" && k !== "zone" && Number(k) >= 7)
                                            .sort((a, b) => Number(a) - Number(b));

                                        const groupSize = headerExit[3]?.dates2?.length || 1;

                                        const columnOrder: any = [
                                            "Capacity Daily Booking (MMBTU/d)",
                                            "Maximum Hour Booking (MMBTU/h)",
                                        ];

                                        const findKeyFromColumns = (data: any, key: string, columns: string[]): any => {
                                            for (let index = 0; index < columns?.length; index++) {
                                                const items = data?.headerExit?.[columns[index]];

                                                const optionarray = Object.keys(items)?.map((date) => {
                                                    const value = items[date]; // value จะเป็น { key: string }
                                                    return {
                                                        date,
                                                        key: value?.key || null,
                                                    };
                                                });

                                                const found = optionarray.find((item: any) => item?.key === key);

                                                if (found) {
                                                    let findKey: any = initialColumnsDynamic?.find((item: any) => item?.label == columns[index]);
                                                    if (dataContract?.id == 4) {
                                                        const date = dayjs(found?.date, 'DD/MM/YYYY');
                                                        const formatted = dayjs(date).format('DD MMM YYYY').replace('Sep', 'Sept');
                                                        return {
                                                            date: date,
                                                            key: found?.key,
                                                            parent_id: findKey?.key + "_" + formatted,
                                                        };
                                                    }
                                                    const date = dayjs(found?.date, 'DD/MM/YYYY');
                                                    const formatted = dayjs(date)?.format('MMM YYYY');
                                                    return {
                                                        date: date,
                                                        key: found?.key,
                                                        parent_id: findKey?.key + "_" + formatted,
                                                    };
                                                }
                                            }
                                        };

                                        // การจัดกลุ่มโดยอิงจาก headerExit และ columnOrder
                                        return dataKeys?.map((key, dataIndex) => {
                                            const col_order_num = Math.floor(dataIndex / groupSize); // หาจำนวนกลุ่มใน columnOrder
                                            const getKey = findKeyFromColumns(dataTable, key, columnOrder);

                                            const visibilityKey = getKey?.parent_id;
                                            if (!columnVisibility[visibilityKey]) return null;

                                            // ตรวจสอบตำแหน่งในกลุ่มของ headerExit
                                            const groupStartIndex = Math.floor(dataIndex / groupSize) * groupSize;
                                            const currentGroup = dataKeys.slice(groupStartIndex, groupStartIndex + groupSize);
                                            const isFirstInGroup = dataIndex === groupStartIndex; // คอลัมน์แรกในกลุ่ม
                                            const isLastInGroup = dataIndex === groupStartIndex + currentGroup.length - 1; // คอลัมน์สุดท้ายในกลุ่ม

                                            // หากเป็นคอลัมน์แรกในกลุ่มจะมีสีเหลืองและเส้น
                                            const shouldApplyYellowAndBorder = isFirstInGroup;
                                            // หากเป็นคอลัมน์สุดท้ายในกลุ่มจะมีเส้นขวา
                                            const shouldApplyRightBorder = isLastInGroup;

                                            return (
                                                <td
                                                    key={key + "_map_sum_exit"}
                                                    className={`px-4 py-2 border-b font-bold border-gray-300 text-center text-[#464255] 
                                                        ${shouldApplyYellowAndBorder ? "border-l-2 border-[#E0E0E0]" : ""} 
                                                        ${shouldApplyRightBorder ? "border-r-2 border-[#E0E0E0]" : ""}`} // เพิ่ม border ขวา
                                                >
                                                    {formatNumberThreeDecimal(exit[key]) || ""}
                                                </td>
                                            );
                                        });
                                    })()}
                                </tr>
                            )
                        })
                    }

                    {/* ############### SUMMARY ของ SUMMARY คือ SUUUUUMMAAAAAARYYYYYYYYY! ############### */}
                    {
                        mode == "entry" && totalResultEntry &&
                        <tr key={`sum_sum_sum_entry`} className='h-[50px]' style={{ backgroundColor: '#1473A1' }}>
                            <td
                                colSpan={2}
                                className="px-4 py-2 text-left font-bold text-[#ffffff]"
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

                            {(() => {
                                const dataKeys = Object.keys(totalResultEntry)
                                    .filter((k) => k !== "region" && k !== "zone" && Number(k) >= 7)
                                    .sort((a, b) => Number(a) - Number(b));

                                const groupSize = headerEntry[3]?.dates2?.length || 1;

                                const columnOrder = [
                                    "Capacity Daily Booking (MMBTU/d)",
                                    "Maximum Hour Booking (MMBTU/h)",
                                    "Capacity Daily Booking (MMscfd)",
                                    "Maximum Hour Booking (MMscfh)"
                                ];

                                const findKeyFromColumns = (data: any, key: string, columns: string[]): any => {
                                    for (let index = 0; index < columns?.length; index++) {
                                        const items = data?.headerEntry?.[columns[index]];

                                        const optionarray = Object.keys(items)?.map((date) => {
                                            const value = items[date]; // value จะเป็น { key: string }
                                            return {
                                                date,
                                                key: value?.key || null,
                                            };
                                        });

                                        const found = optionarray?.find((item: any) => item?.key === key);

                                        if (found) {
                                            let findKey: any = initialColumnsDynamic?.find((item: any) => item?.label == columns[index]);
                                            if (dataContract?.id == 4) {
                                                const date = dayjs(found?.date, 'DD/MM/YYYY');
                                                const formatted = dayjs(date).format('DD MMM YYYY').replace('Sep', 'Sept');
                                                return {
                                                    date: date,
                                                    key: found?.key,
                                                    parent_id: findKey?.key + "_" + formatted,
                                                };
                                            }

                                            const date = dayjs(found?.date, 'DD/MM/YYYY');
                                            const formatted = dayjs(date)?.format('MMM YYYY');
                                            return {
                                                date: date,
                                                key: found?.key,
                                                parent_id: findKey?.key + "_" + formatted,
                                            };
                                        }
                                    }
                                };

                                // การจัดกลุ่มโดยอิงจาก headerExit และ columnOrder
                                return dataKeys?.map((key, dataIndex) => {
                                    const col_order_num = Math.floor(dataIndex / groupSize); // หาจำนวนกลุ่มใน columnOrder
                                    const getKey = findKeyFromColumns(dataTable, key, columnOrder);

                                    const visibilityKey = getKey?.parent_id;
                                    if (!columnVisibility[visibilityKey]) return null;

                                    // ตรวจสอบตำแหน่งในกลุ่มของ headerExit
                                    const groupStartIndex = Math.floor(dataIndex / groupSize) * groupSize;
                                    const currentGroup = dataKeys.slice(groupStartIndex, groupStartIndex + groupSize);
                                    const isFirstInGroup = dataIndex === groupStartIndex; // คอลัมน์แรกในกลุ่ม
                                    const isLastInGroup = dataIndex === groupStartIndex + currentGroup.length - 1; // คอลัมน์สุดท้ายในกลุ่ม

                                    // หากเป็นคอลัมน์แรกในกลุ่มจะมีสีเหลืองและเส้น
                                    const shouldApplyYellowAndBorder = isFirstInGroup;
                                    // หากเป็นคอลัมน์สุดท้ายในกลุ่มจะมีเส้นขวา
                                    const shouldApplyRightBorder = isLastInGroup;

                                    return (
                                        <td
                                            key={key + "_map_sum_exit"}
                                            className={`px-4 py-2 font-bold text-center text-[#ffffff]
                                                        ${shouldApplyYellowAndBorder ? "border-l-2 border-[#E0E0E0]" : ""} 
                                                        ${shouldApplyRightBorder ? "border-r-2 border-[#E0E0E0]" : ""}`} // เพิ่ม border ขวา
                                        >
                                            {formatNumberThreeDecimal(totalResultEntry[key]) || ""}
                                        </td>
                                    );
                                });
                            })()}
                        </tr>
                    }

                    {
                        mode == "exit" && totalResultExit &&
                        <tr key={`sum_sum_sum_exit`} className='h-[50px]' style={{ backgroundColor: '#1473A1' }}>
                            <td
                                colSpan={2}
                                className="px-4 py-2 text-left font-bold text-[#ffffff]"
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

                            {(() => {
                                const dataKeys = Object.keys(totalResultExit)
                                    .filter((k) => k !== "region" && k !== "zone" && Number(k) >= 7)
                                    .sort((a, b) => Number(a) - Number(b));

                                const groupSize = headerExit[3]?.dates2?.length || 1;

                                const columnOrder = [
                                    "Capacity Daily Booking (MMBTU/d)",
                                    "Maximum Hour Booking (MMBTU/h)",
                                ];

                                const findKeyFromColumns = (data: any, key: string, columns: string[]): any => {
                                    for (let index = 0; index < columns?.length; index++) {
                                        const items = data?.headerExit?.[columns[index]];

                                        const optionarray = Object.keys(items)?.map((date) => {
                                            const value = items[date]; // value จะเป็น { key: string }
                                            return {
                                                date,
                                                key: value?.key || null,
                                            };
                                        });

                                        const found = optionarray.find((item: any) => item?.key === key);

                                        if (found) {
                                            let findKey: any = initialColumnsDynamic?.find((item: any) => item?.label == columns[index]);
                                            if (dataContract?.id == 4) {
                                                const date = dayjs(found?.date, 'DD/MM/YYYY');
                                                const formatted = dayjs(date).format('DD MMM YYYY').replace('Sep', 'Sept');
                                                return {
                                                    date: date,
                                                    key: found?.key,
                                                    parent_id: findKey?.key + "_" + formatted,
                                                };
                                            }

                                            const date = dayjs(found?.date, 'DD/MM/YYYY');
                                            const formatted = dayjs(date)?.format('MMM YYYY');
                                            return {
                                                date: date,
                                                key: found?.key,
                                                parent_id: findKey?.key + "_" + formatted,
                                            };
                                        }
                                    }
                                };

                                // การจัดกลุ่มโดยอิงจาก headerExit และ columnOrder
                                return dataKeys?.map((key, dataIndex) => {
                                    const col_order_num = Math.floor(dataIndex / groupSize); // หาจำนวนกลุ่มใน columnOrder\
                                    const getKey = findKeyFromColumns(dataTable, key, columnOrder);

                                    // ตรวจสอบว่า visibility สำหรับคอลัมน์นี้เป็นแบบไหน
                                    const visibilityKey = getKey?.parent_id;
                                    if (!columnVisibility[visibilityKey]) return null;

                                    // ตรวจสอบตำแหน่งในกลุ่มของ headerExit
                                    const groupStartIndex = Math.floor(dataIndex / groupSize) * groupSize;
                                    const currentGroup = dataKeys.slice(groupStartIndex, groupStartIndex + groupSize);
                                    const isFirstInGroup = dataIndex === groupStartIndex; // คอลัมน์แรกในกลุ่ม
                                    const isLastInGroup = dataIndex === groupStartIndex + currentGroup.length - 1; // คอลัมน์สุดท้ายในกลุ่ม

                                    // หากเป็นคอลัมน์แรกในกลุ่มจะมีสีเหลืองและเส้น
                                    const shouldApplyYellowAndBorder = isFirstInGroup;
                                    // หากเป็นคอลัมน์สุดท้ายในกลุ่มจะมีเส้นขวา
                                    const shouldApplyRightBorder = isLastInGroup;

                                    return (
                                        <td
                                            key={key + "_map_sum_exit"}
                                            className={`px-4 py-2 font-bold text-center text-[#ffffff]
                                                        ${shouldApplyYellowAndBorder ? "border-l-2 border-[#E0E0E0]" : ""} 
                                                        ${shouldApplyRightBorder ? "border-r-2 border-[#E0E0E0]" : ""}`} // เพิ่ม border ขวา
                                        >
                                            {formatNumberThreeDecimal(totalResultExit[key]) || ""}
                                        </td>
                                    );
                                });
                            })()}
                        </tr>
                    }
                </tbody>
            </table>
        </div>
    )
}

export default TableModify;