import React, { useEffect, useMemo, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import DatePickaSearch from '@/components/library/dateRang/dateSearch';
import { InputSearch } from '@/components/other/SearchForm';
import BtnSearch from '@/components/other/btnSearch';
import BtnReset from '@/components/other/btnReset';
import { useFetchMasters } from '@/hook/fetchMaster';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    Title,
} from 'chart.js';
import { useAppDispatch } from '@/utils/store/store';
import { fetchShipperGroup } from '@/utils/store/slices/shipperGroupSlice';
import { filterByShipper, filterByShipperArr, filterCapChart, transformDataDonut } from '@/utils/generalFormatter';
import { getService } from '@/utils/postService';
import getUserValue from '@/utils/getuserValue';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const ChartWithCustomLegend: React.FC<any> = ({ contractId, setcontractId, dataDonut, setDataDonut, setSrchStartDateTable, setSrchEndDateTable, setSrchShipperTable, setIsClickSearch }) => {
    const userDT: any = getUserValue();

    // const [dataDonut, setDataDonut] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [filteredDataDonut, setFilteredDataDonut] = useState<any>([]);

    const fetchData = async () => {
        try {
            // ถ้า user เป็น shipper
            // https://app.clickup.com/t/86ert2k28 ตามที่คุยกัน หากเป็น shipper user ถ้ามี filter ชื่อ shipper ให้ค้างชื่อ shipper ตัวเองไว้เลย ไม่ต้องขึ้นเป็น dropdown ให้เลือก - ปรับทั้ง system
            if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                setSrchShipper(userDT?.account_manage?.[0]?.group?.id)
            }
            //
            const idsArray = shipperGroupData?.data?.map((item: any) => item.id);
            let filter_string = `${userDT?.account_manage?.[0]?.user_type_id == 1 || userDT?.account_manage?.[0]?.user_type_id == 2 ? idsArray : userDT?.account_manage?.[0]?.group_id}` // ถ้าเป็น TSO เอา id shipper ทั้งหมดมาแสดง ถ้าเป็น shipper เอาแค่ของตัวเอง
            const response_donut: any = await getService(`/master/capacity-dashboard/status-process?id=[${filter_string}]`);
            let filteredMainData: any

            // ถ้าเป็น shipper เอาแต่ของตัวเอง
            if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                filteredMainData = response_donut?.map((item: any) => {
                    const filteredContracts = item?.contract_code?.filter(
                        // (contract) => contract.group_id === userDT?.account_manage?.[0]?.group_id
                        (contract: any) => contract?.group_id === userDT?.account_manage?.[0]?.group_id && contract?.status_capacity_request_management_id !== 3 //https://app.clickup.com/t/86euzxxt5 เอาสถานะ reject ออก
                    );
                    return {
                        ...item,
                        contract_code: filteredContracts.length > 0 ? filteredContracts : [],
                    };
                });
            }

            //https://app.clickup.com/t/86euzxxt5 เอาสถานะ reject ออก
            const filterReject: any = response_donut?.map((item: any) => {
                return { ...item, contract_code: item?.contract_code?.filter((items: any) => items?.status_capacity_request_management_id !== 3) }
            });
            filteredMainData = filterReject

            setDataDonut(filteredMainData);
            setcontractId(filteredMainData?.flatMap((fm:any) => fm?.contract_code?.map((c:any) => c?.id)) || [])
            setFilteredDataDonut(filteredMainData);
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
        fetchData();
    }, []);

    // ############### REDUX DATA ###############
    const { shipperGroupData } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();
    useEffect(() => {
        if (forceRefetch) {
            dispatch(fetchShipperGroup());
        }
        if (forceRefetch) {
            setForceRefetch(false);
        }
    }, [dispatch, shipperGroupData, forceRefetch]);

    // ############### Doughnut SEARCH ###############
    const [key, setKey] = useState(0);
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);
    const [srchShipper, setSrchShipper] = useState<any>([]);

    const handleFieldSearch = () => {
        setSrchStartDateTable(srchStartDate)
        setSrchEndDateTable(srchEndDate)
        setSrchShipperTable(srchShipper)
        const filteredData = filterCapChart(dataDonut, srchStartDate, srchEndDate);
        console.log('filteredData : ', filteredData);
        setcontractId(filteredData?.flatMap((fm:any) => fm?.contract_code?.map((c:any) => c?.id)) || [])
        setFilteredDataDonut(filteredData);

        // if (srchShipper !== '') { // เดิมโรงงาน
        if (srchShipper?.length > 0) {
            // const filteredShipper = filterByShipper(filteredData, srchShipper); // เดิมโรงงาน
            const filteredShipper = filterByShipperArr(filteredData, srchShipper);
            setcontractId(filteredShipper?.flatMap((fm:any) => fm?.contract_code?.map((c:any) => c?.id)) || [])
            setFilteredDataDonut(filteredShipper);
        }
        setIsClickSearch(true) // ใช้กับ table ข้าง ๆ donut
    };

    const handleReset = () => {
        setSrchStartDate(null);
        setSrchEndDate(null);
        setSrchShipper([]);
        setIsClickSearch(false) // ใช้กับ table ข้าง ๆ donut
        setcontractId(dataDonut?.flatMap((fm:any) => fm?.contract_code?.map((c:any) => c?.id)) || [])
        setFilteredDataDonut(dataDonut);
        setVisibility([true, true, true, true]) // R3 : V.2.0.109 ตรงกราฟช่องซ้าย กดแล้วทำให้ข้อมูลเพี้ยน https://app.clickup.com/t/86euzxxtc

        setKey((prevKey) => prevKey + 1);
    };

    // ############### Doughnut DATA ###############
    // const dynamicData = shipperGroupData?.data?.map(item => item.contractStatusCount);
    // const data = {
    //     labels: ['Active', 'Waiting For Start Date', 'Waiting For Approval', 'End'],
    //     datasets: [
    //         {
    //             label: 'Shipper Contract',
    //             data: dynamicData || [0, 0, 0, 0],
    //             backgroundColor: ['#3cb371', '#6495ed', '#ffd700', '#ff6347'],
    //             borderWidth: 1,
    //         },
    //     ],
    // };

    // original
    // const data = {
    //     labels: ['Active', 'Waiting For Start Date', 'Waiting For Approval', 'End'],
    //     datasets: [
    //         {
    //             label: 'Shipper Contract',
    //             data: [40, 10, 50, 40], // Example data
    //             backgroundColor: ['#C2F5CA', '#D0E5FD', '#EEDEFF', '#FDD0D0'],
    //             borderWidth: 1,
    //         },
    //     ],
    // };

    // transform data_from_bank into data by using
    // 1. labels of data are from data_from_bank.name
    // 2. datasets.data of data are from data_from_bank.contract_code.length
    // 3. datasets.backgroundColor of data are from data_from_bank.color
    // and if possible to cal percentage of contract_code in each data_from_bank by sum all of contract_code and find %, is that possible?

    // Example usage
    const { transformedData, percentages }: any = transformDataDonut(filteredDataDonut);
    const totalContracts = filteredDataDonut?.reduce((total: any, item: any) => total + item?.contract_code.length, 0);

    // const options: ChartOptions<'doughnut'> = {
    const options: any = {
        responsive: true,

        maintainAspectRatio: true, // บังคับอัตราส่วน
        aspectRatio: 1,            // 1:1 = สี่เหลี่ยม

        plugins: {
            legend: {
                display: false,
                position: 'right', // Place the legend on the right
                labels: {
                    usePointStyle: true, // Use dots for legend labels
                },
            },
            title: {
                display: false,
                text: 'Shipper Contract', // Title above the legend
                position: 'top',
                font: {
                    size: 14,
                    weight: 'bold',
                },
                padding: {
                    top: 40,
                    bottom: -300,
                },
            },
            tooltip: {
                mode: 'point',
                enabled: true,
                intersect: false,
                position: 'nearest',
                backgroundColor: 'white',
                titleColor: '#767676',
                bodyColor: '#767676',
                padding: 5,
                boxPadding: 5,
                usePointStyle: true,
                // callbacks: {
                //     title: () => "",
                //     label: (context: any) => `${context.raw}%`,
                // },
                callbacks: {
                    title: () => "",
                    label: (context: any) => {
                        const label = context.label || "";
                        const value = context.raw; // Access the value directly from the dataset
                        const percentage = totalContracts
                            ? ((value / totalContracts) * 100).toFixed(2)
                            : 0;
                        // return `${label}: ${value} (${percentage}%)`;
                        return `${percentage}%`;
                    },
                },
            },
            datalabels: {
                display: false,
            },
        },
        animation: {
            onProgress: () => {
                const chart = ChartJS.getChart('doughnutChart');
                if (chart) {
                    drawPointerLines(chart);
                }
            },
        },
        layout: {
            // padding: 40
            padding: 30,
        },
        cutout: '50%',
    };

    // Version 1
    // const drawPointerLines = (chart: ChartJS) => {
    //     const { ctx, chartArea, data, _metasets, tooltip }: any = chart;
    //     // const dataset = data.datasets[0];
    //     const dataset = transformedData?.datasets[0];
    //     const { outerRadius } = _metasets[0]?.data[0];

    //     ctx.save();

    //     dataset.data.forEach((value: number, index: number) => {
    //         const arc = _metasets[0].data[index];

    //         if (!arc) { // เผื่อมัน undefined
    //             return
    //         }
    //         const { startAngle, endAngle } = arc;
    //         const midAngle = (startAngle + endAngle) / 2;

    //         // Chart center
    //         // const xCenter = (chartArea.width / 2) + 40;
    //         // const yCenter = (chartArea.height / 2) + 40;

    //         // new Chart center
    //         const xCenter = _metasets[0].data[0].x;
    //         const yCenter = _metasets[0].data[0].y;

    //         // Line start (just outside the outer radius)
    //         const xStart = xCenter + outerRadius * Math.cos(midAngle);
    //         const yStart = yCenter + outerRadius * Math.sin(midAngle);

    //         const isLeftSide = midAngle > Math.PI / 2 && midAngle < (3 * Math.PI) / 2;
    //         // Line end (further outside for the label)
    //         // const xEnd = xStart + 10 * Math.cos(midAngle); // original + 30

    //         // ORIGINAL
    //         // const xEnd = isLeftSide
    //         //     ? xStart - 40 // Move line back into the chart
    //         //     : xStart + 10; // Regular right-side positioning

    //         // const yEnd = yStart + 20 * Math.sin(midAngle); // original + 30


    //         // TEST
    //         const xEnd = isLeftSide
    //             ? Math.max(xStart - 40, chartArea.left + 20) // Prevent going too left
    //             : Math.min(xStart + 10, chartArea.right - 20); // Prevent going too right

    //         const yEnd = Math.min(yStart + 20 * Math.sin(midAngle), chartArea.bottom - 10); // Prevent labels from going below the chart

    //         // Draw the line
    //         ctx.beginPath();
    //         ctx.moveTo(xStart, yStart);
    //         ctx.lineTo(xEnd, yEnd);
    //         // ctx.lineTo(xEnd + (midAngle > Math.PI ? -8 : 8), yEnd);
    //         // ctx.lineTo(xEnd + (midAngle > Math.PI ? -8 : 10), yEnd);
    //         ctx.lineTo(xEnd + (midAngle > Math.PI ? -10 : 10), yEnd);
    //         ctx.strokeStyle = '#B6B6B6'; // Line color
    //         ctx.lineWidth = 1; // Line width
    //         ctx.stroke();

    //         // Draw the value label
    //         ctx.font = '14px Tahoma';
    //         ctx.fillStyle = '#808080'; // Label color
    //         // ctx.textAlign = midAngle > Math.PI ? 'right' : 'left'; // Adjust alignment
    //         // ctx.textBaseline = 'middle';
    //         // ctx.fillText(`${value}%`, xEnd + (midAngle > Math.PI ? -10 : 10), yEnd);

    //         // ORIGINAL
    //         ctx.textAlign = midAngle > Math.PI ? 'right' : 'middle'; // Adjust alignment
    //         ctx.textBaseline = 'left';
    //         ctx.fillText(`${value}`, xEnd + (midAngle > Math.PI ? -10 : 10), yEnd);

    //         // TEST
    //         // ctx.textAlign = isLeftSide ? "right" : "left";
    //         // ctx.textBaseline = "middle";
    //         // ctx.fillText(`${value}`, xEnd, yEnd);

    //     });

    //     ctx.restore();
    // };




    // Version 2
    // const drawPointerLines = (chart: ChartJS) => {
    //     const { ctx, chartArea, _metasets }: any = chart;
    //     // const dataset = transformedData?.datasets[0];
    //     const dataset = filteredData?.datasets[0];
    //     const { outerRadius } = _metasets[0]?.data[0];

    //     ctx.save();

    //     dataset.data.forEach((value: number, index: number) => {
    //         const arc = _metasets[0].data[index];
    //         if (!arc) return;

    //         const { startAngle, endAngle } = arc;
    //         const midAngle = (startAngle + endAngle) / 2;

    //         const xCenter = _metasets[0].data[0].x;
    //         const yCenter = _metasets[0].data[0].y;

    //         // จุดเริ่ม: ขอบวงกลม
    //         const xStart = xCenter + outerRadius * Math.cos(midAngle);
    //         const yStart = yCenter + outerRadius * Math.sin(midAngle);

    //         // จุดปลาย: ขยับออกไปจากขอบ 30px เสมอ
    //         const offset = 15;
    //         const xEnd = xCenter + (outerRadius + offset) * Math.cos(midAngle);
    //         const yEnd = yCenter + (outerRadius + offset) * Math.sin(midAngle);

    //         // วาดเส้น
    //         ctx.beginPath();
    //         ctx.moveTo(xStart, yStart);
    //         ctx.lineTo(xEnd, yEnd);
    //         ctx.strokeStyle = '#B6B6B6';
    //         ctx.lineWidth = 1;
    //         ctx.stroke();

    //         // วาด label
    //         ctx.font = '14px Tahoma';
    //         ctx.fillStyle = '#808080';
    //         ctx.textAlign = Math.cos(midAngle) < 0 ? 'right' : 'left'; // ซ้ายขวา
    //         ctx.textBaseline = 'middle';
    //         ctx.fillText(`${value}`, xEnd + (Math.cos(midAngle) < 0 ? -5 : 5), yEnd);
    //     });

    //     ctx.restore();
    // };

    const drawPointerLines = (chart: ChartJS) => {
        const ctx = chart.ctx as CanvasRenderingContext2D;
        const meta = chart.getDatasetMeta(0);
        const arcs = meta?.data ?? [];
        const ds0 = filteredData?.datasets?.[0];
        const values: number[] = (ds0?.data as number[]) ?? [];

        if (!arcs.length || !values.length) return;

        // center/radius จาก arc แรก (ทุก arc ใช้ center เดียวกัน)
        const firstArc: any = arcs[0];
        const xCenter = firstArc?.x ?? chart.chartArea.left + (chart.chartArea.width / 2);
        const yCenter = firstArc?.y ?? chart.chartArea.top + (chart.chartArea.height / 2);
        const outerRadius = firstArc?.outerRadius ?? Math.min(chart.chartArea.width, chart.chartArea.height) / 2;

        ctx.save();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#B6B6B6';
        ctx.fillStyle = '#808080';
        ctx.font = '14px Tahoma';

        const offset = 15;

        arcs.forEach((arc: any, i: number) => {
            const v = values[i];
            if (arc == null || v == null) return;

            const startAngle = arc.startAngle ?? arc.circumference?.start ?? 0;
            const endAngle = arc.endAngle ?? arc.circumference?.end ?? 0;
            const mid = (startAngle + endAngle) / 2;

            // จุดเริ่ม/ปลาย
            const xStart = xCenter + outerRadius * Math.cos(mid);
            const yStart = yCenter + outerRadius * Math.sin(mid);
            const xEnd = xCenter + (outerRadius + offset) * Math.cos(mid);
            const yEnd = yCenter + (outerRadius + offset) * Math.sin(mid);

            // เส้น pointer
            ctx.beginPath();
            ctx.moveTo(xStart, yStart);
            ctx.lineTo(xEnd, yEnd);
            ctx.stroke();

            // label ชิดซ้าย/ขวาตามด้าน
            const onLeft = Math.cos(mid) < 0;
            ctx.textAlign = onLeft ? 'right' : 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${v}`, xEnd + (onLeft ? -5 : 5), yEnd);
        });

        ctx.restore();
    };


    const CustomLegend = ({
        labels,
        colors,
        onClick,
        visibility,
    }: {
        labels: string[];
        colors: string[];
        onClick: (index: number) => void;
        visibility: boolean[];
    }) => (
        <div className="custom-legend flex flex-col items-start gap-2">
            <h4 className="font-bold mb-2">{`Shipper Contract`}</h4>
            {labels.map((label, index) => (
                <div
                    key={index}
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => onClick(index)}
                >
                    <span
                        className="legend-color-box w-4 h-4 rounded-full"
                        style={{ backgroundColor: colors[index] }}
                    ></span>
                    <span
                        className={`legend-label text-sm ${visibility[index] ? '' : 'text-gray-500 line-through'}`}
                    >
                        {label}
                    </span>
                </div>
            ))}
        </div>
    );

    const [visibility, setVisibility] = useState([true, true, true, true]);
    const handleLegendClick = (index: number) => {
        setVisibility((prevVisibility) => {
            const newVisibility = [...prevVisibility];
            newVisibility[index] = !newVisibility[index];
            return newVisibility;
        });
    };

    // const filteredData = {
    //     ...transformedData,
    //     datasets: transformedData?.datasets?.map((dataset: any) => ({
    //         ...dataset,
    //         data: dataset.data.filter((_: any, index: any) => visibility[index]),
    //         backgroundColor: dataset.backgroundColor.filter((_: any, index: any) => visibility[index]),
    //     })),
    // };

    // กราฟ pie : กรณีที่ไม่มีข้อมูลให้ขึ้นเป็น No data รูปหุ่นยนต์ https://app.clickup.com/t/86erjya3y
    // const allZero = filteredData?.datasets?.[0]?.data.every((item?: any) => item === 0);

    // ======================
    const filteredData = useMemo(() => {
        if (!transformedData) return transformedData;

        // ตัด labels ให้ตรงกับชิ้นที่มองเห็นด้วย (กัน index เพี้ยน)
        const labels = (transformedData.labels ?? []).filter((_: any, i: number) => visibility[i]);

        const datasets = (transformedData.datasets ?? []).map((ds: any) => {
            const data = (ds.data ?? []).filter((_: any, i: number) => visibility[i]);
            const backgroundColor = (ds.backgroundColor ?? []).filter((_: any, i: number) => visibility[i]);
            // const borderColor = (ds.borderColor ?? []).filter?.((_: any, i: number) => visibility[i]) ?? ds.borderColor;

            return {
                ...ds,
                data,
                backgroundColor,
                // borderColor,
            };
        });

        return { ...transformedData, labels, datasets };
    }, [transformedData, visibility]);

    // กราฟ pie : กรณีที่ไม่มีข้อมูลให้ขึ้นเป็น No data รูปหุ่นยนต์ https://app.clickup.com/t/86erjya3y
    const allZero = useMemo(() => {
        const ds0 = filteredData?.datasets?.[0];
        if (!ds0) return true;
        const arr = ds0.data ?? [];
        return arr.length === 0 || arr.every((v: any) => Number(v) === 0);
    }, [filteredData]);

    const handleHover = (event: any) => {
        const chart = ChartJS.getChart('doughnutChart');
        if (chart) {
            chart.update();
        }
    };

    // setcontractId
    //   setcontractId(filteredData?.flatMap((fm:any) => fm?.contract_code?.map((c:any) => c?.id)) || [])
   
    

    return (
        <>
            <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
                <DatePickaSearch
                    key={"start" + key}
                    label="Start Date"
                    placeHolder="Select Start Date"
                    allowClear
                    onChange={(e: any) => {
                        setSrchStartDate(e ? e : null)
                        // setSrchStartDateTable(e ? e : null)
                    }}
                />

                <DatePickaSearch
                    key={"end" + key}
                    label="End Date"
                    placeHolder="Select End Date"
                    allowClear
                    onChange={(e: any) => {
                        setSrchEndDate(e ? e : null)
                        // setSrchEndDateTable(e ? e : null)
                    }}
                />

                <InputSearch
                    id="searchShipper"
                    label="Shipper Name"
                    // type="select"
                    type="select-multi-checkbox"
                    value={srchShipper}
                    onChange={(e) => {
                        setSrchShipper(e.target.value)
                        // setSrchShipperTable(e.target.value)
                    }}
                    // options={shipperGroupData?.data?.map((item: any) => ({
                    //     value: item.id,
                    //     label: item.name
                    // }))}
                    isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
                    // options={shipperGroupData?.data
                    //     ?.filter((item: any) =>
                    //         userDT?.account_manage?.[0]?.user_type_id == 3
                    //             ? item?.id === userDT?.account_manage?.[0]?.group?.id
                    //             : true
                    //     )
                    //     .map((item: any) => ({
                    //         value: item.id,
                    //         label: item.name,
                    //     }))
                    // }
                    options={shipperGroupData?.data
                        ?.filter((item: any) =>
                            userDT?.account_manage?.[0]?.user_type_id == 3
                                ? [item?.id === userDT?.account_manage?.[0]?.group?.id]
                                : true
                        )
                        .map((item: any) => ({
                            value: item.id,
                            label: item.name,
                        }))
                    }
                />
                <BtnSearch handleFieldSearch={handleFieldSearch} />
                <BtnReset handleReset={handleReset} />
            </aside>

            {isLoading ? (
                <div className="flex gap-10 pt-5">
                    {/* Doughnut */}
                    <div className="flex justify-center items-center">
                        <div className="relative h-[320px] sm:h-[360px]">
                            <div className="relative w-[220px] sm:w-[260px] aspect-square pl-4">
                                {!allZero ?
                                    <Doughnut
                                        id="doughnutChart"
                                        data={filteredData}
                                        options={options}
                                        style={{ width: '100%', height: '100%' }}
                                        onMouseMove={handleHover}
                                    />
                                    :
                                    <div className="flex flex-col justify-center items-center w-[100%] pt-24">
                                        <img className="w-[40px] h-auto mb-2" src="/assets/image/no_data_icon.svg" alt="No data icon" />
                                        <div className="text-[16px] text-[#9CA3AF]">
                                            No data.
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>

                    {/* Custom Legend */}
                    <div className="pl-8 w-full pt-7">
                        <CustomLegend
                            labels={transformedData?.labels}
                            colors={transformedData?.datasets[0]?.backgroundColor}
                            onClick={handleLegendClick}
                            visibility={visibility}
                        />
                    </div>
                </div>

            ) : (
                <div className="flex flex-col justify-center items-center w-[100%] pt-24">
                    <img className="w-[40px] h-auto mb-2" src="/assets/image/no_data_icon.svg" alt="No data icon" />
                    <div className="text-[16px] text-[#9CA3AF]">
                        No data.
                    </div>
                </div>
            )}

        </>
    );
};

export default ChartWithCustomLegend;
