import { useEffect } from "react";
import React, { useState } from "react";
import { flushSync } from "react-dom";
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
import { InputSearch } from "@/components/other/SearchForm";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import BtnGeneral from "@/components/other/btnGeneral";
import { useAppDispatch } from "@/utils/store/store";
import { fetchShipperGroup } from "@/utils/store/slices/shipperGroupSlice";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import { fetchEntryExit } from "@/utils/store/slices/entryExitSlice";
import annotationPlugin from "chartjs-plugin-datalabels";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  exportToExcel,
  filterByMonthFrom,
  formatMonth,
  formatMonthX,
  formatMonthY,
  formatNumberThreeDecimal,
  generateDaysFromFutureMonth,
  generateNext24Months,
  getEarliestFirstDay,
  getLatestFirstDay,
  keepLatestPerGroupByPeriod,
  mergeDataByGroupMedTermVersionTwo,
  monthDiffInclusive,
  trimEdgeZerosToNull,
} from "@/utils/generalFormatter";
import ModalFullView from "./modalFullView";
import NodataTable from "@/components/other/nodataTable";
import MonthYearPickaSearch from "@/components/library/dateRang/monthYearPicker";
import getUserValue from "@/utils/getuserValue";
import ModalFullViewMedium from "./modalFullview_MEDIUM";
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

interface TableProps {
  dataChart?: any;
  userPermission?: any;
  setFilterDataMedTerm?: any;
  filterDataMedTerm?: any;
  filterDataMedTermEach?: any;
  setFilterDataMedTermEach?: any;
  dataMedTermEachGroup?: any;
  areaMasterDataFilter?: any;
  setSrchStartYearMedTerm?: any;
  srchStartYearMedTerm?: any;
  setfilterList?: any;
  filterList?: any;
}

const ChartMediumTermAll: React.FC<TableProps> = ({
  dataChart,
  userPermission,
  setFilterDataMedTerm,
  filterDataMedTerm,
  filterDataMedTermEach,
  setFilterDataMedTermEach,
  dataMedTermEachGroup,
  areaMasterDataFilter,
  setSrchStartYearMedTerm,
  srchStartYearMedTerm,
  setfilterList,
  filterList,
}) => {
  const userDT: any = getUserValue();
  // ############### REDUX DATA ###############
  const { shipperGroupData, areaMaster, entryExitMaster } = useFetchMasters();
  const [forceRefetch, setForceRefetch] = useState(true);
  const dispatch = useAppDispatch();

  // ############### Doughnut SEARCH ###############
  const [key, setKey] = useState(0);
  const [srchStartYear, setSrchStartYear] = useState<any>("");
  const [srchShipper, setSrchShipper] = useState("");
  const [srchEntryExit, setSrchEntryExit] = useState("");
  const [srchArea, setSrchArea] = useState<any>([]);

  // for full view
  const [openView, setOpenView] = useState<any>(false);
  const [isAll, setIsAll] = useState<any>(false);
  const [modeView, setModeView] = useState<any>();
  const [dataView, setDataView] = useState<any>();
  const [dataOriginalView, setdataOriginalView] = useState<any>();

  const [originalDataChart, setoriginalDataChart] = useState<any>();
  const [genarateDataChart, setgenarateDataChart] = useState<any>();

  const [srchMonth, setSrchMonth] = useState<any>("");

  useEffect(() => {
    // setFilterDataMedTermEach([]);
    const dataFullview: any = geranateFullViewX();
    const { months, areas, seriesData } = processData(dataFullview?.data);
    let chartData: any;

    chartData = {
      labels: months,
      datasets: areas?.map((areaId: any, index) => {
        const areaData = areaMaster?.data.find(
          (d: any) => d.name === areaId?.name,
        );
        return {
          label: `${areaId?.name}`,
          data: seriesData[index],
          borderColor: areaData?.color,
          backgroundColor: areaData?.color,
          fill: false,
          isEntry: areaData?.entry_exit_id == 1 ? true : false,
          spanGaps: false, // ❗สำคัญ
        };
      }),
    };

    const newData = {
      ...chartData,
      datasets: chartData.datasets.map((ds: any) => ({
        ...ds,
        data: ds.data, //trimEdgeZerosToNull(ds.data),
      })),
    };

    setgenarateDataChart(newData);
    setoriginalDataChart(newData);
    queueMicrotask(() => {
      handleFieldSearchX();
    });
  }, [dataChart, key]);

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
    if (userDT?.account_manage?.[0]?.user_type_id == 3) {
      setSrchShipper(userDT?.account_manage?.[0]?.group?.id);
    }
  }, []);

  const geranateFullView = () => {
    const areaMap = new Map<string, any>();

    const getEarliestMonth = (data: any[]) => {
      let min: any = null;
      data?.forEach((item: any) => {
        item?.data?.forEach((d: any) => {
          d?.month?.forEach((m: string) => {
            const date = dayjs(m, "DD/MM/YYYY");
            if (!min || date.isBefore(min)) {
              min = date;
            }
          });
        });
      });
      return min ? min.format("DD/MM/YYYY") : null;
    };

    // 🔥 1. หา earliest month จาก data ทั้งหมด
    const minMonth = getEarliestMonth(dataChart); // ใช้ function ที่มึงมี

    const baseMonths = Array.from({ length: 24 }, (_, i) =>
      dayjs(minMonth, "DD/MM/YYYY").add(i, "month").format("DD/MM/YYYY"),
    );

    dataChart?.forEach((entry: any) => {
      entry?.data.forEach((item: any) => {
        const key = item?.area?.name;

        // 🔥 map month → value
        const monthMap = new Map<string, number>();
        item?.month?.forEach((m: string, i: number) => {
          monthMap.set(m, item.value[i]);
        });

        // 🔥 generate value ตาม baseMonths
        const alignedValues = baseMonths.map((m) =>
          monthMap.has(m) ? monthMap.get(m)! : null,
        );

        if (!areaMap.has(key)) {
          areaMap.set(key, {
            ...item,
            month: baseMonths,
            value: alignedValues,
          });
        } else {
          const existing = areaMap.get(key)!;

          existing.value = existing.value.map((v: any, i: number) => {
            const newVal = alignedValues[i];

            const hasA = v !== null && v !== undefined;
            const hasB = newVal !== null && newVal !== undefined;

            if (!hasA && !hasB) return null;

            return (hasA ? v : 0) + (hasB ? newVal : 0);
          });
        }
      });
    });

    const reducedDataAll = {
      ...dataChart[0],
      data: Array.from(areaMap.values()),
    };

    return reducedDataAll;
  };

  const geranateFullViewX = () => {
    const areaMap = new Map<
      string,
      {
        meta: any;
        value: number[];
        month: string[];
      }
    >();

    dataChart?.forEach((entry: any) => {
      entry?.data.forEach((item: any) => {
        const areaKey = item.area.name;

        if (!areaMap.has(areaKey)) {
          areaMap.set(areaKey, {
            meta: {
              area: item.area,
              unit: item.unit,
              entry_exit: item.entry_exit,
              entry_exit_id: item.entry_exit_id,
            },
            value: Array(item.value.length).fill(0),
            month: item.month, // ❗ยังใช้ของเดิมไปก่อน
          });
        }

        const obj = areaMap.get(areaKey)!;

        item.value.forEach((v: any, i: number) => {
          if (v === null || v === undefined) return;

          const num = Number(v);
          if (isNaN(num)) return;

          obj.value[i] += num;
        });
      });
    });

    const result = Array.from(areaMap.values()).map((obj) => ({
      ...obj.meta,
      month: obj.month,
      value: obj.value,
    }));

    // =========================
    // 🔥 เพิ่มแค่ส่วนนี้
    // =========================

    let minDate: any = null;

    dataChart?.forEach((entry: any) => {
      entry?.data.forEach((item: any) => {
        item.month.forEach((m: string) => {
          const d = dayjs(m, "DD/MM/YYYY");
          if (!minDate || d.isBefore(minDate)) {
            minDate = d;
          }
        });
      });
    });

    const baseMonths = Array.from({ length: result[0].value.length }, (_, i) =>
      minDate.add(i, "month").format("DD/MM/YYYY"),
    );

    // 🔥 แทน month อย่างเดียว
    result.forEach((r) => {
      r.month = baseMonths;
    });

    // =========================

    return {
      ...dataChart[0],
      data: result,
    };
  };

  const handleReset = () => {
    setSrchArea([]);
    setSrchStartYear("");
    setSrchStartYearMedTerm("");
    setSrchMonth("");
    setSrchShipper("");
    setSrchEntryExit("");
    setFilterDataMedTerm(dataChart);
    setFilterDataMedTermEach(dataMedTermEachGroup);
    // setFilteredDataTable(dataTable);
    setgenarateDataChart(originalDataChart);

    setfilterList({
      month: null,
      shipper: null,
      entryExit: null,
      area: [],
    });
    setKey((prevKey) => prevKey + 1);
  };

  // #region handleFieldSearch
  const handleFieldSearch = () => {
    setfilterList({
      month: srchStartYear,
      shipper: srchShipper,
      entryExit: srchEntryExit,
      area: srchArea,
    });

    const getMinDateFromData = (data: any[]) => {
      let min: any = null;

      data?.forEach((item: any) => {
        item?.data?.forEach((d: any) => {
          d?.month?.forEach((m: string) => {
            const date = dayjs(m, "DD/MM/YYYY");
            if (!min || date.isBefore(min)) {
              min = date;
            }
          });
        });
      });

      return min ? min.format("DD/MM/YYYY") : null;
    };

    const dataforFilterShipper: any = dataChart?.filter((item: any) => {
      return srchShipper ? item?.group?.id == srchShipper : true;
    });

    // data too
    // |
    // |
    // V

    //filter item => entry_exit
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

    // data too
    // |
    // |
    // V

    //filter item => area
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
    const latestPerGroupMedTerm = keepLatestPerGroupByPeriod(resultFilterData);
    let modifiedDataMed2 = mergeDataByGroupMedTermVersionTwo(
      latestPerGroupMedTerm,
    );

    const month_date_format = srchMonth
      ? dayjs(srchMonth).format("DD/MM/YYYY")
      : dayjs().startOf("month").format("DD/MM/YYYY");
    // const fromStr = srchMonth ? dayjs(srchMonth, ['DD/MM/YYYY', 'YYYY-MM-DD']).startOf('day').format('DD/MM/YYYY') : dayjs().startOf('month').format('DD/MM/YYYY');
    const fromStr = srchMonth
      ? dayjs(month_date_format, ["DD/MM/YYYY", "YYYY-MM-DD"])
        .startOf("day")
        .format("DD/MM/YYYY")
      : dayjs().startOf("month").format("DD/MM/YYYY");
    // กรองเดือนของ each
    // กรอง resultFilterData.data.month ตั้งแต่เดือนที่เท่ากับ srchMonth เป็นต้นไป
    // แล้วก็ดู index ของ month กับ value ถ้ากรอง month ที่ index ไหนออก ก็ต้องกรอง value ที่ index นั้น ๆ
    // const filtered = filterByMonthFrom(resultFilterData, dayjs(srchMonth).format('DD/MM/YYYY')); // เดิมโรงงาน
    const filtered = filterByMonthFrom(resultFilterData ?? [], fromStr);

    // setFilterDataMedTermEach(resultFilterData); // ----> ยังไม่ได้กรอง month เลย
    setFilterDataMedTermEach(filtered); // ----> กรอง month แล้ว
    // setFilterDataMedTermEach(modifiedDataMed2);

    //render data to chart
    const { months, areas, seriesData } = processData(
      resultFilterData?.flatMap((d: any) => d?.data),
    );

    // data too
    // |
    // |
    // V

    const chartDataX = {
      labels: months,
      datasets: areas?.map((areaId: any, index) => {
        const areaData = areaMaster?.data.find(
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
        data: trimEdgeZerosToNull(ds.data),
      })),
    };

    setgenarateDataChart(newData);
  };

  const handleFieldSearchX = () => {
    setfilterList({
      month: srchStartYear,
      shipper: srchShipper,
      entryExit: srchEntryExit,
      area: srchArea,
    });

    // =========================
    // filter shipper
    // =========================
    const dataforFilterShipper: any = dataChart?.filter((item: any) => {
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
        // length: resultFilterData?.[0]?.data?.[0]?.value?.length || 24,
        length: maxLength || 24,
      },
      (_, i) => minDate?.add(i, "month").format("DD/MM/YYYY"),
    );

    const normalizedData = resultFilterData?.map((entry: any) => ({
      ...entry,
      data: entry.data.map((item: any) => ({
        ...item,
        month: baseMonths, // ❗ แก้แค่ตรงนี้
      })),
    }));

    // =========================
    // filter month (ยังใช้ได้เหมือนเดิม)
    // =========================
    const month_date_format = srchMonth
      ? dayjs(srchMonth).format("DD/MM/YYYY")
      : dayjs().startOf('month').format("DD/MM/YYYY"); //baseMonths[0];

    const fromStr = srchMonth
      ? dayjs(month_date_format, ["DD/MM/YYYY", "YYYY-MM-DD"])
        .startOf("day")
        .format("DD/MM/YYYY")
      : dayjs().startOf('month').format("DD/MM/YYYY"); //baseMonths[0];

    // const filtered = filterByMonthFrom(normalizedData ?? [], fromStr);
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

    flushSync(() => {
      setFilterDataMedTermEach(nextFilterDataMedTermEach);
    });

    // =========================
    // 🔥 ใช้ normalized + filtered เท่านั้น
    // =========================
    const flatData = filtered?.flatMap((d: any) => d?.data);

    const { months, areas, seriesData } = processData(flatData);

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

    setgenarateDataChart(newData);
  };

  const processData = (data: any) => {
    let months = formatMonthX(data?.[0]?.month);
    if (srchStartYear) {
      months = generateNext24Months(srchStartYear);
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
  

  // Prepare chart data
  // const { months, areas, seriesData } = processData(dataChart.flatMap((d: any) => d.data));
  const { months, areas, seriesData } = processData(
    filterDataMedTerm?.flatMap((d: any) => d.data),
  );

  const chartData = {
    labels: months,
    // datasets: areas.map((areaId: any, index) => ({
    //     // label: `Area ${areaId?.name}`,
    //     label: `${areaId?.name}`,
    //     data: seriesData[index],
    //     // borderColor: dataChart[0].data.find((d: any) => d.area.id === areaId?.id).area.color,
    //     // backgroundColor: dataChart[0].data.find((d: any) => d.area.id === areaId?.id).area.color,
    //     borderColor: filterDataMedTerm[0].data.find((d: any) => d.area.id === areaId?.id).area.color,
    //     backgroundColor: filterDataMedTerm[0].data.find((d: any) => d.area.id === areaId?.id).area.color,
    //     fill: false
    // }))
    datasets: areas.map((areaId: any, index) => {
      const areaData = areaMaster?.data.find(
        (d: any) => d.name === areaId?.name,
      );
      return {
        label: `${areaId?.name}`,
        data: seriesData[index],
        // borderColor: filterDataMedTerm[0].data.find((d: any) => d.area.id === areaId?.id).area.color,
        // backgroundColor: filterDataMedTerm[0].data.find((d: any) => d.area.id === areaId?.id).area.color,
        borderColor: areaData?.color,
        backgroundColor: areaData?.color,
        fill: false,
        isEntry: areaData?.entry_exit_id == 1 ? true : false,
        // areaName: areaData?.area?.name, // Store area name
        // customStyle: { borderWidth: 2, lineTension: 0.4 }, // Custom styles
        // metaInfo: {
        //     unit: areaData?.unit,
        //     entryExit: areaData?.entry_exit,
        // }
      };
    }),
  };

  const handleOpenFullView = (
    mode?: any,
    data?: any,
    isAll?: any,
    originalData?: any,
  ) => {
    setOpenView(true);
    setIsAll(isAll);
    setModeView(mode);
    setDataView(data);
    if (originalData) {
      setdataOriginalView(originalData);
    }
  };

  // Chart options
  const options: any = {
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
            return chart.data.datasets.map((dataset: any, index: any) => ({
              text: dataset.label,
              fillStyle: dataset.backgroundColor,
              strokeStyle: dataset.borderColor,
              hidden: !chart.isDatasetVisible(index),
              pointStyle: dataset.isEntry ? "rect" : "circle",
              datasetIndex: index,
            }));
          },
        },
        // onClick: null,
        onClick: (_event: any, legendItem: any, legend: any) => {
          console.log('object');
          const chart = legend.chart
          const datasetIndex = legendItem.datasetIndex

          if (datasetIndex === undefined) return

          const currentlyVisible = chart.isDatasetVisible(datasetIndex)

          chart.setDatasetVisibility(datasetIndex, !currentlyVisible)

          chart.update()
        },
      },
      title: {
        display: false,
        color: "#58585A",
        // text: 'Total Supply (MMBTU)',
        text: "Total Energy (MMBTU/D)", // v1.0.90 เปลี่ยนหัว Graph จาก "Total Supply (MMBTU)" เป็น "Total Energy (MMBTU/D)" https://app.clickup.com/t/86ert2k26
        font: {
          size: 16,
          // size: 15,
          // weight: "normal",
        },
        position: "top",
        align: "start",
        zIndex: 5,
        padding: {
          top: 5,
          bottom: 1,
          // top: 0,
          // bottom: -20,
        },
      },

      // mode: 'nearest',
      // intersect: false,
      // backgroundColor: 'white', // Set tooltip background color to white
      // titleColor: 'black', // Set title color to black (optional)
      // bodyColor: 'black', // Set body text color to black (optional)
      // borderColor: '#cfcfd1', // Set tooltip border color (e.g., black)
      // borderWidth: 1, // Set the width of the border
      // callbacks: {
      //     label: (tooltipItem: any) => {
      //         const labelName: any = tooltipItem?.dataset ? tooltipItem?.dataset?.label : '';  // Accessing the label name
      //         const value = tooltipItem.raw ? formatNumberThreeDecimal(tooltipItem.raw) : 0;  // Formatting the value
      //         return `${labelName} : ${value}`;  // Showing label name and value
      //     },
      // },

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
          //     return (tooltipItem?.raw === 0 ? null : formatNumberThreeDecimal(tooltipItem?.raw))
          // },
          label: (tooltipItem: any) => {
            const labelName = tooltipItem?.dataset?.label;
            const value = formatNumberThreeDecimal(tooltipItem.raw);
            return `${labelName} : ${value} (${tooltipItem?.label})`;
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
        // Optional: Adjust corner radius and shadow for tooltip appearance
        cornerRadius: 10, // Make the corners of the tooltip rounded
        boxWidth: 50, // Increase box width of the tooltip icon
        // Add stroke (border) to the tooltip
        borderColor: "rgba(0, 0, 0, 0.2)", // Set border color (a soft black)
        borderWidth: 1, // Set border width (adjust to your preference)
        // Optionally adjust the border radius for rounded corners
        borderRadius: 5,
        // Add shadow to the tooltip as well (if you want both)
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
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
            size: 12, // (ทางเลือก) ปรับขนาดฟอนต์ให้เล็กลงหน่อยถ้าวันเยอะ
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
    animation: {
      onSuccess: () => {
        const chart = ChartJS.getChart("MediumtermChart");
        if (chart) {
          const { legend }: any = chart;
          legend.top = -8;
        }
      },
    },
  };

  
  // useEffect(() => {
  //   console.log('genarateDataChart : ', genarateDataChart);
  
  // }, [genarateDataChart])
  

  return (
    <div
      className={`h-[520px] overflow-hidden block rounded-t-md relative z-1 p-2`}
    >
      <div className="flex justify-between w-full">
        <div className="py-[7px] pl-[12px]">
          <h2 className="text-[16px] font-bold text-[#58585A] ">
            {"Medium term"}
          </h2>
        </div>
        <div className="flex gap-2 justify-end">
          <BtnGeneral
            textRender={"Full View"}
            iconNoRender={false}
            modeIcon={"full_view"}
            bgcolor={"#00ADEF"}
            // can_view={userPermission ? userPermission?.f_view : false}
            can_view={true} //ถ้า user มีสิทธิดูหน้านี้ก็มีสิทธิดู fullview ได้
            generalFunc={() =>
              handleOpenFullView("Medium term", chartData, true, dataChart)
            }
          // generalFunc={() => handleSaveImage()}
          />
          <BtnGeneral
            textRender={"Export"}
            iconNoRender={false}
            modeIcon={"export"}
            bgcolor={"#17AC6B"}
            // generalFunc={() => exportToExcel(dataChart, "medium_term_total")}
            // generalFunc={() => exportToExcel(filterDataMedTerm, "medium_term_total", '', { search_month: srchMonth })}
            generalFunc={() =>
              exportToExcel(filterDataMedTermEach, "medium_term_total", "", {
                search_month: srchMonth,
              })
            }
            can_export={userPermission ? userPermission?.f_export : false}
          />
          {/* <BtnExport textRender={"Export"} /> */}
        </div>
      </div>

      <aside className="flex flex-wrap sm:flex-row gap-2 pb-2 w-full pl-[12px]">
        <MonthYearPickaSearch
          key={"start" + key}
          label="Month"
          placeHolder="Select Month"
          allowClear
          onChange={(e: any) => {
            setSrchStartYear(e ? e : null);
            setSrchStartYearMedTerm(e ? e : null);
            setSrchMonth(e ? e : null);
          }}
        />

        <InputSearch
          id="searchShipper"
          label="Shipper Name"
          type="select"
          value={srchShipper}
          isDisabled={
            userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false
          }
          onChange={(e) => {
            setSrchShipper(e.target.value);
          }}
          options={shipperGroupData?.data?.map((item: any) => ({
            value: item.id,
            label: item.name,
          }))}
        />

        <InputSearch
          id="searchEntryExit"
          label="Entry/Exit"
          type="select"
          value={srchEntryExit}
          onChange={(e) => {
            if (e?.target?.value) {
              setSrchEntryExit(e.target.value);
            } else {
              setSrchEntryExit("");
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
          options={areaMasterDataFilter
            ?.filter(
              (item: any) =>
                srchEntryExit === "" || item?.entry_exit_id === srchEntryExit,
            )
            .map((item: any) => ({
              value: item.name,
              label: item.name,
            }))}
        />

        <BtnSearch handleFieldSearch={handleFieldSearchX} />
        <BtnReset handleReset={handleReset} />
      </aside>

      <div className="w-full h-[350px] p-2 mt-[15px]">
        <div className="font-semibold text-[16px] text-[#58585A] mb-2">
          {/* {`Total Supply (MMBTU)`} */}
          {/* v1.0.90 เปลี่ยนหัว Graph จาก "Total Supply (MMBTU)" เป็น "Total Energy (MMBTU/D)" https://app.clickup.com/t/86ert2k26 */}
          {`Total Energy (MMBTU/D)`}
        </div>
        {genarateDataChart ? (
          <Line
            id="MediumtermChart"
            data={genarateDataChart}
            options={options}
          />
        ) : (
          <NodataTable />
        )}
      </div>

      <ModalFullViewMedium
        mode={modeView}
        data={dataView}
        dataOriginal={dataOriginalView}
        isAll={isAll}
        open={openView}
        onClose={() => {
          setOpenView(false);
        }}
        shipperGroupData={shipperGroupData}
        areaMaster={areaMaster}
        areaMasterDataFilter={areaMasterDataFilter}
        entryExitMaster={entryExitMaster}
        srchStartYearMedTerm={filterList?.month || srchStartYearMedTerm}
        filterList={filterList}

      />
    </div>
  );
};

export default ChartMediumTermAll;
