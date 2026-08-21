import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import {
  dayDiffInclusive,
  filterByDayFrom,
  filterByMonthFrom,
  formatDate,
  formatDay,
  formatMonth,
  formatMonthX,
  formatNumber,
  formatNumberThreeDecimal,
  formatSearchDate,
  generateDaysFromFutureMonth,
  generateNext24Months,
  getEarliestFirstDay,
  getLatestFirstDay,
  keepLatestPerGroupByPeriod,
  mergeDataByGroupMedTermVersionTwo,
  mergeDataSetsByLabel,
  monthDiffInclusive,
  padFrontWithNulls,
  trimEdgeZerosToNull,
} from "@/utils/generalFormatter";
import { Line } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-datalabels";
import ChartDataLabels from "chartjs-plugin-datalabels";
import ChartMedEachShipper from "./chartMedTermEachShipper";
import ChartShortEachShipper from "./chartShortTermEachShipper";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import { InputSearch } from "@/components/other/SearchForm";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import MonthYearPickaSearch from "@/components/library/dateRang/monthYearPicker";
import dayjs from "dayjs";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin,
  ChartDataLabels,
);

type FormExampleProps = {
  data?: any;
  dataOriginal?: any;
  open?: boolean;
  isAll?: boolean;
  mode?: any;
  shipperGroupData?: any;
  entryExitMaster?: any;
  areaMaster?: any;
  onClose: () => void;
  filterList?: any;
};

const ModalFullView: React.FC<FormExampleProps> = ({
  open,
  onClose,
  data,
  dataOriginal,
  isAll,
  shipperGroupData,
  entryExitMaster,
  areaMaster,
  mode,
  filterList,
}) => {
  // ############### PROCESS DATA MEDIUM TERM EACH ###############
  // const [filterDataMedEach, setFilterDataMedEach] = useState<any>();
  const [isFilter, setIsFilter] = useState<any>(false);
  const [transerData, settranserData] = useState<any>();

  // ############### Doughnut SEARCH ###############
  const [key, setKey] = useState(0);
  const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
  const [srchShipper, setSrchShipper] = useState("");
  const [srchEntryExit, setSrchEntryExit] = useState("");
  const [srchArea, setSrchArea] = useState<any>([]);
  const [filterData, setFilterData] = useState<any>();
  const [dataAll, setdataAll] = useState<any>();
  const [optionArea, setoptionArea] = useState<any>([]);

  useEffect(() => {
    if (open) {
      const dataLoad: any = data?.data;
      if (
        filterList &&
        (filterList?.month ||
          filterList?.shipper ||
          filterList?.entryExit ||
          filterList?.area?.length > 0)
      ) {
        if (filterList?.month) {
          setSrchStartDate(filterList?.month);
        } else {
          setSrchStartDate(null);
        }
        //================================================
        if (filterList?.shipper) {
          setSrchShipper(filterList?.shipper);
        } else {
          setSrchShipper("");
        }
        //================================================
        if (filterList?.entryExit) {
          setSrchEntryExit(filterList?.entryExit);
        } else {
          setSrchEntryExit("");
        }
        //================================================
        if (filterList?.area) {
          setSrchArea(filterList?.area);
        } else {
          setSrchArea([]);
        }
      } else {
        const { months, areas, seriesData } = processData(dataLoad);
        let chartData: any;

        chartData = {
          labels: months,
          datasets: areas?.map((areaId: any, index) => {
            const areaData = areaMaster?.find(
              (d: any) => d.name === areaId?.name,
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

        // settranserData(chartData);
      }
      const filterArea = areaMaster?.filter((item: any) =>
        dataLoad?.some((d: any) => d?.area?.id === item?.id),
      );
      setoptionArea(filterArea);
      setFilterData(data);
      setdataAll(data);
    }
  }, [mode, data, open]);

  const processData = (data: any) => {
    if (mode == "Long term" || mode == "Medium term") {
      // รายเดือน
      const months = generateNext24Months(srchStartDate);
      const areas = Array.from(
        new Map(
          (data || [])
            .flatMap((d: any) =>
              d?.area ? [{ id: d.area.id, name: d.area.name }] : [],
            ) // Safeguard for null/undefined data and area
            ?.map((area: any) => [area.id, area]), // Use id as the key in the Map
        ).values(), // Get unique area objects
      );

      // const areas = Array.from(new Set(data.flatMap((d:any) => d.area))); // Unique areas
      const seriesData = areas?.map((areaId: any) => {
        return months?.map((month) => {
          const totalValue = data
            ?.filter((d: any) => d.area.id === areaId?.id)
            ?.reduce((sum: any, current: any) => {
              const monthIndex = current?.month?.findIndex(
                (m: any) => formatMonth(m) === month,
              );
              if (monthIndex >= 0) {
                return sum + current?.value[monthIndex];
              }
              return sum;
            }, 0);
          return totalValue;
        });
      });

      return {
        months,
        areas,
        seriesData,
      };
    } else {
      const months = generateDaysFromFutureMonth(srchStartDate);

      const areas = Array.from(
        new Map(
          (data || [])
            .flatMap((d: any) =>
              d?.area ? [{ id: d.area.id, name: d.area.name }] : [],
            ) // Safeguard for null/undefined data and area
            ?.map((area: any) => [area.id, area]), // Use id as the key in the Map
        ).values(), // Get unique area objects
      );

      const seriesData = areas?.map((areaId: any) => {
        return months?.map((month) => {
          const totalValue = data
            .filter((d: any) => d.area.id === areaId?.id)
            .reduce((sum: any, current: any) => {
              const monthIndex = current.day.findIndex(
                (m: any) => formatDay(m) === month,
              );
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
        seriesData,
      };
    }
  };

  function handleFieldSearchMedTermOld() {
    let dataLoad: any = data;

    //filter item => entry_exit
    const dataforFilterEntryExit1 = {
      ...dataLoad,
      data: (dataLoad?.data || []).filter((item: any) => {
        return srchEntryExit ? item?.entry_exit_id == srchEntryExit : true;
      }),
    };

    // filter item => area
    const dataforFilterArea = {
      ...dataforFilterEntryExit1,
      data: (dataforFilterEntryExit1?.data || []).filter((item: any) => {
        return srchArea?.length ? srchArea.includes(item?.area?.name) : true;
      }),
    };

    // trans data => date range
    const processData = (data: any, month: any) => {
      let months = formatMonthX(data?.[0]?.month);

      months = generateNext24Months(month);

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
        return months.map((month: any) => {
          const totalValue = data
            .filter((d: any) => d.area.id === areaId?.id)
            .reduce((sum: any, current: any) => {
              const monthIndex = current.month.findIndex(
                (m: any) => formatMonth(m) === month,
              );
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
        seriesData,
      };
    };

    const { months, areas, seriesData } = processData(
      dataforFilterArea?.data?.flatMap((d: any) => d),
      srchStartDate,
    );

    const chartDataX = {
      labels: months,
      datasets: areas?.map((areaId: any, index) => {
        const areaData = areaMaster?.find(
          (d: any) => d.name === areaId?.name,
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

    // filter non 0
    const newData = {
      ...chartDataX,
      datasets: chartDataX.datasets.map((ds: any) => ({
        ...ds,
        data: ds.data, //trimEdgeZerosToNull(ds.data),
      })),
    };

    setFilterData(newData);
  }

  function handleFieldSearchShortTermOld() {
    let dataLoad: any = data;

    //filter item => entry_exit
    const dataforFilterEntryExit = {
      ...dataLoad,
      data: (dataLoad?.data || []).filter((item: any) => {
        return srchEntryExit ? item?.entry_exit_id == srchEntryExit : true;
      }),
    };

    // filter item => area
    const dataforFilterArea = {
      ...dataforFilterEntryExit,
      data: (dataforFilterEntryExit?.data || []).filter((item: any) => {
        return srchArea?.length ? srchArea.includes(item?.area?.name) : true;
      }),
    };

    const processNOW = (data: any, date: any) => {
      const earliestDay: any = getEarliestFirstDay(data); // หาวันที่น้อยที่สุด จะได้เอามาทำ label
      const lastestDay: any = getLatestFirstDay(data); // หาวันที่มากที่สุด จะได้เอามาทำ label
      const month_count = monthDiffInclusive(earliestDay, lastestDay); // หาจำนวนเดือนระหว่างวันที่

      // const months = Array.from(new Set(data.flatMap((d: any) => d.day.map(formatDay)))); // Unique months
      // const months = generateDaysFromFutureMonth(srchStartDate ? srchStartDate : dayjs(earliestDay, 'DD/MM/YYYY').toDate());

      // เพิ่ม srchStartDateMain ส่งเข้าไปด้วย ถ้ามี --> เอามาจาก filter chart หลัก
      // const months = generateDaysFromFutureMonth(srchStartDate ? srchStartDate : dayjs(earliestDay, 'DD/MM/YYYY').toDate(), month_count);
      const months = generateDaysFromFutureMonth(
        date ? date : dayjs(earliestDay, "DD/MM/YYYY").toDate(),
        month_count,
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
          const totalValue = data
            ?.filter((d: any) => d.area.id === areaId?.id)
            ?.reduce((sum: any, current: any) => {
              const monthIndex = current.day.findIndex(
                (m: any) => formatDay(m) === month,
              );
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
        seriesData,
      };
    };

    const { months, areas, seriesData } = processNOW(
      dataforFilterArea?.data,
      srchStartDate,
    );
    const chartDataX = {
      labels: months,
      datasets: areas?.map((areaId: any, index) => {
        const areaData = areaMaster?.find(
          (d: any) => d.name === areaId?.name,
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
        data: ds.data, //trimEdgeZerosToNull(ds.data),
      })),
    };

    setFilterData(newData);
  }

  function handleFieldSearchMedTerm({dataStructureForChartMedEachShipper = true}: {dataStructureForChartMedEachShipper?: boolean}) {
      // =========================
      // filter shipper
      // =========================
      const dataforFilterShipper: any = dataOriginal?.filter((item: any) => {
        return srchShipper ? item?.group?.id == srchShipper : true;
      });

      // =========================
      // filter entry_exit
      // =========================
      const dataforFilterEntryExit = dataforFilterShipper?.map((item: any) => {
        const filterInnerData =
          item.data?.filter((innerFind: any) => {
            return srchEntryExit
              ? innerFind?.entry_exit_id == srchEntryExit
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
        if (srchArea && srchArea.length > 0) {
          const filterInnerData = item?.data?.filter((innerFind: any) =>
            srchArea.includes(innerFind?.area?.name),
          );

          return {
            ...item,
            data: filterInnerData,
          };
        }
        return { ...item };
      });

      // =========================
      // filter month (ยังใช้ได้เหมือนเดิม)
      // =========================
      const month_date_format = srchStartDate
        ? dayjs(srchStartDate).format("DD/MM/YYYY")
        : dayjs().startOf('month').format("DD/MM/YYYY");

      const fromStr = srchStartDate
        ? dayjs(month_date_format, ["DD/MM/YYYY", "YYYY-MM-DD"])
          .startOf("day")
          .format("DD/MM/YYYY")
        : dayjs().startOf('month').format("DD/MM/YYYY");

      const filtered = filterByMonthFrom(resultFilterData ?? [], fromStr);

      // 🔥 สร้าง 24 เดือน
      const startDate = dayjs(fromStr, "DD/MM/YYYY");

      const fullMonths = Array.from({ length: 24 }, (_, i) =>
        startDate.add(i, "month").format("DD/MM/YYYY"),
      );

      // 🔥 เติมเดือนอย่างเดียว (ไม่แตะ value logic เดิม)
      const finalFiltered = filtered.map((entry: any) => ({
        ...entry,
        data: entry.data.map((item: any) => {
          const currentLen = item.value.length;

          // 🔥 pad value ด้วย null ให้ยาวเท่ากับ 24
          const paddedValue = [
            ...item.value,
            ...Array(Math.max(0, 24 - currentLen)).fill(null),
          ];

          return {
            ...item,
            month: fullMonths,
            value: paddedValue, // ❗ ไม่ไปยุ่งของเดิม แค่ต่อ null
          };
        }),
      }));

      const nextFilterDataMedTermEach = finalFiltered.map((entry: any) => ({
        ...entry,
        data: entry.data.map((item: any) => ({
          ...item,
          month: [...item.month],
          value: [...item.value],
        })),
      }));
      
      const filter_length_ = nextFilterDataMedTermEach.filter(
          (item: any) => item?.data?.length > 0 && (item?.group?.id_name == data?.group?.id_name || item?.group?.id == data?.group?.id)
      );


      if(filter_length_.length > 0){
        const dataChart = filter_length_[0];

        if(dataStructureForChartMedEachShipper != true){
          let labels;
          if (srchStartDate) {
            labels = generateNext24Months(srchStartDate);
          } else {
            labels = generateNext24Months(dayjs().startOf('month').toDate());
          }
  
          const datasets = (dataChart?.data || [])?.map((item: any) => {
            // const areaData = areaMaster?.data.find((d: any) => d.name === item?.name);
            return {
              // label: item.nomination_point,
              label: item?.area?.name,
              data: item?.value, // Values
              borderColor: item?.area?.color, // Line color
              // backgroundColor: item.area.color + "66", // Transparent color
              backgroundColor: item?.area?.color, // Transparent color
              fill: false, // Do not fill the area under the line
              tension: 0, // Curve the line slightly
              isEntry: item?.entry_exit_id == 1 ? true : false,
              spanGaps: false, // 🔥 ตัวนี้สำคัญ
            };
          });
          // ถ้า datasets.label ซ้ำกัน ให้รวม datasets.data ที่ index เดียวกัน แล้วปรับ obj ที่ซ้ำให้เหลือแค่อันเดียว
          const result_datasets = mergeDataSetsByLabel(datasets);
  
          // Chart data configuration
          const chartData = {
            labels: labels, // Use formatted month labels
            datasets: result_datasets,
          };
  
  
          setFilterData(chartData);
        }
        else{
          setFilterData(dataChart);
        }
      }
  }

  const processShortTermData = (data: any, dataAll?: any) => {
    const latestDay: any = getLatestFirstDay(dataAll);
  
    // ถ้าเลือกเดือน ให้เริ่มจากเดือนที่เลือก
    // ถ้ายังไม่เลือก ให้เริ่มจากเดือนปัจจุบัน
    const startDate = srchStartDate
      ? dayjs(srchStartDate).startOf("month")
      : dayjs().startOf("month");
  
    const latestDate = latestDay
      ? dayjs(latestDay, "DD/MM/YYYY").startOf("month")
      : startDate;
  
    // ถ้าข้อมูลล่าสุดเก่ากว่าเดือนเริ่มต้น ให้แสดงอย่างน้อยเดือนเริ่มต้น 1 เดือน
    const endDate = latestDate.isBefore(startDate, "month")
      ? startDate
      : latestDate;
  
    const month_count = monthDiffInclusive(
      startDate.format("DD/MM/YYYY"),
      endDate.format("DD/MM/YYYY"),
    );
  
    const months = generateDaysFromFutureMonth(
      startDate.toDate(),
      // month_count,
    );
  
    const areas = Array.from(
      new Map(
        (data || [])
          .flatMap((d: any) =>
            d?.area
              ? [
                  {
                    id: d?.area?.id,
                    name: d?.area?.name,
                  },
                ]
              : [],
          )
          .map((area: any) => [area.id, area]),
      ).values(),
    );
  
    const seriesData = areas?.map((areaId: any) => {
      return months?.map((month) => {
        let hasValue = false;
  
        const totalValue = data
          ?.filter((d: any) => d?.area?.id === areaId?.id)
          ?.reduce((sum: number, current: any) => {
            const monthIndex = current?.day?.findIndex(
              (m: any) => formatDay(m) === month,
            );
  
            if (monthIndex >= 0) {
              const val = current?.value?.[monthIndex];
  
              if (val != null) {
                hasValue = true;
                return sum + Number(val);
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

  function handleFieldSearchShortTerm({dataStructureForChartShortEachShipper = true}: {dataStructureForChartShortEachShipper?: boolean}) {
    const dataforFilterShipper: any = dataOriginal?.filter((item: any) => {
      return srchShipper ? item?.group?.id == srchShipper : true;
    });

    const dataforFilterEntryExit = dataforFilterShipper?.map((item: any) => {
      const filterInnerData =
        item.data?.filter((innerFind: any) => {
          const entryExitMatch = srchEntryExit
            ? innerFind?.entry_exit_id == srchEntryExit
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

    const dataforFilterArea = dataforFilterEntryExit?.map((item: any) => {
      if (srchArea && srchArea?.length > 0) {
        const filterInnerData = item?.data?.filter((innerFind: any) => {
          let checked =
            srchArea?.find(
              (itemFindSub: any) => itemFindSub == innerFind?.area?.name,
            ) || false;
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

    const month_date_format = srchStartDate
      ? dayjs(srchStartDate).format("DD/MM/YYYY")
      : dayjs().startOf("month").format("DD/MM/YYYY");
    const fromStr = srchStartDate
      ? dayjs(month_date_format, ["DD/MM/YYYY", "YYYY-MM-DD"])
          .startOf("day")
          .format("DD/MM/YYYY")
      : dayjs().startOf("month").format("DD/MM/YYYY");

    // กรองเดือนของ each
    // กรอง resultFilterData.data.month ตั้งแต่เดือนที่เท่ากับ srchMonth เป็นต้นไป
    // แล้วก็ดู index ของ month กับ value ถ้ากรอง month ที่ index ไหนออก ก็ต้องกรอง value ที่ index นั้น ๆ
    // const filtered = filterByMonthFrom(resultFilterData, dayjs(srchMonth).format('DD/MM/YYYY')); // เดิมโรงงาน
    const filtered = filterByDayFrom(resultFilterData ?? [], fromStr);

    const filter_length_ = resultFilterData?.filter((item: any) => item?.data?.length > 0 && (item?.group?.id_name == data?.group?.id_name || item?.group?.id == data?.group?.id))
    
    if (filter_length_.length > 0) {
      const dataChart = filter_length_[0];

      if(dataStructureForChartShortEachShipper != true){
        const { months, areas, seriesData } = processShortTermData(
          dataChart?.data,
          dataOriginal?.flatMap((d: any) => d?.data),
        );
      
        const areaInHere = dataChart?.data?.map((item: any) => item?.area);
      
        const chartData = {
          labels: months,
          datasets: areas?.map((areaId: any, index: number) => {
            const areaData = areaInHere?.find(
              (d: any) => d.id === areaId?.id,
            );
      
            return {
              label: areaId?.name,
              data: seriesData[index],
              borderColor: areaData?.color,
              backgroundColor: areaData?.color,
              fill: false,
              isEntry: areaData?.entry_exit_id == 1,
              spanGaps: false,
            };
          }),
        };


        setFilterData(chartData);
      }
      else{
        setFilterData(dataChart);
      }
    } 
  }

  const handleFieldSearchX = () => {
    if (mode == "Medium term") {
      handleFieldSearchMedTerm({dataStructureForChartMedEachShipper: false})
    } else if (mode == "Short term") {
      handleFieldSearchShortTerm({dataStructureForChartShortEachShipper: false})
    }

    setIsFilter(true);
  };

  // update handleFieldSearch to support this data_full_view
  // srchStartDate == Thu Feb 06 2025 00:00:00 GMT+0700 (Indochina Time) ----> use for filter data_full_view.labels that >= srchStartDate
  // srchEntryExit == 1 ----> use for filter data_full_view.datasets.isEntry == true if srchEntryExit 2 use for filter data_full_view.datasets.isEntry == false
  // srchArea == Y ----> use for filter data_full_view.datasets.label == srchArea

  const handleReset = () => {
    setSrchStartDate(null);
    setSrchArea([]);
    setSrchShipper("");
    setSrchEntryExit("");
    setFilterData(data);
    setIsFilter(false);
    // setFilteredDataTable(dataTable);
    setKey((prevKey) => prevKey + 1);
  };

  // Chart options
  const optionsAllmedium: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          usePointStyle: true,
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
              pointStyle: dataset.isEntry ? "rect" : "circle",
            }));
          },
        },
        zIndex: 10,
      },
      title: {
        display: true,
        color: "#58585A",
        // text: 'Total Supply (MMBTU)',
        text: "Total Energy (MMBTU/D)", // v1.0.90 เปลี่ยนหัว Graph จาก "Total Supply (MMBTU)" เป็น "Total Energy (MMBTU/D)" https://app.clickup.com/t/86ert2k26
        font: {
          size: 15,
          weight: "normal",
        },
        position: "top",
        align: "start",
        zIndex: 5,
        padding: {
          top: 0,
          bottom: -20,
        },
      },
      datalabels: {
        display: false,
      },
      tooltip: {
        // mode: 'index',
        mode: "nearest",
        enabled: true,
        intersect: false,
        backgroundColor: "white",
        title: false,
        titleColor: "#767676",
        bodyColor: "#767676",
        padding: 5,
        boxPadding: 5,
        usePointStyle: true,
        callbacks: {
          title: () => null,
          // label: function (tooltipItem: any, data: any) {
          //     return (tooltipItem?.raw === 0 ? null : tooltipItem?.dataset?.label)
          // },
          // afterLabel: function (tooltipItem: any, data: any) {
          //     return (tooltipItem?.raw === 0 ? null : formatNumber(tooltipItem?.raw))
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
            };
          },
        },
        // Adjust font size for larger tooltip
        bodyFont: {
          size: 15, // Adjust font size for body text
          family: "Tahoma", // Optional: Change font family
          weight: "normal", // Optional: Change font weight
        },
        titleFont: {
          size: 14, // Adjust title font size if you decide to enable title
          family: "Tahoma",
          weight: "bold",
        },
        cornerRadius: 10, // Make the corners of the tooltip rounded
        boxWidth: 50, // Increase box width of the tooltip icon
        borderColor: "rgba(0, 0, 0, 0.2)", // Set border color (a soft black)
        borderWidth: 1, // Set border width (adjust to your preference)
        borderRadius: 5,
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      },
    },
    scales: {
      x: {
        title: {
          display: false,
          text: "Month",
        },
      },
      y: {
        title: {
          display: false,
          text: "Value (MMBtud)",
        },
        beginAtZero: true,
      },
    },
    animation: {
      onSuccess: () => {
        const chart = ChartJS.getChart("AllmediumLine");
        if (chart) {
          const { legend }: any = chart;
          legend.top = -8;
        }
      },
    },
  };

  let shortTermOption: any = {
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
              pointStyle: dataset.isEntry ? "rect" : "circle",
            }));
          },
        },
      },
      title: {
        display: true,
        // text: 'Total Supply (MMBTU)',
        text: "Total Energy (MMBTU/D)", // v1.0.90 เปลี่ยนหัว Graph จาก "Total Supply (MMBTU)" เป็น "Total Energy (MMBTU/D)" https://app.clickup.com/t/86ert2k26
        align: "start",
        position: "top",
        font: {
          size: 16,
          // weight: 'normal',
        },
        padding: {
          top: 5,
          bottom: 1,
        },
        color: "#58585A",
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "white",
        titleColor: "black",
        bodyColor: "black",
        borderColor: "#cfcfd1",
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
          text: "Month",
        },
        ticks: {
          autoSkip: false, // สั่งให้โชว์ Label ทุกอัน ไม่ต้องข้าม
          maxRotation: 45, // (ทางเลือก) ถ้ามันเบียด ให้เอียง 45 องศา
          minRotation: 0,
          font: {
            size: 11, // (ทางเลือก) ปรับขนาดฟอนต์ให้เล็กลงหน่อยถ้าวันเยอะ
          },
        },
      },
      y: {
        title: {
          display: false,
          text: "Value",
        },
        beginAtZero: true,
      },
    },
  };

  let shortTermEachOption: any = {
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
              pointStyle: dataset.isEntry ? "rect" : "circle",
            }));
          },
        },
      },
      title: {
        display: true,
        // text: 'Total Supply (MMBTU)',
        text: "Total Energy (MMBTU/D)", // v1.0.90 เปลี่ยนหัว Graph จาก "Total Supply (MMBTU)" เป็น "Total Energy (MMBTU/D)" https://app.clickup.com/t/86ert2k26
        align: "start",
        position: "top",
        font: {
          size: 16,
          // weight: 'normal',
        },
        padding: {
          top: 5,
          bottom: 1,
        },
        color: "#58585A",
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "white",
        titleColor: "black",
        bodyColor: "black",
        borderColor: "#cfcfd1",
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
          text: "Day",
        },
        ticks: {
          autoSkip: false, // สั่งให้โชว์ Label ทุกอัน ไม่ต้องข้าม
          maxRotation: 45, // (ทางเลือก) ถ้ามันเบียด ให้เอียง 45 องศา
          minRotation: 0,
          font: {
            size: 11, // (ทางเลือก) ปรับขนาดฟอนต์ให้เล็กลงหน่อยถ้าวันเยอะ
          },
        },
      },
      y: {
        title: {
          display: false,
          text: "Value (MMBtud)",
        },
        beginAtZero: true,
      },
    },
  };

  const handleClose = () => {
    setIsFilter(false);

    setSrchStartDate(null);
    setSrchShipper("");
    setSrchEntryExit("");
    setSrchArea("");

    onClose();
  };

  useEffect(() => {
    if (mode == "Medium term") {
      handleFieldSearchMedTerm({})
    }
    else if (mode == "Short term") {
      handleFieldSearchShortTerm({})
    }
  }, [key]);

  console.log(">>> filterData", filterData)

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
                label={"Month"}
                placeHolder={"Select Month"}
                allowClear
                // max={endOfMonth(new Date())} // เลือกได้สูงสุดคือ เดือนปีปัจจุบัน นับจากเดือน ที่ close ล่าสุด
                // customWidth={200}
                // customHeight={35}
                onChange={(e: any) => setSrchStartDate(e || null)}
                valueShow={srchStartDate}
              />

              {isAll && (
                <InputSearch
                  id="searchShipper"
                  label="Shipper"
                  type="select"
                  value={srchShipper}
                  onChange={(e) => setSrchShipper(e.target.value)}
                  options={shipperGroupData?.data?.map((item: any) => ({
                    value: item.id,
                    label: item.name,
                  }))}
                />
              )}

              <InputSearch
                id="searchEntryExit"
                label="Entry/Exit"
                type="select"
                value={srchEntryExit}
                onChange={(e) => {
                  if (e.target.value) {
                    setSrchEntryExit(e.target.value);
                  }else{
                    setSrchEntryExit("")
                  }
                  setSrchArea([]);
                }}
                options={entryExitMaster?.data?.map((item: any) => ({
                  value: item.id,
                  label: item.name,
                }))}
              />

              <InputSearch
                id="searchArea"
                label="Area"
                type="select-multi-checkbox"
                value={srchArea}
                onChange={(e) => {
                  setSrchArea(e.target.value);
                }}
                options={optionArea
                  ?.filter(
                    (item: any) =>
                      srchEntryExit === "" ||
                      item?.entry_exit_id === srchEntryExit,
                  )
                  .map((item: any) => ({
                    value: item.name,
                    label: item.name,
                  }))}
              />

              <BtnSearch handleFieldSearch={handleFieldSearchX} />
              <BtnReset handleReset={handleReset} />
            </aside>

            <div className="w-full overflow-x-auto h-auto">
              {/* ------------ MEDIUM TERM ------------ */}
              {isAll && mode === "Medium term" && filterData && (
                <div className="max-w-[4500px] w-full h-[65dvh]">
                  <Line
                    id="AllmediumLine"
                    data={filterData}
                    options={optionsAllmedium}
                  />
                </div>
              )}

              {!isAll &&
                mode === "Medium term" &&
                filterData &&
                (isFilter ? (
                  <div className="max-w-[4500px] w-full h-[65dvh]">
                    <Line
                      id="AllmediumLine"
                      data={filterData}
                      options={optionsAllmedium}
                    />
                  </div>
                ) : (
                  <ChartMedEachShipper
                    dataChart={filterData}
                    mode="view"
                    areaMaster={areaMaster}
                    srchStartYearMedTerm={srchStartDate}
                    dataAll={[dataAll]}
                  />
                ))}

              {/* ------------ SHORT TERM ------------ */}
              {isAll && mode === "Short term" && filterData && (
                <div className="w-full overflow-x-auto">
                  <div className="w-[7500px] h-[65dvh] p-2">
                    <Line data={filterData} options={shortTermOption} />
                  </div>
                </div>
              )}

              {!isAll &&
                mode === "Short term" &&
                filterData &&
                (isFilter ? (
                  <div className="w-[7500px] h-[65dvh] p-2">
                    <Line data={filterData} options={shortTermEachOption} />
                  </div>
                ) : (
                  <ChartShortEachShipper
                    dataChart={filterData}
                    areaMaster={areaMaster?.data}
                    dataAll={[dataAll]}
                    mode={"view"}
                  />
                ))}
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

export default ModalFullView;
