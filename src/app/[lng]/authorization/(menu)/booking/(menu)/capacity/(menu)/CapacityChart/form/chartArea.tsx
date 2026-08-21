import { useEffect, useRef } from "react";
import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { exportChartToExcel, filterDataChartByMonthRange, formatDateNoTime, formatNumber, generateUserPermission, hexToRgba, parseMonth } from "@/utils/generalFormatter";
import { InputSearch } from "@/components/other/SearchForm";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import BtnGeneral from "@/components/other/btnGeneral";
import { fetchShipperGroup } from "@/utils/store/slices/shipperGroupSlice";
import { useAppDispatch } from "@/utils/store/store";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import { fetchEntryExit } from "@/utils/store/slices/entryExitSlice";
import getUserValue from "@/utils/getuserValue";
import { getService } from "@/utils/postService";
import MonthYearPickaSearch from "@/components/library/dateRang/monthYearPicker";
import { decryptData } from "@/utils/encryptionData";
import Spinloading2 from "@/components/other/spinLoading2";
import getCookieValue from "@/utils/getCookieValue";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const ChartArea: React.FC<any> = ({ }) => {
    const userDT: any = getUserValue();

    // ############### REDUX DATA ###############
    const { shipperGroupData, areaMaster, entryExitMaster, termTypeMaster } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const [areaName, setAreaName] = useState<any>('');
    const dispatch = useAppDispatch();
    useEffect(() => {
        if (forceRefetch) {
            dispatch(fetchShipperGroup());
            dispatch(fetchAreaMaster());
            dispatch(fetchEntryExit());
        }
        if (forceRefetch) {
            setForceRefetch(false);
        }
    }, [dispatch, shipperGroupData, areaMaster, entryExitMaster, forceRefetch]);

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

    useEffect(() => {
        getPermission();
    }, []);

    // ############### FETCH ###############
    // const startDateDefault = new Date();
    // // startDateDefault.setFullYear(startDateDefault.getFullYear() - 2);
    // const resStartDateDefault = formatDateNoTime(startDateDefault);

    // const endDateDefault = new Date();
    // endDateDefault.setFullYear(endDateDefault.getFullYear() + 25, endDateDefault.getMonth() + 1, 0);
    // const resEndDateDefault = formatDateNoTime(endDateDefault);

    const today = new Date();
    const startDateDefault = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
    );
    const endDateDefault = new Date(
        today.getFullYear() + 20,
        today.getMonth(),
        today.getDate()
    );

    const resStartDateDefault = formatDateNoTime(startDateDefault);
    const resEndDateDefault = formatDateNoTime(endDateDefault);

    const [userData, setUserData] = useState<any>([]);
    const [dataMain, setDataMain] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [filteredDataMain, setFilteredDataMain] = useState<any>([]); // ข้อมูลกราฟหลัก
    // const [srchStartDate, setSrchStartDate] = useState<Date | null>(new Date('Mon Jan 04 2010 00:00:00 GMT+0700 (Indochina Time)'));
    // const [srchEndDate, setSrchEndDate] = useState<Date | null>(new Date('Sat Jan 02 2055 00:00:00 GMT+0700 (Indochina Time)'));

    const fetchData = async () => {
        console.log('fetchData');
        setIsLoading(false)

        // ถ้า user เป็น shipper
        // https://app.clickup.com/t/86ert2k28 ตามที่คุยกัน หากเป็น shipper user ถ้ามี filter ชื่อ shipper ให้ค้างชื่อ shipper ตัวเองไว้เลย ไม่ต้องขึ้นเป็น dropdown ให้เลือก - ปรับทั้ง system
        if (userDT?.account_manage?.[0]?.user_type_id == 3) {
            setSrchShipper(userDT?.account_manage?.[0]?.group?.id)
        }

        const presentDate = new Date(); // Get current date
        const filteredAreas = areaMaster?.data.filter((item: any) => {
            const startDate = new Date(item.start_date);
            const endDate = item.end_date ? new Date(item.end_date) : null;
            return startDate <= presentDate && (endDate === null || endDate >= presentDate);
        });

        const idsArray = shipperGroupData?.data?.map((item: any) => item.id);
        let filter_string = `${userDT?.account_manage?.[0]?.user_type_id == 1 || userDT?.account_manage?.[0]?.user_type_id == 2 ? idsArray : userDT?.account_manage?.[0]?.group_id}` // ถ้าเป็น TSO เอา id shipper ทั้งหมดมาแสดง ถ้าเป็น shipper เอาแค่ของตัวเอง

        try {
            const response_area_chart: any = await getService(`/master/capacity-dashboard/area-data-graph?id=[${filter_string}]&start_date=${resStartDateDefault}&end_date=${resEndDateDefault}`);

            // กรองข้อมูลที่ area ยังไม่ถึง start_date หรือเกิน end_date
            const filteredAreaNames = new Set(filteredAreas.map((area: any) => area.name));
            const filteredResData = response_area_chart.map((item: any) => ({
                ...item,
                area: item.area.filter((area: any) => filteredAreaNames.has(area.name))
            })).filter((item: any) => item.area.length > 0);

            // setDataMain(response_area_chart);
            // setFilteredDataMain(response_area_chart);

            setDataMain(filteredResData);
            setFilteredDataMain(filteredResData);

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
        setFilteredDataMain(dataMain);
        setFilteredDataMainGraph(dataMain);
    }, [dataMain])

    useEffect(() => {
        fetchData();
        setUserData(userDT?.account_manage?.[0]);
    }, []);

    // ############### SEARCH ###############
    const [key, setKey] = useState(0);
    const [IsModeSearch, setIsModeSearch] = useState<boolean>(false);
    const [srchShipper, setSrchShipper] = useState<any>([]);
    const [srchArea, setSrchArea] = useState<any>('');
    const [srchTermType, setSrchTermType] = useState<any>([]);
    const [srchStartDateMain, setSrchStartDateMain] = useState<Date | null>(null);
    const [srchEndDateMain, setSrchEndDateMain] = useState<Date | null>(null);
    const [srchEntryMain, setSrchEntryMain] = useState('');
    const [filteredDataMainGraph, setFilteredDataMainGraph] = useState<any>(dataMain);

    useEffect(() => {
        setFilteredDataMainGraph(dataMain)
    }, [])

    const handleFieldSearch = async () => {
        console.log('handleFieldSearch');
        setIsModeSearch(true)

        // >>>>>>>>>>>> ใหม่ <<<<<<<<<<<<<
        setIsLoading(false)
        const idsArray = shipperGroupData?.data?.map((item: any) => item.id);
        let filter_string = `${userDT?.account_manage?.[0]?.user_type_id == 1 || userDT?.account_manage?.[0]?.user_type_id == 2 ? idsArray : userDT?.account_manage?.[0]?.group_id}` // ถ้าเป็น TSO เอา id shipper ทั้งหมดมาแสดง ถ้าเป็น shipper เอาแค่ของตัวเอง

        // MonthYearPicker คืนวันที่ 1 ของเดือน → แปลงเป็นวันสิ้นเดือน
        const endDate = srchEndDateMain
            ? formatDateNoTime(new Date(srchEndDateMain.getFullYear(), srchEndDateMain.getMonth() + 1, 0))
            : resEndDateDefault;
        const response_area_chart: any = await getService(`/master/capacity-dashboard/area-data-graph?id=[${srchShipper?.length > 0 ? srchShipper : filter_string}]&start_date=${srchStartDateMain ? formatDateNoTime(srchStartDateMain) : resStartDateDefault}&end_date=${endDate}`);

        let filter_ = response_area_chart
            // .filter((entry: any) => (srchEntryMain !== '' && srchEntryMain !== undefined ? entry.id === Number(srchEntryMain) : true)) // Condition 4 // ปิดไปเมื่อ 20251013
            .map((entry: any) => ({
                ...entry,
                area: entry.area
                    .filter((area: any) => (srchArea ? area.name === srchArea : true)) // Condition 5
                    .slice(0, 1)
                    .map((area: any) => ({
                        ...area,
                        term_type: area.term_type
                            .filter((term: any) => (srchTermType.length > 0 ? srchTermType.includes(term.id) : true)) // Condition 7 search term
                            .map((term: any) => ({
                                ...term,
                                data: term.data.filter((item: any) =>
                                    srchShipper.length ? srchShipper.includes(item.shipper.id) : true // Condition 6 search shipper
                                ),
                                // conditions: term.conditions.filter((cond: any) => {
                                //     const condDate = new Date(cond.month);
                                //     return (
                                //         (!srchStartDateMain || condDate >= new Date(srchStartDateMain)) && // Condition 1
                                //         (!srchEndDateMain || condDate <= new Date(srchEndDateMain)) // Condition 2 & 3
                                //     );
                                // })
                            }))
                        // .filter((term: any) => term.data.length > 0) // Remove term_type if data is empty
                    }))
            }))
        // .filter((entry: any) => entry.area.length > 0); // Remove empty areas
        console.log('filter_ : ', filter_);
        // ต้อง setSrchEntryMain ไม่งั้น processData ไม่ทำงาน
        let res_find_entry_exit
        if ((srchEntryMain !== '' || srchEntryMain !== undefined) && srchArea) {
            res_find_entry_exit = areaMaster?.data?.find((item: any) => item?.name == srchArea)
            setSrchEntryMain(res_find_entry_exit?.entry_exit_id.toString())
        }

        // // setDataMain(filter_);
        // // setFilteredDataMain(filter_);
        // setFilteredDataMainGraph(filter_)

        setDataMain(filter_);
        setFilteredDataMain(filter_);
        setFilteredDataMainGraph(filter_)

        // เสิชแล้วปั้น data chart เลย
        const { labels, datasets } = processChartData(filter_, (res_find_entry_exit?.entry_exit_id.toString() == '1' || res_find_entry_exit == undefined) ? false : true, srchArea == '' ? false : srchArea, srchStartDateMain ? formatDateNoTime(srchStartDateMain) : resStartDateDefault, endDate); // ถ้าเป็น entry ส่ง false, exit ส่ง true
        setChartData({ labels, datasets });

        setTimeout(() => {
            setIsLoading(true)
        }, 500);

        // // >>>>>>>>>>>> ใช้ได้ <<<<<<<<<<<<<
        // let filteredAreas = dataMain
        //     .filter((entry: any) => (srchEntryMain ? entry.id === Number(srchEntryMain) : true)) // Condition 4
        //     .map((entry: any) => ({
        //         ...entry,
        //         area: entry.area
        //             .filter((area: any) => (srchArea ? area.name === srchArea : true)) // Condition 5
        //             .slice(0, 1)
        //             .map((area: any) => ({
        //                 ...area,
        //                 term_type: area.term_type
        //                     .filter((term: any) => (srchTermType.length ? srchTermType.includes(term.id) : true)) // Condition 7 search term
        //                     .map((term: any) => ({
        //                         ...term,
        //                         data: term.data.filter((item: any) =>
        //                             srchShipper.length ? srchShipper.includes(item.shipper.id) : true // Condition 6 search shipper
        //                         ),
        //                         conditions: term.conditions.filter((cond: any) => {
        //                             const condDate = new Date(cond.month);
        //                             return (
        //                                 (!srchStartDateMain || condDate >= new Date(srchStartDateMain)) && // Condition 1
        //                                 (!srchEndDateMain || condDate <= new Date(srchEndDateMain)) // Condition 2 & 3
        //                             );
        //                         })
        //                     }))
        //                     .filter((term: any) => term.data.length > 0) // Remove term_type if data is empty
        //             }))
        //     })).filter((entry: any) => entry.area.length > 0); // Remove empty areas

        // setFilteredDataMainGraph(filteredAreas);
    };

    const handleReset = () => {
        setIsModeSearch(false)
        setSrchStartDateMain(null);
        setSrchEndDateMain(null);
        setSrchEntryMain('');
        setSrchShipper([]);
        setSrchArea('');
        setSrchTermType([]);

        // setFilteredDataMainGraph(dataMain)

        fetchData();
        setKey((prevKey) => prevKey + 1);

        const { labels, datasets } = processChartData(dataMain, false, false, resStartDateDefault, resEndDateDefault);
        setChartData({ labels, datasets });
    };

    // ############### TEST 3 ###############
    const processChartData = (dataChart?: any, showEntryOrExit?: any, areaName?: any, start_date?: any, end_date?: any) => {
        const datasets: any = [];

        const dataToProcess = showEntryOrExit ? dataChart[1] : dataChart[0]; // ถ้า search หา entry ก็ใช้ข้อมูลตามที่เสิช ถ้าไม่หามันจะเอา area แรก ของ entry มาแสดง ([0] == entry, [1] == exit)

        // filter ข้อมูลตาม start - end
        const filteredStartEnd = filterDataChartByMonthRange(
            dataToProcess,
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

        // filter หาจาก area name ถ้าไม่ส่ง หาจาก index แรก
        // const areaToProcess = areaName ? dataToProcess?.area?.find((area: any) => area?.name === areaName) : dataToProcess.area[0];
        const areaToProcess = filteredStartEnd?.area
            ? areaName
                ? filteredStartEnd.area.find((area: any) => area?.name === areaName)
                : filteredStartEnd.area[0]
            : undefined;

        setAreaName(areaToProcess ? areaToProcess?.name : '')

        let monthFullLabel1: any = areaToProcess?.term_type?.map((term: any) => {
            let test_label: any = []
            for (let ids = 0; ids < term.data.length; ids++) {
                let test_label_old = [...test_label, ...(term.data[ids].nsetData.map((eds: any) => eds?.month))]
                let test_label2: any = new Set(test_label_old)
                test_label = [...test_label2]
            }
            test_label = test_label
            return test_label
        })

        let monthFullLabel2: any = new Set((monthFullLabel1 || []).flatMap((fm: any) => fm))
        let monthFullLabelOk: any = [...monthFullLabel2].sort((a: any, b: any) => new Date(`01-${a}`).getTime() - new Date(`01-${b}`).getTime());

        const filteredMonthLabels = monthFullLabelOk?.filter((label: any) => {
            const monthDate: any = parseMonth(label);

            // If both start and end dates are provided
            if (srchStartDateMain && srchEndDateMain) {
                return monthDate >= srchStartDateMain && monthDate <= srchEndDateMain;
            }

            // If only srchStartDateMain is provided
            if (srchStartDateMain && !srchEndDateMain) {
                return monthDate >= srchStartDateMain;
            }

            // If only srchEndDateMain is provided
            if (!srchStartDateMain && srchEndDateMain) {
                return monthDate <= srchEndDateMain;
            }

            // If neither are provided, return all months (or adjust based on your requirements)
            return true;
        });

        areaToProcess?.term_type?.forEach((term: any) => {
            // Add term_type name and color to datasets
            datasets.push({
                label: term.name,
                // data: monthFullLabelOk.map((condition: any) => {
                data: filteredMonthLabels?.map((condition: any) => {
                    // labels.add(condition.month); // Collect unique labels
                    let nums: number | null = null;

                    for (let i = 0; i < term?.data.length; i++) {
                        for (let ii = 0; ii < term?.data[i]?.nsetData.length; ii++) {
                            if (term?.data[i]?.nsetData[ii]?.month === condition && (term?.data[i]?.nsetData[ii]?.value || term?.data[i]?.nsetData[ii]?.value == 0)) {
                                if(nums){
                                // nums = nums + term?.data[i]?.nsetData[ii]?.value

                                // nums = Math.max(nums, term?.data[i]?.nsetData[ii]?.value) // ---> ของเดิมหา max
                                nums += term?.data[i]?.nsetData[ii]?.value // v2.0.116 ควรที่จะแสดงค่าทุกรวม Contract ตอนนี้เหมือนจะแสดงเฉพาะ Contract ล่าสุด ---> https://app.clickup.com/t/86ev03qyh

                                }
                                else{
                                    nums = term?.data[i]?.nsetData[ii]?.value;
                                }
                            }
                        }
                    }

                    return nums
                    // return condition.value;
                }),
                backgroundColor: hexToRgba(term.color, 0.7),
                borderColor: term.color,
                borderWidth: 2.5,
                tension: 0.1, // Smooth the line chart
                fill: true,
            });
        });

        // return { labels: monthFullLabelOk, datasets };
        return { labels: filteredMonthLabels, datasets };
    };

    const [chartData, setChartData] = useState<any>(null);

    useEffect(() => {
        // if (dataMain?.length > 0) {
        if (dataMain?.length > 0 && !IsModeSearch) { // เติม !IsModeSearch มาตอน 20251013

            // const { labels, datasets } = processChartData(dataMain, srchEntryMain == '' || srchEntryMain == '1' ? false : true, areaName == '' ? false : areaName); // ถ้าเป็น entry ส่ง false, exit ส่ง true
            const { labels, datasets } = processChartData(filteredDataMainGraph, (srchEntryMain == '' || srchEntryMain == '1') ? false : true, areaName == '' ? false : areaName, srchStartDateMain ? formatDateNoTime(srchStartDateMain) : resStartDateDefault, srchEndDateMain ? formatDateNoTime(srchEndDateMain) : resEndDateDefault); // ถ้าเป็น entry ส่ง false, exit ส่ง true
            setChartData({ labels, datasets });
        }
        // }, [dataMain, srchEntryMain, areaName, filteredDataMainGraph, srchTermType]);
    }, [dataMain, filteredDataMainGraph, IsModeSearch]);

    // const { labels, datasets } = chartData;
    const { labels = [], datasets = [] } = chartData || {};

    const options: any = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true, // Use circular legend markers
                    pointStyle: 'circle', // Set legend point style to circle
                    font: {
                        size: 12, // Adjust the font size (indirectly affects point size)
                        weight: 700,
                    },
                    boxWidth: 20, // Set the width of the point style
                    boxHeight: 12, // Set the height of the point style
                    padding: 18, // Adjust padding between labels
                    generateLabels: (chart: any) => chart?.data?.datasets?.map((item: any, i: any) => ({
                        datasetIndex: i,
                        text: item?.label,
                        hidden: chart.getDatasetMeta(i).hidden,
                        fillStyle: chart.data.datasets[i].backgroundColor,
                        strokeStyle: chart.data.datasets[i].backgroundColor,
                        fontColor: '#787486',
                    })),
                },
            },
            tooltip: {
                mode: 'index',
                enabled: true,
                intersect: false,
                backgroundColor: 'white',
                title: false,
                titleColor: '#767676',
                bodyColor: '#767676',
                padding: 5,
                boxPadding: 5,
                usePointStyle: true,
                callbacks: {
                    title: () => null,
                    // headers: (tooltipItem: any) => `  ${formatNumber(tooltipItem.raw)} MMBTU`,
                    label: (tooltipItem: any, data: any) => tooltipItem?.dataset?.label,
                    afterLabel: function (tooltipItem: any, data: any) {
                        return `${formatNumber(tooltipItem?.raw)} MMBTU`;
                    },
                    labelColor: function (context: any) {
                        return {
                            borderColor: context?.dataset?.backgroundColor,
                            backgroundColor: context?.dataset?.backgroundColor,
                            borderWidth: 0,
                            borderRadius: 2,
                        }
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
                    display: false,
                    text: 'Date',
                },
                ticks: {
                    autoSkip: false,   // สั่งให้โชว์ Label ทุกอัน ไม่ต้องข้าม
                    maxRotation: 45,   // (ทางเลือก) ถ้ามันเบียด ให้เอียง 45 องศา
                    minRotation: 0,
                    font: {
                        size: 12,      // (ทางเลือก) ปรับขนาดฟอนต์ให้เล็กลงหน่อยถ้าวันเยอะ
                    }
                },
                type: 'category',
                labels: labels,
                grid: {
                    display: false, // Disable vertical grid lines (x-axis)
                },
            },
            y: {
                title: {
                    display: false,
                    text: 'Value',
                },
                beginAtZero: true,
                grid: {
                    display: true, // Enable horizontal grid lines (y-axis)
                    color: 'rgba(243, 244, 246, 0.8)', // Set grid line color with opacity
                },
            },
        },
        animation: {
            onSuccess: () => {
                const chart = ChartJS.getChart('lineChart');
                if (chart) {
                    const { legend }: any = chart;
                    legend.top = -10;
                }
            },
        }
    };

    // เรียงข้อมูลที่น้อยสุดไว้ตำแหน่งแรกของ array กราฟเส้นจะได้ไม่ซ้อนไปอยู่ข้างหลัง
    const sortedDatasets = datasets
        .sort((a: any, b: any) => {
            // Sort datasets by the first data point (smallest to largest)
            const firstValueA = a.data[0]; // Get the first value of dataset A
            const firstValueB = b.data[0]; // Get the first value of dataset B
            return firstValueA - firstValueB; // Compare and sort in ascending order
        });

    // ############### SAVE IMAGE OF CHART ###############
    const chartRef: any = useRef(null); // Create ref for the chart

    const handleSaveImageWithAreaName = () => {
        if (chartRef.current) {
            const chart = chartRef.current; // Get the chart instance
            const canvas = chart.canvas; // Get the chart's canvas
            const chartImage = canvas.toDataURL("image/png"); // Convert chart to image

            // Create a new canvas with extra height for text
            const newCanvas = document.createElement("canvas");
            const ctx = newCanvas.getContext("2d");

            if (!ctx) return;

            // Set new canvas size (same width but extra height for text)
            const paddingTop = 40; // Space for the title
            newCanvas.width = canvas.width;
            newCanvas.height = canvas.height + paddingTop;

            // Fill background (Optional: White background for better visibility)
            ctx.fillStyle = "#ffffff"; // White background
            ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);

            // Set text style
            ctx.font = "20px Arial";
            ctx.fillStyle = "#000"; // Black text
            ctx.textAlign = "left";
            ctx.textBaseline = "top";

            // Draw the area name at the top-left (above the chart)
            ctx.fillText(`Area ${areaName}`, 10, 10);

            // Create an image of the chart with a white background
            const tempCanvas = document.createElement("canvas");
            const tempCtx = tempCanvas.getContext("2d");

            if (tempCtx) {
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;

                // Fill temp canvas with white
                tempCtx.fillStyle = "#ffffff";
                tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

                // Draw the chart on the temp canvas
                tempCtx.drawImage(canvas, 0, 0);
            }

            // Load and draw the chart image below the text
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, paddingTop); // Place chart below text
                // Convert the new canvas to an image and trigger download
                const finalImage = newCanvas.toDataURL("image/png");
                const link = document.createElement("a");
                link.href = finalImage;
                link.download = `chart_${areaName}.png`;
                link.click();
            };
            img.src = chartImage;
        }
    };

    return (
        <div className={`h-auto overflow-y-auto block rounded-t-md relative z-1 p-2`}>
            <aside className="mt-auto ml-1 w-full sm:w-auto pb-2">
                <div className="w-full py-3">
                    <div className="flex gap-2 justify-end items-center">
                        <BtnGeneral textRender={"Export Image"} iconNoRender={false} modeIcon={'export_image_chart'} bgcolor={"#1473A1"} generalFunc={() => handleSaveImageWithAreaName()} can_export={userPermission ? userPermission?.f_export : false} />
                        {/* <BtnGeneral bgcolor={"#24AB6A"} modeIcon={'export'} textRender={"Export"} generalFunc={() => exportToExcel(area_data, "chart_area")} can_export={userPermission ? userPermission?.f_export : false} /> */}
                        <BtnGeneral
                            bgcolor={"#24AB6A"}
                            modeIcon={'export'}
                            textRender={"Export"}
                            generalFunc={() => exportChartToExcel(sortedDatasets, labels, 'main_chart')}
                            can_export={userPermission ? userPermission?.f_export : false}
                        />
                    </div>
                    <div className="grid grid-cols-[80%_20%]">
                        <div className="flex gap-2 relative" style={{ flexWrap: "wrap" }}>

                            <MonthYearPickaSearch
                                key={"start" + key}
                                label={"Start From"}
                                placeHolder="Select Start From"
                                allowClear
                                onChange={(e: any) => {
                                    setIsModeSearch(true)
                                    setSrchStartDateMain(e ? e : null)
                                }}
                            />

                            <MonthYearPickaSearch
                                key={"end" + key}
                                label={"Start To"}
                                placeHolder="Select Start To"
                                allowClear
                                onChange={(e: any) => {
                                    setIsModeSearch(true)
                                    setSrchEndDateMain(e ? e : null)
                                }}
                            />

                            <InputSearch
                                id="searchEntry"
                                label="Entry/Exit"
                                type="select"
                                value={srchEntryMain}
                                onChange={(e) => {
                                    setIsModeSearch(true)
                                    setSrchEntryMain(e.target.value)

                                    // ปรับ Default Filter 3 กรณี เงื่อนไขตามรายละเอียด https://app.clickup.com/t/86evh203j
                                    // 1. กรณีที่เข้ามาครั้งแรก ระบบ Default Area X1 ไว้ตามเดิม
                                    // 2. กรณีที่ Filter แค่ Entry โดยไม่เลือก Area ให้ระบบ default Area : X1 ไว้เลย
                                    // 3. กรณีที่ Filter แค่ Exit โดยไม่เลือก Area ให้ระบบ default Area : A1 ไว้เลย
                                    if (e.target.value == '1') {
                                        const find_x1 = areaMaster?.data?.find((item: any) => item.name == 'X1')
                                        setSrchArea(find_x1?.name)
                                    } else {
                                        const find_a1 = areaMaster?.data?.find((item: any) => item.name == 'A1')
                                        setSrchArea(find_a1?.name)
                                    }
                                }}
                                options={entryExitMaster?.data?.map((item: any) => ({
                                    value: item?.id?.toString(),
                                    label: item.name
                                }))}
                            />

                            <InputSearch
                                id="searchArea"
                                label="Area"
                                type="select"
                                // selectboxMode="multi"
                                value={srchArea}
                                onChange={(e) => {
                                    setIsModeSearch(true)
                                    setSrchArea(e.target.value)
                                }}
                                options={areaMaster?.data?.filter((item: any) =>
                                    srchEntryMain ? item?.entry_exit?.id == srchEntryMain : item !== null)?.map((item: any) => (
                                        {
                                            // value: item?.id?.toString(),
                                            value: item.name,
                                            label: item.name
                                        })
                                    )
                                }
                            />

                            <InputSearch
                                id="searchShipper"
                                label="Shipper Name"
                                // type="select"
                                // selectboxMode="multi"
                                type="select-multi-checkbox"
                                value={srchShipper}
                                onChange={(e) => {
                                    setIsModeSearch(true)
                                    setSrchShipper(e.target.value)
                                }}
                                isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
                                options={shipperGroupData?.data
                                    ?.filter((item: any) =>
                                        userDT?.account_manage?.[0]?.user_type_id == 3
                                            ? item?.id === userDT?.account_manage?.[0]?.group?.id
                                            : true
                                    )
                                    .map((item: any) => ({
                                        value: item.id,
                                        label: item.name,
                                    }))
                                }
                            />

                            <InputSearch
                                id="searchType"
                                label="Contract Type"
                                value={srchTermType}
                                // type="select"
                                // selectboxMode="multi"
                                type="select-multi-checkbox"
                                onChange={(e) => {
                                    setIsModeSearch(true)
                                    setSrchTermType(e.target.value)
                                }}
                                options={termTypeMaster?.data?.map((item: any) => ({
                                    value: item.id,
                                    label: item.name
                                }))}
                            />
                            <BtnSearch handleFieldSearch={handleFieldSearch} />
                            <BtnReset handleReset={handleReset} />
                        </div>
                    </div>
                </div>
            </aside>

            {/* <div className="w-full h-[300px] border rounded-[6px] shadow-sm p-2"> */}
            {/* <div className="w-full h-[320px] p-2">
                <div className="font-semibold text-[18px] text-[#58585A] ">
                    {`Area ${areaName}`}
                </div>

                {
                    isLoading ?
                        <Line
                            id="lineChart"
                            ref={chartRef}
                            // data={{ labels, datasets }}
                            data={{ labels, datasets: sortedDatasets }} // Use sorted data
                            // data={chartData?.datasets}
                            options={{
                                ...options,
                                responsive: true, // Ensure chart is responsive
                                maintainAspectRatio: false, // Disable maintaining aspect ratio
                            }}
                        />
                        :
                        <Spinloading2 spin={!isLoading} rounded={20} />
                }
            </div> */}


            {/* 2026-03-13 กันบอกให้ทำ no skip label แกน x เลยต้องทำให้ chart มันยาว ๆ แล้ว scroll เอา */}
            <div className="w-full h-[320px] p-2">
                <div className="font-semibold text-[18px] text-[#58585A]">
                    {`Area ${areaName}`}
                </div>

                <div className="w-full overflow-x-auto overflow-y-hidden">
                    <div
                        className="h-[260px]"
                        style={{
                            minWidth: `${Math.max((labels?.length || 0) * 20, 800)}px`,
                        }}
                    >
                        {isLoading ? (
                            <Line
                                key={'line-capa-area-main'}
                                id="lineChart"
                                ref={chartRef}
                                data={{ labels, datasets: sortedDatasets }}
                                options={{
                                    ...options,
                                    responsive: true,
                                    maintainAspectRatio: false,
                                }}
                            />
                        ) : (
                            <Spinloading2 spin={!isLoading} rounded={20} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChartArea;