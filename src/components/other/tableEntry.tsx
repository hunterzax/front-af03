import { useFetchMasters } from '@/hook/fetchMaster';
import { adjustDateIfTO, adjustDateIfTOShortTerm, applyDatesToData, extendHeaderDates, extendHeaderDatesForTypeFour, formatDateToDayMonthYear, formatDateToMonthYear, formatMonthYear, formatNumberThreeDecimal, generateDailyRange, generateHeaders, generateMonthlyRange, getContrastTextColor, grandTotalSumCapaContractMgn, isSameHeader, mapEntryWithDate, parseDateHeader, sortByMonthYear, sumByZone, summarizeDataByZone, sumValuesByKey, updateDataRowAfterFromTo, updateEntryValWithNewKeys, updateRow } from '@/utils/generalFormatter';
import { table_col_arrow_sort_style, table_header_style, table_sort_header_style } from '@/utils/styles';
import React, { useEffect, useMemo, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import DatePickaForm from '../library/dateRang/dateSelectForm';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import minMax from 'dayjs/plugin/minMax';
import { useAppDispatch } from '@/utils/store/store';
import { fetchContractPoint } from '@/utils/store/slices/contractPointSlice';
import SelectFormProps from './selectProps';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

dayjs.extend(customParseFormat);
dayjs.extend(minMax);

const inputClass = "text-[14px] block p-2 h-[37px] w-full border-[1px] bg-white border-[#464255] outline-none bg-opacity-100 focus:border-[#00ADEF] hover:!p-2 focus:!p-2";

const TableEntry: React.FC<any> = ({ columnVisibility, setcolumnVisibility, initialColumnsDynamic, setinitialColumnsDynamic, setGroupRowJsonState, dataTable, mode, isEditing, modeEditing, setDataPostExit, setDataPostEntry, isSaved, setDataHeaderEntry, setDataHeaderExit, setIsDateChange, setIsKeyAfter34Change, originOrSum, isSaveClick, amendNewContractStartDate, isAmendMode, dataContractTermType, isDateChange, setIsReset, isReset, isCancelClick, setIsCancelClick, trickerColumn = false, settrickerColumn, setIsAmendMode, maxDateAmend, selectedBookingTemplate, termTypeId, shadowPeriod, setDateFromToCheckEntry, sumValEdited, setSumValEdited }) => {
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

    const HEADER_ORDER = [
        'Capacity Daily Booking (MMBTU/d)',
        'Capacity Daily Booking (MMscfd)',
        'Maximum Hour Booking (MMBTU/h)',
        'Maximum Hour Booking (MMscfh)',
    ];

    const [mainData, setMainData] = useState<any>();
    const [headerEntryOriginal, setHeaderEntryOriginal] = useState<any>();

    // header ตรงที่เป็นวันที่
    const [headerEntryDateCapDailyBookingMmbtu, setHeaderEntryDateCapDailyBookingMmbtu] = useState<any>();
    const [headerEntryDateMaxHourBookingMmbtu, setHeaderEntryDateMaxHourBookingMmbtu] = useState<any>();
    const [headerEntryDateCapDailyBookingMmscfd, setHeaderEntryDateCapDailyBookingMmscfd] = useState<any>();
    const [headerEntryDateMaxHourBookingMmscfd, setHeaderEntryDateMaxHourBookingMmscfd] = useState<any>();
    const [headerOrigin, setHeaderOrigin] = useState<any>();

    // table row data ตรงที่อยู่ใต้วันที่
    const [dataRowAfterFromTo, setDataRowAfterFromTo] = useState<any>([]);

    // summary data 
    const [summaryData, setSummaryData] = useState<any>();

    // grand summary
    const [grandSumTotal, setGrandSumTotal] = useState<any>();

    const [modeEditPeriod, setModeEditPeriod] = useState<any>('');

    // is edit 2nd time
    const [IsEditedPeriod, setIsEditedPeriod] = useState<boolean>(false);

    useEffect(() => {
        if (dataTable) {
            let jsonString: any
            if (originOrSum == "ORIGIN") {
                jsonString = dataTable?.booking_full_json[0]?.data_temp;
            } else if (originOrSum == "SUMMARY") {
                // ถ้ายังไม่ได้กด release ให้เอา dataTable?.booking_full_json ไปแสดงก่อน
                const booking_full_json_release: any[] = dataTable?.booking_full_json_release?.filter((item: any) => item?.flag_use == true) || []
                jsonString = booking_full_json_release?.length > 0 && booking_full_json_release[0]?.data_temp ? booking_full_json_release[0]?.data_temp : dataTable?.booking_full_json[0]?.data_temp;
            }

            const dataJSON = JSON.parse(jsonString)

            setMainData(dataTable)
            setHeaderEntryOriginal(dataJSON?.headerEntry)
            setEntryValEdited(dataJSON?.entryValue)
            setSortedData(dataJSON?.entryValue);
            setSumValEdited(dataJSON?.sumEntries);

            if (trickerColumn == false) {
                processingData(dataJSON);
            }
        }
    }, [dataTable, originOrSum])

    let masterColumnsDynamicEntry = [
        { key: 'zone', label: 'Zone', visible: true },
        { key: 'area', label: 'Area', visible: true },
        { key: 'contract_point', label: 'Contract Point', visible: true },
        // // Template Booking และในหน้า UI ไม่อยากให้มี Pressure กับ Temp ไม่อยากให้ Shipper ใส่ค่าได้ https://app.clickup.com/t/86evh203h
        // { key: 'pressure_range', label: 'Pressure Range', visible: true },
        // { key: 'Pressure Range.Min', label: 'Pressure Range Min', visible: true, parent_id: 'pressure_range' },
        // { key: 'Pressure Range.Max', label: 'Pressure Range Max', visible: true, parent_id: 'pressure_range' },
        // { key: 'temperature_range', label: 'Temperature Range', visible: true },
        // { key: 'Temperature Range.Min', label: 'Temperature Range Min', visible: true, parent_id: 'temperature_range' },
        // { key: 'Temperature Range.Max', label: 'Temperature Range Max', visible: true, parent_id: 'temperature_range' },
        { key: 'period', label: 'Period', visible: true },
        { key: 'From', label: 'Period From', visible: true, parent_id: 'period' },
        { key: 'To', label: 'Period To', visible: true, parent_id: 'period' },
        { key: 'capacity_daily_booking_mmbtu', label: 'Capacity Daily Booking (MMBTU/D)', visible: true },
        { key: 'maximum_hour_booking_mmbtu', label: 'Maximum Hour Booking (MMBTU/H)', visible: true },
        // { key: 'capacity_daily_booking_mmscfd', label: 'Capacity Daily Booking (MMscdf)', visible: true },
        // { key: 'maximum_hour_booking_mmscfd', label: 'Maximum Hour Booking (MMscfh)', visible: true },
        { key: 'capacity_daily_booking_mmscfd', label: 'Capacity Daily Booking (MMSCFD)', visible: true },
        { key: 'maximum_hour_booking_mmscfd', label: 'Maximum Hour Booking (MMSCFH)', visible: true },
    ];

    // #region processingData
    const processingData = async (data_val: any) => {
        const changeArr = Object.entries(data_val['headerEntry'])?.map(([txt, data]: any) => {
            let dataArr: any = Object.entries(data)?.map(([date, values]: any) => {
                if (dataContractTermType?.id === 4) {
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

        let convertDataArr: any = changeArr?.filter((item: any) => item?.key !== 'Entry' && item?.key !== 'Period');

        if (convertDataArr?.length > 0) {
            let newData: any = [];
            let parentData: any = [];

            newData = masterColumnsDynamicEntry?.map((item: any) => {
                return { ...item, visible: columnVisibility[item?.key] }
            })

            // Iterate over the array once
            for (let i = 0; i < convertDataArr.length; i++) {
                const dataArr = convertDataArr[i]?.data;

                // Filter and reverse the array once
                const filteredData = dataArr?.filter((item: any) => item?.key !== 'key')?.reverse();

                if (filteredData?.length > 0) {
                    const filterResult: any = filteredData;

                    for (let ix = 0; ix < filterResult.length; ix++) {

                        const extractParenUpper = (text: string) => {
                            const match = text.match(/^(.+?)\s*\(([^)]+)\)$/);
                            if (!match) return null;

                            const name = match[1].trim();             // ชื่อก่อนวงเล็บ
                            const code = match[2].toUpperCase();      // คำในวงเล็บ แปลงเป็นตัวใหญ่
                            return name + " (" + code + ")";
                        }

                        const item = filterResult[ix];
                        const key = item?.key;
                        const parentKey = extractParenUpper(convertDataArr[i]?.key);

                        // Call the render function
                        const result = await renderDateColumnMenu(key, key, parentKey);

                        parentData.push(...result)
                    }
                }
            }

            parentData?.map((f: any) => {
                let findIDX: any = newData?.findIndex((item: any) => item?.key == f?.parent_id) + 1;
                let resultLabel: any;

                if (dataContractTermType?.id === 4) {
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

            setinitialColumnsDynamic(newData)
            settrickerColumn(true);
        }
    }

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

    const generateColumnVisibility = (columns: any) => Object.fromEntries(columns.map(({ key, visible }: any) => [key, visible]));


    // #region ตรงนี้เข้าแค่ครั้งแรก
    useEffect(() => {
        if (mainData) {
            let data_temp = JSON.parse(mainData?.booking_full_json[0]?.data_temp);

            if (originOrSum == "ORIGIN") {
                data_temp = JSON.parse(mainData?.booking_full_json[0]?.data_temp);
            } else if (originOrSum == "SUMMARY") {
                // ถ้ายังไม่ได้กด release ให้เอา dataTable?.booking_full_json ไปแสดงก่อน
                const booking_full_json_release: any[] = mainData?.booking_full_json_release?.filter((item: any) => item?.flag_use == true) || []
                data_temp = booking_full_json_release?.length > 0 && booking_full_json_release[0]?.data_temp ? JSON.parse(booking_full_json_release[0]?.data_temp) : JSON.parse(mainData?.booking_full_json[0]?.data_temp);
            }

            const setters = [
                setHeaderEntryDateCapDailyBookingMmbtu,
                setHeaderEntryDateCapDailyBookingMmscfd,
                setHeaderEntryDateMaxHourBookingMmbtu,
                setHeaderEntryDateMaxHourBookingMmscfd,
            ];

            let dateKeysX: any

            // เรียงวันเดือนปีใหม่
            HEADER_ORDER.forEach((key, index) => {
                const dateKeys = Object.keys(data_temp.headerEntry[key] || {}).filter((k) => k !== 'key');
                const sortedDateKeys = [...dateKeys].sort((a, b) => dayjs(a, "DD/MM/YYYY").valueOf() - dayjs(b, "DD/MM/YYYY").valueOf());

                dateKeysX = sortedDateKeys
                setters[index](sortedDateKeys);
                setHeaderOrigin(dateKeysX)
            });

            const modifiedOutput = mapEntryWithDate(data_temp.entryValue, dateKeysX, contractPointData?.data);
            setDataRowAfterFromTo(modifiedOutput)

            const summaryResult = summarizeDataByZone(modifiedOutput);
            setSummaryData(summaryResult);

            // const grandSumModifiedOutput = mapEntryWithDate([data_temp.sumEntries], dateKeysX, contractPointData?.data);
            // const grandSumSummaryResult = summarizeDataByZone(grandSumModifiedOutput);
            // const grandSum = grandTotalSumCapaContractMgn(grandSumSummaryResult);
            // // const grandSum = grandTotalSumCapaContractMgn(summaryResult);
            // setGrandSumTotal(grandSum)

            setHeaderOrigin(dateKeysX)
        }

    }, [mainData])


    // #region update header
    // ถ้าเปลี่ยน period from, to
    // ถ้าเป็น short term non-firm ตัว header จะแสดงเป็นรายวัน
    const updateHeader = (mode: any, date: any) => {

        // V.2.0.109 Edit ยังไม่ได้ Table เพี้ยน https://app.clickup.com/t/86euzxxkc
        // เช็คว่าถ้า mode == "TO" และ date เป็นวันที่ 1 ของเดือน ให้ subtract ไป 1 วัน
        let date_str = adjustDateIfTO(mode, date);
        const targetDate: any = parseDateHeader(date_str); // e.g., "16/03/2025"

        if (dataContractTermType?.id === 4) { // 4 คือ short term non-firm
            let date_str_short = adjustDateIfTOShortTerm(mode, date);
            const targetDateShrtTerm = parseDateHeader(date_str_short); // e.g., "16/03/2025"
            extendHeaderDatesForTypeFour(setHeaderEntryDateCapDailyBookingMmbtu, targetDateShrtTerm, mode);
            extendHeaderDatesForTypeFour(setHeaderEntryDateCapDailyBookingMmscfd, targetDateShrtTerm, mode);
            extendHeaderDatesForTypeFour(setHeaderEntryDateMaxHourBookingMmbtu, targetDateShrtTerm, mode);
            extendHeaderDatesForTypeFour(setHeaderEntryDateMaxHourBookingMmscfd, targetDateShrtTerm, mode);
        } else {
            extendHeaderDates(setHeaderEntryDateCapDailyBookingMmbtu, targetDate, mode);
            extendHeaderDates(setHeaderEntryDateCapDailyBookingMmscfd, targetDate, mode);
            extendHeaderDates(setHeaderEntryDateMaxHourBookingMmbtu, targetDate, mode);
            extendHeaderDates(setHeaderEntryDateMaxHourBookingMmscfd, targetDate, mode);
        }
    }

    // #region updateRow
    // header ต้องอัพเดทก่อนแล้วค่อยไปอัพเดท row
    useEffect(() => {

        // let value_one = updateRow(modeEditPeriod, headerEntryDateCapDailyBookingMmbtu, headerOrigin, entryValEdited)
        let value_one = updateRow(modeEditPeriod, headerEntryDateCapDailyBookingMmbtu, headerOrigin, IsEditedPeriod ? entryValOriginal : entryValEdited)

        if (IsEditedPeriod) {
            // ยัดวันที่ from - to ลงชุดข้อมูลที่จะใช้
            value_one = applyDatesToData(value_one, entryValEdited);
        }

        if (value_one !== undefined) {
            setEntryValEdited(value_one)
            // ==================================== UPDATE SUM ====================================
            const result = updateDataRowAfterFromTo(value_one, dataRowAfterFromTo);

            const summaryResult = summarizeDataByZone(result);
            setSummaryData(summaryResult);

            const minFrom : dayjs.Dayjs | undefined = value_one.reduce((acc: any, item: any) => {
                const from = item?.["5"]
                const dayjsFrom = dayjs(from, "DD/MM/YYYY")
                if(dayjsFrom.isValid()){
                    if(acc === undefined){
                        return dayjsFrom
                    }
                    else{
                        return dayjsFrom.isBefore(acc) ? dayjsFrom : acc
                    }
                }
                return acc
            }, undefined);
            const maxTo : dayjs.Dayjs | undefined = value_one.reduce((acc: any, item: any) => {
                const to = item?.["6"]
                const dayjsTo = dayjs(to, "DD/MM/YYYY")
                if(dayjsTo.isValid()){
                    if(acc === undefined){
                        return dayjsTo
                    }
                    else{
                        return dayjsTo.isAfter(acc) ? dayjsTo : acc
                    }
                }
                return acc
            }, undefined);

            let grandSumInput = IsEditedPeriod ? dataTableVal.sumEntries : sumValEdited
            if(grandSumInput){
                if(minFrom){
                    grandSumInput["5"] = minFrom.format("DD/MM/YYYY")
                }
                if(maxTo){
                    grandSumInput["6"] = maxTo.format("DD/MM/YYYY")
                }
            }
            // let grandSumSummaryResult: any[] = [];
            let grandSumValueOne = updateRow(modeEditPeriod, headerEntryDateCapDailyBookingMmbtu, headerOrigin, [grandSumInput])
            if (IsEditedPeriod) {
                // ยัดวันที่ from - to ลงชุดข้อมูลที่จะใช้
                grandSumValueOne = applyDatesToData(grandSumValueOne, [sumValEdited]);
            }
            if (grandSumValueOne !== undefined) {
                setSumValEdited((Array.isArray(grandSumValueOne) && grandSumValueOne.length > 0) ? grandSumValueOne[0] : grandSumValueOne)
            //     const grandSumResult = updateDataRowAfterFromTo(grandSumValueOne, [sumValEdited]);
            //     grandSumSummaryResult = summarizeDataByZone(grandSumResult);
            }
            // else{
            //     grandSumSummaryResult = summaryResult;
            // }
            // const grandSum = grandTotalSumCapaContractMgn(grandSumSummaryResult);
            // // const grandSum = grandTotalSumCapaContractMgn(summaryResult);
            // setGrandSumTotal(grandSum)
            // // settrickerEdit(false)
        }
    }, [headerEntryDateCapDailyBookingMmbtu])


    useEffect(() => {
        const headerGroups = {
            "Capacity Daily Booking (MMBTU/d)": headerEntryDateCapDailyBookingMmbtu,
            "Maximum Hour Booking (MMBTU/h)": headerEntryDateMaxHourBookingMmbtu,
            "Capacity Daily Booking (MMscfd)": headerEntryDateCapDailyBookingMmscfd,
            "Maximum Hour Booking (MMscfh)": headerEntryDateMaxHourBookingMmscfd,
        };

        let mod_header_entry: any = {};
        let currentKey = 7;

        // เอาข้อมูลจาก headerEntryDateCapDailyBookingMmbtu, headerEntryDateMaxHourBookingMmbtu, headerEntryDateCapDailyBookingMmscfd, headerEntryDateMaxHourBookingMmscfd
        // ใส่เข้าไปใน mod_header_entry และใส่คีย์ เริ่มต้นที่คีย์ 7
        for (const [groupName, dateArray] of Object.entries(headerGroups)) {
            mod_header_entry[groupName] = {};
            const startKey = currentKey;

            dateArray?.forEach((date: any) => {
                mod_header_entry[groupName][date] = { key: String(currentKey++) };
            });

            mod_header_entry[groupName]["key"] = String(startKey);
        }
        setDataHeaderEntry(mod_header_entry)

    }, [headerEntryDateCapDailyBookingMmbtu])


    // ############ SUMMARY ############
    const [trickerEdit, settrickerEdit] = useState<boolean>(false);

    // ตอน edit ค่าใน row หลัง FROM - TO ตรง sum จะ update ด้วย
    // #region update row
    useEffect(() => {
        if (dataRowAfterFromTo && trickerEdit == true) {
            // here edit after from to
            const summaryResult = summarizeDataByZone(dataRowAfterFromTo);
            setSummaryData(summaryResult);

            // const grandSumSummaryResult = summarizeDataByZone([sumValEdited]);
            // const grandSum = grandTotalSumCapaContractMgn(grandSumSummaryResult);
            // // const grandSum = grandTotalSumCapaContractMgn(summaryResult);
            // setGrandSumTotal(grandSum)


            // ^ พี่บีมปิดไปทำให้ Row Total ไม่ update ทำให้ตารางเพี้ยน ไม่รู้สาเหตุปิดทำไมปล่อยไว้ก่อนรอถาม
            // เบื่้องต้นปรับโค้ด useEffect [sumValEdited, headerOrigin] จึงทำให้ amend edit ได้แล้ว ไม่รู้มี process ไหนกระทบไหม
           

            settrickerEdit(false)
        }
    }, [dataRowAfterFromTo])

    useEffect(() => {
        // console.log('EN:::::::');
        // console.log('sumValEdited : ', sumValEdited);
        if(sumValEdited && headerEntryDateCapDailyBookingMmbtu){
            // console.log('En.....');
            // console.log('summaryData : ', summaryData);
            // const grandSumModifiedOutput = mapEntryWithDate([sumValEdited], headerOrigin, contractPointData?.data);
            const grandSumModifiedOutput = mapEntryWithDate([sumValEdited], headerEntryDateCapDailyBookingMmbtu, contractPointData?.data);
            const grandSumSummaryResult = summarizeDataByZone(grandSumModifiedOutput);

            const grandSum = grandTotalSumCapaContractMgn(grandSumSummaryResult);
            // setGrandSumTotal(grandSum)

            // const grandSum = grandTotalSumCapaContractMgn(summaryData);
            // console.log('en grandSum : ', grandSum);
            setGrandSumTotal(grandSum)

            // summaryData
        }
    }, [sumValEdited, headerEntryDateCapDailyBookingMmbtu])

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
    }, [])


    // อย่าทำแบบนี้ไม่ว่ากับใครเข้าใจมั้ย
    // let data_table_val: any = null;
    // try {
    //     let jsonString: any

    //     if (originOrSum == "ORIGIN") {
    //         jsonString = dataTable?.booking_full_json[0]?.data_temp;
    //     } else if (originOrSum == "SUMMARY") {
    //         // ถ้ายังไม่ได้กด release ให้เอา dataTable?.booking_full_json ไปแสดงก่อน
    //         const booking_full_json_release: any[] = dataTable?.booking_full_json_release?.filter((item: any) => item?.flag_use == true) || []
    //         jsonString = booking_full_json_release?.length > 0 && booking_full_json_release[0]?.data_temp ? booking_full_json_release[0]?.data_temp : dataTable?.booking_full_json[0]?.data_temp;
    //     }

    //     if (jsonString) {
    //         data_table_val = JSON.parse(jsonString);
    //     } else {
    //         return <div className="flex flex-col justify-center items-center w-[100%] pt-4">
    //             <img className="w-[40px] h-auto mb-2" src="/assets/image/no_data_icon.svg" alt="No data icon" />
    //             <div className="text-[16px] text-[#9CA3AF]">
    //                 {`No data.`}
    //             </div>
    //         </div>
    //     }
    // } catch (error) {
    //     // Failed to parse JSON
    // }

    // useEffect(() => {
    //     let jsonString: any

    //     if (originOrSum == "ORIGIN") {
    //         jsonString = dataTable?.booking_full_json[0]?.data_temp;
    //     }

    //     if (originOrSum == "SUMMARY") {
    //         // ถ้ายังไม่ได้กด release ให้เอา dataTable?.booking_full_json ไปแสดงก่อน
    //         const booking_full_json_release: any[] = dataTable?.booking_full_json_release?.filter((item: any) => item?.flag_use == true) || []
    //         jsonString = booking_full_json_release?.length > 0 && booking_full_json_release[0]?.data_temp ? booking_full_json_release[0]?.data_temp : dataTable?.booking_full_json[0]?.data_temp;
    //     }

    //     data_table_val = JSON.parse(jsonString);
    // }, [originOrSum])



    // -------------------- แทนไอ้ try catch ข้างบน --------------------------
    const jsonString = useMemo(() => {
        if (originOrSum === "ORIGIN") {
            return dataTable?.booking_full_json?.[0]?.data_temp ?? null;
        }
        if (originOrSum === "SUMMARY") {
            const release = dataTable?.booking_full_json_release?.find((i: any) => i?.flag_use);
            return release?.data_temp ?? dataTable?.booking_full_json?.[0]?.data_temp ?? null;
        }
        return null;
    }, [originOrSum, dataTable]);

    const dataTableVal = useMemo(() => {
        if (!jsonString) return null;
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            // Failed to parse JSON
            return null;
        }
    }, [jsonString]);

    useEffect(() => {
        if (!dataTableVal) {
            setEntryVal(null);
            setEntryValOriginal(null);
            setEntryValEdited(null);
            setSumValEdited(null);
            return;
        }

        // ดึงค่าใช้งาน
        // const entryValue = dataTableVal?.entryValue;
        const { entryValue, sumEntries } = dataTableVal;

        setEntryVal(entryValue);
        setEntryValOriginal(entryValue);
        setEntryValEdited(entryValue);
        setSortedData(entryValue); // k
        setSumValEdited(sumEntries);

    }, [dataTableVal]);


    // ENTRY DATA
    // const { Entry, ...rest } = data_table_val.headerEntry;  // original try catch
    const { Entry, ...rest } = dataTableVal?.headerEntry;
    const res_entry = { ...rest, ...Entry };
    const { key, ["Sub Area"]: subAreaEntry, ...rest_res } = res_entry; // เอา column key ออก

    // const { entryValue } = data_table_val; // original try catch
    const { entryValue } = dataTableVal;

    const [entryVal, setEntryVal] = useState<any>(entryValue);
    const [entryValOriginal, setEntryValOriginal] = useState<any>(entryValue);
    const [entryValEdited, setEntryValEdited] = useState<any>(entryValue);

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

    // useEffect(() => {
    //     // if (entryValue?.length !== entryVal?.length) {
    //     if (entryValue?.length !== entryVal?.length && !isCancelClick) {
    //         setEntryVal(entryValue);
    //         setEntryValOriginal(entryValue);
    //         setEntryValEdited(entryValue);
    //     }
    // }, [entryValue, entryVal]);


    // ขอปิดไว้ก่อน มันซ้ำซ้่อน
    useEffect(() => {
        // if (entryValue?.length !== entryVal?.length) {
        if (entryValue?.length !== entryVal?.length && !isCancelClick) {
            setEntryVal(entryValue);
            setEntryValOriginal(entryValue);
            setEntryValEdited(entryValue);
        }
    }, [entryValue, entryVal]);


    // ############### HANDLE CANCEL CLICK ###############
    // #region cancel click
    useEffect(() => {
        if (isCancelClick) {
            setIsAmendMode(false)
            const dataJSON = JSON.parse(dataTable?.booking_full_json[0]?.data_temp)
            const safeEntry = structuredClone(dataJSON.entryValue);
            const safeSumEntries = structuredClone(dataJSON.sumEntries);
            Object.freeze(safeEntry); // strict mode จะเตือนถ้ามีการแก้ในที่เดิม
            Object.freeze(safeSumEntries);

            // setEntryVal(entryValue)
            // setEntryValEdited(entryValue)
            setEntryVal(safeEntry)
            setEntryValEdited(safeEntry)
            setSumValEdited(safeSumEntries);

            setIsCancelClick(false)
        }
    }, [isCancelClick])

    // ############### UPDATE HEADERS ###############
    const [entryDateFrom, setEntryDateFrom] = useState<any>();
    const [entryDateTo, setEntryDateTo] = useState<any>();
    const [isUpdateHeaderAmend, setIsUpdateHeaderAmend] = useState<boolean>(false);

    // #region amend mode
    useEffect(() => {
        // ######### AMEND MODE #########
        // ทำ auto update column ตามวันที่ start ถ้าเป็น amend mode
        const formattedDate = dayjs(new Date(amendNewContractStartDate + "T00:00:00")).format("DD/MM/YYYY");
        if (isAmendMode) {
            if (headerEntryDateCapDailyBookingMmbtu !== undefined && !isUpdateHeaderAmend) {
                setIsUpdateHeaderAmend(true)

                // update วันที่ FROM
                setDataRowAfterFromTo((prev: any) => {
                    const updatedEntry = [...prev];
                    for (let index = 0; index < updatedEntry.length; index++) {
                        const element = updatedEntry[index];
                        element[5] = formattedDate;
                    }

                    return updatedEntry;
                });

                // update วันที่ FROM
                setEntryValEdited((prev: any) => {
                    const updatedEntry = [...prev];
                    for (let index = 0; index < updatedEntry.length; index++) {
                        const element = updatedEntry[index];
                        element[5] = formattedDate;
                    }
                    return updatedEntry;
                });

                setSumValEdited((prev: any) => {
                    const element = prev;
                    element[5] = formattedDate;
                    return element;
                });

                setModeEditPeriod('FROM')
                updateHeader('FROM', formattedDate);
                setIsEditedPeriod(true)
                setIsDateChange(true);
            }
        }
        // }, [isAmendMode, amendNewContractStartDate, entryVal, headerEntryDateCapDailyBookingMmbtu]);
    }, [isAmendMode, amendNewContractStartDate, headerEntryDateCapDailyBookingMmbtu]);

    // #region map หัว / 4

    useEffect(() => {
        if (headerEntryDateCapDailyBookingMmbtu?.length > 0) { // เติมมาตอนทำ filter 
            const keys = Object.keys(entryValEdited[0]);
            const countAfter6 = keys.filter(k => parseInt(k) > 6).length;
            const res_col_span = countAfter6 / 4;

            setcolspanEdit(headerEntryDateCapDailyBookingMmbtu?.length)
            setDataPostEntry(entryValEdited);
        }

    }, [headerEntryDateCapDailyBookingMmbtu])

    const [colspanEdit, setcolspanEdit] = useState<any>();

    useEffect(() => {
        setDataPostEntry(entryVal);
    }, [entryVal])

    useEffect(() => {
        setDataPostEntry(entryValEdited);
    }, [entryValEdited])

    useEffect(() => {
        if (dataRowAfterFromTo && entryValEdited) {
            const result = updateDataRowAfterFromTo(entryValEdited, dataRowAfterFromTo);
            setDataRowAfterFromTo(result)
        }
    }, [entryValEdited])

    // #region col span default
    const functionControlcolSpan = (parentKey: any) => {
        let dataSub: any = initialColumnsDynamic?.filter((item: any) => item?.parent_id == parentKey);

        if (dataSub?.length > 0) {
            let colCount: any = 0;
            for (let index = 0; index < dataSub?.length; index++) {
                const getcolumnVisibility = columnVisibility[dataSub[index]?.key]

                if (getcolumnVisibility == true) {
                    colCount = colCount + 1
                }
            }

            return colCount
        }

        return 1
    }

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    const [sortState, setSortState] = useState<{ column: string | null, direction: 'asc' | 'desc' | null }>({ column: null, direction: null });
    const [sortedData, setSortedData] = useState<any>();

    const handleDynamicSort = (key: string, mode?: 'zone' | 'area') => {
        // คำนวณ current column id สำหรับ state
        const columnKey = key === '0' && mode ? mode : key;

        const parseDate = (value: string) => {
            const [day, month, year] = value.split('/').map(Number);
            return new Date(year, month - 1, day).getTime(); // timestamp
        };

        const detectType = (value: string) => {
            if (!value) return 'text';
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return 'date';
            if (!isNaN(Number(value))) return 'number';
            return 'text';
        };

        const compare = (a: string, b: string, type: 'number' | 'text' | 'date', direction: 'asc' | 'desc') => {
            let valA: any = a;
            let valB: any = b;

            if (type === 'number') {
                valA = parseFloat(a);
                valB = parseFloat(b);
            } else if (type === 'date') {
                valA = parseDate(a);
                valB = parseDate(b);
            } else {
                valA = a?.toString().toLowerCase();
                valB = b?.toString().toLowerCase();
            }

            if (valA < valB) return direction === 'asc' ? -1 : 1;
            if (valA > valB) return direction === 'asc' ? 1 : -1;
            return 0;
        };

        let direction: 'asc' | 'desc' | null = 'asc';

        if (sortState.column === columnKey) {
            if (sortState.direction === 'asc') direction = 'desc';
            else if (sortState.direction === 'desc') direction = null;
        }

        if (!direction) {
            setSortState({ column: null, direction: null });
            setSortedData(entryValEdited); // reset to original
            return;
        }

        const sorted = [...entryValEdited].sort((a, b) => {
            let valA = a[key];
            let valB = b[key];

            // 👇 พิเศษเฉพาะ key === '0' และ mode เป็น zone/area
            if (key === '0' && mode && contractPointData?.data) {
                const dataA = contractPointData?.data?.find((item: any) => item?.contract_point === valA);
                const dataB = contractPointData?.data?.find((item: any) => item?.contract_point === valB);

                valA = mode === 'zone' ? dataA?.zone?.name : dataA?.area?.name;
                valB = mode === 'zone' ? dataB?.zone?.name : dataB?.area?.name;
            }

            const type = detectType(valA);
            return compare(valA, valB, type as any, direction);
        });

        setSortState({ column: columnKey, direction });
        setSortedData(sorted);
    };

    const convertMonthYearToDate = (input: string): string => {
        const [monthStr, yearStr] = input?.split(' ');

        const monthMap: { [key: string]: string } = {
            January: '01',
            February: '02',
            March: '03',
            April: '04',
            May: '05',
            June: '06',
            July: '07',
            August: '08',
            September: '09',
            October: '10',
            November: '11',
            December: '12',
        };

        const month = monthMap[monthStr];
        const year = yearStr;

        if (!month || !year) return ''; // return empty string if invalid

        return `01/${month}/${year}`;
    };

    // Amend max date dynamic na wai roon
    const calMaxAmendDate = (data_row_edit: any) => {

        // const max_date_amend = dayjs(data_row_edit, 'DD/MM/YYYY').add(
        //     // data?.shadow_period || 0,
        //     shadowPeriod || 0,
        //     termTypeId == 4 ? 'day' : 'month' // 4 == short term non firm
        // ).add(
        //     selectedBookingTemplate?.max || 0,
        //     selectedBookingTemplate?.file_period_mode === 1
        //         ? 'day'
        //         : selectedBookingTemplate?.file_period_mode === 2
        //             ? 'month'
        //             : selectedBookingTemplate?.file_period_mode === 3
        //                 ? 'year'
        //                 : 'day' // Default to 'day' if file_period_mode is undefined
        // ).toDate()

        const max_date_amend = dayjs(data_row_edit, 'DD/MM/YYYY').add(
            selectedBookingTemplate?.max || 0,
            selectedBookingTemplate?.file_period_mode === 1
                ? 'day'
                : selectedBookingTemplate?.file_period_mode === 2
                    ? 'month'
                    : selectedBookingTemplate?.file_period_mode === 3
                        ? 'year'
                        : 'day' // Default to 'day' if file_period_mode is undefined
        ).toDate()

        return max_date_amend
    }

    // จริง ๆ มันก็เหมือนกับข้างบนนี่หน่า 
    const calMaxNormalDate = (data_row_edit: any) => {
        const max_date_amend = dayjs(data_row_edit, 'DD/MM/YYYY').add(
            selectedBookingTemplate?.max || 0,
            selectedBookingTemplate?.file_period_mode === 1
                ? 'day'
                : selectedBookingTemplate?.file_period_mode === 2
                    ? 'month'
                    : selectedBookingTemplate?.file_period_mode === 3
                        ? 'year'
                        : 'day' // Default to 'day' if file_period_mode is undefined
        ).toDate()
        return max_date_amend
    }

    useEffect(() => {
        calMaxAmendDate(amendNewContractStartDate)
    }, [isAmendMode, amendNewContractStartDate])

    useEffect(() => {
        calMaxNormalDate(dataTable?.contract_end_date)
    }, [dataTable])

    useEffect(() => {
        if (isEditing) {
            setDateFromToCheckEntry({
                from: entryValEdited?.[0]['5'],
                to: entryValEdited?.[0]['6'],
            })
        }
    }, [entryValEdited, isEditing])
    

    return (
        <div className="overflow-auto rounded-t-md">
            {!isEditing ?
                <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                    {/* Table Header */}
                    <thead key={'default-table-thead'} className="text-xs text-[#ffffff] bg-[#1473A1] border-[#1473A1] sticky top-0 z-10">

                        <tr key={'default-table'} className="h-9">
                            {columnVisibility?.zone && (
                                <th
                                    className={`${table_sort_header_style} text-center !min-w-[200px] !max-w-[250px]`}
                                    rowSpan={2}
                                    scope="col"
                                    onClick={() => handleDynamicSort('0', 'zone')}
                                >
                                    {`Zone`}
                                    {getArrowIcon('zone')}
                                </th>
                            )}

                            {columnVisibility?.area && (
                                <th
                                    className={`${table_sort_header_style}  text-center`}
                                    rowSpan={2}
                                    colSpan={1}
                                    scope="col"
                                    onClick={() => handleDynamicSort('0', 'area')}
                                >
                                    {`Area`}
                                    {getArrowIcon('area')}
                                </th>
                            )}

                            {columnVisibility?.contract_point && (
                                <th
                                    className={`${table_sort_header_style} px-4 text-center`}
                                    rowSpan={2}
                                    colSpan={1}
                                    scope="col"
                                    onClick={() => handleDynamicSort('0')}
                                >
                                    {`Contract Point`}
                                    {getArrowIcon('0')}
                                </th>
                            )}

                            {columnVisibility?.period && (
                                <>
                                    {columnVisibility?.From && (
                                        <th
                                            className={`${table_sort_header_style} px-4 text-center`}
                                            colSpan={1}
                                            rowSpan={2}
                                            scope="col"
                                            onClick={() => handleDynamicSort('5')}
                                        >
                                            {`From`}
                                            {getArrowIcon('5')}
                                        </th>
                                    )}

                                    {columnVisibility?.To && (
                                        <th
                                            className={`${table_sort_header_style} px-4 text-center`}
                                            colSpan={1}
                                            rowSpan={2}
                                            scope="col"
                                            onClick={() => handleDynamicSort('6')}
                                        >
                                            {`To`}
                                            {getArrowIcon('6')}
                                        </th>
                                    )}
                                </>
                            )}

                            {columnVisibility?.capacity_daily_booking_mmbtu && (
                                <th
                                    className={`${table_header_style} text-center border-r-2 border-[#E0E0E0]`}
                                    colSpan={functionControlcolSpan('capacity_daily_booking_mmbtu')}
                                    rowSpan={1}
                                    scope="col"
                                >
                                    {`Capacity Daily Booking (MMBTU/D)`}
                                </th>
                            )}

                            {columnVisibility?.maximum_hour_booking_mmbtu && (
                                <th
                                    className={`${table_header_style}  text-center border-r-2 border-[#E0E0E0]`}
                                    colSpan={functionControlcolSpan('maximum_hour_booking_mmbtu')}
                                    rowSpan={1}
                                    scope="col"
                                >
                                    {`Maximum Hour Booking (MMBTU/H)`}
                                </th>
                            )}

                            {columnVisibility?.capacity_daily_booking_mmscfd && (
                                <th
                                    className={`${table_header_style}  text-center border-r-2 border-[#E0E0E0]`}
                                    colSpan={functionControlcolSpan('capacity_daily_booking_mmscfd')}
                                    rowSpan={1}
                                    scope="col"
                                >
                                    {`Capacity Daily Booking (MMscfd)`}
                                </th>
                            )}

                            {columnVisibility?.maximum_hour_booking_mmscfd && (
                                <th
                                    className={`${table_header_style}  text-center`}
                                    colSpan={functionControlcolSpan('maximum_hour_booking_mmscfd')}
                                    rowSpan={1}
                                    scope="col"
                                >
                                    {`Maximum Hour Booking (MMscfh)`}
                                </th>
                            )}
                        </tr>

                        <tr className="h-9">
                            {/* UNDER --> Capacity Daily Booking (MMBTU/d) */}
                            {headerEntryDateCapDailyBookingMmbtu?.map((item: any, index: number) => {

                                const getKey = initialColumnsDynamic?.filter((f: any) => f?.parent_id == "capacity_daily_booking_mmbtu");
                                let transItem: any;
                                if (dataContractTermType?.id === 4) {
                                    transItem = item;
                                } else {
                                    transItem = formatMonthYear(item);
                                }

                                const pathKey = getKey?.find((f: any) => f?.label == transItem);

                                let keyItem: any;
                                if (dataContractTermType?.id === 4) {
                                    keyItem = pathKey?.label;
                                } else {
                                    if (pathKey?.label) {
                                        keyItem = convertMonthYearToDate(pathKey?.label);
                                    }
                                }

                                const getDetailKey = headerEntryOriginal['Capacity Daily Booking (MMBTU/d)'][keyItem]?.key;

                                if (!columnVisibility[pathKey?.key]) {
                                    return null
                                }

                                return (
                                    <th key={item}
                                        className={`${table_sort_header_style} bg-[#00ADEF] hover:bg-[#009ad6] text-center ${index === headerEntryDateCapDailyBookingMmbtu.length - 1 ? 'border-r-2 border-[#E0E0E0]' : ''}`}
                                        colSpan={1}
                                        scope="col"
                                        onClick={() => handleDynamicSort(getDetailKey)}
                                    >
                                        {
                                            // 4 คือ short term non-firm
                                            dataContractTermType?.id === 4 ? dayjs(item, 'DD/MM/YYYY').format('DD/MM/YYYY') : dayjs(item, 'DD/MM/YYYY').format('MMMM YYYY')
                                        }
                                        {getArrowIcon(getDetailKey)}
                                    </th>
                                )
                            })}

                            {/* UNDER --> Maximum Hour Booking (MMBTU/h) */}
                            {headerEntryDateMaxHourBookingMmbtu?.map((item: any, index: number) => {

                                const getKey = initialColumnsDynamic?.filter((f: any) => f?.parent_id == "maximum_hour_booking_mmbtu");

                                let transItem: any;
                                if (dataContractTermType?.id === 4) {
                                    transItem = item;
                                } else {
                                    transItem = formatMonthYear(item);
                                }

                                const pathKey = getKey?.find((f: any) => f?.label == transItem);

                                let keyItem: any;
                                if (dataContractTermType?.id === 4) {
                                    keyItem = pathKey?.label;
                                } else {
                                    if (pathKey?.label) {
                                        keyItem = convertMonthYearToDate(pathKey?.label);
                                    }
                                }

                                const getDetailKey = headerEntryOriginal['Maximum Hour Booking (MMBTU/h)'][keyItem]?.key;

                                if (!columnVisibility[pathKey?.key]) {
                                    return null
                                }

                                return (
                                    <th key={item}
                                        className={`${table_sort_header_style} bg-[#00ADEF] hover:bg-[#009ad6] text-center ${index === headerEntryDateMaxHourBookingMmbtu.length - 1 ? 'border-r-2 border-[#E0E0E0]' : ''}`}
                                        colSpan={1}
                                        scope="col"
                                        onClick={() => handleDynamicSort(getDetailKey)}
                                    >
                                        {
                                            // 4 คือ short term non-firm
                                            dataContractTermType?.id === 4 ? dayjs(item, 'DD/MM/YYYY').format('DD/MM/YYYY') : dayjs(item, 'DD/MM/YYYY').format('MMMM YYYY')
                                        }
                                        {getArrowIcon(getDetailKey)}
                                    </th>
                                )
                            })}

                            {/* UNDER --> Capacity Daily Booking (MMscfd) */}
                            {headerEntryDateCapDailyBookingMmscfd?.map((item: any, index: number) => {
                                const getKey = initialColumnsDynamic?.filter((f: any) => f?.parent_id == "capacity_daily_booking_mmscfd");

                                let transItem: any;
                                if (dataContractTermType?.id === 4) {
                                    transItem = item;
                                } else {
                                    transItem = formatMonthYear(item);
                                }

                                const pathKey = getKey?.find((f: any) => f?.label == transItem);

                                let keyItem: any;
                                if (dataContractTermType?.id === 4) {
                                    keyItem = pathKey?.label;
                                } else {
                                    if (pathKey?.label) {
                                        keyItem = convertMonthYearToDate(pathKey?.label);
                                    }
                                }

                                const getDetailKey = headerEntryOriginal['Capacity Daily Booking (MMscfd)'][keyItem]?.key;

                                if (!columnVisibility[pathKey?.key]) {
                                    return null
                                }

                                return (
                                    <th key={item}
                                        className={`${table_sort_header_style} bg-[#00ADEF] hover:bg-[#009ad6] text-center ${index === headerEntryDateCapDailyBookingMmscfd.length - 1 ? 'border-r-2 border-[#E0E0E0]' : ''}`}
                                        colSpan={1}
                                        scope="col"
                                        onClick={() => handleDynamicSort(getDetailKey)}
                                    >
                                        {
                                            // 4 คือ short term non-firm
                                            dataContractTermType?.id === 4 ? dayjs(item, 'DD/MM/YYYY').format('DD/MM/YYYY') : dayjs(item, 'DD/MM/YYYY').format('MMMM YYYY')
                                        }
                                        {getArrowIcon(getDetailKey)}
                                    </th>
                                )
                            })}

                            {/* UNDER --> Maximum Hour Booking (MMscfd) */}
                            {headerEntryDateMaxHourBookingMmscfd?.map((item: any, index: number) => {
                                const getKey = initialColumnsDynamic?.filter((f: any) => f?.parent_id == "maximum_hour_booking_mmscfd");

                                let transItem: any;
                                if (dataContractTermType?.id === 4) {
                                    transItem = item;
                                } else {
                                    transItem = formatMonthYear(item);
                                }

                                const pathKey = getKey?.find((f: any) => f?.label == transItem);

                                let keyItem: any;
                                if (dataContractTermType?.id === 4) {
                                    keyItem = pathKey?.label;
                                } else {
                                    if (pathKey?.label) {
                                        keyItem = convertMonthYearToDate(pathKey?.label);
                                    }
                                }

                                const getDetailKey = headerEntryOriginal['Maximum Hour Booking (MMscfh)'][keyItem]?.key;

                                if (!columnVisibility[pathKey?.key]) {
                                    return null
                                }
                                return (
                                    <th key={item}
                                        className={`${table_sort_header_style} bg-[#00ADEF] hover:bg-[#009ad6] text-center`}
                                        colSpan={1}
                                        scope="col"
                                        onClick={() => handleDynamicSort(getDetailKey)}
                                    >
                                        {
                                            // 4 คือ short term non-firm
                                            dataContractTermType?.id === 4 ? dayjs(item, 'DD/MM/YYYY').format('DD/MM/YYYY') : dayjs(item, 'DD/MM/YYYY').format('MMMM YYYY')
                                        }
                                        {getArrowIcon(getDetailKey)}
                                    </th>
                                )
                            })}
                        </tr>
                    </thead>


                    <tbody>
                        {/* ############### BODY ENTRY ############### */}
                        {
                            mode == "entry" && sortedData && sortedData?.map((row: any, rowIndex: any) => {

                                return (
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
                                                            className="mx-auto flex w-[120px] items-center justify-center rounded-full p-1"
                                                            style={{ backgroundColor: filter_contract_point?.zone?.color, color: getContrastTextColor(filter_contract_point?.zone?.color) }}
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
                                                            style={{ backgroundColor: filter_contract_point?.area?.color, color: getContrastTextColor(filter_contract_point?.area?.color) }}
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
                                                {/* {isEditing && modeEditing === "entry" ? ( */}
                                                {isEditing ? (
                                                    <>
                                                        <SelectFormProps
                                                            id={'area_id'}
                                                            disabled={false}
                                                            valueWatch={row?.[0]}
                                                            handleChange={(e) => {
                                                                // setEntryVal((prev: any) => {
                                                                setEntryValEdited((prev: any) => {
                                                                    const updatedEntry = [...prev];
                                                                    const filter_contract_point = contractPointData?.data?.find((item: any) => item.contract_point === e.target.value);
                                                                    if (updatedEntry[rowIndex]) {
                                                                        updatedEntry[rowIndex][0] = e.target.value;
                                                                    }

                                                                    // setDataPostEntry(updatedEntry);
                                                                    return updatedEntry;
                                                                });
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
                                                    </>
                                                ) : (
                                                    // Display the existing contract point name when not editing
                                                    row?.[0]
                                                )}
                                            </td>
                                        )}


                                        {/* UNDER ---> FROM */}
                                        {columnVisibility['From'] && (
                                            <td
                                                key={`period_from`}
                                                className="px-4 py-2 border-b border-gray-300 text-center text-[#464255]"
                                            >
                                                {row?.[5]}
                                            </td>
                                        )}

                                        {/* UNDER ---> To */}
                                        {columnVisibility['To'] && (
                                            <td
                                                key={`period_to`}
                                                className="px-4 py-2 border-b border-gray-300 text-center text-[#464255]"
                                            >
                                                {/* {isEditing && modeEditing === "entry" ? ( */}
                                                {row?.[6]}
                                            </td>
                                        )}

                                        {/* map numeric value หลัง from, to */}
                                        {/* map only data of dataRowAfterFromTo after key 6 */}
                                        {/* {dataRowAfterFromTo && Object.keys(dataRowAfterFromTo[rowIndex]) */}
                                        {sortedData && Object.keys(sortedData[rowIndex])
                                            .filter((key) => Number(key) > 6) // ✅ only keys > 6
                                            .map((key, idx) => {

                                                // fx filter ของที่เกี่ยวข้องกับให้ตรงกับ key
                                                function containsKeyInAllInnerObjectsOnly(data: any, targetKey: any) {
                                                    for (const topKey in data) {
                                                        const outer = data[topKey];

                                                        if (typeof outer === 'object' && outer !== null) {
                                                            for (const innerKey in outer) {
                                                                if (innerKey === 'key') continue; // ข้าม key ด้านนอก

                                                                const innerValue = outer[innerKey];
                                                                if (
                                                                    typeof innerValue === 'object' &&
                                                                    innerValue !== null &&
                                                                    'key' in innerValue &&
                                                                    String(innerValue.key) === String(targetKey)
                                                                ) {
                                                                    return true;
                                                                }
                                                            }
                                                        }
                                                    }

                                                    return false;
                                                }

                                                // fx หา data ที่เกี่ยวข้องกับ key
                                                function findKeyInNestedObject(data: any, targetKey: any) {
                                                    for (const [outerKey, innerObj] of Object.entries(data)) {
                                                        if (typeof innerObj === 'object' && innerObj !== null) {
                                                            for (const [innerKey, value] of Object.entries(innerObj)) {
                                                                if (value?.key === targetKey) {
                                                                    return {
                                                                        parentKey: outerKey,
                                                                        obj: {
                                                                            date: innerKey,
                                                                            key: value?.key
                                                                        }
                                                                    };
                                                                }
                                                            }
                                                        }
                                                    }
                                                    return null; // ถ้าไม่เจอ
                                                }

                                                // fx แปลงวันที่
                                                const extractParenUpper = (text: string) => {
                                                    const match = text.match(/^(.+?)\s*\(([^)]+)\)$/);
                                                    if (!match) return null;

                                                    const name = match[1].trim();             // ชื่อก่อนวงเล็บ
                                                    const code = match[2].toUpperCase();      // คำในวงเล็บ แปลงเป็นตัวใหญ่
                                                    return name + " (" + code + ")";
                                                }

                                                // ใช้สำหรับ เช็คที่ที่หัว header ว่ามีค่าจริงไหม ตรงตามวันที่เลือกไหม
                                                const getKey = containsKeyInAllInnerObjectsOnly(headerEntryOriginal, String(key))
                                                if (getKey == false) {
                                                    return null
                                                }
                                                // หา data ที่เกี่ยวข้องกับ key นี้
                                                const getColumns: any = findKeyInNestedObject(headerEntryOriginal, String(key))
                                                // แปลง ในวงเล็บให้เป็นตัวพิมพ์ใหญ่
                                                const exchange = extractParenUpper(getColumns?.parentKey)

                                                // หา initialColumnsDynamic ตัวหลักที่เกี่ยวข้องกับ key นี้
                                                const getpathKey = initialColumnsDynamic?.find((f: any) => f?.label == exchange)?.key;
                                                // หา parent ที่เกี่ยวข้องกับ key นี้ โดยใช้ key ของตัวหลัก
                                                const getParent = initialColumnsDynamic?.filter((f: any) => f?.parent_id == getpathKey)
                                                // แปลงวันที่
                                                let transItem: any;
                                                if (dataContractTermType?.id === 4) {
                                                    transItem = getColumns?.obj?.date;
                                                } else {
                                                    transItem = formatMonthYear(getColumns?.obj?.date);
                                                }

                                                const pathKey = getParent?.find((f: any) => f?.label == transItem);

                                                if (!columnVisibility[pathKey?.key]) {
                                                    return null
                                                }

                                                return (
                                                    <td
                                                        key={key + '-' + idx}
                                                        className="px-4 py-2 border-b border-gray-300 text-right text-[#464255]"
                                                    >
                                                        {/* {(sortedData[rowIndex][key] && sortedData[rowIndex][key] !== ' ') ? formatNumberThreeDecimal(sortedData[rowIndex][key]) : ''} */}
                                                        {(sortedData[rowIndex][key] !== null && sortedData[rowIndex][key] !== undefined) ? formatNumberThreeDecimal(sortedData[rowIndex][key]) : ''}
                                                    </td>
                                                )
                                            }
                                            )}
                                    </tr>
                                )
                            }

                            )
                        }

                        {/* ############### SUMMARY ENTRY ############### */}
                        {
                            mode == "entry" && summaryData?.length > 0 && summaryData?.map((item: any, rowIndex: any) => {

                                return (
                                    <tr key={rowIndex} className='h-[50px]' style={{ backgroundColor: item[0]?.zoneObj?.zone_color ? item[0]?.zoneObj?.zone_color : '#ffffff' }}>

                                        {columnVisibility?.zone && (
                                            <td
                                                className="!w-[180px] px-4 py-2 text-left font-bold text-[#464255]"
                                                style={{ color: getContrastTextColor(item[0]?.zoneObj?.zone_color) }}
                                            >
                                                {`Sum Entry ${item[0]?.zoneObj?.zone}`}
                                            </td>
                                        )}

                                        {columnVisibility?.area && (
                                            <td className="px-4 py-2 text-left font-bold text-[#464255]">{``}</td>
                                        )}

                                        {columnVisibility?.contract_point && (
                                            <td className="px-4 py-2 text-left font-bold text-[#464255]">{``}</td>
                                        )}

                                        {/* Template Booking และในหน้า UI ไม่อยากให้มี Pressure กับ Temp ไม่อยากให้ Shipper ใส่ค่าได้ https://app.clickup.com/t/86evh203h */}
                                        {/* {
                                            columnVisibility?.pressure_range && <>
                                                {
                                                    columnVisibility['Pressure Range.Min'] && (
                                                        <td className="px-4 py-2 text-left font-bold text-[#464255]">{``}</td>
                                                    )
                                                }

                                                {columnVisibility['Pressure Range.Max'] && (
                                                    <td className="px-4 py-2 text-left font-bold text-[#464255]">{``}</td>
                                                )}
                                            </>
                                        }

                                        {
                                            columnVisibility?.temperature_range && <>
                                                {columnVisibility['Temperature Range.Min'] && (
                                                    <td className="px-4 py-2 text-left font-bold text-[#464255]">{``}</td>
                                                )}

                                                {columnVisibility['Temperature Range.Max'] && (
                                                    <td className="px-4 py-2 text-left font-bold text-[#464255]">{``}</td>
                                                )}
                                            </>
                                        } */}

                                        {columnVisibility?.period && (
                                            <>
                                                {columnVisibility?.From && (
                                                    <td className="px-4 py-2 text-left font-bold text-[#464255]">{``}</td>
                                                )}

                                                {columnVisibility?.To && (
                                                    <td className="px-4 py-2 text-left font-bold text-[#464255]">{``}</td>
                                                )}
                                            </>
                                        )}

                                        {Object.keys(item)
                                            .filter((key) => Number(key) >= 7)
                                            .map((key, colIndex) => {
                                                // fx filter ของที่เกี่ยวข้องกับให้ตรงกับ key
                                                function containsKeyInAllInnerObjectsOnly(data: any, targetKey: any) {
                                                    for (const topKey in data) {
                                                        const outer = data[topKey];

                                                        if (typeof outer === 'object' && outer !== null) {
                                                            for (const innerKey in outer) {
                                                                if (innerKey === 'key') continue; // ข้าม key ด้านนอก

                                                                const innerValue = outer[innerKey];
                                                                if (
                                                                    typeof innerValue === 'object' &&
                                                                    innerValue !== null &&
                                                                    'key' in innerValue &&
                                                                    String(innerValue.key) === String(targetKey)
                                                                ) {
                                                                    return true;
                                                                }
                                                            }
                                                        }
                                                    }

                                                    return false;
                                                }

                                                // fx หา data ที่เกี่ยวข้องกับ key
                                                function findKeyInNestedObject(data: any, targetKey: any) {
                                                    for (const [outerKey, innerObj] of Object.entries(data)) {
                                                        if (typeof innerObj === 'object' && innerObj !== null) {
                                                            for (const [innerKey, value] of Object.entries(innerObj)) {
                                                                if (value?.key === targetKey) {
                                                                    return {
                                                                        parentKey: outerKey,
                                                                        obj: {
                                                                            date: innerKey,
                                                                            key: value?.key
                                                                        }
                                                                    };
                                                                }
                                                            }
                                                        }
                                                    }
                                                    return null; // ถ้าไม่เจอ
                                                }

                                                // fx แปลงวันที่
                                                const extractParenUpper = (text: string) => {
                                                    const match = text.match(/^(.+?)\s*\(([^)]+)\)$/);
                                                    if (!match) return null;

                                                    const name = match[1].trim();             // ชื่อก่อนวงเล็บ
                                                    const code = match[2].toUpperCase();      // คำในวงเล็บ แปลงเป็นตัวใหญ่
                                                    return name + " (" + code + ")";
                                                }

                                                // ใช้สำหรับ เช็คที่ที่หัว header ว่ามีค่าจริงไหม ตรงตามวันที่เลือกไหม
                                                const getKey = containsKeyInAllInnerObjectsOnly(headerEntryOriginal, String(key))
                                                if (getKey == false) {
                                                    return null
                                                }
                                                // หา data ที่เกี่ยวข้องกับ key นี้
                                                const getColumns: any = findKeyInNestedObject(headerEntryOriginal, String(key))
                                                // แปลง ในวงเล็บให้เป็นตัวพิมพ์ใหญ่
                                                const exchange = extractParenUpper(getColumns?.parentKey)

                                                // หา initialColumnsDynamic ตัวหลักที่เกี่ยวข้องกับ key นี้
                                                const getpathKey = initialColumnsDynamic?.find((f: any) => f?.label == exchange)?.key;
                                                // หา parent ที่เกี่ยวข้องกับ key นี้ โดยใช้ key ของตัวหลัก
                                                const getParent = initialColumnsDynamic?.filter((f: any) => f?.parent_id == getpathKey)
                                                // แปลงวันที่
                                                let transItem: any;
                                                if (dataContractTermType?.id === 4) {
                                                    transItem = getColumns?.obj?.date;
                                                } else {
                                                    transItem = formatMonthYear(getColumns?.obj?.date);
                                                }
                                                // หา parent ที่ตรงกับ key นี้เลย
                                                const pathKey = getParent?.find((f: any) => f?.label == transItem);

                                                if (!columnVisibility[pathKey?.key]) {
                                                    return null
                                                }

                                                return (
                                                    <td
                                                        key={key + '-' + colIndex}
                                                        className="px-4 py-2 font-bold border-gray-300 text-right text-[#464255]"
                                                        style={{ color: getContrastTextColor(item[0]?.zoneObj?.zone_color) }}
                                                    >
                                                        {/* {item[key]?.value ? formatNumberThreeDecimal(item[key]?.value) : ''} */}
                                                        {(item[key]?.value !== null && item[key]?.value !== undefined && item[key]?.value !== "") ? formatNumberThreeDecimal(item[key]?.value) : ''}
                                                    </td>
                                                )
                                            }
                                            )}
                                    </tr>
                                )
                            })
                        }

                        {/* ############### SUMMARY ของ SUMMARY คือ SUUUUUMMAAAAAARYYYYYYYYY! ############### */}
                        <tr
                            key="grand-total"
                            className="h-[50px]"
                            style={{ backgroundColor: '#1473A1' }}
                        >
                            {/* <td
                                colSpan={9}
                                className="px-4 py-2 text-left font-bold text-[#ffffff]"
                            >
                                {`TOTAL ENTRY`}
                            </td> */}

                            {columnVisibility?.zone && (
                                <td className="!w-[180px] px-4 py-2 text-left font-bold text-[#ffffff]">
                                    {`TOTAL ENTRY`}
                                </td>
                            )}

                            {columnVisibility?.area && (
                                <td className="px-4 py-2 text-left font-bold text-[#ffffff]">{``}</td>
                            )}

                            {columnVisibility?.contract_point && (
                                <td className="px-4 py-2 text-left font-bold text-[#ffffff]">{``}</td>
                            )}

                            {/* Template Booking และในหน้า UI ไม่อยากให้มี Pressure กับ Temp ไม่อยากให้ Shipper ใส่ค่าได้ https://app.clickup.com/t/86evh203h */}
                            {/* 
                            {
                                columnVisibility?.pressure_range && <>
                                    {
                                        columnVisibility['Pressure Range.Min'] && (
                                            <td className="px-4 py-2 text-left font-bold text-[#ffffff]">{``}</td>
                                        )
                                    }

                                    {columnVisibility['Pressure Range.Max'] && (
                                        <td className="px-4 py-2 text-left font-bold text-[#ffffff]">{``}</td>
                                    )}
                                </>
                            }

                            {
                                columnVisibility?.temperature_range && <>
                                    {columnVisibility['Temperature Range.Min'] && (
                                        <td className="px-4 py-2 text-left font-bold text-[#ffffff]">{``}</td>
                                    )}

                                    {columnVisibility['Temperature Range.Max'] && (
                                        <td className="px-4 py-2 text-left font-bold text-[#ffffff]">{``}</td>
                                    )}
                                </>
                            } */}

                            {columnVisibility?.period && (
                                <>
                                    {columnVisibility?.From && (
                                        <td className="px-4 py-2 text-left font-bold text-[#ffffff]">{``}</td>
                                    )}

                                    {columnVisibility?.To && (
                                        <td className="px-4 py-2 text-left font-bold text-[#ffffff]">{``}</td>
                                    )}
                                </>
                            )}

                            {
                                grandSumTotal && Object.keys(grandSumTotal)
                                    .filter((key) => Number(key) >= 7)
                                    .map((key, colIndex) => {
                                        // fx filter ของที่เกี่ยวข้องกับให้ตรงกับ key
                                        function containsKeyInAllInnerObjectsOnly(data: any, targetKey: any) {
                                            for (const topKey in data) {
                                                const outer = data[topKey];

                                                if (typeof outer === 'object' && outer !== null) {
                                                    for (const innerKey in outer) {
                                                        if (innerKey === 'key') continue; // ข้าม key ด้านนอก

                                                        const innerValue = outer[innerKey];
                                                        if (
                                                            typeof innerValue === 'object' &&
                                                            innerValue !== null &&
                                                            'key' in innerValue &&
                                                            String(innerValue.key) === String(targetKey)
                                                        ) {
                                                            return true;
                                                        }
                                                    }
                                                }
                                            }

                                            return false;
                                        }

                                        // fx หา data ที่เกี่ยวข้องกับ key
                                        function findKeyInNestedObject(data: any, targetKey: any) {
                                            for (const [outerKey, innerObj] of Object.entries(data)) {
                                                if (typeof innerObj === 'object' && innerObj !== null) {
                                                    for (const [innerKey, value] of Object.entries(innerObj)) {
                                                        if (value?.key === targetKey) {
                                                            return {
                                                                parentKey: outerKey,
                                                                obj: {
                                                                    date: innerKey,
                                                                    key: value?.key
                                                                }
                                                            };
                                                        }
                                                    }
                                                }
                                            }
                                            return null; // ถ้าไม่เจอ
                                        }

                                        // fx แปลงวันที่
                                        const extractParenUpper = (text: string) => {
                                            const match = text.match(/^(.+?)\s*\(([^)]+)\)$/);
                                            if (!match) return null;

                                            const name = match[1].trim();             // ชื่อก่อนวงเล็บ
                                            const code = match[2].toUpperCase();      // คำในวงเล็บ แปลงเป็นตัวใหญ่
                                            return name + " (" + code + ")";
                                        }

                                        // ใช้สำหรับ เช็คที่ที่หัว header ว่ามีค่าจริงไหม ตรงตามวันที่เลือกไหม
                                        const getKey = containsKeyInAllInnerObjectsOnly(headerEntryOriginal, String(key))
                                        if (getKey == false) {
                                            return null
                                        }
                                        // หา data ที่เกี่ยวข้องกับ key นี้
                                        const getColumns: any = findKeyInNestedObject(headerEntryOriginal, String(key))
                                        // แปลง ในวงเล็บให้เป็นตัวพิมพ์ใหญ่
                                        const exchange = extractParenUpper(getColumns?.parentKey)

                                        // หา initialColumnsDynamic ตัวหลักที่เกี่ยวข้องกับ key นี้
                                        const getpathKey = initialColumnsDynamic?.find((f: any) => f?.label == exchange)?.key;
                                        // หา parent ที่เกี่ยวข้องกับ key นี้ โดยใช้ key ของตัวหลัก
                                        const getParent = initialColumnsDynamic?.filter((f: any) => f?.parent_id == getpathKey)
                                        // แปลงวันที่
                                        let transItem: any;
                                        if (dataContractTermType?.id === 4) {
                                            transItem = getColumns?.obj?.date;
                                        } else {
                                            transItem = formatMonthYear(getColumns?.obj?.date);
                                        }
                                        // หา parent ที่ตรงกับ key นี้เลย
                                        const pathKey = getParent?.find((f: any) => f?.label == transItem);

                                        if (!columnVisibility[pathKey?.key]) {
                                            return null
                                        }

                                        return (
                                            <td
                                                key={key + '-' + colIndex}
                                                className="px-4 py-2 font-bold border-gray-300 text-right text-[#ffffff]"
                                            >
                                                {grandSumTotal[key]?.value ? formatNumberThreeDecimal(grandSumTotal[key].value) : ''}
                                            </td>
                                        )
                                    })
                            }
                        </tr>

                    </tbody>
                </table>
                :
                <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                    {/* Table Header */}
                    <thead key={`thead-${colspanEdit}`} className="text-xs text-[#ffffff] bg-[#1473A1] border-[#1473A1] sticky top-0 z-10">

                        <tr key={`hdr-row-${colspanEdit}`} className="h-9">

                            <th className={`${table_header_style} text-center min-w-[120px] w-[130px] max-w-[150px]`} rowSpan={2} scope="col">
                                {`Zone`}
                            </th>

                            <th className={`${table_header_style}  text-center`} rowSpan={2} colSpan={1} scope="col">
                                {`Area`}
                            </th>

                            <th className={`${table_header_style} px-4 text-center`} rowSpan={2} colSpan={1} scope="col">
                                {`Contract Point`}
                            </th>

                            {/* Template Booking และในหน้า UI ไม่อยากให้มี Pressure กับ Temp ไม่อยากให้ Shipper ใส่ค่าได้ https://app.clickup.com/t/86evh203h */}
                            {/* <th className={`${table_header_style} px-4 text-center`} colSpan={2} scope="col">
                                {`Pressure Range (PSIG)`}
                            </th>

                            <th className={`${table_header_style} px-4 text-center`} colSpan={2} scope="col">
                                {`Temperature Range (DEG. F)`}
                            </th> */}

                            <th className={`${table_header_style} px-4 text-center`} colSpan={1} rowSpan={2} scope="col">
                                {`From`}
                            </th>

                            <th className={`${table_header_style} px-4 text-center`} colSpan={1} rowSpan={2} scope="col">
                                {`To`}
                            </th>

                            <th
                                className={`${table_header_style} text-center border-r-2 border-[#E0E0E0]`}
                                // colSpan={colSpanCountFromEntryVal ? colSpanCountFromEntryVal : 4}
                                // colSpan={colSpanCount?.["Capacity Daily Booking (MMBTU/d)"]?.length}
                                colSpan={colspanEdit}
                                rowSpan={1}
                                scope="col"
                            >
                                {`Capacity Daily Booking (MMBTU/D)`}
                            </th>

                            <th
                                className={`${table_header_style}  text-center border-r-2 border-[#E0E0E0]`}
                                // colSpan={colSpanCountFromEntryVal ? colSpanCountFromEntryVal : 4}
                                // colSpan={colSpanCount?.["Maximum Hour Booking (MMBTU/h)"]?.length}
                                colSpan={colspanEdit}
                                rowSpan={1}
                                scope="col"
                            >
                                {`Maximum Hour Booking (MMBTU/H)`}
                            </th>

                            <th
                                className={`${table_header_style}  text-center border-r-2 border-[#E0E0E0]`}
                                // colSpan={colSpanCountFromEntryVal ? colSpanCountFromEntryVal : 4}
                                // colSpan={colSpanCount?.["Capacity Daily Booking (MMscfd)"]?.length}
                                colSpan={colspanEdit}
                                rowSpan={1}
                                scope="col"
                            >
                                {`Capacity Daily Booking (MMscfd)`}
                            </th>

                            <th
                                className={`${table_header_style}  text-center`}
                                // colSpan={colSpanCountFromEntryVal ? colSpanCountFromEntryVal : 4}
                                // colSpan={colSpanCount?.["Maximum Hour Booking (MMscfh)"]?.length}
                                colSpan={colspanEdit}
                                rowSpan={1}
                                scope="col"
                            >
                                {`Maximum Hour Booking (MMscfh)`}
                            </th>
                        </tr>

                        <tr className="h-9">
                            {/* Template Booking และในหน้า UI ไม่อยากให้มี Pressure กับ Temp ไม่อยากให้ Shipper ใส่ค่าได้ https://app.clickup.com/t/86evh203h */}
                            {/* <th className={`${table_header_style} bg-[#00ADEF] text-center`} colSpan={1} scope="col">
                                {`Min`}
                            </th>

                            <th className={`${table_header_style} bg-[#00ADEF] text-center`} colSpan={1} scope="col">
                                {`Max`}
                            </th>


                            <th className={`${table_header_style} bg-[#00ADEF] text-center`} colSpan={1} scope="col">
                                {`Min`}
                            </th>

                            <th className={`${table_header_style} bg-[#00ADEF] text-center`} colSpan={1} scope="col">
                                {`Max`}
                            </th> */}


                            {/* UNDER --> Capacity Daily Booking (MMBTU/d) */}
                            {headerEntryDateCapDailyBookingMmbtu?.map((item: any, index: number) => {
                                return (
                                    <th key={item}
                                        className={`${table_header_style} bg-[#00ADEF] text-center ${index === headerEntryDateCapDailyBookingMmbtu.length - 1 ? 'border-r-2 border-[#E0E0E0]' : ''}`}
                                        colSpan={1}
                                        scope="col"
                                    >
                                        {
                                            // 4 คือ short term non-firm
                                            dataContractTermType?.id === 4 ? dayjs(item, 'DD/MM/YYYY').format('DD/MM/YYYY') : dayjs(item, 'DD/MM/YYYY').format('MMMM YYYY')
                                        }
                                    </th>
                                )
                            })}

                            {/* UNDER --> Maximum Hour Booking (MMBTU/h) */}
                            {headerEntryDateMaxHourBookingMmbtu?.map((item: any, index: number) => {
                                return (
                                    <th key={item}
                                        className={`${table_header_style} bg-[#00ADEF] text-center ${index === headerEntryDateMaxHourBookingMmbtu.length - 1 ? 'border-r-2 border-[#E0E0E0]' : ''}`}
                                        colSpan={1}
                                        scope="col"
                                    >
                                        {
                                            // 4 คือ short term non-firm
                                            dataContractTermType?.id === 4 ? dayjs(item, 'DD/MM/YYYY').format('DD/MM/YYYY') : dayjs(item, 'DD/MM/YYYY').format('MMMM YYYY')
                                        }
                                    </th>
                                )
                            })}

                            {/* UNDER --> Capacity Daily Booking (MMscfd) */}
                            {headerEntryDateCapDailyBookingMmscfd?.map((item: any, index: number) => {
                                return (
                                    <th key={item}
                                        className={`${table_header_style} bg-[#00ADEF] text-center ${index === headerEntryDateCapDailyBookingMmscfd.length - 1 ? 'border-r-2 border-[#E0E0E0]' : ''}`}
                                        colSpan={1}
                                        scope="col"
                                    >
                                        {
                                            // 4 คือ short term non-firm
                                            dataContractTermType?.id === 4 ? dayjs(item, 'DD/MM/YYYY').format('DD/MM/YYYY') : dayjs(item, 'DD/MM/YYYY').format('MMMM YYYY')
                                        }
                                    </th>
                                )
                            })}

                            {/* UNDER --> Maximum Hour Booking (MMscfd) */}
                            {headerEntryDateMaxHourBookingMmscfd?.map((item: any, index: number) => {
                                return (
                                    <th key={item}
                                        className={`${table_header_style} bg-[#00ADEF] text-center`}
                                        colSpan={1}
                                        scope="col"
                                    >
                                        {
                                            // 4 คือ short term non-firm
                                            dataContractTermType?.id === 4 ? dayjs(item, 'DD/MM/YYYY').format('DD/MM/YYYY') : dayjs(item, 'DD/MM/YYYY').format('MMMM YYYY')
                                        }
                                    </th>
                                )
                            })}
                        </tr>
                    </thead>

                    <tbody>
                        {/* ############### BODY ENTRY ############### */}
                        {
                            mode == "entry" && entryValEdited?.map((row: any, rowIndex: any) => {

                                // const formattedNewDate = row ? dayjs(row?.[5]).format("DD/MM/YYYY") : undefined;
                                // calMaxAmendDate(formattedNewDate)

                                return (
                                    <tr key={rowIndex} className="hover:bg-gray-50">

                                        {/* ZONE */}
                                        <td
                                            key={`10000`}
                                            className="px-4 py-2 border-b border-gray-300 text-center text-[#464255]"
                                        >
                                            {(() => {
                                                const filter_contract_point = contractPointData?.data?.find((item: any) => item.contract_point === row["0"].trim());

                                                return filter_contract_point ? (
                                                    <div
                                                        className="mx-auto flex w-[120px] items-center justify-center rounded-full p-1"
                                                        style={{ backgroundColor: filter_contract_point?.zone?.color, color: getContrastTextColor(filter_contract_point?.zone?.color) }}
                                                    >
                                                        {filter_contract_point?.zone?.name}
                                                    </div>
                                                ) : null;
                                            })()}
                                        </td>

                                        {/* AREA */}
                                        <td
                                            key={`10001`}
                                            className="px-4 py-2 border-b border-gray-300 text-center text-[#464255]"
                                        >
                                            {(() => {
                                                const filter_contract_point = contractPointData?.data?.find((item: any) => item.contract_point === row["0"].trim());

                                                return filter_contract_point ? (
                                                    <div
                                                        className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]"
                                                        style={{ backgroundColor: filter_contract_point?.area?.color, color: getContrastTextColor(filter_contract_point?.area?.color) }}
                                                    >
                                                        {filter_contract_point?.area?.name}
                                                    </div>
                                                ) : null;
                                            })()}
                                        </td>

                                        {/* CONTRACT POINT */}
                                        <td
                                            key={`10002`}
                                            className="px-4 py-2 border-b border-gray-300 text-center text-[#464255]"
                                        >
                                            {/* {isEditing && modeEditing === "entry" ? ( */}
                                            {isEditing ? (
                                                <>
                                                    <SelectFormProps
                                                        id={'area_id'}
                                                        disabled={false}
                                                        valueWatch={row?.[0]}
                                                        handleChange={(e) => {
                                                            // setEntryVal((prev: any) => {
                                                            setEntryValEdited((prev: any) => {
                                                                const updatedEntry = [...prev];
                                                                const filter_contract_point = contractPointData?.data?.find((item: any) => item.contract_point === e.target.value);
                                                                if (updatedEntry[rowIndex]) {
                                                                    updatedEntry[rowIndex][0] = e.target.value;
                                                                }

                                                                // setDataPostEntry(updatedEntry);
                                                                return updatedEntry;
                                                            });
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
                                                </>
                                            ) : (
                                                // Display the existing contract point name when not editing
                                                row?.[0]
                                            )}
                                        </td>


                                        {/* Template Booking และในหน้า UI ไม่อยากให้มี Pressure กับ Temp ไม่อยากให้ Shipper ใส่ค่าได้ https://app.clickup.com/t/86evh203h */}
                                        {/* UNDER ---> PRESSURE RANGE ---> MIN */}
                                        {/* <td
                                            key={`pressure_min`}
                                            className="px-4 py-2 border-b border-gray-300 text-center text-[#464255]"
                                        >
                                            {isEditing ? (
                                                <NumericFormat
                                                    value={row[1] || ''}
                                                    onValueChange={(values) => {
                                                        const { value } = values;

                                                        setEntryValEdited((prev: any) => {
                                                            const updatedEntry = [...prev];
                                                            if (updatedEntry[rowIndex]) {
                                                                updatedEntry[rowIndex][1] = value;
                                                            }
                                                            // setDataPostEntry(updatedEntry)
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
                                                        width: "100%",
                                                    }}
                                                />
                                            ) : (
                                                // formatNumberThreeDecimal(row?.[1])
                                                row?.[1] !== null && row?.[1] !== undefined && row?.[1] !== '' ? formatNumberThreeDecimal(Number(String(row?.[1]).replace(/,/g, '').trim())) : ''

                                            )}
                                        </td> */}


                                        {/* Template Booking และในหน้า UI ไม่อยากให้มี Pressure กับ Temp ไม่อยากให้ Shipper ใส่ค่าได้ https://app.clickup.com/t/86evh203h */}
                                        {/* UNDER ---> PRESSURE RANGE ---> MAX */}
                                        {/* <td
                                            key={`pressure_max`}
                                            className="px-4 py-2 border-b border-gray-300 text-center text-[#464255]"
                                        >
                                            {isEditing ? (
                                                <NumericFormat
                                                    value={row[2] || ''}
                                                    onValueChange={(values) => {
                                                        const { value } = values;

                                                        setEntryValEdited((prev: any) => {
                                                            const updatedEntry = [...prev];
                                                            if (updatedEntry[rowIndex]) {
                                                                updatedEntry[rowIndex][2] = value;
                                                            }
                                                            // setDataPostEntry(updatedEntry)
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
                                            ) : (
                                                // formatNumberThreeDecimal(row?.[2])
                                                row?.[2] !== null && row?.[2] !== undefined && row?.[2] !== '' ? formatNumberThreeDecimal(Number(String(row?.[2]).replace(/,/g, '').trim())) : ''

                                            )}
                                        </td> */}


                                        {/* Template Booking และในหน้า UI ไม่อยากให้มี Pressure กับ Temp ไม่อยากให้ Shipper ใส่ค่าได้ https://app.clickup.com/t/86evh203h */}
                                        {/* UNDER ---> TEMPERATURE RANGE ---> MIN */}
                                        {/* <td
                                            key={`temperature_min`}
                                            className="px-4 py-2 border-b border-gray-300 text-center text-[#464255]"
                                        >
                                            {isEditing ? (
                                                <NumericFormat
                                                    value={row[3] || ''}
                                                    onValueChange={(values) => {
                                                        const { value } = values;
                                                        setEntryValEdited((prev: any) => {
                                                            const updatedEntry = [...prev];
                                                            if (updatedEntry[rowIndex]) {
                                                                updatedEntry[rowIndex][3] = value;
                                                            }
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
                                            ) : (
                                                // formatNumberThreeDecimal(row?.[3])
                                                row?.[3] !== null && row?.[3] !== undefined && row?.[3] !== '' ? formatNumberThreeDecimal(Number(String(row?.[3]).replace(/,/g, '').trim())) : ''
                                            )}
                                        </td> */}

                                        {/* Template Booking และในหน้า UI ไม่อยากให้มี Pressure กับ Temp ไม่อยากให้ Shipper ใส่ค่าได้ https://app.clickup.com/t/86evh203h */}
                                        {/* UNDER ---> TEMPERATURE RANGE ---> MAX */}
                                        {/* <td
                                            key={`temperature_max`}
                                            className="px-4 py-2 border-b border-gray-300 text-center text-[#464255]"
                                        >
                                            {isEditing ? (
                                                <NumericFormat
                                                    value={row[4] || ''}
                                                    onValueChange={(values) => {
                                                        const { value } = values;

                                                        setEntryValEdited((prev: any) => {
                                                            const updatedEntry = [...prev];
                                                            if (updatedEntry[rowIndex]) {
                                                                updatedEntry[rowIndex][4] = value;
                                                            }
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
                                            ) : (
                                                // formatNumberThreeDecimal(row?.[4])
                                                row?.[4] !== null && row?.[4] !== undefined && row?.[4] !== '' ? formatNumberThreeDecimal(Number(String(row?.[4]).replace(/,/g, '').trim())) : ''
                                            )}
                                        </td> */}


                                        {/* UNDER ---> FROM */}
                                        <td
                                            key={`period_from`}
                                            className="px-4 py-2 border-b border-gray-300 text-center text-[#464255]"
                                        >
                                            {/* {isEditing && modeEditing === "entry" ? ( */}
                                            {isEditing ? (

                                                <DatePickaForm
                                                    key={"start" + key}
                                                    // readOnly={false} // amend ก็เปิดให้แก้ไขได้
                                                    readOnly={isAmendMode}
                                                    placeHolder="Select Date"
                                                    mode={'edit-table'}
                                                    valueShow={
                                                        isAmendMode && rowIndex == 5 ? dayjs(amendNewContractStartDate, "YYYY-MM-DD").format("DD/MM/YYYY") : row[5] !== undefined ? row[5] : dayjs().format("DD/MM/YYYY")
                                                    } // ถ้า isAmendMode == true กำหนด date.key == 5 ให้ใช้วันที่ amendNewContractStartDate ลงใน valueShow
                                                    min={tomorrowDay || undefined}
                                                    maxNormalForm={row?.[6] !== undefined ? dayjs(row?.[6], 'DD/MM/YYYY') : dayjs().format("DD/MM/YYYY")} // ไม่ให้ start_date เกิน end_date
                                                    allowClear
                                                    onChange={(e: any) => {

                                                        const formattedNewDate = e ? dayjs(e).format("DD/MM/YYYY") : undefined;
                                                        const currentDate = row[5];
                                                        // calMaxAmendDate(formattedNewDate)

                                                        const hasDateChanged = formattedNewDate !== currentDate;
                                                        if (hasDateChanged) {
                                                            setIsDateChange(true);
                                                        } else {
                                                            // Set the flag to false if the new date is the same as the current one
                                                            setIsDateChange(false);
                                                        }

                                                        if (e) {
                                                            // Format the selected date and update the row

                                                            setDataRowAfterFromTo((prev: any) => {
                                                                const updatedEntry = [...prev];
                                                                if (updatedEntry[rowIndex]) {
                                                                    updatedEntry[rowIndex][5] = dayjs(e).format("DD/MM/YYYY");
                                                                }
                                                                // setDataPostEntry(updatedEntry)
                                                                return updatedEntry;
                                                            });

                                                            setEntryValEdited((prev: any) => {
                                                                const updatedEntry = [...prev];
                                                                if (updatedEntry[rowIndex]) {
                                                                    updatedEntry[rowIndex][5] = dayjs(e).format("DD/MM/YYYY");
                                                                }
                                                                // setDataPostEntry(updatedEntry)
                                                                return updatedEntry;
                                                            });

                                                            setSumValEdited((prev: any) => {
                                                                const updatedEntry = prev;
                                                                if (updatedEntry) {
                                                                    updatedEntry[5] = dayjs(e).format("DD/MM/YYYY");
                                                                }
                                                                return updatedEntry;
                                                            });

                                                            setModeEditPeriod('FROM')
                                                            updateHeader('FROM', dayjs(e).format("DD/MM/YYYY"));
                                                            // settrickerEdit(true) // ขอปิดไว้ เพื่อเทสเรื่องหดคอลัม 
                                                            setIsEditedPeriod(true)

                                                        } else {
                                                            // Handle clearing the value
                                                            // ถ้ากด clear จะ set ข้อมูลเป็นวันปัจจุบัน ทำให้เคลียร์ว่างไปเลยไม่ได้ เพราะมันส่งผลต่อการแสดงผล
                                                            row[5] = undefined;
                                                            if (rowIndex == 5) { // original 33 --> new 5
                                                                setEntryDateFrom(undefined)
                                                                // setEntryDateFrom(dayjs().format("DD/MM/YYYY"))
                                                            } else if (rowIndex == 6) { // original 34 --> new 6
                                                                setEntryDateTo(undefined)
                                                                // setEntryDateTo(dayjs().format("DD/MM/YYYY"))
                                                            }
                                                        }
                                                    }}

                                                />

                                            ) : (
                                                row?.[5]
                                            )}
                                        </td>

                                        {/* UNDER ---> To */}
                                        <td
                                            key={`period_to`}
                                            className="px-4 py-2 border-b border-gray-300 text-center text-[#464255]"
                                        >
                                            {/* {isEditing && modeEditing === "entry" ? ( */}
                                            {isEditing ? (

                                                <DatePickaForm
                                                    key={"start" + key}
                                                    // readOnly={isAmendMode ? true : false} // amend ก็เปิดให้แก้ไขได้
                                                    readOnly={false} // amend ก็เปิดให้แก้ไขได้ R : v1.0.85 การ Amd สัญญา ต้องเปิดให้แก้ไข period To ได้เช่นกัน https://app.clickup.com/t/86erm0qhq
                                                    placeHolder="Select Date"
                                                    mode={'edit-table'}
                                                    valueShow={
                                                        isAmendMode && rowIndex == 6 ? dayjs(amendNewContractStartDate, "YYYY-MM-DD").format("DD/MM/YYYY") : row[6] !== undefined ? row[6] : dayjs().format("DD/MM/YYYY")
                                                    } // ถ้า isAmendMode == true กำหนด date.key == 5 ให้ใช้วันที่ amendNewContractStartDate ลงใน valueShow
                                                    // min={tomorrowDay || undefined}
                                                    // min={row?.[5] !== undefined ? dayjs(row?.[5], 'DD/MM/YYYY').toDate() : tomorrowDay} // ไม่ให้ start_date เกิน end_date
                                                    min={row?.[5] !== undefined ? dayjs(row?.[5], 'DD/MM/YYYY').add(1, 'day').toDate() : tomorrowDay} // ไม่ให้ start_date เกิน end_date
                                                    // termMaxDate={isAmendMode ? maxDateAmend : null} // ถ้าเป็น amend ใช้ maxDateAmend หามาจาก booking template // 2. Period To ฝั่ง Entry limit วันในปฎิทินไว้ แต่ Exit ไม่ได้ limit ซึ่งที่ถูกต้องคือไม่ต้อง limit https://sharing.clickup.com/9018502823/t/h/86euytxnf/HYMBBTB3UYB9F2Y
                                                    // termMaxDate={isAmendMode ? calMaxAmendDate(row[5]) : null} // dynamic period_to ตามเงื่อนไข amend และจับจาก period_from
                                                    termMaxDate={isAmendMode ? calMaxAmendDate(row[5]) : calMaxNormalDate(row[5])} // dynamic period_to ตามเงื่อนไข amend และจับจาก period_from
                                                    isEndDate={true}
                                                    allowClear
                                                    onChange={(e: any) => {
                                                        const formattedNewDate = e ? dayjs(e).format("DD/MM/YYYY") : undefined;
                                                        const currentDate = row[6];
                                                        const hasDateChanged = formattedNewDate !== currentDate;

                                                        if (hasDateChanged) {
                                                            setIsDateChange(true);
                                                        } else {
                                                            // Set the flag to false if the new date is the same as the current one
                                                            setIsDateChange(false);
                                                        }

                                                        if (e) {
                                                            setDataRowAfterFromTo((prev: any) => {
                                                                const updatedEntry = [...prev];
                                                                if (updatedEntry[rowIndex]) {
                                                                    updatedEntry[rowIndex][6] = dayjs(e).format("DD/MM/YYYY");
                                                                }
                                                                // setDataPostEntry(updatedEntry)
                                                                return updatedEntry;
                                                            });

                                                            setEntryValEdited((prev: any) => {
                                                                const updatedEntry = [...prev];
                                                                if (updatedEntry[rowIndex]) {
                                                                    updatedEntry[rowIndex][6] = dayjs(e).format("DD/MM/YYYY");
                                                                }
                                                                // setDataPostEntry(updatedEntry)
                                                                return updatedEntry;
                                                            });

                                                            setSumValEdited((prev: any) => {
                                                                const updatedEntry = prev;
                                                                if (updatedEntry) {
                                                                    updatedEntry[6] = dayjs(e).format("DD/MM/YYYY");
                                                                }
                                                                return updatedEntry;
                                                            });
                                                            setModeEditPeriod('TO')

                                                            updateHeader('TO', dayjs(e).format("DD/MM/YYYY"));
                                                            // settrickerEdit(true) // ขอปิดไว้ เพื่อเทสเรื่องหดคอลัม 
                                                            setIsEditedPeriod(true)

                                                        } else {
                                                            // Handle clearing the value
                                                            // ถ้ากด clear จะ set ข้อมูลเป็นวันปัจจุบัน ทำให้เคลียร์ว่างไปเลยไม่ได้ เพราะมันส่งผลต่อการแสดงผล
                                                            row[5] = undefined;
                                                            if (rowIndex == 5) { // original 33 --> new 5
                                                                setEntryDateFrom(undefined)
                                                                // setEntryDateFrom(dayjs().format("DD/MM/YYYY"))
                                                            } else if (rowIndex == 6) { // original 34 --> new 6
                                                                setEntryDateTo(undefined)
                                                                // setEntryDateTo(dayjs().format("DD/MM/YYYY"))
                                                            }
                                                        }
                                                    }}
                                                />

                                            ) : (
                                                row?.[6]
                                            )}
                                        </td>

                                        {/* map numeric value หลัง from, to */}
                                        {/* map only data of dataRowAfterFromTo after key 6 */}
                                        {/* {dataRowAfterFromTo && Object.keys(dataRowAfterFromTo[rowIndex]) */}
                                        {entryValEdited && Object.keys(entryValEdited[rowIndex])
                                            .filter((key) => Number(key) > 6) // ✅ only keys > 6
                                            .map((key, idx) => {
                                                const keyNum = Number(key);
                                                const keyIndex = keyNum - 7
                                                const isNotCalSum = (
                                                    (keyIndex >= headerEntryDateCapDailyBookingMmbtu?.length && keyIndex < headerEntryDateCapDailyBookingMmbtu?.length + headerEntryDateMaxHourBookingMmbtu?.length) ||
                                                    (keyIndex >= headerEntryDateCapDailyBookingMmbtu?.length + headerEntryDateMaxHourBookingMmbtu?.length + headerEntryDateCapDailyBookingMmscfd?.length)
                                                )
                                                
                                                return (
                                                    <td
                                                        key={key + '-' + idx}
                                                        className="px-4 py-2 border-b border-gray-300 text-right text-[#464255]"
                                                    >
                                                        {isEditing && modeEditing === 'entry' ? (
                                                            <NumericFormat
                                                                // value={dataRowAfterFromTo[rowIndex][key]?.value || ''}
                                                                value={entryValEdited[rowIndex][key] || ''}
                                                                onValueChange={(values) => {
                                                                    const { value } = values;

                                                                    // ถ้าแก้ไขข้อมูลหลังคีย์ 6 ให้ setIsKeyAfter34Change = true
                                                                    setIsKeyAfter34Change(true)
                                                                    setDataRowAfterFromTo((prev: any) => {
                                                                        const updated = [...prev];
                                                                        if (updated[rowIndex]) {
                                                                            updated[rowIndex][key] = {
                                                                                ...updated[rowIndex][key],
                                                                                value: value,
                                                                            };
                                                                        }
                                                                        return updated;
                                                                    });

                                                                    setEntryValEdited((prev: any) => {
                                                                        const updatedEntry = [...prev];
                                                                        if (updatedEntry[rowIndex]) {
                                                                            updatedEntry[rowIndex][key] = value;
                                                                        }
                                                                        return updatedEntry;
                                                                    });
                                                                    
                                                                    if(!isNotCalSum){
                                                                        const resultSum = entryValEdited.reduce((acc: string | undefined, prevItem: any, sumIndex: number) => {
                                                                            Object.entries(prevItem)
                                                                            .filter(([prevItemKey]) => prevItemKey == key)
                                                                            .forEach(([prevItemKey, prevItemValue]: any) => {
                                                                                const prevKeyNum = Number(prevItemKey);
                                                                                if(prevKeyNum >= 7){
                                                                                    if(isNotCalSum){
                                                                                        acc = sumValEdited[key];
                                                                                    }
                                                                                    else{
                                                                                        const targetValue = (sumIndex == rowIndex) ? value : prevItemValue
                                                                                        const prevItemValueNum = typeof targetValue === "number" ? targetValue : Number((targetValue ?? "").toString().replace(/,/g, "").trim());
                                                                                        const accValueNum = acc == undefined ? undefined : Number(acc?.replace(/,/g, "")?.trim());
                                                                                        
                                                                                        if((prevItemValueNum || prevItemValueNum === 0) && !Number.isNaN(prevItemValueNum)){
                                                                                            if((accValueNum || accValueNum === 0) && !Number.isNaN(accValueNum)){
                                                                                                acc = (prevItemValueNum + accValueNum).toFixed(3);
                                                                                            }
                                                                                            else{
                                                                                                acc = prevItemValueNum.toFixed(3);
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                                else{
                                                                                    acc = prevItemValue;
                                                                                }
                                                                            });
                                                                            return acc;
                                                                        }, undefined as string | undefined)
                                                                        
                                                                        setSumValEdited((prev: any) => {
                                                                            if (!prev) return prev;
                                                                            return {
                                                                                ...prev,
                                                                                [key]: resultSum,
                                                                            };
                                                                        });
                                                                    }
                                                                    settrickerEdit(true)

                                                                }}
                                                                thousandSeparator=","
                                                                decimalScale={3}
                                                                fixedDecimalScale={true}
                                                                allowNegative={false}
                                                                // className={`${inputClass} min-w-[80px] w-[120px] max-w-[150px] text-right`}
                                                                className={`${inputClass}`}
                                                                style={{
                                                                    textAlign: "right",
                                                                    // minWidth: "110px",
                                                                    // width: "95%",
                                                                    width: "140px",
                                                                    // overflow: "hidden",
                                                                    // whiteSpace: "nowrap",
                                                                }}
                                                            />
                                                        ) : (
                                                            // dataRowAfterFromTo[rowIndex][key]?.value ? formatNumberThreeDecimal(dataRowAfterFromTo[rowIndex][key]?.value) : ''
                                                            (entryValEdited[rowIndex][key] && entryValEdited[rowIndex][key] !== ' ') ? formatNumberThreeDecimal(entryValEdited[rowIndex][key]) : ''
                                                        )}
                                                    </td>
                                                )
                                            }
                                            )}
                                    </tr>
                                )
                            }

                            )
                        }

                        {/* ############### SUMMARY ENTRY ############### */}
                        {
                            mode == "entry" && summaryData?.length > 0 && summaryData?.map((item: any, rowIndex: any) => {
                                return (
                                    <tr key={rowIndex} className='h-[50px]' style={{ backgroundColor: item[0]?.zoneObj?.zone_color ? item[0]?.zoneObj?.zone_color : '#ffffff' }}>
                                        <td
                                            // colSpan={9} // ถ้ามี pressure และ temp ใช้ 9
                                            colSpan={5}
                                            className="px-4 py-2 text-left font-bold text-[#464255]"
                                            style={{ color: getContrastTextColor(item[0]?.zoneObj?.zone_color) }}
                                        >
                                            {`Sum Entry ${item[0]?.zoneObj?.zone}`}
                                        </td>

                                        {Object.keys(item)
                                            .filter((key) => Number(key) >= 7)
                                            .map((key, colIndex) => {
                                                return (
                                                    <td
                                                        key={key + '-' + colIndex}
                                                        className="px-4 py-2 font-bold border-gray-300 text-right text-[#464255]"
                                                        style={{ color: getContrastTextColor(item[0]?.zoneObj?.zone_color) }}
                                                    >
                                                        {item[key]?.value ? formatNumberThreeDecimal(item[key]?.value) : ''}
                                                    </td>
                                                )
                                            }
                                            )}
                                    </tr>
                                )
                            })
                        }

                        {/* ############### SUMMARY ของ SUMMARY คือ SUUUUUMMAAAAAARYYYYYYYYY! ############### */}
                        <tr
                            key="grand-total"
                            className="h-[50px]"
                            style={{ backgroundColor: '#1473A1' }}
                        >
                            <td
                                colSpan={5} // ถ้ามี pressure และ temp ใช้ 9
                                className="px-4 py-2 text-left font-bold text-[#ffffff]"
                            >
                                {`TOTAL ENTRY`}
                            </td>

                            {
                                grandSumTotal && Object.keys(grandSumTotal)
                                    .filter((key) => Number(key) >= 7)
                                    .map((key, colIndex) => {
                                        const keyNum = Number(key);
                                        const keyIndex = keyNum - 7
                                        const isNotCalSum = (
                                            (keyIndex >= headerEntryDateCapDailyBookingMmbtu.length && keyIndex < headerEntryDateCapDailyBookingMmbtu.length + headerEntryDateMaxHourBookingMmbtu.length) ||
                                            (keyIndex >= headerEntryDateCapDailyBookingMmbtu.length + headerEntryDateMaxHourBookingMmbtu.length + headerEntryDateCapDailyBookingMmscfd.length)
                                        )
                                        if(isNotCalSum && isEditing && modeEditing === 'entry'){
                                            return (
                                                <td
                                                key={key + '-' + colIndex}
                                                className="px-4 py-2 font-bold border-gray-300 text-right text-[#ffffff]"
                                                >
                                                    <NumericFormat
                                                        value={grandSumTotal[key]?.value ? formatNumberThreeDecimal(grandSumTotal[key].value) : ''}
                                                        onValueChange={(values) => {
                                                            const { value } = values;

                                                            // ถ้าแก้ไขข้อมูลหลังคีย์ 6 ให้ setIsKeyAfter34Change = true
                                                            setIsKeyAfter34Change(true)
                                                            
                                                            setSumValEdited((prev: any) => {
                                                                if (!prev) return prev;
                                                                return {
                                                                    ...prev,
                                                                    [key]: value,
                                                                };
                                                            });
                                                            settrickerEdit(true)

                                                        }}
                                                        thousandSeparator=","
                                                        decimalScale={3}
                                                        fixedDecimalScale={true}
                                                        allowNegative={false}
                                                        // className={`${inputClass} min-w-[80px] w-[120px] max-w-[150px] text-right`}
                                                        className={`${inputClass}`}
                                                        style={{
                                                            textAlign: "right",
                                                            // minWidth: "110px",
                                                            // width: "95%",
                                                            width: "140px",
                                                            // overflow: "hidden",
                                                            // whiteSpace: "nowrap",
                                                        }}
                                                    />
                                                </td>
                                            )
                                        }
                                        else{
                                        return (
                                            <td
                                                key={key + '-' + colIndex}
                                                className="px-4 py-2 font-bold border-gray-300 text-right text-[#ffffff]"
                                            >
                                                {grandSumTotal[key]?.value ? formatNumberThreeDecimal(grandSumTotal[key].value) : ''}
                                            </td>
                                        )
                                        }
                                    })
                            }
                        </tr>

                    </tbody>
                </table>
            }
        </div >
    );
};

export default TableEntry;