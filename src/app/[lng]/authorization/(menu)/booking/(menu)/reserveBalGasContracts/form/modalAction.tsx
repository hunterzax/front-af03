import React, {useEffect, useState} from 'react'
import {useForm, SubmitHandler} from 'react-hook-form'
import {Dialog, DialogBackdrop, DialogPanel} from '@headlessui/react'
import {formatDateNoTime, formatFormDate, formatNumber, formatWatchFormDate} from '@/utils/generalFormatter'
import {NumericFormat} from 'react-number-format'
import {MenuItem, Select, TextField, Typography} from '@mui/material'
import {Button} from '@material-tailwind/react'
import {uploadFileService} from '@/utils/postService'
import DatePickaForm from '@/components/library/dateRang/dateSelectForm'
import dayjs from 'dayjs'
import TuneIcon from '@mui/icons-material/Tune'
import {table_col_arrow_sort_style, table_row_style, table_sort_header_style} from '@/utils/styles'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ColumnVisibilityPopover from '@/components/other/popOverShowHideCol'
import {handleSort} from '@/utils/sortTable'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import Spinloading from '@/components/other/spinLoading'
import SelectFormProps from '@/components/other/selectProps'
import {CustomTooltip} from '@/components/other/customToolTip'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import ModalConfirmSave from '@/components/other/modalConfirmSave'

type FormExampleProps = {
  mode?: 'create' | 'edit' | 'view' | 'release'
  data?: any
  latestStartDate?: any
  dataInfo?: any
  dataShipper?: any
  zoneMaster?: any
  dataAreaMaster?: any
  dataNomPointMaster?: any
  entryExitMaster?: any
  setMdConfirmOpen?: any
  open: boolean
  onClose: () => void
  onSubmit: SubmitHandler<any>
  setResetForm: (reset: () => void) => void
  isModalLoading?: any
  setisModalLoading?: any
}

type DetailEditMode = 'all' | 'end_only' | null

const ModalAction: React.FC<FormExampleProps> = ({mode = 'create', data = {}, latestStartDate, dataInfo, dataShipper, zoneMaster, dataAreaMaster, dataNomPointMaster, entryExitMaster, setMdConfirmOpen, open, onClose, onSubmit, setResetForm, isModalLoading, setisModalLoading}) => {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: {errors},
    watch,
    setError,
        clearErrors();
  } = useForm<any>({
    defaultValues: data
  })

  const isReadOnly = mode === 'view'

  const labelClass = 'block mb-2 text-sm font-light'

  const inputClass = 'text-[16px] block md:w-full p-2 ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]'

  const selectboxClass = 'flex w-full h-[44px] p-1 ps-1 pe-2 !rounded-lg text-gray-900 text-sm block outline-none'

  const [Mode, setMode] = useState<any>()
  const [areaMaster, setAreaMaster] = useState<any>(dataAreaMaster)
  const [nomPointMaster, setNomPointMaster] = useState<any>([])
  const [key, setKey] = useState(0)

  const startDate = new Date()
  const formattedStartDate = formatWatchFormDate(startDate)

  const [fileName, setFileName] = useState('Maximum File 10 MB')
  const [fileUpload, setFileUpload] = useState<any>()
  const [fileUrl, setFileUrl] = useState<any>()

  const [dataInTable, setDataInTable] = useState<any[]>([])
  const [dataOriginalCommentLength, setDataOriginalCommentLength] = useState<any>([])

  const [sortState, setSortState] = useState<any>({
    column: null,
    direction: null
  })

  const [sortedData, setSortedData] = useState<any[]>(dataInTable)

  /*
   * เก็บ key ของรายการที่กำลังแก้ไข
   */
  const [editingRowKey, setEditingRowKey] = useState<string | null>(null)

  /*
   * all       = แก้ไขได้ทุกช่อง
   * end_only  = แก้ไขได้เฉพาะ End Date
   */
  const [detailEditMode, setDetailEditMode] = useState<DetailEditMode>(null)

  /*
   * ใช้ป้องกัน useEffect ของ Start Date
   * ไม่ให้ล้าง End Date ตอนโหลดข้อมูลจากตารางขึ้นมาแก้ไข
   */
  const [isLoadingEditData, setIsLoadingEditData] = useState(false)

  /*
   * Confirm Save
   */
  const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)

  const [dataSubmit, setDataSubmit] = useState<any>()

  /*
   * สร้าง key ภายในสำหรับแต่ละแถว
   * ไม่ส่ง field นี้ไป Backend
   */
  const createRowKey = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
  }

  useEffect(() => {
    if (dataInTable && dataInTable.length > 0) {
      setSortedData(dataInTable)
    } else {
      setSortedData([])
    }
  }, [dataInTable])

  useEffect(() => {
    setAreaMaster(dataAreaMaster)
  }, [dataAreaMaster])

  useEffect(() => {
    setNomPointMaster(dataNomPointMaster)
  }, [dataNomPointMaster])

  useEffect(() => {
    const fetchAndSetData = async () => {
      if (mode === 'edit') {
        setMode(mode)

        setDataInTable([])
        setSelectedRows([])
        setEditingRowKey(null)
        setDetailEditMode(null)
        setIsLoadingEditData(false)

        setValue('res_bal_gas_contract', data?.res_bal_gas_contract || '')

        const group = dataShipper?.data?.find((item: any) => item.id === data?.group_id)

        setValue('group_id', data?.group_id || '')
        setValue('group_txt', group?.name || '')
        setValue('url', data?.url?.[0]?.url || '')

        setValue('reserve_balancing_gas_contract_comment', data?.reserve_balancing_gas_contract_comment?.length > 0 ? data?.reserve_balancing_gas_contract_comment?.[0]?.comment : '')

        setDataOriginalCommentLength(data?.reserve_balancing_gas_contract_comment?.length > 0 ? data?.reserve_balancing_gas_contract_comment?.[0]?.comment : '')

        const file_name: any = data?.url?.length > 0 ? data?.url?.[0]?.url : 'Maximum File 10 MB'

        const file_url: any = data?.url?.length > 0 ? data?.url?.[0]?.url : undefined

        setFileName(file_name)
        setFileUrl(file_url)

        const detailData = Array.isArray(data?.reserve_balancing_gas_contract_detail)
          ? data.reserve_balancing_gas_contract_detail.map((item: any, index: number) => ({
              _rowKey: `existing-${item?.id ?? index}-${createRowKey()}`,
              zone: item?.zone,
              entry_exit: item?.entry_exit,
              area: item?.area,
              nom_point: item?.nomination_point,
              start_date: item?.start_date,
              end_date: item?.end_date,
              daily_reverse_cap: item?.daily_reserve_cap_mmbtu_d
            }))
          : []

        setDataInTable(detailData)

        setTimeout(() => {
          setisModalLoading?.(false)
        }, 300)
      }

      if (mode === 'create') {
        setMode(mode)
        setEditingRowKey(null)
        setDetailEditMode(null)
        setIsLoadingEditData(false)
      }
    }

    fetchAndSetData()
  }, [data, mode, setValue, dataShipper, setisModalLoading])

  useEffect(() => {
    setResetForm(() => reset)
  }, [reset, setResetForm])

  /*
   * ล้าง Contract Detail Form
   */
  const clearContractDetailForm = () => {
    setValue('zone', null)
    setValue('entry_exit', null)
    setValue('area', '')
    setValue('nom_point', '')
    setValue('start_date', undefined)
    setValue('end_date', undefined)
    setValue('daily_reverse_cap', '')

    setEditingRowKey(null)
    setDetailEditMode(null)
    setIsLoadingEditData(false)

    setKey((prevKey) => prevKey + 1)
  }

  /*
   * Clear state when modal closes
   */
  const handleClose = () => {
    setResetForm(() => reset)

    setFileName('Maximum File 10 MB')
    setFileUrl(undefined)
    setFileUpload(undefined)

    setSortedData([])
    setDataInTable([])
    setSelectedRows([])

    setEditingRowKey(null)
    setDetailEditMode(null)
    setIsLoadingEditData(false)

    reset()
    onClose()
  }

  const handleFileChange = async (e: any) => {
    const file = e.target.files?.[0]

    if (file) {
      const validFileTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']

      const maxSizeInMB = 10
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024

      if (!validFileTypes.includes(file.type)) {
        setFileName('Invalid file type. Please upload an Excel file.')

        setError('file', {
          type: 'custom',
          message: 'Invalid file type. Please upload an Excel file.'
        })

        return
      }

      if (file.size > maxSizeInBytes) {
        setFileName('The file is larger than 10 MB.')

        setError('file', {
          type: 'custom',
          message: 'The file is larger than 10 MB.'
        })

        return
      }

      try {
        const response: any = await uploadFileService('/files/uploadfile/', file)

        clearErrors('file')
        setFileUrl(response?.file?.url)
      } catch (error) {
        console.error('File upload failed:', error)
        return
      }

      setFileName(file.name)
      setFileUpload(file)
    } else {
      setFileName('No file chosen')
    }
  }

  const handleRemoveFile = () => {
    setFileName('Maximum File 10 MB')
    setFileUrl('')
    setFileUpload(undefined)
    clearErrors('file')
  }

  const buildDateArray = (startISO: string, endISO: string, tz = 'Asia/Bangkok', format = 'YYYY-MM-DD') => {
    if (!startISO || !endISO) {
      return []
    }

    const start = dayjs.utc(startISO).tz(tz).startOf('day')

    /*
     * ระบบเดิมถือว่า End Date เป็นวันที่สิ้นสุดแบบ exclusive
     */
    const end = dayjs.utc(endISO).tz(tz).startOf('day').subtract(1, 'day')

    if (!start.isValid() || !end.isValid()) {
      return []
    }

    const out: string[] = []
    let cur = start.clone()

    while (cur.isSameOrBefore(end, 'day')) {
      out.push(cur.format(format))
      cur = cur.add(1, 'day')
    }

    return out
  }

  /*
   * ตรวจสอบสิทธิ์แก้ไขรายการ
   *
   * all:
   * วันนี้ยังไม่ถึง Start Date
   *
   * end_only:
   * วันนี้ถึง Start Date แล้ว
   * แต่ยังไม่ถึง End Date
   *
   * null:
   * ถึงหรือเกิน End Date แล้ว
   */
  const getRowEditMode = (row: any): DetailEditMode => {
    if (!row?.start_date) {
      return null
    }

    const today = dayjs().startOf('day')
    const rowStartDate = dayjs(row.start_date).startOf('day')

    const rowEndDate = row?.end_date ? dayjs(row.end_date).startOf('day') : null

    if (!rowStartDate.isValid()) {
      return null
    }

    /*
     * ยังไม่ถึง Start Date
     * แก้ได้ทุกช่อง
     */
    if (today.isBefore(rowStartDate, 'day')) {
      return 'all'
    }

    /*
     * Start แล้ว และยังไม่ถึง End Date
     * แก้ได้เฉพาะ End Date
     */
    if (rowEndDate && rowEndDate.isValid() && today.isBefore(rowEndDate, 'day')) {
      return 'end_only'
    }

    return null
  }

  /*
   * กด Edit จาก Action column
   */
  const handleEditRow = (row: any) => {
    if (isReadOnly) {
      return
    }

    const editMode = getRowEditMode(row)

    if (!editMode) {
      return
    }

    setIsLoadingEditData(true)
    setEditingRowKey(row?._rowKey)
    setDetailEditMode(editMode)

    setValue('entry_exit', row?.entry_exit?.id ?? null)

    setValue('zone', row?.zone?.id ?? null)
    setValue('area', row?.area?.id ?? '')
    setValue('nom_point', row?.nom_point?.id ?? '')

    setValue('start_date', row?.start_date ?? undefined)

    setValue('end_date', row?.end_date ?? undefined)

    setValue('daily_reverse_cap', row?.daily_reverse_cap ?? '')

    /*
     * บังคับ DatePickaForm โหลดค่าใหม่
     */
    setKey((prevKey) => prevKey + 1)

    setTimeout(() => {
      setIsLoadingEditData(false)
    }, 0)
  }

  /*
   * Add หรือ Update Contract Detail
   */
  const addContract = () => {
    const selectedZone = zoneMaster?.data?.find((item: any) => item.id === watch('zone'))

    const selectedEntryExit = entryExitMaster?.data?.find((item: any) => item.id === watch('entry_exit'))

    const selectedArea = areaMaster?.find((item: any) => item.id === watch('area'))

    const selectedNom = nomPointMaster?.find((item: any) => item.id === watch('nom_point'))

    /*
     * กรณีกำลังแก้ไข
     */
    if (editingRowKey) {
      setDataInTable((prev: any[]) =>
        prev.map((item: any) => {
          if (item?._rowKey !== editingRowKey) {
            return item
          }

          /*
           * Start แล้ว แก้เฉพาะ End Date
           */
          if (detailEditMode === 'end_only') {
            return {
              ...item,
              end_date: watch('end_date')
            }
          }

          /*
           * ยังไม่ถึง Start Date
           * แก้ได้ทั้งหมด
           */
          return {
            ...item,
            zone: selectedZone,
            entry_exit: selectedEntryExit,
            area: selectedArea,
            nom_point: selectedNom,
            start_date: watch('start_date'),
            end_date: watch('end_date'),
            daily_reverse_cap: watch('daily_reverse_cap')
          }
        })
      )

      clearContractDetailForm()
      return
    }

    /*
     * กรณี Add รายการใหม่
     */
    setDataInTable((prev: any[]) => [
      ...prev,
      {
        _rowKey: createRowKey(),
        zone: selectedZone,
        entry_exit: selectedEntryExit,
        area: selectedArea,
        nom_point: selectedNom,
        start_date: watch('start_date'),
        end_date: watch('end_date'),
        daily_reverse_cap: watch('daily_reverse_cap')
      }
    ])

    clearContractDetailForm()
  }

  /*
   * Checkbox
   */
  const [selectedRows, setSelectedRows] = useState<number[]>([])

  const handleCheckboxChange = (id: number) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((selectedId) => selectedId !== id))
    } else {
      setSelectedRows([...selectedRows, id])
    }
  }

  const deleteSelectedRows = () => {
    const rowKeysToDelete = sortedData.filter((_: any, index: number) => selectedRows.includes(index)).map((item: any) => item?._rowKey)

    const updatedData = dataInTable.filter((item: any) => !rowKeysToDelete.includes(item?._rowKey))

    /*
     * ถ้ารายการที่กำลังแก้ไขถูกลบ
     * ให้ล้างฟอร์มแก้ไขด้วย
     */
    if (editingRowKey && rowKeysToDelete.includes(editingRowKey)) {
      clearContractDetailForm()
    }

    setDataInTable(updatedData)
    setSelectedRows([])
  }

  /*
   * รายการที่ยังไม่ Start เท่านั้นที่ลบได้
   */
  const canDeleteRow = (row: any) => {
    if (!row?.start_date) {
      return false
    }

    const today = dayjs().startOf('day')
    const rowStartDate = dayjs(row.start_date).startOf('day')

    return rowStartDate.isValid() && rowStartDate.isAfter(today, 'day')
  }

  const handleSelectAll = () => {
    const deletableIndexes = sortedData.reduce((indexes: number[], item: any, index: number) => {
      if (canDeleteRow(item)) {
        indexes.push(index)
      }

      return indexes
    }, [])

    const allDeletableSelected = deletableIndexes.length > 0 && deletableIndexes.every((index: number) => selectedRows.includes(index))

    if (allDeletableSelected) {
      setSelectedRows([])
    } else {
      setSelectedRows(deletableIndexes)
    }
  }

  const deletableRowIndexes = sortedData.reduce((indexes: number[], item: any, index: number) => {
    if (canDeleteRow(item)) {
      indexes.push(index)
    }

    return indexes
  }, [])

  const isAllSelected = deletableRowIndexes.length > 0 && deletableRowIndexes.every((index: number) => selectedRows.includes(index))

  const [isButtonEnabled, setisButtonEnabled] = useState(false)

  /*
   * ตรวจสอบปุ่ม Add / Update
   */
  useEffect(() => {
    const hasRequiredData = !!watch('zone') && !!watch('entry_exit') && !!watch('area') && !!watch('nom_point') && !!watch('start_date') && !!watch('end_date') && !!watch('daily_reverse_cap')

    if (!hasRequiredData) {
      setisButtonEnabled(false)
      return
    }

    const selectedStartDate = dayjs(watch('start_date'))

    const selectedEndDate = dayjs(watch('end_date'))

    if (!selectedStartDate.isValid() || !selectedEndDate.isValid()) {
      setisButtonEnabled(false)
      return
    }

    /*
     * End Date ต้องมากกว่า Start Date
     */
    if (!selectedEndDate.isAfter(selectedStartDate, 'day')) {
      setisButtonEnabled(false)
      return
    }

    /*
     * กรณี Start แล้ว
     * แก้ได้เฉพาะ End Date
     *
     * ป้องกันค่าอื่นเปลี่ยนโดยไม่ตั้งใจ
     */
    if (editingRowKey && detailEditMode === 'end_only') {
      const currentRow = dataInTable.find((item: any) => item?._rowKey === editingRowKey)

      if (!currentRow) {
        setisButtonEnabled(false)
        return
      }

      const today = dayjs().startOf('day')

      /*
       * End Date ใหม่ต้องไม่ย้อนหลังจากวันนี้
       */
      if (selectedEndDate.isBefore(today, 'day')) {
        setisButtonEnabled(false)
        return
      }
    }

    const datesNew = buildDateArray(selectedStartDate.toISOString(), selectedEndDate.toISOString())

    const datesOld = sortedData
      ?.filter((item: any) => {
        /*
         * ไม่ตรวจ overlap กับรายการตัวเอง
         */
        if (editingRowKey && item?._rowKey === editingRowKey) {
          return false
        }

        return item?.entry_exit?.id === watch('entry_exit') && item?.area?.id === watch('area') && item?.zone?.id === watch('zone') && item?.nom_point?.id === watch('nom_point')
      })
      ?.map((item: any) => buildDateArray(item?.start_date, item?.end_date))
      ?.flat()

    const hasOverlap = datesNew.some((date: string) => datesOld?.includes(date))

    setisButtonEnabled(!hasOverlap)
  }, [watch('zone'), watch('entry_exit'), watch('area'), watch('nom_point'), watch('start_date'), watch('end_date'), watch('daily_reverse_cap'), sortedData, dataInTable, editingRowKey, detailEditMode])

  /*
   * เมื่อเปลี่ยน Start Date ให้ล้าง End Date
   *
   * แต่ห้ามล้างตอนโหลดแถวขึ้นมาแก้ไข
   * และกรณีแก้เฉพาะ End Date
   */
  useEffect(() => {
    if (isLoadingEditData || editingRowKey || detailEditMode === 'end_only') {
      return
    }

    setValue('end_date', undefined)
  }, [watch('start_date'), setValue, isLoadingEditData, editingRowKey, detailEditMode])

  const handleSubmitForm = async () => {
    setisModalLoading?.(true)

    const makeDataPost = {
      res_bal_gas_contract: watch('res_bal_gas_contract'),

      group_id: watch('group_id'),

      reserve_balancing_gas_contract_comment: dataOriginalCommentLength !== watch('reserve_balancing_gas_contract_comment') ? [watch('reserve_balancing_gas_contract_comment')] : [],

      reserve_balancing_gas_contract_files: fileUrl ? [fileUrl] : [],

      reserve_balancing_gas_contract_detail: dataInTable?.map((item: any) => ({
        zone_id: item?.zone?.id,
        area_id: item?.area?.id,
        entry_exit_id: item?.entry_exit?.id,
        nomination_point_id: item?.nom_point?.id,
        start_date: item?.start_date,
        end_date: item?.end_date,
        daily_reserve_cap_mmbtu_d: item?.daily_reverse_cap
      }))
    }

    onSubmit(makeDataPost)
    removeWhenClose()
  }

  const removeWhenClose = () => {
    setValue('res_bal_gas_contract', '')

    setValue('group_id', '')

    setValue('reserve_balancing_gas_contract_comment', '')

    setValue('zone', '')
    setValue('entry_exit', '')
    setValue('area', '')
    setValue('nom_point', '')
    setValue('start_date', undefined)
    setValue('end_date', undefined)
    setValue('daily_reverse_cap', '')

    setDataInTable([])
    setSortedData([])
    setSelectedRows([])

    setEditingRowKey(null)
    setDetailEditMode(null)
    setIsLoadingEditData(false)

    setFileName('Maximum File 10 MB')

    setFileUrl('')
    setFileUpload(undefined)
  }

  /*
   * Column Show / Hide
   */
  const initialColumns: any = [
    {
      key: 'zone',
      label: 'Zone',
      visible: true
    },
    {
      key: 'area',
      label: 'Area',
      visible: true
    },
    {
      key: 'entry_exit',
      label: 'Extry/Exit',
      visible: true
    },
    {
      key: 'nom_point',
      label: 'Nomination Point',
      visible: true
    },
    {
      key: 'start_date',
      label: 'Start Date',
      visible: true
    },
    {
      key: 'end_date',
      label: 'End Date',
      visible: true
    },
    {
      key: 'daily_reverse',
      label: 'Daily Reserve Cap (MMBTU/D)',
      visible: true
    }
  ]

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const openPop = Boolean(anchorEl)

  const id = openPop ? 'column-toggle-popover' : undefined

  const [columnVisibility, setColumnVisibility] = useState<any>(Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible])))

  const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget)
  }

  const handleColumnToggle = (columnKey: string) => {
    setColumnVisibility((prev: any) => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }))
  }

  const getArrowIcon = (column: string) => {
    return (
      <div className={`${table_col_arrow_sort_style}`}>
        <ArrowDropUpIcon
          sx={{
            fontSize: 18,
            opacity: sortState.column === column && sortState.direction === 'asc' ? 1 : 0.4
          }}
        />

        <ArrowDropDownIcon
          sx={{
            fontSize: 18,
            opacity: sortState.column === column && sortState.direction === 'desc' ? 1 : 0.4
          }}
        />
      </div>
    )
  }

  /*
   * Confirm Save
   */
  const handleSaveConfirm = async (formData?: any) => {
    if (mode === 'create') {
      handleSubmitForm()
    } else {
      setDataSubmit(formData)
      setModaConfirmSave(true)
    }
  }

  /*
   * ตอนแก้ไขสัญญาที่ Start แล้ว
   * ล็อกทุกช่อง ยกเว้น End Date
   */
  const isDetailFieldReadOnly = isReadOnly || detailEditMode === 'end_only'

  return (
    <>
      <Dialog open={open} onClose={() => handleClose} className="relative z-20">
        <DialogBackdrop transition className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in" />

        <div className="fixed inset-0 z-10 w-full overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="flex transform transition-all inset-0 rounded-lg text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
            >
              <div className="flex flex-col items-center justify-center gap-2 rounded-md">
                <Spinloading spin={isModalLoading} rounded={20} />

                <form onSubmit={handleSubmit(handleSaveConfirm)} className="p-6 md:p-8 rounded-[20px] shadow-lg bg-white max-w-[100%] w-[90vw] mx-auto">
                  <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-5">{mode === 'create' ? 'New Reserve Balancing Gas Contract' : mode === 'edit' ? 'Edit Reserve Balancing Gas Contract' : 'View Reserve Balancing Gas Contract'}</h2>

                  <div className="mb-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="grid grid-cols-2 gap-2 text-[#58585A]">
                        <div>
                          <label htmlFor="res_bal_gas_contract" className="block mb-2 text-sm font-light">
                            <span className="text-red-500">*</span>
                            {'Res.Bal.Gas Contract'}
                          </label>

                          <input
                            id="res_bal_gas_contract"
                            type="text"
                            placeholder="Enter Res.Bal.Gas Contract"
                            readOnly={isReadOnly}
                            {...register('res_bal_gas_contract', {
                              required: Mode === 'edit' ? false : true
                            })}
                            className={`${inputClass} ${mode === 'edit' && '!bg-[#EFECEC]'} ${errors.res_bal_gas_contract && 'border-red-500'}`}
                          />

                          {errors.res_bal_gas_contract && <p className="text-red-500 text-sm">{'Enter Res.Bal.Gas Contract'}</p>}
                        </div>

                        <div>
                          <label htmlFor="group_id" className="block mb-2 text-sm font-light">
                            <span className="text-red-500">*</span>
                            {'Shipper Name'}
                          </label>

                          {mode === 'edit' ? (
                            <div>
                              <input id="group_id" type="text" placeholder="Enter Shipper Name" readOnly={isReadOnly} {...register('group_txt')} disabled className={`${inputClass} !bg-[#EFECEC]`} />
                            </div>
                          ) : (
                            <Select
                              id="group_id"
                              IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                              disabled={isReadOnly}
                              value={watch('group_id') || ''}
                              {...register('group_id', {
                                required: Mode === 'edit' ? false : 'Enter Shipper Name'
                              })}
                              className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.group_id && !watch('group_id') && 'border-red-500'}`}
                              sx={{
                                '.MuiOutlinedInput-notchedOutline': {
                                  borderColor: errors.group_id && !watch('group_id') ? '#FF0000' : '#DFE4EA'
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: errors.group_id && !watch('group_id') ? '#FF0000' : '#d2d4d8'
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#d2d4d8'
                                }
                              }}
                              onChange={(e) => {
                                setValue('group_id', e.target.value)
                              }}
                              displayEmpty
                              renderValue={(value: any) => {
                                if (!value) {
                                  return (
                                    <Typography color="#9CA3AF" fontSize={14}>
                                      Select Shipper Name
                                    </Typography>
                                  )
                                }

                                const selectedItem = dataShipper?.data?.find((item: any) => item.id === value)

                                return selectedItem ? selectedItem.name : ''
                              }}
                              MenuProps={{
                                PaperProps: {
                                  style: {
                                    maxHeight: 48 * 4.5 + 8
                                  }
                                }
                              }}
                            >
                              {dataShipper?.data?.map((item: any) => (
                                <MenuItem key={item.id} value={item.id}>
                                  {item.name}
                                </MenuItem>
                              ))}
                            </Select>
                          )}

                          {errors.group_id && <p className="text-red-500 text-sm">{'Enter Shipper Name'}</p>}
                        </div>

                        <div className="col-span-2 mt-1">
                          <label htmlFor="url" className="block mb-2 text-sm font-light">
                            {'File'}
                          </label>

                          <div className="flex w-full">
                            <label className="bg-[#00ADEF] text-white flex items-center justify-center font-light rounded-l-[6px] text-sm text-justify w-[30%] !h-[40px] px-5 py-2 cursor-pointer">
                              {'Choose File'}

                              <input id="url" type="file" {...register('file')} className="hidden" accept=".xls, .xlsx" readOnly={isReadOnly} disabled={isReadOnly} onChange={handleFileChange} />
                            </label>

                            <div className="bg-white text-[#9CA3AF] text-sm w-[70%] !h-[40px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden flex items-center">
                              <span className={`truncate ${errors?.file ? 'text-red-500' : ''}`}>{fileName}</span>

                              {fileName !== 'Maximum File 10 MB' && (
                                <CloseOutlinedIcon
                                  onClick={handleRemoveFile}
                                  className="cursor-pointer ml-2 text-[#9CA3AF] z-10"
                                  sx={{
                                    color: '#323232',
                                    fontSize: 18
                                  }}
                                  style={{
                                    fontSize: 18
                                  }}
                                />
                              )}
                            </div>
                          </div>

                          <span className="w-full flex text-left justify-start text-[#1473A1] text-[14px]">Required : .xls, .xlsx</span>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="reserve_balancing_gas_contract_comment" className={labelClass}>
                          {'Comment'}
                        </label>

                        <TextField
                          {...register('reserve_balancing_gas_contract_comment')}
                          value={watch('reserve_balancing_gas_contract_comment') || ''}
                          onChange={(e) => {
                            if (e.target.value.length <= 255) {
                              setValue('reserve_balancing_gas_contract_comment', e.target.value)
                            }
                          }}
                          label=""
                          multiline
                          placeholder="Enter Comment"
                          disabled={isReadOnly}
                          rows={4}
                          sx={{
                            '.MuiOutlinedInput-root': {
                              borderRadius: '8px'
                            },
                            '.MuiOutlinedInput-notchedOutline': {
                              borderColor: '#DFE4EA'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#DFE4EA !important'
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#00ADEF'
                            },
                            '&.MuiInputBase-input::placeholder': {
                              color: '#9CA3AF',
                              fontSize: '14px'
                            },
                            '& .Mui-disabled': {
                              color: '#58585A'
                            },
                            '& .MuiOutlinedInput-input::placeholder': {
                              fontSize: '14px'
                            },
                            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#00ADEF !important',
                              borderWidth: '1px'
                            }
                          }}
                          fullWidth
                          className={`${isReadOnly && '!bg-[#EFECEC]'}`}
                        />

                        <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                          <span className="text-[13px]">{watch('reserve_balancing_gas_contract_comment')?.length || 0} / 255</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full rounded-[10px] h-auto border border-[#DFE4EA] p-4">
                    <div className="font-semibold text-[#464255] pb-4 flex gap-2">
                      {'Contract Details'}

                      <span>
                        <CustomTooltip
                          title={
                            <div>
                              <p className="text-[#464255] font-light">{'Add button disabled: missing required fields or period overlaps existing data.'}</p>
                            </div>
                          }
                          placement="top-end"
                          arrow
                        >
                          <div className="w-[20px] h-[20px] flex items-center justify-center rounded-lg cursor-pointer">
                            <InfoOutlinedIcon
                              style={{
                                fontSize: '11px',
                                color: '#747474',
                                borderRadius: '4px',
                                width: '22px',
                                height: '22px',
                                border: '1px solid rgba(43, 42, 135, 0.4)'
                              }}
                            />
                          </div>
                        </CustomTooltip>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-end gap-4 text-[#464255] pb-4">
                      <div className="flex-1 min-w-[150px] sm:w-[48%] md:w-[25%] lg:w-[15%]">
                        <label htmlFor="entry_exit" className="block mb-2 text-sm font-light">
                          {'Entry/Exit'}
                        </label>

                        <SelectFormProps
                          id={'entry_exit'}
                          register={register('entry_exit')}
                          disabled={isDetailFieldReadOnly}
                          valueWatch={watch('entry_exit') ? watch('entry_exit') : ''}
                          handleChange={(e) => {
                            setValue('entry_exit', e.target.value)

                            setValue('area', null)

                            setValue('nom_point', null)
                          }}
                          errors={errors?.ref_id}
                          errorsText="Select Entry/Exit"
                          options={entryExitMaster?.data}
                          optionsKey={'id'}
                          optionsValue={'id'}
                          optionsText={'name'}
                          optionsResult={'name'}
                          placeholder="Select Entry/Exit"
                          pathFilter={'name'}
                        />
                      </div>

                      <div className="flex-1 min-w-[150px] sm:w-[48%] md:w-[25%] lg:w-[15%]">
                        <label htmlFor="zone" className="block mb-2 text-sm font-light">
                          {'Zone'}
                        </label>

                        <SelectFormProps
                          id={'zone'}
                          register={register('zone')}
                          disabled={isDetailFieldReadOnly}
                          valueWatch={watch('zone') ? watch('zone') : ''}
                          handleChange={(e) => {
                            setValue('zone', e.target.value)

                            setValue('area', null)

                            setValue('nom_point', null)
                          }}
                          errors={errors?.ref_id}
                          errorsText="Select Zone"
                          options={zoneMaster?.data?.filter((item: any) => (watch('entry_exit') ? item?.entry_exit?.id == watch('entry_exit') : item?.entry_exit?.id !== null))}
                          optionsKey={'id'}
                          optionsValue={'id'}
                          optionsText={'name'}
                          optionsResult={'name'}
                          placeholder="Select Zone"
                          pathFilter={'name'}
                        />
                      </div>

                      <div className="flex-1 min-w-[150px] sm:w-[48%] md:w-[25%] lg:w-[15%]">
                        <label htmlFor="area" className="block mb-2 text-sm font-light">
                          {'Area'}
                        </label>

                        <Select
                          id="area"
                          IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                          disabled={isDetailFieldReadOnly}
                          value={watch('area') || ''}
                          className={`${selectboxClass} ${isDetailFieldReadOnly && '!bg-[#EFECEC]'}`}
                          sx={{
                            '.MuiOutlinedInput-notchedOutline': {
                              borderColor: '#DFE4EA'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#d2d4d8'
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#d2d4d8'
                            }
                          }}
                          onChange={(e) => {
                            setValue('area', e.target.value)

                            setValue('nom_point', null)
                          }}
                          displayEmpty
                          renderValue={(value: any) => {
                            if (!value) {
                              return (
                                <Typography
                                  color="#9CA3AF"
                                  fontSize={14}
                                  sx={{
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    width: '90%'
                                  }}
                                >
                                  Select Area
                                </Typography>
                              )
                            }

                            const selectedItem = areaMaster?.find((item: any) => item.id === value)

                            return selectedItem ? selectedItem.name : ''
                          }}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 48 * 4.5 + 8
                              }
                            }
                          }}
                        >
                          {areaMaster
                            ?.filter((item: any) => item?.zone?.id === watch('zone'))
                            ?.map((item: any) => (
                              <MenuItem key={item.id} value={item.id}>
                                {item.name}
                              </MenuItem>
                            ))}
                        </Select>
                      </div>

                      <div className="flex-1 min-w-[150px] sm:w-[48%] md:w-[25%] lg:w-[15%]">
                        <label htmlFor="nom_point" className="block mb-2 text-sm font-light">
                          {'Nomination Point'}
                        </label>

                        <Select
                          id="nom_point"
                          IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                          disabled={isDetailFieldReadOnly}
                          value={watch('nom_point') || ''}
                          className={`${selectboxClass} ${isDetailFieldReadOnly && '!bg-[#EFECEC]'}`}
                          sx={{
                            '.MuiOutlinedInput-notchedOutline': {
                              borderColor: '#DFE4EA'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#d2d4d8'
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#d2d4d8'
                            }
                          }}
                          onChange={(e) => {
                            setValue('nom_point', e.target.value)
                          }}
                          displayEmpty
                          renderValue={(value: any) => {
                            if (!value) {
                              return (
                                <Typography
                                  color="#9CA3AF"
                                  fontSize={14}
                                  sx={{
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    width: '90%'
                                  }}
                                >
                                  Select Nomination Point
                                </Typography>
                              )
                            }

                            const selectedItem = nomPointMaster?.find((item: any) => item.id === value)

                            return (
                              <Typography
                                style={{
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  width: '90%'
                                }}
                              >
                                {selectedItem ? selectedItem.nomination_point : ''}
                              </Typography>
                            )
                          }}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 48 * 4.5 + 8
                              }
                            }
                          }}
                        >
                          {nomPointMaster
                            ?.filter((item: any) => item?.area?.id == watch('area'))
                            ?.map((item: any) => (
                              <MenuItem key={item.id} value={item.id}>
                                {item.nomination_point}
                              </MenuItem>
                            ))}
                        </Select>
                      </div>

                      <div className="flex-1 min-w-[150px] sm:w-[48%] md:w-[25%] lg:w-[15%]">
                        <label className={labelClass}>{'Start Date'}</label>

                        <DatePickaForm
                          key={'start' + key}
                          {...register('start_date')}
                          readOnly={isDetailFieldReadOnly}
                          placeHolder="Select Start Date"
                          mode="create"
                          valueShow={watch('start_date') && dayjs(watch('start_date')).format('DD/MM/YYYY')}
                          min={formattedStartDate || undefined}
                          allowClear
                          onChange={(e: any) => {
                            setValue('start_date', formatFormDate(e))

                            if (e === undefined) {
                              setValue('start_date', null, {
                                shouldValidate: true,
                                shouldDirty: true
                              })
                            }
                          }}
                          forMode="filter"
                        />
                      </div>

                      <div className="flex-1 min-w-[150px] sm:w-[48%] md:w-[25%] lg:w-[15%]">
                        <label className={labelClass}>{'End Date'}</label>

                        <DatePickaForm
                          key={'end' + key}
                          {...register('end_date')}
                          readOnly={isReadOnly}
                          placeHolder="Select End Date"
                          mode="create"
                          valueShow={watch('end_date') && dayjs(watch('end_date')).format('DD/MM/YYYY')}
                          min={detailEditMode === 'end_only' ? dayjs().format('YYYY-MM-DD') : watch('start_date') ? watch('start_date') : formattedStartDate || undefined}
                          allowClear
                          onChange={(e: any) => {
                            setValue('end_date', formatFormDate(e))

                            if (e === undefined) {
                              setValue('end_date', null, {
                                shouldValidate: true,
                                shouldDirty: true
                              })
                            }
                          }}
                          forMode="filter"
                        />
                      </div>

                      <div className="flex-1 min-w-[150px] sm:w-[48%] md:w-[25%] lg:w-[15%]">
                        <label htmlFor="daily_reverse_cap" className="block mb-2 text-sm font-light">
                          {'Daily Reserve Cap (MMBTU/D)'}
                        </label>

                        <NumericFormat
                          id="daily_reverse_cap"
                          placeholder="0.000"
                          value={watch('daily_reverse_cap') || ''}
                          readOnly={isDetailFieldReadOnly}
                          {...register('daily_reverse_cap')}
                          className={`${inputClass} ${errors.value && 'border-red-500'} ${isDetailFieldReadOnly && '!bg-[#EFECEC]'} text-right`}
                          thousandSeparator={true}
                          decimalScale={3}
                          fixedDecimalScale={true}
                          allowNegative={false}
                          displayType="input"
                          onValueChange={(values) => {
                            const {value} = values

                            setValue('daily_reverse_cap', value, {
                              shouldValidate: true,
                              shouldDirty: true
                            })
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-[100px] sm:w-[48%] md:w-[15%] lg:w-[12%]">
                        <Button type="button" className={`flex items-center justify-center mt-[26px] h-[46px] w-[70px] normal-case ${isButtonEnabled ? 'bg-[#24AB6A]' : 'bg-[#9CA3AF]'}`} disabled={!isButtonEnabled} onClick={addContract}>
                          <span>{editingRowKey ? 'Update' : 'Add'}</span>
                        </Button>
                      </div>
                    </div>

                    <div>
                      <div className="gap-2 flex flex-column sm:flex-row flex-wrap items-center justify-start pb-2">
                        <div>
                          <div onClick={handleTogglePopover}>
                            <TuneIcon
                              className="cursor-pointer rounded-lg"
                              style={{
                                fontSize: '18px',
                                color: '#2B2A87',
                                borderRadius: '4px',
                                width: '22px',
                                height: '22px',
                                border: '1px solid rgba(43, 42, 135, 0.4)'
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <Button type="button" className={`flex items-center font-semibold justify-center h-[33px] w-[70px] normal-case ${selectedRows.length > 0 ? 'bg-[#E46969]' : 'bg-[#9CA3AF] cursor-not-allowed'}`} onClick={deleteSelectedRows} disabled={selectedRows.length === 0}>
                            <span>Delete</span>
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2 relative h-auto overflow-auto block rounded-t-md pt-1">
                      <div className="max-h-[200px] overflow-y-auto">
                        <table className="w-full max-h-[200px] text-sm text-center justify-center rtl:text-right text-gray-500">
                          <thead className="text-sm rounded-tl-[10px] rounded-tr-[10px] text-[#ffffff] h-[35px] bg-[#1473A1] sticky z-1">
                            <tr>
                              <th className="rounded-tl-[10px] w-[5%]">
                                <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} className="form-checkbox w-4 h-4" disabled={isReadOnly} />
                              </th>

                              {columnVisibility.zone && (
                                <th className={`${table_sort_header_style}`} onClick={() => handleSort('zone.id', sortState, setSortState, setSortedData, dataInTable)}>
                                  {'Zone'}
                                  {getArrowIcon('zone.id')}
                                </th>
                              )}

                              {columnVisibility.area && (
                                <th className={`${table_sort_header_style}`} onClick={() => handleSort('area.id', sortState, setSortState, setSortedData, dataInTable)}>
                                  {'Area'}
                                  {getArrowIcon('area.id')}
                                </th>
                              )}

                              {columnVisibility.entry_exit && (
                                <th className={`${table_sort_header_style}`} onClick={() => handleSort('entry_exit.id', sortState, setSortState, setSortedData, dataInTable)}>
                                  {'Entry/Exit'}
                                  {getArrowIcon('entry_exit.id')}
                                </th>
                              )}

                              {columnVisibility.nom_point && (
                                <th className={`${table_sort_header_style}`} onClick={() => handleSort('nom_point.id', sortState, setSortState, setSortedData, dataInTable)}>
                                  {'Nomination Point'}
                                  {getArrowIcon('nom_point.id')}
                                </th>
                              )}

                              {columnVisibility.start_date && (
                                <th className={`${table_sort_header_style}`} onClick={() => handleSort('start_date', sortState, setSortState, setSortedData, dataInTable)}>
                                  {'Start Date'}
                                  {getArrowIcon('start_date')}
                                </th>
                              )}

                              {columnVisibility.end_date && (
                                <th className={`${table_sort_header_style}`} onClick={() => handleSort('end_date', sortState, setSortState, setSortedData, dataInTable)}>
                                  {'End Date'}
                                  {getArrowIcon('end_date')}
                                </th>
                              )}

                              {columnVisibility.daily_reverse && (
                                <th className={`w-[20%] text-left ${table_sort_header_style}`} onClick={() => handleSort('daily_reverse_cap', sortState, setSortState, setSortedData, dataInTable)}>
                                  {'Daily Reserve Cap (MMBTU/D)'}
                                  {getArrowIcon('daily_reverse_cap')}
                                </th>
                              )}

                              <th className="rounded-tr-[10px] w-[7%] text-center">Action</th>
                            </tr>
                          </thead>

                          <tbody>
                            {sortedData?.map((row: any, index: number) => {
                              const rowEditMode = getRowEditMode(row)

                              const canEdit = !isReadOnly && !!rowEditMode

                              const isEditing = editingRowKey === row?._rowKey

                              return (
                                <tr key={row?._rowKey} className={`${table_row_style} ${isEditing ? '!bg-[#F0FAFF]' : ''}`}>
                                  <td className="px-2 py-1">
                                    <input type="checkbox" checked={selectedRows.includes(index)} onChange={() => handleCheckboxChange(index)} className="form-checkbox w-4 h-4" disabled={isReadOnly || !canDeleteRow(row)} />
                                  </td>

                                  {columnVisibility.zone && (
                                    <td className="px-2 py-1 items-center text-center justify-center">
                                      {row?.zone && (
                                        <div
                                          className="flex w-[100px] items-center text-center justify-center rounded-full p-1 text-[#464255]"
                                          style={{
                                            backgroundColor: row?.zone?.color
                                          }}
                                        >
                                          {row?.zone?.name}
                                        </div>
                                      )}
                                    </td>
                                  )}

                                  {columnVisibility.area && (
                                    <td className="px-2 py-1 justify-center">
                                      {row?.area?.entry_exit_id == 2 ? (
                                        <div
                                          className="flex justify-center items-center rounded-full p-1 text-[#464255] text-[13px]"
                                          style={{
                                            backgroundColor: row?.area?.color,
                                            width: '35px',
                                            height: '35px'
                                          }}
                                        >
                                          {row?.area?.name ?? ''}
                                        </div>
                                      ) : (
                                        <div
                                          className="flex justify-center items-center rounded-lg p-1 text-[#464255] text-[13px]"
                                          style={{
                                            backgroundColor: row?.area?.color,
                                            width: '35px',
                                            height: '35px'
                                          }}
                                        >
                                          {row?.area?.name ?? ''}
                                        </div>
                                      )}
                                    </td>
                                  )}

                                  {columnVisibility.entry_exit && (
                                    <td className="px-2 py-1 justify-center">
                                      {row?.entry_exit && (
                                        <div
                                          className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]"
                                          style={{
                                            backgroundColor: row?.entry_exit?.color
                                          }}
                                        >
                                          {row?.entry_exit?.name}
                                        </div>
                                      )}
                                    </td>
                                  )}

                                  {columnVisibility.nom_point && <td className="px-2 py-1 text-[#464255]">{row?.nom_point ? row?.nom_point?.nomination_point : ''}</td>}

                                  {columnVisibility.start_date && <td className="px-2 py-1 text-[#464255]">{row?.start_date ? formatDateNoTime(row?.start_date) : ''}</td>}

                                  {columnVisibility.end_date && <td className="px-2 py-1 text-[#0DA2A2]">{row?.end_date ? formatDateNoTime(row?.end_date) : ''}</td>}

                                  {columnVisibility.daily_reverse && <td className="px-2 py-1 text-[#464255]">{row?.daily_reverse_cap ? formatNumber(row?.daily_reverse_cap) : ''}</td>}

                                  <td className="px-2 py-1 text-center">
                                    <CustomTooltip title={rowEditMode === 'all' ? 'Edit contract details' : rowEditMode === 'end_only' ? 'Edit End Date' : 'This contract detail can no longer be edited'} placement="top" arrow>
                                      <span>
                                        <button
                                          type="button"
                                          onClick={() => handleEditRow(row)}
                                          disabled={!canEdit}
                                          className={`inline-flex items-center justify-center w-[28px] h-[28px] rounded-md ${canEdit ? 'text-[#1473A1] hover:bg-[#E8F5FB] cursor-pointer' : 'text-[#B6B6B6] cursor-not-allowed'}`}
                                        >
                                          <EditOutlinedIcon
                                            sx={{
                                              fontSize: 19
                                            }}
                                          />
                                        </button>
                                      </span>
                                    </CustomTooltip>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>

                        {dataInTable?.length <= 0 && (
                          <div className="flex flex-col justify-center items-center w-[100%] pt-10">
                            <img className="w-[40px] h-auto mb-2" src="/assets/image/no_data_icon.svg" alt="No data icon" />

                            <div className="text-[16px] text-[#9CA3AF]">{'Please select contract details to view the information.'}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6">
                    {mode === 'view' ? (
                      <button type="button" onClick={handleClose} className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
                        {'Close'}
                      </button>
                    ) : (
                      <button type="button" onClick={handleClose} className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500">
                        {'Cancel'}
                      </button>
                    )}

                    {mode !== 'view' && (
                      <button type="submit" className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
                        {mode === 'create' ? 'Add' : 'Save'}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      <ColumnVisibilityPopover open={openPop} anchorEl={anchorEl} setAnchorEl={setAnchorEl} columnVisibility={columnVisibility} handleColumnToggle={handleColumnToggle} initialColumns={initialColumns} />

      <ModalConfirmSave
        open={modaConfirmSave}
        handleClose={(e: any) => {
          setModaConfirmSave(false)

          if (e === 'submit') {
            setTimeout(async () => {
              handleSubmitForm()
            }, 100)

            setTimeout(async () => {
              handleClose()
            }, 1000)
          }
        }}
        title="Confirm Save"
        description={
          <div>
            <div className="text-center">{'Do you want to save the changes ?'}</div>
          </div>
        }
        menuMode="confirm-save"
        btnmode="split"
        btnsplit1="Save"
        btnsplit2="Cancel"
        stat="none"
      />
    </>
  )
}

export default ModalAction
