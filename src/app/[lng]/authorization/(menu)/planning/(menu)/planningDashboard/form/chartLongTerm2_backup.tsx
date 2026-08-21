import { useEffect, useMemo, useRef } from "react";
import React, { FC, useState } from 'react';
import { format } from 'date-fns';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, BarElement } from 'chart.js';
import { formatNumber, hexToRgba } from "@/utils/generalFormatter";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import { InputSearch } from "@/components/other/SearchForm";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import BtnGeneral from "@/components/other/btnGeneral";
import BtnExport from "@/components/other/btnExport";
import { useAppDispatch } from "@/utils/store/store";
import { fetchShipperGroup } from "@/utils/store/slices/shipperGroupSlice";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import { fetchEntryExit } from "@/utils/store/slices/entryExitSlice";
import annotationPlugin from 'chartjs-plugin-datalabels';
import ChartDataLabels from 'chartjs-plugin-datalabels';


ChartJS.register(BarElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, annotationPlugin, ChartDataLabels);

interface TableProps {
    dataChart?: any;
    userPermission?: any;
}

const ChartLongTerm2: React.FC<TableProps> = ({ dataChart, userPermission }) => {

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

    // ############### Doughnut SEARCH ###############
    const [key, setKey] = useState(0);
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);
    const [srchShipper, setSrchShipper] = useState('');


    // ############### CHART DATA ###############
    const dataCharts = [dataChart]; // Array of dataChart objects
    
    // Extract years
    const allYears = Array.from(new Set(dataCharts.flatMap((item:any) => item.year)));

    // ผลรวมเหนือแท่ง bars
    const totalValues = allYears.map((year) =>
        dataCharts.reduce((sum: any, item: any) => {
            const yearIndex = item.year.indexOf(year);
            return sum + (yearIndex !== -1 ? item.value[yearIndex] : 0);
        }, 0)
    );

    // Create datasets
    const datasets = dataCharts.map((item: any) => ({
        // label: item.nomination_point,
        label: item.area?.name,
        data: allYears.map((year) => {
            const yearIndex = item.year.indexOf(year);
            return yearIndex !== -1 ? item.value[yearIndex] : 0;
        }),
        backgroundColor: item.area.color,
        maxBarThickness: 100, // Make bars wider
    }));


    // const allYears = useMemo(() => {
    //     return dataChart && Array.isArray(dataChart)
    //         ? Array.from(new Set(dataCharts.flatMap((item: any) => item.year)))
    //         : [];
    // }, [dataChart]);

    // const totalValues = useMemo(() => {
    //     return allYears.map((year) =>
    //         dataCharts.reduce((sum: any, item: any) => {
    //             const yearIndex = item.year.indexOf(year);
    //             return sum + (yearIndex !== -1 ? item.value[yearIndex] : 0);
    //         }, 0)
    //     );
    // }, [dataChart, allYears]);

    // const datasets = useMemo(() => {
    //     return Array.isArray(dataChart)
    //         ? dataCharts.map((item: any) => ({
    //             // label: item.nomination_point,
    //             label: item.area?.name,
    //             data: allYears.map((year) => {
    //                 const yearIndex = item.year.indexOf(year);
    //                 return yearIndex !== -1 ? item.value[yearIndex] : 0;
    //             }),
    //             backgroundColor: item.area.color,
    //             maxBarThickness: 100, // Make bars wider
    //         }))
    //         : [];
    // }, [dataChart, allYears]);

    // Chart data
    const chartData = {
        labels: allYears,
        datasets: datasets,
    };

    // Chart options
    const options: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: {
                        size: 12,
                        weight: "bold",
                    },
                    boxWidth: 20,
                    boxHeight: 12,
                    padding: 18,
                },
            },
            tooltip: {
                mode: "index",
                intersect: false,
            },
            datalabels: {
                display: true,
                align: "end",
                anchor: "end",
                formatter: (value: any, context: any) => {
                    const totalValueForYear = totalValues[context.dataIndex];
                    // Only show labels if total value > 0
                    if (totalValueForYear > 0 && context.datasetIndex === chartData.datasets.length - 1) {
                        return totalValueForYear;
                    }
                    return ""; // Do not display anything for 0 values
                },
                font: {
                    size: 12,
                    weight: "light",
                },
                color: "#0DA2A2",
            },
        },
        scales: {
            x: {
                stacked: true,
                title: {
                    display: false,
                    text: "Years",
                },
                grid: {
                    display: false,
                },
                categoryPercentage: 0.7, // Adjust bar width
                barPercentage: 0.9,
            },
            y: {
                stacked: true,
                grid: {
                    display: false,
                },
                title: {
                    display: false,
                    text: "Values (MMBtud)",
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

    const ChartComponent = useMemo(() => {
        return dataChart && datasets ? <Bar data={chartData} options={options} /> : null;
    }, [dataChart, datasets, chartData, options]);


    return (
        <div className={`h-auto min-h-[300px] overflow-y-auto block rounded-t-md relative z-1 p-2`}>

            <aside className="mt-auto ml-1 w-full sm:w-auto pb-2">
                <div className="flex justify-between w-full">
                    {/* Align text to the left */}
                    {/* <div>
                        <h2 className="text-[16px] font-bold text-[#58585A] ">{`Long term`}</h2>
                    </div> */}

                    {/* Align buttons to the right */}
                    <div className="flex gap-2 justify-end">
                        <BtnGeneral
                            textRender={"Export Image"}
                            iconNoRender={false}
                            modeIcon={'export_image_chart'}
                            bgcolor={"#1473A1"}
                            generalFunc={() => handleSaveImage()}
                        />
                        <BtnExport textRender={"Export"} />
                    </div>
                </div>
            </aside>

            <aside className="flex flex-wrap sm:flex-row gap-2 pb-2 w-full">
                {/* <DatePickaSearch
                    key={"start" + key}
                    label="Start Year"
                    placeHolder="Select Start Year"
                    allowClear
                    onChange={(e: any) => setSrchStartDate(e ? e : null)}
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

                <BtnSearch handleFieldSearch={handleFieldSearch} />
                <BtnReset handleReset={handleReset} /> */}
            </aside>

            <div className="w-full h-[350px]  p-2">
                {/* <Line ref={chartRef} data={{ labels, datasets }} options={options} /> */}
                <Bar data={chartData} options={options} />

                {/* {ChartComponent} */}
            </div>
        </div>
    )
}

export default ChartLongTerm2;