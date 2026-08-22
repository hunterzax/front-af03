'use client'
import {useEffect, useMemo, useRef, useState} from 'react'
import {findRoleConfigByMenuName, formatNumberFourDecimal, generateUserPermission, toDayjs} from '@/utils/generalFormatter'
import {getService, postService} from '@/utils/postService'
import BtnExport from '@/components/other/btnExport'
import {useFetchMasters} from '@/hook/fetchMaster'
import DatePickaSearch from '@/components/library/dateRang/dateSearch'
import BtnSearch from '@/components/other/btnSearch'
import BtnReset from '@/components/other/btnReset'
import PaginationComponent from '@/components/other/globalPagination'
import ColumnVisibilityPopover from '@/components/other/popOverShowHideCol'
import {useAppDispatch} from '@/utils/store/store'
import {fetchZoneMasterSlice} from '@/utils/store/slices/zoneMasterSlice'
import {fetchAreaMaster} from '@/utils/store/slices/areaMasterSlice'
import getCookieValue from '@/utils/getCookieValue'
import useRestrictedPage from '@/utils/checkRestrictedPage'
import {decryptData} from '@/utils/encryptionData'
import BtnGeneral from '@/components/other/btnGeneral'
import getUserValue from '@/utils/getuserValue'
import {InputSearch} from '@/components/other/SearchForm'
import {useForm} from 'react-hook-form'
import {Tab, Tabs} from '@mui/material'
import ChartSystem from './form/chart'
import ChartSystemMenu from './form/ChartSystem'
import AppTable, {myCustomSortingByDateFn} from '@/components/table/AppTable'
import {ColumnDef} from '@tanstack/react-table'
import Spinloading from '@/components/other/spinLoading'
import html2canvas from 'html2canvas'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import {useSearchParams} from 'next/navigation'
import {intradayAccImbalanceDashboard} from '@/utils/exportFunc'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Bangkok')

interface ClientProps {
  params: {
    lng: string
  }
}

const ClientPage: React.FC<ClientProps> = (props) => {
  const searchParams = useSearchParams()
  const filter_date: any = searchParams.get('date')
  const today: any = filter_date ? dayjs(filter_date, 'YYYY-MM-DD').format('YYYY-MM-DD') : toDayjs().format('YYYY-MM-DD') //real
  // const today: any = filter_date ? dayjs(filter_date, "YYYY-MM-DD").format("YYYY-MM-DD") : toDayjs("2026-03-01").format("YYYY-MM-DD"); // test

  // ############### Check Authen ###############
  const userDT: any = getUserValue()
  const token = getCookieValue('v4r2d9z5m3h0c1p0x7l')
  useRestrictedPage(token)

  // ############### PERMISSION ###############
  const [userPermission, setUserPermission] = useState<any>()
  let user_permission: any = localStorage?.getItem('k3a9r2b6m7t0x5w1s8j')
  user_permission = user_permission ? decryptData(user_permission) : null

  const getPermission = () => {
    try {
      user_permission = user_permission ? JSON.parse(user_permission) : null // Convert JSON string to object
      const permission = findRoleConfigByMenuName('Intraday Acc. Imbalance Dashboard', userDT)
      if (permission) {
        setUserPermission(permission)
      } else if (user_permission?.role_config) {
        const updatedUserPermission = generateUserPermission(user_permission)
        setUserPermission(updatedUserPermission)
      }
    } catch (error) {
      // Failed to parse user_permission:
    }
  }

  // ############### REDUX DATA ###############
  const {zoneMaster, areaMaster} = useFetchMasters()
  const [forceRefetch, setForceRefetch] = useState(true)
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (forceRefetch) {
      dispatch(fetchZoneMasterSlice())
      dispatch(fetchAreaMaster())
      // dispatch(fetchNominationPoint());
      // dispatch(fetchContractPoint());
    }
    if (forceRefetch) {
      setForceRefetch(false)
    }
    getPermission()
  }, [dispatch, zoneMaster, areaMaster, forceRefetch])

  // ############### FIELD SEARCH ###############
  const {
    register,
    setValue,
    reset,
    formState: {errors},
    watch,
    getValues
  } = useForm<any>()

  const [key, setKey] = useState(0)
  // const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
  const [srchDate, setSrchDate] = useState<Date | null>(today)
  // const [srchNextDate, setSrchNextDate] = useState<Date | null>(null);

  // ############### LIKE SEARCH ###############
  // const handleSearch = (query: string) => {
  // };

  // ############### DATA TABLE ###############
  const [tabIndex, setTabIndex] = useState(0)
  const [dataTable, setData] = useState<any>([])
  const [dataforTable, setdataforTable] = useState<any>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [resetForm, setResetForm] = useState<() => void | null>()

  const [tk, settk] = useState<boolean>(false)
  const [dataShipper, setDataShipper] = useState<any>([])
  const [srchShipperName, setSrchShipperName] = useState<any>([])
  const [dataDateArray, setdataDateArray] = useState<any>([])
  const [srchDateArray, setsrchDateArray] = useState<any>([]) // for search
  const [showDateArray, setshowDateArray] = useState<any>([]) // for show

  const [dataExport, setDataExport] = useState<any>([])

  const handleChange = (event: any, newValue: any) => {
    setTabIndex(newValue)
    settk(!tk)
  }

  useEffect(() => {
    fetchData(srchDate)
  }, [tabIndex])

  // useEffect(() => {
  //   setSrchDate(today)
  // }, [])

  const colorSHIPPER = [
    {
      id_name: 'NGP-S16-001',
      name: 'PTT',
      color: '#26275F'
    },
    {
      id_name: 'NGP-S17-002',
      name: 'EGAT',
      color: '#FFCA0B'
    },
    {
      id_name: 'NGP-S20-005',
      name: 'HKH',
      color: '#80BC04'
    },
    {
      id_name: 'NGP-S20-004',
      name: 'B.GRIMM',
      color: '#FF6829'
    },
    {
      id_name: 'NGP-S20-003',
      name: 'GULF',
      color: '#014A99'
    },
    //========================================
    {
      id_name: 'NGP-S21-006',
      name: 'EGGO',
      color: '#409A3C'
    },
    {
      id_name: 'NGP-S21-007',
      name: 'PTTGL',
      color: '#0BA2ED'
    },
    {
      id_name: 'NGP-S21-008',
      name: 'SCG',
      color: '#009989'
    }
  ]

  // #region fetchData
  // const fetchData = async (date: any, reset?: boolean) => {
  //     setIsLoading(true);

  //     try {
  //         const body_main = {
  //             "gas_day": date,
  //             "start_hour": 1,
  //             "end_hour": 24,
  //             "skip": 0,
  //             "limit": 100,
  //             "tab": tabIndex == 0 ? "EAST" : "WEST", // EAST , WEST
  //             // "shipper": srchShipperName, // ["NGP-S01-001", "NGP-S01-002"]
  //             "shipper": srchShipperName?.length > 0 ? srchShipperName : userDT?.account_manage?.[0]?.user_type_id == 3 ? [userDT?.account_manage?.[0]?.group?.id_name] : [], // กันส่งมา 1. Intraday Acc. Imbalance Dashboard > กรณีที่ Shipper ล็อกอินเข้ามา ระบบต้องแสดงแค่เฉพาะข้อมูลของ Shipper รายนั้น จากภาพเข้ามาแล้วยังเห็นของคนอื่น ต้องกด filter อีกรอบนึง ระบบถึงจะแสดงเฉพาะของตัวเอง : มันต้องแสดงเฉพาะข้อมูลของตัวเองตั้งแต่แรกเลย
  //             "isSystemValue": srchShipperName?.length == dataShipper?.length ? true : false
  //         }
  //         console.log('body_main : ', body_main);
  //         // MAIN DATA
  //         const response_ = await postService('/master/balancing/intraday-acc-imbalance-dashboard', body_main);
  //         const res_shipper_name = await getService(`/master/account-manage/group-master?user_type=3`);

  //         // f?.key !== "high_max_percentage" &&
  //         //         f?.key !== "low_max_percentage"

  //         let response = {
  //             data: [],
  //             templateLabelKeys: []
  //         }
  //         if (userDT?.account_manage?.[0]?.user_type_id == 3) {
  //             response = {
  //                 data: response_?.data || [],
  //                 templateLabelKeys: (response_?.templateLabelKeys?.filter((f:any) => {
  //                     return (
  //                         f?.key !== "high_max" &&
  //                         f?.key !== "low_max"
  //                     )
  //                 })?.map((e:any) => {
  //                     const {color, ...nE} = e
  //                     return {
  //                         ...nE,
  //                         color: colorSHIPPER?.find((f:any) => f?.name === nE?.lebel)?.color || color
  //                     }
  //                 })) || [],
  //             }
  //         }else{

  //             response = {
  //                 data: response_?.data || [],
  //                 templateLabelKeys: (response_?.templateLabelKeys?.map((e:any) => {
  //                     const {color, ...nE} = e
  //                     return {
  //                         ...nE,
  //                         color: colorSHIPPER?.find((f:any) => f?.name === nE?.lebel)?.color || color
  //                     }
  //                 })) || [],
  //             }
  //         }
  //         console.log('response : ', response);

  //         // colorSHIPPER

  //         // templateLabelKeys

  //         setDataShipper(res_shipper_name);
  //         setSrchDate(date);

  //         const dataForDate: any = response?.data?.map((item: any) => { return { gas_day: item?.gas_day } });
  //         const renderOption = sortByGasDay(dataForDate).map((item: any) => ({
  //             value: item.gas_day,
  //             label: toDayjs(item.gas_day).format('DD/MM/YYYY'),
  //         }));
  //         setdataDateArray((pre: any) => renderOption);

  //         let dateSelectedProps: any = [];
  //         const sortGasday = (Arr: any) => {
  //             return Arr?.slice().sort((a: any, b: any) => {
  //                 if (!a.gas_day || !b.gas_day) return 0;

  //                 // แปลงจาก "DD/MM/YYYY" เป็น Date
  //                 const [dayA, monthA, yearA] = a.gas_day.split("/").map(Number);
  //                 const [dayB, monthB, yearB] = b.gas_day.split("/").map(Number);

  //                 const dateA = new Date(yearA, monthA - 1, dayA);
  //                 const dateB = new Date(yearB, monthB - 1, dayB);

  //                 return dateA.getTime() - dateB.getTime(); // เรียงจากน้อย -> มาก
  //             });
  //         };

  //         if (reset == true) {
  //             if (userDT?.account_manage?.[0]?.user_type_id == 3) {
  //                 setSrchShipperName([userDT?.account_manage?.[0]?.group?.id_name])
  //             } else {
  //                 setSrchShipperName(res_shipper_name?.map((item: any) => { return item?.id_name }))
  //             }

  //             dateSelectedProps = dataForDate?.filter(
  //                 (item: any) => {
  //                     return (
  //                         toDayjs(item?.gas_day)?.format("YYYY-MM-DD") == date
  //                     )
  //                 }
  //             ) || [];

  //             setsrchDateArray(sortGasday(dateSelectedProps)?.map((item: any) => { return item?.gas_day }));
  //         } else {
  //             if (srchDateArray?.length == 0 && !dataTable?.data) { //first fetch
  //                 dateSelectedProps = dataForDate?.filter(
  //                     (item: any) => {
  //                         return (
  //                             toDayjs(item?.gas_day)?.format("YYYY-MM-DD") == today
  //                         )
  //                     }
  //                 ) || [];

  //                 // setsrchDateArray(dateSelectedProps?.map((item: any) => { return item?.gas_day }));
  //                 setsrchDateArray(sortGasday(dateSelectedProps)?.map((item: any) => { return item?.gas_day }));

  //             } else if (srchDateArray?.length > 0) {// filter datarops
  //                 let dataFind: any = [];
  //                 for (let index = 0; index < srchDateArray?.length; index++) {
  //                     dataFind.push(
  //                         ...dataForDate?.filter(
  //                             (item: any) => {
  //                                 return (
  //                                     toDayjs(item?.gas_day)?.format("YYYY-MM-DD") == srchDateArray[index]
  //                                 )
  //                             })
  //                     )
  //                 }

  //                 const result: any = dataFind?.length > 0 ? dataFind : dataForDate?.filter((item: any) => toDayjs(item?.gas_day)?.format("YYYY-MM-DD") == toDayjs(srchDate).format("YYYY-MM-DD"));

  //                 dateSelectedProps = result;
  //                 setsrchDateArray(sortGasday(result)?.map((item: any) => { return item?.gas_day }));
  //             } else {
  //                 const result: any = dataForDate?.filter((item: any) => toDayjs(item?.gas_day)?.format("YYYY-MM-DD") == toDayjs(srchDate).format("YYYY-MM-DD"));

  //                 dateSelectedProps = result;
  //                 setsrchDateArray(sortGasday(result)?.map((item: any) => { return item?.gas_day }));
  //             }
  //         }

  //         const fdaySelected: any = dateSelectedProps?.map((item: any) => { return item?.gas_day });
  //         let renderDataToChart: any = fDataPreviousOrNEXT(fdaySelected, response)

  //         setData(renderDataToChart);

  //         settk(!tk);
  //         transferForTable(renderDataToChart, fdaySelected);

  //     } catch (error) {

  //     }
  // };
  const fetchData = async (date: any, reset?: boolean) => {
    setIsLoading(true)

    try {
      const isShipperUser = userDT?.account_manage?.[0]?.user_type_id === 3

      const ownShipperId = userDT?.account_manage?.[0]?.group?.id_name

      const selectedShippers = isShipperUser ? (ownShipperId ? [ownShipperId] : []) : (srchShipperName ?? [])

      const isAllShipperSelected = !isShipperUser && dataShipper?.length > 0 && selectedShippers.length === dataShipper.length

      const body_main = {
        gas_day: date,
        start_hour: 1,
        end_hour: 24,
        skip: 0,
        limit: 100,
        tab: tabIndex === 0 ? 'EAST' : 'WEST',

        // Shipper ต้องส่งเฉพาะ group ของตัวเองเสมอ
        shipper: selectedShippers,

        // Shipper ห้ามใช้ค่าของ System
        isSystemValue: isShipperUser ? false : isAllShipperSelected
      }

      console.log('body_main :', body_main)

      const response_ = await postService('/master/balancing/intraday-acc-imbalance-dashboard', body_main)

      const res_shipper_name = await getService('/master/account-manage/group-master?user_type=3')

      // โค้ดส่วนที่เหลือเหมือนเดิม

      // f?.key !== "high_max_percentage" &&
      //         f?.key !== "low_max_percentage"

      let response = {
        data: [],
        templateLabelKeys: []
      }
      if (userDT?.account_manage?.[0]?.user_type_id == 3) {
        response = {
          data: response_?.data || [],
          templateLabelKeys:
            response_?.templateLabelKeys
              ?.filter((f: any) => {
                return f?.key !== 'high_max' && f?.key !== 'low_max'
              })
              ?.map((e: any) => {
                const {color, ...nE} = e
                return {
                  ...nE,
                  color: colorSHIPPER?.find((f: any) => f?.name === nE?.lebel)?.color || color
                }
              }) || []
        }
      } else {
        response = {
          data: response_?.data || [],
          templateLabelKeys:
            response_?.templateLabelKeys?.map((e: any) => {
              const {color, ...nE} = e
              return {
                ...nE,
                color: colorSHIPPER?.find((f: any) => f?.name === nE?.lebel)?.color || color
              }
            }) || []
        }
      }
      console.log('response : ', response)

      // colorSHIPPER

      // templateLabelKeys

      setDataShipper(res_shipper_name)
      setSrchDate(date)

      const dataForDate: any = response?.data?.map((item: any) => {
        return {gas_day: item?.gas_day}
      })
      const renderOption = sortByGasDay(dataForDate).map((item: any) => ({
        value: item.gas_day,
        label: toDayjs(item.gas_day).format('DD/MM/YYYY')
      }))
      setdataDateArray((pre: any) => renderOption)

      let dateSelectedProps: any = []
      const sortGasday = (Arr: any) => {
        return Arr?.slice().sort((a: any, b: any) => {
          if (!a.gas_day || !b.gas_day) return 0

          // แปลงจาก "DD/MM/YYYY" เป็น Date
          const [dayA, monthA, yearA] = a.gas_day.split('/').map(Number)
          const [dayB, monthB, yearB] = b.gas_day.split('/').map(Number)

          const dateA = new Date(yearA, monthA - 1, dayA)
          const dateB = new Date(yearB, monthB - 1, dayB)

          return dateA.getTime() - dateB.getTime() // เรียงจากน้อย -> มาก
        })
      }

      if (reset == true) {
        if (userDT?.account_manage?.[0]?.user_type_id == 3) {
          setSrchShipperName([userDT?.account_manage?.[0]?.group?.id_name])
        } else {
          setSrchShipperName(
            res_shipper_name?.map((item: any) => {
              return item?.id_name
            })
          )
        }

        dateSelectedProps =
          dataForDate?.filter((item: any) => {
            return toDayjs(item?.gas_day)?.format('YYYY-MM-DD') == date
          }) || []

        setsrchDateArray(
          sortGasday(dateSelectedProps)?.map((item: any) => {
            return item?.gas_day
          })
        )
      } else {
        if (srchDateArray?.length == 0 && !dataTable?.data) {
          //first fetch
          dateSelectedProps =
            dataForDate?.filter((item: any) => {
              return toDayjs(item?.gas_day)?.format('YYYY-MM-DD') == today
            }) || []

          // setsrchDateArray(dateSelectedProps?.map((item: any) => { return item?.gas_day }));
          setsrchDateArray(
            sortGasday(dateSelectedProps)?.map((item: any) => {
              return item?.gas_day
            })
          )
        } else if (srchDateArray?.length > 0) {
          // filter datarops
          let dataFind: any = []
          for (let index = 0; index < srchDateArray?.length; index++) {
            dataFind.push(
              ...dataForDate?.filter((item: any) => {
                return toDayjs(item?.gas_day)?.format('YYYY-MM-DD') == srchDateArray[index]
              })
            )
          }

          const result: any = dataFind?.length > 0 ? dataFind : dataForDate?.filter((item: any) => toDayjs(item?.gas_day)?.format('YYYY-MM-DD') == toDayjs(srchDate).format('YYYY-MM-DD'))

          dateSelectedProps = result
          setsrchDateArray(
            sortGasday(result)?.map((item: any) => {
              return item?.gas_day
            })
          )
        } else {
          const result: any = dataForDate?.filter((item: any) => toDayjs(item?.gas_day)?.format('YYYY-MM-DD') == toDayjs(srchDate).format('YYYY-MM-DD'))

          dateSelectedProps = result
          setsrchDateArray(
            sortGasday(result)?.map((item: any) => {
              return item?.gas_day
            })
          )
        }
      }

      const fdaySelected: any = dateSelectedProps?.map((item: any) => {
        return item?.gas_day
      })
      let renderDataToChart: any = fDataPreviousOrNEXT(fdaySelected, response)

      setData(renderDataToChart)

      settk(!tk)
      transferForTable(renderDataToChart, fdaySelected)
    } catch (error) {}
  }

  function sortByGasDay(arr: any) {
    return arr?.slice().sort((a: any, b: any) => {
      return new Date(a.gas_day).getTime() - new Date(b.gas_day).getTime()
    })
  }

  const fDataPreviousOrNEXT = (arr: any, data: any) => {
    let foundData: any = []
    for (let index = 0; index < arr?.length; index++) {
      const xx: any = data?.data?.filter((item: any) => {
        return item?.gas_day == arr[index]
      })
      foundData.push(...xx)
    }

    const makeData: any = {
      data: foundData,
      templateLabelKeys: data?.templateLabelKeys
    }

    return makeData
  }

  const [srchDate_, setsrchDate_] = useState<any>(dayjs().format('DD/MM/YYYY'))

  //   const handleFieldSearch = async () => {
  //     console.log('4')
  //     setIsLoading(true)

  //     const formatDate: any = srchDate ? toDayjs(srchDate).format('YYYY-MM-DD') : null
  //     fetchData(formatDate)
  //     fetchDataSys(formatDate)

  //     // srchDate
  //     setsrchDate_(formatDate)

  //     setTimeout(() => {
  //       setIsLoading(false)
  //     }, 500)
  //   }
  const handleFieldSearch = async () => {
    setIsLoading(true)

    try {
      const formatDate: any = srchDate ? toDayjs(srchDate).format('YYYY-MM-DD') : null

      /**
       * วันที่สำหรับกราฟบน
       *
       * ถ้ามี Previous Date ที่เลือก
       * ใช้ทั้งหมด
       *
       * ถ้าไม่มี ใช้ Date หลัก
       */
      const datesForSystemChart = srchDateArray?.length > 0 ? srchDateArray : formatDate ? [formatDate] : []

      console.log('datesForSystemChart : ', datesForSystemChart)

      /**
       * กราฟล่าง
       */
      await fetchData(formatDate)

      /**
       * กราฟบน
       */
      await fetchDataSys(formatDate, datesForSystemChart)

      setsrchDate_(formatDate)
    } catch (error) {
      console.error('handleFieldSearch error : ', error)
    } finally {
      setIsLoading(false)
    }
  }

  // useEffect(() => {
  //     fetchData(today, true);
  // }, [resetForm]);

  //   const handleReset = () => {
  //     console.log('6')
  //     setSrchDate(today)
  //     settk(!tk)
  //     setKey((prevKey) => prevKey + 1)
  //     setTimeout(() => {
  //       fetchData(today, true) // await for re state
  //     }, 300)
  //   }
  const handleReset = () => {
    setSrchDate(today)

    setsrchDateArray([])

    settk(!tk)

    setKey((prevKey) => prevKey + 1)

    setTimeout(async () => {
      await Promise.all([fetchData(today, true), fetchDataSys(today, [today])])

      setsrchDate_(today)
    }, 300)
  }

  const transferForTable = async (dataOriginal: any, dateArr?: any) => {
    let dataX: any = []
    for (let index = 0; index < dataOriginal?.data?.length; index++) {
      const useData = dataOriginal?.data?.length > 0 ? dataOriginal?.data[index]?.hour?.filter((f: any) => !!f?.zone) : [] //find !null
      dataX.push(
        ...useData?.map((item: any) => {
          return {
            ...item,
            date: dataOriginal?.data[index]?.gas_day
          }
        })
      ) //for chart data
    }

    let manomakeData: any = []
    for (let index = 0; index < dataOriginal?.templateLabelKeys?.length; index++) {
      for (let dix = 0; dix < dateArr?.length; dix++) {
        manomakeData.push({
          info: {...dataOriginal?.templateLabelKeys[index]},
          date: dateArr[dix],
          T3_00: dataX?.find((iteM: any) => iteM?.gas_hour_text == '03:00' && iteM?.date == dateArr[dix])?.value?.[dataOriginal?.templateLabelKeys[index]?.key],
          T6_00: dataX?.find((iteM: any) => iteM?.gas_hour_text == '06:00' && iteM?.date == dateArr[dix])?.value?.[dataOriginal?.templateLabelKeys[index]?.key],
          T9_00: dataX?.find((iteM: any) => iteM?.gas_hour_text == '09:00' && iteM?.date == dateArr[dix])?.value?.[dataOriginal?.templateLabelKeys[index]?.key],
          T12_00: dataX?.find((iteM: any) => iteM?.gas_hour_text == '12:00' && iteM?.date == dateArr[dix])?.value?.[dataOriginal?.templateLabelKeys[index]?.key],
          T15_00: dataX?.find((iteM: any) => iteM?.gas_hour_text == '15:00' && iteM?.date == dateArr[dix])?.value?.[dataOriginal?.templateLabelKeys[index]?.key],
          T18_00: dataX?.find((iteM: any) => iteM?.gas_hour_text == '18:00' && iteM?.date == dateArr[dix])?.value?.[dataOriginal?.templateLabelKeys[index]?.key],
          T21_00: dataX?.find((iteM: any) => iteM?.gas_hour_text == '21:00' && iteM?.date == dateArr[dix])?.value?.[dataOriginal?.templateLabelKeys[index]?.key],
          T00_00: dataX?.find((iteM: any) => iteM?.gas_hour_text == '24:00' && iteM?.date == dateArr[dix])?.value?.[dataOriginal?.templateLabelKeys[index]?.key]
        })
      }
    }

    const resultDT: any = await sortByDate(manomakeData)

    const lowPriorityOrder = ['Alert Low', 'Low Orange', 'Low Red', 'Low Difficult Day', 'Low Min']

    // กรองเฉพาะ Low และ LO-LO และเรียงลำดับตามที่กำหนด
    const lowOnlySorted = resultDT?.filter((item: any) => lowPriorityOrder?.includes(item?.info?.lebel)).sort((a: any, b: any) => lowPriorityOrder.indexOf(a.info.lebel) - lowPriorityOrder.indexOf(b.info.lebel))

    // ถ้าต้องการรวมกับหมวดอื่นๆ ให้แยกส่วนอื่นไว้
    const others = resultDT?.filter((item: any) => !lowPriorityOrder.includes(item?.info?.lebel))

    // รวมกลับก่อน setdata
    const finalSortedData = [...others, ...lowOnlySorted]

    const permission: any = userDT?.account_manage?.[0]?.user_type_id === 3 ? finalSortedData?.filter((item: any) => item?.info?.key !== 'all') : finalSortedData
    setdataforTable(permission?.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()))

    setshowDateArray(dateArr)
    settk(!tk)

    setIsLoading(false)
  }

  function sortByDate(Arr: any) {
    return Arr?.slice().sort((a: any, b: any) => {
      if (!a.date || !b.date) return 0
      const dateA: any = new Date(a.date)
      const dateB: any = new Date(b.date)
      return dateA - dateB
    })
  }

  const customNumberSort = (rowA: any, rowB: any, columnId: any) => {
    const a = rowA.getValue(columnId)
    const b = rowB.getValue(columnId)

    const normalize = (v: number | null | undefined) => {
      // กำหนดให้ null / undefined มีค่าน้อยที่สุด
      if (v === null || v === undefined) return -Infinity
      return v
    }

    const valA = normalize(a)
    const valB = normalize(b)

    return valA > valB ? 1 : valA < valB ? -1 : 0
  }

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'info',
        header: 'Info',
        enableSorting: true,
        width: 200,
        accessorFn: (row: any) => row?.info?.lebel || '',
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div className="flex justify-start items-center gap-3">
              {row?.info?.type == 'bar' ? (
                <div style={{width: '10px', height: '10px', backgroundColor: row?.info?.color, borderRadius: 50}} />
              ) : row?.info?.type == 'lineGraph' ? (
                <div style={{width: '10px', height: '2px', backgroundColor: row?.info?.color, borderRadius: 2}} />
              ) : (
                <div className="grid grid-cols-3 h-[2px] w-[10px]">
                  <div className="w-full h-full" style={{backgroundColor: row?.info?.color}} />
                  <div className="w-full h-full" />
                  <div className="w-full h-full" style={{backgroundColor: row?.info?.color}} />
                </div>
              )}
              <div>{row?.info?.lebel}</div>
            </div>
          )
        }
      },
      {
        accessorKey: 'date',
        header: 'Date',
        enableSorting: true,
        width: 120,
        accessorFn: (row: any) => row?.date || '',
        sortingFn: myCustomSortingByDateFn,
        // sortingFn: 'datetime', // recommended for date columns
        // sortUndefined: -1,
        cell: (info) => {
          const row: any = info?.row?.original
          return <div>{row?.date ? toDayjs(row?.date).format('DD/MM/YYYY') : ''}</div>
        }
      },
      {
        accessorKey: 'T3_00',
        header: '03:00',
        enableSorting: true,
        align: 'right',
        accessorFn: (row: any) => row?.T3_00 || null,
        sortingFn: customNumberSort,
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            // <div>{row?.T3_00 ? formatNumberFourDecimal(row?.T3_00) : null}</div>
            <div>{row?.T3_00 !== null && row?.T3_00 !== undefined ? formatNumberFourDecimal(row?.T3_00) : null}</div>
          )
        }
      },
      {
        accessorKey: 'T6_00',
        header: '06:00',
        enableSorting: true,
        align: 'right',
        accessorFn: (row: any) => row?.T6_00 || null,
        sortingFn: customNumberSort,
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            // <div>{row?.T6_00 ? formatNumberFourDecimal(row?.T6_00) : null}</div>
            <div>{row?.T6_00 !== null && row?.T6_00 !== undefined ? formatNumberFourDecimal(row?.T6_00) : null}</div>
          )
        }
      },
      {
        accessorKey: 'T9_00',
        header: '09:00',
        enableSorting: true,
        align: 'right',
        accessorFn: (row: any) => row?.T9_00 || null,
        sortingFn: customNumberSort,
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            // <div>{row?.T9_00 ? formatNumberFourDecimal(row?.T9_00) : null}</div>
            <div>{row?.T9_00 !== null && row?.T9_00 !== undefined ? formatNumberFourDecimal(row?.T9_00) : null}</div>
          )
        }
      },
      {
        accessorKey: 'T12_00',
        header: '12:00',
        enableSorting: true,
        align: 'right',
        accessorFn: (row: any) => row?.T12_00 || null,
        sortingFn: customNumberSort,
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            // <div>{row?.T12_00 ? formatNumberFourDecimal(row?.T12_00) : null}</div>
            <div>{row?.T12_00 !== null && row?.T12_00 !== undefined ? formatNumberFourDecimal(row?.T12_00) : null}</div>
          )
        }
      },
      {
        accessorKey: 'T15_00',
        header: '15:00',
        enableSorting: true,
        align: 'right',
        accessorFn: (row: any) => row?.T15_00 || null,
        sortingFn: customNumberSort,
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            // <div>{row?.T15_00 ? formatNumberFourDecimal(row?.T15_00) : null}</div>
            <div>{row?.T15_00 !== null && row?.T15_00 !== undefined ? formatNumberFourDecimal(row?.T15_00) : null}</div>
          )
        }
      },
      {
        accessorKey: 'T18_00',
        header: '18:00',
        enableSorting: true,
        align: 'right',
        accessorFn: (row: any) => row?.T18_00 || null,
        sortingFn: customNumberSort,
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            // <div>{row?.T18_00 ? formatNumberFourDecimal(row?.T18_00) : null}</div>
            <div>{row?.T18_00 !== null && row?.T18_00 !== undefined ? formatNumberFourDecimal(row?.T18_00) : null}</div>
          )
        }
      },
      {
        accessorKey: 'T21_00',
        header: '21:00',
        enableSorting: true,
        align: 'right',
        accessorFn: (row: any) => row?.T21_00 || null,
        sortingFn: customNumberSort,
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            // <div>{row?.T21_00 ? formatNumberFourDecimal(row?.T21_00) : null}</div>
            <div>{row?.T21_00 !== null && row?.T21_00 !== undefined ? formatNumberFourDecimal(row?.T21_00) : null}</div>
          )
        }
      },
      {
        accessorKey: 'T00_00',
        header: '00:00',
        enableSorting: true,
        align: 'right',
        accessorFn: (row: any) => row?.T00_00 || null,
        sortingFn: customNumberSort,
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            // <div>{row?.T00_00 ? formatNumberFourDecimal(row?.T00_00) : null}</div>
            <div>{row?.T00_00 !== null && row?.T00_00 !== undefined ? formatNumberFourDecimal(row?.T00_00) : null}</div>
          )
        }
      }
    ],
    [dataforTable]
  )

  const chartRef: any = useRef(null) // Create ref for the chart
  const containerRef = useRef<HTMLDivElement>(null) // ใช้กับ <div className="relative h-full" ...>

  // #region get file name export
  const getExportFileName = (fileExtension?: string) => {
    let shipperName = ''
    if (userDT?.account_manage?.[0]?.user_type_id == 3) {
      shipperName = userDT?.account_manage?.[0]?.group?.name
    } else {
      // shipperName = dataTable?.templateLabelKeys?.filter((item: any) => item?.type == "bar")?.map((item: any) => item?.lebel)?.join('_')
      if (srchShipperName?.length !== dataShipper?.length) {
        let data_shipper = dataShipper?.filter((item: any) => srchShipperName.includes(item.id_name))
        shipperName = data_shipper?.map((item: any) => item?.name)?.join('_')
      } else {
        shipperName = 'All_Shipper'
      }
    }
    return `intraday_acc_imbalance_dashboard_${toDayjs().format('DDMMYYYYHHmm')}_${shipperName}${fileExtension ? `.${fileExtension}` : ''}`
  }

  const handleSaveImage = () => {
    if (chartRef.current) {
      const chart = chartRef.current
      const canvas = chart.canvas

      // Create a new canvas with the same size
      const newCanvas = document.createElement('canvas')
      const ctx = newCanvas.getContext('2d')

      if (!ctx) return

      newCanvas.width = canvas.width
      newCanvas.height = canvas.height

      // Fill the new canvas with white background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, newCanvas.width, newCanvas.height)

      // Draw the chart's existing canvas on top
      ctx.drawImage(canvas, 0, 0)

      // Convert the final image to base64
      const imageURI = newCanvas.toDataURL('image/png')

      // Create a temporary <a> element to trigger download
      const link = document.createElement('a')
      link.href = imageURI
      link.download = 'chart.png' // Set the default file name
      link.click() // Trigger the download
    }
  }

  const handleSaveImage2 = async () => {
    if (containerRef.current) {
      let east_or_west = tabIndex == 0 ? 'East' : 'West'

      const canvas = await html2canvas(containerRef.current, {
        backgroundColor: '#ffffff',
        useCORS: true
      })

      const ctx = canvas.getContext('2d')
      if (ctx) {
        // หา DOM element ที่แสดงคำว่า "Date"
        const dateEl = containerRef.current.querySelector('.date-label') as HTMLElement

        if (dateEl) {
          const rect = dateEl.getBoundingClientRect()
          const containerRect = containerRef.current.getBoundingClientRect()

          // คำนวณตำแหน่งของ dateEl ภายใน canvas
          const offsetX = rect.left - containerRect.left
          const offsetY = rect.top - containerRect.top
          const dateWidth = rect.width

          ctx.font = 'bold 16px Arial'
          ctx.fillStyle = '#58585A'
          ctx.fillText(east_or_west, 288, 356)
        }
      }

      const image = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = image
      link.download = getExportFileName('png')
      link.click()
    }
  }

  const initialColumns: any = [
    {key: 'entry_exit', label: 'Entry / Exit', visible: true},
    {key: 'zone', label: 'Zone', visible: true},
    {key: 'name', label: 'Area Name', visible: true},
    {key: 'desc', label: 'Description', visible: true},
    {key: 'area_nom_cap', label: 'Area Nominal Capacity (MMBTU/D)', visible: true},
    {key: 'supply_ref_quality', label: 'Supply Reference Quality Area', visible: true},
    {key: 'start_date', label: 'Start Date', visible: true},
    {key: 'end_date', label: 'End Date', visible: true},
    {key: 'updated_by', label: 'Updated by', visible: true}
  ]

  const [columnVisibility, setColumnVisibility] = useState<any>(Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible])))

  const sortDatesAsc = (dates: string[]): string[] => {
    return dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
  }

  const handleSelectPreDate = (date: any) => {
    const sortedDates = sortDatesAsc(date)
    setsrchDateArray(sortedDates)
  }

  const onchageFilterDate: any = (value: any) => {
    setSrchDate(value ? value : null)
    if (value) {
      const getItem = getPreviousDates(value)
      setdataDateArray((pre: any) => getItem)
    }

    setsrchDateArray([])
    settk(!tk)
  }

  function getPreviousDates(dateselected: any, days = 2) {
    const result = []

    const inputDate = new Date(dateselected)

    for (let i = days; i >= 0; i--) {
      const date = new Date(inputDate)
      date.setDate(inputDate.getDate() - i)

      const yyyy = date.getFullYear()
      const mm = String(date.getMonth() + 1).padStart(2, '0')
      const dd = String(date.getDate()).padStart(2, '0')

      const value = `${yyyy}-${mm}-${dd}`
      const label = `${dd}/${mm}/${yyyy}`

      result.push({value, label})
    }

    return result
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

  //

  const [dataTableEast, setDataEast] = useState<any>([])
  const [dataTableWest, setDataWest] = useState<any>([])

  //   const fetchDataSys = async (date: any) => {
  //     try {
  //       const body_main = {
  //         gas_day: dayjs(date).format('YYYY-MM-DD'),
  //         start_hour: 1,
  //         end_hour: 24,
  //         skip: 0,
  //         limit: 100
  //       }

  //       // MAIN DATA
  //       const response = await postService('/master/balancing/system-acc-imbalance-inventory', body_main)

  //       if (userDT?.account_manage?.[0]?.user_type_id == 3) {
  //         const nDataEast = {
  //           data: response?.data?.map((e: any) => {
  //             const {hour, ...nE} = e
  //             const hour_ = hour?.map((v: any) => {
  //               const {valueOfEachZone, ...nV} = v
  //               return {
  //                 ...nV,
  //                 valueOfEachZone: {
  //                   EAST: valueOfEachZone?.EAST
  //                 }
  //               }
  //             })

  //             return {
  //               ...nE,
  //               hour: hour_
  //             }
  //           }),
  //           templateLabelKeys: response?.templateLabelKeys?.filter((f: any) => {
  //             return f?.lebel !== 'WEST' && f?.key !== 'high_max_percentage' && f?.key !== 'low_max_percentage'
  //           })
  //         }
  //         const nDataWest = {
  //           data: response?.data?.map((e: any) => {
  //             const {hour, ...nE} = e
  //             const hour_ = hour?.map((v: any) => {
  //               const {valueOfEachZone, ...nV} = v
  //               return {
  //                 ...nV,
  //                 valueOfEachZone: {
  //                   WEST: valueOfEachZone?.WEST
  //                 }
  //               }
  //             })

  //             return {
  //               ...nE,
  //               hour: hour_
  //             }
  //           }),
  //           templateLabelKeys: response?.templateLabelKeys?.filter((f: any) => {
  //             return f?.lebel !== 'EAST' && f?.key !== 'high_max_percentage' && f?.key !== 'low_max_percentage'
  //           })
  //         }
  //         setDataEast(nDataEast)
  //         setDataWest(nDataWest)
  //       } else {
  //         const nDataEast = {
  //           data: response?.data?.map((e: any) => {
  //             const {hour, ...nE} = e
  //             const hour_ = hour?.map((v: any) => {
  //               const {valueOfEachZone, ...nV} = v
  //               return {
  //                 ...nV,
  //                 valueOfEachZone: {
  //                   EAST: valueOfEachZone?.EAST
  //                 }
  //               }
  //             })

  //             return {
  //               ...nE,
  //               hour: hour_
  //             }
  //           }),
  //           templateLabelKeys: response?.templateLabelKeys?.filter((f: any) => f?.lebel !== 'WEST')
  //         }
  //         const nDataWest = {
  //           data: response?.data?.map((e: any) => {
  //             const {hour, ...nE} = e
  //             const hour_ = hour?.map((v: any) => {
  //               const {valueOfEachZone, ...nV} = v
  //               return {
  //                 ...nV,
  //                 valueOfEachZone: {
  //                   WEST: valueOfEachZone?.WEST
  //                 }
  //               }
  //             })

  //             return {
  //               ...nE,
  //               hour: hour_
  //             }
  //           }),
  //           templateLabelKeys: response?.templateLabelKeys?.filter((f: any) => f?.lebel !== 'EAST')
  //         }
  //         setDataEast(nDataEast)
  //         setDataWest(nDataWest)
  //       }
  //     } catch (error) {}
  //   }

  const fetchDataSys = async (date: any, selectedDates?: string[]) => {
    try {
      /**
       * ถ้ามี Previous Date ที่เลือก
       * ให้ใช้วันที่เหล่านั้น
       *
       * ถ้าไม่ได้เลือก Previous Date
       * ให้ใช้ Date หลักเพียงวันเดียว
       */
      const datesToFetch = selectedDates && selectedDates.length > 0 ? [...selectedDates] : [dayjs(date).format('YYYY-MM-DD')]

      /**
       * กันวันที่ซ้ำ + เรียงจากเก่า -> ใหม่
       */
      const uniqueDates = Array.from(new Set(datesToFetch.filter(Boolean).map((item) => dayjs(item).format('YYYY-MM-DD')))).sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf())
      console.log('fetchDataSys dates : ', uniqueDates)

      /**
       * ยิง API พร้อมกันทุกวัน
       *
       * เช่นเลือก
       * 11/08/2026
       * 12/08/2026
       * 13/08/2026
       *
       * จะยิง API 3 ครั้ง
       */
      const responses = await Promise.all(
        uniqueDates.map(async (gasDay) => {
          const body_main = {
            gas_day: gasDay,
            start_hour: 1,
            end_hour: 24,
            skip: 0,
            limit: 100
          }

          const response = await postService('/master/balancing/system-acc-imbalance-inventory', body_main)

          return {
            gas_day: gasDay,
            response
          }
        })
      )

      console.log('system responses : ', responses)

      /**
       * รวม response ทุกวัน
       */
      const mergedData: any[] = []

      let templateLabelKeys: any[] = []

      responses.forEach(({gas_day, response}: any) => {
        /**
         * template ใช้ของ API วันใดวันหนึ่งก็ได้
         * เพราะโครงสร้างเหมือนกัน
         */
        if (templateLabelKeys.length === 0 && response?.templateLabelKeys) {
          templateLabelKeys = response.templateLabelKeys
        }

        /**
         * ปกติ response.data จะประมาณ
         *
         * [
         *   {
         *      gas_day: '2026-08-13',
         *      hour: [...]
         *   }
         * ]
         */
        if (Array.isArray(response?.data)) {
          response.data.forEach((item: any) => {
            mergedData.push({
              ...item,

              /**
               * บังคับ gas_day ไว้อีกที
               * เผื่อ API ไม่มี gas_day
               */
              gas_day: item?.gas_day ?? gas_day
            })
          })
        }
      })

      /**
       * เรียงวัน
       */
      mergedData.sort((a: any, b: any) => dayjs(a?.gas_day).valueOf() - dayjs(b?.gas_day).valueOf())

      console.log('mergedData system : ', mergedData)

      /**
       * ===========================
       * Shipper
       * ===========================
       */
      if (userDT?.account_manage?.[0]?.user_type_id == 3) {
        const nDataEast = {
          data: mergedData?.map((e: any) => {
            const {hour, ...nE} = e

            const hour_ = hour?.map((v: any) => {
              const {valueOfEachZone, ...nV} = v

              return {
                ...nV,
                valueOfEachZone: {
                  EAST: valueOfEachZone?.EAST
                }
              }
            })

            return {
              ...nE,
              hour: hour_
            }
          }),

          templateLabelKeys: templateLabelKeys?.filter((f: any) => {
            return f?.lebel !== 'WEST' && f?.key !== 'high_max_percentage' && f?.key !== 'low_max_percentage'
          })
        }

        const nDataWest = {
          data: mergedData?.map((e: any) => {
            const {hour, ...nE} = e

            const hour_ = hour?.map((v: any) => {
              const {valueOfEachZone, ...nV} = v

              return {
                ...nV,
                valueOfEachZone: {
                  WEST: valueOfEachZone?.WEST
                }
              }
            })

            return {
              ...nE,
              hour: hour_
            }
          }),

          templateLabelKeys: templateLabelKeys?.filter((f: any) => {
            return f?.lebel !== 'EAST' && f?.key !== 'high_max_percentage' && f?.key !== 'low_max_percentage'
          })
        }

        setDataEast(nDataEast)
        setDataWest(nDataWest)
      } else {
        /**
         * ===========================
         * Admin / TSO
         * ===========================
         */
        const nDataEast = {
          data: mergedData?.map((e: any) => {
            const {hour, ...nE} = e

            const hour_ = hour?.map((v: any) => {
              const {valueOfEachZone, ...nV} = v

              return {
                ...nV,
                valueOfEachZone: {
                  EAST: valueOfEachZone?.EAST
                }
              }
            })

            return {
              ...nE,
              hour: hour_
            }
          }),

          templateLabelKeys: templateLabelKeys?.filter((f: any) => f?.lebel !== 'WEST')
        }

        const nDataWest = {
          data: mergedData?.map((e: any) => {
            const {hour, ...nE} = e

            const hour_ = hour?.map((v: any) => {
              const {valueOfEachZone, ...nV} = v

              return {
                ...nV,
                valueOfEachZone: {
                  WEST: valueOfEachZone?.WEST
                }
              }
            })

            return {
              ...nE,
              hour: hour_
            }
          }),

          templateLabelKeys: templateLabelKeys?.filter((f: any) => f?.lebel !== 'EAST')
        }

        setDataEast(nDataEast)
        setDataWest(nDataWest)
      }
    } catch (error) {
      console.error('fetchDataSys error : ', error)
    }
  }

  //   useEffect(() => {
  //     setSrchDate(today)
  //     fetchDataSys(today)
  //   }, [resetForm])

  useEffect(() => {
    setSrchDate(today)

    fetchDataSys(today, [today])
  }, [resetForm])

  return (
    <div className=" space-y-2">
      <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
        <aside className="flex flex-wrap gap-2 w-full">
          {userDT?.account_manage?.[0]?.user_type_id !== 3 ? (
            <InputSearch
              id="searchShipperName"
              label="Shipper Name"
              type="select-multi-checkbox"
              isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
              value={userDT?.account_manage?.[0]?.user_type_id == 3 ? [userDT?.account_manage?.[0]?.group?.id_name] : srchShipperName}
              onChange={(e) => {
                setSrchShipperName(e.target.value)
              }}
              options={dataShipper
                ?.filter(
                  (
                    item: any // เห็นแค่ชื่อตัวเอง
                  ) => (userDT?.account_manage?.[0]?.user_type_id == 3 ? item?.id === userDT?.account_manage?.[0]?.group?.id : true)
                )
                .map((item: any) => ({
                  value: item.id_name,
                  label: item.name
                }))}
            />
          ) : (
            <InputSearch
              id="searchShipperName"
              label="Shipper Name"
              type="select"
              isDisabled={true}
              value={userDT?.account_manage?.[0]?.group?.id_name}
              onChange={(e) => setSrchShipperName(e.target.value)}
              options={(dataShipper || [])
                ?.filter(
                  (
                    item: any // เห็นแค่ชื่อตัวเอง
                  ) => (userDT?.account_manage?.[0]?.user_type_id == 3 ? item?.id === userDT?.account_manage?.[0]?.group?.id : true)
                )
                .map((item: any) => ({
                  // value: item.name,
                  value: item.id_name,
                  label: item.name
                }))}
            />
          )}

          <DatePickaSearch
            key={'start' + key}
            label={'Date'}
            placeHolder={'Select Date'}
            // isFixDay={true}
            // dateToFix={today}
            defaultValue={srchDate}
            // dateToFix={srchDate}
            isDefaultToday={true}
            isGasWeek={false}
            isGasWeekPlusOne={false}
            isDefaultTomorrow={false}
            modeSearch={null}
            allowClear
            // allowClear
            // onChange={(e: any) => {
            //     setSrchDate(e ? e : null);
            //     setsrchDateArray([]);
            //     settk(!tk);
            // }}
            onChange={(e: any) => onchageFilterDate(e)}
          />

          <InputSearch id="pre_next_date" label="Previous Date" type="select-multi-checkbox-for-date" value={srchDateArray} onChange={(e) => handleSelectPreDate(e.target.value)} placeholder="Select Date" options={dataDateArray} />

          <BtnSearch handleFieldSearch={handleFieldSearch} />
          <BtnReset handleReset={handleReset} />
        </aside>
      </div>

      <Tabs
        value={tabIndex}
        onChange={handleChange}
        aria-label="tabs"
        sx={{
          marginBottom: '-19px !important',
          '& .MuiTabs-indicator': {
            display: 'none' // Remove the underline
          },
          '& .Mui-selected': {
            color: '#58585A !important'
          }
        }}
      >
        {['East', 'West']?.map((label, index) => (
          <Tab
            key={label}
            label={label}
            id={`tab-${index}`}
            sx={{
              fontFamily: 'Tahoma !important',
              border: '0.5px solid',
              borderColor: '#DFE4EA',
              borderBottom: 'none',
              borderTopLeftRadius: '9px',
              borderTopRightRadius: '9px',
              textTransform: 'none',
              padding: '8px 16px',
              backgroundColor: tabIndex === index ? '#FFFFFF' : '#9CA3AF1A',
              color: tabIndex === index ? '#58585A' : '#9CA3AF',
              '&:hover': {
                backgroundColor: '#F3F4F6'
              }
            }}
          />
        ))}
      </Tabs>

      <div className="border-[#DFE4EA] border-[1px] p-4 rounded-tl-none rounded-tr-lg shadow-sm relative">
        <Spinloading spin={isLoading} rounded={20} />
        <div className="h-full">
          {/* <div className="date-label text-[#58585A] flex font-bold text-2xl mb-5">
            <div className="mr-2">{'Date : '}</div>
            {<div className={`${'mr-0'}`}>{srchDate_ ? dayjs(srchDate_).format('DD/MM/YYYY') : ''}</div>}
          </div> */}
          <div className="date-label text-[#58585A] flex font-bold text-2xl mb-5">
              <div className="mr-2">{'Date : '}</div>
              {formatSortedDates(showDateArray)?.map((item: any, index: any) => {
                return <div className={`${showDateArray?.length - 1 !== index ? 'mr-2' : 'mr-0'}`}>{item + (showDateArray?.length - 1 !== index ? ',' : '')}</div>
              })}
            </div>
          {/* <div className="date-label text-[#58585A] flex font-bold text-2xl mb-5">
            <div className="mr-2">{'Date : '}</div>

            {(srchDateArray?.length > 0 ? formatSortedDates(srchDateArray) : srchDate_ ? [dayjs(srchDate_).format('DD/MM/YYYY')] : []).map((item: any, index: number, arr: any[]) => (
              <div key={`${item}-${index}`} className={index < arr.length - 1 ? 'mr-2' : 'mr-0'}>
                {item}
                {index < arr.length - 1 ? ',' : ''}
              </div>
            ))}
          </div> */}

          {tabIndex === 0 && (
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl rounded-tl-none shadow-sm h-full mb-5">
              <ChartSystemMenu data={dataTableEast} />
            </div>
          )}

          {tabIndex === 1 && (
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl rounded-tl-none shadow-sm h-full mb-5">
              <ChartSystemMenu data={dataTableWest} />
            </div>
          )}

          <div className="flex justify-between items-center">
            {/* <div></div> */}
            <div className="date-label text-[#58585A] flex font-bold text-2xl mb-5">
              <div className="mr-2">{'Date : '}</div>
              {formatSortedDates(showDateArray)?.map((item: any, index: any) => {
                return <div className={`${showDateArray?.length - 1 !== index ? 'mr-2' : 'mr-0'}`}>{item + (showDateArray?.length - 1 !== index ? ',' : '')}</div>
              })}
            </div>
            <div>
              <BtnGeneral
                textRender={'Export Image'}
                iconNoRender={false}
                modeIcon={'export_image_chart'}
                bgcolor={'#1473A1'}
                // generalFunc={() => handleSaveImage()} // ภาพแค่ canvas chart
                generalFunc={() => handleSaveImage2()} // ภาพทั้ง div
                can_export={userPermission ? userPermission?.f_export : false}
              />
            </div>
          </div>
          <div className="w-full h-auto">{<ChartSystem data={dataTable} chartRef={chartRef} showDateArray={showDateArray} containerRef={containerRef} />}</div>

          <div className="w-full h-full mt-5">
            <div className="flex justify-end items-center">
              <BtnGeneral
                bgcolor={'#24AB6A'}
                modeIcon={'export'}
                textRender={'Export'}
                generalFunc={() => {
                  intradayAccImbalanceDashboard({
                    bodys: {
                      name: 'Intraday Acc Imbalance Dashboard',
                      initialColumns: initialColumns,
                      columnVisibility: columnVisibility,
                      // resData: paginatedData,
                      resData: dataforTable,
                      // hindDefaultNodata: hindDefaultNodata,
                      tabIndex: tabIndex
                    },
                    filter: [
                      'Info',
                      'Date',
                      // "00:00",
                      // "01:00",
                      // "02:00",
                      '03:00',
                      // "04:00",
                      // "05:00",
                      '06:00',
                      // "07:00",
                      // "08:00",
                      '09:00',
                      // "10:00",
                      // "11:00",
                      '12:00',
                      // "13:00",
                      // "14:00",
                      '15:00',
                      // "16:00",
                      // "17:00",
                      '18:00',
                      // "19:00",
                      // "20:00",
                      '21:00',
                      // "22:00",
                      // "23:00",
                      '24:00'
                    ]
                  })
                }}
                can_export={userPermission ? userPermission?.f_export : false}
              />
            </div>
            {/* ================== NEW TABLE ==================*/}
            <AppTable
              data={dataforTable}
              columns={columns}
              isLoading={!isLoading}
              filter={false}
              fixHeight={false}
              border={false}
              fullWidth={true}
              onFilteredDataChange={(filteredData: any) => {
                const newData = filteredData || []
                // Check if the filtered data is different from current dataExport
                if (JSON.stringify(dataExport) !== JSON.stringify(newData)) {
                  setDataExport(newData)
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientPage
