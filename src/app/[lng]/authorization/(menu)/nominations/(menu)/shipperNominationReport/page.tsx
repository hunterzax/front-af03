'use client'
import {useEffect, useMemo, useRef, useState} from 'react'
import {
  addSumPerRow,
  exportToExcel,
  findRoleConfigByMenuName,
  formatNumberFourDecimal,
  formatNumberFourDecimalNoComma,
  formatNumberThreeDecimal,
  generateUserPermission,
  getCurrentWeekSundayYyyyMmDd,
  isAllWeekly,
  liftWeeklyForDate,
  mergeDaily_AddOuterAndRowsFromWeekly,
  roundTo3,
  toDayjs
} from '@/utils/generalFormatter'
import {getService} from '@/utils/postService'
import {useFetchMasters} from '@/hook/fetchMaster'
import BtnSearch from '@/components/other/btnSearch'
import BtnReset from '@/components/other/btnReset'
import ColumnVisibilityPopover from '@/components/other/popOverShowHideCol'
import {useAppDispatch} from '@/utils/store/store'
import {fetchShipperGroup} from '@/utils/store/slices/shipperGroupSlice'
import getCookieValue from '@/utils/getCookieValue'
import useRestrictedPage from '@/utils/checkRestrictedPage'
import getUserValue from '@/utils/getuserValue'
import ModalComponent from '@/components/other/ResponseModal'
import {decryptData} from '@/utils/encryptionData'
import {Popover, Tab, Tabs} from '@mui/material'
import DatePickaSearch from '@/components/library/dateRang/dateSearch'
import dayjs from 'dayjs'
import TableSkeleton from '@/components/material_custom/DefaultSkeleton'
import ViewPage from './form/viewPage/viewPage'
import {InputSearch} from '@/components/other/SearchForm'
import AppTable from '@/components/table/AppTable'
import {ColumnDef} from '@tanstack/react-table'
import BtnActionTable from '@/components/other/btnActionInTable'
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined'
import BtnGeneral from '@/components/other/btnGeneral'
import {parseToNumber} from '@/utils/number'

interface ClientProps {
  params: {
    lng: string
  }
}

const ClientPage: React.FC<ClientProps> = (props) => {
  // #region  Check Authen
  const userDT: any = getUserValue()
  const token = getCookieValue('v4r2d9z5m3h0c1p0x7l')
  useRestrictedPage(token)

  // ############### COLUMN SHOW/HIDE ###############
  const initialColumns: any = [
    {key: 'gas_day', label: 'Gas Day', visible: true},
    {key: 'shipper_name', label: 'Shipper Name', visible: true},
    {key: 'capacity_right', label: 'Capacity Right (MMBTU/D)', visible: true},
    {
      key: 'nominated_value',
      label: 'Nominated Value (MMBTU/D)',
      visible: true
    },
    {key: 'overusage', label: 'Overusage (MMBTU/D)', visible: true},
    {key: 'imbalance', label: 'Imbalance (MMBTU/D)', visible: true},
    {key: 'action', label: 'Action', visible: true}
  ]

  const initialColumnsTabIntraday: any = [
    {key: 'gas_day', label: 'Gas Day', visible: true},
    {key: 'zone', label: 'Zone', visible: true},
    {key: 'area', label: 'Area', visible: true},
    {key: 'parameter', label: 'Parameter', visible: true},

    {key: 'h1', label: 'H1 00:00 - 01:00', visible: true}, // show if tabIndex = 0
    {key: 'h2', label: 'H2 01:01 - 02:00', visible: true}, // show if tabIndex = 0
    {key: 'h3', label: 'H3 02:01 - 03:00', visible: true}, // show if tabIndex = 0
    {key: 'h4', label: 'H4 03:01 - 04:00', visible: true}, // show if tabIndex = 0
    {key: 'h5', label: 'H5 04:01 - 05:00', visible: true}, // show if tabIndex = 0
    {key: 'h6', label: 'H6 05:01 - 06:00', visible: true}, // show if tabIndex = 0

    {key: 'h7', label: 'H7 06:01 - 07:00', visible: true}, // show if tabIndex = 1
    {key: 'h8', label: 'H8 07:01 - 08:00', visible: true}, // show if tabIndex = 1
    {key: 'h9', label: 'H9 08:01 - 09:00', visible: true}, // show if tabIndex = 1
    {key: 'h10', label: 'H10 09:01 - 10:00', visible: true}, // show if tabIndex = 1
    {key: 'h11', label: 'H11 10:01 - 11:00', visible: true}, // show if tabIndex = 1
    {key: 'h12', label: 'H12 11:01 - 12:00', visible: true}, // show if tabIndex = 1

    {key: 'h13', label: 'H13 12:01 - 13:00', visible: true}, // show if tabIndex = 2
    {key: 'h14', label: 'H14 13:01 - 14:00', visible: true}, // show if tabIndex = 2
    {key: 'h15', label: 'H15 14:01 - 15:00', visible: true}, // show if tabIndex = 2
    {key: 'h16', label: 'H16 15:01 - 16:00', visible: true}, // show if tabIndex = 2
    {key: 'h17', label: 'H17 16:01 - 17:00', visible: true}, // show if tabIndex = 2
    {key: 'h18', label: 'H18 17:01 - 18:00', visible: true}, // show if tabIndex = 2

    {key: 'h19', label: 'H19 18:01 - 19:00', visible: true}, // show if tabIndex = 3
    {key: 'h20', label: 'H20 19:01 - 20:00', visible: true}, // show if tabIndex = 3
    {key: 'h21', label: 'H21 20:01 - 21:00', visible: true}, // show if tabIndex = 3
    {key: 'h22', label: 'H22 21:01 - 22:00', visible: true}, // show if tabIndex = 3
    {key: 'h23', label: 'H23 22:01 - 23:00', visible: true}, // show if tabIndex = 3
    {key: 'h24', label: 'H24 23:01 - 24:00', visible: true} // show if tabIndex = 3
  ]

  const filterColumnsByTabIndex = (subTabIndex: number) => {
    return initialColumnsTabIntraday.filter((col: any) => {
      // Always show these columns
      const alwaysVisibleKeys = ['gas_day', 'zone', 'area', 'parameter']

      if (alwaysVisibleKeys.includes(col.key)) {
        return true
      }

      if (subTabIndex === 4) {
        return true // Show all columns if tabIndex = 4
      }

      // Define hourly column visibility based on tab index
      const hourColumnMapping: {[key: number]: string[]} = {
        0: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        1: ['h7', 'h8', 'h9', 'h10', 'h11', 'h12'],
        2: ['h13', 'h14', 'h15', 'h16', 'h17', 'h18'],
        3: ['h19', 'h20', 'h21', 'h22', 'h23', 'h24']
      }

      return hourColumnMapping[subTabIndex]?.includes(col.key) ?? false
    })
  }

  // #region STATE
  const [dataTable, setData] = useState<any>([])
  const [tk, settk] = useState<boolean>(false)
  const [filteredDataTable, setFilteredDataTable] = useState<any>([])
  const [filtered_weekly_all, set_filtered_weekly_all] = useState<any>([])
  const [key, setKey] = useState(0)
  const [srchStartDate, setSrchStartDate] = useState<Date | null>(dayjs().add(1, 'day').toDate()) // วันที่ใช้ filter ข้อมูล default วันพรุ่งนี้
  const [srchShipper, setSrchShipper] = useState<any>([])
  const [forceRefetch, setForceRefetch] = useState(true)
  const [userPermission, setUserPermission] = useState<any>()
  const [tabIndex, setTabIndex] = useState(0) // 0=daily, 1=weekly
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [resetForm, setResetForm] = useState<() => void | null>()
  const [dataOriginal, setDataOriginal] = useState<any>([])
  const [dataDailyOriginal, setDataDailyOriginal] = useState<any>([])
  const [dataWeeklyOriginal, setDataWeeklyOriginal] = useState<any>([])
  const [dataShipper, setDataShipper] = useState<any>([])
  const [rawData, setRawData] = useState<any>([])
  const [isModalSuccessOpen, setModalSuccessOpen] = useState(false)
  const [modalModalSuccessMsg, setModalSuccessMsg] = useState('')
  const handleCloseModal = () => setModalSuccessOpen(false)
  const [modalErrorMsg, setModalErrorMsg] = useState('')
  const [isModalErrorOpen, setModalErrorOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [paginatedData, setPaginatedData] = useState<any[]>([])
  const [columnVisibility, setColumnVisibility] = useState<any>(Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible])))
  const [subTabIndex, setSubTabIndex] = useState(0)
  const [subTabIndexview, setsubTabIndexview] = useState(0)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewDataMain, setViewDataMain] = useState<any>([])
  const [selectprops, setselectprops] = useState([
    {
      id: 0,
      gas_props: dayjs().add(1, 'day').toDate(),
      shipper: null
    },
    {
      id: 1,
      gas_props: dayjs().add(1, 'day').toDate(),
      shipper: null
    },
    {
      id: 2,
      gas_props: new Date(getCurrentWeekSundayYyyyMmDd()),
      shipper: null
    }
  ])
  const [openPopoverId, setOpenPopoverId] = useState(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const [anchorPopover, setAnchorPopover] = useState<null | HTMLElement>(null)
  const [dataExport, setDataExport] = useState<any>([])
  const [resetInitial, setresetInitial] = useState<boolean>(false)

  // #region REDUX DATA
  const {shipperGroupData} = useFetchMasters()
  const dispatch = useAppDispatch()
  // #region PERMISSION
  let user_permission: any = localStorage?.getItem('k3a9r2b6m7t0x5w1s8j')
  user_permission = user_permission ? decryptData(user_permission) : null

  const getPermission = () => {
    try {
      user_permission = user_permission ? JSON.parse(user_permission) : null // Convert JSON string to object

      const permission = findRoleConfigByMenuName(`Shipper Nomination Report`, userDT)
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

  function sortByDate(resultAll: any[]) {
    return resultAll.sort((a, b) => {
      const dateA = new Date(a.gas_day_text.split('/').reverse().join('/')) // แปลงวันที่จาก 'DD/MM/YYYY' เป็น 'YYYY/MM/DD'
      const dateB = new Date(b.gas_day_text.split('/').reverse().join('/'))
      return dateA.getTime() - dateB.getTime() // เปรียบเทียบวันที่
    })
  }

  function convertWeeklyDataToArray(item: any) {
    const dayIndexMap: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6
    }

    return Object.entries(item?.weeklyDay)
      .map(([day, data]: any) => ({
        day,
        ...data,
        shipper_name: item?.shipper_name || null,
        id: item?.id,
        tabIndex: dayIndexMap[day] ?? -1 // fallback เผื่อเจอชื่อวันแปลก
      }))
      .sort((a, b) => a.tabIndex - b.tabIndex)
  }

  // #region field search
  const handleFieldSearchNew = async (tabIndexP?: any, srchStartDateP?: any) => {
    const tabIndex_ = tabIndexP !== undefined ? tabIndexP : tabIndex
    const srchStartDate_ = srchStartDateP ? dayjs(srchStartDateP)?.format('YYYY-MM-DD') : srchStartDate

    setIsLoading(false)
    // dayjs(isFixDay)?.format('YYYY-MM-DD')

    let url = `/master/query-shipper-nomination-file/shipper-nomination-report?tab=${tabIndex_}`
    if (srchStartDate_) {
      const startDate = toDayjs(srchStartDate_)
      url += `&gasDay=${startDate.isValid() ? startDate.format('YYYY-MM-DD') : srchStartDate_}`
    }
    const response: any = await getService(url)
    let dataToFilter = response
    console.log('response : ', response);
    // nominatedValueMMBTUD
    
    // ถ้า user เป็น shipper
    if (userDT?.account_manage?.[0]?.user_type_id == 3) {
      dataToFilter = dataToFilter?.filter((item: any) => item?.shipper_name == userDT?.account_manage?.[0]?.group?.name)
    }
    console.log('1dataToFilter : ', dataToFilter);
    switch (tabIndex_) {
      case 0:
        // =========== ALL NEW ===========
        const merged: any = mergeDaily_AddOuterAndRowsFromWeekly(dataToFilter)

        const res_is_all_weekly = isAllWeekly(merged) // true ถ้าทุกตัวมี nomination_type.id === 2
        console.log('res_is_all_weekly : ', res_is_all_weekly);
        if (res_is_all_weekly) {
          dataToFilter = liftWeeklyForDate(merged, toDayjs(srchStartDate_).format('DD/MM/YYYY')) // ถ้ามันเป็น weekly หมด จะเข้าไปเอาใน weeklyDay มาแสดง
        } else {
          // ถ้ามี daily เอาแค่ daily
          const type_daily = merged?.filter((item: any) => item?.nomination_type?.id == 1) // เดิมโรงงาน
          //   const type_daily = merged
          // ถ้าชื่อ shipper_name ไม่ซ้ำและเป็น nomination_type.id == 2 ให้เอามาด้วย
          const nameCounts = (merged ?? []).reduce((acc: Record<string, number>, it: any) => {
            const name = it?.shipper_name ?? ''
            acc[name] = (acc[name] ?? 0) + 1
            return acc
          }, {})

          const ddddd = (merged ?? []).filter((it: any) => {
            const typeId = it?.nomination_type?.id
            const name = it?.shipper_name ?? ''
            // return typeId === 2 && nameCounts[name] === 1
            return typeId === 2
          })
          const only_one_shipper_type_weekly: any = liftWeeklyForDate(ddddd, toDayjs(srchStartDate_).format('DD/MM/YYYY'))

          dataToFilter = [...type_daily, ...only_one_shipper_type_weekly]
        }
        console.log('2dataToFilter : ', dataToFilter); 
        dataToFilter = addSumPerRow(dataToFilter) // <-- วิธีนี้ไม่ถูก แต่รีบอะ
        // nominatedValueMMBTUD

        const groupedByShipperNameNew = Object.values(
          (dataToFilter || []).reduce((groups: any, item: any) => {
            const shipperName = item?.shipper_name ?? 'UNKNOWN'

            if (!groups[shipperName]) {
              groups[shipperName] = []
            }

            groups[shipperName].push(item)

            return groups
          }, {})
        )
        dataToFilter = groupedByShipperNameNew?.map((e_: any) => {
          if (e_?.length > 1) {
            const id_ = e_?.map((newDataRow: any) => newDataRow?.id)?.flat()
            const contractAll = e_?.map((newDataRow: any) => newDataRow?.contractAll)?.flat()
            const dataRow = e_
              ?.map((newDataRow: any) => newDataRow?.dataRow)
              ?.flat()
              ?.map((d_: any) => {
                const {...nD} = d_
                return {
                  ...nD,
                  gas_day: toDayjs(srchStartDate_).format('DD/MM/YYYY')
                }
              })

            const dataRowNew = Object.values(
              (dataRow || []).reduce((groups: any, item: any) => {
                const area_text = item?.area_text ?? 'UNKNOWN'

                if (!groups[area_text]) {
                  groups[area_text] = []
                }

                groups[area_text].push(item)

                return groups
              }, {})
            )
            // conceptPointZone
            // roundTo3

            const dataRowNew_ = dataRowNew?.map((dn: any) => {
              if (dn?.length > 1) {
                const contractAll_ = dn?.map((newDataRow: any) => newDataRow?.contractAll)?.flat()
                const capacityRightMMBTUD_ = dn?.reduce((accumulator: any, currentValue: any) => accumulator + (currentValue?.capacityRightMMBTUD || 0), 0)
                const nominatedValueMMBTUD_ = dn?.reduce((accumulator: any, currentValue: any) => accumulator + (currentValue?.nominatedValueMMBTUD || 0), 0)
                console.log('dn : ', dn);
                // nominaionPointZone
                const overusageMMBTUD_ = dn?.reduce((accumulator: any, currentValue: any) => accumulator + (currentValue?.overusageMMBTUD || 0), 0)
                const conceptPointZone_ = Object.values(
                  dn
                    ?.flatMap((item: any) => item?.conceptPointZone ?? [])
                    ?.reduce((result_: any, concept: any) => {
                      const zoneText = concept?.zone_text
                      if (!zoneText) return result_
                      if (!result_[zoneText]) {
                        result_[zoneText] = {
                          zone_text: zoneText,
                          zone: []
                        }
                      }
                      result_[zoneText].zone.push(...(concept?.zone ?? []))
                      return result_
                    }, {})
                )
                const nominaionPointZone_ = Object.values(
                  dn
                    ?.flatMap((item: any) => item?.nominaionPointZone ?? [])
                    ?.reduce((result_: any, concept: any) => {
                      const zoneText = concept?.zone_text
                      if (!zoneText) return result_
                      if (!result_[zoneText]) {
                        result_[zoneText] = {
                          zone_text: zoneText,
                          zone: []
                        }
                      }
                      result_[zoneText].zone.push(...(concept?.zone ?? []))
                      return result_
                    }, {})
                )

                const nominaionPointZone_convert_daily = nominaionPointZone_?.map((cv: any) => {
                  const {zone, ...nCv} = cv
                  const zone_ = zone?.map((cvZone: any) => {
                    const {data_temp, ...ncvZone} = cvZone

                    if (cvZone?.nom?.nomination_type_id === 2) {
                      const numDay_ = toDayjs(srchStartDate_).day()

                      const weeklyValue = parseToNumber(data_temp?.[14 + numDay_]) ?? 0

                      // ค่ารายชั่วโมง key 14-37
                      const valWeeklyHr = weeklyValue / 24

                      const hourlyEntries = Array.from({length: 24}, (_, index) => ({
                        key: index + 14,
                        value: valWeeklyHr
                      }))

                      // รวมค่าจาก key 14-37
                      const valWeeklyTotal = hourlyEntries.reduce((sum, item) => sum + item.value, 0)

                      const newDataTemp = Object.fromEntries([
                        // key 0-13
                        ...Array.from({length: 14}, (_, key) => [key, data_temp?.[key] ?? '']),

                        // key 14-37
                        ...hourlyEntries.map((item) => [item.key, String(item.value)]),

                        // key 38 = ผลรวม key 14-37
                        [38, String(valWeeklyTotal)]
                      ])

                      return {
                        ...ncvZone,
                        data_temp: newDataTemp
                      }
                    } else {
                      return cvZone
                    }
                  })

                  return {
                    ...nCv,
                    zone: zone_
                  }
                })

                const conceptPointZone_convert_daily = conceptPointZone_?.map((cv: any) => {
                  const {zone, ...nCv} = cv
                  const zone_ = zone?.map((cvZone: any) => {
                    const {data_temp, ...ncvZone} = cvZone
                    if (cvZone?.nom?.nomination_type_id === 2) {
                      const numDay_ = toDayjs(srchStartDate_).day()
                      const valWeeklyTotal = String(parseToNumber(data_temp?.[14 + numDay_]))
                      const valWeeklyHr: any = String(Number(parseToNumber(data_temp?.[14 + numDay_])) / 24)

                      const newDataTemp = Object.fromEntries([
                        // key 0 - 13 จากข้อมูลเดิม
                        ...Array.from({length: 14}, (_, key) => [key, data_temp?.[key] ?? '']),

                        // key 14 - 37 จาก valWeeklyHr
                        ...Array.from({length: 24}, (_, index) => [index + 14, valWeeklyHr]),

                        // key 38 จาก valWeeklyTotal
                        [38, valWeeklyTotal]
                      ])
                      return {
                        ...ncvZone,
                        data_temp: newDataTemp
                      }
                    } else {
                      return cvZone
                    }
                  })

                  return {
                    ...nCv,
                    zone: zone_
                  }
                })

                return {
                  areaObj: dn?.[0]?.areaObj,
                  area_text: dn?.[0]?.area_text,
                  capacityRightMMBTUD: capacityRightMMBTUD_,
                  conceptPointZone: conceptPointZone_convert_daily,
                  contract_code_id_arr: contractAll_,
                  nominaionPointZone: nominaionPointZone_convert_daily,
                  gas_day: toDayjs(srchStartDate_).format('DD/MM/YYYY'),
                  nominatedValueMMBTUD: nominatedValueMMBTUD_,
                  overusageMMBTUD: overusageMMBTUD_,
                  shipper_name: dn?.[0]?.shipper_name,
                  weeklyDay: null,
                  zoneObj: dn?.[0]?.zoneObj,
                  zone_text: dn?.[0]?.zone_text
                }
              } else {
                return dn?.[0]
              }
            })
            console.log('dataRowNew_ : ', dataRowNew_);

            const capacityRightMMBTUD = e_?.reduce((accumulator: any, currentValue: any) => accumulator + (currentValue?.capacityRightMMBTUD || 0), 0)
            const imbalanceMMBTUD = e_?.reduce((accumulator: any, currentValue: any) => accumulator + (currentValue?.imbalanceMMBTUD || 0), 0)
            const nominatedValueMMBTUD = e_?.reduce((accumulator: any, currentValue: any) => accumulator + (currentValue?.nominatedValueMMBTUD || 0), 0)
            const overusageMMBTUD = e_?.reduce((accumulator: any, currentValue: any) => accumulator + (currentValue?.overusageMMBTUD || 0), 0)
            const tmpOverUseage = e_?.reduce((accumulator: any, currentValue: any) => accumulator + (currentValue?.tmpOverUseage || 0), 0)
            const tmpSumCapacityRightMMBTUD = e_?.reduce((accumulator: any, currentValue: any) => accumulator + (currentValue?.tmpSumCapacityRightMMBTUD || 0), 0)
            return {
              capacityRightMMBTUD: capacityRightMMBTUD,
              contractAll: contractAll,
              dataRow: dataRowNew_,
              gas_day: toDayjs(srchStartDate_).format('DD/MM/YYYY'),
              gas_day_text: toDayjs(srchStartDate_).format('DD/MM/YYYY'),
              id: e_?.[0]?.id,
              id_: id_,
              imbalanceMMBTUD: imbalanceMMBTUD,
              nominatedValueMMBTUD: nominatedValueMMBTUD,
              nomination_type: null, // 1 2
              overusageMMBTUD: overusageMMBTUD,
              shipper_name: e_?.[0]?.shipper_name,
              tmpOverUseage: tmpOverUseage,
              tmpSumCapacityRightMMBTUD: tmpSumCapacityRightMMBTUD,
              weeklyDay: null
            }
          } else {
            return e_?.[0]
          }
        })
        // capacityRightMMBTUD
        // imbalanceMMBTUD
        // nominatedValueMMBTUD
        // overusageMMBTUD

        // tmpOverUseage
        // tmpSumCapacityRightMMBTUD

        // dataRow

        break
      case 1:
        const filtered_daily = dataToFilter?.filter((item: any) => item?.nomination_type.id == 1) // daily

        const data_with_sum = addSumPerRow(filtered_daily) // <-- วิธีนี้ไม่ถูก แต่รีบอะ
        setDataDailyOriginal(data_with_sum)
        dataToFilter = data_with_sum
        break
      case 2:
        const filtered_weekly = dataToFilter?.filter((item: any) => item?.nomination_type.id == 2) // weekly
        setDataWeeklyOriginal(filtered_weekly)
        dataToFilter = filtered_weekly && Array.isArray(filtered_weekly) && filtered_weekly.length > 0 ? filtered_weekly : dataWeeklyOriginal

        break
    }
    const result_2 = dataToFilter?.filter((item: any) => {
      return srchShipper?.length > 0 ? srchShipper.includes(item?.shipper_name) : true
    })

    if (response?.length > 0 && tabIndex_ === 2) {
      const resultAll = result_2?.map((item: any) => convertWeeklyDataToArray(item))
      const sortresult = sortByDate(resultAll.flat())
      set_filtered_weekly_all(sortresult)
    } else {
      set_filtered_weekly_all([])
    }
    setselectprops((pre) => pre?.map((item: any) => (item?.id == tabIndex_ ? {...item, gas_props: srchStartDate_, shipper: srchShipper} : item)))
    setData(result_2)
    setFilteredDataTable(result_2)

    setCurrentPage(1)
    setTimeout(() => {
      setIsLoading(true)
    }, 300)
  }

  const fetchDataInit = async () => {
    const res_shipper_name = await getService(`/master/account-manage/group-master?user_type=3`)
    setDataShipper(res_shipper_name)
    if (userDT?.account_manage?.[0]?.user_type_id == 3) {
      setSrchShipper([userDT?.account_manage?.[0]?.group?.name])
    }
  }

  const handleReset = async (tabIDX: any) => {
    if (userDT?.account_manage?.[0]?.user_type_id !== 3) {
      setSrchShipper([])
    }

    if (tabIDX < 2) {
      const selectDate = dayjs().add(1, 'day').toDate()
      setselectprops((pre) => pre?.map((item: any) => (item?.id == tabIndex ? {...item, gas_props: selectDate, shipper: null} : item)))
      onchangeGasdate(dayjs().add(1, 'day').toDate(), tabIDX)

      //   fetchOnlyData(tabIDX, selectDate) // กันโหลด data ซ้ำจากของเดิม
      handleFieldSearchNew(tabIDX, selectDate)
    } else {
      const selectDate = new Date(getCurrentWeekSundayYyyyMmDd())
      setselectprops((pre) => pre?.map((item: any) => (item?.id == tabIndex ? {...item, gas_props: selectDate, shipper: null} : item)))
      onchangeGasdate(new Date(getCurrentWeekSundayYyyyMmDd()), tabIDX)

      //   fetchOnlyData(tabIDX, selectDate) // กันโหลด data ซ้ำจากของเดิม
      handleFieldSearchNew(tabIDX, selectDate)
    }
    settk(!tk)
    setKey((prevKey) => prevKey + 1)
  }

  const handleSearch = (query: string, tabIDX?: any) => {
    let tab: any = tabIDX || tabIndex
    const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim()
    let filtered: any

    if (tab === 0) {
      filtered = filteredDataTable?.filter((item: any) => {
        return (
          item?.gas_day_text?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.shipper_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.capacityRightMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.nominatedValueMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.overusageMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.imbalanceMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.capacityRightMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.nominatedValueMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.overusageMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.imbalanceMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
        )
      })
    } else if (tab === 1) {
      filtered = filteredDataTable?.filter((item: any) => {
        return (
          item?.gas_day_text?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.shipper_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.capacityRightMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.nominatedValueMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.overusageMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.imbalanceMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.capacityRightMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.nominatedValueMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.overusageMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.imbalanceMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
        )
      })
    } else if (tab === 2) {
      const tabdayIndex: any = [
        {id: 0, day: 'sunday'},
        {id: 1, day: 'monday'},
        {id: 2, day: 'tuesday'},
        {id: 3, day: 'wednesday'},
        {id: 4, day: 'thursday'},
        {id: 5, day: 'friday'},
        {id: 6, day: 'saturday'},
        {id: 7, day: 'all'}
      ]

      let filter_weekly_sunday = filteredDataTable?.filter((item: any) => item?.gas_day_text == dayjs(srchStartDate).format('DD/MM/YYYY'))
      filtered = filter_weekly_sunday?.filter((item: any) => {
        return (
          item?.weeklyDay[tabdayIndex[subTabIndex]?.day]?.gas_day_text?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.shipper_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.weeklyDay[tabdayIndex[subTabIndex]?.day]?.capacityRightMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.weeklyDay[tabdayIndex[subTabIndex]?.day]?.nominatedValueMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.weeklyDay[tabdayIndex[subTabIndex]?.day]?.overusageMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.weeklyDay[tabdayIndex[subTabIndex]?.day]?.imbalanceMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimalNoComma(item?.weeklyDay[tabdayIndex[subTabIndex]?.day]?.capacityRightMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimalNoComma(item?.weeklyDay[tabdayIndex[subTabIndex]?.day]?.nominatedValueMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimalNoComma(item?.weeklyDay[tabdayIndex[subTabIndex]?.day]?.overusageMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimalNoComma(item?.weeklyDay[tabdayIndex[subTabIndex]?.day]?.imbalanceMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.weeklyDay[tabdayIndex[subTabIndex]?.day]?.capacityRightMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.weeklyDay[tabdayIndex[subTabIndex]?.day]?.nominatedValueMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.weeklyDay[tabdayIndex[subTabIndex]?.day]?.overusageMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.weeklyDay[tabdayIndex[subTabIndex]?.day]?.imbalanceMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
        )
      })
    }

    setPaginatedData(filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
  }

  const handleColumnToggle = (columnKey: string) => {
    setColumnVisibility((prev: any) => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }))
  }

  const handleChangeSubTab = (event: any, newValue: any) => {
    // 0 = 1-6 Hr
    // 1 = 7-12 Hr
    // 2 = 13-18 Hr
    // 3 = 19-24 Hr
    // 4 = All Day
    setSubTabIndex(newValue)
    setresetInitial(true)

    //sub tab all
    handleSearch('')
  }

  const getVisibleHours = () => {
    switch (subTabIndex) {
      case 0:
        return hours.slice(0, 6) // H1 - H6
      case 1:
        return hours.slice(6, 12) // H7 - H12
      case 2:
        return hours.slice(12, 18) // H13 - H18
      case 3:
        return hours.slice(18, 24) // H19 - H24
      case 4:
        return hours // All hours
      default:
        return []
    }
  }

  const handleChange = (event: any, newValue: any) => {
    setIsLoading(false)

    let tabIDX: any = newValue
    setTabIndex((pre: any) => tabIDX)
    settk(!tk)

    const props = selectprops?.find((item) => item?.id == tabIDX)

    onchangeGasdate(props?.gas_props, tabIDX)

    if (userDT?.account_manage?.[0]?.user_type_id !== 3) {
      setSrchShipper(props?.shipper ? props?.shipper : '')
    }
    // fetchOnlyData(tabIDX, props?.gas_props)
    handleFieldSearchNew(tabIDX, props?.gas_props)
  }

  const openViewForm = async (id: any) => {
    let filteredData: any
    if (tabIndex === 0) {
      filteredData = dataTable?.find((item: any) => item?.id === id)
    } else if (tabIndex === 1) {
      filteredData = dataDailyOriginal?.find((item: any) => item?.id === id)
    } else if (tabIndex === 2) {
      filteredData = dataWeeklyOriginal?.find((item: any) => item?.id === id)
    }
    // console.log('filteredData : ', filteredData);
    setViewDataMain(filteredData)
    setViewOpen(true)
  }

  const togglePopover = (id: any, anchor: any, subtab: any) => {
    if (openPopoverId === id) {
      setOpenPopoverId(null) // Close the popover if it's already open
      setAnchorPopover(null)
    } else {
      setOpenPopoverId(id) // Open the popover for the clicked row
      setsubTabIndexview(subtab)
      if (anchor) {
        setAnchorPopover(anchor)
      } else {
        setAnchorPopover(null)
      }
    }

    settk(!tk)
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
      setOpenPopoverId(null)
      setAnchorPopover(null)
    }
  }

  const toggleMenu = (mode: any, id: any) => {
    switch (mode) {
      case 'view':
        openViewForm(id)
        setOpenPopoverId(null) // close popover
        setAnchorPopover(null)
        break
    }
  }

  const hours = Array.from({length: 24}, (_, i) => ({
    key: `h${i + 1}`,
    label: `H${i + 1}`,
    timeRange: `${String(i).padStart(2, '0')}:01 - ${String(i + 1).padStart(2, '0')}:00`
  }))

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'gas_day_text',
        header: 'Gas Day',
        enableSorting: true,
        accessorFn: (row: any) => row?.gas_day_text || '',
        cell: (info) => {
          const row: any = info?.row?.original
          return <div>{row?.gas_day_text ? row?.gas_day_text : ''}</div>
        }
      },
      {
        accessorKey: 'shipper_name',
        header: 'Shipper Name',
        enableSorting: true,
        accessorFn: (row: any) => row?.shipper_name || '',
        cell: (info) => {
          const row: any = info?.row?.original
          return <div>{row?.shipper_name ? row?.shipper_name : ''}</div>
        }
      },
      {
        accessorKey: 'tmpSumCapacityRightMMBTUD',
        header: 'Capacity Right (MMBTU/D)',
        enableSorting: true,
        accessorFn: (row: any) => {
          const raw = row?.tmpSumCapacityRightMMBTUD
          if (!raw) return ''

          const fixed = formatNumberFourDecimal(raw) // เช่น 10,000.0000
          const noComma = fixed.replace(/,/g, '') // เช่น 10000.0000
          const rounded = parseFloat(raw).toString() // เช่น 10000

          return `${fixed} ${noComma} ${rounded}`
        },
        sortDescFirst: false,
        cell: (info) => {
          const row: any = info?.row?.original
          return <div className="text-right">{row?.tmpSumCapacityRightMMBTUD ? formatNumberThreeDecimal(row?.tmpSumCapacityRightMMBTUD) : '0.000'}</div>
        }
      },
      {
        accessorKey: 'nominated_value',
        header: 'Nominated Value (MMBTU/D)',
        enableSorting: true,
        accessorFn: (row: any) => {
          const raw = row?.nominatedValueMMBTUD
          if (!raw) return ''

          const fixed = formatNumberFourDecimal(raw) // เช่น 10,000.0000
          const noComma = fixed.replace(/,/g, '') // เช่น 10000.0000
          const rounded = parseFloat(raw).toString() // เช่น 10000

          return `${fixed} ${noComma} ${rounded}`
        },
        sortDescFirst: true,
        cell: (info) => {
          const row: any = info?.row?.original
          return <div className="text-right">{row?.nominatedValueMMBTUD ? formatNumberThreeDecimal(row?.nominatedValueMMBTUD) : '0.000'}</div>
        }
      },
      {
        accessorKey: 'tmpOverUseage',
        header: 'Overusage (MMBTU/D)',
        enableSorting: true,
        accessorFn: (row: any) => {
          const raw = row?.tmpOverUseage
          if (!raw) return ''

          const fixed = formatNumberFourDecimal(raw) // เช่น 10,000.0000
          const noComma = fixed.replace(/,/g, '') // เช่น 10000.0000
          const rounded = parseFloat(raw).toString() // เช่น 10000

          return `${fixed} ${noComma} ${rounded}`
        },
        cell: (info) => {
          const row: any = info?.row?.original
          return <div className="text-right">{row?.overusageMMBTUD ? formatNumberThreeDecimal(row?.overusageMMBTUD) : '0.000'}</div>
        }
      },
      {
        accessorKey: 'imbalance',
        header: 'Imbalance (MMBTU/D)',
        enableSorting: true,
        accessorFn: (row: any) => {
          const raw = row?.imbalanceMMBTUD
          if (!raw) return ''

          const fixed = formatNumberFourDecimal(raw) // เช่น 10,000.0000
          const noComma = fixed.replace(/,/g, '') // เช่น 10000.0000
          const rounded = parseFloat(raw).toString() // เช่น 10000

          return `${fixed} ${noComma} ${rounded}`
        },
        cell: (info) => {
          const row: any = info?.row?.original
          return <div className="text-right">{row?.imbalanceMMBTUD ? formatNumberThreeDecimal(row?.imbalanceMMBTUD) : '0.000'}</div>
        }
      },
      {
        accessorKey: 'action',
        id: 'actions',
        header: 'Action',
        align: 'center',
        enableSorting: false,
        size: 100,
        cell: (info) => {
          const row: any = info?.row?.original
          return <BtnActionTable togglePopover={togglePopover} row_id={row?.id} disable={userPermission?.b_manage ? false : true} />
        }
      }
    ],
    [userPermission, user_permission, tabIndex, subTabIndex]
  )

  const columnsWeekly = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'gas_day',
        header: 'Gas Day',
        enableSorting: true,
        accessorFn: (row: any) => {
          return row?.gas_day_text && subTabIndex < 7 ? dayjs(row.gas_day_text, 'DD/MM/YYYY')?.add(subTabIndex, 'day')?.format('DD/MM/YYYY') : dayjs(row.gas_day_text, 'DD/MM/YYYY')?.add(subTabIndex, 'day')?.format('DD/MM/YYYY') || row?.gas_day_text || ''
        },
        cell: (info) => {
          const row: any = info?.row?.original
          return <div>{row?.gas_day_text && subTabIndex < 7 ? dayjs(row.gas_day_text, 'DD/MM/YYYY')?.add(subTabIndex, 'day')?.format('DD/MM/YYYY') : (row?.gas_day_text ?? '')}</div>
        }
      },
      {
        accessorKey: 'shipper_name',
        header: 'Shipper Name',
        enableSorting: true,
        accessorFn: (row: any) => row?.shipper_name || '',
        cell: (info) => {
          const row: any = info?.row?.original
          return <div>{row?.shipper_name ? row?.shipper_name : ''}</div>
        }
      },
      {
        accessorKey: 'capacity_right',
        header: 'Capacity Right (MMBTU/D)',
        enableSorting: true,
        accessorFn: (row: any) => {
          const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

          const rawSrc = subTabIndex < 7 ? row?.weeklyDay?.[dayKeys[subTabIndex]]?.capacityRightMMBTUD : row?.capacityRightMMBTUD

          if (rawSrc == null) return ''

          const num = typeof rawSrc === 'number' ? rawSrc : Number(String(rawSrc).replace(/,/g, '').trim())

          if (!Number.isFinite(num)) return ''

          const fixed = formatNumberThreeDecimal(num) // เช่น "10,000.0000"
          const noComma = fixed.replace(/,/g, '') // เช่น "10000.0000"
          const rounded = parseFloat(noComma).toString() // เช่น "10000"

          return `${fixed} ${noComma} ${rounded}`
        },
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div className="text-right">
              {subTabIndex < 7 ? (formatNumberThreeDecimal(row?.weeklyDay?.[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][subTabIndex]]?.capacityRightMMBTUD) ?? '0.000') : (formatNumberThreeDecimal(row?.capacityRightMMBTUD) ?? '0.000')}
            </div>
          )
        }
      },
      {
        accessorKey: 'nominated_value',
        header: 'Nominated Value (MMBTU/D)',
        enableSorting: true,
        accessorFn: (row: any) => {
          const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
          const rawSrc = subTabIndex < 7 ? row?.weeklyDay?.[dayKeys[subTabIndex]]?.nominatedValueMMBTUD : row?.nominatedValueMMBTUD
          if (rawSrc == null) return ''

          const num = typeof rawSrc === 'number' ? rawSrc : Number(String(rawSrc).replace(/,/g, '').trim())

          if (!Number.isFinite(num)) return ''

          const fixed = formatNumberThreeDecimal(num) // เช่น "10,000.0000"
          const noComma = fixed.replace(/,/g, '') // เช่น "10000.0000"
          const rounded = parseFloat(noComma).toString() // เช่น "10000"

          return `${fixed} ${noComma} ${rounded}`
        },
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div className="text-right">
              {subTabIndex < 7 ? (formatNumberThreeDecimal(row?.weeklyDay?.[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][subTabIndex]]?.nominatedValueMMBTUD) ?? '0.000') : (formatNumberThreeDecimal(row?.nominatedValueMMBTUD) ?? '0.000')}
            </div>
          )
        }
      },
      {
        accessorKey: 'overusage',
        header: 'Overusage (MMBTU/D)',
        enableSorting: true,
        accessorFn: (row: any) => {
          const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
          const rawSrc = subTabIndex < 7 ? row?.weeklyDay?.[dayKeys[subTabIndex]]?.overusageMMBTUD : row?.overusageMMBTUD
          if (rawSrc == null) return ''

          const num = typeof rawSrc === 'number' ? rawSrc : Number(String(rawSrc).replace(/,/g, '').trim())

          if (!Number.isFinite(num)) return ''

          const fixed = formatNumberThreeDecimal(num) // เช่น "10,000.0000"
          const noComma = fixed.replace(/,/g, '') // เช่น "10000.0000"
          const rounded = parseFloat(noComma).toString() // เช่น "10000"

          return `${fixed} ${noComma} ${rounded}`
        },
        cell: (info) => {
          const row: any = info?.row?.original

          let calSod = 0
          let resultCalSod = 0

          if (subTabIndex < 7) {
            calSod = row?.weeklyDay?.[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][subTabIndex]]?.capacityRightMMBTUD - row?.weeklyDay?.[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][subTabIndex]]?.nominatedValueMMBTUD
            resultCalSod = calSod > 0 ? 0 : Math.abs(calSod)
          } else {
            calSod = row?.capacityRightMMBTUD - row?.nominatedValueMMBTUD
            resultCalSod = calSod > 0 ? 0 : Math.abs(calSod)
          }

          return <div className="text-right">{formatNumberThreeDecimal(resultCalSod)}</div>
        }
      },
      {
        accessorKey: 'imbalance',
        header: 'Imbalance (MMBTU/D)',
        enableSorting: true,
        accessorFn: (row: any) => {
          const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
          const rawSrc = subTabIndex < 7 ? row?.weeklyDay?.[dayKeys[subTabIndex]]?.imbalanceMMBTUD : row?.imbalanceMMBTUD
          if (rawSrc == null) return ''

          const num = typeof rawSrc === 'number' ? rawSrc : Number(String(rawSrc).replace(/,/g, '').trim())

          if (!Number.isFinite(num)) return ''

          const fixed = formatNumberThreeDecimal(num) // เช่น "10,000.0000"
          const noComma = fixed.replace(/,/g, '') // เช่น "10000.0000"
          const rounded = parseFloat(noComma).toString() // เช่น "10000"

          return `${fixed} ${noComma} ${rounded}`
        },
        cell: (info) => {
          const row: any = info?.row?.original
          return <div className="text-right">{subTabIndex < 7 ? (formatNumberThreeDecimal(row?.weeklyDay?.[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][subTabIndex]]?.imbalanceMMBTUD) ?? '0.000') : (formatNumberThreeDecimal(row?.imbalanceMMBTUD) ?? '0.000')}</div>
        }
      },
      {
        accessorKey: 'action',
        id: 'actions',
        header: 'Action',
        align: 'center',
        enableSorting: false,
        size: 100,
        cell: (info) => {
          const row: any = info?.row?.original
          const tabIDX: any = row?.tabIndex
          return <BtnActionTable togglePopover={togglePopover} row_id={row?.id} disable={userPermission?.b_manage ? false : true} subTabIndexview={tabIDX} />
        }
      }
    ],
    [userPermission, user_permission, tabIndex, subTabIndex]
  )

  const onchangeGasdate: any = (e: any, tabidx: any) => {
    let value = e ? e : null
    setSrchStartDate(value ? value : '')
    settk(!tk)
    if (!value) {
      setKey((prevKey) => prevKey + 1)
    }
  }

  useEffect(() => {
    fetchDataInit()
  }, [])

  useEffect(() => {
    if (forceRefetch || !shipperGroupData?.data) {
      dispatch(fetchShipperGroup())
    }

    // Reset forceRefetch after fetching
    if (forceRefetch) {
      setForceRefetch(false) // Reset the flag after triggering the fetch
    }
    getPermission()
  }, [dispatch, forceRefetch, shipperGroupData]) // Watch for forceRefetch changes

  useEffect(() => {
    // fetchOnlyData(tabIndex,srchStartDate)
    handleFieldSearchNew()
  }, [resetForm])

  useEffect(() => {
    if (filteredDataTable && tabIndex == 0) {
      setPaginatedData(filteredDataTable.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
    }

    if (filteredDataTable && tabIndex == 1) {
      setPaginatedData(filteredDataTable.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
    }

    if (filteredDataTable && tabIndex == 2) {
      setPaginatedData(filteredDataTable?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
    }
  }, [filteredDataTable, currentPage, itemsPerPage, tabIndex])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [popoverRef])

  useEffect(() => {
    getVisibleHours()
  }, [subTabIndex])

  useEffect(() => {
    console.log('dataTable : ', dataTable);
  }, [dataTable])
  

  return (
    <div className=" space-y-2">
      {/* TABLE MAIN */}
      {!viewOpen && (
        <>
          <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl  flex flex-col sm:flex-row gap-2">
            <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
              {tabIndex == 0 || tabIndex == 1 ? (
                <DatePickaSearch
                  defaultValue={srchStartDate}
                  key={'start' + key}
                  label={'Gas Day'}
                  placeHolder={'Select Gas Day'}
                  allowClear
                  onChange={(e: any) => {
                    let value: any = e ? e : null
                    setSrchStartDate(value ? value : '')
                  }}
                />
              ) : (
                <DatePickaSearch
                  defaultValue={srchStartDate}
                  key={'start' + key}
                  label={'Gas Week'}
                  modeSearch={'sunday'}
                  placeHolder={'Select Gas Week'}
                  allowClear
                  onChange={(e: any) => {
                    let value: any = e ? e : null
                    setSrchStartDate(value ? value : '')
                  }}
                />
              )}

              <InputSearch
                id="searchShipper"
                label="Shipper Name"
                type="select-multi-checkbox"
                value={srchShipper}
                isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
                onChange={(e) => {
                  setSrchShipper(e.target.value)
                }}
                options={dataShipper
                  ?.filter((item: any) => (userDT?.account_manage?.[0]?.user_type_id == 3 ? item?.id === userDT?.account_manage?.[0]?.group?.id : true))
                  .map((item: any) => ({
                    value: item.name,
                    label: item.name
                  }))}
              />

              <BtnSearch handleFieldSearch={() => handleFieldSearchNew()} />
              <BtnReset handleReset={() => handleReset(tabIndex)} />
            </aside>
            <aside className="mt-auto ml-1 w-full sm:w-auto">{/* BtnGeneral */}</aside>
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
            {['Daily/Weekly', 'Daily', 'Weekly']?.map((label, index) => (
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

          <div className="border-[#DFE4EA] border-[1px] p-4 rounded-tl-none rounded-xl shadow-sm">
            {!isLoading ? (
              <TableSkeleton />
            ) : tabIndex == 0 ? (
              <>
                {/* ================== NEW TABLE ==================*/}
                <AppTable
                  data={filteredDataTable}
                  columns={columns}
                  isLoading={isLoading}
                  exportBtn={
                    <BtnGeneral
                      bgcolor={'#24AB6A'}
                      modeIcon={'export'}
                      textRender={'Export'}
                      disable={dataExport?.length <= 0 ? true : false}
                      generalFunc={() => exportToExcel(filteredDataTable, 'shipper-nom-report-tab-0', columnVisibility)}
                      can_export={userPermission ? userPermission?.f_export : false}
                    />
                  }
                  initialColumns={Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))}
                  onColumnVisibilityChange={(columnKey: any) => handleColumnToggle(columnKey)}
                  onFilteredDataChange={(filteredData: any) => {
                    const newData = filteredData || []
                    if (JSON.stringify(dataExport) !== JSON.stringify(newData)) {
                      setDataExport(newData)
                    }
                  }}
                  border={false}
                  fixHeight={false}
                />
              </>
            ) : tabIndex == 1 ? (
              <AppTable
                data={filteredDataTable}
                columns={columns}
                isLoading={isLoading}
                exportBtn={
                  <BtnGeneral
                    bgcolor={'#24AB6A'}
                    modeIcon={'export'}
                    textRender={'Export'}
                    disable={dataExport?.length <= 0 ? true : false}
                    generalFunc={() => exportToExcel(filteredDataTable, 'shipper-nom-report-tab-0', columnVisibility)}
                    can_export={userPermission ? userPermission?.f_export : false}
                  />
                }
                initialColumns={Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))}
                onColumnVisibilityChange={(columnKey: any) => handleColumnToggle(columnKey)}
                onFilteredDataChange={(filteredData: any) => {
                  const newData = filteredData || []
                  if (JSON.stringify(dataExport) !== JSON.stringify(newData)) {
                    setDataExport(newData)
                  }
                }}
                border={false}
                fixHeight={false}
              />
            ) : tabIndex == 2 ? (
              <AppTable
                data={subTabIndex == 7 ? filtered_weekly_all : filteredDataTable}
                columns={columnsWeekly}
                isLoading={isLoading}
                filterProps={
                  tabIndex === 2 && (
                    <Tabs
                      value={subTabIndex}
                      onChange={handleChangeSubTab}
                      aria-label="wrapped label tabs example"
                      sx={{
                        '& .Mui-selected': {
                          color: '#00ADEF !important',
                          fontWeight: 'bold !important'
                        },
                        '& .MuiTabs-indicator': {
                          backgroundColor: '#00ADEF !important',
                          width: '59px !important',
                          transform: 'translateX(17%)',
                          bottom: '10px'
                        },
                        '& .MuiTab-root': {
                          minWidth: 'auto !important'
                        }
                      }}
                    >
                      {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'All'].map((label, index) => (
                        <Tab
                          key={label}
                          label={label}
                          id={`tab-${index}`}
                          sx={{
                            fontFamily: 'Tahoma !important',
                            textTransform: 'none',
                            padding: '8px 16px',
                            minWidth: '35px',
                            maxWidth: '85px',
                            flexShrink: 0,
                            color: subTabIndex === index ? '#58585A' : '#9CA3AF'
                          }}
                        />
                      ))}
                    </Tabs>
                  )
                }
                exportBtn={
                  <BtnGeneral
                    bgcolor={'#24AB6A'}
                    modeIcon={'export'}
                    textRender={'Export'}
                    disable={dataExport?.length <= 0 ? true : false}
                    generalFunc={() => exportToExcel(dataExport, 'shipper-nom-report-tab-weekly', columnVisibility, {subTabIndex: subTabIndex})}
                    can_export={userPermission ? userPermission?.f_export : false}
                  />
                }
                initialColumns={Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))}
                onColumnVisibilityChange={(columnKey: any) => handleColumnToggle(columnKey)}
                onFilteredDataChange={(filteredData: any) => {
                  const newData = filteredData || []
                  if (JSON.stringify(dataExport) !== JSON.stringify(newData)) {
                    setDataExport(newData)
                  }
                }}
                border={false}
                fixHeight={false}
                resetInitial={resetInitial}
                setresetInitial={setresetInitial}
              />
            ) : (
              <></>
            )}
          </div>
        </>
      )}

      {/* VIEW PAGE */}
      {viewOpen && (
        <ViewPage
          userPermission={userPermission}
          tableData={viewDataMain}
          setViewOpen={setViewOpen}
          subTabIndex={subTabIndex} // ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
          tabIndex={tabIndex} // all, daily, weekly
          subTabIndexview={subTabIndexview}
        />
      )}

      <ModalComponent open={isModalSuccessOpen} handleClose={handleCloseModal} title="Success" description={`${modalModalSuccessMsg}`} />

      <ModalComponent
        open={isModalErrorOpen}
        handleClose={() => {
          setModalErrorOpen(false)
          if (resetForm) resetForm()
        }}
        title="Failed"
        description={
          <div>
            <div className="text-center">{`${modalErrorMsg}`}</div>
          </div>
        }
        stat="error"
      />

      <Popover
        id="action-menu-popover"
        open={!!anchorPopover}
        anchorEl={anchorPopover}
        onClose={() => setAnchorPopover(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        sx={{
          borderRadius: '20px',
          overflow: 'hidden'
        }}
        className="z-50"
      >
        <div ref={popoverRef} className="w-50 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          <ul className="py-2">
            {userPermission?.b_manage && (
              <li
                className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  toggleMenu('view', openPopoverId)
                }}
              >
                <RemoveRedEyeOutlinedIcon sx={{fontSize: 20, marginRight: 2, color: '#58585A'}} /> {`View`}
              </li>
            )}
          </ul>
        </div>
      </Popover>
    </div>
  )
}

export default ClientPage
