import React, { useEffect, useState } from "react";
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
} from "chart.js";
import {
  countMonthSpanInclusive,
  formatDay,
  formatNumber,
  formatNumberThreeDecimal,
  formatSearchDate,
  generateDaysFromFutureMonth,
  generateMonthLabels,
  getEarliestFirstDay,
  getLatestFirstDay,
  mergeDataSetsByLabel,
  monthDiffInclusive,
  trimEdgeZerosToNull,
} from "@/utils/generalFormatter";
import dayjs from "dayjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);
interface TableProps {
  dataChart?: any;
  dataAll?: any;
  userPermission?: any;
  srchStartDay?: any;
  areaMaster?: any;
  mode?: "layout" | "view";
}

const ChartShortEachShipper: React.FC<TableProps> = ({
  dataChart,
  userPermission,
  srchStartDay,
  areaMaster,
  dataAll,
  mode,
}) => {
  // const earliestDay: any = getEarliestFirstDay(dataChart?.data); // หาวันที่น้อยที่สุด จะได้เอามาทำ label
  // const count_month: any = countMonthSpanInclusive(dataChart?.data) // นับจำนวนเดือนจาก arr day

  // // ถ้ากด reset มาให้ใช้ earliestDay นะวัยรุ่น
  // let srchStartDayX = srchStartDay ? formatSearchDate(srchStartDay) : earliestDay

  // // const labels = dataChart?.data?.length > 0 ? generateMonthLabels(srchStartDay ? srchStartDayX : dataChart.data[0].day[0], 4) : [];
  // // const labels = dataChart?.data?.length > 0 ? generateMonthLabels(srchStartDayX, 4) : []; // params ตัวที่สองของ generateMonthLabels คือจะ gen ไปกี่เดือน
  // // const labels = dataChart?.data?.length > 0 ? generateMonthLabels(srchStartDayX, srchStartDay ? 1 : count_month) : []; // params ตัวที่สองของ generateMonthLabels คือจะ gen ไปกี่เดือน

  // // ระบบจะแสดงข้อมูลเป็นรํายเดือน 24 เดือน (นับจํากเดือนที่เลือก)
  // const labels = dataChart?.data?.length > 0 ? generateMonthLabels(srchStartDayX, count_month < 24 ? count_month : 24) : []; // params ตัวที่สองของ generateMonthLabels คือจะ gen ไปกี่เดือน

  const [dataLength, setDataLength] = useState<any>();

  // ---- ก้อปมาจาก chartShortTermAll จะได้เหมือน ๆ กัน ----
  const earliestDay: any = getEarliestFirstDay(dataChart?.data); // หาวันที่น้อยที่สุด จะได้เอามาทำ label
  const lastestDay: any = getLatestFirstDay(dataChart?.data); // หาวันที่มากที่สุด จะได้เอามาทำ label
  const month_count = monthDiffInclusive(earliestDay, lastestDay); // หาจำนวนเดือนระหว่างวันที่
  const labels = generateDaysFromFutureMonth(
    srchStartDay ? srchStartDay : dayjs(earliestDay, "DD/MM/YYYY").toDate(),
    month_count,
  );
  // const labels = generateDaysFromFutureMonth(srchStartDay ? srchStartDay : dayjs(earliestDay, 'DD/MM/YYYY').toDate(), 14); // ที่ fix 14 เพราะ Dashboard จะต้องเริ่มจากวันที่ปัจจุบันทุกกราฟเป็น Default https://app.clickup.com/t/86ert2k39

  // const datasets = dataChart?.data?.map((item: any) => ({
  //     // label: item.nomination_point, // Nomination point name
  //     label: item.area?.name, // Nomination point name
  //     data: item.value, // Values
  //     borderColor: item.area.color, // Line color
  //     // backgroundColor: item.area.color + "66", // Transparent color
  //     backgroundColor: item.area.color, // Transparent color
  //     fill: false, // Do not fill the area under the line
  //     tension: 0, // Curve the line slightly
  //     isEntry: item?.entry_exit_id == 1 ? true : false,
  // }));

  // ถ้า datasets.label ซ้ำกัน ให้รวม datasets.data ที่ index เดียวกัน แล้วปรับ obj ที่ซ้ำให้เหลือแค่อันเดียว
  // const result_datasets = mergeDataSetsByLabel(datasets);

  // Chart data configuration
  // const chartData = {
  //     labels: labels, // Use formatted month labels
  //     // labels: months, // แสดง label ทั้งเดือนที่เลือก filter + ไปอีก 4 เดือน
  //     datasets: result_datasets,
  // };

  // ------------------------------------------------------------------------------

  const [genarateDataChart, setgenarateDataChart] = useState<any>();

  // const processData = (data: any, dataAll?: any) => {
  //   const earliestDay: any = getEarliestFirstDay(dataAll); // หาวันที่น้อยที่สุด จะได้เอามาทำ label
  //   const lastestDay: any = getLatestFirstDay(dataAll); // หาวันที่มากที่สุด จะได้เอามาทำ label
  //   const month_count = monthDiffInclusive(earliestDay, lastestDay); // หาจำนวนเดือนระหว่างวันที่
  //   const months = generateDaysFromFutureMonth(
  //     srchStartDay ? srchStartDay : dayjs(earliestDay, "DD/MM/YYYY").toDate(),
  //     month_count,
  //   );

  //   const areas = Array.from(
  //     new Map(
  //       (data || [])
  //         .flatMap((d: any) =>
  //           d?.area ? [{ id: d?.area?.id, name: d?.area?.name }] : [],
  //         ) // Safeguard for null/undefined data and area
  //         ?.map((area: any) => [area.id, area]), // Use id as the key in the Map
  //     ).values(), // Get unique area objects
  //   );

  //   const seriesData = areas?.map((areaId: any) => {
  //     return months?.map((month) => {
  //       let hasValue = false;

  //       const totalValue = data
  //         ?.filter((d: any) => d.area.id === areaId?.id)
  //         ?.reduce((sum: number, current: any) => {
  //           const monthIndex = current.day.findIndex(
  //             (m: any) => formatDay(m) === month
  //           );

  //           if (monthIndex >= 0) {
  //             const val = current.value?.[monthIndex];

  //             // 🔥 สำคัญ: เช็คแบบนี้แทน
  //             if (val != null) {   // == null จะกันทั้ง null + undefined
  //               hasValue = true;
  //               return sum + Number(val); // กัน string "0"
  //             }
  //           }

  //           return sum;
  //         }, 0);

  //       return hasValue ? totalValue : null;
  //     });
  //   });

  //   return {
  //     months,
  //     areas,
  //     seriesData,
  //   };
  // };

  const processData = (data: any, dataAll?: any) => {
  const latestDay: any = getLatestFirstDay(dataAll);

  // ถ้าเลือกเดือน ให้เริ่มจากเดือนที่เลือก
  // ถ้ายังไม่เลือก ให้เริ่มจากเดือนปัจจุบัน
  const startDate = srchStartDay
    ? dayjs(srchStartDay).startOf("month")
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
  
  // useEffect(() => {
  //   const { months, areas, seriesData } = processData(
  //     dataChart?.data,
  //     dataAll?.flatMap((d: any) => d?.data),
  //   );
  //   let chartData: any;

  //   // console.log(">>> dataChart", dataChart)

  //   // console.log(">>> seriesData", seriesData)

  //   const areaInHere = dataChart?.data?.map((item: any) => {
  //     return item?.area;
  //   });

  //   // console.log(">>> areas", areas)

  //   chartData = {
  //     labels: months,
  //     datasets: areas?.map((areaId: any, index) => {
  //       const areaData = areaInHere?.find((d: any) => d.id === areaId?.id);
  //       // console.log(">>> seriesData[index]", seriesData[index])
  //       return {
  //         label: `${areaId?.name}`,
  //         data: seriesData[index],
  //         borderColor: areaData?.color,
  //         backgroundColor: areaData?.color,
  //         fill: false,
  //         isEntry: areaData?.entry_exit_id == 1 ? true : false,
  //         spanGaps: false, // 🔥 ตัวนี้สำคัญ
  //       };
  //     }),
  //   };
    

  //   const newData = {
  //     ...chartData,
  //     datasets: chartData.datasets.map((ds: any) => ({
  //       ...ds,
  //       data: ds.data,
  //     })),
  //   };

  //   // console.log(">>> newData", newData)

  //   setgenarateDataChart(newData);
  //   setDataLength(months?.length);
  // }, [dataChart]);


  useEffect(() => {
  const { months, areas, seriesData } = processData(
    dataChart?.data,
    dataAll?.flatMap((d: any) => d?.data),
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

  setgenarateDataChart(chartData);
  setDataLength(months?.length);
}, [dataChart, dataAll, srchStartDay]);

  // ------------------------------------------------------------------------------

  // Chart options
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
        display: true,
        // text: dataChart?.group?.name + " Total Supply (MMBTU)",
        text: dataChart?.group?.name + " Total Energy (MMBTU/D)", // v1.0.90 เปลี่ยนหัว Graph จาก "Total Supply (MMBTU)" เป็น "Total Energy (MMBTU/D)" https://app.clickup.com/t/86ert2k26
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
      datalabels: {
        display: false,
      },
      tooltip: {
        // mode: 'index',
        mode: "nearest",
        intersect: false,
        backgroundColor: "white", // Set tooltip background color to white
        titleColor: "black", // Set title color to black (optional)
        bodyColor: "black", // Set body text color to black (optional)
        borderColor: "#cfcfd1", // Set tooltip border color (e.g., black)
        borderWidth: 1, // Set the width of the border
        callbacks: {
          label: (tooltipItem: any) => {
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
          // font: {
          //   size: 11, // (ทางเลือก) ปรับขนาดฟอนต์ให้เล็กลงหน่อยถ้าวันเยอะ
          // },
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

  const optionsForViewMode: any = {
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
          // font: {
          //   size: 11, // (ทางเลือก) ปรับขนาดฟอนต์ให้เล็กลงหน่อยถ้าวันเยอะ
          // },
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

  // console.log(">>> genarateDataChart", genarateDataChart)

  return (
    <div className="overflow-x-auto">
      {/* <div className="w-[3500px] h-[350px] p-2"> */}
      <div
        className={
          mode == "view"
            ? "w-[7500px] h-[65dvh] overflow-hidden"
            : "w-full h-[65dvh] py-2 pl-[22px] pr-2 overflow-hidden"
        }
        style={mode == 'view' ? {} : { width: dataLength * 32 }}
      >
        {/* <Line data={chartData} options={options} /> */}
        {genarateDataChart && (
          <Line data={genarateDataChart} options={mode == 'view' ? optionsForViewMode : options} />
        )}
      </div>
    </div>
  );
};

export default ChartShortEachShipper;
