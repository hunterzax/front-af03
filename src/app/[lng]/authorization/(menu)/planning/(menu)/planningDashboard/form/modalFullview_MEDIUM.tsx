import React, { useEffect, useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react'
import { filterByMonthFrom, formatMonth, formatMonthX, formatNumber, formatNumberThreeDecimal, generateNext24Months, trimEdgeZerosToNull } from '@/utils/generalFormatter';
import { Line } from 'react-chartjs-2';

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, BarElement } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-datalabels';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { InputSearch } from '@/components/other/SearchForm';
import BtnSearch from '@/components/other/btnSearch';
import BtnReset from '@/components/other/btnReset';
import MonthYearPickaSearch from '@/components/library/dateRang/monthYearPicker';
import ChartMedEachShipper from './chartMedTermEachShipper';
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
    srchStartYearMedTerm?: any;
    onClose: () => void;
    filterList?: any
};

const ModalFullViewMedium: React.FC<FormExampleProps> = ({
    open,
    onClose,
    data,
    dataOriginal,
    isAll,
    shipperGroupData,
    entryExitMaster,
    areaMaster,
    areaMasterDataFilter,
    srchStartYearMedTerm,
    mode,
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
    }, [mode, data, open]);

    const processData = (data: any) => {
        // const months = generateNext24Months(srchStartDate);
        let months = formatMonthX(data?.[0]?.month)

        if (srchStartDate) {
            months = generateNext24Months(srchStartDate);
        } else if (srchStartYearMedTerm) {
            months = generateNext24Months(srchStartYearMedTerm);
        }

        const areas = Array.from(
            new Map(
                (data || []).flatMap((d: any) => d?.area ? [{ id: d?.area?.id, name: d?.area?.name }] : []) // Safeguard for null/undefined data and area
                    ?.map((area: any) => [area.id, area]) // Use id as the key in the Map
            ).values() // Get unique area objects
        );

        const seriesData = areas?.map((areaId: any) => {
            return months.map((month: any) => {
                const totalValue = data
                    .filter((d: any) => d.area.id === areaId?.id)
                    .reduce((sum: any, current: any) => {
                        const monthIndex = current.month.findIndex((m: any) => formatMonth(m) === month);
                        if (monthIndex >= 0) {
                            return sum + current.value[monthIndex];
                        }
                        return sum;
                    }, 0);
                return totalValue;
            });
        });

        return {
            months,
            areas,
            seriesData
        };
    };

    const processDataX = (data: any) => {
        let months = formatMonthX(data?.[0]?.month);
        if (srchStartDate) {
            months = generateNext24Months(srchStartDate);
        }


        const areas = Array.from(
        new Map(
            (data || [])
            .flatMap((d: any) =>
                d?.area ? [{ id: d.area.id, name: d.area.name }] : [],
            ) // Safeguard for null/undefined data and area
            .map((area: any) => [area.id, area]), // Use id as the key in the Map
        ).values(), // Get unique area objects
        );

        // const areas = Array.from(new Set(data.flatMap((d:any) => d.area))); // Unique areas
        const seriesData = areas?.map((areaId: any) => {
        return months.map((month: any) => {
            const related = data?.filter((d: any) => d.area.id === areaId?.id);
            let hasValue = false;

            const totalValue = related?.reduce((sum: any, current: any) => {
            const monthIndex = current.month.findIndex(
                (m: any) => formatMonth(m) === month,
            );

            if (monthIndex >= 0) {
                const val = current.value[monthIndex];

                // 🔥 FIX สำคัญ
                if (val === null || val === undefined) return sum;

                hasValue = true;
                return sum + val;
            }

            return sum;
            }, 0);

            // 🔥 แก้แค่ตรงนี้
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
            month: string[];
            value: number[];
        }>();

        // ตรงนี้ใส่ originalData
        dataOriginal?.forEach((entry: any) => {
            entry?.data?.forEach((item: any) => {
                const key = item?.area?.name;

                if (!areaMap.has(key)) {
                    areaMap?.set(key, { ...item, value: [...item?.value], day: [...item?.month] });
                } else {
                    const existing = areaMap.get(key)!;
                    existing.value = existing?.value?.map((v, i) => v + item?.value[i]);
                }
            });
        });

        const reducedDataAll = {
            ...dataOriginal[0],
            data: Array.from(areaMap.values()),
        };

        return reducedDataAll
    }

    const handleFetchOld = (month: any, shipper: any, entryExit: any, area: any) => {

        const processNOW = (data: any, date: any) => {
            // const months = generateNext24Months(srchStartDate);
            let months = formatMonthX(data?.[0]?.month)

            if (date) {
                months = generateNext24Months(date);
            }

            const areas = Array.from(
                new Map(
                    (data || []).flatMap((d: any) => d?.area ? [{ id: d?.area?.id, name: d?.area?.name }] : []) // Safeguard for null/undefined data and area
                        ?.map((area: any) => [area.id, area]) // Use id as the key in the Map
                ).values() // Get unique area objects
            );

            const seriesData = areas?.map((areaId: any) => {
                return months.map((month: any) => {
                    const related = data?.filter((d: any) => d.area.id === areaId?.id);
                    let hasValue = false;
            
                    const totalValue = related?.reduce((sum: any, current: any) => {
                        const monthIndex = current.month.findIndex((m: any) => formatMonth(m) === month);
            
                        if (monthIndex >= 0) {
                            const val = current.value[monthIndex];
                
                            // 🔥 FIX สำคัญ
                            if (val === null || val === undefined) return sum;
                
                            hasValue = true;
                            return sum + val;
                        }
            
                        return sum;
                    }, 0);
            
                    // 🔥 แก้แค่ตรงนี้
                    return hasValue ? totalValue : null;
                });
            });
        
            return {
              months,
              areas,
              seriesData,
            };
        };

        //filter item => shipper
        const dataforFilterShipper: any = dataOriginal?.filter((item: any) => { return (shipper ? item?.group?.id == shipper : true) });

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

        // =========================
        // 🔥 FIX สำคัญ: normalize month ให้ตรงกันก่อนเข้า processData
        // =========================

        let minDate: any = null;
        let maxLength: number | null = null;
    
        resultFilterData?.forEach((entry: any) => {
            entry?.data?.forEach((item: any) => {
                item?.month?.forEach((m: string) => {
                    const d = dayjs(m, "DD/MM/YYYY");
                    if (!minDate || d.isBefore(minDate)) {
                        minDate = d;
                    }
                });
                if(item?.value && Array.isArray(item.value) && (maxLength === null || item?.value?.length > maxLength)) {
                    maxLength = item.value.length;
                }
            });
        });

        const baseMonths = Array.from(
            {
            length: maxLength || 24,
            },
            (_, i) => minDate?.add(i, "month").format("DD/MM/YYYY"),
        );

        const normalizedData = resultFilterData?.map((entry: any) => ({
            ...entry,
            data: entry.data.map((item: any) => ({
                ...item,
                month: baseMonths,
            })),
        }));


        // =========================
        // filter month (ยังใช้ได้เหมือนเดิม)
        // =========================
        const month_date_format = month
            ? dayjs(month).format("DD/MM/YYYY")
            : dayjs().startOf('month').format("DD/MM/YYYY"); //baseMonths[0];
  
        const fromStr = month
            ? dayjs(month_date_format, ["DD/MM/YYYY", "YYYY-MM-DD"])
            .startOf("day")
            .format("DD/MM/YYYY")
            : dayjs().startOf('month').format("DD/MM/YYYY"); //baseMonths[0];
    
        // const filtered = filterByMonthFrom(normalizedData ?? [], fromStr);
        const filtered = filterByMonthFrom(resultFilterData ?? [], fromStr);
        //render data to chart
        const { months, areas, seriesData } = processNOW(filtered?.flatMap((d: any) => d?.data), month);

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
        // =========================
        // filter shipper
        // =========================
        const dataforFilterShipper: any = dataOriginal?.filter((item: any) => {
          return shipper ? item?.group?.id == shipper : true;
        });
    
        // =========================
        // filter entry_exit
        // =========================
        const dataforFilterEntryExit = dataforFilterShipper?.map((item: any) => {
            const filterInnerData = item.data?.filter((innerFind: any) => {
                return entryExit
                ? innerFind?.entry_exit_id == entryExit
                : true;
            }) || [];

            return {
                ...item,
                data: filterInnerData,
            };
        });
    
        // =========================
        // filter area
        // =========================
        const resultFilterData = dataforFilterEntryExit?.map((item: any) => {
            if (area && area.length > 0) {
                const filterInnerData = item?.data?.filter((innerFind: any) =>
                    area.includes(innerFind?.area?.name),
                );

                return {
                    ...item,
                    data: filterInnerData,
                };
            }
            return { ...item };
        });
    
        // =========================
        // 🔥 FIX สำคัญ: normalize month ให้ตรงกันก่อนเข้า processData
        // =========================
    
        let minDate: any = null;
        let maxLength: number | null = null;
    
        resultFilterData?.forEach((entry: any) => {
            entry?.data?.forEach((item: any) => {
                item?.month?.forEach((m: string) => {
                    const d = dayjs(m, "DD/MM/YYYY");
                    if (!minDate || d.isBefore(minDate)) {
                        minDate = d;
                    }
                });
                if(item?.value && Array.isArray(item.value) && (maxLength === null || item?.value?.length > maxLength)) {
                    maxLength = item.value.length;
                }
            });
        });
    
        // =========================
        // filter month (ยังใช้ได้เหมือนเดิม)
        // =========================
        const month_date_format = month
          ? dayjs(month).format("DD/MM/YYYY")
          : dayjs().startOf('month').format("DD/MM/YYYY"); //baseMonths[0];
    
        const fromStr = month
          ? dayjs(month_date_format, ["DD/MM/YYYY", "YYYY-MM-DD"])
            .startOf("day")
            .format("DD/MM/YYYY")
          : dayjs().startOf('month').format("DD/MM/YYYY"); //baseMonths[0];
    
        const filtered = filterByMonthFrom(resultFilterData ?? [], fromStr);
        
        //render data to chart
        const flatData = filtered?.flatMap((d: any) => d?.data);

        const { months, areas, seriesData } = processDataX(flatData);

        const chartDataX = {
            labels: months,
            datasets: areas?.map((areaId: any, index: number) => {
                const areaData = areaMaster?.data.find(
                    (d: any) => d.name === areaId?.name,
                );

                return {
                    label: `${areaId?.name}`,
                    data: seriesData[index],
                    borderColor: areaData?.color,
                    backgroundColor: areaData?.color,
                    fill: false,
                    isEntry: areaData?.entry_exit_id == 1,
                };
            }),
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

    const handleFieldSearch = () => {
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
                const areaData = areaMaster?.find((d: any) => d.name === areaId?.name);
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

    // Chart options
    const mediumTermOption: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: "top",
                labels: {
                    usePointStyle: true,
                    // pointStyle: 'circle',
                    font: {
                        size: 12,
                        weight: "bold",
                    },
                    boxWidth: 20,
                    boxHeight: 12,
                    padding: 18,
                    generateLabels: (chart: any) => {
                        return chart?.data?.datasets?.map((dataset: any, index: any) => ({
                            text: dataset.label,
                            fillStyle: dataset.backgroundColor,
                            strokeStyle: dataset.borderColor,
                            hidden: !chart.isDatasetVisible(index),
                            pointStyle: dataset.isEntry ? 'rect' : 'circle',
                        }));
                    }
                },
                onClick: null
            },
            title: {
                display: true,
                color: '#58585A',
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
            },
            tooltip: {
                // mode: 'index',
                mode: 'nearest',
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
                    // label: function (tooltipItem: any, data: any) {
                    //     return (tooltipItem?.raw === 0 ? null : tooltipItem?.dataset?.label)
                    // },
                    // afterLabel: function (tooltipItem: any, data: any) {
                    //     return (tooltipItem?.raw === 0 ? null : formatNumberThreeDecimal(tooltipItem?.raw))
                    // },
                    label: (tooltipItem: any) => {
                        const labelName = tooltipItem?.dataset?.label;
                        const value = formatNumberThreeDecimal(tooltipItem.raw);
                        return `${labelName} : ${value}`;
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
                // Adjust font size for larger tooltip
                bodyFont: {
                    size: 15,  // Adjust font size for body text
                    family: 'Tahoma', // Optional: Change font family
                    weight: 'normal', // Optional: Change font weight
                },
                titleFont: {
                    size: 14, // Adjust title font size if you decide to enable title
                    family: 'Tahoma',
                    weight: 'bold',
                },
                // Optional: Adjust corner radius and shadow for tooltip appearance
                cornerRadius: 10,  // Make the corners of the tooltip rounded
                boxWidth: 50,  // Increase box width of the tooltip icon
                // Add stroke (border) to the tooltip
                borderColor: 'rgba(0, 0, 0, 0.2)', // Set border color (a soft black)
                borderWidth: 1, // Set border width (adjust to your preference)
                // Optionally adjust the border radius for rounded corners
                borderRadius: 5,
                // Add shadow to the tooltip as well (if you want both)
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
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
        animation: {
            onSuccess: () => {
                const chart = ChartJS.getChart('MediumtermChart');
                if (chart) {
                    const { legend }: any = chart;
                    legend.top = -8;
                }
            },
        }
    };

    let mediumTermEachOption: any = {
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
    
    useEffect(() => {
        if(key > 0){
            handleFetch(null, '', '', []);
        }
    }, [key])
    

    return (
        <Dialog open={open} onClose={onClose} className="relative z-20">
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

                                    setSrchArea([]);
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
                            {
                                isAll && filterData && (
                                    <div className="w-full overflow-x-auto">
                                        <div className="w-[4500px] h-[550px]">
                                            <Line data={filterData} options={mediumTermOption} />
                                        </div>
                                    </div>
                                )
                            }

                            {
                                !isAll && filterData && (
                                    isFilter ? (
                                        <div className="max-w-[4500px] w-full h-full">
                                            <Line id="AllmediumLine" data={filterData} options={mediumTermEachOption} />
                                        </div>
                                    ) : (
                                        <ChartMedEachShipper dataChart={filterData} />
                                    )
                                )
                            }
                        </div>

                        <div className="w-full flex justify-end pt-2 sticky bottom-0 bg-white p-2">
                            <button
                                onClick={onClose}
                                className="w-40 h-10 font-bold bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                            >
                                {`Close`}
                            </button>
                        </div>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    )
}

export default ModalFullViewMedium;