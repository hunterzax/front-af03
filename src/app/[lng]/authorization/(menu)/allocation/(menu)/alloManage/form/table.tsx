import {useEffect, useMemo, useRef} from 'react'
import React, {useState} from 'react'
import TableSkeleton from '@/components/material_custom/DefaultSkeleton'
import {formatNumberFourDecimal, formatNumberThreeDecimal, iconButtonClass, toDayjs} from '@/utils/generalFormatter'
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined'
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import {table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style} from '@/utils/styles'
import BtnActionTable from '@/components/other/btnActionInTable'
import {handleSort, handleSortAllocMgn} from '@/utils/sortTable'

interface TableProps {
  openEditForm: (id: any) => void
  openViewForm: (id: any) => void
  openReasonModal: (id?: any, data_comment?: any, row?: any) => void
  tableData: any
  isLoading: any
  columnVisibility: any
  userPermission?: any
  selectedItem?: any
  setselectedItem?: any
  openHistoryForm: (id: any) => void
  sortedData?: any
  setSortedData?: any
  filteredDataTable?: any
  setFilteredDataTable?: any
  checkedData?: any
  setcheckedData?: any
}

const statusOrder: any = {
  'Shipper Reviewed': 1,
  Accepted: 2,
  Accept: 2,
  Allocated: 3,
  Allocate: 3,
  Rejected: 4,
  Reject: 4,
  'Not Review': 5
}

const getParentStatusName = (children: any[] = []) => {

  if (!Array.isArray(children) || children.length === 0) {

    return 'Not Review'

  }

  // ต้องเรียงเงื่อนไขเหมือน renderStatus

  if (

    children.some(

      (item: any) =>

        Number(item?.allocation_status?.id) === 2

    )

  ) {

    return 'Shipper Reviewed'

  }

  if (

    children.some(

      (item: any) =>

        Number(item?.allocation_status?.id) === 3

    )

  ) {

    return 'Accepted'

  }

  if (

    children.some(

      (item: any) =>

        Number(item?.allocation_status?.id) === 4

    )

  ) {

    return 'Allocated'

  }

  if (

    children.some(

      (item: any) =>

        Number(item?.allocation_status?.id) === 5

    )

  ) {

    return 'Rejected'

  }

  return 'Not Review'

}

const sortByStatus = (data: any[]) => {
  return [...data].sort((a, b) => {
    const aOrder = statusOrder[a?.allocation_status_name] ?? 999
    const bOrder = statusOrder[b?.allocation_status_name] ?? 999
    return aOrder - bOrder
  })
}

/**
 * เพิ่ม field ที่ใช้ sort แต่ไม่ได้อยู่ใน response โดยตรง
 * เช่น allocation_status_name ของ parent และ child
 */
// const transformDataForSort = (data: any[]) => {
//   return (Array.isArray(data) ? data : []).map((item: any) => ({
//     ...item,
//     allocation_status_name: item?.allocation_status_name ?? item?.data?.[0]?.allocation_status?.name ?? 'Not Review',
//     data: Array.isArray(item?.data)
//       ? item.data.map((child: any) => ({
//           ...child,
//           allocation_status_name: child?.allocation_status_name ?? child?.allocation_status?.name ?? 'Not Review'
//         }))
//       : item?.data
//   }))
// }

const sortAllocationStatus = (
  data: any[],
  direction: SortDirection
) => {
  const getStatusName = (item: any) => {
    return String(
      item?.allocation_status_name ??
      item?.allocation_status?.name ??
      'Not Review'
    ).trim()
  }

  const compareStatus = (statusA: string, statusB: string) => {
    const result = statusA.localeCompare(
      statusB,
      undefined,
      {
        numeric: true,
        sensitivity: 'base'
      }
    )

    return direction === 'asc'
      ? result
      : -result
  }

  // เรียงข้อมูลลูกในแต่ละ Parent
  const dataWithSortedChildren = (
    Array.isArray(data) ? data : []
  ).map((parent: any) => ({
    ...parent,

    data: Array.isArray(parent?.data)
      ? [...parent.data].sort((a: any, b: any) =>
          compareStatus(
            getStatusName(a),
            getStatusName(b)
          )
        )
      : []
  }))

  // เรียง Parent ตาม Status ที่แสดงในแถวสีเขียว
  return dataWithSortedChildren.sort(
    (a: any, b: any) =>
      compareStatus(
        getStatusName(a),
        getStatusName(b)
      )
  )
}

const transformDataForSort = (data: any[]) => {
  return (Array.isArray(data) ? data : []).map(
    (item: any) => ({
      ...item,

      // ชั้นนอกมี field นี้อยู่แล้ว
      shipper_allocation_review:
        item?.shipper_allocation_review ?? null,

      allocation_status_name:
        getParentStatusName(item?.data),

      data: Array.isArray(item?.data)
        ? item.data.map((child: any) => ({
            ...child,

            allocation_status_name:
              child?.allocation_status_name ??
              child?.allocation_status?.name ??
              'Not Review',

            /*
             * สร้าง field แบนให้ Child
             * เพื่อให้ handleSort dataInOut อ่านได้เหมือน Parent
             */
            shipper_allocation_review:
              child?.shipper_allocation_review ??
              child
                ?.allocation_management_shipper_review?.[0]
                ?.shipper_allocation_review ??
              null
          }))
        : []
    })
  )
}


type SortDirection = 'asc' | 'desc'

const isEmptySortValue = (value: any) => {
  return (
    value === null ||
    value === undefined ||
    String(value).trim() === ''
  )
}

const compareSortValues = (
  valueA: any,
  valueB: any,
  direction: SortDirection
) => {
  const cleanA =
    valueA === null || valueA === undefined
      ? ''
      : String(valueA)
          .trim()
          .replace(/\s+/g, ' ')

  const cleanB =
    valueB === null || valueB === undefined
      ? ''
      : String(valueB)
          .trim()
          .replace(/\s+/g, ' ')

  const emptyA = cleanA === ''
  const emptyB = cleanB === ''

  if (emptyA && emptyB) {
    return 0
  }

  /*
   * asc  : ค่าจริงอยู่บน null อยู่ล่าง
   * desc : null อยู่บน ค่าจริงอยู่ล่าง
   */
  if (emptyA) {
    return direction === 'asc' ? 1 : -1
  }

  if (emptyB) {
    return direction === 'asc' ? -1 : 1
  }

  const numericA = Number(
    cleanA.replace(/,/g, '')
  )

  const numericB = Number(
    cleanB.replace(/,/g, '')
  )

  let result: number

  if (
    !Number.isNaN(numericA) &&
    !Number.isNaN(numericB)
  ) {
    result = numericA - numericB
  } else {
    result = cleanA.localeCompare(
      cleanB,
      undefined,
      {
        numeric: true,
        sensitivity: 'base'
      }
    )
  }

  return direction === 'asc'
    ? result
    : -result
}

const sortChildrenByAccessor = (
  data: any[],
  direction: SortDirection,
  getValue: (child: any) => any
) => {
  return (Array.isArray(data) ? data : []).map(
    (parent: any) => ({
      ...parent,

      // เรียงเฉพาะข้อมูลข้างใน Parent
      data: Array.isArray(parent?.data)
        ? [...parent.data].sort((a: any, b: any) => {
            return compareSortValues(
              getValue(a),
              getValue(b),
              direction
            )
          })
        : []
    })
  )
}
const childSortAccessors: Record<
  string,
  (child: any) => any
> = {
  'data.contract': (child: any) =>
    child?.contract ??
    child?.contract_code?.contract_code ??
    child?.contract_code_text,

  'data.review_code': (child: any) =>
  child?.review_code ??
  child?.reviewCode ??
  child?.data?.review_code ??
  child?.data?.reviewCode ??
  null,

  'data.group.name': (child: any) =>
    child?.group?.name,

  'data.point': (child: any) =>
    child?.point,

  'data.entry_exit': (child: any) =>
    child?.entry_exit_obj?.name ??
    child?.entry_exit,

  'data.nominationValue': (child: any) =>
    child?.nominationValue,

  'data.systemAllocation': (child: any) =>
    child?.systemAllocation,

  'data.intradaySystem': (child: any) =>
    child?.intradaySystem,

  'data.previousAllocationTPAforReview': (child: any) =>
    child?.previousAllocationTPAforReview,

  // 'data.shipperAllocationReview': (child: any) =>
  //   child?.allocation_management_shipper_review?.[0]?.shipper_allocation_review
    // 'dataInOut.shipper_allocation_review': (child: any) => child?.allocation_management_shipper_review?.[0]?.shipper_allocation_review ?? null
    // 'data.shipper_allocation_review': (child: any) => child?.allocation_management_shipper_review?.[0]?.shipper_allocation_review ?? null
  // 'data.shipperAllocationReview': (child: any) =>
  //   child?.systemAllocation
}

const TableAlloManage: React.FC<TableProps> = ({checkedData, setcheckedData, filteredDataTable, setFilteredDataTable, openEditForm, openViewForm, tableData, isLoading, columnVisibility, userPermission, selectedItem, setselectedItem, openHistoryForm, openReasonModal, sortedData, setSortedData}) => {
  const [tk, settk] = useState<boolean>(true)
  const [sortState, setSortState] = useState<{
    column: string | null
    direction: 'asc' | 'desc' | null
  }>({column: null, direction: null})

  // ข้อมูล 10 แถวของหน้าปัจจุบัน หลัง transform
  const [sortedDataTransform, setSortedDataTransform] = useState(tableData)
  const [toggleData, settoggleData] = useState<any>()

  /**
   * เก็บข้อมูลทั้งหมดก่อน sort ไว้สำหรับ:
   * 1. sort asc/desc จากข้อมูลต้นฉบับทั้งหมด
   * 2. คืนลำดับเดิมเมื่อกด sort รอบที่ 3
   */
  const originalFilteredDataRef = useRef<any[]>([])

  /**
   * ป้องกัน useEffect ด้านล่างไม่ให้เอาผลลัพธ์หลัง sort
   * ไปทับข้อมูลต้นฉบับใน originalFilteredDataRef
   */
  const isSortUpdateRef = useRef(false)

  useEffect(() => {
    if (isSortUpdateRef.current) {
      isSortUpdateRef.current = false
      return
    }

    originalFilteredDataRef.current = Array.isArray(filteredDataTable) ? [...filteredDataTable] : []

    // เมื่อ Search/Filter ใหม่ ให้ reset icon sort
    setSortState({column: null, direction: null})
  }, [filteredDataTable])

  /**
   * Sort ข้อมูลทั้งหมดก่อน pagination รองรับครบทั้ง:
   * - dataInOut.xxx
   * - data.xxx
   * - field ปกติ เช่น point_text, allocation_status_name
   */
//   const handleSortAll = (column: string) => {
//     if (typeof setFilteredDataTable !== 'function') return

//     const originalData = originalFilteredDataRef.current.length > 0 ? originalFilteredDataRef.current : Array.isArray(filteredDataTable) ? filteredDataTable : []

//     // allocation_status_name เป็น field ที่สร้างเพิ่ม จึงต้อง transform
//     // ข้อมูลทั้งหมดก่อนส่งเข้า handleSort
//     const sourceData = transformDataForSort(originalData)

//     isSortUpdateRef.current = true

//     handleSort(column, sortState, setSortState, setFilteredDataTable, sourceData)
//   }

const handleSortAll = (column: string) => {
  if (typeof setFilteredDataTable !== 'function') {
    return
  }

  const originalData =
    originalFilteredDataRef.current.length > 0
      ? originalFilteredDataRef.current
      : Array.isArray(filteredDataTable)
        ? filteredDataTable
        : []

  const sourceData = transformDataForSort(originalData)

  const childAccessor = childSortAccessors[column]

  const isCustomSort =
    column === 'allocation_status_name' ||
    Boolean(childAccessor)

  /*
   * Status และ Column ลูกทั้งหมด
   * จัดการ direction ที่นี่เพียงครั้งเดียว
   */
  if (isCustomSort) {
    let direction: 'asc' | 'desc' | null = 'asc'

    if (sortState.column === column) {
      direction =
        sortState.direction === 'asc'
          ? 'desc'
          : sortState.direction === 'desc'
            ? null
            : 'asc'
    }

    setSortState({
      column,
      direction
    })

    isSortUpdateRef.current = true

    // กดรอบที่ 3 คืนลำดับเดิม
    if (!direction) {
      setFilteredDataTable(
        transformDataForSort([...originalData])
      )
      return
    }

    // Sort Status ของ Parent
    if (column === 'allocation_status_name') {
      const sorted = sortAllocationStatus(
        sourceData,
        direction
      )

      setFilteredDataTable(sorted)
      return
    }

    // Sort ข้อมูลลูกด้วย accessor ใน Map
    if (childAccessor) {
        // เรียงข้อมูลทั้งหมด เพื่อให้ Pagination ใช้ข้อมูลที่เรียงแล้ว
        const sortedAll = sortChildrenByAccessor(
            sourceData,
            direction,
            childAccessor
        )

        setFilteredDataTable(sortedAll)

        /*
        * เรียงข้อมูลหน้าปัจจุบันโดยตรงด้วย
        * เพราะการเรียงเฉพาะ child ไม่ได้เปลี่ยนลำดับ Parent
        * Pagination จึงอาจไม่สร้าง tableData ใหม่
        */
        const sortedCurrentPage = sortChildrenByAccessor(
            Array.isArray(tableData) ? tableData : [],
            direction,
            childAccessor
        )

        const transformedCurrentPage =
            transformDataForSort(sortedCurrentPage)

        setSortedData(transformedCurrentPage)
        setSortedDataTransform(transformedCurrentPage)

        return
        }
  }

  /*
   * Column ระดับ Parent หรือ Column ที่ handleSort เดิมรองรับ
   */
  isSortUpdateRef.current = true

  handleSort(
    column,
    sortState,
    setSortState,
    setFilteredDataTable,
    sourceData
  )
}

useEffect(() => {
  if (!Array.isArray(tableData) || tableData.length === 0) {
    setSortedData([])
    setSortedDataTransform([])
    return
  }

  /*
   * ข้อมูลหน้าปัจจุบัน
   */
  let transformed = transformDataForSort(tableData)

  /*
   * ข้อมูลทั้งหมดก่อน Pagination
   * ใช้สร้าง toggleData และ checkedData
   */
  const transformedAll = transformDataForSort(
    Array.isArray(filteredDataTable)
      ? filteredDataTable
      : []
  )

  /*
   * เมื่อ Pagination ส่งข้อมูลหน้าใหม่มา
   * ต้องเรียง Child ของหน้านั้นตาม Sort ปัจจุบัน
   */
  if (
    sortState.column &&
    sortState.direction &&
    childSortAccessors[sortState.column]
  ) {
    transformed = sortChildrenByAccessor(
      transformed,
      sortState.direction,
      childSortAccessors[sortState.column]
    )
  }

  /*
   * Status ใช้ Sorter แยก
   */
  if (
    sortState.column === 'allocation_status_name' &&
    sortState.direction
  ) {
    transformed = sortAllocationStatus(
      transformed,
      sortState.direction
    )
  }

  /*
   * ตารางแสดงเฉพาะหน้าปัจจุบัน
   */
  // setSortedDataTransform(transformed)
  // setSortedData(transformed)
  // setcheckedAll(false)
  setSortedDataTransform(transformed)
  setSortedData(transformed)

  /*
   * Toggle ต้องสร้างจากข้อมูลทั้งหมด
   * และรักษาค่า toggle เดิมไว้
   */
  settoggleData((previousToggle: any[] = []) => {
    const previousToggleMap = new Map(
      previousToggle.map((item: any) => [
        item?.id,
        item?.toggle
      ])
    )

    return transformedAll.map((row: any) => ({
      id: row?.id,
      toggle:
        previousToggleMap.get(row?.id) ??
        false
    }))
  })

  /*
   * Checkbox ควรสร้างจากข้อมูลทั้งหมดเหมือนกัน
   * และรักษาค่า checked เดิมไว้
   */
  setcheckedData((previousChecked: any[] = []) => {
    const previousParentMap = new Map(
      previousChecked.map((item: any) => [
        item?.id,
        item
      ])
    )

    return transformedAll
      .filter(
        (row: any) =>
          Array.isArray(row?.data) &&
          row.data.length > 0
      )
      .map((row: any) => {
        const previousParent =
          previousParentMap.get(row?.id)

        const previousChildMap = new Map(
          (previousParent?.data ?? []).map(
            (child: any) => [
              child?.id,
              child?.checked
            ]
          )
        )

        return {
          id: row?.id,

          checked:
            previousParent?.checked ??
            false,

          allocation_status: row?.status,

          data: row.data.map((sub: any) => ({
            parent: row?.id,
            id: sub?.id,
            allocation_status:
              sub?.allocation_status,

            checked:
              previousChildMap.get(sub?.id) ??
              false
          }))
        }
      })
  })
}, [
  tableData,
  filteredDataTable,
  sortState.column,
  sortState.direction
])


const getArrowIcon = (column: string) => {
    return (
      <div className={`${table_col_arrow_sort_style}`}>
        <ArrowDropUpIcon sx={{fontSize: 18, opacity: sortState.column === column && sortState.direction === 'asc' ? 1 : 0.4}} />
        <ArrowDropDownIcon sx={{fontSize: 18, opacity: sortState.column === column && sortState.direction === 'desc' ? 1 : 0.4}} />
      </div>
    )
  }

  const [openPopoverId, setOpenPopoverId] = useState(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const togglePopover = (id: any) => {
    if (openPopoverId === id) {
      setOpenPopoverId(null) // Close the popover if it's already open
    } else {
      setOpenPopoverId(id) // Open the popover for the clicked row
    }
  }

  const toggleMenu = (mode: any, id: any) => {
    switch (mode) {
      case 'history':
        openHistoryForm(id)
        setOpenPopoverId(null)
        break
    }
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
      setOpenPopoverId(null)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [popoverRef])

  const renderStatus: any = (data: any) => {
    let items: any = [
      {
        id: 0,
        label: 'Shipper Reviewed',
        color: '#D0E5FD'
      },
      {
        id: 1,
        label: 'Accepted',
        color: '#C8FFD7'
      },
      {
        id: 2,
        label: 'Allocated',
        color: '#A7EFFF'
      },
      {
        id: 3,
        label: 'Rejected',
        color: '#FFF1CE'
      },
      {
        id: 4,
        label: 'Not Review',
        color: '#DEDEDE'
      }
    ]

    // let m11: any = data?.filter((item: any) => item?.allocation_status?.id == 2); //shipper
    // let m13: any = data?.filter((item: any) => item?.allocation_status?.id == 3); //accepted
    // let m14: any = data?.filter((item: any) => item?.allocation_status?.id == 4); //allowcated
    // let m12: any = data?.filter((item: any) => item?.allocation_status?.id == 5); //rejected
    let m11: any = data?.filter((item: any) => item?.allocation_status?.id == 2) //shipper
    let m12: any = data?.filter((item: any) => item?.allocation_status?.id == 3) //accepted
    let m13: any = data?.filter((item: any) => item?.allocation_status?.id == 4) //allowcated
    let m14: any = data?.filter((item: any) => item?.allocation_status?.id == 5) //rejected

    let renderColor: any = m11?.length > 0 ? items[0]?.color : m12?.length > 0 ? items[1]?.color : m13?.length > 0 ? items[2]?.color : m14?.length > 0 ? items[3]?.color : items[4]?.color
    let renderTxt: any = m11?.length > 0 ? items[0]?.label : m12?.length > 0 ? items[1]?.label : m13?.length > 0 ? items[2]?.label : m14?.length > 0 ? items[3]?.label : items[4]?.label

    return (
      <div className="w-[160px] p-1 text-center rounded-[50px]" style={{background: renderColor}}>
        {renderTxt}
      </div>
    )
  }

  // const [checkedAll, setcheckedAll] = useState<boolean>(false)
  const SELECTABLE_STATUS = [2, 3, 5]

  const currentPageCheckedState = useMemo(() => {
    const currentRows = Array.isArray(sortedDataTransform)
      ? sortedDataTransform
      : []

    const currentParentIds = new Set(
      currentRows.map((row: any) => row?.id)
    )

    const currentPageParents = (checkedData ?? []).filter(
      (parent: any) =>
        currentParentIds.has(parent?.id)
    )

    const selectableChildren = currentPageParents.flatMap(
      (parent: any) =>
        (parent?.data ?? []).filter((child: any) =>
          SELECTABLE_STATUS.includes(
            Number(child?.allocation_status?.id)
          )
        )
    )

    const totalSelectable = selectableChildren.length

    const totalChecked = selectableChildren.filter(
      (child: any) => child?.checked === true
    ).length

    return {
      // ต้องเลือกครบเท่านั้นถึงจะเป็น true
      checked:
        totalSelectable > 0 &&
        totalChecked === totalSelectable,

      disabled: totalSelectable === 0
    }
  }, [sortedDataTransform, checkedData])

  const renderCheckedAll = (
  checked: boolean,
  mode: 'clickAll' | 'checkAll'
) => {
  if (mode === 'clickAll') {
    const currentParentIds = new Set(
      (sortedDataTransform ?? []).map(
        (row: any) => row?.id
      )
    )

    /*
     * ID ของ Parent และ Child ที่สามารถเลือกได้
     * เฉพาะหน้าปัจจุบัน
     */
    const selectableParentIds = new Set<any>()
    const selectableChildIds = new Set<any>()

    ;(checkedData ?? []).forEach((parent: any) => {
      if (!currentParentIds.has(parent?.id)) {
        return
      }

      const validChildren = (parent?.data ?? []).filter(
        (child: any) =>
          SELECTABLE_STATUS.includes(
            Number(child?.allocation_status?.id)
          )
      )

      if (validChildren.length > 0) {
        selectableParentIds.add(parent?.id)

        validChildren.forEach((child: any) => {
          selectableChildIds.add(child?.id)
        })
      }
    })

    /*
     * Update checkedData แบบ immutable
     * และไม่กระทบ checkbox ของหน้าอื่น
     */
    setcheckedData((previous: any[] = []) =>
      previous.map((parent: any) => {
        if (!currentParentIds.has(parent?.id)) {
          return parent
        }

        const updatedChildren = (parent?.data ?? []).map(
          (child: any) => {
            const canSelect =
              SELECTABLE_STATUS.includes(
                Number(child?.allocation_status?.id)
              )

            return canSelect
              ? {
                  ...child,
                  checked
                }
              : child
          }
        )

        const selectableChildren =
          updatedChildren.filter((child: any) =>
            SELECTABLE_STATUS.includes(
              Number(child?.allocation_status?.id)
            )
          )

        return {
          ...parent,

          checked:
            selectableChildren.length > 0 &&
            selectableChildren.every(
              (child: any) => child?.checked
            ),

          data: updatedChildren
        }
      })
    )

    /*
     * รักษารายการ selectedItem ของหน้าอื่นไว้
     * แก้เฉพาะรายการหน้าปัจจุบัน
     */
    setselectedItem((previous: any[] = []) => {
      const remainingOtherPages = previous.filter(
        (selected: any) => {
          if (selected?.parent === true) {
            return !selectableChildIds.has(selected?.id)
          }

          return !selectableParentIds.has(selected?.id)
        }
      )

      if (!checked) {
        return remainingOtherPages
      }

      const currentPageSelections: any[] = []

      selectableParentIds.forEach((id: any) => {
        currentPageSelections.push({ id })
      })

      selectableChildIds.forEach((id: any) => {
        currentPageSelections.push({
          id,
          parent: true
        })
      })

      return [
        ...remainingOtherPages,
        ...currentPageSelections
      ]
    })

    settk((previous) => !previous)
    return
  }

  /*
   * ไม่ต้อง set checkedAll แล้ว
   * เพราะ Header checkbox คำนวณจาก checkedData อัตโนมัติ
   */
  if (mode === 'checkAll') {
    settk((previous) => !previous)
  }
}

  // const renderCheckedAll: any = (checked: any, mode: 'clickAll' | 'checkAll') => {
  //   // 2 = shipper review
  //   // 3 = accepted
  //   // 4 = allowcated
  //   // 5 = rejected

  //   if (mode === 'clickAll') {
  //     let checkFirst: any = [...checkedData] // clone กัน state เพี้ยน

  //     const result: any[] = []

  //     for (let i1 = 0; i1 < checkFirst.length; i1++) {
  //       let hasValidChild = false

  //       for (let i2 = 0; i2 < checkFirst[i1]?.data?.length; i2++) {
  //         const child = checkFirst[i1].data[i2]
  //         const statusId = Number(child?.allocation_status?.id)

  //         if ([2, 3, 5].includes(statusId)) {
  //           hasValidChild = true

  //           // ✅ update checked
  //           checkFirst[i1].data[i2].checked = checked

  //           // ✅ เก็บ result เฉพาะตอน checked = true
  //           if (checked) {
  //             result.push({
  //               id: child.id,
  //               parent: true
  //             })
  //           }
  //         }
  //       }

  //       if (hasValidChild) {
  //         checkFirst[i1].checked = checked

  //         // ✅ push parent
  //         if (checked) {
  //           result.push({id: checkFirst[i1].id})
  //         }
  //       }
  //     }

  //     // ✅ set state ทีเดียว
  //     setselectedItem(checked ? result : [])
  //     setcheckedAll(checked)
  //   } else if (mode == 'checkAll') {
  //     if (checkedAll !== checked) {
  //       let checkFirst: any = checkedData
  //       let checkResult: any = []
  //       for (let i1 = 0; i1 < checkFirst?.length; i1++) {
  //         // let checkedShipper: any = checkFirst[i1]?.data?.filter((item: any) => item?.allocation_status?.id == 2);
  //         let checkedShipper: any = checkFirst[i1]?.data?.filter((item: any) => item?.allocation_status?.id == 2 || item?.allocation_status?.id == 3 || item?.allocation_status?.id == 5)
  //         if (checkedShipper?.length > 0) {
  //           for (let i2 = 0; i2 < checkFirst[i1]?.data?.length; i2++) {
  //             // if (checkFirst[i1]?.data[i2]?.allocation_status?.id == 2 && checkFirst[i1].data[i2].checked !== checked) {
  //             if ((checkFirst[i1]?.data[i2]?.allocation_status?.id == 2 || checkFirst[i1]?.data[i2]?.allocation_status?.id == 3 || checkFirst[i1]?.data[i2]?.allocation_status?.id == 5) && checkFirst[i1].data[i2].checked !== checked) {
  //               checkResult.push({
  //                 id: checkFirst[i1]?.data[i2]?.id,
  //                 checked: checkFirst[i1]?.data[i2]?.checked
  //               })
  //             }
  //           }
  //         }
  //       }

  //       if (checkResult?.length == 0) {
  //         setcheckedAll(checked)
  //       }
  //     }
  //   }
  //   settk(!tk)
  // }

//   const genManoStatus = (data: any[]) => {
//     // ถ้ากำลัง sort ข้อมูลลูก ให้ใช้ลำดับที่ handleSort เรียงมาแล้ว
//     const isChildSort = sortState.column?.startsWith('dataInOut.') || sortState.column?.startsWith('data.')

//     if (isChildSort && sortState.direction !== null) {
//       return data
//     }

//     const priority = ['Shipper Reviewed', 'Accepted', 'Allocated', 'Rejected', 'Not Review']

//     // clone ก่อน sort เพื่อไม่แก้ state โดยตรง
//     return [...data].sort((a: any, b: any) => {
//       const indexA = priority.indexOf(a.allocation_status_name)
//       const indexB = priority.indexOf(b.allocation_status_name)

//       const priorityA = indexA === -1 ? 999 : indexA
//       const priorityB = indexB === -1 ? 999 : indexB

//       return priorityA - priorityB
//     })
//   }

const genManoStatus = (data: any[]) => {
  const hasActiveSort =
    Boolean(sortState.column) &&
    sortState.direction !== null

  const isChildSort =
    sortState.column?.startsWith('dataInOut.') ||
    sortState.column?.startsWith('data.') ||
    sortState.column === 'allocation_status_name'

  /*
   * ถ้ากำลัง Sort Column ลูกหรือ Status
   * ให้ใช้ลำดับที่ handleSortAll เรียงมาแล้ว
   */
  if (hasActiveSort && isChildSort) {
    return data
  }

  // ลำดับเริ่มต้นตอนยังไม่ได้กด Sort
  const priority = [
    'Shipper Reviewed',
    'Accepted',
    'Allocated',
    'Rejected',
    'Not Review'
  ]

  return [...(Array.isArray(data) ? data : [])].sort(
    (a: any, b: any) => {
      const statusA =
        a?.allocation_status_name ??
        a?.allocation_status?.name ??
        'Not Review'

      const statusB =
        b?.allocation_status_name ??
        b?.allocation_status?.name ??
        'Not Review'

      const indexA = priority.indexOf(statusA)
      const indexB = priority.indexOf(statusB)

      const priorityA = indexA === -1 ? 999 : indexA
      const priorityB = indexB === -1 ? 999 : indexB

      return priorityA - priorityB
    }
  )
}

  useEffect(() => {
    console.log('filteredDataTable : ', filteredDataTable)
  }, [filteredDataTable])

  useEffect(() => {
    console.log('sortedData : ', sortedData)
  }, [sortedData])

  useEffect(() => {
    console.log('tableData : ', tableData)
  }, [tableData])

  useEffect(() => {
    console.log('toggleData : ', toggleData)
  }, [toggleData])

  return (
    <div className="h-[calc(100vh-380px)] overflow-y-auto overflow-x-auto rounded-t-md">
      {isLoading ? (
        <table className="table-auto min-w-full text-sm rtl:text-right text-gray-500 whitespace-nowrap">
          <thead className="text-xs text-[#ffffff] sticky top-0 z-10">
            <tr className="h-9">
              {columnVisibility?.total && (
                <th scope="col" className={`${table_header_style} bg-[#1473A1]`}>
                  <div className="flex justify-center items-center">
                    {/* <input type="checkbox" onChange={(e) => renderCheckedAll(e?.target?.checked, 'clickAll')} checked={checkedAll} className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1] disabled:opacity-100 disabled:cursor-not-allowed " /> */}
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        renderCheckedAll(
                          e.target.checked,
                          'clickAll'
                        )
                      }
                      checked={currentPageCheckedState.checked}
                      disabled={currentPageCheckedState.disabled}
                      className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1] disabled:opacity-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </th>
              )}
              {columnVisibility?.status && (
                <th
                  scope="col"
                  className={`${table_sort_header_style} text-center bg-[#1473A1]`}
                  // onClick={() => handleSort("data.allocation_status.name", sortState, setSortState, setSortedData, tableData)}
                  // onClick={() => handleSortAllocMgn(
                  //     // "data.allocation_status.name", // path
                  //     "data?.allocation_status_name", // path
                  //     sortState,
                  //     setSortState,
                  //     setSortedData,
                  //     // tableData,
                  //     sortedDataTransform,
                  //     "first" // ใช้ค่าของ sub-row ตัวแรก
                  // )}
                  onClick={() => handleSortAll('allocation_status_name')}
                >
                  {`Status`}
                  {/* {getArrowIcon("data.allocation_status.name")} */}
                  {/* {getArrowIcon("data.allocation_status_name")} */}
                  {getArrowIcon('allocation_status_name')}
                </th>
              )}
              {columnVisibility?.gas_day && (
                <th
                  scope="col"
                  className={`${table_sort_header_style} bg-[#1473A1]`}
                  // onClick={() => handleSort("data.gas_day", sortState, setSortState, setSortedData, tableData)}
                  // onClick={() => handleSort("data.gas_day", sortState, setSortState, setSortedData, sortedDataTransform)}
                  // onClick={() => handleSort("data.gas_day", sortState, setSortState, setSortedData, sortedDataTransform)}
                  onClick={() => handleSortAll('dataInOut.gas_day')}
                >
                  {`Gas Day`}
                  {getArrowIcon('dataInOut.gas_day')}
                </th>
              )}
              {columnVisibility?.shipper && (
                <th
                  scope="col"
                  className={`${table_sort_header_style} bg-[#1473A1]`}
                  // onClick={() => handleSort("data.group.name", sortState, setSortState, setSortedData, tableData)}
                  onClick={() => handleSortAll('data.group.name')}
                >
                  {`Shipper Name`}
                  {getArrowIcon('data.group.name')}
                </th>
              )}
              {columnVisibility?.contract && (
                <th
                  scope="col"
                  className={`${table_sort_header_style} text-center bg-[#1473A1]`}
                  // onClick={() => handleSort("data.contract_code.contract_code", sortState, setSortState, setSortedData, tableData)}
                //   onClick={() => handleSortAll('data.contract_code.contract_code')}
                  onClick={() => handleSortAll('data.contract')}
                >
                  {`Contract Code`}
                  {/* {getArrowIcon('data.contract_code.contract_code')} */}
                  {getArrowIcon('data.contract')}
                </th>
              )}
              {columnVisibility?.nompoint && (
                <th
                  scope="col"
                  className={`${table_sort_header_style} py-5 bg-[#1473A1]`}
                  // onClick={() => handleSort("point_text", sortState, setSortState, setSortedData, tableData)}
                  onClick={() => handleSortAll('point_text')}
                >
                  <div>{`Nomination Point /`}</div>
                  <div className="mt-[5px]">{`Concept Point`}</div>
                  {getArrowIcon('point_text')}
                </th>
              )}
              {/* https://app.clickup.com/t/9018502823/86eub6dbb */}
              {columnVisibility?.entryexit && (
                <th
                  scope="col"
                  className={`${table_sort_header_style} text-center bg-[#1473A1]`}
                  onClick={() => handleSortAll('entry_exit')}
                >
                  {`Entry / Exit`}
                  {getArrowIcon('entry_exit')}
                </th>
              )}
              {columnVisibility?.nominatedval && (
                <th
                  scope="col"
                  className={`${table_sort_header_style} py-5 bg-[#1473A1]`}
                  // onClick={() => handleSort("data.nominationValue", sortState, setSortState, setSortedData, tableData)}
                  // onClick={() => handleSort("data.nominationValue", sortState, setSortState, setSortedData, sortedDataTransform)}
                  // onClick={() => handleSort("nomination_value", sortState, setSortState, setSortedData, sortedDataTransform)}
                  onClick={() => handleSortAll('dataInOut.nomination_value')}
                  // onClick={() => handleSort("nomination_value", sortState, setSortState, setSortedData, filteredDataTable)}
                  // filteredDataTable, setFilteredDataTable
                >
                  <div>{`Nominated Value`}</div>
                  <div className="mt-[5px]">{`(MMBTU/D)`}</div>
                  {/* {getArrowIcon("data.nominationValue")} */}
                  {getArrowIcon('dataInOut.nomination_value')}
                </th>
              )}
              {columnVisibility?.system_allo && (
                <th
                  scope="col"
                  className={`${table_sort_header_style} py-5 bg-[#1473A1]`}
                  // onClick={() => handleSort("data.systemAllocation", sortState, setSortState, setSortedData, tableData)}
                  // onClick={() => handleSort("system_allocation", sortState, setSortState, setSortedData, tableData)}
                  onClick={() => handleSortAll('dataInOut.system_allocation')}
                >
                  <div>{`System Allocation`}</div>
                  <div className="mt-[5px]">{`(MMBTU/D)`}</div>
                  {/* {getArrowIcon("data.systemAllocation")} */}
                  {getArrowIcon('dataInOut.system_allocation')}
                </th>
              )}
              {columnVisibility?.intraday_allo && (
                <th
                  scope="col"
                  className={`${table_sort_header_style} py-5 bg-[#1473A1]`}
                  // onClick={() => handleSort("data.intradaySystem", sortState, setSortState, setSortedData, tableData)}
                  // onClick={() => handleSort("data.intradaySystem", sortState, setSortState, setSortedData, sortedDataTransform)}
                  onClick={() => handleSortAll('dataInOut.intraday_system')}
                >
                  <div>{`Intraday System Allocation`}</div>
                  <div className="mt-[5px]">{`(MMBTU/D)`}</div>
                  {/* {getArrowIcon("data.intradaySystem")} */}
                  {getArrowIcon('dataInOut.intraday_system')}
                </th>
              )}
              {columnVisibility?.previous_allo && (
                <th
                  scope="col"
                  className={`${table_sort_header_style} py-5 bg-[#B8E6FE] text-[#1473A1] hover:text-[#ffffff]`}
                  // onClick={() => handleSort("data.previousAllocationTPAforReview", sortState, setSortState, setSortedData, tableData)}
                  // onClick={() => handleSort("previous_allocation_tpa_for_review", sortState, setSortState, setSortedData, tableData)}
                  onClick={() => handleSortAll('dataInOut.previous_allocation_tpa_for_review')}
                >
                  <div>{`Previous Allocation`}</div>
                  <div className="mt-[5px]">{`(MMBTU/D)`}</div>
                  {getArrowIcon('dataInOut.previous_allocation_tpa_for_review')}
                </th>
              )}
              {columnVisibility?.shipper_allo && (
                <th
                  scope="col"
                  className={`${table_sort_header_style} py-1 bg-[#B8E6FE] text-[#1473A1] hover:text-[#ffffff]`}
                  // onClick={() => handleSort("data.shipperAllocationReview", sortState, setSortState, setSortedData, tableData)}
                  // onClick={() => handleSort("shipper_allocation_review", sortState, setSortState, setSortedData, tableData)}
                  onClick={() => handleSortAll('dataInOut.shipper_allocation_review')}
                  // allocation_management_shipper_review?.[0]?.shipper_allocation_review
                >
                  <div>{`Shipper Allocation Review`}</div>
                  <div className="mt-[5px]">{`(MMBTU/D)`}</div>
                  {getArrowIcon('dataInOut.shipper_allocation_review')}
                </th>
              )}
              {columnVisibility?.metering_allo && (
                <th
                  scope="col"
                  className={`${table_sort_header_style} py-1 bg-[#B8E6FE] text-[#1473A1] hover:text-[#ffffff]`}
                  // onClick={() => handleSort("data.meteringValue", sortState, setSortState, setSortedData, tableData)}
                  // onClick={() => handleSort("metering_value", sortState, setSortState, setSortedData, tableData)}
                  onClick={() => handleSortAll('dataInOut.metering_value')}
                >
                  {`Metering Value (MMBTU/D)`}
                  {getArrowIcon('dataInOut.metering_value')}
                </th>
              )}
              {columnVisibility?.review && (
                <th
                  scope="col"
                  className={`${table_sort_header_style} py-1 bg-[#B8E6FE] text-[#1473A1] hover:text-[#ffffff]`}
                  // onClick={() => handleSort("data.reviewCode", sortState, setSortState, setSortedData, tableData)}
                //   onClick={() => handleSortAll('data.reviewCode')}
                  onClick={() => handleSortAll('data.review_code')}
                >
                  {`Review Code`}
                  {/* {getArrowIcon('data.reviewCode')} */}
                  {getArrowIcon('data.review_code')}
                </th>
              )}
              {columnVisibility?.comment && (
                <th scope="col" className={`${table_header_style} py-1 bg-[#B8E6FE] text-[#1473A1]`}>
                  {`Comment`}
                </th>
              )}
              {columnVisibility?.action && (
                <th scope="col" className="px-2 py-1 text-center bg-[#1473A1]">
                  {`Action`}
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {sortedData &&
              sortedData?.map((row: any, key: any) => {
                // console.log('-_ : ', ((row?.data?.length > 0 && genManoStatus(row?.data)) || [])); 
                // console.log('_ : ', ((row?.data?.length > 0 && genManoStatus(row?.data)) || [])?.filter((f:any) => f?.shipper_allocation_review !== null));
                // console.log(((row?.data?.length > 0 && genManoStatus(row?.data)) || []));
                // console.log((((row?.data?.length > 0 && genManoStatus(row?.data)) || [])?.filter((f:any) => f?.shipper_allocation_review !== null)?.length === 0));
                // console.log('- : ', (((row?.data?.length > 0 && genManoStatus(row?.data)) || [])?.filter((f:any) => f?.shipper_allocation_review !== null)?.length === 0)
                //             ? "" : // https://app.clickup.com/t/9018502823/86ev29x2b
                //           (row?.previous_allocation_tpa_for_review !== null && row?.previous_allocation_tpa_for_review !== undefined 
                //           ? ((row?.shipper_allocation_review !== null && row?.shipper_allocation_review !== undefined ? formatNumberFourDecimal(row?.previous_allocation_tpa_for_review) : null))  
                //           : null));
                return (
                  <>
                    <tr
                      key={'main-' + key}
                      className={`${table_row_style} !bg-[#E8FFEE] cursor-pointer`}
                      onClick={() => {
                        let toggleIDX: any = toggleData?.findIndex((item: any) => item?.id == row?.id)

                        if (toggleIDX !== -1) {
                          settoggleData((prev: any) => prev.map((item: any, index: any) => (index === toggleIDX ? {...item, toggle: !item.toggle} : item)))
                          settk((prev) => !prev)
                        }
                      }}
                    >
                      {columnVisibility?.total && (
                        // <td className="px-2 py-1 text-[#464255]">{row?.menus && row?.menus?.name}</td>
                        <td className="px-2 py-1 text-[#464255]">
                          <div className="flex gap-2">
                            <div className="cursor-pointer">{toggleData?.find((item: any) => item?.id == row?.id)?.toggle == true ? <KeyboardArrowUpIcon className="mr-[13px]" /> : <KeyboardArrowDownIcon className="mr-[13px]" />}</div>
                            <input
                              type="checkbox"
                              onClick={(e) => e.stopPropagation()} // ⛔ ใส่ไว้เพื่อตอนติ๊ก checkbox จะไม่ทำงาน onClick ของ <tr>
                              onChange={(e) => {
                                const checked = e.target.checked
                                const parentId = row?.id

                                const currentParent = checkedData?.find(
                                  (parent: any) => parent?.id === parentId
                                )

                                if (!currentParent) return

                                const selectableChildren = (
                                  currentParent?.data ?? []
                                ).filter((child: any) =>
                                  SELECTABLE_STATUS.includes(
                                    Number(child?.allocation_status?.id)
                                  )
                                )

                                const selectableChildIds = new Set(
                                  selectableChildren.map(
                                    (child: any) => child?.id
                                  )
                                )

                                /*
                                * Update checkedData แบบ immutable
                                */
                                setcheckedData((previous: any[] = []) =>
                                  previous.map((parent: any) => {
                                    if (parent?.id !== parentId) {
                                      return parent
                                    }

                                    return {
                                      ...parent,
                                      checked,
                                      data: (parent?.data ?? []).map(
                                        (child: any) => {
                                          const canSelect =
                                            SELECTABLE_STATUS.includes(
                                              Number(
                                                child?.allocation_status?.id
                                              )
                                            )

                                          return canSelect
                                            ? {
                                                ...child,
                                                checked
                                              }
                                            : child
                                        }
                                      )
                                    }
                                  })
                                )

                                /*
                                * Update selectedItem โดยไม่สร้างค่าซ้ำ
                                */
                                setselectedItem((previous: any[] = []) => {
                                  const withoutCurrentParent =
                                    previous.filter((selected: any) => {
                                      if (
                                        selected?.parent === true &&
                                        selectableChildIds.has(selected?.id)
                                      ) {
                                        return false
                                      }

                                      if (
                                        selected?.parent !== true &&
                                        selected?.id === parentId
                                      ) {
                                        return false
                                      }

                                      return true
                                    })

                                  if (!checked) {
                                    return withoutCurrentParent
                                  }

                                  return [
                                    ...withoutCurrentParent,
                                    {
                                      id: parentId
                                    },
                                    ...selectableChildren.map(
                                      (child: any) => ({
                                        id: child?.id,
                                        parent: true
                                      })
                                    )
                                  ]
                                })

                                settk((previous) => !previous)
                              }}
                              // onChange={(e) => {
                              //   const checked = e?.target?.checked

                              //   const itemChange = checkedData?.find((item: any) => item?.id == row?.id)

                              //   if (!itemChange) return

                              //   itemChange.checked = checked

                              //   // ===== PARENT =====
                              //   if (checked) {
                              //     setselectedItem((prev: any) => [...prev, {id: itemChange.id}])
                              //   } else {
                              //     setselectedItem((prev: any) => prev.filter((item: any) => item.id !== itemChange.id))
                              //   }

                              //   // ===== CHILD =====
                              //   itemChange?.data?.forEach((child: any) => {
                              //     if (child?.allocation_status?.id == 2) {
                              //       child.checked = checked

                              //       if (checked) {
                              //         setselectedItem((prev: any) => [...prev, {id: child.id, parent: true}])
                              //       } else {
                              //         setselectedItem((prev: any) => prev.filter((item: any) => !(item.id === child.id && item.parent === true)))
                              //       }
                              //     }
                              //   })

                              //   settk((prev) => !prev)
                              //   renderCheckedAll(checked, 'checkAll')
                              // }}
                              // 2 = shipper review
                              // 3 = accepted
                              // 4 = allowcated
                              // 5 = rejected

                              // disabled={tableData?.find((item: any) => item?.id == row?.id)?.data?.filter((searchitem: any) => searchitem?.allocation_status?.id == 2)?.length > 0 ? false : true}
                              // disabled={sortedDataTransform?.find((item: any) => item?.id == row?.id)?.data?.filter((searchitem: any) => searchitem?.allocation_status?.id == 2)?.length > 0 ? false : true}
                              disabled={sortedDataTransform?.find((item: any) => item?.id == row?.id)?.data?.filter((searchitem: any) => searchitem?.allocation_status?.id == 2 || searchitem?.allocation_status?.id == 3 || searchitem?.allocation_status?.id == 5)?.length > 0 ? false : true} // CR status accept / reject สามารถเปลี่ยนได้ แต่ถ้าเป็น status allocated ไม่ให้เปลี่ยนแล้ว https://app.clickup.com/t/86ev29x10
                              // checked={checkedData?.find((item: any) => item?.id == row?.id)?.checked}
                              checked={
                                checkedData?.find(
                                  (parent: any) => parent?.id === row?.id
                                )?.checked === true
                              }
                              className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1] disabled:opacity-100 disabled:cursor-not-allowed "
                            />
                            <div className="text-[#06522E] font-bold">{'Total'}</div>
                          </div>
                        </td>
                      )}

                      {columnVisibility?.status && (
                        <td className="px-2 py-1 text-[#464255]">
                          <div className="flex items-center justify-center gap-2">
                            {renderStatus(row?.data)}
                            {/* <div className="w-[160px] p-1 text-center rounded-[50px]" style={{background: row?.status ? row?.status?.color : '#FFF1CE'}}>{row?.status && row?.status?.name}</div> */}
                          </div>
                        </td>
                      )}

                      {columnVisibility?.gas_day && (
                        <td className="px-2 py-1 text-[#464255]">
                          {/* v2.0.33 รูปแบบวันที่ gas day ต้องเปลี่ยนเป็น dd/mm/yyyy ให้เหมือนเมนูอื่นๆ https://app.clickup.com/t/86etetaxc */}
                          {/* <div className="font-bold">{row?.gas_day ? row?.gas_day : null}</div> */}
                          <div className="font-bold">{row?.gas_day ? toDayjs(row?.gas_day, 'YYYY-MM-DD').format('DD/MM/YYYY') : null}</div>
                        </td>
                      )}

                      {columnVisibility?.shipper && <td className="px-2 py-1 text-[#464255]" />}

                      {columnVisibility?.contract && <td className="px-2 py-1 text-[#464255]" />}

                      {columnVisibility?.nompoint && (
                        <td className="px-2 py-1 text-[#06522E]">
                          <div className="font-bold">{row?.point_text ? row?.point_text : null}</div>
                        </td>
                      )}
                        {/* https://app.clickup.com/t/9018502823/86eub6dbb */}
                      {columnVisibility?.entryexit && row?.entry_exit ? (
                        <td className="px-2 py-1 text-[#464255]">
                          <div className="flex items-center justify-center">
                            <div className="w-[120px] p-1 text-center rounded-[50px]" style={{background: row?.entry_exit == 'Exit' ? '#FFF3C8' : '#C8FED7'}}>
                              {row?.entry_exit && row?.entry_exit}
                            </div>
                          </div>
                        </td>
                      ) : (
                        columnVisibility?.entryexit &&
                        !row?.entry_exit && (
                          <td className="px-2 py-1 text-[#464255]">
                            <div className="flex items-center justify-center">
                              <div className="w-[120px] p-1 text-center rounded-[50px]">{``}</div>
                            </div>
                          </td>
                        )
                      )}

                      {columnVisibility?.nominatedval && (
                        <td className="px-2 py-1 text-[#06522E] text-right">
                          {/* <div className="font-bold">{row?.nomination_value ? formatNumberFourDecimal(row?.nomination_value) : null}</div> */}
                          {/* <div className="font-bold">{row?.nomination_value !== null && row?.nomination_value !== undefined ? formatNumberFourDecimal(row?.nomination_value) : null}</div> */}
                          <div className="font-bold">{formatNumberFourDecimal(row?.nomination_value || 0)}</div>
                        </td>
                      )}

                      {columnVisibility?.system_allo && (
                        <td className="px-2 py-1 text-[#06522E] text-right">
                          <div className="font-bold">{row?.system_allocation !== null && row?.system_allocation !== undefined ? formatNumberFourDecimal(row?.system_allocation) : null}</div>
                        </td>
                      )}

                      {columnVisibility?.intraday_allo && (
                        <td className="px-2 py-1 text-[#06522E] text-right">
                          <div className="font-bold">{row?.intraday_system !== null && row?.intraday_system !== undefined ? formatNumberFourDecimal(row?.intraday_system) : null}</div>
                        </td>
                      )}

                      {columnVisibility?.previous_allo && (
                        <td className="px-2 py-1 text-[#06522E] text-right">
                          <div className="font-bold">{
                            (((row?.data?.length > 0 && genManoStatus(row?.data)) || [])?.filter((f:any) => f?.shipper_allocation_review !== null)?.length === 0)
                            ? "" : // https://app.clickup.com/t/9018502823/86ev29x2b
                          (row?.previous_allocation_tpa_for_review !== null && row?.previous_allocation_tpa_for_review !== undefined 
                          ? ((row?.shipper_allocation_review !== null && row?.shipper_allocation_review !== undefined ? formatNumberFourDecimal(row?.previous_allocation_tpa_for_review) : null))  
                          : null)
                          }</div>
                        </td>
                      )}

                      {columnVisibility?.shipper_allo && (
                        <td className={`px-2 py-1  ${

                          // // https://app.clickup.com/t/9018502823/86ev29x08
                          (
                            ((row?.data?.length > 0 && genManoStatus(row?.data)) || [])?.filter((f:any) => f?.shipper_allocation_review !== null)?.length === 0
                            //  === 
                            // ((row?.data?.length > 0 && genManoStatus(row?.data)) || [])?.length
                          )
                          ? "text-[#464255]"
                          : (formatNumberFourDecimal(row?.shipper_allocation_review) !== formatNumberFourDecimal(row?.metering_value) ? 'text-[#ED1B24]' : 'text-[#06522E]')
                          } text-right`}>

                          {/* 
                          // https://app.clickup.com/t/86ey6nyag 
                           */}
                          <div className="font-bold">{
                          ((row?.data?.length > 0 && genManoStatus(row?.data)) || [])?.filter((f:any) => f?.shipper_allocation_review !== null)?.length === 0
                          ? "" :
                          (row?.shipper_allocation_review !== null && row?.shipper_allocation_review !== undefined ? formatNumberFourDecimal(row?.shipper_allocation_review) : null)
                          }</div>
                        </td>
                      )}

                      {/* List : Column Metering Value จะต้องขึ้นเฉพาะที่ Row เขียว ความเป็นจริงจะไม่สามารถขึ้นตามรายสัญญาได้ มันต้องขึ้นตามราย Nom Point (ตอนนี้ค่ามันเบิ้ล) เช่น ถ้าค่า Meter มา 1000 มันต้องแสดงแค่ 1000 ตอนนี้มันแสดงเป็น 2000 https://app.clickup.com/t/86eub6dgd */}
                      {columnVisibility?.metering_allo && (
                        <td className={`px-2 py-1  ${

                          // // https://app.clickup.com/t/9018502823/86ev29x08
                          (
                            ((row?.data?.length > 0 && genManoStatus(row?.data)) || [])?.filter((f:any) => f?.shipper_allocation_review !== null)?.length === 0
                            // === 
                            // ((row?.data?.length > 0 && genManoStatus(row?.data)) || [])?.length
                          )
                          ? "text-[#464255]"
                          : (formatNumberFourDecimal(row?.shipper_allocation_review) !== formatNumberFourDecimal(row?.metering_value) ? 'text-[#ED1B24]' : 'text-[#06522E]')
                          } text-right`}>

                          {/*
                          // https://app.clickup.com/t/86ey6nyag 
                          */}

                            
                          <div className="font-bold">{
                          // ((row?.data?.length > 0 && genManoStatus(row?.data)) || [])?.filter((f:any) => f?.shipper_allocation_review !== null)?.length === 0 ? "" :
                          (row?.metering_value !== null && row?.metering_value !== undefined ? formatNumberFourDecimal(row?.metering_value) : '')
                          }</div>
                        </td>
                      )}

                      {columnVisibility?.review && <td className="px-2 py-1 text-[#464255]" />}

                      {columnVisibility?.comment && <td className="px-2 py-1 text-[#464255]" />}

                      {columnVisibility?.action && <td className="px-2 py-1 text-[#464255]" />}
                    </tr>
                    {/* item?.allocation_management_shipper_review?.[0]?.shipper_allocation_review */}
                    {/* {
                      ((toggleData?.find((item: any) => item?.id == row?.id)?.toggle == true && row?.data?.length > 0 && genManoStatus(row?.data)) || [])?.filter((f:any) => f?.item?.allocation_management_shipper_review?.[0]?.shipper_allocation_review !== null)?.length
                    } */}

                    {/* EXPAND */}
                    {toggleData?.find((item: any) => item?.id == row?.id)?.toggle == true && row?.data?.length > 0 && genManoStatus(row?.data)?.map((item: any, key: any) => {
                        let thisCheckItem: any = checkedData?.find((item: any) => item?.id == row?.id)
                        return (
                          <tr key={'sub-' + key + row?.id} className={`${table_row_style}`}>
                            {columnVisibility?.total && (
                              <td className="px-2 py-1 text-[#464255]">
                                <div className="flex gap-2 justify-center items-center">
                                  <input
                                    type="checkbox"
                                    onChange={(e) => {
                                      const checked = e.target.checked
                                      const parentId = row?.id
                                      const childId = item?.id

                                      let parentShouldBeChecked = false

                                      setcheckedData((previous: any[] = []) =>
                                        previous.map((parent: any) => {
                                          if (parent?.id !== parentId) {
                                            return parent
                                          }

                                          const updatedChildren = (
                                            parent?.data ?? []
                                          ).map((child: any) =>
                                            child?.id === childId
                                              ? {
                                                  ...child,
                                                  checked
                                                }
                                              : child
                                          )

                                          const selectableChildren =
                                            updatedChildren.filter((child: any) =>
                                              SELECTABLE_STATUS.includes(
                                                Number(child?.allocation_status?.id)
                                              )
                                            )

                                          parentShouldBeChecked =
                                            selectableChildren.length > 0 &&
                                            selectableChildren.every(
                                              (child: any) =>
                                                child?.checked === true
                                            )

                                          return {
                                            ...parent,
                                            checked: parentShouldBeChecked,
                                            data: updatedChildren
                                          }
                                        })
                                      )

                                      setselectedItem((previous: any[] = []) => {
                                        let next = previous.filter(
                                          (selected: any) =>
                                            !(
                                              selected?.id === childId &&
                                              selected?.parent === true
                                            )
                                        )

                                        if (checked) {
                                          next.push({
                                            id: childId,
                                            parent: true
                                          })
                                        }

                                        /*
                                        * Parent จะอยู่ใน selectedItem
                                        * เมื่อมีลูกถูกเลือกอย่างน้อยหนึ่งตัว
                                        */
                                        const currentParent =
                                          checkedData?.find(
                                            (parent: any) =>
                                              parent?.id === parentId
                                          )

                                        const hasAnotherCheckedChild =
                                          (currentParent?.data ?? []).some(
                                            (child: any) =>
                                              child?.id !== childId &&
                                              child?.checked === true &&
                                              SELECTABLE_STATUS.includes(
                                                Number(
                                                  child?.allocation_status?.id
                                                )
                                              )
                                          )

                                        const hasSelectedChild =
                                          checked || hasAnotherCheckedChild

                                        next = next.filter(
                                          (selected: any) =>
                                            !(
                                              selected?.id === parentId &&
                                              selected?.parent !== true
                                            )
                                        )

                                        if (hasSelectedChild) {
                                          next.push({
                                            id: parentId
                                          })
                                        }

                                        return next
                                      })

                                      settk((previous) => !previous)
                                    }}
                                    // onChange={(e) => {
                                    //   let itemChange: any = thisCheckItem?.data?.find((f: any) => f?.id == item?.id)
                                    //   itemChange.checked = e?.target?.checked
                                    //   settk(!tk)

                                    //   // 2 = shipper review
                                    //   // 3 = accepted
                                    //   // 4 = allowcated
                                    //   // 5 = rejected

                                    //   // let countData: any = thisCheckItem?.data?.filter((f: any) => f?.allocation_status?.id == 2)?.length;
                                    //   let countData: any = thisCheckItem?.data?.filter((f: any) => f?.allocation_status?.id == 2 || f?.allocation_status?.id == 3 || f?.allocation_status?.id == 5)?.length
                                    //   let countChecked: any = 0

                                    //   if (e?.target?.checked == true) {
                                    //     let itemPush: any = {id: itemChange?.id, parent: true}
                                    //     setselectedItem((pre: any) => [...pre, itemPush])

                                    //     let checkParent: any = selectedItem?.find((item: any) => item?.id == thisCheckItem?.id)
                                    //     if (!checkParent) {
                                    //       let itempushParent: any = {id: thisCheckItem?.id}
                                    //       setselectedItem((pre: any) => [...pre, itempushParent])
                                    //     }
                                    //   } else if (e?.target?.checked == false) {
                                    //     let newItem: any = selectedItem
                                    //     let findIDX: any = selectedItem?.findIndex((item: any) => item?.id == itemChange?.id && item?.parent == true)

                                    //     if (findIDX !== -1 || findIDX) {
                                    //       newItem?.splice(findIDX, 1)
                                    //       setselectedItem((pre: any) => [...newItem])
                                    //     }
                                    //   }

                                    //   for (let index = 0; index < thisCheckItem?.data?.length; index++) {
                                    //     if (thisCheckItem?.checked == true) {
                                    //       // if (thisCheckItem?.data[index]?.allocation_status?.id == 2 && thisCheckItem?.data[index]?.checked == false) {
                                    //       if ((thisCheckItem?.data[index]?.allocation_status?.id == 2 || thisCheckItem?.data[index]?.allocation_status?.id == 3 || thisCheckItem?.data[index]?.allocation_status?.id == 5) && thisCheckItem?.data[index]?.checked == false) {
                                    //         countChecked = countChecked + 1
                                    //       }
                                    //     } else if (thisCheckItem?.checked == false) {
                                    //       // if (thisCheckItem?.data[index]?.allocation_status?.id == 2 && thisCheckItem?.data[index]?.checked == true) {
                                    //       if ((thisCheckItem?.data[index]?.allocation_status?.id == 2 || thisCheckItem?.data[index]?.allocation_status?.id == 3 || thisCheckItem?.data[index]?.allocation_status?.id == 5) && thisCheckItem?.data[index]?.checked == true) {
                                    //         countChecked = countChecked + 1
                                    //       }
                                    //     }
                                    //   }

                                    //   if (thisCheckItem?.checked == true) {
                                    //     thisCheckItem.checked = !thisCheckItem?.checked
                                    //     let findIDX_MAIN: any = selectedItem?.findIndex((item: any) => item?.id == thisCheckItem?.id)

                                    //     if (findIDX_MAIN !== -1 || findIDX_MAIN) {
                                    //       let newItem: any = selectedItem
                                    //       newItem?.splice(findIDX_MAIN, 1)
                                    //       setselectedItem((pre: any) => [...newItem])
                                    //     }
                                    //   } else if (thisCheckItem?.checked == false) {
                                    //     if (countChecked == countData) {
                                    //       thisCheckItem.checked = !thisCheckItem?.checked
                                    //     }
                                    //   }

                                    //   settk(!tk)
                                    //   renderCheckedAll(e?.target?.checked, 'checkAll')
                                    // }}
                                    // 2 = shipper review
                                    // 3 = accepted
                                    // 4 = allowcated
                                    // 5 = rejected

                                    // disabled={item?.allocation_status?.id !== 2 ? true : false}
                                    disabled={item?.allocation_status?.id == 2 || item?.allocation_status?.id == 3 || item?.allocation_status?.id == 5 ? false : true} // status accept / reject สามารถเปลี่ยนได้ แต่ถ้าเป็น status allocated ไม่ให้เปลี่ยนแล้ว https://app.clickup.com/t/86ev29x10
                                    // disabled={false}
                                    // checked={thisCheckItem?.data?.find((f: any) => f?.id == item?.id)?.checked}
                                    checked={
                                      checkedData
                                        ?.find(
                                          (parent: any) =>
                                            parent?.id === row?.id
                                        )
                                        ?.data?.find(
                                          (child: any) =>
                                            child?.id === item?.id
                                        )
                                        ?.checked === true
                                    }
                                    className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1] disabled:opacity-100 disabled:cursor-not-allowed "
                                  />
                                </div>
                              </td>
                            )}

                            {columnVisibility?.status && (
                              <td className="px-2 py-1 text-[#464255]">
                                <div className="flex items-center justify-center">
                                  <div className="w-[160px] p-1 text-center rounded-[50px]" style={{background: item?.allocation_status ? item?.allocation_status?.color : '#FFF1CE'}}>
                                    {item?.allocation_status && item?.allocation_status?.name}
                                  </div>
                                </div>
                              </td>
                            )}

                            {columnVisibility?.gas_day && (
                              <td className="px-2 py-1 text-[#464255]">
                                {/* <div>{item?.gas_day ? item?.gas_day : ''}</div> */}
                                <div>{item?.gas_day ? toDayjs(item?.gas_day, 'YYYY-MM-DD').format('DD/MM/YYYY') : ''}</div>
                              </td>
                            )}

                            {columnVisibility?.shipper && (
                              <td className="px-2 py-1 text-[#464255]">
                                {/* <div>{item?.shipper_name_text ? item?.shipper_name_text : null}</div> */}
                                <div>{item?.group ? item?.group?.name : null}</div>
                              </td>
                            )}

                            {columnVisibility?.contract && (
                              <td className="px-2 py-1 text-[#464255] text-center">
                                {/* <div>{item?.contract_code ? item?.contract_code?.contract_code : null}</div> */}
                                {/* <div>{item?.contract_code_text ? item?.contract_code_text : null}</div> */}
                                <div>{item?.contract ? item?.contract : null}</div>
                              </td>
                            )}

                            {columnVisibility?.nompoint && (
                              <td className="px-2 py-1 text-[#464255]">
                                {/* <div>{item?.evidenUse ? item?.evidenUse?.data.point : null}</div> */}
                                {/* <div>{item?.point_text ? item?.point_text : null}</div> */}
                                <div>{item?.point ? item?.point : null}</div>
                              </td>
                            )}

                            {columnVisibility?.entryexit && item?.entry_exit_obj ? (
                              <td className="px-2 py-1 text-[#464255]">
                                <div className="flex items-center justify-center">
                                  <div className="w-[120px] p-1 text-center rounded-[50px]" style={{background: item?.entry_exit_obj ? item?.entry_exit_obj?.color : '#FFF1CE'}}>
                                    {item?.entry_exit_obj && item?.entry_exit_obj?.name}
                                  </div>
                                </div>
                              </td>
                            ) : (
                              columnVisibility?.entryexit &&
                              !item?.entry_exit_obj && (
                                <td className="px-2 py-1 text-[#464255]">
                                  <div className="flex items-center justify-center">
                                    <div className="w-[120px] p-1 text-center rounded-[50px]">{``}</div>
                                  </div>
                                </td>
                              )
                            )}

                            {columnVisibility?.nominatedval && (
                              <td className="px-2 py-1 text-[#464255]">
                                {/* <div className="text-right">{item?.nominationValue !== null && item?.nominationValue !== undefined ? formatNumberFourDecimal(item?.nominationValue) : ''}</div> */}
                                {/* <div className="text-right">{item?.nominationValue !== null && item?.nominationValue !== undefined ? formatNumberFourDecimal(item?.nominationValue) : ''}</div> */}
                                {/* <div className="text-right">{item?.nominationValue !== null && item?.nominationValue !== undefined ? formatNumberFourDecimal(Number(String(item?.nominationValue).replace(/,/g, '').trim())) : ''}</div> */}
                                <div className="text-right">{formatNumberFourDecimal(Number(String(item?.nominationValue || 0).replace(/,/g, '').trim()))}</div>
                              </td>
                            )}

                            {columnVisibility?.system_allo && (
                              <td className="px-2 py-1 text-[#464255]">
                                <div className="text-right">{item?.systemAllocation !== null && item?.systemAllocation !== undefined ? formatNumberFourDecimal(item?.systemAllocation) : ''}</div>
                              </td>
                            )}

                            {columnVisibility?.intraday_allo && (
                              <td className="px-2 py-1 text-[#464255]">
                                <div className="text-right">{item?.intradaySystem !== null && item?.intradaySystem !== undefined ? formatNumberFourDecimal(item?.intradaySystem) : ''}</div>
                              </td>
                            )}

                            {columnVisibility?.previous_allo && (
                              <td className="px-2 py-1 text-[#464255]">
                                <div className="text-right">{
                                 (((row?.data?.length > 0 && genManoStatus(row?.data)) || [])?.filter((f:any) => f?.shipper_allocation_review !== null)?.length === 0)
                                 ? "" : //https://app.clickup.com/t/9018502823/86ev29x2b
                                (item?.previousAllocationTPAforReview !== null && item?.previousAllocationTPAforReview !== undefined ? formatNumberFourDecimal(item?.previousAllocationTPAforReview) : '')
                                }</div>
                              </td>
                            )}

                            {columnVisibility?.shipper_allo && (
                              <td className="px-2 py-1 text-[#464255]">
                                {/* <div className="text-right">{item?.shipperAllocationReview ? formatNumberFourDecimal(item?.shipperAllocationReview) : ''}</div> */}
                                <div className="text-right">
                                  {
                                  (item?.allocation_management_shipper_review !== null && item?.allocation_management_shipper_review !== undefined && item?.allocation_management_shipper_review?.length > 0 ? formatNumberFourDecimal(item?.allocation_management_shipper_review?.[0]?.shipper_allocation_review) : '')
                                  }
                                </div>
                              </td>
                            )}

                            {/* List : Column Metering Value จะต้องขึ้นเฉพาะที่ Row เขียว ความเป็นจริงจะไม่สามารถขึ้นตามรายสัญญาได้ มันต้องขึ้นตามราย Nom Point (ตอนนี้ค่ามันเบิ้ล) เช่น ถ้าค่า Meter มา 1000 มันต้องแสดงแค่ 1000 ตอนนี้มันแสดงเป็น 2000 https://app.clickup.com/t/86eub6dgd */}
                            {columnVisibility?.metering_allo && (
                              <td className="px-2 py-1 text-[#464255]">
                                <div className="text-right">{item?.meteringValue ? formatNumberFourDecimal(item?.meteringValue) : ''}</div>
                                {/* <div className="text-right"> </div> */}
                              </td>
                            )}

                            {columnVisibility?.review && (
                              <td className="px-2 py-1 text-[#464255]">
                                <div>{item?.review_code ? item?.review_code : null}</div>
                              </td>
                            )}

                            {columnVisibility?.comment && (
                              <td className="px-2 py-1 text-[#464255] text-center">
                                <div className="inline-flex items-center justify-center relative">
                                  {/* <button
                                                                    type="button"
                                                                    className="flex items-center justify-center px-[2px] py-[2px] bg-white rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                                                                    // onClick={() => openReasonModal()}
                                                                    onClick={() => openReasonModal(item?.id, item?.allocation_management_comment, item)}
                                                                >
                                                                    <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                                                                </button> */}

                                  <button type="button" className={iconButtonClass} onClick={() => openReasonModal(item?.id, item?.allocation_management_comment, item)}>
                                    <ChatBubbleOutlineOutlinedIcon fontSize="inherit" className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]" sx={{color: 'currentColor', fontSize: 18}} />
                                  </button>

                                  <span className="px-2 text-[#464255]">{item?.allocation_management_comment ? item?.allocation_management_comment?.length : null}</span>
                                </div>
                                {/* <div>{item?.comment ? item?.comment?.length : null}</div> */}
                              </td>
                            )}

                            {columnVisibility?.action && (
                              <td className="px-2 py-1">
                                {/* <div className="relative inline-block text-left "> */}
                                <div className="relative inline-flex justify-center items-center w-full">
                                  <BtnActionTable togglePopover={togglePopover} row_id={item?.id} />
                                  {openPopoverId === item?.id && (
                                    <div ref={popoverRef} className="absolute left-[-9rem] top-[-10px] mt-2 w-36 bg-white border border-gray-300 rounded-lg shadow-lg z-0">
                                      <ul className="py-2">
                                        {
                                          <li
                                            className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer"
                                            onClick={() => {
                                              toggleMenu('history', item?.id)
                                            }}
                                          >
                                            <RestoreOutlinedIcon sx={{fontSize: 20, marginRight: 2, color: '#58585A'}} /> {`History`}
                                          </li>
                                        }
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        )
                      })}
                  </>
                )
              })}
          </tbody>
        </table>
      ) : (
        <TableSkeleton />
      )}
    </div>
  )
}

export default TableAlloManage
