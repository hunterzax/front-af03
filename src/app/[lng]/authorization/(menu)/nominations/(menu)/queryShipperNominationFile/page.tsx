'use client'
import {useEffect, useMemo, useRef, useState} from 'react'
import {adjustEndDateForTab, cutUploadFileName, filterByDateRange, findRoleConfigByMenuName, formatDateNoTime, generateUserPermission, getCurrentWeekSundayYyyyMmDd, getDateRangeForApi, iconButtonClass, toDayjs} from '@/utils/generalFormatter'
import {InputSearch} from '@/components/other/SearchForm'
import {getService, postService} from '@/utils/postService'
import BtnExport from '@/components/other/btnExport'
import {useFetchMasters} from '@/hook/fetchMaster'
import BtnSearch from '@/components/other/btnSearch'
import BtnReset from '@/components/other/btnReset'
import PaginationComponent from '@/components/other/globalPagination'
import ColumnVisibilityPopover from '@/components/other/popOverShowHideCol'
import {useAppDispatch} from '@/utils/store/store'
import ModalFiles from './form/modalFiles'
import getCookieValue from '@/utils/getCookieValue'
import useRestrictedPage from '@/utils/checkRestrictedPage'
import {fetchNominationType} from '@/utils/store/slices/nominationTypeSlice'
import ModalComment from './form/modalComment'
import getUserValue from '@/utils/getuserValue'
import ModalComponent from '@/components/other/ResponseModal'
import {decryptData} from '@/utils/encryptionData'
import TableNomQueryShipperNomFile from './form/table'
import {Tab, Tabs} from '@mui/material'
import DatePickaSearch from '@/components/library/dateRang/dateSearch'
import {ColumnDef, VisibilityState} from '@tanstack/react-table'
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined'
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded'
import AppTable, {myCustomSortingByDateFn} from '@/components/table/AppTable'
import {useSearchParams} from 'next/navigation'
import OffsetTable from '@/components/table/OffsetTable'
import dayjs from 'dayjs'

interface ClientProps {
  params: {
    lng: string
  }
}

const ClientPage: React.FC<ClientProps> = (props) => {
  // ############### Check Authen ###############
  const userDT: any = getUserValue()
  const token = getCookieValue('v4r2d9z5m3h0c1p0x7l')
  useRestrictedPage(token)

  // ############### PERMISSION ###############
  const [userPermission, setUserPermission] = useState<any>()
  let user_permission: any = localStorage?.getItem('k3a9r2b6m7t0x5w1s8j')
  // let user_permission: any = getCookieValue("k3a9r2b6m7t0x5w1s8j");
  user_permission = user_permission ? decryptData(user_permission) : null

  const searchParams = useSearchParams()
  const tab_selected_from_somewhere_else = searchParams.get('tabselected')
  const status_from_somewhere_else = searchParams.get('status')

  const hasStatusFromUrl = Boolean(status_from_somewhere_else)

  const [useParams, setuseParams] = useState<boolean>(false)

  // ############### REDUX DATA ###############
  const {nominationStatMaster} = useFetchMasters()
  const urlStatusId = useMemo(() => {
    if (!status_from_somewhere_else) return null

    const foundStatus = nominationStatMaster?.data?.find((item: any) => item?.name?.trim().toLowerCase() === status_from_somewhere_else.trim().toLowerCase())

    return foundStatus?.id ? foundStatus.id.toString() : null
  }, [nominationStatMaster?.data, status_from_somewhere_else])
  const [forceRefetch, setForceRefetch] = useState(true)
  const dispatch = useAppDispatch()

  // ############### FIELD SEARCH ###############
  const [filteredDataTable, setFilteredDataTable] = useState<any>([])
  const [key, setKey] = useState(0)
  const [srchShipper, setSrchShipper] = useState<any>([])
  const [srchContractCode, setSrchContractCode] = useState<any>([])
  const [srchStatus, setSrchStatus] = useState<any>([])
  // const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
  // const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);
  const [srchStartDate, setSrchStartDate] = useState<Date | null>(hasStatusFromUrl ? null : new Date())

  const [srchEndDate, setSrchEndDate] = useState<Date | null>(hasStatusFromUrl ? null : new Date())

  // ############### DATA TABLE ###############
  const didMount = useRef(false)
  const [tabIndex, setTabIndex] = useState<any>(tab_selected_from_somewhere_else ? parseInt(tab_selected_from_somewhere_else) : 0) // 0=daily, 1=weekly
  const [dataTable, setData] = useState<any>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [resetForm, setResetForm] = useState<() => void | null>()

  const [dataContractOriginal, setDataContractOriginal] = useState<any>([])
  const [dataContract, setDataContract] = useState<any>([])

  const [dataShipper, setDataShipper] = useState<any>([])

  // ############# NEW MODAL CREATE/EDIT/VIEW  #############
  const [isModalSuccessOpen, setModalSuccessOpen] = useState(false)
  const [modalModalSuccessMsg, setModalSuccessMsg] = useState('')
  const handleCloseModal = () => setModalSuccessOpen(false)
  const [modalErrorMsg, setModalErrorMsg] = useState('')
  const [isModalErrorOpen, setModalErrorOpen] = useState(false)

  // ############### MODAL ALL FILES ###############
  const [mdFileView, setMdFileView] = useState<any>(false)
  const [dataFile, setDataFile] = useState<any>([])

  // ############### REASON VIEW ###############
  const [mdReasonView, setMdReasonView] = useState(false)
  const [dataReason, setDataReason] = useState<any>([])
  const [dataReasonRow, setDataReasonRow] = useState<any>([])

  // ############### COLUMN SHOW/HIDE ###############
  const initialColumns: any = [
    {key: 'status', label: 'Status', visible: true},
    {key: 'gas_day', label: tabIndex == 0 ? 'Gas Day' : 'Gas Week', visible: true},
    {key: 'shipper_name', label: 'Shipper Name', visible: true},
    {key: 'contract_code', label: 'Contract Code', visible: true},
    {key: 'file_name', label: 'File Name', visible: true},
    {key: 'submission_comment', label: 'Submission Comment', visible: true},
    {key: 'file', label: 'File', visible: true}
    // { key: 'created_by', label: 'Created by', visible: true },
    // { key: 'updated_by', label: 'Updated by', visible: true },
    // { key: 'action', label: 'Action', visible: true }
  ]

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const [columnVisibility, setColumnVisibility] = useState<any>(Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible])))

  // ############### PAGINATION ###############
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [dataTableTotal, setDataTotal] = useState<any>()

  const [globalFilter, setGlobalFilter] = useState('')

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setItemsPerPage(itemsPerPage)
    setCurrentPage(1)
  }

  const getPermission = () => {
    try {
      user_permission = user_permission ? JSON.parse(user_permission) : null // Convert JSON string to object

      const permission = findRoleConfigByMenuName(`Query Shipper' Nomination File`, userDT)
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

  useEffect(() => {
    if (forceRefetch || !nominationStatMaster?.data) {
      dispatch(fetchNominationType())
    }

    // Reset forceRefetch after fetching
    if (forceRefetch) {
      setForceRefetch(false) // Reset the flag after triggering the fetch
    }
    getPermission()
  }, [dispatch, forceRefetch, nominationStatMaster]) // Watch for forceRefetch changes

  const handleFieldSearch = () => {
    setIsLoading(false)
    fetchData(tabIndex, currentPage, itemsPerPage)
  }

  const handleReset = async () => {
    setIsLoading(false)

    const resetShipper = userDT?.account_manage?.[0]?.user_type_id == 3 ? [userDT?.account_manage?.[0]?.group?.id] : []

    const today = new Date()

    setSrchShipper(resetShipper)
    setSrchStatus([])
    setSrchContractCode([])
    setSrchStartDate(today)
    setSrchEndDate(today)
    setCurrentPage(1)

    setKey((prevKey) => prevKey + 1)

    fetchData(tabIndex, 1, itemsPerPage, 'reset', {
      statusIds: [],
      shipperIds: resetShipper,
      contractCodes: [],
      startDate: today,
      endDate: today
    })
  }

  const handleResetFilter = async (tab: number) => {
    const resetShipper = userDT?.account_manage?.[0]?.user_type_id == 3 ? [userDT?.account_manage?.[0]?.group?.id] : []

    let resetDate: Date

    if (tab === 1) {
      const currentWeekDate = getCurrentWeekSundayYyyyMmDd()
      resetDate = dayjs(currentWeekDate, 'YYYY-MM-DD').toDate()
    } else {
      resetDate = new Date()
    }

    setSrchShipper(resetShipper)
    setSrchStatus([])
    setSrchContractCode([])
    setSrchStartDate(resetDate)
    setSrchEndDate(resetDate)
    setCurrentPage(1)

    setKey((prevKey) => prevKey + 1)

    fetchData(tab, 1, itemsPerPage, 'reset', {
      statusIds: [],
      shipperIds: resetShipper,
      contractCodes: [],
      startDate: resetDate,
      endDate: resetDate
    })
  }

  const fetchMaster = async () => {
    try {
      const res_shipper_approve = await getService(`/master/upload-template-for-shipper/shipper-contract-approved`)
      setDataShipper(res_shipper_approve)
    } catch (error) {}
  }

  // useEffect(() => {
  //     if (globalFilter?.length == 0) {
  //         fetchData(tabIndex, currentPage, itemsPerPage);
  //     }
  // }, [globalFilter])

  const globalFilterMountedRef = useRef(false)

  useEffect(() => {
    if (!globalFilterMountedRef.current) {
      globalFilterMountedRef.current = true
      return
    }

    if (globalFilter.length === 0) {
      setCurrentPage(1)
      fetchData(tabIndex, 1, itemsPerPage)
    }
  }, [globalFilter])

  // const fetchData = async (tab?: any, offset?: any, limit?: any, reset?: 'reset') => {
  type FetchDataOptions = {
    statusIds?: string[]
    shipperIds?: any[]
    contractCodes?: string[]
    startDate?: Date | null
    endDate?: Date | null
  }

  const fetchData = async (tab: number = tabIndex, offset: number = currentPage, limit: number = itemsPerPage, reset?: 'reset', options?: FetchDataOptions) => {
    setIsLoading(false)

    try {
      const res_file_name: any = await getService(`/master/query-shipper-nomination-file/get-file-name`)

      // ถ้า user เป็น shipper
      // https://app.clickup.com/t/86ert2k28 ตามที่คุยกัน หากเป็น shipper user ถ้ามี filter ชื่อ shipper ให้ค้างชื่อ shipper ตัวเองไว้เลย ไม่ต้องขึ้นเป็น dropdown ให้เลือก - ปรับทั้ง system
      if (userDT?.account_manage?.[0]?.user_type_id == 3) {
        setSrchShipper([userDT?.account_manage?.[0]?.group?.id])
      }

      // const transdate = (date: any) => {
      //     return dayjs(date).format('YYYY-MM-DD')
      // }
      const transdate = (date: Date | string | null | undefined): string | null => {
        if (!date) return null

        const parsedDate = dayjs(date)

        return parsedDate.isValid() ? parsedDate.format('YYYY-MM-DD') : null
      }

      const effectiveStartDate = options?.startDate !== undefined ? options.startDate : srchStartDate

      const effectiveEndDate = options?.endDate !== undefined ? options.endDate : srchEndDate

      const newEndDate = !effectiveStartDate && !effectiveEndDate ? null : adjustEndDateForTab(tab, effectiveStartDate, effectiveEndDate)

      const currentWeekDate = getCurrentWeekSundayYyyyMmDd()

      const currentWeekDateFormatted = dayjs(currentWeekDate, 'YYYY-MM-DD').toDate()

      let dayfrom: string | null
      let dayto: string | null

      if (reset === 'reset') {
        if (tab === 0) {
          dayfrom = dayjs().format('YYYY-MM-DD')
          dayto = dayjs().format('YYYY-MM-DD')
        } else {
          dayfrom = transdate(currentWeekDateFormatted)

          dayto = transdate(currentWeekDateFormatted)
        }
      } else {
        // dayfrom = transdate(srchStartDate);
        // dayto = transdate(newEndDate);
        dayfrom = transdate(effectiveStartDate)
        dayto = transdate(newEndDate)
      }
      //   const effectiveStatusIds = options?.statusIds !== undefined ? options.statusIds : Array.isArray(srchStatus) ? srchStatus : []
      const effectiveStatusIds = options?.statusIds !== undefined ? options.statusIds : Array.isArray(srchStatus) ? srchStatus : []

      const effectiveShipperIds = options?.shipperIds !== undefined ? options.shipperIds : Array.isArray(srchShipper) ? srchShipper : []

      const effectiveContractCodes = options?.contractCodes !== undefined ? options.contractCodes : Array.isArray(srchContractCode) ? srchContractCode : []

      const newOffset = offset - 1

      //   const body = {
      //     nomination_type_id: tab + 1,
      //     offset: newOffset,
      //     limit: limit,
      //     gas_day_from: dayfrom,
      //     gas_day_to: dayto,
      //     shipper_id_arr: srchShipper,
      //     // contract_id_arr: srchContractCode,
      //     contract_code_arr: srchContractCode,
      //     // status_id_arr: srchStatus?.length > 0 ? srchStatus.map(Number) : [],
      //     status_id_arr: effectiveStatusIds.map(Number),
      //     search: ''
      //   }
      const body = {
        nomination_type_id: tab + 1,
        offset: newOffset,
        limit: limit,
        gas_day_from: dayfrom,
        gas_day_to: dayto,

        shipper_id_arr: effectiveShipperIds,
        contract_code_arr: effectiveContractCodes,
        status_id_arr: effectiveStatusIds.map(Number),

        search: ''
      }

      const res_api: any = await postService(`/master/query-shipper-nomination-file/v2`, body)

      setDataTotal(res_api?.total)
      const response: any = res_api?.data

      // original api
      // const response: any = await getService(`/master/query-shipper-nomination-file`);

      let filtered_daily_weekly: any = response?.filter((item: any) => (tab == 0 ? item?.nomination_type_id == 1 : item?.nomination_type_id == 2))

      // map ชื่อไฟล์เข้า
      const updatedDataDaily = filtered_daily_weekly?.map((item: any) => {
        const find_ = res_file_name?.find((itemx: any) => itemx.id == item.id)
        return {
          ...item,
          k_file_name: find_?.query_shipper_nomination_file_url?.length > 0 ? cutUploadFileName(find_?.query_shipper_nomination_file_url?.[0]?.url) : ''
        }
      })

      // const genFilterURL = (data: any) => {
      //     if (!useParams) {
      //         const status: any = status_from_somewhere_else;
      //         const findStatusMaster: any = nominationStatMaster?.data?.find((item: any) => item?.name == status)?.id;
      //         const resultFilter = data?.filter((item: any) => {
      //             return (
      //                 (findStatusMaster ? item?.query_shipper_nomination_status?.id.toString() == findStatusMaster : true)
      //             );
      //         });
      //         return resultFilter
      //     }
      //     return data
      // }

      // if (status_from_somewhere_else && !useParams) {
      //     const status: any = status_from_somewhere_else;
      //     const findStatusMaster: any = nominationStatMaster?.data?.find((item: any) => item?.name == status)?.id;
      //     // setSrchStatus(findStatusMaster?.toString());
      //     setSrchStatus(
      //         findStatusMaster
      //             ? [findStatusMaster.toString()]
      //             : []
      //     );
      //     setuseParams(true);
      // }

      // if (userDT?.account_manage?.[0]?.user_type_id == 3) { // shipper
      //     let filter_only_shipper_or_not: any = updatedDataDaily?.filter((item: any) => {
      //         return item?.group_id === userDT?.account_manage?.[0]?.group_id
      //     })
      //     let resultShipper: any = status_from_somewhere_else ? genFilterURL(filter_only_shipper_or_not) : filter_only_shipper_or_not;

      //     setData(filter_only_shipper_or_not);
      //     setFilteredDataTable(resultShipper);
      // } else {
      //     let result: any = status_from_somewhere_else ? genFilterURL(updatedDataDaily) : updatedDataDaily;

      //     setData(updatedDataDaily);
      //     setFilteredDataTable(result);
      // }
      if (userDT?.account_manage?.[0]?.user_type_id == 3) {
        const shipperData = updatedDataDaily?.filter((item: any) => item?.group_id === userDT?.account_manage?.[0]?.group_id)

        setData(shipperData)
        setFilteredDataTable(shipperData)
      } else {
        setData(updatedDataDaily)
        setFilteredDataTable(updatedDataDaily)
      }

      // DATA CONTRACT CODE
      const data_contract_code = Array.from(
        new Map(
          // response?.map((item: any) => [item?.contract_code.contract_code, { contract_code: item?.contract_code.contract_code }])
          response?.map((item: any) => {
            if (item?.reserve_balancing_gas_contract) {
              // return [item?.reserve_balancing_gas_contract.id, item?.reserve_balancing_gas_contract?.res_bal_gas_contract]
              return [item?.reserve_balancing_gas_contract?.res_bal_gas_contract, {contract_code: {contract_code: item?.reserve_balancing_gas_contract?.res_bal_gas_contract}}]
            } else {
              return [item?.contract_code.contract_code, {contract_code: item?.contract_code}]
            }
          })
        ).values()
      )

      // setDataContract(data_contract_code);
      setDataContractOriginal(data_contract_code)

      if (data_contract_code?.length == 0) {
        setSrchContractCode([])
      }

      // ตั้งใจใส่ไว้ก่อน data contract code
      // เผื่อมันแตก อย่างน้อยจะได้เห็นข้อมูลในตารางก่อน by kom
      setTimeout(() => {
        setIsLoading(true)
      }, 500)
    } catch (err) {
      // setError(err.message);
    } finally {
      // setLoading(false);
    }
  }

  const fetchOnlyData = async () => {
    const res_file_name: any = await getService(`/master/query-shipper-nomination-file/get-file-name`)
    const response: any = await getService(`/master/query-shipper-nomination-file`)
    let filtered_daily_weekly = response?.filter((item: any) => (tabIndex == 0 ? item?.nomination_type_id == 1 : item?.nomination_type_id == 2))

    // map ชื่อไฟล์เข้า
    const updatedDataDaily = filtered_daily_weekly?.map((item: any) => {
      const find_ = res_file_name?.find((itemx: any) => itemx.id == item.id)
      return {
        ...item,
        k_file_name: find_?.query_shipper_nomination_file_url?.length > 0 ? cutUploadFileName(find_?.query_shipper_nomination_file_url?.[0]?.url) : ''
      }
    })

    const genFilterURL = (data: any) => {
      if (!useParams) {
        const status: any = status_from_somewhere_else
        const findStatusMaster: any = nominationStatMaster?.data?.find((item: any) => item?.name == status)?.id

        const resultFilter = data?.filter((item: any) => {
          return findStatusMaster ? item?.query_shipper_nomination_status?.id.toString() == findStatusMaster : true
        })
        return resultFilter
      }
      return data
    }

    if (userDT?.account_manage?.[0]?.user_type_id == 3) {
      // shipper
      let filter_only_shipper_or_not: any = updatedDataDaily?.filter((item: any) => {
        return item?.group_id === userDT?.account_manage?.[0]?.group_id
      })

      let resultShipper: any = status_from_somewhere_else ? genFilterURL(filter_only_shipper_or_not) : filter_only_shipper_or_not

      setData(filter_only_shipper_or_not)
      setFilteredDataTable(resultShipper)
    } else {
      let result: any = status_from_somewhere_else ? genFilterURL(updatedDataDaily) : updatedDataDaily
      setData(updatedDataDaily)
      setFilteredDataTable(result)
    }

    // setData(filtered_daily_weekly);
    // setFilteredDataTable(filtered_daily_weekly);
    setTimeout(() => {
      setIsLoading(true)
    }, 500)
  }

  // useEffect(() => {
  //     if (!srchStartDate && !srchEndDate) {
  //         // status_from_somewhere_else
  //         setSrchStartDate(new Date())
  //         setSrchEndDate(new Date())
  //     }
  //     fetchMaster();
  //     fetchData(tabIndex, currentPage, itemsPerPage);
  // }, [resetForm]);
  // useEffect(() => {
  //     if (!hasStatusFromUrl && !srchStartDate && !srchEndDate) {
  //         setSrchStartDate(new Date());
  //         setSrchEndDate(new Date());
  //     }

  //     fetchMaster();
  //     fetchData(tabIndex, currentPage, itemsPerPage);
  // }, [resetForm]);
  const initialFetchRef = useRef(false)

  useEffect(() => {
    fetchMaster()
  }, [])

  useEffect(() => {
    if (initialFetchRef.current) return

    // กรณีมี status จาก URL ต้องรอ Status Master ก่อน
    if (hasStatusFromUrl && !nominationStatMaster?.data?.length) {
      return
    }

    initialFetchRef.current = true

    const initialStatusIds = hasStatusFromUrl && urlStatusId ? [urlStatusId] : []

    if (hasStatusFromUrl) {
      setSrchStatus(initialStatusIds)
      setSrchStartDate(null)
      setSrchEndDate(null)

      fetchData(tabIndex, 1, itemsPerPage, undefined, {
        statusIds: initialStatusIds,
        startDate: null,
        endDate: null
      })

      return
    }

    const today = new Date()

    setSrchStartDate(today)
    setSrchEndDate(today)

    fetchData(tabIndex, 1, itemsPerPage, undefined, {
      statusIds: [],
      startDate: today,
      endDate: today
    })
  }, [hasStatusFromUrl, urlStatusId, nominationStatMaster?.data, tabIndex, itemsPerPage])

  //🔥 ไม่ได้ใช้ fetchOnlyData แล้ว 🔥
  // useEffect(() => {
  //     if (!didMount.current) {
  //         didMount.current = true; // ข้ามรอบ mount แรก
  //         return;
  //     }
  //     setIsLoading(false);
  //     fetchOnlyData(); // เรียกเมื่อ tabIndex เปลี่ยนหลังจากครั้งแรก
  // }, [tabIndex]);

  const openAllFileModal = async (id?: any, data?: any) => {
    const data_file: any = await getService(`/master/query-shipper-nomination-file/query_shipper_nomination_file_url/${id}`)
    const filtered = dataTable?.find((item: any) => item.id === id)
    const map_data = {
      ...filtered,
      query_shipper_nomination_file_url: data_file
    }
    setDataFile(map_data)
    setMdFileView(true)
  }

  // #region openReasonModal
  const openReasonModal = async (id: any, data: any, row: any) => {
    const data_submission: any = await getService(`/master/query-shipper-nomination-file/submission_comment_query_shipper_nomination_file/${id}`)
    setDataReason(data_submission)
    setDataReasonRow(row)
    setMdReasonView(true)
  }

  const handleColumnToggle = (columnKey: string | VisibilityState) => {
    if (typeof columnKey === 'string') {
      // Handle string case - single column toggle
      setColumnVisibility((prev: any) => ({
        ...prev,
        [columnKey]: !prev[columnKey]
      }))
    } else if (typeof columnKey === 'object' && columnKey !== null) {
      // Handle VisibilityState object case - bulk column visibility update
      setColumnVisibility((prev: any) => ({
        ...prev,
        ...columnKey
      }))
    }
  }

  //   const handleChange = (event: any, newValue: any) => {
  //     setTabIndex(newValue)
  //     handleResetFilter(newValue)

  //     if (newValue == 1) {
  //       const current_week_date = getCurrentWeekSundayYyyyMmDd()
  //       const current_week_date_formatted = dayjs(current_week_date, 'YYYY-MM-DD').toDate()
  //       setSrchEndDate(current_week_date_formatted)
  //       setSrchStartDate(current_week_date_formatted)
  //     }
  //   }
  const handleChange = (event: any, newValue: number) => {
    setTabIndex(newValue)
    handleResetFilter(newValue)
  }

  const [dataExport, setDataExport] = useState<any>([])

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'status',
        header: 'Status',
        enableSorting: true,
        align: 'center',
        accessorFn: (row: any) => row?.query_shipper_nomination_status?.name || '',
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div className="flex justify-center items-center">
              <div className="flex min-w-[180px] max-w-[250px] w-auto text-center justify-center rounded-full p-1 text-[#464255]" style={{backgroundColor: String(row?.query_shipper_nomination_status?.color)}}>
                {row?.query_shipper_nomination_status?.name}
              </div>
            </div>
          )
        }
      },
      {
        accessorKey: 'gas_day',
        header: tabIndex == 0 ? 'Gas Day' : 'Gas Week',
        enableSorting: true,
        accessorFn: (row: any) => formatDateNoTime(row?.gas_day) || '',
        sortingFn: myCustomSortingByDateFn,
        // sortingFn: 'datetime', // recommended for date columns
        // sortUndefined: -1,
        cell: (info) => {
          const row: any = info?.row?.original
          return <div>{row?.gas_day ? formatDateNoTime(row?.gas_day) : ''}</div>
        }
      },
      {
        accessorKey: 'shipper_name',
        header: 'Shipper Name',
        enableSorting: true,
        accessorFn: (row: any) => row?.group?.name || '',
        cell: (info) => {
          const row: any = info?.row?.original
          return <div>{row?.group ? row?.group?.name : ''}</div>
        }
      },
      {
        accessorKey: 'contract_code',
        header: 'Contract Code',
        enableSorting: true,
        width: 200,
        accessorFn: (row: any) => row?.contract_code?.contract_code || '',
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div>{row?.reserve_balancing_gas_contract ? row?.reserve_balancing_gas_contract?.res_bal_gas_contract : row?.contract_code?.contract_code || ''}</div>
            // <div>{row?.contract_code ? row?.contract_code?.contract_code : ''}</div>
          )
        }
      },
      {
        accessorKey: 'file_name',
        header: 'File Name',
        enableSorting: true,
        accessorFn: (row: any) => row?.k_file_name || '',
        width: 500,
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div className="flex items-center">
              {/* <span>{row?.query_shipper_nomination_file_url?.length > 0 && row?.k_file_name}</span> */}
              <span>{row?.k_file_name}</span>
            </div>
          )
        }
      },
      {
        accessorKey: 'submission_comment',
        header: 'Submission Comment',
        enableSorting: false,
        align: 'center',
        accessorFn: (row: any) => '',
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div className="inline-flex items-center justify-center relative">
              {/* <button
                                type="button"
                                className={iconButtonClass}
                                onClick={() => openReasonModal(row?.id, row?.submission_comment_query_shipper_nomination_file, row)}
                                disabled={userPermission?.f_view == true ? false : true || row?.submission_comment_query_shipper_nomination_file?.length <= 0}
                            >
                                <ChatBubbleOutlineOutlinedIcon
                                    fontSize="inherit"
                                    className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                    sx={{ color: 'currentColor', fontSize: 18 }}
                                />
                            </button> */}

              <button
                type="button"
                className={iconButtonClass}
                onClick={() => openReasonModal(row?.id, row?.submission_comment_query_shipper_nomination_file, row)}
                // disabled={userPermission?.f_view == true ? false : true || row?.submission_comment_query_shipper_nomination_file?.length <= 0}
                disabled={userPermission?.f_view == true ? false : true || row?._count?.submission_comment_query_shipper_nomination_file <= 0}
              >
                <ChatBubbleOutlineOutlinedIcon fontSize="inherit" className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]" sx={{color: 'currentColor', fontSize: 18}} />
              </button>

              <span
                // className={`px-2 text-[#429D3A] ${row?.submission_comment_query_shipper_nomination_file?.length > 0 ? 'text-[#ED1B24]' : ''}`}
                className={`px-2 w-2 text-[#429D3A] ${row?._count?.submission_comment_query_shipper_nomination_file > 0 ? 'text-[#ED1B24]' : ''}`}
              >
                {/* {row?.submission_comment_query_shipper_nomination_file?.length} */}
                {row?._count?.submission_comment_query_shipper_nomination_file}
              </span>
            </div>
          )
        }
      },
      {
        accessorKey: 'file',
        header: 'File',
        enableSorting: false,
        accessorFn: (row: any) => '',
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div className="inline-flex items-center justify-center relative">
              {/* <button
                                type="button"
                                className="flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                                onClick={() => openAllFileModal(row?.id)}
                                disabled={userPermission?.f_view == true ? false : true || row?.query_shipper_nomination_file_url.length <= 0}
                            >
                                <AttachFileRoundedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                            </button> */}

              <button
                type="button"
                aria-label="Open files"
                onClick={() => openAllFileModal(row?.id)}
                // disabled={!userPermission?.f_view || row?.query_shipper_nomination_file_url?.length <= 0}
                disabled={!userPermission?.f_view || row?._count?.query_shipper_nomination_file_url <= 0}
                className={iconButtonClass}
              >
                <AttachFileRoundedIcon fontSize="inherit" className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]" sx={{color: 'currentColor', fontSize: 18}} />
              </button>
              <span className="px-2 text-[#464255]">
                {/* {row?.query_shipper_nomination_file_url?.length} */}
                {row?._count?.query_shipper_nomination_file_url}
              </span>
            </div>
          )
        }
      }
    ],
    [dataTable, userPermission, user_permission]
  )

  // useEffect(() => {
  //     fetchData(tabIndex, currentPage, itemsPerPage);
  //     setIsLoading(false)
  // }, [currentPage, itemsPerPage]);
  const paginationMountedRef = useRef(false)

  useEffect(() => {
    // ข้ามรอบแรก เพราะ Initial Fetch เป็นผู้โหลดข้อมูลอยู่แล้ว
    if (!paginationMountedRef.current) {
      paginationMountedRef.current = true
      return
    }

    setIsLoading(false)

    fetchData(tabIndex, currentPage, itemsPerPage)
  }, [currentPage, itemsPerPage])

  useEffect(() => {
    if (userDT?.account_manage?.[0]?.user_type_id == 3) {
      setSrchShipper([userDT?.account_manage?.[0]?.group?.id])
    }
  }, [tabIndex])

  return (
    <div className=" space-y-2">
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
        {['Daily', 'Weekly']?.map((label, index) => (
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

      <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl rounded-tl-none flex flex-col sm:flex-row gap-2">
        <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
          <DatePickaSearch
            key={'start' + key}
            label={tabIndex == 0 ? 'Gas Day From' : 'Gas Week From'}
            placeHolder={tabIndex == 0 ? 'Select Gas Day' : 'Select Gas Week'}
            modeSearch={tabIndex == 0 ? 'all_day' : 'sunday'}
            allowClear
            onChange={(e: any) => setSrchStartDate(e ? e : null)}
            defaultValue={srchStartDate}
          />

          {
            tabIndex == 0 ? (
              <DatePickaSearch key={'gas_day_to' + key} label="Gas Day To" placeHolder="Select Gas Day To" allowClear onChange={(e: any) => setSrchEndDate(e ? e : null)} customWidth={200} defaultValue={srchEndDate} />
            ) : (
              <DatePickaSearch
                key={`end-${key}-${srchStartDate ? 'selected' : 'empty'}`}
                label="Gas Week To"
                placeHolder="Select Gas Week"
                modeSearch="sunday"
                isGasWeek={Boolean(srchStartDate)}
                allowClear
                onChange={(e: any) => {
                  setSrchEndDate(e ?? null)
                }}
                defaultValue={srchEndDate}
              />
            )
            // : <DatePickaSearch
            //     key={"end" + key}
            //     label={"Gas Week To"}
            //     placeHolder={"Select Gas Week"}
            //     modeSearch={'sunday'}
            //     isGasWeek={true}
            //     allowClear
            //     onChange={(e: any) => setSrchEndDate(e ? e : null)}
            //     defaultValue={srchEndDate}
            // />
          }

          {/* let filter_string = `${userDT?.account_manage?.[0]?.user_type_id == 1 || userDT?.account_manage?.[0]?.user_type_id == 2 ? idsArray : userDT?.account_manage?.[0]?.group_id}` // ถ้าเป็น TSO เอา id shipper ทั้งหมดมาแสดง ถ้าเป็น shipper เอาแค่ของตัวเอง */}
          <InputSearch
            id="searchShipper"
            label="Shipper Name"
            type="select-multi-checkbox"
            value={srchShipper}
            // onChange={(e) => setSrchShipper(e.target.value)}
            isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
            onChange={(e) => {
              setSrchShipper(e.target.value)

              // เอาไว้เช็ค กรณีที่เลือก contract code ไว้ แล้วเปลี่ยน shipper ถ้า shipper ตัวนั้นไม่มีข้อมูลที่ตรงจะล้าง srchContractCode
              const checked = dataContractOriginal?.filter((item: any) => e.target.value.includes(item?.contract_code?.group_id))
              if (checked?.length == 0 && srchContractCode?.length > 0) setSrchContractCode([])
            }}
            options={dataShipper
              ?.filter((item: any) => (userDT?.account_manage?.[0]?.user_type_id == 3 ? item?.id === userDT?.account_manage?.[0]?.group?.id : true))
              .map((item: any) => ({
                value: item.id,
                label: item.name
              }))}
          />

          <InputSearch
            id="searchContractCode"
            label="Contract Code"
            type="select-multi-checkbox"
            value={srchContractCode}
            onChange={(e) => setSrchContractCode(e.target.value)}
            options={dataContractOriginal
              ?.filter((item: any) => (srchShipper?.length > 0 ? srchShipper.includes(item?.contract_code?.group_id) : true))
              .map((item: any) => ({
                value: item?.contract_code?.contract_code,
                label: item?.contract_code?.contract_code
              }))}
          />

          <InputSearch
            id="searchStatus"
            label="Status"
            type="select-multi-checkbox"
            value={srchStatus}
            onChange={(e) => setSrchStatus(e.target.value)}
            options={nominationStatMaster?.data?.map((item: any) => ({
              value: item?.id?.toString(),
              label: item.name
            }))}
          />

          <BtnSearch handleFieldSearch={handleFieldSearch} />
          <BtnReset handleReset={handleReset} />
        </aside>
        <aside className="mt-auto ml-1 w-full sm:w-auto"></aside>
      </div>

      {/* ================== OLD TABLE ==================*/}
      {/* <AppTable
                data={filteredDataTable}
                columns={columns}
                isLoading={isLoading}
                exportBtn={
                    <BtnExport
                        textRender={"Export"}
                        data={dataExport}
                        path="nomination/query-shipper-nomination-file"
                        can_export={userPermission ? userPermission?.f_export : false} columnVisibility={columnVisibility} initialColumns={initialColumns}
                    />
                }
                initialColumns={Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))}
                onColumnVisibilityChange={(columnKey: any) => handleColumnToggle(columnKey)}
                onFilteredDataChange={(filteredData: any) => {
                    const newData = filteredData || [];
                    // Check if the filtered data is different from current dataExport
                    if (JSON.stringify(dataExport) !== JSON.stringify(newData)) {
                        setDataExport(newData);
                    }
                }}
            /> */}

      {/* ================== NEW TABLE ==================*/}
      <OffsetTable
        data={filteredDataTable}
        columns={columns}
        isLoading={isLoading}
        exportBtn={<BtnExport textRender={'Export'} data={dataExport} path="nomination/query-shipper-nomination-file" can_export={userPermission ? userPermission?.f_export : false} columnVisibility={columnVisibility} initialColumns={initialColumns} />}
        initialColumns={Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))}
        onColumnVisibilityChange={(columnKey: any) => handleColumnToggle(columnKey)}
        onFilteredDataChange={(filteredData: any) => {
          const newData = filteredData || []
          // Check if the filtered data is different from current dataExport
          if (JSON.stringify(dataExport) !== JSON.stringify(newData)) {
            setDataExport(newData)
          }
        }}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        totalItems={dataTableTotal}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
      />

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

      <ModalComment
        data={dataReason}
        dataRow={dataReasonRow}
        open={mdReasonView}
        onClose={() => {
          setMdReasonView(false)
        }}
        tabSelected={tabIndex}
      />

      <ModalFiles
        data={dataFile}
        // dataGroup={dataGroup}
        // setModalMsg={setModalMsg}
        setModalSuccessOpen={setModalSuccessOpen}
        // setModalSuccessMsg={setModalSuccessMsg}
        open={mdFileView}
        onClose={() => {
          setMdFileView(false)
        }}
      />

      <ColumnVisibilityPopover open={open} anchorEl={anchorEl} setAnchorEl={setAnchorEl} columnVisibility={columnVisibility} handleColumnToggle={handleColumnToggle} initialColumns={initialColumns} />
    </div>
  )
}

export default ClientPage
