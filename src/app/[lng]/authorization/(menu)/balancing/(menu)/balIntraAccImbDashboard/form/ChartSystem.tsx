import {Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend} from 'chart.js'
import {Chart} from 'react-chartjs-2'
import annotationPlugin from 'chartjs-plugin-datalabels'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import {useEffect, useState} from 'react'
import dayjs from 'dayjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ChartDataLabels, annotationPlugin)

type Props = {
  data: any
}

const ChartSystem: React.FC<Props> = ({data}) => {
  const loadData: any = data

  const [tk, settk] = useState<Boolean>(false)
  const [dataRender, setdataRender] = useState<any>([])
  const [labelRender, setlabelRender] = useState<any>([])

  // useEffect(() => {
  //   const allowedHours = [
  //     "03:00",
  //     "06:00",
  //     "09:00",
  //     "12:00",
  //     "15:00",
  //     "18:00",
  //     "21:00",
  //     "24:00",
  //   ];
  //   const genarateData: any = loadData; //real

  //   const useData =
  //     genarateData?.data?.length > 0
  //       ? genarateData.data[0].hour.filter((f: any) =>
  //           // !!f?.zone &&
  //           allowedHours.includes(f?.gas_hour_text),
  //         )
  //       : [];

  //   // const useData = loadData?.data?.length > 0 ? loadData?.data[0]?.hour?.filter((f: any) => !!f?.zone && f?.gas_hour_text !== "07:00") : [];
  //   const findHour: any = useData?.map((item: any) => {
  //     return item?.gas_hour_text == "24:00" ? "00:00" : item?.gas_hour_text;
  //     // return (item?.gas_hour_text)
  //   });

  //   const fnTemplate = (template: any) => {
  //     console.log("useData : ", useData);
  //     const setDataTemplate = template?.map((e: any, ix: number) => {
  //       let styleChart = {};

  //       switch (e?.type) {
  //         case "bar":
  //           const getZone: any = e?.lebel?.toUpperCase();
  //           styleChart = {
  //             type: "bar",
  //             label: e?.lebel,
  //             // data: useData?.map((eH: any) => {
  //             //     return eH?.value?.[e?.key] !== null ? eH?.value?.[e?.key] : eH?.value?.[e?.key] == 0 ? 0 : null
  //             // }),
  //             data: useData?.map((eH: any) => {
  //               return eH?.valueOfEachZone[getZone] !== null
  //                 ? eH?.valueOfEachZone[getZone]?.totalAccImbInv_percentage
  //                 : eH?.valueOfEachZone[getZone]?.totalAccImbInv_percentage == 0
  //                   ? 0
  //                   : null;
  //             }),
  //             backgroundColor: e?.color,
  //             stack: `Stack ${ix}`,
  //             order: 1,
  //             zIndex: 1, // ตั้งค่า zIndex ให้ bar อยู่ด้านหลัง
  //           };
  //           break;

  //         case "line":
  //           styleChart = {
  //             type: "line",
  //             label: e?.lebel,
  //             data: useData?.map((eH: any) => {
  //               // return eH?.value?.[e?.key] || null
  //               return (
  //                 eH?.valueOfEachZone?.WEST?.[e?.key] ??
  //                 eH?.valueOfEachZone?.EAST?.[e?.key] ??
  //                 null
  //               );
  //             }),
  //             backgroundColor: e?.color,
  //             borderColor: e?.color,
  //             // fill: false,
  //             // tension: 0,
  //             yAxisID: "y", // ← ใช้แกน y เดียวกัน ถ้าไม่อยากแยก
  //             borderDash: [6, 3], // ← เพิ่มตรงนี้!
  //             borderWidth: 2, // ความหนาเส้น (ถ้าอยากปรับ)
  //             order: 0,
  //             stack: `StackLine ${ix}`,

  //             // ปิดจุด:
  //             pointRadius: 2,
  //             pointHoverRadius: 5,
  //             spanGaps: true,
  //             zIndex: 10, // ตั้งค่า zIndex ให้ line อยู่ด้านหน้า
  //           };
  //           break;
  //       }

  //       return styleChart;
  //     });

  //     return setDataTemplate;
  //   };

  //   const templateLabel = fnTemplate(genarateData?.templateLabelKeys);

  //   setlabelRender((pre: any) => findHour);
  //   setdataRender(templateLabel);
  //   settk(!tk);
  // }, [loadData]);

  useEffect(() => {
    const allowedHours = ['03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '24:00']

    const genarateData: any = loadData

    /**
     * รวม hour ของทุก gas day
     *
     * ก่อน:
     *
     * data[0].hour
     *
     * หลัง:
     *
     * data[0].hour
     * data[1].hour
     * data[2].hour
     * ...
     */
    const useData =
      genarateData?.data?.flatMap((dayItem: any) => {
        const gasDay = dayItem?.gas_day

        if (!Array.isArray(dayItem?.hour)) {
          return []
        }

        return dayItem.hour
          .filter((hourItem: any) => allowedHours.includes(hourItem?.gas_hour_text))
          .map((hourItem: any) => ({
            ...hourItem,

            /**
             * ใส่ gas_day เข้าแต่ละ hour
             * เพื่อให้รู้ว่า point นี้เป็นของวันไหน
             */
            gas_day: gasDay
          }))
      }) ?? []

    console.log('ChartSystem useData : ', useData)

    /**
     * label ของ X Axis
     *
     * ใช้ array 2 ค่า
     * Chart.js จะแสดงเป็น multi-line label
     *
     * 03:00
     * 11/08/2026
     */
    const findHour: any = useData.map((item: any) => {
      const hour = item?.gas_hour_text === '24:00' ? '00:00' : item?.gas_hour_text

      const date = item?.gas_day ? dayjs(item.gas_day).format('DD/MM/YYYY') : ''

      // return [hour, date]
      return `${date} ${hour}`
    })

    const fnTemplate = (template: any) => {
      const setDataTemplate = template?.map((e: any, ix: number) => {
        let styleChart: any = {}

        switch (e?.type) {
          /**
           * =====================
           * BAR
           * =====================
           */
          case 'bar': {
            const getZone = e?.lebel?.toUpperCase()

            styleChart = {
              type: 'bar',

              label: e?.lebel,

              data: useData.map((eH: any) => {
                const zoneData = eH?.valueOfEachZone?.[getZone]

                return zoneData?.totalAccImbInv_percentage ?? null
              }),

              backgroundColor: e?.color,

              stack: `Stack ${ix}`,

              order: 1,

              zIndex: 1
            }

            break
          }

          /**
           * =====================
           * LINE
           * =====================
           */
          case 'line': {
            styleChart = {
              type: 'line',

              label: e?.lebel,

              data: useData.map((eH: any) => {
                return eH?.valueOfEachZone?.WEST?.[e?.key] ?? eH?.valueOfEachZone?.EAST?.[e?.key] ?? null
              }),

              backgroundColor: e?.color,

              borderColor: e?.color,

              yAxisID: 'y',

              borderDash: [6, 3],

              borderWidth: 2,

              order: 0,

              stack: `StackLine ${ix}`,

              pointRadius: 2,

              pointHoverRadius: 5,

              /**
               * สำคัญ:
               *
               * แนะนำ false
               * เพื่อไม่ให้เส้นเชื่อมข้าม null
               */
              spanGaps: false,

              zIndex: 10
            }

            break
          }
        }

        return styleChart
      })

      return setDataTemplate
    }

    const templateLabel = fnTemplate(genarateData?.templateLabelKeys)

    setlabelRender(findHour)

    setdataRender(templateLabel)

    settk((prev) => !prev)
  }, [loadData])

  function createDoubleLineSymbol(color: any) {
    const canvas = document.createElement('canvas')
    canvas.width = 10
    canvas.height = 10
    const ctx: any = canvas.getContext('2d')

    ctx.setLineDash([3, 3])

    // เส้นบน
    ctx.beginPath()
    ctx.moveTo(0, 5)
    ctx.lineTo(40, 5)
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.stroke()

    // เส้นล่าง
    ctx.beginPath()
    ctx.moveTo(0, 15)
    ctx.lineTo(40, 15)
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.stroke()

    return canvas
  }

  function getDynamicYScaleX(dataArray: any) {
    // ดึงค่า numerical values จากทุก hour
    const allValues = dataArray?.flatMap((dayItem: any) => {
      if (!dayItem?.hour || !Array.isArray(dayItem.hour)) return []
      return dayItem.hour?.flatMap((hourItem: any) => {
        if (!hourItem?.value) return []
        return Object.values(hourItem.value).filter((v: any) => typeof v === 'number' && !isNaN(v))
      })
    })

    if (allValues?.length === 0) {
      // ถ้าไม่มีข้อมูลจริงให้คำนวณจากข้อมูลที่ปัดเป็น default
      return {min: -20, max: 20, stepSize: 20}
    }

    // คำนวณค่ามากสุดและน้อยสุดจาก allValues
    const maxValue = Math.max(...allValues)
    const minValue = Math.min(...allValues)

    // ปัดค่าที่มากสุดและน้อยสุดให้เป็นเลขคู่
    const nearestMax = Math.ceil(maxValue / 20) * 20 // ปัดขึ้นให้เป็นเลขคู่
    const nearestMin = Math.floor(minValue / 20) * 20 // ปัดลงให้เป็นเลขคู่

    // กำหนด stepSize ให้เป็น 20 (ห่างกันทีละ 20)
    const stepSize = 20

    return {
      min: nearestMin, // ใช้ min ที่ปัดเป็นเลขคู่
      max: nearestMax, // ใช้ max ที่ปัดเป็นเลขคู่
      stepSize: stepSize // ใช้ stepSize = 20
    }
  }

  function getDynamicYScale(dataArray: any) {
    const allValues: number[] = []
    const allowedHours = ['03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '24:00']

    dataArray?.forEach((dayItem: any) => {
      if (!dayItem?.hour || !Array.isArray(dayItem.hour)) return

      const dataHours = dayItem?.hour?.length > 0 ? dayItem?.hour.filter((f: any) => allowedHours?.includes(f?.gas_hour_text)) : []

      dataHours.forEach((hourItem: any) => {
        // ✅ ดึงค่าจาก hourItem.value (ยกเว้น totalAccImbInv_percentage)
        if (hourItem?.value && typeof hourItem.value === 'object') {
          Object.entries(hourItem.value).forEach(([key, val]: [string, any]) => {
            if (key !== 'totalAccImbInv_percentage' && typeof val === 'number' && !isNaN(val)) {
              allValues.push(val)
            }
          })
        }

        // ✅ ดึงค่าจาก hourItem.valueOfEachZone (เฉพาะ totalAccImbInv_percentage)
        if (hourItem?.valueOfEachZone && typeof hourItem.valueOfEachZone === 'object') {
          Object.values(hourItem.valueOfEachZone).forEach((zone: any) => {
            const val = zone?.totalAccImbInv_percentage
            if (typeof val === 'number' && !isNaN(val)) {
              allValues.push(val)
            }
          })
        }
      })
    })

    if (allValues.length === 0) {
      return {min: -20, max: 20, stepSize: 20}
    }

    const maxValue = Math.max(...allValues)
    const minValue = Math.min(...allValues)

    // กันทับกับตัวหนังสืออื่นๆ
    const nearestMax = Math.ceil(maxValue / 20) * 20 + 20 // ✅ เพิ่มอีก 20
    const nearestMin = Math.floor(minValue / 20) * 20 - 20 // ✅ ลดอีก 20

    const stepSize = 20

    return {
      min: nearestMin,
      max: nearestMax,
      stepSize: stepSize
    }
  }

  const yScaleOptions = getDynamicYScale(loadData?.data || []) //<=== หาค่า max สุดของ value หากเกินค่า default 200 จะ min - max ตาม ค่ามากสุดทันที

  function getDynamicYScaleFromValues(values: number[]) {
    if (!values.length) {
      return {min: -20, max: 20, stepSize: 20}
    }

    const stepSize = 20

    const maxValue = Math.max(...values)
    const minValue = Math.min(...values)

    // กันทับ label เหมือน getDynamicYScale เดิม
    const nearestMax = Math.ceil(maxValue / stepSize) * stepSize + stepSize
    const nearestMin = Math.floor(minValue / stepSize) * stepSize - stepSize

    return {
      min: nearestMin,
      max: nearestMax,
      stepSize
    }
  }

  function getVisibleYScale(chart: any) {
    const values: number[] = []

    chart.data.datasets.forEach((dataset: any, datasetIndex: number) => {
      if (!chart.isDatasetVisible(datasetIndex)) return

      dataset.data?.forEach((raw: any) => {
        if (raw === null || raw === undefined || raw === '') return

        const val = typeof raw === 'number' ? raw : typeof raw?.y === 'number' ? raw.y : Number(raw)

        if (Number.isFinite(val)) {
          values.push(val)
        }
      })
    })

    return getDynamicYScaleFromValues(values)
  }

  function applyVisibleYScale(chart: any) {
    const yScale = getVisibleYScale(chart)

    chart.options.scales.y.min = yScale.min
    chart.options.scales.y.max = yScale.max
    chart.options.scales.y.ticks.stepSize = yScale.stepSize

    chart.update()
  }

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: false
      },
      datalabels: {
        display: true, // แสดง label
        align: (context: any) => {
          const value = context?.dataset?.data[context?.dataIndex]
          return value == 0 ? 'top' : value >= 0 ? 'top' : 'bottom' // ถ้าค่ามากกว่า 0 จะให้ label อยู่ด้านบน ถ้าน้อยกว่า 0 จะอยู่ด้านล่าง
        },
        anchor: (context: any) => {
          const value = context?.dataset?.data[context?.dataIndex]
          return value == 0 ? 'center' : value >= 0 ? 'end' : 'start' // ถ้าค่ามากกว่า 0 จะให้ label อยู่ด้านบน ถ้าน้อยกว่า 0 จะอยู่ด้านล่าง
        },
        // anchor: 'start', // กำหนดตำแหน่งแนวตั้งของ label

        formatter: (value: any, context: any) => {
          const dataset = context?.dataset
          if (dataset?.type === 'line') {
            return '' // สำหรับ line ไม่แสดง label
          }

          if (value == null) {
            return ''
          }

          return value + ' %' // สำหรับ bar เพิ่ม '%' ต่อท้าย
        },
        color: '#787486', // สีของข้อความ
        font: {
          weight: 'bold', // หรือ 700
          size: 12, // ถ้าจะปรับขนาดตัวหนังสือด้วย
          family: 'Arial' // กำหนดฟอนต์ (ถ้าต้องการ)
        }
      },
      //   legend: {
      //     labels: {
      //       usePointStyle: true, // <<< ใช้ pointStyle แทน rectangle
      //       font: {
      //         weight: "bold", // หรือ 700
      //         size: 12, // ถ้าจะปรับขนาดตัวหนังสือด้วย
      //         family: "Arial", // กำหนดฟอนต์ (ถ้าต้องการ)
      //       },
      //       generateLabels: (chart: any) =>
      //         chart?.data?.datasets?.map((item: any, i: any) => {
      //           const backgroundColor = chart?.data?.datasets[i].backgroundColor;
      //           if (item?.type == "line") {
      //             return {
      //               datasetIndex: i,
      //               text: `${item?.label}`,
      //               hidden: chart.getDatasetMeta(i).hidden,
      //               fillStyle: backgroundColor,
      //               strokeStyle: backgroundColor,
      //               fontColor: "#787486",
      //               borderWidth: 1,
      //               rotation: 0,
      //               borderRadius: 0,
      //               pointStyle: createDoubleLineSymbol(backgroundColor),
      //             };
      //           } else {
      //             return {
      //               datasetIndex: i,
      //               text: `${item?.label}`,
      //               hidden: chart.getDatasetMeta(i).hidden,
      //               fillStyle: backgroundColor,
      //               strokeStyle: backgroundColor,
      //               fontColor: "#787486",
      //               borderWidth: 1,
      //               borderRadius: 3,
      //               usePointStyle: true, // ต้องใส่ถ้าใช้ pointStyle: 'circle'
      //               pointStyle: "circle",
      //               boxWidth: 1, // ปรับขนาดความกว้าง
      //               boxHeight: 1, // ปรับความสูง (Chart.js 4.x)
      //             };
      //           }
      //         }),
      //     },
      //   },
      legend: {
        onClick: (e: any, legendItem: any, legend: any) => {
          const chart = legend.chart
          const datasetIndex = legendItem.datasetIndex

          if (datasetIndex === undefined || datasetIndex === null) return

          chart.setDatasetVisibility(datasetIndex, !chart.isDatasetVisible(datasetIndex))

          applyVisibleYScale(chart)
        },

        labels: {
          usePointStyle: true,
          font: {
            weight: 'bold',
            size: 12,
            family: 'Arial'
          },
          generateLabels: (chart: any) =>
            chart?.data?.datasets
              ?.map((item: any, i: any) => {
                const backgroundColor = chart?.data?.datasets[i].backgroundColor

                if (item?.type == 'line') {
                  return {
                    datasetIndex: i,
                    text: `${item?.label}`,
                    hidden: !chart.isDatasetVisible(i),
                    fillStyle: backgroundColor,
                    strokeStyle: backgroundColor,
                    fontColor: '#787486',
                    borderWidth: 1,
                    rotation: 0,
                    borderRadius: 0,
                    pointStyle: createDoubleLineSymbol(backgroundColor)
                  }
                }

                return {
                  datasetIndex: i,
                  text: `${item?.label}`,
                  hidden: !chart.isDatasetVisible(i),
                  fillStyle: backgroundColor,
                  strokeStyle: backgroundColor,
                  fontColor: '#787486',
                  borderWidth: 1,
                  borderRadius: 3,
                  usePointStyle: true,
                  pointStyle: 'circle',
                  boxWidth: 1,
                  boxHeight: 1
                }
              })
              .filter(Boolean)
        }
      },
      tooltip: {
        usePointStyle: true,
        callbacks: {
          label: function (context: any) {
            // context.formattedValue คือค่าที่โชว์ใน tooltip
            return `${context.dataset.label}: ${context.formattedValue}%`
          },
          labelPointStyle: function (context: any) {
            const canvas = document.createElement('canvas')
            canvas.width = 10
            canvas.height = 10
            const ctx: any = canvas.getContext('2d')
            ctx.fillStyle = context?.dataset?.backgroundColor
            ctx.beginPath()
            ctx.arc(5, 5, 3, 0, 2 * Math.PI)
            ctx.fill()

            return {
              pointStyle: canvas,
              rotation: 0
            }
          }
        }
      }
    },
    scales: {
      // x: {
      //   stacked: true,
      //   ticks: {
      //     maxRotation: 0,
      //     minRotation: 0,
      //   },
      // },
      x: {
        stacked: true,

        ticks: {
          maxRotation: 25,
          minRotation: 25,
          autoSkip: false,

          font: {
            size: 10
          }
        }
      },
      // x: {
      //   stacked: true,

      //   ticks: {
      //     maxRotation: 45,
      //     minRotation: 45,

      //     autoSkip: false,

      //     font: {
      //       size: 10
      //     }
      //   }
      // },
      y: {
        stacked: true,
        min: yScaleOptions.min,
        max: yScaleOptions.max,
        ticks: {
          stepSize: yScaleOptions.stepSize,
          callback: function (value: any) {
            return value + ' %'
          }
        }
      }
    },
    datalabels: {
      display: true // แสดง label ในที่นี้
    },
    elements: {
      bar: {
        barThickness: 100, // เพิ่มขนาด bar
        categoryPercentage: 1, // ปรับขนาดของบาร์ในแต่ละหมวดหมู่
        barPercentage: 1 // ปรับขนาดบาร์ให้ใหญ่ขึ้น
      }
    }
  }

  const dataSet = {
    labels: labelRender || [],
    datasets: dataRender
  }

  const zeroLinePlugin = {
    id: 'zeroLine',
    beforeDraw: (chart: any) => {
      const ctx = chart.ctx
      const yScale = chart.scales['y'] // ใช้แกน Y ของกราฟ
      const yPosition = yScale.getPixelForValue(0) // หาค่าตำแหน่งของค่า 0

      // ตั้งค่ารูปแบบเส้น
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(chart.chartArea.left, yPosition) // เริ่มต้นจากด้านซ้ายของกราฟ
      ctx.lineTo(chart.chartArea.right, yPosition) // ไปยังด้านขวาของกราฟ
      ctx.strokeStyle = '#C2C2C2' // สีของเส้น
      ctx.lineWidth = 1 // ความหนาของเส้น
      // ctx.setLineDash([5, 5]); // เส้นประ
      ctx.stroke()
      ctx.restore()
    }
  }

  return (
    <div>
      <div className="w-full flex justify-start items-center text-[16px] font-bold">{'Total Acc. Imbalance (%)'}</div>
      <div className="relative h-full">
        <Chart
          type="bar" // base type
          data={dataSet}
          options={{
            ...options,
            responsive: true,
            maintainAspectRatio: false
          }}
          className="w-full h-full"
          plugins={[zeroLinePlugin]}
        />
      </div>
      <div className="w-full flex justify-center items-center text-lg  font-bold text-[16px]">{'Gas Hour'}</div>
    </div>
  )
}

export default ChartSystem
