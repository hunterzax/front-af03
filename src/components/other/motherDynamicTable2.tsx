import { useFetchMasters } from '@/hook/fetchMaster';
import { formatDateToDayMonthYear, formatDateToMonthYear, formatNumberThreeDecimal, generateDailyRange, generateHeaders, generateMonthlyRange, sortByMonthYear, sumByZone, sumValuesByKey, updateEntryValWithNewKeys } from '@/utils/generalFormatter';
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
import { MenuItem, Select } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Tab, Tabs, Typography } from "@mui/material";

dayjs.extend(customParseFormat);
dayjs.extend(minMax);

let group_row_json: any = []

const selectboxClass = "flex w-full h-[35px] border border-[#1473A1] p-1 ps-1 pe-2 !rounded-lg text-gray-900 text-sm block outline-none";
const inputClass = "text-[14px] block p-2 h-[37px] w-full border-[1px] bg-white border-[#464255] outline-none bg-opacity-100 focus:border-[#00ADEF] hover:!p-2 focus:!p-2";

const sortDatesAsc = (dates: string[]): string[] => {
    return dates.sort((a: string, b: string) => new Date(a).getTime() - new Date(b).getTime());
};

const MotherTable2: React.FC<any> = ({ columnVisibility, setcolumnVisibility, initialColumnsDynamic, setinitialColumnsDynamic, setGroupRowJsonState, dataTable, mode, isEditing, modeEditing, setDataPostExit, setDataPostEntry, isSaved, setDataHeaderEntry, setDataHeaderExit, setIsDateChange, setIsKeyAfter34Change, originOrSum, isSaveClick, amendNewContractStartDate, isAmendMode, dataContractTermType, isDateChange, setIsReset, isReset }) => {

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

    let data_table_val: any = null;
    try {
        let jsonString: any
        if (originOrSum == "ORIGIN") {
            jsonString = dataTable?.booking_full_json[0]?.data_temp;
        } else if (originOrSum == "SUMMARY") {
            // ถ้ายังไม่ได้กด release ให้เอา dataTable?.booking_full_json ไปแสดงก่อน
            const booking_full_json_release: any[] = dataTable?.booking_full_json_release?.filter((item: any) => item?.flag_use == true) || []
            jsonString = booking_full_json_release.length > 0 && booking_full_json_release[0]?.data_temp ? booking_full_json_release[0]?.data_temp : dataTable?.booking_full_json[0]?.data_temp;
        }

        if (jsonString) {
            data_table_val = JSON.parse(jsonString);
        } else {
            return <div className="flex flex-col justify-center items-center w-[100%] pt-4">
                <img className="w-[40px] h-auto mb-2" src="/assets/image/no_data_icon.svg" alt="No data icon" />
                <div className="text-[16px] text-[#9CA3AF]">
                    {`No data.`}
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

    useEffect(() => {
        setGroupRowJsonState(group_row_json)
    }, [group_row_json])

    useEffect(() => {
        let groupedByEntryExitId: any = dataTable?.booking_row_json?.reduce((acc: any, item: any) => {
            const { entry_exit_id } = item;
            if (!acc[entry_exit_id]) {
                acc[entry_exit_id] = [];
            }
            acc[entry_exit_id].push(item);
            return acc;
        }, {});

        if (originOrSum == "SUMMARY") {
            const booking_row_json_release: any[] = dataTable?.booking_row_json_release?.filter((item: any) => item?.flag_use == true) || []
            groupedByEntryExitId = booking_row_json_release.length > 0 ? booking_row_json_release.reduce((acc: any, item: any) => {
                const { entry_exit_id } = item;
                if (!acc[entry_exit_id]) {
                    acc[entry_exit_id] = [];
                }
                acc[entry_exit_id].push(item);
                return acc;
            }, {}) : groupedByEntryExitId
        }


        group_row_json = Object.entries(groupedByEntryExitId).map(([entry_exit_id, items]: any) => ({
            entry_exit_id: parseInt(entry_exit_id, 10),
            data: items.map((item: any) => {
                let item_data_temp = JSON.parse(item?.data_temp);
                const filter_contract_point = contractPointData?.data?.find((item: any) => item.contract_point === item_data_temp["0"].trim());
                return (
                    {
                        id: item.id,
                        // zone_text: item.zone_text,
                        // area_text: item.area_text,
                        zone_text: filter_contract_point?.zone?.name,
                        area_text: filter_contract_point?.area?.name,
                        data_temp: item.data_temp,
                        data_temp_mod: item?.data_temp ? JSON.parse(item.data_temp) : {}, // Uncomment if needed
                        booking_version_id: item?.booking_version_id,
                        entry_exit_id: item?.entry_exit_id,
                        create_date: item?.create_date,
                        update_date: item.update_date,
                        create_date_num: item.create_date_num,
                        update_date_num: item.update_date_num,
                        create_by: item.create_by,
                        update_by: item.update_by,
                        flag_use: item.flag_use,
                        contract_point: item.contract_point
                    }
                )
            }
            )
        }));
    }, [])



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

    // const { entryValue } = mockDataExcel;
    const { entryValue, exitValue } = data_table_val;
    // const { exitValue } = data_table_val;

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
    const [summedExits, setSummedExits] = useState<any>(sumByZone(exitVal, contractPointData));
    // const summedExits: any = sumByZone(exitVal, contractPointData);
    useEffect(() => {
        setSummedExits(sumByZone(exitVal, contractPointData))
    }, [exitVal])

    // ############### SUMMARY DATA ENTRY ###############
    const [summedEntries, setSummedEntries] = useState<any>(sumByZone(entryVal, contractPointData));
    // const summedEntries: any = sumByZone(entryVal, contractPointData);

    useEffect(() => {
        setSummedEntries(sumByZone(entryVal, contractPointData))
    }, [entryVal])


    // ############### SUMMARY ของ SUMMARY อีกทีหนึ่ง ###############
    const summedEntryRef: any = useRef<any>(null);
    const summedExitRef: any = useRef<any>(null);

    useEffect(() => {
        // const summedEntryResult = sumValuesByKey(outputEntry);
        // const summedExitResult = sumValuesByKey(outputExit);
        const summedEntryResult = sumValuesByKey(summedEntries);
        const summedExitResult = sumValuesByKey(summedExits);
        // Store the sums in refs to avoid causing re-renders
        summedEntryRef.current = summedEntryResult;
        summedExitRef.current = summedExitResult;
    }, [summedEntries, summedExits, data_table_val]);

    // ############### UPDATE HEADERS ###############
    const [entryDateFrom, setEntryDateFrom] = useState<any>();
    const [entryDateTo, setEntryDateTo] = useState<any>();

    const [exitDateFrom, setExitDateFrom] = useState<any>();
    const [exitDateTo, setExitDateTo] = useState<any>();

    // function นี้ของ ENTRY เอาไว้สำหรับตอนเพิ่มหรือลดวันที่ใน period
    function updateHeadersLastFive(headerss: any[], fromDate: string, toDate: string) {

        // ******** CHECK TERM TYPE ********
        // file_period_mode = 2 แสดงรายเดือน --> upload file เป็นค่ารายวัน แต่ระบบนำเข้าแล้วแสดงเป็นรายเดือน V.73 https://app.clickup.com/t/86ereurw7
        // const newDates = generateMonthlyRange(fromDate, toDate); // ถ้าเป็น case short term ไม่ต้อง generateMonthlyRange
        // const newDates = generateDailyRange(fromDate, toDate); // ถ้าเป็น short term non-firm ใช้ generateDailyRange

        let newDates: any
        if (dataContractTermType?.id === 4) { // 4 คือ short term non-firm
            newDates = generateDailyRange(fromDate, toDate);
        } else {
            newDates = generateMonthlyRange(fromDate, toDate);
        }
        let differentDates = newDates.filter((date: any) => !headerss?.[3]?.dates.includes(date));

        let keyCounter = 7; // original 35 ---> new 7 เริ่ม key ที่มี value
        const updatedHeaders = headerss.map((header, index) => {
            // Update only the last 4 objects
            if (index >= headerss.length - 4) {
                const updatedDates2 = newDates.map((date?: any) => ({
                    label: date,
                    // key: keyCounter++,
                    key: String(keyCounter++),
                    value: date,
                    // formatted: dataContractTermType?.id === 4 ? dayjs(date, "DD/MM/YYYY").startOf("day") : dayjs(date, "DD/MM/YYYY").startOf("month"),
                }));

                return {
                    ...header,
                    dates: newDates,
                    dates2: updatedDates2,
                    // key: updatedDates2[0]?.key || header.key, // Update key to the first key in dates2
                    key: String(updatedDates2[0]?.key || header.key),
                    diff_date: differentDates?.length,
                    is_entry: true
                };
            }

            return header;
        });

        return updatedHeaders;
    }

    // function นี้ของ EXIT เอาไว้สำหรับตอนเพิ่มหรือลดวันที่ใน period
    function updateHeadersLastTwo(headerss: any[], fromDate: string, toDate: string) {

        // ******** CHECK TERM TYPE ********
        // file_period_mode = 2 แสดงรายเดือน --> upload file เป็นค่ารายวัน แต่ระบบนำเข้าแล้วแสดงเป็นรายเดือน V.73 https://app.clickup.com/t/86ereurw7
        // const newDates = generateMonthlyRange(fromDate, toDate); // ถ้าเป็น case short term ไม่ต้อง generateMonthlyRange
        // const newDates = generateDailyRange(fromDate, toDate);// ถ้าเป็น short term non firm ใช้ generateDailyRange

        let newDates: any
        if (dataContractTermType?.id === 4) {  // 4 คือ short term non-firm
            newDates = generateDailyRange(fromDate, toDate);
        } else {
            newDates = generateMonthlyRange(fromDate, toDate);
        }
        let differentDates = newDates.filter((date: any) => !headerss?.[3]?.dates.includes(date));

        // let keyCounter = 35; // Initial key value
        let keyCounter = 7; // original 35 ---> new 7 เริ่ม key ที่มี value
        const updatedHeaders = headerss.map((header, index) => {
            // Update only the last 2 objects
            if (index >= headerss.length - 2) {
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
                    diff_date: differentDates?.length,
                    is_entry: false
                };
            }

            return header;
        });

        return updatedHeaders;
    }

    // const fromDate = entryDateFrom ? entryDateFrom : entryVal?.[0]?.[5]; // original 33 ---> new 5
    // const toDate = entryDateTo ? entryDateTo : entryVal?.[0]?.[6]; // original 34 ---> new 6
    // const fromDateExit = exitDateFrom ? exitDateFrom : exitVal?.[0]?.[5]; // original 33 ---> new 5
    // const toDateExit = exitDateTo ? exitDateTo : exitVal?.[0]?.[6]; // original 34 ---> new 6

    const getStageDate = (manualDate: any, dataArray: any, index: number) => {
        return manualDate ? manualDate : dataArray?.[0]?.[index];
    };

    const [fromDate, setFromDate] = useState(() => getStageDate(entryDateFrom, entryVal, 5));
    const [toDate, setToDate] = useState(() => getStageDate(entryDateTo, entryVal, 6));
    const [fromDateExit, setFromDateExit] = useState(() => getStageDate(exitDateFrom, exitVal, 5));
    const [toDateExit, setToDateExit] = useState(() => getStageDate(exitDateTo, exitVal, 6));

    // const updatedHeaders = updateHeadersLastFive(headers, fromDate, toDate);
    // const updatedHeadersExit = updateHeadersLastTwo(headersExit, fromDateExit, toDateExit);

    const [updatedHeaders, setupdatedHeaders] = useState<any>([]);
    const [updatedHeadersExit, setUpdatedHeadersExit] = useState<any>([]);

    useEffect(() => {
        // first time render
        let entry = updateHeadersLastFive(headers, fromDate, toDate)
        setupdatedHeaders(entry);

        let exit = updateHeadersLastTwo(headersExit, fromDateExit, toDateExit)
        setUpdatedHeadersExit(exit);
    }, [])

    useEffect(() => {
        // if value change
        let entry = updateHeadersLastFive(headers, fromDate, toDate)
        setupdatedHeaders(entry);

        let exit = updateHeadersLastTwo(headersExit, fromDateExit, toDateExit)
        setUpdatedHeadersExit(exit);
    }, [entryDateFrom, exitDateFrom, entryDateTo, exitDateTo])

    const updateEntryDate = (type: any, newDate: any, entryValLength: any) => {
        if (entryValLength > 1) {
            if (type === "from") {
                setEntryDateFrom((prev: any) => {
                    return (!prev || dayjs(newDate).isBefore(dayjs(prev, "DD/MM/YYYY")))
                        ? dayjs(newDate).format("DD/MM/YYYY")
                        : prev;
                });
            } else if (type === "to") {
                setEntryDateTo((prev: any) => {
                    return (!prev || dayjs(newDate).isAfter(dayjs(prev, "DD/MM/YYYY")))
                        ? dayjs(newDate).format("DD/MM/YYYY")
                        : prev;
                });
            }
        } else {
            if (type === "from") {
                setEntryDateFrom(dayjs(newDate).format("DD/MM/YYYY"));
            } else if (type === "to") {
                setEntryDateTo(dayjs(newDate).format("DD/MM/YYYY"));
            }
        }
    };

    const updateExitDate = (type: any, newDate: any, entryValLength: any) => {
        if (entryValLength > 1) {
            if (type === "from") {
                setExitDateFrom((prev: any) => {
                    return (!prev || dayjs(newDate).isBefore(dayjs(prev, "DD/MM/YYYY")))
                        ? dayjs(newDate).format("DD/MM/YYYY")
                        : prev;
                });
            } else if (type === "to") {
                setExitDateTo((prev: any) => {
                    return (!prev || dayjs(newDate).isAfter(dayjs(prev, "DD/MM/YYYY")))
                        ? dayjs(newDate).format("DD/MM/YYYY")
                        : prev;
                });
            }
        } else {
            if (type === "from") {
                setExitDateFrom(dayjs(newDate).format("DD/MM/YYYY"));
            } else if (type === "to") {
                setExitDateTo(dayjs(newDate).format("DD/MM/YYYY"));
            }
        }
    };

    useEffect(() => {
        if (updatedHeaders?.length) {
            // if (updatedHeaders?.length && !arraysAreEqual(updatedHeaders, prevUpdatedHeadersRef.current)) {
            setEntryVal((prevEntryVal: any) => updateEntryValWithNewKeys(prevEntryVal, updatedHeaders));
            setDataHeaderEntry(updatedHeaders)
        }
        // }, [updatedHeaders])
    }, [JSON.stringify(updatedHeaders)]);

    useEffect(() => {
        if (updatedHeadersExit?.length) {
            // if (updatedHeadersExit?.length && !arraysAreEqual(updatedHeadersExit, prevUpdatedHeadersExitRef.current)) {
            setExitVal((prevExitVal: any) => updateEntryValWithNewKeys(prevExitVal, updatedHeadersExit));
            setDataHeaderExit(updatedHeadersExit)
        }
        // }, [updatedHeadersExit])
    }, [JSON.stringify(updatedHeadersExit)]);

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

    useEffect(() => {
        // ######### AMEND MODE #########
        if (isAmendMode) {
            // ทำ auto update column ตามวันที่ start ถ้าเป็น amend mode
            const formattedDate = new Date(amendNewContractStartDate + "T00:00:00");
            updateEntryDate("from", formattedDate, entryVal?.length || 0);
            updateEntryDate("from", formattedDate, exitVal?.length || 0);

            // UPDATE COLUMN ENTRY
            const updatedEntries = entryVal?.map((row: any, rowIndex: any) => {
                updatedHeaders?.forEach((header: any) => {
                    if (header.dates?.length > 0) {
                        header.dates2.forEach((date: any) => {
                            if (date.key === 5 && row) {
                                row[date.key] = dayjs(formattedDate).format("DD/MM/YYYY");
                            }
                        });
                    }
                });
                return row;
            });

            setEntryVal(updatedEntries);
            setDataPostEntry(updatedEntries);

            // UPDATE COLUMN EXIT
            const updatedExits = exitVal?.map((row: any, rowIndex: any) => {
                updatedHeadersExit?.forEach((header: any) => {
                    if (header.dates?.length > 0) {
                        header.dates2.forEach((date: any) => {
                            if (date.key === 5 && row) {
                                row[date.key] = dayjs(formattedDate).format("DD/MM/YYYY");
                            }
                        });
                    }
                });
                return row;
            });
            setExitVal(updatedExits);
            setDataPostExit(updatedExits);

        }
    }, [isAmendMode, amendNewContractStartDate, entryVal]);


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

    // useEffect(() => {
    //     setDataPostEntry(entryVal)
    //     setDataPostExit(exitVal)
    // }, [isEditing])

    return (
        <div className="overflow-auto rounded-t-md">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                {/* Table Header */}
                <thead className="text-xs text-[#ffffff] bg-[#1473A1] border-[#1473A1] sticky top-0 z-10">
                    <tr className="h-9">

                        {/* React.Fragment */}
                        {/* ############### HEADER ENTRY ############### */}
                        {
                            mode == "entry" &&
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


                                {
                                    updatedHeaders && updatedHeaders?.map((header: any, index: any) => {
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
                                                className={`${["Zone", "Area", "Entry Meter ID", "Contract Point", "New Point"].includes(header.label) ? table_sort_header_style : table_header_style} text-center w-[100px] border-r-2 border-gray-300`}
                                            >
                                                {/* {header.label} */}
                                                {
                                                    header.label == "Pressure Range" ? 'Pressure Range (PSIG)' : header.label == "Temperature Range" ? 'Temperature Range (DEG. F)' : header.label
                                                }

                                                {["Zone", "Area", "Entry Meter ID", "Contract Point", "New Point"].includes(header.label) && getArrowIcon("entry_item" + index)}
                                            </th>
                                        )

                                    })
                                }

                            </>
                        }


                        {/* ############### HEADER EXIT ############### */}
                        {
                            mode == "exit" &&
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

                                {
                                    updatedHeadersExit && updatedHeadersExit.map((header: any, index: any) => {
                                        const visibilityKey = visibilityMap[header.label];
                                        if (!columnVisibility[visibilityKey]) {
                                            return null
                                        }
                                        const checkDate: any = functionControlcolSpan(header, 'date'); //example here only data == date

                                        return (
                                            <th
                                                key={index}
                                                colSpan={checkDate?.filter((item: any) => item?.active == false)?.length > 0 ? checkDate?.filter((item: any) => item?.active == true)?.length : header.dates && header.dates.length > 0 ? header.dates.length : header.subHeaders ? header.subHeaders.length : 1}
                                                className={`${["Zone", "Area", "Exit Meter ID", "Contract Point", "New Point"].includes(header.label) ? table_sort_header_style : table_header_style} border-r-2 border-gray-300 text-center w-[100px]`}
                                            // onClick={() => handleSort("entry_item" + index, sortState, setSortState, setSortedData, tableData)}
                                            >
                                                {
                                                    header.label == "Pressure Range" ? 'Pressure Range (PSIG)' : header.label == "Temperature Range" ? 'Temperature Range (DEG. F)' : header.label
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

                        {columnVisibility.area && (
                            <th key={'10002'} className={`${table_header_style} border-none text-center bg-[#1473A1] `}></th>
                        )}

                        {columnVisibility.contract_point && (
                            <th key={'10003'} className={`${table_header_style} border-none text-center bg-[#1473A1] `}></th>
                        )}


                        {/* ############### SUB-HEADER ENTRY ############### */}
                        {
                            mode == "entry" &&
                            <>
                                {
                                    updatedHeaders && updatedHeaders.map((header: any, index: any) => {
                                        const visibilityKey = visibilityMap[header.label];
                                        if (!columnVisibility[visibilityKey]) {
                                            return null
                                        }

                                        let findKey: any = initialColumnsDynamic?.find((item: any) => item?.label == header?.label);
                                        const checkDate: any = functionControlcolSpan(header, 'date'); //example here only data == date
                                        const checkSubheader: any = functionControlcolSpan(header, 'sub_header'); //example here only data == sub_header

                                        // sub_header_panel --> here
                                        return (
                                            header.dates ? (
                                                sortDatesAsc([...header.dates]).map((date: any, dateIndex: any, arr: any) => (
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
                                                            >
                                                                {/* // file_period_mode = 2 แปลงเป็นเดือน */}
                                                                {/* // จัดกรุ๊ปหัว col ให้เป็น format "MMM DD" ที่ formatDateToMonthYear(date) */}
                                                                {/* {formatDateToMonthYear(date)} */}

                                                                {/* ถ้า dataContractTermType?.id == 4 ให้ format เป็น DD MMM YYYY */}
                                                                {dataContractTermType?.id == 4 ? formatDateToDayMonthYear(date) : formatDateToMonthYear(date)}

                                                                {getArrowIcon("entry_date" + dateIndex)}
                                                            </th>
                                                        )
                                                        : columnVisibility[findKey?.key + "_" + formatDateToMonthYear(date)] && (
                                                            <th
                                                                key={`${index}-${dateIndex}`}
                                                                // colSpan={
                                                                //     checkDate?.filter((item: any) => item?.active == false)?.length > 0 ? 2: 1
                                                                // }
                                                                // colSpan={checkDate?.length}
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
                                                                {/* // file_period_mode = 2 แปลงเป็นเดือน */}
                                                                {/* // จัดกรุ๊ปหัว col ให้เป็น format "MMM DD" ที่ formatDateToMonthYear(date) */}
                                                                {/* {formatDateToMonthYear(date)} */}

                                                                {/* ถ้า dataContractTermType?.id == 4 ให้ format เป็น DD MMM YYYY */}
                                                                {dataContractTermType?.id == 4 ? formatDateToDayMonthYear(date) : formatDateToMonthYear(date)}

                                                                {getArrowIcon("entry_date" + dateIndex)}
                                                            </th>
                                                        )
                                                ))
                                            ) : header.subHeaders && header.subHeaders.length > 0 ? (
                                                header.subHeaders.map((subHeader: any, subIndex: any, arr: any) => (
                                                    columnVisibility[subHeader?.key] && (
                                                        <th
                                                            key={`${index}-${subIndex}`}
                                                            // colSpan={checkData?.filter((item: any) => item?.active == false)?.length > 0 ? (header.subHeaders.length - checkData?.filter((item: any) => item?.active == false)?.length): header.subHeaders.length}
                                                            colSpan={
                                                                checkSubheader?.filter((item: any) => item?.active == false)?.length > 0 ? 2 : 1
                                                            }
                                                            className={`${table_sort_header_style} text-center bg-[#00ADEF] ${subIndex === arr.length - 1 ? "border-r-2 border-gray-300" : checkSubheader?.filter((item: any) => item?.active == false)?.length > 0 ? "border-r-2 border-gray-300" : ""}`}
                                                        >
                                                            {subHeader.label}
                                                            {getArrowIcon("entry_sub_min_max" + subIndex)}
                                                        </th>)
                                                ))
                                            ) : (
                                                <th
                                                    key={index}
                                                    className={`${table_header_style} border-b border-[#1473A1] text-center`}
                                                >
                                                    {/* Empty header for standalone columns */}
                                                </th>
                                            )
                                        )
                                    })
                                }
                            </>
                        }

                        {/* ############### SUB-HEADER EXIT ############### */}
                        {
                            mode == "exit" &&
                            updatedHeadersExit && updatedHeadersExit.map((header: any, index: any) => {
                                const visibilityKey = visibilityMap[header.label];
                                if (!columnVisibility[visibilityKey]) {
                                    return null
                                }

                                let findKey: any = initialColumnsDynamic?.find((item: any) => item?.label == header?.label);

                                const checkDate: any = functionControlcolSpan(header, 'date'); //example here only data == date

                                const checkSubheader: any = functionControlcolSpan(header, 'sub_header'); //example here only data == sub_header

                                // sub_header_panel --> here
                                return (
                                    header.dates ? (
                                        sortDatesAsc([...header.dates]).map((date: any, dateIndex: any, arr: any) => (
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
                                                    >
                                                        {/* // file_period_mode = 2 แปลงเป็นเดือน */}
                                                        {/* // จัดกรุ๊ปหัว col ให้เป็น format "MMM DD" ที่ formatDateToMonthYear(date) */}
                                                        {/* {formatDateToMonthYear(date)} */}

                                                        {/* ถ้า dataContractTermType?.id == 4 ให้ format เป็น DD MMM YYYY */}
                                                        {dataContractTermType?.id == 4 ? formatDateToDayMonthYear(date) : formatDateToMonthYear(date)}

                                                        {getArrowIcon("exit_date" + dateIndex)}
                                                    </th>
                                                )
                                                : columnVisibility[findKey?.key + "_" + formatDateToMonthYear(date)] && (
                                                    <th
                                                        key={`${index}-${dateIndex}`}
                                                        // colSpan={
                                                        //     checkDate?.filter((item: any) => item?.active == false)?.length > 0 ? 2: 1
                                                        // }
                                                        // colSpan={checkDate?.length}
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
                                                        {/* // file_period_mode = 2 แปลงเป็นเดือน */}
                                                        {/* // จัดกรุ๊ปหัว col ให้เป็น format "MMM DD" ที่ formatDateToMonthYear(date) */}
                                                        {/* {formatDateToMonthYear(date)} */}

                                                        {/* ถ้า dataContractTermType?.id == 4 ให้ format เป็น DD MMM YYYY */}
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
                                                    // colSpan={checkData?.filter((item: any) => item?.active == false)?.length > 0 ? (header.subHeaders.length - checkData?.filter((item: any) => item?.active == false)?.length): header.subHeaders.length}
                                                    colSpan={
                                                        checkSubheader?.filter((item: any) => item?.active == false)?.length > 0 ? 2 : 1
                                                    }
                                                    className={`${table_sort_header_style} text-center bg-[#00ADEF] ${subIndex === arr.length - 1 ? "border-r-2 border-gray-300" : checkSubheader?.filter((item: any) => item?.active == false)?.length > 0 ? "border-r-2 border-gray-300" : ""}`}
                                                >
                                                    {subHeader.label}
                                                    {getArrowIcon("exit_sub_min_max" + subIndex)}
                                                </th>)
                                        ))
                                    ) : (
                                        <th
                                            key={index}
                                            className={`${table_header_style} border-b border-[#1473A1] text-center`}
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

                    {/* ############### BODY ENTRY ############### */}
                    {
                        mode == "entry" && entryVal?.map((row: any, rowIndex: any) => (
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
                                        {isEditing && modeEditing === "entry" ? (
                                            <Select
                                                id="area_id"
                                                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                disabled={false} // Enable selectbox when editing
                                                value={row?.[0]}
                                                className={`${selectboxClass}`}
                                                onChange={(e) => {
                                                    setEntryVal((prev: any) => {
                                                        const updatedEntry = [...prev];
                                                        const filter_contract_point = contractPointData?.data?.find((item: any) => item.contract_point === e.target.value);
                                                        if (updatedEntry[rowIndex]) {
                                                            updatedEntry[rowIndex][0] = e.target.value;
                                                            group_row_json = group_row_json.map((item: any) => {
                                                                let temps = null;
                                                                if (item?.entry_exit_id === 1) {
                                                                    temps = item?.data.map((itemData: any, ixData: number) => {
                                                                        let contract_point = rowIndex === ixData ? e.target.value : itemData["contract_point"];
                                                                        let zone_text = rowIndex === ixData ? filter_contract_point?.zone?.name : itemData["zone_text"];
                                                                        let area_text = rowIndex === ixData ? filter_contract_point?.area?.name : itemData["area_text"];

                                                                        let data_temps = rowIndex === ixData ? JSON.parse(itemData["data_temp"]) : itemData["data_temp"];
                                                                        let ndata_temps = rowIndex === ixData
                                                                            ? {
                                                                                ...data_temps,
                                                                                ["1"]: filter_contract_point?.zone?.name,
                                                                                ["2"]: filter_contract_point?.area?.name,
                                                                                ["0"]: e.target.value,
                                                                            } : itemData["data_temps"];

                                                                        return {
                                                                            ...itemData,
                                                                            contract_point,
                                                                            zone_text,
                                                                            area_text,
                                                                            data_temps: ndata_temps,
                                                                            data_temp:
                                                                                rowIndex === ixData ? JSON.stringify(ndata_temps) : itemData["data_temp"],
                                                                        };
                                                                    });
                                                                } else {
                                                                    temps = item?.data;
                                                                }
                                                                return { ...item, data: temps };
                                                            });
                                                        }
                                                        setDataPostEntry(updatedEntry);
                                                        return updatedEntry;
                                                    });
                                                }}
                                                sx={{
                                                    ".MuiOutlinedInput-notchedOutline": {},
                                                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#d2d4d8" },
                                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#d2d4d8" },
                                                }}
                                                displayEmpty
                                                renderValue={(value: any) => {
                                                    if (!value) {
                                                        return <Typography color="#9CA3AF" fontSize={14}>{`Contract Point`}</Typography>;
                                                    }
                                                    return (contractPointData?.data?.find((item: any) => item.contract_point === value)?.contract_point || "");
                                                }}
                                                MenuProps={{
                                                    PaperProps: {
                                                        style: {
                                                            maxHeight: 48 * 4.5 + 8, // Item height * 4.5 + padding
                                                        },
                                                    },
                                                }}
                                            >
                                                {contractPointData?.data
                                                    ?.filter((item: any) => item?.entry_exit_id === 1)
                                                    .map((item: any) => (
                                                        <MenuItem key={item.id} value={item.contract_point}>
                                                            {item.contract_point}
                                                        </MenuItem>
                                                    ))}
                                            </Select>
                                        ) : (
                                            // Display the existing contract point name when not editing
                                            row?.[0]
                                        )}
                                    </td>
                                )}


                                {updatedHeaders && updatedHeaders?.map((header: any, colIndex: any) => {
                                    // const visibilityKey = visibilityMap[header.label];

                                    if (header.dates && header.dates.length > 0) {

                                        let findKey: any = initialColumnsDynamic?.find((item: any) => item?.label == header?.label);
                                        const checkDate: any = functionControlcolSpan(header, 'date'); //example here only data == date

                                        return (header?.dates2?.map((date: any, dateIndex: any, arr: any) => {
                                            return (
                                                date?.value == 'From' || date?.value == 'To' ?
                                                    (columnVisibility[formatDateToMonthYear(date?.value)] && (
                                                        <td
                                                            key={`${colIndex}-${dateIndex}`}
                                                            className={`px-4 py-2 border-b border-gray-300 text-center text-[#464255] 
                                                                ${dateIndex === arr.length - 1 ? "border-r-2 border-gray-300" : checkDate?.filter((item: any) => item?.active == false)?.length > 0 ?
                                                                    checkDate?.filter((item: any) => item?.active == true)[checkDate?.filter((item: any) => item?.active == true)?.length - 1]?.key == formatDateToMonthYear(date?.value) && //หาตัวสุดท้าย โดยการเอา check date filter หาของที่มี และ - ด้วย(ของที่มี -1) เพื่อเช็ค index ตัวสุดท้ายสำหรับใส่ style
                                                                    "border-r-2 border-gray-300" : ""}
                                                            `}
                                                        >
                                                            {isEditing && modeEditing == 'entry' ? (
                                                                // /^\d{2}\/\d{2}\/\d{4}$/.test(row[date.key]) || row[date.key] == undefined && (date.key === 5 || date.key === 6) ? ( // original 33 --> new 5, // original 34 --> new 6
                                                                /^\d{2}\/\d{2}\/\d{4}$/.test(row[date.key]) || row[date.key] == undefined || date.key === 5 || date.key === 6 ? (
                                                                    <td>
                                                                        <DatePickaForm
                                                                            key={"start" + key}
                                                                            readOnly={false} // amend ก็เปิดให้แก้ไขได้
                                                                            placeHolder="Select Date"
                                                                            mode={'edit-table'}
                                                                            valueShow={
                                                                                isAmendMode && date.key == 5 ?
                                                                                    dayjs(amendNewContractStartDate, "YYYY-MM-DD").format("DD/MM/YYYY")
                                                                                    : row[date.key] !== undefined ? row[date.key] : dayjs().format("DD/MM/YYYY")
                                                                            } // ถ้า isAmendMode == true กำหนด date.key == 5 ให้ใช้วันที่ amendNewContractStartDate ลงใน valueShow
                                                                            min={tomorrowDay || undefined}
                                                                            allowClear
                                                                            onChange={(e: any) => {
                                                                                ;
                                                                                const formattedNewDate = e ? dayjs(e).format("DD/MM/YYYY") : undefined;
                                                                                const currentDate = row[date.key];
                                                                                // Check if the new date is different from the current date
                                                                                const hasDateChanged = formattedNewDate !== currentDate;
                                                                                if (hasDateChanged) {
                                                                                    setIsDateChange(true);
                                                                                } else {
                                                                                    // Set the flag to false if the new date is the same as the current one
                                                                                    setIsDateChange(false);
                                                                                }

                                                                                if (e) {

                                                                                    // Format the selected date and update the row
                                                                                    // row[date.key] = dayjs(e).format("DD/MM/YYYY");
                                                                                    if (date.key == 5) { // original 33 --> new 5
                                                                                        updateEntryDate("from", e, entryVal?.length || 0);

                                                                                        // ถ้าเปลี่ยน date ฝั่งใดฝั่งหนึ่ง ให้อัพเดทอีกฝั่งด้วย
                                                                                        updateExitDate("from", e, exitVal?.length || 0);

                                                                                    } else if (date.key == 6) { // original 34 --> new 6
                                                                                        updateEntryDate("to", e, entryVal?.length || 0);

                                                                                        // ถ้าเปลี่ยน date ฝั่งใดฝั่งหนึ่ง ให้อัพเดทอีกฝั่งด้วย
                                                                                        updateExitDate("to", e, exitVal?.length || 0);
                                                                                    }

                                                                                    setEntryVal((prev: any) => {
                                                                                        const updatedEntry = [...prev];
                                                                                        if (updatedEntry[rowIndex]) {
                                                                                            updatedEntry[rowIndex][date.key] = dayjs(e).format("DD/MM/YYYY");
                                                                                        }
                                                                                        setDataPostEntry(updatedEntry)
                                                                                        return updatedEntry;
                                                                                    });

                                                                                    // ถ้าเปลี่ยน date ฝั่งใดฝั่งหนึ่ง ให้อัพเดทอีกฝั่งด้วย
                                                                                    setExitVal((prev: any) => {
                                                                                        // const updatedExit = [...prev];
                                                                                        const updatedExit = prev.map((item: any) => ({
                                                                                            ...item,
                                                                                            [date.key]: dayjs(e).format("DD/MM/YYYY") // Update all date.key fields
                                                                                        }));

                                                                                        setDataPostExit(updatedExit)
                                                                                        return updatedExit;
                                                                                    });


                                                                                } else {
                                                                                    // Handle clearing the value
                                                                                    // ถ้ากด clear จะ set ข้อมูลเป็นวันปัจจุบัน ทำให้เคลียร์ว่างไปเลยไม่ได้ เพราะมันส่งผลต่อการแสดงผล
                                                                                    row[date.key] = undefined;
                                                                                    if (date.key == 5) { // original 33 --> new 5
                                                                                        setEntryDateFrom(undefined)
                                                                                        // setEntryDateFrom(dayjs().format("DD/MM/YYYY"))
                                                                                    } else if (date.key == 6) { // original 34 --> new 6
                                                                                        setEntryDateTo(undefined)
                                                                                        // setEntryDateTo(dayjs().format("DD/MM/YYYY"))
                                                                                    }
                                                                                }
                                                                            }}
                                                                        />
                                                                    </td>
                                                                ) : (
                                                                    // เก่า ค่าในแต่ละเดือน หลัง key 34 
                                                                    // ใหม่ ค่าในแต่ละเดือน หลัง key 6
                                                                    <NumericFormat
                                                                        value={row[date.key] || ''}
                                                                        onValueChange={(values) => {
                                                                            if (parseInt(date.key) > 6) { // original 34 --> new 6
                                                                                // แก้ไขข้อมูลหลังคีย์ 6 ต้องเช็คว่าเท่ากับ exit หรือไม่
                                                                                setIsKeyAfter34Change(true)
                                                                            }

                                                                            const { value } = values;

                                                                            // Update entryVal dynamically
                                                                            setEntryVal((prev: any) => {
                                                                                const updatedEntry = [...prev];
                                                                                if (updatedEntry[rowIndex]) {
                                                                                    updatedEntry[rowIndex][date.key] = value;
                                                                                }
                                                                                setDataPostEntry(updatedEntry)
                                                                                return updatedEntry;
                                                                            });
                                                                        }}
                                                                        thousandSeparator=","
                                                                        decimalScale={3}
                                                                        fixedDecimalScale={true}
                                                                        allowNegative={false}
                                                                        className={`${inputClass} `}
                                                                        style={{
                                                                            textAlign: "right",
                                                                            // minWidth: "110px",
                                                                            width: "100%",
                                                                            // overflow: "hidden",
                                                                            // whiteSpace: "nowrap",
                                                                        }}
                                                                    />
                                                                )
                                                            ) : (
                                                                formatNumberThreeDecimal(row[date.key]) || ''
                                                            )}
                                                        </td>
                                                    )
                                                    )
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
                                                                // /^\d{2}\/\d{2}\/\d{4}$/.test(row[date.key]) || row[date.key] == undefined && (date.key === 5 || date.key === 6) ? ( // original 33 --> new 5, // original 34 --> new 6
                                                                /^\d{2}\/\d{2}\/\d{4}$/.test(row[date.key]) || row[date.key] == undefined || date.key === 5 || date.key === 6 ? (
                                                                    <td>
                                                                        <DatePickaForm
                                                                            key={"start" + key}
                                                                            // {...register('start_date')}
                                                                            // readOnly={false}
                                                                            readOnly={false} // amend ก็เปิดให้แก้ไขได้
                                                                            // readOnly={isAmendMode && date.key == 6 ? true : false} // โหมด amend จะแก้ไข period to ไม่ได้ ถ้า isAmendMode == true && date.key == 6 ให้ disable 
                                                                            placeHolder="Select Date"
                                                                            mode={'edit-table'}
                                                                            // valueShow={row[date.key] && dayjs(row[date.key], "DD/MM/YYYY").format("YYYY-MM-DD")}
                                                                            // valueShow={row[date.key]} // เดิมใช้อันนี้
                                                                            valueShow={
                                                                                isAmendMode && date.key == 5 ?
                                                                                    dayjs(amendNewContractStartDate, "YYYY-MM-DD").format("DD/MM/YYYY")
                                                                                    : row[date.key] !== undefined ? row[date.key] : dayjs().format("DD/MM/YYYY")
                                                                            } // ถ้า isAmendMode == true กำหนด date.key == 5 ให้ใช้วันที่ amendNewContractStartDate ลงใน valueShow
                                                                            // min={formattedStartDate || undefined}
                                                                            min={tomorrowDay || undefined}
                                                                            allowClear
                                                                            onChange={(e: any) => {
                                                                                ;
                                                                                const formattedNewDate = e ? dayjs(e).format("DD/MM/YYYY") : undefined;
                                                                                const currentDate = row[date.key];
                                                                                // Check if the new date is different from the current date
                                                                                const hasDateChanged = formattedNewDate !== currentDate;
                                                                                if (hasDateChanged) {
                                                                                    setIsDateChange(true);
                                                                                } else {
                                                                                    // Set the flag to false if the new date is the same as the current one
                                                                                    setIsDateChange(false);
                                                                                }

                                                                                if (e) {

                                                                                    // Format the selected date and update the row
                                                                                    // row[date.key] = dayjs(e).format("DD/MM/YYYY");
                                                                                    if (date.key == 5) { // original 33 --> new 5
                                                                                        updateEntryDate("from", e, entryVal?.length || 0);

                                                                                        // ถ้าเปลี่ยน date ฝั่งใดฝั่งหนึ่ง ให้อัพเดทอีกฝั่งด้วย
                                                                                        updateExitDate("from", e, exitVal?.length || 0);

                                                                                    } else if (date.key == 6) { // original 34 --> new 6
                                                                                        updateEntryDate("to", e, entryVal?.length || 0);

                                                                                        // ถ้าเปลี่ยน date ฝั่งใดฝั่งหนึ่ง ให้อัพเดทอีกฝั่งด้วย
                                                                                        updateExitDate("to", e, exitVal?.length || 0);
                                                                                    }

                                                                                    setEntryVal((prev: any) => {
                                                                                        const updatedEntry = [...prev];
                                                                                        if (updatedEntry[rowIndex]) {
                                                                                            updatedEntry[rowIndex][date.key] = dayjs(e).format("DD/MM/YYYY");
                                                                                        }
                                                                                        setDataPostEntry(updatedEntry)
                                                                                        return updatedEntry;
                                                                                    });

                                                                                    // ถ้าเปลี่ยน date ฝั่งใดฝั่งหนึ่ง ให้อัพเดทอีกฝั่งด้วย
                                                                                    setExitVal((prev: any) => {
                                                                                        // const updatedExit = [...prev];
                                                                                        const updatedExit = prev.map((item: any) => ({
                                                                                            ...item,
                                                                                            [date.key]: dayjs(e).format("DD/MM/YYYY") // Update all date.key fields
                                                                                        }));

                                                                                        setDataPostExit(updatedExit)
                                                                                        return updatedExit;
                                                                                    });


                                                                                } else {
                                                                                    // Handle clearing the value
                                                                                    // ถ้ากด clear จะ set ข้อมูลเป็นวันปัจจุบัน ทำให้เคลียร์ว่างไปเลยไม่ได้ เพราะมันส่งผลต่อการแสดงผล
                                                                                    row[date.key] = undefined;
                                                                                    if (date.key == 5) { // original 33 --> new 5
                                                                                        setEntryDateFrom(undefined)
                                                                                        // setEntryDateFrom(dayjs().format("DD/MM/YYYY"))
                                                                                    } else if (date.key == 6) { // original 34 --> new 6
                                                                                        setEntryDateTo(undefined)
                                                                                        // setEntryDateTo(dayjs().format("DD/MM/YYYY"))
                                                                                    }
                                                                                }
                                                                            }}
                                                                        />
                                                                    </td>
                                                                ) : (
                                                                    // เก่า ค่าในแต่ละเดือน หลัง key 34 
                                                                    // ใหม่ ค่าในแต่ละเดือน หลัง key 6
                                                                    <NumericFormat
                                                                        value={row[date.key] || ''}
                                                                        onValueChange={(values) => {
                                                                            if (parseInt(date.key) > 6) { // original 34 --> new 6
                                                                                // แก้ไขข้อมูลหลังคีย์ 6 ต้องเช็คว่าเท่ากับ exit หรือไม่
                                                                                setIsKeyAfter34Change(true)
                                                                            }

                                                                            const { value } = values;
                                                                            // Update entryVal dynamically
                                                                            setEntryVal((prev: any) => {
                                                                                const updatedEntry = [...prev];
                                                                                if (updatedEntry[rowIndex]) {
                                                                                    updatedEntry[rowIndex][date.key] = value;
                                                                                }
                                                                                setDataPostEntry(updatedEntry)
                                                                                return updatedEntry;
                                                                            });
                                                                        }}
                                                                        thousandSeparator=","
                                                                        decimalScale={3}
                                                                        fixedDecimalScale={true}
                                                                        allowNegative={false}
                                                                        className={`${inputClass} `}
                                                                        style={{
                                                                            textAlign: "right",
                                                                            // minWidth: "110px",
                                                                            // width: "110px",
                                                                            // overflow: "hidden",
                                                                            // whiteSpace: "nowrap",
                                                                        }}
                                                                    />
                                                                )
                                                            ) : (
                                                                formatNumberThreeDecimal(row[date.key]) || ''
                                                            )}
                                                        </td>
                                                    )
                                            )
                                        })
                                        );
                                    } else if (header.subHeaders && header.subHeaders.length > 0) {
                                        // Render data for columns with subHeaders
                                        // ตรงนี้ render Min, Max

                                        // let findKey: any = initialColumnsDynamic?.find((item: any) => item?.label == header ?.label);
                                        // const checkDate: any = functionControlcolSpan(header, 'date'); //example here only data == date
                                        // const checkSubheader: any = functionControlcolSpan(header, 'sub_header'); //example here only data == sub_header

                                        // let dataSub: any = header.subHeaders;
                                        // let checkData: any = []
                                        // for (let index = 0; index < dataSub?.length; index++) {
                                        //     if (columnVisibility[dataSub[index]?.key] == false) {
                                        //         checkData.push({
                                        //             ...dataSub[index],
                                        //             active: false
                                        //         })
                                        //     } else if (columnVisibility[dataSub[index]?.key] == true) {
                                        //         checkData.push({
                                        //             ...dataSub[index],
                                        //             active: true
                                        //         })
                                        //     }
                                        // }

                                        const checkSubheader: any = functionControlcolSpan(header, 'sub_header'); //example here only data == sub_header

                                        return header?.subHeaders?.map((subHeader: any, subIndex: any, arr: any) => (
                                            columnVisibility[subHeader?.key] && (
                                                <td
                                                    key={`${colIndex}-${subIndex}`}
                                                    colSpan={
                                                        checkSubheader?.filter((item: any) => item?.active == false)?.length > 0 ? 2 : 1
                                                    }
                                                    className={`px-4 py-2 border-b border-gray-300 text-center text-[#464255] ${subIndex === arr.length - 1 ? "border-r-2 border-[#E0E0E0]" : checkSubheader?.filter((item: any) => item?.active == false)?.length > 0 ? "border-r-2 border-[#E0E0E0]" : ""}`}
                                                // className={`px-4 py-2 border-b border-gray-300 text-center text-[#464255] ${subIndex === arr.length - 1 ? "border-r-2 border-gray-300" : ""}`}
                                                >
                                                    {/* {row[subHeader?.value] || ''} */}
                                                    {isEditing && modeEditing == 'entry' ? (
                                                        <NumericFormat
                                                            value={row[subHeader?.value] || ''}
                                                            onValueChange={(values) => {
                                                                const { value } = values;
                                                                // Handle value change logic here, e.g., updating state
                                                                setExitVal((prev: any) => {
                                                                    const updatedExit = [...prev];
                                                                    if (updatedExit[rowIndex]) {
                                                                        updatedExit[rowIndex][subHeader?.value] = value;
                                                                    }
                                                                    setDataPostExit(updatedExit)
                                                                    return updatedExit;
                                                                });
                                                            }}
                                                            thousandSeparator=","
                                                            decimalScale={3}
                                                            fixedDecimalScale={true}
                                                            allowNegative={false}
                                                            // className="w-full text-center border border-gray-300 rounded"
                                                            className={`${inputClass}  text-right`}

                                                        />
                                                    ) : (
                                                        // row[subHeader?.value] || ''
                                                        formatNumberThreeDecimal(row[subHeader?.value]) || ""
                                                    )}
                                                </td>
                                            )
                                        ));
                                    }
                                })}
                            </tr>
                        ))
                    }



                    {/* ############### BODY EXIT ############### */}
                    {
                        mode == "exit" && exitVal?.map((row: any, rowIndex: any) => (
                            <tr key={rowIndex} className="hover:bg-gray-50">

                                {/* ZONE */}
                                {columnVisibility.zone && (
                                    <td
                                        key={`10000` + rowIndex}
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

                                {/* ENTRY METER ID */}
                                {/* <td
                                        key={`10001`}
                                        className="px-4 py-2 border-b border-gray-300 text-center text-[#464255]"
                                    >
                                        {``}
                                    </td> */}

                                {/* CONTRACT POINT */}
                                {columnVisibility.area && (
                                    <td
                                        key={`10002`}
                                        className="px-4 py-2 border-b border-gray-300 text-center text-[#464255]"
                                    >
                                        {isEditing && modeEditing === "exit" ? (
                                            <Select
                                                id="area_id"
                                                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                disabled={false} // Enable selectbox when editing
                                                value={row?.[0]}
                                                className={`${selectboxClass}`}
                                                onChange={(e) => {
                                                    setExitVal((prev: any) => {
                                                        const updatedExit = [...prev];

                                                        const filter_contract_point = contractPointData?.data?.find((item: any) => item.contract_point === e.target.value);

                                                        if (updatedExit[rowIndex]) {
                                                            updatedExit[rowIndex][0] = e.target.value;

                                                            group_row_json = group_row_json.map((item: any) => {
                                                                let temps = null;
                                                                if (item?.entry_exit_id === 2) {
                                                                    temps = item?.data.map((itemData: any, ixData: number) => {
                                                                        let contract_point = rowIndex === ixData ? e.target.value : itemData["contract_point"];
                                                                        let zone_text = rowIndex === ixData ? filter_contract_point?.zone?.name : itemData["zone_text"];
                                                                        let area_text = rowIndex === ixData ? filter_contract_point?.area?.name : itemData["area_text"];

                                                                        let data_temps = rowIndex === ixData ? JSON.parse(itemData["data_temp"]) : itemData["data_temp"];
                                                                        let ndata_temps = rowIndex === ixData
                                                                            ? {
                                                                                ...data_temps,
                                                                                ["1"]: filter_contract_point?.zone?.name,
                                                                                ["2"]: filter_contract_point?.area?.name,
                                                                                ["0"]: e.target.value,
                                                                            } : itemData["data_temps"];

                                                                        return {
                                                                            ...itemData,
                                                                            contract_point,
                                                                            zone_text,
                                                                            area_text,
                                                                            data_temps: ndata_temps,
                                                                            data_temp:
                                                                                rowIndex === ixData ? JSON.stringify(ndata_temps) : itemData["data_temp"],
                                                                        };
                                                                    });
                                                                } else {
                                                                    temps = item?.data;
                                                                }
                                                                return { ...item, data: temps };
                                                            });
                                                        }
                                                        setDataPostExit(updatedExit);
                                                        return updatedExit;
                                                    });
                                                }}
                                                sx={{
                                                    ".MuiOutlinedInput-notchedOutline": {},
                                                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#d2d4d8" },
                                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#d2d4d8" },
                                                }}
                                                displayEmpty
                                                renderValue={(value: any) => {
                                                    if (!value) {
                                                        return <Typography color="#9CA3AF" fontSize={14}>{`Contract Point`}</Typography>;
                                                    }
                                                    return (
                                                        contractPointData?.data?.find((item: any) => item.contract_point === value)?.contract_point || ""
                                                    );
                                                }}
                                                MenuProps={{
                                                    PaperProps: {
                                                        style: {
                                                            maxHeight: 48 * 4.5 + 8, // Item height * 4.5 + padding
                                                        },
                                                    },
                                                }}
                                            >
                                                {contractPointData?.data
                                                    ?.filter((item: any) => item?.entry_exit_id === 2)
                                                    .map((item: any) => (
                                                        <MenuItem key={item.id} value={item.contract_point}>
                                                            {item.contract_point}
                                                        </MenuItem>
                                                    ))}
                                            </Select>
                                        ) : (
                                            // Display the existing contract point name when not editing
                                            row?.[0]
                                        )}
                                    </td>
                                )}

                                {/* NEW POINT */}
                                {/* <td
                                        key={`10004`}
                                        className="px-4 py-2 border-b border-gray-300 text-center text-[#464255]"
                                    >
                                        <div className="flex w-[70px] bg-[#FFDEDE] justify-center rounded-full p-1 text-[#464255]">
                                            {`NO`}
                                        </div>
                                    </td> */}

                                {updatedHeadersExit && updatedHeadersExit.map((header: any, colIndex: any) => {
                                    const visibilityKey = visibilityMap[header.label];

                                    // Check if the header has dates
                                    if (header.dates && header.dates.length > 0) {

                                        let findKey: any = initialColumnsDynamic?.find((item: any) => item?.label == header?.label);
                                        const checkDate: any = functionControlcolSpan(header, 'date'); //example here only data == date

                                        // return header.dates2.map((date: any, dateIndex: any, arr: any) => (
                                        //     columnVisibility[visibilityKey] && (

                                        //         <td
                                        //             key={`${colIndex}-${dateIndex}`}
                                        //             className={`px-4 py-2 border-b border-gray-300 text-center text-[#464255] ${dateIndex === arr.length - 1 ? "border-r-2 border-[#E0E0E0]" : ""}`}
                                        //         >
                                        //             {isEditing && modeEditing == 'exit' ? (
                                        //                 /^\d{2}\/\d{2}\/\d{4}$/.test(row[date.key]) || row[date.key] == undefined && (date.key === 5 || date.key === 6) ? ( // original 33 --> new 5 , // original 34 --> new 6
                                        //                     <>
                                        //                         <DatePickaForm
                                        //                             key={"start" + key}
                                        //                             // {...register('start_date')}
                                        //                             readOnly={false} // amend ก็เปิดให้แก้ไขได้
                                        //                             // readOnly={isAmendMode && date.key == 6 ? true : false} // โหมด amend จะแก้ไข period to ไม่ได้ ถ้า isAmendMode == true && date.key == 6 ให้ disable 
                                        //                             placeHolder="Select Date"
                                        //                             mode={'edit-table'}
                                        //                             // valueShow={row[date.key] && dayjs(row[date.key], "DD/MM/YYYY").format("DD/MM/YYYY")}
                                        //                             valueShow={
                                        //                                 isAmendMode && date.key == 5 ? dayjs(amendNewContractStartDate, "YYYY-MM-DD").format("DD/MM/YYYY") : row[date.key]
                                        //                             } // ถ้า isAmendMode == true กำหนด date.key == 5 ให้ใช้วันที่ amendNewContractStartDate ลงใน valueShow

                                        //                             // min={formattedStartDate || undefined}
                                        //                             min={tomorrowDay || undefined}
                                        //                             allowClear
                                        //                             onChange={(e: any) => {
                                        //                                 const formattedNewDate = e ? dayjs(e).format("DD/MM/YYYY") : undefined;
                                        //                                 const currentDate = row[date.key];
                                        //                                 // Check if the new date is different from the current date
                                        //                                 const hasDateChanged = formattedNewDate !== currentDate;
                                        //                                 if (hasDateChanged) {
                                        //                                     setIsDateChange(true);
                                        //                                 } else {
                                        //                                     // Set the flag to false if the new date is the same as the current one
                                        //                                     setIsDateChange(false);
                                        //                                 }

                                        //                                 if (e) {
                                        //                                     // Format the selected date and update the row
                                        //                                     if (date.key == 5) { // original 33 --> new 5
                                        //                                         // updateEntryDate("from", e, exitVal?.length || 0);
                                        //                                         updateExitDate("from", e, exitVal?.length || 0);
                                        //                                     } else if (date.key == 6) { // original 34 --> new 6
                                        //                                         // updateEntryDate("to", e, exitVal?.length || 0);
                                        //                                         updateExitDate("to", e, exitVal?.length || 0);
                                        //                                     }
                                        //                                     setExitVal((prev: any) => {
                                        //                                         const updatedExit = [...prev];
                                        //                                         if (updatedExit[rowIndex]) {
                                        //                                             updatedExit[rowIndex][date.key] = dayjs(e).format("DD/MM/YYYY");
                                        //                                         }
                                        //                                         setDataPostExit(updatedExit)
                                        //                                         return updatedExit;
                                        //                                     });

                                        //                                 } else {
                                        //                                     // Handle clearing the value
                                        //                                     row[date.key] = undefined;
                                        //                                     if (date.key == 5) { // original 33 --> new 5
                                        //                                         setExitDateFrom(undefined)
                                        //                                     } else if (date.key == 6) { // original 34 --> new 6
                                        //                                         setExitDateTo(undefined)
                                        //                                     }
                                        //                                 }

                                        //                             }}
                                        //                         />
                                        //                     </>
                                        //                 ) : (
                                        //                     <NumericFormat
                                        //                         value={row[date.key] || ''}
                                        //                         onValueChange={(values) => {
                                        //                             const { value } = values;
                                        //                             if (parseInt(date.key) > 6) { // original 34 ---> new 6
                                        //                                 setIsKeyAfter34Change(true)
                                        //                             }
                                        //                             setExitVal((prev: any) => {
                                        //                                 const updatedExit = [...prev];
                                        //                                 if (updatedExit[rowIndex]) {
                                        //                                     updatedExit[rowIndex][date.key] = value;
                                        //                                 }
                                        //                                 setDataPostExit(updatedExit)
                                        //                                 return updatedExit;
                                        //                             });
                                        //                         }}
                                        //                         thousandSeparator=","
                                        //                         decimalScale={3}
                                        //                         fixedDecimalScale={true}
                                        //                         allowNegative={false}
                                        //                         className={`${inputClass}  text-right`}
                                        //                     />
                                        //                 )
                                        //             ) : (
                                        //                 // row[date.key] || ''
                                        //                 formatNumberThreeDecimal(row[date.key]) || ''
                                        //             )}
                                        //         </td>
                                        //     )
                                        // ));
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
                                                                // /^\d{2}\/\d{2}\/\d{4}$/.test(row[date.key]) || row[date.key] == undefined && (date.key === 5 || date.key === 6) ? ( // original 33 --> new 5, // original 34 --> new 6
                                                                /^\d{2}\/\d{2}\/\d{4}$/.test(row[date.key]) || row[date.key] == undefined || date.key === 5 || date.key === 6 ? (
                                                                    <td>
                                                                        <DatePickaForm
                                                                            key={"start" + key}
                                                                            // {...register('start_date')}
                                                                            readOnly={false} // amend ก็เปิดให้แก้ไขได้
                                                                            // readOnly={isAmendMode && date.key == 6 ? true : false} // โหมด amend จะแก้ไข period to ไม่ได้ ถ้า isAmendMode == true && date.key == 6 ให้ disable 
                                                                            placeHolder="Select Date"
                                                                            mode={'edit-table'}
                                                                            // valueShow={row[date.key] && dayjs(row[date.key], "DD/MM/YYYY").format("DD/MM/YYYY")}
                                                                            valueShow={
                                                                                isAmendMode && date.key == 5 ? dayjs(amendNewContractStartDate, "YYYY-MM-DD").format("DD/MM/YYYY") : row[date.key]
                                                                            } // ถ้า isAmendMode == true กำหนด date.key == 5 ให้ใช้วันที่ amendNewContractStartDate ลงใน valueShow

                                                                            // min={formattedStartDate || undefined}
                                                                            min={tomorrowDay || undefined}
                                                                            allowClear
                                                                            onChange={(e: any) => {
                                                                                const formattedNewDate = e ? dayjs(e).format("DD/MM/YYYY") : undefined;
                                                                                const currentDate = row[date.key];
                                                                                // Check if the new date is different from the current date
                                                                                const hasDateChanged = formattedNewDate !== currentDate;
                                                                                if (hasDateChanged) {
                                                                                    setIsDateChange(true);
                                                                                } else {
                                                                                    // Set the flag to false if the new date is the same as the current one
                                                                                    setIsDateChange(false);
                                                                                }

                                                                                if (e) {
                                                                                    // Format the selected date and update the row
                                                                                    if (date.key == 5) { // original 33 --> new 5
                                                                                        // updateEntryDate("from", e, exitVal?.length || 0);
                                                                                        updateExitDate("from", e, exitVal?.length || 0);
                                                                                    } else if (date.key == 6) { // original 34 --> new 6
                                                                                        // updateEntryDate("to", e, exitVal?.length || 0);
                                                                                        updateExitDate("to", e, exitVal?.length || 0);
                                                                                    }
                                                                                    setExitVal((prev: any) => {
                                                                                        const updatedExit = [...prev];
                                                                                        if (updatedExit[rowIndex]) {
                                                                                            updatedExit[rowIndex][date.key] = dayjs(e).format("DD/MM/YYYY");
                                                                                        }
                                                                                        setDataPostExit(updatedExit)
                                                                                        return updatedExit;
                                                                                    });

                                                                                } else {
                                                                                    // Handle clearing the value
                                                                                    row[date.key] = undefined;
                                                                                    if (date.key == 5) { // original 33 --> new 5
                                                                                        setExitDateFrom(undefined)
                                                                                    } else if (date.key == 6) { // original 34 --> new 6
                                                                                        setExitDateTo(undefined)
                                                                                    }
                                                                                }

                                                                            }}
                                                                        />
                                                                    </td>
                                                                ) : (
                                                                    // เก่า ค่าในแต่ละเดือน หลัง key 34 
                                                                    // ใหม่ ค่าในแต่ละเดือน หลัง key 6
                                                                    <NumericFormat
                                                                        value={row[date.key] || ''}
                                                                        onValueChange={(values) => {
                                                                            const { value } = values;
                                                                            if (parseInt(date.key) > 6) { // original 34 ---> new 6
                                                                                // แก้ไขข้อมูลหลังคีย์ 6 ต้องเช็คว่าเท่ากับ entry หรือไม่
                                                                                setIsKeyAfter34Change(true)
                                                                            }
                                                                            setExitVal((prev: any) => {
                                                                                const updatedExit = [...prev];
                                                                                if (updatedExit[rowIndex]) {
                                                                                    updatedExit[rowIndex][date.key] = value;
                                                                                }
                                                                                setDataPostExit(updatedExit)
                                                                                return updatedExit;
                                                                            });
                                                                        }}
                                                                        thousandSeparator=","
                                                                        decimalScale={3}
                                                                        fixedDecimalScale={true}
                                                                        allowNegative={false}
                                                                        className={`${inputClass}  text-right`}
                                                                    />
                                                                )
                                                            ) : (
                                                                formatNumberThreeDecimal(row[date.key]) || ''
                                                            )}
                                                        </td>
                                                    )
                                                    )
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
                                                                // /^\d{2}\/\d{2}\/\d{4}$/.test(row[date.key]) || row[date.key] == undefined && (date.key === 5 || date.key === 6) ? ( // original 33 --> new 5, // original 34 --> new 6
                                                                /^\d{2}\/\d{2}\/\d{4}$/.test(row[date.key]) || row[date.key] == undefined || date.key === 5 || date.key === 6 ? (
                                                                    <td>
                                                                        <DatePickaForm
                                                                            key={"start" + key}
                                                                            // {...register('start_date')}
                                                                            readOnly={false} // amend ก็เปิดให้แก้ไขได้
                                                                            // readOnly={isAmendMode && date.key == 6 ? true : false} // โหมด amend จะแก้ไข period to ไม่ได้ ถ้า isAmendMode == true && date.key == 6 ให้ disable 
                                                                            placeHolder="Select Date"
                                                                            mode={'edit-table'}
                                                                            // valueShow={row[date.key] && dayjs(row[date.key], "DD/MM/YYYY").format("DD/MM/YYYY")}
                                                                            valueShow={
                                                                                isAmendMode && date.key == 5 ? dayjs(amendNewContractStartDate, "YYYY-MM-DD").format("DD/MM/YYYY") : row[date.key]
                                                                            } // ถ้า isAmendMode == true กำหนด date.key == 5 ให้ใช้วันที่ amendNewContractStartDate ลงใน valueShow

                                                                            // min={formattedStartDate || undefined}
                                                                            min={tomorrowDay || undefined}
                                                                            allowClear
                                                                            onChange={(e: any) => {
                                                                                const formattedNewDate = e ? dayjs(e).format("DD/MM/YYYY") : undefined;
                                                                                const currentDate = row[date.key];
                                                                                // Check if the new date is different from the current date
                                                                                const hasDateChanged = formattedNewDate !== currentDate;
                                                                                if (hasDateChanged) {
                                                                                    setIsDateChange(true);
                                                                                } else {
                                                                                    // Set the flag to false if the new date is the same as the current one
                                                                                    setIsDateChange(false);
                                                                                }

                                                                                if (e) {
                                                                                    // Format the selected date and update the row
                                                                                    if (date.key == 5) { // original 33 --> new 5
                                                                                        // updateEntryDate("from", e, exitVal?.length || 0);
                                                                                        updateExitDate("from", e, exitVal?.length || 0);
                                                                                    } else if (date.key == 6) { // original 34 --> new 6
                                                                                        // updateEntryDate("to", e, exitVal?.length || 0);
                                                                                        updateExitDate("to", e, exitVal?.length || 0);
                                                                                    }
                                                                                    setExitVal((prev: any) => {
                                                                                        const updatedExit = [...prev];
                                                                                        if (updatedExit[rowIndex]) {
                                                                                            updatedExit[rowIndex][date.key] = dayjs(e).format("DD/MM/YYYY");
                                                                                        }
                                                                                        setDataPostExit(updatedExit)
                                                                                        return updatedExit;
                                                                                    });

                                                                                } else {
                                                                                    // Handle clearing the value
                                                                                    row[date.key] = undefined;
                                                                                    if (date.key == 5) { // original 33 --> new 5
                                                                                        setExitDateFrom(undefined)
                                                                                    } else if (date.key == 6) { // original 34 --> new 6
                                                                                        setExitDateTo(undefined)
                                                                                    }
                                                                                }

                                                                            }}
                                                                        />
                                                                    </td>
                                                                ) : (
                                                                    // เก่า ค่าในแต่ละเดือน หลัง key 34 
                                                                    // ใหม่ ค่าในแต่ละเดือน หลัง key 6
                                                                    <NumericFormat
                                                                        value={row[date.key] || ''}
                                                                        onValueChange={(values) => {
                                                                            const { value } = values;
                                                                            if (parseInt(date.key) > 6) { // original 34 ---> new 6
                                                                                // แก้ไขข้อมูลหลังคีย์ 6 ต้องเช็คว่าเท่ากับ entry หรือไม่
                                                                                setIsKeyAfter34Change(true)
                                                                            }
                                                                            setExitVal((prev: any) => {
                                                                                const updatedExit = [...prev];
                                                                                if (updatedExit[rowIndex]) {
                                                                                    updatedExit[rowIndex][date.key] = value;
                                                                                }
                                                                                setDataPostExit(updatedExit)
                                                                                return updatedExit;
                                                                            });
                                                                        }}
                                                                        thousandSeparator=","
                                                                        decimalScale={3}
                                                                        fixedDecimalScale={true}
                                                                        allowNegative={false}
                                                                        className={`${inputClass}  text-right`}
                                                                    />
                                                                )
                                                            ) : (
                                                                formatNumberThreeDecimal(row[date.key]) || ''
                                                            )}
                                                        </td>
                                                    )
                                            )
                                        })
                                        );
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
                                                                const { value } = values;
                                                                // Handle value change logic here, e.g., updating state
                                                                setExitVal((prev: any) => {
                                                                    const updatedExit = [...prev];
                                                                    if (updatedExit[rowIndex]) {
                                                                        updatedExit[rowIndex][subHeader?.value] = value;
                                                                    }
                                                                    setDataPostExit(updatedExit)
                                                                    return updatedExit;
                                                                });
                                                            }}
                                                            thousandSeparator=","
                                                            decimalScale={3}
                                                            fixedDecimalScale={true}
                                                            allowNegative={false}
                                                            // className="w-full text-center border border-gray-300 rounded"
                                                            className={`${inputClass}  text-right`}

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
                            // const filter_contract_point = contractPointData?.data?.find((item: any) => item.contract_point === entry["region"]);
                            const masterUse: any = initialColumnsDynamic?.filter((item: any, key: any) => key == 0 || key == 1);
                            let resultMaster: any = false;
                            let count: any = 0;

                            for (let index = 0; index < masterUse?.length; index++) {
                                if (columnVisibility[masterUse[index]?.key] == false) {
                                    count = count + 1;
                                    resultMaster = false;
                                }

                                if (count == (masterUse?.length ?? 0)) {
                                    resultMaster = true;
                                }
                            }
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
                                        // key == 0 || key == 1 ||

                                        // const masterUse: any = initialColumnsDynamic?.filter((item: any, key: any) => key == 0 || key == 1);
                                        // const masterID: any = masterUse?.find((item: any, key: any) => key == index)?.key;
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
                                        // else{
                                        //     let count: any = 0;

                                        //     for (let index = 0; index < masterUse?.length; index++) {
                                        //         if(columnVisibility[masterUse[index]?.key] == false){
                                        //             count = count + 1;
                                        //             resultMaster = false;
                                        //         }

                                        //         if(count == masterUse?.length){
                                        //             resultMaster = true;
                                        //         }
                                        //     }

                                        // }

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

                                    {/* {updatedHeaders && updatedHeaders?.map((header: any, colIndex: any) => { */}

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

                                                const findHeader: any = updatedHeaders?.find((item: any) => item?.label == columnOrder?.[Math.floor(col_order_num)]);
                                                const headerData: any = findHeader?.dates2;
                                                const thisData: any = headerData?.find((item: any) => item?.key == index);
                                                const thisLastItem: any = [];
                                                let findKey: any = initialColumnsDynamic?.find((item: any) => item?.label == findHeader?.label);

                                                let pathKey: any = findKey?.key + "_" + formatDateToMonthYear(thisData?.value);

                                                for (let ix = 0; ix < headerData?.length; ix++) {
                                                    if (columnVisibility[findKey?.key + "_" + formatDateToMonthYear(headerData[ix]?.value)] == true) {
                                                        thisLastItem.push(headerData[ix])
                                                    }
                                                }


                                                if (headerData) {
                                                    return columnVisibility[pathKey] == true && (
                                                        <td
                                                            key={index + "_map_sum_entry"}
                                                            className={`
                                                                px-4 
                                                                py-2 
                                                                font-bold
                                                                text-center 
                                                                text-[#464255] 
                                                                ${isGroupEnd ? "border-r-2 border-[#E0E0E0]" : ""}
                                                                ${thisLastItem?.length == 1 ? "border-r-2 border-[#E0E0E0]" :
                                                                    thisLastItem?.length > 1 ? thisLastItem?.findIndex((item: any) => item?.key == index) == (thisLastItem?.length - 1) && "border-r-2 border-[#E0E0E0]" : ""}
                                                            `}
                                                        >
                                                            {formatNumberThreeDecimal(entry[key]) || ""}
                                                        </td>
                                                    )
                                                }
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
                                        className="px-4 py-2 text-left font-bold text-[#464255]"
                                    >
                                        {`Sum Exit ${exit?.zone?.name}`}
                                    </td>

                                    {Array.from({ length: 7 }).map((_, index) => {
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

                                    {Object.keys(exit).map((key, index) => {
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

                                            const findHeader: any = updatedHeaders?.find((item: any) => item?.label == columnOrder?.[Math.floor(col_order_num)]);
                                            const headerData: any = findHeader?.dates2;
                                            const thisData: any = headerData?.find((item: any) => item?.key == index);
                                            const thisLastItem: any = [];
                                            let findKey: any = initialColumnsDynamic?.find((item: any) => item?.label == findHeader?.label);

                                            let pathKey: any = findKey?.key + "_" + formatDateToMonthYear(thisData?.value);

                                            for (let ix = 0; ix < headerData?.length; ix++) {
                                                if (columnVisibility[findKey?.key + "_" + formatDateToMonthYear(headerData[ix]?.value)] == true) {
                                                    thisLastItem.push(headerData[ix])
                                                }
                                            }

                                            if (headerData) {
                                                return columnVisibility[pathKey] == true && (
                                                    <td
                                                        key={index + "_map_sum_entry"}
                                                        className={`
                                                            px-4 
                                                            py-2 
                                                            font-bold
                                                            text-center 
                                                            text-[#464255] 
                                                            ${isGroupEnd ? "border-r-2 border-[#E0E0E0]" : ""}
                                                            ${thisLastItem?.length == 1 ? "border-r-2 border-[#E0E0E0]" :
                                                                thisLastItem?.length > 1 ? thisLastItem?.findIndex((item: any) => item?.key == index) == (thisLastItem?.length - 1) && "border-r-2 border-[#E0E0E0]" : ""}
                                                        `}
                                                    >
                                                        {formatNumberThreeDecimal(exit[key]) || ""}
                                                    </td>
                                                )
                                            }

                                            // const visibilityKey = visibilityMap[columnOrder[col_order_num]];
                                            // if (!columnVisibility[visibilityKey]) {
                                            //     return null;
                                            // }
                                            // return (
                                            //     <td
                                            //         key={index + "_map_sum_exit"}
                                            //         className={`px-4 py-2 border-b font-bold border-gray-300 text-center text-[#464255] ${isGroupEnd ? "border-r-2 border-[#E0E0E0]" : ""}`}
                                            //     >
                                            //         {formatNumberThreeDecimal(exit[key]) || ""}
                                            //     </td>
                                            // );
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

                                        const findHeader: any = updatedHeaders?.find((item: any) => item?.label == columnOrder?.[Math.floor(col_order_num)]);
                                        const headerData: any = findHeader?.dates2;
                                        const thisData: any = headerData?.find((item: any) => item?.key == key[0]);
                                        const thisLastItem: any = [];
                                        let findKey: any = initialColumnsDynamic?.find((item: any) => item?.label == findHeader?.label);

                                        let pathKey: any = findKey?.key + "_" + formatDateToMonthYear(thisData?.value);

                                        for (let ix = 0; ix < headerData?.length; ix++) {

                                            if (columnVisibility[findKey?.key + "_" + formatDateToMonthYear(headerData[ix]?.value)] == true) {
                                                thisLastItem.push(headerData[ix])
                                            }
                                        }

                                        return columnVisibility[pathKey] == true && (
                                            <td
                                                key={value + "_map_entry"}
                                                className={`
                                                    px-4 
                                                    py-2 
                                                    font-bold 
                                                    text-center 
                                                    text-[#ffffff] 
                                                    ${isGroupEnd ? "border-r-2 border-[#E0E0E0]" : ""}
                                                    ${thisLastItem?.length == 1 ? "border-r-2 border-[#E0E0E0]" :
                                                        thisLastItem?.length > 1 ? thisLastItem?.findIndex((item: any) => item?.key == value) == (thisLastItem?.length - 1) && "border-r-2 border-[#E0E0E0]" : ""}
                                                `}
                                            >
                                                {formatNumberThreeDecimal(key[1]) || ""}
                                            </td>
                                        )

                                        // if(headerData){
                                        //     return columnVisibility[pathKey] == true && (
                                        //         <td
                                        //             key={value + "_map_entry"}
                                        //             className={`px-4 py-2 font-bold text-center text-[#ffffff] ${isGroupEnd ? "border-r-2 border-[#E0E0E0]" : ""} `}
                                        //         >
                                        //             {formatNumberThreeDecimal(key[1]) || ""}
                                        //         </td>
                                        //     )
                                        // }

                                        // const visibilityKey = visibilityMap[columnOrder[col_order_num]];
                                        // if (!columnVisibility[visibilityKey]) {
                                        //     return null;
                                        // }

                                        // return (
                                        //     <td
                                        //         key={value + "_map_entry"}
                                        //         className={`px-4 py-2 font-bold text-center text-[#ffffff] ${isGroupEnd ? "border-r-2 border-[#E0E0E0]" : ""} `}
                                        //     >
                                        //         {formatNumberThreeDecimal(key[1]) || ""}
                                        //     </td>
                                        // );
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
                                className="px-4 py-2 text-left font-bold text-[#ffffff]"
                            >
                                {`TOTAL EXIT`}
                            </td>

                            {Array.from({ length: 7 }).map((_, index) => {
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

                                        const isGroupEnd = groupSize > 1 ? (value - 6) % groupSize === 0 : 1;
                                        const col_order_num = groupSize > 1 ? Math.floor((value - 7) / groupSize) : 1

                                        const columnOrder = [
                                            "Capacity Daily Booking (MMBTU/d)",
                                            "Maximum Hour Booking (MMBTU/h)",
                                        ];

                                        // const visibilityKey = visibilityMap[columnOrder[col_order_num]];
                                        // if (!columnVisibility[visibilityKey]) {
                                        //     return null;
                                        // }

                                        // return (
                                        //     <td
                                        //         key={value + "_map_exit"}
                                        //         className={`px-4 py-2 font-bold text-center text-[#ffffff] ${isGroupEnd ? "border-r-2 border-[#E0E0E0]" : ""} `}
                                        //     >
                                        //         {formatNumberThreeDecimal(key[1]) || ""}
                                        //     </td>
                                        // );

                                        const findHeader: any = updatedHeaders?.find((item: any) => item?.label == columnOrder?.[Math.floor(col_order_num)]);
                                        const headerData: any = findHeader?.dates2;
                                        const thisData: any = headerData?.find((item: any) => item?.key == key[0]);
                                        const thisLastItem: any = [];
                                        let findKey: any = initialColumnsDynamic?.find((item: any) => item?.label == findHeader?.label);

                                        let pathKey: any = findKey?.key + "_" + formatDateToMonthYear(thisData?.value);

                                        for (let ix = 0; ix < headerData?.length; ix++) {
                                            if (columnVisibility[findKey?.key + "_" + formatDateToMonthYear(headerData[ix]?.value)] == true) {
                                                thisLastItem.push(headerData[ix])
                                            }
                                        }

                                        return columnVisibility[pathKey] == true && (
                                            <td
                                                key={value + "_map_exit"}
                                                className={`
                                                    px-4 
                                                    py-2 
                                                    font-bold 
                                                    text-center 
                                                    text-[#ffffff] 
                                                    ${isGroupEnd ? "border-r-2 border-[#E0E0E0]" : ""}
                                                    ${thisLastItem?.length == 1 ? "border-r-2 border-[#E0E0E0]" :
                                                        thisLastItem?.length > 1 ? thisLastItem?.findIndex((item: any) => item?.key == value) == (thisLastItem?.length - 1) && "border-r-2 border-[#E0E0E0]" : ""}
                                                `}
                                            >
                                                {formatNumberThreeDecimal(key[1]) || ""}
                                            </td>
                                        )

                                    }
                                    return null;
                                })
                            }
                        </tr>
                    }


                </tbody>
            </table>
        </div >
    );
};

export default MotherTable2;