import SearchInput from '@/components/other/searchInput'
import ArrowBackIos from '@mui/icons-material/ArrowBackIosOutlined'
import {useEffect, useState} from 'react'
import {Tune} from '@mui/icons-material'
import TableView from './tableView'
import PaginationComponent from '@/components/other/globalPagination'
import ColumnVisibilityPopover from '@/components/other/popOverShowHideCol'
import DetailPage from '../detailPage/detailPage'
import {addTotalPerRow, exportToExcel, formatNumberFourDecimal, formatNumberFourDecimalNoComma} from '@/utils/generalFormatter'
import {useFetchMasters} from '@/hook/fetchMaster'
import {fetchAreaMaster} from '@/utils/store/slices/areaMasterSlice'
import {useAppDispatch} from '@/utils/store/store'
import dayjs from 'dayjs'
import BtnGeneral from '@/components/other/btnGeneral'

const ViewPage: React.FC<any> = ({userPermission, tableData, setViewOpen, tabIndex, subTabIndex, subTabIndexview}) => {
  const [sortedData, setSortedData] = useState<any>([])
  const [sumtableData, setsumtableData] = useState<any>([])

  // nominatedValueMMBTUD
  // dataRow
  // console.log('# VP tableData : ', tableData);

  useEffect(() => {
    const dataRowMod = (tableData?.dataRow ?? []).filter((itemx: any) => itemx?.gas_day == tableData?.gas_day_text)

    if (tableData && dataRowMod?.length > 0) {
      tableData.dataRow = dataRowMod
    }
    setsumtableData(addTotalPerRow(tableData?.dataRow))
    setSortedData(tableData)
    setFilteredDataTable(tableData)
  }, [tableData])

  // ############### REDUX DATA ###############
  const {areaMaster, entryExitMaster} = useFetchMasters()
  const [forceRefetch, setForceRefetch] = useState(true)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (forceRefetch || !areaMaster?.data) {
      dispatch(fetchAreaMaster())
    }

    // Reset forceRefetch after fetching
    if (forceRefetch) {
      setForceRefetch(false) // Reset the flag after triggering the fetch
    }
  }, [dispatch, forceRefetch, areaMaster, entryExitMaster]) // Watch for forceRefetch changes

  // ############### COLUMN SHOW/HIDE ###############
  const initialColumns: any = [
    {key: 'gas_day', label: 'Gas Day', visible: true},
    {key: 'area', label: 'Area', visible: true},
    {key: 'capacity_right', label: 'Capacity Right (MMBTU/D)', visible: true},
    {key: 'nominated_value', label: 'Nominated Value (MMBTU/D)', visible: true},
    {key: 'overusage', label: 'Overusage (MMBTU/D)', visible: true},
    {key: 'total', label: 'Total', visible: true},
    {key: 'action', label: 'Detail', visible: true}
  ]
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
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

  // ############### LIKE SEARCH ###############
  const [filteredDataTable, setFilteredDataTable] = useState<any>([])

  // เช็กว่าเป็นจำนวนเต็มหรือไม่
  const isIntegerLike = (v: unknown) => v !== null && v !== undefined && /^\d+$/.test(v.toString().trim())

  // เติม .0000 ถ้าเป็นจำนวนเต็ม
  const normalizeWithFourDecimal = (v: unknown): string => {
    if (v == null) return ''
    let str = v.toString().trim()
    if (isIntegerLike(str)) str += '.0000'
    return str.replace(/\s+/g, '').toLowerCase()
  }

  /** คืน true ถ้า val (ไม่ใช่ boolean) มี query อยู่ข้างใน */
  // ทำฟังก์ชั่นนี้เพราะ ไม่รู้ทำไม item?.capacityRightMMBTUD, item?.nominatedValueMMBTUD, item?.overusageMMBTUD บางทีมันเป็น boolean มา
  const matchesQuery = (val: unknown, queryLower: string) => {
    if (val == null || typeof val === 'boolean') return false // <‑‑ ข้าม boolean
    return val.toString().replace(/\s+/g, '').toLowerCase().includes(queryLower)
  }

  const handleSearch = (query: string) => {
    const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim()
    const dayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][subTabIndex]

    const filteredRows = sumtableData?.filter((item: any) => {
      const dayData = item?.weeklyDay?.[dayKey]

      return (
        item?.gas_day?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
        item?.area_text?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
        normalizeWithFourDecimal(dayData?.capacityRightMMBTUD).includes(queryLower) ||
        normalizeWithFourDecimal(dayData?.nominatedValueMMBTUD).includes(queryLower) ||
        normalizeWithFourDecimal(dayData?.overusageMMBTUD).includes(queryLower) ||
        (item?.capacityRightMMBTUD?.toString() !== 'false' && item?.capacityRightMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
        (item?.nominatedValueMMBTUD?.toString() !== 'false' && item?.nominatedValueMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
        (item?.overusageMMBTUD?.toString() !== 'false' && item?.overusageMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
        formatNumberFourDecimal(item?.capacityRightMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
        formatNumberFourDecimal(item?.nominatedValueMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
        formatNumberFourDecimal(item?.overusageMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
        item?.weeklyDay?.[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][subTabIndex]]?.capacityRightMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
        item?.weeklyDay?.[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][subTabIndex]]?.nominatedValueMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
        item?.weeklyDay?.[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][subTabIndex]]?.overusageMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
        formatNumberFourDecimal(item?.weeklyDay?.[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][subTabIndex]]?.capacityRightMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
        formatNumberFourDecimal(item?.weeklyDay?.[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][subTabIndex]]?.nominatedValueMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
        formatNumberFourDecimal(item?.weeklyDay?.[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][subTabIndex]]?.overusageMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
        formatNumberFourDecimalNoComma(item?.weeklyDay?.[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][subTabIndex]]?.capacityRightMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
        formatNumberFourDecimalNoComma(item?.weeklyDay?.[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][subTabIndex]]?.nominatedValueMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
        formatNumberFourDecimalNoComma(item?.weeklyDay?.[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][subTabIndex]]?.overusageMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
        item?.weeklyDay?.[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][subTabIndexview]]?.capacityRightMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
        item?.weeklyDay?.[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][subTabIndexview]]?.nominatedValueMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
        item?.weeklyDay?.[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][subTabIndexview]]?.overusageMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
        formatNumberFourDecimal(item?.weeklyDay?.[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][subTabIndexview]]?.capacityRightMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
        formatNumberFourDecimal(item?.weeklyDay?.[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][subTabIndexview]]?.nominatedValueMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
        formatNumberFourDecimal(item?.weeklyDay?.[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][subTabIndexview]]?.overusageMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
        formatNumberFourDecimalNoComma(item?.weeklyDay?.[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][subTabIndexview]]?.capacityRightMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
        formatNumberFourDecimalNoComma(item?.weeklyDay?.[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][subTabIndexview]]?.nominatedValueMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
        formatNumberFourDecimalNoComma(item?.weeklyDay?.[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][subTabIndexview]]?.overusageMMBTUD)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
        matchesQuery(item.capacityRightMMBTUD, queryLower) ||
        matchesQuery(item.nominatedValueMMBTUD, queryLower) ||
        matchesQuery(item.overusageMMBTUD, queryLower)
      )
    })

    const filtered = {
      ...tableData,
      dataRow: filteredRows
    }

    setFilteredDataTable(filtered)
  }

  // ############# OPEN DETAIL #############
  const [detailOpen, setDetailOpen] = useState(false)
  const [dataDetail, setDataDetail] = useState<any>([])
  const [gasdayFilter, setGasdayFilter] = useState<any>('')

  const openDetailForm = async (data: any) => {
    setDataDetail(data)

    setDetailOpen(true)
  }

  // ############### PAGINATION ###############
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [paginatedData, setPaginatedData] = useState<any[]>([])
  const [dataSorting, setdataSorting] = useState<any[]>([])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setItemsPerPage(itemsPerPage)
    setCurrentPage(1)
  }

  useEffect(() => {
    if (filteredDataTable) {
      const dataList = filteredDataTable?.dataRow
      setPaginatedData(dataList?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
      setdataSorting(dataList)
    }
  }, [filteredDataTable, currentPage, itemsPerPage])

  useEffect(() => {
    const find_gas_day =
      tabIndex === 2 && sortedData?.gas_day_text && subTabIndex < 7
        ? dayjs(sortedData?.gas_day_text, 'DD/MM/YYYY').add(subTabIndex, 'day').format('DD/MM/YYYY')
        : tabIndex < 2 || subTabIndex < 7
          ? sortedData?.gas_day_text
          : dayjs(sortedData?.gas_day_text, 'DD/MM/YYYY').add(subTabIndexview, 'day').format('DD/MM/YYYY')
    setGasdayFilter(find_gas_day)
  }, [sortedData])

  return (
    <div className="space-y-2">
      {!detailOpen && (
        <>
          <div className="text-[#464255] px-4 text-[14px] font-bold pb-4">
            <div
              className="cursor-pointer"
              onClick={() => {
                setViewOpen(false)
              }}
            >
              <ArrowBackIos style={{fontSize: '14px'}} /> {` Back`}
            </div>
          </div>

          <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
            <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
              <div className="p-1 w-[60%]">
                <div className="grid grid-cols-[170px_150px] text-[#58585A]">
                  <p className="!text-[14px] font-semibold">{`Gas Day`}</p>
                  <p className="!text-[14px] font-semibold">{`Shipper Name`}</p>
                </div>

                <div className="grid grid-cols-[170px_150px] !text-[10px] font-light text-[#58585A]">
                  <p>
                    {/* ถ้าเลือก tab weekly มา การแสดงผลวัน gas_day ขึ้นอยู่กับตอนที่กดเลือก tab ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] */}
                    {tabIndex === 2 && sortedData?.gas_day_text && subTabIndex < 7
                      ? dayjs(sortedData?.gas_day_text, 'DD/MM/YYYY').add(subTabIndex, 'day').format('DD/MM/YYYY')
                      : tabIndex < 2 || subTabIndex < 7
                        ? sortedData?.gas_day_text
                        : dayjs(sortedData?.gas_day_text, 'DD/MM/YYYY').add(subTabIndexview, 'day').format('DD/MM/YYYY')}
                  </p>

                  <p>{sortedData?.shipper_name || ''}</p>
                </div>
              </div>
            </aside>

            <aside className="mt-auto ml-1 w-full sm:w-auto">
              <div className="flex flex-nowrap gap-2 justify-end">{/* BtnGeneral */}</div>
            </aside>
          </div>

          {/* TABLE */}
          <div className="border-[#DFE4EA] border-[1px] p-4  rounded-xl shadow-sm">
            <div className="text-sm flex flex-wrap items-center justify-between pb-4">
              <div className="flex items-center space-x-4">
                <div onClick={handleTogglePopover}>
                  <Tune className="cursor-pointer rounded-lg" style={{fontSize: '18px', color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)'}} />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-end">
                <SearchInput onSearch={handleSearch} />
                <BtnGeneral
                  bgcolor={'#24AB6A'}
                  modeIcon={'export'}
                  textRender={'Export'}
                  generalFunc={() =>
                    exportToExcel(
                      filteredDataTable?.dataRow, // เอาแค่ที่ filter มา export
                      'shipper-nom-report-view',
                      columnVisibility,
                      {
                        tabIndex: tabIndex,
                        subTabIndex: subTabIndex < 7 ? subTabIndex : subTabIndexview,
                        tableData: tableData
                      }
                    )
                  }
                  can_export={userPermission ? userPermission?.f_export : false}
                />
              </div>
            </div>

            <TableView
              tableData={paginatedData}
              columnVisibility={columnVisibility}
              userPermission={userPermission}
              isLoading={true}
              openDetailForm={openDetailForm}
              tabIndex={tabIndex}
              subTabIndex={subTabIndex}
              subTabIndexview={subTabIndexview}
              gasDayFilter={gasdayFilter}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              originalData={filteredDataTable}
              dataSorting={dataSorting}
            />
          </div>

          <PaginationComponent
            totalItems={filteredDataTable?.dataRow?.length}
            // totalItems={paginatedData?.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </>
      )}

      {/* DETAIL PAGE */}
      {detailOpen && <DetailPage userPermission={userPermission} tableData={dataDetail} setDetailOpen={setDetailOpen} areaMaster={areaMaster} entryExitMaster={entryExitMaster} tabIndex={tabIndex} subTabIndex={subTabIndex} subTabIndexview={subTabIndexview} />}

      <ColumnVisibilityPopover open={open} anchorEl={anchorEl} setAnchorEl={setAnchorEl} columnVisibility={columnVisibility} handleColumnToggle={handleColumnToggle} initialColumns={initialColumns} />
    </div>
  )
}

export default ViewPage
