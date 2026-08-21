import {useEffect, useMemo, useRef} from 'react'
import React, {useState} from 'react'
import {Bar} from 'react-chartjs-2'
import {Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, BarElement} from 'chart.js'
import {useFetchMasters} from '@/hook/fetchMaster'
import {useAppDispatch} from '@/utils/store/store'
import {fetchShipperGroup} from '@/utils/store/slices/shipperGroupSlice'
import {fetchAreaMaster} from '@/utils/store/slices/areaMasterSlice'
import {fetchEntryExit} from '@/utils/store/slices/entryExitSlice'
// import annotationPlugin from 'chartjs-plugin-datalabels'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import {formatNumber} from '@/utils/generalFormatter'

// ChartJS.register(BarElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, annotationPlugin, ChartDataLabels)

ChartJS.register(BarElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ChartDataLabels)

interface TableProps {
  dataChart?: any
  userPermission?: any
  setFilterDataLongTerm?: any
  filterDataLongTerm?: any
}

const ChartLongTerm: React.FC<TableProps> = ({dataChart, userPermission, filterDataLongTerm, setFilterDataLongTerm}) => {
  let isLoading = true

  // ############### REDUX DATA ###############
  const {areaMaster} = useFetchMasters()
  const [forceRefetch, setForceRefetch] = useState(true)
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (forceRefetch) {
      dispatch(fetchShipperGroup())
      dispatch(fetchAreaMaster())
      dispatch(fetchEntryExit())
    }
    if (forceRefetch) {
      setForceRefetch(false)
    }
  }, [dispatch, areaMaster, forceRefetch])

  const allYears = useMemo(() => {
    return dataChart && Array.isArray(dataChart) ? Array.from(new Set(dataChart.flatMap((item: any) => item.year))) : []
  }, [dataChart])

  const totalValues = useMemo(() => {
    return allYears.map((year) =>
      dataChart.reduce((sum: any, item: any) => {
        const yearIndex = item.year.indexOf(year)
        return sum + (yearIndex !== -1 ? item.value[yearIndex] : 0)
      }, 0)
    )
  }, [dataChart, allYears])

  const datasets = useMemo(() => {
    return Array.isArray(dataChart)
      ? dataChart.map((item: any) => {
          return {
            label: item.area?.name,
            data: allYears.map((year) => {
              const yearIndex = item.year.indexOf(year)
              return yearIndex !== -1 ? item.value[yearIndex] : 0
            }),
            backgroundColor: item.area.color,
            maxBarThickness: 100,
            isEntry: item?.entry_exit_id == 1 ? true : false
          }
        })
      : []
  }, [dataChart, allYears])

  // Chart data
  //   const chartData = {
  //     labels: allYears,
  //     datasets: datasets
  //   }

  const chartData = useMemo(
    () => ({
      labels: allYears,
      datasets
    }),
    [allYears, datasets]
  )

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: true,
        position: 'top',

        onClick: (_event: any, legendItem: any, legend: any) => {
          const chart = legend.chart
          const datasetIndex = legendItem.datasetIndex

          if (datasetIndex === undefined) return

          const currentlyVisible = chart.isDatasetVisible(datasetIndex)

          chart.setDatasetVisibility(datasetIndex, !currentlyVisible)

          chart.update()
        },

        labels: {
          usePointStyle: true,
          font: {
            size: 12,
            weight: 'bold'
          },
          boxWidth: 20,
          boxHeight: 12,
          padding: 18,

          generateLabels: (chart: any) => {
            return chart.data.datasets.map((dataset: any, index: number) => {
              const isVisible = chart.isDatasetVisible(index)

              return {
                text: dataset.label,
                fillStyle: dataset.backgroundColor,
                strokeStyle: dataset.backgroundColor,
                pointStyle: dataset.isEntry ? 'rect' : 'circle',

                // ทำให้ label จาง/ขีดฆ่าเมื่อซ่อน
                hidden: !isVisible,

                datasetIndex: index
              }
            })
          }
        }
      },
      title: {
        display: false,
        color: '#58585A',
        // text: 'Total Supply (MMBTU)',
        text: 'Total Energy (MMBTU/D)', // v1.0.90 เปลี่ยนหัว Graph จาก "Total Supply (MMBTU)" เป็น "Total Energy (MMBTU/D)" https://app.clickup.com/t/86ert2k26
        font: {
          size: 15
        },
        position: 'top',
        align: 'start',
        zIndex: 5,
        padding: {
          top: -1,
          bottom: 1
        }
      },

      tooltip: {
        mode: 'index',
        enabled: true,
        intersect: false,
        backgroundColor: 'white',
        titleColor: '#767676',
        bodyColor: '#767676',
        padding: 18,
        boxPadding: 5,
        callbacks: {
          title: () => null, // Hides the title
          label: (tooltipItem: any) => {
            return tooltipItem?.dataset?.label + ': ' + `${formatNumber(tooltipItem?.raw)} (Year: ${tooltipItem?.label})`
          },

          labelColor: (context: any) => ({
            borderColor: context?.dataset?.backgroundColor || '#000',
            backgroundColor: context?.dataset?.backgroundColor || '#000',
            borderWidth: 0,
            borderRadius: 3
          })
        }
      },
      datalabels: {
        display: (context: any) => {
          const chart = context.chart
          const currentDatasetIndex = context.datasetIndex

          const visibleDatasetIndexes = chart.data.datasets.map((_dataset: any, index: number) => index).filter((index: number) => chart.isDatasetVisible(index))

          const lastVisibleDatasetIndex = visibleDatasetIndexes.at(-1)

          return currentDatasetIndex === lastVisibleDatasetIndex
        },

        align: 'end',
        anchor: 'end',

        formatter: (_value: any, context: any) => {
          const chart = context.chart
          const dataIndex = context.dataIndex

          const visibleTotal = chart.data.datasets.reduce((total: number, dataset: any, datasetIndex: number) => {
            if (!chart.isDatasetVisible(datasetIndex)) {
              return total
            }

            return total + Number(dataset.data[dataIndex] ?? 0)
          }, 0)

          return visibleTotal > 0 ? formatNumber(visibleTotal) : ''
        },

        font: {
          size: 12,
          weight: 'light'
        },

        color: '#000000',

        rotation: (context: any) => {
          const chartWidth = context.chart.width

          if (chartWidth > 1000) {
            return 0
          }

          if (chartWidth > 500) {
            return -45
          }

          return -90
        }
      }
      //   animation: {
      //     onSuccess: () => {
      //       const chart = ChartJS.getChart('LongtermChart')
      //       if (chart) {
      //         const {legend}: any = chart
      //         legend.top = -15
      //       }
      //     }
      //   }
    },
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'Years'
        },
        grid: {
          display: false // Remove grid lines on x-axis
        },
        categoryPercentage: 0.7, // Adjust bar width
        barPercentage: 0.9
      },
      y: {
        stacked: true,
        grace: '15%',
        grid: {
          display: false // Remove grid lines on y-axis
        },
        title: {
          display: false,
          text: 'Values (MMBTUD)'
        }
      }
    }
  }

  // ############### SAVE IMAGE OF CHART ###############
  const chartRef: any = useRef(null) // Create ref for the chart

  const handleSaveImage = () => {
    if (chartRef.current) {
      // Get the canvas element from the chart reference
      const imageURI = chartRef.current.toBase64Image() // Directly call on chartRef.current
      // Create a temporary <a> element to trigger download
      const link = document.createElement('a')
      link.href = imageURI
      link.download = 'chart.png' // Set the default file name
      link.click() // Trigger the download
    }
  }

  //   const ChartComponent = useMemo(() => {
  //     return dataChart && datasets ? <Bar ref={chartRef} id="LongtermChart" data={chartData} options={options} /> : null
  //   }, [dataChart, datasets, chartData, options])

  return (
    <div className={`h-auto min-h-[300px] overflow-y-auto block rounded-t-md relative z-1 p-2`}>
      <aside className="mt-auto ml-1 w-full sm:w-auto pb-2">
        <div className="flex justify-between w-full"></div>
      </aside>

      <div className="w-full overflow-x-auto overflow-y-hidden ">
        <div
          className="w-full p-2"
          style={{
            minWidth: chartData.labels.length > 10 ? `${chartData.labels.length * 65}px` : '100%'
          }}
        >
          <div className="mb-2 text-[16px] font-semibold text-[#58585A]">Total Energy (MMBTU/D)</div>

          <div className="relative h-[390px] w-full">{Array.isArray(dataChart) && datasets.length > 0 ? <Bar ref={chartRef} id="LongtermChart" data={chartData} options={options} /> : null}</div>
        </div>
      </div>
    </div>
  )
}

export default ChartLongTerm
