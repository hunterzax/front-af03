import React, {useEffect, useRef, useState} from 'react'
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
  filterByDayFrom,
  filterByMonthFrom,
  filterDataShortByMonth,
  formatDay,
  formatNumberThreeDecimal,
  formatSearchDate,
  generateDaysFromFutureMonth,
  getEarliestFirstDay,
  getLatestFirstDay,
  keepLatestPerGroupByPeriod,
  mergeDataByGroupMedTermVersionTwo,
  monthDiffInclusive,
  trimEdgeZerosToNull,
} from "@/utils/generalFormatter";
import MonthYearPickaSearch from "@/components/library/dateRang/monthYearPicker";
import getUserValue from "@/utils/getuserValue";
import ModalFullViewShort from "./modalFullView_SHORT";
import NodataTable from "@/components/other/nodataTable";
import dayjs from "dayjs";
import buddhistEra from 'dayjs/plugin/buddhistEra';

dayjs.extend(buddhistEra); // Extend Day.js with the plugin

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
  setFilterDataShortTerm?: any;
  filterDataShortTerm?: any;
  dataShortTermEachMain?: any; // short term เอามา filter
  setFilterDataShortTermEach?: any; // short term เอามา filter
  dataShortTermEachGroup?: any; // short term เอามา filter
  setDataShortTermEachGroup?: any; // short term เอามา filter
  setSrchStartDay?: any; // short term เอามา filter
  areaMasterDataFilter?: any; // area ที่กรองมาแล้ว
  filterDataShortTermEach?: any; // area ที่กรองมาแล้ว
  setfilterList?: any;
  filterList?: any;
}

const ChartShortTermAll: React.FC<TableProps> = ({
  dataChart,
  userPermission,
  setFilterDataShortTerm,
  filterDataShortTerm,
  dataShortTermEachMain,
  setFilterDataShortTermEach,
  setDataShortTermEachGroup,
  dataShortTermEachGroup,
  setSrchStartDay,
  areaMasterDataFilter,
  filterDataShortTermEach,
  setfilterList,
  filterList,
}) => {
  // ############### REDUX DATA ###############
  const { shipperGroupData, areaMaster, entryExitMaster } = useFetchMasters();
  const [forceRefetch, setForceRefetch] = useState(true);
  const dispatch = useAppDispatch();
  const userDT: any = getUserValue();

  // search panel
  const [key, setKey] = useState(0);
  const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
  const [srchStartYear, setSrchStartYear] = useState<any>("");

  const [srchShipper, setSrchShipper] = useState("");
  const [srchEntryExit, setSrchEntryExit] = useState("");
  const [srchArea, setSrchArea] = useState<any>([]);

  // for full view
  const [openView, setOpenView] = useState<any>(false);
  const [modeView, setModeView] = useState<any>();
  const [dataView, setDataView] = useState<any>();
  const [dataOriginalView, setdataOriginalView] = useState<any>();
  const [isAll, setIsAll] = useState<any>(false);

  const [originalDataChart, setoriginalDataChart] = useState<any>();
  const [genarateDataChart, setgenarateDataChart] = useState<any>();
  const [dataLength, setDataLength] = useState<any>();

  const [dataExport, setdataExport] = useState<any>();

  // useEffect(() => {
  //   if (srchStartDate) {
  //     const result = dayjs(srchStartDate).format("D/M/YYYY");
  //     // setdataExport({
  //     //     month: result,
  //     //     data: filterDataShortTermEach
  //     // })
  //   } else {
  //     // แปลง data หาค่า [0] ของ data ทุกตัว เพื่อเอาวันที่เริ่มต้นของ graph
  //     const trans = filterDataShortTermEach.flatMap((item: any) =>
  //       item?.data?.map((d: any) => d?.day?.[0]),
  //     );

  //     // หาเดือน แรกสุดใน data
  //     const getMinDateBE = (dates: string[]) => {
  //       if (!dates?.length) return null;

  //       const minDate = dates.reduce((min, curr) => {
  //         const [d1, m1, y1] = curr.split("/").map(Number);
  //         const [d2, m2, y2] = min.split("/").map(Number);

  //         const date1 = new Date(y1, m1 - 1, d1);
  //         const date2 = new Date(y2, m2 - 1, d2);

  //         return date1 < date2 ? curr : min;
  //       });

  //       const [day, month, year] = minDate.split("/").map(Number);
  //       const yearBE = year + 543;

  //       return `${day.toString().padStart(2, "0")}/${month
  //         .toString()
  //         .padStart(2, "0")}/${yearBE}`;
  //     };

  //     const result = getMinDateBE(trans);
  //     setdataExport({
  //       month: result,
  //       data: filterDataShortTermEach,
  //     });
  //   }
  // }, [filterDataShortTermEach]);

  useEffect(() => {
    const dataFullview: any = geranateFullView();

    const month_date_format = srchStartDate
      ? dayjs(srchStartDate).format("DD/MM/BBBB")
      : dayjs().startOf("month").format("DD/MM/BBBB");
    const fromStr = srchStartDate
      ? dayjs(month_date_format, ["DD/MM/YYYY", "YYYY-MM-DD"])
          .startOf("day")
          .format("DD/MM/BBBB")
      : dayjs().startOf("month").format("DD/MM/BBBB");
      

    setdataExport({
      month: fromStr,
      data: dataChart,
    });
    // resultFilterData?.flatMap((d: any) => d?.data)
    const { months, areas, seriesData } = processData(
      dataChart?.flatMap((d: any) => d?.data),
    );
    let chartData: any;

    setDataLength(months?.length);
    chartData = {
      labels: months,
      datasets: areas?.map((areaId: any, index) => {
        const areaData = areaMaster?.data?.find(
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
      ...chartData,
      datasets: chartData.datasets.map((ds: any) => ({
        ...ds,
        data: ds.data,
      })),
    };
    setgenarateDataChart(newData);
    setoriginalDataChart(newData);
  }, [dataChart, dataShortTermEachMain]);

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
    // สำหรับแสดงข้อมูลใน modalFull -> short term ของอิง
    const areaMap = new Map<
      string,
      {
        id: number;
        nomination_point: string;
        customer: string;
        area: { id: number; name: string; color: string };
        unit: string;
        entry_exit_id: number;
        entry_exit: string;
        day: string[];
        value: number[];
      }
    >();

    // ตรงนี้ใส่ originalData
    dataChart?.forEach((entry: any) => {
      entry.data.forEach((item: any) => {
        const key = item.area.name;

        if (!areaMap.has(key)) {
          areaMap.set(key, {
            ...item,
            value: [...item.value],
            day: [...item.day],
          });
        } else {
          const existing = areaMap.get(key)!;
          existing.value = existing.value.map((v, i) => v + item.value[i]);
        }
      });
    });

    const reducedDataAll = {
      ...dataChart[0],
      data: Array.from(areaMap.values()),
    };

    return reducedDataAll;
  };

  const handleFieldSearch = () => {
    setfilterList({
      month: srchStartDate,
      shipper: srchShipper,
      entryExit: srchEntryExit,
      area: srchArea,
    });
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
    const latestPerGroupShortTerm =
      keepLatestPerGroupByPeriod(resultFilterData);
    let modifiedDataShort2 = mergeDataByGroupMedTermVersionTwo(
      latestPerGroupShortTerm,
    );

    // เดิมโรงงาน
    // let data_filter_date = modifiedDataShort2
    // if (srchStartDate !== null) {
    //     // กรองข้อมูล data_short.data.day ให้ตรงกับเดือนใน srchStartDate
    //     data_filter_date = filterDataShortByMonth(modifiedDataShort2, srchStartDate)
    // }

    // // setFilterDataShortTermEach(modifiedDataShort2);
    // setFilterDataShortTermEach(data_filter_date);

    // ใหม่ออลนิว
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

    // setFilterDataShortTermEach(filtered); // ----> กรอง month แล้ว
    setFilterDataShortTermEach(resultFilterData); // ----> กรอง month แล้ว

    setdataExport({
      // month: dayjs(srchStartDate).format("D/M/YYYY"),
      month: dayjs(fromStr, "DD/MM/YYYY").format("DD/MM/BBBB"),
      data: resultFilterData,
    });

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
        data: ds.data,
      })),
    };
    setgenarateDataChart(newData);
  };

  const handleReset = () => {
    setSrchStartDay("");
    setSrchStartDate(null);
    setSrchArea([]);
    setSrchShipper("");
    setSrchStartYear("");
    setSrchEntryExit("");

    setdataExport({
      month: dayjs().startOf("month").format("DD/MM/BBBB"),
      data: dataShortTermEachMain,
    });

    setFilterDataShortTerm(dataChart);

    setFilterDataShortTermEach(dataShortTermEachMain);

    // setFilteredDataTable(dataTable);
    setfilterList({
      month: null,
      shipper: null,
      entryExit: null,
      area: []
    });
    setKey((prevKey) => prevKey + 1);
    setgenarateDataChart(originalDataChart);
  };

  // Process data
  const processData = (data: any) => {
    const earliestDay: any = getEarliestFirstDay(data); // หาวันที่น้อยที่สุด จะได้เอามาทำ label
    // const earliestDay: any = dayjs().startOf('month').toDate(); // หาวันที่น้อยที่สุด จะได้เอามาทำ label

    const lastestDay: any = getLatestFirstDay(data); // หาวันที่มากที่สุด จะได้เอามาทำ label
    const month_count = monthDiffInclusive(earliestDay, lastestDay); // หาจำนวนเดือนระหว่างวันที่
    // console.log('_srchStartDate : ', srchStartDate);
    // console.log('_earliestDay : ', earliestDay);
    const months = generateDaysFromFutureMonth(
      // srchStartDate ? srchStartDate : dayjs(earliestDay, "DD/MM/YYYY").toDate(),
      srchStartDate ? srchStartDate : dayjs().startOf('month').toDate(),
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

  // onclick full view
  const handleOpenFullView = (
    mode?: any,
    data?: any,
    isAll?: any,
    originalData?: any,
  ) => {
    setIsAll(isAll);
    setOpenView(true);
    setModeView(mode);
    setDataView(data);
    if (originalData) {
      setdataOriginalView(originalData);
    }
  };

  // chart option tip
  let option_chart: any = {
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
              strokeStyle: dataset.borderColor,
              hidden: !chart.isDatasetVisible(index),
              pointStyle: dataset.isEntry ? "rect" : "circle",
              datasetIndex: index
            }));
          },
        },
        // onClick: null,
        onClick: (_event: any, legendItem: any, legend: any) => {
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
        // mode: 'index',
        mode: "nearest",
        intersect: false,
        backgroundColor: "white",
        titleColor: "black",
        bodyColor: "black", // Set body text color to black (optional)
        borderColor: "#cfcfd1",
        borderWidth: 1,
        callbacks: {
          label: (tooltipItem: any) => {
            // Access the label name and value
            const labelName: any = tooltipItem?.dataset
              ? tooltipItem?.dataset?.label
              : ""; // Accessing the label name
            const value = tooltipItem.raw
              ? formatNumberThreeDecimal(tooltipItem.raw)
              : 0; // Formatting the value
            return `${labelName} : ${value}`; // Showing label name and value
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
          // font: {
          //   size: 11, // (ทางเลือก) ปรับขนาดฟอนต์ให้เล็กลงหน่อยถ้าวันเยอะ
          // },
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

  // useEffect(() => {
  //   console.log('genarateDataChart : ', genarateDataChart);
  // }, [genarateDataChart])
  

  return (
    <div
      className={`h-auto overflow-hidden block rounded-t-md relative z-1 p-2`}
    >
      <div className="flex justify-between w-full">
        <div className="py-[7px] pl-[12px]">
          <h2 className="text-[16px] font-bold text-[#58585A] ">
            {"Short term"}
          </h2>
        </div>

        {/* Align buttons to the right */}
        <div className="flex gap-2 justify-end">
          <BtnGeneral
            textRender={"Full View"}
            iconNoRender={false}
            modeIcon={"full_view"}
            bgcolor={"#00ADEF"}
            // can_view={userPermission ? userPermission?.f_view : false}
            can_view={true} //ถ้า user มีสิทธิดูหน้านี้ก็มีสิทธิดู fullview ได้
            generalFunc={() =>
              handleOpenFullView(
                "Short term",
                genarateDataChart,
                true,
                dataChart,
              )
            }
          />
          <BtnGeneral
            textRender={"Export"}
            iconNoRender={false}
            modeIcon={"export"}
            bgcolor={"#17AC6B"}
            // generalFunc={() => exportToExcel(dataChart, "short_term_total")}
            generalFunc={() => exportToExcel(dataExport, "short_term_total")}
            can_export={userPermission ? userPermission?.f_export : false}
          />
        </div>
      </div>

      <aside className="flex flex-wrap sm:flex-row gap-2 pb-2 w-full pl-[12px]">
        <MonthYearPickaSearch
          key={"start" + key}
          label="Month"
          placeHolder="Select Month"
          allowClear
          onChange={(e: any) => {
            setSrchStartDate(e ? e : null);
            setSrchStartDay(e ? e : null);
            setSrchStartYear(e ? e : null);
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
          onChange={(e) => setSrchShipper(e.target.value)}
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
          onChange={(e) => setSrchArea(e.target.value)}
          options={areaMasterDataFilter
            ?.filter(
              (item: any) =>
                srchEntryExit === "" || item.entry_exit_id === srchEntryExit,
            )
            .map((item: any) => ({
              value: item.name,
              label: item.name,
            }))}
        />

        <BtnSearch handleFieldSearch={handleFieldSearch} />
        <BtnReset handleReset={handleReset} />
      </aside>

      <div className="overflow-x-auto w-full mt-[15px]">
        <div className="font-semibold text-[16px] text-[#58585A] mb-2">
          {/* v1.0.90 เปลี่ยนหัว Graph จาก "Total Supply (MMBTU)" เป็น "Total Energy (MMBTU/D)" https://app.clickup.com/t/86ert2k26 */}
          {`Total Energy (MMBTU/D)`}
        </div>
        {/* <div className="w-[3500px] h-[450px] p-2 overflow-hidden"> */}
        <div
          className="w-full h-[65dvh] overflow-hidden"
          style={{ width: dataLength * 32 }}
        >
          {genarateDataChart ? (
            <Line data={genarateDataChart} options={option_chart} />
          ) : (
            <NodataTable />
          )}
        </div>
      </div>

      <ModalFullViewShort
        mode={modeView}
        data={dataView}
        dataOriginal={dataOriginalView}
        open={openView}
        isAll={isAll}
        onClose={() => {
          setOpenView(false);
          setdataOriginalView(undefined);
        }}
        shipperGroupData={shipperGroupData}
        areaMaster={areaMaster}
        areaMasterDataFilter={areaMasterDataFilter}
        entryExitMaster={entryExitMaster}
        srchStartDateMain={srchStartDate}
        filterList={filterList}
      />
    </div>
  );
};

export default ChartShortTermAll;
