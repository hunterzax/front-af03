import {Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend} from 'chart.js'
import {Chart} from 'react-chartjs-2'
import {Bar} from 'react-chartjs-2'
import annotationPlugin from 'chartjs-plugin-datalabels'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import {useEffect, useState} from 'react'
import {formatNumber, formatNumberFourDecimal, toDayjs} from '@/utils/generalFormatter'
import {tr} from 'date-fns/locale'
import getUserValue from '@/utils/getuserValue'
import {zIndex} from 'html2canvas/dist/types/css/property-descriptors/z-index'
import {display} from 'html2canvas/dist/types/css/property-descriptors/display'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, annotationPlugin)

type Props = {
  data: any
  chartRef: any
  containerRef?: any
  showDateArray?: any
}

const ChartSystem: React.FC<Props> = ({data, chartRef, containerRef, showDateArray}) => {
  const userDT: any = getUserValue()
  const loadData: any = data

  const [tk, settk] = useState<Boolean>(false)
  const [dataRender, setdataRender] = useState<any>([])
  const [labelRender, setlabelRender] = useState<any>([])

  useEffect(() => {
    let findLabelx = []

    let findData = []

    const genarateData: any = loadData //real

    for (let index = 0; index < genarateData?.data?.length; index++) {
      const allowedHours = ['03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '24:00']

      const useData =
        genarateData?.data?.length > 0
          ? genarateData.data[index].hour.filter((f: any) =>
              // !!f?.zone &&
              allowedHours?.includes(f?.gas_hour_text)
            )
          : []

      if (useData?.length == 0) {
        let findIdx: any = genarateData?.data?.findIndex((item: any, indexof: any) => indexof == index)
        const dataNone: any = genarateData?.data[findIdx]

        const noneUse = allowedHours?.map((item: any) => {
          return {
            gas_hour_text: item,
            nonvalue: true
          }
        })

        findData.push(
          ...noneUse?.map((item: any) => {
            return item
          })
        ) //for chart data

        if (genarateData?.data?.length == 1) {
          findLabelx.push(
            ...noneUse?.map((item: any) => {
              return `${item?.gas_hour_text == '24:00' ? '00:00' : item?.gas_hour_text}`
            })
          ) //for chart label 1 day
        } else if (genarateData?.data?.length > 1) {
          findLabelx.push(
            ...noneUse?.map((item: any) => {
              return `${toDayjs(dataNone?.gas_day).format('DD/MM/YYYY')} ${item?.gas_hour_text == '24:00' ? '00:00' : item?.gas_hour_text}`
            })
          ) //for chart label many days
        }
      } else {
        findData.push(
          ...useData?.map((item: any) => {
            return item
          })
        ) //for chart data

        if (genarateData?.data?.length == 1) {
          findLabelx.push(
            ...useData?.map((item: any) => {
              return `${item?.gas_hour_text == '24:00' ? '00:00' : item?.gas_hour_text}`
            })
          ) //for chart label 1 day
        } else if (genarateData?.data?.length > 1) {
          findLabelx.push(
            ...useData?.map((item: any) => {
              return `${toDayjs(genarateData?.data[index]?.gas_day).format('DD/MM/YYYY')} ${item?.gas_hour_text == '24:00' ? '00:00' : item?.gas_hour_text}`
            })
          ) //for chart label many days
        }
      }
    }

    const fnTemplate = (template: any) => {
      const setDataTemplate = template?.map((e: any, ix: number) => {
        let styleChart = {}

        switch (e?.type) {
          case 'lineGraph':
            styleChart = {
              key: 'lineGraph',
              label: e?.lebel,
              data: findData?.map((eH: any) => {
                return eH?.nonvalue == true ? null : eH?.value?.[e?.key] !== null ? eH?.value?.[e?.key] : eH?.value?.[e?.key] == 0 ? 0 : null
              }),
              backgroundColor: e?.color,
              order: 1,
              type: 'line', // ← บอกว่าเป็นเส้น line
              borderColor: '#535353',
              borderWidth: 2,
              fill: false,
              tension: 0.3,
              pointBackgroundColor: '#535353',
              yAxisID: 'y', // ← ใช้แกน y เดียวกัน ถ้าไม่อยากแยก
              // ปิดจุด:
              pointRadius: 0,
              pointHoverRadius: 0,
              z: 10, // ถ้าใช้ Chart.js v4+ ช่วยกำหนด z-index ได้เลย
              spanGaps: true
            }
            break

          // case "bar":
          //   styleChart = {
          //     key: "bar",
          //     label: e?.lebel,
          //     data: findData?.map((eH: any) => {
          //       return eH?.nonvalue == true
          //         ? null
          //         : eH?.value?.[e?.key] !== null
          //           ? eH?.value?.[e?.key]
          //           : eH?.value?.[e?.key] == 0
          //             ? 0
          //             : null;
          //     }),
          //     backgroundColor: e?.color,
          //     // order: 3 - ix,
          //     // zIndex: 10 - ix,  // ตั้งค่า zIndex ให้ bar อยู่ด้านหลัง
          //     order: 3,
          //     zIndex: 10, // ตั้งค่า zIndex ให้ bar อยู่ด้านหลัง
          //     yAxisID: "y",
          //   };
          //   break;
          case 'bar':
            styleChart = { // https://app.clickup.com/t/9018502823/86ey4naeg
              key: 'bar',
              type: 'bar',

              label: e?.lebel,

              data: findData?.map((eH: any) => {
                if (eH?.nonvalue === true) {
                  return null
                }

                const value = eH?.value?.[e?.key]

                return value ?? null
              }),

              backgroundColor: e?.color,

              yAxisID: 'y',

              // สำคัญ
              // bar ทุก dataset ต้องใช้ stack เดียวกัน
              stack: 'accImbalance',

              order: 3,

              // optional
              borderWidth: 0
            }

            break

          case 'line':
            styleChart = {
              key: 'line',
              label: e?.lebel,
              data: findData?.map((eH: any) => {
                return eH?.nonvalue == true ? null : eH?.value?.[e?.key] || null
              }),
              backgroundColor: e?.color,
              borderColor: e?.color,
              fill: false,
              tension: 0,
              type: 'line', // ← บอกว่าเป็นเส้น line
              yAxisID: 'y', // ← ใช้แกน y เดียวกัน ถ้าไม่อยากแยก
              borderDash: [6, 3], // ← เพิ่มตรงนี้!
              borderWidth: 2, // ความหนาเส้น (ถ้าอยากปรับ)
              order: 0,
              // stack: `StackLine ${ix}`,

              // ปิดจุด:
              pointRadius: 2,
              pointHoverRadius: 5,
              z: 10, // ถ้าใช้ Chart.js v4+ ช่วยกำหนด z-index ได้เลย
              spanGaps: true
            }
            break
        }

        return styleChart
      })
      return setDataTemplate
    }

    const permission: any = userDT?.account_manage?.[0]?.user_type_id === 3 ? genarateData?.templateLabelKeys?.filter((item: any) => item?.key !== 'all') : genarateData?.templateLabelKeys

    const templateLabel = fnTemplate(permission)
    setlabelRender((pre: any) => findLabelx)
    // setlabelRender((pre: any) => findHour);
    setdataRender(templateLabel)
    settk(!tk)
  }, [loadData])

  function getSmartDynamicYScaleX(dataArray: any[]) {
    const allValues: number[] = []
    const allowedHours = ['03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '24:00']

    dataArray.forEach((dayItem: any) => {
      const dataHours =
        dayItem?.hour?.length > 0
          ? dayItem?.hour.filter((f: any) =>
              // !!f?.zone &&
              allowedHours?.includes(f?.gas_hour_text)
            )
          : []

      dataHours?.forEach((hourItem: any) => {
        if (hourItem?.value) {
          // ดึง keys ทั้งหมดจาก hourItem.value
          Object.keys(hourItem.value).forEach((key) => {
            const val: any = hourItem.value[key]
            // ตรวจสอบว่า value เป็นตัวเลขและไม่เป็น null
            if (typeof val === 'number' && !isNaN(val) && val !== null && key !== 'baseInv') {
              allValues.push(val)
            }
          })
        }
      })
    })

    if (allValues.length === 0) {
      return {min: -100, max: 100, stepSize: 20}
    }

    const maxVal = Math.max(...allValues)
    const minVal = Math.min(...allValues)

    // ปรับ max และ min ให้เหมาะสมกับข้อมูลที่เป็นทศนิยม
    let yMax = (Math.ceil(maxVal * 100) / 100) * 1.1 // ปัดขึ้นเป็นทศนิยม 2 ตำแหน่ง
    let yMin = (Math.floor(minVal * 100) / 100) * 1.1 // ปัดลงเป็นทศนิยม 2 ตำแหน่ง

    if (yMin > 0) {
      yMin = 0
    } else if (yMax < 0) {
      yMax = 0
    }

    const range = yMax - yMin

    // ✅ อยากให้มีประมาณ 6 เส้น Y
    const approxTickCount = 6

    function roundToClosestHundredThousand(value: any) {
      // ปัดไปที่หลัก 100,000 โดยไม่ทำให้เลขสูงเกินไป
      const sign = Math.sign(value)
      const absValue = Math.abs(value)

      // ปัดให้ใกล้เคียงกับ 100,000
      let roundedValue = Math.ceil(absValue / 100000) * 100000

      // ถ้าค่าเป็นลบให้กลับเครื่องหมาย
      return sign * roundedValue
    }

    // คำนวณ stepSize
    const rawStep = range / approxTickCount
    const stepMagnitude = Math.pow(10, Math.floor(Math.log10(rawStep)))
    const stepSize = Math.ceil(rawStep / stepMagnitude) * stepMagnitude

    return {
      min: roundToClosestHundredThousand(yMin),
      max: roundToClosestHundredThousand(yMax),
      stepSize
    }
  }

  function niceStep(value: number) {
    const exponent = Math.floor(Math.log10(value))
    const fraction = value / Math.pow(10, exponent)

    let niceFraction = 1
    if (fraction <= 1) niceFraction = 1
    else if (fraction <= 2) niceFraction = 2
    else if (fraction <= 2.5) niceFraction = 2.5
    else if (fraction <= 5) niceFraction = 5
    else niceFraction = 10

    return niceFraction * Math.pow(10, exponent)
  }

  function getSmartDynamicYScale(dataArray: any[]) {
    const allValues: number[] = []
    const allowedHours = ['03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '24:00']

    dataArray.forEach((dayItem: any) => {
      const dataHours = dayItem?.hour?.length > 0 ? dayItem.hour.filter((f: any) => allowedHours.includes(f?.gas_hour_text)) : []

      dataHours.forEach((hourItem: any) => {
        if (hourItem?.value) {
          Object.keys(hourItem.value).forEach((key) => {
            const val = hourItem.value[key]

            if (typeof val === 'number' && !Number.isNaN(val) && key !== 'baseInv') {
              allValues.push(val)
            }
          })
        }
      })
    })

    if (allValues.length === 0) {
      return {min: -100, max: 100, stepSize: 50}
    }

    const rawMin = Math.min(...allValues)
    const rawMax = Math.max(...allValues)

    const tickCount = 6
    const paddingRatio = 0.05 // จาก 0.12 ลดเป็น 5%

    const rawRange = rawMax - rawMin || Math.abs(rawMax) || 100

    const padding = rawRange * paddingRatio

    const paddedMin = rawMin - padding
    const paddedMax = rawMax + padding

    const stepSize = niceStep((paddedMax - paddedMin) / tickCount)

    const yMin = Math.floor(paddedMin / stepSize) * stepSize
    const yMax = Math.ceil(paddedMax / stepSize) * stepSize

    // const tickCount = 8;
    // const rawRange = rawMax - rawMin || Math.abs(rawMax) || 100;

    // // padding ตามข้อมูลจริง
    // const padding = rawRange * 0.12;

    // const paddedMin = rawMin - padding;
    // const paddedMax = rawMax + padding;

    // const stepSize = niceStep((paddedMax - paddedMin) / tickCount);

    // const yMin = Math.floor(paddedMin / stepSize) * stepSize;
    // const yMax = Math.ceil(paddedMax / stepSize) * stepSize;

    return {
      min: yMin,
      max: yMax,
      stepSize
    }
  }

  // function getSmartDynamicYScale(dataArray: any[]) {
  //     const allValues: number[] = [];
  //     const allowedHours = ["03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00", "24:00"];

  //     dataArray.forEach((dayItem: any) => {
  //         const dataHours = dayItem?.hour?.length > 0
  //             ? dayItem?.hour.filter((f: any) =>
  //                 allowedHours?.includes(f?.gas_hour_text)
  //             )
  //             : [];
  //         dataHours?.forEach((hourItem: any) => {
  //             if (hourItem?.value) {
  //                 Object.keys(hourItem.value).forEach((key) => {
  //                     const val: any = hourItem.value[key];
  //                     if (typeof val === 'number' && !isNaN(val) && val !== null && key !== "baseInv") {
  //                         allValues.push(val);
  //                     }
  //                 });
  //             }
  //         });
  //     });

  //     if (allValues.length === 0) {
  //         return { min: -100, max: 100, stepSize: 20 };
  //     }
  //     const rawMax = Math.max(...allValues);
  //     const rawMin = Math.min(...allValues);

  //     // ✅ ปัด "ขึ้น" ไปยังหลักแสนที่ใกล้ที่สุด และเป็น "เลขคู่"
  //     function roundUpToEvenHundredThousand(value: number): number {
  //         let rounded = Math.ceil(Math.abs(value) / 100000) * 100000;
  //         if ((rounded / 100000) % 2 !== 0) {
  //             rounded += 100000; // ถ้าไม่ใช่เลขคู่ ปัดขึ้นอีกขั้น
  //         }
  //         return rounded;
  //     }

  //     const maxAbs = Math.max(Math.abs(rawMax), Math.abs(rawMin));
  //     const roundedMax = roundUpToEvenHundredThousand(maxAbs);
  //     const yMax = roundedMax;
  //     // 🔥 เอา min จริงมาใช้ + padding นิดเดียว
  //     const padding = Math.abs(rawMin) * 0.1 || 1000;
  //     const yMin = rawMin - padding;
  //     // const yMin = -roundedMax;

  //     // const range = yMax - yMin;
  //     const range = rawMax - rawMin;

  //     // ✅ แสดง 8 เส้น → 4 บวก / 4 ลบ
  //     const approxTickCount = 10; // 🔁 จากเดิม 8 เป็น 10
  //     const stepSize = range / (approxTickCount - 1); // 9 ช่อง

  //     // ปัด stepSize ให้กลมขึ้น
  //     const stepMagnitude = Math.pow(10, Math.floor(Math.log10(stepSize)));
  //     const finalStepSize = Math.ceil(stepSize / stepMagnitude) * stepMagnitude;

  //     return {
  //         // min: yMin,
  //         // max: yMax,
  //         min: rawMin - range * 0.1,
  //         max: rawMax + range * 0.1,
  //         stepSize: finalStepSize,
  //     };
  // }

  const yScaleOptions = getSmartDynamicYScale(loadData?.data || []) //<=== หาค่า max สุดของ value หากเกินค่า default 200 จะ min - max ตาม ค่ามากสุดทันที

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: false
      },
      datalabels: {
        display: false
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
      //         chart?.data?.datasets
      //           ?.map((item: any, i: any) => {
      //             const backgroundColor =
      //               chart?.data?.datasets[i].backgroundColor;

      //             if (item?.key == "lineGraph") {
      //               return {
      //                 datasetIndex: i,
      //                 text: `${item?.label}`,
      //                 hidden: chart.getDatasetMeta(i).hidden,
      //                 fillStyle: backgroundColor,
      //                 strokeStyle: backgroundColor,
      //                 fontColor: "#787486",
      //                 borderWidth: 1,
      //                 rotation: 0,
      //                 borderRadius: 0,
      //                 pointStyle: "line",
      //               };
      //             } else if (item?.key == "line") {
      //               return {
      //                 datasetIndex: i,
      //                 text: `${item?.label}`,
      //                 hidden: chart.getDatasetMeta(i).hidden,
      //                 fillStyle: backgroundColor,
      //                 strokeStyle: backgroundColor,
      //                 fontColor: "#787486",
      //                 borderWidth: 1,
      //                 rotation: 0,
      //                 borderRadius: 0,
      //                 pointStyle: createDoubleLineSymbol(backgroundColor),
      //               };
      //             } else {
      //               return {
      //                 datasetIndex: i,
      //                 text: `${item?.label}`,
      //                 hidden: chart.getDatasetMeta(i).hidden,
      //                 fillStyle: backgroundColor,
      //                 strokeStyle: backgroundColor,
      //                 fontColor: "#787486",
      //                 borderWidth: 1,
      //                 borderRadius: 3,
      //                 usePointStyle: true, // ต้องใส่ถ้าใช้ pointStyle: 'circle'
      //                 pointStyle: "circle",
      //                 boxWidth: 1, // ปรับขนาดความกว้าง
      //                 boxHeight: 1, // ปรับความสูง (Chart.js 4.x)
      //               };
      //             }
      //             // if (item?.key == 'line') {
      //             //     return null; //ไม่แสดงบน legend
      //             // } else if (item?.key == "lineGraph") {
      //             //     return null; //ไม่แสดงบน legend
      //             // } else {
      //             //     return {
      //             //         datasetIndex: i,
      //             //         text: `${item?.label}`,
      //             //         hidden: chart.getDatasetMeta(i).hidden,
      //             //         fillStyle: backgroundColor,
      //             //         strokeStyle: backgroundColor,
      //             //         fontColor: '#787486',
      //             //         borderWidth: 1,
      //             //         borderRadius: 3,
      //             //         usePointStyle: true, // ต้องใส่ถ้าใช้ pointStyle: 'circle'
      //             //         pointStyle: 'circle',
      //             //         boxWidth: 1,  // ปรับขนาดความกว้าง
      //             //         boxHeight: 1, // ปรับความสูง (Chart.js 4.x)
      //             //     };
      //             // }
      //           })
      //           .filter(Boolean),
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

                if (item?.key == 'lineGraph') {
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
                    pointStyle: 'line'
                  }
                } else if (item?.key == 'line') {
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
                } else {
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
                }
              })
              .filter(Boolean)
        }
      },
      tooltip: {
        usePointStyle: true,
        callbacks: {
          label: function (context: any) {
            // const typeOf: any = context?.dataset?.type
            return `${context.dataset.label}: ${formatNumberFourDecimal(context?.raw)}`
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
    // scales: {
    //   x: {
    //     stacked: false,
    //   },
    //   y: {
    //     display: true,
    //     stacked: false,
    //     min: yScaleOptions.min,
    //     max: yScaleOptions.max,
    //     ticks: {
    //       stepSize: yScaleOptions.stepSize,
    //       callback: function (value: number) {
    //         const absValue = Math.abs(value);
    //         if (absValue >= 1_000_000) {
    //           return (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    //         } else if (absValue >= 100_000) {
    //           return (value / 1_000).toFixed(0) + "K";
    //         } else {
    //           return value.toLocaleString();
    //         }
    //       },
    //     },
    //   },
    // },
    scales: { // https://app.clickup.com/t/9018502823/86ey4naeg
      x: {
        stacked: true
      },

      y: {
        display: true,

        // สำคัญ
        stacked: true,

        min: yScaleOptions.min,
        max: yScaleOptions.max,

        ticks: {
          stepSize: yScaleOptions.stepSize,

          callback: function (value: number) {
            const absValue = Math.abs(value)

            if (absValue >= 1_000_000) {
              return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
            }

            if (absValue >= 100_000) {
              return (value / 1_000).toFixed(0) + 'K'
            }

            return value.toLocaleString()
          }
        }
      }
    },
    datalabels: {
      display: false
    }
  }

  const dataSet = {
    labels: labelRender || [],
    datasets: dataRender
  }

  function formatSortedDates(dateArray: string[]) {
    // เรียงวันที่จากน้อยไปมาก
    const sorted = dateArray
      .slice() // copy array เดิม
      .sort((a, b) => {
        // แปลงเป็น dayjs แล้วเปรียบเทียบ timestamp
        return toDayjs(a).valueOf() - toDayjs(b).valueOf()
      })

    // map แปลง format
    return sorted.map((date) => toDayjs(date).format('DD/MM/YYYY'))
  }

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

  // const zeroLinePlugin = {
  //     id: 'zeroLine',
  //     beforeDraw: (chart: any) => {
  //         const ctx = chart.ctx;
  //         const yScale = chart.scales['y2'];  // ใช้แกน Y ของกราฟ
  //         const yPosition = yScale.getPixelForValue(0);  // หาค่าตำแหน่งของค่า 0

  //         // ตั้งค่ารูปแบบเส้น
  //         ctx.save();
  //         ctx.beginPath();
  //         ctx.moveTo(chart.chartArea.left, yPosition);  // เริ่มต้นจากด้านซ้ายของกราฟ
  //         ctx.lineTo(chart.chartArea.right, yPosition); // ไปยังด้านขวาของกราฟ
  //         ctx.strokeStyle = '#C2C2C2';  // สีของเส้น
  //         ctx.lineWidth = 1;  // ความหนาของเส้น
  //         // ctx.setLineDash([5, 5]); // เส้นประ
  //         ctx.stroke();
  //         ctx.restore();
  //     }
  // };

  const zeroLinePlugin = {
    id: 'zeroLine',
    beforeDraw: (chart: any) => {
      const ctx = chart.ctx
      const yScale = chart.scales['y'] // เปลี่ยนจาก y2 เป็น y

      if (!yScale) return

      const yPosition = yScale.getPixelForValue(0)

      ctx.save()
      ctx.beginPath()
      ctx.moveTo(chart.chartArea.left, yPosition)
      ctx.lineTo(chart.chartArea.right, yPosition)
      ctx.strokeStyle = '#C2C2C2'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.restore()
    }
  }

  function getSmartDynamicYScaleFromValues(values: number[]) {
    if (!values.length) {
      return {min: -100, max: 100, stepSize: 50}
    }

    const rawMin = Math.min(...values)
    const rawMax = Math.max(...values)

    const tickCount = 6
    const rawRange = rawMax - rawMin || Math.abs(rawMax) || 100
    const padding = rawRange * 0.05

    // ให้แกนเห็น 0 เสมอ
    const paddedMin = Math.min(rawMin - padding, 0)
    const paddedMax = Math.max(rawMax + padding, 0)

    const stepSize = niceStep((paddedMax - paddedMin) / tickCount)

    return {
      min: Math.floor(paddedMin / stepSize) * stepSize,
      max: Math.ceil(paddedMax / stepSize) * stepSize,
      stepSize
    }
  }

  function getVisibleYScale(chart: any) {
    const values: number[] = []

    chart.data.datasets.forEach((dataset: any, datasetIndex: number) => {
      if (!chart.isDatasetVisible(datasetIndex)) return

      dataset.data?.forEach((raw: any) => {
        if (raw === null || raw === undefined) return

        const val = typeof raw === 'number' ? raw : typeof raw?.y === 'number' ? raw.y : Number(raw)

        if (Number.isFinite(val)) {
          values.push(val)
        }
      })
    })

    return getSmartDynamicYScaleFromValues(values)
  }

  function applyVisibleYScale(chart: any) {
    const yScale = getVisibleYScale(chart)

    chart.options.scales.y.min = yScale.min
    chart.options.scales.y.max = yScale.max
    chart.options.scales.y.ticks.stepSize = yScale.stepSize

    chart.update()
  }

  return (
    <div className="relative h-full py-3 px-1" ref={containerRef}>
      {/* <div className="date-label text-[#58585A] flex font-bold text-2xl mb-5">
                <div className="mr-2">{'Date : '}</div>
                {formatSortedDates(showDateArray)?.map((item: any, index: any) => {
                    return (<div className={`${showDateArray?.length - 1 !== index ? 'mr-2' : 'mr-0'}`}>{item + (showDateArray?.length - 1 !== index ? ',' : '')}</div>)
                })}
            </div> */}
      <div className="w-full flex justify-start items-center text-[16px] font-bold mb-2">{'Acc.Imbalance (MMBTU)'}</div>
      <div className="relative h-[500px]">
        <Chart
          type="bar" // base type
          data={dataSet}
          options={{
            ...options,
            responsive: true,
            maintainAspectRatio: false
          }}
          plugins={[zeroLinePlugin]}
          // plugins={[]}
          className="w-full h-full"
        />
      </div>
      <div className="w-full flex justify-center items-center text-lg  font-bold text-[16px]">{'Gas Hour'}</div>
    </div>
  )
}

export default ChartSystem
