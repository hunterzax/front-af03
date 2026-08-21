import { useEffect, useRef } from "react";
import React, { FC, useState } from 'react';
import { format } from 'date-fns';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { formatNumber, hexToRgba } from "@/utils/generalFormatter";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import { InputSearch } from "@/components/other/SearchForm";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import BtnGeneral from "@/components/other/btnGeneral";
import BtnExport from "@/components/other/btnExport";
import { fetchShipperGroup } from "@/utils/store/slices/shipperGroupSlice";
import { useAppDispatch } from "@/utils/store/store";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import { fetchEntryExit } from "@/utils/store/slices/entryExitSlice";
import getUserValue from "@/utils/getuserValue";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface TableProps {

}

const ChartArea: React.FC<any> = ({ }) => {
    const userDT: any = getUserValue();

    let isLoading = true
    // ############### REDUX DATA ###############
    const { shipperGroupData, areaMaster, entryExitMaster, termTypeMaster } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
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

    useEffect(() => {
        // ถ้า user เป็น shipper
      // https://app.clickup.com/t/86ert2k28 ตามที่คุยกัน หากเป็น shipper user ถ้ามี filter ชื่อ shipper ให้ค้างชื่อ shipper ตัวเองไว้เลย ไม่ต้องขึ้นเป็น dropdown ให้เลือก - ปรับทั้ง system
      if(userDT?.account_manage?.[0]?.user_type_id == 3){
         
        setSrchShipper(userDT?.account_manage?.[0]?.group?.id)
      }
    }, [])

    // ############### Doughnut SEARCH ###############
    const [key, setKey] = useState(0);
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);
    const [srchShipper, setSrchShipper] = useState('');
    const [srchEntry, setSrchEntry] = useState('');
    const [srchArea, setSrchArea] = useState('');
    const [srchType, setSrchType] = useState('');

    const handleFieldSearch = () => {
        // const result = dataTable.filter((item: any) => {
        //     return (
        //         // (srchType ? item?.term_type?.id == srchType : true) &&
        //         (srchGroupName ? item?.version?.toLowerCase().includes(srchGroupName.toLowerCase()) : true) &&
        //         (srchStartDate ? formatSearchDate(item?.start_date) === formatSearchDate(srchStartDate) : true) &&
        //         (srchEndDate ? formatSearchDate(item?.end_date) === formatSearchDate(srchEndDate) : true)
        //     );
        // });
        // setFilteredDataTable(result);
    };

    const handleReset = () => {
        setSrchStartDate(null);
        setSrchEndDate(null);
        setSrchShipper('');
        // setFilteredDataTable(dataTable);
        setKey((prevKey) => prevKey + 1);
    };

    // ############### CHART DATA ###############
    // create line chart using chartjs with this data
    // axis X using area_data.value.date format MMM YYYY
    // axis Y using area_data.value.value
    let area_data = [
        {
            "id": 23,
            "name": "B2",
            "active": true,
            "start_date": "2024-10-01T00:00:00.000Z",
            "end_date": "2030-10-31T00:00:00.000Z",
            "description": "B2",
            "color": "#715FE6",
            "value": [
                {
                    "date": "2024-01-01T00:00:00.000Z",
                    "value": 200000
                },
                {
                    "date": "2024-02-01T00:00:00.000Z",
                    "value": 1000000
                },
                {
                    "date": "2024-03-01T00:00:00.000Z",
                    "value": 923451
                },
                {
                    "date": "2024-04-01T00:00:00.000Z",
                    "value": 589321
                },
                {
                    "date": "2024-05-01T00:00:00.000Z",
                    "value": 0
                },
                {
                    "date": "2024-06-01T00:00:00.000Z",
                    "value": 0
                },
                {
                    "date": "2024-07-01T00:00:00.000Z",
                    "value": 0
                },
                {
                    "date": "2024-08-01T00:00:00.000Z",
                    "value": 776322
                },
                {
                    "date": "2024-09-01T00:00:00.000Z",
                    "value": 876322
                }
            ]
        },
        {
            "id": 22,
            "name": "B1",
            "active": true,
            "start_date": "2024-10-01T00:00:00.000Z",
            "end_date": "2030-10-31T00:00:00.000Z",
            "description": "B1",
            "color": "#FFEEEA",
            "value": [
                {
                    "date": "2024-04-01T00:00:00.000Z",
                    "value": 64215
                },
                {
                    "date": "2024-05-01T00:00:00.000Z",
                    "value": 623490
                },
                {
                    "date": "2024-06-01T00:00:00.000Z",
                    "value": 123456
                }
            ]
        },
        {
            "id": 23,
            "name": "B3",
            "active": true,
            "start_date": "2024-10-01T00:00:00.000Z",
            "end_date": "2030-10-31T00:00:00.000Z",
            "description": "B1",
            "color": "#ff0000",
            "value": [
                {
                    "date": "2024-04-01T00:00:00.000Z",
                    "value": 450000
                },
            ]
        },
    ]

    // Step 1: Aggregate all unique dates across all datasets
    const allDates = Array.from(
        new Set(
            area_data.flatMap(area => area.value.map(item => item.date))
        )
    ).sort((a: string, b: string) => new Date(a).getTime() - new Date(b).getTime()); // Sort dates

    // Step 2: Format all dates as "MMM yyyy"
    const labels = allDates.map(date => format(new Date(date), 'MMM yyyy'));

    // Step 3: Align data for each dataset with the unified dates
    const datasets = area_data.map((area, index) => {
        const data = labels.map(label => {
            // Find the value for the current label
            const found = area.value.find(item => format(new Date(item.date), 'MMM yyyy') === label);
            return found ? found.value : null; // If no value, return null
        });

        return {
            label: area.name,
            data: data,
            borderColor: area.color,
            // backgroundColor: area.color,
            backgroundColor: hexToRgba(area.color, 0.2), // Fill color with opacity 0.5
            // fill: {
            //     target: 'origin',
            //     below: hexToRgba(area.color, 0.5) // And blue below the origin
            // },
            fill: true,
            tension: 0.1,
            pointRadius: 2, // Small points on the line
            borderWidth: 4, // Line width
        };
    });

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
                    },
                    boxWidth: 20, // Set the width of the point style
                    boxHeight: 12, // Set the height of the point style
                    padding: 18, // Adjust padding between labels
                },
            },
            tooltip: {
                // mode: 'index',
                mode: 'nearest',
                intersect: false,
                callbacks: {
                    label: (tooltipItem: any) => `  ${formatNumber(tooltipItem.raw)} MMBTU`,
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
    };

    // ############### SAVE IMAGE OF CHART ###############
    const chartRef: any = useRef(null); // Create ref for the chart

    const handleSaveImage = () => {
        if (chartRef.current) {
            // Get the canvas element from the chart reference
            const imageURI = chartRef.current.toBase64Image();  // Directly call on chartRef.current
            // Create a temporary <a> element to trigger download
            const link = document.createElement('a');
            link.href = imageURI;
            link.download = 'chart.png'; // Set the default file name
            link.click(); // Trigger the download
        }
    };

    return (
        <div className={`h-auto overflow-y-auto block rounded-t-md relative z-1 p-2`}>

            <aside className="mt-auto ml-1 w-full sm:w-auto pb-2">
                <div className="flex flex-wrap gap-2 justify-end">
                    <BtnGeneral textRender={"Export Image"} iconNoRender={false} modeIcon={'export_image_chart'} bgcolor={"#1473A1"} generalFunc={() => handleSaveImage()} />
                    <BtnExport textRender={"Export"} />
                </div>
            </aside>

            <aside className="flex flex-wrap sm:flex-row gap-2 pb-2 w-full">
                <DatePickaSearch
                    key={"start" + key}
                    label="Start From"
                    placeHolder="Select Start From"
                    allowClear
                    onChange={(e: any) => setSrchStartDate(e ? e : null)}
                />

                <DatePickaSearch
                    key={"end" + key}
                    label="Start To"
                    placeHolder="Select Start To"
                    allowClear
                    onChange={(e: any) => setSrchEndDate(e ? e : null)}
                />

                <InputSearch
                    id="searchEntry"
                    label="Entry/Exit"
                    type="select"
                    value={srchEntry}
                    onChange={(e) => setSrchEntry(e.target.value)}
                    options={entryExitMaster?.data?.map((item: any) => ({
                        value: item?.id?.toString(),
                        label: item.name
                    }))}
                />

                <InputSearch
                    id="searchArea"
                    label="Area"
                    type="select"
                    value={srchArea}
                    onChange={(e) => setSrchArea(e.target.value)}
                    options={areaMaster?.data?.map((item: any) => ({
                        value: item?.id?.toString(),
                        label: item.name
                    }))}
                />

                <InputSearch
                    id="searchShipper"
                    label="Shipper Name"
                    type="select"
                    value={srchShipper}
                    onChange={(e) => setSrchShipper(e.target.value)}
                    isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
                    options={shipperGroupData?.data?.map((item: any) => ({
                        value: item.id,
                        label: item.name
                    }))}
                />

                <InputSearch
                    id="searchType"
                    label="Contract Type"
                    type="select"
                    value={srchType}
                    onChange={(e) => setSrchType(e.target.value)}
                    options={termTypeMaster?.data?.map((item: any) => ({
                        value: item?.id?.toString(),
                        label: item.name
                    }))}
                />

                <BtnSearch handleFieldSearch={handleFieldSearch} />
                <BtnReset handleReset={handleReset} />
            </aside>

            <div className="w-full h-[300px] border rounded-[6px] shadow-sm p-2">
                {/* <Line ref={chartRef} data={{ labels, datasets }} options={options} /> */}
                <Line
                    ref={chartRef}
                    data={{ labels, datasets }}
                    options={{
                        ...options,
                        responsive: true, // Ensure chart is responsive
                        maintainAspectRatio: false, // Disable maintaining aspect ratio
                    }}
                />
            </div>
        </div>
    )
}

export default ChartArea;