'use client'

import {useEffect, useMemo, useRef, useState} from 'react'
import ModalComponent from '@/components/other/ResponseModal'
import {InputSearch} from '@/components/other/SearchForm'
import {Tune} from '@mui/icons-material'
import {getService} from '@/utils/postService'
import SearchInput from '@/components/other/searchInput'
import {Tab, Tabs} from '@mui/material'
import TableDownload from './form/tableDownload'
import BtnGeneral from '@/components/other/btnGeneral'
import BtnSearch from '@/components/other/btnSearch'
import BtnReset from '@/components/other/btnReset'
import getCookieValue from '@/utils/getCookieValue'
import useRestrictedPage from '@/utils/checkRestrictedPage'
import {decryptData} from '@/utils/encryptionData'
import getUserValue from '@/utils/getuserValue'
import BtnExport from '@/components/other/btnExport'
import {findRoleConfigByMenuName, formatDate, formatNumberFourDecimal, formatNumberFourDecimalNoComma, formatTime, generateUserPermission, getLatestByExecuteTimestamp, sleep, toDayjs} from '@/utils/generalFormatter'
import PaginationComponent from '@/components/other/globalPagination'
import dayjs from 'dayjs'
import {fetchAreaMaster} from '@/utils/store/slices/areaMasterSlice'
import {useAppDispatch} from '@/utils/store/store'
import {useFetchMasters} from '@/hook/fetchMaster'
import ColumnVisibilityPopover from '@/components/other/popOverShowHideCol'
import MonthYearPickaSearch from '@/components/library/dateRang/monthYearPicker'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import 'dayjs/locale/en' // หรือ 'th' ถ้าอยากใช้ภาษาไทย
import {fetchNominationPoint} from '@/utils/store/slices/nominationPointSlice'
import {TableReport} from './form/tableReport'
import Spinloading from '@/components/other/spinLoading'
dayjs.locale('en') // หรือ 'th' ก็ได้ตามต้องการ

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)
dayjs.tz.setDefault('Asia/Bangkok')

interface ClientProps {
  params: {
    lng: string
  }
}

const ClientPage: React.FC<ClientProps> = (props) => {
  // ############### PAGINATION ###############
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [paginatedData, setPaginatedData] = useState<any[]>([])
  const [paginatedDataDownload, setPaginatedDataDownload] = useState<any[]>([])

  // ############### Check Authen ###############
  const userDT: any = getUserValue()
  const token = getCookieValue('v4r2d9z5m3h0c1p0x7l')
  useRestrictedPage(token)

  // ############### PERMISSION ###############
  const [userPermission, setUserPermission] = useState<any>()
  let user_permission: any = localStorage?.getItem('k3a9r2b6m7t0x5w1s8j')
  // let user_permission: any = getCookieValue("k3a9r2b6m7t0x5w1s8j");
  user_permission = user_permission ? decryptData(user_permission) : null

  const getPermission = () => {
    try {
      user_permission = user_permission ? JSON.parse(user_permission) : null // Convert JSON string to object

      const permission = findRoleConfigByMenuName('Allocation Monthly Report', userDT)
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
  const {areaMaster, nominationPointData} = useFetchMasters()
  const [forceRefetch, setForceRefetch] = useState(true)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (forceRefetch || !areaMaster?.data) {
      dispatch(fetchAreaMaster())
    }

    if (forceRefetch || !nominationPointData?.data) {
      dispatch(fetchNominationPoint())
    }

    // Reset forceRefetch after fetching
    if (forceRefetch) {
      setForceRefetch(false) // Reset the flag after triggering the fetch
    }
    getPermission()
  }, [dispatch, forceRefetch, nominationPointData, areaMaster]) // Watch for forceRefetch changes

  // ############### FIELD SEARCH ###############
  const [key, setKey] = useState(0)
  const [isFilter, setIsFilter] = useState<any>(false)
  const [srchGasDay, setSrchGasDay] = useState<any>(null)
  const srchGasDayRef = useRef<string | null>(null)

  const [srchShipperName, setSrchShipperName] = useState<any>('')
  const [srchShipperName_, setSrchShipperName_] = useState<any>([])
  const [srchContractCode, setSrchContractCode] = useState('')
  const [srchContractCodeTabDownload, setSrchContractCodeTabDownload] = useState<any>([])
  const [srchVersion, setSrchVersion] = useState('')
  const [urlForApprove, setUrlForApprove] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [disableApprove, setDisableApprove] = useState(true)
  const [lastedExecuteTimestamp, setLastedExecuteTimestamp] = useState<any>({}) // v2.0.33 ข้อมูลที่แสดงใน allocation monthly report เมื่อเลือก filter gas day แล้ว แต่ไม่ทำการ filter เลือก version ข้อมูล Default จะเป็นข้อมูลล่าสุด last version จาก allocation report tab Daily ของ Gas Day ที่เลือก โดย user สามารถเลือกแสดงผลข้อมูลตาม version ที่เลือกได้ (ไม่มีการเลือก publication ที่ Daily ของ allocation report) https://app.clickup.com/t/86etetax3
  const [sNomPointId, setSNomPointId] = useState<any>([])

  const [dataTabDownloadOriginal, setDataTabDownloadOriginal] = useState<any>([])
  const [dataTabDownload, setDataTabDownload] = useState<any>([])
  const staticColumns = [
    {key: 'nomination_point', label: 'Nomination Point', visible: true},
    {key: 'shipper_name', label: 'Shipper Name', visible: true},
    {key: 'contract_code', label: 'Contract Code', visible: true},
    // { key: 'point', label: 'Point', visible: true },
    {key: 'type', label: 'Type', visible: true},
    {key: 'area', label: 'Area', visible: true}
  ]

  const handleFieldSearch = async () => {
    setIsLoading(false)

    if (tabIndex == 0) {
      if (srchGasDay !== null) {
        const month = srchGasDay ? String(srchGasDay.getMonth() + 1).padStart(2, '0') : ''
        const year = srchGasDay ? String(srchGasDay.getFullYear()) : ''
        setMonth(month)
        setYear(year)

        const selectedGasDay = dayjs(srchGasDay)
        const startDate = selectedGasDay.startOf('month').format('YYYY-MM-DD')
        const endDate = selectedGasDay.endOf('month').format('YYYY-MM-DD')
        const skip = (currentPage - 1) * itemsPerPage

        let url = `/master/allocation/allocation-monthly-report?start_date=${startDate}&end_date=${endDate}&skip=${skip}&limit=${itemsPerPage}&contractCode=${srchContractCode !== '' && srchContractCode !== undefined ? srchContractCode : 'Summary'}`
        url += srchShipperName && `&shipperId=${srchShipperName}`
        url += srchGasDay !== null && `&month=${month}&year=${year}`
        if (srchVersion) {
          url += `&version=${srchVersion}`
        }

        const res_data = await getService(url)

        // URL FOR APPROVE
        let url_approve = `/master/allocation/allocation-monthly-report-approved?start_date=${startDate}&end_date=${endDate}&skip=${skip}&limit=${itemsPerPage}&contractCode=${srchContractCode !== '' && srchContractCode !== undefined ? srchContractCode : 'Summary'}`
        url_approve += srchShipperName && `&shipperId=${srchShipperName}`
        url_approve += srchGasDay !== null && `&month=${month}&year=${year}`
        if (srchVersion) {
          url_approve += `&version=${srchVersion}`
        }

        setUrlForApprove(url_approve)

        // if (srchContractCode == '' || srchContractCode == undefined) {
        //     // case no contract
        //     let filter_summary = res_data?.data?.filter((item: any) => item.contract == "Summary")
        //     setData(filter_summary)
        //     setFilteredDataTable(filter_summary);
        // } else {
        //     // case search contract
        //     setData(res_data?.data)
        //     setFilteredDataTable(res_data?.data);
        // }

        setFilteredDataTable(res_data)
        setData(res_data)

        if (srchGasDay == null || srchShipperName == '' || res_data?.data?.length <= 0) {
          setDisableApprove(true)
        } else {
          setDisableApprove(false)
        }

        // ย้ายมาจาก useeffect ข้างล่าง
        const gasDay = dayjs(srchGasDay)
        const startOfMonth = gasDay.startOf('month')
        const daysInMonth = gasDay.daysInMonth()
        const dateColumns = Array.from({length: daysInMonth}, (_, index) => {
          const date = startOfMonth.add(index, 'day')
          const dateStr = date.format('DD/MM/YYYY')
          return {
            key: dateStr,
            label: dateStr,
            visible: true
          }
        })

        setColumns([...staticColumns, ...dateColumns])
        const for_col_visi = [...staticColumns, ...dateColumns]
        setColumnVisibility(Object.fromEntries(for_col_visi.map((column: any) => [column.key, column.visible])))

        // setTimeout(() => {
        //     setIsFilter(true)
        //     setIsLoading(true)
        // }, 500);
      }
    } else {
      if (userDT?.account_manage?.[0]?.user_type_id == 3) {
        const fullMonth = dayjs(srchGasDay).format('MMMM')
        const result_2 = dataTabDownloadOriginal?.filter((item: any) => {
          return (srchGasDay ? fullMonth == item?.monthText : true) && (srchShipperName ? srchShipperName == item?.group?.name : true) && (srchContractCodeTabDownload?.length > 0 ? srchContractCodeTabDownload.includes(item?.contractCode) : true)
        })
        setDataTabDownload(result_2)
      } else {
        console.log('srchGasDay : ', srchGasDay)
        const fullMonth = dayjs(srchGasDay).format('MMMM YYYY')
        console.log('fullMonth : ', fullMonth)
        console.log('dataTabDownloadOriginal : ', dataTabDownloadOriginal)
        const result_2 = dataTabDownloadOriginal.filter((item: any) => {
          if (srchShipperName_?.length === dataShipper?.length || srchShipperName_?.length === 0) {
            return (srchGasDay ? fullMonth == item?.monthText : true) && (srchContractCodeTabDownload?.length > 0 ? srchContractCodeTabDownload.includes(item?.contractCode) : true)
          } else {
            // const shipperName = item?.contractCode ? item?.group?.id_name : (dataShipper?.find((f: any) => f?.id_name === JSON.parse(item?.jsonData)?.typeReport)?.id_name || '')
            const shipperName = item?.group?.id_name
            const fShipper = srchShipperName_?.find((f: any) => f === shipperName)

            return (
              (srchGasDay ? fullMonth == item?.monthText : true) &&
              // (srchContractCodeTabDownload ? srchContractCodeTabDownload == item?.contractCode : true) &&
              (srchContractCodeTabDownload?.length > 0 ? srchContractCodeTabDownload.includes(item?.contractCode) : true) &&
              !!fShipper
            )
          }
        })
        setDataTabDownload(result_2)
      }

      //

      // const localDate = srchGasDayTabDownlaod ? toDayjs(srchGasDayTabDownlaod).format("MMMM YYYY") : toDayjs().format("MMMM YYYY");

      //
    }

    setTimeout(() => {
      setIsFilter(true)
      setIsLoading(true)
    }, 500)
  }

  const handleReset = () => {
    setIsFilter(false)
    setSrchGasDay(null)
    setSrchContractCode('')
    setSrchContractCodeTabDownload([])
    setSrchVersion('')
    setUrlForApprove('')
    setDisableApprove(true)

    if (userDT?.account_manage?.[0]?.user_type_id !== 3) {
      setSrchShipperName('')
      setSrchShipperName_([])
    }

    setFilteredDataTable([])
    setColumns(staticColumns) // ตอนกด reset จะได้รี column ด้วย

    if (tabIndex == 1) {
      setDataTabDownload(dataTabDownloadOriginal)
    }
    setKey((prevKey) => prevKey + 1)
  }

  const fetchShipperAndContract = async () => {
    const defaultMonth = dayjs().startOf('month')
    const month = srchGasDay ? dayjs(srchGasDay).startOf('day') : defaultMonth
    let apiUrl = `/master/daily-adjustment/shipper-data?month=${month.isValid() ? month.format('YYYY-MM-DD') : defaultMonth.format('YYYY-MM-DD')}`
    const res_: any = await getService(apiUrl)

    if (res_ && Array.isArray(res_)) {
      setDataShipper(res_)
      if (userDT?.account_manage?.[0]?.user_type_id == 3) {
        const uniqueContract = res_.filter((f: any) => f?.id === userDT?.account_manage?.[0]?.group?.id)?.flatMap((fm: any) => fm?.contract_code)
        setDataContract(uniqueContract)
      } else {
        const uniqueContract = res_.flatMap((fm: any) => fm?.contract_code)
        setDataContract(uniqueContract)
      }
    }
  }

  // ############### LIKE SEARCH ###############
  const [filteredDataTable, setFilteredDataTable] = useState<any>([])

  const norm = (s: any) =>
    String(s ?? '')
      .replace(/\s+/g, '')
      .toLowerCase()
      .trim()

  // ทำ pool สำหรับตัวเลข: raw / format มี comma / no comma
  const numberPool = (n: any) => {
    if (n == null || n === '') return []
    const raw = Number(n)
    if (Number.isNaN(raw)) return [norm(n)]
    return [
      norm(raw), // "10804.636999999999"
      norm(String(raw)), // เผื่อ
      norm(formatNumberFourDecimal(raw)), // "10,804.6370"
      norm(formatNumberFourDecimalNoComma(raw)) // "10804.6370"
    ].filter(Boolean)
  }

  // ใช้กับ contract code ตอนเสิช
  const normCode = (s: any) =>
    String(s ?? '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '') // ลบ -, _, ., /, ช่องว่าง ฯลฯ

  // ใช้กับ contract code ตอนเสิช
  const includesCode = (q: string, ...candidates: any[]) => {
    const qq = normCode(q)
    if (!qq) return false

    return candidates
      .flatMap((c) => (Array.isArray(c) ? c : [c]))
      .map(normCode)
      .filter(Boolean)
      .some((t) => t.includes(qq))
  }

  const datePool = (iso: any) => {
    if (!iso) return []
    // iso: "YYYY-MM-DD"
    const ddmmyyyy = norm(toDayjs(iso, 'YYYY-MM-DD').format('DD/MM/YYYY'))
    return [norm(iso), ddmmyyyy]
  }

  const includesQ = (q: string, ...candidates: any[]) => {
    const qq = norm(q)
    if (!qq) return false
    return candidates
      .flatMap((c) => (Array.isArray(c) ? c : [c]))
      .map(norm)
      .filter(Boolean)
      .some((t) => t.includes(qq))
  }

  const matchValueArray = (q: string, arr: any[] | undefined) => {
    if (!arr?.length) return false
    const qq = norm(q)

    return arr.some((x) => {
      const pools = [...datePool(x?.date), ...numberPool(x?.value)]
      return pools.some((p) => p.includes(qq))
    })
  }

  // const handleSearch = (query: string) => {
  //     const queryLower = query?.replace(/\s+/g, '')?.toLowerCase().trim();

  //     if (tabIndex == 0) {
  //         if (!queryLower) {
  //             setFilteredDataTable(dataTable);
  //             return;
  //         }

  //         const filtered = dataTable
  //             .map((group: any) => {
  //                 const filteredData = (group.data || [])
  //                     .map((areaEntry: any) => {
  //                         // เจอคำค้นที่ชื่อ area -> คืนทั้งก้อน ไม่กรอง .data
  //                         const areaMatch = (areaEntry?.area ?? '').toLowerCase().includes(queryLower);
  //                         if (areaMatch) return areaEntry;

  //                         // ----- กรณีไม่แมตช์ชื่อ area: เช็ค total และกรอง point ด้านใน -----
  //                         const totalValueMatch = (areaEntry?.total ?? []).some((t: any) => {
  //                             const raw = t?.value;
  //                             if (raw == null) return false;
  //                             const searchPool = [
  //                                 String(raw),
  //                                 formatNumberFourDecimal(raw),
  //                                 formatNumberFourDecimalNoComma(raw),
  //                             ].filter(Boolean);
  //                             return searchPool.some(str => str.includes(queryLower));
  //                         });

  //                         const filteredPointData = (areaEntry?.data ?? []).filter((pt: any) => {
  //                             const pointMatch = (pt?.point ?? '').toLowerCase().includes(queryLower);
  //                             const customerTypeMatch = (pt?.customer_type ?? '').toLowerCase().includes(queryLower);

  //                             const valueMatch = (pt?.data ?? []).some((d: any) => {
  //                                 const raw = d?.value;
  //                                 if (raw == null) return false;
  //                                 const searchPool = [
  //                                     String(raw),
  //                                     formatNumberFourDecimal(raw),
  //                                     formatNumberFourDecimalNoComma(raw),
  //                                 ].filter(Boolean);
  //                                 return searchPool.some(str => str.includes(queryLower));
  //                             });

  //                             return pointMatch || customerTypeMatch || valueMatch;
  //                         });

  //                         if (totalValueMatch || filteredPointData.length > 0) {
  //                             return { ...areaEntry, data: filteredPointData };
  //                         }
  //                         return null; // ไม่แมตช์อะไรเลย -> ตัดทิ้ง
  //                     })
  //                     .filter(Boolean);

  //                 /* ---------- กรองระดับ contract ---------- */
  //                 const contractMatch = group.contract?.toLowerCase().includes(queryLower);

  //                 /* ถ้ามีสัก area เหลือ หรือ contract ชื่อตรง ก็เก็บ group */
  //                 if (contractMatch || filteredData.length > 0) {
  //                     return {
  //                         ...group,
  //                         data: filteredData
  //                     };
  //                 }

  //                 return null;
  //             })
  //             .filter(Boolean);

  //         setFilteredDataTable(filtered);
  //     } else {
  //         if (!queryLower) {
  //             setDataTabDownload(dataTabDownloadOriginal);
  //             return;
  //         }

  //         const filtered = dataTabDownloadOriginal.filter(
  //             (item: any) => {
  //                 return (
  //                     item?.monthText?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
  //                     item?.contractCode?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
  //                     item?.file?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
  //                     item?.version?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
  //                     item?.typeReport?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
  //                     item?.create_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower.trim()) ||
  //                     item?.create_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower.trim()) || // เผื่อ search นามสกุล
  //                     item?.create_by_account?.first_name && item?.create_by_account?.last_name && (item?.create_by_account?.first_name + item?.create_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower.trim()) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
  //                     formatTime(item?.create_date)?.toLowerCase().includes(queryLower) ||
  //                     formatDate(item?.create_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower)
  //                 )
  //             }
  //         );
  //         setDataTabDownload(filtered)
  //     }
  // };

  const handleSearch = (query: string) => {
    const q = norm(query)

    if (tabIndex == 0) {
      if (!q) {
        setFilteredDataTable(dataTable)
        return
      }

      // --- 1. FILTER: areaShipperData (summary) ---
      const filteredAreaShipperData = (dataTable?.areaShipperData ?? [])
        .map((areaGroup: any) => {
          const area = areaGroup?.area

          // ถ้า match ที่ชื่อ area -> เก็บทั้งก้อน (ไม่ต้องกรอง shipperData)
          const areaMatch = includesQ(q, area)
          if (areaMatch) return areaGroup

          const filteredShippers = (areaGroup?.shipperData ?? [])
            .map((ship: any) => {
              const shipperId = ship?.shipperId
              const shipperName = ship?.shipperName

              // match ระดับ shipper (แถวฟ้า/เหลืองที่เป็นหัว shipper)
              const shipMetaMatch = includesQ(q, shipperId, shipperName)

              // match ที่ total ของ shipper
              const shipTotalMatch = matchValueArray(q, ship?.total)

              // กรอง point rows (detail ใต้ shipper)
              // const filteredPoints =
              //     (ship?.data ?? [])
              //         .filter((pt: any) => {
              //             const pointMatch = includesQ(q, pt?.point);
              //             const typeMatch = includesQ(q, pt?.customer_type);
              //             const valueMatch = matchValueArray(q, pt?.data);
              //             return pointMatch || typeMatch || valueMatch;
              //         });

              const filteredPoints = (ship?.data ?? []).filter((pt: any) => {
                const pointMatch = includesQ(q, pt?.point)
                const typeMatch = includesQ(q, pt?.customer_type)
                const valueMatch = matchValueArray(q, pt?.data)

                const contracts = contractIndexByShipperAreaPoint.get(`${ship?.shipperId}|${areaGroup?.area}|${pt?.point}`) ?? []
                const contractMatch = includesCode(q, contracts)

                return pointMatch || typeMatch || valueMatch || contractMatch
              })

              // ถ้า match ที่ shipper meta/total -> เก็บทั้ง point ทั้งหมด
              if (shipMetaMatch || shipTotalMatch) return ship

              if (filteredPoints.length > 0) {
                return {...ship, data: filteredPoints}
              }

              return null
            })
            .filter(Boolean)

          if (filteredShippers.length > 0) {
            return {...areaGroup, shipperData: filteredShippers}
          }

          return null
        })
        .filter(Boolean)

      // --- 2. FILTER: data (detail by contract) ---
      const filteredContracts = (dataTable?.data ?? [])
        .map((group: any) => {
          const contract = group?.contract
          const shipperId = group?.shipperId
          const shipperName = group?.shipperName

          // match ระดับ contract row (แถวขาวที่มี contract code)
          // const contractMatch = includesQ(q, contract, shipperId, shipperName);
          const contractMatch = includesCode(q, contract) || includesQ(q, shipperName) || includesCode(q, shipperId)

          const filteredAreas = (group?.data ?? [])
            .map((areaEntry: any) => {
              const area = areaEntry?.area

              // match area -> คืนทั้ง areaEntry
              const areaMatch = includesQ(q, area)
              if (areaMatch) return areaEntry

              // match total ของ area (ถ้ามี)
              const totalMatch = matchValueArray(q, areaEntry?.total)

              const filteredPoints = (areaEntry?.data ?? []).filter((pt: any) => {
                const pointMatch = includesQ(q, pt?.point)
                const typeMatch = includesQ(q, pt?.customer_type)
                const valueMatch = matchValueArray(q, pt?.data)
                return pointMatch || typeMatch || valueMatch
              })

              if (totalMatch) return areaEntry

              if (filteredPoints.length > 0) {
                return {...areaEntry, data: filteredPoints}
              }

              return null
            })
            .filter(Boolean)

          // ถ้า contractMatch -> เก็บทั้ง group (ไม่กรอง data)
          if (contractMatch) return group

          if (filteredAreas.length > 0) {
            return {...group, data: filteredAreas}
          }

          return null
        })
        .filter(Boolean)

      /* =========================
       * 3) รวมผลลัพธ์: คืนโครงสร้างเดิม
       * ========================= */
      setFilteredDataTable({
        ...dataTable,
        areaShipperData: filteredAreaShipperData,
        data: filteredContracts
      })
    } else {
      if (!q) {
        setDataTabDownload(dataTabDownloadOriginal)
        return
      }

      const filtered = dataTabDownloadOriginal.filter((item: any) => {
        return (
          item?.monthText?.replace(/\s+/g, '').toLowerCase().trim().includes(q) ||
          item?.contractCode?.replace(/\s+/g, '').toLowerCase().trim().includes(q) ||
          item?.file?.replace(/\s+/g, '').toLowerCase().trim().includes(q) ||
          item?.version?.replace(/\s+/g, '').toLowerCase().trim().includes(q) ||
          item?.typeReport?.replace(/\s+/g, '').toLowerCase().trim().includes(q) ||
          item?.create_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(q.trim()) ||
          item?.create_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(q.trim()) || // เผื่อ search นามสกุล
          (item?.create_by_account?.first_name && item?.create_by_account?.last_name && (item?.create_by_account?.first_name + item?.create_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(q.trim())) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
          formatTime(item?.create_date)?.toLowerCase().includes(q) ||
          formatDate(item?.create_date)?.replace(/\s+/g, '').toLowerCase().includes(q)
        )
      })
      setDataTabDownload(filtered)
    }
  }

  const [tabIndex, setTabIndex] = useState(0)
  const [dataTable, setData] = useState<any>([])
  const [resetForm, setResetForm] = useState<() => void | null>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [dataContractOriginal, setDataContractOriginal] = useState<any>([])
  const [dataContract, setDataContract] = useState<any>([])
  const [dataContractFiltered, setDataContractFiltered] = useState<any[]>([])
  const [dataShipper, setDataShipper] = useState<any>([])

  const [dataShipperMapWithVersion, setDataShipperMapWithVersion] = useState<any[]>([])
  const [dataVersion, setDataVersion] = useState<any>([])

  const handleChange = (event: any, newValue: any) => {
    setTabIndex(newValue)
    handleReset()
  }

  const fetchData = async () => {
    try {
      // ถ้า user เป็น shipper
      // https://app.clickup.com/t/86ert2k28 ตามที่คุยกัน หากเป็น shipper user ถ้ามี filter ชื่อ shipper ให้ค้างชื่อ shipper ตัวเองไว้เลย ไม่ต้องขึ้นเป็น dropdown ให้เลือก - ปรับทั้ง system
      if (userDT?.account_manage?.[0]?.user_type_id == 3) {
        setSrchShipperName(userDT?.account_manage?.[0]?.group?.id_name)
        setSrchShipperName_([userDT?.account_manage?.[0]?.group?.id_name])
      }

      fetchShipperAndContract()
      // // Group (2 = TSO, 3 = Shipper, 4 = Other)
      // const res_shipper_name = await getService(`/master/account-manage/group-master?user_type=3`);
      // setDataShipper(res_shipper_name)

      // DATA CONTRACT CODE
      // const res_contract_code = await getService(`/master/release-capacity-submission/contract-code`);
      const res_contract_code: any = await getService(`/master/capacity/pure-contract`)
      // setDataContract(res_contract_code);
      setDataContractOriginal(res_contract_code)

      // DATA TAB DOWNLAOD
      const res_tab_download = await getService(`/master/allocation/allocation-monthly-report-download`)

      // map shipper เข้า
      console.log('res_tab_download : ', res_tab_download)
      let updatedData = res_tab_download?.map((item: any) => {
        const matchContract = res_contract_code?.find((itemx: any) => itemx.contract_code === item.contractCode)
        if (matchContract) {
          return {
            ...item,
            group: matchContract?.group,
            shipper_name: matchContract?.group?.name
          }
        }
        return item
      })
      console.log('updatedData : ', updatedData)
      setDataTabDownloadOriginal(updatedData)
      setDataTabDownload(updatedData)

      // DATA SELECT VERSION
      // filterVersion()
      // const res_master_version = await getService(`/master/allocation/version-exe`);
      // setDataVersion(res_master_version)

      setIsLoading(true)
    } catch (err) {
      // setError(err.message);
    } finally {
      // setLoading(false);
    }
  }
  const [loadVersion, setloadVersion] = useState(false)
  const filterVersion = async (selectedMonth?: any) => {
    // selectedMonth มีค่า ให้ใช้เดือนที่เพิ่งเลือก
    // ไม่มีค่า ให้ใช้ srchGasDay
    // ถ้ายังไม่ได้เลือก Gas Month ให้ใช้เดือนปัจจุบัน
    const selectedGasDay = selectedMonth ? toDayjs(selectedMonth) : srchGasDay ? toDayjs(srchGasDay) : toDayjs()

    if (!selectedGasDay.isValid()) {
      setDataShipperMapWithVersion([])
      setDataVersion([])
      setLastedExecuteTimestamp({})
      return
    }

    // จำเดือนที่ request นี้ดึงมา ใช้เช็คหลัง await ว่า srchGasDay เปลี่ยนหรือยัง
    const requestedGasMonth = selectedGasDay.format('YYYY-MM')

    const startDate = selectedGasDay.startOf('month').format('YYYY-MM-DD')

    const endDate = selectedGasDay.endOf('month').format('YYYY-MM-DD')

    const month = selectedGasDay.format('MM')
    const year = selectedGasDay.format('YYYY')

    let url = `/master/allocation/monthly-report-version-exe` + `?start_date=${startDate}` + `&end_date=${endDate}` + `&skip=0` + `&limit=${itemsPerPage}` + `&month=${month}` + `&year=${year}`

    if (srchShipperName) {
      url += `&shipperId=${encodeURIComponent(srchShipperName)}`
    }

    try {
      setloadVersion(true)
      const res: any = await getService(url)

      // srchGasDay เปลี่ยนระหว่างรอ API → ทิ้ง response นี้
      if (srchGasDayRef.current !== requestedGasMonth) return

      if (!Array.isArray(res)) {
        setDataShipperMapWithVersion([])
        setDataVersion([])
        setLastedExecuteTimestamp({})
        setSrchVersion('')
        return
      }

      setDataShipperMapWithVersion(res)

      const timestampMap = new Map<
        number,
        {
          request_number: number
          execute_timestamp: number
        }
      >()

      res.forEach((item: any) => {
        if (!Array.isArray(item?.data)) return

        item.data.forEach((dataItem: any) => {
          const executeTimestamp = Number(dataItem?.execute_timestamp)

          if (!Number.isFinite(executeTimestamp) || dataItem?.request_number == null) {
            return
          }

          if (!timestampMap.has(executeTimestamp)) {
            timestampMap.set(executeTimestamp, {
              request_number: dataItem.request_number,
              execute_timestamp: executeTimestamp
            })
          }
        })
      })

      const result = Array.from(timestampMap.values()).sort((a, b) => a.execute_timestamp - b.execute_timestamp)

      const latestTimestamp = getLatestByExecuteTimestamp(result)

      setLastedExecuteTimestamp(latestTimestamp ?? {})
      setDataVersion(result)

      // Version เดิมไม่อยู่ในเดือนใหม่ ให้ล้างค่า
      if (srchVersion && !result.some((item) => String(item.execute_timestamp) === String(srchVersion))) {
        setSrchVersion('')
      }
      setloadVersion(false)
    } catch (error) {
      setloadVersion(false)
      // srchGasDay เปลี่ยนระหว่างรอ API → ทิ้ง error handling ของ request เก่า
      if (srchGasDayRef.current !== requestedGasMonth) return

      console.error('Failed to fetch monthly report versions:', error)

      setDataShipperMapWithVersion([])
      setDataVersion([])
      setLastedExecuteTimestamp({})
      setSrchVersion('')
    }
  }

  useEffect(() => {
    fetchShipperAndContract()

    srchGasDayRef.current = srchGasDay ? toDayjs(srchGasDay).format('YYYY-MM') : null
    if (srchGasDay) {
      filterVersion(srchGasDay)
    }
  }, [srchGasDay, itemsPerPage])

  useEffect(() => {
    let versionDataOfShipper = []
    if (srchShipperName) {
      versionDataOfShipper = dataShipperMapWithVersion.filter((item: any) => item.shipper == srchShipperName)
    } else {
      versionDataOfShipper = dataShipperMapWithVersion
    }

    const timestampMap = new Map<number, {request_number: number; execute_timestamp: number}>()

    versionDataOfShipper.forEach((item) => {
      if (item.data && Array.isArray(item.data)) {
        item.data.forEach((dataItem: any) => {
          if (dataItem.execute_timestamp && dataItem.request_number) {
            // Use execute_timestamp as key to ensure uniqueness
            // If duplicate timestamp exists, keep the first one (or you can modify this logic)
            if (!timestampMap.has(dataItem.execute_timestamp)) {
              timestampMap.set(dataItem.execute_timestamp, {
                request_number: dataItem.request_number,
                execute_timestamp: dataItem.execute_timestamp
              })
            }
          }
        })
      }
    })

    const result = Array.from(timestampMap.values()).sort((a, b) => a.execute_timestamp - b.execute_timestamp) // Sort ascending (oldest first)

    if (!result.some((item: any) => item.execute_timestamp == srchVersion)) {
      setSrchVersion('')
    }

    setDataVersion(result)
  }, [srchShipperName, dataShipperMapWithVersion])

  // useEffect(() => {
  //   const dataContract_ =
  //     tabIndex == 0 ? dataContract?.filter((item: any) => (srchShipperName?.length > 0 ? srchShipperName?.includes(item?.group?.id_name) : true)) || [] : dataContract?.filter((item: any) => (srchShipperName_?.length > 0 ? srchShipperName_?.includes(item?.group?.id_name) : true)) || []

  //   const fromDate = dayjs(srchGasDay).startOf('day')

  //   const toDate = dayjs(srchGasDay).endOf('day')

  //   const filteredContract =
  //     dataContract_?.filter((contract: any) => {
  //       if (!contract?.contract_start_date) return false

  //       const contractStart = dayjs(contract.contract_start_date)
  //       const contractEndDate = contract?.terminate_date || contract?.extend_deadline || contract?.contract_end_date
  //       const contractEnd = contractEndDate ? dayjs(contractEndDate).subtract(1, 'day') : null

  //       if (!contractStart.isValid()) return false

  //       // contract_start_date <= วันที่สิ้นสุดที่ค้นหา
  //       const startIsValid = !contractStart.isAfter(toDate)

  //       // contract_end_date >= วันที่เริ่มต้นที่ค้นหา
  //       // ถ้า contract_end_date เป็น null ให้ถือว่าสัญญายังไม่สิ้นสุด
  //       const endIsValid = !contractEnd || !contractEnd.isBefore(fromDate)

  //       return startIsValid && endIsValid
  //     }) || []

  //   setDataContractFiltered(filteredContract)
  // }, [srchGasDay, tabIndex, srchShipperName, srchShipperName_, dataContract])

  useEffect(() => {
  if (!srchGasDay) {
    setDataContractFiltered([])
    return
  }

  const dataContract_ =
    tabIndex === 0
      ? dataContract?.filter((item: any) =>
          srchShipperName
            ? item?.group?.id_name === srchShipperName
            : true
        ) || []
      : dataContract?.filter((item: any) =>
          srchShipperName_?.length > 0
            ? srchShipperName_.includes(item?.group?.id_name)
            : true
        ) || []

  // ✅ ใช้ช่วงทั้งเดือน
  const monthStart = dayjs(srchGasDay).startOf('month')
  const monthEnd = dayjs(srchGasDay).endOf('month')

  const filteredContract = dataContract_.filter((contract: any) => {
    if (!contract?.contract_start_date) return false

    const contractStart = dayjs(contract.contract_start_date).startOf('day')

    /**
     * ถ้ามี extend_deadline ให้ใช้ก่อน
     * แล้วค่อย terminate_date
     * แล้วค่อย contract_end_date
     */
    const contractEndDate =
      contract?.extend_deadline ||
      contract?.terminate_date ||
      contract?.contract_end_date

    const contractEnd = contractEndDate
      ? dayjs(contractEndDate).subtract(1, 'day').endOf('day')
      : null

    if (!contractStart.isValid()) return false

    /**
     * Contract ต้อง overlap กับเดือนที่เลือก
     *
     * contractStart <= สิ้นเดือน
     * AND
     * contractEnd >= ต้นเดือน
     *
     * เช่น July 2026:
     * 01/07/2026 - 31/07/2026
     */
    const startIsValid =
      contractStart.isSameOrBefore(monthEnd)

    const endIsValid =
      !contractEnd ||
      contractEnd.isSameOrAfter(monthStart)

    return startIsValid && endIsValid
  })

  setDataContractFiltered(filteredContract)
}, [
  srchGasDay,
  tabIndex,
  srchShipperName,
  srchShipperName_,
  dataContract
])

  const fetchDataDownload = async () => {
    // DATA TAB DOWNLAOD
    const res_tab_download = await getService(`/master/allocation/allocation-monthly-report-download`)
    // setDataTabDownloadOriginal(res_tab_download)
    // setDataTabDownload(res_tab_download)

    // map shipper เข้า
    let updatedData = res_tab_download?.map((item: any) => {
      const matchContract = dataContractOriginal?.find((itemx: any) => itemx.contract_code === item.contractCode)
      if (matchContract) {
        return {
          ...item,
          group: matchContract?.group,
          shipper_name: matchContract?.group?.name
        }
      }
      return item
    })
    setDataTabDownloadOriginal(updatedData)
    setDataTabDownload(updatedData)
  }

  useEffect(() => {
    fetchData()
    getPermission()
  }, [resetForm])

  // ############# NEW MODAL CREATE/EDIT/VIEW  #############
  const [isModalSuccessOpen, setModalSuccessOpen] = useState(false)
  const handleCloseModal = () => setModalSuccessOpen(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewData, setViewData] = useState<any>()

  const [modalErrorMsg, setModalErrorMsg] = useState('')
  const [isModalErrorOpen, setModalErrorOpen] = useState(false)

  const openViewForm = (id: any) => {
    const filteredData = dataTable.find((item: any) => item.id === id)
    setViewData(filteredData)
    setViewOpen(true)
  }

  // ############# NEW MODAL CREATE/EDIT/VIEW  #############
  const openApproveModal = async (id: any, data: any) => {
    setIsLoading(false)
    setDisableApprove(true)

    try {
      await approveMonthlyReport()
      await sleep(800)
      await fetchDataDownload()

      setModalSuccessOpen(true)
      setTabIndex(1) // ไป tab downlaod

      await sleep(400)
      setIsLoading(true)
    } catch (error) {
      // approve failed
    } finally {
      setIsLoading(true)
      setDisableApprove(false)
    }

    try {
      const res_tab_download = await getService(`/master/allocation/allocation-monthly-report-download`)
      // setDataTabDownloadOriginal(res_tab_download)
      // setDataTabDownload(res_tab_download)

      // map shipper เข้า
      let updatedData = res_tab_download?.map((item: any) => {
        const matchContract = dataContractOriginal?.find((itemx: any) => itemx.contract_code === item.contractCode)
        if (matchContract) {
          return {
            ...item,
            group: matchContract?.group,
            shipper_name: matchContract?.group?.name
          }
        }
        return item
      })
      setDataTabDownloadOriginal(updatedData)
      setDataTabDownload(updatedData)
    } catch (error) {}
  }

  const approveMonthlyReport = async () => {
    try {
      const res_approve = await getService(urlForApprove)
    } catch (error) {}
  }

  // ############### COLUMN SHOW/HIDE ###############
  const [initialColumns, setColumns] = useState<any[]>(staticColumns)
  const initialColumnsDownload: any = [
    {key: 'month', label: 'Month', visible: true},
    {key: 'group', label: 'Shipper Name', visible: true},
    {key: 'contract_code', label: 'Contract Code', visible: true},
    {key: 'file', label: 'File', visible: true},
    {key: 'report_version', label: 'Report Version', visible: true},
    {key: 'type_report', label: 'Type Report', visible: true},
    {key: 'approved_by', label: 'Approved by', visible: true},
    {key: 'download', label: 'Download', visible: true}
  ]

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const [columnVisibility, setColumnVisibility] = useState<any>(Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible])))

  // useEffect(() => {
  //     setColumnVisibility(Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible])))
  // }, [initialColumns])

  const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget)
  }

  const handleColumnToggle = (columnKey: string) => {
    setColumnVisibility((prev: any) => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }))
  }

  useEffect(() => {
    if (tabIndex == 0) {
      setColumnVisibility(Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible])))
    } else {
      setColumnVisibility(Object.fromEntries(initialColumnsDownload.map((column: any) => [column.key, column.visible])))
    }
  }, [tabIndex, initialColumns])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setItemsPerPage(itemsPerPage)
    setCurrentPage(1)
  }

  useEffect(() => {
    if (filteredDataTable) {
      // setPaginatedData(filteredDataTable[0]?.data?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
      // setPaginatedData(filteredDataTable)

      const original = filteredDataTable?.areaShipperData?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

      const newData = {
        ...filteredDataTable,
        areaShipperData: original ?? []
      }

      setPaginatedData(newData)
    }

    if (tabIndex == 1) {
      setPaginatedDataDownload(dataTabDownload?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
    }
  }, [filteredDataTable, currentPage, itemsPerPage, dataTabDownload])

  // const filterVersion = (mode?: any, date?: any) => {
  //     const from = srchGenerateFrom ? toDayjs(watch('generate_from')).startOf('day') : null;
  //     const to = srchGenerateTo ? toDayjs(watch('generate_to')).startOf('day') : null;

  //     const result = dataVersion?.filter((item: any) => {
  //         const gasDate = toDayjs(item.gas_day).startOf('day');

  //         /* ── เงื่อนไขกรอง ──────────────────────────
  //            1. ไม่มี from และ to  →  ไม่ต้องกรอง
  //            2. มี from อย่างเดียว  →  ≥ from
  //            3. มี to   อย่างเดียว  →  ≤ to
  //            4. มีทั้งสอง           →  ≥ from AND ≤ to
  //         */
  //         if (!from && !to) return true;

  //         if (from && to) return gasDate.isSameOrAfter(from) && gasDate.isSameOrBefore(to);
  //         if (from) return gasDate.isSameOrAfter(from);
  //         /* เหลือแค่กรณีมี to อย่างเดียว */
  //         return gasDate.isSameOrBefore(to);
  //     });

  //     setValue('data_version_filter', result)
  //     setDataVerSionFilter(result);
  // };

  // ใช้กับตอน approve แล้ว fetch ใหม่
  // useEffect(() => {
  //     setDataTabDownload(dataTabDownloadOriginal)
  // }, [dataTabDownload])

  const contractIndexByShipperAreaPoint = useMemo(() => {
    const m = new Map<string, string[]>()
    ;(dataTable?.data ?? []).forEach((g: any) => {
      const contract = g?.contract
      if (!contract || contract === 'Summary') return

      const shipperId = g?.shipperId

      ;(g?.data ?? []).forEach((a: any) => {
        const area = a?.area
        ;(a?.data ?? []).forEach((pt: any) => {
          const point = pt?.point
          const key = `${shipperId}|${area}|${point}`
          const arr = m.get(key) ?? []
          arr.push(contract)
          m.set(key, arr)
        })
      })
    })
    return m
  }, [dataTable])


const downloadContractOptions = useMemo(() => {
  const selectedMonth = srchGasDay
    ? dayjs(srchGasDay).format('MMMM YYYY')
    : null

  const rows = (dataTabDownloadOriginal ?? []).filter((item: any) => {
    // Filter เดือน
    const matchMonth =
      !selectedMonth ||
      item?.monthText === selectedMonth

    // Filter shipper
    let matchShipper = true

    if (userDT?.account_manage?.[0]?.user_type_id === 3) {
      // Shipper User
      matchShipper =
        !srchShipperName ||
        item?.group?.id_name === srchShipperName
    } else {
      // TSO / Other
      matchShipper =
        !srchShipperName_?.length ||
        srchShipperName_.includes(item?.group?.id_name)
    }

    return matchMonth && matchShipper
  })

  // เอาเฉพาะ Contract Code ที่มีอยู่จริงในตาราง
  // ตัด null / undefined / "" / Summary ที่ไม่มี contractCode
  const uniqueContractCodes = Array.from(
    new Set(
      rows
        .map((item: any) => item?.contractCode)
        .filter(
          (contractCode: any) =>
            contractCode &&
            String(contractCode).trim() !== ''
        )
    )
  )

  return uniqueContractCodes
    .sort((a: any, b: any) =>
      String(a).localeCompare(String(b))
    )
    .map((contractCode: any) => ({
      value: contractCode,
      label: contractCode
    }))
}, [
  dataTabDownloadOriginal,
  srchGasDay,
  srchShipperName,
  srchShipperName_
])

  return (
    <div className=" space-y-2">
      <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
        <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
          <MonthYearPickaSearch
            key={'start' + key}
            label="Gas Month"
            placeHolder="Select Gas Month"
            allowClear
            min={dataTable?.date_balance}
            onChange={(e: any) => {
              const newGasMonth = e ?? null

              const oldMonth = srchGasDay ? toDayjs(srchGasDay).format('YYYY-MM') : ''

              const newMonth = newGasMonth ? toDayjs(newGasMonth).format('YYYY-MM') : ''

              if (oldMonth !== newMonth) {
                setSrchShipperName('')
                setSrchShipperName_([])
                setSrchContractCode('')
                setSrchContractCodeTabDownload([])
                setDataShipper([])
                setDataContract([])
                setSrchVersion('')
                setDataVersion([])
                setDataShipperMapWithVersion([])
              }

              setSrchGasDay(newGasMonth)

              // // ส่งเดือนที่เลือกเข้าไปโดยตรง
              // filterVersion(newGasMonth);
            }}
          />

          {tabIndex == 0 || userDT?.account_manage?.[0]?.user_type_id == 3 ? (
            <InputSearch
              id="searchShipper"
              label="Shipper Name"
              type="select"
              value={srchShipperName}
              isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
              onChange={(e) => {
                if (e.target.value == undefined) {
                  if (srchShipperName) {
                    setSrchContractCode('')
                  }
                  setSrchShipperName('')
                } else {
                  if (e.target.value != srchShipperName) {
                    setSrchContractCode('')
                  }
                  setSrchShipperName(e.target.value)
                }
              }}
              options={dataShipper
                ?.filter(
                  (
                    item: any // เห็นแค่ชื่อตัวเอง
                  ) => (userDT?.account_manage?.[0]?.user_type_id == 3 ? item?.id === userDT?.account_manage?.[0]?.group?.id : true)
                )
                .map((item: any) => ({
                  // value: item.id,
                  value: item.id_name,
                  label: item.name
                }))}
            />
          ) : (
            <InputSearch
              id="searchShipper"
              label="Shipper Name"
              // type="select"
              type="select-multi-checkbox"
              value={srchShipperName_}
              onChange={(e: any) => {
                if (e.target.value.length != srchShipperName_.length) {
                  setSrchContractCodeTabDownload([])
                }
                setSrchShipperName_(e.target.value)
              }}
              options={dataShipper
                ?.filter((item: any) => {
                  let isShipper = true
                  let isActive = true
                  if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                    // เห็นแค่ชื่อตัวเอง
                    isShipper = item?.id === userDT?.account_manage?.[0]?.group?.id
                  }

                  if (srchGasDay) {
                    const gasDayjs = toDayjs(srchGasDay)
                    if (item.start_date) {
                      isActive = isActive && gasDayjs.isSameOrAfter(toDayjs(item.start_date))
                    }

                    if (item.end_date) {
                      isActive = isActive && gasDayjs.isBefore(toDayjs(item.end_date))
                    }
                  }

                  // if (srchGasDayTabDownlaod) {
                  //     const gasDayjs = toDayjs(srchGasDayTabDownlaod)
                  //     if (item.start_date) {
                  //         isActive = isActive && gasDayjs.isSameOrAfter(toDayjs(item.start_date))
                  //     }

                  //     if (item.end_date) {
                  //         isActive = isActive && gasDayjs.isBefore(toDayjs(item.end_date))
                  //     }
                  // }

                  return isShipper && isActive
                })
                .map((item: any) => ({
                  value: item.id_name,
                  label: item.name
                }))}
            />
          )}

          {/* {
                        tabIndex == 0 && <InputSearch
                            id="searchNomPoint"
                            label="Nomination Point"
                            type="select-multi-checkbox"
                            value={sNomPointId}
                            onChange={(e) => setSNomPointId(e.target.value)}
                            options={nominationPointData?.data
                                ?.map((item: any) => ({
                                    value: item?.id?.toString(),
                                    label: item.nomination_point,
                                }))
                            }
                        />
                    } */}

          {/* {tabIndex == 0 && ( // loadVersion true load
            <InputSearch
              id="searchVersion"
              label="Version"
              type="select"
              sortOptionBy="none"
              value={srchVersion || ''}
              onChange={(e) => setSrchVersion(e.target.value)}
              options={
                dataVersion?.length > 0
                  ? dataVersion?.map((item: any) => ({
                      value: item?.execute_timestamp,
                      label: toDayjs(item?.execute_timestamp * 1000).format('DD/MM/YYYY HH:mm')
                    }))
                  : []
              }
            />
          )} */}
          {tabIndex == 0 && (
            <div className="relative">
              <InputSearch
                id="searchVersion"
                label="Version"
                type="select"
                sortOptionBy="none"
                value={srchVersion || ''}
                onChange={(e) => setSrchVersion(e.target.value)}
                isDisabled={loadVersion}
                placeholder={loadVersion ? 'Loading...' : 'Select Version'}
                options={
                  dataVersion?.map((item: any) => ({
                    value: item?.execute_timestamp,
                    label: toDayjs(item?.execute_timestamp * 1000).format('DD/MM/YYYY HH:mm')
                  })) || []
                }
              />

              {loadVersion && (
                <div className="absolute right-3 top-[37px] z-20 pointer-events-none">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-[#1473A1] rounded-full animate-spin" />
                </div>
              )}
            </div>
          )}

          {tabIndex == 0 ? ( // tab report
            <InputSearch
              id="searchContractCode"
              label="Contract Code"
              type="select"
              // type="select-multi-checkbox"
              value={srchContractCode}
              onChange={(e) => setSrchContractCode(e.target.value)}
              // options={dataContract?.map((item: any) => ({
              //     value: item?.contract_code,
              //     label: item?.contract_code
              // }))}
              options={dataContractFiltered?.map((item: any) => ({
                value: item?.contract_code,
                label: item?.contract_code
              }))}
            />
          ) : (
            <InputSearch
              id="searchContractCode"
              label="Contract Code"
              type="select-multi-checkbox"
              value={srchContractCodeTabDownload}
              onChange={(e) => setSrchContractCodeTabDownload(e.target.value)}
              options={downloadContractOptions}
            />
          )}

          <BtnSearch handleFieldSearch={handleFieldSearch} />
          <BtnReset handleReset={handleReset} />
        </aside>

        <aside className="mt-auto ml-1 w-full sm:w-auto ">
          <div className="flex flex-wrap gap-2 justify-end">
            <BtnGeneral
              textRender={'Approve'}
              iconNoRender={true}
              bgcolor={'#C8FFD7'}
              generalFunc={() => openApproveModal('x', 'x')}
              // disable={urlForApprove == '' ? true : false}
              disable={disableApprove} // ปรับเหลือแค่เช็ค Gas Month, Shipper Name
              can_create={userPermission ? userPermission?.f_approved : false}
              // can_create={true}
            />
          </div>
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
        {['Report', 'Download']?.map((label, index) => (
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

      <div className="border-[#DFE4EA] border-[1px] p-2 rounded-tl-none rounded-tr-lg shadow-sm">
        <div>
          <div className=" text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
            <div onClick={handleTogglePopover}>
              <Tune className="cursor-pointer rounded-lg" style={{fontSize: '18px', color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)'}} />
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              <SearchInput onSearch={handleSearch} />
              {tabIndex == 0 && (
                <BtnExport
                  textRender={'Export'}
                  data={filteredDataTable}
                  path="allocation/allocation-monthly-report"
                  can_export={userPermission ? userPermission?.f_export : false}
                  columnVisibility={columnVisibility}
                  initialColumns={initialColumns}
                  disable={isFilter ? false : true}
                  specificMenu={'allocation-monthly-report'}
                  specificData={{
                    start_date: toDayjs(srchGasDay).startOf('month').format('YYYY-MM-DD'),
                    end_date: toDayjs(srchGasDay).endOf('month').format('YYYY-MM-DD'),
                    skip: 100,
                    limit: 100,
                    shipperId: srchShipperName,
                    month: toDayjs(srchGasDay).format('MM'),
                    year: toDayjs(srchGasDay).format('YYYY'),
                    version: srchVersion,
                    contractCode: srchContractCode
                  }}
                />
              )}

              {tabIndex == 1 && (
                <BtnExport
                  textRender={'Export'}
                  data={dataTabDownload}
                  path="allocation/allocation-monthly-report-download"
                  can_export={userPermission ? userPermission?.f_export : false}
                  columnVisibility={columnVisibility}
                  initialColumns={initialColumnsDownload}
                  specificMenu={'allocation-monthly-report-download'}
                  disable={dataTabDownload?.length > 0 ? false : true}
                  specificData={{
                    idAr: dataTabDownload?.flatMap((item: any) => item?.id)
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {tabIndex == 0 ? (
          <TableReport
            tableData={paginatedData}
            // tableData={data_alloc_monthly_report_2}
            isLoading={isLoading}
            columnVisibility={columnVisibility}
            userPermission={userPermission}
            areaMaster={areaMaster}
          />
        ) : (
          <TableDownload
            openViewForm={openViewForm}
            // tableData={dataTabDownload}
            // tableData={dataTabDownload ? paginatedDataDownload : []}
            tableData={paginatedDataDownload ? paginatedDataDownload : []}
            setIsLoading={setIsLoading}
            setModalErrorMsg={setModalErrorMsg}
            setModalErrorOpen={setModalErrorOpen}
            isLoading={isLoading}
            columnVisibility={columnVisibility}
            userPermission={userPermission}
          />
        )}
      </div>

      <PaginationComponent
        // totalItems={tabIndex == 0 ? filteredDataTable?.length > 0 ? filteredDataTable[0]?.data?.length : [] : dataTabDownload?.length}
        totalItems={tabIndex == 0 ? (filteredDataTable?.areaShipperData?.length > 0 ? filteredDataTable?.areaShipperData?.length : []) : dataTabDownload?.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      <ModalComponent open={isModalSuccessOpen} handleClose={handleCloseModal} title="Approved" description="Your report has been approved." />

      <ModalComponent
        open={isModalErrorOpen}
        handleClose={() => {
          setModalErrorOpen(false)
          if (resetForm) resetForm()
        }}
        title="Failed"
        description={
          modalErrorMsg?.split('<br/>')?.length > 1 ? (
            <ul className="text-start list-disc">
              {modalErrorMsg.split('<br/>').map((item) => {
                return <li>{item}</li>
              })}
            </ul>
          ) : (
            <div className="text-center">{`${modalErrorMsg}`}</div>
          )
        }
        stat="error"
      />

      <ColumnVisibilityPopover open={open} anchorEl={anchorEl} setAnchorEl={setAnchorEl} columnVisibility={columnVisibility} handleColumnToggle={handleColumnToggle} initialColumns={tabIndex == 0 ? initialColumns : initialColumnsDownload} />
    </div>
  )
}

export default ClientPage
