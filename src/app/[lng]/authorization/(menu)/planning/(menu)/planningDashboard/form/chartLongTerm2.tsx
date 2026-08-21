import { useEffect, useMemo, useRef } from "react";
import React, { FC, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, BarElement } from 'chart.js';
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnGeneral from "@/components/other/btnGeneral";
import BtnExport from "@/components/other/btnExport";
import { useAppDispatch } from "@/utils/store/store";
import { fetchShipperGroup } from "@/utils/store/slices/shipperGroupSlice";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import { fetchEntryExit } from "@/utils/store/slices/entryExitSlice";
import annotationPlugin from 'chartjs-plugin-datalabels';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { formatNumber, formatNumberThreeDecimal, getRandomColor } from "@/utils/generalFormatter";

ChartJS.register(BarElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, annotationPlugin, ChartDataLabels);

interface TableProps {
    dataChart?: any;
    userPermission?: any;
    find_area?: any;
}

const ChartLongTerm2: React.FC<TableProps> = ({ dataChart, userPermission, find_area }) => {
    // ############### REDUX DATA ###############
    const { areaMaster } = useFetchMasters();
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
    }, [dispatch, areaMaster, forceRefetch]);

    // ############### CHART DATA ###############
    // const dataCharts = [dataChart]; // Array of dataChart objects
    const labels = dataChart.years;

    // ผลรวมเหนือแท่ง bars
    // const allYears = Array.from(new Set(dataChart.flatMap((item:any) => item.year)));
    const totalValues = dataChart?.years?.map((year: any, index: any) =>
        dataChart?.groups?.reduce((sum: any, item: any) => {

            const yearIndex = index;
            return sum + (yearIndex !== -1 ? item.sumValues[yearIndex] : 0);
        }, 0)
    );

    const datasets = useMemo(() => {
        return (dataChart as { groups: any[] })?.groups?.map((group: any) => {
            // const color_k = getRandomColor();
            return {
                label: group.name,
                data: group.sumValues,
                // backgroundColor: color_k,
                backgroundColor: group?.color,
                maxBarThickness: 100,
                // borderColor: color_k,
                borderColor: group?.color,
                borderWidth: 1,
            };
        }) || [];
    }, [dataChart]);

    const chartData = { labels, datasets };

    const calculateMaxYValue = (data: any) => {
        let max = 0;
        // Iterate over each data point (i.e., bar) to find the sum of values in each stacked bar
        for (let i = 0; i < data.labels.length; i++) {
            let sum = 0;
            data.datasets.forEach((dataset: any) => {
                sum += dataset.data[i] || 0;  // Sum all the dataset values at index i
            });
            if (sum > max) {
                max = sum; // Update the max if this sum is greater than the current max
            }
        }

        // Determine the padding based on the magnitude of the max value
        let padding = 0;
        if (max >= 100000) {
            padding = 50000;  // Add 50,000 if max is in the range of 100,000
        } else if (max >= 10000) {
            padding = 5000;  // Add 5,000 if max is in the range of 10,000 to 99,999
        } else if (max >= 1000) {
            padding = 500;  // Add 500 if max is in the range of 1,000 to 9,999
        }

        return max + padding;
    };

    const maxYValue = calculateMaxYValue(chartData);


    const options: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
                labels: {
                    usePointStyle: true,
                    pointStyle: "circle",
                    font: {
                        size: 12,
                        weight: "bold",
                    },
                    boxWidth: 20,
                    boxHeight: 12,
                    padding: 18,
                },
                // onClick: (e:any) => e.stopPropagation()
                onClick: null
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
                    label: (tooltipItem: any) => {
                        return tooltipItem?.dataset?.label + ': ' + `${formatNumberThreeDecimal(tooltipItem?.raw)}`
                    },
                    // label: function (tooltipItem: any, data: any) {
                    //     return (tooltipItem?.raw === 0 ? null : tooltipItem?.dataset?.label)
                    // },
                    // afterLabel: function (tooltipItem: any, data: any) {
                    //     // return `${formatNumber(tooltipItem?.raw)}`;
                    //     return (tooltipItem?.raw === 0 ? null : formatNumberThreeDecimal(tooltipItem?.raw))
                    // },
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
                display: true,
                align: "end",
                anchor: "end",
                formatter: (value: any, context: any) => {
                    const totalValueForYear = totalValues[context.dataIndex];
                    // Only show labels if total value > 0
                    if (totalValueForYear > 0 && context.datasetIndex === chartData.datasets.length - 1) {
                        // return formatNumberThreeDecimal(totalValueForYear);
                        return formatNumber(totalValueForYear);
                        // return totalValueForYear;
                    }
                    return ""; // Do not display anything for 0 values
                },
                font: {
                    size: 12,
                    weight: "light",
                },
                // color: "#0DA2A2",
                color: "#000000",
                // rotation: (context: any) => {
                //     const chartWidth = context.chart.width;
                //     if (chartWidth > 800) {
                //         return 0;
                //     } else if (chartWidth > 400) {
                //         return -45;
                //     } else {
                //         return -90;
                //     }

                //     // const datasetLength = context.chart.data.datasets[0].data.length;
                //     // return datasetLength > 15 ? 270 : 0; // Rotate if there are more than 10 data points
                // },
                rotation: (context: any) => {
                    const chartWidth = context.chart.width;
                    // if (chartWidth > 800) {
                    if (chartWidth > 1000) {
                        return 0;
                        // } else if (chartWidth > 400) {
                    } else if (chartWidth <= 1000) {
                        return -45;
                    } else if (chartWidth <= 500) {
                        return -90;
                    }
                },
            },
            customLine: {
                maxLineColor: "red", // Color of max value line
            },
        },
        scales: {
            x: {
                stacked: true,
                grid: { display: false },
                categoryPercentage: 0.7,
                barPercentage: 0.9,
            },
            y: {
                stacked: true,
                grid: { display: false },
                min: 0,
                max:
                    find_area?.[0]?.area_nominal_capacity !== 0
                        ? (
                            find_area?.[0]?.area_nominal_capacity < maxYValue
                                ? find_area?.[0]?.area_nominal_capacity + maxYValue
                                : find_area?.[0]?.area_nominal_capacity
                        )
                        : maxYValue,
                ticks: {
                    beginAtZero: true,
                },
            },
        },
        // animation: {
        //     onSuccess: () => {
        //         const chart = ChartJS.getChart('LongtermChart');
        //         if (chart) {
        //             const { legend }: any = chart;
        //             legend.top = -15;
        //         }
        //     },
        // }
    };

    // ############### test line on bar chart ###############

    // const createMaxLinePlugin = () => {

    //     const maxYValue = find_area && find_area?.[0]?.area_nominal_capacity ? find_area?.[0]?.area_nominal_capacity : 0
    //     const label = `Area Nominal Capacity: ${maxYValue.toLocaleString()}`

    //     return {
    //         id: "maxLine",
    //         afterDatasetsDraw(chart: any) {
    //             if (maxYValue == null) return;

    //             const { ctx, scales, chartArea } = chart;
    //             const { left, right, top, bottom } = chartArea;
    //             const yScale = scales.y;
    //             const xScale = scales.x;
    //             if (!yScale || !xScale) return;

    //             const yPixel = yScale.getPixelForValue(maxYValue);

    //             // ถ้าเส้นอยู่นอกพื้นที่ plot ไม่ต้องวาด
    //             if (yPixel < top || yPixel > bottom) return;

    //             ctx.save();

    //             // เส้นแนวนอน
    //             ctx.beginPath();
    //             ctx.moveTo(left, yPixel);
    //             ctx.lineTo(right, yPixel);
    //             ctx.strokeStyle = "red";
    //             ctx.lineWidth = 2;
    //             ctx.stroke();

    //             // ===== label =====
    //             const text = label ?? `Max: ${formatNumber(maxYValue)}`;
    //             ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
    //             ctx.textBaseline = "middle";

    //             const padX = 6;
    //             const padY = 3;
    //             const textWidth = ctx.measureText(text).width;
    //             const boxWidth = textWidth + padX * 2;
    //             const boxHeight = 18;

    //             // วางป้าย "กึ่งกลางแนวนอน" ของ chartArea
    //             const plotWidth = right - left;
    //             let boxX = left + (plotWidth - boxWidth) / 2;

    //             // วางป้าย "เหนือเส้น" 6px (กันทับเส้น)
    //             let boxY = yPixel - boxHeight - 6;


    //             // กันชนบน/ล่าง
    //             if (boxY < top + 2) boxY = top + 2;
    //             if (boxY + boxHeight > bottom - 2) boxY = bottom - 2 - boxHeight;

    //             // กล่องทึบพื้นหลังให้ตัดกับกราฟ
    //             ctx.fillStyle = "rgba(0,0,0,0.65)";
    //             ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

    //             // ข้อความสีขาว
    //             ctx.fillStyle = "#FFFFFF";
    //             ctx.fillText(text, boxX + padX, boxY + boxHeight / 2);

    //             ctx.restore();
    //         },
    //     };
    // }

    // const maxLinePlugin = createMaxLinePlugin();

    const areaNominalCapacity = find_area?.[0]?.area_nominal_capacity ?? 0;
    const areaName = find_area?.[0]?.name;
    const maxYValueShow = find_area?.[0]?.area_nominal_capacity ?? 0;

    const maxLinePlugin = useMemo(() => {
        const maxYValue = find_area?.[0]?.area_nominal_capacity ?? 0;
        // const label = `Area Nominal Capacity: ${maxYValue.toLocaleString()}`;

        return {
            id: "maxLine",
            afterDatasetsDraw(chart: any) {
                if (maxYValue == null) return;

                const { ctx, scales, chartArea } = chart;
                const { left, right, top, bottom } = chartArea;
                const yScale = scales.y;
                const xScale = scales.x;
                if (!yScale || !xScale) return;

                const yPixel = yScale.getPixelForValue(maxYValue);
                if (yPixel < top || yPixel > bottom) return;

                ctx.save();

                ctx.beginPath();
                ctx.moveTo(left, yPixel);
                ctx.lineTo(right, yPixel);
                ctx.strokeStyle = "red";
                ctx.lineWidth = 2;
                ctx.stroke();


                //ปิดเพราะบัง graph https://app.clickup.com/t/86ewwaxtk

                // const text = label ?? `Max: ${formatNumber(maxYValue)}`;
                // ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
                // ctx.textBaseline = "middle";

                // const padX = 6;
                // const textWidth = ctx.measureText(text).width;
                // const boxWidth = textWidth + padX * 2;
                // const boxHeight = 18;

                // const plotWidth = right - left;
                // const boxX = left + (plotWidth - boxWidth) / 2;

                // let boxY = yPixel - boxHeight - 6;
                // if (boxY < top + 2) boxY = top + 2;
                // if (boxY + boxHeight > bottom - 2) boxY = bottom - 2 - boxHeight;

                // ctx.fillStyle = "rgba(0,0,0,0.65)";
                // ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

                // ctx.fillStyle = "#FFFFFF";
                // ctx.fillText(text, boxX + padX, boxY + boxHeight / 2);

                // ctx.restore();
            },
        };
    }, [areaNominalCapacity, areaName]);

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
        <div className={`h-auto min-h-[300px] overflow-y-auto block border rounded-[10px] shadow-sm relative z-1 p-4`}>
            <aside className="mt-auto ml-1 w-full sm:w-auto pb-2">
                <div className="flex justify-between w-full">
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

            <div className="flex justify-between items-center">
                <span className="text-[16px] text-[#58585A] font-semibold ">
                    {/* {dataChart?.area.name} Total Supply (MMBTU) */}
                    {/* v1.0.90 เปลี่ยนหัว Graph จาก "Total Supply (MMBTU)" เป็น "Total Energy (MMBTU/D)" https://app.clickup.com/t/86ert2k26 */}
                    {dataChart?.area.name}{` Total Energy (MMBTU/D)`}
                </span>
                <div className="text-gray-600 px-2 text-[12px] h-5 rounded-sm flex gap-2 items-center">
                    <div className="h-0.5 w-4 bg-red-500"/>
                    {`Area Nominal Capacity: ${maxYValueShow.toLocaleString()}`}
                </div>
            </div>

            <div className="w-full overflow-x-auto overflow-y-hidden">
                <div
                    className="w-full h-[350px] p-2"
                    style={{
                        minWidth: chartData.labels.length > 10 ? `${chartData.labels.length * 75}px` : "100%",
                    }}
                >
                    <Bar
                        key={`${areaName}-${areaNominalCapacity}`}
                        id="LongtermChart"
                        data={chartData}
                        options={options}
                        plugins={[maxLinePlugin]}
                    />
                </div>
            </div>

        </div>
    )
}

export default ChartLongTerm2;