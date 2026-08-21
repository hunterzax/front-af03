import React, { useEffect } from "react";
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
  formatMonth,
  formatMonthX,
  formatMonthY,
  formatNumber,
  formatNumberThreeDecimal,
  generateNext24Months,
  getEarliestFirstDay,
  mergeDataSetsByLabel,
} from "@/utils/generalFormatter";
import dayjs from "dayjs";

// Register Chart.js components
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
  areaMaster?: any;
  srchStartYearMedTerm?: any;
  mode?: "layout" | "view";
}

const ChartMedEachShipper: React.FC<TableProps> = ({
  dataChart,
  dataAll,
  userPermission,
  mode,
  srchStartYearMedTerm,
  areaMaster,
}) => {

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
        month: string[];
        value: number[];
      }
    >();

    // ตรงนี้ใส่ originalData
    dataAll?.forEach((entry: any) => {
      entry?.data.forEach((item: any) => {
        const key = item?.area?.name;

        if (!areaMap.has(key)) {
          areaMap?.set(key, {
            ...item,
            value: [...item?.value],
            day: [...item?.month],
          });
        } else {
          const existing = areaMap.get(key)!;
          existing.value = existing?.value?.map((v, i) => v + item?.value[i]);
        }
      });
    });

    const reducedDataAll = {
      ...dataAll[0],
      data: Array.from(areaMap.values()),
    };

    return reducedDataAll;
  };

  let labels;
  // const dataMonths = dataChart?.data?.[0]?.month;
  // if (dataMonths?.length) {
  //   labels = formatMonthX(dataMonths);
  // } else 
  if (srchStartYearMedTerm) {
    labels = generateNext24Months(srchStartYearMedTerm);
  } else {
    // labels = formatMonthY(dataAll);
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
        display: true,
        color: "#58585A",
        // text: dataChart?.group?.name + ' Total Supply (MMBTU)',
        // text:
        //   mode == "layout"
        //     ? dataChart?.group?.name + " Total Energy (MMBTU/D)"
        //     : "Total Energy (MMBTU/D)", // v1.0.90 เปลี่ยนหัว Graph จาก "Total Supply (MMBTU)" เป็น "Total Energy (MMBTU/D)" https://app.clickup.com/t/86ert2k26
        text: dataChart?.group?.name + " Total Energy (MMBTU/D)",
        align: "start",
        font: {
          size: 16,
        //   size: 15,
        //   weight: "normal",
        },
        position: "top",
        // align: "start",
        // zIndex: 5,
        padding: {
          top: 5,
          bottom: 1,
        //   top: 0,
        //   bottom: -20,
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
        const chart = ChartJS.getChart("MediumtermChart2");
        if (chart) {
          const { legend }: any = chart;
          legend.top = -8;
        }
      },
    },
  };

  // console.log(">>> dataChart", dataChart)
  // console.log(">>> chartData", chartData)
  // console.log(">> datasets", datasets)

  return (
    // <div className="max-w-[4500px] w-full h-[65dvh] "> {/* Scrollable container */}
    <div
      className={
        mode == "layout"
          ? "w-full h-[350px] py-2 pl-[22px] pr-2"
          : "max-w-[4500px] w-full h-[65dvh]"
      }
    >
      <Line id="MediumtermChart2" data={chartData} options={options} />
    </div>
  );
};

export default ChartMedEachShipper;
