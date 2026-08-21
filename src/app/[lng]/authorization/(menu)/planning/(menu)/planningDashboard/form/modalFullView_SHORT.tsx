import React, { useEffect, useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react'
import { filterByDayFrom, formatDay, formatNumber, generateDaysFromFutureMonth, getEarliestFirstDay, getLatestFirstDay, keepLatestPerGroupByPeriod, mergeDataByGroupMedTermVersionTwo, monthDiffInclusive, trimEdgeZerosToNull } from '@/utils/generalFormatter';
import { Line } from 'react-chartjs-2';

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, BarElement } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-datalabels';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import ChartShortEachShipper from './chartShortTermEachShipper';
import { InputSearch } from '@/components/other/SearchForm';
import BtnSearch from '@/components/other/btnSearch';
import BtnReset from '@/components/other/btnReset';
import MonthYearPickaSearch from '@/components/library/dateRang/monthYearPicker';
import dayjs from 'dayjs';

ChartJS.register(BarElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, annotationPlugin, ChartDataLabels);

type FormExampleProps = {
    data?: any;
    dataOriginal?: any;
    open?: boolean;
    isAll?: boolean;
    mode?: any;
    shipperGroupData?: any;
    entryExitMaster?: any;
    areaMaster?: any;
    areaMasterDataFilter?: any;
    srchStartDateMain?: any;
    onClose: () => void;
    filterList?: any
};

const ModalFullViewShort: React.FC<FormExampleProps> = ({
    open,
    onClose,
    data,
    dataOriginal,
    isAll,
    shipperGroupData,
    entryExitMaster,
    areaMaster,
    areaMasterDataFilter,
    mode,
    srchStartDateMain,
    filterList
}) => {

    // ############### PROCESS DATA MEDIUM TERM EACH ###############
    const [isFilter, setIsFilter] = useState<any>(false);

    // ############### Doughnut SEARCH ###############
    const [key, setKey] = useState(0);
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchShipper, setSrchShipper] = useState('');
    const [srchEntryExit, setSrchEntryExit] = useState('');
    const [srchArea, setSrchArea] = useState<any>([]);
    const [filterData, setFilterData] = useState<any>(data);
    const [optionArea, setoptionArea] = useState<any>([]);

    useEffect(() => {
        if (open) {

            if (filterList) {
                if (filterList?.month) {
                    setSrchStartDate(filterList?.month)
                } else {
                    setSrchStartDate(null);
                }
                //================================================
                if (filterList?.shipper) {
                    setSrchShipper(filterList?.shipper)
                } else {
                    setSrchShipper('')
                }
                //================================================
                if (filterList?.entryExit) {
                    setSrchEntryExit(filterList?.entryExit)
                } else {
                    setSrchEntryExit('')
                }
                //================================================
                if (filterList?.area) {
                    setSrchArea(filterList?.area)
                } else {
                    setSrchArea([])
                }
                //================================================
                const filterArea = areaMasterDataFilter?.filter((item: any) =>
                    data?.datasets?.some((d: any) => d?.label === item?.name)
                );
                setoptionArea(filterArea);
                handleFetch(filterList?.month, filterList?.shipper, filterList?.entryExit, filterList?.area);
            } else {
                if (mode && data) {
                    const dataFullview: any = geranateFullView()
                    const { months, areas, seriesData } = processData(dataFullview?.data);
                    let chartData: any

                    chartData = {
                        labels: months,
                        datasets: areas?.map((areaId: any, index) => {
                            const areaData = areaMasterDataFilter?.find((d: any) => d.name === areaId?.name);
                            return {
                                label: `${areaId?.name}`,
                                data: seriesData[index],
                                borderColor: areaData?.color,
                                backgroundColor: areaData?.color,
                                fill: false,
                                isEntry: areaData?.entry_exit_id == 1 ? true : false,
                            };
                        })
                    };

                    setFilterData(chartData)
                }
            }
        }
        else{
            setSrchStartDate(null);
            setSrchShipper('')
            setSrchEntryExit('')
            setSrchArea([])
            setIsFilter(false)
        }
    }, [mode, data, open])

    const handleFetchOld = (month: any, shipper: any, entryExit: any, area: any) => {

        const processNOW = (data: any, date: any) => {

            const earliestDay: any = getEarliestFirstDay(data); // หาวันที่น้อยที่สุด จะได้เอามาทำ label
            const lastestDay: any = getLatestFirstDay(data); // หาวันที่มากที่สุด จะได้เอามาทำ label
            const month_count = monthDiffInclusive(earliestDay, lastestDay); // หาจำนวนเดือนระหว่างวันที่

            // const months = Array.from(new Set(data.flatMap((d: any) => d.day.map(formatDay)))); // Unique months
            // const months = generateDaysFromFutureMonth(srchStartDate ? srchStartDate : dayjs(earliestDay, 'DD/MM/YYYY').toDate());

            // เพิ่ม srchStartDateMain ส่งเข้าไปด้วย ถ้ามี --> เอามาจาก filter chart หลัก
            // const months = generateDaysFromFutureMonth(srchStartDate ? srchStartDate : dayjs(earliestDay, 'DD/MM/YYYY').toDate(), month_count);
            const months = generateDaysFromFutureMonth(
                // date ? date : dayjs(earliestDay, 'DD/MM/YYYY').toDate(),
                date ? date : dayjs().startOf('month').toDate(),
                month_count
            );

            const areas = Array.from(
                new Map(
                    (data || []).flatMap((d: any) => d?.area ? [{ id: d?.area?.id, name: d?.area?.name }] : []) // Safeguard for null/undefined data and area
                        ?.map((area: any) => [area.id, area]) // Use id as the key in the Map
                ).values() // Get unique area objects
            );

            const seriesData = areas?.map((areaId: any) => {
                return months?.map((month) => {
                    let hasValue = false;
            
                    const totalValue = data
                        ?.filter((d: any) => d.area.id === areaId?.id)
                        ?.reduce((sum: any, current: any) => {
                            const monthIndex = current.day.findIndex(
                                (m: any) => formatDay(m) === month,
                            );
                
                            if (monthIndex >= 0) {
                                const val = current.value[monthIndex];
                
                                if (val !== null && val !== undefined) {
                                    hasValue = true; // 🔥 มีข้อมูลจริง
                                    return sum + val;
                                }
                            }
                
                            return sum;
                        }, 0);
            
                    return hasValue ? totalValue : null;
                });
            });


            return {
                months,
                areas,
                seriesData
            };
        };

        //filter item => shipper
        const dataforFilterShipper: any = dataOriginal?.filter((item: any) => { return (shipper ? item?.group?.id == shipper : true) });

        // data too
        // |
        // |
        // V

        //filter item => entry_exit
        const dataforFilterEntryExit = dataforFilterShipper?.map((item: any) => {
            const filterInnerData = item.data?.filter((innerFind: any) => {
                const entryExitMatch = entryExit ? innerFind?.entry_exit_id == entryExit : true;
                return entryExitMatch;
            }) || [];

            if (filterInnerData?.length > 0) {
                return {
                    ...item,
                    data: filterInnerData,
                };
            } else {
                return {
                    ...item,
                    data: []
                };
            }
        })

        // data too
        // |
        // |
        // V

        //filter item => area
        const dataforFilterArea = dataforFilterEntryExit?.map((item: any) => {
            if (area && area?.length > 0) {
                const filterInnerData = item?.data?.filter((innerFind: any) => {
                    let checked = area?.find((itemFindSub: any) => itemFindSub == innerFind?.area?.name) || false;
                    return checked
                })

                if (filterInnerData?.length > 0) {
                    return {
                        ...item,
                        data: filterInnerData,
                    };
                } else {
                    return {
                        ...item,
                        data: []
                    };
                }
            } else {
                return { ...item }
            }
        })

        //finish data to render chart
        const resultFilterData: any = dataforFilterArea
        const latestPerGroupShortTerm =
          keepLatestPerGroupByPeriod(resultFilterData);
        let modifiedDataShort2 = mergeDataByGroupMedTermVersionTwo(
          latestPerGroupShortTerm,
        );
    
        const month_date_format = month
          ? dayjs(month).format("DD/MM/YYYY")
          : dayjs().startOf("month").format("DD/MM/YYYY");
        const fromStr = month
          ? dayjs(month_date_format, ["DD/MM/YYYY", "YYYY-MM-DD"])
              .startOf("day")
              .format("DD/MM/YYYY")
          : dayjs().startOf("month").format("DD/MM/YYYY");
    
        // กรองเดือนของ each
        // กรอง resultFilterData.data.month ตั้งแต่เดือนที่เท่ากับ srchMonth เป็นต้นไป
        // แล้วก็ดู index ของ month กับ value ถ้ากรอง month ที่ index ไหนออก ก็ต้องกรอง value ที่ index นั้น ๆ
        // const filtered = filterByMonthFrom(resultFilterData, dayjs(srchMonth).format('DD/MM/YYYY')); // เดิมโรงงาน
        const filtered = filterByDayFrom(resultFilterData ?? [], fromStr);

        //render data to chart
        const { months, areas, seriesData } = processNOW(resultFilterData?.flatMap((d: any) => d?.data), month);

        // data too
        // |
        // |
        // V

        const chartDataX = {
            labels: months,
            datasets: areas?.map((areaId: any, index) => {
                const areaData = areaMasterDataFilter?.find((d: any) => d.name === areaId?.name);
                return {
                    label: `${areaId?.name}`,
                    data: seriesData[index],
                    borderColor: areaData?.color,
                    backgroundColor: areaData?.color,
                    fill: false,
                    isEntry: areaData?.entry_exit_id == 1 ? true : false,
                };
            })
        };

        const newData = {
            ...chartDataX,
            datasets: chartDataX.datasets.map((ds: any) => ({
                ...ds,
                data: ds.data, //trimEdgeZerosToNull(ds.data),
            })),
        };

        setFilterData(newData)
        setIsFilter(true)
    }

    const handleFetch = (month: any, shipper: any, entryExit: any, area: any) => {
        const dataforFilterShipper: any = dataOriginal?.filter((item: any) => {
            return shipper ? item?.group?.id == shipper : true;
        });
    
        //filter item => entry_exit
        const dataforFilterEntryExit = dataforFilterShipper?.map((item: any) => {
            const filterInnerData = item.data?.filter((innerFind: any) => {
                const entryExitMatch = entryExit
                    ? innerFind?.entry_exit_id == entryExit
                    : true;
                return entryExitMatch;
            }) || [];
        
            if (filterInnerData?.length > 0) {
                return {
                    ...item,
                    data: filterInnerData,
                };
            } else {
                return {
                    ...item,
                    data: [],
                };
            }
        });
    
        //filter item => area
        const dataforFilterArea = dataforFilterEntryExit?.map((item: any) => {
            if (area && area?.length > 0) {
                const filterInnerData = item?.data?.filter((innerFind: any) => {
                    let checked = area?.find((itemFindSub: any) => itemFindSub == innerFind?.area?.name) || false;
                    return checked;
                });
        
                if (filterInnerData?.length > 0) {
                    return {
                        ...item,
                        data: filterInnerData,
                    };
                } else {
                    return {
                        ...item,
                        data: [],
                    };
                }
            } else {
                return { ...item };
            }
        });
    
        //finish data to render chart
        const resultFilterData: any = dataforFilterArea;
        const latestPerGroupShortTerm = keepLatestPerGroupByPeriod(resultFilterData);
        let modifiedDataShort2 = mergeDataByGroupMedTermVersionTwo(latestPerGroupShortTerm);
    
        const month_date_format = month
            ? dayjs(month).format("DD/MM/YYYY")
            : dayjs().startOf("month").format("DD/MM/YYYY");
        const fromStr = month
            ? dayjs(month_date_format, ["DD/MM/YYYY", "YYYY-MM-DD"])
                .startOf("day")
                .format("DD/MM/YYYY")
            : dayjs().startOf("month").format("DD/MM/YYYY");
    
        // กรองเดือนของ each
        // กรอง resultFilterData.data.month ตั้งแต่เดือนที่เท่ากับ srchMonth เป็นต้นไป
        // แล้วก็ดู index ของ month กับ value ถ้ากรอง month ที่ index ไหนออก ก็ต้องกรอง value ที่ index นั้น ๆ
        // const filtered = filterByMonthFrom(resultFilterData, dayjs(srchMonth).format('DD/MM/YYYY')); // เดิมโรงงาน
        const filtered = filterByDayFrom(resultFilterData ?? [], fromStr);
    
    
        //render data to chart
        const { months, areas, seriesData } = processDataX(resultFilterData?.flatMap((d: any) => d?.data), fromStr);
    
    
        const chartDataX = {
            labels: months,
            datasets: areas?.map((areaId: any, index) => {
                const areaData = areaMaster?.data.find(
                    (d: any) => d.name === areaId?.name
                );
                return {
                    label: `${areaId?.name}`,
                    data: seriesData[index],
                    borderColor: areaData?.color,
                    backgroundColor: areaData?.color,
                    fill: false,
                    isEntry: areaData?.entry_exit_id == 1 ? true : false,
                };
            }),
        };
    
        const newData = {
            ...chartDataX,
            datasets: chartDataX.datasets.map((ds: any) => ({
                ...ds,
                data: ds.data,
            })),
        };

        setFilterData(newData)
        setIsFilter(true)
    }

    const processData = (data: any) => {

        const earliestDay: any = getEarliestFirstDay(data); // หาวันที่น้อยที่สุด จะได้เอามาทำ label
        const lastestDay: any = getLatestFirstDay(data); // หาวันที่มากที่สุด จะได้เอามาทำ label
        const month_count = monthDiffInclusive(earliestDay, lastestDay); // หาจำนวนเดือนระหว่างวันที่

        // const months = Array.from(new Set(data.flatMap((d: any) => d.day.map(formatDay)))); // Unique months
        // const months = generateDaysFromFutureMonth(srchStartDate ? srchStartDate : dayjs(earliestDay, 'DD/MM/YYYY').toDate());

        // เพิ่ม srchStartDateMain ส่งเข้าไปด้วย ถ้ามี --> เอามาจาก filter chart หลัก
        // const months = generateDaysFromFutureMonth(srchStartDate ? srchStartDate : dayjs(earliestDay, 'DD/MM/YYYY').toDate(), month_count);
        const months = generateDaysFromFutureMonth(
            srchStartDateMain
                ? srchStartDateMain
                : srchStartDate
                    ? srchStartDate
                    : dayjs(earliestDay, 'DD/MM/YYYY').toDate(),
            month_count
        );

        const areas = Array.from(
            new Map(
                (data || []).flatMap((d: any) => d?.area ? [{ id: d?.area?.id, name: d?.area?.name }] : []) // Safeguard for null/undefined data and area
                    ?.map((area: any) => [area.id, area]) // Use id as the key in the Map
            ).values() // Get unique area objects
        );

        const seriesData = areas?.map((areaId: any) => {
            return months?.map((month) => {
                let hasValue = false;

                const totalValue = data
                ?.filter((d: any) => d.area.id === areaId?.id)
                ?.reduce((sum: any, current: any) => {
                    const monthIndex = current.day.findIndex(
                        (m: any) => formatDay(m) === month,
                    );

                    if (monthIndex >= 0) {
                        const val = current.value[monthIndex];

                        if (val !== null && val !== undefined) {
                            hasValue = true; // 🔥 มีข้อมูลจริง
                            return sum + val;
                        }
                    }

                    return sum;
                }, 0);

                return hasValue ? totalValue : null;
            });
        });


        return {
            months,
            areas,
            seriesData
        };
    };
    const processDataX = (data: any, startDate?: string) => {
        const startDayjs = startDate ? dayjs(startDate, "DD/MM/YYYY") : null;
        const earliestDay: any = getEarliestFirstDay(data); // หาวันที่น้อยที่สุด จะได้เอามาทำ label
        // const earliestDay: any = dayjs().startOf('month').toDate(); // หาวันที่น้อยที่สุด จะได้เอามาทำ label
    
        const lastestDay: any = getLatestFirstDay(data); // หาวันที่มากที่สุด จะได้เอามาทำ label
        const month_count = monthDiffInclusive(earliestDay, lastestDay); // หาจำนวนเดือนระหว่างวันที่
        const months = generateDaysFromFutureMonth(
            // srchStartDate ? srchStartDate : dayjs(earliestDay, "DD/MM/YYYY").toDate(),
            (startDate && startDayjs?.isValid()) ? startDayjs.toDate() : srchStartDate ? srchStartDate : dayjs().startOf('month').toDate(),
            // month_count,
        );
    
        const areas = Array.from(
            new Map(
            (data || [])
                .flatMap((d: any) =>
                    d?.area ? [{ id: d?.area?.id, name: d?.area?.name }] : [],
                ) // Safeguard for null/undefined data and area
                ?.map((area: any) => [area.id, area]), // Use id as the key in the Map
            ).values(), // Get unique area objects
        );
    
        const seriesData = areas?.map((areaId: any) => {
            return months?.map((month) => {
                let hasValue = false;
        
                const totalValue = data
                    ?.filter((d: any) => d.area.id === areaId?.id)
                    ?.reduce((sum: any, current: any) => {
                        const monthIndex = current.day.findIndex(
                            (m: any) => formatDay(m) === month,
                        );
            
                        if (monthIndex >= 0) {
                            const val = current.value[monthIndex];
            
                            if (val !== null && val !== undefined) {
                                hasValue = true; // 🔥 มีข้อมูลจริง
                                return sum + val;
                            }
                        }
            
                        return sum;
                    }, 0);
        
                return hasValue ? totalValue : null;
            });
        });
    
        return {
            months,
            areas,
            seriesData,
        };
    };

    const geranateFullView = () => {

        // สำหรับแสดงข้อมูลใน modalFull -> short term ของอิง
        const areaMap = new Map<string, {
            id: number;
            nomination_point: string;
            customer: string;
            area: { id: number; name: string; color: string };
            unit: string;
            entry_exit_id: number;
            entry_exit: string;
            day: string[];
            value: number[];
        }>();

        // ตรงนี้ใส่ originalData
        dataOriginal?.forEach((entry: any) => {
            entry.data?.forEach((item: any) => {
                const key = item.area.name;

                if (!areaMap.has(key)) {
                    areaMap.set(key, { ...item, value: [...item.value], day: [...item.day] });
                } else {
                    const existing = areaMap.get(key)!;
                    existing.value = existing.value.map((v, i) => v + item.value[i]);
                }
            });
        });

        const reducedDataAll = {
            ...dataOriginal[0],
            data: Array.from(areaMap.values()),
        };

        return reducedDataAll
    }

    const handleFieldSearch = () => {

        //filter item => shipper
        const dataforFilterShipper: any = dataOriginal?.filter((item: any) => { return (srchShipper ? item?.group?.id == srchShipper : true) });

        // data too
        // |
        // |
        // V

        //filter item => entry_exit
        const dataforFilterEntryExit = dataforFilterShipper?.map((item: any) => {
            const filterInnerData = item.data?.filter((innerFind: any) => {
                const entryExitMatch = srchEntryExit ? innerFind?.entry_exit_id == srchEntryExit : true;
                return entryExitMatch;
            }) || [];

            if (filterInnerData?.length > 0) {
                return {
                    ...item,
                    data: filterInnerData,
                };
            } else {
                return {
                    ...item,
                    data: []
                };
            }
        })

        // data too
        // |
        // |
        // V

        //filter item => area
        const dataforFilterArea = dataforFilterEntryExit?.map((item: any) => {
            if (srchArea && srchArea?.length > 0) {
                const filterInnerData = item?.data?.filter((innerFind: any) => {
                    let checked = srchArea?.find((itemFindSub: any) => itemFindSub == innerFind?.area?.name) || false;
                    return checked
                })

                if (filterInnerData?.length > 0) {
                    return {
                        ...item,
                        data: filterInnerData,
                    };
                } else {
                    return {
                        ...item,
                        data: []
                    };
                }
            } else {
                return { ...item }
            }
        })

        //finish data to render chart
        const resultFilterData: any = dataforFilterArea

        //render data to chart
        const { months, areas, seriesData } = processData(resultFilterData?.flatMap((d: any) => d?.data));

        // data too
        // |
        // |
        // V

        const chartDataX = {
            labels: months,
            datasets: areas?.map((areaId: any, index) => {
                const areaData = areaMasterDataFilter?.find((d: any) => d.name === areaId?.name);
                return {
                    label: `${areaId?.name}`,
                    data: seriesData[index],
                    borderColor: areaData?.color,
                    backgroundColor: areaData?.color,
                    fill: false,
                    isEntry: areaData?.entry_exit_id == 1 ? true : false,
                };
            })
        };

        const newData = {
            ...chartDataX,
            datasets: chartDataX.datasets.map((ds: any) => ({
                ...ds,
                data: ds.data, //trimEdgeZerosToNull(ds.data),
            })),
        };

        setFilterData(newData)
        setIsFilter(true)
    };

    const handleReset = () => {
        setSrchStartDate(null);
        setSrchArea([]);
        setSrchShipper('');
        setSrchEntryExit('');
        setFilterData(data)
        setIsFilter(false)
        // setFilteredDataTable(dataTable);
        setKey((prevKey) => prevKey + 1);
    };

    let shortTermOption: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: {
                        size: 12,
                    },
                    boxWidth: 20,
                    boxHeight: 12,
                    padding: 18,
                    generateLabels: (chart: any) => {
                        return chart?.data?.datasets?.map((dataset: any, index: any) => ({
                            text: dataset.label,
                            fillStyle: dataset.backgroundColor,
                            strokeStyle: dataset.backgroundColor,
                            hidden: !chart.isDatasetVisible(index),
                            pointStyle: dataset.isEntry ? 'rect' : 'circle',
                        }));
                    }
                },
            },
            title: {
                display: true,
                // text: 'Total Supply (MMBTU)',
                text: 'Total Energy (MMBTU/D)', // v1.0.90 เปลี่ยนหัว Graph จาก "Total Supply (MMBTU)" เป็น "Total Energy (MMBTU/D)" https://app.clickup.com/t/86ert2k26
                align: 'start',
                position: 'top',
                font: {
                    size: 16,
                    // weight: 'normal',
                },
                padding: {
                    top: 5,
                    bottom: 1,
                },
                color: '#58585A',
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'white',
                titleColor: 'black',
                bodyColor: 'black',
                borderColor: '#cfcfd1',
                borderWidth: 1,
                callbacks: {
                    label: (tooltipItem: any) => {
                        const labelName = tooltipItem.dataset.label;
                        const value = formatNumber(tooltipItem.raw);
                        return `${labelName} : ${value}`;
                    },
                },
            },
            datalabels: {
                display: false,
            },
        },
        scales: {
            x: {
                title: {
                    display: false,
                    text: 'Month'
                },
                ticks: {
                    autoSkip: false,   // สั่งให้โชว์ Label ทุกอัน ไม่ต้องข้าม
                    maxRotation: 45,   // (ทางเลือก) ถ้ามันเบียด ให้เอียง 45 องศา
                    minRotation: 0,
                    font: {
                        size: 11,      // (ทางเลือก) ปรับขนาดฟอนต์ให้เล็กลงหน่อยถ้าวันเยอะ
                    }
                }
            },
            y: {
                title: {
                    display: false,
                    text: 'Value'
                },
                beginAtZero: true
            }
        },
    }

    let shortTermEachOption: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: {
                        size: 12,
                    },
                    boxWidth: 20,
                    boxHeight: 12,
                    padding: 18,
                    generateLabels: (chart: any) => {
                        return chart?.data?.datasets?.map((dataset: any, index: any) => ({
                            text: dataset.label,
                            fillStyle: dataset.backgroundColor,
                            strokeStyle: dataset.backgroundColor,
                            hidden: !chart.isDatasetVisible(index),
                            pointStyle: dataset.isEntry ? 'rect' : 'circle',
                        }));
                    }
                },
            },
            title: {
                display: true,
                // text: 'Total Supply (MMBTU)',
                text: 'Total Energy (MMBTU/D)', // v1.0.90 เปลี่ยนหัว Graph จาก "Total Supply (MMBTU)" เป็น "Total Energy (MMBTU/D)" https://app.clickup.com/t/86ert2k26
                align: 'start',
                position: 'top',
                font: {
                    size: 16,
                    // weight: 'normal',
                },
                padding: {
                    top: 5,
                    bottom: 1,
                },
                color: '#58585A',
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'white',
                titleColor: 'black',
                bodyColor: 'black',
                borderColor: '#cfcfd1',
                borderWidth: 1,
                callbacks: {
                    label: (tooltipItem: any) => {
                        const labelName = tooltipItem.dataset.label;
                        const value = formatNumber(tooltipItem.raw);
                        return `${labelName} : ${value}`;
                    },
                },
            },
            datalabels: {
                display: false,
            },
        },
        scales: {
            x: {
                title: {
                    display: false,
                    text: 'Month'
                }
            },
            y: {
                title: {
                    display: false,
                    text: 'Value'
                },
                beginAtZero: true
            }
        },
    }

    const handleClose = () => {
        onClose();
        handleReset();
    };
    
    useEffect(() => {
        if(key > 0){
            handleFetch(null, '', '', []);
        }
    }, [key])

    return (
        <Dialog open={open} onClose={handleClose} className="relative z-20">
            <div className="fixed inset-0 bg-black bg-opacity-45 transition-opacity" />

            <div className="fixed inset-0 z-10 flex items-center justify-center">
                <DialogPanel className="flex w-auto transform transition-all bg-white rounded-lg text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95">
                    {/* Content */}
                    <div className="flex w-[87.3dvw] h-[96dvh] overflow-hidden flex-col items-center gap-2 p-9">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-700 self-start">
                            {`Full View : ${mode}`}
                        </h2>

                        <aside className="flex flex-wrap gap-3 w-full">
                            <MonthYearPickaSearch
                                key={"start" + key}
                                label={'Month'}
                                placeHolder={'Select Month'}
                                allowClear
                                onChange={(e: any) => setSrchStartDate(e || null)}
                                valueShow={srchStartDate}
                            />

                            {isAll &&
                                <InputSearch
                                    id="searchShipper"
                                    label="Shipper Name"
                                    type="select"
                                    value={srchShipper}
                                    onChange={(e) => setSrchShipper(e.target.value)}
                                    options={shipperGroupData?.data?.map((item: any) => ({
                                        value: item.id,
                                        label: item.name
                                    }))}
                                />
                            }

                            <InputSearch
                                id="searchEntryExit"
                                label="Entry/Exit"
                                type="select"
                                value={srchEntryExit}
                                onChange={(e) => {
                                    if (e?.target?.value) {
                                        setSrchEntryExit(e.target.value)
                                    } else {
                                        setSrchEntryExit('')
                                    }
                                }}
                                options={entryExitMaster?.data?.map((item: any) => ({
                                    value: item.id,
                                    label: item.name
                                }))}
                            />

                            <InputSearch
                                id="searchArea"
                                label="Area"
                                type="select-multi-checkbox"
                                value={srchArea}
                                onChange={(e) => setSrchArea(e.target.value)}
                                options={optionArea
                                    ?.filter((item: any) => srchEntryExit === '' || item?.entry_exit_id === srchEntryExit)
                                    .map((item: any) => ({
                                        value: item.name,
                                        label: item.name,
                                    }))
                                }
                            />

                            <BtnSearch handleFieldSearch={() => {handleFetch(srchStartDate, srchShipper, srchEntryExit, srchArea)}} />
                            <BtnReset handleReset={handleReset} />
                        </aside>

                        <div className="w-full flex-grow overflow-x-auto">
                            {isAll && (
                                <div className="w-full overflow-x-auto">
                                    <div className="w-[7500px] h-[65dvh]">
                                        <Line data={filterData} options={shortTermOption} />
                                    </div>
                                </div>
                            )}

                            {!isAll && (
                                isFilter ? (
                                    <div className="max-w-[7500px] w-full h-[65dvh]">
                                        <Line data={filterData} options={shortTermEachOption} />
                                    </div>
                                ) : (
                                    <ChartShortEachShipper dataChart={filterData} mode="view"/>
                                )
                            )}
                        </div>

                        <div className="w-full flex justify-end pt-4 sticky bottom-0 bg-white p-4">
                            <button
                                onClick={handleClose}
                                className="w-40 h-10 font-bold bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                            >
                                {`Close`}
                            </button>
                        </div>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default ModalFullViewShort;