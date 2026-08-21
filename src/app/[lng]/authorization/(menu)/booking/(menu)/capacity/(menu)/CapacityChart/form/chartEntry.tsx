import { useEffect, useMemo, useRef } from "react";
import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { darkenColor, exportChartToExcel, filterDataChartByMonthRange, formatDateNoTime, formatNumber, generateUserPermission, hexToRgba, toDayjs } from "@/utils/generalFormatter";
import { InputSearch } from "@/components/other/SearchForm";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import BtnGeneral from "@/components/other/btnGeneral";
import { useAppDispatch } from "@/utils/store/store";
import { fetchShipperGroup } from "@/utils/store/slices/shipperGroupSlice";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import getUserValue from "@/utils/getuserValue";
import { getService } from "@/utils/postService";
import MonthYearPickaSearch from "@/components/library/dateRang/monthYearPicker";
import { decryptData } from "@/utils/encryptionData";
import Spinloading2 from "@/components/other/spinLoading2";
import getCookieValue from "@/utils/getCookieValue";

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isBetween from "dayjs/plugin/isBetween";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import weekday from "dayjs/plugin/weekday";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(isBetween); // Extend Day.js with isBetween plugin
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(weekday);
dayjs.tz.setDefault("Asia/Bangkok")

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const ChartEntry: React.FC<any> = ({ }) => {
    const userDT: any = getUserValue();

    // ############### SAVE IMAGE OF CHART ###############
    const chartRef: any = useRef(null); // Create ref for the chart
    const handleSaveImage = () => {
        if (chartRef.current) {
            const chart = chartRef.current;
            const canvas = chart.canvas;

            // Create a new canvas with the same size
            const newCanvas = document.createElement("canvas");
            const ctx = newCanvas.getContext("2d");

            if (!ctx) return;

            newCanvas.width = canvas.width;
            newCanvas.height = canvas.height;

            // Fill the new canvas with white background
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);

            // Draw the chart's existing canvas on top
            ctx.drawImage(canvas, 0, 0);

            // Convert the final image to base64
            const imageURI = newCanvas.toDataURL("image/png");

            // Create a temporary <a> element to trigger download
            const link = document.createElement("a");
            link.href = imageURI;
            link.download = "chart.png"; // Set the default file name
            link.click(); // Trigger the download
        }
    };

    // ############### REDUX DATA ###############
    const { shipperGroupData, areaMaster, termTypeMaster } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();
    useEffect(() => {
        if (forceRefetch) {
            dispatch(fetchShipperGroup());
            dispatch(fetchAreaMaster());
        }
        if (forceRefetch) {
            setForceRefetch(false);
        }
    }, [dispatch, shipperGroupData, areaMaster, forceRefetch]);

    // ############### PERMISSION ###############
    const [userPermission, setUserPermission] = useState<any>();
    let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
    // let user_permission: any = getCookieValue("k3a9r2b6m7t0x5w1s8j");
    user_permission = user_permission ? decryptData(user_permission) : null;

    const getPermission = () => {
        if (user_permission) {
            try {
                user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object
                const updatedUserPermission = generateUserPermission(user_permission);
                setUserPermission(updatedUserPermission);
            } catch (error) {
                // Failed to parse user_permission:
            }
        } else {
            // // No user_permission found
        }
    }

    // ############### FETCH ###############
    const [userData, setUserData] = useState<any>([]);
    const [dataMain, setDataMain] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [filteredDataMainGraph, setFilteredDataMainGraph] = useState<any>();
    const [filteredDataMain, setFilteredDataMain] = useState<any>([]); // ข้อมูลกราฟหลัก

    // ---
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(toDayjs().toDate());
    const [srchEndDate, setSrchEndDate] = useState<Date | null>(toDayjs().add(10, 'year').endOf('year').toDate());

    // const [srchStartDateMain, setSrchStartDateMain] = useState<Date | null>(toDayjs().toDate());
    // const [srchEndDateMain, setSrchEndDateMain] = useState<Date | null>(toDayjs().add(10, 'year').endOf('year').toDate());
    const [srchStartDateMain, setSrchStartDateMain] = useState<Date | null>(null);
    const [srchEndDateMain, setSrchEndDateMain] = useState<Date | null>(null);

    const fetchData = async () => {
        setIsLoading(false)

        const idsArray = shipperGroupData?.data?.map((item: any) => item.id);

        // กรอง area ที่หมด end_date และ start_date
        const presentDate = new Date(); // Get current date
        const filteredAreas = areaMaster?.data.filter((item: any) => {
            const startDate = new Date(item.start_date);
            const endDate = item.end_date ? new Date(item.end_date) : null;
            return startDate <= presentDate && (endDate === null || endDate >= presentDate);
        });
        // let start_date = toDayjs().toDate()
        // let end_date = toDayjs().add(10, 'year').endOf('year').toDate()
        // let start_date = toDayjs()
        //     .startOf("year")
        //     .toDate();

        // let end_date = toDayjs()
        //     .add(10, "year")
        //     .endOf("year")
        //     .toDate();
        // Default API ตอนเข้าหน้า
        // Start From = วันที่ 1 ของเดือนปัจจุบัน
        const start_date = toDayjs()
            .startOf("month")
            .toDate();

        // End Date = สิ้นเดือนของเดือนเดียวกันในอีก 20 ปี
        const end_date = toDayjs()
            .add(20, "year")
            .endOf("month")
            .toDate();
          
        let filter_string = `${userDT?.account_manage?.[0]?.user_type_id == 1 || userDT?.account_manage?.[0]?.user_type_id == 2 ? idsArray : userDT?.account_manage?.[0]?.group_id}` // ถ้าเป็น TSO เอา id shipper ทั้งหมดมาแสดง ถ้าเป็น shipper เอาแค่ของตัวเอง
        try {
            const response_area_chart: any = await getService(`/master/capacity-dashboard/area-data-graph?id=[${filter_string}]&start_date=${formatDateNoTime(start_date)}&end_date=${formatDateNoTime(end_date)}`);
            const filteredAreaNames = new Set(filteredAreas.map((area: any) => area.name));
            const filteredResData = response_area_chart.map((item: any) => ({
                ...item,
                area: item.area.filter((area: any) => filteredAreaNames.has(area.name))
            })).filter((item: any) => item.area.length > 0);


            // filter ข้อมูลตาม start - end
            const filtered_entry_data = filterDataChartByMonthRange(
                filteredResData?.[0],
                formatDateNoTime(start_date),
                formatDateNoTime(end_date),
                {
                    // เปรียบเทียบระดับ 'month' จะตรงกับความหมายของคีย์ "month" ที่เป็น "MMM YYYY"
                    compareUnit: 'month',
                    // ถ้าอยากลบ item ที่ nsetData ว่างหลังกรอง:
                    removeEmptyDataItem: false,
                    // ถ้าอยากลบ conditions ที่ว่าง:
                    removeEmptyConditions: false,
                }
            );

            // setDataMain(filteredResData?.[0]); // set เอาแค่ entry
            // setFilteredDataMain(filteredResData?.[0]); // set เอาแค่ entry
            // setFilteredDataMainGraph(filteredResData?.[0]);

            setDataMain(filtered_entry_data); // set เอาแค่ entry
            setFilteredDataMain(filtered_entry_data); // set เอาแค่ entry
            setFilteredDataMainGraph(filtered_entry_data);

            setTimeout(() => {
                setIsLoading(true)
            }, 500);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    useEffect(() => {
        // setSrchStartDate(new Date('Mon Jan 04 2010 00:00:00 GMT+0700 (Indochina Time)'))
        // setSrchEndDate(new Date('Sat Jan 02 2055 00:00:00 GMT+0700 (Indochina Time)'))
        getPermission();
        fetchData();
        setUserData(userDT?.account_manage?.[0]);
    }, []);

    // ############### SEARCH ###############
    const [key, setKey] = useState(0);
    const [srchEntry, setSrchEntry] = useState('');
    const [srchShipper, setSrchShipper] = useState<any>([]);
    const [srchArea, setSrchArea] = useState<any>([]);
    const [srchTermType, setSrchTermType] = useState<any>([]);


    // --
    const startDateDefault = new Date();
    startDateDefault.setFullYear(startDateDefault.getFullYear() - 2);
    const resStartDateDefault = formatDateNoTime(startDateDefault);

    const endDateDefault = new Date();
    endDateDefault.setFullYear(endDateDefault.getFullYear() + 8);
    const resEndDateDefault = formatDateNoTime(endDateDefault);


    useEffect(() => {
        setFilteredDataMainGraph(dataMain)
    }, [])

    const handleFieldSearch = async () => {
        setIsLoading(false)

        let start_date: any = srchStartDateMain
        let end_date: any = srchEndDateMain
        console.log('_ start_date : ', start_date);
        console.log('_ end_date : ', end_date);
        // ถ้า srchStartDateMain และ srchEndDateMain เป็นวันเดียวกัน ให้ปรับ srchEndDateMain เป็นวันสิ้นเดือน
        // if (start_date && end_date) {
        //     console.log('..');
        //     const isSameDay =
        //         start_date.getFullYear() === end_date.getFullYear() &&
        //         start_date.getMonth() === end_date.getMonth() &&
        //         start_date.getDate() === end_date.getDate();

        //     if (isSameDay) {
        //         // end_date = new Date(end_date.getFullYear(), end_date.getMonth() + 1, 0); // วันสุดท้ายของเดือน
        //         end_date = new Date(end_date.getFullYear(), end_date.getMonth() + 1, 1); // วันแรกของเดือนหน้า เพื่อที่ถ้าฟิลเตอร์เดือนเดียว จะให้กราฟขึ้นสวย ๆ 
        //     }
            
        //     start_date = formatDateNoTime(start_date);
        //     end_date = formatDateNoTime(end_date);
        //     console.log('* start_date : ', start_date);
        //     console.log('* end_date : ', end_date);
        // } else {
          
        //     if(start_date){
        //         start_date = toDayjs(start_date).format("DD/MM/YYYY")
        //         end_date = toDayjs(start_date).add(10, 'year').endOf('year').format("DD/MM/YYYY")
        //     }else if(end_date){
        //         start_date = toDayjs(end_date).subtract(10, 'year').endOf('year').format("DD/MM/YYYY")
        //         end_date = toDayjs(end_date).format("DD/MM/YYYY")
        //     }else{
        //         start_date = toDayjs().format("DD/MM/YYYY")
        //         end_date = toDayjs().add(10, 'year').endOf('year').format("DD/MM/YYYY")
        //     }

            
        // }
        if (start_date && end_date) {

            const start = toDayjs(start_date);
            let end = toDayjs(end_date);

            // ถ้าเลือกเดือนเดียวกัน
            if (start.isSame(end, "month")) {
                end = end.add(1, "month").startOf("month");
            }

            start_date = start
                .startOf("month")
                .format("DD/MM/YYYY");

            end_date = end
                .endOf("month")
                .format("DD/MM/YYYY");

        } else if (start_date) {

            const start = toDayjs(start_date);

            start_date = start
                .startOf("month")
                .format("DD/MM/YYYY");

            end_date = start
                .add(10, "year")
                .endOf("year")
                .format("DD/MM/YYYY");

        } else if (end_date) {

            const end = toDayjs(end_date);

            start_date = end
                .subtract(10, "year")
                .startOf("year")
                .format("DD/MM/YYYY");

            end_date = end
                .endOf("month")
                .format("DD/MM/YYYY");

        } else {

            // ไม่กรอก Start/End
            start_date = toDayjs()
                .startOf("year")
                .format("DD/MM/YYYY");

            end_date = toDayjs()
                .add(10, "year")
                .endOf("year")
                .format("DD/MM/YYYY");
        }
        console.log('srchStartDateMain : ', srchStartDateMain);
        console.log('start_date : ', start_date);
        console.log('- - -');
        console.log('srchStartDateMain : ', srchStartDateMain);
        console.log('end_date : ', end_date);
        console.log('- - -');

        // ใหม่
        const idsArray = shipperGroupData?.data?.map((item: any) => item.id);
        let filter_string = `${userDT?.account_manage?.[0]?.user_type_id == 1 || userDT?.account_manage?.[0]?.user_type_id == 2 ? idsArray : userDT?.account_manage?.[0]?.group_id}` // ถ้าเป็น TSO เอา id shipper ทั้งหมดมาแสดง ถ้าเป็น shipper เอาแค่ของตัวเอง

        const url_ = `/master/capacity-dashboard/area-data-graph?id=[${srchShipper?.length > 0 ? srchShipper : filter_string}]&start_date=${start_date}&end_date=${end_date}`

        const response_area_chart: any = await getService(url_);

        const filterDataTermArea = (data: any, srchArea: string[] = [], srchTermType: number[] = []) => {
            const areas = (data?.area ?? [])
                // กรอง Area ตามชื่อ (ถ้าไม่เลือกเลย = เอาทุกอัน)
                .filter((a: any) => srchArea.length === 0 || srchArea.includes(a?.name))
                // กรอง term_type ตาม id และตัดที่ data ว่าง
                .map((a: any) => {
                    const termTypeFiltered = (a?.term_type ?? [])
                        .filter((t: any) => srchTermType.length === 0 || srchTermType.includes(t?.id))
                        .filter((t: any) => Array.isArray(t?.data) ? t.data.length > 0 : true); // ตัด term_type ที่ data.length === 0

                    return { ...a, term_type: termTypeFiltered };
                });

            // ถ้าต้องการตัด Area ที่ไม่มี term_type เหลือเลย ออกด้วย ให้ปลดคอมเมนต์บรรทัดถัดไป
            // const areasFinal = areas.filter((a: any) => (a?.term_type?.length ?? 0) > 0);

            return {
                ...data,
                area: areas, // หรือใช้ areasFinal ถ้าต้องการตัด Area ว่าง
            };
        };

        const result_filtered_term_area = filterDataTermArea(response_area_chart?.[0], srchArea, srchTermType); // .[0] คือเอาแค่ entry

        // ทั้ง Entry กับ Exit ของ EGAT มี Area เกินมา (ต้องขึ้นเฉพาะที่เขาจองมา) กรณีนี้ืคือ Filter Shipper  https://app.clickup.com/t/86evh204d
        const filter_term_type_ = result_filtered_term_area?.area?.filter((item: any) => item?.term_type?.length !== 0)
        const mappppp = {
            ...result_filtered_term_area,
            area: filter_term_type_
        }

        // filter ข้อมูลตาม start - end
        const filtered_entry_data = filterDataChartByMonthRange(
            // result_filtered_term_area,
            mappppp,
            // formatDateNoTime(srchStartDateMain),
            // srchEndDateMain && dayjs(srchStartDateMain).isBefore(dayjs(srchEndDateMain)) ? formatDateNoTime(srchEndDateMain) : formatDateNoTime(toDayjs(srchStartDateMain).add(1, 'year').endOf('year').startOf("month").toDate()),
            start_date,
            end_date,
            {
                // เปรียบเทียบระดับ 'month' จะตรงกับความหมายของคีย์ "month" ที่เป็น "MMM YYYY"
                compareUnit: 'month',
                // ถ้าอยากลบ item ที่ nsetData ว่างหลังกรอง:
                removeEmptyDataItem: false,
                // ถ้าอยากลบ conditions ที่ว่าง:
                removeEmptyConditions: false,
            }
        );

        // setDataMain(result_filtered_term_area);
        // setFilteredDataMain(result_filtered_term_area);
        // setFilteredDataMainGraph(result_filtered_term_area);
        setDataMain(filtered_entry_data);
        setFilteredDataMain(filtered_entry_data);
        setFilteredDataMainGraph(filtered_entry_data);

        setTimeout(() => {
            setIsLoading(true)
        }, 500);

        // เดิม
        // let filteredAreas = dataMain.area.filter((area: any) => (srchArea.length ? srchArea.includes(area.name) : true)) // Condition 5
        //     .map((area: any) => ({
        //         ...area,
        //         term_type: area.term_type
        //             .filter((term: any) => (srchTermType.length ? srchTermType.includes(term.id) : true)) // Condition 7
        //             .map((term: any) => ({
        //                 ...term,
        //                 data: term.data.filter((item: any) =>
        //                     srchShipper.length ? srchShipper.includes(item.shipper.id) : true // Condition 6
        //                 ),
        //                 conditions: term.conditions.filter((cond: any) => {
        //                     const condDate = new Date(cond.month);
        //                     return (
        //                         (!srchStartDateMain || condDate >= new Date(srchStartDateMain)) && // Condition 1
        //                         (!srchEndDateMain || condDate <= new Date(srchEndDateMain)) // Condition 2 & 3
        //                     );
        //                 })
        //             }))
        //             .filter((term: any) => term.data.length > 0) // Remove term_type if data is empty
        //     }))
        // // .filter((item: any) => item?.sumCondition?.length > 0);
        // // filteredAreas = filteredAreas.filter((item: any) => item?.sumCondition?.length > 0);

        // let data_xxx = {
        //     "area": filteredAreas.filter((item: any) => item?.sumCondition?.length > 0),
        //     "color": dataMain.color,
        //     "create_by": dataMain.create_by,
        //     "create_date": dataMain.create_date,
        //     "create_date_num": dataMain.create_date_num,
        //     "id": dataMain.id,
        //     "name": dataMain.name,
        //     "update_by": dataMain.update_by,
        //     "update_date": dataMain.update_date,
        //     "update_date_num": dataMain.update_date_num,
        // }

        // setFilteredDataMainGraph(data_xxx);
    };

    const handleReset = () => {
        setSrchStartDate(null);
        setSrchEndDate(null);

        setSrchStartDateMain(null);
        setSrchEndDateMain(null);

        setSrchEntry('');
        setSrchShipper([]);
        setSrchArea([]);
        setSrchTermType([]);
        // setFilteredDataMainGraph(area_data)
        // setFilteredDataMainGraph(dataMain)

        fetchData();

        setKey((prevKey) => prevKey + 1);
    };

    // ############### SUM DATA CONDITION ###############
    const sumConditionsByMonth = (data: any) => {

        // Iterate through all areas
        data.area.forEach((area: any) => {
            // Use a Map to group values by month for the specific area
            const monthSums = new Map<string, number>();

            // Iterate through all term types in the area
            area.term_type.forEach((termType: any) => {
                // Iterate through all conditions and sum them by month
                termType.conditions.forEach((condition: any) => {
                    const { month, value } = condition;
                    if (monthSums.has(month)) {
                        monthSums.set(month, monthSums.get(month)! + value);
                    } else {
                        monthSums.set(month, value);
                    }
                });
            });

            // Convert the Map into the desired array format
            const sumCondition = Array.from(monthSums.entries()).map(([month, value]) => ({ month, value }));
            // Sort the results by month for better readability (optional)
            sumCondition.sort((a, b) => new Date(`01-${a.month}`).getTime() - new Date(`01-${b.month}`).getTime());

            const areaDetail = areaMaster?.data?.find((item: any) => item.name === area?.name);
            area.areaDetail = areaDetail;

            // Add sumCondition to the specific area
            area.sumCondition = sumCondition;
        });

        return data;
    };

    // ############### TEST 3 ###############
    const [chartData, setChartData] = useState<any>(null);
    const [maxPercent, setMaxPercent] = useState<any>(0);
    const [dataFiltered, setDataFiltered] = useState<any>([])
    
    const leadingZerosToNull = (arr: number[]) => {
        let seenNonZero = false;

        return arr.map(v => {
            if (!seenNonZero) {
                if (v === 0) return null;
                seenNonZero = true;
            }
            return v;
        });
    };

    const processChartData = (dataReal?: any, showEntryOrExit?: any, areaName?: any) => {
        const datasets: any = [];
        let labels: any = new Set();
        // let labels: any = []

        const ResSumConditionData = sumConditionsByMonth(dataReal);

        // labels = Array.from(labels).sort((a, b) => new Date(`01-${a}`).getTime() - new Date(`01-${b}`).getTime());
        // return { labels, datasets };

        ResSumConditionData?.area?.forEach((item: any) => {
            // Collect labels without overwriting
            item.sumCondition.forEach((sd: any) => labels.add(sd?.month));

            datasets.push({
                label: item.name,
                // data: Array.from(labels).sort((a, b) => new Date(`01-${a}`).getTime() - new Date(`01-${b}`).getTime()
                // ).map((condition: any) => {
                //     let nums: number | null = null;
                //     for (let i = 0; i < item?.term_type.length; i++) {

                //         for (let ii = 0; ii < item?.term_type[i]?.data.length; ii++) {
                //             const term = item?.term_type[i];

                //             // Check if the term type is "Short Term (Non-firm)" or id === 4
                //             // if (term?.name === "Short Term (Non-firm)" || term?.id === 4) {
                //             const nsetData = term?.data[ii]?.nsetData;

                //             // Find the maximum value where month matches the condition
                //             let maxValue: number | null = null;
                //             for (let iii = 0; iii < nsetData?.length; iii++) {
                //                 if (nsetData[iii]?.month === condition && (nsetData[iii]?.value || nsetData[iii]?.value == 0)) {
                //                     if(maxValue){
                //                     maxValue = Math.max(maxValue, nsetData[iii]?.value);
                //                     }
                //                     else{
                //                         maxValue = nsetData[iii]?.value;
                //                     }
                //                 }
                //             }

                //             // Add only the highest value for the condition month
                //             if(maxValue || maxValue==0){
                //                 if(nums){
                //             nums += maxValue;
                //                 }
                //                 else{
                //                     nums = maxValue;
                //                 }
                //             }
                //             // } 
                //         }
                //     }


                //     // https://app.clickup.com/t/86evh204d <-- ข้อนี้ถามว่าทำไมบาง area ไม่ขึ้้นแสดงใน chart
                //     // % ที่แสดงใน chart มันมีเอา area_nominal_capacity มาใช้ด้วย ถ้า area_nominal_capacity เป็น 0 มันจะไม่แสดง ดูแค่ค่า value book อย่างเดียวไม่ได้ครับ
                //     const percentage = ((nums || nums == 0) && item?.areaDetail?.area_nominal_capacity > 0) ? ((nums / item?.areaDetail?.area_nominal_capacity) * 100).toFixed(2) : null;

                //     setMaxPercent((prevMax: any) => Math.max(prevMax, parseFloat(percentage || '0.00')));
                //     return percentage ? parseFloat(percentage) : null;
                // }),
                data: Array.from(labels)
                .sort(
                    (a, b) =>
                        new Date(`01-${a}`).getTime() -
                        new Date(`01-${b}`).getTime()
                )
                .map((condition: any) => {

                    let nums: number | null = null;

                    for (const term of item?.term_type ?? []) {

                        for (const booking of term?.data ?? []) {

                            let maxValue: number | null = null;

                            for (const nset of booking?.nsetData ?? []) {

                                if (
                                    nset?.month === condition &&
                                    nset?.value !== null &&
                                    nset?.value !== undefined
                                ) {
                                    const value = Number(nset.value);

                                    maxValue =
                                        maxValue === null
                                            ? value
                                            : Math.max(maxValue, value);
                                }
                            }

                            if (maxValue !== null) {
                                nums =
                                    nums === null
                                        ? maxValue
                                        : nums + maxValue;
                            }
                        }
                    }

                    const capacity = Number(
                        item?.areaDetail?.area_nominal_capacity ?? 0
                    );

                    const percentage =
                        nums !== null && capacity > 0
                            ? Number(
                                ((nums / capacity) * 100).toFixed(2)
                            )
                            : null;

                    if (percentage !== null) {
                        setMaxPercent((prevMax: number) =>
                            Math.max(prevMax, percentage)
                        );
                    }

                    return percentage;
                }),
                backgroundColor: hexToRgba(item.color, 0.1),
                borderColor: item.color,
                borderWidth: 3,
                // pointRadius: 0,
                // tension: 0.1,
                tension: 0,
                fill: true,
            });
        });

        const sortedLabels = Array.from(labels).sort((a, b) =>
            new Date(`01-${a}`).getTime() - new Date(`01-${b}`).getTime()
        );

        // กรองเอาข้อมูล area ที่ไม่มี data ออก จุด area ให้แสดงเฉพาะ จุดที่มีข้อมูลในกราฟ https://app.clickup.com/t/86erjz69n
        const normalizedDatasets = datasets
            .filter((dataset?: any) => dataset.data.length > 0)
            .map((ds: any) => {
                // const data = leadingZerosToNull(ds.data);
                const data = ds.data;
                // pad ให้ยาวเท่า labels เพื่อเช็คว่าเส้นจบสุดกราฟหรือยัง
                const paddedData = [...data];
                while (sortedLabels.length && paddedData.length < sortedLabels.length) {
                    paddedData.push(null);
                }

                let lastNonNullIndex = -1;
                for (let i = paddedData.length - 1; i >= 0; i--) {
                    if (paddedData[i] !== null && paddedData[i] !== undefined) {
                        lastNonNullIndex = i;
                        break;
                    }
                }

                const reachesEnd = sortedLabels.length > 0 && lastNonNullIndex === sortedLabels.length - 1;

                // แสดงจุดเฉพาะจุดสุดท้ายของเส้นที่ไปไม่สุดแกน X
                const pointRadius = reachesEnd
                    ? 0
                    : paddedData.map((_: any, i: number) => (i === lastNonNullIndex ? 4 : 0));
                const pointHoverRadius = reachesEnd
                    ? 0
                    : paddedData.map((_: any, i: number) => (i === lastNonNullIndex ? 6 : 0));

                return {
                    ...ds,
                    data: paddedData,
                    pointRadius,
                    pointHoverRadius,
                    pointBackgroundColor: ds.borderColor,
                    pointBorderColor: ds.borderColor,
                };
            });

        return { labels: sortedLabels, datasets: normalizedDatasets };
    };

    useEffect(() => {

        if (dataMain && typeof dataMain === "object" && !Array.isArray(dataMain)) {
            // Usage example:
            const { labels, datasets } = processChartData(filteredDataMainGraph, false, false); // param ตัวสอง ถ้าเป็น entry ส่ง false, exit ส่ง true

            setChartData({ labels, datasets });
            setDataFiltered(datasets);
        }
    }, [dataMain, filteredDataMainGraph]);

    const { labels = [] } = chartData || {};

    useEffect(() => {
        setMaxPercent(maxPercent)
    }, [maxPercent])

    const options: any = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                align: 'start',
                labels: {
                    // usePointStyle: true, // Use circular legend markers
                    // pointStyle: 'rect', // Set legend point style to square
                    font: {
                        size: 10, // Adjust the font size (indirectly affects point size)
                    },
                    boxWidth: 12, // Set the width of the point style
                    boxHeight: 12, // Set the height of the point style
                    padding: 18, // Adjust padding between labels
                    generateLabels: (chart: any) => chart?.data?.datasets?.map((item: any, i: any) => {
                        const backgroundColor = chart.data.datasets[i].backgroundColor;
                        const darkerBorderColor = darkenColor(backgroundColor, 20);
                        return {
                            datasetIndex: i,
                            text: item?.label,
                            hidden: chart.getDatasetMeta(i).hidden,
                            fillStyle: backgroundColor,
                            strokeStyle: darkerBorderColor,
                            fontColor: '#787486',
                            borderWidth: 10,
                            borderRadius: 3,
                        };
                    }),
                },
            },
            tooltip: {
                mode: 'index',
                enabled: true,
                intersect: false,
                backgroundColor: 'white',
                titleColor: '#767676',
                bodyColor: '#767676',
                padding: 10,
                boxPadding: 5,
                callbacks: {
                    title: () => null, // Hides the title
                    // label: (tooltipItem: any) => tooltipItem?.dataset?.label || '', // Returns dataset label
                    label: (tooltipItem: any) => {
                        return tooltipItem?.dataset?.label + ': ' + `${formatNumber(tooltipItem?.raw)} %`
                    }, // Returns dataset label
                    // afterLabel: (tooltipItem: any) => `${formatNumber(tooltipItem?.raw)} %`, // Formats value with '%'
                    labelColor: (context: any) => {
                        const backgroundColor = context?.dataset?.backgroundColor;
                        const darkerBorderColor = darkenColor(backgroundColor, 20);
                        return (
                            {
                                borderColor: darkerBorderColor || '#000',
                                backgroundColor: context?.dataset?.backgroundColor || '#000',
                                borderWidth: 0,
                                borderRadius: 3,
                            }
                        )
                    },
                },
            },
            datalabels: {
                display: false,
            },
        },
        elements: {
            line: {
                fill: true
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Years',
                    font: {
                        weight: 'bold', // Make title font bold
                    },
                },
                type: 'category',
                labels: labels,
                grid: {
                    display: false, // Disable vertical grid lines (x-axis)
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Capacity Right (%)',
                    font: {
                        weight: 'bold', // Make title font bold
                    },
                },
                // max: 100, // max % เต็มร้อย
                max: (maxPercent + 20 <= 100) ? 100 : maxPercent + 20, // max % เต็มร้อย
                beginAtZero: true,
                grid: {
                    display: true, // Enable horizontal grid lines (y-axis)
                    color: 'rgba(243, 244, 246, 0.8)', // Set grid line color with opacity
                },
            },
        },
        animation: {
            onSuccess: () => {
                const chart = ChartJS.getChart('entryChart');
                if (chart) {
                    const { legend }: any = chart;
                    legend.top = -15;
                }
            },
        }
    };
    

    return (
        <div className={`h-auto min-h-[300px] overflow-y-auto block rounded-t-md relative z-1 p-2`}>
            <aside className="mt-auto ml-1 w-full sm:w-auto pb-2">
                <div className="flex justify-between w-full">
                    {/* text to the left */}
                    <div>
                        <h2 className="text-[16px] font-bold text-[#00ADEF] ">{`Entry`}</h2>
                    </div>

                    {/* buttons to the right */}
                    <div className="flex gap-2 justify-end">
                        <BtnGeneral
                            textRender={"Export Image"}
                            iconNoRender={false}
                            modeIcon={'export_image_chart'}
                            bgcolor={"#1473A1"}
                            generalFunc={() => handleSaveImage()}
                            can_export={userPermission ? userPermission?.f_export : false}
                        />
                        <BtnGeneral
                            bgcolor={"#24AB6A"}
                            modeIcon={'export'}
                            textRender={"Export"}
                            // generalFunc={() => exportChartToExcel(filteredDatasets, labels, 'entry_chart')} // old
                            generalFunc={() => exportChartToExcel(dataFiltered, labels, 'entry_chart')} // new
                            can_export={userPermission ? userPermission?.f_export : false}
                        />
                    </div>
                </div>
            </aside>

            <aside className="flex flex-wrap sm:flex-row gap-2 pb-2 w-full">

                <MonthYearPickaSearch
                    key={"start" + key}
                    label={"Start From"}
                    placeHolder="Select Start From"
                    allowClear
                    onChange={(e: any) => {
                        setSrchStartDateMain(e ? e : null)
                    }}
                />

                <MonthYearPickaSearch
                    key={"end" + key}
                    label={"Start To"}
                    placeHolder="Select Start To"
                    allowClear
                    onChange={(e: any) => {
                        setSrchEndDateMain(e ? e : null)
                    }}
                />

                <InputSearch
                    id="searchArea"
                    label="Area"
                    // type="select"
                    value={srchArea}
                    // selectboxMode="multi"
                    type="select-multi-checkbox"
                    onChange={(e) => setSrchArea(e.target.value)}
                    options={areaMaster?.data?.filter((item: any) =>
                        item?.entry_exit?.id == 1)?.map((item: any) => ({ // filter เอาแค่ entry
                            // value: item?.id?.toString(),
                            value: item.name,
                            label: item.name
                        }))
                    }
                />

                <InputSearch
                    id="searchShipper"
                    label="Shipper Name"
                    // type="select"
                    value={srchShipper}
                    // selectboxMode="multi"
                    type="select-multi-checkbox"
                    onChange={(e) => setSrchShipper(e.target.value)}
                    options={shipperGroupData?.data?.map((item: any) => ({
                        value: item.id,
                        label: item.name
                    }))}
                />

                <InputSearch
                    id="searchType"
                    label="Contract Type"
                    // type="select"
                    value={srchTermType}
                    // selectboxMode="multi"
                    type="select-multi-checkbox"
                    onChange={(e) => setSrchTermType(e.target.value)}
                    options={termTypeMaster?.data?.map((item: any) => ({
                        value: item.id,
                        label: item.name
                    }))}
                />

                <BtnSearch handleFieldSearch={handleFieldSearch} />
                <BtnReset handleReset={handleReset} />
            </aside>

            <div className="w-full overflow-x-auto overflow-y-hidden">
                <div
                    className="w-full h-[450px] p-2"
                    // style={{minWidth: chartData.labels.length > 10 ? `${chartData.labels.length * 50}px` : "100%",}}
                    style={{
                        minWidth: chartData?.labels && chartData.labels.length > 10
                            ? `${chartData.labels.length * 50}px`
                            : "100%",
                    }}
                >
                    {
                        // isLoading ?
                        isLoading && dataFiltered?.length > 0 ?
                            <Line
                                key={'line-capa-entry'}
                                id="entryChart"
                                ref={chartRef}
                                // data={{ labels, datasets: filteredDatasets }} // old
                                data={{ labels, datasets: dataFiltered }} // new
                                options={{
                                    ...options,
                                    responsive: true, // Ensure chart is responsive
                                    maintainAspectRatio: false, // Disable maintaining aspect ratio
                                }}
                            />

                            :
                            <Spinloading2 spin={!isLoading} rounded={20} />
                    }

                </div>
            </div>

        </div>
    )
}

export default ChartEntry;